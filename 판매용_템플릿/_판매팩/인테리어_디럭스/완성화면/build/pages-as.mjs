/* AS 하자보수 (3) — 준공 뒤에도 끝이 아니다. 보증 기간 안의 A/S 접수와 처리. */
import * as U from './ui.mjs';
import { DEFECT_PARTS, DEFECTS, 보증만료, 보증남은개월 } from './data.mjs';

export const PAGES = {};

PAGES['AS-01'] = () => {
  const part = DEFECT_PARTS[2]; // 타일 예시
  return {
    body: `${U.pageHd('하자보수 접수', '')}

${U.banner('info', 'ℹ', `성동구 ○○아파트 101동 1203호 · 보증 기간 <b>${보증만료}까지</b> · 남은 기간 ${보증남은개월}개월`)}

${U.sec('부위 고르기', `<div class="g6" data-part-pick>${DEFECT_PARTS.map((p) => `<button class="box${p.key === part.key ? ' on pri' : ''}" type="button" data-part-nm="${p.nm}" data-symptoms="${p.symptoms.join('|')}" style="text-align:center">
  <div style="font-size:22px">${p.ico}</div><div class="t-sub mt2">${p.nm}</div></button>`).join('')}</div>`, { cls: 'mt6' })}

${U.sec(`증상 고르기 — <span data-part-nm-out>${part.nm}</span>`, `<div class="stack" data-symptoms-out>${part.symptoms.map((s, i) => U.check(s, { on: i === 0, none: true })).join('')}</div>`, { cls: 'mt6' })}

${U.sec('사진·영상 올리기', U.uploadDrop('가까이 찍은 것과 멀리서 찍은 것을 같이 올려 주시면 빨라요'), { cls: 'mt6' })}

${U.sec('자세한 상황', U.textarea({ ph: '언제부터 그랬는지 적어 주시면 도움이 됩니다' }), { cls: 'mt6' })}

${U.sec('급한 정도', `<div class="row" style="gap:var(--sp-btn)">
  <button class="radio on" data-group="urgent" type="button">급함 (물이 새요)</button>
  <button class="radio" data-group="urgent" type="button">보통</button>
  <button class="radio" data-group="urgent" type="button">천천히</button>
  <span class="t-sub" style="margin-left:auto">예상 방문 9월 24일</span>
</div>`, { cls: 'mt6' })}

${U.sec('방문 가능한 요일·시간대', `<div class="chips">${['월', '화', '수', '목', '금'].map((d) => U.chip(d, d === '수')).join('')}</div>`, { cls: 'mt6' })}

<div class="acc-item mt6"><button class="acc-q" type="button">보증에 들어가는 것 / 들어가지 않는 것<span class="mk">＋</span></button>
  <div class="acc-a"><b>들어가는 것</b> — 자재 불량, 시공 하자<br><b>들어가지 않는 것</b> — 사용자 부주의, 천재지변, 다른 업체가 손댄 부위</div></div>

<div class="mt8">${U.btn('접수하기', { cls: 'btn-pri btn-w btn-lg', href: 'AS-02' })}</div>`,
  };
};

PAGES['AS-02'] = () => {
  const counts = { 전체: DEFECTS.length, 접수됨: DEFECTS.filter((d) => d.st === '접수됨').length, 방문예정: 0, 처리중: DEFECTS.filter((d) => d.st === '처리중').length, 완료: DEFECTS.filter((d) => d.st === '완료').length };
  return {
    body: `${U.pageHd('하자보수 접수 내역', '', U.btn('새로 접수하기', { cls: 'btn-pri', sm: true, href: 'AS-01' }))}

${U.banner('info', 'ℹ', `보증 기간 ${보증만료}까지 (남은 ${보증남은개월}개월)`)}

${U.tabBox(
      Object.entries(counts).map(([k, v]) => ({ label: k, cnt: v, pane: k })),
      Object.keys(counts).map((k, i) => U.pane(k, U.table(['접수일', '부위', '증상', '상태', '방문·완료일'],
        DEFECTS.filter((d) => k === '전체' || d.st === k).map((d) => [
          d.at.slice(5, 10), d.part, d.symptom, U.stBadge(d.st),
          d.done ? d.done.slice(5, 10) + ' 완료' : (d.visit ? d.visit.slice(5, 10) + ' 방문 예정' : { t: '확인 중입니다', cls: 'dan' }),
        ]), { scroll: true }), i === 0)).join(''),
      0,
      { cls: 'mt6' },
    )}

${DEFECTS.length === 0 ? U.empty('📋', '아직 접수하신 하자가 없어요', '', U.btn('접수하기', { cls: 'btn-pri', href: 'AS-01' })) : ''}

<p class="t-sub mt4">행을 누르면 진행 단계와 담당자 메모가 펼쳐집니다.</p>

<div class="btns mt4">${U.btn('처리 현황 보기', { cls: 'btn-pri', href: 'AS-03' })}${U.btn('새로 접수', { href: 'AS-01' })}</div>`,
  };
};

