import { readFileSync } from "node:fs";
/* 레이아웃 문서(글)와 뼈대(코드)가 같은 말을 하는지 본다.
 * 그리고 테마의 글자색이 정말 읽히는지 대비를 잰다.
 *
 * 왜 만드나
 *   2026-08-08 에 sidebar·multi 뼈대로 실물을 만들어 보다가 찾았다.
 *   `showcase.list` 는 「매거진형 2열」이라고 적혀 있었는데
 *   `STRUCTURE_COLS.multi` 는 [3,2,1] — 1440px 에서 3열이다.
 *   split 도 같았고, calm 은 글이 2열인데 코드는 1열이었다.
 *
 *   글과 코드가 싸우면 만드는 쪽은 아무거나 고른다. 그래서 셋을 코드에 맞췄다.
 *   사람이 글을 고칠 때 또 어긋날 수 있으므로 검사를 남긴다.
 *
 * 색 검사를 나중에 붙인 까닭 (2026-08-08 오후)
 *   같은 날 색에서 더 큰 게 나왔다. 「진한 글자색」 자리에 연한 민트가 들어가
 *   대비가 **1.01** 이었는데 아무도 몰랐다. 색은 눈으로 보면 「그럴듯」해서
 *   틀린 줄을 모른다 — 5번 항목(겹침 카드)과 같은 종류의 사고다.
 *   숫자로 재는 자를 여기 둔다. 사람이 색을 고칠 때마다 다시 잰다.
 *
 * 쓰는 법: npx tsx check-presets.mts
 *   어긋난 게 있으면 1 로 끝난다. 팩을 굽기 전에 돌린다.
 */
import {
  LAYOUTS, STRUCTURE_COLS, THUMBS, cardWidth,
  DESIGN_OPTIONS, colorsFor, CONTENT_BG, DARK_BG, contrast, TEXT_CONTRAST_MIN,
  accentTextOn, textOn, READING_WIDTH, BREAKPOINTS,
} from "./lib/design-presets";
import { LMS } from "./template-data-lms";
import { BEAUTY } from "./template-data-beauty";
import { TRAVEL } from "./template-data-travel";
import { ADMIN } from "./template-data-admin";
import { MATCHING } from "./template-data-matching";
import { GROUPBUY } from "./template-data-groupbuy";

/* 「N열」만 본다. 「N단」은 히어로·상세의 좌우 나눔을 뜻해서 카드 칸 수와 무관하다. */
const 열찾기 = /([0-9])\s*열/g;

/* 「최대 폭 760px」 · 「본문 폭 760px」 — 글을 한 단으로 좁힐 때의 폭.
 *
 * 2026-08-09 에 넣었다. 이 값이 글에만 세 벌(760·720·680)로 적혀 있었고
 * 그중 둘은 코드에 근거가 없었다. 지금은 LAYOUTS 가 READING_WIDTH 를 끼워 넣으므로
 * 어긋날 수가 없지만, **나중에 사람이 숫자를 손으로 다시 적을 수 있다.**
 * 453px 사고도 처음엔 맞는 값이었다가 뼈대가 바뀌면서 어긋난 것이다. */
const 읽기폭찾기 = /(?:최대\s*폭|본문\s*폭)\s*([0-9]{3,4})\s*px/g;

let 어긋남 = 0;

for (const L of LAYOUTS) {
  const [c1, c2, c3] = STRUCTURE_COLS[L.structure];
  const T = THUMBS.find((t) => t.key === L.thumb)!;
  const 글: [string, string][] = [
    ["hero", L.hero], ["list", L.list], ["nav", L.nav], ["detail", L.detail],
  ];

  const 문제: string[] = [];
  for (const [자리, 문장] of 글) {
    let m;
    열찾기.lastIndex = 0;
    while ((m = 열찾기.exec(문장)) !== null) {
      const 적힌수 = Number(m[1]);
      /* 좁은 화면 칸수(c2·c3)를 같이 적어 두는 것은 맞는 서술이다. */
      if (적힌수 !== c1 && 적힌수 !== c2 && 적힌수 !== c3) {
        문제.push(`${자리}에 「${m[0]}」 — 코드는 ${c1}/${c2}/${c3}열`);
      }
    }

    읽기폭찾기.lastIndex = 0;
    while ((m = 읽기폭찾기.exec(문장)) !== null) {
      const 적힌폭 = Number(m[1]);
      if (적힌폭 !== READING_WIDTH) {
        문제.push(
          `${자리}에 「${m[0]}」 — 읽기 폭은 ${READING_WIDTH}px 하나입니다(READING_WIDTH)`
            + (적힌폭 === BREAKPOINTS.narrow
              ? `. ${BREAKPOINTS.narrow} 은 휴대폰 기준선 값이라 읽기 폭으로 쓰면 두 뜻이 겹칩니다`
              : ""),
        );
      }
    }
  }

  const 표 = `${L.key.padEnd(10)}${L.label.padEnd(10)}뼈대=${L.structure.padEnd(10)}카드=${L.thumb.padEnd(8)}`
    + `${c1}/${c2}/${c3}열 · 카드 ${cardWidth(c1, 1440, L.structure)}px`
    + (T.aspect ? ` · 비율 ${T.aspect}` : "");

  if (문제.length) {
    어긋남 += 문제.length;
    console.log(`✗ ${표}`);
    문제.forEach((x) => console.log(`    ${x}`));
  } else {
    console.log(`· ${표}`);
  }
}

