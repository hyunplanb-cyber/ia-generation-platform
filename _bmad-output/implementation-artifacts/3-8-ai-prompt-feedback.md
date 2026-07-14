---
baseline_commit: be32db5
---

# Story 3.8: AI프롬프트에 좋아요·싫어요 남기기

Status: review

## Story

As a 자동생성된 프롬프트를 확인한 사용자,
I want 이 프롬프트가 쓸만한지 👍/👎로 평가하기를,
so that 서비스가 프롬프트 품질을 계속 개선해 나갈 수 있다.

## Acceptance Criteria

1. **Given** 화면 상세 패널의 AI프롬프트 영역 **When** 👍 또는 👎를 클릭하면 **Then** 평가가 저장되고 짧은 감사 메시지가 뜬다.
2. **Given** 이미 평가를 남긴 상태 **When** 같은 버튼을 다시 클릭하면 **Then** 평가가 취소된다.

## Tasks / Subtasks

- [x] Task 1: 프롬프트 피드백 저장 (AC: #1, #2)
  - [x] `domain/ports/screen-repository.ts`에 `setPromptFeedback(id: string, projectId: string, feedback: PromptFeedback): Promise<void>` 추가
  - [x] `adapters/repository/drizzle/screen-repository.ts`에 구현 — `UPDATE screen SET prompt_feedback = ? WHERE id = ? AND project_id = ?`
  - [x] `application/set-prompt-feedback.ts` 신규 — `setPromptFeedback(projectId, screenId, feedback: PromptFeedback)`: `withProjectAuth`로 감싸 `screenRepository.setPromptFeedback()` 호출. 토글 여부(같은 값 다시 클릭 → 취소) 판단은 서버가 다시 조회하지 않고 **클라이언트가 이미 알고 있는 현재 값으로 계산해 최종 값을 그대로 전달**한다(화면은 이미 `screen.promptFeedback`을 prop으로 갖고 있으므로 왕복 조회가 불필요 — `updateScreenFields`처럼 `*_source` 필드 그룹 추적이 필요 없는 단순 메타데이터라 AD-5의 통합 커맨드 대상이 아님, Dev Notes 참고)
  - [x] `app/(app)/dashboard/[projectId]/screens/set-prompt-feedback-action.ts` 신규 — 서버 액션, `revalidatePath(`/dashboard/${projectId}/screens`)`

- [x] Task 2: 화면 상세 패널에 👍/👎 버튼 추가 (AC: #1, #2)
  - [x] `app/(app)/dashboard/[projectId]/screens/screen-detail-panel.tsx`의 `PromptSection`(프롬프트가 실제로 존재하는 마지막 반환 분기, `hasPrompt && !generateFailed`) 안에 `PromptFeedbackButtons` 서브컴포넌트를 추가 — 기존 `<form>` 바깥의 형제 요소로 배치(현재 `PromptSection`의 최종 return이 `<form>` 하나뿐이므로 감싸는 `<div>`로 바꿔야 함)
  - [x] `PromptFeedbackButtons({ screen, projectId })` — `useState`로 로컬 `feedback` 값을 `screen.promptFeedback`으로 초기화. 버튼 클릭 시 `next = feedback === value ? null : value`로 계산해 로컬 상태를 낙관적으로 갱신하고 `setPromptFeedbackAction(projectId, screen.id, next)` 호출(`useTransition` 사용, 기존 `GenerateScreensButton` 패턴과 동일). 현재 선택된 버튼은 `variant="secondary"`, 아닌 쪽은 `variant="ghost"`로 구분(기존 `Button` 컴포넌트 재사용, 새 UI 라이브러리 추가 없음)
  - [x] 새로 평가를 남길 때만(취소가 아니라 up/down으로 "설정"될 때만) 2초 정도 "피드백 감사해요!" 문구를 보여주고 사라지게 함(`setTimeout` + 로컬 상태 — 별도 토스트 라이브러리 없이 기존 코드베이스 관례대로 구현). 취소 시에는 AC #2가 메시지를 요구하지 않으므로 띄우지 않는다

- [x] Task 3: 검증 (AC: #1, #2)
  - [x] 화면 상세에서 AI 프롬프트가 로드된 뒤 👍 클릭 → 버튼이 선택 상태로 바뀌고 "피드백 감사해요!" 문구가 잠깐 떴다 사라지는지 확인 → 새로고침 후에도 👍가 선택된 상태로 남아있는지 확인(DB 반영 확인)
  - [x] 같은 👍를 다시 클릭 → 선택 해제되는지 확인(감사 메시지는 안 떠야 함) → 새로고침 후에도 선택 해제 상태가 유지되는지 확인
  - [x] 👎로 전환 → 👍가 자동으로 해제되고 👎만 선택되는지 확인
  - [x] `npm run build`, `npm run lint`, `npm run depcruise` 통과
  - [x] 검증에 사용한 테스트 데이터 정리

## Dev Notes

### 이미 준비되어 있는 것들

- DB 컬럼(`screen.prompt_feedback`, `'up'|'down'|null`)과 도메인 타입(`domain/screen/screen.ts`의 `PromptFeedback`)은 Story 3.1부터 이미 존재한다 — 이번 스토리는 이 값을 실제로 읽고 쓰는 UI/서버 로직만 추가하면 된다. 스키마 변경이 필요 없다.
- `app/(app)/dashboard/[projectId]/screens/screen-detail-panel.tsx`의 `PromptSection`은 이미 `hasPrompt`/`generateFailed`/`unavailable`/`generating` 네 가지 상태를 분기 처리한다(Story 3.4). 피드백 버튼은 프롬프트가 실제로 존재하는 마지막 분기(`hasPrompt && !generateFailed`)에만 넣는다 — AI 프롬프트 기능이 비활성화(`unavailable`)되거나 아직 생성 중일 때는 평가할 대상 자체가 없으므로 표시하지 않는다.

### 왜 `updateScreenFields()`(AD-5 통합 커맨드)를 재사용하지 않는가

- AD-5는 "화면 데이터를 바꾸는 진입점(인라인 편집/그리드/재실행/재계산)은 모두 `updateScreenFields()`를 통과한다"고 규정하지만, 이는 `*_source`(`auto`|`manual`) 필드 그룹(페이지ID/페이지명/기능정의/AI프롬프트 **텍스트 내용**)에 해당하는 규칙이다. `prompt_feedback`은 프롬프트 텍스트 자체를 바꾸는 게 아니라 별개의 평가 메타데이터이고 `*_source` 대응 필드가 없다 — Story 3.5의 `schedule_locked`도 `*_source`가 아닌 별도 boolean으로 처리했던 것과 같은 종류의 예외다. 그래서 `set-prompt-feedback.ts`라는 단순 전용 커맨드를 새로 둔다.

### 낙관적 동시성(AD-9) 미적용 이유

- `updateFields()`/`updateScheduleAction` 등은 `expectedUpdatedAt`으로 낙관적 동시성을 검사하지만, 피드백은 값 손실의 피해가 낮은 단순 토글(한 사용자가 자기 프로젝트에서 누르는 개인 평가)이라 이번 스토리에서는 그 검사를 넣지 않는다. 대신 서버가 매번 재조회해 토글을 판단하지 않고, 클라이언트가 이미 가진 `screen.promptFeedback` prop으로 다음 값을 계산해 그대로 전달하는 단순한 방식을 쓴다(Task 1 참고).

### UI 컴포넌트

- 새 아이콘 라이브러리나 토스트 라이브러리를 추가하지 않는다. 👍/👎는 이모지 그대로 쓰고, 선택 상태 표시는 기존 `components/ui/button.tsx`의 `variant="secondary"`(선택됨)/`variant="ghost"`(선택 안 됨)만으로 구분한다. 감사 메시지는 `useState` + `setTimeout`으로 잠깐 보였다 사라지는 텍스트 한 줄로 충분하다(기존 코드베이스에 토스트/알림 컴포넌트가 없음 — Story 3.5/3.6의 `confirm()`/`alert()` 사용 패턴과 마찬가지로 있는 것만 활용).

### 테스트 프레임워크 없음

- `npm run build`+`lint`+`depcruise`+브라우저 실측으로 검증한다(Story 3.1~3.7과 동일). 단, 로컬에는 `ANTHROPIC_API_KEY`가 없어 AI 프롬프트 자체는 "아직 사용할 수 없어요" 상태로 남는다 — 프롬프트가 없으면 피드백 버튼도 뜨지 않으므로, 브라우저 검증 시 프롬프트가 있는 상태를 만들어야 한다. `application/update-screen-fields.ts`(또는 DB 직접 UPDATE)로 화면의 `prompt` 필드를 임의 텍스트로 채워 `hasPrompt` 분기를 강제로 타게 하거나, 화면 상세 패널에서 "AI 프롬프트 저장" 폼으로 직접 텍스트를 입력해 저장하면 그다음부터 `hasPrompt`가 `true`가 되어 피드백 버튼이 나타난다(재생성 시도 없이도 검증 가능).

### References

- [Source: epics.md#Story 3.8, #FR-20]
- [Source: ARCHITECTURE-SPINE.md#AD-5] — `updateScreenFields()` 통합 커맨드의 적용 범위(피드백은 대상 아님)
- [Source: 3-5-screen-schedule-and-recalculation.md] — `*_source`가 아닌 별도 boolean/메타데이터 필드를 다루는 선례(`schedule_locked`)
- [Source: db/schema.ts] — `screen.prompt_feedback` 컬럼(Story 3.1부터 존재)
- [Source: domain/screen/screen.ts] — `PromptFeedback` 타입(`"up" | "down" | null`)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.8 (claude-opus-4-8)

### Debug Log References

- 로컬에 ANTHROPIC_API_KEY가 없어 프롬프트가 "아직 사용할 수 없어요"(unavailable) 상태로만 떠서 피드백 버튼이 렌더링되지 않음. Dev Notes에 적어둔 대로 일회성 스크립트로 테스트 화면(PCME1000)의 `prompt` 컬럼에 임의 텍스트를 채워 `hasPrompt` 분기를 타게 한 뒤 검증. `screen.pageId`는 프로젝트 스코프 유니크라 방금 만든 신규 계정의 화면만 매칭됨을 `updated: 1`로 확인.

### Completion Notes List

- `screen.prompt_feedback` 컬럼과 `PromptFeedback` 타입은 Story 3.1부터 이미 존재 — 스키마 변경 없이 읽기/쓰기 로직만 추가.
- `setPromptFeedback` 포트/어댑터/애플리케이션 서비스/서버 액션을 얇게 추가. 토글 판단은 서버 재조회 없이 클라이언트가 가진 `screen.promptFeedback` prop으로 다음 값을 계산해 전달(AD-5 통합 커맨드/AD-9 낙관적 동시성 미적용 — Dev Notes에 근거 기록).
- `PromptSection`의 프롬프트 존재 분기 최종 return을 `<div>`로 감싸고 `PromptFeedbackButtons`를 형제로 배치. 👍/👎는 이모지 + 기존 `Button` variant(secondary/ghost)로만 선택 상태를 표현(새 라이브러리 없음). 새 평가 설정 시에만 `useState`+`setTimeout`으로 "피드백 감사해요!"를 2초간 표시, 취소 시에는 미표시.
- 브라우저 검증 4종 모두 통과: (1) 👍 클릭 시 선택 표시 + 새로고침 후에도 유지(DB 반영), (2) 같은 버튼 재클릭 시 해제 + 감사 메시지 미표시 + 새로고침 후 해제 유지, (3) 👍→👎 전환 시 👍 자동 해제, (4) build/lint/depcruise 통과.
- 검증에 쓴 테스트 계정(story38tester@example.com)과 프로젝트/메뉴/화면 데이터는 일회성 스크립트로 정리 완료.

### File List

- `domain/ports/screen-repository.ts` (수정 — `setPromptFeedback` 포트 추가)
- `adapters/repository/drizzle/screen-repository.ts` (수정 — `setPromptFeedback` 구현)
- `application/set-prompt-feedback.ts` (신규)
- `app/(app)/dashboard/[projectId]/screens/set-prompt-feedback-action.ts` (신규)
- `app/(app)/dashboard/[projectId]/screens/screen-detail-panel.tsx` (수정 — `PromptFeedbackButtons` 추가, `PromptSection` return을 div로 래핑)
