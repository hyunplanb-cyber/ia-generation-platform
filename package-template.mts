// 판매 상품별 zip 패키징.
//
// 등급은 사다리가 아니라 2×2다(lib/packages.ts의 PlanId 주석과 같은 축).
//
//              문서만        + 검수 시나리오 + 완성 화면(HTML)
//   2뎁스   스탠다드              디럭스
//   3뎁스   플러스                프리미엄
//
// 가로축은 설계 깊이(2뎁스 / 3뎁스), 세로축은 "만들기 전(설계)"과 "오픈 전(검수)"이다.
// 네 등급 모두 문서 + AI 빌드 스펙팩 + 디자인 프리셋을 담는다. 차이는 이 둘뿐이다.
//
// 디럭스·프리미엄은 그 깊이로 실제로 만들어 둔 화면(HTML)이 있는 업종에만 생긴다.
// 없는 걸 팔지 않기 위해서다 — 지금은 해외투어 3뎁스(프리미엄) 하나뿐이다.
//
// 디자인 프리셋은 업종당 한 벌뿐이라 심화판도 기본판 폴더에서 가져다 쓴다.
//
// 사용법: npx tsx package-template.mts              → 만들 수 있는 것 전부
//         npx tsx package-template.mts travel-premium → 하나만
import {
  statSync, readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync,
  copyFileSync, rmSync, renameSync,
} from "node:fs";
import JSZip from "jszip";
import { PACKAGES, BUILD_SCOPE, PLAN_NAMES, type PlanId } from "./lib/packages";
import { CHECK_NOTE_FULL } from "./lib/export/template-verify";
import { GUIDES, buildGuideCardHtml } from "./lib/guide-links";

// 파는 것이 놓이는 곳. 여기에는 **팔 물건만** 둔다.
const T = "판매용_템플릿";
// 중간 작업물(업종별 산출물·프리셋)이 만들어지는 곳. 언제든 다시 만들 수 있다.
const W = "_작업";

interface Product {
  /** 산출물 폴더 */
  src: string;
  /** 디자인 프리셋을 가져올 폴더(업종 공통) */
  presetsFrom: string;
  /** zip 파일명 */
  zipName: string;
  title: string;
  planLabel: string;
  /** lib/packages.ts의 PackageDef.id — 업종별 외부 연동 목록을 README에 넣을 때 쓴다. */
  pkgId?: string;
  /** 등급 키. 홈페이지가 파는 칸이면 packs/{pkgId}-{tier}.zip 으로도 함께 쓴다. */
  tier: PlanId;
  /**
   * 검수 시나리오를 넣는 등급인가(디럭스·프리미엄).
   * 완성 화면 유무와는 따로 둔다 — 화면을 아직 안 만든 업종도 검수는 넣을 수 있다.
   */
  withVerify?: boolean;
  /**
   * 스펙팩으로 실제로 만들어 둔 화면 폴더(HTML). 있으면 완성화면/ 로 통째로 들어간다.
   * 설계만 파는 등급과 달리 "만들어진 결과"까지 들어가므로 README 안내 문구도 달라진다.
   */
  sitePath?: string;
}

/**
 * 파는 업종.
 *  base / deep — 2뎁스·3뎁스 산출물 폴더
 *  siteBase / siteDeep — «팩 밖»에 화면을 두던 시절의 원본 경로. 지금은 일곱 업종 모두
 *    비어 있다 — 완성화면은 팩 안이 원본이다(2026-08-19 통일). 새로 적지 마라.
 *    비즈니스관리(admin)는 판매 보류라 뺐다.
 */
