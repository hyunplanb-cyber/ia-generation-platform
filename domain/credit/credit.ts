// 크레딧(이용권) 도메인 모델. 충전형 지갑 — 구독 아님.
// 원장(ledger)에 지급/충전/사용/환불을 한 줄씩 쌓고, 잔액은 amount 합이다.

export type CreditKind = "free" | "charge" | "spend" | "refund";

export interface CreditEntry {
  id: string;
  userId: string;
  amount: number; // 양수 = 지급/충전, 음수 = 사용
  kind: CreditKind;
  memo: string;
  expiresAt: Date | null;
  meta: Record<string, unknown> | null;
  createdAt: Date;
}

export interface NewCreditEntry {
  userId: string;
  amount: number;
  kind: CreditKind;
  memo: string;
  expiresAt?: Date | null;
  meta?: Record<string, unknown> | null;
}
