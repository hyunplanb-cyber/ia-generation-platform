/* SL 판매하기 — 26화면
     SL01 판매글 작성 6 · SL02 사진 등록·정리 5 · SL03 얼마에 팔까(시세) 5
     SL04 등록 완료 4 · SL05 내 판매글 관리 6

   ⚠ 이 메뉴가 이 팩의 까닭이다. 쇼핑몰 도구는 물건 올리는 화면을 «관리자에게만» 연다.
     여기서는 회원 누구나 쓴다 — 그래서 손님 사이드바 안에 있다.

   ⚠ 레이아웃 B 대시보드형 —
       · 화면 위쪽은 «지표 카드 4개»(kpis). 히어로를 두지 않는다.
       · 목록은 표(dashTable). 머리글 고정 · 행 높이 일정 · 상태는 stBadge.
       · 상세는 좌 본문 + 우 액션 패널(detailSplit). 상태를 바꾸는 버튼은 «전부» 우측에.
     스펙팩 prompt 의 「하단 버튼」·「가로 행」은 손님이 AI 에게 줄 글이고,
     이 완성화면의 뼈대를 정하는 것은 팩에 함께 나가는 레이아웃 프리셋이다.

   ⚠ 링크는 짧은 이름(SL-04)으로 적는다. link() 가 이 팩의 파일 이름(SL0401)으로 옮긴다.
     같은 화면의 «다른 상태»로 갈 때만 긴 이름(SL0105)을 쓴다.
   ⛔ btn() 은 href 와 off 를 함께 주면 멈춘다 — <a> 에는 disabled 가 없기 때문이다.
     잠글 단추는 반드시 <button>(off:true)으로 두고, 여는 길을 화면 안에 적어 둔다. */
import * as U from './ui.mjs';
import {
  CATS, SUBCATS, CONDS, TOWNS, ITEMS, itemBy, userBy, ago, SITE, ST_CLS,
  BANNED, FEE_RATE, fee, BOOSTS, BOOST_FREE_LEFT,
  SL_itemBy, SL_MY, SL_STATES, SL_MY_CNT, SL_MY_VIEW, SL_MY_CHAT, SL_BOOST_READY, SL_BUYERS,
  SL_BANDS, SL_PERIODS, SL_COND_AVG, SL_AVG, SL_RECENT_DEALS, SL_GUESS, SL_FEW,
  SL_PHOTO_MAX, SL_PHOTO_RULE, SL_PHOTOS, SL_PHOTO_TIPS,
  SL_REQUIRED, SL_MISSING, SL_CAT_FIELDS, SL_BAN_HIT, SL_DONE,
} from './data.mjs';

/* 판매글 작성·사진·시세·등록완료가 모두 «같은 물건» 하나를 쓴다.
   화면을 옮겨 다녀도 물건이 바뀌지 않아야 이야기가 이어져 보인다. */
const IT = () => itemBy('i1');

/** 이 화면의 다른 상태로 가는 길 — 3뎁스 화면이 외톨이가 되지 않게 한다.
   손님에게도 「이럴 때는 이렇게 보인다」를 보여 주는 자리다. */
const 다른상태 = (list) => U.sec('이 화면의 다른 상태',
  `<div class="btns wrap-row">${list.map(([id, t]) => U.btn(t, { href: id, cls: 'btn-ghost btn-sm' })).join('')}</div>`,
  { desc: '같은 화면이 형편에 따라 어떻게 달라지는지 볼 수 있어요.' });

/* ════════════════════════════════════════════════════════════
   SL-01 판매글 작성 — 기준 화면 하나를 만들고, 상태 다섯은 그 «변형»이다
   ════════════════════════════════════════════════════════════ */

/** 필수 항목 검사 — 지표 카드의 「다 적은 항목」과 등록 버튼 잠금이 여기 하나에서 나온다 */
const 검사목록 = (missing = []) => `<div class="stack-sm">${SL_REQUIRED.map((r) => {
  const 빔 = missing.includes(r.k);
  return `<div class="row-b">
    <span class="row-c" style="gap:6px"><b class="${빔 ? 'danger' : ''}">${빔 ? '✕' : '✓'}</b><span>${r.k}</span></span>
    <span class="t-sub">${빔 ? '아직 비었어요' : r.d}</span></div>`;
}).join('')}</div>`;

/** ① 사진 */
function 사진칸(o = {}) {
  const 빔 = (o.missing || []).includes('사진');
  const 장수 = 빔 ? 0 : 3;
  const 격자 = `<div class="photo-grid" id="photo">
    <button class="photo-add" type="button" data-toast="사진을 골라 주세요 (최대 ${SL_PHOTO_MAX}장)">
      <span style="font-size:22px">＋</span><span>사진 추가</span></button>
    ${[1, 2, 3].slice(0, 장수).map((n) => `<div class="photo-cell">
      ${n === 1 ? `<span class="rep">${U.badge('대표', 'b-pri')}</span>` : ''}
      <button class="del" type="button" data-toast="${n}번째 사진을 지웠어요" data-toast-act="되돌리기" aria-label="사진 지우기">✕</button>
      ${U.phItem(140, 'i1p' + n)}
    </div>`).join('')}
  </div>`;
  return U.card('', `
    ${격자}
    <p class="${빔 ? 'help err mt3' : 't-sub mt3'}">${빔
    ? '사진을 최소 1장 올려 주세요. 사진이 없으면 등록할 수 없어요.'
    : `사진은 최대 ${SL_PHOTO_MAX}장까지 올릴 수 있고, <b>첫 장이 목록에 보여요.</b> (${SL_PHOTO_RULE})`}</p>
    <div class="btns mt3">${U.btn('사진 정리하기', { href: 'SL-02', cls: 'btn-ghost' })}</div>`,
  { cls: 빔 ? 'tape warn' : '' });
}

/** 분류별로 더 묻는 칸 — 소분류를 고르면 이 칸이 갈아 끼워진다 */
const 추가항목 = (cat, 보임) => `<div class="fld sub-fld" data-sel-case="cat" data-sel-when="${cat}"${보임 ? '' : ' hidden'}>
  <span class="lb">${cat}에서 더 묻는 것</span>
  <div class="row wrap-row" style="gap:8px">
    ${SL_CAT_FIELDS[cat].map((f) => (f.text
    ? `<input class="input" style="flex:1 1 160px" type="text" placeholder="${f.t}" value="${f.text}" aria-label="${f.t}">`
    : `<select class="input" style="flex:1 1 160px" aria-label="${f.t}"><option>${f.t}</option>${f.list.map((v) => `<option>${v}</option>`).join('')}</select>`)).join('')}
  </div>
</div>`;

/** ② 무엇을 파나요 — 제목·분류·상태·기간·설명 */
function 무엇칸(o = {}) {
  const it = IT();
  const cat = o.cat || '생활가전';
  const sub = o.sub || '청소기';
  const condK = o.cond || it.cond;
  const cond = CONDS.find((c) => c.k === condK) || CONDS[1];
  const 제목 = o.ban ? '위스키 미니어처 세트 + 다이슨 무선청소기 V11' : it.t;
  const 설명 = o.ban
    ? '레플리카 가방도 같이 드립니다. 청소기는 작년 5월에 사서 6개월쯤 썼습니다.'
    : it.desc;
  const 표시 = (s) => U.esc(s).replace(new RegExp(SL_BAN_HIT.map((h) => h.w).join('|'), 'g'),
    (m) => `<b class="danger" style="background:rgba(192,57,43,.12);padding:0 3px;border-radius:3px">${m}</b>`);
  const 소분류 = SUBCATS[cat === '디지털기기' ? 'digital' : (cat === '의류' ? 'cloth' : 'home')] || SUBCATS.home;

  return U.card('', `
    ${o.catNote ? U.banner('acc', '🔄', `<b>소분류를 「청소기 → 휴대폰」으로 바꿨어요</b>
      <div class="t-sub mt1">분류 전용 항목이 통째로 갈아 끼워집니다. 아래 「${cat}에서 더 묻는 것」을 봐 주세요.</div>`, { cls: 'mb4' }) : ''}

    <div class="fld">
      <label class="lb" for="tt">제목 <span class="req">*</span></label>
      <input class="input${o.ban ? ' err' : ''}" id="tt" type="text" placeholder="어떤 물건인가요?" value="${U.esc(제목)}">
      <div class="row-b"><span class="${o.ban ? 'help err' : 'help'}">${o.ban ? '제목에 금지 낱말 「위스키」가 들어 있어요' : '물건 이름과 모델명을 함께 적으면 더 빨리 찾아져요'}</span>
        <span class="t-sub">${제목.length} / 40</span></div>
    </div>

    <div class="fld">
      <span class="lb">카테고리 <span class="req">*</span></span>
      <div class="row wrap-row" style="gap:8px">
        <select class="input" style="flex:1 1 200px" aria-label="대분류" data-sel-show="cat">
          ${CATS.map((c) => `<option${c.nm === cat ? ' selected' : ''}>${c.nm}</option>`).join('')}</select>
        <select class="input" style="flex:1 1 200px" aria-label="소분류">
          ${소분류.map((s) => `<option${s.nm === sub ? ' selected' : ''}>${s.nm}</option>`).join('')}</select>
      </div>
      <p class="help">분류를 고르면 그 분류에서만 쓰는 항목이 아래에 나타나요.</p>
    </div>

    ${Object.keys(SL_CAT_FIELDS).map((k) => 추가항목(k, k === cat)).join('')}

    ${o.catNote ? `<div class="mt4">${U.modalStatic('분류를 바꿀까요?', `
      <p class="t-sub">적어 두신 <b>생활가전</b> 항목(제조사 다이슨 · 모델명 V11 · 보증기간 없음)은
      <b>디지털기기</b>에 들어갈 자리가 없어요. 그대로 두면 사라집니다.</p>
      ${U.kv([['바꾸기 전', '생활가전 › 청소기'], ['바꾼 뒤', '디지털기기 › 휴대폰'], ['사라지는 값', '제조사 · 모델명 · 보증기간']], { cls: 'mt3' })}`,
    U.btn('그대로 두기', { cls: 'btn-ghost', attr: ' data-toast="분류를 되돌렸어요"' })
      + U.btn('바꾸고 값 지우기', { cls: 'btn-pri', attr: ' data-toast="분류를 바꿨어요 · 전용 항목이 비워졌습니다"' }))}</div>` : ''}

    <div class="fld mt6">
      <span class="lb">물건 상태 <span class="req">*</span></span>
      <div class="stack-sm">
        ${CONDS.map((c) => `<label class="radio-in box${c.k === condK ? ' on' : ''}">
          <input type="radio" name="cond"${c.k === condK ? ' checked' : ''}>
          <span><b>${c.k}</b> <span class="t-sub">${c.d}</span></span></label>`).join('')}
      </div>
      ${U.banner('info', '✍', `<b>「${condK}」은 이렇게 적으면 좋아요</b>
        <div class="t-sub mt1">${cond.tip}</div>`, { cls: 'mt3' })}
      ${(condK === '고장' || condK === '부품용') ? U.banner('warn', '⚠', `<b>고지 의무가 있어요</b>
        <div class="t-sub mt1">어디가 어떻게 고장인지 적지 않고 팔면 거래 뒤 다툼이 생기고,
        신고가 들어오면 제재를 받을 수 있어요. 고장난 곳 사진도 함께 올려 주세요.</div>`, { cls: 'mt3' }) : ''}
    </div>

    <div class="fld">
      <label class="lb" for="us">사용 기간</label>
      <select class="input" id="us" style="max-width:260px">
        ${['고르기', '한 달 미만', '6개월', '1년', '2년 이상'].map((v) => `<option${v === '6개월' ? ' selected' : ''}>${v}</option>`).join('')}</select>
    </div>

    <div class="fld">
      <label class="lb" for="ds">상세 설명 <span class="req">*</span></label>
      <div class="g2">
        <div>
          <textarea class="input${o.ban ? ' err' : ''}" id="ds" rows="8" placeholder="산 시기, 쓴 정도, 흠집이 있는 곳, 박스와 구성품이 있는지 적어 주세요">${U.esc(설명)}</textarea>
          <div class="row-b"><span class="${o.ban ? 'help err' : 'help'}">${o.ban ? '설명에 금지 낱말 「레플리카」가 들어 있어요' : '길게 쓸수록 묻는 채팅이 줄어요'}</span>
            <span class="t-sub">${설명.length} / 2000</span></div>
        </div>
        ${U.box(`<b class="t-card">이런 걸 적어 주세요</b>
          <ul class="dots t-sub mt2">
            <li>언제 샀고 얼마나 썼는지</li>
            <li>흠집이 있다면 어디에 있는지</li>
            <li>박스·설명서·구성품이 다 있는지</li>
            <li>왜 파는지 — 한 줄이면 충분해요</li>
          </ul>`, { cls: 'soft' })}
      </div>
      ${o.ban ? `<div class="mt3">${U.box(`<b class="t-card">지금 적힌 글에서 걸린 곳</b>
        <p class="mt2">제목 — ${표시(제목)}</p>
        <p class="mt1">설명 — ${표시(설명)}</p>`)}</div>` : ''}
    </div>`);
}

