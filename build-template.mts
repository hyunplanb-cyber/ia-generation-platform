// 판매용 템플릿 생성 스크립트 (일회성).
// 서비스의 exporter를 그대로 재사용해, IA 데이터 → 실제 판매 산출물 파일 일습을 만든다.
// API 크레딧 없이 진행하기 위해 IA 내용은 데이터로 직접 정의한다.
import { mkdirSync, writeFileSync } from "node:fs";
import * as XLSX from "xlsx";
import { buildMenuTreeRows, buildScreenListRows, buildWbsRows } from "./lib/export/excel-rows";
import { buildRequirementRows } from "./lib/export/requirements";
import { buildFlowHtml, buildDrawioXml, type ExportNode, type ExportEdge } from "./lib/export/flow-export";
import { createMenuPptx, type PptMenu } from "./lib/export/ppt-export";
import { buildSpecPackMarkdown, buildSpecPackJson } from "./lib/export/spec-pack";
import { buildTemplateVerifySheets } from "./lib/export/template-verify";
import type { Menu } from "./domain/menu/menu";
import type { Screen } from "./domain/screen/screen";
import type { ButtonAction } from "./domain/screen/button-action";
import { LMS } from "./template-data-lms";
import { BEAUTY } from "./template-data-beauty";
import { CREATOR } from "./template-data-creator";
import { TRAVEL } from "./template-data-travel";
import { ADMIN } from "./template-data-admin";
import { GROUPBUY } from "./template-data-groupbuy";

// 어떤 템플릿을 만들지 인자로 받는다: npx tsx build-template.mts lms | beauty
const TEMPLATES = {
  lms: { data: LMS, out: "판매용_템플릿/LMS_온라인강의플랫폼", title: "온라인 강의 플랫폼(LMS)" },
  beauty: { data: BEAUTY, out: "판매용_템플릿/뷰티샵_예약플랫폼", title: "뷰티샵 예약 플랫폼" },
  travel: { data: TRAVEL, out: "판매용_템플릿/해외투어_티켓예약", title: "해외 투어·티켓 예약 플랫폼" },
  admin: { data: ADMIN, out: "판매용_템플릿/비즈니스관리_관리자시스템", title: "통합 비즈니스 관리자 시스템" },
  groupbuy: { data: GROUPBUY, out: "판매용_템플릿/공동구매_공구플랫폼", title: "공동구매(공구) 플랫폼" },
  // 무료 샘플(약식) — 인스타 릴스 리드마그넷용
  creator: { data: CREATOR, out: "판매용_템플릿/_무료샘플_콘텐츠판매사이트", title: "1인 크리에이터 콘텐츠 판매 사이트" },
};
const key = (process.argv[2] ?? "lms") as keyof typeof TEMPLATES;
const picked = TEMPLATES[key];
if (!picked) {
  throw new Error(`알 수 없는 템플릿: ${key} (가능: ${Object.keys(TEMPLATES).join(", ")})`);
}
const SRC_DATA = picked.data;
const OUT = picked.out;
const START = new Date(SRC_DATA.project.overallStart);

mkdirSync(OUT, { recursive: true });

const now = new Date();
const menus: Menu[] = [];
const screens: Screen[] = [];
const buttonActions: ButtonAction[] = [];
const refToScreenId = new Map<string, string>();

