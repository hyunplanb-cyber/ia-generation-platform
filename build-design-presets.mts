// 판매용 디자인 프리셋 생성기.
// 스펙팩과 함께 AI에 넣으면 해당 스타일로 화면이 만들어지도록 하는 디자인 스펙 문서 3종 + 비교 미리보기.
// 다른 템플릿(예약 서비스 등)에도 그대로 재사용한다.
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { PACKAGES } from "./lib/packages";
// 레이아웃 골격과 이미지 자리 규칙은 플랫폼이 만드는 프리셋과 같은 값을 써야 한다.
// 두 곳에 따로 적으면 "산 프리셋과 만든 프리셋이 다르다"는 말이 나온다.
import {
  LAYOUTS, THUMBS, thumbByKey, DENSITIES, SPACING_SLOTS, LINE_SLOTS,
  DEFAULT_LAYOUT, IMAGE_PLACEHOLDER, CONTENT_WIDTH, READING_WIDTH, COMMON_RULES, ACCENT_RULE, type DesignKey,
  STRUCTURES, STRUCTURE_COLS, GRID_GAP, gridBaseCss, cardWidth, textOn,
} from "./lib/design-presets";

/** 마크다운 표 안에 코드로 감싸 넣는다 — 중첩 백틱을 피하려고 함수로 뺐다. */
const inCode = (s: string) => "`" + s + "`";

const layoutOf = (key: string) => {
  const k = DEFAULT_LAYOUT[key as DesignKey];
  return LAYOUTS.find((l) => l.key === k) ?? LAYOUTS[0];
};

// 어떤 템플릿용으로 만들지 인자로 받는다: npx tsx build-design-presets.mts lms | beauty
// 디자인 규칙(색·타이포·컴포넌트)은 업종 무관하게 같고, "어울리는 서비스" 문구만 갈라진다.
/* 콘텐츠 영역 배경은 클라우드 댄서(#F0EFEB)로 고정한다.
   전에는 테마마다 주색을 옅게 깐 배경을 썼는데(코럴 #FFF6F3, 네이비 #F5F7FA),
   테마를 바꿀 때마다 화면 전체 색조가 흔들리고 카드가 배경에서 안 떠 보였다.
   배경은 중립으로 두고 색은 주색·강조가 낸다(2026-08-05). */