PAGES['AS-03'] = () => {
  const d = DEFECTS[0];
  return {
    body: `${U.pageHd('하자보수 처리 현황', `접수번호 ${d.id}`)}

${U.sec('', U.steps([['접수', d.at.slice(5, 10)], ['확인', '9/23'], ['방문', d.visit.slice(5, 10)], ['처리'], ['완료']], 2))}

${U.card('접수 내용', `${U.kv([['부위·증상', `${d.part} · ${d.symptom}`]])}
  <div class="g4 mt3">${Array.from({ length: 2 }).map((_, i) => U.ph(['접수 사진', 800, 600], { seed: 'defect' + i, cls: 'ph-card' })).join('')}</div>`, { cls: 'mt6' })}

${U.sec('담당 기사', `${U.box(`<div class="row" style="gap:var(--sp-card-pad)">${U.av('박')}<div class="grow"><div class="t-card">박수리 기사</div><div class="t-sub">010-0000-0002</div></div><span class="badge b-solid">${d.visit.slice(5, 16)} 방문 예정</span></div>`)}`, { cls: 'mt6' })}

${U.sec('처리 기록', U.timeline([
      { t: '접수', d: d.at, k: 'done' },
      { t: '담당 배정', d: d.at.slice(0, 10) + ' 17:30', k: 'done' },
      { t: '방문', d: d.visit, k: 'on' },
      { t: '처리 완료', d: '' },
    ]), { cls: 'mt6' })}

${U.sec('처리 전·후 사진', `<div class="g2">
  <div>${U.ph(['처리 전', 800, 600], { seed: 'before-fix', cls: 'ph-card' })}<div class="t-sub mt1" style="text-align:center">처리 전</div></div>
  <div>${U.ph(['처리 후', 800, 600], { seed: 'after-fix', cls: 'ph-card' })}<div class="t-sub mt1" style="text-align:center">처리 후</div></div>
</div>`, { cls: 'mt6' })}

${U.sec('무엇이 문제였고 무엇을 했나', `<p class="t-sub">타일 줄눈 시공 시 접착 부족으로 들뜸이 발생했습니다. 해당 부위 타일을 재시공하고 줄눈을 새로 채웠습니다.</p>`, { cls: 'mt6' })}

${U.sec('비용', `${U.box('보증 기간 안이라 비용이 들지 않았습니다.')}`, { cls: 'mt6' })}

<div data-agree-scope>
<div class="row-b mt6">
  ${U.check('처리 결과를 확인했습니다', { attr: ' data-agree' })}
  <a class="more" href="${U.link('AS-01')}">다시 봐 주세요</a>
</div>
<div class="mt4">${U.btn('처리 완료 확인', { cls: 'btn-pri btn-w', id: 'btn-as-done', off: true, attr: ' data-unlock-all="btn-as-done" data-toast="확인했어요. 감사합니다" data-toast-kind="ok"' })}</div>
</div>

<div class="acc-item mt6"><button class="acc-q" type="button">만족도 남기기<span class="mk">＋</span></button>
  <div class="acc-a"><div class="rate-in"><div class="st">${[1, 2, 3, 4, 5].map((n) => '<b>☆</b>').join('')}</div></div>${U.textarea({ ph: '처리는 어떠셨나요' })}${U.btn('제출', { cls: 'btn-pri mt3' })}</div></div>`,
  };
};
