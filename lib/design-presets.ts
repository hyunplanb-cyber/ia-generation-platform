// 디자인 프리셋 — 브리프의 "디자인 컨셉" 선택과 1:1로 이어진다.
// 선택한 스타일의 디자인 시스템 스펙(색·타이포·컴포넌트)을 마크다운으로 만든다
// (AI 코딩 도구에 붙여 넣으면 그 스타일로 만들어짐).
//
// AI팩 zip과는 별개다 — /dashboard/[projectId]/preset 에서 따로 만들고 따로 받는다.
// 생성·다운로드 크레딧도 각각 차감한다(application/preset.ts).
// AI를 쓰지 않는다. 아래 데이터가 그대로 산출물이 되므로 모델을 바꿔도 결과가 같다.
// UI·서버 공용(순수 데이터/문자열).

/** 콘텐츠 영역 배경 — 클라우드 댄서(Pantone 11-4201 TCX).
 *
 * 전에는 테마마다 주색을 옅게 깐 배경을 썼다(코럴 #FFF6F3, 네이비 #F5F7FA).
 * 그러면 테마를 바꿀 때마다 화면 전체 색조가 흔들리고, 카드(흰색)와 배경의
 * 차이가 테마마다 달라져 어떤 테마에서는 카드가 안 떠 보였다(2026-08-05).
 * 배경은 중립으로 고정하고, 색은 주색·강조가 내게 한다. */
export const CONTENT_BG = "#F0EFEB";

/** 다크모드의 페이지 배경.
 *
 * 이 값도 두 함수에 `"#0E1116"` 으로 손으로 적혀 있었다(2026-08-09 에 묶었다).
 * 색을 재려면 배경이 어디 있는지 알아야 하는데, 문자열로 흩어져 있으면 잴 수가 없다. */
export const DARK_BG = "#0E1116";

/** 콘텐츠 영역 — PC에서 내용이 놓이는 폭.
 *
 * 헤더·본문·푸터가 **모두 같은 폭**을 써야 위아래가 한 줄로 선다.
 * 실제로 헤더는 1200, 본문은 화면에 따라 1200 또는 1440이라 시작 지점이
 * 120px씩 어긋난 사이트가 있었다(2026-08-06). 폭을 한 곳에서 정하고
 * 헤더 안쪽·본문·푸터 안쪽·고정 바가 모두 그 값을 참조하게 한다. */
export const CONTENT_WIDTH = { max: "1440px", padX: "24px" } as const;

/**
 * 읽기 폭 — 글을 한 단으로 좁힐 때의 최대 폭.
 *
 * 2026-08-09 에 묶었다. 그전까지 이 값이 **글에만 세 벌**로 적혀 있었다.
 *   좌우 분할형 상세 760 · 에디토리얼형 상세 720 · 여백 중심형 상세 680
 * 그중 760 만 코드에 근거가 있었고(아래 `본문폭()` 과 single 뼈대의 CSS),
 * 720·680 은 아무 데도 없는 숫자였다. 카드 폭 453px 사고와 같은 종류다 —
 * 근거 없는 숫자가 가이드에 적혀 나가고, 받는 쪽은 그걸 믿는다.
 *
 * 게다가 720 은 이미 `BREAKPOINTS.narrow` 의 값이다. 같은 숫자가 「휴대폰 기준선」과
 * 「읽기 폭」 두 뜻으로 쓰이고 있었다 — 벤토의 `.card.wide` 가 카드 종류 이름과
 * 겹쳐 터질 뻔한 것과 같은 모양이라, 이름을 붙여 갈라 둔다.
 *
 * 왜 760 인가 — 완성화면을 재서 고르려 했는데 **거기엔 답이 없었다.**
 * 좁은 한 단 컨테이너(`.wrap-narrow`)는 여덟 팩 중 일곱이 880px 인데,
 * 그건 예약 완료·폼처럼 **글이 아니라 상자를 담는** 자리였다. 긴 글을 읽는 화면
 * 자체가 완성화면에 거의 없다(긴 문단이 다섯 이상인 화면이 네 개뿐).
 * 그래서 재서 정할 수 있는 값이 아니었고, **이미 코드가 쓰고 있던 760** 을 남겼다.
 * 새 숫자를 만들지 않는 쪽이 맞다.
 *
 * 880 은 「좁은 페이지 폭」이라는 다른 자리다. 읽기 폭과 섞지 않는다.
 * 여백 중심형은 페이지 자체가 이 폭으로 갇히므로(single 뼈대), 그 상세가
 * 이보다 넓어지면 자기 페이지를 넘는 모순이 된다 — 한 값이어야 하는 이유다.
 */
export const READING_WIDTH = 760;

/**
 * 화면이 줄어드는 지점 — 딱 두 곳.
 *
 * 지금까지 이 값을 아무 데도 안 적어 뒀더니, 같은 스펙팩으로 만든 세 벌이
 * 각자 다른 값을 지어냈다(실측 2026-08-08):
 *   오퍼스 1024·860·720 / 소넷 980·900·720·640·560 / 페이블 1100·1024·720·560
 * 손님이 뼈대를 바꿔 끼울 때마다 줄어드는 지점이 달라지면 같은 사이트로 안 보인다.
 *
 * 두 곳만 두는 이유: 여기서 더 잘게 나눠도 사람 눈에는 안 보이고,
 * 대신 만드는 쪽이 지킬 곳만 늘어난다. 1024는 태블릿 가로, 720은 세로다.
 */
export const BREAKPOINTS = {
  /** 이 아래로는 칸이 한 번 줄어든다 (태블릿) */
  mid: 1024,
  /** 이 아래로는 좌우 여백이 16px로 줄고 칸이 한 번 더 줄어든다 (휴대폰) */
  narrow: 720,
  /** 휴대폰에서의 좌우 여백 — 24는 좁은 화면에서 본문을 너무 갉아먹는다 */
  padXNarrow: "16px",
} as const;

/**
 * 칸과 칸 사이. 좌우와 위아래가 다르다 —
 * 카드가 줄바꿈될 때 위아래가 좌우와 같으면 줄이 안 갈려 보인다(2026-08-05).
 */
export const GRID_GAP = { x: 16, y: 28, xNarrow: 12 } as const;

/**
 * 몇 열로 놓는가 — 뼈대(structure)마다, 화면 폭마다.
 *
 * [넓은 화면, 1024 아래, 720 아래] 순서다.
 * 이 표가 없어서 지금까지 "카드 그리드 3~4열"처럼 글로만 적혀 있었고,
 * 그래서 만드는 쪽이 매번 다르게 잡았다.
 */
export const STRUCTURE_COLS: Record<StructureKey, [number, number, number]> = {
  single: [1, 1, 1],
  multi: [3, 2, 1],
  grid: [4, 3, 2],
  bento: [4, 2, 1], // 큰 칸이 2칸을 먹으므로 좁아지면 빨리 무너뜨린다
  sidebar: [3, 2, 1], // 본문 쪽 칸 수. 사이드바는 720 아래에서 위로 접힌다
  fullscreen: [1, 1, 1],
};

/** 화면 폭에서 좌우 여백을 뺀 «쓸 수 있는 폭» — 칸 폭 계산의 기준. */
function 안쪽폭(vw: number): number {
  const pad = vw <= BREAKPOINTS.narrow ? 16 : 24;
  return Math.min(vw, 1440) - pad * 2;
}

/** 뼈대가 본문 폭을 더 좁히는 경우 — 카드가 놓이는 실제 폭.
 *
 * 2026-08-08 에 찾았다. 카드 폭을 쓸 수 있는 폭 전체로 계산하고 있었는데,
 * 뼈대 둘은 본문을 더 좁힌다.
 *   single  — `.wrap > section { max-width: 760px }` 로 읽는 폭을 가둔다
 *   sidebar — 왼쪽에 --side-w(260) + --side-gap(32) 을 떼어 준다
 * 그래서 가이드에 「카드 1392px」(여백중심형) · 「453px」(사이드바 쓰는 셋)이
 * 적혀 나갔다. 실제로는 760px 과 356px 이다. 그대로 만들면 화면이 안 맞는다.
 */
function 본문폭(vw: number, structure?: StructureKey): number {
  const 폭 = 안쪽폭(vw);
  if (structure === "single") return Math.min(폭, READING_WIDTH);
  if (structure === "sidebar") {
    if (vw <= BREAKPOINTS.narrow) return 폭;          // 사이드바가 위로 접힌다
    const side = vw <= BREAKPOINTS.mid ? 220 : 260;   // 뼈대 CSS 의 --side-w
    const gap = vw <= BREAKPOINTS.mid ? 24 : 32;      // 뼈대 CSS 의 --side-gap
    return 폭 - side - gap;
  }
  return 폭;
}

/** N열일 때 카드 한 장의 폭(px). 문서에 실제 숫자를 적기 위한 것.
 *  뼈대를 넘기지 않으면 본문을 안 좁히는 뼈대로 친다. */
export function cardWidth(cols: number, vw = 1440, structure?: StructureKey): number {
  const gap = vw <= BREAKPOINTS.narrow ? GRID_GAP.xNarrow : GRID_GAP.x;
  return Math.floor((본문폭(vw, structure) - gap * (cols - 1)) / cols);
}

export type DesignKey = "navy" | "mono" | "pastel" | "retro" | "forest" | "coral";

/**
 * 만들기(브리프) 화면에서 보여줄 컨셉 — 여섯이 아니라 셋만.
 *
 * 여섯을 다 늘어놓으니 만들기 첫 화면이 복잡해 보이고, 고르는 것 자체가 문턱이 됐다
 * (2026-08-04). 여기서는 방향만 크게 잡고, 세밀한 색·글꼴은 디자인 프리셋에서 고른다.
 * 프리셋 화면에는 여섯 종을 그대로 다 보여준다.
 */
export const BRIEF_DESIGN_KEYS: DesignKey[] = ["navy", "mono", "pastel"];

/* concept 텍스트가 프로젝트에 저장되고, 그걸로 프리셋을 되찾는다.
 *
 * 색을 배열이 아니라 «이름»으로 준다 — 2026-08-08 에 바꿨다.
 * 전에는 `swatches: [주색, 강조, 진한글자, 옛배경]` 네 칸짜리 배열이었다.
 * 자리의 뜻이 이름에 없으니 바이올렛 세 번째 칸에 연한 민트(#DFF5EC)가 들어가 있어도
 * 아무도 몰랐다. 그 팩으로 만들면 본문 대비가 **1.01** — 글자가 안 보인다.
 * 모노도 같은 칸에 회색(#767676, 3.95)이 들어 있어 본문에 모자랐다.
 * 네 번째(옛배경)는 2026-08-05 에 이미 버린 값인데 배열에만 남아 있었다. 지웠다.
 *
 * accent 와 accentText 를 가른 까닭
 *   강조색 여섯 중 글자로 쓸 수 있는 건 레트로(5.27) 하나뿐이었다.
 *   나머지 다섯은 배경 위 1.2~2.7 이라 배경·배지 전용이다. 그런데 주는 값이
 *   하나뿐이니 받는 쪽은 그걸 글자에도 썼다(실제로 견본·미리보기 세 곳이 그랬다).
 *   카드뉴스2.css 가 이미 `--orange`(배경) / `--orange-text`(글자)로 갈라 두고 있었다.
 *   같은 방식이다 — 「강조를 글자에 쓰지 마세요」라고 글로 부탁하는 대신
 *   **쓸 수 있는 값을 따로 준다.** 글로 된 부탁은 안 지켜지고 값은 지켜진다.
 *
 * accentText 는 전부 이미 이 저장소 안에 있던 색이다(지어낸 값이 없다).
 *   #A84B28  lib/design-presets.ts 모노의 accent-text · build-design-presets.mts 와 같은 값
 *   #8A5A00  app/globals.css --warning
 *   #0E6F60  카드뉴스2.css --teal-text · app/globals.css --pastel-mint-foreground
 *   #166534  PRIMARY_SWATCHES_BY_STYLE.forest[1]
 * 값을 바꿀 때는 check-presets.mts 가 CONTENT_BG 위 4.5:1 을 다시 잰다.
 */
