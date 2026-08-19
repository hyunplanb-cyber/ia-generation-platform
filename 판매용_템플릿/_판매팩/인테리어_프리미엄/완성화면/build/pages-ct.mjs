/* CT 계약·결제 — 부모 화면 4장. 확정 견적에 서명하고 돈을 나누어 낸다. */
import * as U from './ui.mjs';
import { FLAGSHIP, won } from './data.mjs';

/* ---------------- CT0101 계약서 확인·서명 ---------------- */
function CT0101() {
  const body = `
${U.pageHd('계약서 확인·서명')}

${U.sec('실측으로 금액이 이렇게 바뀌었어요', U.table(['', '금액'], [
    ['처음 견적', won(FLAGSHIP.totalFirst)], ['확정 견적', won(FLAGSHIP.total)], ['차이', `+${won(FLAGSHIP.diff)}`],
  ]) + `<ul class="list-plain mt3">${['배관 노후로 교체 (+90만원)', '단열 보강 (+50만원)', '폐기물 증가 (+30만원)'].map((t) => `<li>· ${t}</li>`).join('')}</ul>`)}

${U.sec('계약서 조항', U.accordion([
    { q: '공사 범위', a: '아파트 전체 시공 — 거실·주방·욕실·침실·현관 전체 철거 후 재시공.' },
    { q: '공사 기간', a: `착공 ${FLAGSHIP.start} ~ 준공 ${FLAGSHIP.end} (${FLAGSHIP.days}일, 주말 제외).` },
    { q: '계약 금액', a: `총 ${won(FLAGSHIP.total)} (부가세 포함).` },
    { q: '대금 지급 시기', a: '계약금 10% · 착공금 30% · 중도금 40% · 잔금 20%.' },
    { q: '지체상금', a: '업체 귀책으로 공사가 지연될 경우 1일당 계약금액의 0.1%를 배상합니다.' },
    { q: '하자보수', a: '준공 후 1년간 무상 하자보수. 방수·설비는 2년.' },
    { q: '계약 해지', a: '착공 전 해지 시 계약금의 10%를 위약금으로 공제 후 환급합니다.' },
  ]))}

${U.sec('첨부', `<div class="g3">${[
    ['평면 도면', 'ph-a4'], ['자재 목록', 'ph-a4'], ['공정표', 'ph-a4'],
  ].map(([t, c]) => `<div>${U.ph(t, c, t)}<div class="center mt2">${U.btn('크게 보기', { cls: 'btn-ghost btn-sm' })}</div></div>`).join('')}</div>`)}

${U.sec('대금 지급', U.table(['회차', '금액', '예정일'], FLAGSHIP.billing.map((b) => [b[0] + (b[0] === '계약금' ? '(오늘)' : ''), won(b[2]), b[3]])))}

${U.sec('서명', U.sigpad({}))}

${U.sec('', U.agreeScope(`
  ${U.agreeCheckAll('계약 조건에 동의합니다')}
  ${U.agreeCheckAll('개인정보 처리에 동의합니다')}
  ${U.agreeCheckAll('전자서명에 동의합니다')}
  <div class="mt4">${U.btn('계약하고 계약금 결제', { href: 'CT0201', cls: 'btn-primary btn-lg btn-block', unlockAll: true, off: true })}</div>`))}

<div class="center mt4">${U.btn('계약서 PDF 내려받기', { cls: 'btn-ghost' })}</div>`;
  return { body, o: {} };
}

/* ---------------- CT0201 계약금 결제 ---------------- */
function CT0201() {
  const first = FLAGSHIP.billing[0];
  const body = `
${U.sec('', `<div class="t-page" style="font-size:28px">계약금 ${won(first[2])}</div>`)}

${U.sec('', U.steps(['계약금(지금)', '착공금', '중도금', '잔금'], 0))}

${U.sec('결제 수단', U.tabBox(
    U.tabs([{ label: '신용카드', pane: 'card' }, { label: '계좌이체', pane: 'transfer' }, { label: '무통장입금', pane: 'noacc' }], 0),
    U.pane('card', `
      <div class="field"><label class="lb">카드사</label><select class="input"><option>신한카드</option><option>삼성카드</option><option>국민카드</option></select></div>
      ${/* ⚠ 할부 개월을 골라도 옆이 그대로였다(2026-08-18, 디럭스 CT-02 와 같은 자리).
            acts: 「할부 개월 고르기 → 옆에 월 납입액이 계산되어 뜬다」 */''}
      <div class="field"><label class="lb">할부 개월</label><select class="input" data-halbu data-amt="3410000"><option>일시불</option><option selected>6개월</option><option>3개월</option></select></div>
      <p class="t-sub" data-halbu-out>6개월 — 월 568,333원 · 6개월까지 무이자입니다.</p>`, true) +
    U.pane('transfer', `<p class="t-body">아래 계좌로 입금해 주세요.</p>${U.kv([['은행', '국민은행'], ['계좌번호', '123456-04-123456'], ['예금주', '(주)마루공방']])}`, false) +
    U.pane('noacc', `<p class="t-body">입금자명을 주문자명과 동일하게 넣어 주세요.</p>${U.kv([['은행', '국민은행'], ['계좌번호', '123456-04-123456']])}`, false),
  ))}

${U.sec('', `<div class="radios-h">${['현금영수증', '세금계산서', '발급 안 함'].map((s, i) => `<label class="radio${i === 0 ? ' on' : ''}"><input type="radio" name="receipt">${s}</label>`).join('')}</div>
  <div class="field mt3"><label class="lb">현금영수증 번호</label><input class="input" placeholder="휴대폰 번호 또는 사업자번호"></div>`)}

<div class="split-r mt6">
  <div>${U.banner('mut', '🔒', '공사 전 계약금은 10%를 넘지 않습니다.')}</div>
  <div class="sticky">${U.card('확인 요약', U.kv([['현장 주소', '성동구 성수동1가'], ['총 계약금액', won(FLAGSHIP.total)], ['이번 결제액', won(first[2])], ['다음 결제', `${FLAGSHIP.billing[1][3]} 착공금 ${won(FLAGSHIP.billing[1][2])}`]]))}</div>
</div>

<div class="center mt6">${U.btn(`${won(first[2])} 결제하기`, { href: 'CT0301', cls: 'btn-primary btn-lg' })}</div>`;
  return { body, o: {} };
}

