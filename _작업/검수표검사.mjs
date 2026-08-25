/* 검수 CSV 가 «정해진 모양»인지 잰다.
 *
 * 왜 있나 — 2026-08-19 에 pack-qa-spec-a 가 8칸짜리 옛 모양으로 썼다.
 * 지시서는 「줄 모양은 검수공통 5절」이라고 제대로 가리키고 있었는데,
 * 옆 폴더의 옛 파일(2026-08-18_A.csv)이 8칸이라 그것을 본보기로 삼은 것이다.
 * 규칙은 글에 있고 예시가 규칙을 배신하면, 만드는 쪽은 예시를 따른다.
 * 그래서 글 대신 기계가 잰다.
 *
 *   node _작업/검수표검사.mjs [날짜]     날짜 없으면 오늘
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";

export const 머리줄 = ["날짜", "루틴", "팩", "항목", "무엇", "근거파일", "고침여부"];
export const 고침값 = ["고침", "해당없음", "마무리에넘김", "못고침"];

/** 오늘 날짜를 «한국 시각»으로 준다.
 *
 * ⛔ toISOString() 을 그냥 쓰면 UTC 라 밤 0시~아침 9시 사이에 «어제»가 나온다.
 * 2026-08-25 01:11(한국) 에 실제로 그랬다 — 루틴은 2026-08-25_*.csv 를 쓰는데
 * 이 검사기와 대기점검은 2026-08-24 를 찾아 「잴 CSV 가 없다」·「고친 팩 0」이라 했다.
 * 검수 루틴은 새벽에 도는 것이 보통이라, 하루 중 그 9시간이 곧 검수 시간이다.
 * 대기점검이 그때 「✓ 모두 길 위에 있다」고 하면 2026-08-19 의 그 사고가 그대로 되풀이된다.
 */
export function 오늘() {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

/** 따옴표를 아는 CSV 쪼개기. 칸 안의 쉼표·따옴표를 지킨다. */
export function 쪼개(줄) {
  const 칸 = [];
  let 지금 = "";
  let 따옴 = false;
  for (let i = 0; i < 줄.length; i++) {
    const c = 줄[i];
    if (따옴) {
      if (c === '"' && 줄[i + 1] === '"') { 지금 += '"'; i++; }
      else if (c === '"') 따옴 = false;
      else 지금 += c;
    } else if (c === '"') 따옴 = true;
    else if (c === ",") { 칸.push(지금); 지금 = ""; }
    else 지금 += c;
  }
  칸.push(지금);
  return 칸;
}

/** CSV 한 장을 재서 흠 목록을 낸다. */
export function 재기(글, 이름 = "") {
  const 줄 = 글.split(/\r?\n/).filter((x) => x.trim());
  const 흠 = [];
  if (!줄.length) return [{ 줄번호: 0, 무엇: "빈 파일" }];

  const 머리 = 쪼개(줄[0]).map((x) => x.trim());
  if (머리.join(",") !== 머리줄.join(",")) {
    흠.push({ 줄번호: 1, 무엇: `머리줄이 다르다 — 이래야 한다: ${머리줄.join(",")}`, 실제: 머리.join(",") });
  }

  줄.slice(1).forEach((l, i) => {
    const c = 쪼개(l);
    const n = i + 2;
    if (c.length !== 7) {
      흠.push({ 줄번호: n, 무엇: `${c.length}칸이다. 7칸이어야 한다`, 실제: c[1] || c[0] });
      return;
    }
    /* 「고침」인데 팩 이름에 등급이 없으면 대기 파일을 못 만든다 — 그러면 그 고침은
       zip 에 안 실린다. 2026-08-19 에 spec-a 가 「LMS」라고만 적어 실제로 그랬다. */
    const 팩 = c[2].trim();
    const 고쳤나 = c[6].trim().startsWith("고침");
    const 팩꼴 = /^[^_s]+_(스탠다드|플러스|디럭스|프리미엄)$/;
    /* 한 줄이 여러 팩을 말할 수 있다 — 쉼표로 나눠 각각을 본다 */
    const 팩들 = 팩.split(",").map((x) => x.trim()).filter(Boolean);
    const 틀린것 = 팩들.filter((x) => !팩꼴.test(x));
    if (고쳤나 && 틀린것.length && !/해당없음|공통|판매팩|생성팩|(루틴)/.test(팩)) {
      흠.push({ 줄번호: n, 무엇: `「고침」인데 팩이 «${틀린것.join(", ")}» 이다. <업종>_<등급> 으로 적어야 대기 파일을 만들 수 있다`, 실제: c[3] });
    }

    const 값 = c[6].trim();
    if (!고침값.some((v) => 값 === v || 값.startsWith(v + "("))) {
      흠.push({ 줄번호: n, 무엇: `고침여부가 «${값}» 이다. 넷 중 하나여야 한다 (${고침값.join(" · ")})`, 실제: c[2] });
    }
  });
  return 흠;
}

/* ── 바로 부르면 오늘 CSV 를 다 잰다 ── */
if (process.argv[1] && process.argv[1].endsWith("검수표검사.mjs")) {
  const 날짜 = process.argv[2] || 오늘();
  const 파일 = existsSync("검수")
    ? readdirSync("검수").filter((x) => x.startsWith(날짜 + "_pack-qa-") && x.endsWith(".csv"))
    : [];
  if (!파일.length) {
    console.log(`${날짜} — 잴 CSV 가 없다`);
    process.exit(0);
  }
  let 모두 = 0;
  for (const f of 파일) {
    const 흠 = 재기(readFileSync("검수/" + f, "utf8"), f);
    console.log(`${f.padEnd(34)} ${흠.length ? "⛔ 흠 " + 흠.length + "곳" : "✓"}`);
    흠.slice(0, 6).forEach((h) => console.log(`   ${h.줄번호}줄: ${h.무엇}${h.실제 ? `  [${String(h.실제).slice(0, 30)}]` : ""}`));
    if (흠.length > 6) console.log(`   … 그리고 ${흠.length - 6}곳 더`);
    모두 += 흠.length;
  }
  if (모두) {
    console.log(`\n⛔ 모두 ${모두}곳. 고쳐야 마무리 회차가 제대로 읽는다.`);
    process.exit(1);
  }
  console.log("\n✓ 검수표 모양이 모두 맞는다");
}
