/* 무료 스톡 사진에 «예시» 표시를 박아 팩에 넣을 수 있게 만든다.
 *
 * 왜 이렇게 하나 (2026-08-11, 사장님이 정하심)
 *   픽사베이 같은 곳의 사진은 상업 이용이 되지만, **팔리는 템플릿에 넣는 것**은
 *   회색지대다 — 구매자가 그 사진을 «그대로» 갖게 되기 때문이다.
 *
 *   워터마크가 그 문제를 정면으로 푼다. 구매자가 받는 것은 「쓸 수 있는 사진」이 아니라
 *   **「여기에 사진을 넣으세요」라고 표시된 자리**가 된다. 원래 회색 네모가 하던 말을
 *   사진이 대신 하면서 화면도 산다.
 *
 * ⚠ 게티(Getty)는 «유료» 스톡이다. 무료로 쓰는 길은 임베드(iframe)뿐이고 파일로 못 받는다.
 *   여기 넣지 마라. 픽사베이·언스플래시처럼 «무료 라이선스»가 분명한 것만 쓴다.
 *
 * ⚠ 출처를 반드시 적는다. `출처.csv` 가 없으면 만들어 주고, 빈 줄이 있으면 알려 준다.
 *   나중에 「이 사진 어디서 났느냐」는 물음에 답할 수 있어야 한다. 그게 진짜 방패다.
 *
 * 자리 (2026-09-10 에 «원본을 안 남기는» 쪽으로 바꿨다 — 현님 결정)
 *   판매용_템플릿/_이미지/0_새로받은것/<업종>/*.jpg|png|webp  ← 받은 사진을 여기에 «그냥» 넣는다
 *   판매용_템플릿/_이미지/팩용/<업종>/*.webp                  ← 여기로 나온다 (워터마크 박힘)
 *   판매용_템플릿/_이미지/팩용/_출처/<업종>.csv               ← 어디서 받았는지
 *
 * ⛔ 원본은 «안 남긴다» (2026-09-10 현님: 「워터마크 해서 저장하고 원본 버리자」)
 *   전에는 `_이미지/사진/`(워터마크 전) → `_이미지/팩용/`(후) 두 벌을 갖고 있었다.
 *   업종이 하나 늘 때마다 원본 40MB · webp 4MB 로 열 배가 넘는 짐이 영구히 쌓였다.
 *   원본이 필요한 자리는 «워터마크 문구·크기를 바꿀 때» 하나뿐인데 8/11 이후 한 번도 안 바꿨고,
 *   팩에 실리는 것은 «예시 이미지»라 그 사진 한 장이 아니라 역할만 맞으면 된다.
 *   → 굽고 나면 `--원본둠` 을 안 주는 한 원본을 지운다. 1,778MB 를 243MB 로 줄인 결정이다.
 *   ⚠ 그래서 «옛 업종을 다시 구울 원본이 없다». 다시 구우려면 사진을 새로 받아야 한다.
 *
 * 몇 장이 필요한가 — «자리 수»가 아니라 «이름 수»로 센다.
 *   팩마다 카드 이름이 8~14가지뿐이라 20장이면 두 등급이 다 덮인다.
 *   `_작업/자리이름모으기.mjs` 가 세어 준다.
 *
 * 쓰는 법
 *   npx tsx 이미지-예시만들기.mts 뷰티샵
 *   npx tsx 이미지-예시만들기.mts 고양이
 *   npx tsx 이미지-예시만들기.mts            (원본이 있는 업종 전부)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

/* ⚠ 2026-08-13 에 그림을 «_이미지» 한 곳으로 모았다.
     전:  _이미지/_원본/<업종>  →  _이미지/<업종>
     후:  _이미지/사진/<업종>   →  _이미지/팩용/<업종>
   고양이는 우리가 만든 것이라 「받은 사진」이 아니다. 그래서 자리가 따로다 —
   ⛔ 2026-09-10 — `고양이` 갈래를 없앴다. 옛 원본 자리(_이미지/고양이/장면) → 지금은 `_이미지/팩용/고양이/` 의 webp 만 있다.

   ⛔ 2026-09-02 에 자리를 갈랐다 (사장님 지시) — 마스코트는 «긴머리»다.
     고양이·동물은 팩에 쓰고, 긴머리는 SNS 에 쓴다. 그래서 원본 자리도 나뉜다.
     옛 이름 `마스코트` 로 불러도 받아 준다 — 대본·문서가 아직 그렇게 부른다. */
