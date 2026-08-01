import Anthropic from "@anthropic-ai/sdk";
import type {
  EnrichContext,
  EnrichScreenInput,
  EnrichResult,
  EnrichedScreen,
  IaEnricher,
} from "@/domain/ports/ia-enricher";

// 다운로드 순간에만 도는 모델. 생성(미리보기)은 계속 하이쿠다
// (claude-ia-generator.ts) — 무료 체험 남용을 싸게 막는 게 그쪽 설계 의도라서.
// 여기서만 좋은 모델을 쓰는 이유: 돈을 낸 고객이 받는 파일이 상품 본체다.
const MODEL = "claude-opus-5";

// 한 번에 3화면. 하이쿠 생성기는 5개인데(claude-ia-generator.ts:18) 여기가 더 적다 —
// 오푸스가 더 느려서 묶음이 크면 한 요청이 오래 걸리고, 그만큼 실패 시 잃는 것도 크다.
const SCREENS_PER_CALL = 3;
// 오푸스5는 생각(thinking)이 기본으로 켜져 있고, 이 한도는 생각과 본문을 합쳐서 센다.
// 빠듯하게 잡으면 생각하다 본문이 잘린다 → 넉넉히.
const MAX_TOKENS = 12000;

// 모델마다 받는 설정이 다르다. 하이쿠 4.5는 effort도 adaptive thinking도 모르고,
// 주면 400이 난다 — 모델 비교 스크립트가 같은 코드를 타야 해서 여기서 갈라 준다.
function tuningFor(model: string) {
  if (model.startsWith("claude-haiku")) return {};
  return {
    thinking: { type: "adaptive" as const },
    // 본문을 다시 쓰는 일이라 깊은 추론보다 응답 시간이 중요하다
    // (다운로드 도중 사람이 기다리는 화면이다).
    output_config: { effort: "medium" as const },
  };
}
// 동시에 띄우는 요청 수. 한꺼번에 다 던지면 속도제한에 걸리지만, 너무 적으면
// 라우트 제한(300초)을 넘긴다. 2026-08-01 실측: 오푸스5는 한 묶음에 68초.
// 144화면 = 48묶음이라 8개씩이면 7파(≈480초)로 시간 초과, 24개씩이면 3파(≈205초).
const CONCURRENCY = 24;

const SYSTEM = [
  "당신은 실무 웹 기획자를 돕는 IA 설계 어시스턴트입니다.",
  "이미 확정된 화면에 대해, 기존에 작성된 '기능정의'와 'AI 프롬프트'를 더 촘촘하게 다시 씁니다.",
  "",
  "가장 중요한 규칙 — 뼈대는 건드리지 않습니다.",
  "- 화면 개수·화면명·메뉴 구성은 이미 고객이 확인한 것입니다. 바꾸거나 늘리거나 줄이지 마세요.",
  "- 받은 ref를 그대로 돌려주고, 담당하지 않은 화면은 출력하지 마세요.",
  "- 화면명을 다시 쓰거나 새 화면을 제안하지 마세요. 본문만 다시 씁니다.",
  "",
  "출력은 반드시 아래 JSON 하나만, 다른 설명 없이 출력하세요:",
  "{",
  '  "screens": [',
  "    {",
  '      "ref": "주어진 ref를 그대로",',
  '      "funcDef": "이 화면에 필요한 세부 요건을 \'·\'로 구분해 나열",',
  '      "prompt": "이 화면을 AI 코딩 도구로 만들 때 붙여넣을 한국어 프롬프트"',
  "    }",
  "  ]",
  "}",
  "",
  "기능정의(funcDef) 규칙:",
  "- 기존 내용을 버리지 말고, 빠진 것을 채우고 뭉뚱그린 것을 구체적으로 바꾸세요.",
  "- 각 항목은 '무엇이 어떻게 동작하는가'가 드러나야 합니다. '~기능', '~처리' 같은 명사 나열은 피하세요.",
  "- 분량은 화면 성격에 맞춥니다.",
  "  · 메인·홈·랜딩: 8~12개. 기능 나열이 아니라 위에서 아래로 쌓이는 '섹션'을 순서대로.",
  "  · 목록·상세: 6~9개 (정렬·필터·페이징·빈 상태·권한까지)",
  "  · 입력·폼: 5~7개 (필수값·유효성 규칙·에러 문구 위치·저장 후 이동까지)",
  "  · 상태·예외 화면(비어 있음·오류·완료·마감): 3~5개. 억지로 늘리지 마세요.",
  "- 실무에서 개발자가 물어볼 것을 미리 적으세요: 빈 값일 때, 권한이 없을 때, 숫자·날짜 형식, 정렬 기준.",
  "",
  "AI 프롬프트(prompt) 규칙:",
  "- 그대로 복사해 AI 코딩 도구에 붙여넣으면 이 화면이 나오도록 씁니다.",
  "- 화면 목적 → 레이아웃(위에서 아래) → 각 영역의 구성요소 → 상태·예외 순으로.",
  "- 색·폰트 같은 디자인 값은 넣지 마세요(디자인 프리셋이 따로 있습니다).",
  "- 다른 화면으로 가는 버튼이 있으면 어디로 가는지 문장으로 적으세요.",
].join("\n");

