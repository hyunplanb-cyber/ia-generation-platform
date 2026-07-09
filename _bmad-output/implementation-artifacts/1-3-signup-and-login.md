---
baseline_commit: dfd165dc7e1af110b82e729a6b6297fc5d07f39f
---

# Story 1.3: 이메일로 가입하고 로그인하기

Status: review

## Story

As a 신규 사용자,
I want 이메일과 비밀번호로 가입하고 로그인하기를,
so that 내 프로젝트를 안전하게 저장하고 다시 접근할 수 있다.

## Acceptance Criteria

1. **Given** 처음 방문한 사용자 **When** `/signup`에서 이메일/비밀번호/이름으로 가입하면 **Then** 계정이 생성되고, 비밀번호는 해시로 저장되며(Better Auth 기본 동작), 자동으로 로그인 상태가 되어 `/dashboard`로 이동한다.
2. **And** 계정에는 추후 결제 등급 구분에 쓸 `plan` 값이 기본값("free")으로 함께 저장된다(FR-19) — 이번 스토리에서는 가입 폼에 노출되지 않고 서버 쪽 필드만 준비된다.
3. **Given** 이미 가입된 이메일로 가입을 시도함 **When** 폼을 제출하면 **Then** "이미 가입된 이메일이에요. 로그인해 주세요." 안내가 해당 입력칸 아래 표시된다.
4. **Given** 가입된 사용자 **When** `/login`에서 이메일/비밀번호로 로그인하면 **Then** 세션이 생성되어 `/dashboard`로 이동하고, 잘못된 비밀번호 입력 시 "비밀번호가 일치하지 않아요."가 표시된다.
5. **Given** 로그인하지 않은 사용자 **When** `/dashboard` 같은 `(app)` 그룹 경로에 직접 접근하면 **Then** `/login`으로 이동된다.
6. **Given** 이미 로그인한 사용자 **When** `/login` 또는 `/signup`에 접근하면 **Then** `/dashboard`로 바로 이동된다(`[ASSUMPTION]`).

## Tasks / Subtasks

