// 컷편집 마스터 하나 → 16:9 · 9:16 두 벌을 뽑는다.   (2026-09-04 새 틀로 갈아엎음)
//
// 쓰는 법:  node 영상만들기.mjs "5. 프로젝트 생성영상"
//           node 영상만들기.mjs "5. 프로젝트 생성영상" --음악 "Small Kind of Brave.mp3"
//           node 영상만들기.mjs "5. 프로젝트 생성영상" --무음
//           node 영상만들기.mjs "5. 프로젝트 생성영상" --빠르게 --초 10     ← 시험용
//
// 회차 폴더에 있어야 하는 것:
//   마스터.mp4     컷편집을 끝낸 영상 (2분할 녹화본 — 왼쪽 코드창 · 오른쪽 브라우저)
//   16_9.png       가로 틀   3840 x 2160   ← 틀그리기.mjs 가 만들어 준다
//   9_16.png       세로 틀   2160 x 3840
//   제목_9_16.ass  (없어도 된다)  ← 틀그리기.mjs 가 만들어 준다
//   제목_16_9.ass  (없어도 된다)
//   자막_9_16.ass  (없어도 된다)  ← 자막굽기.mjs 가 만들어 준다
//   자막_16_9.ass  (없어도 된다)
//   마스코트.txt   (없으면 저절로 뽑아 적는다)
//
// 나오는 것:
//   최종_16x9.mp4   3840 x 2160   유튜브 롱폼 · 홈페이지 임베드
//   최종_9x16.mp4   2160 x 3840   쇼츠 · 릴스
//
// ⛔ 2026-09-04 에 바뀐 것 — 자세한 것은 새틀_명세.md
//   ① 틀을 «최종 크기»로 그린다. 옛 코드는 1080 틀에 줄여 얹고 2배로 늘렸다 → 화소의 3/4 이 가짜였다
//   ② 틀에서 어두운 네모를 «둘» 찾는다 — 브라우저 칸 rgb(46,46,46) · 코드창 PiP rgb(64,64,64)
//   ③ 2분할 녹화본의 분할선을 스스로 찾아, 브라우저는 큰 칸에 · 코드창은 PiP 에 따로 앉힌다
//   ④ 자막을 «최종 크기에서» 굽는다 (.ass). 옛것은 캡컷에서 손으로 얹었다
//   ⑤ ⭐ 제목 띠에 «움직이는 마스코트 영상»을 얹는다 (2026-09-04 저녁에 더함)
//        _이미지/마스코트/영상/*.mp4 에서 편마다 하나를 골라 그 편 내내 쓴다.
//        띠 자리는 «색으로 찾지 않는다» — _규격.mjs 가 좌표를 안다. 현님이 그리실 자리가 아니다.
//        되풀이 이음매가 튀지 않게 «왕복본»(앞→뒤→앞)을 미리 만들어 캐시한다.
//
//   --마스코트 온천.mp4   손으로 고른다
//   --띠없이              마스코트 없이 어두운 띠로 굽는다 (빠져나갈 문)
//   --분할선 1144         2분할 분할선을 손으로 못 박는다 (파일 안에서 바뀔 때)
//   --분할무시            2분할로 안 보고 통째로 앉힌다 (코드창 PiP 없음)
//
// ⛔ 2026-09-04 밤에 «조용히 어긋나던 것»을 막았다 — 다시 없애지 마라
//   A2  마스코트가 없거나 폴더째 없어도 죽지 않고, 멈출 때 «--띠없이» 를 알려 준다
//   A3  왕복본 캐시를 쓰기 전에 ffprobe 로 재고, 만들 때는 임시이름 → rename (_마스코트.mjs)
//   A4  마스코트 파일을 열어 실측한 W·H 가 _마스코트자리.json 과 다르면 «멈춘다»
//       (조용히 잘린 마스코트가 나가는 것보다 낫다)
//   A5  자리표에 없는 영상은 «자동 뽑기»에서 뺀다 — --마스코트 로만 쓴다 (_고르기.mjs)
//   B2  제목 높이·폭 검사는 --띠없이 여도 «반드시» 한다  → 제목검사()
//   B5  틀의 브라우저 칸이 띠와 안 맞닿으면 «죽은 검은 띠»라고 알린다  → 죽은띠검사()
//   B6  자막 .ass 가 없으면 말한다 (예전엔 한 마디도 안 했다)
//   B8  틀을 «먼저» 읽고, «띠를 쓸 때만» 뽑고 적고 왕복본을 만든다
//       — 못 쓸 틀인데 «썼다»고 기록되어 순번이 어긋나던 흠
//
// ⛔ 2026-09-04 «밤에 한 번 더» 막은 것 — 다시 없애지 마라
//   E4-b 경로에 ' 가 있으면 «맨 먼저» 곱게 멈춘다 (틀그리기.mjs 와 같은 말)
//   신1  2분할 분할선이 파일 «안»에서 바뀌면 구간을 말하고 멈춘다 — 한 수로 굳히지 않는다
//   신2  틀 PNG 의 W·H 를 «따진다» — 깨진 PNG 로 ffmpeg 이 영영 안 끝나던 흠
//   신3  _마스코트자리.json 이 없어도 죽지 않는다 (_마스코트.mjs 가 «쓸 때» 읽는다)
//   신6  자막 .ass 가 있어도 «칸이 0개»면 그렇게 말한다

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { 규격, 최소틈, 브라우저색, PiP색, 색세개 } from "./_규격.mjs";
import { 잉크재기, 폰트방, 못쓰는경로면멈춘다 } from "./_제목.mjs";
import { 자리찾기, 띠자르기, 창자르기, 왕복만들기, 실측, 자리표흠 } from "./_마스코트.mjs";
import { 마스코트고르기, 후보인가 } from "./_고르기.mjs";
import { 회차방길 } from "./_회차방.mjs";
import { 구간찾기, 구간말하기, 크롬재기 } from "./_구간.mjs";

const 여기 = path.dirname(fileURLToPath(import.meta.url));

const 회차 = process.argv[2];
if (!회차) {
  console.error('쓰는 법: node 영상만들기.mjs "5. 프로젝트 생성영상"');
  process.exit(1);
}
function argOf(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : null;
}
const 음악지정 = argOf("--음악");
const 무음 = process.argv.includes("--무음");
const 빠르게 = process.argv.includes("--빠르게");   // 시험용 — 화질 대신 속도
const 자를초 = Number(argOf("--초")) || 0;          // 시험용 — 앞에서 N 초만
const 마스코트지정 = argOf("--마스코트");
const 띠없이 = process.argv.includes("--띠없이");
const 분할선지정 = Number(argOf("--분할선")) || 0;   // 분할선이 파일 안에서 바뀔 때 손으로 못 박는다
const 분할무시 = process.argv.includes("--분할무시"); // 2분할로 안 보고 통째로 앉힌다
const 한수 = process.argv.includes("--한수");        // 구간을 안 나누고 옛날처럼 «한 수»로 굳힌다
const 크롬남김 = process.argv.includes("--크롬남김"); // 브라우저 탭줄·주소창을 안 자르고 그대로 둔다

// ⛔ cwd 에 기대지 않는다 — 다른 폴더에서 부르면 조용히 마스코트·글꼴이 빠졌다
// 찾는 규칙은 `_회차방.mjs` 한 곳에 있다 (네 도구가 같은 줄을 네 벌 갖고 있으면 어긋난다)
const DIR = 회차방길(여기, 회차);
const 음악폴더 = path.join(여기, "_음악");
const 마스터 = path.join(DIR, "마스터.mp4");

/* ── ⛔ ' 가 든 경로는 «맨 먼저» 멈춘다 (2026-09-04 밤 · E4-b) ────────────────
 *  예전엔 이 검사가 틀그리기.mjs 에만 있었다. 그래서
 *    · 제목_*.ass 가 있으면 잉크재기() 가 던진 오류를 아무도 안 받아 «node 스택 추적»으로 죽고
 *    · 제목_*.ass 가 없으면 그나마도 안 나와 「Error parsing filterchain … Invalid argument」
 *      한 줄만 남았다 — ' 이야기가 «한 마디도» 안 나왔다 (끝 코드도 127 이었다).
 *  틀그리기와 «똑같은 말»을 하도록 _제목.mjs 의 함수를 부른다.
 * ──────────────────────────────────────────────────────────────────────── */
못쓰는경로면멈춘다({ "회차 폴더": DIR, "글꼴 폴더": 폰트방 });

for (const f of [마스터, path.join(DIR, "16_9.png"), path.join(DIR, "9_16.png")]) {
  if (!existsSync(f)) {
    console.error(`없는 파일: ${path.basename(f)}  (${회차} 폴더에 넣어 주세요)`);
    process.exit(1);
  }
}

function ff(args, capture = false) {
  const r = spawnSync("ffmpeg", args, {
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    maxBuffer: 1 << 30,
  });
  if (r.status !== 0 && !capture) process.exit(r.status ?? 1);
  return r;
}

