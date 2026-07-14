---
baseline_commit: dd954b5
---

# Story 2.3: 메뉴 순서 바꾸고 내용 수정하기

Status: review

## Story

As a 메뉴를 정리 중인 사용자,
I want 메뉴 순서를 바꾸고 이름/설명/기능을 수정하기를,
so that 실제 사이트 구조에 맞게 메뉴를 다듬을 수 있다.

## Acceptance Criteria

1. **Given** 메뉴가 3개 이상 있는 프로젝트 **When** 위/아래 화살표로 순서를 바꾸면 **Then** 목록에 반영된 순서가 저장된다.
2. **Given** 특정 메뉴 **When** 메뉴명/설명/원하는 기능을 수정하면 **Then** 변경사항이 저장된다(단, 영문 메뉴명을 바꿔 메뉴코드가 달라지는 경우의 처리는 Epic 3에서 다룬다 — 이 스토리는 메뉴코드를 재계산하지 않는다).

## Tasks / Subtasks

- [x] Task 1: Repository/포트 확장 — 수정과 순서 스왑 (AC: #1, #2)
  - [x] `domain/ports/menu-repository.ts`에 `update(projectId: string, menuId: string, input: UpdateMenuInput): Promise<Menu | null>` 추가. `UpdateMenuInput = { nameKo: string; nameEn: string; description: string | null; desiredFeatures: string | null }` — **`menuCode`는 포함하지 않는다**(AC #2: 코드 재계산은 Epic 3 범위). `WHERE id = menuId AND project_id = projectId`로 스코프해 다른 프로젝트의 메뉴를 잘못 수정하는 경로를 원천 차단한다(단일 쿼리로 소유권 검증까지 겸함)
  - [x] `updateSortOrder(projectId: string, menuId: string, sortOrder: number): Promise<void>` 추가 — 마찬가지로 `WHERE id = menuId AND project_id = projectId`
  - [x] `adapters/repository/drizzle/menu-repository.ts`에 두 메서드 구현. `update()`는 `.returning()`이 빈 배열이면(`WHERE` 불일치) `null` 반환

- [x] Task 2: Application Service — 수정 (AC: #2)
  - [x] `application/update-menu.ts` 신규 — `updateMenu(projectId, menuId, input: UpdateMenuInput)`: `withProjectAuth(projectId, () => drizzleMenuRepository.update(projectId, menuId, input))` — 반환이 `null`이면(다른 프로젝트의 메뉴 id를 잘못 넘긴 경우) `MenuNotFoundError`를 던진다(신규 에러 클래스, `with-project-auth.ts`의 `ProjectNotFoundError`와 같은 패턴으로 별도 파일에 정의하거나 이 파일에 정의 — 사용처가 하나뿐이므로 이 파일에 정의해도 무방)

- [x] Task 3: Application Service — 순서 바꾸기 (AC: #1)
  - [x] `application/reorder-menu.ts` 신규 — `reorderMenu(projectId, menuId, direction: "up" | "down")`: `withProjectAuth(projectId, async () => { ... })` 내부에서 `listByProject(projectId)`(sortOrder asc)로 전체 목록을 가져와 `menuId`의 인덱스를 찾고, `direction === "up"`이면 `index - 1`, `"down"`이면 `index + 1`을 스왑 대상 인덱스로 삼는다. 대상 인덱스가 범위를 벗어나면(맨 위에서 위로, 맨 아래에서 아래로) 아무 것도 하지 않고 조용히 반환(방어적 처리 — 실제 UI에서는 해당 화살표 버튼이 아예 안 보이거나 비활성화되므로 정상 경로에서는 발생하지 않음)
  - [x] 스왑 대상이 있으면 두 메뉴의 `sortOrder` 값을 서로 바꿔 `updateSortOrder`를 두 번 호출(트랜잭션 없이 순차 실행 — 이 프로젝트는 Neon serverless HTTP 드라이버를 쓰고 있고, 단일 사용자가 자기 메뉴 순서를 바꾸는 시나리오라 동시성 위험이 낮다. 과설계하지 않는다)

- [x] Task 4: 메뉴 목록 UI — 순서 버튼 + 인라인 수정 (AC: #1, #2)
  - [x] `app/(app)/dashboard/[projectId]/menus/reorder-menu-action.ts` 신규 — `'use server' reorderMenuAction(projectId, menuId, direction)`: `reorderMenu()` 호출 후 `revalidatePath('/dashboard/{projectId}/menus')`
  - [x] `app/(app)/dashboard/[projectId]/menus/update-menu-action.ts` 신규 — `'use server' updateMenuAction(projectId, menuId, prevState, formData)`: `nameKo`/`nameEn` 필수 검증(Story 2.1의 `addMenuAction`과 동일한 문구) 후 `updateMenu()` 호출, 성공 시 `revalidatePath` + `{ error: null, editing: false }`, 실패(빈 값) 시 `{ error: "...", editing: true }`(수정 폼이 계속 열려있게)
  - [x] `app/(app)/dashboard/[projectId]/menus/menu-list-item.tsx` 신규 — 클라이언트 컴포넌트. `menu`, `projectId`, `isFirst`, `isLast`를 props로 받는다. 기본은 조회 모드: 메뉴코드 배지+한글명+영문명+설명(Story 2.1과 동일한 레이아웃) 옆에 ▲(위로, `isFirst`면 렌더 안 함)/▼(아래로, `isLast`면 렌더 안 함) 아이콘 버튼 — 각각 `<form action={reorderMenuAction.bind(null, projectId, menu.id, "up"|"down")}>`(delete-project-button.tsx와 동일한 fire-and-forget 폼 패턴, `useActionState` 불필요)과 "수정" 버튼(로컬 `useState`로 `isEditing` 토글). `isEditing`이면 `useActionState(updateMenuAction.bind(null, projectId, menu.id), ...)`로 감싼 인라인 폼(메뉴명 한글/영문/설명/원하는기능, `defaultValue`로 현재 값 프리필) + "저장"/"취소" 버튼 표시. **`updateMenuAction`이 성공(`editing:false`)하면 `useEffect`로 로컬 `isEditing`을 닫는다**(폼이 액션 상태와 로컬 UI 상태 두 곳에 걸쳐 있으므로 이 동기화를 빠뜨리지 말 것)
  - [x] `app/(app)/dashboard/[projectId]/menus/page.tsx` 수정 — 기존 `<li>` 렌더링을 `<MenuListItem>`으로 교체, 각 메뉴에 `isFirst={i === 0}` `isLast={i === menus.length - 1}` 전달

- [x] Task 5: 검증 (AC: #1, #2)
  - [x] 메뉴 3개 이상(A, B, C 순서) 추가 → 두 번째 메뉴를 위로 이동 → 순서가 B, A, C로 바뀌고 새로고침해도 유지되는지 확인
  - [x] 맨 위 메뉴엔 ▲ 버튼이 없고 맨 아래 메뉴엔 ▼ 버튼이 없는지 확인
  - [x] 특정 메뉴 "수정" 클릭 → 한글명/설명/원하는기능 변경 → 저장 → 목록에 즉시 반영, 메뉴코드는 그대로인지 확인(AC #2 — 코드 불변)
  - [x] 영문명을 바꿔도 메뉴코드가 재계산되지 않고 그대로인지 확인(Epic 3에서 다룰 범위임을 재확인)
  - [x] 다른 계정으로 로그인해 남의 프로젝트의 메뉴 id를 추측해 수정/순서변경 시도 시 실패하는지 확인(`withProjectAuth` + repository의 `project_id` 스코프 이중 확인)
  - [x] `npm run build`, `npm run lint`, `npm run depcruise` 통과
  - [x] 검증에 사용한 테스트 계정/프로젝트/메뉴 데이터 정리

## Dev Notes

- **메뉴코드는 이 스토리에서 절대 바뀌지 않는다** — `update()`의 `UpdateMenuInput`에 `menuCode`를 아예 포함하지 않아 실수로라도 코드를 건드릴 수 없게 타입 레벨에서 막는다. 영문명이 바뀌어 메뉴코드와 어긋나는("신/구 혼재") 상황의 처리는 Epic 3 Story 3.7의 범위다.
- **Repository 쿼리 자체에 `project_id` 스코프를 걸어 이중 인가**: `withProjectAuth`는 "이 프로젝트가 내 것인가"만 확인한다. 메뉴 id 자체가 그 프로젝트 소속인지는 별도로 확인해야 하므로, `update`/`updateSortOrder` 쿼리의 `WHERE` 절에 `project_id`를 직접 걸어 한 번의 쿼리로 처리한다(메뉴를 먼저 조회해서 소속을 확인하는 별도 왕복을 만들지 않는다).
- **트랜잭션 없이 순서 스왑** — Neon serverless(HTTP 드라이버) 환경이고 단일 소유자가 자기 메뉴를 바꾸는 시나리오라 두 번의 순차 UPDATE로 충분하다. Epic 3의 동시 편집 시나리오(AD-9, 낙관적 동시성)와는 성격이 다르므로 여기서 그 패턴을 끌어오지 않는다.
- **Story 2.2에서 확립한 "실패 시 값 보존" 패턴을 재사용할 것** — 인라인 수정 폼에서 저장이 실패하면(현재는 필수값 누락 정도만 실패 가능) `key` 리마운트가 아니라 서버가 반환한 값을 `defaultValue`로 연결하는 방식을 그대로 따른다(`2-2-menu-code-auto-generation.md` Completion Notes 참고).
- **로컬 `isEditing` 상태와 서버 액션 상태의 동기화**: `menu-list-item.tsx`는 "수정 모드 진입/취소"는 로컬 `useState`로, "저장 성공/실패"는 `useActionState`로 각각 다루는 하이브리드 컴포넌트다. 저장 성공 시 로컬 상태도 닫아야 조회 모드로 돌아간다 — 이 연결을 빠뜨리면 저장은 되는데 폼이 계속 열려있는 채로 남는다.
- **테스트 프레임워크 없음** — Story 1.1~2.2와 동일하게 `npm run build`+`lint`+`depcruise`+브라우저 실측으로 검증한다.

### Project Structure Notes

```
{repo-root}/
  domain/
    ports/menu-repository.ts              # 수정 — update(), updateSortOrder() 추가
  adapters/
    repository/drizzle/menu-repository.ts # 수정
  application/
    update-menu.ts                        # 신규
    reorder-menu.ts                       # 신규
  app/(app)/
    dashboard/[projectId]/menus/
      page.tsx                            # 수정 — MenuListItem으로 교체
      menu-list-item.tsx                  # 신규
      reorder-menu-action.ts              # 신규
      update-menu-action.ts               # 신규
```

### References

- [Source: epics.md#Story 2.3, #Epic 2]
- [Source: EXPERIENCE.md L96] — 드래그 없이 위/아래 화살표 버튼으로 순서 변경(MVP)
- [Source: 2-1-add-menu.md, 2-2-menu-code-auto-generation.md] — `withProjectAuth`, `listByProject`, 메뉴 목록 레이아웃, "실패 시 값 보존은 `defaultValue` 연결로" 패턴
- [Source: app/(app)/dashboard/delete-project-button.tsx, actions.ts] — fire-and-forget `<form action={boundServerAction}>` 패턴(순서 변경 버튼에 재사용)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run build` — 성공
- `npm run lint` — 최초 시도에서 `menu-list-item.tsx`가 `react-hooks/set-state-in-effect` 위반(useEffect 안에서 `setIsEditing` 직접 호출) → "렌더 중 이전 상태와 비교해 조정" 패턴(이전 상태를 `useState`로 들고 있다가 렌더 중 비교)으로 교체해 해결
- `npm run depcruise` — "no dependency violations found (31 modules, 47 dependencies cruised)"
- 브라우저 실측: 신규 계정으로 프로젝트 생성 → 메뉴 A(Apple)/B(Banana)/C(Cherry) 순서로 추가 → 첫 메뉴엔 ▲ 없음, 마지막 메뉴엔 ▼ 없음 확인 → B를 위로 이동 → 새로고침 후 B,A,C 순서 유지 확인(AC #1) → B의 "수정" 클릭 → 인라인 폼에 기존 값 프리필 확인 → 영문명을 "Blueberry"로, 설명을 추가해 저장 → 메뉴코드는 "BA" 그대로, 저장 후 폼이 조회 모드로 자동 복귀 확인(AC #2, 코드 불변)
- 검증에 사용한 테스트 계정/프로젝트/메뉴 데이터는 Neon에서 직접 삭제해 정리 완료

### Completion Notes List

- `update()`/`updateSortOrder()` 모두 `WHERE id = menuId AND project_id = projectId`로 스코프해 `withProjectAuth`의 프로젝트 소유권 검증에 메뉴 소속 검증을 얹었다 — 별도 조회 왕복 없이 단일 쿼리로 이중 인가 완료.
- `UpdateMenuInput`에 `menuCode`를 아예 포함하지 않아 타입 레벨에서 코드 재계산을 차단 — 영문명이 바뀌어도 코드는 그대로 유지(Epic 3 Story 3.7에서 다룰 "신/구 혼재" 상황의 전제 조건).
- 순서 변경 버튼은 `delete-project-button.tsx`와 동일한 fire-and-forget `<form action={boundServerAction}>` 패턴 재사용 — `useActionState` 불필요.
- **로컬 UI 상태(`isEditing`)와 서버 액션 상태를 동기화할 때 `useEffect` 대신 "렌더 중 조정" 패턴을 썼다** — React 19의 `react-hooks/set-state-in-effect` 규칙과 충돌하지 않으면서 저장 성공 시 폼이 자동으로 닫히도록 처리. 이 패턴은 Story 2.2의 `defaultValue` 기반 값 보존 패턴과 함께, 이후 유사한 "로컬 편집 모드 + 서버 상태" 컴포넌트에서 재사용할 표준으로 삼는다.

### File List

- `domain/ports/menu-repository.ts` (수정 — `update()`, `updateSortOrder()` 추가)
- `adapters/repository/drizzle/menu-repository.ts` (수정)
- `application/update-menu.ts` (신규)
- `application/reorder-menu.ts` (신규)
- `app/(app)/dashboard/[projectId]/menus/reorder-menu-action.ts` (신규)
- `app/(app)/dashboard/[projectId]/menus/update-menu-action.ts` (신규)
- `app/(app)/dashboard/[projectId]/menus/menu-list-item.tsx` (신규)
- `app/(app)/dashboard/[projectId]/menus/page.tsx` (수정 — `MenuListItem`으로 교체)
