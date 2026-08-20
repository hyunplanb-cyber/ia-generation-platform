/* 세로(9:16) 영상 «맨 앞»에 2초짜리 인트로를 붙인다 — 제목 + 고양이 + 요약 한 줄.
 *
 * 왜 이렇게 바뀌었나 (2026-08-11 사장님 결정)
 *   처음엔 영상에 커버를 붙이려고 «썸네일»을 만들었다. 그런데 쇼츠는 커스텀 썸네일을
 *   안 쓴다 — 유튜브가 «영상 속 한 장면»을 대신 보여준다. 그래서 썸네일 그림을
 *   영상 맨 앞에 넣는 쪽으로 바꿨는데, 그 그림이 «썸네일 모양»이라 영상과 따로 놀았다.
 *   자리를 옮길 때마다 고양이가 목록을 가리거나 제목을 물었다. 세 번 고쳤다.
 *
 *   **사장님: 「9:16은 썸네일을 만들어 붙이는 방법 말고, 영상 처음 시작하는 부분에
 *   제목+고양이+요약 설명으로 꾸며서 2초 정도 넣어주면 돼.」**
 *
 *   그래서 인트로를 «영상틀»로 만들었다. 영상틀_916.html 에 title·cap·ep 가 이미 있고
 *   `cat=full` 이 영상 칸을 고양이로 채운다. 뒤에 이어질 장면과 글꼴·자리·색이 같다.
 *
 * ⭐ 그런데 그건 «표지»가 아니었다 (2026-08-12 사장님 지적)
 *   **「이 화면이 커버로 쓰일 거잖아. 커버처럼 디자인 해줘야 해.」**
 *   맞는 말이다. 영상틀은 «본문 한 장면»을 담는 틀이라, 고양이만 채워 놓으면
 *   위아래가 통째로 비어 휑하다. 제목 두 줄과 고양이 한 마리뿐이라 «표지»로 안 읽힌다.
 *
 *   그래서 이제 **썸네일틀.html 을 v=9 로** 구워 인트로로 쓴다. 그 틀은 원래 표지용이라
 *   큰 제목 · 부제 · **그 회차 산출물 목록 칸** · 동그라미 고양이 · 아래 서명줄까지 갖췄다.
 *   글꼴·종이색·주황은 카드뉴스2.css 로 본문과 같으니 «따로 노는 그림»이 되지 않는다.
 *   ⚠ 2026-08-11 에 버린 것은 «썸네일 그림을 갖다 붙이는 방식»이지 «표지 디자인»이 아니다.
 *     지금도 그림을 붙이는 게 아니라 **인트로를 그 자리에서 굽는다.** 붙이는 게 아니다.
 *
 * ⚠ 썸네일은 이제 **16:9 만** 만든다(썸네일굽기.mjs). 9:16 썸네일은 안 쓴다.
 *   가로 영상은 커스텀 썸네일이 정상으로 쓰이므로 그쪽에만 필요하다.
 *
 * ⚠ 한글 경로에서 헤드리스 크롬은 조용히 아무것도 안 만든다. 아스키 자리에 차려 놓고 찍는다.
 *
 * 설정 한 줄
 *   { "이름":"영상3", "pose":"집중", "ratio":1.28,
 *     "title":"「거의 다 됐어요」가|몇 %일까요",
 *     "cap":"진행률을 숫자로|말하는 법",
 *     "ep":"장비 렌탈 사이트 편",
 *     "영상":"…/영상3_916.mp4", "낼길":"…/인트로_영상3_916.mp4" }
 *
 * 쓰는 법
 *   node 판매용_템플릿/_마케팅/_작업/영상인트로.mjs <설정.json>
 */
import { execFileSync, spawnSync } from "node:child_process";
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
/* ⚠ 2026-08-14 — 그림을 «_이미지» 한 곳으로 모을 때 이 파일을 빠뜨렸다.
   _모델/고양이 는 이제 없다. 영상굽기·썸네일굽기만 고치고 여기를 놓쳐서,
   표지를 구울 때 「포즈가 없습니다」로 죽었다. 세 도구가 같은 자리를 봐야 한다.
   대표 마스코트 별명표(_별명.csv)도 여기서 함께 본다 — 대본은 옛 이름을 부른다. */
