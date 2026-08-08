/* 레이아웃 견본 만들기 — C단계 4번.
 *
 * 왜 만드나
 *   레이아웃 문서(레이아웃_*.md)는 글로만 돼 있어서, 그대로 만들면 정말 되는지
 *   아무도 확인한 적이 없다. 실물이 있는 건 grid(검색중심형) 하나뿐이다.
 *   뼈대마다 실물을 만들어 보고, 거기서 나온 숫자로 가이드를 세운다.
 *
 * 왜 손으로 안 쓰고 생성하나
 *   손으로 HTML 을 쓰면 lib/design-presets.ts 와 어긋난다. 그러면 견본이
 *   가이드를 검증하는 게 아니라 그냥 딴 물건이 된다.
 *   뼈대·카드 CSS 는 반드시 lib 에서 가져다 쓴다.
 *
 * 화면 다섯 장을 고른 이유
 *   LAYOUTS 데이터에 hero(홈)·list(목록)·detail(상세) 셋이 있다. 이 셋만으로는
 *   「목록이 비었을 때」와 「입력 칸」이 안 잡힌다 — 매번 다르게 나오는 자리이고,
 *   우리가 파는 것의 핵심(안 되는 길)이 바로 거기다. 그래서 다섯 장이다.
 *   ※ 다섯이 맞는 수인지는 이 견본을 보고 판단한다. 아직 검증된 값이 아니다.
 *
 * 쓰는 법: npx tsx build-layout-samples.mts [레이아웃키]
 *          예) npx tsx build-layout-samples.mts console
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  LAYOUTS, DESIGN_OPTIONS, STRUCTURES, THUMBS,
  gridBaseCss, STRUCTURE_COLS, GRID_GAP, cardWidth, CONTENT_BG,
} from "./lib/design-presets";

const 레이아웃키 = process.argv[2] ?? "console";
const 색키 = process.argv[3] ?? "navy";

const L = LAYOUTS.find((x) => x.key === 레이아웃키);
if (!L) throw new Error(`레이아웃 「${레이아웃키}」가 없습니다. 있는 것: ${LAYOUTS.map((x) => x.key).join(", ")}`);
const P = DESIGN_OPTIONS.find((x) => x.key === 색키);
if (!P) throw new Error(`색 「${색키}」가 없습니다. 있는 것: ${DESIGN_OPTIONS.map((x) => x.key).join(", ")}`);
const S = STRUCTURES.find((x) => x.key === L.structure)!;
const T = THUMBS.find((x) => x.key === L.thumb)!;

/* swatches 는 [주색, 강조, 진한글자, 옛배경] 이다.
   네 번째(옛배경)는 2026-08-05 에 버렸다 — 테마마다 주색을 옅게 깐 값이라
   화면마다 배경이 달라 보였다. 지금 배경은 CONTENT_BG 하나로 고정돼 있다.
   여기서 새 값을 지어내면 견본과 실제 팩이 어긋난다. 반드시 lib 값을 쓴다. */
const [primary, accent, ink] = P.swatches;
const BG = CONTENT_BG;
const SURFACE = "#FFFFFF";
const LINE = "#E5E7EB";
const MUTED = "#5F636A";

const [c1, c2, c3] = STRUCTURE_COLS[L.structure];

