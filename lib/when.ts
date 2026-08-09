// 사람에게 보여주는 날짜·시각. 손님은 전부 한국에 있다.

/**
 * 왜 시간대를 «못 박는가» — 2026-08-09
 *
 * 크레딧 사용 내역의 충전 시각이 실제보다 **9시간 밀려 있었다.**
 * 오후 8:16 에 충전한 것이 「오전 11:16」으로 찍혔다.
 *
 * 두 가지가 겹쳤다.
 *   ① DB(Neon)의 시간대가 GMT 라, `defaultNow()` 는 **UTC 벽시계**를 넣는다.
 *      컬럼도 `timestamp`(시간대 없음)라 「이게 어느 지역 시각인지」 정보가 없다.
 *   ② 화면을 그리는 곳이 **서버 컴포넌트**다. 베르셀 서버는 UTC 로 산다.
 *      `Intl.DateTimeFormat("ko-KR", …)` 은 지역만 한국이고 **시간대는 그 기계 것**을 쓴다.
 *      그래서 한국말로 예쁘게 찍히지만 숫자는 UTC 그대로다.
 *
 * `ko-KR` 을 적었으니 한국 시각이 나오겠거니 했던 것이 함정이다 —
 * **지역(어떻게 쓰나)과 시간대(몇 시인가)는 다른 것이다.**
 *
 * `timeZone` 을 못 박으면 서버에서 그리든 브라우저에서 그리든 같은 값이 나온다.
 * 곁들여 **하이드레이션 어긋남도 사라진다** — 서버(UTC)와 손님 브라우저(KST)가
 * 다른 글자를 만들어 내던 문제가 원천적으로 없어진다.
 *
 * ⚠ 새 화면에서 날짜를 보여줄 때 `Intl.DateTimeFormat` 을 직접 쓰지 말 것.
 *   다섯 군데가 따로 적혀 있다가 다섯 군데 모두 같은 병에 걸려 있었다.
 */
const ZONE = "Asia/Seoul";

/** 2026. 8. 9. */
export function 날짜(d: Date): string {
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeZone: ZONE }).format(d);
}

/** 2026. 8. 9. 오후 8:16 */
export function 날짜시각(d: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: ZONE,
  }).format(d);
}
