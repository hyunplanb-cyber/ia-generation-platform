"use client";

/* AI팩 목록의 «고르고 찾는» 층 — 2026-08-10.
 *
 * 왜 따로 두나
 *   목록 페이지는 서버 컴포넌트다. 거기서 팩 원본(PackageDef)을 그대로 넘기면
 *   화면 수백 개짜리 템플릿 데이터가 브라우저로 통째로 넘어간다.
 *   그래서 **카드에 필요한 만큼만** 미리 추려 내려보내고, 여기서는 그걸 거르기만 한다.
 *
 * 찾기를 제목만으로 하지 않는 까닭
 *   「미용실」로 찾으면 아무것도 안 나온다 — 팩 이름이 「뷰티샵 예약 플랫폼」이다.
 *   손님이 실제로 치는 말은 업종·소개·키워드에 흩어져 있어서 다 합쳐 둔다(searchText).
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";

export interface BrowseCard {
  key: string;
  pkgId: string;
  title: string;
  category: string;
  planId: string;
  planName: string;
  depthLabel: string;
  contents: string[];
  note: string;
  /** 값 — 크레딧 수. 값을 아직 안 내거는 동안은 null (홈과 같은 약속). */
  credits: number | null;
  saleOpen: boolean;
  hasSite: boolean;
  href: string;
  /** 찾기용 — 제목·업종·소개·키워드를 미리 합쳐 둔 것 */
  find: string;
}

export interface BrowseCategory {
  id: string;
  label: string;
  desc: string;
  count: number;
}

