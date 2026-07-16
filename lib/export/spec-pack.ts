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
    // 모든 화면이 공유하는 공통 요소 — 페이지마다 다시 만들지 말고 한 번 만들어 재사용.
    common: {
      globalNav: menus.map((m) => m.nameKo),
      header: "로고 + 검색 + 상단 내비게이션(GNB)",
      footer: "저작권 · 기본 링크",
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

  lines.push("## 2. 공통 요소 (모든 화면 공통)");
  lines.push("> 아래 요소는 **한 번만 만들어 모든 화면에서 재사용**하세요. 각 화면 스펙(4장)은 이 공통 요소 위에 올라가는 콘텐츠만 설명합니다.");
  lines.push(`- **상단 내비게이션(GNB)**: ${m.common.globalNav.map((n) => `\`${n}\``).join(" · ") || "(없음)"} — 모든 화면 상단에 고정`);
  lines.push(`- **헤더**: ${m.common.header}`);
  lines.push(`- **푸터**: ${m.common.footer}`);
  lines.push(
    "- **재사용 컴포넌트**: 반복되는 UI(상품/항목 **카드**, 리스트 **행**, **폼 필드**, **버튼**)는 공용 컴포넌트로 만들어 화면마다 재사용하세요.",
  );
  lines.push("");

  lines.push("## 3. 메뉴 구조");
  for (const menu of m.menus) {
    lines.push(`- **[${menu.code}] ${menu.nameKo}** (${menu.nameEn})`);
    for (const s of menu.screens) {
      lines.push(`  - \`${s.pageId}\` ${s.pageName}`);
    }
  }
  lines.push("");

  lines.push("## 4. 화면별 스펙");
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

  lines.push("## 5. 화면 이동 흐름 (FLOW)");
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

  lines.push("## 6. 빌드 가이드");
  lines.push("### 구조");
  lines.push("- 각 **화면ID**를 하나의 라우트/페이지로 만드세요 (예: `PCHOME0110` → `/home`).");
  lines.push("- 화면명은 페이지 제목·컴포넌트 이름의 기준으로 사용하세요.");
  lines.push("- **2장 공통 요소**(헤더·GNB·푸터)를 공용 레이아웃으로 만들고 모든 화면이 감싸도록 하세요.");
  lines.push("- **버튼 → 이동화면** 관계를 링크/네비게이션으로 연결하세요.");
  lines.push("### 화면 구현");
  lines.push("- 각 화면의 **생성 프롬프트**를 그 화면 구현 지시로 그대로 사용하세요.");
  lines.push("- 반복 UI(카드·리스트 행·폼·버튼)는 **공용 컴포넌트**로 만들어 재사용하세요.");
  lines.push("- 필요하면 상태 화면(로딩·빈 결과·에러)도 함께 만드세요.");
  lines.push("### 디자인");
  lines.push("- **디자인 컨셉**을 전역 스타일(색·톤·라운드·여백)로 토큰화해 일관되게 적용하세요.");
  lines.push("### 추천 스택");
  lines.push(
    "- 정적 다중 페이지(HTML/CSS) 또는 컴포넌트 기반(React·Next.js·Vue 등) 중 프로젝트 규모에 맞게 선택하세요. 화면이 많고 상태가 복잡하면 컴포넌트 기반을 권장합니다.",
  );
  lines.push("");

  return lines.join("\n");
}
