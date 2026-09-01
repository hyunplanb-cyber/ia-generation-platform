import type { Metadata } from "next";
import Link from "next/link";
import { Radar, ArrowRight, ShieldCheck, Wallet, EyeOff } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CRITERIA } from "@/lib/diagnose/criteria";
import { DiagnoseForm } from "./diagnose-form";

// 「내 사이트가 ChatGPT·Claude 에 잡히나?」를 무료로 재 주는 홍보용 도구.
//
// 파는 물건이 아니라 «미끼»다. 무료 샘플(zip)과 같은 자리에 있다 — 우리를 처음 본 사람에게
// 먼저 값을 보여 주고, 그다음에 권한다. 다른 점은 이건 «손님 사이트 이야기»라 더 잘 걸린다.
//
// ⛔ AI를 안 부른다. 페이지 소스만 보고 규칙으로 채점하므로 돌려도 종량제 잔액이 안 준다.
//    (lib/diagnose/checks.ts · AGENTS.md 의 결제 경로 규칙)

export const metadata: Metadata = {
  title: "GEO·AEO·SEO 무료 진단 — 내 사이트, 검색과 AI에 나오나요?",
  description:
    "주소만 넣으면 검색 순위(SEO)·답변 노출(AEO)·AI 인용(GEO) 세 갈래로 무료 진단해 드려요. 무엇을 어떻게 고쳐야 하는지까지 콕 집어 알려 드립니다. 가입도 결제도 없습니다.",
  keywords: ["GEO 진단", "AEO 진단", "SEO 진단", "AI 검색 최적화", "ChatGPT 노출", "홈페이지 무료 진단"],
};

const POINTS = [
  { icon: Wallet, title: "완전 무료", desc: "가입도 결제도 없어요. 주소만 넣으면 됩니다." },
  { icon: EyeOff, title: "아무것도 안 남겨요", desc: "결과는 화면에만 뜨고 저장하지 않습니다." },
  { icon: ShieldCheck, title: "근거 있는 기준", desc: "구글 공식 문서에 맞춰 배점을 정했습니다." },
];

export default function DiagnosePage() {
  return (
    <div className="bg-background">
      <section className="bg-linear-to-br from-primary-soft/40 via-background to-muted/40">
        <div className="mx-auto max-w-3xl px-6 pb-12 pt-12 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground shadow-sm">
            <Radar className="size-4" />
            무료 진단
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            내 사이트,
            <br />
            <span className="bg-primary-soft rounded-lg px-2 py-0.5">검색과 AI에</span> 나오나요?
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            손님은 이제 검색창에도, AI에게도 묻습니다. 주소만 넣으면{" "}
            <strong className="text-foreground">검색 순위(SEO) · 답변 노출(AEO) · AI 인용(GEO)</strong>{" "}
            세 갈래로 재고, 무엇을 어떻게 고칠지까지 짚어 드려요.
          </p>

          <div className="mt-8">
            <DiagnoseForm />
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-14">
        <section className="grid gap-4 sm:grid-cols-3" data-나타남>
          {POINTS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
              <Icon className="size-5 text-primary" />
              <p className="font-bold text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-4" data-나타남>
          <h2 className="text-xl font-bold text-foreground">무엇을 보나요</h2>
          <dl className="flex flex-col gap-3">
            {[
              ["검색에 나오나 — SEO", "구글·네이버가 우리를 검색 결과에 실을 수 있는 상태인지 봅니다. 「검색에 넣지 마세요」로 막혀 있진 않은지, 제목·설명문·휴대폰 대응·쪽 목록이 갖춰져 있는지. 근거는 구글 공식 문서입니다."],
              ["답변으로 뽑히나 — AEO", "「OO가 뭐예요?」라는 물음에 우리 글이 «답»으로 뽑힐 모양인지 봅니다. 질문형 소제목, 바로 뒤에 40~60어절로 끝내는 답, 목록과 표. 실제로 뽑혀 간 스니펫을 잰 연구값을 그대로 씁니다."],
              ["AI가 인용하나 — GEO", "ChatGPT·Claude 가 답을 만들 때 우리를 «출처»로 쓸지 봅니다. 로봇이 받는 글이 비어 있진 않은지, 따옴표 인용·구체적 숫자·출처 표기가 있는지. 질의 1만 건으로 효과를 실측한 논문에서 나온 항목들입니다."],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-border bg-surface p-5">
                <dt className="font-bold text-foreground">{k}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm leading-6 text-muted-foreground">
            페이지 소스만 보고 잽니다. 실제로 AI가 우리를 인용하는지까지는 이 방법으로 알 수 없어요 —
            그건 따로 봐 드립니다. 배점은 구글 공식 문서(「AI features and your website」)를 근거로 정했고,
            근거가 없는 항목은 넣지 않았습니다. 예를 들어 llms.txt 는 구글이 「쓰지 않는다」고 밝혀 배점에서 뺐습니다.
          </p>
          <Link
            href="/diagnose/criteria"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline underline-offset-4"
          >
            배점표 {CRITERIA.length}개 항목 전체와 근거 문서 보기
            <ArrowRight className="size-4" />
          </Link>
        </section>

        <section
          className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center"
          data-나타남
        >
          <h2 className="text-xl font-bold text-foreground">고칠 곳을 알았다면</h2>
          <p className="max-w-lg text-muted-foreground">
            점수가 낮게 나온 항목은 대부분 «기획이 빠져서» 생깁니다. 카페인컬러는 사이트 컨셉만
            넣으면 IA·기능정의·AI프롬프트까지 한 번에 만들어 드려요.
          </p>
          <Link href="/free" className={buttonVariants({ size: "lg" })}>
            무료 샘플 먼저 보기
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
