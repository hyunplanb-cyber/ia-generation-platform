/* PR 공사 진행 (6) — 이 팩의 알맹이. 여러 날 여러 공정으로 갈라진 공사를 따라간다. */
import * as U from './ui.mjs';
import { PROCESS, 공사일수, 오늘공사일, 진행률, TODAY_SITE, PHOTO_LOG, EXTRA_ITEMS, 추가공사합계, CHECKLIST, CHECKLIST_ISSUES } from './data.mjs';

export const PAGES = {};

PAGES['PR-01'] = () => ({
  body: `${U.pageHd('공정표', `준공 예정 9월 30일`, `${U.btn('오늘로 가기', { sm: true, attr: ' data-toast="오늘 자리로 이동했어요"' })}`)}

<div class="box">
  <div class="row-b"><span class="t-card">${진행률}% · ${공사일수}일 중 ${오늘공사일}일 지남</span>${U.tabs([{ label: '주 보기' }, { label: '월 보기' }], 1, { pill: true })}</div>
  ${U.progress(진행률)}
</div>

${U.sec('', U.gantt(PROCESS, { totalDays: 공사일수, todayDay: 오늘공사일 }), { cls: 'mt6' })}

<p class="t-sub mt2">막대를 누르면 담당 팀과 진행 상황이 펼쳐집니다.</p>

${U.sec('이번 주에 있을 일', U.table(['날짜', '공정', '해야 할 일'], [
    ['9/22 (화)', '목공', '거실 아트월 목공틀'],
    ['9/23 (수)', '목공', '붙박이장 제작'],
    [{ t: '9/24 (목)', cls: 'strong dan' }, { t: '집주인 확인 필요', cls: 'strong dan' }, { t: '욕실 바닥 타일 색 최종 확인', cls: 'dan' }],
    ['9/25 (금)', '타일', '거실·주방 바닥 타일'],
  ]), { cls: 'mt8' })}

<div class="btns mt8">${U.btn('오늘 현장 보기', { cls: 'btn-pri', href: 'PR-02' })}${U.btn('사진 일지 보기', { href: 'PR-03' })}</div>`,
});

PAGES['PR-02'] = () => ({
  body: `${U.pageHd(`${TODAY_SITE.date} · 공사 ${TODAY_SITE.dayN}일째`, '', `${U.btn('‹ 어제', { sm: true, attr: ' data-toast="어제 일지를 불러왔어요"' })}${U.btn('내일 ›', { sm: true, attr: ' data-toast="내일은 아직 기록이 없어요"' })}`)}

${U.banner('dan', '⚠', `<b>${TODAY_SITE.needsDecision}</b>`, { right: U.btn('고르러 가기', { sm: true, cls: 'btn-pri', href: 'CS-04' }) })}

${U.box(`<div class="t-card">오늘 공정 — ${TODAY_SITE.process}</div><div class="t-sub mt2">현장에 온 팀: ${TODAY_SITE.team}</div>`, { cls: 'mt6' })}

${U.sec('오늘 찍은 사진', `<div class="g6">${Array.from({ length: 6 }).map((_, i) => `<div class="plog-shot" style="aspect-ratio:4/3">${U.ph(['오늘 사진', 800, 600], { seed: 'today' + i, cls: 'ph-card' })}<span class="tag">${['거실', '주방', '욕실'][i % 3]} · ${9 + i}:${(10 * i) % 60}</span></div>`).join('')}</div>`, { cls: 'mt6' })}

${U.sec('현장소장 한마디', `${U.box(`<div class="row" style="gap:var(--sp-card-pad)">${U.av('김')}<div class="grow"><div class="t-card">김현장 소장</div><p class="mt2">${TODAY_SITE.managerNote}</p></div></div>`)}`, { cls: 'mt6' })}

${U.sec('', `<div class="g2">
  ${U.card('오늘 끝난 일', `<div class="stack">${TODAY_SITE.doneToday.map((t) => `<div class="row" style="gap:6px">✓ <span>${t}</span></div>`).join('')}</div>`)}
  ${U.card('내일 할 일', `<div class="stack">${TODAY_SITE.tomorrow.map((t) => `<div class="row" style="gap:6px">○ <span>${t}</span></div>`).join('')}</div>`)}
</div>`, { cls: 'mt6' })}

${U.banner('warn', '🌧', TODAY_SITE.weather, { cls: 'mt6' })}

${U.stickBar('말풍선', `<div class="row grow" style="gap:var(--sp-btn)">${U.input({ ph: '소장에게 물어보세요' })}${U.btn('보내기', { cls: 'btn-pri', attr: ' data-toast="소장에게 보냈어요" data-toast-kind="ok"' })}</div>`)}`,
  o: { stick: '' },
});

