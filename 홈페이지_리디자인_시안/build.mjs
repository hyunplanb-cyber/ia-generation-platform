// 페이퍼로지 woff2를 base64 data URI로 심어 자족(self-contained) HTML을 만든다.
// (아티팩트 CSP가 외부 폰트를 막으므로 인라인 필수)
import { readFileSync, writeFileSync } from "node:fs";

const DIR = process.argv[2];
const b64 = (name) => {
  const buf = readFileSync(`${DIR}/fonts/${name}.woff2`);
  return `data:font/woff2;base64,${buf.toString("base64")}`;
};

let html = readFileSync(`${DIR}/template.html`, "utf8");
html = html
  .replace("__FONT_400__", b64("Paperlogy-4Regular"))
  .replace("__FONT_600__", b64("Paperlogy-6SemiBold"))
  .replace("__FONT_700__", b64("Paperlogy-7Bold"))
  .replace("__FONT_800__", b64("Paperlogy-8ExtraBold"));

const out = `${DIR}/main.html`;
writeFileSync(out, html, "utf8");
console.log(`완성 → ${out} (${Math.round(html.length / 1024)}KB)`);
