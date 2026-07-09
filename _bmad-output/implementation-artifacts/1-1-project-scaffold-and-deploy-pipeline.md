---
baseline_commit: NO_VCS
---

# Story 1.1: 프로젝트 뼈대와 배포 파이프라인 준비하기

Status: review

## Story

As a 개발자(또는 AI 코딩 도구),
I want 아키텍처 스파인이 지정한 스택으로 앱 뼈대와 배포 파이프라인이 미리 준비되어 있기를,
so that 이후 스토리들을 실제 화면/기능으로 바로 이어서 만들 수 있다.

## Acceptance Criteria

1. **Given** 새 리포지토리 **When** 지정된 스택(Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Drizzle ORM, Neon Postgres, Better Auth)으로 프로젝트를 초기화하면 **Then** 로컬에서 앱이 실행되고, 빈 데이터베이스 연결이 확인된다.
2. **And** Vercel에 배포되어 "로컬 → PR 프리뷰 → 프로덕션" 3단계 환경이 각각 접속 가능하다.
3. **Given** 배포된 프리뷰 환경 **When** PR을 올리면 **Then** Neon 브랜치 DB가 해당 프리뷰 전용으로 자동 연결된다.
4. **Given** 완성된 뼈대 **When** `domain/`에서 `adapters/`, `next`, `drizzle-orm`을 import하는 코드를 추가하면 **Then** CI(dependency-cruiser)가 실패한다 — 이 경계가 실제로 강제되는지 확인 가능해야 한다.

## Tasks / Subtasks

