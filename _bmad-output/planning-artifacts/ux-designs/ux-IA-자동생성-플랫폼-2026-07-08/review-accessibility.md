---
title: 접근성 검토 (Ad-hoc Lens) — IA 자동생성 플랫폼
reviewed:
  - DESIGN.md
  - EXPERIENCE.md
date: 2026-07-08
---

# 접근성 검토 결과

WCAG AA를 목표로 명시했으나(EXPERIENCE.md "Accessibility Floor"), 실제 색상 토큰·행동 명세를 대조한 결과 몇 가지 구체적 위험을 발견했다. 색상 대비는 실제 상대휘도 공식으로 근사 계산한 결과이며, 최종 확정 전 도구(예: WebAIM Contrast Checker)로 재검증이 필요하다.

---

**[영향도: 상]** 상태배지 3종(success/warning/danger) 전경색이 배경색 대비 AA 텍스트 기준(4.5:1) 미달

- 설명: DESIGN.md의 `status-badge` variants는 시맨틱 색상의 진한 값을 배경(`-soft`)에, 같은 계열의 "선명한" 값을 전경(텍스트)에 쓴다. 실제 상대휘도로 계산하면:
  - success: 전경 `#1F9E64` / 배경 `#E3F7EC` ≈ **3.06:1**
  - warning: 전경 `#B7791F` / 배경 `#FCEFD6` ≈ **3.2:1**
  - danger: 전경 `#D93B3B` / 배경 `#FBE4E4` ≈ **3.73:1**
  - 세 값 모두 일반 텍스트 AA 기준 4.5:1에 못 미친다. 배지 라벨은 `{typography.label}`(12px)로 "large text" 예외(18pt/14pt bold 이상) 대상도 아니라서 3:1 완화 기준도 적용받지 못한다.
- 문제 토큰: DESIGN.md `colors.success/success-soft`, `colors.warning/warning-soft`, `colors.danger/danger-soft`, `components.status-badge.variants`.
- 제안: 세 시맨틱 색상의 전경 값을 배지 배경 대비 최소 4.5:1을 만족하도록 어둡게 조정(예: warning은 갈색 계열을 한 단계 더 낮은 명도로, success/danger도 채도는 유지하되 명도를 낮춤). 상태배지는 "깨진 링크/범위 이탈" 등 제품의 핵심 경고 신호이므로 실제 컨트라스트 툴로 재검증 후 토큰을 확정할 것.

---

**[영향도: 상]** 표 셀을 키보드만으로 "편집 모드 진입"시키는 방법이 명세에 없음

- 설명: EXPERIENCE.md Component Patterns 표는 "셀 더블클릭으로 인라인 편집"이라고만 서술하고, Interaction Primitives는 "셀 더블클릭 인라인 편집 — ... `Enter` 저장, `Esc` 취소"라고 해 `Enter`를 이미 편집 모드에 들어간 뒤의 "저장" 동작으로만 정의한다. 방향키 이동(`표 키보드 내비게이션`)으로 셀을 선택한 상태에서 마우스 더블클릭 없이 편집 모드로 들어가는 트리거(예: `Enter`/`F2`로 진입, 문자 입력 시 자동 진입 등)가 어디에도 명시되지 않았다. 이대로면 개발자는 "더블클릭이 유일한 편집 진입 수단"으로 구현할 가능성이 높고, 이는 곧 키보드 전용 사용자가 인라인 편집 기능 자체를 쓸 수 없게 되는 결과로 이어진다.
- 문제 섹션: EXPERIENCE.md "Component Patterns"의 `화면 리스트 행` 행, "Interaction Primitives"의 "셀 더블클릭 인라인 편집" 항목, "Accessibility Floor"의 "방향키 이동 + Enter 편집" 문구(이 문구 자체가 위 둘과 상충 — Accessibility Floor는 Enter를 "편집 진입"으로 쓰는 것처럼 읽히지만 Interaction Primitives는 "저장"으로 정의).
- 제안: 셀 선택(포커스) 상태와 편집 상태를 구분하고, `Enter`(또는 `F2`)로 선택 셀을 편집 모드로 전환 → 편집 중 `Enter`는 저장 후 다음 행 동일 열로 이동(스프레드시트 관례), `Esc`는 편집 취소 후 선택 상태로 복귀하도록 상태 전이를 명시적으로 기술.

---

**[영향도: 상]** 화면 상세 사이드패널 닫힘 시 포커스 복귀 지점 미정의

- 설명: "화면 리스트 행 클릭 → 상세 패널" 오픈은 명시되어 있으나, 패널을 닫을 때(닫기 버튼, `Esc`, 다른 곳 클릭 등 어떤 방법으로 닫는지 자체도 불명확) 포커스가 원래 트리거였던 표의 행/셀로 돌아오는지에 대한 언급이 EXPERIENCE.md 전체에 없다. 표 기반 편집 흐름에서 상세 패널을 반복적으로 열고 닫는 것이 핵심 동선(Flow 1의 4~5단계)인데, 포커스가 패널 닫힘 후 문서 최상단이나 `body`로 튕기면 키보드 사용자는 매번 표 위치를 방향키로 다시 찾아야 한다.
- 문제 섹션: EXPERIENCE.md IA 표의 "화면 상세 패널" 행, Component Patterns의 "화면 리스트 행"/"페이지ID 선택기" 행 — 패널을 닫는 키(예: `Esc`)와 포커스 반환 대상이 모두 미명시.
- 제안: 사이드패널에 `Esc` 닫기 단축키를 명시하고, 닫힘 시 포커스는 패널을 연 트리거 셀(또는 행)로 복귀하도록 규정. 동일 원칙을 재실행 확인 다이얼로그, 페이지ID 선택기 팝오버에도 적용.

