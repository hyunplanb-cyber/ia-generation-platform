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
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { 규격 } from "./_규격.mjs";
import { 크롬재기 } from "./_구간.mjs";

const 여기 = path.dirname(fileURLToPath(import.meta.url));
const 촬영방 = path.join(여기, "_촬영영상");
const g = 규격["9_16"];

/* 왼쪽 칸 폭. 영상만들기.mjs 는 왼쪽 칸의 «아래쪽»만 잘라 클로드 칸에 넣는다.
   잘리는 높이 = 왼폭 × (클로드칸높이 / 클로드칸폭) 이므로, 그 띠에 «살아 있는 글»이 오게 만든다. */
const 왼폭 = 1080;
const 띠높이 = 짝수(Math.round((왼폭 * g.PiP.h) / g.PiP.w));   // 1080 × 904/2002 = 488
/* 브라우저 탭줄·주소창. ⛔ 220 으로 박아 두면 안 된다 — 그건 2160 짜리 녹화본의 값이다.
   여행_프리미엄은 1348 이라 크롬도 그만큼 작다. 영상만들기.mjs 와 «같은 자»로 잰다. */
let 크롬 = 220;

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
if (!existsSync(회차방)) mkdirSync(회차방, { recursive: true });

/* ═══ 길이를 맞추는 법 — «한 배속으로 통째로»가 아니라 «내용에 따라» ══════════════
 *
 *   2026-09-09 현님: 「완성화면과 클로드 영역 화면의 시간이 좀 다르면,
 *                      내용에 따라 속도를 조절해서 맞춰줘.」
 *
 *   통째로 0.944배속을 걸면 «일이 벌어지는 대목»까지 같이 느려진다. 반대로 1.6배를 걸면
 *   읽어야 할 대목이 휙 지나간다. 그래서 1초마다 «얼마나 움직이나»를 재고,
 *   조용한 곳은 빠르게 · 바쁜 곳은 제 속도로 가게 나눠 준다.
 *
 *   ⚠ 이것은 «컷»이 아니다. 토막을 원본 차례 그대로 이어 붙이므로 그림은 안 끊긴다.
 *     빨라졌다 느려질 뿐이다.
 *
 *   ⛔ «바쁜 곳»을 건드리지 않는다 — 한 번 거꾸로 짰다가 되돌렸다.
 *     처음엔 공통 배수를 곱했더니 «바쁜 대목이 0.64배속»으로 늘어졌다. 읽을 대목이 늘어지고
 *     조용한 대목이 상대적으로 빨라진 셈이라, 고치려던 것을 그대로 다시 만든 꼴이었다.
 *
 *   속도를 어떻게 정하나
 *     ① 1초 토막마다 움직임을 잰다 → 0(조용) ~ 1(바쁨) 로 줄 세운다
 *     ② 속도 = 1 + k × (1 − 바쁨).  바쁜 곳(1)은 «언제나 1.0배» — 손대지 않는다
 *     ③ k 를 이분법으로 찾는다. 재료가 길면 k>0(조용한 곳을 빠르게),
 *        짧으면 k<0(조용한 곳을 늘려) — 차이는 «조용한 곳이 흡수»한다
 *     ④ 이웃끼리 튀지 않게 ±2초 평균으로 고른다
 */
function 속도나누기(움직임, 토막초, 목표) {
  const n = 움직임.length;
  if (!n) return [];
  const 줄선 = [...움직임].sort((a, b) => a - b);
  const 자리 = (v) => {                                        // 0(조용) ~ 1(바쁨)
    let a = 0, b = 줄선.length;
    while (a < b) { const m = (a + b) >> 1; if (줄선[m] < v) a = m + 1; else b = m; }
    return 줄선.length > 1 ? a / (줄선.length - 1) : 0.5;
  };
  const 바쁨 = 움직임.map(자리);
  const 고른바쁨 = 바쁨.map((_, i) => {
    let s = 0, c = 0;
    for (let k = Math.max(0, i - 2); k <= Math.min(n - 1, i + 2); k++) { s += 바쁨[k]; c++; }
    return s / c;
  });
  const 속도 = (k) => 고른바쁨.map((b) => Math.max(0.4, Math.min(5, 1 + k * (1 - b))));
  const 걸린시간 = (k) => 속도(k).reduce((a, v) => a + 토막초 / v, 0);
  let 낮 = -0.95, 높 = 8;
  for (let i = 0; i < 60; i++) { const 가 = (낮 + 높) / 2; if (걸린시간(가) > 목표) 낮 = 가; else 높 = 가; }
  return 속도((낮 + 높) / 2);
}

