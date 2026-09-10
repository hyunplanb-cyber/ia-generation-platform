// ═══════════════════════════════════════════════════════════════════════════
//  마스코트 «움직이는 영상» — 자리 장부 · 자리 셈 · 왕복본 캐시   (2026-09-04)
//
//  SNS 상단 마스코트는 정지 그림(mascot.png)이 아니라
//    _이미지/마스코트/영상/*.mp4   (10초 · 1280x720 · 24fps · 11개)
//  이다. 가이드 영상(이분할영상가이드.mp4)의 제목 띠도 온천.mp4 를 잘라 쓴 것이다.
//
//  ⛔ 주간 카드 파이프라인(_작업/영상굽기.mjs)의 _편별.json · _최근.json 은
//     «읽기만» 한다. 여기에 릴스 편 이름을 써 넣으면 주간 커버 마스코트 배정이 망가진다.
// ═══════════════════════════════════════════════════════════════════════════

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, mkdirSync, statSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const 여기 = path.dirname(fileURLToPath(import.meta.url));

/** 릴스영상 폴더. cwd 에 기대지 않는다 — 다른 폴더에서 불러도 안 어긋난다. */
export const 릴스방 = 여기;

/** 마스코트 «움직이는 영상»이 사는 곳. */
export const 마스코트방 = path.resolve(여기, "../../_이미지/마스코트/영상");

/** 왕복본 캐시. 영상당 한 번만 만든다(0.8초). */
export const 왕복방 = path.join(여기, "_마스코트왕복");

/* ── 자리 장부 ──────────────────────────────────────────────────────────── */

export const 자리길 = path.join(여기, "_마스코트자리.json");

/* ⛔ 장부를 «최상위에서» 읽지 않는다. (2026-09-04 밤 · 신3)
 *
 *  예전엔 여기서 곧장 readFileSync 했다. 그래서 _마스코트자리.json 이 없으면
 *  이 파일을 «정적으로» import 하는 영상만들기.mjs · _고르기.mjs 가 한 줄도 못 찍고
 *  ENOENT 스택 추적으로 죽었다 — 마스코트가 아예 필요 없는 --띠없이 길에서도 그랬다.
 *  (틀그리기.mjs 는 try 안에서 동적으로 부르니 「⚠ 장부를 못 읽었습니다」로 곱게 넘어가
 *   「--띠없이 로 구우세요」를 권했는데, 그 권한 명령이 죽었다.)
 *
 *  _규격.mjs 6줄이 못 박은 「⛔ 최상위에서 아무것도 실행하지 않는다」와도 어긋났다.
 *  이제 «쓸 때» 읽고 캐시한다. 못 읽으면 빈 표 + 까닭을 남긴다 — 던지지 않는다. */
let _자리캐시 = null;
let _자리흠 = null;

/** 캐릭터 자리 표 — 모두 «원본 폭·높이에 대한 비율». 못 읽으면 빈 표 {}. */
export function 자리표() {
  if (_자리캐시) return _자리캐시;
  try {
    const j = JSON.parse(readFileSync(자리길, "utf8"));
    delete j._읽어보세요;
    _자리캐시 = j;
    _자리흠 = null;
  } catch (e) {
    _자리캐시 = {};
    _자리흠 = e.code === "ENOENT"
      ? `자리표가 없습니다: ${자리길}`
      : `자리표를 못 읽었습니다 (${e.code || "글이 깨졌나?"}): ${자리길}`;
  }
  return _자리캐시;
}

/** 자리표를 못 읽었으면 그 까닭, 잘 읽었으면 null. 쓰는 쪽이 «말로» 알린다. */
export function 자리표흠() {
  자리표();
  return _자리흠;
}

/** 표에 없는 새 영상을 위한 되돌이 — 11개의 가운뎃값.
 *  ⚠ 이 값으로 조용히 넘어가지 않는다. 쓰는 쪽이 «재서 표에 적으세요» 경고를 낸다. */
export const 되돌이 = { W: 1280, H: 720, x0: 0.680, x1: 0.900, 머리: 0.255, 얼굴: 0.470, 띠쓰나: true };

const 짝수 = (v) => Math.round(v / 2) * 2;
/** ⛔ «내림» 짝수. 자를 자리를 가둔 뒤에는 이것만 쓴다 — 짝수() 는 올라갈 수 있어
 *     cropX + cropW 가 원본 폭을 넘긴다 (2026-09-04 밤 · G1/신5). */
const 짝수내림 = (v) => Math.floor(v / 2) * 2;
const 조임 = (v, a, b) => Math.max(a, Math.min(b, v));

/** 파일 이름 → 자리. 표에 없으면 되돌이와 «표에 없다» 표시를 함께 준다. */
export function 자리찾기(파일) {
  const 있는것 = 자리표()[파일];
  if (있는것) return { ...있는것, 잰것: true };
  return { ...되돌이, 잰것: false };
}

