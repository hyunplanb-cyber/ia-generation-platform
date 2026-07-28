import type { CreditEntry, CreditKind, NewCreditEntry } from "@/domain/credit/credit";

export interface CreditRepository {
  /** 잔액 = 원장 amount의 합. */
  balance(userId: string): Promise<number>;
  /** 원장에 한 줄 추가(지급/충전/사용/환불). */
  add(entry: NewCreditEntry): Promise<CreditEntry>;
  /** 최근 기록(내역 화면용). */
  list(userId: string, limit?: number): Promise<CreditEntry[]>;
  /** 해당 종류의 기록이 하나라도 있는지(무료 크레딧 중복 지급 방지용). */
  hasKind(userId: string, kind: CreditKind): Promise<boolean>;
}
