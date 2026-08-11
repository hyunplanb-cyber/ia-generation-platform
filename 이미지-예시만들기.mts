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
 * 자리
 *   판매용_템플릿/_이미지/_원본/<업종>/*.jpg|png|webp   ← 여기에 받아 놓는다
 *   판매용_템플릿/_이미지/<업종>/*.webp                 ← 여기로 나온다 (워터마크 박힘)
 *   판매용_템플릿/_이미지/_원본/<업종>/출처.csv          ← 어디서 받았는지
 *
 * 쓰는 법
 *   npx tsx 이미지-예시만들기.mts 뷰티샵
 *   npx tsx 이미지-예시만들기.mts            (원본이 있는 업종 전부)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const 원본방 = "판매용_템플릿/_이미지/_원본";
const 낼방뿌리 = "판매용_템플릿/_이미지";

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
  <!-- 아래 띠 — 여기만 또렷하게. 잘라 내도 위의 무늬가 남는다. -->
  <rect x="0" y="${h - Math.round(글씨 * 2.4)}" width="${w}" height="${Math.round(글씨 * 2.4)}"
        fill="#000000" fill-opacity="0.55"/>
  <text x="${Math.round(글씨 * 0.7)}" y="${h - Math.round(글씨 * 0.75)}"
        font-family="Malgun Gothic, Pretendard, sans-serif" font-size="${Math.round(글씨 * 0.86)}"
        font-weight="700" fill="#ffffff">예시 이미지입니다 · 실제 사진으로 바꿔 넣으세요</text>
</svg>`);
}

/** 출처를 적어 두는 표. 없으면 만들어 준다. */
function 출처챙기기(업종방: string, 파일들: string[]) {
  const 길 = join(업종방, "출처.csv");
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
  const 업종방 = join(원본방, 업종);
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

  const { 길, 빈것 } = 출처챙기기(업종방, 사진들);
  console.log(`  ${업종.padEnd(10)} ${사진들.length}장 → ${낼방}`);
  if (빈것.length) 채울것.push(`${길} — ${빈것.length}줄`);
}

console.log(`\n끝났습니다 — ${만든장}장에 「예시 이미지」를 박았습니다.`);
if (채울것.length) {
  console.log("\n⚠ 출처가 비어 있습니다. 「어디서 받았나」와 주소를 채워 두세요.");
  for (const c of 채울것) console.log(`   ${c}`);
  console.log("   나중에 「이 사진 어디서 났느냐」는 물음에 답할 수 있어야 합니다.");
}
console.log("\n※ 게티(Getty)는 유료입니다. 픽사베이·언스플래시처럼 무료 라이선스가 분명한 것만 쓰세요.");
