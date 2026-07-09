# Spine Pair Review — IA 자동생성 플랫폼

## Overall verdict

전체 골격(섹션 순서, 톤, 토큰 체계)은 견고하고 핵심 플로우(생성/재생성/깨진 링크/피드백)는 다운스트림이 그대로 시공 가능한 수준으로 잘 committed 되어 있다. 다만 PRD의 "변경 이후 상태 전이" 계열 요구사항(FR-9 디바이스 방식 변경, FR-13 일정 겹침/역전, FR-5/6 메뉴코드 충돌) 일부가 누락되어 있고, 화면 상세 패널·대시보드 같은 핵심 표면의 State 정의와 새 컴포넌트(페이지ID 선택기, 고급 설정 패널) 3종의 시각 스펙이 비어 있어, 아키텍처/개발 단계에서 이 지점들만큼은 PRD를 직접 재해석해야 하는 상황이 발생할 것이다. 시각 레퍼런스 3종은 문서에 개념적으로 녹아 있으나 실제 파일과 연결되지 않아 추적성이 끊긴다.

## 1. Flow coverage — 씬(thin)

PRD FR-1~FR-20 전체를 훑어 EXPERIENCE.md의 Information Architecture / Component Patterns / State Patterns / Key Flows에 표현이 있는지 대조했다. FR-7·FR-8·FR-11·FR-20(과제에서 명시적으로 지정된 핵심 메커닉 중 3개)은 Key Flow 또는 Component/State Patterns에 구체적 규칙까지 잘 안착해 있다. 그러나 지정된 FR-9(디바이스 모드 전환)는 "입력 위치"만 있고 "전환 후 결과" 처리가 통째로 빠져 있으며, FR-13의 일부(겹침/역전), FR-5·FR-6(메뉴코드 충돌·변경), FR-3(전체 일정 재계산 확인)도 누락되어 있다.

### Findings
- **critical** FR-9(디바이스 대응 방식을 화면 생성 이후 변경 시, 기존 페이지ID는 유지하고 신규 화면부터 새 방식 적용, 신/구 혼재를 경고 배너로 알림)에 대한 실험 차원의 처리가 EXPERIENCE.md 어디에도 없다. IA 표(프로젝트 설정 행, "디바이스 대응방식 입력 (FR-9)")와 "고급 설정 패널" 행(EXPERIENCE.md L58)은 입력 지점만 언급할 뿐, PRD가 명시한 "혼재 경고 배너" 자체는 State Patterns(EXPERIENCE.md L62-74)에도, Component Patterns(L47-60)에도 대응 행이 없다. FR-6의 메뉴코드 혼재·FR-13의 범위 이탈은 각각 전용 배지/State 행이 있는데 FR-9만 대칭 처리가 빠져, 이대로면 Architecture 단계가 이 배너의 UX(문구/노출 위치/지속 여부)를 스스로 설계해야 한다. *Fix:* State Patterns 표에 "디바이스 방식 변경 후 혼재" 행을 추가하고, 상태배지 목록(Component Patterns "상태배지" 행, L54)에 배지 종류를 하나 더한다.
- **medium** FR-13 세 번째 요구사항인 "화면 간 일정 겹침/역전(선행 화면이 후행 화면보다 늦게 끝나는 경우) 경고"는 "범위 이탈"과 별개 메커니즘인데 상태배지 목록(EXPERIENCE.md L54: 깨진 링크/범위 이탈/메뉴 삭제됨/격리됨/자동생성/수정됨)에 해당 배지가 없고 State Patterns(L62-74)에도 행이 없다. *Fix:* "일정 역전/겹침" 배지 및 State Patterns 행을 "범위 이탈 일정" 행 옆에 추가.
- **medium** FR-6 두 번째 항목(메뉴코드 변경 시 신/구 코드 혼재를 화면 목록에 경고 표시)이 State Patterns에 없다. "메뉴 삭제로 격리된 화면" 행(L71)은 메뉴 삭제만 다루고, 메뉴코드 *변경*으로 인한 신/구 코드 혼재는 별개 케이스로 방치되어 있다. *Fix:* State Patterns에 "메뉴코드 변경으로 신/구 코드 혼재" 행 추가(FR-9의 디바이스 방식 혼재 경고와 동일 패턴으로 처리 가능).
- **medium** FR-5(메뉴코드 자동산출 거부 조건: 코드 중복/1글자/예약어 PC·MO)가 발생했을 때 메뉴 관리 화면에서 어떻게 안내되는지 State Patterns에 없다. "메뉴 없음(최초 진입)" 행(L66)만 있고 코드 충돌 시의 인라인 오류 상태가 빠져 있다. *Fix:* 메뉴 관리 State Patterns에 "메뉴코드 자동산출 실패(수동 입력 요구)" 행 추가.
- **medium** FR-3(전체 일정 수정 시 화면별 일정 재계산 트리거 — "사용자 확인 후 적용, 수동 수정분을 덮어쓰지 않도록 경고")가 IA 표에서 라벨(L24 "FR-1, FR-3, FR-9")로만 존재하고, FR-8의 "재실행 확인 다이얼로그"(L57)에 대응하는 자체 확인 다이얼로그 규칙이 없다. *Fix:* Component Patterns에 "전체 일정 재계산 확인 다이얼로그" 행을 FR-8 재실행 다이얼로그와 대칭으로 추가.
- **low** FR-17(GNB/Footer)이 PRD에서 "상세 메뉴 구성은 UX 단계에서 확정"으로 명시 위임되었으나, EXPERIENCE.md는 로그인 후 GNB 구성(로고/대시보드/프로필, L32)만 정하고 비로그인 마케팅 랜딩의 GNB/Footer 세부 항목(이용약관·개인정보처리방침 링크 등)은 IA 표의 "GNB/Footer 포함"(L30) 서술 이상으로 확정하지 않았다. *Fix:* 마케팅 랜딩 행에 Footer 링크 목록을 명시하거나, 위임을 Architecture/다음 단계로 명확히 재위임.

