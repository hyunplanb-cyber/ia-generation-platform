/* 카드사 심사용 「결제경로」 PPT 를 만든다 — 충전업종용.
 *
 * 왜 만드나
 *   토스 계약과정 FAQ 6번 — 「결제경로 파일이 없으면 심사 진행이 불가해요.」
 *   「PDF 가 아닌 PPT 파일로 계약담당자에게 보내주셔야 해요.」
 *   구성은 토스가 준 «홈페이지 결제경로 제작 가이드(충전업종용)» 3페이지의 여덟 단계 그대로다.
 *
 * ⚠ 캡처를 이 스크립트가 «대신 찍어 주지 않는다» — 일부러 그렇게 뒀다.
 *   가이드 유의사항 2번이 **「모든 캡처 화면은 도메인 주소(URL)가 보이도록」** 이라고 못 박는다.
 *   헤드리스 크롬으로 찍으면 주소창이 없다. 주소창을 그림으로 그려 붙일 수도 있지만
 *   그건 **카드사에 내는 증빙을 지어내는 것**이라 하지 않는다.
 *   게다가 충전·대시보드는 로그인 뒤에 있어서 세션 없이 못 찍는다.
 *
 *   그래서 이 스크립트는 **틀과 지시문을 만든다.** 슬라이드마다
 *   「어느 주소를 열어 무엇이 보이게 찍을지」를 적어 두고 빈 자리를 남긴다.
 *   사람이 배포된 도메인에서 창째로 찍어 그 자리에 끼우면 끝난다.
 *
 * 쓰는 법
 *   npx tsx build-pg-doc.mts                    (기본: 배포 도메인 기준으로 지시문 작성)
 *   npx tsx build-pg-doc.mts http://localhost:3000
 */
import { writeFileSync, mkdirSync } from "node:fs";
/* pptxgenjs 는 CJS 라 .mts(엄격 ESM)에서는 default 가 «네임스페이스 객체»로 들어온다.
   생성자는 그 안의 .default 다. lib/export/ppt-export.ts 는 .ts 라 그냥 되는데
   여기서만 `pptxgen is not a constructor` 가 났다(2026-08-09). */
import pptxgenNs from "pptxgenjs";
const pptxgen = ((pptxgenNs as unknown as { default?: unknown }).default ??
  pptxgenNs) as typeof pptxgenNs;
import { BUSINESS } from "./lib/business";
import { SITE_URL } from "./lib/site";
import { CREDIT_PACKS, MAX_CHARGE_WON } from "./lib/credits";
import { PACKAGES, packCredits, PLAN_NAMES } from "./lib/packages";
import { REVIEW_OPEN_PLAN } from "./lib/flags";

const BASE = (process.argv[2] ?? SITE_URL).replace(/\/$/, "");
const OUT = "가격정책";
mkdirSync(OUT, { recursive: true });

/* 슬라이드 한 장 = 가이드의 한 단계.
   shots 에 적은 것이 「이 화면에 반드시 보여야 하는 것」이다 — 심사관이 그걸 찾는다. */
interface Step {
  no: string;
  title: string;
  url: string;
  must: string[];
}

const 등급 = PLAN_NAMES[REVIEW_OPEN_PLAN as keyof typeof PLAN_NAMES];
const 열린팩 = PACKAGES[0];
const 열린등급 = 열린팩.plans.find((p) => p.id === REVIEW_OPEN_PLAN);
const 충전옵션 = CREDIT_PACKS.map((p) => `${p.priceKrw.toLocaleString()}원(${p.credits}크레딧)`).join(" · ");