PAGES['PR-03'] = () => ({
  body: `${U.pageHd('현장 사진 일지', `총 사진 ${PHOTO_LOG.reduce((n, d) => n + d.n, 0)}장`, `${U.btn('전체 내려받기', { sm: true, attr: ' data-toast="사진을 내려받았어요"' })}`)}

${U.sec('필터', `
  <div class="chips mb3">${U.chips(['철거', '설비', '목공', '타일', '도배', '마루'], -1)}</div>
  <div class="chips">${U.chips(['거실', '주방', '욕실', '침실', '베란다'], -1)}</div>`)}

${U.sec('이 자리가 변해 온 것', `<div class="row" style="gap:var(--sp-item);overflow-x:auto;padding-bottom:4px">
  ${['9/8 착공', '9/17 배관', '9/20 목공', '9/22 타일'].map((t) => `<div style="flex:none;width:180px">
    <div class="ph t2" style="aspect-ratio:4/3">${U.ph(['같은 각도 사진', 800, 600], { seed: t, cls: 'ph-card' })}</div>
    <div class="t-sub mt2" style="text-align:center">${t}</div></div>`).join('')}
</div>`, { cls: 'mt6' })}

${U.sec('날짜별 일지', U.plog(PHOTO_LOG), { cls: 'mt8' })}

<div class="mt8">${U.btn('준공 앨범으로 묶기', { cls: 'btn-pri', attr: ' data-toast="준공 앨범을 만들었어요" data-toast-kind="ok"' })}</div>`,
});

PAGES['PR-04'] = () => ({
  body: `${U.pageHd('추가공사 변경 견적 승인', '요청일 9월 24일 · 김현장 소장')}

${U.banner('warn', '⚠', '<b>추가 공사가 필요합니다</b>')}

${U.card('왜 생겼는지', `<div class="g2">
  ${U.ph(['누수 흔적 사진 1', 800, 600], { seed: 'leak1', cls: 'ph-card' })}
  ${U.ph(['누수 흔적 사진 2', 800, 600], { seed: 'leak2', cls: 'ph-card' })}
</div>
<p class="mt3">"철거하고 보니 배관 이음새가 삭아 있었습니다. 그대로 두면 도배 뒤에 물이 새어 다시 뜯어야 합니다."</p>`, { cls: 'mt6' })}

${U.sec('추가 항목', U.table(
    ['내용', '수량', '단가', '금액', '판단'],
    EXTRA_ITEMS.map((it) => [it.nm, `${it.qty}${it.unit}`, `<span class="num">${U.won(it.price)}</span>`, `<span class="num">${U.won(it.amt)}</span>`,
      { t: `<div class="row" style="gap:4px"><button class="radio" data-group="extra-${it.nm}" type="button">승인</button><button class="radio" data-group="extra-${it.nm}" type="button">거절</button></div>`, cls: '' }]),
    { foot: ['합계', '', '', `<span class="num">${U.won(추가공사합계)}</span>`, ''] },
  ), { cls: 'mt6' })}

${U.banner('dan', '⚠', '배관 교체를 빼면 하자보수 보증에서 이 부분은 빠집니다.', { cls: 'mt6' })}

${U.detail2(
    U.sec('왜 필요한가', `<p class="t-sub">그대로 진행하면 준공 뒤 누수가 발생할 수 있고, 그때는 도배·타일을 다시 뜯어야 해 비용이 3배 이상 늘어납니다.</p>`),
    U.card('바뀐 견적', `${U.kv([['기존 계약', '<span class="num">34,100,000원</span>'], ['추가', '<span class="num acc">+1,860,000원</span>'], ['바뀐 총액', '<span class="num strong">35,960,000원</span>']])}
      <p class="t-sub mt3">공사 기간 22일 → 25일 (3일 늘어남)</p>
      ${U.sec('남은 대금 일정', U.table(['회차', '금액'], [['중도금', '<span class="num">15,640,000원</span>'], ['잔금', '<span class="num">7,192,000원</span>']]), { cls: 'mt3' })}`),
  )}

<div data-agree-scope>
<div class="mt6">${U.check('승인 내용에 동의합니다', { attr: ' data-agree' })}</div>
${U.sec('서명', U.sigPad(), { cls: 'mt3' })}

<div class="btns mt8">
  ${U.btn('승인하고 진행하기', { cls: 'btn-pri', id: 'btn-extra', off: true, attr: ' data-unlock-all="btn-extra" data-toast="승인했어요. 공사를 계속 진행합니다" data-toast-kind="ok"' })}
  ${U.btn('나중에 정하기', { attr: ' data-toast="정해 주실 때까지 이 자리 공사가 멈춥니다"' })}
  ${U.btn('소장에게 물어보기', { attr: ' data-toast="메시지를 보냈어요"' })}
</div>
</div>`,
});

