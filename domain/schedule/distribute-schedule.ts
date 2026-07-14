export interface ScheduleSlot {
  scheduleStart: string;
  scheduleEnd: string;
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(startStr: string, endStr: string): number {
  const start = new Date(`${startStr}T00:00:00Z`).getTime();
  const end = new Date(`${endStr}T00:00:00Z`).getTime();
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

export function distributeSchedule(
  overallStart: string,
  overallEnd: string,
  count: number,
): ScheduleSlot[] {
  if (count <= 0) return [];

  const totalDays = daysBetween(overallStart, overallEnd) + 1;
  const baseSize = Math.floor(totalDays / count);
  const remainder = totalDays % count;

  const slots: ScheduleSlot[] = [];
  let cursor = overallStart;

  for (let i = 0; i < count; i++) {
    const size = baseSize + (i < remainder ? 1 : 0);
    const slotEnd = addDays(cursor, Math.max(size, 1) - 1);
    slots.push({ scheduleStart: cursor, scheduleEnd: slotEnd });
    cursor = addDays(slotEnd, 1);
  }

  slots[slots.length - 1].scheduleEnd = overallEnd;

  return slots;
}