const 고양이방 = `${마케팅}/../_이미지/마스코트/낱장`;
/* 마스코트 영상과 «세트로 받은 누끼» 가 사는 곳. 누끼/<영상이름>.png 로 짝이 맞는다. */
const 마스코트영상방 = `${마케팅}/../_이미지/마스코트/영상`;
const 별명 = (() => {
  const 길 = `${고양이방}/_별명.csv`;
  const 표 = new Map();
  if (!existsSync(길)) return 표;
  for (const 줄 of readFileSync(길, "utf8").replace(/^﻿/, "").split(/\r?\n/).slice(1)) {
    const [부르는, 실제] = 줄.split(",").map((x) => x?.trim());
    if (부르는 && 실제 && !부르는.startsWith("#")) 표.set(부르는, 실제);
  }
  return 표;
})();
/** 별명 → 없으면 원래 이름. 옛 고양이와 새 고양이를 섞어 쓴다. */
const 포즈파일 = (포즈) => {
  const 실제 = 별명.get(포즈) ?? 포즈;
  return existsSync(`${고양이방}/${실제}.png`) ? `${고양이방}/${실제}.png` : `${고양이방}/${포즈}.png`;
};
const W = process.env.TEMP.replace(/\\/g, "/") + "/cc-intro";

/** 2초. 사장님이 정하신 길이다.
 *  ⚠ 더 늘리지 마라 — 쇼츠에서 「뜸 들이는 도입부」는 그대로 이탈이 된다.
 *  전에 쓰던 표지는 1.4초였는데, 그때는 «그림 한 장»이라 읽을 것이 적었다.
 *  이제는 제목·요약을 읽어야 하므로 2초가 맞다. */
const 인트로초 = 2.0;

/* 고양이를 아주 조금 흔든다. 정지 그림은 「멈춘 줄 알았다」가 된다.
   ±10px · 왕복 1.2초 — 표지 때(±14 · 1.1초)보다 더 작고 느리게 둔다.
   인트로는 «읽는» 장면이라 크게 흔들면 글자에서 눈이 떨어진다. */
const 흔들폭 = 10;
const 흔들주기 = 1.2;

const sh = (cmd, args) => execFileSync(cmd, args, { stdio: "pipe" });
const ff = (args) => sh("ffmpeg", ["-y", "-v", "error", ...args]);

/* ── 틀을 한글 없는 자리에 차려 둔다 ───────────────────────────── */
rmSync(W, { recursive: true, force: true });
mkdirSync(`${W}/fonts`, { recursive: true });
writeFileSync(`${W}/style.css`,
  readFileSync(`${마케팅}/카드뉴스2.css`, "utf8").replaceAll("릴스영상/_폰트/MaruBuriTTF/", "fonts/"), "utf8");
for (const f of ["Regular", "SemiBold", "Bold"])
  copyFileSync(`${마케팅}/릴스영상/_폰트/MaruBuriTTF/MaruBuri-${f}.ttf`, `${W}/fonts/MaruBuri-${f}.ttf`);
writeFileSync(`${W}/cover.html`,
  readFileSync(`${마케팅}/썸네일틀.html`, "utf8").replace('href="카드뉴스2.css"', 'href="style.css"'), "utf8");

/* ⚠ «빈 값»을 버리지 마라. 빈 문자열은 「안 줬다」가 아니라 «비워 달라»는 뜻이다.
   2026-08-12 에 부제를 빼려고 cap 을 "" 로 뒀는데 여기서 걸러져 틀에 안 갔고,
   틀은 못 받았으니 «기본 부제»를 그대로 그렸다. 화면에는 남의 문구가 찍혀 나왔다. */
const 주소 = (o) => Object.entries(o).filter(([, v]) => v != null)
  .map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");

/** 틀에게 «고양이가 어디에 얼마만 하게 그려지나»를 직접 물어본다.
 *  CSS 를 여기서 다시 계산하면 틀을 고칠 때마다 어긋난다. 그려 보고 받아 적는다. */
