// 판매용 템플릿의 "검수 시나리오 및 결과서"를 만드는 순수 함수.
//
// 라이브 서비스의 검수(adapters/verify)는 실제 URL을 돌며 결과를 채우지만,
// 판매 템플릿에는 돌릴 사이트가 없다. 대신 설계도 자체를 기준으로
// "이 화면에서 이게 되는지 눌러 확인하라"는 점검표를 만든다.
//
// 시나리오 1개 = 화면 1개. 확인 항목은 그 화면의 기능정의를 낱개로 쪼갠 것.
// 그래서 스탠다드(37~43화면)와 프리미엄(125~130화면)의 시나리오 수가
// 판매 페이지에 적힌 숫자와 자동으로 일치한다.
//
// 쓰는 규칙은 docs/검수시나리오_작성지침.md에 적어 뒀다. 고칠 때 같이 본다.

import { splitFuncDef } from "@/lib/export/requirements";

export interface VerifyTemplateScreen {
  pageId: string;
  pageName: string;
  menuName: string;
  funcDef: string;
  role: string;
}

type Row = Record<string, string | number>;

const EXCEPTION_ROLE = /(empty|error|closed|pending|expired)/;

const pad3 = (n: number) => String(n).padStart(3, "0");

// 확인 항목 낱개로 쪼개는 일은 기능정의서와 **같은 함수**를 쓴다.
//
// 예전엔 여기서 '·'로만 잘랐다. 그래서 괄호 안의 열거까지 잘려
// "상단 히어로(카피 + 지역" / "왁싱" 같은 줄이 검수 항목으로 나갔다(2026-08-03).
// 기능정의서 쪽은 진작 고쳐져 있었는데 이쪽이 자기 방식으로 자르고 있었다 —
// 같은 일을 하는 코드를 두 벌 두면 반드시 갈라진다.
const checkItems = splitFuncDef;

// 확인 항목의 성격에 따라 '확인 방법'과 '기대 결과'를 다르게 쓴다.
//
// 예전엔 92줄 모두 "'X' 화면에서 {항목} — 의도대로 동작하는지 눌러 확인한다."였다.
// 앞 칸을 그대로 베끼고 꼬리만 붙인 것이라 알려주는 게 없었다.
// 확인만 시키고 무엇이 맞는지 안 알려주면 PASS/FAIL을 고를 수 없으므로
// '기대 결과'를 함께 낸다(docs/검수시나리오_작성지침.md 원칙 2·3).
//
// 조사를 손으로 붙인다. "카드이(가)"처럼 괄호가 그대로 보이면 자동 생성 티가 난다.
//
// 항목이 괄호나 숫자로 끝나는 일이 잦으므로(예: "…8종(헤어컷·…·두피케어)"),
// 받침 판단은 **마지막 한글 글자**로 한다. 위 예는 '어'로 끝나니 받침이 없다.
function hasFinalConsonant(word: string): boolean {
  const hangul = word.match(/[가-힣]/g);
  if (!hangul) return true; // 한글이 없으면 받침 있는 쪽이 덜 어색하다
  const code = hangul[hangul.length - 1].charCodeAt(0) - 0xac00;
  return code % 28 !== 0;
}

const 이가 = (w: string) => `${w}${hasFinalConsonant(w) ? "이" : "가"}`;
const 을를 = (w: string) => `${w}${hasFinalConsonant(w) ? "을" : "를"}`;

