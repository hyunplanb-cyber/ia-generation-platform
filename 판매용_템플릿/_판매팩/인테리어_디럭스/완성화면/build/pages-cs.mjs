/* CS 시공사례 (4) */
import * as U from './ui.mjs';
import { CASES, caseOf, FIELDS } from './data.mjs';

export const PAGES = {};

PAGES['CS-01'] = () => ({
  body: `${U.pageHd('시공사례', '지금까지 148개 현장')}

${U.listPage(U.card('조건 좁히기', `
  ${U.field('평수 구간', `<div class="stack">${['10평대', '20평대', '30평대', '40평대 이상'].map((p, i) => U.check(p, { on: i === 2, none: true })).join('')}</div>`)}
  ${U.field('시공 분야', `<div class="stack">${FIELDS.map((f) => U.check(f.nm, { none: true })).join('')}</div>`)}
  ${U.field('예산 구간', `<div class="row"><input class="in" type="text" value="1,000만원"><span>~</span><input class="in" type="text" value="6,000만원"></div>`)}
  ${U.field('스타일', `<div class="stack">${['모던', '내추럴', '클래식', '인더스트리얼'].map((s) => U.check(s, { none: true })).join('')}</div>`)}
  ${U.field('지역', U.select(['전체', '서울', '경기', '인천']))}
  <div class="btns-v mt6">
    ${U.btn('이 조건으로 찾기', { cls: 'btn-pri', w: true, attr: ' data-toast="조건을 적용했어요"' })}
    ${U.btn('조건 지우기', { w: true, href: 'CS-01' })}
  </div>`), `
  <div class="row-b mb6 wrap-row">
    ${U.chips(['전체', '30평대'], 1)}
    ${/* ⚠ 정렬 고르개가 죽어 있었다(2026-08-18, 프리미엄 CS0101 과 같은 자리).
          스펙팩 acts: 「목록 차례가 최신순·금액낮은순·평수순으로 바뀐다」 */''}
    <select class="sel" data-sort-cards="cases">
      <option value="new">최신순</option><option value="price">금액 낮은순</option><option value="area">평수순</option></select>
  </div>
  <div class="row-b mb6"><span class="t-sub">조건에 맞는 사례 ${CASES.length}개</span></div>

  <div class="cards" data-sort-list="cases">${CASES.map((c, i) => U.caseCard(c).replace('<a class="item"',
    `<a class="item" data-new="${i}" data-price="${c.priceMin}" data-area="${c.pyeong}"`)).join('')}</div>

  <div class="btns mt8" style="justify-content:center">
    ${/* ⚠ 「더 보기」가 알림만 띄우고 목록은 그대로였다. acts: 「아래에 사례 12개가
          이어 붙고 남은 수가 줄어든다」 — 실제로 이어 붙이고 남은 수를 줄인다. */''}
    ${U.btn('더 보기', { attr: ' data-more="cases" data-more-left="140"' })}
    ${U.btn('결과 없을 때 화면', { sm: true, href: 'CS-03' })}
  </div>`)}`,
});

