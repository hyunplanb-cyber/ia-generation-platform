/* 워터마크 박은 예시 사진을 «완성화면의 자리표»에 끼워 넣는다. 그리고 뺀다.
 *
 * 왜 «빼기»가 같이 있나 (2026-08-11)
 *   사장님: 「뷰티 디럭스에 한번 적용해 보고 별로면 빼자.」
 *   **완성화면은 사람이 만든 것이라 지우면 안 된다.** 그래서 지우지 않고 «얹는다» —
 *   자리표 div 는 그대로 두고 그 안에 <img> 를 넣는다. 빼면 원래대로 돌아온다.
 *
 * 어떻게 고르나
 *   자리표 라벨(「이미지 영역 (매장 대표 · …)」)에 적힌 말로 «역할»을 가른다.
 *   역할마다 어느 사진을 쓸지는 `_이미지/<업종>/배치.csv` 에 적혀 있다 — 사람이 고칠 수 있다.
 *   같은 역할에 여러 장이면 돌려 가며 쓴다. 한 화면이 온통 같은 사진이면 가짜처럼 보인다.
 *
 * ⚠ object-fit:cover 를 반드시 준다. 자리 비율이 892가지인데 사진은 가로 한 벌뿐이다.
 *   안 주면 늘어나거나 찌그러진다.
 *
 * 쓰는 법
 *   npx tsx 이미지-끼우기.mts 뷰티샵_디럭스
 *   npx tsx 이미지-끼우기.mts 뷰티샵_디럭스 --빼기
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const 팩방들 = ["판매용_템플릿/_판매팩", "판매용_템플릿/_만드는중"];
/* ⚠ 2026-08-13 에 그림을 «_이미지» 한 곳으로 모았다. 워터마크가 박힌 것만 여기 있다 —
   원본(사진·마스코트)은 절대 팩에 들어가면 안 되므로 이 아래에 두지 않는다. */
const 이미지방 = "판매용_템플릿/_이미지/팩용";
const 뺄까 = process.argv.includes("--빼기");
const 팩 = process.argv.slice(2).find((a) => !a.startsWith("--"));

if (!팩) {
  console.error("쓰는 법: npx tsx 이미지-끼우기.mts <팩폴더> [--빼기]");
  console.error("  예)   npx tsx 이미지-끼우기.mts 뷰티샵_디럭스");
  process.exit(1);
}

const 찾은방 = 팩방들.find((방) => existsSync(join(방, 팩, "완성화면", "pages")));
if (!찾은방) { console.error(`${팩} 의 완성화면을 못 찾았습니다.`); process.exit(1); }
const 완성화면 = join(찾은방, 팩, "완성화면");
const 넣을곳 = join(완성화면, "assets", "예시");

/* 팩 이름과 사진 폴더 이름이 늘 같지는 않다. 공동구매가 파는 것은 「제품」이라
   사진도 제품으로 모았다 — 업종마다 폴더를 따로 두느니 성격이 같으면 나눠 쓴다. */
const 사진폴더별명: Record<string, string> = { 공동구매: "제품" };
const 팩업종 = 팩.split("_")[0];
const 업종 = 사진폴더별명[팩업종] ?? 팩업종;

/* ── 역할 가르기 ──────────────────────────────────────────────
   자리표 라벨에 이 말이 들어 있으면 그 역할이다. **위에서부터 먼저 맞는 것**을 쓴다. */
const 역할규칙: [RegExp, string][] = [
  [/프로필|고수|강사|아바타|사람/, "인물"],
  [/매장|살롱|인테리어|외관|간판/, "매장"],
  [/결과|시술 후|시술 전|완성|비포|애프터/, "결과"],
  [/후기|리뷰/, "후기"],
  [/시술|작업|과정|대표|상품|장비|강의|여행지|기획전/, "시술"],
];
const 기본역할 = "시술";

/* ── 사진을 넣으면 «안 되는» 자리 ─────────────────────────────
   .ph 라고 다 사진 자리가 아니다. 지도와 차트도 같은 회색 네모로 그려 두었다.
   지도 자리에 살롱 사진이 들어가면 그냥 틀린 화면이 된다. 2026-08-11 에 여섯 팩을
   훑어 보니 지도가 33곳(여행 디럭스 6 · 프리미엄 27), 차트가 2곳 있었다. */
