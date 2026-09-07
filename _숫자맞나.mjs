/* 같은 값이 여러 화면에 나올 때 서로 맞는가 —
   2026-08-19 에 같은 강의 진도가 한 곳은 67%, 다른 곳은 40% 로 갈렸던 자리다. */
import { readdirSync, readFileSync } from "node:fs";
const dir = "판매용_템플릿/_만드는중/중고거래_디럭스/완성화면/pages";
const 쪽 = {};
for (const f of readdirSync(dir)) 쪽[f.replace(".html", "")] = readFileSync(`${dir}/${f}`, "utf8");

const 볼것 = [
  ["다이슨 청소기 값 320,000원", /320,000원/, ["HO-01", "SE-02", "SE-04", "SL-01", "SL-05", "BS-01", "SL-03"]],
  ["에어팟 값 178,000원", /178,000원/, ["SE-02", "PA-01", "PA-02", "PA-05", "MY-02", "AD-04"]],
  ["수수료율 3.5%", /3\.5%/, ["HO-03", "PA-01", "SL-01"]],
  ["내 매너 온도 42.5", /42\.5/, ["MY-01", "MY-05"]],
  ["내 동네 역삼동", /역삼동/, ["HO-01", "SE-01", "SE-02", "SL-01"]],
];
let 흠 = 0;
console.log("\n같은 값이 화면끼리 맞는가\n");
for (const [이름, 그물, 있어야할곳] of 볼것) {
  const 없는곳 = 있어야할곳.filter((p) => 쪽[p] && !그물.test(쪽[p]));
  console.log(`  ${없는곳.length ? "⛔" : "✓"} ${이름} — ${있어야할곳.length}장 중 ${있어야할곳.length - 없는곳.length}장에 있음` +
    (없는곳.length ? ` (없는 곳: ${없는곳.join(", ")})` : ""));
  if (없는곳.length) 흠++;
}

/* 수수료 셈 — 화면에 적힌 세 숫자가 실제로 아귀가 맞는가 */
const 콤마 = (s) => Number(String(s).replace(/,/g, ""));
console.log("\n수수료 셈이 아귀가 맞는가 (물건 값 − 수수료 = 받는 돈)\n");
for (const [p, h] of Object.entries(쪽)) {
  for (const m of h.matchAll(/물건 값<\/span><span>([\d,]+)원<\/span>[\s\S]{0,400}?수수료[^<]*<\/span><span>− ([\d,]+)원<\/span>[\s\S]{0,400}?<span class="price">([\d,]+)원<\/span>/g)) {
    const [값, 수수료, 받는돈] = [콤마(m[1]), 콤마(m[2]), 콤마(m[3])];
    const 맞나 = 값 - 수수료 === 받는돈;
    const 율맞나 = Math.round(값 * 0.035) === 수수료;
    console.log(`  ${맞나 && 율맞나 ? "✓" : "⛔"} ${p} — ${m[1]} − ${m[2]} = ${m[3]}` +
      (맞나 ? "" : ` (실제 ${(값 - 수수료).toLocaleString()})`) + (율맞나 ? "" : " · 3.5% 가 아님"));
    if (!맞나 || !율맞나) 흠++;
  }
}

/* 표 합계 — 표 아래 합계 줄이 위 줄들의 합과 같은가 */
console.log("\n표 합계가 줄의 합과 같은가\n");
for (const [p, h] of Object.entries(쪽)) {
  for (const t of h.matchAll(/<tbody[^>]*>([\s\S]*?)<\/tbody>\s*<tfoot><tr>([\s\S]*?)<\/tr><\/tfoot>/g)) {
    const 줄들 = [...t[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((r) =>
      [...r[1].matchAll(/<td>([\s\S]*?)<\/td>/g)].map((c) => c[1]));
    const 발 = [...t[2].matchAll(/<td>([\s\S]*?)<\/td>/g)].map((c) => c[1]);
    for (let i = 0; i < 발.length; i++) {
      const 발숫자 = (발[i].match(/([\d,]{4,})원/) || [])[1];
      if (!발숫자) continue;
      const 합 = 줄들.reduce((a, r) => {
        /* 취소선(<s>)이 그어진 값은 «안 나간 돈»이다 — 합계에 안 넣는 것이 맞다 */
        const 칸 = (r[i] || "").replace(/<s>[\s\S]*?<\/s>/g, "");
        const m = 칸.match(/([\d,]{3,})원/);
        return a + (m ? 콤마(m[1]) : 0);
      }, 0);
      const 맞나 = 합 === 콤마(발숫자);
      console.log(`  ${맞나 ? "✓" : "⛔"} ${p} ${i}번째 칸 — 합계 ${발숫자} · 줄의 합 ${합.toLocaleString()}`);
      if (!맞나) 흠++;
    }
  }
}
console.log(흠 === 0 ? "\n✓ 화면끼리 안 맞는 숫자 0건\n" : `\n⛔ 어긋난 것 ${흠}건\n`);
process.exit(흠 === 0 ? 0 : 1);
