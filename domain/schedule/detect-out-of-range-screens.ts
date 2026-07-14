import type { Screen } from "@/domain/screen/screen";

export function detectOutOfRangeScreens(
  overallStart: string,
  overallEnd: string,
  screens: Pick<Screen, "id" | "scheduleStart" | "scheduleEnd" | "scheduleLocked">[],
): Set<string> {
  const outOfRange = new Set<string>();

  for (const screen of screens) {
    if (!screen.scheduleLocked) continue;
    if (!screen.scheduleStart || !screen.scheduleEnd) continue;
    if (screen.scheduleStart < overallStart || screen.scheduleEnd > overallEnd) {
      outOfRange.add(screen.id);
    }
  }

  return outOfRange;
}
