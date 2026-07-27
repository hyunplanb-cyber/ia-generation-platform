import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 검수 문서 업로드(PDF·PPTX)를 받기 위해 서버액션 본문 크기를 올린다(기본 1MB).
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
