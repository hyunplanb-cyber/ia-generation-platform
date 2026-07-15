import Anthropic from "@anthropic-ai/sdk";
import type {
  IaGenerator,
  IaGeneratorInput,
  IaGeneratorOutput,
} from "@/domain/ports/ia-generator";

// 우선 원가가 낮은 haiku로 시작한다. 품질이 부족하면 claude-sonnet-5로 올린다.
const MODEL = "claude-haiku-4-5";

const SYSTEM_PROMPT = [
  "당신은 웹 기획자를 돕는 IA(정보구조) 설계 어시스턴트입니다.",
  "주어진 사이트 컨셉과 대략적인 메뉴 구성을 분석해, 실제로 필요한 메뉴와 화면 목록을 설계합니다.",
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
  '          "screenRole": "화면 유형 태그(list/detail/form/done/main 등 영문 소문자)",',
  '          "funcDef": "이 화면의 설명과 핵심 기능을 2~4문장으로",',
  '          "prompt": "이 화면을 AI 코딩 도구로 만들 때 붙여넣을 한국어 프롬프트",',
  '          "buttons": [',
  '            { "label": "버튼 이름", "targetRef": "클릭 시 이동할 화면의 ref" }',
  "          ]",
  "        }",
  "      ]",
  "    }",
  "  ]",
  "}",
  "규칙:",
  "- 메뉴는 3~8개, 각 메뉴의 화면은 1~4개로 현실적으로 구성하세요.",
  "- 로그인/회원가입이 컨셉상 필요하면 회원 관련 메뉴를 포함하세요.",
  "- screenRole은 같은 메뉴 안에서 중복되지 않게 하세요.",
  "- 영문 메뉴명은 서로 앞 2글자가 겹치지 않게 하면 좋습니다(페이지ID 코드 충돌 방지).",
  "- ref는 전체에서 유일해야 하며, buttons의 targetRef는 반드시 이 생성 결과에 존재하는 다른 화면의 ref여야 합니다.",
  "- 버튼이 없는 화면은 buttons를 빈 배열([])로 두세요. 목록→상세, 폼→완료처럼 자연스러운 이동만 연결하세요.",
].join("\n");

function buildUserMessage(input: IaGeneratorInput): string {
  const lines = [`사이트 컨셉:\n${input.concept}`];
  if (input.menuDraft) {
    lines.push(`\n사용자가 적은 대략적 메뉴 구성:\n${input.menuDraft}`);
  }
  if (input.designConcept) {
    lines.push(`\n디자인 컨셉:\n${input.designConcept}`);
  }
  lines.push(
    `\n디바이스 대응: ${input.deviceMode === "responsive" ? "반응형(PC 기준 1벌)" : "PC/모바일 분리"}`,
  );
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

export const claudeIaGenerator: IaGenerator = {
  async generate(input: IaGeneratorInput): Promise<IaGeneratorOutput> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY_MISSING");
    }

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(input) }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const raw = textBlock?.type === "text" ? textBlock.text : "";

    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJson(raw));
    } catch {
      throw new Error("IA_GENERATOR_BAD_OUTPUT");
    }

    const menus = (parsed as IaGeneratorOutput)?.menus;
    if (!Array.isArray(menus) || menus.length === 0) {
      throw new Error("IA_GENERATOR_BAD_OUTPUT");
    }

    // LLM 출력을 방어적으로 정규화한다(누락 필드 보정).
    let refFallback = 0;
    return {
      menus: menus.map((menu) => ({
        nameKo: String(menu?.nameKo ?? "").trim() || "메뉴",
        nameEn: String(menu?.nameEn ?? "").trim() || "Menu",
        description: menu?.description ? String(menu.description).trim() : null,
        screens: (Array.isArray(menu?.screens) ? menu.screens : []).map((screen) => {
          refFallback += 1;
          const buttons = Array.isArray(screen?.buttons) ? screen.buttons : [];
          return {
            ref: String(screen?.ref ?? "").trim() || `auto-${refFallback}`,
            pageName: String(screen?.pageName ?? "").trim() || "화면",
            screenRole: String(screen?.screenRole ?? "").trim() || "default",
            funcDef: String(screen?.funcDef ?? "").trim(),
            prompt: String(screen?.prompt ?? "").trim(),
            buttons: buttons
              .map((button) => ({
                label: String(button?.label ?? "").trim(),
                targetRef: String(button?.targetRef ?? "").trim(),
              }))
              .filter((button) => button.label && button.targetRef),
          };
        }),
      })),
    };
  },
};
