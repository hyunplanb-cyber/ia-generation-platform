/* PD 장비 (6) — 이 팩의 알맹이인 «날짜별 재고 달력»이 여기 있다 */
import * as U from './ui.mjs';
import { GEAR, PACKS, 기간, 남은수, 구성품, 배상표 } from './data.mjs';

export const PAGES = {};
const G = GEAR[0];   // 카즈미 아틀라스 4인 텐트

const 필터 = () => U.card('조건 좁히기', `
  ${U.field('기간', `<div class="box" style="padding:10px 12px">
    <div class="strong">8월 15일 (토) ~ 17일 (월)</div><div class="t-sub">2박 3일</div></div>
  <div class="mt3">${U.btn('달력에서 고르기', { sm: true, w: true, href: 'PD-03' })}</div>`)}
  ${U.field('종류', `<div class="stack">${['텐트', '타프', '침낭', '화로대', '의자', '카메라'].map((c, i) => U.check(c, { on: i < 2, none: true })).join('')}</div>`)}
  ${U.field('1일 대여료', `<div class="row"><input class="in" type="text" value="0" aria-label="최저"><span>~</span><input class="in" type="text" value="100,000" aria-label="최고"></div>`)}
  ${U.field('받는 방법', `<div class="stack">${U.check('매장 방문', { on: true, none: true })}${U.check('택배 왕복', { on: true, none: true })}</div>`)}
  <div class="btns-v mt6">
    ${U.btn('적용', { cls: 'btn-pri', w: true, attr: ' data-toast="조건을 적용했어요"' })}
    ${U.btn('지우기', { w: true, href: 'PD-01' })}
  </div>`);

PAGES['PD-01'] = () => ({
  body: `${U.pageHd('장비 둘러보기', `${기간.라벨} 기준 · ${GEAR.length}개`,
    `${U.btn('세트 패키지', { href: 'PD-06' })}${U.btn('재고 달력', { cls: 'btn-pri', href: 'PD-03' })}`)}

${U.listPage(필터(), `
  <div class="row-b mb6 wrap-row">
    ${U.check('이 기간에 되는 것만 보기', { on: true, none: true })}
    ${U.정렬고르개('gear', [['rec', '추천순'], ['price', '대여료 낮은 순'], ['many', '많이 빌려간 순', true], ['rate', '별점 높은 순', true]])}
  </div>

  <div class="cards" style="grid-template-columns:repeat(3,minmax(0,1fr))" data-sort-list="gear">
    ${GEAR.map((g, i) => U.gearCard(g, { left: 남은수(g.id, 15), i })).join('')}
  </div>

  ${U.banner('info', '💡', '카드에 적힌 <b>「5대 중 2대 남음」</b>은 <b>고르신 기간 기준</b>입니다. 날짜를 바꾸면 이 숫자도 바뀝니다.', { cls: 'mt8' })}

  <div class="btns mt6" style="justify-content:center">${U.btn('더 보기', { attr: ' data-toast="다음 12개를 불러왔어요"' })}</div>`)}`,
});

