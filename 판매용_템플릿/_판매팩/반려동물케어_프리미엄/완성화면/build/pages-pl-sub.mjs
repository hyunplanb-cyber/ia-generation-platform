/* PL 반려견 등록 — 잎사귀 15장.
   부모(PL0101·PL0201·PL0301·PL0401)의 뼈대·색·톤은 U.shell() 이 그대로 유지해 준다.
   여기서는 그 화면의 «상태·세부» 하나만 또렷이 보여 준다.

   ⚠ 강아지 사진 자리에는 반드시 dogPh()/phFix(cls:'ph-dog') 를 쓴다.
     ph-round 를 쓰면 이미지-끼우기.mts 가 «사람 얼굴»을 끼워 넣는다(2026-08-24 실제 사고).
   ⚠ 몸무게 구간·반 정원·백신 남은 일수·회차권 잔여는 전부 data.mjs 에서 읽는다.
     이 파일에 숫자를 다시 적지 않는다. */
import {
  esc, num, 조사, ph, phFix, dogPh, badge, btn, chips, pane, tabBox,
  sec, card, box, banner, empty, table, kv, steps, accordion,
  leafHd, stickBar, modal, done,
  field, input, select, check, toggle, radioRow, uploadDrop, vacBadge, noteCard,
} from './ui.mjs';
import {
  SITE, TODAY, DOGS, DOG, MINE, ME, CLASSES, clsNow,
  NOTES, VAC_LOG, MY_PASS, MY_PASS2, PRICE,
} from './data.mjs';

const P = {};
export const PAGES = P;

const 초코 = DOG('d01');
const 보리 = DOG('d02');
const 등록단계 = ['① 기본 정보', '② 백신 기록', '③ 건강·특이사항'];

/* 몸무게 → 반. 경계값은 CLASSES 의 kgMin·kgMax 에서만 읽는다 */
const 반찾기 = (kg) => CLASSES.find((c) => kg >= c.kgMin && kg < c.kgMax) || CLASSES[CLASSES.length - 1];
/* app.js 의 [data-weight-out] 이 쓰는 것과 «같은 모양»으로 처음 값을 적어 둔다 —
   화면을 열자마자 적혀 있는 말과 손으로 고쳤을 때 나오는 말이 어긋나지 않게. */
const 반안내 = (kg) => {
  const c = 반찾기(kg);
  return `예상 반 <b class="pri">${esc(c.nm)}</b> <span class="t-sub">(${esc(c.kg)})</span>`;
};

