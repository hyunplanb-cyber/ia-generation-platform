import type { ReactNode } from "react";

// 이용약관 · 개인정보처리방침 등 법적 고지 문서 공통 레이아웃.
// 사업자 정보처럼 아직 확정되지 않은 값은 <Fill>로 감싸 눈에 띄게 표시한다.

export function LegalPage({
  title,
  effectiveDate,
  intro,
  children,
}: {
  title: string;
  effectiveDate: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-linear-to-b from-muted/40 to-background">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <header className="flex flex-col gap-3 border-b-2 border-border pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">시행일: {effectiveDate}</p>
          {intro && <p className="text-sm leading-relaxed text-muted-foreground">{intro}</p>}
        </header>

        <DraftNotice />

        <div className="flex flex-col gap-8 py-8">{children}</div>
      </div>
    </div>
  );
}

// 아직 법률 검토를 받지 않은 초안임을 명시. 검토 완료 후 이 컴포넌트만 제거하면 된다.
function DraftNotice() {
  return (
    <div className="mt-6 rounded-xl border border-warning/40 bg-warning-soft/60 px-5 py-4">
      <p className="text-sm font-bold text-foreground">⚠️ 초안 — 게시 전 확인 필요</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        이 문서는 서비스 구조에 맞춰 작성한 초안이에요. 노란색으로 표시된 항목을 채우고,
        결제를 시작하기 전에 법률 전문가의 검토를 받으세요.
      </p>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
        <span className="h-5 w-1 rounded-full bg-primary" />
        {title}
      </h2>
      <div className="flex flex-col gap-3 pl-3.5 text-sm leading-relaxed text-foreground/85">
        {children}
      </div>
    </section>
  );
}

export function Clause({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

export function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-primary/60">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function DataTable({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground">
          <tr>
            {head.map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-2.5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border/60 align-top">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 사업자 등록·통신판매업 신고 후 채워야 하는 값. 시각적으로 눈에 띄게 표시한다.
export function Fill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded bg-warning-soft px-1.5 py-0.5 font-semibold text-warning">
      {children}
    </span>
  );
}
