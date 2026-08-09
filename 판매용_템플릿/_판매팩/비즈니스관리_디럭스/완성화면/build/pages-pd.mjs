/* PD 상품·재고 (4) */
import * as U from './ui.mjs';
import { PRODUCTS } from './data.mjs';

export const PAGES = {};

const 카테고리 = [...new Set(PRODUCTS.map((p) => p.cat))];
const 재고있음 = PRODUCTS.filter((p) => p.stock !== null);
const 부족 = 재고있음.filter((p) => p.stock <= 5);

PAGES['PD-01'] = () => ({
  body: `${U.pageHd('상품 목록', `전체 ${PRODUCTS.length}개 · 판매중 ${PRODUCTS.filter((p) => p.st === '판매중').length}개 · 손볼 것 ${부족.length}개`,
    `${U.btn('카테고리 관리', { attr: ' data-modal="m-cat"' })}${U.btn('재고 관리', { href: 'PD-03' })}${U.btn('상품 등록', { cls: 'btn-pri', href: 'PD-02' })}`)}

${U.banner('warn', '⚠', `재고가 모자란 상품이 <b>${부족.length}개</b> 있어요. 품절되기 전에 채워 주세요.`, {
  right: U.btn('재고 부족 보기', { sm: true, href: 'PD-04' }),
})}

<div class="filters mt6">
  ${U.select(['카테고리 전체', ...카테고리], 0)}
  ${U.select(['판매 상태 전체', '판매중', '품절', '숨김'], 0)}
  <input class="in search" type="search" placeholder="상품명으로 검색">
  ${U.btn('검색', { attr: ' data-toast="검색했어요"' })}
  <span class="grow"></span>
  ${U.btn('순서 변경', { sm: true, attr: ' data-toast="드래그해서 순서를 바꾸세요"' })}
  ${U.btn('일괄 상태 변경', { sm: true, attr: ' data-modal="m-bulk"' })}
</div>

${U.table(
  [{ t: '<input type="checkbox" aria-label="전체 선택">', w: '34px', cls: 'c' },
   { t: '사진', w: '48px' }, '상품명', { t: '카테고리', w: '80px' },
   { t: '판매가', w: '92px', cls: 'r nowrap' }, { t: '재고', w: '68px', cls: 'r' },
   { t: '판매량', w: '68px', cls: 'r' }, { t: '판매 상태', w: '112px' }],
  PRODUCTS.map((p) => ({
    href: 'PD-02',
    cls: p.stock !== null && p.stock <= 5 ? 'warn' : '',
    cells: [
      { t: `<input type="checkbox" aria-label="${p.nm} 선택">`, cls: 'c' },
      U.phThumb(p.id, 34), `<b>${p.nm}</b>`, p.cat,
      { t: `<span class="num">${U.won(p.price)}</span>`, cls: 'r nowrap' },
      { t: p.stock === null ? '<span class="muted">-</span>' : `<span class="num${p.stock <= 5 ? ' strong' : ''}">${p.stock}</span>${p.stock <= 5 ? ' ⚠' : ''}`, cls: 'r' },
      { t: `<span class="num">${U.num(p.sold)}</span>`, cls: 'r' },
      `<div class="row" style="gap:6px">${U.toggle(p.st === '판매중', `${p.nm} 판매 상태를 바꿨어요`)}${U.stBadge(p.st)}</div>`,
    ],
  })),
)}

<p class="t-sub mt6">재고 칸이 <b>-</b> 인 것은 시술처럼 «재고 개념이 없는» 상품입니다. 제품만 재고를 셉니다.</p>

${U.modal('m-cat', '카테고리 관리',
  `<div class="stack">${카테고리.map((c) => `<div class="row-b"><span>${c}</span><span class="t-sub">${PRODUCTS.filter((p) => p.cat === c).length}개</span></div>`).join('')}</div>
   <div class="mt6">${U.field('새 카테고리', U.input({ ph: '예) 두피케어' }))}</div>`,
  `${U.btn('닫기', { attr: ' data-dismiss' })}${U.btn('추가', { cls: 'btn-pri', attr: ' data-dismiss data-toast="카테고리를 추가했어요" data-toast-kind="ok"' })}`)}

${U.modal('m-bulk', '고른 상품의 판매 상태를 바꿉니다',
  `<p class="t-sub mb4">3개가 선택되어 있습니다.</p>${U.field('바꿀 상태', U.select(['판매중', '숨김', '품절'], 0))}`,
  `${U.btn('닫기', { attr: ' data-dismiss' })}${U.btn('바꾸기', { cls: 'btn-pri', attr: ' data-dismiss data-toast="3개의 상태를 바꿨어요" data-toast-kind="ok"' })}`)}`,
});

