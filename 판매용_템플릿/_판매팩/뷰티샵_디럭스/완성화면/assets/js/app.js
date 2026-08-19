/* 뷰티샵 예약 플랫폼 — 공통 인터랙션
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
    /* ⛔ 2026-08-19: 거르는 칩(data-shopf)은 «매장 거르기»가 켜짐을 맡는다.
       여기서 또 toggle 하면 켠 것을 곧바로 다시 꺼 버린다. */
    if (t.dataset.shopf) return;
    t.classList.toggle('on');
  });

  /* 찜하기 */
  on('.heart', 'click', function (e, t) {
    e.preventDefault();
    var on_ = t.classList.toggle('on');
    t.textContent = on_ ? '♥' : '♡';
    toast(on_ ? '관심 매장에 담았어요' : '관심 매장에서 뺐어요', on_ ? '관심 매장 보기' : '되돌리기');
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
    toast('쿠폰을 받았어요. 예약할 때 적용하세요', '쿠폰함', 'ok');
  });

  /* 지도 핀 — 누르면 미리보기 시트의 매장명이 바뀐다 */
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
        var m = Math.floor(left / 60), s = left % 60;
        el.textContent = m + ':' + (s < 10 ? '0' : '') + s;
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
     끝에 닿으면 화살표를 흐리게 해 더 갈 데가 없다는 걸 보여 준다. */
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

(function () {

  /* ── 매장 목록 거르기 ────────────────────────────────────────────────
     ⛔ 2026-08-19 검수: 「최소 평점」·「편의」 칩을 눌러도 켜짐 표시만 바뀌고
        매장 12곳이 그대로였다. 거르는 장치가 아예 안 걸려 있었다.

     자료는 이미 카드에 있다 — 평점은 `.bd b`(4.9), 편의는 위쪽 `.tags .badge`(주차가능).
     칩 이름과 배지 글자가 조금 다를 뿐이라(「주차 가능」 ↔ 「주차가능」) 짝만 지어 주면 된다.
     ⚠ 「야간 영업」은 짝지을 배지가 없어서 칩을 뺐다 — 근거 없이 지어 붙이지 않는다. */
  (function 매장거르기() {
    var 목록 = document.querySelector('.mag');
    if (!목록) return;
    var 카드들 = [].slice.call(목록.querySelectorAll('.mcard'));
    if (!카드들.length) return;

    /* 칩 이름 → 카드 배지에 실제로 쓰인 말들 */
    var 편의짝 = {
      '주차 가능': ['주차가능', '주차2시간', '발렛'],
      '1인샵': ['1인샵'],
      '여성 전용': ['여성전용'],
    };

    /* 카드마다 «무엇을 갖췄나»를 미리 읽어 둔다 */
    카드들.forEach(function (카드) {
      var 배지 = [].slice.call(카드.querySelectorAll('.tags .badge')).map(function (b) {
        return (b.textContent || '').trim();
      });
      카드.__편의 = 배지;
      var 평 = 카드.querySelector('.bd b');
      카드.__평점 = 평 ? parseFloat((평.textContent || '').replace(/[^0-9.]/g, '')) || 0 : 0;
    });

    var 고른평점 = 0;      /* 0 이면 안 걸린 것 */
    var 고른편의 = [];     /* 여러 개 고를 수 있다 */

    function 다시그리기() {
      var 남은 = 0;
      카드들.forEach(function (카드) {
        var ok = true;
        if (고른평점 && 카드.__평점 < 고른평점) ok = false;
        if (ok && 고른편의.length) {
          ok = 고른편의.every(function (이름) {
            var 후보 = 편의짝[이름] || [];
            return 카드.__편의.some(function (b) { return 후보.indexOf(b) >= 0; });
          });
        }
        카드.hidden = !ok;
        if (ok) 남은++;
      });

      /* 「전체 1,204곳 가운데 12곳만…」 옆에 지금 몇 곳인지 보탠다 */
      var 셈칸 = document.querySelector('[data-shop-count]');
      if (셈칸) 셈칸.textContent = 남은;

      /* 하나도 안 남으면 알려 준다 — 빈 채로 두면 고장으로 보인다 */
      var 빈칸 = document.querySelector('[data-shop-empty]');
      if (빈칸) 빈칸.hidden = 남은 > 0;
    }

    /* 칩을 누르면 — 평점은 하나만, 편의는 여러 개 */
    document.addEventListener('click', function (e) {
      var 칩 = e.target.closest && e.target.closest('[data-shopf]');
      if (!칩) return;
      var 갈래 = 칩.dataset.shopf;
      var 값 = 칩.dataset.shopv;

      if (갈래 === 'rate') {
        var 껐다 = 칩.classList.contains('on');
        document.querySelectorAll('[data-shopf="rate"]').forEach(function (x) {
          x.classList.remove('on');
          var xx = x.querySelector('.x'); if (xx) xx.remove();
        });
        고른평점 = 껐다 ? 0 : parseFloat(값);
        if (!껐다) {
          칩.classList.add('on');
          if (!칩.querySelector('.x')) {
            var s = document.createElement('span'); s.className = 'x'; s.textContent = ' ✕';
            칩.appendChild(s);
          }
        }
      } else if (갈래 === 'amenity') {
        var i = 고른편의.indexOf(값);
        if (i >= 0) { 고른편의.splice(i, 1); 칩.classList.remove('on'); }
        else { 고른편의.push(값); 칩.classList.add('on'); }
      } else return;

      다시그리기();
    });

    다시그리기();
  })();

})();
