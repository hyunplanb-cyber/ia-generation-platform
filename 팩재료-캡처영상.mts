/* 팩 하나에서 «캡처와 영상 재료»를 뽑는다.
 *
 * 왜 코드로 만드나
 *   지시서에 「화면을 만드는 김에 같이 뽑는다」고 적어 뒀는데,
 *   2026-08-10 첫 회에 그 절을 통째로 빠뜨렸다. 글로 적어 두면 또 빠뜨린다.
 *   그래서 굽는 차례(build-all) 안에 넣고, 안 뽑히면 소리가 나게 한다.
 *
 * 무엇이 나오나
 *   완성화면/00_자동넘김.html                   4초마다 넘어간다 — 녹화만 눌러도 영상이 된다
 *   _마케팅/릴스영상/_화면캡처/{폴더}/*.png      1440×1800 세로 — 영상 재료
 *   _마케팅/릴스영상/_화면캡처/{폴더}/가로/*.png  1440×1100 위쪽만 — 카드뉴스 그림
 *   _마케팅/릴스영상/{n}. {업종}/{등급}_16x9.mp4  1920×1080 — 유튜브·홈페이지
 *   _마케팅/릴스영상/{n}. {업종}/{등급}_4x5.mp4   1080×1350 — 인스타 피드·릴스
 *
 * 어느 화면을 찍나 — «메뉴마다 첫 화면» 한 장씩.
 *   골라 적으면 팩마다 손이 가고, 전부 찍으면 3뎁스 팩에서 161장이 된다.
 *   메뉴 첫 화면이면 서비스 전체가 한 바퀴 돌면서 장 수도 8~10장으로 앉는다.
 *
 * 값을 지어내지 않는다 — 영상 여백 색은 그 팩이 실제로 쓴 가이드 JSON 에서 읽는다.
 * 어느 가이드를 썼는지도 index.html 이 스스로 적어 둔 것을 읽는다.
 *
 * ⚠ 한글 폴더에서 헤드리스 크롬은 조용히 아무것도 안 만든다.
 *   그래서 완성화면을 통째로 %TEMP% 아래 한글 없는 자리에 복사해 두고 거기서 찍는다.
 *
 * ⚠ localhost 로 띄우는 방법은 쓰지 않는다.
 *   같은 프로세스 안에서 서버를 열고 execFileSync 로 크롬을 부르면,
 *   크롬이 보낸 요청을 받아 줄 차례가 영영 안 온다(execFileSync 가 그 줄을 붙잡고 있다).
 *   2026-08-10 에 여기서 10분을 기다렸다 — 아무 소리도 안 나고 멈춰 있었다.
 *
 * 쓰는 법
 *   npx tsx 팩재료-캡처영상.mts 장비렌탈_디럭스
 *   npx tsx 팩재료-캡처영상.mts 장비렌탈            (그 업종의 완성화면 있는 등급 전부)
 *   npx tsx 팩재료-캡처영상.mts rental              (팩 키로 대도 된다)
 */
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync, rmSync, cpSync,
} from "node:fs";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
/* 팩은 두 자리에 있을 수 있다 — 다 된 것은 _판매팩, 만드는 중인 것은 _만드는중.
   A 회차와 B 회차 사이에는 «만드는중» 에 있으므로 두 곳을 다 봐야 재료를 뽑을 수 있다.
   (검수·zip·진열은 _판매팩 만 본다. 그것이 폴더를 가른 까닭이다 — 2026-08-11) */
const 팩방들 = ["판매용_템플릿/_판매팩", "판매용_템플릿/_만드는중"];
const 캡처방 = "판매용_템플릿/_마케팅/릴스영상/_화면캡처";
const 영상방 = "판매용_템플릿/_마케팅/릴스영상";

/* 찍는 크기.
 *
 * 1800px 로 길게 찍어 봤더니 짧은 화면은 아래가 절반쯤 빈 채로 나왔다(2026-08-10).
 * 영상으로 이으면 그 빈자리가 그대로 보인다. 화면마다 길이가 다르니 «접히는 자리»까지만
 * 찍는다 — 손님이 처음 보는 만큼이고, 어느 화면이든 꽉 찬다.
 * 카드뉴스용 가로는 위쪽을 잘라 쓴다. 두 번 찍으면 두 벌이 되고, 둘이 어긋난다. */
const W = 1440, H = 1150, 가로H = 1000;
/** 한 장에 몇 초 머무나. 폰에서 스치듯 보는 화면이라 짧으면 못 읽는다. */
const 초 = 2.6;