/* ── 색 대비 ────────────────────────────────────────────────
   바탕 CONTENT_BG 위에서 글자로 쓰는 값이 정말 읽히는지 잰다.
   accent 는 배경 전용이므로 재지 않는다 — 여기서 재면 다섯 테마가 전부 걸리는데,
   그건 「틀린 게 아니라 배경용이라서」다. 그러라고 accentText 를 따로 둔 것이다. */
console.log("");
console.log(`색 대비 — 밝은 바탕 ${CONTENT_BG} · 어두운 바탕 ${DARK_BG} (${TEXT_CONTRAST_MIN} 이상이어야 본문)`);

const 재기 = (색: string, 바탕 = CONTENT_BG) => contrast(색, 바탕).toFixed(2).padStart(5);

for (const o of DESIGN_OPTIONS) {
  const 색표 = colorsFor(o.key);
  const 문제: string[] = [];

  // 밝은 바탕에서 글자로 쓰는 두 값
  for (const [자리, 색] of [["본문(ink)", o.ink], ["글자용 강조(accentText)", o.accentText]] as const) {
    if (contrast(색) < TEXT_CONTRAST_MIN) {
      문제.push(`${자리} ${색} — 밝은 바탕에서 ${contrast(색).toFixed(2)}, ${TEXT_CONTRAST_MIN} 미만이라 본문에 못 씁니다`);
    }
  }

  /* 어두운 바탕에서도 강조를 글자로 쓸 수 있어야 한다.
     레트로가 여기서 걸렸다 — 틸이 어두운 바탕 위 3.12 였다(2026-08-09). */
  if (contrast(o.accentTextDark, DARK_BG) < TEXT_CONTRAST_MIN) {
    문제.push(
      `글자용 강조(accentTextDark) ${o.accentTextDark} — 어두운 바탕에서 `
        + `${contrast(o.accentTextDark, DARK_BG).toFixed(2)}, ${TEXT_CONTRAST_MIN} 미만입니다`,
    );
  }

  /* 배경을 주면 재서 골라 주는 함수가 정말 읽히는 값을 내는지 — 두 바탕 다 확인한다.
     값이 맞아도 고르는 쪽이 틀리면 소용이 없다. */
  for (const 바탕 of [CONTENT_BG, DARK_BG]) {
    const 고른값 = accentTextOn(o, 바탕);
    if (contrast(고른값, 바탕) < TEXT_CONTRAST_MIN) {
      문제.push(`accentTextOn 이 ${바탕} 에서 ${고른값} 을 골랐는데 대비 ${contrast(고른값, 바탕).toFixed(2)} 입니다`);
    }
  }

  /* 상태색(success·warning·danger)도 글자로 쓴다.
   *
   * 이 셋은 lib 이 아니라 build-design-presets.mts 에만 있어서
   * 대비 검사를 «한 번도» 안 받았다(2026-08-09에 발견).
   * 재 보니 warning #B4761A 가 3.29, #9A6700 이 4.23 이었다 —
   * 「경고」라고 써 놓은 글자가 정작 안 읽혔다.
   *
   * lib 에서 읽을 수 없으니 그 파일의 글에서 직접 뽑아 잰다.
   * 두 벌인 것을 검사기가 이어 준다 — 합치는 것이 낫지만, 합치기 전까지는
   * 적어도 «갈라진 채로 틀리지는» 않게 한다. */
  if (o === DESIGN_OPTIONS[0]) {
    const src = readFileSync("build-design-presets.mts", "utf8");
    const 본 = new Set<string>();
    for (const m of src.matchAll(/"(success|warning|danger)"\s*:\s*"(#[0-9A-Fa-f]{6})"/g)) {
      const [, 이름, hex] = m;
      if (본.has(hex)) continue;
      본.add(hex);
      const v = contrast(hex, CONTENT_BG);
      if (v < TEXT_CONTRAST_MIN) {
        문제.push(`상태색 ${이름} ${hex} — 밝은 바탕에서 ${v.toFixed(2)}, 글자로 못 씁니다 (build-design-presets.mts)`);
      }
    }
  }

  /* 색을 «바탕으로» 깔았을 때 그 위 글자가 읽히나 — 반대 방향.
   *
   * 이 검사가 없어서 여섯 테마의 「버튼(주요)」가 전부 「흰 글자」로 적혀 있었고,
   * 레트로(3.28)·코럴(3.14)의 버튼 글자가 안 읽혔다(2026-08-09).
   * 위쪽 검사는 「이 색을 글자로 쓸 때」만 봤다 — 방향이 하나뿐이었다.
   *
   * 흰 글자를 강요하지 않는다. textOn 이 재서 고르므로, 여기서는
   * **고른 값이 정말 읽히는지**만 본다. 어느 색이 와도 4.5 를 넘어야 한다. */
  for (const [자리, 바탕] of [["주색(primary)", o.primary], ["강조색(accent)", o.accent]] as const) {
    const 글자 = textOn(바탕);
    const 값 = contrast(글자, 바탕);
    if (값 < TEXT_CONTRAST_MIN) {
      문제.push(
        `${자리} ${바탕} 위에는 흰색도 먹색도 못 씁니다 — 고른 ${글자} 가 ${값.toFixed(2)} 입니다. `
          + `버튼 글자가 안 읽히니 색 자체를 진하게 잡으세요`,
      );
    }
    const 표값 = 색표[자리.startsWith("주색") ? "on-primary(주색 배경 위 글자)" : "on-accent(강조색 배경 위 글자)"];
    if (표값 && 표값.toUpperCase() !== 글자.toUpperCase()) {
      문제.push(`색 표의 ${자리} 위 글자가 ${표값} 인데 재서 고른 값은 ${글자} 입니다`);
    }
  }

  /* DESIGN_OPTIONS 와 PRESETS.colors 는 같은 값을 두 벌로 들고 있다.
     한쪽만 고치면 카드에 보이는 색과 팩 문서에 적히는 색이 갈린다. */
  const 짝 = [
    ["ink", o.ink, 색표["text(본문)"]],
    ["accent", o.accent, 색표["accent(강조·배지)"] ?? 색표["accent(강조)"]],
    ["accentText", o.accentText, 색표["accent-text(강조 글자용)"]],
    ["accentTextDark", o.accentTextDark, 색표["accent-text-dark(어두운 바탕 글자용)"]],
  ] as const;
  for (const [이름, 여기, 저기] of 짝) {
    if (저기 === undefined) 문제.push(`${이름} 이 PRESETS.colors 에 없습니다`);
    else if (여기.toUpperCase() !== 저기.toUpperCase()) {
      문제.push(`${이름} 이 두 곳에서 다릅니다 — DESIGN_OPTIONS ${여기} / PRESETS.colors ${저기}`);
    }
  }

  const 표 = `${o.key.padEnd(8)}${o.title.padEnd(12)}`
    + `본문 ${재기(o.ink)} · 글자용 강조 ${재기(o.accentText)}`
    + ` · 어두운 바탕 ${재기(o.accentTextDark, DARK_BG)}`
    + ` · (강조 ${재기(o.accent)} 배경 전용)`;

  if (문제.length) {
    어긋남 += 문제.length;
    console.log(`✗ ${표}`);
    문제.forEach((x) => console.log(`    ${x}`));
  } else {
    console.log(`· ${표}`);
  }
}