function 고양이자리(q) {
  const 잴것 = `${W}/_잴것.html`;
  /* 고양이 자리만 묻지 않는다. **제목이 몇 줄로 흘렀는지**와 «고양이가 목록을 물었는지»도 같이 받는다.
   *
   * 2026-08-12: 제목 줄이 길어 조용히 3줄로 흘러넘쳤다. 내가 `|` 로 두 줄을 적었는데
   * 글자가 칸을 넘겨 한 줄이 더 생긴 것이다. 아무도 안 알려줘서 그대로 구워 올릴 뻔했다.
   * **눈대중으로 줄이지 말고 재서 막는다.** */
  writeFileSync(잴것, readFileSync(`${W}/cover.html`, "utf8").replace("</body>", `<script>
    addEventListener("load",()=>{
      const 네모=(el)=>{const r=el.getBoundingClientRect();
        return {x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)};};
      const i=document.querySelector(".face.cat img");
      const big=document.getElementById("big");
      const 한줄=parseFloat(getComputedStyle(big).lineHeight);
      const sheet=document.querySelector(".sheet");
      const ft=document.querySelector(".ft");
      document.title=JSON.stringify({...네모(i),
        제목줄:Math.round(big.getBoundingClientRect().height/한줄),
        적은줄:big.querySelectorAll("br").length+1,
        고양이:네모(i), 목록:sheet?네모(sheet):null, 서명:ft?네모(ft):null});});
  <\/script></body>`), "utf8");
  const dom = execFileSync(CHROME, ["--headless=new", "--user-data-dir=" + 크롬찌꺼기,  "--disable-gpu", "--window-size=1080,1920",
    "--virtual-time-budget=5000", "--dump-dom", `file:///${잴것}?${q}`],
    { encoding: "utf8", stdio: "pipe", maxBuffer: 1 << 26 });
  const t = /<title>([\s\S]*?)<\/title>/.exec(dom)?.[1];
  if (!t || !t.startsWith("{")) throw new Error("고양이 자리를 못 쟀습니다 — 틀이 안 열렸을 수 있습니다");
  return JSON.parse(t);
}

const 목록 = JSON.parse(readFileSync(process.argv[2], "utf8"));

