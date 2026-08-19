/* PR 공사 진행 — 잎사귀 29장. 이 팩의 알맹이라 손으로 만든다.
   상위 화면(공정표·오늘 현장·사진 일지·추가공사 승인·준공 검수·진행 중 없음)의
   뼈대·색·톤은 U.shell() 이 그대로 유지해 준다. 여기서는 그 상태·세부만 보여준다. */
import * as U from './ui.mjs';
import { PROCESS_STATE, TODAY_PCT } from './pages-pr.mjs';
import { CONFLICT, FLAGSHIP, won } from './data.mjs';

const P = {};
export const PAGES = P;

/* ---- 공정표 갈래 ---- */
P['PR0102'] = (ctx) => {
  const p = PROCESS_STATE.find((x) => x.status === '하는 중') || PROCESS_STATE[3];
  const body = U.pageHd('공정 막대 상세 펼침', `「${p.key}」 막대를 눌렀을 때`)
    + U.card('', U.kv([['담당 팀', p.team], ['실제 시작', `착공 ${p.startDay + 1}일차 (9/19)`], ['실제 종료(예정)', `착공 ${p.endDay}일차 (9/25)`], ['오늘 한 일', '주방 가구 골조 조립'], ['남은 일', '붙박이장 설치, 침실 몰딩']]))
    + `<p class="t-sub mt3">다시 누르면 접힙니다.</p>`;
  return { body, o: {} };
};
P['PR0103'] = (ctx) => {
  const body = U.pageHd('밀림 전파 표시', '앞 공정이 밀리면 뒤 공정에 꼬리표가 자동으로 붙습니다')
    + U.banner('warn', '⏱️', '<b>타일 공정이 1일 밀렸어요</b><div class="t-sub mt1">목공 마감 검수가 하루 늦어져 타일 시작일이 9/24 → 9/25로 자동 조정됐습니다.</div>')
    + U.card('', U.kv([['기존 준공 예정일', FLAGSHIP.end], ['갱신된 준공 예정일', '2026-10-09 (+1일)']]));
  return { body, o: {} };
};
P['PR0104'] = (ctx) => {
  const body = U.pageHd('주·월 보기 전환', '눈금 단위를 바꿔도 오늘 위치는 그대로 유지됩니다')
    + U.card('주 보기', U.processBar(PROCESS_STATE.slice(2, 6), { todayPct: 40 }))
    + U.card('월 보기 (선택됨)', U.processBar(PROCESS_STATE, { todayPct: TODAY_PCT }), { cls: 'mt4' });
  return { body, o: {} };
};
P['PR0105'] = (ctx) => {
  const body = U.pageHd('오늘로 가기', '일정표가 가로로 스크롤되어 오늘 자리로 이동합니다')
    + U.card('', U.processBar(PROCESS_STATE, { todayPct: TODAY_PCT }) + `<p class="t-sub mt3">오늘 = 착공 12일차 (진행률 ${TODAY_PCT}%) 위치로 화면이 이동했습니다.</p>`);
  return { body, o: {} };
};
P['PR0106'] = (ctx) => {
  const body = U.pageHd('집주인 확인 필요 강조', '정해 주셔야 할 항목은 다른 색으로 상단에 뜹니다')
    + U.banner('warn', '📌', '<b>주방 상판 색상을 정해 주세요</b><div class="t-sub mt1">캄포블랑 / 카라라화이트 중 선택 — 9/24까지</div>', { right: U.btn('지금 정하기', { href: 'CS0401', cls: 'btn-accent btn-sm' }) })
    + `<p class="t-sub mt3">누르면 해당 화면(자재 고르기)으로 이동합니다.</p>`;
  return { body, o: {} };
};
P['PR0107'] = (ctx) => {
  const body = U.pageHd('로딩', '일정 데이터를 불러오는 동안')
    + U.card('', `<div class="col">${[100, 70, 85, 40].map((w) => `<div class="bar" style="height:20px;background:var(--border)"><i style="width:${w}%;background:var(--border)"></i></div>`).join('')}</div><p class="t-sub mt3">공정 막대 자리에 회색 스켈레톤이 표시됩니다.</p>`);
  return { body, o: {} };
};