const INDUSTRIES = [
  { key: "lms", label: "LMS", title: "온라인 강의 플랫폼(LMS)",
    base: `${W}/LMS_온라인강의플랫폼`, deep: `${W}/LMS_온라인강의플랫폼_상세IA`,
    /* 2026-08-09 에 프리미엄 132화면을 만들었다.
       디럭스와 «일부러» 다른 프리셋을 쓴다 — 디럭스는 코럴 선셋 + 대시보드형,
       프리미엄은 모던 네이비 + 에디토리얼형이다. 같은 스펙팩이라도 프리셋을
       갈아 끼우면 화면이 이렇게 달라진다는 것을 두 등급 나란히 보여 주는 것이
       이 팩의 값이다(여행·뷰티샵·공동구매가 모두 그렇게 되어 있다).

       ⚠ siteBase·siteDeep 을 «일부러» 비워 둔다.
         완성화면을 팩 밖에 두던 시절에는 여기에 원본 경로를 적었다.
         지금은 팩 안이 원본이다 — 그래서 팩 안을 가리키면 원본과 대상이 같아지고,
         copyFileSync 가 자기 자신을 덮어쓴다. 비워 두면 「팩에 있던 것을 그대로
         둡니다」로 흘러가고 화면 수도 팩에서 세어 준다. 일곱 업종 모두 그렇다. */ },
  { key: "beauty", label: "뷰티샵", title: "뷰티샵 예약 플랫폼",
    base: `${W}/뷰티샵_예약플랫폼`, deep: `${W}/뷰티샵_예약플랫폼_상세IA`,
    // 여행과 같이 두 등급의 프리셋을 다르게 뒀다 — 디럭스는 소프트 파스텔,
    // 프리미엄은 코럴 선셋. 같은 설계로 얼마나 다른 얼굴이 나오는지 보여준다.
    /* ⚠ siteBase·siteDeep 을 «일부러» 안 적는다 — 완성화면은 팩 안이 원본이다.
       가리키면 원본과 대상이 같아져 copyFileSync 가 자기 자신을 덮어쓴다.
       안 적으면 「팩에 있던 것을 그대로 둡니다」로 흘러가고 화면 수도 팩에서 센다.
       2026-08-19 에 일곱 업종을 여기로 통일했다 — 넷은 «없는 폴더»를 가리키고 있었다. */ },
  { key: "travel", label: "여행", title: "해외 투어·티켓 예약 플랫폼",
    base: `${W}/해외투어_티켓예약`, deep: `${W}/해외투어_티켓예약_상세IA`,
    // 두 사이트는 프리셋이 다르다 — 디럭스는 소프트 파스텔, 프리미엄은 모던 네이비.
    // 같은 설계로 얼마나 다른 얼굴이 나오는지 두 등급이 나란히 보여준다.
    /* ⚠ siteBase·siteDeep 을 «일부러» 안 적는다 — 완성화면은 팩 안이 원본이다.
       가리키면 원본과 대상이 같아져 copyFileSync 가 자기 자신을 덮어쓴다.
       안 적으면 「팩에 있던 것을 그대로 둡니다」로 흘러가고 화면 수도 팩에서 센다.
       2026-08-19 에 일곱 업종을 여기로 통일했다 — 넷은 «없는 폴더»를 가리키고 있었다. */ },
  { key: "matching", label: "매칭", title: "동네 서비스 매칭 플랫폼",
    base: `${W}/동네서비스_매칭플랫폼`, deep: `${W}/동네서비스_매칭플랫폼_상세IA`,
    /* ⚠ siteBase·siteDeep 을 «일부러» 안 적는다 — 완성화면은 팩 안이 원본이다.
       가리키면 원본과 대상이 같아져 copyFileSync 가 자기 자신을 덮어쓴다.
       안 적으면 「팩에 있던 것을 그대로 둡니다」로 흘러가고 화면 수도 팩에서 센다.
       2026-08-19 에 일곱 업종을 여기로 통일했다 — 넷은 «없는 폴더»를 가리키고 있었다. */ },
  { key: "groupbuy", label: "공동구매", title: "공동구매(공구) 플랫폼",
    base: `${W}/공동구매_공구플랫폼`, deep: `${W}/공동구매_공구플랫폼_상세IA`,
    // 두 등급의 프리셋이 다르다 — 디럭스는 코럴 선셋, 프리미엄은 미니멀 모노.
    /* ⚠ siteBase·siteDeep 을 «일부러» 안 적는다 — 완성화면은 팩 안이 원본이다.
       가리키면 원본과 대상이 같아져 copyFileSync 가 자기 자신을 덮어쓴다.
       안 적으면 「팩에 있던 것을 그대로 둡니다」로 흘러가고 화면 수도 팩에서 센다.
       2026-08-19 에 일곱 업종을 여기로 통일했다 — 넷은 «없는 폴더»를 가리키고 있었다. */ },
  { key: "rental", label: "장비렌탈", title: "장비 렌탈·대여 예약 플랫폼",
    base: `${W}/장비렌탈_대여예약`, deep: `${W}/장비렌탈_대여예약_상세IA`,
    /* 두 등급의 프리셋이 다르다 — 디럭스는 내추럴 그린 + 검색 중심형,
       프리미엄은 레트로 페이퍼 + 목록 중심형.

       ⚠ siteBase·siteDeep 을 «일부러» 비운다. 완성화면이 이미 팩 안에 있어서
         가리키면 원본과 대상이 같아져 copyFileSync 가 자기 자신을 덮어쓴다.
         비워 두면 「팩에 있던 것을 그대로 둡니다」로 흘러가고 화면 수도 팩에서 센다. */ },
  { key: "ticket", label: "공연티켓", title: "공연 티켓 파트너 관리자",
    base: `${W}/공연티켓_파트너관리자`, deep: `${W}/공연티켓_파트너관리자_상세IA`,
    /* 2뎁스는 모던 네이비 + 목록 중심형, 3뎁스는 미니멀 모노 + 검색 중심형.
       주최사가 쓰는 백오피스라 표와 숫자가 주인공이다.

       ⚠ siteBase·siteDeep 을 «일부러» 안 적는다 — 완성화면은 팩 안이 원본이다(2026-08-19 통일). */ },
  { key: "interior", label: "인테리어", title: "인테리어 시공 견적·시공관리",
    base: `${W}/인테리어시공_견적상담`, deep: `${W}/인테리어시공_견적상담_상세IA`,
    /* A 회차(2026-08-17) — 디럭스(미니멀 모노 × 사진 중심형)까지만 만든다.
       프리미엄(레트로 페이퍼 × 대시보드형, 3뎁스)은 B 회차 몫이라 아직 화면이 없다.

       ⚠ siteBase·siteDeep 을 «일부러» 비운다. 완성화면을 팩 자기 폴더 안에 만들
         것이라 가리키면 원본과 대상이 같아져 copyFileSync 가 자기 자신을 덮어쓴다.
         비워 두면 「팩에 있던 것을 그대로 둡니다」로 흘러가고 화면 수도 팩에서 센다. */ },
] as const satisfies readonly {
  key: string; label: string; title: string;
  base: string; deep: string; siteBase?: string; siteDeep?: string;
}[];

