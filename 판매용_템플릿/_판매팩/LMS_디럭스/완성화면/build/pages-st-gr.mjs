/* ST 학생 관리 · GR 출결·평가 */
import * as U from './ui.mjs';
import { STUDENTS, ASSIGNMENTS, CURRICULUM, TREND, QNA, COURSES, byId } from './data.mjs';

const P = {};
export default P;

const C = byId('C01');
const pgKey = (p) => (p === 0 ? 'none' : p < 50 ? 'low' : p < 80 ? 'mid' : 'high');
const courseSel = (id = 'course-sel') => `<select class="input" style="width:280px" id="${id}" aria-label="강의 고르기"
  data-toast="고른 강의의 수강생으로 바뀝니다">${COURSES.slice(0, 4).map((c) => `<option>${c.name}</option>`).join('')}</select>`;

/* ================= ST-01 수강생 목록 ================= */
P['ST-01'] = () => {
  const rows = STUDENTS.map((s) => ({
    attr: ` data-tags="pg:${pgKey(s.pct)}" data-q="${s.nm} ${s.mail}"`,
    cells: [
      `<input class="selbox" type="checkbox" data-selgroup="st" aria-label="${s.nm} 고르기">`,
      { t: `<a href="${U.link('ST-03')}"><b>${s.nm}</b></a>`, v: s.nm },
      { t: `<span class="t-sub">${s.mail}</span>`, v: s.mail },
      { t: s.from, v: s.from },
      { t: `<div style="min-width:130px">${U.barRow(s.pct)}</div>`, v: s.pct },
      { t: s.hw + '/3', v: s.hw, cls: 'right' },
      { t: s.last, v: s.last },
      U.badge(s.st, s.st === '수료 가능' ? 'b-ok' : s.st === '진도 미달' ? 'b-warn' : s.st === '미시작' ? 'b-mut' : 'b-pri'),
      `<a class="btn btn-ghost btn-sm" href="${U.link('ST-03')}">보기</a>`,
    ],
  }));

  const body = `
${U.pageHd('수강생 목록', '진도율 머리글을 누르면 그 기준으로 정렬됩니다', `
  ${U.btnSay('엑셀로 내려받기', '내려받기는 서버가 연결되면 동작합니다', { cls: 'btn-ghost' })}
  ${U.btn('진도 미달자 관리', { cls: 'btn-soft', href: 'ST-04' })}`)}

<div class="g4 mb6">
  ${U.stat('전체 수강생', '128', { unit: '명', ico: '👥', delta: 12, spark: U.spark([88, 96, 104, 110, 118, 124, 128]) })}
  ${U.stat('평균 진도율', '58', { unit: '%', ico: '📈', cls: 's-acc', delta: 4, deltaUnit: '%p', spark: U.spark([41, 45, 48, 51, 54, 56, 58]) })}
  ${U.stat('수료 가능', '38', { unit: '명', ico: '🎓', cls: 's-ok', delta: 6, spark: U.spark([18, 22, 26, 29, 33, 35, 38]) })}
  ${U.stat('진도 미달', '32', { unit: '명', ico: '⚠️', cls: 's-mut s-ink', delta: -3, spark: U.spark([41, 39, 38, 36, 35, 33, 32]) })}
</div>

<div class="card mb4"><div class="card-bd">
  <div class="row-b wrap-row">
    ${courseSel()}
    <div class="grow" style="min-width:200px"><input class="input" type="search" placeholder="이름·이메일로 찾기 — 치는 대로 걸러집니다" data-search="st" aria-label="수강생 검색"></div>
    <a class="btn btn-primary" href="${U.link('ST-02')}">검색</a>
  </div>
  <div class="mt3">${U.fchips('st', 'pg', ['*', ['none', '미시작'], ['low', '1~49%'], ['mid', '50~79%'], ['high', '80% 이상']], { allLabel: '전체' })}</div>
  <div class="row-b wrap-row mt3">
    <span class="t-sub">지금 <b class="pri" data-fcount="st">${STUDENTS.length}</b>명을 보고 있어요 · 고른 사람 <b class="pri" data-selcount="st">0</b>명</span>
    <a class="btn btn-primary is-off" href="${U.link('ST-05')}" data-selneed="st">선택한 <b data-selcount="st">0</b>명에게 알림 보내기</a>
  </div>
</div></div>

${U.table(
    [{ t: `<input type="checkbox" data-selall="st" aria-label="전체 고르기">`, w: '44px' },
    { t: '이름', sort: 'text', w: '110px' }, { t: '이메일', sort: 'text' }, { t: '수강 시작', sort: 'text', w: '116px' },
    { t: '진도율', sort: 'num', w: '180px' }, { t: '과제', sort: 'num', w: '80px' }, { t: '최근 접속', sort: 'text', w: '116px' },
    { t: '상태', w: '110px' }, { t: '', w: '70px' }],
    rows, { scroll: true, bodyAttr: ' data-list="st"' })}
<div data-list-empty="st" hidden class="mt4">${U.empty('🔍', '조건에 맞는 수강생이 없어요', '조건을 하나씩 풀어 보세요',
      `<button class="btn btn-primary" type="button" data-freset="st">필터 초기화</button>`)}</div>
`;
  return { body, o: { admin: true, search: false } };
};

