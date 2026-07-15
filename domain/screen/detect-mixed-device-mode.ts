import type { DeviceMode } from "@/domain/project/project";
import type { Screen } from "@/domain/screen/screen";

export function detectMixedDeviceMode(deviceMode: DeviceMode, screens: Screen[]): boolean {
  // 현재 방식이 기대하는 디바이스코드(모바일 전용이면 MO, 그 외엔 PC)와
  // 다른 코드의 화면이 하나라도 있으면 혼재로 본다.
  const expected = deviceMode === "mobile" ? "MO" : "PC";
  return screens.length > 0 && screens.some((screen) => screen.deviceCode !== expected);
}
