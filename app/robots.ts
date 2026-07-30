import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// 공개 페이지는 수집을 허용하고, 로그인 이후 영역은 제외한다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /demo/ — 스펙팩으로 만든 데모 사이트. 남의 브랜드 화면이라
      // 검색에 잡히면 우리 판매 페이지와 경쟁하게 된다(각 HTML에도 noindex).
      disallow: ["/dashboard/", "/api/", "/demo/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
