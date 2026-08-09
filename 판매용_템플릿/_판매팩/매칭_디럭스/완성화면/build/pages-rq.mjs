/* RQ 요청서 — 서비스 고르기 / 단계별 질문 / 확인 / 완료 / 수정·취소
   이 서비스의 심장이다. "한 번에 한 질문씩" 이 원칙을 화면으로 지킨다. */
import * as U from './ui.mjs';
import { CATS, SUBCATS, PROS, PRO, REQ } from './data.mjs';

const STEPS = ['서비스', '상세 질문', '확인', '완료'];

/* ---------------- RQ-01 서비스 고르기 ---------------- */
function RQ01(ctx) {
  const subs = SUBCATS.move;

  const body = `
  ${U.stepbar(STEPS, 0)}
  <div class="page-hd"><h1 class="t-page">어떤 일을 맡기시겠어요?</h1>
    <p class="t-sub">분야를 고르면 그에 맞는 질문만 물어봐요. 3분이면 끝납니다.</p></div>

  <div class="searchbar lg mb6">
    <span class="ic">🔍</span>
    <input type="text" placeholder="서비스 이름으로 바로 찾기 (예: 에어컨 청소)">
    ${U.btn('찾기', { cls: 'btn-pri' })}
  </div>

  <div class="split-r">
    <div>
      <h2 class="t-sec mb3">분야를 골라 주세요</h2>
      <div class="cats">${CATS.map((c, i) =>
    `<button class="cat${i === 0 ? ' on' : ''}" type="button">
      <div class="ic">${c.ic}</div><div class="nm">${c.nm}</div><div class="sub">${c.sub}</div></button>`).join('')}</div>

      <div class="mt-block">${U.card('이사 — 어떤 이사인가요?', `
        <div class="col" style="gap:var(--sp-btn)">
          ${subs.map((s, i) => `<label class="radio-in box${i === 0 ? ' on' : ''}">
            <input type="radio" name="sub"${i === 0 ? ' checked' : ''}>
            <span class="grow">${s.nm}</span>
            ${s.hot ? U.badge('인기', 'b-acc') : ''}</label>`).join('')}
        </div>
        <p class="t-sub mt4">고른 분야에 따라 다음에 물어볼 질문이 달라져요.</p>`)}</div>

      ${U.sec('', U.banner('quiet', '🤔', `<b>어떤 걸 골라야 할지 모르겠어요</b>
        <div class="mt1">‘기타’를 고르고 하시려는 일을 그냥 적어 주세요. 저희가 분야를 정해 고수에게 전달합니다.</div>`,
    { right: U.btn('기타로 쓰기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="기타를 골랐어요. 다음 화면에서 자유롭게 적어 주세요"' }) }))}
    </div>

    <div class="sticky">
      ${U.card('고른 서비스', `
        <div class="row-c mb3"><span style="font-size:26px">📦</span>
          <div><b class="t-card">원룸·소형 이사</b><div class="t-sub">이사</div></div></div>
        ${U.kv([
      ['이 분야 고수', '<b>184명</b>'], ['보통 견적 범위', '<b>18~30만원</b>'], ['첫 견적 도착', '<b>평균 27분</b>'],
    ])}
        <div class="btns mt-block">${U.btn('다음 — 상세 질문', { href: 'RQ-02', cls: 'btn-pri btn-lg btn-block' })}</div>
        <p class="t-sub mt3 center">질문 7개 · 약 3분</p>`, { cls: 'pri' })}

      <div class="mt4">${U.box(`<h4 class="t-card mb2">최근 요청한 서비스</h4>
        <div class="col" style="gap:var(--sp-item)">
          ${[['입주 청소', '2026-08-01'], ['에어컨 설치', '2026-07-22'], ['프로필 촬영', '2026-07-01']]
      .map(([nm, at]) => `<a class="row-b" href="${U.link('RQ-02')}"><b>${nm}</b><span class="t-sub">${at}</span></a>`).join('')}
        </div>
        <p class="t-sub mt3">누르면 지난번에 쓴 답을 그대로 채워 드려요.</p>`, { cls: 'soft' })}</div>
    </div>
  </div>`;

  return { body, o: {} };
}

