/**
 * Single source of truth for brand copy, navigation and contact details.
 * Update here once; every page follows.
 */

export const brand = {
  company: 'NARANI',
  product: 'BIDBOX',
  productFooter: 'BIDBOX Intelligence',
  footerNote: '고성능 입찰 분석을 위해 설계되었습니다.',
  email: 'surport@narani.my', // TODO: confirm — likely support@narani.my
};

export type NavItem = {
  key: string;
  label: string;
  href: string;
};

/** Top-level site navigation (company surface). */
export const siteNav: NavItem[] = [
  { key: 'company', label: '회사소개', href: '/company/' },
  { key: 'bidbox', label: 'BIDBOX', href: '/bidbox/' },
];

/** BIDBOX product navigation. */
export const productNav: NavItem[] = [
  { key: 'service', label: '서비스', href: '/bidbox/service/' },
  { key: 'pricing', label: '요금', href: '/bidbox/pricing/' },
  { key: 'demo', label: '데모 신청', href: '/bidbox/demo/' },
  { key: 'contact', label: '문의', href: '/bidbox/contact/' },
];

export const primaryCta = {
  demo: { label: '데모 신청', href: '/bidbox/demo/' },
  program: { label: '프로그램 접속', href: '/bidbox/pricing/' },
};

/**
 * Shared capability list. The `icon` markup is kept for future use but is not
 * rendered on any page: the catalogue and specimen layouts are icon-free.
 * Stroke is `currentColor` so the glyph follows the surrounding text colour.
 */
export const capabilities: { title: string; body: string; icon: string }[] = [
  {
    title: '데이터 분석',
    body: '10년간의 조달청 나라장터 공고와 결과를 분석합니다.',
    icon: '<path d="M3 18V9M8.3 18V3M13.7 18v-6M19 18V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  },
  {
    title: '낙찰금액 예측',
    body: 'AI 데이터 분석으로 예상 낙찰금액과 투찰율을 계산합니다.',
    icon: '<path d="M11 2.5l7.5 4.3v8.4L11 19.5l-7.5-4.3V6.8z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M11 11l7.5-4.2M11 11v8.4M11 11L3.5 6.8" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  },
  {
    title: '예측근거 제시',
    body: '단순 금액제시가 아닌, 분석한 근거를 함께 제시합니다.',
    icon: '<path d="M4 4h9l5 5v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M6.5 11h7M6.5 14.5h4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  },
];
