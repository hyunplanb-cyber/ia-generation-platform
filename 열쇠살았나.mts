/**
 * 손님 서비스가 살아 있나 — 열쇠와 «실제 생성»을 함께 본다.
 *
 *   npx tsx 열쇠살았나.mts
 *
 * 왜 있나 — 2026-08-24.
 *   API 열쇠가 1개월 만료로 설정돼 있어 8/15 에 죽었다. 그런데 **9일 동안 아무도 몰랐다.**
 *   8/20 에 손님 한 분이 두 번 눌러 보고 그냥 갔다. 지금 구조로는 «손님이 눌러 봐야만»
 *   죽은 걸 알 수 있다. 그래서 매일 스스로 재게 한다.
 *
 * 두 가지를 잰다 — 하나만으로는 모자라다.
 *   ① 열쇠가 살아 있나  — 4토큰짜리 인사를 보내 본다 (거의 공짜다)
 *   ② 손님이 실제로 만들고 있나 — DB 에서 «마지막 성공»과 «최근 실패»를 센다
 *      ①만 보면 열쇠는 멀쩡한데 다른 데가 막힌 경우를 놓친다.
 *
 * ⚠ ①은 «이 컴퓨터의 .env.local» 열쇠를 잰다. Vercel 것과 다를 수 있다 —
 *   실제로 2026-08-24 에 Vercel 만 새 열쇠로 바꾸고 로컬은 옛것이었다.
 *   그래서 ② 를 같이 본다. ②가 성하면 손님 쪽은 도는 것이다.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const { db } = await import("@/db/client");
const { sql } = await import("drizzle-orm");

let 탈 = 0;
const 짚기 = (말: string) => { console.log(`  ⛔ ${말}`); 탈++; };
const 좋음 = (말: string) => console.log(`  ✓ ${말}`);
const 참고 = (말: string) => console.log(`  · ${말}`);

/* ── ① 열쇠가 살아 있나 ────────────────────────────────── */
/* 401 이었나 — 마무리에서 «이 컴퓨터만 옛것인지»를 가려 말하려고 들고 있는다. */
let 죽음401 = false;
console.log("\n═══ ① 열쇠가 살아 있나 (이 컴퓨터의 .env.local) ═══");
const 열쇠 = (process.env.ANTHROPIC_API_KEY ?? "").trim();
if (!열쇠) {
  짚기(".env.local 에 ANTHROPIC_API_KEY 가 없습니다");
} else {
  /* 값은 절대 찍지 않는다 — 앞뒤 몇 글자로 «어느 열쇠인지»만 알아본다 */
  참고(`열쇠 ${열쇠.slice(0, 14)}…${열쇠.slice(-4)} · ${열쇠.length}글자`);
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": 열쇠, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 4, messages: [{ role: "user", content: "hi" }] }),
    });
    if (r.status === 200) 좋음("열쇠가 살아 있습니다");
    else {
      const j = await r.json().catch(() => ({}));
      const 말 = (j as { error?: { message?: string } })?.error?.message ?? "(까닭 모름)";
      /* 401 은 «열쇠가 죽은 것», 400 잔액부족은 «돈이 없는 것» — 처방이 다르다 */
      if (r.status === 401) { 죽음401 = true; 짚기(`열쇠가 거부됩니다 (401) — 만료·삭제됐습니다. · ${말}`); }
      else if (/credit|balance/i.test(말)) 짚기(`잔액이 모자랍니다 — 자동충전을 확인하세요. · ${말}`);
      else 짚기(`API 가 ${r.status} 로 답합니다 · ${말}`);
    }
  } catch (e) {
    짚기(`API 에 닿지 못했습니다 — ${(e as Error).message}`);
  }
}

/* ── ② 손님이 실제로 만들고 있나 ───────────────────────── */
console.log("\n═══ ② 손님 쪽이 도나 (검수 DB) ═══");
type 줄 = Record<string, unknown>;
const 물어 = async (q: ReturnType<typeof sql>): Promise<줄[]> => {
  const r = await db.execute(q);
  return ((r as unknown as { rows?: 줄[] }).rows ?? (r as unknown as 줄[])) ?? [];
};

const [마지막] = await 물어(sql`
  select max(created_at) as 때, count(*) filter (where created_at >= now() - interval '7 days') as 이레치
  from "menu"`);
/* ⛔ 날글로 읽으면 timestamp 에 시간대가 안 붙어 온다 — UTC 라고 못 박아 읽는다.
     안 그러면 9시간이 틀어진다 (2026-08-25 사장님이 짚으셨다). */
const 서울 = { timeZone: "Asia/Seoul" } as const;
const UTC로 = (v: unknown): Date | null => {
  if (v == null) return null;
  const s = String(v);
  return /[zZ]$|[+-]\d{2}:?\d{2}$/.test(s) ? new Date(s) : new Date(s.replace(" ", "T") + "Z");
};
const 때 = UTC로(마지막?.때);
/* 마무리에서 «이 컴퓨터만 옛 열쇠인지»를 가리려고 며칠 전인지 들고 있는다. */
let 최근성공며칠: number | null = null;
if (!때) 짚기("성공한 생성이 하나도 없습니다");
else {
  const 며칠 = Math.floor((Date.now() - 때.getTime()) / 86400000);
  최근성공며칠 = 며칠;
  참고(`마지막 성공: ${때.toLocaleString("ko-KR", 서울)} (${며칠}일 전) · 최근 7일 메뉴 ${마지막.이레치}개`);
  /* ⚠ 손님이 안 온 것과 «막힌 것»은 다르다. 그래서 아래 실패 기록을 같이 본다. */
  if (며칠 >= 14) 참고(`${며칠}일째 성공이 없습니다 — 손님이 안 온 것인지 막힌 것인지 아래를 보세요`);
}