PAGES['PD-02'] = () => {
  const 남 = 남은수(G.id, 15);
  const 소계 = G.day * 기간.일 * 2;
  const 할인 = Math.round(소계 * 0.1);
  return {
    o: {
      stick: U.stickBar(
        `<div><span class="t-sub">2박 3일 · 2개</span><div><b style="font-size:21px">${U.won(소계 - 할인)}</b>
          <span class="t-sub">+ 보증금 ${U.won(G.dep * 2)}</span></div></div>`,
        `${U.btn('장바구니', { href: 'CT-01' })}${U.btn('바로 빌리기', { cls: 'btn-pri', href: 'BK-01' })}`,
      ),
    },
    body: `${U.detail2(`
  <div class="g2" style="grid-template-columns:1fr;gap:var(--sp-item)">
    ${U.ph(['장비 대표 사진', 1200, 900], { seed: G.id })}
    <div class="row" style="gap:var(--sp-btn)">
      ${['앞', '옆', '안쪽', '구성품', '설치'].map((t, i) => `<div style="flex:1">${U.ph([t, 400, 300], { seed: G.id + i, tiny: true })}</div>`).join('')}
    </div>
  </div>

  ${U.tabBox(
    [{ label: '구성품', pane: 'a' }, { label: '이용 안내', pane: 'b' }, { label: '파손 배상 기준', pane: 'c' }, { label: `후기 ${G.rv}`, pane: 'd' }],
    `${U.pane('a', U.card('', `${U.table(['구성품', { t: '개수', w: '80px', cls: 'c' }, { t: '없으면', w: '110px', cls: 'r' }],
        구성품.map(([nm, n], i) => [nm, { t: `<span class="num">${n}</span>`, cls: 'c' },
          { t: `<span class="num">${U.won(배상표[i] ? 배상표[i][1] : 12_000)}</span>`, cls: 'r' }]))}
      <p class="t-sub mt4">반납할 때 이 목록대로 확인합니다. 하나라도 빠지면 오른쪽 금액이 정산됩니다.</p>`), true)}
     ${U.pane('b', U.card('', `
      <h4 class="t-card mb3">쓰는 법</h4>
      <p class="t-sub">폴대를 슬리브에 끼우고 양 끝을 그로밋에 꽂으면 섭니다. 혼자서 20분쯤 걸려요.
        받으실 때 한 번 보여드리고, 설치 영상 링크도 문자로 보내드립니다.</p>
      <h4 class="t-card mt6 mb3">주의할 점</h4>
      <ul class="stack t-sub">
        <li>· <b>비를 맞았으면 그대로 가져다 주세요.</b> 접어서 가방에 넣으면 곰팡이가 생겨 배상 대상이 됩니다.</li>
        <li>· 강풍(초속 10m 이상)에는 접어 주세요. 폴대가 부러지면 배상해야 합니다.</li>
        <li>· 화로대는 텐트에서 2m 이상 떨어뜨려 주세요.</li>
      </ul>
      <h4 class="t-card mt6 mb3">하시면 안 되는 것</h4>
      <ul class="stack t-sub">
        <li>· 다른 사람에게 다시 빌려주기</li><li>· 개조하거나 부품 바꾸기</li><li>· 텐트 안에서 불 피우기</li>
      </ul>`))}
     ${U.pane('c', U.card('', `${U.table(['어디가', '얼마', '메모'],
        배상표.filter(([, v]) => v > 0).map(([nm, v]) => [nm, { t: `<span class="num strong">${U.won(v)}</span>`, cls: '' }, nm === '원단 찢어짐' ? '수리로 되면 수리비만 받습니다' : '']))}
      ${U.banner('info', '🤝', '<b>미리 말씀해 주시면 조정될 수 있습니다.</b> 숨기시는 것보다 알려주시는 쪽이 서로 낫습니다.', { cls: 'mt4' })}
      <p class="t-sub mt4">분실은 장비 정가의 100%입니다. 파손 면책 보험(하루 3,000원)을 붙이면 20만원까지 면책됩니다.</p>`))}
     ${U.pane('d', U.card('', `
      <div class="row mb4" style="gap:var(--sp-block)">
        <div style="text-align:center"><div style="font-size:34px;font-weight:700">${G.r.toFixed(1)}</div>${U.stars(G.r)}
          <div class="t-sub">${U.num(G.rv)}개</div></div>
        <div class="grow stack">
          ${[['장비 상태', 4.9], ['설명과 같은지', 4.8], ['받고 돌려주기', 4.7], ['응대', 4.8]].map(([t, v]) => `
            <div class="row"><span class="t-sub" style="width:100px">${t}</span>
              <div class="grow">${U.progress(v / 5 * 100)}</div><b class="num">${v}</b></div>`).join('')}
        </div>
      </div>
      ${U.table(['별점', '후기', '언제'], [
        [U.stars(5), '사진이랑 똑같았어요. 설치도 혼자서 20분 만에 됐습니다.', '<span class="num sub">2026-08-02</span>'],
        [U.stars(5), '반납할 때 받을 때 사진이랑 견줘 보여주시니 마음이 편했어요.', '<span class="num sub">2026-07-28</span>'],
        [U.stars(4), '팩이 하나 휘어 있었는데 미리 말씀드리니 그냥 넘어가 주셨어요.', '<span class="num sub">2026-07-21</span>'],
      ])}`))}`,
    0, { cls: 'mt8' },
  )}

  ${U.sec('함께 빌리면 좋아요', `<div class="cards" style="grid-template-columns:repeat(3,minmax(0,1fr))">
    ${GEAR.slice(1, 4).map((g) => U.gearCard(g, { left: 남은수(g.id, 15) })).join('')}</div>`, { cls: 'mt8' })}`, `

  ${U.card('', `
    <h1 class="t-card">${G.nm}</h1>
    <p class="t-sub mt2">${G.brand} · ${U.rateLine(G.r, G.rv)}</p>
    <p class="mt4"><b style="font-size:26px" class="num">${U.num(G.day)}</b><span class="t-sub">원 / 1일</span></p>

    ${U.field('빌리는 기간', `<div class="box" style="padding:10px 12px">
      <div class="row-b"><div><div class="strong">8월 15일 (토)</div><div class="t-sub">받는 날</div></div>
      <span class="muted">→</span>
      <div style="text-align:right"><div class="strong">8월 17일 (월)</div><div class="t-sub">돌려주는 날</div></div></div>
    </div>
    <div class="mt3">${U.btn('📅 이 날짜에 되나요? — 재고 달력 열기', { sm: true, w: true, cls: 'btn-ghost', href: 'PD-03' })}</div>`)}

    ${U.field('몇 개', `<div class="row-b">${U.stepper(2, { toast: '수량을 바꾸면 총액과 가능한 날짜가 다시 계산돼요' })}
      <span class="t-sub">${G.total}대 중 <b class="pri">${남}대</b> 남음</span></div>`)}

    ${U.field('받는 방법', `<div class="stack">
      ${U.check('매장 방문 <span class="t-sub">— 무료</span>', { on: true, none: true })}
      ${U.check('택배 왕복 <span class="t-sub">— 6,000원</span>', { none: true })}
    </div>`)}

    ${U.sumRows([
      [`대여료 (${U.won(G.day)} × 3일 × 2개)`, `<span class="num">${U.won(소계)}</span>`],
      ['3일 이상 할인 10%', `<span class="num">-${U.num(할인)}원</span>`, 'minus'],
      ['배송비', '<span class="num">0원</span>'],
    ], ['지금 낼 돈', `<span class="num">${U.won(소계 - 할인)}</span>`])}

    ${U.depositRow(G.dep * 2, '빠져나가지 않고 카드 한도만 잡힙니다. 반납 확인 후 <b>3영업일 안에</b> 풀려요.')}`, {
      ft: `<div class="btns-v">
        ${U.btn('바로 빌리기', { cls: 'btn-pri', lg: true, w: true, href: 'BK-01' })}
        ${U.btn('장바구니에 담기', { w: true, href: 'CT-01' })}
      </div>`,
    })}

  ${U.card('빌릴 수 없는 날이 있어요', `<p class="t-sub">고르신 기간 중 하루라도 재고가 모자라면 알려드립니다.
    지금 기간은 <b class="pri">문제없습니다.</b></p>
    <div class="mt3">${U.btn('막힌 날짜 화면 보기', { sm: true, w: true, href: 'PD-05' })}</div>`)}

  ${U.card('안심하고 빌리시라고', `<div class="stack t-sub">
    <div>✓ 받을 때·돌려줄 때 <b>사진을 남깁니다</b></div>
    <div>✓ 이미 있던 흠집은 <b>미리 신고</b>하면 배상 안 합니다</div>
    <div>✓ 보증금은 <b>3영업일 안에</b> 돌려드립니다</div>
  </div>`)}`)}`,
  };
};

