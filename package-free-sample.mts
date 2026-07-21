// 무료 샘플 zip 패키징.
// 유료 패키지(7종)와 달리 핵심 3종만 담는다 — 맛보기로 충분하되 유료와 확실히 구분.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import JSZip from "jszip";

const SRC = "판매용_템플릿/무료샘플_콘텐츠판매사이트";
const OUT = "판매용_템플릿/_배포/3_마케팅";
mkdirSync(OUT, { recursive: true });

const FILES = [
  "01_메뉴구조.xlsx",
  "02_IA_화면목록.xlsx",
  "07_AI빌드_스펙팩.md",
];

const README = `1인 크리에이터 콘텐츠 판매 사이트 — 무료 기획 샘플
====================================================

전자책·템플릿·강의자료를 직접 파는 1인 사이트를 AI로 만들 때
"무엇을 만들지" 알려주는 기획 산출물입니다.

■ 구성 (3종)
 01_메뉴구조.xlsx      메뉴와 화면 트리
 02_IA_화면목록.xlsx   화면 15개 + 화면별 AI 생성 프롬프트   ★핵심
 07_AI빌드_스펙팩.md   AI 코딩툴에 통째로 넣는 스펙 문서      ★핵심

■ 사용 방법 - 파일 하나, 한 마디면 됩니다

 [기본] 07_AI빌드_스펙팩.md 를 Claude Code나 Cursor에 넣고
        "AI 빌드 스펙팩 확인해서 콘텐츠 판매 사이트 만들어줘" 라고 하세요.

 [부분] 특정 화면만 다시 만들고 싶다면
        02_IA_화면목록.xlsx의 '생성 프롬프트' 칸만 복사해 넣으세요.

■ 이 샘플에 들어 있는 것
 - 화면 15개 (홈 / 콘텐츠 / 구매 / 내 자료실 / 판매 관리)
 - AI가 잘 빠뜨리는 예외 화면 4개
   검색 결과 없음 · 결제 실패 · 자료실 비어 있음 · 다운로드 기간 만료
 - 화면 이동 21개

■ 더 큰 서비스를 만드신다면
 화면 37~43개 규모의 업종별 풀 패키지도 있습니다.
 기능정의서 · FLOW 흐름도 · WBS · 디자인 프리셋까지 포함돼요.

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
writeFileSync(`${OUT}/무료샘플_콘텐츠판매사이트.zip`, buf);
console.log(`  ✔ 무료샘플_콘텐츠판매사이트.zip — 파일 ${FILES.length + 1}개, ${Math.round(buf.length / 1024)}KB`);
console.log(`\n완료 → ${OUT}`);
