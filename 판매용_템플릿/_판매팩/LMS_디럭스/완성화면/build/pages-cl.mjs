/* CL 내 강의실 */
import * as U from './ui.mjs';
import { SITE, COURSES, MYCOURSES, CURRICULUM, QNA, byId } from './data.mjs';

const P = {};
export default P;

const C = byId('C01');

/* 우측 커리큘럼 사이드바 (CL-03 · CL-04 공용) */
const curSide = () => `<aside class="sticky">
  ${U.card('커리큘럼', `<div style="max-height:62vh;overflow-y:auto;margin:calc(var(--card-pad)*-1)">
    ${CURRICULUM.map((ch) => `<div class="cur-ch" style="border:0;border-radius:0;margin:0">
      <button class="hd" type="button"><span style="font-size:14px">${ch.ch}</span>
        <span class="t-sub">${ch.lessons.filter((l) => l.done).length}/${ch.lessons.length}</span></button>
      <div class="body"><div>${ch.lessons.map((l) => `<button class="cur-l${l.now ? ' on' : ''}" type="button"
        data-lesson="${l.no}차시 · ${l.t}" data-no="${l.no}" data-tm="${l.min}:00">
        <span class="st ${l.now ? 'now' : l.done ? 'done' : ''}">${l.now ? '▶' : l.done ? '✓' : l.no}</span>
        <span class="grow">${l.t}</span><span class="tm">${l.min}분</span></button>`).join('')}</div></div>
    </div>`).join('')}
  </div>`, {
  aside: `<span class="t-sub">${CURRICULUM.reduce((a, c) => a + c.lessons.filter((l) => l.done).length, 0)}/${C.ep}차시</span>`,
  bdCls: 'flush',
})}
  <div class="mt4">${U.card('', `<div class="row-b"><span class="t-sub">전체 진도</span><b class="pri">40%</b></div>
    <div class="mt2">${U.bar(40)}</div>
    <div class="btns-v mt7">${U.btn('과제 제출', { cls: 'btn-soft btn-block', href: 'CL-05' })}
    ${U.btn('질문하기', { cls: 'btn-ghost btn-block', href: 'CL-07' })}
    ${U.btn('수료증 조건 보기', { cls: 'btn-ghost btn-block', href: 'CL-08' })}</div>`)}</div>
</aside>`;

/* ================= CL-01 내 강의실 · 수강 중 ================= */
P['CL-01'] = () => {
  const rows = MYCOURSES.map((m) => {
    const c = byId(m.id);
    const pct = Math.round(m.done / m.total * 100);
    return `<div class="lrow" data-tags="st:${m.state === '수강 완료' ? 'done' : 'now'}" data-v-pct="${pct}" data-v-last="${m.last.replace(/-/g, '')}">
      ${U.ph('강의 썸네일', 'ph-thumb', c.id)}
      <div class="grow">
        <div class="row-c wrap-row">${U.badge(m.state, m.state === '수강 완료' ? 'b-ok' : 'b-pri')}
          ${m.cert ? U.badge('🎓 수료증 발급 가능', 'b-acc') : ''}</div>
        <div class="nm mt1">${c.name}</div>
        <div class="sub">${c.by} · 마지막 학습 ${m.last}</div>
        <div class="mt2" style="max-width:360px">${U.barRow(pct, { title: `${m.total}차시 중 ${m.done}차시`, cls: pct === 100 ? 'ok' : '' })}</div>
        <div class="t-sub">${m.done}/${m.total}차시 · 남은 차시 ${m.total - m.done}개</div>
      </div>
      <div class="btns-v">
        ${m.state === '수강 완료'
        ? U.btn('수료증 발급', { cls: 'btn-primary', href: 'CL-08' })
        : U.btn('이어보기', { cls: 'btn-primary', href: 'CL-03' })}
        ${U.btn('질문 게시판', { cls: 'btn-ghost btn-sm', href: 'CL-07' })}
      </div>
    </div>`;
  }).join('');

  const body = `
${U.pageHd('내 강의실', '진도 막대에 마우스를 올리면 몇 차시 중 몇 차시인지 보여요')}

${U.tabs([
    { label: '수강 중', f: 'st', v: 'now', cnt: 3 },
    { label: '수강 완료', f: 'st', v: 'done', cnt: 2 },
    { label: '전체', f: 'st', v: '*', cnt: 5 },
  ], 0, { list: 'my' })}

<div class="row-b wrap-row mb4">
  <span class="t-sub">지금 <b class="pri" data-fcount="my">5</b>개 강의를 보고 있어요</span>
  <select class="input" style="width:200px" data-sortlist="my" aria-label="정렬">
    <option value="last">최근 학습순</option><option value="pct">진도순</option></select>
</div>

<div class="card"><div class="card-bd flush" data-list="my" data-finit='{"st":["now"]}'>${rows}</div></div>
<div data-list-empty="my" hidden class="mt4">${U.empty('📭', '그 상태의 강의가 없어요', '다른 탭을 눌러 보세요')}</div>
`;
  return { body, o: {} };
};

