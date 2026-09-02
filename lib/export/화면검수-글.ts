/* 손님이 «자기 화면»을 재는 글. 한 곳뿐인 원본이다. (2026-09-02)
 *
 * 왜 떼어 냈나 — 사장님 지시.
 *   전에는 이 글이 spec-pack.ts 의 7-9 안에만 있었다. 그런데 스펙팩은
 *   화면 1장짜리도 1,194줄이고 7-9 는 «68% 지점»이다. 화면이 100장이면
 *   몇 천 줄이고, 손님은 그 자리를 못 찾는다.
 *     사장님: 「우리 스펙팩이 3000줄~5000줄인데 그중에 7번을 찾아서 넣어라?
 *              고객들은 나보다 더 모르는 분들이 많아. 절대 이해 못해.」
 *
 *   그래서 이 글을 여기 한 곳에 두고 «세 군데»가 같은 것을 가져다 쓴다 —
 *     ① 스펙팩 7-9 · 7-9-2   (AI 가 읽는다)
 *     ② 11_내사이트_검수하는_법.html  (사람이 읽는다 · guide-links.ts)
 *     ③ 6장 빌드 가이드의 마지막 걸음 (AI 가 «다 만든 뒤» 스스로 돌린다)
 *
 * ⛔ 세 곳에 각각 적지 마라. 두 곳에만 적어도 반드시 갈라진다 —
 *   이 저장소가 09·10 안내서에서 이미 겪은 일이다(guide-links.ts 머리말).
 *
 * ⛔ check-눈으로.mts 를 그대로 옮기지 마라. 그쪽은 우리 템플릿의 클래스 이름
 *   (.ednav · [data-go] · .gnb)에 매여 있어, 손님이 AI 로 만든 화면에 돌리면
 *   아무것도 못 찾고 «조용히 통과»한다. 이 글은 이름을 안 보고 생김새로만 잰다.
 *   그 덕에 우리 팩으로 만든 것이 아니어도 돈다 — 2026-09-02 에
 *   caffeinecolor.com(Next.js, 우리 팩 아님)에 돌려 여덟 건을 실제로 찾았다.
 */

