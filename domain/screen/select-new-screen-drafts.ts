import type { Screen } from "@/domain/screen/screen";

function candidateKey(candidate: { menuId: string; screenRole: string; deviceCode: string }): string {
  return `${candidate.menuId}::${candidate.screenRole}::${candidate.deviceCode}`;
}

export function selectNewScreenDrafts<
  T extends { menuId: string; screenRole: string; deviceCode: string },
>(candidates: T[], existingScreens: Pick<Screen, "menuId" | "screenRole" | "deviceCode" | "status">[]): T[] {
  const existingKeys = new Set(
    existingScreens.filter((screen) => screen.status !== "quarantined").map(candidateKey),
  );

  return candidates.filter((candidate) => !existingKeys.has(candidateKey(candidate)));
}
