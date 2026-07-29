"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, Palette } from "lucide-react";
import {
  DESIGN_OPTIONS,
  FONT_FEELS,
  RADIUS_FEELS,
  DENSITIES,
  primarySwatchesFor,
  type PresetConfig,
  type DesignKey,
  type FontFeel,
  type RadiusFeel,
  type Density,
} from "@/lib/design-presets";
import { savePresetConfigAction } from "./actions";

// 작은 선택 버튼(라인 스타일). 고르면 primary로 채워진다.
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
  cost,
  generated,
}: {
  projectId: string;
  projectName: string;
  initial: PresetConfig;
  creditsOpen: boolean;
  cost: number;
  generated: boolean;
}) {
  const router = useRouter();
  const [cfg, setCfg] = useState<PresetConfig>(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  // 이미 생성(=크레딧 차감)된 프로젝트인지. 첫 생성 후 true가 되어 이후 저장은 무료.
  const [paid, setPaid] = useState(generated);

  const set = <K extends keyof PresetConfig>(key: K, value: PresetConfig[K]) => {
    setCfg((c) => ({ ...c, [key]: value }));
    setSaved(false);
  };

  // 큰 방향을 바꾸면 그 방향의 기본 주색으로 함께 맞춰준다.
  const changeStyle = (style: DesignKey) => {
    setCfg((c) => ({ ...c, style, primary: primarySwatchesFor(style)[0] }));
    setSaved(false);
  };

  const swatches = useMemo(() => primarySwatchesFor(cfg.style), [cfg.style]);
  const rad = useMemo(() => RADIUS_FEELS.find((r) => r.key === cfg.radius)!, [cfg.radius]);
  const font = useMemo(() => FONT_FEELS.find((f) => f.key === cfg.font)!, [cfg.font]);
  const den = useMemo(() => DENSITIES.find((d) => d.key === cfg.density)!, [cfg.density]);
  const pv = cfg.dark
    ? { bg: "#0E1116", surface: "#171B22", text: "#E8EAED", muted: "#9AA0A8", border: "#2A2F37" }
    : { bg: "#FFFFFF", surface: "#FFFFFF", text: "#16181D", muted: "#6B7280", border: "#E5E7EB" };

  // 크레딧을 내야 하는 상태인가(결제 켜짐 + 아직 생성 전).
  const willCharge = creditsOpen && !paid;

  async function handleSave() {
    setBusy(true);
    try {
      const r = await savePresetConfigAction(projectId, cfg);
      if (!r.ok) {
        setBusy(false);
        if (window.confirm("크레딧이 부족해요. 충전 페이지로 갈까요?")) {
          router.push("/dashboard/billing");
        }
        return;
      }
      setSaved(true);
      if (r.charged) setPaid(true);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-2">
        <Link
          href={`/dashboard/${projectId}`}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> {projectName}
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Palette className="size-6 text-primary" /> 디자인 프리셋
        </h1>
        <p className="text-sm text-muted-foreground">
          컨셉은 큰 방향이고, 여기서 색·글꼴·모서리·밀도를 직접 골라 <b className="text-foreground">개발에 바로 쓰는
          디자인 시스템 문서</b>를 만들어요. 미리보기는 무료로 마음껏 바꿔볼 수 있어요.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        {/* 설정 */}
        <div className="flex flex-col gap-7">
          <Section title="큰 방향" hint="브리프에서 고른 컨셉이 기본으로 잡혀 있어요. 방향에 맞는 색이 아래에 나와요.">
            <div className="grid gap-2 sm:grid-cols-3">
              {DESIGN_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => changeStyle(opt.key)}
                  className={`flex flex-col gap-2 rounded-xl border p-3 text-left transition-colors ${
                    cfg.style === opt.key
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="flex gap-1">
                    {opt.swatches.map((s, i) => (
                      <span
                        key={i}
                        className="size-4 rounded-full ring-1 ring-black/5"
                        style={{ backgroundColor: s }}
                      />
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

        {/* 라이브 미리보기 */}
        <div className="lg:sticky lg:top-6 lg:h-fit">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">미리보기</p>
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
              고른 색과 모서리가 이렇게 적용돼요. 문서에는 색 단계·타이포·간격까지 자세히 정리됩니다.
            </p>
            <div className="flex gap-2">
              <span
                style={{
                  background: cfg.primary,
                  color: "#fff",
                  borderRadius: rad.button,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "8px 14px",
                }}
              >
                주요 버튼
              </span>
              <span
                style={{
                  background: "transparent",
                  color: pv.text,
                  border: `1px solid ${pv.border}`,
                  borderRadius: rad.button,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "8px 14px",
                }}
              >
                보조
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : saved ? (
              <Check className="size-4" />
            ) : null}
            {busy
              ? "저장 중"
              : saved
                ? "저장됨"
                : willCharge
                  ? `프리셋 생성 · ${cost}크레딧`
                  : "프리셋 저장"}
          </button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {willCharge ? (
              <>
                생성에 <b className="text-foreground">{cost}크레딧</b>이 들어요. 이후 수정은 무료이고, 문서는 전체
                다운로드에 포함됩니다.
              </>
            ) : (
              <>수정은 무료예요. 문서 파일은 <b className="text-foreground">전체 다운로드</b>에 포함됩니다.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
