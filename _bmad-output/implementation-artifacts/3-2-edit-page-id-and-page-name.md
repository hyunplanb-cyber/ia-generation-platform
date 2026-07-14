---
baseline_commit: d341530
---

# Story 3.2: 화면의 페이지ID·페이지명 확인하고 수정하기

Status: review

## Story

As a 생성된 화면을 검토하는 사용자,
I want 각 화면의 페이지ID와 페이지명을 표에서 보고 직접 고치기를,
so that 우리 프로젝트 상황에 맞게 이름을 다듬을 수 있다.

## Acceptance Criteria

1. **Given** 화면 리스트 **When** 화면을 조회하면 **Then** 페이지ID는 "{디바이스코드}{메뉴코드}{4자리 번호}"(예: PCMR1000) 형식으로, 페이지명은 자동 채워진 값 그대로 보인다.
2. **Given** 특정 화면의 페이지ID를 다른 값으로 수정함 **When** 저장하면 **Then** 같은 프로젝트 안에서 중복되지 않는 한 저장되고, 이 화면은 "자동생성"이 아닌 "수정됨" 상태로 바뀐다. 중복되면 저장이 거부되고 에러 메시지가 뜬다.
3. **Given** 프로젝트의 디바이스 대응 방식(PC/모바일 분리 ↔ 반응형 하나로)을 화면 생성 이후에 바꿈 **When** 설정을 변경하면 **Then** 이미 만들어진 화면의 페이지ID는 그대로 유지되고, 이후 새로 만들어지는 화면부터 새 방식이 적용되며, 화면 목록 상단에 "방식이 혼재되어 있어요" 경고 배너가 뜬다.

## Tasks / Subtasks

