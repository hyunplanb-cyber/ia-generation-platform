/* 예약하기(RE) — 4단계 흐름과 완료·실패·대기 */
import {
  ph, phFix, phAva, map, esc, won, num, min2h, link, stars, rateLine, badge, btn, chip, chips, tabs,
  sec, card, banner, empty, table, kv, sumRows, accordion, stat, progress, hsteps, modalEl, modalTpl,
  rateSummary, review, calendar, slots, shopRow, dzCard, menuRow, pageHd, stickBar, reStep, reSummary,
} from './ui.mjs';
import { SHOPS, DESIGNERS, MENUS, ALL_ITEMS, OPTIONS, COUPONS } from './data.mjs';

const S = SHOPS;
const shop = S[0];

/* 선택한 시술 두 건 — 4단계 내내 같은 값을 쓴다 */
const PICK = [ALL_ITEMS.find((x) => x.id === 'M07'), ALL_ITEMS.find((x) => x.id === 'M12')];
const PICK_MIN = 180 + 45;
const PICK_SUM = 165000 + 55000;

const shopStrip = () => `<div class="hcard mb6">
  ${phFix(['매장 대표', 1200, 900], 96, { seed: shop.id })}
  <div class="grow"><b>${shop.nm}</b><p class="t-sub">${shop.area} · ${stars(shop.rate)} ${shop.rate.toFixed(1)}</p></div>
  <div class="none">${btn('매장 상세', { cls: 'btn-ghost btn-sm', href: 'SE0401' })}</div></div>`;

/* ============================================================
   RE0101 — 1단계 시술 선택
   ============================================================ */
export function RE0101(ctx) {
  const picked = ['M07', 'M12'];
  const conflict = ctx.id === 'RE0103';
  const over = ctx.id === 'RE0104';
  const openOpt = ctx.id === 'RE0102';

  const optBlock = (m) => `<div class="box mt3">
    <div class="row-b wrap-row mb3"><b>${m.nm} 옵션</b><span class="t-sub">필수로 골라주세요</span></div>
    ${OPTIONS.map((g) => `<div class="mb4">
      <div class="label">${g.g} <span class="req">*</span></div>
      <div class="radio-list">${g.list.map(([nm, add, min], i) => `
        <label class="radio${i === 1 ? ' on' : ''}" data-group="${m.id}-${g.g}">
          <input type="radio" name="${m.id}-${g.g}"${i === 1 ? ' checked' : ''}>
          <span class="grow"><b>${nm}</b>${add ? `<span class="t-sub"> · 추가 ${won(add)} · +${min}분</span>` : '<span class="t-sub"> · 추가 금액 없음</span>'}</span>
        </label>`).join('')}</div></div>`).join('')}
    <div class="row-b" style="border-top:1px solid var(--border);padding-top:12px">
      <span class="t-sub">옵션 반영</span><b>+23,000원 · +35분</b></div></div>`;

  const menuList = MENUS.map((g, gi) => {
    const open = openOpt ? gi <= 1 : gi === 1;
    return `<div class="acc-item${open ? ' on' : ''}">
      <button class="acc-q" type="button">${g.cat} <span class="muted" style="font-weight:400">${g.items.length}종</span><span class="mk">＋</span></button>
      <div class="acc-a" style="color:var(--text)">
        ${g.items.filter((m) => !m.hide).map((m) => {
          const on = picked.includes(m.id);
          const bad = conflict && (m.id === 'M07' || m.id === 'M03');
          return `<div class="list-row ${bad ? 'is-alert' : ''}" style="${bad ? 'background:rgba(192,57,43,.04);border-radius:12px;padding-left:8px;padding-right:8px' : ''}">
            <label class="check none" style="padding:0"><input type="checkbox"${on || bad ? ' checked' : ''}></label>
            ${phFix(['시술 대표', 1200, 900], 76, { seed: m.id })}
            <div class="grow">
              <div class="row-c wrap-row"><b>${m.nm}</b>${m.opt ? badge('옵션 선택', 'b-line') : ''}${bad ? badge('함께 예약 불가', 'b-danger') : ''}</div>
              <p class="t-sub">${m.desc}</p>
              <div class="t-sub mt1">약 ${min2h(m.min)}</div>
              ${on && openOpt && m.opt ? optBlock(m) : ''}
            </div>
            <div class="none right"><div class="price">${won(m.price)}</div></div>
          </div>`;
        }).join('')}
      </div></div>`;
  }).join('');

  const listCard = `<div class="card"><div class="card-bd" style="padding-top:4px;padding-bottom:4px">${menuList}</div></div>`;

  /* 상태별 안내와 하단 바 */
  if (conflict) {
    return {
      body: `${reStep(0)}${shopStrip()}
        ${banner('danger', '⚠️', `<b>발레아쥬와 레이어드 펌은 같은 날 함께 받을 수 없어요.</b>
          <div class="t-sub mt1">모발에 부담이 커서 매장에서 같은 날 진행을 받지 않습니다. 하나를 빼시거나, 2주 간격으로 나눠서 예약해 주세요.</div>`,
          { cls: 'mb4', right: btn('레이어드 펌 빼기', { cls: 'btn-soft', attr: ' data-toast="레이어드 펌을 뺐어요"' }) })}
        ${listCard}
        <p class="t-sub center mt4">나눠서 예약하면 두 번째 예약은 첫 시술일로부터 14일 뒤부터 고를 수 있어요.</p>`,
      o: {
        state: '동시 예약 불가 조합',
        stick: reSummary({ text: '선택 2건 · 함께 예약할 수 없는 조합이에요', btns: `${btn('이전', { cls: 'btn-ghost', href: 'SE0401' })}${btn('다음 단계', { cls: 'btn-primary', off: true })}` }),
      },
    };
  }

  if (over) {
    return {
      body: `${reStep(0)}${shopStrip()}
        ${banner('warn', '⏳', `<b>한 번에 예약할 수 있는 시간은 4시간까지예요.</b>
          <div class="t-sub mt1">지금 고른 시술은 모두 <b>6시간 15분</b>이라 한 번에 잡을 수 없어요. 시술을 줄이거나, 매장에 문의해 두 번으로 나눠 잡아주세요.</div>`,
          { cls: 'mb4', right: btn('매장에 문의', { cls: 'btn-soft', attr: ' data-toast="02-000-0000 으로 연결합니다"' }) })}
        <div class="card mb4"><div class="card-bd">
          <div class="row-b"><b>지금 고른 시술</b><span class="danger strong">6시간 15분 / 4시간</span></div>
          <div class="mt3">${progress(100, true)}</div>
          <div class="mt4">${[...PICK, ALL_ITEMS.find((x) => x.id === 'M04')].map((m) =>
            `<div class="row-b" style="padding:8px 0;border-bottom:1px solid var(--border)"><span>${m.nm} <span class="t-sub">약 ${min2h(m.min)}</span></span>
              <button class="btn btn-ghost btn-sm" type="button" data-toast="${m.nm}을(를) 뺐어요">빼기</button></div>`).join('')}</div>
        </div></div>
        ${listCard}`,
      o: {
        state: '총 소요시간 초과',
        stick: reSummary({ text: '선택 3건 · 총 6시간 15분 · 340,000원', btns: `${btn('이전', { cls: 'btn-ghost', href: 'SE0401' })}${btn('다음 단계', { cls: 'btn-primary', off: true })}` }),
      },
    };
  }

  const body = `${reStep(0)}${shopStrip()}
    <p class="t-sub mb4">받고 싶은 시술을 골라주세요. 여러 개를 함께 고를 수 있어요.</p>
    ${listCard}
    ${openOpt ? '' : banner('mut', 'ℹ️', '옵션이 있는 시술은 고르면 길이·디자인 선택이 아래에 펼쳐져요.', { cls: 'mt4' })}`;

  return {
    body,
    o: {
      state: openOpt ? '옵션 선택 펼침' : '',
      stick: reSummary({
        text: openOpt ? `선택 2건 · 총 ${min2h(PICK_MIN + 35)} · ${won(PICK_SUM + 23000)}` : `선택 2건 · 총 ${min2h(PICK_MIN)} · ${won(PICK_SUM)}`,
        next: 'RE0201', prev: 'RE0101',
      }),
    },
  };
}
export const RE0102 = RE0101, RE0103 = RE0101, RE0104 = RE0101;

