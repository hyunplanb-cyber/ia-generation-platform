// 사이트 절대 주소. 사이트맵·robots·메타데이터가 공유한다.
// 배포 도메인이 바뀌면 NEXT_PUBLIC_SITE_URL 하나만 바꾸면 된다.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://caffeinecolor.com";
