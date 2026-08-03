"use client";

import { useState } from "react";
import { Folder, Lock } from "lucide-react";
import type { Screen } from "@/domain/screen/screen";
import type { ButtonAction } from "@/domain/screen/button-action";
import type { Menu } from "@/domain/menu/menu";
import { ScreenListItem } from "./screen-list-item";
import { ScreenDetailPanel } from "./screen-detail-panel";
import { PREVIEW_PER_GROUP } from "../preview-limit";
import { SCREEN_EDIT_OPEN } from "@/lib/flags";

export function ScreensView({
  screens,
  menus,
  buttonActions,
  projectId,
  outOfRangeIds,
  reversedIds,
}: {
  screens: Screen[];
  menus: Menu[];
  buttonActions: ButtonAction[];
  projectId: string;
  outOfRangeIds: string[];
  reversedIds: string[];
}) {
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  // 미리보기는 메뉴마다 3개까지만. 나머지는 파일에서 본다.
  const selectedScreen = screens.find((s) => s.id === selectedScreenId) ?? null;

  const outOfRangeSet = new Set(outOfRangeIds);
  const reversedSet = new Set(reversedIds);
  const sortWithinMenu = (list: Screen[]) =>
    [...list].sort((a, b) => {
      const aOut = outOfRangeSet.has(a.id) ? 0 : 1;
      const bOut = outOfRangeSet.has(b.id) ? 0 : 1;
      return aOut - bOut;
    });

  // 메뉴별 그룹핑 — 메뉴 정렬 순서대로, 소속 메뉴가 없는 화면은 마지막 "기타" 그룹.
  const groups = menus
    .map((menu) => ({ menu, list: sortWithinMenu(screens.filter((s) => s.menuId === menu.id)) }))
    .filter((g) => g.list.length > 0);

  const knownMenuIds = new Set(menus.map((m) => m.id));
  const orphanScreens = sortWithinMenu(screens.filter((s) => !knownMenuIds.has(s.menuId)));

  const renderRow = (screen: Screen) => (
    <ScreenListItem
      key={screen.id}
      screen={screen}
      projectId={projectId}
      onOpenDetail={setSelectedScreenId}
      isOutOfRange={outOfRangeSet.has(screen.id)}
      isReversed={reversedSet.has(screen.id)}
      buttonActions={buttonActions.filter((ba) => ba.screenId === screen.id)}
      allScreens={screens}
    />
  );

  return (
    <>
      <div className="flex flex-col gap-5">
        {groups.map(({ menu, list }) => (
          <MenuGroupCard
            key={menu.id}
            code={menu.menuCode}
            name={menu.nameKo}
            nameEn={menu.nameEn}
            count={list.length}
          >
            {list.slice(0, PREVIEW_PER_GROUP).map(renderRow)}
            {list.length > PREVIEW_PER_GROUP && <MoreScreens />}
          </MenuGroupCard>
        ))}

        {orphanScreens.length > 0 && (
          <MenuGroupCard code="ETC" name="기타" count={orphanScreens.length}>
            {orphanScreens.slice(0, PREVIEW_PER_GROUP).map(renderRow)}
            {orphanScreens.length > PREVIEW_PER_GROUP && <MoreScreens />}
          </MenuGroupCard>
        )}
      </div>

      {/* 화면을 손으로 고치는 팝업. 수정 기능이 보류라 열지 않는다(lib/flags.ts) */}
      {SCREEN_EDIT_OPEN && selectedScreen && (
        <ScreenDetailPanel
          screen={selectedScreen}
          allScreens={screens}
          buttonActions={buttonActions.filter((ba) => ba.screenId === selectedScreen.id)}
          projectId={projectId}
          onClose={() => setSelectedScreenId(null)}
        />
      )}
    </>
  );
}

// 잘린 화면 안내.
function MoreScreens() {
  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
      <Lock className="size-3.5 shrink-0" />
      <span>다운로드하여 전체 화면을 확인해 보세요.</span>
    </li>
  );
}

// 메뉴 1개 = 카드 1개. 헤더에 메뉴 코드·이름·화면 수를 보여줘 그룹핑을 명확히 한다.
function MenuGroupCard({
  code,
  name,
  nameEn,
  count,
  children,
}: {
  code: string;
  name: string;
  nameEn?: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <header className="flex items-center gap-2.5 border-b border-border bg-gradient-to-r from-primary-soft/50 to-transparent px-4 py-3">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-primary-on-soft">
          <Folder className="size-4" />
        </span>
        <span className="rounded-md bg-primary-soft px-2 py-0.5 font-mono text-xs font-semibold text-primary-on-soft">
          {code}
        </span>
        <h3 className="font-semibold text-foreground">{name}</h3>
        {nameEn && <span className="text-xs text-muted-foreground">({nameEn})</span>}
        <span className="ml-auto rounded-full bg-background/80 px-2.5 py-0.5 text-xs font-medium text-muted-foreground shadow-sm">
          화면 {count}개
        </span>
      </header>
      {/* 표 대신 카드 목록 — 좁은 화면에서 한글이 한 글자씩 세로로 쪼개지지 않게 한다.
          각 항목이 페이지ID·화면명·일정·상태를 스스로 라벨링하므로 헤더 행은 두지 않는다. */}
      <ul className="divide-y divide-border text-sm">{children}</ul>
    </section>
  );
}