/* ================= CL-02 내 강의실 · 비어 있음 ================= */
P['CL-02'] = () => {
  const body = `
${U.pageHd('내 강의실', '아직 시작한 강의가 없어요')}

<div data-swap-set="empty">
  <div data-swap-key="none">
    ${U.empty('📚', '아직 수강 중인 강의가 없어요',
    '마음에 드는 강의를 하나만 골라 보세요. 첫 강의는 20% 할인 쿠폰으로 시작할 수 있어요.',
    `${U.btn('강의 둘러보기', { cls: 'btn-primary btn-lg', href: 'CO-01' })}
     <button class="btn btn-ghost btn-lg" type="button" data-swap="empty:free">무료 강의 보기</button>`)}
  </div>
  <div data-swap-key="free" hidden>
    ${U.card('바로 들을 수 있는 무료 강의', `<div class="g3">${U.ccards(COURSES.filter((c) => c.price === 0).concat([COURSES[8], COURSES[7]]), { cols: 3 })}</div>`, {
      aside: `<button class="btn btn-ghost btn-sm" type="button" data-swap="empty:none">돌아가기</button>`,
    })}
  </div>
</div>

<div class="mt6">${U.banner('acc', '🎟', `<b>첫 수강 20% 할인 쿠폰이 들어와 있어요</b><br>
  <span class="t-sub">2026년 9월 6일까지 쓸 수 있습니다 · 모든 유료 강의에 적용</span>`,
    U.btn('쿠폰 쓰러 가기', { cls: 'btn-primary', href: 'CO-01' }))}</div>

${U.sec('이번 주 인기 강의', `<div class="g4">${U.ccards(COURSES.slice(0, 4), { cols: 4 })}</div>`, { cls: 'mt8', more: 'CO-01' })}
`;
  return { body, o: {} };
};

