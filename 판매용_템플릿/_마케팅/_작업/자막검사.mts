/* 자막 검사기 — 대본 JSON 을 굽기 «전»에 통과해야 한다. (2026-08-17)
 *
 * 왜 만들었나
 *   2026-08-17 회차에서 사장님이 같은 영상을 세 번 돌려보내셨다.
 *   「얼굴이 나온다」·「뼈대를 고른다」·「혼자 만들면 꼭 빠지는 자리예요」·
 *   「18년 기획하면서」— 넷 다 지시서에 «이미 금지되어 있던» 것들이다.
 *   지시서는 1,000줄이고 규칙은 그 안에 흩어져 있었다. 읽고도 지키지 못했다.
 *   그래서 «읽어서 지키는 규칙»을 «세어서 막는 규칙»으로 바꿨다.
 *
 * ⚠ 규칙은 여기 없다 — `lib/sns-caption-rules.ts` 에 있다.
 *   검수 화면(`/admin/sns`)도 같은 파일을 본다. 두 곳에 두면 반드시 갈린다.
 *   그래서 이 파일은 `.mjs` 가 아니라 **`.mts`** 다(tsx 로 돌린다).
 *
 * 쓰는 법
 *   npx tsx "판매용_템플릿/_마케팅/_작업/자막검사.mts" <대본.json> [인트로설정.json]
 *   → 통과하면 0, 하나라도 걸리면 1 로 죽는다.
 *
 * ⚠ 검사기가 못 잡는 것이 하나 있다 — **자막이 «그 프레임에 실제로 보이는지».**
 *   그건 사람만 볼 수 있다. `/admin/sns` 에서 칸마다 프레임과 자막을 나란히 놓고 본다.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkScript, countLetters, type 대본, type 걸린것 } from "@/lib/sns-caption-rules";

const 여기 = dirname(fileURLToPath(import.meta.url));
const 고양이방 = resolve(여기, "../../_이미지/마스코트/낱장");

const 대본길 = process.argv[2];
const 인트로길 = process.argv[3];
if (!대본길) {
  console.error("쓰는 법: npx tsx 자막검사.mts <대본.json> [인트로설정.json]");
  process.exit(2);
}

/** 포즈 별명표 — 대본은 옛 이름(집중·똘망)을 부르고, 실제 파일은 대표_* 다.
 *  중복을 볼 때 «실제 파일»로 견뎌야 한다. 겉이름만 보면 안 잡힌다(8/17 사고). */
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

const 대본들: 대본[] = JSON.parse(readFileSync(대본길, "utf8"));
const 인트로들: { 이름?: string; 영상?: string; title?: string }[] =
  인트로길 && existsSync(인트로길) ? JSON.parse(readFileSync(인트로길, "utf8")) : [];

/* 커버 글도 «손님이 읽는 글»이다 — 금지어가 새면 안 된다. 대본에 붙여서 같이 검사한다. */
for (const 편 of 대본들) {
  const 짝 = 인트로들.find((s) => s.이름 === 편.이름);
  if (짝?.title) 편.커버제목 = 짝.title;
}

console.log(`\n자막 검사 — ${대본길}`);
console.log(`대본 ${대본들.length}편${인트로들.length ? ` · 인트로설정 ${인트로들.length}건` : ""}\n`);

/* ⛔ 2026-09-10 현님 지시 — «회차 작업 폴더를 남의 재료로 쓰지 마라».
 *
 *   현님: 「그 영상을 어딘가에 또 엮이게 사용하지는 말아줘. 예를들어 30번 영상을
 *         만드는데 21번 자료를 쓴다거나. 그러지 말아줘. 이것도 계속 생기는 거라
 *         어느 순간엔 지워야 할수도 있어.」
 *
 *   회차 폴더(`릴스영상/<회차>/` — 앞으로는 `릴스영상/_회차/<회차>/`)는 «작업대»다.
 *   틀그리기가 만들고 영상만들기가 채우는 자리이고, 계속 늘어나니 언젠가 통째로 지운다.
 *   그런데 한 편이라도 «남의 회차 산출물»을 clip 으로 물면 그 폴더가 못 지우는 것이 된다.
 *
 *   실제로 한 번 났다 — `대본_단추누르면어디로`(영상23)가 `10. 중고거래/디럭스_4x5.mp4` 를
 *   물고 있었다. 2026-09-10 에 그 폴더를 지우면서 대본이 통째로 깨졌고, 깃 밖 파일이라
 *   되돌릴 그물도 없었다(임시 자리에 남아 있어 겨우 되살렸다).
 *
 *   글로 적어 두면 또 난다. 그래서 «굽기 전 관문»이 센다.
 *   ⭐ 재료는 «촬영본»(`_촬영영상/…`)에서 가져온다. 구운 것에서 가져오지 않는다. */
