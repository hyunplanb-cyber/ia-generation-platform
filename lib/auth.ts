import { betterAuth } from 'better-auth';
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

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: {
    // 기존 이메일 계정의 "로그인"은 계속 열어둔다.
    enabled: true,
    // 신규 "가입"은 구글로만 받는다 — 비밀번호를 보관하지 않기 위해서.
    // 화면에서 폼을 지우는 것만으로는 API 직접 호출을 막지 못하므로 서버에서도 잠근다.
    disableSignUp: true,
  },
  socialProviders,
  // 로컬 개발 시 다른 프로젝트와 3000번 포트가 겹쳐 매번 다른 포트로 뜰 수 있어
  // localhost의 모든 포트를 신뢰 출처로 허용한다. 프로덕션은 실제 배포 도메인만 신뢰됨(BETTER_AUTH_URL 기준).
  trustedOrigins: ['http://localhost:*'],
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