/** 마스코트 영상 목록. _워터마크있음/ · 누끼/ 는 하위 폴더라 저절로 빠진다.
 *
 *  ⛔ 폴더가 없어도 «던지지 않는다» — 빈 목록을 준다. (2026-09-04)
 *     예전엔 readdirSync 가 ENOENT 를 그대로 던져, 마스코트가 하나도 필요 없는
 *     «틀 PNG 그리기»까지 통째로 죽었다. 없다는 사실은 쓰는 쪽이 말로 알린다. */
export function 있는영상() {
  try {
    return readdirSync(마스코트방).filter((f) => /\.(mp4|mov|webm)$/i.test(f)).sort();
  } catch {
    return [];
  }
}

/** 마스코트 폴더가 있나. 「하나도 없다」와 「폴더째 없다」를 갈라 말하려고 쓴다. */
export function 마스코트방있나() {
  return existsSync(마스코트방);
}

/* ── 실측 ───────────────────────────────────────────────────────────────────
 *  ⛔ _마스코트자리.json 의 W·H 를 믿지 말고 «파일을 열어» 잰다. (2026-09-04)
 *     표는 1280x720 인데 현님이 1080x1920 으로 다시 내보내 같은 이름으로 덮으시면,
 *     띠자르기·창자르기의 셈이 통째로 어긋나 콘솔은 태연한데 띠에 캐릭터가 없다
 *     (바위와 김만 나온다). 쓰는 쪽이 이 값과 표를 대 보고 멈춘다.
 * ──────────────────────────────────────────────────────────────────────── */

/** 영상 파일 하나를 열어 { W, H, 초 }. 못 읽으면 null. */
export function 재보기(파일길) {
  if (!existsSync(파일길)) return null;
  const r = spawnSync("ffprobe", [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height:format=duration",
    "-of", "default=nw=1:nk=1", 파일길,
  ], { encoding: "utf8" });
  if (r.status !== 0) return null;
  const [w, h, d] = String(r.stdout).trim().split(/\r?\n/).map(Number);
  if (!(w > 0) || !(h > 0)) return null;
  return { W: w, H: h, 초: Number.isFinite(d) ? d : 0 };
}

/** 마스코트 «원본»의 실측 { W, H, 초 }. 없거나 못 읽으면 던진다. */
export function 실측(파일) {
  const 원본 = path.join(마스코트방, 파일);
  if (!existsSync(원본)) throw new Error(`마스코트 영상이 없습니다: ${원본}`);
  const m = 재보기(원본);
  if (!m) throw new Error(`마스코트 영상을 못 읽었습니다 (깨진 파일?): ${원본}`);
  return m;
}

/* ── 세로판 띠 자르기 ────────────────────────────────────────────────────────
 *  「폭 꽉, 세로만」. 가이드(이분할영상가이드.mp4)가 한 그대로다.
 *  자르는 자리 = 「머리 꼭대기를 띠 위끝에서 창 높이의 3% 아래에 둔다」 = 여백 16px.
 *  ⭐ 이 규칙을 온천에 대면 cy = 248 — 가이드를 화소로 재서 나온 값과 정확히 같다.
 * ──────────────────────────────────────────────────────────────────────── */
export function 띠자르기(자, 띠w, 띠h) {
  const { W, H } = 자;
  const 배율 = 띠w / W;                        // 폭 맞춤. 세로 왜곡 없음
  const 창h = Math.min(H, 띠h / 배율);         // 띠 높이를 원본 화소로 환산
  let y = 자.머리 * H - 0.03 * 창h;            // ① 머리 기준 (가이드 규칙)
  let 규칙 = "머리";
  if (자.얼굴 * H - y > 0.85 * 창h) {          // ② 얼굴이 띠 밖으로 밀려나면 얼굴로 다시 잡는다
    y = 자.얼굴 * H - 0.60 * 창h;
    규칙 = "얼굴";
  }
  y = 조임(y, 0, H - 창h);
  /* ⛔ 짝수 보정을 «가둔 뒤에» 따로 하면 가둔 약속이 깨진다 (G1/신5 와 같은 흠).
   *   scaleH 도 cropY 도 짝수()로 «올라갈 수» 있어, 둘이 같이 오르면 cropY + cropH 가
   *   scaleH 를 넘는다. 지금 11개는 다 안 넘지만(가장 아슬한 야근 746+540 ≤ 2160),
   *   표에 세로가 딱 맞는 소재가 들어오면 넘는다.
   *   ⚠ 반올림 자체는 그대로 둔다 — 여기서 «내림»으로 바꾸면 온천이 248 → 246 이 되어
   *     가이드를 화소로 재서 맞춘 값(cy 248)이 어긋난다. 넘칠 때«만» 당긴다. */
  const scaleH = 짝수(Math.round(H * 배율));
  const cropH = 짝수(띠h);
  const cropY = Math.min(짝수(Math.round(y * 배율)), 짝수내림(Math.max(0, scaleH - cropH)));
  return {
    scaleW: 짝수(띠w),
    scaleH,
    cropW: 짝수(띠w), cropH,
    cropX: 0, cropY,
    배율, 규칙,
    머리여백: Math.round((자.머리 * H - y) * 배율),   // 띠 위끝에서 머리까지 (최종 화소)
    캐릭터왼끝: Math.round(자.x0 * 띠w),               // 제목 글자가 넘으면 안 되는 선
  };
}

