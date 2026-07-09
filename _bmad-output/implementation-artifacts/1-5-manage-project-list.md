---
baseline_commit: 47412a5a3b7d2957166556cb0e68505cb93986b5
---

# Story 1.5: 여러 프로젝트를 목록에서 관리하기

Status: review

## Story

As a 여러 프로젝트를 진행하는 사용자,
I want 내가 만든 프로젝트들을 목록으로 보고, 각각 열람/수정/삭제하기를,
so that 여러 프로젝트를 헷갈리지 않고 관리할 수 있다.

## Acceptance Criteria

1. **Given** 프로젝트 2개 이상을 가진 사용자 **When** 대시보드에 진입하면 **Then** 각 프로젝트가 카드 형태로 나열되고, 화면 수·최근 수정일이 함께 표시된다(`DESIGN.md.summary-card`).
2. **Given** 특정 프로젝트 카드 **When** 프로젝트명/설명/전체일정을 수정하면 **Then** 변경사항이 저장되고 목록에도 즉시 반영된다.
3. **Given** 프로젝트 삭제를 선택함 **When** 삭제를 확정하면 **Then** 프로젝트와 그에 속한 메뉴/화면 데이터가 함께 정리된다(계정 자체 삭제와는 별개 — Story 1.6).

## Tasks / Subtasks

