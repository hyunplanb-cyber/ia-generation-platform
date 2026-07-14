---
baseline_commit: f15e5ff
---

# Story 3.1: [실행: IA 생성]으로 화면 목록 자동 만들기

Status: review

## Story

As a 메뉴 구성을 마친 사용자,
I want [실행: IA 생성] 버튼 하나로 메뉴별 필요한 화면 목록이 자동으로 만들어지기를,
so that 화면을 하나하나 손으로 리스트업하지 않아도 된다.

## Acceptance Criteria

1. **Given** 메뉴가 1개 이상 등록된 프로젝트 **When** [실행: IA 생성]을 클릭하면 **Then** 진행 상황을 보여주는 모달이 뜨고, 완료되면 화면 리스트로 이동해 각 메뉴마다 최소 1개 이상의 화면이 생성되어 있다. **And** "장바구니", "회원가입"처럼 알려진 패턴에 맞는 메뉴는 그에 맞는 화면 세트가, 그렇지 않은 메뉴는 기본 화면 세트(1개)가 생성된다. **And** 생성된 화면끼리 페이지ID가 겹치는 경우는 없다. **And** 화면 100개 이상인 프로젝트에서도 생성이 수십 초 안에 끝난다(NFR-3).
2. **Given** IA 생성이 진행 중인 상태 **When** 다시 클릭을 시도하면 **Then** 완료 전까지 버튼이 비활성화되어 중복 실행을 막는다(엑셀 다운로드 버튼 비활성화는 Epic 4에서 다운로드 버튼 자체가 생길 때 함께 반영 — 지금은 다운로드 기능이 없으므로 해당 없음).

## Tasks / Subtasks

