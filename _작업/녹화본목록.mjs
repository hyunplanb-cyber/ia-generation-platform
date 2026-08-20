/* 릴스영상 아래에 «어떤 녹화본이 얼마나» 있는지, 그리고 «무엇을 보여 주려고 찍었는지»를
 * 세어서 보여 준다.
 *
 * 왜 (2026-08-13)
 *   루틴 지시서가 원본 목록을 «손으로 적어» 두고 있었다 —
 *   「8. lms 4시간38분 / 5. 뷰티샵 3시간8분 …」.
 *   사장님이 「12. AI팩 만드는 과정」을 새로 넣으셨는데 목록에 없으니 루틴이 못 본다.
 *   **손으로 적은 목록은 반드시 썩는다.** 세어서 쓴다.
 *
 * ⭐ 「현의 의도」도 같이 읽는다 (2026-08-20)
 *   녹화본만 보면 «무엇을 보여 주려고 찍었는지»를 알 수 없다. 그동안은 채팅으로만 오갔고,
 *   다음 주 루틴은 그 말을 못 봤다. 지시서에 적으면 썩으니 **파일 옆에 두고 읽는다.**
 *
 *   ⛔ 전에는 `_` 로 시작하는 폴더를 통째로 건너뛰었다. 그래서 사장님이 촬영본을 모아 두신
 *      `_촬영영상` 이 **아예 안 보였다.** 지금은 «영상이 든» 폴더면 이름과 상관없이 본다.
 *
 * 쓰는 법:  node _작업/녹화본목록.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/* ⛔ 헤드리스 크롬은 부를 때마다 %TEMP% 아래 HeadlessChrome<난수> 를 만들고 «끝나도 안 지운다».
   여기서는 크롬을 안 쓰지만, 같은 갈래 도구가 쌓아 둔 것을 지나가는 김에 치운다. */

const 뿌리 = "판매용_템플릿/_마케팅/릴스영상";
const 영상인가 = (f) => /\.(mp4|mov|m4v|webm)$/i.test(f);

/** ffprobe 는 «머리»만 읽는다 — 몇 기가짜리라도 금방이다. */
function 재기(길) {
  try {
    const 글 = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0",
      "-show_entries", "stream=width,height", "-show_entries", "format=duration",
      "-of", "default=nw=1:nk=1", 길], { encoding: "utf8" });
    const [w, h, d] = 글.trim().split(/\s+/).map(Number);
    return { w, h, 초: d };
  } catch { return null; }
}

const 시분 = (초) => `${Math.floor(초 / 3600)}시간 ${String(Math.round((초 % 3600) / 60)).padStart(2, "0")}분`;
const 줄나눔 = (글) => 글.split(String.fromCharCode(10)).map((l) => l.replace(/\s+$/, ""));

/** 파일 이름에서 «영상 확장자»만 뗀다.
 *  ⛔ 마지막 점에서 무턱대고 자르면 안 된다 — 파일 이름이 「4. 비교_…」 처럼 점으로 시작하면
 *     메모에 적힌 「4. 비교_…」(확장자 없음)가 「4」 로 잘려 짝이 안 맞는다. (2026-08-20) */
const 알맹이 = (f) => f.replace(/\.(mp4|mov|m4v|webm)$/i, "");

/* ── 「_메모.md」 읽기 ──────────────────────────────────────────
 *
 * 사장님이 자유롭게 쓰시되 두 가지만 지키시면 기계가 읽는다:
 *   · 「# 현의 의도」 머리글 아래에 의도를 적는다
 *   · 영상 하나마다 「## 영상 <파일이름>」 로 시작한다
 *
 * 그 위(머리글 앞)는 통째로 «그 폴더 전체에 걸리는 말»로 본다 — 분류 정의·만드는 규칙 따위.
 */