/* ---------------- RQ-02 요청서 작성 - 단계별 질문 ---------------- */
function RQ02(ctx) {
  const q = (n, tot, title, sub, body, o = {}) => `<div class="card"><div class="card-bd" style="padding:var(--s10)">
    <div class="row-b wrap-row mb4">
      <span class="t-sub">질문 <b class="pri" style="font-size:15px">${n}</b> / ${tot}</span>
      ${o.skip ? '<button class="link quiet" type="button" data-toast="이 질문을 건너뛰었어요">건너뛰기</button>' : `<span class="t-sub">${o.note || '필수'}</span>`}
    </div>
    <div class="progress mb6"><div class="fill" style="width:${Math.round(n / tot * 100)}%"></div></div>
    <h2 class="t-sec">${title}</h2>
    ${sub ? `<p class="t-sub mt2">${sub}</p>` : ''}
    <div class="mt-block">${body}</div>
    <div class="row-b mt-block">
      ${U.btn('‹ 이전', { href: 'RQ-01', cls: 'btn-ghost' })}
      ${U.btn(o.last ? '다 썼어요 — 확인하기' : '다음 ›', { href: o.last ? 'RQ-03' : 'RQ-03', cls: 'btn-pri btn-lg' })}
    </div>
  </div></div>`;

  const body = `
  ${U.stepbar(STEPS, 1)}
  <div class="page-hd"><h1 class="t-page">원룸·소형 이사</h1>
    <p class="t-sub">한 번에 하나씩만 여쭤볼게요. 답하기 어려운 건 건너뛰셔도 됩니다.</p></div>

  ${q(3, 7, '이사 유형을 골라 주세요', '짐 양에 따라 차량과 인원이 달라져요.', `
    <div class="g3">
      ${[['원룸', '6~10평 · 혼자 사는 집', true], ['가정', '20평 이상 · 가족이 사는 집', false], ['사무실', '책상·서류·집기가 많은 곳', false]]
    .map(([t, d, on]) => `<button class="radio${on ? ' on' : ''}" type="button" data-group="kind"><b>${t}</b><span class="d">${d}</span></button>`).join('')}
    </div>`)}

  <p class="t-sub mt6 mb3">— 아래는 질문 종류마다 어떻게 생겼는지 함께 보여 드리는 예시예요 —</p>

  ${q(4, 7, '언제 이사하시나요?', '날짜가 정해지지 않았으면 대략 고르셔도 돼요.', `
    <div class="split-r" style="grid-template-columns:minmax(0,1fr) 260px">
      <div>
        <div class="card"><div class="card-bd">
          <div class="row-b mb3 cal-hd">
            <button class="btn btn-ghost btn-xs cal-mv" type="button" data-mv="-1">‹</button>
            <b class="cal-m">2026년 8월</b>
            <button class="btn btn-ghost btn-xs cal-mv" type="button" data-mv="1">›</button>
          </div>
          <div class="cal-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center">
            ${['일', '월', '화', '수', '목', '금', '토'].map((d) => `<div class="t-sub" style="font-size:12px;padding:4px 0">${d}</div>`).join('')}
            ${Array.from({ length: 6 }, () => '<div></div>').join('')}
            ${Array.from({ length: 31 }, (_, i) => {
    const d = i + 1;
    const off = d < 7;
    const sel = d === 20;
    return `<button class="cal-d${off ? ' off' : ''}${sel ? ' sel' : ''}" type="button" data-why="지난 날짜는 고를 수 없어요"
      style="height:38px;border-radius:8px;border:1px solid ${sel ? 'var(--primary)' : 'transparent'};background:${sel ? 'var(--primary)' : 'transparent'};color:${sel ? '#fff' : (off ? 'var(--muted)' : 'var(--text)')};opacity:${off ? '.4' : '1'};cursor:pointer;font-family:inherit;font-size:14px;font-weight:${sel ? '700' : '400'}">${d}</button>`;
  }).join('')}
          </div>
        </div></div>
      </div>
      <div>
        <label class="lb">시작 시간</label>
        ${U.chips(['오전 (8~12시)', '오후 (12~18시)', '상관없어요'], 0)}
        <p class="t-sub mt4">고른 날짜<br><b style="font-size:16px;color:var(--text)">8월 20일 (목) 오전</b></p>
        <label class="check mt3"><input type="checkbox"><span class="t-sub">날짜를 아직 못 정했어요</span></label>
      </div>
    </div>`)}

  ${q(5, 7, '어디에서 어디로 옮기시나요?', '층수와 승강기 여부까지 알려주시면 견적이 정확해져요.', `
    <div class="field">
      <label class="lb">출발지<span class="req">*</span></label>
      <div class="inline mb2"><input class="input" value="서울 강남구 역삼동 123-45"><button class="btn btn-ghost none" type="button" data-toast="주소 검색 창이 열려요">주소 검색</button></div>
      <div class="row" style="gap:var(--s2)">
        <input class="input grow" placeholder="상세 주소 (동·호수)" value="302호">
        <select class="input none" style="width:120px"><option>3층</option><option>1층</option><option>2층</option></select>
        <select class="input none" style="width:150px"><option>승강기 없음</option><option>승강기 있음</option></select>
      </div>
    </div>
    <div class="field" style="margin-bottom:0">
      <label class="lb">도착지<span class="req">*</span></label>
      <div class="inline mb2"><input class="input" value="서울 송파구 잠실동 200-1"><button class="btn btn-ghost none" type="button" data-toast="주소 검색 창이 열려요">주소 검색</button></div>
      <div class="row" style="gap:var(--s2)">
        <input class="input grow" placeholder="상세 주소 (동·호수)" value="1203호">
        <select class="input none" style="width:120px"><option>12층</option></select>
        <select class="input none" style="width:150px"><option>승강기 있음</option></select>
      </div>
    </div>`)}

  ${q(6, 7, '예산은 어느 정도 생각하세요?', '적어 주시면 그 안에서 맞출 수 있는 고수만 견적을 보내요.', `
    ${U.chips(['10만원 이하', '10~20만원', '20~30만원', '30~50만원', '50만원 이상', '잘 모르겠어요'], 2)}
    <p class="t-sub mt4">이 지역 원룸 이사는 보통 <b class="pri">18~30만원</b>이에요. 예산을 적으면 터무니없는 값을 받는 일이 줄어요.</p>`,
    { skip: true })}

  ${q(7, 7, '짐 사진을 올려 주시겠어요?', '사진이 있으면 견적이 훨씬 정확해지고, 현장에서 값이 바뀌는 일이 줄어요.', `
    <div class="drop">
      <div class="ic">📷</div>
      <b>사진을 끌어다 놓거나 눌러서 고르세요</b>
      <p class="t-sub mt2">최대 10장 · 장당 10MB · JPG·PNG·HEIC</p>
      <div class="btns center mt4">${U.btn('사진 고르기', { cls: 'btn-ghost', attr: ' data-toast="사진 고르기 창이 열려요"' })}</div>
    </div>
    <div class="row mt4" style="gap:var(--s2)">
      ${[1, 2, 3].map((i) => `<div style="position:relative">${U.phFix(['짐 사진', 1200, 900], 108, { seed: 'up' + i })}
        <button class="btn btn-quiet btn-xs" type="button" style="position:absolute;top:4px;right:4px;background:rgba(0,0,0,.55);color:#fff" data-toast="사진을 뺐어요">✕</button></div>`).join('')}
    </div>
    <textarea class="input mt4" placeholder="따로 알려주실 게 있으면 적어 주세요">냉장고와 세탁기가 있고, 옷장은 분해가 필요합니다. 사다리차 필요할 것 같아요.</textarea>`,
    { skip: true, last: true })}

  <div class="mt-block">${U.banner('quiet', '💾', '작성 중인 내용은 자동으로 저장돼요. 창을 닫았다 다시 오셔도 이어서 쓸 수 있습니다.')}</div>`;

  return { body, o: { wrapCls: 'wrap-read' } };
}

