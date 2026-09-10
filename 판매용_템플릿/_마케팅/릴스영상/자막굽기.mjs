// 자막 대본 → .ass 두 벌 (세로·가로).   (2026-09-04)
//
//   node 자막굽기.mjs "5. 프로젝트 생성영상"
//   node 자막굽기.mjs "5. 프로젝트 생성영상" --칸초 2.2
//
// 읽는 것 — 회차 폴더에서 먼저 찾히는 것 하나
//   자막.srt   시각이 적힌 것 (컷 편집 뒤에 만든 것). 그 시각을 그대로 쓴다
//   자막.txt   한 줄에 한 칸. 위에서부터 «칸초»(기본 2.5초)씩 차례로 놓는다
//
// 나오는 것
//   자막_9_16.ass    2160 x 3840 용
//   자막_16_9.ass    3840 x 2160 용
//
// ⚠ 같은 폴더에 «제목_9_16.ass · 제목_16_9.ass» 도 있다 (틀그리기.mjs 가 만든다).
//   이름이 안 부딪힌다 — 자막_* 는 여기가, 제목_* 는 틀그리기.mjs 가 쓴다. 서로 안 건드린다.
//
// ⚠ 마스코트 자리는 «판마다 다르다» — 세로판은 위 띠, 가로판은 오른쪽 세로 칸이다.
//   세로판(9:16)  띠 y 0~539. 자막은 y 1709~1847 이니 세로로 멀찍이 떨어져 있다
//   가로판(16:9)  마스코트 창이 x 2816~3839 «옆»이다. 자막이 세로로 아무리 낮아도
//                 가로로 뻗으면 침범한다. 그래서 가로판은 화면 가운데(1920)가 아니라
//                 «영상 칸 가운데 x=1408» 에 놓는다 (marginR = marginL + 1024).
//   ⛔ 「자막은 띠와 안 겹친다」는 세로판만 따진 말이었다. 굽고 나서 «재서» 확인한다(아래 잉크재기).
//
// 쓰는 법 — 대본 안에서
//   두 줄로 끊고 싶으면        첫 줄|둘째 줄
//   한 낱말을 강조하고 싶으면   화면 *136개* 가 나왔습니다
//
// ⛔ 한 줄은 한글 13자 (공백 섞이면 16자). 넘으면 | 로 직접 끊는다.
//    안 끊어도 저절로 나뉘지만 나뉘는 자리가 예쁘지 않다.
//
// 움직임 — `\kf` 한 글자씩 채움(카라오케). 가이드의 타자기와 같은 인상이다.
//    채우는 데 자막 길이의 30% (0.40~0.90초). 다 채운 뒤엔 1px 도 안 움직인다.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { q as qq, 폰트방, 못쓰는경로면멈춘다 } from "./_제목.mjs";   // ⛔ _제목.mjs 는 최상위에서 아무것도 안 돌린다
import { 규격 } from "./_규격.mjs";
import { 회차방길 } from "./_회차방.mjs";                                  // ⛔ 좌표는 여기서만 나온다 (신4①)

const 여기 = path.dirname(fileURLToPath(import.meta.url));

const 회차 = process.argv[2];
if (!회차) { console.error('쓰는 법: node 자막굽기.mjs "5. 프로젝트 생성영상"'); process.exit(1); }
const argOf = (f) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : null; };
const 칸초 = Number(argOf("--칸초")) || 2.5;

// cwd 가 어디든 회차 폴더를 찾는다 — 규칙은 `_회차방.mjs` 한 곳에 있다
const DIR = 회차방길(여기, 회차);

/* ── ⛔ ' 가 든 경로는 여기서도 멈춘다 (2026-09-04 밤 · E4-b) ─────────────────
 *  ⚠ 예전엔 자막굽기가 «태연히 성공»했다 — 잴 용 .ass 를 os.tmpdir() 에 쓰는 덕이었다.
 *    그래서 「✔ 자막_9_16.ass 2칸」에 「다음: node 영상만들기.mjs」 안내까지 하고 끝났는데,
 *    그 다음 걸음이 필터 파서 오류로 죽었다. 여기서 멈춰야 헛걸음을 안 하신다.
 *    (글꼴 폴더 쪽에 ' 가 끼면 「자막 잉크를 못 쟀습니다」로 엉뚱하게 죽기도 했다.)
 * ──────────────────────────────────────────────────────────────────────── */
