/* HL — 건강·안전 관리 (4화면) · 원 운영진이 쓰는 화면 */
import {
  esc, won, num, ph, phFix, dogPh, badge, stBadge, btn, chips, tabs, pane, tabBox,
  sec, card, box, banner, empty, table, kv, timeline, progress, pageHd, stickBar, modal, stat,
  field, input, select, textarea, check, toggle, radioRow, uploadDrop, link, vacBadge, 조사,
} from './ui.mjs';
import {
  SITE, TODAY, DOGS, DOG, CLASSES, CLS, VAC_STAT, ROSTER_TOTAL, TODAY_STAT,
  HEALTH_LOG, VAC_LOG, ALERTS, STAFF,
} from './data.mjs';

const 초코 = DOG('d01');
const 백신순 = [...DOGS].sort((a, b) => a.vacD - b.vacD);
const 만료 = DOGS.filter((d) => d.vac === '만료');
const 임박 = DOGS.filter((d) => d.vac === '임박');

export const PAGES = {
  /* ============================================================
     HL-01 백신 만료 대시보드 — 등하원 현황판과 짝이 되는 운영 화면
     여기의 「만료」가 AT-02 의 등원 체크 버튼을 실제로 잠근다.
     ============================================================ */
  'HL-01': () => {
    /* data-s-* — 정렬 고르개가 견주는 값. 줄에 붙여 두어야 «차례가 실제로» 바뀐다. */
    const 줄 = (d) => ({
      attr: ` data-tag="${d.vac}" data-s-d="${d.vacD}" data-s-nm="${esc(d.nm)}" data-s-cls="${esc(CLS(d.cls).nm)}"`,
      cls: d.vac === '만료' ? 'bad' : '',
      cells: [
        { t: dogPh(d.nm, 44), cls: 'nowrap' },
        { t: `<b>${esc(d.nm)}</b><div class="sub">${esc(d.breed)} · ${d.kg}kg</div>`, cls: 'nowrap' },
        esc(CLS(d.cls).nm),
        '종합백신 · 광견병',
        { t: `<span class="num">${d.vacD < 0 ? '만료됨' : `D-${d.vacD}`}</span>`, cls: 'c nowrap' },
        { t: stBadge(d.vac), cls: 'c' },
        esc(d.guardian),
        {
          t: d.vac === '정상'
            ? btn('기록 보기', { href: 'HL-02', cls: 'btn-ghost', sm: true })
            : btn('재접종 안내 보내기', { cls: 'btn-sub', sm: true, attr: ` data-notify="${esc(d.guardian)} 님께 ${esc(d.nm)}의 재접종 안내를 보냈어요"` }),
          cls: 'c',
        },
      ],
    });

    const body = `${pageHd('백신 만료 대시보드', `전체 원생 ${ROSTER_TOTAL}마리 · ${esc(TODAY.label)} 기준`,
      btn('오늘 현황판', { href: 'AT-01', cls: 'btn-ghost' }))}

<div class="g3">
  ${stat('정상', VAC_STAT.정상, { ico: '✅', u: '마리', cls: 'ok', d: '유효기간이 30일 넘게 남았어요' })}
  ${stat('만료 임박', VAC_STAT.임박, { ico: '⚠️', u: '마리', cls: 'warn', d: '30일 안에 만료됩니다' })}
  ${stat('만료', VAC_STAT.만료, { ico: '🔴', u: '마리', cls: 'dan', d: '예약과 등원이 제한됩니다' })}
</div>

${만료.map((d) => `<div class="mt6">${banner('dan', '🚫', `<b>${esc(d.nm)} — 종합백신이 ${Math.abs(d.vacD)}일 전에 만료됐습니다.</b>
  <div class="t-sub mt2">이 아이는 <b>등원 예약이 제한</b>되고, 등원 체크 버튼도 잠깁니다.
  오늘 원에 왔다면 원장 승인으로만 하루 열 수 있어요. 보호자 ${esc(d.guardian)} 님 · ${esc(d.phone || '')}</div>`,
      { right: btn('등원 체크 화면', { href: 'AT-02', cls: 'btn-pri', sm: true }) })}</div>`).join('')}

${card('한 번에 안내 보내기', `
  <div class="row-b wrap-row">
    <div><div class="t-card">만료 임박 ${VAC_STAT.임박}마리에게 재접종 안내를 보냅니다</div>
      <div class="t-sub mt1">${임박.map((d) => esc(d.nm)).join(' · ')}</div></div>
    ${btn(`만료 임박 ${VAC_STAT.임박}마리에게 재접종 안내 발송`, { cls: 'btn-pri', attr: ` data-notify="${VAC_STAT.임박}건의 재접종 안내를 보냈어요 — 결과는 보호자 알림 관리에서 볼 수 있습니다" data-notify-once="${VAC_STAT.임박}건을 보냈어요"` })}
  </div>`, { cls: 'mt6' })}

<div class="filters mt8">
  ${select(['만료 임박순', '이름순', '반순'], 0, { vals: ['D', 'Nm', 'Cls'], attr: ' data-sort-for="vac"' })}
  ${chips(['전체', '정상', '임박', '만료'], 0, { boxAttr: ' data-filter-for="vac"' })}
  <span class="t-sub"><b data-filter-cnt="vac">${백신순.length}</b>마리</span>
</div>

<div data-filter-list="vac" data-per-page="10">
${table(
      [{ t: '', w: '64px' }, '이름', '반', '백신 종류', { t: '남은 일수', cls: 'c' }, { t: '상태', cls: 'c' }, '보호자', { t: '', cls: 'c' }],
      백신순.map(줄),
    )}
</div>
<div hidden data-empty-for="vac">${empty('💉', '결과가 없습니다', '고르신 상태에 해당하는 아이가 없어요.', btn('전체 보기', { href: 'HL-01', cls: 'btn-pri' }))}</div>

<div class="btns mt8" style="justify-content:center" data-page-box="vac">
  ${[1, 2, 3].map((n) => `<button class="chip${n === 1 ? ' on' : ''}" type="button" data-page-for="vac" data-page-n="${n}">${n}</button>`).join('')}
  <span class="t-sub" style="align-self:center"><b data-page-all="vac">3</b>쪽 중 <b data-page-now="vac">1</b>쪽</span>
</div>

${sec('재업로드 요청 이력', table(
      ['요청일', '반려견', '보호자', '채널', { t: '결과', cls: 'c' }],
      ALERTS.filter((a) => a.kind === '백신 만료').map((a) => [
        { t: `<span class="num">${esc(a.when)}</span>`, cls: 'nowrap' },
        `<b>${esc(a.dog)}</b>`,
        esc(a.guardian),
        esc(a.ch),
        { t: stBadge(a.st), cls: 'c' },
      ]),
    ))}

<div class="btns mt8">
  ${btn('건강기록 상세', { href: 'HL-02', cls: 'btn-ghost' })}
  ${btn('보호자 알림 발송', { href: 'HL-04', cls: 'btn-sub' })}
</div>`;
    return { body, o: { wide: true } };
  },

  /* ============================================================
     HL-02 반려견별 건강기록 상세 — 보호자가 낸 정보와 원이 관찰한 정보가 이어져야 한다
     ============================================================ */
  'HL-02': () => {
    const body = `${pageHd(`${esc(초코.nm)}의 건강기록`, `${esc(초코.breed)} · ${esc(초코.age)} · ${초코.kg}kg · ${esc(CLS(초코.cls).nm)}`,
      btn('백신 대시보드', { href: 'HL-01', cls: 'btn-ghost' }))}

${card('보호자가 적어 주신 것', `
  <div class="g3">
    ${box(`<div class="t-sub">알러지</div><div class="t-card mt1 acc">닭고기</div>
      <p class="t-sub mt2">간식·특식을 줄 때 성분표를 확인합니다</p>`)}
    ${box(`<div class="t-sub">지병·수술 이력</div><div class="t-card mt1">없어요</div>
      <p class="t-sub mt2">등록 이후 새로 생긴 것도 없습니다</p>`)}
    ${box(`<div class="t-sub">복용 중인 약</div><div class="t-card mt1">없어요</div>
      <p class="t-sub mt2">약이 생기면 급여 시간을 함께 적어 주세요</p>`)}
  </div>
  <div class="mt6">${kv([
    ['담당 동물병원', `${esc(SITE.vet.nm)} · ${esc(SITE.vet.tel)}`],
    ['보호자', `${esc(초코.guardian)} · ${esc(초코.phone)}`],
    ['비상 연락처', '010-4417-2298 (배우자)'],
    ['성향', esc(초코.tags.join(' · '))],
  ], { cls: 'left' })}</div>
  <p class="hint">반려견 등록의 「건강·특이사항」에서 보호자가 직접 적은 내용입니다. 보호자가 고치면 여기에 바로 반영돼요.</p>`,
      { cls: 'mt8' })}

${card('원에서 관찰한 것', `
  ${timeline(HEALTH_LOG.map((h) => ({
      t: `${esc(h.t)} <span class="t-sub">— ${esc(h.by)} 선생님</span>`,
      hh: esc(h.date),
      d: esc(h.d),
      k: 'done',
    })))}
  <div class="btns mt6">${btn('＋ 오늘 관찰한 것 기록하기', { cls: 'btn-sub', attr: ' data-modal="mLog"' })}</div>`,
      { cls: 'mt6' })}

${sec('백신 접종 이력', table(
      ['접종일', '종류', '유효기간', { t: '상태', cls: 'c' }, '접종 병원', { t: '증명서', cls: 'c' }],
      VAC_LOG.map((v, i) => ({
        cls: i < 2 ? '' : 'mut',
        cells: [
          { t: `<span class="num">${esc(v.date)}</span>`, cls: 'nowrap' },
          `<b>${esc(v.kind)}</b>`,
          { t: `<span class="num">${esc(v.until)}</span>`, cls: 'nowrap' },
          { t: i < 2 ? badge('정상', 'b-ok') : badge('지난 접종', 'b-mut'), cls: 'c' },
          esc(v.vet),
          { t: btn('보기', { cls: 'btn-ghost', sm: true, attr: ' data-toast="증명서 사진을 크게 봅니다 (프로토타입)"' }), cls: 'c' },
        ],
      })),
    ), { desc: `가장 가까운 만료일은 ${VAC_LOG[1].until} (광견병)입니다.` })}

${banner('ok', '💉', `<b>지금은 둘 다 유효기간 안입니다 (${초코.vacD}일 남음).</b>
  <div class="t-sub mt2">만료 30일 전에 보호자께 자동으로 안내가 나갑니다.</div>`, { cls: 'mt6' })}

${modal('mLog', '오늘 관찰한 것 기록하기', `
  ${field('제목', input({ ph: '예: 오른쪽 뒷다리를 살짝 절어요' }), { req: true })}
  ${field('자세히', textarea({ ph: '언제·어떤 상황에서 봤는지, 지금은 어떤지 적어 주세요' }))}
  ${field('기록한 사람', select(STAFF.filter((s) => s.st === '활성').map((s) => `${s.nm} (${s.role})`), 2))}
  ${check('보호자에게도 알릴까요?', { on: true })}`,
      `${btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })}
   ${btn('기록하고 보호자에게 알림', { cls: 'btn-pri', attr: ' data-notify="관찰 기록을 남기고 보호자에게 알렸어요" data-dismiss' })}`)}

<div class="btns mt8">
  ${btn('사고·특이사항 기록', { href: 'HL-03', cls: 'btn-dan' })}
  ${btn('백신 대시보드', { href: 'HL-01', cls: 'btn-ghost' })}
</div>`;
    return { body, o: { wide: true } };
  },

  /* ============================================================
     HL-03 사고·특이사항 기록 — 이 서비스에서 가장 조심스러운 화면
     절차가 빠짐없이 보여야 한다.
     ⚠ 긴급도 「높음」을 고르면 보호자 연락 확인이 «강제로» 나타나고 저장이 잠긴다.
     ============================================================ */
  'HL-03': () => {
    const body = `${pageHd('사고·특이사항 기록', '다치거나 아팠던 일을 남깁니다. 저장하면 보호자에게 바로 알림이 갑니다.',
      btn('건강기록 상세', { href: 'HL-02', cls: 'btn-ghost' }))}

${banner('warn', '🚨', `<b>사고는 «빨리»보다 «빠짐없이»가 중요합니다.</b>
  <div class="t-sub mt2">경위 → 부위·정도 → 사진 → 긴급도 → 보호자 연락 → 병원 이송 여부.
  이 여섯을 다 채워야 나중에 무슨 일이 있었는지 설명할 수 있습니다.</div>`, { cls: 'mt8' })}

${card('① 어느 아이인가요', `
  <div class="chips" data-pick-scope="acc">
    ${DOGS.filter((d) => d.st === '재원').slice(0, 8).map((d) => `<button class="chip" type="button">${esc(d.nm)} <span class="x">${esc(CLS(d.cls).nm)}</span></button>`).join('')}
  </div>
  <p class="hint"><b data-pick-out="acc">0</b>마리를 골랐습니다. 여러 아이가 얽힌 일이면 모두 고르세요.</p>`,
      { cls: 'mt6' })}

${card('② 경위 — 언제, 어디서, 어떻게', `
  ${textarea({ ph: '예) 15시 20분쯤 야외 마당에서 공놀이를 하다가, 뛰어오르며 착지할 때 오른쪽 앞발이 접질렸습니다. 바로 안아 들어 실내로 옮겼습니다.', attr: ' style="min-height:140px"' })}
  <p class="hint">시간·장소·상황을 그대로 적습니다. 짐작이나 판단은 아래 「정도」에 적으세요.</p>`, { cls: 'mt6' })}

${card('③ 부위와 정도', `
  <div class="f2">
    ${field('부위', select(['앞발·앞다리', '뒷발·뒷다리', '귀', '눈', '입·이빨', '몸통', '꼬리', '그 밖'], 0), { req: true })}
    ${field('정도', select(['긁힘·붉어짐', '까짐(출혈 조금)', '출혈', '절뚝임', '구토·설사', '그 밖'], 1), { req: true })}
  </div>
  ${field('원에서 한 처치', textarea({ ph: '예: 흐르는 물로 씻고 소독한 뒤 거즈를 댔습니다. 이후 실내에서 쉬게 했습니다.' }))}`,
      { cls: 'mt6' })}

${card('④ 사진', `
  ${uploadDrop('다친 부위 사진을 올려 주세요 (보호자에게 그대로 전달됩니다)')}
  <p class="hint">사진이 있으면 보호자가 훨씬 덜 불안해합니다. 다만 피가 많이 보이는 사진은 한 장이면 충분해요.</p>`,
      { cls: 'mt6' })}

${card('⑤ 긴급도', `
  <div class="btns">
    ${['낮음', '보통', '높음'].map((t, i) => `<label class="check none">
      <input type="radio" name="urg" value="${t}"${i === 1 ? ' checked' : ''} data-urgency>
      <span><b>${t}</b><span class="sub">${['원에서 처치하고 알림장에 적으면 됩니다', '보호자에게 오늘 안에 알립니다', '지금 바로 전화해야 합니다'][i]}</span></span>
    </label>`).join('')}
  </div>
  <div hidden data-urgency-box class="mt6">
    ${banner('dan', '📞', `<b>보호자에게 즉시 연락하세요.</b>
      <div class="t-sub mt2">긴급도 「높음」은 기록보다 전화가 먼저입니다. 전화를 걸고 아래를 체크해야 저장할 수 있어요.</div>`)}
    <div class="box dan mt4">
      ${check('<b>보호자에게 전화로 알렸습니다</b>', { attr: ' data-unlock="urgBtn"', sub: '안 받으시면 비상 연락처로도 걸고, 문자를 함께 남깁니다' })}
      <div class="f2 mt4">
        ${field('연락한 시각', input({ type: 'time', v: '15:24' }))}
        ${field('연락한 사람', select(STAFF.filter((s) => s.st === '활성').map((s) => `${s.nm} (${s.role})`), 0))}
      </div>
    </div>
  </div>`, { cls: 'mt6' })}

${card('⑥ 병원 이송', `
  <div class="row-b wrap-row">
    <div><div class="t-card">협력 동물병원으로 데려갔나요?</div>
      <div class="t-sub mt1">${esc(SITE.vet.nm)} · ${esc(SITE.vet.dist)} · ${esc(SITE.vet.tel)}</div></div>
    ${toggle(false, '', ' data-open="vetBox"')}
  </div>
  <div id="vetBox" class="mt6" hidden>
    <div class="f2">
      ${field('이송 시각', input({ type: 'time' }))}
      ${field('동행한 보육교사', select(STAFF.filter((s) => s.st === '활성').map((s) => s.nm), 1))}
    </div>
    ${field('진료 결과', textarea({ ph: '수의사 소견을 그대로 옮겨 적어 주세요' }))}
  </div>`, { cls: 'mt6' })}`;

    return {
      body,
      o: {
        wide: true,
        stick: stickBar(
          '<div><div class="t-sub">저장하면 보호자에게 카카오톡으로 바로 나갑니다</div><div class="t-card">기록은 나중에 고칠 수 없어요 — 덧붙이기만 됩니다</div></div>',
          `${btn('임시 저장', { cls: 'btn-ghost', attr: ' data-toast="임시 저장했어요 — 아직 보호자에게 가지 않았습니다"' })}
           ${btn('저장하고 보호자에게 알림', { cls: 'btn-pri', id: 'urgBtn', attr: ' data-urgency-btn data-notify="사고 기록을 저장하고 보호자에게 알렸어요 — 발송 결과는 보호자 알림 관리에서 볼 수 있습니다"' })}`,
        ),
      },
    };
  },

  /* ============================================================
     HL-04 보호자 알림 발송 관리 — 이 서비스의 «마지막 약속»
     중요한 것이 실제로 전달됐는지 확인할 수 있어야 한다.
     ============================================================ */
  'HL-04': () => {
    const ch아이콘 = { 카카오톡: '💬', 앱푸시: '📱', 문자: '✉️' };
    const 실패 = ALERTS.filter((a) => a.st === '실패');

    const body = `${pageHd('보호자 알림 발송 관리', '백신·결석·사고·반 변경 알림이 실제로 갔는지 확인합니다',
      btn('백신 대시보드', { href: 'HL-01', cls: 'btn-ghost' }))}

<div class="g4">
  ${stat('오늘 보낸 알림', ALERTS.filter((a) => a.when.startsWith('08-24')).length, { ico: '📤', u: '건' })}
  ${stat('읽음', ALERTS.filter((a) => a.st === '읽음').length, { ico: '👀', u: '건', cls: 'ok', d: '보호자가 열어 봤어요' })}
  ${stat('전달됨', ALERTS.filter((a) => a.st === '전달됨').length, { ico: '📬', u: '건', d: '갔지만 아직 안 읽었어요' })}
  ${stat('실패', 실패.length, { ico: '⚠️', u: '건', cls: 'dan', d: '연락처를 고치고 다시 보내세요' })}
</div>

${실패.length ? `<div class="mt6">${banner('dan', '📵', `<b>${실패.length}건이 보호자에게 가지 않았습니다.</b>
  <div class="t-sub mt2">${실패.map((a) => `${esc(a.dog)}(${esc(a.kind)})`).join(' · ')} — 아래 목록에서 [재발송]을 눌러 주세요.
  같은 번호로 또 실패하면 보호자께 전화로 새 번호를 여쭤야 합니다.</div>`)}</div>` : ''}

<div class="filters mt8">
  ${chips(['전체', '백신 만료', '결석', '사고', '반 변경'], 0, { boxAttr: ' data-filter-for="alert" data-pick-scope="alert"' })}
  <span class="t-sub"><b data-filter-cnt="alert">${ALERTS.length}</b>건 · 고른 조건 <b data-pick-out="alert">1</b>개</span>
</div>

<div data-filter-list="alert">
${table(
      ['보낸 시각', '종류', '반려견 · 보호자', '내용', { t: '채널', cls: 'c' }, { t: '결과', cls: 'c' }, { t: '', cls: 'c' }],
      ALERTS.map((a) => ({
        attr: ` data-tag="${esc(a.kind)}"`,
        cls: a.st === '실패' ? 'bad' : '',
        cells: [
          { t: `<span class="num">${esc(a.when)}</span>`, cls: 'nowrap' },
          { t: badge(esc(a.kind), a.kind === '사고' ? 'b-dan' : (a.kind === '백신 만료' ? 'b-warn' : 'b-line')), cls: 'nowrap' },
          { t: `<b>${esc(a.dog)}</b><div class="sub">${esc(a.guardian)} 님</div>`, cls: 'nowrap' },
          `<span class="t-sub">${esc(a.msg)}</span>`,
          { t: `${ch아이콘[a.ch] || ''} <span class="sub">${esc(a.ch)}</span>`, cls: 'c nowrap' },
          { t: stBadge(a.st), cls: 'c' },
          {
            t: a.st === '실패'
              ? btn('재발송', { cls: 'btn-dan', sm: true, attr: ` data-resend="${esc(a.dog)} ${esc(a.kind)} 알림"` })
              : '<span class="muted">—</span>',
            cls: 'c',
          },
        ],
      })),
    )}
</div>
<div hidden data-empty-for="alert">${empty('📭', '결과가 없습니다', '고르신 종류의 알림이 없어요. 다른 종류를 눌러 보세요.', btn('전체 보기', { href: 'HL-04', cls: 'btn-pri' }))}</div>

${sec('저절로 나가는 알림', `<div class="g2">
  ${[['💉 백신 만료 30일 전', '자동으로 재접종 안내가 나갑니다. 만료 7일 전에 한 번 더 갑니다.', true],
    ['🏠 결석 처리', '결석으로 처리하면 회차권 차감 여부와 함께 바로 나갑니다.', true],
    ['🚨 사고 기록', '사고를 저장하면 즉시 나갑니다. 긴급도 「높음」은 전화가 먼저입니다.', true],
    ['🔄 반 변경', '반 편성 보드에서 저장하면 반이 바뀐 아이만 나갑니다.', true],
    ['📓 알림장', '매일 18:30에 그날 작성이 끝난 것만 나갑니다.', true],
    ['🎟 회차권 만료 7일 전', '남은 횟수와 만료일을 함께 알려 줍니다.', false]].map(([t, d, on]) => `<div class="box">
    <div class="row-b wrap-row">
      <div class="grow"><div class="t-card">${t}</div><p class="t-sub mt2">${d}</p></div>
      ${toggle(on, `${t} 자동 발송을 ${on ? '껐어요' : '켰어요'}`)}
    </div></div>`).join('')}
</div>`, { desc: '켜 두면 사람이 잊어도 나갑니다. 끄면 손으로 보내야 해요.' })}

<div class="btns mt8">
  ${btn('백신 만료 대시보드', { href: 'HL-01', cls: 'btn-sub' })}
  ${btn('알림장 발송 이력', { href: 'NW-04', cls: 'btn-ghost' })}
</div>`;
    return { body, o: { wide: true } };
  },
};
