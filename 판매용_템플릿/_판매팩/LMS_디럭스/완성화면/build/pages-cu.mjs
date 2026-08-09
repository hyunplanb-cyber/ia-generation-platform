/* CU 수업 편성 */
import * as U from './ui.mjs';
import { CATS, LEVELS, MYTEACH, DRAFT_CURRICULUM, byId } from './data.mjs';

const P = {};
export default P;

const stKey = (s) => ({ '게시 중': 'live', '검수 대기': 'wait', '작성 중': 'draft', '게시 중지': 'stop' }[s]);

/* ================= CU-01 내 강의 목록 ================= */
P['CU-01'] = () => {
  const rows = MYTEACH.map((t) => {
    const c = byId(t.id);
    return {
      attr: ` data-tags="st:${stKey(t.st)}" data-q="${c.name} ${c.cat}"`,
      cells: [
        `<div class="row-c">${U.ph('강의 썸네일', 'ph-thumb-sm', c.id)}
          <div><b>${c.name}</b><div class="t-sub">${c.cat} · ${c.lv} · ${c.ep}차시</div></div></div>`,
        U.badge(t.st, t.stCls),
        { t: U.nf(t.students) + '명', v: t.students, cls: 'right' },
        { t: t.rate ? `${U.stars(t.rate)} ${t.rate.toFixed(1)}` : '—', v: t.rate },
        { t: `<div style="min-width:110px">${U.barRow(t.done)}</div>`, v: t.done },
        { t: t.edited, v: t.edited },
        `<div class="btns"><a class="btn btn-ghost btn-sm" href="${U.link('CU-03')}">편성</a>
         <a class="btn btn-ghost btn-sm" href="${U.link('ST-01')}">통계</a></div>`,
      ],
    };
  });

  const body = `
${U.pageHd('내 강의 목록', '개설한 강의를 한눈에 봅니다', U.btn('＋ 새 강의 개설', { cls: 'btn-primary', href: 'CU-02' }))}

<div class="g4 mb6">
  ${U.stat('게시 중', '2', { unit: '개', ico: '🟢', cls: 's-ok', note: '수강생 169명' })}
  ${U.stat('검수 대기', '1', { unit: '개', ico: '🟡', cls: 's-acc s-ink', note: '보통 2~3영업일' })}
  ${U.stat('작성 중', '1', { unit: '개', ico: '✏️', cls: 's-mut s-ink', note: '영상 3개 미연결' })}
  ${U.stat('게시 중지', '1', { unit: '개', ico: '⛔', cls: 's-mut s-ink', note: '2026-06-18 중지' })}
</div>

${U.tabs([
    { label: '전체', f: 'st', v: '*', cnt: 5 },
    { label: '게시 중', f: 'st', v: 'live', cnt: 2 },
    { label: '검수 대기', f: 'st', v: 'wait', cnt: 1 },
    { label: '작성 중', f: 'st', v: 'draft', cnt: 1 },
    { label: '게시 중지', f: 'st', v: 'stop', cnt: 1 },
  ], 0, { list: 'teach' })}

<div class="card mb4"><div class="card-bd">
  <div class="row-b wrap-row">
    <div class="grow" style="min-width:220px"><input class="input" type="search" placeholder="강의명으로 찾기 — 치는 대로 걸러집니다" data-search="teach" aria-label="강의 검색"></div>
    <span class="t-sub"><b class="pri" data-fcount="teach">5</b>개 보는 중</span>
    ${U.btnSay('엑셀로 내려받기', '내려받기는 서버가 연결되면 동작합니다', { cls: 'btn-ghost' })}
  </div>
</div></div>

${U.table(
    [{ t: '강의', sort: 'text' }, { t: '상태', w: '110px' }, { t: '수강생', sort: 'num', w: '100px' },
    { t: '평점', sort: 'num', w: '130px' }, { t: '완주율', sort: 'num', w: '160px' }, { t: '최근 수정', sort: 'text', w: '120px' }, { t: '', w: '140px' }],
    rows, { scroll: true, bodyAttr: ' data-list="teach"' })}
<div data-list-empty="teach" hidden class="mt4">${U.empty('📭', '그 상태의 강의가 없어요', '다른 탭을 눌러 보세요')}</div>
`;
  return { body, o: { admin: true, search: false } };
};

