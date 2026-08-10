/* 팩을 처음부터 끝까지 다시 굽는다.
 *
 * 왜 만드나
 *   2026-08-08 에 카드 폭 계산을 고치고 「팩 다시 구웠다」고 했는데 반만 맞았다.
 *   디자인프리셋만 다시 굽고 스펙팩(07)을 만드는 build-template 은 안 돌렸다.
 *   판매팩 20칸이 전부 옛 CSS 를 들고 있었고, 우연히 다른 검색을 하다가 걸렸다.
 *
 *   순서를 글로 적어두면 또 빠뜨린다. 그래서 코드로 묶는다.
 *
 * 도는 순서 — 앞이 뒤의 재료다. 하나라도 건너뛰면 옛 값이 남는다.
 *   0. check-presets       글과 코드가 싸우면 여기서 멈춘다
 *   1. build-template      화면 목록·기능정의서·스펙팩(07) …  ← 여기를 빠뜨렸었다
 *   2. build-template-deep 상세 IA 판(3뎁스)
 *   3. build-design-presets 색·레이아웃 가이드
 *   4. package-template    20칸으로 포장
 *   5. package-free-sample 무료 샘플 zip + 홈페이지가 내려줄 데이터
 *
 * 완성화면은 사람이 만든 것이라 전후로 지문을 떠서 확인한다.
 * 전에 두 번 잃은 적이 있다. 한 글자라도 달라지면 크게 알린다.
 *
 * 쓰는 법
 *   npx tsx build-all.mts          전부
 *   npx tsx build-all.mts lms      한 업종만 (포장까지는 같이 돈다)
 */
import { execFileSync } from "node:child_process";
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

/* npx 를 부르지 않는다.
   shell:true 를 쓰면 노드가 「인자가 그대로 이어 붙어 위험하다」고 경고하고,
   shell 없이 npx.cmd 를 부르면 이 환경에서는 아예 못 찾는다(오류 메시지도 안 나온다).
   tsx 는 어차피 node_modules 안에 있으므로 노드로 직접 부른다 — 가장 확실하다. */
const TSX = "node_modules/tsx/dist/cli.mjs";

/* 파는 업종만 굽는다.
 *
 * admin(비즈니스관리)은 보류함에 있다 — 주제가 모호해서 팔지 않기로 했다.
 * 그런데 여기 이름이 남아 있어서 매번 다시 구워졌고, 팔지도 않는 팩이
 * 판매팩 폴더에 25번째 칸으로 서 있었다. 파는 목록(lib/packages.ts)에는
 * 없으니 조용히 있을 뿐, 언젠가 「팩이 25개네」로 읽힐 자리였다.
 *
 * 재료(template-data-admin.ts)와 만들어 뒀던 37화면은 지우지 않는다 —
 * 관리자 화면 서비스를 열 때 참고한다. 깃 역사(1c8adbe)에 그대로 있다.
 * 다시 구울 일이 생기면 `npx tsx build-all.mts admin` 으로 이름을 대면 된다. */
const 업종들 = ["lms", "beauty", "travel", "matching", "groupbuy", "rental"] as const;
const 보류업종들 = ["admin"];
const 고른업종 = process.argv[2];
const 돌릴것 = 고른업종 ? [고른업종] : [...업종들];

if (고른업종 && !업종들.includes(고른업종 as (typeof 업종들)[number]) && !보류업종들.includes(고른업종)) {
  console.error(`업종 「${고른업종}」이 없습니다. 있는 것: ${업종들.join(", ")}`);
  console.error(`보류함(이름을 대야만 굽는다): ${보류업종들.join(", ")}`);
  process.exit(1);
}

/** 사람이 만든 완성화면의 지문. 파일 이름과 크기만으로 충분하다. */
function 완성화면지문(): { 수: number; 지문: string; 목록: string[] } {
  const 목록: string[] = [];
  (function 훑기(d: string) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) 훑기(p);
      else if (p.includes("완성화면")) 목록.push(`${p}|${statSync(p).size}`);
    }
  })("판매용_템플릿");
  목록.sort();
  return { 수: 목록.length, 지문: createHash("sha1").update(목록.join("\n")).digest("hex").slice(0, 16), 목록 };
}

