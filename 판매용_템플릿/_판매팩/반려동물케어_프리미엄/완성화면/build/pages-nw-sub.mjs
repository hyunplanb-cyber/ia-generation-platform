/* NW 알림장 작성 — 잎사귀 15장.
   부모(NW0101·NW0201·NW0301·NW0401)의 뼈대·색·톤은 U.shell() 이 그대로 유지해 준다.
   여기서는 그 화면의 «상태·세부»만 보여 준다.

   ★ 알림장이 이 팩의 알맹이다 — 「맡긴 동안 일어난 일을 보호자에게 돌려주는 것」이
     이 서비스가 파는 값이다. 쇼핑몰 도구로는 아예 안 되는 자리라 얇게 만들지 않는다.

   ⚠ 숫자는 전부 data.mjs 에서 «세어» 쓴다. 손으로 두 번 적지 않는다.
   ⚠ 사진은 손님이 직접 올리는 것이다 — ph()/uploadDrop()/gal() 자리표로만 둔다.
   ⚠ 브라우저가 띄우는 붙박이 확인·입력창은 쓰지 않는다 — 무인 검사기가 그 자리에서 멈춘다.
     확인이 필요하면 app.js 의 물어보기 나 U.modal + data-modal 을 쓴다. */
import {
  esc, ph, phFix, badge, stBadge, btn, chip, sec, card, box, banner, empty, table, kv,
  timeline, leafHd, modal, stat, field, input, select, textarea, check,
  toggle, uploadDrop, gal, 조사,
} from './ui.mjs';
import { SITE, TODAY, DOGS, CLS, CAME, NOTE_ST, NOTE_CNT, PHRASES, NOTES, STAFF } from './data.mjs';

const P = {};
export const PAGES = P;

/* ---------- 부모 화면과 «같은 사실»을 쓰기 위한 값들 ---------- */
const 상태 = (d) => NOTE_ST[d.id];
const 완료목록 = CAME.filter((d) => 상태(d) === '작성완료');
const 작성중목록 = CAME.filter((d) => 상태(d) === '작성중');
const 미작성목록 = CAME.filter((d) => 상태(d) === '미작성');
const 안끝난목록 = CAME.filter((d) => 상태(d) !== '작성완료');   /* NW0101 의 「누구의 알림장을 쓸까요」 칩과 같은 목록 */
const 쓸아이 = 안끝난목록[0];                                    /* NW0101 에서 기본으로 골라져 있는 아이 */
const 하원한 = DOGS.filter((d) => d.st === '하원');
const 사진아이 = 하원한[0] || DOGS[0];                            /* NW0201 이 쓰는 아이와 같다 */
/* ⚠ 부모 NW0301 은 오늘 명단의 «네 번째 줄»을 「발송 실패 · 연락처 오류」로 표시한다.
   NOTE_CNT.실패(1건)와 이 줄이 어긋나면 안 되므로 같은 줄을 그대로 가져온다. */
const 실패아이 = CAME[3];
/* 담당 보육교사 — 그 아이의 반을 맡은 사람을 STAFF 에서 찾는다. 이름을 지어내지 않는다.
   ⚠ 원장(김수현)은 세 반을 다 맡고 있어 먼저 걸린다. 반 전담 보육교사를 먼저 찾는다 —
     이 규칙이라야 data.mjs 의 알림장(초코=이도윤 중형반 · 보리=박지연 소형반)과 아귀가 맞는다. */
const 담당 = (d) => {
  const 반 = CLS(d.cls).nm;
  const 맡은 = STAFF.filter((s) => s.st === '활성' && s.cls.includes(반));
  return (맡은.find((s) => s.role === '보육교사') || 맡은[0] || STAFF[0]).nm;
};

/* 발송 이력 — ⚠ 부모 NW0401(pages-nw.mjs)의 이력과 «같은 값»이다.
   한쪽을 고치면 다른 쪽도 같이 고쳐야 한다. 여기서는 날짜·요일·경과일을 세어서 붙인다. */
const 요일 = { '08-21': '금', '08-20': '목', '08-19': '수' };
const 며칠전 = (ymd) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return Math.round((Date.UTC(TODAY.y, TODAY.m - 1, TODAY.d) - Date.UTC(y, m - 1, d)) / 86400000);
};
const 이력 = [
  { t: '08-21 18:32', dog: '초코', g: '김하늘', st: '읽음', open: '18:41' },
  { t: '08-21 18:32', dog: '해피', g: '오재현', st: '읽음', open: '19:05' },
  { t: '08-21 18:32', dog: '루비', g: '강민아', st: '전달됨', open: '' },
  { t: '08-21 18:32', dog: '루키', g: '차민준', st: '실패', open: '' },
  { t: '08-20 18:30', dog: '초코', g: '김하늘', st: '읽음', open: '18:35' },
  { t: '08-20 18:30', dog: '보리', g: '김하늘', st: '읽음', open: '18:35' },
  { t: '08-20 18:30', dog: '구름', g: '조은수', st: '전달됨', open: '' },
  { t: '08-19 18:31', dog: '초코', g: '김하늘', st: '읽음', open: '20:12' },
  { t: '08-19 18:31', dog: '단추', g: '임채원', st: '읽음', open: '18:44' },
  { t: '08-19 18:31', dog: '몽이', g: '남주희', st: '실패', open: '' },
].map((r) => {
  const 날 = r.t.slice(0, 5);
  const ymd = `2026-${날}`;
  return { ...r, ymd, dow: 요일[날], 지난 : 며칠전(ymd) };
});
const 날짜들 = [...new Set(이력.map((r) => r.ymd))];              /* 최근 발송일 3개 */
const 실패이력 = 이력.filter((r) => r.st === '실패');
const 안읽음이력 = 이력.filter((r) => r.st === '전달됨');
const 읽음이력 = 이력.filter((r) => r.st === '읽음');

/* 한 줄에 라디오 셋 — 항목마다 다른 손잡이를 달아야 해서 radioRow 대신 직접 만든다.
   ⚠ 「부진」을 고르면 메모 칸이 «실제로» 열린다(data-reveal-when). 세 줄이 한 칸을 함께 쓴다. */
const 라디오3 = (name, 고른, extra) => `<div class="btns">${['잘함', '보통', '부진'].map((t) =>
  `<label class="check none"><input type="radio" name="${name}" value="${t}"${t === 고른 ? ' checked' : ''}${extra || ''}><span>${t}</span></label>`).join('')}</div>`;

/* 사진 칸 — 손님이 올릴 자리다. 가짜 주소를 지어내지 않는다.
   ⚠ 딱지(.cap)는 칸마다 하나다. app.js 의 번호매기기() 가 대표면 「대표」, 아니면 차례 번호로 고쳐 쓴다.
     처음 그릴 때부터 그 규칙과 같게 그려 둔다 — 안 그러면 열자마자 숫자가 튄다. */
const 사진칸 = (n, 대표idx, seed) => `<div class="pc-shots">
  ${Array.from({ length: n }).map((_, i) => `<div class="pc-shot${i === 대표idx ? ' main' : ''}" draggable="true">
    ${ph(['알림장 사진', 800, 600], { seed: `${seed}-${i}`, cls: 'ph-card' })}
    <button class="star" type="button" aria-label="대표 사진으로 정하기">★</button>
    <button class="del" type="button" aria-label="지우기">✕</button>
    <span class="cap"${i === 대표idx ? ' data-main="1"' : ''}>${i === 대표idx ? '대표' : i + 1}</span>
  </div>`).join('')}
</div>`;

/* ============================================================
   NW0102 알림장 작성 > 즐겨쓰는 문장 불러오기
   ★ 문장을 고르면 본문에 «실제로» 들어간다 — data-phrase → data-note-text → data-note-len
   ============================================================ */