function probe(file, entries) {
  const r = spawnSync(
    "ffprobe",
    ["-v", "error", "-select_streams", entries.stream, "-show_entries", entries.show, "-of", "csv=p=0", file],
    { encoding: "utf8" },
  );
  return r.stdout.trim();
}

/** 윈도우 절대경로를 ffmpeg 필터 인자에 넣는 꼴.  D:/x → 'D\:/x'
 *  ⚠ 따옴표와 역슬래시 «둘 다» 있어야 한다. 하나만으로는 필터 파서가 죽는다. */
const q = (p) => "'" + p.replace(/\\/g, "/").replace(/:/g, "\\:") + "'";
const 짝수 = (v) => Math.round(v / 2) * 2;
const 조임 = (v, a, b) => Math.max(a, Math.min(b, v));

/* ═══════════════════════════════════════════════════════════════════════
   틀에서 «어두운 네모»를 찾는다 — 브라우저 칸 하나, 코드창 PiP 하나
   ═══════════════════════════════════════════════════════════════════════ */

// ⛔ 여기에 [46,46,46] 을 다시 적지 않는다. _규격.mjs 가 아는 값을 쪼개 쓴다 (신4③).
//    틀그리기.mjs 는 같은 값을 drawbox 에 «0x2E2E2E» 꼴로 넣는다 — 한 곳에서 나와야 안 어긋난다.
const 브라우저RGB = 색세개(브라우저색);   // [46, 46, 46]
const PiPRGB = 색세개(PiP색);             // [64, 64, 64]

/** 값이 «문턱을 넘는» 가장 긴 이어진 구간. 없으면 null. */
function 긴구간(arr, 문턱) {
  let best = null, a = -1;
  const 담기 = (a, b) => { if (!best || b - a > best.b - best.a) best = { a, b }; };
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] >= 문턱) { if (a < 0) a = i; }
    else { if (a >= 0) 담기(a, i - 1); a = -1; }
  }
  if (a >= 0) 담기(a, arr.length - 1);
  return best;
}

/** 정확한 색으로 칠해진 네모의 자리. 없으면 null.
 *
 * ⚠ «맨 바깥 화소로 테두리를 잡는» 방식은 못 쓴다 — 마스코트·제목 글자의 안티에일리어싱에
 *   우연히 같은 회색이 섞여 나와 자리가 통째로 어긋난다(2026-09-04 에 밟았다).
 *   그래서 «줄마다·칸마다 세어» 충분히 찬 구간만 본다. 안쪽에 PiP 가 뚫려 있어도 견딘다. */
function 색네모(buf, W, H, [r, g, b], tol = 3, 구멍 = null) {
  const 맞나 = (i) =>
    Math.abs(buf[i] - r) <= tol && Math.abs(buf[i + 1] - g) <= tol && Math.abs(buf[i + 2] - b) <= tol;
  /* ⛔ 2026-09-09 — 클로드 칸이 «가로 93%»가 되면서 이 검사가 무너졌다.
   *   PiP 를 지나는 줄은 46,46,46 이 158/2160 = 7% 뿐이라 «30% 문턱»에 걸려 끊긴다.
   *   그래서 브라우저 칸이 y610~2142(1532px)로 잘리고, PiP 아래 795px 이 통째로 사라졌다.
   *   실제로 그렇게 구워져서 클로드 칸이 «회색 빈 상자»로 나왔다.
   *   → PiP 는 «뚫린 구멍»이지 남의 땅이 아니다. 구멍 안은 찬 것으로 세고 이어 붙인다.
   *   ⚠ 옛 PiP(1360/2160 = 63%)일 때는 37% 가 남아 문턱을 겨우 넘겨 안 걸렸다. 운이었다. */
  const 구멍안 = (x, y) =>
    구멍 !== null && x >= 구멍.x && x < 구멍.x + 구멍.w && y >= 구멍.y && y < 구멍.y + 구멍.h;

  const 줄 = new Int32Array(H);
  let 모두 = 0;
  for (let y = 0; y < H; y++) {
    const row = y * W * 3;
    let c = 0;
    for (let x = 0; x < W; x++) if (구멍안(x, y) || 맞나(row + x * 3)) c++;
    줄[y] = c; 모두 += c;
  }
  if (모두 < W * H * 0.01) return null;                 // 자잘한 티끌은 무시

  const 띠 = 긴구간(줄, W * 0.30);
  if (!띠 || 띠.b - 띠.a < H * 0.05) return null;

  const 칸수 = new Int32Array(W);
  for (let y = 띠.a; y <= 띠.b; y++) {
    const row = y * W * 3;
    for (let x = 0; x < W; x++) if (구멍안(x, y) || 맞나(row + x * 3)) 칸수[x]++;
  }
  const 칸 = 긴구간(칸수, (띠.b - 띠.a + 1) * 0.30);
  if (!칸 || 칸.b - 칸.a < W * 0.05) return null;

  const x = 짝수(칸.a), y = 짝수(띠.a);
  return {
    x, y,
    w: Math.min(짝수(칸.b + 1 - x), W - x),
    h: Math.min(짝수(띠.b + 1 - y), H - y),
  };
}

/** 옛 틀(rgb 16,16,16 처럼 색을 모르는 것)을 위한 되돌이 — «평평한 어두운 회색» 한 덩어리를 찾는다. */
function 옛네모(buf, W, H) {
  const flat = (x, y) => {
    const i = (y * W + x) * 3;
    const [R, G, B] = [buf[i], buf[i + 1], buf[i + 2]];
    return Math.abs(R - G) < 4 && Math.abs(G - B) < 4 && R >= 8 && R <= 70;
  };
  const run = (n, get) => {
    let best = 0, cur = 0, end = 0;
    for (let i = 0; i < n; i++) { if (get(i)) { cur++; if (cur > best) { best = cur; end = i; } } else cur = 0; }
    return { len: best, start: end - best + 1 };
  };
  let row = { len: 0 };
  for (let y = 0; y < H; y += 2) {
    const rr = run(W, (x) => flat(x, y));
    if (rr.len > row.len) { row = rr; }
  }
  // ⛔ Math.max(2, …) — W 가 0 이면 `0 < 0` 이 «거짓»이라 문턱을 그냥 통과했다 (신2)
  if (row.len < Math.max(2, W * 0.2)) return null;
  const cx = row.start + Math.floor(row.len / 2);
  const col = run(H, (y) => flat(cx, y));
  return { x: 짝수(row.start), y: 짝수(col.start), w: 짝수(row.len), h: 짝수(col.len) };
}

function 틀읽기(png) {
  const [W, H] = probe(png, { stream: "v:0", show: "stream=width,height" }).split(",").map(Number);

  /* ⛔ probe 가 준 W·H 를 «따진다». (2026-09-04 밤 · 신2)
   *   반만 써진 PNG 면 ffprobe 가 «0,0» 을 돌려준다. 예전엔 그 0 이 그대로 흘러 들어가
   *     · 색네모는 null 을 주는데(맞다)
   *     · 옛네모의 마지막 문턱 `row.len < W * 0.2` 가 `0 < 0` 이라 «거짓»이 되어
   *       null 대신 { x: NaN, y: 2, w: 0, h: 0 } 을 돌려주었다.
   *   그래서 「영상 자리를 못 찾았어요」로 곱게 멈추지 못하고 「틀 0 x 0 · Infinity배로 늘려
   *   씁니다」를 찍은 뒤 -loop 1 로 깨진 png 를 물려 ffmpeg 이 «영영 안 끝났다»
   *   (Failed to reallocate parser buffer). 그때 최종_16x9.mp4 는 이미 나와 있어서
   *   짝이 반만 있는 채 Ctrl-C 로 빠져나와야 했다. */
  if (!Number.isFinite(W) || !Number.isFinite(H) || W < 2 || H < 2) {
    console.error(`\n⛔ ${path.basename(png)} 를 못 읽었습니다 — 크기가 ${W}x${H} 로 나옵니다.`);
    console.error(`   반만 써진(깨진) PNG 입니다. 굽는 중에 Ctrl-C 하셨거나 복사가 덜 끝났을 수 있습니다.`);
    console.error(`   → node 틀그리기.mjs "${회차}" --제목 "첫 줄|둘째 줄"  로 틀을 다시 그리세요.\n`);
    process.exit(1);
  }

  // ⭐ 원본 폭 그대로 훑는다. 옛 코드는 폭 800 으로 줄여 판정해 가장자리를 2px 씩 먹었다.
  const buf = ff(["-v", "error", "-i", png, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], true).stdout;
  if (!buf || buf.length < W * H * 3) {
    console.error(`\n⛔ ${path.basename(png)} 의 화소를 다 못 읽었습니다 (${buf?.length ?? 0} / ${W * H * 3} 바이트).`);
    console.error(`   깨진 PNG 입니다. node 틀그리기.mjs 로 다시 그리세요.\n`);
    process.exit(1);
  }

  /* ⭐ PiP 를 «먼저» 찾는다 — 브라우저 칸을 찾을 때 그 자리를 «뚫린 구멍»으로 알려 주려고.
   *   순서를 되돌리면 2026-09-09 의 흠(브라우저 칸이 PiP 위에서 잘림)이 되살아난다. */
  let pip = 색네모(buf, W, H, PiPRGB);
  let 영상 = 색네모(buf, W, H, 브라우저RGB, 3, pip);
  let 옛틀 = false;
  if (!영상) { 영상 = 옛네모(buf, W, H); pip = null; 옛틀 = true; }
  if (영상 && !(영상.w >= 2 && 영상.h >= 2 && Number.isFinite(영상.x) && Number.isFinite(영상.y))) {
    영상 = null;   // 옛네모가 0 폭·NaN 을 준 자리. null 로 바꿔 아래 «곱게 멈추는» 길로 보낸다
  }
  if (!영상) {
    console.error(`${path.basename(png)}: 영상 자리를 못 찾았어요.`);
    console.error(`  브라우저 칸을 rgb(46,46,46), 코드창 PiP 를 rgb(64,64,64) 로 평평하게 비워 두세요.`);
    console.error(`  틀그리기.mjs 가 자리 맞는 견본을 만들어 줍니다.`);
    process.exit(1);
  }
  return { W, H, 영상, pip, 옛틀 };
}

