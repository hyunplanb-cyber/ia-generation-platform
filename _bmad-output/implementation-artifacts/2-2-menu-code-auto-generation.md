---
baseline_commit: 44cfa7a
---

# Story 2.2: 메뉴코드 자동 부여받기 (충돌 시 직접 입력)

Status: review

## Story

As a 메뉴를 추가하는 사용자,
I want 영문 메뉴명으로부터 메뉴코드가 자동으로 만들어지기를,
so that 화면 ID를 만들 때 이 코드가 바로 쓰일 수 있다.

## Acceptance Criteria

1. **Given** 영문 메뉴명 "Member"를 입력함 **When** 저장하면 **Then** 메뉴코드 "ME"(앞 2글자, 대문자)가 자동으로 부여된다. (`epics.md` 원문은 예시값이 "MR"로 되어 있으나 "앞 2글자, 대문자" 규칙 자체와 모순되는 오타다 — Story 2.1에서 이미 "Member"→"ME"로 구현·검증했으므로 이 스토리는 "ME"를 정답으로 삼는다.)
2. **Given** 이미 같은 프로젝트에 메뉴코드 "ME"가 존재함 **When** 같은 코드가 산출되는 메뉴명을 저장하려 하면 **Then** 자동 산출을 거부하고 "이미 사용 중인 코드예요, 직접 입력해 주세요" 안내와 함께 수동 코드 입력칸이 나타난다.
3. **Given** 영문 메뉴명이 1글자뿐이거나("A"), 코드가 예약어("PC"/"MO")와 같아짐 **When** 저장하려 하면 **Then** 마찬가지로 자동 산출을 거부하고 수동 입력을 요구한다.

## Tasks / Subtasks