못쓰는경로면멈춘다({ "회차 폴더": DIR, "글꼴 폴더": 폰트방, "임시 폴더": tmpdir() });

/* ── 판마다 다른 값. 새틀_명세.md 의 「자막 규격」과 같아야 한다 ───────────────
 *
 *  Alignment 2 (아래 가운데) 일 때 글 상자는 [marginL, W − marginR] 이고
 *  가운데는 (marginL + W − marginR) / 2 다.
 *
 *   9_16   (180 + 2160 − 180) / 2 = 1080 = 화면 가운데. 세로판은 마스코트가 «위»에 있어
 *          가로로 침범할 상대가 없다. 화면 가운데가 맞다
 *   16_9   ⛔ 400/400 이면 (400 + 3840 − 400)/2 = «1920» — 화면 가운데다.
 *          영상 칸은 x 0~2815 뿐이라 자막이 512px 오른쪽으로 밀리고, 긴 줄은
 *          마스코트 창(x ≥ 2816)까지 넘어간다. 실측 중심 1918.5,
 *          29칸짜리 한 줄은 잉크가 x 621..3219 로 마스코트 창을 404px 침범했다.
 *          → marginR = marginL + 1024 = 1424. 그러면 (400 + 3840 − 1424)/2 = «1408» 이고
 *            글 상자가 x 400~2416, 즉 «영상 칸 안에서 좌우 400px 씩» 이 된다.
 *          ⚠ 상자 폭이 3040 → 2016 으로 좁아진다. 한 줄 16칸(약 1720px)은 그대로 들어간다.
 *
 *  ⛔ 2026-09-04 밤 (신4①) — W·H·한계·marginR 을 «손으로 안 적는다».
 *     예전엔 이 파일이 _규격.mjs 를 한 번도 import 하지 않고 2160/3840 · 2816 · 1424 를
 *     제 손으로 적어 두었다. _규격.mjs 의 16_9 띠를 넓히면 틀그리기·영상만들기는 따라오는데
 *     자막굽기만 옛 자리에 놓고 옛 한계로 재서, 자막이 마스코트 창을 침범해도 통과했다.
 */
const 세 = 규격["9_16"], 가 = 규격["16_9"];
const 가로여백L = 400;                       // 영상 칸 안에서 좌우로 둘 여백

/* ⛔ 세로판 marginV 를 «손으로 안 적는다» (2026-09-04 밤 · 실물에서 밟음)
 *   1970 이면 글 상자 아래끝이 3840−1970 = 1870 — «코드창 PiP 위끝과 똑같다».
 *   여유가 0 이라, 실제로 구워 보니 세 줄짜리 CTA 의 흰 글자 아래끝이 y1869 까지 갔다.
 *   1px 남았다. 내림꼴(g j y p Q)이 하나만 섞여도 PiP 안으로 넘어간다.
 *   → PiP 위끝에서 «PiP틈» 만큼 띄운 자리를 계산해서 쓴다. 명세가 정한 20~23px 이 그 값이다. */
/* 2026-09-09 · 20 → 210. PiP 가 y1870 에서 «y2142» 로 내려가면서 틈의 뜻이 달라졌다.
 *   20 을 그대로 두면 자막 잉크 아래끝이 2119 까지 내려간다 — 견본보다 190px 아래다.
 *   견본 실측: 자막 노란 잉크 y 1828~1929, PiP 위끝 2142 → 사이가 «213px».
 *   글 상자 아래끝은 잉크보다 3px 아래이므로 210 을 두면 잉크 아래끝이 1929 로 맞는다. */
const PiP틈 = 210;
const 세로marginV = 세.H - (세.PiP ? 세.PiP.y - PiP틈 : 세.H - 1970);

const 판 = {
  // 세로판은 marginL = marginR 이라 «화면 가운데». 마스코트가 위에 있어 옆으로 다툴 상대가 없다
  "9_16": { W: 세.W, H: 세.H, size: 180, outline: 12, spacing: 2, marginL: 180, marginR: 180, marginV: 세로marginV },
  // 가로판은 marginR = marginL + 마스코트 창 폭 → 글 상자 가운데가 «영상 칸 가운데»가 된다
  "16_9": { W: 가.W, H: 가.H, size: 144, outline: 9, spacing: 2, marginL: 가로여백L, marginR: 가로여백L + 가.띠.w, marginV: 150 },
};