/* ================= CU-02 강의 개설 · 기본 정보 ================= */
P['CU-02'] = () => {
  const body = `
${U.pageHd('강의 개설', '1단계 — 기본 정보')}
${U.steps(['기본 정보', '커리큘럼', '검수 요청'], 0)}

<div class="split-r" data-calc-price>
  <div>
    ${U.card('기본 정보', `
      <div class="field"><label class="lb" for="cu-nm">강의명<span class="req">*</span></label>
        <input class="input" id="cu-nm" data-gate="cu" data-label="강의명" data-charcount="cunm" maxlength="60" placeholder="무엇을 배우는 강의인지 한 줄로">
        <div class="help"><b data-charout="cunm">0</b>/60자</div></div>
      <div class="field"><label class="lb" for="cu-sub">부제</label>
        <input class="input" id="cu-sub" placeholder="누구를 위한 강의인지 덧붙여 주세요"></div>
      <div class="g2 gap-s">
        <div class="field"><label class="lb" for="cu-cat">카테고리<span class="req">*</span></label>
          <select class="input" id="cu-cat" data-gate="cu" data-label="카테고리"><option value="">고르기</option>
          ${CATS.map((c) => `<option>${c.key}</option>`).join('')}</select></div>
        <div class="field"><span class="lb">난이도<span class="req">*</span></span>
          <div class="radios-h">${LEVELS.map((l, i) => `<div class="radio${i === 0 ? ' on' : ''}" data-group="lv" data-label="${l}"><span class="dot"></span>${l}</div>`).join('')}</div></div>
      </div>
    `)}

    <div class="mt4">${U.card('썸네일', `
      <div class="g2 gap-s">
        <div><div class="drop" data-toast="이미지 업로드는 서버가 연결되면 동작합니다"><div class="ico">🖼</div>
          <p class="mt2"><b>썸네일 올리기</b></p><p class="t-sub">권장 1200×900 (4:3) · JPG · PNG · 5MB 이하</p></div></div>
        <div><span class="lb">미리보기</span>${U.ph('강의 썸네일', 'ph-43', 'new')}</div>
      </div>
      <p class="help">목록 카드에서 4:3으로 잘립니다. 적어 둔 크기와 같은 비율로 준비해 주세요.</p>`)}</div>

    <div class="mt4">${U.card('가격', `
      <div class="toggle-row"><span><b>무료 강의로 열기</b><div class="t-sub">켜면 아래 가격 칸이 잠깁니다</div></span>
        <button class="toggle" type="button" id="price-free" role="switch" aria-checked="false" aria-label="무료 강의로 열기" data-disables="price" data-recalc><i></i></button></div>
      <div class="g2 gap-s mt4">
        <div class="field"><label class="lb" for="price-list">정가</label>
          <input class="input" id="price-list" type="number" value="132000" step="1000" data-calc data-disabled-by="price"></div>
        <div class="field"><label class="lb" for="price-off">할인율 (%)</label>
          <input class="input" id="price-off" type="number" value="40" min="0" max="100" data-calc data-disabled-by="price"></div>
      </div>
      <div class="box"><span class="lb">수강생이 보는 가격</span>
        <div class="price price-lg" data-out-sell><span class="now">79,200원</span><span class="was">132,000원</span><span class="off">40%</span></div>
        <p class="t-sub mt2">플랫폼 수수료 20%를 뺀 실 정산액은 한 건당 <b>63,360원</b>입니다</p></div>`)}</div>

    <div class="mt4">${U.card('강의 소개', `
      <div class="row-c mb2" style="gap:4px">
        ${['B', 'I', 'U', '≡', '•', '1.', '🔗', '🖼'].map((b) => `<button class="btn btn-ghost btn-sm" type="button" data-toast="글꼴 꾸미기는 서버가 연결되면 저장됩니다" style="width:36px;padding:0">${b}</button>`).join('')}
      </div>
      <textarea class="input" style="min-height:200px" data-gate="cu" data-label="강의 소개"
        placeholder="이 강의를 왜 만들었는지, 어떤 순서로 배우는지 적어 주세요"></textarea>
      <p class="help">여기에 쓴 글은 <b>강의 상세 화면</b>의 「강의 소개」 자리에 그대로 보입니다</p>`)}</div>

    <div class="mt4">${U.card('이런 걸 배웁니다', `
      <div data-rowlist="learn" data-minrows="1">
        ${['조건에 맞는 값만 골라 합계 내기', '표를 자동으로 요약하는 피벗 테이블'].map((t) => `<div class="input-row mb2" data-row>
          <input class="input" value="${t}"><button class="btn btn-ghost" type="button" data-delrow aria-label="줄 빼기">−</button></div>`).join('')}
      </div>
      <template id="tpl-learn"><div class="input-row mb2" data-row><input class="input" placeholder="배우는 것을 한 줄로"><button class="btn btn-ghost" type="button" data-delrow aria-label="줄 빼기">−</button></div></template>
      <button class="btn btn-soft btn-sm" type="button" data-addrow="learn">＋ 줄 추가</button>
      <p class="help">여기에 적은 줄은 상세 화면의 「이런 걸 배웁니다」 상자로 그대로 나갑니다</p>`)}</div>

    <div class="err-msg mt4" data-gatemsg="cu" hidden></div>
  </div>

  <aside class="sticky">
    ${U.card('미리보기 카드', `
      <div class="ccard">
        ${U.ph('강의 썸네일', 'ph-43', 'new')}
        <div class="nm" data-preview="cunm" data-empty="강의명을 입력해 주세요">강의명을 입력해 주세요</div>
        <div class="by">박지훈</div>
        <div class="badges"><span class="badge b-line" data-pick-out="lv">입문</span></div>
        <div class="price price-lg" data-out-sell><span class="now">79,200원</span><span class="was">132,000원</span><span class="off">40%</span></div>
      </div>
      <p class="t-sub mt4">고른 값이 이 카드에 바로 반영됩니다</p>`)}
    <div class="mt4">
      <div class="btns-v">
        ${U.btnSay('임시 저장', '임시 저장은 서버가 연결되면 동작합니다', { cls: 'btn-ghost btn-block' })}
        <a class="btn btn-primary btn-lg btn-block is-off" href="${U.link('CU-03')}" data-gated="cu">다음 단계 — 커리큘럼</a>
      </div>
    </div>
  </aside>
</div>`;
  return { body, o: { admin: true, search: false } };
};

