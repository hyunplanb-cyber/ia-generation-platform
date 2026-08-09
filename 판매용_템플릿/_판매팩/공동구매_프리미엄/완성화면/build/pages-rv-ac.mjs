/* RV 후기·문의·알림 11장 · AC 계정 11장 */
import {
  ph, phAva, phFix, btn, badge, stBadge, chips, tabs, sec, card, banner, empty, table, kv,
  gauge, countdown, dealCards, leftText, review, rateSummary, rateIn, accordion,
  toastNow, modalNow, timeline, stepbar,
  pageHd, detail2, myPage, soloBox, hsteps, num, won, esc, link, off,
} from './ui.mjs';
import { DEALS, dealById, pctOf, REVIEWS, RATE_DIST, QNAS, CATS } from './data.mjs';

/* ── RV-01 후기 작성·목록 ─────────────────────────────
   v: 'form' 작성 폼 · 'done' 작성 완료 · 'photo' 포토후기 필터 */
function rv01(ctx, v) {
  const d = dealById('d1');
  const photoOnly = v === 'photo';
  const list = photoOnly ? REVIEWS.filter((r) => r.photo) : REVIEWS;

  /* 작성 완료 */
  if (v === 'done') {
    const body = `
    ${pageHd('후기', esc(d.nm))}
    <div class="box center mt6">
      <div style="font-size:40px">🎉</div>
      <h1 class="t-page mt2">후기를 올렸어요</h1>
      <p class="t-sub mt2">사진 2장과 함께 올려 주셔서 <b>3,000원 쿠폰</b>을 드렸습니다.</p>
      <div class="row wrap-row mt4" style="gap:0;justify-content:center">
        <div class="stat"><div class="n">3,000원</div><div class="l">받은 쿠폰</div></div>
        <div class="stat"><div class="n">8건</div><div class="l">내가 쓴 후기</div></div>
        <div class="stat"><div class="n">142명</div><div class="l">도움돼요 받은 수</div></div>
      </div>
    </div>

    ${card('올리신 후기', `${review({
      who: '김하늘', r: 5, at: '2026-08-06', opt: '5kg (특대과)', photo: true,
      t: '마트에서 사는 것보다 확실히 큽니다. 껍질도 잘 까지고 신맛이 거의 없어요. 배송도 이틀 만에 왔습니다. 다음에 또 열리면 참여합니다.',
    }, { deal: false, act: false })}
      <div class="row mt3" style="gap:8px">
        ${btn('고치기', { cls: 'btn-ghost btn-sm', href: 'RV0102' })}
        <button class="btn btn-ghost btn-sm" type="button" data-toast="후기를 지웠어요">지우기</button>
      </div>`, { cls: 'mt6' })}

    ${card('받으신 쿠폰', `<div class="coupon">
      <div class="amt"><div class="v">3,000</div><div class="t-sub">원</div></div>
      <div class="bd"><b>포토 후기 감사 쿠폰</b>
        <p class="t-sub mt1">받은 날부터 30일 안에 쓰실 수 있습니다 · 최소 주문 금액 없음</p>
        <div class="t-sub mt1">2026년 9월 5일까지</div></div>
    </div>`, { cls: 'mt6', ft: btn('쿠폰함 보기', { cls: 'btn-ghost btn-block btn-sm', href: 'AC-02' }) })}

    ${banner('acc', '✍️', `<b>후기를 안 쓰신 공구가 1건 더 있어요.</b>
      <p class="t-sub">「동결건조 닭가슴살 트릿」 — 7월 23일에 받으셨습니다.</p>`,
      { cls: 'mt6', right: btn('이어서 쓰기', { cls: 'btn-accent btn-sm', href: 'RV0102' }) })}

    <div class="btns mt6 center">
      ${btn('후기 목록 보기', { cls: 'btn-primary btn-lg', href: 'RV-01' })}
      ${btn('내 공구함으로', { cls: 'btn-ghost btn-lg', href: 'MY-01' })}
    </div>`;
    return { body, o: { state: '후기 등록 완료 · 3,000원 쿠폰 지급', after: toastNow('후기를 올렸어요. 3,000원 쿠폰을 드렸습니다', { ok: true, act: '쿠폰함' }) } };
  }

  const main = `
    ${card('후기 쓰기', `<div class="row wrap-row mb4" style="gap:16px">
      ${phFix(['상품 사진', 1000, 1000], 88, { seed: d.id })}
      <div class="grow"><b>${esc(d.nm)}</b>
        <div class="t-sub mt1">5kg (특대과 12~14과) · 1개 · 2026년 8월 3일 받음</div></div>
    </div>
    <div class="hr"></div>
    ${rateIn('상품은 어떠셨나요?', v === 'form' ? 5 : 0)}
    ${v === 'form' ? `${rateIn('크기·양은?', 4)}${rateIn('배송은?', 5)}` : ''}
    <div class="field mt4"><label class="label">사진·동영상 (선택)</label>
      <div class="upload" style="padding:22px">
        <div class="ico">📷</div><b>사진을 끌어다 놓으세요</b>
        <p class="t-sub">JPG·PNG·MP4 · 최대 5개 · 사진 후기는 3,000원 쿠폰을 드립니다</p>
        ${btn('사진 고르기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="파일 선택 창이 열려요"' })}
      </div>
      <div class="row mt3" style="gap:8px">${[1, 2].map((i) => `<div style="position:relative">${phFix(['후기 사진', 1000, 1000], 80, { seed: 'up' + i })}
        <button class="btn btn-ghost btn-sm" type="button" data-toast="사진을 뺐어요" style="position:absolute;top:-6px;right:-6px;padding:0 7px">✕</button></div>`).join('')}</div>
    </div>
    <div class="field"><label class="label">후기 내용</label>
      <textarea class="textarea" rows="5" placeholder="어떤 점이 좋았는지, 아쉬웠는지 적어 주세요. 다음 분들께 큰 도움이 됩니다.">${v === 'form' ? '마트에서 사는 것보다 확실히 큽니다. 껍질도 잘 까지고 신맛이 거의 없어요. 배송도 이틀 만에 왔습니다. 다음에 또 열리면 참여합니다.' : ''}</textarea>
      <p class="${v === 'form' ? 'ok' : 'hint'}">${v === 'form' ? '68자 — 쿠폰 지급 조건을 채웠습니다' : '20자 이상 쓰시면 쿠폰이 지급됩니다'}</p></div>
    <div class="field"><label class="label">또 사실 건가요?</label>
      ${chips(['꼭 다시 살래요', '괜찮으면 살래요', '한 번이면 충분해요'], 0)}</div>
    ${v === 'form' ? `<div class="field"><label class="label">이 후기가 도움이 될 분들</label>
      ${chips(['처음 사는 분', '많이 드시는 집', '선물용', '아이 있는 집'], [0, 2])}</div>` : ''}
    <div class="row-b mt4">
      <label class="check" style="padding:0"><input type="checkbox"><span>닉네임을 가리고 올리기</span></label>
      ${v === 'form'
    ? btn('후기 올리기', { cls: 'btn-primary', href: 'RV0103' })
    : btn('후기 쓰러 가기', { cls: 'btn-primary', href: 'RV0102' })}
    </div>`)}

    ${card('후기', `${rateSummary(d.rate, RATE_DIST)}
      <div class="row-b mt4 wrap-row">
        ${tabs([{ label: '전체', go: 'RV0101' }, { label: '포토 후기', go: 'RV0104' }, '5점', '3점 이하'], photoOnly ? 1 : 0, { pill: true })}
        <select class="select" style="width:150px"><option>최신순</option><option>도움돼요순</option><option>별점 높은순</option></select>
      </div>
      ${photoOnly ? `<div class="gal gal-6 mt4">
        ${Array.from({ length: 12 }, (_, i) => ph(['후기 사진', 1000, 1000], { seed: 'pf' + i, tiny: true })).join('')}
      </div>
      <p class="t-sub mt3">사진이 있는 후기 <b>128개</b> · 전체 후기 412개 중 31%</p>` : ''}
      <div class="mt4">${list.map((r) => `${review(r, { deal: false })}
        ${r.photo ? `<div class="box" style="margin:-8px 0 20px 48px"><div class="row" style="gap:8px">${badge('진행자', 'b-pri')}<b>${esc(d.host)}</b><span class="t-sub">${r.at}</span></div>
          <p class="t-sub mt2">좋게 봐 주셔서 고맙습니다. 다음 회차는 9월 초에 열 예정이니 알림 걸어 두시면 알려드릴게요.</p></div>` : ''}`).join('')}</div>`,
    { cls: 'mt6', ft: btn('후기 더 보기', { cls: 'btn-ghost btn-block btn-sm', attr: ' data-toast="후기 20개를 더 불러왔어요"' }) })}`;

  const aside = card('후기 쓰면 좋은 점', `<div class="coupon">
      <div class="grow"><b>포토 후기 3,000원</b><p class="t-sub">사진 1장 이상 + 20자 이상</p></div>
      <div class="per">3천</div>
    </div>
    <div class="coupon mt2">
      <div class="grow"><b>일반 후기 1,000원</b><p class="t-sub">20자 이상</p></div>
      <div class="per">1천</div>
    </div>
    <div class="hr"></div>
    <b>이렇게 써 주시면 좋아요</b>
    <ul class="t-sub mt2" style="padding-left:18px;line-height:1.9">
      <li>사진은 실제 받으신 상태 그대로</li>
      <li>크기·양이 생각과 같았는지</li>
      <li>배송이 얼마나 걸렸는지</li>
      <li>아쉬웠던 점도 솔직하게</li>
    </ul>
    <div class="hr"></div>
    <p class="t-sub">광고·욕설·개인정보가 담긴 후기는 알림 없이 지워질 수 있습니다.</p>`);

  const body = `${pageHd('후기', esc(d.nm))}<div class="mt6">${detail2(main, aside)}</div>`;
  const st = { form: '후기 작성 중 · 별점 5점 · 사진 2장', photo: '포토 후기만 보기 · 128개' }[v];
  return { body, o: { wrapCls: 'wrap wrap-full', state: st } };
}

