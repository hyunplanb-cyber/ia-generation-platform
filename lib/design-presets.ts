// 디자인 프리셋 — 브리프의 "디자인 컨셉" 선택과 1:1로 이어진다.
// 선택한 스타일의 디자인 시스템 스펙(색·타이포·컴포넌트)을 마크다운으로 만든다
// (AI 코딩 도구에 붙여 넣으면 그 스타일로 만들어짐).
//
// AI팩 zip과는 별개다 — /dashboard/[projectId]/preset 에서 따로 만들고 따로 받는다.
// 생성·다운로드 크레딧도 각각 차감한다(application/preset.ts).
// AI를 쓰지 않는다. 아래 데이터가 그대로 산출물이 되므로 모델을 바꿔도 결과가 같다.
// UI·서버 공용(순수 데이터/문자열).

export type DesignKey = "navy" | "mono" | "pastel" | "retro" | "forest" | "coral";

/**
 * 만들기(브리프) 화면에서 보여줄 컨셉 — 여섯이 아니라 셋만.
 *
 * 여섯을 다 늘어놓으니 만들기 첫 화면이 복잡해 보이고, 고르는 것 자체가 문턱이 됐다
 * (2026-08-04). 여기서는 방향만 크게 잡고, 세밀한 색·글꼴은 디자인 프리셋에서 고른다.
 * 프리셋 화면에는 여섯 종을 그대로 다 보여준다.
 */
export const BRIEF_DESIGN_KEYS: DesignKey[] = ["navy", "mono", "pastel"];

// concept 텍스트가 프로젝트에 저장되고, 그걸로 프리셋을 되찾는다.
// swatches: 카드에 보여줄 대표 색(주색·강조·본문·배경 순).
export const DESIGN_OPTIONS: {
  key: DesignKey;
  title: string;
  desc: string;
  concept: string;
  swatches: string[];
}[] = [
  {
    key: "navy",
    title: "모던 네이비",
    desc: "신뢰감 있고 정돈된, 실무형",
    concept: "모던하고 신뢰감 있는 네이비 톤. 정보가 잘 정돈된 실무형 디자인, 카드와 표 중심.",
    swatches: ["#2B4A8B", "#FF7A30", "#16233F", "#F5F7FA"],
  },
  {
    key: "mono",
    title: "미니멀 모노",
    desc: "색을 뺀 여백·활자 중심",
    concept: "색을 절제한 미니멀 모노톤. 넉넉한 여백과 활자 위계로 정리된 깔끔한 디자인.",
    swatches: ["#111111", "#767676", "#E5E5E5", "#FFFFFF"],
  },
  {
    key: "pastel",
    title: "소프트 파스텔",
    desc: "부드럽고 친근한 분위기",
    concept: "부드럽고 친근한 파스텔 톤. 둥근 모서리와 넉넉한 여백으로 편안한 느낌.",
    swatches: ["#5B4FE5", "#FFD54A", "#DFF5EC", "#FAFAFA"],
  },
  {
    key: "retro",
    title: "레트로 페이퍼",
    desc: "종이 질감 · 오렌지 & 틸",
    concept: "종이 질감의 따뜻한 레트로 톤. 크림색 배경에 오렌지·틸 포인트, 편집숍 같은 감성.",
    swatches: ["#DE6F26", "#0E6F60", "#2A2320", "#F7F1E6"],
  },
  {
    key: "forest",
    title: "내추럴 그린",
    desc: "차분한 자연 · 친환경",
    concept: "차분한 그린 톤의 내추럴 디자인. 자연·건강·친환경 느낌, 넉넉한 여백.",
    swatches: ["#15803D", "#65A30D", "#1C2B22", "#F3F7F2"],
  },
  {
    key: "coral",
    title: "코럴 선셋",
    desc: "밝고 따뜻한 생기",
    concept: "밝고 따뜻한 코럴 톤. 둥근 모서리와 생기 있는 색으로 친근한 느낌.",
    swatches: ["#F0654F", "#F59E0B", "#33221E", "#FFF6F3"],
  },
];

interface Preset {
  key: DesignKey;
  name: string;
  tagline: string;
  font: string;
  colors: Record<string, string>;
  scale: [string, string][]; // 용도, 값
  radius: string;
  components: [string, string][];
}