for (const t of 목록) {
  console.log(`\n== ${t.이름}`);
  /* ⭐ 커버 마스코트를 «본편에 쓰인 마스코트 영상» 과 짝지운다 (2026-08-20 사장님).
     「내용쪽에 들어간 영상의 캐릭터… 이런게 누끼 따돈 아이들이 있거든
       이런아이들이 있으면 커버에 이 아이들이 노출되는 것이 좋을거 같아」

     ⭐ 짝은 «이름» 으로 맞춘다. 영상 «온천.mp4» 의 짝은 누끼 «온천.png» 다.
        손으로 적는 짝표를 두지 않는다 — 2026-08-20 에 그 표가 «야외독서 → 독서» 로
        옛 고양이를 커버에 올렸다. 낱장/ 에는 은퇴한 고양이와 지금 캐릭터가 섞여 있어서,
        이름이 비슷하다고 고르면 다른 캐릭터가 나온다.
        영상/누끼/ 에는 사장님이 세트로 주신 것만 둔다. 여기서 고르면 틀릴 수가 없다.

     세트에 누끼가 없는 영상만 _커버짝.json 에서 대타를 찾는다. */
  let 고른포즈 = t.pose, 짝출처 = "설정", 세트길 = null;
  const 이번영상 = (() => {
    try { return JSON.parse(readFileSync(`${마스코트영상방}/_편별.json`, "utf8"))[t.이름] ?? null; }
    catch { return null; }
  })();
  if (이번영상) {
    const 세트누끼 = `${마스코트영상방}/누끼/${이번영상.replace(/\.[^.]+$/, "")}.png`;
    if (existsSync(세트누끼)) { 고른포즈 = null; 짝출처 = "세트"; 세트길 = 세트누끼; }
    else {
      try {
        const 대타 = JSON.parse(readFileSync(`${마케팅}/_작업/_커버짝.json`, "utf8"))[이번영상];
        if (대타) { 고른포즈 = 대타; 짝출처 = "대타"; }
      } catch { /* 대타표가 없으면 설정대로 간다 */ }
    }
  }
  const 포즈길 = 세트길 ?? 포즈파일(고른포즈);
  if (!existsSync(포즈길)) throw new Error(`커버 그림이 없습니다: ${포즈길}`);
  console.log(`  커버 마스코트 ← ${이번영상 ?? "(본편 영상 기록 없음)"} · ${짝출처} · ${포즈길.split("/").pop()}`);
  copyFileSync(포즈길, `${W}/cat.png`);

  /* 표지 틀의 값들. sheet·rows 는 «그 회차 산출물 목록» 칸이다 — 이게 있어야 표지로 읽힌다.
     ⚠ pos 는 `head`(동그라미)를 쓰지 마라. 동그라미는 오려내기(overflow:hidden)가 걸려 있어
       고양이를 따로 얹으면 네모난 원본이 그대로 나온다. 흔들려면 서 있는 자리(br·bl)여야 한다. */
  /* ⭐ 커버 마스코트는 «하단 우측» 고정이다 (2026-08-20 사장님: 「하단 우측에 고정해줘」).
     ⛔ 설정의 pos 를 더는 보지 않는다. tr(우측 위)로 두었더니 제목을 가렸고,
        자리를 옮길 때마다 제목이나 목록 중 하나를 물었다. 자리는 이제 한 곳이다. */
  const 공통 = { v: 9, big: t.title, sub: t.cap, ep: t.ep, face: "cat",
    pos: "br", sheet: t.sheet, rows: t.rows };

  /* ① 표지를 «한 벌로» 굽는다 — 고양이까지 한 장에 들어간다.
   *
   * ⭐ 2026-08-12 사장님: 「아직도 만든 커버를 영상 앞에 두는 거야?
   *   **한 벌의 영상으로 만들어야 저런 현상이 없을 거 같은뎅.**」 맞는 말씀이었다.
   *
   *   전에는 고양이를 흔들려고 «그림만 감춘 바탕»을 굽고 고양이를 따로 얹었다.
   *   그랬더니 고양이 자리에만 **2단계 어두운 네모**가 남았다(232,228,218 대 234,230,220).
   *   투명한 곳까지 한 번 더 섞이면서 색이 반올림된 자국이다. 종이처럼 평평한 바탕에서는
   *   그 2단계가 «상자»로 보인다. 표지에서 제일 눈에 띄는 흠이었다.
   *
   *   그래서 얹기를 그만뒀다. 흔들림은 잃지만 **자국이 생길 자리가 없어진다.**
   *   본편이 2초 뒤부터 빠르게 움직이므로 표지는 가만히 있어도 멈춘 것처럼 보이지 않는다. */
  /* ⚠ 창 크기로 준 만큼이 «보이는 자리»가 아니다 — 크롬이 창틀로 96px 을 먹는다.
     1920 을 달라고 하면 1824 만 그려져 맨 아래 서명줄이 잘린다.
     그래서 넉넉히 찍고 정확히 1080×1920 으로 잘라낸다(2026-08-12 재서 알았다). */
  const 넉넉 = `${W}/bg_raw.png`;
  const 바탕 = `${W}/bg.png`;
  sh(CHROME, ["--headless=new", "--user-data-dir=" + 크롬찌꺼기,  "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--window-size=1080,2060", `--screenshot=${넉넉}`, "--virtual-time-budget=5000",
    `file:///${W}/cover.html?${주소(공통)}`]);
  if (!existsSync(넉넉)) throw new Error("인트로 바탕을 못 구웠습니다 (경로에 한글이 있나?)");
  ff(["-i", 넉넉, "-vf", "crop=1080:1920:0:0", 바탕]);

  /* ② 틀에게 «제대로 그려졌는지» 묻는다. 그림은 이미 ①에서 한 벌로 나왔고, 여기서는 재기만 한다. */
  const 자 = 고양이자리(주소(공통));

  /* ③ 표지가 «틀어지지 않았는지» 잰다. 굽고 나서 눈으로 보기 전에 여기서 잡는다. */
  if (자.제목줄 > 자.적은줄)
    throw new Error(`${t.이름}: 제목이 ${자.적은줄}줄로 적혔는데 ${자.제목줄}줄로 흘러넘쳤습니다.\n` +
      `   큰 글자는 118px 라 한 줄에 «여덟 자» 안팎까지만 들어갑니다.\n` +
      `   title 을 짧게 끊으세요 — 넘친 채로 구우면 목록 칸과 고양이가 아래로 밀립니다.`);
  /* ⚠ 고양이와 목록이 «겹치는» 것은 막지 않는다 — 틀이 일부러 그렇게 짜였다.
     썸네일틀 주석: 「목록은 «언제나» 고양이보다 위에 있다(z-index 3 > .face 의 2)」.
     목록이 고양이를 덮고 그려져서 깊이가 생긴다. 2026-08-12 에 이걸 오류로 잡았다가 걷어냈다.

     다만 «아래 서명줄»은 다르다. 고양이가 그 선을 넘으면 로고와 편 이름 위에 발이 얹힌다.
     2026-08-12 에 사장님이 「9:16 커버 영역 틀어짐」이라 하신 게 이것이다. */
  const 서 = 자.서명;
  if (서 && 자.y + 자.h > 서.y)
    throw new Error(`${t.이름}: 고양이가 아래 서명줄을 ${자.y + 자.h - 서.y}px 넘어갔습니다 ` +
      `(고양이 아래 ${자.y + 자.h}, 서명줄 위 ${서.y}).\n` +
      `   썸네일틀.html 의 \`.v9 .face.cat\` 의 bottom 을 올리거나 img height 를 줄이세요.`);
  /* ④ 표지 한 장을 2초짜리 영상으로 굽는다. 겹칠 것이 없으므로 자국이 남을 자리도 없다. */
  const 인트로 = `${W}/intro_${t.이름}.mp4`;
  ff(["-loop", "1", "-t", String(인트로초), "-i", 바탕,
    "-vf", "fps=30,format=yuv420p", "-r", "30",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-an", 인트로]);

  /* ③ 인트로 + 본편을 «영상만» 잇는다. 본편에 이미 깔린 소리는 여기서 버려진다.
   *
   * ⚠ concat «필터» 를 쓰지 마라. 짧은 쪽을 앞에 두면 **뒤쪽을 조용히 잘라먹는다.**
   *   2026-08-12 에 당했다 — 인트로 2초 + 본편 37.8초를 이었는데 37.83초가 나왔다.
   *   경고 한 줄 없었고, 앞 2초는 멀쩡해서 눈으로는 멀쩡해 보였다. 잘린 건 **끝** 이었다.
   *   즉 «캡션과 프로필 링크를 확인해 주세요» 라는 마무리가 통째로 사라진 채 올라갈 뻔했다.
   *   같은 두 파일을 순서만 바꾸면 39.8초로 제대로 나온다. 순서를 타는 버그다.
   *   이음표(concat 디먹서) + -c copy 는 정확히 1194프레임을 낸다. 다시 굽지 않아 빠르기도 하다. */
  const 이은것 = `${W}/joined_${t.이름}.mp4`;
  const 이음표 = `${W}/이음_${t.이름}.txt`;
  writeFileSync(이음표, [인트로, t.영상].map((p) => `file '${p}'`).join("\n"), "utf8");
  ff(["-f", "concat", "-safe", "0", "-i", 이음표, "-c", "copy", 이은것]);

  /* 이었으면 «재본다». 붙였다고 믿지 않는다 — 위 버그가 정확히 그 틈으로 들어왔다. */
  const 잰길이 = (길) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries",
    "format=duration", "-of", "csv=p=0", 길]).toString().trim());
  const 본편초 = 잰길이(t.영상);
  const 이은초 = 잰길이(이은것);
  if (Math.abs(이은초 - (본편초 + 인트로초)) > 0.1)
    throw new Error(`${t.이름}: 이어붙이다 길이가 어긋났습니다 — ` +
      `인트로 ${인트로초} + 본편 ${본편초.toFixed(2)} = ${(본편초 + 인트로초).toFixed(2)} 여야 하는데 ${이은초.toFixed(2)}`);

  /* ④ 음악을 «처음부터 끝까지» 다시 깐다.
     ⚠ 이 단계를 빠뜨리면 «무음 영상»이 나온다. 2026-08-11 에 실제로 그랬다 —
       본편에는 소리가 있었는데 ③에서 -an 으로 버려 놓고 다시 안 넣었다.
       올리기 직전에 재 보고서야 알았다. **소리 없는 릴스는 그냥 조용한 그림이다.**
     인트로부터 소리가 나야 한다. 앞 2초를 조용히 두면 「멈춘 줄 알았다」가 된다. */
  if (!t.음악) throw new Error(`${t.이름}: 음악이 없습니다 — 무음으로 내보내지 않습니다`);
  const 끝 = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration",
    "-of", "csv=p=0", 이은것]).toString().trim());
  ff(["-i", 이은것, "-i", `${마케팅}/릴스영상/_음악/${t.음악}`, "-filter_complex",
    `[1:a]atrim=0:${끝.toFixed(3)},asetpts=N/SR/TB,volume=0.5,` +
    `afade=t=in:st=0:d=1.2,afade=t=out:st=${(끝 - 2).toFixed(2)}:d=2[a]`,
    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
    "-shortest", "-movflags", "+faststart", t.낼길]);

  /* ⑤ 소리가 «실제로» 들어갔는지 잰다. 넣었다고 믿지 않는다.
     ⚠ ffmpeg 은 volumedetect 값을 «stderr» 로 뱉는다. execFileSync 는 stdout 만 돌려주므로
       그것으로 읽으면 늘 비어서 「소리가 안 들어갔다」가 된다. spawnSync 로 둘 다 받는다. */
  const 잰것 = spawnSync("ffmpeg", ["-hide_banner", "-i", t.낼길, "-af", "volumedetect",
    "-f", "null", "-"], { encoding: "utf8" });
  const dB = /mean_volume:\s*(-?[\d.]+) dB/.exec(`${잰것.stderr}${잰것.stdout}`)?.[1];
  if (!dB) throw new Error(`${t.이름}: 소리가 안 들어갔습니다`);

  console.log(`  커버 그림 ${포즈길.split("/").pop()} → ${자.w}×${자.h} @ (${자.x}, ${자.y}) · ±${흔들폭}px`);
  console.log(`  인트로 ${인트로초}초 + 본편 → ${끝.toFixed(1)}초 · 소리 ${dB} dB · ${t.음악}`);
}
console.log("\n끝났습니다.");