/** 1초마다 «얼마나 움직이나». 아래 몫(입력칸·상태줄)은 빼고 잰다. */
function 초마다움직임(파일, 아래뺄몫 = 0) {
  const w = 96, h = 96;
  const buf = ff(["-v", "error", "-i", 파일, "-vf", `fps=4,scale=${w}:${h}`,
    "-pix_fmt", "gray", "-f", "rawvideo", "-"]);
  const 장 = Math.floor(buf.length / (w * h));
  const 볼줄 = Math.max(4, Math.round(h * (1 - 아래뺄몫)));
  const 한장차 = [];
  for (let i = 1; i < 장; i++) {
    let s = 0, n = 0;
    for (let y = 0; y < 볼줄; y++) for (let x = 0; x < w; x++) {
      s += Math.abs(buf[i * w * h + y * w + x] - buf[(i - 1) * w * h + y * w + x]); n++;
    }
    한장차.push(s / n);
  }
  const 초별 = [];
  for (let i = 0; i + 4 <= 한장차.length; i += 4) {
    let s = 0; for (let k = 0; k < 4; k++) s += 한장차[i + k];
    초별.push(s / 4);
  }
  return 초별;
}

/** 토막마다 속도를 달리 걸어 이어 붙인다. ⚠ 원본 차례 그대로라 그림은 «안 끊긴다». */
function 토막필터(입력, 앞, 속도들, 토막초, 이름, 뒤) {
  const 줄 = [], n = 속도들.length;
  줄.push(`${입력}${앞}split=${n}${속도들.map((_, i) => `[${이름}a${i}]`).join("")}`);
  속도들.forEach((v, i) => 줄.push(
    `[${이름}a${i}]trim=${(i * 토막초).toFixed(3)}:${((i + 1) * 토막초).toFixed(3)},` +
    `setpts=(PTS-STARTPTS)/${v.toFixed(4)},format=yuv420p,setsar=1[${이름}b${i}]`));
  줄.push(`${속도들.map((_, i) => `[${이름}b${i}]`).join("")}concat=n=${n}:v=1:a=0${뒤}[${이름}속]`);
  return 줄;
}

const ff = (args) => execFileSync("ffmpeg", args, { maxBuffer: 1 << 28 });
const 재기 = (args) => execFileSync("ffprobe", args, { encoding: "utf8" }).trim();
const 재보기 = (파일) => {
  const [w, h] = 재기(["-v", "error", "-select_streams", "v", "-show_entries",
    "stream=width,height", "-of", "csv=p=0:s=x", 파일]).split("\n")[0].split("x").map(Number);
  const 초 = Number(재기(["-v", "error", "-show_entries", "format=duration", "-of",
    "default=noprint_wrappers=1:nokey=1", 파일]));
  return { w, h, 초 };
};

/* ═══ 두 파일로 주셨나 — «완성화면»과 «클로드»를 따로 찍으신 경우 (2026-09-09 현님) ═══
 *
 *   현님: 「다음 촬영때는 완성화면과 클로드 영역을 아예 따로 찍어볼까해.」
 *         「이렇게 컷해서 두개로 올려두면 잘 나오겠지?」  — 잘 나온다. 훨씬 낫다.
 *
 *   한 파일(2분할)에서 뽑으면 브라우저 칸이 화면의 3분의 1밖에 안 되어, 세로 칸에 채우느라
 *   가로를 61% 버려야 했다(뷰티샵 41% 만 보임). 따로 찍으면 89% 가 보인다.
 *   게다가 갈래 재기·분할선 찾기·로고 찾기가 «다 필요 없어진다» — 자리가 이미 정해져 있으니까.
 *
 *   찾는 이름:  <회차>_화면영역.mp4   ·   <회차>_클로드영역.mp4
 *   두는 곳:    _촬영영상/  또는  _새틀견본/ */