export const DESIGN_OPTIONS: {
  key: DesignKey;
  title: string;
  desc: string;
  concept: string;
  /** 주요 액션 — 버튼·활성 표시 */
  primary: string;
  /** 강조 — **배경·배지·띠 전용.** 글자로 쓰면 안 읽힌다. */
  accent: string;
  /** 글자용 강조 — 같은 계열의 진한 값. CONTENT_BG 위 4.5:1 이상. */
  accentText: string;
  /** 어두운 바탕에서의 글자용 강조 — DARK_BG 위 4.5:1 이상.
   *  다섯 테마는 강조 원색이 어두운 바탕에서 그대로 잘 읽혀 accent 와 같다.
   *  레트로만 틸이 어두운 바탕에서 3.12 라 밝은 쪽 값을 따로 든다. */
  accentTextDark: string;
  /** 주색 «위에» 얹을 글자색 — 안 적으면 흰/먹 중 «재서» 고른다(textOn).
   *
   * ⭐ 손으로 적는 자리다. 재서 고르는 값이 늘 답은 아니다 — 2026-08-18 사장님:
   *   「코럴 테마에 포인트 컬러시 버튼 텍스트 흰색이 더 잘보일꺼 같아」
   *   코럴 위에서 먹 글자는 6.01, 흰 글자는 3.14 로 «숫자는» 먹색이 낫다.
   *   그런데 주황 위 검은 글자는 탁해 보인다. 세 안을 그려 놓고 고르셨다.
   *   흰 글자는 **큰 글자 기준(3.0)** 은 넘으므로, 버튼 글자를 19px 굵게로
   *   못 박아 근거를 맞췄다(아래 components 의 「버튼(주요)」).
   * ⚠ 그래서 이 칸을 쓰는 테마는 **버튼 글자 크기도 같이 정해야 한다.** */
  onPrimary?: string;
  /** 본문 글자색. PRESETS[key].colors 의 text(본문)과 같은 값이어야 한다. */
  ink: string;
}[] = [
  {
    key: "navy",
    title: "모던 네이비",
    desc: "신뢰감 있고 정돈된, 실무형",
    concept: "모던하고 신뢰감 있는 네이비 톤. 정보가 잘 정돈된 실무형 디자인, 카드와 표 중심.",
    primary: "#2B4A8B",
    accent: "#CC4900",
    accentText: "#A84B28",
    accentTextDark: "#FF7A30", // 밝은 옛 강조색 — 어두운 바탕 위에서는 이게 잘 읽힌다. 대비 7.28
    ink: "#16233F",
  },
  {
    key: "mono",
    title: "미니멀 모노",
    desc: "색을 뺀 여백·활자 중심",
    concept: "색을 절제한 미니멀 모노톤. 넉넉한 여백과 활자 위계로 정리하고, 색은 강조 한 곳에만 쓴다.",
    primary: "#111111",
    accent: "#C64F28",
    accentText: "#A84B28",
    accentTextDark: "#D97757", // 밝은 옛 강조색 — 어두운 바탕 위에서는 이게 잘 읽힌다. 대비 6.06
    ink: "#111111",
  },
  {
    key: "pastel",
    title: "일렉트릭 바이올렛",
    desc: "부드럽고 친근한 분위기",
    concept: "부드럽고 친근한 파스텔 톤. 둥근 모서리와 넉넉한 여백으로 편안한 느낌.",
    primary: "#5B4FE5",
    accent: "#FFD54A",
    accentText: "#8A5A00",
    accentTextDark: "#FFD54A", // 밝은 옛 강조색 — 어두운 바탕 위에서는 이게 잘 읽힌다. 대비 13.39
    ink: "#1F2024",
  },
  {
    key: "retro",
    title: "레트로 페이퍼",
    desc: "종이 질감 · 오렌지 & 틸",
    concept: "종이 질감의 따뜻한 레트로 톤. 크림색 배경에 오렌지·틸 포인트, 편집숍 같은 감성.",
    primary: "#BC5918",
    accent: "#0E6F60",
    // 여섯 중 유일하게 강조색 그대로 글자에 쓸 수 있다(5.27).
    accentText: "#0E6F60",
    // 여섯 중 유일하게 강조 원색이 어두운 바탕에서 모자란다(3.12).
    // 카드뉴스2.css 의 `--teal` — 이 틸의 「배경용」 짝이다. 어두운 바탕 위 6.08.
    // 밝은 바탕에서는 반대로 이 값이 2.70 이라 못 쓴다. 그래서 두 자리가 갈린다.
    accentTextDark: "#1AA48F",
    /* 재면 먹색(5.76)이 이기지만 오렌지 위 검은 글자는 탁하다. 코럴과 같은 판단으로
       흰색으로 정했다(2026-08-18). 3.28 은 큰 글자 기준(3.0)을 넘으므로 버튼 글자를 19px 굵게로 둔다. */
    onPrimary: "#FFFFFF",
    ink: "#2A2320",
  },
  {
    key: "forest",
    title: "내추럴 그린",
    desc: "차분한 자연 · 친환경",
    concept: "차분한 그린 톤의 내추럴 디자인. 자연·건강·친환경 느낌, 넉넉한 여백.",
    primary: "#15803D",
    accent: "#508307",
    // 올리브(#65A30D)를 글자까지 낮춘 값은 저장소에 없었다. 있는 것 중 가장 가까운
    // #4D7C0F 는 4.34 로 모자란다. 그래서 이 테마가 이미 들고 있는 진한 초록을 쓴다.
    accentText: "#166534",
    accentTextDark: "#65A30D", // 밝은 옛 강조색 — 어두운 바탕 위에서는 이게 잘 읽힌다. 대비 6.12
    ink: "#1C2B22",
  },
  {
    key: "coral",
    title: "코럴 선셋",
    desc: "밝고 따뜻한 생기",
    concept: "밝고 따뜻한 코럴 톤. 둥근 모서리와 생기 있는 색으로 친근한 느낌.",
    primary: "#E02A0E",
    accent: "#A46803",
    accentText: "#8A5A00",
    accentTextDark: "#F59E0B", // 밝은 옛 강조색 — 어두운 바탕 위에서는 이게 잘 읽힌다. 대비 8.81
    /* 재면 먹색(6.01)이 이기지만, 주황 위 검은 글자는 탁하다. 사장님이 흰색으로 정하셨다
       (2026-08-18). 3.14 는 큰 글자 기준(3.0)을 넘으므로 버튼 글자를 19px 굵게로 둔다. */
    onPrimary: "#FFFFFF",
    ink: "#33221E",
  },
];

/** 테마 하나를 찾는다. 없으면 navy. */
export const designOptionFor = (k: DesignKey) =>
  DESIGN_OPTIONS.find((d) => d.key === k) ?? DESIGN_OPTIONS[0];

/** 카드에 동그랗게 늘어놓을 대표 색 — 화면 장식용이다.
 *  뜻이 필요한 자리에서는 이걸 쓰지 말고 primary·accent·accentText·ink 를 직접 읽는다. */
export const swatchesOf = (o: (typeof DESIGN_OPTIONS)[number]): string[] => [
  o.primary,
  o.accent,
  o.accentText,
  o.ink,
];

/* ─── 색 대비 재기 ────────────────────────────────────────────
   눈으로 「진해 보인다」로 정하면 안 된다. 바이올렛의 민트가 그렇게 들어왔다.
   WCAG 상대휘도로 잰다. 4.5 이상이면 본문, 3.0 이상이면 큰 글자까지다. */
function 상대휘도(hex: string): number {
  return toRgb(hex)
    .map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    })
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
}

/** 두 색의 대비(1~21). 배경을 안 주면 콘텐츠 배경 위에서 잰다. */
export function contrast(hex: string, bg: string = CONTENT_BG): number {
  const [밝, 어] = [상대휘도(hex), 상대휘도(bg)].sort((a, b) => b - a);
  return (밝 + 0.05) / (어 + 0.05);
}

/** 본문 글자로 쓸 수 있는 대비 — WCAG AA 기준 */
export const TEXT_CONTRAST_MIN = 4.5;
/** 큰 글자(18.66px 굵게 · 24px 보통) 기준. 이것도 못 넘으면 어떤 크기로도 안 읽힌다. */
export const LARGE_TEXT_MIN = 3.0;

/** 이 바탕 위에서 강조를 글자로 쓸 때의 값.
 *
 * accentText 는 밝은 바탕(CONTENT_BG)에서 읽히라고 진하게 잡은 값이라,
 * 어두운 바탕에 그대로 얹으면 거꾸로 안 보인다(예: 파스텔의 #8A5A00 은 3.19).
 * 그래서 어두운 바탕용을 따로 든다(accentTextDark).
 *
 * 어느 쪽을 줄지 「다크모드면 이것」식으로 분기하지 않고 **재서 고른다.**
 * 배경은 다크 스위치 말고도 달라진다 — 짙은 히어로, 하단 고정 바, 사진 위 어둠막.
 * 그 자리마다 사람이 고르게 두면 또 틀린다. 배경을 주면 값이 나오게 한다. */
export function accentTextOn(o: (typeof DESIGN_OPTIONS)[number], bg: string): string {
  return contrast(o.accentText, bg) >= contrast(o.accentTextDark, bg)
    ? o.accentText
    : o.accentTextDark;
}

/** 색을 «바탕으로» 깔았을 때 그 위에 얹을 글자색.
 *
 * 왜 필요한가 — 2026-08-09
 *   가이드에는 「이 색을 글자로 쓸 때」(accentText)는 있는데
 *   **「이 색 «위에» 글자를 얹을 때」가 없었다.** 그래서 AI 가 만든 화면이
 *   전부 흰 글자를 얹었고, 재 보니 두 테마의 버튼 글자가 안 읽혔다.
 *     레트로 #DE6F26 위 흰 글자 3.28 · 코럴 #F0654F 위 흰 글자 3.14
 *   강조색은 더 나쁘다 — **여섯 중 다섯이 흰 글자로는 미달**이다
 *     네이비 2.60 · 모노 3.12 · 바이올렛 1.41 · 포레스트 3.09 · 코럴 2.15
 *
 *   버튼 글자가 흐린 것은 10만원짜리 산출물에서 «맨 먼저» 보이는 흠이다.
 *   그런데 이건 각 화면의 실수가 아니라 **가이드에 칸이 없어서** 생긴 일이다 —
 *   시키지 않은 것을 안 했다고 나무랄 수 없다.
 *
 * 흰색과 먹색 중 **재서** 고른다. 「밝은 색이면 검정」식의 눈대중은
 * 포레스트(#15803D 흰 5.02 / 검정 3.76)처럼 애매한 자리에서 틀린다. */
export const ON_LIGHT = "#111111";
export const ON_DARK = "#FFFFFF";
export function textOn(bg: string): string {
  return contrast(ON_DARK, bg) >= contrast(ON_LIGHT, bg) ? ON_DARK : ON_LIGHT;
}

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
      "accent-text(강조 글자용)": "#A84B28",
      "accent-text-dark(어두운 바탕 글자용)": "#FF7A30",
      "background(페이지)": "#F0EFEB",
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
      ["버튼(주요)", "primary 배경, on-primary 글자, 높이 40px, 굵기 600"],
      ["카드", "surface 배경, border 1px, 그림자 1단계, 헤더에 구분선"],
      ["표", "헤더는 background 색 채움, 행 구분 border 1px, 행 높이 44px"],
    ],
  },
  mono: {
    key: "mono",
    name: "미니멀 모노",
    tagline: "여백과 활자. 색은 한 곳에만 남긴다.",
    font: "Pretendard (대체: Inter + Noto Sans KR). 크기보다 굵기·여백으로 위계.",
    colors: {
      "primary(주요 액션)": "#111111",
      "accent(강조)": "#D97757",
      "accent-text(강조 글자용)": "#A84B28",
      "accent-text-dark(어두운 바탕 글자용)": "#D97757",
      "background(페이지)": "#F0EFEB",
      "surface(카드)": "#FFFFFF",
      "text(본문)": "#111111",
      "text-muted(보조)": "#666666",
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
      ["버튼(주요)", "검정 배경, on-primary 글자, 높이 36px, 굵기 500"],
      ["카드", "border 1px만. 그림자·배경색 없음, 여백으로 구분"],
      ["표", "헤더 하단 border 2px, 행 구분 1px, 행 높이 40px"],
    ],
  },
  pastel: {
    key: "pastel",
    name: "일렉트릭 바이올렛",
    tagline: "부드럽고 친근하게. 처음 쓰는 사람도 겁먹지 않게.",
    font: "한 벌만 쓴다. 제목을 과감히 키우고 자간을 좁혀 경쾌하게.",
    colors: {
      "primary(주요 액션)": "#5B4FE5",
      "accent(강조)": "#FFD54A",
      "accent-text(강조 글자용)": "#8A5A00",
      "accent-text-dark(어두운 바탕 글자용)": "#FFD54A",
      "background(페이지)": "#F0EFEB",
      "surface(카드)": "#FFFFFF",
      "text(본문)": "#1F2024",
      "text-muted(보조)": "#5F636A",
      "soft-mint": "#DFF5EC",
      "soft-lavender": "#EDE9FE",
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
      ["버튼(주요)", "primary 배경, on-primary 글자, 높이 44px, 굵기 700"],
      ["카드", "surface 배경, radius 16px, 부드러운 그림자, 테두리는 연하게"],
      ["표", "헤더 배경 #F7F7F9, 행 구분 연하게, 행 높이 48px"],
    ],
  },
  retro: {
    key: "retro",
    name: "레트로 페이퍼",
    tagline: "종이 질감과 따뜻한 오렌지·틸. 편집숍 같은 감성.",
    font: "한 벌만 쓴다. 위계는 글꼴이 아니라 크기와 굵기로 만든다.",
    colors: {
      "primary(주요 액션)": "#BC5918",
      "accent(강조·배지)": "#0E6F60",
      // 여섯 중 유일하게 강조색을 그대로 글자에 쓸 수 있다(배경 위 5.27).
      "accent-text(강조 글자용)": "#0E6F60",
      "accent-text-dark(어두운 바탕 글자용)": "#1AA48F",
      "background(페이지)": "#F0EFEB",
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
      ["버튼(주요)", "오렌지 배경, on-primary(흰색) 글자, 높이 42px, 글자 19px, 굵기 700 — 흰 글자가 읽히려면 이 크기를 지켜야 합니다"],
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
      "accent-text(강조 글자용)": "#166534",
      "accent-text-dark(어두운 바탕 글자용)": "#65A30D",
      "background(페이지)": "#F0EFEB",
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
      ["버튼(주요)", "그린 배경, on-primary 글자, 높이 40px, 굵기 600"],
      ["카드", "surface 배경, border 1px, 은은한 그림자"],
      ["표", "헤더 배경 연한 그린, 행 구분 1px, 행 높이 44px"],
    ],
  },
  coral: {
    key: "coral",
    name: "코럴 선셋",
    tagline: "밝고 따뜻한 코럴. 생기 있고 친근한 브랜드에.",
    font: "한 벌만 쓴다. 제목을 둥글고 크게, 경쾌하게.",
    colors: {
      "primary(주요 액션)": "#E02A0E",
      "accent(강조·배지)": "#F59E0B",
      "accent-text(강조 글자용)": "#8A5A00",
      "accent-text-dark(어두운 바탕 글자용)": "#F59E0B",
      "background(페이지)": "#F0EFEB",
      "surface(카드)": "#FFFFFF",
      "text(본문)": "#33221E",
      "text-muted(보조)": "#6E5450",
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
      ["버튼(주요)", "코럴 배경, on-primary(흰색) 글자, 높이 44px, 글자 19px, 굵기 700 — 흰 글자가 읽히려면 이 크기를 지켜야 합니다"],
      ["카드", "surface 배경, radius 18px, 부드러운 그림자"],
      ["표", "헤더 배경 연한 코럴, 행 구분 연하게, 행 높이 48px"],
    ],
  },
};

/* 「색 위에 얹는 글자」 두 칸은 «계산해서» 채운다.
 *
 * 손으로 적지 않는 까닭 — 2026-08-09
 *   여섯 테마의 「버튼(주요)」가 전부 **「흰 글자」**라고 적혀 있었다.
 *   그중 레트로(3.28)와 코럴(3.14)은 미달이다. 그런데 이건 화면을 만든 쪽 잘못이 아니다 —
 *   **가이드가 흰 글자를 시켰고, AI 는 시킨 대로 했다.**
 *
 *   여기에 값을 또 손으로 적으면 색을 조금 바꿀 때마다 같은 일이 되풀이된다.
 *   primary·accent 에서 «재서» 뽑으면 색을 바꿔도 글자색이 저절로 따라온다.
 */
/** 주색 위에 얹을 글자색 — 손으로 정한 값이 있으면 그것, 없으면 재서 고른다.
 *
 * ⛔ 이 함수가 없던 동안 값이 두 곳에서 갈렸다 (2026-08-18).
 *   lib/design-presets.ts 의 코럴만 흰색으로 고쳤더니 스펙팩은 흰색인데
 *   디자인프리셋 가이드는 lib/preset-pack.ts 가 따로 textOn 을 불러 #111111 이 나갔다.
 *   같은 팩 안의 두 문서가 서로 다른 버튼 글자색을 시키고 있었다.
 *   주석이 계속 경고하던 «두 벌로 적으면 갈린다» 그대로다 — 부르는 곳을 하나로 묶는다. */
export function onPrimaryFor(key: string, primary: string): string {
  return DESIGN_OPTIONS.find((o) => o.key === key)?.onPrimary ?? textOn(primary);
}
for (const o of DESIGN_OPTIONS) {
  const c = PRESETS[o.key].colors;
  c["on-primary(주색 배경 위 글자)"] = onPrimaryFor(o.key, o.primary);
  c["on-accent(강조색 배경 위 글자)"] = textOn(o.accent);
}

/** 테마의 색 표 — 팩 문서의 「색상」 절이 그대로 이것이다.
 *  DESIGN_OPTIONS 와 두 벌로 적힌 값이라 check-presets.mts 가 둘이 같은지 잰다. */
/** 테마의 부품 표(버튼·카드 …) — 검사기가 「버튼 글자 크기를 적었나」를 보려고 읽는다. */
export const componentsFor = (k: DesignKey): [string, string][] => PRESETS[k].components;