/* ================= ST-02 수강생 목록 · 검색 결과 없음 ================= */
P['ST-02'] = () => {
  const rows = STUDENTS.map((s) => ({
    attr: ` data-tags="pg:${pgKey(s.pct)}" data-q="${s.nm} ${s.mail}"`,
    cells: [
      { t: `<b>${s.nm}</b>`, v: s.nm }, `<span class="t-sub">${s.mail}</span>`, s.from,
      { t: `<div style="min-width:130px">${U.barRow(s.pct)}</div>`, v: s.pct }, s.last,
      U.badge(s.st, s.st === '수료 가능' ? 'b-ok' : 'b-pri'),
    ],
  }));

  const body = `
${U.pageHd('수강생 목록', '조건에 맞는 사람을 찾지 못했어요')}

<div class="card mb4"><div class="card-bd">
  <div class="row-b wrap-row">
    ${courseSel()}
    <div class="grow" style="min-width:200px"><input class="input" type="search" value="김민준" data-search="st" aria-label="수강생 검색"></div>
  </div>
  <div class="mt3"><span class="t-sub">걸어 둔 조건</span>
    <div class="chips mt2" data-chipbar="st"></div></div>
  <p class="t-sub mt2">칩의 ✕를 누르거나 검색어를 지우면 목록이 다시 나타납니다</p>
</div></div>

<div data-list-empty="st">${U.empty('🔍', '조건에 맞는 수강생이 없어요',
    '이 강의의 전체 수강생은 <b>128명</b>이에요. 이름 대신 이메일 앞자리로 찾아보시거나, 진도 구간 조건을 풀어 보세요.',
    `<button class="btn btn-primary" type="button" data-freset="st">필터 초기화</button>
     <a class="btn btn-ghost" href="${U.link('ST-01')}">수강생 목록으로</a>`)}</div>

<div class="mt6">${U.card('검색 요령', `<ul class="list-plain">
  <li>· 이름은 <b>성을 뺀 두 글자</b>로도 찾을 수 있어요 (예 · 서준)</li>
  <li>· 이메일은 @ 앞부분만 넣어도 됩니다</li>
  <li>· 진도 구간과 검색어는 <b>함께</b> 걸립니다. 둘 다 맞아야 나와요</li>
</ul>`, { bdCls: 'tight' })}</div>

${U.table([{ t: '이름', sort: 'text' }, '이메일', '수강 시작', { t: '진도율', sort: 'num' }, '최근 접속', '상태'],
      rows, { scroll: true, bodyAttr: ' data-list="st" data-finit=\'{"__q":"김민준"}\'', cls: 'mt6' })}
`;
  return { body, o: { admin: true, search: false } };
};

/* ================= ST-03 수강생 상세 · 진도 현황 ================= */
P['ST-03'] = () => {
  const s = STUDENTS[3];
  const body = `
${U.pageHd('수강생 상세', C.name, `
  ${U.btn('메시지 보내기', { cls: 'btn-primary', href: 'ST-05' })}
  ${U.btn('과제 채점하기', { cls: 'btn-ghost', href: 'GR-03' })}`)}

${U.card('', `<div class="row wrap-row" style="gap:var(--s6);align-items:center">
  ${U.ph('프로필', 'ph-ava', s.nm)}
  <div class="grow" style="min-width:220px">
    <h2 class="t-sec">${s.nm}</h2>
    <p class="t-sub">${s.mail} · 수강 시작 ${s.from} · 최근 접속 ${s.last}</p>
    <div class="badges mt2">${U.badge(s.st, 'b-pri')}${U.badge('과제 ' + s.hw + '/3', 'b-line')}${U.badge('질문 2건', 'b-line')}</div>
  </div>
  <div class="center" style="flex:none">
    <div class="t-page pri">${s.pct}<small style="font-size:20px">%</small></div>
    <div class="t-sub">전체 진도율</div>
    <div style="width:160px" class="mt2">${U.bar(s.pct)}</div>
  </div>
</div>`)}

<div class="mt6">
${U.tabs([{ label: '차시별 진도', pane: 'p1' }, { label: '과제', pane: 'p2' }, { label: '질문 이력', pane: 'p3' }, { label: '학습 시간', pane: 'p4' }], 0, { panes: 'std' })}
<div data-pane-set="std">
  ${U.pane('p1', `${CURRICULUM.map((ch) => `<div class="cur-ch">
    <button class="hd" type="button"><span>${ch.ch}</span>
      <span class="t-sub">${ch.lessons.filter((l) => l.done).length}/${ch.lessons.length}차시</span></button>
    <div class="body"><div>${ch.lessons.map((l) => `<div class="acc-item" style="padding:0 var(--gap-title)">
      <button class="acc-q" type="button"><span class="row-c">
        <span class="st" style="width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:11px;background:${l.done ? 'rgba(15,122,82,.14)' : 'var(--bg)'};color:${l.done ? 'var(--success)' : 'var(--muted)'}">${l.done ? '✓' : l.no}</span>
        <span>${l.no}. ${l.t}</span></span>
        <span class="t-sub" style="margin-left:auto">${l.done ? l.min + '분 시청' : '미시청'}</span><span class="mk">＋</span></button>
      <div class="acc-a"><div><div class="in">${l.done
      ? `처음 본 날 2026-07-${String(10 + l.no).padStart(2, '0')} · 마지막으로 본 날 2026-08-0${(l.no % 5) + 1} · 시청 횟수 ${(l.no % 3) + 1}회 · 완료율 100%`
      : '아직 열어 보지 않은 차시예요.'}</div></div></div>
    </div>`).join('')}</div></div></div>`).join('')}`, true)}

  ${U.pane('p2', U.table(['과제', '제출일', '점수', '피드백'], [
        ['1장 과제 — 표를 표답게', '2026-06-14', '<b>28</b>/30', '표 서식 적용이 정확합니다'],
        ['2장 과제 — 월별 매출표', '2026-07-27', '<b>27</b>/30', '증감 계산에서 부호가 한 곳 반대예요'],
        ['3장 과제 — 대시보드', '미제출', '—', '<span class="muted">마감 D-3</span>'],
      ]))}

  ${U.pane('p3', U.card('', `<ul class="list-plain">${QNA.slice(0, 3).map((q) => `<li>
    <span class="grow">${q.t}<div class="t-sub">${q.ep} · ${q.at}</div></span>
    ${U.badge(q.answered ? '답변 완료' : '답변 대기', q.answered ? 'b-ok' : 'b-warn')}</li>`).join('')}</ul>`, { bdCls: 'tight' }))}

  ${U.pane('p4', `
    ${U.tabs([{ label: '7일', swap: 'std:7' }, { label: '30일', swap: 'std:30' }, { label: '90일', swap: 'std:90' }], 1, { pill: true })}
    <div data-swap-set="std">
      ${[7, 30, 90].map((d) => `<div data-swap-key="${d}"${d === 30 ? '' : ' hidden'}>
        ${U.card('', `<div class="row-b wrap-row mb4">
          <div><div class="t-sub">최근 ${d}일 학습 시간</div><div class="t-sec">${Math.round(TREND[d].reduce((a, b) => a + b, 0) / 4)}분</div></div>
          <div><div class="t-sub">하루 평균</div><div class="t-sec">${Math.round(TREND[d].reduce((a, b) => a + b, 0) / TREND[d].length / 4)}분</div></div>
        </div>${U.lineChart(TREND[d], { alt: `최근 ${d}일 학습 시간 추이`, h: 200 })}`)}
      </div>`).join('')}
    </div>`)}
</div></div>`;
  return { body, o: { admin: true, search: false } };
};

