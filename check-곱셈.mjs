/* 「(A × B × C) D원」처럼 화면이 «곱셈을 적어 놓은» 자리를 실제로 곱해 본다.
 * 사람이 손으로 적은 곱셈은 조건이 바뀔 때 한쪽만 고쳐지기 쉽다. */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const 방 = process.argv[2] || "판매용_템플릿/_판매팩";
const 글만 = (h) => h.replace(/<script[\s\S]*?<\/script>/g, " ")
  .replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
const 숫 = (s) => Number(String(s).replace(/[^0-9]/g, ""));

/* (46,300 × 3일 × 2개) 277,800원 */
const 꼴 = /\(([0-9][0-9,]{2,})\s*(?:원)?\s*[×x]\s*([0-9]+)\s*[가-힣]{0,2}(?:\s*[×x]\s*([0-9]+)\s*[가-힣]{0,2})?\s*\)\s*([0-9][0-9,]{2,})\s*원/g;

const 흠들 = []; let 잰것 = 0;
for (const 팩 of readdirSync(방)) {
  const pages = join(방, 팩, "완성화면/pages");
  if (!existsSync(pages)) continue;
  for (const f of readdirSync(pages).filter((x) => x.endsWith(".html"))) {
    const 글 = 글만(readFileSync(join(pages, f), "utf8"));
    for (const m of 글.matchAll(꼴)) {
      const 단가 = 숫(m[1]), a = Number(m[2]), b = m[3] ? Number(m[3]) : 1;
      const 적힌것 = 숫(m[4]);
      const 셈 = 단가 * a * b;
      잰것++;
      if (셈 !== 적힌것) {
        흠들.push({ 팩, 화면: f, 말: m[0].replace(/\s+/g, " ").trim(),
          무엇: `${단가.toLocaleString()} × ${a}${b > 1 ? " × " + b : ""} = ${셈.toLocaleString()} 인데 ${적힌것.toLocaleString()} 이라고 적혀 있습니다` });
      }
    }
  }
}
console.log(`\n화면에 적힌 곱셈이 맞나 — 잰 자리 ${잰것}곳\n`);
if (!흠들.length) { console.log("  ✓ 다 맞습니다.\n"); process.exit(0); }
for (const i of 흠들) {
  console.log(`  ❌ ${i.팩} ${i.화면}`);
  console.log(`       ${i.무엇}`);
  console.log(`       «${i.말.slice(0, 80)}»`);
}
console.log(`\n틀린 곱셈 ${흠들.length}건.\n`);
process.exit(1);
