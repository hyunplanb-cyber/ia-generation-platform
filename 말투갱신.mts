/* 올린 영상의 제목·자막을 읽어 말투 파일(Output style)의 본보기와 잰 값을 다시 쓴다.
 *
 * 왜 있나 — 2026-09-01 사장님 지시. 「앞으로도 자막을 Output style로 계속 남겨줘」
 *
 *   말투를 잡는 데는 금지어보다 «본보기»가 세다. 그런데 본보기를 손으로 옮겨 적으면
 *   반드시 묵는다 — 이 저장소가 여러 번 겪은 일이다(썸네일·시각표·배점표).
 *   그래서 «올라간 글»에서 그때그때 다시 뽑는다.
 *
 *   ⭐ 담는 것은 «사장님 글»뿐이다. 둘을 담는다 —
 *     ① status=published — 승인해서 실제로 나간 것
 *     ② 아직 검토대기라도 **사장님이 검수기에서 손댄 것** (2026-09-01 사장님 지시)
 *        「영상19 내용 수정했어. 이것도 본보기로 넣어서」
 *
 *   손댄 것을 아는 법은 `검수보내기.mts` 와 같은 신호를 쓴다 —
 *   편의 `updatedAt` 이 마지막 칸의 `createdAt` 보다 5초 넘게 뒤면 사장님이 고치신 것이다.
 *   ⛔ 내가 쓰고 아무도 안 만진 글은 담지 않는다. 그건 본보기가 아니라 내 버릇이다.
 *
 * 쓰는 법
 *   npx tsx 말투갱신.mts          # 다시 쓴다
 *   npx tsx 말투갱신.mts --보기   # 무엇이 바뀌는지만 찍고 파일은 안 건드린다
 *
 * ⚠ 파일에서 «다시 쓰는 자리»는 표시 사이뿐이다. 그 밖의 규칙은 손으로 쓴 것이라 안 건드린다.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const 말투길 = ".claude/output-styles/카페인컬러-말투.md";
const 시작표시 = "<!-- ⬇ 여기부터 말투갱신.mts 가 다시 씁니다. 손으로 고치지 마세요 -->";
const 끝표시 = "<!-- ⬆ 여기까지 -->";
const 보기만 = process.argv.includes("--보기");

const { db } = await import("./db/client");
const { snsContent, snsCut } = await import("./db/schema");
const { eq, asc, desc } = await import("drizzle-orm");

/** 표시(span)를 «» 로 바꾸고 나머지 태그는 지운다. 강조는 살려야 본보기 구실을 한다. */
const 다듬기 = (s: string) =>
  s
    .replace(/<span class='o'>(.*?)<\/span>/g, "«$1»")
    .replace(/<span class='t'>(.*?)<\/span>/g, "«$1»")
    .replace(/<[^>]+>/g, "")
    .trim();

const 모든편 = await db.select().from(snsContent);
const 편들: typeof 모든편 = [];
let 손댄편 = 0;
for (const p of 모든편) {
  if (p.status === "published") {
    편들.push(p);
    continue;
  }
  /* 검수보내기와 같은 신호 — 편을 고친 시각이 마지막 칸을 넣은 시각보다 뒤면 사장님이 손댄 것이다. */
  const [끝칸] = await db
    .select({ 때: snsCut.createdAt })
    .from(snsCut)
    .where(eq(snsCut.contentId, p.id))
    .orderBy(desc(snsCut.createdAt))
    .limit(1);
  if (끝칸 && p.updatedAt.getTime() > 끝칸.때.getTime() + 5000) {
    편들.push(p);
    손댄편 += 1;
  }
}
if (!편들.length) {
  console.log("담을 사장님 글이 없습니다. 그만둡니다.");
  process.exit(0);
}

type 칸 = { 편: string; 줄: string[] };
const 모든칸: 칸[] = [];
const 제목들: string[] = [];