/* ============================================================
   RE0201 — 2단계 디자이너 선택
   ============================================================ */
export function RE0201(ctx) {
  const noPick = ctx.id === 'RE0202';
  const cantOnly = ctx.id === 'RE0203';

  const anyCard = `<label class="radio${noPick ? ' on' : ''}" data-group="dz" style="align-items:center">
    <input type="radio" name="dz"${noPick ? ' checked' : ''}>
    <span class="grow row-c wrap-row" style="gap:12px">
      <span style="font-size:26px">⚡</span>
      <span><b style="font-size:16px">디자이너 지정 안 함 (빠른 예약)</b>
        <span class="t-sub" style="display:block">지명료 없이, 고를 수 있는 시간대가 가장 넓어요. 담당자는 방문 당일 배정됩니다.</span></span>
    </span>
    <span class="none right"><span class="t-sub">지명료</span><b style="display:block">없음</b></span></label>`;

  const list = DESIGNERS.map((d) => {
    const cant = d.id === 'D3' || d.id === 'D4';   // 발레아쥬를 못 하는 디자이너
    return dzCard(d, {
      dim: cant,
      badge: cant ? badge('이 시술 불가', 'b-danger') : badge(d.load, d.load === '여유' ? 'b-ok' : d.load === '보통' ? 'b-line' : 'b-warn'),
      extra: cant
        ? `<p class="t-sub mt2 danger">발레아쥬를 담당하지 않는 디자이너예요${cantOnly ? ' — 컬러 교육 이수 전이라 매장에서 배정하지 않습니다.' : '.'}</p>`
        : `<p class="t-sub mt2">이번 주 예약 ${d.load} · 근무 ${d.days.join('·')}</p>`,
      right: cant ? '' : `<div class="btns mt2">${btn('선택', { cls: 'btn-soft btn-sm', attr: ' data-toast="' + d.nm + ' ' + d.rank + '을(를) 골랐어요"' })}</div>`,
    });
  });

  if (cantOnly) {
    return {
      body: `${reStep(1)}${shopStrip()}
        <div class="row-b wrap-row mb4"><b class="t-sec">디자이너 고르기</b>
          <label class="check"><input type="checkbox"> 가능한 디자이너만 보기</label></div>
        ${banner('mut', 'ℹ️', '흐리게 보이는 디자이너는 고른 시술(<b>발레아쥬</b>)을 담당하지 않아요. 이름을 누르면 이유를 볼 수 있어요.', { cls: 'mb4' })}
        <div class="col">${anyCard}${list.join('')}</div>`,
      o: { state: '선택 시술 불가', stick: reSummary({ label: '선택한 디자이너', text: '아직 고르지 않았어요', btns: `${btn('이전', { cls: 'btn-ghost', href: 'RE0101' })}${btn('다음 단계', { cls: 'btn-primary', off: true })}` }) },
    };
  }

  if (noPick) {
    return {
      body: `${reStep(1)}${shopStrip()}
        ${banner('ok', '⚡', `<b>빠른 예약으로 진행할게요.</b>
          <div class="t-sub mt1">지명료 0원 · 고를 수 있는 시간대가 <b>32개</b>로 늘었어요 (지정 시 11개). 담당 디자이너는 방문 당일 매장에서 배정합니다.</div>`, { cls: 'mb4' })}
        <div class="col">${anyCard}${list.join('')}</div>`,
      o: { state: '지정 안 함 선택', stick: reSummary({ label: '선택한 디자이너', text: '지정 안 함 · 지명료 0원', next: 'RE0301', prev: 'RE0201' }) },
    };
  }

  return {
    body: `${reStep(1)}${shopStrip()}
      <div class="row-b wrap-row mb4"><b class="t-sec">디자이너 고르기</b>
        <label class="check"><input type="checkbox"> 가능한 디자이너만 보기</label></div>
      <div class="col">${anyCard}${list.join('')}</div>`,
    o: { stick: reSummary({ label: '선택한 디자이너', text: '김수현 원장 · 지명료 10,000원', next: 'RE0301', prev: 'RE0201' }) },
  };
}
export const RE0202 = RE0201, RE0203 = RE0201;

