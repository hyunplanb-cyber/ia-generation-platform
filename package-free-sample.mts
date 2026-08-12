// 무료 샘플 zip 패키징.
//
// 담는 문서는 유료와 같은 6종으로 두고, 차이는 "무엇이 들어 있나"가 아니라
// **규모**로 벌린다 — 무료는 16화면, 유료는 37~144화면이다.
// 문서를 몇 개 빼서 아끼려 했더니, 받은 사람이 내용보다 항목 수를 먼저 본다
// (2026-08-03). 표지에 세 줄뿐이면 그 순간 "별거 없네"로 끝난다.
// 디자인 프리셋은 디럭스·프리미엄의 판매 근거라 계속 뺀다.
// **검수 시나리오는 2026-08-13 부터 넣는다** — 광고에서 「화면목록 «과 검수 시나리오»」를
// 앞세우기로 했는데, 무료로 받은 사람이 그 절반을 못 보면 말이 안 맞는다.
// 규모로 벌린다: 무료 105항목 vs 유료 216~944항목.
//
// zip을 만든 뒤 lib/free-sample-data.ts 까지 여기서 갱신한다.
// 사이트는 파일이 아니라 그 상수를 내려주므로(app/api/free-sample/route.ts),
// 따로 옮기는 걸 잊으면 홈페이지에는 옛날 파일이 계속 나간다.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import JSZip from "jszip";
import * as XLSX from "xlsx";

const SRC = "판매용_템플릿/_무료샘플_콘텐츠판매사이트";
const OUT = "판매용_템플릿";
const EMBED = "lib/free-sample-data.ts";
const ZIP_NAME = "무료샘플_콘텐츠판매사이트.zip";
mkdirSync(OUT, { recursive: true });

// 흐름도(html)를 넣은 이유: 브라우저로 바로 열리고, 받자마자 눈에 보이는 유일한
// 산출물이다. 엑셀만 몇 장 있는 것보다 "이게 뭔지" 훨씬 빨리 전달된다.
// 같은 내용을 두 벌씩 담는 까닭(흐름도 html·drawio, 메뉴구조 xlsx·pptx):
// 하나는 그냥 보라고, 하나는 고쳐 쓰라고 넣는다. 쓰임이 다르므로 중복이 아니다.
const FILES = [
  "01_메뉴구조.xlsx",
  "02_IA_화면목록.xlsx",
  "03_기능정의서.xlsx",
  "04_WBS.xlsx",
  "05_FLOW_흐름도.html",
  "05_FLOW_흐름도.drawio",
  "06_메뉴구조.pptx",
  "07_AI빌드_스펙팩.md",
  "08_검수시나리오.xlsx",
];

/* ── 숫자는 «파일에서 세어» 쓴다 ──────────────────────────────────
 *
 * 2026-08-12 에 README 의 숫자 여섯 개가 한꺼번에 틀린 것을 찾았다 —
 * 화면 15(→16) · 메뉴 5(→6) · 요구사항 87(→94) · 이동 21(→22) · 흐름도 5장(→6) · 일정 15줄(→16).
 * 샘플이 늘어날 때 손으로 적은 숫자만 옛것으로 남은 것이다. **손님이 받는 zip 안에서** 그랬다.
 * 같은 일이 원고에서도 한 번 있었다(「15개」). 손으로 적으면 반드시 또 썩는다.
 * 그래서 이제 세어서 쓴다. 숫자를 고치려거든 문서를 고쳐라 — 여기가 아니라. */
/* ⚠ XLSX.readFile 은 ESM 빌드에서 파일을 못 연다(fs 가 안 붙어 있다). 버퍼로 읽어 넘긴다. */
const 시트 = (파일: string, 이름?: string) => {
  const wb = XLSX.read(readFileSync(`${SRC}/${파일}`), { type: "buffer" });
  const n = 이름 && wb.SheetNames.includes(이름) ? 이름 : wb.SheetNames[wb.SheetNames.length - 1];
  return XLSX.utils.sheet_to_json<any[]>(wb.Sheets[n], { header: 1 });
};
const ia = 시트("02_IA_화면목록.xlsx", "화면목록");
const 머리 = ia[0].map(String);
const 칸 = (조각: string) => 머리.findIndex((h) => h.includes(조각));
const 화면줄 = ia.slice(1).filter((r) => r[칸("화면ID")] && String(r[칸("화면ID")]).trim());

const 수 = {
  화면: 화면줄.length,
  메뉴: new Set(화면줄.map((r) => r[칸("메뉴")])).size,
  프롬프트: 화면줄.filter((r) => r[칸("생성 프롬프트")] && String(r[칸("생성 프롬프트")]).trim()).length,
  이동: 화면줄.reduce((n, r) => n + String(r[칸("이동")] ?? "").split(/[\n,·]/).filter((x) => x.trim()).length, 0),
  요구사항: 시트("03_기능정의서.xlsx").slice(1).filter((r) => r.some((c) => String(c ?? "").trim())).length,
  일정: 시트("04_WBS.xlsx").slice(1).filter((r) => r.some((c) => String(c ?? "").trim())).length,
  흐름도: (readFileSync(`${SRC}/05_FLOW_흐름도.drawio`, "utf8").match(/<diagram /g) ?? []).length,
  검수: 시트("08_검수시나리오.xlsx", "검수 시나리오").slice(1)
    .filter((r) => r[0] && String(r[0]).trim()).length,
  검수공통: 0, 검수화면: 0,
};
/* 「검수 현황」 시트가 공통·화면별을 이미 세어 두었다. 그 값을 그대로 받아 적는다. */
for (const r of 시트("08_검수시나리오.xlsx", "검수 현황")) {
  const 이름 = String(r?.[0] ?? "");
  if (이름.includes("공통")) 수.검수공통 = Number(r[1]) || 0;
  if (이름.includes("화면별")) 수.검수화면 = Number(r[1]) || 0;
}
const 메뉴이름 = [...new Set(화면줄.map((r) => String(r[칸("메뉴")])))].join(" · ");
for (const [이름, v] of Object.entries(수))
  if (!v) throw new Error(`${이름} 을 못 셌습니다 — 문서 서식이 바뀌었는지 보세요`);

