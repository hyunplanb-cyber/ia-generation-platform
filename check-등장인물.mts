/* 문서·코드가 캐릭터를 옛 이름으로 부르고 있지 않나. (2026-09-02)
 *
 * 왜 있나 — 마스코트가 바뀌고 그림 폴더를 옮길 때마다, 사장님이 문서를 한 줄씩
 *   찾아 「이것도 고쳐 달라」고 말씀하셔야 했다. 누가 누구인지 적어 둔 곳이
 *   한 군데도 없어서다. 2026-09-02 에 그 값을 치렀다 — 나는 지운 루틴 문서의
 *   한 줄만 읽고 «대표_장면 21장이 긴머리 마스코트»라고 단정했는데, 그림을 열어
 *   보니 검은 긴 머리를 한 «고양이»였다. 이름만 보고 두 번 틀렸다.
 *
 * ⛔ 옛말 목록을 여기에 적지 않는다. `등장인물.md` 의 「안 쓰는 말」 표에서 읽는다.
 *   말이 바뀌면 그 표에 줄 하나를 더하면 되고, 이 파일은 안 건드린다.
 *   검사기에 적어 두면 «문서 따로 검사기 따로»가 되어 또 어긋난다.
 *
 * 두 가지를 잰다
 *   ① 「안 쓰는 말」 표의 옛말이 아직 남아 있나
 *   ② 문서·코드가 부르는 `_이미지/…` 자리가 실제로 있나
 *
 *   npx tsx check-등장인물.mts            # 다 재고 어긋나면 1 로 끝난다
 *   npx tsx check-등장인물.mts --자리만    # ② 만 잰다
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const 뿌리 = process.cwd();
const 원본길 = "등장인물.md";
const 자리만 = process.argv.includes("--자리만");

/* 옛말을 «설명하는» 줄은 옛말을 담을 수밖에 없다 — 「왜 안 쓰나」를 적은 줄이 그렇다.
   그 줄 끝에 이 표를 달아 두면 넘긴다. 표가 없으면 다 짚는다(2026-09-02). */
const 봐주는표 = "옛말ok";

/* 안 보는 곳 — 옛 기록과 남의 작업 자리. 여기까지 고치라고 하면 검사가 시끄러워진다.
   ⚠ 「_백업」은 어느 층에 있든 안 본다. 맨 위만 걸렀더니
   판매용_템플릿/_마케팅/_백업 이 그대로 잡혔다(2026-09-02). */
const 안봄방 = ["node_modules", ".git", ".next", "_백업", "worktrees", "_bmad", "_bmad-output"];
const 안봄 = ["판매용_템플릿/_판매팩", "packs", "샘플", "docs"];
const 보는꼬리 = [".md", ".mts", ".mjs", ".ts", ".tsx", ".json"];

function 파일들(곳: string, 모은것: string[] = []): string[] {
  for (const 이름 of readdirSync(곳)) {
    const 길 = join(곳, 이름);
    const 상대 = relative(뿌리, 길).replace(/\\/g, "/");
    if (안봄방.includes(이름)) continue;
    if (안봄.some((x) => 상대 === x || 상대.startsWith(x + "/"))) continue;
    let s;
    try { s = statSync(길); } catch { continue; }
    if (s.isDirectory()) 파일들(길, 모은것);
    else if (보는꼬리.some((k) => 이름.endsWith(k))) 모은것.push(상대);
  }
  return 모은것;
}

/* ── 「안 쓰는 말」 표를 읽는다 ─────────────────────────────
   | `옛말` | 왜 틀렸나 | 대신 |  꼴의 줄만 가져온다. */
