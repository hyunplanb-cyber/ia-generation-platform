import { ShieldCheck, History, Check } from "lucide-react";
import { listMenus } from "@/application/list-menus";
import { countScreensByProject } from "@/application/count-screens-by-project";
import { listProjectVerifyRuns } from "@/application/list-project-verify-runs";
import { VerifyReportView } from "@/components/verify/verify-report-view";
import { VerifyScenarioDownloadButton } from "@/components/verify/verify-scenario-download";
import { isVerifyDownloadUnlocked } from "@/application/download";
import { creditsOpenForMe } from "@/application/billing-gate";
import { CREDIT_COST, VERIFY_CHUNK, verifyGenCost } from "@/lib/credits";
import { 날짜시각 } from "@/lib/when";
import { VerifyPanel } from "./verify-panel";

// 검수는 여러 페이지를 돌며 자동 검사(수십~백여 건) + LLM 시나리오까지 하므로
// 30초~1분 넘게 걸릴 수 있다. Fluid Compute에서는 무료 플랜도 300초까지 허용되므로
// 여유 있게 올린다(마케팅 /verify 와 동일).
export const maxDuration = 180;

// 1뎁스 메뉴 이름으로 "이 메뉴에서 이런 걸 확인해요" 질문을 만든다(키워드 기반).
function checkQuestionFor(name: string): string {
  const n = name;
  if (/홈|메인|main|home/i.test(n)) return "깨지는 이미지·링크는 없나요?";
  if (/검색|찾기|탐색|search/i.test(n)) return "필터를 선택하면 결과가 검색되나요?";
  if (/등록|작성|신청|글쓰기|write|register|create|post/i.test(n)) return "입력한 정보가 정확히 저장되나요?";
  if (/상세|detail/i.test(n)) return "상세 정보가 빠짐없이 노출되나요?";
  if (/목록|리스트|list/i.test(n)) return "목록이 정렬·페이지대로 잘 나오나요?";
  if (/로그인|회원|가입|마이|내\s?정보|mypage|login|auth|profile/i.test(n)) return "로그인 후 내 정보가 맞게 보이나요?";
  if (/장바구니|결제|주문|구매|cart|order|pay|checkout/i.test(n)) return "결제·주문이 끝까지 진행되나요?";
  if (/팝업|이벤트|프로모션|event/i.test(n)) return "기간에 맞는 항목이 노출되나요?";
  if (/문의|고객|상담|support|contact|cs|help/i.test(n)) return "문의 등록·답변이 정상 처리되나요?";
  if (/지도|위치|장소|공간|map|location|place/i.test(n)) return "위치 정보가 정확하게 나오나요?";
  if (/알림|notice|notification/i.test(n)) return "알림·공지가 제대로 표시되나요?";
  return `${n}의 핵심 기능이 정상 동작하나요?`;
}

// 서버에서 고정 «포맷»으로 그렸지만 «시간대»는 안 박아서 9시간 밀렸다(lib/when.ts).
const formatDate = 날짜시각;

