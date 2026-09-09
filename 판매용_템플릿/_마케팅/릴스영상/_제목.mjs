// ═══════════════════════════════════════════════════════════════════════════
//  제목 글자 — .ass 로 만들고, 구운 잉크를 «재서» 판정한다   (2026-09-04)
//
//  ⛔ 제목을 틀 PNG 에 굽지 않는다. 띠가 «움직이는 영상»이 되면서
//     PNG 에 구운 글자는 영상이 덮어 지워 버린다.
//     틀그리기.mjs 는 <회차>/제목_9_16.ass · 제목_16_9.ass 를 «쓰기만» 하고,
//     영상만들기.mjs 가 굽는 사슬 안에서 ass 필터로 얹는다.
//
//  덤 넷: ① 최종 크기에서 벡터로 구워 더 선명   ② 틀을 다시 안 그려도 제목만 고칠 수 있음
//         ③ 글자 폭을 «잴 수 있다»              ④ 정지 사진·마스코트 PNG 가 통째로 빠진다
//
//  ⚠ drawtext 는 이 컴퓨터에서 세그폴트한다. 글자는 ass 필터로만 그린다.
// ═══════════════════════════════════════════════════════════════════════════

import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const 여기 = path.dirname(fileURLToPath(import.meta.url));
export const 폰트방 = path.join(여기, "_폰트/Paperlogy");

/** 윈도우 절대경로를 ffmpeg 필터 인자에 넣는 꼴.  D:/x → 'D\:/x'
 *  ⚠ 따옴표와 역슬래시 «둘 다» 있어야 한다. 하나만으로는 필터 파서가 죽는다.
 *  ⛔ 작은따옴표(')는 이 꼴로 «담을 수 없다» — 아래 못쓰는경로() 를 보라. */
export const q = (p) => "'" + p.replace(/\\/g, "/").replace(/:/g, "\\:") + "'";

/** ⛔ ffmpeg 필터에 못 넣는 경로를 골라낸다.  (2026-09-04 밤)
 *
 *  ffmpeg 의 필터 파서는 인자 안의 작은따옴표를 «삼킨다».
 *  「9. 현님's 회차」를 어떤 꼴로 감싸도 libass 에는 「9. 현님s 회차」로 닿는다 —
 *  2026-09-04 에 네 꼴을 다 재 봤다(따옴표+역슬래시 · '\'' · 따옴표 없이 전부 escape · 역슬래시 둘).
 *  넷 다 「Could not create a libass track」로 죽고, 로그에 찍힌 경로에서 ' 가 사라져 있었다.
 *  그래서 «에두를 길이 없다». 쓰는 쪽이 미리 잡아 «진짜 까닭»을 말해야 한다.
 *  (쉼표 · 한글 · 공백 · "02. " 의 점은 다 괜찮다. 오직 ' 만 안 된다.)
 *
 *  쓰는 법:  const 흠 = 못쓰는경로({ "회차 폴더": DIR, "글꼴 폴더": 폰트방 });
 *  돌려주는 것 { 이름, 경로 } — 없으면 null.
 */
export function 못쓰는경로(경로들) {
  for (const [이름, 경로] of Object.entries(경로들)) {
    if (경로 && String(경로).includes("'")) return { 이름, 경로: String(경로) };
  }
  return null;
}

/** ⛔ ' 가 든 경로면 «그 자리에서» 곱게 멈춘다.  (2026-09-04 밤 · E4-b)
 *
 *  ⚠ 예전에는 이 말을 틀그리기.mjs «만» 했다. 그래서
 *    ① 영상만들기.mjs 는 잉크재기() 가 던진 오류를 아무도 안 받아 node 스택 추적으로 죽고,
 *       제목_*.ass 가 없으면 그나마도 안 나와 「Error parsing filterchain … Invalid argument」
 *       한 줄만 남았다 — ' 이야기가 한 마디도 안 나왔다.
 *    ② 자막굽기.mjs 는 잴 용 .ass 를 tmpdir 에 쓰는 «덕에» 태연히 성공하고
 *       「다음: node 영상만들기.mjs」 라고 안내까지 했다 — 그 다음 걸음이 ①로 죽었다.
 *  셋이 «똑같은 말»을 하도록 여기 한 곳에 둔다.
 *
 *  쓰는 법:  못쓰는경로면멈춘다({ "회차 폴더": DIR, "글꼴 폴더": 폰트방 });
 */
