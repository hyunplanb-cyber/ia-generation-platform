// 크몽 상세 이미지용 HTML을 굽는다.
//
// 크몽 상세는 헤드카피·여는글만 텍스트로 두고 나머지는 이미지로 올린다.
// 여기서 만든 HTML을 브라우저로 열어 폭 900px로 캡처하면 그대로 쓸 수 있다.
//
//   npx tsx build-kmong-images.mts
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { PACKAGES, BUILD_SCOPE, DESIGN_PRESETS, formatKrw } from "./lib/packages";

const OUT = "판매용_템플릿/_배포/판매_6종/크몽_상세이미지";
const W = 900;

// 홈페이지와 같은 색·글꼴을 쓴다. 여기서 어긋나면 크몽과 홈페이지가 다른 브랜드로 보인다.
const PAPER = "#F4ECD8";
const PAPER_DEEP = "#ECE1C7";
const LINE = "#D9CCA8";
const INK = "#1F2024";
const ORANGE = "#E4762C";
const ORANGE_SOFT = "#FBE7D3";
const TEAL = "#0E6F60";

const font = (file: string) =>
  readFileSync(`app/fonts/paperlogy/${file}`).toString("base64");
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
.wrap{padding:56px 48px 60px}
.eye{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.eye i{font-style:normal;font-weight:800;font-size:13px;color:${ORANGE};letter-spacing:.08em}
.eye s{flex:1;height:1px;background:${LINE};text-decoration:none}
h2{font-size:38px;font-weight:800;line-height:1.25;letter-spacing:-.02em;text-wrap:balance}
h2 em{font-style:normal;color:${ORANGE}}
h2 u{text-decoration:none;color:${TEAL}}
.lead{margin-top:16px;font-size:17px;line-height:1.75;color:#5B5A55}
.lead b{color:${INK};font-weight:700}
table{width:100%;border-collapse:collapse;margin-top:28px;font-size:17px}
th,td{padding:15px 18px;text-align:left;border-bottom:1px solid ${LINE}}
thead th{font-size:13px;font-weight:800;letter-spacing:.06em;color:#7A756A;
  border-bottom:2px solid ${INK};padding-bottom:11px}
td.n{text-align:right;font-weight:700;font-variant-numeric:tabular-nums}
tr.hi td{background:${ORANGE_SOFT};font-weight:800}
tr.hi td.n{color:${ORANGE}}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:28px}
.card{background:#fff;border:1px solid ${LINE};border-radius:14px;padding:20px 18px}
.card h3{font-size:17px;font-weight:800;margin-bottom:8px}
.card p{font-size:14.5px;line-height:1.65;color:#5B5A55}
.two{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:28px}
.box{border-radius:14px;padding:22px 20px}
.box.ok{background:#fff;border:2px solid ${TEAL}}
.box.no{background:${PAPER_DEEP};border:1px solid ${LINE}}
.box h3{font-size:18px;font-weight:800;margin-bottom:12px}
.box.ok h3{color:${TEAL}}
.box li{list-style:none;font-size:15px;line-height:1.6;padding-left:18px;position:relative;margin-bottom:9px}
.box li::before{content:'';position:absolute;left:0;top:9px;width:7px;height:7px;border-radius:50%}
.box.ok li::before{background:${TEAL}}
.box.no li::before{background:#B4AC98}
.quote{margin-top:30px;padding:24px 26px;background:${INK};color:${PAPER};border-radius:14px}
.quote p{font-size:21px;font-weight:800;line-height:1.5}
.quote span{display:block;margin-top:9px;font-size:15px;font-weight:400;color:#B8B2A4}
.chat{margin-top:26px;display:flex;flex-direction:column;gap:11px}
.bub{max-width:78%;padding:14px 18px;border-radius:16px;font-size:16px;line-height:1.55}
.bub.bad{align-self:flex-start;background:${PAPER_DEEP};color:#7A756A;border:1px solid ${LINE}}
.bub.good{align-self:flex-end;background:${ORANGE};color:#fff;font-weight:700}
.bub b{font-weight:800}
.foot{margin-top:30px;padding-top:20px;border-top:1px solid ${LINE};
  display:flex;justify-content:space-between;align-items:center}
.foot b{font-size:15px;font-weight:800}
.foot span{font-size:14px;color:#7A756A}
.dot{display:inline-block;width:11px;height:11px;border-radius:50%;background:${ORANGE};margin-right:7px;vertical-align:-1px}
.num{display:flex;gap:16px;margin-top:22px}
.num div{flex:1;background:#fff;border:1px solid ${LINE};border-radius:14px;padding:18px;text-align:center}
.num b{display:block;font-size:32px;font-weight:800;color:${ORANGE};font-variant-numeric:tabular-nums}
.num span{font-size:14px;color:#5B5A55}`;

const page = (title: string, body: string) =>
  `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${title}</title><style>${CSS}</style></head><body><div class="wrap">${body}</div></body></html>`;

const eye = (n: string, t: string) => `<div class="eye"><i>${n}</i><s></s></div><h2>${t}</h2>`;
const foot = `<div class="foot"><b><span class="dot"></span>카페인컬러</b><span>caffeinecolor.com</span></div>`;

const travel = PACKAGES.find((p) => p.id === "travel")!;
const [std, dlx, prm] = travel.plans;

const SECTIONS: { file: string; title: string; body: string }[] = [
  {
    file: "01_왜_필요한가",
    title: "왜 필요한가",
    body:
      eye("WHY", "서비스 기획 15년,<br>이 문서 한 벌을 만들면<br><em>이만큼</em> 걸립니다.") +
      `<table><thead><tr><th>단계</th><th class="n">실무 소요</th></tr></thead><tbody>
        <tr><td>요건 정의</td><td class="n">2주</td></tr>
        <tr><td>기능 정의</td><td class="n">2주</td></tr>
        <tr><td>화면 목록</td><td class="n">2주</td></tr>
        <tr><td>유저 플로우</td><td class="n">2주</td></tr>
        <tr class="hi"><td>화면설계서 100페이지</td><td class="n">2~3개월</td></tr>
        <tr><td>검수 시나리오</td><td class="n">2주</td></tr>
      </tbody></table>
      <p class="lead"><b>AI한테 시키면 되지 않냐고요?</b> 됩니다. 다만 문서 하나하나를 따로 지시해야 하고,
      무엇보다 <b>기준이 될 샘플이 없으면 원하는 대로 나오지 않습니다.</b>
      요건 정의를 시켜본 적 없는 사람이 요건 정의를 검수할 수는 없으니까요.</p>
      <div class="quote"><p>AI 구독료 3만 원으로<br>전문가가 될 수 있나요?</p>
      <span>도구는 실력을 대신해 주지 않습니다. 무엇을 만들지 아는 사람의 문서가 필요합니다.</span></div>` +
      foot,
  },
  {
    file: "02_등급",
    title: "등급",
    body:
      eye("PLAN", "세 가지 중에<br>고르시면 됩니다.") +
      `<table><thead><tr><th>등급</th><th class="n">화면</th><th class="n">가격</th></tr></thead><tbody>
        <tr><td><b>${std.name}</b><br><span style="font-size:14.5px;color:#7A756A">2뎁스 기본 설계 · 가볍게 시작하는 분께</span></td>
            <td class="n">${std.stats.screens}개</td><td class="n">${formatKrw(std.priceKrw)}</td></tr>
        <tr><td><b>${dlx.name}</b><br><span style="font-size:14.5px;color:#7A756A">3뎁스 심화 설계 · 실무에서 2~3개월 걸리는 분량</span></td>
            <td class="n">${dlx.stats.screens}개</td><td class="n">${formatKrw(dlx.priceKrw)}</td></tr>
        <tr class="hi"><td><b>${prm.name}</b><br><span style="font-size:14.5px;color:#B4551E">디럭스 전부 + 만들어 둔 화면 + 검수 시나리오</span></td>
            <td class="n">${prm.stats.screens}개<br><span style="font-size:13px">+HTML ${prm.siteScreens}</span></td>
            <td class="n">${formatKrw(prm.priceKrw)}</td></tr>
      </tbody></table>
      <div class="cards">
        <div class="card"><h3>스탠다드</h3><p>AI팩이 어떤 건지 먼저 보고 싶은 분, 규모가 작은 서비스를 만드는 분께.</p></div>
        <div class="card"><h3>디럭스</h3><p>빈 목록·결제 실패·마감까지 예외 상황이 전부 별도 화면으로 있습니다.</p></div>
        <div class="card"><h3>프리미엄</h3><p>설계만 드리지 않습니다. 이 설계로 실제로 만든 화면 ${prm.siteScreens}개가 함께 들어 있어요.</p></div>
      </div>` + foot,
  },
  {
    file: "03_전문가처럼",
    title: "전문가처럼 대화하세요",
    body:
      eye("HOW", "만들어 주는 대로<br><em>안주하지 마세요.</em>") +
      `<p class="lead">화면 목록에는 <b>화면마다 고유 ID</b>가 붙어 있습니다.
      AI에게든 개발사에게든 이렇게 말하세요.</p>
      <div class="chat">
        <div class="bub bad">장바구니 그 화면 있잖아요, 거기 문구 좀…</div>
        <div class="bub good"><b>BK0102</b> 화면에서 최소 출발 인원 미달일 때 문구를 바꿔주세요.</div>
      </div>
      <p class="lead">화면별 프롬프트도 그대로 들어 있어서 <b>그 화면만 다시 만들어 달라고</b> 할 수도 있습니다.
      기획 내용을 제대로 전달하지 못하면 이상한 사이트가 나옵니다.
      그게 AI 탓 같지만, 대부분은 <b>무엇을 원하는지 말하지 못해서</b> 생기는 일입니다.</p>
      <div class="num">
        <div><b>${prm.stats.screens}</b><span>화면</span></div>
        <div><b>${prm.stats.reqs}</b><span>요건</span></div>
        <div><b>${prm.verify!.checks}</b><span>확인 항목</span></div>
      </div>` + foot,
  },
  {
    file: "04_어디까지",
    title: "어디까지 만들어지나요",
    body:
      eye("SCOPE", "어디까지 만들어지나요?<br><u>꼭 읽어주세요.</u>") +
      `<div class="two">
        <div class="box ok"><h3>만들어집니다</h3><ul>${BUILD_SCOPE.made.map((x) => `<li>${x}</li>`).join("")}</ul></div>
        <div class="box no"><h3>개발이 필요합니다</h3><ul>${BUILD_SCOPE.needsDev.map((x) => `<li>${x}</li>`).join("")}</ul></div>
      </div>
      <p class="lead">화면은 눌러서 돌아다닐 수 있는 상태로 나옵니다.
      <b>다만 로그인 버튼을 눌러도 실제로 로그인이 되지는 않습니다.</b>
      바깥 서비스를 불러야 하는 기능이기 때문입니다.</p>
      <p class="lead" style="margin-top:14px">개발자에게 넘길 항목 ${travel.integrations.length}가지 —
      ${travel.integrations.map((i) => i.area).join(" · ")}.
      견적을 받거나 개발을 맡길 때 이 목록을 그대로 쓰시면 됩니다.</p>` + foot,
  },
  {
    file: "05_받는파일",
    title: "받는 파일",
    body:
      eye("FILES", "이런 파일을<br>받으십니다.") +
      `<table><thead><tr><th>파일</th><th>내용</th></tr></thead><tbody>
        <tr><td><b>01 메뉴구조</b></td><td>메뉴-화면 트리</td></tr>
        <tr class="hi"><td><b>02 IA 화면목록</b></td><td>화면 목록 + 화면ID + 화면별 AI 프롬프트</td></tr>
        <tr><td><b>03 기능정의서</b></td><td>업무·기능·구성·유형별 요건</td></tr>
        <tr><td><b>04 WBS</b></td><td>화면별 개발 일정</td></tr>
        <tr><td><b>05 FLOW 흐름도</b></td><td>화면 이동 흐름도 (draw.io 편집 가능)</td></tr>
        <tr><td><b>06 메뉴구조 슬라이드</b></td><td>조직도 형태 PPT</td></tr>
        <tr><td><b>07 AI빌드 스펙팩</b></td><td>AI 코딩툴에 통째로 넣는 스펙</td></tr>
        <tr><td><b>디자인 프리셋</b></td><td>${DESIGN_PRESETS.map((d) => d.name).join(" · ")}</td></tr>
        <tr class="hi"><td><b>08 검수시나리오</b></td><td>오픈 전 점검표 — 프리미엄</td></tr>
        <tr class="hi"><td><b>완성화면</b></td><td>HTML ${prm.siteScreens}개 + 생성기 — 프리미엄</td></tr>
      </tbody></table>
      <p class="lead"><b>AI에 넣는 파일은 스펙팩 하나면 충분합니다.</b>
      엑셀은 AI용이 아니라 사람이 보는 기획 문서예요.</p>` + foot,
  },
  {
    file: "06_자주빠지는것",
    title: "자주 빠지는 것",
    body:
      eye("TRAP", "이 업종에서<br><em>자주 빠지는 것</em> 셋.") +
      `<div class="cards">${travel.painPoints
        .map((p, i) => `<div class="card"><h3>0${i + 1}</h3><p>${p}</p></div>`)
        .join("")}</div>
      <p class="lead">셋 다 만들다가 발견하면 <b>구조를 갈아엎게 되는</b> 것들입니다.
      그래서 먼저 정해두는 겁니다.</p>
      <div class="quote"><p>편한 건 좋지만,<br>부족한 건 싫어서.</p>
      <span>AI한테 "알아서 해줘"라고 하면 잘 되는 경우만 만들어 줍니다.</span></div>` + foot,
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