PAGES['PD-02'] = () => ({
  body: `${U.pageHd('상품 등록', '시술과 제품을 모두 여기서 등록합니다.')}

<div class="split-r">
  <div>
    ${U.card('기본', `
      <div class="f2">
        ${U.field('상품명', U.input({ ph: '예) 디자인 커트' }), { req: true })}
        ${U.field('카테고리', U.select([...카테고리, '+ 새 카테고리'], 0), { req: true })}
      </div>`)}

    ${U.card('사진', `
      <div class="g4">
        ${U.ph(['대표 이미지', 800, 800], { seed: 'main' })}
        ${U.ph(['추가 이미지 1', 800, 800], { seed: 'a1' })}
        ${U.ph(['추가 이미지 2', 800, 800], { seed: 'a2' })}
        <div class="ph" style="aspect-ratio:1/1"><span class="lb">+ 사진 올리기<br><span class="sz">JPG·PNG · 5MB 이하</span></span></div>
      </div>
      <p class="t-sub mt4">첫 장이 <b>대표 이미지</b>입니다. 목록과 예약 화면에 이 사진이 나옵니다.</p>`, { cls: 'mt6' })}

    ${U.card('상세 설명', `
      <div class="row mb3" style="gap:4px">
        ${['B', 'I', 'U', '≡', '🔗', '🖼'].map((t) => U.btn(t, { sm: true, attr: ` data-toast="편집기 버튼 ${t}"` })).join('')}
      </div>
      ${U.textarea({ ph: '시술 과정, 소요시간, 주의사항 등을 적어 주세요.' })}`, { cls: 'mt6' })}

    ${U.card('가격', `
      <div class="f3">
        ${U.field('판매가', U.input({ ph: '38,000' }), { req: true })}
        ${U.field('원가', U.input({ ph: '9,000' }), { hint: '마진 계산에 씁니다. 손님에게 안 보입니다.' })}
        ${U.field('할인가', U.input({ ph: '비워 두면 할인 없음' }))}
      </div>`, { cls: 'mt6' })}

    ${U.card('옵션', `
      ${U.table(['옵션명', '조합', { t: '추가 금액', w: '104px' }, { t: '재고', w: '80px' }, { t: '', w: '48px' }], [
        ['길이', '단발', '<input class="in" type="text" value="0" aria-label="단발 추가 금액">', '<input class="in" type="text" value="-" aria-label="단발 재고">', U.btn('삭제', { sm: true, cls: 'btn-dan' })],
        ['길이', '중단발', '<input class="in" type="text" value="20,000" aria-label="중단발 추가 금액">', '<input class="in" type="text" value="-" aria-label="중단발 재고">', U.btn('삭제', { sm: true, cls: 'btn-dan' })],
        ['길이', '롱', '<input class="in" type="text" value="40,000" aria-label="롱 추가 금액">', '<input class="in" type="text" value="-" aria-label="롱 재고">', U.btn('삭제', { sm: true, cls: 'btn-dan' })],
      ])}
      <div class="btns mt4">${U.btn('+ 옵션 줄 추가', { sm: true, attr: ' data-toast="옵션 줄을 추가했어요"' })}</div>`, { cls: 'mt6' })}

    ${U.card('재고', `
      <div class="f2">
        ${U.field('재고 수량', U.input({ ph: '시술이면 비워 두세요' }), { hint: '비워 두면 재고를 세지 않습니다.' })}
        ${U.field('부족 알림 기준', U.input({ v: '5' }), { hint: '이 수 이하로 떨어지면 알림이 옵니다.' })}
      </div>`, { cls: 'mt6' })}
  </div>

  <div class="sticky stack">
    ${U.card('판매 설정', `
      ${U.field('판매 상태', U.select(['판매중', '숨김'], 0))}
      ${U.field('노출 채널', `<div class="stack">
        ${U.check('매장 결제', { on: true, none: true })}
        ${U.check('온라인 예약', { on: true, none: true })}
        ${U.check('상품 주문', { none: true })}
      </div>`)}`, {
        ft: `<div class="btns-v">
          ${U.btn('등록', { cls: 'btn-pri', w: true, attr: ' data-toast="상품을 등록했어요" data-toast-kind="ok"' })}
          ${U.btn('임시 저장', { w: true, attr: ' data-toast="임시 저장했어요"' })}
          ${U.btn('목록으로', { href: 'PD-01', w: true })}
        </div>`,
      })}
    ${U.card('미리보기', `${U.ph(['대표 이미지', 800, 800], { seed: 'pv' })}
      <div class="mt3"><b>디자인 커트</b><div class="t-sub">커트 · 38,000원</div></div>`)}
  </div>
</div>`,
});

