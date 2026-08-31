/* VC — 바우처 (14) / CS — 고객센터 (13) */
import * as U from './ui.mjs';
import { VOUCHERS, P, FAQS, NOTICES, INQUIRIES, REFUND_RULES, SITE } from './data.mjs';

const { ph, phMap, pcards, sec, card, banner, badge, tabs, table, kv, sumRows, won, num, link,
  empty, pageHd, prodSummary, toastEl, modalTpl, accordion, qr, qrSm, myNav, csNav, stickBar, esc } = U;

/* ===== VC01 바우처 목록 ===== */
export function VC0101(ctx) {
  const id = ctx.id;
  const usedTab = id === 'VC0102';
  const saved = id === 'VC0103';
  const pending = id === 'VC0104';

  const list = usedTab ? VOUCHERS.filter((v) => v.state === '사용 완료')
    : pending ? VOUCHERS.filter((v) => v.state === '발급 대기').concat(VOUCHERS.filter((v) => v.state === '사용 예정'))
      : VOUCHERS.filter((v) => v.state === '사용 예정' || v.state === '발급 대기');

  const vcard = (v) => {
    const p = P(v.prod);
    const isPending = v.state === '발급 대기';
    const kind = v.state === '사용 예정' ? 'b-ok' : v.state === '사용 완료' ? 'b-mut' : v.state === '만료' ? 'b-danger' : 'b-warn';
    return `<div class="hcard mb3 ${isPending || v.state !== '사용 예정' ? '' : ''}">
      ${ph(p.id, 'ph-thumb')}
      <div class="grow">
        <div class="badges mb1">${badge(v.state, kind)}${v.state === '사용 예정' ? badge('D-4', 'b-acc') : ''}</div>
        <div class="t-card" style="font-size:15px">${esc(p.name)}</div>
        <p class="t-sub mt1">${v.use} · ${v.pax}<br>예약번호 ${v.no}</p>
        ${v.usedAt ? `<p class="t-sub mt1">사용 처리 — ${v.usedAt}</p>` : ''}
        ${isPending ? `<p class="t-sub mt1 warning">확정 대기 예약이라 바우처가 아직 발급되지 않았어요</p>` : ''}
        ${v.state === '사용 완료' ? `<div class="btns mt3"><a class="btn btn-primary btn-sm" href="${link('MY0801')}">후기 쓰기</a>
          <a class="btn btn-ghost btn-sm" href="${link('PR0201')}">같은 상품 재예약</a></div>` : ''}
      </div>
      <div class="right" style="flex:none">
        ${isPending ? `<div class="qr qr-sm is-off"><i></i></div>` : qrSm()}
        ${isPending ? `<a class="btn btn-ghost btn-sm mt2" href="${link('MY0501')}">예약 상세</a>`
        : v.state === '사용 완료' ? `<a class="btn btn-ghost btn-sm mt2" href="${link('VC0201')}">기록 보기</a>`
          : `<a class="btn btn-primary btn-sm mt2" href="${link('VC0201')}">바우처 열기</a>`}
      </div></div>`;
  };

  const body = `${pageHd('내 바우처', '현지에서 제시할 QR을 미리 저장해두세요')}
  <div class="split">${myNav('VC0101')}<div>
    ${tabs([{ label: '사용 예정', cnt: 2, go: 'VC0101' }, { label: '사용 완료', cnt: 1, go: 'VC0102' }, { label: '만료', cnt: 1, go: 'VC0301' }], usedTab ? 1 : 0)}

    ${usedTab ? '' : banner('warn', '📵', `<b>현지에서 인터넷이 안 될 수 있어요.</b> 출발 전에 바우처를 이미지로 저장하거나 인쇄해두세요.`, {
    cls: 'mb4',
    right: `<div class="btns"><button class="btn btn-primary btn-sm" type="button" ${saved ? 'data-toast="이미 저장해 두셨어요. 사진첩에서 보실 수 있어요"' : `onclick="location.href='${link('VC0103')}'"`}>이미지로 저장</button>
      <button class="btn btn-ghost btn-sm" type="button" data-toast="인쇄 창을 열었어요">인쇄하기</button></div>`,
  })}

    ${saved ? banner('ok', '✓', `<b>바우처 2장을 저장했어요.</b> 저장 위치 — 내 기기 &gt; 사진 &gt; TravelNow
      <div class="t-sub mt2">기기 갤러리에서 바로 열 수 있고, 인터넷 없이도 보여줄 수 있어요.</div>`, {
    cls: 'mb4',
    right: `<div class="btns"><button class="btn btn-ghost btn-sm" type="button" data-toast="갤러리를 열었어요">갤러리 열기</button>
      <button class="btn btn-ghost btn-sm" type="button" data-toast="전체 바우처를 저장했어요" data-toast-kind="ok">전체 일괄 저장</button></div>`,
  }) : ''}

    ${pending ? banner('pri', '⏱', `<b>확정 대기 예약이 1건 있어요.</b> 바우처는 확정 직후 자동으로 발급됩니다.
      <div class="t-sub mt2">예상 발급 시각 — 8월 1일 18:00 이전 · 발급되면 카카오톡으로 알려드려요.</div>`, {
    cls: 'mb4', right: `<a class="btn btn-ghost btn-sm" href="${link('BK0501')}">대기 상세</a>`,
  }) : ''}

    ${list.length ? list.map(vcard).join('') : `<div class="card">${empty('🎫', '해당하는 바우처가 없어요', '', `<a class="btn btn-primary" href="${link('PR0101')}">상품 둘러보기</a>`)}</div>`}

    ${usedTab ? `<p class="t-sub mt4">사용 완료된 바우처는 이용일로부터 1년간 보관됩니다.</p>` : ''}
  </div></div>`;

  return {
    body, o: {
      logged: true, noti: 3,
      after: saved ? toastEl('이미지 2장을 저장했어요', '갤러리 열기', 'ok') : '',
      state: { VC0102: '사용 완료 탭 — 사용 기록과 후기 유도', VC0103: '오프라인 저장 완료 — 저장 위치 안내와 일괄 저장', VC0104: '발급 대기 상태 — 예상 발급 시각 안내' }[id] || '',
    },
  };
}