/** 자막 잉크가 절대 닿으면 안 되는 오른쪽 끝. 닿으면 굽기를 «멈춘다».
 *
 *  9_16   화면 끝(2160) — 세로판은 마스코트가 위에 있어 옆으로 다툴 상대가 없다
 *  16_9   마스코트 창 왼끝(2816) — 여기 닿으면 캐릭터 위에 글자가 얹힌다
 *
 *  ⭐ 왜 «경고»가 아니라 «멈춤»인가
 *    ① 구워 봐야 보인다. 최종 mp4 가 나오는 데 몇 분이 걸리는데, 그때야 눈에 띈다
 *    ② 다시 구워도 안 고쳐진다 — 대본을 고쳐야 낫는 흠이다
 *    ③ 제목(_제목.mjs)은 이미 넘치면 exit 1 한다. 자막만 봐주면 두 잣대가 어긋난다
 *  반면 「한 줄 13자」는 «나뉘는 자리가 안 예쁘다»는 취향이라 경고로 둔다.
 *  ⛔ 여기도 숫자를 손으로 안 적는다 — 2816 은 _규격.mjs 의 «16_9 띠 왼끝»이다 (신4①). */
const 오른끝 = { "9_16": 세.W, "16_9": 가.띠.x };

const 글꼴 = "Paperlogy 8 ExtraBold";
const 찬색 = "&H00FFFFFF";        // 흰색 — 이미 지나간 글자
const 안찬색 = "&H00909CA9";      // #A99C90 따뜻한 회색 — 아직 안 온 글자
/* ⭐ 2026-09-09 현님: 「폰트 컬러는 아래로 할꺼야. 기본 : 화이트 / 포인트 걸러 : 노랑」
 *   #F0C810 은 «지어낸 값이 아니다» — 현님이 주신 견본(sns 영상 가이드_이분할영상_0909.mp4)의
 *   자막 화소를 세어 나온 값이다. 잉크 y1828~1929 에서 rgb(240,200,16) 이 50,658점으로 압도적이다.
 *   ⚠ ASS 는 &HAABBGGRR 이라 «거꾸로» 적는다. #F0C810 → &H0010C8F0. */
const 강조색 = "&H0010C8F0";      // #F0C810 노랑 — 견본에서 잰 값

/* ── 대본 읽기 ──────────────────────────────────────────────────────────── */

function 시분초(t) {                                  // "00:00:02,500" → 2.5
  const m = t.trim().match(/(\d+):(\d+):(\d+)[,.](\d+)/);
  if (!m) return 0;
  return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000;
}

function 대본읽기() {
  const srt = path.join(DIR, "자막.srt");
  if (existsSync(srt)) {
    const 덩어리 = readFileSync(srt, "utf8").replace(/^﻿/, "").split(/\r?\n\r?\n+/);
    const 칸 = [];
    for (const d of 덩어리) {
      const 줄 = d.split(/\r?\n/).filter((s) => s.trim() !== "");
      const i = 줄.findIndex((s) => s.includes("-->"));
      if (i < 0) continue;
      const [a, b] = 줄[i].split("-->");
      const 글 = 줄.slice(i + 1).join("|");
      if (글.trim()) 칸.push({ 시작: 시분초(a), 끝: 시분초(b), 글 });
    }
    if (칸.length) return { 칸, 출처: "자막.srt" };
  }

  const txt = path.join(DIR, "자막.txt");
  if (existsSync(txt)) {
    const 줄 = readFileSync(txt, "utf8").replace(/^﻿/, "").split(/\r?\n/)
      .map((s) => s.trim()).filter((s) => s && !s.startsWith("#"));
    return {
      칸: 줄.map((글, i) => ({ 시작: i * 칸초, 끝: (i + 1) * 칸초, 글 })),
      출처: `자막.txt (한 칸 ${칸초}초)`,
    };
  }

  console.error(`대본이 없습니다 — ${회차} 폴더에 자막.srt 또는 자막.txt 를 넣어 주세요.`);
  console.error(`  자막.txt 는 «한 줄에 한 칸» 이면 됩니다.`);
  process.exit(1);
}

