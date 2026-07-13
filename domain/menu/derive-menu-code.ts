// Story 2.2가 이 함수를 재사용해 충돌/1글자/예약어 검증을 감싸 추가한다.
export function deriveMenuCode(nameEn: string): string {
  return nameEn.slice(0, 2).toUpperCase();
}
