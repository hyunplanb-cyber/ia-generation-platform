/* NW — 알림장 작성 (4화면) · 원 운영진이 쓰는 화면
   ★ 알림장은 이 서비스가 파는 값이다. 사진이 주인공이어야 한다. */
import {
  esc, won, num, ph, phFix, dogPh, badge, stBadge, btn, chips, tabs, pane, tabBox,
  sec, card, box, banner, empty, table, kv, timeline, progress, pageHd, stickBar, modal, stat,
  field, input, select, textarea, check, toggle, radioRow, uploadDrop, link, gal, 조사,
} from './ui.mjs';
import {
  SITE, TODAY, DOGS, DOG, CLASSES, CLS, CAME, NOTE_ST, NOTE_CNT, PHRASES, NOTES, STAFF,
} from './data.mjs';

const 하원한 = DOGS.filter((d) => d.st === '하원');
const 쓸아이 = 하원한[0] || DOGS[0];

export const PAGES = {
  /* ============================================================
     NW-01 알림장 작성 — 보육교사가 짧은 시간에 여러 명을 써야 한다.
     「즐겨쓰는 문장」 같은 시간 단축 장치가 눈에 띄어야 한다.
     ============================================================ */
  'NW-01': () => {
    const 미작성 = CAME.filter((d) => NOTE_ST[d.id] !== '작성완료');

    const body = `${pageHd('알림장 작성', `${esc(TODAY.label)} · 아직 ${NOTE_CNT.미작성}건이 남았어요`,
      btn('발송 관리', { href: 'NW-03', cls: 'btn-ghost' }))}

${card('누구의 알림장을 쓸까요', `
  <div class="chips" data-pick-scope="who">
    ${미작성.map((d, i) => `<button class="chip${i === 0 ? ' on' : ''}" type="button">${esc(d.nm)} <span class="x">${esc(CLS(d.cls).nm)}</span></button>`).join('')}
  </div>
  <p class="hint"><b data-pick-out="who">${미작성.length ? 1 : 0}</b>마리를 골랐습니다. 가장 먼저 하원한 아이가 기본으로 골라져 있어요 — 다른 아이를 눌러 바꾸세요.</p>`,
      { cls: 'mt8' })}

${card('오늘 컨디션', `
  <div class="pc-cond">
    ${[['활발함', '😄'], ['평온함', '🙂'], ['힘없음', '😪']].map(([t, i], n) => `<button type="button" class="${n === 0 ? 'on' : ''}" data-cond="${t}">
      <span class="ico">${i}</span><span>${t}</span></button>`).join('')}
  </div>
  <p class="hint">고른 컨디션: <b data-cond-out>활발함</b> — 알림장 맨 위에 큼직하게 들어갑니다.</p>`, { cls: 'mt6' })}

${card('오늘 하루 체크', `
  <div class="g3">
    ${[['🍚 식사', 'meal'], ['💩 배변', 'poop'], ['😴 낮잠', 'nap']].map(([t, k]) => `<div class="box">
      <div class="t-card mb3">${t}</div>
      ${radioRow(k, ['잘함', '보통', '부진'], 0)}
    </div>`).join('')}
  </div>`, { cls: 'mt6' })}

${card('하루 요약', `
  ${textarea({ ph: '오늘 어떻게 지냈는지 적어 주세요. 보호자님이 가장 오래 읽는 부분입니다.', attr: ' data-note-text style="min-height:160px"' })}
  <p class="hint">지금 <b data-note-len>0</b>자 · 100자 넘게 쓰시면 보호자 만족도가 눈에 띄게 올라갑니다.</p>
  <div class="mt6">
    <div class="t-sub mb2"><b>즐겨쓰는 문장</b> — 누르면 위 칸에 이어 붙습니다</div>
    <div class="btns">
      ${PHRASES.map((p) => btn(esc(p.length > 18 ? p.slice(0, 18) + '…' : p), { cls: 'btn-ghost', sm: true, attr: ` data-phrase="${esc(p)}"` })).join('')}
    </div>
  </div>`, { cls: 'mt6' })}

${card('특이사항', `
  <div class="row-b">
    <div><div class="t-card">오늘 다치거나 아팠던 일이 있나요?</div>
      <div class="t-sub mt1">적으시면 알림장에 붉은 상자로 강조돼 나갑니다</div></div>
    ${toggle(false, '', ' data-open="specialBox"')}
  </div>
  <div id="specialBox" class="mt6" hidden>
    <div class="box dan">
      ${textarea({ ph: '예: 발톱이 살짝 갈라져 있어요. 집에서 한 번 확인해 주세요.' })}
      <p class="hint">다친 일이라면 여기 말고 <b>사고·특이사항 기록</b>에 남겨 주세요 — 보호자 연락 절차가 함께 돕니다.</p>
      <div class="btns mt4">${btn('사고·특이사항 기록으로', { href: 'HL-03', cls: 'btn-dan', sm: true })}</div>
    </div>
  </div>`, { cls: 'mt6' })}`;

    return {
      body,
      o: {
        wide: true,
        stick: stickBar(
          `<div><div class="t-sub">오늘 ${NOTE_CNT.전체}건 중 ${NOTE_CNT.작성완료}건 작성 완료</div><div class="t-card">남은 ${NOTE_CNT.미작성}건</div></div>`,
          `${btn('임시 저장', { cls: 'btn-ghost', attr: ' data-toast="임시 저장했어요 — 발송 관리에서 「작성중」으로 보입니다"' })}
           ${btn('사진 첨부하러 가기', { href: 'NW-02', cls: 'btn-pri', id: 'toShots', attr: ' data-pick-btn="who"' })}`,
        ),
      },
    };
  },

  /* ============================================================
     NW-02 사진 첨부 — 별로 대표를 정하고, 끌어서 차례를 바꾸고, ✕ 로 지운다
     ⚠ 손님이 올릴 사진이므로 자리표시자로 둔다. 가짜 사진 주소를 지어내지 않는다.
     ============================================================ */
  'NW-02': () => {
    const 장수 = 6;
    const body = `${pageHd('사진 첨부', `${esc(쓸아이.nm)}의 ${esc(TODAY.short)} 알림장`,
      btn('알림장 작성으로', { href: 'NW-01', cls: 'btn-ghost' }))}

${banner('info', '📸', `<b>사진이 이 서비스가 파는 값입니다.</b>
  <div class="t-sub mt2">보호자님은 글보다 사진을 먼저 봅니다. 얼굴이 또렷한 사진 한 장을 <b>대표</b>로 정해 주세요 —
  알림장함 목록의 썸네일이 됩니다.</div>`, { cls: 'mt8' })}

${card('사진 올리기', `
  ${uploadDrop('눌러서 오늘 찍은 사진을 올려 주세요 (여러 장 한 번에 고를 수 있어요)')}
  <p class="hint">한 장에 10MB 까지. 그보다 크면 저절로 줄여서 올립니다.</p>`, { cls: 'mt6' })}

${card('올린 사진', `
  <div class="pc-shots">
    ${Array.from({ length: 장수 }).map((_, i) => `<div class="pc-shot${i === 0 ? ' main' : ''}" draggable="true">
      ${ph(['알림장 사진', 800, 600], { seed: 'nw2-' + i, cls: 'ph-card' })}
      <button class="star" type="button" aria-label="대표 사진으로 정하기">★</button>
      <button class="del" type="button" aria-label="지우기">✕</button>
      <span class="cap"${i === 0 ? ' data-main="1"' : ''}>${i === 0 ? '대표' : i + 1}</span>
    </div>`).join('')}
  </div>
  <p class="hint">지금 <b data-shot-n>${장수}</b>장 · ★를 누르면 대표 사진, 카드를 끌면 차례가 바뀝니다.</p>
  <div hidden data-shot-warn class="mt4">
    ${banner('warn', '📷', '<b>사진이 3장 미만이면 알림장이 허전해 보여요.</b><div class="t-sub mt2">막지는 않습니다 — 오늘 사진이 적었다면 그대로 보내셔도 됩니다.</div>')}
  </div>`, { cls: 'mt6' })}

${sec('보호자에게는 이렇게 보입니다', `${box(`
  <div class="t-sub mb4">알림장 상세 화면 미리보기 — 첫 장이 크게 들어갑니다</div>
  ${gal(장수, 'preview')}`)}`)}`;

    return {
      body,
      o: {
        wide: true,
        stick: stickBar(
          `<div><div class="t-sub">${esc(쓸아이.nm)} · ${esc(CLS(쓸아이.cls).nm)}</div><div class="t-card">사진 <span data-shot-n>${장수}</span>장</div></div>`,
          `${btn('알림장 다시 쓰기', { href: 'NW-01', cls: 'btn-ghost' })}
           ${btn('발송하러 가기', { href: 'NW-03', cls: 'btn-pri' })}`,
        ),
      },
    };
  },

  /* ============================================================
     NW-03 발송 관리 — 미작성이 몇 건 남았는지가 가장 눈에 띄어야 한다
     ============================================================ */
  'NW-03': () => {
    const body = `${pageHd('알림장 발송 관리', `${esc(TODAY.label)} · 오늘 등원한 ${NOTE_CNT.전체}마리`,
      btn('발송 이력', { href: 'NW-04', cls: 'btn-ghost' }))}

<div class="g4">
  ${stat('미작성', NOTE_CNT.미작성, { ico: '✍️', u: '건', cls: 'dan', d: '아직 손대지 않은 알림장' })}
  ${stat('작성중', NOTE_CNT.작성중, { ico: '📝', u: '건', cls: 'warn', d: '임시 저장해 둔 것' })}
  ${stat('작성완료', NOTE_CNT.작성완료, { ico: '✅', u: '건', cls: 'ok', d: '지금 바로 보낼 수 있어요' })}
  ${stat('발송 실패', NOTE_CNT.실패, { ico: '⚠️', u: '건', cls: 'dan', d: '연락처 오류 — 다시 보내야 해요' })}
</div>

${card('한 번에 보내기', `
  <div class="row-b wrap-row">
    <div><div class="t-card">작성이 끝난 ${NOTE_CNT.작성완료}건을 지금 보냅니다</div>
      <div class="t-sub mt1">보호자에게 카카오톡으로 나갑니다. 실패한 건은 발송 이력에서 다시 보낼 수 있어요.</div></div>
    ${btn(`작성 완료된 알림장 ${NOTE_CNT.작성완료}건 일괄 발송`, { cls: 'btn-pri', id: 'bulkBtn', attr: ` data-bulk-send="${NOTE_CNT.작성완료}"` })}
  </div>
  <div style="border-top:1px solid var(--border);margin:var(--sp-card-pad) 0"></div>
  <div class="row-b wrap-row">
    <div><div class="t-card">매일 18:30에 자동 발송</div>
      <div class="t-sub mt1">그때까지 작성이 끝난 것만 나갑니다. 미작성은 다음 날로 넘어가지 않고 그대로 남아요.</div></div>
    ${toggle(true, '매일 18:30 자동 발송을 켰어요')}
  </div>`, { cls: 'mt8' })}

<div class="row-b wrap-row mt8 mb4">
  <p class="t-sub"><b data-filter-cnt="send">${NOTE_CNT.전체}</b>마리를 보고 있어요</p>
  <div class="btns">
    ${btn('미작성만 보기', { cls: 'btn-ghost', attr: ' data-filter-only="send" data-filter-tag="미작성" aria-pressed="false"' })}
  </div>
</div>

<div data-filter-list="send">
${table(
      ['이름', '반', '하원', { t: '작성 상태', cls: 'c' }, { t: '발송', cls: 'c' }, { t: '', cls: 'c' }],
      CAME.map((d, i) => {
        const st = NOTE_ST[d.id];
        const 실패 = i === 3;
        return {
          attr: ` data-tag="${st}"`,
          cls: 실패 ? 'bad' : '',
          cells: [
            { t: `<b>${esc(d.nm)}</b>`, cls: 'nowrap' },
            esc(CLS(d.cls).nm),
            { t: d.outAt ? `<b class="num">${d.outAt}</b>` : '<span class="muted">재원 중</span>', cls: 'nowrap' },
            { t: `<span class="badge ${st === '작성완료' ? 'b-ok' : (st === '작성중' ? 'b-warn' : 'b-mut')}" data-note-st="${st}">${st}</span>`, cls: 'c' },
            { t: 실패 ? badge('실패 · 연락처 오류', 'b-dan') : '<span class="muted">대기</span>', cls: 'c' },
            {
              t: 실패
                ? btn('재발송', { cls: 'btn-dan', sm: true, attr: ` data-resend="${esc(d.nm)}"` })
                : btn(st === '미작성' ? '쓰기' : '이어서 쓰기', { href: 'NW-01', cls: 'btn-ghost', sm: true }),
              cls: 'c',
            },
          ],
        };
      }),
    )}
</div>
<div hidden data-empty-for="send">${empty('🎉', '결과가 없습니다', '미작성 알림장이 하나도 없어요. 오늘 몫을 다 쓰셨습니다.', btn('일괄 발송하기', { href: 'NW-03', cls: 'btn-pri' }))}</div>

<div class="btns mt8">
  ${btn('발송 이력', { href: 'NW-04', cls: 'btn-sub' })}
  ${btn('알림장 작성', { href: 'NW-01', cls: 'btn-ghost' })}
</div>`;
    return { body, o: { wide: true } };
  },

  /* ============================================================
     NW-04 발송 이력 — 「정말 다 보냈나, 보호자가 봤나」를 확인하는 화면
     ============================================================ */
  'NW-04': () => {
    const 이력 = [
      { t: '08-21 18:32', dog: '초코', g: '김하늘', st: '읽음', open: '18:41' },
      { t: '08-21 18:32', dog: '해피', g: '오재현', st: '읽음', open: '19:05' },
      { t: '08-21 18:32', dog: '루비', g: '강민아', st: '전달됨', open: '' },
      { t: '08-21 18:32', dog: '루키', g: '차민준', st: '실패', open: '' },
      { t: '08-20 18:30', dog: '초코', g: '김하늘', st: '읽음', open: '18:35' },
      { t: '08-20 18:30', dog: '보리', g: '김하늘', st: '읽음', open: '18:35' },
      { t: '08-20 18:30', dog: '구름', g: '조은수', st: '전달됨', open: '' },
      { t: '08-19 18:31', dog: '초코', g: '김하늘', st: '읽음', open: '20:12' },
      { t: '08-19 18:31', dog: '단추', g: '임채원', st: '읽음', open: '18:44' },
      { t: '08-19 18:31', dog: '몽이', g: '남주희', st: '실패', open: '' },
    ];

    const body = `${pageHd('발송 이력', '보낸 알림장과 보호자가 읽었는지를 확인합니다',
      btn('발송 관리', { href: 'NW-03', cls: 'btn-ghost' }))}

<div class="filters">
  ${select(['최근 7일', '2026년 8월', '2026년 7월'], 0)}
  ${input({ ph: '반려견 이름으로 찾기', cls: 'search', attr: ' data-search-for="hist"' })}
</div>

<p class="t-sub mb4"><b data-filter-cnt="hist">${이력.length}</b>건 · 실패 <b class="dan">${이력.filter((r) => r.st === '실패').length}</b>건</p>

<div data-filter-list="hist" data-per-page="6">
${table(
      ['발송 시각', '반려견', '보호자', { t: '결과', cls: 'c' }, { t: '읽은 시각', cls: 'c' }, '미리보기', { t: '', cls: 'c' }],
      이력.map((r) => ({
        attr: ` data-tag="${r.st}"`,
        cls: r.st === '실패' ? 'bad' : '',
        cells: [
          { t: `<span class="num">${esc(r.t)}</span>`, cls: 'nowrap' },
          { t: `<b>${esc(r.dog)}</b>`, cls: 'nowrap' },
          esc(r.g),
          { t: stBadge(r.st), cls: 'c' },
          { t: r.open ? `<span class="num ok">${esc(r.open)}</span>` : '<span class="muted">—</span>', cls: 'c nowrap' },
          { t: phFix(['알림장 대표 사진', 800, 600], 56, { seed: r.dog + r.t }), cls: 'nowrap' },
          {
            t: r.st === '실패'
              ? btn('재발송', { cls: 'btn-dan', sm: true, attr: ` data-resend="${esc(r.dog)}"` })
              : btn('내용 보기', { cls: 'btn-ghost', sm: true, attr: ' data-modal="mPreview"' }),
            cls: 'c',
          },
        ],
      })),
    )}
</div>
<div hidden data-empty-for="hist">${empty('🔍', '검색 결과가 없습니다', '「<b data-search-word="hist">—</b>」이(가) 든 알림장을 못 찾았어요. 이름을 짧게 적어 보시거나 기간을 넓혀 보세요.', btn('전체 보기', { href: 'NW-04', cls: 'btn-pri' }))}</div>

<div class="btns mt8" style="justify-content:center" data-page-box="hist">
  ${[1, 2].map((n) => `<button class="chip${n === 1 ? ' on' : ''}" type="button" data-page-for="hist" data-page-n="${n}">${n}</button>`).join('')}
  <span class="t-sub" style="align-self:center"><b data-page-all="hist">2</b>쪽 중 <b data-page-now="hist">1</b>쪽</span>
</div>

${banner('warn', '📵', `<b>발송 실패는 대부분 연락처가 바뀐 경우입니다.</b>
  <div class="t-sub mt2">보호자께 새 번호를 여쭙고 반려견 프로필에서 고친 뒤 재발송해 주세요.</div>`,
      { cls: 'mt8', right: btn('보호자 알림 관리', { href: 'HL-04', cls: 'btn-sub', sm: true }) })}

${modal('mPreview', '보낸 알림장 미리보기', `
  <div class="t-sub">2026-08-21 (금) · 초코 · 담당 이도윤</div>
  <div class="mt4">${gal(4, 'modal')}</div>
  <p class="mt4">${esc(NOTES[0].sum)}</p>
  <div class="mt4">${banner('warn', '🔎', `<b>확인해 주세요</b><div class="mt2">${esc(NOTES[0].note)}</div>`)}</div>`,
      btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' }))}

<div class="btns mt8">${btn('알림장 작성', { href: 'NW-01', cls: 'btn-pri' })}</div>`;
    return { body, o: { wide: true } };
  },
};