const 공통CSS = `
${gridBaseCss()}
:root {
  --primary: ${primary};
  --accent: ${accent};
  --ink: ${ink};
  --bg: ${BG};
  --surface: ${SURFACE};
  --line: ${LINE};
  --muted: ${MUTED};
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink);
  font-family: "Paperlogy", "Pretendard", "Malgun Gothic", sans-serif;
  /* 한국어는 이 값이 없으면 어절 한가운데서 잘린다 */
  word-break: keep-all; overflow-wrap: break-word; }
.wrap { max-width: var(--wrap); margin: 0 auto; padding: 0 var(--pad-x); }
.gnb { background: var(--surface); border-bottom: 1px solid var(--line);
  position: sticky; top: 0; z-index: 10; }
.gnb .in { display: flex; align-items: center; justify-content: space-between; height: 64px; }
.gnb .logo { font-weight: 800; font-size: 18px; }
.gnb .me { font-size: 14px; color: var(--muted); }
main { padding: 28px 0 64px; }
h1 { font-size: 28px; margin: 0 0 6px; letter-spacing: -.02em; }
.sub { color: var(--muted); font-size: 14px; margin: 0 0 24px; }
.side .grp { font-size: 12px; font-weight: 700; color: var(--muted);
  letter-spacing: .04em; margin: 20px 0 8px; }
.side a { display: block; padding: 9px 12px; border-radius: 8px;
  color: var(--ink); text-decoration: none; font-size: 14px; }
.side a.on { background: var(--primary); color: #fff; font-weight: 700; }
.cards { display: grid; gap: var(--card-gap-y) var(--card-gap); }
.card { background: var(--surface); border: 1px solid var(--line);
  border-radius: 12px; padding: var(--card-pad); }
.card .lb { font-size: 13px; color: var(--muted); }
table { width: 100%; border-collapse: collapse; background: var(--surface);
  border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
th, td { text-align: left; padding: 0 14px; height: var(--row-h);
  border-top: 1px solid var(--line); font-size: 14px; }
th { background: #F3F4F6; border-top: 0; font-size: 13px; color: var(--muted); }
.badge { display: inline-block; padding: 3px 9px; border-radius: 999px;
  font-size: 12px; font-weight: 700; background: #EEF2FF; color: var(--primary); }
.badge.warn { background: #FFF1E8; color: ${accent}; }
.btn { display: inline-block; padding: 10px 18px; border-radius: 9px; border: 0;
  background: var(--primary); color: #fff; font-weight: 700; font-size: 14px;
  cursor: pointer; text-decoration: none; }
.btn.ghost { background: none; border: 1px solid var(--line); color: var(--ink); }
.empty { background: var(--surface); border: 1px solid var(--line);
  border-radius: 12px; padding: 64px 24px; text-align: center; }
.empty .ic { font-size: 40px; line-height: 1; margin-bottom: 14px; }
.empty h2 { font-size: 18px; margin: 0 0 6px; }
.empty p { color: var(--muted); font-size: 14px; margin: 0 0 20px; }
.field { margin-bottom: var(--row-gap); }
.field label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 6px; }
.field input, .field select, .field textarea { width: 100%; padding: 11px 13px;
  border: 1px solid var(--line); border-radius: 9px; font-size: 14px;
  font-family: inherit; background: var(--surface); color: var(--ink); }
.field .help { font-size: 12px; color: var(--muted); margin-top: 5px; }
.actions { display: flex; gap: var(--btn-gap); margin-top: 24px; }
/* 사진 자리 — 파일을 두지 않는다.
   비율은 여기서 정하지 않는다. 카드 CSS 의 .thumb 가 이미 aspect-ratio 를 갖고 있고,
   .ph 는 그 안을 채우기만 한다. 여기에 또 비율을 적으면 두 군데가 싸운다. */
.thumb > .ph, .detail-img > .ph { width: 100%; height: 100%; background: #E7E9EC; }
.card h3 { font-size: 15px; margin: 0 0 4px; }
.card .meta { font-size: 13px; color: var(--muted); margin: 0; }
.card.overlay .meta { color: rgba(255,255,255,.86); }
.card .num { font-size: 28px; font-weight: 800; margin: 4px 0 0; }
.hero { padding: 36px 0 4px; }
.hero h1 { font-size: 40px; line-height: 1.2; margin-bottom: 10px; }
.topnav { display: flex; gap: 22px; }
.topnav a { color: var(--muted); text-decoration: none; font-size: 14px; font-weight: 600; }
.topnav a.on { color: var(--primary); font-weight: 800; }

/* ── 뼈대: ${S.label} (lib/design-presets.ts 에서 그대로 가져옴) ── */
${S.css}

/* ── 카드: ${T.label} (lib/design-presets.ts 에서 그대로 가져옴) ── */
${T.css}
`.trim();