// 2×2를 그대로 편다. 4업종 × 4등급 = 16칸을 모두 만든다.
// 아직 없는 재료(완성 화면·검수)는 그 칸에서 빠질 뿐, 칸 자체는 만든다 —
// 무엇이 비어 있는지 눈으로 보여야 채울 수 있어서다. 부족한 칸 목록은
// 실행 끝에 _부족한구성.md로 남긴다.
const ALL_PRODUCTS: Record<string, Product> = {};
for (const ind of INDUSTRIES) {
  const siteBase = "siteBase" in ind ? (ind.siteBase as string) : undefined;
  const siteDeep = "siteDeep" in ind ? (ind.siteDeep as string) : undefined;
  const common = { presetsFrom: ind.base, title: ind.title, pkgId: ind.key };
  // 등급 이름은 lib/packages.ts에서 읽는다 — 홈페이지와 zip 폴더 이름이 갈라지지 않게.
  const tiers: [PlanId, string, boolean, string | undefined][] = [
    // [등급 키, 산출물 폴더, 검수 포함, 완성 화면 폴더]
    ["standard", ind.base, false, undefined],
    ["plus", ind.deep, false, undefined],
    ["deluxe", ind.base, true, siteBase],
    ["premium", ind.deep, true, siteDeep],
  ];
  for (const [tier, src, withVerify, sitePath] of tiers) {
    const planLabel = PLAN_NAMES[tier];
    ALL_PRODUCTS[`${ind.key}-${tier}`] = {
      ...common,
      src,
      withVerify,
      sitePath,
      zipName: `${ind.label}_${planLabel}`,
      planLabel,
      tier,
    };
  }
}

// 업종 라벨이 lib/packages.ts와 어긋나면 홈페이지가 파일 이름을 못 찾는다.
// 사고 나서야 알게 되는 종류라, 여기서 미리 멈춘다.
for (const ind of INDUSTRIES) {
  const pkg = PACKAGES.find((p) => p.id === ind.key);
  if (pkg && pkg.fileLabel !== ind.label) {
    throw new Error(
      `업종 이름이 어긋나요: ${ind.key} — 여기는 "${ind.label}", lib/packages.ts는 "${pkg.fileLabel}"`,
    );
  }
}

/* ── 「다 된 것」과 「만드는 중」을 폴더로 가른다 ─────────────────
 *
 * 왜 (2026-08-11, 사장님 지적)
 *   판매팩은 «두 회차»에 걸쳐 만든다 — A 회차에 디럭스 화면까지, B 회차에 프리미엄까지.
 *   그런데 검수 루틴은 «매주 화요일»에 돈다. 그러면 A 와 B 사이의 화요일에,
 *   **만들다 만 팩이 검수에 걸려** FAIL 이 쏟아지고 마무리 루틴이 포장을 막는다.
 *
 * 어떻게
 *   `_만드는중/` 에 있으면 아무도 안 본다 — 검수도, zip 도, 진열도.
 *   **폴더가 곧 표시다.** 따로 표시 파일을 두지 않는다(두면 폴더와 갈라진다).
 *
 *   A 회차 :  npx tsx package-template.mts --만드는중 <업종키>
 *   B 회차 :  npx tsx package-template.mts --내보내기 <업종키>   → _판매팩 으로 옮긴다
 */
const 판매팩방 = `${T}/_판매팩`;
const 만드는중방 = `${T}/_만드는중`;
const 만드는중모드 = process.argv.includes("--만드는중");
const OUT = 만드는중모드 ? 만드는중방 : 판매팩방;

/* 「사이트 내놓는 법」 안내서 — 원본은 한 벌뿐이다(_마케팅/부록_사이트_내놓는_법.html).
   판매팩에도 들어가고, 손님이 직접 만들어 받는 zip 에도 들어간다.
   두 곳에 각각 두면 반드시 갈라지므로 여기서 public/ 으로도 한 번 복사한다. */
const 내놓는법 = `${T}/_마케팅/부록_사이트_내놓는_법.html`;
/* 「앱으로 내놓는 법」 — 형제 문서. 반응형이라 앱으로도 되겠거니 하고 웹뷰로 감싸면
   애플 심사 4.2 에서 떨어진다. 그 이야기부터 시작하는 안내서다(2026-08-10). */
const 앱으로내놓는법 = `${T}/_마케팅/부록_앱으로_내놓는_법.html`;
// 홈페이지가 산 사람에게 내려줄 자리. 저장소에 함께 커밋되는 유일한 판매 파일이다.
const SITE_PACKS = "packs";

// 압축은 홈페이지에 상품을 올릴 때만 한다.
//   npx tsx package-template.mts          → 폴더로만 (손보는 중)
//   npx tsx package-template.mts --zip    → 폴더 + zip + packs/ 갱신 (팔 때)
// 손보는 동안 zip으로 두면 열어야 보이고, 고치면 다시 묶어야 한다(2026-08-04).
const MAKE_ZIP = process.argv.includes("--zip");