/* ── 가로판 창 자르기 ────────────────────────────────────────────────────────
 *  「높이 꽉, 가로만」. 자르는 자리는 캐릭터 상자의 «가운데».
 *  ⛔ 「오른쪽 정렬」을 쓰지 마라 — _작업/영상굽기.mjs 720줄의 그 수는 창 비율 0.865 일 때
 *     이야기다. 우리 창은 0.632 라 쇼파수다·야근은 캐릭터가 통째로 사라진다.
 * ──────────────────────────────────────────────────────────────────────── */
export function 창자르기(자, 창w, 창h) {
  const { W, H } = 자;
  const cw = Math.min(W, Math.round((H * 창w) / 창h));   // 창 비율에 맞는 원본 폭
  const 몸w = (자.x1 - 자.x0) * W;
  const 담나 = cw >= 몸w;
  let x = Math.round(((자.x0 + 자.x1) / 2) * W - cw / 2);
  if (담나) {                                   // 상자가 창보다 좁으면 캐릭터가 창 밖으로 못 나가게 민다
    if (자.x0 * W < x) x = Math.floor(자.x0 * W);
    if (자.x1 * W > x + cw) x = Math.ceil(자.x1 * W - cw);
  }
  x = 조임(x, 0, W - cw);
  /* ⛔ cropX 를 «cropW 가 정해진 뒤에» 다시 가둔다. (2026-09-04 밤 · G1/신5)
   *   예전엔 조임(x, 0, W−cw) 로 가둔 «뒤»에 cropW·cropX 를 따로 짝수() 로 반올림해서,
   *   둘이 같이 오르면 가둔 약속이 깨졌다 — 설명중·스트레칭(cw 455, 상한 825)이
   *   826 + 456 = 1282 로 원본 폭 1280 을 2px 넘었다. ffmpeg 은 경고 한 마디 없이
   *   x 를 824 로 당겨 잘랐다(-v verbose 로도 침묵). 코드가 스스로 어긋난 값을 만들고
   *   ffmpeg 의 자비에 기댄 자리였다.
   *   ⭐ 이제 코드가 824 를 «직접» 낸다 — ffmpeg 이 하던 그대로라 나오는 그림은 안 바뀐다. */
  const cropW = Math.min(짝수(cw), 짝수내림(W));
  const cropX = Math.min(짝수(x), 짝수내림(W - cropW));   // 넘칠 때«만» 당긴다
  return {
    cropW, cropH: 짝수내림(H), cropX,
    scaleW: 짝수(창w), scaleH: 짝수(창h),
    배율: 창w / cw, 남김: cw / W, 담나, 필요폭: Math.round(몸w),
  };
}

/* ── 왕복본 ─────────────────────────────────────────────────────────────────
 *  ⛔ `-stream_loop -1` «만»으로는 부족하다. 되풀이 이음매가 영상마다 다르다 —
 *     해변가 6.99 · 설명중 3.92 · 강가 3.37 로 평범한 프레임 차의 5~7배로 «툭» 튄다.
 *     (가이드가 쓴 온천은 1.43 로 가장 조용해서 「안 튄다」는 착각을 준다)
 *     앞→뒤→앞 왕복(ping-pong)으로 이으면 해변가 6.99 → 0.50 으로 내려앉는다.
 *
 *  · 만드는 데 0.78~0.84초. 영상당 «한 번»만 만들고 캐시한다.
 *  · fps=30 을 concat «앞»에 둔다 — 24fps 두 토막의 pts 가 어긋나지 않게.
 *  · reverse 는 영상을 통째로 메모리에 올린다. 그래서 마스코트를 8~12초로 받는다
 *    (읽어보세요.md 10줄과 같은 이유). 굽기마다 하지 않고 캐시하는 이유이기도 하다.
 *  · -an — 소리를 뺀다. 마스코트 mp4 는 11개 전부 aac/44100/2ch 이라, 남겨 두면
 *    사슬의 [2:a] 가 «해결되어» 배경음악 대신 마스코트 소리가 섞이는 조용한 사고가 난다.
 *
 *  ⛔ 캐시는 «있다·싱싱하다»만으로 믿지 않는다. (2026-09-04)
 *     굽는 중에 Ctrl-C 하면 반만 써진 토막이 남는데, 원본이 8월이라 mtime 은 늘 싱싱하다.
 *     ① 그 뒤 모든 굽기가 「Invalid data found」로 죽거나
 *     ② 더 나쁘게, 토막이 «읽히는» 길이면 조용히 짧은 띠가 구워진다.
 *     그래서 ⓐ 임시이름에 만들고 rename 하고 ⓑ 쓰기 전에 ffprobe 로 W·H·길이를 잰다.
 * ──────────────────────────────────────────────────────────────────────── */