function buildSharedBlock(ctx: EnrichContext): string {
  const deviceLabel =
    ctx.deviceMode === "mobile"
      ? "모바일 웹·앱 전용"
      : ctx.deviceMode === "pc"
        ? "PC 웹 전용"
        : "반응형(하나의 화면이 기기에 맞춰 적응)";
  const lines = [`사이트 컨셉:\n${ctx.concept}`];
  if (ctx.designConcept) lines.push(`\n디자인 컨셉:\n${ctx.designConcept}`);
  lines.push(`\n디바이스 대응: ${deviceLabel}`);
  lines.push(`\n전체 화면 목록(이 사이트에 이미 확정된 화면들 — 참고용, 바꾸지 말 것):\n${ctx.roster}`);
  return lines.join("\n");
}

function buildChunkBlock(chunk: EnrichScreenInput[]): string {
  const parts = chunk.map((s) => {
    const head = `${s.ref}: [${s.menuKo}] ${s.screenGroup ? `${s.screenGroup} · ` : ""}${s.pageName} (${s.screenRole})`;
    const body = [
      `  현재 기능정의: ${s.funcDef || "(비어 있음)"}`,
      `  현재 프롬프트: ${s.prompt || "(비어 있음)"}`,
    ];
    // 손으로 고친 칸은 아예 손대지 말라고 말해 둔다. 값도 어차피 버리지만,
    // 모델이 "이건 그대로 두는 칸"임을 알아야 나머지를 그 톤에 맞춰 쓴다.
    if (s.keepFuncDef) body.push("  ※ 기능정의는 사용자가 직접 고친 칸입니다. 그대로 두세요(다시 써도 버려집니다).");
    if (s.keepPrompt) body.push("  ※ 프롬프트는 사용자가 직접 고친 칸입니다. 그대로 두세요(다시 써도 버려집니다).");
    return [head, ...body].join("\n");
  });
  return `담당 화면(${chunk.length}개 — 정확히 이 개수만큼 출력):\n${parts.join("\n\n")}`;
}

function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("IA_ENRICHER_BAD_OUTPUT");
  }
  return text.slice(start, end + 1);
}

type ChunkOutcome = {
  screens: EnrichedScreen[];
  usage: { input: number; cacheRead: number; cacheWrite: number; output: number };
};