// 업종별로 개발자에게 넘겨야 할 외부 연동 목록. 판매 페이지와 같은 출처를 쓴다.
function integrationBlock(p: Product): string {
  const items = p.pkgId ? PACKAGES.find((x) => x.id === p.pkgId)?.integrations : undefined;
  if (!items?.length) return "";
  return `
 이 서비스에서 개발자에게 넘길 항목 ${items.length}가지
${items.map((it) => `  · ${it.area} — ${it.detail}`).join("\n")}
   견적을 받거나 개발을 맡길 때 이 목록을 그대로 쓰세요.
`;
}

function readme(
  p: Product,
  stats: { screens: number; requirements: number; verifyScenarios?: number },
  화면수 = 0,
) {
  /* ⛔ 「완성화면이 들어 있나」를 p.sitePath 로 묻지 않는다.
     완성화면 원본이 팩 안으로 들어오면서 그 값을 비웠는데, README 는 아직
     그것을 보고 있었다. 그래서 화면 132~207장이 든 팩 넷(LMS·장비렌탈·
     인테리어·매칭 프리미엄)이 「기획 산출물 한 벌」로 나갔고, 안내에는
     「완성된 코드나 사이트를 제공하지 않습니다」까지 적혀 있었다(2026-08-19).
     같은 교훈이 아래 «부족한 칸» 셈에는 2026-08-09 에 이미 반영돼 있었다 —
     물어야 할 것은 「경로를 적었나」가 아니라 «손님이 받을 zip 에 화면이 있나»다. */
  const 화면있음 = 화면수 > 0;
  // 검수 시나리오는 완성 화면이 붙는 등급(디럭스·프리미엄)에만 들어간다.
  // "만들기 전(설계)"과 "오픈 전(검수)"을 축으로 갈랐다 — 스탠다드·플러스는 설계까지만 판다.
  const 검수 = p.withVerify && stats.verifyScenarios
    ? ` 08_검수시나리오.xlsx     오픈 전 점검표 — 시나리오 ${stats.verifyScenarios}개  ★디럭스·프리미엄\n`
    : "";
  const 검수사용법 = p.withVerify && stats.verifyScenarios
    ? ` [검수] 08_검수시나리오.xlsx를 열어 화면을 하나씩 눌러보며
        '결과' 칸에 PASS / FAIL / WARN 을 적으세요. 빠진 화면이 드러납니다.

`
    : "";
  // 디럭스·프리미엄에 붙는다 — 설계뿐 아니라 그 설계로 실제로 만든 화면이 함께 들어간다.
  const 사이트구성 = 화면있음
    // 완성 화면은 디럭스·프리미엄 둘 다에 들어간다(2×2의 세로축).
    // 라벨을 ★프리미엄으로 박아 둬서, 디럭스를 산 사람이 "이건 프리미엄 것 아닌가"
    // 하고 되물었다. 등급 이름을 그 칸의 것으로 찍는다(2026-08-07).
    ? ` 완성화면/               이 스펙팩으로 실제로 만든 화면 ${화면수}개 (HTML)  ★${p.planLabel}\n`
    : "";
  const 부제 = 화면있음 ? "AI팩 — 기획 산출물 한 벌 + 완성 화면" : "AI팩 — 기획 산출물 한 벌";
  return `${p.title} — ${p.planLabel}
${부제}
====================================================

■ 구성
 01_메뉴구조.xlsx        메뉴-화면 트리
 02_IA_화면목록.xlsx     화면 ${stats.screens}개 + 화면별 AI 생성 프롬프트  ★핵심
 03_기능정의서.xlsx      요건 ${stats.requirements}개 (업무·기능·구성·유형)
 04_WBS.xlsx             화면별 개발 일정
 05_FLOW_흐름도.html     화면 이동 흐름도 (브라우저로 열기)
 05_FLOW_흐름도.drawio   draw.io에서 편집 가능
 06_메뉴구조.pptx        메뉴 구조 조직도 슬라이드
 07_AI빌드_스펙팩.md     AI 코딩툴에 통째로 넣는 스펙 (Claude Code, Cursor 등)
 07_AI빌드_스펙팩.json   프로그램에서 읽는 구조화 데이터
${검수} 디자인프리셋/
          가이드_01~03          색·글꼴·모서리 3벌 (.md / .json)
          레이아웃_A~B          화면 뼈대 2벌 (.md / .json)
          프리셋_미리보기.html   3벌 × 2벌 한눈에 비교
 09_사이트_내놓는_법.html   배포·도메인·로그인·결제까지 내놓는 법 (열면 최신 안내서로 이어집니다)
 10_앱으로_내놓는_법.html   앱 심사·권한·아이콘·스토어 등록 (열면 최신 안내서로 이어집니다)
${사이트구성}
■ 사용법 - 파일 하나, 한 마디면 됩니다

 [기본] 07_AI빌드_스펙팩.md 파일 하나를 Claude Code나 Cursor에 넣고
        "이 스펙대로 만들어줘" 라고 하세요. 이게 전부입니다.

        스펙팩 안에 프로젝트 개요, 공통 레이아웃(헤더/내비/푸터),
        화면 ${stats.screens}개의 요건과 프롬프트, 화면 이동이 순서대로 정리되어 있어
        AI가 구조부터 잡고 화면을 순서대로 만들어 나갑니다.

 [디자인] 스펙팩 + 가이드 프리셋 1종 + 레이아웃 프리셋 1종을 함께 넣고
        "이 스펙과 디자인 규칙대로 만들어줘" 라고 하세요.
        화면 ${stats.screens}개가 같은 스타일로 통일됩니다.

        가이드 3벌과 레이아웃 2벌은 짝이 정해져 있지 않습니다. 마음에 드는 대로
        섞으시면 되고 6가지 조합이 나옵니다.

 [부분] 특정 화면만 다시 만들고 싶다면
        02_IA_화면목록.xlsx에서 그 화면의 '생성 프롬프트' 칸만 복사해 넣으세요.

${검수사용법} [문서] 01·03·04·05는 사람이 보는 기획 문서입니다.
        기획서, 제안서, 개발 견적서에 그대로 활용하세요.

 ※ AI에 넣는 파일은 스펙팩(.md) 하나면 충분합니다.
   엑셀은 AI용이 아니라 기획 문서로 보시는 용도입니다.

${
    화면있음
      ? `■ 완성화면 — 만들어진 결과부터 보세요

 완성화면/index.html 을 브라우저로 열면 화면 ${화면수}개가 목록으로 나옵니다.
 눌러서 돌아다녀 보세요. 장바구니가 비었을 때, 결제가 실패했을 때처럼
 예외 상황 화면까지 다 들어 있습니다.

 이 화면들은 같이 들어 있는 07_AI빌드_스펙팩으로 만든 것입니다.
 Claude Code(Opus 5, 추론 높음)에 스펙팩을 넣어 만들었습니다.

 완성화면/build/ 안에는 화면을 찍어내는 생성기가 들어 있습니다.
 data.mjs에서 문구·가격 같은 내용을 고치고 generate.mjs를 다시 돌리면
 화면 ${stats.screens}개가 한 번에 다시 만들어집니다. (Node.js 필요)

 ※ 이 화면들은 HTML입니다. 서버도 데이터베이스도 붙어 있지 않습니다.
   로그인·결제 버튼을 눌러도 실제로 동작하지 않습니다. 아래를 꼭 읽어주세요.

`
      : ""
  }■ 어디까지 만들어지나요 — 먼저 읽어주세요

 AI가 만들어 주는 것
${BUILD_SCOPE.made.map((x) => `  · ${x}`).join("\n")}

 개발이 필요한 것
${BUILD_SCOPE.needsDev.map((x) => `  · ${x}`).join("\n")}

 화면은 눌러서 돌아다닐 수 있는 상태로 나옵니다. 다만 로그인 버튼을 눌러도
 실제로 로그인이 되지는 않습니다. 바깥 서비스를 불러야 하는 기능이기 때문입니다.
${integrationBlock(p)}
■ 만든 뒤에는 화면목록으로 확인해 주세요

${CHECK_NOTE_FULL.map((l) => (l ? ` ${l}` : "")).join("\n")}

  · 02_IA_화면목록.xlsx — 화면을 위에서부터 하나씩 열어 보고,
    '기능정의'에 적힌 것이 실제로 있는지, '화면이동'의 버튼이 그 화면으로 가는지 봅니다.
  · 08_검수시나리오.xlsx — 화면별 확인 항목과 기대 결과가 적혀 있습니다.
    (디럭스·프리미엄에만 들어 있습니다)

 ※ 참고 — Claude Code(Opus 5, 추론 높음)로 144화면을 만들 때 약 40분이 걸렸습니다.
   쓰시는 도구·모델과 화면 수에 따라 달라집니다. 종량제 API를 쓰신다면
   화면이 많을수록 비용이 늘어나니, 먼저 일부만 만들어 보고 판단하세요.

■ 안내
${
    화면있음
      ? ` - 본 상품은 기획 산출물(문서)과 그 설계로 만든 화면(HTML)입니다.
   서버·데이터베이스·실제 동작은 포함되지 않습니다. 개발자에게 넘길
   완성된 설계와 화면까지가 범위입니다.`
      : ` - 본 상품은 기획 산출물(문서)이며, 완성된 코드나 사이트를 제공하지 않습니다.`
  }
 - 디자인 프리셋은 색·글꼴·컴포넌트 규칙 문서이며, 디자인 시안(이미지)이 아닙니다.
 - AI 생성 결과는 사용하는 도구·모델·시점에 따라 달라집니다.
   이 AI팩은 '만들어야 할 화면과 구조'를 고정해 누락을 막아줍니다.
 - 구매하신 산출물은 상업적 용도를 포함해 자유롭게 사용하실 수 있습니다.
 - 파일 재판매 및 재배포는 불가합니다.
`;
}