const 지도인가 = (여는: string) => /\bph-map\b/.test(여는);
const 차트인가 = (글: string) => /지도|차트|그래프|추이/.test(글);

/* 동그란 자리는 사람 얼굴이다. 이름이 안 붙어 있어도 그렇다 —
   ph-circle · ph-round 가 그 표시다(여섯 팩에서 387곳).
   LMS 는 ph-ava · ph-ava-sm 이라 부른다(2026-08-13, 두 팩 33곳). */
const 얼굴인가 = (여는: string) => /\bph-(circle|round|ava|ava-sm)\b/.test(여는);

/* 붙여 둔 CSS 덩어리를 떼어 낸다.
   ⚠ 끝의 `\n` 을 «있어도 없어도» 되게 둔다. 2026-08-11 에 뷰티샵 디럭스의 base.css 가
     줄바꿈 없이 끝나 있어서 정규식이 안 맞았다. 그러면 --빼기 가 조용히 실패하고,
     다시 끼울 때 「이미 있다」며 건너뛰어 **옛 CSS 가 그대로 남는다.**
     그 바람에 새로 넣은 .ph{position:relative} 가 그 팩에만 안 들어갔다.
     둘 다 아무 말이 없어서 눈으로 보기 전엔 몰랐다. */
const CSS떼기 = (글: string) =>
  글.replace(/\n*\/\* ── 예시 사진[\s\S]*?\/\* ── 예시 사진 끝 ── \*\/\n*/g, "\n");

/* ── 빼기 ───────────────────────────────────────────────────── */
const pages = join(완성화면, "pages");
if (뺄까) {
  let 뺀수 = 0, 고친장 = 0;
  for (const f of readdirSync(pages).filter((x) => x.endsWith(".html"))) {
    const 길 = join(pages, f);
    const 전 = readFileSync(길, "utf8");
    const 후 = 전.replace(/<img data-예시[^>]*>/g, () => { 뺀수 += 1; return ""; });
    if (후 !== 전) { writeFileSync(길, 후, "utf8"); 고친장 += 1; }
  }
  const css = join(완성화면, "assets", "css", "base.css");
  writeFileSync(css, CSS떼기(readFileSync(css, "utf8")), "utf8");
  rmSync(넣을곳, { recursive: true, force: true });
  rmSync(join(완성화면, "사진바꾸기.csv"), { force: true });
  console.log(`\n${팩} — 예시 사진을 뺐습니다.`);
  console.log(`  ${고친장}장에서 ${뺀수}개를 뺐고, assets/예시/ 도 지웠습니다.`);
  console.log("  ⚠ 자리표(div)는 «건드리지 않았습니다». 원래 회색 네모로 돌아갑니다.");
  process.exit(0);
}

/* ── 넣기 ───────────────────────────────────────────────────── */
/** 배치.csv 에서 «(비움)» 으로 적어 둔 역할. 이 자리는 회색 자리표로 남긴다. */
const 비울역할 = new Set<string>();

/* ── 이름으로 짝짓기 (`짝.csv`) ────────────────────────────────
 * 왜 필요한가 (2026-08-13)
 *   LMS 의 강의 카드 202곳에 들어갈 이름은 «열세 가지»뿐이다 —
 *   「엑셀로 시작하는 실무 데이터 분석」이 22곳, 「통기타 코드 30개로 끝내기」가 12곳.
 *   역할만 보고 돌려 가며 넣으면 **파이썬 강의에 바이올린 사진이 붙는다.**
 *   234장이 필요한 것이 아니라 **13장이 필요하다.** 같은 강의는 어디서나 같은 그림이어야
 *   진짜처럼 보인다 — 돌려 쓰는 쪽이 오히려 가짜다.
 *
 *   그래서 자리표 «바로 뒤에» 붙은 글(강의 이름·상품명)을 보고 짝을 찾는다.
 *   `_이미지/<업종>/짝.csv` 에 «말,파일» 로 적는다. 위에서부터 먼저 맞는 것을 쓴다.
 *   짝이 없으면 여느 때처럼 역할로 고른다.
 */
