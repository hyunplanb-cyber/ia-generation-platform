/* 스펙팩에 «실어 보내는 검사 글»이 진짜로 도는지 잰다.
 *
 * 왜 있나 — 2026-09-01. 그 글을 손보다 두 번 틀렸다.
 *   ① 주석에 백틱을 써서 템플릿이 끊겼다 → `tsc` 가 잡았다.
 *   ② `lab(91.9 -0.6 5.1 / .85)` 를 «숫자만 뽑아» 읽어 밝은 회색을 새까맣게 봤다.
 *      멀쩡한 화면 8건을 흠으로 찍었는데 **아무도 못 잡았다** —
 *      브라우저에 손으로 붙여 넣어 보고서야 알았다.
 *
 *   손님 팩에 그대로 실려 나가는 코드다. 손님은 이 글을 자기 화면에 붙여 넣는다.
 *   헛경보를 쏟으면 「이 검수 못 믿겠다」가 된다 — 검수항목.md 의
 *   「헛경보를 내는 검사기는 없는 것만 못하다」가 그대로 적용되는 자리다.
 *   문법만 맞으면 통과하던 자리를 막는다.
 *
 * 쓰는 법
 *   npx tsx check-스펙팩글.mts
 *
 * 무엇을 보나
 *   ① 스펙팩이 만들어지나 · 그 안에 검사 글이 들어 있나
 *   ② 그 글이 문법에 맞나
 *   ③ «멀쩡한 화면»에서 조용한가         ← 헛경보를 막는 자리
 *   ④ «일부러 깨뜨린 화면»에서 잡아내나   ← 통과만 하는 검사기를 막는 자리
 *
 * ⚠ 견본 화면은 이 파일 안에서 만든다. 판매팩을 쓰지 않는다 —
 *   팩이 없는 컴퓨터에서도 돌아야 하고, 팩이 바뀌면 «검사기 탓»과 «팩 탓»이 섞인다.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildSpecPackMarkdown } from "./lib/export/spec-pack";
import type { Menu } from "./domain/menu/menu";
import type { Screen } from "./domain/screen/screen";
import type { ButtonAction } from "./domain/screen/button-action";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const 폭 = 1440,
  높이 = 900;
const 일할방 = join(tmpdir(), "cc-스펙팩글-" + process.pid);
const 크롬찌꺼기 = join(tmpdir(), "cc-스펙팩글-chrome-" + process.pid);

let 나쁨 = 0;
const 잘 = (말: string) => console.log("  ✓ " + 말);
const 못 = (말: string) => {
  나쁨 += 1;
  console.log("  ✗ " + 말);
};

console.log("스펙팩에 실어 보내는 «검사 글»을 잽니다\n");

/* ── ① 스펙팩을 만들어 검사 글을 꺼낸다 ─────────────────────────
   견본은 «검사 글이 나오게 하는 데» 필요한 만큼만 채운다.
   검사 글은 붙박이 문장이라 견본 내용에 따라 달라지지 않는다. */
const 견본프로젝트 = {
  concept: "견본 — 검사 글이 도는지만 본다",
  title: "견본",
  designConcept: null,
  deviceMode: "pc",
  overallStart: "2026-01-01",
  overallEnd: "2026-01-31",
};
const 견본메뉴 = [
  { id: "m1", projectId: "p1", nameKo: "홈", nameEn: "Home", menuCode: "HO", description: null, desiredFeatures: null },
] as unknown as Menu[];
const 견본화면 = [
  {
    id: "s1", projectId: "p1", menuId: "m1", pageId: "HO0101", pageName: "첫 화면",
    screenGroup: null, status: "DONE", screenRole: "list", deviceCode: "PC",
    funcDef: "목록을 보여 준다", prompt: "첫 화면을 그린다",
    pageIdSource: "AI", pageNameSource: "AI",
  },
] as unknown as Screen[];

let 마크다운 = "";
try {
  마크다운 = buildSpecPackMarkdown(견본프로젝트, 견본메뉴, 견본화면, [] as ButtonAction[]);
  잘("스펙팩이 만들어집니다 (" + 마크다운.split("\n").length.toLocaleString() + "줄)");
} catch (e) {
  못("스펙팩을 못 만들었습니다 — " + (e as Error).message);
  process.exit(1);
}

const 글덩이 = [...마크다운.matchAll(/```js\n([\s\S]*?)\n```/g)].map((m) => m[1]);
if (!글덩이.length) {
  못("스펙팩 안에 검사 글(```js)이 하나도 없습니다");
  process.exit(1);
}
잘("검사 글 " + 글덩이.length + "덩이가 들어 있습니다");

/* ── ② 문법에 맞나 ─────────────────────────────────────────
   ⚠ `new Function` 으로 보면 안 된다. 7-9-2 는 node 로 돌리는 글이라 `import` 로 시작하는데,
     함수 몸통으로 읽으면 「모듈 밖에서는 import 를 못 쓴다」며 멀쩡한 글을 틀렸다고 한다.
     파일로 적어 `node --check` 에 맡기면 둘 다 제대로 본다. */