// 1) 메뉴·화면을 도메인 형태로 전개 (일정은 화면당 순차 배분)
let dayCursor = 0;
SRC_DATA.menus.forEach((m, mi) => {
  const menuId = `menu-${m.code}`;
  menus.push({
    id: menuId,
    projectId: "tpl",
    nameKo: m.nameKo,
    nameEn: m.nameEn,
    menuCode: m.code,
    description: m.desc,
    desiredFeatures: null,
    sortOrder: mi,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  });

  m.screens.forEach((s, si) => {
    const pageId = `${m.code}-${String(si + 1).padStart(2, "0")}`;
    const screenId = `scr-${pageId}`;
    refToScreenId.set(s.ref, screenId);

    const start = new Date(START);
    start.setDate(start.getDate() + dayCursor);
    const end = new Date(start);
    end.setDate(end.getDate() + 1); // 화면당 2일
    dayCursor += 2;

    screens.push({
      id: screenId,
      projectId: "tpl",
      menuId,
      pageId,
      pageName: s.name,
      screenGroup: null,
      status: "active",
      screenRole: s.role,
      deviceCode: "R",
      funcDef: s.func,
      prompt: s.prompt,
      pageIdSource: "auto",
      pageNameSource: "auto",
      funcDefSource: "auto",
      promptSource: "auto",
      scheduleStart: start.toISOString().slice(0, 10),
      scheduleEnd: end.toISOString().slice(0, 10),
      scheduleLocked: false,
      promptFeedback: null,
      // 판매 템플릿은 사람이 오푸스로 직접 만든 것이라 다운로드 보강 대상이 아니다.
      enrichedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  });
});

// 2) 버튼 이동 연결
SRC_DATA.menus.forEach((m) => {
  m.screens.forEach((s) => {
    (s.btns ?? []).forEach(([label, targetRef], i) => {
      const screenId = refToScreenId.get(s.ref);
      const targetScreenId = refToScreenId.get(targetRef);
      if (!screenId || !targetScreenId) {
        throw new Error(`연결 오류: ${s.ref} → ${targetRef} (대상 없음)`);
      }
      const target = screens.find((x) => x.id === targetScreenId)!;
      buttonActions.push({
        id: `ba-${s.ref}-${i}`,
        screenId,
        label,
        targetScreenId,
        targetPageIdSnapshot: target.pageId,
        createdAt: now,
        updatedAt: now,
      });
    });
  });
});

// 3) 엑셀 저장 헬퍼
function xlsx(name: string, sheet: string, rows: Record<string, string | number>[], widths: number[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = widths.map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheet);
  // ESM 빌드의 writeFile은 Node에서 fs가 없어 실패한다 → 버퍼로 받아 직접 기록.
  writeFileSync(`${OUT}/${name}`, XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  console.log(`  ✔ ${name} (${rows.length}행)`);
}

console.log("생성 중...");

xlsx("01_메뉴구조.xlsx", "메뉴구조", buildMenuTreeRows(menus, screens), [12, 20, 12, 30]);
xlsx("02_IA_화면목록.xlsx", "화면목록", buildScreenListRows(menus, screens, buttonActions), [16, 12, 28, 12, 12, 50, 30, 60]);
xlsx("03_기능정의서.xlsx", "기능정의서", buildRequirementRows(menus, screens), [12, 16, 18, 48, 10]);
xlsx("04_WBS.xlsx", "WBS", buildWbsRows(menus, screens), [8, 18, 28, 12, 12, 8]);

// 4) FLOW (HTML + draw.io)
const flowNodes: ExportNode[] = screens.map((s) => ({ id: s.id, pageName: s.pageName, pageId: s.pageId }));
const flowEdges: ExportEdge[] = buttonActions.map((b) => ({ from: b.screenId, to: b.targetScreenId, label: b.label }));
writeFileSync(`${OUT}/05_FLOW_흐름도.html`, buildFlowHtml(SRC_DATA.project.concept, flowNodes, flowEdges), "utf8");
writeFileSync(`${OUT}/05_FLOW_흐름도.drawio`, buildDrawioXml(flowNodes, flowEdges), "utf8");
console.log(`  ✔ 05_FLOW_흐름도.html / .drawio (노드 ${flowNodes.length}, 연결 ${flowEdges.length})`);

// 5) 메뉴구조 PPT
const pptMenus: PptMenu[] = menus.map((m) => ({
  code: m.menuCode,
  name: m.nameKo,
  screens: screens.filter((s) => s.menuId === m.id).map((s) => ({ pageId: s.pageId, pageName: s.pageName })),
}));
await createMenuPptx(picked.title, pptMenus).writeFile({ fileName: `${OUT}/06_메뉴구조.pptx` });
console.log("  ✔ 06_메뉴구조.pptx");

// 6) AI 빌드용 스펙팩
writeFileSync(`${OUT}/07_AI빌드_스펙팩.md`, buildSpecPackMarkdown(SRC_DATA.project, menus, screens, buttonActions), "utf8");
writeFileSync(`${OUT}/07_AI빌드_스펙팩.json`, buildSpecPackJson(SRC_DATA.project, menus, screens, buttonActions), "utf8");
console.log("  ✔ 07_AI빌드_스펙팩.md / .json");

// 7) 검수 시나리오(화면 하나당 시나리오 하나)
const menuNameById = new Map(menus.map((m) => [m.id, m.nameKo]));
const verify = buildTemplateVerifySheets(
  picked.title,
  screens.map((s) => ({
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
    `  ✔ ${verify.filename} (시나리오 ${screens.length}개 / 확인항목 ${verify.scenarios.length}개)`,
  );
}

// 8) 패키징 스크립트가 README에 넣을 실제 수치를 남긴다.
//    예전엔 README에 LMS 수치(화면 37·요건 241)가 하드코딩돼 있어,
//    뷰티·여행 패키지를 사도 README만 LMS 숫자로 적혀 있었다.
const stats = {
  title: picked.title,
  menus: menus.length,
  screens: screens.length,
  requirements: buildRequirementRows(menus, screens).length,
  buttonActions: buttonActions.length,
  verifyScenarios: screens.length,
  verifyChecks: verify.scenarios.length,
};
writeFileSync(`${OUT}/_패키지정보.json`, JSON.stringify(stats, null, 2), "utf8");

console.log(`\n완료 → ${OUT}`);
console.log(
  `메뉴 ${stats.menus}개 · 화면 ${stats.screens}개 · 요건 ${stats.requirements}개 · 화면이동 ${stats.buttonActions}개`,
);
