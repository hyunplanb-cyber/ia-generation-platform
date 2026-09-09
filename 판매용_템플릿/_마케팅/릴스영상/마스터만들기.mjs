// 촬영본 하나 → «2분할 마스터» 하나.   (2026-09-09)
//
//   node 마스터만들기.mjs "2. 완성화면_뷰티샵_프리미엄"
//   node 마스터만들기.mjs "2. 완성화면_뷰티샵_프리미엄" --초 48 --컷 2.0 --배속 1.5
//   node 마스터만들기.mjs "2. 완성화면_뷰티샵_프리미엄" --재기만      ← 갈래만 찍고 안 굽는다
//
// 왜 있나 (2026-09-09 현님)
//   「우리 이분할 영상이 처음에는 클로드가 가운데 나오다가 좌측으로 밀려가잖아.
//     클로드 화면이 가운데 있을땐 영상에서 빈화면으로 나와서 이 부분은 어떻게 잡아?」
//
//   촬영본은 «클로드 풀 → 이분할 → 완성화면 풀» 세 토막으로 찍힌다. 그런데 우리 틀은
//   «이분할»만 제대로 다룬다. 재 보니 이분할인 시간은 4분의 1~3분의 1뿐이고,
//   나머지 3분의 2에서는 두 칸 중 하나가 빈다.
//
//     뷰티샵 109초 → 클로드풀 14% · 이분할 28% · 완성화면풀 59%
//     매칭    45초 → 클로드풀 42% · 이분할 27% · 완성화면풀 31%
//     펫유치원 62초 → 클로드풀 10% · 이분할  0% · 완성화면풀 90%   ← 이분할이 아예 없다
//
//   그래서 «녹화본을 그대로 쓰지 않는다». 클로드 트랙과 완성화면 트랙을 따로 뽑아
//   우리가 나란히 붙인 마스터를 만든다. 그러면 촬영본이 어떤 짜임이든 두 칸이 다 찬다.
//
// ⭐ 순서를 믿지 않는다
//   여섯 편 중 넷은 정확히 C→S→B 지만, 인테리어는 중간에 한 번 오가고 여행은 1초 튄다.
//   펫유치원은 아예 거꾸로다(B 먼저). 그래서 «1초마다 재서» 갈래를 정한다.
//   현님이 촬영 순서를 지키실 의무가 없어진다.
//
// 나오는 것:  <회차>/마스터.mp4   왼쪽 클로드 · 오른쪽 완성화면
//   → 이어서  node 자막굽기.mjs "<회차>"  →  node 영상만들기.mjs "<회차>" --분할선 <왼쪽폭>
//
// ⛔ 이 도구는 «소리»를 담지 않는다. 음악은 영상만들기.mjs 가 얹는다.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { 규격 } from "./_규격.mjs";

const 여기 = path.dirname(fileURLToPath(import.meta.url));
const 촬영방 = path.join(여기, "_촬영영상");
const g = 규격["9_16"];

/* 왼쪽 칸 폭. 영상만들기.mjs 는 왼쪽 칸의 «아래쪽»만 잘라 클로드 칸에 넣는다.
   잘리는 높이 = 왼폭 × (클로드칸높이 / 클로드칸폭) 이므로, 그 띠에 «살아 있는 글»이 오게 만든다. */
const 왼폭 = 1080;
const 띠높이 = 짝수(Math.round((왼폭 * g.PiP.h) / g.PiP.w));   // 1080 × 904/2002 = 488
const 크롬 = 220;                                               // 브라우저 탭줄·주소창. 영상만들기.mjs 도 이만큼 자른다

function 짝수(v) { return Math.round(v / 2) * 2; }

const 인자 = process.argv.slice(2);
const 값 = (이름) => { const i = 인자.indexOf(이름); return i >= 0 ? 인자[i + 1] : null; };
const 회차 = 인자.find((a) => !a.startsWith("--") && 인자[인자.indexOf(a) - 1] !== "--초"
  && 인자[인자.indexOf(a) - 1] !== "--컷" && 인자[인자.indexOf(a) - 1] !== "--배속");
