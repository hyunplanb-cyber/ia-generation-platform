import Anthropic from "@anthropic-ai/sdk";
import type {
  GeneratedButtonDraft,
  IaGenerator,
  IaGeneratorInput,
  IaGeneratorOutput,
} from "@/domain/ports/ia-generator";

// 우선 원가가 낮은 haiku로 시작한다. 품질이 부족하면 claude-sonnet-5로 올린다.
const MODEL = "claude-haiku-4-5";

// 생성을 두 단계로 나눈다.
//   1단계: 메뉴와 화면 '목록'(뼈대)만 — 짧아서 10초 안에 끝난다.
//   2단계: 화면을 몇 개씩 묶어 요건·프롬프트·버튼을 '동시에' 채운다.
// 한 번에 전부 쓰게 하면 글자 수만큼 시간이 쌓여(실측 117초) 서버 제한 60초를 넘겼다.
// 나눠서 동시에 쓰면 가장 느린 묶음 하나만 기다리면 되고, 화면이 늘어도 시간이 거의 그대로다.
// (실측: 같은 컨셉에서 117초 → 37초. 내용은 줄지 않았다.)
const SCREENS_PER_CALL = 5;
const SKELETON_MAX_TOKENS = 4000;
// 상세(3뎁스)는 화면이 100개+라 뼈대만도 길어진다 → 넉넉히.
const DETAIL_SKELETON_MAX_TOKENS = 12000;
const DETAIL_MAX_TOKENS = 8000;

const SKELETON_SYSTEM = [
  "당신은 웹 기획자를 돕는 IA(정보구조) 설계 어시스턴트입니다.",
  "주어진 사이트 컨셉과 대략적인 메뉴 구성을 분석해, 메뉴와 화면 '목록'을 설계합니다.",
  "세부 요건이나 프롬프트는 이 단계에서 쓰지 마세요(다음 단계에서 채웁니다).",
  "출력은 반드시 아래 JSON 스키마 하나만, 다른 설명 없이 출력하세요:",
  "{",
  '  "menus": [',
  "    {",
  '      "nameKo": "한글 메뉴명",',
  '      "nameEn": "영문 메뉴명(2단어 이하, 각 단어 첫 글자 대문자)",',
  '      "description": "이 메뉴의 역할 한 줄(없으면 null)",',
  '      "screens": [',
  "        {",
  '          "ref": "이 생성 결과 전체에서 고유한 짧은 식별자(예: s1, s2, s3 ...)",',
  '          "pageName": "화면명(한국어)",',
  '          "screenRole": "화면 유형 태그(list/detail/form/done/main 등 영문 소문자)"',
  "        }",
  "      ]",
  "    }",
  "  ]",
  "}",
  "규칙:",
  "- 메뉴는 3~8개로 현실적으로 구성하세요.",
  "- **화면은 상황·상태별로 잘게 나누세요.** 실제 기획 산출물처럼, 하나의 기능이 여러 상태를 가지면 각각 별도 화면으로 만듭니다. 예:",
  "  · 검색: '검색 전', '검색 결과 - 결과 있음', '검색 결과 - 결과 없음'",
  "  · 목록: '목록 - 데이터 있음', '목록 - 비어 있음'",
  "  · 입력 폼: '입력', '입력 오류', '완료'",
  "  · 장바구니: '상품 있음', '비어 있음'",
  "  화면명 끝에 상태를 붙여 구분하세요(예: '상품 검색 - 결과 없음').",
  "- 그 결과 메뉴당 화면이 2~6개 정도로 늘어나는 게 자연스럽습니다.",
  "- 로그인/회원가입이 컨셉상 필요하면 회원 관련 메뉴를 포함하세요.",
  "- screenRole은 같은 메뉴 안에서 중복되지 않게 하세요(상태가 다르면 예: search-empty, search-result처럼 구분).",
  "- 영문 메뉴명은 서로 앞 2글자가 겹치지 않게 하면 좋습니다(페이지ID 코드 충돌 방지).",
  "- ref는 전체에서 유일해야 합니다.",
].join("\n");

