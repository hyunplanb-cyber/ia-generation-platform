/* HM 공구 관리(진행자) 19장 — 대시보드 · 참여 현황 · 마감·성사 · 발주·배송 · 공지 발송 */
import {
  ph, phAva, phFix, btn, badge, stBadge, chips, tabs, sec, card, banner, empty, table, kv,
  gauge, countdown, tierTable, leftText, statRow, progress, sumRows, timeline,
  toastNow, modalNow, accordion,
  pageHd, detail2, hostPage, num, won, esc, link, off,
} from './ui.mjs';
import { DEALS, dealById, pctOf, MY_DEALS, JOINS, TIERS } from './data.mjs';

/* ── HM-01 진행자 대시보드 ──────────────────────────────
   v: 'risk' 미달 위험 강조 · 'empty' 공구 없음 */
function hm01(ctx, v) {
  /* 빈 상태 */
  if (v === 'empty') {
    const body = hostPage('HM-01', `
      ${pageHd('진행자 대시보드', '아직 연 공구가 없습니다',
      `<div class="btns">${btn('새 공구 개설', { cls: 'btn-primary', href: 'HS-02' })}</div>`)}

      ${empty('📦', '첫 공구를 열어 보세요',
      '상품과 공급처만 정해지면 10분이면 올리실 수 있습니다. 검수는 영업일 기준 1~2일 걸리고, 첫 공구는 수수료가 없습니다.',
      `${btn('공구 개설하기', { cls: 'btn-primary btn-lg', href: 'HS-02' })}${btn('진행자 안내 보기', { cls: 'btn-ghost btn-lg', href: 'HS-01' })}`)}

      ${card('시작하기 전에 준비할 것', `<div class="g3">
        ${[['상품과 공급처', '얼마에 몇 개까지 받을 수 있는지 확인하세요', '필수'],
      ['정산 계좌', '본인 명의 계좌면 됩니다', '필수'],
      ['사업자등록', '없어도 시작할 수 있습니다', '선택']]
      .map(([t, s, k]) => `<div class="box"><div class="row-b"><b>${t}</b>${badge(k, k === '필수' ? 'b-danger' : 'b-mut')}</div>
          <p class="t-sub mt2">${s}</p></div>`).join('')}
      </div>`, { cls: 'mt6' })}

      ${card('다른 진행자들은 이렇게 시작했어요', `${[
      ['동네장터 지현', '첫 공구 목표 50명 · 성사', '동네 단톡방에 올린 것이 시작이었습니다. 작게 열어서 한 번 성공해 보는 게 중요해요.'],
      ['멍냥집사 태호', '첫 공구 목표 30명 · 성사', '내가 잘 아는 물건만 열었습니다. 아는 물건이라 문의에 바로 답할 수 있었어요.'],
    ].map(([nm, st, t]) => `<div class="list-row">${phAva(40, nm)}
        <div class="grow"><b>${nm}</b><div class="t-sub">${st}</div><p class="mt2">${t}</p></div></div>`).join('')}`,
      { cls: 'mt6', ft: btn('진행자 FAQ 보기', { cls: 'btn-ghost btn-block btn-sm', href: 'HS0103' }) })}

      ${card('임시 저장해 둔 것', `<div class="row-b list-row" style="padding:14px 0">
        <div class="grow"><b>제주 한라봉 5kg 산지직송 (특대과)</b>
          <div class="t-sub mt1">2026년 8월 4일 14:52 저장 · 작성률 80%</div></div>
        <div class="btns">${btn('이어서 쓰기', { cls: 'btn-primary btn-sm', href: 'HS0204' })}
          <button class="btn btn-ghost btn-sm" type="button" data-toast="임시 저장을 지웠어요">지우기</button></div>
      </div>`, { cls: 'mt6' })}`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '연 공구 0건 · 임시 저장 1건' } };
  }

  /* 미달 위험 강조 */
  if (v === 'risk') {
    const d = dealById('d1');
    const body = hostPage('HM-01', `
      ${pageHd('진행자 대시보드', '미달 위험 공구를 먼저 보여드립니다',
      `<div class="btns">${btn('새 공구 개설', { cls: 'btn-primary', href: 'HS-02' })}</div>`)}

      ${banner('danger', '⚠️', `<b>3시간 뒤 마감되는 공구가 53명 부족합니다.</b>
        <p class="t-sub">지금 손을 쓰지 않으면 불발됩니다. 아래에서 무엇을 할 수 있는지 보세요.</p>`,
      { right: btn('바로 처리하기', { cls: 'btn-primary btn-sm', href: 'HM-03' }) })}

      ${card('미달 위험 — 제주 한라봉 5kg 산지직송', `<div class="row wrap-row" style="gap:24px;align-items:flex-start">
        <div class="grow" style="min-width:280px">
          <div class="mt2">${gauge(pctOf(d))}</div>
          <div class="row-b mt2"><span class="t-sub">${num(d.joined)} / ${num(d.goal)}명</span>
            <b class="danger">${num(d.goal - d.joined)}명 부족</b></div>
          <div class="hr"></div>
          ${table(
        ['시간', '참여', '누적', '필요 속도'],
        [
          ['3시간 전', '+9명', '229명', '시간당 18명'],
          ['2시간 전', '+7명', '236명', '시간당 21명'],
          ['1시간 전', '+6명', '242명', '시간당 29명'],
          ['지금', '+5명', '<b>247명</b>', '<b class="danger">시간당 18명 필요</b>'],
        ],
      )}
          <p class="t-sub mt3">지금 속도(시간당 3.1명)로는 남은 3시간에 약 10명이 더 참여합니다. 53명에는 크게 못 미칩니다.</p>
        </div>
        <div class="box" style="min-width:280px">
          <b>지금 할 수 있는 것</b>
          <div class="mt3">${[
        ['독려 알림 보내기', '지난 3회 평균 +18명', 'HM-05'],
        ['마감 24시간 늘리기', '지난 3회 평균 +41명', 'HM0302'],
        ['최소 성사 인원 낮추기', '247명으로 성사 가능', 'HM-03'],
        ['불발 처리하기', '전액 환불 · 수수료 없음', 'HM0303'],
      ].map(([t, s, go]) => `<a class="list-row" href="${link(go)}" style="padding:10px 0">
            <div class="grow"><b>${t}</b><div class="t-sub">${s}</div></div><span class="muted">›</span></a>`).join('')}</div>
        </div>
      </div>`, { cls: 'mt6' })}

      ${statRow([
      ['53명', '부족 인원', { ic: '⚠️' }],
      ['3시간 7분', '남은 시간', { ic: '⏱' }],
      ['3.1명', '시간당 참여', { ic: '📉', d: '필요 18명' }],
      ['615만원', '묶인 결제액', { ic: '💳', d: '불발 시 전액 환불' }],
    ])}

      ${card('나머지 공구', table(
      [{ t: '공구', w: '32%' }, '상태', '달성률', '남은 시간', ''],
      MY_DEALS.slice(1).map((m) => [
        `<a href="${link('HM-02')}"><b>${esc(dealById(m.id).nm)}</b></a>`,
        stBadge(m.st),
        m.goal ? gauge(Math.round(m.joined / m.goal * 100)) : '—',
        m.left ? countdown(m.left) : '—',
        btn('현황', { cls: 'btn-ghost btn-sm', href: 'HM-02' }),
      ]),
    ), { cls: 'mt6' })}`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '미달 위험 1건 · 53명 부족 · 3시간 7분 남음' } };
  }
  return hm01base(ctx);
}

