/* 예약 관리(ST) · 매장 운영(MG) — 매장(사장님) 화면 */
import {
  ph, phFix, phAva, map, esc, won, num, min2h, link, stars, rateLine, badge, stBadge, btn, chip, chips, tabs,
  sec, card, banner, empty, table, kv, sumRows, accordion, stat, progress, hsteps, modalEl, modalTpl,
  review, calendar, slots, shopRow, dzCard, menuRow, pageHd, stickBar, mgNav,
} from './ui.mjs';
import { SHOPS, DESIGNERS, MENUS, ALL_ITEMS, OPTIONS, TODAY, PENDING, REVIEWS } from './data.mjs';

const OWNER = { owner: true, noCat: true };
const shop = SHOPS[0];
const HOURS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

const dayNav = (label, right = '') => `<div class="row-b wrap-row mb6">
  <div class="row-c"><button class="btn btn-ghost btn-sm" type="button" data-toast="어제로 이동했어요">‹</button>
    <h1 class="t-page" style="font-size:28px">${label}</h1>
    <button class="btn btn-ghost btn-sm" type="button" data-toast="내일로 이동했어요">›</button>
    <button class="btn btn-ghost btn-sm" type="button" data-toast="오늘로 돌아왔어요">오늘</button></div>
  <div class="row-c">${right}</div></div>`;

/* ============================================================
   ST0101 — 오늘 예약
   ============================================================ */
export function ST0101(ctx) {
  const row = (t, o = {}) => `<tr class="${o.cls || ''}">
    <td><b>${t.tm}</b><div class="t-sub">${min2h(t.min)}</div></td>
    <td><b>${t.cx}</b><div class="t-sub">${t.tel}</div></td>
    <td>${t.menu}</td>
    <td>${t.dz}</td>
    <td>${stBadge(t.st)}${o.extra || ''}</td>
    <td class="right"><div class="btns" style="justify-content:flex-end;flex-wrap:nowrap">
      ${t.st === '완료' ? '<span class="t-sub">처리 완료</span>' : `
        <button class="btn btn-soft btn-sm" type="button" data-toast="${t.cx}님을 방문 완료로 바꿨어요">방문 완료</button>
        <button class="icon-btn" type="button" style="width:36px;height:36px" data-toast="${t.tel} 으로 연결합니다">📞</button>
        <a class="icon-btn" href="${link('ST0401')}" style="width:36px;height:36px" aria-label="예약 상세">⋯</a>`}
    </div></td></tr>`;

  const head = [{ t: '시간', w: '110px' }, { t: '고객', w: '150px' }, '시술', { t: '담당', w: '90px' }, { t: '상태', w: '130px' }, { t: '', w: '230px' }];
  const summary = (o = {}) => `<div class="g4 g1-m mb6">
    ${stat('14<span class="u">건</span>', '오늘 예약', { ic: '📋' })}
    ${stat('2<span class="u">건</span>', '접수 대기', { ic: '⏳', d: `<a class="btn-link" href="${link('ST0501')}">처리하러 가기</a>` })}
    ${stat('9<span class="u">건</span>', '방문 완료', { ic: '✅', cls: 'mut' })}
    ${stat('1<span class="u">건</span>', '노쇼', { ic: '🚫', cls: 'mut' })}
  </div>`;

  if (ctx.id === 'ST0102') {
    const modal = modalEl('방문 완료로 바꿀까요?',
      `${kv([['고객', '최유나 <span class="t-sub">010-4567-8901</span>'], ['시술', '볼륨 매직 (약 2시간 30분)'], ['예약', '오늘 13:00 시작']])}
       <div class="field mt4"><div class="label">실제 시술 종료 시각</div>
         <input class="input" type="time" value="15:40">
         <p class="hint">예정보다 10분 늦게 끝났어요. 다음 예약 시간에 반영됩니다.</p></div>
       <div class="field"><div class="label">현장에서 받은 금액</div>
         <div class="field-btn"><input class="input" type="text" value="100,000">
           <button class="btn btn-ghost" type="button" data-toast="예정 금액을 넣었어요">예정액</button></div>
         <p class="hint">예약금 20,000원을 뺀 금액이에요.</p></div>
       <div class="field"><div class="label">사용 제품 메모 <span class="t-sub">(다음 방문 때 보여요)</span></div>
         <textarea class="textarea" style="min-height:88px">웰라 코렉션 8/1 + 올라플렉스 3단계. 뿌리 볼륨 약하게, 다음엔 열 온도 낮춰서.</textarea></div>`,
      `${btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })}${btn('방문 완료로 바꾸기', { cls: 'btn-primary', attr: ' data-dismiss data-toast="방문 완료로 바꿨어요. 5분 안에 되돌릴 수 있어요" data-toast-kind="ok"' })}`,
      { lg: true });
    return {
      body: `${dayNav('2026년 9월 12일 (토)')}${summary()}
        ${banner('ok', '✅', '<b>최유나님을 방문 완료로 바꿨어요.</b><div class="t-sub mt1">잘못 눌렀다면 <b data-count="300">5:00</b> 안에 되돌릴 수 있어요.</div>',
          { cls: 'mb4', right: btn('되돌리기', { cls: 'btn-soft', attr: ' data-toast="방문 완료를 되돌렸어요"' }) })}
        ${table(head, TODAY.map((t) => row(t, { cls: t.now ? 'is-now' : '' })).map((h) => ({ cells: [h] })).length ? [] : [], { fix: true })}
        <div class="table-wrap table-scroll"><table class="table table-fix">
          <thead><tr>${head.map((h) => `<th style="width:${h.w || 'auto'}">${h.t != null ? h.t : h}</th>`).join('')}</tr></thead>
          <tbody>${TODAY.map((t) => row(t, { cls: t.cx === '최유나' ? 'is-now' : '' })).join('')}</tbody></table></div>`,
      o: { ...OWNER, state: '방문 완료 처리', after: modal },
    };
  }

  if (ctx.id === 'ST0103') {
    return {
      body: `${dayNav('2026년 9월 12일 (토)')}${summary()}
        ${banner('danger', '⚠️', '<b>김수현 원장의 예약 두 건이 겹쳐요.</b><div class="t-sub mt1">17:00 시작 예약이 아직 안 끝났는데 18:00 예약이 잡혀 있어요.</div>',
          { cls: 'mb4', right: btn('시간 조정하기', { cls: 'btn-soft', href: 'ST0201' }) })}
        ${card('겹치는 두 건', `<div class="g2 g1-m">
          <div class="box-danger"><div class="row-c mb2">${badge('17:00 ~ 17:40', 'b-danger')}${badge('지각', 'b-warn')}</div>
            <b>남기훈 · 여성 커트</b><p class="t-sub mt1">김수현 원장 · 약 40분</p>
            <p class="t-sub mt2 danger">17:12 현재 미방문 — 끝나는 시각이 18:20으로 밀릴 수 있어요</p></div>
          <div class="box-danger"><div class="row-c mb2">${badge('18:00 ~ 20:00', 'b-danger')}</div>
            <b>윤채원 · 레이어드 펌</b><p class="t-sub mt1">김수현 원장 · 약 2시간</p>
            <p class="t-sub mt2 danger">앞 예약과 최대 20분 겹칩니다</p></div>
        </div>
        <div class="hr"></div>
        <div class="btns">${btn('윤채원님 시간 미루기', { cls: 'btn-primary', href: 'ST0201' })}
          ${btn('담당을 박지은 실장으로', { cls: 'btn-ghost', attr: ' data-toast="박지은 실장으로 바꿀까요? 고객에게 알림이 갑니다"' })}
          ${btn('고객에게 안내 문자', { cls: 'btn-ghost', href: 'ST0404' })}</div>`, { cls: 'mb6' })}
        <div class="table-wrap table-scroll"><table class="table table-fix">
          <thead><tr>${head.map((h) => `<th style="width:${h.w || 'auto'}">${h.t != null ? h.t : h}</th>`).join('')}</tr></thead>
          <tbody>${TODAY.map((t) => row(t, { cls: (t.cx === '남기훈' || t.cx === '윤채원') ? 'is-diff' : '' })).join('')}</tbody></table></div>`,
      o: { ...OWNER, state: '시간대 겹침 경고' },
    };
  }

  if (ctx.id === 'ST0104') {
    return {
      body: `${dayNav('2026년 9월 12일 (토)')}${summary()}
        ${banner('warn', '⏰', '<b>남기훈님이 예정 시각보다 12분 늦고 있어요.</b><div class="t-sub mt1">17:00 예약인데 아직 안 오셨어요. 15분이 더 지나면 노쇼로 바꿀 수 있어요.</div>',
          { cls: 'mb4', right: `<div class="btns">${btn('전화 걸기', { cls: 'btn-soft', attr: ' data-toast="010-9012-3456 으로 연결합니다"' })}${btn('노쇼 처리', { cls: 'btn-ghost', href: 'ST0601' })}</div>` })}
        ${card('지각으로 생기는 영향', `
          <div class="row-b wrap-row mb3"><b>지금 시각 17:12</b><span class="t-sub">경과 <b class="danger" data-count="720">12:00</b></span></div>
          ${table(['시간', '고객', '시술', '예상 밀림'], [
            { cells: ['17:00', '남기훈', '여성 커트 (40분)', '<span class="danger">+12분 (미방문)</span>'], cls: 'is-diff' },
            { cells: ['18:00', '윤채원', '레이어드 펌 (2시간)', '<span class="warning">+12분</span>'], cls: 'is-diff' },
            ['19:30', '문가영', '모발 클리닉 (45분)', '영향 없음'],
          ], { fix: false })}
          <div class="btns mt4">${btn('뒤 예약 고객에게 안내 문자', { cls: 'btn-soft', href: 'ST0404' })}</div>`, { cls: 'mb6' })}
        <div class="table-wrap table-scroll"><table class="table table-fix">
          <thead><tr>${head.map((h) => `<th style="width:${h.w || 'auto'}">${h.t != null ? h.t : h}</th>`).join('')}</tr></thead>
          <tbody>${TODAY.map((t) => row(t, { cls: t.late ? 'is-diff' : '' })).join('')}</tbody></table></div>`,
      o: { ...OWNER, state: '지각·시술 지연' },
    };
  }

  return {
    body: `${dayNav('2026년 9월 12일 (토)', `${btn('캘린더로 보기', { cls: 'btn-ghost', href: 'ST0201' })}${btn('접수 대기 3건', { cls: 'btn-primary', href: 'ST0501' })}`)}
      ${summary()}
      <div class="table-wrap table-scroll"><table class="table table-fix">
        <thead><tr>${head.map((h) => `<th style="width:${h.w || 'auto'}">${h.t != null ? h.t : h}</th>`).join('')}</tr></thead>
        <tbody>${TODAY.map((t) => row(t, { cls: t.now ? 'is-now' : '' })).join('')}</tbody></table></div>
      <div class="row-c mt4 t-sub" style="gap:16px;flex-wrap:wrap">
        ${badge('확정', 'b-ok')} ${badge('대기', 'b-warn')} ${badge('완료', 'b-mut')} ${badge('노쇼', 'b-danger')} ${badge('진행 중', 'b-pri')}
        <span>행을 누르면 예약 상세로 갑니다</span></div>`,
    o: OWNER,
  };
}
export const ST0102 = ST0101, ST0103 = ST0101, ST0104 = ST0101;

