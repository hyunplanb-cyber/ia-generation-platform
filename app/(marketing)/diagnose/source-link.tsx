// 배점 근거를 «눌러서 원문으로 갈 수 있게» 보여 준다.
//
// 근거를 이름으로만 적어 두면 확인할 길이 없다. 「GEO 논문 +41%」라고 써 놓고
// 어느 논문인지 못 찾으면 그냥 우리 주장일 뿐이다. 그래서 링크가 있는 근거는 전부 건다.
//
// 훅을 안 쓰므로 배점표 페이지(서버)와 결과 화면(클라이언트) 양쪽에서 쓸 수 있다.

import { ExternalLink } from "lucide-react";
import { SOURCES } from "@/lib/diagnose/criteria";

export function SourceLink({
  source,
  className = "",
  // 「근거 ·」를 앞에 붙일지. 이미 「근거」라고 이름표가 붙은 자리(ⓘ 패널)에서는 끈다.
  prefix = true,
}: {
  source: keyof typeof SOURCES;
  className?: string;
  prefix?: boolean;
}) {
  const s = SOURCES[source];
  const base = `text-muted-foreground/80 ${className}`;
  const head = prefix ? "근거 · " : "";

  // 링크가 없는 근거(우리 자체 판단)는 그대로 글자로 둔다. 없는 링크를 만들어 내지 않는다.
  if (!s.url) return <span className={base}>{head}{s.label}</span>;

  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} inline-flex items-baseline gap-1 underline decoration-dotted underline-offset-2 hover:text-primary`}
    >
      <span>{head}{s.label}</span>
      <ExternalLink className="size-3 shrink-0 self-center" />
    </a>
  );
}
