---
baseline_commit: 9731230
---

# Story 3.3: 화면 기능정의 작성하고 버튼을 다른 화면과 연결하기

Status: review

## Story

As a 화면을 구체화하는 사용자,
I want 화면 안의 기능과 버튼을 누르면 어디로 이동하는지 적기를,
so that AI 코딩 도구가 화면 간 이동까지 이해하고 만들 수 있다.

## Acceptance Criteria

1. **Given** 화면 상세 패널 **When** 기능정의를 작성하고 버튼 항목에 "이동 대상"을 추가하려 하면 **Then** 자유 텍스트가 아니라 같은 프로젝트 내 페이지ID를 드롭다운에서 검색해서 고르는 방식으로만 연결할 수 있다. **And** 저장하면 이 화면의 기능정의(`funcDef`) 항목은 "자동생성"이 아닌 "수정됨" 상태로 바뀐다.
2. **Given** 어떤 화면 A의 버튼이 화면 B를 가리키고 있음 **When** 화면 B가 존재하지 않거나(삭제) `quarantined` 상태이면 **Then** 화면 A의 그 버튼 항목에 "깨진 링크" 배지가 표시되고, 자동으로 지워지거나 다른 곳으로 재연결되지 않는다.
3. **Given** 화면 B의 페이지ID가 나중에 바뀜(격리/삭제는 아님) **When** 화면 A에서 그 참조를 다시 보면 **Then** "연결 대상 이름이 바뀌었어요"라는 경고가 뜬다(깨진 링크와는 별개의 경고).
4. **Given** 기능정의 입력칸 **When** 아주 긴 텍스트를 입력하면 **Then** 최대 길이(약 3만자, NFR-8)에 가까워지면 경고가 뜨고 한도를 넘는 입력은 저장이 막힌다.

## Tasks / Subtasks

