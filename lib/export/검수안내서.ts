/* 「내 사이트 검수하는 법」 — 팩에 넣는 한 장짜리 안내서. (2026-09-02)
 *
 * 왜 있나 — 사장님 지시.
 *   검수 글이 스펙팩 7-9 에만 있었다. 그런데 스펙팩은 화면 1장짜리도 1,194줄이고
 *   7-9 는 «68% 지점»이다. 화면이 100장이면 몇 천 줄이다.
 *     「우리 스펙팩이 3000줄~5000줄인데 그중에 7번을 찾아서 넣어라?
 *      고객들은 나보다 더 모르는 분들이 많아. 절대 이해 못해.
 *      스펙팩을 열어 보는 것만으로도 스트레스 받을 꺼야.」
 *   그래서 «스펙팩을 안 열어도 이것만 보면 되는» 파일을 따로 만든다.
 *
 * ⛔ 09·10 처럼 «링크만» 주지 않는다. 저 둘은 읽기만 하면 되지만 이건 손님이
 *   «붙여 넣을 코드»가 있어야 한다. 링크만 주면 걸음이 하나 더 는다.
 *   대신 코드는 lib/export/화면검수-글.ts 한 곳에서 가져다 쓴다 — 스펙팩 7-9 와
 *   같은 글이라 갈라질 수가 없다.
 *
 * ⚠ 열어서 «누르면 복사»가 되어야 한다. 237줄을 손으로 긁어 복사하게 두면
 *   그것 때문에 안 한다.
 */
import { 모두검수글, 파일검수글, 화면검수글 } from "./화면검수-글";

const 안전 = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** 재는 열 가지 — 홍보에도 그대로 쓴다. 한 곳에만 적는다. */
export const 재는것들: { 무엇: string; 어떻게: string }[] = [
  { 무엇: "위 메뉴가 굴려도 따라오나", 어떻게: "position 이 sticky·fixed 인지 봅니다" },
  { 무엇: "본문과 푸터가 맞붙었나", 어떻게: "마지막 알맹이와 푸터 사이를 픽셀로 잽니다" },
  { 무엇: "덩어리 사이 간격이 어긋났나", 어떻게: "그 칸의 «리듬»을 재고 벗어난 것만 짚습니다" },
  { 무엇: "버튼·배지가 늘어났나", 어떻게: "글 폭과 실제 폭을 견줍니다. 동그란 버튼이 타원이 됐는지도" },
  { 무엇: "좌우로 미는 칸에 막대가 드러났나", 어떻게: "화살표가 있는데 띠까지 깔렸는지 봅니다" },
  { 무엇: "표가 제 칸을 넘쳤나", 어떻게: "표 폭과 담는 칸 폭을 견줍니다" },
  { 무엇: "지금 보는 메뉴가 켜져 있나", 어떻게: "클래스 이름이 아니라 «옆 링크와 달라 보이는지»로 봅니다" },
  { 무엇: "배경 위 글자가 읽히나", 어떻게: "WCAG 대비 — 본문 4.5, 큰 글자 3.0" },
  { 무엇: "나란한 사진 크기가 같은가", 어떻게: "윗변이 같은 것끼리만 높이를 견줍니다" },
  { 무엇: "끊어진 링크·없는 그림·외톨이 화면", 어떻게: "파일만 봐도 아는 것이라 한 번에 전부 잽니다" },
];

function 코드칸(번호: string, 제목: string, 설명: string, 코드: string, 파일이름: string): string {
  return `<section class="step">
  <h2><span class="no">${번호}</span>${제목}</h2>
  <p class="d">${설명}</p>
  <div class="box">
    <div class="bar"><span class="fn">${파일이름}</span><button class="cp" type="button">복사</button></div>
    <pre><code>${안전(코드)}</code></pre>
  </div>
</section>`;
}