/* ── RV-02 상품 문의(Q&A) ─────────────────────────────
   v: 'form' 문의 작성 폼 · 'private' 비공개 문의 · 'answered' 답변 완료 */
function rv02(ctx, v) {
  const d = dealById('d1');
  const writing = v === 'form';
  const priv = v === 'private';
  const list = v === 'answered' ? QNAS.filter((q) => q.a) : QNAS;
  const main = `
    ${card(writing ? '문의 작성' : '문의하기', `<div class="field-row">
      <div class="field grow"><label class="label">문의 유형</label>
        <select class="select"><option>상품</option><option${writing ? ' selected' : ''}>배송</option><option${writing ? '' : ' selected'}>성사·환불</option><option>참여·결제</option><option>기타</option></select></div>
      <div class="field grow"><label class="label">관련 공구</label>
        <select class="select"><option selected>${esc(d.nm)}</option><option>내가 참여한 다른 공구</option></select></div>
    </div>
    <div class="field"><label class="label">제목</label><input class="input" placeholder="무엇이 궁금하신가요?"${writing ? ' value="제주도도 배송되나요? 추가 배송비가 있는지 궁금합니다"' : ''}></div>
    <div class="field"><label class="label">내용</label>
      <textarea class="textarea" rows="4" placeholder="자세히 적어 주시면 답이 빨라집니다">${writing ? '제주 서귀포에 살고 있습니다. 산지가 제주인데 제주로 배송하면 배송비가 더 붙는지 궁금합니다. 붙는다면 얼마인지도 알려주세요.' : ''}</textarea>
      ${writing ? '<p class="hint">사진을 붙이시면 더 정확한 답을 받으실 수 있습니다</p>' : ''}</div>
    ${writing ? `<div class="field"><label class="label">사진 (선택)</label>
      <div class="upload" style="padding:18px"><b>사진을 끌어다 놓으세요</b>
        <p class="t-sub">JPG·PNG · 최대 3개</p></div></div>` : ''}
    <div class="row-b mt3">
      <label class="check" style="padding:0"><input type="checkbox"${priv ? ' checked' : ''}><span>비공개로 묻기 (진행자와 나만 봅니다)</span></label>
      ${writing
    ? btn('문의 올리기', { cls: 'btn-primary', attr: ' data-toast="문의를 올렸어요. 보통 하루 안에 답이 옵니다" data-toast-kind="ok"' })
    : btn('문의 작성하기', { cls: 'btn-primary', href: 'RV0202' })}
    </div>
    ${priv ? `<div class="box mt4"><b>비공개 문의는 이렇게 보입니다</b>
      <p class="t-sub mt1">다른 분들에게는 제목이 <b>🔒 비공개 문의입니다</b>로만 보이고, 내용과 답변은 보이지 않습니다.
      진행자와 작성자만 볼 수 있고, 고객센터가 분쟁을 처리할 때에 한해 함께 봅니다.</p></div>` : ''}`)}

    ${card('많이 묻는 것', accordion([
    { q: '성사가 안 되면 결제한 돈은 어떻게 되나요?', a: '자동으로 전액 환불됩니다. 마감 직후 바로 환불이 걸리고, 카드사에 따라 2~5영업일 안에 들어옵니다.' },
    { q: '언제 받을 수 있나요?', a: `성사 확정 후 ${esc(d.ship)}입니다. 발송되면 송장번호를 알림으로 보내드립니다.` },
    { q: '옵션을 바꾸고 싶어요', a: '마감 전에는 참여를 취소하고 다시 참여하시면 됩니다. 취소 수수료는 없습니다.' },
  ], 0), { cls: 'mt6' })}

    <div class="row-b mt6 wrap-row">
      ${tabs([{ label: '전체', cnt: 48, go: 'RV0201' }, { label: '답변 완료', cnt: 44, go: 'RV0204' }, { label: '답변 대기', cnt: 4 }], v === 'answered' ? 1 : 0)}
      <div class="row" style="gap:8px">
        <input class="input" style="width:200px" placeholder="문의 검색">
        <button class="toggle" type="button" data-toast="내 문의만 보고 있어요">내 문의만</button>
      </div>
    </div>

    ${v === 'answered' ? banner('ok', '💬', `<b>진행자가 답한 문의만 모았습니다.</b>
      <p class="t-sub">평균 6시간 안에 답이 옵니다. 답변률 97%.</p>`, { cls: 'mt4' }) : ''}

    <div class="mt4">
      ${priv ? `<div class="card mt3"><div class="card-bd">
        <div class="row-b wrap-row"><div class="row" style="gap:10px">${phAva(34, 'me')}
          <div><b>🔒 비공개 문의입니다</b><div class="t-sub">김하*  · 2026-08-04 · 배송</div></div></div>
          ${badge('나만 보임', 'b-pri')}</div>
        <div class="box mt3"><p><b>제주도도 배송되나요? 추가 배송비가 있는지 궁금합니다</b></p>
          <p class="t-sub mt2">제주 서귀포에 살고 있습니다. 산지가 제주인데 제주로 배송하면 배송비가 더 붙는지 궁금합니다.</p></div>
        <div class="box mt3"><div class="row" style="gap:8px">${badge('진행자', 'b-pri')}<b>${esc(d.host)}</b><span class="t-sub">2026-08-04</span></div>
          <p class="mt2">제주는 항공 운송이라 3,000원이 붙습니다. 다만 서귀포 안에서는 직접 가져다 드리기도 하니, 성사되면 따로 연락드리겠습니다.</p></div>
        <p class="t-sub mt3">이 문의는 작성자와 진행자만 볼 수 있습니다.</p>
      </div></div>
      <div class="card mt3"><div class="card-bd">
        <div class="row-b wrap-row"><div class="row" style="gap:10px">${phAva(34, 'x')}
          <div><b>🔒 비공개 문의입니다</b><div class="t-sub">이준* · 2026-08-04</div></div></div>
          ${badge('비공개', 'b-mut')}</div>
        <p class="t-sub mt3">작성자와 진행자만 볼 수 있는 문의입니다.</p>
      </div></div>` : ''}
      ${list.map((q) => `<div class="card mt3"><div class="card-bd">
      <div class="row-b wrap-row"><div class="row" style="gap:10px">${phAva(34, q.who)}
        <div><b>${esc(q.q)}</b><div class="t-sub">${esc(q.who)} · ${q.at} · ${q.kind}</div></div></div>
        ${stBadge(q.st)}</div>
      ${q.a ? `<div class="box mt3"><div class="row" style="gap:8px">${badge('진행자', 'b-pri')}<b>${esc(d.host)}</b><span class="t-sub">${q.at}</span></div>
        <p class="mt2">${esc(q.a)}</p></div>`
      : `<div class="box mt3"><p class="t-sub">아직 답변이 달리지 않았습니다. 보통 하루 안에 답이 옵니다.</p></div>`}
      <div class="row mt3" style="gap:8px">
        <button class="btn btn-ghost btn-sm" type="button" data-toast="궁금해요를 눌렀어요">🙋 나도 궁금해요</button>
        ${q.a ? '<button class="btn btn-ghost btn-sm" type="button" data-toast="도움이 됐다고 표시했어요">👍 도움돼요</button>' : ''}
        <button class="btn btn-ghost btn-sm" type="button" data-toast="신고를 접수했어요">신고</button>
      </div></div></div>`).join('')}</div>`;

  const aside = card('내 문의', `${[['성사가 안 되면 결제한 돈은?', '답변 완료'], ['제주도 배송되나요?', '답변 대기']]
    .map(([t, st]) => `<div class="row-b" style="padding:10px 0"><span class="grow">${t}</span>${badge(st, st === '답변 완료' ? 'b-ok' : 'b-warn')}</div>`).join('')}
    <div class="hr"></div>
    ${kv([['진행자 평균 답변 시간', '6시간'], ['답변률', '97%']])}
    <div class="box mt3"><p class="t-sub">답변이 달리면 앱 알림으로 알려드립니다. 알림이 꺼져 있으면 못 받으실 수 있어요.</p></div>
    <div class="btns mt3">${btn('알림 설정', { cls: 'btn-ghost btn-block btn-sm', href: 'AC-03' })}</div>
    ${btn('고객센터에 문의', { cls: 'btn-ghost btn-block btn-sm', href: 'CS-02' })}`);

  const body = `${pageHd('상품 문의', esc(d.nm))}<div class="mt6">${detail2(main, aside)}</div>`;
  const st = { form: '문의 작성 중', private: '비공개 문의 — 진행자와 나만 보임', answered: '답변 완료 44건만 보기' }[v];
  return { body, o: { wrapCls: 'wrap wrap-full', state: st } };
}

