/* VS 실측 예약 (4) — 쇼핑몰 예약 기능으로는 안 되는 자리 */
import * as U from './ui.mjs';

export const PAGES = {};

function calGrid(selDay) {
  const dow = ['일', '월', '화', '수', '목', '금', '토'];
  const 앞빈칸 = 6; // 9월 1일은 화요일이라고 가정 — 앞 두 칸만 비우면 되지만 예시로 여유있게
  const days = [];
  /* ⚠ 이 격자는 «칸 사이 1px 틈 + 격자 배경색»으로 줄을 흉내 낸다. 그래서 칸이
     안 덮은 자리는 그대로 회색 덩어리가 된다. 앞뒤 빈 칸을 visibility:hidden 으로
     두었더니 아무것도 안 칠해져 9월 1일 앞과 30일 뒤가 회색으로 뭉쳐 보였다
     (2026-08-18 사장님 지적). 빈 칸도 «흰 칸»으로 채워 둔다. */
  for (let i = 0; i < 2; i++) days.push('<div class="cal-d cal-blank" aria-hidden="true"></div>');
  for (let d = 1; d <= 30; d++) {
    const 지남 = d < 3;
    const 자리적음 = [3, 8, 15].includes(d);
    const 꽉참 = [5, 12, 19, 26].includes(d) && d % 7 === 5;
    const cls = ['cal-d'];
    let disabled = 지남;
    if (지남) cls.push('past');
    else if (d === selDay) cls.push('sel');
    else if (자리적음) cls.push('few');
    /* data-day/data-dow 를 실어야 누를 때 오른쪽 요약의 날짜를 그 날로 고쳐 쓸 수 있다.
       자리 수도 같이 실어 아래 시간대를 그 날 것으로 바꿔 그린다. */
    const 요일 = dow[(d + 1) % 7];
    days.push(`<button class="${cls.join(' ')}" type="button"${disabled ? ' disabled' : ''} aria-label="9월 ${d}일" data-day="${d}" data-dow="${요일}" data-few="${자리적음 ? '1' : ''}">
      <span class="dd">${d}</span>${!지남 ? `<span class="n">${자리적음 ? '1자리' : '4자리'}</span>` : ''}
    </button>`);
  }
  // 마지막 주도 일곱 칸을 채운다 — 남겨 두면 그 자리가 회색으로 남는다
  while ((days.length % 7) !== 0) days.push('<div class="cal-d cal-blank" aria-hidden="true"></div>');

  return `<div class="cal-hd">
    <button class="cal-mv" type="button" data-mv="-1" aria-label="이전 달" disabled>‹</button>
    <span class="cal-m">2026년 9월</span>
    <button class="cal-mv" type="button" data-mv="1" aria-label="다음 달">›</button>
  </div>
  <div class="cal-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--r-card);overflow:hidden">
    ${dow.map((w) => `<div class="hd" style="background:var(--surface);text-align:center;padding:8px 0;font-size:var(--fs-th);color:var(--muted)">${w}</div>`).join('')}
    ${days.join('')}
  </div>`;
}