const 목표초 = Number(값("--초")) || 48;
const 컷초 = Number(값("--컷")) || 2.0;
const 배속 = Number(값("--배속")) || 1.5;
const 재기만 = 인자.includes("--재기만");

if (!회차) {
  console.error(`\n쓰는 법:  node 마스터만들기.mjs "2. 완성화면_뷰티샵_프리미엄"\n`);
  console.error(`  --초 48     만들 길이 (기본 48)`);
  console.error(`  --컷 2.0    완성화면 한 컷이 쓰는 «원본» 초 (기본 2.0)`);
  console.error(`  --배속 1.5  완성화면 배속 (기본 1.5) → 화면에서 한 컷은 ${(2.0 / 1.5).toFixed(2)}초`);
  console.error(`  --재기만    갈래만 찍고 안 굽는다\n`);
  process.exit(2);
}

const 회차방 = path.join(여기, 회차);
const 촬영본 = [`${회차}.mp4`, `${회차.replace(/^\d+\.\s*/, "")}.mp4`]
  .map((n) => path.join(촬영방, n)).find(existsSync);
if (!촬영본) {
  console.error(`\n⛔ 촬영본을 못 찾았습니다 — ${path.join(촬영방, 회차 + ".mp4")}\n`);
  process.exit(1);
}
if (!existsSync(회차방)) mkdirSync(회차방, { recursive: true });

const ff = (args) => execFileSync("ffmpeg", args, { maxBuffer: 1 << 28 });
const 재기 = (args) => execFileSync("ffprobe", args, { encoding: "utf8" }).trim();

const [W0, H0] = 재기(["-v", "error", "-select_streams", "v", "-show_entries",
  "stream=width,height", "-of", "csv=p=0:s=x", 촬영본]).split("\n")[0].split("x").map(Number);
const 길이 = Number(재기(["-v", "error", "-show_entries", "format=duration", "-of",
  "default=noprint_wrappers=1:nokey=1", 촬영본]));

/* ⭐ 완성화면 트랙 폭 — «영상만들기가 실제로 쓰는 만큼»만 자른다 (2026-09-09)
 *
 *   전에는 2076 을 잘라 넘겼는데, 영상만들기는 그것을 세로로 꽉 채우느라 배율 1.665 를 쓰고
 *   가로 2160 만 남긴다 → 2160/1.665 = 1297. 나머지 779px 을 «조용히 버리고» 있었다.
 *   버릴 것을 넘기면 「어디가 보이는지」를 내가 못 정한다. 그래서 처음부터 그 폭으로 자른다.
 *   폭 = (원본높이 − 크롬) × (영상칸 가로/세로).  뷰티샵: (2160−220) × 0.6687 = 1297 */
const 오른폭 = 짝수(Math.round((H0 - 크롬) * (g.영상.w / g.영상.h)));

console.log(`\n촬영본  ${path.basename(촬영본)}   ${W0}x${H0} · ${길이.toFixed(1)}초`);
console.log(`  완성화면 트랙 폭 ${오른폭}  (영상만들기가 실제로 쓰는 만큼 — 버려지는 화소가 없습니다)`);

/* ═══ ① 1초마다 갈래를 잰다 — C(클로드 풀) · S(이분할) · B(완성화면 풀) ═══════════
   왼쪽 어둡고 오른쪽 밝으면 이분할, 둘 다 어두우면 클로드 풀, 둘 다 밝으면 완성화면 풀.
   ⚠ 「순서가 C→S→B 다」를 믿지 않는다 — 인테리어는 중간에 오가고 펫유치원은 거꾸로다. */
