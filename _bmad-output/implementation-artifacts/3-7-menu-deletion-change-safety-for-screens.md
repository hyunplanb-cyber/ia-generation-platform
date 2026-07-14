---
baseline_commit: 5223912
---

# Story 3.7: 메뉴가 삭제/변경되면 관련 화면이 안전하게 처리되는 것 확인하기

Status: review

## Story

As a 메뉴 구조를 바꾸는 사용자,
I want 메뉴를 삭제하거나 이름을 바꿔도 이미 만들어진 화면과 그 화면을 참조하던 다른 화면이 안전하게 유지되기를,
so that 메뉴를 정리하다가 화면 데이터를 실수로 잃어버리지 않는다.

## Acceptance Criteria

1. **Given** 화면이 이미 만들어진 메뉴 **When** 이 메뉴를 삭제하면(Epic 2의 Story 2.4) **Then** 소속 화면은 삭제되지 않고 "격리됨" 상태로 화면 리스트의 별도 필터에 모인다.
2. **Given** 격리된 화면을 다른 화면의 버튼이 가리키고 있었음 **When** 격리가 일어나면 **Then** 그 버튼 항목은 "깨진 링크"로 표시된다(Story 3.3과 동일 규칙).
3. **Given** 메뉴의 영문명을 바꿔 메뉴코드가 달라짐 **When** 저장하면 **Then** 이미 발급된 화면의 페이지ID는 그대로 유지되고, 새로 만들어지는 화면부터 새 코드가 적용되며, "이 메뉴에 신/구 코드가 섞여 있어요" 경고가 화면 목록에 표시된다.

## Tasks / Subtasks

