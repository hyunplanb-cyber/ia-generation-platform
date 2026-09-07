/* SL 판매하기 — 판매글 작성 / 사진 정리 / 시세 보기 / 등록 완료 / 내 판매글 관리
   ⚠ 이 메뉴가 이 팩의 까닭이다. 쇼핑몰 도구는 여기를 «관리자에게만» 연다.
     여기서는 회원 누구나 쓴다 — 그래서 손님 GNB 안에 있다. */
import * as U from './ui.mjs';
import {
  CATS, SUBCATS, CONDS, ITEMS, itemBy, userBy, TOWNS, ago,
  BANNED, FEE_RATE, BOOST_FREE_LEFT, BOOSTS,
} from './data.mjs';

/* ---------------- SL-01 판매글 작성 ---------------- */
function SL01() {
  const it = itemBy('i1');
  const 본문 = `
  ${U.pageHd('판매글 쓰기', '사진과 상태를 적어 주시면 이웃이 바로 볼 수 있어요')}

  ${U.stepbar(['사진', '무엇을', '얼마에', '어떻게 거래'], 0)}

  ${U.sec('① 사진', U.card('', `
    <div class="photo-grid">
      <button class="photo-add" type="button" data-toast="사진을 골라 주세요 (최대 10장)">
        <span style="font-size:22px">＋</span><span>사진 추가</span></button>
      ${[1, 2, 3].map((n) => `<div class="photo-cell">
        ${n === 1 ? `<span class="rep">${U.badge('대표', 'b-pri')}</span>` : ''}
        <button class="del" type="button" data-toast="사진을 지웠어요" data-toast-act="되돌리기" aria-label="사진 지우기">✕</button>
        ${U.phItem(140, it.id + n)}
      </div>`).join('')}
    </div>
    <p class="t-sub mt3">사진은 최대 10장까지 올릴 수 있고, <b>첫 장이 목록에 보여요.</b></p>
    <div class="btns mt3">${U.btn('사진 정리하기', { href: 'SL-02', cls: 'btn-ghost' })}</div>`))}

  ${U.sec('② 무엇을 파나요', U.card('', `
    <div class="fld">
      <label class="lb" for="tt">제목</label>
      <input class="input" id="tt" type="text" placeholder="어떤 물건인가요?" value="${U.esc(it.t)}">
      <p class="t-sub mt1 right">${it.t.length} / 40</p>
    </div>

    <div class="fld">
      <span class="lb">카테고리</span>
      <div class="row wrap-row" style="gap:8px">
        <select class="input" style="flex:1 1 200px" data-sel-show="cat">${CATS.map((c) => `<option${c.nm === '생활가전' ? ' selected' : ''}>${c.nm}</option>`).join('')}</select>
        <select class="input" style="flex:1 1 200px">${SUBCATS.home.map((s) => `<option${s.nm === '청소기' ? ' selected' : ''}>${s.nm}</option>`).join('')}</select>
      </div>
      <p class="t-sub mt2">분류를 고르면 그 분류에서만 쓰는 항목이 아래에 나타나요.</p>
    </div>

    <div class="fld sub-fld" data-sel-case="cat" data-sel-when="생활가전">
      <span class="lb">생활가전에서 더 묻는 것</span>
      <div class="row wrap-row" style="gap:8px">
        <select class="input" style="flex:1 1 160px"><option>제조사</option><option selected>다이슨</option><option>LG</option><option>삼성</option></select>
        <input class="input" style="flex:1 1 160px" type="text" placeholder="모델명" value="V11">
        <select class="input" style="flex:1 1 160px"><option>보증기간 남음</option><option selected>없음</option><option>6개월 미만</option></select>
      </div>
    </div>

    <div class="fld sub-fld" data-sel-case="cat" data-sel-when="디지털기기" hidden>
      <span class="lb">디지털기기에서 더 묻는 것</span>
      <div class="row wrap-row" style="gap:8px">
        <select class="input" style="flex:1 1 160px"><option>제조사</option><option>애플</option><option>삼성</option></select>
        <select class="input" style="flex:1 1 160px"><option>용량</option><option>64GB</option><option>128GB</option><option>256GB</option></select>
        <select class="input" style="flex:1 1 160px"><option>통신사</option><option>자급제</option><option>SKT</option><option>KT</option><option>LG U+</option></select>
      </div>
    </div>

    <div class="fld sub-fld" data-sel-case="cat" data-sel-when="의류" hidden>
      <span class="lb">의류에서 더 묻는 것</span>
      <div class="row wrap-row" style="gap:8px">
        <select class="input" style="flex:1 1 160px"><option>사이즈</option><option>S</option><option>M</option><option>L</option><option>XL</option></select>
        <select class="input" style="flex:1 1 160px"><option>성별</option><option>남성</option><option>여성</option><option>공용</option></select>
      </div>
    </div>

    <div class="fld">
      <span class="lb">물건 상태</span>
      <div class="stack-sm">
        ${CONDS.map((c, i) => `<label class="radio${c.k === it.cond ? ' on' : ''}">
          <input type="radio" name="cond"${c.k === it.cond ? ' checked' : ''}>
          <b>${c.k}</b> <span class="t-sub">${c.d}</span></label>`).join('')}
      </div>
      ${U.banner('info', '✍', `<b>「${it.cond}」은 이렇게 적으면 좋아요</b>
        <div class="t-sub mt1">${CONDS.find((c) => c.k === it.cond).tip}</div>`, { cls: 'mt3' })}
    </div>

    <div class="fld">
      <label class="lb" for="us">쓴 기간</label>
      <select class="input" id="us"><option>고르기</option><option selected>6개월</option><option>1년</option><option>2년 이상</option></select>
    </div>

    <div class="fld">
      <label class="lb" for="ds">설명</label>
      <textarea class="input" id="ds" rows="6" placeholder="산 시기, 쓴 정도, 흠집이 있는 곳, 박스와 구성품이 있는지 적어 주세요">${U.esc(it.desc)}</textarea>
      <p class="t-sub mt1 right">${it.desc.length} / 2000</p>
      ${U.box(`<b class="t-card">이런 걸 적어 주세요</b>
        <ul class="dots t-sub mt2">
          <li>언제 샀고 얼마나 썼는지</li>
          <li>흠집이 있다면 어디에 있는지</li>
          <li>박스·설명서·구성품이 다 있는지</li>
          <li>왜 파는지 — 한 줄이면 충분해요</li>
        </ul>`, { cls: 'mt3' })}
    </div>`))}

  ${U.sec('③ 얼마에 파나요', U.card('', `
    <div class="fld">
      <label class="lb" for="pr">가격</label>
      <div class="row-c" style="gap:8px">
        <input class="input" id="pr" type="text" inputmode="numeric" value="${U.num(it.price)}" style="flex:1">
        <span class="nowrap">원</span>
      </div>
      <label class="check mt2"><input type="checkbox" data-toast="나눔으로 바꿨어요 · 가격이 0원이 됩니다"><span>나눔(0원)으로 드릴게요</span></label>
    </div>

    <div class="fld">
      <label class="check"><input type="checkbox" checked data-toast="제안 받을 최저 금액을 정해 주세요"><span><b>가격 제안 받을게요</b></span></label>
      <div class="row-c mt2" style="gap:8px">
        <input class="input" type="text" inputmode="numeric" value="${U.num(it.offerMin)}" style="flex:1" placeholder="제안 받을 최저 금액">
        <span class="nowrap">원부터</span>
      </div>
      <p class="t-sub mt1">이 금액보다 낮은 제안은 아예 오지 않아요.</p>
    </div>

    ${U.banner('info', '📊', `<b>비슷한 물건은 얼마에 팔렸을까요?</b>
      <div class="t-sub mt1">최근 3개월 거래 128건을 보여드려요.</div>`,
    { right: U.btn('시세 보기', { href: 'SL-03', cls: 'btn-ghost btn-sm' }) })}`))}

  ${U.sec('④ 어떻게 거래하나요', U.card('', `
    <div class="fld">
      <span class="lb">거래 방식</span>
      ${['직거래', '택배', '안전결제'].map((w) => `<label class="check"><input type="checkbox"${it.ways.includes(w) ? ' checked' : ''}
        data-toast="${w} 거래를 ${it.ways.includes(w) ? '껐어요' : '켰어요'}"><span>${w}</span></label>`).join('')}
      <div class="sub-fld mt3">
        <label class="lb" for="sh">배송비</label>
        <div class="row-c" style="gap:8px">
          <input class="input" id="sh" type="text" inputmode="numeric" value="${U.num(it.ship)}" style="flex:1">
          <span class="nowrap">원</span>
        </div>
      </div>
      ${U.banner('info', '🛡', `<b>안전결제를 켜면</b>
        <div class="t-sub mt1">사는 분이 돈을 보내도 바로 받지 못하고, 물건을 받았다고 눌러야 정산됩니다.
        수수료 ${(FEE_RATE * 100).toFixed(1)}%가 정산할 때 빠집니다 — ${U.won(it.price)}이면 ${U.won(Math.round(it.price * FEE_RATE))}입니다.</div>`, { cls: 'mt3' })}
    </div>

    <div class="fld">
      <span class="lb">직거래 가능 지역</span>
      ${U.chips([TOWNS.mine], 0)}
      <p class="t-sub mt2">등록하고 인증한 동네에서만 고를 수 있어요.
        <a class="link" href="${U.link('SE-01')}">동네 설정하기</a></p>
    </div>`))}

  ${U.banner('warn', '🚫', `<b>이런 물건은 올릴 수 없어요</b>
    <div class="t-sub mt1">${BANNED.filter((b) => b.on).map((b) => b.k).join(' · ')}</div>
    <label class="check mt3"><input type="checkbox" data-unlock="postbtn">
      <span>이 물건은 금지 품목이 아니고, 적은 내용이 사실입니다</span></label>`,
    { right: U.btn('금지 품목 보기', { href: 'HO-03', cls: 'btn-ghost btn-sm' }) })}
  `;

  const 아래바 = U.stickBar(
    `<span class="t-sub">맨 아래 「금지 품목이 아닙니다」를 확인하면 등록할 수 있어요</span>`,
    U.btn('임시 저장', { cls: 'btn-ghost', attr: ' data-toast="쓰던 글을 저장했어요"' })
    + U.btn('미리보기', { cls: 'btn-ghost', attr: ' data-toast="목록에서 어떻게 보이는지 보여드릴게요"' })
    + U.btn('등록하기', { cls: 'btn-pri', id: 'postbtn', off: true, attr: ` data-go="${U.link('SL-04')}"` }));

  return { body: U.article(본문), o: { stick: 아래바 } };
}

