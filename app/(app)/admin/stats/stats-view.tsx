/* 우리 숫자 — «보이는 부분»만. 데이터도 로그인 확인도 여기 없다.
 *
 * 왜 갈랐나 (2026-08-25) — page.tsx 안에 다 넣어 두면 «눈으로 볼 방법»이 없다.
 *   그 화면은 로그인 벽 뒤에 있어서 만든 사람이 스크린샷을 못 찍는다.
 *   보이는 부분을 떼어 두면 진짜 숫자를 넣어 그려 보고 확인할 수 있다.
 *   (사장님 규칙 — 우리 화면을 고치면 스크린샷으로 본다)
 */
import type { OurNumbers } from "@/lib/our-numbers";
import { maskEmail, OUR_ACCOUNTS } from "@/lib/our-numbers";

const 콤마 = (n: number) => n.toLocaleString("ko-KR");
const 짧게 = (d: Date | null) =>
  d ? d.toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : null;

function StatCard({ 제목, 값, 단위, 밑, 강조 }: { 제목: string; 값: string; 단위?: string; 밑: React.ReactNode; 강조?: boolean }) {
  return (
    <div className={`rounded-xl border bg-surface p-5 ${강조 ? "border-primary" : "border-border"}`}>
      <div className="text-xs font-bold text-muted-foreground">{제목}</div>
      <div className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
        {값}
        {단위 ? <span className="ml-1 text-sm font-semibold text-muted-foreground">{단위}</span> : null}
      </div>
      <div className="mt-1 text-xs leading-relaxed text-muted-foreground [word-break:keep-all]">{밑}</div>
    </div>
  );
}