/* ── RV-03 관심 공구·알림함 ───────────────────────────
   v: 'alarm' 알림함 탭 · 'empty' 빈 상태 */
function rv03(ctx, v) {
  const liked = DEALS.slice(0, 3);
  const alarms = [
    ['성사', '「독일산 스테인리스 냄비 3종 세트」가 성사됐어요', '2시간 전', 'b-ok', 'DE-03'],
    ['마감 임박', '「병풀 진정 앰플」이 21분 뒤 마감돼요', '4시간 전', 'b-danger', 'DE-01'],
    ['환불', '「겨울 기모 맨투맨」 환불이 완료됐어요', '어제', 'b-mut', 'MY-02'],
    ['배송', '「동결건조 닭가슴살」이 발송됐어요 (한진 640123456789)', '2일 전', 'b-acc', 'MY-02'],
    ['재오픈', '찜하신 「제주 한라봉」이 다시 열렸어요', '3일 전', 'b-pri', 'DE-01'],
  ];

  /* 빈 상태 — 담아 둔 것도, 받은 알림도 없을 때 */
  if (v === 'empty') {
    const body = myPage('RV-03', `${pageHd('관심 공구·알림')}
      ${tabs([{ label: '관심 공구', cnt: 0, go: 'RV0301' }, { label: '오픈 예정 알림', cnt: 0 }, { label: '알림 내역', cnt: 0, go: 'RV0302' }], 0)}

      ${empty('♡', '아직 담아 두신 공구가 없어요',
      '마음에 드는 공구의 하트를 누르면 여기에 모입니다. 달성률이 90%를 넘거나 마감이 가까워지면 알려드릴게요.',
      `${btn('공구 둘러보기', { cls: 'btn-primary btn-lg', href: 'HO-02' })}${btn('마감 임박 보기', { cls: 'btn-ghost btn-lg', href: 'HO-03' })}`)}

      ${card('담아 두면 이런 걸 알려드려요', `<div class="g3">
        ${[['달성률 90% 돌파', '곧 성사될 공구를 놓치지 않게'],
        ['마감 3시간 전', '마지막으로 한 번 더'],
        ['가격 단계 하락', '더 싸졌을 때 바로']]
        .map(([t, s]) => `<div class="box"><b>${t}</b><p class="t-sub mt2">${s}</p></div>`).join('')}
      </div>`, { cls: 'mt6' })}

      <div class="mt8">${sec('많이 담아 두신 공구', dealCards(DEALS.slice(0, 4), pctOf, { cls: 'stair' }), { more: 'HO-02' })}</div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '관심 공구 0건 · 알림 0건' } };
  }

  /* 알림함 탭 */
  if (v === 'alarm') {
    const body = myPage('RV-03', `${pageHd('관심 공구·알림')}
      ${tabs([{ label: '관심 공구', cnt: 3, go: 'RV0301' }, { label: '오픈 예정 알림', cnt: 2 }, { label: '알림 내역', cnt: 5 }], 2)}

      ${card('알림함', `<div class="row-b mb4 wrap-row">
        <div class="row" style="gap:8px">${chips(['전체', '성사·불발', '마감 임박', '배송', '혜택'], 0)}</div>
        <div class="row" style="gap:8px">
          <span class="t-sub">읽지 않은 알림 2개</span>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="모두 읽음으로 바꿨어요">모두 읽음</button>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="읽은 알림을 지웠어요">읽은 알림 지우기</button>
        </div>
      </div>
      ${[
      ['오늘', [
        ['성사', '「독일산 스테인리스 냄비 3종 세트」가 성사됐어요. 확정가 98,000원.', '2시간 전', 'b-ok', 'DE-03', false],
        ['마감 임박', '「병풀 진정 앰플」이 21분 뒤 마감돼요. 14명이면 성사됩니다.', '4시간 전', 'b-danger', 'DE-01', false],
      ]],
      ['어제', [
        ['환불', '「겨울 기모 맨투맨」 환불이 완료됐어요. 29,900원.', '어제 14:22', 'b-mut', 'DE0403', true],
        ['가격', '「제주 한라봉」 가격이 24,900원 → 21,900원으로 내려갔어요.', '어제 09:10', 'b-pri', 'DE0105', true],
      ]],
      ['이번 주', [
        ['배송', '「동결건조 닭가슴살」이 발송됐어요 (한진 640123456789).', '2일 전', 'b-acc', 'MY0204', true],
        ['재오픈', '찜하신 「제주 한라봉」이 다시 열렸어요.', '3일 전', 'b-pri', 'DE-01', true],
        ['혜택', '후기 쓰고 받은 3,000원 쿠폰이 7일 뒤 만료됩니다.', '4일 전', 'b-warn', 'AC-02', true],
      ]],
    ].map(([g, items]) => `<div class="gl t-sub" style="font-weight:500;margin:16px 0 4px">${g}</div>
        ${items.map(([k, t, at, cls, go, read]) => `<a class="list-row" href="${link(go)}" style="${read ? 'opacity:.62' : ''}">
          <span class="nowrap">${badge(k, cls)}</span>
          <div class="grow">${t}${read ? '' : ' <b>·</b>'}</div>
          <span class="t-sub nowrap">${at}</span></a>`).join('')}`).join('')}`,
      { cls: 'mt4', ft: btn('알림 설정 바꾸기', { cls: 'btn-ghost btn-block btn-sm', href: 'AC-03' }) })}

      ${banner('mut', '🔔', `<b>알림이 너무 많나요?</b>
        <p class="t-sub">받고 싶은 것만 고르실 수 있고, 밤에는 안 보내도록 해 둘 수도 있습니다.</p>`,
      { cls: 'mt6', right: btn('방해 금지 설정', { cls: 'btn-ghost btn-sm', href: 'AC0302' }) })}`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '알림함 탭 · 읽지 않음 2건' } };
  }

  const main = `
    ${tabs([{ label: '관심 공구', cnt: 3 }, { label: '오픈 예정 알림', cnt: 2 }, { label: '알림 내역', cnt: 5, go: 'RV0302' }], 0)}

    ${card('관심 공구', liked.map((d) => `<div class="list-row">
      ${phFix(['상품 사진', 1000, 1000], 96, { seed: d.id })}
      <div class="grow">
        <div class="row wrap-row" style="gap:6px">${badge(off(d.was, d.now) + '%', 'b-acc')}${countdown(d.left)}
          ${pctOf(d) >= 95 ? badge('곧 성사!', 'b-ok') : ''}</div>
        <b class="mt1" style="display:block">${esc(d.nm)}</b>
        <div class="mt2" style="max-width:360px">${gauge(pctOf(d))}</div>
        <div class="t-sub mt1">${num(d.joined)}명 참여 · 담아 두신 뒤 ${num(d.joined - 40)}명 늘었어요</div>
      </div>
      <div class="right nowrap">${btn('참여하기', { cls: 'btn-primary btn-sm', href: 'JO-01' })}
        <div class="mt2"><button class="btn btn-ghost btn-sm accent" type="button" data-toast="찜 목록에서 뺐어요">♥ 빼기</button></div></div>
    </div>`).join(''), { cls: 'mt4' })}

    ${card('오픈 예정 알림', `${[['설 선물세트 한우 1++ 등급', '8월 6일 10:00'], ['캠핑용 접이식 테이블 세트', '8월 7일 12:00']]
      .map(([t, o]) => `<div class="row-b" style="padding:12px 0">
        <div class="grow"><b>${t}</b><div class="t-sub">${o} 오픈 예정</div></div>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="알림을 껐어요">알림 끄기</button></div>`).join('')}`,
    { cls: 'mt6' })}

    ${card('알림 내역', `<div class="row-b mb3">
      <span class="t-sub">읽지 않은 알림 2개</span>
      <button class="btn btn-ghost btn-sm" type="button" data-toast="모두 읽음으로 바꿨어요">모두 읽음</button></div>
      ${alarms.map(([k, t, at, cls, go]) => `<a class="feed-row" href="${link(go)}">
        ${badge(k, cls)}<div class="grow">${t}</div><span class="t-sub nowrap">${at}</span></a>`).join('')}`,
    { cls: 'mt6' })}`;

  const aside = card('알림 받기', `<p class="t-sub">담아 두신 공구에 무슨 일이 생기면 알려드립니다.</p>
    <div class="mt3">${[['마감 임박 (3시간 전)', true], ['성사됐을 때', true], ['불발·환불', true], ['재오픈', true], ['오픈 예정', false]]
    .map(([t, on]) => `<div class="row-b" style="padding:9px 0"><span>${t}</span>
      <button class="toggle${on ? ' on' : ''}" type="button" data-toast="${t} 알림을 바꿨어요"></button></div>`).join('')}</div>
    <div class="hr"></div>
    ${btn('알림 설정 자세히', { cls: 'btn-ghost btn-block btn-sm', href: 'AC-03' })}`);

  const body = myPage('RV-03', `${pageHd('관심 공구·알림')}<div class="mt6">${detail2(main, aside)}</div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── AC-01 로그인·회원가입 ────────────────────────────
   v: 'join' 회원가입 폼 · 'phone' 휴대폰 인증 · 'guest' 비회원 주문 조회 */
function ac01(ctx, v) {
  /* 회원가입 폼 — 로그인 화면에서 갈라져 나온 단독 화면 */
  if (v === 'join') {
    const body = soloBox('회원가입', '2분이면 끝납니다', `
      ${hsteps(['정보 입력', '휴대폰 인증', '완료'], 0)}
      <div class="form mt6">
        <div class="field"><label class="label">이메일 <span class="req">*</span></label>
          <input class="input" type="email" value="haneul@example.com">
          <p class="ok">쓸 수 있는 이메일입니다</p></div>
        <div class="field"><label class="label">비밀번호 <span class="req">*</span></label>
          <input class="input" type="password" value="············">
          <p class="hint">8자 이상 · 영문·숫자·특수문자 중 두 가지 이상</p></div>
        <div class="field"><label class="label">비밀번호 확인 <span class="req">*</span></label>
          <input class="input is-err" type="password" value="··········">
          <p class="err">비밀번호가 서로 다릅니다</p></div>
        <div class="field"><label class="label">닉네임 <span class="req">*</span></label>
          <input class="input" value="김하늘">
          <p class="hint">후기와 문의에 이 이름이 보입니다. 나중에 바꾸실 수 있어요.</p></div>
        <div class="field"><label class="label">추천인 코드 (선택)</label>
          <div class="field-btn"><input class="input" placeholder="친구에게 받은 코드">
            ${btn('확인', { cls: 'btn-ghost', attr: ' data-toast="코드를 확인했어요. 두 분 모두 2,000원 적립금을 받습니다" data-toast-kind="ok"' })}</div></div>
      </div>
      <div class="hr"></div>
      <label class="check"><input type="checkbox"><span><b>전체 동의</b></span></label>
      ${[['만 14세 이상입니다', true], ['이용약관', true], ['개인정보 처리방침', true], ['마케팅 정보 수신 (공구 소식·할인)', false]]
      .map(([t, req]) => `<div class="row-b"><label class="check"><input type="checkbox"${req ? ' checked' : ''}><span>${t} ${req ? '<span class="danger">(필수)</span>' : '<span class="t-sub">(선택)</span>'}</span></label>
        <button class="btn-link" type="button" data-toast="전문을 새 창에서 열어요">보기</button></div>`).join('')}
      <div class="coupon mt4"><div class="amt"><div class="v">2,000</div><div class="t-sub">원</div></div>
        <div class="bd"><b>가입 축하 쿠폰</b><p class="t-sub mt1">첫 참여에 바로 쓰실 수 있어요 · 30일 안에</p></div></div>
      <div class="btns mt6">${btn('다음 — 휴대폰 인증', { cls: 'btn-primary btn-lg btn-block', href: 'AC0103' })}</div>
      <p class="t-sub center mt4">이미 계정이 있으신가요? <a class="btn-link" href="${link('AC-01')}">로그인</a></p>`,
      { lg: true });
    return { body, o: { solo: true, full: true, state: '회원가입 폼 · 비밀번호 확인 오류' } };
  }

  /* 휴대폰 인증 */
  if (v === 'phone') {
    const body = soloBox('휴대폰 인증', '배송과 성사 알림을 받을 번호입니다', `
      ${hsteps(['정보 입력', '휴대폰 인증', '완료'], 1)}
      <div class="form mt6">
        <div class="field"><label class="label">휴대폰 번호</label>
          <div class="field-btn"><input class="input is-readonly" value="010-1234-5678" disabled>
            ${btn('번호 바꾸기', { cls: 'btn-ghost', attr: ' data-toast="번호를 다시 입력하실 수 있어요"' })}</div></div>
        <div class="field"><label class="label">인증번호 6자리</label>
          <div class="code-in">
            ${['4', '1', '7', '', '', ''].map((n) => `<input value="${n}" maxlength="1">`).join('')}
          </div>
          <div class="row-b mt3">
            <span class="t-sub">남은 시간 <b data-count="167">02:47</b></span>
            <button class="btn-link" type="button" data-toast="인증번호를 다시 보냈어요" data-toast-kind="ok">다시 받기</button>
          </div></div>
      </div>
      <div class="box mt4"><b>문자가 안 오나요?</b>
        <ul class="t-sub mt2" style="padding-left:18px;line-height:1.9">
          <li>스팸 차단 설정을 확인해 주세요.</li>
          <li>3분이 지나면 다시 받기를 누르실 수 있습니다.</li>
          <li>계속 안 오면 고객센터로 알려 주세요.</li>
        </ul></div>
      <div class="btns mt6">${btn('인증하고 가입 완료', { cls: 'btn-primary btn-lg btn-block', href: 'HO-01' })}</div>
      <p class="t-sub center mt4">
        <button class="btn-link" type="button" data-toast="고객센터로 연결해요">인증이 계속 안 될 때</button></p>`,
      { lg: false });
    return { body, o: { solo: true, full: true, state: '휴대폰 인증 대기 · 남은 시간 02:47' } };
  }

  /* 비회원 주문 조회 */
  if (v === 'guest') {
    const body = soloBox('비회원 주문 조회', '참여 번호와 연락처로 찾으실 수 있어요', `
      <div class="form">
        <div class="field"><label class="label">참여 번호</label>
          <input class="input" placeholder="MG20260804-5182">
          <p class="hint">참여 완료 문자에 적힌 번호입니다</p></div>
        <div class="field"><label class="label">주문하신 분 이름</label><input class="input" placeholder="김하늘"></div>
        <div class="field"><label class="label">휴대폰 번호</label>
          <div class="field-btn"><input class="input" placeholder="- 없이 숫자만">
            ${btn('인증번호 받기', { cls: 'btn-ghost', attr: ' data-toast="인증번호를 보냈어요" data-toast-kind="ok"' })}</div></div>
        <div class="field"><label class="label">인증번호</label><input class="input" placeholder="6자리"></div>
        ${btn('조회하기', { cls: 'btn-primary btn-lg btn-block', href: 'MY-02' })}
      </div>
      <div class="box mt6"><b>회원이 되시면 이런 게 편합니다</b>
        <ul class="t-sub mt2" style="padding-left:18px;line-height:1.9">
          <li>참여한 공구가 성사·불발될 때 바로 알려드립니다.</li>
          <li>배송지를 저장해 두고 다음부터 한 번에 참여하실 수 있습니다.</li>
          <li>적립금과 쿠폰을 받으실 수 있습니다.</li>
        </ul>
        <div class="btns mt4">${btn('회원가입하고 시작하기', { cls: 'btn-primary btn-block btn-sm', href: 'AC0102' })}</div></div>
      <p class="t-sub center mt6"><a class="btn-link" href="${link('AC-01')}">로그인 화면으로</a></p>`);
    return { body, o: { solo: true, full: true, state: '비회원 주문 조회' } };
  }

  const body = soloBox('시작하기', '3초면 시작하실 수 있어요', `
    <div class="social">
      <button class="btn btn-block btn-lg s-kakao" type="button" data-toast="카카오 로그인 창이 열려요">카카오로 3초 만에 시작</button>
      <button class="btn btn-block s-naver" type="button" data-toast="네이버 로그인 창이 열려요">네이버로 계속하기</button>
      <button class="btn btn-block s-apple" type="button" data-toast="구글 로그인 창이 열려요">Google로 계속하기</button>
    </div>
    <div class="divider">이메일로 하기</div>
    <div class="form">
      <div class="field"><label class="label">이메일</label><input class="input" type="email" placeholder="you@example.com"></div>
      <div class="field"><label class="label">비밀번호</label><input class="input" type="password"></div>
      <div class="err">이메일 또는 비밀번호가 맞지 않습니다.</div>
      <div class="row-b mt3">
        <label class="check" style="padding:0"><input type="checkbox" checked><span>로그인 상태 유지</span></label>
        <button class="btn-link" type="button" data-toast="비밀번호 재설정 메일을 보냈어요" data-toast-kind="ok">비밀번호 찾기</button>
      </div>
      ${btn('로그인', { cls: 'btn-primary btn-lg btn-block', href: 'HO-01' })}
    </div>

    <div class="card mt6"><div class="card-bd">
      <h3 class="t-card mb3">처음이신가요?</h3>
      ${hsteps(['정보 입력', '휴대폰 인증', '완료'], 0)}
      <p class="t-sub mt4">이메일과 비밀번호를 넣고 휴대폰 인증만 하시면 됩니다. 2분이면 끝납니다.</p>
      <div class="coupon mt4"><div class="amt"><div class="v">2,000</div><div class="t-sub">원</div></div>
        <div class="bd"><b>가입 축하 쿠폰</b><p class="t-sub mt1">첫 참여에 바로 쓰실 수 있어요</p></div></div>
      <div class="btns mt4">${btn('회원가입 하기', { cls: 'btn-primary btn-lg btn-block', href: 'AC0102' })}</div>
    </div></div>

    <p class="t-sub center mt6">회원가입 없이 <a class="btn-link" href="${link('AC0104')}">비회원 주문 조회</a></p>`,
    { lg: true });
  return { body, o: { solo: true, full: true } };
}

/* ── AC-02 내 정보·배송지 ─────────────────────────────
   v: 'addr' 배송지 추가 폼 · 'pay' 결제수단 관리 · 'host' 진행자 전환 안내 */
function ac02(ctx, v) {
  /* 배송지 추가 폼 */
  if (v === 'addr') {
    const body = myPage('AC-02', `
      ${pageHd('배송지 추가', '자주 받으시는 곳을 저장해 두시면 참여할 때 한 번에 고르실 수 있습니다')}
      <div class="split-r"><div>
      ${card('새 배송지', `<div class="form" style="max-width:none">
        <div class="field-row">
          <div class="field"><label class="label">배송지 이름 <span class="req">*</span></label>
            <input class="input" placeholder="집 · 회사 · 부모님 댁"></div>
          <div class="field"><label class="label">받는 분 <span class="req">*</span></label>
            <input class="input" value="김하늘"></div>
        </div>
        <div class="field"><label class="label">휴대폰 번호 <span class="req">*</span></label>
          <input class="input" value="010-1234-5678" style="max-width:320px"></div>
        <div class="field"><label class="label">주소 <span class="req">*</span></label>
          <div class="field-btn" style="max-width:420px"><input class="input" placeholder="우편번호" value="04781">
            ${btn('주소 찾기', { cls: 'btn-ghost', attr: ' data-toast="주소 검색 창이 열려요"' })}</div>
          <input class="input mt2" value="서울 성동구 아차산로 111">
          <input class="input mt2" placeholder="상세 주소 (동·호수)"></div>
        <div class="field"><label class="label">배송 요청사항</label>
          <select class="select" style="max-width:320px">
            <option>문 앞에 두세요</option><option>경비실에 맡겨 주세요</option>
            <option>배송 전 연락 주세요</option><option>직접 입력</option></select>
          <p class="hint">신선식품은 문 앞에 오래 두면 상할 수 있습니다. 받으실 수 있는 시간을 적어 주셔도 좋습니다.</p></div>
        <label class="check"><input type="checkbox" checked><span>기본 배송지로 두기</span></label>
      </div>`,
      {
        ft: `<div class="row" style="gap:8px">${btn('저장', { cls: 'btn-primary grow', attr: ' data-toast="배송지를 저장했어요" data-toast-kind="ok"' })}
          ${btn('그만두기', { cls: 'btn-ghost grow', href: 'AC-02' })}</div>`,
      })}
      </div><div class="sticky">
      ${card('저장해 둔 배송지', `${[['집', '서울 성동구 아차산로 111, 302동 1804호', true], ['회사', '서울 강남구 테헤란로 231 8층', false]]
      .map(([nm, addr, main]) => `<div class="row-b" style="padding:12px 0;border-bottom:1px solid var(--border)">
        <div class="grow"><b>${nm}</b>${main ? ' ' + badge('기본', 'b-pri') : ''}<div class="t-sub mt1">${addr}</div></div></div>`).join('')}
      <p class="t-sub mt3">배송지는 최대 10개까지 저장하실 수 있습니다.</p>`)}
      </div></div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '배송지 추가 폼' } };
  }

  /* 결제수단 관리 */
  if (v === 'pay') {
    const body = myPage('AC-02', `
      ${pageHd('결제 수단 관리', '등록해 두시면 참여할 때 바로 결제하실 수 있습니다')}

      ${card('등록한 카드', `${[['국민카드', '1234-**-**-5678', '김하늘', true], ['신한카드', '9876-**-**-4321', '김하늘', false]]
      .map(([nm, no, who, main]) => `<div class="row-b list-row" style="padding:14px 0">
        <div class="row" style="gap:14px">
          <div style="width:52px;height:34px;border:1px solid var(--border);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--muted)">CARD</div>
          <div><b>${nm}</b>${main ? ' ' + badge('기본', 'b-pri') : ''}
            <div class="t-sub mt1">${no} · ${who}</div></div></div>
        <div class="btns nowrap">
          ${main ? '' : '<button class="btn btn-ghost btn-sm" type="button" data-toast="기본 결제 수단으로 바꿨어요" data-toast-kind="ok">기본으로</button>'}
          <button class="btn btn-ghost btn-sm" type="button" data-toast="카드를 지웠어요">삭제</button></div>
      </div>`).join('')}
      <button class="btn btn-soft btn-block btn-sm mt3" type="button" data-toast="카드 등록 창을 열었어요">＋ 카드 추가</button>`)}

      ${card('간편결제', `${[['카카오페이', '연결됨', true], ['네이버페이', '연결됨', true], ['토스페이', '연결 안 됨', false]]
      .map(([nm, st, on]) => `<div class="row-b list-row" style="padding:14px 0">
        <div class="grow"><b>${nm}</b><div class="t-sub mt1">${st}</div></div>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="${nm} 연결을 바꿨어요">${on ? '연결 끊기' : '연결하기'}</button>
      </div>`).join('')}`, { cls: 'mt6' })}

      ${card('결제 수단을 왜 저장하나요', `<ul style="padding-left:18px;line-height:2">
        <li>공구는 <b>마감 시각이 정해져 있어</b>, 결제가 늦어지면 참여를 못 하실 수 있습니다.</li>
        <li>카드 번호는 저희가 갖고 있지 않습니다. 결제대행사가 발급한 <b>빌링키</b>만 보관합니다.</li>
        <li>불발되면 저장된 수단으로 <b>승인 자체가 취소</b>됩니다.</li>
      </ul>`, { cls: 'mt6' })}

      ${banner('mut', '🔒', `<b>결제 비밀번호를 걸어 두실 수 있습니다.</b>
        <p class="t-sub">결제할 때마다 6자리 숫자를 넣게 됩니다.</p>`,
      { cls: 'mt6', right: `<button class="toggle" type="button" data-toast="결제 비밀번호를 켰어요"></button>` })}`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '결제 수단 관리 · 카드 2장 · 간편결제 2건' } };
  }

  /* 진행자 전환 안내 */
  if (v === 'host') {
    const body = myPage('AC-02', `
      ${pageHd('진행자로 전환하기', '지금 계정 그대로 진행자가 되실 수 있습니다')}

      ${card('', `<div class="row wrap-row" style="gap:24px;align-items:flex-start">
        <div class="grow" style="min-width:280px">
          <h2 class="t-sec">참여자이면서 진행자일 수 있습니다</h2>
          <p class="t-sub mt3">계정을 새로 만들지 않으셔도 됩니다. 진행자로 전환하시면 화면 오른쪽 위에
          <b>진행자 화면으로</b> 단추가 생기고, 언제든 오가실 수 있습니다.
          참여자로서 쓰시던 내 공구함·관심 공구는 그대로 남습니다.</p>
        </div>
        <div class="box" style="min-width:260px">
          <b>지금 상태</b>
          <div class="mt3">${kv([['계정', '김하늘 (참여자)'], ['가입일', '2026년 3월 14일'], ['참여 이력', '12건 · 성사 10건'], ['진행자 자격', '<b>신청 가능</b>']])}</div>
        </div>
      </div>`)}

      ${card('전환하면 이런 것이 생깁니다', `<div class="g3">
        ${[['공구 개설', '상품·목표 인원·단계별 가격을 정해 공구를 엽니다'],
      ['참여 현황·발주', '누가 얼마나 참여했는지 보고, 성사되면 발주와 배송을 챙깁니다'],
      ['정산', '수수료를 뺀 금액을 계좌로 받습니다. 첫 공구는 수수료가 없습니다']]
      .map(([t, s]) => `<div class="box"><b>${t}</b><p class="t-sub mt2">${s}</p></div>`).join('')}
      </div>`, { cls: 'mt6' })}

      ${card('전환하기 전에 확인해 주세요', `${table(
      [{ t: '항목', w: '26%' }, '내용'],
      [
        ['필요한 것', '본인 명의 계좌 · 휴대폰 인증 (사업자가 아니어도 됩니다)'],
        ['심사', '첫 공구를 열 때 상품과 조건을 검수합니다. 보통 1영업일.'],
        ['수수료', '판매액의 5% (첫 공구 0%)'],
        ['정산', '성사·배송 완료 후 영업일 기준 7일 이내'],
        ['책임', '상품과 배송에 대한 책임은 진행자에게 있습니다'],
        ['되돌리기', '언제든 참여자 전용으로 되돌리실 수 있습니다 (진행 중 공구가 없을 때)'],
      ],
    )}`, { cls: 'mt6' })}

      <div class="btns mt6">
        ${btn('진행자 시작 안내 보기', { cls: 'btn-primary btn-lg', href: 'HS-01' })}
        ${btn('수수료·정산 자세히', { cls: 'btn-ghost btn-lg', href: 'HS0102' })}
        ${btn('나중에 하기', { cls: 'btn-ghost btn-lg', href: 'AC-02' })}
      </div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '진행자 전환 안내 · 신청 가능' } };
  }

  const body = myPage('AC-02', `
    ${pageHd('내 정보·배송지')}

    ${card('프로필', `<div class="row wrap-row" style="gap:20px;align-items:flex-start">
      ${phAva(88, '김하늘')}
      <div class="grow form">
        <div class="field"><label class="label">닉네임</label><input class="input" value="김하늘" style="max-width:320px">
          <p class="hint">후기와 문의에 이 이름이 보입니다</p></div>
        <div class="btns">${btn('사진 바꾸기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="파일 선택 창이 열려요"' })}</div>
      </div>
      <div class="box box-mut" style="min-width:200px">
        <div class="row-b"><span class="t-sub">참여한 공구</span><b>12건</b></div>
        <div class="row-b mt2"><span class="t-sub">쓴 후기</span><b>7건</b></div>
        <div class="row-b mt2"><span class="t-sub">성사율</span><b>83%</b></div>
      </div>
    </div>`)}

    ${card('연락처', `<div class="form">
      <div class="field"><label class="label">휴대폰</label>
        <div class="field-btn"><input class="input" value="010-1234-5678">
          ${btn('인증', { cls: 'btn-ghost', attr: ' data-toast="인증번호를 보냈어요" data-toast-kind="ok"' })}</div>
        <p class="hint">배송·성사 알림을 이 번호로 보냅니다</p></div>
      <div class="field"><label class="label">이메일</label>
        <div class="field-btn"><input class="input" value="haneul@example.com">
          ${btn('바꾸기', { cls: 'btn-ghost', attr: ' data-toast="새 주소로 인증 메일을 보냈어요" data-toast-kind="ok"' })}</div></div>
    </div>`, { cls: 'mt6' })}

    ${card('배송지', `${[
    ['집', '김하늘', '서울 성동구 아차산로 111, 302동 1804호 (04781)', true],
    ['회사', '김하늘', '서울 강남구 테헤란로 231 8층 (06142)', false],
  ].map(([nm, who, addr, main]) => `<div class="row-b list-row" style="padding:14px 0">
      <div class="grow"><div class="row" style="gap:8px"><b>${nm}</b>${main ? badge('기본 배송지', 'b-pri') : ''}</div>
        <div class="t-sub mt1">${who} · 010-1234-5678</div>
        <div class="t-sub">${addr}</div></div>
      <div class="btns nowrap">
        ${main ? '' : '<button class="btn btn-ghost btn-sm" type="button" data-toast="기본 배송지로 바꿨어요" data-toast-kind="ok">기본으로</button>'}
        <button class="btn btn-ghost btn-sm" type="button" data-toast="수정 창을 열었어요">수정</button>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="배송지를 지웠어요">삭제</button>
      </div></div>`).join('')}
    ${btn('＋ 배송지 추가', { cls: 'btn-soft btn-block btn-sm mt3', href: 'AC0202' })}`,
    { cls: 'mt6' })}

    ${card('결제 수단', `<div class="row-b list-row" style="padding:14px 0">
      <div class="grow"><b>국민카드</b> <span class="badge b-pri">기본</span>
        <div class="t-sub mt1">1234-**-**-5678 · 김하늘</div></div>
      <button class="btn btn-ghost btn-sm" type="button" data-toast="카드를 지웠어요">삭제</button></div>
    ${btn('결제 수단 관리', { cls: 'btn-soft btn-block btn-sm mt3', href: 'AC0203' })}`,
    { cls: 'mt6' })}

    ${card('쿠폰·적립금', `<div class="g2">
      <div class="box center"><div class="t-sub">쓸 수 있는 쿠폰</div><div class="t-sec">3장</div>
        <button class="btn btn-ghost btn-sm mt2" type="button" data-toast="쿠폰함을 열었어요">쿠폰함 보기</button></div>
      <div class="box center"><div class="t-sub">적립금</div><div class="t-sec">3,240원</div>
        <button class="btn btn-ghost btn-sm mt2" type="button" data-toast="적립금 내역을 열었어요">내역 보기</button></div>
    </div>`, { cls: 'mt6' })}

    ${card('진행자로 활동하기', `<div class="row-b wrap-row">
      <div><b>직접 공구를 열어 보실래요?</b>
        <p class="t-sub mt1">상품을 구할 곳만 있으면 누구나 진행자가 될 수 있습니다. 첫 공구는 수수료가 없습니다.</p></div>
      ${btn('진행자 전환 안내', { cls: 'btn-primary', href: 'AC0204' })}</div>`, { cls: 'mt6' })}

    ${card('', `<div class="row-b wrap-row">
      <div><b>회원 탈퇴</b><p class="t-sub mt1">진행 중인 공구가 있으면 탈퇴하실 수 없습니다. 지금 진행 중인 공구가 1건 있어요.</p></div>
      ${btn('회원 탈퇴', { cls: 'btn-danger', off: true })}</div>`, { cls: 'mt6' })}`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── AC-03 알림 설정 ──────────────────────────────────
   v: 'dnd' 방해금지 설정 · 'optout' 마케팅 수신 철회 */
function ac03(ctx, v) {
  /* 방해 금지 설정 */
  if (v === 'dnd') {
    const body = myPage('AC-03', `
      ${pageHd('방해 금지 시간', '이 시간에는 알림을 보내지 않습니다')}

      ${card('방해 금지', `<div class="row-b wrap-row">
        <div class="grow"><b>밤에는 보내지 않기</b>
          <p class="t-sub mt1">켜 두시면 아래 시간 동안 알림이 오지 않습니다.</p></div>
        <button class="toggle on" type="button" data-toast="방해 금지를 껐어요"></button>
      </div>
      <div class="hr"></div>
      <div class="row wrap-row" style="gap:8px;align-items:center">
        <input class="input" type="time" value="21:00" style="width:130px"><span class="t-sub">부터</span>
        <input class="input" type="time" value="08:00" style="width:130px"><span class="t-sub">까지</span>
        <span class="badge b-mut">11시간</span>
      </div>
      <div class="mt4"><label class="label">요일</label>
        ${chips(['월', '화', '수', '목', '금', '토', '일'], [0, 1, 2, 3, 4, 5, 6])}</div>`)}

      ${card('그래도 보내는 것', `<p class="t-sub mb3">놓치면 손해가 생기는 것은 방해 금지 시간에도 보냅니다. 각각 끄실 수 있습니다.</p>
      ${[['마감 3시간 전 알림', '참여하신 공구가 곧 마감될 때', true],
      ['성사·불발 확정', '결제가 확정되거나 환불이 걸릴 때', true],
      ['결제 실패', '결제가 되지 않았을 때', true],
      ['배송 출발', '오늘 도착 예정일 때', false]]
      .map(([t, s, on]) => `<div class="row-b list-row" style="padding:12px 0">
        <div class="grow"><b>${t}</b><div class="t-sub">${s}</div></div>
        <button class="toggle${on ? ' on' : ''}" type="button" data-toast="${t}을 바꿨어요">${on ? '예외로 보냄' : '보내지 않음'}</button>
      </div>`).join('')}`, { cls: 'mt6' })}

      ${card('밤에 막힌 알림은 어떻게 되나요', `<div class="mt2">${timeline([
      ['알림이 생김', '방해 금지 시간(21:00~08:00) 안'],
      ['보관', '보내지 않고 모아 둡니다'],
      ['아침에 모아 보냄', '08:00에 한 번에 알려드립니다'],
      ['알림함', '언제든 알림함에서 다시 보실 수 있습니다'],
    ], 3)}</div>`, { cls: 'mt6', ft: btn('알림함 보기', { cls: 'btn-ghost btn-block btn-sm', href: 'RV0302' }) })}

      <div class="btns mt6">
        ${btn('저장', { cls: 'btn-primary btn-lg', attr: ' data-toast="방해 금지 설정을 저장했어요" data-toast-kind="ok"' })}
        ${btn('알림 설정으로', { cls: 'btn-ghost btn-lg', href: 'AC-03' })}
      </div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '방해 금지 21:00 ~ 08:00 · 매일' } };
  }

  /* 마케팅 수신 철회 */
  if (v === 'optout') {
    const body = myPage('AC-03', `
      ${pageHd('광고성 정보 수신 철회')}

      ${banner('ok', '✅', `<b>광고성 정보 수신을 철회했습니다.</b>
        <p class="t-sub">2026년 8월 6일부터 혜택·할인 소식을 보내지 않습니다. 철회하셔도 서비스 이용에는 아무 영향이 없습니다.</p>`)}

      ${card('무엇이 바뀌나요', `${table(
      [{ t: '알림 종류', w: '34%' }, '전에는', '지금은'],
      [
        ['혜택·할인 소식', '받음', '<b>받지 않음</b>'],
        ['기획전·이벤트', '받음', '<b>받지 않음</b>'],
        ['관심 카테고리 새 공구', '받음', '<b>받지 않음</b>'],
        ['참여한 공구의 성사·불발', '받음', '받음 (거래 안내라 계속 갑니다)'],
        ['배송·환불 안내', '받음', '받음'],
        ['결제 실패·오류', '받음', '받음'],
      ],
    )}
      <p class="t-sub mt3">거래에 관한 안내는 광고가 아니라서 철회하셔도 계속 보내드립니다. 이것까지 끄시려면 알림 설정에서 개별로 끄실 수 있습니다.</p>`)}

      ${card('철회 이력', `${timeline([
      ['수신 동의', '2026년 3월 14일 · 회원가입 때'],
      ['수신 철회', '2026년 8월 6일 14:02 · 알림 설정에서'],
      ['처리 완료', '2026년 8월 6일 14:02 · 즉시 반영'],
    ], 2)}
      <div class="hr"></div>
      ${kv([
      ['철회 방법', '알림 설정 > 광고성 정보 수신'],
      ['처리 시각', '2026년 8월 6일 14:02'],
      ['확인 메일', 'haneul@example.com 으로 보냈습니다'],
    ])}`, { cls: 'mt6' })}

      ${card('', `<div class="row-b wrap-row">
        <div><b>다시 받고 싶으시면</b>
          <p class="t-sub mt1">언제든 다시 켜실 수 있습니다. 쿠폰과 기획전 소식을 놓치지 않으시려면 켜 두시는 편이 좋습니다.</p></div>
        ${btn('다시 받기', { cls: 'btn-primary', attr: ' data-toast="광고성 정보 수신에 다시 동의했어요" data-toast-kind="ok"' })}
      </div>`, { cls: 'mt6' })}

      <div class="btns mt6">${btn('알림 설정으로 돌아가기', { cls: 'btn-ghost btn-lg', href: 'AC-03' })}</div>`);
    return {
      body,
      o: { wrapCls: 'wrap wrap-full', state: '광고성 정보 수신 철회 완료 (2026-08-06)', after: toastNow('광고성 정보 수신을 철회했어요', { ok: true }) },
    };
  }

  const kinds = [
    ['찜한 공구 마감 임박', '마감 3시간 전에 알려드립니다', true],
    ['성사됐을 때', '참여하신 공구가 성사되면 바로 알려드립니다', true],
    ['불발·환불', '불발되면 환불 진행 상태를 알려드립니다', true],
    ['오픈 예정 공구', '알림 신청하신 공구가 열릴 때', true],
    ['배송', '발송·도착 예정을 알려드립니다', true],
    ['혜택·할인 소식', '쿠폰과 기획전 소식', false],
  ];
  const body = myPage('AC-03', `
    ${pageHd('알림 설정', '꼭 필요한 것만 골라 받으세요')}

    ${card('어디로 받을까요', `<div class="g4">
      ${[['앱 푸시', true], ['카카오 알림톡', true], ['문자(SMS)', false], ['이메일', false]]
      .map(([t, on]) => `<div class="box center"><b>${t}</b>
        <button class="btn btn-ghost btn-sm mt3 toggle${on ? ' on' : ''}" type="button" data-toast="${t} 알림을 바꿨어요">${on ? '켜짐' : '꺼짐'}</button></div>`).join('')}
    </div>
    <p class="t-sub mt3">앱을 지우시면 푸시 알림이 가지 않습니다. 중요한 안내는 알림톡으로도 함께 보내드립니다.</p>`)}

    ${card('무엇을 받을까요', kinds.map(([t, d, on]) => `<div class="row-b list-row" style="padding:13px 0">
      <div class="grow"><b>${t}</b><div class="t-sub">${d}</div></div>
      <button class="toggle${on ? ' on' : ''}" type="button" data-toast="${t} 알림을 바꿨어요"></button>
    </div>`).join(''), { cls: 'mt6' })}

    ${card('밤에는 보내지 않기', `<div class="row-b wrap-row">
      <div class="grow"><b>방해 금지 시간</b>
        <p class="t-sub mt1">이 시간에는 알림을 보내지 않습니다. 다만 마감 임박처럼 놓치면 안 되는 것은 다음 날 아침에 모아서 보내드립니다.</p></div>
      <button class="toggle on" type="button" data-toast="방해 금지를 바꿨어요"></button>
    </div>
    <div class="row mt3" style="gap:8px;align-items:center">
      <input class="input" type="time" value="21:00" style="width:130px">
      <span class="t-sub">부터</span>
      <input class="input" type="time" value="08:00" style="width:130px">
      <span class="t-sub">까지</span>
    </div>
    <div class="btns mt3">${btn('방해 금지 자세히 설정', { cls: 'btn-ghost btn-sm', href: 'AC0302' })}</div>`, { cls: 'mt6' })}

    ${card('관심 카테고리', `<p class="t-sub mb3">고르신 카테고리에 새 공구가 열리면 알려드립니다.</p>
      ${chips(CATS.map((c) => c.nm), [0, 1, 3])}`, { cls: 'mt6' })}

    ${card('광고성 정보 수신', `<div class="row-b wrap-row">
      <div class="grow"><b>혜택·할인 소식 받기</b>
        <p class="t-sub mt1">2026년 3월 14일에 동의하셨습니다. 언제든 철회하실 수 있고, 철회하셔도 서비스 이용에는 영향이 없습니다.</p></div>
      ${btn('수신 철회', { cls: 'btn-ghost btn-sm', href: 'AC0303' })}
    </div>`, { cls: 'mt6' })}

    <div class="btns mt6">
      ${btn('저장', { cls: 'btn-primary btn-lg', attr: ' data-toast="알림 설정을 저장했어요" data-toast-kind="ok"' })}
      ${btn('기본값으로 되돌리기', { cls: 'btn-ghost btn-lg', attr: ' data-toast="처음 상태로 되돌렸어요"' })}
    </div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

export const PAGES = {
  'RV-01': rv01,
  RV0102: (c) => rv01(c, 'form'),
  RV0103: (c) => rv01(c, 'done'),
  RV0104: (c) => rv01(c, 'photo'),
  'RV-02': rv02,
  RV0202: (c) => rv02(c, 'form'),
  RV0203: (c) => rv02(c, 'private'),
  RV0204: (c) => rv02(c, 'answered'),
  'RV-03': rv03,
  RV0302: (c) => rv03(c, 'alarm'),
  RV0303: (c) => rv03(c, 'empty'),

  'AC-01': ac01,
  AC0102: (c) => ac01(c, 'join'),
  AC0103: (c) => ac01(c, 'phone'),
  AC0104: (c) => ac01(c, 'guest'),
  'AC-02': ac02,
  AC0202: (c) => ac02(c, 'addr'),
  AC0203: (c) => ac02(c, 'pay'),
  AC0204: (c) => ac02(c, 'host'),
  'AC-03': ac03,
  AC0302: (c) => ac03(c, 'dnd'),
  AC0303: (c) => ac03(c, 'optout'),
};