- [x] Task 1: Repository 포트 확장 (AC: #1, #2, #3)
  - [x] `domain/ports/project-repository.ts`에 `listByOwner(ownerId): Promise<Project[]>`(최근 수정일 desc 정렬), `findById(id): Promise<Project | null>`, `update(id, patch: UpdateProjectInput): Promise<Project>`, `delete(id): Promise<void>` 추가. `UpdateProjectInput = { concept, overallStart, overallEnd }`
  - [x] Story 1.4의 `countByOwner`는 제거하고 `listByOwner`로 대체(대시보드가 이제 카운트가 아니라 실제 목록을 그려야 하므로 같은 정보를 얻는 두 경로를 유지할 이유가 없음)
  - [x] `adapters/repository/drizzle/project-repository.ts`에 4개 메서드 구현

- [x] Task 2: `withProjectAuth` 최초 구현 (AC: #2, #3)
  - [x] `application/with-project-auth.ts` — AD-7이 규정한 실제 래퍼: `withProjectAuth<T>(projectId, fn: (project) => Promise<T>): Promise<T>`. `requireSession()`으로 로그인 확인 → `findById(projectId)` → 프로젝트가 없거나 `project.ownerId !== session.user.id`면 `ProjectNotFoundError`를 던짐(다른 사람 프로젝트에 대해 "존재하지 않음/권한없음"을 구분하지 않고 동일하게 취급 — 존재 여부 노출 방지) → 통과하면 `fn(project)` 실행
  - [x] 이 래퍼는 이후 Menu/Screen 관련 Application Service에서도 그대로 재사용된다(Epic 2/3에서)

- [x] Task 3: 나머지 Application Service (AC: #1, #2, #3)
  - [x] `application/list-my-projects.ts` — `listMyProjects()`: `requireSession()` → `listByOwner(session.user.id)`. (Story 1.4의 `application/count-my-projects.ts`는 삭제)
  - [x] `application/get-project-for-edit.ts` — `getProjectForEdit(projectId)`: `withProjectAuth(projectId, async (project) => project)`
  - [x] `application/update-project.ts` — `updateProject(projectId, input: UpdateProjectInput)`: `withProjectAuth(projectId, () => drizzleProjectRepository.update(projectId, input))`
  - [x] `application/delete-project.ts` — `deleteProject(projectId)`: `withProjectAuth(projectId, () => drizzleProjectRepository.delete(projectId))`

- [x] Task 4: 대시보드를 카드 목록으로 교체 (AC: #1)
  - [x] `app/(app)/dashboard/page.tsx` — `listMyProjects()` 호출. 0개면 Story 1.4의 빈 상태 그대로 유지. 1개 이상이면 카드 그리드: 각 카드에 컨셉(제목처럼 앞부분 강조 표시)·전체일정(시작~종료)·화면 수·최근 수정일(`updatedAt`), "수정"/"삭제" 액션. 카드 배경은 `DESIGN.md.summary-card`(파스텔 mint/lavender/yellow 순환 배정)
  - [x] **화면 수는 이번 스토리에서 항상 0으로 표시**한다 — Screen 엔티티가 아직 없다(Epic 3에서 생김). 실제 카운트로 바뀌는 지점은 Epic 3에서 자연히 이어진다. 이 사실을 화면에 숨기지 않되(값 자체는 정직하게 0), 별도 경고문구는 필요 없다

- [x] Task 5: 프로젝트 수정 화면 (AC: #2)
  - [x] `app/(app)/dashboard/[projectId]/edit/page.tsx` — `getProjectForEdit(projectId)`로 기존 값을 불러와 폼에 prefill(컨셉/설명 textarea, 시작일·종료일 date input). 프로젝트가 없거나 내 것이 아니면 `notFound()`
  - [x] `app/(app)/dashboard/[projectId]/edit/actions.ts` — `'use server'` Server Action, `updateProject()` 호출 후 `/dashboard`로 redirect. Story 1.4의 생성 폼과 동일한 검증(필수값, 종료일 ≥ 시작일)

- [x] Task 6: 프로젝트 삭제 (AC: #3)
  - [x] `app/(app)/dashboard/delete-project-button.tsx` — 클라이언트 컴포넌트. `confirm()`으로 "이 프로젝트와 포함된 모든 메뉴·화면이 함께 삭제돼요. 되돌릴 수 없어요."를 확인받은 뒤에만 폼 제출(EXPERIENCE.md Voice and Tone: 근거 없는 단순 확인이 아니라 결과를 명시)
  - [x] `app/(app)/dashboard/actions.ts` — `'use server'` `deleteProjectAction(projectId)`가 `deleteProject()` 호출 후 `/dashboard`로 redirect
  - [x] `db/schema.ts`의 `project` 테이블 FK 관계상, 향후 Epic 2/3에서 `menu`/`screen` 테이블이 `project_id`를 참조할 때 반드시 `onDelete: 'cascade'`를 걸어야 AC #3("메뉴/화면 데이터가 함께 정리된다")이 실제로 성립한다 — 이번 스토리는 이 사실을 Dev Notes에 남겨 Epic 2 스토리가 놓치지 않게 한다(현재는 삭제할 메뉴/화면 자체가 없어 프로젝트 row 삭제만으로 충분)

- [x] Task 7: 검증 (AC: #1~#3)
  - [x] 프로젝트 2개 이상 만든 계정으로 `/dashboard` 진입 → 카드 2장 이상, 각각 화면 수(0)·최근 수정일 표시 확인
  - [x] 카드에서 "수정" → 컨셉/일정 변경 → 저장 → `/dashboard`로 돌아왔을 때 변경사항이 카드에 반영되는지 확인
  - [x] 카드에서 "삭제" → 확인 다이얼로그 → 확정 → 목록에서 사라지고 Neon `project` 테이블에서도 실제로 삭제됐는지 확인
  - [x] 다른 계정으로 로그인해 남의 프로젝트 `edit` URL에 직접 접근 시 `notFound()`(404)로 처리되는지 확인(`withProjectAuth`가 실제로 막는지)
  - [x] `npm run build`, `npm run lint`, `npm run depcruise` 통과
  - [x] 검증에 사용한 테스트 계정/프로젝트 데이터 정리

## Dev Notes

- **`withProjectAuth`가 이번 스토리에서 처음 실제로 쓰인다** — Story 1.4 Dev Notes에서 예고한 대로, "이미 있는 프로젝트를 조회/수정/삭제"하는 시점이라 AD-7의 온전한 형태(존재 여부+소유권을 함께 검사하고, 둘 다 실패 시 구분 없이 동일하게 처리)를 그대로 따른다. 이후 Menu/Screen 관련 서비스들도 이 함수를 재사용한다.
- **낙관적 동시성(AD-9, `updated_at` 기반 409 처리)은 이번 스토리에서 구현하지 않는다** — AD-9는 여러 필드를 부분적으로 고치는 화면 편집(Story 3.x)을 겨냥한 규칙이고, 단일 소유자가 자기 프로젝트의 컨셉/일정을 고치는 이번 스토리엔 동시 편집 충돌 시나리오가 실질적으로 없다. 과도한 설계를 피하고 단순 업데이트로 구현한다.
- **Voice and Tone 원칙 적용**: 삭제 확인 문구는 "정말 삭제하시겠습니까?"처럼 근거 없는 일반 확인이 아니라, 무엇이 함께 사라지는지 명시한다(EXPERIENCE.md L42 패턴).

### Project Structure Notes

```
{repo-root}/
  domain/
    ports/project-repository.ts   # 수정 — listByOwner/findById/update/delete 추가, countByOwner 제거
  adapters/
    repository/drizzle/project-repository.ts  # 수정
  application/
    with-project-auth.ts          # 신규
    list-my-projects.ts           # 신규 (count-my-projects.ts 대체)
    get-project-for-edit.ts       # 신규
    update-project.ts             # 신규
    delete-project.ts             # 신규
    count-my-projects.ts          # 삭제
  app/(app)/
    dashboard/
      page.tsx                     # 수정 — 카드 목록
      actions.ts                    # 신규 — deleteProjectAction
      delete-project-button.tsx     # 신규
      [projectId]/
        edit/
          page.tsx                   # 신규
          actions.ts                  # 신규
```

### References

- [Source: epics.md#Story 1.5]
- [Source: ARCHITECTURE-SPINE.md#AD-7] — `withProjectAuth` 계약
- [Source: DESIGN.md#summary-card, #Shapes] — 카드 스타일(파스텔 워시 순환, `rounded.lg`)
- [Source: EXPERIENCE.md#Voice and Tone] — 삭제 확인 문구 원칙
- [Source: 1-4-create-project.md] — `requireSession`, Server Action 패턴, `project` 테이블 정의 재사용

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run build` — 성공 (`/dashboard`, `/dashboard/[projectId]/edit`가 동적 라우트로 잡힘)
- `npm run lint` — 최초 시도에서 `app/(app)/dashboard/[projectId]/edit/page.tsx`가 "Avoid constructing JSX within try/catch" 에러 발생 → `getProjectForEdit(...).catch(...)`로 재구성해 해결, 재실행 시 통과
- `npm run depcruise` — "no dependency violations found (20 modules, 24 dependencies cruised)"
- 브라우저 실측: 신규 계정으로 프로젝트 2개 생성 → `/dashboard`에서 카드 2장(컨셉/전체일정/화면 0개/최근 수정일) 확인 → 카드 "수정" → 컨셉 변경 후 저장 → 목록에 즉시 반영 확인 → "삭제"(확인 다이얼로그 통과, `window.confirm` 오버라이드로 자동화 테스트) → 목록에서 사라짐, 1개로 감소
- 두 번째 계정으로 로그인해 남은 프로젝트의 `/dashboard/{id}/edit`에 직접 접근 → 404 확인(`withProjectAuth`가 실제로 차단)
- 검증에 사용한 두 테스트 계정과 남은 project row는 Neon에서 직접 삭제해 정리 완료

### Completion Notes List

- `withProjectAuth(projectId, fn)`를 AD-7 그대로 첫 실제 구현 — 프로젝트 미존재/비소유 두 경우 모두 `ProjectNotFoundError`로 동일하게 처리해 존재 여부를 노출하지 않는다. 이 함수는 Epic 2/3의 Menu/Screen 서비스에서도 재사용 예정.
- Story 1.4의 `application/count-my-projects.ts` + `ProjectRepository.countByOwner`는 제거하고 `listMyProjects()` + `listByOwner()`로 대체 — 대시보드가 이제 실제 카드 데이터를 그려야 해서 카운트 전용 경로를 별도로 유지할 이유가 없었음.
- 삭제 확인 문구는 EXPERIENCE.md Voice and Tone 원칙대로 "정말 삭제하시겠습니까?"가 아니라 "이 프로젝트와 포함된 모든 메뉴·화면이 함께 삭제돼요. 되돌릴 수 없어요."로 결과를 명시.
- **화면 수는 이번 스토리에서 항상 0** — Screen 엔티티가 아직 없다(Epic 3). Epic 2/3에서 `menu`/`screen` 테이블을 추가할 때 `project_id` FK에 `onDelete: 'cascade'`를 걸어야 AC #3이 실제 의미를 갖는다 — Dev Notes/Task 6에 명시해 두었다.
- 낙관적 동시성(AD-9, `updated_at` 기반 409)은 이번 스토리 범위 밖으로 명시적으로 제외(단일 소유자 편집이라 충돌 시나리오가 없음).

### File List

- `domain/ports/project-repository.ts` (수정 — `listByOwner`/`findById`/`update`/`delete` 추가, `countByOwner` 제거)
- `adapters/repository/drizzle/project-repository.ts` (수정)
- `application/with-project-auth.ts` (신규)
- `application/list-my-projects.ts` (신규)
- `application/get-project-for-edit.ts` (신규)
- `application/update-project.ts` (신규)
- `application/delete-project.ts` (신규)
- `application/count-my-projects.ts` (삭제)
- `app/(app)/dashboard/page.tsx` (수정 — 카드 그리드)
- `app/(app)/dashboard/actions.ts` (신규 — `deleteProjectAction`)
- `app/(app)/dashboard/delete-project-button.tsx` (신규)
- `app/(app)/dashboard/[projectId]/edit/page.tsx` (신규)
- `app/(app)/dashboard/[projectId]/edit/edit-project-form.tsx` (신규)
- `app/(app)/dashboard/[projectId]/edit/actions.ts` (신규)
