// 판매용 디자인 프리셋 생성기.
// 스펙팩과 함께 AI에 넣으면 해당 스타일로 화면이 만들어지도록 하는 디자인 스펙 문서 3종 + 비교 미리보기.
// 다른 템플릿(예약 서비스 등)에도 그대로 재사용한다.
import { mkdirSync, writeFileSync } from "node:fs";

// 어떤 템플릿용으로 만들지 인자로 받는다: npx tsx build-design-presets.mts lms | beauty
// 디자인 규칙(색·타이포·컴포넌트)은 업종 무관하게 같고, "어울리는 서비스" 문구만 갈라진다.
const TARGETS = {
  lms: {
    dir: "판매용_템플릿/LMS_온라인강의플랫폼/디자인프리셋",
    fits: [
      "B2B 교육, 사내 LMS, 기업 대상 강의 플랫폼",
      "전문가용 도구, 관리자 콘솔, 정보 밀도가 높은 화면",
      "B2C 강의 서비스, 취미·키즈 교육, 일반 사용자 대상",
    ],
  },
  beauty: {
    dir: "판매용_템플릿/뷰티샵_예약플랫폼/디자인프리셋",
    fits: [
      "신뢰감이 중요한 피부관리·클리닉, 프랜차이즈 살롱",
      "감각적인 편집숍형 살롱, 남성 전용 바버샵",
      "네일·속눈썹 등 캐주얼 뷰티, 20~30대 타깃 매장",
    ],
  },
  travel: {
    dir: "판매용_템플릿/여행_투어티켓예약플랫폼/디자인프리셋",
    fits: [
      "신뢰가 중요한 해외 투어·티켓 예약, 대형 여행 플랫폼",
      "사진이 주인공인 감성 여행 브랜드, 소규모 프라이빗 투어",
      "액티비티·레저 예약, 20~30대 자유여행객 타깃",
    ],
  },
  admin: {
    dir: "판매용_템플릿/비즈니스관리_관리자시스템/디자인프리셋",
    fits: [
      "정보 밀도가 높은 백오피스·ERP형 관리 시스템, 데이터 중심 화면",
      "병의원·클리닉·전문 서비스업의 신뢰감 있는 관리자 콘솔",
      "미용실·공방·소규모 매장 사장님이 매일 쓰는 가벼운 관리 도구",
    ],
  },
  groupbuy: {
    dir: "판매용_템플릿/공동구매_공구플랫폼/디자인프리셋",
    fits: [
      "신뢰가 중요한 대형 공동구매·소셜커머스, 안정감 있는 브랜드",
      "감각적인 셀렉트 공구·인플루언서 공구, 편집숍형 큐레이션",
      "생활밀착 저가 공구·맘카페형, 20~30대 모바일 타깃",
    ],
  },
  "groupbuy-deep": {
    dir: "판매용_템플릿/공동구매_공구플랫폼_상세IA/디자인프리셋",
    fits: [
      "신뢰가 중요한 대형 공동구매·소셜커머스, 안정감 있는 브랜드",
      "감각적인 셀렉트 공구·인플루언서 공구, 편집숍형 큐레이션",
      "생활밀착 저가 공구·맘카페형, 20~30대 모바일 타깃",
    ],
  },
  "admin-deep": {
    dir: "판매용_템플릿/비즈니스관리_관리자시스템_상세IA/디자인프리셋",
    fits: [
      "정보 밀도가 높은 백오피스·ERP형 관리 시스템, 데이터 중심 화면",
      "병의원·클리닉·전문 서비스업의 신뢰감 있는 관리자 콘솔",
      "미용실·공방·소규모 매장 사장님이 매일 쓰는 가벼운 관리 도구",
    ],
  },
};
const targetKey = (process.argv[2] ?? "lms") as keyof typeof TARGETS;
const target = TARGETS[targetKey];
if (!target) {
  throw new Error(`알 수 없는 대상: ${targetKey} (가능: ${Object.keys(TARGETS).join(", ")})`);
}
const OUT = target.dir;
mkdirSync(OUT, { recursive: true });

interface Preset {
  no: string;
  name: string;
  tagline: string;
  fits: string;
  font: { family: string; alt: string; note: string };
  c: Record<string, string>;
  scale: [string, string, string][]; // 용도, 크기, 굵기
  radius: { card: string; button: string; input: string; badge: string };
  space: string;
  shadow: string;
  comp: [string, string][]; // 컴포넌트, 규칙
  screens: [string, string][]; // 화면 유형, 적용 지침
}

