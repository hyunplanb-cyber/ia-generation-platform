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
      const t = l.trim();
      const m = t.match(/^#+\s*영상\s+(.+?)\s*$/);
      if (m) { 담기(); 지금 = 알맹이(m[1]).toLowerCase(); 담을것 = []; continue; }
      /* ⛔ 「## 영상 …」이 아닌 «다른 머리글»을 만나면 그 앞에서 끊는다 (2026-08-20).
         안 그러면 뒤에 붙인 「# 없어진 녹화본」 같은 글이 앞 영상의 의도로 딸려 들어간다. */
      if (t.startsWith("#")) { 담기(); 지금 = null; 담을것 = []; continue; }
      if (/^-{3,}$/.test(t)) continue;                    /* 가로줄은 글이 아니다 */
      if (지금) 담을것.push(l);
    }
    담기();
  }
  return { 머리, 의도 };
}

/** 파일 이름 맨 앞 숫자 = 분류. 「2. 완성화면_공구.mp4」 → "2" */
const 분류 = (f) => (f.match(/^\s*(\d+)\./) || [, null])[1];

let 합초 = 0, 합개 = 0, 의도붙은것 = 0;
/* ⛔ 「_」 로 시작하는 폴더는 재료다(_음악·_폰트·_모델·_새틀견본·_카드영상 …). 목록에 넣지 않는다.
   딱 하나 `_촬영영상` 만 예외다 — 사장님이 촬영본을 여기에 모으신다.
   ⚠ 「영상이 들었으면 본다」로 했더니 _모델·_새틀견본·_카드영상까지 딸려 나와 잡음이 됐다.
      이름을 «집어서» 여는 편이 정확하다. 새 촬영 폴더가 생기면 여기에 한 줄 더한다. (2026-08-20) */
const 촬영폴더 = new Set(["_촬영영상"]);
const 방들 = readdirSync(뿌리, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith(".")
    && (!e.name.startsWith("_") || 촬영폴더.has(e.name)))
  .map((e) => e.name)
  .sort((a, b) => {
    /* 사장님이 새로 담으시는 `_촬영영상` 을 맨 위로 — 제일 먼저 봐야 하는 것이다. */
    if (a === "_촬영영상") return -1;
    if (b === "_촬영영상") return 1;
    return (parseInt(a) || 999) - (parseInt(b) || 999);
  });

/* ⭐ 2026-09-10 — 「2. 완성화면」이 «세트 폴더»가 되었다 (현님 지시로 폴더를 갈랐다).
 *     _촬영영상/2. 완성화면_인테리어_프리미엄/
 *         화면영역.mp4 · 클로드영역.mp4 · _통짜.mp4
 *   여태 이 도구는 «한 단»만 봐서, 옮기고 나면 완성화면 아홉 개가 목록에서 통째로 사라진다.
 *   → 폴더 안에 영상이 있으면 그 폴더를 «한 줄»로 친다. 분류는 «폴더 이름»의 맨 앞 숫자다.
 *     대표는 화면영역 > _통짜 > 아무거나 순으로 고른다 (길이·크기를 그것으로 적는다). */
/* ⭐ 2026-09-10 저녁 — 현님이 «갈래 폴더»를 한 층 더 두셨다. 「앞으로 영상이 계속 늘어날 것」이라서다.
 *     _촬영영상/
 *       1. 팩생성/…mp4      3. 검수영상/…mp4      4. 비교/…mp4      기타_….mp4
 *       2. 완성화면/<회차>/{화면영역, 클로드영역, _통짜}.mp4      ← 여기만 한 층 더
 *
 *   그래서 «두 층»을 걷는다. 깊이로 가른다 — 이름으로 가르면 갈래가 늘 때마다 여기를 고쳐야 한다.
 *   ⚠ 아침까지는 세트가 «_촬영영상 바로 아래»에 있었다. 그 자리도 계속 본다 —
 *     옮기다 만 것이 있어도 목록에서 사라지지 않게. */
function 촬영본걷기(방길) {
  const 낱개 = [], 세트 = [];
  const 대표고르기 = (안) =>
    안.find((f) => f.startsWith("화면영역")) ?? 안.find((f) => f.startsWith("_통짜")) ?? 안[0];
  const 낱개담기 = (터, 앞) => {
    for (const f of readdirSync(터).filter(영상인가))
      낱개.push({ 보임: 앞 ? `${앞}/${f}` : f, 길: join(터, f) });
  };
  const 세트담기 = (터, 앞) => {
    for (const e of readdirSync(터, { withFileTypes: true })) {
      if (!e.isDirectory() || e.name.startsWith(".")) continue;
      const 안 = readdirSync(join(터, e.name)).filter(영상인가);
      if (!안.length) continue;
      세트.push({ 폴더: e.name, 보임: 앞 ? `${앞}/${e.name}` : e.name,
                  안, 대표: 대표고르기(안), 길: join(터, e.name) });
    }
  };

  낱개담기(방길, "");                                  // 뿌리에 바로 둔 것 (기타_….mp4)
  for (const e of readdirSync(방길, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name.startsWith(".")) continue;
    const 갈래길 = join(방길, e.name);
    const 안폴더 = readdirSync(갈래길, { withFileTypes: true }).filter((x) => x.isDirectory());
    if (안폴더.length) { 낱개담기(갈래길, e.name); 세트담기(갈래길, e.name); }   // 갈래 폴더
    else if (readdirSync(갈래길).some(영상인가)) {
      /* 영상만 든 폴더 — 갈래(1·3·4)이면 낱개, 옛 자리에 남은 세트면 세트. 이름으로 가른다:
         「화면영역/클로드영역/_통짜」가 들었으면 세트다. */
      const 안 = readdirSync(갈래길).filter(영상인가);
      if (안.some((f) => /^(화면영역|클로드영역|_통짜)/.test(f)))
        세트.push({ 폴더: e.name, 보임: e.name, 안, 대표: 대표고르기(안), 길: 갈래길 });
      else 낱개담기(갈래길, e.name);
    }
  }
  return { 낱개, 세트 };
}

