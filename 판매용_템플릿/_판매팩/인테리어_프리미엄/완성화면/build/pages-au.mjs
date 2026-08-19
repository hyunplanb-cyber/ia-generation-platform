/* AU 계정 — 부모 화면 4장. 로그인·회원가입·비번찾기는 단독(solo) 화면, 내 정보는 사이드바 화면. */
import * as U from './ui.mjs';
import { FLAGSHIP } from './data.mjs';

/* ---------------- AU0101 로그인 ---------------- */
function AU0101() {
  const body = `
${U.pageHd('로그인')}
<div class="field"><label class="lb">휴대폰 번호 또는 아이디</label><input class="input" placeholder="010-0000-0000"></div>
<div class="field"><label class="lb">비밀번호</label><div class="input-row">
  <input class="input" type="password" placeholder="비밀번호">
  <button class="icon-btn" type="button" aria-label="비밀번호 보기">👁</button></div></div>
<label class="check mb4"><input type="checkbox" checked>로그인 상태 유지</label>
<button class="btn btn-primary btn-block btn-lg" type="button" data-go="${U.link('HO0101')}">로그인</button>
<div class="row-b mt3" style="font-size:13px">
  <a class="btn-link" href="${U.link('AU0201')}">회원가입</a><a class="btn-link" href="${U.link('AU0301')}">비밀번호 찾기</a></div>
<div class="hr"></div>
<p class="t-sub center mb3">간편 로그인</p>
<div class="btns center" style="justify-content:center">${['카카오', '네이버', '구글'].map((s) => U.btn(s, { cls: 'btn-ghost' })).join('')}</div>
<div class="hr"></div>
<div class="center"><a class="btn-link" href="${U.link('ES0101')}">로그인 없이 견적만 내보기</a></div>
<p class="t-sub center mt4"><a class="btn-link" href="${U.link('OW0101')}">업체 관리자로 들어가기</a></p>`;
  return { body, o: { wide: false, solo: true } };
}

/* ---------------- AU0201 회원가입 ---------------- */
function AU0201() {
  const body = `
${U.pageHd('회원가입')}
<div class="field"><label class="lb">이름</label><input class="input" placeholder="이름"></div>
<div class="field"><label class="lb">휴대폰 번호</label><div class="input-row"><input class="input" placeholder="010-0000-0000">${U.btn('인증번호 받기', { cls: 'btn-ghost' })}</div></div>
<div class="field"><label class="lb">인증번호</label><div class="input-row"><input class="input" placeholder="6자리 입력"><span class="t-sub" style="align-self:center">2:59</span></div></div>
<div class="field"><label class="lb">비밀번호</label><input class="input" type="password" placeholder="8자 이상, 영문+숫자"></div>
<div class="col" style="gap:4px;margin:-8px 0 12px">
  <span class="hint-ok">✓ 8자 이상</span><span class="t-sub">영문·숫자 조합</span><span class="t-sub">특수문자 1개 이상(선택)</span></div>
<div class="field"><label class="lb">비밀번호 확인</label><input class="input" type="password" placeholder="다시 입력"></div>
<div class="field"><label class="lb">관심 시공 분야 (선택)</label>${U.chips(['아파트 전체', '주방', '욕실', '상업공간'], -1, {})}</div>
<div class="hr"></div>
${U.agreeScope(`
  <label class="check mb2"><input type="checkbox" data-agree-all>전체 동의</label>
  <div class="checks" style="padding-left:30px">
    <label class="check"><input type="checkbox" data-agree>[필수] 이용약관 동의</label>
    <label class="check"><input type="checkbox" data-agree>[필수] 개인정보 수집·이용 동의</label>
    <label class="check"><input type="checkbox">[선택] 마케팅 정보 수신 동의</label>
  </div>
  ${U.btn('가입하기', { href: 'AU0401', cls: 'btn-primary btn-block btn-lg mt4', unlockAll: true, off: true })}`)}
<p class="t-sub center mt3">이미 가입된 번호라면 <a class="btn-link" href="${U.link('AU0101')}">로그인</a>으로 이동해 주세요</p>`;
  return { body, o: { wide: true, solo: true } };
}