/* ── 업종 스펙팩 1장의 「디자인 컨셉」 색 ────────────────────
 *
 * 2026-08-09 에 넣었다. 테마 색은 다 재고 있었는데 **여기가 사정권 밖이었다.**
 * 업종마다 손으로 적은 색이 있고, 그중 셋이 「포인트」라면서 글자로 못 쓰는 값이었다
 *   LMS 오렌지 2.26 · 관리자 블루 4.22 · 공동구매 코랄레드 2.65
 *
 * 왜 위험한가 — 스펙팩은 「프리셋이 없다면 1장의 디자인 컨셉을 토큰화하라」고 말한다.
 * 즉 프리셋 없이 쓰는 손님에게는 **이 한 줄이 유일한 색 지시**다.
 * 공동구매는 할인율·남은 시간이 주인공인데 그걸 2.65 짜리 색으로 쓰라고 한 셈이었다.
 *
 * 「배경」이라고 적힌 색은 재지 않는다 — 배경은 연한 게 맞다.
 * 「글자에는 #…」로 적힌 색은 반드시 잰다.
 */
const 업종컨셉: [string, string][] = [
  ["LMS", LMS.project.designConcept],
  ["뷰티샵", BEAUTY.project.designConcept],
  ["여행", TRAVEL.project.designConcept],
  ["관리자", ADMIN.project.designConcept],
  ["매칭", MATCHING.project.designConcept],
  ["공동구매", GROUPBUY.project.designConcept],
];

