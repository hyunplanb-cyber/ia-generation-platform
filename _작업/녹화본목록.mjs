/* 릴스영상 아래에 «어떤 녹화본이 얼마나» 있는지 세어 준다.
 *
 * 왜 (2026-08-13)
 *   루틴 지시서가 원본 목록을 «손으로 적어» 두고 있었다 —
 *   「8. lms 4시간38분 / 5. 뷰티샵 3시간8분 …」.
 *   사장님이 「12. AI팩 만드는 과정」을 새로 넣으셨는데 목록에 없으니 루틴이 못 본다.
 *   **손으로 적은 목록은 반드시 썩는다.** 세어서 쓴다.
 *
 * 쓰는 법:  node _작업/녹화본목록.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const 뿌리 = "판매용_템플릿/_마케팅/릴스영상";
const 영상인가 = (f) => /\.(mp4|mov|m4v|webm)$/i.test(f);

/** ffprobe 는 «머리»만 읽는다 — 몇 기가짜리라도 금방이다. */
function 재기(길) {
  try {
    const 글 = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0",
      "-show_entries", "stream=width,height", "-show_entries", "format=duration",
      "-of", "default=nw=1:nk=1", 길], { encoding: "utf8" });
    const [w, h, d] = 글.trim().split(/\s+/).map(Number);
    return { w, h, 초: d };
  } catch { return null; }
}

const 시분 = (초) => `${Math.floor(초 / 3600)}시간 ${String(Math.round((초 % 3600) / 60)).padStart(2, "0")}분`;

/* ⭐ 「찍은 뜻」 — 사장님이 녹화본 옆에 남기신 메모를 같이 읽는다 (2026-08-20).
 *
 *   왜 — 녹화본만 보면 «무엇을 보여 주려고 찍었는지»를 알 수 없다.
 *   그동안은 채팅으로만 오갔고, 다음 주 루틴은 그 말을 못 본다.
 *   지시서에 적어 두면 썩는다(이 파일이 생긴 까닭과 같다). 파일 옆에 두고 «읽는다».
 *
 *   두 자리를 본다 — 어느 쪽이든 된다:
 *     · 폴더 하나에 통째로   `<폴더>/_메모.md`
 *     · 녹화본 하나마다      `<녹화본이름>.메모.md`
 */
function 메모읽기(길) {
  try {
    const 글 = readFileSync(길, "utf8").trim();
    return 글 ? 글.split(String.fromCharCode(10)).map((l) => l.trim()).filter(Boolean) : null;
  } catch { return null; }
}

let 합초 = 0, 합개 = 0;
const 방들 = readdirSync(뿌리, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith("_") && !e.name.startsWith("."))
  .map((e) => e.name)
  .sort((a, b) => (parseInt(a) || 999) - (parseInt(b) || 999));

for (const 방 of 방들) {
  const 것들 = readdirSync(join(뿌리, 방)).filter(영상인가);
  if (!것들.length) continue;
  let 방초 = 0;
  const 줄 = [];
  for (const f of 것들) {
    const 길 = join(뿌리, 방, f);
    const m = 재기(길);
    const 메가 = Math.round(statSync(길).size / 1e6);
    방초 += m?.초 ?? 0;
    /* 비율을 같이 적는다 — 9:16(0.56) 은 그대로, 1.28 은 가로 칸, 16:9(1.78) 은 가로.
       녹화본 비율을 모르고 자르면 메뉴·단추가 반씩 잘린다. */
    줄.push(`      ${f}  ${m ? `${Math.round(m.초)}초 · ${m.w}×${m.h} · 비율 ${(m.w / m.h).toFixed(2)}` : "(못 읽음)"} · ${메가}MB`);
    const 제메모 = 메모읽기(길 + ".메모.md") || 메모읽기(길.slice(0, 길.lastIndexOf(".")) + ".메모.md");
    if (제메모) for (const m of 제메모) 줄.push(`          ✎ ${m}`);
  }
  합초 += 방초; 합개 += 것들.length;
  console.log(`\n  ${방}  —  ${것들.length}개 · ${시분(방초)}`);
  /* 폴더 통째로 남기신 메모 — 그 회차를 왜 찍었는지 */
  const 방메모 = 메모읽기(join(뿌리, 방, "_메모.md"));
  if (방메모) for (const m of 방메모) console.log(`      ✎ ${m}`);
  console.log(줄.join("\n"));
}
console.log(`\n모두 ${합개}개 · ${시분(합초)}`);
console.log("⚠ 비율 0.56 = 9:16(쇼츠 그대로) · 1.28 = 가로 칸에 맞음 · 1.78 = 16:9");
console.log("✎ 표는 사장님이 「무엇을 보여 주려고 찍었는지」 적어 두신 것이다. 읽고 만든다.");
console.log("   없으면 없는 대로 만든다 — 메모는 «거들 뿐» 이지 유일한 각도가 아니다.");