/* ---------------- SL-02 사진 등록·정리 ---------------- */
function SL02() {
  const it = itemBy('i1');
  const 사진 = [1, 2, 3, 4, 5];

  const 왼쪽 = `
  ${U.card('사진 올리기', `
    <div class="drop">
      <div style="font-size:28px">🖼</div>
      <b>사진을 끌어다 놓거나 눌러서 고르세요</b>
      <p class="t-sub mt1">최대 10장 · jpg · png · webp · 한 장 10MB까지</p>
      ${U.btn('사진 고르기', { cls: 'btn-pri mt3', attr: ' data-toast="사진을 골라 주세요"' })}
    </div>`)}

  <div class="mt-block">${U.card(`올린 사진 ${사진.length}장`, `
    <div class="photo-grid">
      ${사진.map((n) => `<div class="photo-cell">
        ${n === 1 ? `<span class="rep">${U.badge('대표', 'b-pri')}</span>` : ''}
        <button class="del" type="button" data-toast="${n}번째 사진을 지웠어요" data-toast-act="되돌리기" aria-label="사진 지우기">✕</button>
        ${U.phItem(140, it.id + n)}
        <div class="tools">
          <button class="btn btn-quiet btn-xs" type="button" data-toast="${n}번째 사진을 대표로 정했어요">대표로</button>
          <button class="btn btn-quiet btn-xs" type="button" data-modal="crop">자르기</button>
          <button class="btn btn-quiet btn-xs" type="button" data-toast="90도 돌렸어요">회전</button>
        </div>
      </div>`).join('')}
      <div class="photo-cell up">
        <div class="up-in">
          <div class="t-sub">올리는 중 · 62%</div>
          ${U.progress(62)}
        </div>
      </div>
    </div>
    <p class="t-sub mt3">카드를 끌어서 순서를 바꿀 수 있어요. <b>맨 앞 사진이 대표</b>가 됩니다.</p>`)}</div>

  <div class="mt-block">${U.banner('ok', '🗜', `<b>큰 사진은 자동으로 줄였어요</b>
    <div class="t-sub mt1">4번째 사진 12MB → 3MB. 화면에서 보이는 데는 차이가 없어요.</div>`)}</div>

  <div class="mt-block">${U.banner('warn', '⚠', `<b>3번째 사진을 못 올렸어요</b>
    <div class="t-sub mt1">heic 형식은 아직 받지 못해요. jpg 나 png 로 바꿔서 올려 주세요.</div>`,
    { right: U.btn('다시 시도', { cls: 'btn-ghost btn-sm', attr: ' data-toast="다시 올리고 있어요"' }) })}</div>

  ${U.modal('crop', '사진 자르기', `
    <p class="t-sub mb3">정사각 틀 안으로 끌어 맞춰 주세요. 목록에서는 이 모양으로 보입니다.</p>
    ${U.phItem(260, it.id + 'crop')}
    <div class="row-c mt3" style="gap:8px"><span class="t-sub">확대</span>${U.progress(40)}</div>`,
    U.btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' }) + U.btn('이대로 자르기', { cls: 'btn-pri', attr: ' data-dismiss data-toast="사진을 잘랐어요"' }))}
  `;

  const 오른쪽 = `
  ${U.card('목록에서 이렇게 보여요', `
    ${U.itemRow(it, { href: false, heart: false })}
    <p class="t-sub mt3">첫 사진이 이 자리에 들어갑니다.</p>`)}

  <div class="mt-block">${U.box(`<b class="t-card">사진 잘 찍는 법</b>
    <ul class="dots t-sub mt2">
      <li>밝은 곳에서 찍으면 더 빨리 팔려요</li>
      <li>흠집이 있으면 그 부분도 따로 찍어 주세요</li>
      <li>박스·구성품이 있으면 함께 찍어 주세요</li>
      <li>다른 사람 사진을 가져다 쓰면 신고 대상이에요</li>
    </ul>`)}</div>

  <div class="mt-block">${U.card('', `
    ${U.btn('판매글로 돌아가기', { href: 'SL-01', cls: 'btn-ghost btn-block' })}
    <div class="mt2">${U.btn('등록하기', { href: 'SL-04', cls: 'btn-pri btn-block' })}</div>`)}</div>
  `;
  return { body: U.detail2(왼쪽, 오른쪽), o: {} };
}

