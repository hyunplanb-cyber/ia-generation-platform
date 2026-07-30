// 판매 상품별 zip 패키징.
//
// 사이트(/packages)의 상품 구성과 1:1로 맞춘다 — 업종 3종 × 플랜 2종 = 6개.
//   스탠다드 = 2뎁스 기본판 폴더,  프리미엄 = 3뎁스 심화판 폴더
// 두 플랜 모두 문서 8종 + AI 빌드 스펙팩 + 디자인 프리셋 3종을 전부 담는다.
// (차이는 설계의 깊이와 분량뿐 — lib/packages.ts의 makePlans와 같은 원칙)
//
// 디자인 프리셋은 업종당 한 벌뿐이라 심화판도 기본판 폴더에서 가져다 쓴다.
//
// 사용법: npx tsx package-template.mts            → 6개 전부
//         npx tsx package-template.mts lms-premium → 하나만
//         npx tsx package-template.mts groupbuy    → 미판매 재고(구 3등급 방식)
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import JSZip from "jszip";
import { PACKAGES, BUILD_SCOPE } from "./lib/packages";

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
}

// 사이트에서 파는 6종.
const PRODUCTS: Record<string, Product> = {};
const INDUSTRIES = [
  { key: "lms", base: `${T}/LMS_온라인강의플랫폼`, deep: `${T}/LMS_온라인강의플랫폼_상세IA`, label: "LMS", title: "온라인 강의 플랫폼(LMS)" },
  { key: "beauty", base: `${T}/뷰티샵_예약플랫폼`, deep: `${T}/뷰티샵_예약플랫폼_상세IA`, label: "뷰티샵", title: "뷰티샵 예약 플랫폼" },
  { key: "travel", base: `${T}/해외투어_티켓예약`, deep: `${T}/해외투어_티켓예약_상세IA`, label: "여행", title: "해외 투어·티켓 예약 플랫폼" },
];
for (const ind of INDUSTRIES) {
  PRODUCTS[`${ind.key}-standard`] = {
    src: ind.base,
    presetsFrom: ind.base,
    zipName: `${ind.label}_스탠다드`,
    title: ind.title,
    planLabel: "스탠다드",
    pkgId: ind.key,
  };
  PRODUCTS[`${ind.key}-premium`] = {
    src: ind.deep,
    presetsFrom: ind.base,
    zipName: `${ind.label}_프리미엄`,
    title: ind.title,
    planLabel: "프리미엄",
    pkgId: ind.key,
  };
}

// 아직 사이트에 안 올린 재고. 구 3등급 방식 그대로 한 벌만 묶는다.
const LEGACY: Record<string, Product> = {
  groupbuy: { src: `${T}/공동구매_공구플랫폼`, presetsFrom: `${T}/공동구매_공구플랫폼`, zipName: "공동구매_기본", title: "공동구매(공구) 플랫폼", planLabel: "기본" },
  "groupbuy-deep": { src: `${T}/공동구매_공구플랫폼_상세IA`, presetsFrom: `${T}/공동구매_공구플랫폼`, zipName: "공동구매_상세", title: "공동구매(공구) 플랫폼", planLabel: "상세" },
  admin: { src: `${T}/비즈니스관리_관리자시스템`, presetsFrom: `${T}/비즈니스관리_관리자시스템`, zipName: "관리자시스템_기본", title: "통합 비즈니스 관리자 시스템", planLabel: "기본" },
  "admin-deep": { src: `${T}/비즈니스관리_관리자시스템_상세IA`, presetsFrom: `${T}/비즈니스관리_관리자시스템`, zipName: "관리자시스템_상세", title: "통합 비즈니스 관리자 시스템", planLabel: "상세" },
};

const ALL_PRODUCTS = { ...PRODUCTS, ...LEGACY };
const OUT = `${T}/_배포/판매_6종`;

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
  const 검수 = stats.verifyScenarios
    ? ` 08_검수시나리오.xlsx     오픈 전 점검표 — 시나리오 ${stats.verifyScenarios}개\n`
    : "";
  return `${p.title} — ${p.planLabel}
AI팩 — 기획 산출물 한 벌
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
${검수} 디자인프리셋/          색·글꼴·컴포넌트 규칙 3종 (.md / .json)

■ 사용법 - 파일 하나, 한 마디면 됩니다

 [기본] 07_AI빌드_스펙팩.md 파일 하나를 Claude Code나 Cursor에 넣고
        "이 스펙대로 만들어줘" 라고 하세요. 이게 전부입니다.

        스펙팩 안에 프로젝트 개요, 공통 레이아웃(헤더/내비/푸터),
        화면 ${stats.screens}개의 요건과 프롬프트, 화면 이동이 순서대로 정리되어 있어
        AI가 구조부터 잡고 화면을 순서대로 만들어 나갑니다.

 [디자인] 스펙팩과 디자인프리셋 파일을 함께 넣고
        "이 스펙과 디자인 규칙대로 만들어줘" 라고 하세요.
        화면 ${stats.screens}개가 같은 스타일로 통일됩니다.

 [부분] 특정 화면만 다시 만들고 싶다면
        02_IA_화면목록.xlsx에서 그 화면의 '생성 프롬프트' 칸만 복사해 넣으세요.

 [검수] 다 만든 뒤 08_검수시나리오.xlsx를 열어 화면을 하나씩 눌러보며
        '결과' 칸에 PASS / FAIL / WARN 을 적으세요. 빠진 화면이 드러납니다.

 [문서] 01·03·04·05는 사람이 보는 기획 문서입니다.
        기획서, 제안서, 개발 견적서에 그대로 활용하세요.

 ※ AI에 넣는 파일은 스펙팩(.md) 하나면 충분합니다.
   엑셀은 AI용이 아니라 기획 문서로 보시는 용도입니다.

■ 어디까지 만들어지나요 — 먼저 읽어주세요

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
 - 본 상품은 기획 산출물(문서)이며, 완성된 코드나 사이트를 제공하지 않습니다.
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
  const files = readdirSync(p.src).filter(
    (f) =>
      f !== "_패키지정보.json" &&
      /\.(xlsx|pptx|html|drawio|md|json)$/.test(f),
  );

  const zip = new JSZip();
  const folder = zip.folder(p.zipName)!;
  for (const f of files) folder.file(f, readFileSync(`${p.src}/${f}`));

  const presetDir = `${p.presetsFrom}/디자인프리셋`;
  let presetCount = 0;
  if (existsSync(presetDir)) {
    const pf = folder.folder("디자인프리셋")!;
    for (const f of readdirSync(presetDir)) {
      pf.file(f, readFileSync(`${presetDir}/${f}`));
      presetCount += 1;
    }
  }

  folder.file("README.txt", readme(p, stats));

  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  writeFileSync(`${OUT}/${p.zipName}.zip`, buf);
  console.log(
    `  ✔ ${p.zipName}.zip — 문서 ${files.length}개 + 프리셋 ${presetCount}개 + README, ` +
      `화면 ${stats.screens}개, ${Math.round(buf.length / 1024)}KB`,
  );
}

const arg = process.argv[2];
const targets = arg ? { [arg]: ALL_PRODUCTS[arg] } : PRODUCTS;
if (arg && !ALL_PRODUCTS[arg]) {
  throw new Error(`알 수 없는 상품: ${arg} (가능: ${Object.keys(ALL_PRODUCTS).join(", ")})`);
}

mkdirSync(OUT, { recursive: true });
console.log("패키징 중...");
for (const p of Object.values(targets)) await pack(p);
console.log(`\n완료 → ${OUT}`);