- [x] Task 1: `updateScreenFields` — AD-5/AD-9를 지키는 단일 화면 수정 커맨드 (AC: #2)
  - [x] `domain/ports/screen-repository.ts`에 추가:
    - `findById(id: string, projectId: string): Promise<Screen | null>` — `(id, project_id)` 단일 쿼리
    - `updateFields(id: string, projectId: string, patch: ScreenFieldsPatch, expectedUpdatedAt: Date): Promise<Screen | null>` — `UPDATE ... WHERE id=$1 AND project_id=$2 AND updated_at=$3 RETURNING *`. 매치되는 행이 없으면(대상 없음 또는 동시편집 충돌) `null` 반환 — 두 경우를 구분하는 건 Application Service의 책임(사전 `findById`로 이미 존재 확인을 했으므로, `updateFields`가 `null`이면 그건 충돌이다)
    - `ScreenFieldsPatch = Partial<Pick<Screen, "pageId" | "pageName" | "pageIdSource" | "pageNameSource">>`
  - [x] `adapters/repository/drizzle/screen-repository.ts`에 두 메서드 구현
  - [x] `application/update-screen-fields.ts` 신규 — `updateScreenFields(projectId, screenId, input: { pageId？: string; pageName?: string }, expectedUpdatedAt: Date)`:
    1. `withProjectAuth(projectId, ...)`
    2. `screenRepository.findById(screenId, projectId)` — 없으면 `{ ok: false, reason: "not-found" }`
    3. **AD-5 필드 단위 판정**: `input.pageId`가 존재하고 현재 값과 실제로 다를 때만 patch에 `pageId`+`pageIdSource: "manual"` 포함. `pageName`도 동일하게 독립 판정. 값이 같으면 그 필드는 patch에서 아예 빼고(`*_source`도 건드리지 않음) — "저장 버튼을 눌렀다"는 사실만으로 auto→manual 전환하지 않는다
    4. patch가 비어있으면(둘 다 안 바뀜) 조기 반환 — 불필요한 UPDATE 스킵
    5. `pageId`가 바뀌는 경우 trim 후 빈 문자열이면 거부(`{ ok: false, reason: "empty" }`)
    6. `screenRepository.updateFields(screenId, projectId, patch, expectedUpdatedAt)` 호출. DB 유니크 제약(`(project_id, page_id)`) 위반 시 Postgres 에러코드 `23505`를 캐치해 `{ ok: false, reason: "duplicate" }`로 변환
    7. 결과가 `null`이면(유니크 위반이 아닌데도) `{ ok: false, reason: "conflict" }`(AD-9 — 다른 곳에서 먼저 저장함)
    8. 성공하면 `{ ok: true, screen }`

- [x] Task 2: 화면 리스트 표 — 페이지ID/페이지명 인라인 수정 (AC: #1, #2)
  - [x] `app/(app)/dashboard/[projectId]/screens/update-screen-action.ts` 신규 — `'use server'`, `useActionState` 호환 시그니처(`(prevState, formData) => state`), `updateScreenFields` 호출, `revalidatePath`. 결과 state에 `values`(제출값) 포함해 실패 시 입력값 유지(`MenuListItem`의 React 19 폼 리셋 회피 패턴, `2-3-reorder-and-edit-menu.md` 참고)
  - [x] `app/(app)/dashboard/[projectId]/screens/screen-list-item.tsx` 신규(클라이언트 컴포넌트) — `MenuListItem`과 동일한 "조회 모드 ↔ 수정 모드" 토글 패턴. 조회 모드: 페이지ID 배지(`page-id-cell` 스타일) + 페이지명 + 상태 배지("자동생성"/"수정됨" — `pageIdSource === "manual" || pageNameSource === "manual"`이면 "수정됨", 색은 동일한 neutral, 텍스트만 다름 — DESIGN.md "중립 배지는 회색 계열만" 규칙). 수정 모드: 페이지ID/페이지명 입력 + hidden `updatedAt`(`screen.updatedAt.toISOString()`, AD-9 낙관적 동시성용) + 저장/취소. 에러 메시지: `duplicate` → "이미 사용 중인 페이지ID예요", `conflict` → "다른 곳에서 먼저 저장됐어요. 새로고침 후 다시 시도해주세요", `empty` → "페이지ID를 입력해주세요"
  - [x] `app/(app)/dashboard/[projectId]/screens/page.tsx` 수정 — 표 렌더링을 `ScreenListItem`으로 교체

- [x] Task 3: 디바이스 대응 방식 설정 + 혼재 경고 배너 (AC: #3)
  - [x] `domain/ports/project-repository.ts`의 `UpdateProjectInput`에 `deviceMode: DeviceMode` 추가
  - [x] `adapters/repository/drizzle/project-repository.ts`의 `update()`가 `deviceMode`도 SET하도록 수정
  - [x] `app/(app)/dashboard/[projectId]/edit/edit-project-form.tsx` 수정 — "디바이스 대응 방식" 라디오 2개(반응형 하나로 / PC·모바일 분리) 추가, `defaultValue={project.deviceMode}`
  - [x] `app/(app)/dashboard/[projectId]/edit/actions.ts` 수정 — `deviceMode` formData 읽어서 `updateProject`에 전달(값이 `"responsive"`/`"device-split"` 둘 중 하나가 아니면 방어적으로 거부)
  - [x] `domain/screen/detect-mixed-device-mode.ts` 신규 — `detectMixedDeviceMode(deviceMode: DeviceMode, screens: Screen[]): boolean`. 순수 함수, 규칙(AD-6 소급 미변경을 전제로 한 휴리스틱):
    - `deviceMode === "responsive"`인데 `screens`에 `deviceCode === "MO"`인 화면이 하나라도 있으면 `true`(과거 분리 모드였던 흔적)
    - `deviceMode === "device-split"`인데 `screens.length > 0`이고 `deviceCode === "MO"`인 화면이 하나도 없으면 `true`(과거 반응형 모드였던 흔적, 아직 재생성 안 함)
    - 그 외 `false`
  - [x] `application/list-screens.ts` 수정 — 반환 타입을 `{ project: Project; screens: Screen[] }`로 변경(같은 `withProjectAuth` 호출 안에서 프로젝트와 화면을 함께 반환해 auth 쿼리 중복 방지). 이 함수를 쓰는 곳은 `screens/page.tsx` 하나뿐이므로 시그니처 변경의 파급 범위는 그 파일 하나
  - [x] `app/(app)/dashboard/[projectId]/screens/page.tsx` 수정 — `detectMixedDeviceMode(project.deviceMode, screens)`가 `true`면 표 위에 경고 배너("방식이 혼재되어 있어요" — `warning`/`warning-soft` 토큰, DESIGN.md 시맨틱 경고색 규칙) 표시

- [x] Task 4: 검증 (AC: #1, #2, #3)
  - [x] Story 3.1에서 생성한 화면의 페이지ID/페이지명을 수정 → 저장 후 "수정됨" 배지로 바뀌는지 확인
  - [x] 이미 존재하는 다른 화면의 페이지ID로 수정 시도 → "이미 사용 중인 페이지ID예요" 에러 확인, 저장 안 됨 확인
  - [x] 페이지ID를 빈 값으로 저장 시도 → 거부 확인
  - [x] 값이 바뀌지 않은 채로(취소 없이) 그대로 저장 → `pageIdSource`/`pageNameSource`가 `auto`로 유지되는지 DB 또는 배지로 확인(둘 다 바뀌지 않으면 "자동생성" 배지 유지)
  - [x] 프로젝트 설정에서 디바이스 대응 방식을 "반응형"→"PC·모바일 분리"로 변경 → 화면 리스트 상단에 "방식이 혼재되어 있어요" 배너 확인(기존 화면은 전부 PC뿐이므로)
  - [x] 다시 "PC 모바일 분리" 상태에서 [실행: IA 생성]을 재실행하면(Story 3.6 이전이라 현재는 중복 생성됨 — 정상, 재실행 안전장치는 3.6 범위) MO 화면이 생기고 배너가 사라지는지 확인
  - [x] `npm run build`, `npm run lint`, `npm run depcruise` 통과
  - [x] 검증에 사용한 테스트 데이터 정리

## Dev Notes

- **`updateScreenFields`는 AD-5가 못박은 "유일한 화면 수정 커맨드"의 첫 구현체다** — Story 3.3(기능정의)·3.4(AI프롬프트)·3.5(일정)도 이 함수를 확장(파라미터 추가)해서 재사용해야 한다. 이번 스토리에서 pageId/pageName 전용 함수로 좁게 만들지 말고, `input`을 `Partial<...>` 형태로 열어둬 이후 필드가 늘어나도 시그니처가 안 깨지게 한다.
- **AD-9 낙관적 동시성은 이번이 첫 적용** — `updated_at` 비교를 `updateFields`의 WHERE 절에 직접 넣어 원자적으로 처리한다(읽고-비교-쓰기 사이의 race를 애플리케이션 레이어에서 재현하지 않는다).
- **AD-5 "필드 단위, 실제 변경 여부로 판정"** — 저장 버튼을 눌렀다는 사실이 아니라 값이 실제로 달라졌는지로 `*_source`를 전환한다. 이미 "수정됨"인 필드를 같은 값으로 다시 저장해도 여전히 "수정됨"(manual은 auto로 되돌아가지 않음 — 애초에 전환은 단방향).
- **디바이스 대응 방식 설정 UI는 이번 스토리에서 처음 생긴다** — 지금까지는 `create-project.ts`가 항상 `"responsive"`로 하드코딩했고 변경할 UI가 전혀 없었다. `epics.md` FR-9가 "디바이스 대응방식 설정 및 사후 변경"을 Epic 3 소관으로 명시했으므로 이번에 추가하는 게 범위 확장이 아니라 원래 계획된 위치다.
- **AD-6을 그대로 따른다** — 방식이 바뀌어도 기존 `screen.page_id`를 일괄 치환하지 않는다. `detectMixedDeviceMode`는 순수하게 표시용 파생 계산이며 DB에 아무 것도 쓰지 않는다.
- **배지 색은 자동생성/수정됨 모두 동일한 neutral 회색** — DESIGN.md가 "중립 배지는 사실 전달용, 회색 계열만"이라 못박았다. 텍스트만 다르게 한다(색으로 경고처럼 보이게 하지 않는다).
- **테스트 프레임워크 없음** — `npm run build`+`lint`+`depcruise`+브라우저 실측으로 검증한다.

### References

- [Source: epics.md#Story 3.2, #FR-9]
- [Source: ARCHITECTURE-SPINE.md#AD-2] — page_id 형식/유니크 스코프
- [Source: ARCHITECTURE-SPINE.md#AD-5] — `*_source` 필드 단위 판정, `updateScreenFields()` 단일 커맨드
- [Source: ARCHITECTURE-SPINE.md#AD-6] — device_mode 변경 시 기존 page_id 소급 미변경
- [Source: ARCHITECTURE-SPINE.md#AD-9] — 낙관적 동시성(`updated_at` 비교)
- [Source: DESIGN.md] — status-badge neutral 변형, page-id-cell 스타일, 시맨틱 경고색(warning)
- [Source: 2-3-reorder-and-edit-menu.md] — 인라인 편집 토글 패턴, React 19 폼 리셋 회피(`values` 반환 + `defaultValue`)
- [Source: 3-1-generate-screens-from-menus.md] — `screen` 테이블 컬럼, `withProjectAuth` 재사용

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- **버그 발견 및 수정**: AD-9 낙관적 동시성 첫 저장 시도가 항상 "다른 곳에서 먼저 저장됐어요" 충돌로 잘못 보고됨. 원인은 `screen.updated_at` 컬럼이 마이크로초 정밀도(Postgres 기본값)를 유지하는데, `defaultNow()`로 채워진 기존 행의 실제 값은 마이크로초 단위까지 있고, JS `Date`는 밀리초까지만 표현 가능해 클라이언트 왕복(`toISOString()` → `new Date()`) 후 `eq()` 비교가 항상 불일치했음. `db/schema.ts`의 `screen.updatedAt`/`createdAt`에 `{ precision: 3 }`(밀리초)을 명시해 컬럼 자체가 밀리초 정밀도로 저장되도록 고쳤다(`drizzle/0007_harsh_lake.sql`, live Neon DB에 적용 완료). 이 고정으로 이후 모든 화면 편집(Story 3.3~3.5)의 낙관적 동시성도 함께 정상화됨
- 브라우저 자동화로 신규 계정 가입 → 프로젝트 2개(단일/듀얼 메뉴) 생성 → 화면 생성 → 페이지명만 수정(자동생성→수정됨 배지 전환) → 빈 페이지ID 거부 → 중복 페이지ID 거부 → 유효한 페이지ID 변경 성공까지 확인
- 디바이스 대응 방식을 반응형→분리로 변경 후 화면 리스트 상단에 "방식이 혼재되어 있어요" 경고 배너 노출 확인(스크린샷으로 시각 검증)
- Story 3.1과 동일하게 삭제 확인 다이얼로그(`confirm()`)가 브라우저 자동화를 블로킹해 Drizzle로 테스트 계정/프로젝트 직접 정리

### Completion Notes List

- `updateScreenFields`를 AD-5가 요구하는 "유일한 화면 수정 커맨드"의 첫 구현으로 만들었고, `input`을 `Partial` 형태로 열어둬 Story 3.3~3.5가 파라미터만 추가해 재사용 가능
- AD-9 낙관적 동시성은 애플리케이션 레이어에서 읽고-비교하지 않고 `updateFields`의 WHERE 절(`id` + `project_id` + `updated_at`)에서 원자적으로 처리
- AD-5 필드 단위 판정: `pageId`/`pageName` 각각 독립적으로 실제 값 변경 여부를 확인해 `*_source`를 전환, 저장 버튼을 눌렀다는 사실만으로는 전환하지 않음(값이 같으면 patch에서 제외)
- 디바이스 대응 방식 설정 UI(라디오 2개)를 프로젝트 수정 화면에 신규 추가 — FR-9가 Epic 3 소관으로 명시한 항목이라 범위 확장이 아님
- `detectMixedDeviceMode`는 순수 함수로 구현, DB에 아무 것도 쓰지 않는 표시 전용 파생 계산(AD-6 준수)
- 배지는 "자동생성"/"수정됨" 모두 동일 neutral 회색, 텍스트만 다르게(DESIGN.md 규칙)

### File List

- `db/schema.ts` (수정 — `screen.updatedAt`/`createdAt`에 `precision: 3` 추가)
- `drizzle/0007_harsh_lake.sql`, `drizzle/meta/0007_snapshot.json`, `drizzle/meta/_journal.json` (신규/수정)
- `domain/ports/screen-repository.ts` (수정 — `findById`, `updateFields`, `ScreenFieldsPatch` 추가)
- `domain/ports/project-repository.ts` (수정 — `UpdateProjectInput.deviceMode` 추가)
- `domain/screen/detect-mixed-device-mode.ts` (신규)
- `adapters/repository/drizzle/screen-repository.ts` (수정 — `findById`, `updateFields` 구현)
- `adapters/repository/drizzle/project-repository.ts` (수정 — `update()`에 `deviceMode` 반영)
- `application/update-screen-fields.ts` (신규)
- `application/list-screens.ts` (수정 — `{ project, screens }` 반환)
- `app/(app)/dashboard/[projectId]/screens/update-screen-action.ts`, `screen-list-item.tsx` (신규)
- `app/(app)/dashboard/[projectId]/screens/page.tsx` (수정 — `ScreenListItem` + 혼재 경고 배너)
- `app/(app)/dashboard/[projectId]/edit/edit-project-form.tsx`, `actions.ts` (수정 — 디바이스 대응 방식 라디오)
