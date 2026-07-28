// 토스페이먼츠 결제 승인(서버 전용). 시크릿 키로 Basic 인증해 최종 승인한다.
// 결제창에서 성공 리다이렉트를 받은 뒤, 반드시 이 승인까지 성공해야 결제가 완료된다.

const CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

export type TossConfirmResult =
  | { ok: true; status: string; method: string | null }
  | { ok: false; code: string; message: string };

export async function confirmTossPayment(
  paymentKey: string,
  orderId: string,
  amount: number,
): Promise<TossConfirmResult> {
  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret) {
    return { ok: false, code: "NO_SECRET", message: "결제 설정(TOSS_SECRET_KEY)이 없어요." };
  }
  // Basic 인증: base64("{시크릿키}:") — 비밀번호는 비운다.
  const auth = Buffer.from(`${secret}:`).toString("base64");

  let res: Response;
  try {
    res = await fetch(CONFIRM_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
  } catch {
    return { ok: false, code: "NETWORK", message: "결제 승인 서버에 연결하지 못했어요." };
  }

  const data = (await res.json().catch(() => ({}))) as {
    status?: string;
    method?: string;
    code?: string;
    message?: string;
  };

  if (!res.ok) {
    return {
      ok: false,
      code: data.code ?? "CONFIRM_FAILED",
      message: data.message ?? "결제 승인에 실패했어요.",
    };
  }
  return { ok: true, status: data.status ?? "UNKNOWN", method: data.method ?? null };
}