const 잼W = 316, 잼H = 216;
const 잼 = ff(["-v", "error", "-i", 촬영본, "-vf", `fps=1,scale=${잼W}:${잼H}`,
  "-pix_fmt", "gray", "-f", "rawvideo", "-"]);
const 장 = Math.floor(잼.length / (잼W * 잼H));
const 밝 = (i, x0, x1) => {
  let s = 0, n = 0;
  for (let y = 30; y < 잼H - 20; y++) for (let x = x0; x < x1; x++) { s += 잼[i * 잼W * 잼H + y * 잼W + x]; n++; }
  return s / n;
};
const 갈래 = [];
for (let i = 0; i < 장; i++) {
  const L = 밝(i, 5, Math.round(잼W * 0.32)), R = 밝(i, Math.round(잼W * 0.57), 잼W - 6);
  갈래.push(L < 100 && R < 100 ? "C" : L < 100 ? "S" : "B");
}
console.log(`  갈래  ${갈래.join("")}`);
const 셈 = { C: 0, S: 0, B: 0 };
for (const k of 갈래) 셈[k]++;
console.log(`        클로드 풀 ${셈.C}초 · 이분할 ${셈.S}초 · 완성화면 풀 ${셈.B}초`);

/* 이분할 구간의 «분할선» — 어두운 왼쪽이 끝나는 자리. 잰 값들의 가운뎃값을 쓴다. */
let 분할선 = null;
const S초 = 갈래.map((k, i) => (k === "S" ? i : -1)).filter((i) => i >= 0);
if (S초.length) {
  const 후보 = [];
  for (const t of [S초[Math.floor(S초.length * 0.25)], S초[Math.floor(S초.length * 0.5)], S초[Math.floor(S초.length * 0.75)]]) {
    const buf = ff(["-v", "error", "-ss", String(t + 0.5), "-i", 촬영본, "-frames:v", "1",
      "-pix_fmt", "gray", "-f", "rawvideo", "-"]);
    const 줄 = [];
    for (let y = 300; y < H0 - 200; y += 37) 줄.push(y);
    const 평 = (x) => { let s = 0; for (const y of 줄) s += buf[y * W0 + x]; return s / 줄.length; };
    for (let x = Math.round(W0 * 0.15); x < W0 - 10; x++) if (평(x) < 110 && 평(x + 6) > 170) { 후보.push(x); break; }
  }
  if (후보.length) { 후보.sort((a, b) => a - b); 분할선 = 후보[Math.floor(후보.length / 2)]; }
}
console.log(`        분할선 ${분할선 ?? "(이분할 구간 없음)"}`);

/* ═══ ② 완성화면 재료 · 클로드 재료가 몇 초인지 ══════════════════════════════
   완성화면은 S(오른쪽 칸) + B(전체) 에서, 클로드는 C(가운데 글 기둥) + S(왼쪽 칸) 에서 온다. */
/* ⭐ 클로드 «풀» 구간의 글 기둥을 잰다 (2026-09-09 현님 지적으로 더함)
 *   전에는 이 구간을 «화면 폭 그대로» 잘라 넣었다. 그러면 3156 → 1080 이라 배율 0.34 —
 *   이분할 구간(1074 → 1080, 배율 1.006)의 «3분의 1 크기»가 되어 글이 안 읽힌다.
 *   클로드 풀 화면은 글이 가운데 기둥에만 있다(뷰티샵 x 826~2311, 폭 1486).
 *   그 기둥만 자르면 배율 0.73 — 이분할 구간과 견줄 만해진다. */