## 2. Token completeness — 강함(strong)

DESIGN.md frontmatter의 colors/typography/rounded/spacing 토큰 전체와 `components` 블록·본문에서 쓰인 모든 `{path.to.token}` 참조를 대조했다. `{colors.primary}`, `{colors.primary-foreground}`, `{colors.success-soft}` 등 `status-badge`/`page-id-cell`/`summary-card`/`sidebar-nav-item-active`가 참조하는 모든 토큰이 frontmatter에 실제로 정의되어 있고 색상 토큰은 예외 없이 hex 값을 갖는다. EXPERIENCE.md가 참조하는 `{typography.code}`(L53)와 서술식 참조 `primary` 컬러(Accessibility Floor, L93)도 모두 실재 토큰에 해당한다. 끊어진 참조는 발견되지 않았다.

### Findings
(발견 없음 — 미사용 토큰 관련 메모는 "Mechanical notes" 참조)

## 3. Component coverage — 씬(thin)

두 문서에 등장하는 모든 컴포넌트명을 뽑아 DESIGN.md `components`(시각)와 EXPERIENCE.md Component Patterns 표(행동)에 양쪽 다 실질적 규칙이 있는지 대조했다. `status-badge`/`상태배지`, `page-id-cell`(화면 리스트 행 규칙에 포함), `summary-card`/`프로젝트 카드`(명시적 상호참조 `DESIGN.md.summary-card`, L60)는 양쪽 다 갖춰져 강하다. 반면 EXPERIENCE.md에만 존재하고 DESIGN.md에 대응 시각 스펙이 없는 컴포넌트가 3개 있다.