const 짝목록: [string, string][] = (() => {
  const 길 = join(이미지방, 업종, "짝.csv");
  if (!existsSync(길)) return [];
  const 것들: [string, string][] = [];
  for (const 줄 of readFileSync(길, "utf8").replace(/^﻿/, "").split(/\r?\n/).slice(1)) {
    const [말, 파일] = 줄.split(",").map((s) => s?.trim());
    if (말 && 파일) 것들.push([말, 파일]);
  }
  return 것들;
})();

/* ⚠ 사진이 «어느 폴더»에 있는지는 배치표에도 짝표에도 안 적혀 있다. 파일 이름만 적는다.
   그래서 팩용 아래를 다 뒤져 찾는다 — 제 업종 폴더를 먼저 본다.
   2026-08-13: 배치.csv 는 업종 폴더와 공용만 뒤지고 있었다. 뷰티샵 히어로에 마스코트
   살롱 그림을 넣으려 했더니 「공용/뷰티샵_네일_물범.webp」를 찾다가 멈췄다.
   짝표는 이미 다 뒤지고 있었는데 배치표만 안 그랬다 — 같은 자리에서 두 번 걸리지 않게 합친다. */
const 사진방들 = readdirSync(이미지방, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
  .map((e) => e.name)
  .sort((a, b) => (a === 업종 ? -1 : b === 업종 ? 1 : 0));   // 제 업종 폴더를 먼저 본다
const 어디있나 = (파일: string) => 사진방들.find((d) => existsSync(join(이미지방, d, 파일)));

/** 역할마다 쓸 사진 목록. 배치.csv 가 있으면 그것을 따르고, 없으면 만들어 준다. */
function 사진고르기(): Map<string, string[]> {
  const 방 = join(이미지방, 업종);
  const 공용방 = join(이미지방, "공용");
  const 있는것 = (d: string) => (existsSync(d) ? readdirSync(d).filter((f) => f.endsWith(".webp")) : []);
  const 업종사진 = 있는것(방);
  const 공용사진 = 있는것(공용방);
  if (!업종사진.length && !공용사진.length) {
    console.error(`${방} 과 ${공용방} 에 사진이 없습니다.`);
    console.error("  먼저 `npx tsx 이미지-예시만들기.mts` 로 워터마크를 박으세요.");
    process.exit(1);
  }

  const 표길 = join(방, "배치.csv");
  const 역할별 = new Map<string, string[]>();
  if (existsSync(표길)) {
    for (const 줄 of readFileSync(표길, "utf8").split(/\r?\n/).slice(1)) {
      const [파일, 역할] = 줄.split(",").map((s) => s?.trim());
      if (!파일 || !역할) continue;
      /* 파일 자리에 «(비움)» 이라고 적으면 그 역할은 «일부러» 안 채운다.
         2026-08-11 사장님 지적: 매칭 팩의 「짐 사진」·「첨부 사진」 자리에 패션 인물
         사진이 들어갔다. 손님이 이삿짐을 찍어 올릴 자리다.
         맞는 사진이 없을 때는 회색 자리표가 «더 정직하다» — 자리표는
         「이미지 영역 (짐 사진 · 권장 1200×900)」이라고 «맞는 말»을 하는데,
         엉뚱한 사진은 «틀린 말»을 한다. 빈 것보다 틀린 것이 나쁘다. */
      if (파일 === "(비움)") { 비울역할.add(역할); continue; }
      const 방이름 = 어디있나(파일);
      if (!방이름) { console.error(`배치.csv 가 부르는 사진을 못 찾았습니다: ${파일}`); process.exit(1); }
      const 어디 = `${방이름}/${파일}`;
      if (!역할별.has(역할)) 역할별.set(역할, []);
      역할별.get(역할)!.push(어디);
    }
    return 역할별;
  }

  /* 배치표가 없으면 만들어 준다 — 업종 사진은 「시술」, 공용은 「인물」로 놓고 시작한다.
     사람이 열어서 고치면 그다음부터 그대로 따른다. */
  mkdirSync(방, { recursive: true });
  const 줄들 = ["파일,역할"];
  for (const f of 업종사진) 줄들.push(`${f},시술`);
  for (const f of 공용사진) 줄들.push(`${f},인물`);
  writeFileSync(표길, `${줄들.join("\n")}\n`, "utf8");
  console.log(`\n⚠ ${표길} 를 만들었습니다.`);
  console.log("  역할 칸을 고치면 그대로 따릅니다 — 매장 · 인물 · 결과 · 시술 · 후기");
  console.log("  지금은 업종 사진을 전부 「시술」로 놓았습니다. 열어서 고쳐 주세요.\n");
  for (const f of 업종사진) { if (!역할별.has("시술")) 역할별.set("시술", []); 역할별.get("시술")!.push(`${업종}/${f}`); }
  for (const f of 공용사진) { if (!역할별.has("인물")) 역할별.set("인물", []); 역할별.get("인물")!.push(`공용/${f}`); }
  return 역할별;
}

const 역할별 = 사진고르기();
/* 짝.csv 가 부르는 파일도 «반드시» 옮겨 간다. 배치.csv 에 없을 수 있다 —
   빠뜨리면 화면에 깨진 그림 표시가 뜬다.
   ⚠ 업종 폴더 «밖»도 뒤진다. LMS 의 강의 썸네일은 「직업」·「장소」에서 빌려 온다 —
     같은 사진을 폴더마다 복사해 두면 어느 것이 진짜인지 금세 모르게 된다. */
const 짝파일 = [...new Set(짝목록.map(([, f]) => f))].map((f) => {
  const 방 = 어디있나(f);
  if (!방) { console.error(`짝.csv 가 부르는 사진을 못 찾았습니다: ${f}`); process.exit(1); }
  return `${방}/${f}`;
});
const 쓸것 = [...new Set([...[...역할별.values()].flat(), ...짝파일])];

mkdirSync(넣을곳, { recursive: true });
for (const 상대 of 쓸것) {
  const [폴더, 이름] = 상대.split("/");
  const 원래 = join(이미지방, 폴더, 이름);
  if (!existsSync(원래)) { console.error(`짝.csv 가 부르는 사진이 없습니다: ${원래}`); process.exit(1); }
  copyFileSync(원래, join(넣을곳, 이름));
}

/** 역할별로 «돌려 가며» 고른다. 한 화면이 온통 같은 사진이면 가짜처럼 보인다.
 *
 * ⚠ 한 화면 «안에서는» 같은 사진을 두 번 쓰지 않는다.
 *   그냥 돌리기만 했더니 뷰티샵 홈의 사진 다섯 칸 중 둘이 같은 사진이 됐다(2026-08-11).
 *   나란히 놓인 자리에서 같은 사진이 두 번 보이면 바로 가짜로 읽힌다.
 *   그 역할의 사진을 다 썼으면 그때는 어쩔 수 없이 되풀이한다. */
const 차례 = new Map<string, number>();
let 이번화면에쓴것 = new Set<string>();
function 뽑기(역할: string): string | null {
  if (비울역할.has(역할)) return null;   // 배치.csv 가 「(비움)」이라 했다 — 자리표로 둔다
  const 목록 = 역할별.get(역할) ?? 역할별.get(기본역할) ?? [...역할별.values()][0];
  if (!목록?.length) return null;
  for (let n = 0; n < 목록.length; n += 1) {
    const i = ((차례.get(역할) ?? 0) + n) % 목록.length;
    const 사진 = 목록[i].split("/")[1];
    if (!이번화면에쓴것.has(사진)) {
      차례.set(역할, i + 1);
      이번화면에쓴것.add(사진);
      return 사진;
    }
  }
  /* 그 역할을 다 썼다. **되풀이하느니 다른 역할 사진을 빌린다.**
     나란히 놓인 자리에 같은 사진이 두 번 보이는 것이 제일 나쁘다 —
     역할이 조금 안 맞는 것보다 훨씬 크게 티가 난다(2026-08-11 뷰티샵 홈에서 그랬다). */
  const 빌릴것 = [...역할별.values()].flat()
    .map((p) => p.split("/")[1])
    .find((사진) => !이번화면에쓴것.has(사진));
  if (빌릴것) { 이번화면에쓴것.add(빌릴것); return 빌릴것; }

  // 이 화면이 우리가 가진 사진보다 자리가 많다. 그때는 어쩔 수 없다.
  const i = (차례.get(역할) ?? 0) % 목록.length;
  차례.set(역할, i + 1);
  return 목록[i].split("/")[1];
}

let 넣은수 = 0, 고친장 = 0;
const 역할셈 = new Map<string, number>();

/* 손님이 사진을 바꿀 때 볼 표. 「어느 화면 어느 자리에 어떤 파일이 들어갔나」를 적는다.
   파일 이름을 그대로 두고 내용만 바꿔 덮어쓰면 화면이 따라 바뀐다 —
   HTML 을 열어 고칠 필요가 없다. 그래서 «파일 이름»이 이 표의 핵심이다. */
const 바꾸기표: string[][] = [];
const 화면이름 = (() => {
  const 길 = join(완성화면, "스펙팩", "07_AI빌드_스펙팩.json");
  const 표 = new Map<string, string>();
  if (existsSync(길)) {
    const spec = JSON.parse(readFileSync(길, "utf8")) as { screens?: { pageId: string; pageName: string }[] };
    for (const s of spec.screens ?? []) 표.set(s.pageId, s.pageName);
  }
  return 표;
})();

for (const f of readdirSync(pages).filter((x) => x.endsWith(".html"))) {
  const 길 = join(pages, f);
  const 전 = readFileSync(길, "utf8");
  if (전.includes("data-예시")) { console.log(`  이미 들어 있어 건너뜁니다: ${f}`); continue; }
  이번화면에쓴것 = new Set();   // 화면이 바뀌면 다시 센다

  /* 자리표 여는 태그 바로 뒤에 <img> 를 꽂는다. 라벨(span.lb)은 그대로 두고
     CSS 로 감춘다 — 빼면 도로 보인다. */
  const 후 = 전.replace(
    /(<div class="ph[^"]*"[^>]*>)([\s\S]*?)(<\/div>)/g,
    (통째: string, 여는: string, 속: string, 닫는: string, 자리: number) => {
      /* ⚠ 역할이 어디 적혀 있나 — 두 군데다.
         큰 자리표는 라벨에 「이미지 영역 (매장 대표 · 권장 1200×900)」이라고 다 적혀 있는데,
         **작은 자리표(tiny)는 라벨이 「400×400」뿐이고 역할은 `title` 속성에 있다.**
         라벨만 보면 프로필 19곳·리뷰 39곳이 통째로 안 잡힌다 — 2026-08-11 에 그랬다.
         그래서 title 을 «먼저» 보고, 없으면 라벨을 본다. */
      /* ⚠ 이름이 «다섯 군데»에 흩어져 있다. 팩마다 만든 사람이 달라 관습이 다르다.
           뷰티샵·공동구매·매칭·장비렌탈 → title 속성 + <span class="lb">
           여행                          → data-cap 속성 + <span class="cap">
           LMS                           → aria-label 속성 «뿐»
         2026-08-11 에 lb 만 보다가 여행 팩 234곳을 통째로 놓쳤다.
         2026-08-13 에는 LMS 두 팩(329곳)이 aria-label 만 써서 이름이 «전부 빈 글»로 읽혔다.
         그러면 아무 규칙에도 안 걸려 죄다 기본역할이 된다 — 강사 프로필 자리에도
         강의 썸네일에도 똑같은 사진이 들어갔다. 이름을 못 읽으면 조용히 다 틀린다.
         다섯 군데를 다 본다. */
      const 제목 = /title="([^"]*)"/.exec(여는)?.[1] ?? "";
      const 캡 = /data-cap="([^"]*)"/.exec(여는)?.[1] ?? "";
      const 에이리아 = /aria-label="([^"]*)"/.exec(여는)?.[1] ?? "";
      const 라벨 = /<span class="(?:lb|cap)">([\s\S]*?)<\/span>/.exec(속)?.[1] ?? "";
      const 글 = `${제목} ${캡} ${에이리아} ${라벨.replace(/<[^>]+>/g, "")}`.trim();

      if (지도인가(여는) || 차트인가(글)) return 통째;   // 사진 자리가 아니다

      /* ① 이름으로 짝을 찾는다. 자리표 «바로 뒤»에 강의 이름·상품명이 붙어 있다.
         300자만 본다 — 더 보면 옆 카드의 이름까지 딸려 들어와 엉뚱한 짝이 걸린다.
         ⚠ 얼굴 자리는 «건너뛴다». 강사 프로필 뒤에도 강사명·강의명이 따라오기 때문에
           그냥 두면 동그란 얼굴 자리에 강의 썸네일이 들어간다. */
      /* 자리표 «제 이름»도 본다 — 「서비스 소개」·「기획전 배너」처럼 뒤에 붙은 글이 없는 자리가 있다. */
      const 뒷글 = 얼굴인가(여는) ? "" : `${글} ${전.slice(자리 + 통째.length, 자리 + 통째.length + 300).replace(/<[^>]+>/g, " ")}`;
      const 짝 = 뒷글 && 짝목록.find(([말]) => 뒷글.includes(말))?.[1];
      if (짝) {
        /* 같은 강의는 «같은 그림»이어야 한다. 한 화면에 두 번 나와도 바꾸지 않는다 —
           여기서는 되풀이가 옳다. */
        역할셈.set("짝", (역할셈.get("짝") ?? 0) + 1);
        넣은수 += 1;
        return `${여는}<img data-예시 src="../assets/예시/${짝}" alt="">${속}${닫는}`;
      }

      /* ⚠ 이름이 아예 없는 자리도 사진 자리다. 여행 프리미엄은 727곳이 이름 없이
         그라데이션만 칠해 둔 4:3 상품 카드였다. 예전처럼 「이미지 영역」이라는
         말을 요구하면 그 팩은 한 곳도 안 채워진다. .ph 이면 일단 사진 자리로 본다 —
         진짜 아닌 것(지도·차트)은 바로 위에서 이미 걸렀다. */
      const 역할 = 얼굴인가(여는) ? "인물"
        : (역할규칙.find(([re]) => re.test(글))?.[1] ?? 기본역할);
      const 사진 = 뽑기(역할);
      if (!사진) return 통째;
      역할셈.set(역할, (역할셈.get(역할) ?? 0) + 1);
      넣은수 += 1;

      return `${여는}<img data-예시 src="../assets/예시/${사진}" alt="">${속}${닫는}`;
    },
  );
  if (후 !== 전) { writeFileSync(길, 후, "utf8"); 고친장 += 1; }
}