function 돌리기(설명: string, 파일: string, 인자: string[] = []) {
  process.stdout.write(`  ${설명} … `);
  try {
    execFileSync(process.execPath, [TSX, 파일, ...인자], { stdio: "pipe", encoding: "utf8" });
    console.log("됨");
  } catch (e: unknown) {
    console.log("실패");
    /* 스크립트가 죽으면 stdout·stderr 에 까닭이 있고,
       아예 실행이 안 되면 그 둘이 비어 있고 message 에만 있다. 둘 다 낸다. */
    const 오류 = e as { stdout?: string; stderr?: string; message?: string };
    const 속 = `${오류.stdout ?? ""}${오류.stderr ?? ""}`.trim() || (오류.message ?? "까닭을 알 수 없습니다");
    console.error(`\n${속}`.split("\n").slice(0, 12).join("\n"));
    process.exit(1);
  }
}

console.log(`\n팩 다시 굽기 — ${돌릴것.join(" · ")}\n`);

// ── 0. 글과 코드가 같은 말을 하는지 ──────────────────────────
console.log("0. 가이드 대조");
돌리기("문서와 코드", "check-presets.mts");

// ── 완성화면 지문 (전) ──────────────────────────────────────
const 전 = 완성화면지문();
console.log(`\n   완성화면 ${전.수}개 · ${전.지문}  (건드리지 않습니다)\n`);

// ── 1~3. 재료 만들기 ────────────────────────────────────────
console.log("1. 화면 목록·기능정의서·스펙팩");
for (const k of 돌릴것) 돌리기(k, "build-template.mts", [k]);

console.log("\n2. 상세 IA 판");
for (const k of 돌릴것) 돌리기(k, "build-template-deep.mts", [k]);

console.log("\n3. 색·레이아웃 가이드");
for (const k of 돌릴것) 돌리기(k, "build-design-presets.mts", [k]);

// ── 4~5. 포장 ───────────────────────────────────────────────
// 칸 수를 여기 적지 않는다 — 늘 때마다 여기만 옛 숫자로 남는다.
// 실제로 몇 칸인지는 package-template 이 세어서 말한다.
console.log("\n4. 판매팩 포장");
돌리기("판매팩", "package-template.mts");

console.log("\n5. 무료 샘플");
돌리기("문서", "build-template.mts", ["creator"]);
돌리기("zip · 홈페이지 데이터", "package-free-sample.mts");

// ── 완성화면 지문 (후) ──────────────────────────────────────
const 후 = 완성화면지문();
console.log("");
if (전.지문 === 후.지문) {
  console.log(`✅ 완성화면 ${후.수}개 그대로입니다 (${후.지문})`);
} else {
  const 없어짐 = 전.목록.filter((x) => !후.목록.includes(x));
  console.error(`\n⚠️  완성화면이 달라졌습니다  ${전.수}개 → ${후.수}개`);
  if (없어짐.length) {
    console.error(`   없어진 것 ${없어짐.length}개:`);
    없어짐.slice(0, 10).forEach((x) => console.error(`     ${x.split("|")[0]}`));
  }
  console.error("   사람이 만든 화면입니다. 지우지 마세요. git 으로 되돌리세요.");
  process.exit(1);
}

// ── 새 값이 정말 들어갔는지 ─────────────────────────────────
const 팩들 = readdirSync("판매용_템플릿/_판매팩", { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith("00."))
  .map((e) => e.name);
let 빠진칸 = 0;
for (const 팩 of 팩들) {
  const f = join("판매용_템플릿/_판매팩", 팩, "07_AI빌드_스펙팩.md");
  try {
    const 글 = readFileSync(f, "utf8");
    if (!/--card-pad/.test(글)) { 빠진칸++; console.error(`   ✗ ${팩} — 새 규칙이 안 들어갔습니다`); }
  } catch { /* 파일이 없는 칸은 _부족한구성.md 가 따로 알린다 */ }
}
console.log(빠진칸 === 0
  ? `✅ 판매팩 ${팩들.length}칸 모두 새 규칙이 들어갔습니다`
  : `⚠️  ${빠진칸}칸에 새 규칙이 없습니다`);

console.log("\n끝났습니다.\n");