// 규칙은 항목의 **머리말**(첫 괄호 앞)로만 판단한다.
//
// 괄호 안은 그 항목의 속내용이라, 거기 든 낱말로 성격을 정하면 엉뚱해진다.
// 예: "상단 히어로(카피 + 지역·시술 통합 검색바)"는 히어로지 검색 기능이 아닌데,
// 통째로 보면 '검색'에 걸려 "조건을 바꿔 가며 확인하라"가 되어 버렸다.
const headOf = (item: string) => item.split(/[([{]/)[0].trim() || item;

// 위에서부터 먼저 걸리는 규칙이 이긴다.
const HOW_RULES: { kw: RegExp; how: (screen: string, item: string) => string; expect: string }[] = [
  {
    // 결제·로그인처럼 실제로 끝까지 해 봐야 아는 것 — 성공만 보고 넘어가기 쉽다.
    kw: /결제|로그인|회원가입|본인인증|환불|취소|정산|송금/,
    how: (s, i) => `'${s}'에서 ${을를(i)} 성공·실패·취소 세 경우로 각각 끝까지 해 본다.`,
    expect: "세 경우가 서로 다른 화면으로 안내되고, 중간에 멈추거나 같은 화면에 머무르지 않는다.",
  },
  {
    // 개수가 적힌 항목은 세어 보면 끝난다 — 가장 확실한 확인법.
    kw: /\d+\s*(개|건|장|종|단|명|칸)/,
    how: (s, i) => `'${s}' 화면을 열고 ${이가(i)} 적힌 수만큼 나오는지 세어 본다.`,
    expect: "적힌 개수가 빠짐없이 보이고, 깨진 이미지나 빈 칸이 없다.",
  },
  {
    kw: /입력|폼|작성|등록|검색창|업로드|첨부/,
    how: (s, i) => `'${s}'의 ${i}에 빈 값과 잘못된 값을 각각 넣고 실행해 본다.`,
    expect: "빈 값·잘못된 값에는 무엇이 잘못됐는지 안내가 뜨고, 올바른 값이면 다음 단계로 넘어간다.",
  },
  {
    kw: /필터|정렬|검색|탭|캐러셀|더보기|페이지네이션|슬라이더/,
    how: (s, i) => `'${s}'에서 ${i}의 조건을 바꿔 가며 결과가 달라지는지 본다.`,
    expect: "고른 조건에 맞게 내용이 바뀌고, 해당하는 것이 없을 때는 빈 화면 안내가 뜬다.",
  },
  {
    kw: /버튼|바로가기|링크|이동|CTA|배너/,
    how: (s, i) => `'${s}'에서 ${을를(i)} 눌러 본다.`,
    expect: "설계한 화면으로 넘어가고, 뒤로 가기로 원래 화면에 되돌아온다.",
  },
  {
    kw: /목록|리스트|카드|그리드|테이블|갤러리/,
    how: (s, i) => `'${s}'의 ${을를(i)} 끝까지 내려 보고, 항목 하나를 눌러 본다.`,
    expect: "항목이 잘리거나 겹치지 않고, 하나를 누르면 그 상세 화면으로 간다.",
  },
  {
    kw: /표시|정보|금액|가격|현황|통계|합계|잔여|남은|상태/,
    how: (s, i) => `'${s}'의 ${이가(i)} 실제 데이터와 같은지 대조한다.`,
    expect: "표시된 값이 실제와 같고, 값이 없을 때 빈칸 대신 안내가 나온다.",
  },
];

const DEFAULT_HOW = {
  how: (s: string, i: string) =>
    `'${s}' 화면에서 ${이가(i)} 설계대로 있는지 보고, 누를 수 있으면 눌러 본다.`,
  expect: "설계한 자리에 있고, 눌렀을 때 아무 반응이 없거나 오류가 나지 않는다.",
};

// 예외·상태 화면은 성격이 아니라 화면 자체가 특수하다 —
// 가만히 두면 절대 안 나오므로 "일부러 그 상황을 만들라"고 해야 한다.
const EXCEPTION_HOW = {
  how: (s: string, i: string) =>
    `일부러 그 상황을 만들어 '${s}' 화면이 나오게 한 뒤, ${이가(i)} 보이는지 확인한다.`,
  expect: "무엇이 없거나 잘못됐는지 알려주고, 다음에 무엇을 하면 되는지 가리키는 버튼이 있다.",
};

function howToCheck(screen: string, item: string, isException: boolean) {
  if (isException) {
    return { how: EXCEPTION_HOW.how(screen, item), expect: EXCEPTION_HOW.expect };
  }
  const head = headOf(item);
  for (const r of HOW_RULES) {
    if (r.kw.test(head)) return { how: r.how(screen, item), expect: r.expect };
  }
  return { how: DEFAULT_HOW.how(screen, item), expect: DEFAULT_HOW.expect };
}

export interface VerifySheets {
  filename: string;
  cover: (string | number)[][];
  status: (string | number)[][];
  scenarios: Row[];
}

export function buildTemplateVerifySheets(
  title: string,
  screens: VerifyTemplateScreen[],
): VerifySheets {
  const scenarios: Row[] = [];
  let exceptionCount = 0;

  screens.forEach((s, i) => {
    const isException = EXCEPTION_ROLE.test(s.role);
    if (isException) exceptionCount += 1;
    const items = checkItems(s.funcDef);
    const testId = `SCN-${pad3(i + 1)}`;

    // 확인 항목이 없는 화면도 최소 1행은 남겨, 시나리오 수와 화면 수를 맞춘다.
    const rows = items.length > 0 ? items : ["화면이 정상적으로 열리는지 확인"];

    rows.forEach((item, j) => {
      const { how, expect } = howToCheck(s.pageName, item, isException);
      scenarios.push({
        테스트ID: testId,
        메뉴: j === 0 ? s.menuName : "",
        화면: j === 0 ? s.pageName : "",
        화면ID: j === 0 ? s.pageId : "",
        화면구분: j === 0 ? (isException ? "예외·상태" : "기본") : "",
        "확인 항목": item,
        "확인 방법": how,
        "기대 결과": expect,
        결과: "",
        비고: "",
      });
    });
  });

  const cover: (string | number)[][] = [
    ["", "검수 시나리오 및 결과서"],
    ["", title],
    [],
    ["", "이 문서는", "설계도에 정의된 화면과 기능이 실제로 구현되었는지 확인하는 점검표입니다."],
    ["", "", "AI로 화면을 만든 뒤, 빠진 것과 잘못 만들어진 것을 찾는 데 쓰세요."],
    [],
    ["", "쓰는 법", "1. '검수 시나리오' 시트를 엽니다."],
    ["", "", "2. '확인 방법'대로 해 보고, 결과가 '기대 결과'와 같은지 봅니다."],
    ["", "", "3. '결과' 칸에 PASS / FAIL / WARN 을 적습니다."],
    ["", "", "4. 고쳐야 할 것은 '비고'에 적어 개발자와 공유합니다."],
    [],
    ["", "PASS", "의도대로 동작함"],
    ["", "FAIL", "동작하지 않거나 화면 자체가 없음"],
    ["", "WARN", "동작하지만 어색하거나 보완이 필요함"],
  ];

  const status: (string | number)[][] = [
    ["검수 현황"],
    [],
    ["검수 대상", title],
    ["시나리오 수(화면 수)", screens.length],
    ["확인 항목 수", scenarios.length],
    ["예외·상태 화면", exceptionCount],
    [],
    ["PASS", ""],
    ["FAIL", ""],
    ["WARN", ""],
    ["미확인", ""],
    [],
    ["안내", "결과를 채우면 이 표에 직접 합계를 적어 관리하세요."],
  ];

  return { filename: "08_검수시나리오.xlsx", cover, status, scenarios };
}
