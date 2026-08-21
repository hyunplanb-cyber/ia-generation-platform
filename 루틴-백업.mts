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
 * 시각표(`루틴/_시각표.json`)도 «손으로 적지 않고» 여기서 만든다 — 아래 시각표 절 참고.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync, rmSync } from "node:fs";

const 집 = (process.env.USERPROFILE ?? process.env.HOME ?? "").split("\\").join("/");
const 살아있는곳 = `${집}/.claude/scheduled-tasks`;
const 저장소곳 = "루틴";
const 시각표길 = `${저장소곳}/_시각표.json`;

type 갈래 = "재기" | "저장" | "되돌리기";
const 인자 = process.argv.slice(2);
const 무엇: 갈래 = 인자.includes("--저장") ? "저장" : 인자.includes("--되돌리기") ? "되돌리기" : "재기";

/* ═══════════════════════════════════════════════════════════════════════
   1. SKILL.md 들
   ═══════════════════════════════════════════════════════════════════ */

/** 한 곳의 루틴들을 { 이름 → SKILL.md 내용 } 으로 읽는다. 없는 폴더는 빈 것으로 본다. */
function 읽기(뿌리: string): Map<string, string> {
  const 것 = new Map<string, string>();
  if (!existsSync(뿌리)) return 것;
  for (const 이름 of readdirSync(뿌리)) {
    const 폴더 = `${뿌리}/${이름}`;
    if (!statSync(폴더).isDirectory()) continue;
    const 파일 = `${폴더}/SKILL.md`;
    if (!existsSync(파일)) continue;
    /* ⚠ 줄 끝(CRLF/LF)만 다른 것을 «달라졌다»고 하면 매번 시끄럽다. 견줄 때는 맞춰서 본다.
       git 이 체크아웃할 때 LF 를 CRLF 로 바꿔 놓기 때문에 반드시 필요하다. */
    것.set(이름, readFileSync(파일, "utf8").split("\r\n").join("\n"));
  }
  return 것;
}

const 살아있는것 = 읽기(살아있는곳);
const 저장된것 = 읽기(저장소곳);

/* ═══════════════════════════════════════════════════════════════════════
   2. 시각표 — «언제 도는지»는 SKILL.md 에 없다
   ═══════════════════════════════════════════════════════════════════ */

/** 예약 등록 원본이 사는 자리. 세션 아이디 밑이라 «찾아서» 쓴다 — 박아 두면 언젠가 어긋난다. */
function 등록원본찾기(): string | null {
  const 뿌리 = `${집}/AppData/Roaming/Claude/claude-code-sessions`;
  if (!existsSync(뿌리)) return null;
  const 후보: { 길: string; 때: number }[] = [];
  /* 두 겹 밑에 있다 — <세션>/<하위>/scheduled-tasks.json */
  const 폴더인가 = (p: string) => { try { return statSync(p).isDirectory(); } catch { return false; } };
  for (const a of readdirSync(뿌리)) {
    if (!폴더인가(`${뿌리}/${a}`)) continue;
    for (const b of readdirSync(`${뿌리}/${a}`)) {
      const 길 = `${뿌리}/${a}/${b}/scheduled-tasks.json`;
      if (existsSync(길)) 후보.push({ 길, 때: statSync(길).mtimeMs });
    }
  }
  if (!후보.length) return null;
  /* 여러 개면 «가장 최근에 손댄 것»이 살아 있는 것이다 */
  return 후보.sort((x, y) => y.때 - x.때)[0].길;
}

/** cron 을 사람 말로. 지금 쓰는 두 모양(요일마다 · 날짜마다)만 푼다. */
function 사람말(cron: string): string {
  const [분, 시, 날, , 요일] = cron.split(/ +/);
  const 요일말 = ["일", "월", "화", "수", "목", "금", "토"];
  const 때 = `${String(시).padStart(2, "0")}:${String(분).padStart(2, "0")}`;
  if (요일 !== "*" && /^[0-6]$/.test(요일)) return `${요일말[Number(요일)]}요일 ${때}`;
  if (날 !== "*" && /^\d+$/.test(날)) return `매월 ${날}일 ${때}`;
  return `${cron} (${때})`;
}

/** SKILL.md 머리말의 description 을 꺼낸다 — 루틴이 스스로 적어 둔 «무엇을 하는지»다. */
function 무엇을하나(글: string | undefined): string {
  if (!글) return "";
  const m = /^---\n[\s\S]*?^description:[ ]*(.+)$/m.exec(글);
  return m ? m[1].trim() : "";
}

