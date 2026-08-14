// 판매용 디자인 프리셋 생성기.
// 스펙팩과 함께 AI에 넣으면 해당 스타일로 화면이 만들어지도록 하는 디자인 스펙 문서 3종 + 비교 미리보기.
// 다른 템플릿(예약 서비스 등)에도 그대로 재사용한다.
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { PACKAGES } from "./lib/packages";
// 레이아웃 골격과 이미지 자리 규칙은 플랫폼이 만드는 프리셋과 같은 값을 써야 한다.
// 두 곳에 따로 적으면 "산 프리셋과 만든 프리셋이 다르다"는 말이 나온다.
import {
  LAYOUTS, THUMBS, thumbByKey, DENSITIES, SPACING_SLOTS, LINE_SLOTS,
  DEFAULT_LAYOUT, IMAGE_PLACEHOLDER, CONTENT_WIDTH, READING_WIDTH, COMMON_RULES, ACCENT_RULE, type DesignKey,
  STRUCTURES, STRUCTURE_COLS, GRID_GAP, gridBaseCss, cardWidth, textOn,
} from "./lib/design-presets";

/** 마크다운 표 안에 코드로 감싸 넣는다 — 중첩 백틱을 피하려고 함수로 뺐다. */
const inCode = (s: string) => "`" + s + "`";

const layoutOf = (key: string) => {
  const k = DEFAULT_LAYOUT[key as DesignKey];
  return LAYOUTS.find((l) => l.key === k) ?? LAYOUTS[0];
};

// 어떤 템플릿용으로 만들지 인자로 받는다: npx tsx build-design-presets.mts lms | beauty
// 디자인 규칙(색·타이포·컴포넌트)은 업종 무관하게 같고, "어울리는 서비스" 문구만 갈라진다.
/* 콘텐츠 영역 배경은 클라우드 댄서(#F0EFEB)로 고정한다.
   전에는 테마마다 주색을 옅게 깐 배경을 썼는데(코럴 #FFF6F3, 네이비 #F5F7FA),
   테마를 바꿀 때마다 화면 전체 색조가 흔들리고 카드가 배경에서 안 떠 보였다.
   배경은 중립으로 두고 색은 주색·강조가 낸다(2026-08-05). */

