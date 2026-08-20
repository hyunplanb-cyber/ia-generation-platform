/* 만들어진 화면이 디자인 가이드대로인지 본다 — C단계 5번.
 *
 * check-presets.mts 와 무엇이 다른가
 *   check-presets — 우리 「가이드끼리」 말이 맞나 (글 vs 코드)
 *   여기          — 「AI가 만들어낸 화면」이 그 가이드대로인가
 *
 * 검사 항목은 지어낸 게 아니라, 2026-08-08 에 내가 실물 다섯 장을 만들며
 * 실제로 저지른 실수 그대로다. 내가 틀린 자리는 AI 도 틀린다.
 *
 * 글자로 재는 것 (빠르다)
 *   1. 간격에 날숫자를 썼나            gap:20px 처럼
 *   2. 정해준 값과 다른 값을 넣었나     --card-pad 가 24px 이 아닌 다른 값
 *   3. 사진 자리에 비율이 없나          .thumb 에 aspect-ratio 없음 → 늘어나 타원이 된다
 *   4. 카드 구조가 맞나                .card 안에 .thumb/.body 가 없음
 *   5. 한국어 줄바꿈 규칙이 있나        word-break:keep-all 없으면 어절이 잘린다
 *   9. 글자가 바탕 위에서 읽히나        대비 4.5(큰 글자 3.0). 바탕은 조상까지 거슬러 찾는다
 *
 * 띄워놓고 재는 것 (느리지만 진짜 값)
 *   6. 칸이 몇 개이고 카드가 몇 px 인가
 *   7. 카드 사이가 실제로 몇 px 벌어졌나
 *   8. 사진이 정말 그 비율로 그려졌나
 *
 *   왜 실측까지 하나 — 카드 폭이 틀렸던 것도 계산식을 봐서가 아니라
 *   띄워서 재 봤기 때문에 잡혔다. 글자만 봐서는 「몇 px 로 그려졌나」를 모른다.
 *
 * 재는 방법
 *   브라우저 드라이버를 안 깐다. 검사할 화면을 iframe 으로 안고 있는 껍데기를 만들어
 *   헤드리스 크롬으로 열고, 잰 값을 <title> 에 적어 --dump-dom 으로 꺼낸다.
 *   file:// 끼리 iframe 을 읽으려면 --allow-file-access-from-files 가 필요하다.
 *
 * 쓰는 법
 *   npx tsx check-design.mts <화면폴더> [레이아웃키]
 *   npx tsx check-design.mts "판매용_템플릿/_판매팩/여행_프리미엄/완성화면" search
 *   레이아웃키를 주면 칸 수·카드 폭·사진 비율을 가이드 값과 대조한다.
 */
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

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
import {
  LAYOUTS, STRUCTURES, THUMBS, STRUCTURE_COLS, GRID_GAP, cardWidth, gridBaseCss,
  contrast, TEXT_CONTRAST_MIN, DENSITIES,
} from "./lib/design-presets";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const [폴더인자, 레이아웃키] = process.argv.slice(2);
const SITE = 폴더인자 ?? "판매용_템플릿/_판매팩/여행_프리미엄/완성화면";
if (!existsSync(SITE)) throw new Error(`화면 폴더를 못 찾았어요: ${SITE}`);

const L = 레이아웃키 ? LAYOUTS.find((x) => x.key === 레이아웃키) : undefined;
if (레이아웃키 && !L) {
  throw new Error(`레이아웃 「${레이아웃키}」가 없습니다. 있는 것: ${LAYOUTS.map((x) => x.key).join(", ")}`);
}
const T = L ? THUMBS.find((t) => t.key === L.thumb)! : undefined;

type 급 = "FAIL" | "WARN";
const 문제: { 급: 급; 어디: string; 무엇: string }[] = [];
const 못됨 = (어디: string, 무엇: string) => 문제.push({ 급: "FAIL", 어디, 무엇 });
const 걸림 = (어디: string, 무엇: string) => 문제.push({ 급: "WARN", 어디, 무엇 });

/* ── 파일 모으기 ─────────────────────────────────────────── */
const 파일들: string[] = [];
(function 훑기(d: string) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) { if (!/^(node_modules|\.git|build)$/.test(e.name)) 훑기(p); }
    else if (/\.(css|html)$/.test(e.name)) 파일들.push(p);
  }
})(SITE);

const css들 = 파일들.filter((f) => f.endsWith(".css"));
const html들 = 파일들.filter((f) => f.endsWith(".html"));
console.log(`검사 대상: ${SITE}`);
console.log(`  css ${css들.length}개 · html ${html들.length}개${L ? ` · 레이아웃 ${L.label}` : " · (레이아웃키 없음 — 대조는 건너뜁니다)"}\n`);

const 짧게 = (p: string) => p.replace(SITE, "").replace(/^[\\/]/, "");