for (const 방 of 방들) {
  const 방길 = join(뿌리, 방);
  const 걸은것 = 방 === "_촬영영상" ? 촬영본걷기(방길)
    : { 낱개: readdirSync(방길).filter(영상인가).map((f) => ({ 보임: f, 길: join(방길, f) })), 세트: [] };
  const 것들 = 걸은것.낱개, 세트 = 걸은것.세트;
  if (!것들.length && !세트.length) continue;

  const 메모 = 메모읽기(방길);
  let 방초 = 0;
  const 줄 = [];
  for (const it of 것들) {
    const f = it.보임, 길 = it.길;
    const m = 재기(길);
    const 메가 = Math.round(statSync(길).size / 1e6);
    방초 += m?.초 ?? 0;
    /* 비율을 같이 적는다 — 9:16(0.56) 은 그대로, 1.28 은 가로 칸, 16:9(1.78) 은 가로.
       녹화본 비율을 모르고 자르면 메뉴·단추가 반씩 잘린다. */
    const 갈래 = 분류(f.includes("/") ? f.slice(f.indexOf("/") + 1) : f);
    줄.push(`      ${갈래 ? `[${갈래}] ` : ""}${f}  ${m ? `${Math.round(m.초)}초 · ${m.w}×${m.h} · 비율 ${(m.w / m.h).toFixed(2)}` : "(못 읽음)"} · ${메가}MB`);

    /* 이 영상에 붙은 「현의 의도」 */
    /* ⛔ 2026-09-10 — «보임» 에는 갈래 폴더가 앞에 붙는다(「4. 비교/4. 비교_….mp4」).
       그대로 열쇠로 쓰면 _메모.md 의 「## 영상 <파일이름>」과 안 맞아 의도가 통째로 사라진다.
       실제로 두 편의 의도가 0개로 찍혔다. 열쇠는 «파일 이름»만 쓴다. */
    const 제것 = 메모?.의도.get(알맹이(f.slice(f.lastIndexOf("/") + 1)).toLowerCase());
    if (제것?.length) {
      의도붙은것 += 1;
      for (const l of 제것) 줄.push(`          ✎ ${l.trim()}`);
    }
  }
  /* 세트 폴더 — 한 줄로 친다 */
  for (const s of 세트) {
    const 길 = join(s.길, s.대표);
    const m = 재기(길);
    const 메가 = Math.round(s.안.reduce((a, f) => a + statSync(join(s.길, f)).size, 0) / 1e6);
    방초 += m?.초 ?? 0;
    const 갈래 = 분류(s.폴더);   // 폴더 이름 맨 앞 숫자 (「2. 완성화면_인테리어_프리미엄」 → 2)
    const 짜임 = s.안.some((f) => f.startsWith("화면영역")) && s.안.some((f) => f.startsWith("클로드영역"))
      ? "세트(화면영역+클로드영역)" : "통짜만";
    줄.push(`      ${갈래 ? `[${갈래}] ` : ""}${s.보임}/  ${짜임}  ${m ? `${Math.round(m.초)}초 · ${m.w}×${m.h} · 비율 ${(m.w / m.h).toFixed(2)}` : "(못 읽음)"} · ${메가}MB`);
    줄.push(`          · ${s.안.join(" · ")}`);
    const 제것 = 메모?.의도.get(s.폴더.toLowerCase());
    if (제것?.length) { 의도붙은것 += 1; for (const l of 제것) 줄.push(`          ✎ ${l.trim()}`); }
  }

  합초 += 방초; 합개 += 것들.length + 세트.length;
  console.log(`\n  ${방}  —  ${것들.length + 세트.length}개 · ${시분(방초)}`);
  if (메모?.머리?.length) for (const l of 메모.머리) console.log(`      ▣ ${l}`);
  console.log(줄.join("\n"));
}

console.log(`\n모두 ${합개}개 · ${시분(합초)} · 「현의 의도」가 붙은 영상 ${의도붙은것}개`);
console.log("⚠ 비율 0.56 = 9:16(쇼츠 그대로) · 1.28 = 가로 칸에 맞음 · 1.78 = 16:9");
console.log("▣ 표는 그 폴더 전체에 걸리는 말 — 분류 정의·만드는 규칙이다.");
console.log("✎ 표는 그 영상 하나에 붙은 「현의 의도」다.");
console.log("   ⭐ 의도는 «출발선»이지 «울타리»가 아니다. 적힌 문구를 그대로 쓰지 말고 각색한다.");
console.log("   ⭐ 의도가 없는 영상도 스스로 기획해서 만든다.");