- [x] Task 1: `screen` 테이블 신설 — Epic 3 전체가 쓸 전체 컬럼을 한 번에 (AC: #1)
  - [x] `db/schema.ts`에 `screen` 테이블 추가. **이번 스토리가 쓰는 컬럼과 나중 스토리(3.2~3.8)가 쓸 컬럼을 한 마이그레이션에 전부 넣는다** — `menu`/`project` 테이블에 앞서 `sortOrder`/`menuDraft` 등을 미리 넣어둔 관례(`2-1-add-menu.md`, `1-4-create-project.md`) 그대로:
    - `id`(uuid, PK), `projectId`(uuid, FK→project, `onDelete:'cascade'`), `menuId`(uuid, FK→menu, `onDelete:'cascade'`)
    - `pageId`(text, notNull) — `(project_id, page_id)` 복합 유니크 인덱스(`ARCHITECTURE-SPINE.md#AD-2`)
    - `pageName`(text, notNull)
    - `status`(text, notNull, default `'active'`) — `'active' | 'quarantined'`(격리는 Story 3.7)
    - `screenRole`(text, notNull) — 재실행 매칭키(`AD-3`), 이번 스토리가 부여하는 값(`list`/`detail`/`create`/`done` 등 패턴별 태그), Story 3.6이 재실행 매칭에 사용
    - `deviceCode`(text, notNull) — `'PC' | 'MO'`, 이 화면이 어떤 디바이스용인지(반응형 프로젝트는 전부 `'PC'`)
    - `funcDef`(text, nullable) — 화면기능정의(Story 3.3이 채움, 지금은 null)
    - `prompt`(text, nullable) — AI프롬프트(Story 3.4가 채움, 지금은 null)
    - `pageIdSource`/`pageNameSource`/`funcDefSource`/`promptSource`(text, notNull, default `'auto'`) — `'auto' | 'manual'`(`AD-5`)
    - `scheduleStart`/`scheduleEnd`(date, nullable) — Story 3.5가 채움, 지금은 null
    - `scheduleLocked`(boolean, notNull, default `false`)
    - `promptFeedback`(text, nullable) — `'up' | 'down'`(Story 3.8)
    - `createdAt`/`updatedAt`(timestamp, 기존 테이블과 동일 패턴 — `updatedAt`은 `AD-9` 낙관적 동시성 비교 기준으로 이후 스토리에서 쓰임)
  - [x] `domain/screen/screen.ts` — `Screen` 엔티티 타입(위 컬럼 그대로, camelCase)
  - [x] `drizzle-kit generate` + `drizzle-kit migrate`로 live Neon DB에 적용(`1-4-create-project.md` 관례)
  - [x] `button_action` 테이블은 이번 스토리에서 만들지 않는다 — 버튼-이동 연결은 Story 3.3의 범위, 지금 만들면 쓰이지 않는 테이블이 먼저 생긴다(YAGNI)

- [x] Task 2: `ScreenGenerationEngine` 포트 + 규칙기반 어댑터 (AC: #1)
  - [x] `domain/ports/screen-generation-engine.ts` — 포트 계약을 `ARCHITECTURE-SPINE.md#AD-1`이 고정한 시그니처 그대로: `interface ScreenGenerationEngine { generate(input: { project: Pick<Project, 'deviceMode' | 'concept'>; menu: Menu; existingScreens: Screen[] }): ScreenDraft[] }`, `interface ScreenDraft { pageName: string; screenRole: string }`(페이지ID는 여기서 만들지 않는다 — 어댑터는 Repository도 모르고 디바이스 코드 조립도 모른다. Application Service가 조립)
  - [x] `domain/screen/derive-page-id.ts` — `derivePageId(deviceCode: string, menuCode: string, serial: number): string` = `` `${deviceCode}${menuCode}${String(serial).padStart(4, "0")}` ``(예: `PCMR1000`)
  - [x] `adapters/generation/rule-pattern/rule-pattern-engine.ts` — `ScreenGenerationEngine` 구현. 메뉴의 `nameKo`/`nameEn`을 키워드로 매칭(대소문자 무시):
    - **장바구니 패턴**(`nameKo`에 "장바구니" 포함 또는 `nameEn`에 "cart" 포함, 대소문자 무시): 2개 — `{screenRole:"cart-filled", pageName:"{메뉴명 한글} 상품있음"}`, `{screenRole:"cart-empty", pageName:"{메뉴명 한글} 상품없음"}`
    - **회원가입 패턴**("회원가입"/"가입" 포함 또는 "signup"/"register" 포함): 2개 — `{screenRole:"form", pageName:"{메뉴명 한글} 입력"}`, `{screenRole:"done", pageName:"{메뉴명 한글} 완료"}`
    - **게시판 패턴**("게시판"/"커뮤니티" 포함 또는 "board"/"community" 포함): 3개 — `{screenRole:"list", pageName:"{메뉴명 한글} 목록"}`, `{screenRole:"detail", pageName:"{메뉴명 한글} 상세"}`, `{screenRole:"write", pageName:"{메뉴명 한글} 작성"}`
    - **기본(매칭 없음)**: 1개 — `{screenRole:"default", pageName:"{메뉴명 한글}"}`(AC의 "메뉴당 최소 1개" 보장)
    - `existingScreens`는 이번 스토리에서 실질적으로 쓰이지 않는다(항상 빈 배열로 호출됨 — 최초 생성이라). 시그니처에는 포함하되 로직에서 무시해도 된다. Story 3.6이 이 파라미터를 실제로 활용해 재실행 매칭을 구현한다 — 지금 이 파일을 다시 만들지 말 것

- [x] Task 3: Repository (AC: #1)
  - [x] `domain/ports/screen-repository.ts` — `CreateScreenInput`(screen 테이블의 auto 컬럼들: projectId, menuId, pageId, pageName, screenRole, deviceCode), `ScreenRepository { createMany(inputs: CreateScreenInput[]): Promise<Screen[]>; listByProject(projectId): Promise<Screen[]> }`. **`createMany`는 반드시 단일 벌크 INSERT**(Drizzle `.values([...])`에 배열)로 구현 — NFR-3(100개 이상도 수십 초 안)을 만족하려면 화면당 개별 INSERT 왕복을 피해야 한다
  - [x] `adapters/repository/drizzle/screen-repository.ts` 구현. `toDomain()` 변환 패턴은 `menu-repository.ts`와 동일

- [x] Task 4: Application Service (AC: #1)
  - [x] `application/generate-screens.ts` — `generateScreens(projectId)`: `withProjectAuth(projectId, async (project) => { ... })`. 내부 로직:
    1. `listMenus(projectId)`로 메뉴 목록을 가져온다(메뉴 0개면 아무 것도 하지 않고 반환 — UI가 이미 메뉴 0개일 때 버튼을 막아주지만 서비스 레벨에서도 방어)
    2. `project.deviceMode`가 `"responsive"`면 디바이스 코드 배열은 `["PC"]`, `"device-split"`이면 `["PC", "MO"]`
    3. 각 메뉴마다: `rulePatternEngine.generate({ project, menu, existingScreens: [] })`로 `ScreenDraft[]` 획득 → 각 디바이스 코드마다 이 draft 세트를 반복 생성(반응형이면 1세트, 분리형이면 PC/MO 각각) → 각 (메뉴, 디바이스) 조합 안에서 1000부터 시작하는 일련번호로 `derivePageId(deviceCode, menu.menuCode, serial)` 호출해 `pageId` 확정
    4. 모든 메뉴의 모든 화면 입력을 하나의 배열로 모아 `screenRepository.createMany()` **한 번만** 호출(메뉴별로 나눠 호출하지 않는다 — 벌크 삽입 이점을 살리기 위함)

- [x] Task 5: UI — 버튼 활성화 + 진행 모달 + 화면 리스트 화면 신설 (AC: #1, #2)
  - [x] `app/(app)/dashboard/[projectId]/menus/generate-screens-action.ts` 신규 — `'use server' generateScreensAction(projectId)`: `generateScreens(projectId)` 호출 후 `redirect('/dashboard/{projectId}/screens')`(다른 액션들처럼 `next/navigation`의 `redirect` 사용 — `deleteProjectAction.ts` 패턴)
  - [x] `app/(app)/dashboard/[projectId]/menus/generate-screens-button.tsx` 신규 — 클라이언트 컴포넌트. `useTransition`으로 `generateScreensAction.bind(null, projectId)`를 감싸 호출(React 19 `useActionState` 밖에서 액션을 부를 때 반드시 `startTransition`으로 감싸야 하는 규칙 — 이전 세션에서 겪은 버그, `new-project-wizard.tsx` 참고). `pending`이 `true`인 동안 버튼 `disabled` + 전체화면 오버레이(반투명 배경 + 스피너 + "화면을 생성하고 있어요..." 문구)를 렌더링해 진행 모달 역할을 한다(AC #1의 "진행 상황을 보여주는 모달"). 성공하면 서버 액션의 `redirect()`가 페이지 전환을 일으켜 오버레이가 자연히 사라진다
  - [x] `app/(app)/dashboard/[projectId]/menus/page.tsx` 수정 — 기존 `disabled` 고정 버튼을 `GenerateScreensButton`으로 교체. `menus.length === 0`이면 여전히 비활성(문구는 "메뉴를 1개 이상 추가하면 사용할 수 있어요" 유지), 1개 이상이면 활성화
  - [x] `app/(app)/dashboard/[projectId]/screens/page.tsx` 신규 — `listScreens(projectId)`(Task 4의 리스트 조회, 신규 `application/list-screens.ts` — `withProjectAuth(projectId, () => screenRepository.listByProject(projectId))`) 호출해 화면을 표(또는 카드 목록)로 보여준다. 컬럼: 소속 메뉴명, 페이지ID(`DESIGN.md.page-id-cell` 스타일 — Story 2.x에서 메뉴코드 배지에 쓴 `rounded-sm bg-pastel-lavender ... font-mono` 그대로 재사용), 페이지명, "자동생성" 중립 배지(`bg-neutral-badge-soft text-neutral-badge`, `rounded-full` — `globals.css`에 이미 정의된 토큰, `DESIGN.md` 상태배지 규칙). 화면이 0개면 "아직 생성된 화면이 없어요. 메뉴 관리에서 [실행: IA 생성]을 눌러주세요." + 메뉴 관리로 가는 링크
  - [x] `app/(app)/dashboard/[projectId]/project-sub-nav.tsx` 수정 — 서브내비에 "화면 리스트"(→ `/dashboard/{id}/screens`) 3번째 항목 추가(`2-1-add-menu.md` Dev Notes에서 "화면리스트 라우트가 생기면 추가" 예고한 지점)
  - [x] `app/(app)/dashboard/page.tsx` 수정 — 카드의 "화면 0개" 하드코딩 문구를 실제 화면 수로 교체. `listMyProjects()`가 반환하는 프로젝트별로 화면 수를 세야 하는데, 카드 목록 전체를 위해 프로젝트마다 개별 쿼리를 날리면 N+1이 되므로 `application/list-my-projects.ts` 또는 새 서비스에서 프로젝트ID 배열로 화면 수를 한 번에 집계하는 방법을 쓴다 — 가장 간단한 방법은 `screenRepository`에 `countByProjectIds(projectIds: string[]): Promise<Record<string, number>>` 추가(단일 `GROUP BY project_id` 쿼리)

- [x] Task 6: 검증 (AC: #1, #2)
  - [x] 메뉴 4개(장바구니/회원가입/게시판/기타이름 각 1개씩) 등록 → [실행: IA 생성] 클릭 → 완료 후 `/screens`로 자동 이동 확인
  - [x] 화면 리스트에 장바구니 메뉴는 2개(상품있음/상품없음), 회원가입 메뉴는 2개(입력/완료), 게시판 메뉴는 3개(목록/상세/작성), 기타 메뉴는 1개(메뉴명 그대로) 생성됐는지 확인 — 총 8개
  - [x] 페이지ID가 모두 서로 다른지(예: `PCMR1000` 형태) 확인, 대시보드 카드의 "화면 N개"가 8로 바뀌었는지 확인
  - [x] 서브내비에 "화면 리스트" 항목이 추가돼 있고 클릭 시 이동하는지 확인
  - [x] 메뉴 없이(0개)일 때 메뉴관리에서 실행 버튼이 비활성 상태인지 확인
  - [x] 다른 계정으로 로그인해 남의 프로젝트의 `/screens`에 직접 접근 시 404 확인(`withProjectAuth` 재사용)
  - [x] `npm run build`, `npm run lint`, `npm run depcruise` 통과
  - [x] 검증에 사용한 테스트 계정/프로젝트/메뉴/화면 데이터 정리

## Dev Notes

- **`screen` 테이블은 이번에 전체 컬럼을 확정한다** — Epic 3의 나머지 7개 스토리가 전부 이 한 테이블을 다룬다. Story 3.2~3.8을 만들 때 이 테이블에 컬럼을 추가하는 마이그레이션이 또 생기면 안 된다. `funcDef`/`prompt`/`schedule*`/`promptFeedback`은 지금 전부 `nullable`로 만들어두고 이번 스토리는 채우지 않는다.
- **`ScreenGenerationEngine` 포트 시그니처는 Architecture Spine이 이미 고정했다** — `existingScreens`를 지금 안 쓴다고 파라미터를 빼면 안 된다. Story 3.6이 그대로 이 시그니처를 재사용해 재실행 로직을 구현한다.
- **패턴 3종(장바구니/회원가입/게시판)은 Architecture Spine의 Deferred 목록이 명시한 정확히 그 범위다** — "커머스/회원/게시판 외 패턴 추가는 미정"이라고 못 박아뒀으니 이 스토리에서 패턴을 더 늘리지 않는다.
- **디바이스 코드 배정**: `project.deviceMode === "responsive"`면 모든 화면이 `deviceCode: "PC"` 하나로, `"device-split"`이면 같은 화면 세트가 PC/MO 두 벌로 생성된다(화면 수가 2배가 됨 — AC의 "화면 100개 이상" 테스트 시 이 배수를 고려).
- **일련번호는 (메뉴, 디바이스) 조합마다 1000부터** — 메뉴코드가 이미 프로젝트 내 유일하므로 `{deviceCode}{menuCode}` 조합 자체가 유일, 그 안에서 1000, 1001... 순증가만 하면 `page_id` 전체가 자동으로 유일해진다. 별도의 전역 카운터나 DB 시퀀스가 필요 없다.
- **엑셀 다운로드 버튼 비활성화(AC #2 후반부)는 이번 스토리 범위 밖** — 다운로드 버튼 자체가 Epic 4에서 생긴다. 지금은 "실행 버튼 자체의 중복 클릭 방지"만 구현하고, Epic 4 스토리 작성 시 다운로드 버튼에 생성 진행 상태를 연결하는 것을 잊지 않도록 그때 Dev Notes에 다시 남긴다.
- **대시보드 카드 "화면 수" N+1 주의** — 카드 목록에서 프로젝트마다 개별 카운트 쿼리를 날리지 말 것. `GROUP BY project_id`로 한 번에 집계.
- **`redirect()`는 서버 액션 안에서 예외를 던지는 방식으로 동작** — `generateScreensAction`이 `generateScreens()` 완료 후 `redirect()`를 호출하면 Next.js가 이를 캐치해 네비게이션을 트리거한다. try/catch로 감싸 `redirect`의 예외를 삼키지 않도록 주의(`deleteProjectAction.ts`가 이미 이 패턴을 쓰고 있으니 그대로 참고).
- **`useTransition`으로 액션을 감쌀 것** — 버튼 `onClick`에서 서버 액션을 직접 호출하면 "async function with useActionState was called outside of a transition" 류의 문제가 재발할 수 있다(`new-project-wizard.tsx`에서 이미 겪은 버그, Dev Notes에 기록됨). `startTransition(() => { generateScreensAction(projectId); })` 형태로 호출.
- **테스트 프레임워크 없음** — Epic 1/2와 동일하게 `npm run build`+`lint`+`depcruise`+브라우저 실측으로 검증한다.

### Project Structure Notes

```
{repo-root}/
  db/
    schema.ts                                    # 수정 — screen 테이블 추가
  domain/
    screen/
      screen.ts                                  # 신규
      derive-page-id.ts                          # 신규
    ports/
      screen-generation-engine.ts                # 신규
      screen-repository.ts                       # 신규
  adapters/
    generation/rule-pattern/
      rule-pattern-engine.ts                      # 신규
    repository/drizzle/
      screen-repository.ts                       # 신규
  application/
    generate-screens.ts                          # 신규
    list-screens.ts                               # 신규
  app/(app)/
    dashboard/
      page.tsx                                    # 수정 — 화면 수 실제 카운트
      [projectId]/
        project-sub-nav.tsx                        # 수정 — "화면 리스트" 항목 추가
        menus/
          page.tsx                                  # 수정 — GenerateScreensButton으로 교체
          generate-screens-action.ts                # 신규
          generate-screens-button.tsx                # 신규
        screens/
          page.tsx                                   # 신규
  drizzle/
    00XX_xxx.sql                                  # 신규 마이그레이션 (screen 테이블)
```

### References

- [Source: epics.md#Story 3.1, #Epic 3, #FR-7, #NFR-3]
- [Source: ARCHITECTURE-SPINE.md#AD-1] — `ScreenGenerationEngine` 포트 계약, 어댑터가 Repository 직접 호출 금지
- [Source: ARCHITECTURE-SPINE.md#AD-2] — `page_id` 형식/유니크 스코프
- [Source: ARCHITECTURE-SPINE.md#AD-3] — `screen_role` 재실행 매칭키(Story 3.6 예고)
- [Source: ARCHITECTURE-SPINE.md#AD-5] — `*_source` 필드
- [Source: ARCHITECTURE-SPINE.md#Deferred] — 패턴 라이브러리는 커머스/회원/게시판 3종 확정, 확장은 미정
- [Source: EXPERIENCE.md] — "[실행: IA 생성]" 진행 모달 + 완료 시 화면 리스트 이동, 화면 0개는 "발생하지 않아야 함"
- [Source: DESIGN.md] — page-id-cell(모노스페이스+라벤더 워시), 중립 배지(`neutral-badge`)
- [Source: 2-1-add-menu.md, 1-5-manage-project-list.md] — `withProjectAuth` 재사용, "화면 수 0" 하드코딩을 여기서 실제로 고침, "화면리스트" 서브내비를 여기서 추가
- [Source: app/(app)/dashboard/new/new-project-wizard.tsx] — `useTransition` + 서버 액션 호출 패턴(이전 버그 회피)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- 브라우저 자동화로 신규 계정 가입 → 프로젝트 생성 → 메뉴 4개(장바구니/회원가입/게시판/공지사항) 등록 → [실행: IA 생성] → `/screens` 자동 이동까지 실측
- 생성된 페이지ID: `PCBO1000/1001/1002`(게시판 3개), `PCCA1000/1001`(장바구니 2개), `PCNO1000`(공지사항 1개), `PCSI1000/1001`(회원가입 2개) — 총 8개, 전부 유일
- 대시보드 카드 "화면 8개" 반영 확인
- 두 번째 계정으로 로그인해 첫 계정 프로젝트의 `/screens` 직접 접근 시 404 확인
- 삭제 확인 다이얼로그(`confirm()`)가 브라우저 자동화 도구를 블로킹해 UI로 정리하지 못함 — 대신 Drizzle로 테스트 계정/프로젝트(cascade로 메뉴·화면 포함) 직접 삭제해 정리

### Completion Notes List

- `screen` 테이블을 Epic 3 전체가 쓸 컬럼까지 한 번에 마이그레이션(`drizzle/0006_huge_makkari.sql`)해 이후 스토리에서 추가 마이그레이션이 필요 없도록 함
- `ScreenGenerationEngine`/`ScreenDraft` 시그니처는 Architecture Spine이 고정한 그대로 유지, `existingScreens`는 이번 스토리에서 사용하지 않지만 파라미터 보존(Story 3.6 대비)
- 패턴 매칭은 장바구니/회원가입/게시판 3종 + 기본값으로 한정(Architecture Spine Deferred 목록 범위 준수)
- `createMany`는 단일 벌크 INSERT로 구현(NFR-3)
- 대시보드 "화면 N개"는 `countByProjectIds`(단일 GROUP BY 쿼리)로 N+1 없이 집계
- AC #2 후반부(엑셀 다운로드 버튼 비활성화)는 Epic 4에서 다운로드 버튼이 생길 때 반영 예정 — 이번 스토리 범위 아님

### File List

- `db/schema.ts` (수정 — `screen` 테이블/관계 추가)
- `drizzle/0006_huge_makkari.sql`, `drizzle/meta/0006_snapshot.json`, `drizzle/meta/_journal.json` (신규/수정)
- `domain/screen/screen.ts`, `domain/screen/derive-page-id.ts` (신규)
- `domain/ports/screen-generation-engine.ts`, `domain/ports/screen-repository.ts` (신규)
- `adapters/generation/rule-pattern/rule-pattern-engine.ts` (신규)
- `adapters/repository/drizzle/screen-repository.ts` (신규)
- `application/generate-screens.ts`, `application/list-screens.ts`, `application/count-screens-by-project.ts` (신규)
- `app/(app)/dashboard/[projectId]/menus/generate-screens-action.ts`, `generate-screens-button.tsx` (신규)
- `app/(app)/dashboard/[projectId]/menus/page.tsx` (수정 — 버튼 교체)
- `app/(app)/dashboard/[projectId]/screens/page.tsx` (신규)
- `app/(app)/dashboard/[projectId]/project-sub-nav.tsx` (수정 — "화면 리스트" 항목 추가)
- `app/(app)/dashboard/page.tsx` (수정 — 실제 화면 수 표시)
