/* 검수 회차끼리 «서로 도는 줄 아는» 표시.   (2026-09-07)
 *
 *   npx tsx 회차-표시.mts 시작 pack-qa-spec-a
 *   npx tsx 회차-표시.mts 끝   pack-qa-spec-a
 *   npx tsx 회차-표시.mts 누가도나            ← 도는 것이 있으면 1 로 끝난다
 *   npx tsx 회차-표시.mts 분배표 pack-qa-spec-a [최대분]   ← 기다렸다가 «내 몫»을 찍는다
 *
 * ⛔ 왜 생겼나 — 2026-09-06 회차에서 두 가지가 한꺼번에 터졌다.
 *
 *   ① 마무리는 「CSV 가 있으면 그 루틴은 끝났다」로 봤다. 그런데 CSV 는 «도중에도» 써진다.
 *      실측: 마무리가 09:03:55 에 락을 걸고 굽기 시작 → spec-a 는 09:21:42 에야 CSV 를 마감했다.
 *      그 18분 사이 spec-a 가 굽는 중인 팩을 고쳤다(여행_디럭스 09:06:58 · 공동구매_프리미엄 09:09:09).
 *      **락은 「락보다 먼저 출발한 루틴」을 못 막는다.** 그래서 «도는 중» 표시를 따로 둔다.
 *
 *   ② 워커가 분배표보다 먼저 출발했다.
 *      실측: 분배표 01:20:01 · pack-qa-new 의 CSV 01:06:33 — **14분 먼저 끝났다.**
 *      제 몫을 알 길이 없는 채로 돌았다는 뜻이다. 두 주 연속이었고, 이번 주는 몫이 바뀌는 주라
 *      spec-b 가 사람처럼 눈치껏 알아채서 겨우 넘어갔다.
 *      그래서 «분배표를 기다리고, 없으면 멈춘다». 지난주 몫을 흉내 내지 않는다.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const 뿌리 = process.cwd();
const 도는중방 = path.join(뿌리, "검수", "_도는중");

/** 낡은 표시 — 이만큼 지나면 «죽은 회차»로 본다. 그래도 지우지는 않고 알린다. */
const 낡음시간 = 12 * 60;   // 분

const 오늘 = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const 지금 = () => new Date().toISOString();
const 분차이 = (a: string) => Math.round((Date.now() - new Date(a).getTime()) / 60000);

type 표시 = { 루틴: string; 시작: string; 몫?: string[] };

function 읽기(): (표시 & { 몇분: number; 낡음: boolean })[] {
  if (!existsSync(도는중방)) return [];
  return readdirSync(도는중방)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const j = JSON.parse(readFileSync(path.join(도는중방, f), "utf8")) as 표시;
      const 몇분 = 분차이(j.시작);
      return { ...j, 몇분, 낡음: 몇분 > 낡음시간 };
    })
    .sort((a, b) => b.몇분 - a.몇분);
}

/* ── 시작 · 끝 ────────────────────────────────────────────────────────────── */

function 시작(루틴: string) {
  mkdirSync(도는중방, { recursive: true });
  const 표 = path.join(뿌리, "검수", `${오늘()}_분배.json`);
  let 몫: string[] | undefined;
  try { 몫 = JSON.parse(readFileSync(표, "utf8"))?.몫?.[루틴]; } catch { /* 아직 없을 수 있다 */ }
  writeFileSync(path.join(도는중방, `${루틴}.json`),
    JSON.stringify({ 루틴, 시작: 지금(), 몫 } satisfies 표시, null, 1), "utf8");
  console.log(`  ● ${루틴} — «도는 중» 표시를 걸었습니다${몫 ? `  (몫 ${몫.join(" · ")})` : ""}`);
  console.log(`     ⛔ 끝날 때 반드시 지우세요:  npx tsx 회차-표시.mts 끝 ${루틴}`);
}

function 끝(루틴: string) {
  const f = path.join(도는중방, `${루틴}.json`);
  if (!existsSync(f)) { console.log(`  ○ ${루틴} — 걸린 표시가 없습니다 (이미 지웠거나 안 걸었습니다)`); return; }
  const 몇분 = 분차이((JSON.parse(readFileSync(f, "utf8")) as 표시).시작);
  rmSync(f, { force: true });
  console.log(`  ○ ${루틴} — 표시를 지웠습니다 (${몇분}분 돌았습니다)`);
}

/* ── 누가 도나 ────────────────────────────────────────────────────────────── */