/* ⭐ 2026-09-10 폴더 정리 — 「2. 완성화면」은 «세트 폴더»가 되었다 (현님 지시).
 *     _촬영영상/2. 완성화면_인테리어_프리미엄/
 *         화면영역.mp4 · 클로드영역.mp4 · _통짜.mp4(옛 1개짜리)
 *   세트가 되는 건 2번뿐이라 1·3·4·기타는 파일 그대로 둔다.
 *   ⚠ 옛 자리(«<회차>_화면영역.mp4»)도 계속 본다 — _새틀견본에 두고 시험하실 수 있다. */
const 견본방 = path.join(여기, "_새틀견본");

/* ⭐ 2026-09-10 저녁 — 현님이 «갈래 폴더»를 한 층 더 두셨다 (「앞으로 영상이 계속 늘어날 것」).
 *     _촬영영상/2. 완성화면/<회차>/{화면영역, 클로드영역, _통짜}.mp4
 *   갈래 이름을 코드에 박지 않는다 — 갈래가 늘어도 여기를 안 고치게 «한 층을 통째로» 뒤진다.
 *   뿌리도 함께 본다: 옮기다 만 것이나 _새틀견본에 두고 시험하시는 것이 있어도 못 찾는 일이 없게. */
const 촬영터들 = [촬영방, ...(existsSync(촬영방)
  ? readdirSync(촬영방, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith("."))
      .map((e) => path.join(촬영방, e.name))
  : [])];
const 세트방 = 촬영터들.map((터) => path.join(터, 회차)).find(existsSync)
  ?? path.join(촬영방, "2. 완성화면", 회차);
const 짝찾기 = (꼬리) =>
  [path.join(세트방, `${꼬리}.mp4`),
   ...[...촬영터들, 견본방].map((방) => path.join(방, `${회차}_${꼬리}.mp4`))].find(existsSync) ?? null;
const 화면파일 = 짝찾기("화면영역");
const 클로드파일 = 짝찾기("클로드영역");
const 두파일 = Boolean(화면파일 && 클로드파일);

const 촬영본 = 두파일 ? 화면파일 : [
  path.join(세트방, "_통짜.mp4"),                                  // 세트 폴더 안의 옛 1개짜리
  ...촬영터들.flatMap((터) =>
    [`${회차}.mp4`, `${회차.replace(/^\d+\.\s*/, "")}.mp4`].map((n) => path.join(터, n))),
].find(existsSync);
if (!촬영본) {
  console.error(`\n⛔ 촬영본을 못 찾았습니다.`);
  console.error(`   한 파일이면  ${path.join(촬영방, 회차 + ".mp4")}`);
  console.error(`   두 파일이면  ${회차}_화면영역.mp4 · ${회차}_클로드영역.mp4  (_촬영영상 또는 _새틀견본)\n`);
  process.exit(1);
}

