/* 팩 정적 검사 — 촬영 전에 「열면 깨지는 것」을 먼저 잡는다.
   브라우저로 1,200쪽을 다 열 수는 없으니, 파일만 보고 알 수 있는 것을 훑는다.

   보는 것
   1. 끊어진 링크 — href 가 가리키는 쪽이 없는 것 (촬영 중 404 가 제일 곤란하다)
   2. 없는 그림 — src 가 가리키는 파일이 없는 것
   3. 화면 목록에 있는데 아무 데서도 안 이어지는 쪽 (외톨이)
   4. 굳은 날짜 — 오늘과 어긋나는 견본 날짜
   5. 요일이 달력과 맞는가 — 2026-08-19 에 49건 나왔다 (2025년 달력으로 적고 날짜는 2026년)
   6. 프리셋 이름이 실제 색과 맞는가 — 매칭 프리미엄이 어긋나 있었다
   7. 같은 업종의 두 등급이 같은 레이아웃인가 — 값어치 차이가 안 보인다
   실행: node _작업/팩검사.mjs [팩이름]
*/
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

/* ⛔ 2026-08-31: 이 검사기는 «다 된 것»(_판매팩)만 보고 있었다. 그래서 만드는 중인 팩
   이름을 대면 «아무 말 없이 0건»으로 끝났다 — 통과한 것처럼 보이지만 실은 안 본 것이다.
   만드는 중에 검사하라는 것이 지시문인데 검사기가 그 자리를 안 보고 있었다.
   팩 이름을 대면 두 자리를 다 찾는다. 이름 없이 전부 돌 때는 «다 된 것»만 본다
   (매주 화요일 검수가 만들다 만 팩에 걸려 FAIL 을 쏟지 않게 — 그것이 폴더를 가른 까닭이다). */
const 뿌리들 = ["판매용_템플릿/_판매팩", "판매용_템플릿/_만드는중"];
const 고른팩 = process.argv[2];

const 팩들 = (고른팩 ? 뿌리들 : 뿌리들.slice(0, 1))
  .filter((r) => existsSync(r))
  .flatMap((r) => readdirSync(r)
    .filter((n) => {
      const p = join(r, n);
      return statSync(p).isDirectory() && existsSync(join(p, "완성화면/pages"));
    })
    .filter((n) => (고른팩 ? n === 고른팩 : true))
    .map((n) => ({ 이름: n, 뿌리: r })));

if (고른팩 && !팩들.length) {
  console.error(`팩 「${고른팩}」을 못 찾았습니다. 찾아본 자리: ${뿌리들.join(" · ")}`);
  process.exit(1);
}

const 결과 = [];