function 누가도나(json: boolean) {
  const 것들 = 읽기();
  if (json) { console.log(JSON.stringify({ 도는중: 것들 }, null, 1)); process.exit(것들.length ? 1 : 0); }

  if (!것들.length) { console.log("\n  ✓ 도는 검수 회차가 없습니다. 구우셔도 됩니다.\n"); process.exit(0); }

  console.log(`\n  ⛔ 아직 도는 회차가 ${것들.length}개 있습니다.\n`);
  for (const g of 것들) {
    console.log(`     ${g.루틴.padEnd(20)} ${String(g.몇분).padStart(4)}분째${g.낡음 ? "  ⚠ 낡음(죽었을 수 있습니다)" : ""}`);
    if (g.몫?.length) console.log(`     ${" ".repeat(20)} 몫: ${g.몫.join(" · ")}`);
  }
  console.log(`
  ⛔ 이 루틴들의 «몫 업종»은 굽지 마세요. 굽는 도중에 그쪽이 파일을 고치면
     반쪽만 고쳐진 zip 이 손님에게 나갑니다 (2026-09-06 에 실제로 그럴 뻔했습니다).

     ① 기다릴 수 있으면 기다렸다가 다시 재세요
     ② 못 기다리면 «그 몫 업종만» 빼고 구우세요. 뺀 것을 보고에 반드시 적으세요
     ⚠ «낡음» 은 죽은 회차일 수 있습니다. 그래도 함부로 굽지 말고, 표시를 지운 뒤 굽고
        그 사실을 보고에 적으세요:  npx tsx 회차-표시.mts 끝 <루틴이름>
`);
  process.exit(1);
}

/* ── 분배표 기다리기 ──────────────────────────────────────────────────────── */

async function 분배표(루틴: string, 최대분: number) {
  const 표 = path.join(뿌리, "검수", `${오늘()}_분배.json`);
  const 끝날때 = Date.now() + 최대분 * 60000;
  let 알림 = false;

  while (true) {
    if (existsSync(표)) {
      const j = JSON.parse(readFileSync(표, "utf8"));
      const 몫 = j?.몫?.[루틴];
      if (몫 === undefined) {
        console.error(`\n⛔ 분배표에 «${루틴}» 칸이 없습니다: ${표}`);
        console.error(`   있는 칸: ${Object.keys(j?.몫 ?? {}).join(" · ") || "(없음)"}`);
        console.error(`   지난주 몫을 흉내 내지 마세요 — 몫은 주마다 바뀝니다.\n`);
        process.exit(1);
      }
      console.log(`  ✓ 분배표를 찾았습니다 (${path.basename(표)})`);
      console.log(`    ${루틴} 의 몫: ${몫.length ? 몫.join(" · ") : "(없음 — 업종 몫이 비었습니다)"}`);
      return;
    }
    if (Date.now() > 끝날때) {
      console.error(`\n⛔ 분배표가 ${최대분}분을 기다려도 안 나왔습니다: ${표}`);
      console.error(`   pack-qa-dispatch 가 늦거나 실패한 것입니다.`);
      console.error(`
   ⛔ 여기서 «멈추세요». 지난주 몫을 흉내 내면 안 됩니다 —
      2026-09-07 회차처럼 몫이 바뀌는 주에는 넉 벌을 아무도 안 보거나 둘이 같이 만집니다.
      보고에 「분배표가 없어 돌지 못했다」고 적고 끝내세요.\n`);
      process.exit(1);
    }
    if (!알림) { console.log(`  … 분배표를 기다립니다 (최대 ${최대분}분) — ${path.basename(표)}`); 알림 = true; }
    await new Promise((r) => setTimeout(r, 20000));
  }
}

/* ── 들머리 ──────────────────────────────────────────────────────────────── */

const [, , 무엇, 인자1, 인자2] = process.argv;

if (무엇 === "시작" && 인자1) 시작(인자1);
else if (무엇 === "끝" && 인자1) 끝(인자1);
else if (무엇 === "누가도나") 누가도나(process.argv.includes("--json"));
else if (무엇 === "분배표" && 인자1) await 분배표(인자1, Number(인자2) || 30);
else {
  console.error(`쓰는 법:
  npx tsx 회차-표시.mts 시작 <루틴이름>
  npx tsx 회차-표시.mts 끝   <루틴이름>
  npx tsx 회차-표시.mts 누가도나 [--json]        ← 도는 것이 있으면 1 로 끝난다
  npx tsx 회차-표시.mts 분배표 <루틴이름> [최대분]  ← 기다렸다가 내 몫을 찍는다 (기본 30분)`);
  process.exit(2);
}
