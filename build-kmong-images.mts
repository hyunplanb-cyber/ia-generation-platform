// 크몽 상세 이미지용 HTML을 굽는다. PNG는 shot-kmong.mts가 찍는다.
//
// 크몽 상세는 헤드카피·여는글만 텍스트로 두고 나머지를 이미지로 올린다.
//
// 지키는 것 두 가지:
//  1) 이미지 안에 우리 도메인·연락처를 넣지 않는다 — 크몽은 외부 유도를 막는다.
//  2) 모바일에서 읽힌다. 폭 900을 손바닥만 한 화면에서 보므로 글자를 크게 잡는다.
//
//   npx tsx build-kmong-images.mts
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { PACKAGES, DESIGN_PRESETS, formatKrw } from "./lib/packages";

const OUT = "판매용_템플릿/_배포/판매_6종/크몽_상세이미지";
const W = 900;

// 홈페이지와 같은 색·글꼴을 쓴다. 여기서 어긋나면 크몽과 홈페이지가 다른 브랜드로 보인다.
const PAPER = "#F4F3EE";
const PAPER_DEEP = "#EAE8DE";
const LINE = "#D8D4C6";
const INK = "#1F2024";
const ORANGE = "#E4762C";
const ORANGE_SOFT = "#FBE7D3";
const TEAL = "#0E6F60";

const font = (file: string) => readFileSync(`app/fonts/paperlogy/${file}`).toString("base64");
const FONTS = `
@font-face{font-family:Paperlogy;font-weight:400;font-display:block;
  src:url(data:font/woff2;base64,${font("Paperlogy-4Regular.woff2")}) format('woff2')}
@font-face{font-family:Paperlogy;font-weight:700;font-display:block;
  src:url(data:font/woff2;base64,${font("Paperlogy-7Bold.woff2")}) format('woff2')}
@font-face{font-family:Paperlogy;font-weight:800;font-display:block;
  src:url(data:font/woff2;base64,${font("Paperlogy-8ExtraBold.woff2")}) format('woff2')}`;