/* ── 한 칸을 카라오케 태그로 바꾼다 ────────────────────────────────────────── */

function 카라오케(글, 길이초) {
  // 채우는 시간 = 길이의 30%, 0.40~0.90초 사이로 자른다
  const 총cs = Math.min(90, Math.max(40, Math.round(길이초 * 100 * 0.30)));

  // *강조* 를 조각으로 가른다
  const 조각 = [];
  for (const p of 글.split(/(\*[^*]+\*)/)) {
    if (!p) continue;
    if (p.startsWith("*") && p.endsWith("*")) 조각.push({ t: p.slice(1, -1), 강조: true });
    else 조각.push({ t: p, 강조: false });
  }

  // 줄바꿈(|)은 글자로 세지 않는다
  const 글자수 = 조각.reduce((n, s) => n + [...s.t].filter((c) => c !== "|").length, 0) || 1;
  const 몫 = Math.floor(총cs / 글자수);
  let 나머지 = 총cs - 몫 * 글자수;

  let out = "";
  for (const s of 조각) {
    if (s.강조) out += `{\\c${강조색}}`;
    for (const c of s.t) {
      if (c === "|") { out += "\\N"; continue; }
      const cs = 몫 + (나머지-- > 0 ? 1 : 0);
      out += `{\\kf${cs}}${c}`;
    }
    if (s.강조) out += `{\\c${찬색}}`;
  }
  return out;
}

const cs = (t) => {
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  return `${h}:${String(m).padStart(2, "0")}:${s.toFixed(2).padStart(5, "0")}`;
};

/* ── .ass 글월 만들기 (아직 안 쓴다) ────────────────────────────────────────
 *
 *  ⛔ 예전에는 여기서 곧장 writeFileSync 했다. 그러면 «검사에서 막혔을 때»
 *     한 판만 새 글로 바뀌어 두 판의 자막이 달라진다. 그래서 만들고 → 재고 →
 *     둘 다 통과할 때만 쓴다.
 */
function 머리글(g) {
  return [
    "[Script Info]", "ScriptType: v4.00+",
    `PlayResX: ${g.W}`, `PlayResY: ${g.H}`,
    "WrapStyle: 0", "ScaledBorderAndShadow: yes", "YCbCr Matrix: TV.709", "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    `Style: 자막,${글꼴},${g.size},${찬색},${안찬색},&H00000000,&H00000000,0,0,0,0,100,100,${g.spacing},0,1,${g.outline},0,2,${g.marginL},${g.marginR},${g.marginV},1`, "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
  ];
}

function 만들기(g, 칸) {
  const 줄 = 칸.map((k) =>
    `Dialogue: 0,${cs(k.시작)},${cs(k.끝)},자막,,0,0,0,,{\\fad(120,80)}${카라오케(k.글, k.끝 - k.시작)}`);
  return 머리글(g).concat(줄).join("\n") + "\n";
}

/* ── 잉크 재기 — 짐작하지 않고 «구워서» 잰다 ─────────────────────────────────
 *
 *  왜 재나 — 가로판 자막이 마스코트 창(x ≥ 2816)을 침범해도 코드는 태연하다.
 *  글자 폭은 글꼴·글자·자간이 다 얽혀 있어 «세어서» 못 맞힌다. 구워서 재야 안다.
 *
 *  어떻게 — 칸마다 1초씩 차례로 놓은 «잴 용» .ass 를 임시로 만들어
 *  검은 판에 굽는다. \kf(카라오케)·\fad 는 글자 자리를 안 바꾸므로 뺀다
 *  (\fad 를 두면 t=0 에서 알파가 0 이라 잉크가 아예 안 잡힌다).
 *  한 판(3840×2160 gray)이 8.3MB 이므로 일곱 칸씩 끊어 굽는다.
 */
function 잴용글월(g, 조각들) {
  const 줄 = 조각들.map((글, i) =>
    `Dialogue: 0,${cs(i)},${cs(i + 1)},자막,,0,0,0,,${글.replace(/\*/g, "").split("|").join("\\N")}`);
  return 머리글(g).concat(줄).join("\n") + "\n";
}

