export const RESERVED_MENU_CODES = ["PC", "MO"] as const;

export type MenuCodeRejection = "duplicate" | "invalid";

export function validateMenuCode(code: string, existingCodes: string[]): MenuCodeRejection | null {
  if (code.length < 2 || (RESERVED_MENU_CODES as readonly string[]).includes(code)) {
    return "invalid";
  }
  if (existingCodes.includes(code)) {
    return "duplicate";
  }
  return null;
}
