// 판매용 템플릿의 "검수 시나리오 및 결과서"를 만드는 순수 함수.
//
// 라이브 서비스의 검수(adapters/verify)는 실제 URL을 돌며 결과를 채우지만,
// 판매 템플릿에는 돌릴 사이트가 없다. 대신 설계도 자체를 기준으로
// "이 화면에서 이게 되는지 눌러 확인하라"는 점검표를 만든다.
//
// 시나리오 1개 = 화면 1개. 확인 항목은 그 화면의 기능정의를 낱개로 쪼갠 것.
// 그래서 스탠다드(37~43화면)와 프리미엄(125~130화면)의 시나리오 수가
// 판매 페이지에 적힌 숫자와 자동으로 일치한다.

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

/** 기능정의 한 줄을 확인 항목 낱개로 쪼갠다. */
function checkItems(funcDef: string): string[] {
  return funcDef
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);
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
      scenarios.push({
        테스트ID: testId,
        메뉴: j === 0 ? s.menuName : "",
        화면: j === 0 ? s.pageName : "",
        화면ID: j === 0 ? s.pageId : "",
        화면구분: j === 0 ? (isException ? "예외·상태" : "기본") : "",
        "확인 항목": item,
        "확인 방법": `'${s.pageName}' 화면에서 ${item} — 의도대로 동작하는지 눌러 확인한다.`,
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
    ["", "", "2. 화면을 하나씩 열어 '확인 항목'이 실제로 되는지 눌러 봅니다."],
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
