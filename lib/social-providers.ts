export interface EnabledSocialProviders {
  google: boolean;
  naver: boolean;
  kakao: boolean;
}

export function getEnabledSocialProviders(): EnabledSocialProviders {
  return {
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    naver: !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
    kakao: !!(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET),
  };
}
