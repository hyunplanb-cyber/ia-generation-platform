// 메뉴 구조 조직도 PPT 생성(클라이언트 전용 — pptxgenjs 사용).
import pptxgen from "pptxgenjs";

export interface PptMenu {
  code: string;
  name: string;
  screens: { pageId: string; pageName: string }[];
}

const SLIDE_W = 10;
const MENU_Y = 1.5;
const ROOT_Y = 0.4;
const BOX_H = 0.55;
const SCREEN_GAP = 0.68;

function line(slide: pptxgen.Slide, x1: number, y1: number, x2: number, y2: number) {
  slide.addShape("line", {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    w: Math.max(0.001, Math.abs(x2 - x1)),
    h: Math.max(0.001, Math.abs(y2 - y1)),
    flipH: x2 < x1,
    flipV: y2 < y1,
    line: { color: "E2D3AE", width: 1 },
  });
}

// 조직도 슬라이드 1장을 담은 pptxgen 인스턴스를 만들어 반환한다.
export function createMenuPptx(rootLabel: string, menus: PptMenu[]): pptxgen {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "IA", width: SLIDE_W, height: 5.63 });
  pptx.layout = "IA";
  const slide = pptx.addSlide();

  const n = Math.max(1, menus.length);
  const colW = Math.min(1.9, (SLIDE_W - 0.6) / n);
  const gap = (SLIDE_W - n * colW) / (n + 1);
  const rootW = 2;
  const rootX = (SLIDE_W - rootW) / 2;

  slide.addText(rootLabel, {
    x: rootX,
    y: ROOT_Y,
    w: rootW,
    h: BOX_H,
    fill: { color: "EEEEF0" },
    color: "1F2024",
    align: "center",
    valign: "middle",
    fontSize: 12,
    bold: true,
    rectRadius: 0.05,
    shape: "roundRect",
  });

  menus.forEach((m, i) => {
    const x = gap + i * (colW + gap);
    const cx = x + colW / 2;
    line(slide, rootX + rootW / 2, ROOT_Y + BOX_H, cx, MENU_Y);
    slide.addText(
      [
        { text: m.name, options: { bold: true, fontSize: 12 } },
        { text: `  ${m.code}`, options: { fontSize: 9, color: "FBE7D3" } },
      ],
      {
        x,
        y: MENU_Y,
        w: colW,
        h: BOX_H,
        /* 2026-09-02 — 흰 글자 대비가 3.03 이라 내렸다. globals.css 의 --primary 와 같은 값. */
        fill: { color: "BC5918" },
        color: "FFFFFF",
        align: "center",
        valign: "middle",
        rectRadius: 0.05,
        shape: "roundRect",
      },
    );
    let sy = MENU_Y + SCREEN_GAP;
    m.screens.forEach((s) => {
      line(slide, cx, sy - (SCREEN_GAP - BOX_H), cx, sy);
      slide.addText(
        [
          { text: s.pageName, options: { fontSize: 10 } },
          { text: `\n${s.pageId}`, options: { fontSize: 8, color: "6B6F76" } },
        ],
        {
          x,
          y: sy,
          w: colW,
          h: BOX_H,
          fill: { color: "FFFFFF" },
          line: { color: "E2D3AE", width: 1 },
          color: "1F2024",
          align: "center",
          valign: "middle",
          rectRadius: 0.05,
          shape: "roundRect",
        },
      );
      sy += SCREEN_GAP;
    });
  });

  return pptx;
}
