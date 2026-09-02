/* 동네 서비스 매칭 플랫폼 — 공통 인터랙션
   프로토타입용 최소 동작: 탭 / 아코디언 / 칩 / 찜 / 별점 / 토스트 / 모달 /
   단계 진행 / 견적 고르기 / 카운트다운 / 가로 스크롤 화살표 */
(function () {
  /* 받침을 보고 조사를 고른다 — 「비밀번호를」·「이메일을」처럼 읽히게 한다.
     2026-08-19 검수: 「을(를)」·「(으)로」가 손님 화면에 그대로 나갔다. */
  function 조사붙이기(말, 있, 없) {
    var c = String(말).charCodeAt(String(말).length - 1) - 0xac00;
    return 말 + (c >= 0 && c <= 11171 && c % 28 !== 0 ? 있 : 없);
  }
  'use strict';

  function on(sel, ev, fn) {
    document.addEventListener(ev, function (e) {
      var t = e.target.closest(sel);
      if (t) fn(e, t);
    });
  }

  /* 탭 — 같은 묶음 안에서만 활성 전환. data-go 가 있으면 해당 화면으로 이동 */
  on('.tab', 'click', function (e, t) {
    /* ⚠ 제 화면을 가리키는 data-go 는 «화면 안 탭»이다 — 다시 불러 봐야 같은 자리다.
       여행 PR-02 의 「상품 소개·코스 일정·포함·불포함·취소규정·후기」 다섯이 모두 그랬다.
       그런데 그 이름과 똑같은 자리(h2.t-sec)가 이미 그 화면에 있었다. 데려가 준다.
       (2026-08-21 · 검수항목 H7 — 탭을 눌러도 아무 일이 없었다) */
    var 여기 = location.pathname.split('/').pop();
    if (t.dataset.go && t.dataset.go !== 여기) { location.href = t.dataset.go; return; }
    if (t.dataset.go === 여기) {
      var 다듬 = function (v) { return (v || '').replace(/[^가-힣a-zA-Z]/g, ''); };
      var 찾는말 = 다듬(t.textContent), 고른것 = null, 가장 = 1;
      document.querySelectorAll('h2, h3').forEach(function (h) {
        var 이것 = 다듬(h.textContent), n = 0;
        while (n < 찾는말.length && n < 이것.length && 찾는말[n] === 이것[n]) n++;
        if (n > 가장) { 가장 = n; 고른것 = h; }
      });
      if (고른것) {
        var 자리 = 고른것.closest('.sec, section') || 고른것;
        자리.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      /* 간 곳이 없어도 «켜진 탭»은 옮겨 준다 — 눌린 티는 나야 한다 */
    }
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
    /* ⛔ 2026-09-02: 평수 구간 칩(HO-01)은 «제 손잡이»가 따로 있다(아래 평수구간()).
       둘 다 돌면 그쪽이 켠 것을 여기 toggle 이 곧바로 다시 끈다 — 눌러도 아무것도 안 켜진다.
       눈으로 보다가 잡았다. 제 임자가 있는 묶음은 건드리지 않는다. */
    if (t.closest('[data-band-pick]')) return;
    if (t.dataset.go) { location.href = t.dataset.go; return; }
    if (t.classList.contains('is-off')) return;
    /* 「전체」가 든 묶음은 하나만 골라진다 — 「전체」와 「텐트」가 같이 켜지면 안 된다.
       고른 것에 ✕ 가 붙은 묶음(여러 개 고르는 것)은 그대로 둔다. */
    var 묶음 = t.closest('.chips');
    var 한개만 = 묶음 && Array.prototype.some.call(묶음.querySelectorAll('.chip'), function (c) {
      return /^전체(\s*보기)?$/.test((c.textContent || '').trim());
    });

  /* ── ✕ 가 달린 칩은 «지우는» 칩이다 · 하나만 고르는 묶음은 «하나만» 켜진다
   *    (2026-09-02 사장님과 크롬으로 눌러 보다가 나왔다)
   *
   * ⛔ 무엇이 잘못돼 있었나
   *   ① 화면 설명이 「칩 개별 해제」·「최근 검색어 개별 삭제」라고 약속해 두고,
   *      ✕ 를 눌러도 칩이 «켜졌다 꺼졌다» 할 뿐 사라지지 않았다.
   *      열두 팩에 ✕ 칩이 359개인데 지우는 코드가 한 곳도 없었다.
   *   ② 하나만 고르는 자리(시·도 · 구·군 · 출결 · 평수 구간)에서 여러 개가 같이 켜졌다.
   *      칩 하나만 켜지게 하는 장치가 「전체」가 든 묶음에만 걸려 있었기 때문이다.
   *   그러면서 칩은 「그 조건만 풀었어요」·「그 지역으로 바꿨어요」라고 «말은» 했다.
   *
   * ⚠ 눌러 보는 검수기(check-반응)는 이걸 못 잡는다 — 반응으로 치는 넷 중 하나가
   *   «토스트가 뜬다» 라서, 말만 하는 칩도 통과한다. 사람이 보고서야 안다(검수항목 G11).
   *
   * ⭐ 무엇이 「하나만 고르는 묶음」인지는 «마크업이 말해 준다» — 내가 화면마다 짐작해
   *   적지 않는다. 그래야 새 화면이 늘어도 저절로 맞는다. 보는 것은 둘이다 —
   *     · 처음에 딱 하나가 on 이고
   *     · ✕ 가 붙어 있다면 «그 켜진 칩에만» 붙어 있다 (✕ 는 고른 것을 푸는 표시다)
   *   칩마다 ✕ 가 다 붙어 있으면(SE0102 의 걸린 조건들) 여러 개 고르는 자리다.
   *
   * ⚠ «잡는 단계»가 중요하다 — 아래 on('.chip') 은 document 에서 거품 단계로 듣는다.
   *   여기서 capture(true) 로 먼저 잡지 않으면, 내가 켠 것을 그쪽 toggle 이 되꺼 버린다. */
  (function 칩손질() {
    function 엑스단것(칩) { return 칩.getElementsByClassName('x')[0] || null; }

    document.querySelectorAll('.chips').forEach(function (묶음) {
      var 칩들 = Array.prototype.slice.call(묶음.getElementsByClassName('chip'));
      if (칩들.length < 2) return;
      if (묶음.querySelector('.chip[data-go]')) return;     // 어디로 가는 묶음은 고르는 자리가 아니다
      if (묶음.hasAttribute('data-band-pick')) return;      // 제 손잡이가 따로 있는 묶음
      var 켜진것 = 칩들.filter(function (c) { return c.classList.contains('on'); });
      if (켜진것.length !== 1) return;
      /* ✕ 가 «안 켜진 칩»에도 붙어 있으면 여러 개 고르는 자리다 */
      if (칩들.some(function (c) { return 엑스단것(c) && !c.classList.contains('on'); })) return;
      묶음.setAttribute('data-one', '');
    });

    document.addEventListener('click', function (e) {
      var 과녁 = e.target;
      if (!과녁 || !과녁.closest) return;

      /* ② 하나만 고르는 묶음 */
      var 이칩 = 과녁.closest('.chip');
      if (!이칩) return;
      if (이칩.dataset.go) return;                          // 이동하는 칩은 건드리지 않는다
      if (이칩.classList.contains('is-off')) return;
      if (이칩.closest('[data-band-pick]')) return;         // 제 임자가 있다
      var 그묶음 = 이칩.closest('.chips[data-one]');
      if (!그묶음) return;
      e.preventDefault();
      e.stopPropagation();
      /* ✕ 는 «지금 골라진 것»에 붙는 표시다. 고른 것이 바뀌면 같이 따라간다 —
         안 옮기면 옛 칩에 ✕ 가 남아 「이게 골라진 것」처럼 보인다. */
      var 옛엑스 = null;
      Array.prototype.forEach.call(그묶음.getElementsByClassName('chip'), function (c) {
        var x = 엑스단것(c);
        if (x && c !== 이칩) 옛엑스 = x;
        c.classList.toggle('on', c === 이칩);
      });
      if (옛엑스 && !엑스단것(이칩)) 이칩.appendChild(옛엑스);
      var 말 = 이칩.getAttribute('data-toast');
      if (말) toast(말);
    }, true);
  })();
    /* ⛔ 2026-09-02: 여기 «&& !묶음.querySelector('.chip .x')» 가 붙어 있었다.
       ✕ 가 달린 칩(여러 개 고르는 묶음)을 면제하려던 것인데, 이 팩에는 그런 칩이
       한 개도 없다 — 「전체」가 든 묶음 셋 다 하나만 고르는 자리다.
       늘 참인 조건은 읽는 사람을 헷갈리게만 한다. 뺀다. */
    if (한개만) {
      묶음.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
      t.classList.add('on');
      return;
    }
    t.classList.toggle('on');
  });

  /* 찜하기 */
  on('.heart', 'click', function (e, t) {
    e.preventDefault();
    var isOn = t.classList.toggle('on');
    t.textContent = isOn ? '♥' : '♡';
    toast(isOn ? '찜한 고수에 담았어요' : '찜을 해제했어요', isOn ? '찜 목록 보기' : '되돌리기');
  });

  /* 토글 스위치 */
  on('.toggle', 'click', function (e, t) {
    t.classList.toggle('on');
    if (t.dataset.toast) toast(t.dataset.toast);
  });

  /* 고르는 카드(라디오) */
  on('.radio', 'click', function (e, t) {
    if (t.classList.contains('is-off')) return;
    var name = t.dataset.group;
    if (!name) return;
    document.querySelectorAll('.radio[data-group="' + name + '"]').forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
  });

  /* 별점 입력 — 별을 누르면 그 자리까지 채운다 */
  on('.rate-in .st b', 'click', function (e, t) {
    var box = t.closest('.st');
    var list = Array.prototype.slice.call(box.querySelectorAll('b'));
    var i = list.indexOf(t);
    list.forEach(function (x, n) {
      x.classList.toggle('on', n <= i);
      x.textContent = n <= i ? '★' : '☆';
    });
    var v = box.parentElement.querySelector('.v');
    if (v) v.textContent = (i + 1) + '점';
  });

  /* 견적 고르기 — 체크한 개수가 하단 고정 바에 뜬다 */
  function syncPick() {
    var boxes = document.querySelectorAll('[data-pick]');
    if (!boxes.length) return;
    var n = 0;
    boxes.forEach(function (b) { if (b.checked) n++; });
    var bar = document.querySelector('[data-pick-bar]');
    if (!bar) return;
    bar.hidden = n < 1;
    bar.querySelectorAll('[data-pick-n]').forEach(function (x) { x.textContent = n; });
    var go = bar.querySelector('[data-pick-go]');
    if (go) {
      var few = n < 2;
      go.classList.toggle('is-off', few);
      go.disabled = few;
    }
  }
  document.addEventListener('change', function (e) {
    if (e.target.matches('[data-pick]')) syncPick();
  });
  document.addEventListener('DOMContentLoaded', syncPick);

  /* 잠글 수 있는 버튼은 <a> 대신 <button data-go="…"> 로 만든다(레이아웃견본_발견기록.md 지뢰 6).
     열려 있을 때만 눌러서 이동한다 — disabled 인 동안은 브라우저가 클릭 자체를 막지만,
     한 번 더 확인해 조용히 잠금이 풀리는 일을 막는다. */
  on('button[data-go]', 'click', function (e, t) {
    if (t.disabled) return;
    location.href = t.dataset.go;
  });

  /* 동의 체크박스 하나로 버튼 잠금 해제 — data-unlock="버튼id" */
  document.addEventListener('change', function (e) {
    var t = e.target.closest('[data-unlock]');
    if (!t) return;
    var b = document.getElementById(t.dataset.unlock);
    if (!b) return;
    b.disabled = !t.checked;
    b.classList.toggle('is-off', !t.checked);
  });

  /* 여러 체크박스를 «다» 체크해야 열리는 버튼 — 체크박스(data-agree)와
     버튼(data-unlock-all)이 반드시 같은 [data-agree-scope] 상자 안에 있어야 서로를 본다.
     레이아웃견본_발견기록.md: 두 상자로 갈라 두면 영영 안 열린다. */
  function syncUnlockAll(scope) {
    var boxes = scope.querySelectorAll('[data-agree]');
    var allOn = boxes.length > 0 && Array.prototype.every.call(boxes, function (b) { return b.checked; });
    scope.querySelectorAll('[data-unlock-all]').forEach(function (b) {
      b.disabled = !allOn;
      b.classList.toggle('is-off', !allOn);
    });
  }
  document.addEventListener('change', function (e) {
    var t = e.target.closest('[data-agree]');
    if (!t) return;
    var scope = t.closest('[data-agree-scope]');
    if (scope) syncUnlockAll(scope);
  });

  /* 전체 동의 — 아래 항목을 모두 따라가게 */
  document.addEventListener('change', function (e) {
    var t = e.target.closest('[data-agree-all]');
    if (!t) return;
    var scope = t.closest('[data-agree-scope]') || document;
    scope.querySelectorAll('[data-agree]').forEach(function (x) { x.checked = t.checked; });
  });

  /* 올린 사진 삭제 — 아이콘 버튼(✕)을 누르면 그 미리보기 칸을 지운다.
     이름이 같은 ✕ 가 여러 개라 「마지막 그물」의 이름-echo 토스트로는 둘째부터
     안 바뀐 것으로 보였다(2026-08-18). 지우는 게 진짜 삭제의 뜻이라 그걸로 고쳤다. */
  on('.icon-btn[aria-label="삭제"]', 'click', function (e, t) {
    var box = t.closest('div[style*="position:relative"]') || t.parentElement;
    if (box && box.parentElement) box.remove();
  });

  /* 첨부 이미지 「크게 보기」 — 제 글자를 접기/펼치기로 스스로 바꾼다.
     이름이 같은 버튼이 여럿이라 토스트만으로는 둘째부터 안 바뀐 것으로 보였다. */
  on('.btn-ghost.btn-sm', 'click', function (e, t) {
    var txt = t.textContent.trim();
    if (txt !== '크게 보기' && txt !== '접기') return;
    t.textContent = txt === '크게 보기' ? '접기' : '크게 보기';
  });

  /* 닫기 (배너·토스트·모달) */
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
    syncPick();
  });

  /* 달력 이전/다음 달 — 화면 안에서 끝나는 조작이라 실제로 바뀌어야 한다.
     프로토타입이라 날짜 칸은 그대로 두고 월 표시만 옮긴다. */
  on('.cal-mv', 'click', function (e, t) {
    var box = t.closest('.cal-hd'); if (!box) return;
    var el = box.querySelector('.cal-m'); if (!el) return;
    var m = /(\d{4})년\s*(\d{1,2})월/.exec(el.textContent); if (!m) return;
    var y = +m[1], mo = +m[2] + (+t.dataset.mv);
    if (mo < 1) { mo = 12; y -= 1; } else if (mo > 12) { mo = 1; y += 1; }
    el.textContent = y + '년 ' + mo + '월';
  });

  /* 달력 날짜 선택 */
  on('.cal-d', 'click', function (e, t) {
    if (t.classList.contains('off')) { toast(t.dataset.why || '이 날짜는 고를 수 없어요'); return; }
    var g = t.closest('.cal-grid');
    g.querySelectorAll('.cal-d').forEach(function (x) { x.classList.remove('sel'); });
    t.classList.add('sel');
  });

  /* 카운트다운 — data-count="180" (초). 시간 단위까지 센다. */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var left = parseInt(el.dataset.count, 10) || 0;
      var p = function (n) { return (n < 10 ? '0' : '') + n; };
      var tick = function () {
        var h = Math.floor(left / 3600), m = Math.floor((left % 3600) / 60), s = left % 60;
        el.textContent = h > 0 ? h + ':' + p(m) + ':' + p(s) : m + ':' + p(s);
        if (left <= 0) return;
        left--;
        setTimeout(tick, 1000);
      };
      tick();
    });
  });
  /* 행·카드 전체를 누르면 이동 — data-href.
     <a> 로 감싸면 그 안에 버튼(<a>)을 못 넣는다(브라우저가 바깥 <a> 를 끊는다).
     안의 링크·버튼을 눌렀을 때는 그쪽이 이긴다. */
  on('[data-href]', 'click', function (e, t) {
    if (e.target.closest('a, button, input, label, select, textarea')) return;
    location.href = t.dataset.href;
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var t = e.target.closest && e.target.closest('[data-href]');
    if (t && e.target === t) location.href = t.dataset.href;
  });


  /* 토스트 */
  var tRef = null;
  function toast(msg, action, kind) {
    if (tRef) tRef.remove();
    var d = document.createElement('div');
    d.className = 'toast' + (kind === 'ok' ? ' toast-ok' : '');
    d.innerHTML = '<span></span>' + (action ? '<span class="act">' + action + '</span>' : '<span class="act" data-close=".toast">닫기</span>');
    d.firstChild.textContent = msg;
    document.body.appendChild(d);
    tRef = d;
    setTimeout(function () { if (d.parentNode) d.remove(); }, 3400);
  }
  window.toast = toast;
  on('[data-toast]', 'click', function (e, t) {
    toast(t.dataset.toast, t.dataset.toastAct || '', t.dataset.toastKind || '');
  });

  /* 지도 핀 — 누르면 옆 미리보기의 이름이 바뀐다 */
  on('.map .pin', 'click', function (e, t) {
    var m = t.closest('.map');
    m.querySelectorAll('.pin').forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
    var pv = document.querySelector('[data-map-preview]');
    if (pv && t.dataset.name) {
      pv.querySelectorAll('[data-map-name]').forEach(function (x) { x.textContent = t.dataset.name; });
    }
  });

  /* 화면 정보 패널 */
  on('.dev-btn', 'click', function (e, t) {
    var box = t.closest('.dev');
    box.classList.toggle('on');
    try { localStorage.setItem('mt.spec', box.classList.contains('on') ? '1' : '0'); } catch (_) {}
  });
  document.addEventListener('DOMContentLoaded', function () {
    /* 화면 정보 패널은 «언제나 닫힌 채로» 시작한다 — 2026-08-09.
       전에는 마지막으로 열어 둔 상태를 기억해서, 한 번 열어 본 사람은 그 뒤 모든
       화면에서 개발용 패널이 펼쳐진 채로 열렸다. 손님이 받는 견본에서 가장 먼저
       보이면 안 되는 것이다. 누를 때만 열린다. */
  });

  /* 폼 전송은 프로토타입이므로 막고 안내만 */
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    toast('프로토타입 화면이에요. 실제로 전송되지 않습니다');
  });

  /* 가로로 넘치는 줄 — 아래 스크롤바 대신 좌우 화살표로 넘긴다.
     스크롤바는 있는 줄 모르고 지나치기 쉽다. */
  function carSync(box) {
    var wrap = box.closest('.car'); if (!wrap) return;
    var prev = wrap.querySelector('.car-nav.prev'), next = wrap.querySelector('.car-nav.next');
    var max = box.scrollWidth - box.clientWidth;
    if (prev) prev.disabled = box.scrollLeft <= 2;
    if (next) next.disabled = box.scrollLeft >= max - 2;
  }
  on('.car-nav', 'click', function (e, t) {
    var box = t.closest('.car').querySelector('.carousel');
    var card = box.firstElementChild;
    var step = card ? card.getBoundingClientRect().width + 20 : 288;
    box.scrollLeft += (t.classList.contains('prev') ? -1 : 1) * step * 2;
    setTimeout(function () { carSync(box); }, 350);
  });
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.car .carousel').forEach(function (b) {
      carSync(b);
      b.addEventListener('scroll', function () { carSync(b); });
    });
  });
  function 돈(n) { return Math.round(n).toLocaleString('ko-KR') + '원'; }
  /* 카드 목록 정렬 — <select data-sort-cards="키"> 와 <div data-sort-list="키">
     ⚠ 2026-08-18: 정렬 고르개가 색만 바뀌고 차례는 그대로였다. 스펙팩 acts 의
       「목록 차례가 …으로 바뀐다」를 지킨다. 카드에 실어 둔 값으로 그 자리에서 줄 세운다. */
  document.addEventListener('change', function (e) {
    var sel = e.target.closest && e.target.closest('[data-sort-cards]');
    if (!sel) return;
    var 상자 = document.querySelector('[data-sort-list="' + sel.dataset.sortCards + '"]');
    if (!상자) return;
    var 키 = sel.value || 'new';
    var 카드 = Array.prototype.slice.call(상자.children);
    카드.sort(function (a, b) {
      return Number(a.dataset[키] || 0) - Number(b.dataset[키] || 0);
    });
    카드.forEach(function (c) { 상자.appendChild(c); });
  });

  /* ---------- ★ ES-02 견적 결과 — 마감 등급 탭 · 「포함」 토글이 금액에 반영된다.
     data-base 는 「기본」(mult 1.0) 기준값이다 — 등급 탭을 누르면 base×mult 로
     다시 계산해서 각 칸·범위·공사 기간을 바꾸고, 합계는 켜진(포함) 줄만 더한다. ---------- */
  function es02합계() {
    var totalEl = document.querySelector('[data-grade-total]');
    if (!totalEl) return;
    var sum = 0;
    /* ⚠ 프리미엄은 「포함」을 .toggle 버튼이 아니라 checkbox 로 그린다.
       디럭스 손잡이를 그대로 옮겼더니 아무것도 안 세어져 합계가 0원이 됐다. */
    document.querySelectorAll('[data-base]').forEach(function (b) {
      if (b.tagName !== 'INPUT') return;
      if (b.checked) sum += Number(b.dataset.amt);
    });
    totalEl.textContent = 돈(sum);
  }
  on('[data-grade-pick] .tab', 'click', function (e, t) {
    var box = t.closest('[data-grade-pick]');
    box.querySelectorAll('.tab').forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
    var mult = Number(t.dataset.mult);
    document.querySelectorAll('[data-base]').forEach(function (el) {
      var amt = Math.round(Number(el.dataset.base) * mult);
      el.dataset.amt = amt;
      if (!el.classList.contains('toggle')) el.textContent = 돈(amt);
    });
    var priceEl = document.querySelector('[data-grade-price]');
    if (priceEl) {
      priceEl.textContent = 돈(Number(priceEl.dataset.minBase) * mult) + ' ~ ' + 돈(Number(priceEl.dataset.maxBase) * mult);
    }
    var daysEl = document.querySelector('[data-grade-days]');
    /* 「(주말 제외)」는 프리미엄 화면에 이미 옆 칸으로 있다 — 여기서 또 붙이면 두 번 나온다 */
    if (daysEl) daysEl.textContent = t.dataset.days + '일';
    es02합계();
  });
  /* 「포함」 체크를 끄면 총액에서 빠지고 그 줄에 취소선이 생긴다(스펙팩 acts). */
  document.addEventListener('change', function (e) {
    var cb = e.target.closest && e.target.closest('input[data-base]');
    if (!cb) return;
    var 줄 = cb.closest('tr');
    if (줄) {
      줄.style.textDecoration = cb.checked ? '' : 'line-through';
      줄.style.opacity = cb.checked ? '' : '.55';
    }
    es02합계();
  });

  /* ---------- ★ ES-01 견적 마법사 — 화면 하나에 6단계가 다 들어 있다.
     앞뒤로 오가도 답이 남고(단계는 감추기만 한다), 막대·「N단계 중 M번째」·오른쪽
     「지금까지 고른 조건」이 함께 따라 움직인다. ---------- */
  function 마법사그리기(wz) {
    var now = Number(wz.dataset.stepNow);
    var total = Number(wz.dataset.stepTotal);
    wz.querySelectorAll('[data-step]').forEach(function (p) {
      p.hidden = Number(p.dataset.step) !== now;
    });
    wz.querySelectorAll('[data-step-dot]').forEach(function (d) {
      var n = Number(d.dataset.stepDot);
      d.classList.toggle('on', n === now);
      d.classList.toggle('done', n < now);
    });
    /* 막대도 «끝낸 만큼»만 채운다 — 4단계에 서 있으면 3칸(50%)이 찬 것이다.
       단계 띠의 칠해진 줄과 막대가 같은 자리에서 끝나야 안 헷갈린다. */
    /* ⛔ 2026-09-02: 여기서 «.progress .fill» 만 찾고 있었다. 그런데 이 팩의 화면은
       «.bar > i» 로 구워졌고 base.css 도 .bar i 만 칠한다 — 셋 중 둘이 어긋나 있었다.
       그래서 단계는 넘어가는데 막대만 0% 에 붙박여 있었다(ES0101).
       ⚠ 눌러 보는 검수기(check-반응)는 이걸 못 잡는다 — 단추가 «다른 것»은 다 바꾸니
         「죽은 UI」가 아니다. 굽는 판마다 마크업이 갈리므로 둘 다 받는다. */
    var fill = wz.querySelector('.bar > i, .progress .fill');
    if (fill) fill.style.width = Math.round((now - 1) / total * 100) + '%';
    var label = wz.querySelector('[data-step-label]');
    if (label) label.textContent = total + '단계 중 ' + now + '번째';
    var prev = wz.querySelector('[data-step-prev]');
    if (prev) { prev.disabled = now === 1; prev.classList.toggle('is-off', now === 1); }
    var next = wz.querySelector('[data-step-next]');
    var done = wz.querySelector('[data-step-done]');
    if (next) next.hidden = now === total;
    if (done) done.hidden = now !== total;
  }
  on('[data-step-next]', 'click', function (e, t) {
    var wz = t.closest('[data-wizard]');
    var now = Number(wz.dataset.stepNow);
    if (now >= Number(wz.dataset.stepTotal)) return;
    wz.dataset.stepNow = now + 1;
    마법사그리기(wz);
  });
  on('[data-step-prev]', 'click', function (e, t) {
    var wz = t.closest('[data-wizard]');
    var now = Number(wz.dataset.stepNow);
    if (now <= 1) return;
    wz.dataset.stepNow = now - 1;
    마법사그리기(wz);
  });
  /* 막대의 단계 이름을 눌러서도 건너뛴다 — 이미 지나온 단계로 돌아가기 쉽게 */
  on('[data-step-dot]', 'click', function (e, t) {
    var wz = t.closest('[data-wizard]');
    wz.dataset.stepNow = t.dataset.stepDot;
    마법사그리기(wz);
  });
  /* 고른 답을 오른쪽 요약에 그대로 옮긴다 */
  document.addEventListener('change', function (e) {
    var f = e.target.closest('[data-field]');
    if (!f) return;
    var dd = document.querySelector('[data-answer="' + f.dataset.field + '"]');
    if (dd) dd.textContent = f.value;
  });
  /* 평수를 고치면 ㎡ 환산과 요약이 같이 바뀐다 (1평 = 3.3058㎡) */
  document.addEventListener('input', function (e) {
    var p = e.target.closest('[data-pyeong]');
    if (!p) return;
    var v = Number(p.value) || 0;
    var m2 = document.querySelector('[data-pyeong-m2]');
    if (m2) m2.textContent = (v * 3.3058).toFixed(1) + '㎡';
    var dd = document.querySelector('[data-answer="평수"]');
    if (dd) dd.textContent = v + '평';
  });
  /* 홈에서 평수 구간을 고르고 왔으면 2단계에 미리 채워 둔다.
     ⚠ 단계는 «건너뛰지 않는다» — 1단계부터 시작해서, 2단계에 오면 이미 값이
       들어 있고 「홈에서 30평대를 고르고 오셨어요」라고 알려 준다. */
  function 홈에서온평수(wz) {
    var q = new URLSearchParams(location.search);
    var py = Number(q.get('pyeong'));
    if (!py) return;
    var input = wz.querySelector('[data-pyeong]');
    if (input) { input.value = py; input.dispatchEvent(new Event('input', { bubbles: true })); }
    var band = q.get('band');
    var note = wz.querySelector('[data-from-home]');
    if (note && band) {
      var lb = note.querySelector('[data-from-home-label]');
      if (lb) lb.textContent = band;
      /* 「30평대를」 / 「40평대 이상을」 — 앞 글자에 받침이 있으면 «을», 없으면 «를». */
      var josa = note.querySelector('[data-from-home-josa]');
      if (josa) {
        var last = band.charCodeAt(band.length - 1) - 0xAC00;
        josa.textContent = (last >= 0 && last <= 11171 && last % 28 !== 0) ? '을' : '를';
      }
      note.hidden = false;
    }
  }
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-wizard]').forEach(function (wz) {
      홈에서온평수(wz);
      마법사그리기(wz);
    });
  });

  /* ---------- ★ ES-01 오른쪽 «예상 금액» — 고른 것 넷을 다 본다. (2026-09-02)
   *
   * ⛔ 여기 있던 것은 «고른 공간 개수»만 셌다. 그래서 눈으로 보다가 이렇게 나왔다 —
   *      평수     32평 → 45평        요약은 따라오는데
   *      공사 범위 전체 시공 → 부분 시공  요약은 따라오는데
   *      마감 등급 고급 → 프리미엄      요약은 따라오는데
   *      예상 금액 24,000,000원 ~ 31,000,000원   ← 한 푼도 안 움직였다
   *   바로 아래에 「고를 때마다 이 숫자가 바로 바뀌어요」라고 적어 두고서다.
   *   화면이 제 입으로 한 약속을 스스로 어기는 것이라, 손님이 제일 먼저 알아챈다.
   *
   * ⚠ 눌러 보는 검수기(check-반응)는 이걸 못 잡는다 — 체크박스를 누르면 «다른 것»은
   *   바뀌므로 「죽은 UI」가 아니다. 사람이 숫자를 보고서야 안다(검수항목 E2).
   *
   * 셈은 화면이 이미 쓰던 값에서 나왔다 — 기본값(32평·전체 시공·고급·공간 3개)에서
   * 24,000,000 ~ 31,000,000 이 그대로 나오게 맞췄다. 그래야 견본 첫 화면이 안 바뀐다.
   *
   * ⚠ 옛 주석은 「확정 견적(ES0201)보다 낮은 범위에서만 움직인다」고 했는데, 그건
   *   «마감 등급을 아직 안 물었을 때» 이야기다. 이제 등급까지 보므로 그 전제가 없다.
   *   ES0201 은 32평 기준으로 굳어 있는 견본 한 장이라 조건이 다르면 달라도 맞다. ---------- */
  var 바탕최소 = 24000000, 바탕최대 = 31000000;    // 32평 · 전체 시공 · 고급 · 공간 3개
  var 범위배 = { "전체 시공": 1, "부분 시공": 0.62 };
  var 등급배 = { "기본": 0.85, "고급": 1, "프리미엄": 1.22 };

  function 고른값(이름) {
    var el = document.querySelector('[data-field="' + 이름 + '"]:checked, select[data-field="' + 이름 + '"]');
    return el ? el.value : "";
  }

  function 견적다시() {
    var priceEl = document.querySelector('[data-space-price]');
    if (!priceEl) return;
    var 평 = Number((document.querySelector('[data-pyeong]') || {}).value) || 32;
    var 공간 = document.querySelectorAll('[data-space-pick] input[type=checkbox]:checked').length;
    var 배 = (평 / 32) *
             (범위배[고른값("공사 범위")] || 1) *
             (등급배[고른값("마감 등급")] || 1) *
             (1 + (공간 - 3) * 0.06);
    /* 공간을 하나도 안 고르면 «아직 못 잰다» — 0원이라고 말하지 않는다 */
    if (!공간) { priceEl.textContent = "공간을 고르면 계산해요"; return; }
    /* ⛔ 2026-09-02: 옛 코드는 «만원()» 을 불렀는데 이 파일에 그런 함수가 없다.
       그래서 공간을 눌러도 «던지고 죽어» 숫자가 한 번도 안 움직였다 —
       화면은 멀쩡히 떠 있고 콘솔만 조용히 붉었다. 이 팩의 돈 찍는 함수는 돈() 이다(341줄).
       ⚠ 없는 함수를 부르는 것은 check-헛선택자 도 못 잡는다 — 그건 «선택자»만 본다. */
    priceEl.textContent = 돈(Math.round(바탕최소 * 배 / 100000) * 100000) + " ~ " +
                          돈(Math.round(바탕최대 * 배 / 100000) * 100000);
  }

  /* 고른 공간 이름 목록은 따로 — 금액과 함께 움직인다 */
  function 공간목록다시() {
    var pick = document.querySelector('[data-space-pick]');
    if (!pick) return;
    var checked = pick.querySelectorAll('input[type=checkbox]:checked');
    var names = Array.prototype.map.call(checked, function (c) { return c.dataset.space; });
    var listEl = document.querySelector('[data-space-list]');
    if (listEl) listEl.textContent = names.length ? names.join(", ") : "아직 고르지 않음";
  }

  /* 넷 중 무엇이 바뀌어도 다시 센다 — 하나라도 빠지면 그것만 안 움직이는 그 사고가 또 난다 */
  document.addEventListener("change", function (e) {
    if (!e.target || !e.target.closest) return;
    if (!e.target.closest('[data-space-pick], [data-field]')) return;
    공간목록다시();
    견적다시();
  });
  document.addEventListener("input", function (e) {
    if (e.target && e.target.closest && e.target.closest('[data-pyeong]')) 견적다시();
  });

  /* ---------- ★ HO-01 평수 구간 칩 — 하나만 켜지고, 값이 따라오고, 견적으로 들고 간다.
   *              (2026-09-02 사장님과 눈으로 훑다가 나왔다)
   *
   * ⛔ 셋이 한꺼번에 잘못돼 있었다:
   *   ① 30평대와 40평대 이상이 «같이» 켜졌다 — 평수는 하나만 고르는 자리다.
   *      칩 하나만 켜지게 하는 장치가 「전체」가 든 묶음에만 걸려 있었는데, 이 묶음엔 없다.
   *   ② 40평대를 눌러도 아래 「30평대 … 3,200만원 ~ 4,600만원」이 그대로였다.
   *   ③ 「1분 예상 견적」으로 넘어가도 평수가 안 넘어갔다 — 견적 화면은 늘
   *      「홈에서 30평대를 고르고 오셨어요 · 32평」이었다. app.js 의 홈에서온평수() 는
   *      ?pyeong=&band= 을 기다리는데 링크에 그것이 없었다.
   *
   * ⚠ 칩은 「그 평수 기준으로 다시 계산했어요」라고 «말만» 하고 있었다.
   *   눌러 보는 검수기는 토스트가 뜨면 «반응»으로 세므로 이걸 못 잡는다.
   *   말한 대로 실제로 다시 계산하게 만드는 것이 고침이다. ---------- */
  (function 평수구간() {
    var 묶음 = document.querySelector('[data-band-pick]');
    if (!묶음) return;
    var 이름칸 = document.querySelector('[data-band-name]');
    var 값칸 = document.querySelector('[data-band-price-out]');

    function 그리기(칩) {
      묶음.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('on', c === 칩); });
      if (이름칸) 이름칸.textContent = 칩.dataset.band || '';
      if (값칸) 값칸.textContent = 칩.dataset.bandPrice || '';
      /* 견적으로 가는 손잡이에 «고른 평수»를 실어 둔다 — 눌렀을 때 그대로 넘어간다 */
      document.querySelectorAll('[data-band-go]').forEach(function (a) {
        var 길 = (a.getAttribute('href') || '').split('?')[0];
        a.setAttribute('href', 길 + '?pyeong=' + encodeURIComponent(칩.dataset.bandPyeong || '') +
                               '&band=' + encodeURIComponent(칩.dataset.band || ''));
      });
      toast('그 평수 기준으로 다시 계산했어요');
    }

    묶음.addEventListener('click', function (e) {
      var 칩 = e.target && e.target.closest ? e.target.closest('.chip') : null;
      if (칩 && 묶음.contains(칩)) 그리기(칩);
    });
    /* 화면이 열릴 때도 한 번 — 마크업에 켜 둔 칩의 값이 손잡이에 실려 있어야 한다 */
    var 켜진것 = 묶음.querySelector('.chip.on') || 묶음.querySelector('.chip');
    if (켜진것) {
      if (이름칸) 이름칸.textContent = 켜진것.dataset.band || 이름칸.textContent;
      if (값칸) 값칸.textContent = 켜진것.dataset.bandPrice || 값칸.textContent;
      document.querySelectorAll('[data-band-go]').forEach(function (a) {
        var 길 = (a.getAttribute('href') || '').split('?')[0];
        a.setAttribute('href', 길 + '?pyeong=' + encodeURIComponent(켜진것.dataset.bandPyeong || '') +
                               '&band=' + encodeURIComponent(켜진것.dataset.band || ''));
      });
    }
  })();


})();