/* ═══ 두 파일 길 — 갈래도 분할선도 로고도 «찾을 것이 없다» ═══════════════════ */
if (두파일) {
  const 화 = 재보기(화면파일), 클 = 재보기(클로드파일);
  const 목표 = Number(값("--초")) || Math.floor(Math.min(화.초, 클.초 * 1.15) * 10) / 10;
  console.log(`\n두 파일로 만듭니다 — 갈래·분할선·로고를 안 찾습니다 (자리가 이미 정해져 있습니다)`);
  console.log(`  화면영역   ${path.basename(화면파일)}  ${화.w}x${화.h} · ${화.초.toFixed(1)}초`);
  console.log(`  클로드영역 ${path.basename(클로드파일)}  ${클.w}x${클.h} · ${클.초.toFixed(1)}초`);
  console.log(`  만들 길이  ${목표}초`);

  /* 완성화면 — 현님이 «이미 컷해서» 주신 것이라 다시 안 자른다. 길이만 맞춘다. */
  /* ⛔ 2026-09-09 현님: 「부분부분 영상 속도를 조절하기 보단 1배속 짜리 영상을 만들고
   *   전체 배속을 조절하는 편이 나을꺼야. 우리 릴스나 쇼츠는 거의 1분 내외일꺼고,
   *   내가 영상을 거의 1분 내외로 만들어 줄꺼니까.」
   *   → 토막마다 속도를 달리 걸던 것을 걷어낸다. «한 배속»만 쓴다.
   *     현님이 길이를 맞춰 주시니 배속도 1.0 언저리로 아주 조금만 움직인다. */
  const 화배속 = Math.max(0.8, Math.min(2.0, 화.초 / 목표));
  const 화길이 = 화.초 / 화배속;
  console.log(`  완성화면   ${화배속.toFixed(3)}배속 → ${화길이.toFixed(1)}초  (한 배속으로 갑니다)`);

  /* 클로드 — 클로드 칸 비율(2002:904)만큼 «아래쪽»을 잘라 쓴다. 새 글이 아래에서 나온다.
   * ⛔ 왼쪽 칸을 1080 으로 좁히지 않는다 — 그러면 2160→1080 으로 줄였다가 영상만들기가
   *   다시 2002 로 키운다. 두 번 다시 그리는 셈이라 글자가 뭉갠다.
   *   원래 폭 그대로 넘기고 «영상만들기에서 한 번만» 줄인다(2160 → 2002, 배율 0.927). */
  const 왼폭2 = 짝수(클.w);
  const 클h = 짝수(Math.min(클.h, Math.round((왼폭2 * g.PiP.h) / g.PiP.w)));
  console.log(`  클로드     ${왼폭2}x${클h} 를 그대로 (줄이지 않습니다) · 자를 «높이»는 흐름을 따라갑니다`);
  console.log(`             영상만들기가 ${왼폭2} → ${g.PiP.w} 로 «한 번만» 줄입니다 (배율 ${(g.PiP.w / 왼폭2).toFixed(3)})`);

  /* ⭐ 컷으로 자르지 않는다 — «글이 쓰이는 자리»를 따라 내려간다 (2026-09-09 현님)
   *
   *   현님: 「바쁜 쪽이 글씨가 많은 곳을 말하는게 아니고, 영상을 컷컷으로 짜르지말고.」
   *         + `_클로드영역_가이드.mp4` 를 주셨다.
   *
   *   가이드를 보니 화면이 «지금 쓰이고 있는 줄»을 따라 부드럽게 내려간다. 끊기지 않는다.
   *   ⛔ 내가 두 번 틀렸다 — ① 「아래쪽」으로 못 박았고 ② 「움직임 큰 3초 조각」들을 이어 붙였다.
   *      ①은 자리를 고정했고 ②는 흐름을 끊었다. 둘 다 가이드와 다르다.
   *
   *   그래서 이렇게 한다.
   *     ① 0.25초마다 «글이 있는 가장 아랫줄»을 찾는다
   *     ② 그 줄이 띠의 80% 자리에 오도록 띠를 놓는다 (아래로 조금 숨을 남긴다)
   *     ③ 흔들리지 않게 고르고(±1초 평균), 초당 움직임에 고삐를 채운다
   *     ④ `sendcmd` 로 그 자리를 시간에 따라 먹인다 — 한 줄기로 «이어서» 흐른다
   *
   *   ⛔ 2026-09-09 두 번째 되돌림 — 「아래 12% 는 안 본다」가 «빈화면»의 범인이었다.
   *     현님: 「영상이 빈화면으로 나오는 곳도 많고… 처음에 파일을 넣는 씬인데
   *            입력 영역이 짤리면 안돼.」
   *     원본을 보니 세 자리가 다 다르다 —
   *       t=2  글이 «없고» 입력칸만 맨 아래에 있다   ← 여기서 12% 를 빼니 찾을 것이 없어 빈화면
   *       t=20 글이 70% 에서 끝나고 아래는 비어 있다
   *       t=45 글이 꽉 차고 맨 아래에 입력칸이 있다
   *     → 입력칸도 «내용»이다. 빼지 않는다. 맨 아래 내용을 찾아 띠의 «아래»에 붙인다. */
  const 잼w = 120, 잼H = 짝수(Math.max(32, Math.round((잼w * 클.h) / 클.w)));
  const 클잼 = ff(["-v", "error", "-i", 클로드파일, "-vf",
    `fps=4,scale=${잼w}:${잼H}`, "-pix_fmt", "gray", "-f", "rawvideo", "-"]);
  const 클장 = Math.floor(클잼.length / (잼w * 잼H));
  /* ⛔ 「밝기 110 넘으면 글」로 잡으면 안 된다 — 2026-09-09 에 이것 때문에 첫 장면이 통째로 비었다.
   *   시작 화면의 «입력칸»은 바탕보다 조금 밝을 뿐이라 110 을 못 넘는다. 그래서 맨 위의 작은
   *   그림만 잡히고 띠가 위로 올라가 «빈 화면»이 나갔다.
   *   → 한 장마다 «그 화면의 바탕»을 재고, 거기서 한 뼘(22) 넘게 밝으면 내용으로 본다. */
  const 맨아래 = [], 줄내용 = [];
  for (let i = 0; i < 클장; i++) {
    const 낱 = 클잼.subarray(i * 잼w * 잼H, (i + 1) * 잼w * 잼H);
    const 줄선 = Array.from(낱).sort((a, b) => a - b);
    const 바탕 = 줄선[Math.floor(줄선.length * 0.5)];          // 가운뎃값 = 그 화면의 바탕
    const 문턱 = 바탕 + 22;
    const 있나 = new Uint8Array(잼H);
    for (let y = 0; y < 잼H; y++) {
      let 센것 = 0;
      for (let x = 0; x < 잼w; x++) if (낱[y * 잼w + x] > 문턱) 센것++;
      있나[y] = 센것 >= 3 ? 1 : 0;
    }
    줄내용.push(있나);
    let 찾음 = null;
    for (let y = 잼H - 1; y >= 0; y--) if (있나[y]) { 찾음 = y; break; }   // ⭐ 맨 밑까지 (입력칸 포함)
    맨아래.push(찾음 === null ? (맨아래.at(-1) ?? 잼H - 1) : 찾음);
  }
  /* 맨 아래 내용이 띠 «아래끝에서 숨 한 뼘» 위에 오게 — 그래야 입력칸이 안 잘린다 */
  const 띠줄 = Math.max(2, Math.round((클h / 클.h) * 잼H));
  const 숨 = Math.max(1, Math.round((60 / 클.h) * 잼H));
  const 바람 = 맨아래.map((y) => Math.max(0, Math.min(y - 띠줄 + 숨, 잼H - 띠줄)));
  /* ±1초 평균으로 고르고, 초당 220px(원본 자) 로 고삐를 채운다 */
  const 고름 = 바람.map((_, i) => {
    let s = 0, n = 0;
    for (let k = Math.max(0, i - 4); k <= Math.min(바람.length - 1, i + 4); k++) { s += 바람[k]; n++; }
    return s / n;
  });
  /* ⛔ 2026-09-09 — 초당 220px 은 «너무 느렸다». 글이 맨 위에만 있는 대목(t=11)에서
   *   카메라가 빈 가운데를 몇 초씩 지나가 그동안 화면이 통째로 비었다.
   *   → ① 걸음을 초당 700px 로 넓히고
   *     ② 그래도 띠 안에 «내용이 하나도 없으면» 고삐를 풀고 바로 붙인다.
   *   잠깐 튀는 것이 몇 초 비는 것보다 낫다. 현님이 「빈화면으로 나오는 곳도 많다」고 하셨다. */
  const 한걸음 = (700 / 4) * (잼H / 클.h);                     // 0.25초에 갈 수 있는 줄
  const 내용줄수 = (i, y) => {
    const 있나 = 줄내용[Math.min(i, 줄내용.length - 1)];
    const a = Math.max(0, Math.round(y)), b = Math.min(잼H, Math.round(y) + 띠줄);
    let n = 0; for (let k = a; k < b; k++) if (있나[k]) n++;
    return n;
  };
  const 내용있나 = (i, y) => 내용줄수(i, y) > 0;
  /* ⛔ 비었을 때 돌아갈 곳 — «내용이 제일 많은 자리». (2026-09-09)
   *   전에는 «고르게 만든 값(±1초 평균)»으로 되돌렸는데, 그 값 자체가 빈 자리일 수 있다.
   *   글이 위로 갔다가 아래로 오는 길목에서 평균이 «가운데 빈 곳»을 가리켰고, 그게 빈화면이었다.
   *   화면에 내용이 하나라도 있으면 이 자리는 반드시 채워져 있다. */
  const 제일찬자리 = (i) => {
    let 최고 = -1, 최고y = 0;
    for (let y = 0; y + 띠줄 <= 잼H; y++) {
      const n = 내용줄수(i, y);
      if (n > 최고) { 최고 = n; 최고y = y; }                   // 같으면 위쪽을 고른다 — 글은 위에서 시작한다
    }
    return 최고y;
  };
  /* ⛔ 2026-09-09 현님: 「8초~9초 사이에 아래 포커싱되던 부분이 위로 올라가서
   *   영상을 역방향으로 돌린거 같은데. 이부분은 컷으로 끊어서 들어가도 될거 같아.」
   *
   *   글은 «아래로» 흐른다. 그래서 카메라가 아래로 갈 때는 글을 따라가는 것으로 읽히지만,
   *   위로 «부드럽게» 올라가면 되감기로 보인다. 같은 속도라도 방향에 따라 뜻이 다르다.
   *   → 내려갈 때만 부드럽게. 올라갈 때는 «끊어서» 한 번에 간다(컷).
   *     조금 올라가는 것은 그냥 둔다 — 잔떨림을 컷으로 만들면 더 어지럽다. */
  const 튀는문턱 = Math.max(2, Math.round((60 / 클.h) * 잼H));
  const 자리y = [];
  let 끊은수 = 0;
  for (let i = 0; i < 고름.length; i++) {
    const 앞 = i ? 자리y[i - 1] : 고름[0];
    let v;
    if (고름[i] >= 앞) v = Math.min(앞 + 한걸음, 고름[i]);      // 아래로 — 부드럽게 따라간다
    else if (앞 - 고름[i] > 튀는문턱) { v = 고름[i]; 끊은수++; } // 위로 — 컷으로 한 번에
    else v = 앞;                                               // 잔떨림은 그대로 둔다
    if (!내용있나(i, v)) v = 바람[i];                           // 비면 «잰 값 그대로»
    if (!내용있나(i, v)) v = 제일찬자리(i);                     // 그래도 비면 내용이 제일 많은 자리
    자리y.push(v);
  }
  const 원y = 자리y.map((v) => 짝수(Math.max(0, Math.min(Math.round((v / 잼H) * 클.h), 클.h - 클h))));
  console.log(`             자를 높이 y ${Math.min(...원y)} ~ ${Math.max(...원y)}  (아래 끝은 ${클.h - 클h} · ${new Set(원y).size}자리를 지나갑니다)`);
  console.log(`             처음 3초: ${원y.slice(0, 12).filter((_, i) => i % 4 === 0).join(" → ")}  (입력칸이 보이려면 아래끝 언저리여야 합니다)`);
  console.log(`             내려갈 땐 부드럽게 · 올라갈 땐 끊어서 ${끊은수}번 (되감기처럼 안 보이게)`);

  const 채움 = (몸, 잰것, 이름) => 잰것 >= 목표 - 0.05
    ? `${몸},trim=0:${목표},setpts=PTS-STARTPTS[${이름}]`
    : `${몸}[${이름}몸];[${이름}몸]loop=loop=${Math.ceil(목표 / 잰것)}:size=${Math.ceil(잰것 * 30)}:start=0,trim=0:${목표},setpts=PTS-STARTPTS[${이름}]`;

  const F2 = [];
  F2.push(채움(`[0:v]setpts=(PTS-STARTPTS)/${화배속.toFixed(5)},format=yuv420p,setsar=1`, 화길이, "right"));
  /* 자리를 시간에 따라 «먹인다» — sendcmd 가 crop 의 y 를 0.25초마다 바꾼다.
     ⚠ 값이 그대로면 안 적는다. 파일이 쓸데없이 길어지고 ffmpeg 가 느려진다. */
  const 명령 = [];
  let 앞값 = null;
  원y.forEach((y, i) => {
    if (앞값 !== null && Math.abs(y - 앞값) < 4) return;
    명령.push(`${(i / 4).toFixed(3)} crop y ${y};`);
    앞값 = y;
  });
  const 명령길 = path.join(os.tmpdir(), `cc-clcam-${process.pid}.txt`);
  writeFileSync(명령길, 명령.join("\n") + "\n", "utf8");
  const 명령경로 = 명령길.split("\\").join("/").replace(":", "\\:");
  console.log(`             자리 바뀌는 곳 ${명령.length}군데`);

  const 클배속 = Math.max(0.8, Math.min(2.5, 클.초 / 목표));
  const 클길이 = 클.초 / 클배속;
  console.log(`             ${클배속.toFixed(3)}배속 → ${클길이.toFixed(1)}초  (한 배속으로 갑니다)`);

  F2.push(채움(
    `[1:v]sendcmd=f='${명령경로}',crop=${왼폭2}:${클h}:0:${원y[0]},` +
    `setpts=(PTS-STARTPTS)/${클배속.toFixed(5)},pad=${왼폭2}:${화.h}:0:${짝수(화.h - 클h)}:0x141414,format=yuv420p,setsar=1`,
    클길이, "left"));
  F2.push(`[left][right]hstack=inputs=2,format=yuv420p[out]`);

  const 임시2 = path.join(os.tmpdir(), `cc-master2-${process.pid}.txt`);
  writeFileSync(임시2, F2.join(";\n"), "utf8");
  const 낼것2 = path.join(회차방, "마스터.mp4");
  console.log(`\n  굽는 중… → ${path.relative(여기, 낼것2)}`);
  try {
    ff(["-v", "error", "-stats", "-i", 화면파일, "-i", 클로드파일, "-filter_complex_script", 임시2,
      "-map", "[out]", "-r", "30", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
      "-pix_fmt", "yuv420p", "-an", "-y", 낼것2]);
  } finally { rmSync(임시2, { force: true }); }
  const 잰2 = 재보기(낼것2);
  console.log(`\n✔ 마스터 ${잰2.w}x${잰2.h} · ${잰2.초.toFixed(1)}초`);
  const 보임 = Math.min(1, (규격["9_16"].영상.w / Math.max(규격["9_16"].영상.w / 화.w, 규격["9_16"].영상.h / 화.h)) / 화.w);
  console.log(`  완성화면 가로 ${(보임 * 100).toFixed(0)}% 가 보입니다` +
    (보임 > 0.995 ? " — 잘리는 곳이 없습니다" : `  (잘림 0% 로 찍으시려면 가로:세로 ${(규격["9_16"].영상.w / 규격["9_16"].영상.h).toFixed(3)} — 예 2160x3230)`));
  console.log(`\n다음:  node 자막굽기.mjs "${회차}" --칸초 2.4`);
  console.log(`       node 영상만들기.mjs "${회차}" --분할선 ${왼폭2}\n`);
  process.exit(0);
}

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
let 오른폭 = 0;                                    // 크롬을 잰 «뒤에» 정한다 (아래 ①·② 다음)

