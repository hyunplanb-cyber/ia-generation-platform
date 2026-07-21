// 공개 샘플별 외부 판매 링크.
// 자체 결제(PG)가 붙기 전까지는 크몽 상품 페이지로 보내 결제를 처리한다.
// (우리 사이트 → 크몽 방향은 마켓 정책상 문제 없다. 반대 방향이 금지 대상.)
// 승인/등록이 끝나면 URL만 채우면 구매 버튼이 자동으로 나타난다. null이면 숨김.
export const SAMPLE_PURCHASE: Record<string, { kmongUrl: string | null }> = {
  lms: { kmongUrl: null }, // 크몽 승인 대기 중 — 승인 후 https://kmong.com/gig/XXXXXX 로 교체
};

export function getPurchaseUrl(sampleId: string): string | null {
  return SAMPLE_PURCHASE[sampleId]?.kmongUrl ?? null;
}
