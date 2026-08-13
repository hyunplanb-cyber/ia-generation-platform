/* 대표 화면을 «실제로 그려서» 자리를 잰다 — 겹침·넘침·틈·가로스크롤.
 *
 * 왜 만드나 (2026-08-11 사장님 제안)
 *   사장님: 「대표화면을 몇 개 캡쳐해서 해보는 건 어떨까? 우리 그 화면 만들 때
 *   캡쳐본을 영상 재료로 저장하잖아. 그걸 검수 폴더에도 넣어 줘서 레이아웃 규격이
 *   이상하거나 그런 건 검수해줘.」
 *
 *   맞는 말이다. 검사기 넷(check-presets·check-design·check-pack·check-zip)은
 *   **값이 맞나 · 파일이 있나**를 본다. **어디에 그려졌나**는 아무도 안 본다.
 *   그래서 검수항목 D절(겹침·넘침·틈·글자 넘침)이 통째로 ⬜ 로 남아 있었다.
 *
 *   오늘만 해도 그려 봐야 아는 것에 세 번 걸렸다 —
 *   사진이 칸을 벗어나 페이지를 덮은 것, 히어로 사진이 제 자리를 13px 넘은 것,
 *   같은 줄 틈이 한쪽만 1px 이던 것. 셋 다 사람이 눈으로 보고서야 알았다.
 *
 * 무엇을 재나 (검수항목 D1~D4)
 *   D1 겹침      한 줄에 나란한 형제끼리 겹쳐 그려졌나
 *   D2 넘침      자식이 부모 칸 밖으로 나갔나 (부모가 안 자르는데도)
 *   D3 틈        같은 줄 형제 사이 틈이 고른가
 *   D4 글자 넘침  글이 상자를 뚫고 나갔나
 *   +  가로스크롤 페이지가 가로로 밀리나
 *
 * 캡처도 «검수 폴더»에 남긴다 — 판매용_템플릿/_마케팅/검수/<날짜>/<팩>/
 *   숫자만 보고 「통과」라고 하면 사장님이 확인할 길이 없다. 그림이 있어야 같이 본다.
 *
 * ⚠ 한글 경로에서 헤드리스 크롬은 조용히 아무것도 안 만든다. 아스키 자리로 옮겨 찍는다.
 * ⚠ --window-size=390 을 줘도 467 밑으로 안 내려간다. 폰 폭은 여기서 못 잰다(D6 은 여전히 👁).
 *
 * 쓰는 법
 *   npx tsx check-레이아웃.mts 매칭_프리미엄
 *   npx tsx check-레이아웃.mts               (완성화면이 있는 팩 전부)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync, cpSync, rmSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const 팩방 = "판매용_템플릿/_판매팩";
const 검수방뿌리 = "판매용_템플릿/_마케팅/검수";
const 오늘 = new Date().toISOString().slice(0, 10);
const 고른팩 = process.argv[2];

/** 몇 장을 볼까. 다 보면 오래 걸리고, 한 장만 보면 놓친다.
 *
 * 2026-08-13 에 5 → 14 로 늘렸다. 5장은 «홈 + 무거운 넷»이라 한쪽으로 쏠렸다 —
 * 무거운 화면은 대개 목록·상세뿐이라 **예약·결제·마이페이지 쪽은 한 번도 안 봤다.**
 * 사진을 넣은 뒤로는 화면마다 위험이 생겼는데(매칭에서 사진이 칸을 벗어난 적이 있다)
 * 다섯 장으로는 그걸 만날 확률이 너무 낮다.
 * 그래서 «메뉴 갈래마다 한 장씩» 먼저 집고, 남는 자리를 무거운 순으로 채운다. */
const 볼장수 = 14;

/* 브라우저 안에서 도는 자. 결과는 document.title 로 꺼낸다(--dump-dom 으로 읽는다).
   ⚠ 여유를 넉넉히 둔다. 1~2px 은 반올림이라 흠이 아니다 — 좁게 잡으면 거짓 경보로
     아무도 안 읽는 보고가 된다. 2026-08-11 에 「의도한 대로」 헛경보로 한 번 겪었다. */