function 메모읽기(방길) {
  let 글;
  try { 글 = readFileSync(join(방길, "_메모.md"), "utf8"); } catch { return null; }
  const 줄 = 줄나눔(글);
  const 의도자리 = 줄.findIndex((l) => /^#+\s*현의 의도/.test(l.trim()));

  /* ⛔ 머리말을 통째로 찍지 않는다 (2026-08-20).
     사장님이 쓰신 안내문까지 다 나오면 매주 서른 줄이 쏟아져 잡음이 된다.
     루틴이 «실제로 판단에 쓰는 것» 둘만 뽑는다 — 분류 표와 만드는 규칙. */
  const 위 = 의도자리 < 0 ? 줄 : 줄.slice(0, 의도자리);
  const 머리 = [];

  /* ① 분류 표 — 「| 2 | 완성화면 | … |」 를 한 줄로 줄인다 */
  const 갈래표 = [];
  for (const l of 위) {
    const m = l.trim().match(/^\|\s*(\d+|기타)\s*\|\s*([^|]+?)\s*\|/);
    if (m) 갈래표.push(`${m[1]}=${m[2]}`);
  }
  if (갈래표.length) 머리.push("분류  " + 갈래표.join(" · "));

  /* ② 만드는 규칙 — 그 머리글 아래 목록만. 굵게 표시(**)는 떼고 읽기 좋게 잇는다. */
  const 규칙자리 = 위.findIndex((l) => /^#+\s*만드는 규칙/.test(l.trim()));
  if (규칙자리 >= 0) {
    for (const l of 위.slice(규칙자리 + 1)) {
      const t = l.trim().split("**").join("");
      if (t.startsWith("#") || /^-{3,}$/.test(t)) break;   /* 다음 머리글이나 가로줄에서 멈춘다 */
      if (/^[-*]\s/.test(t)) 머리.push("· " + t.replace(/^[-*]\s*/, ""));
      else if (t && 머리.length > 1) 머리[머리.length - 1] += " " + t;
    }
  }

  /** { 파일알맹이(소문자) : [줄들] } */
  const 의도 = new Map();
  if (의도자리 >= 0) {
    let 지금 = null, 담을것 = [];
    const 담기 = () => { if (지금) 의도.set(지금, 담을것.filter((l) => l.trim())); };
    for (const l of 줄.slice(의도자리 + 1)) {
      const m = l.trim().match(/^#+\s*영상\s+(.+?)\s*$/);
      if (m) { 담기(); 지금 = 알맹이(m[1]).toLowerCase(); 담을것 = []; continue; }
      if (지금) 담을것.push(l);
    }
    담기();
  }
  return { 머리, 의도 };
}

/** 파일 이름 맨 앞 숫자 = 분류. 「2. 완성화면_공구.mp4」 → "2" */
const 분류 = (f) => (f.match(/^\s*(\d+)\./) || [, null])[1];

let 합초 = 0, 합개 = 0, 의도붙은것 = 0;
/* ⛔ 이름이 「_」 로 시작해도 «영상이 들어 있으면» 본다. `_촬영영상` 이 여기 걸려 안 보였다.
   대신 재료 폴더(_음악·_폰트·_모델 …)는 영상이 없으니 저절로 걸러진다. */
const 방들 = readdirSync(뿌리, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith("."))
  .map((e) => e.name)
  .sort((a, b) => {
    /* 사장님이 새로 담으시는 `_촬영영상` 을 맨 위로 — 제일 먼저 봐야 하는 것이다. */
    if (a === "_촬영영상") return -1;
    if (b === "_촬영영상") return 1;
    return (parseInt(a) || 999) - (parseInt(b) || 999);
  });

for (const 방 of 방들) {
  const 방길 = join(뿌리, 방);
  const 것들 = readdirSync(방길).filter(영상인가);
  if (!것들.length) continue;

  const 메모 = 메모읽기(방길);
  let 방초 = 0;
  const 줄 = [];
  for (const f of 것들) {
    const 길 = join(방길, f);
    const m = 재기(길);
    const 메가 = Math.round(statSync(길).size / 1e6);
    방초 += m?.초 ?? 0;
    /* 비율을 같이 적는다 — 9:16(0.56) 은 그대로, 1.28 은 가로 칸, 16:9(1.78) 은 가로.
       녹화본 비율을 모르고 자르면 메뉴·단추가 반씩 잘린다. */
    const 갈래 = 분류(f);
    줄.push(`      ${갈래 ? `[${갈래}] ` : ""}${f}  ${m ? `${Math.round(m.초)}초 · ${m.w}×${m.h} · 비율 ${(m.w / m.h).toFixed(2)}` : "(못 읽음)"} · ${메가}MB`);

    /* 이 영상에 붙은 「현의 의도」 */
    const 제것 = 메모?.의도.get(알맹이(f).toLowerCase());
    if (제것?.length) {
      의도붙은것 += 1;
      for (const l of 제것) 줄.push(`          ✎ ${l.trim()}`);
    }
  }
  합초 += 방초; 합개 += 것들.length;
  console.log(`\n  ${방}  —  ${것들.length}개 · ${시분(방초)}`);
  if (메모?.머리?.length) for (const l of 메모.머리) console.log(`      ▣ ${l}`);
  console.log(줄.join("\n"));
}

console.log(`\n모두 ${합개}개 · ${시분(합초)} · 「현의 의도」가 붙은 영상 ${의도붙은것}개`);
console.log("⚠ 비율 0.56 = 9:16(쇼츠 그대로) · 1.28 = 가로 칸에 맞음 · 1.78 = 16:9");
console.log("▣ 표는 그 폴더 전체에 걸리는 말 — 분류 정의·만드는 규칙이다.");
console.log("✎ 표는 그 영상 하나에 붙은 「현의 의도」다.");
console.log("   ⭐ 의도는 «출발선»이지 «울타리»가 아니다. 적힌 문구를 그대로 쓰지 말고 각색한다.");
console.log("   ⭐ 의도가 없는 영상도 스스로 기획해서 만든다.");
