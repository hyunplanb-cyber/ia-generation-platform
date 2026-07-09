---
baseline_commit: 7fbb7de4a32de36c4317a09737cc37df0c6d58fa
---

# Story 1.4: 새 프로젝트 만들기

Status: review

## Story

As a 로그인한 사용자,
I want 프로젝트 컨셉/설명과 전체 일정(시작일·종료일)을 입력해 새 프로젝트를 만들기를,
so that 이 프로젝트 안에서 메뉴와 화면을 준비할 수 있다.

## Acceptance Criteria

1. **Given** 로그인한 사용자가 "새 프로젝트 만들기"를 선택함 **When** 컨셉/설명과 전체 시작일·종료일을 입력하고 저장하면 **Then** 프로젝트가 생성되고 이 사용자 계정에 귀속된다(`project.owner_id`).
2. **And** 이 프로젝트는 본인만 조회할 수 있다 — 다른 계정으로 로그인해 접근해도 보이지 않는다(이번 스토리에서는 생성/카운트 조회로만 검증, 상세 조회 화면은 Story 1.5).
3. **Given** 프로젝트가 아직 하나도 없는 사용자 **When** `/dashboard`에 처음 진입하면 **Then** "첫 프로젝트를 만들어 보세요" 안내와 큰 "새 프로젝트 만들기" 버튼만 보인다(UX-DR9).
4. **Given** 프로젝트를 1개 이상 만든 사용자 **When** `/dashboard`에 다시 진입하면 **Then** 빈 상태 안내 대신 보유 프로젝트 개수를 알 수 있는 문구가 보인다(전체 목록 UI는 Story 1.5의 몫이라 이번 스토리에서는 만들지 않는다).

## Tasks / Subtasks

