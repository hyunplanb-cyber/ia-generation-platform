/* 구운 영상을 «검수 화면»으로 보낸다. (2026-08-17 사장님 지시)
 *
 *   npx tsx "판매용_템플릿/_마케팅/_작업/검수보내기.mts" <대본.json> <회차> [올릴글.md]
 *   예) … 대본_펫유치원.json "4주차_2026-08-31"
 *
 * 무엇을 하나
 *   ① 대본과 «이미 구워 둔 세로 영상»(%TEMP%/cc-vid-w2/{이름}_916.mp4)을 읽는다
 *   ② 칸마다 «그 칸 가운데» 프레임을 뽑아 405px webp 로 줄인다
 *   ③ 자막·제목·캡션과 함께 DB(sns_content · sns_cut)에 넣는다 → /admin/sns 에 뜬다
 *
 * ⭐ 왜 «구운 영상에서» 뽑나 — 원본 녹화본에서 뽑으면 «자막과 틀이 없는 그림»이 된다.
 *   사장님이 봐야 하는 것은 실제로 나갈 그림이다. 잘림도 자막 위치도 거기서만 보인다.
 *
 * ⚠ 굽기 전에 `자막검사.mts` 를 통과해야 한다. 안 통과한 것을 검수로 보내지 않는다 —
 *   기계가 잡을 수 있는 것을 사람 눈에 떠넘기는 셈이 된다.
 */
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { eq, and, gt, desc, sql } from "drizzle-orm";
import { config } from "dotenv";
import { checkScript, type 대본 } from "@/lib/sns-caption-rules";

config({ path: ".env.local" });
/* db/client 는 DATABASE_URL 을 «불러올 때» 읽는다 — dotenv 뒤에 들여야 한다. */
const { db } = await import("@/db/client");
const { snsContent, snsCut } = await import("@/db/schema");

const 여기 = dirname(fileURLToPath(import.meta.url));
const 고양이방 = resolve(여기, "../../_이미지/마스코트/낱장");
/* 영상·표지 틀이 사는 곳 — «묵은 것» 검사가 틀의 손댄 시각을 본다. */
const 마케팅 = resolve(여기, "..");
const 구운방 = join(process.env.TEMP ?? tmpdir(), "cc-vid-w2");

const [, , 대본길, 회차, 올릴글길] = process.argv;
/* 사장님이 검수 화면에서 고치신 것을 «정말로» 덮어쓸 때만 붙인다. 기본은 멈춤이다. */
const 덮어쓰기 = process.argv.includes("--덮어쓰기");
/* ⭐ 영상과 자막만 바꾸고 «제목·커버·캡션·올릴때»는 그대로 둔다 (2026-08-17).
   사장님이 검수 화면에서 글을 다 쓰신 뒤, 내가 자막만 다시 써야 하는 자리가 있다.
   그때 통째로 덮어쓰면 사장님 글이 또 날아간다. 이 길로 가면 «칸»만 갈린다. */
const 자막만 = process.argv.includes("--자막만");
/* ⭐ «캡션만» 갈아 끼운다 (2026-09-02 사장님: 「자막내용 확인해서 캡션 내용 수정해주고」)
 *
 *   사장님이 검수 화면에서 «자막»을 고치시면 캡션(유튜브·인스타 설명글)이 그 자막과
 *   어긋난다 — 캡션은 내가 처음 쓴 옛 이야기 그대로 남는다. 영상22 가 그랬다:
 *   자막은 「AI는 색이 정해져 있다」로 바뀌었는데 캡션은 「매번 다르다」였다. 정반대다.
 *
 *   그런데 고칠 길이 없었다 — --자막만 은 캡션을 «안» 건드리고,
 *   아무 깃발도 안 붙이면 사장님이 쓰신 제목·커버까지 통째로 덮어쓴다.
 *   그래서 «캡션 두 칸만» 가는 길을 둔다. 칸도 영상도 제목도 안 건드린다.
 *
 * ⚠ 영상이 안 구워져 있어도 된다 — 캡션은 영상에서 나오는 값이 아니다.
 *   그래서 「구운 영상이 없다」와 「묵은 것」 검사를 건너뛴다. */
