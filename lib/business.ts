// 사업자 정보의 유일한 출처. 푸터·문의·약관·개인정보처리방침이 모두 여기를 본다.
//
// 통신판매업 신고를 마쳐 신고번호·사업장 주소를 채웠다(2026-07-27).
// 전자상거래법상 자사 결제 시 필수인 표시 항목이 이제 모두 갖춰졌다.
export const BUSINESS = {
  name: "카페인컬러",
  ceo: "최현",
  registrationNo: "608-79-25359",
  /** 통신판매업 신고번호. */
  mailOrderNo: "제 2026-서울강남-04184 호",
  /** 사업장 주소. */
  address: "서울특별시 강남구 학동로4길 15, 719호 동화상가 (논현동)",
  /** 대표 연락 이메일. */
  email: "caffeinecolor.all@gmail.com",
  /** 전화번호 — 공개할 번호가 정해지면 채운다. */
  phone: "",
} as const;

/**
 * 화면에 표시할 사업자 정보 목록.
 * 값이 빈 항목은 빠지므로, 위 상수를 채우면 그때 자동으로 나타난다.
 */
export function businessInfoRows(): [label: string, value: string][] {
  return (
    [
      ["상호", BUSINESS.name],
      ["대표자", BUSINESS.ceo],
      ["사업자등록번호", BUSINESS.registrationNo],
      ["통신판매업 신고번호", BUSINESS.mailOrderNo],
      ["사업장 주소", BUSINESS.address],
      ["연락처", BUSINESS.phone],
      ["문의", BUSINESS.email],
    ] as [string, string][]
  ).filter(([, value]) => value !== "");
}