console.log(`\n촬영본  ${path.basename(촬영본)}   ${W0}x${H0} · ${길이.toFixed(1)}초`);

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

/* ⭐ 크롬(탭줄·주소창)을 «영상만들기와 같은 자»로 잰다. 220 은 2160 짜리 녹화본의 값일 뿐이다.
 *   브라우저가 보이는 구간에서 세 곳을 재어 가운뎃값을 쓴다. 못 재면 높이에 견줘 어림한다. */
{
  const 볼것 = 갈래.map((k, i) => ((k === "S" || k === "B") ? i : -1)).filter((i) => i >= 0);
  const 자리 = [0.3, 0.55, 0.8].map((몫) => 볼것[Math.floor(볼것.length * 몫)])
    .filter((t) => t !== undefined)
    .map((t) => (갈래[t] === "S"
      ? { t: t + 0.5, 왼: 분할선 ?? 0, 폭: W0 - (분할선 ?? 0) }
      : { t: t + 0.5, 왼: 0, 폭: W0 }));
  const 잰것 = 자리.length >= 2 ? 크롬재기(촬영본, 자리) : { px: 0, 믿나: false, 잰것: [] };
  크롬 = 잰것.믿나 ? 잰것.px : Math.round(220 * (H0 / 2160));
  console.log(`        크롬 ${크롬}px  ${잰것.믿나 ? `(잰 값 ${잰것.잰것.join(" · ")})` : "(못 재서 높이로 어림했습니다)"}`);
}
오른폭 = 짝수(Math.round((H0 - 크롬) * (g.영상.w / g.영상.h)));
console.log(`        완성화면 트랙 폭 ${오른폭}  (영상만들기가 실제로 쓰는 만큼 — 버려지는 화소가 없습니다)`);

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
    /* ⛔ 「티끌보다 많으면 글」로 잡으면 안 된다 — 창틀·사이드바까지 물어서 «화면 폭 전체»가 나온다.
     *   여행 편에서 실제로 0~2075(폭 2076) 가 나왔다. 그러면 배율이 0.52 로 떨어진다.
     *   → «가장 빽빽한 칸»에 견줘 20% 넘는 칸만 글로 본다. 글 덩어리만 남는다. */
    let 최대 = 0;
    for (let x = 0; x < W0; x++) if (칸[x] > 최대) 최대 = 칸[x];
    const 문턱 = Math.max(줄.length * 0.02, 최대 * 0.20);
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
/* ⛔ 재료가 늘 넉넉하지는 않다 (2026-09-09, 여행 편에서 밟았다)
 *   컷을 «겹치지 않게» 고르면 필요한 수를 못 채우는 녹화본이 있다.
 *     여행 144개화면 — 완성화면 재료 56초인데 58초짜리를 1.5배속으로 채우려면 88초가 필요하다.
 *   그때 그냥 모자란 채로 두면 완성화면 트랙이 짧아지고, 왼쪽 트랙과 길이가 안 맞아
 *   hstack 이 짧은 쪽에서 끊는다 — 영상이 통째로 짧아진다.
 *   → 간격을 차츰 좁혀 가며 다시 고른다. 겹치는 자리가 생기지만 «끊기는 것»보다 낫다. */
