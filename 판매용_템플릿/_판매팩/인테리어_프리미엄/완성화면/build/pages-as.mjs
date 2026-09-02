/* AS 하자보수 — 부모 화면 3장. 준공 뒤에도 남는 약속. */
import * as U from './ui.mjs';
import { AS_CASES, FLAGSHIP } from './data.mjs';

/* AS0102 도 같은 것을 쓴다 — 두 곳에 적으면 갈라진다 (2026-09-02). */
export const SYMPTOMS = {
  '도배': ['벽지 들뜸', '이음새 벌어짐', '곰팡이·얼룩'],
  '바닥': ['마루 들뜸', '틈 벌어짐', '삐걱거림'],
  '타일': ['타일 들뜸', '줄눈 갈라짐', '깨짐'],
  '설비': ['누수', '배수 안 됨', '온수 안 나옴'],
  '전기': ['조명 안 켜짐', '콘센트 작동 안 함', '스위치 고장'],
  '창호': ['여닫힘 뻑뻑함', '틈새 바람', '결로'],
  '목공': ['문 처짐', '몰딩 벌어짐', '가구 경첩 헐거움'],
};

/* ---------------- AS0101 하자보수 접수 ---------------- */
function AS0101() {
  const parts = Object.keys(SYMPTOMS);
  const panes = parts.map((p, i) => U.pane(p, `<div class="checks">${SYMPTOMS[p].map((s) => `<label class="check"><input type="checkbox">${s}</label>`).join('')}</div>`, i === 3)).join('');
  const body = `
${U.sec('', U.banner('ok', '🛡️', `<b>보증 기간이 11개월 남았어요.</b><div class="t-sub mt1">준공일 ${FLAGSHIP.end} 기준 · 방수·설비는 2년 보증</div>`))}

${U.pageHd('하자보수 접수')}

${U.sec('어느 현장인가요', `<select class="input" style="max-width:400px"><option>${FLAGSHIP.title} (${FLAGSHIP.end} 준공)</option></select>`)}

${U.sec('부위를 골라 주세요', U.tabBox(U.tabs(parts.map((p) => ({ label: p, pane: p })), 3), panes))}

${U.sec('사진·영상 올리기', `<div class="drop"><div class="ico">📷</div><p class="t-body mt2">눌러서 사진이나 영상을 올려 주세요</p></div>
  <div class="g4 mt3">${Array.from({ length: 2 }, (_, i) => U.ph('올린 사진', 'ph-11', 'as-upload' + i)).join('')}</div>`)}

${U.sec('자세한 상황', `<textarea class="input" placeholder="언제부터, 어떤 상황인지 적어 주세요"></textarea>`)}

${U.sec('급한 정도', `<div class="radios-h">${[
    ['급함', '1~2일 안 방문'], ['보통', '3~5일 안 방문'], ['천천히', '1주일 안 방문'],
  ].map(([t, d], i) => `<label class="radio${i === 1 ? ' on' : ''}" style="flex-direction:column;height:auto;padding:12px"><input type="radio" name="urgency" style="display:none">${t}<span class="t-sub">${d}</span></label>`).join('')}</div>`)}

${U.sec('방문 가능 요일·시간', `<div class="chips">${U.chips(['월', '화', '수', '목', '금'], [0, 2, 4], {})}</div>
  <div class="chips mt2">${U.chips(['오전', '오후'], 1, {})}</div>`)}

${U.sec('보증에 들어가는 것 / 안 들어가는 것', `<div class="g2">
  <div class="box-ok"><b>들어가는 것</b><ul class="list-plain mt2">${['시공 불량', '자재 하자', '설비 누수'].map((t) => `<li>· ${t}</li>`).join('')}</ul></div>
  <div class="box-warn"><b>안 들어가는 것</b><ul class="list-plain mt2">${['생활 스크래치', '외부 충격', '입주 후 개조'].map((t) => `<li>· ${t}</li>`).join('')}</ul></div>
</div>`)}

<div class="center mt6">${U.btn('접수하기', { href: 'AS0201', cls: 'btn-primary btn-lg' })}</div>`;
  return { body, o: {} };
}