/** 왕복본이 성한가 — 원본의 «두 배 길이»이고 크기가 같아야 한다. */
function 왕복성한가(길, 원 /* {W,H,초} */) {
  const m = 재보기(길);
  if (!m) return { 성하다: false, 왜: "못 읽습니다 (반만 써진 토막?)" };
  if (m.W !== 원.W || m.H !== 원.H) return { 성하다: false, 왜: `크기가 ${m.W}x${m.H} — 원본은 ${원.W}x${원.H}`, 잰것: m };
  const 바라는 = 원.초 * 2;
  if (원.초 > 0 && Math.abs(m.초 - 바라는) > 0.6) {
    return { 성하다: false, 왜: `길이가 ${m.초.toFixed(2)}초 — 왕복본은 ${바라는.toFixed(2)}초여야 합니다`, 잰것: m };
  }
  return { 성하다: true, 잰것: m };
}

/** 왕복본을 만들어(또는 캐시를 확인해) { 경로, W, H, 초, 원본초, 새로만듦 } 를 준다.
 *  ⭐ W·H 는 «파일에서 잰» 값이다 — 쓰는 쪽이 _마스코트자리.json 과 대 볼 수 있게. */
export function 왕복만들기(파일, { 조용히 = false } = {}) {
  const 원본 = path.join(마스코트방, 파일);
  const 원 = 실측(파일);                       // 여기서 파일을 이미 연다
  mkdirSync(왕복방, { recursive: true });
  const 나올것 = path.join(왕복방, 파일.replace(/\.[^.]+$/, "") + ".mp4");
  const 준다 = (m, 새로만듦) => ({ 경로: 나올것, W: 원.W, H: 원.H, 초: m ? m.초 : 0, 원본초: 원.초, 새로만듦 });

  // Ctrl-C 로 죽으면 뒷정리를 못 한다 — 10분 넘게 남은 임시 토막은 쓸어 낸다.
  try {
    for (const f of readdirSync(왕복방)) {
      if (!f.startsWith(".tmp_")) continue;
      const 길 = path.join(왕복방, f);
      if (Date.now() - statSync(길).mtimeMs > 10 * 60 * 1000) rmSync(길, { force: true });
    }
  } catch { /* 못 쓸어도 굽기는 계속한다 */ }

  if (existsSync(나올것) && statSync(나올것).mtimeMs >= statSync(원본).mtimeMs) {
    const c = 왕복성한가(나올것, 원);
    if (c.성하다) return 준다(c.잰것, false);
    console.log(`  ⚠ 왕복본 캐시가 성하지 않아 다시 만듭니다 — ${path.basename(나올것)}: ${c.왜}`);
  }

  const t = Date.now();
  // ⭐ 임시이름 → rename. 도중에 끊겨도 «반만 써진 캐시»가 남지 않는다
  const 임시 = path.join(왕복방, `.tmp_${process.pid}_${파일.replace(/\.[^.]+$/, "")}.mp4`);
  const 치우기 = () => { try { rmSync(임시, { force: true }); } catch { /* 그냥 둔다 */ } };
  const r = spawnSync("ffmpeg", [
    "-y", "-v", "error", "-i", 원본,
    "-filter_complex", "[0:v]fps=30,split=2[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]",
    "-map", "[v]", "-an", "-r", "30", "-fps_mode", "cfr",
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-pix_fmt", "yuv420p",
    임시,
  ], { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
  if (r.status !== 0) {
    console.error(r.stderr?.slice(-1500));
    치우기();
    throw new Error(`왕복본을 못 만들었습니다: ${파일}`);
  }
  const c = 왕복성한가(임시, 원);
  if (!c.성하다) {
    치우기();
    throw new Error(`왕복본이 성하지 않습니다: ${파일} — ${c.왜}`);
  }
  renameSync(임시, 나올것);
  if (!조용히) console.log(`  왕복본 만듦  ${파일}  ${원.W}x${원.H} ${c.잰것.초.toFixed(2)}초  (${((Date.now() - t) / 1000).toFixed(2)}초)`);
  return 준다(c.잰것, true);
}