PAGES['PD-03'] = () => ({
  body: `${U.pageHd('재고 관리', `재고를 세는 상품 ${재고있음.length}개 · 손볼 것 ${부족.length}개`,
    `${U.btn('재고 내보내기', { attr: ' data-toast="재고 현황을 내려받았어요" data-toast-kind="ok"' })}${U.btn('일괄 입고', { cls: 'btn-pri', attr: ' data-modal="m-in"' })}`)}

<div class="filters">
  ${U.select(['전체', '재고 부족', '품절'], 0)}
  <input class="in search" type="search" placeholder="상품명으로 검색">
  ${U.btn('부족·품절만 보기', { href: 'PD-04' })}
</div>

${U.card('재고 현황', U.table(
  ['상품', { t: '옵션', w: '92px' }, { t: '현재고', w: '72px', cls: 'r' }, { t: '안전재고', w: '76px', cls: 'r' },
   { t: '상태', w: '80px' }, { t: '입·출고', w: '176px' }, { t: '', w: '76px' }],
  재고있음.map((p) => [
    `<b>${p.nm}</b>`, '<span class="muted">기본</span>',
    { t: `<span class="num strong">${p.stock}</span>`, cls: 'r' },
    { t: '<span class="num">5</span>', cls: 'r' },
    U.stBadge(p.stock === 0 ? '품절' : (p.stock <= 5 ? '재고부족' : '판매중')),
    `<div class="row" style="gap:4px">${U.btn('입고', { sm: true, attr: ` data-toast="${p.nm} 입고를 기록했어요" data-toast-kind="ok"` })}${U.btn('출고', { sm: true, attr: ` data-toast="${p.nm} 출고를 기록했어요"` })}${U.btn('조정', { sm: true, attr: ' data-modal="m-adj"' })}</div>`,
    U.btn('상품 수정', { sm: true, href: 'PD-02' }),
  ]),
))}

${U.card('재고 변동 이력', U.table(
  [{ t: '일시', w: '128px' }, '상품', { t: '구분', w: '72px' }, { t: '수량', w: '68px', cls: 'r' }, { t: '이후', w: '60px', cls: 'r' }, '사유', { t: '처리자', w: '72px' }],
  [
    ['<span class="num sub">2026-08-10 10:04</span>', '트리트먼트 (LPP)', U.badge('출고', 'b-mut'), { t: '<span class="num">-4</span>', cls: 'r' }, { t: '<span class="num">0</span>', cls: 'r' }, '시술 사용', '김도윤'],
    ['<span class="num sub">2026-08-09 17:20</span>', '헤어 에센스 100ml', U.badge('조정', 'b-warn'), { t: '<span class="num">-3</span>', cls: 'r' }, { t: '<span class="num">2</span>', cls: 'r' }, '실사 결과 반영 — 파손 3개', '박지우'],
    ['<span class="num sub">2026-08-08 09:00</span>', '홈케어 샴푸 300ml', U.badge('입고', 'b-ok'), { t: '<span class="num">+20</span>', cls: 'r' }, { t: '<span class="num">22</span>', cls: 'r' }, '정기 발주 도착', '박지우'],
  ],
), { cls: 'mt6', aside: '<span class="t-sub">최근 3건</span>' })}

${U.banner('info', '💡', '조정은 <b>사유를 반드시 적습니다.</b> 실사와 장부가 어긋난 까닭을 나중에 못 찾으면 재고는 계속 틀립니다.', { cls: 'mt6' })}

${U.modal('m-in', '여러 상품을 한 번에 입고합니다',
  `${U.table(['상품', { t: '현재고', w: '68px', cls: 'r' }, { t: '입고 수량', w: '104px' }],
    부족.map((p) => [p.nm, { t: `<span class="num">${p.stock}</span>`, cls: 'r' }, `<input class="in" type="text" value="20" aria-label="${p.nm} 입고 수량">`]))}
   <div class="mt4">${U.field('사유', U.input({ v: '정기 발주 도착' }))}</div>`,
  `${U.btn('닫기', { attr: ' data-dismiss' })}${U.btn('입고 기록', { cls: 'btn-pri', attr: ' data-dismiss data-toast="입고를 기록했어요" data-toast-kind="ok"' })}`)}

${U.modal('m-adj', '재고를 실사 결과로 맞춥니다',
  `${U.field('실제 수량', U.input({ ph: '세어 본 수' }), { req: true })}
   ${U.field('사유', U.select(['파손', '분실', '반품', '기록 누락', '기타'], 0), { req: true })}
   ${U.field('상세', U.textarea({ ph: '무슨 일이 있었는지 적어 두세요' }))}`,
  `${U.btn('닫기', { attr: ' data-dismiss' })}${U.btn('조정 기록', { cls: 'btn-pri', attr: ' data-dismiss data-toast="재고를 조정했어요" data-toast-kind="ok"' })}`)}`,
});

