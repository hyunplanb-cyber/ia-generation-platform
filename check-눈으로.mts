/* 사람이 보듯 «옮겨 다니고 눌러 보며» 잰다 — 검수항목 H1~H15.
 *
 * 왜 만드나 (2026-08-20 사장님이 조목조목 적어 주심)
 *   「사람이 누르는 것처럼 하나씩 눌러보며 검수하며 / 아래 내용은 사람이 보는 것처럼
 *    보지 않으면 보기 어려운 것들」
 *
 *   있던 검사기들은 «한 장을 세워 놓고» 잰다.
 *     check-레이아웃  한 장 안의 겹침·넘침·틈
 *     check-반응      눌리는가 (눌렀더니 «화면이 튀었다»는 안 본다)
 *     check-사진      그려진 자리
 *   그래서 이런 것을 아무도 못 봤다 —
 *     · 이 화면만 폭이 다르다        ← 옆 화면과 견줘야 안다
 *     · 탭을 눌렀더니 화면이 밀렸다   ← 눌러 봐야 안다
 *     · 푸터가 버튼에 맞붙었다        ← 끝까지 굴려야 보인다
 *
 * 무엇을 재나
 *   H1  콘텐츠 폭이 화면마다 같은가
 *   H2  덩어리 사이가 맞붙은 곳이 있나
 *   H3  GNB 위 고정 · 푸터 아래 고정
 *   H4  GNB↔본문 · 본문↔푸터 간격
 *   H5  옮길 때 흔들리나 (세로 막대가 생겼다 없어졌다 하며 폭이 튄다)
 *   H6  «화면 안 탭»인데 뒤로가기가 생기나
 *   H7  포인트 색 위 글자가 흰색인가
 *   H8  나란한 썸네일 크기가 같은가
 *   H9  버튼 크기·모양이 고른가 (동그란 버튼을 늘여 타원이 된 것 포함)
 *   H10 좌우로 넘기는 칸에 «가로 막대»가 드러나나
 *   H11 표가 틀어졌나
 *   H12 배지 크기가 고른가
 *   H13 배지가 제 칸을 벗어났나
 *
 * ⚠ 한글 경로에서 헤드리스 크롬은 조용히 아무것도 안 한다. 아스키 자리로 옮겨 잰다.
 * ⚠ 못 잰 장을 «통과»로 넘기지 않는다. 검사기가 죽고 합격을 주면 없느니만 못하다.
 *
 * 쓰는 법
 *   npx tsx check-눈으로.mts 매칭_디럭스
 *   npx tsx check-눈으로.mts --전부      (대표 14장이 아니라 모든 화면)
 *   npx tsx check-눈으로.mts             (완성화면이 든 팩 전부)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, cpSync, rmSync, statSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { readdirSync as 훑기, rmSync as 지우기 } from "node:fs";

/* ⛔ 헤드리스 크롬은 부를 때마다 %TEMP% 아래 프로필을 만들고 «끝나도 안 지운다».
   2026-08-20 에 23,299개 · 12.6GB 가 쌓여 C 드라이브를 먹고 있었다. 우리가 치운다. */
const 크롬찌꺼기 = `${(process.env.TEMP || "/tmp").split(String.fromCharCode(92)).join("/")}/cc-chrome-${process.pid}`;
(() => {
  const 방 = 크롬찌꺼기.slice(0, 크롬찌꺼기.lastIndexOf("/"));
  try {
    for (const d of 훑기(방)) {
      if (!d.startsWith("cc-chrome-")) continue;
      try { 지우기(방 + "/" + d, { recursive: true, force: true }); } catch { /* 아직 쓰는 중이면 다음에 */ }
    }
  } catch { /* 폴더가 없으면 그만 */ }
})();
process.on("exit", () => { try { 지우기(크롬찌꺼기, { recursive: true, force: true }); } catch {} });

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const 팩방 = "판매용_템플릿/_판매팩";
const 전부보기 = process.argv.includes("--전부");
const 고른팩 = process.argv.slice(2).find((x) => !x.startsWith("--"));
const 볼장수 = 14;
const 침착 = !process.argv.includes("--다");
/* ⚠ 높이를 «사람 화면»에 맞춘다. 2400px 로 재면 어느 화면이든 자리가 남아
     margin-top:auto 푸터가 저절로 아래로 밀린다 — 그래서 첫 판에서 사장님이 짚은
     MY0101 「버튼 밑에 푸터가 맞붙음」을 검사기가 못 봤다. 노트북 한 화면은 900 근처다. */
const 폭 = 1440, 높이 = 900;

/* ── 브라우저 안에서 도는 자. 결과는 document.title 로 꺼낸다(--dump-dom 으로 읽는다). ──
   ⚠ 여유를 넉넉히 둔다. 1~2px 은 반올림이지 흠이 아니다.
     좁게 잡으면 거짓 경보가 쏟아지고, 읽히지 않는 보고는 없는 것과 같다. */
