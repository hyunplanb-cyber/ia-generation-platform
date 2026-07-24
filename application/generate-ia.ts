import { claudeIaGenerator } from "@/adapters/generation/llm/claude-ia-generator";
import { drizzleMenuRepository } from "@/adapters/repository/drizzle/menu-repository";
import { drizzleScreenRepository } from "@/adapters/repository/drizzle/screen-repository";
import { drizzleButtonActionRepository } from "@/adapters/repository/drizzle/button-action-repository";
import { deriveMenuCode } from "@/domain/menu/derive-menu-code";
import { validateMenuCode } from "@/domain/menu/menu-code-rules";
import { derivePageId } from "@/domain/screen/derive-page-id";
import { distributeSchedule } from "@/domain/schedule/distribute-schedule";
import type { CreateScreenInput } from "@/domain/ports/screen-repository";
import type { GeneratedButtonDraft } from "@/domain/ports/ia-generator";
import { withProjectAuth } from "@/application/with-project-auth";

export type GenerateIaResult =
  | { ok: true; menuCount: number; screenCount: number }
  | { ok: false; reason: "unavailable" | "no-credit" | "already-has-menus" | "too-large" | "failed" };

// nameEn에서 프로젝트 내 고유한 2글자 메뉴코드를 만든다.
// 앞 2글자가 겹치거나 예약어면 다른 글자 조합 → A~Z 조합 순으로 대체한다.
function resolveMenuCode(nameEn: string, existingCodes: string[]): string {
  const letters = nameEn.toUpperCase().replace(/[^A-Z]/g, "");
  const candidates: string[] = [];
  if (letters.length >= 2) {
    candidates.push(letters.slice(0, 2));
    for (let i = 1; i < letters.length; i++) {
      candidates.push(letters[0] + letters[i]);
    }
  }
  for (let a = 65; a <= 90; a++) {
    for (let b = 65; b <= 90; b++) {
      candidates.push(String.fromCharCode(a) + String.fromCharCode(b));
    }
  }
  for (const code of candidates) {
    if (!validateMenuCode(code, existingCodes)) {
      return code;
    }
  }
  return "ZZ";
}

export async function generateIa(projectId: string): Promise<GenerateIaResult> {
  return withProjectAuth(projectId, async (project) => {
    const existingMenus = await drizzleMenuRepository.listByProject(projectId);
    if (existingMenus.length > 0) {
      return { ok: false, reason: "already-has-menus" };
    }

    let output;
    try {
      output = await claudeIaGenerator.generate({
        concept: project.concept,
        menuDraft: project.menuDraft,
        designConcept: project.designConcept,
        deviceMode: project.deviceMode,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "ANTHROPIC_API_KEY_MISSING") {
        return { ok: false, reason: "unavailable" };
      }
      // 크레딧 부족 등 결제 관련 오류는 앱을 죽이지 않고 안내로 처리한다.
      if (error instanceof Error && error.message.includes("credit balance")) {
        return { ok: false, reason: "no-credit" };
      }
      // 출력이 최대 길이에 걸려 잘린 경우 — 메뉴가 아주 많은 컨셉에서 드물게 발생. 재시도 안내.
      if (error instanceof Error && error.message === "IA_GENERATOR_TRUNCATED") {
        return { ok: false, reason: "too-large" };
      }
      if (error instanceof Error && error.message === "IA_GENERATOR_BAD_OUTPUT") {
        return { ok: false, reason: "failed" };
      }
      // 그 밖의 API/네트워크 오류도 크래시 대신 실패로 저하한다.
      console.error("generateIa failed:", error);
      return { ok: false, reason: "failed" };
    }

    const deviceCodes = project.deviceMode === "mobile" ? ["MO"] : ["PC"];
    const usedCodes: string[] = [];
    const inputs: CreateScreenInput[] = [];
    // inputs와 1:1 순서로 대응하는 메타(버튼 연결 2차 패스에서 사용)
    const meta: { ref: string; deviceCode: string; buttons: GeneratedButtonDraft[] }[] = [];

    for (const menuDraft of output.menus) {
      const menuCode = resolveMenuCode(menuDraft.nameEn, usedCodes);
      usedCodes.push(menuCode);

      const derivedFallback = deriveMenuCode(menuDraft.nameEn).toUpperCase();
      const menu = await drizzleMenuRepository.create({
        projectId,
        nameKo: menuDraft.nameKo,
        // deriveMenuCode를 참고용으로 계산하되 실제 저장은 고유 보장된 menuCode를 쓴다.
        nameEn: menuDraft.nameEn || derivedFallback,
        menuCode,
        description: menuDraft.description,
        desiredFeatures: null,
        sortOrder: usedCodes.length - 1,
      });

      for (const deviceCode of deviceCodes) {
        let serial = 1000;
        for (const screen of menuDraft.screens) {
          inputs.push({
            projectId,
            menuId: menu.id,
            pageId: derivePageId(deviceCode, menuCode, serial),
            pageName: screen.pageName,
            screenRole: screen.screenRole,
            deviceCode,
            funcDef: screen.funcDef || undefined,
            prompt: screen.prompt || undefined,
          });
          meta.push({ ref: screen.ref, deviceCode, buttons: screen.buttons });
          serial += 1;
        }
      }
    }

    if (inputs.length === 0) {
      return { ok: true, menuCount: output.menus.length, screenCount: 0 };
    }

    const slots = distributeSchedule(project.overallStart, project.overallEnd, inputs.length);
    const inputsWithSchedule = inputs.map((input, index) => ({
      ...input,
      scheduleStart: slots[index]?.scheduleStart,
      scheduleEnd: slots[index]?.scheduleEnd,
    }));
    const createdScreens = await drizzleScreenRepository.createMany(inputsWithSchedule);

    // 2차 패스: 버튼-이동 연결 생성. createMany는 입력 순서대로 행을 돌려주므로
    // meta[i]가 createdScreens[i]에 대응한다. (ref, deviceCode)로 이동 대상을 찾는다.
    const screenByRefDevice = new Map<string, { id: string; pageId: string }>();
    createdScreens.forEach((screen, index) => {
      screenByRefDevice.set(`${meta[index].ref}::${screen.deviceCode}`, {
        id: screen.id,
        pageId: screen.pageId,
      });
    });

    // 버튼 연결을 모아 한 번의 쿼리로 저장한다. 예전엔 버튼마다 INSERT를 날려
    // (수십 번) DB 왕복이 쌓였고, 서버-DB가 멀어진 뒤 60초 제한을 넘겨 생성이 끊겼다.
    const buttonInputs = [];
    for (let i = 0; i < createdScreens.length; i++) {
      const source = createdScreens[i];
      for (const button of meta[i].buttons) {
        const target = screenByRefDevice.get(`${button.targetRef}::${source.deviceCode}`);
        // 대상을 못 찾거나 자기 자신을 가리키면 건너뛴다(깨진 연결 방지).
        if (!target || target.id === source.id) continue;
        buttonInputs.push({
          screenId: source.id,
          label: button.label,
          targetScreenId: target.id,
          targetPageIdSnapshot: target.pageId,
        });
      }
    }
    await drizzleButtonActionRepository.createMany(buttonInputs);

    return { ok: true, menuCount: output.menus.length, screenCount: inputs.length };
  });
}
