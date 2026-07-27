// 판매 등급별 zip 패키징 (일회성).
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import JSZip from "jszip";

// 어떤 템플릿을 묶을지 인자로 받는다: npx tsx package-template.mts lms | beauty
const SETS = {
  lms: { src: "판매용_템플릿/LMS_온라인강의플랫폼", label: "LMS", title: "온라인 강의 플랫폼(LMS)" },
  beauty: { src: "판매용_템플릿/뷰티샵_예약플랫폼", label: "뷰티샵", title: "뷰티샵 예약 플랫폼" },
  travel: { src: "판매용_템플릿/여행_투어티켓예약플랫폼", label: "여행", title: "해외 투어·티켓 예약 플랫폼" },
  admin: { src: "판매용_템플릿/비즈니스관리_관리자시스템", label: "관리자시스템", title: "통합 비즈니스 관리자 시스템" },
  groupbuy: { src: "판매용_템플릿/공동구매_공구플랫폼", label: "공동구매", title: "공동구매(공구) 플랫폼" },
};
const setKey = (process.argv[2] ?? "lms") as keyof typeof SETS;
const chosen = SETS[setKey];
if (!chosen) {
  throw new Error(`알 수 없는 템플릿: ${setKey} (가능: ${Object.keys(SETS).join(", ")})`);
}
const SRC = chosen.src;
const OUT = "판매용_템플릿/_배포";
mkdirSync(OUT, { recursive: true });

// 실제 수치는 build-template.mts가 남긴 파일에서 읽는다.
// (예전엔 README에 LMS 수치가 박혀 있어 뷰티·여행 구매자도 "화면 37개"를 봤다.)
const stats = JSON.parse(readFileSync(`${SRC}/_패키지정보.json`, "utf8")) as {
  screens: number;
  requirements: number;
};

const README = `${chosen.title} 기획 산출물 패키지
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

■ 사용법 - 파일 하나, 한 마디면 됩니다

 [기본] 07_AI빌드_스펙팩.md 파일 하나를 Claude Code나 Cursor에 넣고
        "이 스펙대로 만들어줘" 라고 하세요. 이게 전부입니다.

        스펙팩 안에 프로젝트 개요, 공통 레이아웃(헤더/내비/푸터),
        화면 ${stats.screens}개의 요건과 프롬프트, 화면 이동이 순서대로 정리되어 있어
        AI가 구조부터 잡고 화면을 순서대로 만들어 나갑니다.

 [부분] 특정 화면만 다시 만들고 싶다면
        02_IA_화면목록.xlsx에서 그 화면의 '생성 프롬프트' 칸만 복사해 넣으세요.

 [문서] 01·03·04·05는 사람이 보는 기획 문서입니다.
        기획서, 제안서, 개발 견적서에 그대로 활용하세요.

 ※ AI에 넣는 파일은 스펙팩(.md) 하나면 충분합니다.
   엑셀은 AI용이 아니라 기획 문서로 보시는 용도입니다.
   파일 업로드가 어려운 환경이면 스펙팩을 열어 내용을 복사해 넣으셔도 동일합니다.

■ 안내
 - 본 상품은 기획 산출물(문서)이며, 완성된 코드나 사이트를 제공하지 않습니다.
 - AI 생성 결과는 사용하는 도구·모델·시점에 따라 달라집니다.
   본 패키지는 '만들어야 할 화면과 구조'를 고정해 누락을 막아줍니다.
 - 구매하신 산출물은 상업적 용도를 포함해 자유롭게 사용하실 수 있습니다.
 - 파일 재판매 및 재배포는 불가합니다.
`;

// 등급 차이: 스탠다드는 문서만(화면별 프롬프트는 IA 화면목록에 포함) →
// 디럭스부터 "통째로 넣는" 스펙팩 → 프리미엄은 디자인 프리셋까지.
// _패키지정보.json은 README 수치를 넘기기 위한 내부 파일이라 구매자에게 주지 않는다.
const ALL = readdirSync(SRC).filter(
  (f) =>
    f !== "_패키지정보.json" &&
    (f.endsWith(".xlsx") || f.endsWith(".pptx") || f.endsWith(".html") || f.endsWith(".drawio") || f.endsWith(".md") || f.endsWith(".json")),
);
const SPEC = ALL.filter((f) => f.startsWith("07_"));
const DOCS = ALL.filter((f) => !f.startsWith("07_"));

const TIERS: Record<string, string[]> = {
  [`${chosen.label}_스탠다드`]: DOCS,          // 기획 문서 6종 (스펙팩 제외)
  [`${chosen.label}_디럭스`]: [...DOCS, ...SPEC], // 7종 전부
  [`${chosen.label}_프리미엄`]: [...DOCS, ...SPEC], // 7종 + 디자인 프리셋(아래에서 별도 추가)
};
const PRESET_DIR = `${SRC}/디자인프리셋`;

for (const [name, files] of Object.entries(TIERS)) {
  const zip = new JSZip();
  const folder = zip.folder(name)!;
  for (const f of files) {
    folder.file(f, readFileSync(`${SRC}/${f}`));
  }
  // 프리미엄에만 디자인 프리셋 3종 폴더를 넣는다
  if (name.includes("프리미엄")) {
    const pf = folder.folder("디자인프리셋")!;
    for (const f of readdirSync(PRESET_DIR)) {
      pf.file(f, readFileSync(`${PRESET_DIR}/${f}`));
    }
  }
  folder.file("README.txt", README);
  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  writeFileSync(`${OUT}/${name}.zip`, buf);
  console.log(`  ✔ ${name}.zip — 파일 ${files.length + 1}개, ${Math.round(buf.length / 1024)}KB`);
}

console.log(`\n완료 → ${OUT}`);
