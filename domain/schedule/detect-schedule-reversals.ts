import type { Screen } from "@/domain/screen/screen";

export function detectScheduleReversals(
  screens: Pick<Screen, "id" | "scheduleStart" | "scheduleEnd">[],
): Set<string> {
  const withDates = screens.filter(
    (s): s is Pick<Screen, "id" | "scheduleStart" | "scheduleEnd"> & {
      scheduleStart: string;
      scheduleEnd: string;
    } => !!s.scheduleStart && !!s.scheduleEnd,
  );

  const sorted = [...withDates].sort((a, b) => a.scheduleStart.localeCompare(b.scheduleStart));
  const reversed = new Set<string>();
  let maxEndScreen: (typeof sorted)[number] | null = null;

  for (const screen of sorted) {
    if (maxEndScreen && screen.scheduleEnd < maxEndScreen.scheduleEnd) {
      reversed.add(screen.id);
      reversed.add(maxEndScreen.id);
    }
    if (!maxEndScreen || screen.scheduleEnd > maxEndScreen.scheduleEnd) {
      maxEndScreen = screen;
    }
  }

  return reversed;
}