async function pack(p: Product) {
  if (!existsSync(p.src)) throw new Error(`산출물 폴더가 없어요: ${p.src}`);

  const stats = JSON.parse(readFileSync(`${p.src}/_패키지정보.json`, "utf8")) as {
    screens: number;
    requirements: number;
    verifyScenarios?: number;
  };

  // _패키지정보.json은 README 수치를 넘기기 위한 내부 파일이라 구매자에게 주지 않는다.
  // 08_검수시나리오는 디럭스·프리미엄에만 넣는다 — README 구성표와 실제 파일이 어긋나면 안 된다.
  const files = readdirSync(p.src).filter(
    (f) =>
      f !== "_패키지정보.json" &&
      (p.withVerify || !f.startsWith("08_검수시나리오")) &&
      /\.(xlsx|pptx|html|drawio|md|json)$/.test(f),
  );

  // 먼저 **폴더로** 만든다. 압축은 홈페이지에 상품을 올릴 때만 한다(--zip).
  // 안을 들여다보며 손보는 동안에는 zip이 오히려 불편하다 — 열어야 보이고,
  // 고치면 다시 묶어야 한다. 파는 순간에만 묶는 게 맞다(2026-08-04).
  const outDir = `${OUT}/${p.zipName}`;

  /* 팩 폴더를 통째로 지우지 않는다.
     예전에는 rmSync(outDir) 로 싹 지우고 다시 채웠다. 그 바람에 팩 안에 사람이
     만들어 둔 완성 화면을 두 번 날렸다 — 뷰티 49장, LMS 44장.
     문서는 우리가 다시 만들지만 완성 화면은 사람이 만든 것이라, 지울 권한이 없다.

     그래서 **우리가 넣는 파일만** 골라서 덮어쓴다. 우리가 안 넣은 것은 손대지 않는다.
     폴더를 어디에 두든 안전해야 한다 — 자리를 사람이 맞출 일이 아니다
     (2026-08-06 처음, 2026-08-07 되풀이하고 나서 구조를 바꿈). */
  let siteCount = 0;
  mkdirSync(outDir, { recursive: true });

  // 우리가 만드는 문서만 지우고 새로 쓴다. 완성화면/ 같은 남의 것은 그대로 둔다.
  if (existsSync(outDir)) {
    for (const f of readdirSync(outDir)) {
      const mine = /^(0\d_|README\.txt$|_패키지정보\.json$)/.test(f);
      if (mine) rmSync(`${outDir}/${f}`, { recursive: true, force: true });
    }
  }
  rmSync(`${outDir}/디자인프리셋`, { recursive: true, force: true });
  for (const f of files) copyFileSync(`${p.src}/${f}`, `${outDir}/${f}`);

  /* 모든 등급에 «인터넷에 올리는 법» 안내를 함께 넣는다(2026-08-10).
     화면까지 만들어 드려도 «내 컴퓨터에서만 보이는» 데서 멈추시는 분이 많다.
     팩마다 다시 쓰지 않고 한 벌을 복사한다 — 두 벌로 적으면 반드시 갈라진다. */
  /* ⭐ 2026-08-14 — 본문 대신 «안내장»을 넣는다 (사장님 지시).
     배포 서비스 화면도 앱 심사 기준도 자주 바뀐다. 본문을 통째로 넣어 두면
     이미 산 손님의 파일이 «그날 것»으로 굳어, 우리가 고쳐도 안 간다.
     링크로 두면 언제 여셔도 최신 글이 나온다.
     ⚠ 파일 이름(09_·10_)은 그대로 둔다 — 손님 습관을 바꾸지 않는다.
     ⚠ 인터넷이 없어도 «무엇을 하는 글인지»는 읽히게 요약을 넣는다. */
  for (const a of GUIDES) writeFileSync(`${outDir}/${a.파일}`, buildGuideCardHtml(a), "utf8");

  const packSite = `${outDir}/완성화면`;
  if (!p.sitePath && existsSync(packSite)) {
    // 원본 자리를 안 정해 둔 칸인데 화면이 들어 있다 — 사람이 직접 넣은 것이다. 센다.
    siteCount = readdirSync(`${packSite}/pages`).filter((f) => f.endsWith(".html")).length;
  }

  const presetDir = `${p.presetsFrom}/디자인프리셋`;
  let presetCount = 0;
  if (existsSync(presetDir)) {
    mkdirSync(`${outDir}/디자인프리셋`, { recursive: true });
    for (const f of readdirSync(presetDir)) {
      copyFileSync(`${presetDir}/${f}`, `${outDir}/디자인프리셋/${f}`);
      presetCount += 1;
    }
  }

  /* 디럭스·프리미엄만 — 원본 폴더에 화면이 있으면 팩으로 복사해 온다.
     원본이 없으면 아무것도 안 한다. 팩에 이미 들어 있는 화면은 그대로 둔다 —
     사람이 팩 안에 직접 만들어 넣은 것일 수 있다(실제로 그랬다). */
  if (p.sitePath) {
    if (!existsSync(p.sitePath)) {
      const has = existsSync(packSite);
      console.log(has
        ? `     · 완성 화면은 팩에 있던 것을 그대로 둡니다 (${siteCount}장)`
        : `     · 완성 화면 없음 — 문서만 나갑니다`);
      if (has) siteCount = readdirSync(`${packSite}/pages`).filter((f) => f.endsWith(".html")).length;
    } else {
    const walk = (dir: string, rel: string) => {
      mkdirSync(`${outDir}/완성화면/${rel}`, { recursive: true });
      for (const name of readdirSync(dir)) {
        const abs = `${dir}/${name}`;
        if (statSync(abs).isDirectory()) walk(abs, `${rel}${name}/`);
        else {
          copyFileSync(abs, `${outDir}/완성화면/${rel}${name}`);
          siteCount += 1;
        }
      }
    };
      walk(p.sitePath, "");
      const html = readdirSync(`${p.sitePath}/pages`).filter((f) => f.endsWith(".html")).length;
      if (html !== stats.screens) {
        throw new Error(`화면 수가 안 맞아요: 설계 ${stats.screens}개 vs 실제 HTML ${html}개`);
      }
    }
  }

  /* 손님이 받을 zip 안의 화면을 «직접» 센다. 설정이 아니라 결과를 본다. */
  const 팩화면수 = existsSync(`${packSite}/pages`)
    ? readdirSync(`${packSite}/pages`).filter((f) => f.endsWith(".html")).length
    : 0;
  writeFileSync(`${outDir}/README.txt`, readme(p, stats, 팩화면수), "utf8");

  let kb = 0;
  if (MAKE_ZIP) {
    const zip = new JSZip();
    const folder = zip.folder(p.zipName)!;
    /* 옛 파일은 «지우지 않고» 안 담는다.
     *
     * 2026-08-10 에 뷰티샵 디럭스 zip 에 `완성화면/index_old.html` 이 그대로 들어가
     * 손님에게 나갔다. 어느 것을 열어야 하는지 헷갈리는 파일이다.
     * 그렇다고 지우지는 않는다 — 완성화면 안의 파일은 사람이 만든 것이 섞여 있고,
     * 전에 두 번 잃었다. **팩에는 두고 zip 에만 안 담는 쪽**이 안전하다. */
    const 안담을것 = /(^|\/)(index_old|.*_old)\.[^/]+$|\.bak$|(^|\/)~\$/;
    const put = (dir: string, rel: string) => {
      for (const name of readdirSync(dir)) {
        const abs = `${dir}/${name}`;
        if (statSync(abs).isDirectory()) put(abs, `${rel}${name}/`);
        else if (안담을것.test(`${rel}${name}`)) console.log(`     · zip 에서 뺐습니다 — ${rel}${name}`);
        else folder.file(`${rel}${name}`, readFileSync(abs));
      }
    };
    put(outDir, "");
    const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    writeFileSync(`${OUT}/${p.zipName}.zip`, buf);
    kb = Math.round(buf.length / 1024);

    // 홈페이지가 실제로 파는 칸이면, 사이트가 내려줄 자리에도 같이 둔다.
    // 이름을 영문으로 바꾸는 이유는 adapters/storage/fs-pack-storage.ts 주석 참고.
    const sellable = PACKAGES.find((x) => x.id === p.pkgId)?.plans.some((pl) => pl.id === p.tier);
    if (sellable) {
      mkdirSync(SITE_PACKS, { recursive: true });
      writeFileSync(`${SITE_PACKS}/${p.pkgId}-${p.tier}.zip`, buf);
    }
  }

  console.log(
    `  ✔ ${p.zipName}${MAKE_ZIP ? " (폴더 + zip)" : ""} — 문서 ${files.length}개 + 프리셋 ${presetCount}개` +
      (siteCount ? ` + 완성화면 ${siteCount}개` : "") +
      `, 화면 ${stats.screens}개` +
      (kb ? `, ${kb}KB` : ""),
  );

  // 무엇이 들어 있고 무엇이 비었는지 한눈에 보라고, 부족한 칸 목록을 만들 재료를 남긴다.
  /* 「설정이 되어 있나」가 아니라 «팩에 정말 들어 있나»를 센다.
     전에는 p.sitePath 로 판단했는데, 완성화면 원본이 팩 안으로 들어오면서
     그 값을 비웠더니 화면이 132장 들어 있는 칸을 「빠짐」으로 보고했다(2026-08-09).
     물어야 할 것은 「경로를 적었나」가 아니라 「손님이 받을 zip 에 화면이 있나」다. */
  const missing: string[] = [];
  if (p.withVerify && !stats.verifyScenarios) missing.push("검수 시나리오(08)");
  if (p.withVerify && siteCount === 0) missing.push("완성 화면(HTML)");
  return { key: p.zipName, planLabel: p.planLabel, title: p.title, missing, kb };
}

