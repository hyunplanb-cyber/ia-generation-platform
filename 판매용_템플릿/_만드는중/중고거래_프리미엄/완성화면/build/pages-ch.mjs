/* CH 채팅 — 21화면 (채팅 목록 5 · 채팅방 6 · 거래 약속 잡기 5 · 신고·차단 5)

   ⚠ 이 장터의 «거래»는 화면이 아니라 대화로 이뤄진다. 값 흥정과 약속 잡기가 여기서 끝난다.
     그래서 채팅방 안에 «세 가지 특별한 말풍선»(가격 제안 · 약속 · 시스템 안내)을 둔다.

   ⚠ 뼈대는 레이아웃 «B 대시보드형»이다 — 디럭스(A 목록중심형)와 «일부러» 다르다.
       · 화면 위쪽은 지표 카드 «4장»(kpis). 히어로도 하단 고정 바도 쓰지 않는다.
       · 목록은 표(dashTable). 상태는 글자가 아니라 stBadge().
       · 상세는 좌 본문 + 우 액션 패널(detailSplit). «상태를 바꾸는 버튼은 전부 오른쪽».
     스펙팩 prompt 에 「맨 위 고정 띠 오른쪽에 버튼」·「하단 [약속 보내기]」라고 적힌 것은
     손님이 AI 에게 줄 글이고, 이 완성화면의 뼈대를 정하는 것은 레이아웃 프리셋이다.
   ⚠ 링크는 짧은 이름(CH-02)이나 파일 이름(CH0205)으로 적고 link() 가 옮긴다. */
import {
  pageHd, kpis, dashTable, tableBar, detailSplit, actPanel,
  sec, card, box, banner, badge, btn, chips, tabs, empty, kv, table, 조사붙이기,
  link, esc, won, num, stBadge, manner, wayBadges, phAva, phItem, phMap,
  verifies, respText, modal, modalStatic, hsteps, timeline, userCard,
} from './ui.mjs';
import {
  SITE, CHATS, TALK, UNREAD, UNREAD_MSGS, itemBy, userBy, REPORT_REASONS, SAFE_SPOTS, REPORTS,
  CH_MUTED, CH_LEFT, CH_MSG_COUNT, CH_QUICK, CH_PLUS, CH_OFFERS, CH_APPT, CH_APPT_PAST,
  CH_DATES, CH_TIMES, CH_OK_TIMES, CH_SPOT_CHIPS, CH_RECENT_SPOTS, CH_CLASH,
  CH_SCAM_TRIGGERS, CH_BLOCK_EFFECTS, CH_REPORT_FLOW, CH_REPORT, CH_REASON_EXTRA,
  CH_EVIDENCE, CH_OTHER_ASKERS,
} from './data.mjs';

/* ══════════ 한곳에서 세는 값 ══════════
   ⛔ 손으로 적지 않는다. CHATS 를 고치면 지표 카드·탭 배지가 «같이» 따라간다. */
const 구매방 = CHATS.filter((c) => c.side === '구매');
const 판매방 = CHATS.filter((c) => c.side === '판매');
const 안읽은방 = CHATS.filter((c) => c.unread > 0);
const 예약방 = CHATS.filter((c) => c.st === '예약중');
const 끝난방 = CHATS.filter((c) => c.st === '거래완료');

/* 이 대화를 열면 어느 화면인가 —
   내가 «파는 쪽»이면 판매자 화면, 상대가 나간 방이면 나감 화면. */
const 방목적지 = (c) => (CH_LEFT.includes(c.id) ? 'CH0206' : (c.side === '판매' ? 'CH0205' : 'CH-02'));

/* 이 갈래가 기준으로 삼는 대화 한 편 — 하늘이네(나)가 초록나무에게서 청소기를 산다 */
const 기준방 = CHATS[0];
const 상대 = userBy(기준방.with);
const 물건 = itemBy(기준방.item);
/* 판매자로 볼 때 기준이 되는 대화 — 내가 파는 쪽(기계식 키보드) */
const 판매방기준 = CHATS[2];
const 사는사람 = userBy(판매방기준.with);
const 파는물건 = itemBy(판매방기준.item);

/* 찾는 말을 형광펜으로 짚는다 — 없으면 그대로 둔다 */
function 짚기(글, 찾는말) {
  const s = esc(글);
  if (!찾는말) return s;
  const q = esc(찾는말);
  return s.split(q).join(`<b class="hl">${q}</b>`);
}

/* ══════════ 채팅 목록이 쓰는 것 ══════════ */

/** 지표 카드 4장 — 목록 갈래(CH01) 다섯 화면이 같은 넉 장을 쓴다 */
const 목록지표 = (o = {}) => kpis([
  ['대화 전체', num(o.all != null ? o.all : CHATS.length), { unit: '개', d: `구매 ${구매방.length} · 판매 ${판매방.length}` }],
  ['안 읽은 대화', num(o.unread != null ? o.unread : UNREAD), { unit: '개', tone: 'k-warn', d: `안 읽은 말 ${o.msgs != null ? o.msgs : UNREAD_MSGS}건`, href: 'CH0102' }],
  ['약속 잡힌 거래', num(o.appt != null ? o.appt : 예약방.length), { unit: '건', tone: 'k-acc', d: '예약중으로 바뀐 대화', href: 'PA-05' }],
  ['마무리된 거래', num(o.done != null ? o.done : 끝난방.length), { unit: '건', tone: 'k-mut', d: '후기를 남길 수 있어요', href: 'MY-04' }],
]);

/* 표 머리글 — 열이 여덟이라 좌우로 넘친다. 그래서 dashTable 에 «반드시» o.max 를 준다. */
const 채팅머리 = [
  { t: '상대', w: '210px' }, { t: '구분', w: '74px' }, { t: '매물', w: '226px' },
  { t: '마지막 말' }, { t: '시각', w: '84px' }, { t: '안 읽음', w: '80px' },
  { t: '거래 상태', w: '92px' }, { t: '', w: '58px' },
];

/** 대화 한 줄 — o.q 를 주면 찾는 말을 형광펜으로 짚는다 */
function 채팅행(c, o = {}) {
  const u = userBy(c.with);
  const it = itemBy(c.item);
  const 끈방 = CH_MUTED.includes(c.id);
  const 나간방 = CH_LEFT.includes(c.id);
  const 갈곳 = link(방목적지(c));
  return {
    data: { side: c.side, st: c.st, unread: c.unread },
    cells: [
      `<a class="row-c" style="gap:8px;min-width:0" href="${갈곳}">${phAva(28, u.id)}
        <span class="strong">${짚기(u.nick, o.q)}</span>${manner(u.manner)}
        ${끈방 ? '<span title="알림을 끈 방" aria-label="알림 꺼짐">🔕</span>' : ''}</a>`,
      badge(c.side, c.side === '구매' ? 'b-pri' : 'b-acc'),
      `<span class="row-c" style="gap:8px;min-width:0">${phItem(26, it.id)}
        <a href="${link('SE-04')}" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${짚기(it.t, o.q)}</a></span>`,
      `<span class="t-sub" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${나간방 ? '상대가 채팅방을 나갔어요' : 짚기(c.last, o.q)}</span>`,
      `<span class="t-sub nowrap">${c.at}</span>`,
      c.unread ? `<span class="unread-n">${c.unread}</span>` : '<span class="t-sub">—</span>',
      stBadge(c.st),
      `<a class="btn btn-quiet btn-xs" href="${link('CH0104')}" title="방 메뉴 (알림 끄기·나가기·차단)" aria-label="방 메뉴">⋯</a>`,
    ],
  };
}

/** 목록 표 한 벌 — 위 한 줄(건수·버튼) + 표. 비면 안내를 낸다. */
const 채팅표 = (list, o = {}) => `
${tableBar(`<b>${num(list.length)}개</b> <span class="t-sub">${o.left || '· 최근에 말이 오간 차례입니다'}</span>`,
  o.right != null ? o.right : `${btn('안 읽음만 보기', { href: 'CH0102', cls: 'btn-ghost btn-sm' })}${btn('매물 보러 가기', { href: 'SE-02', cls: 'btn-ghost btn-sm' })}`)}
${list.length
    ? dashTable(채팅머리, list.map((c) => 채팅행(c, o)), { max: '430px', listKey: o.listKey })
    : empty('💬', o.emptyT || '대화가 없어요', o.emptyM || '', o.emptyB || '')}`;

/* 목록 화면 아래에 늘 붙는 안내 — 나간 방·알림 끈 방이 무엇인지 여기서 설명한다 */
const 목록안내 = () => sec('채팅에서 조심할 것', box(`<b class="t-card">이런 말이 나오면 멈추세요</b>
  <ul class="dots t-sub mt2">
    <li>돈을 <b>먼저</b> 보내 달라는 말 — 안전결제를 쓰자고 하세요</li>
    <li>바깥 링크로 결제하라는 말 — 안전결제는 채팅 안 단추로만 시작합니다</li>
    <li>다른 앱으로 옮겨 이야기하자는 말 — 기록이 남지 않아 신고가 어려워집니다</li>
  </ul>
  <p class="t-sub mt3">🔕 가 붙은 방은 <b>알림을 끈 방</b>이라 새 말이 와도 소리가 나지 않아요.
  상대가 나간 방은 마지막 말 자리에 그렇게 적힙니다.
  아직 대화가 하나도 없는 분께는 <a class="link" href="${link('CH0105')}">이런 안내</a>가 보여요.</p>
  <div class="btns mt3">${btn('안전거래 안내', { href: 'HO-03', cls: 'btn-ghost btn-sm' })}${btn('고객센터', { href: 'CS-01', cls: 'btn-ghost btn-sm' })}</div>`));

/* ══════════ 채팅방이 쓰는 것 ══════════ */

/** 말풍선 — 글·사진·가격 제안·약속·시스템 안내 다섯 가지 */
function 말풍선(m, o = {}) {
  if (m.kind === 'sys') {
    return `<div class="bub sys">🛡 ${esc(m.t)}
      <a class="link" href="${link('HO-03')}">안전거래 안내</a>
      · <a class="link quiet" href="${link('CH0204')}">왜 이 안내가 떴나요</a></div>`;
  }
  if (m.kind === 'offer') {
    const 굳음 = m.st === '수락' || m.st === '거절';
    return `<div class="bub offer${m.me ? ' me' : ''}">
      <span class="amt">${won(m.price)}에 어때요?</span>
      ${m.why ? `<p class="t-sub" style="margin:0 0 8px">${esc(m.why)}</p>` : ''}
      ${굳음
      ? `<div class="row-c" style="gap:8px">${m.st === '수락' ? badge('수락됨', 'b-ok') : badge('거절됨', 'b-mut')}
          <span class="t-sub">${m.st === '수락' ? '이 값으로 굳었어요' : '다시 제안할 수 있어요'}</span></div>`
      : `<div class="btns">
          <button class="btn btn-pri btn-sm" type="button" data-toast="제안을 받았어요 · 매물을 예약중으로 바꿀까요?">수락</button>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="제안을 거절했어요 · 다시 제안할 수 있어요">거절</button>
        </div>`}
      <span class="when">${m.at}</span></div>`;
  }
  if (m.kind === 'appt') {
    return 약속카드(m);
  }
  if (m.photo) {
    return `<div class="bub${m.me ? ' me' : ''}">
      <span class="row-c" style="gap:6px">${[1, 2].map((n) => phItem(92, (o.seed || 'i1') + 'c' + n)).join('')}</span>
      <span class="when">${m.at}${m.read ? ' · 읽음' : ''}</span></div>`;
  }
  return `<div class="bub${m.me ? ' me' : ''}">${짚기(m.t, o.q)}
    <span class="when">${m.at}${m.read ? ' · 읽음' : ''}</span></div>`;
}

