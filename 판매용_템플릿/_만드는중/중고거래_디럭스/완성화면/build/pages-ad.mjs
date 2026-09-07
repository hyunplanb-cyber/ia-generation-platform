/* AD 운영자 — 신고 처리 대기열 / 신고 상세·조치 / 금지품목·규칙 / 정산·분쟁 / 로그인
   ⚠ 회원이 물건을 올리는 순간 «신고 처리 대기열»이 반드시 따라온다.
     쇼핑몰 도구에는 이 화면이 아예 없다 — 올리는 사람이 관리자 하나뿐이기 때문이다.
   ⚠ 사람의 계정을 막고 남의 돈을 옮기는 화면이다. 확정 전에 «무엇이 일어나는지»를 다 보여 준다. */
import * as U from './ui.mjs';
import {
  REPORTS, REPORT_STATS, ACTIONS, BANNED, BAN_WORDS, BAN_EXCEPT,
  SETTLES, DISPUTE, itemBy, userBy, fee, payout, SITE, FEE_RATE, ago,
} from './data.mjs';

/* ---------------- AD-01 신고 처리 대기열 ---------------- */
function AD01() {
  const 상태 = ['대기', '처리중', '완료', '보류'];
  const 셈 = (st) => (st === '완료' ? REPORT_STATS.완료 : REPORTS.filter((r) => r.st === st).length);

  const 표 = (것들, 열쇠) => U.table(
    [{ t: '<label class="check none"><input type="checkbox" aria-label="모두 고르기"></label>', w: '3%' },
    { t: '접수', w: '10%' }, { t: '사유', w: '14%' }, { t: '신고 대상' },
    { t: '신고자', w: '9%' }, { t: '누적', w: '7%' }, { t: '긴급도', w: '8%' },
    { t: '담당자', w: '12%' }, { t: '상태', w: '8%' }, { t: '', w: '9%' }],
    것들.map((r) => ({
      cls: r.ago > 1440 ? 'over' : '',
      data: { why: r.why, lv: r.lv, kind: r.kind, ago: r.ago, dup: r.dup },
      cells: [
        `<label class="check none"><input type="checkbox" data-pick aria-label="${r.id} 고르기"></label>`,
        /* ⚠ 분·시간·일을 여기서 다시 세지 않는다 — ago() 한 곳에서 낸다.
           손으로 세다가 26분짜리가 「0시간 전」으로 찍혔다(2026-09-07). */
        `${r.at}<div class="t-sub">${r.ago > 1440 ? `<b class="danger">${ago(r.ago)} 접수</b>` : `${ago(r.ago)}`}</div>`,
        U.badge(r.why.replace(/요$/, ''), 'b-mut'),
        `<div class="row-c" style="gap:8px">${U.phItem(30, r.item)}
          <span>${U.esc(r.target)}<div class="t-sub">${r.kind}</div></span></div>`,
        r.by,
        r.dup > 1 ? `<b class="danger">${r.dup}건</b>` : `${r.dup}건`,
        U.stBadge(r.lv),
        `<select class="input" style="width:auto" data-row-badge data-badge-to="처리중" data-badge-from="${r.st}" data-toast="담당자를 지정했어요 · 상태가 처리중으로 바뀝니다">
          <option${r.who === '—' ? ' selected' : ''}>없음</option>
          <option${r.who === '박서준' ? ' selected' : ''}>박서준</option>
          <option${r.who === '이도현' ? ' selected' : ''}>이도현</option></select>`,
        `<span class="badge ${{ 대기: 'b-warn', 처리중: 'b-pri', 보류: 'b-mut', 완료: 'b-ok' }[r.st]}" data-badge-of>${r.st}</span>`,
        U.btn('열기', { href: 'AD-02', cls: 'btn-ghost btn-xs' }),
      ],
    })), { listKey: 열쇠 });

  const 본문 = `
  ${U.pageHd('신고 처리 대기열', '접수된 순서대로 처리합니다')}

  ${U.statRow([
    [`${REPORT_STATS.오늘접수}건`, '오늘 접수'],
    [`<span data-filter-count="rep">${REPORT_STATS.대기}</span>건`, '처리 대기'],
    [REPORT_STATS.평균처리, '평균 처리 시간'],
    [`${REPORT_STATS.기한넘김}건`, '기한 넘김', { cls: 'danger' }],
  ], 'g4')}

  <div class="mt-block">
  ${U.tabs(상태.map((st, i) => ({ label: st, cnt: 셈(st), pane: 'ad' + i })), 0)}

  <div class="row-c wrap-row mt4 mb3" style="gap:8px">
    <select class="input" style="width:auto" data-filter="rep" data-f-key="why"><option value="">모든 사유</option>
      <option value="사기가 의심돼요">사기 의심</option><option value="팔 수 없는 물건이에요">금지 품목</option>
      <option value="욕설·비방을 해요">욕설·비방</option><option value="광고·도배예요">광고·도배</option>
      <option value="남의 사진을 가져다 썼어요">사진 도용</option></select>
    <select class="input" style="width:auto" data-filter="rep" data-f-key="lv"><option value="">모든 긴급도</option><option value="높음">높음</option><option value="보통">보통</option><option value="낮음">낮음</option></select>
    <select class="input" style="width:auto" data-filter="rep" data-f-key="kind"><option value="">모든 대상</option><option value="회원">회원</option><option value="매물">매물</option><option value="대화">대화</option></select>
    <select class="input" style="width:auto" data-sort-cards="rep"><option value="ago" data-desc>오래된 순</option><option value="dup" data-desc>누적 신고순</option></select>
    ${U.btn('전체 해제', { cls: 'btn-ghost btn-sm', attr: ' data-filter-reset="rep"' })}
  </div>

  <div>
    ${상태.map((st, i) => {
    const 것들 = REPORTS.filter((r) => r.st === st);
    return `<div data-pane-body="ad${i}"${i === 0 ? '' : ' hidden'}>
      ${것들.length ? 표(것들, i === 0 ? 'rep' : null)
        : U.empty('✅', `${st}인 신고가 없어요`, st === '대기' ? '오늘 42건을 처리했습니다. 수고하셨어요.' : '', '')}
    </div>`;
  }).join('')}
  </div>
  </div>

  <div class="mt-block">${U.banner('warn', '⏰', `<b>접수 24시간이 지난 신고가 ${REPORT_STATS.기한넘김}건 있어요</b>
    <div class="t-sub mt1">R-2413 · 커피 그라인더 · 사기 의심 (보류 중)</div>`,
    { right: U.btn('먼저 보기', { href: 'AD-02', cls: 'btn-ghost btn-sm' }) })}</div>

  <div class="mt-block">${U.card('여러 건 한꺼번에', `
    <p class="t-sub mb3">표 왼쪽 체크로 여러 건을 고르면 아래 단추가 열려요.</p>
    <div class="row-c wrap-row" style="gap:8px" data-pick-bar hidden>
      ${U.badge('<b data-pick-n>0</b>건 골랐어요', 'b-pri')}
      ${U.btn('고른 건 반려', { cls: 'btn-ghost', attr: ' data-modal="bulk"' })}
      ${U.btn('고른 건 담당자 지정', { cls: 'btn-ghost', attr: ' data-toast="담당자를 지정했어요 · 상태가 처리중으로 바뀝니다"' })}
    </div>
    <p class="t-sub" data-pick-empty>아직 고른 것이 없어요.</p>`)}</div>

  ${U.modal('bulk', '고른 3건을 반려할까요?', `
    <p class="t-sub mb3">반려하면 신고한 분에게 「확인했지만 규정 위반이 아니다」라는 안내가 갑니다.</p>
    <div class="stack-sm">${REPORTS.slice(0, 3).map((r) => `<div class="cond-row">
      <span class="grow">${r.id} · ${U.esc(r.target)}</span>${U.badge(r.why.replace(/요$/, ''), 'b-mut')}</div>`).join('')}</div>
    ${U.banner('warn', '⚠', '<b>되돌릴 수 없어요.</b> 반려한 신고는 다시 열 수 없습니다.', { cls: 'mt3' })}`,
    U.btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })
    + U.btn('3건 반려', { cls: 'btn-pri', attr: ' data-dismiss data-toast="3건을 반려했어요 · 신고자에게 알렸습니다"' }))}
  `;
  return { body: U.proPage('AD-01', 본문), o: { pro: true } };
}