for (const p of 편들) {
  제목들.push(다듬기(p.verticalTitle).replace(/\|/g, " ").replace(/\s+/g, " ").trim());
  const 칸들 = await db.select().from(snsCut).where(eq(snsCut.contentId, p.id)).orderBy(asc(snsCut.ord));
  칸들.forEach((c, i) => {
    let 줄: string[] = [];
    try {
      줄 = (JSON.parse(c.captionJson) as string[]).map(다듬기).filter(Boolean);
    } catch {
      return;
    }
    /* 마지막 칸은 어느 편이나 같은 CTA다. 본보기로도 셈으로도 쓰지 않는다. */
    if (i === 칸들.length - 1 && 줄.some((l) => l.includes("프로필 링크"))) return;
    if (줄.length) 모든칸.push({ 편: p.slug, 줄 });
  });
}

/* ── 센다 ─────────────────────────────────────────────── */
const 모든줄 = 모든칸.flatMap((k) => k.줄);
const 글자수 = (s: string) => s.replace(/[\s«»]/g, "").length;
const 길이 = 모든줄.map(글자수).sort((a, b) => a - b);
const 가운데 = 길이[Math.floor(길이.length / 2)];

const 어미셈 = new Map<string, number>();
for (const l of 모든줄) {
  const m = l.match(/(더라고요|거든요|잖아요|았어요|였어요|습니다|고요|예요|에요|어요|아요|해요|세요|죠)[.,!?]?$/);
  if (m) 어미셈.set(m[1], (어미셈.get(m[1]) ?? 0) + 1);
}
const 어미 = [...어미셈.entries()].sort((a, b) => b[1] - a[1]);

const 문어체 = ["또한", "이를 통해", "이러한", "이처럼", "게다가", "더욱이", "결론적으로", "뿐만 아니라", "마침내"];
const 구어 = ["그런데", "그래서", "그렇게", "결국", "반대로", "근데"];
const 세기 = (말: string) => 모든줄.filter((l) => l.includes(말)).length;
const 문어체합 = 문어체.reduce((s, w) => s + 세기(w), 0);
const 구어쓴것 = 구어.map((w) => [w, 세기(w)] as const).filter(([, n]) => n > 0);
const 숫자줄 = 모든줄.filter((l) => /\d/.test(l)).length;

const 제목길이 = 제목들.map(글자수).sort((a, b) => a - b);
const 물음제목 = 제목들.filter((t) => t.includes("?")).length;
const 숫자제목 = 제목들.filter((t) => /\d/.test(t)).length;

/* ── 본보기를 고른다 ───────────────────────────────────
   손으로 고르면 묵는다. 그래서 «규칙으로» 뽑는다 —
     ① 편마다 «첫 칸» — 어떻게 여는지가 말투에서 제일 크다
     ② 편마다 «가장 짧은 칸» — 리듬을 보여 준다
   두 줄짜리 칸만 쓴다. 한 줄이나 세 줄은 본보기로 헷갈린다. */
const 뽑기: string[][] = [];
const 본것 = new Set<string>();
for (const p of 편들) {
  const 그편 = 모든칸.filter((k) => k.편 === p.slug && k.줄.length === 2);
  if (!그편.length) continue;
  const 첫칸 = 그편[0];
  const 짧은칸 = [...그편].sort((a, b) => 글자수(a.줄.join("")) - 글자수(b.줄.join("")))[0];
  for (const k of [첫칸, 짧은칸]) {
    const 열쇠 = k.줄.join("|");
    if (본것.has(열쇠)) continue;
    본것.add(열쇠);
    뽑기.push(k.줄);
  }
}

/* ── 새로 쓸 토막 ─────────────────────────────────────── */
const 줄들: string[] = [];
/* ⚠ toISOString 은 UTC 다 — 한국 새벽에 돌리면 «어제»로 찍힌다.
   이 날짜는 본보기가 얼마나 새것인지 보는 값이라, 하루 어긋나면 뜻이 흐려진다.
   저장소의 다른 곳(지킴이·검수보내기)도 다 Asia/Seoul 로 적는다. */
