/* 자바스크립트가 «없는 것»을 찾고 있는지 잰다 — 화면에 한 번도 안 붙는 선택자.
 *
 * ⛔ 왜 만드나 (2026-09-02 사장님: 「ES0101.html 화면 이상해」)
 *
 *   인테리어 프리미엄 ES0101 의 단계 막대가 «영원히 0%» 였다. 단계는 넘어가고
 *   「6단계 중 2번째」도 바뀌는데 막대만 붙박여 있었다. 까닭은 한 줄이었다 —
 *
 *     app.js  : wz.querySelector('.progress .fill')      ← 이걸 찾는데
 *     화면    : <div class="bar "><i style="width:0%">   ← 이렇게 구워졌고
 *     base.css: .bar i { ... }                            ← 칠하는 것도 .bar i 다
 *
 *   셋 중 둘이 어긋나 있었다. querySelector 는 못 찾으면 null 을 주고 조용히 끝난다.
 *   코드는 안 죽고, 화면도 안 깨지고, 그냥 «한 군데만» 안 움직인다.
 *
 * ⚠ 왜 다른 검수기가 못 잡았나 — 이게 이 파일이 있는 진짜 까닭이다.
 *   `check-반응` 은 «눌러서 뭔가 바뀌나»를 본다. 그런데 그 「다음」 단추는 단계 칸을
 *   갈아 끼우고 점을 옮기고 라벨도 고친다 — **바뀌는 게 넘친다.** 그래서 통과한다.
 *   「약속한 그 한 조각이 안 움직였다」는 눌러 보는 것만으로는 안 보인다.
 *   `check-design`(색·간격) · `check-pack`(파일·글자수) · `check-사진`(자리)도 마찬가지다.
 *   그래서 «누르지 않고 글로» 잰다 — 코드가 부르는 이름이 화면에 있기는 한가.
 *
 * ⭐ 어디까지만 말하나 — 이게 이 검사의 목숨이다.
 *   팩마다 app.js 는 «안 쓰는 기능까지 든 묶음»이다. 지도·캐러셀·동의 절차가
 *   그 팩에 없으면 그 선택자들은 통째로 안 붙는다. 그건 버그가 아니라 «안 쓴 것»이다.
 *   처음에 그것까지 세었더니 365개가 나왔다 — 그러면 아무도 안 본다.
 *
 *   그래서 «그 기능은 화면에 있는데 한 조각만 죽은 것»만 말한다:
 *     한 덩이(함수 하나) 안에서 **둘 넘게 살아 있는데 그 중 하나가 죽었으면** 잡는다.
 *     다 죽었으면 그 팩이 안 쓰는 기능이니 넘어간다.
 *
 *   ES0101 이 딱 그 꼴이었다 — 마법사그리기 안에서
 *   [data-step] · [data-step-dot] · [data-step-label] · [data-step-prev] 는 다 붙는데
 *   .progress .fill 하나만 안 붙었다.
 *
 * 어떻게 재나
 *   ① 화면(HTML)에서 실제로 쓰인 class·id·속성·태그 이름을 다 모은다
 *   ② 코드가 «스스로 만들어 붙이는» 이름도 모은다 (classList.add · className= · innerHTML)
 *      — 안 그러면 토스트처럼 나중에 생기는 것을 죄다 헛것이라 우긴다
 *   ③ querySelector·closest·matches 에 «글자로 적힌» 선택자를 뽑아 ①②에 있는지 본다
 *   ④ 쉼표로 갈린 것은 **하나라도 살아 있으면 통과**다. `.bar > i, .progress .fill` 처럼
 *      판이 갈릴 때를 대비해 둘 다 적어 두는 것은 옳은 코드다
 *
 * ⚠ 주석은 안 본다 — 「이래서 뺐다」고 적어 둔 주석을 코드로 읽으면 고칠수록 흠이 는다.
 * ⚠ 못 잡는 것 — 변수로 만든 선택자(`'.' + 이름`)는 글로는 알 수 없어 건너뛴다.
 *   이 검사는 «확실한 것만» 말한다. 애매하면 조용히 넘어간다.
 *
 * 쓰는 법
 *   npx tsx check-헛선택자.mts 인테리어_프리미엄
 *   npx tsx check-헛선택자.mts                    (완성화면이 든 팩 전부)
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const 팩자리 = ["판매용_템플릿/_판매팩", "판매용_템플릿/_만드는중"];
const 고른팩 = process.argv[2];

type 이름집 = { 클래스: Set<string>; 아이디: Set<string>; 속성: Set<string>; 코드들: [string, string][] };

function 있는이름(완성화면: string): 이름집 {
  const 클래스 = new Set<string>();
  const 아이디 = new Set<string>();
  const 속성 = new Set<string>();

  const 담기 = (html: string) => {
    for (const m of html.matchAll(/class\s*=\s*["']([^"']*)["']/g))
      for (const c of m[1].split(/\s+/)) if (c) 클래스.add(c);
    for (const m of html.matchAll(/id\s*=\s*["']([^"']*)["']/g)) if (m[1]) 아이디.add(m[1]);
    /* ⚠ 값 없는 속성도 있다 — <button disabled> · <div data-pick>.
       '=' 만 보면 그런 것을 죄다 놓친다. 여는 태그를 통째로 떼어 그 «안»의 이름을 센다. */
    for (const t of html.matchAll(/<[a-zA-Z][^>]*>/g))
      for (const m of t[0].matchAll(/[\s\n]([a-zA-Z][a-zA-Z0-9-]*)/g)) 속성.add(m[1].toLowerCase());
  };

  const 쪽방 = join(완성화면, "pages");
  if (existsSync(쪽방)) for (const f of readdirSync(쪽방)) if (f.endsWith(".html")) 담기(readFileSync(join(쪽방, f), "utf8"));
  for (const f of readdirSync(완성화면)) if (f.endsWith(".html")) 담기(readFileSync(join(완성화면, f), "utf8"));

  const js방 = join(완성화면, "assets/js");
  const 코드들: [string, string][] = [];
  if (existsSync(js방)) for (const f of readdirSync(js방)) if (f.endsWith(".js")) 코드들.push([f, 주석지우기(readFileSync(join(js방, f), "utf8"))]);
  for (const [, s] of 코드들) {
    담기(s);                                                     // innerHTML 안의 class="…" 까지 함께 걷힌다
    for (const m of s.matchAll(/classList\s*\.\s*(?:add|remove|toggle|replace)\s*\(([^)]*)\)/g))
      for (const c of m[1].matchAll(/["']([^"']+)["']/g)) 클래스.add(c[1]);
    for (const m of s.matchAll(/className\s*=\s*["']([^"']*)["']/g))
      for (const c of m[1].split(/\s+/)) if (c) 클래스.add(c);
    for (const m of s.matchAll(/(?:setAttribute|getAttribute|removeAttribute|hasAttribute)\s*\(\s*["']([^"']+)["']/g)) 속성.add(m[1].toLowerCase());
    for (const m of s.matchAll(/dataset\s*\.\s*([A-Za-z0-9]+)/g))
      속성.add("data-" + m[1].replace(/[A-Z]/g, (u) => "-" + u.toLowerCase()));
  }
  return { 클래스, 아이디, 속성, 코드들 };
}