/* ── 마지막 그물 ──────────────────────────────────────────
   눌러도 아무 손잡이에 안 걸린 버튼에게 «그래도 답»을 준다.
   누르기 전 화면을 적어 두고, 다른 손잡이가 다 돈 뒤에도 그대로일 때만 나선다.
   ⚠ 이미 제대로 도는 버튼은 여기까지 오지 않는다 — 화면이 이미 바뀌었기 때문이다.
   ────────────────────────────────────────────────────────── */
(function () {
  function 이름(t) {
    var s = (t.getAttribute('aria-label') || t.textContent || '').trim().replace(/\s+/g, ' ');
    return s.slice(0, 20);
  }
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('button:not([disabled])') : null;
    if (!t) return;
    if (t.closest('.dev')) return;                       // 화면 정보 패널은 견본 장치다
    if (t.dataset && (t.dataset.toast || t.dataset.modal || t.dataset.go ||
                      t.dataset.close || t.dataset.dismiss)) return;  // 이미 제 답이 있다
    var 전 = document.body.innerHTML;
    setTimeout(function () {
      if (document.body.innerHTML !== 전) return;        // 누군가 이미 답했다

      // ① 무리 지어 고르는 버튼 — 형제 중에 «골라진 것»이 있으면 그 표시를 옮긴다
      var 상자 = t.parentElement;
      if (상자) {
        var 형제 = Array.prototype.filter.call(상자.children, function (c) { return c.tagName === 'BUTTON'; });
        var 골라진 = 형제.filter(function (b) { return b.classList.contains('on') || b.classList.contains('sel'); });
        if (형제.length > 1 && 골라진.length > 0) {
          var 표 = 골라진[0].classList.contains('sel') ? 'sel' : 'on';
          형제.forEach(function (b) { b.classList.remove(표); });
          t.classList.add(표);
          return;
        }
      }

      // ② 앞뒤 화살표 — 가까이에 가로로 흐르는 목록이 있으면 굴린다
      var 앞뒤 = /prev|next|이전|다음|‹|›/.test(t.className + ' ' + 이름(t));
      if (앞뒤) {
        var 둘레 = t.closest('section, .card, .box, div');
        for (var i = 0; i < 3 && 둘레; i++) {
          var 목록 = 둘레.querySelector('.carousel, [style*="overflow-x"], .row[style*="overflow"]');
          if (목록 && 목록.scrollWidth > 목록.clientWidth) {
            var 뒤로 = /prev|이전|‹/.test(t.className + ' ' + 이름(t));
            목록.scrollLeft += (뒤로 ? -1 : 1) * Math.max(240, 목록.clientWidth * 0.8);
            return;
          }
          둘레 = 둘레.parentElement;
        }
      }

      // ③ 그 밖에는 제 이름으로 알림 — 견본 화면이 줄 수 있는 정직한 답이다
      if (typeof window.toast === 'function') window.toast(이름(t) + ' — 눌렀어요');
    }, 0);
  }, true);
})();
/* ── 마지막 그물 끝 ── */

