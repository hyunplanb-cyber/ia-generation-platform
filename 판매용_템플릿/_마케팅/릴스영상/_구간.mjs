/* 녹화본이 «언제 2분할이고 언제 아닌지» 를 재서 구간으로 묶는다.   (2026-09-04 밤)
 *
 * ⛔ 왜 필요한가 — 현님 지적으로 찾았다.
 *   「이 중간에 검은화면이 다른 걸로 바뀌는데 이런건 알맞게 컷이 불가능한가?」
 *
 *   우리 녹화본은 «영상 내내 2분할»이 아니다. 대개 이렇게 흐른다.
 *     ① 클로드 코드 전체화면 → ② 2분할 → ③ 브라우저 전체화면
 *   그런데 굽는 쪽은 분할선 «한 수»를 정해 처음부터 끝까지 같은 자리를 잘라 썼다.
 *   그래서 ③ 구간에서는 코드창 PiP 자리에 «브라우저 왼쪽 조각»이 확대돼 들어갔다.
 *   실측(2. 완성화면_LMS_디럭스_1분.mp4, 62.3초):
 *     0.2~ 7.2초  코드창 전체화면  (12%)
 *     7.7~23.0초  2분할 x=1138     (25%)
 *    23.5~27.2초  2분할 x=962      ( 7%)  ← 녹화 도중 터미널 폭을 줄이셨다
 *    27.7~62.2초  브라우저 전체화면 (56%)
 *
 * 판정은 «열 평균 밝기» 하나로 한다 — 왼쪽이 어둡고(코드창) 오른쪽이 밝으면(브라우저) 2분할.
 * ⚠ 자동검출을 못 믿을 자리에서는 --한수 · --분할선 · --분할무시 로 사람이 이긴다.
 */
import { spawnSync } from "node:child_process";

/** 한 프레임을 판정한다 → { 종류: "2분할"|"코드창"|"브라우저"|"섞임", x } */
function 한장(파일, t, W, H, w, h) {
  const r = spawnSync("ffmpeg", ["-v", "error", "-ss", t.toFixed(2), "-i", 파일, "-frames:v", "1",
    "-vf", `scale=${w}:${h}`, "-f", "rawvideo", "-pix_fmt", "gray", "-"], { maxBuffer: 1 << 26 });
  const b = r.stdout;
  if (!b || b.length < w * h) return null;

  const 열 = new Float64Array(w);
  for (let x = 0; x < w; x++) { let s = 0; for (let y = 0; y < h; y++) s += b[y * w + x]; 열[x] = s / h; }
  const 전체 = 열.reduce((a, v) => a + v, 0) / w;

  const k = Math.max(2, Math.round(w * 0.03));
  let 최고 = 0, bx = -1;
  for (let x = Math.round(w * 0.25); x < Math.round(w * 0.55); x++) {
    let 왼 = 0, 오 = 0;
    for (let i = 1; i <= k; i++) { 왼 += 열[x - i]; 오 += 열[x + i]; }
    const 오름 = (오 - 왼) / k;
    if (오름 > 최고) { 최고 = 오름; bx = x; }
  }

  if (최고 > 40 && bx > 0) {
    let 왼합 = 0; for (let x = 0; x < bx; x++) 왼합 += 열[x];
    let 오합 = 0; for (let x = bx; x < w; x++) 오합 += 열[x];
    // 왼쪽은 «어두운 코드창», 오른쪽은 «밝은 브라우저» 여야 진짜 2분할이다
    if (왼합 / bx < 90 && 오합 / (w - bx) > 140) return { 종류: "2분할", x: Math.round((bx * W) / w) };
  }
  if (전체 < 80) return { 종류: "코드창", x: 0 };
  if (전체 > 150) return { 종류: "브라우저", x: 0 };
  return { 종류: "섞임", x: 0 };
}

/**
 * @returns {{W:number,H:number,점수:number,구간:Array<{시작:number,끝:number,종류:string,x:number}>}|null}
 *   구간의 시작·끝은 «영상 시각»이고 서로 맞닿는다 (첫 구간 시작 0, 끝 구간 끝 = 길이).
 */
export function 구간찾기(파일, 길이, { 간격 = 0.5, 흔들림 = 40 } = {}) {
  const p = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height", "-of", "csv=p=0", 파일], { encoding: "utf8" }).stdout.trim();
  const [W, H] = p.split(",").map(Number);
  if (!Number.isFinite(W) || !Number.isFinite(H) || W < 8 || H < 8) return null;

  const w = 240, h = Math.max(2, Math.round((H / W) * w));
  const 점 = [];
  for (let t = Math.min(0.2, 길이 / 20); t < 길이 - 0.05; t += 간격) {
    const v = 한장(파일, t, W, H, w, h);
    if (v) 점.push({ t: +t.toFixed(2), ...v });
  }
  if (점.length < 3) return null;

  // 1점짜리 튐은 앞뒤가 같으면 흡수한다 (전환 프레임이 «섞임»으로 잡히는 것을 막는다)
  for (let i = 1; i < 점.length - 1; i++) {
    if (점[i].종류 !== 점[i - 1].종류 && 점[i - 1].종류 === 점[i + 1].종류) {
      점[i].종류 = 점[i - 1].종류; 점[i].x = 점[i - 1].x;
    }
  }

  // 같은 종류끼리 묶되, 2분할은 «분할선이 크게 바뀌면» 거기서 또 자른다
  const 묶음 = [];
  for (const s of 점) {
    const 끝 = 묶음[묶음.length - 1];
    const 이어짐 = 끝 && 끝.종류 === s.종류 &&
      (s.종류 !== "2분할" || Math.abs(s.x - 끝.xs[끝.xs.length - 1]) <= 흔들림);
    if (이어짐) { 끝.끝 = s.t; 끝.xs.push(s.x); }
    else 묶음.push({ 종류: s.종류, 시작: s.t, 끝: s.t, xs: [s.x] });
  }

  // 아주 짧은 구간(2점 미만)은 앞 구간에 흡수한다 — 컷마다 짜임이 바뀌면 산만하다
  const 걸러낸 = [];
  for (const g of 묶음) {
    const 앞 = 걸러낸[걸러낸.length - 1];
    if (앞 && g.xs.length < 2) { 앞.끝 = g.끝; continue; }
    걸러낸.push(g);
  }

  // 경계를 «두 점 사이 한가운데»로 옮기고, 처음과 끝을 영상에 맞춘다
  const 구간 = 걸러낸.map((g) => {
    const xs = g.xs.filter((v) => v > 0).sort((a, b) => a - b);
    return {
      시작: g.시작, 끝: g.끝, 종류: g.종류,
      x: xs.length ? xs[Math.floor(xs.length / 2)] : 0,
    };
  });
  for (let i = 0; i < 구간.length - 1; i++) {
    const 가운데 = +(((구간[i].끝 + 구간[i + 1].시작) / 2)).toFixed(3);
    구간[i].끝 = 가운데; 구간[i + 1].시작 = 가운데;
  }
  구간[0].시작 = 0;
  구간[구간.length - 1].끝 = 길이;

  return { W, H, 점수: 점.length, 구간 };
}

