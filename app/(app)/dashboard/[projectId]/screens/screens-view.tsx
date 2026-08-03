"use client";

// IA · 화면 목록 미리보기.
//
// 두 겹으로 접는다 — 바깥은 메뉴, 안은 화면. 한 번에 하나만 열리고,
// 다른 걸 누르거나 바깥을 누르면 열려 있던 게 닫힌다(2026-08-03).
// 118개를 다 펼쳐 두면 화면이 한없이 길어지고, 그대로 긁어가기도 너무 쉽다.
//
// AI 프롬프트는 메뉴마다 첫 화면 하나만 보여준다. 이게 이 산출물에서 제일 값나가는
// 부분이라 나머지는 파일에서 본다. 화면 직접 고치기는 보류 중이다(SCREEN_EDIT_OPEN).

import { ArrowRight, Lock } from "lucide-react";
import type { Screen } from "@/domain/screen/screen";
import type { ButtonAction } from "@/domain/screen/button-action";
import type { Menu } from "@/domain/menu/menu";
import { FoldList, type FoldItem } from "../fold";

export function ScreensView({
  screens,
  menus,
  buttonActions,
  outOfRangeIds,
}: {
  screens: Screen[];
  menus: Menu[];
  buttonActions: ButtonAction[];
  projectId: string;
  outOfRangeIds: string[];
  reversedIds: string[];
}) {
  const outOfRangeSet = new Set(outOfRangeIds);
  const screenById = new Map(screens.map((s) => [s.id, s]));
  // 일정이 프로젝트 기간을 벗어난 화면을 앞으로 올려 눈에 띄게 한다.
  const sortWithinMenu = (list: Screen[]) =>
    [...list].sort((a, b) => Number(outOfRangeSet.has(b.id)) - Number(outOfRangeSet.has(a.id)));

  const groups = menus
    .map((menu) => ({ menu, list: sortWithinMenu(screens.filter((s) => s.menuId === menu.id)) }))
    .filter((g) => g.list.length > 0);

  const knownMenuIds = new Set(menus.map((m) => m.id));
  const orphans = sortWithinMenu(screens.filter((s) => !knownMenuIds.has(s.menuId)));

  /** 접힌 줄에 보여줄 한 줄 설명 */
  const brief = (s: Screen) => {
    const t = (s.funcDef ?? "").split("·")[0].trim();
    return t.length > 34 ? `${t.slice(0, 34)}…` : t;
  };

  const screenItems = (list: Screen[]): FoldItem[] =>
    list.map((s, i) => {
      const moves = buttonActions.filter((ba) => ba.screenId === s.id);
      // 프롬프트는 메뉴의 첫 화면 하나만.
      const showPrompt = i === 0;
      return {
        key: s.id,
        title: (
          <span className="flex min-w-0 flex-col">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-medium text-primary">{s.pageId}</span>
              <span>{s.pageName}</span>
              {outOfRangeSet.has(s.id) && (
                <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
                  일정 범위 밖
                </span>
              )}
            </span>
            {brief(s) && (
              <span className="mt-0.5 text-xs font-normal text-muted-foreground">{brief(s)}</span>
            )}
          </span>
        ),
        body: (
          <div className="flex flex-col gap-4 border-t border-border pt-4">
            <div>
              <p className="mb-1.5 text-xs font-bold text-muted-foreground">기능정의</p>
              <p className="text-sm leading-relaxed text-foreground/85">{s.funcDef || "—"}</p>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-bold text-muted-foreground">
                버튼 → 이동 화면 {moves.length > 0 && `(${moves.length})`}
              </p>
              {moves.length === 0 ? (
                <p className="text-sm text-muted-foreground">연결된 이동이 없어요.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {moves.map((ba) => {
                    const to = screenById.get(ba.targetScreenId);
                    return (
                      <li key={ba.id} className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary-on-soft">
                          {ba.label}
                        </span>
                        <ArrowRight className="size-3.5 text-muted-foreground" />
                        <span className="text-foreground">{to ? to.pageName : "(삭제됨)"}</span>
                        {to && (
                          <span className="font-mono text-xs text-muted-foreground">{to.pageId}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <p className="mb-1.5 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                AI 프롬프트
                {showPrompt && (
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary-on-soft">
                    미리보기
                  </span>
                )}
              </p>
              {showPrompt ? (
                <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-sm leading-relaxed text-foreground/85">
                  {s.prompt || "—"}
                </pre>
              ) : (
                <p className="flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2.5 text-sm text-muted-foreground">
                  <Lock className="size-3.5 shrink-0" />
                  다운로드하여 전체 프롬프트를 확인해 보세요.
                </p>
              )}
            </div>
          </div>
        ),
      };
    });

  const items: FoldItem[] = [
    ...groups.map(({ menu, list }) => ({
      key: menu.id,
      title: (
        <span className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-primary-soft px-2 py-0.5 font-mono text-xs font-semibold text-primary-on-soft">
            {menu.menuCode}
          </span>
          {menu.nameKo}
          {menu.nameEn && (
            <span className="text-xs font-normal text-muted-foreground">({menu.nameEn})</span>
          )}
        </span>
      ),
      meta: `화면 ${list.length}개`,
      body: <FoldList items={screenItems(list)} />,
    })),
    ...(orphans.length > 0
      ? [
          {
            key: "etc",
            title: <span>기타 (소속 메뉴 없음)</span>,
            meta: `화면 ${orphans.length}개`,
            body: <FoldList items={screenItems(orphans)} />,
          },
        ]
      : []),
  ];

  return <FoldList items={items} />;
}
