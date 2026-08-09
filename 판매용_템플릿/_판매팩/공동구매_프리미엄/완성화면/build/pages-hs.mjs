/* HS 공구 개설(진행자) 11장 — 시작 안내 · 개설 폼 · 검수 대기·승인·반려 */
import {
  ph, phAva, phFix, btn, badge, stBadge, chips, tabs, sec, card, banner, table, kv,
  gauge, countdown, tierTable, accordion, hsteps, sumRows, timeline, toastNow, modalNow,
  pageHd, detail2, hostPage, num, won, esc, link, off,
} from './ui.mjs';
import { CATS, DEALS, dealById, pctOf, FAQ, TIERS } from './data.mjs';

/* ── HS-01 진행자 시작 안내 ─────────────────────────────
   v: 'fee' 수수료·정산 상세 · 'faq' FAQ 확장 */
function hs01(ctx, v) {
  /* 수수료·정산 상세 */
  if (v === 'fee') {
    const body = `
    ${pageHd('수수료와 정산', '얼마를 떼고, 언제 들어오는지')}

    ${card('수수료', `${table(
      [{ t: '항목', w: '26%' }, '얼마', '언제', '비고'],
      [
        ['플랫폼 수수료', '<b>결제액의 5%</b>', '정산할 때 차감', '첫 공구는 0%'],
        ['결제 대행 수수료', '수수료에 포함', '—', '따로 떼지 않습니다'],
        ['신뢰 등급 A 할인', '<b>4%</b>', '등급 유지 동안', '성사율 80%+ · 평점 4.5+'],
        ['불발된 공구', '<b>0원</b>', '—', '전액 환불되고 수수료도 없습니다'],
        ['부분 환불', '환불액에 비례해 반환', '정산할 때', '떼었던 수수료를 돌려드립니다'],
        ['원천징수 (개인)', '3.3%', '지급할 때', '사업자는 세금계산서 발행'],
      ],
    )}`)}

    ${card('정산 흐름', timeline([
      ['공구 성사', '마감 직후 자동 판정'],
      ['발주·발송', '진행자가 송장을 올립니다'],
      ['배송 완료 확인', '송장 등록 후 자동 확인 (평균 3일)'],
      ['정산 확정', '배송 완료 확인 뒤 · 이때 금액이 확정됩니다'],
      ['입금', '정산 확정 후 <b>7영업일 이내</b> 등록 계좌로'],
    ], 3), { cls: 'mt6' })}

    ${card('예시로 보기 — 한라봉 5kg 공구 300명 성사', `${sumRows([
      ['참여자 결제가', '24,900원 × 300명 = 7,470,000원'],
      ['공급가(원가)', '−18,000원 × 300명 = −5,400,000원'],
      ['배송비(진행자 부담)', '−2,500원 × 300명 = −750,000원'],
      ['플랫폼 수수료 5%', '−373,500원'],
      ['원천징수 3.3% (개인)', '−31,235원'],
    ], ['실제 입금액', '915,265원'])}
      <div class="box mt4"><b>첫 공구는 수수료가 0%입니다</b>
        <p class="t-sub mt1">위 예시에서 수수료 373,500원을 빼면 <b>1,288,765원</b>이 들어옵니다.</p></div>`,
      { cls: 'mt6' })}

    ${card('돈이 묶이는 구간', `<p class="t-sub mb3">참여자가 낸 돈은 성사 전까지 저희가 안전하게 보관합니다(에스크로). 진행자에게는 배송이 끝난 뒤에 넘어갑니다.</p>
      ${table(
      ['시점', '돈은 어디에', '진행자가 쓸 수 있나'],
      [
        ['참여~마감', '플랫폼 보관 (결제 승인만)', '아니요'],
        ['성사~발송', '플랫폼 보관', '아니요'],
        ['배송 완료 확인', '정산 대기', '아니요'],
        ['정산 확정~입금', '지급 처리 중', '7영업일 안에 입금'],
      ],
    )}
      <div class="box mt4"><b>발주 대금이 먼저 필요하시면</b>
        <p class="t-sub mt1">성사가 확정된 공구에 한해 <b>선정산</b>을 신청하실 수 있습니다.
        정산 예정액의 70%까지, 수수료 1%를 더 뗍니다. 신뢰 등급 B 이상부터 됩니다.</p></div>`,
      { cls: 'mt6' })}

    <div class="btns mt6">
      ${btn('공구 개설하기', { cls: 'btn-primary btn-lg', href: 'HS-02' })}
      ${btn('정산 화면 보기', { cls: 'btn-ghost btn-lg', href: 'SE-01' })}
      ${btn('진행자 안내로 돌아가기', { cls: 'btn-ghost btn-lg', href: 'HS-01' })}
    </div>`;
    return { body, o: { state: '수수료·정산 상세' } };
  }

  /* FAQ 확장 */
  if (v === 'faq') {
    const groups = [
      ['시작하기', [
        { q: '사업자가 아니어도 되나요?', a: '됩니다. 다만 같은 상품을 반복해서 파시면 통신판매업 신고가 필요할 수 있습니다. 연간 거래액이 일정 규모를 넘으면 저희가 먼저 안내해 드립니다.' },
        { q: '무엇부터 준비해야 하나요?', a: '팔 상품과 공급처, 본인 명의 계좌 두 가지면 시작됩니다. 공급처에서 몇 개까지 얼마에 받을 수 있는지 먼저 확인하세요. 그 숫자가 목표 인원과 가격 단계의 기준이 됩니다.' },
        { q: '검수는 얼마나 걸리나요?', a: '영업일 기준 1~2일입니다. 반려되면 무엇을 고쳐야 하는지 적어 드리고, 고쳐서 다시 올리시면 보통 하루 안에 끝납니다.' },
      ]],
      ['공구 운영', [
        { q: '재고를 미리 사 둬야 하나요?', a: '아니요. 성사가 확정된 뒤에 발주하시면 됩니다. 그래서 재고 위험이 거의 없습니다. 다만 공급처에 최소 수량이 있다면 그것을 목표 인원으로 잡으세요.' },
        { q: '목표 인원은 어떻게 정하나요?', a: '공급처의 최소 발주 수량을 목표로 잡는 것이 가장 안전합니다. 처음에는 낮게 잡고 가격 단계를 여러 개 두시면, 사람이 더 모였을 때 값이 내려가 참여자가 친구를 부릅니다.' },
        { q: '중간에 값을 바꿀 수 있나요?', a: '모집이 시작된 뒤에는 바꾸실 수 없습니다. 이미 참여한 분들과의 약속이기 때문입니다. 다만 마감을 연장하거나 단계를 추가하는 것은 운영팀 확인 후 가능합니다.' },
        { q: '불발되면 손해인가요?', a: '아닙니다. 참여자에게 전액 환불되고 수수료도 없습니다. 다만 성사율이 낮으면 신뢰 등급이 내려가 노출이 줄어듭니다.' },
      ]],
      ['배송과 문제 처리', [
        { q: '배송은 직접 해야 하나요?', a: '공급처에서 바로 보내는 경우가 많습니다. 직접 보내셔도 되고, 어느 쪽이든 송장번호만 올려 주시면 참여자에게 자동으로 알림이 갑니다.' },
        { q: '배송이 늦어질 것 같으면?', a: '공구 관리에서 지연 공지를 보내실 수 있습니다. 미리 알리면 문의가 크게 줄고, 등급에도 영향이 적습니다. 알리지 않은 지연이 반복되면 개설이 제한됩니다.' },
        { q: '반품 요청이 오면?', a: '상품 하자면 진행자가 왕복 배송비를 부담하고 재발송하거나 환불합니다. 단순 변심은 상품 종류에 따라 다르며, 신선식품은 대부분 불가입니다.' },
      ]],
      ['정산', [
        { q: '언제 정산받나요?', a: '배송 완료가 확인된 뒤 7영업일 안에 등록하신 계좌로 보내드립니다.' },
        { q: '발주 대금이 먼저 필요해요', a: '성사가 확정된 공구는 선정산을 신청하실 수 있습니다. 정산 예정액의 70%까지, 수수료 1%가 더 붙습니다.' },
        { q: '세금계산서는 어떻게 받나요?', a: '사업자로 등록하시면 정산 내역에서 매월 발행하실 수 있습니다. 개인이시면 3.3% 원천징수 후 지급되고 지급명세서를 드립니다.' },
      ]],
    ];
    const body = `
    ${pageHd('진행자 자주 묻는 질문', `${groups.reduce((a, g) => a + g[1].length, 0)}개 질문`)}
    <div class="searchbar mb6">
      <input class="input" type="search" placeholder="궁금한 것을 검색하세요">
      ${btn('검색', { cls: 'btn-primary', attr: ' data-toast="검색했어요"' })}
    </div>
    ${chips(groups.map((g) => g[0]), 0)}
    ${groups.map(([g, items]) => `<div class="mt6">${sec(g, accordion(items, g === '시작하기' ? 0 : -1))}</div>`).join('')}

    ${banner('mut', '💬', `<b>여기에 없는 것은 물어보세요.</b>
      <p class="t-sub">진행자 전용 상담은 평일 10:00~18:00에 받습니다.</p>`,
      { cls: 'mt6', right: btn('1:1 문의', { cls: 'btn-ghost btn-sm', href: 'CS-02' }) })}

    <div class="btns mt6">
      ${btn('공구 개설하기', { cls: 'btn-primary btn-lg', href: 'HS-02' })}
      ${btn('진행자 안내로', { cls: 'btn-ghost btn-lg', href: 'HS-01' })}
    </div>`;
    return { body, o: { state: '진행자 FAQ 전체 펼침' } };
  }

  const body = `
  <div class="box center">
    <span class="badge b-acc">첫 공구 수수료 0%</span>
    <h1 class="t-page mt3">상품을 구할 곳만 있으면, 누구나 진행자가 됩니다</h1>
    <p class="t-sub mt2">모아공구에서 지난달에만 412개의 공구가 열렸습니다.</p>
    <div class="btns mt6 center">${btn('공구 개설하기', { cls: 'btn-primary btn-lg', href: 'HS-02' })}
      ${btn('먼저 둘러보기', { cls: 'btn-ghost btn-lg', href: 'HO-02' })}</div>
  </div>

  ${sec('진행자가 하는 일', `<div class="g4">
    ${[['🔎', '상품 구하기', '팔고 싶은 상품과 공급처를 정합니다.'],
    ['📝', '공구 열기', '가격 단계와 목표 인원, 모집 기간을 정해 올립니다.'],
    ['📣', '사람 모으기', '알림과 공유로 참여자를 모읍니다. 플랫폼도 함께 밀어드립니다.'],
    ['📦', '발주·배송', '성사되면 발주하고 배송을 챙깁니다.']]
      .map(([ic, t, d]) => `<div class="box"><div style="font-size:26px">${ic}</div><b class="mt2" style="display:block">${t}</b>
        <p class="t-sub mt2">${d}</p></div>`).join('')}
  </div>`, { cls: 'mt8' })}

  ${sec('수익은 이렇게 남습니다', `<div class="g2">
    ${card('예시 — 한라봉 5kg 공구', `${sumRows([
    ['참여자 결제가', '24,900원 × 300명 = 7,470,000원'],
    ['공급가(원가)', '−18,000원 × 300명 = −5,400,000원'],
    ['배송비(진행자 부담)', '−2,500원 × 300명 = −750,000원'],
    ['플랫폼 수수료 5%', '−373,500원'],
  ], ['진행자 수익', '946,500원'])}`)}
    ${card('수수료와 정산', `${kv([
      ['플랫폼 수수료', '결제액의 5% (첫 공구는 0%)'],
      ['결제 수수료', '수수료에 포함 (따로 안 뗍니다)'],
      ['정산 주기', '성사 후 배송 완료 확인 뒤 7영업일'],
      ['최소 정산액', '1만원 (미만이면 다음 회차로 이월)'],
      ['원천징수', '개인은 3.3% 공제 후 지급'],
    ])}
      <div class="box mt3"><p class="t-sub">불발되면 참여자에게 전액 환불되고, 수수료도 발생하지 않습니다.</p></div>
      <div class="btns mt3">${btn('수수료·정산 자세히', { cls: 'btn-ghost btn-sm', href: 'HS0102' })}</div>`)}
  </div>`, { cls: 'mt8' })}

  ${sec('시작하기 전에 준비할 것', `<div class="g3">
    ${[['상품과 공급처', '얼마에 몇 개까지 받을 수 있는지 미리 확인하세요. 목표 인원을 정하는 기준이 됩니다.', true],
    ['정산 계좌', '본인 명의 계좌가 필요합니다. 사업자가 아니어도 됩니다.', true],
    ['사업자등록', '없어도 시작할 수 있지만, 반복해서 여시려면 등록을 권합니다.', false]]
      .map(([t, d, req]) => `<div class="box"><div class="row-b"><b>${t}</b>${req ? badge('필수', 'b-danger') : badge('선택', 'b-mut')}</div>
        <p class="t-sub mt2">${d}</p></div>`).join('')}
  </div>`, { cls: 'mt8' })}

  ${sec('신뢰 등급', `${card('', `<p class="t-sub mb4">성사율과 배송 지연, 후기 평점으로 등급이 매겨집니다. 등급이 높으면 목록에서 더 위에 노출되고 수수료도 낮아집니다.</p>
    ${table(
    ['등급', '조건', '수수료', '노출'],
    [
      [badge('A', 'b-ok'), '성사율 80%+ · 지연 0회 · 평점 4.5+', '4%', '상위 노출'],
      [badge('B', 'b-pri'), '성사율 60%+ · 지연 1회 이하', '5%', '기본'],
      [badge('C', 'b-warn'), '성사율 40%+', '5%', '기본'],
      [badge('제한', 'b-danger'), '지연·미발송 3회 이상', '—', '개설 제한'],
    ],
  )}`)}`, { cls: 'mt8' })}

  ${sec('먼저 하신 분들', `<div class="g3">
    ${[['동네장터 지현', '공구 34회 · 성사율 91%', '처음엔 동네 단톡방에서 시작했어요. 지금은 매달 두 번씩 엽니다.'],
    ['살림고수 미란', '공구 21회 · 성사율 86%', '좋은 물건을 싸게 나누는 게 재밌어서 하다 보니 부업이 됐습니다.'],
    ['멍냥집사 태호', '공구 12회 · 성사율 100%', '반려동물 용품만 다룹니다. 아는 상품만 열어서 실패가 없어요.']]
      .map(([nm, st, t]) => `<div class="box"><div class="row" style="gap:10px">${phAva(40, nm)}
        <div><b>${nm}</b><div class="t-sub">${st}</div></div></div>
        <p class="mt3">${t}</p></div>`).join('')}
  </div>`, { cls: 'mt8' })}

  ${sec('자주 묻는 질문', accordion([
    { q: '사업자가 아니어도 되나요?', a: '됩니다. 다만 같은 상품을 반복해서 파시면 통신판매업 신고가 필요할 수 있습니다. 연간 거래액이 일정 규모를 넘으면 안내해 드립니다.' },
    { q: '재고를 미리 사 둬야 하나요?', a: '아니요. 성사가 확정된 뒤에 발주하시면 됩니다. 그래서 재고 위험이 거의 없습니다.' },
    { q: '불발되면 손해인가요?', a: '아닙니다. 참여자에게 전액 환불되고 수수료도 없습니다. 다만 성사율이 낮으면 등급이 내려갑니다.' },
    { q: '배송은 직접 해야 하나요?', a: '공급처에서 바로 보내는 경우가 많습니다. 직접 보내셔도 되고, 송장번호만 올려 주시면 됩니다.' },
    { q: '언제 정산받나요?', a: '배송 완료가 확인된 뒤 7영업일 안에 등록하신 계좌로 보내드립니다.' },
  ], 0), { cls: 'mt8', more: 'HS0103', moreLabel: '질문 전체 보기' })}

  <div class="box center mt8">
    <h2 class="t-sec">첫 공구는 수수료가 없습니다</h2>
    <p class="t-sub mt2">개설은 10분이면 끝나고, 검수는 영업일 기준 1~2일 걸립니다.</p>
    <div class="btns mt4 center">${btn('공구 개설하기', { cls: 'btn-primary btn-lg', href: 'HS-02' })}</div>
  </div>`;
  return { body, o: {} };
}

