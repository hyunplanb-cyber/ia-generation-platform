// 랜딩용 — "스펙팩을 AI 코딩 툴에 넘기면 이런 사이트가 나온다"를 보여주는 브라우저 미리보기 목업.
// (실제 데모(반려동물 쇼핑몰)를 축소해 재현한 정적 미리보기)
const products = [
  { emoji: "🍚", name: "유기농 사료", price: "28,900원", bg: "bg-pastel-yellow" },
  { emoji: "🍪", name: "트릿 간식", price: "9,500원", bg: "bg-pastel-mint" },
  { emoji: "🧸", name: "라텍스 장난감", price: "7,200원", bg: "bg-pastel-lavender" },
  { emoji: "🧴", name: "저자극 샴푸", price: "14,000원", bg: "bg-primary-soft" },
];

export function BuildDemoMockup() {
  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
      {/* 브라우저 크롬 */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-danger/60" />
        <span className="size-2.5 rounded-full bg-warning/60" />
        <span className="size-2.5 rounded-full bg-success/60" />
        <span className="ml-2 rounded-full bg-background px-3 py-0.5 text-[11px] text-muted-foreground">
          멍냥마켓 · 반려동물 쇼핑몰
        </span>
      </div>

      {/* 사이트 헤더 */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-3">
        <span className="text-sm font-extrabold text-primary">🐾 멍냥마켓</span>
        <span className="ml-auto hidden gap-3 text-xs font-medium text-muted-foreground sm:flex">
          <span className="text-primary">홈</span>
          <span>상품</span>
          <span>장바구니</span>
          <span>마이페이지</span>
        </span>
      </div>

      {/* 히어로 */}
      <div className="flex items-center justify-between gap-3 bg-linear-to-br from-primary-soft to-pastel-mint px-5 py-6">
        <div>
          <span className="rounded-full bg-pastel-mint px-2 py-0.5 text-[10px] font-bold text-pastel-mint-foreground">
            신규 20% 쿠폰
          </span>
          <p className="mt-1.5 text-lg font-extrabold leading-tight text-foreground">
            우리 아이를 위한
            <br />
            모든 것 🐶🐱
          </p>
          <span className="mt-2 inline-block rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
            상품 보러가기 →
          </span>
        </div>
        <span className="text-4xl">🦴</span>
      </div>

      {/* 인기 상품 */}
      <div className="px-5 py-4">
        <p className="mb-2 text-xs font-bold text-foreground">🔥 인기 상품</p>
        <div className="grid grid-cols-4 gap-2">
          {products.map((p) => (
            <div key={p.name} className="overflow-hidden rounded-lg border border-border bg-background">
              <div className={`flex h-12 items-center justify-center text-2xl ${p.bg}`}>{p.emoji}</div>
              <div className="px-1.5 py-1.5">
                <p className="truncate text-[10px] font-medium text-foreground">{p.name}</p>
                <p className="text-[10px] font-bold text-primary">{p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