const PRESETS: Record<DesignKey, Preset> = {
  navy: {
    key: "navy",
    name: "모던 네이비",
    tagline: "신뢰감과 밀도. 실무형 서비스의 기본값.",
    font: "Pretendard (대체: Noto Sans KR). 숫자는 tabular-nums로 정렬.",
    colors: {
      "primary(주요 액션)": "#2B4A8B",
      "accent(강조·배지)": "#FF7A30",
      "background(페이지)": "#F5F7FA",
      "surface(카드)": "#FFFFFF",
      "text(본문)": "#16233F",
      "text-muted(보조)": "#5A6B8C",
      "border(구분선)": "#DFE4EC",
    },
    scale: [
      ["페이지 제목", "32px / 700"],
      ["섹션 제목", "22px / 700"],
      ["카드 제목", "18px / 600"],
      ["본문", "15px / 400"],
      ["보조 설명", "13px / 400"],
    ],
    radius: "카드 12px · 버튼 8px · 입력 8px · 배지 6px",
    components: [
      ["버튼(주요)", "primary 배경, 흰 글자, 높이 40px, 굵기 600"],
      ["카드", "surface 배경, border 1px, 그림자 1단계, 헤더에 구분선"],
      ["표", "헤더는 background 색 채움, 행 구분 border 1px, 행 높이 44px"],
    ],
  },
  mono: {
    key: "mono",
    name: "미니멀 모노",
    tagline: "여백과 활자. 색을 빼면 내용이 남는다.",
    font: "Pretendard (대체: Inter + Noto Sans KR). 크기보다 굵기·여백으로 위계.",
    colors: {
      "primary(주요 액션)": "#111111",
      "accent(강조)": "#111111",
      "background(페이지)": "#FFFFFF",
      "surface(카드)": "#FFFFFF",
      "text(본문)": "#111111",
      "text-muted(보조)": "#767676",
      "border(구분선)": "#E5E5E5",
    },
    scale: [
      ["페이지 제목", "28px / 600"],
      ["섹션 제목", "18px / 600"],
      ["카드 제목", "15px / 600"],
      ["본문", "14px / 400"],
      ["보조 설명", "13px / 400"],
    ],
    radius: "카드 6px · 버튼 6px · 입력 6px · 배지 4px",
    components: [
      ["버튼(주요)", "검정 배경, 흰 글자, 높이 36px, 굵기 500"],
      ["카드", "border 1px만. 그림자·배경색 없음, 여백으로 구분"],
      ["표", "헤더 하단 border 2px, 행 구분 1px, 행 높이 40px"],
    ],
  },
  pastel: {
    key: "pastel",
    name: "소프트 파스텔",
    tagline: "부드럽고 친근하게. 처음 쓰는 사람도 겁먹지 않게.",
    font: "Pretendard (대체: Paperlogy). 제목을 과감히 키우고 자간을 좁혀 경쾌하게.",
    colors: {
      "primary(주요 액션)": "#5B4FE5",
      "accent(강조)": "#FFD54A",
      "background(페이지)": "#FAFAFA",
      "surface(카드)": "#FFFFFF",
      "text(본문)": "#1F2024",
      "text-muted(보조)": "#6B6F76",
      "pastel-mint": "#DFF5EC",
      "pastel-lavender": "#EDE9FE",
    },
    scale: [
      ["페이지 제목", "36px / 800"],
      ["섹션 제목", "24px / 700"],
      ["카드 제목", "18px / 700"],
      ["본문", "15px / 500"],
      ["보조 설명", "14px / 500"],
    ],
    radius: "카드 16px · 버튼 12px · 입력 12px · 배지 999px(알약)",
    components: [
      ["버튼(주요)", "primary 배경, 흰 글자, 높이 44px, 굵기 700"],
      ["카드", "surface 배경, radius 16px, 부드러운 그림자, 테두리는 연하게"],
      ["표", "헤더 배경 #F7F7F9, 행 구분 연하게, 행 높이 48px"],
    ],
  },
  retro: {
    key: "retro",
    name: "레트로 페이퍼",
    tagline: "종이 질감과 따뜻한 오렌지·틸. 편집숍 같은 감성.",
    font: "제목은 명조/Paperlogy로 개성 있게, 본문은 Pretendard로 읽기 편하게.",
    colors: {
      "primary(주요 액션)": "#DE6F26",
      "accent(강조·배지)": "#0E6F60",
      "background(페이지)": "#F7F1E6",
      "surface(카드)": "#FFFDF8",
      "text(본문)": "#2A2320",
      "text-muted(보조)": "#6B5E4F",
      "border(구분선)": "#E4D9C4",
    },
    scale: [
      ["페이지 제목", "34px / 800"],
      ["섹션 제목", "22px / 700"],
      ["카드 제목", "18px / 700"],
      ["본문", "15px / 400"],
      ["보조 설명", "13px / 400"],
    ],
    radius: "카드 10px · 버튼 8px · 입력 8px · 배지 6px",
    components: [
      ["버튼(주요)", "오렌지 배경, 흰 글자, 높이 42px, 굵기 700"],
      ["카드", "크림 surface, 연한 갈색 border 1px, 그림자 없이 종이 느낌"],
      ["표", "헤더 배경 진한 크림, 행 구분 1px, 행 높이 46px"],
    ],
  },
  forest: {
    key: "forest",
    name: "내추럴 그린",
    tagline: "차분한 그린. 자연·건강·친환경 서비스에 잘 맞는다.",
    font: "Pretendard (대체: Noto Sans KR). 넉넉한 줄간격으로 편안하게.",
    colors: {
      "primary(주요 액션)": "#15803D",
      "accent(강조·배지)": "#65A30D",
      "background(페이지)": "#F3F7F2",
      "surface(카드)": "#FFFFFF",
      "text(본문)": "#1C2B22",
      "text-muted(보조)": "#5B6B60",
      "border(구분선)": "#DBE7DC",
    },
    scale: [
      ["페이지 제목", "32px / 700"],
      ["섹션 제목", "22px / 700"],
      ["카드 제목", "18px / 600"],
      ["본문", "15px / 400"],
      ["보조 설명", "13px / 400"],
    ],
    radius: "카드 12px · 버튼 10px · 입력 10px · 배지 8px",
    components: [
      ["버튼(주요)", "그린 배경, 흰 글자, 높이 40px, 굵기 600"],
      ["카드", "surface 배경, border 1px, 은은한 그림자"],
      ["표", "헤더 배경 연한 그린, 행 구분 1px, 행 높이 44px"],
    ],
  },
  coral: {
    key: "coral",
    name: "코럴 선셋",
    tagline: "밝고 따뜻한 코럴. 생기 있고 친근한 브랜드에.",
    font: "Paperlogy 또는 Pretendard. 제목을 둥글고 크게, 경쾌하게.",
    colors: {
      "primary(주요 액션)": "#F0654F",
      "accent(강조·배지)": "#F59E0B",
      "background(페이지)": "#FFF6F3",
      "surface(카드)": "#FFFFFF",
      "text(본문)": "#33221E",
      "text-muted(보조)": "#8A6F68",
      "border(구분선)": "#F6E0D8",
    },
    scale: [
      ["페이지 제목", "34px / 800"],
      ["섹션 제목", "23px / 700"],
      ["카드 제목", "18px / 700"],
      ["본문", "15px / 500"],
      ["보조 설명", "14px / 500"],
    ],
    radius: "카드 18px · 버튼 14px · 입력 14px · 배지 999px(알약)",
    components: [
      ["버튼(주요)", "코럴 배경, 흰 글자, 높이 44px, 굵기 700"],
      ["카드", "surface 배경, radius 18px, 부드러운 그림자"],
      ["표", "헤더 배경 연한 코럴, 행 구분 연하게, 행 높이 48px"],
    ],
  },
};