- [x] Task 1: `button_action` 테이블 신설 (AC: #1, #2, #3)
  - [x] `db/schema.ts`에 `button_action` 테이블 추가(`ARCHITECTURE-SPINE.md#AD-4`가 고정한 형태):
    - `id`(uuid, PK), `screenId`(uuid, FK→screen, `onDelete:'cascade'` — 버튼은 그 버튼이 속한 화면 소유물이므로 화면이 지워지면 함께 지워진다)
    - `label`(text, notNull) — 버튼 설명(예: "계속 쇼핑하기")
    - `targetScreenId`(uuid, FK→screen, **onDelete 지정 안 함(기본 RESTRICT)** — AD-3: 참조가 남아있는 화면은 하드 삭제를 막아야 하므로 CASCADE/SET NULL을 걸면 안 된다)
    - `targetPageIdSnapshot`(text, notNull) — 연결 확정 시점의 대상 `page_id` 스냅샷(AD-4)
    - `createdAt`/`updatedAt`(timestamp, `{precision:3}` — `3-2-edit-page-id-and-page-name.md`에서 발견한 정밀도 이슈 재발 방지, 처음부터 명시)
    - 인덱스: `screenId`, `targetScreenId`
  - [x] `domain/screen/button-action.ts` — `ButtonAction` 엔티티 타입
  - [x] `drizzle-kit generate` + `drizzle-kit migrate`로 live Neon DB에 적용

- [x] Task 2: 버튼-액션 Repository + Application Service (AC: #1, #2, #3)
  - [x] `domain/ports/button-action-repository.ts` — `CreateButtonActionInput{screenId, label, targetScreenId, targetPageIdSnapshot}`, `UpdateButtonActionInput{label?, targetScreenId?, targetPageIdSnapshot?}`, `ButtonActionRepository { create(input): Promise<ButtonAction>; listByProject(projectId): Promise<ButtonAction[]>; update(id, screenId, input): Promise<ButtonAction | null>; delete(id, screenId): Promise<void> }`. `listByProject`는 `screen` 테이블과 join해 `button_action.screen_id`가 해당 프로젝트 화면에 속하는 행만 가져온다(프로젝트 전체를 한 번에 가져와 상세 패널을 열 때마다 재조회하지 않게)
  - [x] `adapters/repository/drizzle/button-action-repository.ts` 구현
  - [x] `application/add-button-action.ts` — `addButtonAction(projectId, screenId, { label, targetScreenId })`: `withProjectAuth` → 대상 화면이 같은 프로젝트 소속인지 확인(다른 프로젝트 화면을 가리키지 못하게) → 대상 화면의 현재 `pageId`를 `targetPageIdSnapshot`으로 스냅샷 → `buttonActionRepository.create()` → **이 화면의 `screen.func_def_source`를 `'manual'`로 전환**(AC #1 — 버튼 추가도 "기능정의"의 일부로 취급, `updateScreenFields`의 텍스트 diff 판정과는 별개로 구조적 변경이므로 직접 플래그만 전환)
  - [x] `application/update-button-action.ts` — `updateButtonAction(projectId, screenId, buttonActionId, { label?, targetScreenId? })`: 대상이 바뀌면 `targetPageIdSnapshot`도 새 대상의 현재 `pageId`로 재스냅샷. `funcDefSource`를 `'manual'`로 전환
  - [x] `application/delete-button-action.ts` — `deleteButtonAction(projectId, screenId, buttonActionId)`: 삭제 + `funcDefSource`를 `'manual'`로 전환(삭제도 기능정의 변경)
  - [x] `application/update-screen-fields.ts` 확장 — `UpdateScreenFieldsRequest`에 `funcDef?: string` 추가. 기존 pageId/pageName과 동일한 AD-5 판정(실제 값이 달라졌을 때만 `funcDefSource: 'manual'` 전환). **`domain/screen/screen.ts`에 `MAX_FUNC_DEF_LENGTH = 30000` 상수 추가**(`domain/screen/func-def-limit.ts`), `updateScreenFields`가 이 길이를 넘는 `funcDef`를 거부(`{ok:false, reason:"too-long"}`)

- [x] Task 3: 화면 상세 패널 UI (AC: #1, #2, #3, #4)
  - [x] `application/get-project-screens-detail.ts` 신규 — `getProjectScreensDetail(projectId)`: `withProjectAuth`로 `{ screens: Screen[], buttonActions: ButtonAction[] }` 반환(화면 리스트 페이지가 상세 패널을 열 때 추가 요청 없이 바로 렌더링할 수 있도록 프로젝트 전체를 한 번에 로드 — N+1 방지, `3-2`의 `listScreens` 패턴과 동일한 철학)
  - [x] `app/(app)/dashboard/[projectId]/screens/page.tsx` 수정 — `listScreens` 대신 `getProjectScreensDetail` 사용, 표 렌더링을 새 클라이언트 컴포넌트 `ScreensView`에 위임
  - [x] `app/(app)/dashboard/[projectId]/screens/screens-view.tsx` 신규(클라이언트 컴포넌트) — `screens`/`buttonActions`를 props로 받아 표를 렌더링(`ScreenListItem` 재사용)하고, 행 클릭 시(페이지ID/페이지명 셀이 아닌 별도 "상세" 버튼 클릭 — 인라인 수정 클릭과 겹치지 않도록) `selectedScreenId` state를 세팅해 우측 슬라이드인 패널(`ScreenDetailPanel`)을 연다. `Esc` 키다운 시 패널 닫힘
  - [x] `app/(app)/dashboard/[projectId]/screens/screen-detail-panel.tsx` 신규(클라이언트 컴포넌트):
    - 기능정의(`funcDef`) textarea — 글자수 카운터, `MAX_FUNC_DEF_LENGTH`의 90% 이상이면 경고 문구, `maxLength`로 초과 입력 자체를 막음(AC #4). 저장 버튼 → `updateScreenFields`(Task 2에서 확장한 서버 액션 경유)
    - 버튼-액션 목록 — 각 항목: `label` 입력 + "이동 대상" 선택 UI + 삭제 버튼. 신규 추가 폼(라벨 입력 + 대상 선택 + 추가 버튼)
    - **페이지ID 선택 UI**: `<select>` 네이티브 엘리먼트로 구현(자유 텍스트 입력 금지 요건은 만족하되, EXPERIENCE.md가 描사한 WAI-ARIA Combobox 검색/자동완성 패턴은 MVP 범위에서 단순화 — Dev Notes에 근거 기록). 옵션 목록은 프로젝트의 모든 화면(`{pageId} — {pageName}`), 자기 자신은 제외
    - 각 버튼-액션 항목에 파생 배지 계산해서 표시: 대상 화면이 없거나(`allScreens`에서 못 찾음) `status === 'quarantined'`면 danger "깨진 링크" 배지, 그렇지 않고 `targetPageIdSnapshot !== 현재 대상 pageId`면 warning "연결 대상 이름이 바뀌었어요" 배지(둘은 동시에 뜨지 않음 — 깨진 링크가 우선)
  - [x] `app/(app)/dashboard/[projectId]/screens/*-action.ts` 서버 액션들 — `update-screen-func-def-action.ts`, `add-button-action-action.ts`, `update-button-action-action.ts`, `delete-button-action-action.ts` (모두 `revalidatePath` 후 상태 반환, React 19 `useActionState` 패턴 재사용)

- [x] Task 4: 검증 (AC: #1, #2, #3, #4)
  - [x] 화면 리스트에서 화면 하나를 열어 기능정의 작성 → 저장 → "수정됨" 배지로 전환 확인
  - [x] 같은 화면에서 버튼-액션 추가(라벨 + 드롭다운으로 다른 화면 선택) → 저장 후 목록에 반영, 자유 텍스트 입력 UI가 없는지(드롭다운만 있는지) 확인
  - [x] 기능정의에 3만자 근접/초과 입력 시도 → 경고 문구 확인, 초과분 입력 차단 확인
  - [x] **깨진 링크 파생 확인**(화면 삭제 UI가 아직 없으므로 DB에서 직접 대상 화면의 `status`를 `quarantined`로 바꾸거나 행을 지워 재현) — 상세 패널에 "깨진 링크" 배지 노출 확인
  - [x] **이름 변경 경고 확인** — 대상 화면의 `pageId`를 (Story 3.2 기능으로) 수정한 뒤 원래 화면의 상세 패널을 다시 열어 "연결 대상 이름이 바뀌었어요" 경고 확인
  - [x] 다른 계정으로 같은 프로젝트의 버튼-액션 대상으로 다른 프로젝트의 화면 UUID를 직접 API 호출로 넣어보는 것은 범위 밖(현재 UI로는 불가능하므로 서버 검증만 코드 리뷰로 확인)
  - [x] `npm run build`, `npm run lint`, `npm run depcruise` 통과
  - [x] 검증에 사용한 테스트 데이터 정리

## Dev Notes

- **`button_action`은 Story 3.1이 의도적으로 미룬 테이블이다** — 지금 만든다(YAGNI 해소 시점).
- **`targetScreenId`의 FK는 `onDelete` 지정 없이(RESTRICT) 둔다** — AD-3이 "참조가 남아있는 화면은 하드 삭제를 막는다"고 못박았는데, 이 규칙을 지키려면 DB가 기본적으로 삭제를 막아줘야 한다(애플리케이션 레벨에서만 막으면 우회 경로가 생긴다). 화면 하드 삭제 자체는 Story 3.7 범위이므로 이번 스토리는 FK 제약만 걸어두고 실제 삭제 플로우는 구현하지 않는다.
- **깨진 링크/이름변경 경고는 순수 파생 계산이다** — DB에 상태를 저장하지 않고, 조회 시점에 `allScreens`와 `button_action.target_screen_id`/`target_page_id_snapshot`을 비교해서만 계산한다(AD-4). 두 경고는 동시에 뜨지 않는다 — 깨진 링크가 우선.
- **화면 격리(quarantined) 전환 로직은 Story 3.7이 구현한다** — 이번 스토리는 그 상태를 "해석"만 한다(배지 계산). 검증 시 격리 상태를 재현할 UI가 없으므로 DB를 직접 조작해 확인한다.
- **페이지ID 선택기는 네이티브 `<select>`로 단순화한다** — `EXPERIENCE.md`가 描사하는 WAI-ARIA Combobox(검색+자동완성) 패턴이 이상적이지만, 이번 스토리의 핵심 AC(자유 텍스트 금지, 드롭다운에서만 선택)는 네이티브 select로도 충분히 만족된다. 프로젝트당 화면 수가 많아지면(수백 개) select가 UX상 불편해질 수 있으나 그건 검색 가능한 콤보박스로 개선할 때(Phase 2 후보)의 이야기다. 드래그 정렬을 화살표 버튼으로 단순화한 기존 관례(Story 2.3)와 같은 결의 판단.
- **기능정의 3만자 제한**은 `domain/screen/func-def-limit.ts`에 상수로 두고 서버 검증과 클라이언트 `maxLength` 양쪽이 같은 값을 참조한다(메뉴코드 예약어 상수를 UI/서버가 공유한 AD-2 관례와 동일).
- **버튼-액션 추가/수정/삭제는 전부 `screen.func_def_source`를 `'manual'`로 전환한다** — AC #1이 "버튼 항목을 추가하면... 이 화면의 기능정의 항목은 수정됨 상태로 바뀐다"고 명시했으므로, 텍스트 diff 판정(AD-5)과 별개로 구조적 변경 시 직접 플래그를 세팅한다.
- **테스트 프레임워크 없음** — `npm run build`+`lint`+`depcruise`+브라우저 실측(+ DB 직접 조작으로 격리/이름변경 시나리오 재현)으로 검증한다.

### References

- [Source: epics.md#Story 3.3, #FR-10, #FR-11, #NFR-8]
- [Source: ARCHITECTURE-SPINE.md#AD-3] — 화면 격리, `screen_role` 매칭키
- [Source: ARCHITECTURE-SPINE.md#AD-4] — `button_action.target_screen_id`(UUID FK) + `target_page_id_snapshot`, 깨진 링크/이름변경 파생 계산
- [Source: ARCHITECTURE-SPINE.md#AD-5] — `func_def_source` 필드 단위 판정
- [Source: EXPERIENCE.md] — 화면 상세 패널(우측 슬라이드인, Esc로 닫힘+포커스 복귀), 페이지ID 선택기(콤보박스 — 이번 스토리는 select로 단순화), 글자수 초과 경고
- [Source: DESIGN.md] — status-badge danger("깨진 링크")/warning("이름 변경") 변형
- [Source: 3-1-generate-screens-from-menus.md] — `button_action` 테이블을 이번 스토리에서 만들기로 예고한 지점
- [Source: 3-2-edit-page-id-and-page-name.md] — `updateScreenFields` 확장 대상, timestamp precision 이슈 재발 방지

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- **버그 발견 및 수정**: `ScreenListItem`의 "자동생성"/"수정됨" 배지가 `pageIdSource`/`pageNameSource`만 확인하고 `funcDefSource`를 빠뜨려, 기능정의를 수정해도 화면 리스트에서 "자동생성"으로 잘못 표시됐다. `isModified` 판정에 `funcDefSource === "manual"`을 추가해 수정.
- 브라우저 자동화로 프로젝트 생성 → 메뉴 2개 → 화면 2개 생성 → 상세 패널에서 기능정의 작성(34자) 저장 → "수정됨" 배지 확인 → 버튼-액션 추가(드롭다운으로만 대상 선택, 자유 텍스트 없음) 확인
- 대상 화면의 페이지ID를 Story 3.2 기능으로 변경 → "연결 대상 이름이 바뀌었어요" 경고 확인
- 대상 화면을 DB에서 직접 `quarantined`로 전환(격리 UI는 Story 3.7 범위라 아직 없음) → "깨진 링크" 배지 확인(이름변경 경고보다 우선 노출됨을 확인) → select에 삭제/격리된 스냅샷이 비활성 옵션으로 남아 있어 선택기가 비지 않음을 확인
- 대상을 다시 `active`로 되돌린 뒤 select를 재확정(다시 연결) → `targetPageIdSnapshot`이 갱신되어 이름변경 경고가 사라짐을 확인
- 기능정의 정확히 30,000자 저장 성공, `maxLength`로 그 이상 입력 자체가 막히는지 확인
- 테스트 데이터 정리 중 프로젝트 삭제가 `button_action_target_screen_id_screen_id_fk` 제약(23503)으로 실패 — 의도한 AD-3 RESTRICT 동작이 실제로 작동함을 재확인. `button_action`을 먼저 지운 뒤 프로젝트를 삭제해 정리 완료

### Completion Notes List

- `button_action.target_screen_id`는 `onDelete` 지정 없음(RESTRICT)으로 생성 — AD-3이 요구한 "참조가 남아있는 화면은 하드 삭제 금지"를 DB 레벨에서 강제. 정리 스크립트로 실제 삭제 시도 시 제약 위반이 발생해 동작을 검증할 수 있었다
- 깨진 링크/이름변경 경고는 DB에 저장하지 않는 순수 파생 계산(`allScreens`와 `button_action` 비교) — 화면 격리(quarantined) 전환 로직 자체는 Story 3.7 범위이므로 이번 스토리는 그 상태를 해석만 한다
- 페이지ID 선택기는 EXPERIENCE.md의 WAI-ARIA Combobox 대신 네이티브 `<select>`로 단순화(자유 텍스트 금지 요건은 동일하게 만족) — Story 2.3의 드래그→화살표 버튼 단순화와 같은 결의 판단
- 버튼-액션 추가/재연결/삭제는 전부 `screen.func_def_source`를 `'manual'`로 전환(AC #1)
- `MAX_FUNC_DEF_LENGTH`(30,000)를 `domain/screen/func-def-limit.ts` 상수로 두어 서버 검증과 클라이언트 `maxLength`가 같은 값을 참조

### File List

- `db/schema.ts` (수정 — `button_action` 테이블 + 관계 추가)
- `drizzle/0008_many_mikhail_rasputin.sql`, `drizzle/meta/0008_snapshot.json`, `drizzle/meta/_journal.json` (신규/수정)
- `domain/screen/button-action.ts`, `domain/screen/func-def-limit.ts` (신규)
- `domain/ports/button-action-repository.ts` (신규)
- `domain/ports/screen-repository.ts` (수정 — `ScreenFieldsPatch`에 funcDef 필드 추가, `setFuncDefSourceManual` 추가)
- `adapters/repository/drizzle/button-action-repository.ts` (신규)
- `adapters/repository/drizzle/screen-repository.ts` (수정 — `setFuncDefSourceManual` 구현)
- `application/add-button-action.ts`, `update-button-action.ts`, `delete-button-action.ts`, `get-project-screens-detail.ts` (신규)
- `application/update-screen-fields.ts` (수정 — funcDef 지원 + 30,000자 제한)
- `app/(app)/dashboard/[projectId]/screens/screens-view.tsx`, `screen-detail-panel.tsx` (신규)
- `app/(app)/dashboard/[projectId]/screens/update-func-def-action.ts`, `add-button-action-action.ts`, `update-button-action-action.ts`, `delete-button-action-action.ts` (신규)
- `app/(app)/dashboard/[projectId]/screens/page.tsx` (수정 — `getProjectScreensDetail` + `ScreensView` 사용)
- `app/(app)/dashboard/[projectId]/screens/screen-list-item.tsx` (수정 — "상세" 버튼 추가, `isModified`에 `funcDefSource` 반영)
