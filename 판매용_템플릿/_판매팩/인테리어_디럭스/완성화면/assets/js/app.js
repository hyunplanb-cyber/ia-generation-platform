/* 인테리어 시공 견적·시공관리 — 공통 인터랙션
   프로토타입용 최소 동작: 탭 / 아코디언 / 칩 / 토스트 / 모달 / 단계 진행 /
   비포·애프터 손잡이 / 공정표 막대 펼침 / 사진 일지 접기 / 잠금 해제 / 서명 */
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

  /* 탭 — 같은 묶음 안에서만 활성 전환. data-go 가 있으면 해당 화면으로 이동.
     ⚠ 탭과 몸통은 «같은 상자» 안에 있어야 한다 — box.parentElement 안에서만 찾는다. */
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

  /* 잠기는 버튼은 <a> 로 못 만든다 — <button data-go="…"> 로 만들고 여기서 옮긴다. */
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
    toast(isOn ? '찜한 사례에 담았어요' : '찜을 해제했어요');
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

  /* 별점 입력 */
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

  /* 동의 체크박스로 버튼 잠금 해제 — data-unlock="버튼id" */
  document.addEventListener('change', function (e) {
    var t = e.target.closest('[data-unlock]');
    if (!t) return;
    var b = document.getElementById(t.dataset.unlock);
    if (!b) return;
    b.disabled = !t.checked;
    b.classList.toggle('is-off', !t.checked);
  });

  /* 여러 체크가 «모두» 체크돼야 여는 버튼 — data-unlock-all="버튼id", 같은 [data-agree-scope] 안 [data-agree] 전부 */
  function syncUnlockAll(scope) {
    scope.querySelectorAll('[data-unlock-all]').forEach(function (any) {
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
    var scope = t.closest('[data-agree-scope]') || document;
    syncUnlockAll(scope);
  });
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-agree-scope]').forEach(syncUnlockAll);
  });

  /* 전체 동의 — 아래 항목을 모두 따라가게 */
  document.addEventListener('change', function (e) {
    var t = e.target.closest('[data-agree-all]');
    if (!t) return;
    var scope = t.closest('[data-agree-scope]') || document;
    scope.querySelectorAll('[data-agree]').forEach(function (x) { x.checked = t.checked; });
    syncUnlockAll(scope);
  });

  /* 닫기 */
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
    initCompare(d);
  });

  /* ---------- ★ 비포·애프터 손잡이 ----------
     input[type=range] 를 겹쳐 두고, 값에 맞춰 --cp(after 이미지가 드러나는 지점)를 옮긴다. */
  function initCompare(scope) {
    (scope || document).querySelectorAll('.compare').forEach(function (box) {
      if (box.dataset.bound) return;
      box.dataset.bound = '1';
      var range = box.querySelector('.cp-range');
      if (!range) return;
      var set = function (v) {
        box.style.setProperty('--cp', v + '%');
      };
      range.addEventListener('input', function () { set(range.value); });
    });
  }
  document.addEventListener('DOMContentLoaded', function () { initCompare(document); });

  /* ---------- ★ 공정표(간트) 막대 — 누르면 상세가 펼쳐진다 ---------- */
  on('.gantt-bar', 'click', function (e, t) {
    var key = t.dataset.detail;
    if (!key) return;
    document.querySelectorAll('.gantt-detail').forEach(function (d) {
      d.hidden = d.dataset.detail !== key || !d.hidden;
    });
  });

  /* ---------- ★ 현장 사진 일지 — 날짜 묶음 접기·펴기 ---------- */
  on('.plog-hd', 'click', function (e, t) {
    var day = t.closest('.plog-day');
    if (day) day.classList.toggle('closed');
  });

  /* ---------- ★ OW-07 직원 권한 — 바꾸면 «무엇이 달라지는지»를 바로 알려 준다.
     권한만 슬쩍 바뀌고 아무 말이 없으면, 내보내면 안 될 화면을 열어 준 줄도 모른다. ---------- */
  var 권한설명 = {
    대표: '대표는 모든 화면을 봅니다 — 청구·수금과 마진까지.',
    소장: '소장으로 바꾸면 청구·수금이 안 보입니다. 현장·공정·자재는 그대로 봅니다.',
    경리: '경리로 바꾸면 청구·수금과 자재 원가만 보이고 현장 사진·공정은 안 보입니다.',
  };
  document.addEventListener('change', function (e) {
    var sel = e.target.closest('[data-staff-role]');
    if (!sel) return;
    var 줄 = sel.closest('tr');
    var 이름 = 줄 ? (줄.children[0].textContent || '').trim() : '';
    var 말 = document.querySelector('[data-role-note]');
    if (말) 말.textContent = 이름 + ' — ' + (권한설명[sel.value] || '');
    toast(이름 + ' 님을 ' + 조사붙이기(sel.value, '으로', '로') + ' 바꿨어요');
  });

  /* ---------- ★ OW-02 견적 요청함 — 줄을 펼치면 손님이 넣은 조건이 다 나온다.
     스펙팩 약속(「줄을 펼치면 나오는 손님이 넣은 조건 전부」)인데 펼칠 것이 없었다. ---------- */
  on('[data-lead-open]', 'click', function (e, t) {
    var 몸 = document.querySelector('[data-lead-body="' + t.dataset.leadOpen + '"]');
    if (!몸) return;
    var 펼침 = 몸.hidden;
    /* 한 번에 하나만 펼친다 — 표가 길어지면 어디를 보고 있는지 잃는다 */
    document.querySelectorAll('[data-lead-body]').forEach(function (x) { x.hidden = true; });
    document.querySelectorAll('[data-lead-open]').forEach(function (b) { b.textContent = '조건 보기 ▾'; });
    if (펼침) { 몸.hidden = false; t.textContent = '접기 ▴'; }
  });

  /* ---------- ★ AS-01 하자 부위 고르기 — 고르면 아래 「증상 고르기」가 그 부위 것으로 바뀐다 ---------- */
  on('[data-part-pick] button', 'click', function (e, t) {
    t.closest('[data-part-pick]').querySelectorAll('button').forEach(function (b) { b.classList.remove('on', 'pri'); });
    t.classList.add('on', 'pri');
    var 이름 = document.querySelector('[data-part-nm-out]');
    if (이름) 이름.textContent = t.dataset.partNm;
    var 칸 = document.querySelector('[data-symptoms-out]');
    if (칸 && t.dataset.symptoms) {
      칸.innerHTML = t.dataset.symptoms.split('|').map(function (s, i) {
        return '<label class="check none"><input type="checkbox"' + (i === 0 ? ' checked' : '') + '><span>' + s + '</span></label>';
      }).join('');
    }
  });

  /* 「전체 동의」가 체크박스가 아니라 «버튼»인 화면이 있다(CT-01). change 가 안 나서 죽어 있었다. */
  on('button[data-agree-all]', 'click', function (e, t) {
    var scope = t.closest('[data-agree-scope]') || document;
    var boxes = scope.querySelectorAll('[data-agree]');
    var 다켜짐 = boxes.length > 0 && Array.prototype.every.call(boxes, function (x) { return x.checked; });
    boxes.forEach(function (x) { x.checked = !다켜짐; });
    syncUnlockAll(scope);
    toast(다켜짐 ? '전체 동의를 풀었어요' : '모두 동의했어요');
  });

  /* ---------- ★ 달력 — 날짜를 누르면 골라지고, 아래 시간대와 오른쪽 요약이 그 날 것이 된다.
     스펙팩 약속: 「달력에서 날짜 누르기 → 그 날의 가능한 시간대가 아래에 뜨고
     꽉 찬 시간은 흐려진다」. 예전에는 날짜 30칸이 통째로 죽어 있었다(2026-08-17). ---------- */
  on('.cal-d[data-day]', 'click', function (e, t) {
    if (t.disabled || t.classList.contains('past')) return;
    var grid = t.closest('.cal-grid');
    grid.querySelectorAll('.cal-d').forEach(function (d) { d.classList.remove('sel'); });
    t.classList.add('sel');
    var 적음 = !!t.dataset.few;
    var 글 = '9월 ' + t.dataset.day + '일 (' + t.dataset.dow + ')';
    document.querySelectorAll('[data-cal-picked]').forEach(function (x) { x.textContent = 글; });
    /* 자리가 적은 날은 앞 두 시간만 열어 둔다 — 「꽉 찬 시간은 흐려진다」 */
    var slots = document.querySelector('[data-slots]');
    if (slots) {
      var 목록 = slots.querySelectorAll('.slot');
      목록.forEach(function (s, i) {
        var 막힘 = 적음 ? i > 1 : s.dataset.time === '14:00';
        s.disabled = 막힘;
        s.style.opacity = 막힘 ? '.5' : '';
        if (막힘) s.classList.remove('on');
      });
      var 열린것 = slots.querySelector('.slot:not([disabled])');
      목록.forEach(function (s) { s.classList.remove('on'); });
      if (열린것) {
        열린것.classList.add('on');
        document.querySelectorAll('[data-slot-picked]').forEach(function (x) { x.textContent = 열린것.dataset.time; });
      }
    }
  });
  on('.slot[data-time]', 'click', function (e, t) {
    if (t.disabled) return;
    t.closest('[data-slots]').querySelectorAll('.slot').forEach(function (s) { s.classList.remove('on'); });
    t.classList.add('on');
    document.querySelectorAll('[data-slot-picked]').forEach(function (x) { x.textContent = t.dataset.time; });
  });
  on('.cal-mv[data-mv]', 'click', function (e, t) {
    if (t.disabled) return;
    var hd = t.closest('.cal-hd');
    var 달 = hd.querySelector('.cal-m');
    var m = /(\d+)년 (\d+)월/.exec(달.textContent);
    if (!m) return;
    var y = Number(m[1]), mo = Number(m[2]) + Number(t.dataset.mv);
    if (mo > 12) { mo = 1; y += 1; } if (mo < 1) { mo = 12; y -= 1; }
    달.textContent = y + '년 ' + mo + '월';
    /* 지난 달로는 못 돌아간다 — 오늘이 든 달이 왼쪽 끝이다 */
    var 뒤로 = hd.querySelector('.cal-mv[data-mv="-1"]');
    if (뒤로) 뒤로.disabled = (y === 2026 && mo <= 9);
    toast(y + '년 ' + mo + '월 자리를 불러왔어요');
  });

  /* ---------- 돈 표시 — 두 화면 이상에서 같이 쓴다 ---------- */
  function 돈(n) { return Math.round(n).toLocaleString('ko-KR') + '원'; }
  function 만원(n) { return Math.round(n / 10000).toLocaleString('ko-KR') + '만원'; }

  /* ---------- ★ OW-01 현장 대시보드 — 기간 select를 바꾸면 매출·미수금이 다시 계산된다.
     「진행 중 현장」·「밀린 공정」은 지금 순간의 현장 목록을 그대로 센 값이라 기간과
     무관해 그대로 둔다. ---------- */
  document.addEventListener('change', function (e) {
    var sel = e.target.closest('[data-period-pick]');
    if (!sel) return;
    var opt = sel.selectedOptions[0];
    var 매출El = document.querySelector('[data-stat-num="매출"]');
    var 미수금El = document.querySelector('[data-stat-num="미수금"]');
    var 라벨El = document.querySelector('[data-stat-label="매출"]');
    if (매출El) 매출El.textContent = Math.round(Number(opt.dataset.매출) / 10000).toLocaleString('ko-KR');
    if (미수금El) 미수금El.textContent = Math.round(Number(opt.dataset.미수금) / 10000).toLocaleString('ko-KR');
    if (라벨El) 라벨El.textContent = opt.dataset.매출라벨;
  });

  /* 카드 목록 정렬 — <select data-sort-cards="키"> 와 <div data-sort-list="키">
     ⚠ 2026-08-18: 정렬 고르개가 색만 바뀌고 차례는 그대로였다(프리미엄 CS0101 과 같은 자리).
       스펙팩 acts 「목록 차례가 …으로 바뀐다」를 지킨다. */
  document.addEventListener('change', function (e) {
    var sel = e.target.closest && e.target.closest('[data-sort-cards]');
    if (!sel) return;
    var 상자 = document.querySelector('[data-sort-list="' + sel.dataset.sortCards + '"]');
    if (!상자) return;
    var 키 = sel.value || 'new';
    Array.prototype.slice.call(상자.children)
      .sort(function (a, b) { return Number(a.dataset[키] || 0) - Number(b.dataset[키] || 0); })
      .forEach(function (c) { 상자.appendChild(c); });
  });

  /* 아래 넷은 2026-08-18 디럭스 재점검에서 나온 「고르개가 옆을 못 움직이는」 자리들.
     스펙팩 acts 에 「고르면 …가 바뀐다」고 적혀 있는데 값만 바뀌고 있었다. */
  document.addEventListener('change', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var 천 = function (n) { return Math.round(n).toLocaleString('ko-KR'); };
    /* 받침이 있으면 앞엣것, 없으면 뒤엣것 — 「철거를」·「타일팀은」처럼 읽히게 한다 */
    var 조사 = function (말, 있, 없) {
      var c = 말.charCodeAt(말.length - 1) - 0xac00;
      return 말 + (c >= 0 && c <= 11171 && c % 28 !== 0 ? 있 : 없);
    };

    /* CT-03 착공일 → 위 안내 문구의 날짜 */
    if (t.matches('[data-chakgong]')) {
      var 날 = document.querySelector('[data-chakgong-out]');
      if (날) 날.textContent = t.value;
    }

    /* CT-02 할부 개월 → 월 납입액 */
    if (t.matches('[data-halbu]')) {
      var 액 = Number(t.dataset.amt || 0);
      var 달 = Number((t.value.match(/\d+/) || [1])[0]);
      var 글 = document.querySelector('[data-halbu-out]');
      if (글) 글.textContent = 달 <= 1
        ? '일시불 — ' + 천(액) + '원을 한 번에 냅니다'
        : t.value + ' — 월 ' + 천(액 / 달) + '원';
    }

    /* OW-03 팀 배정 → 겹침 경고 */
    if (t.matches('[data-team]')) {
      var 알림 = document.querySelector('[data-team-out]');
      var 공정 = t.closest('tr') ? t.closest('tr').cells[0].textContent.trim() : '이 공정';
      if (알림) {
        var 바쁨 = (알림.dataset.busy || '').split(',').indexOf(t.value) >= 0;
        알림.innerHTML = 바쁨
          ? '⚠ <b>' + t.value + ' 배정 충돌</b> — ' + (알림.dataset.when || '') + '에 다른 현장('
            + (알림.dataset.where || '') + ')과 겹칩니다. ' + 조사(공정, '을', '를') + ' 다시 보세요.'
          : '✓ ' + 조사(공정, '을', '를') + ' <b>' + t.value + '</b>에 배정했어요 — 겹치는 일정은 없습니다.';
        알림.classList.toggle('dan', 바쁨);
      }
    }

    /* OW-04 발주 상태 → 그 줄 배지 + 위 「발주 안 한 것」 숫자 */
    if (t.matches('[data-po-st]')) {
      var 색 = (t.dataset.poCls || '').split(',')[t.selectedIndex] || 'b-mut';
      var 배지 = t.closest('td').querySelector('[data-po-badge]');
      if (배지) 배지.innerHTML = '<span class="badge ' + 색 + '">' + t.value + '</span>';
      var 남 = document.querySelector('[data-po-left]');
      if (남) 남.textContent = Array.prototype.filter.call(
        document.querySelectorAll('[data-po-st]'), function (s) { return s.selectedIndex === 0; }).length;
    }
  });

  /* OW-04 공정 칩 → 자재 목록을 그 공정 것만 남긴다 */
  document.addEventListener('click', function (e) {
    var 칩 = e.target.closest && e.target.closest('[data-proc-chip]');
    if (!칩) return;
    var 골 = 칩.textContent.trim();
    Array.prototype.forEach.call(document.querySelectorAll('.tbl-mat tr.mat-row'), function (tr) {
      tr.hidden = !(골 === '전체' || tr.cells[0].textContent.trim().indexOf(골) >= 0);
    });
  });

  /* 「더 보기」 — 있는 카드를 본떠 다음 묶음을 이어 붙이고 남은 수를 줄인다.
     ⚠ 알림만 띄우고 목록은 그대로였다. acts: 「아래에 사례 12개가 이어 붙고 남은 수가 줄어든다」 */
  on('[data-more]', 'click', function (e, t) {
    var 상자 = document.querySelector('[data-sort-list="' + t.dataset.more + '"]');
    if (!상자) return;
    var 남은 = Number(t.dataset.moreLeft || 0);
    if (남은 <= 0) return;
    var 이번 = Math.min(12, 남은);
    var 본 = Array.prototype.slice.call(상자.children);
    for (var i = 0; i < 이번; i++) {
      var 사본 = 본[i % 본.length].cloneNode(true);
      사본.dataset.new = String(상자.children.length);
      상자.appendChild(사본);
    }
    남은 -= 이번;
    t.dataset.moreLeft = String(남은);
    t.textContent = 남은 > 0 ? '더 보기 (' + 남은 + '개 남음)' : '다 보셨어요';
    if (남은 <= 0) { t.disabled = true; t.classList.add('is-off'); }
    toast(이번 + '개를 더 불러왔어요');
  });

  /* ---------- ★ CS-04 자재·마감 둘러보기 — 카드를 고르면 위 미리보기 사진이 바뀌고,
     「담기」를 누르면 오른쪽 「내가 고른 자재」에 쌓여 추가금이 다시 계산된다.
     한 부위(바닥·벽·주방·욕실·창호)당 하나만 담긴다 — 새로 담으면 그 부위의 예전 것을 대신한다.
     이 화면엔 평수를 따로 묻지 않아 32평(다른 화면의 ESTIMATE_BASE.pyeong과 같음)을 그대로 쓴다. */
  var cs04담은것 = { 바닥: { nm: '강마루', add: 0 }, 주방: { nm: '엔지니어드스톤', add: 65000 } };
  function cs04합계갱신() {
    var listEl = document.querySelector('[data-cart-list]');
    var totalEl = document.querySelector('[data-cart-total]');
    if (!listEl || !totalEl) return;
    var parts = Object.keys(cs04담은것);
    listEl.innerHTML = parts.length
      ? parts.map(function (p) {
        var it = cs04담은것[p];
        var v = it.add === 0 ? '+0원' : it.add < 0 ? 돈(it.add) + '/평' : '+' + 돈(it.add) + '/평';
        return '<div class="row-b"><span class="t-sub">' + p + ' — ' + it.nm + '</span><span class="t-sub' + (it.add > 0 ? ' acc' : '') + '">' + v + '</span></div>';
      }).join('')
      : '<p class="t-sub">아직 담은 자재가 없어요</p>';
    var sum = parts.reduce(function (s, p) { return s + cs04담은것[p].add * 32; }, 0);
    totalEl.textContent = (sum >= 0 ? '+' : '') + 만원(sum);
  }
  on('[data-part]', 'click', function (e, t) {
    var img = t.querySelector('.ph img[data-예시]');
    var previewImg = document.querySelector('[data-preview] img[data-예시]');
    if (img && previewImg) previewImg.src = img.src;
  });
  on('[data-part] .btn', 'click', function (e, t) {
    var card = t.closest('[data-part]');
    if (!card) return;
    cs04담은것[card.dataset.part] = { nm: card.dataset.nm, add: Number(card.dataset.add) };
    cs04합계갱신();
  });

  /* ---------- ★ HO-01 히어로 평수 칩 — 고르면 예상 비용 띠가 바뀐다 ---------- */
  on('.pyeong-row .chip', 'click', function (e, t) {
    var row = t.closest('.pyeong-row');
    row.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
    t.classList.add('on');
    var val = row.querySelector('.pyeong-val');
    if (val && t.dataset.min) {
      val.innerHTML = t.textContent + ' 아파트 전체 시공 평균 <b>' + 만원(t.dataset.min) + ' ~ ' + 만원(t.dataset.max) + '</b>';
    }
    /* 고른 평수를 견적 마법사로 «들고 간다». 단계를 건너뛰는 게 아니라
       1단계 평수 칸에 미리 채워 두는 용도다.
       ⚠ 화면 아래쪽 CTA 도 같은 링크라 페이지 전체를 훑어 함께 고친다 —
         위에서 40평대를 고르고 아래 버튼을 누르면 32평으로 가면 안 된다. */
    if (t.dataset.pyeong) {
      var href = 'ES-01.html?pyeong=' + t.dataset.pyeong + '&band=' + encodeURIComponent(t.dataset.label || '');
      document.querySelectorAll('[data-pyeong-go]').forEach(function (a) { a.setAttribute('href', href); });
    }
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
    var fill = wz.querySelector('.progress .fill');
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

  /* ---------- ★ ES-01 견적 3단계 — 고른 공간에 따라 미리보기 금액이 바뀐다.
     아직 4·5단계(마감 등급·착공 시기)를 안 물은 시점이라, 확정 견적(ESTIMATE_BASE)보다
     낮은 범위 안에서만 움직인다 — 공간을 다 골라도 확정액을 넘어서면 안 된다. ---------- */
  on('[data-space-pick] input[type=checkbox]', 'change', function () {
    var pick = document.querySelector('[data-space-pick]');
    var checked = pick.querySelectorAll('input[type=checkbox]:checked');
    var names = Array.prototype.map.call(checked, function (c) { return c.dataset.space; });
    var listEl = document.querySelector('[data-space-list]');
    if (listEl) listEl.textContent = names.length ? names.join(', ') : '아직 고르지 않음';
    var priceEl = document.querySelector('[data-space-price]');
    if (priceEl) {
      var n = names.length;
      var min = 19500000 + n * 1500000;
      var max = 25600000 + n * 1800000;
      priceEl.textContent = 만원(min) + ' ~ ' + 만원(max);
    }
  });

  /* ---------- ★ ES-02 견적 결과 — 마감 등급 탭 · 「포함」 토글이 금액에 반영된다.
     data-base 는 「기본」(mult 1.0) 기준값이다 — 등급 탭을 누르면 base×mult 로
     다시 계산해서 각 칸·범위·공사 기간을 바꾸고, 합계는 켜진(포함) 줄만 더한다. ---------- */
  function es02합계() {
    var totalEl = document.querySelector('[data-grade-total]');
    if (!totalEl) return;
    var sum = 0;
    document.querySelectorAll('.toggle[data-base]').forEach(function (b) {
      if (b.classList.contains('on')) sum += Number(b.dataset.amt);
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
    if (daysEl) daysEl.textContent = t.dataset.days + '일 (주말 제외)';
    es02합계();
  });
  on('.toggle[data-base]', 'click', es02합계);

  /* ---------- ★ 준공 검수 — 괜찮음·문제있음 ---------- */
  on('[data-chk]', 'click', function (e, t) {
    var row = t.closest('.chk-row');
    if (!row) return;
    var buttons = row.querySelectorAll('[data-chk]');
    buttons.forEach(function (b) { b.classList.remove('on'); });
    t.classList.add('on');
    var sub = row.querySelector('.chk-sub');
    if (sub) sub.hidden = t.dataset.chk !== 'bad';
    row.classList.toggle('bad', t.dataset.chk === 'bad');
    var done = document.querySelectorAll('.chk-row [data-chk].on').length;
    var total = document.querySelectorAll('.chk-row').length;
    document.querySelectorAll('[data-chk-done]').forEach(function (x) { x.textContent = done; });
    document.querySelectorAll('[data-chk-total]').forEach(function (x) { x.textContent = total; });
    var submit = document.querySelector('[data-chk-submit]');
    if (submit) {
      var remain = total - done;
      submit.disabled = remain > 0;
      submit.classList.toggle('is-off', remain > 0);
      submit.textContent = remain > 0 ? '준공 승인하고 잔금 결제 (' + remain + '개 남음)' : '준공 승인하고 잔금 결제';
    }
  });

  /* ---------- 서명란 — 누르면 서명한 것으로 표시(프로토타입) ---------- */
  on('.sig-pad', 'click', function (e, t) {
    if (e.target.closest('.sig-clear')) return;
    t.classList.add('signed');
    t.textContent = '';
    var span = document.createElement('span');
    span.textContent = '(서명완료) 2026.08.17';
    t.appendChild(span);
    var clear = document.createElement('button');
    clear.className = 'btn btn-ghost btn-sm sig-clear';
    clear.type = 'button';
    clear.textContent = '지우기';
    t.appendChild(clear);
  });
  on('.sig-clear', 'click', function (e, t) {
    var pad = t.closest('.sig-pad');
    pad.classList.remove('signed');
    pad.textContent = '여기를 눌러 서명해 주세요';
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
  on('.upload-thumbs button', 'click', function (e, t) {
    t.closest('.u-item').remove();
  });

  /* 카운트다운 */
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

  /* 행·카드 전체를 누르면 이동 — data-href */
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

  /* 화면 정보 패널 — 언제나 닫힌 채로 시작한다. 누를 때만 열린다. */
  on('.dev-btn', 'click', function (e, t) {
    var box = t.closest('.dev');
    box.classList.toggle('on');
  });

  /* 폼 전송은 프로토타입이므로 막고 안내만 */
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    toast('프로토타입 화면이에요. 실제로 전송되지 않습니다');
  });

  /* 가로로 넘치는 줄 — 좌우 화살표로 넘긴다 */
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
