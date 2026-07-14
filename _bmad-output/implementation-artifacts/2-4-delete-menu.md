---
baseline_commit: e1c4543
---

# Story 2.4: 메뉴 삭제하기

Status: review

## Story

As a 메뉴 구조를 정리 중인 사용자,
I want 더 이상 필요 없는 메뉴를 삭제하기를,
so that 메뉴 목록을 깔끔하게 유지할 수 있다.

## Acceptance Criteria

1. **Given** 화면이 아직 생성되지 않은 프로젝트(Epic 3 이전 단계) **When** 메뉴를 삭제하면 **Then** 해당 메뉴가 목록에서 제거된다.
2. **Given** 삭제를 확정하기 전 **When** 삭제 버튼을 누르면 **Then** "이 메뉴를 삭제하시겠어요?"라는 확인 절차를 거친다.

## Tasks / Subtasks

- [x] Task 1: Repository/포트 — 삭제 (AC: #1)
  - [x] `domain/ports/menu-repository.ts`에 `delete(projectId: string, menuId: string): Promise<void>` 추가 — Story 2.3의 `update`/`updateSortOrder`와 동일하게 `WHERE id = menuId AND project_id = projectId`로 스코프
  - [x] `adapters/repository/drizzle/menu-repository.ts`에 구현

- [x] Task 2: Application Service (AC: #1)
  - [x] `application/delete-menu.ts` 신규 — `deleteMenu(projectId, menuId)`: `withProjectAuth(projectId, () => drizzleMenuRepository.delete(projectId, menuId))`

- [x] Task 3: UI — 삭제 버튼 + 확인 다이얼로그 (AC: #1, #2)
  - [x] `app/(app)/dashboard/[projectId]/menus/delete-menu-action.ts` 신규 — `'use server' deleteMenuAction(projectId, menuId)`: `deleteMenu()` 호출 후 `revalidatePath('/dashboard/{projectId}/menus')`
  - [x] `app/(app)/dashboard/[projectId]/menus/menu-list-item.tsx` 수정 — 조회 모드의 액션 영역("수정" 버튼 옆)에 "삭제" 버튼 추가. `app/(app)/dashboard/delete-project-button.tsx`와 동일한 패턴: `<form action={deleteMenuAction.bind(null, projectId, menu.id)} onSubmit={(e) => { if (!confirm("이 메뉴를 삭제하시겠어요?")) e.preventDefault(); }}>` — 별도 컴포넌트로 분리하지 않고 같은 파일 안에 인라인으로 추가(이미 클라이언트 컴포넌트이고 재사용처가 한 곳뿐)
  - [x] `Button variant="destructive" size="sm"` 스타일 사용(`delete-project-button.tsx`와 동일)

- [x] Task 4: 검증 (AC: #1, #2)
  - [x] 메뉴 삭제 버튼 클릭 → `window.confirm` 다이얼로그가 뜨는지 확인(브라우저 자동화에서는 `confirm`을 오버라이드해 우회 — `1-5-manage-project-list.md` Debug Log 참고)
  - [x] 확인 후 목록에서 해당 메뉴가 사라지고 새로고침해도 유지되는지 확인
  - [x] 다른 계정으로 로그인해 남의 프로젝트의 메뉴 id로 삭제 시도 시 실패하는지 확인(`withProjectAuth` + `project_id` 스코프)
  - [x] `npm run build`, `npm run lint`, `npm run depcruise` 통과
  - [x] 검증에 사용한 테스트 계정/프로젝트/메뉴 데이터 정리

## Dev Notes

- **이번 스토리는 하드 삭제가 맞다** — AC #1이 명시하듯 "화면이 아직 생성되지 않은 프로젝트" 한정이다. 메뉴 삭제 시 화면을 "격리"만 하고 하드 삭제하지 않는 규칙(`ARCHITECTURE-SPINE.md#AD-3`)은 Screen 엔티티가 생기는 Epic 3 Story 3.7의 범위다. 지금은 Screen이 없으므로 메뉴 row를 그냥 삭제해도 안전하다 — 격리 로직을 미리 만들지 않는다(YAGNI).
- **`sortOrder` 재정렬 불필요** — 메뉴를 삭제해도 남은 메뉴들의 `sortOrder` 값을 다시 채울 필요 없다. 정렬은 상대적 순서만 보장하면 되고(Story 2.3), 중간값이 비어도 `ORDER BY sort_order ASC` 결과는 정확하다.
- **`delete-project-button.tsx`의 확인 다이얼로그 패턴 그대로 재사용** — `confirm()` 후 `e.preventDefault()`로 취소 처리, 폼 제출은 서버 액션으로. 새로운 다이얼로그 컴포넌트를 만들지 않는다.
- **`menu-list-item.tsx`는 이미 클라이언트 컴포넌트** — Story 2.3에서 `useState`(isEditing)와 `useActionState`(수정 폼)를 쓰고 있다. 삭제 버튼의 `onSubmit` 핸들러도 이 파일 안에 그대로 추가하면 된다.
- **테스트 프레임워크 없음** — Story 1.1~2.3과 동일하게 `npm run build`+`lint`+`depcruise`+브라우저 실측(그리고 `window.confirm` 오버라이드)으로 검증한다.

### Project Structure Notes

```
{repo-root}/
  domain/
    ports/menu-repository.ts              # 수정 — delete() 추가
  adapters/
    repository/drizzle/menu-repository.ts # 수정
  application/
    delete-menu.ts                        # 신규
  app/(app)/
    dashboard/[projectId]/menus/
      delete-menu-action.ts               # 신규
      menu-list-item.tsx                  # 수정 — 삭제 버튼 + confirm
```

### References

- [Source: epics.md#Story 2.4, #Epic 2]
- [Source: ARCHITECTURE-SPINE.md#AD-3] — 메뉴 삭제 시 화면 격리 규칙은 Screen이 생기는 Epic 3부터 적용, 이번 스토리는 해당 없음
- [Source: app/(app)/dashboard/delete-project-button.tsx, actions.ts] — `confirm()` + fire-and-forget 서버 액션 패턴
- [Source: 2-3-reorder-and-edit-menu.md] — `menu-list-item.tsx` 현재 구조, `project_id` 스코프 삭제/수정 쿼리 패턴

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run build` — 성공
- `npm run lint` — 통과(수정 없이 최초 통과)
- `npm run depcruise` — "no dependency violations found (32 modules, 49 dependencies cruised)"
- 브라우저 실측: 신규 계정으로 프로젝트/메뉴 생성 → `window.confirm`을 `() => false`로 오버라이드 후 "삭제" 클릭 → 정확히 "이 메뉴를 삭제하시겠어요?" 문구로 호출됨을 확인, 메뉴는 그대로 남음(AC #2, 취소 경로) → `window.confirm`을 `() => true`로 오버라이드 후 재클릭 → "첫 메뉴를 추가해 보세요" 빈 상태로 전환, 새로고침 후에도 삭제 유지 확인(AC #1)
- 콘솔 에러 없음
- 검증에 사용한 테스트 계정/프로젝트/메뉴 데이터는 Neon에서 직접 삭제해 정리 완료

### Completion Notes List

- Story 2.1~2.3에서 확립한 `WHERE id = menuId AND project_id = projectId` 스코프 패턴을 `delete()`에도 동일하게 적용 — 별도 소유권 확인 쿼리 없이 단일 쿼리로 이중 인가.
- 메뉴 삭제는 이번 스토리 범위에서 하드 삭제가 맞다(Screen 엔티티가 아직 없어 격리 로직이 의미가 없음) — Epic 3 Story 3.7에서 화면이 생기면 그때 격리 규칙(AD-3)을 추가한다.
- `delete-project-button.tsx`의 `confirm()` + fire-and-forget 폼 패턴을 그대로 재사용, 새 컴포넌트를 만들지 않고 이미 클라이언트 컴포넌트인 `menu-list-item.tsx`에 인라인으로 추가.

### File List

- `domain/ports/menu-repository.ts` (수정 — `delete()` 추가)
- `adapters/repository/drizzle/menu-repository.ts` (수정)
- `application/delete-menu.ts` (신규)
- `app/(app)/dashboard/[projectId]/menus/delete-menu-action.ts` (신규)
- `app/(app)/dashboard/[projectId]/menus/menu-list-item.tsx` (수정 — 삭제 버튼 + confirm)