PAGES['VS-01'] = () => ({
  body: `${U.pageHd('방문 실측 예약', '')}

${U.detail2(
    U.card('', calGrid(3)) + U.sec('', `<p class="t-sub mb2"><b data-cal-picked>9월 3일 (목)</b>에 가능한 시간이에요</p>
    <div class="row wrap-row" style="gap:var(--sp-block)" data-slots>
      <button class="box slot on" type="button" data-time="09:00"><span class="badge b-ok">09:00 · 2자리 남음</span></button>
      <button class="box slot" type="button" data-time="11:00"><span class="badge b-ok">11:00 · 3자리 남음</span></button>
      <button class="box slot" type="button" data-time="14:00" disabled style="opacity:.5"><span class="badge b-mut">14:00 · 마감</span></button>
      <button class="box slot" type="button" data-time="16:00"><span class="badge b-warn">16:00 · 1자리</span></button>
    </div>`),
    U.card('예약 요약', `
      <dl class="kv"><dt>날짜</dt><dd data-cal-picked>9월 3일 (목)</dd><dt>시간</dt><dd data-slot-picked>09:00</dd></dl>
      <div class="field mt4"><span class="lb">주소</span>${U.input({ ph: '우편번호 찾기' })}</div>
      <div class="field"><span class="lb">상세주소</span>${U.input({ ph: '동·호수' })}</div>
      <div class="field"><span class="lb">연락처</span>${U.input({ ph: '010-0000-0000', type: 'tel' })}</div>
      <div class="field"><span class="lb">지금 살고 계신가요?</span>${U.select(['거주 중', '비어 있음', '짐만 있음'])}</div>
      <div class="stack mt2">${U.check('엘리베이터 있음', { on: true, none: true })}${U.check('주차 가능', { none: true })}</div>
      <div class="field mt4"><span class="lb">연결할 견적</span>${U.select(['성동구 32평 전체시공 (9/16까지 유효)'])}</div>
      ${U.banner('info', 'ℹ', '실측은 40분에서 1시간 걸려요. 방문비는 받지 않습니다. 하루 전까지 연락 주시면 바꿔 드려요.', { cls: 'mt4' })}
      ${U.btn('예약하기', { cls: 'btn-pri btn-w', href: 'VS-02' })}
    `),
  )}`,
});

PAGES['VS-02'] = () => ({
  body: `${U.pageHd('예약 내용 확인', '이대로 예약할까요?')}

${U.table(['항목', '내용', ''], [
    ['날짜·시간', '9월 3일 (목) 오전 9시', { t: U.btn('고치기', { sm: true, href: 'VS-01' }), cls: 'r' }],
    ['주소', '성동구 왕십리로 000 101동 1203호', { t: U.btn('고치기', { sm: true, href: 'VS-01' }), cls: 'r' }],
    ['연락처', '010-0000-0000', { t: U.btn('고치기', { sm: true, href: 'VS-01' }), cls: 'r' }],
    ['현장 상황', '거주 중', { t: U.btn('고치기', { sm: true, href: 'VS-01' }), cls: 'r' }],
    ['연결한 견적', '성동구 32평 전체시공', { t: U.btn('고치기', { sm: true, href: 'VS-01' }), cls: 'r' }],
  ])}

${U.sec('방문하는 담당자', `${U.box(`<div class="row" style="gap:var(--sp-card-pad)">${U.av('김')}<div><div class="t-card">김현장 실장</div><div class="t-sub">현장 경력 11년 · 안녕하세요, 정확하게 재고 꼼꼼히 살펴보겠습니다.</div></div></div>`)}`, { cls: 'mt8' })}

${U.sec('실측 때 이런 걸 해요', U.steps([['치수 재기'], ['배관·전기 상태 확인'], ['요구사항 듣기']], 0), { cls: 'mt8' })}

${U.sec('준비해 주시면 좋아요', `<ul class="stack"><li>· 도면이 있으면 미리 보여 주세요</li><li>· 바꾸고 싶은 곳 사진을 찍어 두세요</li><li>· 예산 범위를 정리해 두세요</li></ul>`, { cls: 'mt8' })}

<div class="mt8">${U.check('개인정보 수집·이용에 동의합니다', { attr: ' data-unlock="btn-confirm"' })} <a class="more" style="margin-left:6px">전문 보기</a></div>

${U.sec('취소·변경 규정', `<p class="t-sub">하루 전까지는 온라인에서 바로 바꾸실 수 있어요. 당일 변경은 전화로 연락 주세요. 노쇼가 반복되면 예약이 제한될 수 있습니다.</p>`, { cls: 'mt6' })}

<div class="mt8">${U.btn('예약 확정', { cls: 'btn-pri btn-w', id: 'btn-confirm', off: true, href: 'VS-03' })}</div>`,
});

