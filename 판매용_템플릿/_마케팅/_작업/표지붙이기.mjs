/* ⛔ 이제 쓰지 않는다 — «영상인트로.mjs» 로 바뀌었다 (2026-08-11 사장님 결정).
 *
 *   사장님: 「9:16은 썸네일을 만들어서 영상에 붙이는 방법 말고, 영상 처음 시작하는
 *   부분에 제목+고양이+요약 설명으로 꾸며서 2초 정도 넣어주면 돼.」
 *
 *   무엇이 문제였나 — 이 방식은 «썸네일 그림»을 영상 앞에 붙인다. 그러다 보니 붙는 것이
 *   영상과 따로 노는 그림이었다. 고양이 자리를 옮길 때마다 목록을 가리거나 제목을 물어
 *   세 번을 고쳤고, 그때마다 유튜브에 다시 올려야 했다.
 *
 *   새 방식은 인트로를 «영상틀»(영상틀_916.html)로 만든다. 뒤에 이어질 장면과
 *   글꼴·자리·색이 같으니 어긋날 자리가 없다. 길이도 1.4초에서 2초로 늘렸다 —
 *   제목과 요약을 읽어야 하니까.
 *
 *   이 파일은 «지우지 않고» 남겨 둔다. 왜 그렇게 했는지가 아래에 적혀 있고,
 *   그 까닭(쇼츠는 커스텀 썸네일을 안 쓴다)은 새 방식에서도 그대로 유효하기 때문이다.
 *
 * ── 아래는 옛 설명 ──────────────────────────────────────────────
 *
 * 세로 영상 «맨 앞»에 움직이는 표지를 붙인다.
 *
 * 왜 이걸 하나 — 쇼츠는 커스텀 썸네일을 안 쓴다.
 *   세로로 넘기는 피드에서도, 스튜디오의 Shorts 목록에서도 유튜브는 «영상 속 한 장면»을 보여준다.
 *   썸네일을 아무리 잘 붙여도(우리는 maxres 까지 확인했다) 그 자리엔 안 나온다.
 *   그러니 **영상 첫 장면 자체를 표지로 만드는 것**이 확실하다. 유튜브가 무엇을 하든 상관없다.
 *
 * 고양이는 «살짝 움직인다» (사장님 지시, 2026-08-10).
 *   정지 그림 1.4초는 「멈춘 줄 알았다」가 된다. 위아래로 아주 조금 흔들면 살아 있어 보인다.
 *   흔드는 폭은 14px · 한 번 왕복 1.1초. 이보다 크면 장난스러워지고, 작으면 안 보인다.
 *
 * 어떻게 만드나
 *   ① 썸네일틀을 `?facehide=1` 로 굽는다 — 자리 계산은 그대로, 고양이 «그림만» 빠진 판
 *   ② 그 위에 고양이 PNG 를 «틀과 같은 좌표»로 얹고 sin 으로 흔든다
 *   ③ 표지(1.4초) + 본편을 잇고, 음악을 전체 길이에 맞춰 다시 깐다
 *
 * 표지가 길면 안 된다 — 주제표의 「뜸 들이는 도입부로 시작하지 않는다」에 걸린다.
 * 1.4초는 첫 장면으로 잡히기엔 넉넉하고, 보는 사람이 「기다렸다」고 느끼기엔 짧다.
 *
 * 쓰는 법
 *   node "판매용_템플릿/_마케팅/_작업/표지붙이기.mjs" <설정.json>
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, rmSync } from "node:fs";

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
const 마케팅 = "C:/Users/glim0/OneDrive/문서/Claude/Projects/02. 웹기획자/판매용_템플릿/_마케팅";
const 고양이방 = `${마케팅}/릴스영상/_모델/고양이`;
const 음악방 = `${마케팅}/릴스영상/_음악`;
const W = process.env.TEMP.replace(/\\/g, "/") + "/cc-cover";

const 표지초 = 1.4;
const 흔들폭 = 14;      // px
const 흔들주기 = 1.1;   // 초

/* 고양이 자리 — 썸네일틀.html 의 `.v9 .face.cat.*` 와 «같은 값»이다.
   한쪽만 고치면 표지와 썸네일에서 고양이가 다른 데 있게 된다. */
const 자리 = {
  br:   { x: (w) => 1080 - 30 - w, y: (h) => 1920 - 140 - h, h: 480 },
  bl:   { x: () => 24,             y: (h) => 1920 - 140 - h, h: 480 },
  tr:   { x: (w) => 1080 - 30 - w, y: () => 150,             h: 360 },
  peek: { x: (w) => 1080 + 80 - w, y: (h) => 1920 - 300 - h, h: 520 },
  big:  { x: (w) => 1080 + 40 - w, y: (h) => 1920 - 160 - h, h: 700 },
};