/* ---- 오늘 현장 갈래 ---- */
P['PR0202'] = (ctx) => {
  const body = U.pageHd('어제·내일 넘기기', '9월 21일 (월)로 하루 전 이동')
    + U.card('', U.kv([['날짜', '9월 21일 (월) · 착공 11일차'], ['진행', '목공 — 거실 걸레받이 마감']]))
    + U.banner('mut', 'ℹ️', '사진·기록이 없는 날은 "이 날은 현장 기록이 없어요"라고 안내합니다(예: 일요일 정기 휴무).');
  return { body, o: {} };
};
P['PR0203'] = (ctx) => {
  const body = U.pageHd('집주인 결정 필요 강조', '결정 대기 항목이 맨 위 고정으로 보입니다')
    + U.banner('warn', '📌', '<b>결정 대기 — 주방 상판 색상</b>', { right: U.btn('정하러 가기', { href: 'CS0401', cls: 'btn-accent btn-sm' }) })
    + `<p class="t-sub mt3">결정을 마치면 이 배너는 사라지고 아래 「오늘 찍은 사진」이 맨 위로 올라옵니다.</p>`;
  return { body, o: {} };
};
P['PR0204'] = (ctx) => {
  const body = U.pageHd('사진 크게 보기', '좌우로 넘기며 볼 수 있습니다')
    + U.ph('오늘 현장 사진 (크게)', 'ph-169', 'big1')
    + `<div class="row-b mt3"><span class="t-sub">촬영 9/22 14:20 · 주방</span><div class="btns">${U.btn('‹', { cls: 'btn-ghost btn-sm' })}${U.btn('›', { cls: 'btn-ghost btn-sm' })}${U.btn('내려받기', { cls: 'btn-ghost btn-sm' })}</div></div>`;
  return { body, o: {} };
};
P['PR0205'] = (ctx) => {
  const body = U.pageHd('소장에게 묻기', '보낸 말이 아래에 쌓입니다')
    + U.card('', `<div class="col">
      <div class="box"><b>나</b> · 오늘 오전 9:10<div class="t-sub mt1">주방 상판 색상, 밝은 색이 관리하기 편할까요?</div></div>
      <div class="box box-pri"><b>${FLAGSHIP.manager}</b> · 오늘 오전 9:32 · ${U.badge('읽음', 'b-ok')}<div class="t-sub mt1">밝은 색은 얼룩이 더 잘 보여요. 카라라화이트를 추천드려요.</div></div>
    </div><textarea class="input mt3" placeholder="답장하기"></textarea><div class="mt2">${U.btnSay('보내기', '전달했어요')}</div>`);
  return { body, o: {} };
};
P['PR0206'] = (ctx) => {
  const body = U.pageHd('날씨로 인한 일정 변경', '')
    + U.banner('warn', '🌧️', '<b>9월 25일 비 예보 — 외부 자재 반입에 영향</b><div class="t-sub mt1">영향받는 공정: 타일(자재 반입) · 대체 일정: 9/25 실내 작업(도배 준비)으로 조정 제안</div>');
  return { body, o: {} };
};

/* ---- 현장 사진 일지 갈래 ---- */
P['PR0302'] = (ctx) => {
  const body = U.pageHd('공정 필터 칩', '고른 공정 사진만 남습니다')
    + U.chips(['철거', '설비', '전기', '목공', '타일'], [3, 4], {})
    + `<div class="g4 mt4">${Array.from({ length: 8 }, (_, i) => U.ph('목공·타일 사진', 'ph-11', 'f' + i)).join('')}</div>`;
  return { body, o: {} };
};
P['PR0303'] = (ctx) => {
  const body = U.pageHd('공간 필터 칩', '공정 필터와 조합해서 좁힐 수 있습니다')
    + U.chips(['거실', '주방', '욕실', '침실'], 1, {})
    + `<div class="g4 mt4">${Array.from({ length: 6 }, (_, i) => U.ph('주방 사진', 'ph-11', 'k' + i)).join('')}</div>`;
  return { body, o: {} };
};
P['PR0304'] = (ctx) => {
  const body = U.pageHd('날짜 묶음 접기·펴기', '')
    + `<div class="btns mb3">${U.btn('전체 접기', { cls: 'btn-ghost btn-sm' })}${U.btn('전체 펴기', { cls: 'btn-ghost btn-sm' })}</div>`
    + U.card('9월 22일 (화) — 접힘', '<span class="t-sub">목공 · 사진 6장 (누르면 펼쳐집니다)</span>')
    + U.card('9월 21일 (월) — 펴짐', `<div class="g4">${Array.from({ length: 5 }, (_, i) => U.ph('사진', 'ph-11', 'd' + i)).join('')}</div>`, { cls: 'mt3' });
  return { body, o: {} };
};
P['PR0305'] = (ctx) => {
  const body = U.pageHd('이 자리 변해 온 것', '같은 각도로 찍은 사진을 날짜순으로 나열합니다')
    + `<div class="rail">${['8/28 철거', '9/2 설비', '9/15 전기', '9/22 목공'].map((t, i) => `<div>${U.ph(t, 'ph-11', 'same' + i)}<p class="t-sub center mt1">${t}</p></div>`).join('')}</div>`
    + `<p class="t-sub mt3">끌어서 넘기거나 눌러서 확대해 볼 수 있습니다.</p>`;
  return { body, o: {} };
};
P['PR0306'] = (ctx) => {
  const body = U.pageHd('준공 앨범 묶기', '')
    + `<div class="g4">${Array.from({ length: 6 }, (_, i) => `<label class="ccard"><input type="checkbox" style="position:absolute;left:8px;top:8px;z-index:1" checked>${U.ph('앨범에 담을 사진', 'ph-11', 'alb' + i)}</label>`).join('')}</div>`
    + U.card('', `<div class="field"><label class="lb">앨범 이름</label><input class="input" value="성수동 리버뷰 아파트 — 준공 앨범"></div>
      <div class="btns mt3">${U.btnSay('앨범 만들기', '앨범을 만들었어요')}${U.btnSay('공유 링크 복사', '링크를 복사했어요')}</div>`, { cls: 'mt4' });
  return { body, o: {} };
};