const 캡션만 = process.argv.includes("--캡션만");
if (캡션만 && 자막만) {
  console.error("--자막만 과 --캡션만 은 같이 못 씁니다. 하나만 고르세요.");
  process.exit(2);
}
/* ⭐ 녹화본이 사라져 «본편을 다시 못 굽는» 편이 있다 (2026-08-20).
   그때는 커버와 캡션만 고치고 본편은 그대로 간다 — 「묵은 것」 검사가 본편을 막으면 안 된다.
   ⚠ 지킴이가 스스로 판단해 붙인다. 사람이 손으로 붙이는 깃발이 아니다. */
const 본편그대로 = process.argv.includes("--본편그대로");
if (!대본길 || !회차) {
  console.error('쓰는 법: npx tsx 검수보내기.mts <대본.json> <회차> [올릴글.md]');
  console.error('예)      … 대본_펫유치원.json "4주차_2026-08-31"');
  console.error("깃발: --자막만(칸만) · --캡션만(캡션 두 칸만) · --덮어쓰기(통째로)");
  process.exit(2);
}

const 별명 = (() => {
  const 길 = join(고양이방, "_별명.csv");
  const 표 = new Map<string, string>();
  if (!existsSync(길)) return 표;
  for (const 줄 of readFileSync(길, "utf8").replace(/^﻿/, "").split(/\r?\n/).slice(1)) {
    const [부르는, 실제] = 줄.split(",").map((s) => s?.trim());
    if (부르는 && 실제) 표.set(부르는, 실제);
  }
  return 표;
})();

/** 기본 해시태그 여덟 개 — 편마다 새로 고르지 않는다(2026-08-11 지정). */
const 해시태그 = "#바이브코딩 #웹기획 #화면설계 #AI개발 #웹사이트제작 #클로드코드 #클로드ai #1인창업";

/* ⛔ 옛 「링크 세 줄」은 2026-08-25 에 폐기됐다 — 여기서 지웠다 (2026-08-31).
 *
 *   사장님: 「캡션에 **고정**해서 들어갈 내용이 **옛것이 같이 자꾸 붙어서**.」
 *
 *   까닭이 여기 있었다. `캡션_공통.md` 는 8/25 에 확정된 새 덩어리로 갈렸는데
 *   (주소 0개 · 채널 프로필 링크로 보냄 · 맨 아래에 해시태그 여덟 개),
 *   이 스크립트가 그 뒤에 **옛 링크 세 줄 + 해시태그 한 줄을 또 붙이고** 있었다.
 *   그래서 나간 캡션에는 ① 안 눌리는 주소 셋(유튜브가 쇼츠 설명란의 URL 을 막아 뒀다) ·
 *   ② 「IA팩」(없는 말. 「AI팩」이 맞다) · ③ 해시태그 두 줄이 들어 있었다.
 *
 *   이제 «고정 덩어리는 `캡션_공통.md` 한 곳»이다. 여기서 아무것도 덧붙이지 않는다.
 *   인스타는 맨 아래 해시태그 줄만 다섯 개로 갈아 끼운다 — 그것이 두 판의 «유일한» 차이다. */
const 인스타태그 = "#바이브코딩 #웹기획 #클로드코드 #클로드ai #1인창업";

/* ── 캡션을 «대본에서» 만든다 ────────────────────────────────────────
 *
 * 2026-08-17 사장님: 「캡션 내용도 같이 수정되어야지. 영상 내용이 수정되었잖아~」
 *
 * 전에는 `올릴글_*.md` 를 **파일째로** 캡션 칸에 부었다. 두 가지가 잘못됐다.
 *   ① 영상 자막을 고쳐도 캡션은 옛 이야기로 남았다 — 「뼈대」·「18년 기획하면서」가
 *      자막에서는 사라졌는데 유튜브 설명에는 그대로 있었다.
 *   ② 그 md 에는 «내 내부 메모»가 들어 있다. 「⚠ 원래 지시서엔…」이 손님 설명란에 갔다.
 *
 * ⚠ 그렇다고 **자막을 받아쓰면 안 된다.** 2026-08-17 에 그렇게 했다가 이 말을 들었다:
 *   「자막이 부족하니까 읽으라고 넣는게 캡션인데.. 그대로 받아쓰면 안되지~」
 *
 *   자막은 39.6초에 344자다. 캡션은 그 39.6초가 못 담은 것을 «읽으라고» 두는 자리다.
 *   길이도 결도 다르다 — 자막은 한 마디씩 끊고, 캡션은 문장으로 잇는다.
 *
 * 그래서 캡션은 대본 JSON 의 **`"캡션"` 칸에 따로 쓴다.** 자막 옆에 두니 영상을 고칠 때
 * 같이 보이고, 없으면 여기서 멈춘다 — 조용히 받아쓰기로 채우지 않는다.
 * 링크 세 줄과 해시태그는 고정이라 이 스크립트가 붙인다. */