// 저장된 디자인 컨셉 텍스트(또는 키) → 프리셋. 못 찾으면 navy 기본.
export function presetForConcept(concept: string | null | undefined): Preset {
  const opt = DESIGN_OPTIONS.find((d) => d.concept === concept || d.key === concept);
  return PRESETS[opt?.key ?? "navy"];
}

/* ─────────────────────────────────────────────────────────────
   레이아웃 골격
   색만 정해 주면 테마를 바꿔도 뼈대가 똑같아서 결국 같은 사이트로 보인다.
   실제로 여행 판매본과 뷰티 판매본을 만들어 보니 색만 다르고 히어로·목록·
   내비가 똑같았다(2026-08-03). 그래서 "무엇을 어디에 놓을지"를 프리셋에 함께 넣는다.
   ───────────────────────────────────────────────────────────── */
export type LayoutKey = "search" | "showcase" | "list" | "split" | "console";

export const LAYOUTS: {
  key: LayoutKey;
  label: string;
  /** 이 골격을 한 줄로 */
  tagline: string;
  /** 첫 화면 위쪽 */
  hero: string;
  /** 목록 화면 */
  list: string;
  /** 내비게이션 */
  nav: string;
  /** 상세 화면 */
  detail: string;
  /** 이 골격이 어울리는 곳 */
  fits: string;
}[] = [
  {
    key: "search",
    label: "검색 중심형",
    tagline: "찾는 게 분명한 서비스. 검색창이 첫 화면의 주인공.",
    hero: "화면 폭을 꽉 채운 배경 위에 큰 검색바 1개(입력칸 2~3개 + 검색 버튼). 아래에 숫자 지표 3개.",
    list: "카드 그리드 3~4열. 카드마다 이미지 → 제목 → 보조정보 → 가격 순.",
    nav: "상단 가로 GNB 한 줄. 로고 · 검색 · 메뉴 · 로그인.",
    detail: "본문 왼쪽 + 오른쪽에 따라다니는 요약·액션 카드(sticky).",
    fits: "예약·검색이 시작점인 서비스(숙소·강의·매장 찾기)",
  },
  {
    key: "showcase",
    label: "사진 중심형",
    tagline: "결과물이 곧 상품. 사진을 먼저 보여주고 글은 나중에.",
    hero: "검색바 없이 사진 모자이크(큰 1장 + 작은 4장). 문구는 사진 아래에 겹치지 않게.",
    list: "매거진형 2열. 큰 이미지 위에 제목·태그를 얹고 설명은 짧게.",
    nav: "상단 가로 GNB + 그 아래 카테고리 줄(2단 헤더).",
    detail: "상단 전체 폭 갤러리 → 아래 정보. 액션은 하단 고정 바.",
    fits: "보이는 게 중요한 서비스(뷰티·인테리어·포트폴리오·여행)",
  },
  {
    key: "list",
    label: "목록 중심형",
    tagline: "훑어보고 비교한다. 한 화면에 많이 담는다.",
    hero: "히어로를 두지 않는다. 제목 + 필터 칩 줄로 바로 시작.",
    list: "좌측 필터 패널 + 우측 가로 리스트 행(썸네일 왼쪽, 정보 오른쪽, 액션 끝).",
    nav: "상단 가로 GNB + 목록 화면에서만 좌측 필터 사이드바.",
    detail: "상단 요약 바 + 탭으로 나눈 본문.",
    fits: "비교해서 고르는 서비스(중개·구인·상품 비교)",
  },
  {
    key: "split",
    label: "좌우 분할형",
    tagline: "말할 게 분명하다. 왼쪽은 글, 오른쪽은 행동.",
    hero: "좌우 2단. 왼쪽에 큰 제목과 설명, 오른쪽에 폼 또는 대표 이미지.",
    list: "2열 카드. 여백을 넓게 두고 카드 안은 글자 위계로만 나눈다.",
    nav: "상단 가로 GNB. 로고 왼쪽, 액션 버튼 오른쪽 끝.",
    detail: "본문 한 단(최대 폭 760px) + 하단 고정 액션 바.",
    fits: "설득이 먼저인 서비스(랜딩·구독·B2B 소개)",
  },
  {
    key: "console",
    label: "대시보드형",
    tagline: "매일 쓰는 도구. 지표부터 보이고 좌측 메뉴로 이동한다.",
    hero: "히어로 없음. 화면 위쪽에 지표 카드 4개.",
    list: "표 중심. 헤더 고정, 행 높이 일정, 상태는 배지로.",
    nav: "좌측 세로 사이드바(그룹 제목 + 항목) + 상단에는 계정만.",
    detail: "좌 본문 + 우 액션 패널 2단. 상태 변경 버튼을 우측에 모은다.",
    fits: "관리자·백오피스·사장님 화면",
  },
];

