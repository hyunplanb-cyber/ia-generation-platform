/* 화면 위쪽의 «총액»과 아래 표의 «합계»가 같은 말을 하나.
 *
 * ⛔ 2026-09-03 — 인테리어 디럭스 ES-02 에 「32,400,000원 ~ 39,800,000원」과
 *   「합계 32,500,000원」이 한 화면에 나란히 떠 있었다. 표는 저희끼리 맞아서
 *   표만 보는 검사로는 못 잡는다. 프리미엄은 굽을 때 이 둘이 다르면 멈춘다.
 *
 * ⚠ «범위의 아래끝»과 견준다 — 위끝은 실측 뒤 폭이라 달라도 맞다.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const 방 = process.argv[2] || "판매용_템플릿/_판매팩";
const 숫 = (s) => { const t = String(s).replace(/[^0-9]/g, ""); return t ? Number(t) : null; };
const 셀 = (s) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

const 흠들 = []; let 잰것 = 0;
for (const 팩 of readdirSync(방)) {
  const pages = join(방, 팩, "완성화면/pages");
  if (!existsSync(pages)) continue;
  for (const f of readdirSync(pages).filter((x) => x.endsWith(".html"))) {
    const 원본 = readFileSync(join(pages, f), "utf8");
    const 글 = 셀(원본);

    /* 화면 위쪽의 「A원 ~ B원」 — 가장 큰 것 하나 */
    let 범위 = null;
    for (const m of 글.matchAll(/([0-9][0-9,]{6,})\s*원\s*[~〜]\s*([0-9][0-9,]{6,})\s*원/g)) {
      const a = 숫(m[1]), b = 숫(m[2]);
      if (a && b && b >= a && (!범위 || a > 범위.a)) 범위 = { a, b, 말: m[0] };
    }
    if (!범위) continue;

    /* 표의 「합계」 금액 */
    let 합계 = null;
    for (const 표 of 원본.matchAll(/<table[\s\S]*?<\/table>/g)) {
      for (const 줄 of 표[0].matchAll(/<tr[\s\S]*?<\/tr>/g)) {
        const t = 셀(줄[0]);
        if (!/합계|총계/.test(t)) continue;
        const 값 = [...t.matchAll(/([0-9][0-9,]{6,})\s*원/g)].map((x) => 숫(x[1])).filter(Boolean).pop();
        if (값) 합계 = 값;
      }
    }
    if (!합계) continue;

    잰것++;
    if (합계 !== 범위.a) {
      흠들.push({ 팩, 화면: f,
        무엇: `위쪽 총액은 ${범위.a.toLocaleString()}원부터인데 아래 표 합계는 ${합계.toLocaleString()}원 (${(합계 - 범위.a).toLocaleString()}원 차이)`,
        말: 범위.말 });
    }
  }
}

console.log(`\n위쪽 «총액»과 아래 표 «합계»가 같은 말을 하나 — 잰 화면 ${잰것}장\n`);
if (!흠들.length) { console.log("  ✓ 다 맞습니다.\n"); process.exit(0); }
for (const i of 흠들) console.log(`  ❌ ${i.팩} ${i.화면}\n       ${i.무엇}\n       «${i.말}»`);
console.log(`\n어긋난 것 ${흠들.length}건.\n`);
process.exit(1);
