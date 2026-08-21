/**
 * 루틴(예약 작업) 백업 — `~/.claude/scheduled-tasks/` ↔ 이 저장소의 `루틴/`
 *
 * ⚠ 루틴 파일은 저장소 «밖»에 산다. git 에 안 올라가니 새 컴퓨터로 옮기면 따라오지 않는다.
 *   2026-08-21 사장님 지시로 저장소에 사본을 두기로 했다.
 *
 * ⛔ 말없이 갈라지는 백업은 없느니만 못하다. 그래서 «아무것도 안 하고 재기»가 기본이다.
 *   어긋나 있으면 어디가 어떻게 다른지 보여 주고 1 로 끝난다 — 루틴이 이걸 부른다.
 *
 *   npx tsx 루틴-백업.mts              # 재기만 한다 (기본) — 다르면 1 로 끝난다
 *   npx tsx 루틴-백업.mts --저장        # 살아 있는 루틴 → 저장소   (평소 백업)
 *   npx tsx 루틴-백업.mts --되돌리기    # 저장소 → 살아 있는 루틴   (새 컴퓨터에서 복구)
 *
 * 시각(cron)은 SKILL.md 에 없다. 등록 정보는 `루틴/_시각표.json` 에 따로 적어 둔다 —
 * 그것까지 있어야 «복구»가 된다. 그 파일은 손으로 못 만든다:
 *   Claude 에게 「예약 작업 목록을 보여 줘」 하고 나온 것을 붙여 넣는다.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync, rmSync } from "node:fs";

const 살아있는곳 = `${process.env.USERPROFILE ?? process.env.HOME}/.claude/scheduled-tasks`;
const 저장소곳 = "루틴";

type 갈래 = "재기" | "저장" | "되돌리기";
const 인자 = process.argv.slice(2);
const 무엇: 갈래 = 인자.includes("--저장") ? "저장" : 인자.includes("--되돌리기") ? "되돌리기" : "재기";

/** 한 곳의 루틴들을 { 이름 → SKILL.md 내용 } 으로 읽는다. 없는 폴더는 빈 것으로 본다. */
function 읽기(뿌리: string): Map<string, string> {
  const 것 = new Map<string, string>();
  if (!existsSync(뿌리)) return 것;
  for (const 이름 of readdirSync(뿌리)) {
    const 폴더 = `${뿌리}/${이름}`;
    if (!statSync(폴더).isDirectory()) continue;
    const 파일 = `${폴더}/SKILL.md`;
    if (!existsSync(파일)) continue;
    /* ⚠ 줄 끝(CRLF/LF)만 다른 것을 «달라졌다»고 하면 매번 시끄럽다. 견줄 때는 맞춰서 본다. */
    것.set(이름, readFileSync(파일, "utf8").split("\r\n").join("\n"));
  }
  return 것;
}

const 살아있는것 = 읽기(살아있는곳);
const 저장된것 = 읽기(저장소곳);

/* ── 어디가 다른가 ── */
const 모든이름 = [...new Set([...살아있는것.keys(), ...저장된것.keys()])].sort();
const 새것: string[] = [], 사라진것: string[] = [], 바뀐것: string[] = [];
for (const 이름 of 모든이름) {
  const a = 살아있는것.get(이름), b = 저장된것.get(이름);
  if (a !== undefined && b === undefined) 새것.push(이름);
  else if (a === undefined && b !== undefined) 사라진것.push(이름);
  else if (a !== b) 바뀐것.push(이름);
}
const 어긋남 = 새것.length + 사라진것.length + 바뀐것.length;

/** 몇 줄이 달라졌는지만 센다 — 사람이 보기엔 그걸로 충분하다. */
function 줄차이(a: string, b: string): string {
  const A = a.split("\n"), B = b.split("\n");
  return `${A.length}줄 → ${B.length}줄 (${B.length - A.length >= 0 ? "+" : ""}${B.length - A.length})`;
}

if (무엇 === "재기") {
  console.log(`\n루틴 백업 재기 — 살아 있는 것 ${살아있는것.size}개 · 저장소 ${저장된것.size}개\n`);
  if (!어긋남) {
    console.log("  ✓ 저장소 사본이 살아 있는 루틴과 같습니다.\n");
  } else {
    for (const n of 새것) console.log(`  ＋ ${n.padEnd(26)} 저장소에 아직 없습니다`);
    for (const n of 사라진것) console.log(`  － ${n.padEnd(26)} 살아 있는 쪽에서 지워졌습니다`);
    for (const n of 바뀐것) console.log(`  ≠ ${n.padEnd(26)} 내용이 다릅니다 — ${줄차이(살아있는것.get(n)!, 저장된것.get(n)!)}`);
    console.log(`\n  ⛔ ${어긋남}개가 어긋나 있습니다.`);
    console.log("     살아 있는 쪽이 맞으면  npx tsx 루틴-백업.mts --저장");
    console.log("     저장소 쪽이 맞으면    npx tsx 루틴-백업.mts --되돌리기\n");
    process.exit(1);
  }
} else if (무엇 === "저장") {
  mkdirSync(저장소곳, { recursive: true });
  for (const [이름, 글] of 살아있는것) {
    mkdirSync(`${저장소곳}/${이름}`, { recursive: true });
    writeFileSync(`${저장소곳}/${이름}/SKILL.md`, 글, "utf8");
  }
  /* 살아 있는 쪽에서 지운 루틴은 사본에서도 지운다 — 안 그러면 죽은 루틴이 되살아난다 */
  for (const 이름 of 사라진것) rmSync(`${저장소곳}/${이름}`, { recursive: true, force: true });
  console.log(`\n  ✓ ${살아있는것.size}개를 저장소에 담았습니다` +
    (사라진것.length ? ` (죽은 사본 ${사라진것.length}개 지움: ${사라진것.join(" · ")})` : "") + "\n");
} else {
  /* ⛔ 되돌리기는 살아 있는 루틴을 «덮어쓴다». 무엇을 덮는지 먼저 보여 준다. */
  if (!저장된것.size) {
    console.log("\n  ⛔ 저장소에 사본이 없습니다. 되돌릴 것이 없습니다.\n");
    process.exit(1);
  }
  mkdirSync(살아있는곳, { recursive: true });
  for (const [이름, 글] of 저장된것) {
    mkdirSync(`${살아있는곳}/${이름}`, { recursive: true });
    writeFileSync(`${살아있는곳}/${이름}/SKILL.md`, 글, "utf8");
  }
  console.log(`\n  ✓ ${저장된것.size}개를 ${살아있는곳} 에 되돌렸습니다`);
  if (새것.length) console.log(`  ⚠ 살아 있던 ${새것.join(" · ")} 은(는) 사본에 없어 그대로 두었습니다`);
  console.log("\n  ⚠ 파일만 돌아온 것입니다. «언제 도는지»는 아직 등록되지 않았습니다.");
  console.log("     루틴/_시각표.json 을 보고 Claude 에게 등록을 시키세요.\n");
}
