// 사이트 절대 주소. 사이트맵·robots·메타데이터가 공유한다.
// 배포 도메인이 바뀌면 NEXT_PUBLIC_SITE_URL 하나만 바꾸면 된다.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://caffeinecolor.com";

/**
 * 대표 시연 영상(유튜브) — 여행 AI팩 스펙팩으로 144화면을 실제로 만든 기록.
 * 메인 랜딩과 AI팩 상세가 같이 쓰므로 여기 한 곳에서만 관리한다.
 * (랜딩은 클라이언트 컴포넌트라 lib/packages를 못 가져온다 — 템플릿 데이터가 통째로 딸려 온다.)
 */
export const SHOWCASE_VIDEO_ID = "RmbiLbCQKEI";
