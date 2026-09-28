/**
 * Single source of truth for brand copy, navigation and contact details.
 * Update here once; every page follows.
 */

export const brand = {
  company: 'NARANI',
  product: 'BIDBOX',
  productFooter: 'BIDBOX Intelligence',
  footerNote: '고성능 입찰 분석을 위해 설계되었습니다.',
  email: 'support@narani.my',
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
 * 폼 접수 엔드포인트. 제품 본체(refac_bid_box)의 문의·데모 접수 API 주소입니다.
 *
 * 값이 빈 문자열이면 `enquiryForm` 은 900ms 지연 시뮬레이션으로만 동작하고 실제로는
 * 아무것도 보내지 않습니다. 주소를 지우지 마세요. 본체에 접수 API 가 생기면 이 한 곳만
 * 채우면 됩니다. 아무 주소도 없는 상태에서 존재하지 않는 경로로 보내면 사용자는 접수에
 * 성공한 화면을 보면서 문의를 잃습니다.
 */
export const enquiryEndpoint = '';

/**
 * Google Analytics 4 측정 ID (예: G-XXXXXXXXXX).
 *
 * 빈 문자열이면 GA4 태그를 아예 삽입하지 않습니다. 태그를 넣지 않은 상태로 두고
 * 실사용 데이터가 없다고 "|ga| null" 로 오해하는 일을 막기 위해 값이 있는 경우에만
 * 스크립트를 내보냅니다.
 */
export const gaMeasurementId = '';

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
