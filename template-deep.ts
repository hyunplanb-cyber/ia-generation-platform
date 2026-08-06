// 심화(상세) IA 확장기 — 판매용 템플릿 전용.
// 기존 37화면 데이터(TplMenu[])를 "2뎁스 화면"으로 두고, 화면마다 탭·상태·세부를
// "3뎁스 잎사귀"로 붙여 실무 IA 해상도(1~3뎁스 + 화면ID 체계)로 펼친다.
// lib/export(라이브 서비스 공용)는 건드리지 않고, 여기서 도메인 형태로 전개해
// 기존 exporter(요건·WBS·플로우·PPT·스펙팩)를 그대로 재사용한다.
import type { Menu, MenuAudience } from "./domain/menu/menu";
import type { Screen } from "./domain/screen/screen";
import type { ButtonAction } from "./domain/screen/button-action";
import { workdayStepper } from "./domain/schedule/distribute-schedule";
import type { TplMenu } from "./template-data-lms";

// 화면 하나에 매달리는 잎사귀(탭·상태·세부). 이름·역할·기능만 짧게 정의하면
// 프롬프트는 상위 화면 맥락 + 잎사귀 기능으로 자동 합성한다.
export interface DeepLeaf {
  name: string;
  role: string;
  func: string;
  /** 눌렀을 때 이 화면 안에서 끝나는 것 — [무엇을 누르면, 무엇이 바뀐다] */
  acts?: [string, string][];
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
//
// 디자인 컨셉을 여기에 붙이지 않는다.
// 붙였더니 화면 130개 중 90개꼴로 프롬프트 끝에 색이 박혔고("베이지 배경에 딥 플럼"),
// 산 사람이 디자인 프리셋(가이드 3종 × 레이아웃 2종)에서 다른 걸 골라도 프롬프트가
// 계속 그 색을 우겨 AI가 "지시가 충돌한다"고 멈췄다(2026-08-03).
// 프롬프트는 **무엇을 만들지**만 말하고, **어떻게 보일지**는 프리셋이 맡는다.
// 디자인 컨셉은 스펙팩 맨 앞(프로젝트 개요)에 한 번만 적힌다.
function leafPrompt(screenName: string, leaf: DeepLeaf): string {
  return P(`'${screenName}' 화면의 '${leaf.name}' ${leaf.role.includes("tab") ? "탭" : "상태·세부 화면"}을 만들어줘.
    ${leaf.func}.
    상위 화면(${screenName})의 레이아웃·컴포넌트·톤을 그대로 유지하면서 이 부분만 바뀐 상태를 보여줘.`);
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
  // 화면당 2일씩 차례로. 주말은 작업일로 잡지 않는다.
  const nextSlot = workdayStepper(project.overallStart, 2);

  const menus: Menu[] = [];
  const parentScreens: Screen[] = [];
  const leafScreens: Screen[] = [];
  const buttonActions: ButtonAction[] = [];
  const refToBaseId = new Map<string, string>();
  const iaRows: Row[] = [];
  const menuTreeRows: Row[] = [];

  tplMenus.forEach((m, mi) => {
    const menuId = `menu-${m.code}`;
    menus.push({
      id: menuId,
      projectId: "tpl",
      nameKo: m.nameKo,
      nameEn: m.nameEn,
      menuCode: m.code,
      description: m.desc,
      // 손님 것인지 운영자 것인지 — 스펙팩이 헤더를 나눌 때 쓴다(2뎁스와 같은 값).
      audience: "audience" in m ? (m as { audience?: MenuAudience }).audience : undefined,
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
      /* 「눌렀을 때」도 함께 물려준다.
         기본 잎사귀는 상위 화면 그 자체라 동작도 같아야 하는데, acts 만 안 따라가서
         프리미엄에는 화면 안 동작이 하나도 안 실렸다(2026-08-06). */
      const leaves: { name: string; role: string; func: string; prompt: string; label3: string;
        acts: [string, string][] }[] = [
        {
          name: s.name,
          role: s.role,
          func: s.func,
          prompt: s.prompt,
          label3: hasSubs ? "기본" : "",
          acts: s.acts ?? [],
        },
        ...extra.map((l) => ({
          name: l.name,
          role: l.role,
          func: l.func,
          prompt: leafPrompt(s.name, l),
          label3: l.name,
          acts: l.acts ?? [],
        })),
      ];

      refToBaseId.set(s.ref, `${m.code}${pad2(si)}01`);

      leaves.forEach((leaf, li0) => {
        const li = li0 + 1;
        const pageId = `${m.code}${pad2(si)}${pad2(li)}`;
        const slot = nextSlot();
        const fullName = li === 1 ? s.name : `${s.name} > ${leaf.name}`;

        const scr: Screen = {
          id: pageId,
          projectId: "tpl",
          menuId,
          pageId,
          pageName: fullName,
          screenGroup: null,
          status: "active",
          screenRole: leaf.role,
          deviceCode: "R",
          funcDef: leaf.func,
          prompt: leaf.prompt,
          acts: leaf.acts,
          pageIdSource: "auto",
          pageNameSource: "auto",
          funcDefSource: "auto",
          promptSource: "auto",
          scheduleStart: slot.scheduleStart,
          scheduleEnd: slot.scheduleEnd,
          scheduleLocked: false,
          promptFeedback: null,
          enrichedAt: null,
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