export const layoutByKey = (k: LayoutKey) => LAYOUTS.find((l) => l.key === k) ?? LAYOUTS[0];

/** 테마별 기본 골격. 셋을 나란히 놓았을 때 색뿐 아니라 구조도 갈리도록 골랐다. */
export const DEFAULT_LAYOUT: Record<DesignKey, LayoutKey> = {
  navy: "console",
  mono: "split",
  pastel: "search",
  retro: "showcase",
  forest: "list",
  coral: "showcase",
};

/* ─────────────────────────────────────────────────────────────
   이미지 자리 규칙
   사진이 없는 프로토타입에서 이미지 자리를 테마 색으로 채우면 화면이 그 색
   덩어리로 뒤덮여 "빨간 사이트"처럼 보인다. 테마와 무관한 옅은 파스텔로 고정하고,
   무엇이 들어갈 자리인지와 권장 크기를 글자로 적는다.
   ───────────────────────────────────────────────────────────── */
export const IMAGE_PLACEHOLDER = {
  /** 옅은 파스텔 5종을 돌려 쓴다 — 카드가 전부 같은 색이 되지 않게만 */
  tones: ["#EEF2F7", "#F2EFF7", "#EDF4F1", "#F7F1EC", "#F2F4F7"],
  border: "#E3E8F0",
  text: "#8B94A6",
  /** 자리 안에 적는 글자 */
  labelFormat: "이미지 영역 (무엇 · 권장 가로×세로)",
  examples: [
    "이미지 영역 (매장 대표 · 권장 1200×900)",
    "이미지 영역 (프로필 · 권장 400×400)",
    "이미지 영역 (배너 · 권장 1600×600)",
  ],
  rule: [
    "이미지 자리는 테마 색으로 칠하지 않는다. 옅은 파스텔 한 톤 + 1px 테두리로 둔다.",
    "자리 안에 무엇이 들어갈 이미지인지와 권장 크기를 글자로 적는다.",
    // 400×400이라 적어 놓고 납작한 타원으로 그려진 프로필 사진이 나왔다(2026-08-04).
    // 적은 값과 보이는 모양이 다르면, 받은 사람은 그 숫자를 못 믿는다.
    "적어 둔 크기의 **비율을 실제로 지킨다** — `400×400`이라 적었으면 정사각으로 보여야 한다(aspect-ratio).",
    "특히 프로필·썸네일처럼 크기가 고정된 자리는, 가로로 나란히 놓아도 늘어나지 않게 한다. 목록·행 안에 넣을 때 `flex`가 잡아당겨 타원이 되는 일이 잦으니, 만든 뒤 실제로 열어 모양을 확인한다.",
    "썸네일처럼 작아서 글자가 안 들어가면 크기만 적거나 아이콘 하나만 둔다.",
    "실제 사진을 넣기 전까지 이 규칙을 유지한다 — 그래야 어디에 무엇을 넣어야 하는지 보인다.",
  ],
} as const;


/** 레이아웃 골격 절 — 프리셋 문서 두 종류가 같은 문장을 쓴다. */
function layoutSection(key: LayoutKey, no: number): string[] {
  const l = layoutByKey(key);
  return [
    `## ${no}. 레이아웃 골격 — ${l.label}`,
    "",
    `> ${l.tagline}`,
    "",
    "| 자리 | 어떻게 |",
    "| --- | --- |",
    `| 첫 화면 위쪽 | ${l.hero} |`,
    `| 목록 화면 | ${l.list} |`,
    `| 내비게이션 | ${l.nav} |`,
    `| 상세 화면 | ${l.detail} |`,
    "",
    `어울리는 곳: ${l.fits}`,
    "",
    "**색만 맞추고 이 골격을 무시하면 어느 테마로 만들어도 같은 사이트가 나옵니다.** 뼈대를 먼저 이 표대로 잡고 색을 입히세요.",
    "",
  ];
}

