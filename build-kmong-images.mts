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

const OUT = "판매용_템플릿/_판매팩/00. 크몽_상세이미지";
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
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:24px}
.step{background:#fff;border:1px solid ${LINE};border-radius:12px;padding:16px 18px}
.step b{display:block;font-size:18px;font-weight:700}
.step span{display:block;margin-top:4px;font-size:22px;font-weight:800;color:#7A756A;font-variant-numeric:tabular-nums}
.step.hi{background:${ORANGE_SOFT};border-color:${ORANGE}}
.step.hi span{color:${ORANGE}}
.cap{margin-top:12px;font-size:16px;color:#7A756A}
.plans{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:26px}
.pl{background:#fff;border:1px solid ${LINE};border-radius:16px;padding:24px 20px}
.pl.top{background:${ORANGE_SOFT};border:2px solid ${ORANGE}}
.pl h3{font-size:24px;font-weight:800}
.pl .price{display:block;margin-top:8px;font-size:28px;font-weight:800;font-variant-numeric:tabular-nums}
.pl.top .price{color:${ORANGE}}
.pl .scr{display:inline-block;margin-top:12px;padding:5px 12px;border-radius:999px;
  background:${PAPER_DEEP};font-size:17px;font-weight:700}
.pl.top .scr{background:#fff;color:#B4551E}
.pl p{margin-top:14px;font-size:17px;line-height:1.6;color:#55534E}
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
.hand{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:26px}
.hand div{border-radius:16px;padding:24px 22px;background:#fff;border:1px solid ${LINE}}
.hand div.dev{border:2px solid ${TEAL}}
.hand h3{font-size:20px;font-weight:800;margin-bottom:14px}
.hand div.dev h3{color:${TEAL}}
.hand div.ai h3{color:${ORANGE}}
.hand li{list-style:none;font-size:18px;line-height:1.5;padding-left:20px;position:relative;margin-bottom:10px}
.hand li::before{content:'';position:absolute;left:0;top:9px;width:8px;height:8px;border-radius:50%}
.hand div.dev li::before{background:${TEAL}}
.hand div.ai li::before{background:${ORANGE}}
.deliver{margin-top:26px;border:2px solid ${TEAL};border-radius:16px;background:#fff;padding:26px 24px}
.deliver h3{font-size:23px;font-weight:800;color:${TEAL};margin-bottom:14px}
.deliver li{list-style:none;font-size:19px;line-height:1.55;padding-left:22px;position:relative;margin-bottom:11px}
.deliver li::before{content:'';position:absolute;left:0;top:9px;width:9px;height:9px;border-radius:50%;background:${TEAL}}
.after{margin-top:16px;border-radius:16px;background:${PAPER_DEEP};border:1px solid ${LINE};padding:24px}
.after h3{font-size:20px;font-weight:800;margin-bottom:12px;color:#55534E}
.after p{font-size:18px;line-height:1.7;color:#55534E}
.after b{color:${INK};font-weight:700}
.talk{margin-top:22px;background:${PAPER_DEEP};border:1px solid ${LINE};border-radius:16px;padding:22px}
.row{display:flex;align-items:flex-start;gap:11px;margin-bottom:12px}
.row.me{flex-direction:row-reverse}
.row:last-of-type{margin-bottom:0}
.av{flex:none;width:38px;height:38px;border-radius:50%;background:#C9C4B6;color:#fff;
  font-size:15px;font-weight:800;display:flex;align-items:center;justify-content:center}
.row.me .av{background:${ORANGE}}
.bub{max-width:74%;padding:13px 18px;border-radius:16px;font-size:19px;line-height:1.5;
  background:#fff;border:1px solid ${LINE};color:#7A756A}
.row.me .bub{background:${ORANGE};border-color:${ORANGE};color:#fff;font-weight:700}
.bub b{font-weight:800}
.opt{margin-top:14px;font-size:17px;color:#55534E}
.close{margin-top:30px}
.close p,.close span{display:block;font-size:34px;font-weight:800;line-height:1.35}
.foot{margin-top:34px;padding-top:22px;border-top:1px solid ${LINE};display:flex;align-items:center}
.foot b{font-size:18px;font-weight:800}
.dot{display:inline-block;width:12px;height:12px;border-radius:50%;background:${ORANGE};margin-right:8px;vertical-align:-1px}
.num{display:flex;gap:14px;margin-top:24px}
.num div{flex:1;background:#fff;border:1px solid ${LINE};border-radius:14px;padding:20px;text-align:center}
.num b{display:block;font-size:38px;font-weight:800;color:${ORANGE};font-variant-numeric:tabular-nums}
.num span{font-size:16px;color:#55534E}
/* ── 산출물 예시 ─────────────────────────────────────────────
   말로 "들어 있다"고 하는 것보다 실물을 보여주는 게 빠르다.
   수치·문구는 전부 실제 산출물에서 읽어 온다. */
.doc{margin-top:20px;background:#fff;border:1px solid ${LINE};border-radius:16px;overflow:hidden}
.doc-h{display:flex;align-items:center;gap:10px;padding:16px 20px;border-bottom:1px solid ${LINE}}
.doc-h b{font-size:20px;font-weight:800}
.doc-h i{font-style:normal;font-size:14px;color:#7A756A;font-weight:700}
.doc-h .sp{flex:1}
.tag{font-size:13px;font-weight:800;padding:4px 10px;border-radius:999px;
  background:${PAPER_DEEP};color:#7A756A}
.tag.on{background:${ORANGE};color:#fff}
.doc-b{padding:16px 20px 18px}
.doc-b .note{margin-top:12px;font-size:14px;color:#7A756A}
table.ex{width:100%;border-collapse:collapse;font-size:14.5px;table-layout:fixed}
table.ex th{text-align:left;font-size:12.5px;font-weight:800;color:#7A756A;
  padding:0 8px 8px;border-bottom:1px solid ${LINE}}
table.ex td{padding:10px 8px;border-bottom:1px solid #EFEDE6;vertical-align:top;line-height:1.45}
table.ex tr:last-child td{border-bottom:0}
table.ex .id{font-weight:800;color:${ORANGE};font-size:13.5px;white-space:nowrap}
table.ex .dim{color:#7A756A}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}
.tree{font-size:14.5px;line-height:1.9}
.tree b{display:block;font-weight:800;color:${TEAL};margin-bottom:6px;font-size:15px}
.tree span{display:block;padding-left:14px;color:#55534E}
.tree span em{font-style:normal;color:#A9A396;font-size:13px;margin-left:5px}
.flow{display:flex;flex-wrap:wrap;gap:7px;align-items:center}
.fn{font-size:13.5px;font-weight:700;padding:7px 12px;border-radius:8px;
  background:${PAPER_DEEP};color:#55534E}
.fn.ok{background:#E1F0EC;color:${TEAL}}
.fn.no{background:${ORANGE_SOFT};color:#B4551E}
.fa{color:#C9C4B6;font-size:13px}
.gantt div{display:flex;align-items:center;gap:10px;margin-bottom:9px;font-size:14px}
.gantt em{font-style:normal;width:150px;flex:none;font-weight:700}
.gantt s{text-decoration:none;height:11px;border-radius:6px;background:${ORANGE};display:block}
.gantt u{text-decoration:none;font-size:12.5px;color:#A9A396;white-space:nowrap}
.code{background:#1F2024;border-radius:10px;padding:16px 18px;font-size:13.5px;
  line-height:1.75;color:#D8D4C6;white-space:pre-wrap;word-break:break-all}
.code b{color:${ORANGE};font-weight:800}
.sw{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.sw div{border:1px solid ${LINE};border-radius:12px;padding:14px}
.sw .chips{display:flex;gap:5px;margin-bottom:10px}
.sw .chips i{width:22px;height:22px;border-radius:5px;display:block}
.sw b{font-size:15px;font-weight:800;display:block}
.sw span{font-size:13px;color:#7A756A;line-height:1.5;display:block;margin-top:4px}
.idx b{display:block;font-size:15px;font-weight:800;margin-bottom:12px;color:${TEAL}}
.idx-g{margin-bottom:11px}
.idx-g em{font-style:normal;display:inline-block;width:118px;font-size:13.5px;font-weight:800;color:#55534E;vertical-align:top}
.idx-g span{display:inline-block;font-size:13px;padding:5px 10px;margin:0 5px 5px 0;border-radius:7px;
  background:${PAPER_DEEP};color:#55534E}
.idx-g span.more{background:transparent;color:#A9A396;font-weight:700}
`;

const page = (title: string, body: string) =>
  `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${title}</title><style>${CSS}</style></head><body><div class="wrap">${body}</div></body></html>`;

const eye = (n: string, t: string) => `<div class="eye"><i>${n}</i><s></s></div><h2>${t}</h2>`;
// 도메인은 넣지 않는다 — 크몽 외부 유도 금지.
const foot = `<div class="foot"><b><span class="dot"></span>카페인컬러</b></div>`;

const travel = PACKAGES.find((p) => p.id === "travel")!;
// 요건 문장을 낱개로 쪼갠다 — 판매 페이지 수치(reqs)와 같은 기준.
const splitItems = (f: string) => f.split("·").map((x) => x.trim()).filter(Boolean);
const [std, dlx, prm] = travel.plans;
const Y = '<td class="c y">✓</td>';
const X = '<td class="c x">—</td>';

const SECTIONS: { file: string; title: string; body: string }[] = [
  {
    file: "01_왜_필요한가",
    title: "왜 필요한가",
    body:
      eye("WHY", "사이트 하나 만들 때<br>개발 단계에서<br><em>꼭 요구되는</em> 내용입니다.") +
      `<p class="lead">그 기간을 확실히 줄여 드려요. 실무에서 처음부터 만들면 이만큼 걸립니다.</p>
      <div class="steps">
        <div class="step"><b>요건 정의</b><span>2주</span></div>
        <div class="step"><b>기능 정의</b><span>2주</span></div>
        <div class="step"><b>화면 목록</b><span>2주</span></div>
        <div class="step"><b>유저 플로우</b><span>2주</span></div>
        <div class="step hi"><b>화면설계서 100p</b><span>2~3개월</span></div>
        <div class="step"><b>검수 시나리오</b><span>2주</span></div>
      </div>
      <p class="cap">＊ 서비스 기획 실무 기준</p>
      <p class="lead"><b>AI한테 시키면 되지 않냐고요?</b> 됩니다. 다만 문서 하나하나를 따로 지시해야 하고,
      <b>기준이 될 샘플이 없으면 원하는 대로 나오지 않습니다.</b></p>`,
  },
  {
    file: "02_등급",
    title: "등급",
    body:
      eye("PLAN", "세 가지 중에<br>고르시면 됩니다.") +
      `<div class="plans">
        <div class="pl"><h3>${std.name}</h3><span class="price">${formatKrw(std.priceKrw)}</span>
          <span class="scr">화면 ${std.stats.screens}개</span>
          <p>2뎁스 기본 설계. 가볍게 시작하는 분께, 규모가 작은 서비스에 맞습니다.</p></div>
        <div class="pl"><h3>${dlx.name}</h3><span class="price">${formatKrw(dlx.priceKrw)}</span>
          <span class="scr">화면 ${dlx.stats.screens}개</span>
          <p>3뎁스 심화 설계. 빈 목록·결제 실패·마감까지 예외 상황이 전부 별도 화면으로.</p></div>
        <div class="pl top"><h3>${prm.name}</h3><span class="price">${formatKrw(prm.priceKrw)}</span>
          <span class="scr">화면 ${prm.stats.screens}개 ＋ 완성 HTML</span>
          <p>설계만 드리지 않습니다. 이 설계로 만든 화면과 검수 시나리오가 함께 들어 있어요.</p></div>
      </div>`,
  },
  {
    file: "03_산출물_예시",
    title: "산출물 예시",
    body: (() => {
      // 실제 산출물에서 뽑는다. 그럴듯한 예시를 지어내면 받아보고 다르다고 느낀다.
      const all = travel.deep.menus.flatMap((m) => m.screens);
      const pick = (ref: string) => all.find((s) => s.ref === ref);
      const rows = [...new Set([...travel.promptSamples, "bk6", "ho1"])]
        .map(pick)
        .filter((s): s is NonNullable<typeof s> => Boolean(s))
        .slice(0, 4);
      const cut = (t: string, n: number) => (t.length > n ? `${t.slice(0, n)}…` : t);
      const badge = () => "";

      const ia = `<div class="doc"><div class="doc-h"><b>IA 화면목록</b><i>xlsx</i><span class="sp"></span>${badge()}</div>
        <div class="doc-b"><table class="ex"><colgroup><col style="width:88px"><col style="width:150px"><col><col style="width:270px"></colgroup>
        <thead><tr><th>화면ID</th><th>화면명</th><th>기능 정의</th><th>AI 생성 프롬프트</th></tr></thead><tbody>
        ${rows
          .map(
            (s) =>
              `<tr><td class="id">${s.ref.toUpperCase()}</td><td>${s.name}</td>
               <td class="dim">${cut(s.func, 52)}</td><td class="dim">${cut(s.prompt, 76)}</td></tr>`,
          )
          .join("")}
        </tbody></table><p class="note">외 ${prm.stats.screens - rows.length}개 화면 · 화면마다 프롬프트가 붙어 있습니다</p></div></div>`;

      // 요구사항ID는 lib/export/requirements.ts와 같은 규칙(업무-기능-구성 3단)으로
      // 실제 데이터를 걸어 계산한다. 지어낸 번호를 쓰면 받아본 파일과 어긋난다.
      const pad = (n: number) => String(n).padStart(2, "0");
      // 메뉴를 흩어서 뽑는다 — 한 메뉴에서만 고르면 표본이 편중돼 보인다.
      const reqRows: { id: string; 업무: string; 구성: string }[] = [];
      travel.deep.menus.forEach((m, mi) => {
        m.screens.forEach((sc, si) => {
          splitItems(sc.func).forEach((item, ii) => {
            reqRows.push({
              id: `${pad(mi + 1)}-${pad(si + 1)}-${pad(ii + 1)}`,
              업무: sc.name,
              구성: item,
              menu: mi,
            } as never);
          });
        });
      });
      // 메뉴마다 가장 충실한 요건 하나씩. 짧은 단어만 뽑히면 설계가 얕아 보인다.
      const fdPick = [0, 2, 4, 6]
        .map((mi) => {
          const inMenu = (reqRows as unknown as ({ menu: number } & (typeof reqRows)[number])[]).filter(
            (r) => r.menu === mi && r.구성.length <= 34,
          );
          return inMenu.sort((x, y) => y.구성.length - x.구성.length)[0];
        })
        .filter(Boolean)
        .slice(0, 4);

      const fd = `<div class="doc"><div class="doc-h"><b>기능정의서</b><i>xlsx · 요건 ${prm.stats.reqs}개</i><span class="sp"></span>${badge()}</div>
        <div class="doc-b"><table class="ex"><colgroup><col style="width:120px"><col style="width:170px"><col></colgroup>
        <thead><tr><th>요구사항ID</th><th>업무 · 기능</th><th>구성</th></tr></thead><tbody>
        ${fdPick
          .map(
            (r) =>
              `<tr><td class="id">${r.id}</td><td>${r.업무}</td><td class="dim">${cut(r.구성, 58)}</td></tr>`,
          )
          .join("")}
        </tbody></table><p class="note">업무 → 기능 → 구성 3단계 · 유형(기능·콘텐츠·UI/UX·정책)은 자동 분류됩니다</p></div></div>`;

      const menus = travel.deep.menus as unknown as { code: string; nameKo: string; screens: unknown[] }[];
      const tree = `<div class="doc"><div class="doc-h"><b>메뉴구조</b><i>xlsx · pptx</i><span class="sp"></span>${badge()}</div>
        <div class="doc-b"><div class="tree"><b>${travel.title}</b>
        ${menus.map((m) => `<span>├ ${m.code} ${m.nameKo}<em>화면 ${m.screens.length}</em></span>`).join("")}
        </div></div></div>`;

      const flow = `<div class="doc"><div class="doc-h"><b>FLOW 흐름도</b><i>html · drawio</i><span class="sp"></span>${badge()}</div>
        <div class="doc-b"><div class="flow">
          <span class="fn">상품 상세</span><span class="fa">→</span>
          <span class="fn">날짜·인원</span><span class="fa">→</span>
          <span class="fn">결제</span><span class="fa">→</span>
          <span class="fn ok">예약 완료</span><span class="fa">→</span>
          <span class="fn ok">바우처 발급</span>
        </div><div class="flow" style="margin-top:9px">
          <span class="fa">예외 →</span>
          <span class="fn no">결제 실패</span><span class="fn no">확정 대기</span><span class="fn no">최소 인원 미달</span><span class="fn no">마감</span>
        </div><p class="note">화면 이동 ${prm.stats.flows}개 · draw.io에서 편집</p></div></div>`;

      const wbs = `<div class="doc"><div class="doc-h"><b>WBS</b><i>xlsx</i><span class="sp"></span>${badge()}</div>
        <div class="doc-b"><div class="gantt">
          ${[
            ["HO 홈", 0, 110, "8/3–8/9"],
            ["PR 상품", 90, 170, "8/10–8/20"],
            ["BK 예약·결제", 240, 200, "8/21–9/4"],
            ["VC 바우처", 420, 130, "9/5–9/12"],
          ]
            .map(
              ([n, off, w, d]) =>
                `<div><em>${n}</em><s style="width:${w}px;margin-left:${off}px"></s><u>${d}</u></div>`,
            )
            .join("")}
        </div><p class="note">화면 ${prm.stats.screens}개 전체 일정</p></div></div>`;

      const spec = `<div class="doc"><div class="doc-h"><b>AI 빌드 스펙팩</b><i>md · json</i><span class="sp"></span>${badge()}</div>
        <div class="doc-b"><div class="code">### <b>BK06</b> 최소 인원 미달 안내
· 역할: pending-error
· 요건: ${cut(pick("bk6")?.func ?? "", 44)}
· 프롬프트: ${cut(pick("bk6")?.prompt ?? "", 60)}
· 이동: 대체 상품 → PR01</div>
        <p class="note">이 파일 하나를 AI에 넣고 &ldquo;이대로 만들어줘&rdquo; 하면 됩니다</p></div></div>`;

      const preset = `<div class="doc"><div class="doc-h"><b>디자인 프리셋 3종</b><i>md · json</i><span class="sp"></span>${badge()}</div>
        <div class="doc-b"><div class="sw">
        ${[
          ["#1B2A4A", "#3C5A99", "#E8ECF4"],
          ["#1F2024", "#6B6F76", "#EDEDED"],
          ["#F2C14E", "#7FD1C1", "#F6E7C1"],
        ]
          .map(
            (cs, i) =>
              `<div><div class="chips">${cs.map((c) => `<i style="background:${c}"></i>`).join("")}</div>
               <b>${DESIGN_PRESETS[i].no} ${DESIGN_PRESETS[i].name}</b><span>${travel.presetFits[i]}</span></div>`,
          )
          .join("")}
        </div><p class="note">스펙팩과 함께 넣으면 화면 ${prm.stats.screens}개가 같은 스타일로 나옵니다</p></div></div>`;

      // 검수 시나리오 — lib/export/template-verify.ts의 실제 열 구성(테스트ID·화면구분·확인 항목·결과)을 따른다.
      const vRows = rows.slice(0, 3).map((s, i) => ({
        id: `SCN-${String(i + 1).padStart(3, "0")}`,
        화면: s.name,
        구분: /empty|error|closed|pending|expired/.test(s.role) ? "예외·상태" : "기본",
        항목: splitItems(s.func)[0] ?? "화면이 정상적으로 열리는지 확인",
      }));
      const verify = `<div class="doc"><div class="doc-h"><b>검수 시나리오</b><i>xlsx · 시나리오 ${prm.verify!.scenarios}개</i><span class="sp"></span><span class="tag on">프리미엄</span></div>
        <div class="doc-b"><table class="ex"><colgroup><col style="width:105px"><col style="width:150px"><col style="width:88px"><col><col style="width:112px"></colgroup>
        <thead><tr><th>테스트ID</th><th>화면</th><th>화면구분</th><th>확인 항목</th><th>결과</th></tr></thead><tbody>
        ${vRows
          .map(
            (r) =>
              `<tr><td class="id">${r.id}</td><td>${r.화면}</td><td class="dim">${r.구분}</td>
               <td class="dim">${cut(r.항목, 40)}</td><td class="dim">PASS·FAIL</td></tr>`,
          )
          .join("")}
        </tbody></table><p class="note">화면 하나당 시나리오 하나 · 확인 항목 ${prm.verify!.checks}개 · 결과를 적어 개발자와 그대로 주고받습니다</p></div></div>`;

      // 완성 화면 — 목록(index) 화면을 그대로 보여준다. "받으면 이렇게 생겼다"가 한눈에 온다.
      const idxMenus = menus.slice(0, 4);
      const html = `<div class="doc"><div class="doc-h"><b>완성 화면 HTML</b><i>${prm.siteScreens}개</i><span class="sp"></span><span class="tag on">프리미엄</span></div>
        <div class="doc-b"><div class="idx"><b>${travel.title} — 전체 화면 목록</b>
        ${idxMenus
          .map(
            (m) =>
              `<div class="idx-g"><em>${m.code} ${m.nameKo}</em>${(m.screens as { ref: string; name: string }[])
                .slice(0, 4)
                .map((sc) => `<span>${sc.ref.toUpperCase()} ${cut(sc.name, 12)}</span>`)
                .join("")}${m.screens.length > 4 ? `<span class="more">＋${m.screens.length - 4}</span>` : ""}</div>`,
          )
          .join("")}
        </div><p class="note">각 항목을 눌러 화면을 확인할 수 있어요</p></div></div>`;

      return (
        eye("SAMPLE", "이런 산출물이<br><em>들어 있어요.</em>") +
        `<p class="lead">산출물은 구매하시는 버전에 따라 다르게 구성되어 있습니다.<br>등급별 산출물 항목은 <b>등급별 포함 파일</b>에서 확인해 주세요.</p>` +
        ia +
        fd +
        `<div class="two-col">${tree}${flow}</div>` +
        wbs +
        spec +
        verify +
        html +
        preset
      );
    })(),
  },
  {
    file: "04_어떻게_다른가",
    title: "어떻게 다른가",
    body:
      eye("HOW", "한 줄 프롬프트로 만든 사이트,<br><em>완벽할까요?</em>") +
      `<p class="lead">우리는 <b>화면별 프롬프트 ${prm.stats.screens}개</b>, <b>기능 정의 ${prm.stats.reqs}개</b>,
      <b>화면 이동 흐름 ${prm.stats.flows}개</b>를 근거로 AI에게 지시합니다.
      무엇을 만들지가 이미 정해져 있으니, AI는 상상하지 않고 그대로 만들기만 하면 됩니다.</p>
      <div class="num">
        <div><b>${prm.stats.screens}</b><span>화면별 프롬프트</span></div>
        <div><b>${prm.stats.reqs}</b><span>기능 정의</span></div>
        <div><b>${prm.stats.flows}</b><span>화면 이동 흐름도</span></div>
      </div>
      <div class="talk">
        <div class="row"><div class="av">✕</div>
          <div class="bub">장바구니 그 화면 있잖아요, 거기 문구 좀…</div></div>
        <div class="row me"><div class="av">✓</div>
          <div class="bub"><b>BK0102</b> 화면, 최소 인원 미달일 때 문구 바꿔주세요.</div></div>
      </div>
      <p class="opt">AI에게든 개발사든 <b>고유 ID로 이야기하면 전달이 쉬워집니다.</b></p>`,
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
      <div class="hand">
        <div class="dev"><h3>개발사에게</h3><ul>
          <li>01 메뉴구조</li><li>02 화면목록</li><li>03 기능정의서</li>
          <li>05 FLOW 흐름도</li><li>완성화면 HTML</li>
        </ul></div>
        <div class="ai"><h3>AI에게</h3><ul>
          <li>07 AI 빌드 스펙팩</li><li>디자인 프리셋</li><li>완성화면 HTML</li>
        </ul></div>
      </div>
      <div class="after"><h3>개발에서는 이런 추가 작업이 진행돼요</h3>
      <p><b>API 연결</b> — 로그인·결제·지도·알림<br>
      <b>데이터 저장</b> — 입력한 내용이 서버에 남는 것<br>
      <b>권한과 보안</b> — 누가 무엇을 볼 수 있는지<br>
      <b>배포와 도메인 연결</b></p></div>`,
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
      <div class="close"><p>편한 건 좋지만, 부족한 건 싫잖아요.</p>
      <span>그래서 이런 부분을 먼저 챙겨둔 AI팩입니다.</span></div>`,
  },
  {
    file: "07_등급별_구성",
    title: "등급별 구성",
    body:
      eye("FILES", "등급별로<br>이렇게 들어 있어요.") +
      `<table class="mtx"><thead><tr>
        <th>포함 내용</th><th>스탠다드</th><th>디럭스</th><th class="top">프리미엄</th>
      </tr></thead><tbody>
        <tr><td>01 메뉴구조<span class="u">메뉴-화면 트리 · 조직도 pptx</span></td>${Y}${Y}${Y}</tr>
        <tr><td>02 IA 화면목록<span class="u">화면ID · 화면별 AI 프롬프트</span></td>
            <td class="c y">${std.stats.screens}개</td><td class="c y">${dlx.stats.screens}개</td><td class="c y">${prm.stats.screens}개</td></tr>
        <tr><td>03 기능정의서<span class="u">요건</span></td>
            <td class="c y">${std.stats.reqs}개</td><td class="c y">${dlx.stats.reqs}개</td><td class="c y">${prm.stats.reqs}개</td></tr>
        <tr><td>04 WBS<span class="u">화면별 개발 일정</span></td>${Y}${Y}${Y}</tr>
        <tr><td>05 FLOW 흐름도<span class="u">html · drawio</span></td>${Y}${Y}${Y}</tr>
        <tr><td>07 AI 빌드 스펙팩<span class="u">넣고 한 마디면 끝</span></td>${Y}${Y}${Y}</tr>
        <tr><td>디자인 프리셋 3종<span class="u">${DESIGN_PRESETS.map((d) => d.name).join(" · ")}</span></td>${Y}${Y}${Y}</tr>
        <tr class="only"><td>08 검수 시나리오<span class="u">오픈 전 점검표</span></td>${X}${X}<td class="c y">${prm.verify!.scenarios}개</td></tr>
        <tr class="only"><td>완성 화면<span class="u">HTML · 다시 찍어내는 생성기</span></td>${X}${X}<td class="c y">${prm.siteScreens}개</td></tr>
      </tbody></table>`,
  },
];

mkdirSync(OUT, { recursive: true });
// 푸터는 맨 끝에 한 번만 — 장마다 반복하면 광고지처럼 보인다.
SECTIONS.forEach((s, i) => {
  const last = i === SECTIONS.length - 1;
  writeFileSync(`${OUT}/${s.file}.html`, page(s.title, s.body + (last ? foot : "")));
  console.log(`  ✔ ${s.file}.html`);
});

// 합본 — 크몽은 긴 이미지 한 장으로 올리는 경우가 많다. 구분선 없이 이어 붙인다.
const joined = SECTIONS.map(
  (s, i) => `<div class="wrap">${s.body}${i === SECTIONS.length - 1 ? foot : ""}</div>`,
).join("");
writeFileSync(
  `${OUT}/전체_한장.html`,
  `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>AI팩 상세</title><style>${CSS}</style></head><body>${joined}</body></html>`,
);
console.log(`  ✔ 전체_한장.html`);
console.log(`\n${SECTIONS.length}장 + 합본 → ${OUT}`);