const TARGETS = {
  lms: {
    styles: ["navy", "mono", "coral"] as const,
    layouts: ["console", "magazine"] as const,
    dir: "_작업/LMS_온라인강의플랫폼/디자인프리셋",
    fits: [
      "B2B 교육, 사내 LMS, 기업 대상 강의 플랫폼",
      "전문가용 도구, 관리자 콘솔, 정보 밀도가 높은 화면",
      "B2C 강의 서비스, 취미·키즈 교육, 일반 사용자 대상",
    ],
  },
  beauty: {
    // 내추럴 그린(forest)은 뷰티에 안 어울려 소프트 파스텔로 바꿨다(2026-08-04).
    styles: ["coral", "mono", "pastel"] as const,
    layouts: ["showcase", "calm"] as const,
    dir: "_작업/뷰티샵_예약플랫폼/디자인프리셋",
    fits: [
      "네일·속눈썹·왁싱 등 캐주얼 뷰티, 20~30대 타깃 매장",
      "감각적인 편집숍형 살롱, 남성 전용 바버샵",
      "부드러운 인상이 중요한 피부관리·에스테틱, 아이·산모 대상 케어",
    ],
  },
  travel: {
    styles: ["navy", "mono", "pastel"] as const,
    layouts: ["search", "showcase"] as const,
    dir: "_작업/해외투어_티켓예약/디자인프리셋",
    fits: [
      "신뢰가 중요한 해외 투어·티켓 예약, 대형 여행 플랫폼",
      "사진이 주인공인 감성 여행 브랜드, 소규모 프라이빗 투어",
      "액티비티·레저 예약, 20~30대 자유여행객 타깃",
    ],
  },
  admin: {
    styles: ["navy", "mono", "pastel"] as const,
    layouts: ["console", "list"] as const,
    dir: "_작업/비즈니스관리_관리자시스템/디자인프리셋",
    fits: [
      "정보 밀도가 높은 백오피스·ERP형 관리 시스템, 데이터 중심 화면",
      "병의원·클리닉·전문 서비스업의 신뢰감 있는 관리자 콘솔",
      "미용실·공방·소규모 매장 사장님이 매일 쓰는 가벼운 관리 도구",
    ],
  },
  matching: {
    styles: ["navy", "mono", "forest"] as const,
    layouts: ["split", "list"] as const,
    dir: "_작업/동네서비스_매칭플랫폼/디자인프리셋",
    fits: [
      "신뢰가 먼저인 매칭·중개 서비스, 이사·인테리어처럼 금액이 큰 분야",
      "과외·레슨·컨설팅처럼 사람 자체가 상품인 분야",
      "청소·수리·돌봄처럼 생활에 가까운 분야, 안심이 중요한 서비스",
    ],
  },
  groupbuy: {
    styles: ["navy", "mono", "coral"] as const,
    // 목록 중심형은 매칭이 이미 쓴다. 9종을 겹치지 않게 나누려고 공구는 벤토 그리드형을 받는다.
    // 크기가 다른 타일을 짜맞추는 뼈대라 딜을 늘어놓는 공구에 어울린다(2026-08-06).
    layouts: ["bold", "bento"] as const,
    dir: "_작업/공동구매_공구플랫폼/디자인프리셋",
    fits: [
      "신뢰가 중요한 대형 공동구매·소셜커머스, 안정감 있는 브랜드",
      "감각적인 셀렉트 공구·인플루언서 공구, 편집숍형 큐레이션",
      "생활밀착 저가 공구·맘카페형, 20~30대 모바일 타깃",
    ],
  },
  rental: {
    // 야외 장비를 빌려주는 곳이라 내추럴 그린을 앞에 둔다.
    // 레트로 페이퍼는 아직 어느 업종도 안 쓰던 색이다 — 캠핑의 빈티지 결과 맞는다.

    styles: ["forest", "mono", "retro"] as const,
    // 기간을 먼저 고르는 검색이 첫 화면의 주인공이라 검색 중심형,
    // 정산·내역처럼 표가 많은 화면이 뒤를 받쳐서 목록 중심형.
    layouts: ["search", "list"] as const,
    dir: "_작업/장비렌탈_대여예약/디자인프리셋",
    fits: [
      "캠핑·아웃도어 장비 렌탈, 친환경·자연을 앞세우는 브랜드",
      "카메라·음향처럼 사양이 중요한 전문 장비 렌탈, 표와 숫자가 주인공인 화면",
      "빈티지·감성 소품 대여, 파티·촬영 소품처럼 분위기를 파는 대여",
    ],
  },
  interior: {
    // 공간 사진이 주인공이라 색을 절제한 미니멀 모노를 앞에 둔다.
    // 계약금·중도금이 오가고 공정표가 많아 신뢰형(네이비)이 두 번째,
    // 목공·타일의 결과 어울리는 레트로 페이퍼가 세 번째다.
    styles: ["mono", "navy", "retro"] as const,
    // 시공 사례 사진이 첫 화면의 주인공이라 사진 중심형,
    // 공정표·현장 일지·기성 청구처럼 표와 일정이 뒤를 받쳐서 대시보드형.
    // (사진 중심형 × 대시보드형은 아직 어느 업종도 안 쓰던 짝이다)
    layouts: ["showcase", "console"] as const,
    dir: "_작업/인테리어시공_견적상담/디자인프리셋",
    fits: [
      "공간 사진이 주인공인 인테리어 스튜디오, 미니멀·모던 시공",
      "아파트 리모델링·상업 공간처럼 금액이 크고 공정이 많은 시공, 표와 일정이 주인공인 화면",
      "목공·타일·빈티지 감성 시공, 작은 공방형 업체",
    ],
  },
  "interior-deep": {
    styles: ["mono", "navy", "retro"] as const,
    layouts: ["showcase", "console"] as const,
    dir: "_작업/인테리어시공_견적상담_상세IA/디자인프리셋",
    fits: [
      "공간 사진이 주인공인 인테리어 스튜디오, 미니멀·모던 시공",
      "아파트 리모델링·상업 공간처럼 금액이 크고 공정이 많은 시공, 표와 일정이 주인공인 화면",
      "목공·타일·빈티지 감성 시공, 작은 공방형 업체",
    ],
  },
  "rental-deep": {
    styles: ["forest", "mono", "retro"] as const,
    layouts: ["search", "list"] as const,
    dir: "_작업/장비렌탈_대여예약_상세IA/디자인프리셋",
    fits: [
      "캠핑·아웃도어 장비 렌탈, 친환경·자연을 앞세우는 브랜드",
      "카메라·음향처럼 사양이 중요한 전문 장비 렌탈, 표와 숫자가 주인공인 화면",
      "빈티지·감성 소품 대여, 파티·촬영 소품처럼 분위기를 파는 대여",
    ],
  },
  "matching-deep": {
    styles: ["navy", "mono", "forest"] as const,
    layouts: ["split", "list"] as const,
    dir: "_작업/동네서비스_매칭플랫폼_상세IA/디자인프리셋",
    fits: [
      "신뢰가 먼저인 매칭·중개 서비스, 이사·인테리어처럼 금액이 큰 분야",
      "과외·레슨·컨설팅처럼 사람 자체가 상품인 분야",
      "청소·수리·돌봄처럼 생활에 가까운 분야, 안심이 중요한 서비스",
    ],
  },
  "groupbuy-deep": {
    styles: ["navy", "mono", "coral"] as const,
    // 목록 중심형은 매칭이 이미 쓴다. 9종을 겹치지 않게 나누려고 공구는 벤토 그리드형을 받는다.
    // 크기가 다른 타일을 짜맞추는 뼈대라 딜을 늘어놓는 공구에 어울린다(2026-08-06).
    layouts: ["bold", "bento"] as const,
    dir: "_작업/공동구매_공구플랫폼_상세IA/디자인프리셋",
    fits: [
      "신뢰가 중요한 대형 공동구매·소셜커머스, 안정감 있는 브랜드",
      "감각적인 셀렉트 공구·인플루언서 공구, 편집숍형 큐레이션",
      "생활밀착 저가 공구·맘카페형, 20~30대 모바일 타깃",
    ],
  },
  "admin-deep": {
    styles: ["navy", "mono", "pastel"] as const,
    layouts: ["console", "list"] as const,
    dir: "_작업/비즈니스관리_관리자시스템_상세IA/디자인프리셋",
    fits: [
      "정보 밀도가 높은 백오피스·ERP형 관리 시스템, 데이터 중심 화면",
      "병의원·클리닉·전문 서비스업의 신뢰감 있는 관리자 콘솔",
      "미용실·공방·소규모 매장 사장님이 매일 쓰는 가벼운 관리 도구",
    ],
  },
};
const targetKey = (process.argv[2] ?? "lms") as keyof typeof TARGETS;
const target = TARGETS[targetKey];
if (!target) {
  throw new Error(`알 수 없는 대상: ${targetKey} (가능: ${Object.keys(TARGETS).join(", ")})`);
}
const OUT = target.dir;
mkdirSync(OUT, { recursive: true });
// 3종을 다른 테마로 바꾸면 옛 파일이 남는다(예: 파스텔 → 코럴로 바꿔도 파스텔 파일이 그대로).
// 그대로 두면 판매 zip에 네 벌이 들어가 "3종"이라는 설명과 어긋난다. 매번 비우고 다시 쓴다.
for (const f of readdirSync(OUT)) {
  if (/^(가이드_|프리셋_|레이아웃_)/.test(f)) rmSync(`${OUT}/${f}`);
}