### Findings
- **high** "페이지ID 선택기"(화면 상세 패널의 검색/자동완성 드롭다운, EXPERIENCE.md L55)는 FR-11의 핵심 안전장치(자유 텍스트 입력 금지)를 담당하는 컴포넌트인데, DESIGN.md `components`에 대응 항목이 없다. `page-id-cell`(표 셀 표시용)과는 다른 컴포넌트이며 드롭다운 자체의 배경/보더/포커스/검색결과 강조 스펙이 전무하다. *Fix:* DESIGN.md `components`에 `page-id-selector`(또는 유사명) 추가, 드롭다운 리스트 스타일·포커스 링·빈 결과 상태 등을 정의.
- **medium** "고급 설정 패널"(접기/펼치기, EXPERIENCE.md L58)에 대응하는 시각 스펙이 DESIGN.md에 없다. 아코디언 형태/토글 아이콘/펼침 시 애니메이션·간격 등이 미정이라, 전문가/비전문가 통합 UI의 핵심 장치임에도 브랜드 레이어가 비어 있다. *Fix:* DESIGN.md `components`에 `advanced-settings-panel` 추가.
- **medium** "AI프롬프트 피드백" 👍/👎 아이콘 버튼(EXPERIENCE.md L59)의 시각 스펙(크기, 선택 시 색상 변화, DESIGN.md 컬러 토큰과의 연결)이 없다. shadcn 기본 상속으로 암묵 처리되는 것으로 보이나 명시되어 있지 않다. *Fix:* DESIGN.md에 최소 한 줄이라도 "아이콘 버튼은 ghost 변형 + 선택 시 `{colors.primary}` 강조" 식으로 규정.
- **low** "재실행 확인 다이얼로그"(EXPERIENCE.md L57)는 DESIGN.md Elevation & Depth의 일반적 "모달은 중간 그림자" 서술(L131)로만 커버되고, `components` 블록에 전용 항목은 없다. 기능상 큰 문제는 아니나 다른 컴포넌트들과 스펙 등록 방식이 다르다. *Fix:* 필요 시 `components.confirm-dialog` 항목 추가, 혹은 현행 유지로 충분하다고 명시.
- **low** `sidebar-nav-item-active`는 DESIGN.md `components`에 시각 스펙이 있으나(L102-105), EXPERIENCE.md Component Patterns 표에는 대응 행동 규칙 행이 없다(Foundation 문단 L16의 서술적 언급뿐). *Fix:* Component Patterns 표에 "사이드바 네비 아이템" 행 추가(활성화 조건, 클릭 시 라우팅 등).

## 4. State coverage — 씬(thin)

IA에 나열된 9개 표면(로그인/가입, 대시보드, 프로젝트 설정, 메뉴 관리, 화면 리스트, 화면 상세 패널, 내보내기, 계정 설정, 마케팅 랜딩) 각각에 이 제품 특성상 있을 법한 상태(최초 진입/로딩/에러/권한없음/오프라인)를 나열하고 State Patterns 표(EXPERIENCE.md L62-74)와 대조했다. 화면 리스트 표면은 촘촘하게 커버되어 있으나(깨진 링크/범위 이탈/격리/생성중/화면 0개), 그 외 표면은 대부분 상태 정의가 비어 있다.

### Findings
- **high** 대시보드(프로젝트 목록)의 "최초 진입, 프로젝트 0개" empty state가 State Patterns에 없다. 로그인 직후 가장 먼저 보는 화면이자 신규 가입자(비전문가 창업자 포함)가 마주치는 최초 화면인데, "메뉴 없음(최초 진입)" 행(메뉴 관리용, L66)만 있고 대시보드용은 빠져 있다. *Fix:* State Patterns에 "프로젝트 0개(최초 진입)" 행 추가 — CTA 문구, "새 프로젝트 만들기" 강조 등.
- **medium** 로그인/가입 실패 상태(비밀번호 오류, 이메일 중복 가입 등)가 정의되어 있지 않다. FR-18이 인증을 요구사항으로 명시하는데도 State Patterns·Voice and Tone 어디에도 인증 에러 카피가 없다. *Fix:* State Patterns 또는 Voice and Tone Do/Don't 표에 인증 에러 문구 예시 추가.
- **medium** 화면 상세 패널 자체의 상태(저장 중 표시, 기능정의가 비어 있는 최초 상태, 긴 텍스트 초과 시 NFR-8 경고 등)가 정의되어 있지 않다. 이 패널은 FR-11·FR-12·FR-20이 모두 걸리는 핵심 편집 표면인데 State Patterns 표에 전용 행이 하나도 없다. *Fix:* "화면 상세 패널" 행을 State Patterns에 추가(저장 중/빈 값/글자수 초과 3종 최소).
- **medium** 세션 만료 도중 편집 데이터 처리 방침이 없다. IA 표는 "세션 만료"를 로그인 화면 진입 경로로만 언급(L22)하고, 편집 중 세션이 끊겼을 때 미저장 변경분을 어떻게 보존/경고하는지(NFR-2와 직결)는 State Patterns에 없다. *Fix:* "세션 만료(편집 중)" 행 추가, "저장 실패" 행(L73)과의 관계 명시.
- **low** 엑셀 다운로드 자체의 실패 상태(생성 타임아웃, 서버 오류 등)가 별도로 정의되지 않았다. "저장 실패" 행(L73)은 편집 저장에 대한 것으로, 내보내기 실패는 다른 트리거이다. *Fix:* "내보내기 실패" 행 추가 또는 "저장 실패" 행 범위를 명시적으로 확장.

