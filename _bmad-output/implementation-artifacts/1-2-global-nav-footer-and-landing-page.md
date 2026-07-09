---
baseline_commit: ca685659cc60bc83a8e52af50c0b35fdd7d9af94
---

# Story 1.2: 공통 화면 틀(GNB/Footer)과 로그인 전 소개 페이지 만들기

Status: review

## Story

As a 방문자,
I want 로그인 전에도 서비스 소개 페이지를 보고, 로그인/가입 버튼을 찾을 수 있기를,
so that 이 서비스가 뭘 해주는지 알고 가입할지 결정할 수 있다.

## Acceptance Criteria

1. **Given** 로그인하지 않은 방문자가 사이트에 접속함 **When** 첫 화면(마케팅 랜딩, `/`)을 보면 **Then** 상단(GNB)에 로고와 로그인/가입 버튼이, 하단(Footer)에 이용약관·개인정보처리방침·문의하기 링크와 저작권 표시가 보인다.
2. **Given** 로그인한 사용자 **When** 앱 셸(`(app)` 레이아웃) 안 어느 화면에 있든 **Then** 상단 GNB에 로고, 대시보드로 가는 링크, 프로필 메뉴(계정 설정/로그아웃 진입점)가 항상 보인다. (실제 대시보드/계정설정 화면은 Story 1.4~1.6에서 만들어지므로, 이 스토리는 셸 컴포넌트와 임시 확인용 페이지까지만 다룬다.)
3. **Given** DESIGN.md의 컬러/타이포/라운드 토큰 **When** 아무 화면이나 열어보면 **Then** shadcn 기본 회색조 대신 DESIGN.md의 인디고 브랜드컬러·Pretendard 폰트·지정된 라운드 값이 실제로 적용되어 있다.

## Tasks / Subtasks

