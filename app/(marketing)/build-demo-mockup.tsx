// 랜딩용 — "스펙팩을 AI 코딩 툴에 넘기면 이런 사이트가 나온다"를 보여주는 브라우저 미리보기 목업.
// 실제 데모 사이트(포포펫 · 반려동물 쇼핑몰)의 메인 화면을 축소해 재현한다.
// (생성된 사이트의 자체 브랜드 색을 살리려 인라인 색상 사용 — 플랫폼 토큰과 별개)
const CATS = ["사료", "간식", "장난감", "배변용품", "미용·위생", "의류·용품"];

const PRODUCTS = [
  { emoji: "🐟", name: "리얼 연어 유기농 사료", brand: "포포내추럴", price: "32,900원", disc: "16%", grad: "linear-gradient(135deg,#FFB37A,#FF7A45)", tag: "베스트" },
  { emoji: "🍗", name: "동결건조 닭가슴살 트릿", brand: "댕댕키친", price: "12,900원", disc: "14%", grad: "linear-gradient(135deg,#FFD36E,#FF9F1C)", tag: "인기" },
  { emoji: "🦴", name: "치석케어 덴탈껌 30p", brand: "댕댕키친", price: "16,900원", disc: null, grad: "linear-gradient(135deg,#C9E86B,#8AC926)", tag: "베스트" },
  { emoji: "🧩", name: "노즈워크 스니핑 담요", brand: "플레이펫", price: "22,900원", disc: "18%", grad: "linear-gradient(135deg,#9AD0FF,#3A86FF)", tag: "인기" },
];

const CORAL = "#FF7A45";

export function BuildDemoMockup() {
  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
      {/* 브라우저 크롬 */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-danger/60" />
        <span className="size-2.5 rounded-full bg-warning/60" />
        <span className="size-2.5 rounded-full bg-success/60" />
        <span className="ml-2 rounded-full bg-white px-3 py-0.5 text-[11px] text-muted-foreground">
          포포펫 · 반려동물 쇼핑몰
        </span>
      </div>

      {/* 사이트 헤더 */}
      <div className="flex items-center gap-3 border-b border-[#ECE9E4] px-5 py-2.5">
        <span className="text-sm font-black" style={{ color: CORAL }}>
          🐾 포포펫
        </span>
        <span className="hidden flex-1 rounded-lg bg-[#F3F0EB] px-3 py-1 text-[11px] text-[#8A92A3] sm:block">
          🔍 사료, 간식, 장난감 검색
        </span>
        <span className="ml-auto flex gap-2 text-[11px] font-semibold text-[#5A6272] sm:ml-0">
          <span>🤍</span>
          <span>🛒</span>
          <span>👤</span>
        </span>
      </div>

      {/* 카테고리 바 */}
      <div className="flex gap-1 overflow-hidden border-b border-[#ECE9E4] px-5 py-1.5">
        <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold text-white" style={{ background: CORAL }}>
          전체
        </span>
        {CATS.map((c) => (
          <span key={c} className="whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium text-[#5A6272]">
            {c}
          </span>
        ))}
      </div>

      {/* 히어로 */}
      <div className="m-4 flex items-center justify-between gap-3 rounded-2xl px-5 py-5" style={{ background: "linear-gradient(120deg,#FFF1EA,#FDE8DE)" }}>
        <div>
          <p className="text-base font-black leading-tight text-[#1F2430]">
            우리 아이를 위한
            <br />
            모든 것, 포포펫 🐾
          </p>
          <p className="mt-1 text-[11px] text-[#5A6272]">사료부터 장난감까지 한 곳에서.</p>
          <span className="mt-2 inline-block rounded-lg px-3 py-1 text-[11px] font-bold text-white" style={{ background: CORAL }}>
            쇼핑 시작하기
          </span>
        </div>
        <span className="text-5xl leading-none">🐶🐱</span>
      </div>

      {/* 인기 상품 */}
      <div className="px-5 pb-5">
        <p className="mb-2 text-xs font-black text-[#1F2430]">🔥 지금 인기 상품</p>
        <div className="grid grid-cols-4 gap-2">
          {PRODUCTS.map((p) => (
            <div key={p.name} className="overflow-hidden rounded-xl border border-[#ECE9E4] bg-white">
              <div className="relative flex h-14 items-center justify-center text-2xl" style={{ background: p.grad }}>
                <span className="absolute left-1 top-1 rounded bg-white/90 px-1 text-[8px] font-bold" style={{ color: CORAL }}>
                  {p.tag}
                </span>
                {p.emoji}
              </div>
              <div className="px-1.5 py-1.5">
                <p className="text-[8px] text-[#8A92A3]">{p.brand}</p>
                <p className="line-clamp-1 text-[10px] font-semibold text-[#1F2430]">{p.name}</p>
                <p className="flex items-center gap-1 text-[10px] font-black text-[#1F2430]">
                  {p.disc && <span style={{ color: CORAL }}>{p.disc}</span>}
                  {p.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