/* ===== VC02 바우처 상세 ===== */
export function VC0201(ctx) {
  const id = ctx.id;
  const offline = id === 'VC0202';
  const qrFail = id === 'VC0203';
  const nav = id === 'VC0204';
  const lang = id === 'VC0205';
  const p = P('P01');

  const qrArea = qrFail
    ? `<div class="qr is-off"><i></i></div>
       ${banner('danger', '⚠', `<b>QR 이미지를 불러오지 못했어요.</b> 네트워크가 불안정할 수 있어요.`, { cls: 'mt4' })}
       <div class="btns mt3" style="justify-content:center">
         <button class="btn btn-primary" type="button" data-toast="다시 불러오는 중이에요">새로고침 재시도</button>
         <button class="btn btn-ghost" type="button" data-toast="이메일로 다시 보냈어요" data-toast-kind="ok">이메일 재발송</button></div>
       <div class="box mt4"><b>QR 없이 입장하는 방법</b>
         <p class="t-sub mt2">직원에게 아래 <b>예약번호와 여권</b>을 보여주면 명단에서 확인할 수 있어요.</p>
         <div class="t-sec center mt2" style="letter-spacing:.06em">TN2607-284193</div>
         <p class="t-sub center mt2">현지 연락처 +1 917-000-0000</p></div>`
    : `${qr()}
       <p class="center t-sec mt4" style="letter-spacing:.06em">TN2607-284193</p>
       <p class="center t-sub">예약번호를 길게 누르면 복사됩니다</p>
       <p class="center t-sub mt3">💡 화면 밝기를 최대로 올려주세요. QR이 더 잘 읽혀요.</p>`;

  const guideKo = ['출발 15분 전(13:45)까지 집합 장소에 도착해주세요.', '여권을 반드시 지참해주세요. 현장에서 이름을 확인합니다.',
    '갑판은 바람이 세니 겉옷을 준비하세요.', '음료는 반입 가능하지만 유리병은 제한됩니다.', '지정 좌석이 없는 자유석입니다.'];
  const guideEn = ['Please arrive 15 minutes before departure (1:45 PM).', 'Bring your passport — names are verified on site.',
    'The deck is windy; bring a light jacket.', 'Drinks allowed, glass bottles are restricted.', 'Open seating, no assigned seats.'];

  const body = `<div class="wrap-narrow" style="padding:0">
  ${offline ? banner('warn', '📵', `<b>오프라인 모드로 열었어요.</b> 저장된 바우처를 보여드리고 있어요.
    <div class="t-sub mt2">마지막 동기화 — 2026.08.02 21:40 (KST) · 온라인이 되면 자동으로 갱신됩니다.</div>`, { cls: 'mb4' }) : ''}

  ${card('', `<div class="center">
    <div class="badges mb4" style="justify-content:center">${badge('사용 예정', 'b-ok')}${badge('즉시확정', 'b-pri')}${offline ? badge('오프라인 저장본', 'b-warn') : ''}</div>
    ${qrArea}
  </div>`, { cls: 'mb4' })}

  ${card('예약 정보', kv([
    ['상품', esc(p.name)],
    ['이용 일시', '<b>2026년 8월 3일(월) 14:00</b> (현지 시각)'],
    ['인원', '성인 2 · 아동 1'],
    ['대표 예약자', 'KIM YEOHAENG'],
    ['예약번호', 'TN2607-284193'],
  ]), { cls: 'mb4' })}

  ${nav ? card('길찾기', `
    ${phMap('ph-map', [{ x: 44, y: 52, n: '📍', name: '배터리파크 11번 부두', on: true }, { x: 18, y: 24, n: '나', name: '현재 위치' }], '현재 위치에서 집합 장소까지')}
    <div class="g3 g1-m mt4">
      ${[['🚇 지하철', '32분', '1호선 South Ferry'], ['🚕 택시', '18분', '약 $22'], ['🚶 도보', '1시간 4분', '4.8km']]
      .map(([t, d, s]) => `<div class="box center"><div>${t}</div><div class="t-card mt1" style="font-size:16px">${d}</div><div class="t-sub">${s}</div></div>`).join('')}</div>
    <div class="btns mt4"><button class="btn btn-primary" type="button" data-toast="지도 앱으로 좌표를 전달했어요">지도 앱으로 열기</button>
      <button class="btn btn-ghost" type="button" data-toast="주소를 복사했어요" data-toast-kind="ok">현지어 주소 복사</button></div>
    <div class="box-pri mt4"><p class="t-sub">택시 기사에게 보여주세요</p>
      <p class="t-card mt1" style="font-size:17px">Battery Park, Pier 11<br>New York, NY 10004</p>
      <p class="t-sub mt2">40.7033, -74.0170</p></div>`, { cls: 'mb4' })
      : card('미팅 장소', `${phMap('ph-map', [{ x: 44, y: 48, n: '📍', name: '배터리파크 11번 부두', on: true }], '배터리파크 11번 부두')}
      <p class="mt3"><b>Battery Park, Pier 11, New York, NY 10004</b></p>
      <p class="t-sub">지하철 1호선 South Ferry 역에서 도보 3분 · 파란 깃발을 든 가이드를 찾아주세요</p>
      <div class="btns mt3"><a class="btn btn-primary btn-sm" href="${link('VC0204')}">길찾기</a>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="주소를 복사했어요">현지어 주소 복사</button></div>`, { cls: 'mb4' })}

  ${card('현지 비상 연락처', `<div class="row-b wrap-row">
    <div>${kv([['현지 운영사', '+1 917-000-0000 (영어)'], ['한국어 긴급 회선', '+82 2-000-0000 (24시간)'], ['카카오톡 채널', '@트래블나우 현지지원']])}</div>
    <div class="btns"><button class="btn btn-primary" type="button" data-toast="전화 앱을 열었어요">📞 전화 걸기</button></div></div>`, { cls: 'mb4' })}

  ${lang ? card('이용 안내', `
    ${tabs([{ label: '한국어', pane: 'ko' }, { label: 'English', pane: 'en' }, { label: '직원 제시용', pane: 'staff' }], 0, { pill: true })}
    <div data-pane-body="ko"><ul>${guideKo.map((t) => `<li style="padding:4px 0">· ${t}</li>`).join('')}</ul></div>
    <div data-pane-body="en" hidden><ul>${guideEn.map((t) => `<li style="padding:4px 0">· ${t}</li>`).join('')}</ul></div>
    <div data-pane-body="staff" hidden><div class="box-pri center" style="padding:24px">
      <p class="t-sub">직원에게 이 화면을 보여주세요</p>
      <p class="t-sec mt2" style="font-size:20px">Statue Cruises — 2:00 PM departure<br>Reservation TN2607-284193<br>2 Adults, 1 Child</p>
      <p class="mt3">Booked through TravelNow (Korea).<br>Passenger name: KIM YEOHAENG</p></div></div>
    <div class="btns mt4"><button class="btn btn-ghost btn-sm" type="button" data-toast="글자를 크게 표시했어요">글자 크게 보기</button>
      <button class="btn btn-ghost btn-sm" type="button" data-toast="주의사항을 번역했어요">주의사항 번역</button></div>`, { cls: 'mb4' })
      : card('이용 안내와 주의사항', `<ul>${guideKo.map((t) => `<li style="padding:4px 0">· ${t}</li>`).join('')}</ul>
      <p class="t-sub mt3"><a class="pri strong" href="${link('VC0205')}">현지어·영어 안내문 보기 ›</a></p>`, { cls: 'mb4' })}

  <div class="btns" style="justify-content:center">
    <button class="btn btn-primary btn-lg" type="button" ${offline ? 'data-toast="이미 저장해 두셨어요. 인터넷이 없어도 사진첩에서 열립니다"' : `onclick="location.href='${link('VC0103')}'"`}>이미지로 저장</button>
    <button class="btn btn-ghost btn-lg" type="button" data-toast="인쇄 창을 열었어요">인쇄하기</button>
    <a class="btn btn-ghost btn-lg" href="${link('VC0401')}">재발급 요청</a>
  </div>
  <p class="t-sub center mt4">이 화면은 QR 인식을 위해 배경을 흰색으로 유지합니다.</p></div>`;

  return {
    body, o: {
      logged: true, wrapCls: 'wrap-narrow',
      state: { VC0202: '오프라인 모드 — 캐시 바우처와 마지막 동기화 시각', VC0203: 'QR 로드 실패 — 예약번호 수동 제시와 재발송', VC0204: '길찾기 연동 — 소요 시간과 현지어 주소 복사', VC0205: '이용 안내 다국어 — 직원 제시용 문구 카드' }[id] || '',
    },
  };
}