- [x] Task 1: `Project` 도메인 타입 정의 (AC: #1)
  - [x] `domain/project/project.ts` — `Project`, `DeviceMode`(`'responsive' | 'device-split'`) 타입. **Drizzle이나 Next.js를 import하지 않는 순수 TypeScript**(AD-1)
  - [x] `domain/ports/project-repository.ts` — `ProjectRepository` 인터페이스: `create(input: CreateProjectInput): Promise<Project>`, `countByOwner(ownerId: string): Promise<number>`. `CreateProjectInput`은 `{ ownerId, concept, overallStart, overallEnd, deviceMode }`

- [x] Task 2: `project` 테이블 추가 (AC: #1)
  - [x] `db/schema.ts`에 `project` 테이블 추가(Drizzle `pgTable`): `id`(uuid, `defaultRandom()`, PK), `ownerId`(text, `user.id` 참조, `onDelete: 'cascade'`), `concept`(text), `overallStart`(date), `overallEnd`(date), `deviceMode`(text, default `'responsive'`), `createdAt`/`updatedAt`(timestamp, `defaultNow()`), `deletedAt`(timestamp, nullable — FR-18 계정삭제 유예용, 이번 스토리에서는 컬럼만 준비하고 실제 소프트삭제 로직은 안 만듦)
  - [x] `npx drizzle-kit generate` → `npx drizzle-kit migrate`로 Neon에 실제 테이블 생성
  - [x] **주의**: 이전 스토리들처럼 `npx auth generate`를 다시 돌리지 않는다 — `project` 테이블은 Better Auth가 아니라 우리 도메인 테이블이라 수동으로 스키마에 추가하는 것이다

- [x] Task 3: Drizzle 어댑터 구현 (AC: #1)
  - [x] `adapters/repository/drizzle/project-repository.ts` — `ProjectRepository` 포트를 구현하는 `drizzleProjectRepository` 객체. `create`는 insert 후 삽입된 행을 도메인 `Project` 타입으로 매핑해 반환, `countByOwner`는 `count(*)` 쿼리

- [x] Task 4: Application Service — 인증 확인 + 프로젝트 생성 (AC: #1, #2)
  - [x] `application/require-session.ts` — `requireSession()`: `auth.api.getSession({ headers: await headers() })`로 서버 쪽에서 실제 세션을 검증(브라우저 쿠키만 믿는 `proxy.ts`의 낙관적 체크와 다름 — 여기가 진짜 인증 확인 지점). 세션 없으면 에러를 던진다
  - [x] `application/create-project.ts` — `createProject(input: { concept, overallStart, overallEnd })`: `requireSession()`으로 로그인 확인 → `drizzleProjectRepository.create({ ownerId: session.user.id, ...input, deviceMode: 'responsive' })` 호출
  - [x] `application/count-my-projects.ts` — `countMyProjects()`: `requireSession()` → `drizzleProjectRepository.countByOwner(session.user.id)`
  - [x] **아키텍처 노트**: 이 두 함수는 "기존 프로젝트의 소유권 확인"이 아니라 "로그인 여부 확인 + 내 소유로 생성/집계"이므로 아직 `withProjectAuth(projectId, fn)` 패턴(AD-7)을 쓸 대상이 없다 — `withProjectAuth`는 Story 1.5에서 "이미 있는 프로젝트를 조회/수정"할 때 처음 등장한다. 이번 스토리의 `requireSession()`이 그 전 단계의 더 단순한 인증 체크다

- [x] Task 5: 대시보드 화면 교체 (AC: #3, #4)
  - [x] `app/(app)/dashboard/page.tsx`를 서버 컴포넌트로 유지하되, `countMyProjects()`를 호출해 0개면 "첫 프로젝트를 만들어 보세요" + `display` 타이포(`DESIGN.md`) 문구와 "새 프로젝트 만들기" 버튼(→ `/dashboard/new`), 1개 이상이면 "프로젝트 N개가 있어요" 같은 짧은 문구 + 같은 버튼을 보여준다(전체 카드 목록은 Story 1.5)
  - [x] `app/(app)/dashboard/new/page.tsx` — 프로젝트 생성 폼(컨셉/설명 텍스트영역, 시작일·종료일 date input), shadcn `Textarea` 설치해 사용(`npx shadcn@latest add textarea`)
  - [x] `app/(app)/dashboard/new/actions.ts` — `'use server'` Server Action이 `createProject()` Application Service를 호출(AD-7: 데이터 변경은 Server Action이 기본 경로). 성공 시 `/dashboard`로 redirect

- [x] Task 6: 검증 (AC: #1~#4)
  - [x] 로그인 후 `/dashboard` 첫 진입 → 빈 상태 문구/버튼 확인
  - [x] "새 프로젝트 만들기" → 폼 작성 → 저장 → `/dashboard`로 이동, Neon `project` 테이블에 실제 row 생성 확인(`owner_id`가 로그인한 사용자 id와 일치하는지)
  - [x] `/dashboard` 재진입 시 "프로젝트 N개" 문구로 바뀌는지 확인
  - [x] 다른 계정으로 로그인해 `countMyProjects()`가 0을 반환하는지 확인(=본인 것만 집계됨)
  - [x] `npm run build`, `npm run lint`, `npm run depcruise` 통과 확인(특히 `domain/project/project.ts`가 depcruise 위반 없이 통과하는지)
  - [x] 검증에 사용한 테스트 프로젝트/계정 데이터는 정리

## Dev Notes

- **이 스토리가 헥사고날 구조의 첫 실제 적용이다** — `domain/`(순수 타입+포트), `adapters/repository/drizzle/`(구현), `application/`(오케스트레이션)의 3단 구조를 그대로 따른다. 이후 Menu/Screen 스토리도 같은 패턴을 반복하므로, 이번 스토리에서 정한 파일 배치 관례(포트는 `domain/ports/`, 어댑터는 `adapters/repository/drizzle/{entity}-repository.ts`, 서비스는 `application/{verb}-{entity}.ts`)를 계속 따라간다.
- **Server Action은 `withProjectAuth`가 아니라 Server Action 함수 자체가 `application/`의 서비스를 호출하는 얇은 래퍼**다 — 라우트 핸들러나 컴포넌트가 `drizzleProjectRepository`를 직접 호출하지 않는다(AD-1).
- **NFR-1 접근권한**: `countByOwner`/`create` 둘 다 `ownerId`를 클라이언트 입력이 아니라 서버가 검증한 `session.user.id`에서만 가져온다 — 사용자가 임의로 다른 사람의 `ownerId`를 지정할 방법이 없다.

### Project Structure Notes

```
{repo-root}/
  domain/
    project/project.ts        # 신규 — Project, DeviceMode 타입
    ports/project-repository.ts  # 신규 — ProjectRepository 인터페이스
  adapters/
    repository/drizzle/project-repository.ts  # 신규
  application/
    require-session.ts        # 신규
    create-project.ts         # 신규
    count-my-projects.ts      # 신규
  app/(app)/
    dashboard/
      page.tsx                 # 수정 — placeholder → 빈상태/카운트 표시
      new/
        page.tsx                # 신규 — 생성 폼
        actions.ts               # 신규 — Server Action
  db/
    schema.ts                  # 수정 — project 테이블 추가
```

### References

- [Source: epics.md#Story 1.4] — 원본 스토리/AC
- [Source: ARCHITECTURE-SPINE.md#Structural Seed] — ERD의 PROJECT 필드, 폴더 구조
- [Source: ARCHITECTURE-SPINE.md#AD-1, AD-7] — 도메인 경계, 인가 계층(이번 스토리에서 `requireSession`으로 단순화한 이유는 위 Dev Notes 참조)
- [Source: EXPERIENCE.md#State Patterns] — "프로젝트 0개(최초 진입)" 문구
- [Source: 1-3-signup-and-login.md] — `requireSession()`이 재사용하는 `auth.api.getSession()` 패턴, `(app)` 그룹이 이미 `proxy.ts`로 비로그인 접근을 막고 있다는 전제

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run build` — 성공 (TypeScript 컴파일 + 정적 페이지 생성, `/dashboard`(동적)/`/dashboard/new`(정적) 라우트 확인)
- `npm run lint` — 통과(경고/에러 없음)
- `npm run depcruise` — "no dependency violations found (16 modules, 17 dependencies cruised)"
- `npx drizzle-kit generate` → `drizzle/0002_skinny_captain_america.sql` 생성, `npx drizzle-kit migrate`로 Neon에 적용 완료
- 브라우저 실측: 신규 계정 가입 → `/dashboard` 빈 상태("첫 프로젝트를 만들어 보세요") 확인 → `/dashboard/new`에서 폼 작성/제출 → `/dashboard`로 리다이렉트, "프로젝트 1개가 있어요." 표시 확인
- Neon 직접 쿼리로 생성된 `project` row의 `owner_id`가 로그인 사용자의 `user.id`와 일치함을 확인
- 두 번째 신규 계정으로 가입 후 `/dashboard` 재확인 → 빈 상태 그대로(=`countByOwner`가 계정별로 정확히 분리됨, AC #2 충족)
- 검증에 사용한 두 테스트 계정과 project row는 Neon에서 직접 삭제해 정리 완료

### Completion Notes List

- 헥사고날 구조의 첫 실 적용: `domain/project/`(순수 타입), `domain/ports/project-repository.ts`(포트), `adapters/repository/drizzle/project-repository.ts`(구현), `application/{require-session,create-project,count-my-projects}.ts`(오케스트레이션) — 이후 Menu/Screen 스토리도 이 배치 관례를 따른다.
- Dev Notes에 명시했듯, `withProjectAuth(projectId, fn)`(AD-7)는 "이미 있는 프로젝트의 소유권 확인"용이라 CREATE 시점엔 적용 대상이 없음 — 대신 `requireSession()`으로 로그인 여부만 확인. `withProjectAuth`는 Story 1.5에서 처음 등장 예정.
- `project.owner_id`는 아키텍처 ERD상 uuid로 표기돼 있었으나, Better Auth가 생성하는 `user.id`가 text 타입이라 FK도 text로 맞춤(Story 1.1/1.3에서 이미 확립된 패턴).
- `app/(app)/dashboard/new`에서 "새 프로젝트 만들기" 버튼은 Base UI 기반 `Button` 프리미티브의 `asChild` 미지원 이슈(Story 1.2에서 발견한 기존 이슈)를 피하기 위해 `Button` 컴포넌트 대신 `buttonVariants()` 클래스를 `<Link>`에 직접 적용하는 방식을 사용.
- Story 1.5(목록 UI) 이전 임시 조치로, `/dashboard`는 프로젝트가 1개 이상이면 카드 목록이 아니라 "프로젝트 N개가 있어요" 한 줄 문구만 보여준다 — 이는 스토리 AC #4가 명시적으로 요구하는 범위이며, 전체 목록/카드 UI는 의도적으로 Story 1.5로 남겨둠.

### File List

- `domain/project/project.ts` (신규)
- `domain/ports/project-repository.ts` (신규)
- `adapters/repository/drizzle/project-repository.ts` (신규)
- `application/require-session.ts` (신규)
- `application/create-project.ts` (신규)
- `application/count-my-projects.ts` (신규)
- `db/schema.ts` (수정 — `project` 테이블/관계 추가)
- `drizzle/0002_skinny_captain_america.sql` (신규 — 마이그레이션)
- `app/(app)/dashboard/page.tsx` (수정 — placeholder → 빈상태/카운트 표시)
- `app/(app)/dashboard/new/page.tsx` (신규 — 생성 폼)
- `app/(app)/dashboard/new/actions.ts` (신규 — Server Action)
- `components/ui/textarea.tsx` (신규 — shadcn 설치)