mkdirSync(일할방, { recursive: true });
for (const [i, 글] of 글덩이.entries()) {
  const 모듈인가 = /^\s*(import|export)\s/m.test(글);
  const 길 = join(일할방, "글" + (i + 1) + (모듈인가 ? ".mjs" : ".js"));
  writeFileSync(길, 글, "utf8");
  try {
    execFileSync(process.execPath, ["--check", 길], { stdio: "pipe" });
    잘(i + 1 + "번 글 — 문법 맞습니다 (" + 글.split("\n").length + "줄" + (모듈인가 ? " · node 용" : " · 브라우저용") + ")");
  } catch (e) {
    못(i + 1 + "번 글 — 문법이 틀렸습니다: " + String((e as { stderr?: Buffer }).stderr ?? (e as Error).message).slice(0, 200));
  }
}

/* 브라우저에서 도는 글 하나를 고른다 — 화면을 재는 것이라 getComputedStyle 을 쓴다. */
const 화면글 = 글덩이.find((g) => g.includes("getComputedStyle") && g.includes("적기("));
if (!화면글) {
  못("화면을 재는 글(7-9)을 못 찾았습니다");
  process.exit(1);
}

/* ── 견본 화면 둘 ────────────────────────────────────────── */
const 사진 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const 깨끗한화면 = (제이름: string) => `<!doctype html><html lang="ko"><meta charset="utf-8"><title>t</title>
<style>
 body{margin:0;background:#fff;color:#111;font:16px/1.6 system-ui;min-height:100dvh;display:flex;flex-direction:column}
 header{position:sticky;top:0;background:#fff;border-bottom:1px solid #ddd;padding:12px 24px}
 nav{display:flex;gap:16px}
 nav a{color:#333;text-decoration:none;font-weight:400}
 nav a.on{color:#111;font-weight:700;border-bottom:2px solid #111}
 main{flex:1 0 auto;padding:32px 24px 48px;display:flex;flex-direction:column;gap:40px;max-width:900px;margin:0 auto;width:100%}
 .cards{display:flex;gap:16px}
 .cards img{width:120px;height:80px;display:block}
 .tw{overflow:auto hidden}
 table{border-collapse:collapse;width:100%}
 td,th{border:1px solid #bbb;padding:8px;color:#111}
 footer{margin-top:40px;background:#f2f2f2;padding:24px;color:#222}
</style>
<header><nav>
 <a href="./${제이름}" class="on">지금 쪽</a>
 <a href="./가.html">다른 쪽</a>
 <a href="./나.html">또 다른 쪽</a>
 <a href="./다.html">그다음 쪽</a>
</nav></header>
<main>
 <section><h1>멀쩡한 화면</h1><p>여기서는 흠이 하나도 안 나와야 합니다.</p></section>
 <section class="cards"><div><img src="${사진}"></div><div><img src="${사진}"></div><div><img src="${사진}"></div></section>
 <section class="tw"><table><tr><th>가</th><th>나</th></tr><tr><td>값</td><td>값</td></tr></table></section>
 <section><p>글이 잘 읽히는 대비입니다.</p></section>
</main>
<footer>바닥글</footer></html>`;

const 깨진화면 = (제이름: string) => `<!doctype html><html lang="ko"><meta charset="utf-8"><title>t</title>
<style>
 body{margin:0;background:#fff;color:#111;font:16px/1.6 system-ui}
 header{position:static;background:#fff;padding:12px 24px}       /* 고정 — 안 붙였다 */
 nav{display:flex;gap:16px}
 nav a{color:#333;text-decoration:none;font-weight:400}           /* 메뉴 — 지금 쪽도 똑같다 */
 main{padding:24px 24px 0;max-width:900px;margin:0 auto}
 main > section{margin-bottom:40px}
 /* 간격 — 리듬(40)에서 혼자 6px 로 떨어진다.
    ⚠ 2px 으로 주면 안 잡힌다. 검사 글이 「margin 으로 «정해 둔» 자리는 흠이 아니다」로
      일부러 봐주기 때문이다. 리듬의 절반 아래로 «좁은» 자리라야 걸린다.
    ⚠ 안쪽 p 의 기본 여백(16px)을 지워야 한다. 안 지우면 «여백이 겹쳐 접혀»
      6px 으로 적어 둔 자리가 실제로는 16px 로 벌어져 안 걸린다. */
 main > section.붙임{margin-bottom:6px}
 .붙임 p,.아래칸 p{margin:0}
 .cards{display:flex;gap:16px;align-items:flex-start}
 .흐림{color:#c8c8c8}                                              /* 대비 — 흐린 글자 */
 .동그라미{border-radius:50%;width:200px;height:40px;background:#eee;border:0}  /* 버튼 — 타원 */
 .밀칸{overflow:auto hidden;width:300px}
 .밀칸 .속{width:900px;height:40px;background:#eee}
 .표칸{width:300px}
 .표칸 table{min-width:900px;border-collapse:collapse}
 footer{margin:0;background:#f2f2f2;padding:24px;color:#222}       /* 간격 — 본문에 맞붙였다 */
</style>
<header><nav>
 <a href="./${제이름}">지금 쪽</a>
 <a href="./가.html">다른 쪽</a>
 <a href="./나.html">또 다른 쪽</a>
 <a href="./다.html">그다음 쪽</a>
</nav></header>
<main>
 <section><h1>일부러 깨뜨린 화면</h1><p class="흐림">이 글은 흐려서 안 읽힙니다.</p></section>
 <section class="cards"><div><img src="${사진}" style="width:120px;height:80px;display:block"></div><div><img src="${사진}" style="width:120px;height:80px;display:block"></div><div><img src="${사진}" style="width:120px;height:30px;display:block"></div></section>
 <section class="붙임"><p>바로 아래 칸이 너무 가깝습니다.</p></section>
 <section class="아래칸"><p>붙은 다음 칸입니다.</p></section>
 <section class="단추칸"><button class="동그라미">눌러</button><span>옆에 무언가</span></section>
 <section class="밀칸"><div class="속"></div></section>
 <section class="살칸"><span class="next">›</span></section>
 <section class="표칸"><table><tr><th>가</th><th>나</th></tr><tr><td>값</td><td>값</td></tr></table></section>
</main>
<footer>바닥글</footer></html>`;

