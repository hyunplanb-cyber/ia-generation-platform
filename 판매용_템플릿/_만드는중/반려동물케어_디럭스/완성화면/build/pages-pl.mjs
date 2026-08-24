/* PL — 반려견 등록 (4화면) */
import {
  esc, won, num, ph, phFix, dogPh, badge, stBadge, btn, chips, tabs, pane, tabBox,
  sec, card, box, banner, table, kv, timeline, steps, pageHd, detail2, stickBar, modal,
  field, input, select, textarea, check, toggle, radioRow, uploadDrop, link, vacBadge, noteCard,
} from './ui.mjs';
import { SITE, MINE, DOG, CLASSES, clsNow, NOTES, VAC_LOG, MY_PASS, TODAY } from './data.mjs';

const 초코 = DOG('d01');
const 보리 = DOG('d02');
const 성향목록 = ['사교적', '소심함', '짖음 많음', '다른 개 무서워함', '사람 좋아함', '활발함'];
const 등록단계 = [['① 기본 정보', 'PL-01'], ['② 백신 기록', 'PL-02'], ['③ 건강·특이사항', 'PL-03']];

export const PAGES = {
  /* ============================================================
     PL-01 반려견 등록 — 몸무게가 반 배정의 «첫 기준»이라는 것이 보여야 한다
     ============================================================ */
  'PL-01': () => {
    const body = `${pageHd('우리 아이를 소개해주세요', '몸무게와 성향으로 반을 나눕니다. 아는 만큼만 적으셔도 돼요 — 나중에 고칠 수 있습니다.')}

${steps(등록단계.map(([t]) => [t, '']), 0)}

${card('대표 사진', `
  <div class="row wrap-row">
    ${phFix(['반려견 대표 사진', 400, 400], 120, { cls: 'ph-dog', seed: '등록' })}
    <div class="grow">
      ${uploadDrop('눌러서 사진을 올려 주세요 (1장)')}
      <p class="hint">정면에서 얼굴이 보이는 사진이 좋아요. 등하원 체크 화면과 알림장 목록에 쓰입니다.</p>
    </div>
  </div>`, { cls: 'mt8' })}

${card('기본 정보', `
  ${field('이름', input({ ph: '초코', v: '' }), { req: true, hint: '보육교사가 부를 이름이에요' })}
  <div class="f2">
    ${field('견종', input({ ph: '견종을 입력하면 자동으로 찾아드려요' }), { req: true, hint: '단두종은 여름철 실외 활동을 줄입니다' })}
    ${field('생년월일', input({ type: 'date' }), { hint: '모르시면 대략 몇 살인지만 적어 주세요' })}
  </div>
  <div class="f2">
    ${field('성별', radioRow('sex', ['남아', '여아'], 0), { req: true })}
    ${field('중성화', radioRow('neut', ['했어요', '안 했어요'], 0))}
  </div>`, { cls: 'mt6' })}

${card('몸무게', `
  <div class="row wrap-row">
    <div style="width:180px">${input({ type: 'number', ph: '8.4', attr: ' data-weight step="0.1" min="0"' })}</div>
    <span class="t-sub">kg</span>
    <div class="grow t-card" data-weight-out><span class="t-sub">몸무게를 적으면 예상 반을 알려드려요</span></div>
  </div>
  <div class="g3 mt6">
    ${CLASSES.map((c) => `<div class="box">
      <div class="t-card">${c.ico} ${esc(c.nm)}</div>
      <div class="t-sub mt1">${esc(c.kg)} · 오늘 ${clsNow(c.id)}/${c.cap}마리</div>
    </div>`).join('')}
  </div>
  <p class="hint">몸무게가 반 배정의 첫 기준입니다. 첫 등원 날 30분 적응 테스트로 성향까지 보고 반이 확정돼요.</p>`,
      { cls: 'mt6' })}

${card('성향', `
  <div class="chips" data-pick-scope="tags" data-multi>
    ${성향목록.map((t) => `<button class="chip" type="button">${esc(t)}</button>`).join('')}
  </div>
  <p class="hint">여러 개 고를 수 있어요. 지금 <b data-pick-out="tags">0</b>개를 골랐습니다.</p>
  ${banner('info', '🐶', '보육교사가 첫날 아이를 대할 때 참고합니다. 「소심함」을 고르시면 처음 사흘은 조용한 자리에서 시작해요.', { cls: 'mt4' })}`,
      { cls: 'mt6' })}

${card('목줄·하네스', `
  <div class="row-b">
    <div><div class="t-card">목줄·하네스를 채워서 보내나요?</div>
      <div class="t-sub mt1">원 안에서는 벗겨 두고, 마당에 나갈 때 다시 채웁니다</div></div>
    ${toggle(true, '등하원 때 목줄을 채워 보내는 것으로 적었어요')}
  </div>`, { cls: 'mt6' })}

${box(`<div class="row-b wrap-row">
  <div><div class="t-card">형제견이 더 있나요?</div>
    <div class="t-sub mt1">두 마리부터는 둘째 아이 요금을 10% 할인해 드립니다</div></div>
  ${btn('＋ 반려견 추가', { cls: 'btn-sub', attr: ' data-toast="반려견 등록 칸을 하나 더 열었어요 — 형제견 할인이 자동으로 붙습니다"' })}
</div>`, { cls: 'mt6' })}

${banner('warn', '📌', '<b>* 표시가 붙은 칸은 꼭 채워 주세요.</b><div class="t-sub mt2">이름·견종·성별·몸무게가 없으면 반을 배정할 수 없습니다.</div>', { cls: 'mt6' })}`;

    return {
      body,
      o: {
        stick: stickBar(
          '<div class="t-sub">1단계 / 3단계 · 다음은 백신 기록이에요</div>',
          btn('다음: 백신 기록 올리기', { href: 'PL-02', cls: 'btn-pri' }),
        ),
      },
    };
  },

  /* ============================================================
     PL-02 백신 접종 기록 — 서류가 곧 등원 자격이다
     ============================================================ */
  'PL-02': () => {
    const 칸 = (키, 이름, 설명) => card(이름, `
      <p class="t-sub">${esc(설명)}</p>
      <div class="mt4">${uploadDrop('접종증명서 사진 또는 PDF를 올려 주세요')}</div>
      <div class="f2 mt6">
        ${field('접종일', input({ type: 'date', attr: ` data-vac-date="${키}"` }), { req: true, hint: '증명서에 적힌 날짜를 그대로 적어 주세요' })}
        <div class="field"><span class="lb">유효기간</span>
          <div class="mt2" data-vac-out="${키}"><span class="t-sub">접종일을 적으면 저절로 계산됩니다 (접종일 + 1년)</span></div>
        </div>
      </div>`, { cls: 'mt6' });

    const body = `${pageHd('백신 접종 기록', '등원하려면 종합백신·광견병 접종 증명서가 필요해요.')}

${steps(등록단계.map(([t]) => [t, '']), 1)}

${banner('warn', '💉', `<b>둘 다 유효기간 안이어야 등원할 수 있습니다.</b>
  <div class="t-sub mt2">한 마리라도 만료되면 그 아이의 등원 예약이 막히고, 원에서도 등원 체크 버튼이 잠깁니다.
  만료 30일 전에 미리 알려드리니 그때 재접종해 주세요.</div>`, { cls: 'mt8' })}

${칸('dhppl', '① 종합백신 (DHPPL)', '홍역·간염·파보·파라인플루엔자·렙토스피라를 한 번에 막는 접종입니다. 보통 1년마다 다시 맞습니다.')}
${칸('rabies', '② 광견병', '법으로 정해진 필수 접종입니다. 지자체 지원 접종을 받으셨다면 그 증명서도 괜찮아요.')}

${sec('이렇게 표시됩니다', `<div class="g3">
  ${box(`${badge('정상', 'b-ok')}<p class="t-sub mt3">유효기간이 30일 넘게 남았어요. 예약과 등원이 모두 됩니다.</p>`)}
  ${box(`${badge('임박 D-18', 'b-warn')}<p class="t-sub mt3">30일 안에 만료됩니다. 예약은 되지만 미리 재접종해 주세요.</p>`)}
  ${box(`${badge('만료 6일 지남', 'b-dan')}<p class="t-sub mt3"><b class="dan">예약이 제한됩니다.</b> 새 증명서를 올리면 바로 풀려요.</p>`)}
</div>`)}

${card('동물병원 연동', `
  <div class="row-b wrap-row">
    <div><div class="t-card">지금은 손으로 올려 주셔야 해요</div>
      <p class="t-sub mt2">협력 동물병원(${esc(SITE.vet.nm)})과 접종 기록을 바로 주고받는 연동을 준비하고 있습니다.
      연동이 붙으면 증명서를 따로 올리지 않으셔도 됩니다.</p></div>
    ${badge('준비 중', 'b-mut')}
  </div>`, { cls: 'mt6' })}

${modal('mSkip', '접종 기록 없이 넘어갈까요?', `
  <p><b>접종 기록 없이는 등원 예약을 할 수 없어요.</b></p>
  <p class="t-sub mt4">지금 건너뛰셔도 등록은 끝낼 수 있습니다. 다만 예약 화면에서 다시 여기로 돌아오게 됩니다.
  증명서를 찾으시는 동안 다음 단계를 먼저 채워 두셔도 좋아요.</p>`,
      `${btn('여기서 올릴게요', { cls: 'btn-ghost', attr: ' data-dismiss' })}
   ${btn('나중에 올리고 넘어가기', { href: 'PL-03', cls: 'btn-pri' })}`)}`;

    return {
      body,
      o: {
        stick: stickBar(
          '<div class="t-sub">2단계 / 3단계 · 다음은 건강·특이사항이에요</div>',
          `${btn('나중에 올릴게요', { cls: 'btn-ghost', attr: ' data-modal="mSkip"' })}
           ${btn('다음: 건강·성향 정보 입력', { href: 'PL-03', cls: 'btn-pri' })}`,
        ),
      },
    };
  },

  /* ============================================================
     PL-03 건강·특이사항 — 보육교사가 «매일» 참고하는 정보다
     ============================================================ */
  'PL-03': () => {
    const body = `${pageHd('건강·특이사항', '보육교사가 매일 아침 이 화면을 보고 하루를 시작합니다. 빠짐없이 적어 주세요.')}

${steps(등록단계.map(([t]) => [t, '']), 2)}

${card('알러지', `
  <div class="row-b">
    <div><div class="t-card">알러지가 있나요?</div>
      <div class="t-sub mt1">간식과 특식을 줄 때 반드시 확인합니다</div></div>
    ${toggle(true, '', ' data-open="allergyBox"')}
  </div>
  <div id="allergyBox" class="mt6">
    ${field('음식 알러지', input({ ph: '예: 닭고기, 유제품' }))}
    ${field('환경 알러지', input({ ph: '예: 잔디, 특정 세제' }))}
    <div class="btns">${btn('＋ 항목 추가', { cls: 'btn-sub', sm: true, attr: ' data-toast="알러지 항목 칸을 하나 더 열었어요"' })}</div>
  </div>`, { cls: 'mt8' })}

${card('지병·수술 이력', textarea({ ph: '예: 2025년 슬개골 탈구 수술(양쪽). 지금은 뛰는 데 문제 없습니다.' }), { cls: 'mt6' })}

${card('복용 중인 약', `
  <div class="row-b">
    <div><div class="t-card">원에서 먹여야 하는 약이 있나요?</div>
      <div class="t-sub mt1">약과 급여 시간을 적어 주시면 보육교사가 그 시간에 챙깁니다</div></div>
    ${toggle(false, '', ' data-open="medBox"')}
  </div>
  <div id="medBox" class="mt6" hidden>
    <div class="f2">
      ${field('약 이름', input({ ph: '예: 관절 영양제' }))}
      ${field('급여 시간', select(['점심(12:30)', '오후(14:00)', '간식 시간(15:30)', '직접 적기'], 1))}
    </div>
    ${field('먹이는 법', input({ ph: '예: 사료에 섞어서 반 알' }))}
    <div class="btns">${btn('＋ 약 추가', { cls: 'btn-sub', sm: true, attr: ' data-toast="약 칸을 하나 더 열었어요"' })}</div>
  </div>`, { cls: 'mt6' })}

${card('발작·특이 행동 이력', `
  ${field('있었던 적이 있나요?', radioRow('fit', ['없어요', '있어요'], 0))}
  ${field('있었다면 어떤 상황이었나요', textarea({ ph: '언제·어떤 상황에서·얼마나 지속됐는지 적어 주세요' }), { hint: '비슷한 상황을 미리 피할 수 있습니다' })}`,
      { cls: 'mt6' })}

${card('연락처', `
  <div class="f2">
    ${field('담당 동물병원', input({ ph: SITE.vet.nm }))}
    ${field('병원 전화번호', input({ type: 'tel', ph: SITE.vet.tel }))}
  </div>
  <div class="f2">
    ${field('보호자 비상 연락처', input({ type: 'tel', ph: '010-0000-0000' }), { req: true, hint: '등록 번호가 안 될 때 겁니다 — 가족 번호가 좋아요' })}
    ${field('관계', input({ ph: '예: 배우자' }))}
  </div>`, { cls: 'mt6' })}

${card('그 외 보육교사가 알아야 할 것', `
  ${textarea({ ph: '예: 우산 소리를 무서워해요. 비 오는 날 현관에서 조금 떨 수 있어요.' })}
  <p class="hint">사소해 보이는 것도 좋습니다. 첫 주에 이 글을 가장 많이 봅니다.</p>`, { cls: 'mt6' })}

${banner('ok', '✓', '<b>여기까지 채우시면 등록이 끝납니다.</b><div class="t-sub mt2">등록한 정보는 마이페이지 › 반려견 프로필에서 언제든 고칠 수 있어요.</div>', { cls: 'mt6' })}`;

    return {
      body,
      o: {
        stick: stickBar(
          '<div class="t-sub">3단계 / 3단계 · 마지막이에요</div>',
          `${btn('프로필 보기', { href: 'PL-04', cls: 'btn-ghost' })}
           ${btn('등록 완료 → 예약하기', { href: 'RE-01', cls: 'btn-pri' })}`,
        ),
      },
    };
  },

  /* ============================================================
     PL-04 반려견 프로필 상세 — 보호자가 가장 자주 들르는 화면
     ⚠ 탭과 몸통은 tabBox 로 «한 상자»에 묶는다
     ============================================================ */
  'PL-04': () => {
    const 프로필 = (d) => {
      const c = CLASSES.find((x) => x.id === d.cls);
      return `
      <div class="card"><div class="card-bd">
        <div class="row wrap-row">
          ${phFix(['반려견 사진', 400, 400], 120, { cls: 'ph-dog', seed: d.nm })}
          <div class="grow">
            <div class="row wrap-row">
              <h2 class="t-page">${esc(d.nm)}</h2>
              ${badge(`현재 ${c.nm}`, 'b-solid')}
            </div>
            <p class="t-sub mt2">${esc(d.breed)} · ${esc(d.age)} · ${esc(d.sex)}${d.neut ? ' · 중성화 완료' : ''} · ${d.kg}kg</p>
            <div class="row wrap-row mt4">${d.tags.map((t) => badge(t, 'b-line')).join('')}</div>
          </div>
        </div>
      </div></div>

      <div class="mt6">${d.vac === '정상'
        ? banner('ok', '💉', `<b>백신 정상</b> <span class="t-sub">— 유효기간이 ${d.vacD}일 남았습니다</span>`,
          { right: btn('접종 기록 보기', { href: 'PL-02', cls: 'btn-ghost', sm: true }) })
        : d.vac === '임박'
          ? banner('warn', '💉', `<b>백신 만료가 ${d.vacD}일 남았어요</b> <span class="t-sub">— 미리 재접종하고 새 증명서를 올려 주세요</span>`,
            { right: btn('증명서 다시 올리기', { href: 'PL-02', cls: 'btn-sub', sm: true }) })
          : banner('dan', '💉', `<b>백신이 만료됐습니다</b> <span class="t-sub">— 새 증명서를 올릴 때까지 등원 예약이 제한됩니다</span>`,
            { right: btn('증명서 올리기', { href: 'PL-02', cls: 'btn-pri', sm: true }) })}</div>

      ${sec('반 배정', `${box(`
        <div class="row wrap-row">
          <span style="font-size:var(--fs-page)">${c.ico}</span>
          <div class="grow"><div class="t-card">${esc(c.nm)} <span class="t-sub">(${esc(c.kg)})</span></div>
            <p class="t-sub mt2">${esc(c.desc)}</p></div>
          <div class="center"><div class="t-sec pri num">${clsNow(c.id)}</div><div class="t-sub">/ ${c.cap}마리</div></div>
        </div>
        <p class="t-sub mt4">몸무게 ${d.kg}kg · ${esc(d.tags.join('·'))} 기준으로 배정했어요. 성향이 다르게 나타나면 반이 조정될 수 있습니다.</p>`)}`)}

      ${sec('건강 정보', `<div class="g2">
        ${box(`<div class="t-sub">알러지</div><div class="t-card mt1">${d.id === 'd01' ? '닭고기' : '없어요'}</div>`)}
        ${box(`<div class="t-sub">지병·복용약</div><div class="t-card mt1">${d.id === 'd01' ? '없어요' : '없어요'}</div>`)}
      </div>
      <div class="btns mt4">${btn('건강기록 자세히 보기', { href: 'HL-02', cls: 'btn-sub', sm: true })}</div>`)}

      ${sec('최근 알림장', `<div class="list1">
        ${NOTES.filter((n) => n.dog === d.nm).slice(0, 3).map((n) => noteCard(n)).join('')
          || `<p class="t-sub">아직 받은 알림장이 없어요.</p>`}
      </div>
      <div class="btns mt6">${btn('알림장함 전체 보기', { href: 'MY-04', cls: 'btn-sub' })}</div>`)}

      ${sec('이용권', `${box(`<div class="row-b wrap-row">
        <div><div class="t-sub">10회 회차권</div>
          <div class="t-page pri">잔여 ${d.pass == null ? '—' : d.pass}회</div>
          <div class="t-sub">${d.pass == null ? '정기 요일권을 쓰고 있어요' : `${MY_PASS.until}까지`}</div></div>
        ${btn('회차권 현황', { href: 'MY-02', cls: 'btn-ghost' })}
      </div>`)}`)}`;
    };

    const body = `${pageHd('반려견 프로필', `${TODAY.label} 기준입니다`, btn('정보 수정', { cls: 'btn-ghost', attr: ' data-toast="수정할 수 있게 칸을 열었어요"' }))}

${MINE.length > 1
      ? tabBox(
        MINE.map((d, i) => ({ label: `${d.nm} (${d.breed})`, pane: 'dog' + i })),
        MINE.map((d, i) => pane('dog' + i, 프로필(d), i === 0)).join(''),
        0,
        { pill: true },
      )
      : 프로필(초코)}

<div class="btns mt8">
  ${btn('예약하기', { href: 'RE-01', cls: 'btn-pri' })}
  ${btn('정기 등원 관리', { href: 'MY-03', cls: 'btn-ghost' })}
</div>`;
    return { body, o: {} };
  },
};
