/* VS 실측 예약 — 부모 화면 4장. 쇼핑몰 예약 기능으로는 안 되는 자리(방문 날짜를 잡는다). */
import * as U from './ui.mjs';
import { SITE, FLAGSHIP } from './data.mjs';

/* ---------------- VS0101 방문 실측 예약 ---------------- */
function VS0101() {
  const body = `
${U.pageHd('방문 실측 예약', '실측은 40분에서 1시간 걸려요. 방문비는 받지 않습니다.')}
<div class="split-r">
  <div>
    ${/* ⛔ 2026-09-02: 달력과 시간대는 «켜짐»이 제대로 도는데 고른 것을 아무 데도 안 알렸다.
         요약에도 없고 다음 화면에도 안 갔다. 예약에서 가장 중요한 둘이다.
         app.js 의 실측예약() 이 data-visit-pick 안의 누름을 읽어 요약과 손잡이를 채운다. */''}
    ${U.card('날짜 고르기', `<div data-visit-pick="날짜" data-visit-month="9">${U.calendar({ sel: 15, month: '2026년 9월' })}</div>`)}
    ${U.card('시간대', `<div data-visit-pick="시간">${U.slots({})}</div>`, { cls: 'mt4' })}
  </div>
  <div class="sticky">
    ${U.card('예약 요약', `
      ${/* ④ 예약 요약에 «날짜와 시간»이 없었다. 주소·연락처는 있는데 그 둘만 없었다. */''}
      <dl class="kv mb4"><dt>날짜</dt><dd data-visit-out="날짜">9월 15일 (화)</dd>
        <dt>시간</dt><dd data-visit-out="시간">14:00</dd></dl>
      <div class="field"><label class="lb">주소</label><input class="input" placeholder="우편번호 찾기 + 상세주소"></div>
      <div class="field"><label class="lb">동·호수</label><input class="input" placeholder="101동 1203호"></div>
      <div class="field"><label class="lb">연락처</label><input class="input" placeholder="010-0000-0000"></div>
      <div class="field"><label class="lb">현장 상황</label>
        <div class="radios-h">${['거주 중', '비어 있음', '짐만 있음'].map((s, i) => `<label class="radio${i === 0 ? ' on' : ''}"><input type="radio" name="site-state">${s}</label>`).join('')}</div></div>
      ${/* ⑤ 견적에서 «부분 시공»을 골라 와도 여기서는 늘 「전체시공」이라고 말했다.
           app.js 의 실측예약() 이 주소로 온 조건으로 이 글자를 고쳐 준다. */''}
      <div class="field"><label class="lb">연결할 견적</label><select class="input" data-visit-est><option data-visit-est-first>${FLAGSHIP.addr.split(' ')[1]} ${FLAGSHIP.area}평 ${FLAGSHIP.scope} (EST-20260817-0042)</option></select></div>
      ${U.banner('mut', 'ℹ️', '실측은 40분에서 1시간 걸려요. 하루 전까지 연락 주시면 바꿔 드려요.')}
      <div class="mt4">${U.btn('예약하기', { href: 'VS0201', cls: 'btn-primary btn-block btn-lg', attr: ' data-visit-go' })}</div>`)}
  </div>
</div>`;
  return { body, o: {} };
}

/* ---------------- VS0201 예약 내용 확인 ---------------- */
function VS0201() {
  const body = `
${U.pageHd('이대로 예약할까요?')}

${U.sec('', U.table(['항목', '내용', ''], [
    ['날짜·시간', '<span data-visit-in="날짜">9월 15일 (화)</span> <span data-visit-in="시간">14:00</span>', U.btn('고치기', { cls: 'btn-ghost btn-sm', href: 'VS0101' })],
    ['주소', '서울 성동구 성수동1가 101동 1203호', U.btn('고치기', { cls: 'btn-ghost btn-sm', href: 'VS0101' })],
    ['연락처', '010-1234-5678', U.btn('고치기', { cls: 'btn-ghost btn-sm', href: 'VS0101' })],
    ['현장 상황', '거주 중', U.btn('고치기', { cls: 'btn-ghost btn-sm', href: 'VS0101' })],
    ['연결한 견적', '<span data-visit-in="견적">EST-20260817-0042</span>', ''],
  ]))}

${U.sec('방문하는 담당자', U.card('', `<div class="row-c">${U.ph('담당자', 'ph-ava', SITE.owner.name)}
  <div><b>${U.esc(SITE.owner.name)}</b><div class="t-sub">현장 경력 11년</div><p class="t-sub mt1">"실측 꼼꼼히 재고 궁금한 점 다 알려드릴게요."</p></div></div>`))}

${U.sec('실측 때 이런 걸 해요', U.hsteps(['치수 재기', '배관·전기 상태 확인', '요구사항 듣기'], -1))}

${U.sec('준비해 주시면 좋아요', `<ul class="list-plain">${['도면이 있으면 미리 보여주기', '바꾸고 싶은 곳 사진 찍어 두기', '예산 범위 정리해 두기'].map((t) => `<li>· ${t}</li>`).join('')}</ul>`)}

${U.sec('', U.agreeScope(`
  ${U.agreeCheck('개인정보 수집·이용에 동의합니다 <a class="btn-link" style="margin-left:6px">전문 보기</a>', 'vs-confirm-btn')}
  <p class="t-sub mt2">방문 하루 전까지는 무료로 바꾸거나 취소하실 수 있어요.</p>`))}

<div class="center mt6">${U.btn('예약 확정', { href: 'VS0301', cls: 'btn-primary btn-lg', id: 'vs-confirm-btn', off: true })}</div>`;
  return { body, o: {} };
}