const STEPS: Step[] = [
  {
    no: "②",
    title: "하단정보",
    url: `${BASE}/`,
    must: [
      "필수 정보가 모두 보이게 푸터까지 스크롤해서 캡처",
      `상호명 ${BUSINESS.name} / 사업자등록번호 ${BUSINESS.registrationNo}`,
      `대표자명 ${BUSINESS.ceo} / 주소 ${BUSINESS.address}`,
      `전화번호 ${BUSINESS.phone} / 통신판매업신고번호 ${BUSINESS.mailOrderNo}`,
      "사업자등록증과 «완전히 동일»해야 한다 — 한 글자만 달라도 반려",
    ],
  },
  {
    no: "③④",
    title: "약관 및 환불 규정",
    url: `${BASE}/terms`,
    must: [
      "제6조(크레딧 및 결제) 전체 — 특히 ⑤ 유효기간 · ⑥ 양도 불가 · ⑦ 1회 10만원 이하",
      "제7조(청약철회 및 환불) 전체 — 특히 ③ 구매 시점 결제 금액 기준 · ④ 결제한 수단으로 환불",
      "두 조가 한 장에 안 들어가면 나눠서 두 장으로 찍는다",
    ],
  },
  {
    no: "⑤",
    title: "로그인 경로",
    url: `${BASE}/login`,
    must: [
      "로그인 화면과, 로그인을 누르는 경로(헤더 버튼)까지",
      "심사관에게 전달할 테스트 계정으로 실제 로그인하는 흐름",
      "회원가입 경로도 함께 찍어 두면 안전하다",
    ],
  },
  {
    no: "⑥-1",
    title: "상품 선택 — 목록",
    url: `${BASE}/packages`,
    must: [
      "AI팩 목록. 등급마다 «값이 보여야» 한다 — 값 없이 문의만 있으면 입점 불가",
      `값은 크레딧으로 표기된다 (예: ${열린등급 ? packCredits(열린등급.priceKrw).toLocaleString() : "503"}크레딧)`,
    ],
  },
  {
    no: "⑥-2",
    title: "상품 선택 — 상세와 구매 버튼",
    url: `${BASE}/packages/${열린팩.id}`,
    must: [
      `심사 기간에는 «${등급}» 등급만 구매 버튼이 열린다(나머지는 「판매 준비 중」)`,
      "구매 버튼에 필요한 크레딧이 적혀 있는 화면",
      "여기서 크레딧이 모자라면 충전으로 가는 흐름이 이어진다",
    ],
  },
  {
    no: "⑦-1",
    title: "포인트 충전 — 금액 선택",
    url: `${BASE}/dashboard/billing`,
    must: [
      "서비스 명칭(크레딧 충전)과 «선택형» 금액 옵션이 한 화면에",
      `옵션: ${충전옵션}`,
      `전부 ${MAX_CHARGE_WON.toLocaleString()}원 이하 — 임의 금액 입력칸이 없다는 것이 보여야 한다`,
      "⚠ 로그인 뒤 화면이라 테스트 계정으로 들어가서 찍는다",
    ],
  },
  {
    no: "⑦-2",
    title: "카드 결제창",
    url: `${BASE}/dashboard/billing`,
    must: [
      "금액을 고르고 「충전하기」를 눌러 토스 결제창이 뜬 상태",
      "결제창에 «금액»이 찍혀 있어야 한다",
      "테스트 결제창이어도 심사 가능(가이드 유의사항 6)",
      "비씨·농협은 카드사 앱 화면까지 필요할 수 있다(유의사항 7)",
    ],
  },
  {
    no: "⑧-1",
    title: "결제 후 — 충전된 크레딧",
    url: `${BASE}/dashboard/billing`,
    must: [
      "결제 완료 후 잔액이 늘어난 화면",
      "충전 내역(언제 얼마가 몇 크레딧으로)까지 보이면 더 좋다",
    ],
  },
  {
    no: "⑧-2",
    title: "포인트 사용처 ①  AI팩 구매",
    url: `${BASE}/packages/${열린팩.id}`,
    must: [
      "충전한 크레딧으로 AI팩을 사는 화면 — 누르면 크레딧이 빠지고 바로 다운로드",
      "이것이 「충전한 포인트를 어디에 쓰는가」의 답이다(유의사항 3)",
    ],
  },
  {
    no: "⑧-3",
    title: "포인트 사용처 ②  직접 만들기",
    url: `${BASE}/dashboard`,
    must: [
      "크레딧으로 산출물을 생성·다운로드하는 화면",
      "사용처가 둘이라는 것을 보여 준다 — 팩 구매, 그리고 직접 만들기",
    ],
  },
];

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
const W = 10;