let 글기둥 = null;
{
  const C초 = 갈래.map((k, i) => (k === "C" ? i : -1)).filter((i) => i >= 0);
  if (C초.length) {
    const t = C초[Math.floor(C초.length * 0.6)];
    const buf = ff(["-v", "error", "-ss", String(t + 0.5), "-i", 촬영본, "-frames:v", "1",
      "-pix_fmt", "gray", "-f", "rawvideo", "-"]);
    const 줄 = []; for (let y = 200; y < H0 - 260; y += 5) 줄.push(y);
    const 칸 = new Int32Array(W0);
    for (const y of 줄) for (let x = 0; x < W0; x++) if (buf[y * W0 + x] > 110) 칸[x]++;
    const 문턱 = 줄.length * 0.01;
    let 왼 = W0, 오른 = 0;
    for (let x = 0; x < W0; x++) if (칸[x] > 문턱) { if (x < 왼) 왼 = x; 오른 = x; }
    if (오른 > 왼 + W0 * 0.15) 글기둥 = { x: 짝수(왼), w: 짝수(오른 - 왼 + 1) };
  }
}
if (글기둥) console.log(`        클로드 풀의 글 기둥  x ${글기둥.x} ~ ${글기둥.x + 글기둥.w - 1} (폭 ${글기둥.w})`);

/* ⭐ 사이트 «로고»가 어디 있나 (2026-09-09 현님: 「좌측으로 너무 맞추다 보니 좌측에 빈공간이 너무 많이 남네」)
 *
 *   현님 지시는 처음부터 「완성화면의 «로고 기준»으로 좌상단에 기준하여」였는데,
 *   내가 «브라우저 칸의 왼쪽 끝» 기준으로 잘랐다. 둘이 다르다 —
 *     이분할 구간   로고가 칸 왼끝에서 54px  → 거의 같다 (그래서 안 보였다)
 *     완성화면 풀   로고가 화면 왼끝에서 431px → 431px 이 통째로 «빈 여백»으로 들어왔다
 *   사이트가 제 여백을 갖고 가운데 정렬돼 있어서 그렇다.
 *
 *   → 머리띠(브라우저 크롬 아래 첫 띠)에서 «내용이 처음 나오는 자리»를 찾아 로고로 삼는다.
 *     26칸 넘게 «이어서» 바탕이 아닌 곳을 찾는다 — 창 테두리 한 줄에 속지 않으려고. */
const 로고여백 = 60;                                 // 로고 앞에 남길 숨. 견본이 그만큼이다
function 로고찾기(t, 시작x) {
  const buf = ff(["-v", "error", "-ss", String(t + 0.5), "-i", 촬영본, "-frames:v", "1",
    "-pix_fmt", "rgb24", "-f", "rawvideo", "-"]);
  const 줄 = []; for (let y = 크롬 + 25; y < 크롬 + 110; y += 3) 줄.push(y);
  const 배경 = (r, g, b) => r > 232 && g > 222 && b > 218;
  const 칸 = new Int32Array(W0);
  for (const y of 줄) for (let x = 0; x < W0; x++) {
    const i = (y * W0 + x) * 3;
    if (!배경(buf[i], buf[i + 1], buf[i + 2])) 칸[x]++;
  }
  const 문턱 = 줄.length * 0.25;
  for (let x = 시작x + 12; x < W0 - 30; x++) {
    let 이어 = 0; while (이어 < 26 && 칸[x + 이어] > 문턱) 이어++;
    if (이어 >= 26) return x;
  }
  return null;
}

const 완성초 = 갈래.map((k, i) => (k === "S" || k === "B" ? i : -1)).filter((i) => i >= 0);
const 클초 = 갈래.map((k, i) => (k === "C" || k === "S" ? i : -1)).filter((i) => i >= 0);
console.log(`  재료  완성화면 ${완성초.length}초 · 클로드 ${클초.length}초   (만들 길이 ${목표초}초)`);
for (const [무엇, 있는] of [["완성화면", 완성초.length], ["클로드", 클초.length]])
  if (있는 < 목표초) console.log(`        ⚠ ${무엇} 재료가 ${목표초 - 있는}초 모자랍니다 — 늘려서 채웁니다`);
