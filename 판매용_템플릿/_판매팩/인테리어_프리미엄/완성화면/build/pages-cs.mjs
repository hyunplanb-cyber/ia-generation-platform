/* CS 시공사례 — 부모 화면 4장 */
import * as U from './ui.mjs';
import { CASES, MATERIALS, FLAGSHIP } from './data.mjs';

/* ---------------- CS0101 시공사례 목록 ---------------- */
function CS0101() {
  const body = `
${U.pageHd('시공사례', `지금까지 412개 현장 · 조건에 맞는 사례 ${CASES.length}개`)}

<div class="split-l">
  <aside>
    ${U.card('필터', `
      <p class="t-th mb2">시공 분야</p>
      ${U.chips(['아파트 전체', '주방', '욕실', '상업공간', '부분 시공', '베란다'], -1, {})}
      <p class="t-th mt6 mb2">스타일</p>
      ${U.chips(['모던', '내추럴', '클래식', '인더스트리얼'], -1, {})}
      <p class="t-th mt6 mb2">지역</p>
      ${U.chips(['성동구', '용산구', '마포구', '광진구', '강동구'], -1, {})}`)}
  </aside>
  <div>
    <div class="row-b mb4"><span class="t-sub">조건에 맞는 사례 ${CASES.length}개</span>
      ${/* ⚠ 정렬 고르개가 죽어 있었다(2026-08-18). 스펙팩 acts 는 「목록 차례가
            최신순·금액낮은순·평수순으로 바뀐다」고 약속해 두었다. 카드마다 견줄 값을
            실어 두면 app.js 가 그 자리에서 다시 줄 세운다. */''}
      <select class="input" style="width:160px" data-sort-cards="cases">
        <option value="new">최신순</option><option value="price">금액 낮은순</option><option value="area">평수순</option></select></div>
    <div class="g3" data-sort-list="cases">${CASES.map((c, i) => `<a class="ccard" href="${U.link('CS0201')}" data-new="${i}" data-price="${parseInt(String(c.priceLabel).replace(/[^0-9]/g, ''), 10)}" data-area="${c.area}">
      ${U.ph('비포·애프터', 'ph-43', c.id)}
      <div class="nm">${U.esc(c.title)}</div>
      <div class="meta">${c.area}평 · ${U.esc(c.region)} · ${c.days}일</div>
      <div class="badges">${U.badge(c.style, 'b-line')}${U.badge(c.field, 'b-pri')}</div>
      <div class="price"><span class="now">${c.priceLabel}</span></div></a>`).join('')}</div>
    <div class="center mt6">${U.btn('더 보기 (사례 4개 더)', { cls: 'btn-ghost btn-lg' })}</div>
  </div>
</div>`;
  return { body, o: {} };
}

/* ---------------- CS0201 시공사례 상세 ---------------- */
function CS0201() {
  const c = CASES[0];
  const materialRows = MATERIALS.slice(0, 4).map((m) => [m.part, m.name, m.brand, m.grade]);
  const body = `
${U.ph('대표 사진 · 비포애프터', 'ph-banner', c.id + 'hero')}
${U.pageHd(`${c.area}평 아파트 전체 시공`, `${U.esc(c.region)} · ${c.days}일 · ${c.priceLabel}`)}

${U.sec('현장 소개', `<p class="t-body">신혼부부가 입주 전 리모델링한 32평 아파트입니다. 전 공간을 모던한 톤으로 통일해 달라는 요청과, 주방을 넓혀 아일랜드 식탁을 두고 싶다는 요청이 있었습니다.</p>`)}

${U.sec('공간별 사진', U.tabBox(
    U.tabs([{ label: '거실', pane: 'living' }, { label: '주방', pane: 'kitchen' }, { label: '욕실', pane: 'bath' }, { label: '침실', pane: 'room' }, { label: '현관', pane: 'entry' }], 0),
    ['living', 'kitchen', 'bath', 'room', 'entry'].map((k, i) => U.pane(k,
      `${U.ph('비포·애프터', 'ph-169', c.id + k)}<div class="g4 mt4">${Array.from({ length: 4 }, (_, j) => U.ph('공간 사진', 'ph-11', c.id + k + j)).join('')}</div>`,
      i === 0)).join(''),
  ))}

${U.sec('이 현장에 쓴 자재', U.table(['부위', '제품명', '브랜드', '등급'], materialRows))}

${U.sec('실제 공정표', U.table(['공정', '걸린 날수'], [
    ['철거', '2일'], ['설비', '3일'], ['목공', '6일'], ['타일', '3일'], ['도배', '2일'], ['마루', '2일'], ['조명·마무리', '2일'], ['합계', `${c.days}일`],
  ]))}

${U.sec('총 공사비', `<div class="row-b"><span class="t-page" style="font-size:26px">${c.priceLabel}</span>
  <span class="t-sub">공정별 비중은 「비용 안내」에서 볼 수 있어요</span></div>`)}

${U.sec('집주인 후기', `<div class="review">${U.stars(5)} <p class="txt mt2">"공정표대로 하루도 안 밀리고 끝났어요. 사진 일지 덕분에 매일 확인할 수 있어 안심됐습니다." — 박서준님</p></div>`)}

${U.sec('시공 중에 이런 일이 있었어요', U.banner('warn', '⚠️', '<b>철거 중 배관 노후가 발견돼 배관을 함께 교체했습니다.</b><div class="t-sub mt1">추가 비용 170만원 — 진행 전 손님 승인을 받았습니다.</div>'))}

${U.sec('비슷한 사례', `<div class="g3">${CASES.slice(1, 4).map((cc) => `<a class="ccard" href="${U.link('CS0201')}">
  ${U.ph('비슷한 사례', 'ph-43', cc.id)}<div class="nm">${U.esc(cc.title)}</div><div class="meta">${cc.area}평 · ${cc.days}일</div></a>`).join('')}</div>`)}

${U.sec('', U.banner('pri', '📐', '이 사례처럼 견적을 내 보시겠어요?', { right: U.btn('이 사례처럼 견적 내기', { href: 'ES0101', cls: 'btn-primary' }) }))}`;
  return { body, o: {} };
}