function 옛말읽기(): { 말: string; 대신: string }[] {
  const 글 = readFileSync(원본길, "utf8");
  const 자리 = 글.indexOf("## ⛔ 안 쓰는 말");
  if (자리 < 0) {
    console.error(`⛔ ${원본길} 에 「안 쓰는 말」 절이 없습니다. 그 표가 이 검사기의 원본입니다.`);
    process.exit(1);
  }
  const 절 = 글.slice(자리).split(/\n---/)[0];
  const 나온것: { 말: string; 대신: string }[] = [];
  for (const 줄 of 절.split(/\r?\n/)) {
    const m = /^\|\s*`([^`]+)`\s*\|([^|]*)\|([^|]*)\|/.exec(줄.trim());
    if (m) 나온것.push({ 말: m[1].trim(), 대신: m[3].trim() });
  }
  return 나온것;
}

/* ── ② 가 볼 «자리» — 글 속에서 _이미지/… 로 시작하는 길을 뽑는다 ── */
const 자리찾기 = /(?:판매용_템플릿\/)?_이미지\/[가-힣A-Za-z0-9_./-]*[가-힣A-Za-z0-9_]/g;

const 파일 = 파일들(뿌리).filter((f) => f !== 원본길);
let 흠 = 0;

if (!자리만) {
  const 옛말 = 옛말읽기();
  console.log(`\n① 안 쓰는 말이 남아 있나 — ${원본길} 에서 ${옛말.length}가지를 읽었습니다\n`);
  for (const { 말, 대신 } of 옛말) {
    const 걸린것: string[] = [];
    for (const f of 파일) {
      const 줄 = readFileSync(join(뿌리, f), "utf8").split(/\r?\n/);
      /* 「가 + 나」 꼴은 한 줄에 둘 다 있을 때만 짚는다. 낱말 하나로는 못 잡는 것이 있다 —
         「마스코트/낱장 의 삼색 고양이」처럼 낱말은 저마다 멀쩡한데 «붙으면» 틀린 말이다. 옛말ok */
      const 조각 = 말.split(" + ").map((x) => x.trim());
      줄.forEach((l, i) => {
        if (조각.every((x) => l.includes(x)) && !l.includes(봐주는표)) 걸린것.push(`${f}:${i + 1}`);
      });
    }
    if (!걸린것.length) { console.log(`  ✓ ${말}`); continue; }
    흠 += 걸린것.length;
    console.log(`  ⛔ ${말} — ${걸린것.length}곳`);
    console.log(`     대신: ${대신}`);
    for (const c of 걸린것.slice(0, 12)) console.log(`       ${c}`);
    if (걸린것.length > 12) console.log(`       … ${걸린것.length - 12}곳 더`);
  }
}

console.log(`\n② 부르는 «자리»가 실제로 있나 — 파일 ${파일.length}개를 봅니다\n`);
const 죽은자리 = new Map<string, string[]>();
for (const f of 파일) {
  const 줄 = readFileSync(join(뿌리, f), "utf8").split(/\r?\n/);
  줄.forEach((l, i) => {
    for (const m of l.matchAll(자리찾기)) {
      const 찾은것 = m[0];
      /* 바로 뒤가 별표면 「무엇이든」이라 있는지 없는지 물을 수 없다. */
      if (l[(m.index ?? 0) + 찾은것.length] === "*") continue;
      const 길 = 찾은것.startsWith("판매용_템플릿/") ? 찾은것 : `판매용_템플릿/${찾은것}`;
      /* 별표가 든 것은 «무엇이든» 이라는 뜻이라 있는지 없는지 물을 수 없다. */
      if (길.includes("*")) continue;
      /* 파일 이름까지 적힌 것은 그 파일이 없어도 그림 한 장일 뿐이라 넘긴다. 방만 본다. */
      if (/\.(png|jpg|jpeg|webp|csv|md|mp4)$/i.test(길)) continue;
      /* 「전: 옛자리 → 후: 새자리」처럼 «옮긴 자취»를 적어 둔 줄은 넘긴다.
         옛 자리가 없는 것이 당연하고, 그걸 짚으면 자취를 지우게 만든다(2026-09-02). */
      if (l.includes("→")) continue;
      if (existsSync(join(뿌리, 길))) continue;
      const 담을곳 = 죽은자리.get(찾은것) ?? [];
      담을곳.push(`${f}:${i + 1}`);
      죽은자리.set(찾은것, 담을곳);
    }
  });
}
if (!죽은자리.size) console.log("  ✓ 부르는 자리가 모두 있습니다");
for (const [자리, 곳] of [...죽은자리].sort((a, b) => b[1].length - a[1].length)) {
  흠 += 곳.length;
  console.log(`  ⛔ ${자리} — 없는 자리인데 ${곳.length}곳이 부릅니다`);
  for (const c of 곳.slice(0, 12)) console.log(`       ${c}`);
  if (곳.length > 12) console.log(`       … ${곳.length - 12}곳 더`);
}

console.log("\n" + "═".repeat(50));
if (흠) {
  console.log(`  ⛔ ${흠}곳이 어긋납니다. ${원본길} 이 맞고 저기가 틀린 것입니다.`);
  process.exit(1);
}
console.log("  ✓ 문서·코드가 부르는 이름과 자리가 등장인물.md 와 같습니다.");