/* ============================================================
   RE0301 — 3단계 날짜·시간 선택
   ============================================================ */
export function RE0301(ctx) {
  const need = `<div class="box-pri mb4"><div class="row-b wrap-row">
    <div><b>발레아쥬 + 모발 클리닉</b><div class="t-sub mt1">김수현 원장 · 연속 <b>3시간 45분</b>이 비어 있어야 고를 수 있어요</div></div>
    ${badge('총 225분', 'b-pri')}</div></div>`;

  const wrapRight = (inner, o = {}) => `<div class="split-r"><div>${calendar(o.cal || {})}</div>
    <div>${card(o.title || '9월 12일(토) 시간 고르기', inner)}</div></div>`;

  if (ctx.id === 'RE0302') {
    const sk = `<div class="slots">${Array.from({ length: 12 }, () => '<div class="sk" style="height:48px"></div>').join('')}</div>
      <div class="center mt4"><div class="spinner"></div><p class="t-sub mt3">비어 있는 시간을 확인하는 중이에요</p></div>
      ${banner('mut', '🐢', '조회가 평소보다 오래 걸리고 있어요.', { cls: 'mt4', right: btn('다시 시도', { cls: 'btn-ghost btn-sm', attr: ' data-toast="다시 조회할게요"' }) })}`;
    return { body: `${reStep(2)}${need}${wrapRight(sk)}`, o: { state: '슬롯 로딩', stick: reSummary({ label: '선택한 시간', text: '조회 중…', btns: `${btn('이전', { cls: 'btn-ghost', href: 'RE0201' })}${btn('다음 단계', { cls: 'btn-primary', off: true })}` }) } };
  }

  if (ctx.id === 'RE0303') {
    const inner = `${slots({ sel: '14:00', full: ['11:00', '11:30', '13:00', '15:00', '15:30', '18:00'], dim: ['16:30', '17:00', '17:30', '18:30', '19:00', '19:30'], needMin: 225 })}
      <div class="row-c t-sub mt4" style="gap:16px;flex-wrap:wrap">
        <span>진하게 = 선택 가능</span><span class="muted">취소선 = 이미 예약이 찼어요</span><span class="muted">흐림 = 225분이 연속으로 비지 않아요</span></div>
      ${banner('mut', 'ℹ️', '흐린 시간을 누르면 왜 못 고르는지 알려드려요.', { cls: 'mt4' })}`;
    return { body: `${reStep(2)}${need}${wrapRight(inner)}`, o: { state: '마감 슬롯 표시', stick: reSummary({ label: '선택한 시간', text: '9월 12일(토) 14:00 ~ 17:45', next: 'RE0401', prev: 'RE0301' }) } };
  }

  if (ctx.id === 'RE0304') {
    const inner = `${banner('warn', '🚪', `<b>9월 14일(월)은 매장 정기 휴무예요.</b>
      <div class="t-sub mt1">김수현 원장은 9월 15일(화)에도 휴가라 예약을 받지 않아요. 가장 가까운 영업일은 <b>9월 16일(수)</b>입니다.</div>`,
      { cls: 'mb4', right: btn('9/16으로 이동', { cls: 'btn-soft btn-sm', attr: ' data-toast="9월 16일로 옮겼어요"' }) })}
      ${slots({ sel: '', full: [], dim: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'] })}`;
    return {
      body: `${reStep(2)}${need}${wrapRight(inner, { title: '9월 14일(월) — 휴무일', cal: { sel: -1, marks: [16] } })}
        <div class="row-c mt4 t-sub" style="gap:16px;flex-wrap:wrap">
          <span class="row-c">${badge('휴무', 'b-mut')} 매장 정기 휴무 (매주 월요일)</span>
          <span class="row-c">${badge('휴가', 'b-warn')} 디자이너 개인 휴가</span></div>`,
      o: { state: '휴무일 선택 시도', stick: reSummary({ label: '선택한 시간', text: '고를 수 없는 날짜예요', btns: `${btn('이전', { cls: 'btn-ghost', href: 'RE0201' })}${btn('다음 단계', { cls: 'btn-primary', off: true })}` }) },
    };
  }

  if (ctx.id === 'RE0305') {
    const modal = modalEl('잡아둔 시간이 풀렸어요',
      `<p>10분 동안 자리를 잡아드렸는데 시간이 지났어요. 그 사이 <b>9월 12일 14:00</b>은 다른 분이 예약했습니다.</p>
       <div class="box mt4"><b class="t-sub">대신 이런 시간은 어때요</b>
         <div class="chips mt3">${['9/12(토) 17:00', '9/13(일) 11:00', '9/16(수) 14:00'].map((t) => chip(t, false)).join('')}</div></div>
       <p class="t-sub mt3">고르시면 다시 10분간 자리를 잡아드려요.</p>`,
      `${btn('시간 다시 고르기', { cls: 'btn-ghost', href: 'RE0301' })}${btn('이 시간으로 진행', { cls: 'btn-primary', href: 'RE0401' })}`);
    return {
      body: `${reStep(2)}${need}${wrapRight(slots({ sel: '17:00', full: ['11:00', '11:30', '13:00', '14:00', '15:00', '15:30', '18:00'] }))}`,
      o: { state: '슬롯 선점 만료', after: modal, stick: reSummary({ label: '선택한 시간', text: '선점이 만료돼 다시 골라야 해요', btns: btn('시간 다시 고르기', { cls: 'btn-primary', href: 'RE0301' }) }) },
    };
  }

  if (ctx.id === 'RE0306') {
    const inner = `${banner('warn', '🕘', `<b>오늘 예약은 마감됐어요.</b>
      <div class="t-sub mt1">이 매장은 방문 <b>2시간 전</b>까지만 예약을 받아요. 지금은 19:20이라 오늘 남은 자리는 고를 수 없어요.</div>`, { cls: 'mb4' })}
      <div class="box-pri mb4"><div class="row-b wrap-row"><div><b>내일 가장 빠른 시간</b><div class="t-sub mt1">9월 13일(일) 11:00 · 김수현 원장</div></div>
        ${btn('이 시간으로', { cls: 'btn-primary btn-sm', href: 'RE0401' })}</div></div>
      ${slots({ sel: '', full: [], dim: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'] })}
      <p class="t-sub center mt4">오늘 꼭 받으셔야 한다면 <button class="btn-link" type="button" data-toast="02-000-0000 으로 연결합니다">매장에 전화해 문의</button>해 보세요.</p>`;
    return {
      body: `${reStep(2)}${need}${wrapRight(inner, { title: '9월 12일(토) — 오늘 마감', cal: { sel: 13, past: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] } })}`,
      o: { state: '당일 마감 경과', stick: reSummary({ label: '선택한 시간', text: '오늘은 고를 수 없어요', btns: `${btn('이전', { cls: 'btn-ghost', href: 'RE0201' })}${btn('다음 단계', { cls: 'btn-primary', off: true })}` }) },
    };
  }

  const inner = `${slots({ sel: '14:00', needMin: 225 })}
    <div class="row-c t-sub mt4" style="gap:16px;flex-wrap:wrap"><span>진하게 = 선택 가능</span><span class="muted">취소선 = 마감</span></div>
    <div class="box mt4"><div class="row-b"><span class="t-sub">고른 시간</span><b>14:00 시작 · 17:45 종료 예정</b></div></div>
    <p class="t-sub center mt4">가능한 시간이 없다면 <a class="btn-link" href="${link('RE0501')}">대기 신청</a>을 해두세요.</p>`;

  return { body: `${reStep(2)}${need}${wrapRight(inner)}`, o: { stick: reSummary({ label: '선택한 시간', text: '9월 12일(토) 14:00 ~ 17:45', next: 'RE0401', prev: 'RE0301' }) } };
}
export const RE0302 = RE0301, RE0303 = RE0301, RE0304 = RE0301, RE0305 = RE0301, RE0306 = RE0301;