/* ================= CU-03 커리큘럼 편성 ================= */
P['CU-03'] = () => {
  const lessonRow = (l) => `<div class="cur-l" data-row data-min="${l.min}" data-linked="${l.linked ? 1 : 0}" style="cursor:default">
    <span class="st" title="순서 바꾸기">≡</span>
    <input class="input" style="height:34px;flex:1;min-width:120px" value="${l.t}" aria-label="차시 이름">
    <input class="input" style="height:34px;width:72px" value="${l.min}" aria-label="분" data-calc>
    ${l.linked ? U.badge('연결됨', 'b-ok') : U.badge('영상 없음', 'b-warn')}
    <label class="check" style="font-size:13px"><input type="checkbox" ${l.free ? 'checked' : ''}><span>미리보기</span></label>
    <button class="btn btn-ghost btn-sm" type="button" data-move="up" aria-label="위로">↑</button>
    <button class="btn btn-ghost btn-sm" type="button" data-move="down" aria-label="아래로">↓</button>
    <button class="btn btn-ghost btn-sm" type="button" data-delrow aria-label="차시 빼기">✕</button>
  </div>`;

  const body = `
${U.pageHd('커리큘럼 편성', '2단계 — 챕터와 차시를 짜 넣습니다')}
${U.steps(['기본 정보', '커리큘럼', '검수 요청'], 1)}

<div class="split-r" data-calc-cur>
  <div>
    ${DRAFT_CURRICULUM.map((ch, ci) => `<div class="cur-ch">
      <div class="hd" style="cursor:default">
        <input class="input" style="height:36px;max-width:380px" value="${ch.ch}" aria-label="챕터 이름" data-calc>
        <span class="t-sub">${ch.lessons.length}차시</span>
      </div>
      <div class="body"><div>
        <div data-rowlist="ch${ci}" data-minrows="1">${ch.lessons.map(lessonRow).join('')}</div>
        <template id="tpl-ch${ci}">${lessonRow({ t: '', min: 10, linked: false, free: false })}</template>
        <div style="padding:var(--gap-group) var(--gap-title);border-top:1px solid var(--border)">
          <button class="btn btn-soft btn-sm" type="button" data-addrow="ch${ci}">＋ 차시 추가</button>
        </div>
      </div></div>
    </div>`).join('')}

    <div class="btns mt4">
      ${U.btnSay('＋ 챕터 추가', '챕터 추가는 서버가 연결되면 저장됩니다', { cls: 'btn-ghost' })}
      ${U.btn('영상 업로드하러 가기', { cls: 'btn-soft', href: 'CU-04' })}
    </div>
  </div>

  <aside class="sticky">
    ${U.card('한눈에 보기', `
      ${U.kv([
      ['챕터', '<b data-out-ch>3</b>개'],
      ['차시', '<b data-out-lesson>8</b>개'],
      ['총 강의 시간', '<b data-out-min>2시간 10분</b>'],
      ['영상 연결', '<b data-out-linked>5/8</b>'],
    ])}
      <div class="mt4">${U.banner('warn', '⚠️', '<b>영상이 연결되지 않은 차시가 3개 있어요</b><br><span class="t-sub">모두 연결해야 검수를 요청할 수 있습니다</span>')}</div>
      <p class="t-sub mt3">차시를 늘리거나 빼면 이 숫자가 그 자리에서 다시 계산됩니다</p>`)}
    <div class="mt4"><div class="btns-v">
      ${U.btn('영상 업로드', { cls: 'btn-ghost btn-block', href: 'CU-04' })}
      ${U.btn('검수 요청하기', { cls: 'btn-primary btn-lg btn-block', href: 'CU-06' })}
      ${U.btn('내 강의 목록', { cls: 'btn-ghost btn-block', href: 'CU-01' })}
    </div></div>
  </aside>
</div>`;
  return { body, o: { admin: true, search: false } };
};