/* ---------------- RQ-03 요청서 확인 ---------------- */
function RQ03(ctx) {
  const body = `
  ${U.stepbar(STEPS, 2)}
  <div class="page-hd"><h1 class="t-page">이대로 보낼까요?</h1>
    <p class="t-sub">고칠 곳이 있으면 오른쪽 ‘고치기’를 누르세요.</p></div>

  ${U.card('작성한 내용', `<div class="col" style="gap:0">
    ${REQ.answers.map(([k, v], i) => `<div class="row-b" style="padding:var(--s4) 0${i ? ';border-top:1px solid var(--border)' : ''}">
      <div class="grow"><div class="t-sub">${k}</div><div class="mt1">${U.esc(v)}</div></div>
      <a class="link" href="${U.link('RQ-02')}">고치기</a></div>`).join('')}
    <div class="row-b" style="padding:var(--s4) 0;border-top:1px solid var(--border)">
      <div class="grow"><div class="t-sub">사진</div>
        <div class="row mt2" style="gap:8px">${[1, 2, 3].map((i) => U.phFix(['짐 사진', 1200, 900], 72, { seed: 'up' + i })).join('')}</div></div>
      <a class="link" href="${U.link('RQ-02')}">고치기</a></div>
  </div>`)}

  <div class="mt-block">${U.banner('info', '📮', `<b>이 요청서는 조건에 맞는 고수 24명에게 전달돼요</b>
    <div class="t-sub mt1">비슷한 요청은 보통 <b>30분 안에</b> 첫 견적이 도착했어요. 견적은 48시간 동안 받습니다.</div>`)}</div>

  <div class="mt-block">${U.card('연락은 어떻게 받으시겠어요?', `
    <div class="col" style="gap:var(--sp-btn)">
      ${[['앱 알림', '견적이 오면 알림으로 알려드려요. 전화는 오지 않아요.', true],
    ['문자', '알림을 못 보실 것 같으면 문자로도 보내드려요.', true],
    ['전화', '고수가 직접 전화할 수 있어요. 급한 일이면 켜 두세요.', false]]
      .map(([t, d, on]) => `<label class="check box${on ? ' on' : ''}"><input type="checkbox"${on ? ' checked' : ''}>
        <span class="grow"><b>${t}</b><div class="t-sub mt1">${d}</div></span></label>`).join('')}
    </div>`)}</div>

  <div class="mt-block">${U.card('고수에게 전달되는 정보', `
    ${U.table([{ t: '항목', w: '30%' }, { t: '전달되는 값' }, { t: '언제', w: '26%' }], [
      ['이름', '김O늘 (성만 보여요)', '요청서를 보낼 때'],
      ['연락처', '가려짐 (010-****-5678)', '고수를 고른 뒤에 공개'],
      ['주소', '강남구 역삼동 (동까지)', '요청서를 보낼 때'],
      ['상세 주소', '가려짐', '고수를 고른 뒤에 공개'],
      ['요청 내용·사진', '전부', '요청서를 보낼 때'],
    ])}
    <p class="t-sub mt3">연락처와 상세 주소는 고수를 고르기 전까지 공개되지 않아요.</p>
    <label class="check box mt4" data-unlock="send"><input type="checkbox">
      <span><b>위 항목이 고수에게 전달되는 것에 동의해요</b>
      <div class="t-sub mt1">동의하지 않으시면 요청서를 보낼 수 없어요. (필수)</div></span></label>`, { bdCls: '' })}</div>

  <div class="btns col mt-block">
    ${U.btn('요청서 보내기', { cls: 'btn-pri btn-lg btn-block is-off', id: 'send', off: true })}
    <p class="t-sub center">보낸 뒤에도 견적이 오기 전까지는 자유롭게 고칠 수 있어요.</p>
  </div>`;

  return { body, o: { wrapCls: 'wrap-read' } };
}

