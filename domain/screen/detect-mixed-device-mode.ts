import type { DeviceMode } from "@/domain/project/project";
import type { Screen } from "@/domain/screen/screen";

export function detectMixedDeviceMode(deviceMode: DeviceMode, screens: Screen[]): boolean {
  const hasMobileScreen = screens.some((screen) => screen.deviceCode === "MO");

  if (deviceMode === "responsive") {
    return hasMobileScreen;
  }

  return screens.length > 0 && !hasMobileScreen;
}