/* ================= CU-04 영상 업로드 ================= */
P['CU-04'] = () => {
  const lessons = DRAFT_CURRICULUM.flatMap((ch) => ch.lessons.map((l) => ({ ...l, ch: ch.ch })));

  const body = `
${U.pageHd('영상 업로드', '차시에 영상을 붙입니다')}

${U.banner('warn', '⏳', '<b>올리는 동안 이 화면을 벗어나지 마세요</b><br><span class="t-sub">벗어나면 올리던 파일이 처음부터 다시 올라갑니다</span>')}

<div class="split-r mt6">
  <div>
    ${U.card('영상 파일', `
      <div class="drop" data-drop="vid"><div class="ico">🎬</div>
        <p class="mt2"><b>영상을 끌어다 놓거나 눌러서 고르세요</b></p>
        <p class="t-sub">MP4 · MOV · 최대 2GB · 권장 1280×720 (16:9)</p></div>
      <div data-filebox="vid" data-max="8" data-names="01_오리엔테이션.mp4,02_실습자료.mp4,03_환경설정.mp4,04_첫예제.mp4,05_자주하는실수.mp4">
        <div class="file-row" data-mb="412">🎬 <span class="grow">01_오리엔테이션.mp4</span>
          <span style="width:140px">${U.bar(100, { cls: 'ok' })}</span>${U.badge('올림 완료', 'b-ok')}
          <button class="x" type="button" data-delfile aria-label="빼기">✕</button></div>
        <div class="file-row" data-mb="688">🎬 <span class="grow">02_실습자료.mp4</span>
          <span style="width:140px">${U.bar(100, { cls: 'ok' })}</span>${U.badge('인코딩 중 62%', 'b-warn')}
          <button class="x" type="button" data-delfile aria-label="빼기">✕</button></div>
        <div class="file-row" data-mb="240">🎬 <span class="grow">03_환경설정.mp4</span>
          <span style="width:140px">${U.bar(38)}</span>${U.badge('올리는 중 38%', 'b-pri')}
          <button class="x" type="button" data-delfile aria-label="빼기">✕</button></div>
      </div>
      <div class="help">올린 파일 <b data-fileout="vid">3/8개 · 1340.0MB</b></div>
    `, { aside: `<a class="btn btn-ghost btn-sm" href="${U.link('CU-05')}">업로드 실패</a>` })}

    <div class="g2 gap-s mt4">
      ${U.card('자막 파일 (SRT)', `<div class="drop" data-drop="srt"><div class="ico">💬</div>
        <p class="mt2"><b>자막 올리기</b></p><p class="t-sub">SRT · VTT · 차시당 1개</p></div>
        <div data-filebox="srt" data-max="3" data-names="01_자막.srt,02_자막.srt,03_자막.srt"></div>
        <div class="help">올린 파일 <b data-fileout="srt">0/3개 · 0.0MB</b></div>`)}
      ${U.card('강의 자료 (PDF·ZIP)', `<div class="drop" data-drop="doc"><div class="ico">📚</div>
        <p class="mt2"><b>자료 올리기</b></p><p class="t-sub">PDF · ZIP · 개당 50MB</p></div>
        <div data-filebox="doc" data-max="5" data-names="실습파일.zip,슬라이드.pdf,정리표.pdf,체크리스트.pdf,추가자료.zip"></div>
        <div class="help">올린 파일 <b data-fileout="doc">0/5개 · 0.0MB</b></div>`)}
    </div>

    <div class="mt4">${U.card('차시에 영상 연결하기', `
      <div class="toggle-row"><span>연결 안 된 차시만 보기</span>
        <button class="toggle" type="button" role="switch" aria-checked="false" aria-label="연결 안 된 차시만 보기"
          data-only-list="link" data-only-key="lk" data-only-val="no"><i></i></button></div>
      <div class="mt4" data-list="link">
        ${lessons.map((l, i) => `<div class="cur-l" data-tags="lk:${l.linked ? 'yes' : 'no'}" style="cursor:default">
          <span class="st ${l.linked ? 'done' : ''}">${l.linked ? '✓' : i + 1}</span>
          <span class="grow">${l.t}<div class="t-sub">${l.ch}</div></span>
          <span class="tm">${l.min}분</span>
          ${l.linked ? U.badge('연결됨', 'b-ok') : `<button class="btn btn-soft btn-sm" type="button" data-linkme>영상 연결</button>`}
        </div>`).join('')}
      </div>
      <p class="help">연결하면 위 요약의 <b>N/M차시</b>가 함께 올라갑니다</p>`,
      { aside: `<span class="t-sub">연결 <b class="pri" data-linked-count>5</b>/${lessons.length}차시</span>` })}</div>
  </div>

  <aside class="sticky">
    ${U.card('올리기 안내', `<ul class="list-plain">
      <li>· 지원 형식 MP4 · MOV</li>
      <li>· 최대 용량 2GB</li>
      <li>· 권장 해상도 1280×720 (16:9)</li>
      <li>· 인코딩은 영상 길이의 약 30% 시간이 걸려요</li>
      <li>· 인코딩 중에도 다른 차시를 올릴 수 있습니다</li>
    </ul>`, { bdCls: 'tight' })}
    <div class="mt4"><div class="btns-v">
      ${U.btn('업로드 완료 — 커리큘럼으로', { cls: 'btn-primary btn-block', href: 'CU-03' })}
    </div></div>
  </aside>
</div>`;
  return { body, o: { admin: true, search: false } };
};