if (!완성초.length || !클초.length) {
  console.error(`\n⛔ ${!완성초.length ? "완성화면" : "클로드"} 재료가 0초입니다. 이 촬영본으로는 못 만듭니다.\n`);
  process.exit(1);
}
if (재기만) process.exit(0);

/* ═══ ③ 완성화면 트랙 — 움직이는 자리를 골라 컷으로 잇는다 ═══════════════════
   ⛔ 배속만 올리는 것은 안 통한다(작업흐름.md 「두 번 틀린 것」). 멈춘 화면은 두 배로 빨려도
      멈춰 있다. 그래서 «움직임을 재서» 큰 창부터 집는다. */
const 잼2W = 104, 잼2H = 108;
const 브잼 = ff(["-v", "error", "-i", 촬영본, "-vf",
  `fps=4,crop=w=${오른폭}:h=${H0}:x=${Math.min(분할선 ?? 0, W0 - 오른폭)}:y=0,scale=${잼2W}:${잼2H}`,
  "-pix_fmt", "gray", "-f", "rawvideo", "-"]);
const 브장 = Math.floor(브잼.length / (잼2W * 잼2H)), 브N = 잼2W * 잼2H;
const 차 = [];
for (let i = 1; i < 브장; i++) { let s = 0; for (let k = 0; k < 브N; k++) s += Math.abs(브잼[i * 브N + k] - 브잼[(i - 1) * 브N + k]); 차.push(s / 브N); }
const 창 = Math.round(컷초 * 4);
const 후보 = [];
for (let i = 0; i + 창 <= 차.length; i++) {
  const t = i / 4;
  if (!완성초.includes(Math.floor(t)) || !완성초.includes(Math.floor(t + 컷초 - 0.01))) continue;  // 재료 구간 안에서만
  let s = 0; for (let k = 0; k < 창; k++) s += 차[i + k];
  후보.push({ t, 값: s / 창 });
}
후보.sort((a, b) => b.값 - a.값);
const 컷수 = Math.ceil((목표초 * 배속) / 컷초);
const 고른 = [];
for (const c of 후보) { if (고른.every((x) => Math.abs(x.t - c.t) >= 컷초)) 고른.push(c); if (고른.length >= 컷수) break; }
고른.sort((a, b) => a.t - b.t);
console.log(`  완성화면  컷 ${고른.length}개 × ${컷초}초 ÷ ${배속}배속 = ${(고른.length * 컷초 / 배속).toFixed(1)}초  (화면 ${(컷초 / 배속).toFixed(2)}초에 한 번 바뀝니다)`);

/* ═══ ④ 클로드 트랙 — C 는 «가운데 글 기둥», S 는 «왼쪽 칸» ═══════════════════
   ⭐ 여기가 현님이 물으신 자리다. 클로드가 가운데 있을 때(C)는 왼쪽 칸이 «없다».
      그때는 화면 가운데에서 클로드 칸 비율(2.213)만큼 잘라 쓴다.
      이러면 예전에 «빈 화면»으로 버려지던 구간이 그대로 재료가 된다. */
const 클비 = 왼폭 / 띠높이;                       // 2.213
const 이어 = [];                                  // {시작, 끝, 종류}
for (let i = 0; i < 갈래.length; i++) {
  if (갈래[i] !== "C" && 갈래[i] !== "S") continue;
  const 끝 = 이어.at(-1);
  if (끝 && 끝.종류 === 갈래[i] && Math.abs(끝.끝 - i) < 1.5) 끝.끝 = i + 1;
  else 이어.push({ 시작: i, 끝: i + 1, 종류: 갈래[i] });
}
const 쓸것 = 이어.filter((c) => c.끝 - c.시작 >= 1.5);
const 클합 = 쓸것.reduce((s, c) => s + (c.끝 - c.시작), 0);
const 클배속 = Math.max(0.5, Math.min(2.5, 클합 / 목표초));   // 재료가 길면 빠르게, 짧으면 늘린다
console.log(`  클로드    ${쓸것.length}토막 · ${클합}초를 ${클배속.toFixed(3)}배속으로 → ${(클합 / 클배속).toFixed(1)}초`);
for (const c of 쓸것) console.log(`            ${String(c.시작).padStart(3)}~${String(c.끝).padEnd(3)}초  ${c.종류 === "C" ? "클로드 풀 (가운데 글 기둥)" : "이분할 (왼쪽 칸)"}`);

