import type { ScreenDraft, ScreenGenerationEngine } from "@/domain/ports/screen-generation-engine";

function matches(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

export const rulePatternEngine: ScreenGenerationEngine = {
  generate({ menu }): ScreenDraft[] {
    const nameKo = menu.nameKo;
    const combined = `${menu.nameKo} ${menu.nameEn}`;

    if (matches(combined, ["장바구니", "cart"])) {
      return [
        { screenRole: "cart-filled", pageName: `${nameKo} 상품있음` },
        { screenRole: "cart-empty", pageName: `${nameKo} 상품없음` },
      ];
    }

    if (matches(combined, ["회원가입", "가입", "signup", "register"])) {
      return [
        { screenRole: "form", pageName: `${nameKo} 입력` },
        { screenRole: "done", pageName: `${nameKo} 완료` },
      ];
    }

    if (matches(combined, ["게시판", "커뮤니티", "board", "community"])) {
      return [
        { screenRole: "list", pageName: `${nameKo} 목록` },
        { screenRole: "detail", pageName: `${nameKo} 상세` },
        { screenRole: "write", pageName: `${nameKo} 작성` },
      ];
    }

    return [{ screenRole: "default", pageName: nameKo }];
  },
};
