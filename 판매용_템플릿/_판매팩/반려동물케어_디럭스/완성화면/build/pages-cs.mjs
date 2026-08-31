/* CS — 고객센터 (3화면) */
import {
  esc, won, num, ph, phFix, dogPh, badge, stBadge, btn, chips, tabs, pane, tabBox,
  sec, card, box, banner, empty, table, kv, timeline, accordion, pageHd, detail2, stickBar, modal,
  field, input, select, textarea, check, toggle, radioRow, uploadDrop, link, 조사, 토씨,
} from './ui.mjs';
import {
  SITE, TODAY, FAQ, QNA, POSTS, MINE, DOG, CLS, MY_PASS, MY_REG, PRICE,
} from './data.mjs';

const 초코 = DOG('d01');
const 분류 = ['예약', '요금·회차권', '백신·건강', '반 편성', '알림장'];

export const PAGES = {
  /* ============================================================
     CS-01 자주 묻는 질문 — 찾기 · 분류 · 아코디언 · 도움 여부 투표
     ============================================================ */
  'CS-01': () => {
    const 항목 = FAQ.map((f) => ({
      attr: ` data-tag="${esc(f.c)}"`,
      q: `<span><span class="badge b-line" style="margin-right:var(--sp-stack)">${esc(f.c)}</span>${esc(f.q)}</span>`,
      a: `<p>${esc(f.a)}</p>
        <div class="row wrap-row mt6">
          <span class="t-sub">도움이 됐나요?</span>
          <button class="btn btn-ghost btn-sm" type="button" data-vote="y">👍 네</button>
          <button class="btn btn-ghost btn-sm" type="button" data-vote="n">👎 아니요</button>
        </div>`,
    }));

    const body = `${pageHd('자주 묻는 질문', '가장 많이 물어보시는 것부터 모았습니다')}

<div class="filters">
  ${input({ ph: '궁금한 것을 적어 보세요 (예: 회차권, 백신)', cls: 'search', attr: ' data-search-for="faq"' })}
  ${chips(['전체', ...분류], 0, { boxAttr: ' data-filter-for="faq"' })}
</div>

<p class="t-sub mb4"><b data-filter-cnt="faq">${FAQ.length}</b>개의 질문이 있어요</p>

<div data-filter-list="faq">${accordion(항목, 0)}</div>
<div hidden data-empty-for="faq">${empty('🔍', '검색 결과가 없습니다', '「<b data-search-word="faq">—</b>」이(가) 든 질문을 못 찾았어요. 짧은 말로 다시 찾아보시거나 1:1 문의를 남겨 주세요.', btn('1:1 문의하기', { href: 'CS-02', cls: 'btn-pri' }))}</div>

${banner('info', '💬', `<b>원하는 답을 못 찾으셨나요?</b>
  <div class="t-sub mt2">1:1 문의를 남기시면 평일 기준 하루 안에 답을 드립니다.
  급하시면 카카오톡 채널 ${esc(조사(SITE.kakao, '으로', '로'))} 남겨 주세요.</div>`,
      { cls: 'mt8', right: btn('1:1 문의', { href: 'CS-02', cls: 'btn-pri', sm: true }) })}

${sec('전화로 물어보기', `${box(`<div class="row-b wrap-row">
  <div><div class="t-card">${esc(SITE.tel)}</div>
    <div class="t-sub mt1">${esc(SITE.hours)}</div></div>
  <div class="t-sub" style="max-width:360px">등하원 시간(09:00 · 18:00 앞뒤 30분)에는 아이들을 보느라 전화를 못 받을 수 있어요.
    그때는 카카오톡으로 남겨 주시면 정리되는 대로 답을 드립니다.</div>
</div>`)}`)}`;
    return { body, o: {} };
  },

  /* ============================================================
     CS-02 1:1 문의 — 반려견을 고르면 그 아이의 최근 정보가 옆에 붙는다
     ============================================================ */
  'CS-02': () => {
    const main = `
${card('무엇을 물어보시나요', `
  ${field('문의 유형', select(['예약', '결제', '백신', '알림장', '기타'], 0), { req: true })}
  ${field('어느 아이에 대한 문의인가요', `<div class="chips" data-pick-scope="qna">
    ${MINE.map((d, i) => `<button class="chip${i === 0 ? ' on' : ''}" type="button">${esc(d.nm)} <span class="x">${esc(CLS(d.cls).nm)}</span></button>`).join('')}
    <button class="chip" type="button">특정 아이와 관계없음</button>
  </div>`, { hint: '고르시면 그 아이의 최근 예약·회차권 정보가 오른쪽에 함께 전달됩니다. 지금 <b data-pick-out="qna">1</b>개를 골랐습니다.' })}
  ${field('문의 내용', textarea({ ph: '언제 있었던 일인지, 무엇이 궁금한지 적어 주세요. 자세할수록 정확한 답을 드릴 수 있어요.', attr: ' style="min-height:180px"' }), { req: true })}
  ${field('사진·문서 첨부', uploadDrop('영수증·증명서·화면 사진을 올려 주세요'), { hint: '한 번에 5개까지, 파일당 10MB 까지 올릴 수 있어요' })}
  <div class="btns mt6">
    ${btn('문의 제출', { cls: 'btn-pri', id: 'qnaBtn', attr: ' data-pick-btn="qna" data-notify="문의를 접수했어요 — 평일 기준 하루 안에 답을 드립니다"' })}
    ${btn('자주 묻는 질문 먼저 보기', { href: 'CS-01', cls: 'btn-ghost' })}
  </div>`)}

${sec('지난 문의', `<div class="list1">
  ${QNA.map((q) => `<div>
    <div class="row wrap-row">${stBadge(q.st)}${badge(esc(q.kind), 'b-line')}<span class="t-sub">${esc(q.date)}</span></div>
    <div class="t-card mt2">${esc(q.t)}</div>
    <div class="btns mt3">${btn('문의·답변 보기', { cls: 'btn-ghost', sm: true, attr: ` data-modal="m${q.id}"` })}</div>
  </div>`).join('')}
</div>`)}

${QNA.map((q) => modal(`m${q.id}`, esc(q.t), `
  <div class="row wrap-row mb6">${stBadge(q.st)}${badge(esc(q.kind), 'b-line')}<span class="t-sub">${esc(q.date)}</span></div>
  ${box(`<div class="t-sub mb2">내가 남긴 문의</div><p>${esc(q.q)}</p>`)}
  <div class="mt4">${banner('ok', '💬', `<div class="t-sub mb2">${esc(SITE.name)} 답변</div><p>${esc(q.a)}</p>`)}</div>
  <div class="mt6">${field('추가로 물어볼 것이 있으면 적어 주세요', textarea({ ph: '' }))}</div>`,
      `${btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' })}
   ${btn('이어서 문의', { cls: 'btn-pri', attr: ' data-notify="이어서 남긴 문의를 접수했어요" data-dismiss' })}`)).join('')}`;

    const aside = `
${card('함께 전달되는 정보', `
  <div class="row wrap-row mb4">${dogPh(초코.nm, 56)}
    <div class="grow"><div class="t-card">${esc(초코.nm)}</div>
      <div class="t-sub">${esc(초코.breed)} · ${초코.kg}kg · ${esc(CLS(초코.cls).nm)}</div></div></div>
  ${kv([
      ['최근 등원', '2026-08-21 (금)'],
      ['다음 예약', '2026-08-26 (수)'],
      ['회차권', `${MY_PASS.left}회 남음 (${MY_PASS.until}까지)`],
      ['정기 요일', `매주 ${MY_REG.days.join('·')}`],
      ['백신', `정상 (${초코.vacD}일 남음)`],
    ], { cls: 'left' })}
  <p class="hint">이 정보가 문의와 함께 전달되어, 저희가 다시 여쭤보는 일이 줄어듭니다.</p>`)}

${card('답변은 언제 오나요', `
  ${timeline([
      { t: '접수 즉시', d: '카카오톡으로 접수 확인이 갑니다', k: 'done' },
      { t: '평일 하루 안에', d: '담당자가 답변을 남깁니다', k: 'on' },
      { t: '답변 뒤', d: '이 화면에서 이어서 물어보실 수 있어요' },
    ])}
  <p class="hint">주말·공휴일에 남기신 문의는 다음 영업일에 답을 드립니다.</p>`, { cls: 'mt6' })}

<div class="btns-v mt6">
  ${btn('공지사항 보기', { href: 'CS-03', cls: 'btn-ghost', w: true })}
  ${btn('자주 묻는 질문', { href: 'CS-01', cls: 'btn-ghost', w: true })}
</div>`;

    return { body: `${pageHd('1:1 문의', '평일 기준 하루 안에 답을 드립니다')}${detail2(main, aside)}`, o: { wide: true } };
  },

  /* ============================================================
     CS-03 공지사항 상세 — 차분한 읽기 화면
     ============================================================ */
  'CS-03': () => {
    const p = POSTS[0];
    const 앞 = POSTS[1];
    const 뒤 = POSTS[2];

    const body = `
<div class="row wrap-row mb4">${stBadge(p.cat)}${badge('중요', 'b-solid')}<span class="t-sub">${esc(p.date)}</span></div>
<h1 class="t-page">${esc(p.t)}</h1>

<div class="mt8" style="font-size:var(--fs-card);line-height:var(--lh-body)">
  <p>안녕하세요, ${esc(SITE.name)}입니다.</p>
  <p class="mt6">추석 연휴 동안 <b class="hl">9월 24일(목)부터 27일(일)까지 나흘간</b> 쉽니다.
  28일(월)부터 평소대로 ${esc(SITE.open)}에 문을 엽니다.</p>

  <h2 class="t-sec mt8 mb4">정기 등원은 어떻게 되나요</h2>
  <p>연휴 기간에 잡혀 있던 정기 등원 요일은 <b>회차권으로 자동 전환</b>되어 돌려드립니다.
  따로 신청하지 않으셔도 됩니다. 9월 자동 청구액도 쉬는 날만큼 빼고 청구합니다.</p>
  <p class="mt4">예를 들어 매주 월·수·금 오시는 아이는 9월 25일(금) 한 번이 빠지므로,
  회차권 1회가 들어오고 청구액에서 그만큼 빠집니다.</p>

  <h2 class="t-sec mt8 mb4">낱개 예약은요</h2>
  <p>연휴 날짜는 예약 달력에서 <b>마감</b>으로 표시됩니다. 이미 잡아 두신 예약이 있으면
  자동으로 취소되고 회차권이 돌아갑니다 — 차감되지 않습니다.</p>

  <h2 class="t-sec mt8 mb4">연휴에 급한 일이 생기면</h2>
  <p>카카오톡 채널 <b>${esc(SITE.kakao)}</b>${토씨(SITE.kakao, '으로', '로')} 남겨 주세요. 연휴에도 하루 한 번 확인합니다.
  아이 건강과 관련된 급한 일은 협력 동물병원 ${esc(SITE.vet.nm)}(${esc(SITE.vet.tel)})으로 바로 연락하셔도 됩니다.</p>

  <div class="mt8">${ph(['공지 안내 이미지', 1200, 675], { seed: 'notice', cls: 'ph-sq' })}</div>
  <p class="t-sub mt3">연휴 기간 운영 안내</p>
</div>

${card('첨부파일', `<div class="stack">
  ${[['추석 연휴 휴무 안내문.pdf', '182KB'], ['9월 등원 달력.pdf', '96KB']].map(([nm, sz]) => `<div class="row-b wrap-row">
    <span class="row"><span>📎</span><b>${esc(nm)}</b><span class="t-sub">${esc(sz)}</span></span>
    ${btn('내려받기', { cls: 'btn-ghost', sm: true, attr: ` data-toast="${esc(조사(nm, '을', '를'))} 내려받습니다"` })}
  </div>`).join('')}
</div>`, { cls: 'mt8' })}

${banner('acc', '🎁', `<b>${esc(POSTS[1].t)}</b>
  <div class="t-sub mt2">연휴 전에 회차권을 미리 사 두시면 할인이 함께 적용됩니다. ${esc(POSTS[1].date)}부터 진행 중이에요.</div>`,
      { cls: 'mt6', right: btn('요금 보기', { href: 'HO-02', cls: 'btn-sub', sm: true }) })}

<div class="row-b wrap-row mt8" style="border-top:1px solid var(--border);padding-top:var(--sp-block)">
  ${btn('‹ 더 최신 글 없음 · 가장 최근 공지입니다', { cls: 'btn-ghost', sm: true, off: true, id: 'csNewer' })}
  ${btn(`지난 글 · ${esc(앞.date)} ${esc(앞.t.length > 16 ? 앞.t.slice(0, 16) + '…' : 앞.t)} ›`, { href: 'CS-03', cls: 'btn-ghost', sm: true })}
</div>

<div class="btns mt8">
  ${btn('자주 묻는 질문', { href: 'CS-01', cls: 'btn-ghost' })}
  ${btn('홈으로', { href: 'HO-01', cls: 'btn-sub' })}
</div>`;
    return { body, o: {} };
  },
};
