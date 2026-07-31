// 크몽 상세 HTML을 PNG로 굽는다.
//
// 설치된 크롬을 헤드리스로 띄워 찍는다(별도 브라우저 내려받지 않는다).
// 높이를 미리 알 수 없으므로 아주 긴 창으로 찍고, 아래쪽 여백을 잘라낸 뒤
// 디자인 여백만큼 다시 붙인다.
//
//   npx tsx shot-kmong.mts
import { execFileSync } from "node:child_process";
import { readdirSync, existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const DIR = "판매용_템플릿/_배포/판매_6종/크몽_상세이미지";
const W = 900;
const TALL = 24000; // 어떤 장도 이보다 길지 않다
const PAD = 60; // 잘라낸 뒤 다시 붙일 아래 여백(디자인 여백과 같은 값)

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => existsSync(p));
if (!CHROME) throw new Error("크롬이나 엣지를 못 찾았어요");

/** 아래쪽 단색 여백을 재서 실제 내용이 끝나는 지점을 찾는다. */
async function contentBottom(file: string): Promise<number> {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const px = (x: number, y: number) => {
    const i = (y * width + x) * channels;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const bg = px(2, height - 2); // 맨 아래는 반드시 배경이다
  const same = (y: number) => {
    for (let x = 0; x < width; x += 3) {
      const p = px(x, y);
      if (Math.abs(p[0] - bg[0]) > 3 || Math.abs(p[1] - bg[1]) > 3 || Math.abs(p[2] - bg[2]) > 3)
        return false;
    }
    return true;
  };
  let y = height - 1;
  while (y > 0 && same(y)) y--;
  return y + 1;
}

const files = readdirSync(DIR).filter((f) => f.endsWith(".html")).sort();
console.log(`크롬: ${CHROME}\n`);

for (const f of files) {
  const src = `file:///${resolve(DIR, f).replace(/\\/g, "/")}`;
  const raw = resolve(DIR, f.replace(/\.html$/, "_raw.png"));
  const out = resolve(DIR, f.replace(/\.html$/, ".png"));

  execFileSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=2", // 크몽에서 확대해도 안 뭉개지게 2배로
      `--window-size=${W},${TALL}`,
      `--screenshot=${raw}`,
      src,
    ],
    { stdio: "ignore", timeout: 120_000 },
  );

  const bottom = await contentBottom(raw);
  const meta = await sharp(raw).metadata();
  const scale = (meta.width ?? W) / W; // device-scale-factor 반영
  const h = Math.min(meta.height ?? TALL, bottom + PAD * scale);
  await sharp(raw).extract({ left: 0, top: 0, width: meta.width!, height: Math.round(h) }).png().toFile(out);
  unlinkSync(raw);

  const done = await sharp(out).metadata();
  console.log(`  ✔ ${f.replace(/\.html$/, ".png")} — ${done.width}x${done.height}`);
}
console.log(`\n완료 → ${DIR}`);