/** 주석을 «빈칸으로» 지운다 — 줄 수는 그대로 둬야 몇째 줄인지 말해 줄 수 있다.
 *
 * ⛔ 2026-09-02: 이걸 안 해서 제 꼬리를 물었다. `.chip .x` 를 코드에서 빼고
 *   주석에 «왜 뺐는지» 적어 뒀더니, 그 주석을 다시 코드로 읽고 또 잡았다.
 *   검사기가 «고친 사실»을 흠으로 세면 고칠수록 늘어난다.
 *
 * ⚠ 문자열 안의 // 는 안 건드린다 — http:// 같은 것을 주석으로 보면 뒤가 통째로 날아간다.
 *   따옴표를 세면서 지나간다. 완전한 파서는 아니지만 이 일에는 넉넉하다. */
function 주석지우기(s: string): string {
  let 낼것 = "";
  let i = 0;
  let 따옴표: string | null = null;
  while (i < s.length) {
    const c = s[i], 다음 = s[i + 1];
    if (따옴표) {
      낼것 += c;
      if (c === "\\") { 낼것 += 다음 ?? ""; i += 2; continue; }
      if (c === 따옴표) 따옴표 = null;
      i += 1; continue;
    }
    if (c === '"' || c === "'" || c === "`") { 따옴표 = c; 낼것 += c; i += 1; continue; }
    if (c === "/" && 다음 === "*") {
      const 끝 = s.indexOf("*/", i + 2);
      const 몸 = s.slice(i, 끝 < 0 ? s.length : 끝 + 2);
      낼것 += 몸.replace(/[^\n]/g, " ");            // 줄바꿈만 남긴다
      i += 몸.length; continue;
    }
    if (c === "/" && 다음 === "/") {
      const 끝 = s.indexOf("\n", i);
      const 몸 = s.slice(i, 끝 < 0 ? s.length : 끝);
      낼것 += 몸.replace(/./g, " ");
      i += 몸.length; continue;
    }
    낼것 += c; i += 1;
  }
  return 낼것;
}