/* ================= ST-04 진도 미달자 관리 ================= */
P['ST-04'] = () => {
  const rows = STUDENTS.map((s) => `<tr data-progress="${s.pct}" data-days="${s.days}">
    <td><input class="selbox" type="checkbox" data-selgroup="lag" aria-label="${s.nm} 고르기"></td>
    <td><b>${s.nm}</b><div class="t-sub">${s.mail}</div></td>
    <td><div style="min-width:130px">${U.barRow(s.pct)}</div></td>
    <td>${s.last}</td>
    <td class="right"><b class="${s.days >= 14 ? 'danger' : ''}">${s.days}일</b></td>
    <td>${U.badge(s.st, s.st === '진도 미달' ? 'b-warn' : s.st === '미시작' ? 'b-mut' : 'b-pri')}</td>
  </tr>`).join('');

  const body = `
${U.pageHd('진도 미달자 관리', '기준을 움직이면 대상 인원과 목록이 그 자리에서 다시 계산됩니다')}

<div class="split-r" data-calc-lag>
  <div>
    <div class="card mb4"><div class="card-bd">
      <div class="row-b wrap-row" style="gap:var(--s6)">
        <div class="grow" style="min-width:240px">
          <label class="lb" for="lag-progress">진도율 <b class="pri" id="lag-out">40%</b> 미만</label>
          <input class="slider" type="range" id="lag-progress" min="0" max="100" step="5" value="40" data-out="#lag-out" data-unit="%" data-calc>
        </div>
        <div style="width:200px">
          <label class="lb" for="lag-days">며칠 이상 미접속</label>
          <div class="input-row"><input class="input" type="number" id="lag-days" value="7" min="0" max="90" data-calc><span class="btn btn-ghost">일</span></div>
        </div>
      </div>
      <div class="row-b wrap-row mt4">
        <span class="t-sub">이 기준에 걸린 사람 <b class="pri" data-out-lag>0</b>명 · 고른 사람 <b class="pri" data-selcount="lag">0</b>명</span>
        <a class="btn btn-primary is-off" href="${U.link('ST-05')}" data-selneed="lag">선택한 <b data-selcount="lag">0</b>명에게 독려 메시지 보내기</a>
      </div>
    </div></div>

    <div class="table-wrap table-scroll"><table class="table">
      <thead><tr>
        <th style="width:44px"><input type="checkbox" data-selall="lag" aria-label="전체 고르기"></th>
        <th>이름</th><th style="width:190px">진도율</th><th style="width:120px">마지막 접속</th>
        <th style="width:110px">미접속</th><th style="width:110px">상태</th></tr></thead>
      <tbody id="lag-rows">${rows}</tbody></table></div>
  </div>

  <aside class="sticky">
    ${U.card('기준을 어떻게 잡을까요', `<ul class="list-plain">
      <li>· <b>진도율 40% · 7일</b>이 기본값입니다</li>
      <li>· 기준을 낮추면 대상이 늘고, 높이면 줄어요</li>
      <li>· 미접속 일수만 크게 잡으면 <b>이미 다 들은 분</b>도 걸립니다</li>
      <li>· 보통 한 달에 한 번 보내는 것이 적당합니다</li>
    </ul>`, { bdCls: 'tight' })}
    <div class="mt4">${U.card('최근 보낸 독려', `<ul class="list-plain">
      <li><span class="grow">7월 진도 독려<div class="t-sub">2026-07-08 · 41명</div></span>${U.badge('열람 62%', 'b-ok')}</li>
      <li><span class="grow">6월 진도 독려<div class="t-sub">2026-06-10 · 38명</div></span>${U.badge('열람 55%', 'b-ok')}</li>
    </ul>`, { bdCls: 'tight' })}</div>
  </aside>
</div>`;
  return { body, o: { admin: true, search: false } };
};

