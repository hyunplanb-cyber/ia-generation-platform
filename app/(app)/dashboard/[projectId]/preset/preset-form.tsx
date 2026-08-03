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
  fontById,
  buildDetailedPresetMarkdown,
  buildPresetSummary,
  type PresetConfig,
  type DesignKey,
  type FontFeel,
  type RadiusFeel,
  type Density,
  LAYOUTS,
  secondPreset,
  type LayoutKey,
} from "@/lib/design-presets";
import { generatePresetAction, downloadPresetAction } from "./actions";

/**
 * 레이아웃 골격 미리보기 — 색이 아니라 "무엇이 어디에 있는지"만 보여주는 회색 뼈대.
 * 진한 칸이 그 골격에서 눈에 먼저 들어오는 자리다.
 */
function LayoutThumb({ kind, on }: { kind: string; on: boolean }) {
  const bar = on ? "bg-primary/70" : "bg-muted-foreground/45";
  const box = on ? "bg-primary/25" : "bg-muted-foreground/15";
  const line = on ? "bg-primary/40" : "bg-muted-foreground/25";

  return (
    <div
      aria-hidden="true"
      className={`flex h-[72px] w-full flex-col gap-1 overflow-hidden rounded-lg border p-1.5 ${
        on ? "border-primary/40 bg-background" : "border-border bg-muted/40"
      }`}
    >
      {/* 상단 내비 — 대시보드형만 좌측 세로 */}
      {kind !== "console" && <div className={`h-2 w-full shrink-0 rounded-sm ${bar}`} />}
      {kind === "showcase" && <div className={`h-1 w-2/3 shrink-0 rounded-sm ${line}`} />}

      {kind === "search" && (
        <>
          <div className={`h-4 w-full shrink-0 rounded-sm ${box}`} />
          <div className="grid flex-1 grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`rounded-sm ${line}`} />
            ))}
          </div>
        </>
      )}

      {kind === "showcase" && (
        <div className="grid flex-1 grid-cols-3 grid-rows-2 gap-1">
          <div className={`col-span-2 row-span-2 rounded-sm ${box}`} />
          <div className={`rounded-sm ${line}`} />
          <div className={`rounded-sm ${line}`} />
        </div>
      )}

      {kind === "list" && (
        <div className="flex flex-1 gap-1">
          <div className={`w-1/4 rounded-sm ${line}`} />
          <div className="flex flex-1 flex-col gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`flex-1 rounded-sm ${i === 0 ? box : line}`} />
            ))}
          </div>
        </div>
      )}

      {kind === "split" && (
        <div className="flex flex-1 gap-1">
          <div className="flex flex-1 flex-col justify-center gap-1">
            <div className={`h-2 w-full rounded-sm ${bar}`} />
            <div className={`h-1 w-3/4 rounded-sm ${line}`} />
          </div>
          <div className={`w-2/5 rounded-sm ${box}`} />
        </div>
      )}

      {kind === "console" && (
        <div className="flex flex-1 gap-1">
          <div className={`w-1/4 rounded-sm ${bar}`} />
          <div className="flex flex-1 flex-col gap-1">
            <div className="grid grid-cols-4 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-3 rounded-sm ${box}`} />
              ))}
            </div>
            <div className={`flex-1 rounded-sm ${line}`} />
          </div>
        </div>
      )}
    </div>
  );
}

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

const styleTitleOf = (k: DesignKey) => DESIGN_OPTIONS.find((d) => d.key === k)?.title ?? k;

/** 2번 벌의 포인트 색. 아직 안 골랐으면 그 테마의 첫 색. */
const primaryBOf = (c: PresetConfig) =>
  c.primaryB || (c.styleB ? primarySwatchesFor(c.styleB)[0] : c.primary);

/**
 * 미리보기 카드 — 고른 색·글꼴·모서리·밀도가 실제로 어떻게 보이는지.
 *
 * 두 벌을 고르면 이 카드를 위아래로 두 장 그린다. 나란히 놓아야 고를 수 있고,
 * 그러라고 두 벌을 주는 것이다(2026-08-04).
 * 설정을 인자로 받아 스스로 계산한다 — 바깥에서 한 벌 기준으로 미리 만들어 두면
 * 두 번째 벌을 그릴 수 없다.
 */
