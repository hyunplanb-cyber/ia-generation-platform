/* 손님이 «받는 그 zip» 을 그대로 열어 본다.
 *
 * 왜 만드나 (2026-08-10)
 *   뷰티샵 디럭스 팩에 `완성화면/index.html` 이 «없는 채로» 팔리고 있었다.
 *   화면 49장은 다 있는데 들어갈 문이 없었다. 8월 4일부터 그 상태였다.
 *   검사기 넷이 다 통과시켰다 — 셋 다 «만드는 재료»를 볼 뿐 zip 을 안 열어 본다.
 *
 *   check-presets  가이드끼리 말이 맞나
 *   check-design   화면이 가이드대로인가
 *   check-pack     화면이 스펙대로인가
 *   여기           **산 사람이 받는 파일이 성한가**
 *
 * 무엇을 보나 — 「파일이 있다」가 아니라 「열린다」를 본다.
 *   0바이트 · 안 열리는 엑셀 · 깨진 pptx · 파싱 안 되는 json ·
 *   빈 html · 짝 없는 프리셋 · 없는 화면을 가리키는 목록.
 *
 * 쓰는 법
 *   npx tsx check-zip.mts              packs/ 전부
 *   npx tsx check-zip.mts rental       그 업종만
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import JSZip from "jszip";
/* 파일 «속»을 열어 보는 검사는 직접팩 검수기와 나눠 쓴다 — 두 벌로 적으면 갈라진다.
   여기를 고치면 두 검사기가 같이 바뀐다(2026-08-11). */
import { 파일보기, 프리셋짝보기, 화면목록안내보기, type 급 } from "./lib/검수-속보기.mjs";

const 방 = "packs";
const 고른것 = process.argv[2];

/* 급은 공용 모듈이 정한다(`lib/검수-속보기`). 여기서 좁게 다시 적으면 갈라진다 —
   「알림」이 생겼을 때 실제로 타입이 안 맞았다(2026-08-11). */
type 흠 = { 급: 급; 어디: string; 무엇: string };
const 흠들: 흠[] = [];
const 못됨 = (어디: string, 무엇: string) => 흠들.push({ 급: "FAIL", 어디, 무엇 });
const 걸림 = (어디: string, 무엇: string) => 흠들.push({ 급: "WARN", 어디, 무엇 });
/** 공용 검사(`lib/검수-속보기`)에 넘길 담개. */
const 담 = (g: 급, 어디: string, 무엇: string) => 흠들.push({ 급: g, 어디, 무엇 });

/** 어느 등급에나 있어야 하는 것. 없으면 손님이 「빠졌다」고 느낀다. */
const 언제나 = [
  "01_메뉴구조.xlsx", "02_IA_화면목록.xlsx", "03_기능정의서.xlsx", "04_WBS.xlsx",
  "05_FLOW_흐름도.drawio", "05_FLOW_흐름도.html",
  "06_메뉴구조.pptx", "07_AI빌드_스펙팩.json", "07_AI빌드_스펙팩.md",
  "09_사이트_내놓는_법.html", "10_앱으로_내놓는_법.html", "README.txt",
];
/** 완성화면이 들어가는 등급에만 있는 것. */
const 완성화면있으면 = ["08_검수시나리오.xlsx"];