const 재는글 = `
(() => {
  const 결과 = { 겹침: [], 넘침: [], 틈: [], 글자: [], 가로스크롤: false };
  const de = document.documentElement;
  결과.가로스크롤 = de.scrollWidth > de.clientWidth + 1;

  const 보이나 = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2;
  };
  const 흐름인가 = (el) => {
    const p = getComputedStyle(el).position;
    return p === "static" || p === "relative";
  };
  const 자르나 = (el) => ["hidden", "auto", "scroll", "clip"].includes(getComputedStyle(el).overflowX)
    || ["hidden", "auto", "scroll", "clip"].includes(getComputedStyle(el).overflowY);
  const 이름 = (el) => el.tagName.toLowerCase() +
    (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\\s+/)[0] : "");

  /* ⚠ 좁게 잡는다. 처음엔 형제면 다 봤더니 SVG 차트 안, space-between 버튼처럼
     «일부러» 벌리거나 겹친 자리까지 잡혀 거짓 경보가 쏟아졌다(2026-08-11 첫 판).
     읽히지 않는 검사는 없는 것과 같다. 그래서 아래 둘로 한정한다.
       · 겹침·넘침 — 격자/가로배치(grid·flex) 칸에서만. SVG 안은 아예 안 본다
       · 틈       — 칸이 «스스로 정한 gap» 이 있을 때만, 그 값과 견준다 */
  const SVG안인가 = (el) => !!el.closest("svg");

  for (const 부모 of document.querySelectorAll("body *")) {
    if (!보이나(부모) || SVG안인가(부모)) continue;
    const ps = getComputedStyle(부모);
    const 배치 = ps.display;
    if (!/grid|flex/.test(배치)) continue;          // 줄 세운 칸만 본다
    const pr = 부모.getBoundingClientRect();
    const 아이들 = [...부모.children].filter((c) => 보이나(c) && 흐름인가(c) && !SVG안인가(c));
    if (아이들.length < 2) continue;

    /* D2 — 자식이 부모 칸 밖으로. 부모가 자르면 일부러 자른 것이라 흠이 아니다. */
    if (!자르나(부모)) {
      for (const c of 아이들) {
        const r = c.getBoundingClientRect();
        /* ⚠ 글자만 든 인라인 조각은 뺀다. 글자 «상자»는 글꼴 때문에 획보다 몇 px 크다.
           첫 판에서 아코디언의 + 기호가 5px 넘었다고 잡혔는데 눈으로는 멀쩡했다. */
        if (getComputedStyle(c).display === "inline") continue;
        const 넘은만큼 = Math.round(Math.max(r.right - pr.right, r.bottom - pr.bottom));
        if (넘은만큼 > 6)
          결과.넘침.push(이름(c) + " 가 " + 이름(부모) + " 를 " + 넘은만큼 + "px 넘음");
      }
    }

    /* 같은 줄에 선 것만 본다 — 위 끝이 3px 안으로 같으면 한 줄로 친다. */
    const 첫위 = 아이들[0].getBoundingClientRect().top;
    const 줄 = 아이들.filter((c) => Math.abs(c.getBoundingClientRect().top - 첫위) < 3);
    if (줄.length < 2) continue;
    /* 요소와 상자를 «짝지어» 왼쪽부터 세운다. 상자만 정렬하면 나중에 「이 칸이 무엇이었나」를
       되짚을 수 없다 — 글자 한 자짜리(아이콘)를 가려내려면 요소가 있어야 한다. */
    const 짝 = 줄.map((c) => ({ el: c, r: c.getBoundingClientRect() })).sort((a, b) => a.r.left - b.r.left);
    const 상자 = 짝.map((x) => x.r);
    const 자식 = 짝.map((x) => x.el);

    /* D1 — 겹침. 8px 넘게 겹칠 때만. 아바타 겹쳐 놓기 같은 것은 대개 그 밑이다. */
    for (let i = 1; i < 상자.length; i++) {
      const 겹친만큼 = Math.round(상자[i - 1].right - 상자[i].left);
      if (겹친만큼 > 8) 결과.겹침.push(이름(부모) + " 안에서 " + 겹친만큼 + "px 겹침");
    }

    /* D3 — 칸이 «스스로 정한» gap 과 실제 틈이 같은가.
       gap 을 안 정한 칸(space-between 등)은 견줄 값이 없으니 안 본다.
       내가 오늘 고친 진짜 결함이 바로 이것이었다 — gap:8px 인데 한쪽만 1px 이었다. */
    const 정한틈 = parseFloat(ps.columnGap);
    if (Number.isFinite(정한틈) && 정한틈 > 0 && 상자.length >= 2) {
      const 틈 = [];   // ⚠ 여기는 «브라우저에서 도는 글»이다. 타입 표기를 쓰면 문법 오류로 조용히 죽는다
      for (let i = 1; i < 상자.length; i++) 틈.push(Math.round(상자[i].left - 상자[i - 1].right));
      /* ⚠ «좁을 때»만 흠이다. gap 은 «최소»라서 space-between 같은 것이 걸리면
         더 벌어지는데 그건 일부러 그런 것이다. 첫 판에서 그걸 다 잡아 37건이 나왔다.
         반대로 정한 값보다 «좁으면» 뭔가가 제 칸을 넘어와 틈을 먹은 것이다 —
         2026-08-11 에 고친 진짜 결함이 딱 그 모양이었다(gap 8px 인데 한쪽만 1px). */
      /* ⚠ «글자 한 자»짜리 칸은 상자로 재면 안 된다 (2026-08-13).
         장비렌탈 아코디언의 ＋(전각, U+FF0B) 가 그랬다. 상자는 27px 인데 글자는 가운데
         13px 만 그려지고 양옆에 7px 씩 빈다. 그래서 «상자 틈» 은 2px 로 나오는데
         **눈에 보이는 틈은 9px** 이라 설계값 8px 과 맞다. 그려서 견줘 보고서야 알았다 —
         고치기 전과 후 그림이 똑같았다.
         글자 한 자짜리(아이콘·마크)는 이 검사에서 뺀다. 그 틈은 사람 눈으로 본다. */
      const 글자하나 = (el) => (el.textContent || "").trim().length <= 1;
      const 좁은것 = [];
      for (let i = 1; i < 상자.length; i++) {
        const g = Math.round(상자[i].left - 상자[i - 1].right);
        if (g >= 정한틈 - 3) continue;
        if (글자하나(자식[i]) || 글자하나(자식[i - 1])) continue;
        좁은것.push(g);
      }
      if (좁은것.length)
        결과.틈.push(이름(부모) + " 는 gap " + Math.round(정한틈) + "px 인데 실제 " + 좁은것.join("·") + "px");
    }
  }

  /* D4 — 글이 상자를 뚫고 나갔나. 자르는 상자는 뺀다. */
  for (const el of document.querySelectorAll("body *")) {
    if (!보이나(el) || 자르나(el)) continue;
    if (el.children.length) continue;                 // 글만 든 칸만 본다
    if (!el.textContent || !el.textContent.trim()) continue;
    /* ⚠ «보이는 테두리»가 있을 때만 흠이다. 배경도 테두리도 없으면 글이 조금 넘쳐도
       아무도 못 본다. 첫 판에서 고수 이름이 12px 넘쳤다고 잡혔는데 멀쩡했다. */
    const es = getComputedStyle(el);
    const 보이는칸 = es.backgroundColor !== "rgba(0, 0, 0, 0)" || parseFloat(es.borderTopWidth) > 0;
    if (!보이는칸) continue;
    if (el.scrollWidth > el.clientWidth + 3)
      결과.글자.push(이름(el) + " 글이 " + (el.scrollWidth - el.clientWidth) + "px 넘침");
  }

  const 줄이기 = (a) => [...new Set(a)].slice(0, 3);
  return JSON.stringify({
    겹침: 결과.겹침.length, 넘침: 결과.넘침.length, 틈: 결과.틈.length, 글자: 결과.글자.length,
    가로스크롤: 결과.가로스크롤,
    보기: [...줄이기(결과.겹침), ...줄이기(결과.넘침), ...줄이기(결과.틈), ...줄이기(결과.글자)].slice(0, 4),
  });
})()`;