export function 못쓰는경로면멈춘다(경로들) {
  const 흠 = 못쓰는경로(경로들);
  if (!흠) return;
  console.error(`\n⛔ 경로에 작은따옴표(')가 있어 돌릴 수 없습니다.  ← 글꼴 문제가 아닙니다`);
  console.error(`   ${흠.이름}: ${흠.경로}`);
  console.error(`   ffmpeg 의 필터 파서가 ' 를 «삼켜» 버려(현님's → 현님s) 파일을 못 찾습니다.`);
  console.error(`   따옴표·역슬래시 어떤 꼴로 감싸도 안 됩니다 — 2026-09-04 에 네 가지를 다 재 봤습니다.`);
  console.error(`   → 폴더 이름에서 ' 를 빼 주세요.  쉼표 · 한글 · 공백 · "02. " 의 점은 다 괜찮습니다.\n`);
  process.exit(1);
}

/* ⭐ 2026-09-09 현님: 「커버에 있는 제목은 현재와 동일, 상단 띠 부분은 포인트 컬러 노랑」
 *   #F0C810 은 현님이 주신 견본에서 «잰» 값이다 (자막굽기.mjs 와 같은 색).
 *   ⚠ ASS 는 &HAABBGGRR 이라 거꾸로 적는다.
 *   쓰는 법은 자막과 같다 — «*낱말*» 로 감싼다.  예)  *채팅*은 기본|구매 후 매너온도까지 */
const 흰색 = "&H00FFFFFF";
const 노랑 = "&H0010C8F0";
export const 별표빼기 = (s) => String(s).split("*").join("");
const 별표칠하기 = (줄) =>
  String(줄).split("*").map((조각, i) => (i % 2 ? `{\\c${노랑}}${조각}{\\c${흰색}}` : 조각)).join("");

/** 제목 .ass 한 벌을 쓴다. 나올 자리는 «회차 폴더»다(임시 폴더가 아니다). */
export function 제목ass(g, 줄들, 나올길) {
  writeFileSync(나올길, [
    "[Script Info]", "ScriptType: v4.00+",
    `PlayResX: ${g.W}`, `PlayResY: ${g.H}`,
    `WrapStyle: ${g.제목.wrap}`, "ScaledBorderAndShadow: yes", "YCbCr Matrix: TV.709", "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    `Style: 제목,Paperlogy 8 ExtraBold,${g.제목.size},&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,${g.제목.outline},0,${g.제목.align},${g.제목.marginL},${g.제목.marginR},${g.제목.marginV},1`, "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    `Dialogue: 0,0:00:00.00,9:00:00.00,제목,,0,0,0,,${줄들.map(별표칠하기).join("\\N")}`,
  ].join("\n") + "\n", "utf8");
  return 나올길;
}

/** 제목 .ass 를 검은 판에 한 장 구워 «흰 잉크»의 네모를 잰다. (0.3초)
 *
 *  어림하지 않고 재는 이유 — 가이드가 둔 틈은 78px 뿐이다
 *  (글자 오른끝 1407 ↔ 캐릭터 왼끝 1485). 한 글자만 길어져도 얼굴을 침범한다.
 *
 *  돌려주는 것 { x0, y0, x1, y1, 높이 } — 잉크가 하나도 없으면 null.
 */
export function 잉크재기(assPath, W, H, { 문턱 = 60 } = {}) {
  // ⛔ ' 가 든 경로면 ffmpeg 가 조용히 다른 파일을 찾다 죽는다. 글꼴 탓으로 보이지 않게 먼저 말한다.
  const 흠 = 못쓰는경로({ ".ass 경로": assPath, "글꼴 폴더": 폰트방 });
  if (흠) {
    throw new Error(
      `경로에 작은따옴표(')가 있어 ffmpeg 필터에 넣을 수 없습니다 — 글꼴 문제가 아닙니다.\n` +
      `   ${흠.이름}: ${흠.경로}\n` +
      `   ffmpeg 이 ' 를 삼켜(현님's → 현님s) 파일을 못 찾습니다. 폴더 이름에서 ' 를 빼 주세요.`);
  }
  const r = spawnSync("ffmpeg", [
    "-v", "error", "-f", "lavfi", "-i", `color=c=black:s=${W}x${H}`,
    "-vf", `ass=f=${q(assPath)}:fontsdir=${q(폰트방)}`,
    "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "gray", "-",
  ], { maxBuffer: 1 << 30 });
  if (r.status !== 0) {
    console.error(String(r.stderr).slice(-1500));
    throw new Error(`제목 잉크를 못 쟀습니다: ${path.basename(assPath)}`);
  }
  const buf = r.stdout;
  if (!buf || buf.length < W * H) throw new Error(`제목 잉크 판이 짧습니다 (${buf?.length})`);

  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) {
    const row = y * W;
    let 있나 = false, a = W, b = -1;
    for (let x = 0; x < W; x++) {
      if (buf[row + x] >= 문턱) { if (!있나) { 있나 = true; a = x; } b = x; }
    }
    if (있나) { if (y < y0) y0 = y; y1 = y; if (a < x0) x0 = a; if (b > x1) x1 = b; }
  }
  if (x1 < 0) return null;
  return { x0, y0, x1, y1, 높이: y1 - y0 + 1 };
}
