/* AS 하자보수 — 잎사귀 14장. 이 팩의 알맹이라 손으로 만든다. */
import * as U from './ui.mjs';
import { SYMPTOMS } from './pages-as.mjs';
import { AS_CASES } from './data.mjs';

const P = {};
export const PAGES = P;

/* ---- 하자보수 접수 갈래 ---- */
P['AS0102'] = (ctx) => {
  /* ⛔ 화면이 「부위를 바꾸면 증상 목록이 즉시 바뀝니다」라고 적어 두고, 어느 탭을
     눌러도 설비 증상(누수·배수 안 됨·온수 안 나옴)만 나왔다 (2026-09-02).
     SYMPTOMS 는 AS0101 이 이미 쓰고 있다 — 같은 것을 판으로 붙인다. */
  const 부위 = Object.keys(SYMPTOMS);
  const 판 = 부위.map((p) => U.pane(p, `<div class="checks">${SYMPTOMS[p].map((s) => `<label class="check"><input type="checkbox">${s}</label>`).join('')}</div>`, p === '설비'));
  const body = U.pageHd('부위별 증상 목록 전환', '부위를 바꾸면 증상 목록이 즉시 바뀝니다(이전 선택은 초기화)')
    + U.tabBox(U.tabs(부위.map((p) => ({ label: p, pane: p })), 부위.indexOf('설비')), 판)
;
  return { body, o: {} };
};
P['AS0103'] = (ctx) => {
  const body = U.pageHd('사진·영상 올리기', '')
    + `<div class="drop"><div class="ico">📷</div><p class="t-body mt2">끌어다 놓거나 눌러서 올려 주세요</p></div>`
    + `<div class="g4 mt3">${Array.from({ length: 3 }, (_, i) => `<div style="position:relative">${U.ph('올린 사진', 'ph-11', 'up' + i)}<button class="icon-btn" type="button" style="position:absolute;right:4px;top:4px;width:26px;height:26px" aria-label="삭제">✕</button></div>`).join('')}</div>`
    + U.banner('warn', '⚠️', '동영상은 1개당 50MB까지만 올릴 수 있어요. 초과하면 자동으로 거절됩니다.', { cls: 'mt3' });
  return { body, o: {} };
};
P['AS0104'] = (ctx) => {
  const body = U.pageHd('급한 정도별 예상 방문일', '고를 때마다 예상 방문일이 다시 계산됩니다')
    + U.table(['급한 정도', '예상 방문일'], [['급함', '1~2일 안'], ['보통', '3~5일 안'], ['천천히', '1주일 안']])
    + U.banner('acc', '⚡', '「급함」을 고르면 다음 방문 순번에서 우선 배정됩니다.', { cls: 'mt3' });
  return { body, o: {} };
};
P['AS0105'] = (ctx) => {
  const body = U.pageHd('보증 범위', '')
    + `<div class="g2">
      <div class="box-ok"><b>들어가는 것</b><ul class="list-plain mt2">${['시공 불량', '자재 하자', '설비 누수', '타일 들뜸(시공 원인)'].map((t) => `<li>· ${t}</li>`).join('')}</ul></div>
      <div class="box-warn"><b>안 들어가는 것</b><ul class="list-plain mt2">${['생활 스크래치', '외부 충격', '입주 후 개조', '천재지변'].map((t) => `<li>· ${t}</li>`).join('')}</ul></div>
    </div>`;
  return { body, o: {} };
};
P['AS0106'] = (ctx) => {
  const body = U.pageHd('보증 기간 만료 임박', '')
    + U.banner('danger', '⏰', '<b>보증 기간이 12일 남았어요.</b><div class="t-sub mt1">2026-10-08 이후로는 무상 하자보수를 받으실 수 없어요. 서둘러 접수해 주세요.</div>');
  return { body, o: {} };
};

