// 프로젝트 화면이 뜨기 전에 보여줄 뼈대.
//
// "AI팩 만들기"를 누르면 프로젝트를 만들고 STEP 1로 넘어가는데, 그 사이 화면이
// 그대로 멈춰 있어 느리게 느껴졌다. 껍데기라도 먼저 그려 두면 "눌렸다"는 게 보인다.

export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-5">
      <div className="flex gap-3">
        <div className="h-14 flex-1 rounded-xl bg-muted" />
        <div className="h-14 flex-1 rounded-xl bg-muted/60" />
        <div className="h-14 flex-1 rounded-xl bg-muted/60" />
      </div>
      <div className="h-4 w-2/3 rounded bg-muted" />
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <div className="h-7 w-48 rounded bg-muted" />
          <div className="grid gap-2.5 sm:grid-cols-3">
            <div className="h-20 rounded-lg bg-muted" />
            <div className="h-20 rounded-lg bg-muted/60" />
            <div className="h-20 rounded-lg bg-muted/60" />
          </div>
          <div className="h-7 w-32 rounded bg-muted" />
          <div className="h-28 rounded-lg bg-muted/60" />
        </div>
        <div className="h-64 rounded-xl bg-muted/40" />
      </div>
    </div>
  );
}
