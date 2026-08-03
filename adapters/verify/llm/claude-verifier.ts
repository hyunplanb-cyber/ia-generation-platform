import Anthropic from "@anthropic-ai/sdk";
import type { Scenario } from "@/domain/verify/report";
import type {
  VerifyAnalyzer,
  VerifyAnalyzerInput,
  VerifyAnalysis,
} from "@/domain/ports/verify-analyzer";

// 검수는 "뭐가 빠졌는지 찾는" 일이라 추론이 필요하고, 모델 차이가 가장 크게 벌어진다.
// 같은 사이트로 비교했을 때 하이쿠는 확인 화면 22개·절차 75개, 오푸스는 33개·138개였다.
// 하이쿠가 "홈 화면을 열어 잘 보이는지 확인하세요" 수준이라면, 오푸스는
// "비밀번호를 일부러 틀리게 넣고 안내가 뜨는지", "결제 버튼을 두 번 눌러도 중복되지 않는지"를 적는다.
const MODEL = "claude-opus-5";
// 시나리오가 6~10개면 JSON이 길어져 4000토큰에서 잘려 파싱이 깨지곤 했다 → 넉넉히.
const MAX_TOKENS = 8000;

const SITE_INTRO = [
  "당신은 웹사이트 오픈 전 점검을 돕는 QA 어시스턴트입니다.",
  "사용자가 바이브코딩(AI)으로 만든 사이트의 HTML을 보고, '오픈 전에 사람이 직접 확인해야 할 것'을 짚어줍니다.",
  "개발자가 아닌 1인 창업자도 읽을 수 있게, 전문용어 대신 쉬운 말로 씁니다.",
];

const DOC_INTRO = [
  "당신은 웹사이트 오픈 전 점검을 돕는 QA 어시스턴트입니다.",
  "사용자가 넣은 것은 '실제 사이트'가 아니라 설계 문서(화면설계서·기획서)입니다.",
  "이 설계대로 사이트를 만들었을 때 '무엇을 확인해야 하는지' 검수 시나리오만 만듭니다.",
  "실제 화면이 없으므로 Pass/Fail 판정은 하지 않고, 확인할 시나리오와 요약만 냅니다.",
  "개발자가 아닌 1인 창업자도 읽을 수 있게, 전문용어 대신 쉬운 말로 씁니다.",
];

const COMMON = [
  "출력은 반드시 아래 JSON 하나만, 다른 설명 없이 출력하세요:",
  "{",
  '  "sensitiveScreens": ["로그인", "결제", ...],',
  '  "scenarios": [ { "area": "public"|"sensitive", "screen": "화면 이름", "steps": ["확인 절차 1", "확인 절차 2"] } ],',
  '  "summary": "이 사이트 상태를 3~4문장으로 쉽게 요약"',
  "}",
  "규칙:",
  "- sensitiveScreens: 로그인·회원가입·결제·주문·개인정보 입력 등 '로그인해야 보이거나 민감한' 화면을 링크·폼에서 추론해 나열. 없으면 빈 배열.",
  "- scenarios: 화면 6~10개.",
  "  · 민감 화면(sensitive)은 자동 검수가 안 되므로 '직접 재현해 확인할 절차'를 구체적으로. 예: 로그인 → 마이페이지 → 예약 내역이 없을 때 안내가 뜨는지.",
  "  · 공개 화면(public)은 눈으로 확인하면 좋은 것. 예: 목록이 비었을 때 화면, 검색 결과 없을 때, 모바일에서 버튼이 안 잘리는지.",
  "  · AI가 자주 빠뜨리는 '예외 상황'(비어 있음·오류·실패·마감)을 특히 챙기세요.",
  // 아래 네 줄은 docs/검수시나리오_작성지침.md의 원칙 2·3을 그대로 옮긴 것이다.
  // 판매팩의 검수 시나리오와 여기서 만드는 것이 같은 물건처럼 보여야 한다.
  "- steps는 각 1문장, 명령형으로. 확인할 대상을 되풀이하지 말고 '무엇을 눌러 무엇을 보는지'를 쓰세요.",
  "  · 개수가 적힌 것은 세어 보게, 입력·폼은 빈 값과 잘못된 값을 넣어 보게,",
  "    버튼·링크는 눌러서 어디로 가는지, 목록·필터는 조건을 바꿔 결과가 달라지는지 보게 씁니다.",
  "  · 결제·로그인은 성공만 보지 말고 실패·취소까지 각각 해 보게 하세요.",
  "  · 무엇이 맞는 상태인지 함께 적어, 읽는 사람이 통과/실패를 스스로 고를 수 있게 하세요.",
  "- summary는 좋은 점과 확인이 필요한 점을 균형 있게, 겁주지 말고 담백하게.",
].join("\n");