/* ===== VC03 바우처 만료 ===== */
export function VC0301(ctx) {
  const used = ctx.id === 'VC0302';
  const p = P('P08');

  const body = `<div class="wrap-narrow" style="padding:0">
  ${card('', `<div class="center">
    <div class="badges mb4" style="justify-content:center">${badge(used ? '사용 완료' : '만료', used ? 'b-mut' : 'b-danger')}</div>
    ${qr({ cls: 'is-off', stamp: used ? '사용됨' : '만료됨' })}
    <p class="center t-sub mt4" style="letter-spacing:.06em">TN2605-259911</p>
  </div>`, { cls: 'mb4' })}

  ${used
      ? banner('mut', 'ℹ', `<b>이 바우처는 이미 사용 처리되었어요.</b>
        <div class="mt2">사용 시각 — <b>2026년 5월 21일 09:04 (현지 시각)</b> · 장소 — 푸에르토후아레스 항구 게이트 2</div>`, { cls: 'mb4' })
      : banner('mut', 'ℹ', `<b>이 바우처는 2026년 5월 21일에 만료되었어요.</b>
        <div class="mt2">만료 사유 — <b>이용 기한이 지남</b> (이용일 당일 23:59까지 유효)</div>`, { cls: 'mb4' })}

  ${card('예약 정보', kv([
    ['상품', esc(p.name)],
    ['이용 예정일', '2026년 5월 21일(목) 09:00'],
    ['인원', '성인 2'],
    ['결제 금액', won(224000)],
    ['상태', used ? '사용 완료' : '만료 · 환불 완료 (2026.05.16)'],
  ]), { cls: 'mb4' })}

  ${used ? `${card('사용 이력', U.table([{ t: '시각', w: '34%' }, '장소', '처리'], [
    ['2026.05.21 09:04', '푸에르토후아레스 항구 게이트 2', 'QR 스캔 · 성인 2 입장'],
    ['2026.05.21 08:58', '동일 게이트', '바우처 조회'],
  ]), { cls: 'mb4' })}
    ${banner('warn', '⚠', `<b>본인이 사용한 것이 아니라면 알려주세요.</b> 사용 이력을 확인해 처리해드립니다.`, {
      cls: 'mb4', right: `<button class="btn btn-danger" type="button" data-toast="신고가 접수됐어요. 24시간 안에 연락드립니다">본인 사용 아님 신고</button>`,
    })}`
      : `${card('기한 연장이나 재발급이 필요하신가요?', `<p>이미 만료된 바우처는 자동으로 되살릴 수 없지만, 사유에 따라 도와드릴 수 있어요.</p>
      <ul class="mt3">${['현지 사정으로 이용하지 못한 경우 — 증빙을 확인해 환불 또는 재발급',
        '기상 악화로 운항이 취소된 경우 — 전액 환불 (자동 처리)',
        '단순 미사용(노쇼) — 규정에 따라 환불이 어려워요']
          .map((t) => `<li class="t-sub" style="padding:3px 0">· ${t}</li>`).join('')}</ul>`, { cls: 'mb4' })}`}

  <div class="btns" style="justify-content:center">
    <a class="btn btn-primary btn-lg" href="${link('CS0201')}">고객센터 문의</a>
    <a class="btn btn-ghost btn-lg" href="${link('PR0201')}">같은 상품 다시 예약</a>
    <a class="btn btn-ghost btn-lg" href="${link('VC0101')}">바우처 목록</a>
  </div></div>`;

  return {
    body, o: {
      logged: true, wrapCls: 'wrap-narrow',
      state: used ? '이미 사용됨 — 사용 시각·장소와 본인 사용 아님 신고' : '',
    },
  };
}