/* ============================================================
   RE0401 — 4단계 확인 및 결제
   ============================================================ */
export function RE0401(ctx) {
  const agreeOff = ctx.id === 'RE0403';
  const coupon = ctx.id === 'RE0402';
  const payTab = ctx.id === 'RE0404';

  const summary = card('예약 내용', `
    ${shopRow(shop, { sub: `${shop.area} · 02-000-0000`, right: btn('매장 상세', { cls: 'btn-ghost btn-sm', href: 'SE0401' }) })}
    <div class="hr"></div>
    ${PICK.map((m) => `<div class="row-b" style="padding:8px 0">
      <span><b>${m.nm}</b> <span class="t-sub">약 ${min2h(m.min)}</span></span><span>${won(m.price)}</span></div>`).join('')}
    <div class="row-b" style="padding:8px 0"><span class="t-sub">옵션 — 중단발 · 포인트 2개</span><span>+23,000원</span></div>
    <div class="hr"></div>
    ${kv([['담당 디자이너', '김수현 원장 <span class="t-sub">(지명료 10,000원)</span>'],
      ['예약 일시', '<b>2026.09.12(토) 14:00</b>'], ['총 소요시간', '약 3시간 45분 (17:45 종료 예정)']])}`);

  const req = card('요청사항', `<textarea class="textarea" placeholder="예: 앞머리는 짧게 해주세요. 뿌리는 어둡게 남겨주세요.">앞머리는 짧게, 뿌리는 어둡게 부탁드려요.</textarea>
    <p class="hint">담당 디자이너가 시술 전에 확인해요. 알레르기나 두피 상태도 함께 적어주시면 좋아요.</p>`);

  const couponCard = card('쿠폰 · 적립금', coupon
    ? `<div class="label">사용할 쿠폰</div>
       <div class="col">${COUPONS.map((c, i) => `<label class="radio${i === 0 ? ' on' : ''}${c.off ? ' is-off' : ''}" data-group="cp">
         <input type="radio" name="cp"${i === 0 ? ' checked' : ''}${c.off ? ' disabled' : ''}>
         <span class="grow"><b>${c.nm}</b> <span class="pri strong">${c.v}</span>
           <span class="t-sub" style="display:block">${c.cond} · ${c.to}까지${c.off ? ' — 5만원 이상 결제 건에만 쓸 수 있어요' : ''}</span></span></label>`).join('')}</div>
       <div class="field mt4"><div class="label">적립금 사용 <span class="t-sub">(보유 4,100원)</span></div>
         <div class="field-btn"><input class="input" type="text" value="4,100"><button class="btn btn-ghost" type="button" data-toast="가진 적립금을 모두 넣었어요">모두 사용</button></div>
         <p class="hint">시술 금액의 10%까지 쓸 수 있어요. 이번 예약은 최대 24,300원.</p></div>`
    : `<div class="field"><div class="label">쿠폰</div>
         <div class="field-btn"><select class="select"><option>첫 예약 20% 할인 (최대 1만원)</option><option>쿠폰을 쓰지 않음</option></select>
           ${btn('쿠폰함', { cls: 'btn-ghost', href: 'AC0201' })}</div></div>
       <div class="field"><div class="label">적립금 <span class="t-sub">(보유 4,100원)</span></div>
         <div class="field-btn"><input class="input" type="text" value="4,100"><button class="btn btn-ghost" type="button" data-toast="가진 적립금을 모두 넣었어요">모두 사용</button></div></div>`);

  const payCard = card('결제 수단', payTab
    ? `<div class="radio-list">
        <label class="radio on" data-group="pay"><input type="radio" name="pay" checked>
          <span class="grow"><b>신용·체크카드</b><span class="t-sub" style="display:block">신한 1234 · 저장된 카드</span></span></label>
        <label class="radio" data-group="pay"><input type="radio" name="pay">
          <span class="grow"><b>간편결제</b><span class="t-sub" style="display:block">카카오페이 · 네이버페이 · 토스</span></span></label>
        <label class="radio" data-group="pay"><input type="radio" name="pay">
          <span class="grow"><b>계좌이체</b><span class="t-sub" style="display:block">이체 확인까지 1~2분 걸려요</span></span></label>
       </div>
       <div class="hr"></div>
       <div class="field"><div class="label">현금영수증</div>
         <div class="field-row"><select class="select"><option>개인 소득공제</option><option>사업자 지출증빙</option><option>발급 안 함</option></select>
           <input class="input" type="text" placeholder="휴대폰 번호" value="010-1234-5678"></div>
         <p class="hint">계좌이체로 결제할 때만 발급돼요. 카드는 카드사에서 자동 처리됩니다.</p></div>
       ${banner('mut', '💳', '예약금 <b>20,000원</b>만 지금 결제하고, 남은 <b>218,900원</b>은 방문해서 결제해요.', { cls: 'mt4' })}`
    : `<div class="radio-list">
        <label class="radio on" data-group="pay"><input type="radio" name="pay" checked><span class="grow"><b>신용·체크카드</b> <span class="t-sub">신한 1234</span></span></label>
        <label class="radio" data-group="pay"><input type="radio" name="pay"><span class="grow"><b>간편결제</b> <span class="t-sub">카카오페이 · 토스</span></span></label>
       </div>
       <p class="hint mt3"><a class="btn-link" href="${link('RE0404')}">결제 수단 자세히 고르기 ›</a></p>`);

  const money = card('금액', `
    ${sumRows([
      ['시술 금액', won(PICK_SUM)],
      ['옵션 추가', '+23,000원'],
      ['디자이너 지명료', '+10,000원'],
      ['쿠폰 할인', '-10,000원', 'minus'],
      ['적립금 사용', '-4,100원', 'minus'],
    ], ['총 결제 금액', '238,900원'])}
    <div class="hr"></div>
    <div class="sum-row"><span><b>지금 결제할 예약금</b></span><span><b class="pri">20,000원</b></span></div>
    <div class="sum-row sub"><span>방문해서 결제할 금액</span><span>218,900원</span></div>`,
    { cls: 'mt4' });

  const agree = card('동의', `
    <label class="check"><input type="checkbox"${agreeOff ? '' : ' checked'} data-unlock="pay-btn">
      <span><b>취소·환불 규정에 동의합니다</b> <span class="req">*</span>
        <span class="sub">9월 11일 18:00까지 무료 취소 · 이후 취소 시 예약금의 50% 차감</span></span></label>
    <label class="check"><input type="checkbox"${agreeOff ? '' : ' checked'}>
      <span><b>노쇼 정책에 동의합니다</b> <span class="req">*</span>
        <span class="sub">연락 없이 방문하지 않으면 예약금이 환불되지 않고 30일간 예약이 제한돼요</span></span></label>
    <p class="mt3"><button class="btn-link" type="button" data-modal="m-terms">약관 전문 보기</button></p>`,
    { cls: 'mt4' });

  const terms = modalTpl('m-terms', '취소·환불 규정 전문',
    `<p class="t-sub">제1조 (목적) 이 규정은 뷰티나우를 통해 이루어진 예약의 취소와 환불 기준을 정합니다.</p>
     <p class="t-sub mt3">제2조 (무료 취소) 이용자는 매장이 정한 무료 취소 기한까지 예약금 전액을 환불받을 수 있습니다. 기한은 예약 상세 화면에 표시됩니다.</p>
     <p class="t-sub mt3">제3조 (수수료) 무료 취소 기한 경과 후 취소하는 경우 매장이 정한 비율(0~100%)의 수수료가 예약금에서 차감됩니다.</p>
     <p class="t-sub mt3">제4조 (노쇼) 사전 연락 없이 방문하지 않는 경우 예약금은 환불되지 않으며 매장으로 정산됩니다.</p>
     <p class="t-sub mt3">제5조 (매장 사정) 매장 사정으로 예약이 취소되는 경우 예약금 전액이 환불되며, 이용자에게 수수료를 부과하지 않습니다.</p>`,
    btn('닫기', { cls: 'btn-ghost btn-block', attr: ' data-dismiss' }));

  const layout = (o = {}) => `${reStep(3)}
    <div class="split-r"><div class="col gap6">${summary}${req}${couponCard}${payCard}${o.extra || ''}</div>
    <div class="sticky">${money}${agree}
      <div class="btns mt4">${o.payBtn || btn('20,000원 결제하고 예약하기', { cls: 'btn-primary btn-block btn-lg', href: 'RE0601', id: 'pay-btn' })}</div>
      <p class="t-sub center mt3">결제가 끝나면 매장에 예약이 접수돼요.</p>
    </div></div>${terms}`;

  if (agreeOff) {
    return {
      body: layout({
        extra: banner('danger', '⚠️', '<b>취소·환불 규정과 노쇼 정책에 동의해야 결제할 수 있어요.</b><div class="t-sub mt1">오른쪽 아래 동의 항목 두 개를 확인해 주세요.</div>',
          { right: btn('동의 항목으로 이동', { cls: 'btn-soft btn-sm', attr: ' data-toast="동의 영역으로 이동했어요"' }) }),
        payBtn: `<button class="btn btn-primary btn-block btn-lg is-off" type="button" disabled id="pay-btn">동의해야 결제할 수 있어요</button>`,
      }),
      o: { state: '동의 미체크 상태' },
    };
  }

  if (ctx.id === 'RE0405') {
    const wait = `<div class="overlay-wait"><div class="spinner"></div>
      <h2 class="t-sec">결제를 확인하고 있어요</h2>
      <p class="t-sub">창을 닫거나 뒤로 가지 마세요. 보통 10초 안에 끝나요.</p>
      <p class="t-sub">잡아둔 시간은 <b class="pri" data-count="540">9:00</b> 동안 유지돼요.</p>
      <p class="t-sub mt4">30초가 넘어가면 결제가 중복되지 않도록 자동으로 취소하고 다시 안내해요.</p></div>`;
    return { body: layout({ payBtn: `<button class="btn btn-primary btn-block btn-lg is-off" type="button" disabled>결제 처리 중…</button>` }), o: { state: '결제 처리 중', after: wait } };
  }

  if (ctx.id === 'RE0406') {
    const modal = modalEl('잡아둔 시간이 곧 풀려요',
      `<p><b class="pri" style="font-size:24px" data-count="60">1:00</b> 뒤에 <b>9월 12일 14:00</b> 자리가 풀립니다.</p>
       <p class="mt3">지금 결제를 마치면 이 시간으로 확정돼요. 시간이 지나면 시간을 다시 골라야 해요.</p>`,
      `${btn('시간 다시 고르기', { cls: 'btn-ghost', href: 'RE0301' })}${btn('지금 결제하기', { cls: 'btn-primary', href: 'RE0601' })}`);
    return { body: layout(), o: { state: '선점 만료 임박 경고', after: modal } };
  }

  return { body: layout(), o: { state: coupon ? '쿠폰·적립금 적용' : payTab ? '결제 수단 선택' : '' } };
}
export const RE0402 = RE0401, RE0403 = RE0401, RE0404 = RE0401, RE0405 = RE0401, RE0406 = RE0401;