const CSS = `${FONTS}
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;font-family:Paperlogy,-apple-system,sans-serif;color:${INK};
  background:${PAPER};-webkit-font-smoothing:antialiased}
.wrap{padding:58px 46px 62px}
.eye{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.eye i{font-style:normal;font-weight:800;font-size:15px;color:${ORANGE};letter-spacing:.08em}
.eye s{flex:1;height:1px;background:${LINE};text-decoration:none}
h2{font-size:44px;font-weight:800;line-height:1.25;letter-spacing:-.02em}
h2 em{font-style:normal;color:${ORANGE}}
h2 u{text-decoration:none;color:${TEAL}}
.lead{margin-top:20px;font-size:21px;line-height:1.7;color:#55534E}
.lead b{color:${INK};font-weight:700}
.mini{margin-top:22px;border:1px solid ${LINE};border-radius:14px;overflow:hidden;background:#fff}
.mini table{width:100%;border-collapse:collapse;font-size:17px}
.mini td{padding:9px 16px;border-bottom:1px solid ${LINE}}
.mini tr:last-child td{border-bottom:0}
.mini td.n{text-align:right;font-weight:700;font-variant-numeric:tabular-nums}
.mini tr.hi td{background:${ORANGE_SOFT};font-weight:800}
.mini tr.hi td.n{color:#B4551E}
.mini-cap{margin-top:10px;font-size:16px;color:#7A756A}
table.plan{width:100%;border-collapse:collapse;margin-top:26px;font-size:21px}
table.plan th,table.plan td{padding:17px 16px;text-align:left;border-bottom:1px solid ${LINE}}
table.plan thead th{font-size:15px;font-weight:800;letter-spacing:.05em;color:#7A756A;
  border-bottom:2px solid ${INK};padding-bottom:12px}
table.plan td.n{text-align:right;font-weight:800;font-variant-numeric:tabular-nums}
table.plan tr.hi td{background:${ORANGE_SOFT}}
table.plan tr.hi td.n{color:${ORANGE}}
table.plan .sub{display:block;margin-top:4px;font-size:17px;font-weight:400;color:#7A756A}
table.plan tr.hi .sub{color:#B4551E;font-weight:700}
table.mtx{width:100%;border-collapse:collapse;margin-top:24px;font-size:18px}
table.mtx th,table.mtx td{padding:13px 12px;border-bottom:1px solid ${LINE}}
table.mtx thead th{font-size:17px;font-weight:800;text-align:center;background:${PAPER_DEEP}}
table.mtx thead th:first-child{text-align:left;background:transparent;color:#7A756A;font-size:15px}
table.mtx thead th.top{background:${ORANGE};color:#fff}
table.mtx td:first-child{font-weight:700}
table.mtx td.c{text-align:center;font-weight:800;font-size:19px}
table.mtx td.y{color:${TEAL}}
table.mtx td.x{color:#B8B2A4}
table.mtx td .u{display:block;font-size:15px;font-weight:400;color:#7A756A;margin-top:3px}
table.mtx tr.only td{background:${ORANGE_SOFT}}
table.mtx tr.only td.y{color:${ORANGE}}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:26px}
.card{background:#fff;border:1px solid ${LINE};border-radius:14px;padding:22px 20px}
.card h3{font-size:20px;font-weight:800;margin-bottom:9px}
.card p{font-size:17px;line-height:1.6;color:#55534E}
.deliver{margin-top:26px;border:2px solid ${TEAL};border-radius:16px;background:#fff;padding:26px 24px}
.deliver h3{font-size:23px;font-weight:800;color:${TEAL};margin-bottom:14px}
.deliver li{list-style:none;font-size:19px;line-height:1.55;padding-left:22px;position:relative;margin-bottom:11px}
.deliver li::before{content:'';position:absolute;left:0;top:9px;width:9px;height:9px;border-radius:50%;background:${TEAL}}
.after{margin-top:16px;border-radius:16px;background:${PAPER_DEEP};border:1px solid ${LINE};padding:24px}
.after h3{font-size:20px;font-weight:800;margin-bottom:12px;color:#55534E}
.after p{font-size:18px;line-height:1.7;color:#55534E}
.after b{color:${INK};font-weight:700}
.quote{margin-top:30px;padding:26px 28px;background:${INK};color:${PAPER};border-radius:16px}
.quote p{font-size:26px;font-weight:800;line-height:1.45}
.quote span{display:block;margin-top:11px;font-size:18px;font-weight:400;color:#B8B2A4}
.chat{margin-top:22px;display:flex;flex-direction:column;gap:12px}
.bub{max-width:80%;padding:15px 20px;border-radius:18px;font-size:19px;line-height:1.5}
.bub.bad{align-self:flex-start;background:${PAPER_DEEP};color:#7A756A;border:1px solid ${LINE}}
.bub.good{align-self:flex-end;background:${ORANGE};color:#fff;font-weight:700}
.bub b{font-weight:800}
.opt{margin-top:12px;font-size:16px;color:#7A756A}
.foot{margin-top:32px;padding-top:20px;border-top:1px solid ${LINE};display:flex;align-items:center}
.foot b{font-size:18px;font-weight:800}
.dot{display:inline-block;width:12px;height:12px;border-radius:50%;background:${ORANGE};margin-right:8px;vertical-align:-1px}
.num{display:flex;gap:14px;margin-top:24px}
.num div{flex:1;background:#fff;border:1px solid ${LINE};border-radius:14px;padding:20px;text-align:center}
.num b{display:block;font-size:38px;font-weight:800;color:${ORANGE};font-variant-numeric:tabular-nums}
.num span{font-size:16px;color:#55534E}`;

const page = (title: string, body: string) =>
  `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${title}</title><style>${CSS}</style></head><body><div class="wrap">${body}</div></body></html>`;

const eye = (n: string, t: string) => `<div class="eye"><i>${n}</i><s></s></div><h2>${t}</h2>`;
// 도메인은 넣지 않는다 — 크몽 외부 유도 금지.
const foot = `<div class="foot"><b><span class="dot"></span>카페인컬러</b></div>`;

const travel = PACKAGES.find((p) => p.id === "travel")!;
const [std, dlx, prm] = travel.plans;
const Y = '<td class="c y">✓</td>';
const X = '<td class="c x">—</td>';