/* ================= CL-03 강의 재생 ================= */
P['CL-03'] = () => {
  const notes = [
    [258, 'SUMIFS는 조건 범위와 합계 범위의 행 수가 같아야 한다'],
    [431, '슬라이서는 표 안에 커서를 두고 삽입할 것'],
    [612, '피벗 값 요약 → 「값 표시 형식」에서 비율로 바꾸기'],
  ];

  const body = `
<div class="split-r">
  <div>
    <div class="player">
      <div class="stage">
        ${U.ph('강의 영상', 'ph-169', 'play')}
        <span class="cc" data-cc-box hidden>여기서 슬라이서를 넣으면 표 전체가 아니라 고른 항목만 남습니다</span>
      </div>
      <div class="ctrl">
        <button type="button" data-play class="on">❚❚ 일시정지</button>
        <button type="button" data-lesson-step="prev">‹ 이전 차시</button>
        <button type="button" data-lesson-step="next">다음 차시 ›</button>
        <span class="tm" data-time-cur>5:12</span>
        <span class="seek" data-seek="760"><i style="width:41%"></i><b style="left:41%"></b></span>
        <span class="tm" data-time-dur>12:40</span>
        <button type="button" data-speed="0.5">0.5x</button>
        <button type="button" data-speed="1" class="on">1.0x</button>
        <button type="button" data-speed="1.25">1.25x</button>
        <button type="button" data-speed="1.5">1.5x</button>
        <button type="button" data-speed="2">2.0x</button>
        <button type="button" data-cc>자막 꺼짐</button>
        <button type="button" data-toast="전체화면은 실제 영상이 붙으면 동작합니다">⛶ 전체화면</button>
      </div>
    </div>

    <div class="card mt4"><div class="card-bd">
      <div class="row-b wrap-row">
        <div><div class="t-sub">${C.name}</div>
          <h1 class="t-sec" data-lesson-title>12차시 · 슬라이서로 걸러 보기</h1></div>
        <div class="t-sub" data-time-left data-base="760">12분 40초 남음</div>
      </div>
      <div class="mt3">${U.banner('ok', '↩', '지난번에 보시던 <b>5분 12초</b> 지점부터 이어서 재생하고 있어요')}</div>
    </div></div>

    <div class="mt4">
    ${U.tabs([{ label: '강의 노트', pane: 'note' }, { label: '첨부 자료', pane: 'file' }, { label: '질문하기', pane: 'ask' }], 0, { panes: 'play' })}
    <div data-pane-set="play">
      ${U.pane('note', U.card('', `
        <ul class="list-plain">${notes.map(([s, t]) => `<li>
          <button class="btn btn-soft btn-sm" type="button" data-jump="${s}">${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}</button>
          <span class="grow">${t}</span>
          <button class="x btn-link" type="button" data-toast="노트 삭제는 서버가 연결되면 저장됩니다">지우기</button></li>`).join('')}</ul>
        <div class="input-row mt4"><input class="input" placeholder="지금 지점에 남길 메모를 적어 보세요">
          ${U.btnSay('현재 지점에 저장', '메모 저장은 서버가 연결되면 동작합니다', { cls: 'btn-primary' })}</div>
        <p class="help">시간을 누르면 영상이 그 지점으로 옮겨 갑니다</p>`), true)}

      ${U.pane('file', U.card('', `<ul class="list-plain">
        ${[['12차시 실습 파일.xlsx', '2.4MB'], ['피벗 테이블 정리표.pdf', '640KB'], ['강의 슬라이드 3장.pdf', '3.1MB']]
      .map(([n, s]) => `<li>📄 <span class="grow">${n}</span><span class="t-sub">${s}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="내려받기는 서버가 연결되면 동작합니다">내려받기</button></li>`).join('')}
      </ul>`))}

      ${U.pane('ask', U.card('', `
        <div class="field"><label class="lb" for="q-title">질문 제목</label><input class="input" id="q-title" data-gate="ask" data-label="질문 제목"></div>
        <div class="field"><label class="lb" for="q-body">내용</label><textarea class="input" id="q-body" data-gate="ask" data-label="질문 내용" placeholder="어떤 부분에서 막히셨는지 적어 주세요"></textarea></div>
        <p class="t-sub">이 질문은 <b data-lesson-title>12차시 · 슬라이서로 걸러 보기</b>에 달립니다</p>
        <div class="err-msg mt3" data-gatemsg="ask" hidden></div>`, {
        ft: `<div class="btns"><button class="btn btn-primary is-off" type="button" data-gated="ask" data-toast="질문 등록은 서버가 연결되면 동작합니다">질문 올리기</button>
        <a class="btn btn-ghost" href="${U.link('CL-07')}">질문 게시판 보기</a></div>`,
      }))}
    </div></div>
  </div>
  ${curSide()}
</div>`;
  return { body, o: {} };
};