export function Browse({
  cards,
  categories,
}: {
  cards: BrowseCard[];
  categories: BrowseCategory[];
}) {
  const [고른갈래, set고른갈래] = useState<string | null>(null);
  const [찾는말, set찾는말] = useState("");

  const 보일것 = useMemo(() => {
    const q = 찾는말.trim().toLowerCase();
    return cards.filter(
      (c) => (!고른갈래 || c.category === 고른갈래) && (!q || c.find.includes(q)),
    );
  }, [cards, 고른갈래, 찾는말]);

  /* 갈래를 고르면 그 안에서 몇 개가 남는지 바로 보여 준다.
     찾는 말이 걸려 있으면 그 결과 안에서 센다 — 눌러 보고 0개면 손님이 헛걸음한다. */
  const 갈래별셈 = useMemo(() => {
    const q = 찾는말.trim().toLowerCase();
    const m = new Map<string, number>();
    for (const c of cards) {
      if (q && !c.find.includes(q)) continue;
      m.set(c.category, (m.get(c.category) ?? 0) + 1);
    }
    return m;
  }, [cards, 찾는말]);

  const 전체수 = useMemo(() => {
    const q = 찾는말.trim().toLowerCase();
    return q ? cards.filter((c) => c.find.includes(q)).length : cards.length;
  }, [cards, 찾는말]);

  return (
    <>
      {/* ── 찾기 ── */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={찾는말}
          onChange={(e) => set찾는말(e.target.value)}
          placeholder="만들려는 것을 적어 보세요 — 예) 미용실 예약, 공동구매, 강의"
          aria-label="AI팩 찾기"
          className="h-12 w-full rounded-xl border border-border bg-surface pl-11 pr-11 text-[15px] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        />
        {찾는말 && (
          <button
            type="button"
            onClick={() => set찾는말("")}
            aria-label="찾는 말 지우기"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* ── 갈래 고르기 ──
          비어 있는 갈래는 서버에서 이미 걸러 왔다(listedCategories).
          찾는 말 때문에 0개가 된 갈래는 여기서 흐리게 두고 못 누르게 한다. */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => set고른갈래(null)}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            고른갈래 === null
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-surface text-foreground hover:border-primary/50"
          }`}
        >
          전체 <span className="ml-1 opacity-70">{전체수}</span>
        </button>
        {categories.map((c) => {
          const n = 갈래별셈.get(c.id) ?? 0;
          const 켬 = 고른갈래 === c.id;
          return (
            <button
              key={c.id}
              type="button"
              disabled={n === 0}
              title={c.desc}
              onClick={() => set고른갈래(켬 ? null : c.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                켬
                  ? "border-primary bg-primary text-primary-foreground"
                  : n === 0
                    ? "cursor-not-allowed border-border/60 bg-muted/30 text-muted-foreground/60"
                    : "border-border bg-surface text-foreground hover:border-primary/50"
              }`}
            >
              {c.label} <span className="ml-1 opacity-70">{n}</span>
            </button>
          );
        })}
      </div>

      {/* 고른 갈래가 무엇을 뜻하는지 한 줄로. 이름만으로는 「중개·매칭」이 뭔지 모른다. */}
      {고른갈래 && (
        <p className="-mt-4 text-sm text-muted-foreground">
          {categories.find((c) => c.id === 고른갈래)?.desc}
        </p>
      )}

      {보일것.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
          <p className="text-lg font-bold text-foreground">
            「{찾는말}」에 맞는 AI팩이 없어요
          </p>
          <p className="max-w-md leading-relaxed text-muted-foreground">
            다른 말로 찾아 보시거나, 컨셉만 적어 <b>직접 만드실</b> 수 있어요.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                set찾는말("");
                set고른갈래(null);
              }}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/50"
            >
              전체 보기
            </button>
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              직접 만들기
            </Link>
          </div>
        </div>
      ) : (
        // 카드 생김새는 홈의 팩 카드(home-landing.tsx 의 .plan)와 같다. 같은 상품이 세
        // 화면에 나오는데 모양이 다르면 같은 것인지 헷갈린다(2026-08-26 사장님).
        // 치수·색은 app/globals.css 의 --pack-* 한 곳에서 온다.
        // ⚠ 이 화면에만 있는 것 둘은 남겼다 — 「완성 화면 있음」 표시(테두리)와 한 줄
        //   소개(note). 없애면 스물여덟 칸 중에서 고를 단서가 사라진다.
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {보일것.map((c) => (
            <Link
              key={c.key}
              href={c.href}
              data-들썩
              className={`group flex flex-col gap-4 rounded-[22px] bg-surface px-[26px] pt-[30px] pb-7 shadow-[0_10px_28px_rgba(25,23,19,0.06)] ${
                c.hasSite ? "ring-1 ring-primary/25" : ""
              }`}
            >
              <span
                className={`self-start whitespace-nowrap rounded-full px-[11px] py-[5px] text-[10px] tracking-[0.14em] ${
                  c.hasSite ? "bg-primary text-primary-foreground" : "bg-pack-tier-bg text-pack-tier"
                }`}
              >
                {c.planName}
              </span>
              <h2 className="-mt-2 text-[23px] font-semibold leading-[1.25] tracking-[-0.03em] text-pack-ink">
                {c.title}
              </h2>
              <p className="-mt-2.5 text-[13px] leading-[1.5] text-pack-sub">{c.depthLabel}</p>

              <p className="flex items-baseline gap-1.5 rounded-[14px] bg-pack-tint px-4 py-3.5 text-[12px] text-pack-sub">
                {c.credits === null ? (
                  "판매 준비 중"
                ) : (
                  <>
                    <b className="text-[32px] font-semibold leading-none text-pack-ink">
                      {c.credits.toLocaleString()}
                    </b>{" "}
                    크레딧
                  </>
                )}
              </p>
              {c.credits !== null && !c.saleOpen && (
                <p className="-mt-2.5 text-[12px] font-medium text-warning">판매 준비 중</p>
              )}

              <ul className="flex flex-wrap text-[13px] leading-[1.7] text-list-ink">
                {c.contents.map((x) => (
                  <li
                    key={x}
                    className="after:mx-[7px] after:text-list-dot after:content-['·'] last:after:hidden"
                  >
                    {x}
                  </li>
                ))}
              </ul>
              <p className="-mt-1 text-xs leading-relaxed text-muted-foreground">{c.note}</p>

              <span className="mt-auto inline-flex items-center gap-1 pt-[18px] text-[11px] tracking-[0.1em] text-pack-ink">
                자세히 보기
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
