/* 썸네일 굽기 — 2주차.
 *
 * 큰 글자는 후킹(4어절 이하), 부제(.sub)가 «무엇에 대한 것인지» 를 맡는다.
 * 고양이는 «영상 첫 장면과 다른 포즈» 를 쓴다 — 같으면 안 누른다(틀 주석 ④).
 * 자리(?pos=)는 다섯 장이 다 다르게. 오른쪽 아래로 통일하면 피드에서 같은 카드로 보인다.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { readdirSync as 훑기, rmSync as 지우기 } from "node:fs";

/* ⛔ 헤드리스 크롬은 부를 때마다 %TEMP% 아래 HeadlessChrome<난수> 를 만들고 «끝나도 안 지운다».
   한 쪽에 한 번씩 부르는 도구는 그것이 그대로 쌓인다 —
   2026-08-20 에 23,299개 · 12.6GB 가 쌓여 C 드라이브를 먹고 있었다.
   프로필 자리를 우리가 정해 주고, 시작할 때와 끝날 때 치운다.
   ⚠ .mjs 는 ES 모듈이라 require 가 없다. 처음에 require 로 썼다가 15개를 다 깨뜨렸다. */
const 크롬찌꺼기 = `${(process.env.TEMP || "/tmp").split(String.fromCharCode(92)).join("/")}/cc-chrome-${process.pid}`;
(() => {                       /* 시작할 때 «묵은 것»부터 — 크롬이 물고 있어 못 지운 자리들 */
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
const 마케팅 = "C:/Users/glim0/OneDrive/문서/Claude/Projects/02. 웹기획자/판매용_템플릿/_마케팅";
/* ⚠ 2026-08-13 에 그림을 «_이미지» 한 곳으로 모았다.
   전: _마케팅/릴스영상/_모델/고양이   후: _이미지/마스코트/낱장
   영상에 겹치는 것은 «배경이 뚫린» 낱장이라야 한다. 배경 있는 것은 마스코트/배경 에 있다. */
const 고양이방 = `${마케팅}/../_이미지/마스코트/낱장`;

/* ⭐ 대표 마스코트 갈아타기 (2026-08-14 사장님 지시)
   긴머리 마스코트를 SNS 얼굴로 쓰신다(등장인물.md). 대본은 옛 포즈 이름(집중·똘망 …)을 부르므로
   `_별명.csv` 로 이어 준다 — 대본을 한 줄도 안 고치고 얼굴만 바뀐다.
   ⚠ 옛 고양이로 되돌리려면 _별명.csv 를 지우거나 이름을 바꾸면 된다. 그러면 원래 파일을 쓴다. */
const 별명 = (() => {
  const 길 = `${고양이방}/_별명.csv`;
  const 표 = new Map();
  if (!existsSync(길)) return 표;
  for (const 줄 of readFileSync(길, "utf8").replace(/^﻿/, "").split(/\r?\n/).slice(1)) {
    const [부르는, 실제] = 줄.split(",").map((s) => s?.trim());
    if (부르는 && 실제) 표.set(부르는, 실제);
  }
  return 표;
})();
const 포즈파일 = (포즈) => {
  const 실제 = 별명.get(포즈) ?? 포즈;
  if (existsSync(`${고양이방}/${실제}.png`)) return `${고양이방}/${실제}.png`;
  return `${고양이방}/${포즈}.png`;   // 별명이 가리키는 파일이 없으면 원래 것을 쓴다
};
const W = process.env.TEMP.replace(/\\/g, "/") + "/cc-thumb-w2";

rmSync(W, { recursive: true, force: true });
mkdirSync(`${W}/fonts`, { recursive: true });
writeFileSync(`${W}/style.css`,
  readFileSync(`${마케팅}/카드뉴스2.css`, "utf8").replaceAll("릴스영상/_폰트/MaruBuriTTF/", "fonts/"), "utf8");
for (const f of ["Regular", "SemiBold", "Bold"])
  copyFileSync(`${마케팅}/릴스영상/_폰트/MaruBuriTTF/MaruBuri-${f}.ttf`, `${W}/fonts/MaruBuri-${f}.ttf`);
writeFileSync(`${W}/thumb.html`,
  readFileSync(`${마케팅}/썸네일틀.html`, "utf8").replace('href="카드뉴스2.css"', 'href="style.css"'), "utf8");

const 목록 = [



  /* ⚠ 2026-08-12 에 셋 다 고쳐 썼다. 앞뒤가 「내가 안 적어서 → 내가 적어서」로 되어 있어
     우리 팩이 글에서 사라졌었다. 목록 칸도 「?」를 걷어내고 **우리가 만들어 주는 것**으로 바꿨다.
     → SKILL.md 「⑦ 홍보를 한다」·「⑦-2 앞뒤를 바이브코딩만으로 → AI팩 넣고」 */
  { 파일: "썸네일_영상1_결제실패_16_9", sheet: "카페인컬러 AI팩 · 장비 렌탈", rows: "화면목록,161개,ok|검수 시나리오,944개,ok|결제 실패,BK0401,ok", v: 16, pose: "커피_마셔야겠다", pos: "big",
    big: "결제 실패 화면|놓치더니|화면 만들기도|<span class='o'>실패한 바이브코딩</span>", sub: "", ep: "장비 렌탈 사이트 편" },

  { 파일: "썸네일_영상2_검색결과없음_16_9", sheet: "카페인컬러 AI팩 · 장비 렌탈", rows: "화면목록,161개,ok|검수 시나리오,944개,ok|결과 없음,HO0401,ok", v: 16, pose: "애교", pos: "br",
    big: "8월 15일 예약|실패했더니|화면도 하얘지고|<span class='o'>내 머리도 하얘져</span>", sub: "", ep: "장비 렌탈 사이트 편" },

  /* 2026-08-11 추가 — 카드뉴스를 접으면서 비게 된 목 09:00 자리를 채운다.
     카드3(어디까지 만들었나)으로 만들려던 주제를 영상으로 옮겼다. */
  { 파일: "썸네일_영상3_어디까지만들었나_16_9", sheet: "카페인컬러 AI팩 · 장비 렌탈", rows: "화면목록,161개,ok|뼈대 화면,37개,ok|상태 화면,124개,ok", v: 16, pose: "똘망", pos: "br",
    big: "161개 중 37개|완성해 놓고|사이트 완료 했다는|<span class='o'>바이브코딩</span>", sub: "", ep: "장비 렌탈 사이트 편" },
  /* 3주차 — 8/24 화 21:00
     ⚠ 2026-08-12 에 통째로 고쳐 썼다. 전에는 「지시문이 4,365줄이었어요 / AI가 놓치는 진짜 까닭」이었는데,
     그건 **우리 물건의 유의사항**처럼 읽혔다. 4,365줄은 결함이 아니라 원래 그만큼 크다는 사실이고,
     요지는 그래서 «화면목록과 검수 시나리오»가 있어야 한다는 것이다. → SKILL.md 「홍보를 한다」 참고. */
  { 파일: "썸네일_영상4_건너뛴두가지_16_9", sheet: "카페인컬러 AI팩 · 여행", rows: "화면목록,144개,ok|검수 시나리오,810개,ok|스펙 지시문,4365줄,ok", v: 16, pose: "커피_음미", pos: "bl",
    big: "바이브코딩이|놓치는 시작과 끝|<span class='o'>화면목록과</span>|<span class='o'>검수 시나리오</span>", sub: "", ep: "해외 투어·티켓 예약 편" },

  /* 4주 화 8/31 — ㉑ 반려동물 유치원 만드는 과정. 이 편은 결이 다르다 —
     지금까지가 「바이브코딩이 놓친다」였다면 이건 「우리가 어떻게 만들어 주는지」다. */
  { 파일: "썸네일_영상5_펫유치원_16_9", sheet: "카페인컬러 AI팩", rows: "화면목록,146개,ok|디자인 프리셋,3벌,ok|검수 시나리오,만들어짐,ok", v: 16, pose: "집중", pos: "br",
    big: "AI팩으로 만드니|<span class='o'>146개 화면</span>이|만들어 졌어요.", sub: "- 펫 유치원 편 -", ep: "반려동물 유치원 편" },

  /* 3주 목 8/24 — ⑳ 내 컴퓨터에서만 보임(사이트 내놓는 법) */
  { 파일: "썸네일_영상6_내컴퓨터에서만_16_9", sheet: "사이트 내놓는 법 안내서", rows: "도메인·자물쇠,들어있음,ok|결제 심사,두 달,ok|오픈 전 점검표,들어있음,ok", v: 16, pose: "굳이_", pos: "tr",
    big: "다 만들었는데|<span class='o'>내 컴퓨터에서만</span>|보입니다", sub: "", ep: "사이트 내놓는 법" },

  /* 3주 금 8/24 — 6-9 돈이 얼마나 나가나 */
  { 파일: "썸네일_영상7_돈이얼마나_16_9", sheet: "클로드 코드 사용법", rows: "명령어,/usage,ok|한도 설정,가능,ok|모델 전환,/model,ok", v: 16, pose: "커피_없어", pos: "peek",
    big: "돈이 얼마나|나가는지|<span class='o'>모르고 쓰셨나요</span>", sub: "", ep: "클로드 코드 편" },
  { 파일: "썸네일_영상14_기획서시간_16_9", sheet: "온라인 강의 팩", rows: "화면 목록,132줄,ok|기능정의서,721줄,ok|WBS 일정,132줄,ok", v: 16, pose: "집중", pos: "tr",
    big: "기획서 <span class='o'>132줄</span>이|한 번에 나왔어요", sub: "", ep: "기획서 편" },
  { 파일: "썸네일_영상13_알아서해줘_16_9", sheet: "한 줄로 시켰을 때", rows: "요청하는 쪽,나옴,ok|고수 쪽,없음,no|후기,나중에 물어봄,no", v: 16, pose: "똘망", pos: "tr",
    big: "한 줄만 적었더니|<span class=o>절반</span>만 나왔어요", sub: "", ep: "한 줄 프롬프트 편" },
  { 파일: "썸네일_영상8_안되는경우까지_16_9", sheet: "안 되는 길 화면", rows: "여행 팩,144개,ok|매칭 팩,159개,ok|장비렌탈 팩,161개,ok", v: 16, pose: "아이디어", pos: "tr",
    big: "<span class='o'>안 되는 경우</span>까지|화면이|나옵니다", sub: "", ep: "안 되는 길 편" },
  { 파일: "썸네일_영상9_업종마다몇개_16_9", sheet: "일곱 팩을 세어 봤다", rows: "제일 많은 팩,207개,ok|제일 적은 팩,125개,ok|업종,7가지,ok", v: 16, pose: "똘망", pos: "tr",
    big: "내 사업엔 화면이|<span class='o'>몇 개</span>|필요할까요", sub: "", ep: "화면 수 편" },
  { 파일: "썸네일_영상10_같은지시서다른톤_16_9", sheet: "팩 넷을 나란히", rows: "디자인 프리셋,4가지,ok|레이아웃,9가지,ok|고르는 데,몇 분,ok", v: 16, pose: "커피_음미", pos: "tr",
    big: "같은 지시서인데|<span class='o'>이렇게</span>|달라져요", sub: "", ep: "디자인 프리셋 편" },
  { 파일: "썸네일_영상11_운영자화면_16_9", sheet: "운영자 화면", rows: "운영 메뉴,6개,ok|오늘 예약,4건,ok|등록된 휴무일,7일,ok", v: 16, pose: "커피_마셔야겠다", pos: "tr",
    big: "예약은 받는데|<span class='o'>확인할 화면</span>이|없었습니다", sub: "", ep: "운영자 화면 편" },

  /* 3주 «일» 11:00 — 새로 연 자리(2026-08-18 사장님 지시로 주 4건). 예약 흐름 편 */
  { 파일: "썸네일_영상10_예약다섯단계_16_9", sheet: "예약 흐름 화면", rows: "예약 단계,5단계,ok|시간마다,남은 자리,ok|마감된 시간,못 고름,ok", v: 16, pose: "애교", pos: "bl",
    big: "예약 하나가|<span class='o'>다섯 단계</span>로 나옵니다", sub: "", ep: "예약 흐름 편" },

  /* ── 2026-08-31 회차 ─────────────────────────────────────────────
     ⚠ 큰 글자를 세 줄로 쓸 때는 마스코트 자리(pos)를 겹치지 않는 쪽으로 고른다.
        긴 머리 마스코트는 옛 고양이보다 자리를 많이 먹어 아래 두 줄을 가린다 (2026-08-24). */

  /* 4주 목 9/3 — 뷰티샵 편. 예약을 받는 화면 «다음»에 오는 것들 */
  { 파일: "썸네일_영상15_노쇼_16_9", sheet: "뷰티샵 프리미엄 팩", rows: "화면,136개,ok|기본 화면,49개,ok|상태·세부,87개,ok", v: 16, pose: "아이디어", pos: "br",
    big: "예약은 받았는데|<span class='o'>손님이 안 왔어요</span>|그다음 화면은?", sub: "", ep: "뷰티샵 예약 사이트 편" },

  /* 4주 일 9/6 — 무료 샘플 편 */
  { 파일: "썸네일_영상16_무료샘플로만들기_16_9", sheet: "무료 샘플 스펙팩", rows: "화면,16개,ok|공통 레이아웃,3종,ok|안 되는 화면,4개,ok", v: 16, pose: "똘망", pos: "tr",
    big: "<span class='o'>무료 샘플</span> 하나로|어디까지|만들어질까요", sub: "", ep: "콘텐츠 판매 사이트 편" },

  /* 5주 화 9/8 — 온라인 강의 편. 안 되는 순간의 화면 */
  { 파일: "썸네일_영상17_안되는날_16_9", sheet: "온라인 강의 디럭스 팩", rows: "화면,41개,ok|결제 실패,있음,ok|결과 없음 화면,있음,ok", v: 16, pose: "커피_없어", pos: "peek",
    big: "결제가 막힌 날|<span class='o'>손님은 뭘 보게</span>|될까요", sub: "", ep: "온라인 강의 사이트 편" },

  /* 5주 금 9/11 — 인테리어 편. 기준 화면 40개 + 세부 상태 167개 = 207 */
  { 파일: "썸네일_영상18_207개_16_9", sheet: "인테리어 프리미엄 팩", rows: "화면,207개,ok|기준 화면,40개,ok|세부 상태,167개,ok", v: 16, pose: "집중", pos: "big",
    big: "화면 <span class='o'>207개</span>인데|기본 화면은|40개뿐이었어요", sub: "", ep: "인테리어 시공 사이트 편" },

  /* 5주 화 9/8 — 갈래 ⑦ 「지시문을 드립니다」. 「예약 기능도」 한 마디가 화면 몇 장이 되나 */
  { 파일: "썸네일_영상19_예약기능인테리어_16_9", sheet: "인테리어 프리미엄 팩", rows: "화면,207개,ok|기준 화면,40개,ok|세부 상태,167개,ok", v: 16, pose: "똘망", pos: "bl",
    big: "지시문 하나로|<span class='o'>손님과 사장님</span>|화면 모두|만드는 방법", sub: "", ep: "인테리어 시공 사이트 편" },

  /* 5주 금 9/11 — 갈래 ⑦. 스펙팩 4장(화면마다 생성 프롬프트)을 처음으로 펼쳐 보인다 */
  { 파일: "썸네일_영상20_결제까지온라인강의_16_9", sheet: "온라인 강의 디럭스 팩", rows: "화면,41개,ok|결제 실패,있음,ok|결과 없음 화면,있음,ok", v: 16, pose: "커피_음미", pos: "br",
    big: "지시문 하나로|<span class='o'>학생과 강사</span>|화면 모두|만드는 방법", sub: "", ep: "온라인 강의 사이트 편" },

  /* 6주 화 9/15 — 갈래 ⑦. 공동구매는 «안 모이면»이 제일 큰 걱정이다 */
  { 파일: "썸네일_영상21_안모이면공동구매_16_9", sheet: "공동구매 디럭스 팩", rows: "목표 인원,정함,ok|미달 시,전액 환불,ok|진행자 화면,있음,ok", v: 16, pose: "어찌되나 어디한번 기다리기", pos: "tr",
    big: "공동구매 사이트,|<span class='o'>인원이 안 모이면</span>|어떻게 되나요?", sub: "", ep: "공동구매 사이트 편" },

  /* 6주 목 9/17 — 갈래 ② ⑨. 업종 소개가 아니라 «문제와 해법» 편이다 */
  { 파일: "썸네일_영상22_색이달라지는거_16_9", sheet: "AI팩 디자인 프리셋", rows: "색,값으로 정함,ok|레이아웃,9가지,ok|모서리·여백,정함,ok", v: 16, pose: "똘망", pos: "bl",
    big: "화면마다|<span class='o'>색이 다른 거</span>,|저만|그랬나요?", sub: "", ep: "디자인 프리셋 편" },
];

for (const t of 목록) {
  copyFileSync(포즈파일(t.pose), `${W}/cat.png`);
  const q = Object.entries({ v: t.v, big: t.big, sub: t.sub, ep: t.ep, face: "cat", pos: t.pos, sheet: t.sheet, rows: t.rows,
    facey: t.facey, facezoom: t.facezoom })
    .filter(([, v]) => v != null).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
  /* ⚠ 창 크기로 준 만큼이 «보이는 자리»가 아니다. 1080 을 달라고 해도 크롬이 창틀로
   *   96px 을 먹어 실제로는 984px 만 그려진다. 그 아래는 종이 대신 바탕색으로 채워지고,
   *   **맨 아래 서명줄(카페인컬러 · OO 편)이 통째로 잘려 나간다.**
   *   2026-08-12 에 재서 알았다 — 눈으로는 「아래에 띠가 있네」 정도로만 보였다.
   *   그래서 넉넉히 찍고 정확한 크기로 «잘라낸다». */
  const [폭, 높이] = t.v === 9 ? [1080, 1920] : [1920, 1080];
  const 넉넉 = `${W}/_raw_${t.파일}.png`;
  const 낼길 = `${W}/${t.파일}.png`;
  for (const f of [넉넉, 낼길]) if (existsSync(f)) rmSync(f);
  execFileSync(CHROME, ["--headless=new", "--user-data-dir=" + 크롬찌꺼기,  "--disable-gpu", "--hide-scrollbars",
    "--force-device-scale-factor=1", `--window-size=${폭},${높이 + 140}`,
    `--screenshot=${넉넉}`, "--virtual-time-budget=4000", `file:///${W}/thumb.html?${q}`],
    { stdio: "pipe" });
  if (!existsSync(넉넉)) throw new Error(`못 구웠습니다: ${t.파일}`);
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", 넉넉,
    "-vf", `crop=${폭}:${높이}:0:0`, 낼길], { stdio: "pipe" });
  rmSync(넉넉);
  if (!existsSync(낼길)) throw new Error(`못 잘랐습니다: ${t.파일}`);
  console.log(`  ${t.파일}  (${t.pose} · ${t.pos})`);
}
console.log(`\n${목록.length}장 → ${W}`);