/* ================= CL-04 강의 재생 · 오류 ================= */
P['CL-04'] = () => {
  const body = `
<div class="split-r">
  <div>
    <div class="player-err">
      <div style="font-size:44px">⚠️</div>
      <h1 class="t-sec" style="color:#fff">영상을 불러올 수 없어요</h1>
      <p style="color:rgba(255,255,255,.7);font-size:14px">잠시 뒤에 다시 시도하거나, 화질을 낮춰 보세요</p>
      <div class="btns mt3" style="justify-content:center">
        ${U.btn('다시 시도', { cls: 'btn-primary', href: 'CL-03' })}
        <button class="btn btn-ghost" type="button" data-quality="480p 화질">화질 낮추기</button>
      </div>
    </div>

    <div class="card mt4"><div class="card-bd">
      <div class="t-sub">${C.name}</div>
      <h2 class="t-sec">12차시 · 슬라이서로 걸러 보기</h2>
      <div class="mt3">${U.banner('warn', '📶', `<b data-quality-out>네트워크 상태를 확인해 주세요</b><br>
        <span class="t-sub">와이파이가 끊겼거나 회사 방화벽이 영상을 막고 있을 수 있어요</span>`)}</div>
      <div class="chips mt4"><span class="t-sub">화질</span>
        ${['1080p 화질', '720p 화질', '480p 화질'].map((q, i) => `<button class="chip chip-sm${i === 0 ? ' on' : ''}" type="button" data-quality="${q}">${q}</button>`).join('')}</div>
      <div class="mt4">${U.card('', U.accordion([{
    q: '자세한 오류 보기', a: `<ul class="list-plain">
      <li>· 오류 코드 MEDIA_ERR_NETWORK (2)</li>
      <li>· 시각 2026-08-07 15:04:11</li>
      <li>· 차시 12 · 슬라이서로 걸러 보기</li>
      <li>· 같은 강의의 다른 차시가 재생된다면 이 영상 파일의 문제일 수 있어요. 오른쪽에서 다른 차시를 눌러 확인해 보세요.</li></ul>`,
  }], { single: true }), { bdCls: 'tight' })}</div>
      <div class="btns mt7">
        ${U.btn('다시 시도', { cls: 'btn-primary', href: 'CL-03' })}
        ${U.btn('내 강의실로', { cls: 'btn-ghost', href: 'CL-01' })}
        ${U.btnSay('오류 신고하기', '오류 신고 접수는 서버가 연결되면 동작합니다', { cls: 'btn-ghost' })}
      </div>
    </div></div>
  </div>
  ${curSide()}
</div>`;
  return { body, o: {} };
};

