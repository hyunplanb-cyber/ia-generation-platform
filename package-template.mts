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
  copyFileSync, rmSync,
} from "node:fs";
import JSZip from "jszip";
import { PACKAGES, BUILD_SCOPE, PLAN_NAMES, type PlanId } from "./lib/packages";

const T = "판매용_템플릿";

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
 *  siteBase / siteDeep — 그 깊이로 실제로 만들어 둔 화면(HTML) 폴더.
 *    있는 것만 디럭스·프리미엄이 생긴다. 비즈니스관리(admin)는 판매 보류라 뺐다.
 */
const INDUSTRIES = [
  { key: "lms", label: "LMS", title: "온라인 강의 플랫폼(LMS)",
    base: `${T}/LMS_온라인강의플랫폼`, deep: `${T}/LMS_온라인강의플랫폼_상세IA` },
  { key: "beauty", label: "뷰티샵", title: "뷰티샵 예약 플랫폼",
    base: `${T}/뷰티샵_예약플랫폼`, deep: `${T}/뷰티샵_예약플랫폼_상세IA` },
  { key: "travel", label: "여행", title: "해외 투어·티켓 예약 플랫폼",
    base: `${T}/해외투어_티켓예약`, deep: `${T}/해외투어_티켓예약_상세IA`,
    // 두 사이트는 프리셋이 다르다 — 디럭스는 소프트 파스텔, 프리미엄은 모던 네이비.
    // 같은 설계로 얼마나 다른 얼굴이 나오는지 두 등급이 나란히 보여준다.
    siteBase: `${T}/해외투어_티켓예약_완성화면_디럭스`,
    siteDeep: `${T}/해외투어_티켓예약_완성화면` },
  { key: "groupbuy", label: "공동구매", title: "공동구매(공구) 플랫폼",
    base: `${T}/공동구매_공구플랫폼`, deep: `${T}/공동구매_공구플랫폼_상세IA` },
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

const OUT = `${T}/_배포/00_판매팩`;
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

function readme(p: Product, stats: { screens: number; requirements: number; verifyScenarios?: number }) {
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
  // 프리미엄에만 붙는다 — 설계뿐 아니라 그 설계로 실제로 만든 화면이 함께 들어간다.
  const 사이트구성 = p.sitePath
    ? ` 완성화면/               이 스펙팩으로 실제로 만든 화면 ${stats.screens}개 (HTML)  ★프리미엄\n`
    : "";
  const 부제 = p.sitePath ? "AI팩 — 기획 산출물 한 벌 + 완성 화면" : "AI팩 — 기획 산출물 한 벌";
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
    p.sitePath
      ? `■ 완성화면 — 만들어진 결과부터 보세요

 완성화면/index.html 을 브라우저로 열면 화면 ${stats.screens}개가 목록으로 나옵니다.
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
 ※ 참고 — Claude Code(Opus 5, 추론 높음)로 144화면을 만들 때 약 40분이 걸렸습니다.
   쓰시는 도구·모델과 화면 수에 따라 달라집니다. 종량제 API를 쓰신다면
   화면이 많을수록 비용이 늘어나니, 먼저 일부만 만들어 보고 판단하세요.

■ 안내
${
    p.sitePath
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
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  for (const f of files) copyFileSync(`${p.src}/${f}`, `${outDir}/${f}`);

  const presetDir = `${p.presetsFrom}/디자인프리셋`;
  let presetCount = 0;
  if (existsSync(presetDir)) {
    mkdirSync(`${outDir}/디자인프리셋`, { recursive: true });
    for (const f of readdirSync(presetDir)) {
      copyFileSync(`${presetDir}/${f}`, `${outDir}/디자인프리셋/${f}`);
      presetCount += 1;
    }
  }

  // 디럭스·프리미엄만 — 스펙팩으로 실제로 만든 화면을 통째로 넣는다.
  let siteCount = 0;
  if (p.sitePath) {
    if (!existsSync(p.sitePath)) throw new Error(`완성 화면 폴더가 없어요: ${p.sitePath}`);
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

  writeFileSync(`${outDir}/README.txt`, readme(p, stats), "utf8");

  let kb = 0;
  if (MAKE_ZIP) {
    const zip = new JSZip();
    const folder = zip.folder(p.zipName)!;
    const put = (dir: string, rel: string) => {
      for (const name of readdirSync(dir)) {
        const abs = `${dir}/${name}`;
        if (statSync(abs).isDirectory()) put(abs, `${rel}${name}/`);
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
  const missing: string[] = [];
  if (p.withVerify && !stats.verifyScenarios) missing.push("검수 시나리오(08)");
  if (p.withVerify && !p.sitePath) missing.push("완성 화면(HTML)");
  return { key: p.zipName, planLabel: p.planLabel, title: p.title, missing, kb };
}

const arg = process.argv[2];
if (arg && !ALL_PRODUCTS[arg]) {
  throw new Error(`알 수 없는 상품: ${arg} (가능: ${Object.keys(ALL_PRODUCTS).join(", ")})`);
}
const targets: Record<string, Product> = arg ? { [arg]: ALL_PRODUCTS[arg] } : ALL_PRODUCTS;

mkdirSync(OUT, { recursive: true });
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
  "  그 뒤 이 파일 위쪽 INDUSTRIES에 `siteBase` / `siteDeep` 경로를 적어주세요.",
  "- **검수 시나리오(08)** — `npx tsx build-template.mts <키>` 를 다시 돌리면 산출물 폴더에 생깁니다.",
  "",
  "재료를 채우고 `npx tsx package-template.mts` 를 다시 돌리면 이 표도 같이 갱신됩니다.",
  "",
].join("\n");
writeFileSync(`${OUT}/_부족한구성.md`, md);

console.log(`\n완료 → ${OUT}`);
console.log(`  재료가 빠진 칸: ${부족.length}/${results.length} (_부족한구성.md 참고)`);