/* ================= CU-05 영상 업로드 · 실패 ================= */
P['CU-05'] = () => {
  const files = [
    { n: '04_첫예제.mp4', mb: '2,410MB', ok: false, why: '파일 용량이 2GB를 초과했어요', how: '영상을 두 차시로 나누거나, 화질을 720p로 낮춰 다시 올려 주세요' },
    { n: '05_자주하는실수.avi', mb: '640MB', ok: false, why: '지원하지 않는 형식이에요 (AVI)', how: 'MP4 또는 MOV로 바꿔서 올려 주세요' },
    { n: '06_마무리.mp4', mb: '380MB', ok: false, why: '올리는 중에 연결이 끊겼어요', how: '네트워크를 확인한 뒤 다시 시도해 주세요' },
    { n: '01_오리엔테이션.mp4', mb: '412MB', ok: true },
    { n: '02_실습자료.mp4', mb: '688MB', ok: true },
  ];

  const body = `
${U.pageHd('영상 업로드', '일부 파일을 올리지 못했어요')}

${U.banner('danger', '⚠️', `<b>5개 가운데 3개가 실패했어요</b><br>
  <span class="t-sub">성공한 2개는 그대로 남아 있습니다. 실패한 것만 골라 다시 올리시면 돼요.</span>`,
    U.btn('전부 다시 시도', { cls: 'btn-primary', href: 'CU-04' }))}

<div class="split-r mt6">
  <div>
    ${U.card('올린 파일', `
      <div class="toggle-row"><span>실패한 것만 보기</span>
        <button class="toggle" type="button" role="switch" aria-checked="false" aria-label="실패한 것만 보기"
          data-only-list="up" data-only-key="ok" data-only-val="no"><i></i></button></div>
      <div class="mt4" data-list="up">
        ${files.map((f) => `<div data-tags="ok:${f.ok ? 'yes' : 'no'}" class="mb3">
          <div class="file-row" style="align-items:flex-start">
            <span>${f.ok ? '✅' : '⚠️'}</span>
            <span class="grow"><b>${f.n}</b><div class="t-sub">${f.mb}</div>
              ${f.ok ? '' : `<div class="danger mt2" style="font-weight:700">${f.why}</div>
              <div class="t-sub">${f.how}</div>`}</span>
            ${f.ok ? U.badge('올림 완료', 'b-ok')
        : `<button class="btn btn-soft btn-sm" type="button" data-retry>다시 시도</button>`}
          </div></div>`).join('')}
      </div>
      <p class="t-sub"><b class="pri" data-fcount="up">5</b>개 보는 중</p>`)}
  </div>

  <aside class="sticky">
    ${U.card('지원 형식 다시 안내', `${U.kv([
      ['형식', 'MP4 · MOV'],
      ['최대 용량', '2GB'],
      ['권장 해상도', '1280×720 (16:9)'],
      ['코덱', 'H.264 / AAC'],
      ['한 번에', '최대 8개'],
    ])}`)}
    <div class="mt4"><div class="btns-v">
      ${U.btn('업로드 화면으로', { cls: 'btn-primary btn-block', href: 'CU-04' })}
      ${U.btn('커리큘럼으로', { cls: 'btn-ghost btn-block', href: 'CU-03' })}
      ${U.btnSay('고객센터에 문의', '문의 접수는 서버가 연결되면 동작합니다', { cls: 'btn-ghost btn-block' })}
    </div></div>
  </aside>
</div>`;
  return { body, o: { admin: true, search: false } };
};