PAGES['PR-05'] = () => {
  const spaceTabs = Object.keys(CHECKLIST);
  const total = Object.values(CHECKLIST).reduce((n, arr) => n + arr.length, 0);
  return {
    body: `${U.pageHd('준공 검수 체크리스트', '')}

<div class="box"><div class="row-b"><span class="t-card"><span data-chk-done>0</span>개 확인 · 문제로 잡힌 것 ${CHECKLIST_ISSUES.length}개</span><span class="t-sub"><span data-chk-total>${total}</span>개 중</span></div>${U.progress(0)}</div>

${U.tabBox(
      spaceTabs.map((s, i) => ({ label: s, cnt: `${CHECKLIST[s].length}개`, pane: s })),
      spaceTabs.map((s, i) => U.pane(s, CHECKLIST[s].map((item) => U.chkRow(item)).join(''), i === 0)).join(''),
      0,
      { cls: 'mt6' },
    )}

${U.sec('문제로 잡힌 것', `<div class="stack">${CHECKLIST_ISSUES.map((x) => `<div class="row-b box"><span>${x.space} · ${x.item}</span><span class="t-sub">${x.at}</span></div>`).join('')}</div>`, { cls: 'mt8' })}

${U.banner('info', 'ℹ', '재시공은 접수 후 3일 안에 시작합니다.', { cls: 'mt6' })}

<div class="mt8">${U.btn('준공 승인하고 잔금 결제 (' + total + '개 남음)', { cls: 'btn-pri btn-w btn-lg', id: 'btn-approve', off: true, href: 'AS-01', attr: ' data-chk-submit' })}</div>`,
  };
};

PAGES['PR-06'] = () => ({
  body: `${U.pageHd('공사 진행', '')}

${U.empty('🏗', '지금 진행 중인 공사가 없어요', '')}

${U.sec('', `<div class="g2 mt6">
  ${U.card('아직 계약 전이신가요?', `<div class="btns">${U.btn('예상 견적 내기', { cls: 'btn-pri', href: 'ES-01' })}${U.btn('실측 예약', { href: 'VS-01' })}</div>`)}
  ${U.card('공사가 끝나셨나요?', `<div class="btns">${U.btn('준공 앨범 보기', { href: 'PR-03' })}${U.btn('하자보수 접수', { href: 'AS-01' })}</div>`)}
</div>`)}

<div class="acc-item mt6"><button class="acc-q" type="button">지난 공사 보기<span class="mk">＋</span></button>
  <div class="acc-a">${U.box(`<div class="row-b"><span>성동구 왕십리로 000 · 준공 2026-08-05</span><div class="btns">${U.btn('앨범', { sm: true, href: 'PR-03' })}${U.btn('하자보수', { sm: true, href: 'AS-01' })}</div></div>`)}</div></div>

${U.banner('info', 'ℹ', '성동구 ○○아파트 · 보증 기간 2027년 9월 30일까지 (남은 기간 13개월)', { cls: 'mt6' })}

${U.sec('시공 사례', `<a class="more" href="${U.link('CS-01')}">전체 보기 ›</a>`, { cls: 'mt8' })}`,
});