- [x] Task 1: DESIGN.md 토큰을 `app/globals.css`에 반영 (AC: #3)
  - [x] `:root`의 shadcn 기본값(oklch 회색조) 중 다음을 DESIGN.md 값으로 교체: `--background: #FAFAFA`, `--foreground: #1F2024`, `--border: #E7E7EA`, `--muted-foreground: #6B6F76`, `--primary: #5B4FE5`, `--primary-foreground: #FFFFFF`
  - [x] shadcn 기본 세트에 없는 새 토큰을 `:root`에 추가하고 `@theme inline` 블록에도 `--color-x: var(--x)` 형태로 등록(그래야 `bg-primary-soft` 같은 Tailwind 유틸리티가 생성됨): `primary-soft(#EDE9FE)`, `primary-on-soft(#4A3DD1)`, `pastel-mint(#DFF5EC)`/`pastel-mint-foreground(#0F6B4C)`, `pastel-lavender(#EDE9FE)`/`pastel-lavender-foreground(#4B3FA6)`, `pastel-yellow(#FFF6D9)`/`pastel-yellow-foreground(#8A6D00)`, `success(#0B6B3D)`/`success-soft(#E3F7EC)`, `warning(#8A5A00)`/`warning-soft(#FCEFD6)`, `danger(#B42318)`/`danger-soft(#FBE4E4)`, `neutral-badge(#4B4F56)`/`neutral-badge-soft(#EEEEF0)`
  - [x] `@theme inline`의 라운드를 DESIGN.md 값으로 직접 지정(기존 `calc(var(--radius) * ...)` 방식 대신 고정값): `--radius-sm: 6px`, `--radius-md: 10px`, `--radius-lg: 16px`, `--radius-full: 9999px`
  - [x] `--font-sans`가 Pretendard를 가리키도록 Task 2와 연결(`var(--font-pretendard)`)
  - [x] 다크모드(`.dark` 블록)는 이번 스토리에서 건드리지 않음 — 그대로 둠
  - [x] DESIGN.md 원문과 재대조 완료(오탈자 없음)

- [x] Task 2: Pretendard 폰트 적용 (AC: #3)
  - [x] `npm install pretendard` (1.3.9)
  - [x] `app/layout.tsx`에서 기존 `Geist`(`next/font/google`) import를 제거하고, `next/font/local`로 `node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2`를 로드(`weight: '45 920'`, `variable: '--font-pretendard'`, `display: 'swap'`). `Geist_Mono`는 코드/모노 폰트 자리로 유지.
  - [x] `globals.css`의 `--font-sans: var(--font-pretendard)`로 연결, `layout.tsx`의 `<html>` className에 `pretendard.variable` 추가
  - [x] 코드/모노스페이스 폰트는 이번 스토리에서 미사용 — 변수만 유지, 적용 생략

- [x] Task 3: 마케팅 랜딩 페이지(비로그인 `/`) 만들기 (AC: #1)
  - [x] `app/(marketing)/layout.tsx` 라우트 그룹 생성 — GNB(로고 + "로그인" + "회원가입" 버튼)와 Footer(이용약관/개인정보처리방침/문의하기 링크 + `© {현재연도} IA 자동생성 플랫폼`)
  - [x] `app/(marketing)/page.tsx`에 실제 서비스 소개(제목/설명 + "시작하기" CTA)로 교체, 기존 `app/page.tsx`(기본 홈)는 삭제. Voice and Tone 준수(이모지·과장 없음)
  - [x] 로그인/회원가입/약관 등은 `/login`, `/signup`, `/terms`, `/privacy`, `/contact` 자리표시자 경로로 연결만 해둠(Story 1.3+에서 실제 페이지 구현)

- [x] Task 4: 로그인 후 공통 앱 셸(GNB) 만들기 (AC: #2)
  - [x] `app/(app)/layout.tsx` 라우트 그룹 생성 — GNB(로고, "대시보드" 링크, 우측 프로필 드롭다운 메뉴: "계정 설정"·"로그아웃"). shadcn `dropdown-menu`(Base UI 기반) 컴포넌트 설치해 사용, 상호작용 부분은 `components/profile-menu.tsx` 클라이언트 컴포넌트로 분리
  - [x] "로그아웃" 메뉴 항목은 `authClient.signOut()`에 연결(세션 없는 상태에서 에러 없이 호출됨을 확인. 실제 로그아웃 흐름 검증은 Story 1.3 이후)
  - [x] "대시보드"·"계정 설정"은 `/dashboard`, `/account`로 연결(Story 1.4~1.6에서 실제 구현)
  - [x] `app/(app)/dashboard/page.tsx`에 placeholder 페이지 생성 — **최초 계획은 `app/(app)/page.tsx`(루트)였으나, `(marketing)` 그룹도 루트(`/`)를 쓰고 있어 두 라우트 그룹이 같은 경로로 충돌하는 것을 로컬에서 실제로 발견(Next.js가 "parallel pages" 에러로 명확히 알려줌) → `/dashboard` 경로로 옮겨 해결.** GNB 링크(`/dashboard`)와도 자연스럽게 맞음
  - [x] 인가(로그인 체크) 로직은 이번 스토리에서 넣지 않음 — Story 1.3의 몫

- [x] Task 5: 시각 확인 (AC: #1, #2, #3)
  - [x] `npm run dev`로 `/`(마케팅 랜딩)와 `/dashboard`(앱 셸 placeholder) 둘 다 렌더링 확인(접근성 스냅샷으로 GNB/Footer/본문 구조 확인)
  - [x] 브라우저에서 실제 계산된 스타일로 확인: 회원가입 버튼 `background-color: rgb(91, 79, 229)`(=`#5B4FE5`) + `font-family: pretendard`, 앱 셸 헤더 `border-bottom-color: rgb(231, 231, 234)`(=`#E7E7EA`), 배경은 흰색(`--surface`)
  - [x] `npm run build` 프로덕션 빌드 성공 확인
  - [x] `npm run depcruise` 통과 확인(0 modules cruised — 이 스토리가 domain/adapters를 건드리지 않았으므로 예상대로)

## Dev Notes

- **AC #2의 스코프 한정**: PRD/UX가 원래 그리는 "로그인한 사용자" GNB는 실제 로그인이 있어야 완전히 검증되지만, 로그인 UI는 Story 1.3의 몫이다. 이 스토리는 셸(레이아웃) 컴포넌트를 만들고 placeholder로 렌더링을 확인하는 데까지만 책임진다. Story 1.3~1.6이 이 셸 위에 실제 페이지를 얹는다 — 셸 자체(GNB 구조)를 다시 만들지 않는다.
- **파스텔 워시 색상은 이번 스토리에서 실제로 쓰이지 않는다** — 대시보드 카드(Story 1.5)에서 처음 쓰인다. 이번 스토리는 토큰만 준비해두는 것으로 충분하다(Task 1). 화면에 억지로 파스텔 색을 넣지 않는다.
- **Voice and Tone 준수**: 랜딩 페이지 카피에 느낌표·이모지 남발 금지(`EXPERIENCE.md` Do/Don't 표 참조). "짜잔! 시작해보세요! 🎉" 같은 톤 금지, "IA·화면정의·일정을 자동으로 만들어 드려요" 정도의 담담한 톤.

### Project Structure Notes

```
{repo-root}/
  app/
    (marketing)/
      layout.tsx     # 비로그인 GNB + Footer
      page.tsx       # 랜딩 페이지 (기존 기본 홈 대체)
    (app)/
      layout.tsx      # 로그인 후 GNB (대시보드/프로필)
      page.tsx        # 임시 placeholder (Story 1.4가 대시보드로 교체)
    layout.tsx         # 루트 레이아웃(폰트 변수 주입만, 자체 GNB 없음)
    globals.css        # DESIGN.md 토큰 반영
```
Next.js Route Group 문법(`(marketing)`, `(app)`)은 URL 경로에 영향을 주지 않고 레이아웃만 분리하는 표준 기능이다 — `/` 는 `(marketing)/page.tsx`가, 추후 `/dashboard`는 `(app)/dashboard/page.tsx`가 담당하게 된다.

### References

- [Source: EXPERIENCE.md#Information Architecture] — 마케팅 랜딩/GNB 구성, `(app)` 셸 구조 근거
- [Source: EXPERIENCE.md#Voice and Tone] — 랜딩 카피 톤
- [Source: DESIGN.md 컬러/타이포/라운드 토큰 전체] — Task 1 값의 출처
- [Source: 1-1-project-scaffold-and-deploy-pipeline.md] — 기존 스택 상태(Next.js 16 App Router, `src/` 미사용, shadcn base-nova 프리셋, Better Auth `lib/auth.ts`+`lib/auth-client.ts` 완료, `domain/application/adapters/db` 최상위 폴더 존재하나 이번 스토리는 미사용)
- Pretendard 적용 방식: `npm install pretendard` 후 `next/font/local`로 `pretendard/dist/web/variable/woff2/PretendardVariable.woff2`를 가변폰트(`weight: '45 920'`)로 로드하는 것이 2026년 기준 Next.js 표준 패턴 (출처: Next.js 공식 폰트 문서, Pretendard 공식 저장소 orioncactus/pretendard, 커뮤니티 가이드).

## Dev Agent Record

### Agent Model Used

Claude (bmad-dev-story 실행)

### Debug Log References

- DESIGN.md의 `surface(#FFFFFF)` 토큰을 Task 1에 처음 빠뜨림 → shadcn 기존 `--card`(이미 흰색)에 `--color-surface: var(--card)` 별칭만 추가해 해결(중복 흰색 변수 없앰).
- `app/(app)/page.tsx`(placeholder)를 루트에 만들었다가 `app/(marketing)/page.tsx`와 똑같이 `/` 경로로 충돌 — Next.js가 "You cannot have two parallel pages that resolve to the same path" 에러로 실제로 알려줘서 발견. `app/(app)/dashboard/page.tsx`로 이동해 해결(GNB의 "대시보드" 링크와도 자연스럽게 맞음).
- shadcn `dropdown-menu` 컴포넌트가 Radix가 아니라 **Base UI**(`@base-ui/react`) 기반이라, Radix 관례인 `asChild`가 `DropdownMenuItem`에 없어 타입 에러 발생(`npm run build` 단계에서 실제로 잡힘, 이게 dev 서버의 "1 Issue" 배지 정체였음) → `<Link>` + `asChild` 조합 대신 `useRouter().push()` 방식으로 수정.
- `preview_click` 도구의 합성 클릭이 Base UI 드롭다운을 열지 못해(포인터 이벤트 시퀀스 필요) `preview_eval`로 `pointerdown/mousedown/pointerup/mouseup/click`을 직접 dispatch해서 동작 확인(실제 마우스 클릭에서는 문제 없음 — 테스트 도구 한계였을 뿐).

### Completion Notes List

- Task 1~5 전체 완료. `npm run build`/`npm run lint`/`npm run depcruise` 전부 통과.
- 실제 렌더링 확인: 마케팅 랜딩(GNB+Footer+카피), 앱 셸(GNB+프로필 드롭다운, "계정 설정"/"로그아웃" 항목 노출 확인), 인디고 브랜드컬러(`#5B4FE5`)와 Pretendard 폰트가 실제 계산된 스타일에 반영됨.
- 다음 스토리(1.3)에서 `/login`, `/signup` 실제 페이지가 생기면, 이번 스토리가 만든 자리표시자 링크가 실제로 연결된다.

### File List

- (신규) `app/(marketing)/layout.tsx`, `app/(marketing)/page.tsx` — 마케팅 랜딩 GNB/Footer/카피
- (삭제) `app/page.tsx` — `(marketing)/page.tsx`로 대체
- (신규) `app/(app)/layout.tsx`, `app/(app)/dashboard/page.tsx` — 로그인 후 앱 셸 GNB + placeholder
- (신규) `components/profile-menu.tsx` — 프로필 드롭다운(계정설정/로그아웃) 클라이언트 컴포넌트
- (신규) `components/ui/dropdown-menu.tsx` — shadcn 컴포넌트 추가
- (수정) `app/layout.tsx` — Geist→Pretendard(`next/font/local`) 교체, 메타데이터(제목/설명/`lang="ko"`) 갱신
- (수정) `app/globals.css` — DESIGN.md 컬러/라운드/폰트 토큰 반영(브랜드 인디고, 파스텔 워시 3종, 시맨틱 상태색 4종, surface 별칭, 라운드 스케일)
- (수정) `package.json` — `pretendard` 의존성 추가
- (수정) `.claude/launch.json` — `autoPort: true` 추가(다른 프로젝트와 포트 충돌 대응, 앱 동작과 무관)