/* ── --내보내기 : 「만드는 중」을 「다 된 것」으로 옮긴다 ────────
   B 회차가 검사를 다 통과한 뒤에 부른다. 여기서부터 검수·zip·진열이 본다.

   ⚠ 아래 «상품 이름 검사»보다 먼저 와야 한다. `--내보내기 lms` 의 `lms` 는 «업종 키»지
     상품 이름(`lms-deluxe`)이 아니라서, 검사에 먼저 걸리면 「알 수 없는 상품」이 된다.
     실제로 그랬다(2026-08-11). */
const 내보낼업종 = process.argv.includes("--내보내기")
  ? process.argv[process.argv.indexOf("--내보내기") + 1]
  : null;
if (내보낼업종) {
  const label = INDUSTRIES.find((i) => i.key === 내보낼업종)?.label;
  if (!label) throw new Error(`알 수 없는 업종: ${내보낼업종}`);
  if (!existsSync(만드는중방)) throw new Error(`${만드는중방} 이 없습니다 — 만드는 중인 것이 없습니다`);
  const 옮길것 = readdirSync(만드는중방).filter((d) => d === label || d.startsWith(`${label}_`));
  if (!옮길것.length) throw new Error(`${만드는중방} 에 ${label} 팩이 없습니다`);
  mkdirSync(판매팩방, { recursive: true });
  for (const d of 옮길것) {
    const 갈곳 = `${판매팩방}/${d}`;
    /* 이미 있으면 «지우고» 옮긴다. 섞이면 옛 파일이 남아 손님에게 나간다.
       ⚠ 완성화면은 사람이 만든 것이라, 옮기는 쪽에 그게 들어 있는지 먼저 본다. */
    if (existsSync(갈곳)) {
      if (!existsSync(`${만드는중방}/${d}/완성화면`)) {
        throw new Error(`${d} — 만드는중 쪽에 완성화면이 없습니다. 덮으면 사람이 만든 화면이 사라집니다`);
      }
      rmSync(갈곳, { recursive: true, force: true });
    }
    renameSync(`${만드는중방}/${d}`, 갈곳);
    console.log(`  옮김 → ${갈곳}`);
  }
  if (!readdirSync(만드는중방).length) rmSync(만드는중방, { recursive: true, force: true });
  console.log(`\n${label} ${옮길것.length}칸을 «다 된 것»으로 옮겼습니다.`);
  console.log("  이제 `npx tsx package-template.mts --zip` 으로 zip 을 구우세요.");
  process.exit(0);
}

