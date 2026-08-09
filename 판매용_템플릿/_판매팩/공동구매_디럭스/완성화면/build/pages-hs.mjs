/* HS 공구 개설(진행자) 3장 — 시작 안내 · 개설 폼 · 검수 대기·반려 */
import {
  ph, phAva, phFix, btn, badge, stBadge, chips, tabs, sec, card, banner, table, kv,
  gauge, countdown, tierTable, accordion, hsteps, sumRows,
  pageHd, detail2, hostPage, num, won, esc, link,
} from './ui.mjs';
import { CATS, DEALS, dealById, pctOf, FAQ } from './data.mjs';

/* ── HS-01 진행자 시작 안내 ───────────────────────────── */
function hs01() {
  const body = `
  <div class="box box-pri center">
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
      <div class="box box-mut mt3"><p class="t-sub">불발되면 참여자에게 전액 환불되고, 수수료도 발생하지 않습니다.</p></div>`)}
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
  ], 0), { cls: 'mt8' })}

  <div class="box box-pri center mt8">
    <h2 class="t-sec">첫 공구는 수수료가 없습니다</h2>
    <p class="t-sub mt2">개설은 10분이면 끝나고, 검수는 영업일 기준 1~2일 걸립니다.</p>
    <div class="btns mt4 center">${btn('공구 개설하기', { cls: 'btn-primary btn-lg', href: 'HS-02' })}</div>
  </div>`;
  return { body, o: {} };
}

/* ── HS-02 공구 개설 폼 ─────────────────────────────── */
function hs02() {
  const main = `
    ${card('상품', `<div class="form">
      <div class="field"><label class="label">상품명 <span class="danger">*</span></label>
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
      <div class="field"><label class="label">정가 <span class="danger">*</span></label>
        <input class="input" value="39,000" style="max-width:200px"><p class="hint">비교용으로 보이는 값입니다</p></div>
      <div class="hr"></div>
      ${[[50, '32,000'], [150, '28,000'], [250, '24,900'], [400, '21,900']].map(([n, p], i) => `
        <div class="row wrap-row mt3" style="gap:10px;align-items:center">
          <span class="muted">⠿</span>
          <input class="input" value="${n}" style="width:100px"><span class="t-sub">명부터</span>
          <input class="input" value="${p}" style="width:130px"><span class="t-sub">원</span>
          <span class="t-sub grow">정가 대비 ${Math.round((1 - parseInt(String(p).replace(/,/g, ''), 10) / 39000) * 100)}%</span>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="이 단계를 지웠어요"${i === 0 ? ' disabled' : ''}>삭제</button>
        </div>`).join('')}
      <button class="btn btn-soft btn-block btn-sm mt4" type="button" data-toast="가격 단계를 추가했어요">＋ 단계 추가</button>`,
    { cls: 'mt6' })}

    ${card('목표와 기간', `<div class="field-row">
      <div class="field grow"><label class="label">목표 인원 <span class="danger">*</span></label>
        <input class="input" value="300"><p class="hint">이 인원을 못 채우면 불발됩니다</p></div>
      <div class="field grow"><label class="label">최소 성사 인원</label>
        <input class="input" value="250"><p class="hint">비워 두면 목표 인원과 같습니다</p></div>
    </div>
    <div class="field-row">
      <div class="field grow"><label class="label">모집 시작 <span class="danger">*</span></label>
        <div class="row" style="gap:8px"><input class="input" type="date" value="2026-08-05"><input class="input" type="time" value="10:00"></div></div>
      <div class="field grow"><label class="label">모집 마감 <span class="danger">*</span></label>
        <div class="row" style="gap:8px"><input class="input" type="date" value="2026-08-12"><input class="input" type="time" value="23:59"></div></div>
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

    ${card('환불 정책 확인', `<div class="box box-pri">
      <b>이 플랫폼의 모든 공구는 조건부 결제입니다</b>
      <p class="t-sub mt1">목표 인원에 못 미치면 참여자에게 자동으로 전액 환불되고, 진행자에게 수수료도 청구되지 않습니다.</p>
    </div>
    <label class="check mt3"><input type="checkbox" data-unlock="subBtn"><span><b>조건부 결제·자동 환불 정책을 확인했습니다</b> <span class="danger">(필수)</span></span></label>
    <label class="check"><input type="checkbox"><span><b>배송·품질에 대한 책임이 진행자에게 있음을 확인했습니다</b> <span class="danger">(필수)</span></span></label>`,
    { cls: 'mt6' })}`;

  const aside = card('예상 수익', `<div class="field"><label class="label">공급가 (원가)</label>
      <input class="input" value="18,000"></div>
    <div class="field"><label class="label">건당 배송비</label><input class="input" value="2,500"></div>
    <div class="hr"></div>
    ${sumRows([
    ['목표 달성 시 매출', '7,470,000원'],
    ['공급가', '−5,400,000원'],
    ['배송비', '−750,000원'],
    ['수수료 5%', '−373,500원'],
  ], ['예상 수익', '946,500원'])}
    <div class="box box-ok mt3"><b>첫 공구는 수수료 0%</b>
      <p class="t-sub mt1">수수료를 빼면 <b>1,320,000원</b>이 됩니다.</p></div>
    <div class="hr"></div>
    <div class="btns">
      <button class="btn btn-primary btn-lg btn-block is-off" id="subBtn" type="button" disabled data-toast="검수를 요청했어요">검수 요청하기</button>
    </div>
    ${btn('임시 저장', { cls: 'btn-ghost btn-block', attr: ' data-toast="임시 저장했어요. 나중에 이어서 쓰실 수 있어요" data-toast-kind="ok"' })}
    ${btn('참여자 화면 미리보기', { cls: 'btn-ghost btn-block', href: 'DE-01' })}
    <div class="hr"></div>
    ${btn('검수 결과 화면 보기', { cls: 'btn-ghost btn-block btn-sm', href: 'HS-03' })}`);

  const body = hostPage('HS-02', `${pageHd('공구 개설', '검수는 영업일 기준 1~2일 걸립니다')}<div class="mt6">${detail2(main, aside)}</div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── HS-03 개설 검수 대기·반려 ──────────────────────── */
function hs03() {
  const d = dealById('d1');
  const body = hostPage('HS-02', `
    ${pageHd('개설 검수', '제주 한라봉 5kg 산지직송 (특대과)')}

    ${card('', `${hsteps(['제출 완료', '검수 중', '승인·오픈'], 1)}
      <div class="row-b mt6 wrap-row">
        <div><div class="t-sub">제출 일시</div><b>2026년 8월 4일 15:12</b></div>
        <div><div class="t-sub">예상 완료</div><b>2026년 8월 6일쯤</b></div>
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

export const PAGES = { 'HS-01': hs01, 'HS-02': hs02, 'HS-03': hs03 };