/* ---------------- CS0301 시공사례 - 결과 없음 ---------------- */
function CS0301() {
  const body = U.empty('🔍', '이 조건에 맞는 사례가 아직 없어요',
    '「40평대 이상 · 500만원 이하」 조건에서는 찾는 사례가 없어요. 예산 구간을 좁게 잡으신 것 같아요.',
    `${U.btn('전체 조건 지우고 보기', { href: 'CS0101', cls: 'btn-primary' })}${U.btn('상담 예약', { href: 'VS0101', cls: 'btn-ghost' })}`)
    + U.sec('조건을 살짝 넓혀 보면', `<div class="g3">${[
      ['예산 구간 한 칸 넓히기', '사례 8개'], ['평수 구간 넓히기', '사례 5개'], ['지역 전체로 보기', '사례 22개'],
    ].map(([t, n]) => `<div class="box center"><b>${t}</b><div class="t-sub mt1">${n}</div></div>`).join('')}</div>`)
    + U.sec('인기 사례', `<div class="g3">${CASES.slice(0, 3).map((c) => `<a class="ccard" href="${U.link('CS0201')}">
      ${U.ph('인기 사례', 'ph-43', c.id + 'pop')}<div class="nm">${U.esc(c.title)}</div><div class="meta">${c.area}평 · ${c.days}일</div></a>`).join('')}</div>`);
  return { body, o: {} };
}

/* ---------------- CS0401 자재·마감 둘러보기 ---------------- */
function CS0401() {
  const rows = MATERIALS.map((m) => `<div class="box"><div class="row-b">
    ${U.ph(m.part, 'ph-thumb', m.id)}
    <div class="grow" style="margin-left:12px"><b>${U.esc(m.name)}</b><div class="t-sub">${U.esc(m.brand)}</div>
    ${U.badge(m.grade, m.grade === '프리미엄' ? 'b-acc' : m.grade === '고급' ? 'b-pri' : 'b-mut')}</div>
    <div class="right"><div class="t-sub">${m.add > 0 ? '추가금' : m.add < 0 ? '절감' : ''}</div><b>${m.add === 0 ? '기본 포함' : (m.add > 0 ? '+' : '') + U.won(m.add)}</b></div>
  </div></div>`).join('');
  const body = `
${U.pageHd('자재·마감 둘러보기', '시공에 쓰는 자재를 부위별로 살펴보고 고를 수 있어요')}

${U.ph('미리보기 · 방 사진', 'ph-banner', 'material-preview')}

${U.sec('부위', U.tabBox(
    U.tabs([{ label: '바닥', pane: 'floor' }, { label: '벽', pane: 'wall' }, { label: '주방', pane: 'kitchen' }, { label: '욕실', pane: 'bath' }, { label: '창호', pane: 'window' }], 0),
    U.pane('floor', `<div class="g2">${rows}</div>`, true) + U.pane('wall', `<div class="g2">${rows}</div>`, false) +
    U.pane('kitchen', `<div class="g2">${rows}</div>`, false) + U.pane('bath', `<div class="g2">${rows}</div>`, false) + U.pane('window', `<div class="g2">${rows}</div>`, false),
  ))}

${U.sec('내가 고른 자재', U.card('', `
  ${U.kv(MATERIALS.slice(0, 3).map((m) => [m.part, U.esc(m.name)]))}
  <div class="sum-row total mt3"><span>기본 견적 대비</span><span class="v">+142만원</span></div>
  <div class="btns mt4">${U.btn('고른 자재로 견적 내기', { href: 'ES0101', cls: 'btn-primary btn-block' })}</div>`))}`;
  return { body, o: {} };
}

export const PAGES = { CS0101, CS0201, CS0301, CS0401 };
