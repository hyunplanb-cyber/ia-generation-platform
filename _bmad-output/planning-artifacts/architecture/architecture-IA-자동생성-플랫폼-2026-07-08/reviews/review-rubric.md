# Architecture Spine Review — IA 자동생성 플랫폼

## Overall verdict

핵심 3법칙(격리, 필드단위 소스추적, 파생상태 비저장)과 AD-2/AD-3/AD-5/AD-6은 서로 잘 맞물리는 좋은 설계 결정이며, page_id 스코프·격리 패턴 등 실제로 두 빌더의 발산을 막아준다. 그러나 (1) FR-20(프롬프트 피드백)의 데이터 모델이 통째로 빠져 있고, (2) 운영/관측가능성·레이트리미팅·백업 같은 "initiative 고도가 반드시 결정해야 할" 영역이 Deferred에도 없이 아예 언급되지 않으며, (3) 핵심 의존성 버전이 미고정이라는 점에서 build-substrate 산출물로서는 아직 구멍이 있다. AD-1의 헥사고날 경계는 선언만 있고 강제 메커니즘이 없어 "장식"에 머물 위험도 있다.

### Findings

- **critical** FR-20(AI프롬프트 👍/👎 피드백)의 저장 위치가 데이터 모델에 전혀 없음 (§ ER diagram / Capability→Architecture Map). PRD §5는 이 피드백을 "핵심가치 검증(직접)" 지표의 유일한 데이터 소스로 명시했는데, ERD의 SCREEN 엔티티에도 별도 테이블에도 피드백을 저장할 컬럼/엔티티가 없다. Capability Map은 FR-20을 AD-1·AD-5에 매핑했지만 두 AD 모두 "무엇을 어디에 저장하는가"를 다루지 않는다. *Fix:* `SCREEN.prompt_feedback`(nullable enum: `up`|`down`|null) 또는 `PROMPT_FEEDBACK(screen_id, value, created_at)` 엔티티를 ERD에 추가하고 Capability Map에 반영.

- **high** 운영/관측가능성(로깅·에러추적·모니터링)이 스파인 전체에서 한 번도 언급되지 않음 (Deferred에도 없음) (§ 전체). 로그인 기반 공개 SaaS인데, 프로덕션 장애 시 무엇을 보고 진단할지에 대한 결정도, "지금은 미정"이라는 명시적 유보도 없다 — 이는 checklist가 구분하는 "안전하게 열어둔 것"이 아니라 "조용히 빠진 것"이다. *Fix:* 최소한 Deferred 항목으로 명시하거나("에러 트래킹 도구 미정, Vercel 기본 로그로 MVP 대응"), Stack 표에 Sentry/Vercel Log Drains 등 후보를 명시.

- **high** 레이트리미팅/어뷰징 방지가 전혀 언급되지 않음 (§ 전체). 회원가입·프로젝트 생성·[실행: IA 생성](계산 비용 발생)·엑셀 다운로드가 모두 인증된 사용자에게 열려 있는 공개 SaaS인데, 남용 방지 전략이 AD에도 Deferred에도 없다. *Fix:* 최소 Deferred 항목으로 "가입/IA생성 요청 레이트리미팅 정책 미정 — Phase 2에서 결정" 정도는 명시.

- **high** 핵심 의존성(Drizzle ORM, Better Auth, SheetJS, shadcn/ui)이 버전 미고정 상태로 "최신 stable"로만 표기됨 (§ Stack). Next.js만 웹검증된 버전(16.2.10)으로 고정했고 나머지는 이동 표적이다. Better Auth·Drizzle은 상대적으로 어린/자주 변경되는 라이브러리로 breaking change 빈도가 높아, 두 빌더(혹은 같은 빌더가 다른 시점에 `npm install`)가 실제로 다른 메이저 버전을 설치해 API가 어긋날 위험이 실재한다. build-substrate 산출물의 목적(발산 지점 고정)에 정면으로 반하는 항목이다. *Fix:* 최소한 스파인 작성 시점(2026-07-08) 기준 실제 최신 stable 버전 번호를 웹검증해 박아넣거나, "package.json에 커밋된 버전을 진실源으로 한다"는 명시적 규칙을 추가.

- **high** AD-4와 FR-6의 하드 삭제 상호작용이 미정의 (§ AD-4, FR-6). FR-6은 "격리된 화면을 사용자가 확인 후 직접 삭제할 수 있다"고 명시하는데, AD-4는 `target_screen_id`에 대해 "ON DELETE SET NULL 아님"이라고 못박는다. 격리된 화면이 실제로 하드 삭제되면 그 화면을 참조하던 다른 화면의 `target_screen_id` FK는 어떻게 되는가 — DB가 삭제를 막는가(FK 위반으로 FR-6 기능이 깨짐), 아니면 애플리케이션이 삭제 전에 참조를 먼저 정리하는가? AD-4 Rule은 "격리(quarantined)"만 상정하고 실제 삭제 이후의 FK 처리 방식을 다루지 않는다. *Fix:* AD-4에 "격리된 화면의 하드 삭제는 참조하는 button_action이 없을 때만 허용하거나, ON DELETE 시 애플리케이션 레벨에서 is_broken 재계산이 가능하도록 FK 정책(RESTRICT/SET NULL)을 명시"하는 문장 추가.