/* ===== VC04 바우처 재발급 요청 ===== */
export function VC0401(ctx) {
  const id = ctx.id;
  const fix = id === 'VC0402';
  const done = id === 'VC0403';
  const p = P('P01');

  if (done) {
    const body = `<div class="wrap-narrow" style="padding:0">
    <div class="card"><div class="card-bd center" style="padding:48px 20px">
      <div style="font-size:48px;color:var(--success)">✓</div>
      <h1 class="t-page mt3">재발급 요청이 접수되었어요</h1>
      <p class="t-sub mt2">접수번호 <b>RQ-2607-1182</b></p>
    </div></div>
    ${card('처리 안내', kv([
      ['접수 시각', '2026년 7월 30일 10:24'],
      ['예상 소요 시간', '<b>10분 이내</b> (정보 정정 요청은 현지 승인까지 최대 24시간)'],
      ['받을 이메일', 'kim@example.com'],
      ['진행 확인', '고객센터 &gt; 문의 내역에서 추적할 수 있어요'],
    ]), { cls: 'mt6 mb4' })}
    ${banner('pri', '📧', '메일이 안 보이면 <b>스팸함</b>을 확인해주세요. 발신 주소는 no-reply@travelnow.kr 입니다.', { cls: 'mb4' })}
    <div class="btns" style="justify-content:center">
      <a class="btn btn-primary btn-lg" href="${link('VC0101')}">바우처 목록</a>
      <a class="btn btn-ghost btn-lg" href="${link('CS0301')}">문의 내역에서 추적</a></div></div>`;
    return { body, o: { logged: true, wrapCls: 'wrap-narrow', state: '요청 완료 — 접수번호와 진행 추적 경로' } };
  }

  const body = `<div class="wrap-narrow" style="padding:0">
  ${pageHd('바우처 재발급 요청', '예약 정보를 확인하고 사유를 선택해주세요')}
  ${card('', prodSummary(p, { date: '2026.08.03(월) 14:00', pax: '성인 2 · 아동 1', extra: '<p class="t-sub mt1">예약번호 TN2607-284193</p>' }), { cls: 'mb4' })}

  ${card('재발급 사유', `<div class="radio-list">
    <label class="radio${fix ? '' : ' on'}" data-group="rs"><input type="radio" name="rs" ${fix ? '' : 'checked'}>
      <span><b>메일을 못 받았어요</b><span class="sub">같은 주소로 다시 보내드려요 · 10분 이내</span></span></label>
    <label class="radio" data-group="rs"><input type="radio" name="rs">
      <span><b>실수로 지웠어요</b><span class="sub">같은 바우처를 다시 발급합니다 · 10분 이내</span></span></label>
    <label class="radio${fix ? ' on' : ''}" data-group="rs"><input type="radio" name="rs" ${fix ? 'checked' : ''}>
      <span><b>정보가 잘못됐어요</b><span class="sub">영문명·이용일 정정이 필요한 경우 · 현지 승인 최대 24시간</span></span></label>
  </div>`, { cls: 'mb4' })}

  ${fix ? card('정정할 내용', `
    ${banner('warn', '⚠', '<b>정정 가능 항목</b> — 여권 영문명, 이용 일시(잔여 좌석이 있을 때). 인원 변경과 상품 변경은 재발급으로 처리되지 않아요.', { cls: 'mb4' })}
    <div class="field-row">
      <div class="field"><label class="label">현재 영문명</label><input class="input" value="KIM YEOHAENG" disabled></div>
      <div class="field"><label class="label">올바른 영문명<span class="req">*</span></label><input class="input" value="KIM YEO HAENG">
        <p class="hint">여권과 동일하게 대문자로 입력해주세요</p></div>
    </div>
    <div class="field-row">
      <div class="field"><label class="label">현재 이용일</label><input class="input" value="2026-08-03 14:00" disabled></div>
      <div class="field"><label class="label">변경 희망 이용일</label><input class="input" placeholder="변경이 필요하면 입력"></div>
    </div>
    <div class="field"><label class="label">여권 사본 첨부<span class="req">*</span></label>
      <div class="box center" style="border-style:dashed">
        <p class="t-sub">여권 사진면을 촬영해 올려주세요 (JPG·PNG · 10MB 이하)</p>
        <button class="btn btn-ghost btn-sm mt3" type="button" data-toast="파일 선택 창을 열었어요">파일 선택</button></div>
      <p class="hint">확인 후 즉시 파기되며, 정정 목적 외에는 사용하지 않습니다.</p></div>
    ${banner('pri', 'ℹ', '<b>현지 승인이 필요한 항목이에요.</b> 영문명 정정은 현지 운영사 확인 후 반영되며 최대 24시간이 걸립니다.')}`, { cls: 'mb4' }) : ''}

  ${card('받을 이메일', `<div class="field"><label class="label">이메일<span class="req">*</span></label>
    <input class="input" value="kim@example.com">
    <p class="hint">가입 이메일이 기본으로 채워져 있어요. 다른 주소로 받으려면 수정하세요.</p></div>
    <label class="check"><input type="checkbox" checked><span>카카오톡으로도 알림 받기 <span class="sub">010-****-5678</span></span></label>`, { cls: 'mb4' })}

  ${banner('ok', '⏱', fix ? '<b>정보 정정은 현지 승인 후 발급돼요.</b> 보통 24시간 안에 처리됩니다.' : '<b>보통 10분 안에 다시 보내드려요.</b> 메일이 안 오면 스팸함을 확인해주세요.', { cls: 'mb6' })}

  <div class="btns" style="justify-content:center">
    <a class="btn btn-primary btn-lg" href="${link('VC0403')}">재발급 요청</a>
    <a class="btn btn-ghost btn-lg" href="${link('VC0201')}">취소</a></div></div>`;

  return {
    body, o: {
      logged: true, wrapCls: 'wrap-narrow',
      state: fix ? '정보 정정 입력 — 여권 사본 첨부와 현지 승인 안내' : '',
    },
  };
}