/* ---------------- AD-02 신고 상세·조치 ---------------- */
function AD02() {
  const r = REPORTS[0];
  const it = itemBy(r.item);

  const 왼쪽 = `
  ${U.card('', `<div class="row-b wrap-row">
    <div>
      <div class="row-c wrap-row"><b class="t-card">${r.id}</b>${U.badge(r.why.replace(/요$/, ''), 'b-mut')}${U.stBadge(r.lv)}${U.stBadge(r.st)}</div>
      <p class="t-sub mt1">${r.at} 접수 · ${Math.floor(r.ago / 60)}시간 경과 · 담당 ${r.who}</p>
    </div>
    <div class="btns">
      ${U.btn('‹ 이전 신고', { cls: 'btn-quiet btn-sm', attr: ' data-toast="R-2417 로 넘어갑니다"' })}
      ${U.btn('다음 신고 ›', { cls: 'btn-quiet btn-sm', attr: ' data-toast="R-2416 으로 넘어갑니다"' })}
    </div>
  </div>`)}

  <div class="mt-block">${U.sec('① 신고한 분이 적은 것', U.card('', `
    <p class="t-sub mb2">${r.by}님 · ${r.at}</p>
    <p>채팅에서 「지금 바로 입금하시면 오늘 보내드린다」며 계좌를 먼저 알려줬습니다.
    안전결제로 하자고 했더니 「수수료가 아까우니 그냥 계좌로 보내라」고 했어요.
    같은 물건이 다른 동네에도 똑같은 사진으로 올라와 있습니다.</p>
    <div class="row wrap-row mt4" style="gap:8px">
      ${[1, 2, 3, 4].map((n) => U.phItem(96, 'ev' + n)).join('')}
    </div>
    <p class="t-sub mt2">첨부한 캡처 4장 — 누르면 크게 볼 수 있어요.</p>`))}</div>

  <div class="mt-block">${U.sec('② 신고된 대화', U.card('', `
    <div class="talk-wrap" style="min-height:auto">
      <div class="day-sep">9월 6일</div>
      <div class="bub">안녕하세요, 캠핑 의자 아직 있나요?<span class="when">오후 8:02</span></div>
      <div class="bub me">네 있습니다. 오늘 바로 보내드릴 수 있어요<span class="when">오후 8:04</span></div>
      <div class="bub">안전결제로 할게요<span class="when">오후 8:05</span></div>
      <div class="bub me hl">수수료가 아까우니 그냥 계좌로 보내주세요. 000-00-000000 국민은행입니다<span class="when">오후 8:06</span></div>
      <div class="bub me hl">지금 입금하시면 오늘 바로 보내드릴게요. 다른 분도 기다리셔서요<span class="when">오후 8:07</span></div>
    </div>
    <p class="t-sub mt3">노란 바탕이 신고된 말입니다. <button class="link" type="button" data-toast="앞뒤 대화를 더 폈어요">앞뒤 더 보기</button></p>`))}</div>

  <div class="mt-block">${U.sec('③ 신고된 회원', `
    ${U.userCard(userBy('u5'), { href: 'MY-01' })}
    <div class="mt4">${U.table(
    [{ t: '언제' }, { t: '무슨 신고' }, { t: '어떻게 했나' }],
    [
      ['2026-08-28', '사기 의심', U.badge('반려', 'b-mut')],
      ['2026-08-14', '광고·도배', U.badge('경고', 'b-warn')],
      ['2026-07-30', '사기 의심', U.badge('반려', 'b-mut')],
      ['2026-07-11', '욕설·비방', U.badge('경고', 'b-warn')],
      ['2026-06-22', '사기 의심', U.badge('글 삭제', 'b-danger')],
    ])}</div>
    ${U.banner('warn', '⚠', `<b>같은 사유(사기 의심)로 이번이 4번째입니다</b>
      <div class="t-sub mt1">경고 2회가 쌓여 있어요. 규정상 이용 정지를 검토할 자리입니다.</div>`, { cls: 'mt3' })}`)}</div>

  <div class="mt-block">${U.sec('④ 신고된 매물', U.itemRow(it, { href: 'SE-04' }))}</div>
  `;

  const 오른쪽 = `
  ${U.card('무엇을 할까요', `<div class="stack-sm">
    ${ACTIONS.map((a, i) => `<label class="radio${i === 4 ? ' on' : ''}">
      <input type="radio" name="act"${i === 4 ? ' checked' : ''}>
      <b>${a.k}</b><span class="t-sub">${a.d}</span></label>`).join('')}
  </div>
  <div class="sub-fld mt4">
    <label class="lb" for="dy">정지 기간</label>
    <select class="input" id="dy" data-toast="정지 기간을 골랐어요"><option>3일</option><option selected>7일</option><option>30일</option></select>
  </div>`)}

  <div class="mt-block">${U.card('이 문구가 그대로 갑니다', `
    <div class="t-sub mb2">신고한 분(${r.by})에게</div>
    ${U.box(`<p>신고해 주셔서 고맙습니다. 확인 결과 <b>규정 위반이 확인되어</b> 해당 회원에게
      7일 이용 정지 조치를 했습니다. 신고하신 매물도 함께 내렸습니다.</p>`)}
    <div class="t-sub mb2 mt4">신고당한 분(바람개비)에게</div>
    ${U.box(`<p>회원님의 계정이 <b>2026년 9월 7일부터 7일간 정지</b>되었습니다.
      사유는 「거래 전 선입금 유도」이며, 이는 이용약관 제12조에 어긋납니다.
      정지 기간에는 글쓰기와 채팅을 하실 수 없습니다. 이의가 있으시면 고객센터로 알려 주세요.</p>`)}
    <button class="link mt3" type="button" data-toast="문구를 고칠 수 있어요">문구 고치기</button>`)}</div>

  <div class="mt-block">${U.card('내부 메모', `
    <textarea class="input" rows="3" placeholder="회원에게는 안 보여요">같은 사진이 3개 동네에 올라와 있음. 계좌번호 대조 필요.</textarea>`)}</div>

  <div class="mt-block">${U.card('', `
    ${U.btn('조치 확정', { cls: 'btn-pri btn-block btn-lg', attr: ' data-modal="fix"' })}
    <div class="mt2">${U.btn('보류로 두기', { cls: 'btn-ghost btn-block', attr: ' data-modal="hold"' })}</div>
    <div class="mt2">${U.btn('대기열로 돌아가기', { href: 'AD-01', cls: 'btn-ghost btn-block' })}</div>`)}</div>

  <div class="mt-block">${U.card('처리 이력', U.timeline([
    ['접수됨 · 민트초코', '09-07 08:12'],
    ['담당자 지정 · 박서준', '09-07 08:40'],
    ['자료 확인 중', '09-07 09:15'],
    ['조치 확정', ''],
  ], 2))}</div>

  ${U.modal('fix', '이대로 확정할까요?', `
    <p class="t-sub mb3">확정하면 아래가 <b>바로</b> 일어납니다.</p>
    <ul class="dots">
      <li>바람개비님 계정이 <b>7일간 정지</b>됩니다 (9/7 ~ 9/14)</li>
      <li>신고된 매물 <b>1건</b>이 목록에서 내려갑니다</li>
      <li><b>양쪽 모두에게</b> 위 안내 문구가 발송됩니다</li>
      <li>이 회원의 경고 누적이 <b>2회 → 3회</b>가 됩니다</li>
    </ul>
    ${U.banner('warn', '⚠', '되돌리려면 운영 책임자 승인이 필요합니다.', { cls: 'mt3' })}`,
    U.btn('다시 볼게요', { cls: 'btn-ghost', attr: ' data-dismiss' })
    + U.btn('확정', { href: 'AD-01', cls: 'btn-pri' }))}

  ${U.modal('hold', '보류로 둘까요?', `
    <div class="fld"><label class="lb" for="hw">왜 보류하나요</label>
      <textarea class="input" id="hw" rows="3" placeholder="예: 계좌번호 대조 결과를 기다리는 중"></textarea></div>
    <div class="fld"><label class="lb" for="hd">언제 다시 볼까요</label>
      <select class="input" id="hd"><option>내일</option><option selected>3일 뒤</option><option>일주일 뒤</option></select></div>
    <p class="t-sub">그날이 되면 대기열에 다시 올라옵니다.</p>`,
    U.btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })
    + U.btn('보류', { href: 'AD-01', cls: 'btn-pri' }))}
  `;
  return { body: U.proPage('AD-02', U.detail2(왼쪽, 오른쪽)), o: { pro: true } };
}