/* ═══════════════════════════════════════════════════════════════════════
   2분할 녹화본의 «분할선»을 찾는다 — 왼쪽 코드창(어둡다) / 오른쪽 브라우저(밝다)
   ═══════════════════════════════════════════════════════════════════════ */

/* ⛔ 2026-09-04 밤에 고친 것 (신1) — 「한 파일에 분할선이 하나」라고 믿지 않는다.
 *
 *  예전엔 25·40·55·70% 넉 점만 재서 «가운뎃값» 하나를 쓰고, 후보끼리 폭의 8%
 *  (2816 × 0.08 = 225px) 안이면 한 마디도 안 했다. 그런데 시험 마스터는 파일 «안»에서
 *  분할선이 바뀐다 — t 0.0~5.0 은 x=1144, t 5.5~9.5 는 x=962 다(0.5초 간격으로 다 쟀다.
 *  두 자리 모두 상승 176~184 로 또렷하다). 차이 182px < 225px 이라 흔들림 검사가 안 걸리고
 *  1144 로 굳었다. 그 결과 뒤 절반은
 *    ① 브라우저를 x=1144 에서 자르니 브라우저 «왼쪽 182px»이 통째로 날아가고
 *    ② 코드창 PiP 는 0..1144 를 담으니 «브라우저 182px»이 PiP 안으로 들어왔다
 *  — 명세의 「⛔ PiP 는 코드창을 가로로 한 픽셀도 안 자른다」가 반대쪽으로 깨진 셈이다.
 *  콘솔은 「2분할: 분할선 x=1144」 한 줄뿐이었다.
 *
 *  이제 촘촘히(12점) 재고, 흔들리면 «어느 구간이 어디였나»를 말하고 멈춘다.
 *  한 수로는 옳게 자를 길이 없기 때문이다 —
 *    1144 로 굳히면 962 구간에서 브라우저 왼쪽이 잘리고,
 *    962 로 굳히면 1144 구간에서 코드창 오른쪽이 잘린다.
 *  현님이 --분할선 <x> 로 못 박으시거나 --분할무시 로 통째로 앉히실 수 있다.
 */
const 흔들림허용 = (W) => Math.max(4, Math.round(W * 0.005));   // 2816 → 14px

function 분할선재기(영상, 길이) {
  const [W, H] = probe(영상, { stream: "v:0", show: "stream=width,height" }).split(",").map(Number);
  if (!Number.isFinite(W) || !Number.isFinite(H) || W < 8 || H < 8) return null;
  const w = 480, h = Math.max(2, Math.round((H / W) * w));
  const 잰것 = [];

  const 점수 = 12;
  for (let n = 0; n < 점수; n++) {
    const 때 = 길이 * (0.05 + (0.90 * n) / (점수 - 1));
    const buf = ff(["-v", "error", "-ss", 때.toFixed(2), "-i", 영상, "-frames:v", "1",
      "-vf", `scale=${w}:${h}`, "-f", "rawvideo", "-pix_fmt", "gray", "-"], true).stdout;
    if (!buf || buf.length < w * h) continue;

    const 열 = new Float64Array(w);
    for (let x = 0; x < w; x++) { let s = 0; for (let y = 0; y < h; y++) s += buf[y * w + x]; 열[x] = s / h; }

    // «어두운 왼쪽 → 밝은 오른쪽» 으로 가장 크게 꺾이는 자리. 25%~55% 안에서만 본다
    const k = Math.round(w * 0.03);
    let best = 0, bx = -1;
    for (let x = Math.round(w * 0.25); x < Math.round(w * 0.55); x++) {
      let 왼 = 0, 오 = 0;
      for (let i = 1; i <= k; i++) { 왼 += 열[x - i]; 오 += 열[x + i]; }
      const 오름 = (오 - 왼) / k;
      if (오름 > best) { best = 오름; bx = x; }
    }
    if (bx > 0 && best > 40) 잰것.push({ t: 때, x: Math.round((bx * W) / w) });
  }
  return { W, H, 잰것 };
}

function 분할선찾기(영상, 길이) {
  if (분할무시) return null;

  const 잰 = 분할선재기(영상, 길이);
  if (!잰) return null;
  const { W, H, 잰것 } = 잰;

  if (분할선지정) {                                  // 손으로 못 박으신 자리
    const x = 짝수(조임(분할선지정, 2, W - 2));
    return { W, H, x, 손지정: true, 잰것 };
  }

  if (잰것.length < 2) return null;                  // 2분할이 아니다

  const xs = 잰것.map((s) => s.x).sort((a, b) => a - b);
  const 허용 = 흔들림허용(W);
  if (xs[xs.length - 1] - xs[0] > 허용) {
    return { W, H, 흔들림: 무리짓기(잰것, 허용), 잰것 };   // 파일 «안»에서 바뀐다
  }
  return { W, H, x: 짝수(xs[Math.floor(xs.length / 2)]), 잰것 };
}

/** 잰 점들을 «가까운 x 끼리» 묶어 { x, 처음, 마지막, 수 } 목록으로. 굵은 것부터. */
function 무리짓기(잰것, 허용) {
  const 무리 = [];
  for (const s of [...잰것].sort((a, b) => a.x - b.x)) {
    const 끝 = 무리[무리.length - 1];
    if (끝 && s.x - 끝.xs[끝.xs.length - 1] <= 허용) 끝.xs.push(s.x), 끝.ts.push(s.t);
    else 무리.push({ xs: [s.x], ts: [s.t] });
  }
  return 무리
    .map((m) => ({
      x: 짝수(m.xs[Math.floor(m.xs.length / 2)]),
      처음: Math.min(...m.ts), 마지막: Math.max(...m.ts), 수: m.xs.length,
    }))
    .sort((a, b) => b.수 - a.수);
}

/* ═══════════════════════════════════════════════════════════════════════
   제목 띠에 얹을 «움직이는 마스코트 영상»
   ⛔ 띠 자리는 색으로 찾지 않는다. _규격.mjs 가 좌표를 안다.
      브라우저 칸·PiP 는 현님이 옮기실 수 있는 자리라 색으로 찾지만,
      띠는 «현님이 그리실 수 없는» 자리다 — 영상이니까.
   ═══════════════════════════════════════════════════════════════════════ */

/** 제목 .ass 의 흰 잉크 네모. 파일이 없으면 null. */
function 제목잉크(판) {
  const g = 규격[판];
  const f = path.join(DIR, `제목_${판}.ass`);
  if (!existsSync(f)) return null;
  return 잉크재기(f, g.W, g.H);
}

/** 두 판의 제목을 «재서» 자리에 맞나 본다. 돌려주는 것 = 세로판 잉크 오른끝(0 = 제목 없음).
 *
 *  ⛔ --띠없이 여도 «반드시» 한다. (2026-09-04 B2)
 *     예전엔 마스코트정하기() 첫 줄의 `if (띠없이) return null;` 이 이 검사보다 앞에 있어서,
 *     3줄 제목 + --띠없이 가 경고 한 마디 없이 구워졌다 — 셋째 줄이 브라우저 탭 위에 얹혔다.
 *  ⛔ 폭도 본다. 9:16 은 Wrap 2 라 안 접힌다 — 긴 한 줄이 화면 밖으로 그냥 흘러 나간다.
 *  ⚠ 재는 일은 _제목.mjs 의 잉크재기() 를 «부르기만» 한다. 여기서 .ass 를 쓰지 않는다. */
