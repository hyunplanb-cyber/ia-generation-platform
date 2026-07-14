---
baseline_commit: 45ce29a
---

# Story 3.4: AI프롬프트 확인하고 수정하기

Status: review

## Story

As a 화면을 검토하는 사용자,
I want 각 화면에 자동으로 만들어진 AI 프롬프트를 읽고 필요하면 고치기를,
so that 이 프롬프트를 그대로 AI 코딩 도구에 붙여넣어도 괜찮은 수준으로 만들 수 있다.

`[2026-07-13 정정]` 이 스토리의 프롬프트 생성은 규칙기반 템플릿이 아니라 **Claude API(`claude-haiku-4-5`) 실제 호출**로 구현한다(Sprint Change Proposal, `sprint-change-proposal-2026-07-13.md`). 페이지명·기능정의·소속 메뉴 설명뿐 아니라 같은 메뉴의 다른 화면·전체 사이트 컨셉까지 맥락으로 넘긴다.

## Acceptance Criteria

1. **Given** 화면 상세 패널 **When** 프롬프트 칸을 보면 **Then** 페이지명·기능정의·소속 메뉴 설명(및 같은 메뉴의 다른 화면·사이트 컨셉 맥락)을 반영해 Claude API가 생성한 문장이 이미 채워져 있다.
2. **Given** 자동으로 채워진 프롬프트 **When** 전체 내용을 직접 고치면 **Then** 수정한 내용대로 저장되고 이 항목은 "수정됨" 상태가 된다.

## Tasks / Subtasks