const PRESETS: Preset[] = [
  {
    no: "01",
    name: "모던 네이비",
    tagline: "신뢰감과 밀도. 실무형 서비스의 기본값.",
    fits: "B2B 교육, 사내 LMS, 기업 대상 강의 플랫폼",
    font: { family: "Pretendard", alt: "Noto Sans KR", note: "숫자는 tabular-nums로 표 정렬을 맞춘다" },
    c: {
      "primary (주요 액션)": "#2B4A8B",
      "primary-hover": "#1F3A73",
      "accent (강조·배지)": "#FF7A30",
      "background (페이지)": "#F5F7FA",
      "surface (카드)": "#FFFFFF",
      "text (본문)": "#16233F",
      "text-muted (보조)": "#5A6B8C",
      "border (구분선)": "#DFE4EC",
      "success": "#0F7A52",
      "warning": "#B4761A",
      "danger": "#C0392B",
    },
    scale: [
      ["페이지 제목", "32px", "700"],
      ["섹션 제목", "22px", "700"],
      ["카드 제목", "18px", "600"],
      ["본문", "15px", "400"],
      ["보조 설명", "13px", "400"],
      ["표 헤더", "13px", "600"],
    ],
    radius: { card: "12px", button: "8px", input: "8px", badge: "6px" },
    space: "4px 배수 (4·8·12·16·24·32·48). 카드 내부 여백 20px, 섹션 간격 32px",
    shadow: "0 1px 3px rgba(22,35,63,.08) — 카드에만. 버튼·입력에는 쓰지 않는다",
    comp: [
      ["버튼(주요)", "primary 배경, 흰 글자, 높이 40px, radius 8px, 굵기 600"],
      ["버튼(보조)", "흰 배경, border 1px, text 색 글자. 같은 높이"],
      ["카드", "surface 배경, border 1px, radius 12px, 그림자 1단계. 헤더에 구분선"],
      ["입력", "높이 40px, border 1px, focus 시 primary 테두리 2px"],
      ["배지", "상태별 배경 10% 농도 + 같은 색 진한 글자. radius 6px, 12px 글자"],
      ["표", "헤더는 background 색 채움, 행 구분은 border 1px, 행 높이 44px"],
      ["사이드바", "surface 배경, 활성 항목만 primary 10% 배경 + primary 글자"],
    ],
    screens: [
      ["대시보드", "지표 카드 4개를 한 줄에. 숫자 32px/700, 라벨 13px muted"],
      ["목록", "표 형태 우선. 필터는 상단 가로 배치, 행 hover 시 background 색"],
      ["폼", "라벨 위·입력 아래. 1열 배치, 최대 폭 560px"],
      ["빈 화면", "아이콘 48px muted + 안내 문구 15px + 주요 버튼 하나"],
      ["오류", "danger 색 아이콘과 문구. 재시도 버튼은 보조 스타일"],
    ],
  },
  {
    no: "02",
    name: "미니멀 모노",
    tagline: "여백과 활자. 색을 빼면 내용이 남는다.",
    fits: "전문가용 도구, 관리자 콘솔, 정보 밀도가 높은 화면",
    font: { family: "Pretendard", alt: "Inter + Noto Sans KR", note: "글자 크기 차이보다 굵기와 여백으로 위계를 만든다" },
    c: {
      "primary (주요 액션)": "#111111",
      "primary-hover": "#000000",
      "accent (강조·배지)": "#111111",
      "background (페이지)": "#FFFFFF",
      "surface (카드)": "#FFFFFF",
      "text (본문)": "#111111",
      "text-muted (보조)": "#767676",
      "border (구분선)": "#E5E5E5",
      "success": "#1A7F37",
      "warning": "#9A6700",
      "danger": "#CF222E",
    },
    scale: [
      ["페이지 제목", "28px", "600"],
      ["섹션 제목", "18px", "600"],
      ["카드 제목", "15px", "600"],
      ["본문", "14px", "400"],
      ["보조 설명", "13px", "400"],
      ["표 헤더", "12px", "500"],
    ],
    radius: { card: "6px", button: "6px", input: "6px", badge: "4px" },
    space: "8px 배수. 여백을 넉넉히 — 카드 내부 24px, 섹션 간격 48px",
    shadow: "사용하지 않는다. 깊이는 border와 배경 대비로만 표현",
    comp: [
      ["버튼(주요)", "검정 배경, 흰 글자, 높이 36px, radius 6px, 굵기 500"],
      ["버튼(보조)", "흰 배경 + border 1px. hover 시 background #F6F6F6"],
      ["카드", "border 1px만. 그림자·배경색 없음. 제목과 본문은 여백으로 구분"],
      ["입력", "높이 36px, border 1px, focus 시 검정 테두리 1px + 외곽선"],
      ["배지", "테두리만 있는 형태(outline). 배경 없음, 11px 글자"],
      ["표", "헤더에 배경 없이 하단 border 2px. 행 구분선은 1px, 행 높이 40px"],
      ["사이드바", "배경 없음. 활성 항목은 좌측 2px 검정 바 + 굵기 600"],
    ],
    screens: [
      ["대시보드", "지표는 카드 없이 나열. 숫자 36px/600, 구분은 세로 divider"],
      ["목록", "표 중심. 불필요한 테두리 제거, 여백으로 구획"],
      ["폼", "라벨과 입력을 좌우 2열로. 라벨 우측 정렬"],
      ["빈 화면", "아이콘 없이 문구만. 14px muted + 텍스트 링크"],
      ["오류", "danger 글자색만 사용. 아이콘 최소화"],
    ],
  },
  {
    no: "03",
    name: "소프트 파스텔",
    tagline: "부드럽고 친근하게. 처음 쓰는 사람도 겁먹지 않게.",
    fits: "B2C 강의 서비스, 취미·키즈 교육, 일반 사용자 대상",
    font: { family: "Pretendard", alt: "Paperlogy", note: "제목을 과감하게 키우고 자간을 좁혀 경쾌하게" },
    c: {
      "primary (주요 액션)": "#5B4FE5",
      "primary-hover": "#4A3DD1",
      "accent (강조·배지)": "#FFD54A",
      "background (페이지)": "#FAFAFA",
      "surface (카드)": "#FFFFFF",
      "text (본문)": "#1F2024",
      "text-muted (보조)": "#6B6F76",
      "border (구분선)": "#E7E7EA",
      "pastel-mint": "#DFF5EC",
      "pastel-lavender": "#EDE9FE",
      "pastel-yellow": "#FFF6D9",
    },
    scale: [
      ["페이지 제목", "36px", "800"],
      ["섹션 제목", "24px", "700"],
      ["카드 제목", "18px", "700"],
      ["본문", "15px", "500"],
      ["보조 설명", "14px", "500"],
      ["표 헤더", "13px", "700"],
    ],
    radius: { card: "16px", button: "12px", input: "12px", badge: "999px" },
    space: "4px 배수. 카드 내부 24px, 섹션 간격 40px. 요소 사이를 넉넉히",
    shadow: "0 2px 8px rgba(31,32,36,.06) — 카드와 떠 있는 요소에만",
    comp: [
      ["버튼(주요)", "primary 배경, 흰 글자, 높이 44px, radius 12px, 굵기 700"],
      ["버튼(보조)", "pastel-lavender 배경, primary 글자. 테두리 없음"],
      ["카드", "surface 배경, radius 16px, 부드러운 그림자. 테두리는 아주 연하게"],
      ["입력", "높이 44px, background #F7F7F9, 테두리 없음, focus 시 primary 2px"],
      ["배지", "파스텔 배경 + 같은 계열 진한 글자. 알약 형태(radius 999px)"],
      ["표", "헤더 배경 #F7F7F9, 행 구분선 아주 연하게, 행 높이 48px"],
      ["사이드바", "활성 항목은 pastel-lavender 배경 + radius 12px로 감싸기"],
      ["강조 문구", "노란 형광펜 효과: linear-gradient(transparent 54%, #FFE9A8 54%)"],
    ],
    screens: [
      ["대시보드", "지표 카드를 파스텔 3색으로 번갈아. 숫자 40px/800 primary"],
      ["목록", "표보다 카드 그리드 우선. 카드마다 썸네일 영역 확보"],
      ["폼", "1열, 입력 높이 44px로 크게. 도움말은 입력 아래 14px muted"],
      ["빈 화면", "일러스트 또는 큰 이모지 + 친근한 문구 + 큰 primary 버튼"],
      ["오류", "danger를 강하게 쓰지 않는다. 부드러운 안내 + 다음 행동 제시"],
    ],
  },
];