/* ⚠ 프리셋 정의(PRESETS)와 만드는 함수들은 lib/preset-pack.ts 로 옮겼다 (2026-08-14).
   손님이 홈페이지에서 받는 zip 도 같은 것을 써야 해서다 — 여기 두면 브라우저가 못 부른다.
   **파는 팩과 받는 팩은 한 곳에서 나온다.** */
import { PRESETS, buildGuideMarkdown as md, buildGuideTokens as tokens,
         buildLayoutMarkdown as layoutMd, buildLayoutTokens as layoutTokens,
         buildPreviewHtml, type Preset } from "./lib/preset-pack";
/**
 * 이 업종에 넣을 3종을 6종에서 고른다.
 *
 * 번호(01·02·03)는 고른 순서대로 다시 매긴다 — 파일명과 미리보기가 항상
 * 01·02·03이라야 판매팩 구성이 업종마다 달라 보이지 않는다.
 * "어울리는 서비스" 문구(fits)도 같은 순서로 갈아 끼운다.
 */
const chosen: Preset[] = target.styles.map((key, i) => {
  const found = PRESETS.find((x) => x.key === key);
  if (!found) {
    throw new Error(`프리셋 정의가 없어요: ${key} (있는 것: ${PRESETS.map((x) => x.key).join(", ")})`);
  }
  return { ...found, no: String(i + 1).padStart(2, "0"), fits: target.fits[i] ?? found.fits };
});