/* ---------------- AD-03 금지품목·거래규칙 ---------------- */
function AD03() {
  const 본문 = `
  ${U.pageHd('금지품목·거래규칙', '규칙 하나가 매물 수십 개를 내립니다. 저장 전에 숫자를 보세요')}

  ${U.tabs([
    { label: '금지 품목', cnt: BANNED.length, pane: 'bn0' },
    { label: '금지 낱말', cnt: BAN_WORDS.length, pane: 'bn1' },
    { label: '거래 규칙 문구', pane: 'bn2' },
  ], 0)}

  <div class="mt4">
    <div data-pane-body="bn0">
      <div class="row-b wrap-row mb3">
        <p class="t-sub">지금 걸리는 매물 모두 <b>${BANNED.reduce((a, b) => a + (b.on ? b.n : 0), 0)}개</b></p>
        ${U.btn('＋ 품목 추가', { cls: 'btn-ghost btn-sm', attr: ' data-toast="새 줄이 열렸어요"' })}
      </div>
      ${U.table(
    [{ t: '품목', w: '20%' }, { t: '왜 안 되나요' }, { t: '올리면', w: '16%' }, { t: '걸리는 매물', w: '10%' }, { t: '켜기', w: '8%' }, { t: '', w: '10%' }],
    BANNED.map((b, i) => [
      `<b>${b.k}</b>`,
      `<span class="t-sub">${b.why}</span>`,
      `<select class="input" style="width:auto" data-sel-text="act${i}">
        <option${b.act === '바로 숨김' ? ' selected' : ''}>바로 숨김</option>
        <option${b.act === '검토 대기로' ? ' selected' : ''}>검토 대기로</option>
        <option${b.act === '경고만' ? ' selected' : ''}>경고만</option></select>
      <div class="t-sub mt1" data-sel-out="act${i}" data-sel-map='{"바로 숨김":"올리는 즉시 목록에서 빠집니다","검토 대기로":"검토 대기로 넘어가 운영자가 봅니다","경고만":"올린 분에게 경고만 보냅니다"}'>${b.act === '바로 숨김' ? '올리는 즉시 목록에서 빠집니다' : (b.act === '검토 대기로' ? '검토 대기로 넘어가 운영자가 봅니다' : '올린 분에게 경고만 보냅니다')}</div>`,
      b.on ? `<b>${b.n}개</b>` : '<span class="muted">—</span>',
      `<button class="toggle${b.on ? ' on' : ''}" type="button" role="switch" aria-checked="${b.on}" aria-label="${b.k} 규칙"><span class="kn"></span></button>`,
      `<div class="btns">${U.btn('수정', { cls: 'btn-quiet btn-xs', attr: ' data-toast="수정할 수 있게 열었어요"' })}
        ${U.btn('삭제', { cls: 'btn-quiet btn-xs', attr: ' data-toast="품목을 지웠어요" ' })}</div>`,
    ]))}
    </div>

    <div data-pane-body="bn1" hidden>
      ${U.card('금지 낱말', `
        <div class="searchbar mb3">
          <input class="in" type="text" placeholder="막을 낱말">
          <button class="btn btn-pri btn-sm" type="button" data-toast="낱말을 더했어요 · 지금 이 말이 든 매물이 몇 개인지 세었습니다">추가</button>
        </div>
        <div class="chips">
          ${BAN_WORDS.map((w, i) => `<button class="chip on" type="button">${w}<span class="cnt">${[12, 4, 9, 2, 21, 7, 3][i] || 1}</span> <span class="x">✕</span></button>`).join('')}
        </div>
        <p class="t-sub mt3">칩 옆 숫자는 <b>지금 그 말이 든 매물 수</b>입니다.</p>`)}

      <div class="mt-block">${U.card('이 낱말은 걸지 않기 (예외)', `
        <p class="t-sub mb3">「담배 케이스」처럼 금지 낱말이 들어 있지만 팔아도 되는 것들이에요.</p>
        <div class="chips">
          ${BAN_EXCEPT.map((w) => `<button class="chip on" type="button">${w} <span class="x">✕</span></button>`).join('')}
        </div>`)}</div>

      <div class="mt-block">${U.banner('warn', '⚠', `<b>「주류」는 너무 흔한 말이에요</b>
        <div class="t-sub mt1">지금 걸면 「주류 진열장」·「주류 냉장고」 같은 매물 9개도 함께 걸립니다.
        예외 낱말을 먼저 넣어 주세요.</div>`)}</div>
    </div>

    <div data-pane-body="bn2" hidden>
      ${U.card('이용안내 화면에 그대로 나가는 글', `
        <textarea class="input" rows="8">회원 간 거래의 책임은 거래 당사자에게 있습니다. ${SITE.name}는 통신판매중개자로서 거래 당사자가 아닙니다.

다만 안전결제로 거래한 건에 대해서는, 물건이 설명과 다를 때 양쪽의 자료를 확인해 환불 여부를 판단합니다.</textarea>
        <p class="t-sub mt2">이 글은 <a class="link" href="${U.link('HO-03')}">안전거래·이용안내</a> 화면에 그대로 나갑니다.</p>
        <div class="btns mt3">
          ${U.btn('미리보기', { href: 'HO-03', cls: 'btn-ghost' })}
          ${U.btn('이전 글과 견주기', { cls: 'btn-ghost', attr: ' data-toast="바뀐 줄만 표시했어요"' })}
        </div>`)}
    </div>
  </div>

  <div class="mt-block">${U.card('저장하기 전에 미리 재보기', `
    <p class="t-sub mb3">지금 올라와 있는 매물 전체에 이 규칙을 걸어 보고, 몇 개가 걸리는지만 세어 봅니다. 저장은 안 해요.</p>
    ${U.btn('미리 재보기', { cls: 'btn-ghost', attr: ' data-toast="매물 7,200개에 걸어 봤어요 · 34개가 걸립니다"' })}
    <div class="mt4">${U.statRow([
      ['7,200개', '재본 매물'],
      ['34개', '걸리는 매물'],
      ['5개', '잘못 걸릴 것 같은 것', { cls: 'danger' }],
    ], 'g3')}</div>
    <div class="mt4">${U.table([{ t: '잘못 걸릴 것 같은 매물' }, { t: '걸린 까닭', w: '26%' }, { t: '', w: '14%' }],
      [
        ['담배 케이스 (가죽, 미사용)', '「담배」', U.btn('예외로', { cls: 'btn-ghost btn-xs', attr: ' data-toast="예외 낱말에 넣었어요"' })],
        ['주류 진열장 3단', '「주류」', U.btn('예외로', { cls: 'btn-ghost btn-xs', attr: ' data-toast="예외 낱말에 넣었어요"' })],
        ['위스키 잔 세트 4개', '「위스키」', U.btn('예외로', { cls: 'btn-ghost btn-xs', attr: ' data-toast="예외 낱말에 넣었어요"' })],
      ])}</div>`)}</div>

  <div class="mt-block">${U.card('잘못 걸려 이의 제기된 것', U.table(
    [{ t: '매물' }, { t: '올린 분', w: '14%' }, { t: '걸린 까닭', w: '16%' }, { t: '언제', w: '12%' }, { t: '', w: '16%' }],
    [
      ['담배 케이스 (가죽, 미사용)', '초록나무', '「담배」', '9/6', U.btn('되살리기', { cls: 'btn-ghost btn-xs', attr: ' data-toast="매물을 되살렸어요 · 올린 분에게 알렸습니다"' })],
      ['수제 잼 (미개봉 선물용)', '해질녘', '수제 식품', '9/4', U.btn('되살리기', { cls: 'btn-ghost btn-xs', attr: ' data-toast="매물을 되살렸어요 · 올린 분에게 알렸습니다"' })],
    ]))}</div>

  <div class="mt-block">${U.card('바뀐 이력', U.table(
    [{ t: '언제', w: '14%' }, { t: '누가', w: '12%' }, { t: '무엇을' }],
    [
      ['2026-09-03', '박서준', '「모조품·이미테이션」 조치를 검토 대기로 → 바로 숨김으로 바꿈'],
      ['2026-08-27', '이도현', '「수제 식품」 규칙을 껐음 (신고보다 이의 제기가 많아서)'],
      ['2026-08-14', '박서준', '금지 낱말에 「처방약」 추가'],
    ]))}</div>

  `;
  const 아래바 = U.stickBar(`<span class="t-sub">저장하면 매물 <b>34개</b>가 숨겨집니다</span>`,
    U.btn('영향받는 매물 보기', { cls: 'btn-ghost', attr: ' data-toast="34개 목록을 열었어요"' })
    + U.btn('저장', { cls: 'btn-pri', attr: ' data-toast="규칙을 저장했어요 · 매물 34개가 숨겨졌습니다"' }));
  return { body: U.proPage('AD-03', 본문), o: { pro: true, stick: 아래바 } };
}