function 제목검사() {
  const 탈 = [];
  let 세로오른끝 = 0;

  for (const 판 of ["9_16", "16_9"]) {
    const g = 규격[판];
    const i = 제목잉크(판);
    if (!i) {
      console.log(`제목 ${판}: 없음 (node 틀그리기.mjs 로 제목_${판}.ass 를 만드세요)`);
      continue;
    }
    if (판 === "9_16") 세로오른끝 = i.x1;

    const 칸 = 판 === "9_16" ? g.띠 : g.글자칸;      // 글자가 머물러야 하는 칸
    const 칸아래 = 칸.y + 칸.h;
    const 오른한계 = g.W - g.제목.marginR;            // 여백선. 여기 닿으면 잘렸다고 본다
    console.log(`제목 ${판}: 잉크 x ${i.x0}..${i.x1} · y ${i.y0}..${i.y1}  (칸 y ${칸.y}..${칸아래} · 오른 여백선 ${오른한계})`);

    if (i.x1 >= 오른한계) {
      탈.push(`제목_${판}.ass 의 잉크 오른끝 x=${i.x1} 이 오른쪽 여백선 ${오른한계} 에 닿았습니다 ` +
        `— 글자가 화면 밖으로 흘렀습니다${g.제목.wrap === 2 ? " (Wrap 2 라 스스로 안 접힙니다)" : ""}.`);
    }
    if (i.y1 >= 칸아래) {
      if (판 === "9_16") {
        탈.push(`제목_9_16.ass 의 잉크가 띠(y ${칸.y}..${칸아래})를 ${i.y1 - 칸아래 + 1}px 넘습니다 — 9:16 제목은 두 줄까지입니다.`);
      } else {
        console.log(`  ⚠ 제목_16_9.ass 의 잉크가 글자칸(y ${칸.y}..${칸아래})을 ${i.y1 - 칸아래 + 1}px 넘어 마스코트 창 위에 걸칩니다.`);
        console.log(`     한 줄 줄이시면 깔끔합니다 (16:9 제목은 ${g.제목.최대줄}줄까지 허용).`);
      }
    }
  }

  if (탈.length) {
    console.error(`\n⛔ 제목이 자리에 안 맞습니다${띠없이 ? "  (--띠없이 여도 이 검사는 합니다)" : ""}:`);
    for (const t of 탈) console.error(`   · ${t}`);
    console.error(`   node 틀그리기.mjs "${회차}" --제목 "첫 줄|둘째 줄"  로 줄여 다시 만드세요.\n`);
    process.exit(1);
  }
  return 세로오른끝;
}

/** 뽑기 장부(마스코트.txt · _마스코트_최근.json)를 지금 모습으로 기억해 두고, 되돌리는 손잡이를 준다.
 *  ⛔ 굽지 못하고 멈출 때 «썼다»는 기록만 남으면 순번이 어긋난다 (B8 과 같은 흠). */
function 뽑기되돌리기준비() {
  const 전 = [path.join(DIR, "마스코트.txt"), path.join(여기, "_마스코트_최근.json")]
    .map((f) => ({ f, 있었나: existsSync(f), 글: existsSync(f) ? readFileSync(f, "utf8") : null }));
  return () => {
    for (const s of 전) {
      try {
        if (s.있었나) writeFileSync(s.f, s.글, "utf8");
        else if (existsSync(s.f)) rmSync(s.f, { force: true });
      } catch { /* 되돌리기에 실패해도 더 할 일은 없다 */ }
    }
  };
}

function 마스코트정하기(오른끝) {
  /* ⛔ 자리표를 못 읽었으면 «먼저» 말한다. (2026-09-04 밤 · 신3)
     _마스코트.mjs 가 이제 최상위에서 안 읽으므로 여기까지 곱게 온다. 그러나 표가 없으면
     모든 영상이 «되돌이 값»이 되어, 자르는 자리가 맞는지 아무도 모르는 채로 나간다. */
  const 표흠 = 자리표흠();
  if (표흠) {
    console.log(`  ⚠ ${표흠}`);
    console.log(`     자리표가 없으면 자동 뽑기에서 «모든» 영상이 빠집니다(잰 것이 하나도 없으므로).`);
    console.log(`     node 마스코트자리.mjs 로 재서 표를 채우시거나, --띠없이 로 구우세요.`);
  }
  const 되돌리기 = 뽑기되돌리기준비();
  let 고름;
  try {
    고름 = 마스코트고르기({ 회차: DIR, 지정: 마스코트지정, 제목오른끝: 오른끝 });
  } catch (e) {
    되돌리기();
    console.error(`\n⛔ ${e.message}\n`);
    if (!/--띠없이/.test(e.message)) {
      console.error(`   마스코트 없이 구우시려면:  node 영상만들기.mjs "${회차}" --띠없이\n`);
    }
    process.exit(1);
  }
  // ⚠ ①손지정·②마스코트.txt 로 온 것은 «고르기»를 거치지 않는다 — 그래도 겹침은 재서 알린다.
  //    (제목만 길게 고치고 다시 구우면 조용히 얼굴 위에 글자가 앉을 수 있다)
  if (고름.후보 === undefined) {
    const p = 후보인가(고름.파일, 오른끝);
    if (!p.된다) {
      console.log(`  ⚠ ${고름.파일} 은 이 제목과 겹칩니다 — ` +
        (p.띠쓰나 ? `캐릭터 왼끝 ${p.왼} vs 제목 오른끝 ${오른끝} (틈 ${p.남는틈}px, 최소 ${최소틈})` : "자리표에 띠쓰나 false"));
      console.log(`     그래도 지정하신 대로 굽습니다. 바꾸시려면 <회차>/마스코트.txt 를 지우고 다시 도세요.`);
    }
  }

  const 자 = { ...자리찾기(고름.파일) };

  /* ── A4 실측 — 자리표의 W·H 를 믿지 않고 «파일을 열어» 잰다 ──────────────────
     표는 1280x720 인데 같은 이름으로 1080x1920 을 덮어 내보내시면, 띠자르기·창자르기의
     셈이 통째로 어긋나 콘솔은 태연한데 띠에 캐릭터가 없다(바위와 김만 나온다).
     조용히 잘린 마스코트가 나가는 것보다 «멈추는» 것이 낫다. */
  let 실;
  try {
    실 = 실측(고름.파일);
  } catch (e) {
    되돌리기();
    console.error(`\n⛔ ${e.message}\n`);
    process.exit(1);
  }
  if (자.잰것) {
    if (실.W !== 자.W || 실.H !== 자.H) {
      되돌리기();                                  // 굽지 못하니 «썼다»는 기록도 남기지 않는다
      console.error(`\n⛔ ${고름.파일} 의 실제 크기가 자리표와 다릅니다.`);
      console.error(`   파일 ${실.W}x${실.H}  ↔  _마스코트자리.json ${자.W}x${자.H}`);
      console.error(`   이대로 구우면 자르는 자리가 어긋나 캐릭터가 통째로 사라집니다(바위·김만 나옵니다).`);
      console.error(`   node 마스코트자리.mjs 로 다시 재서 _마스코트자리.json 의 W·H·x0·x1·머리·얼굴을 고쳐 주세요.`);
      console.error(`   급하시면:  node 영상만들기.mjs "${회차}" --띠없이\n`);
      process.exit(1);
    }
  } else {
    // 표에 없는 것(= --마스코트 손지정으로만 온다) — 되돌이의 1280x720 대신 «실측»을 쓴다
    자.W = 실.W; 자.H = 실.H;
    console.log(`  ⚠ ${고름.파일} 이 _마스코트자리.json 에 없습니다 — 크기는 실측(${실.W}x${실.H}), 나머지는 되돌이 값으로 굽습니다.`);
    console.log(`     node 마스코트자리.mjs 로 그림을 뽑아 재서 표에 적어 주세요.`);
  }
  return { ...고름, 자, 실, 제목오른끝: 오른끝, 되돌리기 };
}

/* ═══════════════════════════════════════════════════════════════════════ */

function 음악고르기() {
  if (무음) return null;
  const list = readdirSync(음악폴더).filter((f) => /\.(mp3|m4a|wav)$/i.test(f));
  if (list.length === 0) return null;
  if (음악지정) {
    const hit = list.find((f) => f === 음악지정 || f.includes(음악지정));
    if (!hit) { console.error(`음악을 못 찾았어요: ${음악지정}\n  있는 것: ${list.join(" / ")}`); process.exit(1); }
    return path.join(음악폴더, hit);
  }
  const seed = [...회차].reduce((n, c) => n + c.charCodeAt(0), 0);
  return path.join(음악폴더, list[seed % list.length]);
}

const 원길이 = Number(probe(마스터, { stream: "v:0", show: "format=duration" })) || 0;
const 길이 = 자를초 ? Math.min(자를초, 원길이) : 원길이;
const 소리있음 = probe(마스터, { stream: "a", show: "stream=codec_name" }).length > 0;
const 음악 = 음악고르기();
const 분할 = 분할선찾기(마스터, 원길이);

console.log(`\n마스터: ${path.basename(마스터)}  ${원길이.toFixed(1)}초  (소리 ${소리있음 ? "있음" : "없음"})`);
console.log(`음악:   ${음악 ? path.basename(음악) : "넣지 않음"}`);