const 재는글 = `
(async () => {
  const 잠깐 = (ms) => new Promise((r) => setTimeout(r, ms));
  const 굴림끄기 = document.createElement("style");
  굴림끄기.textContent = "*{scroll-behavior:auto !important}";
  document.head.appendChild(굴림끄기);

  const 흠 = [];
  const 본말 = new Set();
  /* ⚠ 목록은 같은 줄이 여럿이라 «같은 흠»이 줄 수만큼 나온다. 한 장에서 한 번만 적는다.
     첫 판에서 HO-01 한 장이 같은 말을 여덟 번 찍어 보고를 덮었다(2026-08-20). */
  const 적기 = (칸, 말) => {
    const k = 칸 + "|" + 말;
    if (본말.has(k) || 흠.length >= 60) return;
    본말.add(k); 흠.push(k);
  };
  const 보이나 = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2;
  };
  const 이름 = (el) => el.tagName.toLowerCase() +
    (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/[ ]+/)[0] : "");
  const 반올림 = (n) => Math.round(n);

  /* ───────── H1 · H4 — 본문 칸 · GNB · 푸터 ───────── */
  const 본문 = document.querySelector("main, .edmain, .appmain, .page-wrap > main") || document.body;
  const 본문틀 = 본문.getBoundingClientRect();
  const 본문스 = getComputedStyle(본문);
  const 콘텐츠폭 = 반올림(본문틀.width - parseFloat(본문스.paddingLeft) - parseFloat(본문스.paddingRight));

  const 상단바 = document.querySelector("header, .ednav, .topbar, .gnb");
  const 푸터 = document.querySelector("footer, .ft");

  /* H3 — 상단바가 «붙어» 있나. sticky/fixed 가 아니면 굴릴 때 따라 올라간다. */
  let 상단고정 = "없음";
  if (상단바) {
    const p = getComputedStyle(상단바).position;
    상단고정 = p;
    if (p !== "sticky" && p !== "fixed") 적기("H3", 이름(상단바) + " 가 position:" + p + " — 굴리면 따라 올라갑니다");
  }

  /* H4 — 상단바 아래 본문이 시작하는 틈. 본문의 «첫 보이는 덩어리»까지 잰다. */
  let 위틈 = null, 아래틈 = null;
  const 본문아이들 = [...본문.children].filter(보이나);
  const 첫덩이 = 본문아이들.find((c) => c !== 푸터 && !c.contains(푸터));
  if (상단바 && 첫덩이) {
    위틈 = 반올림(첫덩이.getBoundingClientRect().top - 상단바.getBoundingClientRect().bottom);
    if (위틈 < 16) 적기("H4", "GNB 와 본문 사이가 " + 위틈 + "px 뿐입니다 (" + 이름(첫덩이) + ")");
  }
  /* 푸터 «윗선»과 바로 위 «글이 든 덩어리» 사이. 여기가 0 이면 버튼에 선이 맞붙는다.
     ⚠ 앞 형제가 main 같은 «큰 그릇»이면 그 아래 여백이 틈 노릇을 한다 — 그릇의 상자 밑이 아니라
       그 안 «마지막 알맹이»까지 재야 사람 눈에 보이는 틈이 나온다.
       첫 판에서 이걸 안 해서 매칭 11장이 통째로 「0px」로 잡혔다. 다 멀쩡했다.
     ⚠ 붙어 다니는 칸(sticky)은 굴린 자리에 따라 아무 데나 있어 기준이 못 된다. */
  if (푸터) {
    let 앞 = 푸터.previousElementSibling;
    if (앞 && 보이나(앞) && !/sticky|fixed/.test(getComputedStyle(앞).position)) {
      let 끝알맹이 = 앞;
      for (let 깊이 = 0; 깊이 < 6; 깊이++) {
        const 안 = [...끝알맹이.children].filter((c) => 보이나(c) &&
          !/sticky|fixed|absolute/.test(getComputedStyle(c).position) && c !== 푸터 && !c.contains(푸터));
        if (!안.length) break;
        끝알맹이 = 안[안.length - 1];
      }
      아래틈 = 반올림(푸터.getBoundingClientRect().top - 끝알맹이.getBoundingClientRect().bottom);
      if (아래틈 >= 0 && 아래틈 < 16)
        적기("H4", "본문과 푸터 사이가 " + 아래틈 + "px 뿐입니다 (" + 이름(끝알맹이) + " 바로 아래 푸터)");
    }
    /* H3 — 푸터가 «맨 아래»에 있나. 내용이 짧은데 푸터 밑이 비면 바닥에 안 붙은 것이다. */
    const 밑에남은것 = 반올림(document.documentElement.scrollHeight - (푸터.getBoundingClientRect().bottom + window.scrollY));
    if (밑에남은것 > 8) 적기("H3", "푸터 밑에 " + 밑에남은것 + "px 가 비어 있습니다 — 바닥에 안 붙었습니다");
  }


  /* ───────── G5 — 진행 막대가 «끝낸 만큼만» 차는가 ─────────
     2026-08-21 에 붙였다. 사장님이 겪은 것 — 「4단계에 서 있는데 4칸이 칠해져
     이미 끝낸 것처럼 보였다」. 지금 서 있는 단계는 «아직 안 끝난» 것이다. */
  for (const 막대 of document.querySelectorAll(".steps, .hsteps, .stepper, .wizard, .progress-steps")) {
    if (!보이나(막대)) continue;
    /* ⚠ 사이에 낀 «화살표»(.sep · › · —)는 단계가 아니다.
         2026-08-21 첫 판에서 그것까지 세는 바람에 멀쩡한 LMS 두 팩을 헛짚었다.
         「done › on › 빈칸」이 정상인데 › 를 «안 끝난 칸»으로 봤다. */
    const 칸 = [...막대.children].filter((c) => {
      if (!보이나(c)) return false;
      const cn = " " + (c.className || "") + " ";
      if (/[ ](sep|divider|arrow|line|bar)[ ]/.test(cn)) return false;
      const 글 = (c.textContent || "").trim();
      if (글.length <= 1 && !/[0-9]/.test(글)) return false;      // › — · 같은 것
      return true;
    });
    if (칸.length < 3) continue;
    const 켜 = (el) => /(^| )(on|active|current)( |$)/.test(" " + (el.className || "") + " ");
    const 끝 = (el) => /(^| )(done|complete|finished|past)( |$)/.test(" " + (el.className || "") + " ");
    const 지금 = 칸.findIndex(켜);
    if (지금 < 0) continue;
    /* 지금 칸 «뒤»가 끝난 것으로 칠해져 있으면 앞서 간 것이다 */
    const 앞선것 = 칸.slice(지금 + 1).filter(끝).length;
    if (앞선것)
      적기("G5", 이름(막대) + " — " + (지금 + 1) + "단계에 서 있는데 뒤쪽 " + 앞선것 +
        "칸이 «끝난 것»으로 칠해져 있습니다 (지금 서 있는 단계는 아직 안 끝난 것입니다)");
    /* 지금 칸 «앞»에 안 끝난 것이 있으면 건너뛴 것이다 */
    const 빠뜨린것 = 칸.slice(0, 지금).filter((el) => !끝(el) && !켜(el)).length;
    if (빠뜨린것)
      적기("G5", 이름(막대) + " — " + (지금 + 1) + "단계에 서 있는데 앞쪽 " + 빠뜨린것 +
        "칸이 «안 끝난 것»으로 남아 있습니다");
  }

  /* ───────── G6 — 로그인 상자 폭(420px)을 «내용 많은 화면»에 쓰지 않았나 ─────────
     사장님이 겪은 것 — 「완료 화면 셋이 좁은 기둥에 갇혀 화면이 텅 비었다」.
     좁은 기둥은 로그인·비밀번호처럼 «칸 몇 개»짜리 화면에 쓰는 것이다. */
  for (const 기둥 of document.querySelectorAll("main, .wrap, .card, .box, .auth, .narrow, [class*=wrap]")) {
    if (!보이나(기둥)) continue;
    const r = 기둥.getBoundingClientRect();
    if (r.width < 300 || r.width > 480) continue;                 // 좁은 기둥만
    if (기둥.closest(".gnb, header, footer, .ft, aside")) continue;
    /* 이 안에 «내용»이 얼마나 들었나 — 글자 수와 덩어리 수로 잰다 */
    const 글자 = (기둥.textContent || "").replace(/\s+/g, " ").trim().length;
    const 덩어리 = 기둥.querySelectorAll(".card, section, table, .g2, .g3, .g4, .list, .row").length;
    if (글자 > 900 || 덩어리 >= 4)
      적기("G6", 이름(기둥) + " 는 " + 반올림(r.width) + "px 짜리 좁은 기둥인데 글자 " + 글자 +
        "자 · 덩어리 " + 덩어리 + "개가 들었습니다 — 로그인 상자 폭은 칸 몇 개짜리 화면에 씁니다");
  }

  /* ───────── H5 — GNB·LNB 가 «지금 여기»를 알려 주나 ─────────
     2026-08-21 사장님 추가 — 「gnb와 lnb가 네비게이션 역할을 하는가?
     (선택한 메뉴가 포커싱되어 있는가를 재는 항목)」
     메뉴는 있는데 «지금 어느 메뉴에 와 있는지» 표시가 없으면 손님은 길을 잃는다.
     우리 짜임은 켜진 것에 class="on" 이나 aria-current 를 준다. 그것을 센다. */
  for (const 메뉴칸 of document.querySelectorAll("nav, .ednav-menu, .gnb-menu, .side, .edrail, .lnb, .snb")) {
    if (!보이나(메뉴칸)) continue;
    if (메뉴칸.closest(".ft, footer")) continue;                 // 푸터 링크 묶음은 메뉴가 아니다
    const 고리 = [...메뉴칸.querySelectorAll("a[href]")].filter(보이나);
    if (고리.length < 3) continue;                                // 두엇뿐이면 메뉴라 보기 어렵다
    const 켜진것 = 고리.filter((a) => {
      const c = " " + (a.className || "") + " ";
      return /[ ](on|active|current|is-on|selected)[ ]/.test(c) || a.hasAttribute("aria-current");
    });
    if (켜진것.length === 0) {
      /* ⚠ 2026-08-21 사장님 결정 — 「공구 상세처럼 소속을 모르면 메뉴의 포커싱은 없어도 좋아」.
         상세 화면(DE-01)은 메뉴에 제 갈래가 아예 없다. 켤 것이 없는데 «안 켰다»고 하면
         고칠 수 없는 흠을 매주 다시 찍는 셈이다. 메뉴에 «제 갈래가 있을 때»만 흠으로 친다. */
      const 지금 = (document.body.dataset.page || "").slice(0, 2);
      const 갈래있나 = 지금 && 고리.some((a) => {
        const 갈곳 = (a.getAttribute("href") || "").split("/").pop().split("#")[0].replace(/.html$/, "");
        return 갈곳.slice(0, 2) === 지금;
      });
      if (갈래있나)
        적기("H5", 이름(메뉴칸) + " 에 «지금 여기» 표시가 없습니다 — 링크 " + 고리.length +
          "개 가운데 켜진 것이 하나도 없습니다");
    }
    else if (켜진것.length > 1)
      적기("H5", 이름(메뉴칸) + " 에 «지금 여기» 가 " + 켜진것.length + "군데 켜져 있습니다");
  }

  /* ───────── H8 — 배너·썸네일·버튼·탭이 «정확히» 반응하나 ─────────
     2026-08-21 사장님 추가. ⚠ 여기서 «썸네일»은 강의·고수·상품 같은 목록 카드다.
     check-반응 은 <a href> 를 «넘어가는 것이 곧 반응»이라며 일부러 뺐다 —
     그래서 배너와 목록 카드가 통째로 검사 밖에 있었다. 여기서 본다.
       ① 갈 곳이 없는 것 — href 가 없거나 #·javascript:void(0)
       ② 목록 카드가 «전부 같은 데»로 가는 것 — 눌러도 다 같은 상세가 열린다 */
  const 갈곳없나 = (a) => {
    const h = (a.getAttribute("href") || "").trim();
    return !h || h === "#" || /^javascript:/i.test(h);
  };
  for (const el of document.querySelectorAll("a.card, a.promo, a.banner, .card > a, .banner a, .promo a, [class*=card] > a")) {
    if (!보이나(el) || !갈곳없나(el)) continue;
    적기("H8", 이름(el) + " «" + (el.textContent || "").trim().slice(0, 14) +
      "» 는 눌러도 아무 데도 안 갑니다 (href 가 비었습니다)");
  }
  /* ⚠ 2026-08-21 사장님 결정 — 「그냥 지금 유지하고 견본인 것도 안내하지 말자.
       우리는 이미 «화면 목록»으로 각 다른 케이스를 보여 주는 거니까」.
     그래서 「카드가 다 같은 상세로 간다」는 흠으로 치지 않는다.

     ⛔ 다만 «성격이 다른 상품»은 다르다 — 사장님 말씀 —
       「바로 구매 상품, 경매 상품, 예약 상품 이런 것들은 상세에서 보여주는 내용도 다르고
        구매하는 과정도 다르니까. 만약에 하나의 사이트에 여러 개 케이스가 나오면」
     그 판정은 팩의 «화면 목록»을 봐야 해서 아래(Node 쪽)에서 한다.
     여기서는 목록마다 «카드의 글과 가는 곳»만 모아 내보낸다. */
  const 카드모음 = [];
  for (const 목록 of document.querySelectorAll(".grid, .g2, .g3, .g4, .g5, .cards, .list, .rail")) {
    if (!보이나(목록)) continue;
    const 카드고리 = [...목록.children]
      .map((c) => (c.tagName === "A" ? c : c.querySelector("a[href]")))
      .filter((a) => a && 보이나(a) && !갈곳없나(a));
    if (카드고리.length < 2) continue;
    for (const a of 카드고리) {
      if (카드모음.length >= 80) break;
      카드모음.push({
        글: (a.textContent || "").replace(/s+/g, " ").trim().slice(0, 60),
        간곳: (a.getAttribute("href") || "").split("/").pop().split("#")[0],
      });
    }
  }

  /* ───────── H2 — 덩어리가 맞붙었나 ─────────
     같은 부모의 «세로로 쌓인» 형제들 틈을 잰다. 다른 형제들은 벌어져 있는데
     한 쌍만 0 이면 그것이 붙은 것이다. 처음부터 다 붙어 있는 칸(목록·표)은 흠이 아니다. */
  /* ⚠ 첫 판은 «.card-bd·.card·section…» 처럼 이름을 정해 놓고 훑었다. 그래서 매칭 CH-01 을
     통째로 놓쳤다 — 거기는 main > … > div.split > div 로 이름 없는 칸 안에 들어 있었다.
     사장님이 짚은 자리를 검사기가 못 보면 ✅ 라고 적은 것이 거짓말이 된다. 다 훑는다. */
  const 세로칸 = [본문, ...본문.querySelectorAll("*")];
  for (const 부모 of 세로칸) {
    if (!부모 || !보이나(부모)) continue;
    if (부모.closest("table, svg, .dev")) continue;
    const ps = getComputedStyle(부모);
    if (/flex|grid/.test(ps.display) && ps.flexDirection !== "column") continue;   // 가로로 세운 칸은 건너뛴다
    const 아이들 = [...부모.children].filter((c) => 보이나(c) && getComputedStyle(c).position !== "absolute");
    if (아이들.length < 3) continue;                                                // 둘뿐이면 견줄 것이 없다
    const 틈들 = [];
    for (let i = 1; i < 아이들.length; i++) {
      const a = 아이들[i - 1].getBoundingClientRect(), b = 아이들[i].getBoundingClientRect();
      if (b.top < a.bottom - 2) { 틈들.push(null); continue; }                      // 가로로 나란한 것
      틈들.push({ 틈: 반올림(b.top - a.bottom), 앞: 아이들[i - 1], 뒤: 아이들[i] });
    }
    const 잰것 = 틈들.filter(Boolean);
    if (잰것.length < 3) continue;
    const 벌어진것 = 잰것.filter((x) => x.틈 >= 8);
    /* ⚠ «대부분» 벌어져 있을 때만 붙은 것이 흠이다. 한 줄만 벌어진 칸은 영수증처럼
       원래 줄이 붙는 칸이다(매칭 .sum-row 가 그랬다 — 합계 줄만 떨어져 있다). */
    if (벌어진것.length < 잰것.length * 0.6) continue;
    /* 이 칸이 «스스로 쓰는 리듬» — 가운뎃값. 이보다 눈에 띄게 좁으면 붙어 보인다.
       사장님이 짚은 CH-01 「이런 것을 할 수 있어요」는 0px 이 아니라 «옆보다 좁아서» 붙어 보였다.
       0px 만 잡으면 그런 것을 영영 못 본다. */
    const 줄세운틈 = 잰것.map((x) => x.틈).sort((a, b) => a - b);
    const 리듬 = 줄세운틈[Math.floor(줄세운틈.length / 2)];
    for (const x of 잰것) {
      const 붙음 = x.틈 <= 2;
      const 좁음 = 리듬 >= 20 && x.틈 < 리듬 * 0.45;
      if (!붙음 && !좁음) continue;
      /* 같은 생김새가 이어지는 것(목록 줄)은 붙는 것이 제 모습이다 */
      /* 뒤에 붙은 여백 클래스까지 견주면 "card mb3" 와 "card mb6" 를 다른 것으로 봐서 헛짚는다.
         여행 프리미엄 여덟 장에서 그렇게 잡혔다(2026-08-20). «첫 클래스»만 본다. */
      const 같은것 = (x.앞.className || "").trim().split(/ +/)[0] === (x.뒤.className || "").trim().split(/ +/)[0];
      if (같은것) continue;
      /* 제목 → 부제는 «붙어야» 맞다. 리듬보다 좁다고 잡으면 잘 만든 자리를 흠이라 한다. */
      const 제목인가 = /^h[1-4]$/.test(x.앞.tagName.toLowerCase()) || /t-sec|t-card|t-page|lb/.test(x.앞.className || "");
      const 부제인가 = /t-sub|sub|desc|help|hint|caption/.test(x.뒤.className || "");
      if (!붙음 && 제목인가 && 부제인가) continue;
      if (x.뒤 === 푸터) continue;                    // 푸터는 H4 가 맡는다 — 두 번 세지 않는다
      적기("H2", 이름(x.뒤) + " 와 바로 위 " + 이름(x.앞) + " 사이가 " + x.틈 + "px — " +
        (붙음 ? "맞붙었습니다" : "이 칸이 쓰는 " + 리듬 + "px 보다 훨씬 좁습니다"));
    }
  }

  /* ───────── H9 — 버튼 크기·모양 ───────── */
  /* ⓐ 동그란 버튼을 «가로로 늘여» 타원이 된 것.
        매칭 SE-03 의 찜하기 — .heart(34px·radius 50%) 에 grow·width:auto 를 얹었다. */
  for (const el of document.querySelectorAll("button, a.btn, .btn, .heart, .icon-btn")) {
    if (!보이나(el)) continue;
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    const 둥근가 = s.borderTopLeftRadius.includes("%") && parseFloat(s.borderTopLeftRadius) >= 40;
    if (둥근가 && r.width / r.height > 1.5)
      적기("H11", 이름(el) + " 는 동그란 버튼인데 " + 반올림(r.width) + "×" + 반올림(r.height) +
        " 로 늘어나 타원이 됐습니다");
  }
  /* ⓑ 나란한 버튼끼리 키가 다른 것. 같은 부모의 형제 버튼만 견준다. */
  for (const 부모 of document.querySelectorAll(".btns, .btns-v, .row-b, .card-ft, .hero-cta, .actions")) {
    if (!보이나(부모)) continue;
    const 버튼 = [...부모.children].filter((c) => 보이나(c) && /btn/.test(c.className || ""));
    if (버튼.length < 2) continue;
    /* ⚠ «크게 하라고 시킨» 버튼끼리 견주면 안 된다. btn-lg + btn-ghost 는 일부러 다르다.
       첫 판에서 이걸 안 가려 매칭 히어로 여덟 쌍이 다 흠으로 잡혔다 — 다 멀쩡했다.
       크기를 시킨 표시(btn-lg·btn-sm)가 «같은» 것끼리만 견준다. */
    const 크기표 = (b) => (/btn-lg/.test(b.className) ? "큰" : /btn-sm/.test(b.className) ? "작은" : "보통");
    const 무리 = new Map();
    for (const b of 버튼) {
      const k = 크기표(b);
      if (!무리.has(k)) 무리.set(k, []);
      무리.get(k).push(b);
    }
    for (const [등급, 것들] of 무리) {
      if (것들.length < 2) continue;
      const 키 = 것들.map((b) => 반올림(b.getBoundingClientRect().height));
      if (Math.max(...키) - Math.min(...키) > 6)
        적기("H11", 이름(부모) + " 안 " + 등급 + " 버튼끼리 키가 다릅니다 — " + 키.join("·") + "px");
    }
    /* ⛔ 「span.btn 은 가짜 버튼」이라는 규칙을 처음에 넣었다가 710장을 헛짚었다(2026-08-20).
       카드 전체가 <a> 인 짜임에서는 그 «안»에 <a>·<button> 을 넣을 수 없다(HTML 이 금한다).
       그래서 span 으로 버튼 «모양»만 내는 것이 오히려 맞다. 밖에 감싼 것이 없을 때만 흠이다. */
    for (const b of 버튼) {
      if (b.tagName.toLowerCase() !== "span") continue;
      if (b.closest("a, button")) continue;
      적기("H11", 이름(부모) + " 안 «" + (b.textContent || "").trim().slice(0, 14) +
        "» 는 span 이라 눌리지 않습니다 (감싼 링크도 없습니다)");
    }
  }
  /* ⓒ «제 몸보다 늘어난» 배지·버튼.
     flex 세로칸은 align-items 를 안 주면 stretch 라 배지도 버튼도 칸 폭 그대로 늘어난다.
     공동구매 HO0101 에서 배지가 40px 이어야 할 자리에서 767px, 버튼도 102px 이 767px 이었다.
     글이 실제로 차지한 폭(Range)과 상자 폭을 견주면 «늘어난 것»이 그대로 드러난다. */
  /* ⚠ 「글보다 넓으면 늘어난 것」만으로는 부족하다. 로그인 화면의 SNS 버튼들처럼
     «셋 다 나란히 꽉 채운» 것은 일부러 그런 것이다(매칭 AU-01·AU-02 가 그랬다).
     그래서 «같은 부품끼리» 견준다 — 이 화면의 다른 .badge 가 40px 인데 혼자 767px 이면
     그건 늘어난 것이고, 셋 다 358px 이면 그게 이 화면의 제 모습이다. */
  const 같은부품 = new Map();
  for (const el of document.querySelectorAll(".badge, .btn, button")) {
    if (!보이나(el)) continue;
    const 키 = (el.className || "").trim().split(/[ ]+/)[0] || el.tagName.toLowerCase();
    if (!같은부품.has(키)) 같은부품.set(키, []);
    같은부품.get(키).push(el);
  }
  const 가운뎃값 = (a) => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
  for (const el of document.querySelectorAll(".badge, .btn, button")) {
    if (!보이나(el)) continue;
    if (/btn-block|btn-full/.test(el.className || "")) continue;       // 일부러 꽉 채운 것
    const r = el.getBoundingClientRect();
    const 범위 = document.createRange(); 범위.selectNodeContents(el);
    const 글폭 = 범위.getBoundingClientRect().width;
    if (!글폭) continue;
    const s = getComputedStyle(el);
    const 안여백 = parseFloat(s.paddingLeft) + parseFloat(s.paddingRight);
    const 남는폭 = 반올림(r.width - 글폭 - 안여백);
    const 또래 = 같은부품.get((el.className || "").trim().split(/[ ]+/)[0] || el.tagName.toLowerCase()) || [];
    const 또래폭 = 가운뎃값(또래.map((x) => x.getBoundingClientRect().width));
    if (또래.length >= 2 && r.width < 또래폭 * 2.5) continue;           // 또래와 비슷하면 제 모습이다
    if (남는폭 > 140)
      적기(/badge/.test(el.className || "") ? "H12" : "H9",
        이름(el) + " «" + (el.textContent || "").trim().slice(0, 14) + "» 가 " + 반올림(r.width) +
        "px 로 늘어났습니다 — 글은 " + 반올림(글폭) + "px 뿐입니다 (" + 이름(el.parentElement) +
        " 가 flex 인데 align-items 를 안 줘서 stretch 된 자리입니다)");
  }

  /* ───────── H12 · H13 — 배지 ───────── */
  const 배지들 = [...document.querySelectorAll(".badge, [class*=' b-'], [class^='b-'], .cnt")]
    .filter((el) => 보이나(el) && /badge|^b-| b-|cnt/.test(el.className || ""));
  /* H12 — 같은 부모 안 배지끼리 키가 다른가 */
  const 부모별 = new Map();
  for (const b of 배지들) {
    const p = b.parentElement; if (!p) continue;
    if (!부모별.has(p)) 부모별.set(p, []);
    부모별.get(p).push(b);
  }
  for (const [p, 목록] of 부모별) {
    if (목록.length < 2) continue;
    const 키 = 목록.map((b) => 반올림(b.getBoundingClientRect().height));
    if (Math.max(...키) - Math.min(...키) > 4)
      적기("H14", 이름(p) + " 안 배지 키가 제각각입니다 — " + 키.join("·") + "px");
  }
  /* H13 — 배지가 제 칸을 벗어났나. 겹쳐 얹는 배지(absolute)는 부모 밖으로 나가면 흠이다. */
  for (const b of 배지들) {
    const s = getComputedStyle(b);
    if (s.position !== "absolute") continue;
    const 기준 = b.offsetParent; if (!기준 || !보이나(기준)) continue;
    const br = b.getBoundingClientRect(), pr = 기준.getBoundingClientRect();
    const 나간폭 = Math.max(0, pr.left - br.left, br.right - pr.right);
    const 나간높 = Math.max(0, pr.top - br.top, br.bottom - pr.bottom);
    if (나간폭 > 12 || 나간높 > 12)
      적기("H15", 이름(b) + " 배지가 " + 이름(기준) + " 밖으로 " +
        반올림(Math.max(나간폭, 나간높)) + "px 벗어났습니다");
  }

  /* ───────── H10 — 좌우로 넘기는 칸에 «가로 막대»가 드러나나 ─────────
     막대가 «자리를 차지하면» offsetHeight 가 clientHeight 보다 크다. 그게 곧 보이는 막대다. */
  for (const el of document.querySelectorAll("body *")) {
    if (!보이나(el)) continue;
    const s = getComputedStyle(el);
    if (!/auto|scroll/.test(s.overflowX)) continue;
    if (el.scrollWidth <= el.clientWidth + 2) continue;
    const 막대두께 = el.offsetHeight - el.clientHeight - parseFloat(s.borderTopWidth) - parseFloat(s.borderBottomWidth);
    if (막대두께 > 2)
      적기("H12", 이름(el) + " 에 가로 막대가 " + 반올림(막대두께) + "px 드러납니다 — 화살표로 넘겨야 합니다");
  }

  /* ───────── H11 — 표가 틀어졌나 ─────────
     줄마다 칸 수가 다르거나, 칸 글이 제 칸을 뚫고 나간 것. */
  for (const 표 of document.querySelectorAll("table")) {
    if (!보이나(표)) continue;
    const 줄 = [...표.querySelectorAll("tr")].filter(보이나);
    const 칸수 = 줄.map((tr) => [...tr.children].reduce((n, td) => n + (Number(td.getAttribute("colspan")) || 1), 0));
    const 다른칸수 = [...new Set(칸수)];
    if (다른칸수.length > 1)
      적기("H13", "표의 줄마다 칸 수가 다릅니다 — " + 다른칸수.join("·") + "칸");
    if (표.scrollWidth > 표.parentElement.clientWidth + 4)
      적기("H13", "표가 제 칸보다 " + 반올림(표.scrollWidth - 표.parentElement.clientWidth) + "px 넓습니다");
  }
  /* 격자로 만든 «표 흉내» — 줄마다 칸 수가 다르면 세로줄이 어긋난다 */
  for (const 격자 of document.querySelectorAll(".table, .price-tb, .grid-tb")) {
    if (!보이나(격자)) continue;
    const 줄들 = [...격자.children].filter(보이나);
    if (줄들.length < 2) continue;
    const 왼끝 = 줄들.map((r) => 반올림(r.getBoundingClientRect().left));
    if (Math.max(...왼끝) - Math.min(...왼끝) > 4)
      적기("H13", 이름(격자) + " 의 줄 왼끝이 어긋났습니다 — " + [...new Set(왼끝)].join("·"));
  }

  /* ───────── H7 — 포인트 색 위 글자가 흰색인가 ─────────
     배경이 primary/accent 계열로 «진하게» 칠해졌는데 글자가 어두우면 안 읽힌다. */
  const 밝기 = (c) => {
    const m = c.match(/[0-9.]+/g); if (!m || m.length < 3) return null;
    if (m.length > 3 && Number(m[3]) < 0.6) return null;                 // 반투명은 뒤가 비쳐 못 잰다
    const [r, g, b] = m.slice(0, 3).map((x) => {
      const v = Number(x) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  for (const el of document.querySelectorAll("body *")) {
    if (!보이나(el)) continue;
    if (!el.textContent || !el.textContent.trim()) continue;
    if ([...el.children].some((c) => c.textContent && c.textContent.trim())) continue;  // 글을 «직접» 든 칸만
    const s = getComputedStyle(el);
    const 바탕 = 밝기(s.backgroundColor); if (바탕 === null) continue;
    if (바탕 > 0.5 || 바탕 < 0.02) continue;                            // 밝은 바탕·검정은 여기서 안 본다
    const 글 = 밝기(s.color); if (글 === null) continue;
    if (글 < 0.7)
      적기("H9", 이름(el) + " 는 포인트 색 위인데 글자가 흰색이 아닙니다 (" + s.color + " on " + s.backgroundColor + ")");
  }

  /* ───────── H8 — 나란한 썸네일 크기가 같은가 ───────── */
  for (const 부모 of document.querySelectorAll(".grid, .g2, .g3, .g4, .g5, .rail, .list, .cards")) {
    if (!보이나(부모)) continue;
    const 썸 = [...부모.children].map((c) => c.querySelector(".ph, img")).filter((x) => x && 보이나(x));
    if (썸.length < 2) continue;
    const 키 = 썸.map((t) => 반올림(t.getBoundingClientRect().height));
    if (Math.max(...키) - Math.min(...키) > 8)
      적기("H10", 이름(부모) + " 안 썸네일 키가 제각각입니다 — " + [...new Set(키)].join("·") + "px");
  }

  /* ───────── H5 — 눌렀을 때 흔들리나 ─────────
     화면 «안»에서 거르는 탭(data-f)을 사람처럼 하나씩 눌러 보고,
     세로 막대가 생겼다 없어졌다 하며 본문 폭이 튀는지 잰다.
     ⚠ data-go 는 «다른 장»으로 가 버리므로 여기서 안 누른다(H6 에서 장끼리 견준다). */
  const 잰폭 = new Set([콘텐츠폭]);
  const 막대상태 = new Set([document.documentElement.scrollHeight > window.innerHeight]);
  const 탭들 = [...document.querySelectorAll("[data-f][data-fgroup]")].filter(보이나).slice(0, 8);
  for (const t of 탭들) {
    t.click();
    await 잠깐(60);
    잰폭.add(반올림(본문.getBoundingClientRect().width -
      parseFloat(getComputedStyle(본문).paddingLeft) - parseFloat(getComputedStyle(본문).paddingRight)));
    막대상태.add(document.documentElement.scrollHeight > window.innerHeight);
  }
  if (잰폭.size > 1)
    적기("H6", "탭을 누를 때마다 본문 폭이 " + [...잰폭].join("→") + "px 로 흔들립니다");
  else if (막대상태.size > 1)
    적기("H6", "탭에 따라 세로 막대가 생겼다 없어집니다 — 폭이 통째로 밀립니다 (scrollbar-gutter 로 자리를 잡아 두세요)");

  const 세로막대 = 반올림(window.innerWidth - document.documentElement.clientWidth);

  return JSON.stringify({
    콘텐츠폭, 세로막대, 상단고정, 위틈, 아래틈,
    뒤로가기: !!document.querySelector(".back, [class*=back]"),
    장탭: [...document.querySelectorAll("[data-go]")].map((x) => x.getAttribute("data-go")).slice(0, 12),
    탭칸: !!document.querySelector(".tabs, .tabs-pill"),
    /* G3 — 화면이 스스로 「N/M단계」라고 말하는가 */
    /* G3 — 화면이 스스로 「N/M단계」라고 말하는가.
       ⚠ 여기는 템플릿 문자열 안이라 역슬래시가 먹힌다 — 정규식을 쓰면 깨진다.
         2026-08-21 에 그렇게 재는 글이 통째로 죽어 열네 팩이 «못 잰 장»으로 나왔다.
         손으로 훑는다. */
    단계말: (() => {
      const 글 = (document.body.innerText || "");
      const 나온것 = [];
      let 자리 = 글.indexOf("단계");
      while (자리 > 0 && 나온것.length < 4) {
        const 앞 = 글.slice(Math.max(0, 자리 - 10), 자리).trim();
        const 쪽 = 앞.split("/");
        if (쪽.length === 2) {
          const a = Number(쪽[0].trim()), b = Number(쪽[1].trim());
          if (a > 0 && b > 0 && b < 40 && 나온것.indexOf(a + "/" + b) < 0) 나온것.push(a + "/" + b);
        }
        자리 = 글.indexOf("단계", 자리 + 1);
      }
      return 나온것;
    })(),
    카드모음,
    흠,
  });
})()`;

