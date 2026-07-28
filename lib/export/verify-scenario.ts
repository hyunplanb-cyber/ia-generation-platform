import type { VerificationReport } from "@/domain/verify/report";

// 검수 리포트를 "검수 시나리오 및 결과서"(단위테스트 시나리오 결과서) 형식의
// 엑셀 시트 데이터로 바꾼다. 실제 XLSX 조립/저장은 클라이언트 버튼에서 한다.

const STATUS_KO: Record<string, string> = { pass: "통과", fail: "실패", warn: "주의" };

export interface VerifyScenarioSheets {
  filename: string;
  cover: (string | number)[][];
  status: (string | number)[][];
  scenarios: Record<string, string | number>[];
}

function safeName(s: string): string {
  return (s || "검수")
    .replace(/^https?:\/\//, "")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "")
    .slice(0, 40);
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// marks: 사용자가 직접 확인하며 고른 결과. 키는 `${시나리오index}-${step index}`,
// 값은 "pass" | "fail" | "warn". 고른 값이 시나리오 시트의 '결과' 칸에 채워진다.
export function buildVerifyScenarioSheets(
  report: VerificationReport,
  marks: Record<string, string> = {},
): VerifyScenarioSheets {
  const modeLabel = report.mode === "site" ? "사이트 URL" : "설계도·문서";
  const dateStr = fmtDate(report.fetchedAt);

  const cover: (string | number)[][] = [
    [],
    ["", "검수 시나리오 및 결과서"],
    [],
    ["", "대상", report.finalUrl],
    ["", "검수 방식", modeLabel],
    ["", "생성일", dateStr],
    ["", "생성 도구", "카페인컬러 (caffeinecolor.com)"],
    [],
    ["", "총평", report.summary],
  ];

  const scenarioStepCount = report.scenarios.reduce((n, s) => n + s.steps.length, 0);
  const status: (string | number)[][] = [
    ["검수 현황"],
    [],
    ["구분", "건수"],
    ["통과(PASS)", report.passCount],
    ["실패(FAIL)", report.failCount],
    ["주의(WARN)", report.warnCount],
    ["직접 확인 시나리오", scenarioStepCount],
    [],
    ["오픈 전 직접 확인이 필요한 화면(로그인·결제 등)"],
    ...report.sensitiveScreens.map((s) => [s]),
  ];

  const scenarios: Record<string, string | number>[] = [];
  report.checks.forEach((c, i) => {
    scenarios.push({
      테스트ID: `AUTO-${String(i + 1).padStart(3, "0")}`,
      화면구분: "공개(자동 검사)",
      테스트영역: c.label,
      "테스트 방법": c.detail,
      결과: STATUS_KO[c.status] ?? c.status,
      비고: "",
    });
  });
  let scn = 0;
  report.scenarios.forEach((s, si) => {
    const sensitive = s.area === "sensitive";
    s.steps.forEach((step, sti) => {
      scn += 1;
      const mark = marks[`${si}-${sti}`];
      scenarios.push({
        테스트ID: `SCN-${String(scn).padStart(3, "0")}`,
        화면구분: sensitive ? "민감(직접 확인)" : "공개(직접 확인)",
        테스트영역: s.screen,
        "테스트 방법": step,
        결과: mark ? (STATUS_KO[mark] ?? "") : "",
        비고: sensitive ? "로그인·결제 등 직접 눌러 확인" : "",
      });
    });
  });

  return {
    filename: `검수시나리오_${safeName(report.finalUrl)}_${dateStr}.xlsx`,
    cover,
    status,
    scenarios,
  };
}