/* ================= ST-05 알림 발송 ================= */
P['ST-05'] = () => {
  const body = `
${U.pageHd('알림 발송', '보내기 전에 미리보기로 확인해 주세요')}

<div class="split-r">
  <div>
    ${U.card('받는 사람', `
      <div class="row-b wrap-row"><div><div class="t-sub">지금 고른 사람</div>
        <div class="t-sec"><b class="pri" data-selcount="rcv" data-base="7">12</b>명에게 보냅니다</div></div>
        ${U.badge('진도 미달 조건으로 고름', 'b-warn')}</div>
      ${U.accordion([{
    q: '받는 사람 목록 펼쳐 보기', a: `<div style="max-height:260px;overflow-y:auto">
      ${STUDENTS.map((s) => `<label class="check" style="display:flex;padding:6px 0;border-bottom:1px solid var(--border)">
        <input class="selbox" type="checkbox" data-selgroup="rcv" ${s.pct < 50 ? 'checked' : ''}>
        <span class="grow"><b>${s.nm}</b> <span class="t-sub">${s.mail} · 진도 ${s.pct}%</span></span></label>`).join('')}
      </div><p class="t-sub mt3">체크를 바꾸면 위 「N명에게 보냅니다」가 함께 바뀝니다</p>`,
  }], { single: true })}`, { bdCls: 'tight' })}

    <div class="mt4">${U.card('보내는 방법', `
      <div class="checks">
        <label class="check"><input type="checkbox" checked data-gate="send" data-label="발송 채널"><span><b>이메일</b> <span class="t-sub">· 등록된 메일 주소로</span></span></label>
        <label class="check"><input type="checkbox" checked><span><b>앱 푸시</b> <span class="t-sub">· 앱을 설치한 분에게만</span></span></label>
        <label class="check"><input type="checkbox"><span><b>문자</b> <span class="t-sub">· 건당 20원이 차감됩니다</span></span></label>
      </div>`)}</div>

    <div class="mt4">${U.card('내용', `
      <div class="field"><label class="lb" for="tpl-sel">문구 틀</label>
        <select class="input" id="tpl-sel" data-tplsel>
          <option data-t="[배움터] 진도가 조금 밀렸어요" data-b="{이름}님, 「{강의명}」 진도가 {진도율}에서 멈춰 있어요. 오늘 한 차시만 들어도 흐름이 이어집니다.">진도 독려</option>
          <option data-t="[배움터] 과제 마감이 다가와요" data-b="{이름}님, 「{강의명}」 3장 과제 마감이 사흘 남았어요. 제출하면 수료 조건 하나를 채우게 됩니다.">과제 마감 안내</option>
          <option data-t="[배움터] 알려 드릴 것이 있어요" data-b="{이름}님, 「{강의명}」 수강생께 안내드립니다.">공지</option>
        </select>
        <div class="help">틀을 고르면 아래 제목·본문과 미리보기가 그 틀로 바뀝니다</div></div>

      <div class="field"><label class="lb" for="msg-t">제목</label>
        <input class="input" id="msg-t" value="[배움터] 진도가 조금 밀렸어요" data-charcount="mt" data-gate="send" data-label="제목"></div>
      <div class="field"><label class="lb" for="msg-b">본문</label>
        <textarea class="input" id="msg-b" style="min-height:160px" data-charcount="mb" data-gate="send" data-label="본문">{이름}님, 「{강의명}」 진도가 {진도율}에서 멈춰 있어요. 오늘 한 차시만 들어도 흐름이 이어집니다.</textarea>
        <div class="help"><b data-charout="mb">0</b>자 · 쓸 수 있는 값 <code>{이름}</code> <code>{강의명}</code> <code>{진도율}</code></div></div>

      <div class="field"><span class="lb">언제 보낼까요</span>
        <div class="radios">
          <div class="radio on" data-group="when" data-shows="now" data-label="즉시 발송"><span class="dot"></span><span class="grow"><b>지금 바로</b></span></div>
          <div class="radio" data-group="when" data-shows="later" data-label="예약 발송"><span class="dot"></span><span class="grow"><b>예약해 두기</b></span></div>
        </div>
        <div class="mt3" data-shown-by="when:later" hidden>
          <div class="input-row"><input class="input" type="date" value="2026-08-10"><input class="input" type="time" value="10:00"></div></div>
      </div>
      <div class="err-msg" data-gatemsg="send" hidden></div>
    `, {
      ft: `<div class="row-b wrap-row"><span class="t-sub"><b data-selcount="rcv" data-base="7">12</b>명 · <span data-pick-out="when">즉시 발송</span></span>
      <div class="btns">${U.btn('수강생 목록으로', { cls: 'btn-ghost', href: 'ST-01' })}
      <button class="btn btn-primary is-off" type="button" data-gated="send" data-toast="발송은 서버가 연결되면 실제로 나갑니다" data-toast-kind="ok">보내기</button></div></div>`,
    })}</div>
  </div>

  <aside class="sticky">
    ${U.card('미리보기', `
      <div class="box">
        <div class="t-sub">받는 사람 · 김서준님</div>
        <b class="mt2" style="display:block" data-preview="mt">[배움터] 진도가 조금 밀렸어요</b>
        <p class="mt3" style="white-space:pre-wrap" data-preview="mb">김서준님, 「엑셀로 시작하는 실무 데이터 분석」 진도가 41%에서 멈춰 있어요. 오늘 한 차시만 들어도 흐름이 이어집니다.</p>
      </div>
      <p class="t-sub mt3">치는 대로 이 미리보기가 따라 바뀝니다. <code>{이름}</code> 같은 값은 보낼 때 각자의 값으로 바뀝니다.</p>`)}
  </aside>
</div>`;
  return { body, o: { admin: true, search: false } };
};