/* ── 크롬으로 한 장 재기 ─────────────────────────────────── */
function 재기(파일: string): { 흠: string[] } | { 오류: string } {
  let dom = "";
  try {
    dom = execFileSync(
      CHROME,
      [
        "--headless=new", "--user-data-dir=" + 크롬찌꺼기, "--disable-gpu",
        `--window-size=${폭},${높이}`, "--virtual-time-budget=8000", "--dump-dom",
        "file:///" + 파일.split(String.fromCharCode(92)).join("/"),
      ],
      { encoding: "utf8", stdio: "pipe", maxBuffer: 1 << 26 },
    );
  } catch (e) {
    return { 오류: "크롬이 못 돌았습니다 — " + (e as Error).message.slice(0, 120) };
  }
  const t = /<title>([\s\S]*?)<\/title>/.exec(dom)?.[1];
  if (!t) return { 오류: "결과를 못 받았습니다" };
  if (t.startsWith("ERR:")) return { 오류: "글이 돌다 멈췄습니다 — " + t.slice(4) };
  try {
    const j = JSON.parse(t.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
    return { 흠: j.흠 ?? [] };
  } catch {
    return { 오류: "결과가 JSON 이 아닙니다 — " + t.slice(0, 100) };
  }
}

if (!existsSync(CHROME)) {
  못("크롬을 못 찾았습니다 (" + CHROME + ") — 화면 시험을 건너뜁니다");
  process.exit(1);
}


/** 검사 글을 화면에 심는다. 글은 JSON 글자를 돌려주므로 제목에 그대로 담는다. */
function 심기(이름: string, html: string): string {
  const 길 = join(일할방, 이름);
  const 심은글 =
    "<script>addEventListener('load',function(){setTimeout(function(){try{document.title=(" +
    화면글 +
    ");}catch(e){document.title='ERR:'+e.message}},60)})<\/script>";
  writeFileSync(길, html.replace("</html>", 심은글 + "</html>"), "utf8");
  return 길;
}

/* ── ③ 멀쩡한 화면에서 조용한가 ──────────────────────────── */
const 깨끗결과 = 재기(심기("깨끗.html", 깨끗한화면("깨끗.html")));
if ("오류" in 깨끗결과) {
  못("멀쩡한 화면 — " + 깨끗결과.오류);
} else if (깨끗결과.흠.length) {
  못("멀쩡한 화면인데 흠 " + 깨끗결과.흠.length + "건을 찍었습니다 (헛경보)");
  for (const h of 깨끗결과.흠) console.log("       " + h);
} else {
  잘("멀쩡한 화면 — 조용합니다");
}

/* ── ④ 깨뜨린 화면에서 잡아내나 ──────────────────────────── */
const 잡아야할것 = ["고정", "간격", "버튼", "막대", "표", "메뉴", "대비", "사진"];
const 깨진결과 = 재기(심기("깨진.html", 깨진화면("깨진.html")));
if ("오류" in 깨진결과) {
  못("깨뜨린 화면 — " + 깨진결과.오류);
} else {
  const 칸들 = new Set(깨진결과.흠.map((h) => (h.match(/^\[([^\]]+)\]/) || [, ""])[1]));
  잘("깨뜨린 화면 — 흠 " + 깨진결과.흠.length + "건을 찍었습니다");
  for (const h of 깨진결과.흠) console.log("         · " + h);
  for (const 칸 of 잡아야할것) {
    if (칸들.has(칸)) console.log("       ✓ " + 칸);
    else 못("깨뜨려 두었는데 «" + 칸 + "» 을 못 잡았습니다");
  }
}

rmSync(일할방, { recursive: true, force: true });
rmSync(크롬찌꺼기, { recursive: true, force: true });

console.log(
  나쁨
    ? "\n⛔ " + 나쁨 + "군데가 걸렸습니다. 손님에게 이 글을 그대로 보내면 안 됩니다."
    : "\n✓ 실어 보내는 검사 글이 제대로 돕니다.",
);
process.exit(나쁨 ? 1 : 0);