/* 날짜 셈 — 오늘(TODAY)에서 며칠 뒤인가. 숫자를 손으로 적지 않으려고 둔다 */
const 며칠뒤 = (ymd) => {
  const [y, m, d] = String(ymd).split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(TODAY.y, TODAY.m - 1, TODAY.d)) / 86400000);
};
const 한해뒤 = (ymd) => {
  const [y, m, d] = String(ymd).split('-').map(Number);
  return `${y + 1}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};
/* 남은 일수 → 배지. 정상/임박/만료 세 갈래는 data.mjs 의 vac 이름과 같게 맞춘다 */
const 기한배지 = (남) => (남 < 0
  ? badge(`만료 ${Math.abs(남)}일 지남`, 'b-dan')
  : (남 <= 30 ? badge(`임박 D-${남}`, 'b-warn') : badge(`정상 (${남}일 남음)`, 'b-ok')));

/* ============================================================
   PL0102 반려견 등록 > 몸무게 구간 실시간 안내
   ⭐ 몸무게를 고치면 예상 반이 «실제로» 바뀐다 (app.js data-weight)
   ============================================================ */
P['PL0102'] = (ctx) => {
  const 적은무게 = 4.8;                       // 화면에 미리 적혀 있는 값
  const 지금반 = 반찾기(적은무게);
  const 경계 = CLASSES[0].kgMax;              // 소형반과 중형반이 갈리는 자리
  const 차이 = (경계 - 적은무게).toFixed(1);

  const body = `${leafHd(ctx, '몸무게를 적는 순간 어느 반이 될지 바로 보여 줍니다. 숫자를 고쳐 보세요.')}

${steps(등록단계.map((t) => [t, '']), 0)}

${card('몸무게', `
  <div class="row wrap-row">
    <div style="width:180px">${input({ type: 'number', v: String(적은무게), attr: ' data-weight step="0.1" min="0"' })}</div>
    <span class="t-sub">kg</span>
    <div class="grow t-card" data-weight-out>${반안내(적은무게)}</div>
  </div>
  <p class="hint">위 칸의 숫자를 바꾸면 오른쪽 안내가 그 자리에서 따라 바뀝니다.</p>`, { cls: 'mt8' })}

${banner('warn', '⚖️', `<b>${적은무게}kg 은 ${esc(CLASSES[0].nm)}과 ${esc(CLASSES[1].nm)}이 갈리는 ${경계}kg 에서 ${차이}kg 차이입니다.</b>
  <div class="t-sub mt2">경계에 가까운 아이는 첫 등원 날 30분 적응 테스트로 성향까지 보고 <b>최종 반이 확정</b>됩니다.
  ${차이}kg 은 한 달 사이에도 오르내리는 폭이라, 숫자만으로 반을 못 박지 않습니다.</div>`, { cls: 'mt6' })}

${sec('반 구간표', `<div class="g3">
  ${CLASSES.map((c) => `<div class="box"${c.id === 지금반.id ? ' style="border-color:var(--primary)"' : ''}>
    <div class="row-b">
      <div class="t-card">${c.ico} ${esc(c.nm)}</div>
      ${c.id === 지금반.id ? badge('지금 이 반', 'b-solid') : ''}
    </div>
    <div class="t-sub mt2">${esc(c.kg)} (${c.kgMin}kg 이상${c.kgMax >= 99 ? '' : ` ${c.kgMax}kg 미만`})</div>
    <div class="t-sub mt1">오늘 ${clsNow(c.id)}/${c.cap}마리</div>
    <p class="t-sub mt3">${esc(c.desc)}</p>
  </div>`).join('')}
</div>`, { desc: '몸무게가 반 배정의 첫 기준입니다. 아래 세 구간 중 어디에 드는지가 바로 정해집니다.' })}

${banner('info', 'ℹ️', '몸무게는 나중에 프로필에서 고칠 수 있어요. 고치면 반 재배정 여부를 다시 알려드립니다.', { cls: 'mt6' })}`;

  return {
    body,
    o: {
      stick: stickBar(
        '<div class="t-sub">1단계 / 3단계 · 다음은 백신 기록이에요</div>',
        `${btn('등록 화면으로', { href: 'PL0101', cls: 'btn-ghost' })}
         ${btn('다음: 백신 기록 올리기', { href: 'PL0201', cls: 'btn-pri' })}`,
      ),
    },
  };
};

/* ============================================================
   PL0103 반려견 등록 > 견종 자동완성 검색
   ⭐ 찾기 칸이 «실제로» 목록을 줄인다 (data-search-for)
   ============================================================ */
P['PL0103'] = (ctx) => {
  /* 견종 목록은 지어내지 않는다 — 지금 원에 다니는 아이들의 견종에서 «세어» 만든다 */
  const 견종들 = [...new Set(DOGS.map((d) => d.breed))].map((nm) => {
    const 무리 = DOGS.filter((d) => d.breed === nm);
    const 평균 = 무리.reduce((s, d) => s + d.kg, 0) / 무리.length;
    return { nm, n: 무리.length, kg: Math.round(평균 * 10) / 10, cls: 반찾기(평균) };
  }).sort((a, b) => a.kg - b.kg);

  const body = `${leafHd(ctx, '견종 칸에 글자를 넣으면 목록이 그 자리에서 줄어듭니다.')}

${card('견종', `
  ${field('견종 찾기', input({ ph: '예: 말티즈 — 두 글자만 적어도 찾아드려요', attr: ' data-search-for="breed"' }), { req: true })}
  <div class="row-b wrap-row mt4">
    <div class="t-sub">찾은 견종 <b class="num" data-filter-cnt="breed">${견종들.length}</b>개
      · 적은 말 「<b data-search-word="breed">—</b>」</div>
    ${chips(['전체', ...CLASSES.map((c) => c.nm)], 0, { boxAttr: ' data-filter-for="breed"' })}
  </div>

  <div class="list1 mt4" data-filter-list="breed">
    ${견종들.map((b) => `<div class="row-b wrap-row" data-tag="${esc(b.cls.nm)}">
      <div class="grow">
        <div class="t-card">${esc(b.nm)}</div>
        <div class="t-sub mt1">원에 다니는 아이 ${b.n}마리 · 평균 ${b.kg}kg</div>
      </div>
      <div class="center" style="width:120px">
        ${badge(`${b.cls.ico} ${b.cls.nm}`, 'b-line')}
        <div class="t-sub mt1">${esc(b.cls.kg)}</div>
      </div>
    </div>`).join('')}
  </div>

  <div data-empty-for="breed" hidden>
    ${empty('🔎', '그 견종은 아직 목록에 없어요',
    '괜찮습니다. 아래 칸에 직접 적어 주시면 그대로 등록됩니다. 몸무게로 반을 정하니 견종 이름이 목록에 없어도 문제 없어요.',
    btn('직접 적은 이름으로 등록하기', { cls: 'btn-pri', attr: ' data-toast="적어 주신 견종 이름으로 등록했어요 — 반은 몸무게로 정해집니다"' }))}
    <div class="mt4">${field('견종 직접 적기', input({ ph: '예: 잭러셀테리어' }), { hint: '섞인 견종이면 「믹스(중형)」처럼 적으셔도 됩니다' })}</div>
  </div>`, { cls: 'mt8' })}

${banner('info', '🐶', `<b>견종은 반을 정하지 않습니다 — 몸무게가 정합니다.</b>
  <div class="t-sub mt2">위 목록의 「${esc(CLASSES[0].nm)}·${esc(CLASSES[1].nm)}·${esc(CLASSES[2].nm)}」 표시는
  같은 견종 아이들의 평균 몸무게로 미리 보여 드리는 것입니다. 실제 반은 우리 아이의 몸무게로 정해져요.</div>`, { cls: 'mt6' })}`;

  return {
    body,
    o: {
      stick: stickBar(
        '<div class="t-sub">견종을 고르면 그대로 기본 정보 칸에 적힙니다</div>',
        btn('등록 화면으로 돌아가기', { href: 'PL0101', cls: 'btn-pri' }),
      ),
    },
  };
};

/* ============================================================
   PL0104 반려견 등록 > 형제견 추가
   ============================================================ */
P['PL0104'] = (ctx) => {
  const 같은반 = 초코.cls === 보리.cls;
  const 아이카드 = (d, 차례) => `<div class="box">
    <div class="row-b wrap-row">
      <div class="row wrap-row grow">
        ${dogPh(d.nm, 56)}
        <div class="grow">
          <div class="t-card">${차례}번째 아이 · ${esc(d.nm)}</div>
          <div class="t-sub mt1">${esc(d.breed)} · ${d.kg}kg · ${esc(d.age)} · ${esc(d.sex)}</div>
        </div>
      </div>
      <div class="btns">
        ${badge(`${반찾기(d.kg).ico} ${반찾기(d.kg).nm}`, 'b-line')}
        ${btn('지우기', { cls: 'btn-ghost', sm: true, attr: ' data-close=".box"' })}
      </div>
    </div>
  </div>`;

  const body = `${leafHd(ctx, `한 번에 여러 마리를 등록할 수 있어요. 둘째 아이부터 ${PRICE.siblingOff}% 할인이 자동으로 붙습니다.`)}

${card(`등록할 아이 ${MINE.length}마리`, `
  <div class="stack" style="gap:var(--sp-item)">
    ${MINE.map((d, i) => 아이카드(d, i + 1)).join('')}
  </div>

  <div class="btns mt6">
    ${btn('＋ 반려견 추가', { cls: 'btn-sub', attr: ' data-more-toggle="dog3" data-more-label="＋ 반려견 추가"' })}
  </div>

  <div class="mt6" data-more-body="dog3" hidden>
    ${box(`<div class="t-card mb4">${MINE.length + 1}번째 아이</div>
      ${field('이름', input({ ph: '아이 이름' }), { req: true })}
      <div class="f2">
        ${field('견종', input({ ph: '견종을 적으면 자동으로 찾아드려요' }), { req: true })}
        ${field('몸무게', input({ type: 'number', ph: '0.0', attr: ' step="0.1" min="0"' }), { req: true, hint: 'kg' })}
      </div>
      <div class="f2">
        ${field('성별', radioRow('sex3', ['남아', '여아'], 0), { req: true })}
        ${field('중성화', radioRow('neut3', ['했어요', '안 했어요'], 0))}
      </div>`)}
  </div>`, { cls: 'mt8' })}

${banner(같은반 ? 'ok' : 'warn', '🐕‍🦺',
    같은반
      ? `<b>${esc(초코.nm)}와 ${esc(보리.nm)}는 같은 반에서 함께 지냅니다.</b>`
      : `<b>${esc(초코.nm)}와 ${esc(보리.nm)}는 다른 반이 됩니다.</b>
       <div class="t-sub mt2">${esc(초코.nm)} ${초코.kg}kg → ${esc(반찾기(초코.kg).nm)} · ${esc(보리.nm)} ${보리.kg}kg → ${esc(반찾기(보리.kg).nm)}.
       몸무게 차이가 큰 아이들은 놀이 공간을 따로 씁니다. 등하원은 함께 하고, 노는 시간만 나뉘어요.</div>`,
    { cls: 'mt6' })}

${card('형제견 할인', `
  ${kv([
    ['첫째 아이', '정가'],
    ['둘째 아이부터', `<b class="pri">${PRICE.siblingOff}% 할인</b>`],
    ['적용 시점', '결제 화면에서 자동으로 붙습니다'],
  ])}
  <p class="hint">할인은 등록한 마리 수로 정해집니다. 나중에 한 마리를 지우면 할인도 함께 사라져요.</p>`, { cls: 'mt6' })}`;

  return {
    body,
    o: {
      stick: stickBar(
        `<div class="t-sub">${MINE.length}마리를 등록하고 있어요 · 백신 기록은 아이마다 따로 올립니다</div>`,
        btn('다음: 백신 기록 올리기', { href: 'PL0201', cls: 'btn-pri' }),
      ),
    },
  };
};

/* ============================================================
   PL0105 반려견 등록 > 필수 항목 누락
   ⭐ 「등록하기」는 잠긴 <button> 이다. 세 칸을 다 확인해야 열린다.
   ============================================================ */
P['PL0105'] = (ctx) => {
  const 빠진곳 = [
    ['이름', 'f-name', '아이를 부를 이름이 없으면 등하원 체크 화면에 띄울 수 없어요'],
    ['견종', 'f-breed', '여름철 실외 활동을 줄여야 하는 아이인지 견종으로 먼저 봅니다'],
    ['몸무게', 'f-kg', '몸무게가 없으면 반을 배정할 수 없습니다'],
  ];

  const body = `${leafHd(ctx, `필수 항목 ${빠진곳.length}곳이 비어 있어 등록을 마칠 수 없습니다.`)}

${steps(등록단계.map((t) => [t, '']), 0)}

${banner('dan', '⚠️', `<b>필수 항목 ${빠진곳.length}곳이 비어 있어요.</b>
  <div class="t-sub mt2">${빠진곳.map(([nm]) => esc(nm)).join(' · ')} — 아래 붉은 칸을 채워 주세요.</div>`,
    { cls: 'mt8', right: `<a class="btn btn-dan btn-sm" href="#${빠진곳[0][1]}">첫 누락 항목으로 이동</a>` })}

${card('기본 정보', `
  ${field('이름', input({ ph: '초코', cls: 'is-err' }), { req: true, id: 빠진곳[0][1], err: `이름을 적어 주세요 — ${빠진곳[0][2]}` })}
  <div class="f2">
    ${field('견종', input({ ph: '견종을 입력하면 자동으로 찾아드려요', cls: 'is-err' }), { req: true, id: 빠진곳[1][1], err: `견종을 적어 주세요 — ${빠진곳[1][2]}` })}
    ${field('생년월일', input({ type: 'date' }), { hint: '필수는 아니에요. 모르시면 비워 두셔도 됩니다' })}
  </div>
  <div class="f2">
    ${field('성별', radioRow('sex5', ['남아', '여아'], 0), { req: true, hint: '✓ 남아로 적혀 있어요' })}
    ${field('중성화', radioRow('neut5', ['했어요', '안 했어요'], 0), { hint: '✓ 했어요로 적혀 있어요' })}
  </div>`, { cls: 'mt6' })}

${card('몸무게', `
  <div class="row wrap-row">
    <div style="width:180px">${input({ type: 'number', ph: '8.4', cls: 'is-err', attr: ' data-weight step="0.1" min="0"' })}</div>
    <span class="t-sub">kg</span>
    <div class="grow t-card" data-weight-out><span class="t-sub">몸무게를 적으면 예상 반을 알려드려요</span></div>
  </div>
  <span class="err">몸무게를 적어 주세요 — ${빠진곳[2][2]}</span>`,
    { cls: 'mt6', attr: ` id="${빠진곳[2][1]}"` })}

${card(`빠진 곳 ${빠진곳.length}가지`, `<div data-agree-scope>
  <p class="t-sub mb4">채운 칸을 하나씩 표시해 보세요. ${빠진곳.length}곳을 모두 표시하면 아래 「등록하기」가 열립니다.</p>
  ${빠진곳.map(([nm, , why]) => check(`<b>${esc(nm)}</b>${조사(nm, '을', '를').slice(nm.length)} 채웠어요`, { sub: esc(why), attr: ' data-agree' })).join('')}
  <span data-unlock-all="plDone" hidden></span>
</div>`, { cls: 'mt6' })}

${banner('info', 'ℹ️', '* 표시가 붙지 않은 칸(생년월일·성향·목줄)은 비워 두셔도 등록이 됩니다. 나중에 프로필에서 채우실 수 있어요.', { cls: 'mt6' })}`;

  return {
    body,
    o: {
      stick: stickBar(
        `<div class="t-sub dan">필수 ${빠진곳.length}곳이 비어 있어 다음으로 넘어갈 수 없어요</div>`,
        `${btn('등록 화면으로', { href: 'PL0101', cls: 'btn-ghost' })}
         ${btn('등록하기', { cls: 'btn-pri', id: 'plDone', off: true, attr: ' data-toast="필수 항목을 다 채웠어요 — 백신 기록 단계로 넘어갑니다"' })}`,
      ),
    },
  };
};

/* ============================================================
   PL0202 백신 접종 기록 업로드 > 유효기간 자동 계산
   ⭐ 접종일을 고르면 유효기간이 «실제로» 계산돼 나온다 (app.js data-vac-date)
   ============================================================ */
P['PL0202'] = (ctx) => {
  const 광견병 = VAC_LOG.find((v) => v.kind === '광견병');
  const 광남 = 며칠뒤(광견병.until);
  const 규칙대로 = 한해뒤(광견병.date);

  const 이력 = VAC_LOG.map((v) => {
    const 남 = 며칠뒤(v.until);
    const 규칙 = 한해뒤(v.date);
    return [
      v.date,
      esc(v.kind),
      `${v.until}${v.until === 규칙 ? '' : ` ${badge('증명서에 적힌 날짜', 'b-line')}`}`,
      남 < 0 ? badge('지난 기록', 'b-mut') : 기한배지(남),
    ];
  });

  const body = `${leafHd(ctx, '접종일만 고르시면 만료 예정일과 남은 날수를 저희가 계산합니다.')}

${steps(등록단계.map((t) => [t, '']), 1)}

${card('① 종합백신 (DHPPL)', `
  <p class="t-sub">아직 접종일을 고르지 않았습니다. 아래에서 날짜를 고르면 오른쪽에 유효기간이 바로 계산돼 나옵니다.</p>
  <div class="mt4">${uploadDrop('접종증명서 사진 또는 PDF를 올려 주세요')}</div>
  <div class="f2 mt6">
    ${field('접종일', input({ type: 'date', attr: ' data-vac-date="dhppl2"' }), { req: true, hint: '증명서에 적힌 날짜를 그대로 골라 주세요' })}
    <div class="field"><span class="lb">유효기간</span>
      <div class="mt2" data-vac-out="dhppl2"><span class="t-sub">접종일을 고르면 저절로 계산됩니다 (접종일 + 1년)</span></div>
    </div>
  </div>`, { cls: 'mt8' })}

${card('② 광견병', `
  <p class="t-sub">이미 올려 주신 증명서가 있습니다. 접종일을 고치면 유효기간도 함께 다시 계산됩니다.</p>
  <div class="mt4">${uploadDrop('다른 증명서로 바꾸시려면 눌러 주세요')}</div>
  <div class="f2 mt6">
    ${field('접종일', input({ type: 'date', v: 광견병.date, attr: ' data-vac-date="rabies2"' }), { req: true, hint: esc(광견병.vet) + ' 발급' })}
    <div class="field"><span class="lb">유효기간</span>
      <div class="mt2" data-vac-out="rabies2">${badge('정상', 'b-ok')} <span class="t-sub">유효기간 ${광견병.until}까지</span></div>
    </div>
  </div>
  <p class="hint">${광견병.date} 접종 + 1년 = ${규칙대로} · 오늘(${esc(TODAY.short)})부터 ${num(광남)}일 남았습니다.</p>`,
    { cls: 'mt6' })}

${card('계산 근거', `
  ${kv([
    ['기본 규칙', '접종일 + 1년 = 만료 예정일'],
    ['증명서에 유효기간이 적혀 있으면', '그 날짜를 그대로 씁니다 (병원이 정한 기간이 규칙보다 앞섭니다)'],
    ['남은 날수 기준', `오늘 ${esc(TODAY.label)}`],
    ['임박 표시', '만료까지 30일 이하로 남았을 때'],
    ['만료 표시', '만료일이 지났을 때 — 등원 예약이 제한됩니다'],
  ])}
  <p class="hint">그래서 같은 날 맞은 접종이라도 증명서에 따라 만료일이 다를 수 있습니다. 아래 이력에서 그 자리에 표시를 달아 두었어요.</p>`,
    { cls: 'mt6' })}

${sec(`${esc(초코.nm)}의 접종 이력 ${VAC_LOG.length}건`,
    table([{ t: '접종일', w: '120px' }, '종류', '유효기간', { t: '상태', w: '160px' }], 이력),
    { desc: '올려 주신 증명서에서 읽은 접종일과, 그것으로 정해진 유효기간입니다. 병원이 유효기간을 따로 적어 준 자리에는 표시를 달았습니다.' })}

${banner('info', '💉', `만료 30일 전에 카카오톡(${esc(SITE.kakao)})으로 미리 알려드립니다. 그때 재접종하고 새 증명서만 올려 주시면 돼요.`, { cls: 'mt6' })}`;

  return {
    body,
    o: {
      stick: stickBar(
        '<div class="t-sub">2단계 / 3단계 · 접종일을 고르면 유효기간이 바로 계산됩니다</div>',
        `${btn('업로드 화면으로', { href: 'PL0201', cls: 'btn-ghost' })}
         ${btn('다음: 건강·성향 정보 입력', { href: 'PL0301', cls: 'btn-pri' })}`,
      ),
    },
  };
};

/* ============================================================
   PL0203 백신 접종 기록 업로드 > 만료 임박·만료 경고
   ⭐ 정상 · 임박 · 만료 셋을 한 화면에서 견줘 본다. 숫자는 data.mjs 것뿐이다.
   ============================================================ */
P['PL0203'] = (ctx) => {
  /* 만료 상태의 숫자도 지어내지 않는다 — 원 명단에서 실제로 만료된 아이의 일수를 쓴다.
     보호자 화면이므로 다른 집 아이 이름은 적지 않고 «상태»만 빌려 온다. */
  const 만료일수 = DOGS.find((d) => d.vac === '만료').vacD;
  const 상태들 = [
    {
      key: '정상', dog: 초코, 배지: vacBadge(초코, { full: true }),
      말: `유효기간이 ${초코.vacD}일 남았습니다. 예약과 등원이 모두 됩니다.`,
      할일: '지금은 하실 일이 없어요. 만료 30일 전에 알려드립니다.',
      단추: btn('접종 기록 보기', { href: 'PL0201', cls: 'btn-ghost', sm: true }),
    },
    {
      key: '임박', dog: 보리, 배지: vacBadge(보리, { full: true }),
      말: `${보리.vacD}일 뒤에 만료됩니다. 예약은 아직 되지만 미리 재접종해 주세요.`,
      할일: '동물병원에서 재접종하고 새 증명서를 올려 주세요.',
      단추: btn('증명서 다시 올리기', { href: 'PL0201', cls: 'btn-sub', sm: true }),
    },
    {
      key: '만료', dog: null, 배지: vacBadge({ vac: '만료', vacD: 만료일수 }),
      말: `만료일이 ${Math.abs(만료일수)}일 지났습니다. 이 상태에서는 등원 예약이 제한되고, 원에서도 등원 체크 버튼이 잠깁니다.`,
      할일: '새 증명서를 올리면 그 자리에서 풀립니다.',
      단추: btn('증명서 올리기', { href: 'PL0201', cls: 'btn-pri', sm: true }),
    },
  ];

  const body = `${leafHd(ctx, '백신 상태는 세 갈래입니다. 어느 자리에 있는지에 따라 할 수 있는 일이 달라져요.')}

${banner('warn', '💉', `<b>${esc(보리.nm)}의 백신이 ${보리.vacD}일 뒤 만료됩니다.</b>
  <div class="t-sub mt2">지금 예약은 되지만, 만료된 뒤에는 예약도 등원 체크도 막힙니다. 미리 재접종해 주세요.</div>`,
    { cls: 'mt8', right: btn('지금 새 증명서 올리기', { href: 'PL0201', cls: 'btn-pri', sm: true }) })}

${card('우리 아이 백신 상태', `
  <div class="row-b wrap-row">
    <div class="t-sub">보여 줄 상태 <b class="num" data-filter-cnt="vst">${상태들.length}</b>가지</div>
    ${chips(['전체', ...상태들.map((s) => s.key)], 0, { boxAttr: ' data-filter-for="vst"' })}
  </div>

  <div class="g3 mt6" data-filter-list="vst">
    ${상태들.map((s) => `<div class="box" data-tag="${s.key}">
      <div class="row wrap-row">${s.dog ? dogPh(s.dog.nm, 40) : ''}
        <div class="grow"><div class="t-card">${s.dog ? esc(s.dog.nm) : '만료되면'}</div>
          <div class="t-sub mt1">${s.dog ? `${esc(s.dog.breed)} · ${esc(반찾기(s.dog.kg).nm)}` : '이렇게 보입니다'}</div></div>
      </div>
      <div class="mt4">${s.배지}</div>
      <p class="t-sub mt3">${esc(s.말)}</p>
      <p class="t-sub mt2"><b>할 일 —</b> ${esc(s.할일)}</p>
      <div class="btns mt4">${s.단추}</div>
    </div>`).join('')}
  </div>

  <div data-empty-for="vst" hidden>
    ${empty('💉', '그 상태인 아이가 없어요', '위에서 다른 상태를 골라 보세요.')}
  </div>`, { cls: 'mt6' })}

${sec('만료되면 무엇이 막히나요', accordion([
      { q: '등원 예약이 막힙니다', a: '예약 화면에서 그 아이를 고를 수 없게 됩니다. 형제견이 정상이면 그 아이만 예약할 수 있어요.' },
      { q: '원에서 등원 체크 버튼이 잠깁니다', a: '설령 데려오셔도 보육교사가 등원 체크를 할 수 없습니다. 원장 승인으로만 하루 풀 수 있어요.' },
      { q: '회차권은 그대로 남습니다', a: '쓰지 못한 회차는 깎이지 않습니다. 다만 회차권 만료일은 계속 흘러가니 재접종을 서둘러 주세요.' },
    ], 0))}

${card('만료 전 알림', `
  <div class="row-b">
    <div><div class="t-card">만료 30일 전에 미리 알려드릴까요?</div>
      <div class="t-sub mt1">카카오톡 ${esc(SITE.kakao)} 으로 보내드립니다</div></div>
    ${toggle(true, '만료 30일 전에 미리 알려드릴게요')}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ============================================================
   PL0204 백신 접종 기록 업로드 > 업로드 실패
   ============================================================ */
P['PL0204'] = (ctx) => {
  const 최대MB = 10;
  const 형식 = ['JPG', 'PNG', 'HEIC', 'PDF'];
  const 실패들 = [
    { f: '증명서_스캔.zip', why: '올릴 수 없는 형식이에요', how: `${형식.join(' · ')} 만 올릴 수 있습니다. 압축을 풀고 안에 든 사진을 올려 주세요.` },
    { f: 'IMG_4821.HEIC', why: `파일이 너무 큽니다 (${최대MB}MB 넘음)`, how: `사진 앱에서 «크기 줄여 보내기»로 저장한 뒤 올려 주세요. ${최대MB}MB 까지 받습니다.` },
    { f: 'IMG_4822.JPG', why: '글자를 읽을 수 없어요', how: '접종일과 병원 도장이 흐립니다. 밝은 곳에서 증명서를 평평하게 펴고 정면에서 다시 찍어 주세요.' },
  ];

  const body = `${leafHd(ctx, `올리신 파일 ${실패들.length}개를 저장하지 못했습니다. 아래 까닭을 보고 다시 올려 주세요.`)}

${banner('dan', '⚠️', `<b>${실패들.length}개 파일이 올라가지 않았습니다.</b>
  <div class="t-sub mt2">아직 저장된 증명서가 없어서, 이대로는 등원 예약을 할 수 없어요.</div>`, { cls: 'mt8' })}

${card(`올리지 못한 파일 ${실패들.length}개`, `
  <div class="stack" style="gap:var(--sp-item)">
    ${실패들.map((x) => `<div class="rowcard bad">
      <div class="thumb">${ph(['올리려던 증명서', 800, 600], { seed: x.f, cls: 'ph-card' })}</div>
      <div class="bd">
        <div class="row wrap-row">${badge('실패', 'b-dan')}<b>${esc(x.f)}</b></div>
        <div class="t-card mt2 dan">${esc(x.why)}</div>
        <p class="t-sub mt2">${esc(x.how)}</p>
      </div>
      <div class="side btns-v">
        ${btn('다시 올리기', { cls: 'btn-pri', sm: true, attr: ' data-toast="파일 고르는 창을 다시 열었어요"' })}
        ${btn('목록에서 지우기', { cls: 'btn-ghost', sm: true, attr: ' data-close=".rowcard"' })}
      </div>
    </div>`).join('')}
  </div>`, { cls: 'mt6' })}

${card('다시 올리기', `
  ${uploadDrop('여기를 눌러 증명서를 다시 올려 주세요')}
  <p class="hint">${형식.join(' · ')} · 한 파일 ${최대MB}MB 까지 · 여러 장이면 나눠서 올려 주셔도 됩니다.</p>`,
    { cls: 'mt6' })}

${sec('이렇게 찍으면 한 번에 됩니다', `<div class="g3">
  ${box('<div class="t-card">밝은 곳에서</div><p class="t-sub mt2">그늘이나 손 그림자가 글자를 덮으면 접종일을 못 읽습니다.</p>')}
  ${box('<div class="t-card">평평하게 펴고</div><p class="t-sub mt2">접힌 자국 위에 접종일이 있으면 흐리게 나옵니다.</p>')}
  ${box('<div class="t-card">네 귀퉁이가 다 보이게</div><p class="t-sub mt2">병원 도장과 유효기간이 잘리지 않아야 합니다.</p>')}
</div>`)}

${banner('info', '📄', `증명서를 못 찾으시겠다면 접종 수첩 사진이나 진료 영수증도 괜찮습니다. 접종일만 확인되면 유효기간을 계산해 드려요.
  ${esc(SITE.vet.nm)}(${esc(SITE.vet.dist)})에 문의하시면 재발급도 됩니다.`, { cls: 'mt6' })}`;

  return {
    body,
    o: {
      stick: stickBar(
        `<div class="t-sub dan">저장된 증명서 0장 · 실패 ${실패들.length}개</div>`,
        `${btn('고객센터에 묻기', { href: 'CS0201', cls: 'btn-ghost' })}
         ${btn('업로드 화면으로 돌아가기', { href: 'PL0201', cls: 'btn-pri' })}`,
      ),
    },
  };
};

/* ============================================================
   PL0205 백신 접종 기록 업로드 > 미업로드 확인 모달
   ⛔ 브라우저 기본 확인창을 쓰지 않는다 — U.modal() + data-modal 로 만든다
      (헤드리스 크롬이 그 자리에서 영원히 멈춘다)
   ============================================================ */
P['PL0205'] = (ctx) => {
  const 필수 = ['종합백신 (DHPPL)', '광견병'];

  const body = `${leafHd(ctx, '아직 증명서를 한 장도 올리지 않으셨습니다. 넘어가려 하면 이 확인 창이 뜹니다.')}

${steps(등록단계.map((t) => [t, '']), 1)}

${banner('warn', '💉', `<b>필수 접종 ${필수.length}가지가 모두 비어 있습니다.</b>
  <div class="t-sub mt2">${필수.join(' · ')} — 둘 다 유효기간 안이어야 등원할 수 있습니다.</div>`, { cls: 'mt8' })}

${card('지금 올릴 수 있는 것을 골라 주세요', `
  <div class="chips" data-pick-scope="vacpick" data-multi>
    ${필수.map((t) => `<button class="chip" type="button">${esc(t)}</button>`).join('')}
  </div>
  <p class="hint">지금 <b data-pick-out="vacpick">0</b>가지를 골랐습니다. 하나도 고르지 않으면 아래 버튼이 잠겨 있어요.</p>
  <div class="btns mt4">
    ${btn('고른 증명서 지금 올리기', { cls: 'btn-pri', id: 'vacUp', off: true, attr: ' data-pick-btn="vacpick" data-toast="고르신 증명서를 올릴 수 있게 칸을 열었어요"' })}
    ${btn('나중에 올리고 넘어가기', { cls: 'btn-ghost', attr: ' data-modal="mSkipNow"' })}
  </div>`, { cls: 'mt6' })}

${sec('건너뛰면 이렇게 됩니다', `<div class="g2">
  ${box(`<div class="t-card">${badge('할 수 있어요', 'b-ok')}</div>
    <ul class="t-sub mt3" style="padding-left:var(--sp-item)">
      <li>등록은 끝까지 마칠 수 있습니다</li>
      <li>건강·특이사항도 미리 적어 둘 수 있어요</li>
      <li>프로필 화면도 만들어집니다</li>
    </ul>`)}
  ${box(`<div class="t-card">${badge('할 수 없어요', 'b-dan')}</div>
    <ul class="t-sub mt3" style="padding-left:var(--sp-item)">
      <li>등원 예약을 할 수 없습니다</li>
      <li>예약 화면에서 이 단계로 다시 돌아오게 됩니다</li>
      <li>원에서도 등원 체크 버튼이 잠깁니다</li>
    </ul>`)}
</div>`)}

${banner('info', '📄', `증명서를 찾으시는 동안 다음 단계를 먼저 채워 두셔도 좋습니다. 나중에 프로필에서 언제든 올릴 수 있어요.`, { cls: 'mt6' })}`;

  return {
    body,
    o: {
      after: modal('mSkipNow', '접종 기록 없이 넘어갈까요?', `
        <p><b>접종 기록 없이는 등원 예약을 할 수 없어요.</b></p>
        <p class="t-sub mt4">지금 건너뛰셔도 등록은 끝낼 수 있습니다.
        다만 예약 화면에서 「${필수.join(' · ')} 증명서가 필요합니다」라는 안내를 만나 이 화면으로 다시 돌아오게 됩니다.</p>
        <p class="t-sub mt4">증명서를 찾으시는 동안 건강·특이사항을 먼저 채워 두셔도 좋아요.</p>`,
      `${btn('여기서 올릴게요', { cls: 'btn-ghost', attr: ' data-dismiss' })}
         ${btn('나중에 올리고 넘어가기', { href: 'PL0301', cls: 'btn-pri' })}`),
      stick: stickBar(
        `<div class="t-sub dan">올린 증명서 0장 / ${필수.length}장</div>`,
        `${btn('업로드 화면으로', { href: 'PL0201', cls: 'btn-ghost' })}
         ${btn('나중에 올릴게요', { cls: 'btn-sub', attr: ' data-modal="mSkipNow"' })}`,
      ),
    },
  };
};

/* ============================================================
   PL0302 건강·특이사항 입력 > 알러지 항목 추가
   ⭐ 항목을 하나도 안 남기면 「저장」이 잠긴다 (data-pick-scope + data-pick-btn)
   ============================================================ */
P['PL0302'] = (ctx) => {
  /* 초코의 알러지는 프로필(PL0401)에 적힌 그것 하나다. 새로 지어내지 않는다. */
  const 적힌알러지 = [{ kind: '음식', v: '닭고기', how: '간식과 특식을 줄 때 반드시 확인합니다' }];

  const body = `${leafHd(ctx, '알러지는 여러 개 적을 수 있어요. 간식을 줄 때마다 보육교사가 이 목록을 봅니다.')}

${steps(등록단계.map((t) => [t, '']), 2)}

${card('알러지', `
  <div class="row-b">
    <div><div class="t-card">알러지가 있나요?</div>
      <div class="t-sub mt1">「있어요」로 두면 아래 목록이 알림장 작성 화면에도 함께 뜹니다</div></div>
    ${toggle(true, '', ' data-open="algBox"')}
  </div>

  <div id="algBox" class="mt6" data-pick-scope="alg">
    <div class="stack" style="gap:var(--sp-item)">
      ${적힌알러지.map((a, i) => box(`
        <div class="row-b wrap-row">
          ${check(`<b>이 항목을 저장합니다</b>`, { on: true, sub: `표시를 풀면 저장 목록에서 빠집니다`, attr: ` data-alg="${i}"` })}
          ${btn('지우기', { cls: 'btn-ghost', sm: true, attr: ' data-close=".box"' })}
        </div>
        <div class="f2 mt4">
          ${field('갈래', select(['음식', '환경'], ['음식', '환경'].indexOf(a.kind)))}
          ${field('무엇에', input({ v: a.v }), { hint: esc(a.how) })}
        </div>`)).join('')}
    </div>

    <p class="hint mt4">지금 <b data-pick-out="alg">${적힌알러지.length}</b>개를 저장합니다.
    하나도 남기지 않으면 아래 「저장」이 잠겨요 — 「알러지 있어요」로 두고 목록이 비면 보육교사가 무엇을 조심해야 할지 알 수 없기 때문입니다.</p>

    <div class="btns mt4">
      ${btn('＋ 항목 추가', { cls: 'btn-sub', sm: true, attr: ' data-more-toggle="alg2" data-more-label="＋ 항목 추가"' })}
    </div>

    <div class="mt4" data-more-body="alg2" hidden>
      ${box(`<div class="t-card mb4">새 항목</div>
        <div class="f2">
          ${field('갈래', select(['음식', '환경'], 0))}
          ${field('무엇에', input({ ph: '예: 유제품 / 잔디' }))}
        </div>
        ${field('어떤 증상이 나타나나요', input({ ph: '예: 귀를 심하게 긁어요' }), { hint: '증상을 적어 두시면 이상할 때 바로 알아챕니다' })}`)}
    </div>
  </div>`, { cls: 'mt8' })}

${banner('info', '🍖', `<b>알러지는 간식·특식과 바로 이어집니다.</b>
  <div class="t-sub mt2">여기에 적으신 것은 원의 간식 목록과 대조됩니다.
  겹치는 간식이 있으면 그 아이만 다른 간식으로 바꿔서 줍니다.</div>`, { cls: 'mt6' })}

${sec('보육교사 화면에는 이렇게 뜹니다', box(`
  <div class="row wrap-row">${dogPh(초코.nm, 40)}
    <div class="grow"><div class="t-card">${esc(초코.nm)} ${badge('알러지 ' + 적힌알러지.length + '건', 'b-warn')}</div>
      <div class="t-sub mt1">${적힌알러지.map((a) => `${esc(a.kind)} · ${esc(a.v)}`).join(' / ')}</div></div>
    ${btn('알림장 작성 화면 보기', { href: 'NW0101', cls: 'btn-ghost', sm: true })}
  </div>`))}`;

  return {
    body,
    o: {
      stick: stickBar(
        '<div class="t-sub">3단계 / 3단계 · 알러지를 다 적으셨으면 저장해 주세요</div>',
        `${btn('건강·특이사항으로', { href: 'PL0301', cls: 'btn-ghost' })}
         ${btn('저장', { href: 'PL0304', cls: 'btn-pri', id: 'algSave', attr: ' data-pick-btn="alg"' })}`,
      ),
    },
  };
};

/* ============================================================
   PL0303 건강·특이사항 입력 > 복용약 급여시간 펼침
   ⭐ 「직접 적기」를 고르면 숨은 칸이 나온다 · 고른 시간이 요약에 그대로 적힌다
   ============================================================ */
P['PL0303'] = (ctx) => {
  const 시간들 = ['점심(12:30)', '오후(14:00)', '간식 시간(15:30)', '직접 적기'];
  const 고른시간 = 1;

  const body = `${leafHd(ctx, '약과 급여 시간을 적어 주시면 보육교사가 그 시간에 챙기고, 알림장에 먹였는지 적어 보냅니다.')}

${steps(등록단계.map((t) => [t, '']), 2)}

${card('복용 중인 약', `
  <div class="row-b">
    <div><div class="t-card">원에서 먹여야 하는 약이 있나요?</div>
      <div class="t-sub mt1">「있어요」로 두면 아래 칸이 펼쳐집니다</div></div>
    ${toggle(true, '', ' data-open="medBox3"')}
  </div>

  <div id="medBox3" class="mt6">
    ${box(`<div class="t-card mb4">첫 번째 약</div>
      <div class="f2">
        ${field('약 이름', input({ ph: '예: 관절 영양제' }), { req: true })}
        ${field('한 번에 얼마나', input({ ph: '예: 반 알' }), { hint: '알·포·ml 무엇이든 적어 주신 대로 먹입니다' })}
      </div>
      ${field('급여 시간', select(시간들, 고른시간, { attr: ' data-reveal-when="직접 적기" data-reveal-box="fdTime3" data-start-sel' }), { req: true, hint: '「직접 적기」를 고르면 시간을 적는 칸이 나옵니다' })}
      ${field('시간 직접 적기', input({ ph: '예: 오전 10:30' }), { id: 'fdTime3', hide: true })}
      ${field('먹이는 법', input({ ph: '예: 사료에 섞어서' }), { hint: '숨겨야 먹는 아이면 그것도 적어 주세요' })}`)}

    <div class="btns mt4">
      ${btn('＋ 약 추가', { cls: 'btn-sub', sm: true, attr: ' data-more-toggle="med2" data-more-label="＋ 약 추가"' })}
    </div>

    <div class="mt4" data-more-body="med2" hidden>
      ${box(`<div class="t-card mb4">두 번째 약</div>
        <div class="f2">
          ${field('약 이름', input({ ph: '예: 피부 연고' }))}
          ${field('한 번에 얼마나', input({ ph: '예: 얇게 한 번' }))}
        </div>
        ${field('급여 시간', select(시간들, 2, { attr: ' data-reveal-when="직접 적기" data-reveal-box="fdTime4"' }), { hint: '「직접 적기」를 고르면 시간을 적는 칸이 나옵니다' })}
        ${field('시간 직접 적기', input({ ph: '예: 저녁 19:00' }), { id: 'fdTime4', hide: true })}
        ${field('먹이는 법', input({ ph: '예: 등 쪽 붉은 자리에만' }))}`)}
    </div>
  </div>`, { cls: 'mt8' })}

${card('이렇게 적힙니다', `
  <div class="row wrap-row">${dogPh(초코.nm, 40)}
    <div class="grow">
      <div class="t-card">${esc(초코.nm)} · 매일 <b class="pri" data-start-out>${esc(시간들[고른시간])}</b> 에 먹입니다</div>
      <div class="t-sub mt1">위에서 급여 시간을 바꾸면 이 줄도 그 자리에서 따라 바뀝니다</div>
    </div>
  </div>`, { cls: 'mt6' })}

${banner('ok', '📋', `<b>보육교사의 알림장 작성 화면에 「약 먹였어요」 칸이 함께 뜹니다.</b>
  <div class="t-sub mt2">그 칸에 표시가 없으면 알림장을 보낼 수 없게 해 두었습니다.
  먹였는지 안 먹였는지가 저녁에 그대로 보호자에게 갑니다.</div>`,
    { cls: 'mt6', right: btn('알림장 작성 화면 보기', { href: 'NW0101', cls: 'btn-ghost', sm: true }) })}

${sec('하루 일과 중 어디쯤인가요', `<div class="g3">
  ${['점심(12:30)', '오후(14:00)', '간식 시간(15:30)'].map((t, i) => box(`
    <div class="t-card">${esc(t)}</div>
    <p class="t-sub mt2">${['점심 사료를 먹인 뒤라 약을 숨겨 먹이기 좋습니다.',
    '낮잠에서 깬 직후입니다. 조용해서 챙기기 쉬워요.',
    '간식과 함께 주면 잘 먹는 아이에게 맞습니다.'][i]}</p>`)).join('')}
</div>`, { desc: '언제 먹여야 할지 정하기 어려우시면 아래를 참고해 주세요.' })}`;

  return {
    body,
    o: {
      stick: stickBar(
        '<div class="t-sub">3단계 / 3단계 · 약을 다 적으셨으면 저장해 주세요</div>',
        `${btn('건강·특이사항으로', { href: 'PL0301', cls: 'btn-ghost' })}
         ${btn('저장', { href: 'PL0304', cls: 'btn-pri' })}`,
      ),
    },
  };
};

/* ============================================================
   PL0304 건강·특이사항 입력 > 저장 완료
   ⭐ done() — 방금 저장한 «내용»이 그대로 보여야 한다
   ============================================================ */
P['PL0304'] = (ctx) => {
  const 저장한것 = [
    ['알러지', '음식 · 닭고기'],
    ['지병·수술 이력', '없어요'],
    ['복용 중인 약', '없어요'],
    ['발작·특이 행동', '없어요'],
    ['담당 동물병원', `${esc(SITE.vet.nm)} · ${esc(SITE.vet.tel)}`],
    ['보호자 비상 연락처', `${esc(ME.nm)} · ${esc(ME.phone)}`],
    ['그 외', '우산 소리를 무서워해요'],
  ];

  const main = `${steps(등록단계.map((t) => [t, '']), 3)}

${card(`${esc(초코.nm)}의 건강·특이사항 ${저장한것.length}가지`, kv(저장한것), {
    cls: 'mt6',
    aside: badge('방금 저장했어요', 'b-ok'),
  })}

${card('등록이 끝났습니다', `
  <div class="row wrap-row">
    ${phFix(['반려견 대표 사진', 400, 400], 96, { cls: 'ph-dog', seed: 초코.nm })}
    <div class="grow">
      <div class="row wrap-row">
        <div class="t-card">${esc(초코.nm)}</div>
        ${badge(`${반찾기(초코.kg).ico} ${반찾기(초코.kg).nm}`, 'b-solid')}
        ${vacBadge(초코)}
      </div>
      <p class="t-sub mt2">${esc(초코.breed)} · ${esc(초코.age)} · ${esc(초코.sex)}${초코.neut ? ' · 중성화 완료' : ''} · ${초코.kg}kg</p>
      <div class="row wrap-row mt3">${초코.tags.map((t) => badge(t, 'b-line')).join('')}</div>
    </div>
  </div>`, { cls: 'mt6' })}

${banner('info', '✏️', '적어 주신 내용은 <b>마이페이지 › 반려견 프로필</b>에서 언제든 고칠 수 있습니다. 고치면 다음 등원부터 바로 반영돼요.', { cls: 'mt6' })}`;

  const aside = `${card('이제 무엇을 하면 되나요', `
  <div class="btns-v">
    ${btn('등원 예약하기', { href: 'RE0101', cls: 'btn-pri', w: true })}
    ${btn('반려견 프로필 보기', { href: 'PL0401', cls: 'btn-ghost', w: true })}
    ${btn('백신 기록 다시 보기', { href: 'PL0201', cls: 'btn-ghost', w: true })}
  </div>`)}

${box(`<div class="t-card">다음 단계 안내</div>
  <p class="t-sub mt3">예약을 하시면 첫 등원 날 <b>30분 적응 테스트</b>를 합니다.
  그날 성향까지 보고 반이 확정돼요. 지금 배정된 ${esc(반찾기(초코.kg).nm)}은 몸무게 ${초코.kg}kg 기준입니다.</p>`)}

${box(`<div class="t-card">알림장은 저녁에</div>
  <p class="t-sub mt3">등원한 날은 하원 뒤 정리해서 보통 저녁 18시 30분에
  카카오톡(${esc(SITE.kakao)})으로 보내드립니다.</p>`)}`;

  return { body: done('건강·특이사항을 저장했어요', `${esc(초코.nm)}의 등록이 모두 끝났습니다 · ${esc(TODAY.label)}`, main, aside), o: {} };
};

/* ============================================================
   PL0402 반려견 프로필 상세 > 정보 수정 모드
   ⭐ 몸무게를 고치면 예상 반이 «실제로» 바뀐다 · 확인해야 저장이 열린다
   ============================================================ */
P['PL0402'] = (ctx) => {
  const 성향목록 = ['사교적', '소심함', '짖음 많음', '다른 개 무서워함', '사람 좋아함', '활발함'];
  const 지금반 = 반찾기(초코.kg);

  const body = `${leafHd(ctx, `${esc(초코.nm)}의 정보를 고치는 중입니다. 저장하기 전에는 아무것도 바뀌지 않아요.`,
    `${badge('수정 중', 'b-warn')} ${btn('취소하고 프로필로', { href: 'PL0401', cls: 'btn-ghost' })}`)}

${card('대표 사진', `
  <div class="row wrap-row">
    ${phFix(['반려견 대표 사진', 400, 400], 120, { cls: 'ph-dog', seed: 초코.nm })}
    <div class="grow">
      ${uploadDrop('다른 사진으로 바꾸시려면 눌러 주세요 (1장)')}
      <p class="hint">등하원 체크 화면과 알림장 목록에 이 사진이 쓰입니다.</p>
    </div>
  </div>`, { cls: 'mt8' })}

${card('기본 정보', `
  ${field('이름', input({ v: 초코.nm }), { req: true })}
  <div class="f2">
    ${field('견종', input({ v: 초코.breed }), { req: true })}
    ${field('나이', input({ v: 초코.age }), { hint: '생년월일을 아시면 그것으로 바꿔 드립니다' })}
  </div>
  <div class="f2">
    ${field('성별', radioRow('sexE', ['남아', '여아'], 초코.sex === '남아' ? 0 : 1), { req: true })}
    ${field('중성화', radioRow('neutE', ['했어요', '안 했어요'], 초코.neut ? 0 : 1))}
  </div>`, { cls: 'mt6' })}

${card('몸무게', `
  <div class="row wrap-row">
    <div style="width:180px">${input({ type: 'number', v: String(초코.kg), attr: ' data-weight step="0.1" min="0"' })}</div>
    <span class="t-sub">kg</span>
    <div class="grow t-card" data-weight-out>${반안내(초코.kg)}</div>
  </div>
  <p class="hint">숫자를 바꿔 보세요 — 오른쪽 예상 반이 그 자리에서 따라 바뀝니다.</p>

  ${banner('warn', '⚖️', `<b>몸무게를 고치면 반이 다시 배정될 수 있습니다.</b>
    <div class="t-sub mt2">지금은 ${초코.kg}kg 으로 ${esc(지금반.nm)}(${esc(지금반.kg)})에 있어요.
    구간을 넘는 숫자로 바꾸시면 원장이 확인한 뒤 다음 등원부터 반이 옮겨집니다.
    옮겨지면 카카오톡으로 미리 알려드려요.</div>`, { cls: 'mt6' })}

  <div class="mt6">
    ${check('<b>몸무게를 고치면 반이 다시 배정될 수 있다는 것을 확인했습니다</b>', { sub: '표시하시면 화면 아래 「저장」 버튼이 열립니다', attr: ' data-unlock="plEditSave"' })}
  </div>`, { cls: 'mt6' })}

${card('성향', `
  <div class="chips" data-pick-scope="tagsE" data-multi>
    ${성향목록.map((t) => `<button class="chip${초코.tags.includes(t) ? ' on' : ''}" type="button">${esc(t)}</button>`).join('')}
  </div>
  <p class="hint">지금 <b data-pick-out="tagsE">${초코.tags.length}</b>개를 골랐습니다. 눌러서 켜고 끌 수 있어요.</p>`,
    { cls: 'mt6' })}

${card('목줄·하네스', `
  <div class="row-b">
    <div><div class="t-card">목줄·하네스를 채워서 보내나요?</div>
      <div class="t-sub mt1">원 안에서는 벗겨 두고, 마당에 나갈 때 다시 채웁니다</div></div>
    ${toggle(true, '등하원 때 목줄을 채워 보내는 것으로 적었어요')}
  </div>`, { cls: 'mt6' })}

${banner('info', 'ℹ️', `백신 기록과 건강·특이사항은 여기서 고치지 않습니다. 각각 제 화면에서 고쳐 주세요.`, {
    cls: 'mt6',
    right: `${btn('백신 기록', { href: 'PL0201', cls: 'btn-ghost', sm: true })} ${btn('건강·특이사항', { href: 'PL0301', cls: 'btn-ghost', sm: true })}`,
  })}`;

  return {
    body,
    o: {
      stick: stickBar(
        '<div class="t-sub">저장하기 전에는 프로필이 그대로 남아 있어요</div>',
        `${btn('취소', { href: 'PL0401', cls: 'btn-ghost' })}
         ${btn('저장', { cls: 'btn-pri', id: 'plEditSave', off: true, attr: ' data-toast="바뀐 내용을 저장했어요 — 다음 등원부터 반영됩니다"' })}`,
      ),
    },
  };
};

/* ============================================================
   PL0403 반려견 프로필 상세 > 백신 유효기간 배지
   ⭐ 탭과 몸통을 tabBox 로 한 상자에 묶는다 — 세 배지를 눌러 견줘 본다
   ============================================================ */
P['PL0403'] = (ctx) => {
  const 만료일수 = DOGS.find((d) => d.vac === '만료').vacD;

  const 갈래 = [
    {
      key: '정상', 라벨: '정상', 배지: vacBadge(초코, { full: true }), 종류: 'ok',
      누구: `${esc(초코.nm)} — ${esc(초코.breed)}`,
      말: `유효기간이 ${초코.vacD}일 남았습니다.`,
      할일: '배지를 누르면 접종 기록 화면으로 갑니다. 지금은 하실 일이 없어요.',
      예약: btn('예약하기', { href: 'RE0101', cls: 'btn-pri' }),
      예약말: '예약이 열려 있습니다.',
    },
    {
      key: '임박', 라벨: '임박', 배지: vacBadge(보리, { full: true }), 종류: 'warn',
      누구: `${esc(보리.nm)} — ${esc(보리.breed)}`,
      말: `${보리.vacD}일 뒤 만료됩니다.`,
      할일: '재접종하고 새 증명서를 올려 주세요. 배지를 누르면 올리는 화면으로 갑니다.',
      예약: btn('예약하기', { href: 'RE0101', cls: 'btn-pri' }),
      예약말: '아직 예약은 됩니다. 만료일이 지나면 그때부터 막힙니다.',
    },
    {
      key: '만료', 라벨: '만료', 배지: vacBadge({ vac: '만료', vacD: 만료일수 }), 종류: 'dan',
      누구: '만료되면 이렇게 보입니다',
      말: `만료일이 ${Math.abs(만료일수)}일 지난 상태입니다.`,
      할일: '새 증명서를 올리면 그 자리에서 풀립니다.',
      예약: btn('예약하기', { cls: 'btn-pri', id: 'reLocked', off: true }),
      예약말: '예약 버튼이 잠깁니다. 원에서도 등원 체크 버튼이 잠깁니다.',
    },
  ];

  const 몸통 = (g, i) => pane('vb' + i, `
    <div class="box">
      <div class="row-b wrap-row">
        <div><div class="t-card">${g.누구}</div>
          <div class="mt3">${g.배지}</div></div>
        ${btn('배지를 누르면 → 접종 기록 화면', { href: 'PL0201', cls: 'btn-ghost', sm: true })}
      </div>
      <p class="t-sub mt4">${esc(g.말)} ${esc(g.할일)}</p>
    </div>

    ${banner(g.종류, '💉', `<b>${esc(g.예약말)}</b>`, { cls: 'mt4', right: g.예약 })}

    ${kv([
    ['예약', g.key === '만료' ? '<b class="dan">막힙니다</b>' : '됩니다'],
    ['원에서 등원 체크', g.key === '만료' ? '<b class="dan">잠깁니다</b> (원장 승인으로만 하루 풀 수 있어요)' : '됩니다'],
    ['회차권', '깎이지 않습니다 — 쓰지 못한 회차는 그대로 남아요'],
    ['알림', g.key === '정상' ? '만료 30일 전에 카카오톡으로 알려드립니다' : '이미 알림을 보내 드렸습니다'],
  ], { cls: 'mt4' })}`, i === 0);

  const body = `${leafHd(ctx, '백신 배지는 세 갈래입니다. 배지를 누르면 언제든 증명서를 다시 올릴 수 있어요.')}

${card('배지 세 갈래', tabBox(
    갈래.map((g, i) => ({ label: g.라벨, pane: 'vb' + i })),
    갈래.map(몸통).join(''),
    0,
    { pill: true },
  ), { cls: 'mt8' })}

${sec(`우리 아이 ${MINE.length}마리의 지금 상태`, `<div class="g2">
  ${MINE.map((d) => box(`
    <div class="row wrap-row">${dogPh(d.nm, 48)}
      <div class="grow">
        <div class="t-card">${esc(d.nm)}</div>
        <div class="mt2">${vacBadge(d, { full: true })}</div>
      </div>
    </div>
    <div class="btns mt4">${btn('접종 기록 보기', { href: 'PL0201', cls: 'btn-ghost', sm: true })}
      ${btn('프로필로', { href: 'PL0401', cls: 'btn-ghost', sm: true })}</div>`)).join('')}
</div>`)}

${banner('info', '💉', '종합백신(DHPPL)과 광견병 <b>둘 다</b> 유효기간 안이어야 합니다. 하나만 만료돼도 배지는 만료로 바뀝니다.', { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ============================================================
   PL0404 반려견 프로필 상세 > 형제견 전환 탭
   ⭐ 탭과 몸통을 tabBox 로 «한 상자»에 묶는다
   ============================================================ */
P['PL0404'] = (ctx) => {
  const 이용권 = { d01: MY_PASS, d02: MY_PASS2 };

  const 몸통 = (d, i) => {
    const c = 반찾기(d.kg);
    const p = 이용권[d.id];
    return pane('sib' + i, `
      <div class="row wrap-row">
        ${phFix(['반려견 사진', 400, 400], 120, { cls: 'ph-dog', seed: d.nm })}
        <div class="grow">
          <div class="row wrap-row">
            <h2 class="t-sec">${esc(d.nm)}</h2>
            ${badge(`${c.ico} ${c.nm}`, 'b-solid')}
            ${vacBadge(d)}
          </div>
          <p class="t-sub mt2">${esc(d.breed)} · ${esc(d.age)} · ${esc(d.sex)}${d.neut ? ' · 중성화 완료' : ''} · ${d.kg}kg</p>
          <div class="row wrap-row mt3">${d.tags.map((t) => badge(t, 'b-line')).join('')}</div>
        </div>
      </div>

      ${kv([
      ['배정된 반', `${esc(c.nm)} <span class="t-sub">(${esc(c.kg)}) · 오늘 ${clsNow(c.id)}/${c.cap}마리</span>`],
      ['백신', vacBadge(d, { full: true })],
      ['회차권', p ? `잔여 <b class="pri">${p.left}</b>회 <span class="t-sub">· ${p.until}까지 (${p.leftDays}일 남음)</span>` : '정기 요일권'],
      ['담당 보호자', esc(d.guardian)],
    ], { cls: 'mt6' })}

      <div class="btns mt6">
        ${btn(`${esc(d.nm)} 프로필 자세히`, { href: 'PL0401', cls: 'btn-pri' })}
        ${btn('예약하기', { href: 'RE0101', cls: 'btn-ghost' })}
        ${btn('알림장 보기', { href: 'MY0401', cls: 'btn-ghost' })}
      </div>`, i === 0);
  };

  const 같은반 = MINE.every((d) => 반찾기(d.kg).id === 반찾기(MINE[0].kg).id);

  const body = `${leafHd(ctx, `등록한 아이가 ${MINE.length}마리라 위쪽에 전환 탭이 생겼습니다. 탭을 눌러도 화면 주소는 그대로예요.`)}

${card(null, tabBox(
    MINE.map((d, i) => ({ label: `${d.nm} (${d.breed})`, pane: 'sib' + i })),
    MINE.map(몸통).join(''),
    0,
    { pill: true },
  ), { cls: 'mt8' })}

${banner(같은반 ? 'ok' : 'info', '🐕‍🦺',
    같은반
      ? `<b>${MINE.map((d) => esc(d.nm)).join('와 ')}는 같은 반에서 함께 지냅니다.</b>`
      : `<b>${MINE.map((d) => `${esc(d.nm)} ${d.kg}kg → ${esc(반찾기(d.kg).nm)}`).join(' · ')}</b>
       <div class="t-sub mt2">몸무게가 달라 노는 시간에는 반이 나뉩니다. 등하원은 함께 하고, 알림장은 아이마다 따로 갑니다.</div>`,
    { cls: 'mt6' })}

${sec(`${MINE.length}마리 한눈에 보기`, table(
    ['이름', '견종', '몸무게', '반', '백신', '회차권'],
    MINE.map((d) => [
      `<b>${esc(d.nm)}</b>`,
      esc(d.breed),
      `${d.kg}kg`,
      esc(반찾기(d.kg).nm),
      vacBadge(d),
      이용권[d.id] ? `${이용권[d.id].left}회` : '정기 요일권',
    ]),
  ), { desc: '탭으로 하나씩 보시는 것이 답답할 때를 위해 나란히도 적어 두었습니다.' })}

${banner('info', '💰', `두 마리를 함께 등록하셨으므로 둘째 아이 요금에 <b>${PRICE.siblingOff}% 할인</b>이 붙습니다.`, {
    cls: 'mt6',
    right: btn('회차권 현황 보기', { href: 'MY0201', cls: 'btn-ghost', sm: true }),
  })}`;

  return { body, o: {} };
};

/* ============================================================
   PL0405 반려견 프로필 상세 > 최근 알림장 미리보기
   ⭐ 아이를 고르면 목록이 «실제로» 줄어든다 (data-filter-for)
   ============================================================ */
P['PL0405'] = (ctx) => {
  /* 아이마다 최근 3건까지. 목록에 적힌 수와 개수 글자가 갈라질 수 없게 «세어» 쓴다. */
  const 뽑기 = (nm) => NOTES.filter((n) => n.dog === nm).slice(0, 3);
  const 목록 = MINE.flatMap((d) => 뽑기(d.nm)).sort((a, b) => (a.date < b.date ? 1 : -1));
  const 안읽음 = 목록.filter((n) => !n.read).length;
  const 사진합 = 목록.reduce((s, n) => s + n.pics, 0);

  const body = `${leafHd(ctx, `프로필 아래에 붙는 최근 알림장입니다. 아이마다 최근 3건까지 보여드려요.`)}

${card('최근 알림장', `
  <div class="row-b wrap-row">
    <div class="t-sub">보이는 알림장 <b class="num" data-filter-cnt="notes">${목록.length}</b>건
      ${안읽음 ? ` · ${badge(`안 읽음 ${안읽음}건`, 'b-warn')}` : ''}</div>
    ${chips(['전체', ...MINE.map((d) => d.nm)], 0, { boxAttr: ' data-filter-for="notes"' })}
  </div>

  <div class="list1 mt4" data-filter-list="notes">
    ${목록.map((n) => noteCard(n, { href: 'MY0501' })).join('')}
  </div>

  <div data-empty-for="notes" hidden>
    ${empty('📮', '그 아이의 알림장이 아직 없어요',
    '등원한 날 저녁에 사진과 하루 일과를 정리해서 보내드립니다.',
    btn('등원 예약하기', { href: 'RE0101', cls: 'btn-pri' }))}
  </div>

  <div class="btns mt6">
    ${btn('알림장함 전체 보기', { href: 'MY0401', cls: 'btn-sub' })}
    ${btn('프로필로 돌아가기', { href: 'PL0401', cls: 'btn-ghost' })}
  </div>`, { cls: 'mt8' })}

${sec('이 미리보기에 대해', `<div class="g3">
  ${box(`<div class="t-sub">보이는 알림장</div><div class="t-page pri num">${목록.length}</div><div class="t-sub">아이마다 최근 3건까지</div>`)}
  ${box(`<div class="t-sub">담긴 사진</div><div class="t-page pri num">${사진합}</div><div class="t-sub">장</div>`)}
  ${box(`<div class="t-sub">아직 안 읽은 것</div><div class="t-page ${안읽음 ? 'dan' : 'pri'} num">${안읽음}</div><div class="t-sub">건</div>`)}
</div>`)}

${banner('info', '📮', `알림장은 하원 뒤 정리해서 보통 저녁 18시 30분에 카카오톡(${esc(SITE.kakao)})으로 보내드립니다.
  등원하지 않은 날은 목록에서 회색으로 표시되고, 알림장은 오지 않아요.`, { cls: 'mt6' })}`;

  return { body, o: {} };
};