/* ── 여기부터는 Node 쪽 ── */

type 잰것 = {
  화면: string; 콘텐츠폭: number; 세로막대: number; 상단고정: string; 위틈: number | null; 아래틈: number | null;
  뒤로가기: boolean; 장탭: string[]; 탭칸: boolean; 흠: string[]; 단계말?: string[];
  카드모음: { 글: string; 간곳: string }[];
};

function 한장재기(길: string, 화면: string): 잰것 | null {
  const 잴것 = 길.replace(/\.html$/, "._잴것.html");
  writeFileSync(잴것,
    readFileSync(길, "utf8").replace("</body>",
      `<script>addEventListener("load",()=>{${재는글}.then(t=>{document.title=t})})<\/script></body>`), "utf8");
  let dom = "";
  try {
    dom = execFileSync(CHROME, ["--headless=new", "--user-data-dir=" + 크롬찌꺼기, "--disable-gpu",
      `--window-size=${폭},${높이}`, "--virtual-time-budget=8000", "--dump-dom",
      `file:///${잴것.split(String.fromCharCode(92)).join("/")}`],
      { encoding: "utf8", stdio: "pipe", maxBuffer: 1 << 26 });
  } catch { /* 아래에서 «못 쟀다»로 잡힌다 */ }
  const t = /<title>([\s\S]*?)<\/title>/.exec(dom)?.[1];
  if (!t || !t.startsWith("{")) return null;
  try { return { 화면, ...JSON.parse(t) } as 잰것; } catch { return null; }
}


