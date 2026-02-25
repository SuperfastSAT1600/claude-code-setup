export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price);
}

export function formatWon(price: number): string {
  return `₩${formatPrice(price)}`;
}
