/* 「AI팩을 어떻게 만드나」를 실제 화면으로 보여 주는 절. (2026-08-14 사장님 지시)
 *
 * 왜 만드나
 *   이 페이지는 「무엇을 받나」만 말하고 「어떻게 만드나」는 말하지 않았다.
 *   처음 오신 분은 «몇 분이나 걸리는지, 뭘 적어야 하는지»를 몰라 시작을 못 한다.
 *
 * 그림은 지어내지 않았다 — 사장님이 실제로 만드신 「반려동물 유치원」 녹화본
 *   (`릴스영상/12. AI팩 만드는 과정/1. 반려동물 유치원.mp4`, 11분 30초)에서
 *   여섯 순간을 떠 왔다. 값·화면·문구가 전부 진짜다.
 *   ⚠ 화면을 고치면 이 캡처도 낡는다. 그때는 같은 녹화본에서 다시 뜨거나 새로 찍는다.
 */
import Image from "next/image";

type 단계 = { no: string; 제목: string; 말: string; 그림: string; 걸린시간: string };

const 단계들: 단계[] = [
  {
    no: "01",
    제목: "만들 사이트를 한 줄로 적어요",
    말: "「나는 펫 유치원을 운영하고 있어. 반려동물 유치원 사이트」처럼 한 줄이면 됩니다. 기획 용어를 몰라도 괜찮아요. PC·모바일 중 어디에 맞출지와 전체 일정만 함께 골라요.",
    그림: "/guide-shots/step1.jpg",
    걸린시간: "1분",
  },
  {
    no: "02",
    제목: "메뉴와 디자인을 고릅니다",
    말: "AI가 뽑아 준 메뉴를 보고 더하거나 뺍니다. 색·글꼴 3벌과 화면 뼈대 2벌 중에서 마음에 드는 걸 고르면, 뒤에 만들어지는 화면이 전부 그 얼굴로 나옵니다.",
    그림: "/guide-shots/step2.jpg",
    걸린시간: "2분",
  },
  {
    no: "03",
    제목: "기다립니다",
    말: "화면 목록과 화면마다 넣을 AI 프롬프트를 씁니다. 사이트 규모에 따라 다르지만 대개 몇 분입니다. 이 사이에 하실 일은 없어요.",
    그림: "/guide-shots/step3.jpg",
    걸린시간: "3~5분",
  },
  {
    no: "04",
    제목: "화면 목록이 나옵니다",
    말: "메뉴 아래 어떤 화면이 필요한지, 화면마다 무엇을 해야 하는지가 트리로 정리됩니다. 여기서 화면을 더하거나 지울 수 있어요. 「검색 결과 없음」 같은 빠지기 쉬운 화면까지 들어 있습니다.",
    그림: "/guide-shots/step4.jpg",
    걸린시간: "",
  },
  {
    no: "05",
    제목: "디자인·레이아웃 프리셋을 봅니다",
    말: "고른 색과 뼈대가 실제 화면에서 어떻게 보이는지 미리 확인합니다. 색 3벌 × 뼈대 2벌 = 여섯 가지로 섞어 쓸 수 있어요.",
    그림: "/guide-shots/step5.jpg",
    걸린시간: "",
  },
  {
    no: "06",
    제목: "검수 시나리오까지 받습니다",
    말: "오픈 전에 무엇을 눌러 봐야 하는지를 화면마다 적어 줍니다. 「이건 되겠지」 하고 넘어가는 자리가 사고가 나는 자리예요.",
    그림: "/guide-shots/step6.jpg",
    걸린시간: "",
  },
];

/* 탭 안에 들어가는 «몸통». 절 껍데기(section·배경)를 두지 않는다 —
   다른 탭(AI팩·사이트 검수)과 같은 결이라야 탭을 옮겨 다닐 때 안 튄다. */
export function HowToMakeBody() {
  return (
    <section>
      {/* ⚠ 이 칸은 «옆 탭들과 같은 폭»이라야 한다 (2026-08-25 사장님 지적).
          여기만 max-w-5xl(1024px)이었고 탭 띠·AI팩·사이트 검수는 모두 1440px 이라,
          탭을 「만드는 방법」으로 옮기는 순간 제목이 200px 쯤 안으로 쑥 들어갔다.
          탭은 «같은 자리에서» 갈려야 옮겨 다닐 때 눈이 안 튄다.
          ⚠ 셋이 늘 같이 움직인다 — 하나를 고치면 나머지 둘도 본다. */}
      <div className="mx-auto max-w-[1440px] px-6 py-16">
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl [word-break:keep-all]">
          AI팩은 이렇게 만들어져요
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground [word-break:keep-all]">
          아래 화면은 실제로 <b className="text-foreground">반려동물 유치원 사이트</b>를 만든 기록이에요.
          한 줄 적고 기다리면 끝입니다 — 전부 합쳐 <b className="text-foreground">10분 안팎</b>이에요.
        </p>

        {/* 한 줄에 둘씩 · 석 줄 (2026-08-25 사장님 지시).
            여섯 단계라 2×3 이 딱 떨어진다. 한 칸 안에서는 «그림 위 · 글 아래»다.
            ⛔ 그 전에는 한 단계가 한 줄을 통째로 쓰는 좌우 배치였다. 글이 서너 줄인데
               옆의 화면 캡처가 500px 넘게 높아, 글 칸 위아래가 200px 씩 비었다.
               위아래로 쌓으면 그 빈자리가 아예 안 생기고, 절 전체가 절반으로 짧아진다.
            ⚠ 칸을 stretch 로 두지 않는다 — 캡처 높이가 제각각이라 늘리면 그림이 눌린다.
               줄마다 아래가 조금 어긋나는 편이 낫다. */}
        <ol className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-10 md:gap-y-14 lg:gap-x-12">
          {단계들.map((s) => (
            <li key={s.no} className="flex flex-col">
              <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                <Image
                  src={s.그림}
                  alt={`${s.no} ${s.제목}`}
                  width={1100}
                  height={854}
                  className="w-full"
                  sizes="(max-width: 768px) 100vw, 660px"
                />
              </div>
              <div className="mt-5">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {s.no}
                  </span>
                  {s.걸린시간 && (
                    <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary-on-soft">
                      {s.걸린시간}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-lg font-bold text-foreground [word-break:keep-all]">{s.제목}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground [word-break:keep-all]">
                  {s.말}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
