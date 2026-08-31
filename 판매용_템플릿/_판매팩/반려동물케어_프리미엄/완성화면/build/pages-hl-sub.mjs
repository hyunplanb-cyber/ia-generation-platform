/* HL 건강·안전 관리 — 잎사귀 13장.
   부모(HL0101·HL0201·HL0301·HL0401)의 뼈대·색·톤은 U.shell() 이 그대로 유지해 준다.
   여기서는 그 화면의 «상태·세부»만 보여준다.

   ⚠ 이 메뉴의 알맹이는 «백신»이다. 「접종 증명서가 없으면 등원 자체가 잠긴다」가
     쇼핑몰 도구로는 안 되는 자리다. 그래서 날수·마리수·건수를 이 파일에서
     손으로 적지 않는다 — 전부 data.mjs 에서 «세거나 빼서» 만든다.
     한 숫자를 고치면 그 숫자로 계산되는 값이 전부 따라온다. */
import * as U from './ui.mjs';
import {
  SITE, TODAY, DOGS, DOG, CLS, VAC_STAT, ROSTER_TOTAL,
  ALERTS, HEALTH_LOG, VAC_LOG, STAFF,
} from './data.mjs';

const P = {};
export const PAGES = P;

/* ---------- 날짜 셈 — 「오늘」은 언제나 TODAY 하나뿐이다 ---------- */
const 날 = (ymd) => { const [y, m, d] = String(ymd).split('-').map(Number); return Date.UTC(y, m - 1, d); };
const 오늘 = Date.UTC(TODAY.y, TODAY.m - 1, TODAY.d);
/** 오늘로부터 며칠 뒤인가 (지난 날이면 음수) */
const D = (ymd) => Math.round((날(ymd) - 오늘) / 86400000);
/** 두 날 사이가 며칠인가 */
const 사이 = (a, b) => Math.round((날(b) - 날(a)) / 86400000);
const 지난날 = (n) => (n === 1 ? '어제' : `${n}일 전`);

/* ---------- 백신 무리 — 대시보드(HL0101)와 «같은 데»서 온다 ---------- */
const 백신순 = [...DOGS].sort((a, b) => a.vacD - b.vacD);
const 만료 = DOGS.filter((d) => d.vac === '만료');
const 임박 = DOGS.filter((d) => d.vac === '임박');
/** 일괄 안내 대상 — 스펙팩 HL0103 「임박·만료 대상 전체」 */
const 안내대상 = [...만료, ...임박].sort((a, b) => a.vacD - b.vacD);
/** HL0101 지표 카드가 「30일 안에 만료됩니다」라고 적어 둔 그 기준. HL0405 규칙이 이 값을 쓴다. */
const 임박기준 = 30;

/* ---------- 알림 무리 — 발송 관리(HL0401)와 «같은 데»서 온다 ---------- */
const 실패 = ALERTS.filter((a) => a.st === '실패');
const 읽음 = ALERTS.filter((a) => a.st === '읽음');
const 전달됨 = ALERTS.filter((a) => a.st === '전달됨');
const 백신알림 = ALERTS.filter((a) => a.kind === '백신 만료');
const 채널아이콘 = { 카카오톡: '💬', 앱푸시: '📱', 문자: '✉️' };
/** 실패한 까닭 — 툴팁으로 보여 준다(HL0403·HL0404) */
const 실패사유 = {
  루키: '보호자가 카카오톡 채널을 차단했습니다 (수신 거부)',
  몽이: '등록된 번호로 문자가 가지 않았습니다 (없는 번호)',
};
/** 실패했을 때 대신 써 볼 채널 — 그 아이에게 «아직 안 써 본» 채널이다 */
const 대체채널 = { 카카오톡: '문자', 앱푸시: '카카오톡', 문자: '앱푸시' };
/** 채널별 도달률 — 손으로 적지 않고 ALERTS 를 «세어» 만든다 */
const 채널표 = ['카카오톡', '앱푸시', '문자'].map((ch) => {
  const 전부 = ALERTS.filter((a) => a.ch === ch);
  const 닿음 = 전부.filter((a) => a.st !== '실패');
  const 열림 = 전부.filter((a) => a.st === '읽음');
  return {
    ch, 보냄: 전부.length, 닿음: 닿음.length, 열림: 열림.length,
    도달률: 전부.length ? Math.round(닿음.length / 전부.length * 100) : 0,
    열람률: 전부.length ? Math.round(열림.length / 전부.length * 100) : 0,
  };
});
const 채널 = (ch) => 채널표.find((c) => c.ch === ch);

/* ---------- 초코의 백신 이력 — 접종일 + 유효기간 = 만료일을 «계산»으로 맞춘다 ----------
   ⚠ 세 숫자(접종일·유효기간·만료일)를 따로 적으면 반드시 갈라진다.
     여기서는 접종일과 만료일 둘만 data.mjs 에서 읽고, 유효기간과 남은 일수는 «빼서» 만든다. */
const 초코 = DOG('d01');
const 백신이력 = VAC_LOG.map((v) => {
  const 기간 = 사이(v.date, v.until);       // 접종일 → 만료일
  const 남 = D(v.until);                    // 오늘 → 만료일
  return { ...v, 기간, 남, 살아있나: 남 >= 0, 상태: 남 < 0 ? '지난' : (남 <= 임박기준 ? '임박' : '유효') };
});
const 살아있는백신 = 백신이력.filter((v) => v.살아있나);
/** 가장 «먼저» 만료되는 백신 — 부모(HL0201)가 적어 둔 그 문장과 같은 값이어야 한다 */
const 첫만료 = [...살아있는백신].sort((a, b) => a.남 - b.남)[0];

/* ============================================================
   HL0102 백신 만료 대시보드 > 만료 임박순 정렬
   ⚠ 「누르면 정렬됩니다」라고 글로 적지 않는다. data-sort-for 로 «진짜로» 옮긴다.
     줄마다 견줄 값(data-s-*)을 붙여 두어야 차례가 실제로 바뀐다.
   ============================================================ */
