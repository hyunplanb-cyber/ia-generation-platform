import Anthropic from "@anthropic-ai/sdk";
import type { PromptGenerator, PromptGeneratorInput } from "@/domain/ports/prompt-generator";

const MODEL = "claude-haiku-4-5";

const SYSTEM_PROMPT =
  "당신은 웹 화면 하나를 AI 코딩 도구(Claude Code, Cursor 등)에 그대로 붙여넣어 " +
  "구현을 요청할 수 있는 프롬프트를 작성하는 어시스턴트입니다. " +
  "주어진 사이트 컨셉, 메뉴 정보, 화면명, 기능정의, 같은 메뉴의 다른 화면을 참고해 " +
  "한국어로 자연스럽고 구체적인 프롬프트 문장을 작성하세요. " +
  "부가 설명 없이 프롬프트 본문만 출력하세요.";

function buildUserMessage(input: PromptGeneratorInput): string {
  const lines = [
    `사이트 컨셉: ${input.project.concept}`,
    `소속 메뉴: ${input.menu.nameKo} (${input.menu.nameEn})`,
  ];
  if (input.menu.description) {
    lines.push(`메뉴 설명: ${input.menu.description}`);
  }
  lines.push(`화면명: ${input.screen.pageName}`);
  if (input.screen.funcDef) {
    lines.push(`화면 기능정의: ${input.screen.funcDef}`);
  }
  if (input.siblingScreens.length > 0) {
    lines.push(`같은 메뉴의 다른 화면: ${input.siblingScreens.map((s) => s.pageName).join(", ")}`);
  }
  return lines.join("\n");
}

export const claudePromptGenerator: PromptGenerator = {
  async generate(input: PromptGeneratorInput): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY_MISSING");
    }

    const client = new Anthropic({ apiKey });
    // 메인 화면 등 상세 프롬프트는 1024로는 문장 중간에 잘릴 수 있어 넉넉히 확보한다.
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(input) }],
    });

    // 잘렸다면 문장이 끊긴 반쪽 프롬프트가 나가므로 실패로 처리한다(호출부에서 재시도/폴백).
    if (message.stop_reason === "max_tokens") {
      throw new Error("PROMPT_GENERATOR_TRUNCATED");
    }

    const textBlock = message.content.find((block) => block.type === "text");
    return textBlock?.type === "text" ? textBlock.text.trim() : "";
  },
};
