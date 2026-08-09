import { betterAuth } from 'better-auth';
import { REVIEW_MODE } from "@/lib/flags";
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { db } from '@/db/client';

// 각 소셜 로그인은 클라이언트ID/시크릿이 설정된 경우에만 활성화된다 —
// 아직 설정하지 않은 제공자의 버튼은 자동으로 숨겨진다(lib/social-providers.ts 참조).
const socialProviders: NonNullable<Parameters<typeof betterAuth>[0]['socialProviders']> = {};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}
if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
  socialProviders.naver = {
    clientId: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
  };
}
if (process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET) {
  socialProviders.kakao = {
    clientId: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
  };
}

// 배포 도메인의 apex(caffeinecolor.com)와 www(www.caffeinecolor.com)를 모두 신뢰 출처로 넣는다.
// Vercel이 실제로는 www로 서비스하는데 이 목록에 www가 없으면, 로그아웃 같은 상태 변경
// 요청(POST)이 "신뢰하지 않는 출처"로 거부되어(403) 로그아웃이 되지 않는다.
// SITE_URL이 바뀌어도 apex/www 두 형태가 함께 따라오도록 호스트에서 계산한다.
function productionOrigins(): string[] {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://caffeinecolor.com';
  try {
    const host = new URL(site).host.replace(/^www\./, '');
    return [`https://${host}`, `https://www.${host}`];
  } catch {
    return ['https://caffeinecolor.com', 'https://www.caffeinecolor.com'];
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  /* 이메일·비밀번호는 가입도 로그인도 받지 않는다 — 비밀번호를 아예 보관하지 않기 위해서.
     화면에서 폼을 지우는 것만으로는 API 직접 호출을 막지 못하므로 서버에서도 잠근다.
   *
   * ⚠ 예외 하나 — 카드사 심사 기간(REVIEW_MODE)에만 연다.
   *
   *   우리는 소셜 로그인만 받는데, 심사관은 **다른 회사·다른 지역**에서 접속한다.
   *   구글 계정을 새로 파서 넘기면 낯선 기기 로그인으로 2단계 인증이 걸려
   *   심사관이 못 들어오고, 그러면 「결제창이 확인되지 않는다」로 반려된다(FAQ 10번).
   *   남의 구글 계정 자격증명을 넘기는 것 자체도 위험하다.
   *
   *   그래서 «우리 서비스 전용» 아이디·비밀번호를 하나 만들어 넘긴다.
   *   BILLING_ALLOWLIST 에 적힌 이메일에만 열리므로 일반 가입 경로는 그대로 소셜뿐이다.
   *   심사가 끝나 REVIEW_MODE 를 끄면 이 문은 저절로 닫힌다 — 끄는 걸 잊을 일이 없다.
   *   그때 그 계정을 지우면 비밀번호를 보관하지 않는 원칙으로 완전히 돌아온다. */
  emailAndPassword: {
    enabled: REVIEW_MODE,
    /* 가입은 열지 않는다 — 로그인만 열린다.
       열어 두면 심사 2주 동안 누구나 이메일·비밀번호로 계정을 만들 수 있고,
       그건 우리가 막으려던 「공짜 크레딧」 문을 옆으로 다시 여는 셈이다.
     *
     * ALLOW_REVIEW_SIGNUP 은 **배포 서버에 절대 넣지 않는다.**
     * 심사 계정을 만드는 스크립트(make-review-account.mts)가 자기 프로세스에서만
     * 잠깐 켠다. `disableSignUp` 은 서버 안에서 부르는 auth.api.signUpEmail() 까지
     * 막기 때문에, 이 문이 없으면 계정을 만들 방법이 없다(2026-08-09 확인). */
    disableSignUp: process.env.ALLOW_REVIEW_SIGNUP !== "true",
  },
  socialProviders,
  // 로컬 개발 시 다른 프로젝트와 3000번 포트가 겹쳐 매번 다른 포트로 뜰 수 있어
  // localhost의 모든 포트를 신뢰 출처로 허용한다. 프로덕션은 실제 배포 도메인만 신뢰됨(BETTER_AUTH_URL 기준).
  trustedOrigins: ['http://localhost:*', ...productionOrigins()],
  user: {
    additionalFields: {
      // FR-19: 향후 결제 등급 구분용. 가입 시 클라이언트가 지정할 수 없도록 input:false — 서버가 항상 "free"로 채운다.
      plan: {
        type: 'string',
        required: false,
        defaultValue: 'free',
        input: false,
      },
      // FR-18: 계정 탈퇴 요청 시각. 채워지면 30일 유예 상태.
      deletedAt: {
        type: 'date',
        required: false,
        input: false,
      },
    },
  },
});