/* 2026-08-18 — 디럭스 재점검에서 나온 「고르개가 옆을 못 움직이는」 자리 넷을
   프리미엄에도 그대로 옮긴다. 한쪽 등급만 고치고 끝내지 않는다(검수항목 G7). */
(function () {
  var 천 = function (n) { return Math.round(n).toLocaleString('ko-KR'); };
  var 조사 = function (말, 있, 없) {
    var c = 말.charCodeAt(말.length - 1) - 0xac00;
    return 말 + (c >= 0 && c <= 11171 && c % 28 !== 0 ? 있 : 없);
  };

  document.addEventListener('change', function (e) {
    var t = e.target; if (!t || !t.matches) return;

    /* CT0201 할부 개월 → 월 납입액 */
    if (t.matches('[data-halbu]')) {
      var 액 = Number(t.dataset.amt || 0);
      var 달 = Number((t.value.match(/\d+/) || [1])[0]);
      var 글 = document.querySelector('[data-halbu-out]');
      if (글) 글.textContent = 달 <= 1
        ? '일시불 — ' + 천(액) + '원을 한 번에 냅니다.'
        : t.value + ' — 월 ' + 천(액 / 달) + '원 · 6개월까지 무이자입니다.';
    }

    /* OW0301 팀 배정 → 겹침 경고 */
    if (t.matches('[data-team]')) {
      var 알림 = document.querySelector('[data-team-out]');
      var 공정 = t.closest('tr') ? t.closest('tr').cells[0].textContent.trim() : '이 공정';
      if (알림) {
        var 바쁨 = (알림.dataset.busy || '').split(',').indexOf(t.value) >= 0;
        알림.innerHTML = 바쁨
          ? '<b>' + t.value + ' 배정 충돌</b> — ' + (알림.dataset.when || '') + '에 다른 현장('
            + (알림.dataset.where || '') + ')과 겹칩니다. ' + 조사(공정, '을', '를') + ' 다시 보세요.'
          : '<b>겹치는 일정 없음</b> — ' + 조사(공정, '을', '를') + ' ' + t.value + '에 배정했어요.';
      }
    }

    /* OW0401 발주 상태 → 그 줄 배지 + 위 「발주 안 한 것」 숫자 */
    if (t.matches('[data-po-st]')) {
      var 색 = (t.dataset.poCls || '').split(',')[t.selectedIndex] || 'b-mut';
      var 배지 = t.closest('td').querySelector('[data-po-badge]');
      if (배지) 배지.innerHTML = '<span class="badge ' + 색 + '">' + t.value + '</span>';
      var 남 = document.querySelector('[data-po-left]');
      if (남) 남.textContent = Array.prototype.filter.call(
        document.querySelectorAll('[data-po-st]'), function (s) { return s.selectedIndex === 0; }).length;
    }
  });

  document.addEventListener('click', function (e) {
    /* OW0401 공정 칩 → 자재 목록을 그 공정 것만 남긴다 */
    var 칩 = e.target.closest && e.target.closest('[data-proc-chip]');
    if (칩) {
      var 골 = 칩.textContent.trim();
      Array.prototype.forEach.call(document.querySelectorAll('.tbl-mat tr.mat-row'), function (tr) {
        tr.hidden = !(골 === '전체' || tr.cells[0].textContent.trim().indexOf(골) >= 0);
      });
    }

    /* CT0301 착공일 달력 → 위 안내 문구의 날짜 */
    var 날 = e.target.closest && e.target.closest('[data-chakgong] .cal-d');
    if (날 && !날.classList.contains('off') && 날.textContent.trim()) {
      /* 칸 안에 '30가능'처럼 뒷말이 붙어 있어 앞의 숫자만 떼어 낸다 */
      var d = Number((날.textContent.trim().match(/^\d+/) || [0])[0]);
      var 글자 = document.querySelector('[data-chakgong-out]');
      /* 위 안내 문구가 처음부터 '2026-09-10' 꼴이라 같은 꼴로 맞춘다 */
      if (글자 && d) 글자.textContent = '2026-09-' + (d < 10 ? '0' + d : d);
    }
  });
})();