function hm01base() {
  const rows = MY_DEALS.map((m) => {
    const d = dealById(m.id);
    const pct = m.goal ? Math.round(m.joined / m.goal * 100) : 0;
    const risk = m.st === '모집 중' && pct < 60 && m.left < 1500;
    return {
      cls: risk ? 'is-diff' : '',
      cells: [
        `<a href="${link('HM-02')}"><b>${esc(d.nm)}</b></a>${risk ? ' ' + badge('미달 위험', 'b-danger') : ''}`,
        stBadge(m.st),
        m.goal ? gauge(pct) : '—',
        m.joined ? `${num(m.joined)} / ${num(m.goal)}명` : '—',
        m.left ? countdown(m.left) : '—',
        m.rev ? won(m.rev) : '—',
        `<div class="btns nowrap">${btn('현황', { cls: 'btn-ghost btn-sm', href: 'HM-02' })}
          ${btn('공지', { cls: 'btn-ghost btn-sm', href: 'HM-05' })}</div>`,
      ],
    };
  });

  const body = hostPage('HM-01', `
    ${pageHd('진행자 대시보드', '오늘 처리할 일과 진행 중인 공구를 한자리에서 봅니다',
    `<div class="btns">${btn('새 공구 개설', { cls: 'btn-primary', href: 'HS-02' })}</div>`)}

    ${statRow([
    ['3개', '진행 중 공구', { ic: '📦', d: '검수 대기 1개' }],
    ['852명', '총 참여자', { ic: '👥', d: '이번 주 +214' }],
    ['2,996만원', '이번 달 매출', { ic: '💳', d: '전월 대비 +34%' }],
    ['2,250만원', '정산 예정', { ic: '💰', d: '8월 12일' }],
  ])}

    ${banner('danger', '⚠️', `<b>「제주 한라봉」이 미달 위험이에요.</b>
      <p class="t-sub">3시간 7분 남았는데 53명이 부족합니다. 참여자에게 공유를 부탁하거나 마감을 늘려 보세요.</p>`,
    { right: `<div class="btns">${btn('자세히', { cls: 'btn-primary btn-sm', href: 'HM0102' })}${btn('독려 보내기', { cls: 'btn-ghost btn-sm', href: 'HM-05' })}</div>` })}

    ${card('내 공구', table(
    [{ t: '공구', w: '28%' }, '상태', { t: '달성률', w: '16%' }, '참여', '남은 시간', '매출', { t: '', w: '140px' }],
    rows,
  ), { cls: 'mt6', aside: `<a class="more" href="${link('HM-02')}">참여 현황 ›</a>` })}

    <div class="g3 mt6">
      ${card('처리할 일', `${[
    ['발주 대기', '1건', 'HM-04', 'b-warn'],
    ['배송 대기', '119건', 'HM-04', 'b-warn'],
    ['미답변 문의', '2건', 'RV-02', 'b-danger'],
    ['검수 반려', '1건', 'HS-03', 'b-danger'],
  ].map(([t, n, go, k]) => `<a class="feed-row" href="${link(go)}"><div class="grow">${t}</div>${badge(n, k)}</a>`).join('')}`)}

      ${card('마감 임박', `${MY_DEALS.filter((m) => m.left && m.left < 700).map((m) => {
    const d = dealById(m.id);
    return `<div style="padding:8px 0"><div class="row-b"><b>${esc(d.nm).slice(0, 16)}…</b>${countdown(m.left)}</div>
          <div class="mt2">${gauge(Math.round(m.joined / m.goal * 100))}</div></div>`;
  }).join('')}`, { ft: btn('마감·성사 처리', { cls: 'btn-ghost btn-block btn-sm', href: 'HM-03' }) })}

      ${card('내 성적', `${kv([
    ['성사율', '91% (34회 중 31회)'],
    ['평균 평점', '4.8'],
    ['배송 지연', '0회'],
    ['신뢰 등급', badge('A', 'b-ok') + ' 수수료 4%'],
  ])}
        <div class="box box-ok mt3"><p class="t-sub">A등급이라 목록에서 위쪽에 노출되고 수수료가 1% 낮습니다.</p></div>`)}
    </div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── HM-02 공구별 참여 현황 ───────────────────────────
   v: 'people' 참여자 목록 상세 · 'chart' 시간대 추이 · 'export' 내보내기 */
function hm02(ctx, v) {
  const d = dealById('d1');
  const pct = pctOf(d);
  const people = [
    ['김하*', '5kg', 1, 24900, '2026-08-04 18:24', '정상'],
    ['이준*', '10kg', 1, 46900, '2026-08-04 17:51', '정상'],
    ['박민*', '5kg', 2, 49800, '2026-08-04 16:32', '정상'],
    ['최윤*', '5kg', 1, 24900, '2026-08-04 15:10', '취소'],
    ['정태*', '10kg', 1, 46900, '2026-08-04 14:47', '정상'],
    ['손예*', '5kg', 3, 74700, '2026-08-04 13:02', '정상'],
  ];
  const more = [
    ['한서*', '5kg', 1, 24900, '2026-08-04 12:40', '정상'],
    ['오지*', '10kg', 2, 93800, '2026-08-04 11:18', '정상'],
    ['배수*', '5kg', 1, 24900, '2026-08-04 10:55', '정상'],
    ['문가*', '5kg', 1, 24900, '2026-08-04 09:30', '취소'],
    ['서동*', '10kg', 1, 46900, '2026-08-04 08:12', '정상'],
    ['임채*', '5kg', 2, 49800, '2026-08-03 22:47', '정상'],
  ];

  /* 참여자 목록 상세 — 표만 크게 */
  if (v === 'people') {
    const body = hostPage('HM-02', `
      ${pageHd('참여자 목록', `${esc(d.nm)} · ${num(d.joined)}명`,
      `<div class="btns">${btn('공지 보내기', { cls: 'btn-primary', href: 'HM-05' })}
        ${btn('내보내기', { cls: 'btn-ghost', href: 'HM0204' })}</div>`)}

      ${card('', `<div class="row-b wrap-row mb4" style="gap:12px">
        <div class="row wrap-row" style="gap:8px">
          <input class="input" style="width:200px" placeholder="닉네임·참여번호 검색">
          ${chips(['전체 247', '정상 239', '취소 8', '5kg 189', '10kg 58'], 0)}
        </div>
        <select class="select" style="width:170px"><option>참여 최신순</option><option>결제액 큰 순</option><option>수량 많은 순</option></select>
      </div>
      ${table(
        [{ t: '', w: '36px' }, '닉네임', '참여번호', '옵션', '수량', '결제액', '참여 시각', '배송지', '상태'],
        [...people, ...more].map(([nm, opt, qty, pay, at, st], i) => ({
          cls: st === '취소' ? 'is-off' : '',
          cells: [
            '<label class="check" style="padding:0"><input type="checkbox"><span></span></label>',
            `<div class="row" style="gap:8px">${phAva(28, nm)}<b>${nm}</b></div>`,
            `MG2026080${4 - Math.floor(i / 6)}-${4400 + i}`,
            opt, `${qty}개`, won(pay), at,
            ['서울 성동구', '경기 성남시', '부산 해운대구', '제주 제주시', '대전 유성구', '인천 연수구'][i % 6],
            st === '취소' ? badge('취소·환불', 'b-mut') : badge('정상', 'b-ok'),
          ],
        })),
        { fix: true },
      )}
      <div class="row-b mt4 wrap-row">
        <label class="check" style="padding:0"><input type="checkbox"><span>전체 선택 (247명)</span></label>
        <div class="pager" style="margin:0"><span class="on">1</span><span class="off">2</span><span class="off">3</span><span>…</span><span class="off">21</span></div>
      </div>`)}

      ${card('선택한 참여자에게', `<div class="row wrap-row" style="gap:8px">
        ${btn('공지 보내기', { cls: 'btn-primary btn-sm', href: 'HM-05' })}
        ${btn('배송지 확인 요청', { cls: 'btn-ghost btn-sm', attr: ' data-toast="배송지 확인 요청을 보냈어요" data-toast-kind="ok"' })}
        ${btn('참여 취소 처리', { cls: 'btn-danger btn-sm', attr: ' data-toast="선택한 참여를 취소하고 환불을 걸었어요"' })}
      </div>
      <p class="t-sub mt3">취소 처리하시면 그 자리에서 환불이 걸리고 달성률이 내려갑니다. 되돌릴 수 없습니다.</p>`,
      { cls: 'mt6' })}`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '참여자 목록 상세 · 247명' } };
  }

  /* 시간대 추이 */
  if (v === 'chart') {
    const hours = [
      ['8/5 10시', 62, '오픈'], ['8/5 12시', 28, ''], ['8/5 18시', 41, ''],
      ['8/6 10시', 19, ''], ['8/7 20시', 33, '독려 알림'], ['8/9 12시', 14, ''],
      ['8/11 20시', 26, '단계 도달'], ['8/12 18시', 24, ''],
    ];
    const max = Math.max(...hours.map((h) => h[1]));
    const body = hostPage('HM-02', `
      ${pageHd('시간대 추이', `${esc(d.nm)} · 오픈 후 7일`)}

      ${statRow([
      ['247명', '누적 참여', { ic: '👥' }],
      ['62명', '가장 많았던 시간', { ic: '📈', d: '오픈 직후 2시간' }],
      ['3.1명', '지금 시간당', { ic: '📉', d: '필요 18명' }],
      ['8/7 20시', '독려 알림 효과', { ic: '📣', d: '+33명' }],
    ])}

      ${card('구간별 참여', `<div class="mt2">${hours.map(([t, n, note]) => `<div class="bar-row mt2" style="grid-template-columns:88px 1fr 64px">
        <span class="t-sub nowrap">${t}</span>
        <div class="progress"><div class="fill" style="width:${Math.round(n / max * 100)}%"></div></div>
        <span class="nowrap"><b>${n}명</b></span>
      </div>${note ? `<div class="t-sub" style="margin-left:96px">↑ ${note}</div>` : ''}`).join('')}</div>
      <div class="box mt4"><b>읽는 법</b>
        <p class="t-sub mt1">공구는 <b>오픈 직후</b>와 <b>마감 직전</b>에 참여가 몰립니다.
        가운데가 길게 늘어질수록 성사율이 떨어지니, 중간에 독려 알림을 한 번 넣는 것이 좋습니다.
        8월 7일 독려 알림 뒤 33명이 들어온 것이 그 예입니다.</p></div>`)}

      ${card('요일·시간대', `${table(
      ['', '오전', '점심', '오후', '저녁', '밤'],
      [
        ['월', '4', '9', '6', '<b>18</b>', '11'],
        ['화', '3', '7', '5', '14', '9'],
        ['수', '5', '11', '8', '<b>21</b>', '12'],
        ['목', '3', '8', '6', '16', '10'],
        ['금', '4', '10', '7', '<b>19</b>', '8'],
        ['토', '8', '14', '12', '15', '6'],
        ['일', '9', '13', '11', '12', '5'],
      ],
    )}
      <p class="t-sub mt3">저녁 8~10시에 가장 많이 들어옵니다. 공지와 독려 알림은 이 시간에 맞추시면 도달률이 높습니다.</p>`,
      { cls: 'mt6', ft: btn('이 시간에 예약 발송하기', { cls: 'btn-ghost btn-block btn-sm', href: 'HM0502' }) })}

      ${card('단계 도달 시점', tierTable(TIERS, { next: '250명까지 3명 남았습니다.' }), { cls: 'mt6' })}`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '시간대 추이 · 오픈 후 7일' } };
  }

  /* 내보내기 */
  if (v === 'export') {
    const body = hostPage('HM-02', `
      ${pageHd('참여자 내보내기', `${esc(d.nm)} · ${num(d.joined)}명`)}

      ${card('무엇을 내보낼까요', `<div class="radio-list">
        ${[['참여자 명단', '닉네임·옵션·수량·결제액·참여 시각', '247행'],
      ['배송지 목록', '받는 분·연락처·주소·요청사항 (택배사 양식)', '239행'],
      ['발주서', '옵션별 수량 집계 (공급처 전달용)', '3행'],
      ['정산 내역', '결제·환불·수수료 상세', '255행']]
      .map(([t, s, n], i) => `<label class="radio${i === 0 ? ' on' : ''}" data-group="ex">
          <input type="radio" name="ex"${i === 0 ? ' checked' : ''}>
          <span class="grow"><b>${t}</b><div class="t-sub">${s}</div></span>
          <span class="t-sub nowrap">${n}</span></label>`).join('')}
      </div>`)}

      ${card('범위와 형식', `<div class="field-row">
        <div class="field"><label class="label">범위</label>
          <select class="select"><option>전체 (취소 포함)</option><option selected>정상 참여만</option><option>취소만</option></select></div>
        <div class="field"><label class="label">형식</label>
          <select class="select"><option selected>엑셀 (XLSX)</option><option>CSV (UTF-8)</option><option>CSV (EUC-KR · 구버전 엑셀)</option></select></div>
      </div>
      <div class="field"><label class="label">넣을 항목</label>
        ${chips(['닉네임', '참여번호', '옵션', '수량', '결제액', '참여 시각', '연락처', '주소', '요청사항'], [0, 1, 2, 3, 4, 5])}</div>
      <label class="check"><input type="checkbox" checked><span>개인정보는 가려서 내보내기 (김하* · 010-****-5678)</span></label>`,
      { cls: 'mt6' })}

      ${banner('warn', '🔒', `<b>개인정보가 담긴 파일입니다.</b>
        <p class="t-sub">배송 목적으로만 쓰시고, 배송이 끝나면 지워 주세요. 내보낸 기록은 30일 동안 남습니다.</p>`, { cls: 'mt6' })}

      ${card('미리보기', table(
      ['닉네임', '옵션', '수량', '결제액', '참여 시각'],
      people.slice(0, 4).map(([nm, opt, qty, pay, at]) => [nm, opt, `${qty}`, `${pay}`, at]),
    ), { cls: 'mt6' })}

      ${card('내보낸 기록', table(
      ['일시', '무엇을', '범위', '받은 사람'],
      [
        ['2026-08-04 18:40', '배송지 목록', '정상 239건', '나 (진행자)'],
        ['2026-08-01 11:20', '참여자 명단', '전체 198건', '나 (진행자)'],
      ],
    ), { cls: 'mt6' })}

      <div class="btns mt6">
        ${btn('내려받기', { cls: 'btn-primary btn-lg', attr: ' data-toast="참여자 명단 247행을 내려받았어요" data-toast-kind="ok"' })}
        ${btn('메일로 받기', { cls: 'btn-ghost btn-lg', attr: ' data-toast="등록하신 메일로 보냈어요" data-toast-kind="ok"' })}
        ${btn('참여 현황으로', { cls: 'btn-ghost btn-lg', href: 'HM-02' })}
      </div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '내보내기 · 참여자 명단 247행' } };
  }

  const main = `
    ${card('', `<div class="row-b wrap-row">
      <div class="grow"><h2 class="t-card">${esc(d.nm)}</h2>
        <div class="t-sub mt1">2026년 8월 5일 10:00 ~ 8월 12일 23:59 · 목표 ${num(d.goal)}명</div></div>
      ${countdown(d.left, { sec: d.left * 60 })}
    </div>
    <div class="mt4">${gauge(pct)}</div>
    <div class="row-b mt2"><span><b class="pri" style="font-size:20px">${num(d.joined)}명</b> / ${num(d.goal)}명</span>
      <b class="pri">${num(d.goal - d.joined)}명이면 성사</b></div>`)}

    ${card('시간대별 참여', `<div class="row-b mb4">${tabs(['24시간', '7일', '전체'], 0, { pill: true })}
      <span class="t-sub">오늘 <b>+62명</b> · 시간당 평균 3.1명</span></div>
      ${ph(['시간대별 참여 추이 막대 차트', 1200, 360], { cls: 'ph-flat' })}
      <div class="box mt4"><b>지금 속도면 목표에 못 미칩니다</b>
        <p class="t-sub mt1">남은 3시간 동안 시간당 3.1명이면 약 10명이 더 참여합니다. 53명이 필요하니 독려가 필요합니다.</p></div>`,
    { cls: 'mt6', aside: `<a class="more" href="${link('HM0203')}">시간대 추이 자세히 ›</a>` })}

    ${card('가격 단계', tierTable(TIERS, { next: '250명까지 <b>3명</b> 남았습니다. 넘으면 참여자 전원에게 차액 3,000원이 환급됩니다.' }), { cls: 'mt6' })}

    ${card('참여자', `<div class="row-b wrap-row mb4" style="gap:12px">
      <div class="row wrap-row" style="gap:8px">
        <input class="input" style="width:200px" placeholder="닉네임 검색">
        ${btn('검색', { cls: 'btn-primary btn-sm', attr: ' data-toast="검색했어요"' })}
        ${chips(['전체', '정상', '취소'], 0)}
      </div>
      <div class="btns">
        ${btn('내보내기', { cls: 'btn-ghost btn-sm', href: 'HM0204' })}
        ${btn('공지 보내기', { cls: 'btn-primary btn-sm', href: 'HM-05' })}
      </div>
    </div>
    ${table(
      ['닉네임', '옵션', '수량', '결제액', '참여 시각', '상태'],
      people.map(([nm, opt, qty, pay, at, st]) => ({
        cls: st === '취소' ? 'is-diff' : '',
        cells: [
          `<div class="row" style="gap:8px">${phAva(28, nm)}<b>${nm}</b></div>`,
          opt, `${qty}개`, won(pay), at,
          st === '취소' ? badge('취소·환불', 'b-mut') : badge('정상', 'b-ok'),
        ],
      })),
    )}
    <p class="t-sub mt3">전체 ${num(d.joined)}명 중 앞 6명만 보여 드립니다. 취소된 건은 달성률에서 이미 빠져 있습니다.</p>`,
    { cls: 'mt6', ft: btn('참여자 전체 보기', { cls: 'btn-ghost btn-block btn-sm', href: 'HM0202' }) })}`;

  const aside = card('요약', `${kv([
    ['참여', `${num(d.joined)}명`],
    ['취소', '8명'],
    ['총 수량', '271개'],
    ['총 결제액', won(6150300)],
    ['예상 수수료', won(246012)],
  ])}
    <div class="hr"></div>
    <div class="btns">
      ${btn('참여자에게 공지', { cls: 'btn-primary btn-block', href: 'HM-05' })}
    </div>
    ${btn('마감·성사 처리', { cls: 'btn-ghost btn-block', href: 'HM-03' })}
    ${btn('참여자 화면 보기', { cls: 'btn-ghost btn-block', href: 'DE-01' })}
    <div class="hr"></div>
    <b>옵션별 집계</b>
    <div class="mt2">${[['5kg', 189], ['10kg', 58], ['세트(품절)', 0]].map(([o, n]) => `<div class="row-b" style="padding:6px 0"><span class="t-sub">${o}</span><b>${n}개</b></div>`).join('')}</div>`);

  const body = hostPage('HM-02', `${pageHd('공구별 참여 현황')}<div class="mt6">${detail2(main, aside)}</div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── HM-03 마감·성사 처리 ─────────────────────────────
   v: 'ext' 마감 연장 옵션 · 'miss' 불발 처리 확인 · 'ok' 성사 확정 모달 */
function hm03(ctx, v) {
  const d = dealById('d1');
  const pct = pctOf(d);

  /* 마감 연장 옵션 */
  if (v === 'ext') {
    const body = hostPage('HM-03', `
      ${pageHd('마감 연장', `${esc(d.nm)} · ${num(d.goal - d.joined)}명 부족`)}

      ${card('얼마나 늘릴까요', `<div class="radio-list">
        ${[['12시간', '8월 13일 11:59까지', '지난 3회 평균 +19명', false],
      ['24시간', '8월 13일 23:59까지', '지난 3회 평균 +41명 — 가장 많이 씁니다', true],
      ['48시간', '8월 14일 23:59까지', '지난 3회 평균 +58명 · 참여 취소도 늘어납니다', false],
      ['72시간', '8월 15일 23:59까지', '최대치입니다. 참여자 불만이 생길 수 있습니다', false]]
      .map(([t, until, note, on]) => `<label class="radio${on ? ' on' : ''}" data-group="ext">
          <input type="radio" name="ext"${on ? ' checked' : ''}>
          <span class="grow"><b>${t}</b> <span class="t-sub">${until}</span>
            <div class="t-sub mt1">${note}</div></span></label>`).join('')}
      </div>`)}

      ${card('늘리면 이렇게 됩니다', `${table(
      [{ t: '항목', w: '26%' }, '지금', '늘린 뒤'],
      [
        ['마감 시각', '8월 12일 23:59', '<b>8월 13일 23:59</b>'],
        ['가격 단계', '250명 24,900원', '그대로 유지'],
        ['참여자 알림', '—', '<b>247명에게 자동 발송</b>'],
        ['남은 연장 횟수', '1회', '<b>0회</b> (공구당 최대 2회)'],
        ['예상 참여', '+10명', '<b>+41명</b> (지난 3회 평균)'],
        ['성사 가능성', '낮음', '<b>보통</b>'],
      ],
    )}
      <div class="box mt4"><b>연장은 두 번까지만 됩니다</b>
        <p class="t-sub mt1">이번이 마지막 연장입니다. 늘린 뒤에도 목표를 못 채우면 그때 불발 처리되고 참여자에게 전액 환불됩니다.
        연장을 반복하면 참여자가 불신해 오히려 취소가 늘어납니다.</p></div>`, { cls: 'mt6' })}

      ${card('함께 하시면 좋은 것', `${[
      ['독려 알림 보내기', '연장 알림과 함께 “53명이면 성사” 문구를 넣으면 효과가 큽니다', 'HM-05'],
      ['최소 성사 인원 낮추기', '공급처에서 247개도 받아 준다면 이 편이 확실합니다', 'HM-03'],
      ['단계 하나 추가하기', '“300명이면 21,900원”처럼 눈앞의 목표를 만들어 줍니다', 'HS0202'],
    ].map(([t, s, go]) => `<a class="list-row" href="${link(go)}">
        <div class="grow"><b>${t}</b><div class="t-sub">${s}</div></div><span class="muted">›</span></a>`).join('')}`,
      { cls: 'mt6' })}

      <div class="btns mt6">
        ${btn('24시간 늘리기', { cls: 'btn-primary btn-lg', attr: ' data-toast="마감을 8월 13일 23:59로 늘리고 참여자 247명에게 알렸어요" data-toast-kind="ok"' })}
        ${btn('그만두기', { cls: 'btn-ghost btn-lg', href: 'HM-03' })}
      </div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '마감 연장 · 24시간 선택 (남은 연장 1회)' } };
  }

  /* 불발 처리 확인 */
  if (v === 'miss') {
    const body = hostPage('HM-03', `
      ${pageHd('불발 처리', `${esc(d.nm)}`)}

      ${banner('danger', '⚠️', `<b>되돌릴 수 없습니다.</b>
        <p class="t-sub">불발 처리하시면 참여자 247명에게 즉시 환불이 걸리고, 공구가 닫힙니다.</p>`)}

      ${card('무슨 일이 일어나나요', timeline([
      ['불발 확정', '누르는 즉시 · 공구가 닫힙니다'],
      ['환불 요청 전송', '1분 안에 · 247건, 총 6,150,300원'],
      ['참여자 알림', '즉시 · 앱 알림과 알림톡으로'],
      ['카드사 처리', '2~5영업일'],
      ['환불 완료', '8월 8일쯤 · 참여자에게 다시 알림'],
    ], 0), { cls: 'mt6' })}

      ${card('숫자로 확인', `${table(
      ['항목', '값'],
      [
        ['환불 대상', '<b>247명</b>'],
        ['환불 총액', `<b>${won(6150300)}</b>`],
        ['진행자 수수료', '<b>0원</b> — 불발이라 청구되지 않습니다'],
        ['진행자 손실', '<b>0원</b> — 발주 전이라 원가 부담이 없습니다'],
        ['성사율 영향', '34회 중 31회 → <b>35회 중 31회 (91% → 89%)</b>'],
        ['신뢰 등급', 'A 유지 (80% 이상)'],
      ],
    )}
      <div class="box mt4"><b>등급에 미치는 영향</b>
        <p class="t-sub mt1">불발 자체는 벌점이 아닙니다. 다만 성사율이 계산에 들어가고, 80% 아래로 떨어지면 등급이 내려가
        수수료가 1% 오릅니다. 지금은 89%라 여유가 있습니다.</p></div>`, { cls: 'mt6' })}

      ${card('참여자에게 갈 내용', `<div class="box">
        <b>「제주 한라봉 5kg 산지직송」 공구가 아쉽게 불발됐습니다</b>
        <p class="t-sub mt2" style="white-space:pre-line">목표 300명 중 247명이 모여 성사되지 못했습니다.
결제하신 금액은 전액 자동으로 환불됩니다. 따로 신청하실 것은 없고, 카드 기준 2~5영업일 걸립니다.

모아 주셔서 고맙습니다. 다음 회차는 목표를 낮춰 다시 열 예정이니, 알림을 걸어 두시면 먼저 알려드리겠습니다.</p>
      </div>
      <div class="btns mt3">${btn('문구 고치기', { cls: 'btn-ghost btn-sm', href: 'HM-05' })}</div>`, { cls: 'mt6' })}

      <div class="btns mt6">
        ${btn('불발 처리하기', { cls: 'btn-danger btn-lg', attr: ' data-modal="mdMiss"' })}
        ${btn('먼저 마감을 늘려 볼래요', { cls: 'btn-primary btn-lg', href: 'HM0302' })}
        ${btn('그만두기', { cls: 'btn-ghost btn-lg', href: 'HM-03' })}
      </div>
      <template id="mdMiss"><div class="modal">
        <div class="hd">정말 불발 처리할까요?</div>
        <div class="bd"><p>참여자 <b>247명</b>에게 <b>${won(6150300)}</b>이 즉시 환불됩니다. 되돌릴 수 없습니다.</p>
          <div class="field mt4"><label class="label">확인을 위해 <b>불발</b> 이라고 입력해 주세요</label>
            <input class="input" placeholder="불발"></div></div>
        <div class="ft">
          <button class="btn btn-ghost" type="button" data-dismiss>그만두기</button>
          <button class="btn btn-danger" type="button" data-dismiss data-toast="불발 처리했어요. 247명에게 환불이 걸렸습니다">불발 처리</button>
        </div></div></template>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '불발 처리 확인 · 247명 · 6,150,300원 환불 예정' } };
  }

  /* 성사 확정 모달 */
  if (v === 'ok') {
    const d2 = dealById('d2');
    const body = hostPage('HM-03', `
      ${pageHd('성사 확정', `${esc(d2.nm)}`)}

      ${banner('ok', '🎉', `<b>목표를 넘겼습니다. 성사를 확정하세요.</b>
        <p class="t-sub">최종 151명 · 150명 단계에 도달해 확정가는 98,000원입니다.</p>`)}

      ${card('확정 내용', `${table(
      [{ t: '항목', w: '30%' }, '값'],
      [
        ['최종 참여', '<b>151명</b> (취소 3명 제외)'],
        ['확정 가격', `<b>${won(98000)}</b> — 150명 단계 도달`],
        ['총 수량', '164개'],
        ['총 결제액', won(14798000)],
        ['차액 환급 대상', '<b>88명</b> · 총 1,232,000원 (앞 단계로 참여한 분들)'],
        ['플랫폼 수수료', `${won(739900)} (5%)`],
        ['예상 정산액', `<b>${won(12826100)}</b>`],
      ],
    )}`, { cls: 'mt6' })}

      ${card('확정하면 순서대로 일어납니다', timeline([
      ['성사 확정', '누르는 즉시'],
      ['차액 환급 요청', '88명 · 1,232,000원 자동 처리'],
      ['참여자 알림', '151명에게 성사 안내 발송'],
      ['발주 화면 열림', '발주서를 뽑아 공급처에 보내세요'],
      ['송장 등록', '발송 후 송장번호를 올리면 배송 알림이 자동으로 갑니다'],
    ], 0), { cls: 'mt6' })}

      ${card('확정 전에 확인하세요', `<label class="check"><input type="checkbox" checked><span>공급처에서 <b>164개</b>를 받을 수 있는지 확인했습니다</span></label>
      <label class="check"><input type="checkbox" checked><span>약속한 발송일(성사 후 5일 이내)을 지킬 수 있습니다</span></label>
      <label class="check"><input type="checkbox"><span>차액 환급 1,232,000원이 정산액에서 빠지는 것을 확인했습니다</span></label>
      <p class="t-sub mt3">확정 뒤에는 참여자에게 알림이 나가고 발주 단계로 넘어갑니다. 취소하시려면 개별 환불로만 됩니다.</p>`,
      { cls: 'mt6' })}

      <div class="btns mt6">
        ${btn('성사 확정하기', { cls: 'btn-primary btn-lg', attr: ' data-modal="mdOk"' })}
        ${btn('참여 현황 다시 보기', { cls: 'btn-ghost btn-lg', href: 'HM-02' })}
      </div>
      <template id="mdOk"><div class="modal">
        <div class="hd">성사를 확정할까요?</div>
        <div class="bd">
          <p>최종 <b>151명</b> · 확정가 <b>${won(98000)}</b>으로 확정됩니다.</p>
          <div class="mt3">${kv([
      ['참여자 알림', '151명에게 즉시 발송'],
      ['차액 환급', '88명 · 1,232,000원 자동 처리'],
      ['다음 단계', '발주·배송 관리로 넘어갑니다'],
    ])}</div>
          <div class="box mt3"><p class="t-sub">확정 뒤에는 되돌릴 수 없습니다. 공급처 수량을 다시 한 번 확인해 주세요.</p></div>
        </div>
        <div class="ft">
          <button class="btn btn-ghost" type="button" data-dismiss>다시 볼게요</button>
          <button class="btn btn-primary" type="button" data-dismiss data-toast="성사를 확정했어요. 151명에게 알림을 보냈습니다" data-toast-kind="ok">확정하기</button>
        </div></div></template>`);
    return {
      body,
      o: {
        wrapCls: 'wrap wrap-full',
        state: '성사 확정 대기 · 최종 151명 · 확정가 98,000원',
        after: modalNow('성사를 확정할까요?',
          `<p>최종 <b>151명</b> · 확정가 <b>${won(98000)}</b>으로 확정됩니다.</p>
          <div class="mt3">${kv([
            ['참여자 알림', '151명에게 즉시 발송'],
            ['차액 환급', '88명 · 1,232,000원 자동 처리'],
            ['다음 단계', '발주·배송 관리로 넘어갑니다'],
          ])}</div>
          <div class="box mt3"><p class="t-sub">확정 뒤에는 되돌릴 수 없습니다. 공급처 수량을 다시 한 번 확인해 주세요.</p></div>`,
          `<button class="btn btn-ghost" type="button" data-close=".dim">다시 볼게요</button>
           <a class="btn btn-primary" href="${link('HM-04')}">확정하고 발주하기</a>`),
      },
    };
  }

  const main = `
    ${card('마감 대상', `<div class="row wrap-row" style="gap:16px">
      ${phFix(['상품 사진', 1000, 1000], 104, { seed: d.id })}
      <div class="grow"><b>${esc(d.nm)}</b>
        <div class="t-sub mt1">마감 2026년 8월 12일 23:59 · ${leftText(d.left)}</div>
        <div class="mt2" style="max-width:400px">${gauge(pct)}</div>
        <div class="t-sub mt1">${num(d.joined)} / ${num(d.goal)}명 · <b class="danger">${num(d.goal - d.joined)}명 부족</b></div></div>
      ${countdown(d.left, { sec: d.left * 60 })}
    </div>`)}

    ${banner('warn', '🤔', `<b>지금 마감하면 불발됩니다.</b>
      <p class="t-sub">목표 300명 중 247명입니다. 최소 성사 인원(250명)에도 3명이 모자랍니다.</p>`, { cls: 'mt6' })}

    ${card('어떻게 할까요', `<div class="radio-list">
      <label class="radio" data-group="act"><input type="radio" name="act" checked>
        <span class="grow"><b>마감을 늘린다</b>
          <div class="t-sub mt1">참여자에게 자동으로 알립니다. 지난 3회 통계로는 24시간 늘렸을 때 평균 41명이 더 모였습니다.</div>
          <div class="row mt2" style="gap:8px">
            <select class="select" style="width:150px"><option>12시간</option><option selected>24시간</option><option>48시간</option><option>72시간</option></select>
            <span class="t-sub">→ 8월 13일 23:59까지</span></div></span></label>
      <label class="radio" data-group="act"><input type="radio" name="act">
        <span class="grow"><b>그대로 마감하고 불발 처리한다</b>
          <div class="t-sub mt1">참여자 ${num(d.joined)}명에게 전액 자동 환불됩니다. 총 ${won(6150300)}입니다.</div></span></label>
      <label class="radio" data-group="act"><input type="radio" name="act">
        <span class="grow"><b>목표를 낮춰 성사시킨다</b>
          <div class="t-sub mt1">최소 성사 인원을 247명으로 낮춥니다. 참여자에게 가격 단계가 그대로임을 알려야 합니다.</div>
          <div class="box box-warn mt2"><p class="t-sub">공급처에서 247개도 받아 주는지 먼저 확인하세요. 확인 없이 성사시키면 배송 지연으로 등급이 내려갑니다.</p></div></span></label>
    </div>`, { cls: 'mt6' })}

    ${card('성사되면 이렇게 됩니다', `${[
    ['확정 가격', '24,900원 (250명 단계에 3명 부족 → 현재 단계 유지)'],
    ['총 수량', '271개 (5kg 189 · 10kg 58 · 취소분 제외)'],
    ['참여자 알림', `${num(d.joined)}명에게 성사 안내 자동 발송`],
    ['다음 할 일', '공급처 발주 → 송장 등록 → 배송 알림'],
  ].map(([k, v]) => `<div class="row-b" style="padding:10px 0"><b class="nowrap" style="min-width:100px">${k}</b>
      <span class="grow" style="text-align:right">${v}</span></div>`).join('')}`, { cls: 'mt6' })}`;

  const aside = card('처리', `<div class="box box-mut center">
      <div class="t-sub">마감까지</div><div class="t-sec" data-count="11220">03:07:00</div></div>
    <div class="hr"></div>
    ${kv([['참여', `${num(d.joined)}명`], ['목표', `${num(d.goal)}명`], ['부족', `${num(d.goal - d.joined)}명`], ['총 결제액', won(6150300)]])}
    <div class="btns mt4">
      ${btn('고른 대로 처리하기', { cls: 'btn-primary btn-lg btn-block', attr: ' data-modal="mdClose"' })}
    </div>
    ${btn('먼저 독려 보내기', { cls: 'btn-accent btn-block', href: 'HM-05' })}
    ${btn('참여 현황 보기', { cls: 'btn-ghost btn-block', href: 'HM-02' })}
    <div class="hr"></div>
    <div class="row" style="gap:8px">${btn('마감 연장', { cls: 'btn-ghost btn-sm grow', href: 'HM0302' })}
      ${btn('불발 처리', { cls: 'btn-ghost btn-sm grow', href: 'HM0303' })}</div>
    ${btn('성사 확정 화면', { cls: 'btn-ghost btn-block btn-sm mt2', href: 'HM0304' })}
    <template id="mdClose"><div class="modal">
      <div class="hd">마감을 24시간 늘릴까요?</div>
      <div class="bd">
        <p>마감이 <b>8월 13일 23:59</b>로 바뀝니다.</p>
        <div class="mt3">${kv([
    ['알림 발송', `참여자 ${num(d.joined)}명에게 자동 발송`],
    ['가격 단계', '그대로 유지됩니다'],
    ['늘릴 수 있는 횟수', '남은 1회 (공구당 최대 2회)'],
  ])}</div>
        <div class="box box-warn mt3"><p class="t-sub">늘린 뒤에도 못 모으면 그때 불발 처리되고 전액 환불됩니다.</p></div>
      </div>
      <div class="ft">
        <button class="btn btn-ghost" type="button" data-dismiss data-toast="그대로 두었어요">취소</button>
        <button class="btn btn-primary" type="button" data-dismiss data-toast="마감을 8월 13일 23:59로 늘리고 참여자 247명에게 알렸어요" data-toast-kind="ok">늘리기</button>
      </div></div></template>`);

  const body = hostPage('HM-03', `${pageHd('마감·성사 처리')}<div class="mt6">${detail2(main, aside)}</div>`);
  return { body, o: { wrapCls: 'wrap wrap-full', state: '마감 3시간 전 · 53명 부족' } };
}

/* ── HM-04 발주·배송 관리 ─────────────────────────────
   v: 'order' 발주서 생성 · 'track' 송장 일괄 등록 · 'delay' 배송 지연 공지 · 'return' 반품·교환 접수 */
function hm04(ctx, v) {
  const d = dealById('d2');

  /* 발주서 생성 */
  if (v === 'order') {
    const body = hostPage('HM-04', `
      ${pageHd('발주서 생성', `${esc(d.nm)} · 최종 151명 · 164개`)}

      ${card('옵션별 집계', `${table(
      ['옵션', '수량', '단가(공급가)', '금액', '비고'],
      [
        ['기본 3종 세트', '151개', won(60000), won(9060000), ''],
        ['추가 냄비 1개', '13개', won(60000), won(780000), '옵션 추가 선택'],
        ['<b>합계</b>', '<b>164개</b>', '', `<b>${won(9840000)}</b>`, ''],
      ],
    )}
      <div class="box mt4"><b>여유분을 함께 주문하시겠어요?</b>
        <p class="t-sub mt1">파손·오배송이 생기면 다시 받기 어려운 상품입니다. 보통 총 수량의 2~3%를 여유로 잡습니다.</p>
        <div class="row mt3" style="gap:8px;align-items:center">
          <span class="t-sub">여유분</span>
          <div class="stepper"><button type="button" data-step="-">−</button><span class="num">4</span><button type="button">＋</button></div>
          <span class="t-sub">개 → 총 168개 · ${won(10080000)}</span>
        </div></div>`)}

      ${card('보낼 곳', `<div class="form" style="max-width:none">
        <div class="field-row">
          <div class="field"><label class="label">공급처</label>
            <select class="select"><option selected>독일생활 수입원 (기존 거래)</option><option>새 공급처 입력</option></select></div>
          <div class="field"><label class="label">담당자 메일</label><input class="input" value="order@deutschliving.co.kr"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="label">희망 입고일</label><input class="input" type="date" value="2026-08-07"></div>
          <div class="field"><label class="label">결제 조건</label>
            <select class="select"><option selected>선입금 100%</option><option>선입금 50% + 잔금</option><option>후불 (정산 후)</option></select></div>
        </div>
        <div class="field"><label class="label">전달 사항</label>
          <textarea class="textarea" rows="3">개별 완충 포장 부탁드립니다. 8월 8일 발송 예정이라 7일 오전까지 입고되면 좋겠습니다.</textarea></div>
      </div>`, { cls: 'mt6' })}

      ${card('발주서 미리보기', `<div class="box">
        <div class="row-b"><b>발주서 (PO-20260805-0042)</b><span class="t-sub">2026년 8월 5일</span></div>
        <div class="hr"></div>
        ${kv([
      ['발주처', '모아공구 · 진행자 살림고수 미란'],
      ['공급처', '독일생활 수입원'],
      ['품목', '독일산 스테인리스 냄비 3종 세트'],
      ['수량', '168개 (여유분 4개 포함)'],
      ['공급가', `${won(60000)} / 개`],
      ['합계', `<b>${won(10080000)}</b>`],
      ['희망 입고', '2026년 8월 7일'],
    ])}
      </div>`, { cls: 'mt6' })}

      <div class="btns mt6">
        ${btn('발주서 내려받기 (엑셀)', { cls: 'btn-primary btn-lg', attr: ' data-toast="발주서를 내려받았어요" data-toast-kind="ok"' })}
        ${btn('공급처에 메일 보내기', { cls: 'btn-ghost btn-lg', attr: ' data-toast="독일생활 수입원에 발주서를 보냈어요" data-toast-kind="ok"' })}
        ${btn('발주·배송으로', { cls: 'btn-ghost btn-lg', href: 'HM-04' })}
      </div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '발주서 생성 · 168개 · 10,080,000원' } };
  }

  /* 송장 일괄 등록 */
  if (v === 'track') {
    const body = hostPage('HM-04', `
      ${pageHd('송장 일괄 등록', `${esc(d.nm)} · 발송 준비 119건`)}

      ${card('엑셀로 한 번에', `<div class="upload" style="padding:26px">
        <div class="ico">📄</div><b>엑셀 파일을 끌어다 놓으세요</b>
        <p class="t-sub">참여번호와 송장번호 두 열만 있으면 됩니다 · XLSX·CSV · 최대 5,000행</p>
        <div class="btns mt3 center">
          ${btn('양식 내려받기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="양식을 내려받았어요" data-toast-kind="ok"' })}
          ${btn('파일 고르기', { cls: 'btn-primary btn-sm', attr: ' data-toast="파일 선택 창이 열려요"' })}
        </div>
      </div>
      <div class="file-row is-ok mt4">
        <span>📄</span><div class="grow"><b>송장_20260808.xlsx</b>
          <div class="t-sub">119행 · 방금 올림</div></div>
        ${badge('검사 통과', 'b-ok')}
        <button class="btn btn-ghost btn-sm" type="button" data-toast="파일을 뺐어요">빼기</button>
      </div>`)}

      ${card('검사 결과', `<div class="g4">
        <div class="stat"><div class="n">119건</div><div class="l">읽은 행</div></div>
        <div class="stat"><div class="n">117건</div><div class="l">등록 가능</div></div>
        <div class="stat"><div class="n">2건</div><div class="l">확인 필요</div></div>
        <div class="stat"><div class="n">0건</div><div class="l">중복</div></div>
      </div>
      <div class="hr"></div>
      ${table(
      ['행', '참여번호', '송장번호', '상태'],
      [
        ['3', 'MG20260728-3902', '640123456789', badge('등록 가능', 'b-ok')],
        ['4', 'MG20260728-3903', '640123456790', badge('등록 가능', 'b-ok')],
        ['58', 'MG20260728-3957', '<span class="danger">6401234</span>', badge('자릿수 부족', 'b-danger')],
        ['91', 'MG20260728-3990', '640123456841', badge('이미 등록됨', 'b-warn')],
      ],
    )}
      <p class="t-sub mt3">확인이 필요한 2건은 빼고 117건만 등록합니다. 고쳐서 다시 올리셔도 됩니다.</p>`,
      { cls: 'mt6' })}

      ${card('등록하면', `${[
      ['참여자 알림', '117명에게 “발송됐어요” 알림이 자동으로 갑니다'],
      ['배송 조회', '참여자가 내 공구함에서 바로 조회할 수 있습니다'],
      ['상태 변경', '발송 준비 → 발송 완료로 바뀝니다'],
      ['배송 완료 확인', '택배사에서 완료가 확인되면 정산 대기로 넘어갑니다'],
    ].map(([k, s]) => `<div class="row-b" style="padding:10px 0"><b class="nowrap" style="min-width:110px">${k}</b>
        <span class="grow" style="text-align:right">${s}</span></div>`).join('')}`, { cls: 'mt6' })}

      <div class="btns mt6">
        ${btn('117건 등록하기', { cls: 'btn-primary btn-lg', attr: ' data-toast="송장 117건을 등록하고 참여자에게 알렸어요" data-toast-kind="ok"' })}
        ${btn('한 건씩 넣기', { cls: 'btn-ghost btn-lg', href: 'HM-04' })}
      </div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '송장 일괄 등록 · 119행 중 117건 등록 가능' } };
  }

  /* 배송 지연 공지 */
  if (v === 'delay') {
    const body = hostPage('HM-04', `
      ${pageHd('배송 지연 공지', `${esc(d.nm)} · 151명`)}

      ${banner('warn', '📢', `<b>늦어질 것 같으면 미리 알리는 편이 낫습니다.</b>
        <p class="t-sub">미리 알린 지연은 등급에 거의 영향이 없습니다. 알리지 않고 넘긴 지연은 벌점이 됩니다.</p>`)}

      ${card('무엇 때문에 늦나요', `<div class="radio-list">
        ${[['공급처 입고 지연', '가장 흔합니다. 새 입고 예정일을 함께 알려 주세요.', true],
      ['택배사 물량 폭주', '명절·연휴에 자주 생깁니다.', false],
      ['기상·재해', '폭설·태풍 등으로 지역 배송이 멈춘 경우.', false],
      ['포장·검수 지연', '수량이 많아 포장이 늦어지는 경우.', false],
      ['직접 쓰기', '', false]]
      .map(([t, s, on]) => `<label class="radio${on ? ' on' : ''}" data-group="why">
          <input type="radio" name="why"${on ? ' checked' : ''}>
          <span class="grow"><b>${t}</b>${s ? `<div class="t-sub">${s}</div>` : ''}</span></label>`).join('')}
      </div>`)}

      ${card('언제로 바뀌나요', `<div class="field-row">
        <div class="field"><label class="label">원래 발송일</label><input class="input is-readonly" value="2026-08-08" disabled></div>
        <div class="field"><label class="label">새 발송일</label><input class="input" type="date" value="2026-08-11"></div>
      </div>
      <p class="hint">3일 늦어집니다. 참여자에게는 “8월 11일 발송, 12~13일 도착 예정”으로 안내됩니다.</p>`,
      { cls: 'mt6' })}

      ${card('보낼 내용', `<div class="field"><label class="label">제목</label>
        <input class="input" value="[모아공구] 배송이 3일 늦어지게 되어 죄송합니다"></div>
      <div class="field"><label class="label">내용</label>
        <textarea class="textarea" rows="8">{{닉네임}}님, 진행자입니다.

「독일산 스테인리스 냄비 3종 세트」 발송이 예정보다 늦어지게 되어 먼저 알려드립니다.

공급처 입고가 3일 늦어져, 8월 8일이었던 발송일이 <b>8월 11일</b>로 바뀝니다. 도착은 12~13일쯤으로 보시면 됩니다.

기다리게 해 드려 죄송합니다. 기다리기 어려우시면 <b>마감 후에도 전액 환불</b>해 드리니 아래 버튼으로 알려 주세요.</textarea></div>
      <label class="check"><input type="checkbox" checked><span>환불 신청 버튼을 함께 보내기</span></label>
      <label class="check"><input type="checkbox" checked><span>사과 쿠폰 2,000원을 함께 드리기 (151명 · 302,000원)</span></label>`,
      { cls: 'mt6' })}

      <div class="btns mt6">
        ${btn('151명에게 보내기', { cls: 'btn-primary btn-lg', attr: ' data-toast="배송 지연 공지를 151명에게 보냈어요" data-toast-kind="ok"' })}
        ${btn('예약해서 보내기', { cls: 'btn-ghost btn-lg', href: 'HM0502' })}
        ${btn('그만두기', { cls: 'btn-ghost btn-lg', href: 'HM-04' })}
      </div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '배송 지연 공지 · 8월 8일 → 8월 11일' } };
  }

  /* 반품·교환 접수 */
  if (v === 'return') {
    const cases = [
      ['최윤*', '박스가 눌려 왔어요 (사진 2장)', '2026-08-05 10:20', '접수', '파손', won(98000)],
      ['정태*', '구성이 하나 빠졌습니다', '2026-08-05 09:14', '처리 중', '누락', won(98000)],
      ['한서*', '색이 사진과 달라요', '2026-08-04 21:33', '처리 중', '단순 변심', won(98000)],
      ['오지*', '받는 사람 주소가 틀렸어요', '2026-08-04 18:02', '완료', '오배송', won(98000)],
    ];
    const body = hostPage('HM-04', `
      ${pageHd('반품·교환 접수', `${esc(d.nm)} · 4건`)}

      ${statRow([
      ['4건', '전체 접수', { ic: '📮' }],
      ['1건', '오늘 접수', { ic: '🆕' }],
      ['2건', '처리 중', { ic: '⏳' }],
      ['2.6%', '접수율', { ic: '📊', d: '평균 3.1%' }],
    ])}

      ${card('접수 목록', `<div class="row-b wrap-row mb4" style="gap:12px">
        ${chips(['전체 4', '접수 1', '처리 중 2', '완료 1'], 0)}
        ${btn('처리 기준 보기', { cls: 'btn-ghost btn-sm', href: 'CS-04' })}
      </div>
      ${cases.map(([nm, why, at, st, kind, amt]) => `<div class="card mb3"><div class="card-bd">
        <div class="row-b wrap-row">
          <div class="row" style="gap:10px">${phAva(34, nm)}
            <div><b>${nm}</b><div class="t-sub">${at} · ${kind} · ${amt}</div></div></div>
          ${badge(st, st === '접수' ? 'b-warn' : st === '처리 중' ? 'b-pri' : 'b-ok')}
        </div>
        <p class="mt3">${why}</p>
        ${kind === '파손' ? `<div class="row mt3" style="gap:8px">
          ${phFix(['접수 사진', 1000, 1000], 84, { seed: nm + '1' })}${phFix(['접수 사진', 1000, 1000], 84, { seed: nm + '2' })}</div>` : ''}
        <div class="box mt3"><b>이 경우 기준</b>
          <p class="t-sub mt1">${{
      파손: '배송 중 파손 — 진행자가 왕복 배송비를 부담하고 재발송하거나 전액 환불합니다.',
      누락: '구성 누락 — 빠진 것만 추가 발송하거나 그만큼 부분 환불합니다.',
      '단순 변심': '단순 변심 — 받은 날부터 7일 이내, 왕복 배송비 5,000원은 참여자 부담입니다.',
      오배송: '오배송 — 진행자 부담으로 회수 후 재발송합니다.',
    }[kind]}</p></div>
        <div class="row mt3 wrap-row" style="gap:8px">
          <button class="btn btn-primary btn-sm" type="button" data-toast="재발송을 접수했어요" data-toast-kind="ok">재발송</button>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="전액 환불을 걸었어요" data-toast-kind="ok">전액 환불</button>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="부분 환불 창을 열었어요">부분 환불</button>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="회수 접수를 넣었어요" data-toast-kind="ok">택배 회수</button>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="참여자에게 답을 보냈어요" data-toast-kind="ok">답변 보내기</button>
        </div>
      </div></div>`).join('')}`)}

      ${banner('mut', '⚖️', `<b>합의가 안 되면 고객센터가 중재합니다.</b>
        <p class="t-sub">참여자가 분쟁 조정을 신청하면 운영팀이 양쪽 자료를 보고 판단합니다.</p>`,
      { cls: 'mt6', right: btn('분쟁 절차 보기', { cls: 'btn-ghost btn-sm', href: 'CS0402' }) })}`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '반품·교환 4건 · 처리 중 2건' } };
  }

  const ships = [
    ['김하*', '기본 3종 세트', 1, '서울 성동구 아차산로 111…', '640123456789', '발송 완료'],
    ['이준*', '기본 3종 세트', 1, '경기 성남시 분당구 판교로…', '640123456790', '발송 완료'],
    ['박민*', '기본 3종 세트', 2, '부산 해운대구 센텀중앙로…', '', '발송 준비'],
    ['최윤*', '기본 3종 세트', 1, '제주 제주시 첨단로…', '', '발송 준비'],
    ['정태*', '기본 3종 세트', 1, '대전 유성구 대학로…', '', '발송 준비'],
  ];

  const main = `
    ${card('성사 집계', `<div class="row-b wrap-row">
      <div><b>${esc(d.nm)}</b><div class="t-sub mt1">2026년 8월 4일 성사 · 최종 ${num(d.joined)}명</div></div>
      ${badge('성사', 'b-ok')}
    </div>
    <div class="hr"></div>
    <div class="g4">
      ${[['총 수량', '164개'], ['기본 3종 세트', '151개'], ['추가 구성', '13개'], ['발주 금액', won(9840000)]]
      .map(([k, v]) => `<div class="box center"><div class="t-sub">${k}</div><b class="mt1" style="display:block;font-size:18px">${v}</b></div>`).join('')}
    </div>
    <div class="btns mt4">
      ${btn('발주서 만들기', { cls: 'btn-primary', href: 'HM0402' })}
      ${btn('공급처에 메일 보내기', { cls: 'btn-ghost', attr: ' data-toast="공급처에 발주서를 보냈어요" data-toast-kind="ok"' })}
    </div>`)}

    ${card('배송 진행', `<div class="row-b mb3"><b>151건 중 32건 발송 완료</b><span class="t-sub">21%</span></div>
      ${progress(21)}
      <div class="row wrap-row mt4" style="gap:10px">
        ${[['준비', 119, 'b-warn'], ['발송', 32, 'b-ok'], ['완료', 0, 'b-mut']]
      .map(([t, n, k]) => `<div class="box center grow"><div class="t-sub">${t}</div><b class="mt1" style="display:block;font-size:20px">${n}건</b>
          <div class="mt2">${badge(t, k)}</div></div>`).join('')}
      </div>`, { cls: 'mt6' })}

    ${card('송장번호 등록', `<div class="upload" style="padding:22px">
      <div class="ico">📄</div><b>엑셀 파일을 끌어다 놓으세요</b>
      <p class="t-sub">참여 번호와 송장번호 두 열만 있으면 됩니다 · XLSX·CSV</p>
      <div class="btns mt3">
        ${btn('양식 내려받기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="양식을 내려받았어요" data-toast-kind="ok"' })}
        ${btn('일괄 등록하기', { cls: 'btn-primary btn-sm', href: 'HM0403' })}
      </div>
    </div>`, { cls: 'mt6' })}

    ${card('배송지 목록', `<div class="row-b wrap-row mb4" style="gap:12px">
      <div class="row wrap-row" style="gap:8px">
        <input class="input" style="width:180px" placeholder="닉네임·송장번호 검색">
        ${chips(['전체', '발송 준비', '발송 완료'], 0)}
      </div>
      ${btn('배송지 엑셀 내려받기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="배송지 목록을 내려받았어요" data-toast-kind="ok"' })}
    </div>
    ${table(
      [{ t: '', w: '36px' }, '참여자', '옵션', '수량', { t: '배송지', w: '26%' }, '송장번호', '상태'],
      ships.map(([nm, opt, qty, addr, tr, st]) => [
        `<label class="check" style="padding:0"><input type="checkbox"${st === '발송 준비' ? ' checked' : ''}><span></span></label>`,
        `<div class="row" style="gap:8px">${phAva(28, nm)}<b>${nm}</b></div>`,
        opt, `${qty}개`, addr,
        tr || `<input class="input" placeholder="송장번호" style="width:150px">`,
        stBadge(st),
      ]),
    )}
    <div class="row-b mt4">
      <label class="check" style="padding:0"><input type="checkbox" checked><span>발송 준비 전체 선택 (119건)</span></label>
      <div class="btns">
        ${btn('발송 완료로 바꾸기', { cls: 'btn-primary btn-sm', attr: ' data-toast="119건을 발송 완료로 바꿨어요" data-toast-kind="ok"' })}
        ${btn('배송 출발 알림 보내기', { cls: 'btn-accent btn-sm', href: 'HM-05' })}
      </div>
    </div>`, { cls: 'mt6' })}

    ${card('반품·교환 접수', `${[
    ['최윤*', '박스가 눌려 왔어요 (사진 첨부)', '2026-08-05', '접수'],
    ['정태*', '구성이 하나 빠졌습니다', '2026-08-05', '처리 중'],
  ].map(([nm, why, at, st]) => `<div class="row-b list-row" style="padding:12px 0">
      <div class="grow"><div class="row" style="gap:8px">${phAva(28, nm)}<b>${nm}</b><span class="t-sub">${at}</span></div>
        <p class="t-sub mt1">${why}</p></div>
      <div class="btns nowrap">${badge(st, st === '접수' ? 'b-warn' : 'b-pri')}
        ${btn('처리하기', { cls: 'btn-ghost btn-sm', href: 'HM0405' })}</div>
    </div>`).join('')}`, { cls: 'mt6', ft: btn('반품·교환 전체 보기', { cls: 'btn-ghost btn-block btn-sm', href: 'HM0405' }) })}`;

  const aside = card('배송 요약', `${kv([
    ['성사 인원', `${num(d.joined)}명`],
    ['총 수량', '164개'],
    ['발송 완료', '32건'],
    ['발송 준비', '119건'],
    ['반품 접수', '2건'],
  ])}
    <div class="mt3">${progress(21)}</div>
    <div class="hr"></div>
    <div class="btns">
      ${btn('배송 출발 알림', { cls: 'btn-primary btn-block', href: 'HM-05' })}
    </div>
    ${btn('배송 지연 공지', { cls: 'btn-ghost btn-block', href: 'HM0404' })}
    ${btn('정산 내역 보기', { cls: 'btn-ghost btn-block', href: 'SE-01' })}
    <div class="hr"></div>
    <div class="box"><b>배송 지연은 등급에 영향이 있어요</b>
      <p class="t-sub mt1">약속한 발송일을 넘기면 신뢰 등급이 내려갑니다. 늦어질 것 같으면 미리 공지해 주세요.</p></div>`);

  const body = hostPage('HM-04', `${pageHd('발주·배송 관리', esc(d.nm))}<div class="mt6">${detail2(main, aside)}</div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── HM-05 참여자 공지·알림 발송 ──────────────────────
   v: 'reserve' 예약 발송 · 'log' 발송 이력 */
function hm05(ctx, v) {
  /* 예약 발송 */
  if (v === 'reserve') {
    const body = hostPage('HM-05', `
      ${pageHd('예약 발송', '보낼 시각을 정해 두면 그때 자동으로 나갑니다')}

      ${card('언제 보낼까요', `<div class="field-row">
        <div class="field"><label class="label">날짜</label><input class="input" type="date" value="2026-08-11"></div>
        <div class="field"><label class="label">시각</label><input class="input" type="time" value="20:00"></div>
      </div>
      <div class="box"><b>이 공구는 저녁 8~10시에 가장 많이 들어옵니다</b>
        <p class="t-sub mt1">지난 7일 기록으로는 그 시간대 도달률이 96%, 참여 전환이 다른 시간의 2.1배였습니다.</p>
        <div class="row mt3 wrap-row" style="gap:8px">
          ${['오늘 20:00', '내일 20:00', '마감 3시간 전', '마감 30분 전'].map((t, i) =>
      `<button class="chip${i === 2 ? ' on' : ''}" type="button">${t}</button>`).join('')}
        </div></div>`)}

      ${card('반복해서 보내기', `<label class="check"><input type="checkbox"><span><b>마감까지 정해진 시각마다 보내기</b>
        <div class="t-sub">예: 마감 3일 전, 1일 전, 3시간 전에 자동으로</div></span></label>
      <div class="mt3">${[['마감 3일 전', '8월 9일 20:00', true],
      ['마감 1일 전', '8월 11일 20:00', true],
      ['마감 3시간 전', '8월 12일 20:59', true],
      ['마감 30분 전', '8월 12일 23:29', false]]
      .map(([t, when, on]) => `<div class="row-b list-row" style="padding:11px 0">
        <div class="grow"><b>${t}</b><div class="t-sub">${when}</div></div>
        <button class="toggle${on ? ' on' : ''}" type="button" data-toast="${t} 예약을 바꿨어요"></button>
      </div>`).join('')}</div>
      <p class="t-sub mt3">너무 자주 보내면 알림을 끄는 분이 늘어납니다. 마감 전 2~3회를 권합니다.</p>`, { cls: 'mt6' })}

      ${card('예약해 둔 발송', table(
      ['보낼 시각', '공구', '유형', '대상', '채널', ''],
      [
        ['2026-08-11 20:00', '제주 한라봉 5kg', '마감 임박 독려', '247명', '앱·알림톡',
          '<button class="btn btn-ghost btn-sm" type="button" data-toast="예약을 취소했어요">취소</button>'],
        ['2026-08-12 20:59', '제주 한라봉 5kg', '마지막 독려', '247명', '앱·알림톡·문자',
          '<button class="btn btn-ghost btn-sm" type="button" data-toast="예약을 취소했어요">취소</button>'],
      ],
    ), { cls: 'mt6' })}

      ${banner('mut', '⏰', `<b>예약한 시각 10분 전까지 고치거나 취소하실 수 있습니다.</b>
        <p class="t-sub">방해 금지 시간(21:00~08:00)에 걸리면 다음 날 아침으로 밀립니다.</p>`, { cls: 'mt6' })}

      <div class="btns mt6">
        ${btn('이대로 예약하기', { cls: 'btn-primary btn-lg', attr: ' data-toast="8월 11일 20:00에 보내도록 예약했어요" data-toast-kind="ok"' })}
        ${btn('지금 바로 보내기', { cls: 'btn-ghost btn-lg', href: 'HM-05' })}
      </div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '예약 발송 · 2건 예약됨' } };
  }

  /* 발송 이력 */
  if (v === 'log') {
    const logs = [
      ['2026-08-03 20:00', '제주 한라봉 5kg', '마감 임박 독려', '198명', '앱·알림톡', '96%', '+18명', '2,223원'],
      ['2026-07-30 11:00', '제주 한라봉 5kg', '오픈 안내', '1,284명', '앱', '88%', '+62명', '0원'],
      ['2026-07-28 11:00', '독일산 냄비 3종', '성사 안내', '151명', '앱·알림톡', '99%', '—', '1,359원'],
      ['2026-07-23 09:30', '독일산 냄비 3종', '배송 출발', '151명', '앱·알림톡·문자', '100%', '—', '4,379원'],
      ['2026-07-21 15:30', '닭가슴살 트릿', '배송 출발', '119명', '앱·알림톡', '100%', '—', '1,071원'],
      ['2026-07-14 21:05', '겨울 기모 맨투맨', '불발 안내', '41명', '앱·알림톡·문자', '100%', '—', '1,189원'],
    ];
    const body = hostPage('HM-05', `
      ${pageHd('발송 이력', '지난 90일 동안 보낸 공지 6건')}

      ${statRow([
      ['6건', '보낸 공지', { ic: '📣' }],
      ['1,944명', '받은 사람', { ic: '👥' }],
      ['97%', '평균 도달률', { ic: '📬' }],
      ['10,221원', '든 비용', { ic: '💳', d: '정산에서 차감' }],
    ])}

      ${card('', `<div class="row-b wrap-row mb4" style="gap:12px">
        <div class="row wrap-row" style="gap:8px">${chips(['전체', '독려', '성사·불발', '배송'], 0)}</div>
        <div class="row" style="gap:8px">
          <select class="select" style="width:170px"><option>최근 90일</option><option>최근 30일</option><option>전체</option></select>
          ${btn('엑셀로 내려받기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="발송 이력을 내려받았어요" data-toast-kind="ok"' })}
        </div>
      </div>
      ${table(
      ['보낸 날', '공구', '유형', '대상', '채널', '도달', '효과', '비용'],
      logs.map((r) => r.map((c, i) => (i === 6 && c !== '—' ? `<b>${c}</b>` : c))),
      { fix: true },
    )}
      <p class="t-sub mt3">‘효과’는 공지를 보낸 뒤 2시간 안에 늘어난 참여 인원입니다.</p>`)}

      ${card('무엇이 잘 먹혔나요', `${[
      ['마감 임박 독려', '+18명', '가장 효과가 큽니다. 부족 인원을 숫자로 적을 때 특히.'],
      ['오픈 안내', '+62명', '알림 신청자에게 나가는 것이라 초반 참여를 만듭니다.'],
      ['성사 안내', '—', '참여 유도가 목적이 아니라 신뢰를 쌓는 알림입니다.'],
    ].map(([t, n, s]) => `<div class="row-b list-row" style="padding:12px 0">
        <div class="grow"><b>${t}</b><div class="t-sub">${s}</div></div>
        <b class="nowrap">${n}</b></div>`).join('')}
      <div class="box mt4"><b>알림 피로에 주의하세요</b>
        <p class="t-sub mt1">한 공구에 4번 넘게 보내면 알림을 끄는 분이 눈에 띄게 늘어납니다.
        지금 이 공구는 2번 보냈습니다.</p></div>`, { cls: 'mt6' })}

      <div class="btns mt6">
        ${btn('새 공지 보내기', { cls: 'btn-primary btn-lg', href: 'HM-05' })}
        ${btn('예약 발송 보기', { cls: 'btn-ghost btn-lg', href: 'HM0502' })}
      </div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '발송 이력 · 지난 90일 6건' } };
  }

  const main = `
    ${card('보낼 공구와 대상', `<div class="field"><label class="label">공구</label>
      <select class="select">${MY_DEALS.map((m) => `<option>${esc(dealById(m.id).nm)}</option>`).join('')}</select></div>
      <div class="field"><label class="label">받는 사람</label>
        <div class="radio-list">
          ${[['참여자 전체', '247명'], ['취소하지 않은 참여자', '239명'], ['아직 안 받으신 분', '119명'], ['특정 옵션만', '5kg 189명']]
      .map(([t, n], i) => `<label class="radio" data-group="seg"><input type="radio" name="seg"${i === 0 ? ' checked' : ''}>
          <span class="grow"><b>${t}</b> <span class="t-sub">${n}</span></span></label>`).join('')}
        </div></div>`)}

    ${card('무엇을 보낼까요', `<div class="field"><label class="label">공지 유형</label>
      <select class="select"><option selected>마감 임박 독려</option><option>성사 안내</option><option>배송 출발</option><option>배송 지연 사과</option><option>감사 인사</option><option>직접 쓰기</option></select></div>
      <div class="field"><label class="label">제목</label><input class="input" value="{{닉네임}}님, {{남은시간}} 뒤 마감돼요!"></div>
      <div class="field"><label class="label">내용</label>
        <textarea class="textarea" rows="7">{{닉네임}}님, 안녕하세요. {{공구명}} 진행자입니다.

지금 {{현재인원}}명이 모였고, {{부족인원}}명만 더 모이면 성사됩니다. 마감까지 {{남은시간}} 남았어요.

친구에게 링크를 보내 주시면 큰 힘이 됩니다. 성사되면 {{확정가}}에 받으실 수 있어요.

{{초대링크}}</textarea></div>
      <div class="box box-mut mt3"><b>쓸 수 있는 치환 변수</b>
        <div class="row wrap-row mt2" style="gap:6px">
          ${['{{닉네임}}', '{{공구명}}', '{{현재인원}}', '{{부족인원}}', '{{남은시간}}', '{{확정가}}', '{{송장번호}}', '{{초대링크}}']
      .map((v) => `<button class="btn btn-ghost btn-sm" type="button" data-toast="${v} 를 넣었어요">${v}</button>`).join('')}
        </div></div>`, { cls: 'mt6' })}

    ${card('어떻게 보낼까요', `<div class="row wrap-row" style="gap:12px">
      ${[['앱 알림', true, '무료'], ['카카오 알림톡', true, '건당 9원'], ['문자(SMS)', false, '건당 20원']]
      .map(([t, on, c]) => `<label class="check" style="padding:10px 14px;border:1px solid var(--border);border-radius:var(--r-input)">
        <input type="checkbox"${on ? ' checked' : ''}><span><b>${t}</b> <span class="t-sub">${c}</span></span></label>`).join('')}
    </div>
    <div class="hr"></div>
    <div class="radio-list">
      <label class="radio on" data-group="when"><input type="radio" name="when" checked><span class="grow"><b>지금 바로 보내기</b></span></label>
      <label class="radio" data-group="when"><input type="radio" name="when"><span class="grow"><b>예약해서 보내기</b>
        <div class="t-sub mt1">저녁 8~10시에 도달률이 가장 높습니다</div></span>
        ${btn('예약 설정', { cls: 'btn-ghost btn-sm', href: 'HM0502' })}</label>
    </div>`, { cls: 'mt6' })}

    ${card('보낸 이력', table(
    ['보낸 날', '공구', '유형', '대상', '채널', '도달'],
    [
      ['2026-08-03 20:00', '제주 한라봉 5kg', '마감 임박 독려', '198명', '앱·알림톡', '96%'],
      ['2026-07-28 11:00', '독일산 냄비 3종', '성사 안내', '151명', '앱·알림톡', '99%'],
      ['2026-07-21 15:30', '닭가슴살 트릿', '배송 출발', '119명', '앱·알림톡·문자', '100%'],
    ],
  ), { cls: 'mt6', ft: btn('발송 이력 전체 보기', { cls: 'btn-ghost btn-block btn-sm', href: 'HM0503' }) })}`;

  const aside = card('미리보기', `<div class="box box-mut">
      <div class="t-sub">받는 사람 · 김하늘</div>
      <b class="mt2" style="display:block">김하늘님, 3시간 7분 뒤 마감돼요!</b>
      <p class="t-sub mt2" style="white-space:pre-line">김하늘님, 안녕하세요. 제주 한라봉 5kg 산지직송 진행자입니다.

지금 247명이 모였고, 53명만 더 모이면 성사됩니다. 마감까지 3시간 7분 남았어요.

친구에게 링크를 보내 주시면 큰 힘이 됩니다. 성사되면 24,900원에 받으실 수 있어요.

https://moagonggu.kr/d/d1</p></div>
    <div class="hr"></div>
    ${kv([
    ['받는 사람', '247명'],
    ['채널', '앱 알림 · 알림톡'],
    ['예상 도달', '약 237명 (96%)'],
    ['드는 비용', '2,223원 (알림톡 247건)'],
  ])}
    <div class="box box-mut mt3"><p class="t-sub">비용은 정산할 때 매출에서 빠집니다.</p></div>
    <div class="btns mt4">${btn('보내기', { cls: 'btn-primary btn-lg btn-block', attr: ' data-toast="247명에게 보냈어요" data-toast-kind="ok"' })}</div>
    ${btn('다른 사람으로 미리보기', { cls: 'btn-ghost btn-block', attr: ' data-toast="이준서님 기준으로 바꿨어요"' })}`);

  const body = hostPage('HM-05', `${pageHd('참여자 공지·알림 발송')}<div class="mt6">${detail2(main, aside)}</div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

export const PAGES = {
  'HM-01': hm01,
  HM0102: (c) => hm01(c, 'risk'),
  HM0103: (c) => hm01(c, 'empty'),
  'HM-02': hm02,
  HM0202: (c) => hm02(c, 'people'),
  HM0203: (c) => hm02(c, 'chart'),
  HM0204: (c) => hm02(c, 'export'),
  'HM-03': hm03,
  HM0302: (c) => hm03(c, 'ext'),
  HM0303: (c) => hm03(c, 'miss'),
  HM0304: (c) => hm03(c, 'ok'),
  'HM-04': hm04,
  HM0402: (c) => hm04(c, 'order'),
  HM0403: (c) => hm04(c, 'track'),
  HM0404: (c) => hm04(c, 'delay'),
  HM0405: (c) => hm04(c, 'return'),
  'HM-05': hm05,
  HM0502: (c) => hm05(c, 'reserve'),
  HM0503: (c) => hm05(c, 'log'),
};