/* ============================================================
   RE0501 — 가능한 시간 없음 / 대기 신청
   ============================================================ */
export function RE0501(ctx) {
  const need = `<div class="box-pri mb4"><div class="row-b wrap-row">
    <div><b>발레아쥬 + 모발 클리닉</b><div class="t-sub mt1">김수현 원장 · 연속 3시간 45분이 필요해요</div></div>
    ${badge('총 225분', 'b-pri')}</div></div>`;

  if (ctx.id === 'RE0502') {
    const form = card('대기 신청', `
      <div class="field"><div class="label">희망 날짜 범위 <span class="req">*</span></div>
        <div class="field-row"><input class="input" type="date" value="2026-09-12"><input class="input" type="date" value="2026-09-20"></div>
        <p class="hint">이 기간 안에 자리가 나면 알려드려요.</p></div>
      <div class="field"><div class="label">희망 시간대 <span class="req">*</span></div>
        ${chips(['오전 (10~12시)', '점심 (12~14시)', '오후 (14~18시)', '저녁 (18~21시)'], [2, 3])}</div>
      <div class="field"><div class="label">디자이너</div>
        <div class="radio-list">
          <label class="radio on" data-group="wdz"><input type="radio" name="wdz" checked><span class="grow"><b>김수현 원장만</b> <span class="t-sub">기다리는 사람이 많아요</span></span></label>
          <label class="radio" data-group="wdz"><input type="radio" name="wdz"><span class="grow"><b>누구든 상관없음</b> <span class="t-sub">자리가 훨씬 빨리 나요</span></span></label>
        </div></div>
      <div class="field"><div class="label">알림 받을 방법</div>
        <label class="check"><input type="checkbox" checked> 앱 푸시</label>
        <label class="check"><input type="checkbox" checked> 문자 (010-1234-5678)</label>
        <label class="check"><input type="checkbox"> 카카오 알림톡</label></div>
      <div class="field"><div class="label">자리가 나면</div>
        <div class="radio-list">
          <label class="radio on" data-group="auto"><input type="radio" name="auto" checked><span class="grow"><b>알림만 받고 직접 예약할게요</b><span class="t-sub" style="display:block">알림 후 10분 안에 예약하지 않으면 다음 순번으로 넘어가요</span></span></label>
          <label class="radio" data-group="auto"><input type="radio" name="auto"><span class="grow"><b>자동으로 예약해 주세요</b><span class="t-sub" style="display:block">예약금이 등록한 카드로 바로 결제돼요</span></span></label>
        </div></div>`,
      { ft: `<div class="btns">${btn('취소', { cls: 'btn-ghost', href: 'RE0501' })}${btn('대기 신청하기', { cls: 'btn-primary grow', href: 'RE0801' })}</div>` });
    return { body: `${reStep(2)}${need}<div class="wrap-narrow" style="padding:0">${form}</div>`, o: { state: '대기 신청 폼' } };
  }

  const body = `${reStep(2)}${need}
    <div class="split-r"><div>${calendar({ sel: 12, marks: [13, 16] })}</div>
    <div>${card('9월 12일(토) 시간 고르기', `
      ${empty('⏳', '9월 12일에는 225분 연속으로 비는 시간이 없어요',
        '시술 두 개를 함께 받으시려면 3시간 45분이 이어서 비어야 해요. 이 날은 중간중간만 비어 있습니다.', '')}
      <div class="hr"></div>
      <b class="t-card">가장 빠른 예약 가능 시간</b>
      <div class="col mt3">
        ${[['9월 13일(일)', '11:00', '김수현 원장', '내일'], ['9월 16일(수)', '14:00', '김수현 원장', '4일 뒤'], ['9월 12일(토)', '14:00', '박지은 실장', '오늘 · 다른 디자이너']].map(([d, t, dz, note]) =>
        `<a class="hcard is-pri" href="${link('RE0401')}"><div class="grow">
          <div class="row-c wrap-row"><b style="font-size:16px">${d} ${t}</b>${badge(note, 'b-pri')}</div>
          <p class="t-sub mt1">${dz} · 3시간 45분 연속 가능</p></div>
          <div class="none">${btn('이 시간으로', { cls: 'btn-soft btn-sm', attr: 'data-toast="이 시간으로 바꿨어요"' })}</div></a>`).join('')}
      </div>
      <div class="hr"></div>
      <div class="btns">${btn('🔔 자리 나면 알림 받기 (대기 신청)', { cls: 'btn-primary btn-block btn-lg', href: 'RE0502' })}</div>
      <div class="btns mt2">${btn('다른 디자이너로 찾아보기', { cls: 'btn-ghost btn-block', href: 'RE0201' })}
        ${btn('다른 날짜 고르기', { cls: 'btn-ghost btn-block', href: 'RE0301' })}</div>`)}</div></div>`;

  return { body };
}
export const RE0502 = RE0501;

