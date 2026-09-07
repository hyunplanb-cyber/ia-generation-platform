/* CH 채팅 — 채팅 목록 / 채팅방 / 거래 약속 잡기 / 신고·차단
   ⚠ 이 장터의 «거래»는 화면이 아니라 대화로 이뤄진다. 값 흥정과 약속 잡기가 여기서 끝난다.
     그래서 채팅방 안에 «세 가지 특별한 말풍선»(가격 제안 · 약속 · 시스템 안내)을 둔다. */
import * as U from './ui.mjs';
import {
  CHATS, TALK, UNREAD, UNREAD_MSGS, itemBy, userBy, ago,
  REPORT_REASONS, SAFE_SPOTS, TOWNS,
} from './data.mjs';

/* ---------------- CH-01 채팅 목록 ---------------- */
function CH01() {
  const 탭 = [
    { k: '전체', f: () => CHATS },
    { k: '구매', f: () => CHATS.filter((c) => c.side === '구매') },
    { k: '판매', f: () => CHATS.filter((c) => c.side === '판매') },
    { k: '안 읽음', f: () => CHATS.filter((c) => c.unread > 0) },
  ];

  const 줄 = (c) => {
    const u = userBy(c.with);
    const it = itemBy(c.item);
    return `<a class="chat-row${c.unread ? ' unread' : ''}" href="${U.link('CH-02')}">
      ${U.phAva(46, u.id)}
      <span class="mid">
        <span class="row-c wrap-row"><b class="nm">${u.nick}</b>${U.manner(u.manner)}
          ${U.badge(c.side, 'b-mut')}</span>
        <span class="last">${U.esc(c.last)}</span>
      </span>
      <span class="right">
        <span class="thumb">${U.phItem(44, it.id)}${c.st !== '이야기중' ? `<span class="veil sm" data-t="${c.st}"></span>` : ''}</span>
        <span class="at">${c.at}</span>
        ${c.unread ? `<span class="unread-n">${c.unread}</span>` : ''}
      </span>
    </a>`;
  };

  const body = `
  ${U.pageHd('채팅', `대화 ${CHATS.length}개 · 안 읽은 것 ${UNREAD_MSGS}건`)}

  <div class="searchbar mb4">
    <input class="in" type="search" placeholder="상대 닉네임이나 물건 이름으로 찾기">
    <button class="btn btn-ghost btn-sm" type="button" data-toast="대화를 좁혔어요">찾기</button>
  </div>

  ${U.tabs(탭.map((t, i) => ({ label: t.k, cnt: t.f().length, pane: 'ch' + i })), 0)}

  <div class="mt4">
    ${탭.map((t, i) => {
    const 것들 = t.f();
    return `<div data-pane-body="ch${i}"${i === 0 ? '' : ' hidden'}>
      ${것들.length
        ? `<div class="chat-list">${것들.map(줄).join('')}</div>`
        : U.empty('💬', '아직 대화가 없어요', '', U.btn('매물 보러 가기', { href: 'SE-02', cls: 'btn-pri' }))}
    </div>`;
  }).join('')}
  </div>

  <div class="mt-block">${U.box(`<b class="t-card">채팅에서 조심할 것</b>
    <ul class="dots t-sub mt2">
      <li>돈을 먼저 보내 달라는 말이 나오면 <b>안전결제</b>를 쓰자고 하세요</li>
      <li>바깥 링크로 결제하라는 말은 <b>사기</b>입니다 — 안전결제는 채팅 안 단추로만 시작해요</li>
      <li>불쾌한 말을 들었다면 <b>신고·차단</b>할 수 있어요</li>
    </ul>
    <div class="btns mt3">${U.btn('안전거래 안내', { href: 'HO-03', cls: 'btn-ghost btn-sm' })}</div>`)}</div>
  `;
  return { body, o: {} };
}