/* ═══ ⑤ 필터를 짜서 한 번에 굽는다 ═════════════════════════════════════════ */
const F = [];
F.push(`[0:v]split=2[srcR][srcL]`);
// 완성화면
/* ⛔ 2026-09-09 현님: 「뒤에 완성 화면도 중간에 포커스가 중간으로 바뀌는데?」
 *   맞다. 자르는 자리를 «한 자리»로 굳혀 두었던 것이 흠이었다.
 *     이분할(S) 구간 — 브라우저는 분할선 «오른쪽»에 있다  → x = 분할선
 *     완성화면 풀(B) — 브라우저가 화면을 «통째로» 쓴다     → x = 0
 *   B 구간을 분할선부터 자르면 «로고와 메뉴가 통째로» 날아간다(뷰티샵에서 왼쪽 1074px).
 *   폭은 둘 다 같게 두어 배율이 안 흔들리게 한다 — 컷마다 확대율이 바뀌면 눈에 띈다. */
/* 토막마다 로고를 찾아 «거기서» 자른다. 못 찾으면 칸 왼끝으로 되돌아간다. */
const 자리표 = {};
for (const 갈 of ["S", "B"]) {
  const 초들 = 갈래.map((k, i) => (k === 갈 ? i : -1)).filter((i) => i >= 0);
  const 기본 = 갈 === "S" ? Math.min(분할선 ?? 0, W0 - 오른폭) : 0;
  if (!초들.length) { 자리표[갈] = 기본; continue; }
  const 로고 = 로고찾기(초들[Math.floor(초들.length * 0.5)], 갈 === "S" ? (분할선 ?? 0) : 0);
  자리표[갈] = 로고 === null ? 기본 : Math.max(0, Math.min(로고 - 로고여백, W0 - 오른폭));
  console.log(`            ${갈 === "S" ? "이분할     " : "완성화면 풀"}  로고 x=${로고 ?? "못 찾음"} → 자를 자리 ${자리표[갈]}${로고 === null ? " (칸 왼끝으로 되돌아감)" : ""}`);
}
/* ⭐ 컷마다 «그 화면에서 내용이 몰린 곳»으로 자리를 옮긴다 (2026-09-09 현님: 「가로 해서 잘되면 딱 좋지」)
 *
 *   토막에 한 자리씩만 두면, 내용이 오른쪽에 있는 화면에서 왼쪽 빈 곳만 보인다.
 *   그래서 컷마다 한 장씩 재서 «글·상자가 몰린 무게중심»을 찾아 창을 거기 맞춘다.
 *   ⛔ 다만 로고 자리보다 왼쪽으로는 안 간다 — 그쪽은 사이트 제 여백이라 늘 비어 있다.
 *      현님 지시(「로고 기준 좌상단」)를 지키면서 오른쪽으로만 따라가는 셈이다. */
const 잼3W = 316, 잼3H = 216;
const 자잼 = ff(["-v", "error", "-i", 촬영본, "-vf", `fps=2,scale=${잼3W}:${잼3H}`,
  "-pix_fmt", "gray", "-f", "rawvideo", "-"]);
