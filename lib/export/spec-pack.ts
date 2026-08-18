// AI 코딩 툴(Claude Code/Cowork)에 그대로 넘길 "빌드 스펙팩"을 만드는 순수 함수들.
// 프로젝트 컨셉 + 메뉴 + 화면별(기능정의·버튼이동·생성프롬프트) + FLOW를 한 벌로 정리한다.
import type { Menu } from "@/domain/menu/menu";
import type { Screen } from "@/domain/screen/screen";
import type { ButtonAction } from "@/domain/screen/button-action";
import {
  IMAGE_PLACEHOLDER, CONTENT_WIDTH, READING_WIDTH, COMMON_RULES,
  NARROW_OVERFLOW, SINGLE_SOURCE_DATA,
} from "@/lib/design-presets";

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

/**
 * 화면마다 뒤로가기가 어디로 가는지 미리 정해 준다.
 *
 * "깊이 들어간 화면에는 나오는 길을 두세요"라고 글로 적었더니, 만들어진 사이트에서
 * 2뎁스 이상 125개 중 **125개 전부**에 뒤로가기가 없었다(2026-08-04). 어디까지가
 * '깊이 들어간' 것인지 판단을 맡기면 안 붙인다. 그래서 판단을 없앤다 —
 * 화면마다 "뒤로가기는 이 화면으로"를 스펙에 박아 두면 그대로 만들기만 하면 된다.
 *
 * 규칙은 셋이다.
 *   · 메뉴의 첫 화면      → 뒤로가기 없음 (GNB로 오간다)
 *   · 탭 화면             → 형제다. 기본 탭이 가는 곳으로 똑같이 간다
 *   · 그 밖의 하위 화면   → 이름 앞부분이 가리키는 상위 화면으로, 없으면 메뉴 첫 화면
 */
/** 기능정의 글에서 «화면 안에서 끝나는 동작»을 뽑는다.
 *
 * ⛔ 2026-08-18: 화면 스펙에 `acts`(눌렀을 때 화면 안에서 끝남) 칸이 2026-08-06에
 *   생겼는데 **채우는 곳이 없었다.** 146개 화면 전부 비어 있었다.
 *   그래서 팩은 「상태별 탭·정렬 옵션·검색 필터」를 기능정의에 적어 주고도
 *   «그게 실제로 걸러야 한다»는 말을 한 번도 안 했고, 만들어진 사이트는
 *   칩 색만 바뀌고 목록은 그대로인 포스터가 됐다(칩 있는 화면 68개).
 *   그 칸의 주석이 이미 그렇게 경고하고 있었다 — 칸만 있고 값이 없었을 뿐이다.
 *
 * 새 데이터를 만들지 않는다. 이미 손님에게 주고 있는 기능정의 글에서 찾아낸다. */
const 화면안동작규칙: [RegExp, string][] = [
  [/필터|거르|분류/, "고른 조건에 **맞는 것만 남기고** 나머지는 감춥니다. 하나도 안 남으면 「결과가 없습니다」를 보여줍니다"],
  [/정렬|순으로|최신순|인기순/, "고른 기준으로 **순서를 실제로 바꿔** 다시 그립니다"],
  [/탭/, "고른 탭의 내용만 보여줍니다. 탭을 옮겨도 **화면 주소는 그대로**입니다(뒤로가기가 탭에 끼어들면 안 됩니다)"],
  [/검색/, "입력한 말이 든 것만 남깁니다. 없으면 「검색 결과가 없습니다」와 다시 찾는 길을 보여줍니다"],
  [/체크박스|선택|전체 선택/, "고른 개수를 **숫자로 보여주고**, 하나도 안 골랐으면 일괄 단추를 눌리지 않게 둡니다"],
  [/수량|개수 조절|더하기|빼기/, "누를 때마다 **숫자와 합계가 같이** 바뀝니다"],
  [/펼치|접기|아코디언|더 보기/, "누르면 그 자리에서 펴지고 접힙니다. 다른 화면으로 가지 않습니다"],
  [/토글|켜기|끄기|알림 설정/, "누르면 **켜짐·꺼짐이 눈에 보이게** 바뀌고 그대로 남습니다"],
  [/페이지네이션|페이지 번호/, "누른 쪽의 목록으로 **내용이 바뀌고**, 지금 쪽이 표시됩니다"],
];
function 화면안동작(funcDef: string): string[] {
  const 글 = funcDef ?? "";
  const 나온것: string[] = [];
  for (const [말, 해야할일] of 화면안동작규칙) {
    const m = 말.exec(글);
    if (m) 나온것.push(`${m[0]} — ${해야할일}`);
  }
  return 나온것;
}