/* ---------------- SL-03 시세 보기 ---------------- */
function SL03() {
  const 분포 = [[10, 4], [15, 12], [20, 27], [25, 38], [30, 31], [35, 12], [40, 4]];
  const 합 = 분포.reduce((a, d) => a + d[1], 0);
  const 상태별 = [['새것', 385000, 9], ['거의 새것', 318000, 42], ['사용감 있음', 241000, 63], ['고장', 88000, 14]];
  const 사례 = [
    ['9월 2일', 320000, '거의 새것', '3일'],
    ['8월 30일', 295000, '거의 새것', '5일'],
    ['8월 27일', 260000, '사용감 있음', '2일'],
    ['8월 24일', 340000, '새것', '8일'],
    ['8월 21일', 235000, '사용감 있음', '4일'],
    ['8월 18일', 310000, '거의 새것', '6일'],
  ];
  const 지금 = ITEMS.filter((x) => x.cat === '생활가전' || x.cat === '디지털기기').slice(0, 4);

  const body = `
  ${U.pageHd('다이슨 무선청소기 V11 시세', '최근 3개월 거래 <b>128건</b> 기준')}

  ${U.tabs([{ label: '최근 1개월', cnt: 41 }, { label: '최근 3개월', cnt: 128 }, { label: '최근 6개월', cnt: 264 }], 1)}

  <div class="mt4">${U.card('가격 분포', `
    ${U.phMap('가격 분포 차트', 800, 300)}
    <div class="bars mt4">
      ${분포.map(([만, n]) => `<div class="bar-row">
        <span class="nowrap t-sub" style="width:72px">${만}만원대</span>
        ${U.progress(Math.round(n / 38 * 100))}
        <span class="nowrap t-sub" style="width:44px;text-align:right">${n}건</span></div>`).join('')}
    </div>
    <p class="t-sub mt3">전체 ${합}건 · 가장 많은 구간은 <b>25만원대</b>예요.</p>`)}</div>

  ${U.sec('물건 상태별 평균가', U.table(
    [{ t: '상태', w: '28%' }, { t: '평균가' }, { t: '거래 건수' }, { t: '', w: '18%' }],
    상태별.map(([k, p, n]) => [
      U.badge(k, 'b-mut'), `<b>${U.won(p)}</b>`, `${n}건`,
      U.btn('이 상태만', { cls: 'btn-ghost btn-xs', attr: ` data-toast="${k} 거래만 보여드릴게요 · 평균 ${U.won(p)}"` }),
    ])))}

  ${U.sec('최근 거래 사례', U.table(
    [{ t: '언제' }, { t: '얼마에' }, { t: '상태' }, { t: '팔리기까지' }],
    사례.map(([d, p, c, t]) => [d, `<b>${U.won(p)}</b>`, U.badge(c, 'b-mut'), t])))}

  ${U.sec('지금 올라와 있는 같은 물건', `<div class="g4">${지금.map((x) => U.itemCard(x)).join('')}</div>`,
    { more: 'SE-02' })}

  ${U.sec('얼마에 올리면 좋을까요', `<div class="g3">
    ${[[280000, '2일', '빨리 팔고 싶다면'], [320000, '4일', '보통은 이 값'], [360000, '11일', '급하지 않다면']]
      .map(([p, d, why], i) => U.card('', `
        <p class="t-sub">${why}</p>
        <div class="t-sec mt1">${U.won(p)}</div>
        <p class="t-sub mt1">평균 <b>${d}</b>쯤 걸려요</p>
        <div class="mt3">${U.btn('이 가격으로 정하기', { href: 'SL-01', cls: i === 1 ? 'btn-pri btn-block btn-sm' : 'btn-ghost btn-block btn-sm' })}</div>`)).join('')}
  </div>`)}

  ${U.banner('info', '📉', `<b>표본이 적으면 이 화면이 달라져요</b>
    <div class="t-sub mt1">최근 거래가 3건도 안 되는 물건은 그래프 대신 「비슷한 물건으로 넓혀 보기」가 나옵니다.</div>`)}
  `;
  return { body: U.article(body), o: {} };
}