/* ============================================================
   RE0601 — 예약 완료
   ============================================================ */
export function RE0601(ctx) {
  const waiting = ctx.id === 'RE0602';
  const cal = ctx.id === 'RE0603';

  const detail = card('예약 내용', `
    ${kv([['예약번호', '<b>BK-20260912-0417</b> <button class="btn-link" type="button" data-toast="예약번호를 복사했어요">복사</button>'],
      ['매장', `${shop.nm} <span class="t-sub">${shop.area}</span>`],
      ['시술', '발레아쥬 · 모발 클리닉 <span class="t-sub">(중단발 · 포인트 2개)</span>'],
      ['담당', '김수현 원장'],
      ['일시', '<b>2026.09.12(토) 14:00 ~ 17:45</b>'],
      ['결제', '예약금 20,000원 결제 완료 · 현장 결제 예정 218,900원']])}`);

  const mapCard = card('매장 위치', `${map([{ x: 50, y: 45, nm: shop.nm, free: true, on: true }], { cls: 'map-sm', lb: '지도 영역 (매장 위치 · 권장 800×400)' })}
    <p class="mt3"><b>서울 강남구 신사동 123-4 2층</b></p>
    <p class="t-sub">3호선 신사역 8번 출구 도보 6분 · 건물 주차 2시간 무료</p>
    <div class="btns mt3">${btn('길찾기', { cls: 'btn-primary', attr: ' data-toast="지도 앱 연결은 개발이 필요한 기능이에요"' })}
      ${btn('매장 전화', { cls: 'btn-ghost', attr: ' data-toast="02-000-0000 으로 연결합니다"' })}</div>`);

  if (waiting) {
    return {
      body: `<div class="wrap-narrow" style="padding:0">
        <div class="center mb8"><div style="font-size:64px">⏳</div>
          <h1 class="t-page mt3">예약을 신청했어요</h1>
          <p class="t-sub mt2">이 매장은 자동 확정이 아니라 사장님이 직접 확인해요.</p>
          <div class="mt4">${badge('매장 확인 대기', 'b-warn b-lg')}</div></div>
        ${banner('warn', '⏱️', `<b>보통 2시간 안에 답이 와요.</b>
          <div class="t-sub mt1">오늘 21:00까지 매장이 확인하지 않으면 예약은 자동 취소되고, 예약금 20,000원은 바로 환불돼요.</div>`, { cls: 'mb6' })}
        ${detail}
        <div class="mt6">${card('결과는 이렇게 알려드려요', `
          <label class="check"><input type="checkbox" checked disabled> 앱 푸시 알림</label>
          <label class="check"><input type="checkbox" checked disabled> 문자 (010-1234-5678)</label>
          <p class="hint">확정·거절 모두 알려드려요. 매장이 다른 시간을 제안할 수도 있어요.</p>`)}</div>
        <div class="btns mt6">${btn('내 예약 보기', { cls: 'btn-primary btn-block btn-lg', href: 'MY0101' })}</div>
      </div>`,
      o: { state: '매장 확인 대기', logged: true },
    };
  }

  if (cal) {
    const modal = modalEl('내 캘린더에 추가',
      `<div class="radio-list">
        <label class="radio on" data-group="cal"><input type="radio" name="cal" checked><span class="grow"><b>구글 캘린더</b></span></label>
        <label class="radio" data-group="cal"><input type="radio" name="cal"><span class="grow"><b>애플 캘린더</b></span></label>
        <label class="radio" data-group="cal"><input type="radio" name="cal"><span class="grow"><b>파일로 내려받기 (.ics)</b></span></label>
       </div>
       <div class="hr"></div>
       ${kv([['일정 제목', '살롱 드 코랄 — 발레아쥬'], ['시간', '9/12(토) 14:00 ~ 17:45 <span class="t-sub">(소요시간만큼 잡아요)</span>']])}
       <div class="field mt4"><div class="label">미리 알림</div>
         <select class="select"><option>1시간 전 (이동 시간 30분 반영)</option><option>2시간 전</option><option>하루 전</option></select>
         <p class="hint">집에서 매장까지 30분 걸린다고 보고 시각을 잡았어요.</p></div>`,
      `${btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' })}${btn('추가하기', { cls: 'btn-primary', attr: ' data-dismiss data-toast="캘린더에 일정을 추가했어요" data-toast-kind="ok"' })}`);
    return {
      body: `<div class="wrap-narrow" style="padding:0"><div class="center mb8"><div style="font-size:64px">✅</div>
        <h1 class="t-page mt3">예약이 확정됐어요</h1></div>${detail}</div>`,
      o: { state: '캘린더에 추가', after: modal, logged: true },
    };
  }

  return {
    body: `<div class="wrap-narrow" style="padding:0">
      <div class="center mb8"><div style="font-size:64px">✅</div>
        <h1 class="t-page mt3">예약이 확정됐어요</h1>
        <p class="t-sub mt2">확정 문자를 010-1234-5678로 보냈어요.</p></div>
      ${detail}
      <div class="mt6">${banner('pri', '🕒', '<b class="hl">9월 11일 18시까지 무료로 취소</b>할 수 있어요. 그 이후에는 예약금의 50%가 차감돼요.')}</div>
      <div class="mt6">${mapCard}</div>
      <div class="btns mt6">${btn('📅 내 캘린더에 추가', { cls: 'btn-ghost btn-block btn-lg', href: 'RE0603' })}</div>
      <div class="btns mt2">${btn('내 예약 보기', { cls: 'btn-primary btn-block btn-lg', href: 'MY0101' })}</div>
      <p class="center mt4 t-sub">일정이 바뀌었나요? <a class="btn-link" href="${link('MY0401')}">예약 변경</a> · <a class="btn-link" href="${link('MY0501')}">예약 취소</a></p>
    </div>`,
    o: { logged: true },
  };
}
export const RE0602 = RE0601, RE0603 = RE0601;

