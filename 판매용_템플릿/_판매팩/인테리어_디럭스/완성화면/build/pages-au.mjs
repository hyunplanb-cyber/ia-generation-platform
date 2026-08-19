/* AU 계정 (4) — 손님과 업체가 같이 쓰는 로그인 갈래 */
import * as U from './ui.mjs';

export const PAGES = {};

PAGES['AU-01'] = () => ({
  body: `${U.solo('다시 오셨네요', '', `
    <div class="field"><span class="lb">휴대폰 번호 또는 아이디</span>${U.input({ ph: '010-0000-0000' })}</div>
    <div class="field"><span class="lb">비밀번호</span>${U.input({ type: 'password', ph: '비밀번호' })}<span class="err" hidden>비밀번호가 맞지 않아요</span></div>
    <div class="row-b mt2">${U.check('로그인 상태 유지', { none: true })}<a class="more" href="${U.link('AU-03')}">비밀번호 찾기</a></div>
    <div class="mt4">${U.btn('로그인', { cls: 'btn-pri btn-w', href: 'HO-01' })}</div>
    <div class="row mt6" style="align-items:center;gap:8px"><div class="grow" style="height:1px;background:var(--border)"></div><span class="t-sub">또는</span><div class="grow" style="height:1px;background:var(--border)"></div></div>
    <div class="btns-v mt4">${['카카오','네이버','구글'].map((s) => U.btn(`${s}로 시작하기`, { w: true, attr: ` data-toast="${s} 로그인 창을 띄웁니다"` })).join('')}</div>
    <p class="t-sub mt6" style="text-align:center">처음 오셨나요? <a class="more" href="${U.link('AU-02')}">회원가입</a></p>
    <div class="row-b mt6"><a class="t-sub" href="${U.link('OW-01')}">업체 관리자 로그인</a><a class="t-sub" href="${U.link('ES-01')}">로그인 없이 견적만 내보기</a></div>
  `)}`,
});

PAGES['AU-02'] = () => ({
  body: `${U.solo('회원가입', '', `
    ${U.steps([['정보 입력'], ['인증'], ['완료']], 0)}
    <div class="field mt6"><span class="lb">이름</span>${U.input({ ph: '이름' })}</div>
    <div class="field"><span class="lb">휴대폰 번호</span><div class="row"><span class="grow">${U.input({ ph: '010-0000-0000' })}</span>${U.btn('인증번호 받기', { sm: true, attr: ' data-toast="인증번호를 보냈어요" data-toast-kind="ok"' })}</div>
      <div class="row mt2" style="gap:8px"><span class="in" style="width:100px;height:32px;display:flex;align-items:center;justify-content:center">인증번호</span><span class="t-sub num">2:58</span><a class="more">다시 받기</a></div></div>
    <div class="field"><span class="lb">비밀번호</span>${U.input({ type: 'password' })}
      <div class="stack mt2">${['8자 이상', '영문과 숫자 섞기', '특수문자 하나 이상'].map((t) => `<span class="t-sub">✓ ${t}</span>`).join('')}</div></div>
    <div class="field"><span class="lb">비밀번호 확인</span>${U.input({ type: 'password' })}</div>
    <div class="field"><span class="lb">관심 시공 분야 (선택)</span>${U.chips(['아파트 전체', '주방', '욕실', '상업공간'], -1)}</div>
    <div data-agree-scope>
    <div class="stack mt4">
      ${U.check('전체 동의', { attr: ' data-agree-all' })}
      ${U.check('이용약관 (필수)', { attr: ' data-agree' })}
      ${U.check('개인정보 처리방침 (필수)', { attr: ' data-agree' })}
      ${U.check('마케팅 수신 (선택)', { none: true })}
    </div>
    <div class="mt6">${U.btn('가입하기', { cls: 'btn-pri btn-w', id: 'btn-signup', off: true, href: 'AU-04', attr: ' data-unlock-all="btn-signup"' })}</div>
    </div>
    <p class="t-sub mt3">이미 가입된 번호면 <a class="more" href="${U.link('AU-01')}">로그인하러 가기</a></p>
  `)}`,
});

