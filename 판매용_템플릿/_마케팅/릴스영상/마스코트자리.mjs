// 자리표(_마스코트자리.json) 확인 그림.  (2026-09-04)
//
//   node 마스코트자리.mjs                       ← 기본 제목으로
//   node 마스코트자리.mjs --제목 "첫 줄|둘째 줄"
//
// 나오는 것 — 릴스영상/ 에 두 장
//   _마스코트자리_확인.png       세로판 띠(2160x540)로 잘린 모습 + 제목 글자. 세로로 붙인다
//   _마스코트자리_확인_가로.png   ⭐ 가로판 창(1024x1620)으로 잘린 모습. 가로로 붙인다
//
// ⛔ 2026-09-04 밤 (신8) — 예전엔 «세로판 띠»만 그렸다. 가로판 창(창자르기)은 확인할 길이
//   없어서, 새 마스코트를 넣었을 때 가로판에서 캐릭터가 잘리는지 눈으로 못 봤다.
//   덤으로 -ss 5 로 한 장을 뽑는지라 5초보다 짧은 마스코트가 들어오면 그림이 아예 안 나왔다
//   (지금 11개는 8.06~10.05초라 안 걸렸을 뿐이다). 이제 길이를 재서 «가운데»를 뽑는다.
//
// 새 마스코트 영상을 넣으셨을 때 할 일
//   ① node 마스코트자리.mjs 로 그림을 뽑는다
//   ② 그림을 보고 _마스코트자리.json 에 한 줄 더한다 (W H x0 x1 머리 얼굴 띠쓰나)
//   ③ 다시 돌려 머리 꼭대기가 잘리지 않고, 제목 글자가 얼굴을 안 덮는지 본다
//
// ⚠ 자동검출은 쓰지 않는다. 움직임에너지는 야근·쇼파수다에서 뒤집히고(캐릭터가 오히려
//   저변동), 색 검출은 벽·모래·나무를 얼굴로 잡는다. 11개 중 2개가 틀리면 «얼굴 반쪽»이 나간다.

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";

import { 규격, 최소틈 } from "./_규격.mjs";
import { 제목ass, 잉크재기, q } from "./_제목.mjs";
import { 마스코트방, 릴스방, 있는영상, 자리찾기, 띠자르기, 창자르기, 재보기 } from "./_마스코트.mjs";

const argOf = (f) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : null; };
const 제목 = (argOf("--제목") || "파일 두 개 넣었더니|화면 136개가 나왔다").split("|").map((s) => s.trim());

const g = 규격["9_16"];
const 가 = 규격["16_9"];              // ⭐ 가로판 창 — 1024 x 1620
const 임시 = mkdtempSync(path.join(os.tmpdir(), "cc-jari-"));
process.on("exit", () => { try { rmSync(임시, { recursive: true, force: true }); } catch {} });

const ass = 제목ass(g, 제목, path.join(임시, "제목.ass"));
const 잉크 = 잉크재기(ass, g.W, g.H);
const 오른끝 = 잉크 ? 잉크.x1 : 0;

const 목록 = 있는영상();
console.log(`\n마스코트 자리 확인 → ${목록.length}개`);
console.log(`  제목: ${제목.join(" / ")}   잉크 오른끝 x=${오른끝}\n`);

