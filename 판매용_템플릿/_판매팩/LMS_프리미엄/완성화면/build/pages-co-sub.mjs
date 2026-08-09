/* CO 강의 탐색·수강 신청 — 3뎁스 하위 화면 16장
 *
 * 이 메뉴가 프리미엄의 값을 가장 잘 보여 준다. 「강의를 고르고 결제한다」는
 * 잘 되는 길 하나지만, 실제로는 쿠폰이 안 먹고, 동의를 안 하고, 카드가 거절되고,
 * 같은 강의를 두 번 결제한다. 그 열여섯 갈래가 여기 있다.
 */
import * as U from './ui.mjs';
import { COURSES, CATS, LEVELS, byId } from './data.mjs';

const P = {};
export default P;

const C = byId('C01');

/* ================= CO0102 강의 목록 > 필터 적용 상태 ================= */
P['CO0102'] = () => {
  const 걸린것 = [['분야', '데이터'], ['난이도', '입문'], ['가격', '10만원 이하'], ['평점', '4.5 이상']];
  const 결과 = COURSES.slice(0, 5);

  const body = `
${U.pageHd('강의 목록', `조건 ${걸린것.length}개가 걸려 있습니다`)}

${U.card('', `
  <div class="row-b wrap-row mb4" style="gap:var(--s4)">
    <b class="t-card">검색 결과 <span class="pri">${결과.length}개</span> <span class="t-sub" style="font-weight:400">(전체 ${COURSES.length}개 중)</span></b>
    ${U.btnSay('조건 모두 지우기', '조건을 모두 지웠어요. 전체 목록으로 돌아갑니다', { cls: 'btn-ghost btn-sm' })}
  </div>
  ${U.fchips('co-list', 'sel', 걸린것.map(([축, 값]) => [`${축}:${값}`, `${축} · ${값}`]), { x: true, multi: true })}
  <p class="t-sub mt2">칩의 ✕ 를 누르면 그 조건 하나만 풀립니다.</p>
  <label class="row-c mt4" style="gap:var(--s2);cursor:pointer">
    <input type="checkbox" data-toast="무료 강의만 보여드릴게요"> <b>무료 강의만 보기</b>
    <span class="t-sub">(3개)</span></label>`)}

${U.sec('', `<div class="card mt6"><div class="card-bd flush">
  ${결과.map((c) => `<a class="lrow" href="${U.link('CO-03')}">
    ${U.ph('강의', 'ph-thumb-sm', c.id)}
    <span class="grow"><b>${c.name}</b>
      <span class="t-sub" style="display:block">${c.by} · ${c.lv} · ★ ${c.rate} · 수강생 ${U.nf(c.st)}명</span></span>
    <span class="nowrap"><b>${U.won(c.price)}</b></span>
    <span class="muted">›</span></a>`).join('')}
</div></div>`)}

${U.card('조건을 어떻게 다루나', U.kv([
    ['조건끼리', '<b>모두 만족</b>하는 것만 보여줍니다 (AND)'],
    ['같은 축 안에서', '<b>하나라도 맞으면</b> 보여줍니다 — 「입문 또는 초급」처럼 (OR)'],
    ['결과가 0건이면', '어느 조건이 0건으로 만들었는지 짚어 드립니다'],
    ['주소', '조건이 주소에 남아 그대로 공유하실 수 있습니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= CO0103 강의 목록 > 목록 로딩 ================= */
P['CO0103'] = () => {
  const 뼈대 = (i) => `<div class="sk-card">
    ${U.ph('', 'ph-34 sk', 'sk' + i)}
    <div class="sk-line" style="width:86%"></div>
    <div class="sk-line" style="width:54%"></div>
    <div class="sk-line" style="width:38%"></div></div>`;

  const body = `
${U.pageHd('강의 목록', '불러오는 중입니다')}

${U.banner('info', '⏳', `<b>빈 화면 대신 «자리»를 먼저 보여 줍니다.</b>
  <p class="t-sub mt1">카드가 들어올 자리를 회색 상자로 잡아 두면 글자가 들어올 때 화면이 튀지 않습니다.
  필터 사이드바는 그대로 두어 조건을 계속 바꿀 수 있습니다.</p>`)}

${U.sec('', `<div class="gal mt6">${Array.from({ length: 12 }, (_, i) => 뼈대(i)).join('')}</div>
  <div class="center mt8"><span class="spin" aria-label="더 불러오는 중"></span>
    <p class="t-sub mt3">다음 12개를 불러오고 있어요</p></div>`)}

${U.card('언제 무엇을 보여주나', U.kv([
    ['첫 진입', '카드 자리 12개를 회색으로 잡아 둡니다'],
    ['다음 페이지', '목록 아래에 도는 표시만 놓습니다 — 이미 본 카드는 그대로 둡니다'],
    ['정렬을 바꿨을 때', '목록 맨 위로 올려 드립니다. 순서가 바뀌었는데 중간에 있으면 헷갈립니다'],
    ['3초가 넘으면', '「조금 오래 걸리고 있어요」를 덧붙입니다'],
  ]), { cls: 'mt8' })}`;

  return { body, o: {} };
};

/* ================= CO0104 강의 목록 > 모바일 필터 시트 ================= */
P['CO0104'] = () => {
  const body = `
${U.pageHd('필터', '좁은 화면에서는 아래에서 올라오는 시트로 엽니다')}

${U.banner('info', '📱', `<b>왼쪽 사이드바를 그대로 좁히지 않습니다.</b>
  <p class="t-sub mt1">720px 아래에서는 조건이 목록을 덮어 버립니다. 아래에서 올라오는 시트로 바꾸고,
  <b>적용을 누르기 전까지 목록은 그대로</b> 둡니다 — 고르는 동안 뒤가 계속 바뀌면 비교를 못 합니다.</p>`)}

${U.card('', `
  <div class="sheet-demo">
    <div class="sheet-hd"><b>필터</b>${U.btnSay('초기화', '조건을 모두 지웠어요', { cls: 'btn-ghost btn-sm' })}</div>
    ${U.accordion([
      /* CATS 는 {key, ico, n} 이라 그대로 넘기면 [object Object] 가 찍힌다.
         fchips 는 문자열이나 [값, 보일글자] 짝을 받는다. 갯수까지 함께 보여 준다. */
      { q: `분야 <span class="t-sub">(4개 선택)</span>`,
        a: U.fchips('mf', 'cat', CATS.slice(0, 8).map((c) => [c.key, `${c.ico} ${c.key} ${c.n}`]), { multi: true }) },
      { q: '난이도', a: U.fchips('mf', 'lv', LEVELS, { multi: true }) },
      { q: '가격', a: `<div class="row-c" style="gap:var(--s3)">
          <input type="range" class="slider" min="0" max="200000" step="10000" value="100000" data-toast="10만원 이하로 좁혔어요">
          <b class="nowrap">10만원 이하</b></div>
        <label class="row-c mt3" style="gap:var(--s2);cursor:pointer">
          <input type="checkbox" data-toast="무료만 보여드릴게요"> 무료만</label>` },
    ], { single: true, open: 0 })}
    <div class="sheet-ft">
      <p class="t-sub">이 조건이면 <b class="pri">14개</b>가 나옵니다</p>
      <div class="btns">
        ${U.btnSay('초기화', '조건을 모두 지웠어요', { cls: 'btn-ghost btn-lg' })}
        ${U.btn('14개 보기', { cls: 'btn-primary btn-lg', href: 'CO-01' })}
      </div>
    </div>
  </div>`)}

${U.card('적용 전에 결과 수를 먼저 보여 줍니다', `<p class="t-sub">조건을 하나 바꿀 때마다 버튼의 숫자가 같이 바뀝니다.
  적용하고 나서야 0건인 걸 알면, 시트를 다시 열어 하나씩 되돌려야 합니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= CO0202 검색 결과 없음 > 필터 과다 안내 ================= */
P['CO0202'] = () => {
  const 조건 = [
    ['가격', '3만원 이하', 2, true],
    ['평점', '4.8 이상', 31, false],
    ['난이도', '입문', 46, false],
    ['분야', '데이터', 18, false],
  ];

  const body = `
${U.pageHd('조건에 맞는 강의가 없어요', '조건 하나만 풀면 결과가 나옵니다')}

${U.banner('danger', '🔎', `<b>「가격 3만원 이하」가 결과를 0건으로 만들었습니다.</b>
  <p class="t-sub mt1">이 조건만 풀면 <b>2개</b>가 나옵니다. 나머지 조건은 그대로 두셔도 됩니다.</p>`,
    U.btnSay('이 조건 풀기', '가격 조건을 풀었어요. 2개가 나왔습니다', { cls: 'btn-primary' }))}

${U.card('조건을 하나씩 풀어 보기', `${U.table(
    [{ t: '조건', w: '40%' }, '이것만 풀면', ''],
    조건.map(([축, 값, 수, 범인]) => [
      `${범인 ? '🔴 ' : ''}<b>${축}</b> · ${값}`,
      `<b class="${수 > 0 ? 'pri' : 'muted'}">${수}개</b>`,
      U.btnSay('풀기', `${축} 조건을 풀었어요`, { cls: 'btn-ghost btn-sm' }),
    ]),
  )}
  <p class="t-sub mt4">빨간 표시가 결과를 0건으로 만든 조건입니다.</p>`, { cls: 'mt6' })}

${U.sec('이렇게 찾아보셔도 좋아요', `
  <div class="chips mb4">${['엑셀 입문', '데이터 분석 기초', '무료 데이터 강의', '피벗테이블'].map((k) =>
    `<a class="chip" href="${U.link('CO-01')}">${k}</a>`).join('')}</div>
  <div class="gal">${COURSES.slice(0, 4).map((c) => U.ccard(c)).join('')}</div>`,
    { cls: 'mt8', desc: '조건을 모두 푼 인기 강의입니다' })}

${U.card('원하시는 강의가 아직 없다면', `<p class="t-sub">주제를 남겨 주시면 그 강의가 열릴 때 알려드립니다. 강사에게도 전달됩니다.</p>
  <div class="row-c mt4" style="gap:var(--s2)">
    <input class="input grow" placeholder="예) 엑셀 매크로 실무" aria-label="원하는 주제">
    ${U.btnSay('알림 신청', '신청을 받았어요. 강의가 열리면 알려드릴게요', { cls: 'btn-primary' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= CO0302 강의 상세 > 커리큘럼 탭 ================= */
P['CO0302'] = () => {
  const 챕터 = [
    ['1. 시작하기 전에', [['오리엔테이션', '8:12', true], ['실습 파일 내려받기', '3:40', true], ['엑셀 버전 확인', '5:02', false]]],
    ['2. 표를 표답게 만들기', [['셀 서식과 표 변환', '14:20', false], ['이름 정의로 범위 관리', '11:05', false], ['데이터 유효성 검사', '9:48', false]]],
    ['3. 피벗테이블', [['피벗 만들기', '16:33', false], ['슬라이서로 걸러 보기', '12:18', false], ['계산 필드 추가', '13:55', false]]],
    ['4. 실무 대시보드', [['차트 고르기', '10:22', false], ['조건부 서식', '15:40', false], ['최종 과제 안내', '6:15', false]]],
  ];
  const 총차시 = 챕터.reduce((a, [, l]) => a + l.length, 0);

  const body = `
${U.pageHd(C.name, `${C.by} · 커리큘럼`)}

${U.tabs([
    { label: '소개', go: 'CO-03' }, { label: '커리큘럼' },
    { label: '수강 후기', go: 'CO-03' }, { label: '강사 소개', go: 'CO-03' },
  ], 1)}

${U.card('', `<div class="row-b wrap-row mb4" style="gap:var(--s4)">
    <b>전체 <span class="pri">${총차시}차시</span> · ${C.hrs}시간 · 4챕터</b>
    ${U.btnSay('전체 펼치기', '모든 챕터를 펼쳤어요', { cls: 'btn-ghost btn-sm' })}
  </div>
  ${U.accordion(챕터.map(([이름, 차시들]) => ({
    q: `${이름} <span class="t-sub">(${차시들.length}차시)</span>`,
    a: `<div class="card"><div class="card-bd flush">
      ${차시들.map(([nm, len, free], i) => `<div class="lrow">
        <span class="muted num" style="width:28px">${i + 1}</span>
        <span class="grow">${nm}${free ? ` ${U.badge('미리보기', 'b-pri')}` : ''}</span>
        <span class="t-sub num">${len}</span>
        ${free ? U.btnSay('▶ 재생', '미리보기를 재생합니다', { cls: 'btn-ghost btn-sm' }) : '<span class="muted">🔒</span>'}
      </div>`).join('')}
    </div></div>`,
  })), { open: 0 })}`, { cls: 'mt4' })}

${U.banner('info', '▶', `<b>미리보기 3차시는 결제 전에도 보실 수 있습니다.</b>
  <p class="t-sub mt1">강사의 말투와 화면 구성이 나와 맞는지 먼저 확인해 보세요.</p>`)}`;

  return { body, o: { read: true } };
};

/* ================= CO0303 강의 상세 > 수강 후기 탭 ================= */
P['CO0303'] = () => {
  const 분포 = [[5, 892], [4, 271], [3, 84], [2, 24], [1, 13]];
  const 총 = 분포.reduce((a, [, n]) => a + n, 0);
  const 후기 = [
    ['이서연', 5, '피벗테이블을 이렇게 쉽게 설명하는 강의는 처음입니다. 실습 파일이 실무랑 똑같아서 바로 써먹었어요.', 42, '수강생님 덕분에 힘이 납니다. 4챕터 대시보드도 꼭 끝까지 해 보세요!'],
    ['정우성', 4, '내용은 좋은데 3챕터 계산 필드 부분이 조금 빨랐습니다. 두 번 돌려 봤어요.', 18, null],
    ['최민아', 5, '엑셀을 10년 썼는데 이름 정의를 이제야 제대로 배웠습니다.', 31, null],
  ];

  const body = `
${U.pageHd(C.name, `수강 후기 ${U.nf(총)}개`)}

${U.tabs([{ label: '소개', go: 'CO-03' }, { label: '커리큘럼', go: 'CO0302' }, { label: '수강 후기' }, { label: '강사 소개', go: 'CO-03' }], 2)}

${U.card('', `<div class="row wrap-row" style="gap:var(--s8)">
    <div style="min-width:150px;text-align:center">
      <div class="t-page pri">${C.rate}</div>
      ${U.stars(C.rate)}
      <p class="t-sub mt2">${U.nf(총)}개 후기</p>
    </div>
    <div class="grow" style="min-width:260px">
      ${분포.map(([점, n]) => `<div class="row-c mb2" style="gap:var(--s3)">
        <span class="nowrap t-sub" style="width:34px">${점}점</span>
        ${U.bar(Math.round((n / 총) * 100))}
        <span class="t-sub num nowrap" style="width:56px;text-align:right">${U.nf(n)}</span></div>`).join('')}
    </div>
  </div>`, { cls: 'mt4' })}

${U.sec('', `
  <div class="row-b wrap-row mb4" style="gap:var(--s4)">
    ${U.tabs(['최신순', '평점 높은순', '도움된순'], 0, { pill: true })}
    <label class="row-c" style="gap:var(--s2);cursor:pointer">
      <input type="checkbox" data-toast="사진이 있는 후기만 보여드릴게요"> 사진 후기만 (28)</label>
  </div>
  <div class="g4 mb6">${Array.from({ length: 4 }, (_, i) => U.ph('후기 사진', 'ph-11', 'rv' + i)).join('')}</div>
  ${후기.map(([이름, 점, 글, 도움, 답글]) => `<div class="card mb4"><div class="card-bd">
    <div class="row-b"><b>${이름}</b><span class="t-sub">${U.stars(점)}</span></div>
    <p class="mt2">${글}</p>
    <div class="row-c mt4" style="gap:var(--s3)">
      ${U.btnSay(`👍 도움돼요 ${도움}`, '고맙습니다', { cls: 'btn-ghost btn-sm' })}
      ${U.btnSay('신고', '신고를 접수했어요', { cls: 'btn-ghost btn-sm' })}
    </div>
    ${답글 ? `<div class="box mt4"><b class="pri">강사 ${C.by}</b>
      <p class="t-sub mt1">${답글}</p></div>` : ''}
  </div></div>`).join('')}`, { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};

/* ================= CO0304 강의 상세 > 강사 소개 탭 ================= */
P['CO0304'] = () => {
  const 다른강의 = COURSES.filter((c) => c.by === C.by && c.id !== C.id).slice(0, 3);
  const 이력 = [
    ['현재', '데이터 분석 강사 · 프리랜서'],
    ['2021~2025', '○○커머스 데이터팀 리드 — 매출 대시보드 전사 도입'],
    ['2017~2021', '△△컨설팅 애널리스트 — 유통·제조 데이터 컨설팅'],
    ['자격', '데이터분석 준전문가(ADsP) · MOS Excel Expert'],
  ];

  const body = `
${U.pageHd(`${C.by} 강사`, '이 강사의 이력과 다른 강의')}

${U.tabs([{ label: '소개', go: 'CO-03' }, { label: '커리큘럼', go: 'CO0302' }, { label: '수강 후기', go: 'CO0303' }, { label: '강사 소개' }], 3)}

${U.card('', `<div class="row wrap-row" style="gap:var(--s6)">
    ${U.ph('강사 사진', 'ph-ava', C.by)}
    <div class="grow" style="min-width:240px">
      <h2 class="t-sec">${C.by}</h2>
      <p class="t-sub mt1">실무에서 쓰는 것만 가르칩니다. 예제는 전부 실제 업무 파일에서 가져왔습니다.</p>
      <div class="btns mt4">
        ${U.btnSay('팔로우', '팔로우했어요. 새 강의가 열리면 알려드릴게요', { cls: 'btn-primary' })}
        ${U.btn('강사에게 질문', { cls: 'btn-ghost', href: 'CL-07' })}
      </div>
    </div>
  </div>
  <div class="g3 mt6">
    ${U.stat('평균 평점', C.rate, { ico: '⭐', note: '강의 4개 기준' })}
    ${U.stat('누적 수강생', U.nf(9840), { unit: '명', ico: '🎓', cls: 's-acc' })}
    ${U.stat('답변률', '96', { unit: '%', ico: '💬', cls: 's-ok', note: '평균 4시간 안에' })}
  </div>`, { cls: 'mt4' })}

${U.sec('이력', U.card('', U.kv(이력)), { cls: 'mt6' })}

${U.sec('이 강사의 다른 강의', `<div class="gal">${다른강의.map((c) => U.ccard(c)).join('')}</div>`,
    { cls: 'mt6', more: 'CO-01', moreLabel: '전체 보기' })}`;

  return { body, o: { read: true } };
};

/* ================= CO0305 강의 상세 > 미리보기 재생 모달 ================= */
P['CO0305'] = () => {
  const body = `
${U.pageHd('미리보기', '무료 공개 차시를 결제 전에 보실 수 있습니다')}

${U.card('', `<div class="player">
    <div class="stage">영상 영역 (1차시 오리엔테이션 · 8:12)</div>
  </div>
  <div class="row-b wrap-row mt4" style="gap:var(--s4)">
    <div class="row-c" style="gap:var(--s3)">
      ${U.btnSay('⏯', '재생/일시정지', { cls: 'btn-ghost btn-sm' })}
      <span class="t-sub num">2:41 / 8:12</span>
    </div>
    <div class="row-c" style="gap:var(--s2)">
      <select class="input" style="width:auto;height:36px" data-toast="배속을 바꿨어요">
        <option>1.0배</option><option>1.25배</option><option>1.5배</option><option>2.0배</option></select>
      <select class="input" style="width:auto;height:36px" data-toast="자막을 바꿨어요">
        <option>자막 한국어</option><option>자막 끄기</option></select>
    </div>
  </div>`)}

${U.banner('info', '🎬', `<b>미리보기가 2차시 남았습니다.</b>
  <p class="t-sub mt1">1차시 오리엔테이션 · 2차시 실습 파일 내려받기 · 3차시 엑셀 버전 확인 — 세 차시가 무료입니다.</p>`)}

${U.card('', `<div class="row-b wrap-row" style="gap:var(--s4)">
    ${U.courseRow(C, { right: U.price(C) })}
  </div>
  <div class="btns mt7">
    ${U.btn('수강 신청하기', { cls: 'btn-primary btn-lg', href: 'CO-04' })}
    ${U.btnSay('닫고 계속 둘러보기', '미리보기를 닫았어요', { cls: 'btn-ghost btn-lg' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};

/* ================= CO0306 강의 상세 > 이미 수강 중 상태 ================= */
P['CO0306'] = () => {
  const body = `
${U.pageHd(C.name, '이미 수강 중인 강의입니다')}

${U.banner('info', '✅', `<b>2026년 6월 12일에 결제하셨습니다.</b>
  <p class="t-sub mt1">같은 강의를 두 번 결제할 수 없도록 <b>결제 버튼을 이어보기로 바꿔</b> 두었습니다.</p>`,
    U.btn('이어보기', { cls: 'btn-primary', href: 'CL-03' }))}

${U.card('', `${U.courseRow(C, {
    extra: `<div class="mt3">${U.barRow(40, { title: '30차시 중 12차시' })}</div>`,
    right: U.badge('수강 중', 'b-ok'),
  })}
  <div class="mt6">${U.kv([
    ['진도', '<b>12 / 30차시</b> · 마지막 학습 2026-08-05'],
    ['수강 기간', '2026-06-12 ~ <b>2026-12-12</b> (125일 남음)'],
    ['수료 조건', '진도 80% + 과제 전체 제출 + 최종 시험 60점'],
  ])}</div>
  <div class="btns mt7">
    ${U.btn('이어보기', { cls: 'btn-primary btn-lg', href: 'CL-03' })}
    ${U.btn('내 강의실', { cls: 'btn-ghost btn-lg', href: 'CL-01' })}
  </div>`, { cls: 'mt6' })}

${U.card('선물하고 싶으시다면', `<p class="t-sub">이미 가진 강의도 다른 분께는 선물하실 수 있습니다. 받는 분 이메일로 수강 코드가 갑니다.</p>
  <div class="btns mt4">${U.btnSay('선물하기', '선물 화면으로 갑니다', { cls: 'btn-ghost' })}</div>`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= CO0402 결제 > 쿠폰 적용 실패 ================= */
P['CO0402'] = () => {
  const 보유 = [
    ['신규 가입 20% 할인', '~2026-08-31', true, ''],
    ['여름 특가 1만원', '~2026-08-15', false, '이 강의는 대상이 아닙니다'],
    ['재수강 30% 할인', '~2026-09-30', false, '이미 수강한 강의에만 씁니다'],
  ];

  const body = `
${U.pageHd('쿠폰이 적용되지 않았습니다', '입력하신 코드는 지우지 않았습니다')}

${U.card('쿠폰 코드', `
  <div class="row-c" style="gap:var(--s2)">
    <input class="input grow err" value="SUMMER2025" aria-label="쿠폰 코드" aria-invalid="true">
    ${U.btnSay('적용', '이 코드는 사용 기간이 지났어요', { cls: 'btn-primary' })}
  </div>
  <p class="err-msg mt2">⚠ <b>사용 기간이 지난 코드입니다.</b> (2025-08-31 까지였습니다)</p>

  <div class="box mt6"><b>왜 안 되는지 세 가지로 갈라 알려드립니다</b>
    ${U.table(['사유', '문구', '다음에 할 일'], [
      ['없는 코드', '「그런 코드가 없습니다」', '오타를 확인하거나 보유 쿠폰에서 고르기'],
      ['기간 만료', '「사용 기간이 지난 코드입니다」 + 만료일', '다른 쿠폰 고르기'],
      ['이미 사용', '「이미 쓰신 코드입니다」 + 쓴 날짜', '보유 쿠폰 열기'],
    ])}
    <p class="t-sub mt3">「쿠폰을 적용할 수 없습니다」 하나로 뭉뚱그리면 손님은 무엇을 고쳐야 할지 모릅니다.</p>
  </div>`)}

${U.card('가지고 계신 쿠폰', `<div class="card"><div class="card-bd flush">
  ${보유.map(([nm, exp, ok, 왜]) => `<div class="lrow${ok ? '' : ' is-off'}">
    <span class="badge ${ok ? 'b-pri' : 'b-mut'}">${ok ? '사용 가능' : '사용 불가'}</span>
    <span class="grow"><b>${nm}</b>
      <span class="t-sub" style="display:block">${exp}${왜 ? ` · ${왜}` : ''}</span></span>
    ${ok ? U.btnSay('적용', '쿠폰을 적용했어요. 15,800원 할인됩니다', { cls: 'btn-ghost btn-sm' }) : '<span class="muted">—</span>'}
  </div>`).join('')}
</div></div>`, { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};

/* ================= CO0403 결제 > 환불 규정 미동의 ================= */
P['CO0403'] = () => {
  const body = `
${U.pageHd('동의가 필요한 항목이 있습니다', '체크하지 않은 항목으로 옮겨 드렸습니다')}

${U.banner('danger', '⚠', `<b>환불 규정 동의는 필수입니다.</b>
  <p class="t-sub mt1">법으로 정해진 고지 사항이라 동의 없이는 결제를 진행할 수 없습니다.</p>`,
    U.btnSay('해당 항목으로 이동', '동의 항목으로 옮겼어요', { cls: 'btn-primary' }))}

${U.card('약관 동의', `
  <label class="row-c mb3" style="gap:var(--s2);cursor:pointer">
    <input type="checkbox" checked> <b>이용약관 동의</b> <span class="t-sub">(필수)</span></label>
  <label class="row-c mb3" style="gap:var(--s2);cursor:pointer">
    <input type="checkbox" checked> <b>개인정보 수집·이용 동의</b> <span class="t-sub">(필수)</span></label>

  <div class="box box-danger">
    <label class="row-c" style="gap:var(--s2);cursor:pointer">
      <input type="checkbox" data-gate="pay" data-label="환불 규정 동의"> <b>환불 규정 동의</b>
      <span class="t-sub">(필수)</span> ${U.badge('미동의', 'b-danger')}</label>
    ${U.accordion([{ q: '규정 전문 보기', a: U.kv([
      ['7일 이내 · 진도 10% 미만', '<b>전액 환불</b>'],
      ['7일 이후 또는 진도 10% 이상', '남은 기간에 비례해 환불 (수강 기간 기준)'],
      ['진도 50% 이상', '환불되지 않습니다'],
      ['환불 수단', '<b>결제하신 수단으로만</b> 돌려드립니다'],
    ]) }], { single: true })}
  </div>

  <label class="row-c mt4" style="gap:var(--s2);cursor:pointer">
    <input type="checkbox"> 마케팅 정보 수신 <span class="t-sub">(선택)</span></label>

  <div class="err-msg mt4" data-gatemsg="pay" hidden></div>
  <div class="btns mt7">
    <button class="btn btn-primary btn-lg is-off" type="button" data-gated="pay"
      data-toast="결제창을 엽니다 (견본이라 실제로 결제되지 않습니다)">결제하기</button>
  </div>
  <p class="t-sub mt2">환불 규정에 동의하시면 버튼이 열립니다. 누르면 무엇이 모자란지 알려 드립니다.</p>`)}`;

  return { body, o: { read: true } };
};

/* ================= CO0404 결제 > 결제 수단 확장 ================= */
P['CO0404'] = () => {
  const body = `
${U.pageHd('결제 수단', '고른 수단에 따라 아래가 바뀝니다')}

${U.card('', `${U.tabs([
    { label: '신용·체크카드', pane: 'card' },
    { label: '간편결제', pane: 'easy' },
    { label: '계좌이체', pane: 'bank' },
  ], 0, { panes: 'pay' })}
  <div data-pane-set="pay" class="mt4">
    ${U.pane('card', `
      <div class="box mb4"><b>저장된 카드</b>
        <label class="row-c mt3" style="gap:var(--s2);cursor:pointer">
          <input type="radio" name="card" checked> 신한 1234 <span class="t-sub">(2028-05 만료)</span></label>
        <label class="row-c mt2" style="gap:var(--s2);cursor:pointer">
          <input type="radio" name="card"> 새 카드로 결제</label>
      </div>
      ${U.kv([['할부', `<select class="input" style="width:auto" data-toast="할부 개월을 바꿨어요">
        <option>일시불</option><option>2개월</option><option>3개월 (무이자)</option><option>6개월</option></select>`]])}
      <p class="t-sub mt2">5만원 이상부터 할부를 고르실 수 있습니다. 무이자 여부는 카드사 정책을 따릅니다.</p>`, true)}
    ${U.pane('easy', `<div class="g3">
      ${['카카오페이', '네이버페이', '토스페이'].map((n) =>
        U.btnSay(n, `${n} 계정을 연결합니다 (견본이라 열리지 않습니다)`, { cls: 'btn-ghost btn-lg' })).join('')}
    </div>
    <p class="t-sub mt4">한 번 연결하면 다음부터는 비밀번호만으로 결제됩니다.</p>`)}
    ${U.pane('bank', `${U.kv([
      ['은행', `<select class="input" style="width:auto"><option>국민은행</option><option>신한은행</option><option>우리은행</option></select>`],
      ['입금 기한', '주문 후 <b>24시간</b> — 지나면 자동 취소됩니다'],
    ])}
    <p class="t-sub mt3">계좌이체는 입금이 확인된 뒤에 수강이 열립니다. 보통 5분 안에 처리됩니다.</p>`)}
  </div>`)}

${U.card('현금영수증', `
  <label class="row-c mb3" style="gap:var(--s2);cursor:pointer">
    <input type="checkbox" checked data-toast="현금영수증을 신청합니다"> 현금영수증 신청</label>
  ${U.kv([
    ['용도', `<label class="row-c" style="gap:var(--s4)">
      <span class="row-c" style="gap:6px"><input type="radio" name="rc" checked> 소득공제</span>
      <span class="row-c" style="gap:6px"><input type="radio" name="rc"> 지출증빙</span></label>`],
    ['번호', `<input class="input" placeholder="휴대폰 번호 또는 사업자등록번호" aria-label="현금영수증 번호">`],
  ])}`, { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};

/* ================= CO0405 결제 > 결제 진행 중 ================= */
P['CO0405'] = () => {
  const body = `
${U.pageHd('결제를 진행하고 있습니다', '창을 닫지 말아 주세요')}

${U.card('', `<div class="center" style="padding:var(--s8) 0">
    <span class="spin spin-lg" aria-label="결제 진행 중"></span>
    <h2 class="t-sec mt6">카드사 결제창을 부르고 있어요</h2>
    <p class="t-sub mt3">보통 5초 안에 열립니다. <b>새로고침하거나 뒤로 가지 말아 주세요</b> —
      결제가 중간에 끊기면 승인 여부를 확인하는 데 시간이 걸립니다.</p>
    <div class="btns mt7" style="justify-content:center">
      ${U.btnSay('결제 취소', '결제를 취소했어요. 아무것도 청구되지 않습니다', { cls: 'btn-ghost btn-lg' })}
    </div>
  </div>`)}

${U.banner('info', '⏱', `<b>10초가 지나면 이 문구가 나옵니다.</b>
  <p class="t-sub mt1">「생각보다 오래 걸리고 있어요. 카드사 상황일 수 있습니다.
  <b>결제 버튼을 다시 누르지 마세요</b> — 두 번 청구될 수 있습니다. 1분이 지나도 안 열리면 취소하고 다시 시도해 주세요.」</p>`)}

${U.card('중복 청구를 막는 방법', U.kv([
    ['버튼', '한 번 누르면 잠깁니다 — 두 번 눌러도 주문이 하나만 만들어집니다'],
    ['주문번호', '결제창을 부르기 «전»에 만듭니다. 같은 주문번호로는 승인이 한 번만 됩니다'],
    ['창을 닫았을 때', '주문은 「대기」로 남고 24시간 뒤 자동 취소됩니다'],
    ['이중 승인이 났다면', '자동으로 감지해 나중 건을 취소합니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};

/* ================= CO0502 결제 완료 > 영수증 보기 ================= */
P['CO0502'] = () => {
  const body = `
${U.pageHd('영수증', '주문번호 20260809-004821')}

${U.card('', `${U.kv([
    ['주문번호', '<b class="num">20260809-004821</b>'],
    ['결제일시', '2026-08-09 20:16:42'],
    ['상품', C.name],
    ['결제수단', '신한카드 1234 · 일시불'],
    ['카드 승인번호', '<b class="num">30284917</b>'],
  ])}
  <div class="mt6">${U.sumRows([
    ['강의 정가', U.won(C.was)],
    ['상시 할인', `−${U.won(C.was - C.price)}`],
    ['쿠폰 (신규 가입 20%)', '−15,800원'],
  ], ['실제 결제 금액', U.won(C.price - 15800)])}</div>`)}

${U.card('현금영수증', `${U.kv([
    ['발행 상태', `${U.badge('발행 완료', 'b-ok')} 2026-08-09 20:17`],
    ['용도', '소득공제'],
    ['번호', '010-****-9808'],
  ])}
  <p class="t-sub mt3">국세청 홈택스에 다음 날 반영됩니다.</p>`, { cls: 'mt6' })}

${U.card('', `<div class="btns">
  ${U.btnSay('🖨 인쇄', '인쇄 창을 엽니다', { cls: 'btn-ghost btn-lg' })}
  ${U.btnSay('PDF 저장', '영수증을 PDF로 저장했어요', { cls: 'btn-ghost btn-lg' })}
  ${U.btn('내 강의실로', { cls: 'btn-primary btn-lg', href: 'CL-01' })}
</div>`, { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};

/* ================= CO0602 결제 실패 > 사유별 변형 ================= */
P['CO0602'] = () => {
  const 사유 = [
    ['한도 초과', '이번 달 카드 한도를 넘었습니다', '다른 카드를 쓰시거나, 카드사에 한도 상향을 요청하세요', '간편결제로 하기'],
    ['승인 거절', '카드사에서 승인을 거절했습니다', '카드사에 직접 확인하셔야 합니다. 해외 결제 차단이 걸린 경우가 많습니다', '카드사 연락처 보기'],
    ['잔액 부족', '체크카드 잔액이 모자랍니다', '계좌에 금액을 채우신 뒤 다시 시도해 주세요', '계좌이체로 하기'],
    ['본인인증 실패', '본인인증이 완료되지 않았습니다', '통신사 인증이 끊겼을 수 있습니다. 다시 시도해 주세요', '다시 인증하기'],
  ];

  const body = `
${U.pageHd('결제하지 못했습니다', '무엇이 문제였는지에 따라 다른 안내가 나갑니다')}

${U.card('', U.result('danger', '⚠', '카드 한도를 넘었습니다',
    '이번 달 신한카드 1234 의 한도를 넘었습니다. <b>금액은 청구되지 않았습니다.</b>',
    `${U.btnSay('간편결제로 하기', '간편결제 화면으로 갑니다', { cls: 'btn-primary btn-lg' })}
     ${U.btn('결제 화면으로', { cls: 'btn-ghost btn-lg', href: 'CO-04' })}`))}

${U.card('사유별 안내 문구', `${U.table(
    [{ t: '사유', w: '18%' }, '보여 주는 문구', '다음에 할 일', '버튼'],
    사유.map(([나, 문구, 할일, 버튼]) => [`<b>${나}</b>`, 문구, `<span class="t-sub">${할일}</span>`, `<span class="t-sub">${버튼}</span>`]),
  )}
  <p class="t-sub mt4">「결제에 실패했습니다」 하나로 끝내면 손님은 카드사에 전화할지 다른 카드를 꺼낼지 알 수 없습니다.</p>`,
    { cls: 'mt6' })}

${U.banner('info', '💳', `<b>실패해도 금액은 청구되지 않습니다.</b>
  <p class="t-sub mt1">승인 자체가 안 난 것이라 취소 절차도 필요 없습니다.
  카드 앱에 「승인 취소」가 잠깐 보일 수 있지만 실제 청구는 없습니다.</p>`)}

${U.card('그래도 안 되면', `<p class="t-sub">고객센터로 주문번호와 함께 알려 주시면 확인해 드립니다. 평일 10:00~18:00.</p>
  <div class="btns mt4">${U.btn('고객센터 문의', { cls: 'btn-ghost', href: 'MY-04' })}</div>`, { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};

/* ================= CO0603 결제 실패 > 중복 결제 감지 ================= */
P['CO0603'] = () => {
  const body = `
${U.pageHd('이미 결제하신 강의입니다', '두 번 청구되지 않도록 막았습니다')}

${U.card('', U.result('ok', '🛡', '중복 결제를 막았습니다',
    `<b>${C.name}</b> 은 2026년 6월 12일에 이미 결제하셨습니다.
     이번 승인 건은 <b>자동으로 취소</b>했습니다.`,
    `${U.btn('내 강의실에서 이어보기', { cls: 'btn-primary btn-lg', href: 'CL-03' })}
     ${U.btn('주문 내역 확인', { cls: 'btn-ghost btn-lg', href: 'MY-02' })}`))}

${U.card('처리 내역', `${U.table(['시각', '무엇이', '상태'], [
    ['2026-06-12 14:02', '첫 결제 승인', U.badge('정상', 'b-ok')],
    ['2026-08-09 20:16', '같은 강의 결제 시도', U.badge('중복 감지', 'b-warn')],
    ['2026-08-09 20:16', '승인 자동 취소', U.badge('취소 완료', 'b-ok')],
  ])}
  <p class="t-sub mt4">카드사 취소는 승인 직후라 <b>매입 전 취소</b>로 처리됩니다.
    카드 명세서에는 아예 찍히지 않거나, 찍혔다가 사라집니다 (카드사마다 다릅니다).</p>`, { cls: 'mt6' })}

${U.card('선물하려던 것이었다면', `<p class="t-sub">같은 강의를 다른 분께 주시려면 선물하기를 쓰세요. 중복으로 막히지 않습니다.</p>
  <div class="btns mt4">${U.btnSay('선물하기로 다시', '선물 화면으로 갑니다', { cls: 'btn-ghost' })}</div>`, { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};