/* ============================================================
   RE0701 — 결제 실패
   ============================================================ */
export function RE0701(ctx) {
  if (ctx.id === 'RE0702') {
    return {
      body: `<div class="wrap-narrow" style="padding:0">
        <div class="center mb8"><div style="font-size:64px">⌛</div>
          <h1 class="t-page mt3">다시 시도하는 사이 시간이 풀렸어요</h1>
          <p class="t-sub mt2">9월 12일 14:00은 그 사이 다른 분이 예약했어요. 결제는 이루어지지 않았습니다.</p></div>
        ${card('대신 이 시간은 어때요', `<div class="col">
          ${[['9월 12일(토)', '17:00', '김수현 원장'], ['9월 13일(일)', '11:00', '김수현 원장'], ['9월 16일(수)', '14:00', '김수현 원장']].map(([d, t, dz]) =>
          `<a class="hcard is-pri" href="${link('RE0401')}"><div class="grow"><b style="font-size:16px">${d} ${t}</b>
            <p class="t-sub mt1">${dz} · 3시간 45분 연속 가능</p></div>
            <div class="none">${btn('이 시간으로', { cls: 'btn-soft btn-sm', attr: 'data-toast="이 시간으로 바꿨어요"' })}</div></a>`).join('')}</div>`)}
        <div class="btns mt6">${btn('날짜부터 다시 고르기', { cls: 'btn-primary btn-block btn-lg', href: 'RE0301' })}</div>
        <p class="center mt4"><a class="btn-link" href="${link('RE0501')}">자리 나면 알림 받기(대기 신청)</a></p>
      </div>`,
      o: { state: '선점 만료 후 실패' },
    };
  }

  return {
    body: `<div class="wrap-narrow" style="padding:0">
      <div class="center mb8"><div style="font-size:64px">💳</div>
        <h1 class="t-page mt3">결제가 완료되지 않았어요</h1>
        <p class="t-sub mt2">카드 한도를 초과했어요. 다른 카드로 다시 시도해 보세요.</p></div>
      ${banner('pri', '⏱️', '<b>고르신 시간은 <span data-count="600">10:00</span> 동안 그대로 잡아뒀어요.</b><div class="t-sub mt1">그 안에 결제를 마치면 같은 시간으로 예약됩니다.</div>', { cls: 'mb6' })}
      ${card('예약 내용은 그대로예요', `${kv([['매장', shop.nm], ['시술', '발레아쥬 · 모발 클리닉'], ['담당', '김수현 원장'],
        ['일시', '<b>2026.09.12(토) 14:00</b>'], ['결제할 예약금', '<b>20,000원</b>']])}
        <p class="hint mt3">입력하신 요청사항과 쿠폰·적립금도 그대로 남아 있어요.</p>`)}
      <div class="btns mt6">${btn('다시 시도하기', { cls: 'btn-primary btn-block btn-lg', href: 'RE0401' })}</div>
      <div class="btns mt2">${btn('다른 결제 수단 고르기', { cls: 'btn-ghost btn-block btn-lg', href: 'RE0404' })}</div>
      <p class="center mt4 t-sub">계속 안 되시나요? <button class="btn-link" type="button" data-toast="고객센터 1600-0000 으로 연결합니다">고객센터에 문의하기</button></p>
    </div>`,
  };
}
export const RE0702 = RE0701;