/* ================= GR-01 출석 현황 ================= */
P['GR-01'] = () => {
  const weeks = 12;
  const cellFor = (si, wi) => {
    const v = (si * 7 + wi * 3) % 10;
    if (v < 6) return ['c-ok', '출'];
    if (v < 8) return ['c-late', '지'];
    if (v < 9) return ['c-no', '결'];
    return ['c-na', '-'];
  };
  const rows = STUDENTS.map((s, si) => {
    const cells = Array.from({ length: weeks }, (_, wi) => {
      const [cls, t] = cellFor(si, wi);
      return `<td class="c"><button class="cell ${cls}" type="button" title="${s.nm} · ${wi + 1}주차" aria-label="${s.nm} ${wi + 1}주차 출결">${t}</button></td>`;
    }).join('');
    const ok = Array.from({ length: weeks }, (_, wi) => cellFor(si, wi)[0]).filter((c) => c === 'c-ok').length;
    const use = Array.from({ length: weeks }, (_, wi) => cellFor(si, wi)[0]).filter((c) => c !== 'c-na').length;
    return `<tr><td><b>${s.nm}</b></td>${cells}<td class="right"><b data-rate>${Math.round(ok / use * 100)}%</b></td></tr>`;
  }).join('');
  const avg = Array.from({ length: weeks }, (_, wi) => {
    const ok = STUDENTS.filter((_, si) => cellFor(si, wi)[0] === 'c-ok').length;
    return Math.round(ok / STUDENTS.length * 100);
  });

  const body = `
${U.pageHd('출석 현황', '칸을 누르면 출석 → 지각 → 결석 → 해당없음 순으로 바뀌고, 그 줄의 출석률이 다시 계산됩니다', `
  ${U.btnSay('엑셀로 내보내기', '내보내기는 서버가 연결되면 동작합니다', { cls: 'btn-ghost' })}
  ${U.btn('과제 채점하러 가기', { cls: 'btn-soft', href: 'GR-02' })}`)}

<div class="card mb4"><div class="card-bd">
  <div class="row-b wrap-row">
    ${courseSel('gr-course')}
    <select class="input" style="width:180px" aria-label="기간" data-toast="고른 기간의 출석표로 바뀝니다">
      <option>1~12주 (전체)</option><option>1~6주</option><option>7~12주</option></select>
    <span class="sp grow"></span>
    <div class="legend">
      <span><i style="background:rgba(15,122,82,.14)"></i>출석</span>
      <span><i style="background:rgba(245,158,11,.12)"></i>지각</span>
      <span><i style="background:rgba(192,57,43,.1)"></i>결석</span>
      <span><i style="background:var(--bg)"></i>해당없음</span>
    </div>
  </div>
</div></div>

<div class="table-wrap table-scroll"><table class="table mx table-fix" style="min-width:900px">
  <thead><tr><th style="width:110px">이름</th>
    ${Array.from({ length: weeks }, (_, i) => `<th style="width:52px;text-align:center">${i + 1}주</th>`).join('')}
    <th style="width:80px;text-align:right">출석률</th></tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr><td>주차 평균</td>
    ${avg.map((a) => `<td style="text-align:center">${a}%</td>`).join('')}
    <td class="right">${Math.round(avg.reduce((a, b) => a + b, 0) / weeks)}%</td></tr></tfoot>
</table></div>

<div class="g2 mt6">
  ${U.card('주차별 평균 출석률', U.barChart(avg, avg.map((_, i) => i + 1 + '주'), { alt: '주차별 평균 출석률' }))}
  ${U.card('출석 기준', `<ul class="list-plain">
    <li>· 한 주에 <b>1차시 이상</b> 들으면 출석입니다</li>
    <li>· 주가 끝난 뒤 3일 안에 들으면 <b>지각</b>으로 봅니다</li>
    <li>· 12주 가운데 <b>10주 이상</b> 출석해야 수료 조건을 채웁니다</li>
    <li>· 강의를 시작하기 전 주차는 해당없음으로 둡니다</li>
  </ul>
  <div class="btns mt7">${U.btn('수료 기준 설정', { cls: 'btn-ghost', href: 'GR-04' })}</div>`, { bdCls: 'tight' })}
</div>`;
  return { body, o: { admin: true, search: false } };
};