/** 브라우저 콘솔에 붙여 넣는 글. 그려져야만 보이는 것을 잰다 — 한 장씩. */
export const 화면검수글 = String.raw`(() => {
  const 흠 = [], 적기 = (칸, 말) => { const k = "[" + 칸 + "] " + 말; if (!흠.includes(k)) 흠.push(k); };
  const 보이나 = (el) => { const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") return false;
    const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2; };
  const 이름 = (el) => el.tagName.toLowerCase() +
    (typeof el.className === "string" && el.className ? "." + el.className.trim().split(/ +/)[0] : "");
  const 반 = (n) => Math.round(n);
  const 본문 = document.querySelector("main") || document.body;
  const bs = getComputedStyle(본문);
  const 콘텐츠폭 = 반(본문.getBoundingClientRect().width - parseFloat(bs.paddingLeft) - parseFloat(bs.paddingRight));
  const 세로막대 = 반(window.innerWidth - document.documentElement.clientWidth);
  const 푸터 = document.querySelector("footer");

  // ① GNB 가 위에 붙어 있나
  /* ⚠ 아무 nav 나 상단바로 보면 안 된다 (2026-09-02). 로그인 같은 화면은 상단바가
     아예 없는데, 그 화면의 첫 nav 는 «길잡이»(빵부스러기)다. 길잡이는 굴러 올라가는
     것이 맞다 — 인테리어 팩 207장을 재다가 AU0201·AU0301 을 그렇게 헛짚었다.
     이름에 crumb·breadcrumb·path 가 든 것과, 화면 위쪽에 안 붙은 것은 건너뛴다. */
  const 상단바 = [...document.querySelectorAll("header, nav")].find(function (el) {
    if (/crumb|breadcrumb|path|back/.test(el.className || "")) return false;
    return el.getBoundingClientRect().top < 120;
  });
  if (상단바) { const p = getComputedStyle(상단바).position;
    if (p !== "sticky" && p !== "fixed") 적기("고정", 이름(상단바) + " 가 position:" + p + " — 굴리면 따라 올라갑니다"); }

  // ② 본문과 푸터 사이가 붙었나 (그릇이 아니라 «안 마지막 알맹이»까지 잰다)
  if (푸터 && 푸터.previousElementSibling) {
    let 끝 = 푸터.previousElementSibling;
    if (보이나(끝) && !/sticky|fixed/.test(getComputedStyle(끝).position)) {
      for (let i = 0; i < 6; i++) {
        const 안 = [...끝.children].filter((c) => 보이나(c) && getComputedStyle(c).position === "static");
        if (!안.length) break; 끝 = 안[안.length - 1];
      }
      const 틈 = 반(푸터.getBoundingClientRect().top - 끝.getBoundingClientRect().bottom);
      if (틈 >= 0 && 틈 < 16) 적기("간격", "본문과 푸터 사이가 " + 틈 + "px — " + 이름(끝) + " 바로 아래 푸터");
    }
  }

  // ③ 덩어리 사이 간격이 그 칸의 «리듬»을 벗어났나
  for (const 부모 of [본문, ...본문.querySelectorAll("*")]) {
    if (!보이나(부모) || 부모.closest("table, svg")) continue;
    const ps = getComputedStyle(부모);
    if (/flex|grid/.test(ps.display) && ps.flexDirection !== "column") continue;
    const 아이 = [...부모.children].filter((c) => 보이나(c) && getComputedStyle(c).position !== "absolute");
    if (아이.length < 3) continue;
    const 틈들 = [];
    for (let i = 1; i < 아이.length; i++) {
      const a = 아이[i - 1].getBoundingClientRect(), b = 아이[i].getBoundingClientRect();
      if (b.top < a.bottom - 2) continue;
      틈들.push({ v: 반(b.top - a.bottom), 앞: 아이[i - 1], 뒤: 아이[i] });
    }
    if (틈들.length < 3) continue;
    const 벌 = 틈들.filter((x) => x.v >= 8);
    if (벌.length < 틈들.length * 0.6) continue;
    const 리듬 = 틈들.map((x) => x.v).sort((a, b) => a - b)[Math.floor(틈들.length / 2)];
    for (const x of 틈들) {
      // 「리듬의 절반도 안 된다」만으로는 리듬이 클수록 헛짚는다. 섹션 사이가 80px 인 칸에
      // 「안내 띠 → 탭 → 탭 내용」이 24·16px 로 붙은 «한 묶음»이 들어 있으면 그건 묶음이다.
      // 눈에 붙어 보이는 것은 결국 절대값이 작을 때다.
      const 붙 = x.v <= 2, 좁 = 리듬 >= 20 && x.v < 리듬 * 0.45 && x.v <= 12;
      if (!붙 && !좁) continue;
      // 같은 «종류»가 이어지는 줄은 붙는 게 맞다. 뒤에 붙은 여백 클래스(mb3·total)까지
      // 견주면 "card mb3" 와 "card mb6" 를 서로 다른 것으로 봐서 헛짚는다.
      if ((x.앞.className || "").trim().split(/ +/)[0] === (x.뒤.className || "").trim().split(/ +/)[0]) continue;
      if (x.뒤 === 푸터) continue;
      // 누군가 «이 값으로» 정해 둔 자리는 흠이 아니다. 2px 은 이름 밑에 한 줄 소개를
      // 붙이려고 손으로 적은 값이지, 어쩌다 붙은 것이 아니다.
      if (붙 && (parseFloat(getComputedStyle(x.앞).marginBottom) || 0) +
                (parseFloat(getComputedStyle(x.뒤).marginTop) || 0) > 0) continue;
      // 뒤엣것이 «윗줄»이나 제 안여백을 가졌으면 그것이 곧 틈이다 — 카드 아랫단이 그렇다.
      if (붙) { const 뒤s = getComputedStyle(x.뒤);
        if (parseFloat(뒤s.borderTopWidth) > 0 || (parseFloat(뒤s.paddingTop) || 0) >= 8) continue; }
      // 길잡이(빵부스러기)·«‹ 뒤로»는 다음 덩어리와 한 덩어리다
      if (!붙 && (/crumb|breadcrumb|path|back/.test(x.앞.className || "") ||
                  x.앞.tagName.toLowerCase() === "nav")) continue;
      // «이름표와 값»은 한 덩어리다 — 어느 쪽이 위든 붙는 것이 맞다.
      // 제목→부제만 넘기면 「대표 시술 최저가 → 25,000원~」처럼 뒤집힌 짝을 흠이라 한다.
      const 잔글 = (el) => /t-sub|sub|desc|help|hint|caption|label/.test(el.className || "");
      const 큰글 = (el) => /^(h[1-4]|b|strong)$/.test(el.tagName.toLowerCase()) ||
                          /t-sec|t-card|t-page|lb|price|nm|name|field/.test(el.className || "");
      /* 큰 글자를 «감싼 칸»도 큰 글자로 본다 (2026-09-02). div.center 안에 30px
         제목을 넣어 둔 자리를 못 알아보고 그 아래 잔글씨와의 8px 을 흠이라 했다. */
      const 큰글감쌈 = (el) => 큰글(el) ||
        [...el.children].some(function (c) { return 큰글(c) || parseFloat(getComputedStyle(c).fontSize) >= 24; });
      /* ⭐ 2026-09-03 — 잔글(설명·캡션·힌트)은 «위든 아래든» 제 짝에 붙는 것이 맞다.
         앞서는 «잔글 ↔ 큰글»만 넘겼는데, 차트 밑 캡션·목록 위 설명처럼 짝이 큰글이
         아닌 자리를 열 번 넘게 헛짚었다. 이 규칙은 «칸 리듬보다 좁을 때»만 도므로,
         잔글이 제 짝에 바짝 붙은 것을 흠이라 할 일이 없다. */
      if (잔글(x.앞) || 잔글(x.뒤)) continue;
      /* 짧은 이름표 바로 «밑»의 입력 부품은 그 이름표의 것이다 — 한 덩어리다.
         「시·도」 아래 칩 묶음, 「연락처」 아래 입력칸이 그렇다. 이름이 아니라
         «짧은 글 한 줄 + 바로 아래 부품»이라는 사실로 가른다 (2026-09-03). */
      /* 이름표와 그 부품, 그리고 «나란한 부품 줄»은 한 덩어리다 — 칸 리듬과 견줄 것이
         아니다. 「인증번호 6자리」 밑 입력칸, 「전체 동의」 밑 약관 줄들이 그렇다.
         ⚠ 이름이 아니라 «사실»로 가른다 — 짧은 글이거나 부품을 담은 것이면 한 짝이다.
         (2026-09-03. 앞서 «자식이 없는 짧은 글»만 봤더니 「인증번호 6자리 · 남은 시간」
          처럼 두 조각으로 된 이름표 줄을 못 알아봤다.) */
      const 부품 = "input, select, textarea, button, .chip, .slot, .otp, .progress, progress";
      const 부품있나 = function (el) {
        return el.matches && (el.matches(부품) || !!el.querySelector(부품));
      };
      const 짧은글 = function (el) {
        const t = (el.textContent || "").replace(/s+/g, " ").trim();
        return t.length > 0 && t.length <= 40;
      };
      if (부품있나(x.뒤) && (짧은글(x.앞) || 부품있나(x.앞))) continue;
      /* 단추 바로 밑 잔글씨는 «그 단추의 설명»이라 붙는 것이 맞다 (2026-09-02).
         「내 캘린더에 담기」 아래 「전날 오전에 확인 문자를 보내 드려요」가 그렇다 —
         눈으로 보면 한 덩어리인데 8px 이라고 짚었다. */
      if (잔글(x.뒤) && x.앞.matches &&
          (x.앞.matches("button, .btn, a.btn") || (x.앞.querySelector && x.앞.querySelector("button, .btn, a.btn")))) continue;
      적기("간격", 이름(x.뒤) + " 와 위 " + 이름(x.앞) + " 사이 " + x.v + "px (이 칸 리듬은 " + 리듬 + "px)");
    }
  }

  // ④ 버튼·배지가 늘어났나 / 동그란 버튼이 타원이 됐나
  const 부품 = [...document.querySelectorAll(".badge, .btn, button, [class*=badge], [class*=btn]")].filter((el) => {
    if (!보이나(el)) return false;
    // 버튼을 «담는 칸»(.btns 같은 것)은 부품이 아니다 — 넓은 게 맞다.
    // ⚠ 담긴 것이 .btn 이 아니라 그냥 <a> 일 수도 있다(「목록 보기 ›」). 그것도 칸이다.
    if (el.querySelector(".badge, .btn, button, a, [role=button], input, select, textarea, label")) return false;
    // 일부러 칸을 꽉 채우라고 시킨 것
    if (/block|full|wide/.test(el.className || "")) return false;
    // ⚠ 이름은 사람마다 다르게 짓는다(btn-w · w-full · is-block …). 이름 말고 «사실»로 본다 —
    //   제 스스로는 줄 안에 서는 것(inline·inline-flex·inline-block)이 칸을 꽉 채우고 있다면
    //   그건 만든 사람이 width 를 직접 준 것이다. 늘어난 것이 아니라 그렇게 시킨 것이다.
    {
      const s0 = getComputedStyle(el), p0 = el.parentElement;
      if (p0 && s0.display.indexOf("inline") === 0) {
        const ps0 = getComputedStyle(p0);
        const 속폭 = p0.getBoundingClientRect().width
          - parseFloat(ps0.paddingLeft) - parseFloat(ps0.paddingRight);
        if (el.getBoundingClientRect().width >= 속폭 - 1) return false;
      }
    }
    return true;
  });
  const 무리 = new Map();
  const 열쇠 = (el) => (el.className || "").trim().split(/ +/)[0] || el.tagName;
  for (const el of 부품) { const k = 열쇠(el); if (!무리.has(k)) 무리.set(k, []); 무리.get(k).push(el); }
  for (const el of 부품) {
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    if (s.borderTopLeftRadius.includes("%") && parseFloat(s.borderTopLeftRadius) >= 40 && r.width / r.height > 1.5)
      적기("버튼", 이름(el) + " 는 동그란 버튼인데 " + 반(r.width) + "x" + 반(r.height) + " 로 늘어나 타원이 됐습니다");
    const rg = document.createRange(); rg.selectNodeContents(el);
    const 글폭 = rg.getBoundingClientRect().width; if (!글폭) continue;
    const 또래 = 무리.get(열쇠(el)) || [];
    const 또래폭 = 또래.map((x) => x.getBoundingClientRect().width).sort((a, b) => a - b)[Math.floor(또래.length / 2)];
    if (또래.length >= 2 && r.width < 또래폭 * 2.5) continue;             // 다 같이 넓으면 일부러 그런 것
    // 스스로 «자라라»고 적힌 것은 늘어난 것이 아니다 — flex:1 1 0% 는 한 줄을 반씩
    // 나눠 쓰라는 뜻이다. 세로로 쌓은 단추 더미도 꽉 채우는 것이 제 모습이다.
    if (parseFloat(s.flexGrow) > 0) continue;
    const 부모 = el.parentElement; if (!부모) continue;
    const ps2 = getComputedStyle(부모);
    const 세로더미 = ps2.display.indexOf("flex") >= 0 && ps2.flexDirection.indexOf("column") === 0;
    if (세로더미 && r.width <= 480) continue;
    // 칸에 혼자 서 있으면 꽉 채우는 것이 제 모습이다 — 나란한 것이 없으니 견줄 것도 없다
    if ([...부모.children].filter(보이나).length === 1) continue;
    const 남 = 반(r.width - 글폭 - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight));
    // ⚠ 까닭을 «지어내지» 않는다. 부모가 실제로 어떻게 서 있는지 읽어서 적는다.
    const 까닭 = ps2.display.indexOf("flex") >= 0
      ? 이름(부모) + " 가 flex(" + ps2.flexDirection + ") 인데 align-items 가 " + ps2.alignItems + " 입니다"
      : 이름(부모) + " 는 " + ps2.display + " 입니다";
    if (남 > 140) 적기("늘어남", 이름(el) + " 가 " + 반(r.width) + "px 인데 글은 " + 반(글폭) +
      "px — " + 까닭);
  }

  // ⑤ 좌우로 미는 칸에 «막대»가 드러났나
  for (const el of document.querySelectorAll("*")) {
    if (!보이나(el)) continue;
    const s = getComputedStyle(el);
    if (!/auto|scroll/.test(s.overflowX) || el.scrollWidth <= el.clientWidth + 2) continue;
    const 두께 = el.offsetHeight - el.clientHeight - parseFloat(s.borderTopWidth) - parseFloat(s.borderBottomWidth);
    if (두께 <= 2) continue;
    // 넘기는 길은 하나여야 한다 — «화살표가 있는데 띠도 깔린 것»이 흠이다.
    // ⚠ 화살표가 없으면 그 띠가 «넘길 수 있다»는 유일한 신호다. 표·간트가 그렇다.
    const 둘레 = el.parentElement || el;
    if (!둘레.querySelector(".car-nav, .nav, [aria-label=이전], [aria-label=다음], .prev, .next")) continue;
    적기("막대", 이름(el) + " 에 가로 막대가 " + 반(두께) + "px 드러납니다 — 화살표로 넘기게 하세요");
  }

  // ⑥ 표가 제 칸을 넘쳤나
  for (const t of document.querySelectorAll("table")) {
    if (!보이나(t) || !t.parentElement) continue;
    /* 감싼 칸이 «옆으로 밀 수» 있으면 넓은 표는 흠이 아니다 — 좁은 화면에서
       표를 뭉개지 않는 옳은 방법이다(2026-09-03). */
    const 밀림 = getComputedStyle(t.parentElement).overflowX;
    if (밀림 === "auto" || 밀림 === "scroll") continue;
    const 넘침 = 반(t.scrollWidth - t.parentElement.clientWidth);
    if (넘침 > 4) 적기("표", "표가 제 칸보다 " + 넘침 + "px 넓습니다");
  }

  // ⑦ 지금 보는 메뉴가 «켜져» 있나
  //    표시하는 방법은 사이트마다 다릅니다. 그래서 «클래스 이름»으로 찾지 않고,
  //    지금 쪽을 가리키는 링크가 옆 링크들과 «달라 보이는지»를 봅니다.
  for (const 메뉴 of document.querySelectorAll("nav, header, [role=navigation]")) {
    if (!보이나(메뉴)) continue;
    /* 바닥글의 링크 목록은 «지금 여기»를 표시하지 않는 것이 보통이다 — 둘러보는 길이지
       지금 어디 있나를 말하는 자리가 아니다(2026-09-03). */
    if (메뉴.closest("footer")) continue;
    const 고리 = [...메뉴.querySelectorAll("a[href]")].filter(보이나);
    if (고리.length < 3) continue;
    const 여기 = 고리.filter((a) => a.pathname === location.pathname);
    if (!여기.length) continue;
    const 다름 = (a) => {
      if (a.getAttribute("aria-current")) return true;
      const s = getComputedStyle(a);
      return 고리.some((b) => {
        if (b === a) return false;
        const t = getComputedStyle(b);
        return s.color !== t.color || s.fontWeight !== t.fontWeight ||
               s.borderBottomWidth !== t.borderBottomWidth || s.backgroundColor !== t.backgroundColor;
      });
    };
    const 켜진것 = 여기.filter(다름);
    if (!켜진것.length) 적기("메뉴", 이름(메뉴) + " 에 «지금 여기» 표시가 없습니다 — 링크 " + 고리.length + "개가 다 같아 보입니다");
    break;
  }

  // ⑧ 배경 위 글자가 읽히나 — 본문 4.5 · 큰 글자 3.0 (WCAG)
  //    사진 위 글자는 잴 수 없어 건너뜁니다. 눈으로 보셔야 합니다.
  //
  // ⛔ 색 글자에서 숫자만 뽑아 쓰지 마세요. 요즘 브라우저는 「lab(91.9 -0.6 5.1 / .85)」 처럼
  //    내주는 일이 잦은데, 숫자만 뽑으면 «밝은 회색»을 새까맣게 읽어 멀쩡한 화면이
  //    죄다 흠으로 잡힙니다. 캔버스에 한 점 찍어 브라우저가 직접 풀게 합니다.
  const 판 = document.createElement("canvas"); 판.width = 판.height = 1;
  const 붓 = 판.getContext("2d", { willReadFrequently: true });
  const 색값 = (s) => {
    try { 붓.clearRect(0, 0, 1, 1); 붓.fillStyle = s; 붓.fillRect(0, 0, 1, 1);
      const d = 붓.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    } catch (e) { return null; }
  };
  // 반투명한 것은 «아래 색 위에 얹어» 실제로 보이는 색을 만든다.
  const 겹치기 = (위, 아래) => {
    const a = 위[3] + 아래[3] * (1 - 위[3]);
    if (!a) return [0, 0, 0, 0];
    return [0, 1, 2].map((i) => (위[i] * 위[3] + 아래[i] * 아래[3] * (1 - 위[3])) / a).concat([a]);
  };
  const 광 = (c) => { const f = (v) => { v = v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const 바탕 = (el) => { let n = el, 쌓임 = null;
    for (let i = 0; n && i < 14; i++, n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage !== "none") return null;   // 사진·그러데이션 위는 못 잰다
      const c = 색값(s.backgroundColor);
      if (!c || c[3] === 0) continue;
      쌓임 = 쌓임 ? 겹치기(쌓임, c) : c;
      if (쌓임[3] >= 0.99) return 쌓임.slice(0, 3);
    }
    return 쌓임 ? 겹치기(쌓임, [255, 255, 255, 1]).slice(0, 3) : [255, 255, 255]; };
  let 대비셈 = 0;
  for (const el of document.querySelectorAll("p, a, li, h1, h2, h3, h4, button, td, th, label, span, strong")) {
    if (대비셈 >= 8 || !보이나(el)) continue;
    const 글 = (el.textContent || "").trim();
    if (!글 || 글.length > 120) continue;
    if ([...el.children].some((c) => (c.textContent || "").trim())) continue;  // 글을 «직접» 가진 것만
    // 꺼진 부품은 건너뛴다 — WCAG 1.4.3 이 «작동하지 않는 UI 부품»을 면제한다.
    // 못 고르는 날짜·잠긴 단추를 흐리게 두는 것은 «그렇게 보이라고» 한 것이다.
    if (el.closest("[disabled], [aria-disabled='true'], fieldset[disabled]")) continue;
    const s = getComputedStyle(el);
    const 글색 = 색값(s.color), 뒤 = 바탕(el);
    if (!글색 || !뒤 || 글색[3] === 0) continue;
    const 앞 = 글색[3] < 1 ? 겹치기(글색, 뒤.concat([1])) : 글색;   // 흐린 글자는 바탕에 얹어 잰다
    const a = 광(앞), b = 광(뒤);
    const 비 = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const 크기 = parseFloat(s.fontSize), 굵기 = parseInt(s.fontWeight) || 400;
    const 기준 = (크기 >= 24 || (크기 >= 18.66 && 굵기 >= 700)) ? 3 : 4.5;
    if (비 < 기준) { 대비셈++;
      적기("대비", 이름(el) + " «" + 글.slice(0, 14) + "» 대비 " + 비.toFixed(2) + " — " + 기준 + " 이상이어야 읽힙니다"); }
  }

  // ⑨ 나란히 놓인 사진 크기가 같은가 (윗변이 같은 것끼리만 견준다)
  for (const 부모 of document.querySelectorAll("main *, body > *")) {
    if (!보이나(부모)) continue;
    const 사진 = [...부모.children]
      .map((c) => (c.tagName === "IMG" ? c : c.querySelector ? c.querySelector("img") : null))
      .filter((x) => x && 보이나(x));
    if (사진.length < 3) continue;
    const 틀 = 사진.map((i) => i.getBoundingClientRect());
    if (new Set(틀.map((r) => 반(r.top))).size > 1) continue;
    const 높 = 틀.map((r) => 반(r.height));
    const 작 = Math.min.apply(null, 높), 큰 = Math.max.apply(null, 높);
    if (작 > 0 && 큰 - 작 > Math.max(8, 작 * 0.15))
      적기("사진", 이름(부모) + " 안에 나란한 사진 높이가 " + 작 + "~" + 큰 + "px 로 제각각입니다");
  }

  return JSON.stringify({
    화면: location.pathname.split("/").pop() || "(첫 화면)",
    콘텐츠폭, 세로막대,
    뒤로가기: !!document.querySelector(".back, [class*=back]"),
    탭이가는곳: [...document.querySelectorAll("[data-go], .tab[href], .tabs a")]
      .map((x) => x.getAttribute("data-go") || x.getAttribute("href")).filter(Boolean),
    흠,
  }, null, 1);
})()`;