/** 약속 카드 — 날짜·시간·장소가 적힌 특별 말풍선 */
function 약속카드(o = {}) {
  const a = o.past ? CH_APPT_PAST : CH_APPT;
  return `<div class="bub appt"${o.past ? ' style="opacity:.55"' : ''}>
    <div class="row-b wrap-row" style="gap:8px">
      <b>거래 약속</b>
      ${o.past ? badge('지난 약속', 'b-mut') : (o.wait ? badge('상대 확인 대기', 'b-warn') : badge('확정', 'b-ok'))}
    </div>
    <div class="t-sub mt1">${a.date} ${a.time}</div>
    <div class="mt1"><b>${esc(a.place)}</b></div>
    ${o.past ? '' : `<div class="t-sub mt1">나에게서 ${CH_APPT.myKm}km · ${esc(상대.nick)}님에게서 ${CH_APPT.youKm}km</div>`}
    ${o.past || o.wait ? '' : `<div class="btns mt2">
      <button class="btn btn-ghost btn-sm" type="button" data-toast="내 달력에 넣었어요">일정 추가</button>
      <a class="btn btn-ghost btn-sm" href="${link('CH-03')}">약속 바꾸기</a>
      <a class="btn btn-quiet btn-sm" href="${link('CH0203')}">자세히</a>
    </div>`}
    ${o.wait ? `<div class="btns mt2">
      <button class="btn btn-ghost btn-sm" type="button" data-toast="약속을 취소했어요 · 상대에게도 알려집니다">약속 취소</button>
      <a class="btn btn-quiet btn-sm" href="${link('CH-03')}">고쳐서 다시 보내기</a></div>` : ''}
    <span class="when">${o.past ? '9월 3일 오후 8:02' : CH_APPT.sentAt}</span></div>`;
}

/** 대화판 — 날짜 구분선과 말풍선들 */
const 대화판 = (줄들, o = {}) => `<div class="talk-wrap"${o.style ? ` style="${o.style}"` : ''}>
  ${o.day1 ? `<div class="day-sep">${o.day1}</div>` : ''}
  ${줄들.join('')}
  ${o.after || ''}</div>`;

/** 입력칸 — 빠른 답장 칩 + ＋ · 보내기. o.off 면 잠긴다(상대가 나갔을 때). */
const 입력칸 = (o = {}) => `<div class="chat-send">
  ${o.off ? '' : `<div class="chips mb2">${CH_QUICK.map((t) =>
    `<button class="chip" type="button" data-toast="입력칸에 「${t}」를 넣었어요">${t}</button>`).join('')}</div>`}
  <div class="searchbar${o.off ? ' sm' : ''}">
    ${o.off
    ? `<span class="ic">🔒</span>
       <input type="text" placeholder="상대가 채팅방을 나가 말을 보낼 수 없어요" disabled aria-label="잠긴 입력칸">
       <button class="btn btn-ghost" type="button" disabled>보내기</button>`
    : `<button class="btn btn-quiet" type="button" data-modal="plus" aria-label="사진·약속·안전결제 붙이기">＋</button>
       <input type="text" placeholder="${o.ph || '메시지를 적어 주세요'}" aria-label="메시지 입력">
       <button class="btn btn-pri" type="button" data-toast="보냈어요">보내기</button>`}
  </div>
  ${o.note ? `<p class="t-sub mt2">${o.note}</p>` : ''}</div>`;

/** ＋ 메뉴 모달 — 입력칸 왼쪽 ＋ 로 연다 */
const 더하기모달 = () => modal('plus', '무엇을 붙일까요', `<div class="stack-sm">
  ${CH_PLUS.map((p) => (p.go
    ? `<a class="radio" href="${link(p.go)}"><b>${p.ic} ${p.k}</b><span class="d">${p.d}</span></a>`
    : `<button class="radio" type="button" data-dismiss data-toast="사진을 골라 주세요 (한 번에 5장까지)"><b>${p.ic} ${p.k}</b><span class="d">${p.d}</span></button>`)).join('')}
</div>`, btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' }));

/** 채팅방 맨 위 매물 요약 띠 — 썸네일·제목·가격·상태.
   ⚠ 값을 바꾸는 버튼은 여기 두지 않는다. 레이아웃 B 는 오른쪽 액션 패널에 모은다. */
const 매물띠 = (it, st, o = {}) => card('', `<div class="row-b wrap-row" style="gap:16px">
  <a class="row-c" style="gap:12px;min-width:0" href="${link('SE-04')}">
    ${phItem(56, it.id)}
    <span style="min-width:0">
      <b>${esc(it.t)}</b>
      <span class="row-c wrap-row mt1" style="gap:8px">
        <b style="font-size:19px">${won(o.price || it.price)}</b>${stBadge(st)}${wayBadges(it.ways)}</span>
    </span></a>
  <div class="btns">${btn('매물 보기', { href: 'SE-04', cls: 'btn-ghost btn-sm' })}</div>
</div>`, { cls: 'tape' });

/** 상대 패널 — 매너 온도·응답률·인증 */
const 상대패널 = (u, o = {}) => actPanel(o.title || '대화 상대', `
  <div class="row-c" style="gap:12px">${phAva(44, u.id)}<div>
    <a class="strong" href="${link('MY-01')}">${esc(u.nick)}</a>
    <div class="mt1">${manner(u.manner)}</div></div></div>
  ${kv([
    ['동네', esc(u.town)],
    ['응답률', `<b>${u.resp}%</b> <span class="t-sub">${respText(u.respMin)}</span>`],
    ['거래', `판 것 ${u.sold} · 산 것 ${u.bought}`],
    ['재거래 의사', `${u.again}%`],
  ])}
  ${u.tags.length ? `<div class="mt3">${verifies(u.tags)}</div>` : '<p class="t-sub mt3">아직 인증한 것이 없어요</p>'}`,
  btn('프로필 보기', { href: 'MY-01', cls: 'btn-ghost btn-block' }));

/** 방 관리 패널 — 스펙팩의 「오른쪽 위 점 세 개」. 레이아웃 B 라 오른쪽 패널로 모은다. */
const 방관리패널 = () => actPanel('방 관리', `
  <div class="toggle-row">
    <span>알림 받기</span>
    <button class="toggle on" type="button" data-toast="알림을 껐어요" aria-label="알림 켜기·끄기"></button>
  </div>
  <p class="t-sub mt2">끄면 새 말이 와도 소리가 나지 않아요. 목록에서는 🔕 로 보입니다.</p>`,
  `${btn('신고·차단하기', { href: 'CH-04', cls: 'btn-ghost btn-block' })}
   ${btn('채팅방 나가기', { cls: 'btn-danger btn-block', attr: ' data-modal="out"' })}
   ${btn('채팅 목록으로', { href: 'CH-01', cls: 'btn-quiet btn-block' })}`);

const 나가기모달 = () => modal('out', '채팅방을 나갈까요?',
  `<p class="t-sub">나가면 <b>이 대화 기록이 지워지고</b> 되돌릴 수 없어요. 상대는 계속 볼 수 있습니다.
  약속이 잡혀 있다면 약속도 함께 취소됩니다.</p>`,
  btn('그냥 둘게요', { cls: 'btn-ghost', attr: ' data-dismiss' })
  + btn('나가기', { href: 'CH-01', cls: 'btn-pri' }));

const 안전배너 = () => banner('warn', '🛡', `<b>돈을 먼저 보내지 마세요</b>
  <div class="t-sub mt1">안전결제를 쓰면 물건을 받고 「받았어요」를 누른 뒤에 돈이 넘어갑니다.</div>`,
  { right: btn('안전결제란', { href: 'PA-01', cls: 'btn-ghost btn-sm' }) });

/** 채팅방 지표 카드 4장 */
const 방지표 = (c, u, o = {}) => kpis([
  ['주고받은 말', num(CH_MSG_COUNT[c.id] || 12), { unit: '개', d: o.d1 || '오늘 9개' }],
  ['상대 매너 온도', u.manner.toFixed(1), { unit: '도', tone: 'k-acc', d: `재거래 의사 ${u.again}%`, href: 'MY-01' }],
  ['상대 응답률', num(u.resp), { unit: '%', tone: 'k-ok', d: respText(u.respMin) }],
  o.k4 || ['이 물건 문의', num(CH_OTHER_ASKERS), { unit: '명', tone: 'k-warn', d: '나 말고 2명이 더 묻고 있어요', href: 'SE-04' }],
]);

/* ══════════ 거래 약속 잡기가 쓰는 것 ══════════ */

const 약속지표 = (o = {}) => kpis([
  ['고른 날짜', o.date || '9월 8일', { d: o.dateD || '화요일 · 내일' }],
  ['고른 시간', o.time || '오후 7:00', { tone: 'k-acc', d: o.timeD || `${esc(상대.nick)}님이 좋다고 한 시간대` }],
  ['만나는 곳', o.place || '역삼역 2번 출구', { tone: 'k-ok', d: o.placeD || '안전거래존 · CCTV 있음' }],
  ['서로의 거리', `${CH_APPT.myKm} / ${CH_APPT.youKm}`, { unit: 'km', tone: 'k-mut', d: '나에게서 / 상대에게서' }],
]);

const 시간격자 = (on = '19:00') => `<div class="timegrid">
  ${CH_TIMES.map((t) => `<button class="tchip${t === on ? ' on' : ''}${CH_OK_TIMES.includes(t) ? ' ok' : ''}" type="button"
    data-toast="${t}${조사붙이기(t, '으로', '로')} 정했어요">${t}</button>`).join('')}</div>
  <p class="t-sub mt3"><span class="dot-ok"></span> 표시된 시간은 ${esc(상대.nick)}님이 「이때 좋아요」라고 알려온 시간이에요.
  30분 단위로 10:00부터 22:00까지 고를 수 있습니다.</p>`;

const 안전거래존카드 = (o = {}) => card('안전거래존을 권해요', `
  <p class="t-sub">CCTV가 있는 공공 장소예요. 처음 만나는 분과는 여기가 안심됩니다.
  가까운 곳 ${SAFE_SPOTS.length}곳을 거리순으로 뒀어요.</p>
  <div class="stack-sm mt3">
    ${[...SAFE_SPOTS].sort((a, b) => a.km - b.km).map((s, i) => `<div class="cond-row">
      <span class="grow"><b>${esc(s.nm)}</b><br><span class="t-sub">${esc(s.d)}</span></span>
      <span class="t-sub nowrap">${s.km}km</span>
      ${btn(i === 0 ? '고른 곳' : '여기로', { cls: i === 0 ? 'btn-pri btn-sm' : 'btn-ghost btn-sm', attr: ` data-toast="${esc(s.nm)}${조사붙이기(s.nm, '으로', '로')} 정했어요"` })}
    </div>`).join('')}
  </div>
  ${o.more === false ? '' : `<div class="btns mt3">${btn('안전거래존이 뭔가요', { href: 'CH0303', cls: 'btn-ghost btn-sm' })}</div>`}`);

const 겹침배너 = (o = {}) => banner('warn', '⚠', `<b>이 시간에 다른 약속이 있어요</b>
  <div class="t-sub mt1">${CH_CLASH.when} · 「${esc(CH_CLASH.item)}」 거래 (${esc(CH_CLASH.who)}님) · ${esc(CH_CLASH.where)}</div>`,
  { right: o.right != null ? o.right : btn('겹치는 약속 보기', { href: 'CH0304', cls: 'btn-ghost btn-sm' }) });

/** 약속 요약 액션 패널 — 「약속 보내기」는 여기에 있다(레이아웃 B: 하단 고정 바를 쓰지 않는다) */
const 약속액션 = (o = {}) => actPanel('보낼 약속', kv([
  ['날짜', o.date || `${CH_APPT.date}`],
  ['시간', o.time || CH_APPT.time],
  ['장소', o.place || esc(CH_APPT.place)],
  ['메모', esc(CH_APPT.memo)],
  ['알림', '약속 30분 전에 알려줌'],
]) + `<p class="t-sub mt3">${o.note || '날짜·시간·장소를 모두 골라서 보낼 수 있어요.'}</p>`,
  `${btn(o.mainLabel || '약속 보내기', { href: o.main || 'CH0305', cls: 'btn-pri btn-block' })}
   ${btn('채팅으로 돌아가기', { href: 'CH-02', cls: 'btn-ghost btn-block' })}
   ${btn('안전결제로 거래하기', { href: 'PA-01', cls: 'btn-ghost btn-block' })}`,
  { state: o.state || '예약중' });

/* ══════════ 신고·차단이 쓰는 것 ══════════ */

const 신고지표 = (o = {}) => kpis([
  ['평균 처리 시간', o.eta || '6', { unit: '시간', d: '접수부터 결과 알림까지' }],
  ['이 회원 누적 신고', num(o.dup != null ? o.dup : 5), { unit: '건', tone: 'k-warn', d: '다른 이웃도 신고했어요' }],
  ['붙인 증거', num(o.ev != null ? o.ev : CH_EVIDENCE.length), { unit: '장', tone: 'k-acc', d: `최대 ${CH_REPORT.maxPhoto}장까지` }],
  ['처리 단계', num(CH_REPORT_FLOW.length), { unit: '단계', tone: 'k-mut', d: CH_REPORT_FLOW.join(' → ') }],
]);

const 신고대상카드 = () => card('무엇을 신고하시나요', `<div class="row-c wrap-row" style="gap:16px">
  ${phAva(44, 상대.id)}
  <div class="grow"><b>${esc(상대.nick)}</b> ${manner(상대.manner)}
    <p class="t-sub mt1">${esc(물건.t)} · 이 대화</p></div>
  <div class="btns">
    ${badge('회원', 'b-mut')}${badge('매물', 'b-mut')}${badge('이 대화', 'b-pri')}
  </div>
</div>
<p class="t-sub mt3">신고 대상은 <b>회원 · 매물 · 이 대화</b> 셋입니다. 지금은 셋을 함께 신고합니다.</p>`, { cls: 'tape' });

/** 사유 라디오 여섯 — 이 화면에서 가장 크게 보여야 하는 것 */
const 사유라디오 = (onIdx = 0) => `<div class="stack-sm">
  ${REPORT_REASONS.map((r, i) => `<label class="radio${i === onIdx ? ' on' : ''}" data-group="why">
    <input type="radio" name="why"${i === onIdx ? ' checked' : ''}>
    <b>${r.ic} ${r.k}</b>
    <span class="d">고르면 아래에 ${esc(r.extra)} 칸이 열려요</span></label>`).join('')}</div>`;

/** 고른 사유에 딸린 «다른» 입력칸 */
function 사유별칸(사유) {
  const x = CH_REASON_EXTRA[사유];
  if (!x) return '';
  let 속;
  if (x.kind === 'text') {
    속 = `<input class="input" type="text" placeholder="예: 네이버 블로그 2024년 3월 글의 사진과 같아요">`;
  } else if (x.kind === 'radio') {
    속 = x.list.map((k, i) => `<label class="radio-in">
      <input type="radio" name="extra"${i === 0 ? ' checked' : ''}><span>${esc(k)}</span></label>`).join('');
  } else if (x.kind === 'pick') {
    속 = x.list.map((k, i) => `<label class="check"><input type="checkbox"${i === 0 ? ' checked' : ''}><span>${esc(k)}</span></label>`).join('');
  } else {
    속 = x.list.map((k, i) => `<label class="check"><input type="checkbox"${i === 0 ? ' checked' : ''}><span>${esc(k)}</span></label>`).join('');
  }
  return `<div class="sub-fld mt4">${card(`${esc(사유)} — ${esc(x.t)}`, 속, {
    aside: `<a class="link quiet" href="${link('CH0402')}">사유를 바꾸면?</a>`,
  })}</div>`;
}

const 증거카드 = (o = {}) => card('증거를 붙여 주세요 (있으면)', `
  <div class="photo-grid">
    <button class="photo-add" type="button" data-toast="캡처를 골라 주세요 (최대 ${CH_REPORT.maxPhoto}장)">
      <span style="font-size:22px">＋</span><span>캡처 추가</span></button>
    ${CH_EVIDENCE.slice(0, o.n != null ? o.n : 2).map((f, i) => `<div class="photo-cell">
      <button class="del" type="button" data-toast="${esc(f.nm)} 파일을 지웠어요" aria-label="첨부 지우기">✕</button>
      ${phItem(140, 'rep' + i)}
      <div class="tools"><span class="t-sub" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(f.nm)} · ${f.mb}MB</span></div>
    </div>`).join('')}
  </div>
  <p class="t-sub mt3">대화 캡처를 붙여 주시면 확인이 훨씬 빨라요. 한 장에 ${CH_REPORT.maxMB}MB까지입니다.</p>
  ${o.more === false ? '' : `<div class="btns mt3">${btn('증거 더 붙이기', { href: 'CH0403', cls: 'btn-ghost btn-sm' })}</div>`}`);

