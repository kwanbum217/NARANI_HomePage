/**
 * 홈과 BIDBOX 홈이 함께 쓰는 예시 예측입니다. 실적이 아닙니다.
 */

export const specimen = {
  notice: '2026년 시설 경비 용역',
  kind: '용역 · 서울',
  predicted: 418_200_000,
  basis: 452_000_000,
} as const;

export function formatWon(amount: number): string {
  return '₩' + amount.toLocaleString('ko-KR');
}

/** 기초금액 대비 예상 낙찰률. 0.1% 단위. */
export function specimenRate(predicted: number, basis: number): string {
  if (basis <= 0) return '';
  const tenths = Math.round((predicted * 1000) / basis);
  const whole = Math.trunc(tenths / 10);
  const frac = tenths % 10;
  const percent = frac === 0 ? String(whole) : `${whole}.${frac}`;
  return `${percent}%`;
}