function 대표고르기(pages: string): string[] {
  const 다 = readdirSync(pages).filter((f) => f.endsWith(".html"));
  if (!다.length) return [];
  // 첫 화면(홈) — HO 로 시작하는 것 중 첫째, 없으면 이름순 첫째
  const 홈 = 다.filter((f) => /^HO/i.test(f)).sort()[0] ?? 다.sort()[0];
  // 나머지는 «무거운» 순 — 덩어리가 많은 화면에서 어긋남이 난다
  const 무거운순 = 다.filter((f) => f !== 홈)
    .map((f) => ({ f, n: statSync(join(pages, f)).size }))
    .sort((a, b) => b.n - a.n).map((x) => x.f);

  /* 갈래(화면ID 앞 두 글자 — HO·PD·CT·BK·MY·RT…)마다 «가장 무거운 것» 을 하나씩 먼저 집는다.
     이렇게 해야 예약·결제·마이페이지처럼 «가벼운 갈래» 도 한 번은 검사에 걸린다. */
  const 갈래 = new Map<string, string>();
  for (const f of 무거운순) {
    const 앞 = f.slice(0, 2).toUpperCase();
    if (!갈래.has(앞)) 갈래.set(앞, f);
  }
  const 고른것 = [홈, ...갈래.values()];
  for (const f of 무거운순) {                       // 남는 자리는 무거운 순으로
    if (고른것.length >= 볼장수) break;
    if (!고른것.includes(f)) 고른것.push(f);
  }
  return [...new Set(고른것)].slice(0, 볼장수);
}