console.log("");
console.log("업종 스펙팩 1장의 디자인 컨셉 색");
for (const [업종, 컨셉] of 업종컨셉) {
  const 문제: string[] = [];
  const 잰것: string[] = [];
  for (const m of 컨셉.matchAll(/#[0-9A-Fa-f]{6}/g)) {
    const 색 = m[0];
    /* 창을 좁게 잡는다. 넓게 잡았더니 「베이지(#F5EFE9) 배경에 딥 플럼(#7A3B5D) 포인트」에서
       앞 색의 「배경」이 뒤 색까지 덮어, 플럼을 안 재고 넘어갔다. 지금은 6.99 라 안 걸리지만
       다음에 연한 포인트 색이 오면 조용히 통과한다 — 헛경보보다 나쁜 쪽이다. */
    const 앞 = 컨셉.slice(Math.max(0, m.index - 7), m.index);
    const 뒤 = 컨셉.slice(m.index + 7, m.index + 19);
    /* 「글자에는 #…」이면 무조건 잰다. 그 밖에 바로 앞뒤에 「배경」이 붙어 있으면 배경색이다. */
    const 글자용 = /글자에는\s*$/.test(앞);
    if (!글자용 && /배경/.test(앞 + 뒤)) { 잰것.push(`${색} 배경`); continue; }
    const r = contrast(색);
    잰것.push(`${색} ${r.toFixed(2)}`);
    if (r < TEXT_CONTRAST_MIN) {
      문제.push(`${색} 이 ${r.toFixed(2)} 입니다 — 「포인트」로 적으면 글자에 쓰입니다. `
        + `배경 전용이면 「배경·배지 전용, 글자에는 #…」처럼 갈라 적으세요`);
    }
  }
  const 표 = `${업종.padEnd(6)}${잰것.join(" · ") || "(색 없음)"}`;
  if (문제.length) {
    어긋남 += 문제.length;
    console.log(`✗ ${표}`);
    문제.forEach((x) => console.log(`    ${x}`));
  } else {
    console.log(`· ${표}`);
  }
}

/* ── 고를 수 있다고 내놓은 색을 «정말 만들 수 있나» ────────────────
 *
 * 2026-08-10 에 렌탈 팩을 만들다 걸렸다. 가이드는 색을 6종 내놓는데
 * 정작 팩을 굽는 build-design-presets.mts 는 «자기 목록»을 따로 들고 있었고
 * 거기엔 5종뿐이었다. 레트로 페이퍼를 고르자 그제야 죽었다.
 *
 * 이 검사기는 그때까지 통과를 찍고 있었다 — 두 목록을 견줘 본 적이 없어서다.
 * 같은 것을 두 벌로 적으면 반드시 갈라진다. 일곱 번째다.
 * 고르라고 내놓고 못 만드는 것은 «없는 것보다 나쁘다» — 고른 사람이 그제야 안다. */
{
  const 굽는이 = readFileSync("build-design-presets.mts", "utf8");
  /* 그 파일의 PRESETS 배열에 적힌 key 들만 뽑는다. */
  const 블록 = 굽는이.slice(굽는이.indexOf("const PRESETS: Preset[] = ["));
  const 만들수있는색 = new Set(
    [...블록.slice(0, 블록.indexOf("\n];")).matchAll(/^\s*key: "(\w+)"/gm)].map((m) => m[1]),
  );
  const 못만드는색 = DESIGN_OPTIONS.filter((o) => !만들수있는색.has(o.key));
  if (못만드는색.length) {
    어긋남 += 못만드는색.length;
    for (const o of 못만드는색) {
      console.log(
        `✗ 「${o.title}」(${o.key}) — 가이드는 고를 수 있다고 내놓는데 ` +
          `build-design-presets.mts 의 PRESETS 에 정의가 없습니다. 고르면 굽다가 죽습니다.`,
      );
    }
  } else {
    console.log(`· 색 ${DESIGN_OPTIONS.length}종 모두 실제로 구울 수 있습니다`);
  }
}

console.log("");
if (어긋남) {
  // 어디를 고쳐야 하는지 함께 말한다 — 색·레이아웃은 lib, 업종 컨셉은 업종 데이터다.
  console.log(`어긋난 곳 ${어긋남}군데. lib/design-presets.ts (또는 업종이면 template-data-*.ts) 를 고치세요.`);
  process.exit(1);
}
console.log(`레이아웃 ${LAYOUTS.length}개 · 테마 ${DESIGN_OPTIONS.length}개, 글과 코드가 같은 말을 합니다.`);