async function askChunk(
  client: Anthropic,
  shared: string,
  chunk: EnrichScreenInput[],
  model: string,
): Promise<ChunkOutcome> {
  const message = await client.messages.create({
    model,
    max_tokens: MAX_TOKENS,
    ...tuningFor(model),
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: [
          // 시스템 + 컨셉 + 화면 목록이 묶음마다 똑같이 반복된다 → 캐시로 입력비를 크게 줄인다.
          { type: "text", text: shared, cache_control: { type: "ephemeral" } },
          { type: "text", text: buildChunkBlock(chunk) },
        ],
      },
    ],
  });

  if (message.stop_reason === "max_tokens") {
    // 잘린 JSON은 신뢰할 수 없다. 이 묶음은 버리고 기존 본문을 그대로 둔다.
    throw new Error("IA_ENRICHER_TRUNCATED");
  }

  const textBlock = message.content.find((block) => block.type === "text");
  const raw = textBlock?.type === "text" ? textBlock.text : "";
  const payload = JSON.parse(extractJson(raw)) as { screens?: unknown };

  const wanted = new Map(chunk.map((s) => [s.ref, s]));
  const got = Array.isArray(payload.screens) ? payload.screens : [];
  const screens: EnrichedScreen[] = [];
  for (const item of got) {
    const ref = String((item as { ref?: unknown })?.ref ?? "").trim();
    const source = wanted.get(ref);
    if (!source) continue; // 담당이 아닌 화면을 지어냈다 — 버린다.
    const funcDef = String((item as { funcDef?: unknown })?.funcDef ?? "").trim();
    const prompt = String((item as { prompt?: unknown })?.prompt ?? "").trim();
    screens.push({
      ref,
      // 손으로 고친 칸은 여기서 확실히 되돌린다(모델이 규칙을 어겨도 안전하게).
      funcDef: source.keepFuncDef ? source.funcDef : funcDef,
      prompt: source.keepPrompt ? source.prompt : prompt,
    });
  }

  // 개수가 안 맞으면 뼈대가 흔들린 것이다 — 이 묶음은 통째로 실패로 본다.
  if (screens.length !== chunk.length) {
    throw new Error("IA_ENRICHER_SHAPE_MISMATCH");
  }

  const u = message.usage;
  return {
    screens,
    usage: {
      input: u.input_tokens ?? 0,
      cacheRead: u.cache_read_input_tokens ?? 0,
      cacheWrite: u.cache_creation_input_tokens ?? 0,
      output: u.output_tokens ?? 0,
    },
  };
}

export const claudeIaEnricher: IaEnricher = {
  async enrich(
    ctx: EnrichContext,
    screens: EnrichScreenInput[],
    opts?: { model?: string },
  ): Promise<EnrichResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY_MISSING");
    }
    const model = opts?.model ?? MODEL;
    const client = new Anthropic({ apiKey });
    const shared = buildSharedBlock(ctx);

    const chunks: EnrichScreenInput[][] = [];
    for (let i = 0; i < screens.length; i += SCREENS_PER_CALL) {
      chunks.push(screens.slice(i, i + SCREENS_PER_CALL));
    }

    const out: EnrichedScreen[] = [];
    const usage = { inputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0 };
    let failedChunks = 0;

    const collect = (r: PromiseSettledResult<ChunkOutcome>) => {
      if (r.status === "fulfilled") {
        out.push(...r.value.screens);
        usage.inputTokens += r.value.usage.input;
        usage.cacheReadTokens += r.value.usage.cacheRead;
        usage.cacheWriteTokens += r.value.usage.cacheWrite;
        usage.outputTokens += r.value.usage.output;
      } else {
        failedChunks += 1;
        console.error("enrich: 묶음 실패", r.reason);
      }
    };

    // 첫 묶음은 혼자 보낸다. 캐시는 첫 응답이 시작돼야 읽을 수 있어서,
    // 처음부터 전부 동시에 던지면 전원이 캐시를 못 쓰고 제값을 낸다.
    if (chunks.length > 0) {
      collect((await Promise.allSettled([askChunk(client, shared, chunks[0], model)]))[0]);
    }

    // 나머지는 CONCURRENCY만큼씩 동시에.
    for (let i = 1; i < chunks.length; i += CONCURRENCY) {
      const wave = chunks.slice(i, i + CONCURRENCY);
      const settled = await Promise.allSettled(wave.map((c) => askChunk(client, shared, c, model)));
      settled.forEach(collect);
    }

    return { screens: out, usage, failedChunks, totalChunks: chunks.length };
  },
};