export const colorsFor = (k: DesignKey): Record<string, string> => PRESETS[k].colors;

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
export type LayoutKey =
  | "search" | "showcase" | "list" | "split" | "console"
  | "magazine" | "bold" | "calm" | "bento";

/* 화면 전체를 어떻게 나누는가 — 아홉 골격이 저마다 하나씩 가진다.
   "목록은 매거진형 2열"처럼 설명만 있고 이름이 없으면, 만드는 사람이
   몇 단짜리인지 매번 눈치로 정한다. 실제로 사이드바(2단) 안에 또 2단을
   넣어 표가 짜부라진 적이 있다(2026-08-05). 이름을 붙여 둔다. */
export type StructureKey = "single" | "multi" | "grid" | "bento" | "sidebar" | "fullscreen";

export const STRUCTURES: {
  key: StructureKey;
  label: string;
  desc: string;
  /** 이 뼈대만의 CSS. 공용 격자(gridBaseCss)에 이어 붙인다.
   *  글로 적으면 안 지켜지고 코드로 주면 지켜진다 — 격자 간격·카드 상자에서 겪은 그대로다. */
  css: string;
}[] = [
  {
    key: "single",
    label: "한 단",
    desc: "화면 가운데 한 줄기로만 쌓는다. 위에서 아래로 읽힌다.",
    css: `/* 한 단 — 읽는 폭을 좁혀야 글이 눈에 들어온다 */
.wrap > section { max-width: ${READING_WIDTH}px; margin-inline: auto; }
.cards { grid-template-columns: 1fr; }`,
  },
  {
    key: "multi",
    label: "여러 단",
    desc: "화면을 세로로 2~3칸 갈라 나란히 놓는다.",
    css: `.cards { grid-template-columns: repeat(3, 1fr); }
@media (max-width: 1024px) { .cards { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 720px)  { .cards { grid-template-columns: 1fr; } }`,
  },
  {
    key: "grid",
    label: "균일 그리드",
    desc: "같은 크기 칸을 격자로 채운다.",
    css: `.cards { grid-template-columns: repeat(4, 1fr); }
@media (max-width: 1024px) { .cards { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 720px)  { .cards { grid-template-columns: repeat(2, 1fr); } }`,
  },
  {
    key: "bento",
    label: "벤토 그리드",
    desc: "크기가 다른 칸을 섞어 중요한 것을 크게 둔다.",
    css: `.cards { grid-template-columns: repeat(4, 1fr); grid-auto-flow: dense; }
/* 이름이 span-x / span-y 인 이유 — 원래 .card.wide / .card.tall 이었는데
   wide 와 tall 은 카드 「종류」 이름이기도 하다(16:9 와이드 카드, 3:4 세로 카드).
   벤토에 와이드 카드를 쓰는 조합이 생기면 두 규칙이 같은 선택자에 걸려 터진다.
   지금은 벤토가 정사각 카드를 써서 사고가 안 났을 뿐이다(2026-08-08 발견).
   칸을 몇 개 먹느냐는 카드 모양과 다른 축이므로 이름을 갈랐다. */
.card.span-x { grid-column: span 2; }   /* 가로로 두 칸 */
.card.span-y { grid-row: span 2; }      /* 세로로 두 칸 */
/* 크게 둘 칸에만 붙인다. 한 화면에 두 개까지 — 셋을 넘으면 「큰 것」이 없어진다. */
@media (max-width: 1024px) {
  .cards { grid-template-columns: repeat(2, 1fr); }
  .card.span-y { grid-row: auto; }      /* 2열에서 세로로 겹치면 빈칸이 생긴다 */
}
@media (max-width: 720px) {
  .cards { grid-template-columns: 1fr; }
  .card.span-x { grid-column: auto; }
}`,
  },
  {
    key: "sidebar",
    label: "사이드바 + 본문",
    desc: "한쪽에 고정 영역, 나머지에 본문.",
    css: `/* 사이드바는 폭을 고정한다 — 비율(fr)로 두면 화면이 넓어질수록 같이 넓어져 빈다 */
.layout { display: grid; grid-template-columns: var(--side-w) minmax(0, 1fr); gap: var(--side-gap); }
.side { position: sticky; top: 72px; align-self: start; }
.cards { grid-template-columns: repeat(3, 1fr); }
@media (max-width: 1024px) {
  :root { --side-w: 220px; --side-gap: 24px; }
  .cards  { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 720px) {
  .layout { grid-template-columns: 1fr; }   /* 사이드바가 본문 위로 접힌다 */
  .side   { position: static; }
  .cards  { grid-template-columns: 1fr; }
}`,
  },
  {
    key: "fullscreen",
    label: "풀스크린",
    desc: "화면 전체를 사진·영상 한 장으로 채운다.",
    css: `/* 100vh 를 쓰지 않는다 — 휴대폰 주소창 때문에 화면이 잘린다 */
.hero-full { min-height: 100svh; display: grid; place-items: center; position: relative; }
.hero-full > .bg { position: absolute; inset: 0; object-fit: cover; width: 100%; height: 100%; }
/* 사진 위에 글자를 얹으므로 어둠막이 필수다. 가장 밝은 사진이 와도 4.5:1을 넘긴다. */
.hero-full::after { content: ""; position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,.72) 0%, rgba(0,0,0,.42) 45%, rgba(0,0,0,.15) 100%); }
.hero-full > .copy { position: relative; z-index: 1; color: #fff; text-align: center; max-width: 720px; }`,
  },
];

/** 여섯 뼈대가 모두 딛고 서는 격자. 뼈대별 CSS 앞에 이것이 먼저 온다.
 *
 * ⚠ 이 함수는 통째로 템플릿 문자열이고, **손님에게 그대로 나간다**(스펙팩·무료샘플).
 *   - 안쪽 주석은 손님이 읽는 글이다. 우리 작업 일지를 적지 않는다. 그건 여기 바깥에 적는다.
 *   - 주석 안에 백틱을 쓰면 문자열이 거기서 끊긴다. 한 번 겪었다.
 *
 * 2026-08-08 에 늘어난 것들과 그 까닭 (손님 문서에는 안 나가는 기록)
 *   --card-pad 24 · --btn-gap 8   처음엔 16·10 으로 적었는데, 그건 내가 견본을 만들며
 *                                 지어낸 값이었다. 완성화면 일곱 칸을 재 보니 전부 24·8 로
 *                                 만들어져 있었다. 일곱 번 만들어 정착한 값이 내가 한 번
 *                                 지어낸 값보다 근거가 세다. 그래서 가이드를 옮겼다.
 *   --card-pad·--row-h·--btn-gap  sidebar 뼈대로 실물 다섯 장을 만들다가, 이 셋이 없어서
 *                                 내가 16·52·10 을 지어냈다. 반응형 기준 px 이 없어서
 *                                 모델 셋이 각자 숫자를 만든 것과 같은 일이다.
 *   .stats                        지표 카드가 넷인데 뼈대는 .cards 를 3칸으로 고정한다.
 *                                 인라인으로 덮어써야 했다 — 즉 뼈대를 어겨야 했다.
 *   .mosaic                       showcase.hero 는 모자이크라는데 뼈대에 규칙이 없었다.
 *                                 큰 칸 사진이 646px, 두 줄 높이가 628px 이라 18px 넘쳐
 *                                 제목이 밀려나는 것도 같이 잡았다.
 *   .detail-img                   카드 비율 4:3 을 본문 폭에 쓰면 사진 세로가 1044px 이 되어
 *                                 노트북 화면을 통째로 덮었다.
 */
/** 격자 CSS 가 쓰는 기본 밀도 — 「넉넉하게」다.
 *
 * 2026-08-09 에 이었다. 그전에는 이 셋이 격자 CSS 에 손으로 적혀 있었는데,
 * `--row-h` 만 **52px** 이라 아래 밀도 눈금(48/40)과 싸우고 있었다.
 * 같은 「표 한 줄 높이」를 가이드가 두 값으로 말한 셈이다.
 *
 * 어느 쪽이 맞나 — 완성화면을 재니 `--row-h` 를 정의한 곳이 **48px 과 40px**,
 * 정확히 밀도 눈금의 두 값이었다. 52 는 아무도 안 쓴다.
 * `--card-pad`(24)·`--btn-gap`(8)은 이미 「넉넉하게」와 같은 값인데, 그 둘은
 * 완성화면을 재서 고쳤고 `--row-h` 만 안 고쳤기 때문이다. 이제 셋 다 눈금에서 나온다. */
const 기본밀도 = () => DENSITIES.find((d) => d.key === "cozy")!;

export const gridBaseCss = (): string => `:root{
  --wrap: ${CONTENT_WIDTH.max};      /* 콘텐츠 폭 — 헤더·본문·푸터·고정바가 모두 이 값을 쓴다 */
  --pad-x: ${CONTENT_WIDTH.padX};    /* 좌우 여백 */
  --card-gap:   ${GRID_GAP.x}px;     /* 카드와 카드 사이 — 좌우 */
  --card-gap-y: ${GRID_GAP.y}px;     /* 카드 줄과 줄 사이 — 위아래 */
  --side-w:     260px;               /* 사이드바 폭 (사이드바 뼈대에서만) */
  --side-gap:   32px;                /* 사이드바와 본문 사이 */
  --row-gap:    14px;                /* 가로 행 카드 안: 썸네일과 글자 사이 */

  --card-pad:   ${기본밀도().cardPad};                /* 카드 안쪽 여백 */
  --row-h:      ${기본밀도().rowH};                /* 표 한 줄 높이 — 안 정하면 줄마다 들쭉날쭉해진다 */
  --btn-gap:    ${기본밀도().btnGap};                 /* 나란히 놓은 버튼 사이 */
}
@media (max-width: ${BREAKPOINTS.narrow}px){
  :root{ --pad-x: ${BREAKPOINTS.padXNarrow}; --card-gap: ${GRID_GAP.xNarrow}px; }
}
.wrap { max-width: var(--wrap); margin-inline: auto; padding-inline: var(--pad-x); }
.cards{ display: grid; column-gap: var(--card-gap); row-gap: var(--card-gap-y); }

/* 지표 줄 — 화면 맨 위에 숫자 카드를 나란히 놓는 자리.
   카드 격자(.cards)와 다른 물건이므로 .cards 를 쓰지 않는다. 지표는 넷이 기본이다. */
.stats{ display: grid; grid-template-columns: repeat(4, 1fr);
        column-gap: var(--card-gap); row-gap: var(--card-gap-y); }
@media (max-width: ${BREAKPOINTS.mid}px){ .stats{ grid-template-columns: repeat(2, 1fr); } }
@media (max-width: ${BREAKPOINTS.narrow}px){ .stats{ grid-template-columns: 1fr; } }

/* 모자이크 — 홈 첫 화면에 「큰 1장 + 작은 4장」을 놓는 자리.
   첫 장이 2칸×2줄, 나머지 넷이 옆을 채운다.
   어느 것을 크게 할지 class 로 정하지 않는다 — 맨 앞에 둔 것이 큰 것이다. */
.mosaic{ display: grid; grid-template-columns: repeat(4, 1fr);
         column-gap: var(--card-gap); row-gap: var(--card-gap-y); }
.mosaic > :first-child{ grid-column: span 2; grid-row: span 2;
                        display: flex; flex-direction: column; }
/* 큰 칸의 사진은 카드 비율을 따르지 않는다 — 두 줄 높이와 안 맞아 제목이 밀려난다.
   큰 칸에서는 사진이 남는 자리를 채운다. */
.mosaic > :first-child > .thumb{ aspect-ratio: auto; flex: 1; min-height: 0; }
@media (max-width: ${BREAKPOINTS.mid}px){
  .mosaic{ grid-template-columns: repeat(2, 1fr); }
  .mosaic > :first-child{ grid-row: auto; }   /* 2열에서 세로로 겹치면 빈칸이 생긴다 */
}
@media (max-width: ${BREAKPOINTS.narrow}px){
  .mosaic{ grid-template-columns: 1fr; }
  .mosaic > :first-child{ grid-column: auto; }
}

/* 상세 화면의 대표 사진 — 카드 비율을 그대로 쓰지 않는다.
   4:3 을 본문 폭 1392px 에 적용하면 세로가 1044px 이 되어 노트북 화면을 통째로 덮는다.
   가로로 눕히고(16:9) 세로를 420px 로 막는다 — 사진 아래 내용이 같이 보이는 선이다. */
.detail-img{ aspect-ratio: 16 / 9; max-height: 420px; width: 100%;
             border-radius: 12px; overflow: hidden; }
.detail-img > img{ width: 100%; height: 100%; object-fit: cover; display: block; }

/* 간격은 반드시 이 변수로 쓴다. gap:16px 처럼 숫자를 직접 적으면 자리마다 값이 갈린다. */`;

/* 썸네일(카드) 모양.
   골격만 정하고 카드 모양을 안 정했더니, 어느 레이아웃을 골라도 카드가 똑같이
   생겨 사이트가 다 비슷해 보였다(2026-08-05). 카드 모양을 따로 축으로 뺀다. */
export type ThumbKey = "square" | "wide" | "tall" | "overlay" | "row" | "text";

