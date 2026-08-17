/* 온라인 강의 플랫폼(LMS) — 공통 동작
   화면 안에서 끝나는 조작은 진짜로 값이 바뀐다.
   서버가 있어야 하는 것(저장·발송·결제)만 안내 문구로 대신한다. */
(function () {
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

  /* ================= 탭 ================= */
  on('.tab', 'click', function (e, t) {
    if (t.dataset.go) return;
    var box = t.closest('.tabs, .tabs-pill');
    if (!box) return;
    $$('.tab', box).forEach(function (x) { x.classList.remove('on'); });
    t.classList.add('on');
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
    /* 같은 묶음 안 표시 갱신 */
    if (group) {
      $$('[data-f="' + k + '"]', group).forEach(function (x) {
        var xv = x.dataset.v;
        var act = xv === '*' ? !(st[k] && st[k].length) : (st[k] || []).indexOf(xv) >= 0;
        x.classList.toggle('on', act);
      });
    }
    applyFilter(list);
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
    $$('[data-gatemsg="' + g + '"]').forEach(function (m) {
      m.hidden = !tried[g] || need.length === 0;
      if (need.length) m.textContent = '⚠ ' + need.map(function (x) { return x.dataset.label || '필수 항목'; }).join(' · ') + ' 을(를) 아직 채우지 않았어요';
    });
  }
  window.gate = gate;
  on('[data-gated]', 'click', function (e, t) {
    if (!t.disabled && !t.classList.contains('is-off')) return;
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
