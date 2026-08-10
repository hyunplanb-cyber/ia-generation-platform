/* 손님이 «무엇을 만들려고 했는지» 세어 본다.
 *
 * 왜 만드나
 *   업종을 고를 때 바깥 시장 조사만 봤다. 그런데 우리에겐 더 좋은 재료가 있다 —
 *   실제로 우리 앱에 들어와 컨셉을 적어 본 사람들의 말이다.
 *   「인테리어」처럼 우리가 못 만들어 준 것이 여기 남아 있다.
 *   그 사람들은 이미 우리를 찾아왔던 사람이라, 바깥 통계보다 훨씬 가까운 수요다.
 *
 * ⚠ 누가 적었는지는 보지 않는다.
 *   이 스크립트는 «무슨 말이 몇 번 나왔나»만 센다. 사람과 이어 붙이지 않는다.
 *   업종을 고르는 데 필요한 것은 낱말의 수이지 누구인지가 아니다.
 *   짧은 예시를 보여줄 때도 앞부분만 잘라 쓰고 계정 정보는 절대 함께 내지 않는다.
 *
 * 쓰는 법
 *   npx tsx 조사-생성키워드.mts           최근 90일
 *   npx tsx 조사-생성키워드.mts 30         최근 30일
 */
import { desc, gte, isNull, and } from "drizzle-orm";

/* .env.local 을 손으로 읽는다 — Next.js 밖에서 도는 스크립트라 자동으로 안 읽힌다.
   db/client 를 «부르기 전»에 읽어야 한다. 연결 문자열이 모듈을 읽는 시점에 쓰인다. */
const dotenv = await import("dotenv");
dotenv.config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL 이 없습니다 — .env.local 을 확인해 주세요.");
  process.exit(1);
}

const { db } = await import("./db/client");
const { project } = await import("./db/schema");

const 며칠 = Number(process.argv[2] || 90);
const 부터 = new Date(Date.now() - 며칠 * 24 * 60 * 60 * 1000);

/* 세어도 뜻이 없는 말들 — 어느 컨셉에나 들어간다.
   이걸 안 빼면 「사이트·서비스·플랫폼」이 늘 1·2·3등이 된다. */
const 흔한말 = new Set([
  "사이트", "서비스", "플랫폼", "홈페이지", "웹사이트", "페이지", "앱", "어플",
  "만들기", "만드는", "만들어", "하는", "위한", "있는", "같은", "우리", "저희",
  "그리고", "또는", "등을", "관련", "각종", "다양한", "간단한", "전문", "기반",
  "이용", "사용", "제공", "운영", "관리", "가능", "필요", "예정", "정도",
  "고객", "회원", "사용자", "손님", "이용자", "사람", "업체", "회사", "기업",
  "온라인", "모바일", "인터넷", "디지털", "스마트",
]);

/* 우리가 이미 만든 업종 — 나오면 「또 나왔다」로만 세고 후보에서는 뺀다. */
const 이미만든것: Record<string, string[]> = {
  "LMS·강의": ["강의", "교육", "수업", "학원", "클래스", "레슨", "과외", "인강", "lms"],
  "뷰티샵 예약": ["미용", "헤어", "네일", "속눈썹", "왁싱", "피부", "에스테틱", "살롱", "뷰티"],
  "여행 예약": ["여행", "투어", "티켓", "관광", "숙소", "액티비티"],
  "공동구매": ["공동구매", "공구", "소셜커머스", "펀딩"],
  "동네 매칭": ["매칭", "중개", "숨고", "견적", "고수", "출장"],
  "장비 렌탈": ["렌탈", "대여", "빌리", "렌트"],
};

/* 테스트로 적은 것을 갈라낸다.
   처음 돌려 보니 28건 중 24건이 「ㅇㅇ」·「ㅎㅎ」·「ㄹㄹㄹ」·「uuu」였다(2026-08-10).
   우리가 직접 눌러 본 자국이다. 이걸 안 빼면 «못 만든 업종»이 24건으로 보여
   있지도 않은 수요를 읽게 된다. 없는 신호를 있다고 읽는 것이 가장 나쁘다. */
function 테스트인가(s: string): boolean {
  const 글 = s.replace(/\s/g, "");
  if (글.length < 6) return true;                 // 여섯 자도 안 되면 컨셉이 아니다
  if (/^[ㄱ-ㅎㅏ-ㅣ]+$/.test(글)) return true;      // 자모만 (ㅇㅇ, ㅋㅋ)
  if (/^(.)\1*$/.test(글)) return true;            // 같은 글자만 (ㄹㄹㄹ, aaa)
  if (new Set(글).size <= 2) return true;          // 두 종류 이하 (uuu, abab)
  if (/^[a-z]{1,8}$/i.test(글)) return true;       // 짧은 로마자 (test, asdf)
  return false;
}