- [x] Task 1: `PromptGenerator` 포트 + Claude API 어댑터 (AC: #1)
  - [x] `domain/ports/prompt-generator.ts` — `PromptGeneratorInput{ project: Pick<Project,"concept">; menu: Pick<Menu,"nameKo"|"nameEn"|"description">; screen: Pick<Screen,"pageName"|"funcDef">; siblingScreens: Pick<Screen,"pageName">[] }`, `PromptGenerator { generate(input): Promise<string> }`(AD-1 — Application Service가 이 입력을 조립, 어댑터는 Repository를 모른다)
  - [x] `adapters/prompt/llm/claude-prompt-generator.ts` — `claude-api` 스킬 기준 최신 `@anthropic-ai/sdk` 사용(`npm install @anthropic-ai/sdk` 완료). 단발성 비스트리밍 `client.messages.create()` 호출, 모델은 `claude-haiku-4-5`(Sprint Change Proposal이 확정한 모델 — thinking/effort 파라미터 없음, older-model 취급), `max_tokens` 1024. `system` 프롬프트로 "AI 코딩 도구에 붙여넣을 한국어 프롬프트 문장만 출력" 지시. `ANTHROPIC_API_KEY`는 함수 호출 시점에 `process.env`에서 읽고, 없으면 `Error("ANTHROPIC_API_KEY_MISSING")`을 던진다(모듈 로드 시점에 클라이언트를 미리 만들지 않음 — 키가 나중에 설정되어도 재배포 없이 동작하도록)

- [x] Task 2: 프롬프트 생성/저장 Application Service (AC: #1, #2)
  - [x] `domain/ports/screen-repository.ts`의 `ScreenFieldsPatch`에 `prompt`/`promptSource` 추가
  - [x] `application/update-screen-fields.ts` 확장 — `UpdateScreenFieldsRequest`에 `prompt?: string` 추가, pageId/pageName/funcDef와 동일한 AD-5 판정(실제 값이 바뀔 때만 `promptSource: 'manual'`)
  - [x] `application/generate-screen-prompt.ts` 신규 — `generateScreenPrompt(projectId, screenId)`: `withProjectAuth` → 화면·소속 메뉴·프로젝트·같은 메뉴의 다른 화면(`screenRepository.listByProject` 필터링, 이번 화면 제외)을 모아 `claudePromptGenerator.generate()` 호출 → 성공 시 `screenRepository.updateFields()`로 `prompt` 저장(**`promptSource`는 `'auto'` 유지** — Story 3.1의 자동생성과 동일한 취급, AD-5의 "auto" 상태). 이미 `prompt`가 채워져 있으면(re-generate 요청이 아닌 한) 재호출하지 않고 그대로 반환. `ANTHROPIC_API_KEY_MISSING` 에러를 캐치해 `{ ok: false, reason: "unavailable" }`로 변환(관리자가 키 설정 전이면 기능이 조용히 꺼져 있는 상태 — 소셜 로그인 미설정 시 "준비 중" 처리한 기존 관례와 동일)

- [x] Task 3: 화면 상세 패널에 AI프롬프트 섹션 추가 (AC: #1, #2)
  - [x] `app/(app)/dashboard/[projectId]/screens/generate-prompt-action.ts` 신규 — `'use server' generatePromptAction(projectId, screenId)`: `generateScreenPrompt` 호출 후 `revalidatePath`, 결과 반환
  - [x] `app/(app)/dashboard/[projectId]/screens/update-prompt-action.ts` 신규 — `updateScreenFields`의 `prompt` 필드 저장 경로(`update-func-def-action.ts`와 동일한 패턴)
  - [x] `app/(app)/dashboard/[projectId]/screens/screen-detail-panel.tsx` 수정 — "AI프롬프트" 섹션 추가:
    - 패널이 열릴 때 `screen.prompt`가 `null`이면 `useEffect`로 `generatePromptAction`을 자동 호출(사용자가 버튼을 누를 필요 없이 "이미 채워져 있다"는 AC #1을 만족) → 호출 중에는 "AI가 프롬프트를 만들고 있어요..." 로딩 표시
    - 생성 실패(`reason: "unavailable"`)면 "AI 프롬프트 기능을 아직 사용할 수 없어요(관리자 설정 필요)"라는 중립 안내로 대체(에러로 보이지 않게, 소셜 로그인 미설정 배너와 동일 톤)
    - 프롬프트가 있으면 textarea로 표시 + 저장 버튼(`update-prompt-action.ts` 경유), "자동생성"/"수정됨" 배지(`promptSource` 기준, 다른 필드와 동일한 neutral 배지 스타일)

- [x] Task 4: 검증 (AC: #1, #2)
  - [x] `npm run build`, `npm run lint`, `npm run depcruise` 통과
  - [x] `ANTHROPIC_API_KEY` 미설정 상태에서 상세 패널을 열어 "아직 사용할 수 없어요" 안내가 뜨는지 확인(현재 로컬/배포 환경 모두 키가 없음 — 이 경로가 기본 검증 대상)
  - [x] DB에 프롬프트 값을 직접 넣어 "수정됨" 배지 전환 및 저장 로직(AC #2)은 `updateScreenFields`의 기존 pageId/funcDef 판정 로직을 그대로 재사용하므로 코드 레벨로 검증(같은 diff 판정 패턴)
  - [x] **키가 실제로 설정된 실제 Claude API 호출(AC #1)은 사용자가 `ANTHROPIC_API_KEY`를 로컬 `.env.local`과 Vercel 환경변수에 추가한 뒤 별도로 확인 필요** — 이 스토리의 Dev Agent는 키를 발급/입력할 수 없다(보안 정책상 자격 증명은 사용자가 직접 입력)

## Dev Notes

- **API 키는 사용자가 직접 발급해서 설정해야 한다** — Dev Agent는 `ANTHROPIC_API_KEY` 같은 비밀값을 대신 입력하지 않는다(보안 정책). 이번 스토리는 키가 없어도 앱이 죽지 않고 "아직 사용할 수 없어요"로 우아하게 저하되도록 만드는 데까지가 범위이며, 실제 살아있는 API 호출 검증은 사용자가 키를 넣은 뒤 진행한다.
- **모델은 `claude-haiku-4-5` 고정** — Sprint Change Proposal(2026-07-13)이 비용 검토(프로젝트당 100~300원) 후 확정한 값. Haiku 4.5는 "older model" 취급이라 `thinking`/`effort` 파라미터를 쓰지 않는다(`claude-api` 스킬 기준 — Sonnet 4.5/Haiku 4.5에 effort를 넣으면 에러).
- **`promptSource`는 최초 자동생성 시 `'auto'`로 유지** — Claude API가 만들었어도 이건 "자동 채움"이지 사용자가 고친 게 아니다. 사용자가 textarea를 실제로 고쳐 저장할 때만(`updateScreenFields`의 AD-5 diff 판정) `'manual'`로 전환된다.
- **프롬프트 생성은 상세 패널을 열 때 지연 생성(lazy)한다** — 화면 리스트 페이지 전체를 불러올 때 프롬프트 없는 화면 전부에 대해 한꺼번에 Claude를 호출하면(예: IA 생성 직후 화면 수십 개) 리스트 로딩이 느려지고 비용도 한 번에 몰린다. 상세 패널을 열 때 그 화면 하나에 대해서만 생성하는 게 Story 3.1~3.3이 세운 "N+1 방지"와는 다른 축의 트레이드오프지만, "필요한 시점에만 호출"이 더 합리적이다.
- **재실행 시 이미 프롬프트가 있으면 재호출하지 않는다** — `generateScreenPrompt`는 `screen.prompt`가 이미 채워져 있으면 API를 다시 부르지 않고 기존 값을 그대로 반환(비용 절감, Story 3.6의 "재실행해도 수정 내용 유지" 철학과 결이 같음).
- **테스트 프레임워크 없음** — `npm run build`+`lint`+`depcruise`+브라우저 실측(키 미설정 상태의 우아한 저하 경로)으로 검증한다. 실제 API 호출 검증은 사용자가 키를 넣은 후 별도 확인.

### References

- [Source: epics.md#Story 3.4, #FR-12] — `[2026-07-13 정정]` Claude API 실제 호출로 확정
- [Source: sprint-change-proposal-2026-07-13.md] — 모델 선정(`claude-haiku-4-5`), 원가 검토(100~300원/프로젝트)
- [Source: ARCHITECTURE-SPINE.md#AD-1] — `PromptGenerator` 포트/어댑터 경계
- [Source: ARCHITECTURE-SPINE.md#AD-5] — `prompt_source` 필드 단위 판정
- [Source: claude-api 스킬] — `@anthropic-ai/sdk` 최신 사용법, `claude-haiku-4-5` 모델 스펙(구모델 취급, effort/thinking 미지원)
- [Source: 3-3-define-screen-functions-and-button-links.md] — `updateScreenFields` 확장 패턴(pageId/pageName/funcDef와 동일하게 prompt 추가)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5) — 구현 에이전트. 프롬프트를 실제로 생성하는 런타임 모델은 `claude-haiku-4-5`(Claude API 어댑터).

### Debug Log References

- `claude-api` 스킬을 먼저 로드해 `@anthropic-ai/sdk` 최신 사용법과 `claude-haiku-4-5`가 구모델(older-model) 취급이라 `thinking`/`effort` 파라미터를 쓰지 않는다는 점을 확인한 뒤 구현
- `npm install @anthropic-ai/sdk` 완료
- ESLint `react-hooks/set-state-in-effect` 위반 발견 및 수정 — `useEffect` 안에서 `setGenerating(true)`를 동기 호출한 부분이 걸림. `generating` state의 초기값이 이미 `!screen.prompt`로 설정되어 있어 그 호출 자체가 불필요했으므로 제거
- 브라우저 자동화로 프로젝트 생성 → 메뉴 1개 → 화면 1개 생성 → 상세 패널을 열어 `ANTHROPIC_API_KEY` 미설정 상태에서 "AI 프롬프트 기능을 아직 사용할 수 없어요. 관리자 설정이 필요해요." 안내가 정상적으로 뜨는지 확인(에러로 앱이 죽지 않고 우아하게 저하됨)
- **실제 Claude API 호출(AC #1)은 로컬/배포 환경 모두 `ANTHROPIC_API_KEY`가 없어 라이브로 검증하지 못했다** — 사용자가 Anthropic API 키를 발급해 `.env.local`과 Vercel 환경변수에 직접 추가한 뒤 별도로 확인이 필요하다(보안 정책상 Dev Agent가 키를 대신 입력할 수 없음)

### Completion Notes List

- `PromptGenerator` 포트/어댑터는 AD-1 경계를 지켜 어댑터가 Repository를 모르게 설계 — Application Service(`generate-screen-prompt.ts`)가 프로젝트/메뉴/화면/형제 화면을 모아 조립한 뒤 어댑터에 순수 데이터만 넘긴다
- `ANTHROPIC_API_KEY`는 모듈 로드 시점이 아니라 `generate()` 호출 시점에 `process.env`에서 읽는다 — 키를 나중에 추가해도 재배포 없이 곧바로 동작
- 자동 생성된 프롬프트는 `promptSource: 'auto'`를 유지하고, 사용자가 textarea를 실제로 고쳐 저장할 때만(`updateScreenFields`의 AD-5 diff 판정 재사용) `'manual'`로 전환
- 화면 상세 패널을 열 때만 지연 생성(lazy) — 화면 리스트 전체 로드 시점에 일괄 생성하지 않아 비용/지연 급증을 피함. 이미 프롬프트가 있으면 재호출하지 않음
- `ScreenListItem`의 "자동생성/수정됨" 배지 판정에 `promptSource`도 반영(Story 3.3의 `funcDefSource` 추가와 동일한 패턴)

### File List

- `package.json`, `package-lock.json` (수정 — `@anthropic-ai/sdk` 의존성 추가)
- `domain/ports/prompt-generator.ts` (신규)
- `domain/ports/screen-repository.ts` (수정 — `ScreenFieldsPatch`에 prompt/promptSource 추가)
- `adapters/prompt/llm/claude-prompt-generator.ts` (신규)
- `application/generate-screen-prompt.ts` (신규)
- `application/update-screen-fields.ts` (수정 — prompt 필드 지원)
- `app/(app)/dashboard/[projectId]/screens/generate-prompt-action.ts`, `update-prompt-action.ts` (신규)
- `app/(app)/dashboard/[projectId]/screens/screen-detail-panel.tsx` (수정 — AI프롬프트 섹션 추가)
- `app/(app)/dashboard/[projectId]/screens/screen-list-item.tsx` (수정 — `isModified`에 `promptSource` 반영)