PAGES['CS-02'] = (ctx) => {
  const c = CASES[0];
  const spaces = [
    { key: '거실', material: [['바닥', '강마루 (동화 골드클래스)', '내추럴 오크'], ['벽', '실크벽지', '아이보리']] },
    { key: '주방', material: [['상판', '엔지니어드스톤', '화이트 마블'], ['수전', 'LX하우시스', '블랙']] },
    { key: '욕실', material: [['타일', '포세린 600×600', '라이트 그레이'], ['도기', '대림바스', '화이트']] },
    { key: '침실', material: [['바닥', '강마루', '내추럴 오크'], ['벽', '실크벽지', '그레이지']] },
    { key: '현관', material: [['중문', '3연동 도어', '블랙 프레임']] },
  ];
  return {
    body: `${U.pageHd(c.nm, `${c.pyeong}평 · ${c.area} · 공사 ${c.days}일 · ${c.price}`)}

${U.compare(c.id, { idx: 0 })}

${U.sec('현장 소개', `<p>3인 가족이 사는 ${c.pyeong}평 아파트로, 오래된 몰딩과 좁은 주방 동선이 가장 큰 고민이었습니다.
전체적으로 밝고 넓어 보이는 ${c.style} 스타일을 원하셨고, 수납을 최대한 늘려 달라고 요청하셨습니다.</p>`)}

${U.tabBox(
      spaces.map((s, i) => ({ label: s.key, pane: s.key })),
      spaces.map((s, i) => U.pane(s.key, `
        ${U.compare(c.id, { idx: i + 1 })}
        <div class="g4 mt4">${Array.from({ length: 4 }).map((_, j) => U.ph(['공간 사진', 800, 600], { seed: s.key + j, cls: 'ph-card' })).join('')}</div>
        ${U.sec('이 공간에 쓴 자재', U.table(['부위', '제품명', '색상'], s.material), { cls: 'mt6' })}
      `, i === 0)).join(''),
      0,
    )}

${U.sec('실제 공정표', U.gantt([
      { code: 'demo', nm: '철거', from: 0, to: 1, st: 'done', team: '철거팀' },
      { code: 'mech', nm: '설비·배관', from: 2, to: 4, st: 'done', team: '설비팀' },
      { code: 'wood', nm: '목공', from: 5, to: 10, st: 'done', team: '목공팀' },
      { code: 'tile', nm: '타일', from: 11, to: 13, st: 'done', team: '타일팀' },
      { code: 'paper', nm: '도배', from: 14, to: 15, st: 'done', team: '도배팀' },
      { code: 'floor', nm: '마루', from: 16, to: 17, st: 'done', team: '마루팀' },
      { code: 'light', nm: '조명·마무리', from: 18, to: 19, st: 'done', team: '전기팀' },
    ], { totalDays: c.days, todayDay: c.days }), { cls: 'mt8' })}

${U.sec('총 공사비', `${U.box(`<div class="row-b"><span class="t-card">총 공사비</span><span class="t-page pri">${c.price}</span></div>`)}`, { cls: 'mt8' })}

${U.sec('집주인 후기', `${U.box(`${U.stars(5)} <p class="mt3">"공정표를 매일 확인할 수 있어서 안심됐고, 수납 동선이 정말 편해졌어요."</p><p class="t-sub mt3">${c.area} · ${c.pyeong}평</p>`)}`, { cls: 'mt8' })}

${U.sec('시공 중에 이런 일이 있었어요', U.banner('warn', '⚠', '철거 중 <b>배관 이음새 노후</b>가 발견돼 배관 교체 추가 견적을 안내드렸고, 집주인 승인 후 진행했습니다. <a class="more" href="' + U.link('PR-04') + '">추가공사 승인 화면 보기 ›</a>'), { cls: 'mt8' })}

${U.sec('비슷한 사례', `<div class="cards">${CASES.slice(1, 4).map((x) => U.caseCard(x)).join('')}</div>`, { cls: 'mt8' })}

${U.stickBar(`<span class="t-card">이 사례처럼 견적을 내 볼까요?</span>`, U.btn('이 사례처럼 견적 내기', { cls: 'btn-pri', href: 'ES-01' }))}`,
    o: { stick: '' },
  };
};

PAGES['CS-03'] = () => ({
  body: `${U.pageHd('시공사례', '조건에 맞는 사례가 없습니다')}

${U.empty('🔍', '이 조건에 맞는 사례가 아직 없어요',
    '예산 구간을 좁게 잡으신 것 같아요.',
    `${U.btn('조건 지우고 보기', { cls: 'btn-pri', href: 'CS-01' })}${U.btn('상담 예약', { href: 'VS-01' })}`)}

${U.box(`<div class="row-b wrap-row"><span>예산 구간 — 1,000만~2,000만원</span>${U.btn('X 지우기', { sm: true, attr: ' data-toast="조건을 지웠어요"' })}</div>`, { cls: 'mt8' })}

${U.sec('조건을 살짝 넓혀 보세요', `<div class="chips">
  ${U.chip('예산 한 칸 넓히기 (사례 8개)')}${U.chip('평수 구간 넓히기 (사례 5개)')}${U.chip('지역 전체로 보기 (사례 12개)')}
</div>`, { cls: 'mt8' })}

${U.sec('찾는 사례가 없어도 상담은 됩니다', `${U.box(`<div class="row-b wrap-row"><span>궁금한 점을 먼저 상담해 보세요.</span>${U.btn('상담 예약', { cls: 'btn-pri', href: 'VS-01' })}</div>`)}`, { cls: 'mt8' })}

${U.sec('인기 사례', `<div class="cards">${CASES.slice(0, 6).map((c) => U.caseCard(c)).join('')}</div>`, { cls: 'mt8' })}`,
});

