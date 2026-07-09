import { createAuthClient } from 'better-auth/react';

// baseURL을 지정하지 않으면 현재 origin(같은 도메인)으로 요청한다 — 로컬 개발 포트가
// 매번 바뀌어도(다른 프로젝트와 3000번 포트가 겹칠 때 등) 항상 올바른 주소로 요청된다.
export const authClient = createAuthClient();