/* ===== CS01 자주 묻는 질문 ===== */
export function CS0101(ctx) {
  const id = ctx.id;
  const searched = id === 'CS0102';
  const localTab = id === 'CS0103';
  const cats = Object.keys(FAQS);
  const activeCat = localTab ? '현지 이용' : cats[0];
  const items = searched
    ? [
      { q: '무료 <mark style="background:rgba(255,122,48,.3)">취소</mark> 기한은 언제까지인가요?', a: FAQS['취소·환불'][0].a, cat: '취소·환불' },
      { q: '일부 인원만 <mark style="background:rgba(255,122,48,.3)">취소</mark>할 수 있나요?', a: FAQS['취소·환불'][2].a, cat: '취소·환불' },
      { q: '기상 악화로 현지에서 <mark style="background:rgba(255,122,48,.3)">취소</mark>되면요?', a: FAQS['현지 이용'][2].a, cat: '현지 이용' },
    ]
    : FAQS[activeCat].map((x) => ({ ...x, cat: activeCat }));

  const body = `${pageHd('자주 묻는 질문', '궁금한 내용을 검색하거나 카테고리에서 찾아보세요')}
  <div class="split">${csNav(id)}<div>
    <form class="mb6"><div class="row"><input class="input" placeholder="궁금한 내용을 입력하세요" value="${searched ? '취소' : ''}">
      <button class="btn btn-primary" type="submit" style="flex:none" data-toast="검색했어요">검색</button></div></form>

    ${tabs(cats.map((c, i) => ({ label: c, go: c === '현지 이용' ? 'CS0103' : 'CS0101' })), cats.indexOf(activeCat))}

    ${searched ? `<p class="t-sub mb4">'<b>취소</b>' 검색 결과 <b class="pri">${items.length}개</b></p>` : ''}
    ${localTab ? banner('danger', '🆘', `<b>현지에서 급한 일이 생겼다면</b> 아래 긴급 연락처로 바로 전화해주세요. 시차와 무관하게 24시간 응대합니다.
      <div class="mt2">한국어 긴급 회선 <b>+82 2-000-0000</b> · 카카오톡 @트래블나우 현지지원</div>`, { cls: 'mb4' }) : ''}

    <div class="card"><div class="card-bd" style="padding-top:4px;padding-bottom:4px">
      ${items.map((it, i) => `<div class="acc-item${i === 0 ? ' on' : ''}">
        <button class="acc-q" type="button"><span>${searched ? `<span class="badge b-pri" style="margin-right:8px">${it.cat}</span>` : ''}${it.q}</span><span class="mk">＋</span></button>
        <div class="acc-a">${it.a}
          <div class="btns mt4"><button class="btn btn-ghost btn-sm" type="button" data-toast="의견 주셔서 감사해요" data-toast-kind="ok">도움이 됐어요</button>
            <button class="btn btn-ghost btn-sm" type="button" data-toast="어떤 점이 부족했는지 알려주세요">아니요</button></div></div></div>`).join('')}
    </div></div>

    ${localTab ? sec('현지 상황별 대응', U.table([{ t: '상황', w: '32%' }, '먼저 할 일', '연락처'], [
    ['집합 장소를 못 찾겠어요', '바우처의 [길찾기]로 좌표 확인 → 현지 운영사에 전화', '+1 917-000-0000'],
    ['가이드와 연락이 안 돼요', '10분 대기 후 한국어 긴급 회선으로 연결', '+82 2-000-0000'],
    ['기상으로 취소됐어요', '별도 신청 없이 3영업일 내 전액 환불', '문의 불필요'],
    ['다치거나 아파요', '현지 응급 911 → 보험 접수는 귀국 후 가능', '911 / 보험사'],
  ]), { cls: 'mt6' }) : ''}

    <div class="box mt6 row-b wrap-row"><div><b>원하는 답을 못 찾으셨나요?</b>
      <p class="t-sub mt1">1:1 문의는 영업일 기준 1일 안에 답변드려요. 현지에서 급하시면 전화가 빠릅니다.</p></div>
      <div class="btns"><a class="btn btn-primary" href="${link('CS0201')}">1:1 문의하기</a>
        <span class="btn btn-ghost">📞 ${SITE.tel}</span></div></div>
  </div></div>`;

  return {
    body, o: {
      state: searched ? '검색 결과 — 키워드 하이라이트와 카테고리 배지' : localTab ? '현지 이용 탭 — 긴급 연락처와 시차 응대 안내' : '',
    },
  };
}

