// FLOW를 "한 장"이 아니라 여러 장으로 쪼갠다.
//
// 화면이 100개를 넘으면 한 장에 다 그린 그림은 아무도 못 읽고, drawio로 열어도
// 손댈 수 없다. 실제로 이어지지 않은 화면이 죄다 첫 열에 쌓여 세로로 길게 늘어섰다.
//
// 그래서 이렇게 나눈다.
//   1) 메뉴 간 이동 — 메뉴를 상자 하나로 보고, 메뉴를 넘나드는 이동만
//   2) 메뉴별 이동 — 그 메뉴 안 화면끼리의 이동
// 한 장이 5~15개면 사람이 옮기고 고칠 수 있는 크기가 된다.
//
// 이름도 함께 고친다. 화면명이 "기본"·"로딩"·"오류"라 화면명만 적으면
// 어느 메뉴의 기본인지 알 수 없다. 메뉴명을 앞에 붙인다.

export interface FlowScreen {
  id: string;
  pageId: string;
  pageName: string;
  menuId: string;
}
export interface FlowMenu {
  id: string;
  menuCode: string;
  nameKo: string;
}
export interface FlowMove {
  from: string;
  to: string;
  label: string;
}

export interface FlowGroupData {
  key: string;
  label: string;
  nodes: { id: string; pageName: string; pageId: string }[];
  edges: FlowMove[];
}

/** 메뉴 간 이동 1장 + 메뉴별 이동 N장. 이동이 없는 메뉴는 넣지 않는다. */
export function buildFlowGroups(
  menus: FlowMenu[],
  screens: FlowScreen[],
  moves: FlowMove[],
): FlowGroupData[] {
  const menuOf = new Map(screens.map((s) => [s.id, s.menuId]));
  const menuById = new Map(menus.map((m) => [m.id, m]));
  const groups: FlowGroupData[] = [];

  // ── 1) 메뉴 간 이동 ──────────────────────────────────
  // 같은 메뉴 쌍으로 가는 이동이 여러 개면 한 줄로 합치고 개수를 적는다.
  const crossCount = new Map<string, number>();
  for (const mv of moves) {
    const a = menuOf.get(mv.from);
    const b = menuOf.get(mv.to);
    if (!a || !b || a === b) continue;
    crossCount.set(`${a}→${b}`, (crossCount.get(`${a}→${b}`) ?? 0) + 1);
  }
  if (crossCount.size > 0) {
    const used = new Set<string>();
    for (const pair of crossCount.keys()) {
      const [a, b] = pair.split("→");
      used.add(a);
      used.add(b);
    }
    groups.push({
      key: "overview",
      label: "메뉴 간 이동",
      nodes: menus
        .filter((m) => used.has(m.id))
        .map((m) => ({ id: m.id, pageName: m.nameKo, pageId: m.menuCode })),
      edges: [...crossCount.entries()].map(([pair, n]) => {
        const [from, to] = pair.split("→");
        return { from, to, label: n > 1 ? `${n}개 이동` : "이동" };
      }),
    });
  }

  // ── 2) 메뉴별 이동 ──────────────────────────────────
  for (const menu of menus) {
    const mine = screens.filter((s) => s.menuId === menu.id);
    if (mine.length === 0) continue;
    const ids = new Set(mine.map((s) => s.id));
    const inner = moves.filter((mv) => ids.has(mv.from) && ids.has(mv.to));
    if (inner.length === 0) continue; // 이동이 없으면 그릴 게 없다

    // 이동에 얽히지 않은 화면은 뺀다. 흐름도에 넣어봐야 화살표 없이 한 줄로 쌓여
    // 그림만 길어진다(마이페이지 40개 중 실제로 이어진 건 15개뿐이었다).
    // 그 화면들은 화면 목록에서 보면 된다.
    const linked = new Set(inner.flatMap((mv) => [mv.from, mv.to]));
    groups.push({
      key: menu.id,
      label: `${menu.menuCode} ${menu.nameKo}`,
      nodes: mine
        .filter((s) => linked.has(s.id))
        .map((s) => ({ id: s.id, pageName: s.pageName, pageId: s.pageId })),
      edges: inner,
    });
  }

  return groups;
}

/** 화면명만으로는 구분이 안 된다 — "홈 · 기본"처럼 메뉴명을 앞에 붙인다. */
export function withMenuName(
  screens: FlowScreen[],
  menus: FlowMenu[],
): { id: string; pageName: string; pageId: string }[] {
  const menuById = new Map(menus.map((m) => [m.id, m]));
  return screens.map((s) => ({
    id: s.id,
    pageId: s.pageId,
    pageName: `${menuById.get(s.menuId)?.nameKo ?? "기타"} · ${s.pageName}`,
  }));
}