export const THUMBS: {
  key: ThumbKey;
  label: string;
  /** 이미지 비율 (가로:세로) */
  ratio: string;
  /** CSS aspect-ratio 값. 비율을 글로만 적으면 flex가 잡아당겨 타원이 된다 —
   *  실제로 그 사고가 나서 「만든 뒤 눈으로 확인하라」는 규칙까지 적었는데,
   *  눈으로 확인하라는 규칙은 지켜지지 않는다. 값으로 박는다. */
  aspect: string | null;
  /** 카드 안에서 무엇이 어디에 놓이나 */
  shape: string;
  fits: string;
  /** 이 카드의 CSS. 사진 자리 비율과 글자 자리를 함께 정한다. */
  css: string;
  /** 이 CSS 가 요구하는 HTML 구조.
   *
   *  CSS 만 주면 `.thumb` · `.body` 같은 이름을 만드는 쪽이 지어낸다.
   *  실제로 그랬다 — 견본을 만들면서 overlay 카드의 글자를 사진 「아래」에 뒀고,
   *  겹침이 아닌데도 아무 경고 없이 그럴듯하게 나왔다(2026-08-08).
   *  틀린 줄 모르는 게 제일 위험하므로, 구조를 값으로 준다. */
  html: string;
}[] = [
  {
    key: "square",
    label: "정사각 카드",
    ratio: "1:1",
    aspect: "1 / 1",
    shape: "사진이 카드 위쪽을 정사각으로 채우고, 아래에 제목 → 보조정보 → 가격.",
    fits: "상품·공구처럼 물건 자체를 보여줄 때",
    css: `.card { background: none; border: 0; box-shadow: none; display: block; }
.card .body { padding: 16px 0 0; }
.card .thumb { aspect-ratio: 1 / 1; border-radius: 12px; overflow: hidden; position: relative; }
.card .thumb > img { width: 100%; height: 100%; object-fit: cover; display: block; }`,
    html: `<article class="card square">
  <div class="thumb"><img src="사진.jpg" alt=""></div>
  <div class="body">
    <h3>제목</h3>
    <p class="meta">보조정보</p>
    <p class="price">29,000원</p>
  </div>
</article>`,
  },
  {
    key: "wide",
    label: "와이드 카드",
    ratio: "16:9",
    aspect: "16 / 9",
    shape: "가로로 넓은 사진 아래 제목 두 줄까지. 재생 시간·배지는 사진 위 우하단에.",
    fits: "강의·영상처럼 화면을 담는 것",
    css: `.card { background: none; border: 0; box-shadow: none; display: block; }
.card .body { padding: 16px 0 0; }
.card .thumb { aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; position: relative; }
.card .thumb > img { width: 100%; height: 100%; object-fit: cover; display: block; }
/* 재생 시간·배지는 사진 안 우하단 */
.card .thumb .badge { position: absolute; right: 8px; bottom: 8px; }`,
    html: `<article class="card wide">
  <div class="thumb">
    <img src="사진.jpg" alt="">
    <span class="badge">12:40</span>   <!-- 배지는 반드시 .thumb 안 -->
  </div>
  <div class="body"><h3>제목</h3><p class="meta">보조정보</p></div>
</article>`,
  },
  {
    key: "tall",
    label: "세로 카드",
    ratio: "3:4",
    aspect: "3 / 4",
    shape: "세로로 긴 사진에 제목을 아래 얹는다. 한 줄에 적게 넣는다.",
    fits: "패션·인테리어처럼 분위기를 파는 것",
    css: `.card { background: none; border: 0; box-shadow: none; display: block; }
.card .body { padding: 16px 0 0; }
.card .thumb { aspect-ratio: 3 / 4; border-radius: 12px; overflow: hidden; }
.card .thumb > img { width: 100%; height: 100%; object-fit: cover; display: block; }`,
    html: `<article class="card tall">
  <div class="thumb"><img src="사진.jpg" alt=""></div>
  <div class="body"><h3>제목</h3><p class="meta">보조정보</p></div>
</article>`,
  },
  {
    key: "overlay",
    label: "사진 위 겹침",
    ratio: "4:3",
    aspect: "4 / 3",
    shape: "사진 위에 어두운 그라데이션을 깔고 제목·태그를 그 위에 얹는다. 카드 밖에 글자가 없다.",
    fits: "여행지·매장처럼 사진 한 장으로 설명되는 것",
    css: `.card { background: none; border: 0; box-shadow: none; display: block; }
.card .thumb { aspect-ratio: 4 / 3; border-radius: 12px; overflow: hidden; position: relative; }
.card .thumb > img { width: 100%; height: 100%; object-fit: cover; display: block; }
/* 글자가 사진 위에 놓이므로 어둠막이 없으면 밝은 사진에서 안 읽힌다 */
.card .thumb::after { content: ""; position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,.72) 0%, rgba(0,0,0,.45) 38%, rgba(0,0,0,0) 72%); }
.card .body { position: absolute; left: 14px; right: 14px; bottom: 12px; padding: 0; color: #fff; z-index: 1; }
/* ⭐ 사진이 아직 없을 때는 어둠막을 걷는다 — 옅은 자리표시자 위에 검정을 덮으면
   자리표시자 글이 묻혀 «깨진 그림»처럼 보인다. 사진을 넣으면 이 줄만 지우면 된다. */
.card .thumb.is-placeholder::after { display: none; }
.card .thumb.is-placeholder + .body, .card .thumb.is-placeholder .body {
  position: static; color: var(--text); padding: 12px 2px 0; }`,
    html: `<article class="card overlay">
  <div class="thumb">
    <img src="사진.jpg" alt="">
    <div class="body">          <!-- .thumb 「안」이다. 밖에 두면 안 겹친다 -->
      <h3>제목</h3><p class="meta">태그 · 태그</p>
    </div>
  </div>
</article>`,
  },
  {
    key: "row",
    label: "가로 행",
    ratio: "1:1 (왼쪽 고정)",
    aspect: "1 / 1",
    shape: "왼쪽에 작은 정사각 썸네일, 오른쪽에 제목·정보, 맨 끝에 액션 버튼.",
    fits: "비교하며 훑는 목록",
    css: `.card.row { background: none; border: 0; box-shadow: none;
  display: flex; align-items: center; gap: var(--row-gap); padding: 12px 0; }
/* 썸네일은 폭을 고정한다 — flex 가 잡아당기면 정사각이 깨진다 */
.card.row .thumb { flex: none; width: 96px; aspect-ratio: 1 / 1; border-radius: 10px; overflow: hidden; }
.card.row .thumb > img { width: 100%; height: 100%; object-fit: cover; display: block; }
.card.row .body { flex: 1; min-width: 0; padding: 0; }
@media (max-width: 720px) { .card.row .thumb { width: 72px; } }`,
    html: `<article class="card row">
  <div class="thumb"><img src="사진.jpg" alt=""></div>
  <div class="body"><h3>제목</h3><p class="meta">보조정보</p></div>
  <button class="btn">예약</button>   <!-- 액션은 맨 끝 -->
</article>`,
  },
  {
    key: "text",
    label: "사진 없는 카드",
    ratio: "없음",
    aspect: null,
    shape: "사진을 쓰지 않는다. 제목·숫자·배지만으로 위계를 만든다. 좌측에 색 띠 한 줄.",
    fits: "표·대시보드처럼 숫자가 주인공인 화면",
    css: `/* 사진이 없으므로 왼쪽 색 띠가 카드의 경계를 대신한다 */
.card.text { background: none; border: 0; box-shadow: none;
  border-left: 3px solid var(--primary); padding: 4px 0 4px 14px; }
.card.text .num { font-size: 28px; font-weight: 800; font-variant-numeric: tabular-nums; }`,
    html: `<article class="card text">
  <p class="lb">오늘 예약</p>
  <p class="num">14</p>
</article>`,
  },
];