/* ───────── D6 · H12(폰 폭) — 375px 에서 가로로 밀리나 ─────────
   ⛔ 오래 「못 잰다」고 적혀 있던 자리다. 헤드리스 크롬은 --window-size=390 을 줘도
     467 밑으로 안 내려간다. 그래서 검수항목 D6 이 👁 로 남아 있었다.

   ⚠ 그런데 «폭 375 짜리 iframe» 안은 진짜 375 다.
     같은 출처(localhost)면 그 안을 들여다볼 수 있다 —
     그래서 팩을 잠깐 서버로 띄우고, 몰이 화면 하나가 쪽들을 차례로 열어 잰다.
     2026-08-21 에 일부러 900px 짜리를 넣어 보고 잡히는 것을 확인했다. */
function 폰폭재기(W: string, 볼것: string[]): Map<string, { 창폭: number; 문서폭: number }> {
  const 나온것 = new Map<string, { 창폭: number; 문서폭: number }>();
  const 몰이 = join(W, "_폰폭.html");
  writeFileSync(몰이, `<!doctype html><meta charset="utf-8"><body style="margin:0">
<style>iframe{scrollbar-width:none}</style><script>
 const 쪽들=${JSON.stringify(볼것)}, 결과=[]; let i=0;
 const f=document.createElement("iframe");
 f.style.cssText="width:375px;height:812px;border:0;position:absolute;left:0;top:0";
 document.body.appendChild(f);
 function 다음(){ if(i>=쪽들.length){document.title=JSON.stringify(결과);return;}
  const 쪽=쪽들[i++];
  f.onload=()=>{ try{ const d=f.contentDocument.documentElement;
     결과.push({쪽,창폭:d.clientWidth,문서폭:d.scrollWidth});
   }catch(e){ /* 못 들여다보면 그 장은 건너뛴다 */ }
   setTimeout(다음,120); };
  f.src="pages/"+쪽; }
 다음();
<\/script></body>`, "utf8");

  const 항 = 4300 + (process.pid % 500);
  const 서버 = spawn("node", ["-e", `
   const http=require("http"),fs=require("fs"),p=require("path");
   http.createServer((q,s)=>{const 길=p.join(${JSON.stringify(W)},decodeURIComponent(q.url.split("?")[0]));
    try{const b=fs.readFileSync(길);
      s.writeHead(200,{"content-type":길.endsWith(".html")?"text/html; charset=utf-8":길.endsWith(".css")?"text/css":길.endsWith(".js")?"text/javascript":"application/octet-stream"});
      s.end(b);}catch{s.writeHead(404);s.end("no");}}).listen(${항});
  `], { stdio: "ignore" });
  try {
    execFileSync("node", ["-e", "setTimeout(()=>{},900)"], { stdio: "ignore" });   // 서버가 뜨기를 잠깐 기다린다
    let dom = "";
    try {
      dom = execFileSync(CHROME, ["--headless=new", "--user-data-dir=" + 크롬찌꺼기, "--disable-gpu",
        "--window-size=1200,900", "--virtual-time-budget=" + (3000 + 볼것.length * 900), "--dump-dom",
        `http://localhost:${항}/_폰폭.html`], { encoding: "utf8", stdio: "pipe", maxBuffer: 1 << 26 });
    } catch { /* 아래에서 «못 쟀다»로 지나간다 */ }
    const t = (/<title>([\s\S]*?)<\/title>/.exec(dom)?.[1] ?? "").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    if (t.startsWith("[")) for (const x of JSON.parse(t)) 나온것.set(x.쪽, { 창폭: x.창폭, 문서폭: x.문서폭 });
  } finally { 서버.kill(); }
  return 나온것;
}


