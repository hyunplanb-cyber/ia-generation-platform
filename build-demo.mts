// 판매 데모 배포기.
//
// 프리미엄 스펙팩(144화면)을 Claude Code로 실제 구현한 결과물을 public/demo/에 올려
// "이렇게 나옵니다"를 말이 아니라 만져볼 수 있는 증거로 바꾼다.
//
// 반드시 지킬 것 — 원본 폴더에는 우리가 파는 산출물이 함께 들어 있다.
//   스펙팩/  … 07_AI빌드_스펙팩.json (유료 상품 본체)
//   build/   … 페이지 생성기. 전체 화면 데이터가 들어 있다
// 이 둘을 올리면 상품을 무료로 뿌리는 셈이라, 화이트리스트 방식으로만 복사한다.
//
// 사용법: npx tsx build-demo.mts
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC =
  "판매용_템플릿/_배포/판매_6종/여행_프리미엄/여행_프리미엄_사이트";
const DEST = "public/demo/travel";

// 144개를 다 올리면 상품의 핵심 가치(어떤 화면이 필요한지)를 통째로 주는 셈이다.
// 정상 흐름을 끝까지 따라갈 수 있을 만큼만 두고, 대신 예외·상태 화면을 넉넉히 넣는다.
// 정상 화면만 보면 흔한 사이트지만, 예외가 섞이면 "이런 것까지?"가 되기 때문이다.
const FLOW = [
  "HO0101", // 홈
  "PR0101", // 상품 목록
  "PR0201", // 상품 상세
  "PR0301", // 날짜·옵션 선택
  "CT0101", // 장바구니
  "BK0101", // 여행자 정보 입력
  "BK0201", // 결제
  "BK0301", // 예약 완료
  "VC0201", // 바우처 상세
  "MY0301", // 예약 내역
  "MY0101", // 로그인
];
const EXCEPTIONS = [
  "BK0601", // 최소 인원 미달 — 이 패키지의 대표 화면
  "VC0301", // 바우처 만료
  "BK0401", // 결제 실패
  "PR0601", // 예약 마감·품절
  "HO0401", // 검색 결과 없음
  "CT0201", // 장바구니 비어 있음
  "MY0701", // 취소 불가 안내
];
const KEEP = [...FLOW, ...EXCEPTIONS];
/** 데모에 없는 화면으로 가는 링크가 향할 안내 페이지. */
const MORE = "_more.html";

if (!existsSync(SRC)) throw new Error(`데모 원본이 없어요: ${SRC}`);

// 재실행 시 지난 파일이 남지 않도록 비우고 시작한다.
if (!DEST.endsWith("public/demo/travel")) throw new Error("삭제 경로 안전장치");
rmSync(DEST, { recursive: true, force: true });
mkdirSync(DEST, { recursive: true });

// 자산은 통째로, 화면은 고른 것만. 원본 index.html은 144개를 전부 나열하므로 쓰지 않고 새로 만든다.
cpSync(join(SRC, "assets"), join(DEST, "assets"), { recursive: true });
mkdirSync(join(DEST, "pages"), { recursive: true });

const titles = new Map<string, string>();
for (const id of KEEP) {
  const from = join(SRC, "pages", `${id}.html`);
  if (!existsSync(from)) throw new Error(`원본에 ${id}.html이 없어요`);
  const html = readFileSync(from, "utf8");
  // "홈 · 트래블나우" → "홈"
  titles.set(id, (html.match(/<title>([^<]*)<\/title>/)?.[1] ?? id).split("·")[0].trim());
  writeFileSync(join(DEST, "pages", `${id}.html`), html, "utf8");
}

// 데모임을 알리는 띠. 원본 사이트가 우측 하단에 화면ID 배지를 쓰므로 좌측 하단에 둔다.
const BANNER = `
<div id="cc-demo-note" style="position:fixed;left:16px;bottom:16px;z-index:2147483647;
  display:flex;align-items:center;gap:10px;max-width:calc(100vw - 32px);
  padding:10px 14px;border-radius:999px;background:#20261c;color:#ece1c7;
  font:500 13px/1.4 Pretendard,'Malgun Gothic',sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.25)">
  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#e4762c;flex:none"></span>
  <span>카페인컬러 설계도로 <b>AI가 만든 데모</b>입니다. 실제 서비스가 아니에요.</span>
  <a href="/packages/travel?plan=premium" target="_blank" rel="noopener"
     style="flex:none;color:#20261c;background:#e4762c;text-decoration:none;font-weight:700;
            padding:5px 12px;border-radius:999px">설계도 보기</a>
</div>`;

const NOINDEX = `<meta name="robots" content="noindex,nofollow">`;