/* ⭐⭐ 2026-08-17 다시 바뀌었다 — 캡션 «본문»은 편마다 쓰지 않고 **공통 틀 하나**를 쓴다.
 *
 *   사장님: 「우리 캡션에 하기 내용을 다 동일하게 넣는건 어떨까? 어차피 AI팩 소개하는거니까」
 *
 *   맞는 말이다. 영상은 편마다 다른 이야기를 하지만 캡션은 늘 «같은 물건»을 소개한다.
 *   편마다 새로 쓰면 AI팩이 무엇인지가 편마다 다르게 설명된다.
 *
 *   틀: `_마케팅/캡션_공통.md`. 편마다 다른 것은 «칸» 셋뿐이다 —
 *   `{{컨셉한줄}}` · `{{화면수}}` · `{{안적은메뉴}}`. 대본의 `"캡션값"` 에서 채운다.
 *   ⚠ 숫자는 **화면에 찍힌 값**을 쓴다. 2026-08-17 에 원고에 136 으로 적혀 있었는데
 *     화면에는 「총 146개 화면」이었다. 손으로 적은 숫자는 반드시 썩는다. */
const 공통틀길 = resolve(여기, "../캡션_공통.md");

function 캡션짜기(편: 대본 & { 캡션값?: Record<string, string>; 캡션머리?: string }): { 유튜브: string; 인스타: string } {
  if (!existsSync(공통틀길)) {
    console.error(`\n❌ 공통 캡션 틀이 없습니다: ${공통틀길}`);
    process.exit(1);
  }
  /* 맨 위 주석(<!-- -->)은 나에게 하는 말이라 손님에게 안 간다 — 통째로 뗀다.
     2026-08-17 에 내부 메모가 유튜브 설명란에 들어간 적이 있다. */
  let 본문 = readFileSync(공통틀길, "utf8").replace(/<!--[\s\S]*?-->\s*/g, "").trim();

  /* ⚠ 칸 이름이 한글이다. `\w` 는 A-Za-z0-9_ 만 잡아서 «한 칸도 안 바뀌고» 그대로 나간다 —
     게다가 빈칸 검사도 통과해 버려서 조용히 새어 나갔다 (8/17에 실제로). `[^}]+` 로 잡는다. */
  const 값 = 편.캡션값 ?? {};
  const 빈칸 = [...본문.matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1]).filter((k) => !값[k]?.trim());
  if (빈칸.length) {
    console.error(`\n❌ ${편.이름}: 캡션 칸이 비었습니다 — ${[...new Set(빈칸)].join(" · ")}`);
    console.error("   대본 JSON 에 이렇게 넣으세요:");
    console.error('   "캡션값": { "컨셉한줄": "나는 …", "화면수": "146", "안적은메뉴": "고객 지원, 커뮤니티" }');
    console.error("   ⚠ 숫자는 화면에 «찍힌» 값을 그대로 씁니다.");
    process.exit(1);
  }
  본문 = 본문.replace(/\{\{([^}]+)\}\}/g, (_, k: string) => 값[k]);

  /* ⭐ 위 3~5줄은 «편마다» 다르다 (2026-08-18 영상가이드 §4).
   *   아래 고정 블록만 내보내면 모든 편의 캡션이 한 글자도 안 다르다 —
   *   그 편에서 실제로 나온 숫자와 장면이 캡션에 하나도 안 남는다.
   *   대본의 `"캡션머리"` 에서 온다. 없으면 고정 블록만 나간다(옛 대본 호환). */
  const 머리 = (편.캡션머리 ?? "").trim();
  if (!머리) console.log(`⚠ ${편.이름}: 「캡션머리」가 비었습니다 — 캡션이 다른 편과 똑같이 나갑니다.`);
  const 다 = 머리 ? `${머리}\n\n${본문}` : 본문;

  /* 인스타는 «맨 아래 해시태그 줄만» 짧다. 그 줄을 통째로 갈아 끼운다 —
     뒤에 한 줄 더 붙이면 해시태그가 두 줄이 되고, 그게 「옛것이 붙는다」의 정체였다. */
  const 태그줄 = /^#.*$/m;
  if (!태그줄.test(다))
    console.log(`⚠ ${편.이름}: 캡션_공통.md 에 해시태그 줄이 없습니다 — 인스타 판이 유튜브와 같아집니다.`);
  return {
    유튜브: 다,
    인스타: 다.replace(태그줄, 인스타태그),
  };
}