PAGES['PD-04'] = () => {
  const 속도 = { 'P-104': 1.2, 'P-105': 0.9, 'P-108': 0.6 };
  return {
    body: `${U.pageHd('재고 부족·품절', `${부족.length}개 상품이 곧 떨어집니다`,
      `${U.btn('담당자에게 알림', { attr: ' data-toast="담당자에게 알림을 보냈어요" data-toast-kind="ok"' })}${U.btn('한 번에 입고', { cls: 'btn-pri', href: 'PD-03' })}`)}

${U.banner('dan', '⚠', `<b>트리트먼트 (LPP)</b> 는 이미 품절입니다. 판매를 잠시 멈추지 않으면 손님이 예약할 수 있습니다.`)}

${U.card('', U.table(
  ['상품', { t: '현재고', w: '68px', cls: 'r' }, { t: '안전재고', w: '76px', cls: 'r' },
   { t: '하루 판매', w: '80px', cls: 'r' }, { t: '소진 예상', w: '92px' }, { t: '발주 추천', w: '80px', cls: 'r' },
   { t: '판매 중지', w: '80px', cls: 'c' }, { t: '', w: '76px' }],
  부족.map((p) => {
    const v = 속도[p.id] || 1;
    const 남은날 = p.stock === 0 ? 0 : Math.floor(p.stock / v);
    return [
      `<b>${p.nm}</b><div class="sub">${p.cat}</div>`,
      { t: `<span class="num strong">${p.stock}</span>`, cls: 'r' },
      { t: '<span class="num">5</span>', cls: 'r' },
      { t: `<span class="num">${v}개</span>`, cls: 'r' },
      p.stock === 0 ? U.badge('이미 품절', 'b-dan') : `<span class="num">${남은날}일 뒤</span>`,
      { t: `<span class="num strong">${Math.max(20, Math.ceil(v * 30))}개</span>`, cls: 'r' },
      { t: U.toggle(p.stock === 0, `${p.nm} 판매를 멈췄어요`), cls: 'c' },
      U.btn('바로 입고', { sm: true, cls: 'btn-pri', attr: ` data-toast="${p.nm} 입고 화면을 엽니다"` }),
    ];
  }),
))}

<p class="t-sub mt4">발주 추천 수량은 <b>최근 30일 판매 속도 × 30일</b> 로 잡은 값입니다. 최소 20개부터 권합니다.</p>

<div class="g2 mt8">
  ${U.card('알림 기준 바꾸기', `<p class="t-sub mb4">지금은 <b>재고 5개 이하</b>일 때 알립니다. 상품마다 따로 정할 수도 있어요.</p>
    ${U.field('공통 기준', U.input({ v: '5' }))}
    <div class="btns">${U.btn('저장', { cls: 'btn-pri', attr: ' data-toast="알림 기준을 바꿨어요" data-toast-kind="ok"' })}${U.btn('알림 설정으로', { href: 'SE-03' })}</div>`)}
  ${U.card('다음에 할 일', `<div class="btns-v">
    ${U.btn('재고 관리로 돌아가기', { href: 'PD-03', w: true })}
    ${U.btn('새 상품 등록', { href: 'PD-02', w: true })}
  </div>`)}
</div>`,
  };
};