function 낱말들(s: string): string[] {
  return s
    .replace(/[^가-힣a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length >= 2 && !흔한말.has(w) && !/^\d+$/.test(w));
}

const 줄들 = await db
  .select({ concept: project.concept, menuDraft: project.menuDraft, at: project.createdAt })
  .from(project)
  .where(and(gte(project.createdAt, 부터), isNull(project.deletedAt)))
  .orderBy(desc(project.createdAt));

console.log(`\n생성 키워드 — 최근 ${며칠}일 · 프로젝트 ${줄들.length}건\n`);

if (줄들.length === 0) {
  console.log("아직 만들어진 프로젝트가 없습니다. 바깥 조사만으로 업종을 고르세요.\n");
  process.exit(0);
}

// ── 테스트로 적은 것부터 걷어낸다 ────────────────────────────
const 진짜 = 줄들.filter((r) => !테스트인가(`${r.concept} ${r.menuDraft ?? ""}`));
const 테스트수 = 줄들.length - 진짜.length;
console.log(`테스트로 보이는 것 ${테스트수}건을 뺐습니다 — 남은 것 ${진짜.length}건\n`);

if (진짜.length === 0) {
  console.log(`⚠ 읽을 만한 입력이 하나도 없습니다.
  아직 «남의 손»으로 만들어진 프로젝트가 없다는 뜻입니다.
  이 재료는 지금 쓸 수 없습니다 — 바깥 시장 조사로만 업종을 고르세요.
  손님이 늘면 다시 돌려 보세요.\n`);
  process.exit(0);
}

// ── 우리가 이미 만든 업종에 걸리나 ──────────────────────────
const 걸린것: Record<string, number> = {};
const 안걸린줄: { 글: string; at: Date }[] = [];

for (const r of 진짜) {
  const 글 = `${r.concept} ${r.menuDraft ?? ""}`.toLowerCase();
  let 걸렸나 = false;
  for (const [업종, 말들] of Object.entries(이미만든것)) {
    if (말들.some((w) => 글.includes(w))) {
      걸린것[업종] = (걸린것[업종] ?? 0) + 1;
      걸렸나 = true;
      break;
    }
  }
  if (!걸렸나) 안걸린줄.push({ 글: r.concept, at: r.at });
}

console.log("── 이미 만든 업종으로 덮이는 것 ──");
const 덮인수 = Object.values(걸린것).reduce((a, b) => a + b, 0);
if (덮인수 === 0) console.log("  없음");
for (const [업종, n] of Object.entries(걸린것).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}건  ${업종}`);
}
console.log(`  ─────────\n  ${String(덮인수).padStart(3)}건  덮임 (읽을 만한 것의 ${Math.round(덮인수 / 진짜.length * 100)}%)`);

// ── 못 덮은 것이 다음 업종 후보다 ───────────────────────────
console.log(`\n── 우리가 «아직 못 만든» 것 ${안걸린줄.length}건 ──`);
console.log("   여기가 다음 업종 후보다. 우리를 찾아왔는데 못 받고 간 사람들이다.\n");

const 셈 = new Map<string, number>();
for (const r of 안걸린줄) for (const w of new Set(낱말들(r.글))) 셈.set(w, (셈.get(w) ?? 0) + 1);

const 상위 = [...셈.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 30);
if (상위.length === 0) {
  console.log("   두 번 이상 나온 낱말이 없습니다. 아직 표본이 적습니다.");
} else {
  console.log("   두 번 이상 나온 낱말");
  for (const [w, n] of 상위) console.log(`     ${String(n).padStart(3)}회  ${w}`);
}

// 어떤 말인지 감을 잡게 앞부분만 몇 줄 보여준다. 누가 적었는지는 내지 않는다.
console.log("\n   어떤 말이었나 (앞 60자만 · 최근 순 10건)");
for (const r of 안걸린줄.slice(0, 10)) {
  const 날 = r.at.toISOString().slice(0, 10);
  console.log(`     ${날}  ${r.글.replace(/\s+/g, " ").slice(0, 60)}…`);
}

console.log(`
── 이 결과를 어떻게 쓰나 ──
  세 관문(지시서 「업종은 조사해서 고른다」)의 ③번 재료다.
  여기서 자주 나온 말을 바깥 시장 조사와 «견줘서» 고른다.

  ⚠ 여기 많이 나왔다고 그대로 만들지 않는다.
     · 주제가 한 문장으로 말해지는가
     · 카페24·아임웹으로 안 되는가
     이 둘을 통과해야 만든다. 많이 찾는다고 우리가 이기는 칸은 아니다.
`);

process.exit(0);