/** node 로 돌리는 글. 파일만 봐도 아는 것을 잰다 — 한 번에 전부. */
export const 파일검수글 = String.raw`// node 로 돌리세요:  node 검수.mjs ./내사이트
// ⚠ «사이트 뿌리»를 주세요. 하위 폴더까지 훑습니다 —
//    pages/ 만 주면 한 층 위의 화면 목록(index.html)을 못 봐서
//    거기서만 이어지는 화면이 죄다 «외톨이»로 잘못 잡힙니다.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname, relative } from "node:path";

const 뿌리 = process.argv[2] || ".";
const 쪽들 = [];
(function 훑기(방) {
  for (const e of readdirSync(방, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "node_modules") continue;
    const 길 = join(방, e.name);
    if (e.isDirectory()) 훑기(길);
    else if (e.name.endsWith(".html")) 쪽들.push(길);
  }
})(뿌리);

const 흠 = [];
const 이어진곳 = new Set();

for (const 길 of 쪽들) {
  const 쪽 = relative(뿌리, 길);
  const s = readFileSync(길, "utf8");

  // ① 끊어진 링크
  for (const m of s.matchAll(/href="([^"]+)"/g)) {
    const v = m[1];
    if (!v || v.startsWith("#") || v.startsWith("http") || v.startsWith("mailto:")) continue;
    const 갈곳 = resolve(dirname(길), v.split("#")[0].split("?")[0]);
    이어진곳.add(갈곳);
    if (v.endsWith(".html") && !existsSync(갈곳)) 흠.push("[끊어진 링크] " + 쪽 + " -> " + v);
  }

  // ② 없는 그림
  for (const m of s.matchAll(/src="([^"]+)"/g)) {
    const v = m[1];
    if (!v || v.startsWith("http") || v.startsWith("data:")) continue;
    if (!existsSync(resolve(dirname(길), v.split("?")[0]))) 흠.push("[없는 그림] " + 쪽 + " -> " + v);
  }

  // ③ 눌러도 아무 데도 안 가는 것
  const 빈링크 = (s.match(/href="(#|javascript:void\(0\))"/g) || []).length;
  if (빈링크) 흠.push("[빈 링크] " + 쪽 + " 에 " + 빈링크 + "개 — 갈 곳이 있으면 잇고, 없으면 «안 눌리게» 두세요");

  // ④ 0바이트
  if (statSync(길).size === 0) 흠.push("[빈 파일] " + 쪽);
}

// ⑤ 외톨이 화면 — 만들어 놓고 아무 데서도 안 이어지는 쪽
for (const 길 of 쪽들) {
  const 쪽 = relative(뿌리, 길);
  if (/^(index|home)\./i.test(쪽)) continue;
  if (!이어진곳.has(resolve(길))) 흠.push("[외톨이] " + 쪽 + " 은 어느 화면에서도 이어지지 않습니다");
}

console.log("화면 " + 쪽들.length + "장 · 흠 " + 흠.length + "건");
for (const h of 흠) console.log("  " + h);
if (!흠.length) console.log("  깨끗합니다");`;