/* ============================================================
   ST0201 — 예약 캘린더 (디자이너별 타임 그리드)
   ============================================================ */
function timeGrid(o = {}) {
  const days = ['9/8 월', '9/9 화', '9/10 수', '9/11 목', '9/12 금', '9/13 토', '9/14 일'];
  /* [고객명, 시술, 색, 몇 시간짜리인지] — 블록 높이가 소요시간에 비례한다 */
  const blocks = {
    '11:00-1': ['유진아', '여성 커트 40분', 'blk-1', 0.7], '13:00-2': ['최유나', '볼륨 매직 2시간 30분', 'blk-2', 2.5],
    '14:00-4': ['박서연', '젤 원컬러 1시간', 'blk-3', 1], '15:00-5': ['김도현', '남성 커트 30분', 'blk-1', 0.5],
    '17:00-3': ['남기훈', '여성 커트 40분', 'blk-2', 0.7], '18:00-5': ['윤채원', '레이어드 펌 2시간', 'blk-4', 2],
    '10:00-2': ['서예린', '젤 아트 1시간 30분', 'blk-3', 1.5], '16:00-6': ['오지훈', '두피 케어 50분', 'blk-1', 0.85],
    '12:00-6': ['한소희', '뿌리 염색 1시간', 'blk-2', 1], '19:00-4': ['조현우', '남성 커트 30분', 'blk-4', 0.5],
  };
  const rows = HOURS.map((h) => `<tr><td>${h}</td>${days.map((d, i) => {
    const closed = i === 0;                         // 월요일 정기 휴무
    const key = `${h}-${i}`;
    const b = blocks[key];
    const drag = o.drag && key === '13:00-2';
    return `<td class="${closed ? 'closed' : ''}">${b
      ? `<div class="blk ${b[2]}${b[3] < 0.85 ? ' sm' : ''}${drag ? ' ghost' : ''}" style="--h:${b[3]}" title="${b[0]} · ${b[1]}">${b[0]}<div class="c">${b[1]}</div></div>`
      : (drag && key === '15:00-2' ? '<div class="blk blk-2" style="--h:2.5;opacity:.7;border-left-style:dashed">최유나<div class="c">여기로 옮기는 중</div></div>' : '')}</td>`;
  }).join('')}</tr>`).join('');
  return `<div class="tgrid"><table>
    <thead><tr><th>시간</th>${days.map((d, i) => `<th>${d}${i === 0 ? '<div style="font-weight:400">휴무</div>' : ''}</th>`).join('')}</tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

export function ST0201(ctx) {
  const bar = `<div class="row-b wrap-row mb4">
    ${tabs([{ label: '주 보기', pane: 'w' }, { label: '월 보기', go: 'ST0203' }], ctx.id === 'ST0203' ? 1 : 0, { pill: true })}
    <div class="row-c">
      <select class="select" style="width:auto"><option>디자이너 전체</option>${DESIGNERS.map((d) => `<option>${d.nm} ${d.rank}</option>`).join('')}</select>
      ${btn('오늘 예약 목록', { cls: 'btn-ghost', href: 'ST0101' })}</div></div>`;

  const legend = `<div class="row-c mt4 t-sub" style="gap:16px;flex-wrap:wrap">
    ${DESIGNERS.slice(0, 4).map((d, i) => `<span class="row-c"><i style="width:14px;height:14px;border-radius:4px;display:inline-block;background:${['var(--pri-10)', 'rgba(245,158,11,.16)', 'rgba(15,122,82,.12)', 'rgba(122,101,96,.14)'][i]};border-left:3px solid ${['var(--primary)', 'var(--accent)', 'var(--success)', 'var(--muted)'][i]}"></i> ${d.nm}</span>`).join('')}
    <span>빗금 = 휴무·휴가 · 빈 칸을 누르면 예약을 넣을 수 있어요</span></div>`;

  if (ctx.id === 'ST0202') {
    const modal = modalEl('이 예약을 옮길까요?',
      `${kv([['고객', '최유나 <span class="t-sub">010-4567-8901</span>'], ['시술', '볼륨 매직 (약 2시간 30분)'],
        ['원래', '<s class="muted">9/9(화) 13:00 ~ 15:30</s>'], ['옮길 곳', '<b>9/9(화) 15:00 ~ 17:30</b>']])}
       ${banner('ok', '✅', '옮기려는 시간에 다른 예약이 없어요.', { cls: 'mt4' })}
       <div class="field mt4"><div class="label">고객에게 알릴까요</div>
         <div class="radio-list">
           <label class="radio on" data-group="noti"><input type="radio" name="noti" checked><span class="grow"><b>알림톡으로 알리기</b><span class="t-sub" style="display:block">“예약 시간이 15:00으로 변경됐어요” 문구가 나갑니다</span></span></label>
           <label class="radio" data-group="noti"><input type="radio" name="noti"><span class="grow"><b>알리지 않기</b><span class="t-sub" style="display:block">직접 통화하신 경우에만 고르세요</span></span></label>
         </div></div>`,
      `${btn('되돌리기', { cls: 'btn-ghost', attr: ' data-dismiss' })}${btn('옮기기', { cls: 'btn-primary', attr: ' data-dismiss data-toast="예약을 옮기고 고객에게 알렸어요" data-toast-kind="ok"' })}`,
      { lg: true });
    return {
      body: `${pageHd('예약 캘린더')}${bar}
        ${banner('acc', '✋', '<b>최유나님 예약을 끌어서 옮기는 중이에요.</b><div class="t-sub mt1">회색 빗금 구간(휴무·휴가)에는 놓을 수 없어요.</div>', { cls: 'mb4' })}
        ${timeGrid({ drag: true })}${legend}`,
      o: { ...OWNER, state: '블록 드래그 이동', after: modal },
    };
  }

  if (ctx.id === 'ST0203') {
    const cells = Array.from({ length: 30 }, (_, i) => {
      const d = i + 1;
      const closed = [7, 14, 21, 28].includes(d);
      const cnt = closed ? 0 : (3 + (d * 7) % 12);
      const rate = Math.min(100, Math.round(cnt / 14 * 100));
      const full = cnt >= 13;
      return `<button class="cal-d ${closed ? 'off' : ''} ${full ? 'full' : ''}" type="button"${closed ? ' disabled' : ''} style="min-height:76px">
        ${d}<span class="p">${closed ? '휴무' : `${cnt}건 · ${rate}%`}</span>${full ? `<span class="p" style="color:var(--danger);font-weight:700">만석</span>` : ''}</button>`;
    }).join('');
    return {
      body: `${pageHd('예약 캘린더')}${bar}
        <div class="cal"><div class="cal-hd"><button class="btn btn-ghost btn-sm cal-mv" type="button" data-mv="-1">‹</button><b>2026년 9월</b><button class="btn btn-ghost btn-sm cal-mv" type="button" data-mv="1">›</button></div>
          <div class="cal-grid">${['일', '월', '화', '수', '목', '금', '토'].map((d) => `<span class="dow">${d}</span>`).join('')}<span></span><span></span>${cells}</div>
          <div class="row-c mt4 t-sub" style="gap:16px;flex-wrap:wrap"><span>숫자 = 예약 건수 · % = 가동률</span>
            <span class="muted">취소선 = 정기 휴무</span><span class="danger">만석 = 더 받을 자리가 없어요</span>
            <span>날짜를 누르면 그 주 보기로 갑니다</span></div></div>
        <div class="g4 g1-m mt6">
          ${stat('247<span class="u">건</span>', '이번 달 예약', { ic: '📋' })}
          ${stat('68<span class="u">%</span>', '평균 가동률', { ic: '📈' })}
          ${stat('4<span class="u">일</span>', '만석 날짜', { ic: '🔥', cls: 'mut' })}
          ${stat('9<span class="u">건</span>', '노쇼', { ic: '🚫', cls: 'mut' })}</div>`,
      o: { ...OWNER, state: '월 보기 전환' },
    };
  }

  return { body: `${pageHd('예약 캘린더', '2026년 9월 8일 ~ 9월 14일')}${bar}${timeGrid()}${legend}`, o: OWNER };
}
export const ST0202 = ST0201, ST0203 = ST0201;

/* ============================================================
   ST0301 — 예약 없음
   ============================================================ */
export function ST0301(ctx) {
  const checklist = (o = {}) => card('혹시 이런 설정을 확인해 보세요', `
    ${[
      ['휴무일로 설정돼 있지 않나요?', '9월 12일은 정기 휴무가 아니에요', 'MG0401', true],
      ['시술 메뉴가 등록돼 있나요?', o.bad ? '등록된 시술이 3개뿐이에요. 최소 5개를 권해요' : '12개 시술이 등록돼 있어요', 'MG0101', !o.bad],
      ['디자이너 근무 일정이 있나요?', '9월 12일 근무자가 2명 있어요', 'MG0301', true],
      ['매장이 검색에 노출되고 있나요?', o.bad ? '노출이 중단된 상태예요' : '정상 노출 중이에요', 'ST0302', !o.bad],
    ].map(([q, a, go, ok]) => `<div class="list-row">
      <span class="none" style="font-size:20px">${ok ? '✅' : '⚠️'}</span>
      <div class="grow"><b>${q}</b><p class="t-sub mt1 ${ok ? '' : 'danger'}">${a}</p></div>
      <div class="none">${btn(ok ? '확인' : '고치기', { cls: ok ? 'btn-ghost btn-sm' : 'btn-primary btn-sm', href: go })}</div></div>`).join('')}`);

  if (ctx.id === 'ST0302') {
    return {
      body: `${dayNav('2026년 9월 12일 (토)')}
        ${banner('danger', '🚨', `<b>매장이 검색에 나오지 않고 있어요.</b>
          <div class="t-sub mt1">9월 5일부터 노출이 멈춰 있어요. 그래서 새 예약이 들어오지 않습니다.</div>`,
          { cls: 'mb6', right: btn('노출 다시 켜기', { cls: 'btn-primary', attr: ' data-toast="노출을 다시 켰어요. 반영까지 10분쯤 걸려요" data-toast-kind="ok"' }) })}
        ${card('노출이 멈춘 이유', `
          <div class="list-row"><span class="none" style="font-size:20px">⚠️</span>
            <div class="grow"><b>사업자등록증 유효기간이 지났어요</b><p class="t-sub mt1 danger">2026년 8월 31일 만료 — 새 서류를 올려주세요</p></div>
            <div class="none">${btn('서류 올리기', { cls: 'btn-primary btn-sm', href: 'PT0202' })}</div></div>
          <div class="list-row"><span class="none" style="font-size:20px">⏳</span>
            <div class="grow"><b>재심사가 진행 중이에요</b><p class="t-sub mt1">서류를 올리면 1~2영업일 안에 확인해요</p></div>
            <div class="none">${btn('심사 현황', { cls: 'btn-ghost btn-sm', href: 'PT0301' })}</div></div>`, { cls: 'mb6' })}
        ${checklist({ bad: true })}`,
      o: { ...OWNER, state: '노출 중단 감지' },
    };
  }

  return {
    body: `${dayNav('2026년 9월 12일 (토)')}
      <div class="card mb6"><div class="card-bd">${empty('📭', '9월 12일에는 예약이 없어요',
        '토요일인데 비어 있네요. 아래 설정을 한 번 확인해 보세요.',
        `${btn('다른 날짜 보기', { cls: 'btn-primary btn-lg', href: 'ST0201' })}`)}</div></div>
      ${checklist()}`,
    o: OWNER,
  };
}
export const ST0302 = ST0301;

/* ============================================================
   ST0401 — 예약 상세 (매장)
   ============================================================ */
export function ST0401(ctx) {
  const cxInfo = (o = {}) => card('고객 정보', `
    <div class="row gap6 wrap-row">
      ${phAva(64, 'cx')}
      <div class="grow"><div class="row-c wrap-row"><b style="font-size:17px">유진아</b>${badge('단골', 'b-pri')}${o.noshow ? badge('노쇼 이력 2회', 'b-danger') : ''}</div>
        <p class="t-sub mt1">010-1234-5678 <button class="btn-link" type="button" data-toast="010-1234-5678 으로 연결합니다">전화</button></p></div>
      <div class="none">${kv([['총 방문', '<b>8회</b>'], ['최근 방문', '2026.08.05'], ['노쇼', o.noshow ? '<b class="danger">2회</b>' : '없음']])}</div>
    </div>`);

  const content = card('예약 내용', `
    ${kv([['예약번호', 'BK-20260912-0417'], ['시술', '발레아쥬 (3시간) · 모발 클리닉 (45분)'],
      ['옵션', '중단발 · 포인트 2개'], ['담당', '김수현 원장'], ['일시', '<b>2026.09.12(토) 14:00 ~ 17:45</b>'], ['총 소요', '3시간 45분']])}
    <div class="box-acc mt4"><div class="t-sub mb2">고객 요청사항</div>
      <b>앞머리는 짧게, 뿌리는 어둡게 부탁드려요.</b></div>`);

  const history = card('이전 시술 기록', `
    ${[['2026.08.05', '볼륨 매직', '김수현', '웰라 코렉션 8/1 · 올라플렉스 3단계. 뿌리 볼륨 약하게, 다음엔 열 온도 낮춰서.'],
      ['2026.06.20', '발레아쥬', '김수현', '9레벨까지 탈색. 두피 예민해서 보호제 2회. 톤은 애쉬 브라운.'],
      ['2026.04.11', '뿌리 염색', '박지은', '5N + 6N 1:1. 새치 없음.']].map(([d, m, dz, memo]) => `
      <div class="list-row" style="align-items:flex-start">
        <div class="none" style="width:96px"><b class="t-sub">${d}</b></div>
        <div class="grow"><b>${m}</b> <span class="t-sub">${dz}</span><p class="t-sub mt1">${memo}</p></div></div>`).join('')}`);

  const pay = card('결제 상태', `
    <div class="sum-row"><span>예약금 <span class="badge b-ok">결제 완료</span></span><span><b>20,000원</b></span></div>
    <div class="sum-row"><span>현장 결제 예정</span><span><b>218,900원</b></span></div>
    <div class="hr"></div>
    <p class="t-sub">쿠폰 10,000원 · 적립금 4,100원이 이미 반영된 금액이에요.</p>`);

  const actions = (o = {}) => card('상태 바꾸기', `<div class="btns" style="flex-direction:column">
    ${btn('예약 확정', { cls: 'btn-primary btn-block', attr: ' data-toast="예약을 확정하고 고객에게 알렸어요" data-toast-kind="ok"' })}
    ${btn('방문 완료 처리', { cls: 'btn-ghost btn-block', href: 'ST0102' })}
    ${btn('노쇼 처리', { cls: 'btn-danger btn-block', href: 'ST0601' })}</div>
    <div class="hr"></div>
    <div class="btns">${btn('고객에게 메시지', { cls: 'btn-soft btn-block', href: 'ST0404' })}</div>`);

  const memo = (o = {}) => card('내부 메모', o.full
    ? `<textarea class="textarea">모발 상태: 중간 손상. 지난 탈색 이력 2회.
사용 예정: 웰라 코렉션 8/1, 올라플렉스 1·2단계 필수.
두피 예민 — 보호제 먼저 바르고 시작할 것.</textarea>
       <div class="field mt4"><div class="label">누구까지 볼 수 있나요</div>
         <div class="radio-list">
           <label class="radio on" data-group="scope"><input type="radio" name="scope" checked><span class="grow"><b>담당 디자이너만</b></span></label>
           <label class="radio" data-group="scope"><input type="radio" name="scope"><span class="grow"><b>매장 전체</b> <span class="t-sub">디자이너가 바뀌어도 이어져요</span></span></label>
         </div></div>
       <label class="check"><input type="checkbox" checked> 다음 방문 때 이 메모를 맨 위에 보여주기</label>
       <div class="hr"></div>
       <div class="t-sub">수정 이력</div>
       <ul class="col mt2" style="gap:6px;font-size:13px;color:var(--muted)">
         <li>· 2026.09.05 18:22 김수현 — 두피 예민 내용 추가</li>
         <li>· 2026.08.05 15:41 김수현 — 최초 작성</li></ul>`
    : `<textarea class="textarea" style="min-height:96px" placeholder="시술 기록, 사용 제품, 모발 상태를 적어두면 다음 방문 때 보여드려요.">두피 예민 — 보호제 먼저.</textarea>
       <div class="btns mt3">${btn('저장', { cls: 'btn-soft btn-block', href: 'ST0403' })}</div>`);

  if (ctx.id === 'ST0402') {
    return {
      body: `${pageHd('예약 상세')}
        ${banner('warn', '⚠️', '<b>이 고객은 노쇼 이력이 2회 있어요.</b><div class="t-sub mt1">마지막 노쇼는 2026년 7월 14일이에요. 예약금을 미리 받으시길 권해요.</div>',
          { cls: 'mb6', right: btn('이력 자세히', { cls: 'btn-soft', attr: ' data-modal="m-ns"' }) })}
        <div class="split-r"><div class="col gap6">${cxInfo({ noshow: true })}
          ${card('노쇼·당일 취소 이력', table(['날짜', '시술', '담당', '구분'], [
            { cells: ['2026.07.14', '피부 관리 60분', '박지은', '<span class="danger">노쇼</span>'], cls: 'is-diff' },
            { cells: ['2026.05.02', '속눈썹 연장', '최민서', '<span class="danger">노쇼</span>'], cls: 'is-diff' },
            ['2026.03.20', '여성 커트', '이도윤', '당일 취소'],
          ], { fix: false }))}
          ${content}${history}</div>
        <div class="sticky">${pay}
          <div class="mt4">${card('이 고객 표시', `<label class="check"><input type="checkbox" checked> 주의 고객으로 표시
            <span class="sub">예약 목록에서 이 고객 옆에 표시가 붙어요. 고객에게는 보이지 않아요.</span></label>
            <div class="hr"></div>
            ${banner('mut', '💡', '예약금 비율을 <b>50%</b>로 올리면 노쇼가 줄어요.', { right: btn('설정', { cls: 'btn-soft btn-sm', href: 'MG0401' }) })}`)}</div>
          <div class="mt4">${actions()}</div></div></div>
        ${modalTpl('m-ns', '노쇼 이력', `${table(['날짜', '매장', '시술'], [
          ['2026.07.14', '우리 매장', '피부 관리 60분'], ['2026.05.02', '다른 매장', '속눈썹 연장'],
        ], { fix: false })}<p class="hint mt3">다른 매장에서의 이력은 매장명이 보이지 않아요.</p>`,
          btn('닫기', { cls: 'btn-ghost btn-block', attr: ' data-dismiss' }))}`,
      o: { ...OWNER, state: '고객 노쇼 이력' },
    };
  }

  if (ctx.id === 'ST0403') {
    return {
      body: `${pageHd('예약 상세')}
        <div class="split-r"><div class="col gap6">${cxInfo()}${content}${memo({ full: true })}${history}</div>
        <div class="sticky">${pay}<div class="mt4">${actions()}</div></div></div>`,
      o: { ...OWNER, state: '내부 메모 작성' },
    };
  }

  if (ctx.id === 'ST0404') {
    const modal = modalEl('고객에게 메시지 보내기',
      `<div class="field"><div class="label">어떤 내용인가요</div>
        ${chips(['예약 확정 안내', '방문 하루 전 알림', '시간 변경 요청', '직접 쓰기'], 0)}</div>
       <div class="field"><div class="label">내용</div>
         <textarea class="textarea" style="min-height:132px">[살롱 드 코랄] 유진아님, 9월 12일(토) 14:00 발레아쥬 예약이 확정됐어요. 시술이 3시간 45분 걸리니 시간 여유 있게 와주세요. 문의 02-000-0000</textarea>
         <p class="hint">78자 / 알림톡 1건 (90자까지)</p></div>
       <div class="field"><div class="label">어떻게 보낼까요</div>
         <div class="radio-list">
           <label class="radio on" data-group="ch"><input type="radio" name="ch" checked><span class="grow"><b>알림톡</b> <span class="t-sub">건당 15원 · 카카오로 도착</span></span></label>
           <label class="radio" data-group="ch"><input type="radio" name="ch"><span class="grow"><b>문자(LMS)</b> <span class="t-sub">건당 33원 · 알림톡 실패 시 자동 전환</span></span></label>
         </div></div>
       <div class="field"><div class="label">언제 보낼까요</div>
         <div class="field-row"><select class="select"><option>지금 바로</option><option>예약 시간 지정</option></select>
           <input class="input" type="datetime-local" value="2026-09-11T18:00" disabled></div></div>`,
      `${btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })}${btn('보내기', { cls: 'btn-primary', attr: ' data-dismiss data-toast="알림톡을 보냈어요 (1건 · 15원)" data-toast-kind="ok"' })}`,
      { lg: true });
    return {
      body: `${pageHd('예약 상세')}
        <div class="split-r"><div class="col gap6">${cxInfo()}${content}
          ${card('보낸 메시지', table(['보낸 때', '내용', '채널', '결과'], [
            ['09.04 21:13', '예약이 접수됐어요', '알림톡', '<span class="success">도착</span>'],
            ['09.05 10:02', '예약이 확정됐어요', '알림톡', '<span class="success">도착</span>'],
          ], { fix: false }))}
          ${history}</div>
        <div class="sticky">${pay}<div class="mt4">${actions()}</div></div></div>`,
      o: { ...OWNER, state: '고객 메시지 발송', after: modal },
    };
  }

  return {
    body: `${pageHd('예약 상세')}
      <div class="split-r"><div class="col gap6">${cxInfo()}${content}${history}${memo()}</div>
      <div class="sticky">${pay}<div class="mt4">${actions()}</div>
        <div class="mt4">${card('', `<div class="t-sub">이 예약은</div><div class="mt2">${stBadge('확정')}</div>
          <p class="t-sub mt3">9월 11일 18:00까지 고객이 무료 취소할 수 있어요.</p>`)}</div></div></div>`,
    o: OWNER,
  };
}
export const ST0402 = ST0401, ST0403 = ST0401, ST0404 = ST0401;

/* ============================================================
   ST0501 — 예약 접수 대기
   ============================================================ */
export function ST0501(ctx) {
  const pcard = (p, o = {}) => `<div class="hcard ${p.over ? 'is-alert' : ''}">
    ${phAva(56, p.cx)}
    <div class="grow">
      <div class="row-c wrap-row mb2"><b style="font-size:16px">${p.cx}</b>
        ${p.over ? badge('응답 기한 초과', 'b-danger') : badge(`${p.left} 남음`, 'b-warn')}
        ${p.ok ? badge('예약 가능', 'b-ok') : badge('다른 예약과 겹침', 'b-danger')}</div>
      <p><b>${p.menu}</b></p>
      <p class="t-sub mt1">희망 ${p.want} · ${p.ago} 요청 · ${p.tel}</p>
      ${p.why ? `<p class="t-sub mt1 danger">${p.why}</p>` : ''}
    </div>
    <div class="none btns" style="flex-direction:column;min-width:132px">
      ${p.over
        ? `${btn('자동 취소됨', { cls: 'btn-ghost btn-block btn-sm', off: true })}${btn('고객에게 사과 문자', { cls: 'btn-ghost btn-block btn-sm', href: 'ST0404' })}`
        : `${btn('확정', { cls: 'btn-primary btn-block btn-sm', attr: ` data-toast="${p.cx}님 예약을 확정했어요" data-toast-kind="ok"` })}
           ${btn('다른 시간 제안', { cls: 'btn-ghost btn-block btn-sm', href: 'ST0502' })}
           ${btn('거절', { cls: 'btn-ghost btn-block btn-sm', attr: ' data-modal="m-reject"' })}`}
    </div></div>`;

  const rejectTpl = modalTpl('m-reject', '왜 거절하시나요?',
    `<p class="t-sub mb4">고객에게 사유가 그대로 전달돼요. 예약금은 바로 전액 환불됩니다.</p>
     <div class="radio-list">
       <label class="radio on" data-group="rj"><input type="radio" name="rj" checked><span class="grow"><b>그 시간은 예약이 찼어요</b></span></label>
       <label class="radio" data-group="rj"><input type="radio" name="rj"><span class="grow"><b>지정하신 디자이너가 그날 근무하지 않아요</b></span></label>
       <label class="radio" data-group="rj"><input type="radio" name="rj"><span class="grow"><b>요청하신 시술을 진행하기 어려워요</b></span></label>
       <label class="radio" data-group="rj"><input type="radio" name="rj"><span class="grow"><b>직접 쓰기</b></span></label>
     </div>
     ${banner('mut', '💡', '거절보다 <b>다른 시간 제안</b>이 예약으로 이어질 확률이 3배 높아요.', { cls: 'mt4' })}`,
    `${btn('다른 시간 제안하기', { cls: 'btn-ghost', href: 'ST0502' })}${btn('거절하고 환불', { cls: 'btn-danger', attr: ' data-dismiss data-toast="예약을 거절하고 예약금을 환불했어요"' })}`);

  if (ctx.id === 'ST0502') {
    const modal = modalEl('다른 시간 제안하기',
      `${card('', kv([['고객', '박서연'], ['시술', '젤 아트(2P) · 약 1시간 30분'], ['원래 희망', '<s class="muted">9/13(토) 16:00</s>']]), { cls: 'box-mut' })}
       <div class="field mt4"><div class="label">제안할 시간 <span class="t-sub">(최대 3개)</span></div>
         ${chips(['9/13(토) 14:00', '9/13(토) 18:00', '9/14(일) 11:00', '9/15(월) 15:00', '9/16(화) 16:00'], [0, 1, 2])}
         <p class="hint">지금 비어 있는 시간만 보여드려요.</p></div>
       <div class="field"><div class="label">담당 디자이너</div>
         <select class="select"><option>박지은 실장 (원래 지정)</option><option>김수현 원장 — 지명료 5,000원 더 들어요</option><option>지정 안 함</option></select></div>
       <div class="field"><div class="label">함께 보낼 말</div>
         <textarea class="textarea" style="min-height:88px">죄송해요, 16시는 앞 예약이 길어져 어렵습니다. 대신 아래 시간은 어떠세요?</textarea></div>
       <div class="field"><div class="label">언제까지 답을 받을까요</div>
         <select class="select"><option>6시간 안에</option><option>12시간 안에</option><option>하루 안에</option></select>
         <p class="hint">기한이 지나면 예약은 자동 취소되고 예약금이 환불돼요.</p></div>`,
      `${btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })}${btn('제안 보내기', { cls: 'btn-primary', attr: ' data-dismiss data-toast="대체 시간 3개를 제안했어요" data-toast-kind="ok"' })}`,
      { lg: true });
    return {
      body: `${pageHd('예약 접수 대기')}<div class="col gap6">${PENDING.map((p) => pcard(p)).join('')}</div>${rejectTpl}`,
      o: { ...OWNER, state: '대체 시간 제안', after: modal },
    };
  }

  if (ctx.id === 'ST0503') {
    return {
      body: `${pageHd('예약 접수 대기')}
        ${banner('danger', '⏰', `<b>기한 안에 답하지 못한 예약 2건이 자동 취소됐어요.</b>
          <div class="t-sub mt1">고객에게는 “매장이 확인하지 못해 취소됐다”고 안내되고 예약금이 전액 환불됩니다.</div>`, { cls: 'mb6' })}
        ${card('자동 취소된 예약', table(['고객', '시술', '희망 일시', '요청', '사유'], [
          { cells: ['김도현', '남성 커트 + 두피 케어', '9/15(월) 19:30', '2시간 전', '<span class="danger">기한 내 미응답</span>'], cls: 'is-diff' },
          { cells: ['서예린', '젤 아트(2P)', '9/14(일) 13:00', '4시간 전', '<span class="danger">기한 내 미응답</span>'], cls: 'is-diff' },
        ], { fix: false }), { ft: '<span class="t-sub">환불은 자동으로 처리됐어요. 매장이 따로 하실 일은 없습니다.</span>', cls: 'mb6' })}
        ${banner('warn', '📉', `<b>응답률이 78%로 떨어졌어요. (지난달 94%)</b>
          <div class="t-sub mt1">응답률이 80% 아래로 내려가면 검색 순위가 낮아져요. 2시간 안에 답하시면 다시 올라갑니다.</div>`, { cls: 'mb6' })}
        <div class="col gap6">${PENDING.map((p) => pcard(p)).join('')}</div>${rejectTpl}`,
      o: { ...OWNER, state: '응답 기한 초과' },
    };
  }

  return {
    body: `${pageHd('예약 접수 대기', '2시간 안에 답하지 않으면 자동 취소돼요')}
      <div class="row-b wrap-row mb6"><div class="row-c"><b class="t-sec">접수 대기 3건</b>${badge('가장 급한 건 55분 남음', 'b-warn')}</div>
        ${btn('가능한 건 한 번에 확정', { cls: 'btn-primary', attr: ' data-toast="예약 가능한 2건을 한 번에 확정했어요" data-toast-kind="ok"' })}</div>
      <div class="col gap6">${PENDING.map((p) => pcard(p)).join('')}</div>
      ${banner('mut', '💡', '설정에서 <b>자동 확정</b>을 켜면 겹치지 않는 예약은 알아서 확정돼요.', { cls: 'mt6', right: btn('설정 보기', { cls: 'btn-soft', href: 'MG0401' }) })}
      ${rejectTpl}`,
    o: OWNER,
  };
}
export const ST0502 = ST0501, ST0503 = ST0501;

/* ============================================================
   ST0601 — 노쇼 처리 확인
   ============================================================ */
export function ST0601(ctx) {
  const back = `${pageHd('오늘 예약')}
    <div class="table-wrap table-scroll"><table class="table table-fix">
      <thead><tr><th style="width:110px">시간</th><th style="width:150px">고객</th><th>시술</th><th style="width:90px">담당</th><th style="width:130px">상태</th></tr></thead>
      <tbody>${TODAY.slice(8, 14).map((t) => `<tr class="${t.st === '노쇼' ? 'is-diff' : ''}"><td><b>${t.tm}</b></td><td>${t.cx}</td><td>${t.menu}</td><td>${t.dz}</td><td>${stBadge(t.st)}</td></tr>`).join('')}</tbody>
    </table></div>`;

  if (ctx.id === 'ST0602') {
    const modal = modalEl('노쇼를 철회할까요?',
      `${card('', kv([['고객', '배수지'], ['시술', '눈썹 왁싱'], ['예약', '9월 12일(토) 20:30'], ['노쇼 처리', '2026.09.12 21:05 (3시간 전)']]), { cls: 'box-mut' })}
       ${banner('ok', '↩️', '<b>노쇼는 처리 후 24시간 안에만 철회할 수 있어요.</b><div class="t-sub mt1">남은 시간 <b data-count="75600">21:00:00</b></div>', { cls: 'mt4' })}
       <div class="box mt4"><b class="t-sub">철회하면 이렇게 돼요</b>
         <ul class="col mt2" style="gap:6px;font-size:14px">
           <li>· 고객의 예약 제한(30일)이 <b>바로 풀려요</b></li>
           <li>· 매장으로 정산될 예정이던 예약금 20,000원이 <b>고객에게 환불</b>돼요</li>
           <li>· 예약 상태는 “취소”로 바뀝니다</li></ul></div>
       <div class="field mt4"><div class="label">철회 사유 <span class="req">*</span></div>
         <textarea class="textarea" style="min-height:88px" placeholder="예: 고객이 방문했는데 잘못 눌렀어요">고객이 20:40에 도착해 시술을 받았는데 잘못 처리했습니다.</textarea></div>`,
      `${btn('그대로 두기', { cls: 'btn-ghost', attr: ' data-dismiss' })}${btn('노쇼 철회하기', { cls: 'btn-primary', attr: ' data-dismiss data-toast="노쇼를 철회했어요. 고객 제한이 풀렸습니다" data-toast-kind="ok"' })}`,
      { lg: true });
    return { body: back, o: { ...OWNER, state: '노쇼 철회', after: modal } };
  }

  const modal = modalEl('이 예약을 노쇼로 처리할까요?',
    `${card('', kv([['고객', '배수지 <span class="t-sub">010-4455-6677</span>'], ['시술', '눈썹 왁싱 (20분)'],
      ['예약', '<b>9월 12일(토) 20:30</b>'], ['담당', '김수현 원장']]), { cls: 'box-mut' })}
     <div class="box-warn mt4"><div class="row-b"><b>이 고객의 노쇼 이력</b><b class="danger">1회</b></div>
       <p class="t-sub mt2">최근 노쇼: 2026년 6월 8일</p></div>
     <div class="box mt4"><b class="t-sub">노쇼로 처리하면</b>
       <ul class="col mt2" style="gap:6px;font-size:14px">
         <li>· 예약금 <b>20,000원</b>은 환불되지 않고 <b>매장으로 정산</b>돼요</li>
         <li>· 고객은 <b>30일간 예약이 제한</b>돼요</li>
         <li>· 고객에게 처리 결과가 알림으로 갑니다</li></ul></div>
     ${banner('danger', '⚠️', '<b>노쇼 처리 후에는 24시간 안에만 되돌릴 수 있어요.</b>')}
     <div class="field mt4"><div class="label">사유 메모 <span class="t-sub">(매장 내부에만 남아요)</span></div>
       <textarea class="textarea" style="min-height:88px" placeholder="예: 20:50까지 기다렸고 전화 3회 연결되지 않음">20:50까지 기다렸습니다. 전화 3회 연결되지 않았어요.</textarea></div>
     <label class="check mt3"><input type="checkbox" data-unlock="ns-btn"><span><b>위 내용을 확인했고, 노쇼로 처리합니다</b></span></label>`,
    `${btn('취소', { cls: 'btn-ghost', href: 'ST0101' })}
     <button class="btn btn-danger is-off" type="button" id="ns-btn" disabled>노쇼로 처리하기</button>`,
    { lg: true });

  return { body: back, o: { ...OWNER, after: modal } };
}
export const ST0602 = ST0601;

/* ============================================================
   MG0101 — 시술 메뉴 관리
   ============================================================ */
export function MG0101(ctx) {
  const catSide = (o = {}) => `<aside class="side">
    <div class="gl">카테고리 <span class="t-sub">(끌어서 순서 변경)</span></div>
    ${MENUS.map((g, i) => `<a href="#"${i === (o.cat || 0) ? ' class="on"' : ''}>⠿ ${g.cat} <span class="t-sub">${g.items.length}</span></a>`).join('')}
    <div style="padding:8px">${btn('+ 카테고리 추가', { cls: 'btn-ghost btn-block btn-sm', attr: ' data-toast="새 카테고리를 만들어요"' })}</div></aside>`;

  const itemRow = (m, o = {}) => `<tr class="${o.cls || ''}">
    <td style="width:40px" class="muted">⠿</td>
    <td>${phFix(['시술 대표', 1200, 900], 56, { seed: m.id })}</td>
    <td><b>${m.nm}</b>${m.opt ? ` ${badge('옵션 있음', 'b-line')}` : ''}${o.badge || ''}
      <div class="t-sub">${m.desc.slice(0, 28)}…</div></td>
    <td>${o.minCell || `${m.min}분`}</td>
    <td>${o.priceCell || won(m.price)}</td>
    <td><button class="toggle${m.hide || o.hidden ? '' : ' on'}" type="button" aria-label="노출"></button></td>
    <td class="right"><div class="btns" style="justify-content:flex-end;flex-wrap:nowrap">
      <button class="btn btn-ghost btn-sm" type="button" data-toast="${m.nm} 수정 패널을 엽니다">수정</button>
      <button class="btn btn-ghost btn-sm" type="button" data-toast="정말 지울까요? 이미 잡힌 예약은 유지돼요">삭제</button></div></td></tr>`;

  const head = ['', { t: '사진', w: '80px' }, '시술명', { t: '소요', w: '90px' }, { t: '가격', w: '120px' }, { t: '노출', w: '70px' }, { t: '', w: '150px' }];
  const listTable = (rows) => `<div class="table-wrap table-scroll"><table class="table table-fix">
    <thead><tr>${head.map((h) => `<th style="width:${h.w || 'auto'}">${h.t != null ? h.t : h}</th>`).join('')}</tr></thead>
    <tbody>${rows}</tbody></table></div>`;

  const editPanel = (o = {}) => card('시술 수정 — 발레아쥬', `
    <div class="field"><div class="label">시술명 <span class="req">*</span></div><input class="input ${o.err ? '' : ''}" type="text" value="발레아쥬"></div>
    <div class="field-row">
      <div class="field"><div class="label">소요시간(분) <span class="req">*</span></div>
        <input class="input ${o.err ? 'is-err' : ''}" type="number" value="${o.err ? '' : 180}" placeholder="예: 180">
        ${o.err ? '<p class="err">소요시간을 넣어야 예약 시간이 잡혀요</p>' : '<p class="hint">이 시간만큼 자리를 잡아요</p>'}</div>
      <div class="field"><div class="label">기본 가격(원) <span class="req">*</span></div>
        <input class="input ${o.err ? 'is-err' : ''}" type="number" value="${o.err ? '' : 165000}" placeholder="예: 165000">
        ${o.err ? '<p class="err">가격을 넣어야 고객 화면에 보여요</p>' : ''}</div></div>
    <div class="field"><div class="label">설명</div><textarea class="textarea" style="min-height:88px">탈색 후 톤을 얹는 시술. 모발 상태 확인이 필요해요.</textarea></div>
    <div class="field"><div class="label">옵션별 추가금</div>
      ${table(['옵션', '항목', '추가금', '추가시간'], OPTIONS.flatMap((g) => g.list.map(([nm, add, min], i) =>
        [i === 0 ? `<b>${g.g}</b>` : '', nm, `<input class="input" style="height:36px" type="text" value="${add}">`, `<input class="input" style="height:36px" type="text" value="${min}">`])), { fix: true })}</div>
    <div class="field"><div class="label">대표 사진</div>
      <div class="row wrap-row" style="gap:8px">${[0, 1].map((i) => phFix(['시술 대표', 1200, 900], 120, { seed: 'e' + i })).join('')}
        <div class="upload none" style="width:120px;padding:16px;display:flex;align-items:center;justify-content:center">＋</div></div>
      <p class="hint">1200×900 이상 · JPG·PNG · 최대 5장</p></div>`,
    { ft: `<div class="btns">${btn('취소', { cls: 'btn-ghost', attr: 'data-dismiss data-toast="고치던 내용을 버렸어요"' })}
      ${o.err
        ? '<button class="btn btn-primary grow is-off" type="button" disabled>빠진 항목을 채워주세요</button>'
        : btn('저장', { cls: 'btn-primary grow', attr: ' data-toast="시술을 저장했어요" data-toast-kind="ok"' })}</div>` });

  if (ctx.id === 'MG0102') {
    return {
      body: `${pageHd('시술 메뉴 관리')}
        ${banner('mut', '👁️', `<b>‘눈썹 왁싱’을 숨겼어요.</b>
          <div class="t-sub mt1">새 예약만 막혀요. <b>이미 잡힌 예약 3건은 그대로 진행</b>됩니다.</div>`,
          { cls: 'mb6', right: btn('다시 노출하기', { cls: 'btn-soft', attr: ' data-toast="눈썹 왁싱을 다시 노출했어요"' }) })}
        <div class="split">${catSide({ cat: 3 })}<div>
          <div class="row-b wrap-row mb4"><b class="t-sec">케어</b>${btn('+ 시술 추가', { cls: 'btn-primary', attr: 'data-toast="새 시술을 추가해요"' })}</div>
          ${listTable(MENUS[3].items.filter((m) => !m.hide).map((m) => itemRow(m)).join(''))}
          <div class="mt6"><div class="row-b mb3"><b class="t-card">숨긴 시술 <span class="t-sub">고객에게 보이지 않아요</span></b></div>
            ${listTable(MENUS[3].items.filter((m) => m.hide).map((m) => itemRow(m, { cls: 'is-off', hidden: true, badge: ` ${badge('숨김', 'b-mut')}` })).join(''))}</div>
          ${card('이미 잡힌 예약 3건', table(['일시', '고객', '담당'], [
            ['9/12(토) 20:30', '배수지', '김수현'], ['9/14(월) 11:00', '유진아', '박지은'], ['9/17(목) 19:00', '한소희', '박지은'],
          ], { fix: false }), { cls: 'mt6' })}
        </div></div>`,
      o: { ...OWNER, state: '시술 숨김 처리' },
    };
  }

  if (ctx.id === 'MG0103') {
    return {
      body: `${pageHd('시술 메뉴 관리')}
        ${banner('danger', '⚠️', `<b>2개 항목이 비어 있어 저장할 수 없어요.</b>
          <div class="t-sub mt1">소요시간과 가격은 예약을 받으려면 꼭 필요해요.</div>`,
          { cls: 'mb6', right: btn('빠진 항목으로 이동', { cls: 'btn-soft', attr: ' data-toast="첫 번째 빠진 항목으로 이동했어요"' }) })}
        <div class="split">${catSide({ cat: 1 })}<div>
          ${card('채워야 할 항목', `<ul class="col" style="gap:8px">
            <li>· <b>소요시간</b> — 이 값이 있어야 예약 시간이 잡혀요</li>
            <li>· <b>기본 가격</b> — 이 값이 있어야 고객 화면에 보여요</li></ul>`, { cls: 'mb4' })}
          ${editPanel({ err: true })}</div></div>`,
      o: { ...OWNER, state: '필수 항목 누락' },
    };
  }

  return {
    body: `${pageHd('시술 메뉴 관리', '고객이 예약할 때 보는 목록이에요. 순서는 끌어서 바꿀 수 있어요')}
      <div class="split">${catSide({ cat: 1 })}<div>
        <div class="row-b wrap-row mb4"><b class="t-sec">컬러 <span class="t-sub">3종</span></b>
          <div class="btns">${btn('사진 올리기', { cls: 'btn-ghost', href: 'MG0501' })}${btn('+ 시술 추가', { cls: 'btn-primary', attr: 'data-toast="새 시술을 추가해요"' })}</div></div>
        ${listTable(MENUS[1].items.map((m) => itemRow(m)).join(''))}
        <div class="mt6">${editPanel()}</div>
      </div></div>`,
    o: OWNER,
  };
}
export const MG0102 = MG0101, MG0103 = MG0101;

/* ============================================================
   MG0201 — 디자이너 관리
   ============================================================ */
export function MG0201(ctx) {
  const dCard = (d, o = {}) => `<div class="hcard ${d.off || o.warn ? 'is-alert' : ''}">
    <span class="none muted" style="font-size:18px;padding-top:20px">⠿</span>
    ${phAva(72, d.id)}
    <div class="grow">
      <div class="row-c wrap-row"><b style="font-size:17px">${d.nm}</b><span class="t-sub">${d.rank}</span>
        ${d.off ? badge('휴직', 'b-mut') : badge('재직', 'b-ok')}${o.badge || ''}</div>
      <div class="t-sub mt1">${stars(d.rate)} ${d.rate.toFixed(1)} · 이번 달 예약 ${[42, 38, 27, 0][DESIGNERS.indexOf(d)]}건</div>
      <div class="badges mt2">${d.tags.length ? d.tags.map((t) => badge(t, 'b-line')).join('') : `<span class="badge b-danger">담당 시술 미지정</span>`}</div>
      ${o.extra || ''}
    </div>
    <div class="none btns" style="flex-direction:column;min-width:120px">
      ${btn('수정', { cls: 'btn-ghost btn-block btn-sm', attr: ` data-toast="${d.nm} 정보를 수정합니다"` })}
      ${btn('근무 일정', { cls: 'btn-ghost btn-block btn-sm', href: 'MG0301' })}
      ${btn('포트폴리오', { cls: 'btn-ghost btn-block btn-sm', href: 'MG0501' })}</div></div>`;

  const editPanel = card('디자이너 수정 — 김수현', `
    <div class="row gap6 wrap-row mb4">${phAva(96, 'edit')}
      <div class="grow"><div class="btns">${btn('사진 바꾸기', { cls: 'btn-ghost btn-sm', href: 'MG0501' })}</div>
        <p class="hint mt2">정사각형(400×400 이상)으로 올려주세요. 고객 화면에서 원형으로 보여요.</p></div></div>
    <div class="field-row">
      <div class="field"><div class="label">이름 <span class="req">*</span></div><input class="input" type="text" value="김수현"></div>
      <div class="field"><div class="label">직급</div><select class="select"><option>원장</option><option>실장</option><option>디자이너</option><option>인턴</option></select></div></div>
    <div class="field"><div class="label">소개</div><textarea class="textarea" style="min-height:88px">경력 12년. 모발 손상도를 먼저 보고 시술 범위를 정하는 편이에요.</textarea></div>
    <div class="field"><div class="label">지명료(원)</div><input class="input" type="number" value="10000">
      <p class="hint">0으로 두면 지명료 없이 지정할 수 있어요.</p></div>
    <div class="field"><div class="label">담당 가능 시술 <span class="req">*</span></div>
      <div class="g2 g1-m">${ALL_ITEMS.slice(0, 8).map((m, i) =>
        `<label class="check"><input type="checkbox"${i < 5 ? ' checked' : ''}> ${m.nm} <span class="muted">${m.cat}</span></label>`).join('')}</div>
      <p class="hint">고른 시술만 이 디자이너로 예약할 수 있어요.</p></div>`,
    { ft: `<div class="btns">${btn('휴직으로 바꾸기', { cls: 'btn-ghost', href: 'MG0202' })}${btn('저장', { cls: 'btn-primary grow', attr: ' data-toast="저장했어요" data-toast-kind="ok"' })}</div>` });

  if (ctx.id === 'MG0202') {
    const modal = modalEl('휴직으로 바꿀까요?',
      `${card('', kv([['디자이너', '김수현 원장'], ['현재', '재직 중 · 이번 달 예약 42건']]), { cls: 'box-mut' })}
       ${banner('warn', '⚠️', '<b>휴직으로 바꾸면 새 예약을 받지 않아요.</b><div class="t-sub mt1">그런데 <b>이미 잡힌 예약이 11건</b> 있어요. 이 예약들을 어떻게 할지 정해주세요.</div>', { cls: 'mt4' })}
       <div class="field mt4"><div class="label">이미 잡힌 예약 11건</div>
         <div class="radio-list">
           <label class="radio on" data-group="reas"><input type="radio" name="reas" checked><span class="grow"><b>그대로 두기</b><span class="t-sub" style="display:block">휴직 시작일 전 예약은 예정대로 진행돼요</span></span></label>
           <label class="radio" data-group="reas"><input type="radio" name="reas"><span class="grow"><b>다른 디자이너에게 넘기기</b><span class="t-sub" style="display:block">박지은 실장에게 넘기고 고객에게 알림을 보내요</span></span></label>
           <label class="radio" data-group="reas"><input type="radio" name="reas"><span class="grow"><b>고객에게 알리고 각자 다시 잡게 하기</b><span class="t-sub" style="display:block">예약금은 전액 환불돼요</span></span></label>
         </div></div>
       <div class="field-row mt4">
         <div class="field"><div class="label">휴직 시작</div><input class="input" type="date" value="2026-09-15"></div>
         <div class="field"><div class="label">복귀 예정</div><input class="input" type="date" value="2026-10-06"></div></div>
       <p class="hint">복귀 예정일은 고객 화면에 “10월 6일 복귀 예정”으로 보여요.</p>`,
      `${btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })}${btn('휴직으로 바꾸기', { cls: 'btn-primary', attr: ' data-dismiss data-toast="김수현 원장을 휴직으로 바꿨어요" data-toast-kind="ok"' })}`,
      { lg: true });
    return {
      body: `${pageHd('디자이너 관리')}<div class="col gap6">${DESIGNERS.map((d) => dCard(d)).join('')}</div>`,
      o: { ...OWNER, state: '휴직 전환 확인', after: modal },
    };
  }

  if (ctx.id === 'MG0203') {
    return {
      body: `${pageHd('디자이너 관리')}
        ${banner('danger', '⚠️', `<b>최민서 디자이너는 담당 시술이 지정돼 있지 않아요.</b>
          <div class="t-sub mt1">이대로면 고객이 예약할 때 <b>목록에 나오지 않아요.</b> 어떤 시술을 맡는지 골라주세요.</div>`,
          { cls: 'mb6', right: btn('시술 지정하기', { cls: 'btn-primary', attr: ' data-modal="m-assign"' }) })}
        <div class="col gap6">${DESIGNERS.map((d, i) => dCard(d, i === 3
          ? { warn: true, badge: badge('예약 화면에 안 보임', 'b-danger'), extra: '<p class="t-sub mt2 danger">담당 시술을 하나 이상 골라야 예약을 받을 수 있어요</p>' }
          : {})).join('')}</div>
        ${modalTpl('m-assign', '담당 시술 지정 — 최민서', `
          <p class="t-sub mb4">이 디자이너가 할 수 있는 시술을 골라주세요. 고른 시술만 예약을 받아요.</p>
          <div class="row-b mb3"><b class="t-sub">네일</b><button class="btn-link" type="button" data-toast="네일 전체를 골랐어요">이 묶음 전체 고르기</button></div>
          ${MENUS[2].items.map((m) => `<label class="check"><input type="checkbox" checked> ${m.nm} <span class="muted">${m.min}분 · ${won(m.price)}</span></label>`).join('')}
          <div class="row-b mb3 mt4"><b class="t-sub">케어</b><button class="btn-link" type="button" data-toast="케어 전체를 골랐어요">이 묶음 전체 고르기</button></div>
          ${MENUS[3].items.map((m) => `<label class="check"><input type="checkbox"> ${m.nm} <span class="muted">${m.min}분 · ${won(m.price)}</span></label>`).join('')}`,
          `${btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' })}${btn('지정하기', { cls: 'btn-primary', attr: ' data-dismiss data-toast="담당 시술 3개를 지정했어요" data-toast-kind="ok"' })}`, { lg: true })}`,
      o: { ...OWNER, state: '담당 시술 미지정' },
    };
  }

  return {
    body: `${pageHd('디자이너 관리', '끌어서 순서를 바꾸면 고객 예약 화면에도 같은 순서로 보여요')}
      <div class="row-b wrap-row mb6"><span class="t-sub">재직 3명 · 휴직 1명</span>${btn('+ 디자이너 추가', { cls: 'btn-primary', attr: 'data-toast="새 디자이너를 추가해요"' })}</div>
      <div class="col gap6 mb8">${DESIGNERS.map((d) => dCard(d)).join('')}</div>
      ${editPanel}`,
    o: OWNER,
  };
}
export const MG0202 = MG0201, MG0203 = MG0201;

/* ============================================================
   MG0301 — 근무 일정 관리
   ============================================================ */
export function MG0301(ctx) {
  const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
  const weekTable = (o = {}) => `<div class="table-wrap table-scroll"><table class="table table-fix">
    <thead><tr><th style="width:80px">요일</th><th style="width:90px">근무</th><th>시작</th><th>종료</th><th>휴게</th><th style="width:120px"></th></tr></thead>
    <tbody>${DAYS.map((d, i) => {
      const off = i === 0 || (o.offDays || []).includes(i);
      return `<tr class="${off ? 'is-off' : ''} ${o.changed === i ? 'is-diff' : ''}">
        <td><b>${d}</b>${i === 0 ? '<div class="t-sub">매장 휴무</div>' : ''}</td>
        <td><button class="toggle${off ? '' : ' on'}" type="button" aria-label="${d} 근무"></button></td>
        <td>${off ? '<span class="muted">—</span>' : `<input class="input" style="height:36px" type="time" value="${o.changed === i ? '13:00' : '11:00'}">`}</td>
        <td>${off ? '<span class="muted">—</span>' : `<input class="input" style="height:36px" type="time" value="${i >= 5 ? '19:00' : '21:00'}">`}</td>
        <td>${off ? '<span class="muted">—</span>' : `<input class="input" style="height:36px" type="text" value="15:00~16:00">`}</td>
        <td class="right">${o.changed === i ? badge('바꿈', 'b-acc') : ''}</td></tr>`;
    }).join('')}</tbody></table></div>`;

  const dzTabs = tabs(DESIGNERS.map((d) => ({ label: `${d.nm} ${d.rank}` })), 0, { pill: true });

  const exceptions = (o = {}) => card('특정 날짜 예외', `
    <p class="t-sub mb4">반복 일정과 다르게 쉬거나 더 일하는 날을 여기에 넣어요. 예외가 반복 일정보다 우선해요.</p>
    <div class="field-row">
      <div class="field"><div class="label">시작 날짜</div><input class="input" type="date" value="2026-09-22"></div>
      <div class="field"><div class="label">끝 날짜</div><input class="input" type="date" value="2026-09-24"></div></div>
    <div class="field"><div class="label">구분</div>
      ${chips(['휴가', '조퇴', '추가 근무'], 0)}</div>
    <div class="field"><div class="label">시간</div>
      <div class="radio-list">
        <label class="radio on" data-group="ex"><input type="radio" name="ex" checked><span class="grow"><b>종일</b></span></label>
        <label class="radio" data-group="ex"><input type="radio" name="ex"><span class="grow"><b>일부 시간만</b> <span class="t-sub">시작·종료 시각을 정해요</span></span></label>
      </div></div>
    <div class="btns">${btn('예외 추가', { cls: 'btn-primary btn-block', attr: ' data-toast="9월 22~24일 휴가를 넣었어요" data-toast-kind="ok"' })}</div>
    <div class="hr"></div>
    <div class="t-sub mb2">등록된 예외</div>
    ${table(['기간', '구분', '시간', ''], [
      ['9/22 ~ 9/24', badge('휴가', 'b-pri'), '종일', '<button class="btn btn-ghost btn-sm" type="button" data-toast="예외를 지웠어요">삭제</button>'],
      ['9/30', badge('조퇴', 'b-warn'), '17:00부터', '<button class="btn btn-ghost btn-sm" type="button" data-toast="예외를 지웠어요">삭제</button>'],
      ['10/3', badge('추가 근무', 'b-ok'), '11:00~18:00', '<button class="btn btn-ghost btn-sm" type="button" data-toast="예외를 지웠어요">삭제</button>'],
    ], { fix: false })}`);

  if (ctx.id === 'MG0302') {
    return {
      body: `${pageHd('근무 일정 관리')}${dzTabs}
        ${banner('danger', '⚠️', `<b>이 변경으로 예약 2건이 영향을 받아요.</b>
          <div class="t-sub mt1">수요일 시작 시각을 11:00 → 13:00으로 바꾸시면, 9월 16일과 9월 23일 오전 예약이 근무 시간 밖이 돼요.</div>`, { cls: 'mb6' })}
        ${card('영향받는 예약', `${table(['일시', '고객', '시술', '어떻게 할까요'], [
          { cells: ['9/16(수) 11:00', '한소희', '뿌리 염색 (60분)',
            `<div class="btns" style="flex-wrap:nowrap"><button class="btn btn-soft btn-sm" type="button" data-toast="13:00으로 옮겼어요">13:00으로</button><button class="btn btn-ghost btn-sm" type="button" data-toast="취소하고 환불할까요?">취소</button></div>`], cls: 'is-diff' },
          { cells: ['9/23(수) 12:00', '오지훈', '두피 스케일링 (50분)',
            `<div class="btns" style="flex-wrap:nowrap"><button class="btn btn-soft btn-sm" type="button" data-toast="13:00으로 옮겼어요">13:00으로</button><button class="btn btn-ghost btn-sm" type="button" data-toast="이 예약은 그대로 둘게요">취소</button></div>`], cls: 'is-diff' },
        ], { fix: true })}
        <div class="box mt4"><div class="t-sub mb2">고객에게 갈 문구 미리보기</div>
          <p>[살롱 드 코랄] 한소희님, 매장 사정으로 9월 16일(수) 예약 시간을 11:00 → 13:00으로 옮겨도 될까요? 어려우시면 02-000-0000으로 알려주세요.</p></div>
        <div class="btns mt4">${btn('되돌리기', { cls: 'btn-ghost', href: 'MG0301' })}
          ${btn('이대로 저장하고 고객에게 알리기', { cls: 'btn-primary grow', attr: ' data-toast="일정을 저장하고 고객 2명에게 알렸어요" data-toast-kind="ok"' })}</div>`, { cls: 'mb6' })}
        ${card('주간 근무 시간', weekTable({ changed: 2 }))}`,
      o: { ...OWNER, state: '기존 예약 충돌' },
    };
  }

  if (ctx.id === 'MG0303') {
    return {
      body: `${pageHd('근무 일정 관리')}${dzTabs}
        ${banner('pri', '🌴', '<b>휴가를 넣으면 그 기간에는 예약을 받지 않아요.</b><div class="t-sub mt1">반복 일정에 근무로 돼 있어도 예외가 우선해요.</div>', { cls: 'mb6' })}
        <div class="split-r"><div>${card('주간 근무 시간', weekTable())}</div><div>${exceptions()}</div></div>`,
      o: { ...OWNER, state: '휴가 예외 등록' },
    };
  }

  return {
    body: `${pageHd('근무 일정 관리', '여기서 정한 시간에만 고객이 예약할 수 있어요')}${dzTabs}
      <div class="split-r">
        <div>${card('매주 반복하는 근무 시간', weekTable(), { ft: `<div class="btns">${btn('저장', { cls: 'btn-primary', attr: ' data-toast="근무 일정을 저장했어요" data-toast-kind="ok"' })}${btn('다른 디자이너에게 복사', { cls: 'btn-ghost', attr: ' data-toast="어느 디자이너에게 복사할까요?"' })}</div>` })}
          ${banner('mut', '💡', '휴게 시간에는 예약이 잡히지 않아요. 점심시간을 넣어두세요.', { cls: 'mt4' })}</div>
        <div>${exceptions()}</div></div>`,
    o: OWNER,
  };
}
export const MG0302 = MG0301, MG0303 = MG0301;

/* ============================================================
   MG0401 — 휴무·예약 정책 설정
   ============================================================ */
export function MG0401(ctx) {
  const preview = (o = {}) => card('이렇게 적용돼요', `
    <p class="t-sub mb3">지금 설정으로 고객 화면에 이런 문구가 보여요.</p>
    <div class="box-pri"><ul class="col" style="gap:10px">
      <li>· 매주 <b>월요일</b>은 쉽니다</li>
      <li>· <b>30일 전</b>부터 예약할 수 있어요</li>
      <li>· 방문 <b>2시간 전</b>까지 예약을 받아요</li>
      <li>· 방문 <b>하루 전 18:00</b>까지 무료로 취소할 수 있어요</li>
      <li>· 그 이후 취소하면 예약금의 <b>50%</b>가 차감돼요</li>
      <li>· 연락 없이 안 오시면 예약금이 환불되지 않고 <b>30일간</b> 예약이 제한돼요</li>
      <li>· 예약금은 시술 금액의 <b>10%</b>예요</li>
      <li>· 예약은 <b>매장이 확인한 뒤</b> 확정돼요</li>
    </ul></div>
    ${o.full ? `<div class="hr"></div>
      <div class="t-sub mb2">매장 상세 화면 미리보기</div>
      ${card('취소·노쇼 정책', `<ul class="col" style="gap:8px;font-size:14px">
        <li>· 방문 <b>하루 전 18:00</b>까지 무료 취소</li>
        <li>· 그 이후 취소 시 예약금의 <b>50%</b> 차감</li>
        <li>· 연락 없이 방문하지 않으면 예약금 전액이 매장으로 정산되고, 30일간 예약이 제한돼요</li></ul>`, { cls: 'box-mut' })}
      ${banner('mut', 'ℹ️', '<b>이미 잡힌 예약에는 예전 정책이 그대로 적용</b>돼요. 바뀐 정책은 새 예약부터 반영됩니다.', { cls: 'mt4' })}` : ''}`,
    { cls: 'sticky' });

  const settings = `<div class="col gap6">
    ${card('1. 휴무 설정', `
      <div class="field"><div class="label">정기 휴무 요일</div>
        ${chips(['월', '화', '수', '목', '금', '토', '일'], 0)}
        <p class="hint">고른 요일에는 예약을 받지 않아요.</p></div>
      <div class="field"><div class="label">임시 휴무 날짜</div>
        ${calendar({ sel: -1, marks: [23, 24, 25], closed: [7, 14, 21, 28], full: [], note: () => '' })}
        <p class="hint">여러 날을 눌러서 고를 수 있어요. 지금 9/23~9/25가 임시 휴무예요.</p></div>`)}
    ${card('2. 예약 접수', `
      <div class="field-row">
        <div class="field"><div class="label">며칠 전부터 예약을 받을까요</div>
          <div class="field-btn"><input class="input" type="number" value="30"><span class="btn btn-ghost">일 전부터</span></div>
          <p class="hint">너무 길면 취소가 늘어요. 보통 30~60일을 씁니다.</p></div>
        <div class="field"><div class="label">몇 시간 전까지 받을까요</div>
          <div class="field-btn"><input class="input" type="number" value="2"><span class="btn btn-ghost">시간 전까지</span></div>
          <p class="hint">준비 시간을 생각해 정하세요.</p></div></div>`)}
    ${card('3. 취소 정책', `
      <div class="field"><div class="label">무료 취소 기한</div>
        <div class="field-btn"><input class="input" type="number" value="24"><span class="btn btn-ghost">시간 전까지</span></div></div>
      <div class="field"><div class="label">기한 이후 취소 수수료</div>
        <input class="range" type="range" min="0" max="100" step="10" value="50">
        <div class="row-b t-sub"><span>0%</span><span><b class="pri">50%</b> 차감</span><span>100%</span></div>
        <p class="hint">예약금 20,000원이면 10,000원이 차감돼요.</p></div>`)}
    ${card('4. 노쇼 정책', `
      <div class="field"><div class="label">노쇼 시 예약 제한 기간</div>
        <div class="field-btn"><input class="input" type="number" value="30"><span class="btn btn-ghost">일간</span></div></div>
      <div class="field"><div class="label">예약금 처리</div>
        <div class="radio-list">
          <label class="radio on" data-group="ns"><input type="radio" name="ns" checked><span class="grow"><b>매장으로 정산</b> <span class="t-sub">기본값</span></span></label>
          <label class="radio" data-group="ns"><input type="radio" name="ns"><span class="grow"><b>고객에게 환불</b> <span class="t-sub">노쇼여도 돌려줘요</span></span></label>
        </div></div>`)}
    ${card('5. 예약금', `
      <div class="field"><div class="label">시술 금액의 몇 %를 미리 받을까요</div>
        <input class="range" type="range" min="0" max="100" step="5" value="10">
        <div class="row-b t-sub"><span>0% (안 받음)</span><span><b class="pri">10%</b></span><span>100%</span></div>
        <p class="hint">16만원 시술이면 예약금 16,000원이에요. 높을수록 노쇼가 줄지만 예약도 줄어요.</p></div>`)}
    ${card('6. 자동 확정', `
      <div class="radio-list">
        <label class="radio" data-group="auto2"><input type="radio" name="auto2"><span class="grow"><b>자동으로 확정</b>
          <span class="t-sub" style="display:block">겹치지 않으면 바로 확정돼요. 고객이 좋아하고 예약이 늡니다.</span></span></label>
        <label class="radio on" data-group="auto2"><input type="radio" name="auto2" checked><span class="grow"><b>매장이 확인한 뒤 확정</b>
          <span class="t-sub" style="display:block">2시간 안에 답해야 해요. 늦으면 자동 취소되고 응답률이 떨어져요.</span></span></label>
      </div>`)}
  </div>`;

  if (ctx.id === 'MG0402') {
    return {
      body: `${pageHd('휴무·예약 정책 설정')}
        ${banner('acc', '👀', '<b>설정을 바꿀 때마다 오른쪽 미리보기가 바로 바뀌어요.</b><div class="t-sub mt1">고객이 실제로 보게 될 문장 그대로입니다.</div>', { cls: 'mb6' })}
        <div class="split-r">${settings}<div>${preview({ full: true })}
          <div class="btns mt4">${btn('저장', { cls: 'btn-primary btn-block btn-lg', attr: ' data-toast="정책을 저장했어요. 새 예약부터 적용돼요" data-toast-kind="ok"' })}</div></div></div>`,
      o: { ...OWNER, state: '정책 적용 미리보기' },
    };
  }

  return {
    body: `${pageHd('휴무·예약 정책 설정', '여기서 정한 규칙이 고객 화면과 예약 흐름에 그대로 적용돼요')}
      <div class="split-r">${settings}<div>${preview()}
        <div class="btns mt4">${btn('저장', { cls: 'btn-primary btn-block btn-lg', attr: ' data-toast="정책을 저장했어요" data-toast-kind="ok"' })}
          ${btn('미리보기 자세히', { cls: 'btn-ghost btn-block', href: 'MG0402' })}</div></div></div>`,
    o: OWNER,
  };
}
export const MG0402 = MG0401;

/* ============================================================
   MG0501 — 사진 업로드 실패
   ============================================================ */
export function MG0501(ctx) {
  if (ctx.id === 'MG0502') {
    const files = [
      ['IMG_2841.jpg', '2.4MB', 100, 'ok'], ['IMG_2842.jpg', '3.1MB', 100, 'ok'],
      ['IMG_2843.jpg', '5.8MB', 64, 'run'], ['IMG_2844.jpg', '4.2MB', 21, 'run'],
      ['IMG_2845.jpg', '6.0MB', 0, 'wait'],
    ];
    return {
      body: `${pageHd('사진 올리기')}
        ${banner('pri', '⬆️', '<b>5장 중 2장을 올렸어요.</b><div class="t-sub mt1">창을 닫으면 올리던 사진이 취소돼요.</div>', { cls: 'mb6' })}
        ${card('올리는 중', `${files.map(([nm, sz, pct, st]) => `<div class="file-row ${st === 'ok' ? 'is-ok' : ''}">
          <span class="none">${st === 'ok' ? '✅' : st === 'run' ? '⬆️' : '⏳'}</span>
          <div class="grow"><div class="row-b"><b>${nm}</b><span class="t-sub">${sz}</span></div>
            <div class="mt2">${progress(pct)}</div>
            <p class="t-sub mt1">${st === 'ok' ? '완료' : st === 'run' ? `${pct}%` : '차례를 기다리는 중'}</p></div>
          <div class="none">${st === 'ok' ? '' : `<button class="btn btn-ghost btn-sm" type="button" data-toast="${nm} 올리기를 취소했어요">취소</button>`}</div></div>`).join('')}
          <div class="hr"></div>
          <div class="row-b"><span class="t-sub">남은 용량 <b>178MB</b> / 200MB</span><span class="t-sub">남은 장수 <b>15장</b> / 20장</span></div>`,
          { ft: `<div class="btns">${btn('전체 취소', { cls: 'btn-ghost', attr: 'data-dismiss data-toast="고치던 내용을 모두 버렸어요"' })}${btn('백그라운드로 계속', { cls: 'btn-soft grow', attr: ' data-toast="계속 올리면서 다른 일을 하실 수 있어요"' })}</div>` })}
        ${banner('warn', '⚠️', '<b>화면을 벗어나면 올리던 사진이 취소돼요.</b> 완료된 2장은 그대로 남습니다.', { cls: 'mt6' })}`,
      o: { ...OWNER, state: '업로드 진행 중' },
    };
  }

  return {
    body: `${pageHd('사진 올리기')}
      ${banner('danger', '⚠️', `<b>8장 중 3장을 올리지 못했어요.</b>
        <div class="t-sub mt1">성공한 5장은 그대로 저장됐어요. 아래에서 실패한 것만 다시 올리시면 됩니다.</div>`, { cls: 'mb6' })}
      ${card('올린 사진', `
        ${[['IMG_2841.jpg', '2.4MB', true], ['IMG_2842.jpg', '3.1MB', true], ['IMG_2843.jpg', '1.8MB', true],
           ['IMG_2844.jpg', '4.2MB', true], ['IMG_2845.jpg', '2.9MB', true]].map(([nm, sz]) =>
          `<div class="file-row is-ok"><span class="none">✅</span>
            <div class="grow"><b>${nm}</b><p class="t-sub">${sz} · 올리기 완료</p></div>
            ${phFix(['시술 결과', 1000, 1000], 40, { seed: nm })}</div>`).join('')}
        <div class="hr"></div>
        <div class="t-sub mb2">올리지 못한 사진</div>
        <div class="file-row is-err"><span class="none">⚠️</span>
          <div class="grow"><b>IMG_2846.jpg</b><p class="t-sub danger">파일 용량이 14.2MB예요. 10MB를 넘으면 올릴 수 없어요.</p></div>
          <button class="btn btn-ghost btn-sm none" type="button" data-toast="사진을 줄여서 다시 올릴게요">줄여서 올리기</button></div>
        <div class="file-row is-err"><span class="none">⚠️</span>
          <div class="grow"><b>IMG_2847.heic</b><p class="t-sub danger">HEIC 형식은 지원하지 않아요. JPG나 PNG로 바꿔주세요.</p></div></div>
        <div class="file-row is-err"><span class="none">⚠️</span>
          <div class="grow"><b>IMG_2848.jpg</b><p class="t-sub danger">이 시술에는 20장까지 올릴 수 있어요. 이미 20장이 차 있습니다.</p></div>
          <button class="btn btn-ghost btn-sm none" type="button" data-toast="기존 사진 관리 화면으로 갑니다">기존 사진 정리</button></div>`,
        { ft: `<div class="btns">${btn('실패한 3장만 다시 올리기', { cls: 'btn-primary grow', href: 'MG0502' })}${btn('이대로 두기', { cls: 'btn-ghost', href: 'MG0101' })}</div>` })}
      <div class="mt6">${card('사진은 이렇게 올려주세요', `
        ${kv([['권장 크기', '1200×1200 이상 (정사각형이 가장 잘 보여요)'], ['형식', 'JPG · PNG'],
          ['용량', '장당 10MB 이하'], ['장수', '시술당 20장 · 매장 전체 200MB']])}
        ${banner('mut', '🗜️', '10MB가 넘는 사진은 <b>자동으로 줄여서</b> 올려드릴 수 있어요. 화질이 조금 낮아지지만 대부분 티가 나지 않아요.',
          { cls: 'mt4', right: btn('자동으로 줄이기 켜기', { cls: 'btn-soft', attr: ' data-toast="앞으로 큰 사진은 자동으로 줄여서 올려요"' }) })}`)}</div>`,
    o: OWNER,
  };
}
export const MG0502 = MG0501;