/* --캡처만 : 그림만 찍고, 완성화면과 영상은 «건드리지 않는다».
 *
 * 왜 필요한가
 *   이 스크립트는 완성화면 안에 00_자동넘김.html 을 써 넣는다. 새로 만드는 업종이면
 *   괜찮지만, **이미 팔고 있는 팩**에 대고 돌리면 팩 내용이 바뀌어 zip 을 다시 구워야 한다.
 *   2026-08-11 에 홈페이지 상세에 넣을 그림이 필요해서 열 팩을 찍어야 했는데,
 *   그것 때문에 팔던 열 팩을 건드릴 이유는 없었다.
 *
 *   스크립트를 두 벌로 나누지 않는다 — 찍는 규칙이 두 군데가 되면 반드시 갈라진다.
 *   같은 길을 걷되 «쓰는 자리»만 건너뛴다. */
const 캡처만 = process.argv.includes("--캡처만");
const 준인자 = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!준인자) {
  console.error("쓰는 법: npx tsx 팩재료-캡처영상.mts <팩폴더·업종·팩키> [--캡처만]");
  console.error("  예)   npx tsx 팩재료-캡처영상.mts 장비렌탈_디럭스");
  console.error("  예)   npx tsx 팩재료-캡처영상.mts rental");
  console.error("  예)   npx tsx 팩재료-캡처영상.mts LMS --캡처만   (완성화면·영상은 안 건드림)");
  process.exit(1);
}
/* 「rental」처럼 팩 키로 부를 수도 있게 한다 — 굽는 차례(build-all)가 쓰는 이름이 그것이다.
   폴더 이름은 lib/packages.ts 의 fileLabel 이 정한다. 여기서 따로 적어 두면 갈라진다. */
const { PACKAGES } = await import("./lib/packages");
const 인자 = PACKAGES.find((p) => p.id === 준인자)?.fileLabel ?? 준인자;

/* 이 업종이 «어느 자리»에 있는지 한 번만 정한다. 한 업종의 네 칸은 늘 같은 자리에 있다. */
const 찾은팩방 = 팩방들.find((방) => existsSync(방)
  && readdirSync(방).some((n) => n === 인자 || n.startsWith(`${인자}_`)));
if (!찾은팩방) {
  console.error(`「${인자}」에 맞는 팩 폴더가 없습니다.`);
  console.error(`  찾아본 곳: ${팩방들.join(" · ")}`);
  process.exit(1);
}
/** 위에서 못 찾으면 여기 오기 전에 멈춘다. 타입만 좁혀 준다. */
const 팩방: string = 찾은팩방;
if (팩방.endsWith("_만드는중")) console.log(`※ «만드는 중»인 팩입니다 — ${팩방}\n`);

/* ── 대상 고르기 ─────────────────────────────────────────────
   완성화면이 없는 등급(스탠다드·플러스)은 찍을 것이 없다. 조용히 건너뛰지 않고 말한다. */
const 후보 = readdirSync(팩방, { withFileTypes: true })
  .filter((e) => e.isDirectory() && (e.name === 인자 || e.name.startsWith(`${인자}_`)))
  .map((e) => e.name)
  .sort();

if (후보.length === 0) {
  console.error(`「${인자}」에 맞는 팩 폴더가 없습니다.`);
  process.exit(1);
}
const 대상 = 후보.filter((p) => existsSync(join(팩방, p, "완성화면", "pages")));
const 없는것 = 후보.filter((p) => !대상.includes(p));
if (없는것.length) console.log(`완성화면이 없어 건너뜁니다: ${없는것.join(" · ")}`);
if (대상.length === 0) {
  console.error("완성화면이 있는 팩이 하나도 없습니다.");
  process.exit(1);
}

/* 한글 없는 자리. **프로세스 번호를 붙인다.**
   전에는 `cc-pack-shot` 한 곳을 쓰고 팩마다 통째로 지웠다. 검수 루틴 둘이 화요일 새벽에
   «동시에» 돌기로 하면서(2026-08-11) 서로의 작업을 지우게 된다 — 한쪽이 찍는 중에
   다른 쪽이 rmSync 를 부른다. 조용히 반쯤 빈 캡처가 나온다. */
const WORK = join(tmpdir(), `cc-pack-shot-${process.pid}`).replace(/\\/g, "/");

/** 파일 이름에 쓸 수 없는 글자를 뺀다. */
const 안전 = (s: string) => s.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "").slice(0, 20);