function 팩보기(팩: string) {
  const 완성화면 = join(팩방, 팩, "완성화면");
  const pages = join(완성화면, "pages");
  if (!existsSync(pages)) return null;
  const 볼것 = 대표고르기(pages);
  if (!볼것.length) return null;

  const W = join(tmpdir(), `cc-layout-${process.pid}`);
  rmSync(W, { recursive: true, force: true });
  mkdirSync(W, { recursive: true });
  cpSync(완성화면, W, { recursive: true });
  // 「화면 정보」 패널은 우리가 붙인 것이라 검수 대상이 아니다. 끈다.
  const css = join(W, "assets", "css", "base.css");
  if (existsSync(css)) writeFileSync(css, readFileSync(css, "utf8") + "\n.dev{display:none!important}\n", "utf8");

  const 검수방 = join(검수방뿌리, 오늘, 팩);
  mkdirSync(검수방, { recursive: true });

  const 합 = { 겹침: 0, 넘침: 0, 틈: 0, 글자: 0, 가로: 0 };
  let 못잰장 = 0;
  const 보기: string[] = [];

  for (const f of 볼것) {
    const 길 = join(W, "pages", f);
    const 잴것 = 길.replace(/\.html$/, "._잴것.html");
    writeFileSync(잴것,
      readFileSync(길, "utf8").replace("</body>",
        `<script>addEventListener("load",()=>{document.title=${재는글}})<\/script></body>`), "utf8");

    let dom = "";
    try {
      dom = execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--window-size=1440,2400",
        "--virtual-time-budget=6000", "--dump-dom", `file:///${잴것.replace(/\\/g, "/")}`],
        { encoding: "utf8", stdio: "pipe", maxBuffer: 1 << 26 });
    } catch { /* 아래에서 «못 쟀다»로 잡힌다 */ }
    const t = /<title>([\s\S]*?)<\/title>/.exec(dom)?.[1];
    /* ⚠ 못 잰 것을 «통과»로 넘기지 않는다. 첫 판에서 다섯 장을 다 못 쟀는데도
       「다 반듯합니다」라고 찍었다 — 검사기가 스스로 죽고 합격을 준 셈이다. */
    if (!t || !t.startsWith("{")) { 못잰장 += 1; 보기.push(`${f} — 못 쟀습니다`); continue; }
    const r = JSON.parse(t) as { 겹침: number; 넘침: number; 틈: number; 글자: number; 가로스크롤: boolean; 보기: string[] };
    합.겹침 += r.겹침; 합.넘침 += r.넘침; 합.틈 += r.틈; 합.글자 += r.글자; if (r.가로스크롤) 합.가로 += 1;
    for (const b of r.보기) if (보기.length < 5) 보기.push(`${f} — ${b}`);

    /* 캡처를 «검수 폴더»에 남긴다 — 숫자만 주면 사장님이 확인할 길이 없다. */
    const 찍을길 = join(W, `${f.replace(/\.html$/, "")}.png`);
    try {
      execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars",
        "--force-device-scale-factor=1", "--window-size=1440,2400",
        `--screenshot=${찍을길}`, "--virtual-time-budget=6000", `file:///${길.replace(/\\/g, "/")}`],
        { stdio: "pipe" });
      if (existsSync(찍을길)) copyFileSync(찍을길, join(검수방, `${f.replace(/\.html$/, "")}.png`));
    } catch { /* 캡처를 못 떠도 재기는 이미 끝났다 */ }
  }

  rmSync(W, { recursive: true, force: true });
  return { 팩, 잰장: 볼것.length, 못잰장, ...합, 보기, 검수방 };
}

const 팩들 = readdirSync(팩방, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith("_") && (!고른팩 || e.name === 고른팩))
  .map((e) => e.name);

console.log("대표 화면을 그려서 자리를 잽니다 — 겹침 · 넘침 · 틈 · 글자\n");
let 나쁨 = 0;
for (const 팩 of 팩들) {
  const r = 팩보기(팩);
  if (!r) continue;
  const 흠 = r.겹침 + r.넘침 + r.틈 + r.글자 + r.가로 + r.못잰장;
  if (흠) 나쁨 += 1;
  console.log(`  ${흠 ? "✗" : "✓"} ${팩.padEnd(20)} ${r.잰장}장 · 겹침 ${r.겹침} · 넘침 ${r.넘침} · ` +
    `틈 ${r.틈} · 글자 ${r.글자} · 가로스크롤 ${r.가로}` + (r.못잰장 ? ` · ⚠ 못 잰 장 ${r.못잰장}` : ""));
  for (const b of r.보기) console.log(`       ${b}`);
}
console.log(`\n캡처 → ${검수방뿌리}/${오늘}/<팩>/`);
console.log(나쁨 ? `\n못 넘긴 팩 ${나쁨}개 — 캡처를 열어 눈으로 확인하세요.` : "\n다 반듯합니다.");