function backTargets(menus: Menu[], screens: Screen[]): Map<string, Screen> {
  const back = new Map<string, Screen>();
  // 이름이 "… 탭"으로 끝나면 탭으로 갈라진 화면이다.
  const isTab = (s: Screen) => /탭$/.test(s.pageName.trim());

  for (const menu of menus) {
    const mine = screens.filter((s) => s.menuId === menu.id);
    const top = mine[0];
    if (!top) continue;
    const byName = new Map(mine.map((s) => [s.pageName, s]));

    // "예약 상세 > 완료 탭" 이면 "예약 상세"를 가리킨다.
    /* ⛔ 2026-08-18: 여기가 «플로우를 잘못 계산하던» 자리다.
       상세 IA 는 «메뉴 → 화면(screenGroup) → 상태·탭(pageName)» 3뎁스인데,
       이 함수는 pageName 안의 " > " 만 봤다. 펫 유치원 146개를 실측하니
       screenGroup 이 있는 화면 146개, pageName 에 " > " 가 있는 화면 **0개** —
       즉 모든 화면이 «메뉴 첫 화면»으로 떨어지고 있었다. 「프로그램 상세」의 탭이
       「프로그램 목록」이 아니라 「전체 목록」으로 가던 것이 그 탓이다.
       그룹을 먼저 보고, 그룹이 없는 옛 2뎁스 프로젝트에서만 예전 방식을 쓴다. */
    const 그룹첫화면 = new Map<string, Screen>();
    for (const g of mine) {
      const 이름 = (g as { screenGroup?: string | null }).screenGroup;
      if (이름 && !그룹첫화면.has(이름)) 그룹첫화면.set(이름, g);
    }
    const namedParent = (s: Screen): Screen | undefined => {
      const 그룹 = (s as { screenGroup?: string | null }).screenGroup;
      if (그룹) {
        const 첫 = 그룹첫화면.get(그룹);
        // 그룹의 첫 화면이면 그룹 밖(메뉴 첫 화면)으로 나간다 — resolve 가 처리한다
        return 첫 && 첫.id !== s.id ? 첫 : undefined;
      }
      const cut = s.pageName.lastIndexOf(" > ");
      if (cut <= 0) return undefined;
      const p = byName.get(s.pageName.slice(0, cut));
      return p && p.id !== s.id ? p : undefined;
    };

    /* 탭은 상위가 아니라 형제다.
       "이용 안내 > 진행자용 탭"이 가리키는 "이용 안내"는 한 단계 위가 아니라
       그냥 기본 탭이다. 그걸 뒤로가기 목적지로 삼으면 두 가지가 어긋난다 —
       탭을 오가는 데 뒤로가기가 끼어들고, 기본 탭에만 뒤로가기가 없어서
       같은 계위인데 있다 없다 하는 화면이 된다.
       그래서 탭이면 형제를 건너뛰고 그 위가 가는 곳을 그대로 쓴다(2026-08-06). */
    const resolve = (s: Screen, seen: Set<string>): Screen | undefined => {
      if (s.id === top.id) return undefined; // 메뉴 첫 화면은 나갈 길이 GNB다
      if (seen.has(s.id)) return top; // 이름이 서로를 물면 여기서 끊는다
      seen.add(s.id);
      const p = namedParent(s);
      if (!p) return top;
      return isTab(s) ? resolve(p, seen) : p;
    };

    for (const s of mine) {
      if (s.id === top.id) continue;
      const t = resolve(s, new Set());
      if (t) back.set(s.id, t);
    }
  }
  return back;
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

/* ─────────────────────────────────────────────────────────────
   앱으로 낼 때만 더 필요한 것 (deviceMode === "mobile")

   2026-08-10 까지 「모바일 웹(앱)」을 골라도 스펙팩은 «디바이스: 모바일 웹(앱)»
   한 줄만 달랐다. 화면 구성은 PC 웹과 똑같이 나갔다.

   그런데 앱은 브라우저가 아니다. 주소창이 없으니 뒤로가기를 화면 안에 둬야 하고,
   폰 기능을 쓰려면 권한을 물어야 하고, 거절당했을 때 보여줄 화면이 있어야 한다.
   그 화면들이 설계도에 없으면 AI 는 만들지 않는다 — 시키지 않은 것은 안 나온다.

   자세한 까닭은 팩에 함께 들어가는 `10_앱으로_내놓는_법.html` 에 있다.
   ───────────────────────────────────────────────────────────── */
const APP_EXTRA = {
  why: "앱은 브라우저가 아닙니다. 주소창도 뒤로가기 버튼도 없고, 폰 기능을 쓰려면 사용자에게 물어야 합니다. 아래는 «앱으로 낼 때만» 더 필요한 것입니다.",
  screens: [
    {
      name: "권한 안내",
      role: "permission-intro",
      funcDef:
        "권한을 묻기 «직전»에 왜 필요한지 한 화면으로 설명 · 무엇을 할 수 있게 되는지 한 줄 · [허용하고 계속] [나중에] 두 버튼 · 앱을 켜자마자 띄우지 않는다(그 기능을 처음 쓰는 자리에서 띄운다)",
    },
    {
      name: "권한 거부됨",
      role: "permission-denied",
      funcDef:
        "거절한 뒤에도 앱이 굴러간다는 것을 보여 주는 화면 · 그 기능만 못 쓴다는 안내 · 대신 할 수 있는 길 제시 · [설정에서 켜기] 버튼(폰 설정으로 보냄) · 심사관이 «일부러 거절해» 보므로 하얀 화면이 되면 반려된다",
    },
    {
      name: "알림 설정",
      role: "notification-settings",
      funcDef:
        "알림 종류별 켜기·끄기 스위치 · 지금 꺼져 있으면 그 사실과 켜는 길 안내 · 조용한 시간대 설정 · 알림을 쓰는 앱이면 반드시 있어야 한다",
    },
    {
      name: "연결 끊김",
      role: "offline",
      funcDef:
        "인터넷이 없을 때 나오는 화면 · 하얀 화면 대신 무엇이 안 되는지 설명 · 마지막으로 받아 둔 내용은 볼 수 있게 · [다시 시도] 버튼",
    },
  ],
  rules: [
    "**뒤로가기를 화면 안에 둡니다.** 앱에는 브라우저 주소창이 없어 「이전 화면으로」가 없습니다. 첫 화면이 아닌 모든 화면 좌측 상단에 `‹ 상위 화면` 을 둡니다.",
    "**하단 탭 바**를 씁니다. 상단 GNB 는 폰에서 손가락이 안 닿습니다. 주요 메뉴 3~5개를 화면 아래에 고정하세요.",
    "**권한은 쓰는 순간에 묻습니다.** 앱을 켜자마자 알림·카메라·위치를 연달아 물으면 대부분 거절합니다.",
    "**누르는 자리는 최소 44×44px.** 손가락은 마우스보다 굵습니다.",
    "**아래쪽 여백을 넉넉히** 둡니다. 폰 아래 끝은 홈 바에 가려집니다.",
    "**가로 스크롤이 생기면 안 됩니다.** 표가 넓으면 표만 따로 좌우로 밀리게 하고, 화면 자체는 밀리지 않게 하세요.",
  ],
  storeNote:
    "스토어에 올릴 계획이라면 팩에 함께 들어 있는 `10_앱으로_내놓는_법.html` 을 먼저 읽으세요. 사이트를 그대로 감싼 앱은 애플 심사에서 반려됩니다.",
};

// 정규화된 모델(마크다운·JSON 공용 소스).
export function buildSpecPackModel(
  project: SpecPackProject,
  menus: Menu[],
  screens: Screen[],
  buttonActions: ButtonAction[],
) {
  const menuName = new Map(menus.map((m) => [m.id, m.nameKo]));
  const scrById = new Map(screens.map((s) => [s.id, s]));
  const back = backTargets(menus, screens);

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
      /* 콘텐츠 영역은 한 사이트에 하나여야 한다. 헤더는 1200 인데 본문만 1440 이라
         위아래가 120px 어긋난 사이트가 있었다 — 폭을 한 곳에서 정하게 못 박는다(2026-08-06). */
      contentWidth: {
        max: CONTENT_WIDTH.max,
        paddingX: CONTENT_WIDTH.padX,
        note: "헤더·본문·푸터·하단 고정 바가 모두 이 폭을 쓴다. 화면마다 따로 정하지 않는다.",
      },
      /* 글을 한 단으로 좁힐 때의 폭. 이 값이 없어서 상세 본문 폭이 화면마다 갈렸다 —
         가이드 글에만 680·720·760 세 벌로 적혀 있었고 둘은 근거가 없었다(2026-08-09). */
      readingWidth: {
        max: `${READING_WIDTH}px`,
        note: "글이 주인공인 자리(상세 본문·안내·약관)만. 콘텐츠 영역 안에서 좁히고 가운데 정렬한다.",
      },
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
      /* 좁은 폭에서 페이지가 좌우로 밀리는 문제. 「반응형」이라고만 적혀 있었고
         «넘치면 안 된다»는 말이 없었다 — 실측에서 여덟 화면이 밀렸다(2026-08-18). */
      narrowOverflow: {
        testWidth: NARROW_OVERFLOW.testWidth,
        rule: NARROW_OVERFLOW.rule,
      },
      /* 손님이 자기 정보로 바꿀 값. 한 곳에 안 모으면 옛 상호가 남는다(2026-08-18). */
      singleSourceData: {
        fields: SINGLE_SOURCE_DATA.fields,
        rule: SINGLE_SOURCE_DATA.rule,
      },
      /* 앱으로 낼 때만. PC 웹·반응형이면 null 이고 스펙에 아예 안 나온다 —
         안 쓸 것을 적어 두면 AI 가 쓸데없는 화면을 만든다. */
      appExtra: project.deviceMode === "mobile" ? APP_EXTRA : null,
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
      // 이 화면의 뒤로가기가 가는 곳. 메뉴 첫 화면이면 null(나갈 길이 GNB다).
      // 판단을 맡기지 않으려고 미리 정해 준다 — 이유는 backTargets 주석 참고.
      backTo: back.get(s.id)
        ? { pageId: back.get(s.id)!.pageId, pageName: back.get(s.id)!.pageName }
        : null,
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
      // 화면 안에서 끝나는 조작 — [무엇을 누르면, 무엇이 바뀐다]
      /* ⛔ 죽은 칸 `acts` 를 뺐다 (2026-08-18). 2026-08-06 에 만들면서 채우는 곳을
         안 만들어 146개 화면 전부 빈 채로 나갔다. 그 일을 하는 것은 바로 위
         `화면안동작` 이다 — 기능정의 글에서 뽑는다. 칸만 있고 값이 없으면
         있는 줄 알고 아무도 다시 안 본다. check-pack.mts 가 이걸 센다. */
      화면안동작: 화면안동작(s.funcDef ?? ""),
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
    // 업종에 매이지 않게 쓴다. 여기 이름을 박아 두면 콘텐츠 판매 사이트에도
    // "매장 관리자로 전환"이 나온다(2026-08-04).
    lines.push(
      `  - 두 영역을 오가는 길은 **하나만** 둡니다 — 손님 화면 우측 상단에 운영자 영역으로 넘어가는 버튼 하나(예: \`${(nav.owner[0] ?? "운영").replace(/\s*\(.*\)$/, "")} 화면으로\`), 운영자 화면 우측 상단에 \`고객 화면 보기\`. 한 계정이 두 권한을 가지며(크몽·숨고와 같은 방식), 아직 권한이 없으면 전환 대신 **신청 화면으로 보냅니다.**`,
    );
  } else {
    lines.push(`- **상단 내비게이션(GNB)**: ${m.common.globalNav.map((n) => `\`${n}\``).join(" · ") || "(없음)"} — 모든 화면 상단에 고정`);
  }
  lines.push(
    `- **콘텐츠 영역**: 최대 ${m.common.contentWidth.max}, 좌우 여백 ${m.common.contentWidth.paddingX} — ` +
      `${m.common.contentWidth.note} 화면마다 폭을 새로 정하면 위아래가 어긋납니다.`,
  );
  /* 읽기 폭이 여기 없어서, 상세 본문을 콘텐츠 폭 그대로 꽉 채운 화면이 나왔다.
     한 줄 90자가 넘으면 다음 줄 첫 글자를 눈이 못 찾는다(2026-08-09). */
  lines.push(
    `- **읽기 폭**: 글이 주인공인 자리(상세 본문·안내·약관)는 최대 ${m.common.readingWidth.max}로 좁혀 ` +
      `콘텐츠 영역 **안에서** 가운데 정렬 — 카드 격자에는 쓰지 않습니다. 아래 「읽기 폭」 참고.`,
  );
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
    // 뒤로가기를 화면마다 못 박는다. 글로만 적었을 때는 2뎁스 이상 125개 중
    // 125개 전부에 안 붙었다(2026-08-04). 판단할 것을 남기지 않는다.
    lines.push(
      s.backTo
        ? `- **뒤로가기**: 좌측 상단에 \`‹ ${s.backTo.pageName}\` — 누르면 \`${s.backTo.pageId}\`로 간다`
        : `- **뒤로가기**: 없음 (메뉴의 첫 화면 — GNB로 오간다)`,
    );
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
    /* 눌렀을 때 이 화면 안에서 끝나는 것.
       이 칸이 없던 동안 버튼에 적을 수 있는 것은 "어느 화면으로 가는가" 하나뿐이었고,
       그래서 만들어진 사이트는 눌러도 값이 안 바뀌는 포스터가 됐다.
       화면이 바뀌는 것은 위(버튼 → 이동화면), 화면 안에서 끝나는 것은 여기다(2026-08-06). */
    if (s.화면안동작.length > 0) {
      lines.push(`- **눌렀을 때 화면 안에서 끝나는 것** — 여기가 «포스터»가 되기 제일 쉬운 자리입니다:`);
      for (const 한줄 of s.화면안동작) lines.push(`  - ${한줄}`);
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
  const backCount = m.screens.filter((s) => s.backTo).length;
  lines.push("### 구조");
  lines.push("- 각 **화면ID**를 하나의 라우트/페이지로 만드세요 (예: `PCHOME0110` → `/home`).");
  lines.push("- 화면명은 페이지 제목·컴포넌트 이름의 기준으로 사용하세요.");
  lines.push("- **2장 공통 요소**(헤더·GNB·푸터)를 공용 레이아웃으로 만들고 모든 화면이 감싸도록 하세요.");
  // 2장의 GNB를 한 줄로 주다 보니, 고객 메뉴와 매장 관리자 메뉴가 한 헤더에 나란히
  // 붙은 사이트가 나왔다("매장 탐색·예약하기·내 예약 … 예약 관리·매장 운영·정산").
  // 손님과 사장이 같은 화면을 쓰는 서비스는 없다 — 그 순간 사이트 전체가 이상해진다(2026-08-04).
  // 예시는 이 팩의 메뉴 이름에서 만든다. 여기 업종 이름을 박아 두면 LMS 팩에도
  // "매장 관리자로 전환"이 나온다 — 2장의 안내는 고쳤는데 여기만 남아 있었다(2026-08-04).
  const gnbNav = m.common.navByAudience;
  const 손님예 = gnbNav?.customer.slice(0, 4).join("·") || "둘러보기·내 내역";
  const 운영예 = gnbNav?.owner.slice(0, 4).join("·") || "운영 관리·정산";
  // 버튼에 넣을 이름이라 `공구 개설(총대)`의 괄호는 뗀다.
  const 전환버튼 = (gnbNav?.owner[0] ?? "운영").replace(/\s*\(.*\)$/, "");
  lines.push(
    `- **쓰는 사람이 다른 메뉴는 헤더를 나누세요.** 손님이 쓰는 메뉴(${손님예})와 운영자가 쓰는 메뉴(${운영예})를 **한 헤더에 나란히 놓지 마세요.** 둘은 사실상 다른 사이트입니다.`,
  );
  lines.push(
    `  · 손님 영역과 운영자 영역을 각각 다른 레이아웃(헤더·사이드바)으로 만들고, 오갈 때는 **따로 마련한 진입점** 하나로만 이동하세요(예: 우측 상단 \`${전환버튼} 화면으로\`, 운영자 화면에서는 \`고객 화면 보기\`).`,
  );
  lines.push(
    "  · 운영자 영역은 보통 좌측 사이드바 + 상단 바가 맞습니다. 손님 영역의 검색·카테고리 내비를 그대로 쓰지 마세요.",
  );
  lines.push("- **버튼 → 이동화면** 관계를 링크/네비게이션으로 연결하세요.");
  // "반응하게 만드세요"라고만 썼더니 여전히 빈 <button>이 나왔다(2026-08-04).
  // 무엇을 하라는지가 없으면 안 한다. 둘로 갈라 못 박는다.
  /* 글로 "동작하게 만드세요"라고 백 번 써도, 화면 명세가 생김새만 적고 있으면 안 된다.
     AI 는 문단보다 구조를 따른다. 그래서 화면마다 「눌렀을 때」 항목을 두고,
     여기서는 그 항목을 가리키기만 한다(2026-08-06). */
  lines.push(
    "- **4장 각 화면의 `눌렀을 때 (이 화면 안에서 끝남)` 항목을 그대로 만드세요.** 적혀 있는 것은 빠짐없이 실제로 동작해야 합니다 — 누르면 값이 바뀌고, 다시 누르면 되돌아옵니다.",
  );
  lines.push(
    "  · 그 항목에 없더라도 **누를 수 있게 생긴 것은 전부 눌리게** 만드세요. 적힌 것은 최소한이지 전부가 아닙니다.",
  );
  lines.push("- **누를 수 있게 보이는 것은 전부 눌리게 만드세요.** 두 종류로 나눠 처리합니다.");
  lines.push(
    "  · **화면 안에서 끝나는 조작은 진짜로 동작해야 합니다** — 탭 전환, 좌측 카테고리·필터 선택, 목록에서 항목 고르기(디자이너·옵션·시간), 펼치기·접기, 캘린더 이전/다음 달, 수량 ±, 체크·토글. 자바스크립트로 실제 상태를 바꾸고 화면을 다시 그리세요. 이걸 안내 문구로 때우지 마세요.",
  );
  lines.push(
    "  · **서버가 있어야 하는 것만** 짧은 안내(토스트)로 대신합니다 — 저장·삭제·발송·결제·전화 걸기·이의 신청 등.",
  );
  // 안내로 때운 버튼이 378개나 나왔다. '선택'·'모두 보기'처럼 화면 안에서 끝나는
  // 것까지 토스트로 넘겨서, 눌러도 아무것도 안 일어나는 것과 다름없었다(2026-08-04).
  lines.push(
    "  · **이런 것은 토스트로 때우지 마세요** — `모두 보기`(펼치기), `선택`·`적용`(고른 상태로 바꾸기), `추가`(줄 하나 늘리기), `닫기`·`✕`(정말 닫기), `도움이 됐어요`(숫자 올리기), 탭·필터·정렬. 전부 화면 안에서 끝나는 일이라 실제로 되어야 합니다.",
  );
  lines.push(
    "  · **모달·팝업은 뜨는 것만으로 끝이 아닙니다.** `취소`와 `✕`는 정말 닫히고, `확인`은 눌렀을 때 무엇이 달라지는지 보여야 합니다(다음 화면으로 가거나, 목록이 바뀌거나, 안내가 뜨거나). 닫히지 않는 팝업은 갇힌 화면이 됩니다.",
  );
  lines.push(
    "  · 아무 것도 하지 않는 `<button>`을 남기지 마세요. 만들고 나서 **버튼을 하나씩 눌러 보고**, 반응이 없는 것이 있으면 위 둘 중 하나로 채우세요.",
  );
  // 서브 화면에서 돌아갈 길이 없어 갇히는 화면이 나왔다(2026-08-04).
  // 목록·상세·단계처럼 깊이 들어가는 화면은 반드시 나오는 길이 함께 있어야 한다.
  lines.push(
    // "깊이 들어간 화면"이라고만 썼더니 136개 중 105개에 뒤로가기가 없었다(2026-08-04).
    // 어디까지가 '깊이 들어간' 것인지 AI가 알아서 좁게 잡는다. 범위를 못 박는다.
    `- **뒤로가기는 화면마다 정해져 있습니다. 4장 각 화면 스펙의 \`뒤로가기\` 항목을 그대로 만드세요.** ${backCount}개 화면에 붙고, 나머지 ${m.screens.length - backCount}개(메뉴 첫 화면)에는 없습니다. 좌측 상단에 \`‹ 상위 화면 이름\`과 현재 위치(예: \`매장 탐색 › 매장 상세\`)를 둡니다.`,
  );
  lines.push(
    "  · 여러 단계짜리 흐름(1→2→3)은 **이전 단계로 돌아갈 수 있게** 하세요. 되돌아갔을 때 앞서 고른 값이 남아 있어야 합니다.",
  );
  lines.push(
    "  · **한 묶음으로 나란히 보여주는 것은 동일 계위입니다.** 탭 줄에 걸린 화면들, 같은 사이드바에 나란히 올라온 화면들이 그렇습니다. " +
      "그 안을 오가는 길이 이미 탭·사이드바이므로 뒤로가기를 겹쳐 두지 마세요 — 같은 줄에 있는 화면인데 어떤 건 있고 어떤 건 없어집니다.",
  );
  lines.push(
    "  · 빈 화면·오류·마감처럼 막다른 화면에는 **다음에 할 일 버튼**을 반드시 하나 두세요(예: `목록으로`, `다시 시도`, `둘러보기`).",
  );
  lines.push(
    "  · **전체 화면 목록으로 돌아가는 길**을 **146개 화면 «전부»에** 두세요 — 오른쪽 아래에 떠 있는 `화면 목록` 단추 하나면 됩니다. 누르면 `index.html`(전체 화면 목록)으로 갑니다. 접힌 패널 안에 `화면 정보` 같은 이름으로 넣으면 아무도 못 찾습니다.",
  );
  lines.push(
    "  · 다 만든 뒤 **화면을 하나씩 열어 뒤로가기가 있는지 세어 보세요.** 하나라도 빠져 있으면 채웁니다.",
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
  /* 프리셋이 안 딸려 나가는 팩에서는 글꼴을 정해 주는 곳이 한 군데도 없었다.
     색은 디자인 컨셉이 말해 주는데 글꼴만 아무도 안 말해서, 화면마다 다른 글꼴이
     나올 수 있었다. 프리셋이 없을 때의 최소 기준을 여기서 못 박는다(2026-08-06). */
  lines.push(
    "- **글꼴은 프리셋이 없어도 한 벌로 고정하세요.** 기본은 `Paperlogy`이고, 못 불러오면 `Pretendard` → `Noto Sans KR` 순으로 물러납니다. "
    + "CSS로는 `font-family: Paperlogy, Pretendard, 'Noto Sans KR', sans-serif` 한 줄이면 됩니다.",
  );
  lines.push(
    "  · **글꼴은 한 벌만 씁니다.** 제목과 본문에 서로 다른 글꼴을 쓰지 마세요 — 두 벌이 되는 순간 어디에 무엇을 쓸지가 화면마다 갈립니다. "
    + "위계는 글꼴이 아니라 **크기와 굵기**로 만듭니다.",
  );
  lines.push(
    "  · 굵기는 **400·600·700 셋만**, 크기는 본문 15 · 카드 제목 18 · 섹션 제목 22 · 페이지 제목 32을 기준으로 잡으세요.",
  );

  /* 색·밀도와 상관없는 규칙은 디자인 프리셋에도 같은 한 벌이 실려 있다.
     그런데 프리셋은 "색을 고르는 파일"로 보여서, 이 스펙팩만 AI에게 건네는 사람이 있다.
     게다가 「버튼이냐 링크냐」·「견본으로 가는 버튼」·「LNB」는 색 규칙이 아니라
     동작 규칙이라 원래 여기가 제자리다. 한 상수를 양쪽이 읽으니 갈라지지 않는다(2026-08-06). */
  lines.push("");
  lines.push(...COMMON_RULES.map((r) => (r.startsWith("### ") ? `#### ${r.slice(4)}` : r)));

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

  /* ⛔ 이 두 절이 없어서 실제로 터졌다 (2026-08-18 펫 유치원 사이트 실측).
     · 146개 중 여덟 화면이 390px 에서 페이지째 좌우로 밀렸다 — 표가 아니라 «페이지 번호 줄»이 밀었다.
     · 상호가 데이터 파일 밖 열 곳에 글자로 박혀, 데이터만 고치면 옛 이름이 남았다.
     둘 다 「반응형」·「데이터는 한 곳에」 같은 두루뭉술한 말로는 안 걸러진다. 조건을 적어야 지켜진다. */

  lines.push("");
  /* ⛔⛔ 2026-08-18: 이 절이 없어서 실제로 터졌다.
     같은 스펙팩으로 다시 만들었더니 —
       · 눌러도 아무 일 없는 링크 178개(28개 화면) — 페이지 번호·달력 날짜·시간 칸
       · 반응 없는 단추 147개(37개 화면)
       · 뒤로가기가 스펙과 다른 화면 59개, 아예 없는 화면 30개
     스펙팩은 화면마다 뒤로가기를 «정확히 적어 줬다»(130개 화면). 그런데 안 지켜졌다.
     146개를 차례로 만들다 보면 120번째에서 12번째 스펙을 다시 안 본다.
     사장님: 「생성한 AI팩의 경우 눌러보며 검수하기 단계가 없는거 같아」
     만드는 절차만 있고 «만든 뒤 확인하는 절차»가 없었다. 세는 절차로 적는다. */
  lines.push("");
  lines.push("## 7. 만들고 나서 — 눌러 보기");
  lines.push("> **여기까지 해야 다 만든 것입니다.** 화면을 다 그렸어도 눌러서 안 움직이면 안 만든 것과 같습니다.");
  lines.push("> 아래는 눈으로 훑는 것이 아니라 **세어서** 확인합니다. 하나라도 남으면 고치고 다시 셉니다.");
  lines.push("");
  lines.push("### 7-1. 눌러도 아무 일 없는 것이 0개여야 합니다");
  lines.push("- `href=\"#\"` · `href=\"javascript:void(0)\"` · 빈 `href` 는 **하나도 남기지 않습니다.**");
  lines.push("- **페이지 번호, 달력 날짜, 시간 칸, 이전·다음** — 여기가 제일 자주 빈 채로 남습니다. 실제로 눌러 보세요.");
  lines.push("- 아직 만들 화면이 없으면 «지금은 안 되는 것»으로 보이게 두세요(흐리게 + 눌리지 않게). 눌리는데 아무 일도 없으면 고장으로 보입니다.");
  lines.push("- 단추(`<button>`)도 같습니다. 눌렀을 때 **화면이 바뀌거나, 값이 바뀌거나, 안내가 뜨거나** 셋 중 하나는 일어나야 합니다.");
  lines.push("");
  /* ⛔ 2026-08-18: §7-1 을 「눌렀을 때 무언가 일어나야 한다」로만 적었더니,
     필터 칩이 «색만 바뀌고» 목록은 그대로인 채로 통과했다. 칩에는 「기본 교육 2」라고
     적혀 있는데 누르면 6개가 그대로 보인다 — 적힌 숫자와 보이는 것이 다르다.
     「무언가 일어난다」는 너무 넓다. 무엇이 일어나야 하는지 적는다. */
  lines.push("");
  lines.push("### 7-2. 거르는 단추는 «목록이 실제로 줄어야» 합니다");
  lines.push("- **필터 칩·탭·정렬**을 누르면 색만 바뀌는 것으로는 안 됩니다. **보이는 항목이 실제로 달라져야** 합니다.");
  lines.push("- 칩에 개수를 적었으면(`기본 교육 2`) 누른 뒤 **그 수만큼만 보여야** 합니다. 적힌 숫자와 보이는 수가 다르면 그 자리는 거짓말이 됩니다.");
  lines.push("- 거르면 하나도 안 남는 조건도 눌러 보세요. **「결과가 없습니다」 화면**이 나와야 합니다 — 빈 채로 두면 고장으로 보입니다.");
  lines.push("- 정렬(최신순·낮은 요금순)도 같습니다. 순서가 **눈에 보이게** 바뀌어야 합니다.");
  lines.push("");
  lines.push("### 7-3. 뒤로가기는 4장에 적힌 그 화면으로 갑니다");
  lines.push(`- ${backCount}개 화면에 뒤로가기가 있고, 나머지 ${m.screens.length - backCount}개(메뉴 첫 화면)에는 **없어야** 합니다.`);
  lines.push("- 화면마다 4장의 `뒤로가기` 항목과 **하나씩 대 봅니다.** 「대충 상위 메뉴로」가 아니라 적힌 그 화면입니다.");
  lines.push("- 여러 단계로 이어지는 화면(예약→결제→완료)에서 특히 어긋납니다. 완료 화면에서 뒤로 갔을 때 결제가 다시 시작되면 안 됩니다.");
  lines.push("");
  lines.push("### 7-4. 화면 목록과 실제가 같은지 셉니다");
  lines.push(`- 만들어진 화면이 **${m.screens.length}개** 인지 셉니다. 목록에는 있는데 안 만든 화면, 만들었는데 목록에 없는 화면 둘 다 0이어야 합니다.`);
  lines.push("- 화면끼리 잇는 링크가 **실제로 있는 화면**을 가리키는지 셉니다. 없는 화면을 가리키는 링크는 0이어야 합니다.");
  lines.push("- **\u0060화면목록.html\u0060 이 " + m.screens.length + "개를 «다» 가리키는지** 셉니다. 홈에서 닿는 것만 넣으면 나머지는 영영 못 봅니다.");
  lines.push(`- **화면 목록으로 가는 단추가 ${m.screens.length}개 화면 «전부»에 있는지** 셉니다. 한 화면이라도 빠지면 거기서 길이 끊깁니다.`);
  lines.push("");
  lines.push("### 7-5. 폰 폭에서 다시 한 번");
  lines.push("- 위 「좁은 화면에서 넘치지 않게」를 **다 만든 뒤에 다시** 확인합니다. 화면이 늘어나면서 새로 넘치는 곳이 생깁니다.");
  lines.push("");
  lines.push("### 7-6. 무엇을 확인했는지 적어 주세요");
  lines.push("- 위 항목을 **숫자로** 적어 남깁니다 — 「빈 링크 0개 · 반응 없는 단추 0개 · 안 걸러지는 필터 0개 · 뒤로가기 어긋남 0개 · 화면 목록 단추 없는 화면 0개 · 가로 넘침 0개」.");
  lines.push("- 숫자를 적을 수 없으면 아직 확인한 것이 아닙니다.");
  lines.push("");
  lines.push("### 바꿀 값은 한 곳에");
  lines.push(
    `- ${m.common.singleSourceData.fields.map((f) => `**${f}**`).join(" · ")} — 손님이 받아서 **제일 먼저 자기 것으로 바꾸는 값**입니다.`,
  );
  for (const r of m.common.singleSourceData.rule) lines.push(`- ${r}`);

  /* 앱으로 낼 때만 붙는 절. PC 웹·반응형이면 통째로 안 나온다. */
  if (m.common.appExtra) {
    const a = m.common.appExtra;
    lines.push("");
    lines.push("### 2-1. 앱으로 낼 때 더 필요한 것");
    lines.push(`> ${a.why}`);
    lines.push("");
    lines.push("**아래 화면을 추가로 만드세요.** 4장의 화면 목록에는 없지만, 앱에는 있어야 합니다.");
    for (const s of a.screens) lines.push(`- **${s.name}** — ${s.funcDef}`);
    lines.push("");
    lines.push("**그리고 이 규칙을 모든 화면에 적용하세요.**");
    for (const r of a.rules) lines.push(`- ${r}`);
    lines.push("");
    lines.push(`> ${a.storeNote}`);
  }

  /* 파일을 어디에 두고 어떻게 부를지가 한 줄도 없었다.
     그래서 화면 44장이 pages/ 안에서 assets/... 를 불렀는데 자산은 한 층 위에 있었고,
     CSS 가 통째로 안 붙었다 — 글꼴도 콘텐츠 영역도 격자도 전부 날아갔다.
     경로만 고치니 눌러서 값이 바뀌는 비율이 23% 에서 58% 로 올랐다.
     저장소 안에서 만들 때는 옆에 있는 사이트를 보고 따라 해서 안 깨졌을 뿐,
     빈 폴더에서 만들면 깨진다. 사는 분은 빈 폴더 쪽이다(2026-08-07). */
  lines.push("### 파일을 어디에 두나");
  lines.push("");
  lines.push("```");
  lines.push("완성화면/");
  /* ⛔ 전에는 이 줄이 「index.html  전체 화면 목록」이었다. 그런데 index.html 은
     어디서나 «사이트 첫 화면»을 뜻해서, 만드는 쪽이 홈 화면을 그대로 index.html 로
     복사해 놓고 목록은 아예 안 만들었다(2026-08-18 실측: 목록 없음, 통로 0개).
     이름이 두 가지 뜻으로 읽히면 반드시 흔한 쪽으로 읽힌다 — 목록에 제 이름을 준다. */
  lines.push("  index.html              홈 화면 (손님이 처음 보는 화면)");
  lines.push("  화면목록.html            우리가 검수용으로 보는 «전체 화면 목록»");
  lines.push("  pages/");
  lines.push("    HO-01.html            화면 하나에 파일 하나 · 이름은 화면 ID 그대로");
  lines.push("    CO-03.html");
  lines.push("  assets/");
  lines.push("    css/style.css         스타일 한 벌");
  lines.push("    js/app.js             동작 한 벌");
  lines.push("```");
  lines.push("");
  lines.push(
    "- **`pages/` 안에서는 `../assets/css/style.css` 로 부릅니다.** `assets/...` 라고 쓰면 " +
    "`pages/assets/...` 를 찾다가 못 찾아서 **스타일이 통째로 안 붙습니다** — 글꼴도 여백도 격자도 전부 날아갑니다.",
  );
  /* ⛔ 2026-08-18: 「index.html 전체 화면 목록」이라고만 적었더니 홈 화면 복사본이 나왔다.
     index.html 은 어디서나 «첫 화면»을 뜻하니 홈으로 읽힌 것이다. 우리 판매팩 여덟 벌은
     전부 index.html = 전체 화면 목록이고 136장 모두에 「화면 목록」 통로가 있다 —
     그게 검증된 모양이다. 이름을 바꾸지 말고 «왜 그런지»를 적어 오해를 막는다. */
  lines.push(
    "- ⭐ **`index.html` 은 «전체 화면 목록»입니다. 홈 화면이 아닙니다.** 이 폴더는 손님이 검수하는 **시안**이라, " +
    "열자마자 몇 개를 만들었는지 한눈에 보여야 합니다. 홈 화면은 `pages/` 안에 다른 화면들과 나란히 둡니다.",
  );
  lines.push(
    "- **`index.html` 에는 화면을 «하나도 빼지 않고»** 메뉴별로 묶어 넣습니다. 화면 ID 와 이름을 함께 적어, " +
    "거기서 아무 화면이나 바로 열 수 있어야 합니다. 홈에서 닿는 것만 넣으면 나머지는 영영 못 봅니다.",
  );
  lines.push("- `index.html` 은 `완성화면/` 바로 아래 둡니다. 거기서는 `assets/...` 그대로 부르면 됩니다.");
  lines.push("- **스타일과 동작은 각각 한 벌**입니다. 화면마다 따로 만들면 44장이 서로 달라집니다.");
  lines.push("- 화면끼리 오갈 때는 `CO-03.html` 처럼 **같은 폴더 안 이름**으로 겁니다.");
  lines.push(
    "- 다 만든 뒤 **화면 하나를 브라우저로 직접 열어 보세요.** 글꼴이 기본 고딕으로 보이면 경로가 틀린 것입니다.",
  );
  lines.push("");

  lines.push("### 추천 스택");
  lines.push(
    "- 정적 다중 페이지(HTML/CSS) 또는 컴포넌트 기반(React·Next.js·Vue 등) 중 프로젝트 규모에 맞게 선택하세요. 화면이 많고 상태가 복잡하면 컴포넌트 기반을 권장합니다.",
  );
  lines.push("");

  return lines.join("\n");
}
