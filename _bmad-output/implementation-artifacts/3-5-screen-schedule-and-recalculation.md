---
baseline_commit: 8674a8b
---

# Story 3.5: 화면별 일정 확인·수정하고, 전체 일정이 바뀌면 재계산 받기

Status: review

## Story

As a 일정까지 관리하고 싶은 사용자,
I want 각 화면의 제작 일정이 전체 프로젝트 일정에 맞춰 자동으로 나뉘고, 필요하면 개별로 조정하기를,
so that 언제 어떤 화면을 만들지 계획을 세울 수 있다.

## Acceptance Criteria

1. **Given** 전체 일정이 정해진 프로젝트에서 화면이 생성됨 **When** 화면 리스트를 보면 **Then** 각 화면에 시작일·종료일이 균등하게 배분되어 있다.
2. **Given** 특정 화면의 일정을 손으로 수정함 **When** 저장하면 **Then** 이 화면의 일정은 "잠김" 상태가 되어, 이후 전체 일정을 다시 계산해도 이 화면은 건드리지 않는다(NFR-2).
3. **Given** 프로젝트의 전체 일정을 더 짧게 수정함 **When** 저장을 시도하면 **Then** "수동으로 조정한 화면은 유지되고, 자동배분된 화면만 새로 계산됩니다"라는 확인을 거친 뒤 적용된다. **And** 손으로 고정해둔 화면의 일정이 새로운 전체 일정 범위를 벗어나게 되면, 자동으로 자르지 않고 "범위 이탈" 상태로 표시해 목록 위쪽에 모아 보여준다.
4. **Given** 화면 두 개의 일정이 앞뒤가 뒤바뀜(먼저 끝나야 할 화면이 나중에 끝남) **When** 화면 리스트를 보면 **Then** "일정 역전" 경고가 해당 화면들에 표시된다.

## Tasks / Subtasks