/* ───────── F6 — 밝은 화면에 «혼자 새까만» 사진이 박혔나 ─────────
   사장님이 겪은 것 — 「뷰티샵 홈 히어로 오른쪽 위. 내용이 아니라 «밝기»가 안 맞아 튄다」.
   ⚠ 사진 «내용»은 기계가 모른다. 그런데 «밝기»는 잴 수 있다 —
     canvas 에 그려 화소 평균을 낸다. 옆 사진들보다 훨씬 어두우면 구멍처럼 보인다.
   ⚠ file:// 에서는 canvas 가 더럽혀져 화소를 못 읽는다. 같은 출처(localhost)라야 한다 —
     그래서 D6 과 같은 «몰이 화면»에 얹어 서버 한 번으로 같이 잰다. */
function 사진밝기재기(W: string, 볼것: string[]): Map<string, string[]> {
  const 나온것 = new Map<string, string[]>();
  const 몰이 = join(W, "_밝기.html");
  writeFileSync(몰이, `<!doctype html><meta charset="utf-8"><body style="margin:0"><script>
 const 쪽들=${JSON.stringify(볼것)}, 결과={}; let i=0;
 const f=document.createElement("iframe");
 f.style.cssText="width:1440px;height:900px;border:0;position:absolute;left:-4000px";
 document.body.appendChild(f);
 const 밝기 = (img) => { try{
   const c=document.createElement("canvas"); c.width=24; c.height=24;
   const x=c.getContext("2d",{willReadFrequently:true});
   x.drawImage(img,0,0,24,24);
   const d=x.getImageData(0,0,24,24).data; let 합=0;
   for(let k=0;k<d.length;k+=4) 합 += 0.2126*d[k] + 0.7152*d[k+1] + 0.0722*d[k+2];
   return 합/(d.length/4)/255;
 }catch(e){ return null; } };
 function 다음(){ if(i>=쪽들.length){document.title=JSON.stringify(결과);return;}
  const 쪽=쪽들[i++];
  f.onload=()=>{ setTimeout(()=>{ try{
      const 것들=[...f.contentDocument.querySelectorAll("img")].filter(im=>im.complete&&im.naturalWidth>8);
      const 잰것=것들.map(im=>({이름:(im.getAttribute("src")||"").split("/").pop(),밝:밝기(im)})).filter(x=>x.밝!==null);
      if(잰것.length>=3){
        const 값=잰것.map(x=>x.밝).sort((a,b)=>a-b);
        const 가운데=값[Math.floor(값.length/2)];
        const 튀는것=잰것.filter(x=>가운데-x.밝>0.28&&x.밝<0.22);
        if(튀는것.length) 결과[쪽]=튀는것.map(x=>x.이름+" (밝기 "+x.밝.toFixed(2)+" · 옆은 "+가운데.toFixed(2)+")");
      }
    }catch(e){}
    setTimeout(다음,60); },260); };
  f.src="pages/"+쪽; }
 다음();
<\/script></body>`, "utf8");

  const 항 = 4800 + (process.pid % 400);
  const 서버 = spawn("node", ["-e", `
   const http=require("http"),fs=require("fs"),p=require("path");
   http.createServer((q,s)=>{const 길=p.join(${JSON.stringify(W)},decodeURIComponent(q.url.split("?")[0]));
    try{const b=fs.readFileSync(길);
      const e=길.split(".").pop().toLowerCase();
      s.writeHead(200,{"content-type":e==="html"?"text/html; charset=utf-8":e==="css"?"text/css":e==="js"?"text/javascript":e==="webp"?"image/webp":e==="png"?"image/png":e==="jpg"||e==="jpeg"?"image/jpeg":"application/octet-stream"});
      s.end(b);}catch{s.writeHead(404);s.end("no");}}).listen(${항});
  `], { stdio: "ignore" });
  try {
    execFileSync("node", ["-e", "setTimeout(()=>{},900)"], { stdio: "ignore" });
    let dom = "";
    try {
      dom = execFileSync(CHROME, ["--headless=new", "--user-data-dir=" + 크롬찌꺼기, "--disable-gpu",
        "--window-size=1500,1000", "--virtual-time-budget=" + (4000 + 볼것.length * 1200), "--dump-dom",
        `http://localhost:${항}/_밝기.html`], { encoding: "utf8", stdio: "pipe", maxBuffer: 1 << 26 });
    } catch { /* 못 재면 지나간다 */ }
    const t = (/<title>([\s\S]*?)<\/title>/.exec(dom)?.[1] ?? "").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    if (t.startsWith("{")) for (const [쪽, 것들] of Object.entries(JSON.parse(t))) 나온것.set(쪽, 것들 as string[]);
  } finally { 서버.kill(); }
  return 나온것;
}

