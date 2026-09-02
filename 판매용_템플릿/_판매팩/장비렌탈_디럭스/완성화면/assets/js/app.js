/* 장비 렌탈·대여 예약 플랫폼 — 공통 인터랙션
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

  /* 잠금이 걸린 버튼은 <a> 로 못 만든다(<a> 에는 disabled 가 없다).
     그래서 <button data-go="…"> 로 만들고 옮기는 일을 여기서 한다.
     잠겨 있으면(disabled) 아무 일도 안 일어난다 — 그것이 잠금의 뜻이다. */
  on('.btn[data-go]', 'click', function (e, t) {
    if (t.disabled || t.classList.contains('is-off')) return;
    location.href = t.dataset.go;
  });

  /* 아코디언 */
  on('.acc-q', 'click', function (e, t) {
    t.closest('.acc-item').classList.toggle('on');
  });

  /* 칩 필터 */
  on('.chip', 'click', function (e, t) {
    if (t.dataset.catf) return;   /* 갈래 거르개가 따로 맡는다 — 여기서 뒤집으면 서로 싸운다 */
    if (t.dataset.go) { location.href = t.dataset.go; return; }
    if (t.classList.contains('is-off')) return;
    /* 「전체」가 든 묶음은 하나만 골라진다 — 「전체」와 「텐트」가 같이 켜지면 안 된다.
       고른 것에 ✕ 가 붙은 묶음(여러 개 고르는 것)은 그대로 둔다. */
    var 묶음 = t.closest('.chips');
    var 한개만 = 묶음 && Array.prototype.some.call(묶음.querySelectorAll('.chip'), function (c) {
      return /^전체(\s*보기)?$/.test((c.textContent || '').trim());
    }) && !묶음.querySelector('.chip .x');
    if (한개만) {
      묶음.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
      t.classList.add('on');
      return;
    }
    t.classList.toggle('on');
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

  /* 찜하기 */
  on('.heart', 'click', function (e, t) {
    e.preventDefault();
    var isOn = t.classList.toggle('on');
    t.textContent = isOn ? '♥' : '♡';
    toast(isOn ? '찜한 장비에 담았어요' : '찜을 해제했어요', isOn ? '찜 목록 보기' : '되돌리기');
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

  /* 동의 체크박스로 버튼 잠금 해제 — data-unlock="버튼id" */
  document.addEventListener('change', function (e) {
    var t = e.target.closest('[data-unlock]');
    if (!t) return;
    var b = document.getElementById(t.dataset.unlock);
    if (!b) return;
    b.disabled = !t.checked;
    b.classList.toggle('is-off', !t.checked);
  });

  /* 전체 동의 — 아래 항목을 모두 따라가게 */
  document.addEventListener('change', function (e) {
    var t = e.target.closest('[data-agree-all]');
    if (!t) return;
    var scope = t.closest('[data-agree-scope]') || document;
    scope.querySelectorAll('[data-agree]').forEach(function (x) { x.checked = t.checked; });
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
    try { localStorage.setItem('rt.spec', box.classList.contains('on') ? '1' : '0'); } catch (_) {}
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

/* ── 갈래 칩으로 목록 거르기 ────────────────────────────────────────
   ⛔ 2026-08-19 검수: 「텐트」·「타프」 칩을 눌러도 켜짐 표시만 바뀌고
      장비 목록이 그대로였다. 거르는 장치가 아예 안 걸려 있었다.

   자료는 이미 화면에 있었다 — 물건 이름이 「…4인 텐트」·「타프 헥사」다.
   그래서 카드마다 data-cat 을 적어 두고 칩과 짝지었다.
   ⚠ 「침낭」 칩은 해당 물건이 한 대도 없어서 캠핑 화면에서 뺐다.
      (HO0202 는 칩에 「침낭 5」처럼 진짜 규모를 적는 자리라 그대로 두고,
       눌러서 비면 안내를 띄운다.)
   ⚠ 거르는 것은 «첫 목록»뿐이다. 「함께 빌리면 좋아요」·「이 기간엔 다 나갔어요」는
      다른 뜻의 목록이라 건드리지 않는다. */
(function 갈래거르기() {
  var 목록 = document.querySelector('[data-catlist]');
  if (!목록) return;
  var 카드 = [].slice.call(목록.querySelectorAll('[data-cat]'));
  var 칩 = [].slice.call(document.querySelectorAll('[data-catf]'));
  if (!카드.length || !칩.length) return;

  /* 하나도 안 남았을 때 띄울 안내 — 빈 채로 두면 고장으로 보인다 */
  var 빈칸 = document.createElement('div');
  빈칸.className = 'empty mt6';
  빈칸.hidden = true;
  빈칸.innerHTML =
    '<div class="ico">🔍</div>' +
    '<h3 class="t-sec">고르신 종류는 이 견본에 안 담겨 있어요</h3>' +
    '<p class="msg">보여 드리는 화면에는 몇 가지만 담아 두었습니다. ' +
    '「전체」를 누르시면 다시 보여 드려요.</p>';
  목록.insertAdjacentElement('afterend', 빈칸);

  function 그리기(고른) {
    var 남은 = 0;
    카드.forEach(function (c) {
      var ok = 고른 === '*' || c.dataset.cat === 고른;
      c.hidden = !ok;
      if (ok) 남은++;
    });
    빈칸.hidden = 남은 > 0;
  }

  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-catf]') : null;
    if (!t) return;
    칩.forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
    그리기(t.dataset.catf);
  });

  var 처음 = 칩.filter(function (x) { return x.classList.contains('on'); })[0] || 칩[0];
  처음.classList.add('on');
  그리기(처음.dataset.catf);
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

/* ── 장비 목록 정렬 — <select data-sort-cards="gear"> 와 <div data-sort-list="gear"> ──
   ⛔ 2026-08-25 검수: HO-03 · PD-01 의 「추천순 / 대여료 낮은 순 / 별점 높은 순 /
      많이 남은 순」이 고른 값만 바뀌고 카드 차례는 그대로였다.
      기능정의에 「정렬(추천·낮은 대여료·별점·잔여 많은 순)」이라 적어 두고도
      거는 장치가 없었다 — 이 팩 app.js 에는 정렬 코드가 한 줄도 없었다.

   자료는 이미 카드에 적혀 있다 — 1일 대여료 · 별점 · 「N대 중 M대 남음」 · 후기 수.
   그것을 카드마다 data-price · data-rate · data-left · data-many 로 못 박고 여기서 견준다.
   ⚠ 「추천순」은 처음 놓인 차례가 곧 그 차례라 data-rec 에 0·1·2… 를 적어 두었다.
   ⚠ 별점 · 남은 대수 · 많이 빌려간 순은 «큰 것부터»다 — option 에 data-desc 를 달았다.
   ⚠ 「많이 빌려간 순」은 카드에 «누적 대여 횟수»가 없어 후기 수(★ 옆 괄호)로 견준다.
      후기는 빌린 뒤에 쓰는 것이라 차례는 같은 방향이다. 진짜 대여 횟수를 카드에
      적게 되면 data-many 를 그 값으로 바꾸면 된다.
   ⚠ 갈래 거르개가 감춰 둔 카드(hidden)는 감춰진 채로 자리만 옮긴다 — 서로 안 싸운다. */
document.addEventListener('change', function (e) {
  var sel = e.target && e.target.closest ? e.target.closest('[data-sort-cards]') : null;
  if (!sel) return;
  var 상자 = document.querySelector('[data-sort-list="' + sel.dataset.sortCards + '"]');
  if (!상자) return;
  var 고른 = sel.options[sel.selectedIndex];
  var 키 = sel.value || 'rec';
  var 큰것부터 = !!(고른 && 고른.dataset && 고른.dataset.desc !== undefined);
  Array.prototype.slice.call(상자.children)
    .filter(function (c) { return c.dataset && c.dataset[키] !== undefined; })
    .sort(function (a, b) {
      var d = Number(a.dataset[키]) - Number(b.dataset[키]);
      return 큰것부터 ? -d : d;
    })
    .forEach(function (c) { 상자.appendChild(c); });
});