// 상세(3뎁스) 뼈대 — 화면(2뎁스)을 상태·탭·예외(3뎁스)까지 촘촘히 쪼갠다.
const DETAIL_SKELETON_SYSTEM = [
  "당신은 실무 웹 기획자를 돕는 IA(정보구조) 설계 어시스턴트입니다.",
  "주어진 컨셉·메뉴를 분석해, 실제 기획 산출물 수준의 '상세 화면 목록'을 3뎁스로 설계합니다.",
  "3뎁스 구조: 1뎁스=메뉴 / 2뎁스=화면(기능 단위) / 3뎁스=그 화면의 상태·탭·예외.",
  "세부 요건·프롬프트는 이 단계에서 쓰지 마세요(다음 단계에서 채웁니다).",
  "출력은 반드시 아래 JSON 스키마 하나만, 다른 설명 없이 출력하세요:",
  "{",
  '  "menus": [',
  "    {",
  '      "nameKo": "한글 메뉴명",',
  '      "nameEn": "영문 메뉴명(2단어 이하, 각 단어 첫 글자 대문자)",',
  '      "description": "이 메뉴의 역할 한 줄(없으면 null)",',
  '      "screens": [',
  "        {",
  '          "ref": "전체에서 고유한 짧은 식별자(s1, s2 ...)",',
  '          "screenGroup": "2뎁스 화면명(기능 단위, 예: 로그인 / 상품 목록 / 주문 상세)",',
  '          "pageName": "3뎁스 상태·탭명(짧게, 예: 기본 / 비어 있음 / 오류 / 완료 / 상세 탭)",',
  '          "screenRole": "화면 유형 태그(영문 소문자, 상태별로 다르게: login, login-locked, list, list-empty ...)"',
  "        }",
  "      ]",
  "    }",
  "  ]",
  "}",
  "규칙(중요):",
  "- 메뉴는 6~10개로, 규모 있는 서비스처럼 폭넓게 구성하세요.",
  "- **각 2뎁스 화면(screenGroup)을 반드시 상태·탭·예외(3뎁스)로 쪼개세요.** 화면당 3뎁스 3~5개가 자연스럽습니다. 예:",
  "  · 로그인 → 기본 / 로그인 실패·잠금 / 2단계 인증",
  "  · 목록 → 데이터 있음 / 비어 있음 / 필터 적용 / 로딩·오류",
  "  · 상세 → 기본 / 편집 / 삭제 확인",
  "  · 입력 폼 → 입력 / 유효성 오류 / 저장 완료",
  "  · 검색 → 검색 전 / 결과 있음 / 결과 없음",
  "- 같은 2뎁스 화면의 3뎁스들은 screenGroup을 똑같이 쓰고, pageName만 상태·탭으로 다르게 하세요.",
  "- **전체 3뎁스 화면 수가 80~150개가 되도록** 촘촘히 뽑으세요(억지 중복이 아니라, 실제로 확인해야 할 상태들).",
  "- pageName은 상태·탭만 짧게(‘로그인 - 기본’처럼 화면명을 반복하지 말고 그냥 ‘기본’).",
  "- 로그인·회원가입·권한·설정 등 시스템 화면도 상태까지 포함하세요.",
  "- screenRole은 같은 메뉴 안에서 중복되지 않게(상태가 다르면 다른 태그).",
  "- 영문 메뉴명은 서로 앞 2글자가 겹치지 않게 하면 좋습니다.",
  "- ref는 전체에서 유일해야 합니다.",
].join("\n");

const DETAIL_SYSTEM = [
  "당신은 웹 기획자를 돕는 IA 설계 어시스턴트입니다.",
  "이미 확정된 화면 목록 중 '담당 화면'에 대해서만 세부 내용을 작성합니다.",
  "출력은 반드시 아래 JSON 스키마 하나만, 다른 설명 없이 출력하세요:",
  "{",
  '  "screens": [',
  "    {",
  '      "ref": "주어진 ref를 그대로",',
  '      "funcDef": "이 화면에 필요한 세부 요건을 \'·\'로 구분해 나열(각 항목은 구체적인 한 가지 요건). 개수는 아래 \'요건 분량\' 규칙을 따르세요.",',
  '      "prompt": "이 화면을 AI 코딩 도구로 만들 때 붙여넣을 한국어 프롬프트",',
  '      "buttons": [',
  '        { "label": "버튼 이름", "targetRef": "클릭 시 이동할 화면의 ref" }',
  "      ]",
  "    }",
  "  ]",
  "}",
  "규칙:",
  "- **요건 분량은 화면 성격에 따라 다르게 하세요.** 모든 화면에 같은 분량을 쓰면, 내용이 많아야 할 메인 화면이 빈약하게 나옵니다.",
  "  · 메인·홈·랜딩 화면: 8~12개. 기능을 나열하지 말고 **위에서 아래로 쌓이는 '섹션'을 순서대로** 적으세요.",
  "    예: '상단 히어로 배너(카피+검색) · 카테고리 바로가기 8종 · 이번 주 베스트 상품 8개 · 신상품 캐러셀 · 기획전 배너 2단 · 실시간 리뷰 슬라이드 · 브랜드 스토리 · 하단 회원가입 유도 CTA'",
  "  · 목록·상세 화면: 5~8개",
  "  · 입력·폼 화면: 4~6개",
  "  · 상태·예외 화면(비어 있음·오류·완료·마감): 3~4개면 충분합니다. 억지로 늘리지 마세요.",
  "- 메인 화면의 prompt에도 **섹션을 위에서 아래 순서대로** 명시해, AI가 스크롤 구성을 그대로 만들 수 있게 하세요.",
  "- targetRef는 아래 '전체 화면 목록'에 있는 ref만 쓰세요(다른 메뉴의 화면으로 이동해도 됩니다).",
  "- 버튼이 없는 화면은 buttons를 빈 배열([])로 두세요. 목록→상세, 검색전→결과, 폼→완료처럼 자연스러운 이동만 연결하세요.",
  "- 담당 화면만, 주어진 ref를 그대로 써서 출력하세요. 담당이 아닌 화면은 출력하지 마세요.",
].join("\n");