/* ================= CL-05 과제 제출 ================= */
P['CL-05'] = () => {
  const body = `
${U.pageHd('과제 제출', `${C.name} · 3장 과제`)}

<div class="split-r">
  <div>
    ${U.card('3장 과제 — 부서별 실적 대시보드', `
      <div class="row-c wrap-row mb4">${U.badge('D-3', 'b-danger')}${U.badge('배점 30점', 'b-line')}${U.badge('제출 후 수정 가능', 'b-ok')}
        <span class="t-sub">마감 2026년 8월 10일 23:59</span></div>
      <div class="box">
        <b>과제 안내</b>
        <p class="mt2">3장에서 만든 피벗 테이블을 이용해 <b>부서별 월 실적 대시보드</b>를 한 장으로 만들어 제출하세요.</p>
        <ul class="list-plain mt3">
          <li>1. 부서·월을 축으로 하는 피벗 테이블 1개</li>
          <li>2. 슬라이서 2개 이상 (부서 · 기간)</li>
          <li>3. 조건부 서식으로 목표 미달 셀 강조</li>
          <li>4. 한 화면에 들어오도록 배치</li>
        </ul>
        <p class="t-sub mt3">평가 기준 — 정확성 10점 · 가독성 10점 · 자동화 정도 10점</p>
      </div>`)}

    <div class="mt4">${U.card('답안', `
      <div class="field"><label class="lb" for="hw-text">텍스트 답안<span class="req">*</span></label>
        <textarea class="input" id="hw-text" style="min-height:200px" data-gate="hw" data-label="텍스트 답안" data-charcount="hw"
          placeholder="어떤 순서로 만들었는지, 막혔던 부분은 무엇이었는지 적어 주세요"></textarea>
        <div class="help"><b data-charout="hw">0</b>자 · 200자 이상 권장</div></div>

      <div class="field"><span class="lb">파일 첨부</span>
        <div class="drop" data-drop="hw"><div class="ico">📎</div>
          <p class="mt2"><b>파일을 끌어다 놓거나 눌러서 고르세요</b></p>
          <p class="t-sub">XLSX · PDF · ZIP · 최대 5개 · 합계 20MB까지</p></div>
        <div data-filebox="hw" data-max="5" data-names="부서별_대시보드.xlsx,캡처화면.png,설명메모.pdf,원본데이터.zip,보완본.xlsx"></div>
        <div class="help">올린 파일 <b data-fileout="hw">0/5개 · 0.0MB</b></div></div>

      <div class="err-msg" data-gatemsg="hw" hidden></div>
      ${U.accordion([{ q: '제출될 내용 미리보기', a: `<div class="box"><b>3장 과제 — 부서별 실적 대시보드</b>
        <p class="t-sub mt2">제출자 ${SITE.me.name} · 제출 예정 2026-08-07</p>
        <p class="mt3" data-preview="hw" data-empty="아직 답안을 쓰지 않았어요">아직 답안을 쓰지 않았어요</p></div>` }], { single: true })}
    `, {
      ft: `<div class="row-b wrap-row"><span class="t-sub">제출 후 마감 전까지 다시 낼 수 있어요</span>
      <div class="btns">${U.btnSay('임시 저장', '임시 저장은 서버가 연결되면 동작합니다', { cls: 'btn-ghost' })}
      <a class="btn btn-primary is-off" href="${U.link('CL-03')}" data-gated="hw">제출하기</a></div></div>`,
    })}</div>
  </div>

  <aside class="sticky">
    ${U.card('남은 시간', `<div class="center"><div class="t-page pri">3일 8시간</div>
      <p class="t-sub">2026년 8월 10일 23:59 마감</p></div>
      <div class="hr"></div>
      ${U.kv([['배점', '30점'], ['제출 인원', '84/128명'], ['지각 제출', '허용 (감점 10%)'], ['재제출', '마감 전까지 가능']])}`)}
    <div class="mt4">${U.card('이 강의의 과제', `<ul class="list-plain">
      <li>${U.badge('완료', 'b-ok')}<span class="grow">1장 과제</span><span class="t-sub">28/30</span></li>
      <li>${U.badge('마감', 'b-mut')}<span class="grow">2장 과제</span>
        <a class="btn btn-ghost btn-sm" href="${U.link('CL-06')}">마감된 과제</a></li>
      <li>${U.badge('진행', 'b-pri')}<span class="grow">3장 과제</span><span class="t-sub">—</span></li>
    </ul>`, { bdCls: 'tight' })}</div>
  </aside>
</div>`;
  return { body, o: {} };
};