export const thumbByKey = (k: ThumbKey) => THUMBS.find((t) => t.key === k) ?? THUMBS[0];

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
  /** 이 골격이 화면을 어떻게 나누는가 */
  structure: StructureKey;
  /** 이 골격이 기본으로 쓰는 카드 모양 */
  thumb: ThumbKey;
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
    structure: "grid",
    thumb: "square",
    fits: "예약·검색이 시작점인 서비스(숙소·강의·매장 찾기)",
  },
  {
    key: "showcase",
    label: "사진 중심형",
    tagline: "결과물이 곧 상품. 사진을 먼저 보여주고 글은 나중에.",
    hero: "검색바 없이 사진 모자이크(큰 1장 + 작은 4장). 문구는 사진 아래에 겹치지 않게.",
    list: "3열(1440px에서 카드 453px). 큰 이미지 위에 제목·태그를 얹고 설명은 짧게. 1024px에서 2열, 720px 아래로는 1열.",
    nav: "상단 가로 GNB + 그 아래 카테고리 줄(2단 헤더).",
    detail: "상단 전체 폭 갤러리 → 아래 정보. 액션은 하단 고정 바.",
    structure: "multi",
    thumb: "overlay",
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
    structure: "sidebar",
    thumb: "row",
    fits: "비교해서 고르는 서비스(중개·구인·상품 비교)",
  },
  {
    key: "split",
    label: "좌우 분할형",
    tagline: "말할 게 분명하다. 왼쪽은 글, 오른쪽은 행동.",
    hero: "좌우 2단. 왼쪽에 큰 제목과 설명, 오른쪽에 폼 또는 대표 이미지.",
    list: "3열(1440px에서 카드 453px). 카드 안은 사진 없이 글자 위계로만 나눈다. 1024px에서 2열, 720px 아래로는 1열.",
    nav: "상단 가로 GNB. 로고 왼쪽, 액션 버튼 오른쪽 끝.",
    detail: `본문 한 단(최대 폭 ${READING_WIDTH}px) + 하단 고정 액션 바.`,
    structure: "multi",
    thumb: "wide",
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
    structure: "sidebar",
    thumb: "text",
    fits: "관리자·백오피스·사장님 화면",
  },
  {
    key: "magazine",
    label: "에디토리얼형",
    tagline: "읽히는 화면. 글이 먼저 오고 사진이 뒤를 받친다.",
    hero: "큰 사진을 두지 않는다. 왼쪽에 세로 목차(카테고리·연재), 오른쪽에 가로로 긴 배너 한 장.",
    list: "3열 갤러리. 사진 아래 제목과 함께 두세 줄짜리 설명을 붙인다.",
    nav: "상단 가로 GNB + 그 아래 얇은 구분선. 카테고리는 목록 화면 왼쪽에 세로로.",
    detail: `본문 한 단(최대 폭 ${READING_WIDTH}px) 가운데 정렬. 사진은 본문 폭을 넘겨 좌우로 튀어나오게.`,
    structure: "sidebar",
    thumb: "tall",
    fits: "고르는 데 설명이 필요한 것(큐레이션·전시·매거진·브랜드 소개)",
  },
  {
    key: "bold",
    label: "타이포 강조형",
    tagline: "글자가 그림이다. 숫자와 큰 글씨로 밀어붙인다.",
    hero: "어두운 배경 위에 화면 폭을 꽉 채운 큰 제목(48px 이상). 바로 아래 숫자 지표 4개를 가로 한 줄로.",
    list: "카드를 나란히 두지 않고 위아래로 조금씩 어긋나게(계단) 배치. 카드마다 큰 숫자를 하나씩 얹는다.",
    nav: "상단 가로 GNB. 어두운 배경에 흰 글자, 오른쪽 끝에 밝은 버튼 하나.",
    detail: "상단 어두운 띠에 제목과 핵심 숫자 → 아래는 밝은 배경 본문. 액션은 하단 고정 바.",
    structure: "grid",
    thumb: "square",
    fits: "숫자가 설득하는 것(공동구매·펀딩·챌린지·부트캠프)",
  },
  {
    key: "calm",
    label: "여백 중심형",
    tagline: "덜 넣는다. 큰 사진 한 장과 넉넉한 빈 자리로 말한다.",
    hero: "가운데 정렬. 짧은 문구 한 줄 위에 여백을 크게 두고, 아래에 큰 사진 딱 한 장.",
    list: `1열(본문 폭 ${READING_WIDTH}px). 카드 테두리와 그림자를 쓰지 않고 여백으로만 나눈다. 한 화면에 4~6개까지만.`,
    nav: "상단 가로 GNB. 메뉴 글자를 작게 하고 자간을 넓힌다. 로고는 가운데.",
    detail: `본문 한 단 가운데 정렬(최대 폭 ${READING_WIDTH}px). 구분선 대신 빈 줄로 나눈다.`,
    structure: "single",
    thumb: "overlay",
    fits: "차분한 인상이 중요한 것(공방·클리닉·프리미엄 브랜드·전시)",
  },
  {
    key: "bento",
    label: "벤토 그리드형",
    tagline: "크기로 말한다. 중요한 건 크게, 곁다리는 작게 한 판에 담는다.",
    hero: "히어로를 따로 두지 않는다. 첫 화면부터 크기가 다른 블록을 한 판에 짠다 — 큰 블록 1개(대표)에 작은 블록 3~4개를 붙인다.",
    list: "블록 크기를 2:1:1로 섞는다. 첫 항목만 두 칸을 차지하고 나머지는 한 칸씩. 칸 사이 간격은 일정하게.",
    nav: "상단 가로 GNB 한 줄. 블록이 이미 복잡하므로 내비는 최대한 단순하게.",
    detail: "위에 큰 블록으로 핵심 정보, 아래에 작은 블록으로 세부. 액션은 큰 블록 안에 둔다.",
    structure: "bento",
    thumb: "square",
    fits: "기능이 여럿인 것(서비스 소개·기능 안내·요약 대시보드)",
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
/**
 * 좁은 폭에서 «화면 밖으로 나가면 안 되는 것».
 *
 * 2026-08-18 펫 유치원 사이트를 실측하다 나왔다. 146개 화면 중 여덟 개가
 * 390px 에서 페이지째 좌우로 밀렸다 — 최대 97px.
 *
 * 표는 멀쩡했다. 표는 `overflow-x:auto` 상자 안에서 잘 돌고 있었다.
 * 밀어낸 것은 **표 밑의 페이지 번호 줄**과 「다음 프로그램 ›」 같은 **이동 단추**다.
 * 쪽수가 늘수록 더 밀린다(9쪽짜리가 +97px). 만드는 쪽은 표만 감싸고
 * 그 옆에 붙는 것들은 그냥 한 줄로 두기 때문이다.
 *
 * 스펙팩이 「반응형」이라고만 적고 **넘치면 안 된다는 말을 안 했다.**
 * 「폰에서 1열」 같은 열 수 이야기는 있었지만, 가로로 밀리는지는 아무도 안 봤다.
 */
export const NARROW_OVERFLOW = {
  /** 이 폭에서 페이지가 좌우로 스크롤되면 실패다 */
  testWidth: 390,
  rule: [
    "폰 폭(390px)에서 **페이지가 좌우로 스크롤되면 안 됩니다.** 표·그림처럼 일부러 옆으로 넘기는 것은 자기 상자 안에서만 넘깁니다.",
    "**페이지 번호 줄**은 줄바꿈하거나(`flex-wrap: wrap`) 자기 상자 안에서 옆으로 돌립니다(`overflow-x: auto`). 쪽수가 늘면 그만큼 길어지므로 한 줄로 두면 반드시 넘칩니다.",
    "**「이전 · 다음」 같은 이동 단추**는 줄바꿈을 허용하고, 글자가 길면 줄여 적습니다(`다음 프로그램 ›` → `다음 ›`).",
    "**표**는 `overflow-x: auto` 상자로 감쌉니다. 표 자체를 좁히지 않습니다 — 칸 글자가 세로로 접혀 읽을 수 없게 됩니다.",
    "**탭 줄·필터 줄**도 같습니다. 개수가 늘어나는 줄은 전부 줄바꿈이나 상자 안 스크롤 중 하나를 씁니다.",
  "⛔ 옆으로 흘려보낼 때는 **다른 축을 반드시 막습니다** — \`overflow: auto hidden\`. \`overflow-x\` 만 열면 브라우저가 세로도 함께 열어, 테두리 1px 때문에 세로 스크롤바가 생깁니다.",
  "⛔ **푸터는 화면 바닥에 붙입니다.** 내용이 짧은 화면(완료·빈 목록·오류)에서 푸터가 화면 가운데 떠 있으면 «덜 만들어진 화면»으로 보입니다. `body` 를 세로 flex 로 두고 푸터에 `margin-top: auto` 를 줍니다.",
  "⛔ **`[hidden]` 을 쓸 때는 `[hidden] { display: none !important; }` 을 반드시 함께 넣습니다.** `[hidden]` 은 브라우저 기본값이라 `.row { display: flex }` 같은 규칙 하나에도 집니다. 그러면 «거르는 단추를 눌러도 목록이 안 줄어드는» 화면이 됩니다 — 숫자 안내만 바뀌고 목록은 그대로라, 눌러 보지 않으면 안 보입니다.",
  "⛔ **그리드·플렉스 칸의 자식에는 `min-width: 0` 을 줍니다.** 기본값이 `auto` 라, 칸을 340px 로 정해도 내용이 그보다 넓으면 칸 밖으로 삐져나와 옆 칸을 덮습니다.",
  "⛔ **여백을 지우는 클래스(`flush` 등)와 음수 마진을 «같이» 쓰지 않습니다.** 상쇄할 여백이 이미 없는데 음수 마진을 걸면 그만큼 넓어져 칸 밖으로 나갑니다.",
  ],
} as const;

/**
 * 손님이 «자기 정보로 바꿀 값»은 한 곳에만 둔다.
 *
 * 2026-08-18 펫 유치원 사이트에서 상호가 데이터 파일 밖 **열 곳**에 글자로
 * 박혀 있었다(화면 코드 여섯 곳 · index.html 두 곳 …). 데이터 파일의 상호만
 * 바꾸면 그 열 곳은 옛 이름 그대로 남는다.
 *
 * 손님이 받아서 제일 먼저 하는 일이 「우리 가게 정보로 바꾸기」다.
 * 그게 한 곳에서 안 끝나면, 손님은 옛 이름이 남은 사이트를 열게 된다.
 */
export const SINGLE_SOURCE_DATA = {
  fields: ["상호", "주소", "전화번호", "이메일", "영업시간", "로고·대표 이미지"],
  rule: [
    "위 값은 **데이터 파일 한 곳**에 모으고, 화면은 전부 그 값을 불러 씁니다.",
    "화면 코드·헤더·푸터는 물론 **페이지 제목(`<title>`)과 메타 설명까지** 그 값을 씁니다 — 여기가 제일 자주 빠집니다.",
    "안내 문구 안에 상호가 섞여 있어도(예: 「내비게이션에 ‘○○’를 넣으세요」) 글자로 적지 말고 값을 끼워 넣습니다.",
    "다 만든 뒤 **상호를 다른 이름으로 한 번 바꿔 보고** 옛 이름이 남는 곳이 있는지 찾아 보세요. 한 곳이라도 남으면 아직 안 끝난 것입니다.",
  ],
} as const;

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
    /* ⛔ 2026-08-18: 자리표시자 규칙과 「사진 위 겹침」 카드가 서로를 안 보고 있었다.
       겹침 카드는 사진 위에 검정 72% 어둠막을 깔고 흰 글자를 얹는데, 배달 시점엔
       사진이 없고 옅은 파스텔 자리표시자가 온다. 그 위에 검정을 덮으니 자리표시자의
       회색 글자가 묻혀 «썸네일이 깨졌다»로 보였다. 규칙 둘이 만나는 곳을 아무도 안 정했다. */
    "**「사진 위 겹침」 카드에서는 사진이 들어오기 전까지 어둠막을 걸지 않는다.** 옅은 자리표시자 위에 어두운 막을 덮으면 안에 적은 글이 묻혀 «깨진 그림»으로 보인다. 제목·태그는 자리표시자 아래에 본문 색으로 두었다가, 실제 사진을 넣을 때 위로 올린다.",
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
  L.push(...ACCENT_RULE);
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
/* 간격은 밀도에서 나온다.
   전에는 카드 안쪽·행 높이·섹션 사이 셋만 정해 두고 나머지는 만드는 사람이
   그때그때 골랐다. 그러다 눈금에 없는 값(--s7)을 쓴 자리가 생겼고, CSS는
   정의 없는 변수를 만나면 그 속성을 통째로 버려서 간격이 0이 됐다.
   조용히 사라지는 종류의 사고라 눈으로만 찾을 수 있었다(2026-08-05).
   그래서 자리마다 값을 밀도별로 다 정해 둔다. 고정 표가 아니라 밀도별 눈금이다. */
export const DENSITIES: {
  key: Density;
  label: string;
  /** 카드 안쪽 여백 */
  cardPad: string;
  /** 표 한 줄 높이 */
  rowH: string;
  /** 섹션과 섹션 사이 */
  sectionGap: string;
  /** 화면 좌우 여백 */
  wrapPad: string;
  /** 카드와 카드 사이 */
  cardGap: string;
  /** 제목과 그 아래 내용 사이 */
  titleGap: string;
  /** 한 묶음 안에서 요소끼리 */
  itemGap: string;
  /** 한 덩어리(지표 줄·표 등)와 그 아래 버튼 사이 */
  blockGap: string;
  /** 나란히 놓인 버튼끼리 */
  btnGap: string;
  /** 세로로 쌓은 버튼끼리 — 옆으로 놓을 때보다 조금 더 벌린다 */
  btnStackGap: string;
  /** 세로로 이어 붙인 항목끼리 — 목록 줄, 쌓인 카드. 가로보다 훨씬 좁다 */
  stackGap: string;
  /** 큰 제목(30px 이상)의 줄 간격 */
  lineDisplay: string;
  /** 일반 제목의 줄 간격 */
  lineTitle: string;
  /** 본문 줄 간격 */
  lineBody: string;
  /** 표·배지처럼 빽빽한 자리의 줄 간격 */
  lineDense: string;
}[] = [
  {
    key: "cozy", label: "넉넉하게",
    cardPad: "24px", rowH: "48px", sectionGap: "40px",
    wrapPad: "24px", cardGap: "20px", titleGap: "16px", itemGap: "12px", blockGap: "28px", btnGap: "8px",
    btnStackGap: "10px", stackGap: "8px",
    lineDisplay: "1.25", lineTitle: "1.35", lineBody: "1.7", lineDense: "1.45",
  },
  {
    key: "compact", label: "컴팩트",
    cardPad: "16px", rowH: "40px", sectionGap: "28px",
    wrapPad: "16px", cardGap: "14px", titleGap: "12px", itemGap: "8px", blockGap: "20px", btnGap: "6px",
    btnStackGap: "8px", stackGap: "6px",
    lineDisplay: "1.2", lineTitle: "1.3", lineBody: "1.6", lineDense: "1.35",
  },
];

/** 간격 자리 이름 — 프리셋 문서의 표와 JSON이 같은 순서로 쓴다 */
export const SPACING_SLOTS: { key: keyof (typeof DENSITIES)[number]; label: string; when: string }[] = [
  { key: "wrapPad", label: "화면 좌우 여백", when: "본문이 화면 가장자리에 닿지 않게" },
  { key: "sectionGap", label: "섹션과 섹션 사이", when: "화면 안에서 이야기가 바뀌는 자리" },
  { key: "cardPad", label: "카드 안쪽 여백", when: "카드·박스 테두리와 내용 사이" },
  { key: "cardGap", label: "카드와 카드 사이 (가로)", when: "격자로 나란히 늘어놓을 때" },
  // 카드에 상자가 없으면 좌우와 같은 값으로는 줄이 안 갈린다.
  // 위 카드의 가격과 아래 카드의 사진이 붙어 한 덩어리로 읽힌다(2026-08-06).
  { key: "blockGap", label: "카드 줄과 줄 사이 (세로)", when: "격자가 두 줄 넘게 이어질 때" },
  { key: "stackGap", label: "항목과 항목 사이 (세로)", when: "목록처럼 위아래로 이어 붙일 때" },
  { key: "titleGap", label: "제목과 그 아래 내용", when: "제목 바로 밑" },
  { key: "itemGap", label: "묶음 안 요소끼리", when: "한 카드 안의 줄과 줄" },
  { key: "blockGap", label: "덩어리와 그 아래 버튼", when: "지표 줄·표 다음에 오는 액션" },
  { key: "btnGap", label: "버튼끼리 (가로)", when: "나란히 놓인 버튼 사이" },
  { key: "btnStackGap", label: "버튼끼리 (세로)", when: "폭 꽉 찬 버튼을 위아래로 쌓을 때" },
  { key: "rowH", label: "표 한 줄 높이", when: "표의 행" },
];

/** 강조색을 어디에 쓰는가 — 배경이냐 글자냐.
 *
 * 팩을 받는 쪽에는 원래 강조색이 하나만 나갔다. 그래서 그 값이 배지 글자·태그·
 * 링크에도 쓰였는데, 여섯 테마 중 다섯은 배경 위 대비가 1.2~2.7 이라 안 읽혔다.
 * 파는 팩과 유저 팩이 각자 문장을 쓰면 반드시 갈라지므로(2026-08-06 에 겪었다)
 * 여기 한 벌만 두고 양쪽이 같이 읽는다. */
export const ACCENT_RULE: string[] = [
  "> **강조색은 두 개입니다 — 배경용과 글자용.**",
  "> `accent` 는 **배경·배지 바탕·띠·구분선**에만 씁니다. 글자에는 `accent-text` 를 쓰세요.",
  ">",
  "> 강조색은 눈에 띄라고 밝게 잡은 색이라, 밝은 배경 위에 글자로 얹으면 대비가 2:1 남짓까지",
  "> 떨어져 **보이긴 하는데 읽히지는 않습니다.** 그래서 같은 계열의 진한 값을 따로 드립니다.",
  ">",
  "> - 배지: `accent` 를 10~15% 농도로 깔고 글자는 `accent-text`",
  "> - 태그·링크·강조 문구: `accent-text`",
  "> - 버튼 배경·형광펜·좌측 색 띠: `accent`",
  "> - **어두운 바탕 위**(짙은 히어로·하단 바·사진 어둠막)에서는 `accent-text` 가 거꾸로 안 보입니다.",
  ">   진하게 잡은 값이라 그렇습니다. 거기에는 `accent-text-dark` 를 쓰세요.",
  "",
  "> 정리하면 **강조는 세 자리**입니다. 배경이 무엇이냐로 고르면 됩니다.",
  ">",
  "> | 자리 | 언제 |",
  "> | --- | --- |",
  "> | `accent` | 배경·배지 바탕·띠·형광펜 — **글자 아님** |",
  "> | `accent-text` | 밝은 바탕 위 글자 |",
  "> | `accent-text-dark` | 어두운 바탕 위 글자 |",
  "",
  "> **그리고 반대 방향이 하나 더 있습니다 — 색을 «바탕으로» 깔았을 때.**",
  ">",
  "> 채운 버튼(`background: primary`)이나 배지 바탕(`background: accent`) 위에 얹는 글자는",
  "> **흰색을 쓰세요.** 아래 표의 `on-primary` · `on-accent` 가 여섯 테마 모두 흰색입니다.",
  ">",
  "> 2026-08-20 에 주색과 강조색을 «흰 글자가 읽히는 진하기»로 맞췄습니다.",
  "> 전에는 흰 글자가 안 되는 자리가 많았습니다 — 주색은 레트로 3.28 · 코럴 3.14,",
  "> 강조색은 여섯 중 다섯이 미달이었습니다(바이올렛은 1.41 까지 떨어졌습니다).",
  "> 색기(色氣)는 그대로 두고 밝기만 내려, 지금은 모두 4.5 를 넘습니다.",
  ">",
  "> ⛔ 그래도 «눈대중»으로 고르지는 마세요. 표에 적힌 값을 그대로 쓰면 됩니다.",
  "> `accent-text-dark` 는 여전히 밝은 원색입니다 — **어두운 바탕 위** 글자용이라 그렇습니다.",
  "",
];

/** 색·밀도와 상관없이 어느 사이트에나 걸리는 규칙.
 *
 * 파는 팩(build-design-presets.mts)과 유저가 받는 팩(buildDetailedPresetMarkdown)이
 * 각자 문서를 만들다 보니, 오늘 정한 규칙 열 가지가 파는 쪽에만 실렸다.
 * 유저 문서는 오히려 "카드 = surface 배경, border 1px"라고 반대로 말하고 있었다.
 * 두 벌로 적으면 반드시 갈라진다 — 여기 한 벌만 두고 양쪽이 같이 읽는다(2026-08-06). */
export const COMMON_RULES: string[] = [
  "### 좁은 화면에서 넘치지 않게",
  "",
  `폰 폭(**${NARROW_OVERFLOW.testWidth}px**)에서 **페이지가 좌우로 스크롤되면 안 됩니다.**`,
  "표·그림처럼 일부러 옆으로 넘기는 것은 «자기 상자 안에서만» 넘깁니다.",
  "",
  "**왜 적어 두나** — 열 수(1024에서 2열, 720에서 1열)는 다들 맞추는데, 가로로 밀리는지는 잘 안 봅니다.",
  "그리고 미는 것은 대개 표가 아닙니다. **표 밑의 페이지 번호 줄**과 「다음 프로그램 ›」 같은",
  "이동 단추가 한 줄로 늘어서면서 밉니다 — 표는 감쌌는데 그 옆은 안 감싸기 때문입니다.",
  "",
  ...NARROW_OVERFLOW.rule.map((r) => `- ${r}`),
  "",
  "```css",
  "/* 개수가 늘어나는 줄은 접거나, 자기 상자 안에서 돌린다 */",
  ".pager { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; }",
  ".tabs, .filters { display: flex; flex-wrap: wrap; gap: 8px; }",
  ".tabs-scroll { overflow: auto hidden; }  /* 탭을 옆으로 흘릴 때도 마찬가지 */",
  "",
  "/* 줄바꿈 대신 «옆으로 흘려보낼» 때는 반드시 두 축을 다 적는다 */",
  ".scroll-x { overflow: auto hidden; }   /* overflow-x 만 쓰면 세로 스크롤바가 생긴다 */",
  "",
  "/* 표는 좁히지 말고 감싼다 — 좁히면 칸 글자가 세로로 접혀 못 읽는다 */",
  ".table-wrap { overflow: auto hidden; }   /* x 만 열면 세로 스크롤바가 딸려 온다 */",
  ".table-wrap table { min-width: max-content; }",
  "",
  "/* 좌우로 벌리는 줄에 긴 단추가 들어오면 내려보낸다 */",
  ".row-between { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }",
  "",
  "/* 푸터는 «화면 바닥»에 붙인다 — 짧은 화면에서 가운데 떠 있으면 안 만들어진 것처럼 보인다 */",
  "body { min-height: 100dvh; display: flex; flex-direction: column; }",
  "body > main { flex: 1 0 auto; }",
  "body > footer { margin-top: auto; }",
  "",
  "/* ⛔⛔ 거르기가 목록을 못 줄이는 사고는 거의 다 여기서 난다.",
  "   [hidden] 은 «브라우저 기본값»이라 .row{display:flex} 한 줄에도 진다.",
  "   숫자 안내는 바뀌는데 목록만 그대로인 화면이 만들어진다. */",
  "[hidden] { display: none !important; }",
  "",
  "/* ⛔ 위 푸터 규칙은 «body 에만» 씁니다. 감싸개(.app 같은 것)에 옮겨 붙이지 마세요.",
  "   사이드바형(감싸개가 grid 2열)에 flex-direction:column 을 덮었더니",
  "   사이드바가 화면 폭을 다 먹고 본문이 그 아래로 밀렸습니다(2026-08-19에 실제로 그랬습니다).",
  "   감싸개는 «제 짜임 그대로» 둡니다 — 사이드바형이면 grid 2열, 상단바형이면 세로 flex.",
  "   짜임이 다른 화면 두 가지를 꼭 같이 열어 보세요. 한쪽에서 되는 것이 다른 쪽을 무너뜨립니다. */",
  "",
  "/* 사진 위에 얹는 단추(카드 위 찜 하트·빠른 담기)는 사진에 덮여 안 눌립니다.",
  "   «얹은 단추에만» 아래 둘을 주세요 — 줄 안에 서는 단추에 주면 자리가 튑니다. */",
  ".card { position: relative; }              /* 얹을 자리의 기준점 */",
  ".card > .overlay-btn { position: absolute; z-index: 2; }",
  "",
  "/* 그리드·플렉스 자식은 min-width 를 0 으로 — 안 그러면 칸보다 넓은 내용이 삐져나온다 */",
  ".split-r > *, .split-l > *, .app > * { min-width: 0; }",
  "```",
  "",
  "### 읽기 폭 — 글을 한 단으로 좁힐 때",
  "",
  `글이 주인공인 자리(상세 본문·안내·약관)는 **최대 ${READING_WIDTH}px** 로 좁히고 가운데 정렬합니다.`,
  "콘텐츠 영역(위의 최대 폭) **안에서** 좁히는 것입니다 — 바깥 폭을 바꾸는 게 아닙니다.",
  "",
  "**왜 좁히나** — 한 줄이 길면 다음 줄 첫 글자를 눈이 못 찾습니다. 1440px 폭에 본문을 꽉 채우면",
  "한 줄에 90자가 넘어가고, 읽는 사람은 두세 줄마다 같은 줄을 다시 읽게 됩니다.",
  "",
  `- **이 값 하나만 씁니다.** 화면마다 680·720·760 처럼 다르게 잡지 마세요 — 저희도 그렇게 적혀 있었고,`,
  "  같은 팩 안의 상세 화면끼리 본문 폭이 달라 서로 다른 사이트처럼 보였습니다.",
  `- **카드 격자에는 쓰지 않습니다.** 여기는 «글»을 좁히는 값입니다. 카드를 몇 열로 놓을지는 레이아웃이 정합니다.`,
  "- 사진·표·코드처럼 넓어야 읽히는 것은 이 폭을 넘겨도 됩니다. 좁히는 건 글줄입니다.",
  "",
  "### 줄어드는 지점 — 두 곳만 씁니다",
  "",
  `화면이 좁아질 때 칸이 줄어드는 지점은 **${BREAKPOINTS.mid}px** 와 **${BREAKPOINTS.narrow}px**, 이 둘뿐입니다.`,
  `${BREAKPOINTS.mid} 은 태블릿 가로, ${BREAKPOINTS.narrow} 은 세로입니다. ${BREAKPOINTS.narrow}px 아래에서는 좌우 여백도 ${BREAKPOINTS.padXNarrow} 로 줄입니다.`,
  "",
  "- **여기 없는 지점을 새로 만들지 마세요.** 560·860·520 처럼 지어낸 지점이 섞이면, 같은 팩으로 만든 화면끼리 줄어드는 자리가 달라 서로 다른 사이트처럼 보입니다.",
  "- 더 잘게 나눠도 사람 눈에는 안 보입니다. 대신 **지킬 곳만 늘어납니다.**",
  "- 두 지점에서 열이 어떻게 줄어드는지는 위 레이아웃 표에 적혀 있습니다(예: 3열 → 2열 → 1열).",
  "",
  "### 격자 — 카드를 늘어놓는 자리",
  "",
  "카드·타일을 격자로 늘어놓을 때 **좌우와 위아래를 다른 값으로** 벌립니다.",
  "",
  "| 자리 | 값 |",
  "| --- | --- |",
  "| **카드와 카드 사이** (좌우) | 위 눈금의 「카드와 카드 사이 (가로)」 |",
  "| **줄과 줄 사이** (위아래) | 위 눈금의 「덩어리와 덩어리 사이」 |",
  "",
  "**같은 값을 쓰면 줄이 안 갈립니다.** 카드에 상자가 있을 때는 테두리가 경계를 만들어 줬지만,",
  "상자를 걷어낸 뒤로는 **위 카드의 가격과 아래 카드의 사진이 붙어** 한 덩어리로 읽힙니다.",
  '위아래를 더 벌려야 "여기까지가 한 줄"이 보입니다.',
  "",
  "| 나누는 것 | 정하는 곳 |",
  "| --- | --- |",
  "| 몇 열로 나눌지 | 레이아웃 프리셋 |",
  "| **사이를 얼마나 벌릴지** | **위 간격 눈금 (좌우·위아래 따로)** |",
  "| 카드가 어떻게 생겼는지 | 카드 모양 |",
  "",
  "- **레이아웃 프리셋이 「넓게」라고 해도 값을 새로 만들지 마세요.** 레이아웃은 *몇 열로 무엇을 어디에*를",
  "  말하는 층이고, *얼마나 벌릴지*는 이 눈금이 정합니다. 실제로 그 한 줄 때문에 40px을 쓴 격자가 있었고,",
  "  같은 화면의 다른 격자는 16px이라 두 값이 나란히 놓였습니다.",
  "",
  "**간격은 변수로 못 박고, 자리마다 그것만 씁니다.** CSS 맨 위에 이걸 그대로 붙여 넣으세요.",
  "",
  "```css",
  /* 손으로 다시 적지 않는다.
     원래 여기에 --card-gap 두 줄만 손으로 적어 뒀는데, gridBaseCss() 에 값을 더 넣어도
     이쪽은 안 따라와서 무료 샘플만 옛 값을 들고 있었다(2026-08-08).
     한 군데서 나오게 한다. */
  gridBaseCss(),
  "```",
  "",
  "- **`--card-pad`·`--row-h`·`--btn-gap` 도 꼭 쓰세요.** 카드 안쪽 여백, 표 한 줄 높이,",
  "  버튼 사이 간격입니다. 이 셋을 안 정해주면 화면마다 다르게 나옵니다 — 저희도 겪었습니다.",
  "- **`.stats`·`.mosaic`·`.detail-img` 는 카드 격자와 다른 자리입니다.** 지표 숫자 줄,",
  "  홈의 큰 사진 한 장 + 작은 넷, 상세 화면의 대표 사진. 카드 규칙을 여기 갖다 쓰면",
  "  사진이 화면을 다 덮습니다.",
  "",
  "- **격자에 `gap: 20px` 처럼 숫자를 직접 쓰지 마세요.** 한 번 쓰는 순간 그 자리만 달라지고,",
  "  나중에 값을 바꿀 때 그 자리만 안 바뀝니다. 실제로 한 사이트에서 좌우가 3·8·16·20·24px",
  "  다섯 가지로 갈라진 적이 있습니다 — 전부 `gap:` 에 숫자를 적어서 생긴 일입니다.",
  "- **`gap` 한 줄로 합치지도 마세요.** 좌우와 위아래는 값이 다르므로 `column-gap`·`row-gap` 둘로 씁니다.",
  "- **이름도 이대로 씁니다.** `--grid-x`·`--gap-col` 처럼 제 나름의 이름을 지으면, 나중에",
  "  다른 사람이 볼 때 그게 같은 자리인지 알 수가 없습니다. 실제로 같은 규칙을 준 두 사이트가",
  "  하나는 `--grid-x/--grid-y`, 하나는 `--gap-col/--gap-row` 를 써서 값이 따로 놀았습니다.",
  "- 값을 바꾸고 싶으면 **`:root` 의 두 줄만** 고칩니다. 그러면 화면 전체가 한 번에 따라옵니다.",
  "- 히어로의 좌우 2단처럼 **카드 격자가 아닌 자리**는 이 규칙 밖입니다. 거기는 화면 뼈대라 레이아웃이 정합니다.",
  "",
  "### 박스형 콘텐츠 — 몇 개를 늘어놓고 사진은 어떤 비율로",
  "",
  "사진이 든 카드를 격자로 늘어놓을 때, **몇 개를 놓느냐가 사진 비율을 정합니다.**",
  "",
  "| 한 줄에 | 사진 비율 | 왜 |",
  "| --- | --- | --- |",
  "| **2개** | **4:3** | 칸이 넓으니 가로로 넓은 사진 |",
  "| **3개** | **4:3** | 위와 같음 |",
  "| **4개** | **1:1** | 칸이 좁다. 정사각이 가장 얌전하다 |",
  "",
  "4개짜리를 세로로 긴 3:4로 뒀더니 **카드 한 줄이 화면을 다 먹었습니다.** 칸이 좁을수록 세로로",
  "길게 두고 싶어지지만, 그러면 한 줄만 보이고 다음 단락이 안 보입니다. 좁은 칸에는 정사각입니다.",
  "",
  "- **한 줄에 하나만 두지 않습니다.** 마지막 줄에도 하나만 남기지 마세요 —",
  "  **항목 수를 열 수에 맞춰** 3열이면 3·6·9개, 4열이면 4·8개로 둡니다.",
  "- **한 사이트에서 카드 사진 비율은 하나입니다.** 위 표의 짝(2·3열↔4:3, 4열↔1:1) 밖의 비율은 만들지 마세요.",
  "  같은 홈에 세로 카드와 16:9가 섞여 있어서 **사는 사람이 사진을 두 벌 준비해야 했던** 적이 있습니다.",
  "- **배너·차트·영상·프로필은 이 규칙 밖입니다.** 가로로 긴 배너·영상(16:9)·프로필(1:1)은 제 나름의 비율이 있습니다.",
  "- 상품 사진처럼 **정사각이 업계 표준인 분야**는 1:1을 써도 됩니다. 다만 그때도 한 사이트 안에서는 하나로 갑니다.",
  '- **가로 배너 한 장으로 한 단락을 채우지 마세요.** 배너는 위 표 밖이지만 "한 줄에 하나만 두지 않는다"는 그대로 걸립니다.',
  "  배너 한 장이 있던 자리는 **두 장으로 나누고** 4:3으로 맞추세요.",
  "- **가로로 넘기는 줄(캐러셀)도 몇 개 보이느냐로 셉니다.** 뒤에 더 있어도 눈에 4개가 보이면 4개 — 비율도 1:1입니다.",
  "  카드 폭을 `260px`처럼 박아 두면 화면 폭이 바뀔 때 3.4개씩 어정쩡하게 걸치니, **칸 수로 나눠서** 정하세요.",
  "- **가로로 넘기는 줄에는 좌우 화살표를 두고, 아래 스크롤바는 감춥니다.** 넘길 게 있다는 건",
  "  화살표가 알려 줍니다. 스크롤바까지 나오면 줄 밑에 회색 막대가 하나 더 생겨 지저분합니다.",
  "",
  "```css",
  ".carousel{ scrollbar-width:none; -ms-overflow-style:none; }",
  ".carousel::-webkit-scrollbar{ display:none; }",
  "```",
  "",
  "  화살표가 **없는데** 스크롤바까지 감추면 넘길 게 있다는 걸 아무도 모릅니다. 둘은 한 벌입니다.",
  "",
  "### 분리형과 혼합형 — 글자를 사진 아래 두느냐 위에 얹느냐",
  "",
  "박스형 콘텐츠는 두 가지입니다. **어느 쪽이든 위의 개수·비율 규칙은 똑같이 적용됩니다.**",
  "",
  "| | **분리형** | **혼합형** |",
  "| --- | --- | --- |",
  "| 생김새 | 사진 아래에 글자 | 사진 위에 글자를 얹음 |",
  "| 담을 수 있는 것 | 제목·설명·평점·가격까지 여러 줄 | 제목 + 한 줄 정도 |",
  "| 사진이 하는 일 | 무엇인지 알려 준다 | 분위기를 만든다 |",
  "| 쓰는 자리 | 상품·강의 목록처럼 **고르는** 자리 | 특집·기획전처럼 **끌어당기는** 자리 |",
  "",
  "**분리형은 상자를 두르지 마세요.** 흰 배경에 테두리·그림자까지 두르면, 사진과 글자가 이미 한 덩어리인데",
  "선을 한 번 더 치는 셈입니다. 격자로 늘어놓으면 그 선이 줄줄이 겹쳐 화면이 답답해집니다.",
  "**모서리는 사진이 가집니다** — 상자를 없앤 자리에서 사진이 카드 노릇을 합니다.",
  "(혼합형은 사진이 곧 배경이라 이 규칙 밖입니다.)",
  "",
  "```css",
  "/* 사진 + 글자로 된 카드 — 상자를 두르지 않는다 */",
  ".card{",
  "  background: none;   /* surface 나 흰색을 깔지 않는다 */",
  "  border: 0;",
  "  box-shadow: none;",
  "}",
  ".card .thumb{ border-radius: 12px; }  /* 모서리는 사진이 가진다 */",
  ".card .body{ padding: 16px 0 0; }     /* 좌우 여백 0 — 상자가 없으니 안쪽 여백도 없다 */",
  "```",
  "",
  "**`background: var(--surface)` 나 `border: 1px solid` 를 카드에 쓰면 이 규칙을 어긴 것입니다.**",
  "사진이 없는 상자(설정 패널·안내 상자·표를 감싼 것)는 이 규칙 밖입니다 — 거기는 배경이 있어야",
  "덩어리로 읽힙니다. **사진과 글자로 된 카드**만 걷어냅니다.",
  "",
  "상자를 걷어내면 두 가지가 따라옵니다.",
  "",
  "- **글자가 흰색이 아니라 페이지 배경 위**에 놓입니다. 대비를 다시 재세요.",
  "- **카드끼리 갈라 주던 테두리가 없어집니다.** 줄과 줄 사이를 더 벌려 그 몫을 대신하세요.",
  "",
  "그리고 **카드 안에는 선을 긋지 마세요.** 가격 위에 선을 두면 상자가 없는 상태에서는 그 선이 카드를",
  "가르는 것처럼 보여, 사진·제목과 가격이 따로 노는 두 덩어리로 읽힙니다.",
  "**갈라야 할 것은 카드 안이 아니라 카드끼리**입니다.",
  "",
  "혼합형을 쓸 때 반드시 지킬 것:",
  "",
  "- **어둠막을 까세요.** 사진 위에 흰 글자를 그냥 얹으면 사진의 밝은 자리에서 글자가 사라집니다.",
  "  **사진은 사는 분이 바꿀 것**이라 우리가 밝기를 미리 알 수 없습니다.",
  "  글자 쪽에서 반대편으로 옅어지는 어둠막을 항상 깔아 두면 어떤 사진이 와도 읽힙니다.",
  "- **글자 대비 4.5 이상**을 지키세요. 가장 밝은 사진(흰색)이 왔다고 치고 재세요.",
  "- **글자를 짧게 쓰세요.** 제목 한 줄 + 설명 한 줄까지입니다. 그보다 길면 사진을 다 덮어 혼합형인 의미가 없습니다.",
  "- **가격·평점처럼 정확히 읽어야 하는 것은 얹지 마세요.** 사진 위에서는 숫자가 잘 안 읽힙니다.",
  "- **한 화면에 두 가지를 섞어도 됩니다.** 위는 혼합형 특집, 아래는 분리형 목록 — 하는 일이 다르므로 어수선하지 않습니다.",
  "",
  "### 글꼴은 한 벌입니다",
  "",
  "**기본은 `Paperlogy`**, 못 불러오면 `Pretendard` → `Noto Sans KR` 순으로 물러납니다.",
  "CSS로는 `font-family: Paperlogy, Pretendard, 'Noto Sans KR', sans-serif` 한 줄입니다.",
  "",
  "- **제목과 본문에 다른 글꼴을 쓰지 마세요.** 두 벌이 되는 순간 어디에 무엇을 쓸지가",
  "  화면마다 갈립니다. 처음엔 「제목만 다르게」로 시작해서, 나중엔 세 벌 네 벌이 됩니다.",
  "- **위계는 글꼴이 아니라 크기와 굵기로 만듭니다.** 굵기는 400·600·700 셋만 쓰세요.",
  "- 크기는 본문 15 · 카드 제목 18 · 섹션 제목 22 · 페이지 제목 32이 기준입니다.",
  "- **숫자가 많은 표에는 고정폭 숫자**(`font-variant-numeric: tabular-nums`)를 켜세요.",
  "  안 켜면 값이 바뀔 때 자릿수가 흔들려 칸이 들썩입니다.",
  "",
  "### 움직임 — 바뀌었다는 걸 눈이 알아채게",
  "",
  "값이 바뀌었는데 **딱 하고 갈아 끼우면 사람은 그걸 못 봅니다.** 숫자가 12에서 3으로",
  "바뀌어도, 눈이 그 자리를 안 보고 있었으면 바뀐 줄 모릅니다.",
  "움직임은 꾸미개가 아니라 **「방금 여기가 바뀌었어요」라고 알려 주는 장치**입니다.",
  "",
  "| 언제 | 얼마나 | 무엇이 |",
  "| --- | --- | --- |",
  "| 마우스를 올렸을 때 | **0.12초** | 색·테두리 |",
  "| 눌러서 값이 바뀔 때 | **0.2초** | 사라짐·나타남·자리 옮김 |",
  "| 접히고 펴질 때 | **0.25초** | 높이 |",
  "| 화면 위에 뜰 때 (모달·시트) | **0.25초** | 옅어짐 + 살짝 올라옴 |",
  "| 안내 문구(토스트) | **0.2초 등장 · 3초 머무름** | 옅어짐 |",
  "",
  "- **가속은 하나로 씁니다.** `ease-out`(빨리 시작해 부드럽게 멈춤)이 기본입니다.",
  "  자리마다 다른 가속을 쓰면 같은 사이트에서 두 사람이 만든 것처럼 보입니다.",
  "- **0.3초를 넘기지 마세요.** 그보다 길면 기다리는 느낌이 듭니다. 목록이 다시 그려질 때는",
  "  **0.15초**면 충분합니다.",
  "- **자리를 밀어내며 움직이지 마세요.** 아래 내용이 출렁이면 읽던 곳을 잃습니다.",
  "  옅어지거나 제자리에서 바뀌게 하세요.",
  "- **한 번에 한 곳만 움직입니다.** 눌렀는데 화면 여기저기가 같이 움직이면 어디가 바뀐 건지 모릅니다.",
  "- **끝없이 도는 움직임은 두지 않습니다.** 배너 자동 넘김·깜빡임은 읽는 걸 방해합니다.",
  "  기다리는 동안 도는 것(로딩)만 예외입니다.",
  "- **움직임을 꺼 둔 분을 존중하세요.** `prefers-reduced-motion` 이 켜져 있으면 전부 0초로 둡니다.",
  "  어지럼증 때문에 꺼 두신 분들이 있습니다. 값은 바뀌되 움직이지만 않으면 됩니다.",
  "",
  "### 떠 있는 부품과 줄 안에 서는 부품은 다른 것입니다",
  "",
  "사진 위에 **떠 있는** 동그란 찜 아이콘과, 버튼 줄 안에 **나란히 서는** 찜 버튼은",
  "생김새가 비슷해 보여도 다른 부품입니다. 떠 있는 쪽은 자리를 빠져나가도록(`position:absolute`)",
  "만들어져 있어서, 그 이름을 줄 안의 버튼에 붙이면 **줄을 빠져나가 엉뚱한 데 가서 앉습니다.**",
  "실제로 찜 버튼이 가격 위에 겹쳐 앉은 적이 있습니다.",
  "",
  "- **이름이 자리를 뜻하면 그 자리에서만 쓰세요.** 「사진 위 찜」과 「줄 안 아이콘 버튼」은",
  "  이름을 나눠 두고, 섞어 쓰지 않습니다.",
  "- **부품 이름과 실제 쓰임이 어긋나면 이름을 고치세요.** 「타임라인」이라 지어 놓고",
  "  여섯 곳 모두 한 줄짜리 목록으로 쓰고 있던 적이 있습니다. 세로 점만 남아 글자 사이에 끼었습니다.",
  "- **아이콘만으로 뜻이 통하면 글자를 빼세요.** 하트·공유·닫기가 그렇습니다.",
  "  다만 **`aria-label`로 이름은 남깁니다** — 눈으로 못 보는 분에게는 그게 유일한 이름입니다.",
  "- 반대로 **아이콘만으로 못 알아보는 것에는 글자를 붙이세요.** 「빼기」·「내보내기」처럼",
  "  모양이 여러 뜻으로 읽히는 것이 그렇습니다.",
  "",
  "### 쓰는 화면이 있으면 보여주는 자리도 있어야 합니다",
  "",
  "글을 쓰게 해 놓고 그 글이 나올 자리를 안 만드는 일이 잦습니다.",
  "실제로 강사가 **1,240자짜리 강의 소개를 쓰는 화면**은 있는데, 상세 화면에는 그 글이",
  "나올 자리가 없었습니다. 게다가 검수 화면은 \"강의 소개 1,240자 — 확인됨\"이라고까지 말하고 있었습니다.",
  "",
  "- **입력 칸을 만들 때마다 \"이건 어디에 보이나\"를 한 번 물으세요.** 답이 없으면 둘 중 하나입니다 —",
  "  보여줄 자리를 만들거나, 그 입력 칸을 빼거나.",
  "- **에디터(굵게·목록·이미지 버튼이 붙은 칸)로 쓴 글**은 보여주는 쪽에도 그 모양이 살아야 합니다.",
  "  제목·목록·굵게를 쓸 수 있게 해 놓고 보여줄 때 한 덩어리 문단으로 뭉개면, 쓴 사람이 헛수고합니다.",
  "- **한 줄 요약과 본문 소개는 다른 것입니다.** 목록 카드에 들어가는 한 줄과, 상세에서 읽는 본문은",
  "  자리도 길이도 다릅니다. 하나로 합치지 마세요.",
  "",
  "### 권장 크기는 실제 자리와 같아야 합니다",
  "",
  "\"권장 1280×720 (16:9)\"이라고 적어 두고 옆의 자리는 4:3인 화면이 있었습니다.",
  "**사는 분은 글자를 믿고 그 크기로 사진을 준비**하는데, 올려 보면 잘립니다.",
  "",
  "- 안내 문구의 숫자와 **바로 옆 자리의 비율이 같은지** 확인하세요.",
  "- 검수·확인 화면에 크기가 또 적힌다면 **거기도 같은 숫자**여야 합니다. 세 곳이 따로 놀기 쉽습니다.",
  "- **영상만 16:9입니다.** 썸네일·카드 사진은 위 표(2·3개↔4:3, 4개↔1:1)를 따릅니다.",
  "",
  "### 차트 — 이미지가 아니라 데이터로 그립니다",
  "",
  "추이·막대·도넛 같은 차트를 **이미지 자리로 두지 마세요.** `이미지 영역 (라인 차트 · 권장 1200×420)`",
  "이라고 적어 두면 사는 분은 차트를 **그림 파일로 만들어 올려야 하는 줄** 압니다.",
  "차트는 숫자가 바뀌면 따라 바뀌어야 하는 것이라, 사진 자리와 성격이 다릅니다.",
  "",
  "- **가벼운 것은 라이브러리 없이 SVG로 그리세요.** 선 하나·막대 열두 개짜리는 30줄이면 됩니다.",
  "  바깥에서 아무것도 안 불러오니 **인터넷 없이 폴더에서 열어도** 그대로 보입니다.",
  "",
  "**대시보드를 만든다면 최소한 이 셋은 갖추세요.**",
  "",
  "| 무엇 | 어디에 | 왜 |",
  "| --- | --- | --- |",
  "| **큰 추이 차트** | 화면에 한둘 | 기간을 놓고 흐름을 본다 |",
  "| **스파크라인** (작은 추이선) | 지표 카드 안 | 숫자 옆에서 방향만 알려 준다 |",
  "| **증감 표시** (▴ 812) | 지표 카드 안 | 좋아졌는지 나빠졌는지 |",
  "",
  "숫자 하나만 두면 **좋은지 나쁜지를 못 말합니다.** \"10,374명\"만 있으면 늘고 있는지",
  "줄고 있는지 알 수 없어서, 사는 분은 그 카드를 보고 아무 판단도 못 합니다.",
  "지표 카드는 **숫자 + 증감 + 추이선**이 한 벌입니다.",
  "",
  "- **본격적인 차트가 필요하면 무료(MIT) 라이브러리를 쓰세요.** 값을 치르지 않아도 되고 상업적으로 써도 됩니다.",
  "",
  "| 라이브러리 | 크기 | 언제 |",
  "| --- | --- | --- |",
  "| **Chart.js** | ~200KB | 무난한 첫 선택. 자료가 많아 AI도 정확하게 짭니다 |",
  "| **ApexCharts** | ~500KB | 기본 모양이 예쁘고 종류가 많을 때 |",
  "| **uPlot** | ~40KB | 점이 수천 개라 가벼워야 할 때 |",
  "| **Frappe Charts** | ~30KB | 작고 산뜻한 SVG면 충분할 때 |",
  "",
  "- **색은 반드시 프리셋 색을 쓰세요.** 라이브러리 기본 팔레트(빨강·노랑·초록)를 그대로 두면",
  "  그 자리만 다른 사이트처럼 보입니다.",
  "- **눈금선은 옅게, 선은 진하게.** 눈금이 데이터보다 진하면 숫자가 안 읽힙니다.",
  "- 라이브러리를 쓰면 **인터넷이 필요해집니다.** 오프라인으로 열어 볼 화면이라면 파일을 함께 받아 두거나 SVG로 그리세요.",
  "",
  "### 가격 표기 — 낼 돈부터",
  "",
  "**판매가 · 정가 · 할인율** 순서로 한 줄에 세웁니다.",
  "",
  "| 자리 | 모양 | 크기 |",
  "| --- | --- | --- |",
  "| **판매가** (낼 돈) | 진한 기본 글자색, 굵게 | 18 (상세는 28) |",
  "| **정가** | 회색 + 취소선 | 13 |",
  "| **할인율** | **강조색 글자**, 굵게 | 14 |",
  "",
  '- **할인율을 앞에 두지 마세요.** 눈이 먼저 "20%"에 걸려 정작 얼마인지를 뒤늦게 찾습니다.',
  "  사는 분이 알고 싶은 건 **낼 돈**입니다.",
  "- **할인율은 배지가 아니라 색 글자입니다.** 배지로 두면 정가·판매가와 무게가 비슷해져 셋이 서로 다툽니다.",
  "  배지 자리는 `입문`·`NEW` 같은 **꼬리표 몫**입니다.",
  "- **셋의 크기를 벌려 두세요.** 비슷하면 무엇을 먼저 읽어야 할지 눈이 헤맵니다.",
  "- **강조색 원색을 글자로 쓰지 마세요.** 주황·코랄 원색은 흰 배경에서 3:1을 못 넘깁니다.",
  "  글자용으로 한 단계 어두운 색을 따로 두세요.",
  "- 가격 묶음은 **한 곳에서 만들어 쓰세요.** 자리마다 손으로 짜면 순서가 갈립니다.",
  "",
  "### 버튼이냐 링크냐",
  "",
  "**다른 화면으로 데려가면 링크, 이 화면 안에서 끝나면 버튼입니다.**",
  "",
  "| 하는 일 | 무엇으로 | 눌렀을 때 |",
  "| --- | --- | --- |",
  "| 다른 화면으로 간다 | 링크 `<a href>` | 그 화면이 열린다 |",
  "| 이 화면 안에서 끝난다 | 버튼 `<button>` | 안내 문구가 뜬다 |",
  "",
  "- 필터 적용·정렬·검색·다음 차시·시간 지점 이동은 **화면이 바뀌지 않는 조작**입니다.",
  "  링크로 만들면 **자기 자신으로 가는 링크**가 되어, 눌러도 같은 화면이 다시 열립니다.",
  '  사는 분 눈에는 *"눌렀는데 아무 일도 안 나네"* 로 보입니다.',
  "- **나란히 선 버튼끼리는 종류를 섞지 마세요.** 하나는 화면이 넘어가고 하나는 안 넘어가면",
  "  규칙이 없어 보입니다.",
  "",
  "**그리고 화면 안에서 끝나는 조작은 진짜로 값이 바뀌어야 합니다.**",
  "눌러도 숫자가 그대로면, 사는 분 눈에는 **눌리지 않는 포스터**입니다.",
  "",
  "| 눌렀을 때 | 바뀌어야 하는 것 |",
  "| --- | --- |",
  "| 기간 탭 (7일·30일·90일) | 차트와 그 옆 요약 숫자 |",
  "| 쿠폰·옵션 고르기 | 결제 금액 줄과 합계 |",
  "| 수량 늘리기 | 금액 |",
  "| 정렬·필터 | 목록 순서나 개수 |",
  "",
  "#### 눌러 봐야만 드러나는 것들 — 2026-08-19 LMS 두 팩 검수에서 나온 것",
  "",
  "화면을 눈으로만 보면 멀쩡한데, 눌러 보면 어긋나는 자리가 있습니다. 실제로 나온 것들입니다.",
  "",
  "**① 켜짐 표시와 실제 걸린 조건이 따로 놀지 않게.**",
  "거르는 단추 여덟 개와 「전체 보기」가 서로 다른 상자에 담겨 있었습니다. 그래서",
  "「디자인」을 눌러도 「전체 보기」가 안 꺼지고, 「전체 보기」를 눌러도 「디자인」이 안 꺼졌습니다.",
  "**목록은 맞게 걸러지는데 표시만 손님을 속였습니다.**",
  "- 같은 갈래의 단추는 **상자를 넘어** 한 벌로 갱신하세요. 상자 안에서만 끄면 밖에 있는 게 남습니다.",
  "- 조건 칩의 ✕ 로 지웠을 때도 **왼쪽 단추의 켜짐이 같이 꺼져야** 합니다.",
  "",
  "**② 쪽 번호는 결과를 따라가야 합니다.**",
  "12개를 2개로 걸렀는데 쪽 번호가 「1 2 3 4 5」 그대로였고, 어느 쪽을 눌러도 같은 목록이 나왔습니다.",
  "- 결과가 한 쪽에 다 들어가면 **쪽 번호를 감추세요.**",
  "- 조건이 바뀌면 **1쪽으로 되돌리세요.** 3쪽을 보다 조건을 바꾸면 3쪽에 머물면 안 됩니다.",
  "",
  "**③ 화면을 넘길 때 고른 값도 같이 넘기세요.**",
  "결제 화면에서 「12개월 할부」를 골라 「매달 5,270원 × 12개월」까지 확인했는데,",
  "완료 화면은 「신용카드 (일시불)」이었습니다. 고른 값이 다음 화면으로 안 넘어갔습니다.",
  "- 앞 화면에서 고른 것이 뒤 화면에 다시 적힌다면 **둘을 이어 두세요**(sessionStorage 면 충분합니다).",
  "- 이어 둘 수 없으면 **뒤 화면에 그 값을 적지 마세요.** 틀린 값보다 없는 게 낫습니다.",
  "",
  "**④ 견본 날짜는 「오늘」에서 거꾸로 잡으세요.**",
  "만든 날에 맞춰 날짜를 적어 두면 시간이 지나 여는 손님은 지난 날짜만 봅니다.",
  "실제로 「D-3 · 마감 8월 10일」인데 그날은 8월 19일이었습니다 — 9일 지난 마감을 「3일 남음」이라 했습니다.",
  "- **기준일 하나를 정해 두고, 화면을 열 때 오늘까지의 차이만큼 통째로 미세요.**",
  "  날짜 사이 간격이 그대로라 「D-3」이나 「수강 기간 6개월」 같은 계산값은 손대지 않아도 맞습니다.",
  "- 주문번호에 박힌 날짜(ORD-20260807-…)도 같이 밀어야 합니다.",
  "",
  "**⑤ 숫자 하나를 고치면 그 숫자로 계산되는 값을 전부 따라가세요.**",
  "차시 수를 30에서 18로 고치면서 딸린 값을 안 고쳤더니,",
  "같은 강의 진도가 화면마다 67% 와 40% 로 갈라졌고 「12/18차시 · 남은 차시 18개」가 됐습니다.",
  "- 차시 수를 바꿀 때 딸린 것: **총 재생 시간 · N/M차시 · 진도 % · 남은 차시 · 장별 완료 수.**",
  "- 고친 뒤에는 그 값이 나오는 **모든 화면을 훑어** 한 벌로 맞았는지 보세요.",
  "",
  "**⑥ 「비로그인」 화면은 헤더도 비로그인이어야 합니다.**",
  "「홈 - 비로그인」인데 헤더에 알림 종과 프로필이 있고 로그인 단추가 없었습니다.",
  "사이드바에는 「로그인·회원가입」이 있는데 헤더에는 「김수현님」이라, 한 화면에서 앞뒤가 안 맞았습니다.",
  "- 로그인 전/후 화면을 나눠 만들었다면 **머리띠와 옆 메뉴도 같이 갈라야** 합니다.",
  "",
  "**⑦ 견본이라 좁은 자리는 그 말을 화면에 적으세요.**",
  "분야 카드는 「개발 284개」인데 눌러 거르면 2개가 나왔습니다. 견본이라 그런 건데 그 말이 없었습니다.",
  "- 「전체 1,280개 가운데 12개만 보여 주는 견본입니다」 처럼 **한 줄로 밝히면** 어긋남이 사라집니다.",
  "- 목록에서 어느 카드를 눌러도 같은 상세가 열린다면 **상세 화면에도** 그렇게 적으세요.",
  "",
  "**⑧ 겹쳐 놓은 단추는 정말 눌리는지 확인하세요.**",
  "카드 위 찜 하트가 사진에 덮여 있어서, 누르면 찜이 안 되고 강의 상세로 넘어갔습니다.",
  "- 겹치는 단추에는 **z-index** 를 주고, `document.elementFromPoint` 로 그 자리 맨 위가 무엇인지 확인하세요.",
  "- 링크 안에 단추를 넣었다면 `preventDefault` 만으로는 부족합니다 — **덮였는지부터** 보세요.",
  "",
  "**⑨ 못 채운 곳으로 화면을 옮겨 주세요.**",
  "「결제하기」는 오른쪽 위에 있고 「동의를 아직 채우지 않았어요」는 화면 아래에 떴습니다.",
  "스크롤해야만 보이니 손님은 왜 안 되는지 모릅니다.",
  "- 막혔으면 **못 채운 자리로 스크롤**하고, 채워지면 안내를 거두세요.",
  "",
  "**⑩ 끝난 조작은 끝난 티를 내세요.**",
  "쿠폰 「받기」를 몇 번이고 눌러도 「받았어요」가 또 나왔고, 과제를 내도 알림 한 줄 없이 화면이 넘어갔습니다.",
  "- 한 번으로 끝나는 단추는 **글자를 바꾸고 다시 눌리지 않게** 하세요(받기 → 받음).",
  "- 낸 뒤에는 **그 자리에서** 낸 것이 보여야 합니다.",
  "",
  "- **미리 만들어 두고 바꿔 끼세요.** 차트 셋을 미리 그려 두고 탭에 따라 보여 주는 편이,",
  "  누를 때마다 자바스크립트로 다시 그리는 것보다 낫습니다 — 그리는 규칙이 두 곳으로 갈라지지 않습니다.",
  "- **계산은 한 곳에서만 하세요.** 합계를 화면마다 손으로 적어 두면 쿠폰을 바꿨을 때 한 군데만 바뀝니다.",
  "- **탭에 갈 곳도 바꿀 것도 없으면 탭이 아닙니다.** 그냥 제목이거나, 아직 안 만든 자리입니다.",
  "",
  "**같은 길을 두 번 두지 마세요 — 위 카테고리 줄과 왼쪽 LNB.**",
  "둘이 같은 곳을 가리키면 위쪽이 두 줄로 두꺼워지고, 어느 쪽을 눌러야 할지 잠깐 멈칫합니다.",
  "",
  "| 상태 | 왼쪽 LNB | 위 카테고리 줄 |",
  "| --- | --- | --- |",
  "| 맨 위 (LNB 보임) | 보인다 | **접힌다** |",
  "| 스크롤해서 LNB가 위로 사라짐 | 안 보인다 | **내려온다** |",
  "| LNB가 아예 없는 화면 | — | **늘 보인다** |",
  "",
  "- **LNB가 있는 화면은 접힌 채로 시작하세요.** 펼쳐 두었다가 나중에 접으면 첫 화면에서 한 번 번쩍입니다.",
  "- **LNB가 없는 화면에서는 절대 접지 마세요.** 접으면 갈 길이 통째로 사라집니다.",
  '- **기준은 "LNB가 붙박이 머리말 아래로 사라지는 순간"입니다.** 머리말 높이만큼 위를 깎아서 재세요.',
  "- 같은 규칙을 **LNB를 쓰는 모든 레이아웃에 똑같이** 거세요. 화면마다 다르면 위쪽 높이가 제멋대로 바뀌어 보입니다.",
  "",
  "- **견본으로 가는 버튼을 화면 안에 두지 마세요.** `결과가 없을 때` `대화가 없을 때는 이렇게 보여요`",
  "  처럼 예외 화면을 보여주려고 넣은 버튼·단락은 진짜 사이트에 없는 것입니다.",
  "  검색창 옆에 그런 버튼이 서 있으면 사는 분은 그게 기능인 줄 압니다.",
  "  빈 화면·오류 화면은 **화면 목록에 따로 한 장**으로 두세요 — 거기서 눌러 보면 됩니다.",
  "",
  "### 화면 목록으로 가는 길은 한 곳에만",
  "",
  "만든 화면을 훑어보려면 목록이 필요합니다. 그런데 그 목록을 **화면 안에 늘어놓으면**",
  "사는 분 눈에는 사이트의 일부로 보입니다.",
  "",
  "```",
  "이렇게 두지 마세요 — 화면 위쪽에 줄줄이",
  "  [CO-01 · 강의 목록] [CO-02 · 검색 결과 없음] [CO-03 · 강의 상세] [CO-04 · 결제] …",
  "```",
  "",
  "**진짜 사이트에는 이런 줄이 없습니다.** `CO-02 · 검색 결과 없음` 은 만드는 사람의 말이지",
  "쓰는 사람의 말이 아닙니다. 화면 ID 가 손님 눈에 보이는 것부터가 어긋납니다.",
  "",
  "- **한 귀퉁이에 작게 하나만 둡니다.** 오른쪽 아래에 떠 있는 `화면 목록` 단추 하나면 됩니다.",
  "  누르면 `화면목록.html` 로 갑니다 — index.html(홈)이 아닙니다.",
  "- **그 단추는 화면 내용 위에 떠 있게** 두고, 본문 흐름에는 끼워 넣지 않습니다.",
  "  본문에 들어가면 그것도 사이트의 일부가 됩니다.",
  "- **화면 ID 를 손님이 보는 자리에 쓰지 않습니다.** 제목·탭·빵부스러기 어디에도요.",
  "  ID 는 우리가 화면을 세는 이름이지 서비스의 말이 아닙니다.",
  "- 화면끼리 오가는 길은 **그 서비스의 진짜 메뉴와 버튼**으로 만듭니다.",
  "  「강의 목록 → 강의 상세」는 강의 카드를 눌러서 가지, 탭으로 가지 않습니다.",
  "",
];

/** 줄 간격 — 위 눈금이 "덩어리 사이"라면, 이건 "글줄 사이"다.
   덩어리 간격만 정해 두면 큰 제목이 두 줄로 넘어갈 때 줄끼리 부딪힌다. */
export const LINE_SLOTS: { key: keyof (typeof DENSITIES)[number]; label: string; when: string }[] = [
  { key: "lineDisplay", label: "큰 제목", when: "30px 이상. 히어로 제목처럼 두 줄로 넘어가는 글" },
  { key: "lineTitle", label: "제목", when: "섹션·카드 제목" },
  { key: "lineBody", label: "본문", when: "설명 문단. 한국어는 영어보다 넉넉해야 읽힌다" },
  { key: "lineDense", label: "빽빽한 자리", when: "표 칸·배지·버튼 안 글자" },
];

// 방향별 기본 글꼴/모서리 느낌.
/* 아무것도 안 고른 사람이 받는 글꼴. 테마마다 다르게 뒀더니 같은 서비스인데
   테마를 바꿀 때마다 글꼴까지 갈렸다. 기본은 하나로 모은다 —
   고르고 싶은 사람은 여섯 벌 중에서 직접 고르면 된다(2026-08-07). */
const DEFAULT_FONT: Record<DesignKey, FontFeel> = {
  navy: "paperlogy",
  mono: "paperlogy",
  pastel: "paperlogy",
  retro: "paperlogy",
  forest: "paperlogy",
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
    font: DEFAULT_FONT[style] ?? "paperlogy",
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
 *   포인트 색상 = 그 테마의 첫 번째 색 · 글꼴 = 페이퍼로지
 *   모서리 = 테마 기본값 · 밀도 = 넉넉하게 · 모드 = 라이트
 *
 * 모서리만 테마 기본값을 그대로 둔다 — 파스텔의 둥근 모서리, 모노의 각진 모서리는
 * 그 테마의 성격이라, 통일하면 셋의 차이가 색뿐이 되어 나란히 놓았을 때 구분이 안 된다.
 * 글꼴은 반대로 한 벌로 묶는다. 세 벌에 다른 글꼴이 섞이면 "이 폰트를 어디서 받나"가
 * 먼저 걸린다. 기본은 페이퍼로지고, 못 불러오면 프리텐다드로 물러난다(2026-08-06).
 */
export function salePresetConfig(style: DesignKey): PresetConfig {
  return { ...defaultPresetConfig(style), font: "paperlogy" };
}

export function parsePresetConfig(json: string | null, concept?: string | null): PresetConfig {
  if (json) {
    try {
      const c = JSON.parse(json) as Partial<PresetConfig>;
      if (c.style) {
        const cfg = { ...defaultPresetConfig(c.style), ...c } as PresetConfig;
        // 예전에 저장된 글꼴 값(sans/serif/rounded 등)은 기본값으로 교체.
        if (!FONT_FEELS.some((f) => f.key === cfg.font)) cfg.font = DEFAULT_FONT[cfg.style] ?? "paperlogy";
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
  const bg = cfg.dark ? DARK_BG : CONTENT_BG;
  const theme = designOptionFor(cfg.style);
  const accentText = accentTextOn(theme, bg);
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
  L.push(`| accent(강조·배지) | \`${theme.accent}\` |`);
  L.push(`| accent-text(강조 글자용) | \`${accentText}\` |`);
  L.push(`| background | \`${bg}\` |`);
  L.push(`| surface(카드) | \`${surface}\` |`);
  L.push(`| text | \`${text}\` |`);
  L.push(`| text-muted | \`${muted}\` |`);
  L.push(`| border | \`${border}\` |`);
  L.push("| success / warning / danger | `#16A34A` / `#D97706` / `#DC2626` |");
  L.push("");
  L.push(...ACCENT_RULE);
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
  // 높이를 px 로 박으면 글자를 키우거나 밀도를 바꿔도 안 따라온다 — 글자+패딩으로 정한다.
  L.push(
    `| 버튼(주요) | primary-500 배경, on-primary 글자, 높이 = 글자 + 위아래 8px, radius ${rad.button}. hover primary-600, active primary-700 |`,
  );
  L.push(`| 버튼(보조) | 투명 배경 + border 1px(${border}), text 색 글자 |`);
  // 사진이 든 분리형 카드는 상자를 두르지 않는다 — 아래 공통 규칙과 어긋나면 안 된다.
  L.push(`| 카드 (사진 없는 상자) | surface 배경, border 1px, radius ${rad.card}, 내부 여백 ${den.cardPad} |`);
  L.push(`| 카드 (사진 + 글자) | **배경·테두리 없음.** 모서리는 사진이 가진다 (아래 「분리형과 혼합형」) |`);
  L.push("| 입력 | 높이 = 글자 + 위아래 10px, border 1px, focus 시 primary 2px 링 |");
  // 「같은 색 글자」라고만 적어 두면 강조 배지에서 밝은 원색이 글자로 나간다.
  L.push(
    `| 배지 | 배경은 10% 농도, 글자는 같은 계열의 진한 값. 강조 배지는 \`${theme.accent}\` 10% 배경 + \`${accentText}\` 글자. radius ${rad.badge} |`,
  );
  L.push(`| 표 | 헤더 muted 배경, 행 구분 border 1px, 행 높이 ${den.rowH} |`);
  L.push("");
  // 색·밀도와 상관없는 규칙은 파는 팩과 한 벌을 쓴다. 따로 적으면 갈라진다(2026-08-06).
  L.push(...COMMON_RULES);
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
  /** 강조 — 배경·배지 바탕 전용 */
  accent: string;
  /** 글자용 강조 — 이 요약의 bg 위에서 읽히는 값 */
  accentText: string;
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
  const bg = cfg.dark ? DARK_BG : CONTENT_BG;
  const theme = designOptionFor(cfg.style);
  return {
    baseName: base.name,
    primary: cfg.primary,
    palette: Object.entries(pal),
    accent: theme.accent,
    accentText: accentTextOn(theme, bg),
    bg,
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
      ["버튼(주요)", `primary 배경 · 높이 = 글자 + 8px · radius ${rad.button}`],
      ["카드 (사진 없는 상자)", `surface 배경 · border 1px · radius ${rad.card}`],
      ["카드 (사진 + 글자)", "배경·테두리 없음 · 모서리는 사진이"],
      ["입력", "높이 = 글자 + 10px · focus 시 primary 링"],
      ["배지", `상태색 10% 배경 · radius ${rad.badge}`],
    ],
  };
}
