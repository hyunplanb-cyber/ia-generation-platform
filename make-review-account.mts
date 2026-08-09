/* 카드사 심사관에게 넘길 «우리 서비스 전용» 계정을 하나 만든다.
 *
 * 왜 필요한가
 *   우리는 소셜 로그인만 받는데, 심사관은 다른 회사·다른 지역에서 접속한다.
 *   구글 계정을 새로 파서 넘기면 낯선 기기 로그인으로 2단계 인증이 걸려
 *   심사관이 못 들어오고, 그러면 「결제창이 확인되지 않는다」로 반려된다(토스 FAQ 10번).
 *   그래서 구글과 무관한 아이디·비밀번호를 하나 만들어 넘긴다.
 *
 * ⚠ 비밀번호는 이 파일에 적지 않는다. 환경변수로 «사람이» 넣는다.
 *   코드에 적으면 깃 기록에 영원히 남는다. 화면에도 다시 찍지 않는다.
 *
 * 쓰기 전에
 *   1) REVIEW_MODE=true 로 배포돼 있어야 한다(안 그러면 이 계정으로 로그인이 안 열린다)
 *   2) BILLING_ALLOWLIST 에 이 이메일이 들어 있어야 결제 화면이 열린다
 *
 * 쓰는 법 (PowerShell)
 *   $env:REVIEW_EMAIL="review@example.com"
 *   $env:REVIEW_PASSWORD="사장님이 정한 비밀번호"
 *   npx tsx make-review-account.mts
 *
 * 심사가 끝나면 이 계정을 지운다 — 그러면 비밀번호를 보관하지 않는 원칙으로 돌아온다.
 */
/* ⚠ 아래 두 줄이 «lib/auth 를 불러오기 전»에 와야 한다.
 *
 *   `disableSignUp` 은 서버 안에서 부르는 auth.api.signUpEmail() 까지 막는다
 *   (better-auth 1.6 의 sign-up 핸들러가 맨 앞에서 걸러낸다 — 2026-08-09 확인).
 *   그래서 이 스크립트의 «프로세스에서만» 잠깐 연다.
 *   설정은 모듈을 불러오는 순간 굳으므로, 정적 import 로는 늦는다 → 동적 import 를 쓴다.
 *
 *   ALLOW_REVIEW_SIGNUP 을 배포 서버에 넣으면 안 된다 — 그러면 누구나 가입할 수 있다.
 */
process.env.ALLOW_REVIEW_SIGNUP = "true";
process.env.REVIEW_MODE = "true"; // emailAndPassword 자체를 켜는 스위치

const { auth } = await import("./lib/auth");
const { REVIEW_MODE } = await import("./lib/flags");

const email = process.env.REVIEW_EMAIL?.trim();
const password = process.env.REVIEW_PASSWORD;
const name = process.env.REVIEW_NAME?.trim() || "심사용 계정";

if (!email || !password) {
  console.error("REVIEW_EMAIL 과 REVIEW_PASSWORD 를 환경변수로 넣어 주세요.");
  console.error("  $env:REVIEW_EMAIL=\"review@example.com\"");
  console.error("  $env:REVIEW_PASSWORD=\"...\"");
  process.exit(1);
}
if (password.length < 8) {
  console.error("비밀번호는 8자 이상으로 정해 주세요.");
  process.exit(1);
}
if (!REVIEW_MODE) {
  /* 막지 않고 알리기만 한다 — 계정을 먼저 만들어 두고 나중에 켜는 순서도 있다.
     다만 REVIEW_MODE 가 꺼진 채로는 이 계정으로 «로그인이 안 된다». */
  console.warn("⚠ REVIEW_MODE 가 꺼져 있습니다. 계정은 만들어지지만 로그인은 열리지 않습니다.");
  console.warn("  배포 환경에 REVIEW_MODE=true 를 넣어야 심사관이 들어올 수 있습니다.\n");
}

/* 위에서 ALLOW_REVIEW_SIGNUP 을 켰기에 이 프로세스에서만 가입이 열려 있다.
   배포 서버는 그 값이 없으므로 바깥(HTTP)으로는 계속 닫혀 있다. */
try {
  await auth.api.signUpEmail({ body: { email, password, name } });
  console.log(`✔ 심사용 계정을 만들었습니다 — ${email}`);
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  if (/exist/i.test(msg)) {
    console.log(`· 이미 있는 계정입니다 — ${email} (비밀번호는 그대로입니다)`);
  } else {
    console.error("만들지 못했습니다:", msg);
    process.exit(1);
  }
}

console.log("");
console.log("다음 순서");
console.log(`  1. Vercel 환경변수에 BILLING_ALLOWLIST 를 넣습니다 (이 이메일 포함)`);
console.log(`  2. REVIEW_MODE=true · PACKAGE_SALE_OPEN=true · CREDITS_OPEN=false`);
console.log(`  3. 이 계정으로 로그인해 결제경로 12장을 «배포된 도메인»에서 캡처합니다`);
console.log(`  4. 계약담당자에게 이 아이디와 비밀번호를 함께 전달합니다`);
console.log("");
console.log("  ※ 비밀번호는 여기 찍지 않습니다. 사장님이 넣으신 값 그대로입니다.");
