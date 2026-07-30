// 심화(상세) 판매용 템플릿 생성 스크립트 (일회성).
// 기존 37화면 템플릿을 탭·상태까지 펼친 실무 IA 해상도(120~150화면)로 만든다.
// 01·02는 심화 확장기(template-deep)로, 03~07은 기존 exporter를 재사용한다.
import { mkdirSync, writeFileSync } from "node:fs";
import * as XLSX from "xlsx";
import { buildRequirementRows } from "./lib/export/requirements";
import { buildWbsRows } from "./lib/export/excel-rows";
import { buildFlowHtml, buildDrawioXml, type ExportNode, type ExportEdge } from "./lib/export/flow-export";
import { createMenuPptx, type PptMenu } from "./lib/export/ppt-export";
import { buildSpecPackMarkdown, buildSpecPackJson } from "./lib/export/spec-pack";
import { buildTemplateVerifySheets } from "./lib/export/template-verify";
import { expandDeep, type DeepInput } from "./template-deep";
import { GROUPBUY_DEEP } from "./template-data-groupbuy-deep";
import { ADMIN_DEEP } from "./template-data-admin-deep";
import { LMS_DEEP } from "./template-data-lms-deep";
import { BEAUTY_DEEP } from "./template-data-beauty-deep";
import { TRAVEL_DEEP } from "./template-data-travel-deep";

// npx tsx build-template-deep.mts lms | beauty | travel | groupbuy | admin
// lms·beauty·travel은 판매 상품 "프리미엄" 3종의 납품 파일이다(/packages 상세와 같은 데이터).
const TEMPLATES: Record<string, { data: DeepInput; out: string; title: string }> = {
  lms: { data: LMS_DEEP, out: "판매용_템플릿/LMS_온라인강의플랫폼_상세IA", title: "온라인 강의 플랫폼(LMS) — 상세 IA" },
  beauty: { data: BEAUTY_DEEP, out: "판매용_템플릿/뷰티샵_예약플랫폼_상세IA", title: "뷰티샵 예약 플랫폼 — 상세 IA" },
  travel: { data: TRAVEL_DEEP, out: "판매용_템플릿/해외투어_티켓예약_상세IA", title: "해외 투어·티켓 예약 플랫폼 — 상세 IA" },
  groupbuy: { data: GROUPBUY_DEEP, out: "판매용_템플릿/공동구매_공구플랫폼_상세IA", title: "공동구매(공구) 플랫폼 — 상세 IA" },
  admin: { data: ADMIN_DEEP, out: "판매용_템플릿/비즈니스관리_관리자시스템_상세IA", title: "통합 비즈니스 관리자 시스템 — 상세 IA" },
};
const key = (process.argv[2] ?? "groupbuy") as keyof typeof TEMPLATES;
const picked = TEMPLATES[key];
if (!picked) {
  throw new Error(`알 수 없는 템플릿: ${key} (가능: ${Object.keys(TEMPLATES).join(", ")})`);
}
const OUT = picked.out;
mkdirSync(OUT, { recursive: true });

const deep = expandDeep(picked.data);