/* ---- 접수 내역 갈래 ---- */
P['AS0202'] = (ctx) => {
  /* ⛔ 화면이 「탭을 누르면 목록이 바뀝니다」라고 적어 두고, 표에는 AS_CASES[0] 한 줄만
     넣고 있었다 (2026-09-02 현님과 크롬으로 눌러 보다 나왔다). 탭의 개수(전체 3)와도
     안 맞았다. 셋을 다 넣고 app.js 의 거르기 장치에 이어 준다. */
  const 상태배지 = { '접수됨': 'b-mut', '방문 예정': 'b-pri', '처리 중': 'b-warn', '완료': 'b-ok' };
  const body = U.pageHd('상태 탭', '탭과 목록은 같은 상자 안에 있어 탭을 누르면 목록이 바뀝니다')
    + U.tabs([
        { label: '전체', cnt: AS_CASES.length, filter: '하자상태', all: true },
        { label: '접수됨', cnt: AS_CASES.filter((c) => c.status === '접수됨').length, filter: '하자상태' },
        { label: '방문 예정', cnt: AS_CASES.filter((c) => c.status === '방문 예정').length, filter: '하자상태' },
        { label: '처리 중', cnt: AS_CASES.filter((c) => c.status === '처리 중').length, filter: '하자상태' },
        { label: '완료', cnt: AS_CASES.filter((c) => c.status === '완료').length, filter: '하자상태' },
      ], 0)
    + `<div data-filter-in="하자상태">`
    + U.table(['접수일', '부위', '증상', '상태'], AS_CASES.map((c) => ({
        attr: ` data-tag="${c.status}"`,
        cells: [c.at, c.part, c.symptom, U.badge(c.status, 상태배지[c.status] || 'b-mut')],
      })))
    + `<p class="t-sub mt3" data-filter-empty hidden>그 상태인 접수 건이 없어요.</p></div>`;
  return { body, o: {} };
};
P['AS0203'] = (ctx) => {
  const c = AS_CASES[0];
  const body = U.pageHd('줄 펼치기', `${c.part} · ${c.symptom}`)
    + U.steps(['접수', '확인', '방문 예정'], 2)
    + `<div class="g4 mt3">${Array.from({ length: 2 }, (_, i) => U.ph('접수 사진', 'ph-11', c.id + 's' + i)).join('')}</div>`
    + U.banner('mut', '📝', '담당자 메모 — "싱크대 하부 배관 확인 후 방문 예정입니다."', { cls: 'mt3' });
  return { body, o: {} };
};
P['AS0204'] = (ctx) => {
  const body = U.pageHd('처리 지연 경고', '')
    + U.banner('warn', '⏳', '<b>AS-0088</b>은 접수 후 3일이 지났는데 방문일이 아직 안 잡혔어요.<div class="t-sub mt1">「확인 중입니다」 — 담당자가 배정 중입니다.</div>');
  return { body, o: {} };
};
P['AS0205'] = (ctx) => {
  const body = U.empty('📋', '접수 이력이 없어요', '아직 하자보수를 접수하신 적이 없어요.', U.btn('접수하기', { href: 'AS0101', cls: 'btn-primary' }));
  return { body, o: {} };
};

/* ---- 처리 현황 갈래 ---- */
P['AS0302'] = (ctx) => {
  const body = U.pageHd('진행 단계 막대 상세', '각 칸을 누르면 시각·담당자 메모가 보입니다')
    + U.steps(['접수', '확인', '방문', '처리', '완료'], 2)
    + U.card('9/29 14:30 · 방문', '<p class="t-body">정민호 기사가 현장에 도착해 상태를 확인했습니다.</p>');
  return { body, o: {} };
};
P['AS0303'] = (ctx) => {
  const body = U.pageHd('처리 전·후 사진 견주기', '')
    + `<div class="g2">${U.ph('처리 전', 'ph-43', 'before-big')}${U.ph('처리 후', 'ph-43', 'after-big')}</div>`
    + `<p class="t-sub mt3">사진을 누르면 확대되고, 가운데 손잡이를 끌면 전/후가 겹쳐 비교됩니다.</p>`;
  return { body, o: {} };
};
P['AS0304'] = (ctx) => {
  const body = U.pageHd('처리 확인 체크', '체크 전에는 완료 버튼이 잠겨 있습니다')
    + U.agreeScope(`
      ${U.agreeCheckAll('처리 결과를 확인했습니다')}
      <div class="mt4">${U.btn('완료 확인', { cls: 'btn-primary btn-lg', unlockAll: true, off: true })}</div>`);
  return { body, o: {} };
};
P['AS0305'] = (ctx) => {
  const body = U.pageHd('다시 봐 주세요', '재접수 사유를 적어 주세요 — 원래 건과 연결이 유지됩니다')
    + U.card('', `<div class="t-sub mb2">원래 접수 건 AS-0088 과 연결됩니다</div><textarea class="input" placeholder="어떤 점이 아직 해결되지 않았는지 적어 주세요"></textarea><div class="mt3">${U.btnSay('재접수하기', '재접수했어요')}</div>`);
  return { body, o: {} };
};
P['AS0306'] = (ctx) => {
  const body = U.pageHd('만족도 남기기', '완료된 건에만 나타납니다')
    + U.card('', `<div class="radios-h">${['★', '★★', '★★★', '★★★★', '★★★★★'].map((s, i) => `<label class="radio${i === 4 ? ' on' : ''}" style="height:36px;padding:0 12px"><input type="radio" name="satisfy2">${s}</label>`).join('')}</div>
      <textarea class="input mt3" placeholder="한 줄 평을 남겨 주세요"></textarea><div class="mt3">${U.btnSay('제출하기', '소중한 의견 감사합니다')}</div>`);
  return { body, o: {} };
};