/* ★ 이 팩에서 가장 중요한 화면 */
PAGES['PD-03'] = () => ({
  body: `${U.pageHd('언제 쓰실 건가요', `${G.nm} · ${G.total}대 보유`,
    U.btn('장비 상세로', { href: 'PD-02' }))}

${U.banner('info', '📅', '<b>쇼핑몰과 다릅니다.</b> 렌탈은 「몇 개 남았나」가 아니라 <b>「이 날짜에 비었나」</b>가 중요해요. 같은 장비도 날짜마다 다르게 잡힙니다.')}

${U.detail2(`
  ${U.card('', `
    <div class="row-b mb6 wrap-row">
      ${U.field('몇 개 필요하세요', `<div class="row">${U.stepper(2, { toast: '2대로 올리니 1대만 남은 날이 회색이 됐어요' })}
        <span class="t-sub">고른 수만큼 있는 날만 열립니다</span></div>`)}
    </div>
    ${U.cal(G.id, { qty: 2, sel: [15, 17] })}`)}

  ${U.card('꼭 알아 두실 것', `<div class="g2">
    <ul class="stack t-sub">
      <li>· 최소 <b>1박</b>부터, 최대 <b>30박</b>까지 빌릴 수 있어요.</li>
      <li>· <b>금·토는 대여료가 20% 올라갑니다.</b> 달력에 표시해 뒀어요.</li>
    </ul>
    <ul class="stack t-sub">
      <li>· 빗금 친 날은 <b>점검일</b>입니다. 돌아온 장비를 손질하는 날이라 못 빌려요.</li>
      <li>· 숫자는 <b>그날 남은 대수</b>입니다. 색만 보지 마시고 숫자를 봐 주세요.</li>
    </ul>
  </div>`, { cls: 'mt6' })}`, `

  ${U.card('고르신 기간', `
    ${U.kv([
      ['받는 날', '<b>8월 15일 (토)</b>'],
      ['돌려주는 날', '<b>8월 17일 (월)</b>'],
      ['기간', '<b>2박 3일</b>'],
      ['수량', '<b>2개</b>'],
    ])}
    ${U.banner('ok', '✓', '이 기간 내내 <b>2대 이상</b> 남아 있어요.', { cls: 'mt4' })}
    <div class="mt6">${U.sumRows([
      ['대여료 (46,300 × 3일 × 2개)', '<span class="num">277,800원</span>'],
      ['금·토 할증 (8/15)', '<span class="num">+18,520원</span>'],
      ['3일 이상 할인 10%', '<span class="num">-29,632원</span>', 'minus'],
    ], ['지금 낼 돈', '<span class="num">266,688원</span>'])}
    ${U.depositRow(G.dep * 2)}`, {
      ft: `<div class="btns-v">
        ${U.btn('이 기간으로 빌리기', { cls: 'btn-pri', lg: true, w: true, href: 'BK-01' })}
        ${U.btn('장바구니에 담기', { w: true, href: 'CT-01' })}
      </div>`,
    })}

  ${U.card('다른 날은 어때요', `<p class="t-sub mb3">평일이 섞이면 훨씬 쌉니다.</p>
    ${U.table(['기간', { t: '총액', w: '104px', cls: 'r nowrap' }], [
      ['8/13 ~ 8/15 (평일 2박)', { t: '<span class="num">186,681원</span>', cls: 'r nowrap' }],
      ['8/20 ~ 8/22 (평일 2박)', { t: '<span class="num">186,681원</span>', cls: 'r nowrap' }],
      ['8/22 ~ 8/24 (주말 2박)', { t: '<span class="num">266,688원</span>', cls: 'r nowrap' }],
    ])}`)}`)}`,
});

