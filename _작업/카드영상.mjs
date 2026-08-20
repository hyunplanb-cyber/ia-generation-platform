/* 카드뉴스 한 장을 짧은 mp4 로 만든다.
 *
 * 인스타는 GIF 를 안 받고 올리는 순간 mp4 로 바꾼다(직접 확인함).
 * 그래서 처음부터 mp4 로 낸다. 소리 없음 — 참고한 계정들도 무음이었다.
 *
 * 만드는 법
 *   1. 헤드리스 크롬으로 ?step=N 을 하나씩 열어 1080×1350 PNG 를 찍는다
 *   2. 단계마다 몇 초 머물지 정해 ffmpeg 로 잇는다
 *
 * 부드럽게 흐르는 대신 계단식으로 나타나게 한 이유는 카드뉴스2-움직임.css 에 적어 뒀다.
 *
 * ⚠ 작업 폴더가 한글이라, 크롬과 ffmpeg 에 넘기는 경로는 전부
 *   한글이 없는 임시 폴더(%TEMP%)로 잡는다. 처음에 프로젝트 폴더 안에 찍었더니
 *   크롬은 조용히 아무것도 안 만들고 ffmpeg 는 파일을 못 열었다.
 *
 * 쓰는 법: npx tsx _작업/카드영상.mjs <페이지이름> <나올이름>
 */
import { mkdirSync, rmSync, existsSync, readdirSync, writeFileSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

/* ⛔ 헤드리스 크롬은 부를 때마다 %TEMP% 아래 HeadlessChrome<난수> 를 만들고 «끝나도 안 지운다».
   한 쪽에 한 번씩 부르는 도구는 그것이 그대로 쌓인다 —
   2026-08-20 에 23,299개 · 34GB 가 쌓여 C 드라이브를 먹고 있었다.
   프로필 자리를 우리가 정해 주고, 다 돌면 그 자리를 지운다. */
const 크롬찌꺼기 = `${(process.env.TEMP || "/tmp").split(String.fromCharCode(92)).join("/")}/cc-chrome-${process.pid}`;
(() => {                       /* 시작할 때 «묵은 것»부터 치운다 — 크롬이 물고 있어 못 지운 자리들 */
  const fs_ = require("node:fs");
  const 방 = 크롬찌꺼기.slice(0, 크롬찌꺼기.lastIndexOf("/"));
  try {
    for (const d of fs_.readdirSync(방)) {
      if (!d.startsWith("cc-chrome-")) continue;
      try { fs_.rmSync(방 + "/" + d, { recursive: true, force: true }); } catch { /* 아직 쓰는 중이면 다음에 */ }
    }
  } catch { /* 폴더가 없으면 그만 */ }
})();
process.on("exit", () => { try { require("node:fs").rmSync(크롬찌꺼기, { recursive: true, force: true }); } catch {} });

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const 페이지 = process.argv[2] ?? "카드영상_02";
const 이름 = process.argv[3] ?? 페이지;
const PORT = 4199;

const WORK = join(tmpdir(), "cc-card").replace(/\\/g, "/");   // 한글 없는 자리
const OUT = "판매용_템플릿/_마케팅/릴스영상/_카드영상";

/* 단계마다 몇 프레임 머물까(30fps).
 * 앞은 빠르게 넘기고, 표가 나오는 자리와 마지막에는 오래 머문다 —
 * 폰에서 스치듯 보는 화면이라 마지막 정지 화면이 길어야 읽힌다. */
const 머무름 = [12, 14, 14, 20, 26, 42, 22, 18, 16, 70];

if (existsSync(WORK)) rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });
mkdirSync(OUT, { recursive: true });

const 총 = 머무름.reduce((a, b) => a + b, 0);
console.log(`${페이지} → ${이름}.mp4`);
console.log(`단계 ${머무름.length}개 · ${총}프레임 · ${(총 / 30).toFixed(1)}초\n`);

// ── 1. 단계마다 한 장씩 ─────────────────────────────────────
for (let s = 0; s < 머무름.length; s++) {
  const url = `http://localhost:${PORT}/${encodeURIComponent(페이지)}.html?step=${s}`;
  execFileSync(CHROME, [
    "--headless=new", "--user-data-dir=" + 크롬찌꺼기,  "--disable-gpu", "--hide-scrollbars",
    "--force-device-scale-factor=1", "--window-size=1080,1350",
    `--screenshot=${WORK}/s_${String(s).padStart(2, "0")}.png`,
    "--virtual-time-budget=1500",      // 글꼴이 자리 잡을 시간
    url,
  ], { stdio: "pipe" });
  process.stdout.write(`  찍는 중 ${s + 1}/${머무름.length}\r`);
}
const 찍힘 = readdirSync(WORK).filter((f) => f.endsWith(".png")).length;
console.log(`  찍은 장 ${찍힘}/${머무름.length}          `);
if (찍힘 !== 머무름.length) throw new Error("빠진 장이 있습니다");

// ── 2. 머무는 만큼 늘려 잇는다 ──────────────────────────────
const 목록 = [];
머무름.forEach((n, s) => {
  목록.push(`file '${WORK}/s_${String(s).padStart(2, "0")}.png'`, `duration ${(n / 30).toFixed(4)}`);
});
// concat 은 마지막 장을 한 번 더 적어야 끝까지 나온다
목록.push(`file '${WORK}/s_${String(머무름.length - 1).padStart(2, "0")}.png'`);
const list = `${WORK}/frames.txt`;
writeFileSync(list, 목록.join("\n"), "utf8");

const tmpMp4 = `${WORK}/out.mp4`;
execFileSync("ffmpeg", [
  "-y", "-v", "error",
  "-f", "concat", "-safe", "0", "-i", list,
  "-fps_mode", "cfr", "-r", "30",
  "-c:v", "libx264", "-pix_fmt", "yuv420p",
  "-an", "-movflags", "+faststart",
  tmpMp4,
]);
copyFileSync(tmpMp4, `${OUT}/${이름}.mp4`);

const info = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0",
  "-show_entries", "stream=width,height,nb_frames", "-show_entries", "format=duration",
  "-of", "csv=p=0", tmpMp4], { encoding: "utf8" }).trim().split("\n");
console.log(`\n완성 → ${OUT}/${이름}.mp4`);
console.log(`  ${info.join(" · ")}`);
