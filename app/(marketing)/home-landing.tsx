"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SHOWCASE_VIDEO_ID } from "@/lib/site";
import type { AiPackCard } from "@/lib/packages";

// 한 업종이 4등급이라 2개씩 넘긴다. 3개씩이면 둘째 장에 한 개만 남아,
// 특히 모바일에서 그 한 개가 첫 장 높이만큼 늘어나 보였다.
const PER_PAGE = 2;
const ROLL_MS = 5000;


// 카페인컬러 메인 — 승인된 레트로모던 시안(홈페이지_리디자인_시안/template.html)을
// 실제 페이지로 이관한 것. 스타일은 styled-jsx로 이 컴포넌트에만 스코프된다
// (일반 element 선택자 section/h2/a 등이 다른 페이지로 새지 않게).
// 상단 네비·하단 푸터는 마케팅 레이아웃(SiteHeader/footer)이 담당하므로 여기선 본문만.
export function HomeLanding({ packs }: { packs: AiPackCard[] }) {
  // 진열 중인 팩을 PER_PAGE개씩 굴린다(지금은 2업종×4등급=8장 → 4페이지).
  // 마우스를 올리면 멈춰서 읽을 시간을 준다.
  const pageCount = Math.max(1, Math.ceil(packs.length / PER_PAGE));
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || pageCount < 2) return;
    const t = setInterval(() => setPage((p) => (p + 1) % pageCount), ROLL_MS);
    return () => clearInterval(t);
  }, [paused, pageCount]);

  return (
    <div className="cc">
      {/* HERO */}
      <section className="hero" id="top">
        <div className="wrap">
          <div className="hero-main">
            {/* 첫 화면 오른쪽이 통째로 비어 있었다 — 글이 왼쪽에 다 몰려 있고
                1440 에서 640px 가량이 빈 종이였다(2026-08-25 사장님 지시로 캐릭터를 넣었다).
                ⚠ h1 은 clamp(44px, 8.4vw, 96px)라 «칸이 좁아져도 안 줄어든다».
                   좁은 화면에서 옆으로 세우면 제목이 칸 밖으로 삐져나간다 —
                   그래서 1180px 아래로는 CTA «밑»으로 내려 보낸다. */}
            <div className="hero-top">
              <div className="hero-copy">
                <h1>
                  만들기 전엔 <span className="o">설계도</span>,<br />
                  오픈 전엔 <span className="t">검수</span>.
                </h1>
                <div className="hero-rule" />
                <p className="sub">
                  바이브코딩으로 사이트 만드는 사람을 위한 두 가지.<br />
                  컨셉 한 줄이면 → 화면별 프롬프트와 AI 빌드 지시서 (Cursor·Claude Code에 바로).<br />
                  URL 한 줄이면 → 오픈 전 검수 결과서.
                </p>
                <div className="hero-ctas">
                  {/* /dashboard/new는 열리는 즉시 새 프로젝트를 만드는 라우트라,
                      프리페치가 켜져 있으면 마우스만 올려도 프로젝트가 생긴다. */}
                  {/* 첫 화면에 "무료"가 없으면 값이 드는지 안 드는지 모르는 채로 누르게 된다.
                      가입 시 35크레딧이 있어 만들고 미리보기까지는 값을 안 받는다 — 그 말을 여기서 한다. */}
                  <Link className="btn btn-o" href="/dashboard/new" prefetch={false}>
                    AI팩 만들기 <span aria-hidden="true">→</span>
                  </Link>
                  <Link className="btn btn-teal" href="/verify">
                    내 사이트 검수하기 <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>

              {/* 첫 화면 그림은 «가장 먼저» 눈에 들어와야 해서 priority 를 준다.
                  이것만 lazy 로 두면 접속하자마자 오른쪽이 잠깐 비어 보인다. */}
              <div className="hero-figure">
                <Image
                  src="/character/01_home_hero_blueprint_qa.webp"
                  alt="설계도를 들고 화면을 검수하는 카페인컬러 캐릭터"
                  width={1200}
                  height={1161}
                  priority
                  sizes="(max-width: 1180px) 320px, 520px"
                />
              </div>
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
              <div className="mt">만들기 전 — AI팩</div>
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
              AI팩 만들기
            </span>
          </div>
          {/* 글만 있던 자리 — 「한 줄이 여섯 가지로 나온다」를 말로만 하고 있었다.
              그림이 그 여섯 갈래를 그대로 보여 준다(2026-08-25).
              ⚠ 제목까지 «같은 칸»에 넣는다. 리드 글만 넣었더니 두 줄짜리 글이 400px
                 그림 키에 맞춰 가운데로 내려가, 제목 밑이 200px 넘게 휑했다. */}
          <div className="plan-intro">
            <div>
              <h2>
                한 줄 컨셉이<br />
                바로 만들 재료가 됩니다.
              </h2>
              <p className="lead">
                메뉴 구조·화면 목록·기능정의·흐름·일정까지 자동으로. 여기서 끝이 아니라{" "}
                <b>화면별 프롬프트와 AI 빌드 지시서</b>까지 나와, Cursor·Claude Code에 그대로 넣으면
                화면이 됩니다.
              </p>
            </div>
            <div className="plan-figure">
              <Image
                src="/character/02_home_concept_to_aipack.webp"
                alt="한 줄 컨셉을 메뉴·화면 목록·기능정의·흐름·일정으로 뽑아내는 카페인컬러 캐릭터"
                width={1000}
                height={1000}
                sizes="(max-width: 999px) 300px, 400px"
              />
            </div>
          </div>

          <div className="plan-grid">
            <div className="chip">
              <div className="ci">01 · XLSX</div>
              <div className="cn">메뉴 구조</div>
              <div className="cd">메뉴–화면 트리</div>
            </div>
            <div className="chip">
              <div className="ci">02 · XLSX</div>
              <div className="cn">화면 목록</div>
              <div className="cd">화면 하나하나 + AI 프롬프트</div>
            </div>
            <div className="chip">
              <div className="ci">03 · XLSX</div>
              <div className="cn">기능정의서</div>
              <div className="cd">화면마다 뭘 해야 하는지</div>
            </div>
            <div className="chip">
              <div className="ci">04 · HTML</div>
              <div className="cn">FLOW 흐름도</div>
              <div className="cd">화면 이동 연결</div>
            </div>
            <div className="chip">
              <div className="ci">05 · XLSX</div>
              <div className="cn">개발 일정표</div>
              <div className="cd">화면별 개발 일정</div>
            </div>
            <div className="chip">
              <div className="ci">06 · MD</div>
              <div className="cn">AI 빌드 지시서</div>
              <div className="cd">넣고 한 마디면 끝</div>
            </div>
          </div>

          {/* 「AI는 잘 되는 화면만 만든다」는 우리 주장이었는데, 이제 재 본 기록이 있다
              (2026-08-08). 같은 컨셉 한 줄을 다른 AI 기획 도구에 넣었더니 화면 22개가
              나왔고 그 안에 안 되는 길이 하나도 없었다.

              여기에 우리 숫자(133개·61개)를 적지 않는 이유: 그 도구의 실사용 후기 중
              가장 잦은 불만이 "AI가 과도하게 방대한 내용을 생성한다"였다. 양을 자랑하면
              같은 화살을 우리가 맞는다. 파는 것은 분량이 아니라 「빠짐없음」이다.

              경쟁사 이름도 쓰지 않는다 — 비교광고가 되면 우리가 감당할 수 없다. */}
          <div className="thesis">
            <div>
              <h3>
                같은 컨셉 한 줄을 <span className="o">다른 AI 기획 도구</span>에도 넣어봤어요.
              </h3>
              <p>
                돌아온 화면 목록에 이런 게 없었어요. 손님이 볼 화면은 그럴듯했는데, 정작 내가 매일
                열어야 할 화면이 통째로 비어 있었습니다.
              </p>
            </div>
            {/* 「빠진 화면」을 그림으로 — 칸이 뚫린 화면들이 그 말 그대로다.
                ⚠ 좁을 때는 display:none 이라 «칸 자체가 없어진다». 그래야 지금까지의
                   두 칸(글 + ✕목록)이 한 자도 안 밀린다. 폭을 0으로 줄이는 식으로 하면
                   gap 이 남아 두 칸 사이가 벌어진다. */}
            <div className="thesis-figure">
              <Image
                src="/character/03_home_missing_screens.webp"
                alt="화면 목록에서 군데군데 빠져 있는 칸을 가리키는 카페인컬러 캐릭터"
                width={900}
                height={600}
                sizes="280px"
              />
            </div>
            <div className="ex-list">
              <div className="ex-item">
                <span className="x">✕</span> 팝업을 등록할 화면
              </div>
              <div className="ex-item">
                <span className="x">✕</span> 예약을 승인할 화면
              </div>
              <div className="ex-item">
                <span className="x">✕</span> 정산 화면
              </div>
              <div className="ex-item">
                <span className="x">✕</span> 검색 · 결과 없음
              </div>
              <div className="ex-item">
                <span className="x">✕</span> 저장함 · 비어 있음
              </div>
            </div>
            <p className="thesis-note">
              ＊ 팝업스토어 앱 컨셉 한 줄로 직접 비교했어요(2026년 8월). 그 도구가 낸 관리자
              화면은 「콘텐츠 관리」 하나뿐이었고, 화면마다 AI에 넣을 프롬프트는 없었습니다.
            </p>
          </div>
        </div>
      </section>

      {/* PROOF — 「무엇이 들어 있나」에서 「실제로 돌려봤다」로 이야기가 바뀌는 자리.
          왜 쪼갰나 (2026-08-14 사장님 지시): 위 절 하나가 2,261px, 1440 화면으로 세 장이었다.
          중간에 쉼표가 없으니 스크롤만 흐르고 읽히지 않는다. 여기서 배경색을 바꾸고
          눈표를 하나 더 세워 «장이 바뀐다»를 눈으로 알린다.

          ⚠ 번호(01·02·03)는 일부러 안 붙였다. 위쪽 띠의 「01 만들기 전 / 02 오픈 전」과
          아래 절 번호가 지금 딱 맞물려 있다. 여기에 번호를 끼우면 그 짝이 통째로 밀린다. */}
      <section className="sec sec-proof" id="proof">
        <div className="wrap">
          <div className="sec-eye">
            <span className="mono" style={{ textTransform: "none" }}>
              직접 돌려봤어요
            </span>
          </div>

          {/* 위의 주장("AI는 잘 되는 화면만 만든다")을 바로 받는 증거.
              주장 → 증거 → 행동 순서가 되도록 CTA 바로 앞에 둔다.

              머리글을 sc-cap(19px)에서 h2 로 올렸다(2026-08-14). 절이 갈라지면서
              이 절의 제일 큰 글자가 19px 이 되어 버렸는데, 옆 절 제목이 58px 이라
              혼자 «잘린 조각»처럼 보였다. 문장은 그대로 옮겨 왔고 새로 짓지 않았다. */}
          <h2>
            AI팩을 주면<br />
            <span className="o">이렇게 됩니다.</span>
          </h2>
          {/* 바로 위 절에서 「빠진 것」으로 말해 놓고 여기서 144개를 자랑하면 힘이 상쇄된다.
              숫자를 근거가 아니라 배경으로 밀어낸다 — 앞에 오는 것은 「빠뜨린 화면까지」다. */}
          <p className="lead">
            지시서 파일 하나를 Claude Code에 넣고 돌린 기록이에요. 위에 적은 빠지기 쉬운 화면까지
            한 벌로 넣어 돌렸고, 약 40분 만에 화면 144개가 만들어졌습니다.
          </p>

          <div className="showcase">
            {/* 영상 왼쪽 — 「스펙팩 한 벌 → 화면 여러 장」을 그림이 먼저 말한다.
                영상은 눌러야 보이지만 그림은 스치기만 해도 읽힌다. */}
            <div className="sc-figure">
              <Image
                src="/character/04_home_spec_to_screens.webp"
                alt="스펙팩 한 벌을 넣어 화면을 잔뜩 만들어 내는 카페인컬러 캐릭터"
                width={1000}
                height={1000}
                sizes="(max-width: 1023px) 280px, 340px"
              />
            </div>
            <div className="sc-frame">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${SHOWCASE_VIDEO_ID}`}
                title="AI팩(빌드 지시서)으로 화면 144개를 만드는 기록"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>

          {/* 만든 뒤에 막히는 자리 — 2026-08-10.
              화면까지 만들어 드려도 「내 컴퓨터에서만 보인다」에서 멈추시는 분이 많다.
              팔려고 넣는 것이 아니라 «도움이 되면 좋겠다»는 뜻으로 둔다. */}
          {/* 만든 뒤에 막히는 자리 — 결과물에 함께 들어가는 안내서.
              이 섹션의 어휘를 그대로 쓴다: 폭을 꽉 채우고, 카드 배경 + 종이선 테두리,
              모서리 6px, 위 여백 40px. 혼자 다른 모양이면 곁다리로 보인다(2026-08-10). */}
          <div className="ship">
            <div className="ship-hd">
              <span className="ship-tag">함께 드려요</span>
              <h3>만들고 나서 막히는 자리도 적어 뒀어요</h3>
              <p>
                화면은 다 만들었는데 <b>내 컴퓨터에서만 보이는</b> 데서 멈추시는 분이 많습니다.
                저희도 거기서 한참 헤맸어요. 그때 알게 된 것을{" "}
                <b>「만든 사이트를 세상에 내놓는 법」</b>으로 정리해 결과물에 함께 넣었습니다.
              </p>
            </div>
            <ul className="ship-list">
              <li>세상에 올리기 · 도메인 · 자물쇠(HTTPS)</li>
              <li>회원가입·로그인 · 데이터 저장</li>
              <li>결제 받기 — 심사 두 달 동안 할 일</li>
              <li>사진·영상 · AI 기능 붙이기</li>
              <li>잘못 올렸을 때 되돌리기</li>
              <li>오픈 전 마지막 점검표</li>
            </ul>
          </div>

          <div className="hero-ctas" style={{ marginTop: 36 }}>
            <Link className="btn btn-o" href="/dashboard/new" prefetch={false}>
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
          {/* 어두운 절이라 검은 머리가 묻힐까 걱정했는데, 재 보니 오히려 크림색 소품
              (통과·실패·주의 창)이 도드라진다. 이 절이 말하는 것과 그림이 같다.
              ⚠ 위 「한 줄 컨셉」 절과 같은 까닭으로 제목을 같은 칸에 넣는다. */}
          <div className="verify-intro">
            <div>
              <h2>
                진짜 다 되는지,<br />
                <span className="o">대신 눌러봐 드려요.</span>
              </h2>
              <p className="lead">
                기획으로 끝나는 도구는 여기까지 안 와요. URL이나 설계 문서를 넣으면 확인할 것을
                시나리오로 짚어주고, 공개 화면은 검수 결과(Pass/Fail)까지 냅니다. 개발자가 아니어도 읽는
                결과서로요.
              </p>
            </div>
            <div className="verify-figure">
              <Image
                src="/character/05_home_site_inspection.webp"
                alt="공개 화면을 통과·실패·주의로 가려 검수하는 카페인컬러 캐릭터"
                width={1000}
                height={1000}
                sizes="(max-width: 999px) 300px, 380px"
              />
            </div>
          </div>

          <div className="inputs">
            <div className="inbox">
              <div className="in-n">01 · 카페인컬러 AI팩</div>
              <div className="in-t">가장 정확</div>
              <div className="in-d">
                이 프로젝트로 만든 AI팩을 그대로. 화면·요건을 100% 알아 시나리오가 촘촘해요.
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
              {/* 예시 도메인은 남의 것도 우리 것도 아닌 가상의 주소를 쓴다.
                  우리 주소를 쓰면 아래 실패 세 줄이 검수 예시가 아니라
                  "이 사이트는 지금 이렇게 망가져 있다"로 읽힌다. */}
              <div className="rh">
                <span>검수 결과 · myshop.co.kr</span>
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
                <div className="rfail">✕ 상품 목록 대표 이미지 깨짐</div>
              </div>
            </div>
          </div>

          {/* 검수 결과물 — 받는 것 */}
          <div className="sec-eye" style={{ marginTop: 48 }}>
            <span className="idx" style={{ color: "var(--teal)" }}>
              ✓
            </span>
            <span className="mono" style={{ textTransform: "none", color: "var(--teal)" }}>
              이런 결과물을 받아요
            </span>
          </div>
          <div className="vout">
            <div className="vchip">
              <div className="vc-h">검수 현황</div>
              <div className="vc-d">통과·실패·주의 한눈에</div>
            </div>
            <div className="vchip">
              <div className="vc-h">자동 검사 결과서</div>
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
              AI팩 구매
            </span>
          </div>
          <h2 style={{ textWrap: "normal" }}>
            바로 사용하는<br />
            업종별 AI팩
          </h2>
          <p className="lead">
            직접 만들기 전에, 이미 완성된 업종별 결과물 한 벌부터. 화면·예외까지 다 들어 있어요.
          </p>
          <div
            className="tpl-roll"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="tpl-vp">
              <div className="tpl-track" style={{ transform: `translateX(-${page * 100}%)` }}>
                {Array.from({ length: pageCount }, (_, i) => (
                  <div className="tpl-page" key={i} aria-hidden={i !== page}>
                    {packs.slice(i * PER_PAGE, i * PER_PAGE + PER_PAGE).map((p) => (
                      <Link className="tpl" href={p.href} key={p.href}>
                        <div className="tg">{p.planName}</div>
                        <div className="tt">{p.title}</div>
                        <div className="td">{p.depthLabel}</div>
                        {/* 무엇이 들어 있는지 — 목록 페이지와 같은 출처(planContents). */}
                        <ul className="tl">
                          {p.contents.map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                        <div className="tp">{p.price}</div>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="tpl-foot">
              <div className="tpl-dots">
                {Array.from({ length: pageCount }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={i === page ? "on" : ""}
                    aria-label={`AI팩 ${i + 1}페이지 보기`}
                    aria-current={i === page}
                    onClick={() => setPage(i)}
                  />
                ))}
              </div>
              <Link className="btn btn-line" href="/packages">
                AI팩 더보기 <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MOAT */}
      <section className="moat">
        <div className="wrap">
          {/* 마무리 절에도 눈표를 하나 세운다(2026-08-14). 앞 절이 AI팩 카드 목록이라
              바로 다음에 큰 질문이 튀어나오면 «아직 카드 얘기인가» 싶다.
              번호는 안 붙인다 — 파는 이야기가 아니라 맺음말이다. */}
          <div className="sec-eye moat-eye">
            <span className="mono" style={{ textTransform: "none" }}>
              마지막으로
            </span>
          </div>
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
            <Link className="btn btn-o" href="/dashboard/new" prefetch={false}>
              AI팩 만들기 <span aria-hidden="true">→</span>
            </Link>
            <Link className="btn btn-teal" href="/verify">
              내 사이트 검수하기 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .cc {
          --paper: #eae8de;
          --paper-2: #f4f3ee;
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
          --paper-line: #d8d4c6;
          --mono: ui-monospace, "SFMono-Regular", "Menlo", "Consolas", monospace;
          background: var(--paper);
          color: var(--ink);
          line-height: 1.6;
          /* 한글은 낱말 «가운데»에서 끊지 않는다.
             기본값(normal)이면 브라우저가 글자 사이 아무 데서나 줄을 바꾼다 —
             폰에서 제목이 「만들기 전 / 엔 설계도」로 끊겨 있었다(2026-08-11).
             overflow-wrap 은 안전망이다. 띄어쓰기 없는 긴 것(주소 같은 것)이
             왔을 때 keep-all 만 있으면 화면 밖으로 삐져나간다. */
          word-break: keep-all;
          overflow-wrap: break-word;
        }
        .cc * {
          box-sizing: border-box;
        }
        .cc :global(a) {
          text-decoration: none;
        }
        /* 머리말·꼬리말과 «같은 자리»에 선다.
           (marketing)/layout.tsx 가 max-w-[1440px] + px-6(24px) 이라 글이 서는 자리가
           1392px 다. 여기만 1180/28 로 두었더니 1440 화면에서 로고는 왼쪽 24px 인데
           본문은 122px 에서 시작했다 — 98px 어긋나 보였다(2026-08-11 사장님 지적).
           ⚠ 두 값은 늘 같이 움직인다. layout.tsx 를 고치면 여기도 고친다. */
        .wrap {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 24px;
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
        /* 글 + 캐릭터. 기본은 «세로로 쌓기»다 — 넓을 때만 옆으로 세운다.
           ⚠ 1180px 이 경계인 까닭: h1 이 clamp(…, 8.4vw, 96px)라 칸이 좁아져도
             글자가 안 줄어든다. 1180 아래에서 옆으로 세우면 「만들기 전엔 설계도,」가
             제 칸을 넘어 그림 위로 올라탄다. 그 아래로는 CTA 밑에 놓는다. */
        .hero-top {
          display: grid;
          gap: 8px;
        }
        .hero-figure {
          display: flex;
          justify-content: center;
        }
        .hero-figure :global(img) {
          width: 320px;
          height: auto;
          object-fit: contain;
        }
        @media (min-width: 1181px) {
          .hero-top {
            grid-template-columns: minmax(0, 1fr) 520px;
            gap: 40px;
            align-items: center;
          }
          .hero-figure :global(img) {
            width: 520px;
          }
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

        /* 캐릭터 그림 공통 — 투명 PNG(webp)라 카드 테두리를 두르지 않는다.
           종이 여백 위에 그대로 두는 편이 소품이 살아난다. */
        .cc :global(.plan-figure img),
        .cc :global(.verify-figure img),
        .cc :global(.sc-figure img),
        .cc :global(.thesis-figure img) {
          width: 100%;
          height: auto;
          object-fit: contain;
        }

        /* PLANNING */
        .plan-intro {
          display: grid;
          gap: 20px;
        }
        .plan-figure {
          justify-self: center;
          width: min(300px, 80%);
        }
        @media (min-width: 1000px) {
          .plan-intro {
            grid-template-columns: minmax(0, 1fr) 400px;
            gap: 48px;
            align-items: center;
          }
          .plan-figure {
            justify-self: end;
            width: 400px;
          }
        }
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
        /* PROOF — planning 에서 갈라져 나온 절.
           배경을 한 톤 밝게(paper → paper-2) 깔아 «여기서 장이 바뀐다»를 눈으로 알린다.
           tpls 절도 같은 paper-2 인데, 그 사이에 짙은 초록 verify 절이 끼어 있어
           두 밝은 절이 붙어 보이지 않는다. */
        .sec-proof {
          background: var(--paper-2);
        }
        .sec-proof h2 .o {
          color: var(--orange);
        }
        .showcase {
          margin-top: 40px;
          display: grid;
          gap: 24px;
        }
        .sc-figure {
          justify-self: center;
          width: min(280px, 75%);
        }
        @media (min-width: 1024px) {
          .showcase {
            grid-template-columns: 340px minmax(0, 1fr);
            gap: 36px;
            align-items: center;
          }
          .sc-figure {
            justify-self: start;
            width: 340px;
          }
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
        /* 그림 칸은 «넓을 때만» 생긴다. display:none 이라 좁을 때는 칸 자체가 없어
           지금까지의 두 칸(글 + ✕목록)이 한 자도 안 밀린다. */
        .thesis-figure {
          display: none;
        }
        @media (min-width: 1120px) {
          .thesis {
            grid-template-columns: 1fr 280px auto;
          }
          .thesis-figure {
            display: block;
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
        /* 각주는 두 칸을 가로질러 아래에 깔린다 — 그냥 두면 왼쪽 글 칸에 끼어
           ✕ 목록과 나란히 서면서 문단이 두 동강 난다. */
        /* .thesis p (글자 하나 + 클래스 하나)가 .thesis-note (클래스 하나)를 이겨서
           max-width:440px 가 그대로 걸린다 — 앞에 .thesis 를 붙여 무게를 맞춘다.
           (이 주석 안에 역따옴표를 쓰면 styled-jsx 템플릿이 거기서 닫혀 빌드가 깨진다.) */
        .thesis .thesis-note {
          grid-column: 1 / -1;
          font-size: 13px;
          line-height: 1.7;
          color: #a49b83;
          font-weight: 400;
          margin-top: 4px;
          max-width: none;
        }
        .ex-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          /* ✕ 가 셋에서 다섯으로 늘어 왼쪽 글보다 키가 커졌다 — 조금 넓혀
             오른쪽 칸이 세로로만 긴 띠처럼 보이지 않게 한다. */
          min-width: 260px;
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
        .verify-intro {
          display: grid;
          gap: 20px;
        }
        .verify-figure {
          justify-self: center;
          width: min(300px, 80%);
        }
        @media (min-width: 1000px) {
          .verify-intro {
            grid-template-columns: minmax(0, 1fr) 380px;
            gap: 48px;
            align-items: center;
          }
          .verify-figure {
            justify-self: end;
            width: 380px;
          }
        }
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
        /* AI팩 — PER_PAGE개씩 넘기며 롤링 */
        .tpl-roll {
          margin-top: 38px;
        }
        .tpl-vp {
          overflow: hidden;
        }
        .tpl-track {
          display: flex;
          transition: transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        .tpl-page {
          flex: 0 0 100%;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          /* 장마다 카드 수가 다를 수 있다(등급이 홀수인 업종). 늘리지 말고 내용 높이로 둔다 —
             트랙 높이는 가장 긴 장을 따라가서, 늘리면 짧은 장의 카드가 빈 채로 늘어난다. */
          align-content: start;
          align-items: start;
          /* 트랙이 옆으로 밀릴 때 카드 그림자가 잘리지 않게 살짝 여유를 준다 */
          padding: 4px;
        }
        @media (max-width: 860px) {
          .tpl-page {
            grid-template-columns: 1fr;
          }
        }
        .tpl-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 22px;
          flex-wrap: wrap;
        }
        /* ⚠ 줄바꿈을 «반드시» 켜 둔다. 점은 업종 수만큼 늘어난다 —
           팩이 늘면서 폰(375px)에서 한 줄이 414px 이 됐고, 페이지 전체에
           가로 스크롤이 생겼다(2026-08-11). 점 하나 34px × 개수 라
           업종이 더 늘면 또 넘친다. 줄바꿈이 그 걱정을 없앤다. */
        .tpl-dots {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          max-width: 100%;
        }
        .tpl-dots button {
          width: 26px;
          height: 6px;
          border: 0;
          padding: 0;
          border-radius: 999px;
          background: var(--paper-line);
          cursor: pointer;
          transition: background 0.2s ease, width 0.2s ease;
        }
        .tpl-dots button.on {
          width: 40px;
          background: var(--orange);
        }
        .cc :global(.btn-line) {
          background: transparent;
          color: var(--ink);
          border: 1.5px solid var(--ink);
        }
        .cc :global(.btn-line):hover {
          background: var(--ink);
          color: var(--paper);
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
        .cc :global(.tpl) .tg {
          display: inline-block;
          align-self: flex-start;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: var(--orange-deep);
          background: var(--paper-2, rgba(0, 0, 0, 0.04));
          border-radius: 999px;
          padding: 3px 10px;
          margin-bottom: 8px;
        }
        /* 구성 목록 — 등급이 넷이라 무엇이 더 들어가는지가 고르는 근거가 된다.
           한 줄에 하나씩 쌓으면 카드가 너무 길어져, 폭 안에서 흘러가며 접히게 둔다. */
        .cc :global(.tpl) .tl {
          margin: 10px 0 0;
          padding: 10px 0 0;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          list-style: none;
          display: flex;
          flex-wrap: wrap;
          gap: 2px 0;
          font-size: 12.5px;
          line-height: 1.6;
          color: var(--ink-soft);
        }
        .cc :global(.tpl) .tl li:not(:last-child)::after {
          content: "·";
          color: var(--tan);
          margin: 0 7px;
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

        /* SHIP — 만들고 나서 막히는 자리 안내.
           .thesis·.chip 과 같은 어휘를 쓴다: 폭을 꽉 채우고, 카드 배경 +
           종이선 테두리 1px, 모서리 6px, 위 여백 40px.
           파는 말이 아니라 «도와드리려고 적어 뒀다»는 결이라 색을 절제한다. */
        .ship {
          margin-top: 40px;
          background: var(--card);
          border: 1px solid var(--paper-line);
          border-radius: 6px;
          padding: 30px 32px;
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 32px;
          align-items: start;
        }
        .ship-tag {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--teal-deep);
          background: rgba(14, 111, 96, 0.09);
          border-radius: 4px;
          padding: 4px 9px;
        }
        .ship-hd h3 {
          margin: 12px 0 0;
          font-size: 22px;
          line-height: 1.3;
          font-weight: 800;
          /* 좁은 화면에서 「막히/는」처럼 어절 한가운데가 잘렸다.
             한국어는 어절 단위로 끊어야 읽힌다(2026-08-10). */
          word-break: keep-all;
        }
        .ship-hd p {
          margin: 10px 0 0;
          font-size: 15px;
          line-height: 1.8;
          color: var(--ink-soft);
          max-width: 560px;
          word-break: keep-all;
        }
        .ship-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 8px;
        }
        .ship-list li {
          font-size: 14px;
          line-height: 1.5;
          color: var(--ink-soft);
          padding-left: 15px;
          position: relative;
          word-break: keep-all;
        }
        .ship-list li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 8px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--teal);
        }
        @media (max-width: 860px) {
          .ship {
            grid-template-columns: 1fr;
            gap: 22px;
            padding: 26px 22px;
          }
        }

        /* MOAT */
        .moat {
          padding: 100px 0;
          text-align: center;
        }
        /* 이 절만 가운데 정렬이라 눈표도 가운데로 세운다. */
        .moat-eye {
          justify-content: center;
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
