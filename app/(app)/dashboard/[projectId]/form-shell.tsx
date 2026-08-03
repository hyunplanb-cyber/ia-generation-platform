// 입력폼 섹션 — 레퍼런스처럼 "굵은 섹션 제목 + 밑줄 + 필드" 형태로 그룹을 구분한다.
// (스텝퍼가 상단에 있으므로 폼 자체는 담백하게 유지)
export function FormSection({
  title,
  hint,
  children,
  aside,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  /** 제목 줄 오른쪽 끝에 놓을 것 — 예: [만들다 만 AI팩이 있어요] */
  aside?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2.5 border-b-2 border-border pb-2.5">
          <span className="h-6 w-1.5 shrink-0 rounded-full bg-primary" />
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">{title}</h2>
          {aside && <div className="ml-auto">{aside}</div>}
        </div>
        {hint && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}