PAGES['PD-04'] = () => ({
  body: `${U.pageHd('옵션과 함께 빌릴 것', `${G.nm} · ${기간.라벨}`)}

<div class="split-r">
  <div>
    ${U.card('크기와 색', `
      ${U.field('크기', `<div class="stack">
        ${U.check('4인용 <span class="t-sub">— 3대 남음</span>', { on: true, none: true })}
        ${U.check('6인용 <span class="t-sub warn">— 1대 남음 · +12,000원/일</span>', { none: true })}
      </div>`, { req: true })}
      ${U.field('색', `<div class="chips">${U.chip('카키', true)}${U.chip('아이보리')}${U.chip('차콜 (이 기간 없음)', false, ' disabled class="chip is-off"')}</div>`)}
      ${U.banner('info', 'ℹ', '옵션마다 <b>가진 대수가 다릅니다.</b> 6인용은 이 기간에 1대만 남았어요.', { cls: 'mt4' })}`)}

    ${U.card('함께 빌릴 것', `${U.table(
      [{ t: '', w: '36px', cls: 'c' }, '부속품', { t: '하루', w: '92px', cls: 'r nowrap' }, { t: '보증금', w: '92px', cls: 'r nowrap' }, { t: '남은 수', w: '76px', cls: 'r' }],
      [['전용 매트', 5_000, 20_000, 6, true], ['팩 추가 12개', 3_000, 0, 20, false],
       ['보관함', 4_000, 15_000, 4, false], ['LED 랜턴', 6_000, 30_000, 2, false]]
        .map(([nm, d, dep, left, on]) => [
          { t: `<input type="checkbox" ${on ? 'checked' : ''} aria-label="${nm} 고르기">`, cls: 'c' },
          nm,
          { t: `<span class="num">${U.won(d)}</span>`, cls: 'r nowrap' },
          { t: dep ? `<span class="num">${U.won(dep)}</span>` : '<span class="muted">없음</span>', cls: 'r nowrap' },
          { t: `<span class="num">${left}개</span>`, cls: 'r' },
        ]))}`, { cls: 'mt6' })}

    ${U.card('파손 면책 보험', `
      ${U.check('붙일게요 — 하루 3,000원 (3일 9,000원)', { sub: '20만원까지 면책됩니다. 자기부담금 없습니다.', none: false })}
      <div class="g2 mt6">
        ${U.box(`<div class="strong pri mb2">✓ 이런 건 면책돼요</div><ul class="stack t-sub">
          <li>· 쓰다가 실수로 부러뜨림</li><li>· 바람에 날려 찢어짐</li><li>· 지퍼 고장</li></ul>`)}
        ${U.box(`<div class="strong dan mb2">✕ 이런 건 안 돼요</div><ul class="stack t-sub">
          <li>· 일부러 망가뜨림</li><li>· 잃어버림 (분실)</li><li>· 물에 잠김</li></ul>`)}
      </div>
      <p class="t-sub mt4">권하긴 하지만 꼭 붙이실 필요는 없어요. 위 표를 보고 정하세요.</p>`, { cls: 'mt6' })}
  </div>

  <div class="sticky stack" style="gap:var(--sp-block)">
    ${U.card('고른 것', `
      ${U.sumRows([
        ['4인용 텐트 × 2개 × 3일', '<span class="num">277,800원</span>'],
        ['전용 매트 × 3일', '<span class="num">15,000원</span>'],
        ['면책 보험 × 3일', '<span class="num">9,000원</span>'],
        ['3일 이상 할인 10%', '<span class="num">-30,180원</span>', 'minus'],
      ], ['지금 낼 돈', '<span class="num">271,620원</span>'])}
      ${U.depositRow(220_000, '텐트 200,000 + 매트 20,000')}`, {
        ft: `<div class="btns-v">
          ${U.btn('바로 빌리기', { cls: 'btn-pri', lg: true, w: true, href: 'BK-01' })}
          ${U.btn('장바구니에 담기', { w: true, href: 'CT-01' })}
        </div>`,
      })}
  </div>
</div>`,
});

