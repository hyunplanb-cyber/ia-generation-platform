// 사이트 절대 주소. 사이트맵·robots·메타데이터가 공유한다.
// 배포 도메인이 바뀌면 NEXT_PUBLIC_SITE_URL 하나만 바꾸면 된다.
//
// ⛔ 2026-09-10 — «www 를 붙였다.» 전에는 www 없는 주소였는데 실제로 서비스되는 자리는
//   www 쪽이다(caffeinecolor.com → 308 → www.caffeinecolor.com).
//   그래서 사이트맵을 www 자리에 올려 두고 그 «안에 든 주소 15개»는 www 없는 것이 되어,
//   구글 서치콘솔이 「가져올 수 없음」으로 물리쳤다. 색인도 두 주소로 갈릴 자리였다.
//   ⚠ 이 한 줄이 사이트맵·robots·canonical·OG 를 다 먹인다. 여기만 맞으면 넷이 같이 맞는다.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.caffeinecolor.com";

/**
 * 대표 시연 영상(유튜브) — 여행 AI팩 스펙팩으로 144화면을 실제로 만든 기록.
 * 메인 랜딩과 AI팩 상세가 같이 쓰므로 여기 한 곳에서만 관리한다.
 * (랜딩은 클라이언트 컴포넌트라 lib/packages를 못 가져온다 — 템플릿 데이터가 통째로 딸려 온다.)
 */
export const SHOWCASE_VIDEO_ID = "s1jr1_Qxja8";