/* ── GNB·LNB 에 «지금 여기»를 켠다 (검수항목 H5 · 2026-08-21 사장님 지적) ──
 *
 * 무엇이 잘못돼 있었나
 *   빌더가 «앞 두 글자»만 맞으면 다 켰다 —
 *     n.id.slice(0,2) === activeId.slice(0,2)
 *   그래서 HO-01 을 보고 있으면 홈·공구 목록·마감 임박이 «한꺼번에» 켜졌다.
 *   반대로 어떤 팩은 아무것도 안 켜져서, 어느 메뉴에 와 있는지 알 길이 없었다.
 *   («.gnb-nav a.on» 스타일 규칙은 만들어 두고 켜는 자리가 없던 팩도 있었다.)
 *
 * 어떻게 고치나 — 켜진 것은 «언제나 하나»여야 한다
 *   ① 지금 쪽과 «딱 맞는» 링크가 있으면 그것
 *   ② 없으면 «같은 갈래의 첫 링크»(대표 화면)
 *   ③ 그 밖은 모두 끈다
 *
 * ⚠ 페이지를 다시 찍지 않고 여기서 바로잡는다 — 다시 찍으면 끼워 둔 사진이 날아간다. */
(function () {
  'use strict';
  var 지금 = (document.body && document.body.dataset && document.body.dataset.page) || '';
  if (!지금) return;
  var 갈래 = 지금.slice(0, 2);
  var 칸들 = document.querySelectorAll('.gnb-nav, .ednav-menu, .gnb-menu, .nav-menu, .side, .edrail, .lnb, .snb');
  for (var i = 0; i < 칸들.length; i++) {
    var 칸 = 칸들[i];
    if (칸.closest && 칸.closest('footer, .ft')) continue;
    var 고리 = 칸.querySelectorAll('a[href]');
    if (고리.length < 2) continue;
    var 딱 = null, 같은갈래 = null;
    for (var j = 0; j < 고리.length; j++) {
      var 갈곳 = (고리[j].getAttribute('href') || '').split('/').pop().split('#')[0].replace(/\.html$/, '');
      if (!갈곳) continue;
      if (갈곳 === 지금) { 딱 = 고리[j]; break; }
      if (!같은갈래 && 갈곳.slice(0, 2) === 갈래) 같은갈래 = 고리[j];
    }
    var 켤것 = 딱 || 같은갈래;
    for (var k = 0; k < 고리.length; k++) {
      고리[k].classList.remove('on');
      고리[k].removeAttribute('aria-current');
    }
    if (켤것) { 켤것.classList.add('on'); 켤것.setAttribute('aria-current', 'page'); }
  }
})();
