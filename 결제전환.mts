/**
 * 결제 전환 점검 — 「아직 시험인 자리」를 센다. (2026-08-31, 토스 PG 승인 뒤)
 *
 *   npx tsx 결제전환.mts            # 이 컴퓨터(.env.local) 기준
 *   npx tsx 결제전환.mts --라이브   # 라이브(Vercel) 기준으로 재야 할 때
 *
 * 왜 이게 있어야 하나
 *   2026-07-15 에 만든 열쇠가 1개월 만료로 8/15 에 죽었고, **9일 동안 아무도 몰랐다.**
 *   8/20 에 손님 한 분이 두 번 눌러 보고 그냥 가셨다. 결제는 «조용히» 죽는다 —
 *   화면에는 아무 표시가 안 나고, 손님은 말없이 떠난다. 그래서 사람이 아니라 이것이 센다.
 *
 * ⛔ 열쇠 «값»은 절대 찍지 않는다. 앞 네 글자(test_/live_)만 보고 판단한다.
 *   화면 갈무리나 로그에 시크릿 키가 남으면 그 자체로 사고다.
 */
import { config } from "dotenv";
import { sql } from "drizzle-orm";

config({ path: ".env.local" });

const 라이브기준 = process.argv.includes("--라이브");
const 돈 = (n: number) => n.toLocaleString("ko-KR");

type 줄 = { 괜찮나: boolean; 글: string; 덧말?: string };
const 결과: 줄[] = [];
const 재기 = (괜찮나: boolean, 글: string, 덧말?: string) => 결과.push({ 괜찮나, 글, 덧말 });

/* ── 1. 열쇠 ────────────────────────────────────────────────
 * 토스 열쇠는 앞이 test_ 냐 live_ 냐로 갈린다. 그 네 글자만 본다. */
function 열쇠종류(v: string | undefined): "없음" | "시험" | "라이브" | "모름" {
  if (!v) return "없음";
  if (v.startsWith("test_")) return "시험";
  if (v.startsWith("live_")) return "라이브";
  return "모름";
}

/* 토스 열쇠는 «두 벌»이다. 가운데 글자로 갈린다 —
 *   ck / sk   … API 개별 연동 키  → `toss.payment()`  (결제창)   ← 우리가 쓰는 것
 *   gck / gsk … 결제위젯 연동 키  → `toss.widgets()`  (위젯)
 * 우리 코드는 charge-client.tsx:32 에서 `toss.payment(...)` 를 부른다.
 * 위젯 키를 넣으면 **결제창이 아예 안 뜬다** — 열쇠가 라이브여도 소용없다.
 * 승인 첫날 이걸로 하루를 날리기 쉬워서 여기서 미리 잡는다. */
function 연동종류(v: string | undefined): "없음" | "결제창" | "위젯" | "모름" {
  if (!v) return "없음";
  if (/_g(ck|sk)_/.test(v)) return "위젯";
  if (/_(ck|sk)_/.test(v)) return "결제창";
  return "모름";
}

const 시크릿 = 열쇠종류(process.env.TOSS_SECRET_KEY);
const 클라이언트 = 열쇠종류(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);

for (const [이름, 값] of [
  ["TOSS_SECRET_KEY", process.env.TOSS_SECRET_KEY],
  ["NEXT_PUBLIC_TOSS_CLIENT_KEY", process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY],
] as const) {
  const 종류 = 연동종류(값);
  if (종류 === "없음") continue;
  재기(
    종류 === "결제창",
    `${이름} 의 연동 종류 — ${종류}`,
    종류 === "위젯"
      ? "⛔ 위젯 키다. 우리 코드는 결제창(`toss.payment()`)이라 결제창이 안 뜬다. 「API 개별 연동 키」를 받아야 한다"
      : 종류 === "모름"
        ? "가운데에 ck/sk 도 gck/gsk 도 없다. 토스 키가 맞는지 확인이 필요하다"
        : undefined,
  );
}

