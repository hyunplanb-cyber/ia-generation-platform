import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { PACKAGES } from "@/lib/packages";

// 검색엔진에 공개 페이지를 알린다.
// 패키지 상세는 목록에서 자동 생성하므로, 패키지를 추가하면 여기도 함께 반영된다.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/free", priority: 0.9 },
    { path: "/packages", priority: 0.9 },
    ...PACKAGES.map((p) => ({ path: `/packages/${p.id}`, priority: 0.9 })),
    { path: "/deliverables", priority: 0.8 },
    { path: "/contact", priority: 0.3 },
    { path: "/terms", priority: 0.2 },
    { path: "/privacy", priority: 0.2 },
  ];

  return paths.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    priority,
  }));
}