// lib/packages.ts의 presetStyles와 어긋나면 판매 페이지 문구와 실제 파일이 달라진다.
// 값을 두 곳에 적어 둔 대가라, 어긋나면 여기서 멈춘다.
const listed = PACKAGES.find((x) => x.id === targetKey);
if (listed && listed.presetStyles.join() !== target.styles.join()) {
  throw new Error(
    `프리셋 3종이 lib/packages.ts와 달라요.\n` +
      `  이 스크립트: ${target.styles.join(", ")}\n` +
      `  packages.ts: ${listed.presetStyles.join(", ")}\n` +
      `  둘을 맞춘 뒤 다시 돌리세요.`,
  );
}

// 이 업종에 넣을 뼈대 2종.
const chosenLayouts = target.layouts.map((key) => {
  const found = LAYOUTS.find((l) => l.key === key);
  if (!found) throw new Error(`레이아웃 정의가 없어요: ${key}`);
  return found;
});
if (listed && listed.layoutKeys.join() !== target.layouts.join()) {
  throw new Error(
    `레이아웃 2종이 lib/packages.ts와 달라요.\n` +
      `  이 스크립트: ${target.layouts.join(", ")}\n` +
      `  packages.ts: ${listed.layoutKeys.join(", ")}\n` +
      `  둘을 맞춘 뒤 다시 돌리세요.`,
  );
}

for (const p of chosen) {
  const base = `${OUT}/가이드_${p.no}_${p.name.replace(/\s/g, "")}`;
  writeFileSync(`${base}.md`, md(p), "utf8");
  writeFileSync(`${base}.json`, JSON.stringify(tokens(p), null, 2), "utf8");
  console.log(`  ✔ 가이드_${p.no}_${p.name} (.md / .json)`);
}

/* 미리보기 조각(card·layoutCard)과 틀은 lib/preset-pack.ts 로 옮겼다. */
/* 미리보기 HTML 은 lib/preset-pack.ts 의 buildPreviewHtml 이 만든다. */
writeFileSync(`${OUT}/프리셋_미리보기.html`, buildPreviewHtml(chosen, chosenLayouts), "utf8");
console.log("  ✔ 프리셋_미리보기.html");

// 레이아웃 프리셋 2벌 — 색과 짝짓지 않는다.
chosenLayouts.forEach((l, i) => {
  const no = String.fromCharCode(65 + i); // A, B
  const base = `${OUT}/레이아웃_${no}_${l.label.replace(/\s/g, "")}`;
  writeFileSync(`${base}.md`, layoutMd(l, no), "utf8");
  writeFileSync(`${base}.json`, JSON.stringify(layoutTokens(l, no), null, 2), "utf8");
  console.log(`  ✔ 레이아웃_${no}_${l.label} (.md / .json)`);
});
console.log(`\n완료 → ${OUT}`);