- **high** 다중 탭/세션 동시편집 충돌을 PRD가 명시적으로 "Architecture 단계에서 결정하라"고 요청했음에도(§10 열린 질문) 스파인이 그대로 Deferred로 재이관함 (§ Deferred). 이는 checklist 3의 "MVP 자체를 깨뜨릴 수 있는 것은 Deferred에 두면 안 된다"는 기준에 걸린다 — 결정을 미루는 동안 기본 동작이 사실상 "나중 저장이 이긴다(last-write-wins)"가 되며, 이는 NFR-2(수동 수정 데이터가 재실행/재계산으로 유실되지 않아야 한다)의 정신과 정면 충돌할 수 있는 시나리오(동일 사용자가 다른 탭에서 편집 중 하나가 덮어씀)다. 최소 수준의 결정(예: "MVP는 last-write-wins, 낙관적 잠금은 Phase 2")조차 없이 완전히 열어둔 채로 두는 것은 과함. *Fix:* 최소 MVP 기본 동작(예: updated_at 기반 낙관적 체크로 충돌 시 409 반환)만이라도 AD로 격상하고, 정교한 UX는 계속 Deferred.

- **medium** AD-6의 "방식 혼재" 경고 계산 방식이 실제로는 두 가지 서로 다른 혼재(FR-6 메뉴코드 신/구 혼재, FR-9 디바이스방식 신/구 혼재)를 가리키는데, AD-6 Rule의 예시 데이터소스("대상 화면 존재 여부, 프로젝트 전체 일정, 인접 화면 일정")에는 이 두 혼재를 계산할 입력(현재 menu.menu_code/project.device_mode 대비 각 screen.page_id 파싱 비교)이 전혀 언급되지 않는다 (§ AD-6). 두 빌더가 "menu_code 변경 이력을 별도 테이블에 저장"(AD-6의 "저장하지 않는다" 원칙과 충돌) vs "page_id 문자열을 현재 값과 비교해 즉석 파싱"(원칙과 합치)로 서로 다르게 구현할 수 있다 — Rule을 문자 그대로 따라도 divergence가 남는 사례. *Fix:* AD-6에 "방식/코드 혼재는 screen.page_id를 현재 menu.menu_code / project.device_mode와 문자열 비교하여 파생하며 이력 테이블을 두지 않는다"를 명시.

- **medium** AD-1("도메인 계층은 Next.js, Drizzle, SheetJS를 import하지 않는다")이 강제 메커니즘 없이 선언에 그침 (§ AD-1, Design Paradigm). Structural Seed는 폴더 관례(`domain/`은 "외부 기술 import 금지"라는 주석)만 있을 뿐, ESLint boundaries plugin·dependency-cruiser 같은 실제 lint/CI 게이트가 스파인 어디에도 명시되지 않았다. 또한 "import하지 않는다"는 검사만으로는 도메인이 Drizzle의 타입 형태에 구조적으로 결합되거나(직접 import 없이 어댑터가 넘겨준 객체 형태에 암묵적으로 의존), `process.env` 등 Next.js/Node 특정 API를 우회 사용하는 것까지는 막지 못한다 — checklist가 정확히 지적한 "장식적 vs 실제 강제"의 경계 사례. *Fix:* Consistency Conventions에 "domain/adapters 경계는 CI에서 dependency-cruiser(또는 eslint-plugin-boundaries) 규칙으로 강제한다"를 AD-1의 Rule에 추가.

- **medium** FR-3(전체 일정 수정 시 재계산 트리거, 수동수정분 보호 경고)와 NFR-2(수동 수정 데이터가 재생성으로 유실되지 않아야 함)가 AD-5의 `Binds`에 빠져 있음 (§ AD-5, Capability Map). AD-5는 정확히 이 두 요구사항을 만족시키기 위한 메커니즘(`schedule_locked`, `*_source`)인데 binds 목록은 `FR-8, FR-13, NFR-7`만 포함한다. Capability Map의 "FR-1~3" 행도 AD-7만 걸려 있어 FR-3의 재계산-보호 요구가 어떤 AD로 커버되는지 표에서 추적이 안 된다. *Fix:* AD-5 binds에 `FR-3`, `NFR-2` 추가.

- **medium** FR-5(메뉴코드 자동산출 실패 조건: 중복/1글자/예약어)에 대응하는 AD가 없음 (§ Capability Map, FR-4~6 행). AD-2는 `page_id`의 프로젝트 스코프 유일성만 다루고, `menu.menu_code`의 유일성 강제 방식(DB 복합 유니크 vs 애플리케이션 검증)이나 예약어(`PC`,`MO`) 체크 위치(도메인 vs UI)는 어디에도 규정되지 않는다. AD-2와 병렬적으로 다뤄야 할 값인데 빠져 있다. *Fix:* AD-2에 병기하거나 별도 AD로 "menu_code는 (project_id, menu_code) 복합 유니크 + 예약어 목록은 도메인 상수로 관리" 추가.