/* 없는 값을 쓰면 여기서 멈춘다.
   처음 만들 때 --card-pad · --row-h · --btn-gap 이 가이드에 없어서 내가 16px·52px·10px 을
   지어냈다. 폴백(var(--x, 16px))을 쓰면 조용히 넘어가 버리므로, 아예 못 쓰게 막는다.
   견본이 가이드보다 앞서가면 그건 검증이 아니다. */
{
  const 정의됨 = new Set([...공통CSS.matchAll(/(--[a-z-]+)\s*:/g)].map((m) => m[1]));
  const 쓴것 = new Set([...공통CSS.matchAll(/var\((--[a-z-]+)/g)].map((m) => m[1]));
  const 없는것 = [...쓴것].filter((v) => !정의됨.has(v));
  const 폴백 = [...공통CSS.matchAll(/var\((--[a-z-]+)\s*,/g)].map((m) => m[1]);
  if (없는것.length) throw new Error(`가이드에 없는 값을 씁니다: ${없는것.join(", ")}\n  → lib/design-presets.ts 의 gridBaseCss() 에 넣고 다시 돌리세요.`);
  if (폴백.length) throw new Error(`폴백을 쓰지 마세요: ${폴백.join(", ")}\n  → 값을 지어내지 말고 가이드에 넣으세요.`);
}

/* 사이드바 뼈대일 때만 왼쪽 메뉴를 낸다.
   다른 뼈대에는 .side 가 없으므로 상단 가로 메뉴로 바꾼다.
   메뉴를 안 바꾸고 그대로 뒀더니 격자가 두 칸으로 잡혀 본문이 반쪽이 됐다. */
const 사이드바냐 = L.structure === "sidebar";

const 상단메뉴 = (켠곳: string) => `<nav class="topnav">${
  [["home", "홈", "01_홈.html"], ["list", "매장", "02_목록.html"], ["detail", "상세", "03_상세.html"],
   ["empty", "검색", "04_목록_비어있음.html"], ["form", "예약", "05_입력폼.html"]]
    .map(([k, n, f]) => `<a href="${f}"${k === 켠곳 ? ' class="on"' : ""}>${n}</a>`).join("")
}</nav>`;

const 메뉴 = `
<aside class="side">
  <div class="grp">운영</div>
  <a href="01_홈.html" class="{{on-home}}">한눈에 보기</a>
  <a href="02_목록.html" class="{{on-list}}">예약 관리</a>
  <a href="03_상세.html" class="{{on-detail}}">예약 상세</a>
  <div class="grp">자료</div>
  <a href="04_목록_비어있음.html" class="{{on-empty}}">정산 내역</a>
  <a href="05_입력폼.html" class="{{on-form}}">직원 등록</a>
</aside>`.trim();

const 껍데기 = (제목: string, 본문: string, 켠곳: string) => `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${제목} — ${L.label} × ${P.title}</title>
<style>
${공통CSS}
</style>
</head>
<body>
<header class="gnb"><div class="wrap in">
  <span class="logo">뷰티나우 <span style="color:var(--muted);font-weight:600;font-size:14px">${사이드바냐 ? "관리자" : ""}</span></span>
  ${사이드바냐 ? `<span class="me">김수현 원장님</span>` : 상단메뉴(켠곳)}
</div></header>
<main class="wrap">
  ${사이드바냐 ? `<div class="layout">
    ${메뉴.replace(`{{on-${켠곳}}}`, "on").replace(/\{\{on-\w+\}\}/g, "")}
    <section>
${본문}
    </section>
  </div>` : `<section>
${본문}
  </section>`}
</main>
</body>
</html>`;

type 화면 = { 파일: string; 제목: string; 켠곳: string; 본문: string };

/* 내용이 레이아웃에 안 맞으면 검증이 안 된다.
   관리자 화면(표·숫자)을 사진 중심 레이아웃에 넣으면 그 레이아웃을 시험한 게 아니다.
   그래서 두 벌을 두고 카드 종류로 고른다 — 사진 없는 카드(text)면 관리자, 아니면 손님용. */
const 관리자화면: 화면[] = [
  {
    파일: "01_홈.html", 제목: "한눈에 보기", 켠곳: "home",
    본문: `      <h1>오늘 한눈에 보기</h1>
      <p class="sub">${L.hero}</p>
      <div class="stats">
        <div class="card text"><div class="lb">오늘 예약</div><div class="num">14</div></div>
        <div class="card text"><div class="lb">대기 승인</div><div class="num">3</div></div>
        <div class="card text"><div class="lb">오늘 매출</div><div class="num">1,240,000</div></div>
        <div class="card text"><div class="lb">노쇼</div><div class="num">1</div></div>
      </div>
      <div style="height:28px"></div>
      <table>
        <tr><th>시간</th><th>고객</th><th>시술</th><th>담당</th><th>상태</th></tr>
        <tr><td>10:00</td><td>박지영</td><td>젤네일</td><td>김수현</td><td><span class="badge">확정</span></td></tr>
        <tr><td>11:30</td><td>이서연</td><td>속눈썹 연장</td><td>정하은</td><td><span class="badge warn">대기</span></td></tr>
        <tr><td>14:00</td><td>최민아</td><td>헤어컷</td><td>김수현</td><td><span class="badge">확정</span></td></tr>
      </table>`,
  },
  {
    파일: "02_목록.html", 제목: "예약 관리", 켠곳: "list",
    본문: `      <h1>예약 관리</h1>
      <p class="sub">${L.list}</p>
      <div class="actions" style="margin:0 0 18px">
        <button class="btn ghost">오늘</button><button class="btn ghost">이번 주</button>
        <button class="btn ghost">대기만</button>
      </div>
      <table>
        <tr><th>예약번호</th><th>날짜</th><th>고객</th><th>시술</th><th>금액</th><th>상태</th></tr>
        <tr><td>RV-2481</td><td>08-08 10:00</td><td>박지영</td><td>젤네일</td><td>45,000</td><td><span class="badge">확정</span></td></tr>
        <tr><td>RV-2482</td><td>08-08 11:30</td><td>이서연</td><td>속눈썹 연장</td><td>90,000</td><td><span class="badge warn">대기</span></td></tr>
        <tr><td>RV-2483</td><td>08-08 14:00</td><td>최민아</td><td>헤어컷</td><td>35,000</td><td><span class="badge">확정</span></td></tr>
        <tr><td>RV-2484</td><td>08-09 13:00</td><td>한소희</td><td>펌</td><td>120,000</td><td><span class="badge warn">대기</span></td></tr>
      </table>`,
  },
  {
    파일: "03_상세.html", 제목: "예약 상세", 켠곳: "detail",
    본문: `      <h1>RV-2482 · 이서연</h1>
      <p class="sub">${L.detail}</p>
      <div class="cards">
        <div class="card text"><div class="lb">시술</div><div class="num" style="font-size:18px">속눈썹 연장</div></div>
        <div class="card text"><div class="lb">담당</div><div class="num" style="font-size:18px">정하은</div></div>
        <div class="card text"><div class="lb">결제 예정</div><div class="num" style="font-size:18px">90,000</div></div>
      </div>
      <div style="height:24px"></div>
      <div class="card">
        <div class="lb" style="margin-bottom:8px">고객 요청</div>
        <p style="margin:0;font-size:14px;line-height:1.7">지난번보다 조금 짧게 부탁드려요. 자연스러운 컬로요.</p>
      </div>
      <div class="actions"><button class="btn">예약 확정</button><button class="btn ghost">고객에게 연락</button></div>`,
  },
  {
    파일: "04_목록_비어있음.html", 제목: "정산 내역 · 비어 있음", 켠곳: "empty",
    본문: `      <h1>정산 내역</h1>
      <p class="sub">목록이 비었을 때 무엇을 보여줄지는 뼈대마다 달라진다. 여기서 정한다.</p>
      <div class="empty">
        <div class="ic">📄</div>
        <h2>아직 정산된 내역이 없어요</h2>
        <p>예약이 완료되면 다음 정산일에 여기에 쌓입니다.<br>첫 정산은 예약 완료 후 영업일 기준 3일 뒤예요.</p>
        <a class="btn" href="02_목록.html">예약 관리로 가기</a>
      </div>`,
  },
  {
    파일: "05_입력폼.html", 제목: "직원 등록", 켠곳: "form",
    본문: `      <h1>직원 등록</h1>
      <p class="sub">입력 칸 간격·라벨 위치는 안 정해주면 매번 다르게 나온다. 여기서 정한다.</p>
      <div class="card" style="max-width:560px">
        <div class="field"><label>이름</label><input placeholder="정하은"><div class="help">고객에게 보이는 이름입니다.</div></div>
        <div class="field"><label>담당 시술</label><select><option>속눈썹 연장</option><option>젤네일</option></select></div>
        <div class="field"><label>연락처</label><input placeholder="010-0000-0000"></div>
        <div class="field"><label>소개</label><textarea rows="3" placeholder="경력 5년, 자연스러운 컬 전문"></textarea></div>
        <div class="actions"><button class="btn">등록하기</button><button class="btn ghost">취소</button></div>
      </div>`,
  },
];

/* 손님용 — 사진이 주인공인 레이아웃(쇼케이스·좌우분할·여백중심·매거진)에 쓴다.
   사진은 파일을 두지 않고 회색 자리로 대신한다. 비율은 카드 종류가 정한 값을 그대로 쓴다. */
const 사진 = (h = 200) =>
  `<div class="ph" style="${T.aspect ? `aspect-ratio:${T.aspect}` : `height:${h}px`}"></div>`;

/* 카드 한 장 — THUMBS 의 html 이 요구하는 구조 그대로 만든다.
   구조를 손으로 지어내면 CSS 가 안 붙는데, 그래도 그럴듯하게 나와서 틀린 줄을 모른다.
   실제로 그랬다 — overlay 카드의 글자를 사진 「아래」에 뒀는데 아무 경고가 없었다.
   overlay 는 .body 가 .thumb 「안」에 들어가야 겹쳐진다. */
const 카드 = (제목: string, 보조: string) => {
  if (T.key === "text") {
    return `<article class="card text"><p class="lb">${보조}</p><p class="num">${제목}</p></article>`;
  }
  const 그림 = `<div class="thumb"><div class="ph"></div>`;
  const 몸 = `<div class="body"><h3>${제목}</h3><p class="meta">${보조}</p></div>`;
  if (T.key === "overlay") return `<article class="card overlay">${그림}${몸}</div></article>`;
  if (T.key === "row") return `<article class="card row">${그림}</div>${몸}<button class="btn ghost">예약</button></article>`;
  return `<article class="card ${T.key}">${그림}</div>${몸}</article>`;
};

const 손님화면: 화면[] = [
  {
    파일: "01_홈.html", 제목: "홈", 켠곳: "home",
    본문: `      <div class="hero">
        <h1>가까운 곳에서<br>오늘 바로 예약하세요</h1>
        <p class="sub">${L.hero}</p>
        <a class="btn" href="02_목록.html">둘러보기</a>
      </div>
      <div style="height:32px"></div>
      <div class="mosaic">
        ${["강남 헤어살롱", "성수 네일바", "합정 왁싱샵", "연남 속눈썹", "이태원 바버"].map((n) =>
          카드(n, "서울 · 도보 5분")).join("\n        ")}
      </div>`,
  },
  {
    파일: "02_목록.html", 제목: "매장 목록", 켠곳: "list",
    본문: `      <h1>매장 목록</h1>
      <p class="sub">${L.list}</p>
      <div class="actions" style="margin:0 0 18px">
        <button class="btn ghost">전체</button><button class="btn ghost">헤어</button>
        <button class="btn ghost">네일</button><button class="btn ghost">오늘 예약 가능</button>
      </div>
      <div class="cards">
        ${["강남 헤어살롱", "성수 네일바", "합정 왁싱샵", "연남 속눈썹", "이태원 바버", "망원 스파"].map((n) =>
          카드(n, "서울 · ★ 4.9 (482)")).join("\n        ")}
      </div>`,
  },
  {
    파일: "03_상세.html", 제목: "매장 상세", 켠곳: "detail",
    본문: `      <h1>성수 네일바</h1>
      <p class="sub">${L.detail}</p>
      <div class="detail-img"><div class="ph"></div></div>
      <div style="height:20px"></div>
      <div class="card">
        <div class="lb" style="margin-bottom:8px">소개</div>
        <p style="margin:0;font-size:14px;line-height:1.7">경력 12년. 상담 본질 3년.<br>모발 손상도를 먼저 보고 시술 범위를 정하는 편이에요.</p>
      </div>
      <div class="actions"><button class="btn">예약하기</button><button class="btn ghost">찜하기</button></div>`,
  },
  {
    파일: "04_목록_비어있음.html", 제목: "검색 결과 없음", 켠곳: "empty",
    본문: `      <h1>검색 결과</h1>
      <p class="sub">목록이 비었을 때 무엇을 보여줄지는 뼈대마다 달라진다. 여기서 정한다.</p>
      <div class="empty">
        <div class="ic">🔍</div>
        <h2>「강남 왁싱」으로 찾은 매장이 없어요</h2>
        <p>검색어를 줄이거나 지역을 넓혀 보세요.<br>가까운 곳의 비슷한 매장을 아래에 모아 뒀어요.</p>
        <a class="btn" href="02_목록.html">비슷한 매장 보기</a>
      </div>`,
  },
  {
    파일: "05_입력폼.html", 제목: "예약하기", 켠곳: "form",
    본문: `      <h1>예약하기</h1>
      <p class="sub">입력 칸 간격·라벨 위치는 안 정해주면 매번 다르게 나온다. 여기서 정한다.</p>
      <div class="card" style="max-width:560px">
        <div class="field"><label>날짜</label><input placeholder="2026-08-12"></div>
        <div class="field"><label>시술</label><select><option>젤네일</option><option>속눈썹 연장</option></select></div>
        <div class="field"><label>연락처</label><input placeholder="010-0000-0000"><div class="help">예약 확정 문자를 보내드려요.</div></div>
        <div class="field"><label>요청사항</label><textarea rows="3" placeholder="지난번보다 조금 짧게 부탁드려요"></textarea></div>
        <div class="actions"><button class="btn">예약 신청</button><button class="btn ghost">취소</button></div>
      </div>`,
  },
];

const 화면들: 화면[] = T.key === "text" ? 관리자화면 : 손님화면;

const 나갈곳 = join("판매용_템플릿", "_가이드용", "레이아웃견본", `${L.label}_${P.title}`);
mkdirSync(나갈곳, { recursive: true });

for (const 화 of 화면들) {
  writeFileSync(join(나갈곳, 화.파일), 껍데기(화.제목, 화.본문, 화.켠곳), "utf8");
}

/* 자동으로 넘어가는 페이지 — 화면 녹화만 누르면 SNS 영상 재료가 된다.
   iframe 을 쓰면 sticky 와 스크롤이 진짜처럼 돈다. */
writeFileSync(join(나갈곳, "00_자동넘김.html"), `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><title>${L.label} × ${P.title} — 자동 넘김</title>
<style>
  html,body{margin:0;height:100%;background:${BG};overflow:hidden}
  iframe{width:100%;height:100%;border:0;display:block}
  .tag{position:fixed;left:0;right:0;bottom:0;padding:10px 18px;
    background:${ink};color:#fff;font:700 15px/1.4 "Paperlogy","Pretendard",sans-serif;
    display:flex;justify-content:space-between}
  .tag .n{color:${accent}}
</style></head><body>
<iframe id="f" src="01_홈.html"></iframe>
<div class="tag"><span id="t">한눈에 보기</span><span class="n">${L.label} × ${P.title}</span></div>
<script>
/* 한 장에 4초. 녹화하면 그대로 쓸 수 있는 길이다. */
const 장 = ${JSON.stringify(화면들.map((h) => ({ f: h.파일, t: h.제목 })))};
let i = 0;
setInterval(() => {
  i = (i + 1) % 장.length;
  document.getElementById("f").src = 장[i].f;
  document.getElementById("t").textContent = 장[i].t;
}, 4000);
</script></body></html>`, "utf8");

console.log(`\n${L.label}(${L.key}) × ${P.title}(${P.key})`);
console.log(`  뼈대 ${S.label}(${S.key}) · 카드 ${T.label}(${T.key})`);
console.log(`  칸 수  1440px:${c1} / 1024px:${c2} / 375px:${c3}`);
console.log(`  카드 폭 ${cardWidth(c1, 1440, L.structure)}px / ${cardWidth(c2, 1024, L.structure)}px / ${cardWidth(c3, 375, L.structure)}px  (칸 사이 ${GRID_GAP.x}px)`);
console.log(`  → ${나갈곳}  (${화면들.length}장 + 자동넘김)`);
console.log(`\n  이 뼈대(${S.key})를 쓰는 레이아웃: ${LAYOUTS.filter((x) => x.structure === L.structure).map((x) => x.label).join(" · ")}\n`);