function buildConceptBlock(input: IaGeneratorInput): string {
  const lines = [`사이트 컨셉:\n${input.concept}`];
  if (input.menuDraft) {
    lines.push(`\n사용자가 적은 대략적 메뉴 구성:\n${input.menuDraft}`);
  }
  if (input.designConcept) {
    lines.push(`\n디자인 컨셉:\n${input.designConcept}`);
  }
  const deviceLabel =
    input.deviceMode === "mobile"
      ? "모바일 웹·앱 전용"
      : input.deviceMode === "pc"
        ? "PC 웹 전용"
        : "반응형(하나의 화면이 기기에 맞춰 적응)";
  lines.push(`\n디바이스 대응: ${deviceLabel}`);
  return lines.join("\n");
}

function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("IA_GENERATOR_BAD_OUTPUT");
  }
  return text.slice(start, end + 1);
}

async function askJson(
  client: Anthropic,
  system: string,
  user: string,
  maxTokens: number,
): Promise<unknown> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  // 분량이 상한에 걸려 JSON이 잘린 경우 — 이 묶음은 신뢰할 수 없다.
  if (message.stop_reason === "max_tokens") {
    throw new Error("IA_GENERATOR_TRUNCATED");
  }
  const textBlock = message.content.find((block) => block.type === "text");
  const text = textBlock?.type === "text" ? textBlock.text : "";
  return JSON.parse(extractJson(text));
}

type SkeletonScreen = {
  ref: string;
  pageName: string;
  screenGroup: string | null;
  screenRole: string;
  menuKo: string;
};
type SkeletonMenu = {
  nameKo: string;
  nameEn: string;
  description: string | null;
  screens: { ref: string; pageName: string; screenGroup: string | null; screenRole: string }[];
};
type ScreenDetail = { funcDef: string; prompt: string; buttons: GeneratedButtonDraft[] };

// 2단계 결과(ref → 세부 내용)를 모은다. 한 묶음이 실패해도 전체를 버리지 않고
// 그 화면들만 세부 내용 없이 남긴다 — 화면 목록은 이미 확정돼 있어 산출물이 성립한다.
function collectDetails(payload: unknown, into: Map<string, ScreenDetail>): void {
  const screens = (payload as { screens?: unknown })?.screens;
  if (!Array.isArray(screens)) return;
  for (const screen of screens) {
    const ref = String(screen?.ref ?? "").trim();
    if (!ref) continue;
    const buttons = Array.isArray(screen?.buttons) ? screen.buttons : [];
    into.set(ref, {
      funcDef: String(screen?.funcDef ?? "").trim(),
      prompt: String(screen?.prompt ?? "").trim(),
      buttons: buttons
        .map((button: { label?: unknown; targetRef?: unknown }) => ({
          label: String(button?.label ?? "").trim(),
          targetRef: String(button?.targetRef ?? "").trim(),
        }))
        .filter((button: GeneratedButtonDraft) => button.label && button.targetRef),
    });
  }
}