function PreviewCard({ config, badge }: { config: PresetConfig; badge?: string }) {
  const s = buildPresetSummary(config);
  const r = RADIUS_FEELS.find((x) => x.key === config.radius)!;
  const f = fontById(config.font);
  const d = DENSITIES.find((x) => x.key === config.density)!;
  const th = DESIGN_OPTIONS.find((o) => o.key === config.style)?.swatches ?? [config.primary];
  const ac = th[1] ?? config.primary; // 2번째 색 → 배지
  const hl = th[2] ?? config.primary; // 3번째 색 → 테두리
  return (
    <div className="flex flex-col gap-1.5">
      {badge && (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <span className="rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
            {badge}
          </span>
          {styleTitleOf(config.style)}
        </p>
      )}
      <div
        className="flex flex-col gap-3"
        style={{
          background: s.bg,
          border: `2px solid ${hl}`,
          borderRadius: r.card,
          fontFamily: f.family,
          padding: d.key === "cozy" ? "20px" : "14px",
        }}
      >
        <div className="flex items-center justify-between" style={{ color: s.text }}>
          <strong style={{ fontSize: 15 }}>화면 제목</strong>
          <span
            style={{
              background: ac + "22",
              color: ac,
              borderRadius: r.badge,
              fontSize: 11,
              padding: "2px 8px",
              fontWeight: 700,
            }}
          >
            배지
          </span>
        </div>
        <p style={{ color: s.muted, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
          고른 색과 모서리가 이렇게 적용돼요. 생성하면 색 단계·타이포·컴포넌트 규칙 요약이 나와요.
        </p>
        <div className="flex gap-2">
          <span style={{ background: config.primary, color: "#fff", borderRadius: r.button, fontSize: 13, fontWeight: 600, padding: "8px 14px" }}>
            주요 버튼
          </span>
          <span style={{ background: "transparent", color: s.text, border: `1px solid ${s.border}`, borderRadius: r.button, fontSize: 13, fontWeight: 600, padding: "8px 14px" }}>
            보조
          </span>
        </div>
      </div>
    </div>
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
  revisionCost,
  revisionLimit,
  revisions,
  generated,
  downloaded,
}: {
  projectId: string;
  projectName: string;
  initial: PresetConfig;
  creditsOpen: boolean;
  genCost: number;
  downloadCost: number;
  revisionCost: number;
  revisionLimit: number;
  revisions: number;
  generated: boolean;
  downloaded: boolean;
}) {
  const router = useRouter();
  const [cfg, setCfg] = useState<PresetConfig>(initial);
  const [busy, setBusy] = useState<"gen" | "save" | "download" | null>(null);
  const [gen, setGen] = useState(generated);
  const [down, setDown] = useState(downloaded);
  // 마지막으로 받은 설정. 이것과 달라지면 다음 다운로드는 '수정본'이라 값이 붙는다.
  const [downCfg, setDownCfg] = useState<PresetConfig | null>(downloaded ? initial : null);
  const [revCount, setRevCount] = useState(revisions);
  const [savedTick, setSavedTick] = useState(false);

  const set = <K extends keyof PresetConfig>(key: K, value: PresetConfig[K]) => {
    setCfg((c) => ({ ...c, [key]: value }));
    setSavedTick(false);
  };
  const styleTitle = (k: DesignKey) => DESIGN_OPTIONS.find((d) => d.key === k)?.title ?? k;

  /**
   * 테마를 둘까지 고른다.
   *   안 골린 것을 누름 → 2번 자리에 넣는다(2번이 차 있으면 그것을 밀어낸다)
   *   1번을 누름        → 2번이 1번이 되고, 두 벌이 한 벌로 준다
   *   2번을 누름        → 2번만 뺀다
   */
  const toggleStyle = (style: DesignKey) => {
    setSavedTick(false);
    setCfg((c) => {
      if (c.style === style) {
        // 1번을 해제 — 2번이 있으면 그게 1번이 된다(고른 색도 함께 올라온다).
        if (!c.styleB) return c; // 하나는 남아야 한다
        return {
          ...c,
          style: c.styleB,
          primary: primaryBOf(c),
          styleB: undefined,
          primaryB: undefined,
        };
      }
      if (c.styleB === style) return { ...c, styleB: undefined, primaryB: undefined };
      // 2번을 새로 고르면 그 테마의 첫 색으로 시작한다(아래에서 바꿀 수 있다).
      return { ...c, styleB: style, primaryB: primarySwatchesFor(style)[0] };
    });
  };

  // 색·글꼴·모서리·밀도는 미리보기 카드가 자기 설정으로 직접 계산한다(PreviewCard).
  // 두 벌을 그려야 해서, 바깥에서 한 벌 기준으로 미리 만들어 두면 쓸 수 없다.
  const rad = useMemo(() => RADIUS_FEELS.find((r) => r.key === cfg.radius)!, [cfg.radius]);
  const sum = useMemo(() => buildPresetSummary(cfg), [cfg]);

  // 생성은 충전 개방 여부와 무관하게 항상 차감된다(다운로드만 아직 안 열렸다).
  const willChargeGen = !gen;

  // 프리셋은 프로젝트에 묶이지 않는 파일이라 한 번 받으면 다른 프로젝트에도 넣어 쓸 수 있다.
  // 그래서 고쳐서 다시 받는 것에만 값을 매기고 횟수를 둔다(2026-08-04).
  //   처음 99 · 그대로 다시 받기 무료 · 고쳐 받기 30(2회까지)
  const changed = down && downCfg !== null && JSON.stringify(downCfg) !== JSON.stringify(cfg);
  const revLeft = Math.max(0, revisionLimit - revCount);
  const revisionBlocked = changed && revLeft === 0;
  const nextCost = !down ? downloadCost : changed ? revisionCost : 0;
  const willChargeDownload = creditsOpen && nextCost > 0;

  function safeName(s: string) {
    return (s || "프로젝트").trim().slice(0, 20).replace(/[\\/:*?"<>|]/g, "_");
  }

  function saveBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function persist() {
    // 현재 설정 저장(첫 생성이면 PRESET_GEN_COST 크레딧, 이후 무료). 부족하면 결과로 알림.
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
        if (r.reason === "revision-limit") {
          window.alert(
            `수정본은 ${revisionLimit}번까지 받을 수 있어요. 마지막으로 받으신 프리셋은 언제든 다시 받으실 수 있습니다.`,
          );
          return;
        }
        if (r.reason === "insufficient" && window.confirm("크레딧이 부족해요. 충전 페이지로 갈까요?")) {
          router.push("/dashboard/billing");
        }
        return;
      }
      // 받은 내용을 기억해 둔다 — 이후 이 설정 그대로 다시 받는 건 무료다.
      if (changed) setRevCount((n) => n + 1);
      setDown(true);
      setDownCfg(cfg);

      // 두 벌이면 zip으로 묶는다. 파일이 둘인데 하나씩 내려받게 하면
      // 두 번째를 놓치는 사람이 생긴다.
      const second = secondPreset(cfg);
      const base = safeName(projectName);
      if (second) {
        const { default: JSZip } = await import("jszip");
        const zip = new JSZip();
        const folder = zip.folder(`디자인프리셋_${base}`)!;
        folder.file(`가이드_01_${styleTitle(cfg.style)}.md`, buildDetailedPresetMarkdown(cfg, projectName));
        folder.file(`가이드_02_${styleTitle(second.style)}.md`, buildDetailedPresetMarkdown(second, projectName));
        const buf = await zip.generateAsync({ type: "blob" });
        saveBlob(buf, `디자인프리셋_${base}.zip`);
      } else {
        const md = buildDetailedPresetMarkdown(cfg, projectName);
        saveBlob(new Blob([md], { type: "text/markdown;charset=utf-8" }), `디자인시스템_${base}.md`);
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  // ── 설정 컨트롤(생성 전 화면 + 생성 후 "설정 수정"에서 공용) ──
  const controls = (
    <div className="flex flex-col gap-7">
      {/* 테마를 둘까지 고른다. 한 벌만 주면 "이게 맞나" 판단할 수가 없다 —
          나란히 놓아야 고를 수 있다(2026-08-04). 글꼴·모서리·밀도·레이아웃은
          두 벌이 같이 쓰고 테마와 색만 갈린다. */}
      <Section
        title="테마 — 최대 2개"
        hint="둘을 고르면 프리셋이 두 벌 나와요. 나머지 설정(글꼴·모서리·밀도·레이아웃)은 두 벌이 같이 씁니다."
      >
        <div className="grid gap-2 sm:grid-cols-3">
          {DESIGN_OPTIONS.map((opt) => {
            const first = cfg.style === opt.key;
            const second = cfg.styleB === opt.key;
            const on = first || second;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => toggleStyle(opt.key)}
                aria-pressed={on}
                className={`relative flex flex-col gap-2 rounded-xl border p-3 text-left transition-colors ${
                  on ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                }`}
              >
                {on && (
                  <span className="absolute right-2 top-2 rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                    {first ? "1" : "2"}
                  </span>
                )}
                <div className="flex gap-1">
                  {opt.swatches.map((s, i) => (
                    <span key={i} className="size-4 rounded-full ring-1 ring-black/5" style={{ backgroundColor: s }} />
                  ))}
                </div>
                <span className="text-sm font-bold text-foreground">{opt.title}</span>
                <span className="text-xs text-muted-foreground">{opt.desc}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {cfg.styleB
            ? `두 벌로 받습니다 — ${styleTitle(cfg.style)} · ${styleTitle(cfg.styleB)}`
            : "하나 더 고르면 두 벌로 받을 수 있어요. 같은 값은 다시 눌러 해제합니다."}
        </p>
      </Section>

      {/* 두 벌이면 색도 각각 고른다. 예전엔 1번 색만 고를 수 있고 2번은 그 테마의
          첫 색으로 고정돼서, 두 벌을 고른 보람이 반쪽이었다(2026-08-04). */}
      <Section
        title="포인트 색상"
        hint={
          cfg.styleB
            ? "두 벌의 색을 각각 고르세요. 버튼·강조에 쓰입니다."
            : "고른 테마에 어울리는 색이에요. 버튼·강조에 쓰입니다."
        }
      >
        {(cfg.styleB
          ? ([
              { badge: "1", style: cfg.style, value: cfg.primary, key: "primary" as const },
              { badge: "2", style: cfg.styleB, value: primaryBOf(cfg), key: "primaryB" as const },
            ] as const)
          : ([{ badge: "", style: cfg.style, value: cfg.primary, key: "primary" as const }] as const)
        ).map((row) => (
          <div key={row.key} className="flex flex-col gap-1.5">
            {row.badge && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <span className="rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                  {row.badge}
                </span>
                {styleTitleOf(row.style)}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {primarySwatchesFor(row.style).map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => set(row.key, hex)}
                  aria-label={hex}
                  className={`size-9 rounded-full transition-transform hover:scale-110 ${
                    row.value.toUpperCase() === hex.toUpperCase()
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
                  value={row.value}
                  onChange={(e) => set(row.key, e.target.value.toUpperCase())}
                  className="size-6 cursor-pointer rounded-full border-0 bg-transparent p-0"
                />
              </label>
            </div>
          </div>
        ))}
      </Section>

      <Section
        title="글꼴"
        hint="웹에서 많이 쓰는 한글 폰트예요. AI 도구에서 쓸 땐 이 폰트를 웹폰트로 불러오거나 로컬에 설치해야 제대로 보입니다."
      >
        <div className="flex flex-wrap gap-2">
          {FONT_FEELS.map((f) => (
            <Choice key={f.key} active={cfg.font === f.key} onClick={() => set("font", f.key as FontFeel)}>
              <span style={{ fontFamily: f.family }}>{f.label}</span>
            </Choice>
          ))}
        </div>
      </Section>

      <Section
        title="레이아웃 골격"
        hint="색만 정하면 어느 테마로 만들어도 화면 뼈대가 같아집니다. 무엇을 어디에 놓을지 여기서 정해요."
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {LAYOUTS.map((l) => {
            const on = cfg.layout === l.key;
            return (
              <button
                key={l.key}
                type="button"
                onClick={() => set("layout", l.key as LayoutKey)}
                aria-pressed={on}
                className={`flex flex-col gap-1 rounded-xl border p-3 text-left transition-colors ${
                  on
                    ? "border-primary bg-primary-soft/40"
                    : "border-border bg-background hover:border-primary/40 hover:bg-muted"
                }`}
              >
                <LayoutThumb kind={l.key} on={on} />
                <span className="mt-1 text-sm font-bold text-foreground">{l.label}</span>
                <span className="text-xs leading-relaxed text-muted-foreground">{l.tagline}</span>
                <span className="text-[11px] leading-relaxed text-muted-foreground/80">
                  {l.fits}
                </span>
              </button>
            );
          })}
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

  const secondCfg = secondPreset(cfg);
  const preview = secondCfg ? (
    <div className="flex flex-col gap-4">
      <PreviewCard config={cfg} badge="1" />
      <PreviewCard config={secondCfg} badge="2" />
    </div>
  ) : (
    <PreviewCard config={cfg} />
  );

  return (
    <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Palette className="size-6 text-primary" /> 디자인 프리셋
        </h1>
        <p className="text-sm text-muted-foreground">
          컨셉은 큰 방향이고, 여기서 테마와 색·글꼴·모서리·밀도를 직접 골라 <b className="text-foreground">개발에 바로 쓰는
          디자인 시스템</b>을 생성하세요. 통일된 디자인은 사이트의 퀄리티를 완성합니다.
        </p>
      </div>

      {!gen ? (
        // ── 생성 전 ──
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          {controls}
          <div className="lg:sticky lg:top-6 lg:h-fit">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">미리보기</p>
            {preview}
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              해당 이미지는 테마 참고용입니다. 구현하시는 사이트의 컨셉 및 UI에 따라 다르게 적용됩니다.
            </p>
            <button
              type="button"
              onClick={() => handleGenerate("gen")}
              disabled={!!busy}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy === "gen" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {busy === "gen" ? "생성 중" : willChargeGen ? `프리셋 생성 · ${genCost}크레딧` : "프리셋 생성"}
            </button>
            <ul className="mt-3 flex flex-col gap-1 text-[11px] leading-relaxed text-muted-foreground">
              <li>· 생성 시 디자인 프리셋 md가 생성됩니다.</li>
              <li>· 디자인 프리셋 md는 다운로드하여 사용 가능합니다.</li>
              <li>· 디자인 프리셋 md는 다운로드 시 별도 비용이 발생하니 참고해 주세요.</li>
            </ul>
          </div>
        </div>
      ) : (
        // ── 생성 후: (왼쪽) 요약 + 수정 / (오른쪽) 다운로드 ──
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
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
                disabled={!!busy || !creditsOpen}
                title={!creditsOpen ? "다운로드는 준비 중이에요" : undefined}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy === "download" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                {busy === "download"
                  ? "준비 중"
                  : !creditsOpen
                    ? "프리셋 다운로드 · 준비 중"
                    : revisionBlocked
                      ? "수정본 횟수를 다 쓰셨어요"
                      : willChargeDownload
                        ? `${changed ? "수정본" : "프리셋"} 다운로드 · ${nextCost}크레딧`
                        : "프리셋 다운로드 · 0크레딧"}
              </button>
              <ul className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                <li>· 처음 받을 때 {downloadCost}크레딧, <b className="font-semibold">같은 내용을 다시 받는 건 무료</b>입니다.</li>
                <li>
                  · 색·글꼴을 <b className="font-semibold">고쳐서 다시 받으면 {revisionCost}크레딧</b>이고,{" "}
                  {revisionLimit}번까지 가능합니다{down && ` (남은 횟수 ${revLeft}번)`}.
                </li>
                <li>· 다시 받기는 ‘나의 프로젝트’에서도 가능합니다.</li>
              </ul>
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
              카드 {rad.card} · 버튼 {rad.button} · 배지 {rad.badge} · {sum.densityLabel} · {sum.layoutLabel}
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