/** ③ 얼마에 파나요 */
function 값칸(o = {}) {
  const it = IT();
  const 빔 = (o.missing || []).includes('가격');
  return U.card('', `
    <div class="fld">
      <label class="lb" for="pr">가격 <span class="req">*</span></label>
      <div class="row-c" style="gap:8px">
        <input class="input${빔 ? ' err' : ''}" id="pr" type="text" inputmode="numeric" style="flex:1;max-width:280px"
          value="${빔 ? '' : U.num(it.price)}" placeholder="숫자만 적어 주세요">
        <span class="nowrap">원</span>
        ${o.fromMarket ? U.badge('시세에서 가져옴', 'b-acc') : ''}
      </div>
      ${빔 ? '<p class="help err">가격을 적어 주세요. 거저 주실 거라면 아래 「나눔」을 골라 주세요.</p>'
    : '<p class="help">세 자리마다 쉼표가 자동으로 붙어요.</p>'}
      <label class="check mt2"><input type="checkbox" data-toast="나눔으로 바꿨어요 · 가격이 0원이 됩니다"><span>나눔(0원)으로 드릴게요</span></label>
    </div>

    <div class="fld">
      <div class="toggle-row">
        <span><b>가격 제안 받기</b><div class="t-sub">이웃이 값을 깎아 달라고 먼저 말 걸 수 있어요</div></span>
        <button class="toggle on" type="button" aria-pressed="true" aria-label="가격 제안 받기"></button>
      </div>
      <div class="sub-fld mt3">
        <label class="lb" for="om">제안 받을 최저 금액</label>
        <div class="row-c" style="gap:8px">
          <input class="input" id="om" type="text" inputmode="numeric" style="flex:1;max-width:280px" value="${U.num(it.offerMin)}">
          <span class="nowrap">원부터</span>
        </div>
        <p class="help">이 금액보다 낮은 제안은 아예 오지 않아요.</p>
      </div>
    </div>

    ${U.banner('info', '📊', `<b>비슷한 물건은 얼마에 팔렸을까요?</b>
      <div class="t-sub mt1">최근 3개월 거래 ${SL_PERIODS[1].n}건 · 평균 ${U.won(SL_AVG)}</div>`,
  { right: U.btn('얼마에 팔까 보기', { href: 'SL-03', cls: 'btn-ghost btn-sm' }) })}`);
}

/** ④ 어떻게 거래하나요 */
function 거래칸(o = {}) {
  const it = IT();
  const 빔 = (o.missing || []).includes('거래 방식');
  const 잠김 = !!o.townLock;
  return U.card('', `
    <div class="fld">
      <span class="lb" id="ways">거래 방식 <span class="req">*</span></span>
      ${['직거래', '택배', '안전결제'].map((w) => `<label class="check"><input type="checkbox"${(!빔 && it.ways.includes(w)) ? ' checked' : ''}
        data-toast="${w} 거래를 켰어요"><span>${w}${w === '안전결제' ? ' <span class="t-sub">(수수료 3.5%)</span>' : ''}</span></label>`).join('')}
      ${빔 ? '<p class="help err">거래 방식을 한 가지 이상 골라 주세요.</p>' : ''}
      <div class="sub-fld mt3">
        <label class="lb" for="sh">배송비 <span class="t-sub">— 택배를 켜면 열려요</span></label>
        <div class="row-c" style="gap:8px">
          <input class="input" id="sh" type="text" inputmode="numeric" style="flex:1;max-width:240px" value="${U.num(it.ship)}">
          <span class="nowrap">원</span>
        </div>
      </div>
      ${U.banner('ok', '🛡', `<b>안전결제를 켜면</b>
        <div class="t-sub mt1">사는 분이 돈을 보내도 바로 받지 못하고, 물건을 받았다고 눌러야 정산됩니다.
        수수료 ${(FEE_RATE * 100).toFixed(1)}%가 정산할 때 빠져요 — ${U.won(it.price)}이면 ${U.won(fee(it.price))}입니다.</div>`,
    { cls: 'mt3', right: U.btn('안전결제 안내', { href: 'PA-01', cls: 'btn-ghost btn-sm' }) })}
    </div>

    <div class="fld">
      <span class="lb">직거래 가능 지역</span>
      ${잠김
    ? `<div class="chips">${['역삼동', '논현동', '삼성동'].map((t) => `<button class="chip" type="button" disabled title="동네 인증을 마쳐야 고를 수 있어요">🔒 ${t}</button>`).join('')}</div>
       ${U.banner('warn', '📍', `<b>동네를 인증해야 고를 수 있어요</b>
         <div class="t-sub mt1">동네 인증은 지금 계신 자리를 한 번 확인하는 것이라 1분이면 끝나요.
         인증 전에는 직거래 지역을 고를 수 없고, 등록 버튼도 함께 잠깁니다.</div>`,
      { cls: 'mt3', right: U.btn('동네 인증하기', { href: 'SE-01', cls: 'btn-acc btn-sm' }) })}`
    : `${U.chips([TOWNS.mine, '논현동'], [0])}
       <p class="help">등록하고 인증한 동네에서만 고를 수 있어요.
         <a class="link" href="${U.link('SE-01')}">내 동네 설정</a></p>`}
    </div>`);
}

/** 금지 품목 안내 띠 — 화면 아래쪽에 늘 둔다 */
const 금지띠 = (o = {}) => (o.ban
  ? U.banner('dan', '🚫', `<b>금지 품목으로 걸린 낱말이 ${SL_BAN_HIT.length}개 있어요</b>
      <div class="t-sub mt1">그대로 올리면 <b>검토 없이 숨겨질 수 있고</b>, 되풀이되면 이용이 제한돼요.
      걸린 말을 고치고 올려 주세요.</div>`,
  { right: U.btn('금지 품목 보기', { href: 'HO-03', cls: 'btn-ghost btn-sm' }) })
  : U.banner('warn', '🚫', `<b>이런 물건은 올릴 수 없어요</b>
      <div class="t-sub mt1">${BANNED.filter((b) => b.on).map((b) => b.k).join(' · ')}</div>`,
  { right: U.btn('금지 품목 보기', { href: 'HO-03', cls: 'btn-ghost btn-sm' }) }));

/** 오른쪽 액션 패널 — 상태를 바꾸는 단추(등록·임시저장)는 «전부» 여기 모은다 */
function 작성패널(o = {}) {
  const 빈것 = o.missing || [];
  const 잠김 = 빈것.length > 0 || !!o.townLock;
  const 까닭 = 빈것.length
    ? `필수 항목 ${빈것.length}개가 비어 있어요 — ${빈것.join(' · ')}`
    : '동네 인증을 마쳐야 등록할 수 있어요';

  const 버튼 = (잠김
    ? U.btn('등록하기', { cls: 'btn-pri', off: true })
    : U.btn('등록하기', { cls: 'btn-pri', href: 'SL-04' }))
    + U.btn('미리보기', { cls: 'btn-ghost', attr: ' data-toast="목록에서 어떻게 보이는지 보여드릴게요"' })
    + U.btn('임시 저장', { cls: 'btn-quiet', attr: ' data-toast="쓰던 글을 저장했어요 · 30일 동안 보관돼요"' });

  return U.actPanel('등록 준비', `
    ${검사목록(빈것)}
    ${잠김
    ? U.banner('dan', '⛔', `<b>등록이 잠겨 있어요</b><div class="t-sub mt1">${까닭}</div>`, { cls: 'mt3' })
    : U.banner('ok', '✓', '<b>필수 항목을 다 적었어요</b><div class="t-sub mt1">지금 올리면 바로 이웃에게 보입니다.</div>', { cls: 'mt3' })}
    ${빈것.length ? `<div class="mt3 stack-sm">${빈것.map((k) => `<div class="row-c" style="gap:6px"><b class="danger">✕</b>
      <a class="link" href="#${k === '사진' ? 'photo' : (k === '가격' ? 'pr' : 'ways')}">${k} 적으러 가기</a></div>`).join('')}</div>` : ''}
    ${o.townLock ? `<div class="mt3">${U.btn('동네 인증하러 가기', { href: 'SE-01', cls: 'btn-acc btn-sm' })}</div>` : ''}`,
  버튼)
    + U.actPanel('같이 보면 좋아요', '',
      U.btn('사진 정리하기', { href: 'SL-02', cls: 'btn-ghost' })
      + U.btn('얼마에 팔까 보기', { href: 'SL-03', cls: 'btn-ghost' })
      + U.btn('금지 품목 보기', { href: 'HO-03', cls: 'btn-ghost' }));
}

/** 판매글 작성 — 기준 화면과 다섯 상태가 모두 이 함수를 지난다 */
function 작성본문(o = {}) {
  const 빈것 = o.missing || [];
  const 적은수 = SL_REQUIRED.length - 빈것.length;
  return `
${U.pageHd('판매글 쓰기', '사진과 상태를 적어 주시면 이웃이 바로 볼 수 있어요',
    `<div class="btns">${U.btn('사진 정리하기', { href: 'SL-02', cls: 'btn-ghost' })}${U.btn('얼마에 팔까', { href: 'SL-03', cls: 'btn-ghost' })}</div>`)}

${U.kpis([
    ['오늘 이 분류에 올라온 글', U.num(SL_DONE.todayCat), { unit: '건', d: '생활가전 · 청소기', href: 'SE-02' }],
    ['비슷한 물건 평균 거래', SL_DONE.avgDays, { tone: 'k-acc', d: `최근 3개월 ${SL_PERIODS[1].n}건 기준`, href: 'SL-03' }],
    ['이 동네에서 볼 이웃', U.num(SL_DONE.neighbors), { unit: '명', tone: 'k-ok', d: `${TOWNS.mine} 인증 회원` }],
    ['다 적은 필수 항목', `${적은수}/${SL_REQUIRED.length}`, {
      unit: '개', tone: 빈것.length ? 'k-danger' : 'k-mut',
      d: 빈것.length ? `${빈것.join(' · ')}이 비었어요` : '모두 적었어요',
    }],
  ])}

${U.stepbar(['사진', '무엇을', '얼마에', '어떻게 거래'], o.step == null ? 0 : o.step)}

<div class="mt6">${U.detailSplit(`
  ${U.sec('① 사진', 사진칸(o))}
  ${U.sec('② 무엇을 파나요', 무엇칸(o))}
  ${U.sec('③ 얼마에 파나요', 값칸(o))}
  ${U.sec('④ 어떻게 거래하나요', 거래칸(o))}
  ${금지띠(o)}`, 작성패널(o))}</div>`;
}

/* ════════════════════════════════════════════════════════════
   SL-02 사진 등록·정리
   ════════════════════════════════════════════════════════════ */

const 사진KPI = (o = {}) => U.kpis([
  ['올린 사진', `${o.up == null ? 4 : o.up}`, { unit: `/ ${SL_PHOTO_MAX}장`, d: '첫 장이 목록에 보여요' }],
  ['대표 사진', o.rep || '1번째', { tone: 'k-acc', d: '맨 앞 사진이 대표예요' }],
  ['올리는 중', o.ing == null ? '1' : String(o.ing), { unit: '장', tone: 'k-ok', d: o.ing === 0 ? '모두 올라갔어요' : '62% · 잠시만요' }],
  ['못 올린 사진', String(o.fail == null ? 1 : o.fail), { unit: '장', tone: (o.fail === 0 ? 'k-mut' : 'k-danger'), d: o.fail === 0 ? '없어요' : 'heic 형식' }],
]);

/** 사진 한 칸 */
function 사진셀(p, o = {}) {
  if (p.st === '올리는중') {
    return `<div class="photo-cell up"><div class="up-in">
      <div class="t-sub">올리는 중 · ${p.pct}%</div>${U.progress(p.pct)}</div></div>`;
  }
  if (p.st === '실패') {
    return `<div class="photo-cell" style="border-color:var(--danger)">
      <button class="del" type="button" data-toast="못 올린 사진을 지웠어요" aria-label="사진 지우기">✕</button>
      ${U.phItem(140, 'i1x' + p.n)}
      <div class="tools"><span class="help err" style="margin:0">올리기 실패</span>
        <button class="btn btn-quiet btn-xs" type="button" data-toast="다시 올리고 있어요">다시 시도</button></div></div>`;
  }
  return `<div class="photo-cell">
    ${p.rep ? `<span class="rep">${U.badge('대표', 'b-pri')}</span>` : ''}
    ${p.st === '줄임' ? `<span class="rep" style="left:auto;right:34px">${U.badge('줄임', 'b-ok')}</span>` : ''}
    <button class="del" type="button" data-toast="${p.n}번째 사진을 지웠어요" data-toast-act="되돌리기" aria-label="사진 지우기">✕</button>
    ${U.phItem(140, 'i1p' + p.n)}
    <div class="tools">
      <button class="btn btn-quiet btn-xs" type="button" data-toast="${p.n}번째 사진을 대표로 정했어요 · 맨 앞으로 옮겼어요">대표로</button>
      <button class="btn btn-quiet btn-xs" type="button" data-modal="crop">자르기</button>
      <button class="btn btn-quiet btn-xs" type="button" data-toast="90도 돌렸어요">회전</button>
    </div></div>`;
}

/** 오른쪽 액션 패널 — 목록 미리보기 + 다음으로 가는 단추 */
function 사진패널(o = {}) {
  const it = IT();
  const 없음 = o.up === 0;
  return U.actPanel('목록에서 이렇게 보여요', `
    <div class="row-c" style="gap:10px;align-items:flex-start">
      ${U.phItem(64, o.repSeed || 'i1p1')}
      <div style="min-width:0">
        <b style="display:block">${U.esc(it.t)}</b>
        <div class="t-sub">${U.esc(it.town)} · ${ago(it.min)}</div>
        <div class="price">${U.won(it.price)}</div>
      </div>
    </div>
    <p class="t-sub mt3">맨 앞(대표) 사진이 이 자리에 들어갑니다.</p>`,
  '')
    + U.actPanel('사진 규칙', U.kv([['최대 장수', `${SL_PHOTO_MAX}장`], ['형식', 'jpg · png · webp'], ['한 장 크기', '10MB까지'], ['꼭 필요한 것', '최소 1장']]),
      (없음
        ? U.btn('다음으로', { cls: 'btn-pri', off: true })
        : U.btn('등록하기', { cls: 'btn-pri', href: 'SL-04' }))
      + U.btn('판매글로 돌아가기', { href: 'SL-01', cls: 'btn-ghost' })
      + (없음 ? '<p class="help err" style="margin:0">사진을 최소 1장 올려 주세요</p>' : ''))
    + U.actPanel('사진 잘 찍는 법', `<ul class="dots t-sub">${SL_PHOTO_TIPS.map((t) => `<li>${t}</li>`).join('')}</ul>`, '');
}