/* ── 1. 간격에 날숫자 ──────────────────────────────────────
   한 줄씩 다 찍으면 80줄이 넘어가 아무도 안 읽는다. 세어서 모아 알린다. */
{
  const 걸린곳: string[] = [];
  const 값모음 = new Set<string>();
  /* css 만 본다. html 의 인라인 style 까지 훑었더니 [^;]+ 가 문서 한 줄을
     통째로 물어 와서 메시지를 못 읽을 지경이 됐다(2026-08-08).
     값도 24자에서 끊는다 — 값이 길면 그건 값이 아니라 잘못 문 것이다. */
  /* 「격자」에 적은 숫자만 잡는다.
   *
   * 2026-08-09 에 좁혔다. 그전에는 gap 이 들어간 줄을 전부 잡아서, 완성화면 네 팩에
   * 21~32군데씩 찍혔다. 열어 보니 **하나도 격자가 아니었다** —
   *   .btn{ display:inline-flex; gap:6px }   버튼 안 아이콘과 글자 사이
   *   .delta{ gap:3px }                      숫자 옆 화살표
   * 가이드가 말하는 건 「카드를 늘어놓는 격자」다. 버튼 안 6px 은 격자가 아니다.
   *
   * 헛경보를 내는 검사기는 없는 것만 못하다 — 몇 번 겪으면 사람이 다 무시하게 된다.
   * 그래서 규칙 덩어리를 통째로 보고 **격자인 것만** 잰다. */
  for (const f of css들) {
    const 글 = readFileSync(f, "utf8");
    for (const m of 글.matchAll(/([^{}]*)\{([^}]*)\}/g)) {
      const 속 = m[2];
      const 격자다 = /display\s*:\s*(inline-)?grid|grid-template-columns|grid-auto-columns/.test(속);
      if (!격자다) continue;
      const g = 속.match(/(?<!-)\b(gap|column-gap|row-gap)\s*:\s*([^;{}"]{1,32})/);
      /* var() 가 «어디에» 있든 눈금에서 나온 값이다. 전에는 맨 앞만 봐서
         calc(var(--hair) * 2) 같은 «눈금에서 계산한 값»을 눈대중으로 봤다(2026-08-10). */
      /* gap:0 은 눈금에서 나올 값이 아니다 — 「띄우지 않는다」는 뜻이라 토큰이 없다.
         0 을 var(--s0) 로 적으라고 하면 없는 토큰을 만들게 된다(2026-08-11). */
      const 영이다 = /^0(px|rem|em)?(\s+0(px|rem|em)?)*$/.test(g?.[2].trim() ?? "");
      if (g && /\d/.test(g[2]) && !g[2].includes("var(") && !영이다) {
        const 줄번호 = 글.slice(0, m.index).split("\n").length;
        걸린곳.push(`${짧게(f)}:${줄번호}  ${m[1].trim().slice(0, 30)}`);
        값모음.add(g[2].trim());
      }
    }
  }
  if (걸린곳.length) {
    못됨(
      `${걸린곳.length}군데`,
      `간격에 숫자를 직접 적었습니다 (${[...값모음].sort().join(" · ")}) — ${걸린곳.slice(0, 3).join(", ")}${걸린곳.length > 3 ? " …" : ""}`
    );
  }
}

/* ── 2. 정해준 값과 다른가 ──────────────────────────────── */
/* 값을 손으로 다시 적지 않는다 — 여기 24/52/8 이 적혀 있었고, 그중 52 는
   가이드가 실제로 내보내는 값(48)과 달랐다. 검사기가 틀린 기준으로 재고 있었다는 뜻이다.
   가이드가 내보내는 CSS 에서 그대로 뽑아 쓴다(2026-08-09). */
const 가이드CSS = gridBaseCss();
const 가이드값 = (이름: string) =>
  가이드CSS.match(new RegExp(`${이름}\\s*:\\s*([^;]+);`))?.[1].trim() ?? "";
const 정해진값: Record<string, string> = {
  "--card-gap": `${GRID_GAP.x}px`,
  "--card-gap-y": `${GRID_GAP.y}px`,
  "--card-pad": 가이드값("--card-pad"),
  "--row-h": 가이드값("--row-h"),
  "--btn-gap": 가이드값("--btn-gap"),
};

/* ⚠ 가이드는 밀도를 «두 벌» 준다 — 넉넉하게(cozy)와 컴팩트(compact).
   그런데 가이드CSS 는 기본값인 넉넉하게만 내보낸다. 그래서 백오피스처럼
   «한 화면에 많이 담아야 하는» 팩이 컴팩트를 고르면, 가이드대로 골랐는데도
   매번 걸렸다(2026-08-10, 비즈니스관리 디럭스에서 처음 나왔다).

   무는 것은 «둘 다 아닐 때»뿐이다. 둘 중 하나면 어느 쪽을 골랐는지만 알린다 —
   틀린 기준으로 재는 검사기는 헛경보를 내고, 헛경보는 사람이 다 무시하게 만든다. */
const 밀도값 = (키: "cardPad" | "rowH" | "btnGap") =>
  new Map(DENSITIES.map((d) => [d[키], d.label] as const));
const 밀도표: Record<string, Map<string, string>> = {
  "--card-pad": 밀도값("cardPad"),
  "--row-h": 밀도값("rowH"),
  "--btn-gap": 밀도값("btnGap"),
};

for (const f of css들) {
  const 글 = readFileSync(f, "utf8");
  const 고른밀도 = new Set<string>();
  for (const [이름, 값] of Object.entries(정해진값)) {
    const m = 글.match(new RegExp(`${이름}\\s*:\\s*([^;]+);`));
    if (!m) continue;
    const 쓴값 = m[1].trim();
    if (쓴값 === 값) continue;
    const 밀도 = 밀도표[이름]?.get(쓴값);
    if (밀도) { 고른밀도.add(밀도); continue; }
    걸림(짧게(f), `${이름} 이 ${쓴값} 입니다 — 가이드는 ${값}`);
  }
  /* 한 파일 안에서 밀도가 섞이면 그건 «고른 것»이 아니라 «흘린 것»이다. */
  if (고른밀도.size === 1) {
    console.log(`  · [${짧게(f)}] 밀도 「${[...고른밀도][0]}」 눈금을 씁니다 — 가이드가 주는 두 벌 중 하나입니다`);
  } else if (고른밀도.size > 1) {
    못됨(짧게(f), `밀도가 섞였습니다 (${[...고른밀도].join(" · ")}) — 한 화면은 한 벌만 씁니다`);
  }
}

/* ── 3. 사진 자리에 비율이 없나 ──────────────────────────── */
for (const f of css들) {
  const 글 = readFileSync(f, "utf8");
  const 썸네일규칙 = [...글.matchAll(/\.thumb[^{}]*\{([^}]*)\}/g)];
  if (썸네일규칙.length === 0) continue;
  const 비율있음 = 썸네일규칙.some((m) => /aspect-ratio\s*:/.test(m[1]));
  if (!비율있음) {
    못됨(짧게(f), ".thumb 에 aspect-ratio 가 없습니다 — 사진이 늘어나 타원이 됩니다");
  }
}

/* ── 4. 카드 구조 ──────────────────────────────────────────
   ⚠ 이 검사는 「우리 카드 규격(.card > .thumb + .body)으로 만든 화면」에만 뜻이 있다.
   처음엔 이걸 안 가려서, 자기 이름을 쓰는 옛 사이트에 「130장 실패」를 찍었다.
   우리 규칙으로 남의 규칙을 재면 검사기가 틀린 것이다(2026-08-08).

   ⚠⚠ 2026-08-09 — 그 가림막이 모자랐다. 「.card 를 쓰나」만 봤는데,
   **완성화면도 .card 를 쓴다. 다른 뜻으로.**
     우리   .card = 사진+글자 카드.        안에 .thumb + .body
     완성화면 .card = 상자(패널).           안에 .card-hd / .card-bd / .card-ft
                     사진 자리는 .ph-thumb · .ph-sq · .ph-circle 이다
   같은 낱말이 두 뜻이라 네 팩에 37~124장씩 헛경보가 찍혔다.
   그런데 가이드는 「사진 없는 상자는 이 규칙 밖」이라고 이미 적어 두었다 —
   즉 완성화면은 규칙을 어긴 게 아니라 **애초에 이 규칙의 대상이 아니었다.**

   이 사고는 이번이 세 번째다. `.card.wide`(카드 종류 ↔ 칸 수), `720px`(기준선 ↔ 읽기 폭),
   그리고 `.card`(카드 ↔ 상자). **이름이 겹치면 반드시 어디선가 터진다.** */
{
  /* 어느 어휘로 쓰인 화면인지 먼저 가른다. 상자 어휘(.card-hd/.card-bd)나
     자기네 사진 이름(.ph-*)이 보이면 우리 카드 규격이 아니다. */
  const 상자어휘 = html들.some((f) => /class="[^"]*\bcard-(hd|bd|ft)\b/.test(readFileSync(f, "utf8")));
  const 우리썸네일 = css들.some((f) => /\.thumb[^{}]*\{/.test(readFileSync(f, "utf8")));

  if (상자어휘 || !우리썸네일) {
    걸림(
      "카드 규격",
      상자어휘
        ? ".card 를 「상자(패널)」 뜻으로 쓰는 화면입니다 — 우리 .card(사진+글자)와 다른 어휘라 건너뜁니다"
        : "우리 카드 이름(.card > .thumb)을 안 쓰는 화면입니다 — 카드 구조 검사는 건너뜁니다",
    );
  } else {
    let 카드있는쪽 = 0, 구조없는쪽 = 0;
    for (const f of html들) {
      const 글 = readFileSync(f, "utf8");
      if (!/class="[^"]*\bcard\b/.test(글)) continue;
      카드있는쪽++;
      /* 사진 없는 카드(.card.text)는 .thumb 가 없는 게 맞다 */
      if (/class="[^"]*\bcard\b[^"]*\btext\b/.test(글)) continue;
      if (!/class="[^"]*\bthumb\b/.test(글)) 구조없는쪽++;
    }
    if (카드있는쪽 === 0) {
      걸림("카드 규격", "우리 카드 이름(.card)을 안 쓰는 화면입니다 — 카드 구조 검사는 건너뜁니다");
    } else if (구조없는쪽 > 0) {
      못됨(`화면 ${구조없는쪽}장`, ".card 는 쓰는데 안에 .thumb 가 없습니다 — 카드 CSS 가 안 붙습니다");
    }
  }
}

