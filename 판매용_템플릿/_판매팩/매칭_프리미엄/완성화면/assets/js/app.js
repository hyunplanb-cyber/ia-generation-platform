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

(function () {

  /* ── 견본 날짜를 오늘 기준으로 옮긴다 ──────────────────────────────────
     견본은 만든 날에 맞춰 날짜가 적혀 있다. 그대로 두면 몇 달 뒤 여는 손님은
     지난 마감·지난 일정만 보게 된다.
     ⛔ 2026-08-19 검수: 「마감까지 2일」은 오늘을 8/18 로 가리키는데
        「이번 주」가 붙은 일감은 8월 첫째 주였다. 자료끼리도 어긋나 있었다.

     기준일과 오늘의 차이만큼 화면의 날짜를 통째로 민다. 날짜 사이 간격은 그대로라
     「마감까지 2일」·「이번 주」 같은 말은 손대지 않아도 계속 맞는다.
     ⭐ 요일도 함께 다시 적는다 — 날짜만 밀면 「8월 20일 (목)」이 엉뚱한 요일이 된다. */
  var 견본기준일 = '2026-08-18';   /* 이 견본이 「오늘」로 삼은 날 */

  (function () {
    var 요일이름 = ['일', '월', '화', '수', '목', '금', '토'];
    var ㄱ = 견본기준일.split('-');
    var 기준 = new Date(Number(ㄱ[0]), Number(ㄱ[1]) - 1, Number(ㄱ[2]));
    var 오늘 = new Date(); 오늘.setHours(0, 0, 0, 0);
    var 민날 = Math.round((오늘 - 기준) / 86400000);

    function 밀기(y, m, d) {
      var t = new Date(y, m - 1, d);
      t.setDate(t.getDate() + 민날);
      return t;
    }
    var 두자리 = function (n) { return (n < 10 ? '0' : '') + n; };
    var 요일of = function (t) { return 요일이름[t.getDay()]; };

    function 옮기기() {
      var 훑개 = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      var 마디, 것들 = [];
      while ((마디 = 훑개.nextNode())) {
        var 부모 = 마디.parentNode;
        if (!부모) continue;
        if (부모.nodeName === 'SCRIPT' || 부모.nodeName === 'STYLE') continue;
        것들.push(마디);
      }

      것들.forEach(function (마디) {
        var 글 = 마디.nodeValue;
        if (!글) return;
        var 새글 = 글;

        /* 2026-08-24 (월) — 요일이 붙었으면 요일도 다시 적는다 */
        새글 = 새글.replace(/(20\d\d)-(\d\d)-(\d\d)(\s*)\((월|화|수|목|금|토|일)\)/g,
          function (_, y, m, d, 틈) {
            var t = 밀기(Number(y), Number(m), Number(d));
            return t.getFullYear() + '-' + 두자리(t.getMonth() + 1) + '-' + 두자리(t.getDate())
              + 틈 + '(' + 요일of(t) + ')';
          });

        /* 2026-08-24 */
        새글 = 새글.replace(/(20\d\d)-(\d\d)-(\d\d)/g, function (_, y, m, d) {
          var t = 밀기(Number(y), Number(m), Number(d));
          return t.getFullYear() + '-' + 두자리(t.getMonth() + 1) + '-' + 두자리(t.getDate());
        });

        /* 8월 24일 (월) — 해는 안 적혔으니 기준일의 해로 본다 */
        새글 = 새글.replace(/(\d{1,2})월(\s*)(\d{1,2})일(\s*)\((월|화|수|목|금|토|일)\)/g,
          function (_, m, t1, d, t2) {
            var t = 밀기(기준.getFullYear(), Number(m), Number(d));
            return (t.getMonth() + 1) + '월' + t1 + t.getDate() + '일' + t2 + '(' + 요일of(t) + ')';
          });

        /* 2026년 8월 24일 */
        새글 = 새글.replace(/(20\d\d)년(\s*)(\d{1,2})월(\s*)(\d{1,2})일/g,
          function (_, y, t1, m, t2, d) {
            var t = 밀기(Number(y), Number(m), Number(d));
            return t.getFullYear() + '년' + t1 + (t.getMonth() + 1) + '월' + t2 + t.getDate() + '일';
          });

        /* 8/24 (월) */
        새글 = 새글.replace(/(\d{1,2})\/(\d{1,2})(\s*)\((월|화|수|목|금|토|일)\)/g,
          function (_, m, d, 틈) {
            var t = 밀기(기준.getFullYear(), Number(m), Number(d));
            return (t.getMonth() + 1) + '/' + t.getDate() + 틈 + '(' + 요일of(t) + ')';
          });

        /* 주문·예약 번호에 박힌 날짜 (R-20260807-0009 처럼) */
        새글 = 새글.replace(/(20\d\d)(\d\d)(\d\d)(?=-\d)/g, function (_, y, m, d) {
          var t = 밀기(Number(y), Number(m), Number(d));
          return '' + t.getFullYear() + 두자리(t.getMonth() + 1) + 두자리(t.getDate());
        });

        /* 차트 축의 8/7 — svg 안에서만. 「12/18차시」 같은 것을 건드리면 안 된다 */
        if (마디.parentNode.closest && 마디.parentNode.closest('svg')) {
          새글 = 새글.replace(/^(\d{1,2})\/(\d{1,2})$/, function (_, m, d) {
            var t = 밀기(기준.getFullYear(), Number(m), Number(d));
            return (t.getMonth() + 1) + '/' + t.getDate();
          });
        }

        if (새글 !== 글) 마디.nodeValue = 새글;
      });
    }

    /* 민 날이 0이어도 요일은 다시 적어 둔다 — 만든 날의 달력이 틀렸을 수 있다 */
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', 옮기기);
    else 옮기기();
  })();

})();

/* ── 최근 검색어 지우기 ──────────────────────────────────────────────
   ⛔ 2026-08-19 검수: 「이 검색어만 지웠어요」·「모두 지웠어요」라고 알려 놓고
      칩은 그대로 남아 있었다. 지웠다고 말해 놓고 안 지우는 것은 거짓말이다.
   다 지우면 「최근 검색어」 제목까지 감춘다 — 제목만 남으면 빈 자리로 보인다. */
(function 최근검색어() {
  var 구역 = document.querySelector('[data-recent]');
  if (!구역) return;

  function 남았나() {
    var n = 구역.querySelectorAll('[data-recent-x]').length;
    if (n === 0) 구역.hidden = true;
  }

  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest) return;

    var 전부 = e.target.closest('[data-recent-clear]');
    if (전부) {
      구역.querySelectorAll('[data-recent-x]').forEach(function (c) { c.remove(); });
      구역.hidden = true;
      return;
    }

    var 하나 = e.target.closest('[data-recent-x]');
    if (하나 && 구역.contains(하나)) {
      하나.remove();
      남았나();
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