/* ---------------- RQ-04 요청 완료 ---------------- */
function RQ04(ctx) {
  const body = `
  ${U.stepbar(STEPS, 3)}
  <div class="center" style="padding:var(--s10) 0 var(--s8)">
    <div style="font-size:56px;color:var(--success)">✓</div>
    <h1 class="t-page mt3">요청서를 보냈어요</h1>
    <p class="t-sub mt2">요청 번호 <b style="color:var(--text)">${REQ.no}</b></p>
  </div>

  ${U.card('', `<div class="row-b wrap-row">
    <div><div class="big">24명</div><div class="t-sub">조건에 맞는 고수에게 전달</div></div>
    <div><div class="big">약 30분</div><div class="t-sub">첫 견적이 오기까지</div></div>
    <div><div class="big">48시간</div><div class="t-sub">견적 받는 기간</div></div>
  </div>`, { cls: 'pri' })}

  <div class="mt-block">${U.banner('info', '🔔', `<b>견적이 오는 대로 알림으로 알려드릴게요</b>
    <div class="t-sub mt1">앱 알림과 문자를 켜 두셨어요. 바꾸시려면 알림 설정에서 언제든 고칠 수 있어요.</div>`,
    { right: U.btn('알림 설정', { cls: 'btn-ghost btn-sm', attr: ' data-toast="알림 설정 화면은 프리미엄(3뎁스)에 들어 있어요"' }) })}</div>

  ${U.sec('기다리는 동안 — 조건에 맞는 고수예요', `<div class="pro-g2">${[PRO('p1'), PRO('p3'), PRO('p7'), PRO('p2')].map((p) =>
    U.proCard(p, { why: '조건 맞음' })).join('')}</div>`,
    { desc: '이 고수들에게도 요청서가 갔어요. 미리 프로필을 보고 계셔도 좋아요.' })}

  <div class="btns col mt-block">
    ${U.btn('내 요청 보기', { href: 'MY-01', cls: 'btn-pri btn-lg btn-block' })}
    <div class="row-c center mt2" style="justify-content:center;gap:var(--s5)">
      <a class="link" href="${U.link('QT-01')}">받은 견적 보기</a>
      <a class="link quiet" href="${U.link('RQ-05')}">요청서 다시 보기 · 수정</a>
    </div>
  </div>

  <p class="t-sub center mt-block">마음이 바뀌면 <a class="link quiet" href="${U.link('RQ-05')}">요청을 취소</a>할 수 있어요. 견적이 오기 전에는 아무 일도 생기지 않습니다.</p>`;

  return { body, o: { wrapCls: 'wrap-read' } };
}