/* ── 표지 — 가이드 ① 가맹점 정보 기재 ───────────────────── */
{
  const s = pptx.addSlide();
  s.addText("결제경로", { x: 0.6, y: 0.5, w: W - 1.2, h: 0.7, fontSize: 34, bold: true, color: "20261C" });
  s.addText("카드사 심사 제출용 · 포인트 충전 업종", {
    x: 0.6, y: 1.2, w: W - 1.2, h: 0.4, fontSize: 14, color: "6B5E4F",
  });

  const rows: [string, string][] = [
    ["상호명", BUSINESS.name],
    ["사업자등록번호", BUSINESS.registrationNo],
    ["대표자명", BUSINESS.ceo],
    ["홈페이지 URL", BASE],
    ["테스트 계정", "아이디: ____________  비밀번호: ____________"],
  ];
  s.addTable(
    rows.map(([k, v]) => [
      { text: k, options: { bold: true, color: "2A2320", fill: { color: "F4F1EA" } } },
      { text: v, options: { color: "2A2320" } },
    ]),
    { x: 0.6, y: 1.9, w: W - 1.2, colW: [2.4, W - 3.6], fontSize: 13, border: { pt: 1, color: "E4D9C4" }, rowH: 0.42 },
  );

  s.addText(
    "※ 결제 확인은 위 테스트 계정으로 로그인 후 부탁드립니다. 비회원 상태에서는 결제 버튼이 열리지 않습니다.",
    { x: 0.6, y: 4.5, w: W - 1.2, h: 0.5, fontSize: 12, bold: true, color: "C25D17" },
  );
}

/* ── 단계별 슬라이드 ───────────────────────────────────── */
for (const step of STEPS) {
  const s = pptx.addSlide();
  s.addText(`${step.no}  ${step.title}`, {
    x: 0.5, y: 0.3, w: W - 1, h: 0.5, fontSize: 22, bold: true, color: "20261C",
  });
  s.addText(step.url, { x: 0.5, y: 0.82, w: W - 1, h: 0.32, fontSize: 12, color: "0E6F60" });

  // 캡처를 끼울 자리
  s.addShape("rect", {
    x: 0.5, y: 1.25, w: 5.9, h: 3.9,
    fill: { color: "FBF9F4" }, line: { color: "D8D4C6", width: 1, dashType: "dash" },
  });
  s.addText("여기에 캡처를 끼웁니다\n(주소창이 보이도록 창째로)", {
    x: 0.5, y: 2.8, w: 5.9, h: 0.8, align: "center", fontSize: 13, color: "9A8C68",
  });

  s.addText("이 화면에 반드시 보여야 하는 것", {
    x: 6.7, y: 1.25, w: 2.8, h: 0.3, fontSize: 12, bold: true, color: "2A2320",
  });
  s.addText(step.must.map((m) => ({ text: m, options: { bullet: true, breakLine: true } })), {
    x: 6.7, y: 1.6, w: 2.8, h: 3.5, fontSize: 10, color: "4E4A3B", lineSpacingMultiple: 1.25,
  });
}

/* ── 마지막 — 지킬 것 ──────────────────────────────────── */
{
  const s = pptx.addSlide();
  s.addText("제출 전 확인", { x: 0.6, y: 0.5, w: W - 1.2, h: 0.5, fontSize: 24, bold: true, color: "20261C" });
  const 확인 = [
    "모든 캡처에 «도메인 주소»가 보인다 — localhost 로 찍은 것은 반려된다",
    "PDF 가 아니라 «PPT» 로 보낸다",
    "심사 기간(10~14일)에는 홈페이지를 바꾸지 않는다 — 값·상품·판매상태·하단정보",
    "하단정보가 사업자등록증과 완전히 같다",
    "테스트 계정을 계약담당자에게 함께 전달한다",
    "임의 금액 입력 충전이 없다 · 모든 옵션이 10만원 이하다",
    "약관에 환불 수단·양도 불가·유효기간이 적혀 있다",
  ];
  s.addText(확인.map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), {
    x: 0.6, y: 1.3, w: W - 1.2, h: 3.6, fontSize: 14, color: "2A2320", lineSpacingMultiple: 1.6,
  });
}

const 파일 = `${OUT}/결제경로_${BUSINESS.name}.pptx`;
const buf = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
writeFileSync(파일, buf);
console.log(`✔ ${파일}`);
console.log(`  표지 1 + 단계 ${STEPS.length} + 확인 1 = ${STEPS.length + 2}장`);
console.log(`  기준 주소: ${BASE}`);
console.log("");
console.log("  캡처는 사람이 «배포된 도메인»에서 창째로 찍어 끼웁니다.");
console.log("  헤드리스로 찍으면 주소창이 없어 반려됩니다(가이드 유의사항 2).");
