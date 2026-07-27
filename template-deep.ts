// 심화(상세) IA 확장기 — 판매용 템플릿 전용.
// 기존 37화면 데이터(TplMenu[])를 "2뎁스 화면"으로 두고, 화면마다 탭·상태·세부를
// "3뎁스 잎사귀"로 붙여 실무 IA 해상도(1~3뎁스 + 화면ID 체계)로 펼친다.
// lib/export(라이브 서비스 공용)는 건드리지 않고, 여기서 도메인 형태로 전개해
// 기존 exporter(요건·WBS·플로우·PPT·스펙팩)를 그대로 재사용한다.
import type { Menu } from "./domain/menu/menu";
import type { Screen } from "./domain/screen/screen";
import type { ButtonAction } from "./domain/screen/button-action";
import type { TplMenu } from "./template-data-lms";

// 화면 하나에 매달리는 잎사귀(탭·상태·세부). 이름·역할·기능만 짧게 정의하면
// 프롬프트는 상위 화면 맥락 + 잎사귀 기능으로 자동 합성한다.
export interface DeepLeaf {
  name: string;
  role: string;
  func: string;
}
// key = 화면 ref, value = 그 화면에 추가로 붙일 잎사귀들(기본 화면은 자동 포함).
export type SubsMap = Record<string, DeepLeaf[]>;

export interface DeepProject {
  concept: string;
  designConcept: string;
  deviceMode: string;
  overallStart: string;
  overallEnd: string;
}
export interface DeepInput {
  project: DeepProject;
  menus: TplMenu[];
  subs: SubsMap;
}

type Row = Record<string, string | number>;
const pad2 = (n: number) => String(n).padStart(2, "0");
const P = (s: string) => s.trim().replace(/\n\s+/g, " ");

// 잎사귀(탭·상태) 프롬프트 자동 합성: 상위 화면 맥락을 유지하도록 지시.
function leafPrompt(screenName: string, leaf: DeepLeaf, designConcept: string): string {
  return P(`'${screenName}' 화면의 '${leaf.name}' ${leaf.role.includes("tab") ? "탭" : "상태·세부 화면"}을 만들어줘.
    ${leaf.func}.
    상위 화면(${screenName})의 레이아웃·컴포넌트·톤을 그대로 유지하면서 이 부분만 바뀐 상태를 보여줘.
    ${designConcept}`);
}

export interface DeepResult {
  project: DeepProject;
  menus: Menu[];
  parentScreens: Screen[]; // 화면(2뎁스) 대표 = 각 화면의 '기본' 잎사귀. 플로우·PPT용.
  leafScreens: Screen[]; // 잎사귀(3뎁스) 전체. 요건·WBS·스펙팩용.
  buttonActions: ButtonAction[];
  iaRows: Row[]; // 02_IA 화면목록(심화): 1~3뎁스 + 화면ID
  menuTreeRows: Row[]; // 01_메뉴구조(심화)
}

export function expandDeep(input: DeepInput): DeepResult {
  const { menus: tplMenus, subs, project } = input;
  const now = new Date();
  const START = new Date(project.overallStart);

  const menus: Menu[] = [];
  const parentScreens: Screen[] = [];
  const leafScreens: Screen[] = [];
  const buttonActions: ButtonAction[] = [];
  const refToBaseId = new Map<string, string>();
  const iaRows: Row[] = [];
  const menuTreeRows: Row[] = [];
  let dayCursor = 0;

  tplMenus.forEach((m, mi) => {
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

    m.screens.forEach((s, si0) => {
      const si = si0 + 1;
      const extra = subs[s.ref] ?? [];
      const hasSubs = extra.length > 0;
      // 기본 잎사귀(01)는 기존 화면의 풍부한 기능·프롬프트를 그대로 물려받는다.
      const leaves: { name: string; role: string; func: string; prompt: string; label3: string }[] = [
        {
          name: s.name,
          role: s.role,
          func: s.func,
          prompt: s.prompt,
          label3: hasSubs ? "기본" : "",
        },
        ...extra.map((l) => ({
          name: l.name,
          role: l.role,
          func: l.func,
          prompt: leafPrompt(s.name, l, project.designConcept),
          label3: l.name,
        })),
      ];

      refToBaseId.set(s.ref, `${m.code}${pad2(si)}01`);

      leaves.forEach((leaf, li0) => {
        const li = li0 + 1;
        const pageId = `${m.code}${pad2(si)}${pad2(li)}`;
        const start = new Date(START);
        start.setDate(start.getDate() + dayCursor);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        dayCursor += 2;
        const fullName = li === 1 ? s.name : `${s.name} > ${leaf.name}`;

        const scr: Screen = {
          id: pageId,
          projectId: "tpl",
          menuId,
          pageId,
          pageName: fullName,
          status: "active",
          screenRole: leaf.role,
          deviceCode: "R",
          funcDef: leaf.func,
          prompt: leaf.prompt,
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
        };
        leafScreens.push(scr);
        if (li === 1) parentScreens.push(scr);

        iaRows.push({
          "1Depth(메뉴)": li === 1 ? m.nameKo : "",
          "2Depth(화면)": li === 1 ? s.name : "",
          "3Depth(탭·상태)": leaf.label3,
          화면ID: pageId,
          디바이스: "반응형",
          "설명·기능정의": leaf.func,
          "버튼 → 이동화면": "",
          "생성 프롬프트": leaf.prompt,
        });
        menuTreeRows.push({
          메뉴코드: li === 1 ? m.code : "",
          "1Depth 메뉴": li === 1 ? m.nameKo : "",
          "2Depth 화면": li === 1 ? s.name : "",
          "3Depth 탭·상태": leaf.label3,
          화면ID: pageId,
        });
      });
    });
  });

  // 버튼 이동은 화면(2뎁스) 대표 = 기본 잎사귀 사이로 연결한다.
  tplMenus.forEach((m) =>
    m.screens.forEach((s) => {
      (s.btns ?? []).forEach(([label, targetRef], i) => {
        const from = refToBaseId.get(s.ref);
        const to = refToBaseId.get(targetRef);
        if (!from || !to) {
          throw new Error(`연결 오류: ${s.ref} → ${targetRef} (대상 없음)`);
        }
        const target = leafScreens.find((x) => x.id === to)!;
        buttonActions.push({
          id: `ba-${s.ref}-${i}`,
          screenId: from,
          label,
          targetScreenId: to,
          targetPageIdSnapshot: target.pageId,
          createdAt: now,
          updatedAt: now,
        });
      });
    }),
  );

  // IA 심화 시트의 '버튼 → 이동화면' 칸을 기본 잎사귀 행에 채운다.
  const byId = new Map(leafScreens.map((s) => [s.id, s]));
  for (const row of iaRows) {
    const id = row["화면ID"] as string;
    const links = buttonActions
      .filter((b) => b.screenId === id)
      .map((b) => {
        const t = byId.get(b.targetScreenId);
        return `${b.label} → ${t ? t.pageName : "(삭제됨)"}`;
      })
      .join("\n");
    if (links) row["버튼 → 이동화면"] = links;
  }

  return { project, menus, parentScreens, leafScreens, buttonActions, iaRows, menuTreeRows };
}