/* ================= GR-02 과제 채점 목록 ================= */
P['GR-02'] = () => {
  const rows = ASSIGNMENTS.map((a) => ({
    attr: ` data-tags="st:${a.score == null ? 'wait' : 'done'}" data-q="${a.nm} ${a.t}"`,
    cells: [
      `<input class="selbox" type="checkbox" data-selgroup="gr" aria-label="${a.nm} 고르기">`,
      { t: `<b>${a.nm}</b>`, v: a.nm },
      { t: a.t, v: a.t },
      { t: a.at + (a.late ? ' ' + U.badge('지각', 'b-warn') : ''), v: a.at.replace(/[^0-9]/g, '') },
      `📎 ${a.files}개`,
      { t: a.score == null ? U.badge('채점 전', 'b-danger') : `<b>${a.score}</b>/30`, v: a.score == null ? -1 : a.score },
      `<a class="btn btn-${a.score == null ? 'primary' : 'ghost'} btn-sm" href="${U.link('GR-03')}">${a.score == null ? '채점하기' : '다시 보기'}</a>`,
    ],
  }));

  const body = `
${U.pageHd('과제 채점', '제출률 84/128명 (66%)')}

<div class="g4 mb6">
  ${U.stat('채점 대기', '24', { unit: '건', ico: '📝', delta: -6, spark: U.spark([38, 36, 33, 30, 28, 26, 24]) })}
  ${U.stat('채점 완료', '108', { unit: '건', ico: '✅', cls: 's-ok', delta: 12, spark: U.spark([64, 72, 80, 88, 94, 101, 108]) })}
  ${U.stat('평균 점수', '26.4', { unit: '/30', ico: '📊', cls: 's-acc s-ink', delta: 0, spark: U.spark([25, 26, 26, 27, 26, 26, 26]) })}
  ${U.stat('지각 제출', '9', { unit: '건', ico: '⏰', cls: 's-mut s-ink', delta: 2, spark: U.spark([4, 5, 5, 6, 7, 8, 9]) })}
</div>

${U.tabs([
    { label: '채점 대기', f: 'st', v: 'wait', cnt: 5 },
    { label: '채점 완료', f: 'st', v: 'done', cnt: 3 },
    { label: '전체', f: 'st', v: '*', cnt: 8 },
  ], 0, { list: 'gr' })}

<div class="card mb4"><div class="card-bd">
  <div class="row-b wrap-row">
    <select class="input" style="width:300px" aria-label="과제 고르기" data-toast="고른 과제의 제출물로 바뀝니다">
      <option>3장 과제 — 부서별 실적 대시보드</option><option>2장 과제 — 월별 매출표 만들기</option><option>1장 과제 — 표를 표답게</option></select>
    <div class="grow" style="min-width:180px"><input class="input" type="search" placeholder="이름으로 찾기" data-search="gr" aria-label="검색"></div>
    <select class="input" style="width:160px" data-toast="고른 순서로 다시 늘어세웁니다" aria-label="정렬">
      <option>제출일순</option><option>이름순</option></select>
  </div>
  <div class="row-b wrap-row mt3">
    <span class="t-sub">지금 <b class="pri" data-fcount="gr">8</b>건 · 고른 것 <b class="pri" data-selcount="gr">0</b>건</span>
    <button class="btn btn-primary is-off" type="button" data-selneed="gr" data-toast="일괄 채점은 서버가 연결되면 동작합니다">선택한 <b data-selcount="gr">0</b>건 일괄 채점</button>
  </div>
</div></div>

${U.table(
      [{ t: `<input type="checkbox" data-selall="gr" aria-label="전체 고르기">`, w: '44px' },
      { t: '수강생', sort: 'text', w: '110px' }, { t: '과제', sort: 'text' }, { t: '제출일시', sort: 'num', w: '200px' },
      { t: '첨부', w: '80px' }, { t: '점수', sort: 'num', w: '100px' }, { t: '', w: '110px' }],
      rows, { scroll: true, bodyAttr: ' data-list="gr" data-finit=\'{"st":["wait"]}\'' })}
<div data-list-empty="gr" hidden class="mt4">${U.empty('🎉', '채점할 것이 없어요', '다른 탭을 눌러 보세요')}</div>
`;
  return { body, o: { admin: true, search: false } };
};