function 대표고르기(pages: string): string[] {
  const 다 = readdirSync(pages).filter((f) => f.endsWith(".html"));
  if (!다.length) return [];
  const 홈 = 다.filter((f) => /^HO/i.test(f)).sort()[0] ?? 다.sort()[0];
  const 무거운순 = 다.filter((f) => f !== 홈)
    .map((f) => ({ f, n: statSync(join(pages, f)).size }))
    .sort((a, b) => b.n - a.n).map((x) => x.f);
  if (전부보기) return [홈, ...무거운순];
  const 갈래 = new Map<string, string>();
  for (const f of 무거운순) {
    const 앞 = f.slice(0, 2).toUpperCase();
    if (!갈래.has(앞)) 갈래.set(앞, f);
  }
  const 고른것 = [홈, ...갈래.values()];
  for (const f of 무거운순) { if (고른것.length >= 볼장수) break; if (!고른것.includes(f)) 고른것.push(f); }
  return [...new Set(고른것)].slice(0, 볼장수);
}

function 팩보기(팩: string) {
  const 완성화면 = join(팩방, 팩, "완성화면");
  const pages = join(완성화면, "pages");
  if (!existsSync(pages)) return null;
  const 볼것 = 대표고르기(pages);
  if (!볼것.length) return null;

  const W = join(tmpdir(), `cc-eye-${process.pid}`);
  rmSync(W, { recursive: true, force: true });
  mkdirSync(W, { recursive: true });
  cpSync(완성화면, W, { recursive: true });
  // 「화면 정보」 패널은 우리가 붙인 견본 장치라 검수 대상이 아니다
  const css = join(W, "assets", "css", "base.css");
  if (existsSync(css)) writeFileSync(css, readFileSync(css, "utf8") + "\n.dev{display:none!important}\n", "utf8");

  const 잰장: 잰것[] = [];
  let 못잰장 = 0;
  for (const f of 볼것) {
    const r = 한장재기(join(W, "pages", f), f);
    if (!r) { 못잰장 += 1; continue; }
    잰장.push(r);
  }

  /* ── H1 — 콘텐츠 폭이 화면마다 같은가. «가장 흔한 폭»을 기준으로 삼는다. ── */
  const 흠들: string[] = [];

  /* ── F6 — 혼자 새까만 사진 ── */
  for (const [화면, 것들] of 사진밝기재기(W, 볼것))
    for (const c of 것들)
      흠들.push(`F6 · ${화면} — ${c} 가 옆 사진들보다 훨씬 어둡습니다. 밝은 화면에서 «구멍»처럼 보입니다`);


  /* ── D6 — 폰 폭(375)에서 가로로 밀리나 ──
     한 장씩 재는 것이 아니라 «몰이 화면» 하나로 한꺼번에 잰다(서버를 한 번만 띄운다). */
  const 폰폭 = 폰폭재기(W, 볼것);
  for (const [화면, v] of 폰폭) {
    if (v.문서폭 > v.창폭 + 1)
      흠들.push(`D6 · ${화면} — 폰 폭에서 가로로 ${v.문서폭 - v.창폭}px 밀립니다 ` +
        `(창 ${v.창폭} · 문서 ${v.문서폭}). 표·그림은 «제 상자 안에서만» 넘기세요`);
  }
  /* 막대를 «뺀» 폭으로 견준다. 안 그러면 목록이 길어 막대가 생긴 화면이 죄다
     「폭이 다르다」로 잡힌다 — 첫 판에서 매칭 4장이 그랬다. 폭이 다른 게 아니라
     막대가 자리를 뺏은 것이고, 그건 H1 이 아니라 H5(흔들림)다. */
  const 민폭 = (p: 잰것) => p.콘텐츠폭 + p.세로막대;
  const 폭세기 = new Map<number, number>();
  for (const p of 잰장) 폭세기.set(민폭(p), (폭세기.get(민폭(p)) ?? 0) + 1);
  const 흔한폭 = [...폭세기.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  for (const p of 잰장) {
    if (Math.abs(민폭(p) - 흔한폭) > 4)
      흠들.push(`H1 · ${p.화면} — 콘텐츠 폭 ${민폭(p)}px (다른 화면은 ${흔한폭}px)`);
  }
  /* H5 — 폭은 같은데 «막대 유무»가 갈리면, 화면을 옮길 때마다 그 두께만큼 통째로 밀린다.
     사장님이 짚은 「수강중·수강완료에서 전체로 이동시 화면 흔들림」이 바로 이것이다. */
  const 있 = 잰장.filter((p) => p.세로막대 > 0).length;
  const 적은쪽 = Math.min(있, 잰장.length - 있);
  if (적은쪽 > 0 && 적은쪽 >= 잰장.length * 0.1) {
    흠들.push(`H6 · 팩 전체 — ${잰장.length}장 중 ${있}장에만 세로 막대가 있어 옮길 때마다 ` +
      `${잰장.find((p) => p.세로막대 > 0)?.세로막대 ?? 15}px 씩 좌우로 밀립니다 ` +
      `(html{scrollbar-gutter:stable} 로 자리를 늘 잡아 두면 멎습니다)`);
  }

  /* ── G3 — 중간 한 장면을 «못 박아» 흐름이 끊기지 않았나 ──
     사장님이 겪은 것 — 「ES-01 이 «6단계 중 3번째»로 굳어 있었다. 나머지 다섯 단계가
     어디에도 없었다」. 화면이 「N/M단계」라고 말하면 M개가 팩에 있어야 한다. */
  {
    const 말한단계 = new Map<string, { 지금: number; 모두: number }>();
    for (const p of 잰장) for (const s of p.단계말 ?? []) {
      const m = /^(\d+)\/(\d+)$/.exec(s);
      if (m) 말한단계.set(p.화면, { 지금: +m[1], 모두: +m[2] });
    }
    /* 같은 «갈래»(앞 두 글자)의 화면이 몇 장인지 센다 */
    const 갈래수 = new Map<string, number>();
    for (const f of readdirSync(pages)) {
      if (!f.endsWith(".html")) continue;
      const k = f.slice(0, 2).toUpperCase();
      갈래수.set(k, (갈래수.get(k) ?? 0) + 1);
    }
    for (const [화면, v] of 말한단계) {
      const 있는것 = 갈래수.get(화면.slice(0, 2).toUpperCase()) ?? 0;
      if (v.모두 > 있는것)
        흠들.push(`G3 · ${화면} — 「${v.지금}/${v.모두}단계」라고 적었는데 그 갈래 화면은 ` +
          `${있는것}장뿐입니다. 나머지 ${v.모두 - 있는것}단계가 팩에 없습니다`);
    }
  }

  /* ── G7 — 한쪽 등급만 고치고 «다른 등급»을 빠뜨리지 않았나 ──
     사장님이 겪은 것 — 「디럭스 견적 마법사를 6단계로 고치고 프리미엄은 3단계에 얼어붙은 채였다」.
     같은 업종의 두 등급을 나란히 놓고, «같은 이름 화면»의 짜임을 견준다. */
  {
    const 업종 = 팩.split("_")[0];
    const 짝 = 팩.endsWith("디럭스") ? `${업종}_프리미엄` : 팩.endsWith("프리미엄") ? `${업종}_디럭스` : null;
    const 짝쪽 = 짝 ? join(팩방, 짝, "완성화면", "pages") : null;
    if (짝쪽 && existsSync(짝쪽)) {
      /* 두 등급이 «같은 이름»으로 부르는 화면을 제목으로 맞춘다 */
      const 제목모으기 = (방: string) => {
        const m = new Map<string, string>();
        for (const f of readdirSync(방)) {
          if (!f.endsWith(".html")) continue;
          const t = /<title>([^<]*)<\/title>/.exec(readFileSync(join(방, f), "utf8"))?.[1] ?? "";
          const 이름 = t.split("·")[0].split("&gt;")[0].split(">")[0].trim();
          if (이름 && !m.has(이름)) m.set(이름, f);
        }
        return m;
      };
      const 이쪽 = 제목모으기(join(팩방, 팩, "완성화면", "pages"));
      const 저쪽 = 제목모으기(짝쪽);
      const 단계말빼기 = (방: string, f: string) => {
        const s = readFileSync(join(방, f), "utf8");
        return [...s.matchAll(/(\d+)\s*\/\s*(\d+)\s*단계/g)].map((m) => `${m[1]}/${m[2]}`);
      };
      let 어긋남 = 0;
      for (const [이름, 이파일] of 이쪽) {
        const 저파일 = 저쪽.get(이름);
        if (!저파일 || 어긋남 >= 3) continue;
        const a = 단계말빼기(join(팩방, 팩, "완성화면", "pages"), 이파일);
        const b = 단계말빼기(짝쪽, 저파일);
        if (!a.length || !b.length) continue;
        const A = a[0].split("/")[1], B = b[0].split("/")[1];
        if (A !== B) {
          흠들.push(`G7 · ${이파일} — 「${이름}」이 이 등급은 ${A}단계인데 ${짝} 의 ${저파일} 은 ${B}단계입니다 ` +
            `— 한쪽만 고치고 다른 등급을 빠뜨린 자국입니다`);
          어긋남 += 1;
        }
      }
    }
  }
  /* ── H8 — «성격이 다른 상품»인데 같은 상세로 가나 ──────────────────────
     사장님(2026-08-21) — 「제품의 성격이 다른 경우 상세는 각각 가야 해. 예를 들어
     바로 구매 상품, 경매 상품, 예약 상품 이런 것들은 상세에서 보여 주는 내용도 다르고
     구매하는 과정도 다르니까. 만약에 하나의 사이트에 여러 개 케이스가 나오면」

     ⚠ 갈래말을 «지어내지 않는다». 팩의 화면 제목에서 뽑는다 —
       「상품 상세」와 「패스 상품 상세」가 나란히 있으면 그 팩은 «패스»를 갈래로 친 것이다.
       그 갈래말을 단 카드가 갈래 상세가 아닌 곳으로 가면 흠이다. */
  const 상세들: { 화면: string; 이름: string }[] = [];
  for (const f of readdirSync(pages)) {
    if (!f.endsWith(".html")) continue;
    const t = /<title>([^<]*)<\/title>/.exec(readFileSync(join(pages, f), "utf8"))?.[1] ?? "";
    /* 「상품 상세 &gt; 코스 일정 탭」 같은 속화면은 앞부분만 본다 */
    const 이름 = t.split("·")[0].split("&gt;")[0].split(">")[0].trim();
    if (/상세$/.test(이름) && !상세들.some((d) => d.이름 === 이름)) 상세들.push({ 화면: f, 이름 });
  }
  /* ⚠ «가장 짧은 것»을 기본으로 삼으면 안 된다 — 여행 팩에서 「예약 상세」가 뽑혀
     「패스 상품 상세」와 짝이 안 맞았다. «끝말이 겹치는 짝»을 찾는다:
       「패스 상품 상세」 는 「상품 상세」 로 끝난다 → 갈래말은 «패스» 다. */
  const 갈래상세: { 갈래: string; 화면: string; 기본: string }[] = [];
  for (const 넓 of 상세들) {
    for (const 좁 of 상세들) {
      if (넓 === 좁 || !넓.이름.endsWith(좁.이름) || 넓.이름 === 좁.이름) continue;
      const 갈래 = 넓.이름.slice(0, 넓.이름.length - 좁.이름.length).trim();
      if (갈래.length < 2) continue;
      갈래상세.push({ 갈래, 화면: 넓.화면, 기본: 좁.화면 });
    }
  }
  if (갈래상세.length) {
    for (const p of 잰장) {
      for (const c of p.카드모음 ?? []) {
        for (const g of 갈래상세) {
          if (!c.글.includes(g.갈래)) continue;
          if (c.간곳 === g.화면) continue;
          흠들.push(`H8 · ${p.화면} — 「${g.갈래}」 카드가 ${c.간곳} 로 갑니다. ` +
            `이 팩에는 «${g.갈래}» 전용 상세(${g.화면})가 따로 있습니다 — 성격이 다른 상품은 제 상세로 보내세요`);
          break;
        }
      }
    }
  }

  /* ── H6 — «탭»으로 옮기는데 뒤로가기가 생기나 ──
     탭 칸(.tabs·.tabs-pill) 안에서 data-go 로 «다른 장»에 가고,
     간 곳에는 .back 이 있는데 온 곳에는 없으면 — 눌렀을 때 없던 뒤로가기가 생긴다. */
  const 장별 = new Map(잰장.map((p) => [p.화면, p]));
  for (const p of 잰장) {
    if (!p.탭칸) continue;
    for (const 간곳 of new Set(p.장탭)) {
      if (!간곳 || 간곳 === p.화면) {
        if (간곳 === p.화면) 흠들.push(`H7 · ${p.화면} — 탭 하나가 «제 화면»을 가리킵니다 (눌러도 그 자리)`);
        continue;
      }
      const 저쪽 = 장별.get(간곳);
      if (!저쪽) continue;                                   // 안 잰 장은 견줄 수 없다
      if (저쪽.뒤로가기 && !p.뒤로가기)
        흠들.push(`H7 · ${p.화면} → ${간곳} — 탭인데 «뒤로가기»가 생깁니다 (그만큼 화면이 아래로 밀립니다)`);
      if (Math.abs(저쪽.콘텐츠폭 - p.콘텐츠폭) > 4)
        흠들.push(`H6 · ${p.화면} → ${간곳} — 탭으로 옮기는데 폭이 ${p.콘텐츠폭}→${저쪽.콘텐츠폭}px 로 흔들립니다`);
    }
  }

  /* ── 장마다 잡은 흠. 여러 장에 똑같이 난 것은 묶어서 한 줄로 말한다 ──
     같은 뼈대로 찍어 낸 화면들이라 한 흠은 대개 수십 장에 똑같이 난다.
     장마다 한 줄씩 찍으면 84줄이 되고, 그러면 아무도 안 읽는다. */
  const 같은말 = new Map<string, string[]>();
  for (const p of 잰장) for (const h of p.흠) {
    if (!같은말.has(h)) 같은말.set(h, []);
    같은말.get(h)!.push(p.화면);
  }
  for (const [h, 장들] of 같은말) {
    const [칸, 말] = h.split("|");
    흠들.push(장들.length === 1
      ? `${칸} · ${장들[0]} — ${말}`
      : `${칸} · ${장들.length}장 (${장들.slice(0, 3).join(", ")}${장들.length > 3 ? " …" : ""}) — ${말}`);
  }

  rmSync(W, { recursive: true, force: true });

  const 칸별 = new Map<string, number>();
  for (const h of 흠들) { const k = h.slice(0, h.indexOf(" ")); 칸별.set(k, (칸별.get(k) ?? 0) + 1); }
  return { 팩, 본장: 잰장.length, 못잰장, 흠들, 칸별 };
}

const 팩들 = readdirSync(팩방, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith("_") && (!고른팩 || e.name === 고른팩))
  .map((e) => e.name);

console.log("사람이 보듯 옮겨 다니며 잽니다 — H1~H15\n");
let 나쁨 = 0;
for (const 팩 of 팩들) {
  const r = 팩보기(팩);
  if (!r) continue;
  if (r.흠들.length || r.못잰장) 나쁨 += 1;
  const 요약 = [...r.칸별.entries()].sort().map(([k, n]) => `${k} ${n}`).join(" · ") || "깨끗";
  console.log(`  ${r.흠들.length || r.못잰장 ? "✗" : "✓"} ${팩.padEnd(22)} ${r.본장}장 · ${요약}` +
    (r.못잰장 ? ` · ⚠ 못 잰 장 ${r.못잰장}` : ""));
  for (const h of r.흠들.slice(0, 침착 ? 12 : 999)) console.log(`       ${h}`);
  if (r.흠들.length > 12) console.log(`       … 그 밖 ${r.흠들.length - 12}건`);
}
console.log(나쁨 ? `\n못 넘긴 팩 ${나쁨}개.` : "\n다 반듯합니다.");