P['HL0102'] = (ctx) => {
  const 줄 = (d) => ({
    attr: ` data-tag="${d.vac}" data-s-d="${d.vacD}" data-s-nm="${U.esc(d.nm)}" data-s-cls="${U.esc(CLS(d.cls).nm)}"`,
    cls: d.vac === '만료' ? 'bad' : '',
    cells: [
      { t: U.dogPh(d.nm, 44), cls: 'nowrap' },
      { t: `<b>${U.esc(d.nm)}</b><div class="sub">${U.esc(d.breed)} · ${d.kg}kg</div>`, cls: 'nowrap' },
      U.esc(CLS(d.cls).nm),
      { t: `<span class="num">${d.vacD < 0 ? `${Math.abs(d.vacD)}일 지남` : `D-${d.vacD}`}</span>`, cls: 'c nowrap' },
      { t: U.vacBadge(d), cls: 'c' },
      U.esc(d.guardian),
    ],
  });

  const body = `${U.leafHd(ctx, `남은 일수가 적은 아이가 맨 위로 옵니다 · 전체 원생 ${ROSTER_TOTAL}마리 중 오늘 명단 ${백신순.length}마리`,
    U.btn('대시보드로', { href: 'HL0101', cls: 'btn-ghost' }))}

${U.banner('mut', '↕️', `<b>고르개를 바꾸면 아래 표의 차례가 그 자리에서 바뀝니다.</b>
  <div class="t-sub mt2">지금은 <b>만료 임박순</b>입니다 — 맨 위가 ${U.esc(백신순[0].nm)}(${백신순[0].vacD < 0 ? `${Math.abs(백신순[0].vacD)}일 지남` : `D-${백신순[0].vacD}`}),
  맨 아래가 ${U.esc(백신순[백신순.length - 1].nm)}(D-${백신순[백신순.length - 1].vacD})입니다.
  상태 단추는 «하나만» 켜집니다.</div>`, { cls: 'mt8' })}

<div class="filters mt6">
  ${U.select(['만료 임박순', '이름순', '반순'], 0, { vals: ['D', 'Nm', 'Cls'], attr: ' data-sort-for="vacSort"' })}
  ${U.chips(['전체', '정상', '임박', '만료'], 0, { boxAttr: ' data-filter-for="vacSort"' })}
  <span class="t-sub"><b data-filter-cnt="vacSort">${백신순.length}</b>마리</span>
</div>

<div class="mt4" data-filter-list="vacSort">
${U.table(
    [{ t: '', w: '64px' }, '이름', '반', { t: '남은 일수', cls: 'c' }, { t: '상태', cls: 'c' }, '보호자'],
    백신순.map(줄),
  )}
</div>
<div hidden data-empty-for="vacSort">${U.empty('💉', '결과가 없습니다', '고르신 상태에 해당하는 아이가 없어요.', U.btn('전체 보기', { href: 'HL0102', cls: 'btn-pri' }))}</div>

${U.card('지금 차례대로 챙길 아이', `
  ${U.timeline(안내대상.map((d) => ({
    k: d.vac === '만료' ? 'on' : 'done',
    hh: d.vacD < 0 ? `${Math.abs(d.vacD)}일 지남` : `D-${d.vacD}`,
    t: `${U.esc(d.nm)} <span class="t-sub">— ${U.esc(CLS(d.cls).nm)} · 보호자 ${U.esc(d.guardian)}</span>`,
    d: d.vac === '만료'
      ? '등원 예약과 등원 체크가 잠깁니다. 재접종 증명서를 받아야 풀립니다.'
      : `${임박기준}일 안에 만료됩니다. 지금 안내를 보내면 늦지 않아요.`,
  })))}
  <p class="hint">만료 ${만료.length}마리 · 임박 ${임박.length}마리 — 표를 어떤 차례로 놓아도 이 ${안내대상.length}마리는 바뀌지 않습니다.</p>`,
  { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('일괄 알림 발송', { href: 'HL0103', cls: 'btn-pri' })}
  ${U.btn('백신 만료 대시보드', { href: 'HL0101', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   HL0103 백신 만료 대시보드 > 일괄 알림 발송
   ⛔ 브라우저 기본 확인창을 쓰지 않는다 — 검사기가 그 자리에서 영원히 멈춘다.
     U.modal() + data-modal 로 확인을 받는다.
   ⚠ 「몇 마리에게 보내나」가 아래 목록 줄 수와 «같은 값»에서 나와야 한다.
   ============================================================ */
P['HL0103'] = (ctx) => {
  const 대상줄 = 안내대상.map((d) => `<label class="check">
    <input type="checkbox" checked>
    <span><b>${U.esc(d.nm)}</b> ${U.vacBadge(d)}
      <span class="sub">${U.esc(CLS(d.cls).nm)} · 보호자 ${U.esc(d.guardian)} 님${d.phone ? ` · ${U.esc(d.phone)}` : ''} · ${U.esc(d.breed)}</span>
      <span class="sub">${d.vac === '만료'
        ? `종합백신이 ${Math.abs(d.vacD)}일 전에 만료됐습니다 — 재접종 증명서를 올려 주셔야 등원할 수 있어요`
        : `${d.vacD}일 뒤 만료됩니다 — 미리 접종해 주세요`}</span>
    </span></label>`).join('');

  const body = `${U.leafHd(ctx, `만료 임박 ${임박.length}마리와 만료 ${만료.length}마리, 모두 ${안내대상.length}마리에게 한 번에 보냅니다`,
    U.btn('대시보드로', { href: 'HL0101', cls: 'btn-ghost' }))}

<div class="g3 mt8">
  ${U.stat('보낼 대상', 안내대상.length, { ico: '📤', u: '마리', d: `만료 ${만료.length} + 임박 ${임박.length}` })}
  ${U.stat('기본 채널', '카카오톡', { ico: '💬', d: `지금까지 도달률 ${채널('카카오톡').도달률}%` })}
  ${U.stat('보내는 사람', '김보육 선생님', { ico: '🙋', d: U.esc(TODAY.label) })}
</div>

${U.card(`받을 아이 ${안내대상.length}마리`, `
  <div data-pick-scope="bulk">${대상줄}</div>
  <p class="hint">지금 <b data-pick-out="bulk">${안내대상.length}</b>마리를 골랐습니다. 체크를 풀면 그 아이는 빠지고, 아래 버튼의 숫자도 함께 줄어듭니다.</p>`,
  { cls: 'mt6' })}

${U.card('보낼 내용', `
  ${U.field('제목', U.input({ v: '[도그마루] 접종 증명서를 확인해 주세요' }))}
  ${U.field('본문', U.textarea({
    v: '안녕하세요, 도그마루 반려견 유치원입니다.\n아이의 백신 유효기간이 얼마 남지 않았어요. 재접종 후 증명서를 앱에 올려 주시면 등원 예약이 그대로 이어집니다.\n궁금한 점은 이 채널로 답장 주세요.',
    attr: ' style="min-height:150px"',
  }), { hint: '아이 이름과 남은 일수는 보낼 때 아이마다 자동으로 채워집니다 — 위 목록에 적힌 그 값입니다.' })}
  ${U.check('보호자가 안 읽으면 3일 뒤 문자로 한 번 더 보내기', { on: true, sub: `문자 도달률은 지금까지 ${채널('문자').도달률}% 입니다` })}`,
  { cls: 'mt6' })}

${U.banner('warn', '⚠️', `<b>보내기 전에 한 번만 더 봅니다.</b>
  <div class="t-sub mt2">같은 안내가 하루에 두 번 가면 보호자가 채널을 끕니다.
  ${백신알림.length}건은 이미 나갔고, 그 결과는 <b>재업로드 요청 이력</b>에서 볼 수 있어요.</div>`,
  { cls: 'mt6', right: U.btn('요청 이력 보기', { href: 'HL0104', cls: 'btn-ghost', sm: true }) })}

<div class="btns mt8">
  ${U.btn(`고른 <b data-pick-out="bulk">${안내대상.length}</b>마리에게 재접종 안내 보내기`, {
    cls: 'btn-pri', lg: true, attr: ' data-pick-btn="bulk" data-modal="mBulk"',
  })}
  ${U.btn('취소하고 대시보드로', { href: 'HL0101', cls: 'btn-ghost' })}
</div>`;

  const after = U.modal('mBulk', '재접종 안내를 보낼까요?', `
    <p class="t-sub">위에서 고른 보호자에게 <b>카카오톡</b>으로 재접종 안내가 나갑니다.
    보낸 뒤에는 되돌릴 수 없고, 결과(전달됨·읽음·실패)는 보호자 알림 발송 관리에서 확인합니다.</p>
    ${U.kv([
      ['보내는 채널', `${채널아이콘.카카오톡} 카카오톡 (도달률 ${채널('카카오톡').도달률}%)`],
      ['안 읽으면', `3일 뒤 문자로 한 번 더 (도달률 ${채널('문자').도달률}%)`],
      ['보내는 때', '누르는 즉시'],
    ], { cls: 'left mt4' })}`,
    `${U.btn('다시 보기', { cls: 'btn-ghost', attr: ' data-dismiss' })}
     ${U.btn('보내기', { cls: 'btn-pri', attr: ' data-notify="재접종 안내를 보냈어요 — 결과는 보호자 알림 발송 관리에서 볼 수 있습니다" data-dismiss' })}`);

  return { body, o: { after } };
};

/* ============================================================
   HL0104 백신 만료 대시보드 > 재업로드 요청 이력
   ⚠ 새 이력을 지어내지 않는다. 부모(HL0101)가 쓰는 그 ALERTS 에서 온다.
   ============================================================ */
P['HL0104'] = (ctx) => {
  /* 요청을 보낸 아이가 지금 어떤 상태인가 — 이름으로 이어 붙인다 */
  const 이력 = 백신알림.map((a) => ({ ...a, dogRef: DOGS.find((d) => d.nm === a.dog) }));
  const 아직 = 이력.filter((x) => !x.dogRef || x.dogRef.vac !== '정상');

  const body = `${U.leafHd(ctx, `언제 누구에게 접종 증명서를 다시 올려 달라고 했는지 — 모두 ${이력.length}건`,
    U.btn('대시보드로', { href: 'HL0101', cls: 'btn-ghost' }))}

${U.banner(아직.length ? 'warn' : 'ok', '📄', `<b>${이력.length}건을 요청했고, 그 가운데 ${아직.length}건은 아직 증명서가 올라오지 않았습니다.</b>
  <div class="t-sub mt2">${아직.map((x) => `${U.esc(x.dog)}(${x.dogRef ? (x.dogRef.vac === '만료' ? `만료 ${Math.abs(x.dogRef.vacD)}일 지남` : `D-${x.dogRef.vacD}`) : '확인 중'})`).join(' · ')}
  — 증명서가 올라오면 이 줄이 저절로 사라집니다.</div>`, { cls: 'mt8' })}

<div class="mt6">
${U.table(
    ['요청한 때', '반려견', '보호자', { t: '채널', cls: 'c' }, { t: '발송 결과', cls: 'c' }, '지금 백신 상태', { t: '', cls: 'c' }],
    이력.map((x) => ({
      cls: x.st === '실패' ? 'bad' : '',
      cells: [
        { t: `<span class="num">${U.esc(x.when)}</span>`, cls: 'nowrap' },
        { t: `<b>${U.esc(x.dog)}</b>`, cls: 'nowrap' },
        `${U.esc(x.guardian)} 님`,
        { t: `${채널아이콘[x.ch] || ''} <span class="sub">${U.esc(x.ch)}</span>`, cls: 'c nowrap' },
        { t: U.stBadge(x.st), cls: 'c' },
        { t: x.dogRef ? U.vacBadge(x.dogRef) : '<span class="muted">—</span>', cls: 'nowrap' },
        {
          t: x.st === '실패'
            ? U.btn('재발송', { cls: 'btn-dan', sm: true, attr: ` data-resend="${U.esc(x.dog)} 접종 증명서 재업로드 요청"` })
            : U.btn('재요청', { cls: 'btn-ghost', sm: true, attr: ` data-notify="${U.esc(x.guardian)} 님께 ${U.esc(x.dog)}의 접종 증명서 재업로드를 다시 요청했어요"` }),
          cls: 'c',
        },
      ],
    })),
  )}
</div>

${U.card('요청이 실제로 하는 일', `
  ${U.kv([
    ['요청을 보내면', '보호자 앱의 「반려견 등록 › 백신 증명서」 칸이 열리고, 그 자리로 바로 가는 링크가 함께 갑니다'],
    ['증명서가 올라오면', '원장이 확인하는 즉시 상태가 «정상»으로 바뀌고, 잠겼던 등원 체크가 풀립니다'],
    ['실패하면', '보호자께 전화로 새 번호를 여쭙니다. 번호를 고치면 이 화면에서 다시 보낼 수 있어요'],
    ['자동으로도 나갑니다', `만료 ${임박기준}일 전과 7일 전, 두 번 저절로 나갑니다`],
  ], { cls: 'left' })}`, { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('일괄 알림 발송', { href: 'HL0103', cls: 'btn-sub' })}
  ${U.btn('보호자 알림 발송 관리', { href: 'HL0401', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   HL0202 반려견별 건강기록 상세 > 관찰 기록 타임라인
   ⚠ 날짜 앞뒤를 사람이 센다. 오늘은 TODAY(2026-08-24 월)이고,
     기록은 모두 오늘보다 앞이어야 한다 — 아래에서 «오늘로부터 며칠 전»을 계산해 붙인다.
   ============================================================ */
P['HL0202'] = (ctx) => {
  const 기록 = [...HEALTH_LOG]
    .map((h) => ({ ...h, 전: -D(h.date) }))
    .sort((a, b) => a.전 - b.전);                 // 가까운 날이 위로
  const 사람 = [...new Set(기록.map((h) => h.by))];

  const body = `${U.leafHd(ctx, `${U.esc(초코.nm)} · ${U.esc(초코.breed)} · ${U.esc(CLS(초코.cls).nm)} — 원에서 관찰한 기록 ${기록.length}건`,
    U.btn('건강기록 상세', { href: 'HL0201', cls: 'btn-ghost' }))}

<div class="g3 mt8">
  ${U.stat('관찰 기록', 기록.length, { ico: '📝', u: '건', d: `${U.esc(기록[기록.length - 1].date)} 부터` })}
  ${U.stat('가장 최근', 지난날(기록[0].전), { ico: '🕒', d: `${U.esc(기록[0].date)} · ${U.esc(기록[0].t)}` })}
  ${U.stat('적은 선생님', 사람.length, { ico: '🙋', u: '명', d: 사람.map(U.esc).join(' · ') })}
</div>

${U.card('관찰 기록 타임라인', `
  ${U.timeline(기록.map((h, i) => ({
    k: i === 0 ? 'on' : 'done',
    hh: `${h.date} · ${지난날(h.전)}`,
    t: `${U.esc(h.t)} <span class="t-sub">— ${U.esc(h.by)} 선생님</span>`,
    d: U.esc(h.d),
  })))}
  <p class="hint">위가 가장 가까운 날입니다. 기록은 고칠 수 없고 덧붙이기만 됩니다 — 나중에 무슨 일이 있었는지 설명해야 하는 자리이기 때문입니다.</p>`,
  { cls: 'mt6' })}

${U.banner('mut', 'ℹ️', `<b>보호자가 적어 주신 것과 원이 본 것은 다른 자리입니다.</b>
  <div class="t-sub mt2">알러지·지병·복용약은 보호자가 반려견 등록에서 적고, 이 타임라인은 원에서만 적습니다.
  둘을 한 화면에서 잇대어 보려면 건강기록 상세로 가세요.</div>`,
  { cls: 'mt6', right: U.btn('건강기록 상세', { href: 'HL0201', cls: 'btn-ghost', sm: true }) })}

<div class="btns mt8">
  ${U.btn('＋ 오늘 관찰한 것 기록하기', { href: 'HL0204', cls: 'btn-pri' })}
  ${U.btn('백신 이력 표', { href: 'HL0203', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   HL0203 반려견별 건강기록 상세 > 백신 이력 표
   ⚠ 접종일 + 유효기간 = 만료일. 세 숫자를 따로 적으면 반드시 갈라진다 —
     접종일과 만료일만 읽고, 유효기간·남은 일수는 «빼서» 만든다.
   ============================================================ */
P['HL0203'] = (ctx) => {
  const 줄 = (v) => ({
    attr: ` data-tag="${v.상태 === '지난' ? '지난' : '유효'}" data-s-left="${v.남}" data-s-date="${사이('2020-01-01', v.date)}" data-s-kind="${U.esc(v.kind)}"`,
    cls: v.살아있나 ? '' : 'mut',
    cells: [
      { t: `<span class="num">${U.esc(v.date)}</span>`, cls: 'nowrap' },
      `<b>${U.esc(v.kind)}</b>`,
      { t: `<span class="num">${v.기간}일</span>${v.기간 === 365 ? ' <span class="sub">(1년)</span>' : ''}`, cls: 'c nowrap' },
      { t: `<span class="num">${U.esc(v.until)}</span>`, cls: 'nowrap' },
      { t: `<span class="num">${v.남 < 0 ? `${Math.abs(v.남)}일 지남` : `D-${v.남}`}</span>`, cls: 'c nowrap' },
      {
        t: v.상태 === '지난' ? U.badge('지난 접종', 'b-mut')
          : (v.상태 === '임박' ? U.badge(`만료 D-${v.남}`, 'b-warn') : U.badge('유효', 'b-ok')),
        cls: 'c',
      },
      U.esc(v.vet),
      { t: U.btn('증명서 보기', { cls: 'btn-ghost', sm: true, attr: ' data-toast="증명서 사진을 크게 봅니다 (프로토타입)"' }), cls: 'c' },
    ],
  });

  const body = `${U.leafHd(ctx, `${U.esc(초코.nm)}의 접종 이력 ${백신이력.length}건 — 지금 유효한 것 ${살아있는백신.length}건`,
    U.btn('건강기록 상세', { href: 'HL0201', cls: 'btn-ghost' }))}

${U.banner(첫만료.상태 === '유효' ? 'ok' : 'warn', '💉', `<b>가장 먼저 만료되는 것은 ${U.esc(첫만료.kind)} — ${U.esc(첫만료.until)} (D-${첫만료.남})입니다.</b>
  <div class="t-sub mt2">이 날이 지나면 ${U.esc(초코.nm)}의 등원 예약과 등원 체크가 잠깁니다.
  만료 ${임박기준}일 전과 7일 전에 보호자께 자동으로 안내가 나갑니다.</div>`, { cls: 'mt8' })}

<div class="filters mt6">
  ${U.select(['만료 임박순', '접종일 오래된 순', '종류순'], 0, { vals: ['Left', 'Date', 'Kind'], attr: ' data-sort-for="vacLog"' })}
  ${U.chips(['전체', '유효', '지난'], 0, { boxAttr: ' data-filter-for="vacLog"' })}
  <span class="t-sub"><b data-filter-cnt="vacLog">${백신이력.length}</b>건</span>
</div>

<div class="mt4" data-filter-list="vacLog">
${U.table(
    ['접종일', '종류', { t: '유효기간', cls: 'c' }, '만료일', { t: '남은 일수', cls: 'c' }, { t: '상태', cls: 'c' }, '접종 병원', { t: '증명서', cls: 'c' }],
    백신이력.map(줄),
  )}
</div>
<div hidden data-empty-for="vacLog">${U.empty('💉', '결과가 없습니다', '고르신 상태의 접종 기록이 없어요.', U.btn('전체 보기', { href: 'HL0203', cls: 'btn-pri' }))}</div>

${U.card('이 표를 읽는 법', `
  ${U.kv([
    ['유효기간', '「만료일 − 접종일」을 그대로 센 날수입니다. 손으로 적지 않으므로 날짜를 고치면 함께 바뀝니다'],
    ['남은 일수', `오늘(${U.esc(TODAY.label)})에서 만료일까지입니다. 0보다 작으면 이미 지난 접종입니다`],
    ['등원에 필요한 것', '종합백신(DHPPL)과 광견병, 둘 다 유효기간 안이어야 합니다'],
    ['증명서', `접종 병원(${U.esc(SITE.vet.nm)})에서 받은 사진이나 수첩 사진을 보호자가 올립니다`],
  ], { cls: 'left' })}
  <p class="hint">지난 접종도 지우지 않고 남겨 둡니다 — 몇 년째 무엇을 맞았는지가 다음 접종을 정할 때 필요합니다.</p>`,
  { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('관찰 기록 타임라인', { href: 'HL0202', cls: 'btn-ghost' })}
  ${U.btn('백신 만료 대시보드', { href: 'HL0101', cls: 'btn-sub' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   HL0204 반려견별 건강기록 상세 > 기록 추가
   ⚠ 사진은 보육교사가 직접 찍어 올릴 자리다 — 자리표로 둔다.
   ============================================================ */
P['HL0204'] = (ctx) => {
  const 최근 = [...HEALTH_LOG].sort((a, b) => 날(b.date) - 날(a.date))[0];
  const 교사 = STAFF.filter((s) => s.st === '활성');

  const body = `${U.leafHd(ctx, `${U.esc(초코.nm)}의 건강기록에 오늘(${U.esc(TODAY.label)}) 본 것을 한 줄 더합니다`,
    U.btn('타임라인으로', { href: 'HL0202', cls: 'btn-ghost' }))}

${U.card('무엇을 보았나요', `
  <div class="f2">
    ${U.field('본 날', U.input({ type: 'date', v: `${TODAY.y}-${String(TODAY.m).padStart(2, '0')}-${String(TODAY.d).padStart(2, '0')}` }), { req: true })}
    ${U.field('적는 사람', U.select(교사.map((s) => `${s.nm} (${s.role})`), 2), { req: true })}
  </div>
  ${U.field('제목', U.input({ ph: '예: 오른쪽 뒷다리를 살짝 절어요' }), { req: true, hint: '타임라인에 굵게 보이는 한 줄입니다. 짧게 적습니다' })}
  ${U.field('자세히', U.textarea({ ph: '언제·어떤 상황에서 봤는지, 그때 어떻게 했는지, 지금은 어떤지 순서로 적어 주세요', attr: ' style="min-height:140px"' }))}`,
  { cls: 'mt8' })}

${U.card('사진 (있으면)', `
  ${U.uploadDrop('본 자리를 찍은 사진을 올려 주세요 (여러 장 가능)')}
  <p class="hint">사진은 보호자에게 그대로 갑니다. 아이 얼굴보다 <b>본 자리</b>가 크게 나오게 찍어 주세요.</p>`,
  { cls: 'mt6' })}

${U.card('보호자에게 알릴까요', `
  ${U.check('<b>이 기록을 보호자에게도 보냅니다</b>', { on: true, sub: `${U.esc(초코.guardian)} 님 · ${U.esc(초코.phone)} · 카카오톡 (도달률 ${채널('카카오톡').도달률}%)` })}
  ${U.check('오늘 알림장에도 같이 붙입니다', { on: true, sub: '알림장은 저녁 18:30 에 한 번에 나갑니다' })}
  ${U.banner('mut', 'ℹ️', `다치거나 아팠던 «사고»는 이 화면이 아니라 <b>사고·특이사항 기록</b>에 남깁니다.
    거기에는 긴급도와 병원 이송 칸이 따로 있어요.`, { cls: 'mt4', right: U.btn('사고 기록으로', { href: 'HL0301', cls: 'btn-dan', sm: true }) })}`,
  { cls: 'mt6' })}

${U.card('저장하면 타임라인의 맨 위에 붙습니다', `
  ${U.timeline([
    { k: 'on', hh: `${TODAY.y}-${String(TODAY.m).padStart(2, '0')}-${String(TODAY.d).padStart(2, '0')} · 오늘`, t: '<span class="muted">지금 적고 있는 기록</span>', d: '<span class="muted">위에 적은 제목과 내용이 여기에 들어갑니다.</span>' },
    { k: 'done', hh: `${최근.date} · ${지난날(-D(최근.date))}`, t: `${U.esc(최근.t)} <span class="t-sub">— ${U.esc(최근.by)} 선생님</span>`, d: U.esc(최근.d) },
  ])}`, { cls: 'mt6' })}

<div class="btns mt8">
  ${U.btn('기록 저장하고 보호자에게 알림', {
    cls: 'btn-pri', lg: true,
    attr: ' data-notify="관찰 기록을 남기고 보호자에게 알렸어요" data-notify-once="기록했어요"',
  })}
  ${U.btn('취소', { href: 'HL0202', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   HL0302 사고·특이사항 기록 > 긴급도 높음 경고
   ⚠ 「높음」을 고른 «그 상태»를 처음부터 보여 준다 — 붉은 안내가 떠 있고,
     보호자 연락 체크를 하기 전에는 저장이 잠겨 있다.
     고르개를 바꾸면 app.js 가 실제로 칸을 여닫고 버튼을 잠갔다 푼다.
   ============================================================ */
P['HL0302'] = (ctx) => {
  const 다친아이 = DOG('d13');                       // 태양 — ALERTS 에 사고 알림이 남아 있는 그 아이
  /* ⚠ 골라 둔 아이가 «단추 목록에 없으면» 「1마리를 골랐습니다」가 거짓말이 된다.
     그래서 다친 아이를 맨 앞에 세우고 자른다. */
  const 후보 = [다친아이, ...DOGS.filter((d) => d.st === '재원' && d.id !== 다친아이.id)].slice(0, 8);
  const 교사 = STAFF.filter((s) => s.st === '활성');

  const body = `${U.leafHd(ctx, '긴급도를 「높음」으로 고른 상태입니다 — 보호자 연락을 확인해야 저장할 수 있어요',
    U.btn('사고 기록으로', { href: 'HL0301', cls: 'btn-ghost' }))}

${U.banner('dan', '🚨', `<b>긴급도 「높음」은 기록보다 전화가 먼저입니다.</b>
  <div class="t-sub mt2">지금 화면 아래 <b>저장</b> 버튼은 잠겨 있습니다.
  보호자에게 전화로 알렸다고 체크해야 풀립니다 — 순서를 바꾸지 않으려고 일부러 잠가 둡니다.</div>`, { cls: 'mt8' })}

${U.card('① 어느 아이인가요', `
  <div class="chips" data-pick-scope="acc" data-multi>
    ${후보.map((d) => `<button class="chip${d.id === 다친아이.id ? ' on' : ''}" type="button">${U.esc(d.nm)} <span class="x">${U.esc(CLS(d.cls).nm)}</span></button>`).join('')}
  </div>
  <p class="hint"><b data-pick-out="acc">1</b>마리를 골랐습니다. 여러 아이가 얽힌 일이면 모두 고르세요.</p>`,
  { cls: 'mt6' })}

${U.card('② 지금까지 적은 것', `
  ${U.kv([
    ['반려견', `${U.esc(다친아이.nm)} · ${U.esc(다친아이.breed)} · ${다친아이.kg}kg · ${U.esc(CLS(다친아이.cls).nm)}`],
    ['보호자', `${U.esc(다친아이.guardian)} 님`],
    ['경위', '15시 20분쯤 야외 마당에서 공놀이를 하다가, 뛰어오르며 착지할 때 오른쪽 앞발이 접질렸습니다.'],
    ['부위·정도', '앞발·앞다리 · 절뚝임'],
    ['원에서 한 처치', '바로 안아 들어 실내로 옮기고, 찬 수건으로 감싼 뒤 쉬게 했습니다.'],
  ], { cls: 'left' })}`, { cls: 'mt6' })}

${U.card('③ 긴급도', `
  <div class="btns">
    ${['낮음', '보통', '높음'].map((t, i) => `<label class="check none">
      <input type="radio" name="urg" value="${t}"${t === '높음' ? ' checked' : ''} data-urgency>
      <span><b>${t}</b><span class="sub">${['원에서 처치하고 알림장에 적으면 됩니다', '보호자에게 오늘 안에 알립니다', '지금 바로 전화해야 합니다'][i]}</span></span>
    </label>`).join('')}
  </div>
  <div data-urgency-box class="mt6">
    ${U.banner('dan', '📞', `<b>${U.esc(다친아이.guardian)} 님께 즉시 연락하세요.</b>
      <div class="t-sub mt2">안 받으시면 비상 연락처로도 걸고, 문자를 함께 남깁니다.
      전화를 걸고 아래를 체크해야 저장할 수 있어요.</div>`)}
    <div class="box dan mt4">
      ${U.check('<b>보호자에게 전화로 알렸습니다</b>', { attr: ' data-unlock="urgBtn2"', sub: '이 체크가 저장 버튼을 풉니다 — 체크를 풀면 다시 잠깁니다' })}
      <div class="f2 mt4">
        ${U.field('연락한 시각', U.input({ type: 'time', v: '15:24' }))}
        ${U.field('연락한 사람', U.select(교사.map((s) => `${s.nm} (${s.role})`), 0))}
      </div>
      ${U.field('보호자가 하신 말씀', U.textarea({ ph: '예: 지금 바로 오시겠다고 하셨습니다. 병원부터 데려가 달라고 하셨어요.' }))}
    </div>
  </div>
  <p class="hint">「낮음」이나 「보통」으로 바꾸면 이 붉은 칸이 접히고 저장 버튼이 풀립니다. 다시 「높음」을 고르면 또 나타납니다.</p>`,
  { cls: 'mt6' })}

${U.banner('warn', '🏥', `<b>「높음」이면 병원 이송 칸도 함께 열립니다.</b>
  <div class="t-sub mt2">협력 병원은 ${U.esc(SITE.vet.nm)} — ${U.esc(SITE.vet.dist)} · ${U.esc(SITE.vet.tel)} 입니다.</div>`,
  { cls: 'mt6', right: U.btn('협력 병원 이송 기록', { href: 'HL0304', cls: 'btn-sub', sm: true }) })}`;

  return {
    body,
    o: {
      stick: U.stickBar(
        '<div><div class="t-sub">저장하면 보호자에게 카카오톡으로 바로 나갑니다</div><div class="t-card">보호자 연락을 체크해야 저장할 수 있어요</div></div>',
        `${U.btn('임시 저장', { cls: 'btn-ghost', attr: ' data-toast="임시 저장했어요 — 아직 보호자에게 가지 않았습니다"' })}
         ${U.btn('저장하고 보호자에게 알림', {
          cls: 'btn-pri', id: 'urgBtn2', off: true,
          attr: ' data-urgency-btn data-notify="사고 기록을 저장하고 보호자에게 알렸어요 — 발송 결과는 보호자 알림 발송 관리에서 볼 수 있습니다"',
        })}`,
      ),
    },
  };
};

/* ============================================================
   HL0303 사고·특이사항 기록 > 사진 첨부
   ⛔ 여기는 «보육교사가 직접 찍어 올릴» 사진 자리다. 사진을 지어 넣지 않는다.
     빈 자리표는 「무엇을 넣는 자리인지」를 맞게 말하지만, 엉뚱한 사진은 틀린 말을 한다.
     빈 것보다 틀린 것이 나쁘다.
   ============================================================ */
P['HL0303'] = (ctx) => {
  const 찍는법 = [
    ['멀리서 한 장', '어디를 다쳤는지 알 수 있게 아이 몸 전체가 나오게 찍습니다'],
    ['가까이서 한 장', '다친 자리만 화면 가운데에 크게 찍습니다'],
    ['처치한 뒤 한 장', '소독하고 거즈를 댄 모습까지 남기면 보호자가 훨씬 덜 불안해합니다'],
  ];

  const body = `${U.leafHd(ctx, '다친 자리를 찍어 올립니다 — 올린 사진은 보호자에게 그대로 갑니다',
    U.btn('사고 기록으로', { href: 'HL0301', cls: 'btn-ghost' }))}

${U.banner('warn', '📷', `<b>사진 한 장이 설명 열 줄보다 낫습니다.</b>
  <div class="t-sub mt2">다만 피가 많이 보이는 사진은 한 장이면 충분합니다.
  나머지는 처치한 뒤 모습으로 채워 주세요.</div>`, { cls: 'mt8' })}

${U.card('사진 올리기', `
  ${U.uploadDrop('눌러서 사고 부위 사진을 올려 주세요 (여러 장 가능)')}
  <p class="hint">권장 크기 1200×900 · 한 장에 5MB 까지 · JPG·PNG·HEIC. 올린 사진은 ✕ 로 지울 수 있습니다.</p>`,
  { cls: 'mt6' })}

${U.card('이렇게 찍어 주세요', `
  <div class="g3">
    ${찍는법.map(([t, d], i) => U.box(`<div class="t-sub">${i + 1}번째 장</div>
      <div class="t-card mt1">${t}</div><p class="t-sub mt2">${d}</p>`)).join('')}
  </div>
  <p class="hint">세 장이면 충분합니다. 사진이 많을수록 좋은 것이 아니라, <b>무엇을 보여 주는 사진인지</b>가 분명해야 합니다.</p>`,
  { cls: 'mt6' })}

${U.card('흐리게 나왔다면 다시 찍어 주세요', `
  ${U.banner('dan', '🔍', `<b>흔들리거나 어두운 사진은 보호자를 더 불안하게 만듭니다.</b>
    <div class="t-sub mt2">「상처가 큰 건지 작은 건지 모르겠다」는 되물음이 가장 많이 옵니다.</div>`)}
  ${U.kv([
    ['흔들렸다면', '아이를 안아 고정하고, 한 손으로 화면을 가볍게 눌러 초점을 맞춘 뒤 찍습니다'],
    ['어둡다면', '실내등 아래나 창가로 옮겨서 찍습니다. 플래시는 색이 날아가서 상처가 더 안 보입니다'],
    ['털에 가렸다면', '털을 손가락으로 좌우로 벌려 상처가 보이게 한 뒤 찍습니다'],
    ['크기를 모르겠다면', '동전이나 손가락을 옆에 함께 놓고 찍으면 크기가 바로 전해집니다'],
  ], { cls: 'left mt4' })}`, { cls: 'mt6' })}

<div class="btns mt8">
  ${U.btn('사진을 붙이고 사고 기록으로 돌아가기', { href: 'HL0301', cls: 'btn-pri' })}
  ${U.btn('협력 병원 이송 기록', { href: 'HL0304', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   HL0304 사고·특이사항 기록 > 협력 병원 이송 기록
   ⚠ 병원은 data.mjs 의 SITE.vet 하나뿐이다. 새 병원을 지어내지 않는다.
   ⚠ 시각의 앞뒤를 사람이 센다 — 사고 → 처치 → 연락 → 출발 → 도착 → 진료 → 귀원.
   ============================================================ */
P['HL0304'] = (ctx) => {
  const 다친아이 = DOG('d13');
  const 교사 = STAFF.filter((s) => s.st === '활성');
  /* 순서를 배열 «차례»로 못 박는다. 시각을 여기저기 흩어 적으면 앞뒤가 뒤집힌다. */
  const 흐름 = [
    ['15:20', '사고 발생', '야외 마당에서 공놀이 중 착지하며 오른쪽 앞발이 접질렸습니다.'],
    ['15:22', '원에서 처치', '실내로 옮겨 찬 수건으로 감싸고 쉬게 했습니다.'],
    ['15:24', '보호자 연락', `${다친아이.guardian} 님께 전화로 알렸습니다. 병원부터 데려가 달라고 하셨어요.`],
    ['15:35', '원에서 출발', `${교사[3].nm} 선생님이 동행했습니다.`],
    ['15:39', '병원 도착', `${SITE.vet.nm} — ${SITE.vet.dist}`],
    ['16:10', '진료 마침', '아직 적지 않았습니다 — 수의사 소견을 받아 아래에 적습니다.'],
    ['16:20', '원으로 돌아옴', '아직 적지 않았습니다.'],
  ];
  const 걸린시간 = (() => {                     // 출발 → 도착, 손으로 적지 않고 뺀다
    const 분 = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
    return 분(흐름[4][0]) - 분(흐름[3][0]);
  })();

  const body = `${U.leafHd(ctx, `${U.조사(U.esc(다친아이.nm), '을', '를')} 협력 동물병원으로 데려간 기록입니다`,
    U.btn('사고 기록으로', { href: 'HL0301', cls: 'btn-ghost' }))}

${U.card('협력 동물병원', `
  <div class="row-b wrap-row">
    <div class="grow">
      <div class="t-card">${U.esc(SITE.vet.nm)}</div>
      <p class="t-sub mt2">${U.esc(SITE.vet.dist)} · ${U.esc(SITE.vet.tel)} — 미리 협약을 맺어 두어 바로 데려갈 수 있습니다.</p>
    </div>
    ${U.btn('전화 걸기', { cls: 'btn-sub', attr: ` data-toast="${U.esc(SITE.vet.nm)} ${U.esc(SITE.vet.tel)} 로 겁니다 (프로토타입)"` })}
  </div>
  ${U.banner('mut', '🚶', `${U.esc(SITE.vet.dist)} 거리라 오늘은 출발부터 도착까지 <b>${걸린시간}분</b> 걸렸습니다.
    아이를 안고 가므로 평소보다 조금 더 걸립니다.`, { cls: 'mt4' })}`, { cls: 'mt8' })}

${U.card('이송 여부', `
  <div class="row-b wrap-row">
    <div class="grow"><div class="t-card">협력 동물병원으로 데려갔나요?</div>
      <div class="t-sub mt1">데려갔으면 켜 주세요 — 아래 칸이 열립니다.</div></div>
    ${U.toggle(true, '', ' data-open="vetBox3"')}
  </div>
  <div id="vetBox3" class="mt6">
    <div class="f2">
      ${U.field('이송 시각', U.input({ type: 'time', v: 흐름[3][0] }), { req: true })}
      ${U.field('동행한 보육교사', U.select(교사.map((s) => s.nm), 3), { req: true })}
    </div>
    <div class="f2 mt4">
      ${U.field('병원 도착 시각', U.input({ type: 'time', v: 흐름[4][0] }))}
      ${U.field('간 병원', U.input({ v: SITE.vet.nm, off: true }), { hint: '협력 병원이 아닌 곳으로 갔다면 사고 기록의 경위에 적어 주세요' })}
    </div>
    ${U.field('진료 결과 (수의사 소견)', U.textarea({ ph: '수의사가 한 말을 그대로 옮겨 적어 주세요. 짐작해서 고쳐 적지 않습니다.', attr: ' style="min-height:120px"' }),
    { hint: '지금 못 적어도 됩니다 — 나중에 건강기록에 이어 적을 수 있어요' })}
    ${U.field('약·다음 진료', U.input({ ph: '예: 소염제 3일분, 3일 뒤 재진' }))}
  </div>`, { cls: 'mt6' })}

${U.card('오늘 있었던 일', `
  ${U.timeline(흐름.map(([hh, t, d], i) => ({ k: i <= 4 ? 'done' : 'on', hh, t: U.esc(t), d: U.esc(d) })))}
  <p class="hint">시각은 사람이 기억으로 적습니다. 나중에 설명해야 할 때 이 차례가 그대로 근거가 됩니다.</p>`,
  { cls: 'mt6' })}

${U.banner('warn', '📝', `<b>진료 결과는 나중에 이어 적어도 됩니다.</b>
  <div class="t-sub mt2">지금은 데려간 사실과 시각만 남기고, 소견서를 받으면 ${U.esc(다친아이.nm)}의 건강기록에 한 줄 더하세요.
  사고 기록은 고칠 수 없지만 <b>덧붙이기</b>는 됩니다.</div>`,
  { cls: 'mt6', right: U.btn('건강기록에 이어 적기', { href: 'HL0204', cls: 'btn-sub', sm: true }) })}

<div class="btns mt8">
  ${U.btn('이송 기록 저장하고 보호자에게 알림', {
    cls: 'btn-pri', lg: true,
    attr: ' data-notify="병원 이송 기록을 저장하고 보호자에게 알렸어요" data-notify-once="이송 기록을 저장했어요"',
  })}
  ${U.btn('사고·특이사항 기록', { href: 'HL0301', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   HL0402 보호자 알림 발송 관리 > 발송 채널 선택
   ⚠ 도달률은 지어내지 않는다 — ALERTS 를 채널별로 «세어» 만든다.
   ============================================================ */
P['HL0402'] = (ctx) => {
  const 켠채널 = ['카카오톡', '문자'];              // 처음부터 골라 둔 것 — 아래 개수와 맞아야 한다
  const 설명 = {
    카카오톡: '보호자가 가장 많이 여는 길입니다. 채널을 차단하면 가지 않습니다.',
    앱푸시: '앱을 깐 보호자에게만 갑니다. 알림을 꺼 두면 조용히 사라집니다.',
    문자: '가장 확실하지만 건당 요금이 붙습니다. 중요한 것만 함께 보냅니다.',
  };

  const body = `${U.leafHd(ctx, `무엇으로 보낼지 고릅니다 — 여러 개를 함께 고르면 한 보호자에게 그만큼 나갑니다`,
    U.btn('발송 관리로', { href: 'HL0401', cls: 'btn-ghost' }))}

${U.card('보낼 채널', `
  <div class="stack" data-pick-scope="ch">
    ${채널표.map((c) => `<div class="box${켠채널.includes(c.ch) ? ' on' : ''}">
      <div class="row-b wrap-row">
        <div class="grow">
          ${U.check(`<b>${채널아이콘[c.ch]} ${c.ch}</b>`, { on: 켠채널.includes(c.ch), sub: 설명[c.ch] })}
        </div>
        <div style="width:200px">
          <div class="t-sub">도달률 <b class="num">${c.도달률}%</b> · 열람률 <b class="num">${c.열람률}%</b></div>
          ${U.progress(c.도달률, c.도달률 === 100 ? 'ok' : (c.도달률 < 60 ? 'dan' : ''))}
          <div class="t-sub mt1">지금까지 ${c.보냄}건 보내 ${c.닿음}건 닿았어요</div>
        </div>
      </div></div>`).join('')}
  </div>
  <p class="hint">지금 <b data-pick-out="ch">${켠채널.length}</b>개 채널을 골랐습니다. 하나도 안 고르면 아래 버튼이 잠깁니다.</p>`,
  { cls: 'mt8' })}

${U.card('채널별 성적', `
  ${U.table(
    ['채널', { t: '보낸 건수', cls: 'c' }, { t: '닿음', cls: 'c' }, { t: '읽음', cls: 'c' }, { t: '도달률', cls: 'c' }, { t: '열람률', cls: 'c' }],
    채널표.map((c) => ({
      cells: [
        `${채널아이콘[c.ch]} <b>${U.esc(c.ch)}</b>`,
        { t: `<span class="num">${c.보냄}건</span>`, cls: 'c' },
        { t: `<span class="num">${c.닿음}건</span>`, cls: 'c' },
        { t: `<span class="num">${c.열림}건</span>`, cls: 'c' },
        { t: `<span class="num ${c.도달률 === 100 ? 'ok' : (c.도달률 < 60 ? 'dan' : '')} strong">${c.도달률}%</span>`, cls: 'c' },
        { t: `<span class="num">${c.열람률}%</span>`, cls: 'c' },
      ],
    })),
    { foot: [{ t: '합계', cls: 'strong' }, { t: `<span class="num">${ALERTS.length}건</span>`, cls: 'c strong' },
      { t: `<span class="num">${ALERTS.length - 실패.length}건</span>`, cls: 'c' },
      { t: `<span class="num">${읽음.length}건</span>`, cls: 'c' },
      { t: `<span class="num">${Math.round((ALERTS.length - 실패.length) / ALERTS.length * 100)}%</span>`, cls: 'c strong' },
      { t: `<span class="num">${Math.round(읽음.length / ALERTS.length * 100)}%</span>`, cls: 'c' }] },
  )}
  <p class="hint">${SITE.name}에서 지금까지 나간 ${ALERTS.length}건을 채널별로 센 값입니다. 건수가 적으니 비율은 참고만 하세요.</p>`,
  { cls: 'mt6' })}

${U.banner('mut', '💡', `<b>중요한 것은 두 길로 보냅니다.</b>
  <div class="t-sub mt2">사고와 백신 만료는 카카오톡과 문자를 함께 고르는 편이 낫습니다.
  한 길이 막혀도 다른 길로 닿습니다 — 지금까지 실패 ${실패.length}건이 모두 «한 길로만» 보낸 것이었습니다.</div>`,
  { cls: 'mt6', right: U.btn('실패 재발송', { href: 'HL0404', cls: 'btn-dan', sm: true }) })}

<div class="btns mt8">
  ${U.btn(`고른 <b data-pick-out="ch">${켠채널.length}</b>개 채널로 보내기`, {
    cls: 'btn-pri', lg: true,
    attr: ' data-pick-btn="ch" data-notify="고른 채널로 보냈어요 — 결과는 아래 목록에서 확인하세요"',
  })}
  ${U.btn('보호자 알림 발송 관리', { href: 'HL0401', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   HL0403 보호자 알림 발송 관리 > 발송 결과 배지
   ⚠ 부모(HL0401)의 건수와 어긋나면 안 된다 — 셋을 더하면 반드시 전체가 된다.
   ============================================================ */
P['HL0403'] = (ctx) => {
  const 갈래 = [
    ['읽음', 읽음, 'b-ok', '보호자가 열어 봤습니다. 여기까지 왔으면 약속을 지킨 것입니다.'],
    ['전달됨', 전달됨, 'b-ok', '보호자 기기까지 갔지만 아직 열지 않았습니다. 하루가 지나면 한 번 더 보냅니다.'],
    ['실패', 실패, 'b-dan', '보호자에게 가지 않았습니다. 연락처를 고치고 다시 보내야 합니다.'],
  ];
  const 합 = 갈래.reduce((s, [, list]) => s + list.length, 0);   // 반드시 ALERTS.length 와 같다

  const body = `${U.leafHd(ctx, `전체 ${ALERTS.length}건 — 읽음 ${읽음.length} · 전달됨 ${전달됨.length} · 실패 ${실패.length}`,
    U.btn('발송 관리로', { href: 'HL0401', cls: 'btn-ghost' }))}

${U.card('배지 세 가지가 뜻하는 것', `
  <div class="g3">
    ${갈래.map(([nm, list, cls, d]) => U.box(`
      <div class="row"><span class="badge ${cls}">${nm}</span><span class="t-card">${list.length}건</span></div>
      <p class="t-sub mt2">${d}</p>`)).join('')}
  </div>
  <p class="hint">세 갈래를 더하면 ${합}건 — 발송 관리 목록의 전체 건수와 같습니다. 어긋나면 어느 한쪽이 틀린 것입니다.</p>`,
  { cls: 'mt8' })}

<div class="filters mt6">
  ${U.chips(['전체', '읽음', '전달됨', '실패'], 0, { boxAttr: ' data-filter-for="res"' })}
  <span class="t-sub"><b data-filter-cnt="res">${ALERTS.length}</b>건 · 그 가운데 실패 <b data-cnt-tag-for="res" data-cnt-tag="실패">${실패.length}</b>건</span>
</div>

<div class="mt4" data-filter-list="res">
${U.table(
    ['보낸 때', '종류', '반려견 · 보호자', { t: '채널', cls: 'c' }, { t: '결과', cls: 'c' }, '까닭 · 다음에 할 일'],
    ALERTS.map((a) => ({
      attr: ` data-tag="${U.esc(a.st)}"`,
      cls: a.st === '실패' ? 'bad' : '',
      cells: [
        { t: `<span class="num">${U.esc(a.when)}</span>`, cls: 'nowrap' },
        { t: `<span class="sub">${U.esc(a.kind)}</span>`, cls: 'nowrap' },
        { t: `<b>${U.esc(a.dog)}</b><div class="sub">${U.esc(a.guardian)} 님</div>`, cls: 'nowrap' },
        { t: `${채널아이콘[a.ch] || ''} <span class="sub">${U.esc(a.ch)}</span>`, cls: 'c nowrap' },
        {
          t: `<span class="badge ${a.st === '실패' ? 'b-dan' : 'b-ok'}" title="${U.esc(a.st === '실패' ? (실패사유[a.dog] || '보내지 못했습니다') : (a.st === '읽음' ? '보호자가 열어 봤습니다' : '보호자 기기까지 갔습니다'))}">${U.esc(a.st)}</span>`,
          cls: 'c',
        },
        a.st === '실패'
          ? `<span class="dan strong">${U.esc(실패사유[a.dog] || '보내지 못했습니다')}</span><div class="sub">${U.조사(U.esc(대체채널[a.ch]), '으로', '로')} 다시 보내 보세요</div>`
          : `<span class="t-sub">${U.esc(a.st === '읽음' ? '더 할 일이 없습니다' : '하루가 지나면 한 번 더 보냅니다')}</span>`,
      ],
    })),
  )}
</div>
<div hidden data-empty-for="res">${U.empty('📭', '결과가 없습니다', '고르신 결과에 해당하는 알림이 없어요.', U.btn('전체 보기', { href: 'HL0403', cls: 'btn-pri' }))}</div>

${U.banner('warn', '📵', `<b>실패 ${실패.length}건은 그대로 두면 «안 보낸 것»과 같습니다.</b>
  <div class="t-sub mt2">${실패.map((a) => `${U.esc(a.dog)}(${U.esc(a.kind)} · ${U.esc(a.ch)})`).join(' · ')}
  — 배지에 마우스를 올리면 왜 실패했는지 보입니다.</div>`,
  { cls: 'mt8', right: U.btn('실패 재발송', { href: 'HL0404', cls: 'btn-dan', sm: true }) })}

<div class="btns mt8">
  ${U.btn('발송 채널 선택', { href: 'HL0402', cls: 'btn-ghost' })}
  ${U.btn('자동 발송 규칙 확인', { href: 'HL0405', cls: 'btn-sub' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   HL0404 보호자 알림 발송 관리 > 실패 재발송
   ⚠ 「전체 N건 중 실패 M건」이라 적었으면 목록도 정확히 M줄이어야 한다.
   ============================================================ */
P['HL0404'] = (ctx) => {
  const 줄 = 실패.map((a) => `<div class="box dan">
    <div class="row-b wrap-row">
      <div class="grow">
        ${U.check(`<b>${U.esc(a.dog)}</b> — ${U.esc(a.kind)}`, {
          on: true,
          sub: `${U.esc(a.guardian)} 님 · ${U.esc(a.when)} · ${채널아이콘[a.ch]} ${U.esc(a.ch)}`,
        })}
        <p class="t-sub mt2">${U.esc(a.msg)}</p>
        <p class="t-sub mt2"><span class="dan strong">${U.esc(실패사유[a.dog] || '보내지 못했습니다')}</span></p>
      </div>
      <div style="width:220px">
        ${U.kv([
          ['원래 채널', `${채널아이콘[a.ch]} ${U.esc(a.ch)} (도달률 ${채널(a.ch).도달률}%)`],
          ['바꿔 볼 채널', `${채널아이콘[대체채널[a.ch]]} ${U.esc(대체채널[a.ch])} (도달률 ${채널(대체채널[a.ch]).도달률}%)`],
        ], { cls: 'left' })}
      </div>
    </div>
  </div>`).join('');

  const body = `${U.leafHd(ctx, `전체 ${ALERTS.length}건 가운데 실패 ${실패.length}건입니다 — 아래 ${실패.length}건이 그 전부입니다`,
    U.btn('발송 관리로', { href: 'HL0401', cls: 'btn-ghost' }))}

${U.banner('dan', '📵', `<b>${실패.length}건이 보호자에게 가지 않았습니다.</b>
  <div class="t-sub mt2">${실패.map((a) => `${U.esc(a.dog)}(${U.esc(a.kind)})`).join(' · ')}
  — 같은 채널로 또 실패하면 전화로 새 번호를 여쭤야 합니다.</div>`, { cls: 'mt8' })}

${U.card(`다시 보낼 것 고르기`, `
  <div class="stack" data-pick-scope="fail">${줄}</div>
  <p class="hint">지금 <b data-pick-out="fail">${실패.length}</b>건을 골랐습니다. 하나도 안 고르면 아래 버튼이 잠깁니다.</p>`,
  { cls: 'mt6' })}

${U.card('어떤 채널로 다시 보낼까요', `
  ${U.radioRow('resendCh', [
    `원래 채널 그대로`,
    `실패한 채널 말고 다른 채널로`,
    `카카오톡과 문자를 함께`,
  ], 1)}
  <p class="hint">「다른 채널로」를 고르면 ${실패.map((a) => `${U.조사(U.esc(a.dog), '은', '는')} ${U.esc(대체채널[a.ch])}로`).join(', ')} 나갑니다.</p>`,
  { cls: 'mt6' })}

${U.card('한 건씩 바로 다시 보내기', `
  ${U.table(
    ['반려견 · 보호자', '종류', { t: '채널', cls: 'c' }, { t: '결과', cls: 'c' }, { t: '', cls: 'c' }],
    실패.map((a) => ({
      cls: 'bad',
      cells: [
        { t: `<b>${U.esc(a.dog)}</b><div class="sub">${U.esc(a.guardian)} 님</div>`, cls: 'nowrap' },
        { t: `<span class="sub">${U.esc(a.kind)}</span>`, cls: 'nowrap' },
        { t: `${채널아이콘[a.ch]} <span class="sub">${U.esc(a.ch)}</span>`, cls: 'c nowrap' },
        { t: U.badge(U.esc(a.st), 'b-dan'), cls: 'c' },
        { t: U.btn('재발송', { cls: 'btn-dan', sm: true, attr: ` data-resend="${U.esc(a.dog)} ${U.esc(a.kind)} 알림"` }), cls: 'c' },
      ],
    })),
  )}
  <p class="hint">누르면 그 줄의 결과 배지가 그 자리에서 «전달됨»으로 바뀝니다.</p>`,
  { cls: 'mt6' })}

${U.banner('warn', '☎️', `<b>두 번 실패하면 전화가 답입니다.</b>
  <div class="t-sub mt2">채널을 바꿔도 또 실패하면 번호나 계정 자체가 바뀐 것입니다.
  보호자께 전화로 새 번호를 여쭙고, 원 관리자에서 연락처를 고쳐 주세요.</div>`, { cls: 'mt6' })}

<div class="btns mt8">
  ${U.btn(`고른 <b data-pick-out="fail">${실패.length}</b>건 다시 보내기`, {
    cls: 'btn-pri', lg: true,
    attr: ' data-pick-btn="fail" data-notify="고른 실패 건을 다시 보냈어요 — 결과는 잠시 뒤 목록에서 확인하세요"',
  })}
  ${U.btn('발송 결과 배지', { href: 'HL0403', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   HL0405 보호자 알림 발송 관리 > 자동 발송 규칙 확인
   ⚠ 규칙에 적힌 날수는 HL0101 대시보드의 「임박」 기준(임박기준)과 «같은 값»에서 온다.
     둘이 갈라지면 대시보드는 임박이라는데 알림은 안 나가는 일이 생긴다.
   ============================================================ */
P['HL0405'] = (ctx) => {
  const 규칙 = [
    { ico: '💉', nm: '백신 만료 안내', 조건: `만료 ${임박기준}일 전`, 또: '만료 7일 전 한 번 더', ch: '카카오톡',
      대상: `지금 ${임박.length}마리 (${[...임박].sort((a, b) => a.vacD - b.vacD).map((d) => `${d.nm} D-${d.vacD}`).join(' · ')})`, on: true,
      d: `대시보드가 「임박」이라고 부르는 그 ${임박기준}일입니다. 두 값은 늘 같습니다.` },
    { ico: '🚫', nm: '백신 만료됨 · 등원 잠금', 조건: '만료된 그날 아침', 또: '증명서가 올라올 때까지 매주', ch: '카카오톡',
      대상: `지금 ${만료.length}마리 (${만료.map((d) => `${d.nm} ${Math.abs(d.vacD)}일 지남`).join(' · ')})`, on: true,
      d: '이 알림이 나가는 아이는 등원 예약과 등원 체크가 함께 잠깁니다.' },
    { ico: '🏠', nm: '결석 처리', 조건: '결석으로 처리한 즉시', 또: '없음', ch: '앱푸시',
      대상: '결석 처리한 아이의 보호자', on: true,
      d: '회차권이 깎였는지 아닌지를 함께 적어 보냅니다.' },
    { ico: '🚨', nm: '사고 기록', 조건: '사고를 저장한 즉시', 또: '없음', ch: '카카오톡',
      대상: '사고에 얽힌 아이의 보호자', on: true,
      d: '긴급도 「높음」은 알림보다 전화가 먼저입니다 — 전화를 걸어야 저장이 됩니다.' },
    { ico: '🔄', nm: '반 변경', 조건: '반 편성 보드에서 저장한 즉시', 또: '없음', ch: '앱푸시',
      대상: '반이 바뀐 아이만', on: true,
      d: '옮기기만 하고 저장하지 않으면 나가지 않습니다.' },
    { ico: '📓', nm: '알림장', 조건: '매일 18:30', 또: '없음', ch: '카카오톡',
      대상: '그날 작성이 끝난 알림장만', on: true,
      d: '작성 중인 것은 다음 날로 넘어갑니다.' },
    { ico: '🎟', nm: '회차권 만료 안내', 조건: '만료 7일 전', 또: '없음', ch: '문자',
      대상: '남은 횟수가 있는 회차권', on: false,
      d: '지금은 꺼져 있습니다 — 켜면 남은 횟수와 만료일을 함께 알려 줍니다.' },
  ];
  const 켜진 = 규칙.filter((r) => r.on);

  const body = `${U.leafHd(ctx, `사람이 잊어도 저절로 나가는 알림 ${규칙.length}가지 — 지금 ${켜진.length}가지가 켜져 있습니다`,
    U.btn('발송 관리로', { href: 'HL0401', cls: 'btn-ghost' }))}

${U.banner('ok', '⏰', `<b>백신 만료는 ${임박기준}일 전에 저절로 나갑니다.</b>
  <div class="t-sub mt2">백신 만료 대시보드가 「만료 임박」이라고 표시하는 기준도 같은 ${임박기준}일입니다 —
  대시보드에 주황색으로 뜬 아이는 이미 안내를 받았다는 뜻입니다. 지금은 ${임박.length}마리입니다.</div>`,
  { cls: 'mt8', right: U.btn('대시보드에서 보기', { href: 'HL0101', cls: 'btn-ghost', sm: true }) })}

<div class="mt6">
${U.table(
    ['규칙', { t: '언제 나가나', w: '180px' }, '한 번 더', { t: '채널', cls: 'c' }, '지금 걸리는 대상', { t: '켬', cls: 'c' }],
    규칙.map((r) => ({
      cls: r.on ? '' : 'mut',
      cells: [
        { t: `<b>${r.ico} ${U.esc(r.nm)}</b><div class="sub">${U.esc(r.d)}</div>` },
        { t: `<span class="strong">${U.esc(r.조건)}</span>`, cls: 'nowrap' },
        { t: `<span class="t-sub">${U.esc(r.또)}</span>`, cls: 'nowrap' },
        { t: `${채널아이콘[r.ch] || ''} <span class="sub">${U.esc(r.ch)}</span>`, cls: 'c nowrap' },
        `<span class="t-sub">${U.esc(r.대상)}</span>`,
        { t: U.toggle(r.on, `${r.nm} 자동 발송을 ${r.on ? '껐어요' : '켰어요'}`), cls: 'c' },
      ],
    })),
  )}
</div>

${U.card('규칙을 끄면 어떻게 되나요', `
  ${U.kv([
    ['끄면', '그 알림은 «손으로» 보내야 합니다. 보내는 일 자체가 없어지는 것이 아닙니다'],
    ['백신 만료 안내를 끄면', `대시보드에는 임박 ${임박.length}마리가 그대로 뜨지만 보호자는 모르는 채로 만료됩니다`],
    ['사고 기록은', '끄지 마세요 — 사고는 보호자가 그날 알아야 하는 일입니다. 꺼 두면 선생님이 한 명 한 명 전화해야 합니다'],
    ['바꾸면 언제부터', '저장하는 즉시입니다. 이미 예약된 오늘치 알림은 그대로 나갑니다'],
  ], { cls: 'left' })}`, { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('보호자 알림 발송 관리', { href: 'HL0401', cls: 'btn-sub' })}
  ${U.btn('백신 만료 대시보드', { href: 'HL0101', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};