재기(
  시크릿 === "라이브",
  `TOSS_SECRET_KEY — ${시크릿}`,
  시크릿 === "없음"
    ? "이 컴퓨터에는 없다. 라이브는 Vercel 에만 있어도 된다"
    : 시크릿 === "시험"
      ? "아직 시험 열쇠다. 토스 상점관리자에서 라이브 키를 받아 Vercel 에 넣는다"
      : undefined,
);
재기(
  클라이언트 === "라이브",
  `NEXT_PUBLIC_TOSS_CLIENT_KEY — ${클라이언트}`,
  클라이언트 === "시험" ? "시험 열쇠로는 손님 카드에서 돈이 안 빠진다" : undefined,
);
재기(
  시크릿 === 클라이언트 || 시크릿 === "없음" || 클라이언트 === "없음",
  "두 열쇠가 같은 종류인가",
  시크릿 !== 클라이언트 && 시크릿 !== "없음" && 클라이언트 !== "없음"
    ? `⛔ 섞여 있다(시크릿 ${시크릿} · 클라이언트 ${클라이언트}). 결제창은 뜨는데 승인이 막힌다`
    : undefined,
);

/* ── 2. 스위치 ─────────────────────────────────────────────── */
const 켜짐 = (n: string) => process.env[n] === "true";
재기(켜짐("CREDITS_OPEN"), `CREDITS_OPEN — ${process.env.CREDITS_OPEN ?? "(없음)"}`,
  켜짐("CREDITS_OPEN") ? undefined : "충전·다운로드가 아직 「준비 중」으로 막혀 있다");
재기(켜짐("PACKAGE_SALE_OPEN"), `PACKAGE_SALE_OPEN — ${process.env.PACKAGE_SALE_OPEN ?? "(없음)"}`,
  켜짐("PACKAGE_SALE_OPEN") ? undefined : "AI팩 구매 버튼이 아직 안 열렸다");
재기(!켜짐("REVIEW_MODE"), `REVIEW_MODE — ${process.env.REVIEW_MODE ?? "(없음·좋다)"}`,
  켜짐("REVIEW_MODE")
    ? "심사 모드다. 오푸스 보강이 꺼지고, 충전은 5만원 2회까지, 팩은 플러스만 팔린다"
    : undefined);
const 명단 = (process.env.BILLING_ALLOWLIST ?? "").split(",").map((s) => s.trim()).filter(Boolean);
재기(명단.length === 0, `BILLING_ALLOWLIST — ${명단.length === 0 ? "(비어 있음·좋다)" : `${명단.length}명`}`,
  명단.length > 0 ? `아직 ${명단.join(", ")} 에게만 열려 있다` : undefined);
재기(process.env.ALLOW_REVIEW_SIGNUP !== "true", `ALLOW_REVIEW_SIGNUP — ${process.env.ALLOW_REVIEW_SIGNUP ?? "(없음·좋다)"}`,
  process.env.ALLOW_REVIEW_SIGNUP === "true" ? "메일·비밀번호 가입이 열려 있다. 심사 계정 만들 때만 잠깐 켜는 값이다" : undefined);