/* ================= GR-03 과제 채점 · 상세 ================= */
P['GR-03'] = () => {
  const rubric = [
    { k: 'r1', t: '정확성 — 피벗 값이 원본과 맞는가', max: 10, v: 9 },
    { k: 'r2', t: '가독성 — 한 화면에 읽히는가', max: 10, v: 8 },
    { k: 'r3', t: '자동화 — 슬라이서·조건부 서식을 썼는가', max: 10, v: 7 },
  ];
  const quick = ['기준을 잘 지켰습니다.', '조건부 서식 색이 너무 강해요. 한 톤 낮추면 읽기 편합니다.', '슬라이서를 하나 더 넣으면 부서별로 보기 좋겠어요.', '수식이 값으로 박혀 있어 데이터가 바뀌면 갱신되지 않습니다.'];

  const body = `
${U.pageHd('과제 채점', '3장 과제 — 부서별 실적 대시보드', `
  <span class="btn btn-ghost" style="cursor:default">3 / 24</span>
  ${U.btnSay('‹ 이전 학생', '이전 제출물로 넘어갑니다', { cls: 'btn-ghost' })}
  ${U.btnSay('다음 학생 ›', '다음 제출물로 넘어갑니다', { cls: 'btn-ghost' })}`)}

<div class="split-r" data-calc-rubric>
  <div>
    ${U.card('박도윤 님의 제출물', `
      <div class="row-c wrap-row mb4">${U.badge('지각 제출', 'b-warn')}${U.badge('첨부 3개', 'b-line')}
        <span class="t-sub">제출 2026-08-06 09:02 · 마감 2026-08-05 23:59</span></div>
      <div class="box"><b>답안</b>
        <p class="mt2">부서·월을 축으로 피벗을 만들고, 슬라이서는 부서 하나만 넣었습니다.
        조건부 서식은 목표 대비 90% 미만인 셀을 붉게 칠했습니다. 기간 슬라이서는 넣으려다 날짜 그룹이 잘 안 잡혀 뺐습니다.</p></div>
      <div class="mt4"><span class="lb">첨부 파일 미리보기</span>
        ${U.ph('제출 파일 미리보기', 'ph-43', 'hw')}
        <div class="mt3">
          ${[['부서별_대시보드.xlsx', '1.8MB'], ['캡처화면.png', '640KB'], ['설명메모.pdf', '210KB']]
      .map(([n, s]) => `<div class="file-row">📄 <span class="grow">${n}</span><span class="t-sub">${s}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="내려받기는 서버가 연결되면 동작합니다">내려받기</button></div>`).join('')}
        </div></div>
      <div class="mt4">${U.accordion([{
        q: '이 학생의 이전 제출물 보기', a: `<ul class="list-plain">
        <li><span class="grow">1장 과제 — 표를 표답게<div class="t-sub">2026-06-14 제출</div></span><b>28</b>/30</li>
        <li><span class="grow">2장 과제 — 월별 매출표<div class="t-sub">2026-07-27 제출</div></span><b>27</b>/30</li></ul>
        <p class="t-sub mt3">평균 27.5점 · 이번 과제까지 넣으면 수료 점수 기준을 넘습니다.</p>`,
      }], { single: true })}</div>
    `)}
  </div>

  <aside class="sticky">
    ${U.card('채점', `
      ${rubric.map((r) => `<div class="field">
        <label class="lb" for="${r.k}">${r.t} <span class="t-sub">(${r.max}점)</span></label>
        <div class="row-c"><input class="slider grow" type="range" id="${r.k}" min="0" max="${r.max}" value="${r.v}" data-rubric="${r.k}">
          <b class="pri" style="width:28px;text-align:right" data-rubric-out="${r.k}">${r.v}</b></div>
      </div>`).join('')}
      <div class="hr"></div>
      <div class="row-b"><span class="lb" style="margin:0">총점</span>
        <div><span class="t-page pri" data-out-total>24</span><span class="t-sub"> / <span data-out-max>30</span></span>
          <span class="badge b-ok" data-out-pass-badge style="margin-left:8px">통과</span></div></div>
      <div class="field mt4"><label class="lb" for="fb">피드백</label>
        <textarea class="input" id="fb" style="min-height:120px" placeholder="어떤 점이 좋았고 무엇을 더 하면 좋을지 적어 주세요"></textarea></div>
      <div class="chips">${quick.map((q) => `<button class="chip chip-sm" type="button" data-insert="#fb" data-text="${q}">${q.slice(0, 12)}…</button>`).join('')}</div>
      <p class="help">문구를 누르면 위 피드백 칸에 붙습니다</p>
    `, {
      ft: `<div class="btns-v">
        ${U.btnSay('임시 저장', '임시 저장은 서버가 연결되면 동작합니다', { cls: 'btn-ghost btn-block' })}
        ${U.btn('채점 완료', { cls: 'btn-primary btn-block', href: 'GR-02' })}
        ${U.btn('수료 기준 보기', { cls: 'btn-ghost btn-block', href: 'GR-04' })}</div>`,
    })}
  </aside>
</div>`;
  return { body, o: { admin: true, search: false } };
};

/* ================= GR-04 수료 기준 설정 ================= */
P['GR-04'] = () => {
  const body = `
${U.pageHd('수료 기준 설정', '값을 움직이면 오른쪽 인원이 그 자리에서 다시 계산됩니다')}

<div class="split-r" data-calc-criteria>
  <div>
    ${U.card('기준', `
      <div class="toggle-row" style="border:0;padding-bottom:0">
        <label class="check"><input type="checkbox" id="use-progress" checked data-calc><span><b>진도율</b></span></label>
        <span class="t-sub">최소 <b class="pri" id="pg-out">80%</b></span></div>
      <input class="slider" type="range" id="cr-progress" min="0" max="100" step="5" value="80" data-out="#pg-out" data-unit="%" data-calc>
      <div class="hr"></div>

      <div class="toggle-row" style="border:0;padding-bottom:0">
        <label class="check"><input type="checkbox" id="use-hw" checked data-calc><span><b>과제 제출</b></span></label>
        <span class="t-sub">최소 개수</span></div>
      <div class="input-row mt2" style="max-width:200px"><input class="input" type="number" id="cr-hw" value="3" min="0" max="5" data-calc><span class="btn btn-ghost">개</span></div>
      <div class="hr"></div>

      <div class="toggle-row" style="border:0;padding-bottom:0">
        <label class="check"><input type="checkbox" id="use-attend" checked data-calc><span><b>출석률</b></span></label>
        <span class="t-sub">최소 <b class="pri" id="at-out">75%</b></span></div>
      <input class="slider" type="range" id="cr-attend" min="0" max="100" step="5" value="75" data-out="#at-out" data-unit="%" data-calc>
      <div class="hr"></div>

      <div class="toggle-row" style="border:0;padding-bottom:0">
        <label class="check"><input type="checkbox" id="use-score" data-calc><span><b>최종 평가 점수</b></span></label>
        <span class="t-sub">100점 만점 기준</span></div>
      <div class="input-row mt2" style="max-width:200px"><input class="input" type="number" id="cr-score" value="60" min="0" max="100" data-calc><span class="btn btn-ghost">점</span></div>
      <p class="help">체크를 풀면 그 항목은 계산에서 빠집니다</p>
    `)}

    <div class="mt4">${U.card('수료증 양식', `
      <div class="g3 gap-s">
        ${['기본형 (가로)', '간결형 (가로)', '학원형 (도장 자리 포함)'].map((t, i) => `<div class="radio${i === 0 ? ' on' : ''}" data-group="cert" data-label="${t}" style="height:auto;padding:var(--gap-group);flex-direction:column;align-items:stretch">
          ${U.ph('수료증 양식', 'ph-a4', 'cert' + i)}
          <div class="row-c mt2"><span class="dot"></span><b style="font-size:14px">${t}</b></div></div>`).join('')}
      </div>`, {
    ft: `<div class="btns"><span class="t-sub grow">고른 양식 — <b data-pick-out="cert">기본형 (가로)</b></span>
      ${U.btnSay('기준 저장하기', '기준 저장은 서버가 연결되면 동작합니다', { cls: 'btn-primary' })}</div>`,
  })}</div>
  </div>

  <aside class="sticky">
    ${U.card('지금 기준이면', `
      <div class="center">
        <div class="t-page pri"><span data-out-pass>96</span><small style="font-size:20px">명</small></div>
        <div class="t-sub">수료 가능</div>
      </div>
      <div class="mt4"><div class="bar ok"><i data-out-passbar style="width:75%"></i></div></div>
      <div class="row-b mt2"><span class="t-sub">전체 128명 중 <b data-out-passpct>75%</b></span>
        <span class="t-sub">미달 <b class="danger" data-out-fail>32</b>명</span></div>
      <div class="hr"></div>
      <p class="t-sub">기준을 올리면 수료 인원이 줄고, 내리면 늘어납니다. 항목 체크를 풀면 그 조건이 계산에서 빠져요.</p>
    `, { ft: `<div class="btns-v">${U.btn('수료 처리하러 가기', { cls: 'btn-primary btn-block', href: 'GR-05' })}
      ${U.btn('출석 현황 보기', { cls: 'btn-ghost btn-block', href: 'GR-01' })}</div>` })}
  </aside>
</div>`;
  return { body, o: { admin: true, search: false } };
};