- [x] Task 1: 회원가입 페이지 만들기 (AC: #1, #2, #3)
  - [x] `app/(marketing)/signup/page.tsx` 생성(`(marketing)` 레이아웃의 GNB/Footer를 그대로 상속) — 이름/이메일/비밀번호 입력 폼, shadcn `Input`/`Label`/`Button` 컴포넌트 설치해 사용
  - [x] 폼 제출 시 `authClient.signUp.email({ email, password, name, callbackURL: "/dashboard" }, { onRequest, onSuccess, onError })` 호출
  - [x] `onError`에서 "이미 가입된 이메일" 케이스는 이메일 입력칸 아래 인라인 메시지로 구분 표시
  - [x] 제출 중 버튼 비활성화

- [x] Task 2: 로그인 페이지 만들기 (AC: #4)
  - [x] `app/(marketing)/login/page.tsx` 생성 — 이메일/비밀번호 입력 폼
  - [x] `authClient.signIn.email(...)` 호출
  - [x] 에러 시 "비밀번호가 일치하지 않아요." 인라인 메시지

- [x] Task 3: `plan` 필드를 User 스키마에 추가 (AC: #2)
  - [x] `lib/auth.ts`에 `emailAndPassword: { enabled: true }`(기본 비활성 상태였음 — 이번에 처음 켬, 안 켜면 signUp/signIn 자체가 실패했을 것)와 `user.additionalFields.plan`(`input: false`, 기본값 "free") 추가
  - [x] `npx auth generate` → `db/schema.ts`에 `plan` 컬럼만 추가됨(다른 3개 테이블 변경 없음) 확인 → `npx drizzle-kit generate` → `npx drizzle-kit migrate` → Neon `user` 테이블에 실제로 `plan` 컬럼(기본값 `'free'`) 생성 확인
  - [x] 클라이언트 타입 확장(`inferAdditionalFields`)은 이번 스토리에서 미사용 필요 없어 생략

- [x] Task 4: `(app)` 그룹 접근 제어 — 로그인 안 한 사용자는 `/login`으로 (AC: #5, #6)
  - [x] `middleware.ts`(리포지토리 루트) — `better-auth/cookies`의 `getSessionCookie`로 세션 쿠키 존재 여부만 낙관적으로 확인(진짜 인가 판단 아님, AD-7과의 경계는 Dev Notes 참조)
  - [x] matcher로 `/dashboard/:path*`, `/login`, `/signup` 지정 — 세션 쿠키 없으면 `/login`으로 리다이렉트
  - [x] `/login`, `/signup`에 세션 쿠키가 있는 상태로 접근하면 `/dashboard`로 리다이렉트하는 로직도 같은 미들웨어에 포함

- [x] Task 5: 검증 (AC: #1~#6)
  - [x] 가입 → 자동 로그인 → `/dashboard` 이동, Neon `user` 테이블에 실제 row 생성(`plan: 'free'`) 확인
  - [x] 같은 이메일로 재가입 시도 → "이미 가입된 이메일이에요. 로그인해 주세요." 인라인 에러 확인
  - [x] 로그아웃 후 로그인 재시도 → 성공 확인(`/dashboard`), 틀린 비밀번호 → "비밀번호가 일치하지 않아요." 확인
  - [x] 로그인 없이 `/dashboard` 직접 접근 → `/login` 리다이렉트 확인
  - [x] 로그인 상태에서 `/login` 접근 → `/dashboard` 리다이렉트 확인
  - [x] 검증에 사용한 테스트 계정은 DB에서 정리(삭제)함
  - [x] `npm run build`, `npm run lint`, `npm run depcruise` 통과 확인

## Dev Notes

- **AD-7과의 관계**: 아키텍처 스파인 AD-7은 "인가는 `middleware.ts`가 아니라 Application Service의 `withProjectAuth`로 한다"고 규정하지만, 이는 *데이터 소유권 검사*(이 프로젝트가 내 것인가)에 대한 규칙이다. 이번 스토리의 미들웨어는 "세션이 있는가 없는가"만 보는 훨씬 얕은 체크이며, Better Auth 공식 가이드도 이 용도로 미들웨어의 낙관적 쿠키 체크(`getSessionCookie`)를 권장한다. 실제 프로젝트 소유권 검사는 Epic 1에서 다루지 않고, Story 1.4(프로젝트 생성)부터 Application Service 계층에서 시작된다.
- **비밀번호 해시/세션 관리**는 Better Auth가 알아서 처리한다(NFR-1) — 직접 구현하지 않는다.
- **에러 메시지 톤**: `EXPERIENCE.md` Voice and Tone 표에 이미 정확한 문구가 정해져 있다 — "인증에 실패했습니다" 같은 일반 문구를 쓰지 않는다.

### Project Structure Notes

```
{repo-root}/
  app/
    (marketing)/
      login/page.tsx     # 신규
      signup/page.tsx    # 신규
  middleware.ts            # 신규 — 세션 쿠키 존재 여부만 확인하는 낙관적 리다이렉트
  lib/
    auth.ts                # 수정 — additionalFields.plan 추가
  db/
    schema.ts              # 수정 — auth generate가 user 테이블에 plan 컬럼 추가
```

### References

- [Source: epics.md#Story 1.3] — 원본 스토리/AC
- [Source: EXPERIENCE.md#Voice and Tone] — 정확한 에러 문구
- [Source: 1-1-project-scaffold-and-deploy-pipeline.md] — Better Auth 초기 연결 상태(`lib/auth.ts`, `lib/auth-client.ts`, `app/api/auth/[...all]/route.ts`, DB 마이그레이션 방법)
- [Source: 1-2-global-nav-footer-and-landing-page.md] — `(marketing)`/`(app)` 라우트 그룹 구조, `/login`·`/signup` 자리표시자 링크 위치, `authClient.signOut()` 사용 중인 프로필 메뉴
- [Source: ARCHITECTURE-SPINE.md#AD-7] — 인가 계층 규칙(위 Dev Notes에서 이번 스토리 범위와의 경계를 명확히 함)
- Better Auth React 클라이언트 API(`authClient.signUp.email`/`signIn.email`, `onRequest`/`onSuccess`/`onError` 콜백)와 `better-auth/cookies`의 `getSessionCookie`(미들웨어용 낙관적 쿠키 체크, 완전한 세션 검증이 아님을 주의) 확인됨 — 출처: Better Auth 공식 문서(Client, Next.js Integration).

## Dev Agent Record

### Agent Model Used

Claude (bmad-dev-story 실행)

### Debug Log References

- `lib/auth.ts`에 `emailAndPassword: { enabled: true }`가 빠져 있었음(Story 1.1에서는 켜지 않았음) — 이게 없으면 `signUp.email`/`signIn.email` 자체가 동작하지 않아 이번 스토리에서 처음 켬.
- `lib/auth-client.ts`가 `NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000`을 고정 참조하고 있어서, 로컬 개발 포트가 다른 프로젝트와 충돌해 자동으로 다른 포트(예: 59099)로 뜰 때 가입 요청이 실제 서버가 아닌 3000번 포트로 나가 404/연결실패 → **`baseURL`을 아예 지정하지 않도록 수정**(같은 origin으로 자동 요청되어 포트가 바뀌어도 항상 정상 동작). `NEXT_PUBLIC_BETTER_AUTH_URL`은 더 이상 쓰지 않아 `.env.local`/`.env.example`에서 제거.
- 위 수정 후에도 403 Forbidden — Better Auth가 요청 Origin을 `BETTER_AUTH_URL`(여전히 3000으로 고정)과 대조해 신뢰 출처가 아니라고 거부한 것. `lib/auth.ts`에 `trustedOrigins: ['http://localhost:*']`를 추가해 로컬 개발 중 포트가 바뀌어도 신뢰하도록 해결(프로덕션은 실제 배포 도메인만 신뢰 — `BETTER_AUTH_URL` 그대로 유지).
- **`npm run build`가 "middleware 파일 관례는 폐기(deprecated)되었고 proxy를 쓰라"는 경고를 실제로 띄움** — Next.js 16에서 `middleware.ts`/`export function middleware`가 `proxy.ts`/`export function proxy`로 이름이 바뀌었다(기존 파일은 당장은 동작하지만 향후 버전에서 제거 예정). `middleware.ts`를 `proxy.ts`로, 함수명도 `proxy`로 변경해 경고 제거 및 최신 관례 반영.
- 인가 리다이렉트 재검증 중 "로그아웃했는데도 새 서버 포트에서 `/dashboard`가 그대로 보임" 현상 발견 — 원인은 버그가 아니라 브라우저 쿠키가 포트를 구분하지 않아(RFC 6265, 쿠키는 host 기준이지 origin/포트 기준이 아님) 이전 포트에서 로그인한 세션 쿠키가 새 포트 요청에도 그대로 전송된 것. 실제로 로그아웃 API를 다시 호출해 세션을 지운 뒤에는 정상적으로 `/login`으로 리다이렉트됨을 확인.

### Completion Notes List

- Task 1~5 전체 완료. AC #1~#6 전부 브라우저에서 실제 가입/로그인/로그아웃/리다이렉트 흐름으로 검증(Neon DB의 실제 user row 생성·삭제까지 확인).
- `npm run build`/`npm run lint`/`npm run depcruise` 전부 통과, 배포 경고(middleware→proxy) 없이 클린 빌드.
- 로그아웃 시 자동으로 `/login`으로 이동하지는 않음(Story 1.2의 프로필 메뉴가 `signOut()`만 호출하고 리다이렉트는 안 함) — 이번 스토리 AC에는 없는 항목이라 손대지 않았으나, 다음에 다듬으면 좋을 만한 사소한 포인트로 남겨둠.

### File List

- (신규) `app/(marketing)/signup/page.tsx`, `app/(marketing)/login/page.tsx` — 가입/로그인 폼
- (신규) `proxy.ts`(구 `middleware.ts`) — 로그인 여부 기반 낙관적 리다이렉트
- (신규) `components/ui/input.tsx`, `components/ui/label.tsx` — shadcn 컴포넌트 추가
- (수정) `lib/auth.ts` — `emailAndPassword.enabled`, `user.additionalFields.plan`, `trustedOrigins` 추가
- (수정) `lib/auth-client.ts` — `baseURL` 제거(same-origin 자동 사용)
- (수정) `db/schema.ts` — `user.plan` 컬럼 추가(Better Auth 스키마 재생성분 반영)
- (신규) `drizzle/0001_sleepy_black_bird.sql` — plan 컬럼 마이그레이션(Neon에 적용 완료)
- (수정) `.env.local`, `.env.example` — `NEXT_PUBLIC_BETTER_AUTH_URL` 제거