/* ── 구간 나누기 (2026-09-04 밤 · 현님 지적으로 생김) ────────────────────────
   현님: 「이 중간에 검은화면이 다른 걸로 바뀌는데 이런건 알맞게 컷이 불가능한가?」

   녹화본은 «영상 내내 2분할»이 아니다. 코드창 전체화면 → 2분할 → 브라우저 전체화면 으로 흐른다.
   한 수로 굳혀 굽던 옛 방식은 브라우저 전체화면 구간에서도 왼쪽을 잘라 PiP 에 넣어,
   코드창 자리에 «브라우저 조각»이 확대돼 들어갔다. 구간마다 짜임을 갈아 끼운다.

   ⚠ 세로판(9:16)만 달라진다. 가로판(16:9)은 원본이 통째로 들어가므로 구간과 무관하다. */
let 구간 = null;
if (!한수 && !분할무시 && !분할선지정) {
  const 재것 = 구간찾기(마스터, 원길이, { 간격: 원길이 > 40 ? 0.5 : 0.25 });
  if (재것 && 재것.구간.length > 1) 구간 = 재것;
  if (구간) {
    console.log(`구간:   ${구간.구간.length}개 — 구간마다 짜임을 갈아 끼웁니다 (${구간.점수}점을 재서)`);
    for (const 줄 of 구간말하기(구간, 원길이)) console.log(줄);
    console.log(`        (한 수로 굳히려면 --한수 · 2분할로 안 보려면 --분할무시)`);
  }
}

/* ── 브라우저 크롬(창틀·탭줄·주소창) 잘라내기 (2026-09-04 밤 · 현님 지적) ─────
   현님: 「위에 이부분도 안보이도록 하고 싶은데」
   릴스에 로컬 경로(D:/_가이드용_2/…)가 그대로 나가는 것도 좋지 않다.

   ⚠ 세로판(9:16)에만 쓴다. 가로판(16:9)은 원본이 «배율 1.000» 으로 통째로 들어가는데,
     위를 자르면 비율이 1.304 → 1.451 로 바뀌어 그 1.000 이 깨지고, 왼쪽 코드창의 위도 같이 잘린다.
   ⚠ «코드창 전체화면» 구간에는 안 쓴다 — 거기엔 브라우저 크롬이 없다. */
let 크롬 = { px: 0, 믿나: false, 잰것: [], 흔들림: 0 };
if (!크롬남김) {
  const 자리 = [];
  const 보태기 = (t, 왼, 폭) => { if (폭 > 200) 자리.push({ t, 왼, 폭 }); };
  if (구간) {
    for (const g of 구간.구간) {
      if (g.종류 === "코드창") continue;
      const 왼 = g.종류 === "2분할" ? g.x : 0;
      const 가 = g.시작 + (g.끝 - g.시작) * 0.35, 나 = g.시작 + (g.끝 - g.시작) * 0.7;
      보태기(가, 왼, 구간.W - 왼); 보태기(나, 왼, 구간.W - 왼);
    }
  } else if (분할 && Number.isFinite(분할.x)) {
    for (const p of [0.25, 0.5, 0.75]) 보태기(원길이 * p, 분할.x, 분할.W - 분할.x);
  } else {
    const [W0] = probe(마스터, { stream: "v:0", show: "stream=width,height" }).split(",").map(Number);
    for (const p of [0.25, 0.5, 0.75]) 보태기(원길이 * p, 0, W0 || 0);
  }
  if (자리.length >= 2) 크롬 = 크롬재기(마스터, 자리);

  if (크롬.믿나) {
    console.log(`크롬:   위 ${크롬.px}px 을 잘라냅니다 — 탭줄·주소창 (잰 값 ${크롬.잰것.join(" · ")})`);
    console.log(`        (그대로 두시려면 --크롬남김)`);
  } else if (크롬.잰것.length) {
    console.log(`크롬:   ⚠ 탭줄·주소창 자리가 흔들려 «안 자릅니다» (잰 값 ${크롬.잰것.join(" · ")} · 벌어짐 ${크롬.흔들림}px)`);
    console.log(`        조용히 엉뚱한 데를 자르는 것보다 낫습니다. 잘라야 하면 창을 늘 같은 자리에 띄우고 다시 찍으세요.`);
    크롬.px = 0;
  } else {
    크롬.px = 0;
  }
}

/* ── 분할선이 파일 «안»에서 바뀌면 여기서 멈춘다 (2026-09-04 밤 · 신1) ─────────
   ⭐ 마스코트를 뽑기 «전»에 둔다 — B8 과 같은 까닭이다. 뒤에 두면 굽지도 못하면서
      마스코트.txt · _마스코트_최근.json 에 «썼다»는 기록만 남아 순번이 어긋난다. */
/* ⭐ 구간을 나눴으면 여기서 안 멈춘다 — 분할선이 바뀌는 것을 «구간»이 이미 다루기 때문이다.
      (x=1138 구간과 x=962 구간이 서로 다른 구간으로 갈라진다) */
if (분할 && 분할.흔들림 && !구간) {
  const 무리 = 분할.흔들림;                  // 굵은 것부터
  const 모두 = 무리.reduce((n, m) => n + m.수, 0);
  console.error(`\n⛔ 2분할 분할선이 파일 «안»에서 바뀝니다 — 한 수로는 옳게 자를 수 없습니다.`);
  console.error(`   ${모두}점을 재서 ${무리.length}가지가 나왔습니다:`);
  for (const m of 무리) {
    console.error(`     x=${String(m.x).padStart(5)}   t ${m.처음.toFixed(1)}~${m.마지막.toFixed(1)}초` +
      `   ${m.수}/${모두}점 (${Math.round((m.수 / 모두) * 100)}%)`);
  }
  const 작은 = 무리.reduce((a, b) => (a.x < b.x ? a : b));
  const 넓은 = 무리.reduce((a, b) => (a.x > b.x ? a : b));
  const 차 = 넓은.x - 작은.x;
  console.error(`   녹화 도중에 왼쪽 코드창 너비가 ${차}px 바뀌었습니다.`);
  console.error(`   한 수로 굳히면 —`);
  console.error(`     넓은 쪽 x=${넓은.x} 로 굳히면  좁은 구간에서 브라우저 «왼쪽» 최대 ${차}px 이 날아갑니다`);
  console.error(`                              (PiP 에는 브라우저가 섞여 들어옵니다).`);
  console.error(`     좁은 쪽 x=${작은.x} 로 굳히면  넓은 구간에서 «코드창 오른쪽»이 최대 ${차}px 잘립니다`);
  console.error(`                              (⛔ 명세의 「PiP 는 코드창을 한 픽셀도 안 자른다」를 깹니다).`);

  /* 어느 것을 권하나 —
     ① 한 무리가 «두 배 넘게» 굵으면 그것이 이 영상의 본 모습이다. 나머지는 몇 초짜리 흠이다
     ② 엇비슷하면 «가장 넓은» 것을 권한다 — 코드창을 자르지 않는 쪽이 명세가 못 박은 규칙이다 */
  const 둘째 = 무리[1] ? 무리[1].수 : 0;
  const 굵은게이긴다 = 무리[0].수 >= 둘째 * 2;
  const 권함 = 굵은게이긴다 ? 무리[0] : 넓은;
  console.error(`\n   고르실 수 있는 길:`);
  console.error(`     ① 마스터를 다시 뽑으실 때 창 너비를 끝까지 고정하신다  ← 가장 깨끗합니다`);
  console.error(`     ② node 영상만들기.mjs "${회차}" --분할선 ${권함.x}   ← 한 수로 못 박는다`);
  console.error(`        ${굵은게이긴다
    ? `(${Math.round((권함.수 / 모두) * 100)}% 를 차지하는 본 모습입니다. 나머지 ${모두 - 권함.수}점 구간만 어긋납니다)`
    : `(가장 넓은 값입니다 — 코드창은 한 픽셀도 안 잘립니다. 대신 브라우저 왼쪽을 잃습니다)`}`);
  console.error(`     ③ node 영상만들기.mjs "${회차}" --분할무시          ← 2분할로 안 보고 통째로 앉힌다 (PiP 없음)\n`);
  console.error(`   ⭐ 마스코트는 «뽑지도 적지도» 않았습니다 (마스코트.txt · _마스코트_최근.json 그대로).\n`);
  process.exit(1);
}

/* ── ⛔ 틀을 «먼저» 읽는다 (2026-09-04 B8) ────────────────────────────────────
   예전엔 왕복본을 만들고 마스코트를 뽑아 «적은 다음»에야 틀을 읽었다. 옛 1080 틀로 구우면
   「왕복본 만듦 해변가.mp4」 뒤에 「옛 틀이라 띠를 안 얹습니다」가 와서, 쓰지도 않은 해변가가
   <회차>/마스코트.txt 와 _마스코트_최근.json 에 «썼다»고 적혔다 — 순번이 어긋났다.
   그래서 틀을 먼저 읽고, «띠를 쓸 판이 있을 때만» 뽑고 적고 왕복본을 만든다. */