/**
 * 시각표를 «만든다». 손으로 적지 않는다.
 * ⚠ 자주 바뀌는 값(lastRunAt · createdAt · notifySessionId · lastScheduledFor)은 담지 않는다.
 *    담으면 돌 때마다 달라져서 매주 헛경보가 난다. 담는 것은 «바뀌면 알아야 하는 것»뿐이다.
 * ⚠ approvedPermissions 는 이 컴퓨터의 경로라 새 컴퓨터에서 그대로 못 쓴다. 개수만 남긴다.
 */
function 시각표만들기(): object | null {
  const 원본길 = 등록원본찾기();
  if (!원본길) return null;
  const 원본 = JSON.parse(readFileSync(원본길, "utf8"));
  const 등록 = (원본.scheduledTasks ?? []) as Record<string, unknown>[];

  const 등록된것 = 등록.map((t) => ({
    taskId: t.id,
    cron: t.cronExpression,
    언제: 사람말(String(t.cronExpression)),
    켜짐: t.enabled,
    무엇: 무엇을하나(살아있는것.get(String(t.id))),
    작업폴더: String(t.cwd ?? "").split("\\").join("/"),
    승인해둔권한: (t.approvedPermissions as unknown[] ?? []).length,
  })).sort((a, b) => String(a.taskId).localeCompare(String(b.taskId)));

  const 등록된이름 = new Set(등록.map((t) => String(t.id)));
  const 등록안된 = [...살아있는것.keys()].filter((n) => !등록된이름.has(n)).sort();

  return {
    "이 파일은": "루틴-백업.mts 가 만듭니다. 손으로 고치지 마세요 — 다음 번에 덮어씁니다.",
    "어디서 오나": "예약 등록 원본(AppData/Roaming/Claude/claude-code-sessions/*/*/scheduled-tasks.json)",
    "왜 있나": "SKILL.md 에는 «언제 도는지»가 없다. 파일만 되돌려서는 복구가 안 된다.",
    "⚠ 안 담는 것": "마지막 실행 시각·만든 때 같은 것은 돌 때마다 바뀌므로 담지 않는다. 승인해 둔 권한은 이 컴퓨터의 경로라 개수만 남긴다 — 새 컴퓨터에서는 다시 승인해야 한다.",
    등록된것,
    등록안된폴더: {
      무엇: 등록안된,
      메모: "폴더는 있는데 예약에 등록돼 있지 않다. 옛 판단 근거가 적혀 있어 지우지 않고 두는 것이니 되돌릴 때 «켜지 않는다».",
    },
  };
}

const 만든시각표 = 시각표만들기();
const 담긴시각표 = existsSync(시각표길) ? readFileSync(시각표길, "utf8").split("\r\n").join("\n") : null;
const 시각표글 = 만든시각표 ? JSON.stringify(만든시각표, null, 2) + "\n" : null;
const 시각표어긋남 = 시각표글 !== null && 담긴시각표 !== null && 시각표글 !== 담긴시각표;

/* ═══════════════════════════════════════════════════════════════════════
   3. 견주기 · 담기 · 되돌리기
   ═══════════════════════════════════════════════════════════════════ */

const 모든이름 = [...new Set([...살아있는것.keys(), ...저장된것.keys()])].sort();
const 새것: string[] = [], 사라진것: string[] = [], 바뀐것: string[] = [];
for (const 이름 of 모든이름) {
  const a = 살아있는것.get(이름), b = 저장된것.get(이름);
  if (a !== undefined && b === undefined) 새것.push(이름);
  else if (a === undefined && b !== undefined) 사라진것.push(이름);
  else if (a !== b) 바뀐것.push(이름);
}
const 어긋남 = 새것.length + 사라진것.length + 바뀐것.length + (시각표어긋남 ? 1 : 0);

/** 몇 줄이 달라졌는지만 센다 — 사람이 보기엔 그걸로 충분하다. */
function 줄차이(a: string, b: string): string {
  const A = a.split("\n"), B = b.split("\n");
  return `${A.length}줄 → ${B.length}줄 (${B.length - A.length >= 0 ? "+" : ""}${B.length - A.length})`;
}