/** 이미지 자리 절 — 사진이 없는 단계에서 무엇을 어떻게 그릴지. */
function imageSection(no: number): string[] {
  return [
    `## ${no}. 이미지 자리`,
    "",
    "아직 사진이 없으니 이미지 자리는 **테마 색이 아니라 옅은 파스텔**로 채우세요. 테마 색으로 칠하면 화면이 그 색 덩어리로 뒤덮여 디자인이 안 보입니다.",
    "",
    "| 항목 | 값 |",
    "| --- | --- |",
    `| 배경 | ${IMAGE_PLACEHOLDER.tones.map((c) => `\`${c}\``).join(" · ")} 중 하나(카드마다 돌려 씀) |`,
    `| 테두리 | \`${IMAGE_PLACEHOLDER.border}\` 1px |`,
    `| 글자색 | \`${IMAGE_PLACEHOLDER.text}\` · 13px |`,
    `| 적을 글자 | \`${IMAGE_PLACEHOLDER.labelFormat}\` |`,
    "",
    "예시: " + IMAGE_PLACEHOLDER.examples.map((e) => `\`${e}\``).join(" · "),
    "",
    ...IMAGE_PLACEHOLDER.rule.map((r) => `- ${r}`),
    "",
  ];
}

// 프리셋을 AI 코딩 도구에 붙여 넣을 마크다운 스펙으로.
export function buildPresetMarkdown(p: Preset): string {
  const L: string[] = [];
  L.push(`# 디자인 프리셋 — ${p.name}`);
  L.push("");
  L.push(`> ${p.tagline}`);
  L.push("");
  L.push("AI 코딩 도구(Claude Code·Cursor 등)에 이 파일을 함께 넣고 “이 디자인 규칙대로 만들어줘”라고 주문하세요.");
  L.push("");
  L.push("## 1. 색상");
  L.push("");
  L.push("| 용도 | 값 |");
  L.push("| --- | --- |");
  for (const [k, v] of Object.entries(p.colors)) L.push(`| ${k} | \`${v}\` |`);
  L.push("");
  L.push("## 2. 타이포그래피");
  L.push("");
  L.push(`- 폰트: ${p.font}`);
  L.push("");
  L.push("| 용도 | 크기 / 굵기 |");
  L.push("| --- | --- |");
  for (const [a, b] of p.scale) L.push(`| ${a} | ${b} |`);
  L.push("");
  L.push("## 3. 모서리");
  L.push("");
  L.push(`- ${p.radius}`);
  L.push("");
  L.push("## 4. 컴포넌트 규칙");
  L.push("");
  L.push("| 컴포넌트 | 규칙 |");
  L.push("| --- | --- |");
  for (const [a, b] of p.components) L.push(`| ${a} | ${b} |`);
  L.push("");
  L.push(...layoutSection(DEFAULT_LAYOUT[p.key], 5));
  L.push(...imageSection(6));
  L.push("화면마다 다른 스타일을 쓰지 말고, 위 규칙을 끝까지 일관되게 적용해줘.");
  L.push("");
  return L.join("\n");
}

// ── 상세 프리셋 설정(사용자가 더 고르는 항목) + 상세 디자인 시스템 생성 ──────────

export type FontFeel =
  | "pretendard"
  | "noto-sans"
  | "gmarket"
  | "noto-serif"
  | "nanum-myeongjo"
  | "paperlogy";
export type RadiusFeel = "sharp" | "normal" | "round";
export type Density = "cozy" | "compact";

export interface PresetConfig {
  style: DesignKey; // 큰 방향(브리프에서 고른 컨셉)
  primary: string; // 주 색상(hex)
  font: FontFeel;
  radius: RadiusFeel;
  density: Density;
  dark: boolean;
  /** 화면 뼈대. 색만 바꾸면 어느 테마든 같은 사이트로 보여서 함께 정한다. */
  layout: LayoutKey;
  /**
   * 두 번째 테마. 있으면 프리셋이 두 벌 나온다.
   *
   * 한 벌만 주면 "이게 맞나" 판단할 수가 없다 — 나란히 놓아야 고를 수 있다(2026-08-04).
   * 글꼴·모서리·밀도·레이아웃은 두 벌이 같이 쓰고, **테마와 색만 다르다.**
   * 판매팩의 가이드 3종도 같은 방식이라(사양 고정, 테마만 다름) 결과물이 서로 닮는다.
   */
  styleB?: DesignKey;
  /** 두 번째 벌의 포인트 색. 없으면 그 테마의 기본 색을 쓴다. */
  primaryB?: string;
}

/** 두 벌짜리 프리셋에서 두 번째 벌의 설정을 만든다(테마와 주색만 갈린다). */
export function secondPreset(cfg: PresetConfig): PresetConfig | null {
  if (!cfg.styleB || cfg.styleB === cfg.style) return null;
  return {
    ...cfg,
    style: cfg.styleB,
    primary: cfg.primaryB || PRIMARY_SWATCHES_BY_STYLE[cfg.styleB][0],
    styleB: undefined,
    primaryB: undefined,
  };
}