const 판목록 = [
  { 판: "16_9", 출력W: 3840, 출력H: 2160, 파일명: "최종_16x9.mp4" },
  { 판: "9_16", 출력W: 2160, 출력H: 3840, 파일명: "최종_9x16.mp4" },
];
for (const p of 판목록) {
  p.틀경로 = path.join(DIR, `${p.판}.png`);
  p.t = 틀읽기(p.틀경로);
  p.k = p.출력W / p.t.W;
  p.띠가능 = p.k === 1 && !p.t.옛틀;
}
const 띠쓸판 = 판목록.filter((p) => p.띠가능);

let 마스코트 = null;
let 왕복본 = null;
const 오른끝 = 제목검사();                 // ⛔ --띠없이 여도 «반드시» 한다 (B2)

if (띠없이) {
  console.log(`마스코트: --띠없이 — 어두운 띠로 굽습니다 (뽑지도 적지도 않습니다)`);
} else if (띠쓸판.length === 0) {
  console.log(`마스코트: 안 씁니다 — ${판목록.map((p) => `${p.판}(${p.t.옛틀 ? "옛 틀 판정" : `틀 ${p.t.W}x${p.t.H}`})`).join(" · ")}`);
  console.log(`        띠를 얹을 수 있는 판이 하나도 없습니다. node 틀그리기.mjs 로 최종 크기 틀을 다시 그리세요.`);
  console.log(`        ⭐ 쓰지 않으므로 «뽑지도 적지도» 않았습니다 (마스코트.txt · _마스코트_최근.json 그대로).`);
} else {
  마스코트 = 마스코트정하기(오른끝);
  console.log(`마스코트: ${마스코트.파일}  — ${마스코트.어디서}`);
  if (마스코트.후보) console.log(`        후보 ${마스코트.후보.length}개 · 뺀 것 ${마스코트.뺀것.join(" ")}`);
  if (띠쓸판.length < 판목록.length) {
    console.log(`        ⚠ ${판목록.filter((p) => !p.띠가능).map((p) => p.판).join(" ")} 판에는 안 얹습니다 (틀이 최종 크기가 아니거나 옛 틀).`);
  }
  // ⛔ -stream_loop -1 «만»으로는 부족하다. 되풀이 이음매가 영상마다 5~7배로 튄다
  try {
    const 왕 = 왕복만들기(마스코트.파일);
    왕복본 = 왕.경로;
  } catch (e) {
    마스코트.되돌리기();                          // 굽지 못하니 «썼다»는 기록도 남기지 않는다
    console.error(`\n⛔ ${e.message}`);
    console.error(`   _마스코트왕복/ 의 그 파일을 지우고 다시 도시거나, --띠없이 로 구우세요.\n`);
    process.exit(1);
  }
}
if (구간) {
  // 구간이 분할선을 구간마다 따로 쥔다 — 여기서 «한 수»를 말하면 거짓말이 된다
  const 둘 = 구간.구간.filter((g) => g.종류 === "2분할");
  console.log(`2분할:  구간마다 다릅니다 — ${둘.length ? 둘.map((g) => `x=${g.x}`).join(" · ") : "2분할 구간 없음"}`);
} else if (분할 && Number.isFinite(분할.x)) {
  console.log(`2분할:  분할선 x=${분할.x}  (원본 ${분할.W}x${분할.H} 의 ${((분할.x / 분할.W) * 100).toFixed(1)}%)` +
              (분할.손지정 ? "  ← --분할선 으로 못 박으심" : ""));
  console.log(`        왼쪽 코드창 ${분할.x}px · 오른쪽 브라우저 ${분할.W - 분할.x}px`);
  if (분할.손지정 && 분할.잰것.length) {
    const xs = [...new Set(분할.잰것.map((s) => s.x))].sort((a, b) => a - b);
    console.log(`        (잰 값: ${xs.join(" · ")})`);
  }
} else {
  console.log(`2분할:  ${분할무시 ? "--분할무시 —" : "아님 —"} 통째로 앉힙니다 (코드창 PiP 는 안 씁니다)`);
}
if (자를초) console.log(`⚠ 시험: 앞 ${길이}초만 굽습니다`);
console.log("");
if (원길이 > 120) console.log(`  ⚠ 2분(120초)을 넘습니다 — ${원길이.toFixed(1)}초. 컷을 더 줄이는 게 좋아요.\n`);

function 자막파일(판) {
  for (const n of [`자막_${판}.ass`, "자막.ass"]) {
    const f = path.join(DIR, n);
    if (existsSync(f)) return f;
  }
  return null;
}

/** .ass 안의 Dialogue 줄 수. 못 읽으면 -1. (2026-09-04 밤 · 신6)
 *  ⛔ 「파일이 있다」와 「자막이 있다」는 다르다. 자막.txt 가 비었거나 # 주석뿐이면
 *     칸이 0개인 .ass 가 나오는데, 예전엔 영상만들기가 파일이 «있다»는 것만 보고
 *     「자막 자막_9_16.ass (최종 크기에서 곧장 굽습니다)」라고 알렸다 —
 *     B6 이 막으려던 «자막 없는 최종본이 조용히 나가는» 일이 «있다고 말하면서» 다시 일어났다. */
function 자막칸수(f) {
  try {
    return (readFileSync(f, "utf8").match(/^Dialogue:/gm) || []).length;
  } catch { return -1; }
}

/* ── 틀의 브라우저 칸이 띠와 맞닿나 (2026-09-04 B5) ───────────────────────────
   명세는 「현님이 손대실 수 있는 것은 브라우저 칸과 PiP 의 자리뿐」이라고 권한다.
   그런데 띠 좌표는 _규격.mjs 에 박혀 있다. 브라우저 칸을 y540 → y760 으로 옮겨 그리시면
   그 사이 220px 이 «아무도 안 그리는 죽은 검은 띠»로 남는데, 예전엔 아무도 말하지 않았다. */
function 죽은띠검사(판, t, k) {
  const g = 규격[판];
  const x = Math.round(t.영상.x * k), y = Math.round(t.영상.y * k);
  const w = Math.round(t.영상.w * k), h = Math.round(t.영상.h * k);

  if (판 === "9_16") {
    const 바라는 = g.띠.y + g.띠.h;                 // 띠 아래끝 = 540
    if (y === 바라는) return;
    if (y > 바라는) {
      console.log(`  ⚠ 브라우저 칸 위끝이 y=${y} 입니다 — 띠 아래끝 ${바라는} 과 ${y - 바라는}px 떨어져 있습니다.`);
      console.log(`     그 ${y - 바라는}px 은 아무도 안 그리는 «죽은 검은 띠»로 남습니다. 칸을 y=${바라는} 에서 시작하게 그리세요.`);
    } else {
      console.log(`  ⚠ 브라우저 칸 위끝이 y=${y} 로 띠(y ${g.띠.y}..${바라는})를 ${바라는 - y}px 파고듭니다 — 마스코트 아래가 영상에 덮여 잘립니다.`);
    }
    if (y + h !== g.H) console.log(`     (칸 아래끝도 y=${y + h} 입니다 — 화면 아래끝 ${g.H} 까지 ${g.H - y - h}px 남습니다.)`);
  } else {
    const 바라는 = g.띠.x;                          // 띠 왼끝 = 2816
    const 오른끝 = x + w;
    if (오른끝 === 바라는) return;
    if (오른끝 < 바라는) {
      console.log(`  ⚠ 브라우저 칸 오른끝이 x=${오른끝} 입니다 — 띠 왼끝 ${바라는} 과 ${바라는 - 오른끝}px 떨어져 있습니다.`);
      console.log(`     그 ${바라는 - 오른끝}px 은 아무도 안 그리는 «죽은 검은 띠»로 남습니다. 칸을 x=0..${바라는} 으로 그리세요.`);
    } else {
      console.log(`  ⚠ 브라우저 칸 오른끝이 x=${오른끝} 로 마스코트 창(x ${바라는}..)을 ${오른끝 - 바라는}px 파고듭니다 — 마스코트 왼쪽이 영상에 덮여 잘립니다.`);
    }
  }
}