export function 검수안내서HTML(): string {
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>내 사이트 검수하는 법 — 카페인컬러</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Paperlogy,Pretendard,"Malgun Gothic",sans-serif;background:#F0EFEB;color:#22201D;
       line-height:1.75;padding:40px 20px}
  .wrap{max-width:820px;margin:0 auto}
  .lab{font-size:13px;font-weight:700;color:#DE6F26;letter-spacing:.02em}
  h1{font-size:32px;font-weight:800;letter-spacing:-.02em;margin:10px 0 12px;word-break:keep-all}
  .sub{font-size:17px;color:#6B655C;margin-bottom:34px;word-break:keep-all}
  .card{background:#FFFDF8;border:1px solid #E3DED2;border-radius:18px;padding:30px 28px;margin-bottom:20px}
  .step{background:#FFFDF8;border:1px solid #E3DED2;border-radius:18px;padding:28px;margin-bottom:18px}
  .step h2{font-size:20px;font-weight:800;margin-bottom:8px;display:flex;align-items:center;gap:11px;word-break:keep-all}
  .no{background:#DE6F26;color:#fff;font-size:14px;width:28px;height:28px;border-radius:50%;
      display:inline-flex;align-items:center;justify-content:center;flex:none}
  .d{font-size:15px;color:#6B655C;margin-bottom:16px;word-break:keep-all}
  .box{border:1px solid #E3DED2;border-radius:12px;overflow:hidden;background:#FBF9F4}
  .bar{display:flex;align-items:center;justify-content:space-between;gap:10px;
       padding:9px 14px;background:#F3F0E9;border-bottom:1px solid #E3DED2}
  .fn{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;color:#6B655C}
  .cp{background:#22201D;color:#fff;border:0;border-radius:8px;padding:7px 15px;font-size:13px;
      font-weight:700;cursor:pointer;font-family:inherit}
  .cp:hover{background:#3B372F}
  .cp.done{background:#2E7D5B}
  pre{max-height:230px;overflow:auto;padding:15px}
  code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12.5px;line-height:1.6;white-space:pre}
  .kbd{display:inline-block;background:#fff;border:1px solid #CFC8BA;border-bottom-width:2px;border-radius:6px;
       padding:1px 8px;font-size:14px;font-weight:700;font-family:ui-monospace,monospace}
  table{width:100%;border-collapse:collapse;font-size:15px;margin-top:6px}
  th,td{text-align:left;padding:11px 10px;border-bottom:1px solid #EDE8DE;vertical-align:top;word-break:keep-all}
  th{font-size:13px;color:#8A8377;font-weight:700}
  td.w{color:#3B372F;font-weight:600;width:42%}
  td.h{color:#6B655C}
  .note{background:#FFF6EC;border:1px solid #F2D9BE;border-radius:12px;padding:17px 19px;
        font-size:14.5px;color:#6B4A28;margin-top:16px;word-break:keep-all}
  .note b{color:#B4551A}
  .foot{font-size:13.5px;color:#8A8377;margin-top:28px;word-break:keep-all}
  a{color:#DE6F26}
</style></head>
<body><div class="wrap">
  <p class="lab">카페인컬러 안내서</p>
  <h1>만든 사이트를 스스로 검수하는 법</h1>
  <p class="sub">저희가 파는 팩을 재는 잣대 그대로입니다. <b>붙여 넣기 한 번</b>이면 됩니다.<br>
    스펙팩(<code>07_AI빌드_스펙팩.md</code>)을 안 여셔도 이 파일 하나면 됩니다.</p>

  <div class="card">
    <h2 style="font-size:19px;font-weight:800;margin-bottom:12px">무엇을 재나 — 열 가지</h2>
    <table><tr><th>재는 것</th><th>어떻게</th></tr>
    ${재는것들.map((x) => `<tr><td class="w">${x.무엇}</td><td class="h">${x.어떻게}</td></tr>`).join("")}
    </table>
    <div class="note"><b>우리 팩으로 만든 것이 아니어도 됩니다.</b>
      클래스 이름을 보지 않고 «생김새»로만 재기 때문에, 예전에 만드신 사이트에도 그대로 돌아갑니다.</div>
  </div>

  <section class="step">
    <h2><span class="no">0</span>먼저 — 만든 화면을 브라우저로 엽니다</h2>
    <p class="d">HTML 파일이면 <b>index.html 을 더블클릭</b>하시면 됩니다.
      Next·React 처럼 서버가 필요한 것이면 터미널에 <code>npm run dev</code> 를 치고
      <code>localhost:3000</code> 을 여세요.</p>
    <p class="d">그 화면에서 <span class="kbd">F12</span> 를 누르면 창이 갈라집니다.
      위 탭에서 <b>Console</b> 을 고르면 <code>&gt;</code> 가 깜빡이는 빈 줄이 나옵니다. 거기에 붙여 넣습니다.</p>
    <div class="note">처음 붙여 넣을 때 크롬이 <b>“allow pasting”</b> 을 쳐 달라고 할 수 있습니다.
      그대로 치시면 됩니다. 한 번만 물어봅니다.</div>
  </section>

${코드칸("1", "화면 한 장 재기", "지금 열려 있는 그 화면을 잽니다. 붙여 넣고 엔터를 치면 흠 목록이 바로 나옵니다.", 화면검수글, "콘솔에 붙여 넣기")}

${코드칸("2", "화면이 많을 때 — 한 번에 전부", "화면이 스무 장만 넘어도 한 장씩은 못 할 일입니다. 이 글이 전부 열어서 <b>①과 똑같은 것</b>을 잽니다. 위 ①의 글을 <code>화면검수-글.js</code> 로, 아래 글을 <code>화면검수.mjs</code> 로 저장한 뒤 <code>node 화면검수.mjs ./내사이트</code> 한 줄이면 됩니다.", 모두검수글, "화면검수.mjs")}

${코드칸("3", "파일만 봐도 아는 것", "끊어진 링크 · 없는 그림 · 눌러도 안 가는 링크 · 어디서도 안 이어지는 외톨이 화면. 브라우저가 없어도 됩니다. <code>node 검수.mjs ./내사이트</code>", 파일검수글, "검수.mjs")}

  <p class="foot">
    ⚠ <b>고친 뒤에는 다시 돌리세요.</b> 한 번 돌리고 목록만 보시면 안 됩니다 —
    고친 것이 다른 곳을 깨뜨렸는지는 다시 돌려야 압니다.<br>
    ⚠ 사진 위에 얹은 글자는 대비를 잴 수 없어 건너뜁니다. 그건 눈으로 보셔야 합니다.<br><br>
    더 자세한 것은 스펙팩의 <b>7장</b>에 있습니다. 이 글과 같은 검사입니다.
  </p>
</div>
<script>
  document.querySelectorAll(".cp").forEach((b) => {
    b.addEventListener("click", async () => {
      const 글 = b.closest(".box").querySelector("code").textContent;
      try { await navigator.clipboard.writeText(글); }
      catch {
        const t = document.createElement("textarea");
        t.value = 글; document.body.appendChild(t); t.select();
        document.execCommand("copy"); t.remove();
      }
      b.textContent = "복사했습니다"; b.classList.add("done");
      setTimeout(() => { b.textContent = "복사"; b.classList.remove("done"); }, 1800);
    });
  });
</script>
</body></html>
`;
}
