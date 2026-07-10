const GRACE_PERIOD_DAYS = 30;

export function daysUntilAccountDeletion(deletedAt: Date): number {
  const elapsedMs = Date.now() - deletedAt.getTime();
  const elapsedDays = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
  return Math.max(0, GRACE_PERIOD_DAYS - elapsedDays);
}