const sh = (cmd, args) => execFileSync(cmd, args, { stdio: "pipe" });
const ff = (args) => sh("ffmpeg", ["-y", "-v", "error", ...args]);
const 재기 = (f, 무엇) => execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0",
  "-show_entries", 무엇, "-of", "csv=p=0", f]).toString().trim();

/* ── 틀을 한글 없는 자리에 차려 둔다 ───────────────────────────── */
rmSync(W, { recursive: true, force: true });
mkdirSync(`${W}/fonts`, { recursive: true });
writeFileSync(`${W}/style.css`,
  readFileSync(`${마케팅}/카드뉴스2.css`, "utf8").replaceAll("릴스영상/_폰트/MaruBuriTTF/", "fonts/"), "utf8");
for (const f of ["Regular", "SemiBold", "Bold"])
  copyFileSync(`${마케팅}/릴스영상/_폰트/MaruBuriTTF/MaruBuri-${f}.ttf`, `${W}/fonts/MaruBuri-${f}.ttf`);
writeFileSync(`${W}/thumb.html`,
  readFileSync(`${마케팅}/썸네일틀.html`, "utf8").replace('href="카드뉴스2.css"', 'href="style.css"'), "utf8");

const 목록 = JSON.parse(readFileSync(process.argv[2], "utf8"));

for (const t of 목록) {
  console.log(`\n== ${t.이름}`);

  /* ① 고양이 «그림만» 빠진 표지 바탕 */
  copyFileSync(`${고양이방}/${t.pose}.png`, `${W}/cat.png`);   // 자리 계산에 쓰이므로 파일은 있어야 한다
  const q = Object.entries({ v: 9, big: t.big, sub: t.sub, ep: t.ep, sheet: t.sheet, rows: t.rows,
    face: "cat", pos: t.pos, facehide: "1" })
    .filter(([, v]) => v != null).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
  const 바탕 = `${W}/${t.이름}_바탕.png`;
  if (existsSync(바탕)) rmSync(바탕);
  sh(CHROME, ["--headless=new", "--user-data-dir=" + 크롬찌꺼기,  "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--window-size=1080,1920", `--screenshot=${바탕}`, "--virtual-time-budget=4000", `file:///${W}/thumb.html?${q}`]);
  if (!existsSync(바탕)) throw new Error(`표지 바탕을 못 구웠습니다: ${t.이름}`);

  /* ② 고양이를 틀과 같은 좌표에 얹고 흔든다 */
  const 자 = 자리[t.pos] ?? 자리.br;
  const [원폭, 원높] = 재기(`${고양이방}/${t.pose}.png`, "stream=width,height").split(",").map(Number);
  const 고h = 자.h, 고w = Math.round(원폭 * (고h / 원높));
  const x = Math.round(자.x(고w)), y = Math.round(자.y(고h));
  const 표지 = `${W}/${t.이름}_표지.mp4`;
  ff(["-loop", "1", "-t", String(표지초), "-i", 바탕,
    "-loop", "1", "-t", String(표지초), "-i", `${고양이방}/${t.pose}.png`,
    "-filter_complex",
    `[1:v]scale=${고w}:${고h}[c];[0:v][c]overlay=${x}:'${y}+${흔들폭}*sin(2*PI*t/${흔들주기})':shortest=1,` +
    `fps=30,format=yuv420p,setsar=1`,
    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-an", 표지]);

  /* ③ 표지 + 본편, 그리고 음악을 전체 길이로 다시 */
  const 이은것 = `${W}/${t.이름}_이은것.mp4`;
  ff(["-i", 표지, "-i", t.영상, "-filter_complex",
    "[0:v]fps=30,format=yuv420p,setsar=1[a];[1:v]fps=30,format=yuv420p,setsar=1[b];[a][b]concat=n=2:v=1:a=0[o]",
    "-map", "[o]", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-an", 이은것]);

  const 끝 = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration",
    "-of", "csv=p=0", 이은것]).toString().trim());
  ff(["-i", 이은것, "-i", `${음악방}/${t.음악}`, "-filter_complex",
    `[1:a]atrim=0:${끝.toFixed(3)},asetpts=N/SR/TB,volume=0.5,` +
    `afade=t=in:st=0:d=1.2,afade=t=out:st=${(끝 - 2).toFixed(2)}:d=2[a]`,
    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
    "-shortest", "-movflags", "+faststart", t.낼길]);

  console.log(`  고양이 ${t.pose} · ${t.pos} → ${고w}×${고h} @ (${x}, ${y}) · ±${흔들폭}px`);
  console.log(`  ${끝.toFixed(1)}초 → ${t.낼길}`);
}
console.log("\n끝났습니다.");