/* ---- 추가공사 변경 견적 승인 갈래 ---- */
P['PR0402'] = (ctx) => {
  const body = U.pageHd('왜 생겼는지 사진 상세', '')
    + U.ph('배관 노후 발견 사진 (확대)', 'ph-169', 'issue-big')
    + U.banner('mut', '📝', '발견 경위 — 철거 진행 중 주방 하부 배관에서 부식이 발견되어 담당 소장이 현장에서 촬영했습니다.');
  return { body, o: {} };
};
P['PR0403'] = (ctx) => {
  const body = U.pageHd('항목별 승인·거절', '행마다 따로 고를 수 있고, 고를 때마다 합계가 다시 계산됩니다')
    + U.table(['항목', '금액', '승인'], [
      ['배관 노후 교체', won(900_000), '<span class="badge b-ok">승인</span>'],
      ['단열 보강', won(500_000), '<span class="badge b-mut">미선택</span>'],
      ['폐기물 처리 추가', won(300_000), '<span class="badge b-ok">승인</span>'],
    ])
    + U.banner('warn', '⚠️', '미선택 항목이 있어 제출이 막혀 있습니다. 단열 보강을 승인·거절 중 하나로 골라 주세요.');
  return { body, o: {} };
};
P['PR0404'] = (ctx) => {
  const body = U.pageHd('거절 경고', '')
    + U.banner('danger', '⚠️', '<b>「단열 보강」을 거절하면 해당 부위는 보증에서 빠집니다.</b><div class="t-sub mt1">결로·곰팡이가 생겨도 무상 하자보수 대상이 아니게 됩니다.</div>')
    + `<div class="btns mt4">${U.btn('그래도 거절', { cls: 'btn-danger' })}${U.btn('다시 생각하기', { href: 'PR0401', cls: 'btn-ghost' })}</div>`;
  return { body, o: {} };
};
P['PR0405'] = (ctx) => {
  const body = U.pageHd('기간 재계산', '승인한 항목 조합에 따라 자동으로 다시 계산됩니다')
    + U.table(['승인한 항목', '늘어나는 날수'], [['배관 노후 교체', '+1일'], ['폐기물 처리 추가', '+1일']], { foot: ['합계', '+2일'] })
    + U.card('', U.kv([['기존 준공 예정일', FLAGSHIP.end], ['갱신된 준공 예정일', '2026-10-10']]), { cls: 'mt4' });
  return { body, o: {} };
};
P['PR0406'] = (ctx) => {
  const body = U.pageHd('동의 서명', '체크 전에는 승인 버튼이 잠겨 있습니다')
    + U.agreeScope(`
      ${U.agreeCheckAll('위 추가공사 내용과 금액에 동의합니다')}
      ${U.sigpad({})}
      <div class="mt4">${U.btn('승인하고 서명하기', { cls: 'btn-primary btn-lg btn-block', unlockAll: true, off: true })}</div>`);
  return { body, o: {} };
};
P['PR0407'] = (ctx) => {
  const body = U.pageHd('나중에 정하기', '')
    + U.banner('warn', '⏸️', '<b>보류를 고르면 이 항목과 관련된 공정이 멈춥니다.</b><div class="t-sub mt1">다시 들어오시면 이어서 정하실 수 있어요 — 답을 처음부터 다시 입력하지 않습니다.</div>')
    + `<div class="btns mt4">${U.btn('보류하기', { cls: 'btn-ghost' })}${U.btn('계속 정하기', { href: 'PR0401', cls: 'btn-primary' })}</div>`;
  return { body, o: {} };
};