## 5. Visual reference coverage — 씬(thin)

워크스페이스 폴더의 `imports/`에 이미지 3종(`평범한 느낌.jpg`, `컬러감부드럽게.jpg`, `포인트 컬러로 가독성 명확하게.jpg`)이 있고, `.working/`은 아직 생성되지 않았다. DESIGN.md 본문이 이 3개 레퍼런스를 개념적으로 설명하는지, 그리고 실제로 인라인 링크(파일 경로 인용)하는지 확인했다.

### Findings
- **high** `imports/`의 이미지 3종 모두 DESIGN.md 본문에서 무엇을 나타내는지 설명은 되어 있지만(frontmatter 주석 L12 "평범한 느낌", L19-20 "포인트 컬러로 가독성 명확하게", L24 "컬러감 부드럽게"; Colors 섹션 L114-117) 실제 파일에 대한 인라인 링크나 경로 인용이 전혀 없다. 다운스트림 리뷰어가 "이 서술이 어느 이미지를 근거로 하는지" 직접 열어 검증할 방법이 없다. *Fix:* 각 서술 옆에 `(참고: imports/평범한 느낌.jpg)` 형태로 최소한 파일명을 인용하거나 마크다운 이미지 임베드를 추가.
- **low** EXPERIENCE.md가 언급하는 `.working/`(L34, "초안 목업 예정")이 현재 존재하지 않는다. "예정"으로 명시되어 있어 치명적 결함은 아니지만, 현재 시점 기준으로는 참조 대상이 없는 전방 참조다. *Fix:* 목업이 실제로 추가되면 링크를 채우고, 그 전까지는 상태를 유지해도 무방.

## 6. Bloat & overspecification — 강함(strong)

픽셀 스펙 중복, PRD 재서술, 표로 바꿔야 할 산문, 결정과 무관한 장식적 서술 4가지 관점에서 훑었다. 전반적으로 절제되어 있고 Brand & Style·Colors 등 프로즈는 결정을 담고 있어 장식으로 보기 어렵다. Key Flows의 인물·시간대 서술(민준/화요일 오후, 지현/늦은 밤)은 절차가 요구하는 "이름 있는 주인공" 포맷에 부합해 블로트로 보지 않았다.

### Findings
- **low** Layout & Spacing(L127)에서 사이드바 폭 "고정 240px"가 `spacing` 토큰 없이 하드코딩되어 있다. `spacing` 스케일에 없는 임의 픽셀 값이라 토큰 체계 밖에서 관리된다. *Fix:* `spacing` 또는 별도 `layout.sidebar-width` 토큰으로 등록하거나, 하드코딩임을 의도적으로 명시.
- **low** frontmatter의 `spacing` 토큰 7개(`1,2,3,4,6,8,gutter`)가 정의만 되어 있고 본문·컴포넌트 어디에서도 `{spacing.*}` 형태로 실제 참조되지 않는다. 정의와 사용 사이의 실질적 연결이 없어 향후 Architecture가 이 값을 신뢰하고 써도 되는지 판단하기 어렵다. *Fix:* 최소 1곳(예: 표 셀 padding, 카드 내부 여백)에 실사용 예를 추가.