/* 실패 기록 — 생성시도 표가 있으면 «눌렀는데 실패»를 셀 수 있다 */
const [있나] = await 물어(sql`select to_regclass('public.generation_attempt') is not null as 있음`);
if (!있나?.있음) {
  참고("생성시도 기록 표가 아직 없습니다 — «눌렀는데 실패»를 셀 수 없습니다");
} else {
  const [센것] = await 물어(sql`
    select count(*) filter (where not ok and created_at >= now() - interval '3 days') as 최근실패,
           count(*) filter (where ok     and created_at >= now() - interval '3 days') as 최근성공,
           count(*) as 통틀어,
           max(created_at) filter (where not ok) as 마지막실패
    from "generation_attempt"`);
  const 최근실패 = Number(센것.최근실패);
  const 최근성공 = Number(센것.최근성공);
  참고(`최근 3일 — 성공 ${최근성공} · 실패 ${최근실패}`);

  /* ⛔ key-dead 는 «손님이 다시 눌러도 안 되는» 실패다. 한 건이라도 나오면 바로 짚는다.
     다른 실패는 몇 건 쌓여야 경보를 내지만 이건 하나로도 서비스가 멈춘 것이다.
     (2026-08-25 — 그 전에는 401 이 failed 로 뭉뚱그려져 까닭을 가릴 수가 없었다) */
  const [열쇠실패] = await 물어(sql`
    select count(*) as n, max(created_at) as 마지막
    from "generation_attempt"
    where not ok and reason = 'key-dead' and created_at >= now() - interval '7 days'`);
  if (Number(열쇠실패?.n) > 0)
    짚기(
      `⛔⛔ 최근 7일에 «열쇠가 죽어서» 못 만든 것이 ${열쇠실패.n}건입니다 ` +
        `(마지막 ${UTC로(열쇠실패.마지막)?.toLocaleString("ko-KR", 서울) ?? "?"}) — 손님이 지금 막혀 있습니다.`,
    );
  if (최근실패 > 0 && 최근성공 === 0)
    짚기(`최근 3일에 «실패만» ${최근실패}건 있습니다 — 손님이 막혀 있습니다`);
  else if (최근실패 >= 3)
    짚기(`최근 3일에 실패가 ${최근실패}건입니다 — 무엇이 막는지 보세요`);
  /* ⚠ 「아무도 안 눌렀다」를 «초록»으로 말하면 안 된다 (2026-08-25).
       실패 0 건은 「막힌 데 없다」는 뜻일 수도 있고 「잰 것이 아예 없다」는 뜻일
       수도 있는데, 둘이 같은 ✓ 로 보이면 «손님이 안 온 것»과 «손님이 막힌 것»을
       가르려고 이 표를 만든 뜻이 없어진다. 잰 것이 없으면 없다고 말한다. */
  else if (최근실패 === 0 && 최근성공 === 0)
    참고(Number(센것.통틀어) === 0
      ? "아직 잰 것이 없습니다 — 표를 만든 뒤로 아무도 생성을 누르지 않았습니다"
      : "아직 잰 것이 없습니다 — 최근 3일에 누른 손님이 없습니다(막힌 것과 다릅니다)");
  else 좋음(`최근 실패가 쌓이지 않았습니다 (성공 ${최근성공}건이 났습니다)`);
}

/* ── 마무리 ───────────────────────────────────────────── */
console.log("\n═══ 정리 ═══");
if (탈) {
  console.log(`  ⛔ ${탈}군데가 막혀 있습니다.`);
  /* ⛔ 401 인데 «손님 쪽은 최근에 됐다»면 십중팔구 이 컴퓨터 것만 옛 열쇠다.
     그 말을 안 해 주면 매일 도는 검사가 매일 빨간불을 내고, 며칠이면 아무도 안 본다 —
     그러면 진짜로 막힌 날을 놓친다. 8/15~8/24 가 그렇게 아흐레였다. (2026-08-25) */
  if (죽음401 && 최근성공며칠 !== null && 최근성공며칠 <= 3) {
    console.log("");
    console.log(`  ⚠ 그런데 손님 쪽은 ${최근성공며칠}일 전에 성공했습니다.`);
    console.log("     그러면 죽은 것은 «이 컴퓨터의 .env.local» 뿐이고 Vercel 것은 살아 있습니다.");
    console.log("     ⛔ 그래도 그냥 두면 안 됩니다 — 이 검사는 .env.local 열쇠를 재기 때문에,");
    console.log("        옛 열쇠를 두면 «매일 헛으로 빨간불»이 나고 진짜로 막힌 날을 놓치게 됩니다.");
    console.log("        .env.local 의 ANTHROPIC_API_KEY 를 Vercel 과 같은 열쇠로 바꿔 주세요.");
  }
  console.log("");
  console.log("     열쇠가 죽었으면 — 콘솔에서 새로 만들고(만료: 없음) Vercel 과 .env.local 둘 다 바꿉니다.");
  console.log("     ⚠ Vercel 의 ANTHROPIC_API_KEY 는 «지우면 안 됩니다» — 그게 손님 몫입니다.\n");
  process.exit(1);
}
console.log("  ✓ 손님이 AI팩을 만들 수 있는 상태입니다.\n");
process.exit(0);