/* ---------------- CT0301 결제 완료 - 계약 성사 ---------------- */
function CT0301() {
  const body = U.result('ok', '✓', '계약이 성사됐어요', '계약번호 CTR-20260817-0018')
    /* ⚠ 달력에서 날짜를 눌러도 위 안내 문구가 그대로였다(2026-08-18).
          acts: 「착공일 고르기 → 고르면 위 안내 문구의 날짜가 바뀐다」 */
    + `<div class="center"><p class="t-body">이제 공사가 시작됩니다 · 착공 예정일 <b data-chakgong-out>${FLAGSHIP.start}</b></p></div>`
    + U.sec('착공일 고르기', `<div data-chakgong data-month="2026년 9월">${U.calendar({ sel: 10, month: '2026년 9월' })}</div><p class="t-sub mt2">착공일 5일 전까지는 바꾸실 수 있어요.</p>`)
    + U.sec('남은 대금 일정', U.table(['회차', '금액', '예정일', '상태'], FLAGSHIP.billing.slice(1).map((b) => [b[0], won(b[2]), b[3], U.badge(b[4], b[4] === '수금 완료' ? 'b-ok' : 'b-mut')])))
    + `<div class="btns mt4">${U.btn('계약서 내려받기', { cls: 'btn-ghost' })}${U.btn('영수증 보기', { cls: 'btn-ghost' })}</div>`
    + U.sec('담당 현장소장', U.card('', `<div class="row-c">${U.ph('현장소장', 'ph-ava', 'manager')}
      <div><b>${U.esc(FLAGSHIP.manager)}</b><div class="t-sub">010-2255-1600</div><p class="t-sub mt1">매일 저녁 사진으로 알려 드려요.</p></div></div>`))
    + U.sec('착공 전에 준비해 주세요', `<div class="checks">${['짐 빼기', '관리사무소에 공사 신고', '엘리베이터 사용 예약', '이웃에 인사'].map((t) => `<label class="check"><input type="checkbox">${t}</label>`).join('')}</div>`)
    + `<div class="center mt6">${U.btn('공사 진행 보기', { href: 'PR0101', cls: 'btn-primary btn-lg' })}</div>`;
  return { body, o: {} };
}

/* ---------------- CT0401 결제 실패 ---------------- */
function CT0401() {
  const body = U.result('warn', '!', '결제가 되지 않았어요', '결제 금액은 빠져나가지 않았습니다')
    + U.sec('', U.banner('danger', '⚠️', '<b>카드 한도를 넘었습니다 (코드 F-2201)</b>', { right: U.btn('자세히', { cls: 'btn-ghost btn-sm' }) }))
    + U.sec('이렇게 해 보세요', `<ul class="list-plain">${['한도를 확인하고 다시 시도', '다른 카드로 결제', '계좌이체로 결제'].map((t) => `<li>· ${t}</li>`).join('')}</ul>`)
    + `<div class="btns">${U.btn('다시 시도하기', { href: 'CT0201', cls: 'btn-primary' })}${U.btn('다른 수단으로 내기', { href: 'CT0201', cls: 'btn-ghost' })}</div>`
    + U.sec('', U.banner('mut', 'ℹ️', '계약은 아직 살아 있어요. 8월 20일까지 결제하시면 됩니다.'))
    + U.sec('무통장입금으로 바꾸기', U.kv([['은행', '국민은행'], ['계좌번호', '123456-04-123456'], ['예금주', '(주)마루공방']]))
    + `<div class="center mt6">${U.btn('전화 상담 1600-2255', { cls: 'btn-ghost' })}<p class="t-sub mt2">평일 09:00~18:00</p></div>`;
  return { body, o: {} };
}

export const PAGES = { CT0101, CT0201, CT0301, CT0401 };
