import type { Metadata } from "next";
import { Mail, Building2, Clock } from "lucide-react";
import { Fill } from "../legal-doc";

export const metadata: Metadata = {
  title: "문의하기 | IA 자동생성 플랫폼",
  description: "서비스 이용 문의, 환불 요청, 개인정보 관련 문의를 받습니다.",
};

const CARDS = [
  {
    icon: Mail,
    title: "이메일 문의",
    lines: [
      <>
        서비스 이용·환불·개인정보 문의는{" "}
        <Fill key="mail">[문의 이메일]</Fill> 로 보내주세요.
      </>,
    ],
  },
  {
    icon: Clock,
    title: "답변 시간",
    lines: ["영업일 기준 1~3일 이내에 답변드려요. (주말·공휴일 제외)"],
  },
];

export default function ContactPage() {
  return (
    <div className="bg-linear-to-b from-pastel-mint/25 to-background">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <header className="flex flex-col gap-3 border-b-2 border-border pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">문의하기</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            궁금한 점이나 불편한 점이 있으면 편하게 알려주세요.
          </p>
        </header>

        <div className="grid gap-4 py-8 sm:grid-cols-2">
          {CARDS.map(({ icon: Icon, title, lines }) => (
            <div
              key={title}
              className="flex flex-col gap-2.5 rounded-xl border border-border bg-background p-5 shadow-sm"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary-on-soft">
                <Icon className="size-4.5" />
              </span>
              <p className="font-bold text-foreground">{title}</p>
              {lines.map((line, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>

        <section className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-5">
          <h2 className="flex items-center gap-2 font-bold text-foreground">
            <Building2 className="size-4.5 text-primary" />
            사업자 정보
          </h2>
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
            {[
              ["상호", "[상호명]"],
              ["대표자", "[대표자명]"],
              ["사업자등록번호", "[000-00-00000]"],
              ["통신판매업 신고번호", "[제0000-지역0000호]"],
              ["사업장 주소", "[주소]"],
              ["연락처", "[전화번호]"],
            ].map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="font-medium text-muted-foreground">{label}</dt>
                <dd className="text-foreground">
                  <Fill>{value}</Fill>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
