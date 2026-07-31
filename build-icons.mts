// 앱 아이콘 생성기 — 브랜드 마크(주황 원점)를 파비콘·애플 터치 아이콘으로 굽는다.
//
// 색이 바뀌면 아래 MARK/PAPER만 고치고 다시 돌린다. 손으로 만든 이진 파일을 남기지 않는다.
//   npx tsx build-icons.mts
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

/** globals.css의 primary — 헤더 로고 원점과 같은 색 */
const MARK = "#E4762C";
/** 레트로모던 종이색. iOS는 투명을 검게 채우므로 배경을 꼭 깔아야 한다. */
const PAPER = "#F4ECD8";

/* ── 1) favicon.ico — app/icon.svg를 그대로 굽는다 ───────────────── */
const FAVICON_SIZE = 32;
const faviconPng = await sharp(readFileSync("app/icon.svg"))
  .resize(FAVICON_SIZE, FAVICON_SIZE)
  .png()
  .toBuffer();

// ICO 컨테이너: 헤더(6) + 디렉터리(16) + PNG 원본.
// PNG를 그대로 품는 형식은 Vista 이후 모든 브라우저가 읽는다.
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: 1 = icon
header.writeUInt16LE(1, 4); // 이미지 개수

const dir = Buffer.alloc(16);
dir.writeUInt8(FAVICON_SIZE, 0); // width (256이면 0)
dir.writeUInt8(FAVICON_SIZE, 1); // height
dir.writeUInt8(0, 2); // 팔레트 없음
dir.writeUInt8(0, 3); // reserved
dir.writeUInt16LE(1, 4); // color planes
dir.writeUInt16LE(32, 6); // bits per pixel
dir.writeUInt32LE(faviconPng.length, 8);
dir.writeUInt32LE(header.length + dir.length, 12);

writeFileSync("app/favicon.ico", Buffer.concat([header, dir, faviconPng]));
console.log(`app/favicon.ico — ${FAVICON_SIZE}x${FAVICON_SIZE}, ${(faviconPng.length / 1024).toFixed(1)}KB`);

/* ── 2) apple-icon.png — 홈 화면용 ──────────────────────────────────
   파비콘과 달리 배경을 깐다:
   - iOS는 투명 픽셀을 검게 칠한다
   - 모서리는 iOS가 알아서 둥글리므로 여기서 깎지 않는다(깎으면 이중으로 잘린다)
   원은 꽉 채우지 않고 여백을 둬야 둥근 마스크에 잘리지 않고 안정적으로 보인다. */
const APPLE_SIZE = 180;
const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${APPLE_SIZE}" height="${APPLE_SIZE}" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="${PAPER}"/>
  <circle cx="90" cy="90" r="52" fill="${MARK}"/>
</svg>`;

const applePng = await sharp(Buffer.from(appleSvg))
  .png()
  .flatten({ background: PAPER }) // 투명 픽셀 제거 — iOS 검은 배경 방지
  .toBuffer();

writeFileSync("app/apple-icon.png", applePng);
console.log(`app/apple-icon.png — ${APPLE_SIZE}x${APPLE_SIZE}, ${(applePng.length / 1024).toFixed(1)}KB`);
