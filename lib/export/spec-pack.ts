// AI 코딩 툴(Claude Code/Cowork)에 그대로 넘길 "빌드 스펙팩"을 만드는 순수 함수들.
// 프로젝트 컨셉 + 메뉴 + 화면별(기능정의·버튼이동·생성프롬프트) + FLOW를 한 벌로 정리한다.
import type { Menu } from "@/domain/menu/menu";
import type { Screen } from "@/domain/screen/screen";
import type { ButtonAction } from "@/domain/screen/button-action";

export interface SpecPackProject {
  concept: string;
  designConcept: string | null;
  deviceMode: string;
  overallStart: string;
  overallEnd: string;
}

function deviceLabel(mode: string): string {
  return mode === "pc" ? "PC 웹" : mode === "mobile" ? "모바일 웹(앱)" : "반응형";
}

// 정규화된 모델(마크다운·JSON 공용 소스).
export function buildSpecPackModel(
  project: SpecPackProject,
  menus: Menu[],
  screens: Screen[],
  buttonActions: ButtonAction[],
) {
  const menuName = new Map(menus.map((m) => [m.id, m.nameKo]));
  const scrById = new Map(screens.map((s) => [s.id, s]));

  return {
    project: {
      concept: project.concept,
      designConcept: project.designConcept ?? "",
      deviceMode: deviceLabel(project.deviceMode),
      schedule: { start: project.overallStart, end: project.overallEnd },
    },
    menus: menus.map((m) => ({
      code: m.menuCode,
      nameKo: m.nameKo,
      nameEn: m.nameEn,
      screens: screens
        .filter((s) => s.menuId === m.id)
        .map((s) => ({ pageId: s.pageId, pageName: s.pageName })),
    })),
    screens: screens.map((s) => ({
      pageId: s.pageId,
      pageName: s.pageName,
      menu: menuName.get(s.menuId) ?? "",
      funcDef: s.funcDef ?? "",
      prompt: s.prompt ?? "",
      buttons: buttonActions
        .filter((b) => b.screenId === s.id)
        .map((b) => {
          const t = scrById.get(b.targetScreenId);
          return {
            label: b.label,
            targetPageId: t ? t.pageId : "",
            targetPageName: t ? t.pageName : "(삭제됨)",
          };
        }),
      schedule: { start: s.scheduleStart ?? "", end: s.scheduleEnd ?? "" },
    })),
    flow: buttonActions
      .filter((b) => scrById.has(b.screenId) && scrById.has(b.targetScreenId))
      .map((b) => {
        const f = scrById.get(b.screenId)!;
        const t = scrById.get(b.targetScreenId)!;
        return {
          fromPageId: f.pageId,
          fromPageName: f.pageName,
          label: b.label,
          toPageId: t.pageId,
          toPageName: t.pageName,
        };
      }),
  };
}

export function buildSpecPackJson(
  project: SpecPackProject,
  menus: Menu[],
  screens: Screen[],
  buttonActions: ButtonAction[],
): string {
  return JSON.stringify(buildSpecPackModel(project, menus, screens, buttonActions), null, 2);
}

export function buildSpecPackMarkdown(
  project: SpecPackProject,
  menus: Menu[],
  screens: Screen[],
  buttonActions: ButtonAction[],
): string {
  const m = buildSpecPackModel(project, menus, screens, buttonActions);
  const lines: string[] = [];

  lines.push(`# ${m.project.concept || "프로젝트"} — AI 빌드 스펙팩`);
  lines.push("");
  lines.push(
    "> 이 문서 하나로 사이트를 만들 수 있게 정리한 스펙이에요. 화면별 **생성 프롬프트**를 그대로 사용하세요.",
  );
  lines.push("");

  lines.push("## 1. 프로젝트 개요");
  lines.push(`- **컨셉**: ${m.project.concept}`);
  lines.push(`- **디자인 컨셉**: ${m.project.designConcept || "(미입력)"}`);
  lines.push(`- **디바이스**: ${m.project.deviceMode}`);
  lines.push(`- **전체 일정**: ${m.project.schedule.start} ~ ${m.project.schedule.end}`);
  lines.push("");

  lines.push("## 2. 메뉴 구조");
  for (const menu of m.menus) {
    lines.push(`- **[${menu.code}] ${menu.nameKo}** (${menu.nameEn})`);
    for (const s of menu.screens) {
      lines.push(`  - \`${s.pageId}\` ${s.pageName}`);
    }
  }
  lines.push("");

  lines.push("## 3. 화면별 스펙");
  for (const s of m.screens) {
    lines.push(`### ${s.pageId} · ${s.pageName}`);
    lines.push(`- **소속 메뉴**: ${s.menu}`);
    if (s.schedule.start || s.schedule.end) {
      lines.push(`- **일정**: ${s.schedule.start} ~ ${s.schedule.end}`);
    }
    lines.push(`- **기능정의**: ${s.funcDef || "(미입력)"}`);
    if (s.buttons.length > 0) {
      lines.push(`- **버튼 → 이동화면**:`);
      for (const b of s.buttons) {
        lines.push(`  - \`${b.label}\` → \`${b.targetPageId}\` ${b.targetPageName}`);
      }
    }
    lines.push(`- **생성 프롬프트**:`);
    lines.push("");
    lines.push("  ```");
    lines.push(`  ${s.prompt || "(미입력)"}`);
    lines.push("  ```");
    lines.push("");
  }

  lines.push("## 4. 화면 이동 흐름 (FLOW)");
  if (m.flow.length === 0) {
    lines.push("- (정의된 이동 흐름 없음)");
  } else {
    for (const f of m.flow) {
      lines.push(
        `- \`${f.fromPageName}\`(${f.fromPageId}) —[${f.label}]→ \`${f.toPageName}\`(${f.toPageId})`,
      );
    }
  }
  lines.push("");

  lines.push("## 5. 빌드 가이드");
  lines.push("- 각 **화면ID**를 하나의 라우트/페이지로 만드세요.");
  lines.push("- 화면명은 페이지 제목·컴포넌트 이름의 기준으로 사용하세요.");
  lines.push("- **버튼 → 이동화면** 관계를 링크/네비게이션으로 연결하세요.");
  lines.push("- 각 화면의 **생성 프롬프트**를 그 화면 구현 지시로 그대로 사용하세요.");
  lines.push("- **디자인 컨셉**을 전역 스타일(색·톤·여백)에 반영하세요.");
  lines.push("");

  return lines.join("\n");
}