/* ============================================================
   RE0801 — 대기 신청 완료
   ============================================================ */
export function RE0801(ctx) {
  const detail = card('신청한 조건', `${kv([
    ['매장', `${shop.nm} <span class="t-sub">${shop.area}</span>`],
    ['시술', '발레아쥬 · 모발 클리닉 <span class="t-sub">(총 3시간 45분)</span>'],
    ['희망 기간', '2026.09.12(토) ~ 09.20(일)'],
    ['희망 시간대', '오후 · 저녁'],
    ['디자이너', '김수현 원장 지정'],
  ])}`);

  if (ctx.id === 'RE0802') {
    const modal = modalEl('자리가 났어요!',
      `<p><b>9월 14일(일) 15:00</b> 에 김수현 원장 자리가 비었어요.</p>
       <div class="box-pri mt4 center"><div class="t-sub">이 자리를 잡아둔 시간</div>
         <div class="price-lg pri" data-count="600">10:00</div>
         <p class="t-sub">시간이 지나면 다음 순번에게 넘어가요</p></div>`,
      `${btn('다음 분께 양보', { cls: 'btn-ghost', attr: ' data-dismiss data-toast="다음 순번에게 넘겼어요. 대기는 계속 유지돼요"' })}${btn('지금 예약하기', { cls: 'btn-primary', href: 'RE0401' })}`);
    return { body: `<div class="wrap-narrow" style="padding:0"><div class="center mb8"><div style="font-size:64px">🔔</div>
      <h1 class="t-page mt3">기다리던 자리가 났어요</h1></div>${detail}</div>`,
      o: { state: '자리 발생 알림', after: modal, logged: true } };
  }

  return {
    body: `<div class="wrap-narrow" style="padding:0">
      <div class="center mb8"><div style="font-size:64px">🔔</div>
        <h1 class="t-page mt3">자리가 나면 알려드릴게요</h1>
        <p class="t-sub mt2">취소가 생기면 순서대로 연락드려요. 보통 3~5일 안에 한 번은 자리가 납니다.</p></div>
      ${detail}
      <div class="mt6">${card('', `<div class="row-b wrap-row">
        <div><div class="t-sub">현재 대기 순번</div><div class="price-lg pri">2번째</div></div>
        <div><div class="t-sub">알림 받을 방법</div><div class="mt1">${badge('앱 푸시', 'b-pri')} ${badge('문자', 'b-pri')}</div></div>
        <div><div class="t-sub">자리가 나면</div><div class="mt1"><b>알림만 받고 직접 예약</b></div></div>
      </div>`)}</div>
      ${banner('mut', 'ℹ️', '알림을 받고 <b>10분 안에</b> 예약하지 않으면 다음 순번으로 넘어가요. 대기는 그대로 유지됩니다.', { cls: 'mt4' })}
      <div class="btns mt6">${btn('다른 매장 둘러보기', { cls: 'btn-primary btn-block btn-lg', href: 'SE0101' })}</div>
      <div class="btns mt2">${btn('대기 취소', { cls: 'btn-ghost btn-block', attr: ' data-toast="대기 신청을 취소했어요"' })}</div>
    </div>`,
    o: { logged: true },
  };
}
export const RE0802 = RE0801;