/* ================= CL-06 과제 제출 · 마감됨 ================= */
P['CL-06'] = () => {
  const body = `
${U.pageHd('과제 제출', `${C.name} · 2장 과제`)}

${U.banner('mut', '🔒', `<b>제출 기간이 종료된 과제예요</b><br>
  <span class="t-sub">마감 2026년 9월 10일 23:59 · 지금은 내용만 볼 수 있습니다</span>`)}

<div class="split-r mt6">
  <div>
    ${U.card('2장 과제 — 월별 매출표 만들기', `
      <div class="row-c wrap-row mb4">${U.badge('마감됨', 'b-mut')}${U.badge('배점 30점', 'b-line')}</div>
      <div class="box">
        <b>과제 안내</b>
        <p class="mt2">2장에서 배운 조건 합계 함수를 이용해 월별 매출표를 만들고, 전월 대비 증감을 함께 표시하세요.</p>
      </div>

      <div class="field mt6"><span class="lb">텍스트 답안</span>
        <textarea class="input" style="min-height:120px" disabled>SUMIFS로 월별 합계를 낸 뒤 전월 값을 빼서 증감을 구했습니다. 처음에는 조건 범위 크기가 달라 0이 나왔는데, 표 서식을 적용하니 해결됐습니다.</textarea>
        <div class="help">마감된 과제라 고칠 수 없어요</div></div>

      <div class="field"><span class="lb">첨부 파일</span>
        <div class="file-row">📄 <span class="grow">월별매출표.xlsx</span><span class="t-sub">1.8MB</span>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="내려받기는 서버가 연결되면 동작합니다">내려받기</button></div></div>

      ${U.accordion([{
    q: '왜 못 내나요? 다음 기회는 언제인가요?', a: `<p>이 과제는 2장을 마친 분들의 이해도를 확인하려고 낸 것이라 마감이 정해져 있었습니다.
        마감이 지나면 채점이 시작되기 때문에 새 제출을 받지 않습니다.</p>
        <p class="mt3"><b>다음 기회</b> — 3장 과제가 8월 10일에 마감됩니다. 지금 제출할 수 있어요.
        수료 조건은 <b>과제 3개 중 2개 제출</b>이라, 3장 과제를 내시면 조건을 채우실 수 있습니다.</p>`,
  }], { single: true, open: 0 })}
    `, {
      ft: `<div class="btns">
        ${U.btn('강사에게 문의하기', { cls: 'btn-primary', href: 'CL-07' })}
        ${U.btn('제출할 수 있는 과제 보기', { cls: 'btn-ghost', href: 'CL-05' })}
        ${U.btn('내 강의실로', { cls: 'btn-ghost', href: 'CL-01' })}</div>`,
    })}
  </div>

  <aside class="sticky">
    ${U.card('이 강의의 과제', `<ul class="list-plain">
      <li>${U.badge('완료', 'b-ok')}<span class="grow">1장 과제</span><span class="t-sub">28/30</span></li>
      <li>${U.badge('마감', 'b-mut')}<span class="grow">2장 과제</span><span class="t-sub">채점 중</span></li>
      <li>${U.badge('진행', 'b-pri')}<span class="grow">3장 과제</span><a class="btn btn-soft btn-sm" href="${U.link('CL-05')}">내기</a></li>
    </ul>`, { bdCls: 'tight' })}
  </aside>
</div>`;
  return { body, o: {} };
};