/** 선택자 한 도막이 «붙을 자리가 있나». 모르면 true(통과) 를 준다. */
function 붙나(도막: string, 것: 이름집): { 되나: boolean; 없는것?: string } {
  const 몸 = 도막.trim();
  if (!몸) return { 되나: true };
  for (const m of 몸.matchAll(/\.([A-Za-z_][\w-]*)/g)) if (!것.클래스.has(m[1])) return { 되나: false, 없는것: "." + m[1] };
  for (const m of 몸.matchAll(/#([A-Za-z_][\w-]*)/g)) if (!것.아이디.has(m[1])) return { 되나: false, 없는것: "#" + m[1] };
  for (const m of 몸.matchAll(/\[\s*([A-Za-z_][\w-]*)/g)) if (!것.속성.has(m[1].toLowerCase())) return { 되나: false, 없는것: "[" + m[1] + "]" };
  return { 되나: true };
}

/** 코드를 «덩이»로 자른다 — function · on(…) · addEventListener 가 여는 줄이 경계다.
 *  구문을 제대로 파싱하지 않는다. 여기 필요한 것은 «가까이 있는 선택자끼리 묶기» 뿐이다. */
function 덩이들(s: string): { 시작줄: number; 글: string }[] {
  const 줄 = s.split("\n");
  const 경계: number[] = [];
  줄.forEach((l, i) => {
    if (/^\s{0,4}(?:function |(?:var|let|const)\s+[^=]*=\s*function|on\(|document\.addEventListener|window\.addEventListener)/.test(l)) 경계.push(i);
  });
  if (!경계.length) return [{ 시작줄: 1, 글: s }];
  const 낼것: { 시작줄: number; 글: string }[] = [];
  if (경계[0] > 0) 낼것.push({ 시작줄: 1, 글: 줄.slice(0, 경계[0]).join("\n") });
  경계.forEach((a, k) => {
    const b = k + 1 < 경계.length ? 경계[k + 1] : 줄.length;
    낼것.push({ 시작줄: a + 1, 글: 줄.slice(a, b).join("\n") });
  });
  return 낼것;
}

const 팩들: string[] = [];
for (const 방 of 팩자리) {
  if (!existsSync(방)) continue;
  for (const d of readdirSync(방, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    if (고른팩 && d.name !== 고른팩) continue;
    if (existsSync(join(방, d.name, "완성화면/assets/js"))) 팩들.push(join(방, d.name));
  }
}
if (!팩들.length) {
  console.error(고른팩 ? `완성화면이 있는 팩을 못 찾았습니다: ${고른팩}` : "완성화면이 든 팩이 없습니다.");
  process.exit(2);
}

console.log("\n코드가 «없는 것»을 찾고 있나 — 누르지 않고 글로 잽니다\n");
let 걸림 = 0;
for (const 팩길 of 팩들) {
  const 완성화면 = join(팩길, "완성화면");
  const 것 = 있는이름(완성화면);
  const 나온것: string[] = [];
  let 본선택자 = 0;
  for (const [파일, s] of 것.코드들) {
    for (const 덩이 of 덩이들(s)) {
      const 산것: string[] = [];
      const 죽은것: { 선택자: string; 줄: number; 없는것: string }[] = [];
      for (const m of 덩이.글.matchAll(/\.(?:querySelectorAll|querySelector|closest|matches)\s*\(\s*(['"])([^'"]+)\1/g)) {
        const 선택자 = m[2];
        if (!/[.#[]/.test(선택자)) continue;                     // 태그만 있는 것은 안 본다
        본선택자 += 1;
        const 판정 = 선택자.split(",").map((d) => 붙나(d, 것));
        const 줄 = 덩이.시작줄 + 덩이.글.slice(0, m.index ?? 0).split("\n").length - 1;
        if (판정.some((x) => x.되나)) { 산것.push(선택자); continue; }
        죽은것.push({ 선택자, 줄, 없는것: 판정.map((x) => x.없는것).join(" · ") });
      }
      /* ⭐ 그 기능이 «화면에 있을 때»만 말한다 — 살아 있는 것이 둘 넘어야 한다.
         다 죽었으면 그 팩이 안 쓰는 기능이다. 그건 버그가 아니다. */
      if (산것.length < 2 || !죽은것.length) continue;
      for (const d of 죽은것)
        나온것.push(`${파일}:${d.줄}  ${d.선택자}   ← ${d.없는것} 가 없습니다 (같은 덩이의 ${산것.length}개는 붙는데 이것만)`);
    }
  }
  const 이름 = 팩길.split(/[\/]/).pop();
  if (!나온것.length) {
    console.log(`  ✓ ${이름} — 선택자 ${본선택자}개, 헛것 없음`);
    continue;
  }
  걸림 += 나온것.length;
  console.log(`  ❌ ${이름} — ${나온것.length}개`);
  for (const x of 나온것) console.log(`       ${x}`);
}

console.log("");
if (걸림) {
  console.log(`헛도는 선택자 ${걸림}개. **고친 뒤에 팝니다.**`);
  console.log("코드가 부르는 이름이 화면에 없으면 그 자리는 «영원히» 안 움직입니다 —");
  console.log("눌러 보는 검수기는 이걸 못 잡습니다. 다른 것이 바뀌면 통과하기 때문입니다.\n");
  process.exit(1);
}
console.log("✅ 다 통과했습니다.\n");
process.exit(0);