P['NW0102'] = (ctx) => {
  const body = `${leafHd(ctx, `${esc(쓸아이.nm)}의 ${esc(TODAY.short)} 알림장을 쓰는 중입니다 — 문장을 누르면 아래 본문에 이어 붙습니다`,
    btn('알림장 작성으로', { href: 'NW0101', cls: 'btn-ghost' }))}

${card('하루 요약', `
  ${textarea({ ph: '오늘 어떻게 지냈는지 적어 주세요. 보호자님이 가장 오래 읽는 부분입니다.', attr: ' data-note-text style="min-height:140px"' })}
  <p class="hint">지금 <b data-note-len>0</b>자 · 100자 넘게 쓰시면 보호자 만족도가 눈에 띄게 올라갑니다.</p>`,
    { cls: 'mt8', aside: badge(`${esc(CLS(쓸아이.cls).nm)} · ${esc(쓸아이.breed)}`, 'b-line') })}

${card(`즐겨쓰는 문장 ${PHRASES.length}개`, `
  <p class="t-sub mb4">누를 때마다 위 본문 끝에 이어 붙습니다. 여러 개를 이어 붙여 한 문단으로 만들어도 됩니다.</p>
  <div class="chips" data-pick-scope="phr">
    ${PHRASES.map((p) => chip(p, false, ` data-phrase="${esc(p)}"`)).join('')}
  </div>
  <p class="hint"><b data-pick-out="phr">0</b>개를 골랐습니다. 아직 아무것도 고르지 않아 아래 단추가 잠겨 있어요.</p>
  <div class="btns mt4">
    ${btn('고른 문장을 맨 앞으로 올리기', {
    id: 'phrTop', cls: 'btn-pri', off: true,
    attr: ' data-pick-btn="phr" data-toast="고른 문장을 즐겨쓰는 문장 맨 앞으로 올렸어요 — 다음 알림장부터 먼저 보입니다"',
  })}
    ${btn('본문 비우고 다시 쓰기', { cls: 'btn-ghost', attr: ' data-toast="본문을 비우려면 글상자를 직접 지워 주세요 — 실수로 지워지지 않게 해 두었습니다"' })}
  </div>`, { cls: 'mt6' })}

${card('새 문장 즐겨찾기에 추가', `
  <div class="f2">
    ${field('문장', input({ ph: '예: 오늘은 마당에서 오래 뛰어놀았어요.' }), { hint: '30자 안쪽이 가장 쓰기 좋습니다' })}
    ${field('어떤 자리에 쓰나요', select(['하루 요약', '식사·배변·낮잠', '특이사항'], 0))}
  </div>
  <div class="btns">${btn('＋ 즐겨찾기에 추가', { cls: 'btn-sub', attr: ' data-toast="새 문장을 즐겨쓰는 문장에 담았어요 — 원의 모든 선생님이 함께 씁니다"' })}</div>`,
    { cls: 'mt6' })}

${banner('info', '⏱️', `<b>오늘 이 원이 써야 하는 알림장은 ${NOTE_CNT.전체}건입니다.</b>
  <div class="t-sub mt2">그래서 문장을 다시 치지 않게 해 두었습니다. 즐겨쓰는 문장은 원 전체가 함께 쓰고, 자주 누른 문장이 앞으로 올라옵니다.</div>`,
    { cls: 'mt8' })}

<div class="btns mt8">
  ${btn('알림장 작성으로 돌아가기', { href: 'NW0101', cls: 'btn-ghost' })}
  ${btn('사진 첨부하러 가기', { href: 'NW0201', cls: 'btn-pri' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   NW0103 알림장 작성 > 식사·배변·낮잠 체크리스트
   ★ 체크한 개수와 아래 요약이 어긋나면 안 된다 — 요약 문장도 이 배열에서 만든다.
   ★ 「부진」을 고르면 메모 칸이 실제로 열린다.
   ============================================================ */
P['NW0103'] = (ctx) => {
  const 항목 = [
    { k: 'meal', ico: '🍚', nm: '식사', v: '잘함', d: '가져오신 사료를 12:30 점심에 다 먹었어요' },
    { k: 'poop', ico: '💩', nm: '배변', v: '보통', d: '오전 한 번 · 오후 한 번. 상태는 평소와 같았어요' },
    { k: 'nap', ico: '😴', nm: '낮잠', v: '부진', d: '13:30 낮잠 시간에 두 번 깨서 뒤척였어요' },
  ];
  const 리빌 = ' data-reveal-when="부진" data-reveal-box="badMemo"';
  const 센다 = (v) => 항목.filter((x) => x.v === v).length;
  const 부진들 = 항목.filter((x) => x.v === '부진');
  const 요약문 = 항목.map((x) => `${x.nm} ${x.v}`).join(' · ');

  const body = `${leafHd(ctx, `${esc(쓸아이.nm)}의 ${esc(TODAY.short)} 하루 체크 — 세 가지를 고르면 아래 요약 문장이 따라 바뀝니다`,
    btn('알림장 작성으로', { href: 'NW0101', cls: 'btn-ghost' }))}

${card('오늘 하루 체크', `
  <div class="g3">
    ${항목.map((x) => `<div class="box">
      <div class="t-card mb3">${x.ico} ${x.nm}</div>
      ${라디오3(x.k, x.v, 리빌)}
      <p class="t-sub mt3">${esc(x.d)}</p>
    </div>`).join('')}
  </div>
  <p class="hint">지금 <b>잘함 ${센다('잘함')}</b> · <b>보통 ${센다('보통')}</b> · <b class="dan">부진 ${센다('부진')}</b> — 세 항목 모두 골랐습니다.</p>`,
    { cls: 'mt8' })}

<div id="badMemo" class="mt6">
  ${box(`<div class="t-card">«부진»으로 고른 항목이 있어요 — 무슨 일이 있었는지 짧게 적어 주세요</div>
    <p class="t-sub mt2">지금 부진: <b>${부진들.map((x) => esc(x.nm)).join(' · ')}</b>. 이 메모는 알림장 본문 아래에 그대로 나갑니다.</p>
    ${textarea({ ph: '예: 낮잠 시간에 옆 반 소리에 두 번 깼어요. 오후에는 잘 쉬었습니다.', attr: ' style="min-height:100px"' })}
    <p class="hint">세 항목을 모두 「잘함·보통」으로 바꾸면 이 칸은 저절로 닫힙니다.</p>`, { cls: 'dan' })}
</div>

${card('알림장 본문에 넣을 것', `
  <div class="stack" data-pick-scope="into" style="gap:var(--sp-item)">
    ${항목.map((x) => check(`${x.ico} ${x.nm} 결과 <b>${x.v}</b>`, { on: true, sub: esc(x.d) })).join('')}
  </div>
  <p class="hint"><b data-pick-out="into">${항목.length}</b>가지를 본문에 넣습니다. 하나도 안 고르면 아래 단추가 잠깁니다.</p>
  <div class="btns mt4">
    ${btn('요약 문장 만들어 본문에 넣기', {
    id: 'sumBtn', cls: 'btn-pri',
    attr: ` data-pick-btn="into" data-phrase="오늘은 ${esc(요약문)}이었어요."`,
  })}
  </div>`, { cls: 'mt6' })}

${card('하루 요약', `
  ${textarea({ ph: '위 단추를 누르면 체크 결과가 이 자리에 문장으로 들어옵니다.', attr: ' data-note-text style="min-height:120px"' })}
  <p class="hint">지금 <b data-note-len>0</b>자</p>`, { cls: 'mt6' })}

${banner('info', '📋', `<b>세 가지는 보호자님이 알림장에서 가장 먼저 찾는 칸입니다.</b>
  <div class="t-sub mt2">「부진」이 하나라도 있으면 보호자 화면에서 그 줄만 색이 바뀌어 눈에 띕니다.</div>`,
    { cls: 'mt8', right: btn('보호자 화면 보기', { href: 'MY0501', cls: 'btn-sub', sm: true }) })}

<div class="btns mt8">
  ${btn('알림장 작성으로 돌아가기', { href: 'NW0101', cls: 'btn-ghost' })}
  ${btn('특이사항 강조 입력', { href: 'NW0104', cls: 'btn-sub' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   NW0104 알림장 작성 > 특이사항 강조 입력
   ★ 강조를 켜면 붉은 상자와 «보호자 화면 미리보기»가 함께 열린다(data-open).
   ============================================================ */
P['NW0104'] = (ctx) => {
  const 특이 = '오후 마당 놀이 중에 오른쪽 뒷발을 잠깐 절었어요. 바로 쉬게 했고 지금은 평소처럼 걷습니다. 집에서 한 번 더 봐 주세요.';

  const body = `${leafHd(ctx, `${esc(쓸아이.nm)}의 ${esc(TODAY.short)} 알림장 — 강조를 켠 상태입니다`,
    btn('알림장 작성으로', { href: 'NW0101', cls: 'btn-ghost' }))}

${card('특이사항', `
  <div class="row-b">
    <div><div class="t-card">오늘 다치거나 아팠던 일이 있나요?</div>
      <div class="t-sub mt1">켜면 알림장에 붉은 상자로 강조돼 나가고, 보호자 화면 맨 위로 올라갑니다</div></div>
    ${toggle(true, '특이사항 강조를 껐다 켰어요 — 아래 미리보기에서 확인해 주세요', ' data-open="spBox"')}
  </div>
  <div id="spBox" class="mt6">
    ${box(`<div class="t-card mb3">보호자에게 그대로 나가는 글</div>
      ${textarea({ v: 특이, attr: ' style="min-height:110px"' })}
      <p class="hint">짧게, 무슨 일이 있었고 지금은 어떤지까지 적어 주세요. 보호자님이 가장 먼저 읽습니다.</p>`, { cls: 'dan' })}

    ${sec('보호자 화면에는 이렇게 보입니다', `${box(`
      <div class="t-sub mb4">알림장 상세 · 특이사항 강조 (MY0505) 미리보기</div>
      <div class="pc-note" style="pointer-events:none">
        <div class="thumb">${ph(['알림장 대표 사진', 800, 600], { seed: 'nw104', cls: 'ph-card' })}</div>
        <div class="bd">
          <div class="dt">${esc(TODAY.label)} · ${esc(쓸아이.nm)} · 담당 ${esc(담당(쓸아이))}</div>
          <div class="mt3">${banner('dan', '🔎', `<b>확인해 주세요</b><div class="mt2">${esc(특이)}</div>`)}</div>
          <div class="sum mt3">${esc(PHRASES[0])}</div>
        </div>
      </div>
      <p class="hint">강조를 끄면 이 붉은 상자가 사라지고 하루 요약만 나갑니다.</p>`)}`,
    { cls: 'mt6' })}

    ${sec('관련 건강기록에 함께 남기시겠어요?', `${banner('warn', '🩺',
    `<b>다친 일로 보이면 알림장만으로는 부족합니다.</b>
      <div class="t-sub mt2">「사고·특이사항 기록」에 남기면 보호자 연락 절차와 협력 병원 이송 기록이 함께 돕니다.
      ${esc(SITE.vet.nm)} 까지 ${esc(SITE.vet.dist)} 입니다.</div>`,
    {
      right: `${btn('사고·특이사항 기록으로', { href: 'HL0301', cls: 'btn-dan', sm: true })}
              ${btn('건강기록 보기', { href: 'HL0201', cls: 'btn-sub', sm: true })}`,
    })}`, { cls: 'mt6' })}
  </div>`, { cls: 'mt8' })}

${banner('info', '🔴', `<b>강조는 아껴 쓸수록 세게 들립니다.</b>
  <div class="t-sub mt2">매일 붉은 상자가 나가면 보호자님이 곧 지나칩니다. 정말 확인이 필요한 날에만 켜 주세요.</div>`,
    { cls: 'mt8' })}

<div class="btns mt8">
  ${btn('알림장 작성으로 돌아가기', { href: 'NW0101', cls: 'btn-ghost' })}
  ${btn('복용약 급여 확인', { href: 'NW0105', cls: 'btn-sub' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   NW0105 알림장 작성 > 복용약 급여 확인
   ★ 그 아이에게 등록된 약이 있을 때만 이 칸이 뜬다.
   ============================================================ */
P['NW0105'] = (ctx) => {
  /* 보호자가 반려견 등록(PL0301 「복용 중인 약」)에 적어 둔 것. 말은 그 화면에 쓰인 것을 그대로 쓴다. */
  const 약목록 = [{ nm: '관절 영양제', when: '점심(12:30)', how: '사료에 섞어서 반 알' }];
  const 약 = 약목록[0];

  const body = `${leafHd(ctx, `${esc(쓸아이.nm)}에게 등록된 약이 있어 급여 확인 칸이 저절로 열렸습니다`,
    btn('알림장 작성으로', { href: 'NW0101', cls: 'btn-ghost' }))}

${banner('warn', '💊', `<b>${esc(조사(쓸아이.nm,'은','는'))} 원에서 먹여야 하는 약이 ${약목록.length}가지 있습니다.</b>
  <div class="t-sub mt2">보호자가 반려견 등록의 「건강·특이사항」에 적어 둔 것입니다. 약이 없는 아이에게는 이 칸이 아예 나오지 않습니다.</div>`,
    { cls: 'mt8', right: btn('등록 내용 보기', { href: 'PL0303', cls: 'btn-sub', sm: true }) })}

${card('오늘 급여 확인', `
  ${kv([
    ['약 이름', `<b>${esc(약.nm)}</b>`],
    ['급여 시간', esc(약.when)],
    ['먹이는 법', esc(약.how)],
    ['적어 주신 분', `보호자 ${esc(쓸아이.guardian)} 님`],
  ], { cls: 'left' })}
  <div class="mt6 stack" data-pick-scope="med" style="gap:var(--sp-item)">
    ${check(`${esc(약.when)} <b>${esc(약.nm)}</b> — 먹였어요`, { sub: '체크해야 알림장을 저장할 수 있습니다' })}
  </div>
  <p class="hint">지금 <b data-pick-out="med">0</b>가지를 확인했습니다. 아직 체크하지 않아 아래 단추가 잠겨 있어요.</p>
  <div class="mt6">
    ${field('먹이지 못했다면 까닭', select(['먹였어요', '먹이지 못했어요'], 0,
    { attr: ' data-reveal-when="먹이지 못했어요" data-reveal-box="medWhy"' }),
    { hint: '「먹이지 못했어요」를 고르면 까닭 칸이 열립니다' })}
    ${field('무슨 일이 있었나요', textarea({ ph: '예: 사료를 남겨서 약을 함께 먹이지 못했습니다. 보호자께 전화로 알렸어요.' }), { id: 'medWhy', hide: true })}
  </div>
  <div class="btns mt6">
    ${btn('급여 확인하고 알림장에 넣기', {
    id: 'medBtn', cls: 'btn-pri', off: true,
    attr: ' data-pick-btn="med" data-toast="급여 확인을 알림장에 넣었어요 — 보호자 화면에도 그대로 나갑니다"',
  })}
    ${btn('보호자에게 먼저 여쭤보기', { href: 'HL0401', cls: 'btn-ghost' })}
  </div>`, { cls: 'mt6' })}

${card('오늘 하루 급여 기록', timeline([
    { hh: 쓸아이.inAt, t: '등원 · 보호자에게서 약 받음', d: `${esc(약.nm)} 반 알. 이름표를 붙여 약통에 넣었습니다.`, k: 'done' },
    { hh: '12:30', t: '점심 · 급여', d: '사료에 섞어서 먹입니다. 먹였으면 위 칸에 체크해 주세요.', k: 'on' },
    { hh: SITE.close, t: '하원 · 남은 약 돌려드림', d: '남은 약은 보호자께 그대로 돌려드립니다.' },
  ]), { cls: 'mt6' })}

${banner('info', '📌', `<b>약을 먹는 아이도 맡길 수 있습니다.</b>
  <div class="t-sub mt2">보호자가 약 이름과 급여 시간을 적어 두면 보육교사가 그 시간에 챙기고, 먹인 사실을 알림장으로 돌려드립니다.</div>`,
    { cls: 'mt8' })}

<div class="btns mt8">
  ${btn('알림장 작성으로 돌아가기', { href: 'NW0101', cls: 'btn-ghost' })}
  ${btn('사진 첨부하러 가기', { href: 'NW0201', cls: 'btn-pri' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   NW0202 사진 첨부 > 대표 사진 지정
   ★ ★를 누르면 대표가 «진짜로» 옮겨 가고 딱지 번호가 다시 매겨진다.
   ============================================================ */
P['NW0202'] = (ctx) => {
  const 장수 = 6;
  const 대표 = 2;   /* 세 번째 사진을 대표로 옮겨 둔 상태 */

  const body = `${leafHd(ctx, `${esc(사진아이.nm)}의 ${esc(TODAY.short)} 알림장 — ${대표 + 1}번째 사진을 대표로 옮긴 상태입니다`,
    btn('사진 첨부로', { href: 'NW0201', cls: 'btn-ghost' }))}

${banner('info', '⭐', `<b>대표 사진 한 장이 알림장함 목록의 얼굴이 됩니다.</b>
  <div class="t-sub mt2">보호자님은 목록에서 이 한 장만 보고 들어옵니다. 눈이 또렷하게 나온 사진을 고르세요.</div>`,
    { cls: 'mt8' })}

${card('올린 사진', `
  ${사진칸(장수, 대표, 'nw202')}
  <p class="hint">지금 <b data-shot-n>${장수}</b>장 · 다른 사진의 ★를 누르면 대표가 그리로 옮겨 가고, 딱지 번호가 다시 매겨집니다.</p>
  <div hidden data-shot-warn class="mt4">
    ${banner('warn', '📷', '<b>사진이 3장 미만이면 알림장이 허전해 보여요.</b><div class="t-sub mt2">막지는 않습니다 — 오늘 사진이 적었다면 그대로 보내셔도 됩니다.</div>')}
  </div>`, { cls: 'mt6' })}

${sec('대표를 바꾸면 여기가 함께 바뀝니다', `<div class="g2">
  ${box(`<div class="t-sub mb3">① 보호자의 알림장함 목록</div>
    <div class="pc-note" style="pointer-events:none">
      <div class="thumb">${ph(['대표 사진', 800, 600], { seed: `nw202-${대표}`, cls: 'ph-card' })}</div>
      <div class="bd"><div class="dt">${esc(TODAY.label)} · ${esc(사진아이.nm)} · 사진 ${장수}장</div>
        <div class="sum">오늘 하루 이야기를 사진과 함께 보내드렸어요.</div></div>
    </div>`)}
  ${box(`<div class="t-sub mb3">② 카카오톡 알림 미리보기</div>
    <div class="row wrap-row">
      ${phFix(['대표 사진', 800, 600], 96, { seed: `nw202-${대표}` })}
      <div class="grow"><div class="t-card">${esc(SITE.name)}</div>
        <p class="t-sub mt2">${esc(조사(사진아이.nm, '이의', '의'))} 오늘 알림장이 도착했어요. 눌러서 사진 ${장수}장을 보세요.</p></div>
    </div>`)}
</div>`, { cls: 'mt8' })}

${sec('알림장 상세에서는 첫 장이 크게 들어갑니다', `${box(`
  <div class="t-sub mb4">보호자 화면 미리보기 — 대표 사진이 맨 앞에 옵니다</div>
  ${gal(장수, 'nw202-preview')}`)}`, { cls: 'mt8' })}

<div class="btns mt8">
  ${btn('사진 첨부로 돌아가기', { href: 'NW0201', cls: 'btn-ghost' })}
  ${btn('순서 변경', { href: 'NW0203', cls: 'btn-sub' })}
  ${btn('발송하러 가기', { href: 'NW0301', cls: 'btn-pri' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   NW0203 사진 첨부 > 순서 변경
   ============================================================ */
P['NW0203'] = (ctx) => {
  const 장수 = 6;

  const body = `${leafHd(ctx, `${esc(사진아이.nm)}의 ${esc(TODAY.short)} 알림장 — 카드를 끌어다 놓으면 차례가 바뀝니다`,
    btn('사진 첨부로', { href: 'NW0201', cls: 'btn-ghost' }))}

${card('올린 사진 차례', `
  ${사진칸(장수, 0, 'nw203')}
  <p class="hint">지금 <b data-shot-n>${장수}</b>장 · 카드를 끌어다 다른 카드 위에 놓으면 그 자리로 끼어 들어갑니다. 딱지 번호가 바로 다시 매겨져요.</p>
  <div hidden data-shot-warn class="mt4">
    ${banner('warn', '📷', '<b>사진이 3장 미만이면 알림장이 허전해 보여요.</b><div class="t-sub mt2">막지는 않습니다 — 오늘 사진이 적었다면 그대로 보내셔도 됩니다.</div>')}
  </div>
  <div class="btns mt4">
    ${btn('찍은 시각 순서로 되돌리기', { cls: 'btn-sub', sm: true, attr: ' data-toast="사진을 찍은 시각 순서로 되돌렸어요"' })}
    ${btn('끌기가 잘 안 되나요?', { cls: 'btn-ghost', sm: true, attr: ' data-more-toggle="dragHelp" data-more-label="끌기가 잘 안 되나요? ▾"' })}
  </div>
  <div hidden data-more-body="dragHelp" class="mt4">
    ${box(`<div class="t-card mb2">태블릿에서 끌 때</div>
      <p class="t-sub">사진을 한 번 «길게» 누른 뒤 손을 떼지 말고 옮겨 주세요. 손가락이 카드 밖으로 나가면 놓친 것으로 봅니다.
      차례가 꼭 맞지 않아도 괜찮습니다 — 보호자님은 대표 사진과 전체 장수를 먼저 봅니다.</p>`)}
  </div>`, { cls: 'mt8' })}

${sec('차례를 바꾸면 보호자 화면이 이렇게 바뀝니다', `${box(`
  <div class="t-sub mb4">알림장 상세 미리보기 — 첫 장이 두 칸을 먹습니다</div>
  ${gal(장수, 'nw203')}`)}`, { cls: 'mt8' })}

${banner('info', '🖐️', `<b>차례를 정하는 요령</b>
  <div class="t-sub mt2">① 얼굴이 또렷한 한 장을 맨 앞에 ② 친구들과 어울린 장면 ③ 밥·낮잠처럼 하루가 보이는 장면.
  이 차례로 두면 보호자님이 하루를 읽듯 넘겨 보게 됩니다.</div>`, { cls: 'mt8' })}

<div class="btns mt8">
  ${btn('사진 첨부로 돌아가기', { href: 'NW0201', cls: 'btn-ghost' })}
  ${btn('대표 사진 지정', { href: 'NW0202', cls: 'btn-sub' })}
  ${btn('발송하러 가기', { href: 'NW0301', cls: 'btn-pri' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   NW0204 사진 첨부 > 용량 초과 자동 압축
   ⚠ 합계는 손으로 적지 않는다 — 아래 reduce 로 센다.
   ============================================================ */
P['NW0204'] = (ctx) => {
  const 한도 = 10;                       /* 부모 NW0201 이 적어 둔 「한 장에 10MB 까지」 */
  const 파일 = [
    { nm: 'IMG_2841.jpg', mb: 12.4 },
    { nm: 'IMG_2842.jpg', mb: 3.1 },
    { nm: 'IMG_2846.jpg', mb: 11.8 },
    { nm: 'IMG_2850.jpg', mb: 4.6 },
  ].map((f) => ({ ...f, 넘침: f.mb > 한도, 후: f.mb > 한도 ? Math.round(f.mb * 0.29 * 10) / 10 : f.mb }));
  const 넘친것 = 파일.filter((f) => f.넘침);
  const 전 = 파일.reduce((s, f) => s + f.mb, 0);
  const 후 = 파일.reduce((s, f) => s + f.후, 0);
  const 줄인율 = Math.round((1 - 후 / 전) * 100);
  const mb = (n) => `${n.toFixed(1)}MB`;

  const body = `${leafHd(ctx, `방금 고른 사진 ${파일.length}장 중 ${넘친것.length}장이 한 장 ${한도}MB 를 넘어 저절로 줄였습니다`,
    btn('사진 첨부로', { href: 'NW0201', cls: 'btn-ghost' }))}

${banner('ok', '🗜️', `<b>${넘친것.length}장을 자동으로 줄였습니다 — 다시 올리지 않으셔도 됩니다.</b>
  <div class="t-sub mt2">긴 쪽 1600px 로 줄이고 화질은 그대로 둡니다. 알림장에서 보이는 크기로는 차이가 나지 않아요.</div>`,
    { cls: 'mt8' })}

<div class="g3 mt6">
  ${stat('원본 합계', mb(전), { ico: '📦', d: `${파일.length}장을 그대로 올렸다면` })}
  ${stat('압축 후 합계', mb(후), { ico: '✅', cls: 'ok', d: `${줄인율}% 줄었어요` })}
  ${stat('줄인 사진', 넘친것.length, { ico: '🗜️', u: '장', cls: 'warn', d: `한 장 ${한도}MB 를 넘긴 것만` })}
</div>

${card('무엇이 어떻게 줄었나', table(
    ['파일 이름', { t: '원본', cls: 'c' }, { t: '압축 후', cls: 'c' }, { t: '', cls: 'c' }],
    파일.map((f) => ({
      cls: f.넘침 ? 'bad' : '',
      cells: [
        { t: `<b>${esc(f.nm)}</b>`, cls: 'nowrap' },
        { t: `<span class="num">${mb(f.mb)}</span>`, cls: 'c nowrap' },
        { t: `<span class="num${f.넘침 ? ' ok' : ''}">${mb(f.후)}</span>`, cls: 'c nowrap' },
        { t: f.넘침 ? badge(`자동 압축 · ${Math.round((1 - f.후 / f.mb) * 100)}% 줄임`, 'b-acc') : badge('그대로', 'b-mut'), cls: 'c' },
      ],
    })),
    {
      foot: ['합계', { t: mb(전), cls: 'c' }, { t: mb(후), cls: 'c' }, { t: `${줄인율}% 줄었어요`, cls: 'c' }],
    },
  ), { cls: 'mt6' })}

${card('압축한 사진 미리보기', `
  ${사진칸(파일.length, 0, 'nw204')}
  <p class="hint">지금 <b data-shot-n>${파일.length}</b>장 · 줄인 뒤에도 ★로 대표를 정하고 ✕로 지울 수 있습니다.</p>
  <div hidden data-shot-warn class="mt4">
    ${banner('warn', '📷', '<b>사진이 3장 미만이면 알림장이 허전해 보여요.</b><div class="t-sub mt2">막지는 않습니다 — 오늘 사진이 적었다면 그대로 보내셔도 됩니다.</div>')}
  </div>
  <div class="mt6">
    ${uploadDrop('사진을 더 올리시겠어요? 눌러서 고르세요 (여러 장 한 번에 가능)')}
    <p class="hint">한 장에 ${한도}MB 까지. 그보다 크면 지금처럼 저절로 줄여서 올립니다.</p>
  </div>`, { cls: 'mt6' })}

${banner('info', '📱', `<b>요즘 휴대전화 사진은 한 장에 ${한도}MB 를 자주 넘습니다.</b>
  <div class="t-sub mt2">그래서 막지 않고 줄여서 받습니다. 원본이 필요하시면 압축 없이 보관해 두었다가 따로 보내드릴 수 있어요.</div>`,
    { cls: 'mt8' })}

<div class="btns mt8">
  ${btn('사진 첨부로 돌아가기', { href: 'NW0201', cls: 'btn-ghost' })}
  ${btn('발송하러 가기', { href: 'NW0301', cls: 'btn-pri' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   NW0205 사진 첨부 > 최소 장수 안내
   ★ 권장 3장에 모자라면 발송 단추가 «실제로» 잠긴다.
     다만 막는 것이 목적은 아니다 — 「이대로 보낼게요」를 체크하면 풀린다(data-unlock).
   ============================================================ */
P['NW0205'] = (ctx) => {
  const 권장 = 3;
  const 장수 = 2;
  const 모자란 = 권장 - 장수;

  const body = `${leafHd(ctx, `${esc(사진아이.nm)}의 ${esc(TODAY.short)} 알림장 — 권장 ${권장}장에 ${모자란}장이 모자랍니다`,
    btn('사진 첨부로', { href: 'NW0201', cls: 'btn-ghost' }))}

${banner('warn', '📷', `<b>지금 ${장수}장입니다. ${모자란}장만 더 있으면 알림장이 훨씬 든든해 보여요.</b>
  <div class="t-sub mt2">막으려는 것이 아닙니다. 오늘 사진이 적었다면 아래에서 「이대로 보낼게요」를 체크하고 그대로 보내시면 됩니다.</div>`,
    { cls: 'mt8' })}

${card('올린 사진', `
  ${사진칸(장수, 0, 'nw205')}
  <p class="hint">지금 <b data-shot-n>${장수}</b>장 / 권장 ${권장}장</p>
  <div data-shot-warn class="mt4">
    ${banner('warn', '📷', `<b>사진이 ${권장}장 미만이면 알림장이 허전해 보여요.</b>
      <div class="t-sub mt2">사진을 지우거나 더 올리면 이 안내가 저절로 사라지거나 다시 나타납니다.</div>`)}
  </div>`, { cls: 'mt6' })}

${card('보호자 화면에서는 이렇게 보입니다', `
  <div class="g2">
    ${box(`<div class="t-sub mb3">지금 (${장수}장)</div>${gal(장수, 'nw205-now')}
      <p class="t-sub mt3">아래가 비어 보입니다.</p>`)}
    ${box(`<div class="t-sub mb3">${권장}장일 때</div>${gal(권장, 'nw205-want')}
      <p class="t-sub mt3">첫 장이 크게 들어가고 아래가 채워집니다.</p>`)}
  </div>`, { cls: 'mt6' })}

${card('그래도 이대로 보내시겠어요?', `
  <p class="t-sub mb4">권장 장수에 모자라면 발송 단추를 한 번 잠가 둡니다. 실수로 한 장짜리 알림장을 보내는 일을 막으려는 것뿐이에요.</p>
  ${check(`사진이 적어도 괜찮아요 — <b>${esc(사진아이.nm)}</b>의 알림장을 이대로 보낼게요`, {
    sub: '체크하면 아래 발송 단추가 열립니다',
    attr: ' data-unlock="toSend"',
  })}
  <div class="btns mt6">
    ${btn('사진 더 올리러 가기', { href: 'NW0201', cls: 'btn-ghost' })}
    ${btn('이대로 발송 관리로', { id: 'toSend', off: true, cls: 'btn-pri', href: 'NW0301' })}
  </div>`, { cls: 'mt6' })}

<div class="btns mt8">
  ${btn('사진 첨부로 돌아가기', { href: 'NW0201', cls: 'btn-ghost' })}
  ${btn('알림장 다시 쓰기', { href: 'NW0101', cls: 'btn-sub' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   NW0302 발송 관리 > 미작성만 보기
   ⛔ 거르는 단추가 켜짐 표시만 바뀌고 목록은 그대로면 안 된다.
     칩(data-filter-for) + 줄마다 data-tag + data-filter-cnt + data-empty-for 로
     개수가 «실제로» 줄게 한다. 「전체 보기」가 든 묶음이라 둘이 동시에 켜지지 않는다.
   ============================================================ */
P['NW0302'] = (ctx) => {
  /* ⚠ 「전체」 칩의 «글자»가 정확히 '전체 보기' 여야 app.js 가 이 묶음을 «하나만 켜지는» 묶음으로 본다.
     여기에 숫자를 붙이면 둘이 동시에 켜지고, 눌러도 목록이 안 줄어든다. */
  const 칩 = [
    ['전체 보기', '전체', NOTE_CNT.전체],
    ['아직 안 보낼 것 (미작성·작성중)', '안끝남', 안끝난목록.length],
    ['미작성만', '미작성', NOTE_CNT.미작성],
    ['작성완료만', '작성완료', NOTE_CNT.작성완료],
  ];
  const 켠칩 = 1;                       /* 「아직 안 보낼 것」이 켜진 상태로 연다 */
  const 남는 = 안끝난목록;              /* 그래서 이 목록만 보인다 */

  const body = `${leafHd(ctx, `${esc(TODAY.label)} · 작성완료 ${NOTE_CNT.작성완료}건을 숨기고 ${남는.length}건만 보고 있습니다`,
    btn('발송 관리로', { href: 'NW0301', cls: 'btn-ghost' }))}

<div class="g4 mt8">
  ${stat('미작성', NOTE_CNT.미작성, { ico: '✍️', u: '건', cls: 'dan', d: '아직 손대지 않은 알림장' })}
  ${stat('작성중', NOTE_CNT.작성중, { ico: '📝', u: '건', cls: 'warn', d: '임시 저장해 둔 것' })}
  ${stat('작성완료', NOTE_CNT.작성완료, { ico: '✅', u: '건', cls: 'ok', d: '지금은 숨겨 놓고 보는 중' })}
  ${stat('오늘 등원', NOTE_CNT.전체, { ico: '🐾', u: '마리', d: '알림장을 써야 하는 전체' })}
</div>

${card('무엇만 볼까요', `
  <div class="chips" data-filter-for="send">
    ${칩.map(([t, tag, n], i) => chip(i === 0 ? t : `${t} ${n}`, i === 켠칩, ` data-tag="${esc(tag)}"`)).join('')}
  </div>
  <p class="hint">지금 <b data-filter-cnt="send">${남는.length}</b>마리를 보고 있어요 ·
    그중 미작성 <b class="dan" data-cnt-tag-for="send" data-cnt-tag="미작성">${NOTE_CNT.미작성}</b>건.
    단추를 누르면 아래 목록이 실제로 줄어듭니다.</p>`, { cls: 'mt8' })}

<div data-filter-list="send" class="mt6">
${table(
    ['이름', '반', '하원', { t: '작성 상태', cls: 'c' }, { t: '', cls: 'c' }],
    CAME.map((d) => {
      const st = 상태(d);
      const 숨김 = st === '작성완료';
      return {
        attr: ` data-tag="${st}${st === '작성완료' ? '' : ' 안끝남'}"${숨김 ? ' data-out-chip="1" hidden' : ''}`,
        cells: [
          { t: `<b>${esc(d.nm)}</b>`, cls: 'nowrap' },
          esc(CLS(d.cls).nm),
          { t: d.outAt ? `<b class="num">${d.outAt}</b>` : '<span class="muted">재원 중</span>', cls: 'nowrap' },
          { t: stBadge(st), cls: 'c' },
          {
            t: btn(st === '미작성' ? '쓰기' : (st === '작성중' ? '이어서 쓰기' : '다시 열기'),
              { href: 'NW0101', cls: st === '미작성' ? 'btn-pri' : 'btn-ghost', sm: true }),
            cls: 'c',
          },
        ],
      };
    }),
  )}
</div>
<div hidden data-empty-for="send">${empty('🎉', '결과가 없습니다',
    '고르신 조건에 남는 아이가 없어요. 위 「전체 보기」를 누르면 오늘 등원한 ' + NOTE_CNT.전체 + '마리가 모두 다시 나옵니다.',
    btn('일괄 발송 확인으로', { href: 'NW0303', cls: 'btn-pri' }))}</div>

${banner('info', '🧹', `<b>하루를 마무리할 때는 이 상태로 두고 씁니다.</b>
  <div class="t-sub mt2">작성완료를 숨겨 두면 남은 ${남는.length}건만 보입니다. 다 쓰고 나면 목록이 비고 「결과가 없습니다」가 뜹니다.</div>`,
    { cls: 'mt8' })}

<div class="btns mt8">
  ${btn('발송 관리로 돌아가기', { href: 'NW0301', cls: 'btn-ghost' })}
  ${btn('일괄 발송 확인', { href: 'NW0303', cls: 'btn-pri' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   NW0303 발송 관리 > 일괄 발송 확인
   ⛔ 브라우저 붙박이 확인창 금지 — app.js 의 data-bulk-send 가 직접 만든 모달을 띄운다.
     「몇 마리에게 보내는지」가 아래 목록 개수와 정확히 같아야 한다.
   ============================================================ */
P['NW0303'] = (ctx) => {
  const 보낼것 = 완료목록;                                   /* 9건 */
  const 뺄것 = [...작성중목록, ...미작성목록];               /* 2 + 5 = 7건 */
  const 합 = 보낼것.length + 뺄것.length;                    /* 반드시 오늘 등원한 수와 같다 */

  const body = `${leafHd(ctx, `${esc(TODAY.label)} · 오늘 등원한 ${NOTE_CNT.전체}마리 가운데 ${보낼것.length}건을 지금 보냅니다`,
    btn('발송 관리로', { href: 'NW0301', cls: 'btn-ghost' }))}

${card('보내기 전에 한 번만 확인해 주세요', `
  <div class="row-b wrap-row">
    <div>
      <div class="t-page">보낼 알림장 <b class="pri">${보낼것.length}</b>건</div>
      <div class="t-sub mt2">보호자에게 카카오톡으로 나갑니다. 보내고 나면 글과 사진을 고칠 수 없어요.</div>
      <div class="t-sub mt1">제외 ${뺄것.length}건 (작성중 ${작성중목록.length} · 미작성 ${미작성목록.length}) — 합계 ${합}건 = 오늘 등원 ${NOTE_CNT.전체}마리</div>
    </div>
    ${btn(`작성 완료된 알림장 ${보낼것.length}건 일괄 발송`, {
    cls: 'btn-pri', lg: true, id: 'bulkBtn', attr: ` data-bulk-send="${보낼것.length}"`,
  })}
  </div>
  <div class="btns mt6">
    ${btn(`제외되는 ${뺄것.length}건 보기`, { cls: 'btn-sub', attr: ' data-modal="mSkip"' })}
    ${btn('미작성만 보기', { href: 'NW0302', cls: 'btn-ghost' })}
  </div>`, { cls: 'mt8' })}

${sec(`지금 보낼 ${보낼것.length}건`, table(
    ['이름', '반', '하원', { t: '작성 상태', cls: 'c' }, { t: '발송', cls: 'c' }],
    보낼것.map((d) => ({
      cls: d.id === 실패아이.id ? 'bad' : '',
      cells: [
        { t: `<b>${esc(d.nm)}</b>`, cls: 'nowrap' },
        esc(CLS(d.cls).nm),
        { t: d.outAt ? `<b class="num">${d.outAt}</b>` : '<span class="muted">재원 중</span>', cls: 'nowrap' },
        { t: `<span class="badge b-ok" data-note-st="작성완료">작성완료</span>`, cls: 'c' },
        {
          t: d.id === 실패아이.id
            ? badge('앞서 실패 · 이번에 다시 보냅니다', 'b-dan')
            : '<span class="muted">대기</span>',
          cls: 'c',
        },
      ],
    })),
  ), { cls: 'mt8', desc: `보내고 나면 위 배지가 「발송완료」로 바뀝니다. ${esc(조사(실패아이.nm,'은','는'))} 앞서 연락처 오류로 한 번 실패해 이번 ${보낼것.length}건에 함께 들어갑니다.` })}

${banner('warn', '⏰', `<b>지금 안 보내도 18:30에 저절로 나갑니다.</b>
  <div class="t-sub mt2">그때까지 작성이 끝난 것만 나가고, 미작성 ${미작성목록.length}건은 다음 날로 넘어가지 않고 그대로 남습니다.</div>`,
    { cls: 'mt8', right: btn('발송 예약 설정', { href: 'NW0304', cls: 'btn-sub', sm: true }) })}

<div class="btns mt8">
  ${btn('발송 관리로 돌아가기', { href: 'NW0301', cls: 'btn-ghost' })}
  ${btn('발송 이력 보기', { href: 'NW0401', cls: 'btn-sub' })}
</div>`;

  const after = modal('mSkip', `이번에 안 나가는 ${뺄것.length}건`, `
    <p class="t-sub">작성이 끝나지 않은 알림장은 보내지 않습니다. 하나씩 눌러 이어서 쓰실 수 있어요.</p>
    <div class="mt4">${table(
    ['이름', '반', { t: '작성 상태', cls: 'c' }],
    뺄것.map((d) => [
      { t: `<b>${esc(d.nm)}</b>`, cls: 'nowrap' },
      esc(CLS(d.cls).nm),
      { t: stBadge(상태(d)), cls: 'c' },
    ]),
  )}</div>`,
  `${btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' })}
   ${btn('미작성 이어서 쓰기', { href: 'NW0101', cls: 'btn-pri' })}`);

  return { body, o: { after } };
};

/* ============================================================
   NW0304 발송 관리 > 발송 예약 설정
   ★ 시각을 고르면 요약에 «그대로» 적힌다(data-start-sel → data-start-out).
   ★ 끄면 아래 설정 칸이 실제로 접힌다(data-open).
   ============================================================ */
P['NW0304'] = (ctx) => {
  const 시각 = ['17:30', '18:00', '18:30', '19:00', '19:30'];
  const 고른시각 = 2;                                        /* 18:30 — 부모 NW0301·FAQ 와 같은 값 */
  const 요일들 = ['월', '화', '수', '목', '금', '토'];        /* 일요일은 휴무라 아예 없다 */
  const 켠요일 = ['월', '화', '수', '목', '금'];

  const body = `${leafHd(ctx, `매일 ${시각[고른시각]}에 자동 발송이 켜져 있습니다 — 끄면 수동 발송만 나갑니다`,
    btn('발송 관리로', { href: 'NW0301', cls: 'btn-ghost' }))}

${card('매일 자동 발송', `
  <div class="row-b">
    <div><div class="t-card">그날 작성이 끝난 알림장을 정해진 시각에 한 번에 보냅니다</div>
      <div class="t-sub mt1">미작성은 다음 날로 넘어가지 않고 그대로 남습니다. 끄면 「일괄 발송」 단추로만 나갑니다.</div></div>
    ${toggle(true, '자동 발송 설정을 바꿨어요 — 아래 칸에서 확인해 주세요', ' data-open="schBox"')}
  </div>

  <div id="schBox" class="mt6">
    <div class="f2">
      ${field('보내는 시각', select(시각, 고른시각, { vals: 시각, attr: ' data-start-sel aria-label="자동 발송 시각"' }),
    { hint: '하원이 대개 18:00에 끝납니다. 그 뒤가 가장 좋아요' })}
      ${field('못 보낸 건은', select(['다음 날로 넘기지 않고 그대로 둡니다', '다음 날 아침에 다시 시도합니다'], 0))}
    </div>

    <div class="mt6">
      <div class="t-sub mb2"><b>보내는 요일</b> — ${esc(SITE.hours)}</div>
      <div class="chips" data-pick-scope="sch">
        ${요일들.map((d) => chip(d, 켠요일.includes(d), ` data-dow="${d}"`)).join('')}
      </div>
      <p class="hint">주 <b data-pick-out="sch">${켠요일.length}</b>일 자동 발송 · 일요일은 휴무라 목록에 없습니다.
        토요일은 17:00에 하원해서 아직 켜 두지 않았어요.</p>
    </div>

    ${box(`<div class="t-card">지금 설정</div>
      <p class="t-sub mt2">매주 ${esc(켠요일.join('·'))} · 매일 <b data-start-out>${시각[고른시각]}</b>에
        그때까지 작성이 끝난 알림장을 한 번에 보냅니다.</p>
      <p class="t-sub mt2">시각을 바꾸면 이 문장이 그 자리에서 따라 바뀝니다.</p>`, { cls: 'mt6' })}

    <div class="btns mt6">
      ${btn('이 설정으로 저장', {
    id: 'schSave', cls: 'btn-pri',
    attr: ' data-pick-btn="sch" data-notify="자동 발송 설정을 저장했어요 — 오늘 저녁부터 이 시각에 나갑니다" data-notify-once="저장했어요"',
  })}
      ${btn('지금 바로 한 번 보내기', { href: 'NW0303', cls: 'btn-ghost' })}
    </div>
    <p class="hint">요일을 하나도 안 고르면 저장 단추가 잠깁니다 — 그럴 땐 위 스위치를 끄는 것이 맞습니다.</p>
  </div>`, { cls: 'mt8' })}

${card('오늘 저녁에 나갈 것', `
  <div class="row-b wrap-row">
    <div><div class="t-card">${esc(TODAY.label)} <b data-start-out>${시각[고른시각]}</b></div>
      <div class="t-sub mt1">지금 작성완료 ${NOTE_CNT.작성완료}건 · 작성중 ${NOTE_CNT.작성중}건 · 미작성 ${NOTE_CNT.미작성}건</div></div>
    ${badge(`지금이면 ${NOTE_CNT.작성완료}건이 나갑니다`, 'b-acc')}
  </div>
  <p class="hint">${시각[고른시각]}까지 나머지 ${NOTE_CNT.미작성 + NOTE_CNT.작성중}건을 마치면 ${NOTE_CNT.전체}건이 모두 나갑니다.</p>`,
    { cls: 'mt6' })}

${banner('info', '🔕', `<b>끄면 어떻게 되나요?</b>
  <div class="t-sub mt2">저절로 나가는 것이 없어집니다. 매일 「발송 관리」에서 일괄 발송을 눌러 주셔야 해요.
  바쁜 날 잊기 쉬워서, 대부분의 원이 켜 두고 씁니다.</div>`, { cls: 'mt8' })}

<div class="btns mt8">
  ${btn('발송 관리로 돌아가기', { href: 'NW0301', cls: 'btn-ghost' })}
  ${btn('발송 실패 재시도', { href: 'NW0305', cls: 'btn-sub' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   NW0305 발송 관리 > 발송 실패 재시도
   ⚠ 오늘 실패는 부모 NW0301 의 지표(NOTE_CNT.실패)와 같고,
     지난 실패는 부모 NW0401 의 이력과 같다. 두 숫자를 따로 세어 합쳐 적는다.
   ============================================================ */
P['NW0305'] = (ctx) => {
  const 오늘실패 = NOTE_CNT.실패;
  const 지난실패 = 실패이력.length;
  const 모두실패 = 오늘실패 + 지난실패;
  /* 두 번 넘게 실패한 보호자 — 이력에서 이름이 겹치는지 «세어» 찾는다 */
  const 반복 = 실패이력.filter((r) => r.dog === '루키');

  const body = `${leafHd(ctx, `오늘 ${오늘실패}건 · 지난 이력 ${지난실패}건 — 모두 ${모두실패}건이 보호자에게 닿지 못했습니다`,
    btn('발송 관리로', { href: 'NW0301', cls: 'btn-ghost' }))}

<div class="g3 mt8">
  ${stat('오늘 실패', 오늘실패, { ico: '⚠️', u: '건', cls: 'dan', d: `${esc(TODAY.short)} 발송분` })}
  ${stat('지난 이력 실패', 지난실패, { ico: '📮', u: '건', cls: 'warn', d: '아직 다시 못 보낸 것' })}
  ${stat('모두', 모두실패, { ico: '🔁', u: '건', d: '재발송을 기다리는 알림장' })}
</div>

${card(`오늘 실패한 ${오늘실패}건`, table(
    ['반려견', '보호자', '반', { t: '까닭', cls: 'c' }, { t: '', cls: 'c' }],
    [{
      cls: 'bad',
      cells: [
        { t: `<b>${esc(실패아이.nm)}</b>`, cls: 'nowrap' },
        esc(실패아이.guardian),
        esc(CLS(실패아이.cls).nm),
        { t: badge('연락처 오류', 'b-dan'), cls: 'c' },
        { t: btn('재발송', { cls: 'btn-dan', sm: true, attr: ` data-resend="${esc(실패아이.nm)}"` }), cls: 'c' },
      ],
    }],
  ), {
    cls: 'mt6',
    ft: `<p class="t-sub">재발송을 누르면 그 자리에서 다시 보내고 배지가 「전달됨」으로 바뀝니다.
      번호가 바뀐 것이라면 먼저 반려견 프로필에서 연락처를 고쳐 주세요.</p>
      <div class="btns mt4">${btn('연락처 고치러 가기', { href: 'PL0401', cls: 'btn-sub', sm: true })}</div>`,
  })}

${card(`지난 이력에서 아직 못 보낸 ${지난실패}건`, table(
    ['발송 시각', '반려견', '보호자', { t: '결과', cls: 'c' }, { t: '', cls: 'c' }],
    실패이력.map((r) => ({
      cls: 'bad',
      cells: [
        { t: `<span class="num">${esc(r.t)}</span> <span class="t-sub">(${esc(r.dow)}·${r.지난}일 전)</span>`, cls: 'nowrap' },
        { t: `<b>${esc(r.dog)}</b>`, cls: 'nowrap' },
        esc(r.g),
        { t: stBadge(r.st), cls: 'c' },
        { t: btn('재발송', { cls: 'btn-dan', sm: true, attr: ` data-resend="${esc(r.dog)}"` }), cls: 'c' },
      ],
    })),
  ), { cls: 'mt6' })}

${banner('dan', '📵', `<b>${esc(조사(반복[0].dog,'은','는'))} ${반복.length + 1}번째 실패입니다 — 번호가 바뀐 것이 거의 확실합니다.</b>
  <div class="t-sub mt2">${esc(반복[0].t)} 알림장이 실패했고, 오늘 아침 08:10 백신 만료 안내도 같은 번호에서 실패했습니다.
  보호자 ${esc(반복[0].g)} 님께 다른 길로 연락해 새 번호를 여쭙고 프로필에서 고친 뒤 다시 보내 주세요.</div>`,
    {
      cls: 'mt8',
      right: `${btn('보호자 알림 이력', { href: 'HL0401', cls: 'btn-sub', sm: true })}
              ${btn('프로필에서 연락처 고치기', { href: 'PL0401', cls: 'btn-dan', sm: true })}`,
    })}

${card('실패는 대부분 이 셋 중 하나입니다', `
  ${kv([
    ['연락처 오류', '번호가 바뀌었거나 잘못 적혔습니다. 프로필에서 고친 뒤 다시 보냅니다.'],
    ['카카오톡 채널 차단', `보호자가 ${esc(SITE.kakao)} 채널을 차단했습니다. 문자로 길을 바꿔 보냅니다.`],
    ['일시 오류', '통신사 쪽 문제입니다. 재발송 한 번으로 대개 나갑니다.'],
  ], { cls: 'left' })}
  <div class="btns mt4">${btn('발송 채널 바꾸기', { href: 'HL0402', cls: 'btn-sub', sm: true })}</div>`,
    { cls: 'mt8' })}

<div class="btns mt8">
  ${btn('발송 관리로 돌아가기', { href: 'NW0301', cls: 'btn-ghost' })}
  ${btn('발송 이력 전체 보기', { href: 'NW0401', cls: 'btn-pri' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   NW0402 발송 이력 > 날짜 검색
   ⚠ 부모 NW0401 은 data-filter-sel="hist" 로 기간을 거른다. 줄마다 붙은 data-tag 가
     «상태 + 기간»을 한 칸에 담고 있으므로 여기서도 그대로 따르고, 날짜 한 칸만 더 얹는다.
     기간과 이름을 따로 적으면 눌러도 목록이 안 줄어든다.
   ⚠ 고른 날(8/21)만 보이는 상태로 열리므로, 안 맞는 줄은 처음부터 data-out-sel 로 접어 둔다.
   ============================================================ */
P['NW0402'] = (ctx) => {
  const 고른날 = 날짜들[0];                                   /* 2026-08-21 (금) */
  const 남는 = 이력.filter((r) => r.ymd === 고른날);
  const 남는실패 = 남는.filter((r) => r.st === '실패').length;
  const 보기 = (ymd) => `${ymd} (${요일[ymd.slice(5)]})`;

  const body = `${leafHd(ctx, `${보기(고른날)} 에 보낸 ${남는.length}건만 보고 있습니다 — 「전체 기간」을 고르면 ${이력.length}건이 모두 돌아옵니다`,
    btn('발송 이력으로', { href: 'NW0401', cls: 'btn-ghost' }))}

${card('언제 보낸 것을 찾으시나요', `
  <div class="filters">
    ${select(['전체 기간 (초기화)', ...날짜들.map(보기)], 1,
    { vals: ['전체', ...날짜들], attr: ' data-filter-sel="hist" aria-label="발송 날짜"' })}
    ${input({ ph: '반려견 이름으로 함께 찾기', cls: 'search', attr: ' data-search-for="hist"' })}
  </div>
  <p class="hint">고른 날짜와 이름은 «함께» 걸립니다 — 8월 21일을 고르고 「초코」를 적으면 그날 초코 것만 남습니다.</p>`,
    { cls: 'mt8' })}

<p class="t-sub mt6 mb4"><b data-filter-cnt="hist">${남는.length}</b>건 ·
  실패 <b class="dan" data-cnt-tag-for="hist" data-cnt-tag="실패">${남는실패}</b>건 ·
  ${esc(SITE.name)} 발송 이력</p>

<div data-filter-list="hist">
${table(
    ['발송 시각', '반려견', '보호자', { t: '결과', cls: 'c' }, { t: '읽은 시각', cls: 'c' }, '미리보기'],
    이력.map((r) => ({
      /* 상태 + 기간(최근7일·달·날짜)을 «한 칸»에 담는다 — 부모 NW0401 과 같은 규칙 */
      attr: ` data-tag="${r.st} 최근7일 ${r.ymd.slice(0, 7)} ${r.ymd}"${r.ymd === 고른날 ? '' : ' data-out-sel="1" hidden'}`,
      cls: r.st === '실패' ? 'bad' : '',
      cells: [
        { t: `<span class="num">${esc(r.t)}</span> <span class="t-sub">(${esc(r.dow)})</span>`, cls: 'nowrap' },
        { t: `<b>${esc(r.dog)}</b>`, cls: 'nowrap' },
        esc(r.g),
        { t: stBadge(r.st), cls: 'c' },
        { t: r.open ? `<span class="num ok">${esc(r.open)}</span>` : '<span class="muted">—</span>', cls: 'c nowrap' },
        { t: phFix(['알림장 대표 사진', 800, 600], 56, { seed: r.dog + r.t }), cls: 'nowrap' },
      ],
    })),
  )}
</div>
<div hidden data-empty-for="hist">${empty('🔍', '검색 결과가 없습니다',
    '고른 날짜에 「<b data-search-word="hist">—</b>」이(가) 든 알림장을 못 찾았어요. 이름을 짧게 적어 보시거나 기간을 「전체 기간」으로 넓혀 보세요.',
    btn('발송 이력 전체 보기', { href: 'NW0401', cls: 'btn-pri' }))}</div>

${card(`${보기(고른날)} 발송 요약`, `
  <div class="g3">
    ${stat('보낸 건수', 남는.length, { ico: '📮', u: '건', d: `${esc(남는[0].t.slice(6))} 에 한 번에 나갔습니다` })}
    ${stat('읽음', 남는.filter((r) => r.st === '읽음').length, { ico: '👀', u: '건', cls: 'ok', d: '보호자가 열어 봤어요' })}
    ${stat('실패', 남는실패, { ico: '⚠️', u: '건', cls: 'dan', d: '다시 보내야 합니다' })}
  </div>`, { cls: 'mt8' })}

${banner('info', '🗓️', `<b>${esc(SITE.hours)}</b>
  <div class="t-sub mt2">일요일과 공휴일에는 등원이 없어 발송 이력도 없습니다. 날짜 목록에 안 보이는 날이 그런 날이에요.</div>`,
    { cls: 'mt8' })}

<div class="btns mt8">
  ${btn('발송 이력으로 돌아가기', { href: 'NW0401', cls: 'btn-ghost' })}
  ${btn('열람 여부 확인', { href: 'NW0403', cls: 'btn-sub' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   NW0403 발송 이력 > 열람 여부 확인
   ★ 배지로 거르고, 오래 안 읽힌 것은 따로 세어 강조한다.
   ============================================================ */
P['NW0403'] = (ctx) => {
  const 오래 = 3;                                            /* 며칠 넘게 안 읽으면 강조하나 */
  const 오래안읽음 = 안읽음이력.filter((r) => r.지난 >= 오래);
  /* ⚠ 「전체」 칩의 글자는 정확히 '전체 보기' — 숫자를 붙이면 하나만 켜지는 묶음이 아니게 된다 */
  const 칩 = [
    ['전체 보기', '전체', 이력.length],
    ['읽음', '읽음', 읽음이력.length],
    ['안 읽음', '전달됨', 안읽음이력.length],
    ['실패', '실패', 실패이력.length],
  ];
  const 늦게연분 = 읽음이력.reduce((a, b) => (b.open > a.open ? b : a));

  const body = `${leafHd(ctx, `보낸 ${이력.length}건 가운데 ${읽음이력.length}건을 읽으셨습니다 — ${오래안읽음.length}건은 ${오래}일 넘게 그대로입니다`,
    btn('발송 이력으로', { href: 'NW0401', cls: 'btn-ghost' }))}

<div class="g4 mt8">
  ${stat('보낸 건수', 이력.length, { ico: '📮', u: '건', d: `${esc(날짜들[날짜들.length - 1])} ~ ${esc(날짜들[0])}` })}
  ${stat('읽음', 읽음이력.length, { ico: '👀', u: '건', cls: 'ok', d: `열람률 ${Math.round(읽음이력.length / 이력.length * 100)}%` })}
  ${stat('안 읽음', 안읽음이력.length, { ico: '📬', u: '건', cls: 'warn', d: '보내지긴 했어요' })}
  ${stat('실패', 실패이력.length, { ico: '⚠️', u: '건', cls: 'dan', d: '아예 닿지 못했습니다' })}
</div>

${안읽음이력.length ? banner('warn', '📬', `<b>${오래안읽음.map((r) => esc(r.dog)).join(' · ')} — ${오래}일 넘게 안 읽으셨어요.</b>
  <div class="t-sub mt2">${오래안읽음.map((r) => `${esc(r.dog)} ${esc(r.g)} 님 ${r.지난}일째`).join(' · ')}.
  알림이 꺼져 있거나 채널을 차단하신 경우가 많습니다. 하원할 때 한 번 여쭤 봐 주세요.</div>`,
    {
      cls: 'mt6',
      right: btn('안 읽은 분께 다시 알림', {
        cls: 'btn-sub', sm: true,
        attr: ` data-notify="안 읽은 ${안읽음이력.length}분께 다시 알림을 보냈어요" data-notify-once="다시 알렸어요"`,
      }),
    }) : ''}

${card('어떤 것만 볼까요', `
  <div class="chips" data-filter-for="hist">
    ${칩.map(([t, tag, n], i) => chip(i === 0 ? t : `${t} ${n}`, i === 0, ` data-tag="${esc(tag)}"`)).join('')}
  </div>
  <p class="hint">지금 <b data-filter-cnt="hist">${이력.length}</b>건을 보고 있어요 ·
    그중 실패 <b class="dan" data-cnt-tag-for="hist" data-cnt-tag="실패">${실패이력.length}</b>건.
    단추를 누르면 아래 목록이 실제로 줄어듭니다.</p>`, { cls: 'mt8' })}

<div data-filter-list="hist" class="mt6">
${table(
    ['발송 시각', '반려견', '보호자', { t: '열람 여부', cls: 'c' }, { t: '읽은 시각', cls: 'c' }, { t: '', cls: 'c' }],
    이력.map((r) => ({
      attr: ` data-tag="${r.st} 최근7일 ${r.ymd.slice(0, 7)} ${r.ymd}"`,
      cls: r.st === '실패' ? 'bad' : '',
      cells: [
        { t: `<span class="num">${esc(r.t)}</span> <span class="t-sub">(${esc(r.dow)})</span>`, cls: 'nowrap' },
        { t: `<b>${esc(r.dog)}</b>`, cls: 'nowrap' },
        esc(r.g),
        {
          t: r.st === '전달됨'
            ? `${stBadge('전달됨')} ${r.지난 >= 오래 ? badge(`${r.지난}일째 안 읽음`, 'b-warn') : ''}`
            : stBadge(r.st),
          cls: 'c',
        },
        { t: r.open ? `<span class="num ok">${esc(r.open)}</span>` : '<span class="muted">—</span>', cls: 'c nowrap' },
        {
          t: r.st === '실패'
            ? btn('재발송', { cls: 'btn-dan', sm: true, attr: ` data-resend="${esc(r.dog)}"` })
            : btn('내용 보기', { href: 'NW0404', cls: 'btn-ghost', sm: true }),
          cls: 'c',
        },
      ],
    })),
  )}
</div>
<div hidden data-empty-for="hist">${empty('🔍', '결과가 없습니다',
    '고르신 조건에 남는 것이 없어요. 위 「전체 보기」를 누르면 ' + 이력.length + '건이 모두 다시 나옵니다.',
    btn('발송 이력 전체 보기', { href: 'NW0401', cls: 'btn-pri' }))}</div>

${banner('info', '👀', `<b>「전달됨」과 「읽음」은 다릅니다.</b>
  <div class="t-sub mt2">전달됨은 보호자 휴대전화까지 갔다는 뜻이고, 읽음은 알림장을 실제로 열었다는 뜻입니다.
  읽으신 ${읽음이력.length}분 가운데 가장 늦게 여신 분은 ${esc(늦게연분.open)} 이었습니다. 저녁을 차리고 나서 여는 분이 많아, 발송이 늦어질수록 열람률이 떨어집니다.</div>`,
    { cls: 'mt8' })}

<div class="btns mt8">
  ${btn('발송 이력으로 돌아가기', { href: 'NW0401', cls: 'btn-ghost' })}
  ${btn('내용 미리보기', { href: 'NW0404', cls: 'btn-sub' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   NW0404 발송 이력 > 내용 미리보기
   ★ 그때 보낸 사진과 글을 모달로 그대로 다시 본다(U.modal + data-modal).
   ============================================================ */
P['NW0404'] = (ctx) => {
  const n = NOTES[0];                                        /* 2026-08-21 (금) 초코 — 이력 맨 윗줄과 같은 건 */
  const 줄 = 이력.find((r) => r.dog === n.dog && r.ymd === n.date);
  const 체크 = [['🍚 식사', n.meal], ['💩 배변', n.poop], ['😴 낮잠', n.nap]];

  const 미리보기 = `
    <div class="t-sub">${esc(n.date)} (${esc(n.dow)}) · ${esc(n.dog)} · 담당 ${esc(n.teacher)} · 등원 ${n.inAt} · 하원 ${n.outAt}</div>
    <div class="row wrap-row mt3">${badge(`오늘 컨디션 ${esc(n.cond)}`, 'b-acc')}${badge(`사진 ${n.pics}장`, 'b-line')}</div>
    <div class="mt4">${gal(n.pics, `nw404-${n.id}`)}</div>
    <p class="mt4">${esc(n.sum)}</p>
    <div class="mt4">${kv(체크.map(([k, v]) => [k, `<b>${esc(v)}</b>`]), { cls: 'left' })}</div>
    ${n.note ? `<div class="mt4">${banner('dan', '🔎', `<b>확인해 주세요</b><div class="mt2">${esc(n.note)}</div>`)}</div>` : ''}`;

  const body = `${leafHd(ctx, `${esc(줄.t)} 에 ${esc(줄.g)} 님께 보낸 ${esc(n.dog)}의 알림장을 그대로 다시 봅니다`,
    btn('발송 이력으로', { href: 'NW0401', cls: 'btn-ghost' }))}

${card('보낸 알림장', `
  <div class="row-b wrap-row">
    <div>
      <div class="t-card">${esc(n.date)} (${esc(n.dow)}) · ${esc(n.dog)}</div>
      <div class="t-sub mt1">보호자 ${esc(줄.g)} 님 · ${esc(줄.t)} 발송 · ${줄.지난}일 전</div>
    </div>
    <div class="btns">
      ${stBadge(줄.st)}
      ${줄.open ? badge(`${esc(줄.open)} 에 읽음`, 'b-ok') : badge('아직 안 읽음', 'b-mut')}
      ${btn('모달로 크게 보기', { cls: 'btn-pri', attr: ' data-modal="mPreview"' })}
    </div>
  </div>
  <div style="border-top:1px solid var(--border);margin:var(--sp-card-pad) 0"></div>
  ${미리보기}
  <p class="hint">보낸 알림장은 고칠 수 없습니다. 잘못 나간 것이 있으면 새로 써서 다시 보내 주세요.</p>`,
    { cls: 'mt8' })}

${card('보호자 화면에서는', `
  <div class="g2">
    ${box(`<div class="t-sub mb3">① 알림장함 목록</div>
      <div class="pc-note${줄.open ? '' : ' unread'}" style="pointer-events:none">
        <div class="thumb">${ph(['알림장 대표 사진', 800, 600], { seed: n.id, cls: 'ph-card' })}</div>
        <div class="bd">
          <div class="dt">${esc(n.date)} (${esc(n.dow)}) · ${esc(n.dog)} · 사진 ${n.pics}장</div>
          <div class="sum">${esc(n.sum)}</div>
          <div class="t-sub mt2">담당 ${esc(n.teacher)} · 등원 ${n.inAt} · 하원 ${n.outAt}</div>
          ${n.note ? `<div class="mt3">${badge('확인해 주세요', 'b-warn')}</div>` : ''}
        </div>
      </div>`)}
    ${box(`<div class="t-sub mb3">② 알림장 상세</div>
      <p class="t-sub">사진 ${n.pics}장이 첫 장부터 크게 이어지고, 아래에 하루 요약과 식사·배변·낮잠이 붙습니다.
      특이사항이 있으면 맨 위에 붉은 상자로 올라갑니다.</p>
      <div class="btns mt4">
        ${btn('알림장 상세 보기', { href: 'MY0501', cls: 'btn-sub', sm: true })}
        ${btn('특이사항 강조 보기', { href: 'MY0505', cls: 'btn-sub', sm: true })}
      </div>`)}
  </div>`, { cls: 'mt8' })}

<div class="btns mt8">
  ${btn('발송 이력으로 돌아가기', { href: 'NW0401', cls: 'btn-ghost' })}
  ${btn('날짜로 찾기', { href: 'NW0402', cls: 'btn-sub' })}
  ${btn('오늘 알림장 쓰러 가기', { href: 'NW0101', cls: 'btn-pri' })}
</div>`;

  const after = modal('mPreview', `보낸 알림장 — ${esc(n.date)} ${esc(n.dog)}`, 미리보기,
    `${btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' })}
     ${btn('알림장 상세로', { href: 'MY0501', cls: 'btn-pri' })}`);

  return { body, o: { after } };
};