/* ---- 준공 검수 체크리스트 갈래 ---- */
P['PR0502'] = (ctx) => {
  const spaces = [['거실', '6/6'], ['주방', '6/6'], ['욕실', '4/6'], ['침실', '6/6'], ['베란다', '5/6'], ['공용', '6/6']];
  const body = U.pageHd('공간 탭', '탭과 목록은 같은 상자 안에 있어 탭을 누르면 목록이 실제로 바뀝니다')
    + U.tabs(spaces.map(([s]) => ({ label: s })), 2)
    + `<div class="g3 mt4">${spaces.map(([s, n]) => `<div class="box center"><b>${s}</b><div class="t-sub mt1">${n} 확인</div></div>`).join('')}</div>`;
  return { body, o: {} };
};
P['PR0503'] = (ctx) => {
  const body = U.pageHd('괜찮음·문제있음 선택', '선택 즉시 상단 진행 숫자가 갱신됩니다')
    + U.card('', `<div class="row-b" style="padding:10px 0"><span>욕실 · 수전 누수</span>
      <div class="radios-h"><label class="radio" style="height:36px;padding:0 12px"><input type="radio" name="check1">괜찮음</label><label class="radio on" style="height:36px;padding:0 12px"><input type="radio" name="check1">문제 있음</label></div></div>
      <div class="box-warn mt2">${U.ph('문제 사진 올리기', 'ph-169', 'checkphoto')}<textarea class="input mt3" placeholder="메모"></textarea></div>`)
    + `<p class="t-sub mt3">진행 41/48 → 「문제 있음」 선택 시에도 확인한 것으로 세어 41/48 그대로 유지, 문제 목록에 追加됩니다.</p>`;
  return { body, o: {} };
};
P['PR0504'] = (ctx) => {
  const body = U.pageHd('문제 사진·메모 첨부', '')
    + `<div class="drop"><div class="ico">📷</div><p class="t-body mt2">여러 장 올릴 수 있어요</p></div>`
    + `<div class="g4 mt3">${Array.from({ length: 3 }, (_, i) => U.ph('문제 사진', 'ph-11', 'pf' + i)).join('')}</div>`
    + `<div class="field mt3"><label class="lb">급한 정도</label><div class="radios-h">${['급함', '보통', '천천히'].map((s, i) => `<label class="radio${i === 1 ? ' on' : ''}" style="height:36px;padding:0 12px"><input type="radio" name="urg2">${s}</label>`).join('')}</div></div>`
    + `<div class="btns mt3">${U.btnSay('저장', '메모를 저장했어요')}${U.btn('취소', { href: 'PR0501', cls: 'btn-ghost' })}</div>`;
  return { body, o: {} };
};
P['PR0505'] = (ctx) => {
  const body = U.pageHd('문제 모아보기', '잡힌 문제 7개')
    + U.table(['공간', '항목', '급한 정도'], [
      ['욕실', '수전 누수', U.badge('보통', 'b-warn')],
      ['침실', '문 여닫힘', U.badge('천천히', 'b-mut')],
    ]) + `<p class="t-sub mt3">항목을 누르면 준공 검수 체크리스트의 해당 줄로 스크롤됩니다.</p>`;
  return { body, o: {} };
};
P['PR0506'] = (ctx) => {
  const body = U.pageHd('미완료 시 준공승인 잠김', '')
    + U.banner('warn', '🔒', '<b>7개 항목이 아직 남았어요 (41/48)</b><div class="t-sub mt1">모든 항목을 「괜찮음」 또는 「문제 있음(처리 예정)」으로 표시해야 준공 승인 버튼이 열립니다.</div>')
    + `<div class="center mt4">${U.btn('준공 승인', { cls: 'btn-primary btn-lg', off: true, attr: ' title="41/48 — 모든 항목을 확인해야 열립니다"' })}</div>`;
  return { body, o: {} };
};

/* ---- 진행 중 없음 갈래 ---- */
P['PR0602'] = (ctx) => {
  const body = U.pageHd('지난 공사 목록 펼침', '')
    + U.table(['현장', '완료일', '보증 남은 기간', ''], [
      [FLAGSHIP.title, FLAGSHIP.end, '11개월', `${U.btn('앨범', { href: 'PR0306', cls: 'btn-ghost btn-sm' })}${U.btn('하자보수', { href: 'AS0101', cls: 'btn-ghost btn-sm' })}`],
    ]);
  return { body, o: {} };
};
P['PR0603'] = (ctx) => {
  const body = U.pageHd('상황별 안내 전환', '')
    + `<div class="g2">
      <div class="box"><b>계약 전이시라면</b><p class="t-sub mt2">예상 견적부터 시작해 보세요.</p>${U.btn('예상 견적 내기', { href: 'ES0101', cls: 'btn-primary btn-sm', attr: ' style="margin-top:8px"' })}</div>
      <div class="box"><b>준공 후시라면</b><p class="t-sub mt2">지난 공사 앨범과 하자보수를 확인하세요.</p>${U.btn('앨범 보기', { href: 'PR0306', cls: 'btn-ghost btn-sm', attr: ' style="margin-top:8px"' })}</div>
    </div>`;
  return { body, o: {} };
};