/* ── HS-02 공구 개설 폼 ───────────────────────────────
   v: 'tier' 단계별 가격 설정 · 'err' 유효성 오류 · 'draft' 임시 저장 · 'preview' 개설 미리보기 */
function hs02(ctx, v) {
  const err = v === 'err';

  /* 개설 미리보기 — 참여자에게 이렇게 보인다 */
  if (v === 'preview') {
    const d = dealById('d1');
    const body = hostPage('HS-02', `
      ${pageHd('개설 미리보기', '참여자에게는 이렇게 보입니다')}
      ${banner('mut', '👀', `<b>아직 올라가지 않았습니다.</b>
        <p class="t-sub">검수를 요청하시면 운영팀 확인 뒤 공개됩니다. 지금은 진행자만 볼 수 있습니다.</p>`,
      { right: `<div class="btns">${btn('고치러 가기', { cls: 'btn-ghost btn-sm', href: 'HS-02' })}
        ${btn('검수 요청', { cls: 'btn-primary btn-sm', href: 'HS-03' })}</div>` })}

      <div class="mt6">${detail2(`
        ${card('', `<div class="gal gal-3">
          ${ph(['상품 대표 사진', 1000, 1000], { seed: d.id })}
          ${ph(['상품 사진', 1000, 1000], { seed: d.id + '2', tiny: true })}
          ${ph(['상품 사진', 1000, 1000], { seed: d.id + '3', tiny: true })}
        </div>
        <div class="row wrap-row mt4" style="gap:8px">${badge('식품·간편식', 'b-mut')}${badge('조건부 결제', 'b-pri')}${countdown(10080)}</div>
        <h2 class="t-page mt3">${esc(d.nm)}</h2>
        <div class="t-sub mt2">동네장터 지현 · 성사 후 3일 내 발송</div>`)}

        ${card('달성률', `<div class="mt2">${gauge(0)}</div>
          <div class="row-b mt2"><span><b style="font-size:20px">0명</b> 참여 중</span>
            <b>300명이면 성사</b></div>
          <p class="t-sub mt2">아직 열리지 않아 0명입니다. 오픈되면 여기에 실시간으로 올라갑니다.</p>`, { cls: 'mt6' })}

        ${card('사람이 모일수록 싸집니다', tierTable([
      { n: 50, price: 32000 }, { n: 150, price: 28000 },
      { n: 250, price: 24900, now: true }, { n: 400, price: 21900 },
    ], { next: '오픈 직후에는 50명 단계(32,000원)부터 시작합니다.' }), { cls: 'mt6' })}

        ${card('배송·환불', kv([
      ['발송 일정', '성사 후 3일 이내'],
      ['배송비', '무료 (제주·도서산간 3,000원)'],
      ['1인 최대', '3개'],
      ['불발 시', '전액 자동 환불'],
    ]), { cls: 'mt6' })}`,
      card('참여자가 보는 값', `<div class="center">
          <span class="badge b-acc">${off(39000, 24900)}% 할인</span>
          <div class="price-old mt1">${won(39000)}</div>
          <div class="price-lg">${won(32000)}</div>
          <p class="t-sub mt1">오픈 직후 단계 가격</p></div>
        <div class="hr"></div>
        ${kv([['모집 기간', '8/5 10:00 ~ 8/12 23:59'], ['목표', '300명'], ['최소 성사', '250명']])}
        <div class="btns mt4"><span class="btn btn-primary btn-lg btn-block is-off">참여하기 (미리보기)</span></div>
        <div class="hr"></div>
        <p class="t-sub">이 화면은 참여자에게 보일 모습을 그대로 옮긴 것입니다. 버튼은 눌리지 않습니다.</p>`))}</div>

      <div class="btns mt6">
        ${btn('검수 요청하기', { cls: 'btn-primary btn-lg', href: 'HS-03' })}
        ${btn('더 고치기', { cls: 'btn-ghost btn-lg', href: 'HS-02' })}
      </div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '개설 미리보기 · 아직 공개 전' } };
  }

  const main = `
    ${err ? banner('danger', '⚠️', `<b>고쳐야 할 곳이 3군데 있습니다.</b>
      <p class="t-sub">아래 빨간 표시가 있는 칸을 채우거나 고쳐 주세요. 다 고치시면 검수 요청 단추가 눌립니다.</p>`, { cls: 'mb6' }) : ''}

    ${card('상품', `<div class="form">
      <div class="field"><label class="label">상품명 <span class="req">*</span></label>
        <input class="input" value="제주 한라봉 5kg 산지직송 (특대과)"><p class="hint">40자 이내 · 검색에 그대로 쓰입니다</p></div>
      <div class="field"><label class="label">카테고리 <span class="danger">*</span></label>
        <select class="select">${CATS.map((c, i) => `<option${i === 0 ? ' selected' : ''}>${c.nm}</option>`).join('')}</select></div>
      <div class="field"><label class="label">상품 사진 <span class="danger">*</span></label>
        <div class="row wrap-row" style="gap:10px">
          ${[1, 2, 3].map((i) => `<div style="width:120px">${ph(['상품 사진', 1000, 1000], { seed: 'up' + i, tiny: true })}</div>`).join('')}
          <button class="btn btn-ghost" type="button" data-toast="파일 선택 창이 열려요" style="width:120px;height:120px">＋ 추가</button>
        </div>
        <p class="hint">권장 1000×1000 (1:1) · 최대 10장 · 첫 장이 대표 사진이 됩니다</p></div>
      <div class="field"><label class="label">상세 설명</label>
        <div class="row mb2" style="gap:6px">
          ${['굵게', '목록', '이미지', '표', '링크'].map((t) => `<button class="btn btn-ghost btn-sm" type="button" data-toast="${t} 서식을 넣었어요">${t}</button>`).join('')}
        </div>
        <textarea class="textarea" rows="6" placeholder="원산지·중량·보관법·유의사항을 적어 주세요. 자세할수록 문의가 줄어듭니다."></textarea></div>
    </div>`)}

    ${card('가격 단계', `<p class="t-sub mb3">사람이 모일수록 값이 내려가게 만듭니다. 참여자가 친구를 부르는 가장 큰 이유입니다.</p>
      <div class="field"><label class="label">정가 <span class="req">*</span></label>
        <input class="input" value="39,000" style="max-width:200px"><p class="hint">비교용으로 보이는 값입니다</p></div>
      <div class="hr"></div>
      ${(v === 'tier' ? [[50, '32,000'], [150, '28,000'], [250, '24,900'], [400, '21,900'], [600, '19,900']]
    : err ? [[50, '32,000'], [150, '28,000'], [250, '41,000'], [400, '21,900']]
      : [[50, '32,000'], [150, '28,000'], [250, '24,900'], [400, '21,900']])
    .map(([n, p], i) => {
      const val = parseInt(String(p).replace(/,/g, ''), 10);
      const bad = err && val > 39000;
      return `<div class="row wrap-row mt3" style="gap:10px;align-items:center">
          <span class="muted">⠿</span>
          <input class="input" value="${n}" style="width:100px"><span class="t-sub">명부터</span>
          <input class="input${bad ? ' is-err' : ''}" value="${p}" style="width:130px"><span class="t-sub">원</span>
          <span class="t-sub grow">${bad ? '<span class="err" style="margin:0">정가(39,000원)보다 비쌉니다</span>' : `정가 대비 ${Math.round((1 - val / 39000) * 100)}%`}</span>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="이 단계를 지웠어요"${i === 0 ? ' disabled' : ''}>삭제</button>
        </div>`;
    }).join('')}
      <button class="btn btn-soft btn-block btn-sm mt4" type="button" data-toast="가격 단계를 추가했어요">＋ 단계 추가</button>

      ${v === 'tier' ? `<div class="hr"></div>
      <h4 class="t-card mb3">참여자에게는 이렇게 보입니다</h4>
      ${tierTable([
      { n: 50, price: 32000, now: true }, { n: 150, price: 28000 },
      { n: 250, price: 24900 }, { n: 400, price: 21900 }, { n: 600, price: 19900 },
    ], { next: '오픈 직후에는 50명 단계(32,000원)부터 시작합니다.' })}
      <div class="box mt4"><b>단계를 어떻게 잡으면 좋을까요</b>
        <ul class="t-sub mt2" style="padding-left:18px;line-height:1.9">
          <li><b>첫 단계는 낮게.</b> 오픈 직후 값이라 너무 비싸면 초반에 사람이 안 붙습니다.</li>
          <li><b>목표 인원 바로 앞에 한 단계를 두세요.</b> “8명만 더 모으면 싸진다”가 가장 잘 먹힙니다.</li>
          <li><b>공급가 아래로는 내려가지 않게.</b> 마지막 단계에서도 남는지 아래 예상 수익으로 확인하세요.</li>
          <li>단계는 최대 6개까지 만드실 수 있습니다.</li>
        </ul></div>
      ${table(
      ['단계', '인원', '값', '정가 대비', '이 단계에서 내 수익(개당)'],
      [
        ['1', '50명~', won(32000), '-18%', won(32000 - 20500)],
        ['2', '150명~', won(28000), '-28%', won(28000 - 20500)],
        ['3', '250명~', won(24900), '-36%', won(24900 - 20500)],
        ['4', '400명~', won(21900), '-44%', won(21900 - 20500)],
        ['5', '600명~', won(19900), '-49%', `<span class="danger">${won(19900 - 20500)}</span>`],
      ],
    )}
      <p class="t-sub mt2">공급가 18,000원 + 배송비 2,500원 기준입니다. 5단계는 팔수록 손해라 빼시는 편이 좋습니다.</p>` : ''}`,
    { cls: 'mt6' })}

    ${card('목표와 기간', `<div class="field-row">
      <div class="field grow"><label class="label">목표 인원 <span class="req">*</span></label>
        <input class="input" value="300"><p class="hint">이 인원을 못 채우면 불발됩니다</p></div>
      <div class="field grow"><label class="label">최소 성사 인원</label>
        <input class="input${err ? ' is-err' : ''}" value="${err ? '400' : '250'}">
        <p class="${err ? 'err' : 'hint'}">${err ? '최소 성사 인원이 목표 인원(300명)보다 많습니다' : '비워 두면 목표 인원과 같습니다'}</p></div>
    </div>
    <div class="field-row">
      <div class="field grow"><label class="label">모집 시작 <span class="req">*</span></label>
        <div class="row" style="gap:8px"><input class="input" type="date" value="2026-08-05"><input class="input" type="time" value="10:00"></div></div>
      <div class="field grow"><label class="label">모집 마감 <span class="req">*</span></label>
        <div class="row" style="gap:8px"><input class="input${err ? ' is-err' : ''}" type="date" value="${err ? '2026-08-03' : '2026-08-12'}"><input class="input" type="time" value="23:59"></div>
        ${err ? '<p class="err">마감이 시작보다 빠릅니다</p>' : ''}</div>
    </div>
    <div class="field-row">
      <div class="field grow"><label class="label">1인 최대 수량</label><input class="input" value="3"></div>
      <div class="field grow"><label class="label">전체 수량 한도</label><input class="input" value="600"><p class="hint">공급처에서 받을 수 있는 최대치</p></div>
    </div>`, { cls: 'mt6' })}

    ${card('옵션', `${[['5kg (특대과 12~14과)', '0', '여유'], ['10kg (특대과 24~28과)', '22,000', '여유'], ['5kg + 감귤 3kg', '9,000', '품절']]
      .map(([nm, add, st], i) => `<div class="row wrap-row mt3" style="gap:10px;align-items:center">
        <span class="muted">⠿</span>
        <input class="input grow" value="${nm}" style="min-width:200px">
        <span class="t-sub">추가금</span><input class="input" value="${add}" style="width:110px">
        <select class="select" style="width:110px"><option${st === '여유' ? ' selected' : ''}>여유</option><option${st === '품절' ? ' selected' : ''}>품절</option></select>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="옵션을 지웠어요"${i === 0 ? ' disabled' : ''}>삭제</button>
      </div>`).join('')}
      <button class="btn btn-soft btn-block btn-sm mt4" type="button" data-toast="옵션을 추가했어요">＋ 옵션 추가</button>`,
    { cls: 'mt6' })}

    ${card('배송', `<div class="field-row">
      <div class="field grow"><label class="label">배송비</label>
        <select class="select"><option selected>무료 (진행자 부담)</option><option>참여자 부담 3,000원</option><option>조건부 무료</option></select></div>
      <div class="field grow"><label class="label">발송 시작</label>
        <select class="select"><option>성사 후 1일 이내</option><option selected>성사 후 3일 이내</option><option>성사 후 5일 이내</option><option>성사 후 7일 이내</option></select></div>
    </div>
    <div class="field"><label class="label">지역 제한</label>
      ${chips(['제한 없음', '제주 제외', '도서산간 제외'], 0)}</div>
    <div class="field"><label class="label">제주·도서산간 추가 배송비</label>
      <input class="input" value="3,000" style="max-width:200px"></div>`, { cls: 'mt6' })}

    ${card('환불 정책 확인', `<div class="box">
      <b>이 플랫폼의 모든 공구는 조건부 결제입니다</b>
      <p class="t-sub mt1">목표 인원에 못 미치면 참여자에게 자동으로 전액 환불되고, 진행자에게 수수료도 청구되지 않습니다.</p>
    </div>
    <label class="check mt3"><input type="checkbox" data-unlock="subBtn"${err ? '' : ' checked'}><span><b>조건부 결제·자동 환불 정책을 확인했습니다</b> <span class="danger">(필수)</span></span></label>
    <label class="check"><input type="checkbox"${err ? '' : ' checked'}><span><b>배송·품질에 대한 책임이 진행자에게 있음을 확인했습니다</b> <span class="danger">(필수)</span></span></label>`,
    { cls: 'mt6' })}`;

  const aside = card('예상 수익', `${v === 'draft' ? `<div class="box mb4"><b>임시 저장됨</b>
      <p class="t-sub mt1">2026년 8월 4일 14:52에 저장했습니다. 이 화면을 닫으셔도 남아 있습니다.</p></div>` : ''}
    <div class="field"><label class="label">공급가 (원가)</label>
      <input class="input" value="18,000"></div>
    <div class="field"><label class="label">건당 배송비</label><input class="input" value="2,500"></div>
    <div class="hr"></div>
    ${sumRows([
    ['목표 달성 시 매출', '7,470,000원'],
    ['공급가', '−5,400,000원'],
    ['배송비', '−750,000원'],
    ['수수료 5%', '−373,500원'],
  ], ['예상 수익', '946,500원'])}
    <div class="box mt3"><b>첫 공구는 수수료 0%</b>
      <p class="t-sub mt1">수수료를 빼면 <b>1,320,000원</b>이 됩니다.</p></div>
    <div class="hr"></div>
    <div class="btns">
      <button class="btn btn-primary btn-lg btn-block${err ? ' is-off' : ''}" id="subBtn" type="button"${err ? ' disabled' : ''} data-toast="검수를 요청했어요">검수 요청하기</button>
    </div>
    ${err ? '<p class="err center">고쳐야 할 곳 3군데를 먼저 고쳐 주세요</p>' : ''}
    ${btn('임시 저장', { cls: 'btn-ghost btn-block', href: 'HS0204' })}
    ${btn('참여자 화면 미리보기', { cls: 'btn-ghost btn-block', href: 'HS0205' })}
    <div class="hr"></div>
    <div class="row" style="gap:8px">${btn('가격 단계 설정', { cls: 'btn-ghost btn-sm grow', href: 'HS0202' })}
      ${btn('검수 결과', { cls: 'btn-ghost btn-sm grow', href: 'HS-03' })}</div>`);

  const body = hostPage('HS-02', `${pageHd('공구 개설', '검수는 영업일 기준 1~2일 걸립니다')}<div class="mt6">${detail2(main, aside)}</div>`);
  const o = { wrapCls: 'wrap wrap-full' };
  if (v === 'tier') o.state = '가격 단계 5개 설정 중';
  if (err) { o.state = '유효성 오류 3건 — 검수 요청 잠김'; o.after = toastNow('고쳐야 할 곳이 3군데 있습니다'); }
  if (v === 'draft') {
    o.state = '임시 저장됨 · 2026-08-04 14:52';
    o.after = toastNow('임시 저장했어요. 나중에 이어서 쓰실 수 있어요', { ok: true, act: '임시 저장 목록' });
  }
  return { body, o };
}

/* ── HS-03 개설 검수 ──────────────────────────────────
   v: 'ok' 승인됨 · 'no' 반려됨 (기본은 검수 대기) */
function hs03(ctx, v) {
  const d = dealById('d1');

  /* 승인됨 */
  if (v === 'ok') {
    const body = hostPage('HS-02', `
      ${pageHd('개설 검수', '제주 한라봉 5kg 산지직송 (특대과)')}

      ${card('', `${hsteps(['제출 완료', '검수 중', '승인·오픈'], 2)}
        <div class="row-b mt6 wrap-row">
          <div><div class="t-sub">제출 일시</div><b>2026년 8월 4일 15:12</b></div>
          <div><div class="t-sub">승인 일시</div><b>2026년 8월 5일 10:40</b></div>
          <div><div class="t-sub">검수 번호</div><b>RV-20260804-0177</b></div>
        </div>`)}

      ${banner('ok', '✅', `<b>승인됐습니다. 8월 5일 10:00에 자동으로 열립니다.</b>
        <p class="t-sub mt1">오픈 30분 전에 알려드립니다. 그전까지는 내용을 고치실 수 있습니다.</p>`,
      { cls: 'mt6', right: btn('공구 화면 보기', { cls: 'btn-primary btn-sm', href: 'DE-01' }) })}

      ${card('오픈 전에 해 두시면 좋은 것', `${[
      ['알림 대상 확인', '이 카테고리에 알림을 걸어 둔 분이 1,284명입니다. 오픈되면 자동으로 알림이 갑니다.'],
      ['공급처 재확인', '오픈 전에 수량과 단가를 한 번 더 확인해 주세요. 오픈 뒤에는 값을 바꾸실 수 없습니다.'],
      ['공유 링크 준비', '단톡방·커뮤니티에 올릴 링크를 미리 받아 두세요. 초반 30분이 성사율을 가릅니다.'],
      ['문의 대응 준비', '자주 나올 질문에 미리 답을 적어 두시면 문의가 절반으로 줄어듭니다.'],
    ].map(([t, s], i) => `<div class="row mt3" style="gap:12px;align-items:flex-start">
        <span class="badge nowrap">${i + 1}</span><div><b>${t}</b><p class="t-sub mt1">${s}</p></div></div>`).join('')}`,
      { cls: 'mt6' })}

      ${card('오픈 일정', timeline([
      ['제출', '2026년 8월 4일 15:12 · 완료'],
      ['검수 승인', '2026년 8월 5일 10:40 · 완료'],
      ['오픈 예약', '2026년 8월 5일 10:00 — 자동으로 열립니다'],
      ['모집 마감', '2026년 8월 12일 23:59'],
      ['성사 판정', '마감 직후 자동'],
    ], 2), { cls: 'mt6' })}

      <div class="btns mt6">
        ${btn('공구 관리로 가기', { cls: 'btn-primary btn-lg', href: 'HM-02' })}
        ${btn('공유 링크 받기', { cls: 'btn-ghost btn-lg', attr: ' data-toast="공유 링크를 복사했어요" data-toast-kind="ok"' })}
        ${btn('오픈 전 수정', { cls: 'btn-ghost btn-lg', href: 'HS-02' })}
      </div>`);
    return {
      body,
      o: { wrapCls: 'wrap wrap-full', state: '승인 완료 · 8월 5일 10:00 오픈 예정', after: toastNow('검수가 승인됐어요', { ok: true, act: '공구 보기' }) },
    };
  }

  /* 검수 대기(기본) */
  if (v !== 'no') {
    const body = hostPage('HS-02', `
      ${pageHd('개설 검수', '제주 한라봉 5kg 산지직송 (특대과)')}

      ${card('', `${hsteps(['제출 완료', '검수 중', '승인·오픈'], 1)}
        <div class="row-b mt6 wrap-row">
          <div><div class="t-sub">제출 일시</div><b>2026년 8월 4일 15:12</b></div>
          <div><div class="t-sub">예상 완료</div><b>2026년 8월 6일쯤</b></div>
          <div><div class="t-sub">검수 번호</div><b>RV-20260804-0177</b></div>
        </div>`)}

      ${banner('warn', '🕒', `<b>검수 중입니다. 영업일 기준 1~2일 걸립니다.</b>
        <p class="t-sub mt1">끝나면 알림으로 알려드립니다. 검수 중에는 내용을 고치실 수 없습니다.</p>`, { cls: 'mt6' })}

      ${card('무엇을 보나요', `${table(
      [{ t: '항목', w: '26%' }, '보는 것', '상태'],
      [
        ['상품 정보', '이름·카테고리·원산지·중량이 맞는지', badge('확인 완료', 'b-ok')],
        ['사진', '직접 찍은 사진인지, 다른 쇼핑몰 로고가 없는지', badge('확인 중', 'b-warn')],
        ['가격 단계', '정가보다 비싼 단계가 없는지, 순서가 맞는지', badge('확인 완료', 'b-ok')],
        ['배송 일정', '지킬 수 있는 일정인지', badge('확인 중', 'b-warn')],
        ['금지 품목', '팔 수 없는 물건이 아닌지', badge('확인 완료', 'b-ok')],
      ],
    )}`, { cls: 'mt6' })}

      ${card('제출하신 내용', `<div class="row wrap-row" style="gap:16px">
        ${phFix(['상품 사진', 1000, 1000], 120, { seed: d.id })}
        <div class="grow"><b>${esc(d.nm)}</b>
          <div class="t-sub mt1">식품·간편식 · 목표 300명 · 2026년 8월 5일 ~ 8월 12일</div>
          <div class="mt2"><span class="price-old">${won(d.was)}</span> <span class="price">${won(d.now)}</span> <span class="t-sub">(250명 단계)</span></div></div>
      </div>`, { cls: 'mt6', aside: btn('미리보기', { cls: 'btn-ghost btn-sm', href: 'HS0205' }) })}

      <div class="btns mt6">
        ${btn('승인된 화면 보기', { cls: 'btn-ghost btn-lg', href: 'HS0302' })}
        ${btn('반려된 화면 보기', { cls: 'btn-ghost btn-lg', href: 'HS0303' })}
        ${btn('진행자 대시보드', { cls: 'btn-ghost btn-lg', href: 'HM-01' })}
      </div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '검수 중 · 예상 완료 8월 6일' } };
  }

  /* 반려됨 */
  const body = hostPage('HS-02', `
    ${pageHd('개설 검수', '제주 한라봉 5kg 산지직송 (특대과)')}

    ${card('', `${hsteps(['제출 완료', '검수 중', '승인·오픈'], 1)}
      <div class="row-b mt6 wrap-row">
        <div><div class="t-sub">제출 일시</div><b>2026년 8월 4일 15:12</b></div>
        <div><div class="t-sub">반려 일시</div><b>2026년 8월 5일 11:04</b></div>
        <div><div class="t-sub">검수 번호</div><b>RV-20260804-0177</b></div>
      </div>`)}

    ${banner('danger', '📮', `<b>반려됐어요. 아래 두 가지를 고쳐서 다시 올려 주세요.</b>
      <p class="t-sub mt1">고치시면 바로 다시 검수에 들어갑니다. 보통 하루 안에 끝납니다.</p>`,
    { cls: 'mt6', right: btn('고치러 가기', { cls: 'btn-primary btn-sm', href: 'HS-02' }) })}

    ${card('반려 사유', `${[
    ['상품 사진', '두 번째 사진에 다른 쇼핑몰의 로고가 보입니다. 직접 찍으신 사진이나 공급처에서 받은 사진으로 바꿔 주세요.'],
    ['배송 일정', '“성사 후 3일 이내”로 적으셨는데, 신선식품은 공급처 발주에 보통 2~3일이 걸립니다. 여유 있게 5일로 잡으시길 권합니다.'],
  ].map(([k, v], i) => `<div class="row mt3" style="gap:12px;align-items:flex-start">
      <span class="badge b-danger nowrap">${i + 1}</span>
      <div><b>${k}</b><p class="t-sub mt1">${v}</p></div></div>`).join('')}
    <div class="hr"></div>
    <p class="t-sub">검수 담당 · 모아공구 운영팀 · 2026년 8월 5일 11:04</p>`, { cls: 'mt6' })}

    ${card('제출하신 내용', `<div class="row wrap-row" style="gap:16px">
      ${phFix(['상품 사진', 1000, 1000], 120, { seed: d.id })}
      <div class="grow"><b>${esc(d.nm)}</b>
        <div class="t-sub mt1">식품·간편식 · 목표 300명 · 2026년 8월 5일 ~ 8월 12일</div>
        <div class="mt2"><span class="price-old">${won(d.was)}</span> <span class="price">${won(d.now)}</span> <span class="t-sub">(250명 단계)</span></div></div>
    </div>
    <div class="hr"></div>
    ${kv([
    ['가격 단계', '50명 32,000원 · 150명 28,000원 · 250명 24,900원 · 400명 21,900원'],
    ['옵션', '5kg · 10kg · 5kg+감귤 세트(품절)'],
    ['배송', '무료 · 성사 후 3일 이내 발송 · 제주 3,000원 추가'],
    ['1인 최대', '3개 · 전체 한도 600개'],
  ])}`, { cls: 'mt6', aside: btn('참여자 화면으로 보기', { cls: 'btn-ghost btn-sm', href: 'DE-01' }) })}

    ${card('검수에서 자주 걸리는 것', `<ul style="padding-left:18px;line-height:1.9" class="t-sub">
      <li>다른 쇼핑몰 사진이나 로고가 들어간 경우</li>
      <li>원산지·중량 같은 필수 정보가 빠진 경우</li>
      <li>배송 일정이 현실적으로 지키기 어려운 경우</li>
      <li>가격 단계가 정가보다 비싸거나 순서가 뒤집힌 경우</li>
      <li>식품인데 유통기한·보관법이 없는 경우</li>
    </ul>`, { cls: 'mt6' })}

    <div class="btns mt6">
      ${btn('고쳐서 다시 제출', { cls: 'btn-primary btn-lg', href: 'HS-02' })}
      ${btn('개설 취소', { cls: 'btn-ghost btn-lg', attr: ' data-toast="개설을 취소했어요. 작성하신 내용은 임시 저장에 남아 있습니다"' })}
      ${btn('진행자 대시보드', { cls: 'btn-ghost btn-lg', href: 'HM-01' })}
    </div>`);
  return { body, o: { wrapCls: 'wrap wrap-full', state: '반려 · 보완 요청 2건' } };
}

export const PAGES = {
  'HS-01': hs01,
  HS0102: (c) => hs01(c, 'fee'),
  HS0103: (c) => hs01(c, 'faq'),
  'HS-02': hs02,
  HS0202: (c) => hs02(c, 'tier'),
  HS0203: (c) => hs02(c, 'err'),
  HS0204: (c) => hs02(c, 'draft'),
  HS0205: (c) => hs02(c, 'preview'),
  'HS-03': hs03,
  HS0302: (c) => hs03(c, 'ok'),
  HS0303: (c) => hs03(c, 'no'),
};