- [x] Task 1: 메뉴코드 검증 도메인 상수/함수 (AC: #1, #2, #3)
  - [x] `domain/menu/menu-code-rules.ts` 신규 — `RESERVED_MENU_CODES = ["PC", "MO"] as const`(`ARCHITECTURE-SPINE.md#AD-2`가 요구하는 도메인 상수), `type MenuCodeRejection = "duplicate" | "invalid"`, `validateMenuCode(code: string, existingCodes: string[]): MenuCodeRejection | null` — `code.length < 2` 또는 `RESERVED_MENU_CODES.includes(code)`이면 `"invalid"`, `existingCodes.includes(code)`이면 `"duplicate"`, 둘 다 아니면 `null`(통과). 이 함수는 자동산출 코드와 수동입력 코드 양쪽에 동일하게 적용한다(`AD-2`: "UI 검증과 서버 검증이 같은 상수를 참조" — 자동/수동을 다른 규칙으로 검증하지 않는다)
  - [x] `domain/menu/derive-menu-code.ts`(Story 2.1에서 생성됨)는 그대로 둔다 — 순수 산출 함수와 검증 함수를 분리 유지(파일을 합치거나 새로 만들지 말 것)

- [x] Task 2: `addMenu` Application Service가 검증/수동코드를 처리하도록 확장 (AC: #1, #2, #3)
  - [x] `application/add-menu.ts` 수정 — 반환 타입을 `Promise<Menu>`에서 `Promise<AddMenuResult>`로 변경: `type AddMenuResult = { ok: true; menu: Menu } | { ok: false; reason: "duplicate" | "invalid" }`(도메인 계층이 아니라 이 파일에 정의 — application 계층은 Next.js/Drizzle을 import해도 되므로 여기 둬도 AD-1 위반 아님)
  - [x] `AddMenuRequest`에 `manualMenuCode: string | null` 추가
  - [x] 로직: `manualMenuCode`가 있으면(trim 후 비어있지 않으면) `.toUpperCase()`한 값을 후보 코드로, 없으면 `deriveMenuCode(input.nameEn).toUpperCase()`를 후보 코드로 삼는다. `listByProject(projectId)`로 기존 메뉴들의 `menuCode` 배열을 구해 `validateMenuCode(candidateCode, existingCodes)` 호출 → `null`이면 생성 진행(`{ ok: true, menu }`), 아니면 생성하지 않고 `{ ok: false, reason }` 반환
  - [x] **주의**: 기존 `listByProject` 호출은 이미 `sortOrder` 계산에 쓰이고 있었다(Story 2.1) — 검증용으로 다시 호출하지 말고 그 결과를 재사용할 것(같은 함수 안에서 이미 가져온 배열)

- [x] Task 3: Server Action이 결과에 따라 수동 입력 UI를 트리거 (AC: #2, #3)
  - [x] `app/(app)/dashboard/[projectId]/menus/actions.ts`의 `AddMenuState`에 `needsManualCode: boolean` 필드 추가
  - [x] `formData`에서 `manualMenuCode`(있을 수도, 없을 수도)를 읽어 `addMenu()`에 전달
  - [x] `addMenu()` 결과가 `{ ok: false, reason: "duplicate" }`이면 `{ error: "이미 사용 중인 코드예요, 직접 입력해 주세요.", needsManualCode: true, successToken: prevState.successToken }` 반환(AC #2 문구 그대로)
  - [x] `{ ok: false, reason: "invalid" }`이면 `{ error: "메뉴코드를 자동으로 만들 수 없어요. 직접 입력해 주세요.", needsManualCode: true, successToken: prevState.successToken }` 반환(AC #3)
  - [x] `{ ok: true }`면 기존과 동일하게 `revalidatePath` 후 `{ error: null, needsManualCode: false, successToken: prevState.successToken + 1 }`

- [x] Task 4: 메뉴 추가 폼에 수동 코드 입력칸 추가 (AC: #2, #3)
  - [x] `app/(app)/dashboard/[projectId]/menus/menu-form.tsx` 수정 — `state.needsManualCode`가 `true`일 때만 "메뉴코드 (직접 입력)" `Input`(`name="manualMenuCode"`, `required`, placeholder 예: "예: MB")을 메뉴명(영문) 아래에 표시. 이 상태는 실패한 제출 이후에도 폼이 리마운트되지 않으므로(성공 시에만 `key={state.successToken}`로 리셋) 이미 입력한 한글/영문명 값은 그대로 남아있다 — 별도로 값을 보존하는 로직을 추가하지 않아도 된다
  - [x] 에러 메시지(`state.error`)는 기존처럼 폼 하단에 표시

- [x] Task 5: 검증 (AC: #1, #2, #3)
  - [x] "Member"(영문) 저장 → 메뉴코드 "ME" 자동 부여 확인(AC #1)
  - [x] 같은 프로젝트에 영문명 "Merchant"(앞 2글자도 "ME") 추가 시도 → "이미 사용 중인 코드예요, 직접 입력해 주세요." 안내 + 수동 코드 입력칸 노출 확인 → "MC" 입력 후 재제출 → 정상 추가 확인(AC #2)
  - [x] 영문명 "A"(1글자) 저장 시도 → 수동 입력 요구 확인 → "AA" 등으로 재제출 → 정상 추가(AC #3 1글자 케이스)
  - [x] 영문명 "Mobile"(앞 2글자 대문자 "MO", 예약어) 저장 시도 → 수동 입력 요구 확인 → "MB" 등으로 재제출 → 정상 추가(AC #3 예약어 케이스)
  - [x] 수동 입력칸에도 이미 사용 중인 코드나 예약어를 입력하면 다시 같은 방식으로 거부되는지 확인(자동/수동 동일 규칙 검증)
  - [x] `npm run build`, `npm run lint`, `npm run depcruise` 통과
  - [x] 검증에 사용한 테스트 계정/프로젝트/메뉴 데이터 정리

## Dev Notes

- **`epics.md`의 AC 예시값 오타 정정** — 원문 "영문 메뉴명 'Member' → 메뉴코드 'MR'"은 같은 문장이 명시한 "앞 2글자, 대문자" 규칙과 모순된다("Member"의 앞 2글자는 "Me"). Story 2.1에서 이미 "ME"로 구현·브라우저 검증까지 마쳤으므로 이 스토리는 "ME"를 정답으로 삼아 AC #1을 정정해 기술했다. 구현 시 코드를 "MR"에 맞추지 말 것.
- **자동산출과 수동입력은 완전히 같은 검증 규칙을 통과해야 한다** — `validateMenuCode()` 하나만 두고 두 경로 모두 이 함수를 거치게 한다(`AD-2`). 수동입력이라고 예약어/중복 검사를 건너뛰게 만들면 Epic 3의 페이지ID 규칙(`{DEVICE}{MENUCODE}{NNNN}`)에서 "PC"/"MO" 메뉴코드가 디바이스코드와 뒤섞이는 문제가 재발한다.
- **Story 2.1의 `deriveMenuCode()`는 그대로 재사용** — 이 스토리가 감싸는 것은 "산출된 코드가 통과하는지"이지 산출 로직 자체가 아니다. `derive-menu-code.ts`를 수정하거나 중복 생성하지 말 것.
- **`addMenu()`의 반환 타입이 바뀐다** — Story 2.1까지는 `Promise<Menu>`였지만 이제 "검증 실패"가 예외가 아니라 정상적인 두 갈래 결과 중 하나이므로 `AddMenuResult` 유니온을 반환한다. 이 함수를 호출하는 곳이 현재는 `actions.ts` 하나뿐이라 파급 영향은 없다.
- **폼 리마운트 타이밍에 주의** — `menu-form.tsx`는 `key={state.successToken}`로 "성공 시에만" 리마운트된다(Story 2.1에서 이미 구현). 검증 실패(수동 입력 요구) 시에는 `successToken`이 바뀌지 않으므로 리마운트되지 않고, 사용자가 입력한 한글명/영문명 값이 그대로 남는다 — 이 동작을 깨지 않도록 실패 시 `successToken`을 그대로 반환할 것(Task 3에 명시).
- **테스트 프레임워크 없음** — Story 1.1~2.1과 동일하게 `npm run build`+`lint`+`depcruise`+브라우저 실측으로 검증한다.

### Project Structure Notes

```
{repo-root}/
  domain/
    menu/
      menu-code-rules.ts                    # 신규 — RESERVED_MENU_CODES, validateMenuCode()
      derive-menu-code.ts                   # 변경 없음 (Story 2.1)
  application/
    add-menu.ts                             # 수정 — AddMenuResult 반환, manualMenuCode 처리
  app/(app)/
    dashboard/[projectId]/menus/
      actions.ts                            # 수정 — needsManualCode 상태 처리
      menu-form.tsx                         # 수정 — 수동 코드 입력칸 조건부 렌더
```

### References

- [Source: epics.md#Story 2.2, #Epic 2, #FR-5]
- [Source: ARCHITECTURE-SPINE.md#AD-2] — 예약어/1글자 규칙은 도메인 상수, 자동/수동 동일 검증
- [Source: 2-1-add-menu.md] — `deriveMenuCode()`, `addMenu()`/`listMenus()`/`menu-form.tsx`/`actions.ts`의 기존 구조와 `successToken` 리마운트 패턴

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm run build` — 성공
- `npm run lint` — 통과(수정 없이 최초 통과)
- `npm run depcruise` — "no dependency violations found (29 modules, 43 dependencies cruised)"
- 브라우저 실측 중 Dev Notes의 가정이 실제로는 틀렸음을 발견하고 즉시 수정함(아래 Completion Notes 참조)
- "Member"→"ME" 자동 부여(AC #1), "Merchant"(충돌)→수동입력 "MC"로 재제출 성공(AC #2), "A"(1글자)→수동입력 "AA"로 재제출 성공(AC #3), "Mobile"(예약어 "MO")→수동입력 시도에서 "MO"를 다시 입력해도 예약어로 재거부되는 것까지 확인 후 "MB"로 재제출 성공(AC #3 + 자동/수동 동일 규칙 검증) — 모두 브라우저에서 실제로 확인
- 검증에 사용한 테스트 계정/프로젝트/메뉴 데이터는 Neon에서 직접 삭제해 정리 완료

### Completion Notes List

- **Dev Notes의 가정을 실제로 검증하다가 틀렸음을 발견 — 즉시 수정함**: 원래 계획은 "`key={state.successToken}`가 성공시에만 바뀌니 실패 시 입력값이 그대로 남는다"였다. 그러나 브라우저로 직접 재현해보니 React 19의 Form Action은 **성공/실패와 무관하게 매 액션 호출 후 폼 내 비제어(uncontrolled) 필드를 리셋**한다는 사실을 확인했다(공식 문서화된 동작). 그 결과 충돌 에러 후 한글/영문 메뉴명이 사라져 수동 코드만 입력하고 재제출하면 "메뉴명을 입력해 주세요" 에러가 반복되는 실질적 버그가 있었다.
  - **수정 내용**: `AddMenuState`에 `values`(제출된 nameKo/nameEn/description/desiredFeatures)를 추가하고, `successToken` 대신 이 값들을 각 입력의 `defaultValue`로 연결했다. React가 액션 후 필드를 리셋할 때 "가장 최근 렌더된 defaultValue"로 되돌아가므로, 실패 시엔 입력값이 보존되고 성공 시엔(서버가 빈 값을 반환) 자연히 폼이 비워진다. `key={state.successToken}` 리마운트 트릭은 더 이상 필요 없어 제거했다.
  - 이 발견은 Epic 2 나머지 스토리(2.3/2.4)나 Epic 3에서 유사한 "제출 실패 후 값 보존" 폼을 또 만들 때 그대로 적용해야 한다 — `key` 리마운트가 아니라 서버 상태의 `values`를 `defaultValue`로 연결하는 패턴을 표준으로 삼을 것.
- `validateMenuCode()`는 자동산출 코드와 수동입력 코드 모두에 동일하게 적용 — 수동입력이라고 예약어(PC/MO) 검사를 건너뛰지 않는다(브라우저에서 "MO" 수동입력이 재거부되는 것으로 확인). Epic 3의 페이지ID 규칙과의 충돌을 막기 위한 의도적 설계.
- `epics.md` Story 2.2 AC #1의 예시값 오타("Member"→"MR")는 "ME"로 정정해 구현·검증했다(Story 2.1과 일관).

### File List

- `domain/menu/menu-code-rules.ts` (신규)
- `application/add-menu.ts` (수정 — `AddMenuResult` 반환, `manualMenuCode` 처리)
- `app/(app)/dashboard/[projectId]/menus/actions.ts` (수정 — `needsManualCode`, `values` 상태 추가)
- `app/(app)/dashboard/[projectId]/menus/menu-form.tsx` (수정 — 수동 코드 입력칸, `defaultValue` 기반 값 보존)
