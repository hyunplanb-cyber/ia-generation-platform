import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// 검색엔진에 공개 페이지를 알린다. 샘플 페이지가 늘어나면 여기에 추가한다.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/packages", priority: 0.9 },
    { path: "/packages/lms", priority: 0.9 },
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
