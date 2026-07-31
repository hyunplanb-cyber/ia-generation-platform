import { HomeLanding } from "./home-landing";
import { SITE_URL } from "@/lib/site";
import { BUSINESS } from "@/lib/business";
import { aiPackCards } from "@/lib/packages";

// 홈 메타데이터는 루트 layout의 기본값(제목·설명·OG)을 그대로 사용한다.
// 여기서는 검색엔진·AI가 서비스를 이해하도록 구조화 데이터(JSON-LD)만 더한다.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: BUSINESS.name,
      url: SITE_URL,
      email: BUSINESS.email,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: BUSINESS.name,
      inLanguage: "ko-KR",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: BUSINESS.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description:
        "컨셉 한 줄이면 화면 목록·화면별 프롬프트·AI 빌드 스펙팩을 만들어 바이브코딩(Cursor·Claude Code)에 바로 쓰고, 오픈 전엔 사이트 검수 리포트까지 받는 서비스.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      {/* AI팩 카드는 서버에서 뽑아 넘긴다 — 랜딩(클라이언트)이 상품 데이터를 직접 가져오면
          템플릿 화면 수백 개가 클라이언트 번들에 딸려 들어간다. */}
      <HomeLanding packs={aiPackCards()} />
    </>
  );
}
