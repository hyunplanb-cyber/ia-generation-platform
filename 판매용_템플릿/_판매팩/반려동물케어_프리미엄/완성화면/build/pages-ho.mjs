/* HO — 홈 (5화면) */
import {
  esc, won, num, ph, phFix, dogPh, badge, stBadge, stars, btn, chips, chip, tabs, pane, tabBox,
  sec, card, box, banner, empty, table, kv, timeline, accordion, pageHd, detail2, stickBar,
  link, vacBadge, noteCard, 조사,
} from './ui.mjs';
import {
  SITE, TODAY, TODAY_STAT, CLASSES, clsNow, PRICE, unit, DAYPLAN, REVIEWS, POSTS,
  FACILITY, SAFETY, STAFF, NOTES, DOGS,
} from './data.mjs';

/* 요금제 3종 — 홈·요금안내·결제가 모두 이 한 벌을 읽는다 */
const PLAN3 = [
  { nm: '1회 이용권', price: PRICE.once, u: '1회', d: '오늘 하루만 맡길 때. 그날 자리가 있으면 바로 씁니다.', tag: '' },
  { nm: '10회 회차권', price: PRICE.packs[0].price, u: `1회당 ${num(unit(PRICE.packs[0]))}원`, d: '회차권은 하루 이용마다 1회씩 차감돼요. 발급일로부터 90일 동안 씁니다.', tag: '가장 많이 씁니다' },
  { nm: '정기 요일권 (주 3회)', price: PRICE.reg[3], u: '월 자동 청구', d: '월·수·금처럼 요일을 정해 두면 그 요일 자리를 먼저 잡아 둡니다.', tag: '자리 우선 확보' },
];

