/* 찍어 둔 팩 화면을 «홈페이지 상세에 올릴 그림»으로 줄여 낸다.
 *
 * 왜 필요한가
 *   2026-08-11 기준 24칸을 진열해 놓고 구매가 0이다. 상세 페이지가 산출물을 «글로만»
 *   설명하고 있어서, 손님은 5만~16만 원을 내기 전에 무엇을 받는지 못 본다.
 *   **보여 주는 것이 가장 센 설명이다.**
 *
 * 어디서 가져오나
 *   팩재료-캡처영상.mts 가 찍어 둔 것을 쓴다. 다시 찍지 않는다 —
 *   두 벌로 찍으면 반드시 갈라진다. 없으면 먼저 이렇게 찍는다:
 *       npx tsx 팩재료-캡처영상.mts LMS --캡처만
 *
 *   「가로」쪽(1440×1000)을 쓴다. 세로 원본은 폰 영상용이라 상세 카드에는 너무 길다.
 *
 * 무엇이 나오나
 *   public/pack-screens/{팩키}-{등급}/NN.webp       1100px 폭 webp
 *   lib/pack-screens.json                          어느 팩에 어떤 화면이 있는지
 *
 * 왜 webp 인가 — png 그대로면 한 장 250KB, 백 장이면 25MB 다.
 *   webp 로 줄이면 한 장 40~70KB 로 앉는다. 상세는 검색 유입 페이지라 무게가 곧 순위다.
 *
 * ⚠ 완성화면이 없는 등급(스탠다드·플러스)은 그림도 없다. 그 등급에서는 이 절을 안 그린다.
 *
 * 쓰는 법
 *   npx tsx 팩화면-웹용.mts
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { PACKAGES, PLAN_NAMES } from "./lib/packages";

const 캡처방 = "판매용_템플릿/_마케팅/릴스영상/_화면캡처";
const 낼방 = "public/pack-screens";
const 목록파일 = "lib/pack-screens.json";

/** 상세 카드에 들어가는 폭. 2열로 놓으면 한 칸이 550px 안팎이라 두 배로 잡았다. */
const 폭 = 1100;

type 한장 = { file: string; id: string; name: string; kind: "main" | "edge" };
const 모음: Record<string, 한장[]> = {};

/* 「LMS_디럭스_코럴선셋」 같은 폴더 이름을 팩키·등급으로 되돌린다.
   폴더 이름의 앞부분은 lib/packages.ts 의 fileLabel 이다. 여기에 따로 적지 않는다. */
const 등급표 = Object.entries(PLAN_NAMES).map(([id, name]) => ({ id, name }));

if (!existsSync(캡처방)) {
  console.error(`${캡처방} 이 없습니다. 먼저 팩재료-캡처영상.mts 로 찍으세요.`);
  process.exit(1);
}
if (existsSync(낼방)) rmSync(낼방, { recursive: true, force: true });

const 폴더들 = readdirSync(캡처방, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

let 만든장 = 0;
for (const 폴더 of 폴더들) {
  const 가로 = join(캡처방, 폴더, "가로");
  if (!existsSync(가로)) continue;

  /* 긴 이름부터 맞춰 본다 — 「장비렌탈」이 「장비」보다 먼저 걸려야 한다. */
  const 팩 = [...PACKAGES]
    .sort((a, b) => b.fileLabel.length - a.fileLabel.length)
    .find((p) => 폴더.startsWith(`${p.fileLabel}_`));
  const 등급 = 등급표.find((t) => 폴더.startsWith(`${팩?.fileLabel}_${t.name}_`));
  if (!팩 || !등급) {
    console.log(`  건너뜁니다 — 어느 팩·등급인지 모르겠습니다: ${폴더}`);
    continue;
  }

  const 키 = `${팩.id}-${등급.id}`;
  const 갈곳 = join(낼방, 키);
  mkdirSync(갈곳, { recursive: true });

  /* 화면 «이름»은 파일명에서 되살리지 않는다.
     파일명은 띄어쓰기를 지운 것이라 「예약1단계-시술선택」처럼 붙어 나온다.
     손님이 받는 스펙팩에 제대로 된 이름이 있으니 거기서 읽는다 —
     페이지 쪽 화면 목록의 ref 는 `ho1` 같은 내부 꼴이라 `HO-01` 과 안 맞는다(2026-08-11). */
  const 스펙 = JSON.parse(readFileSync(join("판매용_템플릿/_판매팩", 폴더.replace(/_[^_]+$/, ""), "07_AI빌드_스펙팩.json"), "utf8"));
  const 이름표 = new Map<string, string>(
    (스펙.menus ?? []).flatMap((m: { screens?: { pageId: string; pageName: string }[] }) =>
      (m.screens ?? []).map((s) => [s.pageId.toUpperCase(), s.pageName] as [string, string]),
    ),
  );

  const 장들 = readdirSync(가로).filter((f) => f.endsWith(".png")).sort();
  const 적을것: 한장[] = [];

  for (const f of 장들) {
    // 「01_HO-01_홈-비로그인.png」 → 번호 · 화면ID · (붙어 버린) 이름
    const m = /^(\d+)_([A-Za-z]{2}-?\d{2,4})_(.+)\.png$/.exec(f);
    if (!m) { console.log(`  이름 꼴이 달라 건너뜁니다: ${f}`); continue; }
    const [, nn, id, 붙은이름] = m;
    const 이름 = 이름표.get(id.toUpperCase()) ?? 붙은이름;
    if (!이름표.has(id.toUpperCase())) console.log(`  ⚠ 스펙팩에 ${id} 가 없어 파일명을 씁니다`);

    /* 주요 화면인지 «실패·예외» 화면인지 표시해 둔다 (2026-08-13 사장님 지시).
       상세에서 배지 색을 갈라 보여 준다 — 우리가 파는 깊이가 예외 화면에 있어서다.
       판단은 «화면 이름»으로 한다. 「취소규정」처럼 규정 안내는 실패가 아니라 「취소」는 뺐다. */
    const 예외말 = /없음|없어|실패|품절|마감|오류|만료|비어|초과|거절|중단|불가|지연|미달|반려|정지|차단|잠김|한도|종료/;
    const 갈래 = 예외말.test(이름) ? "edge" : "main";

    const 낼이름 = `${nn}.webp`;
    await sharp(join(가로, f)).resize({ width: 폭 }).webp({ quality: 78 }).toFile(join(갈곳, 낼이름));
    적을것.push({ file: `/pack-screens/${키}/${낼이름}`, id: id.toUpperCase(), name: 이름, kind: 갈래 });
    만든장 += 1;
  }

  모음[키] = 적을것;
  console.log(`${키}  ${적을것.length}장`);
}

writeFileSync(목록파일, `${JSON.stringify(모음, null, 2)}\n`, "utf8");

const 잰것 = Object.values(모음).flat().length;
console.log(`\n끝났습니다 — ${Object.keys(모음).length}개 팩 · ${만든장}장 → ${낼방}`);
console.log(`목록: ${목록파일} (${잰것}줄)`);