## 7. Inheritance discipline — 양호(adequate)

`sources` frontmatter 경로가 실제 PRD 파일로 해석되는지, FR 표기가 일관적인지, 두 문서에서 컴포넌트명이 동일한지, EXPERIENCE.md의 토큰 참조가 DESIGN.md에 실재하는지 확인했다. `sources: _bmad-output/planning-artifacts/prds/prd-IA-자동생성-플랫폼-2026-07-08/prd.md`는 실제 파일로 정확히 resolve된다. FR 번호 표기는 두 문서에서 일관되게 `FR-N` 형식을 쓴다.

### Findings
- **medium** EXPERIENCE.md frontmatter에 `updated:` 키가 두 번 정의되어 있다(4행과 9행, 둘 다 `2026-07-08`로 값은 같음). YAML 스펙상 중복 키는 파서에 따라 처리가 다를 수 있는 기계적 결함이다. *Fix:* 9행의 중복 `updated:` 제거.
- **low** 컴포넌트 교차참조 방식이 문서 내에서 일관되지 않는다. `summary-card`는 EXPERIENCE.md가 백틱으로 명시 인용(``DESIGN.md.summary-card``, L60)하지만, `status-badge`/`page-id-cell`은 한글 서술(상태배지/페이지ID 셀)로만 등장해 같은 대상임을 이름 유사성으로 유추해야 한다. *Fix:* 나머지 컴포넌트도 첫 등장 시 DESIGN.md 키를 한 번씩 백틱 인용.

## 8. Shape fit — 양호(adequate)

DESIGN.md 섹션 순서(Brand & Style → Colors → Typography → Layout & Spacing → Elevation & Depth → Shapes → Components → Do's and Don'ts)가 정확히 canonical 순서와 일치한다 — 강함. EXPERIENCE.md는 요구되는 10개 섹션(Foundation/IA/Voice and Tone/Component Patterns/State Patterns/Interaction Primitives/Accessibility Floor/Key Flows/Responsive & Platform/Inspiration & Anti-patterns)을 모두 갖췄고, 두 "plus" 섹션이 필러가 아니라 실제 결정(브레이크포인트별 편집 제한, PRD 비목표와 연결된 명시적 rejection)을 담고 있어 존재 가치가 있다.

### Findings
- **low** 실제 섹션 순서는 `Foundation → IA → Voice and Tone → Component Patterns → State Patterns → Interaction Primitives → Accessibility Floor → Responsive & Platform → Inspiration & Anti-patterns → Key Flows`로, 절차가 제시한 순서("...Accessibility Floor, Key Flows, plus Responsive & Platform, Inspiration & Anti-patterns")와 달리 Key Flows가 최하단에 배치되어 있다. *Fix:* Key Flows를 Accessibility Floor 다음, Responsive & Platform 이전으로 이동(선택적 — 내용 자체엔 문제 없음).

## Mechanical notes

- `sources` frontmatter는 정상 resolve됨. FR 넘버링은 두 문서와 PRD 간에 불일치 없음.
- EXPERIENCE.md frontmatter의 `updated:` 키 중복 정의(4행/9행) — 위 §7 참조.
- DESIGN.md `components` 블록이 참조하는 모든 `{colors.*}`, `{rounded.*}`, `{typography.*}` 토큰은 frontmatter에 실재하며 색상은 전부 hex 값을 가짐 — 끊어진 토큰 참조 없음.
- `spacing` 토큰 7종이 정의되어 있으나 본문에서 미사용(§6 참조) — 끊어진 참조는 아니고 "미활용" 이슈.
- 컴포넌트명은 DESIGN.md(영문 kebab-case 키 + 한글 설명)와 EXPERIENCE.md(한글 서술) 간 번역 대응 관계이며 명백한 오기재는 없으나, 교차참조 인용 방식이 컴포넌트마다 달라 일관성이 아쉬움(§7).