/** 시각표가 어디가 달라졌는지 사람 말로 짚는다 — JSON 을 통째로 보여 주면 아무도 안 읽는다. */
function 시각표차이(): string[] {
  if (!만든시각표 || !담긴시각표) return [];
  let 옛: { 등록된것?: Record<string, unknown>[] };
  try { 옛 = JSON.parse(담긴시각표); } catch { return ["담긴 시각표를 읽을 수 없습니다 — 다시 만듭니다"]; }
  const 새 = (만든시각표 as { 등록된것: Record<string, unknown>[] }).등록된것;
  const 옛것 = new Map((옛.등록된것 ?? []).map((t) => [String(t.taskId), t]));
  const 새것맵 = new Map(새.map((t) => [String(t.taskId), t]));
  const 말: string[] = [];
  for (const [id, t] of 새것맵) {
    const o = 옛것.get(id);
    if (!o) { 말.push(`＋ ${id} — 새로 등록됐습니다 (${t.언제})`); continue; }
    if (o.cron !== t.cron) 말.push(`≠ ${id} — 시각이 바뀌었습니다: ${o.언제} → ${t.언제}`);
    if (o.켜짐 !== t.켜짐) 말.push(`≠ ${id} — ${t.켜짐 ? "켜졌습니다" : "꺼졌습니다"}`);
    if (o.무엇 !== t.무엇) 말.push(`≠ ${id} — 하는 일 설명이 바뀌었습니다`);
    if (o.승인해둔권한 !== t.승인해둔권한) 말.push(`≠ ${id} — 승인해 둔 권한 ${o.승인해둔권한}개 → ${t.승인해둔권한}개`);
  }
  for (const id of 옛것.keys()) if (!새것맵.has(id)) 말.push(`－ ${id} — 등록이 사라졌습니다`);
  return 말.length ? 말 : ["어딘가 달라졌습니다 (자세한 것은 git diff 루틴/_시각표.json)"];
}

if (무엇 === "재기") {
  console.log(`\n루틴 백업 재기 — 살아 있는 것 ${살아있는것.size}개 · 저장소 ${저장된것.size}개`);
  if (!만든시각표) console.log("  ⚠ 예약 등록 원본을 못 찾았습니다 — 시각표는 견주지 않습니다");
  console.log("");
  if (!어긋남) {
    console.log("  ✓ 저장소 사본이 살아 있는 루틴과 같습니다. 시각표도 최신입니다.\n");
  } else {
    for (const n of 새것) console.log(`  ＋ ${n.padEnd(26)} 저장소에 아직 없습니다`);
    for (const n of 사라진것) console.log(`  － ${n.padEnd(26)} 살아 있는 쪽에서 지워졌습니다`);
    for (const n of 바뀐것) console.log(`  ≠ ${n.padEnd(26)} 내용이 다릅니다 — ${줄차이(살아있는것.get(n)!, 저장된것.get(n)!)}`);
    const 시각표말 = 시각표어긋남 ? 시각표차이() : [];
    if (시각표어긋남) { console.log(`  ≠ ${"_시각표.json".padEnd(26)} 등록이 ${시각표말.length}군데 달라졌습니다`); for (const 줄 of 시각표말) console.log(`      ${줄}`); }
    const 셈 = 새것.length + 사라진것.length + 바뀐것.length + 시각표말.length;
    console.log(`\n  ⛔ ${셈}군데가 어긋나 있습니다.`);
    if (새것.length + 사라진것.length + 바뀐것.length) {
      console.log("     살아 있는 쪽이 맞으면  npx tsx 루틴-백업.mts --저장");
      console.log("     저장소 쪽이 맞으면    npx tsx 루틴-백업.mts --되돌리기");
    }
    /* ⚠ 시각표는 «되돌리기»로 못 고친다. 되돌리기는 SKILL.md 만 옮기고 등록은 안 건드린다.
       시각표는 살아 있는 등록에서 «만들어지는» 것이라 언제나 그쪽이 옳다. */
    if (시각표말.length) console.log("     시각표는 살아 있는 등록이 언제나 옳습니다 — --저장 으로 담으세요.");
    console.log("");
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
  console.log(`\n  ✓ 루틴 ${살아있는것.size}개를 저장소에 담았습니다` +
    (사라진것.length ? ` (죽은 사본 ${사라진것.length}개 지움: ${사라진것.join(" · ")})` : ""));
  /* ⚠ 원본을 못 찾았으면 시각표를 «건드리지 않는다». 빈 것으로 덮으면 멀쩡한 백업이 날아간다. */
  if (시각표글) { writeFileSync(시각표길, 시각표글, "utf8"); console.log("  ✓ 시각표도 등록 원본에서 다시 만들었습니다"); }
  else console.log("  ⚠ 예약 등록 원본을 못 찾아 시각표는 그대로 두었습니다 (덮어쓰지 않았습니다)");
  console.log("");
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
  console.log("     루틴/_시각표.json 을 보고 Claude 에게 등록을 시키세요.");
  console.log("     승인해 둔 권한도 안 따라옵니다 — 처음 돌 때 다시 승인해야 합니다.\n");
}