export default async function ProjectVerifyPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  // 크레딧 경제가 이 사람에게 열려 있나. map 콜백 안에서는 await 를 못 써서 한 번만 구한다.
  const 크레딧열림 = await creditsOpenForMe();
  const [menus, runs, screenCounts] = await Promise.all([
    listMenus(projectId),
    listProjectVerifyRuns(projectId),
    countScreensByProject([projectId]),
  ]);
  // 값은 묶음 수에 비례한다. 이 경로는 우리가 만든 산출물이라 화면 수를 알고,
  // 그래서 누르기 전에 정확한 크레딧을 보여줄 수 있다.
  const screenCount = screenCounts[projectId] ?? 0;
  const detailChunks = Math.max(1, Math.ceil(screenCount / VERIFY_CHUNK.screens));
  // 1뎁스 메뉴 상위 4개로 "이 메뉴에서 이런 걸 확인해요" 예시를 만든다.
  const menuChecks = [...menus]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 4)
    .map((m) => ({ name: m.nameKo, question: checkQuestionFor(m.nameKo) }));
  const verifyUnlocks = Object.fromEntries(
    await Promise.all(runs.map(async (r) => [r.id, await isVerifyDownloadUnlocked(r.id)] as const)),
  );

  return (
    <div className="point-green mx-auto flex w-full max-w-[1152px] flex-col gap-6">
      {/* 헤더 — 디자인 프리셋과 같은 형태(제목 + 서브 카피) */}
      <div className="flex flex-col gap-2 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <ShieldCheck className="size-6 text-primary" /> 검수 시나리오
          </h1>
          {runs.length > 0 && (
            <span className="rounded-md bg-pastel-mint px-2 py-0.5 text-xs font-bold text-pastel-mint-foreground">
              생성 {runs.length}회
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          생성된 산출물을 기준으로, 오픈 전에 꼭 확인할 검수 시나리오를 만들어드려요.
        </p>
      </div>

      <VerifyPanel
        projectId={projectId}
        basicCost={verifyGenCost(1)}
        detailCost={verifyGenCost(detailChunks)}
        screenCount={screenCount}
        detailChunks={detailChunks}
        downloadCost={CREDIT_COST.downloadVerify}
        creditsOpen={크레딧열림}
      >
      {/* 보조 안내(먼저) — 왜 필요한지 */}
      <div className="rounded-xl border border-border bg-muted/20 p-4">
        <p className="text-sm font-bold text-foreground">왜 검수 시나리오가 필요할까요?</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          바이브코딩·외주로 만든 사이트는 “화면은 있는데 버튼이 안 눌리거나, 계획한 기능이 빠지는” 경우가 많아요.
          산출물과 하나씩 대조해 진짜 다 됐는지 확인해야 오픈 후 사고를 막습니다.
        </p>
      </div>

      {/* 메인(강조) — 무엇을 검수하는지 (생성된 메뉴 기준) */}
      <div>
        <h2 className="text-lg font-extrabold text-foreground">지금 산출물 기준, 이런 부분을 검수해요</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          생성된 산출물 기준 확인해야 할 항목이 많아요. 시나리오대로 눌러보며 하나씩 확인할 수 있도록 검수 시나리오를
          만들어드려요.
        </p>

        {menuChecks.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2.5">
            {menuChecks.map((m) => (
              <li key={m.name} className="flex items-baseline gap-2 text-sm">
                <Check className="size-4 shrink-0 translate-y-0.5 text-primary" />
                <span>
                  <b className="text-foreground">{m.name}</b>
                  <span className="text-muted-foreground"> : {m.question}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            먼저 산출물(메뉴·화면)을 생성하면, 그 메뉴들 기준으로 확인할 항목과 검수 시나리오가 만들어져요.
          </p>
        )}
      </div>

      </VerifyPanel>

      {/* 지난 검수 기록 */}
      {runs.length > 0 && (
        <section className="flex flex-col gap-3 border-t border-border pt-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <History className="size-4 text-muted-foreground" /> 지난 검수 기록
          </h2>
          <div className="flex flex-col gap-2">
            {runs.map((run) => (
              <details key={run.id} className="rounded-xl border border-border bg-background">
                <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
                  <span className="font-medium text-foreground">{formatDate(run.createdAt)}</span>
                  <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">
                    {run.target}
                  </span>
                  {run.mode === "site" && (
                    <span className="ml-auto flex shrink-0 gap-1.5">
                      <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
                        통과 {run.report.passCount}
                      </span>
                      <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">
                        실패 {run.report.failCount}
                      </span>
                    </span>
                  )}
                </summary>
                <div className="flex flex-col gap-4 border-t border-border/60 p-4">
                  <VerifyReportView report={run.report} preview />
                  {run.report.scenarios.length > 0 && (
                    <div className="flex justify-end">
                      <VerifyScenarioDownloadButton
                        report={run.report}
                        verifyRunId={run.id}
                        credits={CREDIT_COST.downloadVerify}
                        unlocked={verifyUnlocks[run.id]}
                        creditsOpen={크레딧열림}
                      />
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
