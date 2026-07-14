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
}: {
  screens: Screen[];
  buttonActions: ButtonAction[];
  projectId: string;
}) {
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const selectedScreen = screens.find((s) => s.id === selectedScreenId) ?? null;

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">페이지ID</th>
              <th className="px-4 py-2 font-medium">페이지명</th>
              <th className="px-4 py-2 font-medium">상태</th>
            </tr>
          </thead>
          <tbody>
            {screens.map((screen) => (
              <ScreenListItem
                key={screen.id}
                screen={screen}
                projectId={projectId}
                onOpenDetail={setSelectedScreenId}
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