/* CSS 는 «맨 뒤에 덧붙인다». 원래 규칙을 건드리지 않아야 빼기가 깨끗하다.
   ⚠ 있으면 «건너뛰지» 말고 «떼어 내고 새로 붙인다». 건너뛰면 옛 판이 그대로 남아,
     규칙을 고쳐도 이미 한 번 끼운 팩에는 안 들어간다 — 2026-08-11 에 그랬다. */
const css = join(완성화면, "assets", "css", "base.css");
const 있던글 = CSS떼기(readFileSync(css, "utf8"));
{
  writeFileSync(css, `${있던글}
/* ── 예시 사진 ──────────────────────────────────────────────
   이미지-끼우기.mts 가 붙인다. --빼기 로 이 덩어리째 지운다.
   ⚠ object-fit:cover 가 핵심이다 — 자리 비율이 제각각인데 사진은 가로 한 벌뿐이다. */

/* ⚠ 자리표를 «우리 손으로» 기준점으로 만든다. 팩 CSS 를 믿지 않는다.
   2026-08-11: 매칭 팩의 .ph 에는 position:relative 가 없었다(다른 여섯 팩에는 있었다).
   그래서 아래 position:absolute 가 저 멀리 있는 조상을 기준으로 잡혀,
   64px 프로필 사진이 **페이지 전체를 덮었다.** 히어로 사진이 아래 카드 위로 흘러내리고,
   고수 목록은 빈 네모가 되고, 분야 목록은 데스크톱에서 통째로 가려졌다.
   기준점이 없으면 absolute 는 어디로든 간다 — 여기서 못 박는다. */
.ph{position:relative}
.ph > img[data-예시]{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; display:block;
}
/* 사진이 들어간 자리에서는 「이미지 영역 (…)」 글자를 감춘다.
   지우지 않고 감추기만 한다 — 빼면 도로 보인다. */
.ph > img[data-예시] ~ .lb{display:none}
/* ── 예시 사진 끝 ── */
`, "utf8");
}