- [x] Task 1: `domain/schedule` — 순수 일정 로직 (AC: #1, #3, #4)
  - [x] `domain/schedule/distribute-schedule.ts` — `distributeSchedule(overallStart: string, overallEnd: string, count: number): { scheduleStart: string; scheduleEnd: string }[]`. 전체 기간(포함 일수)을 `count`개로 균등 분할, 나머지 일수는 앞쪽 슬롯부터 하루씩 배분(마지막 슬롯의 `scheduleEnd`는 항상 `overallEnd`와 일치). `count === 0`이면 빈 배열
  - [x] `domain/schedule/detect-out-of-range-screens.ts` — `detectOutOfRangeScreens(overallStart, overallEnd, screens: Pick<Screen,"id"|"scheduleStart"|"scheduleEnd"|"scheduleLocked">[]): Set<string>`. `scheduleLocked`인 화면만 대상 — 그 화면의 `scheduleStart`/`scheduleEnd`가 새 전체 일정 범위를 벗어나면 id를 담는다(AD-6 — DB에 상태를 저장하지 않고 조회 시점에 매번 계산하는 순수 파생 함수)
  - [x] `domain/schedule/detect-schedule-reversals.ts` — `detectScheduleReversals(screens: Pick<Screen,"id"|"scheduleStart"|"scheduleEnd">[]): Set<string>`. `scheduleStart` 기준 정렬 후, "이전까지 본 화면 중 가장 늦게 끝나는 화면"보다 더 일찍 끝나는 화면이 나오면 두 화면 모두 역전으로 표시(AD-6 파생 계산)

- [x] Task 2: 화면 생성 시 균등 배분 (AC: #1)
  - [x] `domain/ports/screen-repository.ts`의 `CreateScreenInput`에 `scheduleStart?: string`, `scheduleEnd?: string` 추가
  - [x] `adapters/repository/drizzle/screen-repository.ts`의 `createMany`가 이 두 필드를 함께 저장하도록 수정
  - [x] `application/generate-screens.ts` 수정 — 모든 화면 입력을 조립한 뒤(기존 로직 그대로) `distributeSchedule(project.overallStart, project.overallEnd, inputs.length)`로 전체 화면 수만큼 균등 분할한 일정을 순서대로 배정해 `createMany` 호출 시 함께 전달

- [x] Task 3: 화면별 일정 수정 + 잠금 (AC: #2)
  - [x] `domain/ports/screen-repository.ts`의 `ScreenFieldsPatch`에 `scheduleStart`/`scheduleEnd`/`scheduleLocked` 추가
  - [x] `application/update-screen-fields.ts` 확장 — `UpdateScreenFieldsRequest`에 `scheduleStart?: string; scheduleEnd?: string` 추가. 값이 실제로 바뀌면 `scheduleLocked: true`로 전환(다른 필드처럼 `*_source` enum이 아니라 **boolean 플래그**로 재계산 보호 여부를 결정 — AD-5가 명시한 예외). 시작일이 종료일보다 늦으면 `{ok:false, reason:"invalid-range"}` 거부
  - [x] `app/(app)/dashboard/[projectId]/screens/update-schedule-action.ts` 신규 — `update-func-def-action.ts`와 동일한 패턴
  - [x] `app/(app)/dashboard/[projectId]/screens/screen-detail-panel.tsx` 수정 — "일정" 섹션 추가(시작일/종료일 `<input type="date">` + 저장 버튼 + "잠김"/"자동배분" 배지). 저장하면 잠김 상태로 바뀐다는 안내 문구 포함

- [x] Task 4: 전체 일정 변경 시 재계산 (AC: #3)
  - [x] `domain/ports/screen-repository.ts`에 `updateSchedules(updates: { id: string; scheduleStart: string; scheduleEnd: string }[]): Promise<void>` 추가(neon-http 드라이버는 트랜잭션 미지원이라 순차 UPDATE로 구현 — Dev Notes 참고)
  - [x] `application/recalculate-schedule.ts` 신규 — `recalculateSchedule(projectId, overallStart, overallEnd)`: `withProjectAuth` → 화면 목록 조회 → `scheduleLocked !== true`인 화면만 골라 `distributeSchedule()`로 새 일정 재배분 → `screenRepository.updateSchedules()` 한 번 호출(잠긴 화면은 손대지 않음 — AD-6/NFR-2)
  - [x] `app/(app)/dashboard/[projectId]/edit/actions.ts` 수정 — `updateProject()` 성공 후 `overallStart`/`overallEnd`가 실제로 바뀌었으면 `recalculateSchedule()` 호출
  - [x] `app/(app)/dashboard/[projectId]/edit/edit-project-form.tsx` 수정 — 화면이 1개 이상 있는 프로젝트에서 전체 시작일/종료일을 바꿔 저장하려 하면 `confirm("수동으로 조정한 화면은 유지되고, 자동배분된 화면만 새로 계산됩니다. 계속할까요?")` 확인(기존 `DeleteProjectButton`이 쓰는 네이티브 `confirm()` 패턴 재사용 — EXPERIENCE.md가 描사하는 커스텀 모달은 MVP 범위에서 단순화, Dev Notes에 근거 기록). `application/get-project-for-edit.ts`(또는 신규 서비스)가 화면 존재 여부를 함께 내려줘야 함

- [x] Task 5: 화면 리스트에 일정/경고 표시 (AC: #1, #3, #4)
  - [x] `app/(app)/dashboard/[projectId]/screens/page.tsx`·`screens-view.tsx` 수정 — "일정" 컬럼 추가(scheduleStart~scheduleEnd), `detectOutOfRangeScreens`/`detectScheduleReversals`를 프로젝트의 전체 화면 목록에 대해 한 번씩만 호출(N+1 방지, AD-6). 범위 이탈 화면은 목록 맨 위로 정렬해서 모아 보여주고(AC #3 "목록 위쪽에 모아 보여준다") "범위 이탈" warning 배지, 역전된 화면들은 "일정 역전" warning 배지(둘 다 뜰 수 있음 — 서로 다른 원인이므로 동시에 표시)

- [x] Task 6: 검증 (AC: #1, #2, #3, #4)
  - [x] 메뉴 1개로 화면 2~3개 생성 → 전체 일정 범위 안에서 균등하게 나뉘어 있는지 확인
  - [x] 화면 하나의 일정을 수동으로 수정 → "잠김" 배지 확인
  - [x] 프로젝트 설정에서 전체 일정을 짧게 수정 → 확인 다이얼로그 확인 → 저장 후 잠기지 않은 화면들만 새 범위로 재배분됐는지, 잠근 화면은 그대로인지 확인
  - [x] 잠근 화면의 일정이 새 범위를 벗어나도록 전체 일정을 더 줄여봄 → "범위 이탈" 배지 + 목록 상단 정렬 확인
  - [x] 두 화면의 일정을 손으로 엇갈리게 수정(먼저 시작한 화면이 나중에 끝나도록) → "일정 역전" 배지 확인
  - [x] `npm run build`, `npm run lint`, `npm run depcruise` 통과
  - [x] 검증에 사용한 테스트 데이터 정리

## Dev Notes

- **`schedule_locked`은 다른 필드의 `*_source`와 다른 메커니즘이다** — AD-5가 명시적으로 예외를 뒀다. pageId/pageName/funcDef/prompt는 `auto`/`manual` enum이지만 일정은 boolean 잠금 플래그로 재계산 보호 여부만 결정한다. 배지 텍스트는 다른 필드와 통일감을 위해 "자동배분"/"잠김"으로 표기(다른 필드의 "자동생성"/"수정됨"과 톤은 맞추되 문구는 일정에 맞게 조정).
- **범위 이탈/일정 역전은 AD-6 그대로 순수 파생 계산이다** — DB에 상태 컬럼을 두지 않고 화면 리스트 조회 시점마다 `domain/schedule`의 순수 함수로 계산한다. 화면별 개별 쿼리가 아니라 프로젝트 전체 화면 목록을 한 번에 조회한 뒤 그 배열에 대해 계산(N+1 방지).
- **전체 일정 재계산 확인은 네이티브 `confirm()`으로 단순화** — EXPERIENCE.md가 描사하는 커스텀 모달(Esc/포커스 복귀)이 이상적이지만, 이 코드베이스는 이미 `DeleteProjectButton`/메뉴 삭제에서 네이티브 `confirm()`을 관례로 써왔다(Epic 1/2). 이번 스토리도 같은 패턴을 재사용해 범위를 좁힌다 — Story 3.3의 페이지ID 선택기 단순화와 같은 결의 판단.
- **일정 슬롯 부족 시 배정 알고리즘은 미정(Architecture Spine Open Question)** — 화면 수가 전체 일정 일수보다 많은 극단적 경우의 정교한 처리는 이번 스토리 범위 밖. `distributeSchedule`은 단순 균등분할(나머지 일수는 앞쪽부터 하루씩)만 구현한다.
- **재계산은 잠긴 화면을 전혀 건드리지 않는다** — `recalculateSchedule`은 `scheduleLocked !== true`인 화면만 대상으로 골라 새로 분배하고, `updateSchedules()` 호출 시 잠긴 화면의 id는 아예 포함하지 않는다(NFR-2 — "수동 수정 데이터는 유실되지 않아야 한다").
- **테스트 프레임워크 없음** — `npm run build`+`lint`+`depcruise`+브라우저 실측으로 검증한다.

### References

- [Source: epics.md#Story 3.5, #FR-13, #NFR-2]
- [Source: ARCHITECTURE-SPINE.md#AD-5] — `schedule_locked` 플래그(다른 필드의 `*_source`와 다른 메커니즘)
- [Source: ARCHITECTURE-SPINE.md#AD-6] — 범위 이탈/일정 역전 파생 계산, N+1 방지
- [Source: ARCHITECTURE-SPINE.md#AD-9] — 낙관적 동시성(기존 `updateScreenFields` 패턴 재사용)
- [Source: ARCHITECTURE-SPINE.md#Deferred] — 일정 슬롯 부족 시 배정 알고리즘 미정
- [Source: EXPERIENCE.md] — 전체 일정 재계산 확인 다이얼로그(이번 스토리는 네이티브 confirm으로 단순화), "범위 이탈"/"일정 역전" 배지
- [Source: 3-2-edit-page-id-and-page-name.md] — 혼재 배너 파생 계산 패턴, `updateScreenFields` 확장 관례
- [Source: 1-4-create-project.md] — `overallStart`/`overallEnd` 필드, `updateProject` 흐름

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `db/client.ts`가 `drizzle-orm/neon-http`를 쓰는데 이 드라이버는 `db.transaction()`을 지원하지 않는다는 걸 구현 중 발견. `updateSchedules`를 트랜잭션 없이 순차 `UPDATE` 루프로 다시 작성해서 해결.
- `screen-detail-panel.tsx`의 잠금 안내 문구에 리터럴 큰따옴표(`"잠김"`)를 써서 ESLint `react/no-unescaped-entities`가 걸림 → `&ldquo;`/`&rdquo;`로 교체해 해결, `npm run lint` 재실행으로 확인.
- 브라우저 검증 중 "실행: IA 생성"을 같은 프로젝트에서 두 번째 메뉴 추가 후 다시 실행했더니 기존 메뉴의 화면까지 재생성을 시도해 `screen_project_page_id_idx` 유니크 제약 위반(500 에러)이 발생. `generate-screens.ts`가 매번 전체 메뉴에 대해 재생성하는 기존 동작(Story 3.1부터, `existingScreens: []` 하드코딩) 때문이며, 재실행 시 기존 화면을 보존하는 로직은 Story 3.6 범위. 이번 스토리의 결함이 아니므로 코드는 수정하지 않았고, 검증은 메뉴를 모두 추가한 뒤 "실행: IA 생성"을 한 번만 호출하는 방식으로 진행.

### Completion Notes List

- `domain/schedule`에 순수 함수 3개(균등분배/범위이탈 판정/일정역전 판정) 신설, 전부 DB·프레임워크 의존성 없음.
- 화면 생성 시 전체 일정 범위를 화면 수만큼 균등 분배해 저장(AC #1) — 브라우저에서 3화면 생성 시 2026-08-01~08-31이 08-01~08-11 / 08-12~08-21 / 08-22~08-31로 균등 분할됨을 확인.
- 화면 상세 패널에서 개별 일정 수정 시 `scheduleLocked=true`로 전환하고 "잠김" 배지 표시(AC #2) — 브라우저에서 확인.
- 프로젝트 전체 일정 변경 시 네이티브 `confirm()` 확인 후 잠기지 않은 화면만 재분배, 잠긴 화면은 그대로 유지(AC #3) — 브라우저에서 확인. 잠긴 화면의 일정이 새 범위를 벗어나면 "범위 이탈" 배지 + 목록 최상단 정렬도 확인.
- 화면 두 개의 일정이 겹쳐서 순서가 뒤집히면 두 화면 모두 "일정 역전" 배지가 뜨는 것을 확인(AC #4).
- `npm run build`/`npm run lint`/`npm run depcruise` 모두 통과.
- 검증에 사용한 테스트 계정(story35tester@example.com)과 프로젝트/메뉴/화면 데이터는 일회성 스크립트로 정리 완료.
- ANTHROPIC_API_KEY가 로컬에 없어 AI 프롬프트 기능은 이번에도 실사용 검증 대상이 아님(Story 3.4에서 이미 안내됨) — 이번 스토리와는 무관.

### File List

- `domain/schedule/distribute-schedule.ts` (신규)
- `domain/schedule/detect-out-of-range-screens.ts` (신규)
- `domain/schedule/detect-schedule-reversals.ts` (신규)
- `domain/ports/screen-repository.ts` (수정)
- `adapters/repository/drizzle/screen-repository.ts` (수정)
- `application/generate-screens.ts` (수정)
- `application/update-screen-fields.ts` (수정)
- `application/recalculate-schedule.ts` (신규)
- `app/(app)/dashboard/[projectId]/screens/update-schedule-action.ts` (신규)
- `app/(app)/dashboard/[projectId]/screens/screen-detail-panel.tsx` (수정)
- `app/(app)/dashboard/[projectId]/screens/screen-list-item.tsx` (수정)
- `app/(app)/dashboard/[projectId]/screens/screens-view.tsx` (수정)
- `app/(app)/dashboard/[projectId]/screens/page.tsx` (수정)
- `app/(app)/dashboard/[projectId]/edit/actions.ts` (수정)
- `app/(app)/dashboard/[projectId]/edit/page.tsx` (수정)
- `app/(app)/dashboard/[projectId]/edit/edit-project-form.tsx` (수정)