/* ---------------- AD-04 안전결제 정산·분쟁 ---------------- */
function AD04() {
  const 대기 = SETTLES.filter((s) => s.st === '정산대기');
  const 완료 = SETTLES.filter((s) => s.st === '정산완료');
  const 분쟁 = SETTLES.filter((s) => s.st === '분쟁');
  const 보관중 = 대기.reduce((a, s) => a + s.price, 0) + 분쟁.reduce((a, s) => a + s.price, 0);
  const 수수료합 = SETTLES.reduce((a, s) => a + fee(s.price), 0);

  const 표 = (것들) => U.table(
    [{ t: '거래번호', w: '11%' }, { t: '물건' }, { t: '구매자', w: '10%' }, { t: '판매자', w: '10%' },
    { t: '결제액', w: '10%' }, { t: '수수료', w: '9%' }, { t: '수령액', w: '10%' },
    { t: '정산일', w: '9%' }, { t: '', w: '10%' }],
    것들.map((s) => {
      const it = itemBy(s.item);
      return [
        s.no,
        `<div class="row-c" style="gap:8px">${U.phItem(30, it.id)}<span>${U.esc(it.t)}</span></div>`,
        s.buyer, s.seller,
        U.won(s.price), `− ${U.won(fee(s.price))}`, `<b>${U.won(payout(s.price))}</b>`,
        s.due,
        s.st === '분쟁'
          ? U.btn('분쟁 보기', { cls: 'btn-pri btn-xs', attr: ' data-toast="아래 분쟁 판단으로 내려갑니다"' })
          : U.btn('정산 보류', { cls: 'btn-ghost btn-xs', attr: ' data-modal="hold2"' }),
      ];
    }),
    {
      foot: ['합계', '', '', '',
        `<b>${U.won(것들.reduce((a, s) => a + s.price, 0))}</b>`,
        `<b>− ${U.won(것들.reduce((a, s) => a + fee(s.price), 0))}</b>`,
        `<b>${U.won(것들.reduce((a, s) => a + payout(s.price), 0))}</b>`, '', ''],
    });

  const 본문 = `
  ${U.pageHd('안전결제 정산·분쟁', '남의 돈을 다루는 화면입니다. 숫자가 서로 맞는지 늘 확인하세요')}

  <div class="g4">
    <div class="stat"><div class="n" data-recalc-out="term" data-i="0">${U.won(보관중)}</div>
      <div class="l">지금 보관 중인 돈</div><div class="d">구매확정 전이라 아직 판매자에게 안 간 돈이에요</div></div>
    <div class="stat"><div class="n" data-recalc-out="term" data-i="1">${U.won(대기.reduce((a, s) => a + payout(s.price), 0))}</div>
      <div class="l">이번 주 정산 예정</div></div>
    <div class="stat danger"><div class="n" data-recalc-out="term" data-i="2">${분쟁.length}건</div>
      <div class="l">분쟁 진행</div></div>
    <div class="stat"><div class="n" data-recalc-out="term" data-i="3">${U.won(수수료합)}</div>
      <div class="l">고른 기간 수수료 수입</div></div>
  </div>

  <div class="mt-block">
  ${U.tabs([
    { label: '정산 대기', cnt: 대기.length, pane: 'st0' },
    { label: '정산 완료', cnt: 완료.length, pane: 'st1' },
    { label: '분쟁', cnt: 분쟁.length, pane: 'st2' },
  ], 0)}

  <div class="row-c wrap-row mt4 mb3" style="gap:8px">
    <select class="input" style="width:auto" data-recalc="term"
      ><option selected data-vals="${U.won(보관중)}|${U.won(대기.reduce((a, s) => a + payout(s.price), 0))}|${분쟁.length}건|${U.won(수수료합)}">이번 달</option
      ><option data-vals="0원|0원|1건|${U.won(Math.round(수수료합 * 2.4))}">지난 달</option
      ><option data-vals="${U.won(보관중)}|${U.won(대기.reduce((a, s) => a + payout(s.price), 0))}|${분쟁.length}건|${U.won(Math.round(수수료합 * 3.4))}">올해 전체</option></select>
    <div class="searchbar" style="max-width:280px">
      <input class="in" type="search" placeholder="거래번호·닉네임으로 찾기">
      <button class="btn btn-ghost btn-sm" type="button" data-toast="찾은 결과만 보여드릴게요">찾기</button>
    </div>
    <button class="btn btn-ghost btn-sm" type="button" style="margin-left:auto" data-toast="정산 내역 파일을 만들었어요">내보내기</button>
  </div>

  <div>
    <div data-pane-body="st0">${표(대기)}
      ${U.banner('ok', '🧮', `<b>합계가 맞습니다</b>
        <div class="t-sub mt1">결제액 ${U.won(대기.reduce((a, s) => a + s.price, 0))} − 수수료 ${U.won(대기.reduce((a, s) => a + fee(s.price), 0))}
        = 수령액 ${U.won(대기.reduce((a, s) => a + payout(s.price), 0))}</div>`, { cls: 'mt3' })}
    </div>
    <div data-pane-body="st1" hidden>${표(완료)}</div>
    <div data-pane-body="st2" hidden>${표(분쟁)}</div>
  </div>
  </div>

  <div class="mt-block">${U.sec('분쟁 판단 — ' + DISPUTE.no, U.card('', `
    <div class="split-2">
      <div class="side-a">
        <div class="row-c wrap-row mb2">${U.badge('구매자', 'b-pri')}<b>${DISPUTE.buyer.nick}</b>
          <span class="t-sub">${DISPUTE.buyer.at}</span></div>
        <p>${U.esc(DISPUTE.buyer.say)}</p>
        <div class="row wrap-row mt3" style="gap:8px">
          ${[1, 2, 3].map((n) => U.phItem(88, 'db' + n)).join('')}
        </div>
      </div>
      <div class="side-b">
        <div class="row-c wrap-row mb2">${U.badge('판매자', 'b-acc')}<b>${DISPUTE.seller.nick}</b>
          <span class="t-sub">${DISPUTE.seller.at}</span></div>
        <p>${U.esc(DISPUTE.seller.say)}</p>
        <div class="row wrap-row mt3" style="gap:8px">
          ${[1, 2].map((n) => U.phItem(88, 'ds' + n)).join('')}
        </div>
      </div>
    </div>

    <div class="mt-block">${U.kv([
    ['물건', U.esc(itemBy('i5').t)],
    ['결제액', U.won(285000)],
    ['수수료', U.won(fee(285000))],
    ['판매자 수령 예정', U.won(payout(285000))],
    ['상태', U.badge('정산 보류 중', 'b-warn')],
  ])}</div>

    <div class="mt-block">
      <b class="t-card">어떻게 판단할까요</b>
      <div class="stack-sm mt3">
        <label class="radio"><input type="radio" name="dj"><b>구매자에게 전액 환불</b>
          <span class="t-sub">${U.won(285000)}을 구매자에게 돌려주고 판매자에게는 아무것도 가지 않습니다</span></label>
        <label class="radio"><input type="radio" name="dj"><b>판매자에게 정산</b>
          <span class="t-sub">${U.won(payout(285000))}이 판매자에게 갑니다</span></label>
        <label class="radio on"><input type="radio" name="dj" checked><b>일부 환불</b>
          <span class="t-sub">아래에 적은 금액을 구매자에게 돌려주고 나머지를 정산합니다</span></label>
      </div>
      <div class="sub-fld mt3">
        <div class="row-c" style="gap:8px">
          <input class="input" type="text" inputmode="numeric" value="50,000" style="flex:1">
          <span class="nowrap">원 환불</span>
        </div>
        <p class="t-sub mt2">구매자에게 ${U.won(50000)} · 판매자에게 ${U.won(payout(285000) - 50000)}</p>
      </div>
      <div class="fld mt4"><label class="lb" for="why2">판단 근거 (반드시 적어 주세요)</label>
        <textarea class="input" id="why2" rows="3" placeholder="양쪽 사진과 대화를 보고 무엇을 근거로 판단했는지">판매자 포장 사진에 조이콘 흠집이 이미 보임. 게임 칩은 두 개 모두 확인됨. 흠집만 인정해 일부 환불.</textarea></div>
    </div>

    <div class="mt-block">
      <b class="t-card">양쪽에 갈 문구</b>
      <div class="t-sub mt3 mb2">구매자에게</div>
      ${U.box(`<p>양쪽 자료를 확인했습니다. 판매자 포장 사진에서 조이콘 흠집이 이미 확인되어
        <b>${U.won(50000)}을 환불</b>합니다. 게임 칩은 두 개 모두 보낸 것으로 확인되었습니다.</p>`)}
      <div class="t-sub mt4 mb2">판매자에게</div>
      ${U.box(`<p>흠집을 판매글에 적지 않으신 점이 확인되어 <b>${U.won(50000)}을 구매자에게 환불</b>하고,
        나머지 <b>${U.won(payout(285000) - 50000)}</b>을 정산합니다.</p>`)}
    </div>
  `))}</div>

  ${U.modal('hold2', '정산을 보류할까요?', `
    <div class="fld"><label class="lb" for="hw2">왜 보류하나요</label>
      <textarea class="input" id="hw2" rows="3" placeholder="판매자에게 그대로 전달됩니다"></textarea></div>
    <p class="t-sub">보류하면 정산일이 지나도 돈이 나가지 않습니다. 판매자에게 사유가 전달됩니다.</p>`,
    U.btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })
    + U.btn('보류', { cls: 'btn-pri', attr: ' data-dismiss data-toast="정산을 보류했어요 · 판매자에게 알렸습니다"' }))}

  `;
  const 아래바 = U.stickBar(`<span class="t-sub">확정하면 <b>${U.won(50000)}</b>이 구매자에게, <b>${U.won(payout(285000) - 50000)}</b>이 판매자에게 갑니다</span>`,
    U.btn('더 알아보기', { cls: 'btn-ghost', attr: ' data-toast="양쪽에 추가 자료를 요청했어요"' })
    + U.btn('판단 확정', { cls: 'btn-pri', attr: ' data-toast="판단을 확정했어요 · 양쪽에 알렸습니다"' }));
  return { body: U.proPage('AD-04', 본문), o: { pro: true, stick: 아래바 } };
}

