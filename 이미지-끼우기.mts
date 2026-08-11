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
const 이미지방 = "판매용_템플릿/_이미지";
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
const 업종 = 팩.split("_")[0];

/* ── 역할 가르기 ──────────────────────────────────────────────
   자리표 라벨에 이 말이 들어 있으면 그 역할이다. **위에서부터 먼저 맞는 것**을 쓴다. */
const 역할규칙: [RegExp, string][] = [
  [/프로필|고수|강사|아바타|사람/, "인물"],
  [/매장|살롱|인테리어|외관|간판/, "매장"],
  [/결과|시술 후|시술 전|완성|비포|애프터/, "결과"],
  [/후기|리뷰/, "후기"],
  [/시술|작업|과정|대표|상품|장비|강의/, "시술"],
];
const 기본역할 = "시술";

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
  const 글 = readFileSync(css, "utf8").replace(/\n\/\* ── 예시 사진[\s\S]*?\/\* ── 예시 사진 끝 ── \*\/\n/, "\n");
  writeFileSync(css, 글, "utf8");
  rmSync(넣을곳, { recursive: true, force: true });
  console.log(`\n${팩} — 예시 사진을 뺐습니다.`);
  console.log(`  ${고친장}장에서 ${뺀수}개를 뺐고, assets/예시/ 도 지웠습니다.`);
  console.log("  ⚠ 자리표(div)는 «건드리지 않았습니다». 원래 회색 네모로 돌아갑니다.");
  process.exit(0);
}

/* ── 넣기 ───────────────────────────────────────────────────── */
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
      const 어디 = 업종사진.includes(파일) ? `${업종}/${파일}` : `공용/${파일}`;
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
const 쓸것 = [...new Set([...역할별.values()].flat())];

mkdirSync(넣을곳, { recursive: true });
for (const 상대 of 쓸것) {
  const [폴더, 이름] = 상대.split("/");
  copyFileSync(join(이미지방, 폴더, 이름), join(넣을곳, 이름));
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

for (const f of readdirSync(pages).filter((x) => x.endsWith(".html"))) {
  const 길 = join(pages, f);
  const 전 = readFileSync(길, "utf8");
  if (전.includes("data-예시")) { console.log(`  이미 들어 있어 건너뜁니다: ${f}`); continue; }
  이번화면에쓴것 = new Set();   // 화면이 바뀌면 다시 센다

  /* 자리표 여는 태그 바로 뒤에 <img> 를 꽂는다. 라벨(span.lb)은 그대로 두고
     CSS 로 감춘다 — 빼면 도로 보인다. */
  const 후 = 전.replace(
    /(<div class="ph[^"]*"[^>]*>)([\s\S]*?)(<\/div>)/g,
    (통째, 여는, 속, 닫는) => {
      /* ⚠ 역할이 어디 적혀 있나 — 두 군데다.
         큰 자리표는 라벨에 「이미지 영역 (매장 대표 · 권장 1200×900)」이라고 다 적혀 있는데,
         **작은 자리표(tiny)는 라벨이 「400×400」뿐이고 역할은 `title` 속성에 있다.**
         라벨만 보면 프로필 19곳·리뷰 39곳이 통째로 안 잡힌다 — 2026-08-11 에 그랬다.
         그래서 title 을 «먼저» 보고, 없으면 라벨을 본다. */
      const 제목 = /title="([^"]*)"/.exec(여는)?.[1] ?? "";
      const 라벨 = /<span class="lb">([\s\S]*?)<\/span>/.exec(속)?.[1] ?? "";
      const 글 = `${제목} ${라벨.replace(/<[^>]+>/g, "")}`;
      if (!글.includes("이미지 영역") && !/\d{3,4}×\d{3,4}/.test(글)) return 통째;  // 자리표가 아니다
      const 역할 = 역할규칙.find(([re]) => re.test(글))?.[1] ?? 기본역할;
      const 사진 = 뽑기(역할);
      if (!사진) return 통째;
      역할셈.set(역할, (역할셈.get(역할) ?? 0) + 1);
      넣은수 += 1;
      return `${여는}<img data-예시 src="../assets/예시/${사진}" alt="">${속}${닫는}`;
    },
  );
  if (후 !== 전) { writeFileSync(길, 후, "utf8"); 고친장 += 1; }
}

/* CSS 는 «맨 뒤에 덧붙인다». 원래 규칙을 건드리지 않아야 빼기가 깨끗하다. */
const css = join(완성화면, "assets", "css", "base.css");
const 있던글 = readFileSync(css, "utf8");
if (!있던글.includes("── 예시 사진")) {
  writeFileSync(css, `${있던글}
/* ── 예시 사진 ──────────────────────────────────────────────
   이미지-끼우기.mts 가 붙인다. --빼기 로 이 덩어리째 지운다.
   ⚠ object-fit:cover 가 핵심이다 — 자리 비율이 제각각인데 사진은 가로 한 벌뿐이다. */
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

console.log(`\n${팩} — 예시 사진을 끼웠습니다.`);
console.log(`  화면 ${고친장}장 · 자리 ${넣은수}곳`);
for (const [r, n] of [...역할셈].sort((a, b) => b[1] - a[1])) console.log(`    ${r.padEnd(4)} ${n}곳`);
console.log(`  사진 ${쓸것.length}장을 ${넣을곳} 로 옮겼습니다.`);
console.log("\n  마음에 안 들면:  npx tsx 이미지-끼우기.mts " + 팩 + " --빼기");
