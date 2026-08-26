/* 검수기에서 «사장님이 승인하신» 회차의 자막을 모아 본보기로 남긴다. (2026-08-18 사장님 지시)
 *
 *   npx tsx "판매용_템플릿/_마케팅/_작업/본보기모으기.mts"
 *
 * 왜 만들었나
 *   사장님: 「그럼 내가 검수한 내용들이 점점 토대가 되어 루틴에서 콘텐츠 만들 때 참고하게 되겠지?」
 *
 *   그렇게 되려면 «어딘가에 쌓여 있어야» 한다. 승인된 자막은 지금 DB 안에만 있고,
 *   다음 편을 쓰는 사람(나)은 그걸 안 읽는다. 그래서 파일로 뽑아 `_마케팅/` 에 둔다 —
 *   영상가이드가 「본보기를 보고 쓴다」로 가리키는 그 파일이다.
 *
 * ⭐ 여기 담기는 것은 **사장님이 고쳐 쓰신 문장**이다. 내가 처음 쓴 초안이 아니다.
 *   그게 제일 센 본보기다 — 말투·끊는 자리·숫자 쓰는 법이 다 들어 있다.
 *
 * ⚠ 「검토대기(waiting)」는 안 담는다. 아직 안 보신 글이라 본보기가 아니다.
 * ⚠ 이 파일은 «덮어쓴다». 손으로 고치지 마라 — 고칠 것이 있으면 검수기에서 고치고 다시 돌린다.
 *   (그래서 맨 위에 그렇게 적어 둔다. 옛날에 손으로 고친 파일이 조용히 되돌아간 적이 있다.)
 */
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { inArray, eq, desc } from "drizzle-orm";

config({ path: ".env.local" });
const { db } = await import("@/db/client");
const { snsContent, snsCut } = await import("@/db/schema");
const { 상태말 } = await import("@/lib/sns-status");

const 여기 = dirname(fileURLToPath(import.meta.url));
const 낼길 = resolve(여기, "../본보기_자막.md");

/** 승인 뒤의 상태만 본보기다. waiting 은 아직 사장님 손을 안 탄 글이다. */
const 담을상태 = ["approved", "final", "published"];

const 벗기기 = (s: string) => s.replace(/<[^>]*>/g, "");
const 글자수 = (s: string) => 벗기기(s).replace(/\s/g, "").length;

const 편들 = await db
  .select()
  .from(snsContent)
  .where(inArray(snsContent.status, 담을상태))
  .orderBy(desc(snsContent.approvedAt));

if (!편들.length) {
  console.log("승인된 편이 아직 없습니다 — 본보기 파일은 그대로 둡니다.");
  process.exit(0);
}

const 조각: string[] = [
  "# 본보기 자막 — 승인된 회차",
  "",
  "> ⚠ **이 파일은 손으로 고치지 마세요.** 검수기(`/admin/sns`)에서 고치고",
  "> `npx tsx \"판매용_템플릿/_마케팅/_작업/본보기모으기.mts\"` 를 다시 돌리면 덮어써집니다.",
  "",
  "새 편의 자막을 쓰기 전에 여기를 먼저 읽는다. 아래 문장들은 **사장님이 검수기에서",
  "실제로 고쳐 쓰신 글**이다 — 말투도, 문장을 어디서 끊었는지도, 숫자를 어떻게 적는지도",
  "여기에 다 들어 있다. 규칙(길이·초당 글자)은 `영상가이드.md` 와 `lib/sns-caption-rules.ts` 가 센다.",
  "",
  `모은 날 ${new Date().toISOString().slice(0, 10)} · ${편들.length}편`,
  "",
];

for (const 편 of 편들) {
  const 칸들 = await db.select().from(snsCut).where(eq(snsCut.contentId, 편.id)).orderBy(snsCut.ord);
  const 칸초 = Number(편.secPerCard) || 3.0;
  const 길이 = +(칸들.length * 칸초).toFixed(1);
  const 온글 = 칸들.map((c) => (JSON.parse(c.captionJson || "[]") as string[]).join(" ")).join(" ");
  const 초당 = 길이 ? +(글자수(온글) / 길이).toFixed(1) : 0;
  const 상태 = 상태말[편.status]?.글 ?? 편.status;

  조각.push(
    "---",
    "",
    `## ${편.batch} · ${벗기기(편.coverTitle || 편.verticalTitle).replace(/\|/g, " ")}`,
    "",
    `- 상태 **${상태}** · ${편.ep || "-"}`,
    `- ${칸들.length}칸 × ${칸초}초 = **${길이}초** · 공백 제외 ${글자수(온글)}자 · **초당 ${초당}자**`,
    `- 상단 띠: ${벗기기(편.verticalTitle).replace(/\|/g, " / ")}`,
    `- 커버: ${벗기기(편.coverTitle).replace(/\|/g, " / ")}${편.coverSub ? ` · 부제 ${벗기기(편.coverSub)}` : ""}`,
    "",
    "### 자막",
    "",
  );
  for (const c of 칸들) {
    const 줄들 = JSON.parse(c.captionJson || "[]") as string[];
    if (!줄들.length) continue;
    조각.push(`${c.ord}. ${벗기기(줄들.join(" / "))}`);
  }
  /* 캡션은 «위 3~5줄»만 담는다 — 아래 고정 블록은 편마다 똑같아서 본보기가 안 된다. */
  const 머리 = (편.captionYoutube || "").split("📍")[0].trim();
  if (머리) 조각.push("", "### 캡션 (위 3~5줄)", "", ...머리.split("\n").filter(Boolean).map((l) => `> ${l}`));
  조각.push("");
}

writeFileSync(낼길, 조각.join("\n"), "utf8");
console.log(`✅ ${편들.length}편을 모았습니다 → ${낼길}`);
for (const 편 of 편들) console.log(`   · ${편.batch} · ${편.slug} (${상태말[편.status]?.글 ?? 편.status})`);
process.exit(0);