- **medium** FR-18의 계정 삭제 유예기간(30일 소프트 삭제 후 보관)을 지원하는 데이터/운영 메커니즘이 전무함 (§ ERD, Deferred). ERD에 `deleted_at`/`purge_scheduled_at` 같은 컬럼이 없고, 30일 후 실제 하드 삭제를 수행할 배치/크론 잡에 대한 언급도 없다. AD-3이 메뉴 삭제에 대해 이미 "삭제 대신 격리" 패턴을 확립했으니 계정 삭제도 같은 패턴의 연장으로 다뤄야 하는데 스파인이 이를 놓쳤다. *Fix:* ERD의 PROJECT(또는 USER)에 `deleted_at` 필드 추가하고 "30일 경과 후 하드 삭제"는 Deferred나 별도 AD로 명시.

- **medium** NFR-8(엑셀 셀 32,767자 한도 대응 텍스트 길이 제한)이 어떤 Convention에도 반영되지 않음 (§ Consistency Conventions). "화면기능정의/AI프롬프트 필드는 최대 길이를 두어야 한다"는 요구가 도메인 유효성 검증 규칙으로도, UI 컨벤션으로도 스파인에 등장하지 않아 두 빌더가 서로 다른(혹은 아예 없는) 길이 제한을 구현할 수 있다. *Fix:* Consistency Conventions "데이터/포맷" 행에 "텍스트 필드 최대 길이는 도메인 상수(예: 30,000자)로 공유"를 추가.

- **low** AD-6의 파생 경고 계산이 N+1 쿼리 패턴으로 구현될 위험에 대한 명시적 언급이 없음 (§ AD-6, Deferred, NFR-3). NFR-3 대상 규모("수십~수백 행")에서는 절대적 성능 문제는 아니지만, "깨진 링크"(대상 화면 존재 확인)·"일정 역전"(인접 화면 비교)을 화면별로 개별 쿼리하면 O(n) 요청이 발생해 손쉽게 병목이 될 수 있다. Deferred 항목("대용량 프로젝트의 엑셀 생성 성능 상한")은 SheetJS 내보내기 성능만 다루고, 화면 목록 조회 시점의 AD-6 계산 비용은 다루지 않는다. *Fix:* AD-6 Rule에 "배지 계산은 화면별 개별 쿼리가 아닌 프로젝트 단위 배치 조회/조인으로 수행한다" 한 줄 추가.

- **low** `screen.status`의 전체 유효값 목록이 어디에도 열거되지 않음 (§ ERD, AD-3). AD-3이 `quarantined` 값 하나만 언급할 뿐 정상 상태(예: `active`)를 포함한 전체 enum이 명시되지 않아, 구현자가 임의로 상태명을 정하게 된다. 실제로는 status(라이프사이클)·`*_source`(자동/수동)·is_broken(파생)이 직교하는 설계라 "격리+깨진링크+자동생성"이 동시에 표현 가능하다는 점에서 checklist 8이 우려한 "코너에 몰리는" 문제는 없으나, 문서화 누락 자체는 남는다. *Fix:* ERD SCREEN.status에 "enum: active | quarantined" 등 전체 값 명시.

- **low** 데이터 백업/보존 정책이 Neon/Vercel 인프라 다이어그램 외에는 언급되지 않음 (§ 배포 다이어그램). Neon의 PITR/브랜치 기능이 이름은 나오지만 "며칠 보존", "복구 절차" 같은 결정은 없다. MVP 리스크는 낮지만 initiative 고도가 명시적으로 훑어야 할 항목이라 언급 자체가 없는 점은 남겨둔다. *Fix:* Deferred에 한 줄 추가 정도로 충분.

- **low** FR-11의 "페이지ID가 다른 값으로 변경되면 깨진 링크로 표시"라는 문구와 AD-4가 채택한 UUID FK(`target_screen_id`) 설계 사이에 의미 차이가 있음 (§ AD-4, FR-11). UUID FK를 쓰면 대상 화면의 `page_id`가 바뀌어도 참조 자체(UUID)는 안 끊기므로, FR-11이 원래 상정한 "page_id 변경 = 깨진 링크" 트리거는 AD-4 설계에서는 발생하지 않는다(오히려 개선이지만 PRD 문구와 불일치). 두 빌더가 FR-11 원문만 보고 "page_id 변경 감지 로직"을 별도로 만들 위험. *Fix:* AD-4에 "UUID FK 채택으로 page_id 단독 변경은 more 링크를 깨뜨리지 않으며, 대상 화면이 quarantined/삭제된 경우만 깨진 링크로 간주한다"는 문장을 추가해 FR-11과의 차이를 명시적으로 봉합.