const 차단카드 = (o = {}) => card('이 사람을 차단할까요', `
  <label class="check box${o.on === false ? '' : ' on'}"><input type="checkbox"${o.on === false ? '' : ' checked'}>
    <span><b>차단할게요</b><br><span class="t-sub">신고와 함께 차단합니다</span></span></label>
  ${o.on === false ? `<p class="t-sub mt3">켜면 차단이 무엇을 막는지 여기에 펼쳐집니다.</p>` : `
  <div class="mt3">${box(`<b class="t-card">차단하면 이렇게 돼요</b>
    <ul class="dots t-sub mt2">${CH_BLOCK_EFFECTS.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`, { cls: 'soft' })}</div>`}
  ${o.more === false ? '' : `<div class="btns mt3">${btn('차단하면 어떻게 되나요', { href: 'CH0404', cls: 'btn-ghost btn-sm' })}</div>`}`);

const 절차안내 = () => box(`<b class="t-card">신고하면 이렇게 진행돼요</b>
  <div class="mt3">${hsteps(CH_REPORT_FLOW, 0)}</div>
  <p class="t-sub mt3">평균 <b>${CH_REPORT.eta}</b> 안에 처리하고, 결과는 알림으로 알려드려요.
  신고한 사실은 상대에게 알리지 않습니다.</p>`);

const 허위신고경고 = () => banner('dan', '⚖', `<b>사실이 아닌 신고를 반복하면 제한될 수 있어요</b>
  <div class="t-sub mt1">신고는 사람의 계정을 막을 수 있는 일이라 신중하게 다룹니다.</div>`);

const 중복신고배너 = () => banner('info', '🔁', `<b>이 회원은 이미 신고가 들어와 있어요</b>
  <div class="t-sub mt1">${REPORTS[0].id} · ${esc(REPORTS[0].why)} · 신고 ${REPORTS[0].dup}건 겹침 · 지금 ${esc(REPORTS[0].st)}
  입니다. 겹쳐 신고해도 괜찮아요 — 같은 건으로 묶어 봅니다.</div>`);

/** 신고 액션 패널 */
const 신고액션 = (o = {}) => actPanel('신고 내용', kv([
  ['대상', `${esc(상대.nick)} · 이 대화`],
  ['사유', esc(o.why || REPORT_REASONS[0].k)],
  ['증거', `${o.ev != null ? o.ev : 2}장`],
  ['함께 차단', o.block === false ? '안 함' : '함'],
]) + `<p class="t-sub mt3">${o.note || '사유를 골라 두어서 신고할 수 있어요. 사유를 안 고르면 아래 단추가 잠깁니다.'}</p>`,
  `${btn(o.mainLabel || '신고하기', { href: o.main || 'CH0405', cls: 'btn-pri btn-block' })}
   ${btn('채팅으로 돌아가기', { href: 'CH-02', cls: 'btn-ghost btn-block' })}
   ${btn('안전거래 안내 보기', { href: 'HO-03', cls: 'btn-ghost btn-block' })}`);

/* ══════════════════════════════════════════════════════════════
   화면 21장
   ══════════════════════════════════════════════════════════════ */