const 조각 = [];        // 세로판 띠
const 가로조각 = [];     // ⭐ 가로판 창 (신8)
for (const f of 목록) {
  const 자 = 자리찾기(f);
  const B = 띠자르기(자, g.띠.w, g.띠.h);
  const C = 창자르기(자, 가.띠.w, 가.띠.h);          // ⭐ 가로판 창도 같이 잰다
  const 왼 = Math.round(자.x0 * g.띠.w);
  const 틈 = 왼 - 오른끝;
  const 판정 = !자.띠쓰나 ? "띠쓰나 false — 안 씀"
    : 틈 >= 최소틈 ? `쓸 수 있음 (틈 ${틈}px)` : `⛔ 제목이 얼굴을 덮음 (틈 ${틈}px)`;

  /* ⛔ -ss 5 를 못 박지 않는다 (신8). 5초보다 짧은 마스코트가 들어오면 그림이 안 나온다.
     길이를 재서 «가운데»를 뽑는다. 못 재면 0초(첫 프레임)로 물러선다. */
  const 잰 = 재보기(path.join(마스코트방, f));
  const 뽑을때 = 잰 && 잰.초 > 0 ? Math.min(5, 잰.초 / 2) : 0;

  const png = path.join(임시, `${조각.length}.png`);
  const 사슬 = [
    `[0:v]null[bg]`,
    `[1:v]scale=${B.scaleW}:${B.scaleH}:flags=lanczos,crop=${B.cropW}:${B.cropH}:${B.cropX}:${B.cropY},setsar=1[band]`,
    `[bg][band]overlay=0:0:format=auto[b0]`,
    `[b0]ass=f=${q(ass)}:fontsdir=${q(path.join(릴스방, "_폰트/Paperlogy"))}[o]`,
  ];
  const r = spawnSync("ffmpeg", [
    "-y", "-v", "error",
    "-f", "lavfi", "-i", `color=c=0x1A1512:s=${g.W}x${g.H}`,
    "-ss", 뽑을때.toFixed(2), "-i", path.join(마스코트방, f),
    "-filter_complex", 사슬.join(";"),
    "-map", "[o]", "-frames:v", "1", png,
  ], { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
  if (r.status !== 0) { console.error(r.stderr?.slice(-1200)); process.exit(1); }
  조각.push(png);

  // ⭐ 가로판 창 — 영상만들기.mjs 가 굽는 사슬과 «같은 차례»로 자르고 늘린다
  const png가 = path.join(임시, `가${가로조각.length}.png`);
  const r가 = spawnSync("ffmpeg", [
    "-y", "-v", "error", "-ss", 뽑을때.toFixed(2), "-i", path.join(마스코트방, f),
    "-vf", `crop=${C.cropW}:${C.cropH}:${C.cropX}:0,scale=${C.scaleW}:${C.scaleH}:flags=lanczos,setsar=1`,
    "-frames:v", "1", png가,
  ], { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
  if (r가.status !== 0) { console.error(r가.stderr?.slice(-1200)); process.exit(1); }
  가로조각.push(png가);

  console.log(`  ${String(조각.length).padStart(2)}. ${f.padEnd(16)} ${자.W}x${자.H}  ` +
    `띠 crop y=${B.cropY} (${B.규칙}·머리여백 ${B.머리여백}px)  캐릭터왼끝 ${왼}  ${판정}` +
    (자.잰것 ? "" : "   ⚠ 자리표에 없음 — 되돌이 값. 재서 _마스코트자리.json 에 적으세요"));
  console.log(`      가로판 창 crop ${C.cropW}x${C.cropH} x=${C.cropX}` +
    ` (원본 가로의 ${(C.남김 * 100).toFixed(1)}%, 오른끝 ${C.cropX + C.cropW}/${자.W})` +
    ` → ${C.scaleW}x${C.scaleH}${C.담나 ? "" : `  ⚠ 캐릭터가 창보다 넓습니다 (필요폭 ${C.필요폭})`}` +
    `   ${뽑을때.toFixed(1)}초 지점`);
}

// 세로로 붙인다. 한 장이 2160x3840 이라 띠(위 540)만 잘라 반으로 줄여 붙인다
const 나올것 = path.join(릴스방, "_마스코트자리_확인.png");
const 입력 = 조각.flatMap((p) => ["-i", p]);
const 자르기 = 조각.map((_, i) => `[${i}:v]crop=${g.띠.w}:${g.띠.h}:0:0,scale=1080:270[c${i}]`).join(";");
const 붙이기 = 조각.map((_, i) => `[c${i}]`).join("") + `vstack=inputs=${조각.length}[o]`;
const r2 = spawnSync("ffmpeg", ["-y", "-v", "error", ...입력,
  "-filter_complex", `${자르기};${붙이기}`, "-map", "[o]", "-frames:v", "1", 나올것],
  { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
if (r2.status !== 0) { console.error(r2.stderr?.slice(-1500)); process.exit(1); }

console.log(`\n  ✔ ${path.basename(나올것)}   ${조각.length}칸 (위에서부터 위 차례대로)`);
console.log(`     ${나올것}`);

/* ── ⭐ 가로판 창 확인 그림 (신8) ────────────────────────────────────────────
   한 장이 1024x1620 이라 넷으로 줄여(256x405) 가로로 붙인다.
   여기서 캐릭터가 잘리는지 눈으로 본다 — 세로판 띠쓰나 false 인 것도 가로판에서는 멀쩡하다. */
const 나올것가 = path.join(릴스방, "_마스코트자리_확인_가로.png");
const 입력가 = 가로조각.flatMap((p) => ["-i", p]);
const 줄이기 = 가로조각.map((_, i) => `[${i}:v]scale=256:405,pad=260:409:2:2:0x1A1512[c${i}]`).join(";");
const 붙이기가 = 가로조각.map((_, i) => `[c${i}]`).join("") + `hstack=inputs=${가로조각.length}[o]`;
const r3 = spawnSync("ffmpeg", ["-y", "-v", "error", ...입력가,
  "-filter_complex", `${줄이기};${붙이기가}`, "-map", "[o]", "-frames:v", "1", 나올것가],
  { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
if (r3.status !== 0) { console.error(r3.stderr?.slice(-1500)); process.exit(1); }

console.log(`  ✔ ${path.basename(나올것가)}   ${가로조각.length}칸 (왼쪽부터 위 차례대로)`);
console.log(`     ${나올것가}`);