const 회차방들 = (() => {
  const 뿌리 = "판매용_템플릿/_마케팅/릴스영상";
  const 모음: string[] = [];
  const 담기 = (터: string, 앞: string) => {
    let 것들; try { 것들 = readdirSync(터, { withFileTypes: true }); } catch { return; }
    for (const e of 것들) {
      if (!e.isDirectory() || !/^\d+\.\s/.test(e.name)) continue;
      모음.push(앞 ? `${앞}/${e.name}` : e.name);
    }
  };
  담기(뿌리, "");
  담기(`${뿌리}/_회차`, "_회차");   // 앞으로 모아 둘 자리
  return 모음;
})();

function 남의회차를쓰나(편: 대본): 걸린것[] {
  const 걸린: 걸린것[] = [];
  (편.칸들 ?? []).forEach((k, i) => {
    for (const s of k.shots ?? []) {
      const c = String(s.clip ?? "");
      if (!c) continue;
      const 문 = 회차방들.find((n) => c.startsWith(`${n}/`) || c.includes(`릴스영상/${n}/`));
      if (!문) continue;
      걸린.push({
        어디: "남의 회차 재료",
        무엇: `${i + 1}번 칸이 «${문}» 의 산출물을 물고 있습니다 — ${c}`,
        대신: "촬영본에서 가져옵니다 — `_촬영영상/…`",
        왜: "회차 폴더는 «작업대»라 언젠가 통째로 지운다. 물고 있으면 그때 이 편이 깨진다 (9/10 현님)",
        칸: i + 1,
      });
    }
  });
  return 걸린;
}

/* ⛔ 그림이 모자란 칸 — 2026-09-10 에 실제로 났다.
 *
 *   `대본_terminal` 이 57.6초짜리 녹화본에 `ss: 57` 을 세 칸, `ss: 56` 을 한 칸 적었다.
 *   한 칸은 2.5초인데 남은 그림이 0.57초·1.57초뿐이라, 네 칸(10초 자리)에 그림 6.3초가
 *   비어 있었다. 그중 하나는 마무리 CTA 칸이었다.
 *
 *   ⚠ 그런데 이 검사기가 «통과»시켰다. ss 가 원본 길이를 넘는지 아무도 안 봤기 때문이다.
 *   `lib/sns-caption-rules.ts` 는 파일을 못 열어서(웹에서도 도는 코드다) 여기서 센다.
 *   ffprobe 로 길이를 재고, 못 재면 «조용히 넘기지 않고» 그렇다고 말한다.
 *
 *   ⭐ 오늘 배운 것과 같다 — 세지 않는 값은 없는 값과 같다. 글로 적어 두면 또 난다. */
const 길이잰것 = new Map<string, number | null>();
function 녹화본길이(길: string): number | null {
  if (길이잰것.has(길)) return 길이잰것.get(길)!;
  let 초: number | null = null;
  try {
    const 값 = execFileSync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1", 길,
    ], { encoding: "utf8", timeout: 20000 }).trim();
    const n = Number(값);
    초 = Number.isFinite(n) && n > 0 ? n : null;
  } catch { 초 = null; }
  길이잰것.set(길, 초);
  return 초;
}