const 자장 = Math.floor(자잼.length / (잼3W * 잼3H));
/* ⛔ «무게중심»으로 잡으면 안 된다 — 한 번 그렇게 짰다가 되돌렸다.
 *   사이트는 가운데 정렬이라 무게중심이 늘 화면 한가운데(뷰티샵 1578)로 나온다.
 *   그러면 창이 866~1550 에 놓여 결국 «가운데 크롭»이 된다 —
 *   현님이 「포커스가 중간으로 바뀐다」고 지적하신 바로 그 자리로 되돌아간다.
 *
 *   → «내용의 왼쪽 끝»을 잡는다. 글도 표도 왼쪽에서 오른쪽으로 읽으니
 *     왼끝을 맞추면 제목·차림표가 살고, 오른쪽이 잘려도 읽는 데 지장이 적다.
 *     내용이 오른쪽에만 있는 화면에서는 왼끝이 저절로 오른쪽으로 간다 — 그게 이 규칙의 값이다. */
function 내용왼끝(t, 왼끝) {
  const i = Math.min(자장 - 1, Math.max(0, Math.round(t * 2)));
  const x0 = Math.round((왼끝 / W0) * 잼3W);
  const y0 = Math.round((크롬 / H0) * 잼3H);
  const 칸 = new Int32Array(잼3W);
  let 모두 = 0;
  for (let y = y0 + 2; y < 잼3H - 4; y++) for (let x = x0; x < 잼3W; x++) {
    if (자잼[i * 잼3W * 잼3H + y * 잼3W + x] < 225) { 칸[x]++; 모두++; }
  }
  if (모두 < 40) return null;
  const 문턱 = (잼3H - y0) * 0.04;                 // 그 칸 높이의 4% 이상이 내용이어야 «있다»고 본다
  for (let x = x0; x < 잼3W - 3; x++) {
    if (칸[x] > 문턱 && 칸[x + 1] > 문턱 && 칸[x + 2] > 문턱) return (x / 잼3W) * W0;
  }
  return null;
}
F.push(`[srcR]split=${고른.length}${고른.map((_, i) => `[r${i}]`).join("")}`);
const 자리들 = [];
고른.forEach((c, i) => {
  const 왼끝 = 자리표[갈래[Math.floor(c.t)]] ?? 0;
  const 내왼 = 내용왼끝(c.t + 컷초 / 2, 왼끝);
  const 자리 = 내왼 === null ? 왼끝
    : Math.max(왼끝, Math.min(Math.round(내왼 - 로고여백), W0 - 오른폭));
  자리들.push(자리);
  F.push(`[r${i}]trim=${c.t.toFixed(3)}:${(c.t + 컷초).toFixed(3)},setpts=(PTS-STARTPTS)/${배속},crop=${오른폭}:${H0}:${짝수(자리)}:0,format=yuv420p,setsar=1[rr${i}]`);
});
{
  const 옮긴 = 자리들.filter((v, i) => v !== (자리표[갈래[Math.floor(고른[i].t)]] ?? 0)).length;
  console.log(`            컷 ${고른.length}개 중 ${옮긴}개를 내용 쪽으로 옮겼습니다 (자리 ${Math.min(...자리들)}~${Math.max(...자리들)})`);
  /* 어디를 왜 그렇게 잘랐는지 남긴다 — 나중에 「왜 이 화면이 이렇게 나왔지」를 되짚을 자리다 */
  writeFileSync(path.join(회차방, "_자리.json"), JSON.stringify({
    촬영본: path.basename(촬영본), W0, H0, 크롬, 오른폭, 왼폭, 분할선, 자리표, 글기둥,
    컷: 고른.map((c, i) => ({ t: +c.t.toFixed(2), 갈래: 갈래[Math.floor(c.t)],
      왼끝: 자리표[갈래[Math.floor(c.t)]] ?? 0, 자리: 자리들[i] })),
  }, null, 1), "utf8");
}
F.push(`${고른.map((_, i) => `[rr${i}]`).join("")}concat=n=${고른.length}:v=1:a=0,trim=0:${목표초},setpts=PTS-STARTPTS[right]`);
// 클로드 — 토막마다 자리가 다르다
const 가운데w = 짝수(Math.min(W0, Math.round(H0 * 클비)));
F.push(`[srcL]split=${쓸것.length}${쓸것.map((_, i) => `[l${i}]`).join("")}`);
쓸것.forEach((c, i) => {
  const 앞 = `[l${i}]trim=${c.시작}:${c.끝},setpts=(PTS-STARTPTS)/${클배속.toFixed(5)}`;
  if (c.종류 === "S") {
    // 이분할 — 왼쪽 칸의 «아래쪽». 새 글이 아래에서 나온다
    const x = 짝수(분할선);
    const h = 짝수(Math.min(H0, Math.round(x / 클비)));
    F.push(`${앞},crop=${x}:${h}:0:${H0 - h},scale=${왼폭}:${띠높이}:flags=lanczos,format=yuv420p,setsar=1[ll${i}]`);
  } else {
    /* 클로드 풀 — «글 기둥»의 아래쪽. 화면 폭 그대로 자르면 배율이 0.34 로 떨어져
       이분할 구간(1.006)의 3분의 1 크기가 된다. 기둥을 재서 자르면 0.7 대까지 올라온다. */
    const w = 짝수(Math.min(W0, 글기둥 ? 글기둥.w : 가운데w));
    const x = 짝수(글기둥 ? Math.min(글기둥.x, W0 - w) : Math.round((W0 - w) / 2));
    const h = 짝수(Math.min(H0, Math.round(w / 클비)));
    F.push(`${앞},crop=${w}:${h}:${x}:${짝수(Math.max(0, H0 - h - Math.round(H0 * 0.06)))},scale=${왼폭}:${띠높이}:flags=lanczos,format=yuv420p,setsar=1[ll${i}]`);
  }
});
F.push(`${쓸것.map((_, i) => `[ll${i}]`).join("")}concat=n=${쓸것.length}:v=1:a=0[클몸]`);
// 목표 길이에 모자라면 되돌이로 늘린다 (loop 는 프레임 수로 센다)
F.push(`[클몸]loop=loop=3:size=${Math.ceil((클합 / 클배속) * 30)}:start=0,trim=0:${목표초},setpts=PTS-STARTPTS[클]`);
// 왼쪽 칸 꼴로 앉힌다 — 영상만들기.mjs 가 «아래쪽 ${띠높이}» 를 가져간다
F.push(`[클]pad=${왼폭}:${H0}:0:${H0 - 띠높이}:0x141414,setsar=1[left]`);
F.push(`[left][right]hstack=inputs=2,format=yuv420p[out]`);