export const claudeIaGenerator: IaGenerator = {
  async generate(input: IaGeneratorInput): Promise<IaGeneratorOutput> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY_MISSING");
    }

    const client = new Anthropic({ apiKey });
    const conceptBlock = buildConceptBlock(input);

    // ── 1단계: 메뉴·화면 뼈대 ────────────────────────────────────────────
    // 상세 모드는 3뎁스(화면→상태·탭)로, 더 긴 출력이 필요하다.
    const detail = input.detail === true;
    const skeleton = await askJson(
      client,
      detail ? DETAIL_SKELETON_SYSTEM : SKELETON_SYSTEM,
      conceptBlock,
      detail ? DETAIL_SKELETON_MAX_TOKENS : SKELETON_MAX_TOKENS,
    );
    const rawMenus = (skeleton as { menus?: unknown })?.menus;
    if (!Array.isArray(rawMenus) || rawMenus.length === 0) {
      throw new Error("IA_GENERATOR_BAD_OUTPUT");
    }

    // ref는 버튼 연결의 열쇠라 비어 있거나 겹치면 안 된다. 여기서 확정해 둔다.
    let refFallback = 0;
    const usedRefs = new Set<string>();
    const menus: SkeletonMenu[] = rawMenus.map((menu) => {
      const screens = (Array.isArray(menu?.screens) ? menu.screens : []).map((screen: unknown) => {
        refFallback += 1;
        const raw = String((screen as { ref?: unknown })?.ref ?? "").trim();
        const ref = raw && !usedRefs.has(raw) ? raw : `auto-${refFallback}`;
        usedRefs.add(ref);
        const s = screen as { pageName?: unknown; screenGroup?: unknown; screenRole?: unknown };
        const group = String(s?.screenGroup ?? "").trim();
        return {
          ref,
          pageName: String(s?.pageName ?? "").trim() || "화면",
          screenGroup: group || null,
          screenRole: String(s?.screenRole ?? "").trim() || "default",
        };
      });
      return {
        nameKo: String(menu?.nameKo ?? "").trim() || "메뉴",
        nameEn: String(menu?.nameEn ?? "").trim() || "Menu",
        description: menu?.description ? String(menu.description).trim() : null,
        screens,
      };
    });

    const flat: SkeletonScreen[] = menus.flatMap((menu) =>
      menu.screens.map((screen) => ({ ...screen, menuKo: menu.nameKo })),
    );
    if (flat.length === 0) {
      throw new Error("IA_GENERATOR_BAD_OUTPUT");
    }

    // ── 2단계: 화면 묶음별 세부 내용을 동시에 채운다 ──────────────────────
    // 전체 화면 목록을 함께 넘겨야 다른 메뉴로 가는 버튼도 연결할 수 있다.
    const roster = flat.map((screen) => `${screen.ref}: ${screen.pageName}`).join("\n");
    const chunks: SkeletonScreen[][] = [];
    for (let i = 0; i < flat.length; i += SCREENS_PER_CALL) {
      chunks.push(flat.slice(i, i + SCREENS_PER_CALL));
    }

    const settled = await Promise.allSettled(
      chunks.map((chunk) =>
        askJson(
          client,
          DETAIL_SYSTEM,
          [
            conceptBlock,
            `\n전체 화면 목록(targetRef 후보):\n${roster}`,
            `\n담당 화면:\n${chunk
              .map(
                (s) =>
                  `${s.ref}: [${s.menuKo}] ${s.screenGroup ? `${s.screenGroup} · ` : ""}${s.pageName} (${s.screenRole})`,
              )
              .join("\n")}`,
          ].join("\n"),
          DETAIL_MAX_TOKENS,
        ),
      ),
    );

    const details = new Map<string, ScreenDetail>();
    let failed = 0;
    for (const result of settled) {
      if (result.status === "fulfilled") {
        collectDetails(result.value, details);
      } else {
        failed += 1;
      }
    }
    // 전부 실패했다면 요건도 프롬프트도 없는 껍데기가 되므로 실패로 알린다.
    if (failed === chunks.length) {
      throw new Error("IA_GENERATOR_BAD_OUTPUT");
    }
    if (failed > 0) {
      console.error(`generateIa: 세부 생성 ${failed}/${chunks.length}묶음 실패(해당 화면은 요건 비움)`);
    }

    // 존재하지 않는 화면을 가리키는 버튼은 여기서 걸러 둔다.
    const validRefs = new Set(flat.map((screen) => screen.ref));
    return {
      menus: menus.map((menu) => ({
        nameKo: menu.nameKo,
        nameEn: menu.nameEn,
        description: menu.description,
        screens: menu.screens.map((screen) => {
          const d = details.get(screen.ref);
          return {
            ref: screen.ref,
            pageName: screen.pageName,
            screenGroup: screen.screenGroup,
            screenRole: screen.screenRole,
            funcDef: d?.funcDef ?? "",
            prompt: d?.prompt ?? "",
            buttons: (d?.buttons ?? []).filter(
              (button) => validRefs.has(button.targetRef) && button.targetRef !== screen.ref,
            ),
          };
        }),
      })),
    };
  },
};