/* ── 브라우저 «크롬»(창틀 + 탭줄 + 주소창) 재기 ─────────────────────────────
 *   현님: 「위에 이부분도 안보이도록 하고 싶은데」
 *
 *   릴스에 로컬 경로(D:/_가이드용_2/…)가 그대로 나가는 것도 좋지 않다.
 *   화면 위에서부터 «어두운 띠»(창틀·탭줄·주소창)가 끝나고 «밝은 페이지»가 시작하는 줄을 찾는다.
 *
 *   실측 — 어느 녹화본이나 194~219px 로 비슷하다 (창을 늘 같은 자리에 띄우시기 때문이다)
 *     새틀시험 218 · 공구 194 · 뷰티샵 219 · 인테리어 193
 *   ⚠ 무료샘플은 110·253 으로 흔들렸다 — 그래서 여러 점을 재서 «가운뎃값»을 쓰고,
 *     너무 흩어지면 그렇다고 알린 뒤 안 자른다. 조용히 엉뚱한 데를 자르는 것이 제일 나쁘다.
 */
function 크롬한장(파일, t, 왼, 폭) {
  const r = spawnSync("ffmpeg", ["-v", "error", "-ss", t.toFixed(2), "-i", 파일, "-frames:v", "1",
    "-vf", `crop=${폭}:400:${왼}:0,scale=80:400`, "-f", "rawvideo", "-pix_fmt", "gray", "-"],
    { maxBuffer: 1 << 24 });
  const b = r.stdout;
  if (!b || b.length < 80 * 400) return -1;
  const 줄 = new Float64Array(400);
  for (let y = 0; y < 400; y++) { let s = 0; for (let x = 0; x < 80; x++) s += b[y * 80 + x]; 줄[y] = s / 80; }
  // 위 8줄은 건너뛴다(창 그림자). «밝음이 20줄 이어지는» 첫 자리가 페이지 시작이다
  for (let y = 8; y < 380; y++) {
    if (줄[y] < 170) continue;
    let 다밝나 = true;
    for (let i = 0; i < 20; i++) if (줄[y + i] < 170) { 다밝나 = false; break; }
    if (다밝나) return y;
  }
  return -1;
}

/**
 * @param 자리 [{t, 왼, 폭}] — 브라우저가 있는 시각과 그 x 범위
 * @returns {{px:number, 잰것:number[], 흔들림:number, 믿나:boolean}}
 */
export function 크롬재기(파일, 자리) {
  /* ⛔ 60px 아래는 «크롬이 아니다» 로 본다 — 그냥 두는 것이 맞다.
     `1. 팩생성_펫유치원.mp4` 는 전체화면으로 찍어 탭줄·주소창이 «아예 없고»
     y 0~50 의 어두운 띠는 우리 사이트의 «제 헤더»다. 그걸 잘라내면 손님 화면을 깎는다.
     실제 크롬은 193~219px 이라 60px 문턱에 걸릴 일이 없다. */
  const vs = 자리.map(({ t, 왼, 폭 }) => 크롬한장(파일, t, 왼, 폭)).filter((v) => v > 60 && v < 400);
  if (vs.length < 2) return { px: 0, 잰것: vs, 흔들림: 0, 믿나: false };
  const 정렬 = [...vs].sort((a, b) => a - b);
  const 가운뎃값 = 정렬[Math.floor(정렬.length / 2)];
  const 흔들림 = 정렬[정렬.length - 1] - 정렬[0];
  return { px: 가운뎃값, 잰것: vs, 흔들림, 믿나: 흔들림 <= 40 };
}

/** 사람이 읽을 한 줄씩. */
export function 구간말하기(재것, 길이) {
  return 재것.구간.map((g) => {
    const 길 = (g.끝 - g.시작);
    const 몫 = ((길 / 길이) * 100).toFixed(0);
    const 자리 = g.종류 === "2분할" ? `  분할선 x=${g.x}` : "";
    return `    ${g.시작.toFixed(1).padStart(5)}~${g.끝.toFixed(1).padEnd(5)}초  ${길.toFixed(1).padStart(5)}초 (${몫.padStart(2)}%)  ${g.종류.padEnd(6)}${자리}`;
  });
}