/** 이 팩이 실제로 쓴 색 가이드 — **화면이 실제로 칠한 색**으로 찾는다.
 *
 * 전에는 index.html 의 «글»에서 이름을 읽었다. 그런데 그 글은 팩마다 문장이 다르고,
 * 틀리게 적혀 있기도 하다. 2026-08-11 에 여행 팩에서 둘 다 걸렸다 —
 * 디럭스는 「가이드 프리셋 03 — 소프트 파스텔」이라 꼴이 달랐고(게다가 소프트 파스텔은
 * 폐기한 색이다. 실제로는 일렉트릭바이올렛이었다), 프리미엄은 아예 안 적혀 있었다.
 *
 * **글은 틀릴 수 있어도 칠한 색은 못 속인다.** base.css 의 --primary 를 읽어
 * 그 팩의 가이드 JSON 들과 맞춰 본다. 앱스토어 재료 스크립트(팩재료-앱스토어.mts)가
 * 같은 이유로 이미 이 방법을 쓴다. */
function 쓴가이드(팩: string): { 색: string } {
  const css = readFileSync(join(팩방, 팩, "완성화면", "assets", "css", "base.css"), "utf8");
  const m = /--primary:\s*(#[0-9a-fA-F]{3,8})/.exec(css);
  if (!m) throw new Error(`${팩}/완성화면/assets/css/base.css 에서 --primary 를 못 찾았습니다`);
  const 쓰는색 = m[1].toUpperCase();

  const 방 = join(팩방, 팩, "디자인프리셋");
  const 이름 = readdirSync(방).filter((f) => f.startsWith("가이드") && f.endsWith(".json")).find((f) => {
    const g = JSON.parse(readFileSync(join(방, f), "utf8"));
    const k = Object.keys(g.colors).find((x) => x.startsWith("primary ("));
    return k && String(g.colors[k]).toUpperCase() === 쓰는색;
  });
  if (!이름) throw new Error(`${팩} 이 칠한 색(${쓰는색})에 맞는 가이드 JSON 이 없습니다`);

  // 「가이드_03_일렉트릭바이올렛.json」 → 「03_일렉트릭바이올렛」
  return { 색: 이름.replace(/^가이드_/, "").replace(/\.json$/, "") };
}

/** 여백 색 — 그 팩의 가이드 JSON 에 적힌 배경색을 그대로 쓴다. 지어내지 않는다. */
function 배경색(팩: string, 색: string): string {
  const 방 = join(팩방, 팩, "디자인프리셋");
  const 이름 = readdirSync(방).find((f) => f.endsWith(".json") && f.includes(색.split("_")[0]) && f.startsWith("가이드"));
  if (!이름) throw new Error(`가이드 JSON 을 못 찾았습니다 (${방}, ${색})`);
  const g = JSON.parse(readFileSync(join(방, 이름), "utf8"));
  const 키 = Object.keys(g.colors).find((k) => k.startsWith("background"));
  if (!키) throw new Error(`${이름} 에 background 색이 없습니다`);
  return g.colors[키] as string;
}

/** 메뉴마다 한 장.
 *
 * 차례는 «스펙팩(07)의 메뉴 차례»를 따른다. 손님이 서비스를 쓰는 차례가 그것이다.
 *   파일 이름순으로 하면 BK·CS·CT… 가 되어 홈이 네 번째로 간다(2026-08-10 에 그렇게 나왔다).
 *   index.html 순서로 하면 맨 위 「이 팩의 알맹이」 소개에 걸려 정산이 반납보다 앞선다.
 *   첫 장이 홈이 아니거나 차례가 뒤엉킨 소개 영상은 무엇을 파는지 알 수가 없다.
 *
 * 어느 화면을 고르나 — index.html 이 «이 팩의 알맹이»로 앞세운 화면이 그 메뉴에 있으면
 * 그것을, 없으면 그 메뉴의 첫 화면을 쓴다. 자랑할 화면은 팩이 스스로 적어 두었다.
 */
function 간판화면(pages: string, index: string, 스펙: string) {
  const 있는것 = new Set(readdirSync(pages).filter((f) => f.endsWith(".html")));
  const spec = JSON.parse(readFileSync(스펙, "utf8")) as {
    menus: { code: string; nameKo: string; screens: { pageId: string; pageName: string }[] }[];
  };

  /* index.html 위쪽 «소개»에서 앞세운 화면들.
     전체 목록은 `<section class="idx-menu">` 부터 시작하므로 그 앞까지만 본다.
     통째로 훑으면 목록에 있는 모든 화면이 걸려서 「앞세웠다」는 말이 뜻을 잃는다. */
  const 목록시작 = index.indexOf('class="idx-menu"');
  const 소개 = 목록시작 > 0 ? index.slice(0, 목록시작) : index;
  const 앞세운것 = [...소개.matchAll(/([A-Z]{2}-?\d{2,4})\.html/g)].map((m) => m[1]);

  const 고른것: { 파일: string; id: string; 이름: string }[] = [];
  for (const 메뉴 of spec.menus) {
    const 후보 = 메뉴.screens.filter((s) => 있는것.has(`${s.pageId}.html`));
    if (후보.length === 0) continue;
    const 뽑기 = 후보.find((s) => 앞세운것.includes(s.pageId)) ?? 후보[0];
    고른것.push({ 파일: `${뽑기.pageId}.html`, id: 뽑기.pageId, 이름: 뽑기.pageName });
  }
  if (고른것.length === 0) throw new Error("스펙팩의 메뉴와 pages 폴더가 하나도 안 맞습니다");
  return 고른것;
}

/** ffmpeg 로 잇는다. 화면은 비율 그대로 넣고 남는 자리는 그 팩의 배경색으로 채운다. */
function 영상만들기(장들: string[], 나갈길: string, w: number, h: number, bg: string) {
  const 목록: string[] = [];
  for (const p of 장들) 목록.push(`file '${p.replace(/\\/g, "/")}'`, `duration ${초.toFixed(3)}`);
  목록.push(`file '${장들[장들.length - 1].replace(/\\/g, "/")}'`);   // concat 은 마지막 장을 한 번 더 적어야 끝까지 나온다
  const list = `${WORK}/frames_${w}x${h}.txt`;
  writeFileSync(list, 목록.join("\n"), "utf8");
  const tmp = `${WORK}/out_${w}x${h}.mp4`;
  execFileSync("ffmpeg", [
    "-y", "-v", "error",
    "-f", "concat", "-safe", "0", "-i", list,
    "-vf", `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:${bg}`,
    "-fps_mode", "cfr", "-r", "30",
    "-c:v", "libx264", "-pix_fmt", "yuv420p",
    "-an", "-movflags", "+faststart",
    tmp,
  ]);
  mkdirSync(join(나갈길, ".."), { recursive: true });
  copyFileSync(tmp, 나갈길);
}

/** 자동으로 넘어가는 페이지 — 녹화만 누르면 그대로 영상 재료가 된다. */
function 자동넘김쓰기(완성화면: string, 장들: { 파일: string; 이름: string }[], bg: string, ink: string, 꼬리: string) {
  writeFileSync(join(완성화면, "00_자동넘김.html"), `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><title>${꼬리} — 자동 넘김</title>
<style>
  html,body{margin:0;height:100%;background:${bg};overflow:hidden}
  iframe{width:100%;height:calc(100% - 44px);border:0;display:block}
  .tag{height:44px;box-sizing:border-box;padding:11px 18px;background:${ink};color:#fff;
    font:700 15px/1.4 Paperlogy,Pretendard,'Malgun Gothic',sans-serif;
    display:flex;justify-content:space-between}
</style></head><body>
<iframe id="f" src="pages/${장들[0].파일}"></iframe>
<div class="tag"><span id="t">${장들[0].이름}</span><span>${꼬리}</span></div>
<script>
/* 한 장에 4초. 화면 녹화만 눌러도 쓸 수 있는 길이다. */
const 장 = ${JSON.stringify(장들.map((h) => ({ f: h.파일, t: h.이름 })))};
let i = 0;
setInterval(() => {
  i = (i + 1) % 장.length;
  document.getElementById("f").src = "pages/" + 장[i].f;
  document.getElementById("t").textContent = 장[i].t;
}, 4000);
</script></body></html>
`, "utf8");
}

/* ── 팩마다 한 바퀴 ──────────────────────────────────────────── */
let 만든장 = 0, 만든영상 = 0;
for (const 팩 of 대상) {
  const 완성화면 = join(팩방, 팩, "완성화면");
  const index = readFileSync(join(완성화면, "index.html"), "utf8");
  const { 색 } = 쓴가이드(팩);
  const bg = 배경색(팩, 색);
  const [업종, 등급] = [팩.split("_")[0], 팩.split("_").slice(1).join("_")];
  const 꼬리 = `${업종} ${등급} · ${색.split("_")[1]}`;
  const 장들 = 간판화면(join(완성화면, "pages"), index, join(팩방, 팩, "07_AI빌드_스펙팩.json"));

  console.log(`\n${팩}  —  ${색.replace("_", " ")}  ·  간판 ${장들.length}장`);

  if (!캡처만) 자동넘김쓰기(완성화면, 장들, bg, "#1C2B22", 꼬리);

  if (existsSync(WORK)) rmSync(WORK, { recursive: true, force: true });
  mkdirSync(WORK, { recursive: true });
  /* 한글 없는 자리로 통째로 옮겨 놓고 거기서 찍는다. 원본은 건드리지 않는다. */
  const 찍을곳 = `${WORK}/site`;
  cpSync(완성화면, 찍을곳, { recursive: true });

  /* 「화면 정보」 패널은 손님 화면이 아니라 우리 확인용이다. 홍보물에 들어가면 안 된다.
     원본을 고치지 않고 «옮겨 놓은 사본»의 CSS 에만 한 줄 덧붙인다. */
  const css = `${찍을곳}/assets/css/base.css`;
  writeFileSync(css, `${readFileSync(css, "utf8")}
/* 캡처용 — 원본에는 없다 */
.dev{display:none!important}
/* 「화면 목록」으로 되돌아가는 링크는 «둘러보기 장치»다. 손님 사이트의 일부가 아니다.
   홍보 그림에 남아 있으면 「이건 견본이구나」로 읽히고, 머리줄·옆줄에 군더더기가 붙는다.
   어느 팩이든 이 링크는 ../index.html 하나로 통일돼 있어서 한 줄로 잡힌다(2026-08-11). */
a[href="../index.html"]{display:none!important}
`, "utf8");

  const 낼방 = join(캡처방, `${업종}_${등급}_${안전(색.split("_")[1])}`);
  const 가로방 = join(낼방, "가로");
  mkdirSync(가로방, { recursive: true });

  const 세로장: string[] = [];
  장들.forEach((장, i) => {
    const nn = String(i + 1).padStart(2, "0");
    const 세로 = `${WORK}/v_${nn}.png`;
    execFileSync(CHROME, [
      "--headless=new", "--disable-gpu", "--hide-scrollbars",
      "--force-device-scale-factor=1", `--window-size=${W},${H}`,
      `--screenshot=${세로}`, "--virtual-time-budget=2500",
      `file:///${찍을곳}/pages/${장.파일}`,
    ], { stdio: "pipe" });
    if (!existsSync(세로)) throw new Error(`${장.파일} 을 못 찍었습니다`);

    const 이름 = `${nn}_${장.id}_${안전(장.이름)}.png`;
    copyFileSync(세로, join(낼방, 이름));
    /* 카드뉴스용 가로는 «위쪽만» 잘라 쓴다. 다시 찍지 않는다 — 두 벌이 되면 갈라진다. */
    execFileSync("ffmpeg", ["-y", "-v", "error", "-i", 세로, "-vf", `crop=${W}:${가로H}:0:0`, `${WORK}/h_${nn}.png`]);
    copyFileSync(`${WORK}/h_${nn}.png`, join(가로방, 이름));
    세로장.push(세로);
    만든장 += 1;
    process.stdout.write(`  찍는 중 ${i + 1}/${장들.length}  ${장.이름}          \r`);
  });
  console.log(`  캡처 ${장들.length}장 → ${낼방}          `);

  if (캡처만) continue;   // 그림만 필요했다. 완성화면도 릴스 폴더도 그대로 둔다.

  /* 릴스 폴더는 「n. 업종」 꼴로 이미 쓰고 있다. 있으면 그 자리에, 없으면 다음 번호로 만든다. */
  const 있는것 = readdirSync(영상방, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d+\.\s/.test(e.name));
  const 이미 = 있는것.find((e) => e.name.endsWith(` ${업종}`));
  const 다음번호 = Math.max(0, ...있는것.map((e) => parseInt(e.name, 10) || 0)) + 1;
  const 회차방 = join(영상방, 이미?.name ?? `${다음번호}. ${업종}`);
  mkdirSync(회차방, { recursive: true });

  영상만들기(세로장, join(회차방, `${등급}_16x9.mp4`), 1920, 1080, bg);
  영상만들기(세로장, join(회차방, `${등급}_4x5.mp4`), 1080, 1350, bg);
  만든영상 += 2;
  console.log(`  영상 2편 → ${회차방}`);
}

console.log(`\n끝났습니다 — 캡처 ${만든장}장 · 영상 ${만든영상}편`);