const SECTIONS: { file: string; title: string; body: string }[] = [
  {
    file: "01_왜_필요한가",
    title: "왜 필요한가",
    body:
      eye("WHY", "사이트 하나 만들 때<br>개발 단계에서<br><em>꼭 요구되는</em> 내용입니다.") +
      `<p class="lead">그 기간을 확실히 줄여 드려요. 실무에서 이 문서들을 처음부터 만들면 이만큼 걸립니다.</p>
      <div class="mini"><table><tbody>
        <tr><td>요건 정의</td><td class="n">2주</td></tr>
        <tr><td>기능 정의</td><td class="n">2주</td></tr>
        <tr><td>화면 목록</td><td class="n">2주</td></tr>
        <tr><td>유저 플로우</td><td class="n">2주</td></tr>
        <tr class="hi"><td>화면설계서 100페이지</td><td class="n">2~3개월</td></tr>
        <tr><td>검수 시나리오</td><td class="n">2주</td></tr>
      </tbody></table></div>
      <p class="mini-cap">＊ 서비스 기획 실무 기준</p>
      <p class="lead"><b>AI한테 시키면 되지 않냐고요?</b> 됩니다. 다만 문서 하나하나를 따로 지시해야 하고,
      <b>기준이 될 샘플이 없으면 원하는 대로 나오지 않습니다.</b></p>
      <div class="quote"><p>AI 구독료 3만 원으로<br>전문가가 될 수 있나요?</p>
      <span>도구는 실력을 대신해 주지 않습니다.</span></div>` + foot,
  },
  {
    file: "02_등급",
    title: "등급",
    body:
      eye("PLAN", "세 가지 중에<br>고르시면 됩니다.") +
      `<table class="plan"><thead><tr><th>등급</th><th class="n">화면</th><th class="n">가격</th></tr></thead><tbody>
        <tr><td><b>${std.name}</b><span class="sub">2뎁스 기본 설계</span></td>
            <td class="n">${std.stats.screens}개</td><td class="n">${formatKrw(std.priceKrw)}</td></tr>
        <tr><td><b>${dlx.name}</b><span class="sub">3뎁스 심화 설계</span></td>
            <td class="n">${dlx.stats.screens}개</td><td class="n">${formatKrw(dlx.priceKrw)}</td></tr>
        <tr class="hi"><td><b>${prm.name}</b><span class="sub">＋ 만들어 둔 화면 ＋ 검수</span></td>
            <td class="n">${prm.stats.screens}개</td><td class="n">${formatKrw(prm.priceKrw)}</td></tr>
      </tbody></table>
      <div class="cards">
        <div class="card"><h3>스탠다드</h3><p>가볍게 시작하는 분께. 규모가 작은 서비스에 맞습니다.</p></div>
        <div class="card"><h3>디럭스</h3><p>빈 목록·결제 실패·마감까지 예외 상황이 전부 별도 화면으로.</p></div>
        <div class="card"><h3>프리미엄</h3><p>설계만 드리지 않습니다. 이 설계로 만든 화면 ${prm.siteScreens}개가 함께.</p></div>
      </div>` + foot,
  },
  {
    file: "03_등급별_구성",
    title: "등급별 구성",
    body:
      eye("FILES", "등급별로<br>이렇게 들어 있어요.") +
      `<table class="mtx"><thead><tr>
        <th>포함 내용</th><th>스탠다드</th><th>디럭스</th><th class="top">프리미엄</th>
      </tr></thead><tbody>
        <tr><td>01 메뉴구조<span class="u">메뉴-화면 트리</span></td>${Y}${Y}${Y}</tr>
        <tr><td>02 IA 화면목록<span class="u">화면ID · 화면별 AI 프롬프트</span></td>
            <td class="c y">${std.stats.screens}개</td><td class="c y">${dlx.stats.screens}개</td><td class="c y">${prm.stats.screens}개</td></tr>
        <tr><td>03 기능정의서<span class="u">요건</span></td>
            <td class="c y">${std.stats.reqs}개</td><td class="c y">${dlx.stats.reqs}개</td><td class="c y">${prm.stats.reqs}개</td></tr>
        <tr><td>04 WBS<span class="u">화면별 개발 일정</span></td>${Y}${Y}${Y}</tr>
        <tr><td>05 FLOW 흐름도<span class="u">html · drawio</span></td>${Y}${Y}${Y}</tr>
        <tr><td>06 메뉴구조 조직도<span class="u">pptx</span></td>${Y}${Y}${Y}</tr>
        <tr><td>07 AI 빌드 스펙팩<span class="u">넣고 한 마디면 끝</span></td>${Y}${Y}${Y}</tr>
        <tr><td>디자인 프리셋 3종<span class="u">${DESIGN_PRESETS.map((d) => d.name).join(" · ")}</span></td>${Y}${Y}${Y}</tr>
        <tr class="only"><td>08 검수 시나리오<span class="u">오픈 전 점검표</span></td>${X}${X}<td class="c y">${prm.verify!.scenarios}개</td></tr>
        <tr class="only"><td>완성 화면<span class="u">HTML · 다시 찍어내는 생성기</span></td>${X}${X}<td class="c y">${prm.siteScreens}개</td></tr>
      </tbody></table>` + foot,
  },
  {
    file: "04_어떻게_다른가",
    title: "어떻게 다른가",
    body:
      eye("HOW", "한 줄 프롬프트로 만든 사이트,<br>쉽게 나오지만<br><em>완벽할까요?</em>") +
      `<p class="lead">우리는 <b>화면 ${prm.stats.screens}개의 프롬프트</b>와 <b>요건 ${prm.stats.reqs}개</b>를 근거로
      AI에게 지시합니다. 무엇을 만들지가 이미 정해져 있으니, AI는 상상하지 않고 그대로 만들기만 하면 됩니다.</p>
      <div class="num">
        <div><b>${prm.stats.screens}</b><span>화면별 프롬프트</span></div>
        <div><b>${prm.stats.reqs}</b><span>요건</span></div>
        <div><b>${prm.stats.menus}</b><span>메뉴</span></div>
      </div>
      <p class="lead">화면마다 <b>고유 ID</b>가 붙어 있어서, 고칠 때도 정확히 짚을 수 있습니다.</p>
      <div class="chat">
        <div class="bub bad">장바구니 그 화면 있잖아요, 거기 문구 좀…</div>
        <div class="bub good"><b>BK0102</b> 화면, 최소 인원 미달일 때 문구 바꿔주세요.</div>
      </div>
      <p class="opt">＊ AI에게든 개발사에게든 같은 방식으로 씁니다.</p>` + foot,
  },
  {
    file: "05_어디까지",
    title: "어디까지 만들어지나요",
    body:
      eye("SCOPE", "개발에 꼭 필요한<br>부분까지 <u>작업됩니다.</u>") +
      `<div class="deliver"><h3>개발사에 그대로 전달하셔도 됩니다</h3><ul>
        <li>화면 레이아웃과 구성요소 — 목록·상세·폼·표·모달</li>
        <li>화면 사이 이동 — 버튼을 누르면 설계한 화면으로</li>
        <li>예외·상태 화면 — 빈 목록, 오류, 마감 등</li>
        <li>디자인 프리셋을 넣으면 전 화면 스타일 통일</li>
      </ul></div>
      <div class="after"><h3>개발에서는 이런 추가 작업이 진행돼요</h3>
      <p><b>API 연결</b> — 로그인·결제·지도·알림<br>
      <b>데이터 저장</b> — 입력한 내용이 서버에 남는 것<br>
      <b>권한과 보안</b> — 누가 무엇을 볼 수 있는지<br>
      <b>배포와 도메인 연결</b></p></div>
      <p class="lead">이 서비스에서 개발자에게 넘길 항목은
      <b>${travel.integrations.length}가지</b>입니다 — ${travel.integrations.map((i) => i.area).join(" · ")}.
      견적을 받거나 개발을 맡길 때 이 목록을 그대로 쓰시면 됩니다.</p>` + foot,
  },
  {
    file: "06_AI가_놓치는_것",
    title: "AI가 놓치는 것",
    body:
      eye("TRAP", "AI는 이런 부분을<br><em>놓칠 수 있어요.</em>") +
      `<div class="cards">${travel.painPoints
        .map((p, i) => `<div class="card"><h3>0${i + 1}</h3><p>${p}</p></div>`)
        .join("")}</div>
      <p class="lead">셋 다 만들다가 발견하면 <b>구조를 갈아엎게 되는</b> 것들입니다.</p>
      <div class="quote"><p>편한 건 좋지만,<br>부족한 건 싫잖아요.</p>
      <span>그래서 이런 부분을 먼저 챙겨둔 AI팩입니다.</span></div>` + foot,
  },
];

mkdirSync(OUT, { recursive: true });
for (const s of SECTIONS) {
  writeFileSync(`${OUT}/${s.file}.html`, page(s.title, s.body));
  console.log(`  ✔ ${s.file}.html`);
}

// 합본 — 크몽은 긴 이미지 한 장으로 올리는 경우가 많다. 한 번만 캡처하면 되게 이어 붙인다.
const joined = SECTIONS.map(
  (s, i) => `<div class="wrap"${i ? ` style="border-top:1px solid ${LINE}"` : ""}>${s.body}</div>`,
).join("");
writeFileSync(
  `${OUT}/전체_한장.html`,
  `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>AI팩 상세</title><style>${CSS}</style></head><body>${joined}</body></html>`,
);
console.log(`  ✔ 전체_한장.html`);
console.log(`\n${SECTIONS.length}장 + 합본 → ${OUT}`);