/* ---------------- CH-02 채팅방 ---------------- */
function CH02() {
  const c = CHATS[0];
  const u = userBy(c.with);
  const it = itemBy(c.item);

  const 말풍선 = (m) => {
    if (m.kind === 'sys') {
      return `<div class="bub sys">🛡 ${U.esc(m.t)} <a class="link" href="${U.link('HO-03')}">안전거래 안내</a></div>`;
    }
    if (m.kind === 'offer') {
      return `<div class="bub offer${m.me ? ' me' : ''}">
        <span class="amt">${U.won(m.price)}에 어때요?</span>
        <div class="btns">
          <button class="btn btn-pri btn-sm" type="button" data-toast="제안을 받았어요 · 매물을 예약중으로 바꿀까요?">수락</button>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="제안을 거절했어요">거절</button>
        </div>
        <span class="when">${m.at}</span></div>`;
    }
    if (m.photo) {
      return `<div class="bub me">
        <div class="row" style="gap:6px">${[1, 2].map((n) => U.phItem(96, it.id + 'c' + n)).join('')}</div>
        <span class="when">${m.at} · 읽음</span></div>`;
    }
    return `<div class="bub${m.me ? ' me' : ''}">${U.esc(m.t)}
      <span class="when">${m.at}${m.read ? ' · 읽음' : ''}</span></div>`;
  };

  const 왼쪽 = `
  ${U.card('', `<div class="row-b wrap-row">
    <a class="row-c" style="gap:12px" href="${U.link('SE-04')}">
      ${U.phItem(56, it.id)}
      <span><b>${U.esc(it.t)}</b>
        <span class="row-c wrap-row mt1"><b class="price">${U.won(it.price)}</b>${U.stBadge(c.st)}</span></span>
    </a>
    <div class="btns">
      ${U.btn('예약중으로 바꾸기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="예약중으로 바꿨어요 · 목록에 배지가 붙습니다"' })}
      ${U.btn('안전결제로 거래하기', { href: 'PA-01', cls: 'btn-pri btn-sm' })}
    </div>
  </div>`)}

  <div class="talk-wrap mt-block">
    <div class="day-sep">9월 7일 (오늘)</div>
    ${TALK.map(말풍선).join('')}
    <div class="bub appt">
      <b>거래 약속</b>
      <div class="t-sub mt1">9월 8일 (화) 오후 7:00 · 역삼역 2번 출구 앞</div>
      <div class="btns mt2">
        <button class="btn btn-ghost btn-sm" type="button" data-toast="일정에 넣었어요">일정 추가</button>
        <a class="btn btn-ghost btn-sm" href="${U.link('CH-03')}">약속 바꾸기</a>
      </div>
      <span class="when">오후 2:24</span>
    </div>
  </div>

  <div class="chat-send mt3">
    <div class="chips mb2">
      ${['네고 가능할까요?', '지금 거래 되나요?', '직거래 어디서 할까요?', '안전결제 할게요']
      .map((t) => `<button class="chip" type="button" data-toast="입력칸에 「${t}」를 넣었어요">${t}</button>`).join('')}
    </div>
    <div class="searchbar">
      <button class="btn btn-quiet" type="button" data-modal="plus" aria-label="더하기">＋</button>
      <input class="in" type="text" placeholder="메시지를 적어 주세요">
      <button class="btn btn-pri btn-sm" type="button" data-toast="보냈어요">보내기</button>
    </div>
  </div>

  ${U.modal('plus', '무엇을 붙일까요', `<div class="stack-sm">
    <button class="radio" type="button" data-dismiss data-toast="사진을 골라 주세요">🖼 사진 보내기</button>
    <a class="radio" href="${U.link('CH-03')}">📅 거래 약속 잡기</a>
    <a class="radio" href="${U.link('PA-01')}">🛡 안전결제로 거래하기</a>
    <button class="radio" type="button" data-dismiss data-toast="제안 금액을 적어 주세요">💰 가격 제안하기</button>
  </div>`, U.btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' }))}
  `;

  const 오른쪽 = `
  ${U.userCard(u, { href: 'MY-01' })}

  <div class="mt-block">${U.card('이 거래', U.kv([
    ['물건', U.esc(it.t)],
    ['값', U.won(it.price)],
    ['상태', U.stBadge(c.st)],
    ['거래 방식', U.wayBadges(it.ways)],
  ]))}</div>

  <div class="mt-block">${U.banner('warn', '🛡', `<b>돈을 먼저 보내지 마세요</b>
    <div class="t-sub mt1">안전결제를 쓰면 물건을 받고 「받았어요」를 누른 뒤에 돈이 넘어갑니다.</div>`)}</div>

  <div class="mt-block">${U.card('', `
    ${U.btn('거래 약속 잡기', { href: 'CH-03', cls: 'btn-ghost btn-block' })}
    <div class="mt2">${U.btn('매물 보기', { href: 'SE-04', cls: 'btn-ghost btn-block' })}</div>
    <div class="mt2">${U.btn('채팅 목록으로', { href: 'CH-01', cls: 'btn-ghost btn-block' })}</div>
    <div class="mt4">
      <a class="link quiet" href="${U.link('CH-04')}">⚑ 신고·차단하기</a>
      <div class="mt2"><button class="link quiet" type="button" data-toast="알림을 껐어요" data-toast-act="되돌리기">🔕 알림 끄기</button></div>
      <div class="mt2"><button class="link quiet" type="button" data-modal="out">채팅방 나가기</button></div>
    </div>`)}</div>

  ${U.modal('out', '채팅방을 나갈까요?', `<p class="t-sub">나가면 <b>이 대화 기록이 지워지고</b> 되돌릴 수 없어요.
    상대는 계속 볼 수 있습니다.</p>`,
    U.btn('그냥 둘게요', { cls: 'btn-ghost', attr: ' data-dismiss' })
    + U.btn('나가기', { href: 'CH-01', cls: 'btn-pri' }))}
  `;
  return { body: U.detail2(왼쪽, 오른쪽), o: {} };
}

