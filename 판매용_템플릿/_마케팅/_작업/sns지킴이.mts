/* 검수기를 들여다보다가, 사장님이 누른 단추대로 «알아서» 일한다. (2026-08-18 사장님 설계)
 *
 *   npx tsx "판매용_템플릿/_마케팅/_작업/sns지킴이.mts"            한 바퀴만 돌고 끝난다
 *   npx tsx "판매용_템플릿/_마케팅/_작업/sns지킴이.mts" --지킴이     30초마다 계속 들여다본다
 *   … --시늉                                                       무엇을 할지만 찍고 아무것도 안 한다
 *
 * 왜 만들었나
 *   사장님: 「검수기에서 검수하고 검수완료를 누른다. 이때 어디로 이동될 수 있을까?
 *            내가 따로 방에서 말해야 할까?」
 *
 *   웹 페이지는 클로드코드를 부를 수 없다. 그런데 「승인된 것을 다시 굽는다」는
 *   **정해진 일**이라 클로드가 필요 없다 — 그냥 이 스크립트가 한다.
 *   사장님은 단추만 누르시면 되고, 방에서 말씀 안 하셔도 된다.
 *
 * 하는 일 (상태별)
 *   approved(제작중)  → 검수기 글을 로컬로 끌어오고 → 다시 굽고 → 검수기에 되올리고 → waiting
 *   final(등록 중)    → 유튜브(비공개) + 구글 드라이브 → published
 *
 * ⛔ 바깥으로 나가는 일은 **final 하나에만** 걸려 있다.
 *   approved 는 «다시 굽기»까지다. 되돌리기 어려운 일을 중간 단추에 매달지 않는다.
 * ⛔ 이미 유튜브 ID 가 적힌 것은 **두 번 안 올린다.** 같은 영상이 두 개 생기는 것이
 *   지금까지 제일 자주 난 사고다.
 */