const 대본들: 대본[] = JSON.parse(readFileSync(대본길, "utf8"));

/* ── 커버(맨 앞 2초 표지) ────────────────────────────────────────────
 * 2026-08-17 사장님: 「커버도 만들어서 검수기에 넣어줘」
 *
 * 커버 글은 대본이 아니라 `인트로설정_*.json` 의 `title` 에 있다. 상단 띠(`세로제목`)와
 * **따로 두는 것이 맞다** — 상단 띠는 63초 내내 떠 있고, 커버는 2초 안에 읽혀야 한다.
 * 그림은 구운 인트로(`인트로_*_916.mp4`)의 첫 프레임을 뜬다. 글만 고치면 줄이 넘쳤는지 모른다.
 *
 * 설정 파일은 3번째 인자로 받거나, 없으면 대본 옆의 `인트로설정_*.json` 중
 * `이름` 이 같은 것을 찾는다. 손으로 경로를 적게 하면 반드시 어긋난다. */
const 인트로길 = 올릴글길?.endsWith(".json") ? 올릴글길 : undefined;
if (올릴글길 && !인트로길) console.log("⚠ 올릴글 md 는 이제 캡션에 넣지 않습니다 — 캡션은 대본의 「캡션」 칸에서 옵니다.");

/* ⛔ 이 함수는 인트로설정 파일을 «스스로 찾아» 준다. 그런데 «어느 파일이었는지»를 안 돌려줘서,
   명령줄에 인트로를 안 준 회차는 DB 의 introPath 가 빈 채로 들어갔다.
   지킴이는 introPath 로 커버를 다시 굽는다 — 비어 있으면 커버를 영영 못 바꾼다.
   2026-08-20 에 운영자화면 편이 그래서 커버가 안 바뀌었다. 찾은 길을 같이 돌려준다. */
function 인트로설정(이름: string): { title?: string; cap?: string; 낼길?: string; 찾은길?: string } | undefined {
  const 후보 = 인트로길
    ? [인트로길]
    : readdirSync(dirname(resolve(대본길)))
        .filter((f) => f.startsWith("인트로설정_") && f.endsWith(".json"))
        .map((f) => join(dirname(resolve(대본길)), f));
  for (const 길 of 후보) {
    try {
      const 들 = JSON.parse(readFileSync(길, "utf8")) as { 이름?: string; title?: string; cap?: string; 낼길?: string }[];
      const 맞는 = 들.find((s) => s.이름 === 이름);
      if (맞는) return { ...맞는, 찾은길: 길 };
    } catch { /* 못 읽는 파일은 넘어간다 — 다른 것에서 찾으면 된다 */ }
  }
  return undefined;
}