const 임시 = path.join(os.tmpdir(), `cc-master-${process.pid}.txt`);
writeFileSync(임시, F.join(";\n"), "utf8");
const 낼것 = path.join(회차방, "마스터.mp4");
console.log(`\n  굽는 중… → ${path.relative(여기, 낼것)}`);
try {
  ff(["-v", "error", "-stats", "-i", 촬영본, "-filter_complex_script", 임시, "-map", "[out]",
    "-r", "30", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-an", "-y", 낼것]);
} finally { rmSync(임시, { force: true }); }

const 잰길이 = Number(재기(["-v", "error", "-show_entries", "format=duration", "-of",
  "default=noprint_wrappers=1:nokey=1", 낼것]));
console.log(`\n✔ 마스터 ${왼폭 + 오른폭}x${H0} · ${잰길이.toFixed(1)}초`);
console.log(`\n다음:  node 자막굽기.mjs "${회차}" --칸초 2.0`);
console.log(`       node 영상만들기.mjs "${회차}" --분할선 ${왼폭}\n`);
console.log(`⚠ --분할선 ${왼폭} 을 «반드시» 주세요. 안 주면 영상만들기가 스스로 갈래를 다시 재는데,`);
console.log(`   이 마스터는 처음부터 끝까지 이분할이라 그 판정이 오히려 틀립니다.\n`);