/* ── 5. 한국어 줄바꿈 ────────────────────────────────────── */
{
  /* html 안의 <style> 도 본다. css 파일만 봤더니, 스타일을 문서 안에 넣은 화면에
     「keep-all 이 없다」고 잘못 찍었다(2026-08-08). */
  const 어딘가에 = [...css들, ...html들]
    .some((f) => /word-break\s*:\s*keep-all/.test(readFileSync(f, "utf8")));
  if (!어딘가에) 못됨("css 전체", "word-break: keep-all 이 없습니다 — 한국어 어절이 한가운데서 잘립니다");
}

/* ── 9. 글자가 바탕 위에서 읽히나 (색 대비) ─────────────────
 *
 * 왜 늦게 붙었나 — 2026-08-09
 *   가이드의 색을 여러 번 고치는 동안(모노 #767676→#666666, 바이올렛, 코럴,
 *   그리고 「글자용 강조색」 신설) **검사기는 색을 아예 안 보고 있었다.**
 *   간격·카드구조·비율만 쟀다. 정작 가장 자주 바뀐 것이 사정권 밖이었다.
 *   그래서 완성화면 여덟 세트가 가이드대로인지 사람이 손으로 재야 했다.
 *   500장을 눈으로 볼 수는 없다 — 기계가 봐야 한다.
 *
 * 헛경보를 안 내는 것이 이 검사의 전부다.
 *   손으로 재 봤더니 「대비 미달」로 보이는 것 대부분이 정상이었다.
 *     .toast .act   #9FC0FF 1.83   ← 토스트는 «어두운» 팝업이다
 *     .btn[disabled] #A3A3A3 2.52  ← 비활성은 WCAG 가 최소치에서 빼 준다
 *     .map .pin.on   #FFFFFF 1.15  ← 강조색 «배경» 위 흰 글자
 *   그래서 셋을 지킨다.
 *     ① 바탕을 «조상 규칙까지 거슬러» 찾는다 (.toast 가 정한 배경을 .act 가 쓴다)
 *     ② 비활성·플레이스홀더는 뺀다 (앞은 규정 면제, 뒤는 관행)
 *     ③ 큰 글자는 3.0 으로 잰다 (24px 이상, 또는 18.66px 이상 굵은 글씨)
 */
{
  const 큰글자기준 = 3.0;
  const 본문기준 = TEXT_CONTRAST_MIN;
  const 걸린것: { 어디: string; 글자: string; 바탕: string; 값: number; 기준: number; 확실: boolean }[] = [];
  const 넘긴것: string[] = [];

  for (const f of css들) {
    const 글 = readFileSync(f, "utf8");

    // 변수부터 푼다. var(--accent) 로 적힌 색도 재야 한다.
    const 변수: Record<string, string> = {};
    for (const m of 글.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9A-Fa-f]{3,6})\b/gi)) {
      변수[m[1]] ??= m[2];
    }
    const 풀기 = (v: string | undefined): string | null => {
      if (!v) return null;
      const s = v.trim();
      const h = s.match(/^#[0-9A-Fa-f]{3,6}$/);
      if (h) return s;
      const vr = s.match(/^var\(\s*--([a-z0-9-]+)/i);
      if (vr && 변수[vr[1]]) return 변수[vr[1]];
      return null; // currentColor·rgba·gradient 는 안 잰다
    };

    /* 바탕이 «그림»이면 잴 수 없다 — 재려고 하면 안 된다.
     *
     * 처음엔 이걸 안 봐서 히어로 배너가 전부 걸렸다(2026-08-09).
     *   .hero{ background:linear-gradient(...); color:#fff }  → 1.15 라고 찍혔다
     * 그라데이션·사진은 색이 하나가 아니라 값을 못 낸다. 그런데 풀기() 가 null 을
     * 주니 「배경 없음」으로 보고 페이지 바탕(#F0EFEB)에 흰 글자를 얹은 걸로 읽었다.
     * **모르는 것과 없는 것은 다르다.** 그림 배경이면 아예 건너뛴다. */
    const 그림배경 = (속: string) =>
      /background(-image)?\s*:[^;{}]*(gradient|url\()/i.test(속);

    const 규칙 = [...글.matchAll(/([^{}]*)\{([^{}]*)\}/g)];

    /* 조상의 배경·글자크기를 찾기 위한 표 — 「이 class 는 이 배경/이 크기」.
       .toast{background:#111} 을 적어 두면 .toast .act 가 그것을 물려받는다.
       크기도 같이 물려받아야 한다 — 안 그러면 .logo{font-size:22px} 아래의
       .logo .em 을 본문(4.5)으로 재서 헛경보가 난다. */
    const 배경표: Record<string, string> = {};
    const 크기표: Record<string, { px: number; 굵기: number }> = {};
    const 그림배경표 = new Set<string>();
    const 헷갈리는이름 = new Set<string>();
    for (const m of 규칙) {
      const 배경 = 풀기(m[2].match(/(?:^|[;{\s])background(?:-color)?\s*:\s*([^;{}]+)/)?.[1]);
      const px = Number(m[2].match(/font-size\s*:\s*([0-9.]+)px/)?.[1] ?? 0);
      const 굵기 = Number(m[2].match(/font-weight\s*:\s*(\d+)/)?.[1] ?? 0);
      const 그림 = 그림배경(m[2]);
      for (const sel of m[1].split(",")) {
        const 마지막 = sel.trim().split(/\s+|>/).pop() ?? "";
        /* `.gnb.dark` 처럼 붙어 있는 것은 **뒤 class 를 열쇠로** 삼는다.
           `.gnb{background:#fff}` 과 `.gnb.dark{background:#111}` 이 같이 있는데
           앞만 보면 어두운 GNB 위 흰 글자를 「흰 바탕 위 흰 글자」로 읽는다. */
        const 클래스들 = [...마지막.matchAll(/\.([a-z0-9_-]+)/gi)].map((x) => x[1]);
        if (!클래스들.length || !/^\./.test(마지막)) continue;
        const 열쇠 = 클래스들.length > 1 ? 클래스들.join(".") : 클래스들[0];
        if (그림) 그림배경표.add(열쇠);
        /* 같은 이름이 자리마다 다른 배경을 가질 수 있다.
           `.tabs-pill .tab.on{background:surface}` 는 흰 바탕이고
           `.seg .tab.on{background:primary}` 는 코럴 바탕이다.
           먼저 만난 쪽으로 정해 버리면 **아닌 것을 아니라고 단정**하게 된다 —
           실제로 「코럴 글자가 코럴 바탕 위에 1.71」이라는 헛경보가 났다(2026-08-09).
           둘이 다르면 「모른다」로 두고 그 이름은 아예 재지 않는다. */
        if (배경) {
          if (배경표[열쇠] && 배경표[열쇠] !== 배경) 헷갈리는이름.add(열쇠);
          else 배경표[열쇠] ??= 배경;
        }
        if (px || 굵기) 크기표[열쇠] ??= { px, 굵기 };
      }
    }
    const 페이지바탕 = 변수["bg"] ?? "#FFFFFF";

    for (const m of 규칙) {
      const 선택자 = m[1].trim().split("\n").pop()!.trim();
      const 속 = m[2];
      if (/^\s*:?root/.test(선택자) || !선택자) continue; // 변수 정의 덩어리

      const 글자색 = 풀기(속.match(/(?:^|[;{\s])color\s*:\s*([^;{}]+)/)?.[1]);
      if (!글자색) continue;

      /* ② 못 재는 것·재면 안 되는 것을 먼저 걸러낸다.
         비활성은 WCAG 가 면제하고, 「마감·품절」도 회색으로 죽인 같은 성격이다. */
      if (/\[disabled\]|:disabled|\.is-off\b|\.disabled\b|\.off\b|\.full\b|\.sold\b|\.done\b/.test(선택자)) {
        넘긴것.push(`${선택자} (비활성·마감)`);
        continue;
      }
      if (/::placeholder/.test(선택자)) {
        넘긴것.push(`${선택자} (플레이스홀더)`);
        continue;
      }
      if (그림배경(속)) {
        넘긴것.push(`${선택자} (그림 배경)`);
        continue;
      }
      /* 남의 브랜드 색은 우리가 못 바꾼다.
         네이버는 초록 #03C75A 에 흰 글자(2.25)가 «공식 조합»이라, 고치면
         네이버 버튼으로 안 보인다. WCAG 도 로고타입은 면제한다.
         카카오(#FEE500 + 진한 갈색)는 자기 가이드가 이미 읽히는 조합이라 안 걸린다. */
      if (/\bnaver\b|\bkakao\b|\bapple\b|\bgoogle\b|\bfacebook\b|\bline\b/i.test(선택자)) {
        넘긴것.push(`${선택자} (남의 브랜드 색)`);
        continue;
      }
      /* 구분선은 글자가 아니다.
         `.stepbar .sep{color:var(--muted)}` 처럼 color 로 선 색을 정하는 자리가 있다.
         단계 사이를 잇는 장식이라 대비 규정 대상이 아니다(WCAG 1.4.11 「순수 장식」). */
      if (/\.(sep|divider|dot-line|rule)\b/.test(선택자)) {
        넘긴것.push(`${선택자} (구분선·장식)`);
        continue;
      }

      // ① 바탕 — 제 블록 → 조상 class → 페이지 순으로 찾는다.
      let 바탕 = 풀기(속.match(/(?:^|[;{\s])background(?:-color)?\s*:\s*([^;{}]+)/)?.[1]);
      let 그림물림 = false;
      if (!바탕) {
        for (const a of 선택자.split(/\s+|>/).slice(0, -1).reverse()) {
          const 클래스들 = [...a.matchAll(/\.([a-z0-9_-]+)/gi)].map((x) => x[1]);
          if (!클래스들.length) continue;
          /* 붙어 있는 것(.gnb.dark)을 먼저, 없으면 **부품 이름**(첫 class)만 본다.
             수식어(.on .active .sel)를 낱개로 찾으면 엉뚱한 부품과 이어진다 —
             `.acc-item.on` 의 `.on` 이 다른 부품의 파란 배경을 물어 와서
             「파란 글자가 파란 바탕 위에 1.00」이라고 찍혔다(2026-08-09). */
          const 후보 = [클래스들.join("."), 클래스들[0]];
          const 맞은것 = 후보.find((k) => 배경표[k] || 그림배경표.has(k) || 헷갈리는이름.has(k));
          if (!맞은것) continue;
          if (헷갈리는이름.has(맞은것)) { 그림물림 = true; break; } // 모르는 것은 안 잰다
          if (그림배경표.has(맞은것) && !배경표[맞은것]) { 그림물림 = true; break; }
          바탕 = 배경표[맞은것];
          break;
        }
      }
      if (그림물림) { 넘긴것.push(`${선택자} (바탕을 확정 못 함)`); continue; }
      바탕 ??= 페이지바탕;

      // ③ 큰 글자는 기준이 낮다. 크기는 제 블록 → 조상 순으로 찾는다.
      let px = Number(속.match(/font-size\s*:\s*([0-9.]+)px/)?.[1] ?? 0);
      let 굵기 = Number(속.match(/font-weight\s*:\s*(\d+)/)?.[1] ?? 0);
      if (!px || !굵기) {
        for (const a of 선택자.split(/\s+|>/).reverse()) {
          const cls = a.match(/\.([a-z0-9_-]+)/i);
          const 물림 = cls && 크기표[cls[1]];
          if (물림) { px ||= 물림.px; 굵기 ||= 물림.굵기; }
        }
      }
      굵기 ||= 400;
      const 큼 = px >= 24 || (px >= 18.66 && 굵기 >= 700);

      /* 기준을 «두 층»으로 나눈다 — 이게 헛경보를 가른다.
       *
       *   3.0 미만  무엇이든 틀렸다. 본문이든 큰 글자든 아이콘이든 이 밑은 안 보인다.
       *   3.0~4.5   «본문이면» 틀렸다. 아이콘·큰 글자면 맞다.
       *
       * CSS 만 봐서는 그 규칙이 글자에 붙는지 아이콘에 붙는지 확실히 모른다.
       * 모르는 것을 FAIL 로 올리면 사람이 검사기를 통째로 무시하게 된다 —
       * 격자 간격에서 이미 겪었다(위 1번 주석). 그래서 확실한 것만 FAIL 로 올린다. */
      const 값 = contrast(글자색, 바탕);
      const 아래층 = 값 < 큰글자기준;
      const 위층 = !큼 && 값 < 본문기준;
      if (아래층 || 위층) {
        const 줄번호 = 글.slice(0, m.index).split("\n").length;
        걸린것.push({
          어디: `${짧게(f)}:${줄번호}  ${선택자.slice(0, 34)}`,
          글자: 글자색, 바탕, 값,
          기준: 아래층 ? 큰글자기준 : 본문기준,
          확실: 아래층,
        });
      }
    }
  }

  const 확실한것 = 걸린것.filter((c) => c.확실).sort((a, b) => a.값 - b.값);
  const 의심되는것 = 걸린것.filter((c) => !c.확실).sort((a, b) => a.값 - b.값);
  for (const c of 확실한것.slice(0, 8)) {
    못됨(c.어디, `글자 ${c.글자} 가 바탕 ${c.바탕} 위에서 ${c.값.toFixed(2)} 입니다 — 아이콘이라도 ${c.기준} 은 넘어야 합니다`);
  }
  if (확실한것.length > 8) 못됨("색 대비", `그 밖에 ${확실한것.length - 8}군데가 3.0 밑입니다`);
  for (const c of 의심되는것.slice(0, 5)) {
    걸림(c.어디, `글자 ${c.글자} 가 바탕 ${c.바탕} 위에서 ${c.값.toFixed(2)} — 본문이면 ${c.기준} 이 필요합니다 (아이콘·큰 글자면 괜찮습니다)`);
  }
  if (의심되는것.length > 5) 걸림("색 대비", `그 밖에 ${의심되는것.length - 5}군데가 3.0~4.5 사이입니다`);
  if (넘긴것.length) 걸림("색 대비", `${넘긴것.length}군데는 규정상 빼고 셌습니다 (비활성·플레이스홀더)`);
}

/* ── 6~8. 띄워놓고 재기 ──────────────────────────────────── */
/* 재 볼 화면을 고른다. 카드가 든 화면이라야 격자를 잴 수 있다. */
const 잴화면 = html들
  .filter((f) => /class="[^"]*\bcards?\b/.test(readFileSync(f, "utf8")))
  .slice(0, 3);

/* 「카드 격자냐」를 나중에 파일 이름에서 다시 찾지 않는다.
   처음엔 표시용 문자열(".cards" 가 붙은 경로)을 정규식으로 뒤져 판별했는데,
   눈에는 .cards 가 보이는데도 걸러지지 않았다. 원인을 붙잡고 있느니
   잴 때 이미 아는 것을 값으로 들고 다니는 게 맞다(2026-08-08). */
type 잰것 = { 파일: string; 이름: string; 카드냐: boolean; 칸: number; 카드폭: number; 간격: number; 비율: number | null };
let 잰값: 잰것[] = [];

if (!existsSync(CHROME)) {
  걸림("실측", "크롬을 못 찾아 띄워서 재는 검사를 건너뛰었습니다");
} else if (잴화면.length === 0) {
  걸림("실측", "카드 격자가 있는 화면을 못 찾아 실측을 건너뛰었습니다");
} else {
  /* 작업 폴더에 한글이 있으면 크롬이 조용히 아무것도 안 만든다. 임시 폴더에서 돈다. */
  const 일터 = join(tmpdir(), "cc-design").replace(/\\/g, "/");
  mkdirSync(일터, { recursive: true });

  for (const f of 잴화면) {
    const 껍데기 = `${일터}/probe.html`;
    writeFileSync(껍데기, `<!doctype html><meta charset="utf-8">
<iframe id="f" src="file:///${resolve(f).replace(/\\/g, "/")}" style="width:1440px;height:900px;border:0"></iframe>
<script>
addEventListener("load", () => setTimeout(() => {
  let 답 = { err: null };
  try {
    const d = document.getElementById("f").contentDocument;
    const 후보 = [...d.querySelectorAll("*")].filter((el) => {
      const st = getComputedStyle(el);
      if (st.display !== "grid") return false;
      if (el.children.length < 3) return false;                 // 두 칸짜리는 격자라 보기 어렵다
      const 칸 = st.gridTemplateColumns.split(" ").filter(Boolean).length;
      return 칸 >= 2;                                            // 한 줄짜리는 카드 격자가 아니다
    });
    if (!후보.length) throw new Error("격자가 없습니다");
    /* 가장 넓은 것을 그 화면의 주 격자로 본다 */
    const 격자 = 후보.sort((a, b) =>
      b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0];
    const cs = getComputedStyle(격자);
    const 칸들 = cs.gridTemplateColumns.split(" ").filter(Boolean);
    const 첫카드 = 격자.firstElementChild;
    const 둘째 = 첫카드 && 첫카드.nextElementSibling;
    const a = 첫카드 && 첫카드.getBoundingClientRect();
    const b = 둘째 && 둘째.getBoundingClientRect();
    const 썸 = 첫카드 && 첫카드.querySelector(".thumb");
    const r = 썸 && 썸.getBoundingClientRect();
    답 = {
      이름: 격자.className || 격자.tagName.toLowerCase(),
      칸: 칸들.length,
      카드폭: a ? Math.round(a.width) : null,
      간격: (a && b) ? Math.round(b.left - a.right) : null,
      비율: (r && r.height) ? Number((r.width / r.height).toFixed(3)) : null,
    };
  } catch (e) { 답 = { err: String(e && e.message || e) }; }
  document.title = "CC" + JSON.stringify(답);
}, 400));
</script>`, "utf8");

    try {
      const dom = execFileSync(CHROME, [
        "--headless=new", "--user-data-dir=" + 크롬찌꺼기,  "--disable-gpu", "--hide-scrollbars",
        "--allow-file-access-from-files", "--virtual-time-budget=3000",
        "--window-size=1440,900", "--dump-dom", `file:///${껍데기}`,
      ], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
      const m = dom.match(/<title>CC(\{.*?\})<\/title>/);
      if (!m) { 걸림(짧게(f), "띄워서 재지 못했습니다"); continue; }
      const 결과 = JSON.parse(m[1]) as Record<string, number | string | null>;
      if (결과.err) { 걸림(짧게(f), `잴 수 없었습니다 — ${결과.err}`); continue; }
      const 격자이름 = String(결과.이름 ?? "");
      잰값.push({
        파일: 짧게(f), 이름: 격자이름,
        /* split(/s+/) 로 적었다가 한참 헤맸다 — 백슬래시가 먹혀서 공백이 아니라
           글자 「s」로 잘렸고, "cards" 가 ["card",""] 가 되어 늘 어긋났다.
           눈에는 .cards 가 보이는데 걸러지지 않아 원인을 못 찾고 있었다(2026-08-08). */
        카드냐: 격자이름.split(/\s+/).includes("cards"),
        칸: Number(결과.칸), 카드폭: Number(결과.카드폭),
        간격: Number(결과.간격), 비율: 결과.비율 === null ? null : Number(결과.비율),
      });
    } catch { 걸림(짧게(f), "크롬이 화면을 못 열었습니다"); }
  }
}

/* 잰 값을 가이드와 대조 */
if (잰값.length) {
  console.log("띄워놓고 잰 값 (1440px 기준)");
  for (const v of 잰값) {
    console.log(`  ${v.칸}칸 · 카드 ${v.카드폭}px · 사이 ${v.간격}px${v.비율 ? ` · 사진 ${v.비율}` : ""}`
      + `   ${v.파일}  (.${v.이름})${v.카드냐 ? "" : "  ← 카드 격자가 아니라 대조는 건너뜁니다"}`);
  }
  console.log("");

  /* 잰 격자가 「카드 격자」가 맞을 때만 대조한다.
     처음엔 화면에서 가장 넓은 격자를 무조건 카드 격자로 쳤는데,
     첫 화면의 링크 목록(.idx-list)과 바닥글 칸(.ft-cols)을 카드 가이드로 재고
     「틀렸다」고 찍었다. 남의 격자를 우리 자로 재면 검사기가 틀린 것이다.
     한때 표시용 경로를 정규식으로 뒤져 판별했는데, 경로에서 격자 이름을 떼어낸 뒤에도
     그 줄이 남아 늘 「없다」가 나왔다. 잴 때 정한 값을 그대로 쓴다(2026-08-08). */
  const 잰카드 = 잰값.filter((v) => v.카드냐);
  if (잰카드.length === 0) {
    걸림("실측 대조", "우리 격자 이름(.cards)을 쓴 화면이 없어 잰 값만 보여 드립니다");
  }
  for (const v of 잰카드) {
    /* 간격은 레이아웃과 무관하게 항상 같아야 한다 */
    if (Number.isFinite(v.간격) && Math.abs(v.간격 - GRID_GAP.x) > 1) {
      못됨(v.파일, `카드 사이가 ${v.간격}px 입니다 — 가이드는 ${GRID_GAP.x}px`);
    }
    if (!L || !T) continue;
    const [c1] = STRUCTURE_COLS[L.structure];
    const 기대폭 = cardWidth(c1, 1440, L.structure);
    if (v.칸 !== c1) 못됨(v.파일, `${v.칸}칸으로 그려졌습니다 — 가이드는 ${c1}칸`);
    /* 폭은 부모가 조금 다를 수 있으므로 2px 까지 봐준다 */
    else if (Math.abs(v.카드폭 - 기대폭) > 2) {
      못됨(v.파일, `카드가 ${v.카드폭}px 입니다 — 가이드는 ${기대폭}px`);
    }
    if (T.aspect && v.비율 !== null) {
      const [rw, rh] = T.aspect.split("/").map((x) => Number(x.trim()));
      const 기대비율 = rw / rh;
      if (Math.abs(v.비율 - 기대비율) > 0.02) {
        못됨(v.파일, `사진 비율이 ${v.비율} 입니다 — ${T.label}은 ${T.ratio}(${기대비율.toFixed(3)})`);
      }
    }
  }
}

/* ── 결과 ────────────────────────────────────────────────── */
const 못한것 = 문제.filter((i) => i.급 === "FAIL");
const 걸린것 = 문제.filter((i) => i.급 === "WARN");

for (const i of 문제) console.log(`  ${i.급 === "FAIL" ? "✗" : "△"} [${i.어디}] ${i.무엇}`);
if (문제.length) console.log("");

console.log(못한것.length === 0
  ? `통과했습니다${걸린것.length ? ` (봐줄 만한 것 ${걸린것.length}건)` : ""}`
  : `못 넘긴 것 ${못한것.length}건 · 봐줄 만한 것 ${걸린것.length}건`);
console.log("");
process.exit(못한것.length ? 1 : 0);