/* ---------------- SL-04 등록 완료 ---------------- */
function SL04() {
  const it = itemBy('i1');
  const body = `
  <div class="center mt-block">
    <div style="font-size:44px">✅</div>
    <h1 class="t-page mt2">판매글이 올라갔어요</h1>
    <p class="t-sub mt2">${TOWNS.mine} 이웃들이 지금부터 볼 수 있어요.</p>
  </div>

  <div class="mt-block">${U.card('내 글이 이렇게 보여요', U.itemRow(it, { href: 'SE-04' }))}</div>

  <div class="mt-block">${U.statRow([
    [U.num(1284), '이 동네에서 볼 수 있는 이웃'],
    ['37개', '오늘 이 분류에 올라온 글'],
    ['4일', '비슷한 물건 평균 거래 기간'],
  ], 'g3')}</div>

  <div class="mt-block">${U.card('알리기', `
    <div class="btns">
      ${U.btn('🔗 링크 복사', { cls: 'btn-ghost', attr: ' data-toast="링크를 복사했어요"' })}
      ${U.btn('💬 카카오톡 공유', { cls: 'btn-ghost', attr: ' data-toast="공유 창을 열었어요"' })}
    </div>`)}</div>

  <div class="mt-block">${U.box(`<b class="t-card">이제 이렇게 되어요</b>
    <ul class="dots t-sub mt2">
      <li>채팅이 오면 알려드려요. 답이 빠를수록 매너 온도가 오릅니다</li>
      <li>약속을 잡으면 <b>예약중</b>으로 바꿔 주세요 — 다른 분이 헛걸음하지 않아요</li>
      <li>거래가 끝나면 <b>거래완료</b>로 바꾸고 후기를 남겨 주세요</li>
    </ul>`)}</div>

  <div class="mt-block">${U.card('끌올', `
    <div class="row-b wrap-row">
      <div>
        <b>무료 끌올은 24시간 뒤부터 할 수 있어요</b>
        <p class="t-sub mt1">남은 시간 <b>${BOOST_FREE_LEFT}</b></p>
      </div>
      ${U.btn('무료 끌올', { cls: 'btn-ghost', off: true })}
    </div>
    <div class="mt4">
      <p class="t-sub mb2">더 빨리 올리고 싶으시면</p>
      <div class="g3">
        ${BOOSTS.map((b) => `<a class="tile" href="${U.link('BS-01')}">
          <span class="nm">${b.k}</span><span class="t-sub">${U.won(b.price)} · ${b.keep}</span></a>`).join('')}
      </div>
      <p class="t-sub mt3">끌올한 글에는 목록에서 <b>「끌올」 배지</b>가 붙어요. 광고라는 것을 이웃에게 알립니다.</p>
    </div>`)}</div>

  <div class="btns center mt-block">
    ${U.btn('내 판매글 관리', { href: 'SL-05', cls: 'btn-pri btn-lg' })}
    ${U.btn('판매글 더 쓰기', { href: 'SL-01', cls: 'btn-ghost btn-lg' })}
  </div>
  `;
  return { body: U.article(body), o: {} };
}