export const PAGES = {

  /* ─────────── CH01 채팅 목록 ─────────── */

  /** CH0101 채팅 목록 — 탭·검색·대화방 목록 */
  CH0101(ctx) {
    const 탭 = [
      { k: '전체', list: CHATS },
      { k: '구매', list: 구매방 },
      { k: '판매', list: 판매방 },
      { k: '안 읽음', list: 안읽은방 },
    ];
    const body = `
${pageHd('채팅', `대화 ${CHATS.length}개 · 안 읽은 말 ${UNREAD_MSGS}건 · 알림 끈 방 ${CH_MUTED.length}개`,
      `<div class="btns">${btn('매물 보러 가기', { href: 'SE-02', cls: 'btn-ghost' })}${btn('대화 열기', { href: 'CH-02', cls: 'btn-pri' })}</div>`)}

${목록지표()}

${sec('대화 찾기', `<div class="searchbar"><span class="ic">🔍</span>
  <input type="search" placeholder="상대 닉네임이나 물건 이름으로 찾기" aria-label="대화 검색">
  <a class="btn btn-pri" href="${link('CH0103')}">찾기</a></div>`,
      { desc: '적은 말이 든 대화만 남습니다. 없으면 「검색 결과가 없습니다」와 다시 찾는 길을 보여드려요.' })}

${sec('대화 목록', `<div>
  ${tabs(탭.map((t, i) => ({ label: t.k, cnt: t.list.length, pane: 'ch' + i })), 0)}
  ${탭.map((t, i) => `<div data-pane-body="ch${i}"${i === 0 ? '' : ' hidden'}>
    ${채팅표(t.list, {
        listKey: 'chat' + i,
        left: i === 3 ? '· 읽으면 이 탭에서 빠집니다' : '· 최근에 말이 오간 차례입니다',
        emptyT: '이 탭에는 대화가 없어요',
        emptyB: btn('전체 탭 보기', { cls: 'btn-ghost' }),
      })}
  </div>`).join('')}
</div>`, { desc: '탭을 옮겨도 화면 주소는 그대로예요 — 뒤로가기가 탭에 끼어들지 않습니다.' })}

${목록안내()}
`;
    return { body, o: {} };
  },

  /** CH0102 채팅 목록 > 탭 전환 — 「안 읽음」 탭이 켜진 상태 */
  CH0102(ctx) {
    const 탭 = [
      { k: '전체', list: CHATS },
      { k: '구매', list: 구매방 },
      { k: '판매', list: 판매방 },
      { k: '안 읽음', list: 안읽은방 },
    ];
    const body = `
${pageHd('채팅 · 안 읽음', `안 읽은 대화 ${UNREAD}개 · 안 읽은 말 ${UNREAD_MSGS}건`,
      `<div class="btns">${btn('전체 대화 보기', { href: 'CH-01', cls: 'btn-ghost' })}${btn('매물 보러 가기', { href: 'SE-02', cls: 'btn-pri' })}</div>`)}

${목록지표()}

${banner('info', '🔔', `<b>「안 읽음」 탭을 보고 있어요</b>
  <div class="t-sub mt1">대화를 열어 읽으면 <b>이 탭에서 바로 빠집니다</b>. 전체 탭에는 그대로 남아요.
  탭을 옮겨도 화면 주소는 바뀌지 않아 뒤로가기가 탭에 끼어들지 않습니다.</div>`,
      { right: btn('전체 탭', { href: 'CH-01', cls: 'btn-ghost btn-sm' }) })}

${sec('대화 목록', `<div>
  ${tabs(탭.map((t, i) => ({ label: t.k, cnt: t.list.length, pane: 'tb' + i })), 3)}
  ${탭.map((t, i) => `<div data-pane-body="tb${i}"${i === 3 ? '' : ' hidden'}>
    ${채팅표(t.list, {
        listKey: 'tab' + i,
        left: i === 3 ? '· 읽으면 이 탭에서 빠집니다' : '· 최근에 말이 오간 차례입니다',
        right: btn('전체 대화 보기', { href: 'CH-01', cls: 'btn-ghost btn-sm' }),
        emptyT: '안 읽은 대화가 없어요',
        emptyM: '모두 읽었습니다.',
        emptyB: btn('전체 대화 보기', { href: 'CH-01', cls: 'btn-ghost' }),
      })}
  </div>`).join('')}
</div>`)}

${목록안내()}
`;
    return { body, o: { state: '안 읽음 탭이 켜져 있음' } };
  },

  /** CH0103 채팅 목록 > 대화방 검색 — 찾은 글자를 짚어 준다 */
  CH0103(ctx) {
    const 찾는말 = '민트';
    const 결과 = CHATS.filter((c) => userBy(c.with).nick.includes(찾는말) || itemBy(c.item).t.includes(찾는말));
    const 헛탕 = '냉장고';
    const body = `
${pageHd('대화방 검색', `「${찾는말}」${조사붙이기(찾는말, '으로', '로')} 찾은 대화 ${결과.length}개`,
      `<div class="btns">${btn('검색 지우기', { href: 'CH-01', cls: 'btn-ghost' })}${btn('매물 보러 가기', { href: 'SE-02', cls: 'btn-pri' })}</div>`)}

${목록지표({ all: 결과.length, unread: 결과.filter((c) => c.unread > 0).length, msgs: 결과.reduce((a, c) => a + c.unread, 0), appt: 결과.filter((c) => c.st === '예약중').length, done: 결과.filter((c) => c.st === '거래완료').length })}

${sec('대화 찾기', `<div class="searchbar"><span class="ic">🔍</span>
  <input type="search" value="${찾는말}" aria-label="대화 검색">
  <button class="btn btn-quiet" type="button" data-toast="검색어를 지웠어요">✕</button>
  <button class="btn btn-pri" type="button" data-toast="「${찾는말}」${조사붙이기(찾는말, '이', '가')} 든 대화만 남겼어요">찾기</button></div>
<div class="chips mt3">
  <button class="chip" type="button" data-go="${link('CH-01')}">전체 대화</button>
  <button class="chip on" type="button">민트</button>
  <button class="chip" type="button" data-toast="「청소기」로 찾았어요">청소기</button>
  <button class="chip" type="button" data-toast="「역삼」으로 찾았어요">역삼</button>
</div>`, { desc: '상대 닉네임과 매물 이름을 함께 봅니다. 찾은 글자는 형광펜으로 짚어 드려요.' })}

${sec('찾은 대화', 채팅표(결과, {
      q: 찾는말,
      left: `· 「<b class="hl">${찾는말}</b>」${조사붙이기(찾는말, '이', '가')} 든 곳을 짚었습니다`,
      right: btn('전체 대화 보기', { href: 'CH-01', cls: 'btn-ghost btn-sm' }),
    }))}

${sec('찾은 것이 없을 때는 이렇게 보여요', card('', `
  <div class="searchbar sm mb4"><span class="ic">🔍</span>
    <input type="search" value="${헛탕}" aria-label="대화 검색 (결과 없음)">
    <button class="btn btn-quiet btn-sm" type="button" data-toast="검색어를 지웠어요">✕</button></div>
  ${empty('🔍', `「${헛탕}」${조사붙이기(헛탕, '이', '가')} 든 대화가 없어요`,
      '닉네임 한 글자나 물건 이름 일부로 다시 찾아보세요. 나간 방과 지운 방은 찾을 수 없습니다.',
      `${btn('검색 지우기', { href: 'CH-01', cls: 'btn-ghost' })}${btn('매물에서 찾기', { href: 'SE-02', cls: 'btn-pri' })}`)}`))}
`;
    return { body, o: { state: `검색어 「${찾는말}」` } };
  },

  /** CH0104 채팅 목록 > 대화방 길게 눌러 메뉴 */
  CH0104(ctx) {
    const c = 기준방;
    const u = userBy(c.with);
    const 본문 = `
${modalStatic(`${esc(u.nick)}님과의 대화`, `
  <p class="t-sub">목록에서 대화방을 <b>길게 누르면</b> 이 메뉴가 열립니다.</p>
  <div class="stack-sm mt4">
    <div class="toggle-row">
      <span><b>🔕 알림 끄기</b><br><span class="t-sub">새 말이 와도 소리가 나지 않아요</span></span>
      <button class="toggle" type="button" data-toast="이 방의 알림을 껐어요" aria-label="알림 끄기"></button>
    </div>
    <div class="toggle-row">
      <span><b>📌 위에 고정</b><br><span class="t-sub">목록 맨 위에 붙여 둡니다</span></span>
      <button class="toggle" type="button" data-toast="목록 맨 위에 고정했어요" aria-label="위에 고정"></button>
    </div>
  </div>`,
      `${btn('닫기', { cls: 'btn-ghost', attr: ' data-toast="메뉴를 닫았어요"' })}${btn('채팅 목록으로', { href: 'CH-01', cls: 'btn-quiet' })}`,
      { cls: 'mb8' })}

${banner('dan', '⚠', `<b>채팅방을 나가면 대화 기록이 지워져요</b>
  <div class="t-sub mt1">되돌릴 수 없습니다. 값 흥정과 약속이 적힌 말도 함께 사라져요.
  상대는 계속 볼 수 있고, 다시 대화를 걸어올 수도 있습니다.</div>`)}

<div class="mt-block">${card('알림 끄기 · 나가기 · 차단하기는 무엇이 다른가요', table(
      [{ t: '', w: '120px' }, { t: '새 말 알림' }, { t: '대화 기록' }, { t: '상대가 거는 채팅' }, { t: '되돌리기' }],
      [
        ['<b>알림 끄기</b>', '안 옴', '그대로', '올 수 있음', '언제든'],
        ['<b>나가기</b>', '안 옴', '<b>지워짐</b>', '올 수 있음', '안 됨'],
        ['<b>차단하기</b>', '안 옴', '읽기만 됨', '<b>못 옴</b>', '마이페이지에서'],
      ], { scroll: false }))}</div>
`;

    const 액션 = `
${actPanel('이 대화', `<div class="row-c" style="gap:12px">${phAva(40, u.id)}<div>
    <b>${esc(u.nick)}</b> ${manner(u.manner)}
    <div class="t-sub mt1">${esc(itemBy(c.item).t)}</div></div></div>`,
      btn('대화 열기', { href: 'CH-02', cls: 'btn-pri btn-block' }), { state: c.st })}

${actPanel('여기서 할 수 있는 것', `<p class="t-sub">누르면 켜짐·꺼짐이 눈에 보이게 바뀌고 그대로 남습니다.</p>`,
      `${btn('🔕 알림 끄기', { cls: 'btn-ghost btn-block', attr: ' data-toast="이 방의 알림을 껐어요"' })}
   ${btn('⚑ 신고·차단하기', { href: 'CH-04', cls: 'btn-ghost btn-block' })}
   ${btn('채팅방 나가기', { cls: 'btn-danger btn-block', attr: ' data-modal="out"' })}
   ${btn('채팅 목록으로', { href: 'CH-01', cls: 'btn-quiet btn-block' })}`)}
`;

    const body = `
${pageHd('대화방 메뉴', '목록에서 대화방을 길게 눌렀을 때',
      `<div class="btns">${btn('채팅 목록으로', { href: 'CH-01', cls: 'btn-ghost' })}</div>`)}
${목록지표()}
${detailSplit(본문, 액션)}`;
    return { body, o: { after: 나가기모달(), state: '대화방을 길게 누름' } };
  },

  /** CH0105 채팅 목록 > 대화 없음 */
  CH0105(ctx) {
    const body = `
${pageHd('채팅', '아직 주고받은 대화가 없어요',
      `<div class="btns">${btn('매물 보러 가기', { href: 'SE-02', cls: 'btn-ghost' })}${btn('판매글 쓰기', { href: 'SL-01', cls: 'btn-pri' })}</div>`)}

${목록지표({ all: 0, unread: 0, msgs: 0, appt: 0, done: 0 })}

${sec('대화 목록', card('', empty('💬', '아직 대화가 없어요',
      '마음에 드는 물건에서 <b>채팅하기</b>를 누르면 여기에 대화가 생겨요.<br>물건을 내놓으면 이웃이 먼저 말을 걸어오기도 합니다.',
      `${btn('매물 보러 가기', { href: 'SE-02', cls: 'btn-pri' })}${btn('판매글 쓰기', { href: 'SL-01', cls: 'btn-ghost' })}`)))}

${sec('처음이라면 이 순서로', card('', `<div class="mt2">${hsteps(['매물 찾기', '채팅 걸기', '값·약속 정하기', '거래하기'], 0)}</div>
  <ul class="dots t-sub mt4">
    <li><b>매물 목록</b>에서 내 동네 물건을 봅니다 — 가까운 동네까지 넓혀 볼 수 있어요</li>
    <li>마음에 들면 <b>채팅하기</b>로 값과 약속을 정합니다</li>
    <li>처음 만나는 분과는 <b>안전거래존</b>에서, 택배 거래는 <b>안전결제</b>로 하세요</li>
  </ul>
  <div class="btns mt4">${btn('안전거래 안내', { href: 'HO-03', cls: 'btn-ghost btn-sm' })}${btn('고객센터', { href: 'CS-01', cls: 'btn-ghost btn-sm' })}</div>`))}
`;
    return { body, o: { state: '대화가 하나도 없음' } };
  },

  /* ─────────── CH02 채팅방 ─────────── */

  /** CH0201 채팅방 — 이 팩에서 가장 두꺼운 화면 */
  CH0201(ctx) {
    const 말들 = [
      ...TALK.filter((m) => m.kind !== 'offer' && m.kind !== 'sys').map((m) => 말풍선(m, { seed: 물건.id })),
      말풍선({ kind: 'offer', me: false, price: CH_OFFERS[0].price, at: CH_OFFERS[0].at, st: '' }),
      말풍선({ kind: 'sys', t: '값을 먼저 보내 달라는 말은 사기일 수 있어요. 안전결제를 쓰면 물건을 받은 뒤에 돈이 넘어갑니다.' }),
      약속카드({}),
    ];

    const 본문 = `
${매물띠(물건, 기준방.st)}

<div class="mt-block">${대화판(말들, { day1: '9월 7일 (오늘)' })}</div>

${입력칸({ note: '＋ 를 누르면 사진·거래 약속 잡기·가격 제안·안전결제를 붙일 수 있어요.' })}
`;

    const 액션 = `
${actPanel('이 거래', kv([
      ['물건', `<a href="${link('SE-04')}">${esc(물건.t)}</a>`],
      ['값', `<b>${won(물건.price)}</b>`],
      ['거래 방식', wayBadges(물건.ways)],
      ['내 쪽', badge('사는 쪽', 'b-pri')],
    ]), `${btn('안전결제로 거래하기', { href: 'PA-01', cls: 'btn-pri btn-block' })}
   ${btn('거래 약속 잡기', { href: 'CH-03', cls: 'btn-ghost btn-block' })}
   ${btn('매물 보기', { href: 'SE-04', cls: 'btn-ghost btn-block' })}`, { state: 기준방.st })}

${actPanel('매물 상태 바꾸기', `<p class="t-sub">이 대화에서 나는 <b>사는 쪽</b>이라 매물 상태를 바꿀 수 없어요.
  「예약중」·「거래완료」로 바꾸는 것은 <b>파는 쪽</b>만 할 수 있습니다.</p>
  <p class="t-sub mt2">파는 쪽으로 들어오면 이 자리가 드롭다운으로 바뀝니다.</p>`,
      btn('판매자로 볼 때', { href: 'CH0205', cls: 'btn-ghost btn-block' }))}

${상대패널(상대)}

${방관리패널()}

<div class="mt-block">${안전배너()}</div>
`;

    const body = `
${pageHd(`${esc(상대.nick)}님과의 대화`, `${esc(물건.t)} · ${won(물건.price)}`,
      `<div class="btns">${btn('채팅 목록으로', { href: 'CH-01', cls: 'btn-ghost' })}${btn('안전결제로 거래하기', { href: 'PA-01', cls: 'btn-pri' })}</div>`)}
${방지표(기준방, 상대)}
${detailSplit(본문, 액션)}`;

    return { body, o: { after: 더하기모달() + 나가기모달() } };
  },

  /** CH0202 채팅방 > 가격 제안 주고받기 */
  CH0202(ctx) {
    const 마지막 = CH_OFFERS[CH_OFFERS.length - 1];
    const 말들 = [
      말풍선({ me: false, t: '감사합니다. 네고 조금만 가능할까요?', at: '오후 2:19' }),
      ...CH_OFFERS.map((o) => 말풍선({ kind: 'offer', me: o.me, price: o.price, at: o.at, st: o.st, why: o.why })),
      말풍선({ kind: 'sys', t: '값이 정해졌어요. 매물을 「예약중」으로 바꾸면 다른 분이 헛걸음하지 않아요.' }),
    ];

    const 본문 = `
${매물띠(물건, 기준방.st, { price: 마지막.price })}

${banner('ok', '🤝', `<b>${won(마지막.price)}에 합의됐어요</b>
  <div class="t-sub mt1">수락한 제안은 「수락됨」으로 굳어 더 이상 누를 수 없습니다.
  거절된 제안은 다시 제안할 수 있어요.</div>`, { cls: 'mt-block' })}

<div class="mt-block">${대화판(말들, { day1: '9월 7일 (오늘)' })}</div>

${입력칸({ ph: '값이 정해졌어요. 약속을 잡아 볼까요?' })}

<div class="mt-block">${card('오간 제안', table(
      [{ t: '누가', w: '96px' }, { t: '제안한 값', w: '140px' }, { t: '보낸 때', w: '110px' }, { t: '결과', w: '100px' }, { t: '' }],
      CH_OFFERS.map((o) => [
        o.me ? '<b>나</b>' : esc(상대.nick),
        `<b>${won(o.price)}</b>`,
        o.at,
        o.st === '수락' ? badge('수락됨', 'b-ok') : badge('거절됨', 'b-mut'),
        o.st === '수락' ? '이 값으로 굳었습니다' : '<span class="t-sub">다시 제안할 수 있어요</span>',
      ]), { scroll: false }))}</div>
`;

    const 액션 = `
${actPanel('정해진 값', kv([
      ['처음 값', `<s class="muted">${won(물건.price)}</s>`],
      ['합의한 값', `<b style="font-size:19px">${won(마지막.price)}</b>`],
      ['깎인 값', `${num(물건.price - 마지막.price)}원`],
      ['오간 제안', `${CH_OFFERS.length}번`],
    ]), `${btn('예약중으로 바꾸기', { cls: 'btn-pri btn-block', attr: ' data-toast="예약중으로 바꿨어요 · 목록에 배지가 붙습니다"' })}
   ${btn('안전결제로 거래하기', { href: 'PA-01', cls: 'btn-ghost btn-block' })}
   ${btn('거래 약속 잡기', { href: 'CH-03', cls: 'btn-ghost btn-block' })}`, { state: '예약중' })}

${actPanel('다시 제안하기', `<p class="t-sub">거절된 제안은 값을 고쳐 다시 보낼 수 있어요.
  파는 분이 적어 둔 <b>최저 ${won(물건.offerMin)}</b>보다 낮으면 잘 받아들여지지 않습니다.</p>
  <div class="mt3"><input class="input" type="text" value="${num(마지막.price)}" inputmode="numeric" aria-label="제안할 값"></div>`,
      btn('제안 보내기', { cls: 'btn-ghost btn-block', attr: ' data-toast="제안을 보냈어요 · 상대가 수락하면 알려드릴게요"' }))}

${상대패널(상대)}

${방관리패널()}
`;

    const body = `
${pageHd('가격 제안 주고받기', `${esc(상대.nick)}님과 · ${esc(물건.t)}`,
      `<div class="btns">${btn('채팅으로 돌아가기', { href: 'CH-02', cls: 'btn-ghost' })}${btn('안전결제로 거래하기', { href: 'PA-01', cls: 'btn-pri' })}</div>`)}
${방지표(기준방, 상대, { d1: `제안 ${CH_OFFERS.length}번 포함` })}
${detailSplit(본문, 액션)}`;

    return { body, o: { after: 더하기모달() + 나가기모달(), state: `${won(마지막.price)}에 수락됨` } };
  },

  /** CH0203 채팅방 > 약속 카드 */
  CH0203(ctx) {
    const 말들 = [
      말풍선({ me: false, t: '내일 저녁에 역삼역 쪽 괜찮으세요?', at: '오후 2:25' }),
      약속카드({}),
      말풍선({ me: true, t: '네 좋아요! 그때 뵐게요.', at: '오후 2:27', read: true }),
    ];

    const 본문 = `
${매물띠(물건, '예약중')}

<div class="mt-block">${대화판(말들, { day1: '9월 7일 (오늘)' })}</div>

${sec('지난 약속은 이렇게 흐려져요', card('', `
  <p class="t-sub mb4">약속 시각이 지나면 카드가 흐려지고 「지난 약속」으로 바뀝니다. 누를 수 있는 단추도 사라져요.</p>
  <div class="talk-wrap" style="min-height:0">${약속카드({ past: true })}</div>`))}

${sec('이 약속에 붙은 것', card('', kv([
      ['날짜', `${CH_APPT.date} ${CH_APPT.time}`],
      ['장소', `${esc(CH_APPT.place)} <span class="t-sub">· 안전거래존 · CCTV 있음</span>`],
      ['서로의 거리', `나에게서 ${CH_APPT.myKm}km · ${esc(상대.nick)}님에게서 ${CH_APPT.youKm}km`],
      ['메모', esc(CH_APPT.memo)],
      ['알림', '약속 30분 전에 알려줌'],
    ]) + `<div class="mt4">${phMap('약속 장소 지도', 800, 400)}</div>`))}
`;

    const 액션 = `
${actPanel('약속', kv([
      ['날짜', CH_APPT.date],
      ['시간', CH_APPT.time],
      ['장소', esc(CH_APPT.place)],
    ]), `${btn('일정 추가', { cls: 'btn-pri btn-block', attr: ' data-toast="내 달력에 넣었어요 · 30분 전에 알려드릴게요"' })}
   ${btn('약속 바꾸기', { href: 'CH-03', cls: 'btn-ghost btn-block' })}
   ${btn('안전거래존 안내', { href: 'CH0303', cls: 'btn-ghost btn-block' })}
   ${btn('약속 취소', { cls: 'btn-danger btn-block', attr: ' data-toast="약속을 취소했어요 · 상대에게도 알려집니다"' })}`,
      { state: '예약중' })}

${actPanel('약속 30분 전 알림', `<div class="toggle-row">
    <span>미리 알려주기</span>
    <button class="toggle on" type="button" data-toast="약속 30분 전 알림을 껐어요" aria-label="약속 알림 켜기·끄기"></button>
  </div>
  <p class="t-sub mt2">켜 두면 ${CH_APPT.date} ${CH_APPT.time} 30분 전에 알림이 갑니다.</p>`)}

${상대패널(상대)}

<div class="mt-block">${banner('warn', '⏰', `<b>못 가게 되면 미리 알려 주세요</b>
  <div class="t-sub mt1">말없이 안 나오면 매너 온도가 내려갑니다.</div>`)}</div>
`;

    const body = `
${pageHd('약속 카드', `${CH_APPT.date} ${CH_APPT.time} · ${esc(CH_APPT.place)}`,
      `<div class="btns">${btn('채팅으로 돌아가기', { href: 'CH-02', cls: 'btn-ghost' })}${btn('약속 바꾸기', { href: 'CH-03', cls: 'btn-pri' })}</div>`)}
${약속지표({ timeD: '확정된 시간' })}
${detailSplit(본문, 액션)}`;

    return { body, o: { state: '약속 확정' } };
  },

  /** CH0204 채팅방 > 사기 주의 시스템 안내 */
  CH0204(ctx) {
    const 말들 = [
      말풍선({ me: false, t: '지금 입금하시면 바로 보내드릴게요. 다른 분이 기다리셔서요.', at: '오후 3:02' }),
      말풍선({ kind: 'sys', t: '값을 먼저 보내 달라는 말은 사기일 수 있어요. 안전결제를 쓰면 물건을 받은 뒤에 돈이 넘어갑니다.' }),
      말풍선({ me: false, t: '이 링크로 결제해 주세요 → (바깥 주소)', at: '오후 3:04' }),
      말풍선({ kind: 'sys', t: '바깥 링크로 결제하라는 말은 사기입니다. 안전결제는 채팅 안 단추로만 시작해요.' }),
    ];

    const 본문 = `
${매물띠(물건, 기준방.st)}

${banner('dan', '🛡', `<b>이 대화에서 위험한 말이 오갔어요</b>
  <div class="t-sub mt1">아래 말이 오가면 회색 안내가 <b>저절로</b> 끼어듭니다. 사람이 켜 두는 것이 아니에요.</div>`, { cls: 'mt-block' })}

<div class="mt-block">${대화판(말들, { day1: '9월 7일 (오늘)' })}</div>

${입력칸({ ph: '안전결제로 하자고 말해 보세요' })}

${sec('이런 말이 나오면 안내가 뜹니다', card('', `<div class="chips">
  ${CH_SCAM_TRIGGERS.map((t) => `<span class="chip" style="cursor:default">${esc(t)}</span>`).join('')}
</div>
<p class="t-sub mt3">말을 가로막지는 않아요 — 대화는 그대로 되고, 가운데에 회색 안내만 한 줄 끼어듭니다.
안내는 양쪽 모두에게 보입니다.</p>`))}
`;

    const 액션 = `
${actPanel('지금 해야 할 것', `<ul class="dots t-sub">
    <li>돈을 <b>먼저</b> 보내지 마세요</li>
    <li>바깥 링크를 누르지 마세요</li>
    <li>안전결제로 하자고 말해 보세요 — 사기꾼은 대개 물러섭니다</li>
  </ul>`,
      `${btn('안전결제로 거래하기', { href: 'PA-01', cls: 'btn-pri btn-block' })}
   ${btn('안전거래 안내 보기', { href: 'HO-03', cls: 'btn-ghost btn-block' })}
   ${btn('이 대화 신고하기', { href: 'CH-04', cls: 'btn-danger btn-block' })}`, { state: '주의' })}

${상대패널(상대, { title: '상대 살펴보기' })}

${방관리패널()}
`;

    const body = `
${pageHd('사기 주의 안내', '선입금·외부 링크 같은 말이 오갈 때 저절로 뜹니다',
      `<div class="btns">${btn('채팅으로 돌아가기', { href: 'CH-02', cls: 'btn-ghost' })}${btn('안전거래 안내', { href: 'HO-03', cls: 'btn-pri' })}</div>`)}
${방지표(기준방, 상대, {
      k4: ['위험한 말', num(2), { unit: '번', tone: 'k-danger', d: '이 대화에서 걸린 횟수', href: 'HO-03' }],
    })}
${detailSplit(본문, 액션)}`;

    return { body, o: { after: 더하기모달() + 나가기모달(), state: '사기 주의 안내가 떴음' } };
  },

  /** CH0205 채팅방 > 판매자로 볼 때 */
  CH0205(ctx) {
    const 말들 = [
      말풍선({ me: false, t: '안녕하세요, 키보드 아직 있나요?', at: '오전 11:02' }),
      말풍선({ me: true, t: '네 있습니다! 직거래도 되고 택배도 돼요.', at: '오전 11:10', read: true }),
      말풍선({ me: false, t: '안전결제로 하겠습니다', at: '오전 11:14' }),
    ];

    const 본문 = `
${매물띠(파는물건, 판매방기준.st)}

${banner('info', '🧑‍🌾', `<b>이 대화에서 나는 «파는 쪽»이에요</b>
  <div class="t-sub mt1">그래서 맨 위 띠 자리가 <b>매물 상태 바꾸기</b>로 바뀌고,
  구매자의 매너 점수와 다른 문의자 수가 함께 보입니다.</div>`,
      { right: btn('사는 쪽으로 볼 때', { href: 'CH-02', cls: 'btn-ghost btn-sm' }), cls: 'mt-block' })}

<div class="mt-block">${대화판(말들, { day1: '9월 7일 (오늘)' })}</div>

${입력칸({ ph: '답을 적어 주세요 · 빨리 답하면 매너 온도가 올라요' })}

${sec('이 물건을 묻고 있는 분들', card('', `
  ${tableBar(`<b>${CH_OTHER_ASKERS}명</b> <span class="t-sub">· ${esc(사는사람.nick)}님을 포함해 세 분이 묻고 있어요</span>`,
      btn('매물 보기', { href: 'SE-04', cls: 'btn-ghost btn-sm' }))}
  ${table(
      [{ t: '묻는 분', w: '190px' }, { t: '매너 온도', w: '110px' }, { t: '마지막 말' }, { t: '시각', w: '96px' }, { t: '상태', w: '96px' }],
      [
        [`<span class="row-c" style="gap:8px">${phAva(26, 사는사람.id)}<b>${esc(사는사람.nick)}</b></span>`, manner(사는사람.manner), '안전결제로 하겠습니다', '1시간 전', badge('지금 대화', 'b-pri')],
        [`<span class="row-c" style="gap:8px">${phAva(26, 'u5')}<b>바람개비</b></span>`, manner(34.2), '직거래 가능할까요?', '3시간 전', badge('대기', 'b-mut')],
        [`<span class="row-c" style="gap:8px">${phAva(26, 'u3')}<b>해질녘</b></span>`, manner(41.0), '택배비 포함인가요?', '어제', badge('대기', 'b-mut')],
      ], { scroll: false })}
  <p class="t-sub mt3">먼저 말을 건 분이 먼저 사는 것이 아니에요. 누구와 거래할지는 파는 분이 정합니다.</p>`))}
`;

    const 액션 = `
${actPanel('매물 상태 바꾸기', `<p class="t-sub">파는 쪽만 바꿀 수 있어요. 바꾸면 목록과 상세에 배지가 곧바로 붙습니다.</p>
  <div class="mt3">
    <label class="lb" for="ch-st">지금 상태</label>
    <select class="input" id="ch-st" aria-label="매물 상태">
      <option>판매중</option><option selected>예약중</option><option>거래완료</option><option>숨김</option>
    </select>
  </div>
  <p class="t-sub mt2">「예약중」으로 두면 다른 분이 헛걸음하지 않아요.</p>`,
      `${btn('예약중으로 바꾸기', { cls: 'btn-pri btn-block', attr: ' data-toast="예약중으로 바꿨어요 · 목록에 배지가 붙습니다"' })}
   ${btn('거래완료로 바꾸기', { cls: 'btn-ghost btn-block', attr: ' data-toast="거래완료로 바꿨어요 · 후기를 남길 수 있어요"' })}
   ${btn('안전결제로 거래하기', { href: 'PA-01', cls: 'btn-ghost btn-block' })}`, { state: 판매방기준.st })}

${상대패널(사는사람, { title: '사는 분' })}

${actPanel('이 물건', kv([
      ['물건', `<a href="${link('SE-04')}">${esc(파는물건.t)}</a>`],
      ['값', `<b>${won(파는물건.price)}</b>`],
      ['문의', `${CH_OTHER_ASKERS}명`],
      ['찜', `${파는물건.wish}명`],
    ]), `${btn('거래 약속 잡기', { href: 'CH-03', cls: 'btn-ghost btn-block' })}
   ${btn('내 판매글', { href: 'SL-05', cls: 'btn-ghost btn-block' })}`)}

${방관리패널()}
`;

    const body = `
${pageHd(`${esc(사는사람.nick)}님과의 대화`, `${esc(파는물건.t)} · ${won(파는물건.price)} · 내가 파는 물건`,
      `<div class="btns">${btn('채팅 목록으로', { href: 'CH-01', cls: 'btn-ghost' })}${btn('내 판매글', { href: 'SL-05', cls: 'btn-pri' })}</div>`)}
${방지표(판매방기준, 사는사람, {
      d1: '오늘 3개',
      k4: ['이 물건 문의', num(CH_OTHER_ASKERS), { unit: '명', tone: 'k-warn', d: `${esc(사는사람.nick)}님 말고 2명 더`, href: 'SE-04' }],
    })}
${detailSplit(본문, 액션)}`;

    return { body, o: { after: 더하기모달() + 나가기모달(), state: '판매자(파는 쪽)로 보는 중' } };
  },

  /** CH0206 채팅방 > 상대가 나감 */
  CH0206(ctx) {
    const c = CHATS[4];
    const u = userBy(c.with);
    const it = itemBy(c.item);
    const 말들 = [
      말풍선({ me: false, t: '잘 받았습니다. 감사합니다!', at: '어제 오후 6:40' }),
      말풍선({ me: true, t: '저도 감사합니다. 좋은 하루 보내세요!', at: '어제 오후 6:44', read: true }),
      말풍선({ kind: 'sys', t: '상대가 채팅방을 나갔어요. 새 말을 보낼 수 없습니다.' }),
    ];

    const 본문 = `
${매물띠(it, c.st)}

${banner('quiet', '🚪', `<b>${esc(u.nick)}님이 채팅방을 나갔어요</b>
  <div class="t-sub mt1">상대 쪽 대화 기록은 지워졌습니다. 내 쪽 기록은 그대로 남아 읽을 수 있어요.
  새 말을 보내려면 매물에서 <b>다시 채팅 걸기</b>를 눌러 새 대화를 시작하세요.</div>`, { cls: 'mt-block' })}

<div class="mt-block">${대화판(말들, { day1: '9월 6일' })}</div>

${입력칸({ off: true, note: '상대가 나간 방에서는 말을 보낼 수 없어요. 읽기만 됩니다.' })}

${sec('이 거래는 이렇게 끝났어요', card('', kv([
      ['물건', `<a href="${link('SE-04')}">${esc(it.t)}</a>`],
      ['값', won(it.price)],
      ['상태', stBadge(c.st)],
      ['마무리', '어제 오후 6:44'],
      ['후기', '아직 안 썼어요'],
    ]) + `<div class="btns mt4">${btn('거래 후기 쓰기', { href: 'MY-04', cls: 'btn-pri btn-sm' })}${btn('거래 진행 상태', { href: 'PA-05', cls: 'btn-ghost btn-sm' })}</div>`))}
`;

    const 액션 = `
${actPanel('여기서 갈 수 있는 곳', `<p class="t-sub">상대가 나간 방은 새 말을 못 보냅니다.
  다시 이야기하려면 매물 상세에서 채팅을 새로 거세요.</p>`,
      `${btn('매물 상세로 돌아가기', { href: 'SE-04', cls: 'btn-pri btn-block' })}
   ${btn('다시 채팅 걸기', { cls: 'btn-ghost btn-block', attr: ' data-toast="새 대화를 시작했어요 · 상대가 받으면 알려드릴게요"' })}
   ${btn('채팅 목록으로', { href: 'CH-01', cls: 'btn-ghost btn-block' })}`, { state: c.st })}

${actPanel('이 방 정리하기', `<p class="t-sub">나도 나가면 내 쪽 기록도 지워집니다. 되돌릴 수 없어요.</p>`,
      `${btn('거래 후기 쓰기', { href: 'MY-04', cls: 'btn-ghost btn-block' })}
   ${btn('신고·차단하기', { href: 'CH-04', cls: 'btn-ghost btn-block' })}
   ${btn('나도 나가기', { cls: 'btn-danger btn-block', attr: ' data-modal="out"' })}`)}

${상대패널(u, { title: '나간 상대' })}
`;

    const body = `
${pageHd(`${esc(u.nick)}님과의 대화`, `${esc(it.t)} · 상대가 채팅방을 나갔어요`,
      `<div class="btns">${btn('채팅 목록으로', { href: 'CH-01', cls: 'btn-ghost' })}${btn('매물 상세로', { href: 'SE-04', cls: 'btn-pri' })}</div>`)}
${방지표(c, u, {
      d1: '더 이상 늘지 않아요',
      k4: ['남은 할 일', '1', { unit: '가지', tone: 'k-acc', d: '거래 후기를 아직 안 썼어요', href: 'MY-04' }],
    })}
${detailSplit(본문, 액션)}`;

    return { body, o: { after: 나가기모달(), state: '상대가 채팅방을 나감' } };
  },

  /* ─────────── CH03 거래 약속 잡기 ─────────── */

  /** CH0301 거래 약속 잡기 */
  CH0301(ctx) {
    const 본문 = `
${card('', `<div class="row-b wrap-row" style="gap:16px">
  <div class="row-c" style="gap:12px;min-width:0">${phAva(40, 상대.id)}
    <div><b>${esc(상대.nick)}</b> ${manner(상대.manner)}
      <div class="t-sub mt1">${esc(물건.t)} · ${won(물건.price)}</div></div></div>
  <div class="btns">${btn('대화 보기', { href: 'CH-02', cls: 'btn-ghost btn-sm' })}</div>
</div>`, { cls: 'tape' })}

${sec('① 언제 만날까요', card('', `
  ${chips(CH_DATES, 1)}
  <div class="fld mt4"><label class="lb" for="ch-date">직접 고르기</label>
    <input class="input" id="ch-date" type="date" value="2026-09-08" style="max-width:260px"></div>
  <p class="t-sub">지난 날짜는 고를 수 없어요.</p>`), { desc: '오늘·내일은 한 번에 고르고, 그 밖의 날은 달력에서 고릅니다.' })}

${sec('② 몇 시에', card('', 시간격자()), { desc: '30분 단위로 고릅니다. 상대가 좋다고 한 시간대는 초록 테두리로 보여요.' })}

${sec('③ 어디서', card('', `
  ${chips(CH_SPOT_CHIPS, 0)}
  <div class="fld mt4"><label class="lb" for="ch-place">직접 적기</label>
    <input class="input" id="ch-place" type="text" value="${esc(CH_APPT.place)}"></div>
  <div class="mt4">${phMap('약속 장소 지도', 800, 400)}</div>
  <p class="t-sub mt2">나에게서 <b>${CH_APPT.myKm}km</b> · ${esc(상대.nick)}님에게서 <b>${CH_APPT.youKm}km</b></p>
  <div class="btns mt3">${btn('장소 더 고르기', { href: 'CH0302', cls: 'btn-ghost btn-sm' })}</div>`),
      { desc: '추천 칩을 누르면 지도와 서로의 거리가 다시 계산됩니다.' })}

<div class="mt-block">${안전거래존카드()}</div>

<div class="mt-block">${겹침배너()}</div>

<div class="mt-block">${card('상대에게 한마디', `
  <textarea class="input" rows="3" placeholder="예: 검은색 가방 들고 갈게요">${esc(CH_APPT.memo)}</textarea>
  <p class="help">서로를 알아보기 쉬운 표시를 적어 두면 만나기 편해요.</p>
  <label class="check box on mt3"><input type="checkbox" checked>
    <span><b>약속 30분 전에 알려주세요</b><br><span class="t-sub">${CH_APPT.date} ${CH_APPT.time} 30분 전에 알림이 갑니다</span></span></label>`)}</div>

<div class="mt-block">${banner('warn', '🙋', `<b>못 가게 되면 미리 알려 주세요</b>
  <div class="t-sub mt1">말없이 안 나오면(노쇼) 매너 온도가 내려가고, 세 번 쌓이면 이용이 제한될 수 있어요.</div>`)}</div>
`;
    const body = `
${pageHd('거래 약속 잡기', `${esc(상대.nick)}님과 · ${esc(물건.t)}`,
      `<div class="btns">${btn('채팅으로 돌아가기', { href: 'CH-02', cls: 'btn-ghost' })}${btn('안전결제로 거래하기', { href: 'PA-01', cls: 'btn-pri' })}</div>`)}
${약속지표()}
${detailSplit(본문, 약속액션())}`;
    return { body, o: {} };
  },

  /** CH0302 거래 약속 잡기 > 장소 고르기 */
  CH0302(ctx) {
    const 본문 = `
${sec('추천 장소를 누르면 지도와 거리가 다시 계산돼요', card('', `
  ${chips(CH_SPOT_CHIPS, 0)}
  <div class="mt4">${phMap('고른 장소 주변 지도', 800, 400)}</div>
  <div class="g2 mt4">
    ${[['나에게서', `${CH_APPT.myKm}km`, '걸어서 약 16분'], [`${esc(상대.nick)}님에게서`, `${CH_APPT.youKm}km`, '걸어서 약 11분']]
      .map(([k, v, d]) => `${box(`<div class="t-sub">${k}</div><div style="font-size:26px;font-weight:800">${v}</div><div class="t-sub">${d}</div>`, { cls: 'soft' })}`).join('')}
  </div>
  <p class="t-sub mt3">거리는 고른 장소가 바뀔 때마다 다시 잽니다. 둘 다 너무 멀면 가운데 지점을 권해 드려요.</p>`))}

${sec('직접 적기', card('', `
  <div class="fld"><label class="lb" for="ch-place2">만날 곳</label>
    <input class="input" id="ch-place2" type="text" value="${esc(CH_APPT.place)}" placeholder="예: 역삼역 2번 출구 앞">
    <p class="help">건물 이름과 출구 번호까지 적어 주면 헤매지 않아요.</p></div>
  <p class="t-sub">직접 적은 곳은 지도에서 찾아 거리만 다시 재고, 추천 칩은 꺼집니다.</p>`))}

${sec('최근에 쓴 장소', card('', `
  <div class="stack-sm">
    ${CH_RECENT_SPOTS.map((s, i) => `<div class="cond-row">
      <span class="grow"><b>${esc(s.nm)}</b><br><span class="t-sub">${esc(s.at)}</span></span>
      <span class="t-sub nowrap">${s.km}km</span>
      ${btn('여기로', { cls: 'btn-ghost btn-sm', attr: ` data-toast="${esc(s.nm)}${조사붙이기(s.nm, '으로', '로')} 정했어요"` })}
      <button class="btn btn-quiet btn-xs" type="button" data-toast="최근 장소에서 지웠어요" aria-label="지우기">✕</button>
    </div>`).join('')}
  </div>
  <p class="t-sub mt3">최근에 실제로 거래한 곳을 기억해 둡니다. 지우면 다시 뜨지 않아요.</p>`))}

<div class="mt-block">${안전거래존카드()}</div>
`;
    const body = `
${pageHd('장소 고르기', '추천 칩 · 직접 적기 · 최근 쓴 장소',
      `<div class="btns">${btn('약속 잡기로 돌아가기', { href: 'CH-03', cls: 'btn-ghost' })}${btn('안전거래존 안내', { href: 'CH0303', cls: 'btn-pri' })}</div>`)}
${약속지표({ placeD: '안전거래존 · 고른 곳' })}
${detailSplit(본문, 약속액션({ mainLabel: '이 장소로 약속 보내기', note: '고른 개수 <b>1곳</b> · 한 곳도 안 고르면 아래 단추가 잠깁니다.' }))}`;
    return { body, o: { state: `장소 — ${CH_APPT.place}` } };
  },

  /** CH0303 거래 약속 잡기 > 안전거래존 안내 */
  CH0303(ctx) {
    const 가까운 = [...SAFE_SPOTS].sort((a, b) => a.km - b.km);
    const 본문 = `
${banner('ok', '🛡', `<b>안전거래존은 «사람이 있고 CCTV가 있는 곳»이에요</b>
  <div class="t-sub mt1">처음 만나는 분과 값이 큰 물건을 주고받을 때는 여기를 권합니다.
  다툼이 생겨도 기록이 남아 확인할 수 있어요.</div>`)}

${sec('가까운 곳 3곳 — 거리순', card('', `
  ${tableBar(`<b>${가까운.length}곳</b> <span class="t-sub">· ${esc(SITE.myTown)}에서 가까운 차례</span>`,
      btn('지도에서 보기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="지도에서 세 곳을 함께 보여드려요"' }))}
  ${table(
      [{ t: '장소' }, { t: '어떤 곳인가', w: '230px' }, { t: '거리', w: '92px' }, { t: '', w: '110px' }],
      가까운.map((s) => [
        `<b>${esc(s.nm)}</b>`,
        `<span class="t-sub">${esc(s.d)}</span>`,
        `<b>${s.km}km</b>`,
        btn('여기로', { cls: 'btn-ghost btn-sm', attr: ` data-toast="${esc(s.nm)}${조사붙이기(s.nm, '으로', '로')} 정했어요"` }),
      ]), { scroll: false })}
  <div class="mt4">${phMap('안전거래존 지도', 800, 400)}</div>`))}

${sec('왜 여기를 권하나요', card('', `<ul class="dots">
  <li><b>CCTV가 있어요</b> — 물건과 값을 주고받는 장면이 남습니다</li>
  <li><b>사람이 오갑니다</b> — 밤이나 외진 곳에서 단둘이 만나지 않아도 돼요</li>
  <li><b>찾기 쉬워요</b> — 역 출구·주민센터처럼 서로 헤매지 않는 곳입니다</li>
  <li><b>다툼이 줄어요</b> — 그 자리에서 물건을 확인하고 끝낼 수 있습니다</li>
</ul>
<p class="t-sub mt4">값이 큰 물건이나 택배 거래라면 <b>안전결제</b>를 함께 쓰세요.
물건을 받고 「받았어요」를 누른 뒤에 돈이 넘어갑니다.</p>
<div class="btns mt3">${btn('안전결제란', { href: 'PA-01', cls: 'btn-ghost btn-sm' })}${btn('안전거래 안내', { href: 'HO-03', cls: 'btn-ghost btn-sm' })}</div>`))}
`;
    const body = `
${pageHd('안전거래존 안내', 'CCTV가 있는 공공 장소 · 가까운 곳 3곳',
      `<div class="btns">${btn('약속 잡기로 돌아가기', { href: 'CH-03', cls: 'btn-ghost' })}${btn('장소 고르기', { href: 'CH0302', cls: 'btn-pri' })}</div>`)}
${kpis([
      ['가까운 안전거래존', num(가까운.length), { unit: '곳', d: `${esc(SITE.myTown)}에서 2km 안` }],
      ['가장 가까운 곳', `${가까운[0].km}`, { unit: 'km', tone: 'k-acc', d: esc(가까운[0].nm) }],
      ['CCTV 있는 곳', num(가까운.length), { unit: '곳', tone: 'k-ok', d: '세 곳 모두 있습니다' }],
      ['24시간 열린 곳', '1', { unit: '곳', tone: 'k-mut', d: '지구대 앞은 밤에도 됩니다' }],
    ])}
${detailSplit(본문, 약속액션({ place: esc(가까운[0].nm), placeD: '안전거래존', mainLabel: '이곳으로 약속 보내기' }))}`;
    return { body, o: { state: '안전거래존 안내' } };
  },

  /** CH0304 거래 약속 잡기 > 약속 겹침 경고 */
  CH0304(ctx) {
    const 본문 = `
${겹침배너({ right: '' })}

${sec('겹치는 약속', card('', kv([
      ['언제', `<b>${CH_CLASH.when}</b>`],
      ['누구와', `${esc(CH_CLASH.who)}님`],
      ['무슨 물건', esc(CH_CLASH.item)],
      ['어디서', esc(CH_CLASH.where)],
      ['새 약속과의 거리', '3.4km · 차로 약 14분'],
    ]) + `<p class="t-sub mt3">두 곳은 3.4km 떨어져 있어요. 한 시간 안에 둘 다 가기는 어렵습니다.</p>
  <div class="btns mt3">${btn('그 약속 보기', { href: 'CH0203', cls: 'btn-ghost btn-sm' })}</div>`, { cls: 'tape warn' }))}

${sec('어떻게 할까요', card('', `<div class="stack-sm">
  <label class="radio on" data-group="clash"><input type="radio" name="clash" checked>
    <b>시간을 바꿀게요</b><span class="d">겹치지 않는 시간으로 다시 고릅니다 — 권해 드려요</span></label>
  <label class="radio" data-group="clash"><input type="radio" name="clash">
    <b>그대로 잡을게요</b><span class="d">두 약속을 모두 두고, 못 가게 되면 미리 알리겠습니다</span></label>
  <label class="radio" data-group="clash"><input type="radio" name="clash">
    <b>그 약속을 취소할게요</b><span class="d">${esc(CH_CLASH.who)}님과의 약속을 취소하고 이 약속을 잡습니다</span></label>
</div>
<p class="t-sub mt3">고른 개수 <b>1개</b> · 하나도 안 고르면 오른쪽 단추가 잠깁니다.</p>`))}

${sec('겹치지 않는 시간', card('', `
  ${시간격자('20:30')}
  <p class="t-sub mt3">오후 7시 앞뒤 한 시간은 앞 약속과 겹칩니다. <b>오후 8:30</b>부터가 안전해요.</p>`))}

<div class="mt-block">${banner('warn', '⏰', `<b>약속을 겹쳐 잡으면 노쇼가 되기 쉬워요</b>
  <div class="t-sub mt1">말없이 안 나오면 매너 온도가 내려갑니다. 못 갈 것 같으면 미리 알려 주세요.</div>`)}</div>
`;
    const body = `
${pageHd('약속 겹침 경고', `${CH_CLASH.when}에 다른 약속이 있어요`,
      `<div class="btns">${btn('약속 잡기로 돌아가기', { href: 'CH-03', cls: 'btn-ghost' })}${btn('그 약속 보기', { href: 'CH0203', cls: 'btn-pri' })}</div>`)}
${약속지표({ time: '오후 8:30', timeD: '겹치지 않는 가장 이른 시간' })}
${detailSplit(본문, 약속액션({
      time: '오후 8:30',
      state: '주의',
      note: '겹치는 약속이 있어요. 위에서 하나를 고르면 보낼 수 있습니다.',
      mainLabel: '바꾼 시간으로 보내기',
    }))}`;
    return { body, o: { state: '같은 시간에 다른 약속이 있음' } };
  },

  /** CH0305 거래 약속 잡기 > 약속 보냄 */
  CH0305(ctx) {
    const 본문 = `
${banner('ok', '📨', `<b>약속을 보냈어요</b>
  <div class="t-sub mt1">채팅에 약속 카드가 붙었습니다. ${esc(상대.nick)}님이 받으면 <b>확정</b>으로 바뀌고,
  매물이 저절로 「예약중」이 됩니다.</div>`, { right: btn('채팅 보기', { href: 'CH-02', cls: 'btn-ghost btn-sm' }) })}

<div class="mt-block">${대화판([
      말풍선({ me: true, t: '약속 잡아서 보낼게요!', at: '오후 2:25', read: true }),
      약속카드({ wait: true }),
    ], { day1: '9월 7일 (오늘)' })}</div>

${sec('지금 어디까지 왔나', card('', timeline([
      ['약속을 보냄', `${CH_APPT.sentAt} · 채팅에 카드가 붙었어요`],
      ['상대 확인 대기', '지금 여기 · 보통 몇 분 안에 답이 옵니다'],
      ['확정', '상대가 받으면 매물이 「예약중」으로 바뀝니다'],
      ['만나서 거래', `${CH_APPT.date} ${CH_APPT.time} · ${esc(CH_APPT.place)}`],
    ], 1) + `<p class="t-sub mt4">확정되기 전에는 <b>취소</b>할 수 있어요. 확정된 뒤에는 상대와 이야기해 바꿔야 합니다.</p>`))}

${sec('보낸 약속', card('', kv([
      ['날짜', `${CH_APPT.date} ${CH_APPT.time}`],
      ['장소', `${esc(CH_APPT.place)} <span class="t-sub">· 안전거래존</span>`],
      ['메모', esc(CH_APPT.memo)],
      ['알림', '약속 30분 전에 알려줌'],
      ['상태', badge('상대 확인 대기', 'b-warn')],
    ])))}
`;

    const 액션 = `
${actPanel('보낸 약속', kv([
      ['날짜', CH_APPT.date],
      ['시간', CH_APPT.time],
      ['장소', esc(CH_APPT.place)],
      ['보낸 때', CH_APPT.sentAt],
    ]) + `<p class="t-sub mt3">확정 전에는 취소하거나 고쳐 보낼 수 있어요.</p>`,
      `${btn('채팅으로 돌아가기', { href: 'CH-02', cls: 'btn-pri btn-block' })}
   ${btn('고쳐서 다시 보내기', { href: 'CH-03', cls: 'btn-ghost btn-block' })}
   ${btn('약속 카드 보기', { href: 'CH0203', cls: 'btn-ghost btn-block' })}
   ${btn('약속 취소', { cls: 'btn-danger btn-block', attr: ' data-toast="약속을 취소했어요 · 상대에게도 알려집니다"' })}`,
      { state: '예약중' })}

${actPanel('다음으로 할 일', `<ul class="dots t-sub">
    <li>택배로 보낼 물건이면 <b>안전결제</b>로 바꿔도 돼요</li>
    <li>약속 30분 전에 알림이 갑니다</li>
    <li>못 가게 되면 <b>미리</b> 알려 주세요</li>
  </ul>`,
      `${btn('안전결제로 거래하기', { href: 'PA-01', cls: 'btn-ghost btn-block' })}
   ${btn('거래 진행 상태', { href: 'PA-05', cls: 'btn-ghost btn-block' })}`)}
`;

    const body = `
${pageHd('약속 보냄', `${esc(상대.nick)}님이 받기를 기다리는 중`,
      `<div class="btns">${btn('채팅으로 돌아가기', { href: 'CH-02', cls: 'btn-ghost' })}${btn('거래 진행 상태', { href: 'PA-05', cls: 'btn-pri' })}</div>`)}
${약속지표({ timeD: '보낸 약속 · 상대 확인 대기' })}
${detailSplit(본문, 액션)}`;
    return { body, o: { state: '상대 확인 대기' } };
  },

  /* ─────────── CH04 신고·차단 ─────────── */

  /** CH0401 신고·차단 */
  CH0401(ctx) {
    const 본문 = `
${신고대상카드()}

<div class="mt-block">${중복신고배너()}</div>

${sec('① 무슨 일인가요', 사유라디오(0), { desc: '이 화면에서 가장 크게 보이는 곳입니다. 하나만 고를 수 있어요.' })}

${사유별칸(REPORT_REASONS[0].k)}

${sec('② 자세히 적어 주세요', card('', `
  <textarea class="input" rows="6" placeholder="언제 어떤 일이 있었는지 적어 주세요. 자세할수록 빨리 처리됩니다."></textarea>
  <p class="help">0 / 1000</p>`))}

${sec('③ 증거를 붙여 주세요', 증거카드())}

${sec('④ 이 사람을 차단할까요', 차단카드())}

<div class="mt-block">${절차안내()}</div>

<div class="mt-block">${허위신고경고()}</div>
`;
    const body = `
${pageHd('신고·차단', '무슨 일이 있었는지 알려 주시면 운영자가 확인합니다',
      `<div class="btns">${btn('채팅으로 돌아가기', { href: 'CH-02', cls: 'btn-ghost' })}${btn('안전거래 안내 보기', { href: 'HO-03', cls: 'btn-pri' })}</div>`)}
${신고지표({ ev: 2 })}
${detailSplit(본문, 신고액션({ ev: 2 }))}`;
    return { body, o: {} };
  },

  /** CH0402 신고·차단 > 신고 사유별 추가 입력 */
  CH0402(ctx) {
    const 고른사유 = REPORT_REASONS[1].k;   // 팔 수 없는 물건이에요
    const 본문 = `
${신고대상카드()}

${sec('① 무슨 일인가요', 사유라디오(1), { desc: '고른 사유에 따라 아래 칸이 통째로 바뀝니다.' })}

${사유별칸(고른사유)}

${sec('사유마다 어떤 칸이 열리나', card('', table(
      [{ t: '고른 사유', w: '230px' }, { t: '열리는 칸' }, { t: '어떻게 고르나', w: '150px' }],
      Object.entries(CH_REASON_EXTRA).map(([k, v]) => [
        `<b>${esc(k)}</b>`,
        esc(v.t),
        v.kind === 'text' ? '한 줄 적기' : (v.kind === 'radio' ? '하나만 고르기' : (v.kind === 'pick' ? '대화에서 고르기' : '여러 개 고르기')),
      ]), { scroll: false })))}

<div class="mt-block">${modalStatic('사유를 바꿀까요?', `
  <p class="t-sub">「${esc(REPORT_REASONS[0].k)}」에 적어 둔 것이 있습니다.
  사유를 「${esc(고른사유)}」${조사붙이기(고른사유, '으로', '로')} 바꾸면 <b>적어 둔 것이 지워져요</b>.</p>
  <div class="mt3">${box(`<div class="t-sub">지금 적어 둔 것</div>
    <ul class="dots t-sub mt2"><li>돈을 먼저 보내 달라고 해요</li><li>자세한 설명 2줄</li></ul>`, { cls: 'soft' })}</div>
  <p class="t-sub mt3">붙인 증거 사진은 그대로 남습니다.</p>`,
      `${btn('그냥 둘게요', { cls: 'btn-ghost', attr: ' data-toast="사유를 그대로 두었어요"' })}${btn('바꿀게요', { cls: 'btn-pri', attr: ' data-toast="사유를 바꿨어요 · 적어 둔 것은 지워졌습니다"' })}`)}</div>

<div class="mt-block">${banner('info', '💡', `<b>사유를 바꿔도 증거 사진과 차단 여부는 남습니다</b>
  <div class="t-sub mt1">지워지는 것은 «그 사유에만 딸린» 칸에 적은 내용이에요.</div>`)}</div>
`;
    const body = `
${pageHd('신고 사유별 추가 입력', `고른 사유 — ${esc(고른사유)}`,
      `<div class="btns">${btn('신고 화면으로', { href: 'CH-04', cls: 'btn-ghost' })}${btn('채팅으로 돌아가기', { href: 'CH-02', cls: 'btn-pri' })}</div>`)}
${신고지표({ ev: 2 })}
${detailSplit(본문, 신고액션({ why: 고른사유, ev: 2, note: '사유에 딸린 칸을 채우면 처리가 빨라져요.' }))}`;
    return { body, o: { state: `사유 — ${고른사유}` } };
  },

  /** CH0403 신고·차단 > 증거 첨부 */
  CH0403(ctx) {
    const 쓴용량 = CH_EVIDENCE.reduce((a, f) => a + f.mb, 0).toFixed(1);
    const 본문 = `
${sec('붙인 증거', 증거카드({ n: CH_EVIDENCE.length, more: false }))}

${sec('붙인 것 목록', card('', `
  ${tableBar(`<b>${CH_EVIDENCE.length}장</b> <span class="t-sub">· 최대 ${CH_REPORT.maxPhoto}장 · 모두 ${쓴용량}MB</span>`,
      btn('모두 지우기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="붙인 것을 모두 지웠어요"' }))}
  ${table(
      [{ t: '파일', w: '260px' }, { t: '크기', w: '110px' }, { t: '무엇인가' }, { t: '', w: '90px' }],
      CH_EVIDENCE.map((f, i) => [
        `<span class="row-c" style="gap:8px">${phItem(26, 'rep' + i)}<b>${esc(f.nm)}</b></span>`,
        `${f.mb}MB`,
        i < 2 ? '<span class="t-sub">대화 캡처</span>' : '<span class="t-sub">판매글 캡처</span>',
        btn('지우기', { cls: 'btn-quiet btn-sm', attr: ` data-toast="${esc(f.nm)} 파일을 지웠어요"` }),
      ]), { scroll: false })}`))}

<div class="mt-block">${banner('warn', '📦', `<b>한 장에 ${CH_REPORT.maxMB}MB까지, 모두 ${CH_REPORT.maxPhoto}장까지예요</b>
  <div class="t-sub mt1">넘으면 붙지 않고 「${CH_REPORT.maxMB}MB가 넘어 붙이지 못했어요」라고 알려드립니다.
  동영상은 붙일 수 없어요 — 화면을 찍은 사진으로 올려 주세요.</div>`)}</div>

<div class="mt-block">${box(`<b class="t-card">어떤 것을 붙이면 좋을까요</b>
  <ul class="dots t-sub mt2">
    <li><b>대화 캡처</b> — 문제가 된 말이 보이게, 앞뒤 말까지 함께</li>
    <li><b>판매글 캡처</b> — 사진과 설명이 함께 보이게</li>
    <li><b>입금 내역</b> — 돈을 보낸 뒤라면 은행 화면 캡처</li>
  </ul>
  <p class="t-sub mt3">얼굴·전화번호처럼 남의 개인정보가 함께 찍혔다면 가리고 올려 주세요.</p>`, { cls: 'soft' })}</div>
`;
    const body = `
${pageHd('증거 첨부', `대화 캡처·사진 최대 ${CH_REPORT.maxPhoto}장`,
      `<div class="btns">${btn('신고 화면으로', { href: 'CH-04', cls: 'btn-ghost' })}${btn('채팅으로 돌아가기', { href: 'CH-02', cls: 'btn-pri' })}</div>`)}
${신고지표({ ev: CH_EVIDENCE.length })}
${detailSplit(본문, 신고액션({ ev: CH_EVIDENCE.length, note: `증거 ${CH_EVIDENCE.length}장을 붙였어요. 붙인 것은 신고와 함께 보내집니다.` }))}`;
    return { body, o: { state: `증거 ${CH_EVIDENCE.length}장 붙임` } };
  },

  /** CH0404 신고·차단 > 함께 차단하기 */
  CH0404(ctx) {
    const 본문 = `
${신고대상카드()}

${sec('체크하면 설명이 펼쳐져요', 차단카드({ more: false }))}

${sec('차단하면 무엇이 달라지나', card('', table(
      [{ t: '', w: '190px' }, { t: '차단 전' }, { t: '차단 뒤' }],
      [
        ['<b>이 사람의 판매글</b>', '목록·검색에 보임', '<b>안 보임</b>'],
        ['<b>이 사람이 거는 채팅</b>', '올 수 있음', '<b>못 옴</b>'],
        ['<b>하던 대화</b>', '주고받음', '읽기만 됨'],
        ['<b>내 글</b>', '그 사람에게 보임', '<b>안 보임</b>'],
        ['<b>되돌리기</b>', '—', '마이페이지에서 언제든'],
      ], { scroll: false })))}

<div class="mt-block">${banner('info', '↩', `<b>차단은 나중에 풀 수 있어요</b>
  <div class="t-sub mt1">마이페이지 → 알림·차단 관리에서 풉니다. 풀면 서로의 글이 다시 보이고 채팅도 걸 수 있어요.
  풀어도 이미 지워진 대화는 돌아오지 않습니다.</div>`,
      { right: btn('알림·차단 관리', { href: 'MY-06', cls: 'btn-ghost btn-sm' }) })}</div>

<div class="mt-block">${box(`<b class="t-card">신고와 차단은 다릅니다</b>
  <ul class="dots t-sub mt2">
    <li><b>신고</b>는 운영자가 확인해 조치하는 것 — 결과가 알림으로 옵니다</li>
    <li><b>차단</b>은 나에게만 안 보이게 하는 것 — 운영자가 보지 않습니다</li>
    <li>둘을 함께 하면 운영자가 확인하는 동안에도 그 사람이 나에게 오지 않아요</li>
  </ul>`, { cls: 'soft' })}</div>
`;
    const body = `
${pageHd('함께 차단하기', '차단이 무엇을 막는지 먼저 보여드려요',
      `<div class="btns">${btn('신고 화면으로', { href: 'CH-04', cls: 'btn-ghost' })}${btn('알림·차단 관리', { href: 'MY-06', cls: 'btn-pri' })}</div>`)}
${신고지표({ ev: 2 })}
${detailSplit(본문, 신고액션({ ev: 2, note: '신고와 함께 차단합니다. 차단만 하고 싶으면 아래에서 사유를 지우세요.' }))}`;
    return { body, o: { state: '차단 켜짐' } };
  },

  /** CH0405 신고·차단 > 접수 완료 */
  CH0405(ctx) {
    const 본문 = `
${banner('ok', '✅', `<b>신고를 접수했어요 · 접수번호 ${CH_REPORT.no}</b>
  <div class="t-sub mt1">${CH_REPORT.at}에 접수됐습니다. 결과는 <b>알림</b>으로 알려드려요.
  신고한 사실은 상대에게 알리지 않습니다.</div>`)}

${sec('지금 어디까지 왔나', card('', `<div class="mt2">${hsteps(CH_REPORT_FLOW, 0)}</div>
  <div class="mt4">${timeline([
      ['접수', `${CH_REPORT.at} · 접수번호 ${CH_REPORT.no}`],
      ['검토', `운영자가 대화와 증거를 확인합니다 · 평균 ${CH_REPORT.eta}`],
      ['조치', '경고·글 삭제·노출 제한·이용 정지 가운데 정합니다'],
      ['결과 알림', '어떤 조치를 했는지 알림으로 알려드려요'],
    ], 1)}</div>`))}

${sec('접수된 내용', card('', kv([
      ['접수번호', `<b>${CH_REPORT.no}</b>`],
      ['접수 때', CH_REPORT.at],
      ['대상', `${esc(상대.nick)} · ${esc(물건.t)} · 이 대화`],
      ['사유', esc(REPORT_REASONS[0].k)],
      ['증거', `${CH_EVIDENCE.length}장`],
      ['함께 차단', '했어요'],
      ['예상 처리', `${CH_REPORT.eta} 안`],
    ])))}

<div class="mt-block">${중복신고배너()}</div>

<div class="mt-block">${box(`<b class="t-card">결과는 이렇게 알려드려요</b>
  <ul class="dots t-sub mt2">
    <li>처리가 끝나면 <b>알림</b>이 갑니다 — 어떤 조치를 했는지 함께 적어 드려요</li>
    <li>같은 건으로 여러 분이 신고하면 <b>하나로 묶어</b> 봅니다</li>
    <li>급한 일(돈을 이미 보냈다 등)은 고객센터로 알려 주세요</li>
  </ul>
  <div class="btns mt3">${btn('내 신고·문의 내역', { href: 'CS-02', cls: 'btn-ghost btn-sm' })}${btn('고객센터', { href: 'CS-01', cls: 'btn-ghost btn-sm' })}</div>`, { cls: 'soft' })}</div>
`;

    const 액션 = `
${actPanel('접수 결과', kv([
      ['접수번호', `<b>${CH_REPORT.no}</b>`],
      ['지금 단계', badge('접수', 'b-pri')],
      ['예상 처리', `${CH_REPORT.eta} 안`],
      ['함께 차단', '했어요'],
    ]) + `<p class="t-sub mt3">차단은 마이페이지에서 언제든 풀 수 있어요.</p>`,
      `${btn('내 신고·문의 내역', { href: 'CS-02', cls: 'btn-pri btn-block' })}
   ${btn('채팅 목록으로', { href: 'CH-01', cls: 'btn-ghost btn-block' })}
   ${btn('안전거래 안내 보기', { href: 'HO-03', cls: 'btn-ghost btn-block' })}`, { state: '대기' })}

${actPanel('이 뒤에 할 수 있는 것', `<p class="t-sub">돈을 이미 보냈다면 안전결제 분쟁으로도 알려 주세요. 운영자가 함께 봅니다.</p>`,
      `${btn('거래 진행 상태', { href: 'PA-05', cls: 'btn-ghost btn-block' })}
   ${btn('고객센터 문의', { href: 'CS-02', cls: 'btn-ghost btn-block' })}
   ${btn('알림·차단 관리', { href: 'MY-06', cls: 'btn-ghost btn-block' })}`)}
`;

    const body = `
${pageHd('신고 접수 완료', `접수번호 ${CH_REPORT.no} · ${CH_REPORT.at}`,
      `<div class="btns">${btn('채팅 목록으로', { href: 'CH-01', cls: 'btn-ghost' })}${btn('내 신고·문의 내역', { href: 'CS-02', cls: 'btn-pri' })}</div>`)}
${kpis([
      ['접수번호', CH_REPORT.no, { d: CH_REPORT.at }],
      ['예상 처리 시간', CH_REPORT.eta.replace('시간', ''), { unit: '시간', tone: 'k-acc', d: '접수부터 결과 알림까지' }],
      ['지금 단계', '1', { unit: '/ 4', tone: 'k-warn', d: CH_REPORT_FLOW.join(' → ') }],
      ['함께 차단', '했음', { tone: 'k-mut', d: '마이페이지에서 풀 수 있어요', href: 'MY-06' }],
    ])}
${detailSplit(본문, 액션)}`;
    return { body, o: { state: '접수 완료 · 검토 대기' } };
  },
};