for (const 편 of 대본들) {
  const 이름 = 편.이름!;
  const 칸들 = 편.칸들 ?? [];
  const 칸초 = 편.칸초 ?? 1.8;

  /* ⛔ 검사를 통과하지 못한 것은 보내지 않는다. */
  const 전부 = checkScript(편, 별명);
  /* 사유가 적힌 예외는 찍기만 하고 막지 않는다 (2026-08-18). */
  for (const g of 전부.filter((x) => x.넘어감)) console.log(`   ⏭ [${g.어디}] ${g.무엇}`);
  const 걸림 = 전부.filter((x) => !x.넘어감);
  if (걸림.length) {
    console.error(`\n❌ ${이름}: 자막검사에 ${걸림.length}건 걸려 있습니다. 고친 뒤에 보냅니다.`);
    for (const g of 걸림) console.error(`   [${g.어디}] ${g.무엇} → ${g.대신}`);
    process.exit(1);
  }

  const 영상 = join(구운방, `${이름}_916.mp4`);
  if (!캡션만 && !existsSync(영상)) {
    console.error(`\n❌ 구운 세로 영상이 없습니다: ${영상}`);
    console.error("   먼저 영상굽기.mjs 를 돌리세요 — 실제로 나갈 프레임을 뽑아야 합니다.");
    process.exit(1);
  }

  /* ⛔ «묵은 것» 을 내보내지 않는다 (2026-08-20 사장님).
     「커버와 상단 띠를 수정했는데 반영이 안되네 지킴이가 이부분은 안보는거 아닌지 확인 한번 해줘」
     — 맞다. 그때까지 지킴이는 파일이 «있는지» 만 봤지 «언제 구웠는지» 는 안 봤다.
     그래서 「예약화면 확인」편이 새벽 2시에 구운 커버를 그대로 달고 나갔다.
     틀을 고쳐도 다시 굽지 않으면 조용히 옛것이 나간다 — 영상 구멍은 검게 비어 있어서
     보기만 해서는 옛 틀인지 알 수 없다. 그래서 «시각»으로 잡는다.

     ⚠ 세 가지가 이 순서로 새것이어야 한다: 틀 → 본편(세로·가로) → 인트로. */
  if (!캡션만) {
    const 때 = (길: string) => (existsSync(길) ? statSync(길).mtimeMs : 0);
    const 언제 = (t: number) => new Date(t).toLocaleString("ko-KR");
    /* 틀마다 «무엇을» 굽는지가 다르다. 아무 틀에나 대면 애먼 것을 묵었다고 한다. */
    const 틀때 = (f: string) => 때(join(마케팅, f));
    const 본편틀 = Math.max(틀때("영상틀_916.html"), 틀때("영상틀_169.html"));
    const 커버틀 = 틀때("썸네일틀.html");
    const 가로 = join(구운방, `${이름}_169.mp4`);
    const 인트로 = 인트로설정(이름)?.낼길;

    const 묵음: string[] = [];
    for (const [무엇, 길] of (본편그대로 ? [] : [["세로 본편", 영상], ["가로 본편", 가로]]) as readonly (readonly [string, string])[]) {
      if (!existsSync(길)) { 묵음.push(`${무엇}이 없습니다`); continue; }
      if (때(길) < 본편틀) 묵음.push(`${무엇}(${언제(때(길))})이 영상틀(${언제(본편틀)})보다 옛것입니다`);
    }
    if (인트로 && existsSync(인트로)) {
      if (때(인트로) < 커버틀) 묵음.push(`커버(${언제(때(인트로))})가 썸네일틀(${언제(커버틀)})보다 옛것입니다`);
      if (때(인트로) < 때(영상)) 묵음.push(`커버(${언제(때(인트로))})가 세로 본편(${언제(때(영상))})보다 옛것입니다 — 본편을 다시 굽고 커버를 안 붙였습니다`);
    }

    if (묵음.length) {
      console.error(`
❌ ${이름}: 묵은 것이 섞여 있습니다.`);
      for (const m of 묵음) console.error(`   · ${m}`);
      console.error("   영상굽기.mjs → 영상인트로.mjs 를 «둘 다» 다시 돌린 뒤에 보냅니다.");
      process.exit(1);
    }
  }

  console.log(`\n== ${이름} — ${칸들.length}칸`);
  const 임시 = mkdtempSync(join(tmpdir(), "cc-review-"));
  try {
    /* ── 프레임 뽑기 — 칸 «가운데» 를 집는다(경계는 넘어가는 순간이라 흐리다) ── */
    const 프레임: string[] = [];
    for (let i = 0; !캡션만 && i < 칸들.length; i += 1) {
      const 때 = (i + 0.5) * 칸초;
      const 낼길 = join(임시, `${i + 1}.webp`);
      execFileSync("ffmpeg", [
        "-v", "error", "-i", 영상, "-ss", String(때), "-frames:v", "1",
        "-vf", "scale=405:-1", "-q:v", "72", 낼길, "-y",
      ]);
      프레임.push(`data:image/webp;base64,${readFileSync(낼길).toString("base64")}`);
    }
    const 총KB = Math.round(프레임.reduce((s, p) => s + p.length, 0) / 1024 * 0.75);
    if (프레임.length) console.log(`   프레임 ${프레임.length}장 (합쳐 ${총KB}KB)`);

    /* ── 커버 한 장 — 구운 인트로의 «1초 지점». 0초는 페이드가 걸려 흐릴 수 있다. ── */
    const 설정 = 인트로설정(이름);
    let 커버 = "";
    const 인트로영상 = 설정?.낼길;
    if (캡션만) {
      /* 캡션만 갈 때는 커버를 안 뜬다 — 쓰지도 않고, 인트로가 없어도 막히면 안 된다. */
    } else if (!설정) {
      console.log("   ⚠ 인트로설정을 못 찾아 커버를 못 넣었습니다 — 상단 띠 글만 갑니다.");
    } else if (!인트로영상 || !existsSync(인트로영상)) {
      console.log(`   ⚠ 구운 인트로가 없어 커버를 못 넣었습니다: ${인트로영상 ?? "(낼길 없음)"}`);
      console.log("      먼저 영상인트로.mjs 를 돌리세요.");
    } else {
      const 낼길 = join(임시, "cover.webp");
      execFileSync("ffmpeg", [
        "-v", "error", "-ss", "1", "-i", 인트로영상, "-frames:v", "1",
        "-vf", "scale=405:-1", "-q:v", "72", 낼길, "-y",
      ]);
      커버 = `data:image/webp;base64,${readFileSync(낼길).toString("base64")}`;
      console.log(`   커버 1장 (${Math.round(커버.length / 1024 * 0.75)}KB) · 「${(설정.title ?? "").replaceAll("|", " ")}」`);
    }

    /* ── DB 에 넣는다 — 같은 회차·같은 이름이면 덮어쓴다 ── */
    const 값 = {
      batch: 회차,
      slug: 이름,
      verticalTitle: 편.세로제목 ?? "",
      horizontalTitle: 편.가로제목 ?? "",
      coverTitle: 설정?.title ?? "",
      coverSub: 설정?.cap ?? "",
      /* ⭐ 검수 화면이 «영상을 바로 돌려 보게» 경로를 적어 둔다. 커버 붙인 것이 있으면 그것을 쓴다. */
      videoVertical: (인트로영상 && existsSync(인트로영상)) ? 인트로영상 : 영상,
      videoHorizontal: join(구운방, `${이름}_169.mp4`),
      /* ⭐ 지킴이가 다시 구우려면 «어느 대본에서 왔는지»를 알아야 한다 (2026-08-18). */
      scriptPath: resolve(대본길),
      /* 명령줄에 안 줬어도 스스로 찾은 길을 적는다 — 지킴이가 이걸 보고 커버를 다시 굽는다. */
      introPath: 인트로길 ? resolve(인트로길) : (설정?.찾은길 ? resolve(설정.찾은길) : ""),
      coverDataUri: 커버,
      ep: (편 as { ep?: string }).ep ?? "",
      music: (편 as { 음악?: string }).음악 ?? "",
      secPerCard: String(칸초),
      lengthExempt: (편 as { 길이예외?: string }).길이예외?.trim() ?? "",
      captionYoutube: 캡션짜기(편).유튜브,
      captionInstagram: 캡션짜기(편).인스타,
      hashtags: 해시태그,
      checkResult: "",
      updatedAt: new Date(),
    };


    /* ⭐ 인스타 캡션 길이를 잰다 (2026-09-02 사장님 지시).
     *   「인스타는 모두 포함하여 500000자 이하로 쓰도록 해줘」
     *   「저건 고정이고 캡션 내용을 매번 추가하잖아. 추가하는 내용까지 모두 포함해서」
     *
     *   ⭐ 재는 것은 «손님이 보는 그대로» 다 — 편마다 다른 머리글(캡션머리) + 고정 덩어리
     *     (캡션_공통.md) + 해시태그 줄까지 이어 붙인 뒤의 길이다. 조각을 따로 세지 않는다.
     *   ⚠ 참고로 인스타그램이 실제로 받는 길이는 2,200자다. 지금 우리 것은 800자 안팎이라
     *     둘 다 넉넉히 지난다. 막는 값은 사장님이 정하신 500,000자다. */
    const 인스타한도 = 500000;
    if (값.captionInstagram.length > 인스타한도) {
      console.error(`\n❌ ${이름}: 인스타 캡션이 ${값.captionInstagram.length}자입니다 — ${인스타한도}자 이하여야 합니다.`);
      console.error(`   머리글 ${((편 as { 캡션머리?: string }).캡션머리 ?? "").trim().length}자 + 고정 덩어리와 해시태그를 다 합친 길이입니다.`);
      process.exit(1);
    }

    const [있나] = await db
      .select({ id: snsContent.id, status: snsContent.status, updatedAt: snsContent.updatedAt })
      .from(snsContent)
      .where(and(eq(snsContent.batch, 회차), eq(snsContent.slug, 이름)));

    let contentId: string;
    if (있나) {
      /* ⚠ 사장님이 이미 검토 완료로 두신 것을 «검토 대기»로 되돌리지 않는다.
         루틴이 다시 돌면서 사장님 판단을 지우면 그게 제일 나쁘다.

         ⭐ 다만 --캡션만 은 지나간다 (2026-09-02 사장님 지시).
           「어제 올린 4개에 반영해 주고」 — 그중 영상19 는 이미 올라간 뒤였다.
           캡션만 가는 길은 상태도 영상도 칸도 안 건드린다. 사장님 판단을 지울 것이
           하나도 없으므로 막을 까닭이 없다.
         ⚠ 이미 유튜브에 올라간 편은 «DB 의 캡션»만 바뀐다. 유튜브 설명란은 그대로다 —
           거기까지 고치려면 유튜브에서 직접 손봐야 한다. 끝에 그 목록을 찍어 준다. */
      if (!캡션만 && (있나.status === "approved" || 있나.status === "published")) {
        console.log(`   이미 「${있나.status}」 입니다 — 건드리지 않고 넘어갑니다.`);
        continue;
      }
      if (캡션만 && 있나.status === "published") {
        console.log(`   ⚠ 이미 유튜브에 올라간 편입니다 — 검수기 캡션만 갑니다. 유튜브 설명란은 직접 고쳐 주세요.`);
      }

      /* ⛔⛔ 사장님이 검수 화면에서 «고친 뒤»면 덮어쓰지 않는다 (2026-08-17 사고).
       *
       *   그날 사장님이 제목·커버·캡션·자막을 다 고쳐 넣으셨는데, 내가 그 사이에
       *   이 스크립트를 세 번 돌렸다. 그러면서 칸을 지우고 새로 넣어 **row id 가 바뀌었고**,
       *   화면이 들고 있던 옛 id 로 저장이 나가 «아무것도 안 고치고 조용히 성공»했다.
       *   자막을 통째로 잃었다. 되돌릴 곳도 없었다 — DB 에 한 번도 안 쓰였으니까.
       *
       *   그래서 두 가지를 바꿨다.
       *     ① 칸을 지우지 않는다. ord 를 열쇠로 «고쳐 넣는다» — id 가 안 바뀐다.
       *     ② 마지막으로 보낸 뒤에 사장님이 손대신 흔적이 있으면 **멈춘다.**
       *        정말 덮어쓸 것이면 `--덮어쓰기` 를 붙인다. 실수는 멈추고, 뜻한 것은 지나간다. */
      const [마지막칸] = await db
        .select({ 때: snsCut.createdAt })
        .from(snsCut)
        .where(eq(snsCut.contentId, 있나.id))
        .orderBy(desc(snsCut.createdAt))
        .limit(1);
      const 손댔나 = 마지막칸 ? 있나.updatedAt.getTime() > 마지막칸.때.getTime() + 5000 : false;
      if (손댔나 && !덮어쓰기 && !자막만 && !캡션만) {
        console.log(`   ⛔ 검수 화면에서 고치신 흔적이 있습니다 (${있나.updatedAt.toISOString()}).`);
        console.log("      덮어쓰면 사장님이 쓰신 제목·커버·캡션·자막이 다 사라집니다. 멈춥니다.");
        console.log("      정말 덮어쓸 것이면 맨 뒤에 --덮어쓰기 를 붙이세요.");
        continue;
      }

      if (캡션만) {
        /* 캡션 두 칸만 간다. 제목·커버 글·올릴때·칸은 사장님 것 그대로 둔다. */
        await db
          .update(snsContent)
          .set({ captionYoutube: 값.captionYoutube, captionInstagram: 값.captionInstagram,
                 hashtags: 값.hashtags, updatedAt: new Date() })
          .where(eq(snsContent.id, 있나.id));
        console.log("   --캡션만 : 캡션 두 칸만 갈았습니다. 제목·커버·자막·칸은 그대로입니다.");
      } else if (자막만) {
        /* 커버 그림은 «영상 쪽» 값이라 같이 갱신한다. 글(coverTitle)은 안 건드린다. */
        /* ⚠ 커버 그림이 없으면 «지우지» 않는다. 빈 값으로 덮으면 있던 그림이 사라진다. */
        await db
          .update(snsContent)
          .set({ secPerCard: 값.secPerCard, videoVertical: 값.videoVertical, videoHorizontal: 값.videoHorizontal,
                 scriptPath: 값.scriptPath, introPath: 값.introPath,
                 ...(커버 ? { coverDataUri: 커버 } : {}), updatedAt: new Date() })
          .where(eq(snsContent.id, 있나.id));
        console.log("   --자막만 : 제목·커버 글·캡션·올릴때는 그대로 두고 칸만 갈아 넣습니다.");
      } else {
        await db.update(snsContent).set(값).where(eq(snsContent.id, 있나.id));
        console.log("   전에 보낸 것을 덮어썼습니다.");
      }
      contentId = 있나.id;
    } else if (캡션만) {
      /* 캡션만은 «이미 있는 것»을 고치는 길이다. 없는 것을 여기서 새로 만들면
         영상도 칸도 없는 껍데기가 검수 목록에 뜬다. */
      console.error(`   ⛔ ${이름} 이 이 회차(${회차})에 없습니다 — --캡션만 은 이미 있는 것만 고칩니다.`);
      process.exit(1);
    } else {
      const [새것] = await db.insert(snsContent).values(값).returning({ id: snsContent.id });
      contentId = 새것.id;
      console.log("   새로 넣었습니다.");
    }

    if (캡션만) {
      console.log(`   → https://www.caffeinecolor.com/admin/sns (또는 로컬 /admin/sns)`);
      continue;   /* try 안이라 아래 finally 는 그대로 돈다 — 임시 폴더는 치워진다 */
    }

    /* ⭐ 지우고 새로 넣지 않는다 — ord 를 열쇠로 «고쳐 넣는다».
       row id 가 그대로 남아야 검수 화면이 들고 있는 값과 어긋나지 않는다. */
    await db
      .insert(snsCut)
      .values(
        칸들.map((k, i) => {
          const 컷 = (k.shots ?? [])[0] ?? {};
          return {
            contentId,
            ord: i + 1,
            captionJson: JSON.stringify(k.cap ?? []),
            frameDataUri: 프레임[i] ?? "",
            pose: k.pose ?? "",
            clip: 컷.clip ?? "",
            ss: 컷.ss == null ? "" : String(컷.ss),
            zoom: 컷.zoom == null ? "" : String(컷.zoom),
            screenNote: "",
          };
        }),
      )
      .onConflictDoUpdate({
        target: [snsCut.contentId, snsCut.ord],
        set: {
          captionJson: sql`excluded.caption_json`,
          frameDataUri: sql`excluded.frame_data_uri`,
          pose: sql`excluded.pose`,
          clip: sql`excluded.clip`,
          ss: sql`excluded.ss`,
          zoom: sql`excluded.zoom`,
        },
      });
    /* 칸 수가 줄었으면 남는 꼬리만 지운다. */
    const 지운것 = await db
      .delete(snsCut)
      .where(and(eq(snsCut.contentId, contentId), gt(snsCut.ord, 칸들.length)))
      .returning({ ord: snsCut.ord });
    if (지운것.length) console.log(`   칸이 줄어 ${지운것.length}개를 지웠습니다.`);
    console.log(`   → https://www.caffeinecolor.com/admin/sns (또는 로컬 /admin/sns)`);
  } finally {
    rmSync(임시, { recursive: true, force: true });
  }
}

console.log("\n끝났습니다. 검수 화면에서 보시고 「검토 완료」를 누르시면 됩니다.\n");
process.exit(0);