/* ---------------- SL-05 내 판매글 관리 ---------------- */
function SL05() {
  const 내것 = ITEMS.filter((x) => x.by === 'u6' || ['i1', 'i5', 'i7', 'i11'].includes(x.id));
  const 상태 = ['판매중', '예약중', '거래완료', '숨김'];
  const 셈 = (st) => 내것.filter((x) => x.st === st).length;

  const 줄 = (it) => `<div class="item-row" data-st="${it.st}">
    <span class="thumb">${U.phItem(80, it.id)}${it.st !== '판매중' ? `<span class="veil" data-t="${it.st}"></span>` : ''}</span>
    <span class="mid">
      <span class="row-c wrap-row">${it.boost ? U.boostBadge() : ''}<b class="nm">${U.esc(it.t)}</b>
        <span class="badge ${{ 판매중: 'b-pri', 예약중: 'b-acc', 거래완료: 'b-mut', 숨김: 'b-mut' }[it.st]}" data-badge-of>${it.st}</span></span>
      <span class="met"><span class="k">올린 날 ${ago(it.min)}</span><span class="k">조회 ${it.view}</span><span class="k">찜 ${it.wish}</span><span class="k">채팅 ${it.chat}</span></span>
      <span class="price">${U.won(it.price)}</span>
    </span>
    <span class="act">
      <select class="input" style="width:auto" data-row-badge data-toast="상태를 바꿨어요 · 목록의 배지도 함께 바뀝니다">
        ${상태.map((s) => `<option${s === it.st ? ' selected' : ''}>${s}</option>`).join('')}
      </select>
      ${it.boost
      ? U.btn('끌올 진행중', { cls: 'btn-ghost btn-sm', off: true })
      : (it.id === 'i7'
        ? U.btn('끌올', { href: 'BS-01', cls: 'btn-pri btn-sm' })
        : U.btn(`끌올 ${BOOST_FREE_LEFT} 뒤`, { cls: 'btn-ghost btn-sm', off: true }))}
      <div class="btns">
        ${U.btn('수정', { href: 'SL-01', cls: 'btn-quiet btn-xs' })}
        ${U.btn('가격 내리기', { cls: 'btn-quiet btn-xs', attr: ' data-modal="down"' })}
        ${U.btn('거래완료', { cls: 'btn-quiet btn-xs', attr: ' data-modal="done"' })}
      </div>
    </span>
  </div>`;

  const 본문 = `
  ${U.pageHd('내 판매글', `모두 ${내것.length}개`, U.btn('판매글 쓰기', { href: 'SL-01', cls: 'btn-pri' }))}

  ${U.tabs(상태.map((s, i) => ({ label: s, cnt: 셈(s), pane: 'sl' + i })), 0)}

  <div class="mt4">
    ${상태.map((st, i) => {
    const 것들 = 내것.filter((x) => x.st === st);
    return `<div data-pane-body="sl${i}"${i === 0 ? '' : ' hidden'}>
      ${것들.length
        ? `<div class="stack">${것들.map(줄).join('')}</div>`
        : U.empty('📦', `${st}인 글이 없어요`, '', U.btn('판매글 쓰기', { href: 'SL-01', cls: 'btn-pri' }))}
    </div>`;
  }).join('')}
  </div>

  <div class="mt-block">${U.banner('info', '⏳', `<b>30일이 지나 목록에서 내려간 글이 1개 있어요</b>
    <div class="t-sub mt1">끌올하면 다시 위로 올라옵니다.</div>`,
    { right: U.btn('한꺼번에 끌올', { href: 'BS-01', cls: 'btn-ghost btn-sm' }) })}</div>

  ${U.modal('done', '누구와 거래하셨나요?', `
    <p class="t-sub mb3">고르시면 그분에게 후기를 남길 수 있어요. 후기는 <b>서로</b> 남깁니다.</p>
    <div class="stack-sm">
      ${['초록나무', '민트초코', '해질녘'].map((n, i) => `<label class="radio${i === 0 ? ' on' : ''}">
        <input type="radio" name="buyer"${i === 0 ? ' checked' : ''}><b>${n}</b>
        <span class="t-sub">이 물건으로 채팅했어요</span></label>`).join('')}
      <label class="radio"><input type="radio" name="buyer"><b>채팅 밖에서 거래했어요</b></label>
    </div>`,
    U.btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' }) + U.btn('거래완료로 바꾸고 후기 쓰기', { href: 'MY-04', cls: 'btn-pri' }))}

  ${U.modal('down', '가격 내리기', `
    <p class="t-sub mb3">내리면 이 물건을 찜한 <b>8명</b>에게 알림이 갑니다.</p>
    ${U.kv([['지금 가격', U.won(320000)]])}
    <div class="fld mt3"><label class="lb" for="np">새 가격</label>
      <input class="input" id="np" type="text" inputmode="numeric" placeholder="지금보다 낮게 적어 주세요"></div>`,
    U.btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' }) + U.btn('내리기', { cls: 'btn-pri', attr: ' data-dismiss data-toast="가격을 내렸어요 · 찜한 8명에게 알렸어요"' }))}
  `;
  return { body: U.myPage('SL-05', 본문), o: {} };
}

export const PAGES = { 'SL-01': SL01, 'SL-02': SL02, 'SL-03': SL03, 'SL-04': SL04, 'SL-05': SL05 };
