// 산출물 소개 페이지용 — 각 산출물의 "샘플 화면" 미니 목업(정적, 레트로모던).
import { ArrowRight, Check, X, Lock } from "lucide-react";
import { DESIGN_OPTIONS, colorsFor, type DesignKey } from "@/lib/design-presets";
import { 재는것들 } from "@/lib/export/검수안내서";

/* 「브라우저 창」 흉내 — 점 세 개가 달린 상자. (사이트 검수 탭에서만 쓴다)
   ⚠ AI팩 탭에서는 걷어 냈다 (2026-08-25 사장님 지시: 「상자로 넣어 둔거 다 빼고」).
     거긴 벤토 칸 «안»에 들어가는데, 연한 패널 안에 또 창틀이 들어가면 테두리가 두 겹이 된다. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-danger/50" />
        <span className="size-2.5 rounded-full bg-warning/50" />
        <span className="size-2.5 rounded-full bg-success/50" />
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* 벤토 칸 안에 뜨는 «흰 종이». 창틀도 점도 없다 — 알맹이만 보이게 한다. */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-surface p-4 shadow-[0_10px_30px_-12px_rgba(31,32,36,0.18)] sm:p-5">
      {children}
    </div>
  );
}

export function MenuTreeMockup() {
  return (
    <Card>
      <div className="flex flex-col items-center gap-2 py-2 text-xs">
        <span className="rounded-md border border-border bg-muted px-4 py-1.5 font-bold">사이트 전체</span>
        <div className="h-3 w-px bg-border" />
        <div className="flex items-start gap-6">
          {[
            { name: "홈", screens: ["메인 홈"] },
            { name: "상품", screens: ["상품 목록", "상품 상세"] },
            { name: "마이", screens: ["로그인", "마이페이지"] },
          ].map((m) => (
            <div key={m.name} className="flex flex-col items-center gap-2">
              <span className="whitespace-nowrap rounded-md bg-primary px-3 py-1.5 font-semibold text-primary-foreground">
                {m.name}
              </span>
              <div className="h-2 w-px bg-border" />
              <div className="flex flex-col items-center gap-1.5">
                {m.screens.map((s) => (
                  <span key={s} className="rounded-md border border-border bg-background px-2.5 py-1 text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function ScreenListMockup() {
  const rows = [
    { id: "PCHOME0110", name: "메인 홈", tone: "bg-pastel-mint text-pastel-mint-foreground", t: "콘텐츠" },
    { id: "PCPROD0110", name: "상품 목록", tone: "bg-muted text-muted-foreground", t: "화면" },
    { id: "PCPROD0210", name: "상품 상세", tone: "bg-primary-soft text-primary-on-soft", t: "기능" },
  ];
  return (
    <Card>
      <div className="text-xs">
        <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 border-b border-border pb-1.5 font-semibold text-muted-foreground">
          <span>화면ID</span>
          <span>화면명</span>
          <span>유형</span>
        </div>
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 border-b border-border/60 py-2">
            <span className="font-mono text-[11px] text-muted-foreground">{r.id}</span>
            <span className="font-medium">{r.name}</span>
            <span className={`justify-self-end rounded-full px-2 py-0.5 text-[10px] font-medium ${r.tone}`}>{r.t}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function SpecMockup() {
  const rows = [
    { id: "01-01-01", work: "상품", fn: "상품 목록", item: "3열 그리드 표시", tone: "bg-muted text-muted-foreground", t: "화면" },
    { id: "01-01-02", work: "", fn: "", item: "카테고리 필터", tone: "bg-muted text-muted-foreground", t: "화면" },
    { id: "02-01-01", work: "회원", fn: "로그인", item: "약관 동의", tone: "bg-warning-soft text-warning", t: "정책" },
  ];
  return (
    <Card>
      <div className="text-[11px]">
        <div className="grid grid-cols-[auto_auto_auto_1fr_auto] gap-x-2 border-b border-border pb-1.5 font-semibold text-muted-foreground">
          <span>ID</span>
          <span>업무</span>
          <span>기능</span>
          <span>구성</span>
          <span>유형</span>
        </div>
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-[auto_auto_auto_1fr_auto] items-center gap-x-2 border-b border-border/60 py-1.5">
            <span className="font-mono text-muted-foreground">{r.id}</span>
            <span className="font-semibold">{r.work}</span>
            <span>{r.fn}</span>
            <span className="text-foreground">{r.item}</span>
            <span className={`justify-self-end rounded-full px-1.5 py-0.5 text-[10px] font-medium ${r.tone}`}>{r.t}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function FlowMockup() {
  const nodes = ["메인 홈", "상품 목록", "상품 상세", "장바구니"];
  return (
    <Card>
      <div className="flex items-center justify-center gap-1.5 py-4 text-[11px]">
        {nodes.map((n, i) => (
          <div key={n} className="flex items-center gap-1.5">
            <span
              className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-center ${
                i === 0 ? "bg-primary font-semibold text-primary-foreground" : "border border-border bg-background"
              }`}
            >
              {n}
            </span>
            {i < nodes.length - 1 && <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/60" />}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function WbsMockup() {
  const rows = [
    { name: "메인 홈", start: 0, len: 3 },
    { name: "상품 목록", start: 2, len: 4 },
    { name: "상품 상세", start: 5, len: 3 },
  ];
  return (
    <Card>
      <div className="flex flex-col gap-2 text-[11px]">
        {rows.map((r) => (
          <div key={r.name} className="grid grid-cols-[70px_1fr] items-center gap-2">
            <span className="truncate font-medium">{r.name}</span>
            <div className="relative h-4 rounded bg-muted/60">
              <div
                className="absolute top-0 h-4 rounded bg-primary/70"
                style={{ left: `${r.start * 11}%`, width: `${r.len * 11}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function VerifyScenarioMockup() {
  const checks = [
    { label: "접속·HTTPS", ok: true },
    { label: "모바일 대응", ok: true },
    { label: "이미지 깨짐", ok: false },
  ];
  const scenarios = [
    { name: "로그인", sensitive: true, step: "아이디·비밀번호로 로그인이 되는지" },
    { name: "결제", sensitive: true, step: "카드 결제가 끝까지 완료되는지" },
  ];
  return (
    <Frame>
      <div className="flex flex-col gap-3 text-[11px]">
        {/* 자동 검사 */}
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-success-soft px-2 py-0.5 font-semibold text-success">통과 6</span>
          <span className="rounded-full bg-danger-soft px-2 py-0.5 font-semibold text-danger">실패 1</span>
        </div>
        <div className="flex flex-col gap-1">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-1.5">
              {c.ok ? (
                <Check className="size-3 text-success" />
              ) : (
                <X className="size-3 text-danger" />
              )}
              <span className={c.ok ? "text-muted-foreground" : "font-medium text-foreground"}>
                {c.label}
              </span>
            </div>
          ))}
        </div>
        {/* 직접 확인 시나리오 */}
        <div className="border-t border-border/60 pt-2">
          <p className="mb-1.5 font-semibold text-muted-foreground">직접 확인할 것</p>
          <div className="flex flex-col gap-1.5">
            {scenarios.map((s) => (
              <div key={s.name} className="flex items-start gap-1.5">
                {s.sensitive && <Lock className="mt-0.5 size-3 shrink-0 text-warning" />}
                <span>
                  <span className="font-medium text-foreground">{s.name}</span>
                  <span className="text-muted-foreground"> · {s.step}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function SpecPackMockup() {
  return (
    <Card>
      <pre className="overflow-x-auto rounded-lg bg-foreground/90 p-3 text-[10px] leading-relaxed text-background">
        <code>{`# 반려동물 쇼핑몰 — AI 빌드 스펙팩

## 화면별 스펙
### PCPROD0110 · 상품 목록
- 버튼 → 이동화면:
  - \`상품 선택\` → \`PCPROD0210\`
- 생성 프롬프트:
  좌측 필터, 우측 3열 상품 그리드...`}</code>
      </pre>
    </Card>
  );
}

/* 자동 검수 — 팩이 «스스로 재는» 열 가지.
   ⚠ 값을 지어내지 않는다. lib/export/검수안내서.ts 의 재는것들 을 그대로 쓴다.
     손님이 받는 11_내사이트_검수하는_법.html 과 «같은 목록»이라야 한다 —
     홍보에 적은 것과 실제로 재는 것이 다르면 그게 제일 나쁘다. */
export function SelfCheckMockup() {
  return (
    <Card>
      <ul className="space-y-1.5">
        {재는것들.map((x) => (
          <li key={x.무엇} className="flex items-start gap-2 text-xs leading-relaxed">
            <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
            <span className="[word-break:keep-all]">{x.무엇}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* 디자인 프리셋 — 색·글꼴이 한 벌로 묶여 있다는 것을 색 띠로 보여 준다.
   ⚠ 값을 지어내지 않는다. lib/design-presets.ts 의 실제 세 벌을 «읽어서» 쓴다.
     2026-08-14 에는 손으로 적어 두었는데, 2026-08-20 에 포인트 색을 진하게 하면서
     그대로 갈렸다 — 손님 화면은 코럴을 #F0654F 로 보여 주는데 팩은 #E02A0E 를 담고 있었다.
     **손으로 적으면 반드시 갈라진다.** 뿌리에서 읽으면 다시는 안 갈린다. */
export function PresetColorMockup() {
  const 고를것: { key: DesignKey; 번호: string }[] = [
    { key: "coral", 번호: "01" },
    { key: "navy", 번호: "02" },
    { key: "mono", 번호: "03" },
  ];
  const 벌 = 고를것.map(({ key, 번호 }) => {
    const o = DESIGN_OPTIONS.find((x: (typeof DESIGN_OPTIONS)[number]) => x.key === key)!;
    const 바탕 =
      Object.entries(colorsFor(key)).find(([k]) => k.replace(/ /g, "").includes("background("))?.[1] ??
      "#F0EFEB";
    return { 이름: `${번호} ${o.title}`, 색: [o.primary, o.accent, 바탕, o.ink] };
  });
  return (
    <Card>
      <div className="flex flex-col gap-3">
        {벌.map((b) => (
          <div key={b.이름} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-[11px] font-semibold text-foreground">{b.이름}</span>
            <div className="flex gap-1.5">
              {b.색.map((c) => (
                <span
                  key={c}
                  className="size-6 rounded-md border border-border"
                  style={{ background: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        ))}
        <p className="mt-1 text-[11px] text-muted-foreground">
          색 · 글꼴 · 모서리 · 그림자까지 한 벌로 묶여 있어요
        </p>
      </div>
    </Card>
  );
}

/* 레이아웃 프리셋 — 「무엇을 어디에」를 선 그림으로. 두 벌이 어떻게 다른지가 핵심이다. */
export function PresetLayoutMockup() {
  const 뼈대 = [
    { 이름: "A 사진 중심형", 줄: ["hero-big", "grid-3", "grid-3"] },
    { 이름: "B 여백 중심형", 줄: ["hero-slim", "row", "row"] },
  ];
  return (
    <Card>
      <div className="grid grid-cols-2 gap-3">
        {뼈대.map((t) => (
          <div key={t.이름}>
            <p className="mb-2 text-[11px] font-semibold text-foreground">{t.이름}</p>
            <div className="flex flex-col gap-1 rounded-md border border-border p-2">
              {t.줄.map((k, i) => (
                <div key={i} className={k === "grid-3" ? "flex gap-1" : ""}>
                  {k === "hero-big" && <div className="h-8 rounded bg-primary-soft" />}
                  {k === "hero-slim" && <div className="h-3 w-2/3 rounded bg-primary-soft" />}
                  {k === "grid-3" &&
                    [0, 1, 2].map((n) => <div key={n} className="h-5 flex-1 rounded bg-muted" />)}
                  {k === "row" && <div className="h-4 rounded bg-muted" />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