function systemPrompt(mode: "site" | "document"): string {
  const intro = mode === "document" ? DOC_INTRO : SITE_INTRO;
  return intro.join("\n") + "\n" + COMMON;
}

function buildUserMessage(input: VerifyAnalyzerInput): string {
  const focus = input.focus ? `\n\n[이번 회차 관점] ${input.focus}` : "";
  if (input.mode === "document") {
    return [`설계 문서: ${input.label}`, `\n문서 내용(축약):\n${input.content}`, focus].join("\n");
  }
  return [
    `검사 대상 사이트: ${input.label}`,
    input.links.length > 0 ? `\n페이지에서 찾은 내부 링크:\n${input.links.join("\n")}` : "",
    `\n페이지 HTML(축약):\n${input.content}`,
    focus,
  ].join("\n");
}

function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) throw new Error("VERIFY_BAD_OUTPUT");
  return text.slice(start, end + 1);
}

export const claudeVerifier: VerifyAnalyzer = {
  async analyze(
    input: VerifyAnalyzerInput,
    opts?: { model?: string },
  ): Promise<VerifyAnalysis> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY_MISSING");

    const client = new Anthropic({ apiKey });
    const model = opts?.model ?? MODEL;

    let message;
    try {
      message = await client.messages.create({
        model,
        max_tokens: MAX_TOKENS,
        // 하이쿠 4.5는 effort·adaptive thinking을 모른다(주면 400).
        ...(model.startsWith("claude-haiku")
          ? {}
          : { thinking: { type: "adaptive" as const }, output_config: { effort: "medium" as const } }),
        system: systemPrompt(input.mode),
        messages: [{ role: "user", content: buildUserMessage(input) }],
      });
    } catch (err) {
      // 모델·인증·요청한도 등 API 호출 자체의 실패.
      console.error("verify analyze: API 호출 실패", err);
      throw new Error("VERIFY_API_ERROR");
    }

    // 실제 원가. 검수는 입력이 16,000자로 잘려 있어 화면 수와 무관하게 거의 고정이다
    // (화면마다 도는 다운로드 보강과 원가 구조가 다르다).
    const u = message.usage;
    console.log(
      `verify(${input.mode}${input.focus ? "·추가회차" : ""}): 입력 ${u.input_tokens ?? 0} · 출력 ${u.output_tokens ?? 0}`,
    );

    const textBlock = message.content.find((b) => b.type === "text");
    const raw = textBlock?.type === "text" ? textBlock.text : "";

    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJson(raw));
    } catch {
      // 응답이 잘렸거나(JSON 미완성) 형식이 어긋난 경우. 원인 파악용 로그를 남긴다.
      console.error(
        "verify analyze: JSON 파싱 실패",
        "stop_reason=",
        message.stop_reason,
        "output_tokens=",
        message.usage?.output_tokens,
        "raw앞:",
        raw.slice(0, 200),
      );
      throw new Error("VERIFY_BAD_OUTPUT");
    }

    const p = parsed as {
      sensitiveScreens?: unknown;
      scenarios?: unknown;
      summary?: unknown;
    };

    const sensitiveScreens = Array.isArray(p.sensitiveScreens)
      ? p.sensitiveScreens.map((s) => String(s).trim()).filter(Boolean)
      : [];

    const scenarios: Scenario[] = (Array.isArray(p.scenarios) ? p.scenarios : [])
      .map((s): Scenario => {
        const o = s as { area?: unknown; screen?: unknown; steps?: unknown };
        return {
          area: o.area === "sensitive" ? "sensitive" : "public",
          screen: String(o.screen ?? "").trim() || "화면",
          steps: (Array.isArray(o.steps) ? o.steps : [])
            .map((x) => String(x).trim())
            .filter(Boolean),
        };
      })
      .filter((s) => s.steps.length > 0);

    return {
      sensitiveScreens,
      scenarios,
      summary: String(p.summary ?? "").trim() || "요약을 만들지 못했어요.",
    };
  },
};