/* ---------------- AD-05 운영자 로그인 ---------------- */
function AD05() {
  const body = U.soloBox('운영자 로그인', '',
    `${U.banner('info', '👤', `<b>회원 로그인과 다른 곳이에요</b>
      <div class="t-sub mt1">이웃과 물건을 사고파시려면 <a class="link" href="${U.link('HO-01')}">앞 화면</a>에서 로그인해 주세요.</div>`)}

    <div class="fld mt4"><label class="lb" for="em">이메일</label>
      <input class="input" id="em" type="email" placeholder="운영자 계정 이메일" value="admin@example.com"></div>
    <div class="fld"><label class="lb" for="pw">비밀번호</label>
      <input class="input" id="pw" type="password" placeholder="비밀번호"></div>

    ${U.banner('warn', '⚠', `<b>이메일 또는 비밀번호가 맞지 않아요</b>
      <div class="t-sub mt1">남은 시도 <b>3회</b> · 5회 실패하면 30분 동안 잠깁니다.</div>`, { cls: 'mt3' })}

    <div class="mt4">${U.btn('로그인', { href: 'AD-01', cls: 'btn-pri btn-block btn-lg' })}</div>

    <div class="center mt4"><button class="link quiet" type="button" data-modal="pwfind">비밀번호를 잊으셨나요?</button></div>

    <div class="mt-block">
      <div class="t-sub mb3">로그인이 지나가면 이 화면이 나옵니다</div>
      ${U.card('2단계 인증', `
        <p class="t-sub mb3">등록한 휴대폰으로 보낸 <b>6자리 숫자</b>를 적어 주세요.</p>
        <div class="otp">${[1, 2, 3, 4, 5, 6].map(() => '<input class="input" type="text" inputmode="numeric" maxlength="1" aria-label="인증번호 한 자리">').join('')}</div>
        <div class="row-b mt3">
          <span class="t-sub">남은 시간 <b>2:47</b></span>
          <button class="link" type="button" data-toast="인증번호를 다시 보냈어요">코드 다시 받기</button>
        </div>`)}
    </div>

    <div class="mt-block">${U.box(`<b class="t-card">임시 비밀번호로 들어오셨다면</b>
      <p class="t-sub mt2">바로 새 비밀번호를 정하는 화면으로 넘어갑니다. 건너뛸 수 없어요.</p>`)}</div>

    <p class="t-sub mt-block center">모든 접속은 기록됩니다.</p>

    ${U.modal('pwfind', '비밀번호 찾기', `
      <p class="t-sub mb3">가입한 이메일을 적어 주시면 재설정 링크를 보내드려요.</p>
      <input class="input" type="email" placeholder="이메일">
      <p class="t-sub mt3">계정이 있는지 없는지는 알려드리지 않습니다. 있는 경우에만 메일이 갑니다.</p>`,
      U.btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })
      + U.btn('링크 보내기', { cls: 'btn-pri', attr: ' data-dismiss data-toast="메일을 보냈어요 (계정이 있는 경우)"' }))}
    `, { lg: true });

  return { body, o: { solo: true } };
}

export const PAGES = { 'AD-01': AD01, 'AD-02': AD02, 'AD-03': AD03, 'AD-04': AD04, 'AD-05': AD05 };