function 만들기({ 판, 출력W, 출력H, 파일명, 틀경로, t, k, 띠가능 }) {
  const out = path.join(DIR, 파일명);
  console.log(`${판}.png → ${파일명}`);
  console.log(`  틀        ${t.W} x ${t.H}${t.W === 출력W ? "  ⭐ 최종 크기 (늘림 없음)" : ""}`);
  console.log(`  브라우저 칸 ${t.영상.w} x ${t.영상.h}  (x=${t.영상.x} y=${t.영상.y})  비율 ${(t.영상.w / t.영상.h).toFixed(3)}`);
  if (t.pip) console.log(`  코드창 PiP ${t.pip.w} x ${t.pip.h}  (x=${t.pip.x} y=${t.pip.y})`);
  // 옛 틀·줄여 그린 틀은 좌표가 _규격.mjs 와 아예 다른 셈이다 — 죽은 띠를 따져 봐야 헛말이다
  if (띠가능) 죽은띠검사(판, t, k);

  // ⛔ 틀이 최종 크기가 아니면 배경·제목·마스코트가 늘어난다. 죽이진 않되 반드시 알린다.
  if (k !== 1) {
    console.log(`  ⚠ 틀이 ${t.W}x${t.H} 입니다 — ${출력W}x${출력H} 로 그리면 배경·제목·마스코트가 선명해집니다.`);
    console.log(`     지금은 ${k}배로 늘려 씁니다. (틀그리기.mjs 로 다시 그리세요)`);
  }
  if (t.옛틀) console.log(`  ⚠ 옛 틀 판정으로 자리를 잡았습니다 — 코드창 PiP 는 못 씁니다.`);

  const S = {
    x: 짝수(t.영상.x * k), y: 짝수(t.영상.y * k),
    w: 짝수(t.영상.w * k), h: 짝수(t.영상.h * k),
  };
  const P = t.pip ? {
    x: 짝수(t.pip.x * k), y: 짝수(t.pip.y * k),
    w: 짝수(t.pip.w * k), h: 짝수(t.pip.h * k),
  } : null;

  /* ── 입력 차례를 못 박고 번호를 «변수로» 뺀다 ─────────────────────────────
     ⛔ 옛 코드는 음악을 [2:a] 로 박아 썼다. 마스코트가 3번째 입력으로 끼어들면
        ffmpeg 은 «오류를 한 마디도 안 내고» 마스코트 소리를 음악 대신 섞는다
        (마스코트 mp4 는 11개 전부 aac/44100/2ch 이다). 그래서 번호를 변수로 뺀다.
     ⭐ -framerate 30 — 없으면 이미지 입력이 25fps 라 30fps 촬영본이 솎였다 되채워진다 */
  const 띠쓰나 = Boolean(마스코트 && 왕복본 && k === 1 && !t.옛틀);
  const args = ["-y", "-loop", "1", "-framerate", "30", "-i", 틀경로, "-i", 마스터];
  let 다음 = 2;
  const 띠i = 띠쓰나 ? (args.push("-stream_loop", "-1", "-i", 왕복본), 다음++) : null;
  const 음악i = 음악 ? (args.push("-stream_loop", "-1", "-i", 음악), 다음++) : null;
  if (마스코트 && !띠쓰나) {
    console.log(`  ⚠ ${t.옛틀 ? "옛 틀 판정" : `틀이 ${t.W}x${t.H}`} 이라 이 판에는 마스코트 띠를 안 얹습니다.`);
  }
  if (!마스코트) {
    console.log(`  띠        ${띠없이 ? "--띠없이 — 바탕색 그대로" : "마스코트 없음 — 바탕색 그대로"}`);
  }

  const 사슬 = [];
  //  바탕 — 틀이 이미 최종 크기면 손대지 않는다. ⛔ 옛 코드의 «2배 늘림»이 사라진 자리다
  사슬.push(k === 1 ? `[0:v]null[bg]` : `[0:v]scale=${출력W}:${출력H}:flags=lanczos[bg]`);

  /* ── 마스코트 «영상» 띠 ──────────────────────────────────────────────────
     여기에 두는 이유 셋 (순서마다 다르다)
       ① format=yuv420p «앞»  — 4:2:0 간축이 일어나는 자리다. 뒤에 얹으면 윤곽이 두 번 뭉갠다
       ② 제목 글자 «앞»       — 띠는 배경이다. 뒤에 얹으면 글자를 덮는다
       ③ [bg][main] «앞»      — crop 이 1~2px 어긋나 삐져나와도 뒤따르는 불투명 overlay 가 덮어 준다
     setsar=1 — 1112x834·960x960 을 늘릴 때 SAR 이 딸려 와 overlay 가 어긋나는 것을 막는다 */
  let 바탕 = "[bg]";
  if (띠쓰나) {
    const g = 규격[판];
    const B = 판 === "9_16"
      ? 띠자르기(마스코트.자, g.띠.w, g.띠.h)      // 폭 꽉, 세로만
      : 창자르기(마스코트.자, g.띠.w, g.띠.h);     // 높이 꽉, 가로만
    if (판 === "9_16") {
      사슬.push(`[${띠i}:v]fps=30,scale=${B.scaleW}:${B.scaleH}:flags=lanczos,crop=${B.cropW}:${B.cropH}:${B.cropX}:${B.cropY},setsar=1[band]`);
      console.log(`  마스코트 띠 ${마스코트.자.W}x${마스코트.자.H} → ${B.scaleW}x${B.scaleH} crop y=${B.cropY} (${B.규칙}·머리여백 ${B.머리여백}px)`);
    } else {
      사슬.push(`[${띠i}:v]fps=30,crop=${B.cropW}:${B.cropH}:${B.cropX}:0,scale=${B.scaleW}:${B.scaleH}:flags=lanczos,setsar=1[band]`);
      console.log(`  마스코트 창 crop ${B.cropW}x${B.cropH} x=${B.cropX} (원본 가로의 ${(B.남김 * 100).toFixed(1)}%) → ${B.scaleW}x${B.scaleH} 배율 ${B.배율.toFixed(3)}${B.담나 ? "" : "  ⚠ 캐릭터가 창보다 넓습니다"}`);
    }
    사슬.push(`${바탕}[band]overlay=${g.띠.x}:${g.띠.y}:format=auto[b0]`);
    바탕 = "[b0]";
  }

  /* ── 구간마다 짜임을 갈아 끼운다 (2026-09-04 밤 · 현님 지적) ─────────────────
     구간을 «잘라서(trim) 따로 앉히고 다시 이어(concat)» 붙인다.
       2분할  → 브라우저는 분할선 오른쪽, 코드창은 PiP 로
       그 밖  → 통째로 칸에 채운다. PiP 는 «안 얹는다» ⛔ 여기가 현님이 보신 흠이다

     ⚠ enable= 로 시간을 재는 길도 있지만 그러면 모든 사슬이 모든 프레임을 돈다.
       trim 은 제 구간 프레임만 지나가므로 한 프레임이 «한 번만» 되크기된다.
     ⚠ concat 은 크기·SAR·화소형식이 같아야 한다 → 조각마다 format=yuv444p,setsar=1.
       444 로 두는 까닭은 4:2:0 간축을 마지막 한 번으로 미루기 위해서다. */
  const 구간쓰나 = Boolean(구간 && P && 구간.구간.length > 1);
  const PiP쓰나 = Boolean(P && 분할) && !구간쓰나;

  if (구간쓰나) {
    const gs = 구간.구간, W0 = 구간.W, H0 = 구간.H;
    const 채우기 = `scale=${S.w}:${S.h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${S.w}:${S.h}`;
    /* ⭐ 2026-09-09 현님: 「완성화면의 로고 기준으로 «좌상단에 기준하여» 확대 및 크롭」
     *   가운데를 자르면 로고가 있는 왼쪽이 통째로 날아간다 — 뷰티샵에서 좌우 650px 씩이었다.
     *   그래서 «브라우저 칸»만 0:0 에 붙인다. 통째로 앉히는 길은 가운데 그대로 둔다
     *   (거긴 원본에 클로드 칸이 섞여 있어 왼쪽에 붙이면 클로드가 나온다). */
    const 왼위채우기 = `scale=${S.w}:${S.h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${S.w}:${S.h}:0:0`;
    사슬.push(`[1:v]split=${gs.length}${gs.map((_, i) => `[g${i}]`).join("")}`);

    /* 브라우저 크롬(탭줄·주소창)은 «브라우저가 있는 구간»에서만 잘라낸다.
       코드창 전체화면 구간에는 크롬이 없으므로 자르면 코드창 위가 날아간다. */
    const 잘라낼 = 짝수(크롬.px);
    const 조각 = [];
    let 분할수 = 0;
    gs.forEach((g, i) => {
      const 앞 = `[g${i}]trim=${g.시작.toFixed(3)}:${g.끝.toFixed(3)},setpts=PTS-STARTPTS,format=yuv444p`;
      const 위 = g.종류 === "코드창" ? 0 : 잘라낼;      // 코드창 전체화면엔 크롬이 없다
      if (g.종류 === "2분할" && g.x > 8 && g.x < W0 - 8) {
        const 쪼갠x = 짝수(g.x);
        const 브w = 짝수(W0 - 쪼갠x);
        const 코h = 짝수(Math.min(H0, Math.round((쪼갠x * P.h) / P.w)));
        사슬.push(`${앞},split=2[m${i}][k${i}]`);
        사슬.push(`[m${i}]crop=${브w}:${H0 - 위}:${쪼갠x}:${위},${왼위채우기}[mm${i}]`);
        // 코드창은 «아래쪽»만 쓴다 — 크롬과 무관하다
        사슬.push(`[k${i}]crop=${쪼갠x}:${코h}:0:${H0 - 코h},scale=${P.w}:${P.h}:flags=lanczos[kk${i}]`);
        사슬.push(`[mm${i}][kk${i}]overlay=${P.x - S.x}:${P.y - S.y}:format=auto,setsar=1[p${i}]`);
        분할수++;
      } else if (위 > 0) {
        사슬.push(`${앞},crop=${W0}:${H0 - 위}:0:${위},${채우기},setsar=1[p${i}]`);
      } else {
        사슬.push(`${앞},${채우기},setsar=1[p${i}]`);
      }
      조각.push(`[p${i}]`);
    });
    사슬.push(`${조각.join("")}concat=n=${gs.length}:v=1:a=0[main]`);
    사슬.push(`${바탕}[main]overlay=${S.x}:${S.y}:format=auto[c]`);

    console.log(`  구간별로 ${gs.length}조각을 따로 앉혀 이어 붙입니다 (2분할 ${분할수}조각에만 코드창 PiP)`);
    for (const g of gs) {
      const 짜임 = g.종류 === "2분할" && g.x > 8 && g.x < W0 - 8
        ? `브라우저 ${W0 - 짝수(g.x)}px → ${S.w}x${S.h} · 코드창 PiP (배율 ${(P.w / 짝수(g.x)).toFixed(3)})`
        : `통째로 ${S.w}x${S.h} 에 채움 · PiP 없음`;
      console.log(`     ${g.시작.toFixed(1).padStart(5)}~${g.끝.toFixed(1).padEnd(5)}초  ${g.종류.padEnd(6)}  ${짜임}`);
    }
  } else if (PiP쓰나) {
    // 2분할을 갈라 «따로» 앉힌다. 브라우저는 분할선 오른쪽만 — 그래야 코드창이 절대 안 잘린다.
    const 브w = 분할.W - 분할.x;
    // 코드창은 «아래쪽»만 쓴다 — 새 글이 아래에서 나오므로 지나간 줄만 버린다
    const 코h = 짝수(Math.min(분할.H, Math.round((분할.x * P.h) / P.w)));
    const 위 = 짝수(크롬.px);                          // 브라우저 크롬. 세로판(P 있음)에서만 온다
    사슬.push(`[1:v]split=2[a][b]`);
    /* 로고 기준 «좌상단» — 2026-09-09 현님 지시. crop 끝의 0:0 이 그것이다 (기본은 가운데) */
    사슬.push(`[a]crop=${브w}:${분할.H - 위}:${분할.x}:${위},scale=${S.w}:${S.h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${S.w}:${S.h}:0:0[main]`);
    사슬.push(`[b]crop=${짝수(분할.x)}:${코h}:0:${분할.H - 코h},scale=${P.w}:${P.h}:flags=lanczos[pip]`);
    사슬.push(`${바탕}[main]overlay=${S.x}:${S.y}:format=auto[t1]`);
    사슬.push(`[t1][pip]overlay=${P.x}:${P.y}:format=auto[c]`);
    console.log(`  브라우저   ${브w}x${분할.H - 위} → ${S.w}x${S.h}   (배율 ${(S.h / (분할.H - 위)).toFixed(3)}${위 ? ` · 크롬 ${위}px 잘라냄` : ""})`);
    console.log(`  코드창     ${분할.x}x${코h} → ${P.w}x${P.h}   (배율 ${(P.w / 분할.x).toFixed(3)}, 가로 100% 온전)`);
  } else {
    // 2분할이 아니거나 PiP 자리가 없다 — 통째로 칸에 채운다. PiP 네모는 영상이 덮어 가린다.
    // ⛔ 가로판(P 없음)에는 크롬을 안 자른다 — 배율 1.000 이 깨지고 왼쪽 코드창 위도 같이 잘린다
    const 위 = P ? 짝수(크롬.px) : 0;
    const 앞 = 위 > 0 ? `[1:v]crop=iw:ih-${위}:0:${위},` : `[1:v]`;
    사슬.push(`${앞}scale=${S.w}:${S.h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${S.w}:${S.h}[main]`);
    사슬.push(`${바탕}[main]overlay=${S.x}:${S.y}:format=auto[c]`);
    if (위 > 0) console.log(`  브라우저   통째로 → ${S.w}x${S.h}  (크롬 ${위}px 잘라냄)`);
  }

  //  제목 — ⛔ 틀 PNG 에 굽지 않는다. 띠가 영상이 되면서 PNG 에 구운 글자는 영상이 덮어 지운다.
  //  띠 «뒤», 자막 «앞». 최종 크기에서 벡터로 구워 더 선명하다
  const 제목길 = path.join(DIR, `제목_${판}.ass`);
  if (existsSync(제목길)) {
    사슬.push(`[c]ass=f=${q(제목길)}:fontsdir=${q(폰트방)}[p]`);
    console.log(`  제목      ${path.basename(제목길)}`);
  } else {
    사슬.push(`[c]null[p]`);
    console.log(`  제목      없음 (틀그리기.mjs 로 제목_${판}.ass 를 만드세요)`);
  }

  //  자막 — ⛔ overlay «뒤», format=yuv420p «앞». 앞에 넣으면 영상이 덮어 한 글자도 안 보인다
  const ass = 자막파일(판);
  if (ass) {
    사슬.push(`[p]ass=f=${q(ass)}:fontsdir=${q(폰트방)}[s]`);
    const 칸수 = 자막칸수(ass);
    if (칸수 === 0) {
      // 신6 — 파일은 있는데 칸이 0개다. 「있다」고만 말하면 자막 없는 최종본이 조용히 나간다
      console.log(`  자막      ⚠ ${path.basename(ass)} 는 있는데 «칸이 0개»입니다 — 한 글자도 안 나옵니다.`);
      console.log(`            <회차>/자막.txt 에 대본을 쓰고  node 자막굽기.mjs "${회차}"  를 다시 도세요.`);
    } else {
      console.log(`  자막      ${path.basename(ass)}  ${칸수 > 0 ? `${칸수}칸  ` : ""}(최종 크기에서 곧장 굽습니다)`);
    }
  } else {
    사슬.push(`[p]null[s]`);
    // B6 — 예전엔 여기가 «한 마디도» 안 했다. 자막굽기를 잊고 구우면 자막 없는 최종본이
    //      조용히 나갔다(제목 쪽은 말하는데 자막만 침묵했다).
    const 대본 = existsSync(path.join(DIR, "자막.txt"));
    console.log(`  자막      없음 — 자막_${판}.ass 도 자막.ass 도 없습니다. 자막 없이 굽습니다.`);
    console.log(`            ${대본 ? `자막.txt 는 있습니다 →  node 자막굽기.mjs "${회차}"  로 .ass 를 만든 뒤 다시 구우세요.`
                                     : `자막을 넣으시려면 <회차>/자막.txt 를 쓰고  node 자막굽기.mjs "${회차}"  를 도세요.`}`);
  }
  사슬.push(`[s]format=yuv420p[out]`);              // ⛔ 여기에 scale 이 없다

  let amap = [];
  if (음악 && 소리있음) {
    사슬.push(`[${음악i}:a]volume=0.12,afade=t=out:st=${Math.max(0, 길이 - 2).toFixed(2)}:d=2[m]`);
    // ⭐ normalize=0 — 기본값이면 입력이 둘이라 «말소리까지» −6dB 로 깎인다
    사슬.push(`[1:a][m]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[a]`);
    amap = ["-map", "[a]"];
  } else if (음악) {
    사슬.push(`[${음악i}:a]volume=0.5,afade=t=out:st=${Math.max(0, 길이 - 2).toFixed(2)}:d=2[a]`);
    amap = ["-map", "[a]"];
  } else if (소리있음) {
    amap = ["-map", "1:a"];
  }

  args.push(
    "-filter_complex", 사슬.join(";"),
    "-map", "[out]",
    ...amap,
    "-t", String(길이),
    "-c:v", "libx264",
    "-preset", 빠르게 ? "veryfast" : "slow",
    "-crf", 빠르게 ? "20" : "17",
    ...(빠르게 ? [] : ["-x264-params", "aq-mode=3"]),
    "-pix_fmt", "yuv420p",
    // ⭐ -fps_mode cfr — 마스코트(30fps 왕복본)와 마스터가 섞여도 프레임이 늘 정확히 길이×30
    "-r", "30", "-fps_mode", "cfr",
    ...(amap.length ? ["-c:a", "aac", "-b:a", "192k"] : []),
    "-movflags", "+faststart",
    out,
  );

  ff(args);
  const size = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=size", "-of", "csv=p=0", out], { encoding: "utf8" }).stdout.trim();
  console.log(`  ✔ ${(Number(size) / 1048576).toFixed(1)}MB\n`);
}

for (const p of 판목록) 만들기(p);           // 틀은 위에서 «이미» 읽었다 (B8)

console.log(`완료 → ${회차}`);
console.log("  최종_16x9.mp4  유튜브 롱폼 · 홈페이지 임베드");
console.log("  최종_9x16.mp4  쇼츠 · 릴스");
if (마스코트) console.log(`  마스코트  ${마스코트.파일}  (다시 구워도 <회차>/마스코트.txt 덕에 같은 것이 나옵니다)`);
console.log("\n제목을 고치려면: node 틀그리기.mjs \"" + 회차 + "\" --제목 \"첫 줄|둘째 줄\"");
console.log("자막을 얹으려면: node 자막굽기.mjs \"" + 회차 + "\"  → 자막_9_16.ass 를 만든 뒤 다시 굽습니다.");