/* ── 손님용 「사진 바꾸기」 표 ────────────────────────────────
 * ⚠ 넣는 김에 같이 적지 «않는다». 이미 사진이 들어 있는 화면은 위에서 건너뛰기
 *   때문에, 그때 적으면 두 번째 실행부터 표가 텅 빈다(2026-08-11 에 그랬다).
 *   끝난 뒤에 pages 를 «다시 훑어» 적는다 — 그러면 몇 번을 돌려도 표는 온전하다.
 * ⚠ BOM 을 붙인다 — 없으면 엑셀이 한글을 깨뜨린다. */
for (const f of readdirSync(pages).filter((x) => x.endsWith(".html"))) {
  const 화면ID = f.replace(/\.html$/, "");
  const 글월 = readFileSync(join(pages, f), "utf8");
  for (const [, 여는, 속] of 글월.matchAll(/(<div class="ph[^"]*"[^>]*>)([\s\S]*?)<\/div>/g)) {
    const 사진 = /<img data-예시 src="\.\.\/assets\/예시\/([^"]+)"/.exec(속)?.[1];
    if (!사진) continue;
    const 제목 = /title="([^"]*)"/.exec(여는)?.[1] ?? "";
    const 캡 = /data-cap="([^"]*)"/.exec(여는)?.[1] ?? "";
    const 에이리아 = /aria-label="([^"]*)"/.exec(여는)?.[1] ?? "";
    const 라벨 = (/<span class="(?:lb|cap)">([\s\S]*?)<\/span>/.exec(속)?.[1] ?? "").replace(/<[^>]+>/g, "");
    const 글 = `${제목} ${캡} ${에이리아} ${라벨}`.trim();
    const 비율 = /aspect-ratio:\s*(\d+)\s*\/\s*(\d+)/.exec(여는);
    const 크기 = 비율 ? `${비율[1]}×${비율[2]}` : (/(\d{3,4}×\d{3,4})/.exec(글)?.[1] ?? "");
    const 종류 = 얼굴인가(여는) ? "인물" : (역할규칙.find(([re]) => re.test(글))?.[1] ?? 기본역할);
    /* 자리 이름도 팩마다 적는 투가 다르다.
       뷰티샵 「이미지 영역 (매장 대표 · 권장 1200×900)」 / LMS 「강의 썸네일 이미지 자리, 권장 1200×900」
       손님이 보는 표라 「시술」 같은 역할 이름보다 «자리 이름»이 훨씬 쓸모 있다. */
    const 자리 = (/이미지 영역 \(([^·)]+)/.exec(글)?.[1]
      ?? /([^,(]+?)\s*이미지 자리/.exec(글)?.[1]
      ?? (제목 || 캡 || 에이리아 || 종류)).trim().replace(/\s+/g, " ");
    바꾸기표.push([화면ID, 화면이름.get(화면ID) ?? "", 자리, 종류, 크기, 사진]);
  }
}

const 칸 = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
const 표길 = join(완성화면, "사진바꾸기.csv");
writeFileSync(표길, `﻿${[
  ["화면ID", "화면명", "어떤 자리", "종류", "권장 크기", "지금 들어간 사진"].map(칸).join(","),
  ...바꾸기표.map((줄) => 줄.map(칸).join(",")),
].join("\r\n")}\r\n`, "utf8");

console.log(`\n${팩} — 예시 사진을 끼웠습니다.`);
console.log(`  화면 ${고친장}장 · 자리 ${넣은수}곳`);
for (const [r, n] of [...역할셈].sort((a, b) => b[1] - a[1])) console.log(`    ${r.padEnd(4)} ${n}곳`);
console.log(`  사진 ${쓸것.length}장을 ${넣을곳} 로 옮겼습니다.`);
console.log(`  손님용 표 ${표길} — ${바꾸기표.length}줄`);
console.log("\n  마음에 안 들면:  npx tsx 이미지-끼우기.mts " + 팩 + " --빼기");