/* ================= GR-05 수료 처리 · 확인 ================= */
P['GR-05'] = () => {
  const body = `
${U.pageHd('수료 처리', '되돌릴 수 없는 작업이라 한 번 더 확인합니다')}

<div class="wrap-narrow" style="padding:0">
${U.card('', `
  <div class="center">
    <div class="t-page"><b class="pri" data-selcount="cert" data-base="90">96</b>명을 수료 처리합니다</div>
    <p class="t-sub mt2">아래 명단에서 체크를 바꾸면 인원이 함께 바뀝니다</p>
  </div>

  <div class="box mt6">
    <b>적용된 기준</b>
    ${U.kv([['진도율', '80% 이상'], ['과제 제출', '3개 이상'], ['출석률', '75% 이상'], ['최종 평가', '사용 안 함'], ['수료증 양식', '기본형 (가로)']])}
    <div class="btns mt3"><a class="btn btn-ghost btn-sm" href="${U.link('GR-04')}">기준 고치러 가기</a></div>
  </div>

  <div class="mt6">${U.card('수료 대상자 명단', `
    <div style="max-height:300px;overflow-y:auto">
      ${STUDENTS.map((s) => `<div class="row-c" style="padding:8px 0;border-bottom:1px solid var(--border)">
        <input class="selbox" type="checkbox" data-selgroup="cert" ${s.pct >= 60 ? 'checked' : ''} aria-label="${s.nm} 고르기">
        <span class="grow"><b>${s.nm}</b> <span class="t-sub">${s.mail} · 진도 ${s.pct}% · 과제 ${s.hw}/3</span></span>
        <select class="input" style="height:32px;width:150px;font-size:13px" aria-label="${s.nm} 제외 사유" data-exclude>
          <option value="">대상에 포함</option><option value="x">제외 — 진도 부족</option>
          <option value="x">제외 — 과제 미제출</option><option value="x">제외 — 본인 요청</option></select>
      </div>`).join('')}
    </div>
    <p class="t-sub mt3">제외 사유를 고르면 그 줄이 대상에서 빠지고 위 인원이 줄어듭니다.
    (명단은 전체 128명 가운데 12명만 보여 주는 견본입니다)</p>`,
    { aside: `<span class="t-sub">고른 사람 <b class="pri" data-selcount="cert" data-base="90">96</b>명</span>`, bdCls: 'tight' })}</div>

  <div class="box-danger mt6">
    <b>⚠️ 수료 처리 후에는 되돌릴 수 없어요</b>
    <p class="t-sub mt2">수료증 번호가 발급되고 수강생에게 알림이 나갑니다. 잘못 처리하면 개별로 취소해야 합니다.</p>
  </div>

  <div class="mt6">
    <div class="checks">
      <label class="check"><input type="checkbox" checked><span>수료증 자동 발급하기</span></label>
      <label class="check"><input type="checkbox" checked><span>수료 안내 메일 보내기</span></label>
      <label class="check"><input type="checkbox" data-gate="cert" data-label="최종 확인">
        <span><b>위 내용을 확인했고, 되돌릴 수 없다는 것을 알고 있습니다</b><span class="req">*</span></span></label>
    </div>
    <div class="err-msg mt3" data-gatemsg="cert" hidden></div>
  </div>

  <div class="btns mt7" style="justify-content:center">
    ${U.btn('출석 현황으로', { cls: 'btn-ghost btn-lg', href: 'GR-01' })}
    <button class="btn btn-primary btn-lg is-off" type="button" data-gated="cert" data-toast="수료 처리는 서버가 연결되면 실제로 진행됩니다" data-toast-kind="ok">수료 처리하기</button>
  </div>
`)}
</div>`;
  return { body, o: { admin: true, search: false } };
};
