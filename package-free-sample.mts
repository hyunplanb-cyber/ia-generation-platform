// 무료 샘플 zip 패키징.
//
// 담는 문서는 유료와 같은 6종으로 두고, 차이는 "무엇이 들어 있나"가 아니라
// **규모**로 벌린다 — 무료는 15화면, 유료는 37~144화면이다.
// 문서를 몇 개 빼서 아끼려 했더니, 받은 사람이 내용보다 항목 수를 먼저 본다
// (2026-08-03). 표지에 세 줄뿐이면 그 순간 "별거 없네"로 끝난다.
// 검수 시나리오와 디자인 프리셋은 디럭스·프리미엄의 판매 근거라 계속 뺀다.
//
// zip을 만든 뒤 lib/free-sample-data.ts 까지 여기서 갱신한다.
// 사이트는 파일이 아니라 그 상수를 내려주므로(app/api/free-sample/route.ts),
// 따로 옮기는 걸 잊으면 홈페이지에는 옛날 파일이 계속 나간다.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import JSZip from "jszip";

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
];

const README = `1인 크리에이터 콘텐츠 판매 사이트 — 무료 기획 샘플
====================================================

전자책·템플릿·강의자료를 직접 파는 1인 사이트를 AI로 만들 때
"무엇을 만들지" 알려주는 기획 산출물입니다.

■ 구성 (8종)
 01_메뉴구조.xlsx      메뉴 5개 · 화면 15개 트리
 02_IA_화면목록.xlsx   화면 15개 + 화면별 AI 생성 프롬프트   ★핵심
 03_기능정의서.xlsx    요구사항 87개 (업무 > 기능 > 구성)
 04_WBS.xlsx           화면별 일정 15줄 (주말 제외)
 05_FLOW_흐름도.html   화면 이동 21개를 그림으로, 메뉴별 5장
 05_FLOW_흐름도.drawio 위 흐름도를 draw.io에서 직접 고치는 파일
 06_메뉴구조.pptx      메뉴 구조를 장표 한 장으로 (보고용)
 07_AI빌드_스펙팩.md   AI 코딩툴에 통째로 넣는 스펙 문서      ★핵심

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
 - 메뉴 5개 / 화면 15개 (홈 · 콘텐츠 · 구매 · 내 자료실 · 판매 관리)
 - 요구사항 87개 (유형별로 기능 · 콘텐츠 · UI/UX · 정책 구분)
 - 화면별 AI 생성 프롬프트 15개
 - 화면 이동 21개 / 흐름도 5장
 - 화면별 일정 15줄
 - AI가 잘 빠뜨리는 예외 화면 4개
   검색 결과 없음 · 결제 실패 · 자료실 비어 있음 · 다운로드 기간 만료

■ 더 큰 서비스를 만드신다면
 문서 종류는 같고, 규모가 다릅니다.

              무료 샘플        업종별 AI팩
  화면          15개           37 ~ 144개
  요구사항      87개          216 ~ 799개
  업종         콘텐츠 판매    강의 · 뷰티 · 여행 · 공동구매 · 관리자

 여기에 검수 시나리오와 디자인 프리셋(가이드 3종 + 레이아웃 2종)이 더해지고,
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
