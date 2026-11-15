/**
 * Point pricing. Points are the unit of billing: 1 point = ₩1,000,
 * consumed once per search / AI prediction.
 */

export const pointRate = 1000;

export type Plan = {
  id: string;
  points: number;
  label: string;
  /** Charged amount in KRW. */
  price: number;
  /** Pre-discount amount, when a discount applies. */
  listPrice: number | null;
  note: string;
  /** Marks the plan the sales team leads with. */
  featured?: boolean;
};

export const POINT_NOTE =
  '포인트는 조회당 사용됩니다. 동일한 공고를 재조회하면 포인트가 차감됩니다.';

/** 포인트 사용 범위 문장. faq.ts 등에서 import 해 같은 문구를 유지한다. */
export const POINT_USAGE_RULE =
  '공고 · 낙찰 탐색 및 AI 예측당 1포인트가 사용됩니다.';

/**
 * 정가 대비 할인 문구. listPrice 와 price 의 차이로 0.1% 단위를 만듭니다.
 * 정가가 없거나 실결제액이 정가 이상이면 null 입니다. 페이지에 퍼센트를 적지 않습니다.
 */
export function discountLabel(plan: Plan): string | null {
  if (plan.listPrice == null || plan.listPrice <= 0 || plan.price >= plan.listPrice) return null;
  const tenths = Math.round(((plan.listPrice - plan.price) * 1000) / plan.listPrice);
  if (tenths <= 0) return null;
  const whole = Math.trunc(tenths / 10);
  const frac = tenths % 10;
  const percent = frac === 0 ? String(whole) : `${whole}.${frac}`;
  return `${percent}% 할인`;
}

export const plans: Plan[] = [
  {
    id: 'p100',
    points: 100,
    label: '100포인트',
    price: 100_000,
    listPrice: null,
    note: '가볍게 시작하기',
  },
  {
    id: 'p500',
    points: 500,
    label: '500포인트',
    price: 450_000,
    listPrice: 500_000,
    note: '가장 많이 선택하는 구성',
    featured: true,
  },
  {
    id: 'p1000',
    points: 1000,
    label: '1000포인트',
    price: 900_000,
    listPrice: 1_000_000,
    note: '예측을 자주 돌리는 팀',
  },
];