for (const { 이름: 팩, 뿌리 } of 팩들) {
  const 완성 = join(뿌리, 팩, "완성화면");
  const 쪽방 = join(완성, "pages");
  const 쪽들 = readdirSync(쪽방).filter((n) => n.endsWith(".html"));

  const 끊긴링크 = [];
  const 없는그림 = [];
  const 이어진곳 = new Set();

  for (const 쪽 of 쪽들) {
    const 길 = join(쪽방, 쪽);
    const s = readFileSync(길, "utf8");

    /* href — 같은 폴더의 .html 만 본다 (밖으로 나가는 것·#·mailto 는 넘긴다) */
    for (const m of s.matchAll(/href="([^"]+)"/g)) {
      const v = m[1];
      if (!v || v.startsWith("#") || v.startsWith("http") || v.startsWith("mailto:")) continue;
      const 실제 = resolve(dirname(길), v.split("#")[0].split("?")[0]);
      if (v.endsWith(".html")) 이어진곳.add(실제);
      if (!existsSync(실제)) 끊긴링크.push(`${쪽} → ${v}`);
    }

    /* src — 그림·스크립트 */
    for (const m of s.matchAll(/src="([^"]+)"/g)) {
      const v = m[1];
      if (!v || v.startsWith("http") || v.startsWith("data:")) continue;
      const 실제 = resolve(dirname(길), v.split("?")[0]);
      if (!existsSync(실제)) 없는그림.push(`${쪽} → ${v}`);
    }
  }

  /* 화면 목록(index.html)에서 이어지는 곳도 더한다 */
  const 목록길 = join(완성, "index.html");
  if (existsSync(목록길)) {
    const s = readFileSync(목록길, "utf8");
    for (const m of s.matchAll(/href="([^"]+\.html)"/g)) {
      이어진곳.add(resolve(완성, m[1].split("#")[0]));
    }
  }

  /* 외톨이 — 아무 데서도 안 이어지는 쪽 */
  const 외톨이 = 쪽들.filter((n) => !이어진곳.has(resolve(쪽방, n)));

  /* 굳은 날짜 — 오늘보다 앞선 것만 센다(지난 날짜가 문제다) */
  const 오늘 = new Date();
  오늘.setHours(0, 0, 0, 0);
  const 날짜모음 = new Map();
  for (const 쪽 of 쪽들) {
    const s = readFileSync(join(쪽방, 쪽), "utf8");
    for (const m of s.matchAll(/(20\d\d)-(\d\d)-(\d\d)/g)) {
      const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      날짜모음.set(m[0], (날짜모음.get(m[0]) || 0) + 1);
    }
  }
  const 가장늦은 = [...날짜모음.keys()].sort().pop() || null;

  /* 요일이 달력과 맞는가 — 눈으로는 못 잡는다.
     2026-08-19: 2025년 달력으로 요일을 적고 날짜만 2026년으로 쓴 자리가 49건 있었다. */
  const 요일이름 = ["일", "월", "화", "수", "목", "금", "토"];
  const 요일탈 = [];
  /* 기준 해 — 올해로 본다.
     견본은 「지금」을 가정하고 만든 것이라, 해가 안 적힌 「8월 3일 (월)」은 올해 달력을 따라야 한다.
     ⚠ 「가장 늦은 날짜」로 잡으면 안 된다 — 입력칸의 생년월일(2016년 같은 것)이 섞여 엉뚱해진다. */
  const 그해 = new Date().getFullYear();
  for (const 쪽 of 쪽들) {
    const s = readFileSync(join(쪽방, 쪽), "utf8").replace(/<input[^>]*>/g, "");
    const 재기 = (y, m, d, 적힘, 통째) => {
      const 참 = 요일이름[new Date(y, m - 1, d).getDay()];
      if (참 !== 적힘) 요일탈.push(`${쪽} : ${통째} → ${참}요일`);
    };
    for (const m of s.matchAll(/(\d{1,2})월\s*(\d{1,2})일\s*\((월|화|수|목|금|토|일)\)/g))
      재기(그해, Number(m[1]), Number(m[2]), m[3], m[0]);
    for (const m of s.matchAll(/(\d{1,2})\/(\d{1,2})\s*\((월|화|수|목|금|토|일)\)/g))
      재기(그해, Number(m[1]), Number(m[2]), m[3], m[0]);
    for (const m of s.matchAll(/(20\d\d)-(\d\d)-(\d\d)\s*\((월|화|수|목|금|토|일)\)/g))
      재기(Number(m[1]), Number(m[2]), Number(m[3]), m[4], m[0]);
  }

  /* 프리셋 이름이 실제 색과 맞는가 — 매칭 프리미엄이 어긋나 있었다 */
  /* 2026-08-24 고침 — 코럴 선셋·레트로 페이퍼 값이 lib/design-presets.ts 와 어긋나 있었다.
     팔리는 팩(LMS_디럭스·LMS_프리미엄·장비렌탈_프리미엄 등, 색을 지은 지 오래된 것들)이
     실제로는 문제없는데 이 표가 옛 값을 들고 있어서 조용히 FAIL 을 냈다 — 재 보고서야 드러났다.
     지금 값은 lib/design-presets.ts 의 DESIGN_OPTIONS 에서 그대로 옮긴 것이다. */
  const 이름색 = {
    "모던 네이비": "#2b4a8b", "미니멀 모노": "#111111", "코럴 선셋": "#e02a0e",
    "일렉트릭 바이올렛": "#5b4fe5", "내추럴 그린": "#15803d", "레트로 페이퍼": "#bc5918",
  };
  let 프리셋탈 = null, 프리셋 = "", 레이아웃 = "";
  const css길 = join(완성, "assets/css/base.css");
  if (existsSync(목록길) && existsSync(css길)) {
    const idx = readFileSync(목록길, "utf8");
    프리셋 = ((idx.match(/디자인 프리셋 — ([^<]+)</) || [])[1] || "").trim();
    레이아웃 = (프리셋.match(/레이아웃 [AB]\s*(.+)$/) || [])[1] || "";
    const 색 = ((readFileSync(css길, "utf8").match(/--primary:\s*(#[0-9a-fA-F]+)/) || [])[1] || "").toLowerCase();
    const 이름 = Object.keys(이름색).find((k) => 프리셋.includes(k));
    if (이름 && 색 && 이름색[이름] !== 색) 프리셋탈 = `이름은 「${이름}」인데 실제 --primary 는 ${색}`;
  }

  결과.push({
    팩, 쪽수: 쪽들.length, 끊긴링크, 없는그림, 외톨이,
    날짜종류: 날짜모음.size, 가장늦은날짜: 가장늦은,
    요일탈, 프리셋탈, 프리셋, 레이아웃,
  });
}

for (const r of 결과) {
  const 탈 = r.끊긴링크.length + r.없는그림.length;
  console.log(`\n━━ ${r.팩}  (${r.쪽수}쪽)`);
  if (r.끊긴링크.length) {
    console.log(`  ⛔ 끊어진 링크 ${r.끊긴링크.length}건`);
    r.끊긴링크.slice(0, 8).forEach((x) => console.log(`      ${x}`));
    if (r.끊긴링크.length > 8) console.log(`      … 그 밖 ${r.끊긴링크.length - 8}건`);
  }
  if (r.없는그림.length) {
    console.log(`  ⛔ 없는 그림·파일 ${r.없는그림.length}건`);
    [...new Set(r.없는그림)].slice(0, 6).forEach((x) => console.log(`      ${x}`));
  }
  if (r.외톨이.length) {
    console.log(`  ⚠ 아무 데서도 안 이어지는 쪽 ${r.외톨이.length}개: ${r.외톨이.slice(0, 10).join(", ")}`);
  }
  if (r.요일탈.length) {
    console.log(`  ⛔ 요일이 달력과 안 맞음 ${r.요일탈.length}건`);
    [...new Set(r.요일탈)].slice(0, 6).forEach((x) => console.log(`      ${x}`));
    if (r.요일탈.length > 6) console.log(`      … 그 밖 ${r.요일탈.length - 6}건`);
  }
  if (r.프리셋탈) console.log(`  ⛔ 프리셋 이름이 실제 색과 다름 — ${r.프리셋탈}`);
  if (r.가장늦은날짜) {
    console.log(`  · 날짜 ${r.날짜종류}가지, 가장 늦은 것 ${r.가장늦은날짜}`);
  }
  if (!탈 && !r.외톨이.length && !r.요일탈.length && !r.프리셋탈) console.log("  ✓ 걸리는 곳 없음");
}

/* ── 같은 업종의 두 등급이 같은 레이아웃인가 ──
   2026-08-19: 매칭과 여행이 두 등급 다 같은 레이아웃이라 홈이 판박이였다.
   쪽수는 서너 배 차이인데 화면만 보면 값어치 차이가 안 보였다. */
const 업종별 = new Map();
for (const r of 결과) {
  const [업, 등] = r.팩.split("_");
  if (!등) continue;
  if (!업종별.has(업)) 업종별.set(업, []);
  업종별.get(업).push({ 등, 레이아웃: r.레이아웃, 프리셋: r.프리셋 });
}
const 겹친것 = [];
for (const [업, 것들] of 업종별) {
  if (것들.length < 2) continue;
  const 레이 = [...new Set(것들.map((x) => x.레이아웃).filter(Boolean))];
  if (레이.length === 1) 겹친것.push(`${업} — 두 등급 다 「${레이[0]}」`);
}
if (겹친것.length) {
  console.log("\n━━ 같은 업종에서 두 등급의 레이아웃이 같다");
  겹친것.forEach((x) => console.log(`  ⚠ ${x}`));
  console.log("  → 쪽수는 달라도 화면만 보면 값어치 차이가 안 보입니다.");
} else if (업종별.size) {
  console.log("\n✓ 업종마다 두 등급의 레이아웃이 갈려 있습니다");
}