function md(p: Preset): string {
  const L: string[] = [];
  L.push(`# 디자인 프리셋 ${p.no} — ${p.name}`);
  L.push("");
  L.push(`> ${p.tagline}`);
  L.push("");
  L.push(`**어울리는 서비스** — ${p.fits}`);
  L.push("");
  L.push("---");
  L.push("");
  L.push("## 사용 방법");
  L.push("");
  L.push("AI 코딩 도구(Claude Code, Cursor 등)에 **AI 빌드 스펙팩과 이 파일을 함께** 넣고 이렇게 주문하세요.");
  L.push("");
  L.push("```");
  L.push(`AI 빌드 스펙팩과 디자인 프리셋 ${p.no}(${p.name})을 확인해서`);
  L.push("이 디자인 규칙대로 화면을 만들어줘.");
  L.push("```");
  L.push("");
  L.push("스펙팩이 *무엇을 만들지*를, 이 문서가 *어떻게 보이게 할지*를 정합니다.");
  L.push("");
  L.push("---");
  L.push("");
  L.push("## 1. 색상");
  L.push("");
  L.push("| 용도 | 값 |");
  L.push("| --- | --- |");
  for (const [k, v] of Object.entries(p.c)) L.push(`| ${k} | \`${v}\` |`);
  L.push("");
  L.push("## 2. 타이포그래피");
  L.push("");
  L.push(`- 기본 폰트: **${p.font.family}** (대체: ${p.font.alt})`);
  L.push(`- ${p.font.note}`);
  L.push("");
  L.push("| 용도 | 크기 | 굵기 |");
  L.push("| --- | --- | --- |");
  for (const [a, b, c] of p.scale) L.push(`| ${a} | ${b} | ${c} |`);
  L.push("");
  L.push("## 3. 모서리 · 여백 · 그림자");
  L.push("");
  L.push(`- 카드 \`${p.radius.card}\` · 버튼 \`${p.radius.button}\` · 입력 \`${p.radius.input}\` · 배지 \`${p.radius.badge}\``);
  L.push(`- 여백: ${p.space}`);
  L.push(`- 그림자: ${p.shadow}`);
  L.push("");
  L.push("## 4. 컴포넌트 규칙");
  L.push("");
  L.push("| 컴포넌트 | 규칙 |");
  L.push("| --- | --- |");
  for (const [a, b] of p.comp) L.push(`| ${a} | ${b} |`);
  L.push("");
  L.push("## 5. 화면 유형별 적용");
  L.push("");
  L.push("| 화면 유형 | 적용 지침 |");
  L.push("| --- | --- |");
  for (const [a, b] of p.screens) L.push(`| ${a} | ${b} |`);
  L.push("");
  L.push("---");
  L.push("");
  L.push("## AI에게 그대로 넣는 지시문");
  L.push("");
  L.push("```");
  L.push(`아래 디자인 규칙을 모든 화면에 일관되게 적용해줘.`);
  L.push("");
  L.push(`- 주요 색: ${Object.values(p.c)[0]}, 강조: ${p.c["accent (강조·배지)"] ?? Object.values(p.c)[2]}`);
  L.push(`- 배경: ${p.c["background (페이지)"]}, 카드: ${p.c["surface (카드)"]}, 본문 글자: ${p.c["text (본문)"]}`);
  L.push(`- 폰트: ${p.font.family}. 페이지 제목 ${p.scale[0][1]}/${p.scale[0][2]}, 본문 ${p.scale[3][1]}/${p.scale[3][2]}`);
  L.push(`- 모서리: 카드 ${p.radius.card}, 버튼 ${p.radius.button}, 배지 ${p.radius.badge}`);
  L.push(`- 그림자: ${p.shadow}`);
  L.push(`- 버튼(주요): ${p.comp[0][1]}`);
  L.push(`- 카드: ${p.comp[2][1]}`);
  L.push(`- 빈 화면: ${p.screens[3][1]}`);
  L.push("");
  L.push("화면마다 다른 스타일을 쓰지 말고, 위 규칙을 끝까지 유지해줘.");
  L.push("```");
  L.push("");
  return L.join("\n");
}

