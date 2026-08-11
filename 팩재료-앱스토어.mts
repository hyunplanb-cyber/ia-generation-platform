/* 스토어에 올릴 «아이콘»과 «스크린샷»을 팩에서 뽑는다.
 *
 * 왜 만드나 (2026-08-10)
 *   「앱으로 내놓는 법」 안내서를 쓰면서 알았다 — 등록할 때 제일 손이 많이 가는 것이
 *   아이콘과 스크린샷인데, **우리는 그 재료를 이미 다 갖고 있다.**
 *     · 완성화면이 있으니 «진짜 앱 화면» 스크린샷을 찍을 수 있다
 *     · 디자인프리셋에 주색·글꼴이 있으니 아이콘 초안을 만들 수 있다
 *   손님이 그림판을 열 일이 없어진다.
 *
 * ⚠ **값을 지어내지 않는다.** 색은 그 팩이 실제로 쓴 가이드 JSON 에서 읽는다.
 *   어느 가이드를 썼는지도 완성화면 index.html 이 스스로 적어 둔 것을 읽는다.
 *
 * ⚠ 스토어 스크린샷은 «진짜 앱 화면»이라야 한다. 예쁜 그림만 넣으면 반려된다.
 *   그래서 완성화면을 폰 폭으로 열어 찍고, 위에 한 줄 설명만 얹는다.
 *
 * ⚠ **팩에 넣는 것은 «완성품»이 아니라 «틀»이다.**
 *   여기서 찍는 그림은 우리 견본 사이트(「빌려쓰기」) 화면이라 손님 스토어에 못 쓴다.
 *   손님은 자기 이름·자기 화면으로 다시 만들어야 한다. 그래서 팩에는
 *   **손님이 자기 화면으로 뽑는 틀**을 넣고, 우리 그림은 «이렇게 생깁니다» 견본 한 장씩만 넣는다.
 *   (2026-08-10 에 완성품을 넣으려다 알았다 — 남의 가게 이름이 박힌 그림은 쓸모가 없다.)
 *
 * 나오는 것 (팩 안 `앱스토어재료/`)
 *   아이콘_만들기.html        열어서 글자·색을 고치고 화면 캡처하면 아이콘이 된다
 *   스크린샷_만들기.html      자기 화면을 골라 얹으면 스토어 스크린샷이 된다
 *   견본_아이콘.png           «이렇게 생깁니다» — 우리 견본
 *   견본_스크린샷.png         〃
 *   읽어보세요.txt            크기·개수·주의사항과 쓰는 법
 *
 * 쓰는 법
 *   npx tsx 팩재료-앱스토어.mts 장비렌탈_디럭스
 *   npx tsx 팩재료-앱스토어.mts rental
 */
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync, rmSync, cpSync,
} from "node:fs";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const 팩방 = "판매용_템플릿/_판매팩";

/* 아이폰 6.9형(15/16 Pro Max) 세로. 애플이 요구하는 가장 큰 자리라 이걸로 찍으면
   작은 기기용은 스토어가 알아서 줄여 준다. */
const 샷 = { w: 1290, h: 2796 };
/* 화면은 폰 폭 그대로 찍고 스크린샷 판에 얹는다. 1290 은 3배 밀도라 430 이 CSS 폭. */
const 폰 = { w: 430, h: 932 };

const 준인자 = process.argv[2];
if (!준인자) {
  console.error("쓰는 법: npx tsx 팩재료-앱스토어.mts <팩폴더·업종·팩키>");
  process.exit(1);
}
const { PACKAGES } = await import("./lib/packages");
const 인자 = PACKAGES.find((p) => p.id === 준인자)?.fileLabel ?? 준인자;

const 후보 = readdirSync(팩방, { withFileTypes: true })
  .filter((e) => e.isDirectory() && (e.name === 인자 || e.name.startsWith(`${인자}_`)))
  .map((e) => e.name).sort();
const 대상 = 후보.filter((p) => existsSync(join(팩방, p, "완성화면", "pages")));
if (!대상.length) { console.error(`「${인자}」에 완성화면이 있는 팩이 없습니다.`); process.exit(1); }

