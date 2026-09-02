/* 반려견 유치원 등원 예약·운영 — 공통 인터랙션
   프로토타입용 최소 동작: 탭 / 아코디언 / 칩 / 거르기 / 찾기 / 쪽수 / 토스트 / 모달 /
   달력 여러 날 고르기 / 요일 고르기 / 등하원 체크(회차권 차감·되돌리기) /
   반 편성 보드(끌어다 놓기) / 알림장 사진 대표 지정·차례 바꾸기 / 잠금 해제

   ⚠ 「눌렀는데 아무 일도 안 일어나는 것」이 이 팩들에서 가장 많이 나온 사고다.
     스펙팩 acts 에 「…가 바뀐다」고 적힌 것은 값만이 아니라 «화면»이 바뀌어야 한다. */
(function () {
  'use strict';

  function on(sel, ev, fn) {
    document.addEventListener(ev, function (e) {
      var t = e.target.closest ? e.target.closest(sel) : null;
      if (t) fn(e, t);
    });
  }
  function 모두(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  /* 받침을 보고 조사를 고른다 — 「초코가」·「보리가」처럼 읽히게 한다 */
  function 조사(말, 있, 없) {
    var s = String(말); var c = s.charCodeAt(s.length - 1) - 0xac00;
    return s + (c >= 0 && c <= 11171 && c % 28 !== 0 ? 있 : 없);
  }
  function 돈(n) { return Math.round(n).toLocaleString('ko-KR') + '원'; }

  /* ---------- 물어보기(확인)·적어받기(입력) ----------
     ⚠ 여기서는 window.confirm()·window.prompt() 를 쓰지 않는다.
       판매팩 검수 도구(check-반응.mts)가 --headless=new 크롬으로 모든 버튼을 눌러 보는데,
       새 headless 는 옛 headless 와 달리 confirm·prompt 를 자동으로 닫아 주지 않고
       «응답할 사람이 없는 채로 영원히 멈춘다»(2026-08-24, 41장 검수가 실제로 이렇게 멎었다).
       그래서 이 팩의 모든 확인·입력은 .dim/.modal 로 직접 띄우고 콜백으로 이어 받는다. */
  function 물어보기(제목, 내용, 확인글, 하기) {
    var d = document.createElement('div');
    d.className = 'dim';
    d.innerHTML = '<div class="modal"><div class="m-hd"><h3 class="t-card">' + 제목 + '</h3>'
      + '<button class="x" type="button" data-dismiss aria-label="닫기">✕</button></div>'
      + '<div class="m-bd"><p class="t-sub" style="white-space:pre-line">' + 내용 + '</p></div>'
      + '<div class="m-ft"><button class="btn btn-ghost" type="button" data-dismiss>취소</button>'
      + '<button class="btn btn-pri" type="button" data-ok>' + (확인글 || '확인') + '</button></div></div>';
    d.addEventListener('click', function (ev) {
      if (ev.target === d || ev.target.closest('[data-dismiss]')) { d.remove(); return; }
      if (ev.target.closest('[data-ok]')) { d.remove(); 하기(); }
    });
    document.body.appendChild(d);
  }
  /** 두 갈래 중 하나를 고르게 한다(예/아니오가 아니라 각자 다른 다음 동작일 때) */
  function 골라받기(제목, 내용, 왼쪽글, 오른쪽글, 왼쪽하기, 오른쪽하기) {
    var d = document.createElement('div');
    d.className = 'dim';
    d.innerHTML = '<div class="modal"><div class="m-hd"><h3 class="t-card">' + 제목 + '</h3>'
      + '<button class="x" type="button" data-dismiss aria-label="닫기">✕</button></div>'
      + '<div class="m-bd"><p class="t-sub" style="white-space:pre-line">' + 내용 + '</p></div>'
      + '<div class="m-ft"><button class="btn btn-ghost" type="button" data-alt>' + 왼쪽글 + '</button>'
      + '<button class="btn btn-pri" type="button" data-ok>' + 오른쪽글 + '</button></div></div>';
    d.addEventListener('click', function (ev) {
      if (ev.target === d || ev.target.closest('[data-dismiss]')) { d.remove(); return; }
      if (ev.target.closest('[data-ok]')) { d.remove(); 오른쪽하기(); return; }
      if (ev.target.closest('[data-alt]')) { d.remove(); 왼쪽하기(); }
    });
    document.body.appendChild(d);
  }
  function 적어받기(제목, 내용, 기본값, 하기) {
    var d = document.createElement('div');
    d.className = 'dim';
    d.innerHTML = '<div class="modal"><div class="m-hd"><h3 class="t-card">' + 제목 + '</h3>'
      + '<button class="x" type="button" data-dismiss aria-label="닫기">✕</button></div>'
      + '<div class="m-bd"><p class="t-sub" style="white-space:pre-line">' + 내용 + '</p>'
      + '<input class="in mt3" type="text" data-val></div>'
      + '<div class="m-ft"><button class="btn btn-ghost" type="button" data-dismiss>취소</button>'
      + '<button class="btn btn-pri" type="button" data-ok>확인</button></div></div>';
    var 입력 = d.querySelector('[data-val]');
    입력.value = 기본값 || '';
    d.addEventListener('click', function (ev) {
      if (ev.target === d || ev.target.closest('[data-dismiss]')) { d.remove(); return; }
      if (ev.target.closest('[data-ok]')) { var v = 입력.value; d.remove(); 하기(v); }
    });
    document.body.appendChild(d);
    setTimeout(function () { 입력.focus(); }, 0);
  }

  /* ---------- 시계 ----------
     화면마다 «지금이 몇 시인지»가 다르다 — 등원 체크는 아침, 하원 체크는 저녁이다.
     <body data-now="09:34"> 로 그 화면의 기준 시각을 받고, 거기서 실제 초를 더해 간다. */
  var 시작 = Date.now();
  function 기준() {
    var v = (document.body && document.body.dataset.now) || '09:00';
    var p = v.split(':');
    return Number(p[0]) * 3600 + Number(p[1]) * 60;
  }
  function 지금초() { return 기준() + Math.floor((Date.now() - 시작) / 1000); }
  function 두자리(n) { return (n < 10 ? '0' : '') + n; }
  function 시각(sec) { return 두자리(Math.floor(sec / 3600) % 24) + ':' + 두자리(Math.floor(sec / 60) % 60); }
  function 초로(hhmm) { var p = String(hhmm).split(':'); return Number(p[0]) * 3600 + Number(p[1]) * 60; }
  function 걸린시간(sec) {
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    return h > 0 ? h + '시간 ' + m + '분' : m + '분';
  }

  /* ============================================================
     탭 — 같은 묶음 안에서만 활성 전환.
     ⚠ 탭과 몸통은 «같은 상자» 안에 있어야 한다 — box.parentElement 안에서만 찾는다.
       갈라 놓으면 «눌리기는 하는데 내용이 안 바뀌는» 탭이 된다.
     ============================================================ */
  on('.tab', 'click', function (e, t) {
    var 여기 = location.pathname.split('/').pop();
    if (t.dataset.go && t.dataset.go !== 여기) { location.href = t.dataset.go; return; }
    var box = t.closest('.tabs, .tabs-pill');
    if (!box) return;
    모두('.tab', box).forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
    var key = t.dataset.pane;
    if (key) {
      var scope = box.parentElement;
      모두('[data-pane-body]', scope).forEach(function (p) { p.hidden = p.dataset.paneBody !== key; });
    }
  });

  /* 잠기는 버튼은 <a> 로 못 만든다 — <button data-go="…"> 로 만들고 여기서 옮긴다 */
  on('.btn[data-go]', 'click', function (e, t) {
    if (t.disabled || t.classList.contains('is-off')) return;
    location.href = t.dataset.go;
  });

  /* 아코디언 */
  on('.acc-q', 'click', function (e, t) { t.closest('.acc-item').classList.toggle('on'); });

  /* 칩 — 「전체」가 든 묶음은 하나만 골라진다 */
  on('.chip', 'click', function (e, t) {
    if (t.dataset.go) { location.href = t.dataset.go; return; }
    if (t.classList.contains('is-off') || t.disabled) return;
    var 묶음 = t.closest('.chips');
    var 한개만 = 묶음 && !묶음.hasAttribute('data-multi')
      && Array.prototype.some.call(묶음.querySelectorAll('.chip'), function (c) {
        return /^전체(\s*보기)?$/.test((c.textContent || '').trim());
      });
    if (한개만) {
      모두('.chip', 묶음).forEach(function (c) { c.classList.remove('on'); });
      t.classList.add('on');
    } else {
      t.classList.toggle('on');
    }
    if (묶음) { 거르기(묶음); 고른것갱신(묶음.dataset.pickScope); }
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
      /* ① ✕ — 그 칩만 지운다 */
      var 엑스 = 과녁.closest('.chip .x');
      if (엑스) {
        var 칩 = 엑스.closest('.chip');
        var 말 = 칩 && 칩.getAttribute('data-toast');
        e.preventDefault();
        e.stopPropagation();
        if (칩) 칩.remove();
        if (말) toast(말);
        return;
      }


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

  /* 토글 스위치 */
  on('.toggle', 'click', function (e, t) {
    var on = t.classList.toggle('on');
    t.setAttribute('aria-pressed', String(on));
    if (t.dataset.toast) toast(t.dataset.toast);
    /* 켜면 아래 칸이 펼쳐지는 토글 — data-open="상자id" */
    if (t.dataset.open) {
      var 상자 = document.getElementById(t.dataset.open);
      if (상자) 상자.hidden = !on;
    }
  });

  /* 고르는 카드(라디오처럼) */
  on('.radio', 'click', function (e, t) {
    if (t.classList.contains('is-off')) return;
    var name = t.dataset.group;
    if (!name) return;
    모두('.radio[data-group="' + name + '"]').forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
  });

  /* 숫자 늘리고 줄이기 */
  on('[data-step-mv]', 'click', function (e, t) {
    var 상자 = t.closest('.step'); if (!상자) return;
    var v = 상자.querySelector('.v');
    var n = Math.max(0, (Number(v.textContent.replace(/[^\d]/g, '')) || 0) + Number(t.dataset.stepMv));
    v.textContent = n;
    if (상자.dataset.stepOut) {
      모두('[data-step-in="' + 상자.dataset.stepOut + '"]').forEach(function (x) { x.textContent = n; });
    }
  });

  /* ============================================================
     동의 체크로 버튼 잠금 해제 (RE-05 결제 · MY-03 해지)
     ============================================================ */
  document.addEventListener('change', function (e) {
    var t = e.target.closest('[data-unlock]');
    if (!t) return;
    var b = document.getElementById(t.dataset.unlock);
    if (!b) return;
    b.disabled = !t.checked;
    b.classList.toggle('is-off', !t.checked);
  });
  function syncUnlockAll(scope) {
    모두('[data-unlock-all]', scope).forEach(function (any) {
      var b = document.getElementById(any.dataset.unlockAll);
      if (!b) return;
      var boxes = scope.querySelectorAll('[data-agree]');
      var all = boxes.length > 0 && Array.prototype.every.call(boxes, function (x) { return x.checked; });
      b.disabled = !all;
      b.classList.toggle('is-off', !all);
    });
  }
  document.addEventListener('change', function (e) {
    var t = e.target.closest('[data-agree]');
    if (!t) return;
    syncUnlockAll(t.closest('[data-agree-scope]') || document);
  });
  document.addEventListener('change', function (e) {
    var t = e.target.closest('[data-agree-all]');
    if (!t) return;
    var scope = t.closest('[data-agree-scope]') || document;
    모두('[data-agree]', scope).forEach(function (x) { x.checked = t.checked; });
    syncUnlockAll(scope);
  });

  /* ============================================================
     ★ 「고른 개수를 숫자로 보여주고, 하나도 안 골랐으면 눌리지 않게」
     스펙팩 acts 「선택」이 여덟 화면에 걸려 있다. 한 손잡이로 다 받는다.
       상자에 data-pick-scope="키" · 항목에 .chip.on 또는 :checked
       숫자 자리 [data-pick-out="키"] · 잠기는 버튼 [data-pick-btn="키"]
     ============================================================ */
  function 고른수(key) {
    var 상자 = document.querySelector('[data-pick-scope="' + key + '"]');
    if (!상자) return 0;
    var 칩 = 상자.querySelectorAll('.chip.on:not(.is-off), .cal-d.sel');
    if (칩.length) return 칩.length;
    return 상자.querySelectorAll('input:checked').length;
  }
  function 고른것갱신(key) {
    if (!key) return;
    var n = 고른수(key);
    모두('[data-pick-out="' + key + '"]').forEach(function (x) { x.textContent = n; });
    모두('[data-pick-btn="' + key + '"]').forEach(function (b) {
      b.disabled = n === 0;
      b.classList.toggle('is-off', n === 0);
    });
    if (key === 'dow') 요일값갱신();
    if (key === 'day') 날짜값갱신();
    return n;
  }
  document.addEventListener('change', function (e) {
    var 상자 = e.target.closest && e.target.closest('[data-pick-scope]');
    if (상자) 고른것갱신(상자.dataset.pickScope);
  });

  /* ============================================================
     ★ RE-02 정기 등원 요일 — 고를 때마다 요약과 값이 다시 계산된다
     ============================================================ */
  function 요일값갱신() {
    var 상자 = document.querySelector('[data-pick-scope="dow"]');
    if (!상자) return;
    var 고름 = 모두('.chip.on', 상자).map(function (c) { return c.dataset.dow; });
    var 표 = {};
    try { 표 = JSON.parse(상자.dataset.priceMap || '{}'); } catch (err) { 표 = {}; }
    var 값 = 표[String(고름.length)] || 0;
    모두('[data-dow-list]').forEach(function (x) {
      x.textContent = 고름.length ? '매주 ' + 고름.join('·') + ' 등원' : '아직 요일을 고르지 않았어요';
    });
    모두('[data-dow-price]').forEach(function (x) {
      x.textContent = 고름.length ? 돈(값) : '—';
    });
    모두('[data-dow-per]').forEach(function (x) {
      x.textContent = 고름.length ? '주 ' + 고름.length + '회 · 월 약 ' + (고름.length * 4) + '회 등원' : '주 0회';
    });
  }

  /* ============================================================
     ★ RE-03 낱개 예약 달력 — 여러 날을 고르고, 회차권과 견줘 준다
     ============================================================ */
  on('[data-cal-multi] .cal-d[data-day]', 'click', function (e, t) {
    if (t.disabled || t.classList.contains('full') || t.classList.contains('cal-blank')) return;
    t.classList.toggle('sel');
    고른것갱신('day');
  });
  function 날짜값갱신() {
    var 격자 = document.querySelector('[data-cal-multi]');
    if (!격자) return;
    var 고름 = 모두('.cal-d.sel', 격자);
    var n = 고름.length;
    var 표 = document.querySelector('[data-pass-left]');
    var 잔여 = 표 ? Number(표.dataset.passLeft) || 0 : 0;
    모두('[data-day-list]').forEach(function (x) {
      x.textContent = n ? 고름.map(function (c) { return c.dataset.day + '일(' + c.dataset.dow + ')'; }).join(', ') : '아직 날짜를 고르지 않았어요';
    });
    모두('[data-day-sum]').forEach(function (x) {
      x.textContent = n
        ? '선택한 ' + n + '일 · 보유 회차권 ' + 잔여 + '회 중 ' + Math.min(n, 잔여) + '회 차감돼요'
        : '날짜를 고르면 차감될 회차권을 알려드려요';
    });
    var 모자람 = n > 잔여;
    모두('[data-day-short]').forEach(function (x) {
      x.hidden = !모자람;
      var 말 = x.querySelector('[data-day-short-n]');
      if (말) 말.textContent = (n - 잔여);
    });
    모두('[data-day-left]').forEach(function (x) { x.textContent = Math.max(0, 잔여 - n); });
    /* 회차권이 모자라면 다음으로 못 간다 — 먼저 회차권을 사야 한다 */
    모두('[data-pick-btn="day"]').forEach(function (b) {
      var 막힘 = n === 0 || 모자람;
      b.disabled = 막힘;
      b.classList.toggle('is-off', 막힘);
    });
  }
  /* 달 이동 — 지난 달로는 못 돌아간다 */
  on('.cal-mv[data-mv]', 'click', function (e, t) {
    if (t.disabled) return;
    var hd = t.closest('.cal-hd');
    var 달 = hd.querySelector('.cal-m');
    var m = /(\d+)년 (\d+)월/.exec(달.textContent);
    if (!m) return;
    var y = Number(m[1]), mo = Number(m[2]) + Number(t.dataset.mv);
    if (mo > 12) { mo = 1; y += 1; } if (mo < 1) { mo = 12; y -= 1; }
    달.textContent = y + '년 ' + mo + '월';
    var 뒤로 = hd.querySelector('.cal-mv[data-mv="-1"]');
    if (뒤로) 뒤로.disabled = (y === 2026 && mo <= 9);
    toast(y + '년 ' + mo + '월 자리를 불러왔어요');
  });

  /* ============================================================
     ★ AT-02 등원 체크 — 이 팩의 알맹이 ①
     누르면 ① 시각이 적히고 ② 회차권이 «눈앞에서» 1회 줄고 ③ 5분짜리 되돌리기가 뜬다.
     예약 시간보다 15분 넘게 늦으면 「지각」 배지를 함께 붙인다.
     ============================================================ */
  var 되돌리기함 = {};
  on('[data-checkin]', 'click', function (e, t) {
    if (t.disabled || t.classList.contains('is-off')) return;
    var 줄 = t.closest('.pc-check');
    var id = t.dataset.checkin, 이름 = t.dataset.dog;
    var 지금 = 지금초(), 적을시각 = 시각(지금);
    var 늦음 = 지금 - 초로(t.dataset.want || '09:00');
    var 지각 = 늦음 >= 15 * 60;
    var 칸 = 줄.querySelector('.act');
    var 표 = 줄.querySelector('[data-pass-n]');
    var 전잔여 = 표 ? Number(표.textContent) : null;
    var 남음 = 전잔여 == null ? null : Math.max(0, 전잔여 - 1);

    되돌리기함[id] = { html: 칸.innerHTML, pass: 전잔여 };

    칸.innerHTML =
      '<span class="pc-slip"><span class="t">' + 적을시각 + ' 등원 완료</span>' +
      (남음 == null
        ? '<span class="badge b-acc">정기 요일권</span>'
        : '<span class="badge b-acc">회차권 1회 차감</span>' +
          '<span class="pc-pass cut" data-pass-for="' + id + '">잔여 <b data-pass-n>' + 남음 + '</b>회</span>') +
      (지각 ? '<span class="badge b-warn">지각 ' + Math.floor(늦음 / 60) + '분</span>' : '') +
      '</span>' +
      '<button class="pc-undo" type="button" data-undo="' + id + '">되돌리기 <span data-undo-left="' + id + '">5:00</span></button>';
    줄.classList.add('done');
    미체크세기();
    되돌리기시계(id);
    toast(조사(이름, '이가', '가') + ' ' + 적을시각 + '에 등원했어요' +
      (남음 == null ? '' : ' · 회차권 ' + 전잔여 + '회 → ' + 남음 + '회'), '', 'ok');
  });

  /* 5분 안에만 되돌릴 수 있다 — 남은 시간을 세어 보여 주고, 0 이 되면 사라진다 */
  function 되돌리기시계(id) {
    var 남 = 5 * 60;
    var tick = function () {
      var 칸 = document.querySelector('[data-undo-left="' + id + '"]');
      if (!칸) return;
      칸.textContent = Math.floor(남 / 60) + ':' + 두자리(남 % 60);
      if (남 <= 0) {
        var 단추 = document.querySelector('[data-undo="' + id + '"]');
        if (단추) 단추.remove();
        delete 되돌리기함[id];
        return;
      }
      남--;
      setTimeout(tick, 1000);
    };
    tick();
  }
  on('[data-undo]', 'click', function (e, t) {
    var id = t.dataset.undo, 기억 = 되돌리기함[id];
    if (!기억) return;
    var 줄 = t.closest('.pc-check');
    줄.querySelector('.act').innerHTML = 기억.html;
    줄.classList.remove('done');
    delete 되돌리기함[id];
    미체크세기();
    toast('등원 체크를 되돌렸어요 · 회차권도 돌려놨습니다');
  });
  function 미체크세기() {
    var 칸 = document.querySelector('[data-untick]');
    if (!칸) return;
    /* ⚠ 잠긴 줄(백신 확인 대기)도 «아직 안 온 아이»다. 2026-09-01 에 여기서 걸렸다 —
       루키가 잠겨 있다고 빼고 세는 바람에 명단에는 5마리가 보이는데 숫자는 4였고,
       옆 칸의 「오늘 예약 24마리 중」과도 16+3+4=23 으로 한 마리가 비었다.
       세는 것은 «온 아이»의 반대다. 체크를 누를 수 있느냐와는 다른 물음이다. */
    var 안온줄 = 모두('.pc-check[data-row]').filter(function (r) {
      return !r.classList.contains('done');
    });
    var n = 안온줄.length;
    칸.textContent = n;
    /* ⚠ 「아직 안 온 아이」만 고치면 옆의 「등원 완료」가 붙박이로 남아 숫자가 안 맞는다.
       2026-08-25 에 초코를 체크했는데 4→3 으로만 줄고 16 은 그대로였다. 둘을 같이 움직인다. */
    var 완 = document.querySelector("[data-done-n]");
    if (완) {
      var 끝난줄 = 모두(".pc-check[data-row].done").length;
      /* ⚠ 붙박이 16 은 명단에 이미 들어 있는 5마리를 «포함한» 수다.
         그냥 더하면 겹쳐 셔 21 로 시작한다. 밑값을 빼 놓고 센다. */
      if (완.dataset.base == null) 완.dataset.base = Number(완.textContent.trim()) - 끝난줄;
      완.textContent = Number(완.dataset.base) + 끝난줄;
    }
    /* 잠긴 줄은 «세는 데»서는 함께 세고, «말»에서만 따로 알려 준다 —
       그래야 숫자와 명단이 어긋나지 않으면서 왜 못 누르는지도 보인다. */
    var 잠김 = 안온줄.filter(function (r) { return r.classList.contains('locked'); }).length;
    var 말 = document.querySelector('[data-untick-msg]');
    if (말) 말.textContent = n === 0
      ? '오늘 올 아이는 다 왔어요'
      : '아직 ' + n + '마리를 기다리고 있어요' + (잠김 ? ' · 그중 ' + 잠김 + '마리는 백신 확인이 필요해요' : '');
  }

  /* 백신 만료로 잠긴 버튼 — 원장 승인으로만 풀린다 */
  on('[data-vac-unlock]', 'click', function (e, t) {
    var 이름 = t.dataset.dog;
    물어보기('백신 만료 확인', 이름 + '의 백신이 만료됐습니다.\n원장 책임으로 오늘 하루만 등원을 허용할까요?\n(보호자에게 재접종 안내가 함께 나갑니다)', '허용', function () {
      var b = document.getElementById(t.dataset.vacUnlock);
      if (b) { b.disabled = false; b.classList.remove('is-off'); }
      var 줄 = t.closest('.pc-check');
      if (줄) 줄.classList.remove('locked');
      /* ⚠ 단추만 풀고 「백신 확인이 필요해요」를 남겨 두면 «누를 수 있는데 안 된다고 적힌» 줄이 된다.
         왜 열렸는지로 바꾸어 적는다. (2026-08-25) */
      var 경고 = 줄 && 줄.querySelector('.act .t-sub.dan');
      if (경고) { 경고.className = 't-sub'; 경고.textContent = '원장 승인으로 오늘만 열림'; }
      t.remove();
      미체크세기();
      toast(이름 + ' — 원장 승인으로 오늘 하루만 열었어요. 보호자에게 재접종 안내를 보냈습니다', '', 'ok');
    });
  });

  /* ============================================================
     ★ AT-03 하원 체크 — 인계 보호자를 확인하고 재원 시간을 셈한다
     ============================================================ */
  on('[data-checkout]', 'click', function (e, t) {
    var 이름 = t.dataset.dog, 보호자 = t.dataset.guardian;
    var 줄 = t.closest('.pc-check');
    function 하원처리(대리, 누구) {
      var 들어온 = 초로(줄.querySelector('[data-stay]').dataset.stay);
      var 지금 = 지금초();
      줄.querySelector('.act').innerHTML =
        '<span class="pc-slip"><span class="t">' + 시각(지금) + ' 하원 완료</span>' +
        '<span class="badge b-acc">오늘 재원 ' + 걸린시간(지금 - 들어온) + '</span>' +
        (대리 ? '<span class="badge b-warn">대리 하원 · ' + 누구 + '</span>' : '') +
        '<span class="badge b-ok">알림장 발송 대상</span></span>';
      줄.classList.add('done');
      var 칸 = document.querySelector('[data-instay]');
      if (칸) 칸.textContent = 모두('.pc-check[data-row]:not(.done)').length;
      var 대상 = document.querySelector('[data-note-target]');
      if (대상) 대상.textContent = Number(대상.textContent) + 1;
      toast(조사(이름, '이가', '가') + ' ' + 누구 + ' 님과 하원했어요 · 알림장 발송 대상에 올렸습니다', '', 'ok');
    }
    골라받기('인계 보호자 확인', '등록된 보호자: <b>' + 보호자 + ' 님</b>', '다른 분이 오셨어요', '본인이 오셨어요',
      function () {
        적어받기('대리 하원', '오신 분의 이름과 관계를 적어 주세요.', '', function (누구) {
          if (!누구) { toast('하원 체크를 멈췄어요 — 인계 확인이 있어야 보낼 수 있습니다', '', 'dan'); return; }
          하원처리(true, 누구);
        });
      },
      function () { 하원처리(false, 보호자); },
    );
  });
  /* 재원 시간 카운트업 — 1초마다 늘어난다 */
  function 재원시계() {
    모두('[data-stay]').forEach(function (x) {
      var 칸 = x.querySelector('[data-stay-out]');
      if (!칸) return;
      칸.textContent = 걸린시간(Math.max(0, 지금초() - 초로(x.dataset.stay)));
    });
    setTimeout(재원시계, 1000);
  }

  /* ============================================================
     ★ AT-04 반 편성 보드 — 이 팩의 알맹이 ②
     카드를 «정말로» 다른 칸의 자식으로 옮긴다.
       ① 끌어다 놓기(HTML5 drag)
       ② 카드를 고른 뒤 옮길 칸을 누르기 — 끌기가 어려운 자리를 위한 길
     옮기면 ⓐ 칸 인원이 다시 세어지고 ⓑ 정원을 넘기면 머리가 붉어지며 저장이 잠기고
     ⓒ 몸무게 차이가 크면 확인을 묻고 ⓓ 자동 배정과 다르면 사유를 받는다.
     ============================================================ */
  var 고른카드 = null;
  var 옮긴것 = {};

  function 보드갱신() {
    var 보드 = document.querySelector('[data-board]');
    if (!보드) return;
    var 넘침 = false;
    모두('.pc-col', 보드).forEach(function (col) {
      var n = col.querySelectorAll('.pc-dog').length;
      var cap = Number(col.dataset.cap);
      var 칸 = col.querySelector('[data-col-n]');
      if (칸) 칸.textContent = n;
      var over = n > cap;
      col.classList.toggle('over', over);
      if (over) 넘침 = true;
    });
    var 저장 = document.querySelector('[data-board-save]');
    if (저장) {
      저장.disabled = 넘침;
      저장.classList.toggle('is-off', 넘침);
      저장.textContent = 넘침 ? '정원을 넘긴 반이 있어요' : '저장하고 보호자에게 알림';
    }
    var 알림 = document.querySelector('[data-board-msg]');
    var 옮긴수 = Object.keys(옮긴것).length;
    if (알림) {
      알림.hidden = 옮긴수 === 0;
      var 목록 = 알림.querySelector('[data-board-list]');
      if (목록) 목록.textContent = Object.keys(옮긴것).map(function (k) { return 옮긴것[k]; }).join(' · ');
    }
  }

  /** 카드를 그 칸으로 옮긴다 — 옮겨도 되는지 먼저 묻는다 */
  function 옮기기(카드, 칸) {
    var 목적 = 칸.closest('.pc-col');
    var 원래 = 카드.closest('.pc-col');
    if (!목적 || 목적 === 원래) return;
    var kg = Number(카드.dataset.kg);
    var 이름 = 카드.dataset.nm;
    var 최소 = Number(목적.dataset.kgMin), 최대 = Number(목적.dataset.kgMax);
    /* 자동 배정과 다르게 옮기면 «왜»를 남긴다 */
    function 사유받기() {
      적어받기('반 재배정 사유', 조사(이름, '을', '를') + ' ' + 조사(목적.dataset.nm, '으로', '로') + ' 옮깁니다.\n자동 배정과 다르니 짧게 이유를 적어 주세요.', '', function (사유) {
        칸.appendChild(카드);
        카드.classList.add('moved');
        카드.classList.remove('picked');
        옮긴것[카드.dataset.dog] = 이름 + ' → ' + 목적.dataset.nm + (사유 ? ' (' + 사유 + ')' : '');
        고른카드 = null;
        보드갱신();
        toast(이름 + ' — ' + 목적.dataset.nm + '으로 옮겼어요. 저장하면 보호자에게 알림이 갑니다');
      });
    }
    /* 큰 아이를 작은 아이 반으로 — 몸무게 차이가 크면 반드시 묻는다 */
    if (kg < 최소 || kg > 최대) {
      var 큰가 = kg > 최대;
      물어보기('몸무게 차이 확인', 이름 + ' ' + kg + 'kg → ' + 목적.dataset.nm + '(' + (최대 === 99 ? 최소 + 'kg 이상' : 최소 + '~' + 최대 + 'kg') + ')\n'
        + (큰가 ? '큰 아이를 작은 아이들과 같이 두게 됩니다.' : '작은 아이를 큰 아이들과 같이 두게 됩니다.')
        + '\n그래도 옮길까요?', '옮기기', 사유받기);
      return;
    }
    사유받기();
  }

  /* ① 끌어다 놓기 */
  document.addEventListener('dragstart', function (e) {
    var 카드 = e.target.closest ? e.target.closest('.pc-dog') : null;
    if (!카드) return;
    고른카드 = 카드;
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', 카드.dataset.dog); } catch (err) { /* 일부 브라우저 */ }
  });
  document.addEventListener('dragover', function (e) {
    var 칸 = e.target.closest ? e.target.closest('.pc-drop') : null;
    if (!칸) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    칸.classList.add('hot');
  });
  document.addEventListener('dragleave', function (e) {
    var 칸 = e.target.closest ? e.target.closest('.pc-drop') : null;
    if (칸) 칸.classList.remove('hot');
  });
  document.addEventListener('drop', function (e) {
    var 칸 = e.target.closest ? e.target.closest('.pc-drop') : null;
    if (!칸) return;
    e.preventDefault();
    칸.classList.remove('hot');
    if (고른카드) 옮기기(고른카드, 칸);
  });
  document.addEventListener('dragend', function () {
    모두('.pc-drop.hot').forEach(function (x) { x.classList.remove('hot'); });
  });

  /* ② 카드를 고른 뒤 칸을 누르기 */
  on('.pc-dog', 'click', function (e, t) {
    if (고른카드 === t) { t.classList.remove('picked'); 고른카드 = null; return; }
    모두('.pc-dog.picked').forEach(function (x) { x.classList.remove('picked'); });
    t.classList.add('picked');
    고른카드 = t;
    toast(조사(t.dataset.nm, '을', '를') + ' 골랐어요 — 옮길 반을 누르세요 (끌어다 놓아도 됩니다)');
  });
  on('.pc-drop', 'click', function (e, t) {
    if (e.target.closest('.pc-dog')) return;
    if (!고른카드) return;
    옮기기(고른카드, t);
  });
  on('[data-board-save]', 'click', function (e, t) {
    if (t.disabled) return;
    var n = Object.keys(옮긴것).length;
    if (n === 0) { toast('옮긴 아이가 없어요'); return; }
    toast('반 편성을 저장했어요 — 반이 바뀐 ' + n + '마리의 보호자에게 알림을 보냈습니다', '', 'ok');
    모두('.pc-dog.moved').forEach(function (x) { x.classList.remove('moved'); });
    옮긴것 = {};
    보드갱신();
  });

  /* ============================================================
     ★ 거르기 · 찾기 · 쪽수 — 「켜짐 표시만 바뀌고 목록은 그대로」를 막는다
     상자에 data-filter-for="키" · 목록에 data-filter-list="키"
     항목에 data-tag="값" (여러 개면 공백으로 나눈다)
     ============================================================ */
  /* 거르는 길이 넷이다 — 칩 · 토글 하나 · 고르개 · 찾기.
     넷이 «각자» 목록을 감추면 서로를 덮어써서, 칩을 눌렀더니 찾기 결과가 되살아난다.
     그래서 감추는 «까닭»을 따로 적어 두고(out-*), 마지막에 한 번만 그린다.
     쪽수도 여기서 함께 센다 — 걸러서 2개가 남았는데 쪽 번호가 1~5 그대로면 안 된다. */
  var 지금쪽 = {};
  function 목록(key) { return document.querySelector('[data-filter-list="' + key + '"]'); }
  function 그리기(key) {
    var 판 = 목록(key);
    if (!판) return;
    var 것들 = 모두('[data-tag]', 판);
    var 남 = 것들.filter(function (it) {
      return !it.dataset.outChip && !it.dataset.outOnly && !it.dataset.outSel && !it.dataset.outSearch;
    });
    var 한쪽 = Number(판.dataset.perPage || 0);
    var 쪽수 = 한쪽 ? Math.max(1, Math.ceil(남.length / 한쪽)) : 1;
    if (!지금쪽[key] || 지금쪽[key] > 쪽수) 지금쪽[key] = 1;
    것들.forEach(function (it) { it.hidden = true; });
    남.forEach(function (it, i) {
      it.hidden = 한쪽 ? (Math.floor(i / 한쪽) + 1 !== 지금쪽[key]) : false;
    });
    모두('[data-empty-for="' + key + '"]').forEach(function (x) { x.hidden = 남.length > 0; });
    모두('[data-filter-cnt="' + key + '"]').forEach(function (x) { x.textContent = 남.length; });
    /* 「10건 · 실패 2건」처럼 갈래를 따로 적어 둔 자리 — 걸러지면 같이 줄어야 한다.
       안 그러면 0건으로 걸러 놓고도 «실패 2건»이라 적혀 있다. (2026-08-25) */
    모두('[data-cnt-tag-for="' + key + '"]').forEach(function (x) {
      x.textContent = 남.filter(function (it) { return 태그든가(it, x.dataset.cntTag); }).length;
    });
    /* 쪽 단추 — 걸러진 뒤의 쪽수만큼만 남긴다 */
    모두('[data-page-for="' + key + '"]').forEach(function (b) {
      var n = Number(b.dataset.pageN);
      b.hidden = n > 쪽수;
      b.classList.toggle('on', n === 지금쪽[key]);
    });
    모두('[data-page-box="' + key + '"]').forEach(function (x) { x.hidden = 쪽수 <= 1; });
    모두('[data-page-now="' + key + '"]').forEach(function (x) { x.textContent = 지금쪽[key]; });
    모두('[data-page-all="' + key + '"]').forEach(function (x) { x.textContent = 쪽수; });
  }
  function 표시(key, 까닭, 판정) {
    var 판 = 목록(key);
    if (!판) return;
    모두('[data-tag]', 판).forEach(function (it) {
      if (판정(it)) delete it.dataset[까닭]; else it.dataset[까닭] = '1';
    });
    지금쪽[key] = 1;      /* 조건이 바뀌면 1쪽으로 돌아간다 */
    그리기(key);
  }
  function 태그든가(it, 값) { return (it.dataset.tag || '').split(/\s+/).indexOf(값) >= 0; }

  /* ① 칩으로 거르기
     ⚠ 탭마다 목록이 따로 있는 화면(MY-01 예정·완료·취소)이 있다.
       한 칩 묶음이 여러 목록을 함께 거르도록 data-filter-for 에 키를 여럿 적을 수 있다. */
  function 거르기(묶음) {
    var key = 묶음 && 묶음.dataset ? 묶음.dataset.filterFor : null;
    if (!key) return;
    var 켜진 = 모두('.chip.on', 묶음).map(function (c) { return (c.dataset.tag || c.textContent).trim(); });
    var 전체 = 켜진.length === 0 || 켜진.indexOf('전체') >= 0;
    key.split(/\s+/).forEach(function (k) {
      표시(k, 'outChip', function (it) {
        return 전체 || 켜진.some(function (x) { return 태그든가(it, x); });
      });
    });
  }
  /* ② 「미작성만 보기」처럼 토글 하나로 거르는 자리 */
  on('[data-filter-only]', 'click', function (e, t) {
    var 켬 = t.classList.toggle('on');
    t.setAttribute('aria-pressed', String(켬));
    var 값 = t.dataset.filterTag;
    표시(t.dataset.filterOnly, 'outOnly', function (it) { return !켬 || 태그든가(it, 값); });
  });
  /* ③ 고르개(select)로 거르기 */
  document.addEventListener('change', function (e) {
    var sel = e.target.closest && e.target.closest('[data-filter-sel]');
    if (!sel) return;
    var 값 = (sel.value || '').trim();
    표시(sel.dataset.filterSel, 'outSel', function (it) { return /^전체/.test(값) || 태그든가(it, 값); });
  });
  /* ④ 찾기 — 입력한 말이 든 것만 남긴다 */
  document.addEventListener('input', function (e) {
    var 칸 = e.target.closest && e.target.closest('[data-search-for]');
    if (!칸) return;
    var key = 칸.dataset.searchFor;
    var 말 = (칸.value || '').trim();
    표시(key, 'outSearch', function (it) { return !말 || (it.textContent || '').indexOf(말) >= 0; });
    /* ⚠ 「…이(가) 든 질문」처럼 괄호 조사를 남기지 않는다. 낱말을 넣을 때 받침을 보고 고른다.
       다음 형제가 「이(가)」·「을(를)」로 시작하면 그 자리를 맞는 조사로 갈아 끼운다. */
    모두('[data-search-word="' + key + '"]').forEach(function (x) {
      x.textContent = 말 || '—';
      var 뒤 = x.nextSibling;
      if (!말 || !뒤 || 뒤.nodeType !== 3) return;
      var t = 뒤.nodeValue;
      var m = /^(」?s*)(이(가)|을(를)|은(는)|와(과))/.exec(t);
      if (!m) return;
      var 짝 = { '이(가)': ['이', '가'], '을(를)': ['을', '를'], '은(는)': ['은', '는'], '와(과)': ['와', '과'] }[m[2]];
      뒤.nodeValue = m[1] + 조사(말, 짝[0], 짝[1]).slice(말.length) + t.slice(m[0].length);
    });
  });
  /* 쪽수 — 누른 쪽의 목록으로 «내용이 바뀌고», 지금 쪽이 표시된다 */
  on('[data-page-n]', 'click', function (e, t) {
    var key = t.dataset.pageFor;
    지금쪽[key] = Number(t.dataset.pageN);
    그리기(key);
  });

  /* ⑤ 차례 바꾸기 — ⚠ 「고르개가 색만 바뀌고 차례는 그대로」가 여러 팩에서 나왔다.
     정렬 고르개는 실제로 줄을 옮겨야 한다. 줄에 data-s-* 로 견줄 값을 적어 둔다. */
  document.addEventListener('change', function (e) {
    var sel = e.target.closest && e.target.closest('[data-sort-for]');
    if (!sel) return;
    var key = sel.dataset.sortFor;
    var 판 = 목록(key);
    if (!판) return;
    var 기준 = sel.value;
    var 부모 = 판.querySelector('tbody') || 판;
    Array.prototype.slice.call(부모.children).sort(function (a, b) {
      var av = a.dataset['s' + 기준], bv = b.dataset['s' + 기준];
      if (av == null || bv == null) return 0;
      var an = Number(av), bn = Number(bv);
      if (av !== '' && bv !== '' && !isNaN(an) && !isNaN(bn)) return an - bn;
      return String(av).localeCompare(String(bv), 'ko');
    }).forEach(function (r) { 부모.appendChild(r); });
    지금쪽[key] = 1;
    그리기(key);
    toast(sel.selectedOptions[0].textContent + '으로 차례를 바꿨어요');
  });

  /* ★ MG-03 기간 고르개 — 바꾸면 매출 지표 넷이 다시 계산된다.
     고를 때마다 값이 안 바뀌면 «기간을 고르는 뜻»이 없다. */
  document.addEventListener('change', function (e) {
    var sel = e.target.closest && e.target.closest('[data-period]');
    if (!sel) return;
    var opt = sel.selectedOptions[0];
    ['total', 'pack', 'reg', 'refund'].forEach(function (k) {
      var el = document.querySelector('[data-sales="' + k + '"]');
      if (el && opt.dataset[k]) el.textContent = Math.round(Number(opt.dataset[k]) / 10000).toLocaleString('ko-KR') + '만원';
    });
    모두('[data-period-label]').forEach(function (x) { x.textContent = opt.dataset.label || opt.textContent; });
    toast(opt.textContent + ' 매출을 불러왔어요');
  });
  /* 「더 보기」 — 그 자리에서 펴지고 접힌다. 다른 화면으로 가지 않는다 */
  on('[data-more-toggle]', 'click', function (e, t) {
    var 상자 = document.querySelector('[data-more-body="' + t.dataset.moreToggle + '"]');
    if (!상자) return;
    var 폄 = 상자.hidden;
    상자.hidden = !폄;
    t.textContent = 폄 ? '접기 ▴' : t.dataset.moreLabel || '더 보기 ▾';
  });

  /* ============================================================
     ★ PL-01 몸무게 → 예상 반이 실시간으로 바뀐다 (반 배정의 첫 기준)
     ============================================================ */
  document.addEventListener('input', function (e) {
    var 칸 = e.target.closest && e.target.closest('[data-weight]');
    if (!칸) return;
    var kg = Number(칸.value);
    var 말 = document.querySelector('[data-weight-out]');
    if (!말) return;
    if (!kg) { 말.innerHTML = '<span class="t-sub">몸무게를 적으면 예상 반을 알려드려요</span>'; return; }
    /* ⛔ 경계값을 여기 적지 않는다 — <body data-cls> 에 실려 온 표를 읽는다.
       스펙(data.mjs 의 CLASSES)에서 구간을 바꿔도 이 말이 저절로 따라오게 하려는 것이다.
       표가 없는 옛 화면을 위해 마지막에만 옛 값을 남겨 둔다. */
    var 표;
    try { 표 = JSON.parse(document.body.getAttribute('data-cls') || 'null'); } catch (err) { 표 = null; }
    var 반 = null;
    if (표 && 표.length) {
      for (var i = 0; i < 표.length; i++) {
        if (kg >= 표[i][2] && (kg < 표[i][3] || i === 표.length - 1)) { 반 = [표[i][0], 표[i][1]]; break; }
      }
      if (!반) 반 = [표[표.length - 1][0], 표[표.length - 1][1]];
    }
    if (!반) 반 = kg < 5 ? ['소형반', '5kg 미만'] : (kg < 15 ? ['중형반', '5~15kg'] : ['대형반', '15kg 이상']);
    말.innerHTML = '예상 반 <b class="pri">' + 반[0] + '</b> <span class="t-sub">(' + 반[1] + ')</span>';
  });

  /* ★ PL-02 접종일 → 유효기간이 저절로 계산된다 */
  document.addEventListener('change', function (e) {
    var 칸 = e.target.closest && e.target.closest('[data-vac-date]');
    if (!칸) return;
    var d = new Date(칸.value);
    if (isNaN(d.getTime())) return;
    var 유효 = new Date(d.getFullYear() + 1, d.getMonth(), d.getDate());
    var 남 = Math.round((유효 - new Date(2026, 7, 24)) / 86400000);
    var 말 = document.querySelector('[data-vac-out="' + 칸.dataset.vacDate + '"]');
    if (!말) return;
    var 글 = 유효.getFullYear() + '-' + 두자리(유효.getMonth() + 1) + '-' + 두자리(유효.getDate());
    말.innerHTML = 남 < 0
      ? '<span class="badge b-dan">만료 ' + Math.abs(남) + '일 지남</span> <span class="t-sub">이 상태로는 등원 예약이 제한됩니다</span>'
      : 남 <= 30
        ? '<span class="badge b-warn">D-' + 남 + '</span> <span class="t-sub">유효기간 ' + 글 + '까지 — 곧 재접종이 필요해요</span>'
        : '<span class="badge b-ok">정상</span> <span class="t-sub">유효기간 ' + 글 + '까지</span>';
  });

  /* ★ NW-01 컨디션 고르개 · 즐겨쓰는 문장 */
  on('.pc-cond button', 'click', function (e, t) {
    모두('button', t.closest('.pc-cond')).forEach(function (b) { b.classList.remove('on'); });
    t.classList.add('on');
    모두('[data-cond-out]').forEach(function (x) { x.textContent = t.dataset.cond; });
  });
  on('[data-phrase]', 'click', function (e, t) {
    var 칸 = document.querySelector('[data-note-text]');
    if (!칸) return;
    칸.value = (칸.value ? 칸.value.replace(/\s*$/, ' ') : '') + t.dataset.phrase;
    칸.focus();
    글자수();
  });
  function 글자수() {
    var 칸 = document.querySelector('[data-note-text]');
    var 말 = document.querySelector('[data-note-len]');
    if (칸 && 말) 말.textContent = 칸.value.length;
  }
  document.addEventListener('input', function (e) {
    if (e.target.closest && e.target.closest('[data-note-text]')) 글자수();
  });

  /* ★ NW-02 사진 — 별로 대표를 정하고, 끌어서 차례를 바꾸고, ✕ 로 지운다 */
  /* ⚠ 예전에는 «대표» 딱지를 새로 만들어 붙였다. 그 칸에는 이미 번호 딱지가 있어서
     둘이 같은 자리에 겹쳐 「4」와 「대표」가 포개졌다. 딱지는 하나뿐이다 —
     새로 만들지 말고 번호매기기() 가 글자만 고쳐 쓴다. */
  on('.pc-shot .star', 'click', function (e, t) {
    e.stopPropagation();
    var 칸 = t.closest('.pc-shot');
    모두('.pc-shot').forEach(function (s) { s.classList.remove('main'); });
    칸.classList.add('main');
    번호매기기();
    toast('대표 사진으로 정했어요 — 알림장함 목록의 썸네일이 됩니다');
    사진세기();
  });
  on('.pc-shot .del', 'click', function (e, t) {
    e.stopPropagation();
    t.closest('.pc-shot').remove();
    사진세기();
    toast('사진을 지웠어요');
  });
  var 끄는사진 = null;
  document.addEventListener('dragstart', function (e) {
    var s = e.target.closest ? e.target.closest('.pc-shot') : null;
    if (s) { 끄는사진 = s; e.dataTransfer.effectAllowed = 'move'; }
  });
  document.addEventListener('dragover', function (e) {
    var s = e.target.closest ? e.target.closest('.pc-shot') : null;
    if (s && 끄는사진 && s !== 끄는사진) { e.preventDefault(); }
  });
  document.addEventListener('drop', function (e) {
    var s = e.target.closest ? e.target.closest('.pc-shot') : null;
    if (!s || !끄는사진 || s === 끄는사진) return;
    e.preventDefault();
    var 판 = s.parentElement;
    var 것들 = 모두('.pc-shot', 판);
    var 앞이냐 = 것들.indexOf(끄는사진) < 것들.indexOf(s);
    판.insertBefore(끄는사진, 앞이냐 ? s.nextSibling : s);
    끄는사진 = null;
    번호매기기();
    toast('사진 차례를 바꿨어요');
  });
  /* 딱지는 칸마다 하나다 — 대표면 「대표」, 아니면 차례 번호 */
  function 번호매기기() {
    모두('.pc-shot').forEach(function (s, i) {
      var c = s.querySelector('.cap');
      if (!c) return;
      var 대표 = s.classList.contains('main');
      c.textContent = 대표 ? '대표' : (i + 1);
      if (대표) c.dataset.main = '1'; else delete c.dataset.main;
    });
  }
  function 사진세기() {
    var n = 모두('.pc-shot').length;
    모두('[data-shot-n]').forEach(function (x) { x.textContent = n; });
    모두('[data-shot-warn]').forEach(function (x) { x.hidden = n >= 3; });
    번호매기기();
  }

  /* ★ NW-03 일괄 발송 */
  on('[data-bulk-send]', 'click', function (e, t) {
    var n = Number(t.dataset.bulkSend);
    물어보기('일괄 발송', '작성이 끝난 알림장 ' + n + '건을 지금 보냅니다.\n보호자에게 카카오톡으로 나갑니다. 보낼까요?', '보내기', function () {
      모두('[data-note-st="작성완료"]').forEach(function (b) {
        b.className = 'badge b-ok';
        b.textContent = '발송완료';
        b.dataset.noteSt = '발송완료';
      });
      t.disabled = true;
      t.classList.add('is-off');
      t.textContent = n + '건을 보냈어요';
      toast(n + '건을 보냈어요 · 실패한 건은 발송 이력에서 다시 보낼 수 있어요', '', 'ok');
    });
  });
  on('[data-resend]', 'click', function (e, t) {
    t.disabled = true;
    t.classList.add('is-off');
    t.textContent = '재발송함';
    var 줄 = t.closest('tr') || t.closest('.rowcard');
    if (줄) {
      var 배지 = 줄.querySelector('.badge');
      if (배지) { 배지.className = 'badge b-ok'; 배지.textContent = '전달됨'; }
      줄.classList.remove('bad');
    }
    toast(t.dataset.resend + ' — 다시 보냈어요', '', 'ok');
  });

  /* ★ HL-03 긴급도 «높음» — 보호자 즉시 연락 체크가 강제로 나타난다 */
  document.addEventListener('change', function (e) {
    var r = e.target.closest && e.target.closest('[data-urgency]');
    if (!r) return;
    var 높음 = r.value === '높음';
    var 칸 = document.querySelector('[data-urgency-box]');
    if (칸) 칸.hidden = !높음;
    var 낼것 = document.querySelector('[data-urgency-btn]');
    if (낼것 && 높음) {
      낼것.disabled = true;
      낼것.classList.add('is-off');
      낼것.textContent = '보호자 연락 확인이 필요해요';
    } else if (낼것) {
      낼것.disabled = false;
      낼것.classList.remove('is-off');
      낼것.textContent = '저장하고 보호자에게 알림';
    }
  });

  /* ★ MG-01 정원을 지금 예약 인원보다 적게 줄이면 경고 */
  document.addEventListener('input', function (e) {
    var 칸 = e.target.closest && e.target.closest('[data-cap-in]');
    if (!칸) return;
    var 지금 = Number(칸.dataset.capNow);
    var 새것 = Number(칸.value);
    var 말 = document.querySelector('[data-cap-out="' + 칸.dataset.capIn + '"]');
    if (!말) return;
    if (새것 < 지금) {
      말.innerHTML = '<span class="dan strong">지금 ' + 지금 + '마리가 다니고 있어요 — ' + (지금 - 새것) + '마리의 예약을 옮겨야 합니다</span>';
    } else {
      말.innerHTML = '<span class="t-sub">지금 ' + 지금 + '마리 · 여유 ' + (새것 - 지금) + '자리</span>';
    }
  });

  /* ★ MG-02 몸무게 경계값을 바꾸면 «몇 마리가 반이 달라지는지» 미리 보여 준다 */
  document.addEventListener('input', function (e) {
    var 칸 = e.target.closest && e.target.closest('[data-boundary]');
    if (!칸) return;
    var 값 = Number(칸.value);
    var 이름 = 칸.dataset.boundary;
    모두('[data-boundary-v="' + 이름 + '"]').forEach(function (x) { x.textContent = 값 + 'kg'; });
    var 소 = Number((document.querySelector('[data-boundary="소형"]') || {}).value || 5);
    var 대 = Number((document.querySelector('[data-boundary="대형"]') || {}).value || 15);
    var 무게 = [];
    try { 무게 = JSON.parse(document.querySelector('[data-boundary-src]').dataset.boundarySrc); } catch (err) { 무게 = []; }
    var 바뀜 = 무게.filter(function (d) {
      var 새반 = d.kg < 소 ? 'sm' : (d.kg < 대 ? 'md' : 'lg');
      return 새반 !== d.cls;
    });
    var 말 = document.querySelector('[data-boundary-out]');
    if (!말) return;
    말.innerHTML = 바뀜.length === 0
      ? '<span class="t-sub">이 기준으로 바꿔도 반이 달라지는 아이는 없어요</span>'
      : '<b class="acc">이 기준으로 바꾸면 ' + 바뀜.length + '마리가 반이 달라져요</b>'
        + '<div class="t-sub mt2">' + 바뀜.map(function (d) { return d.nm + ' ' + d.kg + 'kg'; }).join(' · ') + '</div>';
  });

  /* ★ MY-03 정기 등원 — 요일 변경 · 일시정지 · 해지 */
  on('[data-reg-change]', 'click', function (e, t) {
    var 고름 = 모두('[data-pick-scope="reg"] .chip.on').map(function (c) { return c.dataset.dow; });
    if (!고름.length) { toast('요일을 하나 이상 골라 주세요', '', 'dan'); return; }
    모두('[data-reg-now]').forEach(function (x) { x.textContent = '매주 ' + 고름.join('·') + ' 등원'; });
    toast('다음 주부터 매주 ' + 고름.join('·') + ' 등원으로 바뀝니다 — 이번 주는 그대로 진행돼요', '', 'ok');
  });

  /* 「저장하고 보호자에게 알림」류 — 약속한 알림은 반드시 눈에 보이는 답을 준다 */
  on('[data-notify]', 'click', function (e, t) {
    if (t.disabled || t.classList.contains('is-off')) return;
    toast(t.dataset.notify, '', t.dataset.notifyKind || 'ok');
    if (t.dataset.notifyOnce) {
      t.disabled = true;
      t.classList.add('is-off');
      t.textContent = t.dataset.notifyOnce;
    }
  });

  /* ---------- 닫기 · 모달 ---------- */
  on('[data-close]', 'click', function (e, t) {
    var box = t.closest(t.dataset.close || '*');
    if (box) box.remove();
  });
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

  /* 파일 올리기(프로토타입) — 누르면 썸네일이 하나 쌓인다 */
  on('.upload-drop', 'click', function (e, t) {
    var wrap = t.parentElement.querySelector('.upload-thumbs');
    if (!wrap) return;
    var item = document.createElement('div');
    item.className = 'u-item ph t' + ((wrap.children.length % 5) + 1);
    item.innerHTML = '<button type="button" aria-label="지우기">✕</button>';
    wrap.appendChild(item);
    toast('사진을 올렸어요');
  });
  on('.upload-thumbs button', 'click', function (e, t) { t.closest('.u-item').remove(); });

  /* 행·카드 전체를 누르면 이동 */
  on('[data-href]', 'click', function (e, t) {
    if (e.target.closest('a, button, input, label, select, textarea')) return;
    location.href = t.dataset.href;
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var t = e.target.closest && e.target.closest('[data-href]');
    if (t && e.target === t) location.href = t.dataset.href;
  });

  /* 도움 여부 투표 (CS-01) */
  on('[data-vote]', 'click', function (e, t) {
    var 줄 = t.parentElement;
    모두('[data-vote]', 줄).forEach(function (b) { b.disabled = true; b.classList.add('is-off'); });
    var 말 = document.createElement('span');
    말.className = 't-sub';
    말.textContent = t.dataset.vote === 'y' ? '고맙습니다! 도움이 됐다니 다행이에요' : '더 자세히 적어 두겠습니다. 1:1 문의도 열려 있어요';
    줄.appendChild(말);
  });

  /* 토스트 */
  var tRef = null;
  function toast(msg, action, kind) {
    if (tRef) tRef.remove();
    var d = document.createElement('div');
    d.className = 'toast' + (kind === 'ok' ? ' toast-ok' : (kind === 'dan' ? ' toast-dan' : ''));
    d.innerHTML = '<span></span>' + (action ? '<span class="act">' + action + '</span>' : '<span class="act" data-close=".toast">닫기</span>');
    d.firstChild.textContent = msg;
    document.body.appendChild(d);
    tRef = d;
    setTimeout(function () { if (d.parentNode) d.remove(); }, 4200);
  }
  window.toast = toast;
  on('[data-toast]', 'click', function (e, t) {
    if (t.classList.contains('toggle')) return;   /* 토글은 제 손잡이가 이미 띄웠다 */
    toast(t.dataset.toast, t.dataset.toastAct || '', t.dataset.toastKind || '');
  });

  /* 화면 정보 패널 — 언제나 닫힌 채로 시작한다. 누를 때만 열린다. */
  on('.dev-btn', 'click', function (e, t) { t.closest('.dev').classList.toggle('on'); });

  /* 폼 전송은 프로토타입이므로 막고 안내만 */
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    toast('프로토타입 화면이에요. 실제로 전송되지 않습니다');
  });

  /* 가로로 넘치는 줄 — 좌우 화살표로 넘긴다 (막대는 CSS 가 감춘다) */
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
    var step = card ? card.getBoundingClientRect().width + 20 : 300;
    box.scrollLeft += (t.classList.contains('prev') ? -1 : 1) * step;
    setTimeout(function () { carSync(box); }, 350);
  });

  /* ============================================================
     ★ 고르개가 «옆»을 바꾸는 자리 셋 — 고르기만 하고 끝나면 반쪽이다
     2026-08-25. 41장을 손으로 눌러 보다 찾았다. 검수기(check-반응)는 한 칸만
     넘겨 보므로 이런 자리를 못 가린다 — 사람이 다 돌려 봐야 나온다.
     ============================================================ */

  /* ① 「직접 적기」처럼 고르면 칸이 하나 더 나와야 하는 자리 (PL-03 급여 시간) */
  document.addEventListener('change', function (e) {
    var sel = e.target.closest && e.target.closest('[data-reveal-when]');
    if (!sel) return;
    var 칸 = document.getElementById(sel.dataset.revealBox);
    if (!칸) return;
    var 볼까 = sel.value === sel.dataset.revealWhen;
    칸.hidden = !볼까;
    if (볼까) { var i = 칸.querySelector('input, textarea'); if (i) i.focus(); }
  });

  /* ② 할부 — 몇 달로 나누면 «달마다 얼마»인지 그 자리에서 보여 준다 (RE-05) */
  document.addEventListener('change', function (e) {
    var sel = e.target.closest && e.target.closest('[data-inst-for]');
    if (!sel) return;
    var 칸 = document.querySelector('[data-inst-out]');
    if (!칸) return;
    var 총 = Number(sel.dataset.instFor) || 0;
    var 달 = parseInt(sel.value, 10);
    if (!달 || !총) { 칸.textContent = '한 번에 ' + 돈(총) + ' 나갑니다'; return; }
    /* 나누어 떨어지지 않는 몫은 첫 달에 얹는다 — 카드사가 하는 방식이다 */
    var 뒤 = Math.floor(총 / 달), 첫 = 총 - 뒤 * (달 - 1);
    칸.textContent = 첫 === 뒤
      ? '매달 ' + 돈(뒤) + ' × ' + 달 + '개월'
      : '첫 달 ' + 돈(첫) + ' · 그 뒤 매달 ' + 돈(뒤) + ' × ' + (달 - 1) + '개월';
  });

  /* ③ 시작일 — 고른 날이 요약에 그대로 적혀야 한다 (RE-02) */
  document.addEventListener('change', function (e) {
    var sel = e.target.closest && e.target.closest('[data-start-sel]');
    if (!sel) return;
    모두('[data-start-out]').forEach(function (x) { x.textContent = sel.value; });
  });

  /* ---------- 처음 한 번 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    모두('[data-agree-scope]').forEach(syncUnlockAll);
    모두('[data-pick-scope]').forEach(function (s) { 고른것갱신(s.dataset.pickScope); });
    모두('[data-filter-list]').forEach(function (l) { 그리기(l.dataset.filterList); });
    모두('.car .carousel').forEach(function (b) {
      carSync(b);
      b.addEventListener('scroll', function () { carSync(b); });
    });
    보드갱신();
    미체크세기();
    사진세기();
    글자수();
    /* 화면을 열자마자 맞는 값이 적혀 있어야 한다 — 손님이 아무것도 안 골라도 */
    모두('[data-inst-for],[data-start-sel],[data-reveal-when]').forEach(function (s) {
      s.dispatchEvent(new Event('change', { bubbles: true }));
    });
    if (document.querySelector('[data-stay]')) 재원시계();
    var 칸 = document.querySelector('[data-instay]');
    if (칸 && !칸.textContent.trim()) 칸.textContent = 모두('.pc-check[data-row]:not(.done)').length;
  });
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
    if (t.closest('.dev')) return;
    if (t.dataset && (t.dataset.toast || t.dataset.modal || t.dataset.go ||
                      t.dataset.close || t.dataset.dismiss)) return;
    var 전 = document.body.innerHTML;
    setTimeout(function () {
      if (document.body.innerHTML !== 전) return;

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
      var 앞뒤 = /prev|next|이전|다음|‹|›/.test(t.className + ' ' + 이름(t));
      if (앞뒤) {
        var 둘레 = t.closest('section, .card, .box, div');
        for (var i = 0; i < 3 && 둘레; i++) {
          var 목록 = 둘레.querySelector('.carousel, [style*="overflow-x"]');
          if (목록 && 목록.scrollWidth > 목록.clientWidth) {
            var 뒤로 = /prev|이전|‹/.test(t.className + ' ' + 이름(t));
            목록.scrollLeft += (뒤로 ? -1 : 1) * Math.max(240, 목록.clientWidth * 0.8);
            return;
          }
          둘레 = 둘레.parentElement;
        }
      }
      if (typeof window.toast === 'function') window.toast(이름(t) + ' — 눌렀어요');
    }, 0);
  }, true);
})();
/* ── 마지막 그물 끝 ── */

/* ── GNB 에 «지금 여기»를 켠다 ──────────────────────────────
   켜진 것은 «언제나 하나»여야 한다.
     ① 지금 쪽과 «딱 맞는» 링크가 있으면 그것
     ② 없으면 «같은 갈래의 첫 링크»(대표 화면)
     ③ 그 밖은 모두 끈다
   ⚠ 앞 두 글자만 맞으면 다 켜던 코드가 홈·목록·상세를 «한꺼번에» 켰던 자리다. */
(function () {
  'use strict';
  var 지금 = (document.body && document.body.dataset && document.body.dataset.page) || '';
  if (!지금) return;
  var 갈래 = 지금.slice(0, 2);
  var 칸들 = document.querySelectorAll('.gnb-nav, .own-side');
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