/* ================= CU-06 강의 게시 · 검수 대기 ================= */
P['CU-06'] = () => {
  const checks = [
    ['썸네일 등록', true, '1200×900 이미지가 등록되어 있습니다'],
    ['모든 차시 영상 연결', true, '8차시 모두 영상이 붙어 있고 인코딩이 끝났습니다'],
    ['강의 소개 작성', true, '1,240자를 쓰셨습니다. 상세 화면의 「강의 소개」 자리에 그대로 나갑니다'],
    ['가격 설정', true, '판매가 79,200원 (정가 132,000원 · 40% 할인)'],
    ['미리보기 차시 지정', true, '2차시를 미리보기로 열어 두셨습니다'],
  ];

  const body = `
${U.pageHd('강의 게시', '3단계 — 검수 요청')}
${U.steps(['기본 정보', '커리큘럼', '검수 요청'], 2)}

<div class="wrap-narrow" style="padding:0">
  ${U.card('', `
  ${U.result('ok', '✓', '검수를 요청했어요', '보통 2~3영업일이 걸려요. 결과는 메일과 알림으로 알려 드립니다')}

  <div class="box-warn">
    <b>⚠️ 검수 중에는 커리큘럼을 수정할 수 없어요</b>
    <p class="t-sub mt2">고쳐야 할 것이 있다면 먼저 요청을 취소해 주세요. 취소하면 바로 다시 편성할 수 있습니다.</p>
  </div>

  <div class="mt6">${U.card('검수 전 자동 점검 결과', `
    ${U.accordion(checks.map(([t, ok, d]) => ({ q: `${ok ? '✅' : '⬜'} ${t}`, a: d })), { single: true })}
    <div class="mt4">${U.banner('ok', '🎉', '<b>5개 항목을 모두 통과했습니다</b><br><span class="t-sub">모두 통과해야 검수 요청 버튼이 켜집니다</span>')}</div>`,
    { bdCls: 'tight' })}</div>

  <div class="mt4">${U.card('요청 정보', U.kv([
    ['강의명', '실무자를 위한 데이터 시각화'],
    ['요청 일시', '2026년 8월 7일 16:04'],
    ['예상 완료', '2026년 8월 11일쯤'],
    ['담당', '강의 검수팀'],
  ]))}</div>

  <div class="btns mt7" style="justify-content:center">
    ${U.btn('내 강의 목록으로', { cls: 'btn-primary btn-lg', href: 'CU-01' })}
    ${U.btnSay('검수 요청 취소', '요청 취소는 서버가 연결되면 처리됩니다', { cls: 'btn-danger btn-lg' })}
  </div>
  `)}
</div>`;
  return { body, o: { admin: true, search: false } };
};