/* ---------------- CH-03 거래 약속 잡기 ---------------- */
function CH03() {
  const c = CHATS[0];
  const u = userBy(c.with);
  const it = itemBy(c.item);
  const 시간 = ['10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '18:30', '19:00', '19:30', '20:00', '21:00'];
  const 상대좋음 = ['18:30', '19:00', '19:30', '20:00'];

  const body = `
  ${U.pageHd('거래 약속 잡기', `${u.nick}님과 · ${U.esc(it.t)}`)}

  ${U.sec('① 언제 만날까요', U.card('', `
    ${U.chips(['오늘 (9/7)', '내일 (9/8)', '직접 고르기'], 1)}
    <p class="t-sub mt3">지난 날짜는 고를 수 없어요.</p>`))}

  ${U.sec('② 몇 시에', U.card('', `
    <div class="timegrid">
      ${시간.map((t) => `<button class="tchip${t === '19:00' ? ' on' : ''}${상대좋음.includes(t) ? ' ok' : ''}" type="button"
        data-toast="${t}로 정했어요">${t}</button>`).join('')}
    </div>
    <p class="t-sub mt3"><span class="dot-ok"></span> 표시된 시간은 ${u.nick}님이 「이때 좋아요」라고 알려온 시간이에요.</p>`))}

  ${U.sec('③ 어디서', U.card('', `
    ${U.chips(['안전거래존', '역삼역 2번 출구', '편의점 앞', '최근 장소'], 0)}
    <input class="input mt3" type="text" placeholder="직접 적기" value="역삼역 2번 출구 앞">
    <div class="mt4">${U.phMap('지도', 800, 400)}</div>
    <p class="t-sub mt2">나에게서 <b>1.2km</b> · ${u.nick}님에게서 <b>0.8km</b></p>`))}

  ${U.sec('안전거래존을 권해요', `<div class="stack-sm">
    ${SAFE_SPOTS.map((s) => `<div class="cond-row">
      <span class="grow"><b>${s.nm}</b><br><span class="t-sub">${s.d}</span></span>
      <span class="t-sub">${s.km}km</span>
      ${U.btn('여기로', { cls: 'btn-ghost btn-sm', attr: ` data-toast="${s.nm}로 정했어요"` })}
    </div>`).join('')}
  </div>
  <p class="t-sub mt3">CCTV가 있는 공공 장소예요. 처음 만나는 분과는 여기가 안심됩니다.</p>`)}

  ${U.banner('warn', '⚠', `<b>이 시간에 다른 약속이 있어요</b>
    <div class="t-sub mt1">9월 8일 오후 7시 · 「원목 책상」 거래 (해질녘님). 그래도 잡으시겠어요?</div>`,
    { right: U.btn('시간 바꾸기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="다른 시간을 골라 주세요"' }) })}

  <div class="mt-block">${U.card('상대에게 한마디', `
    <textarea class="input" rows="3" placeholder="예: 검은색 가방 들고 갈게요"></textarea>
    <label class="check mt3"><input type="checkbox" checked><span>약속 30분 전에 알려주세요</span></label>`)}</div>
  `;

  const 아래바 = U.stickBar(
    `<span class="t-sub">9월 8일 (화) 오후 7:00 · 역삼역 2번 출구 앞</span>`,
    U.btn('채팅으로 돌아가기', { href: 'CH-02', cls: 'btn-ghost' })
    + U.btn('약속 보내기', { href: 'CH-02', cls: 'btn-pri' }));

  return { body: U.article(body), o: { stick: 아래바 } };
}

/* ---------------- CH-04 신고·차단 ---------------- */
function CH04() {
  const c = CHATS[0];
  const u = userBy(c.with);
  const it = itemBy(c.item);

  const body = `
  ${U.pageHd('신고·차단', '무슨 일이 있었는지 알려 주시면 운영자가 확인합니다')}

  ${U.card('무엇을 신고하시나요', `<div class="row-c wrap-row" style="gap:16px">
    ${U.phAva(44, u.id)}
    <div><b>${u.nick}</b> ${U.manner(u.manner)}
      <p class="t-sub mt1">${U.esc(it.t)} · 이 대화</p></div>
  </div>`)}

  <div class="mt-block">${U.sec('① 무슨 일인가요', `<div class="stack-sm">
    ${REPORT_REASONS.map((r, i) => `<label class="radio${i === 0 ? ' on' : ''}">
      <input type="radio" name="why"${i === 0 ? ' checked' : ''}>
      <span class="ic">${r.ic}</span> <b>${r.k}</b></label>`).join('')}
  </div>`)}</div>

  <div class="sub-fld mt4">${U.card('사기가 의심돼요 — 무엇이 의심되나요', `
    ${['돈을 먼저 보내 달라고 해요', '바깥 링크로 결제하라고 해요', '값이 시세보다 너무 싸요',
    '같은 물건을 여러 곳에 올렸어요', '그 밖에'].map((k, i) =>
      `<label class="check"><input type="checkbox"${i === 0 ? ' checked' : ''}><span>${k}</span></label>`).join('')}`)}</div>

  <div class="mt-block">${U.card('② 자세히 적어 주세요', `
    <textarea class="input" rows="6" placeholder="언제 어떤 일이 있었는지 적어 주세요. 자세할수록 빨리 처리됩니다."></textarea>
    <p class="t-sub mt1 right">0 / 1000</p>`)}</div>

  <div class="mt-block">${U.card('③ 증거를 붙여 주세요 (있으면)', `
    <div class="photo-grid">
      <button class="photo-add" type="button" data-toast="캡처를 골라 주세요 (최대 5장)">
        <span style="font-size:22px">＋</span><span>캡처 추가</span></button>
      ${[1, 2].map((n) => `<div class="photo-cell">
        <button class="del" type="button" data-toast="첨부를 지웠어요" aria-label="첨부 지우기">✕</button>
        ${U.phItem(140, 'rep' + n)}</div>`).join('')}
    </div>
    <p class="t-sub mt3">대화 캡처를 붙여 주시면 확인이 훨씬 빨라요.</p>`)}</div>

  <div class="mt-block">${U.card('④ 이 사람을 차단할까요', `
    <label class="check"><input type="checkbox" checked data-unlock="blockinfo"><span><b>차단할게요</b></span></label>
    <div class="mt3" id="blockinfo">${U.box(`<b class="t-card">차단하면 이렇게 돼요</b>
      <ul class="dots t-sub mt2">
        <li>이 사람의 판매글이 내 목록에 안 보여요</li>
        <li>이 사람이 나에게 채팅을 걸 수 없어요</li>
        <li>이미 하던 대화는 읽기만 되고 보낼 수 없어요</li>
        <li><b>차단은 언제든 풀 수 있어요</b></li>
      </ul>`)}</div>`)}</div>

  <div class="mt-block">${U.box(`<b class="t-card">신고하면 이렇게 진행돼요</b>
    ${U.hsteps(['접수', '검토', '조치', '결과 알림'], 0)}
    <p class="t-sub mt3">평균 <b>6시간</b> 안에 처리하고, 결과는 알림으로 알려드려요.
    신고한 사실은 상대에게 알리지 않습니다.</p>`)}</div>

  <div class="mt-block">${U.banner('warn', '⚖', `<b>사실이 아닌 신고를 반복하면 제한될 수 있어요</b>
    <div class="t-sub mt1">신고는 사람의 계정을 막을 수 있는 일이라 신중하게 다룹니다.</div>`)}</div>
  `;

  const 아래바 = U.stickBar(
    `<span class="t-sub">사유를 고르면 신고할 수 있어요</span>`,
    U.btn('채팅으로 돌아가기', { href: 'CH-02', cls: 'btn-ghost' })
    + U.btn('신고하기', { cls: 'btn-pri', attr: ' data-toast="신고를 접수했어요 · 접수번호 R-2419 · 결과는 알림으로 알려드릴게요"' }));

  return { body: U.article(body), o: { stick: 아래바 } };
}

export const PAGES = { 'CH-01': CH01, 'CH-02': CH02, 'CH-03': CH03, 'CH-04': CH04 };
