/* 심사용 계정의 «충전 횟수와 충전 크레딧»을 처음으로 되돌린다. (2026-08-31)
 *
 * 왜 필요한가
 *   심사 기간에는 계정당 충전이 2회로 막혀 있다(REVIEW_MAX_CHARGES).
 *   그 횟수는 credit_order 에 status='paid' 로 남은 줄을 세어 정한다
 *   (application/charge.ts:31). 우리가 시험해 본 것도 그 횟수에 들어간다.
 *   심사관이 두 번을 온전히 써 볼 수 있게 비워 둔다.
 *
 * 무엇을 건드리나 — «충전으로 생긴 것»만.
 *   · credit_order   그 계정의 줄 (충전 횟수의 근거)
 *   · credit_ledger  kind='charge' 인 줄 (충전으로 받은 크레딧)
 *   가입 무료 크레딧(kind='free', 35)은 **그대로 둔다** — 새 계정과 같은 자리로 맞춘다.
 *
 * ⛔ 지우기 전에 지운 것을 파일로 떠 둔다. 결제 기록은 되살릴 방법이 없다.
 *
 *   npx tsx _심사계정초기화.mts                 # 보기만 한다
 *   npx tsx _심사계정초기화.mts --지운다        # 실제로 지운다
 */
import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { writeFileSync } from "node:fs";
config({ path: ".env.local" });
const { db } = await import("@/db/client");

const 메일 = "review@caffeinecolor.com";
const 진짜지운다 = process.argv.includes("--지운다");

const 줄들 = (r: unknown) =>
  ((r as { rows?: Record<string, unknown>[] }).rows ??
    (r as Record<string, unknown>[])) as Record<string, unknown>[];

/* ── 지금 상태 ─────────────────────────────────────────── */
const 사람 = 줄들(
  await db.execute(sql`select id, email from "user" where email = ${메일}`),
);
if (사람.length !== 1) {
  console.error(`\n⛔ ${메일} 계정을 찾지 못했습니다(${사람.length}개). 멈춥니다.\n`);
  process.exit(1);
}
const uid = String(사람[0].id);

const 주문 = 줄들(
  await db.execute(sql`
    select order_id, status, amount_krw, credits,
           to_char(created_at,'MM-DD HH24:MI') as 만든때,
           coalesce(payment_key,'(없음)') as 결제키
    from credit_order where user_id = ${uid} order by created_at`),
);
const 원장 = 줄들(
  await db.execute(sql`
    select kind, amount, memo, to_char(created_at,'MM-DD HH24:MI') as 때
    from credit_ledger where user_id = ${uid} order by created_at`),
);

const 낸것 = 주문.filter((o) => o.status === "paid").length;
const 충전분 = 원장.filter((l) => l.kind === "charge").reduce((s, l) => s + Number(l.amount), 0);
const 잔액 = 원장.reduce((s, l) => s + Number(l.amount), 0);

console.log(`\n심사용 계정 — ${메일}\n`);
console.log("── 충전 주문 ──");
if (주문.length === 0) console.log("  (없음)");
for (const o of 주문)
  console.log(`  ${o.만든때}  ${String(o.status).padEnd(8)} ${Number(o.amount_krw).toLocaleString()}원 → ${o.credits}크레딧  ${String(o.결제키).slice(0, 24)}`);
console.log(`\n  결제된 것 ${낸것}건 / 심사 기간 한도 2건`);

console.log("\n── 크레딧 원장 ──");
if (원장.length === 0) console.log("  (없음)");
for (const l of 원장)
  console.log(`  ${l.때}  ${String(l.kind).padEnd(7)} ${String(l.amount).padStart(6)}  ${l.memo}`);
console.log(`\n  잔액 ${잔액}크레딧 (그중 충전분 ${충전분})`);

/* ── 무엇이 바뀌나 ─────────────────────────────────────── */
console.log("\n── 되돌리면 ──");
console.log(`  주문 ${주문.length}건 → 0건        (충전 횟수 ${낸것} → 0, 두 번 다시 쓸 수 있다)`);
console.log(`  충전 크레딧 ${충전분} → 0`);
console.log(`  잔액 ${잔액} → ${잔액 - 충전분}   (가입 무료 크레딧은 그대로 둔다)`);

if (!진짜지운다) {
  console.log("\n  · 아직 아무것도 지우지 않았습니다.");
  console.log("    정말 되돌리려면:  npx tsx _심사계정초기화.mts --지운다\n");
  process.exit(0);
}

/* ── 떠 두고 지운다 ────────────────────────────────────── */
const 뜬것 = `판매용_템플릿/_마케팅/_백업/심사계정_초기화전_20260831.json`;
writeFileSync(뜬것, JSON.stringify({ 메일, uid, 주문, 원장 }, null, 2), "utf8");
console.log(`\n  ✓ 지우기 전 상태를 떠 뒀습니다 — ${뜬것}`);

await db.execute(sql`delete from credit_ledger where user_id = ${uid} and kind = 'charge'`);
await db.execute(sql`delete from credit_order  where user_id = ${uid}`);

/* ── 다시 재기 ─────────────────────────────────────────── */
const 뒤주문 = 줄들(await db.execute(sql`select count(*)::int as n from credit_order where user_id = ${uid}`));
const 뒤원장 = 줄들(await db.execute(sql`select coalesce(sum(amount),0)::int as n from credit_ledger where user_id = ${uid}`));
console.log(`  ✓ 주문 ${뒤주문[0].n}건 · 잔액 ${뒤원장[0].n}크레딧\n`);
process.exit(0);