function 한덩이재기(g, 조각들, 임시방) {
  const f = path.join(임시방, "잴것.ass");
  writeFileSync(f, 잴용글월(g, 조각들), "utf8");
  const r = spawnSync("ffmpeg", [
    "-v", "error",
    "-f", "lavfi", "-i", `color=c=black:s=${g.W}x${g.H}:r=1:d=${조각들.length}`,
    "-vf", `ass=f=${qq(f)}:fontsdir=${qq(폰트방)}`,
    "-frames:v", String(조각들.length), "-f", "rawvideo", "-pix_fmt", "gray", "-",
  ], { maxBuffer: 1 << 30 });
  if (r.status !== 0) {
    console.error(String(r.stderr).slice(-1500));
    throw new Error("자막 잉크를 못 쟀습니다 — ffmpeg 가 멈췄습니다");
  }
  const 한판 = g.W * g.H;
  if (!r.stdout || r.stdout.length < 한판 * 조각들.length)
    throw new Error(`자막 잉크 판이 짧습니다 (${r.stdout?.length})`);

  const 답 = [];
  for (let n = 0; n < 조각들.length; n++) {
    const off = n * 한판;
    let x0 = g.W, y0 = g.H, x1 = -1, y1 = -1;
    for (let y = 0; y < g.H; y++) {
      const row = off + y * g.W;
      let 있나 = false, a = g.W, b = -1;
      for (let x = 0; x < g.W; x++) if (r.stdout[row + x] >= 60) { if (!있나) { 있나 = true; a = x; } b = x; }
      if (있나) { if (y < y0) y0 = y; y1 = y; if (a < x0) x0 = a; if (b > x1) x1 = b; }
    }
    답.push(x1 < 0 ? null : { x0, y0, x1, y1 });
  }
  return 답;
}

function 잉크들재기(g, 칸) {
  const 임시방 = mkdtempSync(path.join(tmpdir(), "자막잉크-"));
  try {
    const 답 = [];
    const 한번에 = Math.max(1, Math.floor((64 << 20) / (g.W * g.H)));   // 판당 64MB 밑으로
    for (let i = 0; i < 칸.length; i += 한번에)
      답.push(...한덩이재기(g, 칸.slice(i, i + 한번에).map((k) => k.글), 임시방));
    return 답;
  } finally { rmSync(임시방, { recursive: true, force: true }); }
}

const { 칸, 출처 } = 대본읽기();
console.log(`\n자막 굽기 → ${회차}`);
console.log(`  대본: ${출처}\n`);

/* ── ⛔ 칸이 하나도 없으면 «쓰지 않고» 멈춘다 (2026-09-04 밤 · 신6) ────────────
 *  자막.txt 가 비었거나 # 주석뿐이면 칸이 0개인데, 예전엔 그래도 .ass 두 장을
 *  「✔ 0칸」으로 써 버렸다. 그 뒤 영상만들기는 «파일이 있다»는 것만 보고
 *  「자막  자막_9_16.ass  (최종 크기에서 곧장 굽습니다)」라고 알렸다 —
 *  B6 이 막으려던 «자막 없는 최종본이 조용히 나가는» 일이 «있다고 말하면서» 다시 일어났다.
 * ──────────────────────────────────────────────────────────────────────── */
if (칸.length === 0) {
  console.error(`⛔ 대본에 칸이 하나도 없습니다 — ${출처} 가 비었거나 # 주석뿐입니다.`);
  console.error(`   자막 .ass 를 «한 장도» 쓰지 않았습니다 (0칸짜리를 써 두면 영상만들기가`);
  console.error(`   「자막 있음」이라고 알리면서 자막 없는 최종본을 굽습니다).`);
  console.error(`   → ${path.basename(DIR)}/자막.txt 에 «한 줄에 한 칸»씩 적어 주세요.\n`);
  process.exit(1);
}