PAGES['PD-05'] = () => ({
  body: `${U.pageHd('이 날짜엔 빌릴 수 없어요', `${G.nm} 3개 · 8월 15일 ~ 17일`)}

<div class="wrap-read">
  ${U.banner('dan', '✕', '<b>8월 16일</b>에 <b>2대</b>만 남아 있어요. 3개를 빌리시려면 그날이 막힙니다.')}

  ${U.card('어디가 막혔는지 보세요', `
    ${U.table([{ t: '날짜', w: '128px' }, { t: '남은 수', w: '92px', cls: 'c' }, '3개 빌릴 수 있나'],
      [['8월 15일 (토)', { t: '<span class="num strong">3대</span>', cls: 'c' }, U.badge('가능', 'b-ok')],
       ['8월 16일 (일)', { t: '<span class="num strong dan">2대</span>', cls: 'c' }, U.badge('여기가 막혔어요', 'b-dan')],
       ['8월 17일 (월)', { t: '<span class="num strong">3대</span>', cls: 'c' }, U.badge('가능', 'b-ok')]])}`, { cls: 'mt6' })}

  <h2 class="t-sec mt8 mb4">이렇게 해 보세요</h2>
  <div class="stack" style="gap:var(--sp-block)">
    ${U.card('① 2개만 빌리면 그대로 됩니다', `
      <p class="t-sub">8월 15~17일 내내 <b>2대는 비어 있습니다.</b> 수량만 줄이면 지금 바로 예약돼요.</p>
      <div class="row-b mt4"><span>2개 · 2박 3일 · <b class="num">266,688원</b></span>
        ${U.btn('2개로 빌리기', { cls: 'btn-pri', href: 'BK-01' })}</div>`)}

    ${U.card('② 이 날짜는 3개 다 비어 있어요', `
      <div class="chips">${['8/13 ~ 8/15', '8/20 ~ 8/22', '8/22 ~ 8/24'].map((d) => `<button class="chip" type="button" data-go="${U.link('PD-03')}">${d}</button>`).join('')}</div>
      <p class="t-sub mt4">누르면 그 날짜로 달력이 다시 그려집니다. 평일이 섞이면 대여료도 30% 쌉니다.</p>`)}

    ${U.card('③ 비슷한 다른 텐트도 있어요', `<div class="cards" style="grid-template-columns:repeat(2,minmax(0,1fr))">
      ${GEAR.slice(1, 3).map((g) => U.gearCard(g, { left: 남은수(g.id, 16) })).join('')}</div>`)}
  </div>

  ${U.card('자리 나면 알려드릴게요', `
    <p>8월 16일에 취소가 나오면 <b>문자로</b> 바로 알려드립니다.</p>
    <div class="row-b mt4">
      <span class="t-sub">지금 이 날짜를 기다리는 분 <b>3명</b> · 나는 <b class="pri">4번째</b></span>
      ${U.btn('알림 신청', { cls: 'btn-pri', attr: ' data-toast="신청했어요. 자리가 나면 문자로 알려드릴게요" data-toast-kind="ok"' })}
    </div>
    <p class="t-sub mt3">선착순입니다. 알림을 받으시면 서둘러 주세요.</p>`, { cls: 'mt8' })}

  <div class="btns mt8">${U.btn('날짜 다시 고르기', { cls: 'btn-pri', href: 'PD-03' })}${U.btn('다른 장비 보기', { href: 'PD-01' })}</div>
</div>`,
});