const 원본방 = "판매용_템플릿/_이미지/0_새로받은것";
const 낼방뿌리 = "판매용_템플릿/_이미지/팩용";
const 출처방 = "판매용_템플릿/_이미지/팩용/_출처";
/** 굽고 나서 원본을 지운다. --원본둠 을 주면 남긴다. */
const 원본둠 = process.argv.includes("--원본둠");
const 원본어디 = (업종: string) => join(원본방, 업종);

/** 긴 변 기준. 팩 안에서 자리표 대신 쓰는 그림이라 이보다 클 이유가 없다.
 *  ⚠ 일부러 크게 두지 않는다 — 큰 원본을 그대로 실어 주면 워터마크를 지우고 쓰기 쉬워진다. */
const 긴변 = 1400;

const 고른업종 = process.argv[2];

if (!existsSync(원본방)) {
  mkdirSync(원본방, { recursive: true });
  console.log(`${원본방} 을 만들었습니다.`);
  console.log("  업종 폴더를 만들고 (예: 뷰티샵) 그 안에 받은 사진을 넣은 뒤 다시 부르세요.");
  process.exit(0);
}

/** 대각선으로 되풀이되는 «예시» 표시.
 *  한 군데만 박으면 잘라 내면 그만이다. 화면 전체에 옅게 깔아야 「예시」로 읽힌다. */