const TARGETS = {
  lms: {
    styles: ["navy", "mono", "coral"] as const,
    layouts: ["console", "magazine"] as const,
    dir: "_작업/LMS_온라인강의플랫폼/디자인프리셋",
    fits: [
      "B2B 교육, 사내 LMS, 기업 대상 강의 플랫폼",
      "전문가용 도구, 관리자 콘솔, 정보 밀도가 높은 화면",
      "B2C 강의 서비스, 취미·키즈 교육, 일반 사용자 대상",
    ],
  },
  beauty: {
    // 내추럴 그린(forest)은 뷰티에 안 어울려 소프트 파스텔로 바꿨다(2026-08-04).
    styles: ["coral", "mono", "pastel"] as const,
    layouts: ["showcase", "calm"] as const,
    dir: "_작업/뷰티샵_예약플랫폼/디자인프리셋",
    fits: [
      "네일·속눈썹·왁싱 등 캐주얼 뷰티, 20~30대 타깃 매장",
      "감각적인 편집숍형 살롱, 남성 전용 바버샵",
      "부드러운 인상이 중요한 피부관리·에스테틱, 아이·산모 대상 케어",
    ],
  },
  travel: {
    styles: ["navy", "mono", "pastel"] as const,
    layouts: ["search", "showcase"] as const,
    dir: "_작업/해외투어_티켓예약/디자인프리셋",
    fits: [
      "신뢰가 중요한 해외 투어·티켓 예약, 대형 여행 플랫폼",
      "사진이 주인공인 감성 여행 브랜드, 소규모 프라이빗 투어",
      "액티비티·레저 예약, 20~30대 자유여행객 타깃",
    ],
  },
  admin: {
    styles: ["navy", "mono", "pastel"] as const,
    layouts: ["console", "list"] as const,
    dir: "_작업/비즈니스관리_관리자시스템/디자인프리셋",
    fits: [
      "정보 밀도가 높은 백오피스·ERP형 관리 시스템, 데이터 중심 화면",
      "병의원·클리닉·전문 서비스업의 신뢰감 있는 관리자 콘솔",
      "미용실·공방·소규모 매장 사장님이 매일 쓰는 가벼운 관리 도구",
    ],
  },
  matching: {
    styles: ["navy", "mono", "forest"] as const,
    layouts: ["split", "list"] as const,
    dir: "_작업/동네서비스_매칭플랫폼/디자인프리셋",
    fits: [
      "신뢰가 먼저인 매칭·중개 서비스, 이사·인테리어처럼 금액이 큰 분야",
      "과외·레슨·컨설팅처럼 사람 자체가 상품인 분야",
      "청소·수리·돌봄처럼 생활에 가까운 분야, 안심이 중요한 서비스",
    ],
  },
  groupbuy: {
    styles: ["navy", "mono", "coral"] as const,
    // 목록 중심형은 매칭이 이미 쓴다. 9종을 겹치지 않게 나누려고 공구는 벤토 그리드형을 받는다.
    // 크기가 다른 타일을 짜맞추는 뼈대라 딜을 늘어놓는 공구에 어울린다(2026-08-06).
    layouts: ["bold", "bento"] as const,
    dir: "_작업/공동구매_공구플랫폼/디자인프리셋",
    fits: [
      "신뢰가 중요한 대형 공동구매·소셜커머스, 안정감 있는 브랜드",
      "감각적인 셀렉트 공구·인플루언서 공구, 편집숍형 큐레이션",
      "생활밀착 저가 공구·맘카페형, 20~30대 모바일 타깃",
    ],
  },
  "matching-deep": {
    styles: ["navy", "mono", "forest"] as const,
    layouts: ["split", "list"] as const,
    dir: "_작업/동네서비스_매칭플랫폼_상세IA/디자인프리셋",
    fits: [
      "신뢰가 먼저인 매칭·중개 서비스, 이사·인테리어처럼 금액이 큰 분야",
      "과외·레슨·컨설팅처럼 사람 자체가 상품인 분야",
      "청소·수리·돌봄처럼 생활에 가까운 분야, 안심이 중요한 서비스",
    ],
  },
  "groupbuy-deep": {
    styles: ["navy", "mono", "coral"] as const,
    // 목록 중심형은 매칭이 이미 쓴다. 9종을 겹치지 않게 나누려고 공구는 벤토 그리드형을 받는다.
    // 크기가 다른 타일을 짜맞추는 뼈대라 딜을 늘어놓는 공구에 어울린다(2026-08-06).
    layouts: ["bold", "bento"] as const,
    dir: "_작업/공동구매_공구플랫폼_상세IA/디자인프리셋",
    fits: [
      "신뢰가 중요한 대형 공동구매·소셜커머스, 안정감 있는 브랜드",
      "감각적인 셀렉트 공구·인플루언서 공구, 편집숍형 큐레이션",
      "생활밀착 저가 공구·맘카페형, 20~30대 모바일 타깃",
    ],
  },
  "admin-deep": {
    styles: ["navy", "mono", "pastel"] as const,
    layouts: ["console", "list"] as const,
    dir: "_작업/비즈니스관리_관리자시스템_상세IA/디자인프리셋",
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
// 3종을 다른 테마로 바꾸면 옛 파일이 남는다(예: 파스텔 → 코럴로 바꿔도 파스텔 파일이 그대로).
// 그대로 두면 판매 zip에 네 벌이 들어가 "3종"이라는 설명과 어긋난다. 매번 비우고 다시 쓴다.
for (const f of readdirSync(OUT)) {
  if (/^(가이드_|프리셋_|레이아웃_)/.test(f)) rmSync(`${OUT}/${f}`);
}

interface Preset {
  /** lib/design-presets.ts의 DesignKey와 같은 값 — 업종별로 3종을 고를 때 쓴다. */
  key: string;
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
  /** 강조색을 어떻게 다뤄야 하는지 — 모노처럼 색을 절제한 테마에서만 쓴다 */
  accentNote?: string;
  comp: [string, string][]; // 컴포넌트, 규칙
  screens: [string, string][]; // 화면 유형, 적용 지침
}

const PRESETS: Preset[] = [
  {
    key: "navy",
    no: "01",
    name: "모던 네이비",
    tagline: "신뢰감과 밀도. 실무형 서비스의 기본값.",
    fits: "B2B 교육, 사내 LMS, 기업 대상 강의 플랫폼",
    font: { family: "Paperlogy", alt: "Pretendard", note: "숫자는 tabular-nums로 표 정렬을 맞춘다" },
    c: {
      "primary (주요 액션)": "#2B4A8B",
      "primary-hover": "#1F3A73",
      "accent (강조·배지)": "#FF7A30",
      "accent-text (강조 글자용)": "#A84B28",
      "accent-text-dark (어두운 바탕 글자용)": "#FF7A30",
      "background (페이지)": "#F0EFEB",
      "surface (카드)": "#FFFFFF",
      "text (본문)": "#16233F",
      "text-muted (보조)": "#5A6B8C",
      "border (구분선)": "#DFE4EC",
      "success": "#0F7A52",
      "warning": "#926013",
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
      ["버튼(주요)", "primary 배경, on-primary 글자, 높이 40px, radius 8px, 굵기 600"],
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
    key: "mono",
    no: "02",
    name: "미니멀 모노",
    tagline: "여백과 활자. 색은 한 곳에만 남긴다.",
    fits: "전문가용 도구, 관리자 콘솔, 정보 밀도가 높은 화면",
    font: { family: "Paperlogy", alt: "Pretendard", note: "글자 크기 차이보다 굵기와 여백으로 위계를 만든다" },
    c: {
      "primary (주요 액션)": "#111111",
      "primary-hover": "#000000",
      "accent (강조·배지)": "#D97757",
      "accent-text (강조 글자용)": "#A84B28",
      "accent-text-dark (어두운 바탕 글자용)": "#D97757",
      "background (페이지)": "#F0EFEB",
      "surface (카드)": "#FFFFFF",
      "text (본문)": "#111111",
      "text-muted (보조)": "#666666",
      "border (구분선)": "#E5E5E5",
      "success": "#197B35",
      "warning": "#916100",
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
    accentNote: "무채색이 바탕이고 색은 강조 한 곳에만 쓴다. 강조색을 진하게 채우는 자리는 버튼 하나까지다. 배지는 10~15% 농도로 깔고 글자를 진하게 쓴다 — 배지까지 채우면 버튼과 무게가 같아져 무엇이 중요한지 다시 안 보인다. 원색을 글자로 쓰면 흰 배경에서 3.1:1 이라 안 읽히니, 글자에는 accent-text 를 쓴다.",
    comp: [
      ["버튼(주요)", "검정 배경, on-primary 글자, 높이 36px, radius 6px, 굵기 500"],
      ["버튼(강조)", "accent 배경 + 검정 글자. 주요 버튼과 나란히 놓지 않는다 — 한 화면에 하나"],
      ["버튼(보조)", "흰 배경 + border 1px. hover 시 background #F6F6F6"],
      ["카드", "border 1px만. 그림자·배경색 없음. 제목과 본문은 여백으로 구분"],
      ["입력", "높이 36px, border 1px, focus 시 검정 테두리 1px + 외곽선"],
      ["배지", "보통은 테두리만(outline). 강조 배지는 accent 를 10~15% 농도로 깔고 진한 accent 글자 — 채워 넣지 않는다(버튼과 무게가 같아진다)"],
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
    key: "pastel",
    no: "03",
    name: "일렉트릭 바이올렛",
    tagline: "부드럽고 친근하게. 처음 쓰는 사람도 겁먹지 않게.",
    fits: "B2C 강의 서비스, 취미·키즈 교육, 일반 사용자 대상",
    font: { family: "Paperlogy", alt: "Pretendard", note: "제목을 과감하게 키우고 자간을 좁혀 경쾌하게" },
    c: {
      "primary (주요 액션)": "#5B4FE5",
      "primary-hover": "#4A3DD1",
      "accent (강조·배지)": "#FFD54A",
      "accent-text (강조 글자용)": "#8A5A00",
      "accent-text-dark (어두운 바탕 글자용)": "#FFD54A",
      "background (페이지)": "#F0EFEB",
      "surface (카드)": "#FFFFFF",
      "text (본문)": "#1F2024",
      "text-muted (보조)": "#5F636A",
      "border (구분선)": "#E7E7EA",
      "soft-mint": "#DFF5EC",
      "soft-lavender": "#EDE9FE",
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
      ["버튼(주요)", "primary 배경, on-primary 글자, 높이 44px, radius 12px, 굵기 700"],
      ["버튼(보조)", "soft-lavender 배경, primary 글자. 테두리 없음"],
      ["카드", "surface 배경, radius 16px, 부드러운 그림자. 테두리는 아주 연하게"],
      ["입력", "높이 44px, background #F7F7F9, 테두리 없음, focus 시 primary 2px"],
      ["배지", "파스텔 배경 + accent-text 글자(노란 강조를 글자로 쓰면 안 읽힌다). 알약 형태(radius 999px)"],
      ["표", "헤더 배경 #F7F7F9, 행 구분선 아주 연하게, 행 높이 48px"],
      ["사이드바", "활성 항목은 soft-lavender 배경 + radius 12px로 감싸기"],
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
  {
    key: "forest",
    no: "04",
    name: "내추럴 그린",
    tagline: "차분한 자연. 건강하고 정직한 인상.",
    fits: "피부관리·클리닉, 건강·친환경을 내세우는 브랜드",
    font: { family: "Paperlogy", alt: "Pretendard", note: "제목은 과하지 않게, 자간을 살짝 넓혀 여유 있게" },
    c: {
      "primary (주요 액션)": "#15803D",
      "primary-hover": "#116632",
      "accent (강조·배지)": "#65A30D",
      "accent-text (강조 글자용)": "#166534",
      "accent-text-dark (어두운 바탕 글자용)": "#65A30D",
      "background (페이지)": "#F0EFEB",
      "surface (카드)": "#FFFFFF",
      "text (본문)": "#1C2B22",
      "text-muted (보조)": "#5F7268",
      "border (구분선)": "#DCE7DD",
      success: "#15803D",
      warning: "#A16207",
      danger: "#B91C1C",
    },
    scale: [
      ["페이지 제목", "32px", "700"],
      ["섹션 제목", "22px", "600"],
      ["카드 제목", "17px", "600"],
      ["본문", "15px", "400"],
      ["보조 설명", "13px", "400"],
      ["표 헤더", "13px", "600"],
    ],
    radius: { card: "14px", button: "10px", input: "10px", badge: "8px" },
    space: "4px 배수. 카드 내부 24px, 섹션 간격 40px. 숨 쉴 여백을 남긴다",
    shadow: "0 1px 4px rgba(28,43,34,.07) — 카드에만. 그림자를 과하게 쓰지 않는다",
    comp: [
      ["버튼(주요)", "primary 배경, on-primary 글자, 높이 42px, radius 10px, 굵기 600"],
      ["버튼(보조)", "surface 배경, border 1px, primary 글자"],
      ["카드", "surface 배경, border 1px, radius 14px, 아주 옅은 그림자"],
      ["입력", "높이 42px, border 1px, focus 시 primary 테두리 2px"],
      ["배지", "primary 10% 배경 + primary 진한 글자. radius 8px"],
      ["표", "헤더는 background 색 채움, 행 구분 border 1px, 행 높이 46px"],
      ["사이드바", "활성 항목만 primary 8% 배경 + primary 글자"],
    ],
    screens: [
      ["대시보드", "지표 카드 3~4개. 숫자 30px/700 primary, 라벨 13px muted"],
      ["목록", "카드와 표를 섞어도 좋다. 사진이 있으면 카드 우선"],
      ["폼", "1열, 최대 폭 560px. 라벨 위·입력 아래"],
      ["빈 화면", "선 아이콘 48px + 담백한 안내 문구 + 주요 버튼 하나"],
      ["오류", "danger 색은 문구와 아이콘에만. 배경은 건드리지 않는다"],
    ],
  },
  {
    key: "coral",
    no: "05",
    name: "코럴 선셋",
    tagline: "밝고 따뜻하게. 처음 오는 사람도 반기는 얼굴.",
    fits: "취미·키즈 교육, 일반 사용자 대상 B2C 서비스",
    font: { family: "Paperlogy", alt: "Pretendard", note: "제목을 크고 굵게. 친근한 인상이 먼저 오게" },
    c: {
      "primary (주요 액션)": "#F0654F",
      "primary-hover": "#D9503B",
      "accent (강조·배지)": "#F59E0B",
      "accent-text (강조 글자용)": "#8A5A00",
      "accent-text-dark (어두운 바탕 글자용)": "#F59E0B",
      "background (페이지)": "#F0EFEB",
      "surface (카드)": "#FFFFFF",
      "text (본문)": "#33221E",
      "text-muted (보조)": "#7A6560",
      "border (구분선)": "#F2E2DD",
      success: "#0F7A52",
      warning: "#B45309",
      danger: "#C0392B",
    },
    scale: [
      ["페이지 제목", "36px", "800"],
      ["섹션 제목", "24px", "700"],
      ["카드 제목", "18px", "700"],
      ["본문", "15px", "500"],
      ["보조 설명", "14px", "400"],
      ["표 헤더", "13px", "700"],
    ],
    radius: { card: "16px", button: "12px", input: "12px", badge: "999px" },
    space: "4px 배수. 카드 내부 24px, 섹션 간격 40px. 답답하지 않게 띄운다",
    shadow: "0 2px 8px rgba(51,34,30,.07) — 카드와 떠 있는 요소에만",
    comp: [
      ["버튼(주요)", "primary 배경, on-primary 글자, 높이 44px, radius 12px, 굵기 700"],
      ["버튼(보조)", "primary 10% 배경, primary 글자. 테두리 없음"],
      ["카드", "surface 배경, radius 16px, 부드러운 그림자. 테두리는 연하게"],
      ["입력", "높이 44px, background #FFF9F7, 테두리 연하게, focus 시 primary 2px"],
      ["배지", "primary·accent 10% 배경 + accent-text 글자. 알약 형태"],
      ["표", "헤더 배경 background 색, 행 구분선 연하게, 행 높이 48px"],
      ["사이드바", "활성 항목은 primary 10% 배경 + radius 12px로 감싸기"],
      ["강조 문구", "accent 형광펜 효과: linear-gradient(transparent 54%, #FDE4B0 54%)"],
    ],
    screens: [
      ["대시보드", "지표 카드를 크게. 숫자 40px/800 primary, 아이콘을 곁들인다"],
      ["목록", "표보다 카드 그리드 우선. 썸네일 영역을 넉넉히"],
      ["폼", "1열, 입력 높이 44px. 도움말은 입력 아래 14px muted"],
      ["빈 화면", "큰 일러스트 또는 이모지 + 친근한 문구 + 큰 primary 버튼"],
      ["오류", "danger를 강하게 쓰지 않는다. 무엇을 하면 되는지 먼저 말한다"],
    ],
  },
];

/* 「색 위에 얹는 글자」 두 칸을 계산해서 넣는다 — 2026-08-09.
 *
 * 이 파일은 lib/design-presets.ts 와 «따로» 색 표를 들고 있다(세 번째 벌이다).
 * 그래서 lib 쪽에 on-primary 를 넣었는데도 팩 문서에는 여전히
 * 「버튼(주요) | primary 배경, 흰 글자」가 실렸다.
 *
 * 값을 여기에 또 손으로 적지 않는다. 재는 함수는 lib 것 하나만 쓴다 —
 * 색 표가 세 벌인 것만으로도 충분히 위험하다.
 *
 * 코럴 #F0654F 위 흰 글자는 3.14 다. 버튼 글자가 안 읽힌다. */
for (const p of PRESETS) {
  const 찾기 = (앞: string) => {
    const k = Object.keys(p.c).find((x) => x.startsWith(앞));
    return k ? p.c[k] : undefined;
  };
  const primary = 찾기("primary (");
  const accent = 찾기("accent (강조");
  if (primary) p.c["on-primary (주색 배경 위 글자)"] = textOn(primary);
  if (accent) p.c["on-accent (강조색 배경 위 글자)"] = textOn(accent);
}

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
  // 강조색을 배경용·글자용으로 가르는 규칙은 유저 팩과 한 벌을 쓴다(lib/design-presets.ts).
  L.push(...ACCENT_RULE);
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
  L.push(`- 여백 원칙: ${p.space}`);
  L.push("");
  L.push("### 콘텐츠 영역 — 한 사이트에 하나");
  L.push("");
  L.push(`PC에서 내용이 놓이는 폭은 **최대 ${CONTENT_WIDTH.max}, 좌우 여백 ${CONTENT_WIDTH.padX}** 하나로 갑니다.`);
  L.push("");
  L.push("**헤더·본문·푸터·하단 고정 바가 모두 같은 폭을 써야** 위아래가 한 줄로 섭니다.");
  L.push("한 곳에서만 폭을 정하고(예: `--wrap`), 나머지는 모두 그 값을 참조하세요.");
  L.push("화면마다 따로 정하면 반드시 갈라집니다 — 헤더는 1200인데 본문만 1440이라");
  L.push("시작 지점이 120px씩 어긋난 사이트가 실제로 있었습니다.");
  L.push("");
  L.push("- 더 넓게 쓰고 싶은 화면이 있어도 폭을 새로 만들지 마세요. 같은 폭 안에서 열 수를 늘리세요.");
  // 읽기 폭의 본문은 COMMON_RULES 가 들고 있다(유저 팩과 한 벌). 여기서는 가리키기만 한다.
  L.push(`- 읽기용으로 좁힌 한 단(상세 본문 ${READING_WIDTH}px)은 이 폭 **안에서** 가운데 정렬합니다 — 아래 「읽기 폭」 참고.`);
  L.push("- 좁은 화면에서는 좌우 여백만 한 단계 줄이고, 폭은 화면을 따라갑니다.");
  L.push("");
  L.push("### 간격 눈금 — 밀도에서 나옵니다");
  L.push("");
  L.push("자리마다 값을 정해 뒀습니다. **이 눈금 밖의 값을 쓰지 마세요.** 눈금에 없는 값을 쓰면");
  L.push("화면마다 간격이 조금씩 달라지고, 여러 번 나눠 만들 때 그 차이가 눈에 띕니다.");
  L.push("");
  L.push(`| 자리 | ${DENSITIES.map((d) => d.label).join(" | ")} | 언제 |`);
  L.push(`| --- | ${DENSITIES.map(() => "---").join(" | ")} | --- |`);
  for (const slot of SPACING_SLOTS) {
    L.push(`| ${slot.label} | ${DENSITIES.map((d) => `\`${d[slot.key]}\``).join(" | ")} | ${slot.when} |`);
  }
  L.push("");
  L.push("좁은 화면(720px 이하)에서는 화면 좌우 여백과 섹션 사이를 한 단계씩 줄입니다.");
  L.push(`- 그림자: ${p.shadow}`);
  if (p.accentNote) {
    L.push("");
    L.push("### 강조색 쓰는 법");
    L.push("");
    L.push(p.accentNote);
  }
  L.push("");
  L.push("### 줄 간격 — 글줄 사이");
  L.push("");
  L.push("위 눈금이 **덩어리 사이**라면, 이건 **글줄 사이**입니다. 덩어리 간격만 정해 두면");
  L.push("큰 제목이 두 줄로 넘어갈 때 윗줄과 아랫줄이 부딪힙니다. 밑줄·형광펜을 얹은 글자는 특히 그렇습니다.");
  L.push("");
  L.push(`| 자리 | ${DENSITIES.map((d) => d.label).join(" | ")} | 언제 |`);
  L.push(`| --- | ${DENSITIES.map(() => "---").join(" | ")} | --- |`);
  for (const slot of LINE_SLOTS) {
    L.push(`| ${slot.label} | \`${DENSITIES.map((d) => d[slot.key]).join("` | `")}\` | ${slot.when} |`);
  }
  L.push("");
  L.push("- 한국어는 영어보다 줄 간격이 넉넉해야 읽힙니다. 본문을 1.5 아래로 좁히지 마세요.");
  L.push("- 큰 제목에 밑줄·형광펜을 얹었다면 줄 간격을 **한 단계 더** 벌리세요. 장식이 아랫줄을 침범합니다.");
  L.push("");
  L.push("> **가로와 세로는 다른 자리입니다.** 격자로 나란히 놓을 때는 옆 카드와 구별되라고 벌리지만,");
  L.push("> 위아래로 이어 붙일 때는 **「한 묶음」으로 읽혀야 해서 훨씬 좁습니다.**");
  L.push("> 세로에 가로 값을 그대로 쓰면 낱개가 흩어져 보이고, 가로에 세로 값을 쓰면 카드가 붙어 보입니다.");
  L.push("");
  L.push(...COMMON_RULES);
  L.push("### 지켜 주세요");
  L.push("");
  L.push("- 간격은 위 눈금에서만 고르세요. 눈금에 없는 값을 새로 만들지 마세요.");
  L.push("- **간격은 숫자가 아니라 자리 이름으로 고르세요.** `mt-6`처럼 숫자로 고르는 손잡이를 열어 두면,");
  L.push("  눈금을 알아도 거치지 않고 값을 집게 됩니다. 실제로 같은 관계(덩어리와 덩어리 사이)가");
  L.push("  한 화면에서 40px과 24px로 갈린 적이 있습니다 — 한쪽은 눈금을 썼고 한쪽은 숫자를 썼습니다.");
  L.push("  `섹션사이`·`카드사이`·`제목아래`처럼 **자리 이름을 단 클래스**를 만들고 그것만 쓰세요.");
  L.push("- 아래·위 한쪽에만 간격을 준 요소를 조심하세요. 섹션이 카드 뒤에 오면 사이가 0이 되는 식으로,");
  L.push("  **어느 쪽에서 오느냐에 따라 간격이 달라집니다.** 덩어리 사이는 어느 쪽에서 오든 같아야 합니다.");
  L.push("- **목록 행 안**은 빽빽한 자리입니다. 줄과 줄을 0으로 붙이면 어디까지가 한 줄인지 안 보이고,");
  L.push("  덩어리 간격을 그대로 쓰면 행이 쓸데없이 높아집니다. **한 단계 좁은 밀도의 「묶음 안 요소끼리」**를 쓰세요.");
  L.push("- **세로로 쌓은 버튼은 폭을 맞추세요.** 글자 수대로 두면 오른쪽 끝이 들쭉날쭉해집니다.");
  L.push("- **행이나 카드 전체를 링크로 만들 때 `<a>`로 감싸지 마세요.** 그 안에 버튼(`<a>`)을 넣으면");
  L.push("  브라우저가 바깥 링크를 그 자리에서 끊어, 뒤에 오던 가격·버튼이 행 밖으로 튀어나갑니다.");
  L.push("  행은 `<div>`로 두고 눌렀을 때 이동하게 하세요 — 그러면 안에 진짜 버튼을 자유롭게 둘 수 있습니다.");
  L.push("- **폭을 넓힐 때는 내용도 함께 맞추세요.** 콘텐츠 영역만 넓히고 안을 그대로 두면");
  L.push("  한쪽에 몰리거나 서로 겹칩니다. 넓어진 만큼 열을 늘리거나 각자에게 제 칸을 주세요.");
  L.push("- CSS 변수를 쓸 때는 **정의된 것만** 쓰세요. 정의 없는 변수를 쓰면 브라우저가 그 속성을 통째로 버려, 간격이 조용히 0이 됩니다.");
  L.push("- 가운데 정렬은 `text-align`만으로 안 되는 곳이 있습니다. flex로 늘어놓은 버튼 줄은 `justify-content`로 모으세요.");
  L.push("- **버튼 사이 간격은 감싸는 상자에 기대지 마세요.** 폭 꽉 찬 버튼을 위아래로 쌓을 때 감싸는 걸 잊으면 간격이 0이 되어 버튼끼리 달라붙습니다.");
  L.push("  `버튼 + 버튼` 자체에 간격을 주는 규칙을 하나 깔아 두면, 감싸는 걸 잊어도 붙지 않습니다.");
  L.push("- 가로로 넘치는 줄에는 좌우 화살표를 두세요. 아래 스크롤바만 있으면 넘길 게 있다는 걸 모르고 지나칩니다.");
  L.push("- **가로 스크롤 상자는 세로도 함께 잘립니다.** `overflow-x`를 주면 세로축이 `visible`로 남지 않기 때문입니다.");
  L.push("  그 안의 카드가 마우스를 올렸을 때 떠오르거나 테두리가 굵어지면 위쪽이 잘려 나갑니다.");
  L.push("  상자에 위아래 여백을 주고 그만큼 바깥 여백에서 빼면, 자리는 그대로 두면서 안 잘립니다.");
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

  L.push("## 6. 화면 뼈대는 따로 고르세요");
  L.push("");
  L.push("이 파일은 **가이드 프리셋**입니다 — 색·글꼴·모서리·여백만 정합니다. 무엇을 어디에 놓을지(화면 뼈대)는");
  L.push("같은 폴더의 `레이아웃_A_*.md` · `레이아웃_B_*.md` 중 하나를 골라 **이 파일과 함께** AI에 넣으세요.");
  L.push("");
  L.push("가이드 3종 × 레이아웃 2종이라 **6가지 조합**이 나옵니다. 짝이 정해져 있지 않으니 마음에 드는 대로 섞으세요.");
  L.push("");
  L.push("## 7. 이미지 자리");
  L.push("");
  L.push("아직 사진이 없으니 이미지 자리는 **테마 색이 아니라 옅은 파스텔**로 채우세요. 테마 색으로 칠하면 화면이 그 색 덩어리로 뒤덮여 디자인이 안 보입니다.");
  L.push("");
  L.push("| 항목 | 값 |");
  L.push("| --- | --- |");
  L.push(`| 배경 | ${IMAGE_PLACEHOLDER.tones.map(inCode).join(" · ")} 중 하나(카드마다 돌려 씀) |`);
  L.push(`| 테두리 | \`${IMAGE_PLACEHOLDER.border}\` 1px |`);
  L.push(`| 글자색 | \`${IMAGE_PLACEHOLDER.text}\` · 13px |`);
  L.push(`| 적을 글자 | \`${IMAGE_PLACEHOLDER.labelFormat}\` |`);
  L.push("");
  L.push("예시: " + IMAGE_PLACEHOLDER.examples.map(inCode).join(" · "));
  L.push("");
  for (const r of IMAGE_PLACEHOLDER.rule) L.push(`- ${r}`);
  L.push("");
  L.push("---");
  L.push("");
  L.push("## AI에게 그대로 넣는 지시문");
  L.push("");
  L.push("```");
  L.push(`아래 디자인 규칙을 모든 화면에 일관되게 적용해줘.`);
  L.push("");
  L.push(`- 주요 색: ${Object.values(p.c)[0]}, 강조: ${p.c["accent (강조·배지)"] ?? Object.values(p.c)[2]}`);
  L.push(`- 강조를 **글자**로 쓸 때는 ${p.c["accent-text (강조 글자용)"]} — 위 강조색은 배경·배지 바탕에만`);
  L.push(`- 배경: ${p.c["background (페이지)"]}, 카드: ${p.c["surface (카드)"]}, 본문 글자: ${p.c["text (본문)"]}`);
  L.push(`- 폰트: ${p.font.family}. 페이지 제목 ${p.scale[0][1]}/${p.scale[0][2]}, 본문 ${p.scale[3][1]}/${p.scale[3][2]}`);
  L.push(`- 모서리: 카드 ${p.radius.card}, 버튼 ${p.radius.button}, 배지 ${p.radius.badge}`);
  L.push(`- 그림자: ${p.shadow}`);
  L.push(`- 버튼(주요): ${p.comp[0][1]}`);
  L.push(`- 카드: ${p.comp[2][1]}`);
  L.push(`- 빈 화면: ${p.screens[3][1]}`);
  L.push("");
  L.push(`- 이미지 자리: 테마 색 말고 ${IMAGE_PLACEHOLDER.tones[0]} 같은 옅은 파스텔 + ${IMAGE_PLACEHOLDER.border} 테두리. 안에 "${IMAGE_PLACEHOLDER.examples[0]}"처럼 무엇과 권장 크기를 적어줘`);
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
  // 간격은 밀도에서 나온다. 자리마다 값을 정해 둬야 눈금 밖의 값을 쓰지 않는다.
  ...(p.accentNote ? { accentNote: p.accentNote } : {}),
  lineHeight: Object.fromEntries(
      DENSITIES.map((d) => [
        d.label,
        Object.fromEntries(LINE_SLOTS.map((slot) => [slot.label, d[slot.key]])),
      ]),
    ),
  spacingScale: Object.fromEntries(
    DENSITIES.map((d) => [
      d.label,
      Object.fromEntries(SPACING_SLOTS.map((slot) => [slot.label, d[slot.key]])),
    ]),
  ),
  shadow: p.shadow,
  components: Object.fromEntries(p.comp),
  screenGuides: Object.fromEntries(p.screens),
  // 골격은 이 파일에 넣지 않는다 — 레이아웃 프리셋 파일에서 따로 고른다.
  imagePlaceholder: {
    tones: IMAGE_PLACEHOLDER.tones,
    border: IMAGE_PLACEHOLDER.border,
    text: IMAGE_PLACEHOLDER.text,
    labelFormat: IMAGE_PLACEHOLDER.labelFormat,
    examples: IMAGE_PLACEHOLDER.examples,
    rule: IMAGE_PLACEHOLDER.rule,
  },
});

/* ─────────────────────────────────────────────────────────────
   레이아웃 프리셋 — 색과 짝을 짓지 않는다.
   색 3벌과 뼈대 2벌을 따로 넣으면 구매자가 6가지로 섞을 수 있다.
   ───────────────────────────────────────────────────────────── */
const layoutMd = (l: (typeof LAYOUTS)[number], no: string): string => {
  const L: string[] = [];
  L.push(`# 레이아웃 프리셋 ${no} — ${l.label}`);
  L.push("");
  L.push(`> ${l.tagline}`);
  L.push("");
  L.push("## 사용 방법");
  L.push("");
  L.push("1. 이 파일과 **가이드 프리셋 하나**(색·글꼴)를 함께 AI 코딩 도구에 넣으세요.");
  L.push("2. 스펙팩(07_AI빌드_스펙팩.json)과 함께 넣으면 그 화면들이 이 뼈대로 만들어집니다.");
  L.push("3. 가이드 3종 × 레이아웃 2종 = **6가지 조합** 중 마음에 드는 대로 고르시면 됩니다.");
  L.push("");
  L.push("## 자리별 규칙");
  L.push("");
  L.push("| 자리 | 어떻게 |");
  L.push("| --- | --- |");
  L.push(`| 첫 화면 위쪽 | ${l.hero} |`);
  L.push(`| 목록 화면 | ${l.list} |`);
  L.push(`| 내비게이션 | ${l.nav} |`);
  L.push(`| 상세 화면 | ${l.detail} |`);
  L.push(`| 카드(썸네일) | ${thumbByKey(l.thumb).shape} (비율 ${thumbByKey(l.thumb).ratio}) |`);
  L.push("");
  L.push(`**어울리는 곳** — ${l.fits}`);
  L.push("");

  /* 여기서부터가 이 문서의 알맹이다.
     전에는 위의 「자리별 규칙」 표 넉 줄이 전부였고 숫자가 하나도 없었다(픽셀값 0개).
     그래서 같은 스펙팩으로 만든 세 벌이 브레이크포인트를 각자 지어냈다 —
     오퍼스 1024·860·720 / 소넷 980·900·720·640·560 / 페이블 1100·1024·720·560.
     글로 적은 규칙은 무시되고 코드로 준 규칙은 지켜진다는 걸 여러 번 겪었으므로,
     이 뼈대를 붙여 넣을 수 있는 CSS로 준다(2026-08-08). */
  const st = STRUCTURES.find((x) => x.key === l.structure)!;
  const th = thumbByKey(l.thumb);
  const [c1, c2, c3] = STRUCTURE_COLS[l.structure];

  L.push("## 칸이 몇 개이고, 카드가 몇 px인가");
  L.push("");
  L.push("| 화면 폭 | 좌우 여백 | 칸 사이 | 칸 수 | 카드 한 장 |");
  L.push("| --- | --- | --- | --- | --- |");
  /* 대표 폭은 「경계값」이 아니라 「실제로 많이 쓰는 폭」으로 적는다.
     720을 그대로 쓰면 카드가 338px로 나오는데, 그건 태블릿 세로에 가깝고
     손님이 떠올리는 휴대폰이 아니다. 375는 아이폰 기본 폭이다. */
  L.push(`| 1440px 이상 (노트북) | 24px | ${GRID_GAP.x}px | ${c1}칸 | ${cardWidth(c1, 1440, l.structure)}px |`);
  L.push(`| 1024px (태블릿 가로) | 24px | ${GRID_GAP.x}px | ${c2}칸 | ${cardWidth(c2, 1024, l.structure)}px |`);
  L.push(`| 375px (휴대폰) | 16px | ${GRID_GAP.xNarrow}px | ${c3}칸 | ${cardWidth(c3, 375, l.structure)}px |`);
  L.push("");
  if (th.aspect) {
    L.push(`카드 사진은 **${th.ratio}**입니다. 위 폭에 맞추면 사진 크기는 이렇게 됩니다.`);
    L.push("");
    const [rw, rh] = th.aspect.split("/").map((x) => Number(x.trim()));
    const 줄 = ([c, vw]: [number, number]) => {
      const w = cardWidth(c, vw, l.structure);
      return `${w}×${Math.round((w * rh) / rw)}`;
    };
    L.push(`- 노트북 ${줄([c1, 1440])} · 태블릿 ${줄([c2, 1024])} · 휴대폰 ${줄([c3, 375])}`);
    L.push("");
    L.push("> 이미지를 준비하실 때는 가장 큰 값의 **2배**로 만드세요(고해상도 화면 대비).");
    L.push("");
  }

  L.push("## 그대로 붙여 넣는 CSS");
  L.push("");
  L.push("아래 두 덩이를 **그대로** 쓰세요. 간격·칸 수·비율을 손으로 다시 적지 마세요 — 자리마다 값이 갈립니다.");
  L.push("");
  L.push(`**① 공통 격자** (어느 뼈대를 골라도 같습니다)`);
  L.push("");
  L.push("```css");
  L.push(gridBaseCss());
  L.push("```");
  L.push("");
  L.push(`**② ${st.label} 뼈대**`);
  L.push("");
  L.push("```css");
  L.push(st.css);
  L.push("```");
  L.push("");
  L.push(`**③ ${th.label}**`);
  L.push("");
  L.push("```css");
  L.push(th.css);
  L.push("```");
  L.push("");
  L.push("### 카드 모양을 바꾸고 싶다면");
  L.push("");
  L.push("이 뼈대의 기본 카드는 **" + thumbByKey(l.thumb).label + "**입니다. 아래 중 다른 것으로 바꿔 쓰셔도 됩니다 — 뼈대는 그대로 두고 카드만 갈아 끼우면 인상이 크게 달라집니다.");
  L.push("");
  L.push("| 카드 모양 | 비율 | 어떻게 | 어울리는 곳 |");
  L.push("| --- | --- | --- | --- |");
  for (const t of THUMBS) L.push(`| ${t.label}${t.key === l.thumb ? " **(기본)**" : ""} | ${t.ratio} | ${t.shape} | ${t.fits} |`);
  L.push("");
  L.push("---");
  L.push("");
  L.push("## AI에게 그대로 넣는 지시문");
  L.push("");
  L.push("```");
  L.push(`화면 뼈대를 아래대로 잡아줘. 색과 글꼴은 함께 넣은 가이드 프리셋을 따르고,`);
  L.push(`뼈대는 이 규칙을 우선해줘.`);
  L.push("");
  L.push(`- 첫 화면 위쪽: ${l.hero}`);
  L.push(`- 목록 화면: ${l.list}`);
  L.push(`- 내비게이션: ${l.nav}`);
  L.push(`- 상세 화면: ${l.detail}`);
  L.push(`- 카드(썸네일): ${thumbByKey(l.thumb).shape} 이미지 비율은 ${thumbByKey(l.thumb).ratio} 를 지켜줘.`);
  L.push("");
  L.push("색만 맞추고 이 뼈대를 무시하면 어떤 색으로 만들어도 같은 화면이 나와. 뼈대를 먼저 잡고 색을 입혀줘.");
  L.push("```");
  L.push("");
  return L.join("\n");
};

const layoutTokens = (l: (typeof LAYOUTS)[number], no: string) => ({
  layout: { no, key: l.key, name: l.label, tagline: l.tagline, fits: l.fits },
  slots: { hero: l.hero, list: l.list, nav: l.nav, detail: l.detail },
  card: { key: l.thumb, name: thumbByKey(l.thumb).label, ratio: thumbByKey(l.thumb).ratio, shape: thumbByKey(l.thumb).shape },
  cardOptions: THUMBS.map((t) => ({ key: t.key, name: t.label, ratio: t.ratio, shape: t.shape, fits: t.fits })),
  note: "색·글꼴은 가이드 프리셋을 따른다. 이 파일은 화면 뼈대만 정한다.",
});

/**
 * 이 업종에 넣을 3종을 6종에서 고른다.
 *
 * 번호(01·02·03)는 고른 순서대로 다시 매긴다 — 파일명과 미리보기가 항상
 * 01·02·03이라야 판매팩 구성이 업종마다 달라 보이지 않는다.
 * "어울리는 서비스" 문구(fits)도 같은 순서로 갈아 끼운다.
 */
const chosen: Preset[] = target.styles.map((key, i) => {
  const found = PRESETS.find((x) => x.key === key);
  if (!found) {
    throw new Error(`프리셋 정의가 없어요: ${key} (있는 것: ${PRESETS.map((x) => x.key).join(", ")})`);
  }
  return { ...found, no: String(i + 1).padStart(2, "0"), fits: target.fits[i] ?? found.fits };
});

// lib/packages.ts의 presetStyles와 어긋나면 판매 페이지 문구와 실제 파일이 달라진다.
// 값을 두 곳에 적어 둔 대가라, 어긋나면 여기서 멈춘다.
const listed = PACKAGES.find((x) => x.id === targetKey);
if (listed && listed.presetStyles.join() !== target.styles.join()) {
  throw new Error(
    `프리셋 3종이 lib/packages.ts와 달라요.\n` +
      `  이 스크립트: ${target.styles.join(", ")}\n` +
      `  packages.ts: ${listed.presetStyles.join(", ")}\n` +
      `  둘을 맞춘 뒤 다시 돌리세요.`,
  );
}

// 이 업종에 넣을 뼈대 2종.
const chosenLayouts = target.layouts.map((key) => {
  const found = LAYOUTS.find((l) => l.key === key);
  if (!found) throw new Error(`레이아웃 정의가 없어요: ${key}`);
  return found;
});
if (listed && listed.layoutKeys.join() !== target.layouts.join()) {
  throw new Error(
    `레이아웃 2종이 lib/packages.ts와 달라요.\n` +
      `  이 스크립트: ${target.layouts.join(", ")}\n` +
      `  packages.ts: ${listed.layoutKeys.join(", ")}\n` +
      `  둘을 맞춘 뒤 다시 돌리세요.`,
  );
}

for (const p of chosen) {
  const base = `${OUT}/가이드_${p.no}_${p.name.replace(/\s/g, "")}`;
  writeFileSync(`${base}.md`, md(p), "utf8");
  writeFileSync(`${base}.json`, JSON.stringify(tokens(p), null, 2), "utf8");
  console.log(`  ✔ 가이드_${p.no}_${p.name} (.md / .json)`);
}

/* 비교 미리보기 HTML — 구매자가 세 가지를 눈으로 비교 */
const card = (p: Preset) => {
  const pri = Object.values(p.c)[0], acc = p.c["accent (강조·배지)"] ?? Object.values(p.c)[2];
  // 배지 글자에 acc 원색을 쓰고 있었다 — 밝은 강조는 옅은 바탕 위에서 안 읽힌다.
  const accT = p.c["accent-text (강조 글자용)"] ?? acc;
  const bg = p.c["background (페이지)"], sf = p.c["surface (카드)"];
  const tx = p.c["text (본문)"], mu = p.c["text-muted (보조)"], bd = p.c["border (구분선)"];
  return `
  <div class="col">
    <div class="lab"><b>${p.no}. ${p.name}</b><span>${p.tagline}</span></div>
    <div class="demo" style="background:${bg};color:${tx}">
      <div class="dcard" style="background:${sf};border:1px solid ${bd};border-radius:${p.radius.card};
           box-shadow:${p.shadow.startsWith("0") ? p.shadow.split(" — ")[0] : "none"}">
        <p class="dt" style="font-size:${p.scale[2][1]};font-weight:${p.scale[2][2]}">제목입니다</p>
        <p class="dm" style="color:${mu};font-size:${p.scale[4][1]}">서브 카피입니다</p>
        <div class="drow">
          <span class="dbadge" style="background:${acc}22;color:${accT};border-radius:${p.radius.badge};
                border:1px solid ${acc}55">배지 1</span>
          <span class="dbadge" style="background:transparent;color:${mu};border:1px solid ${bd};
                border-radius:${p.radius.badge}">배지 2</span>
        </div>
        <div class="dfield" style="border:1px solid ${bd};border-radius:${p.radius.button};color:${mu}">
          입력창입니다
        </div>
        <div class="dbtns">
          <span class="db" style="background:${pri};color:#fff;border-radius:${p.radius.button}">메인 버튼</span>
          <span class="db2" style="border:1px solid ${bd};color:${tx};border-radius:${p.radius.button}">보조 버튼</span>
        </div>
      </div>
      <div class="dnums">
        <div><b style="color:${pri};font-size:${p.scale[0][1]};font-weight:${p.scale[0][2]}">00</b><span style="color:${mu}">지표 1</span></div>
        <div><b style="color:${pri};font-size:${p.scale[0][1]};font-weight:${p.scale[0][2]}">00</b><span style="color:${mu}">지표 2</span></div>
      </div>
      <div class="dsw">${Object.values(p.c).slice(0, 7).map(v => `<i style="background:${v}"></i>`).join("")}</div>
    </div>
  </div>`;
};

/* 뼈대 카드 — 색 카드와 나란히 두지 않고 아래 줄에 따로 둔다.
   나란히 두면 "이 색에는 이 뼈대"로 읽혀서 짝을 푼 뜻이 사라진다. */
const layoutCard = (l: (typeof LAYOUTS)[number], no: string) => {
  const pri = "#5A6470";
  const bd = "#DEDEE4";
  return `
  <div class="col">
    <div class="lab"><b>${no}. ${l.label}</b><span>${l.tagline}</span></div>
    <div class="lay">
      ${wire(l.key, pri, bd)}
      <dl class="lay-kv">
        <dt>첫 화면 위쪽</dt><dd>${l.hero}</dd>
        <dt>목록 화면</dt><dd>${l.list}</dd>
        <dt>내비게이션</dt><dd>${l.nav}</dd>
        <dt>상세 화면</dt><dd>${l.detail}</dd>
      </dl>
      <p class="lay-fit">어울리는 곳: ${l.fits}</p>
    </div>
  </div>`;
};

/* 뼈대 그림 — 색이 아니라 "무엇이 어디에 있는지"만 보여준다 */
const wire = (kind: string, pri: string, bd: string) => {
  const box = `background:${pri}22`;
  const line = `background:${pri}14`;
  const bar = `background:${pri}55`;
  const inner =
    kind === "search"
      ? `<i style="${box};height:22px"></i><div class="w3">${"<i></i>".repeat(3)}</div>`
      : kind === "showcase"
        ? `<i style="${line};height:8px;width:60%"></i><div class="wmo"><i class="big" style="${box}"></i><i style="${line}"></i><i style="${line}"></i></div>`
        : kind === "list"
          ? `<div class="wsp"><i class="side" style="${line}"></i><div class="wcol"><i style="${box}"></i><i style="${line}"></i><i style="${line}"></i></div></div>`
          : kind === "split"
            ? `<div class="wsp"><div class="wcol"><i style="${bar};height:10px"></i><i style="${line};height:6px;width:70%"></i></div><i class="half" style="${box}"></i></div>`
            : `<div class="wsp"><i class="side" style="${bar}"></i><div class="wcol"><div class="w4">${`<i style="${box}"></i>`.repeat(4)}</div><i style="${line};flex:1"></i></div></div>`;
  return `<div class="wire" style="border:1px solid ${bd}">${kind === "console" ? "" : `<i style="${bar};height:8px"></i>`}${inner}</div>`;
};

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>가이드 프리셋 · 레이아웃 프리셋</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Pretendard,"Malgun Gothic",sans-serif;background:#EFEFF2;padding:40px;color:#1F2024}
h1{font-size:26px;font-weight:800;margin-bottom:6px}
.note{font-size:13px;color:#4A4A52;background:#fff;border:1px solid #DEDEE4;border-radius:10px;padding:12px 14px;margin:14px 0 20px}
.sub{color:#6B6F76;font-size:15px;margin-bottom:26px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1240px}
.lab{margin-bottom:10px}.lab b{display:block;font-size:17px;font-weight:800}
.lab span{display:block;font-size:13px;color:#6B6F76;margin-top:3px;line-height:1.5}
.demo{border-radius:14px;padding:22px;min-height:330px;border:1px solid #E0E0E5}
.dcard{padding:18px}
.sec{font-size:17px;font-weight:800;margin:30px 0 12px}
.grid2{grid-template-columns:repeat(2,1fr);max-width:820px}
.lay{background:#fff;border:1px solid #DEDEE4;border-radius:12px;padding:16px}
.wire{margin:10px 0;height:96px;border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:5px;background:#fff}
.wire i{display:block;border-radius:3px;background:#E6E6EB}
.wire .w3{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;flex:1}
.wire .w4{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}
.wire .w4 i{height:14px}
.wire .wmo{display:grid;grid-template-columns:2fr 1fr;grid-template-rows:1fr 1fr;gap:5px;flex:1}
.wire .wmo .big{grid-row:span 2}
.wire .wsp{display:flex;gap:5px;flex:1}
.wire .wsp .side{width:24%}
.wire .wsp .half{width:40%}
.wire .wcol{display:flex;flex-direction:column;gap:5px;flex:1}
.wire .wcol i{flex:1}
.lay-kv{display:grid;grid-template-columns:78px 1fr;gap:4px 10px;font-size:11.5px;line-height:1.5}
.lay-kv dt{color:#6B6F76}
.lay-kv dd{color:#1F2024}
.lay-fit{margin-top:8px;font-size:11.5px;color:#6B6F76}
.dt{margin-bottom:4px}.dm{margin-bottom:14px}
.drow{display:flex;gap:8px;margin-bottom:16px}
.dbadge{font-size:11px;font-weight:700;padding:4px 10px}
.dfield{font-size:13px;padding:9px 12px;margin-bottom:14px}
.dbtns{display:flex;gap:8px}
.db,.db2{font-size:13px;font-weight:700;padding:9px 16px}
.dnums{display:flex;gap:26px;margin-top:20px}
.dnums div{display:flex;flex-direction:column}
.dnums span{font-size:12px;font-weight:600;margin-top:2px}
.dsw{display:flex;gap:5px;margin-top:20px}
.dsw i{width:26px;height:26px;border-radius:6px;border:1px solid rgba(0,0,0,.08)}
</style></head><body>
<h1>가이드 프리셋 · 레이아웃 프리셋</h1>
<p class="sub">색과 화면 뼈대를 따로 드립니다. 원하는 조합을 스펙팩과 함께 AI에 넣으면 그 모습으로 만들어집니다.<br>
아래 글자는 자리표시용이며, 색·굵기·모서리·여백과 뼈대가 어떻게 달라지는지 보시면 됩니다.</p>
<p class="note"><b>가이드 프리셋 ${chosen.length}벌과 레이아웃 프리셋 ${chosenLayouts.length}벌을 따로 드립니다.</b>
짝이 정해져 있지 않아 마음에 드는 대로 섞으시면 됩니다 —
가이드 ${chosen.length}종 × 레이아웃 ${chosenLayouts.length}종 = <b>${chosen.length * chosenLayouts.length}가지</b>.
쓰실 때는 <b>가이드 프리셋 1종 + 레이아웃 프리셋 1종</b>을 스펙팩과 함께 AI에 넣으세요.</p>

<h2 class="sec">가이드 프리셋 ${chosen.length}벌 — 색 · 글꼴 · 모서리</h2>
<div class="grid">${chosen.map(card).join("")}</div>

<h2 class="sec">레이아웃 프리셋 ${chosenLayouts.length}벌 — 무엇을 어디에 놓을지</h2>
<div class="grid grid2">${chosenLayouts.map((l, i) => layoutCard(l, String.fromCharCode(65 + i))).join("")}</div>
</body></html>`;

writeFileSync(`${OUT}/프리셋_미리보기.html`, html, "utf8");
console.log("  ✔ 프리셋_미리보기.html");

// 레이아웃 프리셋 2벌 — 색과 짝짓지 않는다.
chosenLayouts.forEach((l, i) => {
  const no = String.fromCharCode(65 + i); // A, B
  const base = `${OUT}/레이아웃_${no}_${l.label.replace(/\s/g, "")}`;
  writeFileSync(`${base}.md`, layoutMd(l, no), "utf8");
  writeFileSync(`${base}.json`, JSON.stringify(layoutTokens(l, no), null, 2), "utf8");
  console.log(`  ✔ 레이아웃_${no}_${l.label} (.md / .json)`);
});
console.log(`\n완료 → ${OUT}`);