/* ===== CS02 1:1 문의 작성 ===== */
export function CS0201(ctx) {
  const id = ctx.id;
  const urgent = id === 'CS0202';
  const over = id === 'CS0203';

  const body = `${pageHd('1:1 문의하기', '예약과 관련된 내용은 예약을 함께 선택해주시면 더 빠르게 답변드려요')}
  <div class="split">${csNav(id)}<div>
    ${urgent ? banner('danger', '🚨', `<b>출발이 24시간 이내인 예약이 있어요.</b> 1:1 문의는 답변까지 시간이 걸릴 수 있어요.
      <div class="mt2">현지 긴급 상황이라면 <b>전화나 카카오톡</b>으로 먼저 연락해주세요.</div>
      <div class="btns mt3"><button class="btn btn-primary btn-sm" type="button" data-toast="긴급 회선으로 연결합니다">📞 즉시 연결 (+82 2-000-0000)</button>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="카카오톡 상담을 열었어요">💬 카카오톡 상담</button></div>`, { cls: 'mb4' }) : ''}

    ${urgent ? card('시차별 응대 가능 시간', U.table([{ t: '지역', w: '30%' }, '한국어 상담 가능 시간 (현지 기준)', '긴급 회선'], [
    ['미주 (뉴욕·LA)', '19:00 ~ 익일 05:00', '24시간'],
    ['유럽 (파리·로마)', '01:00 ~ 11:00', '24시간'],
    ['동남아 (방콕)', '07:00 ~ 17:00', '24시간'],
    ['일본 (오사카)', '09:00 ~ 19:00', '24시간'],
  ]), { cls: 'mb6' }) : ''}

    <div class="card"><div class="card-bd">
      <div class="field"><label class="label">문의 유형<span class="req">*</span></label>
        <select class="select"><option>예약 변경</option><option>취소·환불</option><option ${urgent ? 'selected' : ''}>바우처</option><option>현지 문제</option><option>기타</option></select></div>

      <div class="field"><label class="label">어떤 예약에 대한 문의인가요? <span class="muted" style="font-weight:400">(선택)</span></label>
        <select class="select"><option>선택하지 않음</option>
          <option ${urgent ? 'selected' : ''}>TN2607-284193 · 자유의 여신상 크루즈 · 8월 3일</option>
          <option>TN2607-284188 · 브루클린 야경 투어 · 8월 4일</option>
          <option>TN2606-271004 · 루브르 박물관 · 6월 18일</option></select>
        <p class="hint">예약을 선택하면 담당자가 내역을 바로 확인할 수 있어요.</p></div>

      <div class="field"><label class="label">제목<span class="req">*</span></label>
        <input class="input" placeholder="예: 픽업 호텔을 변경하고 싶어요"></div>

      <div class="field"><label class="label">내용<span class="req">*</span></label>
        <textarea class="textarea" placeholder="상황을 구체적으로 적어주시면 한 번에 해결하기 쉬워요. 예약번호, 날짜, 원하시는 처리 방법을 함께 알려주세요."></textarea></div>

      <div class="field"><label class="label">파일 첨부 <span class="muted" style="font-weight:400">(이미지 최대 3장 · 총 10MB)</span></label>
        ${over ? `
        <div class="col">
          <div class="row-b box" style="padding:10px 14px"><span>여권사본.jpg <span class="t-sub">4.2MB</span></span>${badge('업로드 완료', 'b-ok')}</div>
          <div class="row-b box" style="padding:10px 14px"><span>영수증_원본.png <span class="t-sub">7.8MB</span></span>${badge('용량 초과', 'b-danger')}</div>
          <div class="row-b box" style="padding:10px 14px"><span>화면캡처.png <span class="t-sub">1.1MB</span></span>${badge('업로드 완료', 'b-ok')}</div>
        </div>
        ${banner('danger', '⚠', `<b>총 용량 10MB를 넘었어요.</b> 현재 13.1MB — <b>영수증_원본.png</b> 를 줄이거나 제외해주세요.
          <div class="btns mt3"><button class="btn btn-primary btn-sm" type="button" data-toast="이미지를 압축했어요 (7.8MB → 1.9MB)">자동 압축하기</button>
            <button class="btn btn-ghost btn-sm" type="button" data-toast="파일을 제외했어요">이 파일 제외</button></div>`, { cls: 'mt3' })}`
      : `<div class="box center" style="border-style:dashed"><p class="t-sub">파일을 끌어다 놓거나 선택해주세요</p>
          <button class="btn btn-ghost btn-sm mt3" type="button" data-toast="파일 선택 창을 열었어요">파일 선택</button></div>`}</div>

      <div class="field"><label class="label">답변 받을 방법<span class="req">*</span></label>
        <div class="radio-list">
          <label class="radio on" data-group="ch"><input type="radio" name="ch" checked><span><b>이메일</b><span class="sub">kim@example.com</span></span></label>
          <label class="radio" data-group="ch"><input type="radio" name="ch"><span><b>카카오톡</b><span class="sub">010-****-5678 · 알림톡으로 발송</span></span></label>
        </div></div>

      ${banner('pri', '⏱', `<b>보통 영업일 기준 1일 안에 답변드려요.</b> 현지에서 급하신 경우 전화가 가장 빠릅니다.
        <div class="mt2">한국어 긴급 회선 <b>+82 2-000-0000</b> (24시간) · 고객센터 ${SITE.tel} (${SITE.hours})</div>`, { cls: 'mb4' })}

      <div class="btns"><button class="btn btn-primary btn-lg ${over ? 'is-off' : ''}" type="button" ${over ? 'disabled' : `onclick="location.href='${link('CS0301')}'"`}>문의 접수</button>
        <a class="btn btn-ghost btn-lg" href="${link('CS0101')}">자주 묻는 질문 보기</a></div>
      ${over ? '<p class="err">첨부 용량을 줄이면 접수할 수 있어요.</p>' : ''}
    </div></div>
  </div></div>`;

  return {
    body, o: {
      state: urgent ? '긴급 문의 안내 — 출발 24시간 이내 감지와 즉시 연결' : over ? '첨부 용량 초과 — 초과 파일 표시와 자동 압축 제안' : '',
    },
  };
}

/* ===== CS03 문의 내역 ===== */
export function CS0301(ctx) {
  const detail = ctx.id === 'CS0302';

  const item = (q, i) => {
    const open = detail ? i === 0 : i === 0;
    return `<div class="acc-item${open ? ' on' : ''}">
      <button class="acc-q" type="button"><span>
        ${q.state === '답변 완료' ? '<span class="dot" style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--primary);margin-right:8px;vertical-align:middle"></span>' : ''}
        ${q.title}<span class="t-sub" style="font-weight:400;margin-left:8px">${q.type} · ${q.date}</span></span>
        <span class="mk">${badge(q.state, q.state === '답변 완료' ? 'b-ok' : 'b-warn')}</span></button>
      <div class="acc-a">
        ${q.prod ? `<div class="mb4">${prodSummary(P(q.prod), { right: `<a class="btn btn-ghost btn-sm" href="${link('MY0501')}">예약 상세</a>` })}</div>` : ''}
        <div class="thread">
          <div class="bubble me"><div class="who">나 · ${q.date}</div>${esc(q.q)}</div>
          ${q.a ? `<div class="bubble cs"><div class="who">${q.by} · ${q.at}</div>${esc(q.a)}</div>` : `<div class="bubble cs"><div class="who">트래블나우</div>
            답변을 준비하고 있어요. 영업일 기준 1일 안에 알려드릴게요.</div>`}
        </div>
        ${q.a && detail && i === 0 ? `<div class="box mt4"><b>답변이 도움이 되었나요?</b>
          <div class="btns mt3">${['매우 만족', '만족', '보통', '불만족'].map((t, k) => `<button class="btn btn-ghost btn-sm" type="button" data-toast="평가해주셔서 감사해요" data-toast-kind="ok">${t}</button>`).join('')}</div></div>
          <div class="btns mt3"><button class="btn btn-ghost btn-sm" type="button" data-toast="첨부 파일을 내려받았어요">📎 변경된_바우처.pdf 내려받기</button></div>` : ''}
        <div class="mt4"><label class="label">추가 질문 이어쓰기</label>
          <textarea class="textarea" style="min-height:88px" placeholder="같은 문의에 이어서 질문할 수 있어요"></textarea>
          <div class="btns mt3"><button class="btn btn-primary btn-sm" type="button" data-toast="추가 질문을 등록했어요" data-toast-kind="ok">등록</button></div></div>
      </div></div>`;
  };

  const body = `${pageHd('문의 내역', '답변이 달린 문의는 목록에서 점으로 표시돼요')}
  <div class="split">${csNav(ctx.id)}<div>
    ${tabs([{ label: '전체', cnt: 3 }, { label: '답변 대기', cnt: 1 }, { label: '답변 완료', cnt: 2 }], detail ? 2 : 0)}
    <div class="card"><div class="card-bd" style="padding-top:4px;padding-bottom:4px">
      ${(detail ? INQUIRIES.filter((q) => q.state === '답변 완료') : INQUIRIES).map(item).join('')}
    </div></div>
    <div class="box mt6 row-b wrap-row"><div><b>새로 문의할 내용이 있나요?</b>
      <p class="t-sub mt1">예약을 함께 선택하면 더 빠르게 답변드려요.</p></div>
      <a class="btn btn-primary" href="${link('CS0201')}">1:1 문의하기</a></div>
  </div></div>`;

  return { body, o: { logged: true, state: detail ? '답변 완료 상세 — 대화 스레드와 만족도 평가' : '' } };
}

