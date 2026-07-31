// 파비콘 생성기 — app/icon.svg(브랜드 주황 원점)를 app/favicon.ico로 굽는다.
//
// icon.svg만 두면 최신 브라우저는 잘 쓰지만, /favicon.ico를 직접 찾는 브라우저·크롤러가
// 아직 많다. 그리고 app/favicon.ico가 있으면 Next가 그걸 우선 링크하므로,
// 기본 아이콘이 남아 있는 한 브랜드 마크가 안 보인다. 그래서 둘 다 맞춰 둔다.
//
// 브랜드 색이 바뀌면 app/icon.svg만 고치고 이 스크립트를 다시 돌리면 된다.
//   npx tsx build-favicon.mts
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const SVG = "app/icon.svg";
const OUT = "app/favicon.ico";
// 탭·북마크에서 쓰이는 대표 크기. 하나만 넣어도 브라우저가 알아서 줄여 쓴다.
const SIZE = 32;

const png = await sharp(readFileSync(SVG)).resize(SIZE, SIZE).png().toBuffer();

// ICO 컨테이너: 헤더(6) + 디렉터리(16) + PNG 원본.
// PNG를 그대로 품는 형식은 Vista 이후 모든 브라우저가 읽는다.
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: 1 = icon
header.writeUInt16LE(1, 4); // 이미지 개수

const dir = Buffer.alloc(16);
dir.writeUInt8(SIZE, 0); // width  (256이면 0)
dir.writeUInt8(SIZE, 1); // height
dir.writeUInt8(0, 2); // 팔레트 없음
dir.writeUInt8(0, 3); // reserved
dir.writeUInt16LE(1, 4); // color planes
dir.writeUInt16LE(32, 6); // bits per pixel
dir.writeUInt32LE(png.length, 8); // 이미지 바이트 수
dir.writeUInt32LE(header.length + dir.length, 12); // 이미지 시작 위치

writeFileSync(OUT, Buffer.concat([header, dir, png]));
console.log(`${OUT} 생성 — ${SIZE}x${SIZE}, ${(png.length / 1024).toFixed(1)}KB`);
