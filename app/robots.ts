import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// 공개 페이지는 수집을 허용하고, 로그인 이후 영역은 제외한다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
