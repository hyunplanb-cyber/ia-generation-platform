/* 손님이 «우리 사이트에서 직접 만든» AI팩을 검수한다 — 명령줄 판.
 *
 * 화면으로 넣고 싶으면 이쪽:  npx tsx 검수기-화면.mts
 * 재는 알맹이는 둘 다 `lib/검수-직접팩.mts` 하나를 쓴다.
 *
 * 쓰는 법
 *   npx tsx 검수기-직접팩.mts "C:/Users/.../다운로드/내팩.zip"
 *   npx tsx 검수기-직접팩.mts "C:/Users/.../압축푼폴더"
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import JSZip from "jszip";
import { 검수하기 } from "./lib/검수-직접팩.mjs";

const 준것 = process.argv[2];
if (!준것 || !existsSync(준것)) {
  console.error("쓰는 법: npx tsx 검수기-직접팩.mts <내려받은 zip 또는 압축 푼 폴더>");
  process.exit(1);
}

/** zip 이든 폴더든 「이름 → 내용」으로 펴 놓는다. 그다음은 똑같다. */
export async function 펴기(길: string): Promise<Map<string, Buffer>> {
  const 파일들 = new Map<string, Buffer>();
  if (statSync(길).isDirectory()) {
    const 훑기 = (방: string, 앞: string) => {
      for (const e of readdirSync(방, { withFileTypes: true })) {
        const p = join(방, e.name);
        if (e.isDirectory()) 훑기(p, `${앞}${e.name}/`);
        else 파일들.set(`${앞}${e.name}`, readFileSync(p));
      }
    };
    훑기(길, "");
    return 파일들;
  }
  const z = await JSZip.loadAsync(readFileSync(길));
  for (const [p, f] of Object.entries(z.files)) {
    if (f.dir) continue;
    /* 최상위 폴더 한 겹은 벗겨 낸다 — 있어도 없어도 같게 본다. */
    파일들.set(p.includes("/") ? p.slice(p.indexOf("/") + 1) : p, Buffer.from(await f.async("uint8array")));
  }
  return 파일들;
}

const 파일들 = await 펴기(준것);
if (파일들.size === 0) { console.error("안이 비었습니다."); process.exit(1); }

const 흠들 = await 검수하기(파일들);
const 못한것 = 흠들.filter((i) => i.급 === "FAIL");
const 걸린것 = 흠들.filter((i) => i.급 === "WARN");

console.log(`\n직접 만든 AI팩 검수 — ${basename(준것)}`);
console.log(`  파일 ${파일들.size}개\n`);
for (const i of 못한것) console.log(`  ✗ [${i.항목}] ${i.무엇}`);
for (const i of 걸린것) console.log(`  △ [${i.항목}] ${i.무엇}`);
if (!흠들.length) console.log("  흠 없음.");

console.log(`\n못 넘긴 것 ${못한것.length}건 · 봐줄 만한 것 ${걸린것.length}건`);
console.log("  ※ 여기서 보는 것은 「파일이 성한가」다. 화면이 예쁜가는 완성화면이 있는 팩에서만 잰다.");
if (못한것.length) process.exit(1);