// 엑셀 저장 헬퍼
function xlsx(name: string, sheet: string, rows: Record<string, string | number>[], widths: number[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = widths.map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheet);
  writeFileSync(`${OUT}/${name}`, XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  console.log(`  ✔ ${name} (${rows.length}행)`);
}

console.log("심화 생성 중...");

// 01·02 — 심화(1~3뎁스 + 화면ID)
xlsx("01_메뉴구조.xlsx", "메뉴구조", deep.menuTreeRows, [10, 18, 28, 24, 12]);
xlsx("02_IA_화면목록.xlsx", "화면목록", deep.iaRows, [14, 24, 20, 12, 8, 50, 30, 60]);

// 03·04 — 기존 exporter 재사용(잎사귀 단위)
xlsx("03_기능정의서.xlsx", "기능정의서", buildRequirementRows(deep.menus, deep.leafScreens), [12, 16, 22, 48, 10]);
xlsx("04_WBS.xlsx", "WBS", buildWbsRows(deep.menus, deep.leafScreens), [8, 18, 34, 12, 12, 12, 8]);

// 05 — FLOW(화면 2뎁스 대표 기준)
const flowNodes: ExportNode[] = deep.parentScreens.map((s) => ({ id: s.id, pageName: s.pageName, pageId: s.pageId }));
const flowEdges: ExportEdge[] = deep.buttonActions.map((b) => ({ from: b.screenId, to: b.targetScreenId, label: b.label }));
writeFileSync(`${OUT}/05_FLOW_흐름도.html`, buildFlowHtml(deep.project.concept, flowNodes, flowEdges), "utf8");
writeFileSync(`${OUT}/05_FLOW_흐름도.drawio`, buildDrawioXml(flowNodes, flowEdges), "utf8");
console.log(`  ✔ 05_FLOW_흐름도.html / .drawio (노드 ${flowNodes.length}, 연결 ${flowEdges.length})`);

// 06 — 메뉴구조 PPT(화면 2뎁스 대표 기준)
const pptMenus: PptMenu[] = deep.menus.map((m) => ({
  code: m.menuCode,
  name: m.nameKo,
  screens: deep.parentScreens.filter((s) => s.menuId === m.id).map((s) => ({ pageId: s.pageId, pageName: s.pageName })),
}));
await createMenuPptx(picked.title, pptMenus).writeFile({ fileName: `${OUT}/06_메뉴구조.pptx` });
console.log("  ✔ 06_메뉴구조.pptx");

// 07 — AI 빌드 스펙팩(잎사귀 전체 = 화면별 프롬프트 120~150종)
writeFileSync(`${OUT}/07_AI빌드_스펙팩.md`, buildSpecPackMarkdown(deep.project, deep.menus, deep.leafScreens, deep.buttonActions), "utf8");
writeFileSync(`${OUT}/07_AI빌드_스펙팩.json`, buildSpecPackJson(deep.project, deep.menus, deep.leafScreens, deep.buttonActions), "utf8");
console.log("  ✔ 07_AI빌드_스펙팩.md / .json");

// 08 — 검수 시나리오(화면 하나당 시나리오 하나)
const menuNameById = new Map(deep.menus.map((m) => [m.id, m.nameKo]));
const verify = buildTemplateVerifySheets(
  picked.title,
  deep.leafScreens.map((s) => ({
    pageId: s.pageId,
    pageName: s.pageName,
    menuName: menuNameById.get(s.menuId) ?? "",
    funcDef: s.funcDef ?? "",
    role: s.screenRole ?? "",
  })),
);
{
  const wb = XLSX.utils.book_new();
  const coverWs = XLSX.utils.aoa_to_sheet(verify.cover);
  coverWs["!cols"] = [{ wch: 3 }, { wch: 22 }, { wch: 74 }];
  XLSX.utils.book_append_sheet(wb, coverWs, "표지");
  const statusWs = XLSX.utils.aoa_to_sheet(verify.status);
  statusWs["!cols"] = [{ wch: 24 }, { wch: 46 }];
  XLSX.utils.book_append_sheet(wb, statusWs, "검수 현황");
  const scnWs = XLSX.utils.json_to_sheet(verify.scenarios);
  scnWs["!cols"] = [12, 16, 28, 12, 12, 40, 62, 10, 24].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, scnWs, "검수 시나리오");
  writeFileSync(`${OUT}/${verify.filename}`, XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  console.log(
    `  ✔ ${verify.filename} (시나리오 ${deep.leafScreens.length}개 / 확인항목 ${verify.scenarios.length}개)`,
  );
}

// 패키징이 README 수치로 쓸 실제 값
const stats = {
  title: picked.title,
  menus: deep.menus.length,
  screens: deep.leafScreens.length,
  requirements: buildRequirementRows(deep.menus, deep.leafScreens).length,
  buttonActions: deep.buttonActions.length,
  verifyScenarios: deep.leafScreens.length,
  verifyChecks: verify.scenarios.length,
};
writeFileSync(`${OUT}/_패키지정보.json`, JSON.stringify(stats, null, 2), "utf8");

console.log(`\n완료 → ${OUT}`);
console.log(
  `메뉴 ${stats.menus}개 · 화면(잎사귀) ${stats.screens}개 · 요건 ${stats.requirements}개 · 화면이동 ${stats.buttonActions}개`,
);