/* ⭐ 2026-09-09 현님: 「자막 1~2줄」 — 한 칸이 화면에서 몇 줄이 되는지 «세어서» 알린다.
 *   손으로 나눈 | 하나가 화면에서 두 줄로 접히면 한 칸이 3줄이 된다. 그걸 잡는다.
 *   ⚠ 멈추지는 않는다 — 마무리 CTA 는 원래 3줄로 정해져 있다. 어느 칸인지만 알려 준다. */
{
  const 넘는칸 = [];
  for (const k of 칸) {
    const 줄수 = k.글.split("|").reduce((합, 줄) => {
      const 순 = 줄.replace(/\*/g, "");
      return 합 + Math.max(1, Math.ceil([...순].length / 17));   // 17칸이 한 줄에 들어가는 한계
    }, 0);
    if (줄수 > 2) 넘는칸.push({ t: cs(k.시작), 줄수, 글: k.글.split("|")[0].slice(0, 14) });
  }
  if (넘는칸.length) {
    console.log(`  ⚠ 세 줄이 되는 칸 ${넘는칸.length}개 — 현님 지시는 «1~2줄»입니다`);
    for (const n of 넘는칸.slice(0, 6)) console.log(`      ${n.t}  ${n.줄수}줄  「${n.글}…」`);
    if (넘는칸.length > 6) console.log(`      … 그 밖에 ${넘는칸.length - 6}개`);
  } else console.log(`  ✅ 모든 칸이 1~2줄입니다`);
}

// 너무 긴 줄은 미리 알린다 — 자동으로 나뉘긴 하지만 나뉘는 자리가 예쁘지 않다
for (const k of 칸) {
  for (const 줄 of k.글.split("|")) {
    const 순글 = 줄.replace(/\*/g, "");
    const 한글 = [...순글].filter((c) => /[가-힣]/.test(c)).length;
    if (한글 > 13 || [...순글].length > 16) {
      console.log(`  ⚠ ${cs(k.시작)}  한 줄이 깁니다 (한글 ${한글}자 · 모두 ${[...순글].length}칸) — | 로 끊는 편이 좋아요`);
      console.log(`     ${순글}`);
    }
  }
}

/* ── 대본이 마스터보다 길지 않은지 ────────────────────────────────────────────
 *  자막굽기는 여태 마스터를 한 번도 안 열었다. 대본이 더 길면 뒤쪽 칸이
 *  «조용히» 사라진다 (영상만들기가 -t 길이 로 자르니까).                     */
const 마스터 = path.join(DIR, "마스터.mp4");
const 대본끝 = 칸.length ? Math.max(...칸.map((k) => k.끝)) : 0;
if (existsSync(마스터)) {
  const p = spawnSync("ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", 마스터],
    { encoding: "utf8" });
  const 영상길이 = Number(String(p.stdout).trim()) || 0;
  if (영상길이 > 0) {
    console.log(`  마스터: ${영상길이.toFixed(1)}초   대본 끝: ${대본끝.toFixed(1)}초`);
    if (대본끝 > 영상길이 + 0.05) {
      const 사라짐 = 칸.filter((k) => k.시작 >= 영상길이);
      console.log(`\n  ⚠ 대본이 마스터보다 ${(대본끝 - 영상길이).toFixed(1)}초 깁니다.`);
      if (사라짐.length) {
        console.log(`     ${사라짐.length}칸이 통째로 안 보입니다 (영상만들기가 -t ${영상길이.toFixed(1)} 로 자릅니다):`);
        for (const k of 사라짐.slice(0, 6)) console.log(`       ${cs(k.시작)}  ${k.글.replace(/\|/g, " / ")}`);
        if (사라짐.length > 6) console.log(`       … 그리고 ${사라짐.length - 6}칸 더`);
      } else {
        console.log(`     마지막 칸이 끝까지 안 보이고 잘립니다.`);
      }
      console.log(`     → 칸을 줄이시거나  --칸초 ${(영상길이 / Math.max(1, 칸.length)).toFixed(2)}  로 다시 구우세요.`);
      console.log(`       (자막.srt 로 시각을 직접 적으셨다면 srt 를 고치세요.)\n`);
    }
  }
} else {
  console.log(`  (마스터.mp4 가 아직 없어 대본 길이는 못 맞춰 봤습니다)`);
}

/* ── 굽고 «재고» — 둘 다 통과할 때만 쓴다 ─────────────────────────────────── */
console.log("");
const 결과 = {};
let 막힘 = false;