PAGES['CS-04'] = () => {
  const parts = [
    { key: '바닥', items: [['강마루', '동화 골드클래스', 0], ['원목마루', '이건 프리미엄', 42_000], ['타일마루', '삼성쉐르빌', 18_000]] },
    { key: '벽', items: [['실크벽지', '개나리벽지', 0], ['합지벽지', '개나리벽지', -6_000], ['도장', '던에드워드', 24_000]] },
    { key: '주방', items: [['엔지니어드스톤', '한샘', 65_000], ['인조대리석', '한샘', 0], ['스테인리스', '한샘', 38_000]] },
    { key: '욕실', items: [['포세린타일', 'LX하우시스', 0], ['수입타일', '이태리 마감', 88_000]] },
    { key: '창호', items: [['시스템창호', 'LX하우시스', 0], ['3중유리', 'LX하우시스', 45_000]] },
  ];
  return {
    body: `${U.pageHd('자재·마감 둘러보기', '아래에서 자재를 고르면 위 미리보기 사진이 바뀝니다')}

<div class="box mb6" data-preview>${U.ph(['미리보기 방 사진', 1200, 700], { seed: 'material-preview' })}</div>

${U.tabBox(
      parts.map((p) => ({ label: p.key, pane: p.key })),
      parts.map((p, i) => U.pane(p.key, `
        <div class="g4">${p.items.map(([nm, brand, add]) => `<div class="box" data-part="${p.key}" data-nm="${nm}" data-add="${add}">
          ${U.ph(['자재 사진', 400, 400], { seed: nm })}
          <div class="t-card mt3">${nm}</div>
          <div class="t-sub">${brand}</div>
          <div class="row mt2">${['#EAD9C4', '#D8D2C4', '#B7ADA0', '#8C8478'].map((c) => `<span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${c};border:1px solid var(--border);margin-right:4px"></span>`).join('')}</div>
          <div class="row-b mt3">${U.badge(add === 0 ? '기본 포함' : add < 0 ? `${U.num(add)}원/평 할인` : `+${U.num(add)}원/평`, add <= 0 ? 'b-ok' : 'b-acc')}${U.btn('담기', { sm: true, attr: ' data-toast="담았어요"' })}</div>
        </div>`).join('')}</div>
      `, i === 0)).join(''),
      0,
    )}

${U.sec('등급 필터', `${U.chips(['기본 포함만 보기', '추가금 있는 것도 보기'], 1)}`, { cls: 'mt6' })}

${U.detail2(
      U.sec('선택 안내', '<p class="t-sub">카드를 눌러 색상·자재를 담으면 오른쪽 요약에 쌓입니다.</p>'),
      U.card('내가 고른 자재', `<div class="stack" data-cart-list>
        <div class="row-b"><span class="t-sub">바닥 — 강마루</span><span class="t-sub">+0원</span></div>
        <div class="row-b"><span class="t-sub">주방 — 엔지니어드스톤</span><span class="t-sub acc">+65,000원/평</span></div>
      </div>
      <div class="sum-row total mt4"><span>기본 견적 대비</span><span class="price acc" data-cart-total>+208만원</span></div>
      ${/* ⚠ 견적을 이미 내고 자재를 고르러 온 손님인데 «처음 단계»(ES-01)로 되돌려
            보내고 있었다 — 고른 자재가 통째로 버려진다(2026-08-18 사장님 지적).
            자재를 얹은 결과(ES-02)로 돌아가는 것이 이 화면에 오는 까닭에 맞다. */''}
      ${U.btn('고른 자재로 견적 다시 보기', { cls: 'btn-pri', w: true, href: 'ES-02' })}`),
    )}`,
  };
};