const 오늘 = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
줄들.push(시작표시);
줄들.push("");
줄들.push(`## 본보기 — 이미 올린 영상 ${편들.length}편에서 그대로 가져왔다`);
줄들.push("");
줄들.push(`지어낸 것이 하나도 없다. 사장님이 승인해 나갔거나 검수기에서 직접 고치신 글이다.`);
줄들.push(`편마다 «첫 칸»(어떻게 여는지)과 «가장 짧은 칸»(리듬)을 뽑았다. ${오늘} 기준.`);
줄들.push("");
줄들.push("### 자막");
줄들.push("");
for (const k of 뽑기) {
  줄들.push("> " + k[0]);
  줄들.push("> " + k[1]);
  줄들.push("");
}
줄들.push("### 제목");
줄들.push("");
for (const t of 제목들) 줄들.push("> " + t);
줄들.push("");
줄들.push("## 위 글을 세어서 나온 값 — 감이 아니라 잰 것이다");
줄들.push("");
줄들.push(`자막 ${모든줄.length}줄 · 제목 ${제목들.length}개를 센 결과다.`);
줄들.push("");
줄들.push("| 무엇 | 잰 값 | 그래서 |");
줄들.push("|---|---|---|");
줄들.push(`| 한 줄 길이 | 가장 짧은 ${길이[0]}자 · 가운데 **${가운데}자** · 가장 긴 ${길이[길이.length - 1]}자 | 짧다. ${길이[길이.length - 1]}자를 넘기면 자른다 |`);
줄들.push(`| 말끝 | ${어미.slice(0, 5).map(([k, v]) => `~${k} ${v}`).join(" · ")} | 해요체다. ~습니다로 닫지 않는다 |`);
줄들.push(`| 문어체 접속부사 | **${문어체합}회** | ${문어체.join(" · ")} 를 쓰지 않는다 |`);
줄들.push(`| 구어 접속사 | ${구어쓴것.map(([w, n]) => `${w} ${n}`).join(" · ") || "안 씀"} | 이건 쓴다. 다만 아껴 쓴다 |`);
줄들.push(`| 숫자가 든 줄 | ${모든줄.length}줄 중 ${숫자줄}줄 | ${Math.round(모든줄.length / Math.max(1, 숫자줄))}줄에 한 번은 잰 값이 나온다 |`);
줄들.push(`| 제목 길이 | ${제목길이[0]}~${제목길이[제목길이.length - 1]}자 | 부제를 콜론으로 달지 않는다 |`);
줄들.push(`| 제목 꼴 | ${제목들.length}개 중 ${물음제목}개가 물음 · ${숫자제목}개에 숫자 | 물어보거나 숫자를 앞세운다 |`);
줄들.push("");
줄들.push(끝표시);
const 새토막 = 줄들.join("\n");

/* ── 파일에 끼운다 ────────────────────────────────────── */
if (!existsSync(말투길)) {
  console.error("말투 파일이 없습니다: " + 말투길);
  process.exit(1);
}
const 옛글 = readFileSync(말투길, "utf8");
const a = 옛글.indexOf(시작표시);
const b = 옛글.indexOf(끝표시);

console.log(`사장님 글 ${편들.length}편(올린 것 ${편들.length-손댄편} · 손대신 것 ${손댄편}) · 자막 ${모든줄.length}줄 · 본보기 ${뽑기.length}개`);
console.log(`한 줄 길이 ${길이[0]}~${길이[길이.length - 1]}(가운데 ${가운데}) · 문어체 접속부사 ${문어체합}회`);

if (보기만) {
  console.log("\n─── 이렇게 씁니다 ───\n");
  console.log(새토막);
  process.exit(0);
}

let 낼글: string;
if (a >= 0 && b > a) {
  낼글 = 옛글.slice(0, a) + 새토막 + 옛글.slice(b + 끝표시.length);
} else {
  console.error("표시를 못 찾았습니다. 말투 파일에 아래 두 줄이 있어야 합니다:");
  console.error("  " + 시작표시);
  console.error("  " + 끝표시);
  process.exit(1);
}
writeFileSync(말투길, 낼글, "utf8");
console.log("\n✓ " + 말투길 + " 을 다시 썼습니다.");
console.log("⚠ Output style 은 새 세션이나 /clear 부터 먹습니다.");