// 프로세스 번호를 붙인다 — 루틴 둘이 동시에 돌 때 서로의 작업을 지우지 않게(2026-08-11).
const WORK = join(tmpdir(), `cc-appstore-${process.pid}`).replace(/\\/g, "/");

/** 이 팩이 실제로 쓴 가이드의 색을 읽는다. 지어내지 않는다. */
function 색읽기(팩: string, index: string) {
  /* 어느 가이드를 썼는지 «화면이 실제로 쓰는 색»으로 찾는다.
   *
   * ⚠ index.html 의 문장에 기대면 안 된다. 팩마다 말이 다르고
   *   (렌탈 「가이드 01 내추럴 그린 × …」 / 여행 「가이드 프리셋 03 — 소프트 파스텔」),
   *   더 나쁜 것은 index 가 **세 프리셋을 다 소개**해서 첫 번째를 집게 된다는 것이다.
   *   2026-08-10 에 여행이 그렇게 틀린 색으로 나왔다.
   *
   * base.css 의 `--primary` 는 그 화면이 «실제로 그려진» 색이다. 그것과 맞는 가이드를 찾는다.
   * 못 찾으면 조용히 넘어가지 않고 알린다 — 화면과 가이드가 갈라졌다는 뜻이기 때문이다. */
  const 방 = join(팩방, 팩, "디자인프리셋");
  const 가이드들 = readdirSync(방).filter((f) => f.startsWith("가이드_") && f.endsWith(".json")).sort();
  if (!가이드들.length) throw new Error(`${방} 에 가이드 JSON 이 없습니다`);

  const css = readFileSync(join(팩방, 팩, "완성화면/assets/css/base.css"), "utf8");
  const 쓰는색 = /--primary:\s*(#[0-9A-Fa-f]{6})/.exec(css)?.[1]?.toUpperCase();

  const 이름 = 가이드들.find((f) => {
    const g = JSON.parse(readFileSync(join(방, f), "utf8"));
    const k = Object.keys(g.colors).find((x) => x.startsWith("primary ("));
    return k && String(g.colors[k]).toUpperCase() === 쓰는색;
  });
  if (!이름) {
    throw new Error(
      `화면은 ${쓰는색} 로 그려졌는데, 팩에 실린 가이드 ${가이드들.length}개 중 그 색이 없습니다.\n` +
      `  → 화면과 디자인프리셋이 갈라졌습니다. 팩: ${팩}\n` +
      `  → 실린 가이드: ${가이드들.map((f) => f.replace(/^가이드_\d+_|\.json$/g, "")).join(" · ")}`,
    );
  }
  const m = [null, "", /가이드_\d{2}_(.+)\.json$/.exec(이름)?.[1] ?? "가이드"] as unknown as RegExpExecArray;
  const g = JSON.parse(readFileSync(join(방, 이름), "utf8"));
  const 골라 = (앞: string) => {
    const k = Object.keys(g.colors).find((x) => x.startsWith(앞));
    if (!k) throw new Error(`${앞} 색이 가이드에 없습니다`);
    return g.colors[k] as string;
  };
  return {
    색이름: m[2].trim(),
    primary: 골라("primary ("),
    onPrimary: 골라("on-primary"),
    background: 골라("background"),
    text: 골라("text ("),
    글꼴: (g.typography?.fontFamily as string) ?? "Paperlogy",
  };
}

/** 아이콘 한 장. 글자를 넣지 않는다 — 폰 홈 화면에서는 아주 작게 보인다. */
function 아이콘판(색: ReturnType<typeof 색읽기>, 글자: string, 크기: number) {
  /* ⚠ 한글 글자는 «글자칸»이 네모인데 실제 획은 그 안에서 위로 쏠려 있다.
     flex 가운데 정렬만 하면 눈으로 볼 때 오른쪽 아래로 치우쳐 보인다(2026-08-10 에 그랬다).
     그래서 글자를 절대 위치로 두고 «획이 그려진 자리»를 기준으로 가운데에 맞춘다.
     line-height 를 1 로 두고 translate 로 정확히 반씩 옮기면 칸 기준으로 딱 가운데다. */
  return `<!doctype html><meta charset="utf-8"><style>
  html,body{margin:0;padding:0;width:${크기}px;height:${크기}px;overflow:hidden}
  /* ⚠ 애플 아이콘은 투명한 곳이 있으면 안 된다. 배경을 꽉 채운다. */
  .i{position:absolute;inset:0;width:${크기}px;height:${크기}px;background:${색.primary}}
  /* ⚠ 자간(letter-spacing)을 쓰지 않는다. 글자가 «하나»뿐이라 좁힐 사이가 없는데,
     마지막 글자 뒤에도 붙어서 글상자만 좁아진다. 그만큼 획이 오른쪽으로 밀린다 —
     재 보니 12px 이었다(2026-08-10). margin 으로 빼 보려다 안 돼서 아예 없앴다. */
  .g{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
     font:800 ${Math.round(크기 * 0.44)}px/1 ${색.글꼴},Pretendard,sans-serif;
     color:${색.onPrimary};white-space:nowrap}
  /* 모서리는 깎지 않는다 — 애플·구글이 알아서 깎는다. 미리 깎으면 두 번 깎인다. */
</style><div class="i"><span class="g">${글자}</span></div>`;
}

/** 스크린샷 판 — 위에 한 줄 설명, 아래에 진짜 앱 화면. */
function 샷판(색: ReturnType<typeof 색읽기>, 말: string, 화면: string) {
  return `<!doctype html><meta charset="utf-8"><style>
  html,body{margin:0;width:${샷.w}px;height:${샷.h}px;overflow:hidden;background:${색.background}}
  .판{width:${샷.w}px;height:${샷.h}px;display:flex;flex-direction:column;align-items:center}
  .말{font:800 62px/1.35 ${색.글꼴},Pretendard,sans-serif;color:${색.text};
      text-align:center;padding:96px 80px 0;word-break:keep-all;letter-spacing:-.02em}
  .틀{margin-top:64px;width:${폰.w * 3}px;height:${샷.h - 430}px;overflow:hidden;
      border-radius:56px;box-shadow:0 24px 80px rgba(0,0,0,.18);background:#fff}
  /* 폰 폭(430)으로 그린 뒤 3배로 늘린다 — 글자가 또렷하게 남는다. */
  iframe{width:${폰.w}px;height:${Math.round((샷.h - 430) / 3)}px;border:0;
         transform:scale(3);transform-origin:0 0}
</style><div class="판">
  <div class="말">${말}</div>
  <div class="틀"><iframe src="${화면}"></iframe></div>
</div>`;
}

/* ─────────────────────────────────────────────────────────────
   손님이 «자기 화면»으로 뽑는 틀 두 장.
   브라우저로 열면 바로 보이고, 화면 안에서 고쳐 쓴다. 깔 것도 없다.
   ───────────────────────────────────────────────────────────── */
function 아이콘틀(색: ReturnType<typeof 색읽기>) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>앱 아이콘 만들기</title><style>
  body{margin:0;padding:28px;background:#F4F3EE;color:#20261C;
       font:16px/1.7 ${색.글꼴},Pretendard,"맑은 고딕",sans-serif}
  h1{font-size:22px;margin:0 0 6px}
  p{margin:0 0 18px;color:#4E4A3B;font-size:14px}
  .줄{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:16px}
  label{font-size:13px;font-weight:700}
  input[type=text]{width:60px;padding:7px 10px;border:1px solid #D8D4C6;border-radius:8px;font:inherit;text-align:center}
  input[type=color]{width:46px;height:34px;border:1px solid #D8D4C6;border-radius:8px;background:none}
  button{padding:8px 14px;border:1px solid #D8D4C6;border-radius:8px;background:#fff;font:inherit;cursor:pointer}
  button.on{background:#20261C;color:#fff;border-color:#20261C}
  /* 이 네모만 캡처하시면 됩니다. 테두리는 캡처 자리를 알려 주는 표시입니다. */
  .틀{display:inline-block;outline:2px dashed #C25D17;outline-offset:8px}
  .아이콘{display:grid;place-items:center;overflow:hidden}
  .아이콘 span{line-height:1;font-weight:800}
  .안내{margin-top:34px;font-size:13px;color:#4E4A3B;max-width:560px}
  .안내 b{color:#20261C}
</style></head><body>
<h1>앱 아이콘 만들기</h1>
<p>글자와 색을 사장님 것으로 고친 뒤, <b>점선 안쪽만</b> 화면 캡처하세요.</p>
<div class="줄">
  <label>글자 <input type="text" id="g" value="${"앱"}" maxlength="2"></label>
  <label>바탕 <input type="color" id="bg" value="${색.primary}"></label>
  <label>글자색 <input type="color" id="fg" value="${색.onPrimary}"></label>
  <button id="b1024" class="on">1024 로 보기 (애플)</button>
  <button id="b512">512 로 보기 (구글)</button>
  <span id="크기표" style="font-size:13px;color:#4E4A3B"></span>
</div>
<div class="틀"><div class="아이콘" id="ico"><span id="글자">앱</span></div></div>
<div class="안내">
  <p><b>지킬 것</b><br>
  · 모서리를 미리 깎지 마세요 — 애플·구글이 알아서 깎습니다. 미리 깎으면 두 번 깎입니다.<br>
  · 투명한 곳이 있으면 애플에서 반려됩니다. 바탕을 꽉 채우세요.<br>
  · 글자는 한두 자. 폰 홈 화면에서는 아주 작게 보입니다.<br>
  · 글자 대신 도형 하나를 써도 좋습니다. 같은 바탕색 위에 흰 도형 하나면 충분합니다.</p>
</div>
<script>
  var 크기 = 1024;
  function 그리기(){
    var ico = document.getElementById('ico');
    ico.style.width = ico.style.height = 크기 + 'px';
    ico.style.background = document.getElementById('bg').value;
    var s = document.getElementById('글자');
    s.textContent = document.getElementById('g').value || '앱';
    s.style.color = document.getElementById('fg').value;
    s.style.fontSize = Math.round(크기 * 0.44) + 'px';
    document.getElementById('크기표').textContent = 크기 + ' × ' + 크기;
    document.getElementById('b1024').className = 크기 === 1024 ? 'on' : '';
    document.getElementById('b512').className = 크기 === 512 ? 'on' : '';
  }
  document.getElementById('b1024').onclick = function(){ 크기 = 1024; 그리기(); };
  document.getElementById('b512').onclick = function(){ 크기 = 512; 그리기(); };
  ['g','bg','fg'].forEach(function(id){ document.getElementById(id).oninput = 그리기; });
  그리기();
</script></body></html>`;
}

function 샷틀(색: ReturnType<typeof 색읽기>) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>스토어 스크린샷 만들기</title><style>
  body{margin:0;padding:28px;background:#F4F3EE;color:#20261C;
       font:16px/1.7 ${색.글꼴},Pretendard,"맑은 고딕",sans-serif}
  h1{font-size:22px;margin:0 0 6px}
  p.설명{margin:0 0 18px;color:#4E4A3B;font-size:14px}
  .줄{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px}
  label{font-size:13px;font-weight:700}
  input[type=text]{padding:7px 10px;border:1px solid #D8D4C6;border-radius:8px;font:inherit}
  #주소{width:340px} #말{width:420px}
  input[type=color]{width:46px;height:34px;border:1px solid #D8D4C6;border-radius:8px;background:none}
  /* 판이 1290px 이라 화면보다 넓다. 보기용으로 줄여 두고 캡처할 때만 100% 로 키운다. */
  .싸개{overflow:auto;margin-top:12px}
  .틀{display:inline-block;outline:2px dashed #C25D17;outline-offset:8px;transform-origin:0 0}
  /* 여기부터가 캡처할 판이다. 크기를 손대지 마세요 — 스토어가 요구하는 크기입니다. */
  .판{width:${샷.w}px;height:${샷.h}px;display:flex;flex-direction:column;align-items:center;overflow:hidden}
  .말{font-weight:800;font-size:62px;line-height:1.35;text-align:center;
      padding:96px 80px 0;word-break:keep-all;letter-spacing:-.02em}
  .폰{margin-top:64px;width:${폰.w * 3}px;height:${샷.h - 430}px;overflow:hidden;
      border-radius:56px;box-shadow:0 24px 80px rgba(0,0,0,.18);background:#fff}
  .폰 iframe{width:${폰.w}px;height:${Math.round((샷.h - 430) / 3)}px;border:0;
             transform:scale(3);transform-origin:0 0}
  .안내{margin-top:34px;font-size:13px;color:#4E4A3B;max-width:640px}
  .안내 b{color:#20261C}
</style></head><body>
<h1>스토어 스크린샷 만들기</h1>
<p class="설명">사장님 화면 주소를 넣고 한 줄 설명을 쓴 뒤, <b>점선 안쪽만</b> 화면 캡처하세요. 3~5장 만드시면 됩니다.</p>
<div class="줄">
  <label>화면 주소 <input type="text" id="주소" value="" placeholder="http://localhost:3000"></label>
  <label>바탕 <input type="color" id="bg" value="${색.background}"></label>
  <label>글자색 <input type="color" id="fg" value="${색.text}"></label>
</div>
<div class="줄">
  <label>한 줄 설명 <input type="text" id="말" value="날짜만 고르면 남은 것이 보여요"></label>
</div>
<div class="줄">
  <button id="작게" class="on">줄여서 보기</button>
  <button id="크게">캡처할 크기 (100%)</button>
  <span style="font-size:13px;color:#4E4A3B">캡처는 <b>100%</b> 로 놓고 하세요. ${샷.w} × ${샷.h} 그대로 찍힙니다.</span>
</div>
<div class="싸개"><div class="틀" id="틀"><div class="판" id="판">
  <div class="말" id="말보기">날짜만 고르면 남은 것이 보여요</div>
  <div class="폰"><iframe id="frame" src="about:blank"></iframe></div>
</div></div></div>
<div class="안내">
  <p><b>지킬 것</b><br>
  · <b>첫 장이 거의 전부입니다.</b> 스토어 목록에서는 첫 장만 보입니다.<br>
  · 한 줄 설명은 «무엇이 되는지»로 쓰세요. 화면 이름을 그대로 쓰면 아무 말도 안 됩니다.<br>
  &nbsp;&nbsp;(「예약 목록」 ✗ → 「날짜만 고르면 남은 것이 보여요」 ○)<br>
  · <b>진짜 앱 화면이라야 합니다.</b> 예쁜 그림만 넣으면 반려됩니다.<br>
  · 화면 주소를 못 불러오면(다른 사이트를 막아 둔 경우) 폰으로 직접 찍은 화면을
    이 자리에 얹어도 됩니다. 크기만 맞으면 됩니다.</p>
</div>
<script>
  function 그리기(){
    document.getElementById('판').style.background = document.getElementById('bg').value;
    var m = document.getElementById('말보기');
    m.textContent = document.getElementById('말').value;
    m.style.color = document.getElementById('fg').value;
    var u = document.getElementById('주소').value.trim();
    if (u) document.getElementById('frame').src = u;
  }
  function 배율(z){
    var t = document.getElementById('틀');
    t.style.transform = 'scale(' + z + ')';
    /* transform 은 «자리»를 안 줄인다. 줄인 만큼 싸개 높이를 따로 잡아 줘야
       아래가 텅 비지 않는다. */
    t.parentElement.style.height = Math.round(${샷.h} * z + 40) + 'px';
    document.getElementById('작게').className = z < 1 ? 'on' : '';
    document.getElementById('크게').className = z === 1 ? 'on' : '';
  }
  document.getElementById('작게').onclick = function(){ 배율(0.28); };
  document.getElementById('크게').onclick = function(){ 배율(1); };
  ['주소','말','bg','fg'].forEach(function(id){ document.getElementById(id).oninput = 그리기; });
  그리기();
  배율(0.28);
</script></body></html>`;
}

for (const 팩 of 대상) {
  const 완성화면 = join(팩방, 팩, "완성화면");
  const index = readFileSync(join(완성화면, "index.html"), "utf8");
  const 색 = 색읽기(팩, index);
  const [업종, 등급] = [팩.split("_")[0], 팩.split("_").slice(1).join("_")];

  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(WORK, { recursive: true });
  const 찍을곳 = `${WORK}/site`;
  cpSync(완성화면, 찍을곳, { recursive: true });
  /* 「화면 정보」 패널은 우리 확인용이다. 스토어에 올릴 그림에 들어가면 안 된다. */
  const css = `${찍을곳}/assets/css/base.css`;
  writeFileSync(css, `${readFileSync(css, "utf8")}\n.dev{display:none!important}\n`, "utf8");

  const 낼방 = join(팩방, 팩, "앱스토어재료");
  mkdirSync(낼방, { recursive: true });

  /* ── 아이콘 ─────────────────────────────────────────────
     글자는 사이트 이름의 «첫 글자» 하나. 완성화면이 쓰는 로고 마크를 그대로 가져온다. */
  const 마크 = /<span class="mark">([^<]{1,2})<\/span>/.exec(index)?.[1] ?? 업종.slice(0, 1);
  for (const 크기 of [1024, 512]) {
    writeFileSync(`${WORK}/icon.html`, 아이콘판(색, 마크, 크기), "utf8");
    const 큰것 = `${WORK}/icon_raw_${크기}.png`;
    /* ⚠ 창 크기를 그대로 믿지 않는다. 처음에 `--window-size=1024,1024` 로 찍었더니
       오른쪽 16px·아래 90px 에 «흰 띠»가 남고 글자가 치우쳤다(2026-08-10).
       헤드리스가 창 크기와 «그리는 자리»를 꼭 같게 잡아 주지는 않는다.
       크게 찍어서 왼쪽 위 모서리부터 정확히 잘라 내면 이 어긋남이 사라진다. */
    execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars",
      "--force-device-scale-factor=1", `--window-size=${크기 + 240},${크기 + 240}`,
      `--screenshot=${큰것}`, "--virtual-time-budget=2500", `file:///${WORK}/icon.html`], { stdio: "pipe" });
    if (!existsSync(큰것)) throw new Error(`아이콘 ${크기} 를 못 찍었습니다`);
    execFileSync("ffmpeg", ["-y", "-v", "error", "-i", 큰것,
      "-vf", `crop=${크기}:${크기}:0:0`, join(낼방, `아이콘_${크기}.png`)]);
  }

  /* ── 스크린샷 ───────────────────────────────────────────
     메뉴마다 첫 화면을 쓰되 «다섯 장»만. 스토어 목록에서는 앞의 서너 장만 보인다. */
  const spec = JSON.parse(readFileSync(join(팩방, 팩, "07_AI빌드_스펙팩.json"), "utf8")) as {
    menus: { nameKo: string; screens: { pageId: string; pageName: string }[] }[];
  };
  const 있는것 = new Set(readdirSync(join(완성화면, "pages")));
  const 고른것 = spec.menus
    .map((m) => ({ 메뉴: m.nameKo, ...(m.screens.find((s) => 있는것.has(`${s.pageId}.html`)) ?? {}) }))
    .filter((x) => x.pageId)
    .slice(0, 5) as { 메뉴: string; pageId: string; pageName: string }[];

  고른것.forEach((장, i) => {
    /* 스토어에서 손님이 읽는 «유일한 글»이다.
       화면 이름을 그대로 쓰면 「홈」·「목록」이 되어 아무 말도 안 한다(2026-08-10 에 그랬다).
       그래서 화면 안의 큰 제목(h1)을 먼저 쓴다 — 그건 이미 손님 말로 쓰여 있다. */
    const html = readFileSync(join(완성화면, "pages", `${장.pageId}.html`), "utf8");
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1]
      ?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    const 말 = h1 && h1.length >= 장.pageName.length ? h1 : 장.pageName;

    /* 견본은 «첫 장 하나»만 찍는다. 다섯 장을 다 넣어도 손님 스토어에는 못 쓴다 —
       우리 견본 사이트 화면이기 때문이다. 「이렇게 생깁니다」를 보여 주는 것이 전부다. */
    if (i > 0) return;
    writeFileSync(`${WORK}/shot.html`, 샷판(색, 말, `site/pages/${장.pageId}.html`), "utf8");
    const 큰것 = `${WORK}/shot_raw.png`;
    /* 아이콘과 같은 까닭으로 크게 찍어 잘라 낸다. */
    execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars",
      "--force-device-scale-factor=1", `--window-size=${샷.w + 240},${샷.h + 240}`,
      `--screenshot=${큰것}`, "--virtual-time-budget=3500", `file:///${WORK}/shot.html`], { stdio: "pipe" });
    if (!existsSync(큰것)) throw new Error(`스크린샷 ${장.pageId} 를 못 찍었습니다`);
    /* 견본이라 절반 크기로 줄여 넣는다 — 팩이 무거워질 이유가 없다. */
    execFileSync("ffmpeg", ["-y", "-v", "error", "-i", 큰것,
      "-vf", `crop=${샷.w}:${샷.h}:0:0,scale=${Math.round(샷.w / 2)}:-1`,
      join(낼방, "견본_스크린샷.png")]);
  });

  /* 아이콘도 견본은 한 장(512)만 남기고, 1024 는 지운다. */
  rmSync(join(낼방, "아이콘_1024.png"), { force: true });
  const 아이콘512 = join(낼방, "아이콘_512.png");
  if (existsSync(아이콘512)) {
    copyFileSync(아이콘512, join(낼방, "견본_아이콘.png"));
    rmSync(아이콘512);
  }

  /* ── 손님이 «자기 화면»으로 뽑는 틀 ─────────────────────── */
  writeFileSync(join(낼방, "아이콘_만들기.html"), 아이콘틀(색), "utf8");
  writeFileSync(join(낼방, "스크린샷_만들기.html"), 샷틀(색), "utf8");

  writeFileSync(join(낼방, "읽어보세요.txt"),
`스토어에 올릴 아이콘·스크린샷 만들기 — ${업종} ${등급}

■ 먼저 알아 두실 것
  여기 있는 「견본_」 그림은 «저희 견본 사이트» 화면입니다.
  스토어에는 못 올리십니다 — 사장님 이름·사장님 화면으로 다시 만드셔야 합니다.
  그래서 «만드는 틀»을 함께 넣었습니다.

■ 아이콘 만들기
  1. 아이콘_만들기.html 을 브라우저로 엽니다
  2. 글자와 색을 사장님 것으로 고칩니다 (화면 안에서 바로 고칠 수 있습니다)
  3. [1024 로 보기] 를 누르고 그 네모만 화면 캡처합니다 → 애플용
  4. [512 로 보기] 로 한 번 더 → 구글용
  · 모서리는 «깎지 마세요». 애플·구글이 알아서 둥글게 깎습니다.
  · 투명한 곳이 있으면 애플에서 반려됩니다. 배경을 꽉 채우세요.
  · 글자를 여러 자 넣지 마세요. 폰 홈 화면에서는 아주 작게 보입니다.
  · 기본 색은 이 팩의 디자인프리셋 주색(${색.primary})입니다.

■ 스크린샷 만들기
  1. 스크린샷_만들기.html 을 브라우저로 엽니다
  2. 위 칸에 «사장님 화면 주소»를 넣습니다 (예: http://localhost:3000)
  3. 아래 칸에 한 줄 설명을 씁니다
  4. 그 네모만 화면 캡처합니다 → ${샷.w}×${샷.h} (아이폰 6.9형 세로)
  · 3~5장이면 충분합니다. 작은 기기용은 스토어가 알아서 줄여 줍니다.
  · **첫 장이 거의 전부입니다.** 목록에서 첫 장만 보입니다.
  · 한 줄 설명은 «무엇이 되는지»로 쓰세요. 화면 이름을 그대로 쓰면 아무 말도 안 됩니다.
    (예: 「예약 목록」 ✗ → 「날짜만 고르면 남은 것이 보여요」 ○)
  · 진짜 앱 화면이라야 합니다. 예쁜 그림만 넣으면 반려됩니다.

■ 그 밖에 있어야 하는 것
  · 개인정보처리방침 «주소» — 없으면 등록 자체가 막힙니다
  · 심사용 계정(아이디·비밀번호) — 로그인이 필요한 앱이면
  자세한 것은 팩의 10_앱으로_내놓는_법.html 을 보세요.
`, "utf8");

  console.log(`  ${팩.padEnd(20)} 아이콘 2장 · 스크린샷 ${고른것.length}장  (${색.색이름} ${색.primary})`);
}

console.log(`\n끝났습니다 — 각 팩의 «앱스토어재료/» 를 보세요.`);