/** 데모 페이지 공통 껍데기. 원본 사이트의 base.css를 그대로 쓴다. */
function shell(title: string, depth: "root" | "pages", body: string) {
  const base = depth === "root" ? "assets/css/base.css" : "../assets/css/base.css";
  const home = depth === "root" ? "pages/HO0101.html" : "HO0101.html";
  const idx = depth === "root" ? "index.html" : "../index.html";
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · 트래블나우</title>
<link rel="stylesheet" href="${base}">
</head>
<body>
<header class="gnb"><div class="gnb-in">
  <a class="logo" href="${idx}"><span class="mark">TN</span>트래블나우</a>
  <nav class="gnb-nav"><a href="${idx}">화면 목록</a><a href="${home}">홈 화면</a></nav>
</div></header>
${body}
</body>
</html>`;
}

const linkList = (ids: string[]) =>
  ids
    .map(
      (id) => `<a class="card" href="pages/${id}.html" style="display:block;text-decoration:none">
      <div class="card-bd">
        <div class="t-sub">${id}</div>
        <div class="t-card mt1">${titles.get(id) ?? id}</div>
      </div></a>`,
    )
    .join("\n      ");

writeFileSync(
  join(DEST, "index.html"),
  shell(
    "데모 화면 목록",
    "root",
    `<section class="idx-hero"><div class="wrap">
  <h1 class="t-page" style="color:#fff">여행 예약 플랫폼 — 맛보기 데모</h1>
  <p class="mt3" style="color:rgba(255,255,255,.9);max-width:760px">
    카페인컬러 <b>프리미엄 설계도(144화면)</b>를 AI 코딩 도구에 넣어 실제로 만든 결과입니다.
    그중 <b>${KEEP.length}개</b>를 골라 눌러볼 수 있게 열어 뒀어요.
  </p>
  <div class="row mt6 wrap-row" style="gap:32px">
    <div><div class="t-sec" style="color:#fff">144개</div><div class="t-sub" style="color:rgba(255,255,255,.8)">설계도 전체 화면</div></div>
    <div><div class="t-sec" style="color:#fff">${KEEP.length}개</div><div class="t-sub" style="color:rgba(255,255,255,.8)">데모 공개</div></div>
    <div><div class="t-sec" style="color:#fff">약 40분</div><div class="t-sub" style="color:rgba(255,255,255,.8)">제작 시간</div></div>
  </div>
</div></section>

<main class="main"><div class="wrap">
  <h2 class="t-sec mb3">기본 흐름</h2>
  <div class="row wrap-row" style="gap:12px;align-items:stretch">
      ${linkList(FLOW)}
  </div>

  <h2 class="t-sec mb3 mt8">AI가 그냥은 잘 안 만드는 화면</h2>
  <p class="t-sub mb3">&ldquo;만들어줘&rdquo; 한 줄로는 나오지 않는, 실제 서비스에 꼭 필요한 화면들입니다.</p>
  <div class="row wrap-row" style="gap:12px;align-items:stretch">
      ${linkList(EXCEPTIONS)}
  </div>

  <div class="card mt8"><div class="card-bd">
    <div class="t-card">나머지 ${144 - KEEP.length}개 화면은요?</div>
    <p class="t-sub mt2">설계도(스펙팩)에 전부 들어 있습니다. 넣고 돌리면 그대로 만들어져요.</p>
    <p class="mt3"><a href="/packages/travel?plan=premium" target="_blank" rel="noopener">설계도 보러 가기 →</a></p>
  </div></div>
</div></main>`,
  ),
  "utf8",
);

writeFileSync(
  join(DEST, "pages", MORE),
  shell(
    "데모에 없는 화면",
    "pages",
    `<main class="main"><div class="wrap">
  <div class="card"><div class="card-bd">
    <h1 class="t-card">이 화면은 맛보기 데모에 없어요</h1>
    <p class="t-sub mt2">
      설계도에는 화면 144개가 들어 있지만, 데모에는 ${KEEP.length}개만 열어 뒀습니다.
      이 화면도 설계도에는 들어 있어요.
    </p>
    <p class="mt4">
      <a href="../index.html">데모 화면 목록으로 →</a>
    </p>
    <p class="mt2">
      <a href="/packages/travel?plan=premium" target="_blank" rel="noopener">설계도 보러 가기 →</a>
    </p>
  </div></div>
</div></main>`,
  ),
  "utf8",
);

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    return statSync(p).isDirectory() ? htmlFiles(p) : p.endsWith(".html") ? [p] : [];
  });
}

let patched = 0;
let rewritten = 0;
for (const f of htmlFiles(DEST)) {
  let html = readFileSync(f, "utf8");
  // 빼놓은 화면으로 가는 링크는 404 대신 안내 페이지로 보낸다.
  html = html.replace(/href="([A-Z]{2}\d{4})\.html"/g, (m, id: string) => {
    if (KEEP.includes(id)) return m;
    rewritten += 1;
    return `href="${MORE}"`;
  });
  // 검색 노출 차단 — 데모가 우리 판매 페이지보다 위에 뜨면 곤란하다.
  html = html.replace(/<meta charset="utf-8">/i, `<meta charset="utf-8">\n${NOINDEX}`);
  html = html.replace(/<\/body>/i, `${BANNER}\n</body>`);
  writeFileSync(f, html, "utf8");
  patched += 1;
}

const bytes = (function size(d: string): number {
  return readdirSync(d).reduce((n, e) => {
    const p = join(d, e);
    const st = statSync(p);
    return n + (st.isDirectory() ? size(p) : st.size);
  }, 0);
})(DEST);

console.log(`데모 배포 완료 → ${DEST}`);
console.log(`  화면 ${KEEP.length}개 공개 (흐름 ${FLOW.length} + 예외 ${EXCEPTIONS.length}) / 설계도 전체 144개`);
console.log(`  HTML ${patched}개 — noindex·데모 띠 삽입, 비공개 화면 링크 ${rewritten}건을 안내 페이지로 전환`);
console.log(`  총 용량 ${(bytes / 1024 / 1024).toFixed(2)}MB`);
console.log(`  제외됨: 스펙팩/, build/, 나머지 화면 ${144 - KEEP.length}개`);