/* ---------------- AU0301 비밀번호 찾기 ---------------- */
function AU0301() {
  const body = `
${U.pageHd('비밀번호 찾기')}
${U.tabs([{ label: '휴대폰 인증', pane: 'phone' }, { label: '이메일', pane: 'email' }], 0)}
${U.pane('phone', `<div class="field"><label class="lb">휴대폰 번호</label><div class="input-row"><input class="input" placeholder="010-0000-0000">${U.btn('인증번호 받기', { cls: 'btn-ghost' })}</div></div>
  <div class="field"><label class="lb">인증번호</label><div class="input-row"><input class="input"><span class="t-sub" style="align-self:center">2:59</span></div></div>`, true)}
${U.pane('email', `<div class="field"><label class="lb">가입 이메일</label><input class="input" placeholder="you@example.com"></div>`, false)}

<div class="field"><label class="lb">새 비밀번호</label><input class="input" type="password" placeholder="8자 이상, 영문+숫자"></div>
<div class="col" style="gap:4px;margin:-8px 0 12px">
  <span class="hint-ok">✓ 8자 이상</span><span class="hint-ok">✓ 영문·숫자 조합</span><span class="t-sub">특수문자 1개 이상(선택)</span></div>

<button class="btn btn-primary btn-block btn-lg" type="button" data-go="${U.link('AU0101')}">비밀번호 바꾸고 로그인</button>
<p class="t-sub center mt3">가입한 적 없는 번호라면 <a class="btn-link" href="${U.link('AU0201')}">회원가입</a>으로 이동해 주세요</p>
<p class="t-sub center mt2">그래도 안 되면 전화 상담 1600-2255</p>`;
  return { body, o: { wide: false, solo: true } };
}

/* ---------------- AU0401 내 정보 ---------------- */
function AU0401() {
  const body = `
${U.pageHd('내 정보')}

${U.sec('', U.card('', `<div class="row-c">${U.ph('프로필', 'ph-ava', 'me')}
  <div class="grow"><div class="field" style="margin-bottom:6px"><input class="input" value="김하은"></div>
  <div class="field" style="margin-bottom:0"><input class="input" value="010-1234-5678"></div></div>
  ${U.btnSay('저장', '저장했어요')}</div>`))}

${U.sec('내 현장', U.table(['현장', '상태', ''], [
    [FLAGSHIP.title, U.badge('진행 중', 'b-pri'), U.btn('보기', { href: 'PR0101', cls: 'btn-ghost btn-sm' })],
  ]))}

${U.sec('저장한 견적', U.table(['이름', '금액', ''], [
    ['성동구 32평 전체시공', '3,240만원 ~ 3,980만원', U.btn('보기', { href: 'ES0401', cls: 'btn-ghost btn-sm' })],
  ]))}

${U.sec('관심 시공 분야', U.chips(['아파트 전체', '주방', '욕실'], [0, 2], {}))}

${U.sec('알림 설정', `<div class="toggle-row"><span>공사 진행 알림</span><button class="toggle on" type="button"><i></i></button></div>
  <div class="toggle-row"><span>추가공사 알림</span><button class="toggle on" type="button"><i></i></button></div>
  <div class="toggle-row"><span>청구·수금 알림</span><button class="toggle on" type="button"><i></i></button></div>
  <div class="toggle-row"><span>하자보수 알림</span><button class="toggle on" type="button"><i></i></button></div>
  <p class="t-th mt4 mb2">받을 방법</p>${U.chips(['문자', '카카오톡', '앱 푸시'], [0, 1], {})}`)}

<div class="btns mt6">${U.btn('비밀번호 바꾸기', { href: 'AU0301', cls: 'btn-ghost' })}${U.btn('회원 탈퇴', { cls: 'btn-danger', attr: ' data-toast="보증 기간이 11개월 남아 있어요. 탈퇴 시 하자보수 접수 이력을 볼 수 없습니다"' })}</div>`;
  return { body, o: {} };
}

export const PAGES = { AU0101, AU0201, AU0301, AU0401 };