- [x] Task 1: Next.js 16 앱 스캐폴드 (AC: #1)
  - [x] `npx create-next-app@latest . --typescript --tailwind --eslint --app --import-alias "@/*" --turbopack --use-npm --yes` 로 초기화 (TS/Tailwind/App Router/Turbopack은 16.x 기본값이지만 비대화형 실행을 위해 명시). **`--src-dir`는 넣지 않는다** — `app/`이 `src/` 안이 아니라 리포지토리 최상위에 있어야 Task 3의 `domain/`·`adapters/` 등과 나란히 놓인다(아키텍처 스파인 Structural Seed와 일치).
  - [x] `npm run dev`로 로컬 실행 확인
- [x] Task 2: shadcn/ui 연결 (AC: #1)
  - [x] `npx shadcn@latest init` (패키지명이 `shadcn`으로 바뀜 — 구버전 `shadcn-ui`는 쓰지 않음). Tailwind v4는 자동 감지되어 `@theme inline`으로 구성됨
  - [x] `npx shadcn@latest add button` 로 컴포넌트 1개 설치해 정상 렌더 확인
- [x] Task 3: 헥사고날 폴더 구조 만들기 (AC: #1, #4)
  - [x] 리포지토리 루트에 `domain/`, `application/`, `adapters/`, `db/` 디렉토리 생성 — **`app/` 내부가 아니라 `app/`과 나란히 놓인 최상위 폴더**여야 한다(아키텍처 스파인 Structural Seed 그대로)
  - [x] `domain/`, `application/`, `adapters/`에 각각 `.gitkeep` 또는 최소 placeholder 파일만 추가 (실제 도메인 로직/엔티티는 이후 스토리에서 필요할 때 추가 — 지금 미리 만들지 않는다)
- [x] Task 4: Drizzle ORM + Neon 연결 (AC: #1)
  - [x] `npm i drizzle-orm @neondatabase/serverless` / `npm i -D drizzle-kit dotenv tsx`
  - [x] `drizzle.config.ts` 생성, `schema: './db/schema.ts'` 로 지정(Task 3의 최상위 `db/` 폴더 기준 — 리서치 예시의 `app/db/schema.ts` 아님)
  - [x] `db/client.ts`에서 `drizzle-orm/neon-http` + `@neondatabase/serverless`의 `neon()` 사용(서버리스 함수에 적합, `pg` 드라이버는 쓰지 않음)
  - [x] `db/schema.ts`는 이 시점에는 **빈 스키마(또는 주석만)로 둔다** — User/Project/Menu/Screen 테이블은 각각 필요한 스토리(1.3, 1.4, 2.1, 3.1)에서 추가한다
  - [x] Neon 프로젝트를 만들고 `.env.local`에 `DATABASE_URL` 연결(비밀값이므로 `.env`가 아닌 `.env.local` 사용). 연결 확인: `select version()` 쿼리로 PostgreSQL 18.4 응답 확인 완료.
  - [x] `.env.example`에 `DATABASE_URL=`처럼 값 없는 키만 커밋해 다른 개발자/에이전트가 필요한 환경변수 목록을 알 수 있게 한다
- [x] Task 5: Better Auth 연결 (AC: #1)
  - [x] `npm install better-auth @better-auth/drizzle-adapter`
  - [x] `BETTER_AUTH_SECRET`(32자 이상 랜덤 문자열)과 `BETTER_AUTH_URL`(로컬은 `http://localhost:3000`)을 `.env.local`에 추가(`.env.example`에도 키만 추가) — `NEXT_PUBLIC_BETTER_AUTH_URL`도 함께 추가(클라이언트 쪽 `auth-client.ts`가 참조하려면 `NEXT_PUBLIC_` 접두사가 필요)
  - [x] `lib/auth.ts`: `betterAuth({ database: drizzleAdapter(db, { provider: "pg" }) })`
  - [x] 라우트 핸들러 `app/api/auth/[...all]/route.ts` (경로가 `[...auth]`가 아니라 `[...all]`인 점 주의) — `toNextJsHandler(auth)` 사용
  - [x] `lib/auth-client.ts`: `createAuthClient()`
  - [x] `npx auth@latest generate` 로 Better Auth 자체 스키마(user/session/account/verification 등) 생성(기본적으로 `auth-schema.ts`를 리포지토리 루트에 만들길래 `db/schema.ts`로 옮겨 병합) → `npx drizzle-kit generate` → `npx drizzle-kit migrate` → Neon에 4개 테이블(user/session/account/verification) 생성 확인, `/api/auth/get-session` 응답 확인
  - [x] **이 `user` 테이블이 곧 우리 도메인의 User 엔티티다** — Story 1.3에서 필요한 `plan` 필드는 Better Auth의 `additionalFields` 설정으로 확장한다. 별도의 병렬 User 테이블을 만들지 않는다.
- [x] Task 6: SheetJS 설치 (AC: #1)
  - [x] `npm i --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz` — **`npm i xlsx`(공개 npm 레지스트리)로 설치 금지**, 방치되어 취약점이 있는 구버전(0.18.5)이 설치된다
  - [x] `package.json`의 `dependencies.xlsx` 값이 tarball URL로 고정되어 있는지 확인
- [x] Task 7: 도메인 경계 CI 강제 (AC: #4)
  - [x] `npm i -D dependency-cruiser`
  - [x] `.dependency-cruiser.js`에 규칙 3개 추가: `domain` → `adapters` 금지, `domain` → `next` 금지, `domain` → `drizzle-orm` 금지 (경로는 Task 3에서 만든 최상위 `domain/`, `adapters/` 기준으로 정규식 작성 — `^app/domain` 아니라 `^domain`)
  - [x] `package.json` script로 `depcruise --config .dependency-cruiser.js --ts-config tsconfig.json domain application adapters` 추가
  - [x] **이 검사가 매번 자동으로 돌게 만든다** — 로컬에서 한 번 돌려보는 것만으로는 부족하다: `.github/workflows/ci.yml`을 만들어 push/PR마다 `npm run depcruise`(및 `npm run build`)를 실행하게 하거나, Vercel의 빌드 커맨드에 이 스크립트를 포함시킨다. 둘 중 하나는 반드시 되어 있어야 AC #4가 "이후에도 계속" 지켜진다.
  - [x] 검증: `domain/` 안에 임시로 `import "next"` 한 줄을 추가해 로컬에서 실행 → 실패 확인 → 되돌리기. (실제 PR을 열어 CI 통과를 확인하는 것은 GitHub push가 필요해 Task 8과 함께 사용자 확인 후 진행)
- [x] Task 8: Vercel 배포 + Neon 프리뷰 브랜치 연동 (AC: #2, #3)
  - [x] Vercel에 리포지토리 연결, 프로덕션 배포 확인 (`https://ia-generation-platform.vercel.app` — `/`와 `/api/auth/get-session` 둘 다 정상 응답)
  - [x] Vercel Marketplace에서 "Neon" 통합 설치 → 기존 Neon 프로젝트 연결 → Development/Preview/Production 환경변수 자동 주입 확인(`DATABASE_URL` 포함)
  - [x] 테스트 브랜치(`test/preview-deploy`) 푸시로 프리뷰 배포가 자동 트리거되어 READY 상태까지 확인(검증 후 브랜치는 삭제함)
  - [x] "Preview branching"(PR별 전용 Neon DB 브랜치) 토글 위치를 이 세션에서 찾지 못함 — **의도적으로 보류, 사용자와 합의됨**(아래 Completion Notes의 "다음 필요한 조치" 참조). 지금은 모든 환경이 같은 Neon DB를 공유하는 상태이며, 배포/로그인 자체는 정상 동작 확인됨.

## Dev Notes

- **아키텍처 원칙(AD-1)**: `domain/`은 `Next.js`, `Drizzle`, `SheetJS`를 몰라야 한다. 이 스토리가 그 경계를 CI로 처음 강제하는 지점이다 — 이후 모든 스토리가 이 규칙을 어기지 않아야 한다.
- **엔티티는 필요할 때만 만든다**: 이 스토리는 뼈대만 만든다. User(Better Auth 생성)를 제외한 Project/Menu/Screen/ButtonAction 테이블은 각각 실제로 필요한 스토리에서 추가한다.
- **Better Auth 스키마 소유권**: `npx auth@latest generate`가 만드는 `user`/`session`/`account`/`verification` 테이블이 인증의 전부다. 이후 스토리가 별도 인증 테이블을 새로 만들지 않도록 한다.
- Neon 드라이버는 `neon-http`(서버리스 요청/응답에 적합) 사용, `pg`나 `neon-serverless`(WebSocket) 아님 — Vercel 서버리스 함수 환경과 맞지 않음.

### Project Structure Notes

```
{repo-root}/
  app/                      # Next.js App Router (라우트, 이 스토리에서는 기본 페이지만)
    api/auth/[...all]/route.ts
  application/               # 이후 스토리에서 Application Service 추가 (지금은 비어있음)
  domain/                   # 이후 스토리에서 도메인 로직 추가 (지금은 비어있음)
  adapters/                  # 이후 스토리에서 어댑터 추가 (지금은 비어있음)
  db/
    schema.ts               # Better Auth 스키마만 존재 (User/Project 등은 이후 스토리)
    client.ts
  lib/
    auth.ts
    auth-client.ts
  drizzle.config.ts
  .dependency-cruiser.js
```

이 구조는 아키텍처 스파인의 Structural Seed를 그대로 따른다 — `domain/adapters/application`이 `app/` 내부가 아니라 리포지토리 최상위에 나란히 위치해야 한다(일반적인 Next.js 튜토리얼들이 흔히 보여주는 `app/domain/` 중첩 구조가 아님).

### References

- [Source: ARCHITECTURE-SPINE.md#Structural Seed] — 폴더 구조, 스택 버전 표
- [Source: ARCHITECTURE-SPINE.md#AD-1] — 도메인 경계 규칙, CI 강제 요구
- [Source: epics.md#Story 1.1] — 원본 스토리/AC
- 스캐폴드 명령어는 2026-07 시점 최신 확인: Next.js 16.2.10, shadcn(`shadcn` 패키지, `shadcn-ui`는 폐기됨), drizzle-orm 0.45.2 / drizzle-kit 0.31.10 / @neondatabase/serverless 1.1.0, better-auth 1.6.23(+@better-auth/drizzle-adapter), SheetJS 0.20.3(cdn.sheetjs.com 전용), dependency-cruiser 18.0.0. 실제 설치 시점에 버전이 더 올라가 있을 수 있으니 `latest`로 설치하되 이 문서에 적힌 것보다 오래된 버전이 잡히면 캐시/레지스트리 문제를 의심할 것.

## Dev Agent Record

### Agent Model Used

Claude (bmad-dev-story 실행)

### Debug Log References

- `create-next-app .`는 리포지토리 폴더명(공백+한글 포함)이 npm 이름 규칙에 걸려 실패 → `ia-generation-platform` 임시 하위 폴더에 스캐폴드 후 전체 파일을 리포지토리 루트로 이동, 임시 폴더 삭제. `package.json`의 `name`은 "ia-generation-platform"으로 유지.
- `.dependency-cruiser.js` 규칙을 임시 위반 파일로 실측 검증(`domain/temp-violation-test.ts`가 `next/server`를 import하도록 만든 뒤 `npm run depcruise` 실패 확인 → 파일 삭제 후 재확인 통과).
- `npm run build` 로컬 프로덕션 빌드 성공 확인.
- `drizzle.config.ts`의 `dotenv/config` 기본 import는 `.env`만 읽고 `.env.local`은 안 읽어서 `drizzle-kit migrate`가 `DATABASE_URL: undefined`로 실패 → `config({ path: '.env.local' })`로 명시 수정.
- `npx auth generate`는 기본적으로 스키마를 리포지토리 루트의 `auth-schema.ts`에 생성(우리 `drizzle.config.ts`의 `./db/schema.ts` 경로를 안 따라감) → 내용을 `db/schema.ts`로 옮기고 루트 파일은 삭제.
- Vercel 첫 배포는 `DATABASE_URL` 미설정 상태로 시도해 빌드 실패(`Collecting page data` 단계에서 `/api/auth/[...all]` 라우트를 로드하며 `neon()`이 즉시 throw). Neon-Vercel 마켓플레이스 연동으로 `DATABASE_URL`을 자동 주입한 뒤 Redeploy하여 해결.
- `lib/auth-client.ts`가 참조하는 `NEXT_PUBLIC_BETTER_AUTH_URL`을 `.env.local`/`.env.example`에 추가로 넣지 않았으면 클라이언트에서 baseURL이 비어 있었을 것 — Task 5 진행 중 함께 추가.

### Completion Notes List

- Task 1~8 전체 완료. 로컬(`npm run dev`/`npm run build`), 도메인 경계 CI(실측 위반/통과 둘 다 확인), 실제 Neon DB 연결(`select version()` 확인), Better Auth 스키마 마이그레이션(4개 테이블 생성 확인) 및 API 응답(`/api/auth/get-session` → `null`), GitHub push, Vercel 프로덕션 배포(`https://ia-generation-platform.vercel.app`에서 `/`, `/api/auth/get-session` 정상 응답), 브랜치 push 시 프리뷰 배포 자동 트리거(READY 상태 확인) — 전부 실제로 동작하는 것을 확인함.
- **AC #3(Neon 프리뷰 브랜치 자동 연결)는 부분 미해결**: Neon-Vercel 통합은 설치되어 `DATABASE_URL`이 Development/Preview/Production 전체에 주입되지만, "PR마다 독립된 DB 브랜치를 만드는" 옵션(Preview branching)의 위치를 이 세션에서 Vercel 대시보드에서 찾지 못했다(UI가 문서와 다르게 배치되어 있었거나, 이 플랜/버전에서 다른 경로에 있을 수 있음). **사용자와 합의하여 지금은 모든 환경이 하나의 Neon DB를 공유하는 상태로 두고 보류** — 실제로 여러 명이 동시에 작업하게 되어 데이터 충돌이 문제가 될 때 다시 찾아서 켜기로 함.
- 다음 스토리(1.2)부터는 실제 화면(GNB/Footer, 로그인 전 랜딩)을 만들기 시작하면 됨.

### File List

- (신규) `app/**`, `public/**`, `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `next-env.d.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `.gitignore`, `README.md`, `AGENTS.md`, `CLAUDE.md` — Next.js 스캐폴드
- (신규) `components.json`, `components/ui/button.tsx`, `lib/utils.ts` — shadcn/ui
- (신규) `domain/.gitkeep`, `application/.gitkeep`, `adapters/.gitkeep` — 헥사고날 폴더 구조
- (신규) `drizzle.config.ts`, `db/schema.ts`(Better Auth 테이블 4종), `db/client.ts`, `drizzle/0000_sharp_morg.sql` — Drizzle/Neon 연결 및 마이그레이션(실제 DB에 적용 완료)
- (신규) `lib/auth.ts`, `lib/auth-client.ts`, `app/api/auth/[...all]/route.ts` — Better Auth 연결
- (신규) `.env.local`(미커밋, 실제 Neon 연결문자열 포함), `.env.example` — 환경변수
- (수정) `.gitignore` — `!.env.example` 추가
- (신규) `.dependency-cruiser.js`, `.github/workflows/ci.yml` — 도메인 경계 CI 강제
- (수정) `package.json` — `depcruise` 스크립트, `better-auth`/`@better-auth/drizzle-adapter`/`drizzle-orm`/`@neondatabase/serverless`/`xlsx`(cdn.sheetjs.com) 등 의존성 추가
