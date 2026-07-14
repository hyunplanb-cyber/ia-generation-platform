import { drizzleScreenRepository } from "@/adapters/repository/drizzle/screen-repository";
import { distributeSchedule } from "@/domain/schedule/distribute-schedule";
import { withProjectAuth } from "@/application/with-project-auth";

export async function recalculateSchedule(
  projectId: string,
  overallStart: string,
  overallEnd: string,
): Promise<void> {
  await withProjectAuth(projectId, async () => {
    const screens = await drizzleScreenRepository.listByProject(projectId);
    const unlocked = screens.filter((s) => !s.scheduleLocked);
    if (unlocked.length === 0) return;

    const slots = distributeSchedule(overallStart, overallEnd, unlocked.length);
    const updates = unlocked.map((s, index) => ({
      id: s.id,
      scheduleStart: slots[index].scheduleStart,
      scheduleEnd: slots[index].scheduleEnd,
    }));

    await drizzleScreenRepository.updateSchedules(projectId, updates);
  });
}