export const PAGES = {
  /* ============================================================
     HO-01 홈 — 스크롤 순서대로 11덩어리
     ============================================================ */
  'HO-01': () => {
    const hero = `<section class="hero">
      <div class="hero-in">
        <span class="live"><span class="dot"></span>지금 등원 중인 아이 ${TODAY_STAT.재원}마리</span>
        <h1 class="mt4">오늘 아침 맡기고<br>저녁에 데려가세요</h1>
        <p class="lead">${esc(SITE.addr.split(',')[0])} · 몸무게와 성향으로 반을 나누는 반려견 유치원</p>
        <div class="cta-row">
          ${btn('등원 예약하기', { href: 'RE-01', cls: 'btn-pri', lg: true })}
          ${btn('반려견 등록하러 가기', { href: 'PL-01', cls: 'btn-ghost', lg: true })}
        </div>
      </div>
      <div class="hero-ph">${ph(['강아지가 뛰노는 대표 사진', 1600, 600], { seed: 'hero', cls: 'ph-sq' })}</div>
    </section>`;

    const body = `
${sec('요금은 세 가지예요', `
  <div class="g3">${PLAN3.map((p) => `<div class="card"><div class="card-bd">
    ${p.tag ? badge(p.tag, 'b-acc') : badge('기본', 'b-mut')}
    <h3 class="t-card mt3">${esc(p.nm)}</h3>
    <div class="t-page mt2 pri">${won(p.price)}</div>
    <div class="t-sub">${esc(p.u)}</div>
    <p class="t-sub mt4">${esc(p.d)}</p>
  </div></div>`).join('')}</div>
  <div class="btns mt6">${btn('요금·코스 보기', { href: 'HO-02', cls: 'btn-sub' })}</div>`,
      { desc: '회차권은 하루 이용마다 1회씩 차감돼요. 남은 횟수는 마이페이지에서 늘 볼 수 있습니다.' })}

${sec('하루 일과', timeline(DAYPLAN.map(([hh, t, d]) => ({ hh, t: esc(t), d: esc(d), k: 'done' }))),
      { desc: `등원 ${SITE.open} · 하원 ${SITE.close}. 그 사이에 이런 하루를 보냅니다.` })}

${sec('반은 이렇게 나눠요', `
  <div class="g3">${CLASSES.map((c) => `<div class="box">
    <div class="t-card">${c.ico} ${esc(c.nm)}</div>
    <div class="t-sub mt1">${esc(c.kg)}</div>
    <p class="t-sub mt3">${esc(c.desc)}</p>
    <div class="mt3">${badge(`오늘 ${clsNow(c.id)}/${c.cap}마리`, 'b-line')}</div>
  </div>`).join('')}</div>
  ${banner('info', '🐾', '<b>큰 아이와 작은 아이는 같이 두지 않아요.</b> 몸무게·견종·사교성으로 반을 나누고, 첫 등원 날 30분 적응 테스트로 성향을 봅니다.', { cls: 'mt6' })}
  <div class="btns mt6">${btn('반 편성 기준 자세히 보기', { href: 'HO-04', cls: 'btn-sub' })}</div>`)}

${sec('저녁마다 이런 알림장을 보내드려요', `
  <div class="car">
    <button class="car-nav prev" type="button" aria-label="이전">‹</button>
    <div class="carousel">
      ${NOTES.slice(0, 5).map((n) => `<a class="item" href="${link('MY-05')}">
        <div class="thumb">${ph(['알림장 사진', 800, 600], { seed: 'home-' + n.id, cls: 'ph-card' })}</div>
        <div class="bd">
          <div class="nm">오늘 ${esc(n.dog)}는 이렇게 놀았어요</div>
          <div class="meta">${esc(n.date)} (${esc(n.dow)}) · 사진 ${n.pics}장</div>
          <p class="t-sub">${esc(n.sum.slice(0, 40))}…</p>
        </div></a>`).join('')}
    </div>
    <button class="car-nav next" type="button" aria-label="다음">›</button>
  </div>`, { desc: '사진 4~6장과 그날 하루 일과를 담아 하원 후에 보냅니다.' })}

${sec('보호자 후기', `
  <div class="car">
    <button class="car-nav prev" type="button" aria-label="이전">‹</button>
    <div class="carousel">
      ${REVIEWS.map((r) => `<div class="box">
        <div>${stars(r.r)}</div>
        <p class="mt2">${esc(r.t)}</p>
        <div class="t-sub mt3">${esc(r.nm)} 님 · ${esc(r.dog)} 보호자</div>
      </div>`).join('')}
    </div>
    <button class="car-nav next" type="button" aria-label="다음">›</button>
  </div>`)}

${sec('', banner('warn', '💉', `<b>종합백신·광견병 접종 증명서가 있어야 등원할 수 있어요.</b>
  <div class="t-sub mt2">둘 다 유효기간 안이어야 합니다. 만료 30일 전에 미리 안내를 보내드려요.</div>`,
      { right: btn('백신 기록 올리기', { href: 'PL-02', cls: 'btn-sub', sm: true }) }))}

${sec('오시는 길', `
  <div class="g2">
    <div>${ph(['지도 썸네일', 800, 600], { seed: 'map', cls: 'ph-sq' })}</div>
    <div class="box">
      ${kv([
        ['주소', esc(SITE.addr)],
        ['전화', esc(SITE.tel)],
        ['운영시간', esc(SITE.hours)],
        ['협력 병원', `${esc(SITE.vet.nm)} · ${esc(SITE.vet.dist)}`],
      ], { cls: 'left' })}
      <div class="btns mt6">${btn('시설 보기', { href: 'HO-03', cls: 'btn-sub' })}</div>
    </div>
  </div>`)}

${sec('이벤트·공지', `<div class="list1">
  ${POSTS.slice(0, 3).map((p) => `<a class="row wrap-row" href="${link('CS-03')}">
    ${stBadge(p.cat)}<span class="grow t-card">${esc(p.t)}</span><span class="t-sub">${esc(p.date)}</span></a>`).join('')}
  </div>
  <div class="btns mt6">${btn('이벤트·공지 전체 보기', { href: 'HO-05', cls: 'btn-sub' })}</div>`)}

${sec('', box(`<div class="row wrap-row">
  <span style="font-size:var(--fs-page)">💬</span>
  <div class="grow"><div class="t-card">궁금한 건 카카오톡으로 물어보세요</div>
    <div class="t-sub mt1">채널 ${esc(SITE.kakao)} · 평일 ${esc(SITE.hours.split('·')[0].trim())}</div></div>
  ${btn('자주 묻는 질문', { href: 'CS-01', cls: 'btn-ghost' })}
</div>`))}`;

    return {
      body,
      o: {
        hero,
        stick: stickBar(
          `<div><div class="t-sub">${esc(TODAY.label)} 기준</div><div class="price">지금 ${TODAY_STAT.재원}마리 등원 중</div></div>`,
          `${btn('요금 보기', { href: 'HO-02', cls: 'btn-ghost' })}${btn('등원 예약하기', { href: 'RE-01', cls: 'btn-pri' })}`,
        ),
      },
    };
  },

  /* ============================================================
     HO-02 요금·코스 안내 — 탭 3개(1회권 / 회차권 / 정기 요일권)
     ============================================================ */
  'HO-02': () => {
    const 회차표 = table(
      ['회차권', { t: '총액', cls: 'r' }, { t: '1회당', cls: 'r' }, { t: '1회권 대비', cls: 'r' }, { t: '유효기간', cls: 'r' }],
      PRICE.packs.map((p) => [
        `<b>${p.n}회권</b>`,
        { t: won(p.price), cls: 'r' },
        { t: `<b class="pri">${won(unit(p))}</b>`, cls: 'r' },
        { t: `<span class="acc">${Math.round((1 - unit(p) / PRICE.once) * 100)}% 싸요</span>`, cls: 'r' },
        { t: `${p.days}일`, cls: 'r' },
      ]),
    );

    const 회차칸 = `
      <div class="g3">${PRICE.packs.map((p, i) => `<div class="card">
        <div class="card-bd">
          ${i === 0 ? badge('가장 많이 씁니다', 'b-acc') : badge(`${p.days}일 동안`, 'b-mut')}
          <h3 class="t-card mt3">${p.n}회권</h3>
          <div class="t-page mt2 pri">${won(p.price)}</div>
          <div class="t-sub">1회당 <b class="acc">${won(unit(p))}</b></div>
          <div class="mt4">${'▮'.repeat(Math.round(unit(p) / 2000))}</div>
          <p class="t-sub mt2">막대가 짧을수록 1회당 값이 쌉니다. 많이 살수록 짧아져요.</p>
        </div></div>`).join('')}</div>
      ${회차표}
      ${banner('warn', '⏳', '<b>기간이 지나면 남은 횟수가 사라져요.</b><div class="t-sub mt2">만료 7일 전에 알림을 보내드립니다. 마이페이지 회차권 현황에서 남은 날짜를 볼 수 있어요.</div>', { cls: 'mt6' })}`;

    const 정기칸 = `
      <div class="g3">${[2, 3, 5].map((n) => `<div class="card"><div class="card-bd">
        ${n === 3 ? badge('가장 많이 씁니다', 'b-acc') : badge(`주 ${n}회`, 'b-mut')}
        <h3 class="t-card mt3">정기 요일권 주 ${n}회</h3>
        <div class="t-page mt2 pri">${won(PRICE.reg[n])}</div>
        <div class="t-sub">월 자동 청구 · 월 약 ${n * 4}회 등원</div>
        <p class="t-sub mt4">요일은 예약 화면에서 고릅니다. 고른 요일의 자리를 먼저 잡아 둬요.</p>
      </div></div>`).join('')}</div>
      ${banner('info', '🔁', '<b>매월 1일에 자동으로 청구됩니다.</b><div class="t-sub mt2">쉬고 싶은 기간에는 마이페이지에서 일시정지를 켜세요. 정지 기간에는 청구가 멈춥니다.</div>', { cls: 'mt6' })}`;

    const 일회칸 = `
      ${box(`<div class="row wrap-row">
        <div class="grow"><h3 class="t-card">1회 이용권</h3>
          <p class="t-sub mt2">오늘 하루만 맡길 때 씁니다. 그날 자리가 있으면 바로 예약할 수 있어요.</p></div>
        <div class="t-page pri">${won(PRICE.once)}</div>
      </div>`)}
      ${card('포함되는 것', `<ul class="stack">
        ${['하루 종일 돌봄 (09:00 ~ 18:00)', '반별 자유놀이와 사회화 훈련', '점심·간식 급여와 배변 기록',
          '낮잠 시간 (아이마다 잠자리 따로)', '그날의 알림장 (사진 4~6장)'].map((t) => `<li class="row"><span class="ok">✓</span><span>${esc(t)}</span></li>`).join('')}
      </ul>`, { cls: 'mt6' })}`;

    const body = `${pageHd('요금·코스 안내', '세 가지 중에서 고르시면 됩니다. 회차권과 정기권은 언제든 함께 쓸 수 있어요.')}

${tabBox(
      [{ label: '1회 이용권', pane: 'a' }, { label: '회차권', pane: 'b' }, { label: '정기 요일권', pane: 'c' }],
      pane('a', 일회칸, true) + pane('b', 회차칸) + pane('c', 정기칸),
      0,
    )}

${sec('추가로 넣을 수 있는 것', table(
      ['항목', { t: '값', cls: 'r' }, '설명'],
      PRICE.opt.map(([nm, p, d]) => [`<b>${esc(nm)}</b>`, { t: won(p), cls: 'r' }, `<span class="t-sub">${esc(d)}</span>`]),
    ))}

${sec('할인', `<div class="g2">
  ${box(`<div>${badge(`형제견 ${PRICE.siblingOff}% 할인`, 'b-acc')}</div>
    <p class="mt3">두 마리 이상 등록하시면 둘째 아이부터 ${PRICE.siblingOff}% 할인합니다. 결제 화면에서 자동으로 붙어요.</p>`)}
  ${box(`<div>${badge('성수기·공휴일 할증', 'b-warn')}</div>
    <p class="mt3">여름 성수기 ${PRICE.peakOn}%, 공휴일 ${PRICE.holidayOn}% 할증이 붙습니다. 예약 화면에서 미리 알려드려요.</p>`)}
</div>`)}

${sec('결제 수단', `<div class="row wrap-row">
  ${['💳 신용·체크카드', '📱 간편결제', '🏦 계좌이체'].map((t) => `<span class="badge b-line">${t}</span>`).join('')}
</div>
<p class="t-sub mt3">정기 요일권은 카드 자동 청구만 됩니다. 계좌이체는 회차권 구매에만 쓸 수 있어요.</p>`)}

<div class="btns mt8">
  ${btn('예약하기', { href: 'RE-01', cls: 'btn-pri' })}
  ${btn('반 편성 기준 보기', { href: 'HO-04', cls: 'btn-ghost' })}
</div>`;

    return { body, o: {} };
  },

  /* ============================================================
     HO-03 시설·프로그램 소개
     ============================================================ */
  'HO-03': () => {
    const body = `${pageHd('시설·프로그램 소개', '아이가 하루를 보내는 자리입니다. 어디에서 무엇을 하는지 그대로 보여드려요.')}

${sec('시설 사진', `<div class="cards">
  ${FACILITY.map(([nm, w, h, d]) => `<button class="item" type="button" data-toast="${esc(nm)} 사진을 크게 봅니다">
    <div class="thumb">${ph([nm, w, h], { seed: nm, cls: 'ph-card' })}</div>
    <div class="bd"><div class="nm">${esc(nm)}</div><div class="meta">${esc(d)}</div></div>
  </button>`).join('')}
</div>`, { desc: '썸네일을 누르면 크게 볼 수 있어요.' })}

${sec('', banner('info', '📹', `<b>보호자님도 언제든 확인하세요 — CCTV 실시간 공개</b>
  <div class="t-sub mt2">실내 6대·마당 2대. 마이페이지에서 아이디를 받아 보시면 됩니다. 녹화본은 7일간 보관합니다.</div>`,
      { right: btn('마이페이지', { href: 'MY-01', cls: 'btn-sub', sm: true }) }))}

${sec('원장·보육교사', `<div class="g3">
  ${STAFF.filter((s) => s.st === '활성').map((s) => `<div class="card"><div class="card-bd center">
    <div style="display:flex;justify-content:center">${phFix(['프로필', 400, 400], 96, { cls: 'ph-round', seed: s.nm })}</div>
    <div class="t-card mt4">${esc(s.nm)}</div>
    <div class="t-sub">${esc(s.role)} · 경력 ${esc(s.career)}</div>
    <div class="mt3">${s.cls.map((c) => badge(c, 'b-line')).join(' ')}</div>
    <p class="t-sub mt3">반려동물관리사 · 반려견스타일리스트 · 응급처치 교육 이수</p>
  </div></div>`).join('')}
</div>`)}

${sec('하루 프로그램', table(
      ['시간', '프로그램', '무엇을 하나요'],
      DAYPLAN.map(([hh, t, d]) => [{ t: `<b class="num">${hh}</b>`, cls: 'nowrap' }, `<b>${esc(t)}</b>`, `<span class="t-sub">${esc(d)}</span>`]),
    ))}

${sec('안전 설비', `<div class="g2">
  ${SAFETY.map(([nm, d]) => `<div class="box"><div class="t-card">${esc(nm)}</div><p class="t-sub mt2">${esc(d)}</p></div>`).join('')}
</div>`)}

${sec('위생·소독 정책', `<div class="list1">
  ${[['매일 13:00 · 19:00', '장난감·매트·바닥 전체 소독'], ['주 1회 (월요일)', '공기청정기 필터 교체와 환기구 청소'],
    ['월 1회', '방역업체 정기 방역'], ['등원할 때마다', '발 세척과 체온 확인']].map(([w, d]) => `<div class="row wrap-row">
    ${badge(w, 'b-acc')}<span class="grow">${esc(d)}</span></div>`).join('')}
</div>`)}

${sec('비상 상황이 생기면', `
  ${box(`<div class="t-card">${esc(SITE.vet.nm)}</div>
    <div class="t-sub mt1">${esc(SITE.vet.dist)} · ${esc(SITE.vet.tel)}</div>
    <p class="mt4">협약을 맺어 두어 진료 대기 없이 바로 볼 수 있습니다.</p>`)}
  <div class="mt6">${timeline([
    { t: '① 상황 발생 즉시 응급처치', d: '현관과 놀이터의 응급 키트로 지혈·소독을 먼저 합니다.', k: 'done' },
    { t: '② 보호자에게 전화', d: '등록된 번호로 먼저 걸고, 안 받으면 비상 연락처로 겁니다.', k: 'done' },
    { t: '③ 필요하면 병원 이송', d: `${esc(SITE.vet.nm)}으로 보육교사가 동행합니다.`, k: 'done' },
    { t: '④ 사고 기록과 알림', d: '경위·부위·처치를 기록하고 사진과 함께 알림장으로 보내드립니다.', k: 'done' },
  ])}</div>`)}

<div class="btns mt8">
  ${btn('반 편성 기준 보기', { href: 'HO-04', cls: 'btn-ghost' })}
  ${btn('예약하기', { href: 'RE-01', cls: 'btn-pri' })}
</div>`;
    return { body, o: {} };
  },

  /* ============================================================
     HO-04 반 편성 기준 소개
     ============================================================ */
  'HO-04': () => {
    const body = `${pageHd('반 편성 기준', '아무 반에나 섞지 않습니다. 몸무게와 성향으로 나누고, 그 근거를 그대로 알려드려요.')}

${banner('info', '🐾', '<b>몸무게와 성향으로 반을 나눠요. 큰 아이와 작은 아이는 같이 두지 않아요.</b><div class="t-sub mt2">놀이 공간이 벽으로 나뉘어 있고, 산책 시간도 반마다 다릅니다.</div>')}

${sec('몸무게 구간', `<div class="g3">
  ${CLASSES.map((c) => `<div class="card"><div class="card-bd">
    <div style="font-size:var(--fs-page)">${c.ico}</div>
    <h3 class="t-card mt2">${esc(c.nm)}</h3>
    <div class="t-sec pri mt1">${esc(c.kg)}</div>
    <p class="t-sub mt4">${esc(c.desc)}</p>
    <div class="mt4 t-sub"><b>하루 일정 예시</b></div>
    <ul class="stack mt2">${(c.id === 'sm'
      ? ['09:30 짧은 놀이 (20분씩 3번)', '11:00 이름 부르면 오기', '13:30 낮잠 2시간', '15:30 실내 간식']
      : c.id === 'md'
        ? ['09:30 자유놀이 60분', '11:00 사회화 훈련', '13:30 낮잠 2시간', '15:30 마당 산책 30분']
        : ['09:30 마당 자유놀이 80분', '11:00 기초 훈육', '13:30 낮잠 2시간', '15:30 마당 산책 40분']
    ).map((t) => `<li class="t-sub">· ${esc(t)}</li>`).join('')}</ul>
    <div class="mt4">${badge(`오늘 ${clsNow(c.id)}마리 / 정원 ${c.cap}`, 'b-line')}</div>
  </div></div>`).join('')}
</div>`)}

${sec('처음 등원하는 날', `${timeline([
      { t: '① 보호자와 함께 30분 적응 테스트', d: '낯선 공간에서 어떻게 행동하는지, 다른 아이에게 어떻게 다가가는지 봅니다.', k: 'done' },
      { t: '② 사교성 평가 5문항', d: '먼저 다가감 · 짖음 · 장난감 다툼 · 사람 반응 · 분리 반응을 각각 3단계로 적습니다.', k: 'done' },
      { t: '③ 반 확정', d: '몸무게 구간 안에서, 성향에 맞는 반으로 정합니다. 결과는 그날 알려드려요.', k: 'done' },
      { t: '④ 첫 주 관찰', d: '일주일 동안 적응을 보고, 안 맞으면 반을 옮깁니다.', k: 'on' },
    ])}`, { desc: '몸무게가 첫 기준이지만, 그것만으로 정하지 않습니다.' })}

${sec('따로 봐야 하는 아이', `<div class="g2">
  ${box(`<div>${badge('소그룹 전환', 'b-warn')}</div>
    <div class="t-card mt3">짖음이 심한 경우</div>
    <p class="t-sub mt2">다른 아이들이 긴장합니다. 3~4마리 소그룹으로 옮겨 자극을 줄이고, 2주 동안 다시 봅니다.</p>`)}
  ${box(`<div>${badge('개별 관리', 'b-dan')}</div>
    <div class="t-card mt3">공격성이 보이는 경우</div>
    <p class="t-sub mt2">즉시 분리하고 보호자께 연락드립니다. 개별 돌봄으로 전환하거나, 맞지 않으면 솔직하게 말씀드려요.</p>`)}
</div>`)}

${sec('반을 바꾸고 싶으시면', `${box(`<p>다음 두 경우에는 언제든 요청하실 수 있어요.</p>
  <ul class="stack mt4">
    <li class="row"><span class="pri">·</span><span><b>몸무게가 늘었을 때</b> — 매달 체중을 재서 구간이 바뀌면 저희가 먼저 말씀드립니다.</span></li>
    <li class="row"><span class="pri">·</span><span><b>적응이 안 될 때</b> — 알림장에 「친구들과 잘 못 어울려요」가 이어지면 반을 옮겨 봅니다.</span></li>
  </ul>
  <div class="btns mt6">${btn('1:1 문의로 요청하기', { href: 'CS-02', cls: 'btn-sub' })}</div>`)}`)}

${sec('견종별 유의사항', banner('warn', '☀️', `<b>단두종(불독·퍼그·시츄·페키니즈 등)은 여름철 실외 활동 시간을 줄입니다.</b>
  <div class="t-sub mt2">체감온도 28도가 넘으면 마당에 나가지 않고 실내 놀이로 바꿉니다.
  코가 짧아 열을 못 내보내기 때문이에요. 등록하실 때 견종을 적어 주시면 저희가 알아서 챙깁니다.</div>`))}

<div class="btns mt8">
  ${btn('예약하기', { href: 'RE-01', cls: 'btn-pri' })}
  ${btn('자주 묻는 질문', { href: 'CS-01', cls: 'btn-ghost' })}
</div>`;
    return { body, o: {} };
  },

  /* ============================================================
     HO-05 이벤트·공지 목록 — 거르기·더 보기·쪽수가 «실제로» 돈다
     ============================================================ */
  'HO-05': () => {
    const 고정 = POSTS.filter((p) => p.pin);
    const 나머지 = POSTS.filter((p) => !p.pin);
    const 줄 = (p) => `<div class="rowcard" data-tag="${esc(p.cat)}" data-href="${link('CS-03')}">
      ${p.thumb ? `<div class="thumb">${ph(['이벤트 배너', 800, 800], { seed: p.id, cls: 'ph-sq' })}</div>` : ''}
      <div class="bd">
        <div class="row wrap-row">${stBadge(p.cat)}<span class="t-sub">${esc(p.date)}</span></div>
        <div class="t-card mt2">${esc(p.t)}</div>
      </div>
      <div class="side">${btn('보기', { href: 'CS-03', cls: 'btn-ghost', sm: true })}</div>
    </div>`;
    const 쪽수 = Math.ceil(나머지.length / 5);

    const body = `${pageHd('이벤트·공지', '휴무일과 정책이 바뀌면 여기에 먼저 올립니다.')}

${고정.map((p) => `<div class="box mb6" style="border-left:4px solid var(--primary)">
  <div class="row wrap-row">${badge('중요', 'b-solid')}${stBadge(p.cat)}<span class="t-sub">${esc(p.date)}</span></div>
  <div class="t-card mt3">${esc(p.t)}</div>
  <div hidden data-more-body="pin" class="mt4">
    <p>9월 24일(목)부터 27일(일)까지 추석 연휴로 쉽니다. 28일(월)부터 평소대로 엽니다.</p>
    <p class="mt3">연휴 기간에 잡혀 있던 정기 등원 요일은 <b class="hl">회차권으로 자동 전환</b>되어 돌려드립니다.
    따로 신청하지 않으셔도 됩니다. 정기권 자동 청구도 그만큼 줄여서 청구합니다.</p>
    <p class="mt3">급한 일이 있으시면 카카오톡 채널 ${esc(SITE.kakao)}로 남겨 주세요. 연휴에도 하루 한 번 확인합니다.</p>
  </div>
  <div class="btns mt4">
    ${btn('내용 펼치기 ▾', { cls: 'btn-sub', sm: true, attr: ' data-more-toggle="pin" data-more-label="내용 펼치기 ▾"' })}
    ${btn('공지 전문 보기', { href: 'CS-03', cls: 'btn-ghost', sm: true })}
  </div>
</div>`).join('')}

${chips(['전체', '공지', '이벤트', '휴무'], 0, { boxAttr: ' data-filter-for="post" data-pick-scope="post"' })}

<p class="t-sub mt6 mb4"><b data-filter-cnt="post">${나머지.length}</b>건이 있어요</p>

<div class="stack" data-filter-list="post" data-per-page="5" style="gap:var(--sp-item)">
  ${나머지.map(줄).join('')}
</div>
<div hidden data-empty-for="post">${empty('🔍', '결과가 없습니다', '고르신 분류에 해당하는 글이 없어요. 다른 분류를 눌러 보세요.', btn('전체 보기', { href: 'HO-05', cls: 'btn-pri' }))}</div>

<div class="btns mt8" style="justify-content:center" data-page-box="post">
  ${Array.from({ length: 쪽수 }).map((_, i) => `<button class="chip${i === 0 ? ' on' : ''}" type="button" data-page-for="post" data-page-n="${i + 1}">${i + 1}</button>`).join('')}
  <span class="t-sub" style="align-self:center"><b data-page-all="post">${쪽수}</b>쪽 중 <b data-page-now="post">1</b>쪽</span>
</div>

<div class="btns mt8">
  ${btn('공지 상세 보기', { href: 'CS-03', cls: 'btn-ghost' })}
  ${btn('홈으로', { href: 'HO-01', cls: 'btn-sub' })}
</div>`;
    return { body, o: {} };
  },
};