/** node 로 돌리는 글 — «100장을 한 번에» 잰다.
 *
 * 왜 있나 — 사장님: 「화면마다 붙혀야돼? 100넘는걸?」
 *   전에는 7-9 가 「헤드리스 브라우저로 열어 꺼내기」라고 «한 줄만» 적어 두고
 *   코드를 안 줬다. 그래서 아무도 못 했다. 우리는 check-눈으로 로 자동으로
 *   돌리면서 손님에게는 손으로 하라고 주고 있었다.
 *
 * ⚠ 헤드리스 브라우저가 없으면 «무엇을 치면 되는지» 한 줄 알려 주고 멈춘다.
 *   깔라고 다그치지 않는다 — 콘솔에 붙이는 길도 그대로 열어 둔다.
 */
export const 모두검수글 = String.raw`// node 로 돌리세요:  node 화면검수.mjs ./내사이트
//
// 화면 한 장씩 콘솔에 붙여 넣는 것이 힘드실 때 씁니다. 100장이면 100번이라
// 이 글이 대신 «전부» 열어서 잽니다. 재는 것은 콘솔에 붙이는 글과 똑같습니다.
//
// ⚠ 헤드리스 브라우저가 있어야 합니다. 없으면 이 글이 «무엇을 치면 되는지»
//   한 줄로 알려 주고 멈춥니다. 아무것도 망가뜨리지 않습니다.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";   // ⚠ node:path 가 아니다. 문법검사는 이걸 못 잡는다

const 뿌리 = process.argv[2] || ".";
const 재는글 = process.argv[3];  // 안 주면 이 파일 옆의 화면검수-글.js 를 찾습니다

let 열기;
try {
  ({ chromium: 열기 } = await import("playwright"));
} catch {
  try {
    const p = await import("puppeteer");
    열기 = { launch: (o) => p.default.launch(o) };
  } catch {
    console.log("헤드리스 브라우저가 없습니다. 아래 한 줄을 치신 뒤 다시 돌리세요.");
    console.log("");
    console.log("  npm i -D playwright && npx playwright install chromium");
    console.log("");
    console.log("깔기 싫으시면 화면을 크롬으로 열고 F12 → Console 에");
    console.log("스펙팩 7-9 의 글을 붙여 넣으셔도 됩니다. 재는 것은 같습니다.");
    process.exit(1);
  }
}

/* 잴 화면을 모은다 — 하위 폴더까지 훑는다. */
const 쪽들 = [];
(function 훑기(방) {
  for (const e of readdirSync(방, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "node_modules") continue;
    const 길 = join(방, e.name);
    if (e.isDirectory()) 훑기(길);
    else if (e.name.endsWith(".html")) 쪽들.push(길);
  }
})(뿌리);
if (!쪽들.length) { console.log(뿌리 + " 안에 html 이 없습니다."); process.exit(1); }

/* 재는 글을 읽는다. 스펙팩 7-9 의 그 글을 파일로 저장해 두시면 됩니다. */
let 글;
try {
  글 = readFileSync(재는글 || "화면검수-글.js", "utf8");
} catch {
  console.log("재는 글을 못 찾았습니다.");
  console.log("스펙팩 7-9 의 자바스크립트를 «화면검수-글.js» 로 저장한 뒤 다시 돌리세요.");
  console.log("  node 화면검수.mjs ./내사이트 ./화면검수-글.js");
  process.exit(1);
}

const 브 = await 열기.launch();
const 쪽 = await 브.newPage();
/* ⛔ await 쪽.setViewportSize ? A : B 로 쓰지 마라 — (await 쪽.setViewportSize) ? A : B 로
   읽혀서 고른 쪽을 «안 기다린다». 둘은 이름이 다르다(playwright · puppeteer). */
const 창크기 = { width: 1440, height: 900 };
if (typeof 쪽.setViewportSize === "function") await 쪽.setViewportSize(창크기);
else if (typeof 쪽.setViewport === "function") await 쪽.setViewport(창크기);

let 흠셈 = 0;
const 줄들 = [];
for (const 길 of 쪽들) {
  const 이름 = relative(뿌리, 길);
  try {
    await 쪽.goto(pathToFileURL(resolve(길)).href, { waitUntil: "load" });
    const 답 = JSON.parse(await 쪽.evaluate(글));
    if (!답.흠.length) { 줄들.push("  ✓ " + 이름); continue; }
    흠셈 += 답.흠.length;
    줄들.push("  ⛔ " + 이름 + "  " + 답.흠.length + "건");
    for (const h of 답.흠) 줄들.push("       " + h);
  } catch (e) {
    줄들.push("  ⚠ " + 이름 + " — 못 열었습니다: " + String(e.message).split(String.fromCharCode(10))[0]);
  }
}
await 브.close();

const 보고 = ["화면 " + 쪽들.length + "장 · 흠 " + 흠셈 + "건", ...줄들].join(String.fromCharCode(10));
console.log(보고);
writeFileSync("화면검수_결과.txt", 보고, "utf8");
console.log("");
console.log("화면검수_결과.txt 에도 적어 두었습니다.");
process.exit(흠셈 ? 1 : 0);`;