// 고른 "큰 방향"에 어울리는 주 색상 후보. 각 세트의 첫 색이 그 방향의 기본 주색.
export const PRIMARY_SWATCHES_BY_STYLE: Record<DesignKey, string[]> = {
  navy: ["#2B4A8B", "#1E3A6E", "#3B5BA5", "#2563EB", "#0E7490", "#FF7A30"],
  mono: ["#111111", "#2B2B2B", "#454545", "#6B7280", "#0E6F60", "#DE6F26"],
  pastel: ["#5B4FE5", "#7C6FF0", "#EC4899", "#F59E0B", "#14B8A6", "#0EA5E9"],
  retro: ["#DE6F26", "#C2410C", "#0E6F60", "#B45309", "#A63D2A", "#1F6F5C"],
  forest: ["#15803D", "#166534", "#0E7C66", "#65A30D", "#4D7C0F", "#0E7490"],
  coral: ["#F0654F", "#EF4444", "#FB7185", "#F97316", "#F59E0B", "#E11D48"],
};

export function primarySwatchesFor(style: DesignKey): string[] {
  return PRIMARY_SWATCHES_BY_STYLE[style] ?? PRIMARY_SWATCHES_BY_STYLE.navy;
}
// 웹에서 많이 쓰는 한글 폰트 제안. label=버튼 표기, name=문서에 적을 폰트명, family=CSS.
export const FONT_FEELS: { key: FontFeel; label: string; name: string; family: string }[] = [
  { key: "pretendard", label: "프리텐다드", name: "Pretendard", family: "Pretendard, 'Noto Sans KR', sans-serif" },
  { key: "noto-sans", label: "본고딕", name: "Noto Sans KR", family: "'Noto Sans KR', sans-serif" },
  { key: "gmarket", label: "지마켓 산스", name: "Gmarket Sans", family: "'Gmarket Sans', Pretendard, sans-serif" },
  { key: "noto-serif", label: "본명조", name: "Noto Serif KR", family: "'Noto Serif KR', serif" },
  { key: "nanum-myeongjo", label: "나눔명조", name: "Nanum Myeongjo", family: "'Nanum Myeongjo', serif" },
  { key: "paperlogy", label: "페이퍼로지", name: "Paperlogy", family: "Paperlogy, Pretendard, sans-serif" },
];

export function fontById(key: string): (typeof FONT_FEELS)[number] {
  return FONT_FEELS.find((f) => f.key === key) ?? FONT_FEELS[0];
}
export const RADIUS_FEELS: {
  key: RadiusFeel;
  label: string;
  card: string;
  button: string;
  badge: string;
}[] = [
  { key: "sharp", label: "각진", card: "4px", button: "4px", badge: "3px" },
  { key: "normal", label: "기본", card: "12px", button: "8px", badge: "6px" },
  { key: "round", label: "둥근", card: "20px", button: "14px", badge: "999px" },
];
export const DENSITIES: {
  key: Density;
  label: string;
  cardPad: string;
  rowH: string;
  sectionGap: string;
}[] = [
  { key: "cozy", label: "넉넉하게", cardPad: "24px", rowH: "48px", sectionGap: "40px" },
  { key: "compact", label: "컴팩트", cardPad: "16px", rowH: "40px", sectionGap: "28px" },
];

// 방향별 기본 글꼴/모서리 느낌.
const DEFAULT_FONT: Record<DesignKey, FontFeel> = {
  navy: "pretendard",
  mono: "pretendard",
  pastel: "paperlogy",
  retro: "noto-serif",
  forest: "noto-sans",
  coral: "paperlogy",
};
const DEFAULT_RADIUS: Record<DesignKey, RadiusFeel> = {
  navy: "normal",
  mono: "sharp",
  pastel: "round",
  retro: "normal",
  forest: "normal",
  coral: "round",
};

export function defaultPresetConfig(style: DesignKey): PresetConfig {
  return {
    style,
    primary: primarySwatchesFor(style)[0],
    font: DEFAULT_FONT[style] ?? "sans",
    radius: DEFAULT_RADIUS[style] ?? "normal",
    density: "cozy",
    dark: false,
    layout: DEFAULT_LAYOUT[style] ?? "search",
  };
}

/**
 * 판매 AI팩에 넣는 "기본 프리셋 3종"의 사양(2026-08-01 확정).
 *
 * 유저가 만드는 프리셋은 글꼴·모서리·밀도까지 본인이 고른 값이 들어간다.
 * 판매본은 손대지 않은 기본값이다.
 *   포인트 색상 = 그 테마의 첫 번째 색 · 글꼴 = 프리텐다드
 *   모서리 = 테마 기본값 · 밀도 = 넉넉하게 · 모드 = 라이트
 *
 * 모서리만 테마 기본값을 그대로 둔다 — 파스텔의 둥근 모서리, 모노의 각진 모서리는
 * 그 테마의 성격이라, 통일하면 셋의 차이가 색뿐이 되어 나란히 놓았을 때 구분이 안 된다.
 * 글꼴은 반대다. 판매본에 페이퍼로지·명조가 섞이면 "이 폰트를 어디서 받나"가 먼저 걸린다.
 */
