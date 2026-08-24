/* 공동구매(공구) 플랫폼 — 공통 인터랙션
   프로토타입용 최소 동작: 탭 / 아코디언 / 칩 / 찜 / 별점 / 슬롯 / 토스트 / 모달 / 시트 */
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

  /* 「…html#tab:값」으로 들어오면 그 탭을 눌러 준 채로 연다.
     ⛔ 2026-08-25 검수: 자식 화면(MY0103 불발 탭)에서 「진행 중」과 「전체」가 둘 다 MY0101 로
        가서, 이름이 다른데 열리는 것이 똑같았다. 값은 거르는 탭이면 data-v 를 쓴다.
     ⚠ 「첫 실행」이 기본 탭을 다시 켜며 우리 것을 덮어쓰지 않도록 load 로 건다. */
  function 해시탭열기() {
    var raw = location.hash || '';
    try { raw = decodeURIComponent(raw); } catch (err) { /* 망가진 해시면 그대로 본다 */ }
    if (raw.indexOf('#tab:') !== 0) return;
    var key = raw.slice(5);
    if (!key) return;
    var t = document.querySelector('.tab[data-v="' + key + '"], .tab[data-pane="' + key + '"]');
    if (t && !t.classList.contains('on')) t.click();
  }
  if (document.readyState === 'complete') 해시탭열기();
  else addEventListener('load', 해시탭열기);

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
    toast(on_ ? '관심 공구에 담았어요' : '관심 공구에서 뺐어요', on_ ? '관심 공구 보기' : '되돌리기');
  });

  /* 토글 스위치 */
  on('.toggle', 'click', function (e, t) {
    t.classList.toggle('on');
    if (t.dataset.toast) toast(t.dataset.toast);
  });

  /* 수량 스텝퍼 */
  on('.stepper button', 'click', function (e, t) {
    var box = t.closest('.stepper');
    var num = box.querySelector('.num');
    var v = parseInt(num.textContent, 10) || 0;
    v += (t.dataset.step === '-' ? -1 : 1);
    if (v < 0) v = 0;
    num.textContent = v;
  });

  /* 달력 날짜 선택 */
  on('.cal-d', 'click', function (e, t) {
    if (t.classList.contains('off')) {
      toast(t.dataset.why || '이 날짜는 고를 수 없어요');
      return;
    }
    var g = t.closest('.cal-grid');
    g.querySelectorAll('.cal-d').forEach(function (x) { x.classList.remove('sel'); });
    t.classList.add('sel');
  });

  /* 시간 슬롯 선택 */
  on('.slot', 'click', function (e, t) {
    if (t.classList.contains('full') || t.classList.contains('dim')) {
      toast(t.dataset.why || '이 시간은 고를 수 없어요');
      return;
    }
    var box = t.closest('.slots');
    box.querySelectorAll('.slot').forEach(function (x) { x.classList.remove('on'); });
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

  /* 라디오 카드 */
  on('.radio', 'click', function (e, t) {
    if (t.classList.contains('is-off')) return;
    var name = t.dataset.group;
    if (!name) return;
    document.querySelectorAll('.radio[data-group="' + name + '"]').forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
    var i = t.querySelector('input'); if (i) i.checked = true;
  });

  /* 닫기 (배너·토스트·모달·시트) */
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


  /* 달력 이전/다음 달 — 화면 안에서 끝나는 조작이라 실제로 바뀌어야 한다.
     프로토타입이라 날짜 칸은 그대로 두고 월 표시만 옮긴다(2026-08-04). */
  on('.cal-mv', 'click', function (e, t) {
    var box = t.closest('.cal-hd'); if (!box) return;
    var el = box.querySelector('.cal-m'); if (!el) return;
    var m = /(\d{4})년\s*(\d{1,2})월/.exec(el.textContent); if (!m) return;
    var y = +m[1], mo = +m[2] + (+t.dataset.mv);
    if (mo < 1) { mo = 12; y -= 1; } else if (mo > 12) { mo = 1; y += 1; }
    el.textContent = y + '년 ' + mo + '월';
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

  /* 쿠폰 받기 */
  on('[data-getcoupon]', 'click', function (e, t) {
    if (t.classList.contains('is-off')) return;
    t.classList.add('is-off');
    t.textContent = '받음';
    toast('쿠폰을 받았어요. 참여할 때 적용하세요', '쿠폰함', 'ok');
  });

  /* 지도 핀 — 누르면 미리보기 시트의 이름이 바뀐다 */
  on('.map .pin', 'click', function (e, t) {
    var m = t.closest('.map');
    m.querySelectorAll('.pin').forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
    var pv = document.querySelector('[data-map-preview]');
    if (pv && t.dataset.name) {
      pv.querySelectorAll('[data-map-name]').forEach(function (x) { x.textContent = t.dataset.name; });
    }
  });

  /* 카운트다운 — data-count="600" (초) */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var left = parseInt(el.dataset.count, 10) || 0;
      var tick = function () {
        var h = Math.floor(left / 3600), m = Math.floor((left % 3600) / 60), s = left % 60;
        var p = function (n) { return (n < 10 ? '0' : '') + n; };
        el.textContent = h > 0 ? h + ':' + p(m) + ':' + p(s) : m + ':' + p(s);
        if (left <= 0) return;
        left--;
        setTimeout(tick, 1000);
      };
      tick();
    });
  });

  /* 동의 체크박스로 버튼 잠금 해제 — data-unlock="버튼id" */
  on('[data-unlock]', 'change', function (e, t) {
    var b = document.getElementById(t.dataset.unlock);
    if (!b) return;
    b.disabled = !t.checked;
    b.classList.toggle('is-off', !t.checked);
  });

  /* 화면 정보 패널 */
  on('.dev-btn', 'click', function (e, t) {
    var box = t.closest('.dev');
    box.classList.toggle('on');
    try { localStorage.setItem('bs.spec', box.classList.contains('on') ? '1' : '0'); } catch (_) {}
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
     한 번에 카드 폭만큼씩 밀고, 끝에 닿으면 화살표를 흐리게 한다. */
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
    var step = card ? card.getBoundingClientRect().width + 16 : 280;
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

/* ================= 거르기 · 정렬 · 검색 (2026-08-20) =================
 *
 * 왜 붙였나 — 촬영 검수에서 사장님이 카테고리 탭을 눌러 보셨는데 «밑줄만» 옮겨 갔다.
 *   목록은 한 글자도 안 바뀌었다. 칩도 켜졌다 꺼졌다 할 뿐 아무것도 거르지 않았다.
 *   공동구매 두 팩은 탭 33/33 · 칩 48/48 이 전부 그랬다.
 *
 * ⛔ LMS 때와 «까닭이 다르다». 그때는 엔진이 제대로 돌았는데 [hidden] 이 CSS 에 져서
 *   목록만 그대로였다(한 줄로 고쳤다). 여기는 엔진 자체가 없었다.
 *
 * 쓰는 법 — LMS 프리미엄과 같은 약속이다.
 *   목록: <div data-list="deals"> 안의 항목마다 data-tags="cat:뷰티 st:임박"
 *   조작: <button data-fgroup="deals" data-f="cat" data-v="뷰티">
 *   전체: data-v="*"  (그 갈래의 조건을 푼다)
 *   세기: <span data-fcount="deals">   · 비었을 때: <div data-list-empty="deals">
 *   풀기: <button data-freset="deals"> · 검색: <input data-search="deals">
 *   정렬: <select data-sortlist="deals"> 의 value 는 data-v<이름> 을 가리킨다
 */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var nf = function (n) { return Number(n).toLocaleString('ko-KR'); };
  function on(sel, ev, fn) {
    document.addEventListener(ev, function (e) {
      var t = e.target.closest && e.target.closest(sel);
      if (t) fn(e, t);
    });
  }
  function 알림(m) { if (typeof window.toast === 'function') window.toast(m); }

  var 상태 = {};                                   /* { 목록이름: { 갈래: [값] } } */
  function 챙기기(list) { if (!상태[list]) 상태[list] = {}; return 상태[list]; }

  function 거르기(list) {
    if (!list) return;
    var box = $('[data-list="' + list + '"]');
    if (!box) return;
    var st = 챙기기(list);
    var q = (st.__q || '').trim().toLowerCase();
    var items = $$('[data-tags]', box);
    var 남은수 = 0;

    items.forEach(function (it) {
      var tags = (it.dataset.tags || '').split(/\s+/);
      var ok = true;
      Object.keys(st).forEach(function (k) {
        if (k.indexOf('__') === 0) return;
        var vals = st[k];
        if (!vals || !vals.length) return;
        var 맞음 = vals.some(function (v) { return tags.indexOf(k + ':' + v) >= 0; });
        if (!맞음) ok = false;
      });
      if (ok && q) ok = (it.dataset.q || it.textContent).toLowerCase().indexOf(q) >= 0;
      if (ok) 남은수 += 1;                          /* 「더 보기」로 접은 것도 수에는 넣는다 */
      it.hidden = !ok || it.hasAttribute('data-more-hidden');
    });

    $$('[data-fcount="' + list + '"]').forEach(function (el) { el.textContent = nf(남은수); });

    /* 탭 옆 숫자 — 갈래별로 몇 개인지 */
    $$('[data-fgroup="' + list + '"][data-f]').forEach(function (btn) {
      var cnt = btn.querySelector('.cnt');
      if (!cnt || !btn.dataset.v) return;
      var k = btn.dataset.f, v = btn.dataset.v;
      cnt.textContent = nf(items.filter(function (it) {
        return v === '*' ? true : (it.dataset.tags || '').split(/\s+/).indexOf(k + ':' + v) >= 0;
      }).length);
    });

    var 빈칸 = $('[data-list-empty="' + list + '"]');
    if (빈칸) 빈칸.hidden = 남은수 > 0;

    /* 「더 보기 (N개 남음)」 — 조건을 걸면 남는 수가 달라진다.
       ⛔ 조건을 걸었는데 「120개 남음」이 그대로면 손님이 속는다. */
    /* ⛔ 조건이 걸리면 「더 보기」를 감춘다.
       조건에 맞는 것이 «몇 개 더» 있는지 우리는 모른다 — 견본 여덟 개만 들고 있다.
       그런데 「120개 남음」을 그대로 두면 손님은 뷰티가 120개 더 있다고 읽는다. */
    var 조건걸림 = !!(st.__q && st.__q.trim()) || Object.keys(st).some(function (k) {
      return k.indexOf('__') !== 0 && st[k] && st[k].length;
    });
    $$('[data-morelabel="' + list + '"]').forEach(function (el) {
      var 전체 = Number(el.dataset.moretotal || 0);
      el.hidden = 조건걸림;
      var 글 = el.querySelector('[data-moretext]') || el;
      글.textContent = '더 보기 (' + nf(Math.max(0, 전체 - 남은수)) + '개 남음)';
    });

    var 칩바 = $('[data-chipbar="' + list + '"]');
    if (칩바) 칩바그리기(list, 칩바);
  }
  window.거르기 = 거르기;

  function 칩바그리기(list, box) {
    var st = 챙기기(list);
    var html = '';
    if (st.__q) html += '<button class="chip on" type="button" data-fclearq="' + list + '">검색어 “' + st.__q + '” <span class="x">✕</span></button>';
    Object.keys(st).forEach(function (k) {
      if (k.indexOf('__') === 0) return;
      (st[k] || []).forEach(function (v) {
        if (v === '*') return;
        html += '<button class="chip on" type="button" data-fgroup="' + list + '" data-f="' + k + '" data-v="' + v + '">' + v + ' <span class="x">✕</span></button>';
      });
    });
    box.innerHTML = html;
  }

  /* 탭·칩을 누르면 */
  on('[data-fgroup][data-f]', 'click', function (e, t) {
    var list = t.dataset.fgroup, k = t.dataset.f, v = t.dataset.v;
    var st = 챙기기(list);
    var 무리 = t.closest('[data-fset]');
    var 여럿 = 무리 ? 무리.hasAttribute('data-multi') : t.hasAttribute('data-multi');

    if (v === '*') { st[k] = []; }
    else if (여럿) {
      st[k] = st[k] || [];
      var i = st[k].indexOf(v);
      if (i >= 0) st[k].splice(i, 1); else st[k].push(v);
    } else {
      st[k] = (st[k] && st[k][0] === v) ? [] : [v];
    }

    /* 켜짐 표시는 «화면 전체»에서 같은 무리를 찾아 갱신한다.
       ⛔ 상자 안에서만 갱신하면, 같은 갈래를 가리키는 다른 자리의 단추가 안 꺼진다.
          목록은 맞게 걸러지는데 표시만 손님을 속인다 (LMS 8/19 에 실제로 그랬다). */
    $$('[data-fgroup="' + list + '"][data-f="' + k + '"]').forEach(function (x) {
      var xv = x.dataset.v;
      if (!xv) return;
      if (x.closest('[data-chipbar]')) return;      /* 칩바는 다시 그린다 */
      x.classList.toggle('on', xv === '*' ? !(st[k] && st[k].length) : (st[k] || []).indexOf(xv) >= 0);
    });
    거르기(list);
  });

  /* 조건 모두 풀기 */
  on('[data-freset]', 'click', function (e, t) {
    var list = t.dataset.freset;
    상태[list] = {};
    $$('[data-fgroup="' + list + '"]').forEach(function (x) {
      if (x.closest('[data-chipbar]')) return;
      x.classList.toggle('on', x.dataset.v === '*');
    });
    $$('[data-search="' + list + '"]').forEach(function (x) { x.value = ''; });
    거르기(list);
    알림('조건을 모두 풀었어요');
  });

  on('[data-fclearq]', 'click', function (e, t) {
    var list = t.dataset.fclearq;
    챙기기(list).__q = '';
    $$('[data-search="' + list + '"]').forEach(function (x) { x.value = ''; });
    거르기(list);
  });

  /* 검색 — 몇 개가 남았는지 «말해 준다».
     ⛔ 「걸러졌어요」라고만 하고 실제 결과가 0개인 것은 거짓말이다 (LMS 8/19). */
  on('[data-search-go]', 'click', function (e, t) {
    var list = t.dataset.searchGo;
    거르기(list);
    var 칸 = $('[data-fcount="' + list + '"]');
    var n = 칸 ? (칸.textContent || '').trim() : '';
    알림(n === '0' ? '조건에 맞는 공구가 없어요. 조건을 하나씩 풀어 보세요'
                   : '아래 목록에 ' + n + '개가 남았어요');
  });

  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.search) {
      챙기기(t.dataset.search).__q = t.value;
      거르기(t.dataset.search);
    }
  });

  /* 정렬 — 카드를 실제로 다시 늘어세운다 */
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t.dataset || !t.dataset.sortlist) return;
    var box = $('[data-list="' + t.dataset.sortlist + '"]');
    if (!box) return;
    var key = t.value || (t.options[t.selectedIndex] && t.options[t.selectedIndex].dataset.k);
    if (!key) return;
    var 칸 = 'v' + key.charAt(0).toUpperCase() + key.slice(1);
    var items = $$('[data-tags]', box);
    var 오름 = key === 'left';                      /* 마감 임박순만 «적을수록 먼저» */
    items.sort(function (a, b) {
      var av = Number(a.dataset[칸] || 0), bv = Number(b.dataset[칸] || 0);
      return 오름 ? av - bv : bv - av;
    });
    items.forEach(function (x) { box.appendChild(x); });

    /* 「인기 N위」 배지는 «인기순»일 때만 뜻이 있다.
       ⛔ 마감 임박순으로 늘어세웠는데 배지가 3위·2위·5위… 로 남으면 손님이 순서를 못 읽는다.
          배지는 카드에 붙어 다니지 차례를 따라오지 않는다. */
    var 인기순 = key === 'pop';
    items.forEach(function (x) {
      var 배지 = x.querySelector('.rank');
      if (배지) 배지.hidden = !인기순;
    });

    알림((t.options[t.selectedIndex] ? t.options[t.selectedIndex].textContent : '') + '으로 다시 늘어세웠어요');
  });

  /* 화면이 열릴 때 한 번 — 마크업에 「on」으로 적어 둔 것을 상태에 실어 준다.
     그래야 처음부터 걸려 있는 조건과 목록이 어긋나지 않는다. */
  document.addEventListener('DOMContentLoaded', function () {
    $$('[data-list]').forEach(function (box) {
      var list = box.dataset.list;
      var st = 챙기기(list);
      $$('[data-fgroup="' + list + '"][data-f].on').forEach(function (x) {
        if (x.closest('[data-chipbar]')) return;
        if (!x.dataset.v || x.dataset.v === '*') return;
        st[x.dataset.f] = st[x.dataset.f] || [];
        if (st[x.dataset.f].indexOf(x.dataset.v) < 0) st[x.dataset.f].push(x.dataset.v);
      });
      거르기(list);
    });
  });
})();

/* ── 촬영용 — 오른쪽 아래 개발 단추를 숨긴다 (2026-08-20) ──
 * 주소 뒤에 ?촬영 을 붙이면 「☰ 화면 목록」·「HO-01 화면 정보」가 사라진다.
 * 녹화할 때 그 단추가 화면마다 찍혀서 만들었다. 한 번 켜면 그 창에서는 계속 꺼져 있다. */
(function () {
  'use strict';
  try {
    if (location.search.indexOf('촬영') >= 0) sessionStorage.setItem('촬영', '1');
    if (location.search.indexOf('촬영끄기') >= 0) sessionStorage.removeItem('촬영');
    if (sessionStorage.getItem('촬영') === '1') document.documentElement.classList.add('촬영중');
  } catch (e) { /* 저장이 막혀 있어도 화면은 뜬다 */ }
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
