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
/* 손님이 받는 07·11 에 «지금 코드의» 검수 글이 들어갔나 — 아래 굽힌글맞나() 참고.
 *
 * ⚠ 이름을 곧이 적으면 안 된다 — `import { 화면검수글 } from …` 은 여기서 죽는다.
 *   node 가 CJS 의 export 이름을 훑는 cjs-module-lexer 가 «한글 이름»을 못 읽어
 *   「그런 export 없다」가 난다. lib/ 안끼리는 되는데 .mts 에서 부르면 안 된다.
 *   그래서 통째로 가져와 이름을 «찾아» 쓴다. NFC/NFD 까지 맞춰 둔다. */
import * as 검수글모음 from "./lib/export/화면검수-글";

const 검수글 = (이름: string): string => {
  const 속 = ((검수글모음 as Record<string, unknown>).default ?? 검수글모음) as Record<string, string>;
  const 찾은것 = Object.keys(속).find((k) => k.normalize("NFC") === 이름.normalize("NFC"));
  if (!찾은것) throw new Error(`화면검수-글 에 ${이름} 이 없습니다 (있는 것: ${Object.keys(속).join(", ")})`);
  return 속[찾은것];
};

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
  "09_사이트_내놓는_법.html", "10_앱으로_내놓는_법.html",
  "11_내사이트_검수하는_법.html", "README.txt",
];
/** 완성화면이 들어가는 등급에만 있는 것. */
const 완성화면있으면 = ["08_검수시나리오.xlsx"];

/* 손님이 받는 07·11 에 «지금 코드의» 검수 글이 들어갔나.
 *
 * ⛔ 2026-09-02 — 32칸 가운데 28칸이 «옛 검수 글»을 그대로 팔고 있었다.
 *   그날 화면검수-글.ts 에서 헛짚음 셋을 고쳤는데(빵부스러기를 위 메뉴로 본 것 등)
 *   구운 zip 은 옛 글이었다. 코드만 고치면 «구워진 문서»는 옛말을 그대로 판다.
 *
 *   왜 아무도 못 잡았나 — build-all 의 마지막 확인은 `--card-pad`(CSS)만 본다.
 *   검수 글은 아예 안 본다. 그래서 「32칸 모두 새 규칙이 들어갔습니다」라고 하면서
 *   28칸이 옛 글을 들고 있었다. 손으로 zip 을 열어 보다가 걸렸다.
 *
 * 어떻게 보나 — 검수 글을 «통째로» 견준다. 스펙팩도 안내서도 그 글을 한 글자도
 *   안 고치고 담으므로(11 번만 < > & 를 바꿔 담는다) 그게 된다. 한 줄만 달라도 잡는다.
 *
 * ⚠ 처음에는 «긴 줄 셋»만 뽑아 봤다. 일부러 옛말을 심어 시험해 보니 하필 그 셋이
 *   아니어서 「성합니다」가 나왔다. 표본으로 재면 이런 통과가 제일 위험하다.
 *   여기에 문구를 따로 적어 두지 않는다 — 글이 바뀌면 잣대도 같이 바뀌어야 한다.
 */
