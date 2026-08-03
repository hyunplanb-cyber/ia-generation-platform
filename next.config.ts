import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 검수 문서 업로드(PDF·PPTX)를 받기 위해 서버액션 본문 크기를 올린다(기본 1MB).
    serverActions: { bodySizeLimit: "8mb" },
  },
  // 판매 zip은 코드가 아니라 데이터라, 그냥 두면 배포에 실리지 않는다.
  // 다운로드 경로에만 packs/ 를 함께 실어 보낸다(adapters/storage/fs-pack-storage.ts).
  outputFileTracingIncludes: {
    "/api/packages/[packageId]/[planId]/download": ["./packs/**/*"],
  },
};

export default nextConfig;
