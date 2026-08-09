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
import {
  LAYOUTS, STRUCTURES, THUMBS, STRUCTURE_COLS, GRID_GAP, cardWidth, gridBaseCss,
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
      const g = 속.match(/(?<!-)\b(gap|column-gap|row-gap)\s*:\s*(?!var\()([^;{}"]{1,24})/);
      if (g && /\d/.test(g[2])) {
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
for (const f of css들) {
  const 글 = readFileSync(f, "utf8");
  for (const [이름, 값] of Object.entries(정해진값)) {
    const m = 글.match(new RegExp(`${이름}\\s*:\\s*([^;]+);`));
    if (!m) continue;
    const 쓴값 = m[1].trim();
    if (쓴값 !== 값) 걸림(짧게(f), `${이름} 이 ${쓴값} 입니다 — 가이드는 ${값}`);
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
        "--headless=new", "--disable-gpu", "--hide-scrollbars",
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