/* ── 3. DB 에 남은 시험 흔적 ────────────────────────────────── */
let 시험충전 = 0;
let 시험크레딧 = 0;
let 멈춘주문 = 0;
try {
  const { db } = await import("@/db/client");
  const { creditOrder, creditLedger, user } = await import("@/db/schema");

  /* 토스 시험 결제키는 tviva… 로 시작한다(라이브는 tgen_…). 그 표식으로 가른다. */
  const 시험건 = await db
    .select({
      건수: sql<number>`count(*)::int`,
      금액: sql<number>`coalesce(sum(${creditOrder.amountKrw}),0)::int`,
      크레딧: sql<number>`coalesce(sum(${creditOrder.credits}),0)::int`,
    })
    .from(creditOrder)
    .where(sql`${creditOrder.status} = 'paid' and (${creditOrder.paymentKey} ilike 'tviva%' or ${creditOrder.paymentKey} ilike 'test_%')`);
  시험충전 = 시험건[0]?.건수 ?? 0;
  시험크레딧 = 시험건[0]?.크레딧 ?? 0;
  const 시험금액 = 시험건[0]?.금액 ?? 0;

  재기(시험충전 === 0, `시험 열쇠로 «결제된» 충전 — ${시험충전}건`,
    시험충전 > 0
      ? `돈은 안 들어왔는데 ${돈(시험크레딧)}크레딧(=${돈(시험금액)}원어치)이 지급돼 있다`
      : undefined);

  const 멈춘 = await db
    .select({ 건수: sql<number>`count(*)::int` })
    .from(creditOrder)
    .where(sql`${creditOrder.status} = 'pending'`);
  멈춘주문 = 멈춘[0]?.건수 ?? 0;
  재기(멈춘주문 === 0, `결제창만 열고 만 주문(pending) — ${멈춘주문}건`,
    멈춘주문 > 0 ? "해롭지는 않지만, 라이브 주문과 섞이기 전에 지우면 셈이 깨끗하다" : undefined);

  /* 심사용 계정이 살아 있나 — REVIEW_MODE 를 꺼도 계정 자체는 남는다. */
  const 심사계정 = await db
    .select({ 메일: user.email })
    .from(user)
    .where(sql`${user.email} ilike '%review%' or ${user.email} ilike '%test%'`);
  재기(심사계정.length === 0, `심사용으로 보이는 계정 — ${심사계정.length}개`,
    심사계정.length > 0 ? 심사계정.map((r) => r.메일).join(", ") : undefined);

  /* 주인 말고 남에게 남아 있는 «유상» 크레딧 — 이게 라이브에서 오푸스를 태운다. */
  const 남 = await db
    .select({
      메일: user.email,
      잔액: sql<number>`coalesce(sum(${creditLedger.amount}),0)::int`,
      충전분: sql<number>`coalesce(sum(case when ${creditLedger.kind}='charge' then ${creditLedger.amount} else 0 end),0)::int`,
    })
    .from(creditLedger)
    .innerJoin(user, sql`${user.id} = ${creditLedger.userId}`)
    .groupBy(user.email)
    .having(sql`coalesce(sum(case when ${creditLedger.kind}='charge' then ${creditLedger.amount} else 0 end),0) > 0`);
  const 주인 = "hyun.planb@gmail.com";
  const 남의충전 = 남.filter((r) => (r.메일 ?? "").toLowerCase() !== 주인);
  재기(남의충전.length === 0, `주인 말고 «충전분»을 가진 사람 — ${남의충전.length}명`,
    남의충전.length > 0 ? 남의충전.map((r) => `${r.메일} ${돈(r.충전분)}`).join(", ") : undefined);

  const 주인것 = 남.find((r) => (r.메일 ?? "").toLowerCase() === 주인);
  if (주인것) {
    console.log(
      `\n  ℹ 주인(${주인}) 에게 충전분 ${돈(주인것.충전분)}크레딧 · 잔액 ${돈(주인것.잔액)}크레딧 이 있다.`,
    );
    console.log("    시험 열쇠로 받은 것이라 «돈이 안 들어온» 크레딧이다. 다만 주인은 원래");
    console.log("    다운로드가 공짜라(`isOwner`) 급하지 않다 — 지울지는 사장님이 정하실 일이다.");
  }
} catch (e) {
  재기(false, "DB 를 못 읽었다", e instanceof Error ? e.message : String(e));
}

/* ── 내놓기 ────────────────────────────────────────────────── */
console.log(`\n결제 전환 점검 — ${라이브기준 ? "라이브 기준" : "이 컴퓨터(.env.local) 기준"}\n`);
for (const r of 결과) {
  console.log(`  ${r.괜찮나 ? "✓" : "⛔"} ${r.글}`);
  if (r.덧말) console.log(`     ${r.덧말}`);
}

const 남은것 = 결과.filter((r) => !r.괜찮나).length;
if (남은것 === 0) {
  console.log("\n  ✓ 시험으로 남은 자리가 없습니다. 라이브입니다.\n");
  process.exit(0);
}

console.log(`\n  ⛔ ${남은것}군데가 아직 시험입니다.`);
if (!라이브기준) {
  console.log("\n  ⚠ 이 검사는 «이 컴퓨터»의 .env.local 만 봅니다.");
  console.log("     손님이 실제로 쓰는 것은 **Vercel 환경변수**입니다. 거기도 같이 보세요:");
  console.log("       vercel env ls");
  console.log("     Vercel 을 고친 뒤에는 반드시 **다시 배포**해야 값이 바뀝니다.\n");
}
process.exit(1);