/* ===== CS04 공지사항 ===== */
export function CS0401(ctx) {
  const detail = ctx.id === 'CS0402';
  const pin = NOTICES[0];

  const body = `${pageHd('공지사항', '운영 · 이벤트 · 현지 소식을 알려드려요')}
  <div class="split">${csNav(ctx.id)}<div>
    ${banner('danger', '📢', `<b>${pin.title}</b>
      <div class="t-sub mt1">${pin.date} · 현지소식</div>`, {
    cls: 'mb6',
    right: detail ? '' : `<a class="btn btn-ghost" href="${link('CS0402')}">자세히 보기</a>`,
  })}

    ${detail ? `
    <div class="card mb6"><div class="card-hd"><div>
        <div class="badges mb2">${badge('현지소식', 'b-danger')}${badge('진행 중', 'b-warn')}</div>
        <h2 class="t-sec">${pin.title}</h2>
        <p class="t-sub mt1">${pin.date} 등록 · <b>2026.07.30 08:00 갱신</b></p></div></div>
      <div class="card-bd">
        <p>${pin.body}</p>
        <h3 class="t-card mt6 mb3">영향 범위</h3>
        ${U.table([{ t: '구분', w: '28%' }, '내용'], [
      ['영향 지역', '칸쿤 · 플라야델카르멘 · 이슬라무헤레스'],
      ['영향 기간', '2026년 8월 1일 ~ 8월 2일 (현지 시각)'],
      ['영향 상품', '해상 투어 · 스노클링 · 카타마란 (총 34개 상품)'],
      ['처리 방침', '현지 취소 시 <b>전액 환불</b> · 별도 신청 불필요'],
    ])}

        <h3 class="t-card mt6 mb3">영향받는 내 예약</h3>
        ${banner('warn', '⚠', `예약 <b>1건</b>이 이 이슈에 해당해요.`, { cls: 'mb3' })}
        ${prodSummary(P('P08'), {
      date: '2026.08.01(토) 09:00', pax: '성인 2', state: '영향 가능', stateCls: 'b-warn',
      right: `<a class="btn btn-ghost btn-sm" href="${link('MY0501')}">예약 상세</a>`,
    })}

        <h3 class="t-card mt6 mb3">대체 일정과 환불</h3>
        <ul>${['현지에서 취소되면 별도 신청 없이 3영업일 안에 전액 환불됩니다.',
      '날짜를 옮기고 싶으시면 8월 4일 이후 회차로 무료 변경해드려요.',
      '기상 상황은 매일 08:00(현지)에 갱신되며, 변경 시 카카오톡으로 알려드립니다.']
        .map((t) => `<li style="padding:4px 0">· ${t}</li>`).join('')}</ul>
        <div class="btns mt6"><a class="btn btn-primary" href="${link('MY0601')}">날짜 변경·취소 신청</a>
          <a class="btn btn-ghost" href="${link('CS0201')}">1:1 문의</a></div>
      </div></div>` : ''}

    <div class="card"><div class="card-bd" style="padding-top:4px;padding-bottom:4px">
      ${NOTICES.map((n, i) => `<div class="acc-item${i === (detail ? 3 : 1) ? ' on' : ''}">
        <button class="acc-q" type="button"><span>${badge(n.cat, n.danger ? 'b-danger' : n.cat === '이벤트' ? 'b-acc' : 'b-line')}
          <span style="margin-left:8px">${n.title}</span></span>
          <span class="mk t-sub">${n.date}</span></button>
        <div class="acc-a">${n.body}
          ${n.danger ? `<div class="btns mt3"><a class="btn btn-ghost btn-sm" href="${link('CS0402')}">현지 이슈 상세 보기</a></div>` : ''}</div></div>`).join('')}
    </div></div>
    <div class="pager"><span class="on">1</span><span class="off">2</span><span class="off">3</span><span class="off">›</span></div>
  </div></div>`;

  return { body, o: { state: detail ? '현지 이슈 상세 — 영향 범위와 내 예약 자동 매칭' : '' } };
}