async function 굽힌글맞나(
  이름: string,
  z: JSZip,
  뿌리: string,
  안: (p: string) => boolean,
) {
  const 열기 = async (p: string) =>
    안(p) ? Buffer.from(await z.files[`${뿌리}/${p}`].async("uint8array")).toString("utf8") : null;

  const 볼것: [string, string][] = [
    ["07_AI빌드_스펙팩.md", 검수글("화면검수글")],
    ["07_AI빌드_스펙팩.md", 검수글("파일검수글")],
    ["07_AI빌드_스펙팩.md", 검수글("모두검수글")],
    ["11_내사이트_검수하는_법.html", 검수글("화면검수글")],
  ];
  const 담긴것 = new Map<string, string | null>();
  for (const [파일, 글] of 볼것) {
    if (!담긴것.has(파일)) 담긴것.set(파일, await 열기(파일));
    const 속 = 담긴것.get(파일);
    if (속 == null) continue;   /* 파일이 없는 것은 위에서 이미 «없습니다»로 잡는다 */
    /* 11 번 안내서는 <pre> 안에 넣느라 < > & 를 바꿔 담는다(검수안내서.ts 의 안전()).
       그대로 견주면 => 하나 때문에 «옛것»이 된다. 같은 방식으로 바꿔서 본다. */
    const 잴것 = 파일.endsWith(".html")
      ? 글.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      : 글;
    /* ⚠ 몇 줄만 뽑아 보지 않는다. 2026-09-02 에 그렇게 만들었다가, 일부러 옛말을 심어
       봤더니 그 세 줄이 아니어서 «성합니다»가 나왔다. 스펙팩도 안내서도 이 글을
       «통째로» 담으므로 통째로 견줄 수 있다. 한 글자만 달라도 잡는다. */
    if (!속.includes(잴것)) {
      못됨(이름, `${파일} 의 검수 글이 지금 코드와 다릅니다 — 다시 구우세요 (build-all.mts)`);
    }
  }
}

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

  await 굽힌글맞나(이름, z, 뿌리, 안);

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
    /* ⚠ 2026-08-21: build/qa.html — «우리 점검용» 화면이 네 팩의 zip 에 섞여 나갔다.
       손님 것이 아닌데 손님이 받는다. 옛 파일과 같은 갈래로 여기서 함께 잡는다. */
    const 옛것 = 길들.filter((p) => /index_old|_old\.|\.bak$|[\\/]qa\.html$/.test(p)).map((p) => p.slice(뿌리.length + 1));
    if (옛것.length) 걸림(이름, `옛 파일이 섞여 있습니다 — ${옛것.join(", ")}`);

    /* ── 예시 사진 (2026-08-11) ────────────────────────────────
       사진은 «파일»과 «태그» 둘이 맞아야 보인다. 8월 10일 커밋에는 태그 192개가
       들어갔는데 webp 는 0장이었다 — 손님은 회색 네모만 봤을 것이다. 그때는
       아무도 안 재고 있었다. 여기서 잰다. */
    const 사진파일 = new Set(길들.filter((p) => p.includes("/완성화면/assets/예시/"))
      .map((p) => p.split("/").pop()!));
    const 링크 = new Set<string>();
    let 태그수 = 0;
    const 지도에낀것: string[] = [];
    for (const p of 길들.filter((x) => x.includes("/완성화면/pages/") && x.endsWith(".html"))) {
      const 글 = Buffer.from(await z.files[p].async("uint8array")).toString("utf8");
      for (const m of 글.matchAll(/data-예시 src="\.\.\/assets\/예시\/([^"]+)"/g)) { 태그수 += 1; 링크.add(m[1]); }
      /* 지도 자리에 사진이 들어가면 그냥 틀린 화면이다. 넣는 쪽이 건너뛰기로 했지만,
         「건너뛰기로 했다」와 「건너뛰었다」는 다른 말이다. 여기서 잰다. */
      for (const [, 여는] of 글.matchAll(/<div class="([^"]*\bph-map\b[^"]*)"[^>]*>\s*<img data-예시/g)) {
        void 여는;
        지도에낀것.push(p.split("/").pop()!);
      }
    }
    if (지도에낀것.length) {
      못됨(이름, `지도 자리에 사진이 들어갔습니다 — ${[...new Set(지도에낀것)].slice(0, 4).join(", ")} (지도는 사진 자리가 아닙니다)`);
    }
    if (태그수) {
      const 깨진것 = [...링크].filter((f) => !사진파일.has(f));
      if (깨진것.length) {
        못됨(이름, `예시 사진 ${깨진것.length}장이 zip 에 없습니다 — 그 자리는 빈 네모로 열립니다 (${깨진것.slice(0, 3).join(", ")})`);
      }
      /* 손님이 사진을 바꿀 때 보는 표. 없으면 어느 파일이 어디 쓰였는지 알 길이 없다. */
      const 표길 = `${뿌리}/완성화면/사진바꾸기.csv`;
      if (!안("완성화면/사진바꾸기.csv")) {
        못됨(이름, `사진 ${태그수}곳을 넣고 사진바꾸기.csv 를 안 넣었습니다 — 손님이 어느 파일을 바꿔야 할지 모릅니다`);
      } else {
        const 줄수 = Buffer.from(await z.files[표길].async("uint8array")).toString("utf8")
          .trim().split(/\r?\n/).length - 1;
        if (줄수 !== 태그수) 못됨(이름, `사진바꾸기.csv 가 ${줄수}줄인데 실제 사진은 ${태그수}곳입니다 — 표가 묵었습니다`);
      }
    } else if (사진파일.size) {
      /* ⛔ 2026-09-02~03 에 이 자국을 세 번 봤다. 늘 같은 까닭이다 —
         `node build/generate.mjs` 가 화면을 새로 쓰면서 data-예시 태그를 지운다.
         사진 파일은 남고 부르는 쪽만 사라져서, 손님은 회색 네모만 본다.
         굽기는 «자리표»만 만들고 사진은 그 뒤에 얹는 것이라 그렇다.
         그래서 까닭과 고치는 법을 자국에 함께 적는다 — 다음 사람이 헤매지 않게. */
      const 업종 = 이름.split('-')[0];
      걸림(이름, `예시 사진 ${사진파일.size}장이 들어 있는데 화면에서 쓰지 않습니다 — `
        + `화면을 다시 구운 뒤(generate.mjs) 사진을 다시 안 얹은 것입니다. `
        + `«npx tsx 이미지-끼우기.mts <팩폴더>» 를 돌리고 다시 포장하세요 (예: ${업종})`);
    }
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
