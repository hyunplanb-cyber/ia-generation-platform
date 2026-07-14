export function derivePageId(deviceCode: string, menuCode: string, serial: number): string {
  return `${deviceCode}${menuCode}${String(serial).padStart(4, "0")}`;
}