PAGES['VS-03'] = () => ({
  body: U.done('실측 예약이 잡혔어요', '예약번호 VST-20260817-0031',
    `${U.card('', `<div class="t-page pri" style="font-size:24px">9월 3일 (목) 오전 9시</div>
      <p class="t-sub mt2">성동구 ○○아파트 101동 1203호 · 전날 오전에 확인 문자를 보내 드려요.</p>
      <div class="box mt4"><div class="row" style="gap:var(--sp-card-pad)">${U.av('김')}<div class="grow"><div class="t-card">김현장 실장</div><div class="t-sub">010-0000-0000</div></div>${U.btn('문자 보내기', { sm: true, attr: ' data-toast="문자를 보냈어요" data-toast-kind="ok"' })}</div></div>
      <div class="btns mt4">${U.btn('내 캘린더에 담기', { attr: ' data-toast="캘린더에 담았어요" data-toast-kind="ok"' })}${U.btn('예약 바꾸기', { href: 'VS-04' })}${U.btn('예약 취소', { href: 'VS-04' })}</div>`)}

    ${U.sec('실측 뒤에는 이렇게 이어져요', U.steps([['확정 견적서 받기(2일 안)'], ['계약서 검토·서명'], ['착공일 잡기']], 0), { cls: 'mt8' })}

    ${U.sec('오시는 길', `${U.ph(['지도', 1200, 400], { seed: 'map' })}<p class="t-sub mt2">건물 앞 방문객 주차 2대 가능합니다.</p>`, { cls: 'mt8' })}`,
    `${U.card('기다리는 동안', `<div class="stack">
      <a class="box" href="${U.link('CS-01')}"><div class="t-card">비슷한 사례 보기</div><div class="t-sub mt1">같은 평수 시공 사진을 봅니다</div></a>
      <a class="box" href="${U.link('CS-04')}"><div class="t-card">자재 미리 골라두기</div><div class="t-sub mt1">실측 때 바로 상의할 수 있어요</div></a>
    </div>`)}`,
  ),
});

PAGES['VS-04'] = () => ({
  body: `${U.pageHd('예약 변경·취소', '')}

${/* ⚠ 아래 탭이 이 상자에 0px 로 붙어 있었다(2026-09-03). 감싸는 칸에 여백이 없었다. */''}
${U.box(`<div class="t-card">9월 3일 (목) 오전 9시 · 성동구 ○○아파트 101동 1203호</div>`)}

${U.tabBox(
    [{ label: '날짜만 바꾸기', pane: 'change' }, { label: '예약 취소하기', pane: 'cancel' }],
    `${U.pane('change', `${calGrid(8)}<div class="box mt4"><span class="t-sub">9월 3일 오전 9시 → </span><b data-cal-picked>9월 8일 (화)</b> <b data-slot-picked>오전 11시</b></div>${U.btn('이대로 바꾸기', { cls: 'btn-pri btn-w', href: 'VS-03' })}`, true)}
     ${U.pane('cancel', `
       <div class="stack">${['일정이 안 맞아요', '공사를 미루기로 했어요', '다른 업체로 정했어요', '기타'].map((r, i) => U.check(r, { on: i === 0, none: true })).join('')}</div>
       <div class="field mt3">${U.textarea({ ph: '자유롭게 적어 주세요' })}</div>
       <p class="t-sub mt3">취소는 되돌릴 수 없어요.</p>
       ${U.btn('예약 취소하기', { cls: 'btn-dan btn-w', href: 'HO-01' })}
     `)}`,
    0, { cls: 'mt6' },
  )}

${U.banner('info', 'ℹ', '하루 전까지는 여기서 바로 바꾸실 수 있어요. 방문 당일에는 전화로 연락 주세요.', { cls: 'mt6' })}`,
});
