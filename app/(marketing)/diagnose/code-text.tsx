// 배점표의 「재는 법」 문장에는 `<meta name="viewport">` 같은 코드 조각이 섞여 있다.
// 마크다운을 그리는 곳이 아니라서 백틱이 글자 그대로 보였다 — 오타처럼 읽힌다.
// 백틱으로 감싼 부분만 <code> 로 바꿔 준다.
//
// 훅을 안 쓰므로 서버 컴포넌트(배점표 페이지)와 클라이언트 컴포넌트(결과 화면) 양쪽에서 쓸 수 있다.

export function CodeText({ children }: { children: string }) {
  const parts = children.split(/`([^`]+)`/g);
  return (
    <>
      {parts.map((part, i) =>
        // 홀수 번째가 백틱 «안쪽»이다.
        i % 2 === 1 ? (
          <code
            key={i}
            className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground"
          >
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}
