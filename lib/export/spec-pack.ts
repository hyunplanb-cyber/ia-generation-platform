// AI 코딩 툴(Claude Code/Cowork)에 그대로 넘길 "빌드 스펙팩"을 만드는 순수 함수들.
// 프로젝트 컨셉 + 메뉴 + 화면별(기능정의·버튼이동·생성프롬프트) + FLOW를 한 벌로 정리한다.
import type { Menu } from "@/domain/menu/menu";
import type { Screen } from "@/domain/screen/screen";
import type { ButtonAction } from "@/domain/screen/button-action";
import { IMAGE_PLACEHOLDER } from "@/lib/design-presets";

export interface SpecPackProject {
  concept: string;
  /** 문서 제목. 판매팩처럼 정해진 이름이 있을 때만 넘긴다. 없으면 컨셉에서 뽑는다. */
  title?: string | null;
  designConcept: string | null;
  deviceMode: string;
  overallStart: string;
  overallEnd: string;
}

// 화면별 프롬프트에서 색상코드를 걷어낸다.
//
// 프롬프트는 "무엇을 만들지", 디자인 프리셋은 "어떻게 보일지"를 맡는다. 그런데
// 프롬프트 끝에 `#F5EFE9` 같은 값이 박혀 있으면, 산 사람이 다른 프리셋을 골랐을 때
// 지시가 둘이 되어 AI 코딩 도구가 "충돌한다"며 멈춘다(실제로 화면 130개 중 90개꼴로
// 박혀 있었다 — 2026-08-03).
//
// 만드는 쪽(사람이 쓴 템플릿·생성 AI 프롬프트)에서도 쓰지 말라고 일러 뒀지만,
// 생성팩은 AI가 쓰는 것이라 규칙을 어길 수 있다. 사용자는 그걸 열어 볼 방법도 없다.
// 그래서 내보내는 마지막 자리에서 한 번 더 지운다.
// 색 '이름'(네이비·베이지)까지 지우지는 않는다 — 문장이 깨지고, 그건 빌드 가이드의
// "프리셋이 우선" 규칙이 이미 막는다. 여기서는 기계가 그대로 따르는 값만 없앤다.
function cleanPrompt(prompt: string | null | undefined): string {
  const s = (prompt ?? "").trim();
  if (!s) return "";
  return s
    .replace(/\(\s*#[0-9A-Fa-f]{6}\s*\)/g, "") // "베이지(#F5EFE9)" → "베이지"
    .replace(/#[0-9A-Fa-f]{6}/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.·])/g, "$1")
    .trim();
}

/** 메뉴에 '누가 쓰는가'가 하나라도 적혀 있나. */
function hasAudience(menus: Menu[]): boolean {
  return menus.some((m) => m.audience && m.audience !== "customer");
}

// 문서 제목은 한 줄이어야 한다.
//
// 컨셉은 보통 여러 문장짜리 설명이라, 그대로 제목에 넣으면 문단이 통째로 제목이 된다
// (실제로 무료 샘플 스펙팩의 제목이 세 문장이었다 — 2026-08-03). 파일을 열었을 때
// 맨 처음 보이는 줄이라 첫인상을 그대로 결정한다.
// 정해진 이름이 있으면 그것을 쓰고, 없으면 컨셉의 첫 문장만 쓴다.
function packTitle(p: SpecPackProject): string {
  const given = p.title?.trim();
  if (given) return given;
  const first = p.concept.split(/(?<=[.!?。])\s+/)[0]?.trim() ?? "";
  return (first || p.concept.trim()).replace(/[.。]$/, "") || "프로젝트";
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
      title: packTitle(project),
      concept: project.concept,
      designConcept: project.designConcept ?? "",
      deviceMode: deviceLabel(project.deviceMode),
      schedule: { start: project.overallStart, end: project.overallEnd },
    },
    // 모든 화면이 공유하는 공통 요소 — 페이지마다 다시 만들지 말고 한 번 만들어 재사용.
    common: {
      globalNav: menus.map((m) => m.nameKo),
      // 손님 영역과 운영자 영역은 헤더가 다르다. 한 줄로 주면 8개가 한 헤더에
      // 나란히 붙어 "손님과 사장이 같은 화면을 쓰는" 사이트가 된다(2026-08-04).
      // 메뉴에 audience가 하나도 없으면(사용자가 만든 프로젝트) 이 값은 비어 있고,
      // 그때는 위 globalNav 하나만 쓴다.
      navByAudience: hasAudience(menus)
        ? {
            customer: menus.filter((m) => (m.audience ?? "customer") === "customer").map((m) => m.nameKo),
            owner: menus.filter((m) => m.audience === "owner").map((m) => m.nameKo),
            account: menus.filter((m) => m.audience === "account").map((m) => m.nameKo),
          }
        : null,
      header: "로고 + 검색 + 상단 내비게이션(GNB)",
      footer: "저작권 · 기본 링크",
      // 사진이 없는 단계에서 이미지 자리를 어떻게 그릴지. 이걸 안 적어두면
      // AI가 테마 색으로 이미지 자리를 채워서 화면이 그 색 덩어리가 된다.
      imagePlaceholder: {
        tones: IMAGE_PLACEHOLDER.tones,
        border: IMAGE_PLACEHOLDER.border,
        text: IMAGE_PLACEHOLDER.text,
        labelFormat: IMAGE_PLACEHOLDER.labelFormat,
        examples: IMAGE_PLACEHOLDER.examples,
        rule: IMAGE_PLACEHOLDER.rule,
      },
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
      prompt: cleanPrompt(s.prompt),
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

  lines.push(`# ${m.project.title} — AI 빌드 스펙팩`);
  lines.push("");
  lines.push(
    "> 이 문서 하나로 사이트를 만들 수 있게 정리한 스펙이에요. 화면별 **생성 프롬프트**를 그대로 사용하세요.",
  );
  lines.push("");

  lines.push("## 1. 프로젝트 개요");
  lines.push(`- **컨셉**: ${m.project.concept}`);
  // 안 골랐으면 줄을 아예 뺀다. "(미입력)"이 파는 문서에 남으면 만들다 만 것처럼 보이고,
  // AI에게도 아무 말도 아니다. 없으면 6장 빌드 가이드가 알아서 하나로 통일하라고 안내한다.
  if (m.project.designConcept) lines.push(`- **디자인 컨셉**: ${m.project.designConcept}`);
  lines.push(`- **디바이스**: ${m.project.deviceMode}`);
  lines.push(`- **전체 일정**: ${m.project.schedule.start} ~ ${m.project.schedule.end}`);
  lines.push("");

  lines.push("## 2. 공통 요소 (모든 화면 공통)");
  lines.push("> 아래 요소는 **한 번만 만들어 모든 화면에서 재사용**하세요. 각 화면 스펙(4장)은 이 공통 요소 위에 올라가는 콘텐츠만 설명합니다.");
  // 쓰는 사람이 갈리면 헤더도 갈린다. 한 줄로 주면 손님 메뉴와 사장 메뉴가
  // 한 헤더에 나란히 붙는다(2026-08-04).
  const nav = m.common.navByAudience;
  if (nav) {
    const q = (arr: string[]) => arr.map((n) => `\`${n}\``).join(" · ");
    lines.push("- **영역이 둘입니다. 헤더를 각각 따로 만드세요.**");
    lines.push(`  - **손님 화면 GNB**: ${q(nav.customer) || "(없음)"}`);
    lines.push(`  - **운영자 화면 GNB**: ${q(nav.owner) || "(없음)"} — 좌측 사이드바 + 상단 바 형태가 맞습니다`);
    if (nav.account.length) {
      lines.push(`  - **로그인·가입 화면**: ${q(nav.account)} — 헤더 없이 단독 화면으로 만드세요`);
    }
    lines.push(
      "  - 두 영역을 오가는 길은 **하나만** 둡니다 — 손님 화면 우측 상단 `매장 관리자로 전환`, 운영자 화면 우측 상단 `고객 화면 보기`. 한 계정이 두 권한을 가지며, 권한이 없으면 전환 버튼 대신 입점 신청으로 보냅니다(크몽·숨고와 같은 방식).",
    );
  } else {
    lines.push(`- **상단 내비게이션(GNB)**: ${m.common.globalNav.map((n) => `\`${n}\``).join(" · ") || "(없음)"} — 모든 화면 상단에 고정`);
  }
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
  // 2장의 GNB를 한 줄로 주다 보니, 고객 메뉴와 매장 관리자 메뉴가 한 헤더에 나란히
  // 붙은 사이트가 나왔다("매장 탐색·예약하기·내 예약 … 예약 관리·매장 운영·정산").
  // 손님과 사장이 같은 화면을 쓰는 서비스는 없다 — 그 순간 사이트 전체가 이상해진다(2026-08-04).
  lines.push(
    "- **쓰는 사람이 다른 메뉴는 헤더를 나누세요.** 손님이 쓰는 메뉴(둘러보기·예약·내 내역·리뷰)와 운영자가 쓰는 메뉴(예약 관리·매장 운영·정산·관리자)를 **한 헤더에 나란히 놓지 마세요.** 둘은 사실상 다른 사이트입니다.",
  );
  lines.push(
    "  · 손님 영역과 운영자 영역을 각각 다른 레이아웃(헤더·사이드바)으로 만들고, 오갈 때는 **따로 마련한 진입점** 하나로만 이동하세요(예: 우측 상단 `매장 관리자로 전환`, 관리자 화면에서는 `고객 화면 보기`).",
  );
  lines.push(
    "  · 운영자 영역은 보통 좌측 사이드바 + 상단 바가 맞습니다. 손님 영역의 검색·카테고리 내비를 그대로 쓰지 마세요.",
  );
  lines.push("- **버튼 → 이동화면** 관계를 링크/네비게이션으로 연결하세요.");
  // "반응하게 만드세요"라고만 썼더니 여전히 빈 <button>이 나왔다(2026-08-04).
  // 무엇을 하라는지가 없으면 안 한다. 둘로 갈라 못 박는다.
  lines.push("- **누를 수 있게 보이는 것은 전부 눌리게 만드세요.** 두 종류로 나눠 처리합니다.");
  lines.push(
    "  · **화면 안에서 끝나는 조작은 진짜로 동작해야 합니다** — 탭 전환, 좌측 카테고리·필터 선택, 목록에서 항목 고르기(디자이너·옵션·시간), 펼치기·접기, 캘린더 이전/다음 달, 수량 ±, 체크·토글. 자바스크립트로 실제 상태를 바꾸고 화면을 다시 그리세요. 이걸 안내 문구로 때우지 마세요.",
  );
  lines.push(
    "  · **서버가 있어야 하는 것만** 짧은 안내(토스트)로 대신합니다 — 저장·삭제·발송·결제·전화 걸기·이의 신청 등.",
  );
  lines.push(
    "  · 아무 것도 하지 않는 `<button>`을 남기지 마세요. 만들고 나서 **버튼을 하나씩 눌러 보고**, 반응이 없는 것이 있으면 위 둘 중 하나로 채우세요.",
  );
  // 서브 화면에서 돌아갈 길이 없어 갇히는 화면이 나왔다(2026-08-04).
  // 목록·상세·단계처럼 깊이 들어가는 화면은 반드시 나오는 길이 함께 있어야 한다.
  lines.push(
    "- **깊이 들어간 화면에는 나오는 길을 두세요.** 상세·입력·단계 화면 좌측 상단에 뒤로가기(←)와 현재 위치(예: `매장 탐색 › 매장 상세`)를 두고, 여러 단계짜리 흐름은 이전 단계로 돌아갈 수 있게 하세요.",
  );
  lines.push(
    "  · 빈 화면·오류·마감처럼 막다른 화면에는 **다음에 할 일 버튼**을 반드시 하나 두세요(예: `목록으로`, `다시 시도`, `둘러보기`).",
  );
  lines.push("### 화면 구현");
  lines.push("- 각 화면의 **생성 프롬프트**를 그 화면 구현 지시로 그대로 사용하세요.");
  lines.push("- 반복 UI(카드·리스트 행·폼·버튼)는 **공용 컴포넌트**로 만들어 재사용하세요.");
  lines.push("- 필요하면 상태 화면(로딩·빈 결과·에러)도 함께 만드세요.");
  lines.push("### 디자인");
  // 어느 쪽을 따를지 못 박아 둔다. 안 정해 두면 AI가 "지시가 충돌한다"며 멈추거나,
  // 산 사람이 고른 프리셋을 무시하고 개요의 색으로 만들어 버린다(2026-08-03).
  lines.push(
    "- **디자인 프리셋 파일을 함께 넣었다면 그것이 우선입니다.** 1장의 디자인 컨셉이나 화면별 프롬프트에 다른 색·톤이 적혀 있어도 프리셋을 따르세요. 충돌이 아니라 **프리셋이 정답**입니다.",
  );
  lines.push(
    "- 프리셋의 **레이아웃 골격**(히어로·목록·내비·상세를 어떻게 놓을지)을 먼저 잡고 색을 입히세요. 색만 맞추면 어떤 테마로 만들어도 같은 화면이 나옵니다.",
  );
  lines.push(
    m.project.designConcept
      ? "- 프리셋이 없다면 1장의 **디자인 컨셉**을 전역 스타일(색·톤·라운드·여백)로 토큰화해 일관되게 적용하세요."
      : "- 프리셋도 디자인 컨셉도 없다면, 색·글꼴·모서리·여백을 **먼저 한 벌 정해 토큰으로 고정한 뒤** 모든 화면에 그대로 쓰세요. 화면마다 다시 고르면 같은 사이트로 안 보입니다.",
  );
  lines.push("### 이미지 · 썸네일");
  lines.push(
    `- 아직 사진이 없으므로 이미지 자리는 **테마 색이 아니라 옅은 파스텔**로 채우세요. 테마 색으로 칠하면 화면이 그 색 덩어리로 뒤덮여 디자인이 안 보입니다.`,
  );
  lines.push(
    `- 배경 ${m.common.imagePlaceholder.tones.map((c) => `\`${c}\``).join(" · ")} 중 하나를 카드마다 돌려 쓰고, 테두리 \`${m.common.imagePlaceholder.border}\` 1px, 글자색 \`${m.common.imagePlaceholder.text}\` 13px.`,
  );
  lines.push(
    `- 자리 안에 \`${m.common.imagePlaceholder.labelFormat}\` 형식으로 적으세요. 예: ${m.common.imagePlaceholder.examples.map((e) => `\`${e}\``).join(" · ")}`,
  );
  for (const r of m.common.imagePlaceholder.rule) lines.push(`- ${r}`);
  lines.push("### 추천 스택");
  lines.push(
    "- 정적 다중 페이지(HTML/CSS) 또는 컴포넌트 기반(React·Next.js·Vue 등) 중 프로젝트 규모에 맞게 선택하세요. 화면이 많고 상태가 복잡하면 컴포넌트 기반을 권장합니다.",
  );
  lines.push("");

  return lines.join("\n");
}