// --zip 같은 깃발은 상품 이름이 아니다. 골라내지 않으면 `--zip`만 줬을 때 상품으로 읽힌다.
const arg = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (arg && !ALL_PRODUCTS[arg]) {
  throw new Error(`알 수 없는 상품: ${arg} (가능: ${Object.keys(ALL_PRODUCTS).join(", ")})`);
}

let targets: Record<string, Product> = arg ? { [arg]: ALL_PRODUCTS[arg] } : ALL_PRODUCTS;

/* 만드는 중인 팩을 «다 된 것» 쪽에 다시 만들지 않는다.
   안 그러면 A 회차 뒤 아무나 `npm run pack` 을 돌리는 순간
   반쯤 된 팩이 _판매팩 에 되살아나 검수에 걸린다. */
if (!만드는중모드 && existsSync(만드는중방)) {
  const 만드는중인것 = new Set(readdirSync(만드는중방));
  const 뺀것: string[] = [];
  targets = Object.fromEntries(Object.entries(targets).filter(([, p]) => {
    const 폴더 = p.zipName;
    if (만드는중인것.has(폴더)) { 뺀것.push(폴더); return false; }
    return true;
  }));
  if (뺀것.length) console.log(`만드는 중이라 건너뜁니다 — ${뺀것.join(" · ")}\n`);
}