const tokens = (p: Preset) => ({
  preset: { no: p.no, name: p.name, fits: p.fits },
  colors: p.c,
  typography: {
    fontFamily: p.font.family,
    fallback: p.font.alt,
    scale: Object.fromEntries(p.scale.map(([k, size, weight]) => [k, { size, weight }])),
  },
  radius: p.radius,
  spacing: p.space,
  shadow: p.shadow,
  components: Object.fromEntries(p.comp),
  screenGuides: Object.fromEntries(p.screens),
});

// 업종에 맞게 "어울리는 서비스" 문구를 바꾼다
PRESETS.forEach((p, i) => {
  p.fits = target.fits[i] ?? p.fits;
});

for (const p of PRESETS) {
  const base = `${OUT}/프리셋_${p.no}_${p.name.replace(/\s/g, "")}`;
  writeFileSync(`${base}.md`, md(p), "utf8");
  writeFileSync(`${base}.json`, JSON.stringify(tokens(p), null, 2), "utf8");
  console.log(`  ✔ 프리셋_${p.no}_${p.name} (.md / .json)`);
}

/* 비교 미리보기 HTML — 구매자가 세 가지를 눈으로 비교 */
const card = (p: Preset) => {
  const pri = Object.values(p.c)[0], acc = p.c["accent (강조·배지)"] ?? Object.values(p.c)[2];
  const bg = p.c["background (페이지)"], sf = p.c["surface (카드)"];
  const tx = p.c["text (본문)"], mu = p.c["text-muted (보조)"], bd = p.c["border (구분선)"];
  return `
  <div class="col">
    <div class="lab"><b>${p.no}. ${p.name}</b><span>${p.tagline}</span></div>
    <div class="demo" style="background:${bg};color:${tx}">
      <div class="dcard" style="background:${sf};border:1px solid ${bd};border-radius:${p.radius.card};
           box-shadow:${p.shadow.startsWith("0") ? p.shadow.split(" — ")[0] : "none"}">
        <p class="dt" style="font-size:${p.scale[2][1]};font-weight:${p.scale[2][2]}">내 강의실</p>
        <p class="dm" style="color:${mu};font-size:${p.scale[4][1]}">수강 중 3 · 완료 12</p>
        <div class="drow">
          <span class="dbadge" style="background:${acc}22;color:${acc};border-radius:${p.radius.badge};
                border:1px solid ${acc}55">진행 중</span>
          <span class="dbadge" style="background:transparent;color:${mu};border:1px solid ${bd};
                border-radius:${p.radius.badge}">완료</span>
        </div>
        <div class="dbtns">
          <span class="db" style="background:${pri};color:#fff;border-radius:${p.radius.button}">이어보기</span>
          <span class="db2" style="border:1px solid ${bd};color:${tx};border-radius:${p.radius.button}">목록</span>
        </div>
      </div>
      <div class="dnums">
        <div><b style="color:${pri};font-size:${p.scale[0][1]};font-weight:${p.scale[0][2]}">37</b><span style="color:${mu}">화면</span></div>
        <div><b style="color:${pri};font-size:${p.scale[0][1]};font-weight:${p.scale[0][2]}">241</b><span style="color:${mu}">요건</span></div>
      </div>
      <div class="dsw">${Object.values(p.c).slice(0, 7).map(v => `<i style="background:${v}"></i>`).join("")}</div>
    </div>
  </div>`;
};

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>디자인 프리셋 3종 비교</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Pretendard,"Malgun Gothic",sans-serif;background:#EFEFF2;padding:40px;color:#1F2024}
h1{font-size:26px;font-weight:800;margin-bottom:6px}
.sub{color:#6B6F76;font-size:15px;margin-bottom:26px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1240px}
.lab{margin-bottom:10px}.lab b{display:block;font-size:17px;font-weight:800}
.lab span{display:block;font-size:13px;color:#6B6F76;margin-top:3px;line-height:1.5}
.demo{border-radius:14px;padding:22px;min-height:330px;border:1px solid #E0E0E5}
.dcard{padding:18px}
.dt{margin-bottom:4px}.dm{margin-bottom:14px}
.drow{display:flex;gap:8px;margin-bottom:16px}
.dbadge{font-size:11px;font-weight:700;padding:4px 10px}
.dbtns{display:flex;gap:8px}
.db,.db2{font-size:13px;font-weight:700;padding:9px 16px}
.dnums{display:flex;gap:26px;margin-top:20px}
.dnums div{display:flex;flex-direction:column}
.dnums span{font-size:12px;font-weight:600;margin-top:2px}
.dsw{display:flex;gap:5px;margin-top:20px}
.dsw i{width:26px;height:26px;border-radius:6px;border:1px solid rgba(0,0,0,.08)}
</style></head><body>
<h1>디자인 프리셋 3종</h1>
<p class="sub">같은 화면을 세 가지 스타일로. 원하는 프리셋을 스펙팩과 함께 AI에 넣으면 그 스타일로 만들어집니다.</p>
<div class="grid">${PRESETS.map(card).join("")}</div>
</body></html>`;

writeFileSync(`${OUT}/프리셋_미리보기.html`, html, "utf8");
console.log("  ✔ 프리셋_미리보기.html");
console.log(`\n완료 → ${OUT}`);