/* ================= CL-07 질문 게시판 ================= */
P['CL-07'] = () => {
  const eps = ['6차시 · VLOOKUP과 XLOOKUP 비교', '9차시 · 실습 — 월별 매출표 만들기', '12차시 · 슬라이서로 걸러 보기', '전체'];
  const epKey = (t) => 'e' + Math.max(0, eps.indexOf(t));

  const body = `
${U.pageHd('질문 게시판', C.name, U.btn('강의로 돌아가기', { cls: 'btn-ghost', href: 'CL-03' }))}

${U.tabs([
    { label: '전체', f: 'st', v: '*', cnt: QNA.length },
    { label: '내 질문', f: 'st', v: '내질문', cnt: QNA.filter((q) => q.mine).length },
    { label: '답변 완료', f: 'st', v: '답변완료', cnt: QNA.filter((q) => q.answered).length },
    { label: '미답변', f: 'st', v: '미답변', cnt: QNA.filter((q) => !q.answered).length },
  ], 0, { list: 'qna' })}

<div class="card mb4"><div class="card-bd">
  <div class="row-b wrap-row">
    <div class="grow" style="min-width:220px"><input class="input" type="search" placeholder="질문 내용으로 찾기" data-search="qna" aria-label="질문 검색"></div>
    <button class="btn btn-primary" type="button" data-modal="tpl-ask">＋ 질문 작성</button>
  </div>
  <div class="mt3"><span class="t-sub">차시</span>
    ${U.fchips('qna', 'ep', ['*'].concat(eps.map((e) => [epKey(e), e])), { allLabel: '전체 차시' })}</div>
  <p class="t-sub mt2">지금 <b class="pri" data-fcount="qna">${QNA.length}</b>개 질문을 보고 있어요</p>
</div></div>

<div data-list="qna">
${QNA.map((q, i) => `<div class="card mb3" data-tags="st:${q.answered ? '답변완료' : '미답변'} ${q.mine ? 'st:내질문' : ''} ep:${epKey(q.ep)}" data-q="${q.t} ${q.body}">
  <div class="card-bd">
    <div class="acc-item${i === 0 ? ' on' : ''}">
      <button class="acc-q" type="button"><span>
        <span class="badges mb2">${U.badge(q.answered ? '답변 완료' : '답변 대기', q.answered ? 'b-ok' : 'b-warn')}${q.mine ? U.badge('내 질문', 'b-pri') : ''}</span>
        <div>${q.t}</div>
        <div class="t-sub" style="font-weight:400">${q.who} · ${q.ep} · ${q.at}</div>
      </span><span class="mk">＋</span></button>
      <div class="acc-a"><div><div class="in">
        <p style="color:var(--text)">${q.body}</p>
        ${q.reply ? `<div class="review reply" style="margin-top:var(--gap-title);padding:var(--gap-group) var(--gap-title);background:var(--pri-10);border-radius:var(--r-btn)">
          <b>강사 답변 · ${C.by}</b><p class="mt2" style="color:var(--text)">${q.reply}</p></div>`
      : `<div class="box-warn mt4">아직 답변이 달리지 않았어요. 보통 영업일 기준 2일 안에 답변이 옵니다.</div>`}
        <div class="row-c mt4"><button class="btn btn-ghost btn-sm" type="button" data-like><span>👍 도움돼요</span> <span class="n">${q.like}</span></button>
          ${U.btnSay('신고', '신고 접수는 서버가 연결되면 동작합니다', { cls: 'btn-ghost btn-sm' })}</div>
      </div></div></div>
    </div>
  </div></div>`).join('')}
</div>
<div data-list-empty="qna" hidden>${U.empty('💬', '그 조건에 맞는 질문이 없어요', '탭이나 차시 조건을 바꿔 보세요',
    `<button class="btn btn-primary" type="button" data-freset="qna">조건 모두 풀기</button>`)}</div>
`;
  const after = U.modalTpl('tpl-ask', '질문 작성', `
    <div class="field"><label class="lb" for="m-ep">관련 차시</label>
      <select class="input" id="m-ep">${eps.map((e) => `<option>${e}</option>`).join('')}</select></div>
    <div class="field"><label class="lb" for="m-t">제목</label><input class="input" id="m-t"></div>
    <div class="field"><label class="lb" for="m-b">내용</label><textarea class="input" id="m-b" placeholder="어떤 부분에서 막히셨는지 적어 주세요"></textarea></div>`,
    `<button class="btn btn-ghost" type="button" data-dismiss>취소</button>
     <button class="btn btn-primary" type="button" data-dismiss data-toast="질문 등록은 서버가 연결되면 동작합니다">올리기</button>`);
  return { body, o: { after } };
};