---

**[영향도: 중]** 페이지ID 선택기(드롭다운/자동완성)의 키보드 조작 절차가 결과 개수 안내 외에는 미명세

- 설명: Component Patterns의 "페이지ID 선택기" 행은 "검색/자동완성하는 드롭다운만 허용"이라고만 되어 있고, Accessibility Floor는 "검색어 입력 시 결과 개수를 `aria-live`로 안내"만 규정한다. 정작 드롭다운을 여는 방법, 방향키로 옵션 이동, `Enter`로 선택, `Esc`로 닫기(및 그 후 포커스 위치) 같은 실제 조작 시퀀스는 어디에도 없다. "자유 텍스트 입력 금지"라는 강한 제약(FR-11) 때문에 이 컴포넌트는 특히 정밀한 키보드 명세가 필요한데 현재는 결과 개수 안내라는 세부사항 하나만 정의되고 조작 절차 전체가 구현자 재량에 맡겨져 있다.
- 문제 섹션: EXPERIENCE.md "Component Patterns" > 페이지ID 선택기, "Accessibility Floor" 3번째 불릿.
- 제안: 표준 콤보박스 패턴(WAI-ARIA Combobox)에 따라 열기/방향키 이동/`Enter` 선택/`Esc` 취소·닫기/닫힘 후 포커스 위치를 명시.

---

**[영향도: 중]** 고급 설정 접기/펼치기 패널의 접근 가능한 시맨틱스(버튼/aria-expanded) 미명시

- 설명: Component Patterns의 "고급 설정 패널" 행은 "접힌 상태가 기본... 펼침 상태는 세션 내 기억"만 규정하며, 이 토글이 실제 `<button>` 요소인지, `aria-expanded` 상태를 노출하는지, 스페이스/엔터로 조작 가능한지는 언급이 없다. DESIGN.md에도 이 컴포넌트에 대한 시각 스펙 자체가 없어(components 섹션에 없음) 순수 클릭 가능한 `<div>`로 구현될 위험이 있다.
- 문제 섹션: EXPERIENCE.md "Component Patterns" > 고급 설정 패널 행 (DESIGN.md `components`에 해당 컴포넌트 항목 자체가 없음).
- 제안: "고급 설정" 토글은 네이티브 `<button>` + `aria-expanded`를 사용하고 키보드로 토글 가능해야 한다는 문장을 Accessibility Floor 또는 Component Patterns에 추가.

---

**[영향도: 중]** Primary-soft / neutral-badge-soft 배경 대비가 AA 경계선에 걸쳐 있어 실제 확인 필요

- 설명: `sidebar-nav-item-active`(전경 `#5B4FE5` / 배경 `#EDE9FE`)는 근사 계산으로 약 **4.79:1**로 4.5:1을 간신히 통과하고, `neutral-badge`(전경 `#6B6F76` / 배경 `#EEEEF0`)는 약 **4.35:1**로 오히려 근소하게 미달한다. 둘 다 폰트 굵기·안티에일리어싱에 따라 실측 결과가 뒤집힐 수 있는 경계 값이다.
- 문제 토큰: DESIGN.md `components.sidebar-nav-item-active`, `colors.neutral-badge` / `neutral-badge-soft`.
- 제안: 두 조합 모두 실제 컨트라스트 체커로 확정하고, neutral-badge는 전경색을 한 단계 어둡게(예: `#5A5E66`대) 조정해 여유를 확보.

---

**[영향도: 하]** 저장 실패 등 오류성 토스트의 `aria-live` 우선순위 미지정

- 설명: 진행 모달의 스크린리더 안내("화면 생성 중, N% 완료")는 명시했지만, State Patterns의 "저장 실패" 행("토스트(destructive): 저장하지 못했어요...")은 시각적 문구만 정의되고 스크린리더에 즉시(assertive) 안내되어야 하는지 여부가 없다. 데이터 손실 위험이 있는 오류인 만큼 `polite`보다 강한 알림이 필요할 수 있다.
- 문제 섹션: EXPERIENCE.md "State Patterns" > 저장 실패 행.
- 제안: destructive 토스트류는 `aria-live="assertive"` (또는 role="alert")로 안내하도록 Accessibility Floor에 한 줄 추가.

---

**[영향도: 하]** 조밀한 행 안 인터랙티브 요소의 터치/클릭 타겟 크기 미지정 (오류라기보다 공백)

- 설명: 일괄 선택 체크박스, 👍/👎 피드백 아이콘 버튼, "+N" 배지 확장 등은 모두 데이터 밀도가 높은 표 행 안에 배치되는 작은 인터랙티브 요소인데, DESIGN.md·EXPERIENCE.md 어디에도 최소 크기 기준이 없다. 데스크톱 우선이라 마우스 클릭 정밀도 문제는 상대적으로 작지만, WCAG 2.2 기준(2.5.8, AA)을 따를 경우 최소 24×24px 권장이 있다.
- 문제 섹션: EXPERIENCE.md "Component Patterns" > 상태배지/AI프롬프트 피드백 행, "Interaction Primitives" > 일괄 작업 항목 — 크기 관련 언급 자체가 없음.
- 제안: 결함이 아니라 미정 사항이므로, Architecture/컴포넌트 스펙 단계에서 최소 타겟 크기 기준을 명시하도록 플래그.
