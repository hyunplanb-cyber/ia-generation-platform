---
baseline_commit: 6795e82
---

# Story 3.6: 재실행해도 내가 고친 내용은 지켜지기

Status: review

## Story

As a 메뉴를 추가한 뒤 다시 [실행: IA 생성]을 누르는 사용자,
I want 이미 손으로 고친 화면은 그대로 남아있고, 새로 추가한 메뉴의 화면만 생기기를,
so that 다시 실행한다고 애써 고친 내용이 날아가는 걱정을 안 해도 된다.

## Acceptance Criteria

1. **Given** 화면 몇 개를 손으로 수정해둔 프로젝트 **When** 새 메뉴를 추가하고 [실행: IA 생성]을 다시 클릭하면 **Then** 이미 있던 화면(수정한 것 포함)은 그대로 유지되고, 새 메뉴에 대한 화면만 새로 추가된다.
2. **Given** 재실행 버튼을 누르기 직전 **When** 클릭하면 **Then** "기존에 직접 수정한 화면은 유지되고, 새로 추가된 메뉴에서만 화면이 생성됩니다"라는 확인 절차를 거친다.
3. **Given** 새로 추가된 메뉴가 없는 상태에서 재실행함 **When** 클릭하면 **Then** "새로 추가된 메뉴가 없어 변경사항이 없습니다"라는 안내만 뜨고 아무것도 바뀌지 않는다.

## Tasks / Subtasks

