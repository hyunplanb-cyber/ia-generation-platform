---
baseline_commit: 0fa031a4ed0acda05eeb4cab852e5eb11ad92e53
---

# Story 2.1: 메뉴 추가하기

Status: review

## Story

As a 프로젝트를 준비 중인 사용자,
I want 메뉴명(한글/영문)·설명·원하는 기능을 입력해 메뉴를 추가하기를,
so that 사이트에 어떤 메뉴들이 필요한지 정리할 수 있다.

## Acceptance Criteria

1. **Given** 프로젝트의 메뉴 관리 화면 **When** 메뉴명(한글), 메뉴명(영문), 설명, 원하는 기능을 입력해 저장하면 **Then** 메뉴가 목록에 추가된다.
2. **Given** 메뉴가 하나도 없는 프로젝트 **When** 메뉴 관리 화면에 처음 진입하면 **Then** "첫 메뉴를 추가해 보세요" 안내가 보이고, [실행: IA 생성] 버튼은 비활성화되어 있다(`UX-DR9`).

## Tasks / Subtasks

- [x] Task 1: `menu` 테이블/도메인/포트 신설 (AC: #1, #2)
  - [x] `db/schema.ts`에 `menu` 테이블 추가: `id`(uuid, PK, defaultRandom), `projectId`(uuid, FK→`project.id`, `onDelete: 'cascade'`), `nameKo`(text, notNull), `nameEn`(text, notNull), `menuCode`(text, notNull), `description`(text, nullable), `desiredFeatures`(text, nullable), `sortOrder`(integer, notNull, default 0), `createdAt`/`updatedAt`(timestamp, 기존 `project` 테이블과 동일 패턴). 복합 유니크 인덱스 `(project_id, menu_code)`(`ARCHITECTURE-SPINE.md#AD-2`) — Drizzle에서 `uniqueIndex("menu_project_menu_code_idx").on(table.projectId, table.menuCode)`로 구현
  - [x] `menuRelations`: `menu.project`(one), 기존 `projectRelations`에 `menus: many(menu)` 추가
  - [x] `drizzle-kit generate` + `drizzle-kit migrate`로 live Neon DB에 실제 반영(이 프로젝트는 별도 스테이징 DB 없이 항상 live DB에 직접 마이그레이션 — `1-4-create-project.md` 관례)
  - [x] `domain/menu/menu.ts` — `Menu` 엔티티: `{ id, projectId, nameKo, nameEn, menuCode, description: string | null, desiredFeatures: string | null, sortOrder, createdAt, updatedAt }`
  - [x] `domain/ports/menu-repository.ts` — `MenuRepository` 포트: `create(input: CreateMenuInput): Promise<Menu>`, `listByProject(projectId): Promise<Menu[]>`(sortOrder asc 정렬). `CreateMenuInput = { projectId, nameKo, nameEn, menuCode, description: string | null, desiredFeatures: string | null, sortOrder }`
  - [x] `adapters/repository/drizzle/menu-repository.ts` — `drizzleMenuRepository: MenuRepository` 구현. `project-repository.ts`의 `toDomain` 변환 패턴을 그대로 따른다

- [x] Task 2: 메뉴코드 산출(naive) + Application Service (AC: #1)
  - [x] `domain/menu/derive-menu-code.ts` — `deriveMenuCode(nameEn: string): string` = 영문명 앞 2글자를 대문자로. **이번 스토리는 충돌/1글자/예약어(PC·MO) 처리를 하지 않는다 — 그 검증과 수동 입력 UI는 Story 2.2 범위다.** 이 함수는 Story 2.2에서 그대로 재사용되므로 지금 별도 파일로 분리해 둔다(Story 2.2가 이 함수를 감싸 충돌 검사를 추가하는 구조)
  - [x] `application/add-menu.ts` — `addMenu(projectId, input: { nameKo, nameEn, description, desiredFeatures })`: `withProjectAuth(projectId, async (project) => { ... })`로 감싼다(`application/with-project-auth.ts` 재사용 — `1-5-manage-project-list.md`에서 이미 구현됨). 내부에서 `deriveMenuCode(input.nameEn)`로 코드 산출, `listByProject(projectId)`로 현재 메뉴 수를 구해 `sortOrder`(마지막 순번+1)를 정하고 `drizzleMenuRepository.create(...)` 호출
  - [x] `application/list-menus.ts` — `listMenus(projectId)`: `withProjectAuth(projectId, () => drizzleMenuRepository.listByProject(projectId))`

- [x] Task 3: 프로젝트 내 서브내비(설정/메뉴관리) 신설 (AC: #1, #2)
  - [x] `app/(app)/dashboard/[projectId]/layout.tsx` 신설 — `getProjectForEdit(projectId)`로 프로젝트 존재/소유 확인(없으면 `notFound()`), 좌측 서브내비("설정" → `/dashboard/{id}/edit`, "메뉴 관리" → `/dashboard/{id}/menus`) + `{children}`. `EXPERIENCE.md`가 명시한 3항목(설정/메뉴관리/화면리스트) 중 "화면리스트"는 Epic 3에서 라우트가 생길 때 추가한다 — 아직 없는 라우트로 링크를 걸지 않는다(존재하지 않는 링크 금지)
  - [x] 서브내비 아이템은 `DESIGN.md.sidebar-nav-item-active`(현재 라우트 일치 시 `primary-soft` 배경 + `primary-on-soft` 텍스트, `rounded.md`) 스타일. 데스크톱 고정폭 240px(`DESIGN.md` sidebar-width), 이하 해상도는 상단 탭 형태로 축소(기존 `new-project-wizard.tsx`의 반응형 전환 패턴 참고)
  - [x] `app/(app)/dashboard/page.tsx`의 프로젝트 카드에 "메뉴 관리" 링크(`/dashboard/{id}/menus`)를 "수정"/"삭제" 옆에 추가

- [x] Task 4: 메뉴 관리 화면 (AC: #1, #2)
  - [x] `app/(app)/dashboard/[projectId]/menus/page.tsx` — `listMenus(projectId)` 호출. 0개면 `display-sm`: "첫 메뉴를 추가해 보세요." 안내 + [실행: IA 생성] 버튼(항상 표시하되 `disabled`, Epic 3 이전까지는 클릭 핸들러 자체가 없어도 됨 — 시각적 자리만) + 메뉴 추가 폼. 1개 이상이면 메뉴 목록(한글명/영문명/메뉴코드/설명 표시) + 같은 추가 폼
  - [x] `app/(app)/dashboard/[projectId]/menus/menu-form.tsx` — 클라이언트 컴포넌트. 메뉴명(한글) `required`, 메뉴명(영문) `required`(영문/숫자만 허용하도록 `pattern` 정도는 걸어도 되나 서버 검증이 최종 기준), 설명(선택, textarea), 원하는 기능(선택, textarea, placeholder는 `EXPERIENCE.md` L130 예시 참고: "예: 예약하기 — 원하는 날짜/시간에 미용 예약"). 제출 후 폼 초기화(같은 화면에서 연속 추가가 자연스러운 흐름)
  - [x] `app/(app)/dashboard/[projectId]/menus/actions.ts` — `'use server'` `addMenuAction(projectId, formData)`: 필수값 검증(`nameKo`/`nameEn` 빈 값 거부) 후 `addMenu()` 호출, `revalidatePath`로 같은 페이지 갱신(리다이렉트 불필요 — 폼이 그대로 있어야 연속 추가 가능)

- [x] Task 5: 검증 (AC: #1, #2)
  - [x] 신규 프로젝트로 `/dashboard/{id}/menus` 진입 → "첫 메뉴를 추가해 보세요" + 비활성 [실행: IA 생성] 버튼 확인
  - [x] 메뉴명(한글) "회원", 메뉴명(영문) "Member", 설명/원하는기능 입력 후 저장 → 목록에 추가, 메뉴코드 "ME" 자동 부여 확인
  - [x] 메뉴 2개 이상 추가 후 새로고침해도 순서(`sortOrder` asc)가 유지되는지 확인
  - [x] 서브내비에서 "설정"↔"메뉴 관리" 이동이 현재 라우트에 맞게 활성 스타일이 바뀌는지 확인
  - [x] 다른 계정으로 로그인해 남의 프로젝트 `/dashboard/{id}/menus`에 직접 접근 시 404 확인(`withProjectAuth` 재사용 검증)
  - [x] `npm run build`, `npm run lint`, `npm run depcruise` 통과
  - [x] 검증에 사용한 테스트 계정/프로젝트/메뉴 데이터 정리

## Dev Notes

- **메뉴코드 충돌/1글자/예약어 처리는 이번 스토리 범위가 아니다** — `epics.md`가 Story 2.1(추가)과 2.2(코드 자동산출 실패 처리)를 명시적으로 분리했다. `deriveMenuCode()`를 별도 파일로 분리해 두는 이유는 Story 2.2가 이 함수를 그대로 재사용하며 검증 로직만 감싸 추가하기 위함 — 2.2 작업 시 이 파일을 다시 만들지 말 것.
- **`withProjectAuth` 재사용** — `1-5-manage-project-list.md`에서 이미 구현된 `application/with-project-auth.ts`를 그대로 쓴다. 새로 만들지 않는다(`AD-7`).
- **`sortOrder` 컬럼은 이번 스토리에서 미리 추가한다** — 실제 순서 변경 UI는 Story 2.3이지만, 테이블을 신설하는 지금 컬럼을 함께 넣어야 2.3에서 별도 마이그레이션이 필요 없다. 생성 시 항상 "마지막 순번+1"로 채우면 2.1 범위 안에서는 항상 입력 순서 = 표시 순서.
- **메뉴 삭제(Story 2.4)를 고려한 FK 방향** — `menu.project_id`는 `onDelete: 'cascade'`로 걸어야 `1-5-manage-project-list.md` Task 6이 남긴 메모(프로젝트 삭제 시 메뉴/화면도 함께 정리)가 실제로 성립한다. 이번 스토리에서 반드시 설정할 것.
- **서브내비의 "화면리스트" 항목은 아직 만들지 않는다** — `EXPERIENCE.md`는 3항목(설정/메뉴관리/화면리스트)을 명시하지만 화면 리스트 라우트는 Epic 3에서 생긴다. 존재하지 않는 라우트로 링크를 걸어두면 죽은 링크가 되므로, 지금은 설정/메뉴관리 2항목만 만들고 Epic 3 스토리에서 세 번째 항목을 추가한다.
- **디바이스 대응/반응형**: `DESIGN.md`는 사이드바(프로젝트 내 서브내비)를 `lg+`에서 240px 고정, 그 이하에서 아이콘 전용으로 축소하라고 명시하지만, 이번 스토리는 텍스트 라벨이 있는 2개 항목뿐이라 아이콘 전용 축소 대신 기존 마법사 화면(`new-project-wizard.tsx`)이 쓰는 `sm:flex-col` 반응형 전환 패턴을 재사용해도 무방하다 — 완벽한 아이콘 전용 축소는 화면리스트까지 생기는 Epic 3 시점에 다시 다듬는다.
- **테스트 프레임워크 없음** — 이 프로젝트는 Jest/Vitest 등을 쓰지 않는다(`package.json` 확인 완료). 검증은 `npm run build`+`npm run lint`+`npm run depcruise`+실제 브라우저 테스트로 한다(Story 1.1~1.6 관례 그대로).

### Project Structure Notes

```
{repo-root}/
  db/
    schema.ts                              # 수정 — menu 테이블 추가
  domain/
    menu/
      menu.ts                               # 신규
      derive-menu-code.ts                   # 신규
    ports/
      menu-repository.ts                    # 신규
  adapters/
    repository/drizzle/
      menu-repository.ts                    # 신규
  application/
    add-menu.ts                             # 신규
    list-menus.ts                           # 신규
  app/(app)/
    dashboard/
      page.tsx                              # 수정 — "메뉴 관리" 링크 추가
      [projectId]/
        layout.tsx                          # 신규 — 서브내비(설정/메뉴관리)
        menus/
          page.tsx                          # 신규
          menu-form.tsx                     # 신규
          actions.ts                        # 신규
  drizzle/
    00XX_xxx.sql                            # 신규 마이그레이션 (menu 테이블)
```

### References

- [Source: epics.md#Story 2.1, #Epic 2, #FR-4]
- [Source: ARCHITECTURE-SPINE.md#AD-2] — `menu.menu_code`는 `(project_id, menu_code)` 복합 유니크, 예약어/1글자 규칙은 도메인 상수(Story 2.2에서 사용)
- [Source: ARCHITECTURE-SPINE.md#AD-7] — `withProjectAuth` 재사용
- [Source: ARCHITECTURE-SPINE.md#Structural Seed] — `domain/menu`, `application/`, `adapters/repository/drizzle` 경로 규약
- [Source: EXPERIENCE.md L24, L63, L70, L96, L130] — 메뉴 관리 서브내비 위치, 사이드바 활성 스타일, 빈 상태 문구, 원하는기능 placeholder 예시, 드래그 없이 화살표 버튼(Story 2.3용 사전 인지)
- [Source: DESIGN.md#Layout & Spacing, #sidebar-nav-item-active] — 사이드바 240px, 활성 아이템 스타일
- [Source: 1-5-manage-project-list.md] — `withProjectAuth`, `project-repository.ts` 어댑터 패턴(`toDomain` 변환), 카드 액션 링크 추가 패턴
- [Source: 1-4-create-project.md] — live Neon DB 직접 마이그레이션 관례

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npx drizzle-kit generate` — `menu` 테이블 마이그레이션(`drizzle/0005_happy_betty_brant.sql`) 생성, `npx drizzle-kit migrate`로 live Neon DB에 적용 완료
- `npm run build` — 성공(`/dashboard/[projectId]/menus`가 동적 라우트로 잡힘)
- 최초 구현에서 런타임 에러 발생: `app/(app)/dashboard/[projectId]/layout.tsx`(Server Component)가 `NAV_ITEMS`(lucide-react 아이콘 컴포넌트 포함)를 client component `ProjectSubNav`에 prop으로 전달 → "Functions cannot be passed directly to Client Components" 에러. `NAV_ITEMS` 정의를 `project-sub-nav.tsx` 내부로 옮겨 해결(서버→클라이언트 경계로 컴포넌트 참조를 넘기지 않음)
- `npm run lint` — 통과(수정 없이 최초 통과)
- `npm run depcruise` — "no dependency violations found (28 modules, 42 dependencies cruised)"
- 브라우저 실측(로컬 dev): 신규 계정 가입 → 마법사로 프로젝트 생성 → `/dashboard`카드에 "메뉴 관리" 링크 확인 → `/dashboard/{id}/menus` 빈 상태("첫 메뉴를 추가해 보세요" + 비활성 실행버튼) 확인 → 메뉴 "회원"(Member) 추가 → 목록에 메뉴코드 "ME" 자동 부여 확인 → 메뉴 "상품"(Product) 추가 → 새로고침 후에도 회원→상품 순서 유지 확인 → `/dashboard/{id}/edit`로 이동 시 서브내비 "설정" 항목이 활성 스타일로 전환되는 것을 클래스명으로 확인 → 로그아웃 후 두 번째 계정으로 로그인해 첫 계정 프로젝트의 `/menus` URL 직접 접근 → 404 확인(`withProjectAuth` 정상 차단)
- 검증에 사용한 두 테스트 계정, 프로젝트, 메뉴 데이터는 Neon에서 직접 삭제해 정리 완료

### Completion Notes List

- `menu` 테이블을 신설하며 `sortOrder`(향후 Story 2.3), `onDelete: cascade`(향후 Story 2.4 및 기존 프로젝트 삭제 시 정리)를 미리 반영해 이후 스토리에서 추가 마이그레이션이 필요 없게 했다.
- `deriveMenuCode()`는 충돌/1글자/예약어 검증 없이 "영문명 앞 2글자 대문자"만 수행 — Story 2.2가 이 함수를 그대로 감싸 검증을 추가할 예정이라 지금은 의도적으로 단순하게 유지.
- `withProjectAuth`(`1-5-manage-project-list.md`에서 구현됨)를 그대로 재사용해 `addMenu`/`listMenus`/프로젝트 레이아웃의 인가를 처리 — 새 인가 로직을 만들지 않았다.
- 프로젝트 내 서브내비는 "설정"/"메뉴 관리" 2개만 구현 — "화면 리스트"는 Epic 3에서 라우트가 생길 때 추가(죽은 링크 방지).
- **RSC 경계 버그를 실제로 겪고 고쳤다**: Server Component에서 아이콘 컴포넌트(함수)를 client component에 prop으로 넘기면 안 된다 — 이후 스토리에서 서버→클라이언트로 데이터를 넘길 때 함수/컴포넌트 참조가 섞이지 않았는지 다시 확인할 것.
- `실행: IA 생성` 버튼은 이번 스토리에서 항상 비활성(메뉴 개수와 무관) — 실제 활성화/클릭 동작은 Epic 3 Story 3.1에서 구현.

### File List

- `db/schema.ts` (수정 — `menu` 테이블/관계 추가)
- `drizzle/0005_happy_betty_brant.sql` (신규 마이그레이션)
- `domain/menu/menu.ts` (신규)
- `domain/menu/derive-menu-code.ts` (신규)
- `domain/ports/menu-repository.ts` (신규)
- `adapters/repository/drizzle/menu-repository.ts` (신규)
- `application/add-menu.ts` (신규)
- `application/list-menus.ts` (신규)
- `app/(app)/dashboard/[projectId]/layout.tsx` (신규)
- `app/(app)/dashboard/[projectId]/project-sub-nav.tsx` (신규)
- `app/(app)/dashboard/[projectId]/menus/page.tsx` (신규)
- `app/(app)/dashboard/[projectId]/menus/menu-form.tsx` (신규)
- `app/(app)/dashboard/[projectId]/menus/actions.ts` (신규)
- `app/(app)/dashboard/page.tsx` (수정 — "메뉴 관리" 링크 추가)