- [x] Task 1: 메뉴 삭제 = 소프트 삭제 + 화면 격리 (AC: #1)
  - [x] `db/schema.ts` — `menu` 테이블에 `deletedAt: timestamp("deleted_at")` 컬럼 추가(`project.deletedAt`과 동일한 소프트 삭제 패턴). `screen.menu_id` FK는 **건드리지 않는다**(Dev Notes의 설계 결정 참고 — nullable FK 대신 메뉴 소프트 삭제를 택함)
  - [x] `npx drizzle-kit generate`로 마이그레이션 파일 생성 → 내용 확인 → `npx drizzle-kit migrate`로 적용
  - [x] `domain/menu/menu.ts` — `Menu` 인터페이스에 `deletedAt: Date | null` 추가(`Project` 도메인 타입과 동일한 필드 노출 관례)
  - [x] `adapters/repository/drizzle/menu-repository.ts` — `toDomain`에 `deletedAt: row.deletedAt` 추가. `listByProject`의 WHERE절에 `isNull(menu.deletedAt)` 조건 추가(소프트 삭제된 메뉴는 목록에서 사라져야 함 — AC #1 "메뉴를 삭제하면"은 메뉴 관리 화면에서 즉시 사라지는 기존 Story 2.4 UX를 그대로 유지해야 한다). `delete()` 메서드 구현을 `db.delete(menu)...`에서 `db.update(menu).set({ deletedAt: new Date() })...`로 변경(호출부 시그니처는 그대로 유지)
  - [x] `domain/ports/screen-repository.ts` — `quarantineByMenu(projectId: string, menuId: string): Promise<void>` 추가
  - [x] `adapters/repository/drizzle/screen-repository.ts` — `quarantineByMenu` 구현: `UPDATE screen SET status = 'quarantined' WHERE project_id = ? AND menu_id = ?`
  - [x] `application/delete-menu.ts` 수정 — `withProjectAuth` 안에서 `drizzleScreenRepository.quarantineByMenu(projectId, menuId)` 호출 후 `drizzleMenuRepository.delete(projectId, menuId)` 호출(neon-http 트랜잭션 미지원이라 순차 호출 — Story 3.5 Dev Notes와 동일 제약)
  - [x] `app/(app)/dashboard/[projectId]/menus/delete-menu-action.ts` — `revalidatePath(`/dashboard/${projectId}/screens`)`도 함께 호출(격리 결과가 화면 리스트에도 반영되므로)
  - [x] `app/(app)/dashboard/[projectId]/menus/menu-list-item.tsx` — 삭제 확인 문구를 "이 메뉴를 삭제하시겠어요? 이미 생성된 화면은 삭제되지 않고 격리돼요."로 변경(더 이상 완전 삭제가 아니므로 문구가 실제 동작과 어긋나면 안 됨)

- [x] Task 2: 화면 리스트에서 격리된 화면을 별도 섹션으로 분리 + 깨진 링크 확인 (AC: #1, #2)
  - [x] `app/(app)/dashboard/[projectId]/screens/page.tsx` 수정 — `screens`를 `activeScreens`(`status === "active"`)와 `quarantinedScreens`(`status === "quarantined"`)로 나눈다. 기존의 `detectMixedDeviceMode`/`detectOutOfRangeScreens`/`detectScheduleReversals`/`<ScreensView>`는 전부 `activeScreens`만 사용하도록 바꾼다(격리된 화면이 범위이탈/일정역전 정렬이나 디바이스 혼재 배너에 섞여 들어가면 안 됨)
  - [x] `app/(app)/dashboard/[projectId]/screens/quarantined-screens-section.tsx` 신규 — `quarantinedScreens.length > 0`일 때만 렌더링되는 읽기 전용 목록(페이지ID/페이지명 + "격리됨" 안내 문구). 재배정·하드삭제 액션은 이번 스토리 범위 밖(Dev Notes 참고)
  - [x] `app/(app)/dashboard/[projectId]/screens/screen-detail-panel.tsx`의 `ButtonActionRow` 수정 — `options`(이동 대상 드롭다운)에서 격리된 화면을 제외(`s.status !== "quarantined"`)해, 이미 격리된 화면을 새 버튼의 연결 대상으로 다시 선택할 수 없게 한다(격리 이전에 이미 연결돼 있던 버튼은 그대로 "깨진 링크"로 표시되는 기존 로직을 그대로 둔다 — 이 로직은 Story 3.3에서 이미 `target.status === "quarantined"`를 검사하도록 구현되어 있어 새 코드가 필요 없다)

- [x] Task 3: 메뉴 영문명 변경 시 메뉴코드 재계산 + 신/구 코드 혼재 경고 (AC: #3)
  - [x] `domain/screen/detect-mixed-menu-code.ts` 신규 — `detectMixedMenuCodeMenuIds(menus: Pick<Menu,"id"|"menuCode">[], screens: Pick<Screen,"menuId"|"pageId"|"deviceCode">[]): Set<string>`. 화면마다 `pageId`에서 `deviceCode` 다음 `menuCode.length`만큼을 잘라 "발급 당시의 메뉴코드"를 복원하고, 소속 메뉴의 **현재** `menuCode`와 다르면 그 메뉴의 id를 담는다(순수 함수, DB 접근 없음 — AD-6과 동일한 파생 계산 원칙)
  - [x] `domain/ports/menu-repository.ts`의 `UpdateMenuInput`에 `menuCode: string` 추가
  - [x] `adapters/repository/drizzle/menu-repository.ts`의 `update()`가 `menuCode: input.menuCode`도 함께 저장하도록 수정(현재는 nameKo/nameEn/description/desiredFeatures만 저장하고 menuCode는 생성 시점 값에 고정되어 있음 — 이번 스토리가 고치는 핵심 버그)
  - [x] `application/update-menu.ts` 수정 — `nameEn`으로 `deriveMenuCode()`를 다시 계산해 기존 `menuCode`와 다르면, Story 2.2의 `validateMenuCode()`(다른 메뉴와 중복/예약어 검사, `domain/menu/menu-code-rules.ts`)로 검증 후 통과하면 새 코드를 반영. 반환 타입을 `{ok:true,menu} | {ok:false,reason:MenuCodeRejection}`으로 바꿔 `addMenu`와 동일한 패턴을 재사용
  - [x] `app/(app)/dashboard/[projectId]/menus/update-menu-action.ts` 수정 — `result.ok === false`일 때 사유별 에러 메시지 표시(예: "영문명을 바꾸면 이미 사용 중인 코드와 겹쳐요. 다른 영문명을 입력해 주세요."). 성공 시 `/dashboard/${projectId}/screens`도 함께 `revalidatePath`
  - [x] `app/(app)/dashboard/[projectId]/screens/page.tsx` 수정 — `listMenus(projectId)`로 메뉴 목록을 조회하고 `detectMixedMenuCodeMenuIds(menus, activeScreens)`로 혼재된 메뉴를 찾아, 해당 메뉴마다 "OO 메뉴에 신/구 코드가 섞여 있어요. 기존 화면의 페이지ID는 유지되고, 새로 생성되는 화면부터 새 코드가 적용돼요." 배너를 표시(기존 `isMixed` 디바이스 혼재 배너와 같은 스타일)

- [x] Task 4: 검증 (AC: #1, #2, #3)
  - [x] 메뉴 1개로 화면 몇 개 생성 → 화면 하나의 버튼이 다른 화면을 가리키도록 연결 → 그 대상 화면이 속한 메뉴를 삭제 → 화면 리스트에서 해당 화면들이 메인 목록에서 사라지고 "격리된 화면" 섹션에 나타나는지 확인 → 그 화면을 가리키던 버튼이 "깨진 링크"로 표시되는지 확인(AC #1, #2)
  - [x] 다른 메뉴의 영문명을 바꿔 메뉴코드가 달라지도록 수정 → 기존 화면의 페이지ID가 그대로인지 확인 → 화면 리스트에 "신/구 코드가 섞여 있어요" 배너가 뜨는지 확인(AC #3)
  - [x] `npm run build`, `npm run lint`, `npm run depcruise` 통과
  - [x] 검증에 사용한 테스트 데이터 정리

## Dev Notes

### 설계 결정 — 메뉴 삭제를 하드 삭제 대신 소프트 삭제로 구현

- 아키텍처 스파인 AD-3는 "메뉴 삭제는 소속 `screen.status`를 `quarantined`로 전환할 뿐 행을 삭제하지 않는다"고만 명시하고, **메뉴 자체**를 하드/소프트 중 어느 쪽으로 삭제할지는 명시하지 않는다.
- 하드 삭제를 유지하려면 `screen.menu_id` FK를 nullable + `ON DELETE SET NULL`로 바꿔야 하고, 그러면 `Screen.menuId`가 `string | null`이 되어 `domain/screen/select-new-screen-drafts.ts`, `application/generate-screens.ts`, `application/has-new-menus.ts`, `application/generate-screen-prompt.ts` 등 `menuId`를 참조하는 모든 곳의 타입을 손봐야 한다.
- 대신 `project.deletedAt`과 동일한 소프트 삭제 패턴을 메뉴에도 적용하면(`menu.deleted_at` 컬럼 추가), `screen.menu_id` FK는 전혀 건드릴 필요가 없다 — 메뉴 행이 실제로는 남아있으므로 참조 무결성이 자동으로 유지된다. `listByProject()`가 `deleted_at IS NULL`로 걸러주기만 하면 메뉴 관리 화면 입장에서는 "삭제됨"과 동일하게 보인다(Story 2.4가 만든 기존 UX 그대로 유지).
- **주의**: `Project`의 소프트 삭제(`softDeleteAllByOwner`)는 30일 유예 기간 동안 오히려 계속 화면에 보여야 하는 정책이라 `listByOwner()`가 `deletedAt`을 필터링하지 **않는다**(`adapters/repository/drizzle/project-repository.ts` 참고). 메뉴는 반대로 "삭제 즉시 목록에서 사라져야" 하므로 `listByProject()`는 반드시 필터링해야 한다 — 이름은 같은 "소프트 삭제"지만 두 엔티티의 필터링 정책은 다르다는 점을 헷갈리지 말 것.

### 이미 구현되어 있어 손댈 필요 없는 부분 (AC #2)

- `app/(app)/dashboard/[projectId]/screens/screen-detail-panel.tsx:267`의 `ButtonActionRow`가 이미 `const brokenLink = !target || target.status === "quarantined";`로 격리 상태를 검사하고 있다 — Story 3.3이 이 스토리를 미리 내다보고 구현해 둔 것이다. `screen.status`가 실제로 `"quarantined"`가 되는 경로(Task 1)만 만들면 AC #2는 **추가 코드 없이 자동으로 통과**한다. 브라우저 검증만 하면 된다.
- Story 3.6의 `domain/screen/select-new-screen-drafts.ts`와 `application/has-new-menus.ts`도 이미 `status !== "quarantined"`로 격리된 화면을 걸러내도록 구현되어 있다 — 재실행 시 격리된 화면의 `(menu_id, screen_role, device_code)` 키가 신규 후보와 충돌하지 않는다. 이 부분도 추가 구현 없이 그대로 맞물린다.

### `menuCode`가 지금까지 한 번도 재계산되지 않았던 버그

- `adapters/repository/drizzle/menu-repository.ts`의 `update()`는 현재 `nameKo`/`nameEn`/`description`/`desiredFeatures`만 저장하고 **`menuCode`는 절대 갱신하지 않는다** — 메뉴 생성 시점에 고정된 값 그대로다. 이번 스토리에서 이 부분을 처음으로 고친다. `application/update-menu.ts`가 `nameEn`이 실제로 바뀌었는지가 아니라 **재계산된 코드가 기존 코드와 다른지**로 판단해야 한다(예: "Member" → "Members"로 바꿔도 앞 2글자는 여전히 "ME"라 코드는 안 바뀜 — 이런 경우는 검증/경고 모두 건너뛴다).
- 코드가 실제로 바뀌는 경우, Story 2.2가 만든 `validateMenuCode()`(`domain/menu/menu-code-rules.ts`)를 **그대로 재사용**해서 다른 메뉴와의 중복·예약어(`PC`/`MO`) 충돌을 검사한다 — 새로 만들지 않는다. `addMenu`(`application/add-menu.ts`)가 쓰는 것과 동일한 함수.

### `page_id`에서 "발급 당시 메뉴코드"를 복원하는 방법

- `derivePageId(deviceCode, menuCode, serial)`은 항상 `{deviceCode}{menuCode}{4자리 일련번호}` 형식이고, `deviceCode`는 항상 `"PC"`/`"MO"`(2글자, AD-2 예약어), `menuCode`는 `deriveMenuCode()`가 항상 영문명 앞 2글자로 만들어(수동 입력 시에도 `validateMenuCode`가 최소 2글자를 강제) 항상 고정 길이다. 따라서 별도 스냅샷 컬럼 없이 `screen.pageId.slice(screen.deviceCode.length, screen.deviceCode.length + menu.menuCode.length)`로 화면이 생성될 당시 사용됐던 메뉴코드를 그대로 복원할 수 있다 — 이 값이 메뉴의 **현재** `menuCode`와 다르면 "혼재"다.

### 격리된 화면의 "재배정"·"하드 삭제"는 이번 스토리 범위 밖

- epics.md의 AC #1 문장 뒷부분("사용자가 **나중에** 재배정하거나 직접 삭제를 선택할 수 있다")은 Given/When/Then으로 테스트 가능한 핵심 동작(격리 + 별도 필터)이 아니라 향후 지향점을 설명하는 문장이다. 이번 스토리는 격리 상태를 만들고 별도 섹션에 보여주는 것까지만 구현하고, 재배정 UI와 하드 삭제 액션은 만들지 않는다.
- 다만 나중에 하드 삭제 기능을 붙일 때를 위해 AD-3가 이미 규칙을 정해뒀다는 점은 기록해 둔다: "격리된 화면을 대상으로 하는 `button_action`이 하나라도 남아 있으면 삭제를 막고 먼저 참조를 정리하도록 안내한다." `button_action.target_screen_id`는 FK가 `onDelete` 미지정(기본 RESTRICT)이라 실제로 DB가 이 규칙을 강제한다.

### 테스트 프레임워크 없음

- `npm run build`+`lint`+`depcruise`+브라우저 실측으로 검증한다(Story 3.1~3.6과 동일).

### References

- [Source: epics.md#Story 3.7, #FR-6]
- [Source: ARCHITECTURE-SPINE.md#AD-3] — 메뉴 삭제=격리(하드삭제 아님), 격리 화면 하드삭제 시 참조 정리 선행
- [Source: ARCHITECTURE-SPINE.md#AD-4] — "깨진 링크" 판정 규칙(대상이 없거나 격리됨)
- [Source: ARCHITECTURE-SPINE.md#AD-6] — 파생 경고(메뉴코드 혼재)는 저장하지 않고 배치 조회로 계산
- [Source: 3-3-define-screen-functions-and-button-links.md] — `brokenLink` 판정이 이미 `status === "quarantined"`를 검사하도록 선제 구현됨
- [Source: 3-5-screen-schedule-and-recalculation.md] — neon-http 트랜잭션 미지원(순차 호출), 파생 배지 렌더링 스타일
- [Source: 3-6-preserve-manual-edits-on-regeneration.md] — `select-new-screen-drafts`/`has-new-menus`가 이미 quarantined 화면을 제외하도록 구현됨
- [Source: adapters/repository/drizzle/project-repository.ts] — 기존 소프트 삭제 패턴(단, 필터링 정책은 메뉴와 반대임에 주의)
- [Source: domain/menu/menu-code-rules.ts, application/add-menu.ts] — 재사용할 메뉴코드 검증 로직

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- 스키마 변경(menu.deleted_at 추가) 전에 nullable FK(screen.menu_id → set null) 대안을 먼저 검토했으나, Screen.menuId 타입이 `string | null`로 바뀌면 select-new-screen-drafts/generate-screens/has-new-menus/generate-screen-prompt 등 여러 곳의 타입을 손봐야 해서 리스크가 커짐을 확인. project.deletedAt과 동일한 소프트 삭제 패턴으로 전환해 screen.menu_id FK를 전혀 건드리지 않는 쪽으로 최종 결정(Dev Notes에 근거 기록).
- `npx drizzle-kit generate` → `ALTER TABLE "menu" ADD COLUMN "deleted_at" timestamp;` 단순 추가 마이그레이션 확인 → `npx drizzle-kit migrate`로 적용, 이상 없음.
- 브라우저 검증: Story 3.3이 미리 구현해 둔 `target.status === "quarantined"` 깨진 링크 판정이 이번 스토리의 격리 기능과 맞물려 추가 코드 없이 정상 동작함을 확인.

### Completion Notes List

- `menu` 테이블에 `deleted_at` 컬럼 추가(소프트 삭제). `listByProject()`가 이를 필터링해 삭제된 메뉴는 메뉴 관리 화면에서 즉시 사라짐(기존 Story 2.4 UX 그대로 유지). `screen.menu_id` FK/타입은 전혀 변경하지 않음.
- 메뉴 삭제 시 `application/delete-menu.ts`가 먼저 `quarantineByMenu()`로 소속 화면을 `status: "quarantined"`로 전환한 뒤 메뉴를 소프트 삭제. 화면 리스트에서 격리된 화면은 메인 목록/범위이탈·역전 판정·디바이스혼재 배너에서 제외되고 별도 "격리된 화면" 섹션에 표시됨(AC #1).
- 격리된 화면을 가리키던 버튼은 Story 3.3이 이미 구현해 둔 `brokenLink` 판정 덕분에 추가 코드 없이 "깨진 링크"로 표시됨을 브라우저에서 확인(AC #2). 새 버튼의 이동 대상 드롭다운에서는 격리된 화면이 선택지에서 제외되도록 한 줄 수정.
- `menuCode`가 메뉴 수정 시 한 번도 재계산되지 않던 기존 버그를 고쳐, 영문명이 바뀌어 코드가 달라지면(Story 2.2의 `validateMenuCode` 재사용으로 충돌 검증) 새 코드가 저장되도록 함. 기존 화면의 `page_id`는 그대로 유지되고(별도 처리 없이 자연히 유지됨), `domain/screen/detect-mixed-menu-code.ts`가 `page_id`에 인코딩된 발급 당시 코드와 메뉴의 현재 코드를 비교해 혼재된 메뉴를 찾아 화면 리스트에 배너로 표시(AC #3) — 브라우저에서 "Board"→"Community"로 바꿔 코드가 BO→CO로 바뀌고도 기존 화면 페이지ID(PCBO...)가 그대로임과 배너 노출을 확인.
- `npm run build`/`npm run lint`/`npm run depcruise` 모두 통과.
- 검증에 사용한 테스트 계정(story37tester@example.com)과 프로젝트/메뉴/화면 데이터는 일회성 스크립트로 정리 완료.
- 격리된 화면의 "재배정"/"직접 하드삭제"는 Dev Notes에 기록한 대로 이번 스토리 범위 밖으로 명시적으로 남겨둠.

### File List

- `db/schema.ts` (수정 — `menu.deleted_at` 컬럼 추가)
- `drizzle/0009_orange_phantom_reporter.sql` (신규 — 마이그레이션)
- `drizzle/meta/0009_snapshot.json`, `drizzle/meta/_journal.json` (신규/수정 — drizzle-kit 자동 생성)
- `domain/menu/menu.ts` (수정 — `deletedAt` 필드 추가)
- `domain/ports/menu-repository.ts` (수정 — `UpdateMenuInput.menuCode` 추가)
- `domain/ports/screen-repository.ts` (수정 — `quarantineByMenu` 추가)
- `domain/screen/detect-mixed-menu-code.ts` (신규)
- `adapters/repository/drizzle/menu-repository.ts` (수정 — 소프트 삭제, `deletedAt` 필터, `menuCode` 저장)
- `adapters/repository/drizzle/screen-repository.ts` (수정 — `quarantineByMenu` 구현)
- `application/delete-menu.ts` (수정 — 격리 후 소프트 삭제)
- `application/update-menu.ts` (수정 — 메뉴코드 재계산 + 검증, ok/reason 반환)
- `app/(app)/dashboard/[projectId]/menus/delete-menu-action.ts` (수정 — 화면 리스트 revalidate 추가)
- `app/(app)/dashboard/[projectId]/menus/menu-list-item.tsx` (수정 — 삭제 확인 문구 변경)
- `app/(app)/dashboard/[projectId]/menus/update-menu-action.ts` (수정 — 에러 처리, 화면 리스트 revalidate 추가)
- `app/(app)/dashboard/[projectId]/screens/page.tsx` (수정 — 활성/격리 화면 분리, 메뉴코드 혼재 배너)
- `app/(app)/dashboard/[projectId]/screens/quarantined-screens-section.tsx` (신규)
- `app/(app)/dashboard/[projectId]/screens/screen-detail-panel.tsx` (수정 — 이동 대상 드롭다운에서 격리 화면 제외)