function 워터마크SVG(w: number, h: number): Buffer {
  const 글씨 = Math.max(18, Math.round(w / 34));
  const 칸 = 글씨 * 11;
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="p" width="${칸}" height="${Math.round(칸 * 0.52)}" patternUnits="userSpaceOnUse"
             patternTransform="rotate(-28)">
      <!-- ⚠ 흰 글자만 쓰면 «밝은 사진»에서 통째로 사라진다. 2026-08-11 에 시험 사진의
           흰 원 위에서 글자가 안 보였다. 어두운 테두리를 둘러 어디서나 읽히게 한다.
           paint-order 로 테두리를 «글자 밑»에 깔아야 획이 안 굵어진다. -->
      <text x="0" y="${글씨}" font-family="Malgun Gothic, Pretendard, sans-serif"
            font-size="${글씨}" font-weight="700"
            fill="#ffffff" fill-opacity="0.38"
            stroke="#000000" stroke-opacity="0.30" stroke-width="${Math.max(1, 글씨 / 14)}"
            paint-order="stroke fill">예시 이미지</text>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#p)"/>
  <!-- 아래 띠 — 여기만 또렷하게. 잘라 내도 위의 무늬가 남는다.
       ⚠ 글을 «가운데»에 놓고 짧게 쓴다. 화면에 들어가면 object-fit:cover 가 좌우를 자르는데,
         왼쪽에 붙여 두었더니 「입니다 · 실제 사진으로 바꿔 넣으세요」로 잘려 나왔다(2026-08-11).
         가운데면 어느 쪽이 잘려도 말이 남는다. -->
  <rect x="0" y="${h - Math.round(글씨 * 2.2)}" width="${w}" height="${Math.round(글씨 * 2.2)}"
        fill="#000000" fill-opacity="0.5"/>
  <text x="${Math.round(w / 2)}" y="${h - Math.round(글씨 * 0.68)}" text-anchor="middle"
        font-family="Malgun Gothic, Pretendard, sans-serif" font-size="${Math.round(글씨 * 0.82)}"
        font-weight="700" fill="#ffffff">예시 이미지 · 바꿔 넣으세요</text>
</svg>`);
}

/** 출처를 적어 두는 표. 없으면 만들어 준다.
 *  ⭐ 2026-09-10 — 원본을 안 남기게 되면서 «출처표는 팩용 쪽»에 산다.
 *     그림은 버려도 「어디서 받았나」는 남아야 한다. */
function 출처챙기기(출처방: string, 파일들: string[], 업종: string) {
  mkdirSync(출처방, { recursive: true });
  const 길 = join(출처방, `${업종}.csv`);
  const 있던것 = new Map<string, string>();
  if (existsSync(길)) {
    for (const 줄 of readFileSync(길, "utf8").split(/\r?\n/).slice(1)) {
      const [f, 어디, 주소] = 줄.split(",");
      if (f) 있던것.set(f.trim(), `${(어디 ?? "").trim()},${(주소 ?? "").trim()}`);
    }
  }
  const 줄들 = ["파일,어디서받았나,주소"];
  const 빈것: string[] = [];
  for (const f of 파일들) {
    const 값 = 있던것.get(f) ?? ",";
    줄들.push(`${f},${값}`);
    if (값.replace(/,/g, "").trim() === "") 빈것.push(f);
  }
  writeFileSync(길, `${줄들.join("\n")}\n`, "utf8");
  return { 길, 빈것 };
}

const 업종들 = readdirSync(원본방, { withFileTypes: true })
  .filter((e) => e.isDirectory() && (!고른업종 || e.name === 고른업종))
  .map((e) => e.name);

if (!업종들.length) {
  console.error(고른업종
    ? `${원본방}/${고른업종} 폴더가 없습니다.`
    : `${원본방} 안에 업종 폴더가 없습니다. 폴더를 만들고 사진을 넣으세요.`);
  process.exit(1);
}

let 만든장 = 0;
const 채울것: string[] = [];

for (const 업종 of 업종들) {
  const 업종방 = 원본어디(업종);
  const 사진들 = readdirSync(업종방)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();
  if (!사진들.length) { console.log(`  ${업종} — 사진이 없습니다`); continue; }

  const 낼방 = join(낼방뿌리, 업종);
  mkdirSync(낼방, { recursive: true });

  for (const f of 사진들) {
    const 원본 = join(업종방, f);
    /* 먼저 줄이고 나서 워터마크를 얹는다. 순서를 바꾸면 워터마크까지 같이 줄어들어
       작은 사진에서는 글자가 뭉개진다. */
    const 줄인것 = await sharp(원본)
      .rotate()                                   // 폰 사진의 방향 정보를 실제로 반영
      .resize({ width: 긴변, height: 긴변, fit: "inside", withoutEnlargement: true })
      .toBuffer();
    const { width = 긴변, height = 긴변 } = await sharp(줄인것).metadata();

    const 낼이름 = `${basename(f, extname(f))}.webp`;
    await sharp(줄인것)
      .composite([{ input: 워터마크SVG(width, height), top: 0, left: 0 }])
      .webp({ quality: 76 })
      .toFile(join(낼방, 낼이름));
    만든장 += 1;
  }

  const { 길, 빈것 } = 출처챙기기(출처방, 사진들, 업종);
  console.log(`  ${업종.padEnd(10)} ${사진들.length}장 → ${낼방}`);
  if (빈것.length) 채울것.push(`${길} — ${빈것.length}줄`);

  /* ⛔ 원본을 지운다 (2026-09-10 현님 결정). 굽힌 것을 «세어 보고» 지운다 —
     한 장이라도 안 나왔으면 원본을 남긴다. 지우고 나면 되돌릴 길이 없다. */
  if (!원본둠) {
    const 나온것 = new Set(readdirSync(낼방).filter((f) => f.endsWith(".webp")).map((f) => f.replace(/\.webp$/, "")));
    const 빠진것 = 사진들.filter((f) => !나온것.has(basename(f, extname(f))));
    if (빠진것.length) {
      console.log(`  ⚠ ${업종} — ${빠진것.length}장이 안 나왔습니다. 원본을 «안 지웁니다»: ${빠진것.slice(0, 3).join(" · ")}`);
    } else {
      rmSync(업종방, { recursive: true, force: true });
      console.log(`     원본 ${사진들.length}장을 지웠습니다 (남기시려면 --원본둠)`);
    }
  }
}

console.log(`\n끝났습니다 — ${만든장}장에 「예시 이미지」를 박았습니다.`);
if (채울것.length) {
  console.log("\n⚠ 출처가 비어 있습니다. 「어디서 받았나」와 주소를 채워 두세요.");
  for (const c of 채울것) console.log(`   ${c}`);
  console.log("   나중에 「이 사진 어디서 났느냐」는 물음에 답할 수 있어야 합니다.");
}
console.log("\n※ 게티(Getty)는 유료입니다. 픽사베이·언스플래시처럼 무료 라이선스가 분명한 것만 쓰세요.");
