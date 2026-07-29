"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, Loader2, Palette, Sparkles } from "lucide-react";
import {
  DESIGN_OPTIONS,
  FONT_FEELS,
  RADIUS_FEELS,
  DENSITIES,
  primarySwatchesFor,
  buildDetailedPresetMarkdown,
  buildPresetSummary,
  type PresetConfig,
  type DesignKey,
  type FontFeel,
  type RadiusFeel,
  type Density,
} from "@/lib/design-presets";
import { generatePresetAction, downloadPresetAction } from "./actions";

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export function PresetForm({
  projectId,
  projectName,
  initial,
  creditsOpen,
  genCost,
  downloadCost,
  generated,
  downloaded,
}: {
  projectId: string;
  projectName: string;
  initial: PresetConfig;
  creditsOpen: boolean;
  genCost: number;
  downloadCost: number;
  generated: boolean;
  downloaded: boolean;
}) {
  const router = useRouter();
  const [cfg, setCfg] = useState<PresetConfig>(initial);
  const [busy, setBusy] = useState<"gen" | "save" | "download" | null>(null);
  const [gen, setGen] = useState(generated);
  const [down, setDown] = useState(downloaded);
  const [savedTick, setSavedTick] = useState(false);

  const set = <K extends keyof PresetConfig>(key: K, value: PresetConfig[K]) => {
    setCfg((c) => ({ ...c, [key]: value }));
    setSavedTick(false);
  };
  const changeStyle = (style: DesignKey) => {
    setCfg((c) => ({ ...c, style, primary: primarySwatchesFor(style)[0] }));
    setSavedTick(false);
  };

  const swatches = useMemo(() => primarySwatchesFor(cfg.style), [cfg.style]);
  const rad = useMemo(() => RADIUS_FEELS.find((r) => r.key === cfg.radius)!, [cfg.radius]);
  const font = useMemo(() => FONT_FEELS.find((f) => f.key === cfg.font)!, [cfg.font]);
  const den = useMemo(() => DENSITIES.find((d) => d.key === cfg.density)!, [cfg.density]);
  const sum = useMemo(() => buildPresetSummary(cfg), [cfg]);
  const pv = { bg: sum.bg, text: sum.text, muted: sum.muted, border: sum.border };

  const willChargeGen = creditsOpen && !gen;
  const willChargeDownload = creditsOpen && !down;

  function safeName(s: string) {
    return (s || "프로젝트").trim().slice(0, 20).replace(/[\\/:*?"<>|]/g, "_");
  }

  async function persist() {
    // 현재 설정 저장(첫 생성이면 4크레딧, 이후 무료). 부족하면 결과로 알림.
    return generatePresetAction(projectId, cfg);
  }

  async function handleGenerate(kind: "gen" | "save") {
    setBusy(kind);
    try {
      const r = await persist();
      if (!r.ok) {
        setBusy(null);
        if (r.reason === "insufficient" && window.confirm("크레딧이 부족해요. 충전 페이지로 갈까요?")) {
          router.push("/dashboard/billing");
        }
        return;
      }
      setGen(true);
      setSavedTick(kind === "save");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function handleDownload() {
    setBusy("download");
    try {
      // 편집 내용을 먼저 저장(무료, 이미 생성됨)한 뒤 다운로드 결제.
      await persist();
      const r = await downloadPresetAction(projectId);
      if (!r.ok) {
        setBusy(null);
        if (r.reason === "insufficient" && window.confirm("크레딧이 부족해요. 충전 페이지로 갈까요?")) {
          router.push("/dashboard/billing");
        }
        return;
      }
      if (r.charged) setDown(true);

      const md = buildDetailedPresetMarkdown(cfg, projectName);
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `디자인시스템_${safeName(projectName)}.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  // ── 설정 컨트롤(생성 전 화면 + 생성 후 "설정 수정"에서 공용) ──
  const controls = (
    <div className="flex flex-col gap-7">
      <Section title="큰 방향" hint="브리프에서 고른 컨셉이 기본으로 잡혀 있어요. 방향에 맞는 색이 아래에 나와요.">
        <div className="grid gap-2 sm:grid-cols-3">
          {DESIGN_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => changeStyle(opt.key)}
              className={`flex flex-col gap-2 rounded-xl border p-3 text-left transition-colors ${
                cfg.style === opt.key ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
              }`}
            >
              <div className="flex gap-1">
                {opt.swatches.map((s, i) => (
                  <span key={i} className="size-4 rounded-full ring-1 ring-black/5" style={{ backgroundColor: s }} />
                ))}
              </div>
              <span className="text-sm font-bold text-foreground">{opt.title}</span>
              <span className="text-xs text-muted-foreground">{opt.desc}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="주 색상" hint="고른 큰 방향에 어울리는 색이에요. 버튼·강조에 쓰입니다.">
        <div className="flex flex-wrap gap-2">
          {swatches.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => set("primary", hex)}
              aria-label={hex}
              className={`size-9 rounded-full transition-transform hover:scale-110 ${
                cfg.primary.toUpperCase() === hex.toUpperCase()
                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : "ring-1 ring-black/10"
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
          <label className="flex items-center gap-2 rounded-full border border-border px-3 text-xs text-muted-foreground">
            직접
            <input
              type="color"
              value={cfg.primary}
              onChange={(e) => set("primary", e.target.value.toUpperCase())}
              className="size-6 cursor-pointer rounded-full border-0 bg-transparent p-0"
            />
          </label>
        </div>
      </Section>

      <Section title="글꼴 느낌">
        <div className="flex flex-wrap gap-2">
          {FONT_FEELS.map((f) => (
            <Choice key={f.key} active={cfg.font === f.key} onClick={() => set("font", f.key as FontFeel)}>
              {f.label}
            </Choice>
          ))}
        </div>
      </Section>

      <Section title="모서리">
        <div className="flex flex-wrap gap-2">
          {RADIUS_FEELS.map((r) => (
            <Choice key={r.key} active={cfg.radius === r.key} onClick={() => set("radius", r.key as RadiusFeel)}>
              {r.label}
            </Choice>
          ))}
        </div>
      </Section>

      <Section title="밀도" hint="여백을 넉넉하게 둘지, 촘촘하게 둘지.">
        <div className="flex flex-wrap gap-2">
          {DENSITIES.map((d) => (
            <Choice key={d.key} active={cfg.density === d.key} onClick={() => set("density", d.key as Density)}>
              {d.label}
            </Choice>
          ))}
        </div>
      </Section>

      <Section title="다크 모드">
        <div className="flex flex-wrap gap-2">
          <Choice active={!cfg.dark} onClick={() => set("dark", false)}>
            라이트
          </Choice>
          <Choice active={cfg.dark} onClick={() => set("dark", true)}>
            다크
          </Choice>
        </div>
      </Section>
    </div>
  );

  // ── 미리보기 카드(생성 전) ──
  const preview = (
    <div
      className="flex flex-col gap-3 border"
      style={{
        background: pv.bg,
        borderColor: pv.border,
        borderRadius: rad.card,
        fontFamily: font.family,
        padding: den.key === "cozy" ? "20px" : "14px",
      }}
    >
      <div className="flex items-center justify-between" style={{ color: pv.text }}>
        <strong style={{ fontSize: 15 }}>화면 제목</strong>
        <span
          style={{
            background: cfg.primary + "1A",
            color: cfg.primary,
            borderRadius: rad.badge,
            fontSize: 11,
            padding: "2px 8px",
            fontWeight: 700,
          }}
        >
          배지
        </span>
      </div>
      <p style={{ color: pv.muted, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
        고른 색과 모서리가 이렇게 적용돼요. 생성하면 색 단계·타이포·컴포넌트 규칙 요약이 나와요.
      </p>
      <div className="flex gap-2">
        <span style={{ background: cfg.primary, color: "#fff", borderRadius: rad.button, fontSize: 13, fontWeight: 600, padding: "8px 14px" }}>
          주요 버튼
        </span>
        <span style={{ background: "transparent", color: pv.text, border: `1px solid ${pv.border}`, borderRadius: rad.button, fontSize: 13, fontWeight: 600, padding: "8px 14px" }}>
          보조
        </span>
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Palette className="size-6 text-primary" /> 디자인 프리셋
        </h1>
        <p className="text-sm text-muted-foreground">
          컨셉은 큰 방향이고, 여기서 색·글꼴·모서리·밀도를 직접 골라 <b className="text-foreground">개발에 바로 쓰는
          디자인 시스템</b>을 만들어요. 미리보기는 무료예요.
        </p>
      </div>

      {!gen ? (
        // ── 생성 전 ──
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          {controls}
          <div className="lg:sticky lg:top-6 lg:h-fit">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">미리보기</p>
            {preview}
            <button
              type="button"
              onClick={() => handleGenerate("gen")}
              disabled={!!busy}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy === "gen" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {busy === "gen" ? "생성 중" : willChargeGen ? `프리셋 생성 · ${genCost}크레딧` : "프리셋 생성"}
            </button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {willChargeGen ? (
                <>생성에 <b className="text-foreground">{genCost}크레딧</b>이 들어요. 다운로드(md)는 이후 별도예요.</>
              ) : (
                <>생성은 무료예요.</>
              )}
            </p>
          </div>
        </div>
      ) : (
        // ── 생성 후: (왼쪽) 요약 + 수정 / (오른쪽) 다운로드 ──
        <div className="grid gap-6 lg:grid-cols-[1fr_19rem]">
          <div className="flex min-w-0 flex-col gap-6">
            <PresetSummaryView sum={sum} rad={rad} />

            <details className="rounded-xl border border-border">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-foreground">
                설정 수정 <span className="font-normal text-muted-foreground">(무료 · 색·글꼴 등)</span>
              </summary>
              <div className="border-t border-border px-4 py-5">
                {controls}
                <button
                  type="button"
                  onClick={() => handleGenerate("save")}
                  disabled={!!busy}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg border border-primary bg-transparent px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
                >
                  {busy === "save" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : savedTick ? (
                    <Check className="size-4" />
                  ) : null}
                  {busy === "save" ? "저장 중" : savedTick ? "저장됨" : "변경 저장"}
                </button>
              </div>
            </details>
          </div>

          <div className="lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-xl border border-primary/30 bg-primary-soft/20 p-5">
              <p className="text-sm font-bold text-foreground">디자인 시스템 문서(.md) 다운로드</p>
              <p className="mt-1 text-xs text-muted-foreground">
                위 내용을 파일로 받아 AI 코딩 도구에 넣으면 이 디자인대로 만들어져요.
              </p>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!!busy}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {busy === "download" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                {busy === "download"
                  ? "준비 중"
                  : willChargeDownload
                    ? `프리셋 다운로드 · ${downloadCost}크레딧`
                    : "프리셋 다운로드"}
              </button>
              <p className="mt-2 text-xs text-muted-foreground">
                {willChargeDownload ? (
                  <>받을 때 <b className="text-foreground">{downloadCost}크레딧</b>이 들어요. 한 번 받으면 다시 받기는 무료예요.</>
                ) : (
                  <>이미 결제해서 <b className="text-foreground">다시 받기는 무료</b>예요.</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 생성 완료 요약 — 색 팔레트·타이포·모서리·컴포넌트를 카드로 보여준다.
function PresetSummaryView({
  sum,
  rad,
}: {
  sum: ReturnType<typeof buildPresetSummary>;
  rad: { card: string; button: string; badge: string };
}) {
  const swatch = (label: string, hex: string) => (
    <div key={label} className="flex items-center gap-2">
      <span className="size-6 shrink-0 rounded-md ring-1 ring-black/10" style={{ backgroundColor: hex }} />
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium text-foreground">{label}</span>
        <span className="block font-mono text-[11px] text-muted-foreground">{hex}</span>
      </span>
    </div>
  );
  return (
    <section className="rounded-2xl border-2 border-primary/25 bg-background p-5">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="size-5 text-primary" />
        <h2 className="text-base font-extrabold text-foreground">생성된 디자인 시스템</h2>
        <span className="ml-auto rounded-md bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary-on-soft">
          {sum.baseName} · {sum.fontLabel} · {sum.dark ? "다크" : "라이트"}
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold text-muted-foreground">색 팔레트</p>
          <div className="grid grid-cols-2 gap-2.5">
            {sum.palette.map(([k, v]) => swatch(k, v))}
            {swatch("background", sum.bg)}
            {swatch("surface", sum.surface)}
            {swatch("text", sum.text)}
            {swatch("border", sum.border)}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-xs font-bold text-muted-foreground">타이포그래피 · {sum.fontLabel}</p>
            <ul className="flex flex-col gap-1 text-xs text-foreground">
              {sum.typeScale.map(([use, spec]) => (
                <li key={use} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">{use}</span>
                  <span className="font-mono">{spec}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold text-muted-foreground">모서리 · 밀도</p>
            <p className="text-xs text-foreground">
              카드 {rad.card} · 버튼 {rad.button} · 배지 {rad.badge} · {sum.densityLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-bold text-muted-foreground">컴포넌트 규칙</p>
        <ul className="grid gap-1.5 text-xs text-foreground sm:grid-cols-2">
          {sum.components.map(([name, rule]) => (
            <li key={name} className="flex gap-2">
              <span className="font-semibold">{name}</span>
              <span className="text-muted-foreground">{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
