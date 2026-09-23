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