async function 팩보기(zip파일: string) {
  const 이름 = zip파일.replace(/\.zip$/, "");
  const buf = readFileSync(join(방, zip파일));
  let z: JSZip;
  try { z = await JSZip.loadAsync(buf); }
  catch { 못됨(이름, "zip 이 안 열립니다"); return; }

  const 길들 = Object.keys(z.files).filter((p) => !z.files[p].dir);
  if (!길들.length) { 못됨(이름, "zip 이 비었습니다"); return; }

  /* 최상위가 폴더 하나로 감싸져 있어야 한다 — 안 그러면 압축을 풀 때 바탕화면이 어질러진다. */
  const 뿌리들 = new Set(길들.map((p) => p.split("/")[0]));
  if (뿌리들.size !== 1) 못됨(이름, `최상위 폴더가 ${뿌리들.size}개입니다 — 하나로 감싸야 합니다`);
  const 뿌리 = [...뿌리들][0];
  const 안 = (p: string) => 길들.includes(`${뿌리}/${p}`);

  const 완성화면있음 = 길들.some((p) => p.includes("/완성화면/"));
  const 있어야할것 = [...언제나, ...(완성화면있음 ? 완성화면있으면 : [])];
  for (const f of 있어야할것) if (!안(f)) 못됨(이름, `${f} 가 없습니다`);

  /* 파일마다 «열어» 본다. */
  for (const p of 길들) {
    const 짧게 = p.slice(뿌리.length + 1);
    const b = Buffer.from(await z.files[p].async("uint8array"));
    if (b.length === 0) { 못됨(이름, `${짧게} — 0바이트입니다`); continue; }

    await 파일보기(이름, 짧게, b, 담);
    if (짧게.includes("화면목록")) 화면목록안내보기(이름, 짧게, b, 담);
  }

  /* 디자인프리셋 — .md 와 .json 이 짝이라야 한다. 하나만 있으면 반쪽이다. */
  const 프리셋 = 길들.filter((p) => p.includes("/디자인프리셋/")).map((p) => p.split("/").pop()!);
  프리셋짝보기(이름, 프리셋, 담);

  /* ── 완성화면 — 오늘 사고가 난 자리다 ────────────────────── */
  if (완성화면있음) {
    const 화면들 = 길들.filter((p) => p.includes("/완성화면/pages/") && p.endsWith(".html"))
      .map((p) => p.split("/").pop()!);
    if (!안("완성화면/index.html")) {
      못됨(이름, `완성화면/index.html 이 없습니다 — 화면 ${화면들.length}장이 있는데 «들어갈 문»이 없습니다`);
    } else {
      /* 목록이 가리키는 화면이 실제로 다 들어 있나. 하나라도 없으면 손님은 빈 화면을 본다. */
      const idx = Buffer.from(await z.files[`${뿌리}/완성화면/index.html`].async("uint8array")).toString("utf8");
      const 가리킨것 = [...idx.matchAll(/pages\/([A-Za-z0-9-]+)\.html/g)].map((m) => `${m[1]}.html`);
      const 없는것 = [...new Set(가리킨것)].filter((f) => !화면들.includes(f));
      if (없는것.length) 못됨(이름, `목록이 없는 화면을 가리킵니다 — ${없는것.slice(0, 5).join(", ")}${없는것.length > 5 ? ` 외 ${없는것.length - 5}` : ""}`);

      /* 반대쪽 — 아무도 안 가리키는 화면. 파일은 있는데 손님이 갈 길이 없다. */
      const 홀로 = 화면들.filter((f) => !가리킨것.includes(f));
      if (홀로.length) 걸림(이름, `목록에 없는 화면이 ${홀로.length}장 — ${홀로.slice(0, 5).join(", ")}`);
    }
    if (!안("완성화면/assets/css/base.css")) 못됨(이름, "완성화면/assets/css/base.css 가 없습니다 — 화면이 민무늬로 열립니다");

    /* 옛 파일이 섞여 있으면 손님이 어느 것을 열지 헷갈린다. */
    const 옛것 = 길들.filter((p) => /index_old|_old\.|\.bak$/.test(p)).map((p) => p.slice(뿌리.length + 1));
    if (옛것.length) 걸림(이름, `옛 파일이 섞여 있습니다 — ${옛것.join(", ")}`);
  }

  const 문서수 = 길들.filter((p) => !p.includes("/완성화면/") && !p.includes("/디자인프리셋/")).length;
  console.log(`  ${이름.padEnd(20)} 문서 ${String(문서수).padStart(2)}개 · 프리셋 ${String(프리셋.length).padStart(2)}개 · ` +
    `완성화면 ${완성화면있음 ? String(길들.filter((p) => p.includes("/완성화면/pages/")).length).padStart(3) + "장" : "  없음"}`);
}

/* ── 돌리기 ────────────────────────────────────────────────── */
if (!existsSync(방)) { console.error(`${방}/ 폴더가 없습니다.`); process.exit(1); }
const 대상 = readdirSync(방).filter((f) => f.endsWith(".zip") && (!고른것 || f.startsWith(고른것))).sort();
if (!대상.length) { console.error(`${방}/ 에 맞는 zip 이 없습니다.`); process.exit(1); }

console.log(`\n손님이 받는 zip 검사 — ${대상.length}칸\n`);
for (const f of 대상) await 팩보기(f);

/* 팔리는 칸과 zip 이 짝이 맞나 — zip 이 없으면 사고도 못 내려받는다. */
const { packageProducts } = await import("./lib/packages");
for (const { pkg, plan } of packageProducts()) {
  const 있어야 = `${pkg.id}-${plan.id}.zip`;
  if (!existsSync(join(방, 있어야))) {
    못됨("진열", `${pkg.fileLabel} ${plan.name} — ${있어야} 가 없습니다. 사도 못 받습니다`);
  }
}

const 못한것 = 흠들.filter((i) => i.급 === "FAIL");
const 걸린것 = 흠들.filter((i) => i.급 === "WARN");
console.log("");
for (const i of 못한것) console.log(`  ✗ [${i.어디}] ${i.무엇}`);
for (const i of 걸린것) console.log(`  △ [${i.어디}] ${i.무엇}`);
console.log(`\n못 넘긴 것 ${못한것.length}건 · 봐줄 만한 것 ${걸린것.length}건`);
if (못한것.length) process.exit(1);
console.log("  손님이 받는 파일은 성합니다.");
