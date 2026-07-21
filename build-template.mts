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
import type { Menu } from "./domain/menu/menu";
import type { Screen } from "./domain/screen/screen";
import type { ButtonAction } from "./domain/screen/button-action";
import { LMS } from "./template-data-lms";
import { BEAUTY } from "./template-data-beauty";

// 어떤 템플릿을 만들지 인자로 받는다: npx tsx build-template.mts lms | beauty
const TEMPLATES = {
  lms: { data: LMS, out: "판매용_템플릿/LMS_온라인강의플랫폼", title: "온라인 강의 플랫폼(LMS)" },
  beauty: { data: BEAUTY, out: "판매용_템플릿/뷰티샵_예약플랫폼", title: "뷰티샵 예약 플랫폼" },
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

console.log(`\n완료 → ${OUT}`);
console.log(`메뉴 ${menus.length}개 · 화면 ${screens.length}개 · 화면이동 ${buttonActions.length}개`);