const 자르기모달 = () => U.modal('crop', '사진 자르기', `
  <p class="t-sub mb3">정사각 틀 안으로 끌어 맞춰 주세요. 목록에서는 이 모양으로 보입니다.</p>
  <div class="center">${U.phItem(240, 'i1crop')}</div>
  <div class="row-c mt3" style="gap:8px"><span class="t-sub nowrap">확대</span>${U.progress(40)}</div>
  <div class="btns mt3">
    <button class="btn btn-ghost btn-sm" type="button" data-toast="왼쪽으로 90도 돌렸어요">↺ 90°</button>
    <button class="btn btn-ghost btn-sm" type="button" data-toast="오른쪽으로 90도 돌렸어요">↻ 90°</button>
  </div>
  <p class="help mt3">자른 뒤에도 원본은 남아 있어서 언제든 되돌릴 수 있어요.</p>`,
U.btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })
  + U.btn('이대로 자르기', { cls: 'btn-pri', attr: ' data-dismiss data-toast="사진을 잘랐어요 · 썸네일도 바뀌었어요"' }));

/* ════════════════════════════════════════════════════════════
   SL-03 얼마에 팔까 — 시세 보기
   ════════════════════════════════════════════════════════════ */

/** 가격 분포 — 막대 하나하나가 그 구간의 거래 건수다 */
function 분포카드(p, o = {}) {
  const 최대 = Math.max(...p.dist);
  const 많은구간 = SL_BANDS[p.dist.indexOf(최대)];
  return U.card(`가격 분포 · ${p.k}`, `
    ${U.phMap('가격 분포 차트', 800, 300)}
    <div class="bars mt4">
      ${SL_BANDS.map((b, i) => `<div class="bar-row">
        <span class="nowrap t-sub" style="width:76px">${b}</span>
        ${U.progress(최대 ? Math.round(p.dist[i] / 최대 * 100) : 0)}
        <span class="nowrap t-sub" style="width:44px;text-align:right">${p.dist[i]}건</span></div>`).join('')}
    </div>
    <p class="t-sub mt3">모두 <b>${p.n}건</b> · 가장 많은 구간은 <b>${많은구간}</b>예요.</p>
    ${p.few ? U.banner('warn', '📉', `<b>거래가 적어 참고만 하세요</b>
      <div class="t-sub mt1">${p.k} 거래는 ${p.n}건뿐이라 평균이 크게 흔들려요. 3개월이나 6개월로 넓혀 보시는 게 좋아요.</div>`, { cls: 'mt3' }) : ''}
    ${o.after || ''}`);
}

const 시세KPI = (o = {}) => U.kpis([
  ['기준 거래 건수', U.num(o.n == null ? SL_PERIODS[1].n : o.n), { unit: '건', d: o.k || SL_PERIODS[1].k }],
  ['평균 거래가', U.num(o.avg == null ? SL_AVG : o.avg), { unit: '원', tone: 'k-acc', d: '상태별 평균에서 계산한 값' }],
  ['지금 올라온 같은 물건', U.num(o.now == null ? 4 : o.now), { unit: '건', tone: 'k-ok', d: '역삼동 · 가까운 동네', href: 'SE-02' }],
  ['32만원에 올리면', SL_GUESS[1].days, { tone: 'k-warn', d: '평균 이만큼 걸려요' }],
]);

const 상태별표 = (rows, o = {}) => U.dashTable(
  [{ t: '물건 상태', w: '150px' }, { t: '평균가' }, { t: '거래 건수', w: '100px' }, { t: '전체에서 차지하는 몫' }, { t: '', w: '120px' }],
  rows.map((c) => ({
    cls: '',
    cells: [
      U.badge(c.k, o.on === c.k ? 'b-pri' : 'b-mut'),
      `<b>${U.won(c.avg)}</b>`,
      `${c.n}건`,
      U.progress(Math.round(c.n / rows.reduce((a, x) => a + x.n, 0) * 100)),
      o.on === c.k
        ? U.btn('전체 보기', { href: 'SL0301', cls: 'btn-ghost btn-xs' })
        : U.btn('이 상태만', { href: 'SL0303', cls: 'btn-ghost btn-xs' }),
    ],
  })),
  { max: '340px' },
);

const 사례표 = (rows) => U.dashTable(
  [{ t: '언제', w: '120px' }, { t: '얼마에' }, { t: '물건 상태', w: '130px' }, { t: '팔리기까지', w: '110px' }],
  rows.map((r) => [r.at, `<b>${U.won(r.price)}</b>`, U.badge(r.cond, 'b-mut'), r.days || '—']),
);

/* ════════════════════════════════════════════════════════════
   SL-05 내 판매글 관리
   ════════════════════════════════════════════════════════════ */

const 찜합 = SL_MY.reduce((a, r) => a + r.wish, 0);

const 관리KPI = () => U.kpis([
  ['판매중', U.num(SL_MY_CNT('판매중')), { unit: '건', d: `모두 ${SL_MY.length}개 올려 두셨어요` }],
  ['예약중', U.num(SL_MY_CNT('예약중')), { unit: '건', tone: 'k-acc', d: '약속을 잡은 물건' }],
  ['모두 받은 조회', U.num(SL_MY_VIEW), { unit: '회', tone: 'k-ok', d: `찜 ${찜합} · 채팅 ${SL_MY_CHAT}` }],
  ['지금 끌올 가능', U.num(SL_BOOST_READY), { unit: '건', tone: 'k-warn', d: '무료 끌올은 24시간마다', href: 'BS-01' }],
]);

/** 끌올 칸 — 잠긴 것은 <button disabled> 로 두고 남은 시간을 함께 적는다 */
function 끌올칸(r) {
  if (r.boost === '진행중') return `${U.badge('끌올 진행중', 'b-acc')}`;
  if (r.boost === '가능') return U.btn('무료 끌올', { href: 'BS-01', cls: 'btn-pri btn-xs' });
  if (r.boost === '대기') {
    return `${U.btn('무료 끌올', { cls: 'btn-ghost btn-xs', off: true })}
      <div class="t-sub nowrap" style="margin-top:2px">${r.left} 뒤</div>`;
  }
  return '<span class="t-sub">—</span>';
}

/** 내 판매글 한 줄 — 표의 한 행 */
function 관리행(r, o = {}) {
  const it = SL_itemBy(r.id);
  return {
    data: { st: r.st, i: r.id },
    cls: '',
    cells: [
      ...(o.pick === false ? [] : [`<label class="check none"><input type="checkbox" data-pick aria-label="${U.esc(it.t)} 고르기"></label>`]),
      `<span class="row-c">${U.phItem(40, it.id)}<span>
        <a class="strong" href="${U.link('SE-04')}">${U.esc(it.t)}</a>
        <span class="row-c" style="gap:4px;margin-top:2px">${r.boost === '진행중' ? U.boostBadge() : ''}${U.badge(it.cond, 'b-mut')}${r.old ? U.badge('목록에서 내려감', 'b-warn') : ''}</span>
      </span></span>`,
      `<b class="nowrap">${U.won(it.price)}</b>`,
      `<span class="t-sub nowrap">${r.at}</span>`,
      `<span class="t-sub nowrap">조회 ${r.view} · 찜 ${r.wish} · 채팅 ${r.chat}</span>`,
      /* 배지에 data-badge-of 를 달아 둔다 — 같은 줄의 드롭다운을 바꾸면 app.js 가 이 배지를 갈아 끼운다 */
      `<span class="badge ${ST_CLS[r.st] || 'b-mut'}" data-badge-of>${r.st}</span>`,
      끌올칸(r),
      r.st === '거래완료'
        ? `<div class="row-c" style="gap:6px;flex-wrap:wrap">
            ${U.btn('후기 쓰기', { href: 'MY-04', cls: 'btn-pri btn-xs' })}
            ${U.btn('다시 올리기', { href: 'SL-01', cls: 'btn-quiet btn-xs' })}
          </div>`
        : `<div class="row-c" style="gap:6px;flex-wrap:nowrap">
            <select class="input" style="width:100px;height:32px;font-size:13px;padding:0 8px" data-row-badge aria-label="상태 바꾸기">
              ${SL_STATES.map((s) => `<option${s === r.st ? ' selected' : ''}>${s}</option>`).join('')}</select>
            <button class="btn btn-quiet btn-xs" type="button" data-modal="done">거래완료</button>
            <button class="btn btn-quiet btn-xs" type="button" data-modal="more" aria-label="더 보기">⋯</button>
          </div>`,
    ],
  };
}

const 관리머리 = (o = {}) => [
  ...(o.pick === false ? [] : [{ t: '', w: '40px' }]),
  { t: '물건' }, { t: '값', w: '110px' }, { t: '올린 날', w: '96px' },
  { t: '반응', w: '176px' }, { t: '상태', w: '80px' }, { t: '끌올', w: '104px' }, { t: '상태 바꾸기', w: '210px' },
];

/** 내 판매글 표와 «반드시 함께» 나가는 모달 둘.
   ⛔ 표의 단추가 data-modal 로 여는 것들이다 — 표만 두고 이걸 빼면 눌러도 아무 일이 없다. */
const 모달들 = () => `
${U.modal('more', '이 글 다루기', `
  <div class="stack-sm">
    <a class="tile" href="${U.link('SL-01')}"><span class="nm">✎ 수정하기</span><span class="t-sub">제목 · 사진 · 값 · 설명을 고칩니다</span></a>
    <a class="tile" href="${U.link('SL0505')}"><span class="nm">↓ 가격 내리기</span><span class="t-sub">찜한 이웃에게 알림이 갑니다</span></a>
    <a class="tile" href="${U.link('BS-01')}"><span class="nm">↑ 끌올하기</span><span class="t-sub">목록 맨 위로 올립니다</span></a>
    <button class="tile" type="button" style="text-align:left" data-dismiss data-toast="숨겼어요 · 목록에서 보이지 않아요" data-toast-act="되돌리기">
      <span class="nm">🙈 숨기기</span><span class="t-sub">목록에서 내려가지만 글은 남아 있어요</span></button>
    <button class="tile" type="button" style="text-align:left" data-dismiss data-toast="글을 지웠어요" data-toast-act="되돌리기">
      <span class="nm danger">🗑 삭제하기</span><span class="t-sub">되돌릴 수 있는 시간은 30초예요</span></button>
  </div>`,
    U.btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' }))}

${U.modal('done', '누구와 거래하셨나요?', 구매자고르기(),
    U.btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })
    + U.btn('거래완료로 바꾸고 후기 쓰기', { href: 'MY-04', cls: 'btn-pri' }))}`;
/* ⚠ 「가격 내리기」는 모달을 따로 두지 않는다 — ⋯ 메뉴에서 SL0505 화면으로 간다.
   열 길 없는 template 을 남겨 두면 눌러도 아무 일이 없는 단추가 생긴다. */

/** 거래완료로 바꿀 때 — 누구와 거래했나 */
const 구매자고르기 = (o = {}) => `
  <p class="t-sub mb3">이 물건으로 이야기한 이웃 ${SL_BUYERS.length}명이에요. 고르시면 그분에게 후기를 남길 수 있어요 — 후기는 <b>서로</b> 남깁니다.</p>
  <div class="stack-sm">
    ${SL_BUYERS.map((b, i) => {
  const u = userBy(b.who);
  return `<label class="radio-in box${i === 0 ? ' on' : ''}">
      <input type="radio" name="buyer"${i === 0 ? ' checked' : ''}>
      <span class="grow">
        <span class="row-b"><b>${U.esc(u.nick)}</b>${U.manner(u.manner)}</span>
        <span class="t-sub" style="display:block">「${U.esc(b.last)}」 · ${b.at}</span>
      </span></label>`;
}).join('')}
    <label class="radio-in box"><input type="radio" name="buyer">
      <span><b>채팅 밖에서 거래했어요</b><span class="t-sub" style="display:block">이웃을 고르지 않고 거래완료로만 바꿉니다 — 후기는 남길 수 없어요</span></span></label>
  </div>
  ${o.count === false ? '' : '<p class="help mt3">고른 이웃 <b>1명</b> · 아무도 고르지 않으면 아래 단추가 잠깁니다.</p>'}`;

/** 가격 내리기 — 이전 값보다 낮은지 검사한다 */
const 가격내리기 = (o = {}) => {
  const it = IT();
  const 새값 = o.newPrice || 295000;
  return `
  <p class="t-sub mb3">값을 내리면 이 물건을 찜한 <b>${it.wish}명</b>에게 알림이 갑니다. 목록에는 <b>「내림」</b> 표시가 붙어요.</p>
  ${U.kv([['물건', U.esc(it.t)], ['지금 가격', U.won(it.price)]])}
  <div class="fld mt4">
    <label class="lb" for="np">새 가격</label>
    <div class="row-c" style="gap:8px">
      <input class="input${o.err ? ' err' : ''}" id="np" type="text" inputmode="numeric" style="flex:1"
        value="${U.num(o.err ? 350000 : 새값)}"><span class="nowrap">원</span></div>
    ${o.err
    ? '<p class="help err">지금 가격보다 높아요. 값 올리기는 「수정」에서 해 주세요.</p>'
    : `<p class="help">${U.num(it.price - 새값)}원 내려요.</p>`}
  </div>
  ${o.err ? '' : U.box(`<b class="t-card">내린 뒤에는 이렇게 보여요</b>
    <div class="mt2">${U.priceDown(it.price, 새값)}</div>`, { cls: 'soft' })}`;
};

/* ════════════════════════════════════════════════════════════
   화면들
   ════════════════════════════════════════════════════════════ */
