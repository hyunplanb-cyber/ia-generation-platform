// 디자인 프리셋 3종 — 브리프의 "디자인 컨셉" 선택과 1:1로 이어진다.
// 선택한 스타일의 디자인 시스템 스펙(색·타이포·컴포넌트)을 마크다운으로 만들어
// 전체 다운로드 zip에 함께 담는다(AI 코딩 도구에 붙여 넣으면 그 스타일로 만들어짐).
// UI·서버 공용(순수 데이터/문자열).

export type DesignKey = "navy" | "mono" | "pastel";

// 브리프에서 보여줄 3개 선택지. concept 텍스트가 프로젝트에 저장되고, 그걸로 프리셋을 되찾는다.
export const DESIGN_OPTIONS: { key: DesignKey; title: string; desc: string; concept: string }[] = [
  {
    key: "navy",
    title: "모던 네이비",
    desc: "신뢰감 있고 정돈된, 실무형",
    concept: "모던하고 신뢰감 있는 네이비 톤. 정보가 잘 정돈된 실무형 디자인, 카드와 표 중심.",
  },
  {
    key: "mono",
    title: "미니멀 모노",
    desc: "색을 뺀 여백·활자 중심",
    concept: "색을 절제한 미니멀 모노톤. 넉넉한 여백과 활자 위계로 정리된 깔끔한 디자인.",
  },
  {
    key: "pastel",
    title: "소프트 파스텔",
    desc: "부드럽고 친근한 분위기",
    concept: "부드럽고 친근한 파스텔 톤. 둥근 모서리와 넉넉한 여백으로 편안한 느낌.",
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
};

// 저장된 디자인 컨셉 텍스트(또는 키) → 프리셋. 못 찾으면 navy 기본.
export function presetForConcept(concept: string | null | undefined): Preset {
  const opt = DESIGN_OPTIONS.find((d) => d.concept === concept || d.key === concept);
  return PRESETS[opt?.key ?? "navy"];
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
  L.push("화면마다 다른 스타일을 쓰지 말고, 위 규칙을 끝까지 일관되게 적용해줘.");
  L.push("");
  return L.join("\n");
}
