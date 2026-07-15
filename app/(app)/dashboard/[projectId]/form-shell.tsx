// 입력폼 섹션 — 레퍼런스처럼 "굵은 섹션 제목 + 밑줄 + 필드" 형태로 그룹을 구분한다.
// (스텝퍼가 상단에 있으므로 폼 자체는 담백하게 유지)
export function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3.5">
      <div className="border-b-2 border-border pb-2">
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        {hint && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}