const README = `1인 크리에이터 콘텐츠 판매 사이트 — 무료 기획 샘플
====================================================

전자책·템플릿·강의자료를 직접 파는 1인 사이트를 AI로 만들 때
"무엇을 만들지" 알려주는 기획 산출물입니다.

■ 구성 (9종)
 01_메뉴구조.xlsx      메뉴 ${수.메뉴}개 · 화면 ${수.화면}개 트리
 02_IA_화면목록.xlsx   화면 ${수.화면}개 + 화면별 AI 생성 프롬프트   ★핵심
 03_기능정의서.xlsx    요구사항 ${수.요구사항}개 (업무 > 기능 > 구성)
 04_WBS.xlsx           화면별 일정 ${수.일정}줄 (주말 제외)
 05_FLOW_흐름도.html   화면 이동 ${수.이동}개를 그림으로, ${수.흐름도}장
 05_FLOW_흐름도.drawio 위 흐름도를 draw.io에서 직접 고치는 파일
 06_메뉴구조.pptx      메뉴 구조를 장표 한 장으로 (보고용)
 07_AI빌드_스펙팩.md   AI 코딩툴에 통째로 넣는 스펙 문서      ★핵심
 08_검수시나리오.xlsx  배포 전에 눌러 볼 확인 항목 ${수.검수}개     ★핵심

■ 사용 방법 - 파일 하나, 한 마디면 됩니다

 [기본] 07_AI빌드_스펙팩.md 를 Claude Code나 Cursor에 넣고
        "AI 빌드 스펙팩 확인해서 콘텐츠 판매 사이트 만들어줘" 라고 하세요.

 [부분] 특정 화면만 다시 만들고 싶다면
        02_IA_화면목록.xlsx의 '생성 프롬프트' 칸만 복사해 넣으세요.

 [흐름] 05_FLOW_흐름도.html 은 더블클릭하면 브라우저에서 바로 열립니다.
        위쪽 탭으로 메뉴별 흐름을 나눠 볼 수 있어요.
        고쳐 쓰시려면 .drawio 파일을 draw.io(app.diagrams.net)에 올리세요.

 [보고] 06_메뉴구조.pptx 는 그대로 보고 자료에 넣으실 수 있어요.

■ 이 샘플에 들어 있는 것
 - 메뉴 ${수.메뉴}개 / 화면 ${수.화면}개 (${메뉴이름})
 - 요구사항 ${수.요구사항}개 (유형별로 기능 · 콘텐츠 · UI/UX · 정책 구분)
 - 화면별 AI 생성 프롬프트 ${수.프롬프트}개
 - 화면 이동 ${수.이동}개 / 흐름도 ${수.흐름도}장
 - 화면별 일정 ${수.일정}줄
 - 배포 전 확인 항목 ${수.검수}개 (공통 ${수.검수공통}개 + 화면별 ${수.검수화면}개)
 - AI가 잘 빠뜨리는 예외 화면 4개
   검색 결과 없음 · 결제 실패 · 자료실 비어 있음 · 다운로드 기간 만료

■ 더 큰 서비스를 만드신다면
 문서 종류는 같고, 규모가 다릅니다.

              무료 샘플        업종별 AI팩
  화면          ${수.화면}개           37 ~ 144개
  요구사항      ${수.요구사항}개          216 ~ 799개
  확인 항목      ${수.검수}개          216 ~ 944개
  업종         콘텐츠 판매    강의 · 뷰티 · 여행 · 공동구매 · 관리자

 여기에 디자인 프리셋(가이드 3종 + 레이아웃 2종)이 더해지고,
 상위 구성은 완성된 HTML 화면까지 들어 있습니다.

■ 안내
 - 본 자료는 기획 산출물(문서)이며, 완성된 코드나 사이트가 아닙니다.
 - AI 생성 결과는 도구·모델·시점에 따라 달라집니다.
   이 문서는 결과물을 똑같이 만들어주는 것이 아니라,
   만들어야 할 화면과 구조가 누락되지 않도록 고정해 줍니다.
 - 자유롭게 사용하시되, 파일 자체의 재판매·재배포는 삼가주세요.
`;

const zip = new JSZip();
const folder = zip.folder("무료샘플_콘텐츠판매사이트")!;
for (const f of FILES) folder.file(f, readFileSync(`${SRC}/${f}`));
folder.file("README.txt", README);

const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
writeFileSync(`${OUT}/${ZIP_NAME}`, buf);
console.log(`  ✔ ${ZIP_NAME} — 파일 ${FILES.length + 1}개, ${Math.round(buf.length / 1024)}KB`);

// 사이트가 내려줄 상수까지 여기서 갱신한다.
writeFileSync(
  EMBED,
  `// 자동 생성 파일 — 고치지 말고 \`npx tsx package-free-sample.mts\` 를 다시 돌릴 것.
// 무료 샘플 zip(누구나 /api/free-sample 로 받는다).
export const FREE_SAMPLE_FILENAME = ${JSON.stringify(ZIP_NAME)};
export const FREE_SAMPLE_BASE64 =
  "${buf.toString("base64")}";
`,
  "utf8",
);
console.log(`  ✔ ${EMBED} 갱신 — 홈페이지가 이 파일을 내려준다`);
console.log(`\n완료 → ${OUT}`);