import { execFileSync } from "node:child_process";
import { existsSync, copyFileSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { eq, inArray } from "drizzle-orm";

config({ path: ".env.local" });
const { db } = await import("@/db/client");
const { snsContent } = await import("@/db/schema");

const 여기 = dirname(fileURLToPath(import.meta.url));
const 뿌리 = resolve(여기, "../../..");           // 프로젝트 뿌리 — 유튜브 인증을 상대 경로로 찾는다
const 드라이브 = "G:/내 드라이브/릴스/카페인컬러_주간콘텐츠";

const 지킴이 = process.argv.includes("--지킴이");
const 시늉 = process.argv.includes("--시늉");
const 쉬는초 = 30;

const 이제 = () => new Date().toLocaleTimeString("ko-KR", { hour12: false });
const 말 = (s: string) => console.log(`[${이제()}] ${s}`);

/** 윈도우에서 `npx`·`npm` 은 실제로는 `.cmd` 파일이다.
 *
 * ⛔ 2026-08-18: 작업 스케줄러로 옮기다 세 번 걸렸다 — ENOENT(셸이 없어 .cmd 를 못 찾음),
 *   그다음 빈칸에서 잘림(폴더 이름이 「02. 웹기획자」다), 그다음 EINVAL
 *   (Node 24 는 보안상 `.cmd` 직접 실행을 막는다).
 *   셋 다 «npx 를 거치기 때문»이라, 아예 안 거치고 node 로 바로 부른다. */
/** `npx tsx X.mts` 를 `node --import tsx X.mts` 로 바꾼다.
 *  node 는 진짜 실행파일이라 셸도 `.cmd` 도 필요 없다. */
function 부를것(명령: string, 인자: string[]): [string, string[]] {
  if (명령 === "npx" && 인자[0] === "tsx") return [process.execPath, ["--import", "tsx", ...인자.slice(1)]];
  return [명령, 인자];
}

/** 프로젝트 뿌리에서 명령을 돌린다. 실패하면 그대로 던진다 — 조용히 넘어가지 않는다. */
function 돌리기(설명: string, 명령: string, 인자: string[]) {
  말(`  · ${설명}`);
  if (시늉) return "(시늉)";
  /* ⛔ 윈도우에서 `npx` 는 `npx.cmd` 다. 창에서 돌릴 때는 셸이 찾아 주지만
     작업 스케줄러가 부를 때는 셸이 없어 `spawnSync npx ENOENT` 로 죽는다.
     2026-08-18 에 스케줄러로 옮기다 실제로 걸렸다 — shell 을 붙여 셸이 찾게 한다. */
  const [실행, 값] = 부를것(명령, 인자);
  return execFileSync(실행, 값, { cwd: 뿌리, encoding: "utf8", maxBuffer: 1 << 26 });
}

/** 파일 이름에 못 쓰는 글자를 뺀다. */
const 이름씻기 = (s: string) =>
  s.replace(/<[^>]*>/g, "").replaceAll("|", " ").replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim();

/** 그 편의 «16:9» 썸네일 파일을 찾는다.
 *
 * ⛔ 2026-08-18: 지킴이는 썸네일 인자를 아예 안 넘기고 있었다. 그래서 손으로 올릴 때는
 *   붙던 썸네일이, 지킴이가 올린 것에는 없었다. 사장님이 「16:9 썸네일이 같이 안올라온다」고
 *   하신 것이 이것이다.
 *
 * ⚠ 이름이 딱 맞지 않는다. DB 의 이름표는 `펫유치원_컷편집` 인데
 *   구운 썸네일은 `썸네일_영상5_펫유치원_16_9.png` 다. 그래서 양쪽에서 군더더기를
 *   떼어 낸 «알맹이»로 맞춘다 — `영상5_`·`썸네일_`·`_16_9`·`_컷편집` 을 뗀다.
 */
function 썸네일찾기(이름표: string): string {
  const 알맹이 = (s: string) => {
    let t = s;
    if (t.endsWith(".png")) t = t.slice(0, -4);
    if (t.startsWith("썸네일_")) t = t.slice(4);
    if (t.endsWith("_16_9")) t = t.slice(0, -5);
    if (t.endsWith("_컷편집")) t = t.slice(0, -4);
    if (t.startsWith("영상")) {
      const 밑 = t.indexOf("_");
      const 숫자 = t.slice(2, 밑);
      if (밑 > 2 && 숫자.length > 0 && [...숫자].every((c) => c >= "0" && c <= "9")) t = t.slice(밑 + 1);
    }
    return [...t].filter((c) => c !== "_" && c.trim() !== "").join("");
  };
  const 찾는것 = 알맹이(이름표);
  const 방들 = ["cc-thumb-w2", "cc-thumb-w1"].map((d) => join(process.env.TEMP ?? ".", d));
  for (const 방 of 방들) {
    if (!existsSync(방)) continue;
    for (const 파일 of readdirSync(방)) {
      if (!파일.endsWith(".png") || !파일.includes("16_9")) continue;
      if (알맹이(파일) === 찾는것) return join(방, 파일);
    }
  }
  return "";
}

/* ── ① 제작중 — 검수기 글로 다시 굽고 되올린다 ───────────────────── */
async function 다시굽기(편: typeof snsContent.$inferSelect) {
  /* ⛔ 「그 밖에 고칠 것」이 적혀 있으면 다시 굽지 않는다 (2026-08-20 사장님).

     자막·카피는 가져와서 다시 굽기만 하면 된다. 그런데 「커버에 엉뚱한 그림이
     들어갔다」·「상단 영상이 다른 편 것이다」는 **같은 재료로 다시 구우면 같은 것이
     또 나온다.** 굽는 쪽을 사람이 먼저 손봐야 한다.

     그래서 여기서 멈추고 «무엇을 고쳐 달라 하셨는지»를 그대로 보여 준다.
     상태는 「제작중」 그대로 둔다 — 손본 뒤에 지킴이가 다시 집으라고. */
  if (편.fixNote && 편.fixNote.trim()) {
    말(`▶ 제작중 — ${편.batch} · ${편.slug}`);
    말("  ⛔ 「그 밖에 고칠 것」이 적혀 있어 다시 굽지 않았습니다:");
    const 줄들 = 편.fixNote.trim().split(String.fromCharCode(10)).map((x) => x.trim()).filter(Boolean);
    for (const 한줄 of 줄들) 말(`     · ${한줄}`);
    말("  → 굽는 쪽을 고친 뒤에 이 칸을 비우면 다시 돕니다.");
    return;
  }

  말(`▶ 제작중 — ${편.batch} · ${편.slug}`);
  if (!편.scriptPath || !existsSync(편.scriptPath)) {
    말(`  ⛔ 대본을 못 찾습니다: ${편.scriptPath || "(안 적혀 있음)"} — 손으로 한 번 보내 주세요.`);
    return;
  }
  const 인트로 = 편.introPath && existsSync(편.introPath) ? 편.introPath : "";

  돌리기("검수기 글을 로컬로 가져오기", "npx", [
    "tsx", join(여기, "글가져오기.mts"), 편.scriptPath, 인트로 || 편.scriptPath, 편.batch, 편.slug,
  ]);
  돌리기("자막 검사", "npx", [
    "tsx", join(여기, "자막검사.mts"), 편.scriptPath, ...(인트로 ? [인트로] : []),
  ]);
  돌리기("영상 굽기", "node", [join(여기, "영상굽기.mjs"), 편.scriptPath]);
  if (인트로) 돌리기("커버 붙이기", "node", [join(여기, "영상인트로.mjs"), 인트로]);
  /* ⛔ 순서가 중요하다 (2026-08-18에 실제로 막혔다).
     검수보내기는 «approved 인 편»을 건드리지 않는다 — 사장님 판단을 지우지 않으려는 장치다.
     그런데 다시굽기가 하는 일이 바로 «approved 된 것을 다시 굽는 것»이라,
     되올리기 «전에» 검토대기로 돌려놓지 않으면 그 장치에 내가 걸린다.
     지금 굽고 있는 것은 더 이상 승인된 그 영상이 아니므로, 검토대기가 맞는 상태이기도 하다. */
  if (!시늉) {
    await db.update(snsContent).set({ status: "waiting", updatedAt: new Date() }).where(eq(snsContent.id, 편.id));
  }

  돌리기("검수기에 되올리기", "npx", [
    "tsx", join(여기, "검수보내기.mts"), 편.scriptPath, 편.batch, ...(인트로 ? [인트로] : []), "--자막만",
  ]);
  말("  ✅ 다시 구웠습니다 — 「검토대기」로 돌려 뒀습니다.");
}

/* ── ② 등록 중 — 유튜브(비공개) + 드라이브 ───────────────────────── */
async function 올리기(편: typeof snsContent.$inferSelect) {
  말(`▶ 등록 중 — ${편.batch} · ${편.slug}`);

  /* 둘 다 올라가 있을 때만 돌려보낸다.
     ⛔ 한쪽만 보고 돌려보내면, 세로만 성공하고 가로가 실패한 편이
        영영 가로 없이 「등록완료」가 된다. */
  if (편.youtubeVerticalId && 편.youtubeHorizontalId) {
    말(`  ⛔ 이미 둘 다 올라가 있습니다 (${편.youtubeVerticalId} · ${편.youtubeHorizontalId}).`);
    if (!시늉) await db.update(snsContent).set({ status: "published" }).where(eq(snsContent.id, 편.id));
    return;
  }
  for (const [이름표, 길] of [["세로", 편.videoVertical], ["가로", 편.videoHorizontal]] as const) {
    if (!길 || !existsSync(길)) {
      말(`  ⛔ ${이름표} 영상이 없습니다: ${길 || "(안 적혀 있음)"} — 먼저 다시 구워야 합니다.`);
      return;
    }
  }

  /* 제목은 커버 카피에서 만든다 — 사장님이 검수기에서 정하신 글이다. */
  const 바탕제목 = 이름씻기(편.coverTitle || 편.verticalTitle);
  const 부제 = 이름씻기(편.coverSub);
  const 제목 = [바탕제목, 부제].filter(Boolean).join(" ");

  /* 설명은 검수기에 있는 것을 그대로 쓴다. 파일로 잠깐 내려놨다가 넘긴다. */
  const 설명길 = join(process.env.TEMP ?? ".", `cc-desc-${편.id}.txt`);
  if (!시늉) (await import("node:fs")).writeFileSync(설명길, 편.captionYoutube, "utf8");

  /* ⛔⛔ 2026-08-18: 여기서 같은 영상이 «여섯 번» 올라갔다.
     옛 차례: 올리기 → 설명 → 드라이브 → 그제야 DB 에 ID 적기.
     그런데 드라이브 폴더가 없어서(G: 가 안 붙어 있었다) 그 앞에서 죽었고,
     ID 를 못 적으니 다음 바퀴가 「아직 안 올렸네」로 보고 또 올렸다.
     바깥으로 나간 일은 **되돌릴 수 없다.** 그러니 나가자마자 적는다 —
     적는 것이 늦으면 그 사이 무엇이 터지든 같은 일이 되풀이된다. */
  /* 올리기가 뱉는 줄에서 유튜브 ID 만 집는다 (…/video/<ID>/edit). */
  const 아이디 = (s: string) => {
    const 앞 = s.indexOf("/video/");
    if (앞 < 0) return "";
    const 뒤 = s.indexOf("/edit", 앞 + 7);
    return 뒤 < 0 ? "" : s.slice(앞 + 7, 뒤).trim();
  };

  let 세로ID = 편.youtubeVerticalId ?? "";
  if (세로ID) 말(`  · 세로는 이미 올라가 있습니다 (${세로ID}) — 건너뜁니다.`);
  else {
    const 세로결과 = 돌리기("유튜브 — 세로(쇼츠, 비공개)", "node", [
      "_작업/유튜브올리기.mjs", 편.videoVertical, `${제목} #Shorts`, "",
    ]);
    세로ID = 아이디(String(세로결과));
  }
  /* 올린 즉시 적는다. 가로가 실패해도 세로를 두 번 안 올린다. */
  if (!시늉 && 세로ID) {
    await db.update(snsContent).set({ youtubeVerticalId: 세로ID }).where(eq(snsContent.id, 편.id));
    말(`    ↳ 적어 뒀습니다: ${세로ID}`);
  }

  /* ⭐ 썸네일은 «가로에만» 붙인다 — 유튜브는 16:9 만 커스텀 썸네일로 받는다.
     전에는 이 인자를 아예 안 넘겨서 지킴이로 올린 것에는 썸네일이 없었다. */
  let 가로ID = 편.youtubeHorizontalId ?? "";
  if (가로ID) 말(`  · 가로는 이미 올라가 있습니다 (${가로ID}) — 건너뜁니다.`);
  else {
    const 썸네일 = 썸네일찾기(편.slug);
    /* 찾았는지 «찍어서» 보여 준다 — 「보냈다」와 「붙었다」는 다르다. */
    if (썸네일) 말(`  · 가로에 붙일 16:9 썸네일 — ${basename(썸네일)}`);
    else 말("    ⚠ 16:9 썸네일을 못 찾았습니다 — 썸네일 없이 올립니다.");
    const 가로결과 = 돌리기("유튜브 — 가로(비공개)", "node", [
      "_작업/유튜브올리기.mjs", 편.videoHorizontal, 제목, "", ...(썸네일 ? [썸네일] : []),
    ]);
    가로ID = 아이디(String(가로결과));
  }
  if (!시늉 && 가로ID) {
    await db.update(snsContent).set({ youtubeHorizontalId: 가로ID }).where(eq(snsContent.id, 편.id));
    말(`    ↳ 적어 뒀습니다: ${가로ID}`);
  }

  /* 설명은 올린 뒤에 넣는다 — 올리기 권한만으로는 안 되고 force-ssl 이 있어야 한다. */
  for (const id of [세로ID, 가로ID].filter(Boolean)) {
    돌리기(`유튜브 — 설명 넣기 (${id})`, "node", ["_작업/유튜브설명고치기.mjs", id, 설명길]);
  }

  /* 드라이브에는 «영상만» 넣는다 (2026-08-18 사장님 지시: 썸네일 x, 캡션 x).
     ⚠ 여기서 죽으면 안 된다. 유튜브에는 이미 올라갔고, 드라이브는 «사본»일 뿐이다.
        G: 가 안 붙어 있다고 해서 다 끝난 일을 실패로 되돌리면 또 올리게 된다. */
  const 낼방 = join(드라이브, 편.batch);
  if (!시늉) {
    try {
      mkdirSync(낼방, { recursive: true });
      copyFileSync(편.videoVertical, join(낼방, `세로_${바탕제목}.mp4`));
      copyFileSync(편.videoHorizontal, join(낼방, `가로_${바탕제목}.mp4`));
      말(`  · 구글 드라이브 — ${낼방}`);
    } catch (e) {
      말(`  ⚠ 구글 드라이브에 못 넣었습니다 (${e instanceof Error ? e.message : String(e)})`);
      말("    유튜브에는 올라갔습니다. 드라이브는 G: 가 붙은 뒤 손으로 복사하시면 됩니다.");
    }
  }

  if (!시늉) {
    await db.update(snsContent).set({ status: "published", publishedAt: new Date() })
      .where(eq(snsContent.id, 편.id));
  }
  말(`  ✅ 올렸습니다 — 둘 다 비공개. 세로 ${세로ID} · 가로 ${가로ID}`);
}

/* ── 한 바퀴 ────────────────────────────────────────────────────── */
/* ── ③ 「등록완료」인데 유튜브에 없는 것을 찾아낸다 ─────────────────
 *
 * ⛔ 2026-08-18 밤에 이 구멍에 빠졌다. 올린 영상이 유튜브에서 사라졌는데
 *   검수기에는 「등록완료」로 남아 있었다. ID 가 적혀 있으니 지킴이는
 *   「이미 올렸네」 하고 건너뛴다 — **영영 안 올라간다.**
 *
 * ⭐ 찾기만 하고 «다시 안 올린다.** 저절로 다시 올리게 만들면,
 *   유튜브가 지우는 쪽이면 「올린다 → 지워진다 → 또 올린다」로 끝없이 돈다.
 *   같은 날 낮에 스물여섯 번 올라간 것이 바로 그 모양이었다.
 *   사람이 까닭을 보고 정하도록 **알리기만 한다.** */
async function 사라진것확인() {
  const 올린것 = await db.select().from(snsContent).where(eq(snsContent.status, "published"));
  /* 방금 올린 것은 묻지 않는다 — 유튜브가 목록에 넣기까지 몇 분 걸린다. */
  const 다섯분전 = Date.now() - 5 * 60 * 1000;
  const 물어볼것: { 편: typeof snsContent.$inferSelect; id: string; 자리: string }[] = [];
  for (const 편 of 올린것) {
    if (편.publishedAt && new Date(편.publishedAt).getTime() > 다섯분전) continue;
    if (편.youtubeVerticalId) 물어볼것.push({ 편, id: 편.youtubeVerticalId, 자리: "세로" });
    if (편.youtubeHorizontalId) 물어볼것.push({ 편, id: 편.youtubeHorizontalId, 자리: "가로" });
  }
  if (!물어볼것.length) return;

  let 답: string;
  try {
    답 = String(돌리기("올린 것이 아직 있는지 확인", "node",
      ["_작업/유튜브있나.mjs", ...물어볼것.map((x) => x.id)]));
  } catch (e) {
    /* 못 물어본 것을 「없다」고 말하면 안 된다. 조용히 넘어간다. */
    말(`  ⚠ 유튜브에 못 물어봤습니다 — 이번엔 넘어갑니다. (${e instanceof Error ? e.message : String(e)})`);
    return;
  }
  const 없는것 = new Set(답.split(String.fromCharCode(10))
    .filter((l) => l.trim().endsWith("없음")).map((l) => l.trim().split(" ")[0]));
  if (!없는것.size) return;

  for (const { 편, id, 자리 } of 물어볼것) {
    if (!없는것.has(id)) continue;
    말(`  ⛔ ${편.slug} — ${자리}(${id})가 유튜브에 없습니다. 검수기는 「등록완료」로 보입니다.`);
  }
  말("    ↳ 다시 안 올립니다. 지워진 까닭을 보고 정하세요 (유튜브 메일함을 보시면 됩니다).");
  말("    ↳ 다시 올리려면 검수기에서 그 편을 «승인»으로 되돌려 주세요.");
}

async function 한바퀴() {
  const 할것 = await db.select().from(snsContent).where(inArray(snsContent.status, ["approved", "final"]));
  /* ⚠ 사라진 것 확인은 «올릴 게 없어도» 돈다.
     여기서 먼저 돌려보내면, 다 올라간 뒤에는 영영 확인을 안 한다 —
     사라지는 일은 바로 그 「다 올라간 뒤」에 생긴다. */
  await 사라진것확인();
  if (!할것.length) return false;
  for (const 편 of 할것) {
    try {
      if (편.status === "approved") await 다시굽기(편);
      else await 올리기(편);
    } catch (e) {
      /* ⚠ 실패하면 상태를 그대로 둔다 — 다음 바퀴에 다시 해 본다.
         조용히 waiting 으로 돌려 버리면 «안 만들어진 것»이 검토대기로 보인다. */
      말(`  ⛔ 실패했습니다 — 상태를 그대로 둡니다.\n${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return true;
}

말(시늉 ? "시늉으로 돕니다 — 아무것도 안 고칩니다." : "검수기를 들여다봅니다.");
if (지킴이) {
  말(`${쉬는초}초마다 봅니다. 멈추려면 Ctrl+C.`);
  for (;;) {
    const 했나 = await 한바퀴();
    if (!했나) process.stdout.write(".");
    await new Promise((r) => setTimeout(r, 쉬는초 * 1000));
  }
} else {
  const 했나 = await 한바퀴();
  if (!했나) 말("할 일이 없습니다 (제작중·등록 중이 없습니다).");
  process.exit(0);
}
