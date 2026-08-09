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

// 토·일은 작업일로 잡지 않는다.
//
// 예전엔 달력일을 그대로 잘라 나눠서, 화면 15개짜리 일정 중 6개가 주말에 걸쳤다
// ("결제: 08-15(토) ~ 08-16(일)" — 2026-08-03). 기획자가 WBS를 열면 바로 눈에 띄는
// 문제라, 산출물 전체의 신뢰를 깎는다.
// 공휴일까지는 보지 않는다 — 나라마다 다르고, 주말만 빼도 대부분 자연스러워진다.
const WEEKEND = new Set([0, 6]); // 0=일, 6=토

function isWorkday(dateStr: string): boolean {
  return !WEEKEND.has(new Date(`${dateStr}T00:00:00Z`).getUTCDay());
}

function nextWorkday(dateStr: string): string {
  let d = dateStr;
  while (!isWorkday(d)) d = addDays(d, 1);
  return d;
}

/** 시작~종료 사이의 평일을 날짜 문자열로 모은다. */
function workdaysIn(startStr: string, endStr: string): string[] {
  const out: string[] = [];
  for (let d = startStr; daysBetween(d, endStr) >= 0; d = addDays(d, 1)) {
    if (isWorkday(d)) out.push(d);
  }
  return out;
}

// 기간이 통째로 주말일 때만 쓰는 예비 계산 — 달력일을 그대로 나눈다.
function distributeByCalendar(
  overallStart: string,
  overallEnd: string,
  count: number,
): ScheduleSlot[] {
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

/**
 * 시작일부터 "화면당 며칠"씩 차례로 잡는다(주말 제외).
 *
 * 전체 기간을 나누는 distributeSchedule과 달리, 화면당 작업일이 먼저 정해져 있는
 * 판매 템플릿 쪽에서 쓴다. 주말을 건너뛰는 규칙은 한곳에 두려고 여기에 뒀다.
 */
export function sequentialWorkdaySlots(
  overallStart: string,
  count: number,
  daysPerItem = 2,
): ScheduleSlot[] {
  const next = workdayStepper(overallStart, daysPerItem);
  // Array.from 의 콜백은 (값, 순번)을 넘긴다 — 그대로 주면 순번이 일수로 들어간다.
  return Array.from({ length: count }, () => next());
}

/**
 * 같은 규칙을 화면 개수를 미리 모를 때 쓰는 형태.
 * 부를 때마다 다음 칸을 하나씩 내준다(상세 IA처럼 잎사귀를 훑으며 만드는 경우).
 */
export function workdayStepper(
  overallStart: string,
  daysPerItem = 2,
): (days?: number) => ScheduleSlot {
  let cursor = nextWorkday(overallStart);
  /* 부를 때 일수를 주면 그걸 쓰고, 안 주면 기본값을 쓴다.
     화면마다 담은 일이 다른데 전부 같은 일수를 주면 WBS 가 「전 화면 2일」이 된다 —
     기획을 아는 사람은 그 표를 보는 순간 자동생성인 걸 안다(2026-08-09). */
  return (days = daysPerItem) => {
    let end = cursor;
    for (let d = 1; d < Math.max(1, days); d++) end = nextWorkday(addDays(end, 1));
    const slot = { scheduleStart: cursor, scheduleEnd: end };
    cursor = nextWorkday(addDays(end, 1));
    return slot;
  };
}

export function distributeSchedule(
  overallStart: string,
  overallEnd: string,
  count: number,
): ScheduleSlot[] {
  if (count <= 0) return [];

  const workdays = workdaysIn(overallStart, overallEnd);
  if (workdays.length === 0) return distributeByCalendar(overallStart, overallEnd, count);

  // 화면 수가 평일 수보다 많으면 뒤로 밀어서라도 하루씩은 준다.
  // (전체 일정을 넘기지만, 일정을 못 받는 화면이 생기는 것보다 낫다.)
  while (workdays.length < count) {
    workdays.push(nextWorkday(addDays(workdays[workdays.length - 1], 1)));
  }

  const baseSize = Math.floor(workdays.length / count);
  const remainder = workdays.length % count;

  const slots: ScheduleSlot[] = [];
  let i = 0;
  for (let n = 0; n < count; n++) {
    const size = baseSize + (n < remainder ? 1 : 0);
    slots.push({ scheduleStart: workdays[i], scheduleEnd: workdays[i + size - 1] });
    i += size;
  }

  // 마지막을 overallEnd로 억지로 맞추지 않는다 — 종료일이 토요일이면
  // 주말을 뺀 의미가 없어진다. 마지막 평일에서 끝나는 게 맞다.
  return slots;
}