export const PAGES = {

  /* ── SL01 판매글 작성 ─────────────────────────────── */
  SL0101(ctx) {
    return {
      body: 작성본문({}) + 다른상태([
        ['SL0102', '카테고리별 추가 항목'], ['SL0103', '물건 상태 고르기'], ['SL0104', '동네 미인증 잠금'],
        ['SL0105', '필수 항목 누락'], ['SL0106', '금지 품목 걸림'],
      ]),
      o: {},
    };
  },

  SL0102(ctx) {
    return {
      body: 작성본문({ cat: '디지털기기', sub: '휴대폰', catNote: true, step: 1 }),
      o: { state: '소분류를 「청소기 → 휴대폰」으로 바꿔 전용 항목이 갈아 끼워진 상태' },
    };
  },

  SL0103(ctx) {
    const 본문 = 작성본문({ cond: '고장', step: 1 })
      + U.sec('상태를 고르면 도움말이 이렇게 바뀌어요', U.dashTable(
        [{ t: '물건 상태', w: '140px' }, { t: '이럴 때 고르세요', w: '260px' }, { t: '이렇게 적으면 좋아요' }],
        CONDS.map((c) => ({
          cls: c.k === '고장' ? 'over' : '',
          cells: [U.badge(c.k, c.k === '고장' ? 'b-danger' : 'b-mut'), c.d, c.tip],
        })),
      ), { desc: '고른 단계에 맞는 예시 문구가 바로 아래에 나타납니다. 「고장·부품용」은 고지 의무 안내가 하나 더 붙어요.' });
    return { body: 본문, o: { state: '「고장」을 골라 고지 의무 안내가 붙은 상태' } };
  },

  SL0104(ctx) {
    return {
      body: 작성본문({ townLock: true, step: 3 }),
      o: { state: '동네 인증 전 — 직거래 지역과 등록 버튼이 함께 잠긴 상태' },
    };
  },

  SL0105(ctx) {
    const 본문 = U.banner('dan', '⚠', `<b>필수 항목 ${SL_MISSING.length}개가 비어 있어요</b>
      <div class="t-sub mt1">등록하기를 누르면 <b>첫 번째 빈 칸(${SL_MISSING[0]})</b>으로 화면이 올라가고, 빈 칸은 붉게 표시됩니다.</div>`,
    { right: U.btn('빈 칸으로 가기', { cls: 'btn-danger btn-sm', attr: ' data-toast="첫 번째 빈 칸으로 옮겼어요"' }) })
      + `<div class="mt6">${작성본문({ missing: SL_MISSING })}</div>`;
    return { body: 본문, o: { state: `필수 항목 ${SL_MISSING.length}개 누락 — 등록 버튼이 잠긴 상태` } };
  },

  SL0106(ctx) {
    const 본문 = 작성본문({ ban: true, step: 1 })
      + U.sec('걸린 낱말', U.dashTable(
        [{ t: '걸린 말', w: '130px' }, { t: '어디에서', w: '120px' }, { t: '왜 안 되나요' }, { t: '그대로 올리면', w: '140px' }],
        SL_BAN_HIT.map((h) => [U.badge(h.w, 'b-danger'), h.where, h.why, U.badge(h.act, 'b-warn')]),
      ), {
        desc: '제목과 상세 설명을 저장하기 전에 한 번 훑어 걸러 냅니다. 걸린 말이 있어도 등록은 막지 않지만, 올린 뒤 숨겨질 수 있어요.',
        aside: U.btn('금지 품목 보기', { href: 'HO-03', cls: 'btn-ghost btn-sm' }),
      })
      + U.banner('warn', '📌', `<b>「${BANNED.filter((b) => b.on).map((b) => b.k)[0]}」처럼 이름만 닮은 물건은 팔 수 있어요</b>
        <div class="t-sub mt1">담배 케이스 · 주류 진열장 · 위스키 잔은 금지 품목이 아니에요.
        제목에 「잔」·「케이스」처럼 물건을 또렷하게 적으면 걸리지 않습니다.</div>`);
    return { body: 본문, o: { state: '제목·설명에서 금지 낱말 2개가 걸린 상태' } };
  },

  /* ── SL02 사진 등록·정리 ──────────────────────────── */
  SL0201(ctx) {
    const 올린것 = SL_PHOTOS.filter((p) => p.st === '올림' || p.st === '줄임');
    const 왼쪽 = `
      ${U.card('사진 올리기', `
        <div class="drop">
          <div class="ic">🖼</div>
          <b>사진을 끌어다 놓거나 눌러서 고르세요</b>
          <p class="t-sub mt1">최대 ${SL_PHOTO_MAX}장 · ${SL_PHOTO_RULE}</p>
          <div class="btns center mt3">${U.btn('사진 고르기', { cls: 'btn-pri', attr: ' data-toast="사진을 골라 주세요 · 여러 장을 한꺼번에 고를 수 있어요"' })}</div>
        </div>`)}

      <div class="mt-block">${U.card(`올린 사진 ${올린것.length}장`, `
        <div class="photo-grid">${SL_PHOTOS.map((p) => 사진셀(p)).join('')}</div>
        <p class="t-sub mt3">카드를 끌어서 순서를 바꿀 수 있어요. <b>맨 앞 사진이 대표</b>가 됩니다.</p>`)}</div>

      <div class="mt-block">${U.banner('ok', '🗜', `<b>큰 사진은 자동으로 줄였어요</b>
        <div class="t-sub mt1">4번째 사진 12MB → 3MB. 화면에서 보이는 데는 차이가 없어요.</div>`)}</div>

      <div class="mt-block">${U.banner('dan', '⚠', `<b>3번째 사진을 못 올렸어요</b>
        <div class="t-sub mt1">heic 형식은 아직 받지 못해요. jpg 나 png 로 바꿔서 올려 주세요.</div>`,
      { right: U.btn('다시 시도', { cls: 'btn-ghost btn-sm', attr: ' data-toast="다시 올리고 있어요"' }) })}</div>

      ${U.sec('올린 사진 차례', U.dashTable(
        [{ t: '차례', w: '70px' }, { t: '사진' }, { t: '형편', w: '150px' }, { t: '', w: '210px' }],
        SL_PHOTOS.map((p) => [
          p.rep ? `<b>1 ${U.badge('대표', 'b-pri')}</b>` : `<b>${p.n}</b>`,
          `<span class="row-c">${U.phItem(36, 'i1p' + p.n)}<span class="t-sub">사진 ${p.n}</span></span>`,
          p.st === '실패' ? U.badge('올리기 실패', 'b-danger')
            : (p.st === '올리는중' ? U.badge('올리는 중 62%', 'b-pri')
              : (p.st === '줄임' ? U.badge('자동으로 줄임', 'b-ok') : U.badge('올림', 'b-mut'))),
          `<div class="btns">
            <button class="btn btn-quiet btn-xs" type="button" data-toast="${p.n}번째 사진을 대표로 정했어요">대표로</button>
            <button class="btn btn-quiet btn-xs" type="button" data-modal="crop">자르기·회전</button>
            <button class="btn btn-quiet btn-xs" type="button" data-toast="${p.n}번째 사진을 지웠어요" data-toast-act="되돌리기">삭제</button>
          </div>`,
        ]),
      ), { desc: '차례를 바꾸면 대표 배지도 따라 옮겨집니다.', more: 'SL0202', moreLabel: '순서 바꾸는 모습 보기' })}

      ${자르기모달()}`;
    return {
      body: `${U.pageHd('사진 등록·정리', '물건 사진이 이 장터의 첫인상이에요',
        `<div class="btns">${U.btn('판매글로 돌아가기', { href: 'SL-01', cls: 'btn-ghost' })}</div>`)}
${사진KPI({ up: 올린것.length })}
<div class="mt6">${U.detailSplit(왼쪽, 사진패널({ up: 올린것.length }))}</div>
${다른상태([['SL0202', '순서 바꾸기'], ['SL0203', '대표 사진 지정'], ['SL0204', '자르기·회전'], ['SL0205', '업로드 실패']])}`,
      o: {},
    };
  },

  SL0202(ctx) {
    const 차례 = [2, 1, 4, 5];
    const 왼쪽 = `
      ${U.banner('acc', '✋', `<b>3번째 카드를 맨 앞으로 끌고 있어요</b>
        <div class="t-sub mt1">놓일 자리는 점선 빈 칸으로 보여 드립니다. 손을 놓으면 그 자리에 들어가고,
        맨 앞에 놓으면 <b>대표 배지가 따라 옮겨집니다.</b></div>`)}

      <div class="mt-block">${U.card('끌어서 순서 바꾸는 중', `
        <div class="photo-grid">
          <div class="photo-cell" style="border:2px dashed var(--primary);background:var(--pri-06);min-height:150px">
            <div class="up-in center" style="padding:20px 0"><span class="t-sub">여기에 놓입니다</span></div></div>
          ${차례.map((n, i) => `<div class="photo-cell"${i === 0 ? ' style="opacity:.55"' : ''}>
            ${i === 0 ? `<span class="rep">${U.badge('대표', 'b-pri')}</span>` : ''}
            ${U.phItem(140, 'i1p' + n)}
            <div class="tools"><span class="t-sub">${i + 2}번째</span></div></div>`).join('')}
        </div>
        <p class="t-sub mt3">놓기 전 차례 — 1 · 2 · <b>3(끌고 있음)</b> · 4 · 5</p>`)}</div>

      ${U.sec('놓으면 이렇게 바뀌어요', U.dashTable(
        [{ t: '차례', w: '80px' }, { t: '놓기 전' }, { t: '놓은 뒤' }, { t: '대표', w: '90px' }],
        [
          ['1', '사진 1 (대표)', '<b>사진 3</b>', U.badge('여기로 옮겨짐', 'b-pri')],
          ['2', '사진 2', '사진 1', ''],
          ['3', '사진 3 (끌고 있음)', '사진 2', ''],
          ['4', '사진 4', '사진 4', ''],
          ['5', '사진 5', '사진 5', ''],
        ],
      ), { desc: '대표 배지는 «맨 앞» 사진을 따라다닙니다. 따로 다시 지정하지 않아도 돼요.' })}`;
    return {
      body: `${U.pageHd('사진 순서 바꾸기', '끌어다 놓아 차례를 바꿉니다')}
${사진KPI({ up: 4, rep: '끌고 있음', ing: 0, fail: 0 })}
<div class="mt6">${U.detailSplit(왼쪽, 사진패널({ up: 4, repSeed: 'i1p3' }))}</div>`,
      o: { state: '카드를 끌어 옮기는 중 — 놓일 자리를 빈 칸으로 보여 주는 상태' },
    };
  },

  SL0203(ctx) {
    const 뒤 = [3, 1, 2, 5];
    const 왼쪽 = `
      ${U.banner('ok', '⭐', `<b>3번째 사진을 대표로 정했어요</b>
        <div class="t-sub mt1">대표로 정하면 <b>맨 앞으로 옮겨지고</b>, 목록 미리보기 썸네일이 바로 바뀝니다.</div>`)}

      <div class="mt-block">${U.card('대표를 정한 뒤', `
        <div class="photo-grid">${뒤.map((n, i) => `<div class="photo-cell">
          ${i === 0 ? `<span class="rep">${U.badge('대표', 'b-pri')}</span>` : ''}
          <button class="del" type="button" data-toast="사진을 지웠어요" aria-label="사진 지우기">✕</button>
          ${U.phItem(140, 'i1p' + n)}
          <div class="tools">
            ${i === 0 ? '<span class="t-sub">지금 대표</span>' : `<button class="btn btn-quiet btn-xs" type="button" data-toast="${i + 1}번째 사진을 대표로 정했어요">대표로</button>`}
            <button class="btn btn-quiet btn-xs" type="button" data-modal="crop">자르기</button>
          </div></div>`).join('')}</div>`)}</div>

      ${U.sec('목록 썸네일이 바뀐 모습', `<div class="g2">
        ${U.card('바꾸기 전', `<div class="row-c" style="gap:10px">${U.phItem(64, 'i1p1')}
          <div><b>${U.esc(IT().t)}</b><div class="t-sub">사진 1이 대표였어요</div></div></div>`)}
        ${U.card('바꾼 뒤', `<div class="row-c" style="gap:10px">${U.phItem(64, 'i1p3')}
          <div><b>${U.esc(IT().t)}</b><div class="t-sub">사진 3이 대표가 됐어요</div></div></div>`, { cls: 'pri' })}
      </div>`, { desc: '매물 목록·검색 결과·채팅방에 보이는 작은 사진이 모두 이 사진으로 바뀝니다.' })}

      ${자르기모달()}`;
    return {
      body: `${U.pageHd('대표 사진 지정', '목록에 보이는 한 장을 고릅니다')}
${사진KPI({ up: 4, rep: '3번째 사진', ing: 0, fail: 0 })}
<div class="mt6">${U.detailSplit(왼쪽, 사진패널({ up: 4, repSeed: 'i1p3' }))}</div>`,
      o: { state: '3번째 사진을 대표로 정해 맨 앞으로 옮긴 상태' },
    };
  },

  SL0204(ctx) {
    const 왼쪽 = `
      ${U.card('자르기·회전', U.modalStatic('사진 자르기', `
        <p class="t-sub mb3">정사각 틀 안으로 끌어 맞춰 주세요. 목록에서는 이 모양으로 보입니다.</p>
        <div class="center">${U.phItem(260, 'i1crop')}</div>
        <div class="row-c mt4" style="gap:10px"><span class="t-sub nowrap">확대</span>
          <div class="slider grow"><div class="fill"></div><div class="kn" style="left:40%"></div></div>
          <span class="t-sub nowrap">1.4배</span></div>
        <div class="btns mt3">
          <button class="btn btn-ghost btn-sm" type="button" data-toast="왼쪽으로 90도 돌렸어요">↺ 왼쪽 90°</button>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="오른쪽으로 90도 돌렸어요">↻ 오른쪽 90°</button>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="처음 모습으로 되돌렸어요">처음으로</button>
        </div>`,
      U.btn('취소', { cls: 'btn-ghost', attr: ' data-toast="자르기를 그만뒀어요"' })
        + U.btn('이대로 자르기', { cls: 'btn-pri', attr: ' data-toast="사진을 잘랐어요 · 썸네일도 바뀌었어요"' })), { bdCls: 'flush' })}

      <div class="mt-block">${U.banner('info', '🗂', `<b>원본은 그대로 남아 있어요</b>
        <div class="t-sub mt1">자르거나 돌려도 원본 파일은 따로 보관합니다. 나중에 「처음으로」를 누르면 되돌릴 수 있어요.</div>`)}</div>

      ${U.sec('확정하면 바뀌는 곳', U.dashTable(
        [{ t: '어디', w: '190px' }, { t: '무엇이 바뀌나' }, { t: '언제', w: '120px' }],
        [
          ['판매글 사진 격자', '잘린 정사각 모양으로 바뀝니다', '바로'],
          ['목록 썸네일', '대표 사진이면 목록·검색 결과가 함께 바뀝니다', '바로'],
          ['채팅방 물건 카드', '대화 위에 붙는 작은 사진이 바뀝니다', '바로'],
          ['원본 파일', '바뀌지 않고 그대로 보관됩니다', '—'],
        ],
      ))}`;
    return {
      body: `${U.pageHd('사진 자르기·회전', '정사각 틀에 맞춰 보기 좋게 다듬습니다')}
${사진KPI({ up: 4, rep: '1번째', ing: 0, fail: 0 })}
<div class="mt6">${U.detailSplit(왼쪽, 사진패널({ up: 4 }))}</div>`,
      o: { state: '1번째 사진을 정사각 틀에 맞춰 자르는 중' },
    };
  },

  SL0205(ctx) {
    const 실패 = [
      { nm: '주방_01.heic', why: 'heic 형식은 아직 받지 못해요', how: 'jpg 나 png 로 바꿔 주세요', 되풀이: 1 },
      { nm: '헤드_02.jpg', why: '올리는 중에 연결이 끊겼어요', how: '다시 시도하면 대부분 올라가요', 되풀이: 3 },
    ];
    const 왼쪽 = `
      ${U.banner('dan', '⚠', `<b>사진 ${실패.length}장을 못 올렸어요</b>
        <div class="t-sub mt1">나머지 4장은 잘 올라갔어요. 못 올린 것만 다시 시도하시면 됩니다.</div>`,
      { right: U.btn('모두 다시 시도', { cls: 'btn-danger btn-sm', attr: ' data-toast="못 올린 사진 2장을 다시 올리고 있어요"' }) })}

      <div class="mt-block">${U.card('못 올린 사진', U.dashTable(
        [{ t: '파일' }, { t: '왜 안 됐나요' }, { t: '어떻게 하면 되나요' }, { t: '', w: '120px' }],
        실패.map((f) => [
          `<span class="row-c">${U.phItem(36, f.nm)}<b>${f.nm}</b></span>`,
          `<span class="danger">${f.why}</span>`,
          f.how,
          `<button class="btn btn-ghost btn-xs" type="button" data-toast="${f.nm} 을(를) 다시 올리고 있어요">다시 시도</button>`,
        ]),
      ), { bdCls: 'flush' })}</div>

      <div class="mt-block">${U.banner('warn', '🔁', `<b>「헤드_02.jpg」는 세 번째 실패예요</b>
        <div class="t-sub mt1">같은 파일이 거듭 실패하면 사진이 너무 크거나 형식이 맞지 않는 경우가 많아요.
        휴대폰 설정에서 <b>「높은 호환성(jpg)」</b>으로 바꿔 찍거나, 화면 캡처로 저장해 올려 보세요.</div>`,
      { right: U.btn('다른 사진 고르기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="사진을 골라 주세요"' }) })}</div>

      <div class="mt-block">${U.card('잘 올라간 사진 4장', `
        <div class="photo-grid">${SL_PHOTOS.filter((p) => p.st === '올림' || p.st === '줄임').map((p) => 사진셀(p)).join('')}</div>`)}</div>

      ${자르기모달()}`;
    return {
      body: `${U.pageHd('사진 올리기 실패', '못 올린 사진만 따로 다시 시도할 수 있어요')}
${사진KPI({ up: 4, rep: '1번째', ing: 0, fail: 2 })}
<div class="mt6">${U.detailSplit(왼쪽, 사진패널({ up: 4 }))}</div>`,
      o: { state: '사진 2장이 올라가지 않은 상태 — 사유와 다시 시도' },
    };
  },

  /* ── SL03 얼마에 팔까 — 시세 보기 ─────────────────── */
  SL0301(ctx) {
    const it = IT();
    const 같은물건 = ITEMS.filter((x) => x.cat === '생활가전' || x.sub === '청소기' || x.cat === '디지털기기').slice(0, 4);
    const 탭몸통 = SL_PERIODS.map((p, i) => `<div data-pane-body="pr${i}"${i === 1 ? '' : ' hidden'}>${분포카드(p)}</div>`).join('');

    const body = `
${U.pageHd(`${U.esc(it.t.replace(' 팝니다', ''))} 시세`, `최근 3개월 거래 <b>${SL_PERIODS[1].n}건</b> 기준`,
      `<div class="btns">${U.btn('판매글로 돌아가기', { href: 'SL-01', cls: 'btn-ghost' })}${U.btn('같은 물건 매물 보기', { href: 'SE-02', cls: 'btn-ghost' })}</div>`)}

${시세KPI({})}

<div>
  ${U.tabs(SL_PERIODS.map((p, i) => ({ label: p.k, cnt: p.n, pane: 'pr' + i })), 1)}
  <div class="mt4">${탭몸통}</div>
</div>

${U.sec('물건 상태별 평균가', 상태별표(SL_COND_AVG), {
      desc: '행을 고르면 그 상태의 거래만 남기고 평균가를 다시 셉니다.',
      aside: U.btn('상태별로 걸러 보기', { href: 'SL0303', cls: 'btn-ghost btn-sm' }),
    })}

${U.sec('최근 거래 사례', 사례표(SL_RECENT_DEALS), { desc: '언제 · 얼마에 · 어떤 상태로 · 며칠 만에 팔렸는지.' })}

${U.sec('지금 올라와 있는 같은 물건', `<div class="g4">${같은물건.map((x) => U.itemCard(x)).join('')}</div>`, { more: 'SE-02' })}

${U.sec('얼마에 올리면 좋을까요', `<div class="g3">${SL_GUESS.map((g) => U.card('', `
  <p class="t-sub">${g.why}</p>
  <div class="t-sec mt1">${U.won(g.price)}</div>
  <p class="t-sub mt1">평균 <b>${g.days}</b>쯤 걸려요</p>
  <div class="mt3">${U.btn('이 가격으로 정하기', { href: 'SL0304', cls: g.best ? 'btn-pri btn-block btn-sm' : 'btn-ghost btn-block btn-sm' })}</div>`,
      { cls: g.best ? 'pri' : '' })).join('')}</div>`,
      { desc: '값을 1만원 내릴 때마다 팔리기까지 걸리는 날이 하루쯤 줄어드는 물건이에요.' })}

${U.banner('info', '📉', `<b>거래가 적은 물건은 이 화면이 달라져요</b>
  <div class="t-sub mt1">최근 거래가 3건도 안 되면 그래프 대신 「비슷한 물건으로 넓혀 보기」가 나옵니다.</div>`,
      { right: U.btn('그 화면 보기', { href: 'SL0305', cls: 'btn-ghost btn-sm' }) })}

${다른상태([['SL0302', '기간 탭'], ['SL0303', '상태별 필터'], ['SL0304', '이 가격으로 정하기'], ['SL0305', '표본 부족']])}`;
    return { body, o: {} };
  },

  SL0302(ctx) {
    const p = SL_PERIODS[0];
    const 상태1개월 = [
      { k: '새것', avg: 370000, n: 1 },
      { k: '거의 새것', avg: 325000, n: 3 },
      { k: '사용감 있음', avg: 255000, n: 4 },
      { k: '고장', avg: 95000, n: 1 },
    ];
    const 평균1개월 = Math.round(상태1개월.reduce((a, c) => a + c.avg * c.n, 0) / 상태1개월.reduce((a, c) => a + c.n, 0));
    const 탭몸통 = SL_PERIODS.map((x, i) => `<div data-pane-body="pm${i}"${i === 0 ? '' : ' hidden'}>${분포카드(x)}</div>`).join('');

    const body = `
${U.pageHd('시세 — 기간 탭', '1 · 3 · 6개월을 옮기면 그래프와 표를 모두 다시 셉니다')}

${시세KPI({ n: p.n, k: p.k, avg: 평균1개월, now: 4 })}

<div>
  ${U.tabs(SL_PERIODS.map((x, i) => ({ label: x.k, cnt: x.n, pane: 'pm' + i })), 0)}
  <div class="mt4">${탭몸통}</div>
</div>

${U.sec('기간을 옮기면 이 셋이 함께 바뀝니다', U.dashTable(
      [{ t: '기간', w: '130px' }, { t: '거래 건수', w: '110px' }, { t: '평균 거래가' }, { t: '가장 많은 구간' }, { t: '안내', w: '200px' }],
      [
        ['최근 1개월', '9건', `<b>${U.won(평균1개월)}</b>`, '25만원대', U.badge('거래가 적어 참고만', 'b-warn')],
        ['최근 3개월', `${SL_PERIODS[1].n}건`, `<b>${U.won(SL_AVG)}</b>`, '25만원대', U.badge('넉넉해요', 'b-ok')],
        ['최근 6개월', `${SL_PERIODS[2].n}건`, '<b>248,000원</b>', '25만원대', U.badge('넉넉해요', 'b-ok')],
      ],
    ), { desc: '분포 그래프 · 상태별 평균가 · 최근 거래 사례가 모두 그 기간 것으로 바뀝니다. 화면 주소는 그대로예요 — 뒤로가기가 탭에 끼어들지 않습니다.' })}

${U.sec('최근 1개월 상태별 평균가', 상태별표(상태1개월))}

${U.sec('최근 1개월 거래 사례', 사례표(SL_RECENT_DEALS.slice(0, 2)), { desc: '1개월 안에 끝난 거래는 2건뿐이에요.' })}

${U.banner('acc', '🔎', `<b>기간을 넓혀 보시겠어요?</b>
  <div class="t-sub mt1">최근 3개월이면 ${SL_PERIODS[1].n}건, 6개월이면 ${SL_PERIODS[2].n}건까지 봅니다.</div>`,
      { right: U.btn('3개월로 보기', { href: 'SL0301', cls: 'btn-ghost btn-sm' }) })}`;
    return { body, o: { state: '「최근 1개월」 탭 — 표본이 적어 참고만 하라고 알려 주는 상태' } };
  },

  SL0303(ctx) {
    const 고른상태 = '거의 새것';
    const c = SL_COND_AVG.find((x) => x.k === 고른상태);
    const 사례 = SL_RECENT_DEALS.filter((r) => r.cond === 고른상태);
    const body = `
${U.pageHd('시세 — 상태별 필터', `「${고른상태}」 거래만 남긴 모습`)}

${시세KPI({ n: c.n, k: `${고른상태} · 최근 3개월`, avg: c.avg, now: 3 })}

${U.sec('무엇만 볼까요', `${U.chips(['전체', ...SL_COND_AVG.map((x) => `${x.k} ${x.n}건`)], [2])}
  <p class="help">고른 상태의 거래만 남고 평균가가 다시 셈해집니다. <b>전체</b>를 누르면 되돌아와요.</p>
  <div class="btns mt3">${U.btn('전체 보기로 되돌리기', { href: 'SL0301', cls: 'btn-ghost btn-sm' })}</div>`)}

${U.sec('상태별 평균가', 상태별표(SL_COND_AVG, { on: 고른상태 }), { desc: '고른 줄에 색이 들어오고, 그 줄의 단추가 「전체 보기」로 바뀝니다.' })}

${U.sec(`${고른상태} 거래 사례 ${사례.length}건`, 사례표(사례), {
      desc: `전체 사례 ${SL_RECENT_DEALS.length}건 가운데 ${사례.length}건이 남았어요. 남은 사례의 평균은 ${U.won(Math.round(사례.reduce((a, r) => a + r.price, 0) / 사례.length))}입니다 — 표의 평균가(${U.won(c.avg)})는 ${c.n}건 전체를 셈한 값이에요.`,
    })}

${U.sec('이 상태로 올린다면', `<div class="g3">${SL_GUESS.map((g) => U.card('', `
  <p class="t-sub">${g.why}</p>
  <div class="t-sec mt1">${U.won(g.price)}</div>
  <p class="t-sub mt1">${고른상태} 기준 평균 <b>${g.days}</b></p>
  <div class="mt3">${U.btn('이 가격으로 정하기', { href: 'SL0304', cls: g.best ? 'btn-pri btn-block btn-sm' : 'btn-ghost btn-block btn-sm' })}</div>`,
      { cls: g.best ? 'pri' : '' })).join('')}</div>`)}`;
    return { body, o: { state: `상태 필터 「${고른상태}」가 걸린 상태 — 평균가가 다시 셈해짐` } };
  },

  SL0304(ctx) {
    const g = SL_GUESS[1];
    const body = `
${U.pageHd('이 가격으로 정하기', `${U.won(g.price)}을 판매글 가격칸에 넣습니다`)}

${시세KPI({ avg: g.price, now: 4 })}

<div class="mt6">${U.detailSplit(`
  ${U.banner('ok', '✓', `<b>${U.won(g.price)}으로 정했어요</b>
    <div class="t-sub mt1">판매글 작성 화면으로 돌아가면 가격칸이 이 값으로 채워져 있고,
    옆에 <b>「시세에서 가져옴」</b> 표시가 붙습니다. 물론 그대로 고쳐 쓰셔도 돼요.</div>`)}

  <div class="mt-block">${U.card('판매글 가격칸이 이렇게 채워져요', `
    <div class="fld" style="margin:0">
      <label class="lb" for="pv">가격</label>
      <div class="row-c" style="gap:8px">
        <input class="input" id="pv" type="text" value="${U.num(g.price)}" style="flex:1;max-width:280px">
        <span class="nowrap">원</span>${U.badge('시세에서 가져옴', 'b-acc')}
      </div>
      <p class="help">최근 3개월 거래 ${SL_PERIODS[1].n}건에서 가져온 값이에요. 고치면 이 표시는 사라집니다.</p>
    </div>`)}</div>

  ${U.sec('다른 값을 고르면', U.dashTable(
      [{ t: '값', w: '140px' }, { t: '어떤 때', w: '190px' }, { t: '팔리기까지', w: '120px' }, { t: '', w: '160px' }],
      SL_GUESS.map((x) => ({
        cls: '',
        cells: [
          `<b>${U.won(x.price)}</b>`, x.why, `평균 ${x.days}`,
          x.price === g.price ? U.badge('고른 값', 'b-pri')
            : `<button class="btn btn-ghost btn-xs" type="button" data-toast="${U.won(x.price)}으로 바꿨어요">이 값으로</button>`,
        ],
      })),
    ))}`,
      U.actPanel('가격 정하기', U.kv([['고른 값', `<b>${U.won(g.price)}</b>`], ['기준', `최근 3개월 ${SL_PERIODS[1].n}건`], ['평균 거래가', U.won(SL_AVG)], ['예상 소요', `평균 ${g.days}`]]),
        U.btn('이 값으로 판매글 쓰기', { href: 'SL-01', cls: 'btn-pri' })
        + U.btn('시세 더 보기', { href: 'SL0301', cls: 'btn-ghost' })
        + U.btn('같은 물건 매물 보기', { href: 'SE-02', cls: 'btn-ghost' })))}</div>`;
    return { body, o: { state: `${U.won(g.price)}을 고른 상태 — 판매글 가격칸으로 넘어갑니다` } };
  },

  SL0305(ctx) {
    const it = itemBy(SL_FEW.item);
    const body = `
${U.pageHd(`${U.esc(it.t)} 시세`, `최근 3개월 거래가 <b>${SL_FEW.n}건</b>뿐이에요`)}

${U.kpis([
      ['최근 3개월 거래', String(SL_FEW.n), { unit: '건', tone: 'k-danger', d: '그래프를 그리기엔 적어요' }],
      ['넓혀 보면', U.num(SL_FEW.wider.n), { unit: '건', tone: 'k-acc', d: SL_FEW.wider.k, href: 'SE-02' }],
      ['넓힌 평균가', U.num(SL_FEW.wider.avg), { unit: '원', tone: 'k-ok', d: '비슷한 물건까지 함께 셈한 값' }],
      ['지금 올라온 같은 물건', '1', { unit: '건', tone: 'k-mut', href: 'SE-02' }],
    ])}

<div class="mt6">${U.detailSplit(`
  ${U.card('가격 분포', U.empty('📉', '그래프를 그릴 만큼 거래가 없어요',
      `최근 3개월 거래가 ${SL_FEW.n}건이라 평균을 내면 크게 어긋날 수 있어요. 아래 두 가지 가운데 하나를 고르시면 됩니다.`,
      U.btn('비슷한 물건으로 넓혀 보기', { href: 'SE-02', cls: 'btn-pri' })
      + U.btn('직접 값 정하기', { href: 'SL-01', cls: 'btn-ghost' })))}

  <div class="mt-block">${U.sec('그래도 있는 거래 2건', 사례표(SL_FEW.cases), { desc: '건수가 적어 참고만 하세요.' })}</div>

  ${U.sec('비슷한 물건으로 넓히면', U.dashTable(
      [{ t: '범위' }, { t: '거래 건수', w: '120px' }, { t: '평균가', w: '140px' }, { t: '', w: '150px' }],
      [
        [`${U.esc(it.t)} (똑같은 물건)`, `${SL_FEW.n}건`, '—', U.badge('표본 부족', 'b-danger')],
        [SL_FEW.wider.k, `${SL_FEW.wider.n}건`, `<b>${U.won(SL_FEW.wider.avg)}</b>`, U.btn('이 범위로 보기', { href: 'SE-02', cls: 'btn-ghost btn-xs' })],
        ['유아용품 전체', '412건', '<b>54,000원</b>', U.badge('너무 넓어요', 'b-mut')],
      ],
    ), { desc: '너무 넓히면 다른 물건까지 섞여 값이 흐려집니다. 한 단계만 넓히는 것을 권해요.' })}`,
      U.actPanel('값을 어떻게 정할까요', `
    <div class="stack-sm">
      <div><b>① 비슷한 물건 평균에서 시작</b><div class="t-sub">${U.won(SL_FEW.wider.avg)} 언저리</div></div>
      <div><b>② 상태에 따라 더하고 빼기</b><div class="t-sub">새것이면 +20%, 사용감이 있으면 −20%</div></div>
      <div><b>③ 가격 제안 받기를 켜 두기</b><div class="t-sub">값을 모를 땐 이웃이 먼저 말을 겁니다</div></div>
    </div>`,
      U.btn('직접 값 정하고 글 쓰기', { href: 'SL-01', cls: 'btn-pri' })
      + U.btn('비슷한 물건 보기', { href: 'SE-02', cls: 'btn-ghost' })
      + U.btn('다른 물건 시세 보기', { href: 'SL0301', cls: 'btn-ghost' })))}</div>`;
    return { body, o: { state: `거래가 ${SL_FEW.n}건뿐이라 그래프 대신 안내를 보여 주는 상태` } };
  },

  /* ── SL04 등록 완료 ───────────────────────────────── */
  SL0401(ctx) {
    const it = IT();
    const 왼쪽 = `
      ${U.card('', `<div class="center">
        <div style="font-size:44px">✅</div>
        <h2 class="t-sec mt2">판매글이 올라갔어요</h2>
        <p class="t-sub mt2">${TOWNS.mine} 이웃 ${U.num(SL_DONE.neighbors)}명이 지금부터 볼 수 있어요.</p>
      </div>`, { cls: 'tape ok' })}

      <div class="mt-block">${U.card('내 글이 이렇게 보여요', U.itemRow(it, { href: 'SE-04' }), {
      aside: U.btn('크게 보기', { href: 'SL0402', cls: 'btn-ghost btn-sm' }),
    })}</div>

      <div class="mt-block">${U.card('알리기', `
        <div class="btns">
          ${U.btn('🔗 링크 복사', { cls: 'btn-ghost', attr: ' data-toast="링크를 복사했어요"' })}
          ${U.btn('💬 카카오톡 공유', { cls: 'btn-ghost', attr: ' data-toast="공유 창을 열었어요"' })}
          ${U.btn('공유 화면 보기', { href: 'SL0403', cls: 'btn-quiet' })}
        </div>
        <p class="help mt3">공유 링크로 들어온 이웃은 ${SL_DONE.shareVisits}명이에요.</p>`)}</div>

      <div class="mt-block">${U.box(`<b class="t-card">이제 이렇게 되어요</b>
        <ul class="dots t-sub mt2">
          <li>채팅이 오면 알려드려요 — 답이 빠를수록 매너 온도가 오릅니다</li>
          <li>약속을 잡으면 <b>예약중</b>으로 바꿔 주세요. 다른 분이 헛걸음하지 않아요</li>
          <li>거래가 끝나면 <b>거래완료</b>로 바꾸고 서로 후기를 남겨 주세요</li>
        </ul>`)}</div>

      <div class="mt-block">${U.card('끌올', `
        <div class="row-b wrap-row">
          <div>
            <b>무료 끌올은 24시간 뒤부터 할 수 있어요</b>
            <p class="t-sub mt1">남은 시간 <b data-count="${SL_DONE.freeBoostSec}">${BOOST_FREE_LEFT}</b></p>
          </div>
          ${U.btn('무료 끌올', { cls: 'btn-ghost', off: true })}
        </div>
        <div class="mt4">
          <p class="t-sub mb2">더 빨리 위로 올리고 싶으시면 (유료)</p>
          <div class="g3">${BOOSTS.map((b) => `<a class="tile" href="${U.link('BS-01')}">
            <span class="nm">${b.k}</span><span class="t-sub">${U.won(b.price)} · ${b.keep}</span></a>`).join('')}</div>
          <p class="help mt3">끌올한 글에는 목록에서 <b>「끌올」 배지</b>가 붙어요 — 광고라는 것을 이웃에게 숨기지 않습니다.</p>
        </div>`, { aside: U.btn('끌올 안내 보기', { href: 'SL0404', cls: 'btn-ghost btn-sm' }) })}</div>`;

    const body = `
${U.pageHd('등록 완료', '올린 글이 목록에 들어갔어요')}
${U.kpis([
      ['이 동네에서 볼 이웃', U.num(SL_DONE.neighbors), { unit: '명', d: `${TOWNS.mine} 인증 회원` }],
      ['오늘 이 분류 등록', U.num(SL_DONE.todayCat), { unit: '건', tone: 'k-acc', d: '생활가전 · 청소기', href: 'SE-02' }],
      ['비슷한 물건 평균 거래', SL_DONE.avgDays, { tone: 'k-ok', d: '최근 3개월 기준', href: 'SL-03' }],
      ['무료 끌올까지', `<span data-count="${SL_DONE.freeBoostSec}">${BOOST_FREE_LEFT}</span>`, { tone: 'k-warn', d: '24시간마다 한 번', href: 'BS-01' }],
    ])}
<div class="mt6">${U.detailSplit(왼쪽, U.actPanel('다음에 할 일', `
  <p class="t-sub">막다른 길이 아니에요. 다음에 누르실 것을 골라 두었어요.</p>`,
      U.btn('내 판매글 관리', { href: 'SL-05', cls: 'btn-pri' })
      + U.btn('판매글 더 쓰기', { href: 'SL-01', cls: 'btn-ghost' })
      + U.btn('끌올하기', { href: 'BS-01', cls: 'btn-acc' }))
      + U.actPanel('올린 글 요약', U.kv([
        ['물건', U.esc(it.t)], ['값', U.won(it.price)], ['거래 방식', it.ways.join(' · ')],
        ['동네', U.esc(it.town)], ['상태', U.stBadge(it.st)],
      ]), U.btn('글 고치기', { href: 'SL-01', cls: 'btn-quiet' })))}</div>
${다른상태([['SL0402', '내 글 미리보기'], ['SL0403', '공유하기'], ['SL0404', '끌올 안내']])}`;
    return { body, o: {} };
  },

  SL0402(ctx) {
    const it = IT();
    const body = `
${U.pageHd('내 글 미리보기', '목록에서 이웃에게 보이는 그대로예요')}
${U.kpis([
      ['이 동네에서 볼 이웃', U.num(SL_DONE.neighbors), { unit: '명', d: `${TOWNS.mine} 인증 회원` }],
      ['올린 사진', String(it.photos), { unit: '장', tone: 'k-acc', d: '첫 장이 목록에 보여요', href: 'SL-02' }],
      ['지금 조회', '0', { unit: '회', tone: 'k-mut', d: '방금 올려서 아직 없어요' }],
      ['무료 끌올까지', `<span data-count="${SL_DONE.freeBoostSec}">${BOOST_FREE_LEFT}</span>`, { tone: 'k-warn', d: '24시간마다 한 번', href: 'BS-01' }],
    ])}

<div class="mt6">${U.detailSplit(`
  ${U.card('매물 목록에서', U.itemRow(it, { href: 'SE-04' }), { aside: U.btn('매물 목록 보기', { href: 'SE-02', cls: 'btn-ghost btn-sm' }) })}

  <div class="mt-block">${U.card('넷씩 늘어놓는 자리에서', `<div class="g4">${[it, itemBy('i5'), itemBy('i7'), itemBy('i9')].map((x) => U.itemCard(x)).join('')}</div>
    <p class="help mt3">「비슷한 매물」·「이 판매자의 다른 매물」에는 이 모양으로 들어갑니다.</p>`)}</div>

  ${U.sec('잘못 올렸다면', U.dashTable(
      [{ t: '무엇을', w: '170px' }, { t: '지금 값' }, { t: '', w: '150px' }],
      [
        ['제목', U.esc(it.t), U.btn('고치기', { href: 'SL-01', cls: 'btn-ghost btn-xs' })],
        ['가격', U.won(it.price), U.btn('고치기', { href: 'SL-01', cls: 'btn-ghost btn-xs' })],
        ['사진', `${it.photos}장 · 대표는 첫 장`, U.btn('사진 정리', { href: 'SL-02', cls: 'btn-ghost btn-xs' })],
        ['거래 방식', it.ways.join(' · '), U.btn('고치기', { href: 'SL-01', cls: 'btn-ghost btn-xs' })],
        ['아예 내리기', '숨기면 목록에서 사라져요', U.btn('내 판매글에서', { href: 'SL-05', cls: 'btn-quiet btn-xs' })],
      ],
    ), { desc: '올린 뒤에도 언제든 고칠 수 있어요. 고친 글은 목록 차례가 그대로 남습니다(끌올과 다릅니다).' })}`,
      U.actPanel('이 글', U.kv([['상태', U.stBadge(it.st)], ['동네', U.esc(it.town)], ['값', U.won(it.price)]]),
        U.btn('눌러서 상세 보기', { href: 'SE-04', cls: 'btn-pri' })
        + U.btn('바로 수정하기', { href: 'SL-01', cls: 'btn-ghost' })
        + U.btn('등록 완료로 돌아가기', { href: 'SL-04', cls: 'btn-quiet' })))}</div>`;
    return { body, o: { state: '방금 올린 글이 목록에서 어떻게 보이는지 확인하는 상태' } };
  },

  SL0403(ctx) {
    const it = IT();
    const body = `
${U.pageHd('공유하기', '링크를 복사하거나 카카오톡으로 보냅니다')}
${U.kpis([
      ['공유 링크로 들어온 이웃', String(SL_DONE.shareVisits), { unit: '명', d: '어제부터 지금까지' }],
      ['그중 찜한 사람', '3', { unit: '명', tone: 'k-acc', d: '들어온 이웃의 25%' }],
      ['걸려 온 채팅', String(it.chat), { unit: '건', tone: 'k-ok', href: 'CH-01' }],
      ['지금 조회', U.num(it.view), { unit: '회', tone: 'k-mut', d: '공유 링크 포함' }],
    ])}

<div class="mt6">${U.detailSplit(`
  ${U.card('링크', `
    <div class="row-c" style="gap:8px">
      <input class="input" type="text" readonly value="https://우리동네장터.kr/item/${it.id}" style="flex:1" aria-label="공유 링크">
      ${U.btn('복사', { cls: 'btn-pri', attr: ' data-toast="링크를 복사했어요"' })}
    </div>
    <p class="help">복사하면 화면 아래에 <b>「링크를 복사했어요」</b> 알림이 잠깐 떴다가 사라져요.</p>`)}

  <div class="mt-block">${U.card('카카오톡에 이렇게 보여요', `
    <div class="box" style="max-width:380px">
      ${U.phShot('i1p1', { cls: 'mb3' })}
      <b>${U.esc(it.t)}</b>
      <div class="price mt1">${U.won(it.price)}</div>
      <div class="t-sub mt1">${U.esc(it.town)} · ${SITE.name}</div>
    </div>
    <p class="help mt3">대표 사진 · 제목 · 값 · 동네가 미리보기 카드에 들어갑니다. 대표 사진을 바꾸면 이 그림도 바뀌어요.</p>`,
      { aside: U.btn('대표 사진 바꾸기', { href: 'SL0203', cls: 'btn-ghost btn-sm' }) })}</div>

  ${U.sec('어디로 보낼까요', `<div class="g3">
    ${[['💬 카카오톡', '가장 많이 쓰는 길이에요'], ['📋 링크 복사', '어디에든 붙여 넣을 수 있어요'], ['🏠 동네 단톡방', '가까운 이웃에게 바로']].map(([t, d]) => U.card('', `
      <b>${t}</b><p class="t-sub mt1">${d}</p>
      <div class="mt3"><button class="btn btn-ghost btn-sm btn-block" type="button" data-toast="${t.replace(/^\S+\s/, '')} 으로 보냈어요">보내기</button></div>`)).join('')}
  </div>`)}`,
      U.actPanel('공유', `<p class="t-sub">공유는 목록 차례를 바꾸지 않아요. 위로 올리려면 끌올을 쓰세요.</p>`,
        U.btn('🔗 링크 복사', { cls: 'btn-pri', attr: ' data-toast="링크를 복사했어요"' })
        + U.btn('💬 카카오톡 공유', { cls: 'btn-ghost', attr: ' data-toast="공유 창을 열었어요"' })
        + U.btn('끌올하기', { href: 'BS-01', cls: 'btn-acc' })
        + U.btn('등록 완료로 돌아가기', { href: 'SL-04', cls: 'btn-quiet' })))}</div>`;
    return { body, o: { state: '링크 복사와 카카오톡 공유 미리보기를 보여 주는 상태' } };
  },

  SL0404(ctx) {
    const body = `
${U.pageHd('끌올 안내', '무료 끌올까지 남은 시간과 유료 끌올 값')}
${U.kpis([
      ['무료 끌올까지', `<span data-count="${SL_DONE.freeBoostSec}">${BOOST_FREE_LEFT}</span>`, { tone: 'k-warn', d: '24시간마다 한 번' }],
      ['가장 싼 유료 끌올', U.num(BOOSTS[0].price), { unit: '원', tone: 'k-acc', d: BOOSTS[0].d, href: 'BS-01' }],
      ['끌올하면 늘어나는 노출', `${Math.round(BOOSTS[0].exp / 100) / 10}천`, { unit: '회', tone: 'k-ok', d: '즉시 끌올 기준 예상' }],
      ['지금 끌올 가능한 내 글', U.num(SL_BOOST_READY), { unit: '건', tone: 'k-mut', href: 'SL-05' }],
    ])}

<div class="mt6">${U.detailSplit(`
  ${U.card('무료 끌올', `
    <div class="center">
      <p class="t-sub">무료 끌올까지</p>
      <div class="t-page" style="font-size:40px" data-count="${SL_DONE.freeBoostSec}">${BOOST_FREE_LEFT}</div>
      <p class="t-sub mt2">시간이 되면 <b>내 판매글</b> 화면의 끌올 단추에 색이 살아나요.</p>
    </div>
    ${U.progress(70)}
    <p class="help mt2">올린 지 24시간이 지나면 하루에 한 번 무료로 목록 맨 위에 올릴 수 있어요.</p>`, { cls: 'tape warn' })}

  <div class="mt-block">${U.sec('유료 끌올 값 미리보기', U.dashTable(
      [{ t: '어떤 끌올', w: '170px' }, { t: '값', w: '110px' }, { t: '얼마 동안', w: '120px' }, { t: '예상 노출' }, { t: '', w: '110px' }],
      BOOSTS.map((b) => [
        `<b>${b.k}</b><div class="t-sub">${b.d}</div>`,
        `<b>${U.won(b.price)}</b>`, b.keep, `${U.num(b.exp)}회`,
        U.btn('고르기', { href: 'BS-01', cls: 'btn-ghost btn-xs' }),
      ]),
    ), { desc: '값을 치르면 그 순간 목록 맨 위로 올라가고, 글에는 「끌올」 배지가 붙습니다.' })}</div>

  ${U.banner('info', '💡', `<b>끌올은 언제 하면 좋을까요</b>
    <div class="t-sub mt1">이웃이 가장 많이 보는 때는 <b>저녁 8~10시</b>예요. 그 앞에 끌올하면 노출이 가장 많습니다.</div>`)}`,
      U.actPanel('끌올', U.kv([['남은 시간', `<b data-count="${SL_DONE.freeBoostSec}">${BOOST_FREE_LEFT}</b>`], ['무료 끌올', '24시간마다 한 번'], ['유료 끌올', `${U.won(BOOSTS[0].price)}부터`]]),
        U.btn('무료 끌올', { cls: 'btn-pri', off: true })
        + U.btn('지금 바로 끌올하기 (유료)', { href: 'BS-01', cls: 'btn-acc' })
        + U.btn('내 판매글 관리', { href: 'SL-05', cls: 'btn-ghost' })
        + U.btn('등록 완료로 돌아가기', { href: 'SL-04', cls: 'btn-quiet' })))}</div>`;
    return { body, o: { state: '무료 끌올까지 시간이 남아 무료 단추가 잠긴 상태' } };
  },

  /* ── SL05 내 판매글 관리 ──────────────────────────── */
  SL0501(ctx) {
    const 탭몸통 = SL_STATES.map((st, i) => {
      const 것들 = SL_MY.filter((r) => r.st === st);
      return `<div data-pane-body="my${i}"${i === 0 ? '' : ' hidden'}>
        ${것들.length
        ? `${U.tableBar(`<b>${것들.length}건</b> <span class="t-sub">· 체크하면 여러 개를 한꺼번에 다룰 수 있어요</span>`,
          `${U.btn('판매글 쓰기', { href: 'SL-01', cls: 'btn-pri btn-sm' })}`)}
           ${U.dashTable(관리머리(), 것들.map((r) => 관리행(r)), { max: '460px', listKey: 'my' + i })}`
        : U.empty('📦', `${st}인 글이 아직 없어요`,
          st === '숨김' ? '숨긴 글은 목록에서 보이지 않지만 지워지지는 않아요. 언제든 다시 올릴 수 있습니다.' : '',
          U.btn('판매글 쓰기', { href: 'SL-01', cls: 'btn-pri' }))}
      </div>`;
    }).join('');

    const body = `
${U.pageHd('내 판매글', `모두 ${SL_MY.length}개 · 상태를 바꾸면 탭 건수도 함께 움직여요`,
      `<div class="btns">${U.btn('끌올·광고 보기', { href: 'BS-01', cls: 'btn-ghost' })}${U.btn('판매글 쓰기', { href: 'SL-01', cls: 'btn-pri' })}</div>`)}

${관리KPI()}

<div class="table-bar" data-pick-bar hidden>
  <div class="grow"><b><span data-pick-n>0</span>개</b> <span class="t-sub">골랐어요</span></div>
  <div class="row-c">
    <button class="btn btn-ghost btn-sm" type="button" data-toast="고른 글을 한꺼번에 숨겼어요">한꺼번에 숨기기</button>
    <button class="btn btn-ghost btn-sm" type="button" data-toast="고른 글을 한꺼번에 끌올했어요">한꺼번에 끌올</button>
    <button class="btn btn-danger btn-sm" type="button" data-toast="고른 글을 지웠어요" data-toast-act="되돌리기">한꺼번에 삭제</button>
  </div>
</div>

<div>
  ${U.tabs(SL_STATES.map((s, i) => ({ label: s, cnt: SL_MY_CNT(s), pane: 'my' + i })), 0)}
  <div class="mt4">${탭몸통}</div>
</div>

${U.banner('warn', '⏳', `<b>30일이 지나 목록에서 내려간 글이 ${SL_MY.filter((r) => r.old).length}개 있어요</b>
  <div class="t-sub mt1">글은 그대로 있지만 매물 목록에는 보이지 않아요. 끌올하면 다시 올라옵니다.</div>`,
      { right: U.btn('내려간 글 보기', { href: 'SL0506', cls: 'btn-ghost btn-sm' }) })}

${U.sec('상태를 바꾸면', U.dashTable(
      [{ t: '무엇으로', w: '130px' }, { t: '이럴 때' }, { t: '그러면' }, { t: '', w: '150px' }],
      [
        [U.stBadge('예약중'), '약속을 잡았을 때', '목록에 「예약중」 딱지가 붙고 다른 분이 헛걸음하지 않아요', U.btn('바꿔 보기', { href: 'SL0502', cls: 'btn-ghost btn-xs' })],
        [U.stBadge('거래완료'), '물건을 넘겼을 때', '누구와 거래했는지 고르고 후기 쓰기로 이어집니다', U.btn('구매자 고르기', { href: 'SL0503', cls: 'btn-ghost btn-xs' })],
        [U.stBadge('숨김'), '잠깐 내려 두고 싶을 때', '목록에서 사라지지만 글은 남아 있어요', U.btn('바꿔 보기', { href: 'SL0502', cls: 'btn-ghost btn-xs' })],
      ],
    ))}

${모달들()}

${다른상태([['SL0502', '상태 바꾸기'], ['SL0503', '구매자 고르기'], ['SL0504', '끌올 잠김'], ['SL0505', '가격 내리기'], ['SL0506', '오래된 글 자동 내림']])}`;
    return { body, o: {} };
  },

  SL0502(ctx) {
    const r = SL_MY[0];
    const it = SL_itemBy(r.id);
    const 왼쪽 = `
      ${U.card('상태를 바꿀 글', `<div class="row-c" style="gap:12px;align-items:flex-start">
        ${U.phItem(92, it.id)}
        <div class="grow">
          <div class="row-c wrap-row">${U.stBadge(r.st)}<b>${U.esc(it.t)}</b></div>
          <div class="met mt1"><span class="k">올린 날 ${r.at}</span><span class="k">조회 ${r.view}</span><span class="k">찜 ${r.wish}</span><span class="k">채팅 ${r.chat}</span></div>
          <div class="price mt1">${U.won(it.price)}</div>
        </div></div>`)}

      <div class="mt-block">${U.card('지금 형편', U.timeline([
      ['올렸어요', `${r.at} · 목록에 들어감`],
      ['이야기 중', `${r.chat}명과 채팅하고 있어요`],
      ['예약중으로 바꾸기', '약속을 잡으면 여기'],
      ['거래완료', '넘기고 나면 후기를 서로 남겨요'],
    ], 1))}</div>

      ${U.sec('바꾸면 탭 건수가 이렇게 움직여요', U.dashTable(
      [{ t: '탭', w: '130px' }, { t: '지금', w: '110px' }, { t: '판매중 → 예약중으로 바꾼 뒤' }],
      SL_STATES.map((s) => ({
        cls: '',
        cells: [
          U.stBadge(s), `${SL_MY_CNT(s)}건`,
          s === '판매중' ? `<b>${SL_MY_CNT(s) - 1}건</b> <span class="t-sub">(−1)</span>`
            : (s === '예약중' ? `<b>${SL_MY_CNT(s) + 1}건</b> <span class="t-sub">(+1)</span>` : `${SL_MY_CNT(s)}건`),
        ],
      })),
    ), { desc: '행의 배지와 탭 위 건수가 «함께» 바뀝니다. 한쪽만 바뀌면 손님이 헷갈려요.' })}

      <div class="mt-block">${U.banner('info', '🔁', `<b>예약중 ↔ 판매중은 언제든 오갈 수 있어요</b>
        <div class="t-sub mt1">약속이 어그러지면 다시 판매중으로 돌려 두세요. 거래완료로 바꾼 뒤에는 되돌릴 수 없습니다.</div>`)}</div>`;

    const 패널 = U.actPanel('상태 바꾸기', `
      <div class="fld" style="margin:0">
        <label class="lb" for="stsel">지금 상태</label>
        <select class="input" id="stsel" data-row-badge>
          ${SL_STATES.map((s) => `<option${s === r.st ? ' selected' : ''}>${s}</option>`).join('')}</select>
        <p class="help">고르면 목록의 배지와 탭 건수가 함께 바뀝니다.</p>
      </div>`,
    U.btn('예약중으로 바꾸기', { cls: 'btn-acc', attr: ' data-toast="예약중으로 바꿨어요 · 목록에 예약중 딱지가 붙어요"' })
      + U.btn('거래완료로 바꾸기', { href: 'SL0503', cls: 'btn-pri' })
      + U.btn('숨기기', { cls: 'btn-ghost', attr: ' data-toast="숨겼어요 · 목록에서 보이지 않아요"' })
      + U.btn('내 판매글로 돌아가기', { href: 'SL-05', cls: 'btn-quiet' }),
    { state: r.st })
      + U.actPanel('이 글 다루기', '',
        U.btn('수정하기', { href: 'SL-01', cls: 'btn-ghost' })
        + U.btn('가격 내리기', { href: 'SL0505', cls: 'btn-ghost' })
        + U.btn('끌올하기', { href: 'BS-01', cls: 'btn-ghost' }));

    return {
      body: `${U.pageHd('상태 바꾸기', '판매중 ↔ 예약중은 드롭다운으로, 거래완료는 구매자를 고른 뒤에')}
${관리KPI()}
<div class="mt6">${U.detailSplit(왼쪽, 패널)}</div>`,
      o: { state: '판매중 글 하나의 상태를 바꾸는 중' },
    };
  },

  SL0503(ctx) {
    const it = IT();
    const 왼쪽 = `
      ${U.card('거래완료로 바꾸는 중', `<div class="row-c" style="gap:12px">
        ${U.phItem(64, it.id)}
        <div><b>${U.esc(it.t)}</b><div class="t-sub mt1">${U.won(it.price)} · 채팅 ${SL_BUYERS.length}명</div></div></div>`)}

      <div class="mt-block">${U.modalStatic('누구와 거래하셨나요?', 구매자고르기(),
      U.btn('취소', { cls: 'btn-ghost', attr: ' data-toast="거래완료로 바꾸는 것을 그만뒀어요"' })
      + U.btn('거래완료로 바꾸고 후기 쓰기', { href: 'MY-04', cls: 'btn-pri' }))}</div>

      ${U.sec('채팅한 이웃이 아무도 없다면', U.dashTable(
      [{ t: '고르는 것', w: '220px' }, { t: '그러면' }, { t: '후기', w: '130px' }],
      [
        ['채팅한 이웃 가운데 하나', '그 이웃과의 거래로 기록되고 후기 쓰기로 이어집니다', U.badge('서로 남겨요', 'b-ok')],
        ['채팅 밖에서 거래했어요', '거래완료로만 바뀝니다. 상대를 모르니 후기는 건너뜁니다', U.badge('남길 수 없어요', 'b-mut')],
      ],
    ), { desc: '이 물건으로 이야기한 이웃이 한 명도 없으면 「채팅 밖에서 거래했어요」만 뜹니다.' })}

      <div class="mt-block">${U.banner('info', '⭐', `<b>후기는 서로 남깁니다</b>
        <div class="t-sub mt1">내가 남기면 상대에게 알림이 가고, 상대가 남기면 내 매너 온도가 움직여요.
        7일이 지나면 후기를 남길 수 없게 됩니다.</div>`,
      { right: U.btn('후기 쓰기', { href: 'MY-04', cls: 'btn-ghost btn-sm' }) })}</div>`;

    const 패널 = U.actPanel('고른 이웃', `
      <div class="row-c" style="gap:10px">${U.phAva(44, 'u1')}
        <div><b>${U.esc(userBy('u1').nick)}</b>${U.manner(userBy('u1').manner)}
          <div class="t-sub">이 물건으로 채팅했어요</div></div></div>
      <p class="help mt3">고른 이웃 <b>1명</b>. 아무도 고르지 않으면 아래 단추가 잠깁니다.</p>`,
    U.btn('거래완료로 바꾸고 후기 쓰기', { href: 'MY-04', cls: 'btn-pri' })
      + U.btn('채팅방 열어 보기', { href: 'CH-01', cls: 'btn-ghost' })
      + U.btn('내 판매글로 돌아가기', { href: 'SL-05', cls: 'btn-quiet' }));

    return {
      body: `${U.pageHd('구매자 고르기', '누구와 거래했는지 고르면 후기 쓰기로 이어집니다')}
${관리KPI()}
<div class="mt6">${U.detailSplit(왼쪽, 패널)}</div>`,
      o: { state: '거래완료로 바꾸며 구매자를 고르는 중 — 1명 고름' },
    };
  },

  SL0504(ctx) {
    const 줄 = SL_MY.filter((r) => r.boost);
    const body = `
${U.pageHd('끌올 잠김', '무료 끌올은 24시간마다 한 번이에요')}
${관리KPI()}

${U.banner('info', '⏳', `<b>무료 끌올이 아직인 글은 단추가 회색이에요</b>
  <div class="t-sub mt1">남은 시간이 단추 아래에 적혀 있고, 시간이 되면 색이 살아납니다.
  기다리기 어려우면 유료 끌올로 지금 바로 올릴 수 있어요.</div>`,
      { right: U.btn('유료 끌올 보기', { href: 'BS-01', cls: 'btn-acc btn-sm' }) })}

${U.sec('내 글의 끌올 형편', U.dashTable(
      [{ t: '물건' }, { t: '올린 날', w: '96px' }, { t: '상태', w: '86px' }, { t: '끌올', w: '140px' }, { t: '언제부터 되나요' }, { t: '', w: '130px' }],
      줄.map((r) => {
        const it = SL_itemBy(r.id);
        return {
          cls: '',
          cells: [
            `<span class="row-c">${U.phItem(36, it.id)}<b>${U.esc(it.t)}</b></span>`,
            `<span class="t-sub nowrap">${r.at}</span>`,
            U.stBadge(r.st),
            끌올칸(r),
            r.boost === '진행중' ? '유료 끌올이 도는 중이에요 (하루 상단 고정)'
              : (r.boost === '가능' ? '<b>지금 할 수 있어요</b>' : `${r.left} 뒤부터 할 수 있어요`),
            r.boost === '가능'
              ? U.btn('지금 끌올', { href: 'BS-01', cls: 'btn-pri btn-xs' })
              : U.btn('유료로 지금', { href: 'BS-01', cls: 'btn-ghost btn-xs' }),
          ],
        };
      }),
      { max: '420px' },
    ), { desc: `지금 무료로 끌올할 수 있는 글은 ${SL_BOOST_READY}건이에요.` })}

${U.sec('무료 끌올과 유료 끌올', `<div class="g2">
  ${U.card('무료 끌올', `<ul class="dots t-sub">
    <li>값이 들지 않아요</li><li>글 하나에 24시간마다 한 번</li>
    <li>누른 그때 목록 맨 위로</li><li>배지는 붙지 않아요</li></ul>`)}
  ${U.card('유료 끌올', `<ul class="dots t-sub">
    <li>${U.won(BOOSTS[0].price)}부터</li><li>시간 제한 없이 언제든</li>
    <li>하루·일주일 상단 고정도 있어요</li><li>글에 <b>「끌올」 배지</b>가 붙어요</li></ul>
    <div class="mt3">${U.btn('끌올·광고 보기', { href: 'BS-01', cls: 'btn-acc btn-sm btn-block' })}</div>`, { cls: 'acc' })}
</div>`)}`;
    return { body, o: { state: '무료 끌올까지 시간이 남아 단추가 잠긴 글이 섞여 있는 상태' } };
  },

  SL0505(ctx) {
    const it = IT();
    const 새값 = 295000;
    const 왼쪽 = `
      ${U.card('가격 내리기', 가격내리기({ newPrice: 새값 }), { bdCls: '' })}

      <div class="mt-block">${U.card('이전 값보다 높으면 이렇게 막아요', 가격내리기({ err: true }), { cls: 'tape warn' })}</div>

      ${U.sec('내린 뒤 목록에서', U.dashTable(
      [{ t: '물건' }, { t: '값' }, { t: '표시', w: '130px' }, { t: '알림', w: '190px' }],
      [[
        `<span class="row-c">${U.phItem(36, it.id)}<b>${U.esc(it.t)}</b></span>`,
        U.priceDown(it.price, 새값),
        U.badge('내림', 'b-acc'),
        `찜한 <b>${it.wish}명</b>에게 알림 보냄`,
      ]],
    ), { desc: '값을 내리면 찜한 이웃에게 「찜한 물건 값이 내렸어요」 알림이 갑니다. 하루에 한 번만 보냅니다.' })}

      <div class="mt-block">${U.banner('info', '📈', `<b>값을 올리고 싶으시면</b>
        <div class="t-sub mt1">여기서는 내리기만 됩니다. 값을 올리려면 판매글 <b>수정</b>에서 고쳐 주세요 —
        올린 값은 찜한 분에게 알림이 가지 않아요.</div>`,
      { right: U.btn('수정하러 가기', { href: 'SL-01', cls: 'btn-ghost btn-sm' }) })}</div>`;

    const 패널 = U.actPanel('가격 내리기', U.kv([
      ['지금 가격', U.won(it.price)], ['새 가격', `<b>${U.won(새값)}</b>`],
      ['내리는 폭', `${U.num(it.price - 새값)}원 (${Math.round((it.price - 새값) / it.price * 100)}%)`],
      ['알림 받을 사람', `${it.wish}명`],
    ]),
    U.btn('이 값으로 내리기', { cls: 'btn-pri', attr: ' data-toast="가격을 내렸어요 · 찜한 8명에게 알렸어요"' })
      + U.btn('시세 보고 정하기', { href: 'SL-03', cls: 'btn-ghost' })
      + U.btn('내 판매글로 돌아가기', { href: 'SL-05', cls: 'btn-quiet' }));

    return {
      body: `${U.pageHd('가격 내리기', '내린 값은 찜한 이웃에게 알려 드려요')}
${관리KPI()}
<div class="mt6">${U.detailSplit(왼쪽, 패널)}</div>`,
      o: { state: `${U.won(it.price)} → ${U.won(새값)}으로 내리는 중` },
    };
  },

  SL0506(ctx) {
    const 내려간 = SL_MY.filter((r) => r.old);
    const body = `
${U.pageHd('오래된 글 자동 내림', '30일이 지난 글은 목록에서 조용히 내려갑니다')}
${U.kpis([
      ['목록에서 내려간 글', String(내려간.length), { unit: '건', tone: 'k-warn', d: '올린 지 30일이 지났어요' }],
      ['글은 그대로', String(내려간.length), { unit: '건', tone: 'k-mut', d: '지워지지 않았어요' }],
      ['끌올하면', '바로', { tone: 'k-acc', d: '다시 목록 위로 올라와요', href: 'BS-01' }],
      ['지금 끌올 가능', U.num(SL_BOOST_READY), { unit: '건', tone: 'k-ok', href: 'BS-01' }],
    ])}

${U.banner('warn', '⏳', `<b>30일이 지나 목록에서 내려갔어요</b>
  <div class="t-sub mt1">글이 지워진 것은 아니에요. 이웃이 검색으로는 찾을 수 있지만 목록에서는 보이지 않습니다.
  <b>끌올하면 다시 올라와요.</b></div>`,
      { right: U.btn('한꺼번에 끌올', { href: 'BS-01', cls: 'btn-acc btn-sm' }) })}

<div class="table-bar" data-pick-bar hidden>
  <div class="grow"><b><span data-pick-n>0</span>개</b> <span class="t-sub">골랐어요</span></div>
  <div class="row-c">
    <button class="btn btn-pri btn-sm" type="button" data-toast="고른 글을 한꺼번에 끌올했어요">한꺼번에 끌올</button>
    <button class="btn btn-ghost btn-sm" type="button" data-toast="고른 글을 숨겼어요">한꺼번에 숨기기</button>
  </div>
</div>

${모달들()}

${U.sec('내려간 글', U.dashTable(관리머리(), 내려간.map((r) => 관리행(r)), { max: '300px' }),
      { desc: '올린 날이 30일보다 오래된 글입니다. 줄에 「목록에서 내려감」 딱지가 붙어요.' })}

${U.sec('며칠째 안 팔렸나', U.dashTable(
      [{ t: '지난 날', w: '120px' }, { t: '그때 일어나는 일' }, { t: '내가 할 수 있는 것' }],
      [
        ['7일', '아무 일도 없어요', '값을 조금 내려 보세요'],
        ['14일', '「오래된 글」 표시가 붙어요', '사진을 바꾸거나 설명을 고쳐 보세요'],
        ['30일', '<b>목록에서 내려갑니다</b>', '끌올하면 바로 다시 올라와요'],
        ['60일', '검색에서도 뒤로 밀려요', '글을 새로 쓰는 편이 나아요'],
      ],
    ), { desc: '자동으로 내려가도 알림을 보내 드려요. 끌올 한 번이면 되돌아옵니다.' })}

${U.sec('내려간 글을 되살리는 세 가지', `<div class="g3">
  ${[['무료 끌올', '24시간마다 한 번, 값이 들지 않아요', 'BS-01', 'btn-pri'],
      ['값 내리기', '찜한 이웃에게 알림이 갑니다', 'SL0505', 'btn-ghost'],
      ['글 고쳐 쓰기', '사진과 제목을 바꾸면 새 글처럼 보여요', 'SL-01', 'btn-ghost']]
      .map(([t, d, go, cls]) => U.card('', `<b>${t}</b><p class="t-sub mt1">${d}</p>
        <div class="mt3">${U.btn('하러 가기', { href: go, cls: `${cls} btn-sm btn-block` })}</div>`)).join('')}
</div>`)}`;
    return { body, o: { state: '30일이 지나 목록에서 내려간 글만 모아 본 상태' } };
  },
};