/* ---------------- RQ-05 요청 수정·취소 ---------------- */
function RQ05(ctx) {
  const body = `
  ${U.pageHd('요청서 수정·취소', `${REQ.no} · ${REQ.svc}`)}

  ${U.banner('warn', '📬', `<b>이미 견적 3개를 받으셨어요</b>
    <div class="t-sub mt1">내용을 고치면 고수들에게 다시 전달되고, <b>이미 받은 견적 3개는 그대로 남아요.</b>
    다만 고수가 값을 다시 매길 수 있습니다.</div>`)}

  <div class="mt-block">${U.card('작성한 내용', `<div class="col" style="gap:0">
    ${REQ.answers.map(([k, v], i) => `<div class="row-b" style="padding:var(--s4) 0${i ? ';border-top:1px solid var(--border)' : ''}">
      <div class="grow"><div class="t-sub">${k}</div><div class="mt1">${U.esc(v)}</div></div>
      <a class="link" href="${U.link('RQ-02')}">고치기</a></div>`).join('')}
  </div>`, { aside: U.btn('수정 내용 다시 보내기', { cls: 'btn-pri btn-sm', attr: ' data-toast="고친 내용을 고수 24명에게 다시 보냈어요"' }) })}</div>

  <div class="mt-block">${U.card('요청 취소', `
    <p class="t-sub mb4">더 이상 필요 없어지셨다면 취소하실 수 있어요. 왜 취소하시는지 알려 주시면 다음에 더 잘 맞춰 드릴게요.</p>
    <label class="lb">취소 사유</label>
    <div class="col mb6" style="gap:var(--sp-btn)">
      ${['다른 곳에서 해결했어요', '일정이 바뀌었어요', '생각보다 비싸요', '기타']
    .map((t, i) => `<label class="radio-in box"><input type="radio" name="why"><span>${t}</span></label>`).join('')}
    </div>
    <textarea class="input mb6" placeholder="더 알려 주실 내용이 있으면 적어 주세요 (선택)"></textarea>

    ${U.banner('dan', '⚠️', `<b>취소하면 받은 견적 3개가 모두 사라지고 되돌릴 수 없어요</b>
      <div class="t-sub mt1">같은 내용으로 다시 요청하시려면 요청서를 처음부터 새로 써야 합니다.</div>`)}

    <div class="btns mt-block">
      ${U.btn('요청 취소하기', { cls: 'btn-danger', attr: ' data-modal="mCancel"' })}
      ${U.btn('그냥 두기', { href: 'MY-01', cls: 'btn-ghost' })}
    </div>`, { cls: 'tape' })}</div>

  ${U.sec('취소 확인 창은 이렇게 생겼어요', U.modalStatic('요청을 취소할까요?', `
    <p><b>${REQ.svc}</b> · ${REQ.no}</p>
    <div class="mt4">${U.banner('dan', '⚠️', '받은 견적 <b>3개</b>가 모두 사라지고 되돌릴 수 없어요.')}</div>
    <div class="mt4">${U.kv([
      ['취소 사유', '일정이 바뀌었어요'],
      ['사라지는 견적', '3개 (19.8만 ~ 26.5만원)'],
      ['고수에게', '자동으로 안내가 갑니다'],
    ])}</div>
    <label class="check box mt4"><input type="checkbox"><span>위 내용을 확인했어요</span></label>`,
    `<span class="btn btn-ghost">그냥 두기</span><span class="btn btn-danger">취소하기</span>`),
    { desc: '누르면 화면 위에 이 창이 뜹니다.' })}

  ${U.modal('mCancel', '요청을 취소할까요?', `
    <p><b>${REQ.svc}</b> · ${REQ.no}</p>
    <div class="mt4">${U.banner('dan', '⚠️', '받은 견적 <b>3개</b>가 모두 사라지고 되돌릴 수 없어요.')}</div>
    <label class="check box mt4"><input type="checkbox"><span>위 내용을 확인했어요</span></label>`,
    `<button class="btn btn-ghost" type="button" data-dismiss>그냥 두기</button>
     <a class="btn btn-danger" href="${U.link('MY-01')}">취소하기</a>`)}

  <div class="btns center mt-block">
    ${U.btn('내 요청으로', { href: 'MY-01', cls: 'btn-ghost' })}
    ${U.btn('받은 견적 보기', { href: 'QT-01', cls: 'btn-ghost' })}
  </div>`;

  return { body, o: { wrapCls: 'wrap-read' } };
}

export const PAGES = { 'RQ-01': RQ01, 'RQ-02': RQ02, 'RQ-03': RQ03, 'RQ-04': RQ04, 'RQ-05': RQ05 };