const 컷수 = Math.ceil((목표초 * 배속) / 컷초);
let 고른 = [], 간격 = 컷초;
for (const 배 of [1, 0.7, 0.5, 0.35, 0.25]) {
  간격 = 컷초 * 배; 고른 = [];
  for (const c of 후보) { if (고른.every((x) => Math.abs(x.t - c.t) >= 간격)) 고른.push(c); if (고른.length >= 컷수) break; }
  if (고른.length >= 컷수) break;
}
if (고른.length < 컷수)
  console.log(`  ⚠ 재료가 모자라 컷을 ${고른.length}개만 골랐습니다 (${컷수}개 필요) — 되돌이로 채웁니다`);
else if (간격 < 컷초 - 0.01)
  console.log(`  ⚠ 컷 사이 간격을 ${간격.toFixed(2)}초로 좁혔습니다 — 재료가 빠듯해 겹치는 자리가 생깁니다`);
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
/* 골라 낸 것이 목표보다 짧으면 되돌이로 채운다 — 왼쪽 트랙과 길이가 안 맞으면 hstack 이 끊는다 */
{
  const 잰것 = (고른.length * 컷초) / 배속;
  const 몸 = `${고른.map((_, i) => `[rr${i}]`).join("")}concat=n=${고른.length}:v=1:a=0`;
  F.push(잰것 >= 목표초 - 0.05
    ? `${몸},trim=0:${목표초},setpts=PTS-STARTPTS[right]`
    : `${몸}[브몸];[브몸]loop=loop=${Math.ceil(목표초 / 잰것)}:size=${Math.ceil(잰것 * 30)}:start=0,trim=0:${목표초},setpts=PTS-STARTPTS[right]`);
}
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