function 그림이모자라나(편: 대본): 걸린것[] {
  const 걸린: 걸린것[] = [];
  const 칸초 = 편.칸초 ?? 2.5;
  const 릴스 = "판매용_템플릿/_마케팅/릴스영상";
  (편.칸들 ?? []).forEach((k, i) => {
    const 컷들 = k.shots ?? [];
    if (!컷들.length) return;
    /* 한 칸에 컷이 여럿이면 칸초를 나눠 쓴다 */
    const 컷초 = 칸초 / 컷들.length;
    for (const s of 컷들) {
      const c = String(s.clip ?? "");
      if (!c) continue;
      const 길 = join(릴스, c);
      if (!existsSync(길)) {
        걸린.push({
          어디: "녹화본이 없다",
          무엇: `${i + 1}번 칸이 부르는 ${c} 가 없습니다`,
          대신: "`node _작업/녹화본목록.mjs` 로 있는 것을 세어 고릅니다",
          왜: "굽는 쪽이 그 자리에서 죽는다",
          칸: i + 1,
        });
        continue;
      }
      const 총 = 녹화본길이(길);
      if (총 == null) {
        걸린.push({
          어디: "길이를 못 쟀다",
          무엇: `${i + 1}번 칸의 ${c} 길이를 ffprobe 로 못 쟀습니다`,
          대신: "ffprobe 가 도는지 보고 다시 돌립니다",
          왜: "못 재면 «그림이 모자란 칸»을 못 잡는다 — 조용히 넘기지 않는다",
          칸: i + 1,
        });
        continue;
      }
      /* 굽는 쪽과 «같은 눈금»으로 조인다 — 영상굽기.mjs:500 */
      const 배속 = Math.min(8, Math.max(0.2, Number(s.배속) || 1));
      const 쓸것 = 컷초 * 배속;              /* 원본에서 실제로 읽어 가는 길이 */
      const 남은것 = 총 - (Number(s.ss) || 0);
      if (남은것 + 0.05 >= 쓸것) continue;   /* 프레임 반올림만큼은 봐준다 */
      걸린.push({
        어디: "그림이 모자란다",
        무엇: `${i + 1}번 칸 — ${c} 는 ${총.toFixed(1)}초인데 ss ${s.ss} 라 ${남은것.toFixed(2)}초만 남습니다 (${쓸것.toFixed(2)}초 필요)`,
        대신: `ss 를 ${Math.max(0, 총 - 쓸것).toFixed(1)} 이하로 내리거나 다른 구간을 고릅니다`,
        왜: "모자란 만큼 그 칸이 «빈 그림»으로 나간다 (2026-09-10 에 네 칸 6.3초가 비었다)",
        칸: i + 1,
      });
    }
  });
  return 걸린;
}

let 탈락 = 0;
for (const 편 of 대본들) {
  const 이름 = 편.이름 ?? "(이름 없음)";
  let 걸림 = checkScript(편, 별명);
  걸림 = [...걸림, ...남의회차를쓰나(편), ...그림이모자라나(편)];
  const 칸수 = (편.칸들 ?? []).length;
  const 길이 = (칸수 * (편.칸초 ?? 2.5)).toFixed(1);
  console.log(`— ${이름}: ${칸수}칸 · ${길이}초 · 공백 제외 ${countLetters(편.칸들 ?? [])}자`);
  /* 사유가 적힌 예외는 «알리되 막지 않는다» — 막으면 사유를 적은 뜻이 없다 (2026-08-18). */
  const 넘어간것 = 걸림.filter((g) => g.넘어감);
  걸림 = 걸림.filter((g) => !g.넘어감);
  for (const g of 넘어간것) console.log(`  ⏭ ${g.어디}
     ${g.무엇}`);
  if (!걸림.length) {
    console.log("  ✅ 통과\n");
    continue;
  }
  탈락 += 걸림.length;
  const 묶음 = new Map<string, typeof 걸림>();
  for (const g of 걸림) {
    if (!묶음.has(g.어디)) 묶음.set(g.어디, []);
    묶음.get(g.어디)!.push(g);
  }
  for (const [어디, 떼] of 묶음) {
    console.log(`  ❌ ${어디}`);
    for (const g of 떼) console.log(`     ${g.무엇}\n       → ${g.대신}\n       까닭: ${g.왜}`);
  }
  console.log("");
}

if (!탈락) {
  console.log("✅ 다 통과했습니다.");
  console.log("⚠ 다만 «자막이 그 프레임에 실제로 보이는지»는 검사기가 못 봅니다 — /admin/sns 에서 눈으로 봅니다.\n");
  process.exit(0);
}
console.log(`걸린 것 ${탈락}건. **고친 뒤에 굽습니다.**`);
console.log("⚠ 금지어를 피하려고 뜻을 흐리지 마라 — 「대신」 칸에 적힌 그 말로 바꾼다.\n");
process.exit(1);