/* ---------------- VS0301 예약 완료 ---------------- */
function VS0301() {
  const body = U.result('ok', '✓', '실측 예약이 잡혔어요', '예약번호 VST-20260817-0031')
    + `<div class="center"><div class="t-page" style="font-size:30px">9월 15일 (화) 오후 2시</div></div>`
    + U.sec('', U.card('', `<div class="row-c">${U.ph('담당자', 'ph-ava', SITE.owner.name)}
      <div><b>${U.esc(SITE.owner.name)}</b><div class="t-sub">010-2255-1600</div></div></div>
      <div class="btns mt3">${U.btnSay('문자 보내기', '담당자에게 문자를 보냈어요')}</div>`))
    + `<div class="center mt4">${U.btnSay('내 캘린더에 담기', '캘린더에 담았어요')}</div>
       <p class="t-sub center mt2">전날 오전에 확인 문자를 보내 드려요</p>`
    + U.sec('실측 뒤에는 이렇게 이어져요', U.hsteps(['확정 견적서 받기(2일 안)', '계약서 검토·서명', '착공일 잡기'], -1))
    + `<div class="center btns mt4" style="justify-content:center">${U.btn('예약 바꾸기', { href: 'VS0401', cls: 'btn-ghost btn-sm' })}${U.btn('예약 취소', { href: 'VS0401', cls: 'btn-ghost btn-sm' })}</div>`
    + U.sec('기다리는 동안', `<div class="g2">${[['비슷한 사례 보기', 'CS0101'], ['자재 미리 골라두기', 'CS0401']].map(([t, h]) => `<a class="box center" href="${U.link(h)}"><b>${t}</b></a>`).join('')}</div>`)
    + U.accordion([{ q: '오시는 길', a: `${U.ph('지도', 'ph-169', 'map')}<p class="t-sub mt2">주차는 지하 1층 방문객 구역을 이용해 주세요.</p>` }]);
  return { body, o: {} };
}

/* ---------------- VS0401 예약 변경·취소 ---------------- */
function VS0401() {
  const body = `
${U.pageHd('예약 변경·취소')}
${U.sec('지금 예약', U.banner('mut', '📅', '<b>9월 15일 (화) 오후 2시</b><div class="t-sub mt1">성동구 성수동1가 101동 1203호</div>'))}

${U.sec('', `<div class="g2">
  <a class="box center" href="${U.link('VS0301')}"><b>날짜만 바꾸기</b><p class="t-sub mt1">달력에서 새 날짜를 고릅니다</p></a>
  <a class="box center" href="${U.link('HO0101')}"><b>예약 취소하기</b><p class="t-sub mt1">사유를 고르고 취소합니다</p></a>
</div>`)}

${U.sec('날짜 바꾸기', U.calendar({ sel: 18, month: '2026년 9월' }) + `<div class="box mt3">9월 15일 오후 2시 → <b class="pri">9월 18일 오전 11시</b></div>`)}

${U.sec('취소하기', `<div class="radios">${['일정이 안 맞아요', '공사를 미루기로 했어요', '다른 업체로 정했어요', '기타'].map((s, i) => `<label class="radio${i === 0 ? ' on' : ''}"><input type="radio" name="cancel-reason">${s}</label>`).join('')}</div>
  <textarea class="input mt3" placeholder="자세한 사유를 적어 주세요(선택)"></textarea>`)}

${U.sec('', U.banner('mut', 'ℹ️', '하루 전까지는 여기서 바로 바꾸실 수 있어요. 방문 당일에는 전화로 연락 주세요.'))}

<div class="btns mt6">${U.btn('이대로 바꾸기', { href: 'VS0301', cls: 'btn-primary btn-lg' })}${U.btn('예약 취소하기', { href: 'HO0101', cls: 'btn-danger btn-lg' })}</div>`;
  return { body, o: {} };
}

export const PAGES = { VS0101, VS0201, VS0301, VS0401 };
