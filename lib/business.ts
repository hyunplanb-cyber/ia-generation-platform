// 사업자 정보의 유일한 출처. 푸터·문의·약관·개인정보처리방침이 모두 여기를 본다.
//
// ⚠️ 우리 사이트에서 직접 결제를 받기 시작하면(= 통신판매) 전자상거래법상
//    "사업장 주소"와 "통신판매업 신고번호" 표시가 필수가 된다.
//    지금은 판매를 크몽에서만 하고 있어 비워둔 상태 — 결제를 열기 전에 반드시 채울 것.
export const BUSINESS = {
  name: "카페인컬러",
  ceo: "최현",
  registrationNo: "608-79-25359",
  /** 통신판매업 신고번호 — 신고 완료 후 채운다. */
  mailOrderNo: "",
  /** 사업장 주소 — 자사 결제를 열기 전에 채운다. */
  address: "",
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