/* ===== CS05 취소·환불 규정 안내 ===== */
export function CS0501(ctx) {
  const id = ctx.id;
  const typeTab = id === 'CS0502';
  const mine = id === 'CS0503';
  const types = [['tour', '투어'], ['ticket', '입장권'], ['pass', '패스']];

  const ruleTable = (key) => U.table(
    [{ t: '취소 시점', w: '34%' }, '환불율', '취소 수수료', ''],
    REFUND_RULES[key].map((r) => ({
      cls: r.now ? 'is-now' : '',
      cells: [r.when, `<b>${r.rate}</b>`, r.fee, `<span class="bar" style="display:block;width:100%"><i style="width:${parseInt(r.rate, 10)}%"></i></span>`],
    })),
  );

  const body = `${pageHd('취소 · 환불 규정', '언제까지 취소하면 얼마를 돌려받는지 한눈에 정리했어요')}
  <div class="split">${csNav(id)}<div>
    ${banner('pri', '💡', `<b>가장 많이 찾는 답</b> — 투어는 <b>출발 8일 전까지 100% 환불</b>, 입장권은 <b>이용일 전일까지 100% 환불</b>이에요. 기준 시각은 <b>현지 시각</b>입니다.`, { cls: 'mb6' })}

    ${tabs(types.map(([k, l]) => ({ label: l, pane: k })), 0, { pill: true })}
    ${types.map(([k, l], i) => `<div data-pane-body="${k}" ${i === 0 ? '' : 'hidden'}>
      ${sec(`${l} 환불 규정`, ruleTable(k))}
      ${sec('', `<div class="box-pri"><b>계산 예시</b>
        <p class="mt2">${k === 'tour' ? '8월 10일 출발 투어라면 → <b>8월 2일 밤 23:59(현지 시각)</b> 까지 무료 취소, 8월 3~6일 취소 시 70% 환불'
      : k === 'ticket' ? '8월 10일 이용 입장권이라면 → <b>8월 9일 23:59(현지 시각)</b> 까지 무료 취소, 당일 취소는 환불 불가'
        : '3일권 패스를 8월 3일에 처음 사용했다면 → <b>첫 사용 전까지</b> 100% 환불, 사용 시작 후에는 환불 불가'}</p></div>`)}
    </div>`).join('')}

    ${sec('', banner('warn', '🕐', `<b>모든 기준 시각은 상품 이용 도시의 현지 시각이에요.</b> 뉴욕은 한국보다 13시간 느리니, 한국 시각으로 계산하면 하루 차이가 날 수 있어요.`))}

    ${sec('특별한 경우', `<div class="g2 g1-m">
      ${card('기상 악화 · 천재지변', `<p>현지에서 운영이 취소되면 <b class="success">전액 환불</b>됩니다. 별도 신청 없이 3영업일 안에 처리돼요.</p>
        <p class="t-sub mt3">여행자 판단으로 가지 않은 경우는 일반 취소 규정이 적용됩니다.</p>`)}
      ${card('최소 출발 인원 미달', `<p>인원이 모이지 않아 자동 취소되면 <b class="success">전액 환불</b>되고, 사과 쿠폰을 드려요.</p>
        <p class="t-sub mt3"><a class="pri strong" href="${link('BK0601')}">최소 인원 안내 화면 보기 ›</a></p>`)}
      ${card('노쇼 (예약하고 안 나타남)', `<p>사전 연락 없이 오지 않으면 <b class="danger">환불되지 않습니다.</b></p>
        <p class="t-sub mt3">늦으실 것 같으면 바우처의 현지 연락처로 미리 알려주세요. 회차 변경이 가능할 수 있어요.</p>`)}
      ${card('일부 인원만 이용', `<p>이용하지 않은 인원만 부분 환불됩니다. 단, 최소 출발 인원에 영향이 있으면 회차 전체가 조정될 수 있어요.</p>
        <p class="t-sub mt3"><a class="pri strong" href="${link('MY0603')}">부분 취소 화면 보기 ›</a></p>`)}
    </div>`)}

    ${sec('환불 소요 기간', U.table([{ t: '결제 수단', w: '30%' }, '소요 기간', '비고'], [
    ['신용·체크카드', '3~5영업일', '카드사 승인 취소 처리 기간 포함'],
    ['간편결제 (카카오·네이버·토스)', '1~3영업일', '충전 잔액은 즉시 복원'],
    ['해외 발행 카드', '5~15영업일', '카드사·국가에 따라 더 걸릴 수 있어요'],
    ['포인트 · 쿠폰', '즉시', '쿠폰은 유효기간이 남아 있을 때만 복원'],
  ]))}

    ${mine ? sec('내 예약의 규정 확인', `
      ${banner('pri', 'ℹ', '<b>현재 시점 기준</b>으로 계산한 환불 예상액이에요. 시간이 지나면 금액이 달라질 수 있어요.', { cls: 'mb4' })}
      ${U.table([{ t: '예약', w: '30%' }, '이용일', '현재 구간', '환불 예상액', ''], [
      { cls: '', cells: ['자유의 여신상 크루즈<br><span class="t-sub">TN2607-284193</span>', '8월 3일 14:00', '<span class="badge b-warn">D-4 · 70% 구간</span>', `<b>${won(128800)}</b><br><span class="t-sub">수수료 55,200원</span>`, `<a class="btn btn-ghost btn-sm" href="${link('MY0601')}">취소 신청</a>`] },
      { cls: '', cells: ['브루클린 야경 투어<br><span class="t-sub">TN2607-284188</span>', '8월 4일 18:30', '<span class="badge b-ok">확정 대기 · 전액</span>', `<b>${won(158000)}</b><br><span class="t-sub">수수료 없음</span>`, `<a class="btn btn-ghost btn-sm" href="${link('MY0601')}">취소 신청</a>`] },
      { cls: 'is-off', cells: ['3대 전망대 통합권<br><span class="t-sub">TN2607-284170</span>', '8월 5일 자유 이용', '<span class="badge b-danger">취소 불가</span>', '—<br><span class="t-sub">이용일 전일 마감</span>', `<a class="btn btn-ghost btn-sm" href="${link('MY0701')}">사유 보기</a>`] },
    ], { scroll: true, fix: true })}
      <p class="t-sub mt3">무료 취소 잔여 시간 — 브루클린 야경 투어는 <b class="danger">확정 전까지</b> 전액 환불 가능해요.</p>`) : ''}

    ${sec('자주 묻는 취소 질문', accordion([
      { q: '환불 기준 시각이 왜 현지 시각인가요?', a: '현지 운영사가 좌석을 관리하기 때문이에요. 뉴욕 상품은 뉴욕 시각(EDT), 파리 상품은 파리 시각(CEST) 기준으로 계산합니다.' },
      { q: '무료 취소 기한을 하루 넘겼어요.', a: '규정상 수수료가 발생하지만, 기상이나 질병 같은 불가피한 사유라면 증빙을 첨부해 예외 요청을 접수할 수 있어요. 현지 업체 확인 후 결정됩니다.' },
      { q: '쿠폰으로 할인받은 금액은 어떻게 환불되나요?', a: '실제 결제한 금액을 기준으로 환불되고, 사용한 쿠폰은 유효기간이 남아 있으면 복원됩니다. 포인트는 즉시 복원됩니다.' },
      { q: '부분 취소도 수수료가 붙나요?', a: '취소하는 인원 금액에 대해 같은 수수료율이 적용됩니다. 남은 인원이 최소 출발 인원보다 적어지면 별도 안내를 드려요.' },
      { q: '패스를 한 곳만 쓰고 취소할 수 있나요?', a: '첫 사용 이후에는 환불되지 않습니다. 사용 전이라면 구매 후 90일 내 100% 환불됩니다.' },
    ], 0))}

    <div class="btns mt8" style="justify-content:center">
      ${mine ? `<a class="btn btn-ghost btn-lg" href="${link('MY0301')}">예약 내역 보기</a>` : `<a class="btn btn-primary btn-lg" href="${link('CS0503')}">내 예약의 규정 확인하기</a>`}
      <a class="btn btn-ghost btn-lg" href="${link('CS0201')}">1:1 문의하기</a></div>
  </div></div>`;

  return {
    body, o: {
      logged: mine,
      state: typeTab ? '상품 유형별 규정 탭 — 유형별 환불율 단계 표' : mine ? '내 예약 규정 확인 — 현재 시점 환불 예상액 자동 계산' : '',
    },
  };
}
