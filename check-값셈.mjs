/* 구운 화면이 «제 입으로 한 셈»을 지키나.
 *
 * 인테리어에서 나온 꼴: 「평당 210만원」과 「32평 … 32,400,000원」이 한 화면에 있었다.
 * 210만 × 32 = 6억 7천. 사람이 눈으로 보고서야 알았다.
 *
 * ⚠ 한 화면 «안»에서만 본다. 화면을 넘나들면 뜻이 갈리기 쉽다.
 * ⚠ 이 검사는 반드시 «아는 흠»으로 먼저 시험한다 — 0건이 거짓 통과이기 쉽다.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const 방 = process.argv[2] || "판매용_템플릿/_판매팩";
const 단위들 = "평|일|박|인|시간|건|회|명";

const 글만 = (h) => h
  .replace(/<script[\s\S]*?<\/script>/g, " ")
  .replace(/<style[\s\S]*?<\/style>/g, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
  .replace(/\s+/g, " ");

const 숫 = (s) => Number(String(s).replace(/[^0-9]/g, ""));
const 원 = (n) => n.toLocaleString("ko-KR") + "원";

/* 「210만원/평」 · 「평당 210만원」 둘 다. 「만」이 있고 없고를 반드시 따진다 —
   안 따지면 「12,000원/일」이 1억 2천이 된다. */
const 단가꼴 = new RegExp(
  `([0-9][0-9,]*)\\s*(만)?\\s*원\\s*\\/\\s*(${단위들})` +
  `|(${단위들})\\s*당\\s*([0-9][0-9,]*)\\s*(만)?\\s*원`, "g");

/* 「32평 … 32,400,000원」 — 수량과 총액이 한 문장 안에 있는 자리.
   ⚠ 한글 뒤에는 \b 가 안 걸린다. 그래서 경계 대신 «다음 글자»로 막는다. */
const 총액꼴 = new RegExp(
  `([0-9][0-9,]*)\\s*(${단위들})(?![가-힣0-9])[^.。]{0,60}?([0-9][0-9,]{2,})\\s*(만)?\\s*원`, "g");

const 흠들 = [];
for (const 팩 of readdirSync(방)) {
  const pages = join(방, 팩, "완성화면/pages");
  if (!existsSync(pages)) continue;
  for (const f of readdirSync(pages).filter((x) => x.endsWith(".html"))) {
    const 글 = 글만(readFileSync(join(pages, f), "utf8"));

    const 단가들 = [];
    for (const m of 글.matchAll(단가꼴)) {
      const 단위 = m[3] || m[4];
      const 값 = m[1] ? 숫(m[1]) * (m[2] ? 10000 : 1) : 숫(m[5]) * (m[6] ? 10000 : 1);
      if (값 > 0) 단가들.push({ 단위, 값, 말: m[0].trim() });
    }
    if (!단가들.length) continue;

    const 본것 = new Set();
    for (const t of 글.matchAll(총액꼴)) {
      const 수량 = 숫(t[1]), 단위 = t[2];
      const 총 = 숫(t[3]) * (t[4] ? 10000 : 1);
      if (!(수량 > 0) || !(총 > 300000)) continue;   /* 잔돈은 안 본다 */
      for (const d of 단가들) {
        if (d.단위 !== 단위) continue;
        const 셈 = d.값 * 수량;
        const 배 = 셈 / 총;
        /* ⚠ «총액보다 작은» 단가는 헛짚기 쉽다 — 폐기물 처리비처럼 «덤으로 붙는 것»이
           그렇다(평당 3만원). 총액을 넘어서는 것만 말한다. 그건 덤일 수가 없다. */
        if (배 <= 1.6) continue;
        const 열쇠 = `${f}|${d.말}|${수량}|${총}`;
        if (본것.has(열쇠)) continue;
        본것.add(열쇠);
        흠들.push({
          팩, 화면: f,
          무엇: `「${d.말}」 × ${수량}${단위} = ${원(셈)} 인데 같은 화면이 ${원(총)} 이라고 합니다 (${배.toFixed(1)}배)`,
          글: t[0].trim().replace(/\s+/g, " ").slice(0, 70),
        });
      }
    }
  }
}

console.log("\n화면이 «제 입으로 한 셈»을 지키나 — 한 화면 안에서만 봅니다\n");
if (!흠들.length) {
  console.log("  ✓ 어긋나는 데가 없습니다.\n");
  process.exit(0);
}
const 묶음 = {};
for (const i of 흠들) (묶음[i.팩] ||= []).push(i);
for (const [팩, 목록] of Object.entries(묶음)) {
  console.log(`  ❌ ${팩} — ${목록.length}건`);
  for (const i of 목록.slice(0, 8)) {
    console.log(`       ${i.화면}  ${i.무엇}`);
    console.log(`         «${i.글}»`);
  }
  if (목록.length > 8) console.log(`       … 외 ${목록.length - 8}건`);
}
console.log(`\n어긋난 셈 ${흠들.length}건.\n`);
process.exit(1);
