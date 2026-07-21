import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// 한 번의 요청 안에서 세션을 여러 번 물어봐도(헤더·레이아웃·페이지)
// 실제 조회는 한 번만 일어나도록 감싼다.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});
