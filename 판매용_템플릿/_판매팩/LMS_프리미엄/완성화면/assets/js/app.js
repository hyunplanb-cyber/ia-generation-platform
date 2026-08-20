/* 온라인 강의 플랫폼(LMS) — 공통 동작
   화면 안에서 끝나는 조작은 진짜로 값이 바뀐다.
   서버가 있어야 하는 것(저장·발송·결제)만 안내 문구로 대신한다. */
(function () {
  /* 받침을 보고 조사를 고른다 — 「비밀번호를」·「이메일을」처럼 읽히게 한다.
     2026-08-19 검수: 「을(를)」·「(으)로」가 손님 화면에 그대로 나갔다. */
  function 조사붙이기(말, 있, 없) {
    var c = String(말).charCodeAt(String(말).length - 1) - 0xac00;
    return 말 + (c >= 0 && c <= 11171 && c % 28 !== 0 ? 있 : 없);
  }
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function on(sel, ev, fn) {
    document.addEventListener(ev, function (e) {
      var t = e.target.closest ? e.target.closest(sel) : null;
      if (t) fn(e, t);
    });
  }
  var nf = function (n) { return Number(n).toLocaleString('ko-KR'); };
  var won = function (n) { return nf(n) + '원'; };

  /* ---------- 안내 문구 (토스트) ---------- */
  var tRef = null;
  function toast(msg, action, kind) {
    if (tRef && tRef.parentNode) tRef.remove();
    var d = document.createElement('div');
    d.className = 'toast' + (kind === 'ok' ? ' toast-ok' : '');
    var s = document.createElement('span'); s.textContent = msg; d.appendChild(s);
    var a = document.createElement('span'); a.className = 'act'; a.textContent = action || '닫기';
    a.addEventListener('click', function () { d.remove(); });
    d.appendChild(a);
    document.body.appendChild(d);
    tRef = d;
    setTimeout(function () { if (d.parentNode) d.remove(); }, 3200);
  }
  window.toast = toast;
  on('[data-toast]', 'click', function (e, t) {
    if (t.disabled || t.classList.contains('is-off')) return;
    toast(t.dataset.toast, t.dataset.toastAct || '', t.dataset.toastKind || '');
  });

  /* ---------- 화면 이동 ---------- */
  on('[data-go]', 'click', function (e, t) { location.href = t.dataset.go; });


  /* 한 번 누르면 끝나는 단추 — 누른 뒤 글자를 바꾸고 다시 눌리지 않게 한다.
     ⛔ 2026-08-19 검수: 쿠폰 「받기」 를 몇 번이고 눌러도 「받았어요」 가 또 나왔다.
     받았는지 손님이 알 수 없었다. */
  on('[data-once]', 'click', function (e, t) {
    if (t.dataset.onceDone) { e.preventDefault(); e.stopPropagation(); return; }
    t.dataset.onceDone = '1';
    t.textContent = t.dataset.once || '완료';
    t.classList.add('is-off');
    t.disabled = true;
  });

  /* ================= 탭 ================= */
  on('.tab', 'click', function (e, t) {
    if (t.dataset.go) return;
    var box = t.closest('.tabs, .tabs-pill');
    if (!box) return;
    $$('.tab', box).forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
    /* 탭 줄이 화면 아래쪽에 있으면 위로 올린다 — 바뀐 내용이 화면 밖에 있으면
       손님은 아무것도 안 바뀐 줄 안다 (2026-08-19 검수) */
    var 탭자리 = box.getBoundingClientRect();
    if (탭자리.top > innerHeight * 0.4 && box.scrollIntoView) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    var key = t.dataset.pane;
    if (key) {
      var scope = box.dataset.panes ? $('[data-pane-set="' + box.dataset.panes + '"]') : box.parentElement;
      if (scope) $$('[data-pane-body]', scope).forEach(function (p) { p.hidden = p.dataset.paneBody !== key; });
    }
    if (t.dataset.f) applyFilter(t.dataset.fgroup || (box.dataset.fgroup || ''));
    if (t.dataset.swap) swap(t);
  });

  /* 미리 만들어 둔 덩어리를 바꿔 끼운다 (차트·요약 등) */
  function swap(t) {
    var set = t.dataset.swap;         // "chart:30"  → [data-swap-set="chart"] 안에서 [data-swap-key="30"]만 보인다
    var parts = set.split(':');
    var box = $('[data-swap-set="' + parts[0] + '"]');
    if (!box) return;
    $$('[data-swap-key]', box).forEach(function (x) { x.hidden = x.dataset.swapKey !== parts[1]; });
  }
  on('[data-swap]', 'click', function (e, t) {
    if (t.classList.contains('tab') || t.disabled) return;
    swap(t);
  });
  /* 드롭다운으로 바꿔 끼우기 */
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t.dataset || !t.dataset.swapsel) return;
    swap({ dataset: { swap: t.dataset.swapsel + ':' + t.value } });
  });

  /* ================= 필터 · 정렬 · 검색 ================= */
  /* 목록: <div data-list="courses"> 안의 항목마다 data-tags="cat:개발 lv:입문"
     조작: <button data-fgroup="courses" data-f="cat" data-v="개발"> */
  var fstate = {};   // { listId: { key: [values] } }

  function ensure(list) { if (!fstate[list]) fstate[list] = {}; return fstate[list]; }

  function applyFilter(list) {
    if (!list) return;
    var box = $('[data-list="' + list + '"]');
    if (!box) return;
    var st = ensure(list);
    var q = (st.__q || '').trim().toLowerCase();
    var items = $$('[data-tags]', box);
    var shown = 0;
    items.forEach(function (it) {
      var tags = (it.dataset.tags || '').split(/\s+/);
      var ok = true;
      Object.keys(st).forEach(function (k) {
        if (k.indexOf('__') === 0) return;
        var vals = st[k];
        if (!vals || !vals.length) return;
        var hit = vals.some(function (v) { return tags.indexOf(k + ':' + v) >= 0; });
        if (!hit) ok = false;
      });
      if (ok && st.__price != null && it.dataset.vPrice != null) ok = Number(it.dataset.vPrice) <= Number(st.__price);
      if (ok && q) ok = (it.dataset.q || it.textContent).toLowerCase().indexOf(q) >= 0;
      if (ok) shown++;                       /* 「더 보기」로 접어 둔 것도 결과 수에는 넣는다 */
      it.hidden = !ok || it.hasAttribute('data-more-hidden');
    });
    $$('[data-fcount="' + list + '"]').forEach(function (el) { el.textContent = nf(shown); });
    /* 탭 옆 숫자 — 각 값별 개수 */
    $$('[data-fgroup="' + list + '"][data-f]').forEach(function (btn) {
      var cnt = btn.querySelector('.cnt');
      if (!cnt || !btn.dataset.v) return;
      var k = btn.dataset.f, v = btn.dataset.v;
      var n = items.filter(function (it) {
        return v === '*' ? true : (it.dataset.tags || '').split(/\s+/).indexOf(k + ':' + v) >= 0;
      }).length;
      cnt.textContent = nf(n);
    });
    var emptyBox = $('[data-list-empty="' + list + '"]');
    if (emptyBox) emptyBox.hidden = shown > 0;
    /* 쪽 번호 — 조건을 걸어 결과가 줄면 한 쪽에 다 들어간다. 그때는 쪽 번호를 감춘다.
       ⛔ 2026-08-19: 전에는 2개만 남아도 「1 2 3 4 5」 가 그대로 있었고,
       어느 쪽을 눌러도 같은 목록이 나왔다. 조건이 바뀌면 1쪽으로도 되돌린다. */
    var pager = $('[data-pager="' + list + '"]');
    if (pager) {
      var 줄었다 = shown < items.length;
      pager.hidden = 줄었다;
      $$('[data-page]', pager).forEach(function (x) {
        x.classList.toggle('on', x.dataset.page === '1');
      });
    }
    var chipBox = $('[data-chipbar="' + list + '"]');
    if (chipBox) renderChipbar(list, chipBox);
  }
  window.applyFilter = applyFilter;

  function renderChipbar(list, box) {
    var st = ensure(list);
    var html = '';
    if (st.__q) html += '<button class="chip on" type="button" data-fclearq="' + list + '">검색어 “' + st.__q + '” <span class="x">✕</span></button>';
    Object.keys(st).forEach(function (k) {
      if (k.indexOf('__') === 0) return;
      (st[k] || []).forEach(function (v) {
        if (v === '*') return;
        html += '<button class="chip on" type="button" data-fgroup="' + list + '" data-f="' + k + '" data-v="' + v + '">' + v + ' <span class="x">✕</span></button>';
      });
    });
    box.innerHTML = html || '<span class="t-sub">걸린 조건이 없어요. 전체를 보고 있습니다</span>';
  }

  /* 정산 「월」 고르개 — 고른 달의 표와 합계로 다시 그린다.
     달별 자료는 고르개의 data-months 에 실려 온다(build/data.mjs 의 SETTLE_BY_MONTH). */
  document.addEventListener('change', function (e) {
    var sel = e.target.closest && e.target.closest('[data-settle-month]');
    if (!sel) return;
    var 자료; try { 자료 = JSON.parse(sel.dataset.months || '{}'); } catch (err) { return; }
    var 달 = 자료[sel.value] || 자료[sel.options[sel.selectedIndex].textContent];
    var 상자 = document.querySelector('[data-settle-table]');
    if (!달 || !상자) return;
    var 원 = function (n) { return nf(n) + '원'; };
    상자.querySelector('tbody').innerHTML = 달.map(function (s) {
      return '<tr><td data-v="' + s.c + '"><b>' + s.c + '</b></td>'
        + '<td class="right" data-v="' + s.n + '">' + nf(s.n) + '건</td>'
        + '<td class="right" data-v="' + s.gross + '">' + 원(s.gross) + '</td>'
        + '<td class="right" data-v="' + s.fee + '"><span class="muted">-' + nf(s.fee) + '원</span></td>'
        + '<td class="right" data-v="' + s.net + '"><b>' + 원(s.net) + '</b></td>'
        + '<td>' + s.st + '</td></tr>';
    }).join('');
    var 합 = 달.reduce(function (a, s) {
      return { n: a.n + s.n, gross: a.gross + s.gross, fee: a.fee + s.fee, net: a.net + s.net };
    }, { n: 0, gross: 0, fee: 0, net: 0 });
    var 바닥 = 상자.querySelector('tfoot');
    if (바닥) {
      바닥.innerHTML = '<tr><td>합계</td><td class="right">' + nf(합.n) + '건</td>'
        + '<td class="right">' + 원(합.gross) + '</td>'
        + '<td class="right">-' + nf(합.fee) + '원</td>'
        + '<td class="right"><b class="pri">' + 원(합.net) + '</b></td><td></td></tr>';
    }
  });

  /* 출석표 「기간」 고르개 — 고른 주차만 남기고 출석률을 그 구간으로 다시 센다.
     ⚠ 2026-08-18 검수: 알림만 뜨고 표는 그대로였다. 스펙팩 acts 는
       「출석 표와 출석률 숫자가 함께 바뀐다」고 약속해 두었다. */
  document.addEventListener('change', function (e) {
    var sel = e.target.closest && e.target.closest('[data-week-range]');
    if (!sel) return;
    var v = sel.value || 'all';
    var 부터 = 1, 까지 = 999;
    if (v !== 'all') { var m = v.split('-'); 부터 = Number(m[0]); 까지 = Number(m[1]); }
    var 표 = sel.closest('.card') ? document.querySelector('table.table') : document.querySelector('table.table');
    if (!표) return;
    표.querySelectorAll('[data-week]').forEach(function (c) {
      var n = Number(c.dataset.week);
      c.hidden = !(n >= 부터 && n <= 까지);
    });
    /* 줄마다 출석률을 «보이는 칸만»으로 다시 센다 */
    표.querySelectorAll('tbody tr').forEach(function (tr) {
      var 칸 = Array.prototype.filter.call(tr.querySelectorAll('td[data-week]'), function (c) { return !c.hidden; });
      var 셈 = 0, 온것 = 0;
      칸.forEach(function (c) {
        var b = c.querySelector('.cell');
        if (!b) return;
        if (b.classList.contains('c-na')) return;
        셈 += 1;
        if (b.classList.contains('c-ok')) 온것 += 1;
      });
      var 값 = tr.querySelector('[data-rate]');
      if (값) 값.textContent = 셈 ? Math.round(온것 / 셈 * 100) + '%' : '—';
    });
  });

  /* 고르는 칸으로 거르기 — <select data-fselect="목록" data-fkey="t">
     ⚠ 2026-08-18 검수: 「기간」 고르개들이 data-toast 만 걸려 있어 알림만 뜨고
       목록은 그대로였다. 스펙팩 acts 는 「목록과 합계가 함께 걸러진다」고 약속해
       두었다. 칩과 같은 거르개(fstate)에 태워 약속대로 돌게 한다. */
  document.addEventListener('change', function (e) {
    var t = e.target.closest && e.target.closest('[data-fselect][data-fkey]');
    if (!t) return;
    var list = t.dataset.fselect, k = t.dataset.fkey;
    var v = t.value || (t.options[t.selectedIndex] && t.options[t.selectedIndex].value);
    var st = ensure(list);
    st[k] = (!v || v === 'all') ? [] : [v];
    applyFilter(list);
  });

  on('[data-fgroup][data-f]', 'click', function (e, t) {
    var list = t.dataset.fgroup, k = t.dataset.f, v = t.dataset.v;
    var st = ensure(list);
    var group = t.closest('[data-fset]');
    var multi = group ? group.hasAttribute('data-multi') : t.hasAttribute('data-multi');
    if (v === '*') { st[k] = []; }
    else if (multi) {
      st[k] = st[k] || [];
      var i = st[k].indexOf(v);
      if (i >= 0) st[k].splice(i, 1); else st[k].push(v);
    } else {
      st[k] = (st[k] && st[k][0] === v) ? [] : [v];
    }
    /* 켜짐 표시 갱신 — 화면 전체에서 같은 무리를 찾는다.
       ⛔ 2026-08-19: 전에는 data-fset 상자 안에서만 갱신했다. 그런데 홈의 「전체 보기」는
       그 상자 밖(.chips)에 있어서, 「디자인」을 눌러도 「전체 보기」가 안 꺼지고
       「전체 보기」를 눌러도 「디자인」이 안 꺼졌다. 목록은 맞게 걸러지는데
       켜짐 표시만 손님을 속였다. 상자를 넘어 같은 list+갈래를 모두 갱신한다. */
    $$('[data-fgroup="' + list + '"][data-f="' + k + '"]').forEach(function (x) {
      var xv = x.dataset.v;
      if (!xv) return;
      if (x.closest('[data-chipbar]')) return;   /* 칩은 renderChipbar 가 다시 그린다 */
      var act = xv === '*' ? !(st[k] && st[k].length) : (st[k] || []).indexOf(xv) >= 0;
      x.classList.toggle('on', act);
    });
    applyFilter(list);
  });


  /* 검색 단추 — 몇 개가 남았는지 말해 준다.
     ⛔ 2026-08-19 검수: 「걸러졌어요」라고만 했는데 실제 결과는 0개였다. */
  on('[data-search-go]', 'click', function (e, t) {
    var list = t.dataset.searchGo;
    applyFilter(list);
    var 셈칸 = $('[data-fcount="' + list + '"]');
    var n = 셈칸 ? (셈칸.textContent || '').trim() : '';
    toast(n === '0'
      ? '조건에 맞는 강의가 없어요. 조건을 하나씩 풀어 보세요'
      : '아래 목록에 ' + n + '개가 남았어요');
  });

  on('[data-fclearq]', 'click', function (e, t) {
    var list = t.dataset.fclearq;
    ensure(list).__q = '';
    $$('[data-search="' + list + '"]').forEach(function (x) { x.value = ''; });
    applyFilter(list);
  });

  on('[data-freset]', 'click', function (e, t) {
    var list = t.dataset.freset;
    fstate[list] = {};
    $$('[data-fgroup="' + list + '"]').forEach(function (x) {
      x.classList.toggle('on', x.dataset.v === '*');
    });
    $$('[data-search="' + list + '"]').forEach(function (x) { x.value = ''; });
    applyFilter(list);
    toast('조건을 모두 풀었어요');
  });

  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.search) {
      ensure(t.dataset.search).__q = t.value;
      applyFilter(t.dataset.search);
    }
    if (t.dataset && t.dataset.pricemax) {
      ensure(t.dataset.pricemax).__price = t.value;
      applyFilter(t.dataset.pricemax);
    }
  });

  /* 정렬 — 카드 격자를 실제로 다시 늘어세운다 */
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t.dataset || !t.dataset.sortlist) return;
    var box = $('[data-list="' + t.dataset.sortlist + '"]');
    if (!box) return;
    var key = t.value;
    var items = $$('[data-tags]', box);
    items.sort(function (a, b) {
      var av = Number(a.dataset['v' + key.charAt(0).toUpperCase() + key.slice(1)] || 0);
      var bv = Number(b.dataset['v' + key.charAt(0).toUpperCase() + key.slice(1)] || 0);
      return key === 'price' ? av - bv : bv - av;
    });
    items.forEach(function (x) { box.appendChild(x); });
    toast(t.selectedOptions[0].textContent + '으로 다시 늘어세웠어요');
  });

  /* 정렬 — <table data-sortable> 의 <th data-sort="num|text"> */
  on('th[data-sort]', 'click', function (e, th) {
    var table = th.closest('table');
    var tbody = table.tBodies[0];
    var idx = Array.prototype.indexOf.call(th.parentNode.children, th);
    var dir = th.classList.contains('on') && th.dataset.dir === 'asc' ? 'desc' : 'asc';
    $$('th', table).forEach(function (x) { x.classList.remove('on'); var a = x.querySelector('.ar'); if (a) a.textContent = '↕'; });
    th.classList.add('on'); th.dataset.dir = dir;
    var ar = th.querySelector('.ar'); if (ar) ar.textContent = dir === 'asc' ? '▲' : '▼';
    var rows = $$('tr', tbody);
    rows.sort(function (a, b) {
      var av = a.children[idx], bv = b.children[idx];
      var x = av ? (av.dataset.v != null ? av.dataset.v : av.textContent.trim()) : '';
      var y = bv ? (bv.dataset.v != null ? bv.dataset.v : bv.textContent.trim()) : '';
      var r = th.dataset.sort === 'num' ? (parseFloat(x) || 0) - (parseFloat(y) || 0) : x.localeCompare(y, 'ko');
      return dir === 'asc' ? r : -r;
    });
    rows.forEach(function (r) { tbody.appendChild(r); });
  });

  /* 더 보기 */
  on('[data-more]', 'click', function (e, t) {
    var key = t.dataset.more;
    var box = $('[data-morelist="' + key + '"]');
    if (!box) return;
    var step = Number(t.dataset.moreStep || 20);
    var rest = $$('[data-more-hidden]', box);
    rest.slice(0, step).forEach(function (x) { x.removeAttribute('data-more-hidden'); x.hidden = false; });
    if (rest.length <= step) t.remove();
    if ($('[data-list="' + key + '"]')) applyFilter(key);
  });

  /* 페이지 번호 */
  on('[data-page]', 'click', function (e, t) {
    var box = t.closest('[data-pager]');
    /* ⛔ 2026-08-19: 아무 데나 눌러도 이 처리가 돌았다.
       화면 ID 를 <body data-page="HO-01"> 로 붙여 놨는데, 쪽번호 단추도 data-page 를 쓴다.
       closest 가 위로 거슬러 올라가다 결국 body 를 잡아서, 빈 자리를 눌러도
       t 가 body 가 되고 t.textContent(= 그 화면 글자 전부)가 안내 문구로 튀어나왔다.
       화면을 통째로 덮었다가 3.2초 뒤 사라진다 — 손님은 「눌렀더니 뭐가 확 떴다」로 겪는다.
       쪽번호 단추는 반드시 [data-pager] 안에 있다. 그 밖이면 아무 일도 안 한다. */
    if (!box) return;
    if (box) $$('[data-page]', box).forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
    var list = box && box.dataset.pager;
    if (list) {
      var target = $('[data-list="' + list + '"]');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    toast(t.textContent.trim() + '페이지를 보고 있어요');
  });

  /* ================= 펼치기 · 접기 ================= */
  on('.acc-q', 'click', function (e, t) {
    var item = t.closest('.acc-item');
    var box = item.parentElement;
    var wasOn = item.classList.contains('on');
    if (box && box.hasAttribute('data-acc-single')) {
      $$('.acc-item', box).forEach(function (x) { x.classList.remove('on'); });
    }
    item.classList.toggle('on', !wasOn);
  });
  on('.cur-ch>.hd', 'click', function (e, t) { t.closest('.cur-ch').classList.toggle('off'); });

  /* ================= 켜고 끄기 ================= */
  on('.toggle', 'click', function (e, t) {
    var isOn = t.classList.toggle('on');
    t.setAttribute('aria-pressed', isOn ? 'true' : 'false');
    if (t.dataset.onText) {
      var lb = $('[data-toggle-out="' + t.dataset.onText + '"]');
      if (lb) lb.textContent = isOn ? (t.dataset.textOn || '켜짐') : (t.dataset.textOff || '꺼짐');
    }
    if (t.dataset.disables) {
      $$('[data-disabled-by="' + t.dataset.disables + '"]').forEach(function (x) {
        x.disabled = isOn;
        x.classList.toggle('is-off', isOn);
      });
      recalc();
    }
    if (t.dataset.onlyList) { ensure(t.dataset.onlyList)[t.dataset.onlyKey] = isOn ? [t.dataset.onlyVal] : []; applyFilter(t.dataset.onlyList); }
  });

  on('.heart', 'click', function (e, t) {
    e.preventDefault(); e.stopPropagation();
    var isOn = t.classList.toggle('on');
    t.textContent = isOn ? '♥' : '♡';
    t.setAttribute('aria-pressed', isOn ? 'true' : 'false');
    t.setAttribute('aria-label', isOn ? '찜 해제하기' : '찜하기');
    toast(isOn ? '찜한 강의에 담았어요' : '찜을 해제했어요');
  });

  on('[data-like]', 'click', function (e, t) {
    var n = t.querySelector('.n');
    var isOn = t.classList.toggle('on');
    if (n) n.textContent = Number(n.textContent) + (isOn ? 1 : -1);
    t.style.color = isOn ? 'var(--pri-ink)' : '';
  });

  /* 인원 ± */
  on('.stepper button', 'click', function (e, t) {
    var box = t.closest('.stepper');
    var n = box.querySelector('.n');
    var v = parseInt(n.textContent, 10) || 0;
    v += (t.dataset.step === '-' ? -1 : 1);
    var min = Number(box.dataset.min || 0), max = Number(box.dataset.max || 999);
    if (v < min) v = min; if (v > max) v = max;
    n.textContent = v;
    recalc();
  });

  /* 라디오 카드 */
  on('.radio', 'click', function (e, t) {
    var name = t.dataset.group;
    if (!name) return;
    $$('.radio[data-group="' + name + '"]').forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
    var i = t.querySelector('input'); if (i) i.checked = true;
    if (t.dataset.shows) {
      $$('[data-shown-by^="' + name + ':"]').forEach(function (x) { x.hidden = x.dataset.shownBy !== name + ':' + t.dataset.shows; });
    }
    if (t.dataset.label) {
      $$('[data-pick-out="' + name + '"]').forEach(function (x) { x.textContent = t.dataset.label; });
      /* 이름이 바뀌면 뒤에 붙는 조사도 같이 바꾼다 — 「카카오페이로」·「신용카드로」 */
      $$('[data-josa-for="' + name + '"]').forEach(function (x) {
        x.textContent = 조사붙이기(t.dataset.label || '', '으로', '로').slice((t.dataset.label || '').length);
      });
    }
    recalc();
  });

  /* ================= 고른 줄 세기 ================= */
  function countSel(g) {
    var boxes = $$('.selbox[data-selgroup="' + g + '"]');
    var picked = boxes.filter(function (x) { return x.checked && !(x.closest('[data-tags]') || {}).hidden; });
    $$('[data-selcount="' + g + '"]').forEach(function (x) {
      x.textContent = nf(Number(x.dataset.base || 0) + picked.length);
    });
    $$('[data-selneed="' + g + '"]').forEach(function (b) {
      b.disabled = picked.length === 0;
      b.classList.toggle('is-off', picked.length === 0);
    });
    var all = $('[data-selall="' + g + '"]');
    if (all) all.checked = picked.length > 0 && picked.length === boxes.length;
    boxes.forEach(function (b) { var tr = b.closest('tr'); if (tr) tr.classList.toggle('on', b.checked); });
    return picked.length;
  }
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.classList && t.classList.contains('selbox')) countSel(t.dataset.selgroup);
    if (t.dataset && t.dataset.selall) {
      $$('.selbox[data-selgroup="' + t.dataset.selall + '"]').forEach(function (b) { b.checked = t.checked; });
      countSel(t.dataset.selall);
    }
    if (t.dataset && t.dataset.gate) gate(t.dataset.gate);
    if (t.dataset && t.dataset.agreeall) {
      $$('[data-agree="' + t.dataset.agreeall + '"]').forEach(function (b) { b.checked = t.checked; });
      gate(t.dataset.agreeall);
    }
    if (t.dataset && t.dataset.agree) {
      var g = t.dataset.agree;
      var reqs = $$('[data-agree="' + g + '"]');
      var all = $('[data-agreeall="' + g + '"]');
      if (all) all.checked = reqs.every(function (b) { return b.checked; });
      gate(g);
    }
    if (t.dataset && t.dataset.calc !== undefined) recalc();
  });

  /* ================= 필수 칸 검사 ================= */
  /* 안내 문구는 「눌러 봤을 때」부터 보여 준다. 화면을 열자마자 빨간 글씨가 뜨지 않게 */
  var tried = {};
  function gate(g) {
    var reqs = $$('[data-gate="' + g + '"]');
    var need = reqs.filter(function (x) {
      if (x.type === 'checkbox') return !x.checked;
      if (x.dataset.agreeOptional) return false;
      return !String(x.value || '').trim();
    });
    $$('[data-gated="' + g + '"]').forEach(function (b) {
      b.disabled = need.length > 0;
      b.classList.toggle('is-off', need.length > 0);
    });
    /* 켜진 뒤에는 「동의해야 결제 버튼이 켜집니다」 안내를 거둔다 —
       2026-08-19 검수: 단추가 켜졌는데도 안내가 그대로 남아 있었다 */
    $$('[data-gatehint="' + g + '"]').forEach(function (h) { h.hidden = need.length === 0; });
    $$('[data-gatemsg="' + g + '"]').forEach(function (m) {
      m.hidden = !tried[g] || need.length === 0;
      if (need.length) m.textContent = '⚠ ' + need.map(function (x) { return x.dataset.label || '필수 항목'; }).join(' · ') + '' + 조사붙이기(need[need.length-1].dataset.label || '필수 항목', '을', '를').slice(-1) + ' 아직 채우지 않았어요';
    });
  }

  /* ── 결제 화면에서 고른 것을 완료 화면으로 넘긴다 ─────────────────────
     ⛔ 2026-08-19 검수: 12개월 할부를 골라 「매달 5,270원 × 12개월」까지 확인했는데
        완료 화면은 「신용카드 (일시불)」이었다. 고른 값이 다음 화면으로 안 넘어갔다. */
  function 결제내용저장() {
    try {
      var 수단 = document.querySelector('[data-pick-out="pay"]');
      if (!수단) return;
      var 할부 = document.querySelector('.chip.on[data-inst]');
      var 금액 = document.querySelector('[data-out-final]');
      sessionStorage.setItem('결제내용', JSON.stringify({
        수단: (수단.textContent || '').trim(),
        할부: 할부 ? Number(할부.dataset.inst || 1) : 1,
        금액: 금액 ? (금액.textContent || '').trim() : ''
      }));
    } catch (err) { /* 저장이 막혀 있어도 화면은 그대로 돈다 */ }
  }

  function 결제내용받기() {
    var 자리 = document.querySelector('[data-paid-method]');
    if (!자리) return;
    var 내용 = null;
    try { 내용 = JSON.parse(sessionStorage.getItem('결제내용') || 'null'); } catch (err) { return; }
    if (!내용 || !내용.수단) return;
    /* 카드가 아니면 할부라는 말 자체가 없다 */
    var 할부말 = 내용.수단.indexOf('카드') >= 0
      ? ' (' + (내용.할부 > 1 ? 내용.할부 + '개월' : '일시불') + ')'
      : '';
    자리.textContent = 내용.수단 + 할부말;
    var 금 = document.querySelector('[data-paid-amount]');
    if (금 && 내용.금액) 금.textContent = 내용.금액;
  }

  window.gate = gate;
  결제내용받기();
  on('[data-gated]', 'click', function (e, t) {
    if (!t.disabled && !t.classList.contains('is-off')) { 결제내용저장(); return; }
    e.preventDefault();   /* 아직 못 누르는 링크는 넘어가지 않는다 */
    e.stopPropagation();
    var g = t.dataset.gated;
    tried[g] = true;
    $$('[data-gate="' + g + '"]').forEach(function (x) {
      var bad = x.type === 'checkbox' ? !x.checked : !String(x.value || '').trim();
      if (x.classList) x.classList.toggle('err', bad);
    });
    gate(g);
  });


  /* 과제를 내면 그 자리에서 낸 것을 보여 준다.
     ⛔ 2026-08-19 검수: 「제출하기」를 누르면 알림 한 줄 없이 강의 재생 화면으로 튕겨 나왔다.
     냈는지 손님이 알 수 없었다. */
  on('[data-submit-done]', 'click', function (e, t) {
    if (t.classList.contains('is-off')) return;   /* 못 채웠으면 gate 가 막는다 */
    e.preventDefault();
    if (t.dataset.hwDone) return;
    t.dataset.hwDone = '1';
    t.textContent = '제출됨';
    t.classList.add('is-off');
    $$('[data-gate="hw"]').forEach(function (x) { x.readOnly = true; x.disabled = true; });
    var 상태 = $('[data-hw-state]');
    if (상태) { 상태.textContent = '제출'; 상태.className = 'badge b-ok'; }
    toast(t.dataset.submitDone || '냈어요', '', 'ok');
  });

  /* ================= 계산 ================= */
  /* 이 화면 안에서 끝나는 계산은 한 곳에서만 한다 */
  function val(sel, def) { var el = $(sel); if (!el) return def || 0; return parseFloat(String(el.value != null ? el.value : el.textContent).replace(/[^0-9.-]/g, '')) || 0; }

  function recalc() {
    /* 결제 금액 (CO-04) */
    var pay = $('[data-calc-pay]');
    if (pay) {
      var base = Number(pay.dataset.base || 0);
      var cp = $('#coupon-sel');
      var rate = cp ? Number(cp.selectedOptions[0].dataset.rate || 0) : 0;
      var flat = cp ? Number(cp.selectedOptions[0].dataset.flat || 0) : 0;
      var dc = Math.round(base * rate / 100) + flat;
      var fin = Math.max(0, base - dc);
      var o1 = $('[data-out-discount]'); if (o1) o1.textContent = '-' + won(dc);
      $$('[data-out-final]').forEach(function (x) { x.textContent = won(fin); });
      var mon = $('[data-out-month]');
      var inst = $('.chip.on[data-inst]');
      if (mon) {
        var m = inst ? Number(inst.dataset.inst) : 0;
        mon.textContent = m > 1
          ? '매달 ' + won(Math.ceil(fin / m / 10) * 10) + ' × ' + m + '개월'
          : '일시불로 결제됩니다';
      }
    }
    /* 강의 가격 미리보기 (CU-02) */
    var pr = $('[data-calc-price]');
    if (pr) {
      var free = $('#price-free') && $('#price-free').classList.contains('on');
      var list = val('#price-list'), off = val('#price-off');
      var sell = free ? 0 : Math.max(0, Math.round(list * (1 - off / 100) / 100) * 100);
      var o = $('[data-out-sell]');
      if (o) o.innerHTML = free ? '<span class="now" style="color:var(--success)">무료</span>'
        : '<span class="now">' + won(sell) + '</span>' + (off > 0 ? '<span class="was">' + won(list) + '</span><span class="off">' + off + '%</span>' : '');
    }
    /* 수료 기준 (GR-04) — 128명 수강생의 분포를 표로 두고 기준마다 통과 인원을 찾는다 */
    var cr = $('[data-calc-criteria]');
    if (cr) {
      var total = 128;
      /* [기준값, 그 기준을 넘는 인원] — 사이 값은 직선으로 잇는다 */
      var lookup = function (tbl, x) {
        for (var i = 1; i < tbl.length; i++) {
          if (x <= tbl[i][0]) {
            var a0 = tbl[i - 1], b0 = tbl[i];
            var r = (x - a0[0]) / (b0[0] - a0[0]);
            return Math.round(a0[1] + (b0[1] - a0[1]) * r);
          }
        }
        return tbl[tbl.length - 1][1];
      };
      var T_PROGRESS = [[0, 128], [20, 126], [40, 120], [60, 110], [80, 96], [90, 74], [100, 38]];
      var T_ATTEND = [[0, 128], [25, 127], [50, 122], [75, 112], [90, 88], [100, 52]];
      var T_HW = [[0, 128], [1, 126], [2, 120], [3, 112], [4, 94], [5, 68]];
      var T_SCORE = [[0, 128], [40, 122], [60, 104], [80, 76], [100, 31]];
      var pass = total;
      if ($('#use-progress').checked) pass = Math.min(pass, lookup(T_PROGRESS, val('#cr-progress')));
      if ($('#use-attend').checked) pass = Math.min(pass, lookup(T_ATTEND, val('#cr-attend')));
      if ($('#use-hw').checked) pass = Math.min(pass, lookup(T_HW, val('#cr-hw')));
      if ($('#use-score').checked) pass = Math.min(pass, lookup(T_SCORE, val('#cr-score')));
      pass = Math.max(0, Math.min(total, pass));
      $('[data-out-pass]').textContent = nf(pass);
      $('[data-out-fail]').textContent = nf(total - pass);
      var b = $('[data-out-passbar]'); if (b) b.style.width = Math.round(pass / total * 100) + '%';
      $$('[data-out-passpct]').forEach(function (x) { x.textContent = Math.round(pass / total * 100) + '%'; });
    }
    /* 진도 미달 기준 (ST-04) */
    var lg = $('[data-calc-lag]');
    if (lg) {
      var lim = val('#lag-progress'), days = val('#lag-days');
      var rows = $$('tr[data-progress]', $('#lag-rows'));
      var n = 0;
      rows.forEach(function (r) {
        var hit = Number(r.dataset.progress) < lim && Number(r.dataset.days) >= days;
        r.hidden = !hit;
        if (hit) n++;
        var cb = r.querySelector('.selbox'); if (cb && !hit) cb.checked = false;
      });
      $$('[data-out-lag]').forEach(function (x) { x.textContent = nf(n); });
      countSel('lag');
    }
    /* 루브릭 총점 (GR-03) */
    var rb = $('[data-calc-rubric]');
    if (rb) {
      var sum = 0, max = 0;
      $$('[data-rubric]', rb).forEach(function (i) {
        sum += Number(i.value || 0); max += Number(i.max || 0);
        var o = $('[data-rubric-out="' + i.dataset.rubric + '"]'); if (o) o.textContent = i.value;
      });
      $('[data-out-total]').textContent = sum;
      $('[data-out-max]').textContent = max;
      var bd = $('[data-out-pass-badge]');
      if (bd) {
        var ok = sum >= max * 0.6;
        bd.textContent = ok ? '통과' : '미달';
        bd.className = 'badge ' + (ok ? 'b-ok' : 'b-danger');
      }
    }
    /* 커리큘럼 합계 (CU-03) */
    var cu = $('[data-calc-cur]');
    if (cu) {
      var chs = $$('.cur-ch', cu);
      var lessons = $$('[data-min]', cu);
      var mins = lessons.reduce(function (a, b) { return a + Number(b.dataset.min || 0); }, 0);
      var linked = lessons.filter(function (l) { return l.dataset.linked === '1'; }).length;
      $('[data-out-ch]').textContent = chs.length;
      $('[data-out-lesson]').textContent = lessons.length;
      $('[data-out-min]').textContent = Math.floor(mins / 60) + '시간 ' + (mins % 60) + '분';
      var lk = $('[data-out-linked]'); if (lk) lk.textContent = linked + '/' + lessons.length;
    }
    /* 파일 개수·용량 */
    $$('[data-filebox]').forEach(function (box) {
      var rows2 = $$('.file-row', box);
      var mb = rows2.reduce(function (a, r) { return a + Number(r.dataset.mb || 0); }, 0);
      var out = $('[data-fileout="' + box.dataset.filebox + '"]');
      if (out) out.textContent = rows2.length + '/' + (box.dataset.max || 5) + '개 · ' + mb.toFixed(1) + 'MB';
    });
  }
  window.recalc = recalc;
  on('[data-recalc]', 'click', function () { setTimeout(recalc, 0); });

  /* 할부 개월 칩 */
  on('.chip[data-inst]', 'click', function (e, t) {
    $$('.chip[data-inst]').forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
    recalc();
  });

  /* 슬라이더 값 표시 */
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.out) {
      var o = $(t.dataset.out);
      if (o) o.textContent = t.value + (t.dataset.unit || '');
    }
    if (t.dataset && (t.dataset.calc !== undefined || t.dataset.rubric !== undefined)) recalc();
    if (t.dataset && t.dataset.gate) { t.classList.remove('err'); gate(t.dataset.gate); }
    if (t.dataset && t.dataset.charcount) {
      var c = $('[data-charout="' + t.dataset.charcount + '"]');
      if (c) c.textContent = t.value.length;
      var pv = $('[data-preview="' + t.dataset.charcount + '"]');
      if (pv) pv.textContent = t.value || pv.dataset.empty || '';
    }
    if (t.dataset && t.dataset.pw !== undefined) pwCheck(t);
    if (t.dataset && t.dataset.pw2 !== undefined) pw2Check(t);
  });

  /* 비밀번호 세기 */
  function pwCheck(inp) {
    var v = inp.value;
    var lenOk = v.length >= 8, mixOk = /[A-Za-z]/.test(v) && /[0-9]/.test(v), symOk = /[^A-Za-z0-9]/.test(v);
    var score = (lenOk ? 1 : 0) + (mixOk ? 1 : 0) + (symOk ? 1 : 0);
    var b = $('[data-pw-bar]');
    if (b) {
      b.style.width = (score / 3 * 100) + '%';
      b.style.background = score <= 1 ? 'var(--danger)' : score === 2 ? 'var(--accent)' : 'var(--success)';
    }
    var lb = $('[data-pw-label]');
    if (lb) { lb.textContent = v ? ['약함', '약함', '보통', '강함'][score] : '—'; }
    var c1 = $('[data-pw-len]'), c2 = $('[data-pw-mix]');
    if (c1) { c1.textContent = (lenOk ? '✓' : '○') + ' 8자 이상'; c1.style.color = lenOk ? 'var(--success)' : 'var(--muted)'; }
    if (c2) { c2.textContent = (mixOk ? '✓' : '○') + ' 영문+숫자'; c2.style.color = mixOk ? 'var(--success)' : 'var(--muted)'; }
    var p2 = $('[data-pw2]'); if (p2) pw2Check(p2);
  }
  function pw2Check(inp) {
    var p1 = $('[data-pw]');
    var msg = $('[data-pw2-msg]');
    if (!msg || !p1) return;
    if (!inp.value) { msg.hidden = true; return; }
    var same = inp.value === p1.value;
    msg.hidden = false;
    msg.textContent = same ? '✓ 비밀번호가 같아요' : '⚠ 위에 쓴 비밀번호와 달라요';
    msg.className = same ? 'hint-ok' : 'err-msg';
    inp.classList.toggle('err', !same);
  }

  /* 비밀번호 보기 */
  on('[data-eye]', 'click', function (e, t) {
    var inp = $(t.dataset.eye);
    if (!inp) return;
    var show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    t.textContent = show ? '🙈' : '👁';
    t.setAttribute('aria-label', show ? '비밀번호 가리기' : '비밀번호 보기');
  });

  /* ================= 줄 늘리기 · 줄이기 · 순서 ================= */
  on('[data-addrow]', 'click', function (e, t) {
    var box = $('[data-rowlist="' + t.dataset.addrow + '"]');
    var tpl = $('#tpl-' + t.dataset.addrow);
    if (!box || !tpl) return;
    var d = document.createElement('div');
    d.innerHTML = tpl.innerHTML.trim();
    box.appendChild(d.firstChild);
    recalc();
  });
  on('[data-delrow]', 'click', function (e, t) {
    var row = t.closest('[data-row]');
    if (!row) return;
    var box = row.parentElement;
    if (box.children.length <= Number(box.dataset.minrows || 1)) { toast('하나는 남겨 두어야 해요'); return; }
    row.remove();
    recalc();
  });
  on('[data-move]', 'click', function (e, t) {
    var row = t.closest('[data-row]');
    if (!row) return;
    var sib = t.dataset.move === 'up' ? row.previousElementSibling : row.nextElementSibling;
    if (!sib) { toast(t.dataset.move === 'up' ? '맨 위예요' : '맨 아래예요'); return; }
    if (t.dataset.move === 'up') row.parentElement.insertBefore(row, sib);
    else row.parentElement.insertBefore(sib, row);
    row.animate([{ background: 'var(--pri-10)' }, { background: 'transparent' }], { duration: 400 });
  });

  /* 파일 올리기 흉내 */
  var fileSeq = 0;
  on('[data-drop]', 'click', function (e, t) {
    var key = t.dataset.drop;
    var box = $('[data-filebox="' + key + '"]');
    if (!box) return;
    var max = Number(box.dataset.max || 5);
    if ($$('.file-row', box).length >= max) { toast('최대 ' + max + '개까지 올릴 수 있어요'); return; }
    fileSeq++;
    var names = (box.dataset.names || '자료.pdf,과제답안.docx,참고자료.zip,캡처.png,정리노트.hwp').split(',');
    var nm = names[(fileSeq - 1) % names.length];
    var mb = (1.2 + (fileSeq % 5) * 1.7).toFixed(1);
    var row = document.createElement('div');
    row.className = 'file-row';
    row.dataset.mb = mb;
    row.innerHTML = '<span>📄</span><span class="grow">' + nm + '</span><span class="t-sub">' + mb + 'MB</span>'
      + '<button class="x" type="button" data-delfile aria-label="파일 빼기">✕</button>';
    box.appendChild(row);
    recalc();
  });
  on('[data-delfile]', 'click', function (e, t) {
    t.closest('.file-row').remove();
    recalc();
  });

  /* 차시에 영상 연결 */
  on('[data-linkme]', 'click', function (e, t) {
    var row = t.closest('[data-tags]');
    row.dataset.tags = 'lk:yes';
    var st = row.querySelector('.st');
    if (st) { st.classList.add('done'); st.textContent = '✓'; }
    t.outerHTML = '<span class="badge b-ok">연결됨</span>';
    var out = $('[data-linked-count]');
    if (out) out.textContent = Number(out.textContent) + 1;
    applyFilter('link');
    toast('영상을 연결했어요', '', 'ok');
  });

  /* 실패한 파일만 다시 올리기 */
  on('[data-retry]', 'click', function (e, t) {
    var box = t.closest('[data-tags]');
    box.dataset.tags = 'ok:yes';
    var row = t.closest('.file-row');
    var msg = row.querySelector('.danger');
    if (msg) { msg.textContent = '다시 올렸어요'; msg.className = 'success mt2'; msg.style.fontWeight = '700'; }
    row.firstElementChild.textContent = '✅';
    t.outerHTML = '<span class="badge b-ok">올림 완료</span>';
    applyFilter('up');
    toast('그 파일만 다시 올렸어요', '', 'ok');
  });

  /* ================= 강의 재생 ================= */
  on('[data-lesson]', 'click', function (e, t) {
    $$('[data-lesson]').forEach(function (x) {
      x.classList.remove('on');
      var st = x.querySelector('.st');
      if (st && st.classList.contains('now')) { st.classList.remove('now'); st.classList.add('done'); st.textContent = '✓'; }
    });
    t.classList.add('on');
    var st2 = t.querySelector('.st');
    if (st2) { st2.classList.remove('done'); st2.classList.add('now'); st2.textContent = '▶'; }
    $$('[data-lesson-title]').forEach(function (x) { x.textContent = t.dataset.lesson; });
    $$('[data-lesson-no]').forEach(function (x) { x.textContent = t.dataset.no; });
    var s = $('[data-seek]');
    if (s) { s.querySelector('i').style.width = '0%'; s.querySelector('b').style.left = '0%'; }
    var cur = $('[data-time-cur]'); if (cur) cur.textContent = '0:00';
    var dur = $('[data-time-dur]'); if (dur) dur.textContent = t.dataset.tm || '12:40';
  });
  on('[data-lesson-step]', 'click', function (e, t) {
    var list = $$('[data-lesson]');
    var i = list.findIndex(function (x) { return x.classList.contains('on'); });
    var j = i + (t.dataset.lessonStep === 'next' ? 1 : -1);
    if (j < 0 || j >= list.length) { toast(j < 0 ? '첫 차시예요' : '마지막 차시예요'); return; }
    list[j].click();
  });
  on('[data-speed]', 'click', function (e, t) {
    $$('[data-speed]').forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
    var left = $('[data-time-left]');
    if (left) {
      var base = Number(left.dataset.base || 760);
      var s = Math.round(base / Number(t.dataset.speed));
      left.textContent = Math.floor(s / 60) + '분 ' + (s % 60) + '초 남음';
    }
  });
  on('[data-cc]', 'click', function (e, t) {
    var isOn = t.classList.toggle('on');
    var cc = $('[data-cc-box]');
    if (cc) cc.hidden = !isOn;
    t.textContent = isOn ? '자막 켜짐' : '자막 꺼짐';
  });
  on('[data-seek]', 'click', function (e, t) {
    var r = t.getBoundingClientRect();
    var pct = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100));
    t.querySelector('i').style.width = pct + '%';
    t.querySelector('b').style.left = pct + '%';
    var dur = Number(t.dataset.seek || 760);
    var s = Math.round(dur * pct / 100);
    var cur = $('[data-time-cur]');
    if (cur) cur.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  });
  on('[data-jump]', 'click', function (e, t) {
    var dur = 760, s = Number(t.dataset.jump);
    var sk = $('[data-seek]');
    if (sk) { sk.querySelector('i').style.width = (s / dur * 100) + '%'; sk.querySelector('b').style.left = (s / dur * 100) + '%'; }
    var cur = $('[data-time-cur]');
    if (cur) cur.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    $$('[data-jump]').forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
  });
  on('[data-play]', 'click', function (e, t) {
    var isOn = t.classList.toggle('on');
    t.textContent = isOn ? '❚❚ 일시정지' : '▶ 재생';
  });
  on('[data-quality]', 'click', function (e, t) {
    $$('[data-quality]').forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
    var o = $('[data-quality-out]');
    if (o) o.textContent = t.dataset.quality + '으로 다시 시도합니다';
  });

  /* ================= 학습 잔디 · 출석 표 ================= */
  on('.grass i', 'click', function (e, t) {
    var o = $('[data-grass-out]');
    if (!o) return;
    o.innerHTML = '<b>' + t.dataset.d + '</b> · ' + (t.dataset.min === '0' ? '학습 기록이 없어요' : t.dataset.min + '분 학습 · ' + t.dataset.t);
  });
  var MX = [['c-ok', '출'], ['c-late', '지'], ['c-no', '결'], ['c-na', '-']];
  on('.mx .cell', 'click', function (e, t) {
    var i = MX.findIndex(function (m) { return t.classList.contains(m[0]); });
    var n = MX[(i + 1) % MX.length];
    MX.forEach(function (m) { t.classList.remove(m[0]); });
    t.classList.add(n[0]); t.textContent = n[1];
    var tr = t.closest('tr');
    var cells = $$('.cell', tr);
    var ok = cells.filter(function (c) { return c.classList.contains('c-ok'); }).length;
    var use = cells.filter(function (c) { return !c.classList.contains('c-na'); }).length;
    var out = tr.querySelector('[data-rate]');
    if (out) out.textContent = use ? Math.round(ok / use * 100) + '%' : '—';
  });

  /* ================= 복사 · 모달 ================= */
  on('[data-copy]', 'click', function (e, t) {
    var text = t.dataset.copy;
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () { });
    toast('복사했어요 — ' + text, '', 'ok');
  });
  on('[data-modal]', 'click', function (e, t) {
    if (t.disabled) return;
    var tpl = document.getElementById(t.dataset.modal);
    if (!tpl) return;
    var d = document.createElement('div');
    d.className = 'dim';
    d.innerHTML = tpl.innerHTML;
    d.addEventListener('click', function (ev) {
      if (ev.target === d || ev.target.closest('[data-dismiss]')) d.remove();
    });
    document.body.appendChild(d);
    gateAll(d);
  });
  on('[data-close]', 'click', function (e, t) {
    var box = t.closest(t.dataset.close || '*');
    if (box) box.remove();
  });

  /* ================= 남은 시간 ================= */
  function startTimer(el) {
    var left = Number(el.dataset.countdown);
    var btn = $('[data-resend]');
    var tick = function () {
      var m = Math.floor(left / 60), s = left % 60;
      el.textContent = m + ':' + String(s).padStart(2, '0');
      if (left <= 0) {
        el.textContent = '0:00';
        el.style.color = 'var(--danger)';
        $$('[data-timeout-lock]').forEach(function (x) { x.disabled = true; x.classList.add('is-off'); });
        if (btn) { btn.disabled = false; btn.classList.remove('is-off'); btn.textContent = '인증번호 다시 받기'; }
        var msg = $('[data-timeout-msg]'); if (msg) msg.hidden = false;
        return;
      }
      left--;
      setTimeout(tick, 1000);
    };
    tick();
  }
  on('[data-resend]', 'click', function (e, t) {
    if (t.disabled) return;
    var el = $('[data-countdown]');
    if (el) { el.style.color = ''; el.dataset.countdown = 180; startTimer(el); }
    $$('[data-timeout-lock]').forEach(function (x) { x.disabled = false; x.classList.remove('is-off'); });
    var msg = $('[data-timeout-msg]'); if (msg) msg.hidden = true;
    t.disabled = true; t.classList.add('is-off');
    var n = 30;
    var tick = function () {
      t.textContent = '다시 받기 (' + n + '초)';
      if (n <= 0) { t.disabled = false; t.classList.remove('is-off'); t.textContent = '인증번호 다시 받기'; return; }
      n--; setTimeout(tick, 1000);
    };
    tick();
    toast('인증번호를 다시 보냈어요', '', 'ok');
  });

  /* 인증번호 6칸 */
  on('[data-otp] input', 'input', function (e, t) {
    t.value = t.value.replace(/\D/g, '').slice(0, 1);
    if (t.value && t.nextElementSibling) t.nextElementSibling.focus();
    var box = t.closest('[data-otp]');
    var vals = $$('input', box).map(function (x) { return x.value; }).join('');
    var btn = $('[data-otp-btn]');
    if (btn) { btn.disabled = vals.length < 6; btn.classList.toggle('is-off', vals.length < 6); }
    $$('input', box).forEach(function (x) { x.classList.remove('err'); });
    var msg = $('[data-otp-msg]'); if (msg) msg.hidden = true;
  });

  /* ================= 읽기 ↔ 고치기 ================= */
  on('[data-edit]', 'click', function (e, t) {
    var row = $('[data-editrow="' + t.dataset.edit + '"]');
    if (!row) return;
    var editing = row.classList.toggle('editing');
    $$('[data-view]', row).forEach(function (x) { x.hidden = editing; });
    $$('[data-form]', row).forEach(function (x) { x.hidden = !editing; });
    t.textContent = editing ? '취소' : '수정';
  });
  on('[data-save]', 'click', function (e, t) {
    var row = $('[data-editrow="' + t.dataset.save + '"]');
    if (!row) return;
    var inp = row.querySelector('input, select, textarea');
    var view = row.querySelector('[data-view] b');
    if (inp && view && inp.value.trim()) view.textContent = inp.value.trim();
    row.classList.remove('editing');
    $$('[data-view]', row).forEach(function (x) { x.hidden = false; });
    $$('[data-form]', row).forEach(function (x) { x.hidden = true; });
    var eb = $('[data-edit="' + t.dataset.save + '"]'); if (eb) eb.textContent = '수정';
    toast('바꾼 내용을 반영했어요', '', 'ok');
  });

  /* 미리보기에 이름 반영 (수료증) */
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.mirror) {
      $$('[data-mirror-out="' + t.dataset.mirror + '"]').forEach(function (x) { x.textContent = t.value || x.dataset.empty || ''; });
    }
  });

  /* 관심 분야 칩 → 추천 바뀜 */
  on('[data-pickchip]', 'click', function (e, t) {
    t.classList.toggle('on');
    var g = t.dataset.pickchip;
    var picked = $$('[data-pickchip="' + g + '"].on').map(function (x) { return x.dataset.v; });
    if (t.dataset.max && picked.length > Number(t.dataset.max)) {
      t.classList.remove('on');
      picked = $$('[data-pickchip="' + g + '"].on').map(function (x) { return x.dataset.v; });
      toast('최대 ' + t.dataset.max + '개까지 고를 수 있어요');
    }
    $$('[data-pickout="' + g + '"]').forEach(function (x) {
      x.textContent = picked.length ? picked.join(' · ') : '아직 고르지 않았어요';
    });
    if ($('[data-list="' + g + '"]')) { ensure(g).cat = picked; applyFilter(g); }
  });

  /* 자주 쓰는 문구를 입력칸에 붙인다 */
  on('[data-insert]', 'click', function (e, t) {
    var el = $(t.dataset.insert);
    if (!el) return;
    el.value = (el.value ? el.value.replace(/\s+$/, '') + ' ' : '') + t.dataset.text;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.focus();
  });

  /* 제외 사유를 고르면 대상에서 빠진다 */
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t.dataset || t.dataset.exclude === undefined) return;
    var row = t.closest('.row-c');
    var cb = row && row.querySelector('.selbox');
    if (!cb) return;
    cb.checked = !t.value;
    row.style.opacity = t.value ? '.5' : '';
    countSel(cb.dataset.selgroup);
  });

  /* 문구 틀을 고르면 제목·본문·미리보기가 그 틀로 바뀐다 */
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t.dataset || t.dataset.tplsel === undefined) return;
    var op = t.selectedOptions[0];
    var ti = $('#msg-t'), bo = $('#msg-b');
    if (ti) { ti.value = op.dataset.t; ti.dispatchEvent(new Event('input', { bubbles: true })); }
    if (bo) { bo.value = op.dataset.b; bo.dispatchEvent(new Event('input', { bubbles: true })); }
    toast('「' + op.textContent + '」 틀로 바꿨어요');
  });

  /* 인기 검색어 → 검색창에 채우고 목록을 거른다 */
  on('[data-fillsearch]', 'click', function (e, t) {
    var list = t.dataset.fillsearch, v = t.dataset.v;
    $$('[data-search="' + list + '"]').forEach(function (i) { i.value = v; });
    ensure(list).__q = v;
    applyFilter(list);
    $$('[data-fillsearch="' + list + '"]').forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
  });

  /* 고른 강의를 위 큰 카드로 올린다 */
  on('[data-pick-course]', 'click', function (e, t) {
    $$('[data-hero-nm]').forEach(function (x) { x.textContent = t.dataset.nm; });
    $$('[data-hero-ep]').forEach(function (x) { x.textContent = t.dataset.ep; });
    $$('[data-hero-done]').forEach(function (x) { x.textContent = t.dataset.done; });
    $$('[data-hero-total]').forEach(function (x) { x.textContent = t.dataset.total; });
    var b = $('.bar-row .bar i'); if (b) b.style.width = t.dataset.pct + '%';
    var p = $('.bar-row .pct'); if (p) p.textContent = t.dataset.pct + '%';
    $$('[data-pick-course]').forEach(function (x) { x.classList.remove('btn-primary'); x.classList.add('btn-soft'); });
    toast('「' + t.dataset.nm + '」를 위로 올렸어요');
  });

  /* 처리가 필요한 일 — 처리하면 줄이 빠지고 건수가 준다 */
  on('[data-resolve]', 'click', function (e, t) {
    var key = t.dataset.resolve;
    var row = t.closest('[data-row]');
    var box = row.parentElement;
    var out = $('[data-resolve-count="' + key + '"]');
    if (out) out.textContent = nf(Math.max(0, (parseInt(out.textContent.replace(/,/g, ''), 10) || 0) - Number(t.dataset.n || 1)));
    /* 위 지표 카드도 같이 줄인다 —
       ⛔ 2026-08-19 검수: 아래에서 「채점 대기 과제 24건」을 처리해 「남은 일 0건」이 됐는데
       위 카드는 그대로 「채점 대기 24건」이었다. */
    var 지표키 = t.dataset.metricKey;
    if (지표키) {
      var 지표 = $('[data-metric="' + 지표키 + '"]');
      if (지표) {
        var 작 = 지표.querySelector('small');
        var 남 = Math.max(0, (parseInt((지표.textContent || '').replace(/[^0-9]/g, ''), 10) || 0) - Number(t.dataset.n || 1));
        지표.textContent = nf(남);
        if (작) 지표.appendChild(작);
      }
    }
    row.remove();
    if (!box.children.length) {
      var em = $('[data-resolve-empty="' + key + '"]'); if (em) em.hidden = false;
    }
    toast('처리했어요. 남은 일이 줄었습니다', '', 'ok');
  });

  /* 지표 카드 → 아래 표를 그 기준으로 다시 정렬 */
  on('[data-sort-table]', 'click', function (e, t) {
    var box = $(t.dataset.sortTable);
    if (!box) return;
    var table = box.tagName === 'TABLE' ? box : box.querySelector('table');
    if (!table || !table.tHead) return;
    $$('.stat[data-sort-table]').forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
    var th = table.tHead.rows[0].cells[Number(t.dataset.sortCol || 0)];
    if (!th) return;
    th.classList.remove('on'); th.dataset.dir = 'asc';
    if (!th.dataset.sort) th.dataset.sort = 'num';
    th.click();
    table.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /* ================= 화면 정보 패널 ================= */
  on('.dev-btn', 'click', function (e, t) {
    var box = t.closest('.dev');
    box.classList.toggle('on');
    try { localStorage.setItem('lms.spec', box.classList.contains('on') ? '1' : '0'); } catch (_) { }
  });

  /* 폼은 프로토타입이라 실제로 전송되지 않는다 */
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    toast('화면 견본이라 실제로 전송되지 않아요');
  });

  /* ================= 첫 실행 ================= */
  function gateAll(scope) {
    var gs = {};
    $$('[data-gate]', scope || document).forEach(function (x) { gs[x.dataset.gate] = 1; });
    Object.keys(gs).forEach(gate);
  }
  document.addEventListener('DOMContentLoaded', function () {
    /* 화면 정보 패널은 «언제나 닫힌 채로» 시작한다 — 2026-08-09.
       전에는 마지막으로 열어 둔 상태를 기억했다. 그 바람에 한 번 열어 본 사람은
       그 뒤 모든 화면에서 개발용 패널이 펼쳐진 채로 열렸다. 손님이 받는 견본에서
       가장 먼저 보이면 안 되는 것이다. 누를 때만 열린다. */
    $$('[data-list]').forEach(function (b) {
      if (b.dataset.finit) {
        try {
          var init = JSON.parse(b.dataset.finit);
          fstate[b.dataset.list] = init;
          Object.keys(init).forEach(function (k) {
            if (k.indexOf('__') === 0) return;
            (init[k] || []).forEach(function (v) {
              var ctl = $('[data-fgroup="' + b.dataset.list + '"][data-f="' + k + '"][data-v="' + v + '"]');
              if (ctl) ctl.classList.add('on');
            });
          });
        } catch (_) { }
      }
      applyFilter(b.dataset.list);
    });
    $$('.selbox').forEach(function (b) { countSel(b.dataset.selgroup); });
    gateAll();
    recalc();
    var cd = $('[data-countdown]'); if (cd) startTimer(cd);
    var pw = $('[data-pw]'); if (pw && pw.value) pwCheck(pw);
    /* 가로로 넘기는 줄 — 화살표 */
    $$('[data-rail]').forEach(function (nav) {
      var rail = $('[data-railbox="' + nav.dataset.rail + '"]');
      if (!rail) return;
      var upd = function () {
        var prev = $('[data-raildir="prev"]', nav), next = $('[data-raildir="next"]', nav);
        if (prev) prev.disabled = rail.scrollLeft < 8;
        if (next) next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8;
      };
      $$('button', nav).forEach(function (b) {
        b.addEventListener('click', function () {
          var step = rail.clientWidth / 2;
          rail.scrollBy({ left: b.dataset.raildir === 'next' ? step : -step, behavior: 'smooth' });
          setTimeout(upd, 380);
        });
      });
      rail.addEventListener('scroll', upd);
      upd();
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
     지난 마감·지난 주문일만 보게 된다.
     ⛔ 2026-08-19 검수: 「D-3 · 마감 8월 10일」인데 그날은 8월 19일이었다.
        마감이 9일 전에 지났는데 「3일 남음」이라고 했다.
     기준일과 오늘의 차이만큼 화면의 날짜를 통째로 민다. 날짜 사이 간격은 그대로라
     「D-3」이나 「수강 기간 6개월」 같은 계산값은 손대지 않아도 맞는다. */
  var 견본기준일 = '2026-08-07';   /* 이 견본을 만든 날 */

  function 날짜를오늘로() {
    var ㄱ = 견본기준일.split('-');
    var 기준 = new Date(Number(ㄱ[0]), Number(ㄱ[1]) - 1, Number(ㄱ[2]));
    var 오늘 = new Date(); 오늘.setHours(0, 0, 0, 0);
    var 민날 = Math.round((오늘 - 기준) / 86400000);
    if (!민날) return;

    function 밀기(y, m, d) {
      var t = new Date(y, m - 1, d);
      t.setDate(t.getDate() + 민날);
      return t;
    }
    var 두자리 = function (n) { return (n < 10 ? '0' : '') + n; };

    var 훑개 = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var 마디, 바꿀것 = [];
    while ((마디 = 훑개.nextNode())) {
      var 부모 = 마디.parentNode;
      if (!부모) continue;
      var 태그 = 부모.nodeName;
      if (태그 === 'SCRIPT' || 태그 === 'STYLE') continue;
      바꿀것.push(마디);
    }

    바꿀것.forEach(function (마디) {
      var 글 = 마디.nodeValue;
      if (!글 || 글.indexOf('20') < 0 && 글.indexOf('/') < 0) return;
      var 새글 = 글;

      /* 2026-08-07 */
      새글 = 새글.replace(/(20\d\d)-(\d\d)-(\d\d)/g, function (_, y, m, d) {
        var t = 밀기(Number(y), Number(m), Number(d));
        return t.getFullYear() + '-' + 두자리(t.getMonth() + 1) + '-' + 두자리(t.getDate());
      });

      /* 2026년 8월 10일 */
      새글 = 새글.replace(/(20\d\d)년\s*(\d{1,2})월\s*(\d{1,2})일/g, function (_, y, m, d) {
        var t = 밀기(Number(y), Number(m), Number(d));
        return t.getFullYear() + '년 ' + (t.getMonth() + 1) + '월 ' + t.getDate() + '일';
      });

      /* ORD-20260807-004182 */
      새글 = 새글.replace(/(20\d\d)(\d\d)(\d\d)(?=-\d)/g, function (전, y, m, d) {
        var t = 밀기(Number(y), Number(m), Number(d));
        return '' + t.getFullYear() + 두자리(t.getMonth() + 1) + 두자리(t.getDate());
      });

      /* 차트 축의 8/7 — svg 안에서만 바꾼다. 「12/18차시」 같은 것을 건드리면 안 된다 */
      if (마디.parentNode.closest && 마디.parentNode.closest('svg')) {
        새글 = 새글.replace(/^(\d{1,2})\/(\d{1,2})$/, function (_, m, d) {
          var t = 밀기(기준.getFullYear(), Number(m), Number(d));
          return (t.getMonth() + 1) + '/' + t.getDate();
        });
      }

      if (새글 !== 글) 마디.nodeValue = 새글;
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', 날짜를오늘로);
  else 날짜를오늘로();
})();

(function () {

  /* ── 히어로 검색칸 자동완성 ────────────────────────────────────────────
     ⛔ 2026-08-19 검수: 화면 목록에 「검색어 자동완성」 화면이 따로 있는데
     정작 홈 검색칸에 글자를 넣어도 아무것도 안 떴다.
     아래 목록에 실린 강의 이름·강사 이름에서 골라 보여 준다. */
  function 자동완성달기() {
    var 칸 = document.querySelector('input[data-search="pop"]');
    if (!칸) return;
    var 줄기 = 칸.closest('.input-row') || 칸.parentNode;
    if (!줄기 || 줄기.querySelector('[data-ac]')) return;
    if (getComputedStyle(줄기).position === 'static') 줄기.style.position = 'relative';

    var 상자 = document.createElement('div');
    상자.setAttribute('data-ac', '');
    상자.hidden = true;
    상자.style.cssText = 'position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:20;'
      + 'background:var(--surface,#fff);border:1px solid var(--border,#ddd);border-radius:12px;'
      + 'box-shadow:0 8px 24px rgba(0,0,0,.10);overflow:hidden';
    줄기.appendChild(상자);

    /* 후보 — 아래 목록에 실린 강의에서 이름과 강사를 모은다 */
    function 후보모으기() {
      var 것 = [];
      var 목록 = document.querySelector('[data-list="pop"]');
      if (!목록) return 것;
      Array.prototype.forEach.call(목록.querySelectorAll('[data-tags]'), function (카드) {
        var 이름 = 카드.querySelector('.nm');
        var 강사 = 카드.querySelector('.by');
        if (이름) 것.push({ 말: (이름.textContent || '').trim(), 갈래: '강의' });
        if (강사) {
          var g = (강사.textContent || '').trim();
          if (g && 것.every(function (x) { return x.말 !== g; })) 것.push({ 말: g, 갈래: '강사' });
        }
      });
      return 것;
    }

    function 그리기() {
      var q = (칸.value || '').trim();
      if (!q) { 상자.hidden = true; 상자.innerHTML = ''; return; }
      var 맞는것 = 후보모으기().filter(function (x) { return x.말.indexOf(q) >= 0; }).slice(0, 6);
      if (!맞는것.length) {
        상자.innerHTML = '<div class="t-sub" style="padding:12px 14px">'
          + q + '(으)로 찾을 수 있는 강의가 없어요</div>';
        상자.hidden = false;
        return;
      }
      상자.innerHTML = 맞는것.map(function (x) {
        var 표시 = x.말.split(q).join('<span class="mark">' + q + '</span>');
        return '<button type="button" data-ac-pick="' + x.말.replace(/"/g, '&quot;') + '"'
          + ' style="display:flex;gap:8px;align-items:center;width:100%;padding:10px 14px;border:0;'
          + 'background:none;cursor:pointer;text-align:left">'
          + '<span class="badge b-pri">' + x.갈래 + '</span><span class="grow">' + 표시 + '</span></button>';
      }).join('');
      상자.hidden = false;
    }

    칸.addEventListener('input', 그리기);
    칸.addEventListener('focus', 그리기);
    document.addEventListener('click', function (e) {
      if (!줄기.contains(e.target)) { 상자.hidden = true; }
    });
    상자.addEventListener('click', function (e) {
      var 고른것 = e.target.closest && e.target.closest('[data-ac-pick]');
      if (!고른것) return;
      칸.value = 고른것.dataset.acPick;
      상자.hidden = true;
      if (typeof window.applyFilter === 'function') {
        칸.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', 자동완성달기);
  else 자동완성달기();
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