/* ---------------- AS0201 하자보수 접수 내역 ---------------- */
function AS0201() {
  const body = `
${U.pageHd('하자보수 접수 내역', '보증 기간 11개월 남음')}

${/* ⛔ 탭을 눌러도 세 줄이 그대로였고, 개수도 손으로 적어 두어 AS_CASES 가 바뀌면
      어긋난다 (2026-09-02). 세어서 적고 공통 거르기 장치에 잇는다. */''}
${U.tabs([{ label: '전체', cnt: AS_CASES.length, filter: '하자내역', all: true }].concat(
  ['접수됨', '방문 예정', '처리 중', '완료'].map((s) => (
    { label: s, cnt: AS_CASES.filter((c) => c.status === s).length, filter: '하자내역' }))), 0)}

<div data-filter-in="하자내역">${U.table(['접수일', '부위', '증상', '상태', '예상 방문일'], AS_CASES.map((c) => ({ attr: ` data-tag="${c.status}"`, cells: [c.at, c.part, c.symptom, U.badge(c.status, c.status === '완료' ? 'b-ok' : c.status === '방문 예정' ? 'b-pri' : 'b-warn'), c.status === '완료' ? '—' : c.at] })))}
<p class="t-sub mt3" data-filter-empty hidden>그 상태인 접수 건이 없어요.</p></div>

${U.sec('', U.banner('warn', '⏰', '<b>AS-0091</b>은 급함으로 접수됐어요. 내일까지 방문 예정입니다.'))}

<div class="center mt6">${U.btn('새로 접수하기', { href: 'AS0101', cls: 'btn-primary' })}</div>`;
  return { body, o: {} };
}

/* ---------------- AS0301 하자보수 처리 현황 ---------------- */
function AS0301() {
  const c = AS_CASES[1];
  const body = `
${U.pageHd(`접수번호 ${c.id}`, `${c.part} · ${c.symptom}`)}

${U.steps(['접수', '확인', '방문', '처리', '완료'], 2)}

${U.sec('접수 내용', U.card('', U.kv([['부위', c.part], ['증상', c.symptom], ['접수일', c.at]]) + `<div class="g4 mt3">${Array.from({ length: 2 }, (_, i) => U.ph('접수 사진', 'ph-11', c.id + i)).join('')}</div>`))}

${U.sec('담당 기사', U.card('', `<div class="row-c">${U.ph('담당 기사', 'ph-ava', 'tech1')}
  <div><b>정민호 기사</b><div class="t-sub">방문 예정 9월 24일 (목) 오전</div></div></div>`))}

${U.sec('처리 기록', U.table(['시각', '내용'], [
    ['8/29 09:12', '접수 — 욕실 바닥 타일 들뜸'], ['8/29 14:30', '확인 — 담당 기사 배정'], ['9/24 예정', '방문'],
  ]))}

${U.sec('처리 전·후 사진', `<div class="g2">${U.ph('처리 전', 'ph-43', c.id + 'before')}${U.ph('처리 후 (예정)', 'ph-43', c.id + 'after')}</div>`)}

${U.sec('원인과 처리 내용', U.banner('mut', '🔧', '<b>원인</b> — 타일 접착 몰탈 양이 부족했던 것으로 확인됩니다.<div class="t-sub mt1"><b>처리</b> — 해당 타일을 재시공하고 줄눈을 다시 넣습니다.</div>'))}

${U.sec('', U.kv([['보증 적용', '적용 — 무상 처리'], ['추가 비용', '없음']]))}

${U.sec('', U.agreeScope(`
  ${U.agreeCheckAll('처리 결과를 확인했습니다')}
  <div class="btns mt4">${U.btn('완료 확인', { cls: 'btn-primary', unlockAll: true, off: true, attr: ' data-toast="완료로 처리됐어요"' })}
  ${U.btn('다시 봐 주세요', { cls: 'btn-ghost', attr: ' data-toast="재접수 사유 입력칸이 열렸어요"' })}</div>`))}

${U.sec('처리 만족도', `<div class="radios-h">${['★', '★★', '★★★', '★★★★', '★★★★★'].map((s, i) => `<label class="radio${i === 4 ? ' on' : ''}" style="height:36px;padding:0 12px"><input type="radio" name="satisfaction">${s}</label>`).join('')}</div>`)}`;
  return { body, o: {} };
}

export const PAGES = { AS0101, AS0201, AS0301 };