export function salePresetConfig(style: DesignKey): PresetConfig {
  return { ...defaultPresetConfig(style), font: "pretendard" };
}

export function parsePresetConfig(json: string | null, concept?: string | null): PresetConfig {
  if (json) {
    try {
      const c = JSON.parse(json) as Partial<PresetConfig>;
      if (c.style) {
        const cfg = { ...defaultPresetConfig(c.style), ...c } as PresetConfig;
        // 예전에 저장된 글꼴 값(sans/serif/rounded 등)은 기본값으로 교체.
        if (!FONT_FEELS.some((f) => f.key === cfg.font)) cfg.font = DEFAULT_FONT[cfg.style] ?? "pretendard";
        // 레이아웃을 넣기 전에 저장된 프리셋에는 이 값이 없다. 테마 기본값으로 채운다.
        if (!LAYOUTS.some((l) => l.key === cfg.layout)) cfg.layout = DEFAULT_LAYOUT[cfg.style] ?? "search";
        // 두 번째 테마가 첫 번째와 같거나 이상한 값이면 없는 것으로 본다(한 벌짜리).
        if (cfg.styleB && (cfg.styleB === cfg.style || !DESIGN_OPTIONS.some((d) => d.key === cfg.styleB))) {
          cfg.styleB = undefined;
        }
        return cfg;
      }
    } catch {
      /* ignore */
    }
  }
  return defaultPresetConfig(presetForConcept(concept).key);
}

// 주색상에서 밝은/진한 단계를 파생한다(색 섞기).
function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}
function toRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}
function toHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((n) => clamp(n).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}
function mix(hex: string, t: [number, number, number], amt: number): string {
  const [r, g, b] = toRgb(hex);
  return toHex(r + (t[0] - r) * amt, g + (t[1] - g) * amt, b + (t[2] - b) * amt);
}
const WHITE: [number, number, number] = [255, 255, 255];
const BLACK: [number, number, number] = [0, 0, 0];

function palette(primary: string): Record<string, string> {
  return {
    "primary-50": mix(primary, WHITE, 0.9),
    "primary-100": mix(primary, WHITE, 0.8),
    "primary-200": mix(primary, WHITE, 0.6),
    "primary-500 (기본)": primary,
    "primary-600 (hover)": mix(primary, BLACK, 0.12),
    "primary-700 (active)": mix(primary, BLACK, 0.28),
  };
}