export function StatsView({ n }: { n: OurNumbers }) {
  const 열린합 = n.열린것.산출물 + n.열린것.검수시나리오 + n.열린것.프리셋;
  const 최대 = Math.max(1, ...n.나날.map((d) => Math.max(d.가입, d.생성, d.검수, d.실패)));

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">우리 숫자</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground [word-break:keep-all]">
        {n.잰때.toLocaleString("ko-KR")} 기준입니다. 새로고침하면 다시 셉니다.
        <b className="text-foreground"> 우리 계정 {Object.keys(OUR_ACCOUNTS).length}개는 빼고</b> 손님만 센 수를 크게 뒀어요.
      </p>

      {/* ── 사장님이 물으신 여섯 ─────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          제목="회원"
          값={콤마(n.회원.손님)}
          단위="명"
          강조
          밑={<>전체 {n.회원.전체}명 중 손님만<br />최근 7일 +{n.회원.이레} · 30일 +{n.회원.한달}</>}
        />
        <StatCard
          제목="AI팩 생성"
          값={콤마(n.만든것["AI팩 생성"].손님)}
          단위="건"
          강조
          밑={<>전체 {n.만든것["AI팩 생성"].전체}건{짧게(n.만든것["AI팩 생성"].마지막) ? <><br />마지막 {짧게(n.만든것["AI팩 생성"].마지막)}</> : null}</>}
        />
        <StatCard
          제목="생성 시도"
          값={n.시도.전체 === 0 ? "—" : 콤마(n.시도.전체)}
          단위={n.시도.전체 === 0 ? undefined : "건"}
          밑={
            n.시도.전체 === 0 ? (
              <>2026-08-25 부터 쌓입니다<br />아직 기록 없음</>
            ) : (
              <>성공 {n.시도.성공} · <b className="text-rose-700">실패 {n.시도.실패}</b></>
            )
          }
        />
        <StatCard
          제목="디자인 프리셋 생성"
          값={콤마(n.만든것["디자인 프리셋 생성"].손님)}
          단위="건"
          밑={<>전체 {n.만든것["디자인 프리셋 생성"].전체}건 · 프리셋이 든 프로젝트 {n.알맹이.프리셋만든것}개</>}
        />
        <StatCard
          제목="검수 시나리오 생성"
          값={콤마(n.만든것["검수 시나리오 생성"].손님)}
          단위="건"
          밑={<>전체 {n.만든것["검수 시나리오 생성"].전체}건 · 검수 자체는 {n.알맹이.검수돌린것}번 돌았어요</>}
        />
        <StatCard
          제목="다운로드"
          값={콤마(n.만든것["다운로드"].손님)}
          단위="건"
          밑={
            <>
              전체 {n.만든것["다운로드"].전체}건 · 지금 열려 있는 것 {열린합}건
              <br />
              산출물 {n.열린것.산출물} · 검수 {n.열린것.검수시나리오} · 프리셋 {n.열린것.프리셋} · 판매팩 {n.열린것.판매팩}
            </>
          }
        />
      </div>

      {/* ── 생성이 왜 실패했나 — 있을 때만 ─────────────────
          까닭이 안 보이면 「실패 3건」이라는 숫자만 남아 아무것도 못 한다.
          key-dead 는 손님이 다시 눌러도 안 되는 것이라 그날 안에 손을 써야 한다. */}
      {n.실패까닭.length > 0 ? (
        <div className="mt-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm leading-relaxed text-rose-950 [word-break:keep-all]">
          <b>⛔ 생성이 실패한 까닭</b>
          <ul className="mt-2 space-y-1">
            {n.실패까닭.map((r) => (
              <li key={r.까닭}>
                <b className="tabular-nums">{r.건수}건</b> — {r.까닭}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* ── 숫자를 잘못 읽지 않게 ─────────────────────────── */}
      <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 [word-break:keep-all]">
        <b>⚠ 숫자를 읽을 때</b>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5">
          <li>
            <b>생성 시도</b>는 2026-08-25 부터만 쌓입니다. 그 전에 「눌렀는데 실패한 것」은 아무 데도 안 남아서 셀 길이 없어요.{" "}
            <b>0 이라고 실패가 없었던 게 아닙니다.</b>
          </li>
          <li>
            옛 기록은 <code className="rounded bg-amber-100 px-1">설계도 생성</code>, 새 기록은{" "}
            <code className="rounded bg-amber-100 px-1">AI팩 생성</code> 으로 이름이 다릅니다. 이 화면은 <b>둘 다</b> 셉니다.
          </li>
          <li>
            <b>다운로드</b>는 두 숫자가 다릅니다. 「받아 간 횟수」는 크레딧 원장에서 세고(지워도 남습니다), 「지금 열려 있는 것」은
            잠금 표에서 셉니다. <b>프로젝트를 지우면 잠금은 같이 사라지고 원장만 남아</b> 원장 쪽이 더 큽니다.
          </li>
        </ol>
      </div>

      {/* ── 손님이 어디까지 갔나 ──────────────────────────────
          ⛔ 「프로젝트 5개」가 「다섯 번 만들었다」로 읽히던 것을 막는다.
             만들기를 누르면 빈 프로젝트가 «공짜로» 생긴다 — 그건 만든 게 아니다.
             (2026-08-25 사장님 지적: 「생성을 안 눌렀는데 왜 카운팅되는건데」) */}
      <h2 className="mt-10 border-t-2 border-foreground pt-5 text-lg font-bold text-foreground">
        손님이 어디까지 갔나
      </h2>
      <p className="mt-1 text-sm text-muted-foreground [word-break:keep-all]">
        위에서 아래로 내려가면서 줄어듭니다. <b className="text-foreground">크레딧은 맨 아래 「생성됨」에서만 빠집니다.</b>
      </p>
      <div className="mt-3 space-y-1.5">
        {[
          { 이름: "① 「AI팩 만들기」를 눌렀다", 값: n.깔때기.만들기누름, 풀이: "빈 프로젝트가 생깁니다 · 공짜" },
          { 이름: "② 「생성」을 눌렀다", 값: n.깔때기.생성누름, 풀이: "2026-08-25 부터 셉니다" },
          { 이름: "③ 생성 완료", 값: n.깔때기.생성됨, 풀이: "메뉴·화면이 생기고 크레딧이 빠집니다", 끝: true },
        ].map((칸) => {
          const 폭 = n.깔때기.만들기누름 > 0 ? Math.max(4, (칸.값 / n.깔때기.만들기누름) * 100) : 4;
          return (
            <div key={칸.이름} className="flex items-center gap-3">
              <div className="w-52 shrink-0 text-sm font-semibold text-foreground [word-break:keep-all]">{칸.이름}</div>
              <div className="h-8 flex-1 rounded-lg bg-muted/40">
                <div
                  className={`flex h-8 items-center rounded-lg px-2.5 ${칸.끝 ? "bg-primary" : "bg-teal-600"} ${칸.값 === 0 ? "opacity-25" : ""}`}
                  style={{ width: `${폭}%` }}
                >
                  <span className="text-sm font-extrabold tabular-nums text-white">{콤마(칸.값)}</span>
                </div>
              </div>
              <div className="hidden w-56 shrink-0 text-xs text-muted-foreground sm:block [word-break:keep-all]">{칸.풀이}</div>
            </div>
          );
        })}
      </div>

      {/* ── 생성 불가 — 왜 못 만들었나 ─────────────────────
          「오류」와 「눌러 보지도 않고 나감」은 처방이 다르다.
          앞은 우리가 고칠 것이고, 뒤는 화면이 뭔가 막고 있는 것이다. */}
      <div className="mt-4 rounded-xl border border-border bg-surface p-5">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold text-muted-foreground">생성 불가</span>
          <span className="text-2xl font-extrabold tabular-nums text-foreground">{콤마(n.깔때기.생성불가)}</span>
          <span className="text-sm font-semibold text-muted-foreground">건</span>
        </div>
        {n.깔때기.불가사유.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">못 만든 것이 없습니다.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground [word-break:keep-all]">
            {n.깔때기.불가사유.map((r) => (
              <li key={r.까닭}>
                <b className="tabular-nums text-foreground">{r.건수}건</b> — {r.까닭}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── 검수 세 갈래 ─────────────────────────────────── */}
      <h2 className="mt-10 border-t-2 border-foreground pt-5 text-lg font-bold text-foreground">검수</h2>
      <p className="mt-1 text-sm text-muted-foreground [word-break:keep-all]">
        <b className="text-foreground">누름</b>은 [검수하기]를 누른 횟수, <b className="text-foreground">됨</b>은 결과가 나온 횟수입니다.
        ⚠ 누름은 2026-08-25 부터 셉니다 — 그 전 것은 「됨」만 있습니다.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {n.검수.map((v) => (
          <div key={v.갈래} className="rounded-xl border border-border bg-surface p-5">
            <div className="text-xs font-bold text-muted-foreground">{v.갈래}</div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold tabular-nums text-foreground">{콤마(v.됨)}</span>
              <span className="text-sm font-semibold text-muted-foreground">됨</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">[검수하기] 누름 {콤마(v.누름)}회</div>
          </div>
        ))}
      </div>

      {/* ── 손님이 적은 컨셉 ─────────────────────────────── */}
      <h2 className="mt-10 border-t-2 border-foreground pt-5 text-lg font-bold text-foreground">손님이 적은 컨셉</h2>
      <p className="mt-1 text-sm text-muted-foreground [word-break:keep-all]">
        무엇을 만들고 싶어 하셨는지가 여기 다 있습니다. 빈 것은 뺐어요.
      </p>
      {n.컨셉들.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
          아직 컨셉을 적은 손님이 없습니다.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {n.컨셉들.map((c, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="tabular-nums">{짧게(c.때)}</span>
                <span>{maskEmail(c.메일)}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${c.생성됨 ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-600"}`}
                >
                  {c.생성됨 ? "생성됨" : "여기서 멈춤"}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground [word-break:keep-all]">{c.컨셉}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── 실제로 만들어진 알맹이 ────────────────────────── */}
      <h2 className="mt-10 border-t-2 border-foreground pt-5 text-lg font-bold text-foreground">
        손님이 만든 알맹이
      </h2>
      <p className="mt-1 text-sm text-muted-foreground [word-break:keep-all]">
        큰 수는 <b className="text-foreground">손님 것만</b>입니다. 괄호 안은 우리 것까지 넣은 전체예요.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          제목="만들기를 누른 횟수"
          값={콤마(n.알맹이.프로젝트)}
          단위="번"
          밑={<>⚠ «만든 것»이 아닙니다 — 누르면 빈 프로젝트가 생깁니다<br />그중 생성까지 간 것 {n.알맹이.생성된프로젝트} · 전체 {콤마(n.알맹이.전체.프로젝트)}번</>}
        />
        <StatCard 제목="메뉴" 값={콤마(n.알맹이.메뉴)} 단위="개" 밑={<>AI 가 만든 메뉴 줄 수<br />전체 {콤마(n.알맹이.전체.메뉴)}개</>} />
        <StatCard 제목="화면" 값={콤마(n.알맹이.화면)} 단위="장" 밑={<>AI 가 만든 화면 줄 수<br />전체 {콤마(n.알맹이.전체.화면)}장</>} />
        <StatCard
          제목="검수 돌린 것"
          값={콤마(n.알맹이.검수돌린것)}
          단위="번"
          밑={<>사이트 {n.알맹이.검수사이트} · 문서 {n.알맹이.검수문서}<br />전체 {콤마(n.알맹이.전체.검수돌린것)}번</>}
        />
      </div>

      {/* ── 최근 30일 ─────────────────────────────────────── */}
      <h2 className="mt-10 border-t-2 border-foreground pt-5 text-lg font-bold text-foreground">최근 30일 — 손님 것만</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-surface p-4">
        <div className="flex h-32 min-w-[620px] items-end gap-[3px]">
          {n.나날.map((d) => {
            const 칸 = (v: number, 색: string, 이름: string) =>
              v ? (
                <i
                  key={이름}
                  title={`${d.날짜} ${이름} ${v}`}
                  style={{ height: `${Math.round((v / 최대) * 100)}%` }}
                  className={`block w-1.5 min-h-[10px] rounded-t-sm ${색}`}
                />
              ) : null;
            return (
              <div key={d.날짜} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <div className="flex flex-1 w-full items-end justify-center gap-px">
                  {칸(d.가입, "bg-teal-600", "가입")}
                  {칸(d.생성, "bg-primary", "생성")}
                  {칸(d.검수, "bg-amber-700", "검수")}
                  {칸(d.실패, "bg-rose-700", "실패")}
                </div>
                <span className="h-5 origin-center -rotate-[58deg] whitespace-nowrap text-[9px] text-muted-foreground">
                  {d.날짜.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-teal-600" />가입</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-primary" />AI팩 생성</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-amber-700" />검수</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-rose-700" />생성 실패</span>
        </div>
      </div>

      {/* ── 요즘 있었던 일 ────────────────────────────────── */}
      <h2 className="mt-10 border-t-2 border-foreground pt-5 text-lg font-bold text-foreground">요즘 있었던 일 — 손님 것만</h2>
      <p className="mt-1 text-sm text-muted-foreground [word-break:keep-all]">
        지금은 하루 몇 건이라 숫자보다 이쪽이 더 잘 읽힙니다. <b className="text-foreground">우리가 시험한 줄은 뺐습니다.</b>
      </p>
      <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 text-xs text-muted-foreground">
              <th className="px-3 py-2 text-right font-bold">언제</th>
              <th className="px-3 py-2 text-left font-bold">누가</th>
              <th className="px-3 py-2 text-left font-bold">무슨 일</th>
            </tr>
          </thead>
          <tbody>
            {n.있었던일.map((e, i) => (
              <tr key={i} className={`border-t border-border ${e.우리 ? "text-muted-foreground" : ""}`}>
                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{짧게(e.때)}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  {maskEmail(e.메일)}{" "}
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${e.우리 ? "bg-slate-100 text-slate-600" : "bg-teal-100 text-teal-800"}`}>
                    {e.우리 ? "우리" : "손님"}
                  </span>
                </td>
                <td className={`px-3 py-2 [word-break:keep-all] ${e.갈래 === "fail" ? "font-bold text-rose-700" : ""}`}>{e.일}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {n.있었던일.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
          아직 아무 일도 없습니다.
        </p>
      ) : null}

      {/* ── 계정 ──────────────────────────────────────────── */}
      <h2 className="mt-10 border-t-2 border-foreground pt-5 text-lg font-bold text-foreground">계정 — 누가 우리 것이고 누가 손님인가</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 text-xs text-muted-foreground">
              <th className="px-3 py-2 text-left font-bold">메일</th>
              <th className="px-3 py-2 text-left font-bold">누구</th>
              <th className="px-3 py-2 text-right font-bold">가입</th>
              <th className="px-3 py-2 text-right font-bold">프로젝트</th>
              <th className="px-3 py-2 text-right font-bold">메뉴</th>
              <th className="px-3 py-2 text-right font-bold">쓴 크레딧</th>
            </tr>
          </thead>
          <tbody>
            {n.계정들.map((u) => (
              <tr key={u.메일} className={`border-t border-border ${u.우리 ? "text-muted-foreground" : ""}`}>
                <td className="whitespace-nowrap px-3 py-2">{maskEmail(u.메일)}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${u.우리 ? "bg-slate-100 text-slate-600" : "bg-teal-100 text-teal-800"}`}>
                    {u.우리 ? `우리 것 · ${u.우리}` : "손님"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">{u.가입때.toLocaleDateString("ko-KR")}</td>
                <td className="px-3 py-2 text-right tabular-nums">{u.프로젝트}</td>
                <td className="px-3 py-2 text-right tabular-nums">{u.메뉴}</td>
                <td className="px-3 py-2 text-right tabular-nums">{콤마(u.쓴크레딧)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 [word-break:keep-all]">
        <b>토스(카드사) 심사용</b>은 심사관에게 넘기려고 만든 아이디·비밀번호 계정입니다. 우리는 소셜 로그인만 받는데
        심사관은 다른 회사·다른 지역에서 접속해 2단계 인증에 막히거든요 — 그러면 「결제창이 확인되지 않는다」로 반려됩니다.{" "}
        <b>심사가 끝나면 이 계정은 지웁니다.</b> (크몽은 결제를 크몽이 처리해서 심사 계정이 따로 없어요.)
        <div className="mt-2">
          우리 계정을 새로 만들면 <code className="rounded bg-amber-100 px-1">lib/our-numbers.ts</code> 의{" "}
          <code className="rounded bg-amber-100 px-1">OUR_ACCOUNTS</code> 에 <b>반드시 적으세요.</b> 안 적으면 손님이 한 명 늘어난 것처럼 보입니다.
        </div>
      </div>

      {/* ── 용어 ──────────────────────────────────────────
          말이 겹치면 숫자를 잘못 읽는다. 여기 한 번 적어 두면 다시 안 헷갈린다. */}
      <h2 className="mt-10 border-t-2 border-foreground pt-5 text-lg font-bold text-foreground">이 화면의 말</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 text-xs text-muted-foreground">
              <th className="px-3 py-2 text-left font-bold">말</th>
              <th className="px-3 py-2 text-left font-bold">무슨 뜻</th>
              <th className="px-3 py-2 text-left font-bold">크레딧</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["만들기를 누름", "「AI팩 만들기」를 누르면 그 자리에서 «빈» 프로젝트가 하나 생깁니다. 컨셉도 아직 없습니다.", "안 빠짐"],
              ["컨셉을 적음", "그 프로젝트에 손님이 글을 적었습니다. 저장해도 값은 안 듭니다.", "안 빠짐"],
              ["생성을 누름", "「생성」 버튼을 눌렀습니다. 성공이든 실패든 기록이 한 줄 남습니다.", "성공했을 때만"],
              ["생성됨", "AI 가 메뉴·화면을 만들어 냈습니다. 여기서 크레딧이 빠집니다.", "빠짐"],
              ["AI팩", "손님이 받는 결과물 전체를 부르는 이름입니다 — 화면목록·기능정의서·프리셋·검수 시나리오까지.", "—"],
            ].map(([말, 뜻, 크레딧]) => (
              <tr key={말} className="border-t border-border">
                <td className="whitespace-nowrap px-3 py-2 font-bold text-foreground">{말}</td>
                <td className="px-3 py-2 text-muted-foreground [word-break:keep-all]">{뜻}</td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{크레딧}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 [word-break:keep-all]">
        ⛔ 그래서 <b>「프로젝트 5개」는 «다섯 번 만들었다»가 아닙니다.</b> 「만들기를 다섯 번 눌렀다」는 뜻이에요.
        실제로 만들어진 것은 맨 위 깔때기의 <b>맨 아래 칸</b>입니다.
      </div>

      <p className="mt-10 border-t border-border pt-4 text-xs text-muted-foreground [word-break:keep-all]">
        손님 메일은 가려서 보여 줍니다. 이 화면은 사장님 계정으로만 열립니다 — 남에게는 없는 페이지입니다.
      </p>
    </div>
  );
}