mkdirSync(OUT, { recursive: true });

/* 손님이 직접 만들어 받는 zip 에도 같은 안내서를 넣는다.
   브라우저에서 만드는 zip 이라 public/ 에 있어야 가져다 쓸 수 있다.
   원본은 한 벌(_마케팅) — 여기서 복사해 오므로 갈라지지 않는다. */
mkdirSync("public/guide", { recursive: true });
/* ⚠ 파일 이름을 영문으로 둔다. 한글 이름은 주소로 만들 때 인코딩이 어긋나
   404 가 난다(2026-08-10 에 실제로 났다). 손님이 받는 zip 안에서는
   다시 한글 이름으로 넣으므로 보이는 이름은 그대로다. */
copyFileSync(내놓는법, "public/guide/deploy-guide.html");
copyFileSync(앱으로내놓는법, "public/guide/app-guide.html");
console.log("패키징 중...");
const results = [];
for (const p of Object.values(targets)) results.push(await pack(p));

// 부족한 구성 정리 — 어느 칸이 왜 아직 못 파는지 한 장으로 남긴다.
const 부족 = results.filter((r) => r.missing.length > 0);
const md = [
  "# 판매팩 — 부족한 구성",
  "",
  `${results.length}칸 중 **${부족.length}칸**이 아직 재료가 빠져 있습니다.`,
  "",
  "| 팩 | 등급 | 빠진 것 |",
  "|---|---|---|",
  ...results.map(
    (r) => `| ${r.key} | ${r.planLabel} | ${r.missing.length ? r.missing.join(", ") : "— (다 있음)"} |`,
  ),
  "",
  "## 무엇을 채워야 하나",
  "",
  "- **완성 화면(HTML)** — 그 등급의 스펙팩을 AI 코딩툴에 넣어 화면을 실제로 만들고,",
  "  `판매용_템플릿/<업종>_완성화면/` 에 두면 됩니다. 해외투어 3뎁스가 그렇게 만들어졌습니다",
  "  (Claude Code Opus 5, 144화면에 약 40분).",
  "  ⚠ 완성화면은 **팩 안이 원본**입니다 — `_판매팩/<팩이름>/완성화면/` 에 바로 만들어 넣으세요.",
  "  INDUSTRIES 에 경로를 적지 않습니다. 적으면 원본과 대상이 같아져 자기 자신을 덮어씁니다.",
  "- **검수 시나리오(08)** — `npx tsx build-template.mts <키>` 를 다시 돌리면 산출물 폴더에 생깁니다.",
  "",
  "재료를 채우고 `npx tsx package-template.mts` 를 다시 돌리면 이 표도 같이 갱신됩니다.",
  "",
].join("\n");
writeFileSync(`${OUT}/_부족한구성.md`, md);

console.log(`\n완료 → ${OUT}`);
console.log(`  재료가 빠진 칸: ${부족.length}/${results.length} (_부족한구성.md 참고)`);