// 설정을 바탕으로 상세 디자인 시스템 문서(마크다운)를 만든다.
export function buildDetailedPresetMarkdown(cfg: PresetConfig, projectName?: string): string {
  const base = PRESETS[cfg.style];
  const font = fontById(cfg.font);
  const rad = RADIUS_FEELS.find((r) => r.key === cfg.radius)!;
  const den = DENSITIES.find((d) => d.key === cfg.density)!;
  const pal = palette(cfg.primary);
  const bg = cfg.dark ? "#0E1116" : "#FFFFFF";
  const surface = cfg.dark ? "#171B22" : "#FFFFFF";
  const text = cfg.dark ? "#E8EAED" : "#16181D";
  const muted = cfg.dark ? "#9AA0A8" : "#6B7280";
  const border = cfg.dark ? "#2A2F37" : "#E5E7EB";

  const L: string[] = [];
  L.push(`# 디자인 시스템 — ${base.name} 기반${projectName ? ` · ${projectName}` : ""}`);
  L.push("");
  L.push(`> ${base.tagline}`);
  L.push("");
  L.push(
    `설정: 주색상 \`${cfg.primary}\` · 폰트 ${font.label} · 모서리 ${rad.label} · 밀도 ${den.label} · ${cfg.dark ? "다크모드" : "라이트모드"} · 레이아웃 ${layoutByKey(cfg.layout).label}`,
  );
  L.push("");
  L.push("AI 코딩 도구(Claude Code·Cursor 등)에 이 파일을 넣고 “이 디자인 시스템대로 만들어줘”라고 주문하세요.");
  L.push("");
  L.push("## 1. 색 팔레트");
  L.push("");
  L.push("| 토큰 | 값 |");
  L.push("| --- | --- |");
  for (const [k, v] of Object.entries(pal)) L.push(`| ${k} | \`${v}\` |`);
  L.push(`| background | \`${bg}\` |`);
  L.push(`| surface(카드) | \`${surface}\` |`);
  L.push(`| text | \`${text}\` |`);
  L.push(`| text-muted | \`${muted}\` |`);
  L.push(`| border | \`${border}\` |`);
  L.push("| success / warning / danger | `#16A34A` / `#D97706` / `#DC2626` |");
  L.push("");
  L.push("## 2. 타이포그래피");
  L.push("");
  L.push(`- 폰트: **${font.name}** (${font.label}) — \`${font.family}\``);
  L.push(
    "  · 이 폰트를 쓰려면 웹폰트로 불러오거나(link / @font-face) 로컬에 설치돼 있어야 제대로 보입니다.",
  );
  L.push("");
  L.push("| 용도 | 크기 / 굵기 |");
  L.push("| --- | --- |");
  L.push("| 페이지 제목 | 32px / 800 |");
  L.push("| 섹션 제목 | 22px / 700 |");
  L.push("| 카드 제목 | 18px / 700 |");
  L.push("| 본문 | 15px / 400 (줄높이 1.6) |");
  L.push("| 보조 | 13px / 400 |");
  L.push("| 버튼 | 14px / 600 |");
  L.push("");
  L.push("## 3. 간격 · 모서리 · 그림자");
  L.push("");
  L.push(`- 간격 스케일: 4·8·12·16·24·32·48 (카드 내부 ${den.cardPad}, 섹션 간격 ${den.sectionGap})`);
  L.push(`- 모서리: 카드 ${rad.card} · 버튼 ${rad.button} · 배지 ${rad.badge} · 입력 ${rad.button}`);
  L.push(
    `- 그림자: ${cfg.dark ? "쓰지 않고 border로 깊이 표현" : "카드에 0 1px 3px rgba(0,0,0,.08) 1단계만"}`,
  );
  L.push("");
  L.push("## 4. 컴포넌트");
  L.push("");
  L.push("| 컴포넌트 | 규칙 |");
  L.push("| --- | --- |");
  L.push(
    `| 버튼(주요) | primary-500 배경, 흰 글자, 높이 44px, radius ${rad.button}. hover primary-600, active primary-700 |`,
  );
  L.push(`| 버튼(보조) | 투명 배경 + border 1px(${border}), text 색 글자 |`);
  L.push(`| 카드 | surface 배경, border 1px, radius ${rad.card}, 내부 여백 ${den.cardPad} |`);
  L.push("| 입력 | 높이 44px, border 1px, focus 시 primary 2px 링 |");
  L.push(`| 배지 | 상태색 10% 배경 + 같은 색 글자, radius ${rad.badge} |`);
  L.push(`| 표 | 헤더 muted 배경, 행 구분 border 1px, 행 높이 ${den.rowH} |`);
  L.push("");
  L.push(...layoutSection(cfg.layout, 5));
  L.push(...imageSection(6));
  L.push("## 7. 상태(꼭 지킬 것)");
  L.push("");
  L.push("- hover/active/focus: 버튼·링크·행 모두 시각 피드백. focus는 키보드 접근성을 위해 링 필수.");
  L.push("- 비어 있음: 아이콘 + 한 줄 안내 + 주요 액션 하나.");
  L.push("- 로딩: 스켈레톤 또는 스피너. 버튼은 로딩 시 비활성 + 스피너.");
  L.push("- 오류: danger 색 + 무엇이 왜 틀렸는지 + 다음 행동.");
  if (cfg.dark) {
    L.push("- 다크모드: 위 배경/표면/텍스트 토큰을 그대로 쓰고, 그림자 대신 border로 층을 표현.");
  }
  L.push("");
  L.push("화면마다 다른 스타일을 쓰지 말고, 위 시스템을 끝까지 일관되게 적용해줘.");
  L.push("");
  return L.join("\n");
}

// 생성 완료 화면에 보여줄 요약(온페이지용 구조 데이터).
export interface PresetSummary {
  baseName: string;
  primary: string;
  palette: [string, string][]; // [라벨, hex]
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  fontLabel: string;
  fontFamily: string;
  radius: { card: string; button: string; badge: string };
  densityLabel: string;
  /** 고른 레이아웃 골격 이름 — 요약 카드에 함께 보여준다. */
  layoutLabel: string;
  dark: boolean;
  typeScale: [string, string][]; // [용도, 스펙]
  components: [string, string][]; // [이름, 규칙 요약]
}

export function buildPresetSummary(cfg: PresetConfig): PresetSummary {
  const base = PRESETS[cfg.style];
  const font = fontById(cfg.font);
  const rad = RADIUS_FEELS.find((r) => r.key === cfg.radius)!;
  const den = DENSITIES.find((d) => d.key === cfg.density)!;
  const pal = palette(cfg.primary);
  return {
    baseName: base.name,
    primary: cfg.primary,
    palette: Object.entries(pal),
    bg: cfg.dark ? "#0E1116" : "#FFFFFF",
    surface: cfg.dark ? "#171B22" : "#FFFFFF",
    text: cfg.dark ? "#E8EAED" : "#16181D",
    muted: cfg.dark ? "#9AA0A8" : "#6B7280",
    border: cfg.dark ? "#2A2F37" : "#E5E7EB",
    fontLabel: font.label,
    fontFamily: font.family,
    radius: { card: rad.card, button: rad.button, badge: rad.badge },
    densityLabel: den.label,
    layoutLabel: layoutByKey(cfg.layout).label,
    dark: cfg.dark,
    typeScale: [
      ["페이지 제목", "32px / 800"],
      ["섹션 제목", "22px / 700"],
      ["카드 제목", "18px / 700"],
      ["본문", "15px / 400"],
      ["버튼", "14px / 600"],
    ],
    components: [
      ["버튼(주요)", `primary 배경 · 높이 44px · radius ${rad.button}`],
      ["카드", `surface 배경 · border 1px · radius ${rad.card}`],
      ["입력", "높이 44px · focus 시 primary 링"],
      ["배지", `상태색 10% 배경 · radius ${rad.badge}`],
    ],
  };
}