- [x] Task 1: `domain/screen` — 재생성 후보 필터링 순수 로직 (AC: #1)
  - [x] `domain/screen/select-new-screen-drafts.ts` — `selectNewScreenDrafts<T extends { menuId: string; screenRole: string; deviceCode: string }>(candidates: T[], existingScreens: Pick<Screen,"menuId"|"screenRole"|"deviceCode"|"status">[]): T[]`. `existingScreens`에서 `status !== "quarantined"`인 것만으로 `(menuId, screenRole, deviceCode)` 키 집합을 만들고, 이 키에 이미 존재하는 후보는 제외한다(AD-3 — 안정적 매칭 키는 `menu_id`+`screen_role`이되, PC/MO 분리 프로젝트에서 디바이스별로 별도 화면 행이 생기므로 `deviceCode`까지 포함해야 두 디바이스를 올바르게 구분한다 — Dev Notes 참고)

- [x] Task 2: 재실행 시 신규 메뉴의 화면만 추가 생성 (AC: #1)
  - [x] `application/generate-screens.ts` 수정 — 기존 로직으로 전체 후보(`inputs`)를 조립한 뒤, `drizzleScreenRepository.listByProject(projectId)`로 기존 화면을 조회하고 `selectNewScreenDrafts()`로 걸러 실제로 새로 만들 것만 남긴다. 남은 게 없으면 `createMany` 호출 없이 그대로 종료(빈 배열 전달은 이미 `createMany`가 no-op 처리하지만, 이후 일정 배분 계산도 건너뛰어 불필요한 연산을 피한다)
  - [x] 페이지ID 일련번호(`serial`) 계산 방식 수정 — 항상 1000부터 시작하지 않고, 같은 `(menuId, deviceCode)` 조합에 기존 화면이 몇 개 있는지를 반영해 그 다음 번호부터 이어서 배정한다(완전히 새 메뉴는 기존 화면이 0개이므로 결과적으로 지금처럼 1000부터 시작 — 동작 변화 없음. 다만 이렇게 해두면 이후 패턴 라이브러리가 확장돼 기존 메뉴에 새 역할이 추가되는 경우에도 기존 화면과 `page_id`가 충돌하지 않는다)
  - [x] 신규 화면에도 Story 3.5의 일정 배분(`distributeSchedule`)을 그대로 적용 — 단, 분배 대상은 이번에 "새로 생성되는" 화면 수만큼만(전체 화면이 아니라)이며, 전체 프로젝트 일정(`project.overallStart`~`overallEnd`) 범위를 그대로 사용한다(기존 화면의 일정은 건드리지 않음 — 재계산은 Story 3.5의 `recalculateSchedule`이 별도로 담당하는 영역이라 이번 스토리에서 다시 배분하지 않는다)

- [x] Task 3: 재실행 전 확인 절차 + "변경사항 없음" 안내 (AC: #2, #3)
  - [x] `application/list-menus.ts` 옆에 신규 `application/has-new-menus.ts` — `hasNewMenus(projectId: string): Promise<boolean>`: 메뉴 목록과 화면 목록(둘 다 이미 있는 `listByProject` 메서드)을 조회해, 화면이 하나도 없는(격리되지 않은 화면 기준) 메뉴가 하나라도 있으면 `true`. `listMenus()`가 이미 `withProjectAuth`로 인가를 검증하므로 이 함수 자체는 별도 인가를 다시 걸지 않는다(`countScreensByProject`와 동일한 관례)
  - [x] `app/(app)/dashboard/[projectId]/menus/page.tsx` 수정 — `hasNewMenus(projectId)` 결과를 `GenerateScreensButton`에 `hasNewMenus` prop으로 전달
  - [x] `app/(app)/dashboard/[projectId]/menus/generate-screens-button.tsx` 수정 — 클릭 시: `hasNewMenus`가 `false`이면 `alert("새로 추가된 메뉴가 없어 변경사항이 없습니다.")`만 띄우고 서버 액션은 호출하지 않는다(AC #3). `true`이면 `confirm("기존에 직접 수정한 화면은 유지되고, 새로 추가된 메뉴에서만 화면이 생성됩니다. 계속할까요?")`을 거친 뒤(취소하면 아무 것도 안 함) 확인되면 기존처럼 `generateScreensAction` 호출(AC #2) — Story 3.5의 `edit-project-form.tsx`가 쓴 네이티브 `confirm()` 패턴 재사용

- [x] Task 4: 검증 (AC: #1, #2, #3)
  - [x] 메뉴 1~2개로 화면 생성 → 화면 하나의 페이지명을 수동으로 수정 → 새 메뉴 하나 추가 → [실행: IA 생성] 재실행 → 확인창(AC #2 문구) 확인 → 확인 후 기존 화면(수정 포함)은 그대로, 새 메뉴의 화면만 추가됐는지 확인
  - [x] 새 메뉴를 추가하지 않은 상태에서 다시 [실행: IA 생성] 클릭 → 확인창 없이 "변경사항이 없습니다" 안내만 뜨고 화면 리스트에 아무 변화가 없는지 확인
  - [x] `npm run build`, `npm run lint`, `npm run depcruise` 통과
  - [x] 검증에 사용한 테스트 데이터 정리

## Dev Notes

### 이전 스토리(3.5)에서 이어지는 컨텍스트

- `application/generate-screens.ts`는 현재(Story 3.5 완료 시점) 재실행 시 **항상 전체 메뉴에 대해 화면 후보를 다시 만들어 `createMany`에 그대로 넘긴다** — 기존 화면과의 중복을 전혀 확인하지 않는다. Story 3.5 브라우저 검증 중 이미 화면이 있는 메뉴에 대해 재실행하면 `screen_project_page_id_idx` 유니크 제약 위반(500 에러)이 실제로 재현됐다(3-5 스토리 파일의 Debug Log Reference 참고). 이번 스토리가 바로 그 문제를 해결한다.
- `domain/ports/screen-generation-engine.ts`의 `ScreenGenerationEngine.generate()`는 이미 `existingScreens: Screen[]`을 입력으로 받지만, `adapters/generation/rule-pattern/rule-pattern-engine.ts`의 구현은 `{ menu }`만 구조분해해서 이 값을 전혀 쓰지 않는다 — 화면 유형 목록(예: 게시판→목록/상세/작성)은 메뉴 이름만으로 결정되는 순수 규칙이라 `existingScreens`가 필요 없기 때문이다. **이 포트 시그니처는 그대로 두고 엔진 구현도 건드리지 않는다** — "이미 존재하는 것 제외하기"는 엔진의 책임이 아니라 애플리케이션 서비스(`generate-screens.ts`)의 책임으로 구현한다(엔진은 "이 메뉴라면 어떤 화면들이 있어야 하는가"만 answer하고, 실제로 뭘 새로 만들지는 기존 DB 상태와 diff해서 애플리케이션 레이어가 결정 — 계층 책임 분리, AD-1).

### AD-3 매칭 키를 `deviceCode`까지 확장하는 이유

- 아키텍처 스파인 원문: "`ScreenGenerationEngine`이 반환하는 각 화면 후보는 안정적 매칭 키 `(menu_id, screen_role)`... 재실행 시 기존 화면과의 매칭은 이 키로만 수행"이라고 되어 있지만, 실제 데이터 모델에서는 디바이스 분리 프로젝트(`device_mode: "device-split"`)의 경우 같은 `screen_role`이라도 PC/MO 두 개의 서로 다른 화면 행이 생긴다(`generate-screens.ts`의 `deviceCodes` 루프). `(menu_id, screen_role)`만으로 매칭하면 PC 화면 하나만 있어도 "이미 존재함"으로 오판해 MO 화면이 영영 생성되지 않는 버그가 생긴다. 그래서 이번 구현은 스파인의 취지(페이지ID 문자열이나 일련번호 추측이 아니라 엔진이 부여한 안정적 태그로 매칭)를 지키면서 `deviceCode`를 키에 포함시킨다.

### 페이지ID 일련번호 재사용 시 충돌 방지

- 현재 코드는 메뉴마다 항상 `serial = 1000`부터 새로 센다. 이번 스토리에서 "이미 존재하는 (menu_id, screen_role, deviceCode) 조합은 새로 만들지 않는다"만 구현하면 충분히 AC를 만족하지만, 만약 나중에(이번 스토리 범위 밖) 패턴 라이브러리가 확장되어 기존 메뉴에 새 역할이 추가되는 시나리오가 생기면, 그 메뉴는 이미 1000/1001 등을 쓰고 있는데 새 후보도 여전히 1000부터 배정하려다 `page_id` 충돌이 날 수 있다. 이번 구현에서 일련번호 시작점을 "그 메뉴+디바이스 조합에 이미 존재하는 화면 개수"만큼 밀어서 배정하도록 미리 고쳐둔다 — 완전히 새 메뉴는 기존 화면이 0개이므로 결과적으로 지금과 동일하게 1000부터 시작해 기존 동작을 바꾸지 않는다.

### 격리(quarantined) 화면과의 관계 — Story 3.7 선행 주의사항

- FR-8은 "격리된 화면은 재실행 대상 제외"라고 명시한다. 다만 **격리 상태(`status: "quarantined"`)를 실제로 만드는 코드는 아직 없다** — 메뉴 삭제(Story 2.4, 커밋 `f15e5ff`)는 Screen 엔티티가 생기기 전에 구현되어 현재는 `screen.menu_id`에 `onDelete: "cascade"`가 걸려 있어 메뉴를 지우면 화면이 하드 삭제된다. 격리로 바꾸는 작업은 Story 3.7의 몫이다. 이번 스토리의 필터(`selectNewScreenDrafts`)는 `status !== "quarantined"`인 화면만 "이미 존재함"으로 취급하도록 미리 작성해두되, 실제로 quarantined 화면이 생기는 경로가 없으므로 이번 스토리의 검증에서는 이 분기를 직접 재현할 수 없다(Story 3.7에서 함께 검증됨).

### 확인 대화상자를 클릭 전에 건너뛰는 이유 (AC #3)

- AC #2("확인 절차를 거친다")와 AC #3("안내만 뜨고 아무것도 안 바뀐다")를 하나의 클릭 핸들러 안에서 순서대로(confirm 먼저, 그 다음 결과가 없으면 안내) 처리할 수도 있지만, 그러면 "새로 만들 게 전혀 없는데도 확인창부터 띄우는" 어색한 흐름이 된다. 대신 서버 컴포넌트(`menus/page.tsx`)에서 미리 `hasNewMenus()`로 판단해 클라이언트에 boolean으로 내려주고, 버튼 클릭 시 이 값으로 분기한다 — `hasNewMenus === false`면 confirm 없이 바로 안내만, `true`면 지금처럼 confirm 후 서버 액션 호출. 이렇게 하면 실제로 바뀔 게 없는 경우 서버 왕복 자체가 발생하지 않는다.
- 첫 실행(화면이 하나도 없는 신규 프로젝트)에서도 모든 메뉴가 "화면 없음"이므로 `hasNewMenus`는 `true`가 되어 확인창이 뜬다 — AC #2 문구가 "재실행 버튼"이라는 표현을 쓰지만 실제로는 버튼이 하나뿐이라 첫 실행에도 동일하게 적용된다. 문구 자체("기존에 직접 수정한 화면은 유지되고...")는 첫 실행에도 틀린 말이 아니므로 그대로 둔다.

### 테스트 프레임워크 없음

- `npm run build`+`lint`+`depcruise`+브라우저 실측으로 검증한다(Story 3.1~3.5와 동일).

### References

- [Source: epics.md#Story 3.6, #FR-8]
- [Source: ARCHITECTURE-SPINE.md#AD-3] — 메뉴 삭제는 격리, 재실행 매칭은 `(menu_id, screen_role)` 안정적 키
- [Source: ARCHITECTURE-SPINE.md#AD-1] — 도메인 엔진과 애플리케이션 서비스의 책임 분리
- [Source: ARCHITECTURE-SPINE.md#Deferred] — 패턴 라이브러리 확장 범위 미정(일련번호 충돌 방지만 미리 대비)
- [Source: 3-5-screen-schedule-and-recalculation.md] — 네이티브 `confirm()` 패턴, `distributeSchedule` 재사용, neon-http 트랜잭션 미지원(이번 스토리는 단일 `createMany` 호출만 있어 트랜잭션이 필요 없음)
- [Source: domain/ports/screen-generation-engine.ts] — `existingScreens` 필드가 이미 선언되어 있으나 미사용 상태였던 배경

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- Story 3.5의 브라우저 검증 중 재현됐던 `screen_project_page_id_idx` 유니크 제약 위반(같은 메뉴로 재실행 시 500 에러)이 이번 스토리로 해결됐는지 브라우저에서 직접 재확인 — 새 메뉴 추가 후 재실행해도 에러 없이 새 메뉴의 화면만 추가됨을 확인.

### Completion Notes List

- `domain/screen/select-new-screen-drafts.ts` 신설 — `(menuId, screenRole, deviceCode)` 키로 신규/기존 화면 후보를 구분하는 순수 함수(quarantined 화면은 매칭 대상에서 제외, DB·프레임워크 의존성 없음).
- `application/generate-screens.ts` 수정 — 재실행 시 기존 화면 전체를 조회해 이미 존재하는 (menu, role, device) 조합은 건너뛰고, 신규 후보만 `createMany`에 전달. 일련번호도 메뉴+디바이스별 기존 화면 개수만큼 이어서 배정하도록 바꿔 향후 패턴 확장 시에도 `page_id` 충돌을 예방(완전히 새 메뉴는 기존 화면 0개라 지금과 동일하게 1000부터 시작 — 동작 변화 없음). 신규로 생성될 화면이 없으면 `createMany`/일정 배분 모두 건너뜀.
- `application/has-new-menus.ts` 신규 — 프로젝트의 메뉴/화면을 조회해 화면이 아직 없는 메뉴가 하나라도 있는지 반환.
- `app/(app)/dashboard/[projectId]/menus/page.tsx`·`generate-screens-button.tsx` 수정 — `hasNewMenus`가 `false`면 confirm 없이 "새로 추가된 메뉴가 없어 변경사항이 없습니다" 안내만 뜨고 서버 호출을 하지 않음(AC #3). `true`면 "기존에 직접 수정한 화면은 유지되고..." 확인창을 거친 뒤(AC #2) 기존처럼 서버 액션 호출.
- 브라우저에서 실제로 확인: 메뉴 1개(게시판, 화면 3개 생성) → 화면 하나 페이지명 수동 수정("수정됨" 배지) → 새 메뉴(회원) 추가 → 재실행 → 확인창 문구 정확히 일치 → 기존 3개 화면(페이지ID·페이지명·일정 모두, 수정한 화면 포함) 그대로 유지 + 새 메뉴의 화면 1개만 추가(AC #1, #2). 새 메뉴 추가 없이 재실행 시 확인창 없이 안내만 뜨고 화면 리스트 변화 없음(AC #3).
- `npm run build`/`npm run lint`/`npm run depcruise` 모두 통과.
- 검증에 사용한 테스트 계정(story36tester@example.com)과 프로젝트/메뉴/화면 데이터는 일회성 스크립트로 정리 완료.

### File List

- `domain/screen/select-new-screen-drafts.ts` (신규)
- `application/generate-screens.ts` (수정)
- `application/has-new-menus.ts` (신규)
- `app/(app)/dashboard/[projectId]/menus/page.tsx` (수정)
- `app/(app)/dashboard/[projectId]/menus/generate-screens-button.tsx` (수정)
