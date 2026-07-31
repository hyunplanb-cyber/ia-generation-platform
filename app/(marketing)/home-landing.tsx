"use client";

import Link from "next/link";
import { SHOWCASE_VIDEO_ID } from "@/lib/site";


// 카페인컬러 메인 — 승인된 레트로모던 시안(홈페이지_리디자인_시안/template.html)을
// 실제 페이지로 이관한 것. 스타일은 styled-jsx로 이 컴포넌트에만 스코프된다
// (일반 element 선택자 section/h2/a 등이 다른 페이지로 새지 않게).
// 상단 네비·하단 푸터는 마케팅 레이아웃(SiteHeader/footer)이 담당하므로 여기선 본문만.
export function HomeLanding() {
  return (
    <div className="cc">
      {/* HERO */}
      <section className="hero" id="top">
        <div className="wrap">
          <div className="hero-main">
            <h1>
              만들기 전엔 <span className="o">설계도</span>,<br />
              오픈 전엔 <span className="t">검수</span>.
            </h1>
            <div className="hero-rule" />
            <p className="sub">
              바이브코딩으로 사이트 만드는 사람을 위한 두 가지.<br />
              컨셉 한 줄이면 → 화면별 프롬프트·스펙팩 (Cursor·Claude Code에 바로).<br />
              URL 한 줄이면 → 오픈 전 검수 리포트.
            </p>
            <div className="hero-ctas">
              <Link className="btn btn-o" href="/signup">
                설계도 프롬프트 만들기 <span aria-hidden="true">→</span>
              </Link>
              <Link className="btn btn-teal" href="/verify">
                내 사이트 검수하기 <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="hero-art">
              <div className="art-card">
                <div className="art-head">02_IA_화면목록.xlsx · 화면 43개</div>
                <div className="art-row">
                  <span className="pid">PCPR1000</span>
                  <span>상품 목록 · 데이터 있음</span>
                  <span className="art-tag">자동</span>
                </div>
                <div className="art-row">
                  <span className="pid">PCPR1001</span>
                  <span>상품 목록 · 비어 있음</span>
                  <span className="art-tag ex">예외</span>
                </div>
                <div className="art-row">
                  <span className="pid">PCCA1001</span>
                  <span>장바구니 · 비어 있음</span>
                  <span className="art-tag ex">예외</span>
                </div>
                <div className="art-row">
                  <span className="pid">PCCH1002</span>
                  <span>결제 · 실패</span>
                  <span className="art-tag ex">예외</span>
                </div>
              </div>
              <div className="art-card">
                <div className="art-head">검수 결과 · 통과 9 · 실패 3</div>
                <div className="art-row">
                  <span className="pid">AUTO-02</span>
                  <span>모바일 대응</span>
                  <span className="art-tag pass">PASS</span>
                </div>
                <div className="art-row">
                  <span className="pid">AUTO-06</span>
                  <span>이미지 깨짐</span>
                  <span className="art-tag fail">FAIL</span>
                </div>
                <div className="art-row">
                  <span className="pid">SCN-01</span>
                  <span>로그인 · 재현 확인</span>
                  <span className="art-tag">직접</span>
                </div>
                <div className="art-row">
                  <span className="pid">SCN-02</span>
                  <span>결제 · 재현 확인</span>
                  <span className="art-tag">직접</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MOMENT BAND */}
      <section className="band">
        <div className="wrap">
          <div className="moment">
            <span className="num">01</span>
            <div>
              <div className="mt">만들기 전 — 설계도 프롬프트</div>
              <div className="ms">어떤 화면이 나올지 알고 시작</div>
            </div>
          </div>
          <div className="arrow" aria-hidden="true">
            →
          </div>
          <div className="moment">
            <span className="num">02</span>
            <div>
              <div className="mt">오픈 전 — 검수 시나리오</div>
              <div className="ms">진짜 다 되는지 알고 오픈</div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANNING */}
      <section className="sec" id="planning">
        <div className="wrap">
          <div className="sec-eye">
            <span className="idx">01</span>
            <span className="mono" style={{ textTransform: "none" }}>
              설계도 프롬프트
            </span>
          </div>
          <h2>
            한 줄 컨셉이<br />
            바로 만들 재료가 됩니다.
          </h2>
          <p className="lead">
            메뉴 구조·화면 목록·기능정의·흐름·일정까지 자동으로. 여기서 끝이 아니라{" "}
            <b>화면별 프롬프트와 AI 빌드 스펙팩</b>까지 나와, Cursor·Claude Code에 그대로 넣으면 화면이
            됩니다.
          </p>

          <div className="plan-grid">
            <div className="chip">
              <div className="ci">01 · XLSX</div>
              <div className="cn">메뉴 구조</div>
              <div className="cd">메뉴–화면 트리</div>
            </div>
            <div className="chip">
              <div className="ci">02 · XLSX</div>
              <div className="cn">IA 화면목록</div>
              <div className="cd">화면 + 화면별 프롬프트</div>
            </div>
            <div className="chip">
              <div className="ci">03 · XLSX</div>
              <div className="cn">기능정의서</div>
              <div className="cd">업무·기능·구성·유형</div>
            </div>
            <div className="chip">
              <div className="ci">04 · HTML</div>
              <div className="cn">FLOW 흐름도</div>
              <div className="cd">화면 이동 연결</div>
            </div>
            <div className="chip">
              <div className="ci">05 · XLSX</div>
              <div className="cn">WBS 일정</div>
              <div className="cd">화면별 개발 일정</div>
            </div>
            <div className="chip">
              <div className="ci">06 · MD</div>
              <div className="cn">AI 빌드 스펙팩</div>
              <div className="cd">넣고 한 마디면 끝</div>
            </div>
          </div>

          <div className="thesis">
            <div>
              <h3>
                AI는 <span className="o">잘 되는 화면</span>만 만들어요.
              </h3>
              <p>
                정작 서비스를 무너뜨리는 건 그 나머지예요. 어떤 화면을 빠뜨렸는지, 만들기 전에 알고
                시작하세요.
              </p>
            </div>
            <div className="ex-list">
              <div className="ex-item">
                <span className="x">✕</span> 장바구니 · 비어 있음
              </div>
              <div className="ex-item">
                <span className="x">✕</span> 결제 · 실패
              </div>
              <div className="ex-item">
                <span className="x">✕</span> 검색 · 결과 없음
              </div>
            </div>
          </div>

          {/* 위의 주장("AI는 잘 되는 화면만 만든다")을 바로 받는 증거.
              주장 → 증거 → 행동 순서가 되도록 CTA 바로 앞에 둔다. */}
          <div className="showcase">
            <div className="sc-cap">
              <b>설계도를 주면 이렇게 됩니다</b>
              <span>
                스펙팩 하나를 Claude Code에 넣고 돌린 기록이에요. 화면 144개가 약 40분 만에
                만들어졌고, 위에 적은 예외 화면들도 그 안에 들어 있어요.
              </span>
            </div>
            <div className="sc-frame">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${SHOWCASE_VIDEO_ID}`}
                title="설계도(AI 빌드 스펙팩)로 화면 144개를 만드는 기록"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>

          <div className="hero-ctas" style={{ marginTop: 36 }}>
            <Link className="btn btn-o" href="/signup">
              무료로 만들어보기 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* VERIFY (dark) */}
      <section className="verify" id="verify">
        <div className="wrap">
          <div className="sec-eye">
            <span className="idx">02</span>
            <span className="mono" style={{ textTransform: "none", color: "var(--teal)" }}>
              검수 시나리오
            </span>
          </div>
          <h2>
            진짜 다 되는지,<br />
            <span className="o">대신 눌러봐 드려요.</span>
          </h2>
          <p className="lead">
            기획으로 끝나는 도구는 여기까지 안 와요. URL이나 설계 문서를 넣으면 확인할 것을 시나리오로
            짚어주고, 공개 화면은 검수 결과(Pass/Fail)까지 냅니다. 개발자가 아니어도 읽는 리포트로요.
          </p>

          <div className="inputs">
            <div className="inbox">
              <div className="in-n">01 · 설계도 산출물</div>
              <div className="in-t">가장 정확</div>
              <div className="in-d">
                이 프로젝트로 만든 설계도를 그대로. 화면·요건을 100% 알아 시나리오가 촘촘해요.
              </div>
            </div>
            <div className="inbox">
              <div className="in-n">02 · 사이트 URL</div>
              <div className="in-t">검수 결과까지</div>
              <div className="in-d">
                실제 사이트를 넣으면 공개 화면 Pass/Fail 결과가 함께 나와요.
              </div>
              <div className="in-note">
                <span>⚠</span> 로그인·결제 화면은 자동 검수 대신 재현 시나리오로 드려요.
              </div>
            </div>
            <div className="inbox">
              <div className="in-n">03 · 외부 문서 (PPT·PDF)</div>
              <div className="in-t">시나리오 추출</div>
              <div className="in-d">
                화면설계서·기획서를 PDF로 내보내 넣으면 검수 시나리오를 뽑아드려요.
              </div>
              <div className="in-note">
                <span>⚠</span> 글이 적혀 있을수록 정확해요. 문서만으론 시나리오까지.
              </div>
            </div>
          </div>

          <div className="verify-flow">
            <div className="split">
              <div className="split-row pub">
                <div className="ico">공개</div>
                <div>
                  <div className="sr-t">누구나 보는 화면</div>
                  <div className="sr-d">우리가 검수까지 — Pass / Fail</div>
                </div>
              </div>
              <div className="split-row sec">
                <div className="ico">민감</div>
                <div>
                  <div className="sr-t">로그인 · 결제 화면</div>
                  <div className="sr-d">확인 방법을 재현 시나리오로</div>
                </div>
              </div>
            </div>
            <div className="report">
              <div className="rh">
                <span>검수 결과 · caffeinecolor.com</span>
                <span>공개 12화면</span>
              </div>
              <div className="rb">
                <div className="rstat">
                  <div className="s p">
                    <div className="sl">Pass</div>
                    <div className="sv">9</div>
                  </div>
                  <div className="s f">
                    <div className="sl">Fail</div>
                    <div className="sv">3</div>
                  </div>
                </div>
                <div className="rfail" style={{ borderTop: "none" }}>
                  ✕ 모바일에서 신청 버튼이 화면 밖으로 나감
                </div>
                <div className="rfail">✕ &lsquo;장바구니 비어 있음&rsquo; 화면 없음</div>
                <div className="rfail">✕ /free 대표 이미지 깨짐</div>
              </div>
            </div>
          </div>

          {/* 검수 산출물 — 받는 것 */}
          <div className="sec-eye" style={{ marginTop: 48 }}>
            <span className="idx" style={{ color: "var(--teal)" }}>
              ✓
            </span>
            <span className="mono" style={{ textTransform: "none", color: "var(--teal)" }}>
              이런 산출물을 받아요
            </span>
          </div>
          <div className="vout">
            <div className="vchip">
              <div className="vc-h">검수 현황</div>
              <div className="vc-d">통과·실패·주의 한눈에</div>
            </div>
            <div className="vchip">
              <div className="vc-h">자동 검사 리포트</div>
              <div className="vc-d">항목마다 UI·기능 구분</div>
            </div>
            <div className="vchip">
              <div className="vc-h">재현 시나리오</div>
              <div className="vc-d">공개·로그인·결제 확인 순서</div>
            </div>
            <div className="vchip">
              <div className="vc-h">엑셀 결과서</div>
              <div className="vc-d">표지·현황·시나리오 한 벌</div>
            </div>
          </div>

          <div className="hero-ctas" style={{ marginTop: 36 }}>
            <Link className="btn btn-teal" href="/verify">
              내 사이트 검수하기 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* TEMPLATES */}
      <section className="tpls" id="templates">
        <div className="wrap">
          <div className="sec-eye">
            <span className="idx">03</span>
            <span className="mono" style={{ textTransform: "none" }}>
              AI팩
            </span>
          </div>
          <h2 style={{ textWrap: "normal" }}>
            바로 사용하는<br />
            설계도 프롬프트 AI팩
          </h2>
          <p className="lead">
            직접 만들기 전에, 이미 완성된 업종별 산출물 한 벌부터. 화면·예외까지 다 들어 있어요.
          </p>
          <div className="tpl-grid">
            <Link className="tpl" href="/packages">
              <div className="tm">LMS</div>
              <div className="tt">온라인 강의 플랫폼</div>
              <div className="td">수강·결제·수료까지 화면 37개 + 프롬프트.</div>
              <div className="tp">49,000원부터</div>
            </Link>
            <Link className="tpl" href="/packages">
              <div className="tm">BEAUTY</div>
              <div className="tt">뷰티샵 예약 플랫폼</div>
              <div className="td">예약·디자이너·정산까지 화면 43개 + 프롬프트.</div>
              <div className="tp">49,000원부터</div>
            </Link>
            <Link className="tpl" href="/packages">
              <div className="tm">TRAVEL</div>
              <div className="tt">해외 투어·티켓 예약</div>
              <div className="td">예약·바우처·환불까지 화면 43개 + 프롬프트.</div>
              <div className="tp">49,000원부터</div>
            </Link>
          </div>
        </div>
      </section>

      {/* MOAT */}
      <section className="moat">
        <div className="wrap">
          <h2>
            바이브코딩으로 원하는 사이트 <span className="o">만들고</span>,<br />
            <span className="t">오픈할 준비</span> 되셨나요?
          </h2>
          <p>
            AI는 편리하고 빠르죠. 하지만 원하는 대로 나왔는지, 정말 오픈해도 되는지 하나씩 눌러보는
            건 결국 우리 몫이에요. 내 서비스, 내 사이트잖아요 — 어떤 화면이 만들어질지 알고 만들고,
            진짜 오픈해도 되는지 꼭 확인해보세요.
          </p>
          <div className="fc">
            <Link className="btn btn-o" href="/signup">
              설계도 프롬프트 만들기 <span aria-hidden="true">→</span>
            </Link>
            <Link className="btn btn-teal" href="/verify">
              내 사이트 검수하기 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .cc {
          --paper: #ece1c7;
          --paper-2: #f4ecd8;
          --card: #fbf6e9;
          --ink: #20261c;
          --ink-soft: #4e4a3b;
          --orange: #e4762c;
          --orange-deep: #c25d17;
          --teal: #1aa48f;
          --teal-deep: #0e6f60;
          --green: #16241d;
          --green-2: #1e3228;
          --green-line: #2e4437;
          --tan: #9a8c68;
          --paper-line: #d9cca8;
          --mono: ui-monospace, "SFMono-Regular", "Menlo", "Consolas", monospace;
          background: var(--paper);
          color: var(--ink);
          line-height: 1.6;
        }
        .cc * {
          box-sizing: border-box;
        }
        .cc :global(a) {
          text-decoration: none;
        }
        .wrap {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 28px;
        }
        .mono {
          letter-spacing: 0.03em;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--tan);
        }
        .cc :global(.btn) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 16px;
          padding: 14px 22px;
          border-radius: 2px;
          transition: transform 0.12s ease, background 0.12s ease;
        }
        .cc :global(.btn):active {
          transform: translateY(1px);
        }
        .cc :global(.btn-o) {
          background: var(--orange);
          color: #fcf3e2;
        }
        .cc :global(.btn-o):hover {
          background: var(--orange-deep);
        }
        .cc :global(.btn-teal) {
          background: var(--teal);
          color: #f1fbf8;
        }
        .cc :global(.btn-teal):hover {
          background: var(--teal-deep);
        }
        .cc h1,
        .cc h2,
        .cc h3 {
          font-weight: 700;
          letter-spacing: -0.02em;
          text-wrap: balance;
          line-height: 1.04;
        }
        .cc section {
          position: relative;
        }

        /* HERO */
        .hero {
          padding: 20px 0 30px;
          overflow: hidden;
        }
        .hero-main {
          padding-top: 34px;
        }
        .hero h1 {
          font-size: clamp(44px, 8.4vw, 96px);
          line-height: 0.98;
          font-weight: 800;
        }
        .hero h1 .o {
          color: var(--orange);
        }
        .hero h1 .t {
          color: var(--teal-deep);
        }
        .hero-rule {
          width: 56px;
          height: 4px;
          background: var(--ink);
          margin: 26px 0 20px;
        }
        .hero p.sub {
          font-size: clamp(15px, 1.9vw, 19px);
          font-weight: 400;
          color: var(--ink-soft);
          max-width: 720px;
        }
        .hero-ctas {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 28px;
        }
        .hero-art {
          margin-top: 40px;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 18px;
          align-items: end;
        }
        @media (max-width: 760px) {
          .hero-art {
            grid-template-columns: 1fr;
          }
        }
        .art-card {
          background: var(--card);
          border: 1px solid var(--paper-line);
          border-radius: 6px;
          overflow: hidden;
        }
        .art-head {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: var(--paper-2);
          border-bottom: 1px solid var(--paper-line);
          font-size: 12px;
          color: #8a7c58;
          letter-spacing: 0.02em;
        }
        .art-row {
          display: flex;
          gap: 10px;
          padding: 9px 14px;
          font-size: 13.5px;
          border-top: 1px solid #f0e7cf;
        }
        .art-row:first-of-type {
          border-top: none;
        }
        .art-row .pid {
          font-family: var(--mono);
          color: var(--orange-deep);
          font-size: 12.5px;
        }
        .art-tag {
          margin-left: auto;
          font-size: 11.5px;
          font-weight: 600;
          padding: 1px 8px;
          border-radius: 2px;
          background: #efe6ce;
          color: #8a7c58;
        }
        .art-tag.ex {
          background: #f7e0ce;
          color: #b4551e;
        }
        .art-tag.pass {
          background: #d7efe9;
          color: #0e6f60;
        }
        .art-tag.fail {
          background: #f7d9d2;
          color: #b4241e;
        }
        /* MOMENT BAND */
        .band {
          background: var(--ink);
          color: var(--paper);
        }
        .band .wrap {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 24px;
          align-items: center;
          padding: 26px 28px;
        }
        .moment {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .moment .num {
          font-family: var(--mono);
          font-size: 13px;
          color: var(--orange);
          letter-spacing: 0.1em;
        }
        .moment .mt {
          font-size: 22px;
          font-weight: 700;
        }
        .moment .ms {
          font-size: 14px;
          color: #c9c2ad;
          font-weight: 400;
        }
        .band .arrow {
          font-size: 26px;
          color: var(--tan);
        }
        @media (max-width: 720px) {
          .band .wrap {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .band .arrow {
            display: none;
          }
        }

        /* SECTION shared */
        .sec {
          padding: 96px 0;
        }
        .sec-eye {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }
        .sec-eye .idx {
          font-family: var(--mono);
          font-size: 13px;
          color: var(--orange);
        }
        .sec h2 {
          font-size: clamp(34px, 5vw, 58px);
          line-height: 1.14;
        }
        .lead {
          font-size: 19px;
          font-weight: 400;
          color: var(--ink-soft);
          /* 세 섹션 리드가 각각 2줄·2줄·1줄로 떨어지는 폭 */
          max-width: 760px;
          margin-top: 16px;
        }

        /* PLANNING */
        .plan-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-top: 40px;
        }
        .chip {
          background: var(--card);
          border: 1px solid var(--paper-line);
          border-radius: 6px;
          padding: 16px 16px 18px;
        }
        .chip .ci {
          font-family: var(--mono);
          font-size: 11px;
          color: var(--tan);
          margin-bottom: 10px;
        }
        .chip .cn {
          font-size: 16.5px;
          font-weight: 700;
        }
        .chip .cd {
          font-size: 13px;
          color: var(--ink-soft);
          margin-top: 5px;
          font-weight: 400;
          line-height: 1.5;
        }
        /* 시연 영상 — 주장 바로 뒤에 붙는 증거 */
        .showcase {
          margin-top: 40px;
        }
        .sc-cap {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }
        .sc-cap b {
          font-size: 19px;
          font-weight: 800;
        }
        .sc-cap span {
          font-size: 16px;
          font-weight: 400;
          color: var(--ink-soft);
          max-width: 760px;
          line-height: 1.6;
        }
        .sc-frame {
          position: relative;
          aspect-ratio: 16 / 9;
          border: 1px solid var(--paper-line);
          border-radius: 14px;
          overflow: hidden;
          background: #000;
        }
        .sc-frame iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }

        .thesis {
          margin-top: 40px;
          background: var(--ink);
          color: var(--paper);
          border-radius: 8px;
          padding: 34px 32px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 26px;
          align-items: center;
        }
        @media (max-width: 720px) {
          .thesis {
            grid-template-columns: 1fr;
          }
        }
        .thesis h3 {
          font-size: 26px;
          line-height: 1.2;
        }
        .thesis h3 .o {
          color: var(--orange);
        }
        .thesis p {
          font-size: 15px;
          color: #c9c2ad;
          font-weight: 400;
          margin-top: 10px;
          max-width: 440px;
        }
        .ex-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 230px;
        }
        .ex-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #e7a985;
          background: var(--green-2);
          border-radius: 4px;
          padding: 9px 12px;
        }
        .ex-item .x {
          color: var(--orange);
        }
        /* VERIFY (dark) */
        .verify {
          background: var(--green);
          color: #efe9d9;
          padding: 100px 0;
        }
        .verify .sec-eye .idx {
          color: var(--teal);
        }
        .verify h2 {
          color: #f4eedd;
          font-size: clamp(34px, 5vw, 58px);
        }
        .verify h2 .t {
          color: var(--teal);
        }
        .verify h2 .o {
          color: var(--orange);
        }
        .verify .lead {
          color: #a7b8ad;
        }
        .inputs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
          margin-top: 44px;
        }
        .inbox {
          background: var(--green-2);
          border: 1px solid var(--green-line);
          border-radius: 8px;
          padding: 20px;
        }
        .inbox .in-n {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--teal);
          letter-spacing: 0.03em;
          margin-bottom: 12px;
        }
        .inbox .in-t {
          font-size: 18px;
          font-weight: 700;
        }
        .inbox .in-d {
          font-size: 13.5px;
          color: #9db3a6;
          font-weight: 400;
          margin-top: 8px;
          line-height: 1.55;
        }
        .inbox .in-note {
          font-size: 12px;
          color: #e7a985;
          margin-top: 12px;
          display: flex;
          gap: 6px;
          align-items: flex-start;
        }
        .verify-flow {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 24px;
          margin-top: 44px;
          align-items: stretch;
        }
        @media (max-width: 820px) {
          .verify-flow {
            grid-template-columns: 1fr;
          }
        }
        .split {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .split-row {
          flex: 1;
          display: flex;
          gap: 12px;
          align-items: center;
          background: var(--green-2);
          border: 1px solid var(--green-line);
          border-radius: 8px;
          padding: 16px 18px;
        }
        .split-row .ico {
          width: 34px;
          height: 34px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12.5px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .split-row.pub .ico {
          background: #123a2c;
          color: var(--teal);
        }
        .split-row.sec .ico {
          background: #3a2417;
          color: var(--orange);
        }
        .split-row .sr-t {
          font-size: 16px;
          font-weight: 700;
        }
        .split-row .sr-d {
          font-size: 13px;
          color: #9db3a6;
          font-weight: 400;
          margin-top: 3px;
        }
        .report {
          background: #12201a;
          border: 1px solid var(--green-line);
          border-radius: 10px;
          overflow: hidden;
        }
        .report .rh {
          padding: 12px 16px;
          font-size: 12.5px;
          color: #7fae99;
          border-bottom: 1px solid var(--green-line);
          display: flex;
          justify-content: space-between;
        }
        .report .rb {
          padding: 18px 16px;
        }
        .rstat {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        .rstat .s {
          flex: 1;
          border-radius: 8px;
          padding: 12px 14px;
        }
        .rstat .s.p {
          background: #123a2a;
        }
        .rstat .s.f {
          background: #3a2018;
        }
        .rstat .s .sl {
          font-size: 12px;
        }
        .rstat .s.p .sl {
          color: #57c79e;
        }
        .rstat .s.f .sl {
          color: #f0997b;
        }
        .rstat .s .sv {
          font-size: 30px;
          font-weight: 700;
          line-height: 1.1;
        }
        .rstat .s.p .sv {
          color: #8fe3c6;
        }
        .rstat .s.f .sv {
          color: #f5b49e;
        }
        .rfail {
          font-size: 13px;
          color: #e89b7e;
          display: flex;
          gap: 8px;
          align-items: center;
          padding: 6px 0;
          border-top: 1px solid #1e3228;
        }
        .vout {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-top: 18px;
        }
        .vchip {
          background: var(--green-2);
          border: 1px solid var(--green-line);
          border-radius: 8px;
          padding: 16px;
        }
        .vchip .vc-h {
          font-size: 15px;
          font-weight: 700;
          color: #efe9d9;
        }
        .vchip .vc-d {
          font-size: 12.5px;
          font-weight: 400;
          color: #9db3a6;
          margin-top: 5px;
        }
        /* TEMPLATES */
        .tpls {
          padding: 90px 0;
          background: var(--paper-2);
        }
        .tpls h2 {
          font-size: clamp(34px, 5vw, 58px);
        }
        .tpl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-top: 38px;
        }
        .cc :global(.tpl) {
          background: var(--card);
          color: var(--ink);
          border: 1px solid var(--paper-line);
          border-radius: 8px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: transform 0.12s ease, border-color 0.12s ease;
        }
        .cc :global(.tpl):hover {
          transform: translateY(-2px);
          border-color: var(--orange);
        }
        .cc :global(.tpl) .tt {
          font-size: 20px;
          font-weight: 700;
        }
        .cc :global(.tpl) .tm {
          font-family: var(--mono);
          font-size: 11.5px;
          color: var(--tan);
        }
        .cc :global(.tpl) .td {
          font-size: 14px;
          color: var(--ink-soft);
          font-weight: 400;
          margin-top: 6px;
          line-height: 1.55;
        }
        .cc :global(.tpl) .tp {
          margin-top: 14px;
          font-weight: 700;
          font-size: 17px;
          color: var(--orange-deep);
        }

        /* MOAT */
        .moat {
          padding: 100px 0;
          text-align: center;
        }
        .moat h2 {
          font-size: clamp(34px, 5vw, 58px);
          max-width: none;
          margin: 0 auto;
        }
        .moat h2 .o {
          color: var(--orange);
        }
        .moat h2 .t {
          color: var(--teal-deep);
        }
        .moat p {
          font-size: 17px;
          color: var(--ink-soft);
          font-weight: 400;
          /* 마무리 문단이 2줄로 떨어지는 폭 */
          max-width: 780px;
          margin: 22px auto 0;
          line-height: 1.7;
        }
        .fc {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 30px;
        }
      `}</style>
    </div>
  );
}
