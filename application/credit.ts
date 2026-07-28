import { requireSession } from "@/application/require-session";
import { drizzleCreditRepository as repo } from "@/adapters/repository/drizzle/credit-repository";
import { FREE_CREDITS, FREE_TTL_DAYS, PAID_TTL_DAYS } from "@/lib/credits";
import type { CreditEntry } from "@/domain/credit/credit";

// 가입 무료 크레딧을 한 번만 지급한다(원장에 free 기록이 없으면).
// 별도 훅 없이, 잔액/소모 조회 시 지연 지급으로 처리한다.
export async function ensureFreeCredits(userId: string): Promise<void> {
  if (await repo.hasKind(userId, "free")) return;
  const expiresAt = new Date(Date.now() + FREE_TTL_DAYS * 86_400_000);
  await repo.add({
    userId,
    amount: FREE_CREDITS,
    kind: "free",
    memo: "가입 무료 크레딧",
    expiresAt,
  });
}

// 현재 로그인 사용자의 크레딧 잔액.
export async function getCreditBalance(): Promise<number> {
  const session = await requireSession();
  await ensureFreeCredits(session.user.id);
  return repo.balance(session.user.id);
}

// 최근 크레딧 내역(내역 화면용).
export async function listCredits(limit = 50): Promise<CreditEntry[]> {
  const session = await requireSession();
  return repo.list(session.user.id, limit);
}

export type SpendResult =
  | { ok: true; balance: number }
  | { ok: false; reason: "insufficient"; balance: number };

// 크레딧을 사용한다(생성·검수·다운로드 차감). 잔액이 모자라면 실패.
// (Neon HTTP는 트랜잭션이 없어 read→insert 사이 경합 가능하나, 저빈도라 허용.)
export async function spendCredits(
  amount: number,
  memo: string,
  meta?: Record<string, unknown>,
): Promise<SpendResult> {
  const session = await requireSession();
  await ensureFreeCredits(session.user.id);
  const balance = await repo.balance(session.user.id);
  if (balance < amount) return { ok: false, reason: "insufficient", balance };
  await repo.add({
    userId: session.user.id,
    amount: -Math.abs(amount),
    kind: "spend",
    memo,
    meta,
  });
  return { ok: true, balance: balance - amount };
}

// 결제 승인 후 유상 크레딧을 지급한다(서버에서 결제 검증 뒤 호출).
export async function chargeCredits(
  userId: string,
  credits: number,
  memo: string,
  meta?: Record<string, unknown>,
): Promise<void> {
  const expiresAt = new Date(Date.now() + PAID_TTL_DAYS * 86_400_000);
  await repo.add({ userId, amount: credits, kind: "charge", memo, expiresAt, meta });
}
