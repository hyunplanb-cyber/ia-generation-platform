"use client";

// FLOW 미리보기 — 메뉴별로 나눠 본다.
//
// 화면 118개를 한 장에 그리면 이어지지 않은 화면이 죄다 첫 열에 쌓여
// 세로로 100개 넘게 늘어선다. 읽을 수도, 고칠 수도 없다.
// 메뉴 안의 이동은 대개 5~15개라 한 장이 사람이 볼 만한 크기가 된다(2026-08-03).

import { useState } from "react";
import { DiagramView } from "../diagram-view";
import { FlowChart, type FlowEdge, type FlowNode } from "../flow-chart";

export interface FlowGroup {
  key: string;
  label: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export function FlowTabs({ groups }: { groups: FlowGroup[] }) {
  const [active, setActive] = useState(groups[0]?.key ?? "");
  const cur = groups.find((g) => g.key === active) ?? groups[0];
  if (!cur) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {groups.map((g) => {
          const on = g.key === cur.key;
          return (
            <button
              key={g.key}
              type="button"
              aria-pressed={on}
              onClick={() => setActive(g.key)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                on
                  ? "border-primary bg-primary-soft text-primary-on-soft"
                  : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted"
              }`}
            >
              {g.label}
              <span className={`text-xs ${on ? "opacity-70" : "text-muted-foreground"}`}>
                {g.edges.length}
              </span>
            </button>
          );
        })}
      </div>

      <DiagramView
        key={cur.key}
        diagram={<FlowChart nodes={cur.nodes} edges={cur.edges} />}
        title={`${cur.label} — 화면 이동`}
        hint={
          cur.key === "overview"
            ? "메뉴와 메뉴 사이의 이동이에요. 메뉴 안의 이동은 위 탭에서 보세요."
            : `${cur.label} 안에서 화면끼리 어떻게 이동하는지 보여줘요.`
        }
      />
    </div>
  );
}