/* ================= CL-08 수료증 발급 ================= */
P['CL-08'] = () => {
  const body = `
${U.pageHd('수료증 발급', '하루 20분 비즈니스 영어 회화')}

<div class="split-r">
  <div>
    ${U.card('수료 조건', `
      ${U.accordion([
    { q: '✅ 진도율 80% 이상 — 지금 96%', a: '60차시 가운데 58차시를 들으셨어요. 조건을 넘겼습니다.' },
    { q: '✅ 과제 3개 제출 — 3개 제출', a: '1장(28/30) · 2장(27/30) · 3장(29/30) 모두 제출하셨어요.' },
    { q: '✅ 출석 기준 충족 — 12주 중 11주', a: '주 1회 이상 학습한 주가 11주입니다. 기준은 10주예요.' },
  ], { single: true })}
      <div class="mt4">${U.banner('ok', '🎉', '<b>세 가지 조건을 모두 채우셨어요. 지금 바로 발급하실 수 있습니다</b>')}</div>
    `, { bdCls: 'tight' })}

    <div class="mt6">${U.card('수료증 미리보기', `
      <div class="cert">
        <div class="ttl">수 료 증</div>
        <div class="nm" data-mirror-out="cert" data-empty="이름을 입력해 주세요">${SITE.me.name}</div>
        <div class="ln">위 사람은 「하루 20분 비즈니스 영어 회화」 과정을<br>
          성실히 이수하였기에 이 증서를 드립니다.</div>
        <div class="ln mt6" style="font-size:13px">수료일 2026년 8월 7일 · 수료번호 CERT-2026-004182<br>배움터 · 강사 Emily Park</div>
      </div>
      <div class="field mt6"><label class="lb" for="cert-nm">수료증에 넣을 이름</label>
        <div class="input-row"><input class="input" id="cert-nm" value="${SITE.me.name}" data-mirror="cert">
          <button class="btn btn-ghost" type="button" data-copy="CERT-2026-004182">수료번호 복사</button></div>
        <div class="help">여기서 이름을 바꾸면 위 미리보기가 함께 바뀝니다</div></div>
    `, {
      ft: `<div class="btns">
        ${U.btnSay('PDF로 내려받기', 'PDF 발급은 서버가 연결되면 동작합니다', { cls: 'btn-primary' })}
        ${U.btnSay('링크드인에 공유', '공유는 서버가 연결되면 동작합니다', { cls: 'btn-ghost' })}
        ${U.btn('내 강의실로', { cls: 'btn-ghost', href: 'CL-01' })}</div>`,
    })}</div>
  </div>

  <aside class="sticky">
    ${U.card('아직 조건이 모자란 강의', `<ul class="list-plain">
      <li><span class="grow">${C.name}<div class="t-sub">진도 40% · 과제 2/3</div></span>${U.badge('미달', 'b-warn')}</li>
      <li><span class="grow">피그마로 만드는 첫 UI 디자인<div class="t-sub">진도 15% · 과제 0/2</div></span>${U.badge('미달', 'b-warn')}</li>
    </ul>
    <div class="btns mt7">${U.btn('내 강의실 보기', { cls: 'btn-ghost btn-block', href: 'CL-01' })}</div>`, { bdCls: 'tight' })}
    <div class="mt4">${U.card('이미 받은 수료증', `<ul class="list-plain">
      <li>🎓 <span class="grow">기획자를 위한 SQL 첫걸음<div class="t-sub">2026-07-28 발급</div></span>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="다시 받기는 서버가 연결되면 동작합니다">다시 받기</button></li>
      <li>🎓 <span class="grow">월급쟁이 첫 재테크 수업<div class="t-sub">2026-06-30 발급</div></span>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="다시 받기는 서버가 연결되면 동작합니다">다시 받기</button></li>
    </ul>`, { bdCls: 'tight' })}</div>
  </aside>
</div>`;
  return { body, o: {} };
};
