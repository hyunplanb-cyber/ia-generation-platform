import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { db } from '@/db/client';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: {
    enabled: true,
  },
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
    },
  },
});