for (const [이름, g] of Object.entries(판)) {
  const 글월 = 만들기(g, 칸);
  const 잉크 = 잉크들재기(g, 칸);

  // 한계 = «절대 넘으면 안 되는» 자리. 넘으면 멈춘다
  // 상자끝 = 글 상자 + 테두리. 여기를 넘었다는 건 저절로 안 접혔다는 뜻 — 경고만
  const 한계 = 오른끝[이름];
  const 상자끝 = g.W - g.marginR + g.outline;

  let x0 = g.W, x1 = -1, y0 = g.H, y1 = -1;
  const 침범 = [], 흘러남 = [];
  for (let i = 0; i < 칸.length; i++) {
    const b = 잉크[i];
    if (!b) continue;
    if (b.x0 < x0) x0 = b.x0;
    if (b.x1 > x1) x1 = b.x1;
    if (b.y0 < y0) y0 = b.y0;
    if (b.y1 > y1) y1 = b.y1;
    // 화면 끝에 «닿으면» 이미 잘린 것이다 (x1 은 W−1 이 최대라 W 를 넘을 수가 없다)
    const 잘림 = b.x1 >= g.W - 1 || b.x0 <= 0;
    if (잘림 || b.x1 >= 한계) 침범.push({ k: 칸[i], b, 잘림 });
    else if (b.x1 > 상자끝) 흘러남.push({ k: 칸[i], b });
  }

  if (x1 < 0) {
    // 칸은 있는데 «구워도 잉크가 없다» — 글꼴을 못 찾았거나 대본이 빈 줄뿐이다.
    // 예전엔 경고 한 줄 뒤 그대로 써서, 자막 없는 최종본이 「자막 있음」으로 나갔다 (신6)
    막힘 = true;
    console.error(`\n⛔ ${이름.replace("_", ":")}  ${칸.length}칸을 구웠는데 «잉크가 한 점도» 없습니다.`);
    console.error(`   글꼴(${폰트방})이 제자리에 있는지, 대본에 글자가 있는지 보세요.`);
    결과[이름] = 글월;
    continue;
  }
  console.log(`  ${이름.replace("_", ":")}  잉크 x ${x0}..${x1} (가운데 ${(x0 + x1) / 2})   y ${y0}..${y1}`);
  if (이름 === "16_9")
    console.log(`         영상 칸 가운데 ${(g.marginL + g.W - g.marginR) / 2} · 마스코트 창 x ${한계} 부터 · 글 상자 x ${g.marginL}~${g.W - g.marginR}`);

  for (const { k, b } of 흘러남.slice(0, 4))
    console.log(`  ⚠ ${cs(k.시작)}  한 줄이 글 상자를 ${b.x1 - 상자끝}px 넘습니다 (저절로 안 접혔습니다) — | 로 끊으세요\n     ${k.글.replace(/\|/g, " / ")}`);

  if (침범.length) {
    막힘 = true;
    console.error(`\n⛔ ${이름.replace("_", ":")} 자막이 있으면 안 될 자리까지 갑니다 — ${침범.length}칸`);
    for (const { k, b, 잘림 } of 침범.slice(0, 6)) {
      const 까닭 = [];
      if (잘림) 까닭.push("화면 밖으로 «잘렸습니다»");
      if (b.x1 >= 한계 && 이름 === "16_9") 까닭.push(`마스코트 창(x ${한계}~)을 ${b.x1 - 한계 + 1}px 침범합니다`);
      console.error(`     ${cs(k.시작)}  잉크 x ${b.x0}..${b.x1}  → ${까닭.join(" · ")}\n        ${k.글.replace(/\|/g, " / ")}`);
    }
    if (침범.length > 6) console.error(`     … 그리고 ${침범.length - 6}칸 더`);
    console.error(`   → 그 줄을 | 로 끊으세요. 한 줄은 한글 13자(공백 섞이면 16자)까지입니다.`);
  }
  결과[이름] = 글월;
}

if (막힘) {
  console.error(`\n⛔ 자막을 쓰지 않았습니다 — 예전 ${path.basename(DIR)}/자막_*.ass 를 그대로 두었습니다.`);
  console.error(`   (한 판만 새 글로 바꿔 두면 세로판과 가로판의 자막이 달라집니다)`);
  process.exit(1);
}

for (const [이름, 글월] of Object.entries(결과)) {
  const f = path.join(DIR, `자막_${이름}.ass`);
  writeFileSync(f, 글월, "utf8");                    // ⚠ BOM 없이 UTF-8
  console.log(`  ✔ 자막_${이름}.ass   ${칸.length}칸`);
}
console.log(`\n다음: node 영상만들기.mjs "${회차}"`);