PAGES['AU-03'] = () => ({
  body: `${U.solo('비밀번호를 잊으셨나요?', '', `
    ${U.tabBox(
    [{ label: '휴대폰 인증', pane: 'phone' }, { label: '이메일', pane: 'email' }],
    `${U.pane('phone', `
      <div class="field mt4"><span class="lb">이름</span>${U.input()}</div>
      <div class="field"><span class="lb">휴대폰 번호</span><div class="row"><span class="grow">${U.input({ ph: '010-0000-0000' })}</span>${U.btn('인증번호 받기', { sm: true, attr: ' data-toast="인증번호를 보냈어요" data-toast-kind="ok"' })}</div></div>
      <div class="field" style="opacity:.5"><span class="lb">새 비밀번호</span>${U.input({ type: 'password', off: true })}</div>
      <div class="field" style="opacity:.5"><span class="lb">새 비밀번호 확인</span>${U.input({ type: 'password', off: true })}</div>
    `, true)}
     ${U.pane('email', `<div class="field mt4"><span class="lb">이메일</span>${U.input({ type: 'email' })}</div>`)}`,
    0,
  )}
    <p class="t-sub mt4">가입한 적 없는 번호면 <a class="more" href="${U.link('AU-02')}">회원가입하러 가기</a></p>
    <p class="t-sub mt6" style="text-align:center">그래도 안 되시면 1588-0000 로 전화 주세요</p>
  `)}`,
});

PAGES['AU-04'] = () => ({
  body: `${U.pageHd('내 정보', '')}

${U.card('프로필', `<div class="row" style="gap:var(--sp-card-pad)">${U.av('홍')}<div class="grow"><div class="t-card">홍길동</div><div class="t-sub">010-0000-0000</div></div>${U.btn('고치기', { sm: true, attr: ' data-toast="프로필을 고칠 수 있어요"' })}</div>`)}

${U.sec('내 현장', `<div class="g2">
  <div class="box"><div class="t-card">성동구 왕십리로 000</div><div class="t-sub mt2">진행 중 · 62%</div>${U.btn('공사 진행 보기', { sm: true, cls: 'btn-pri mt3', href: 'PR-01' })}</div>
  <div class="box"><div class="t-card">마포구 아현동</div><div class="t-sub mt2">준공 2026-08-05 · 보증 13개월 남음</div>${U.btn('하자보수 접수', { sm: true, cls: 'mt3', href: 'AS-01' })}</div>
</div>`, { cls: 'mt6' })}

${U.sec('저장한 견적', U.table(['견적 이름', '총액', '유효기간', ''], [
    ['성동구 32평 전체시공', '3,240만~3,980만', '2026-09-16', { t: `${U.btn('보기', { sm: true, href: 'ES-02' })}${U.btn('지우기', { sm: true, attr: ' data-toast="견적을 지웠어요"' })}`, cls: 'r' }],
  ]), { cls: 'mt6' })}

${U.sec('관심 시공 분야', U.chips(['아파트 전체', '주방', '욕실'], [0, 1]), { cls: 'mt6' })}

${U.sec('알림 설정', `<div class="stack">
  ${[['공사 진행 알림', true], ['추가공사 요청', true], ['대금 청구', true], ['하자보수 처리', false]].map(([t, on]) => `<div class="row-b"><div><div>${t}</div><div class="t-sub">${t} 소식을 알려드려요</div></div>${U.toggle(on)}</div>`).join('')}
</div>`, { cls: 'mt6' })}

${U.sec('알림 받을 방법', `<div class="row" style="gap:var(--sp-btn)">
  <button class="radio on" data-group="notify" type="button">문자</button>
  <button class="radio" data-group="notify" type="button">카카오톡</button>
  <button class="radio" data-group="notify" type="button">앱 알림</button>
</div>`, { cls: 'mt6' })}

${U.sec('', U.btn('비밀번호 바꾸기', { attr: ' data-toast="비밀번호 바꾸기 창을 띄웁니다"' }), { cls: 'mt6' })}

<div class="mt8"><button class="btn btn-dan btn-sm" type="button" data-modal="m-leave">회원 탈퇴</button></div>

${U.modal('m-leave', '정말 탈퇴하시겠어요?', '<p>보증 기간이 13개월 남아 있어요. 탈퇴하시면 하자보수 접수가 어려워집니다.</p>', `${U.btn('취소', { attr: ' data-dismiss' })}${U.btn('탈퇴하기', { cls: 'btn-dan' })}`)}`,
});