PAGES['PD-06'] = () => {
  const P = PACKS[0];
  const 낱개 = P.items.reduce((a, id) => a + U.gearOf(id).day, 0);
  return {
    o: {
      stick: U.stickBar(
        `<div><span class="t-sub">2박 3일</span><div><b style="font-size:21px">${U.won(P.day * 3)}</b>
          <span class="t-sub">+ 보증금 ${U.won(P.dep)}</span></div></div>`,
        `${U.btn('장바구니', { href: 'CT-01' })}${U.btn('바로 빌리기', { cls: 'btn-pri', href: 'BK-01' })}`,
      ),
    },
    body: `${U.pageHd(P.nm, `${P.people} 기준 · 네 가지를 한 번에`)}

${U.detail2(`
  ${U.ph(['패키지 전체 사진', 1200, 900], { seed: 'packmain' })}

  ${U.banner('ok', '💰', `낱개로 빌리면 <b>${U.won(낱개)}</b> → 세트로 <b>${U.won(P.day)}</b>
    <b class="pri">(${Math.round((1 - P.day / 낱개) * 100)}% 절약)</b> · 하루 기준`, { cls: 'mt6' })}

  ${U.card('무엇이 들어 있나요', U.table(
    [{ t: '', w: '36px', cls: 'c' }, { t: '사진', w: '64px' }, '장비', { t: '낱개로 빌리면', w: '116px', cls: 'r nowrap' }],
    P.items.map((id) => {
      const g = U.gearOf(id);
      return [
        { t: '<input type="checkbox" checked aria-label="' + g.nm + ' 넣기">', cls: 'c' },
        U.phFix(['장비', 400, 400], 56, { seed: id }),
        `<b>${g.nm}</b><div class="sub">${g.brand}</div>`,
        { t: `<span class="num">${U.won(g.day)}</span>`, cls: 'r nowrap' },
      ];
    }),
    { foot: ['', '', '낱개 합계', { t: U.won(낱개), cls: 'r' }] },
  ), { cls: 'mt6', ft: '<p class="t-sub">체크를 풀면 그 장비가 빠지고 할인율이 다시 계산됩니다. 두 개 미만이 되면 세트 할인이 사라져요.</p>' })}

  ${U.card('인원수로 고르세요', U.table(['몇 명', '추천 세트', '한 달 기준 총액'], [
    ['2명', '커플 캠핑 세트', '<span class="num">61,000원 / 1일</span>'],
    ['4명', `<b>${P.nm}</b> ${U.badge('지금 보는 것', 'b-solid')}`, `<span class="num">${U.won(P.day)} / 1일</span>`],
    ['6명 이상', '대가족 세트', '<span class="num">128,000원 / 1일</span>'],
  ]), { cls: 'mt6' })}

  ${U.sec('이 세트를 빌린 분들', `<div class="g3">
    ${[['정말 편했어요', '하나하나 고를 필요가 없어서 좋았습니다.'],
       ['처음 캠핑에 딱', '뭘 챙겨야 할지 몰랐는데 다 들어 있었어요.'],
       ['가격이 착해요', '따로 빌리는 것보다 확실히 쌉니다.']]
      .map(([t, d]) => `<div class="box">${U.stars(5)}<div class="t-card mt2">${t}</div><p class="t-sub mt2">${d}</p></div>`).join('')}
  </div>`, { cls: 'mt8' })}`, `

  ${U.card('빌릴 기간', `
    ${U.field('기간', `<div class="box" style="padding:10px 12px">
      <div class="strong">8월 15일 (토) ~ 17일 (월)</div><div class="t-sub">2박 3일</div></div>
    <div class="mt3">${U.btn('달력에서 고르기', { sm: true, w: true, href: 'PD-03' })}</div>`)}

    ${U.banner('warn', '⚠', '<b>화로대</b>가 8월 16일에 없어요. 세트는 하나만 빠져도 못 빌립니다.', { cls: 'mb4' })}
    <p class="t-sub mb4">화로대를 빼고 세 가지만 빌리시거나, 날짜를 옮기시면 됩니다.</p>

    ${U.sumRows([
      [`세트 대여료 (${U.won(P.day)} × 3일)`, `<span class="num">${U.won(P.day * 3)}</span>`],
      ['3일 이상 할인 10%', `<span class="num">-${U.num(Math.round(P.day * 3 * 0.1))}원</span>`, 'minus'],
    ], ['지금 낼 돈', `<span class="num">${U.won(P.day * 3 - Math.round(P.day * 3 * 0.1))}</span>`])}

    ${U.depositRow(P.dep, '낱개 보증금의 합(280,000원)이 아니라 <b>세트 보증금</b>이 따로 있습니다.')}`, {
      ft: `<div class="btns-v">
        ${U.btn('화로대 빼고 빌리기', { cls: 'btn-pri', w: true, href: 'BK-01' })}
        ${U.btn('다른 날짜 보기', { w: true, href: 'PD-03' })}
        ${U.btn('장바구니에 담기', { w: true, href: 'CT-01' })}
      </div>`,
    })}`)}`,
  };
};
