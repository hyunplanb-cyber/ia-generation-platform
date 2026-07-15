"use client";

import { useState } from "react";
import type { Screen } from "@/domain/screen/screen";
import type { ButtonAction } from "@/domain/screen/button-action";
import { ScreenListItem } from "./screen-list-item";
import { ScreenDetailPanel } from "./screen-detail-panel";

export function ScreensView({
  screens,
  buttonActions,
  projectId,
  outOfRangeIds,
  reversedIds,
}: {
  screens: Screen[];
  buttonActions: ButtonAction[];
  projectId: string;
  outOfRangeIds: string[];
  reversedIds: string[];
}) {
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const selectedScreen = screens.find((s) => s.id === selectedScreenId) ?? null;

  const outOfRangeSet = new Set(outOfRangeIds);
  const reversedSet = new Set(reversedIds);
  const sortedScreens = [...screens].sort((a, b) => {
    const aOut = outOfRangeSet.has(a.id) ? 0 : 1;
    const bOut = outOfRangeSet.has(b.id) ? 0 : 1;
    return aOut - bOut;
  });

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">페이지ID</th>
              <th className="px-4 py-2 font-medium">페이지명</th>
              <th className="px-4 py-2 font-medium">일정</th>
              <th className="px-4 py-2 font-medium">상태</th>
              <th className="px-4 py-2 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {sortedScreens.map((screen) => (
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
            ))}
          </tbody>
        </table>
      </div>

      {selectedScreen && (
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
