/* 여행 프리미엄 — 공통 인터랙션
   프로토타입용 최소 동작: 탭 / 아코디언 / 칩 / 찜 / 토스트 / 모달 / 스텝퍼 / 토글 */
(function () {
  'use strict';

  function on(sel, ev, fn) {
    document.addEventListener(ev, function (e) {
      var t = e.target.closest(sel);
      if (t) fn(e, t);
    });
  }

  /* 탭 — 같은 .tabs 안에서만 활성 전환. data-go 가 있으면 해당 페이지로 이동 */
  on('.tab', 'click', function (e, t) {
    if (t.dataset.go) { location.href = t.dataset.go; return; }
    var box = t.closest('.tabs, .tabs-pill');
    if (!box) return;
    box.querySelectorAll('.tab').forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
    var key = t.dataset.pane;
    if (key) {
      var scope = box.parentElement;
      scope.querySelectorAll('[data-pane-body]').forEach(function (p) {
        p.hidden = p.dataset.paneBody !== key;
      });
    }
  });

  /* 아코디언 */
  on('.acc-q', 'click', function (e, t) {
    t.closest('.acc-item').classList.toggle('on');
  });

  /* 칩 필터 */
  on('.chip', 'click', function (e, t) {
    if (t.dataset.go) { location.href = t.dataset.go; return; }
    if (t.classList.contains('is-off')) return;
    t.classList.toggle('on');
  });

  /* 찜하기 */
  on('.heart', 'click', function (e, t) {
    e.preventDefault();
    var on_ = t.classList.toggle('on');
    t.textContent = on_ ? '♥' : '♡';
    toast(on_ ? '찜한 상품에 담았어요' : '찜을 해제했어요', on_ ? '찜 목록 보기' : '되돌리기');
  });

  /* 토글 스위치 */
  on('.toggle', 'click', function (e, t) { t.classList.toggle('on'); });

  /* 인원 스텝퍼 */
  on('.stepper button', 'click', function (e, t) {
    var box = t.closest('.stepper');
    var num = box.querySelector('.num');
    var v = parseInt(num.textContent, 10) || 0;
    v += (t.dataset.step === '-' ? -1 : 1);
    if (v < 0) v = 0;
    num.textContent = v;
    var evt = new CustomEvent('stepper:change', { bubbles: true });
    box.dispatchEvent(evt);
  });

  /* 달력 날짜 선택 */
  on('.cal-d', 'click', function (e, t) {
    if (t.classList.contains('off')) return;
    var g = t.closest('.cal-grid');
    g.querySelectorAll('.cal-d').forEach(function (x) { x.classList.remove('sel'); });
    t.classList.add('sel');
  });

  /* 라디오 카드 */
  on('.radio', 'click', function (e, t) {
    var name = t.dataset.group;
    if (!name) return;
    document.querySelectorAll('.radio[data-group="' + name + '"]').forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
    var i = t.querySelector('input'); if (i) i.checked = true;
  });

  /* 닫기 버튼 (배너/토스트/모달) */
  on('[data-close]', 'click', function (e, t) {
    var box = t.closest(t.dataset.close || '*');
    if (box) box.remove();
  });

  /* 모달 열기 */
  on('[data-modal]', 'click', function (e, t) {
    var tpl = document.getElementById(t.dataset.modal);
    if (!tpl) return;
    var d = document.createElement('div');
    d.className = 'dim';
    d.innerHTML = tpl.innerHTML;
    d.addEventListener('click', function (ev) {
      if (ev.target === d || ev.target.closest('[data-dismiss]')) d.remove();
    });
    document.body.appendChild(d);
  });

  /* 토스트 */
  var tRef = null;
  function toast(msg, action, kind) {
    if (tRef) tRef.remove();
    var d = document.createElement('div');
    d.className = 'toast' + (kind === 'ok' ? ' toast-ok' : '');
    d.innerHTML = '<span></span>' + (action ? '<span class="act">' + action + '</span>' : '');
    d.firstChild.textContent = msg;
    document.body.appendChild(d);
    tRef = d;
    setTimeout(function () { if (d.parentNode) d.remove(); }, 3200);
  }
  window.toast = toast;
  on('[data-toast]', 'click', function (e, t) {
    toast(t.dataset.toast, t.dataset.toastAct || '', t.dataset.toastKind || '');
  });

  /* 쿠폰 받기 */
  on('[data-getcoupon]', 'click', function (e, t) {
    if (t.classList.contains('is-off')) return;
    t.classList.add('is-off');
    t.textContent = '받음';
    toast('쿠폰을 받았어요. 결제할 때 적용하세요', '쿠폰함', 'ok');
  });

  /* 지도 핀 */
  on('.ph-map .pin', 'click', function (e, t) {
    var m = t.closest('.ph-map');
    m.querySelectorAll('.pin').forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
    var pv = document.querySelector('[data-map-preview]');
    if (pv && t.dataset.name) {
      pv.querySelectorAll('[data-map-name]').forEach(function (x) { x.textContent = t.dataset.name; });
    }
  });

  /* 스펙 정보 패널 (기획 추적용) — 우하단 버튼 */
  on('.dev-btn', 'click', function (e, t) {
    var box = t.closest('.dev');
    box.classList.toggle('on');
    try { localStorage.setItem('tp.spec', box.classList.contains('on') ? '1' : '0'); } catch (_) {}
  });
  document.addEventListener('DOMContentLoaded', function () {
    try {
      if (localStorage.getItem('tp.spec') === '1') {
        var b = document.querySelector('.dev'); if (b) b.classList.add('on');
      }
    } catch (_) {}
  });

  /* 폼 제출은 프로토타입이므로 막고 안내 */
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    toast('프로토타입 화면이에요. 실제로 전송되지 않습니다');
  });
})();
