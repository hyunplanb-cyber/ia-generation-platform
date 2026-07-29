// 디자인 프리셋 3종 — 브리프의 "디자인 컨셉" 선택과 1:1로 이어진다.
// 선택한 스타일의 디자인 시스템 스펙(색·타이포·컴포넌트)을 마크다운으로 만들어
// 전체 다운로드 zip에 함께 담는다(AI 코딩 도구에 붙여 넣으면 그 스타일로 만들어짐).
// UI·서버 공용(순수 데이터/문자열).

export type DesignKey = "navy" | "mono" | "pastel";

// 브리프에서 보여줄 3개 선택지. concept 텍스트가 프로젝트에 저장되고, 그걸로 프리셋을 되찾는다.
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

// ── 상세 프리셋 설정(사용자가 더 고르는 항목) + 상세 디자인 시스템 생성 ──────────

export type FontFeel = "sans" | "serif" | "rounded";
export type RadiusFeel = "sharp" | "normal" | "round";
export type Density = "cozy" | "compact";

export interface PresetConfig {
  style: DesignKey; // 큰 방향(브리프에서 고른 컨셉)
  primary: string; // 주 색상(hex)
  font: FontFeel;
  radius: RadiusFeel;
  density: Density;
  dark: boolean;
}

export const PRIMARY_SWATCHES = [
  "#2B4A8B",
  "#0E6F60",
  "#DE6F26",
  "#5B4FE5",
  "#111827",
  "#E11D48",
  "#0EA5E9",
  "#16A34A",
  "#9333EA",
  "#F59E0B",
];
export const FONT_FEELS: { key: FontFeel; label: string; family: string }[] = [
  { key: "sans", label: "고딕", family: "Pretendard, 'Noto Sans KR', sans-serif" },
  { key: "serif", label: "명조", family: "'Noto Serif KR', 'Nanum Myeongjo', serif" },
  { key: "rounded", label: "둥근", family: "Paperlogy, Pretendard, sans-serif" },
];
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

export function defaultPresetConfig(style: DesignKey): PresetConfig {
  return {
    style,
    primary: Object.values(PRESETS[style].colors)[0],
    font: style === "pastel" ? "rounded" : "sans",
    radius: style === "mono" ? "sharp" : style === "pastel" ? "round" : "normal",
    density: "cozy",
    dark: false,
  };
}

export function parsePresetConfig(json: string | null, concept?: string | null): PresetConfig {
  if (json) {
    try {
      const c = JSON.parse(json) as Partial<PresetConfig>;
      if (c.style) return { ...defaultPresetConfig(c.style), ...c } as PresetConfig;
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
  const font = FONT_FEELS.find((f) => f.key === cfg.font)!;
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
    `설정: 주색상 \`${cfg.primary}\` · 폰트 ${font.label} · 모서리 ${rad.label} · 밀도 ${den.label} · ${cfg.dark ? "다크모드" : "라이트모드"}`,
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
  L.push(`- 폰트: **${font.label}** — \`${font.family}\``);
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
  L.push("## 5. 상태(꼭 지킬 것)");
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
