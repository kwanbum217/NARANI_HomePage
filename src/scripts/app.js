import Alpine from 'alpinejs';
import { brand } from '../data/site';
import { enquiryForms, networkError } from '../data/enquiry';
import { plans } from '../data/pricing';

/* NARANI / BIDBOX — shared client behaviour, bundled by Astro. */

/**
 * GA4 이벤트를 보냅니다.
 *
 * 반드시 gtag() 로 호출해야 합니다. dataLayer 에 plain object 를 push 하면
 * GA4 라이브러리가 그 항목을 무시합니다. gtag 는 같은 배열에 `arguments` 객체를
 * push 하고, GA4 라이브러리가 그 형식만 인식해 네트워크로 보냅니다.
 * (dataLayer.push({event:...}) 로 넣으면 콘솔 에러도 없이 조용히 유실됩니다.)
 *
 * GA4 태그는 BaseLayout.astro 가 측정 ID가 있을 때만 삽입하므로, 태그가 없으면
 * gtag 가 undefined 여서 아무 일도 하지 않습니다. 그 경우에도 콘솔 에러가 나지
 * 않아야 하므로 방어적으로 씁니다.
 */
const track = (name, params = {}) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  // transport_type: 'beacon' 로 즉시 전송을 강제합니다.
  // GA4 는 기본적으로 이벤트를 배치로 모아 보내는데, 초기 페이지뷰 직후 약 30초 동안
  // 커스텀 이벤트를 유실합니다(콘솔 오류 없이 조용히 사라집니다). 사용자는 페이지
  // 열자마자 폼을 작성해 보내므로, 전환 이벤트가 바로 이 시간대에 들어옵니다.
  // 전환 데이터가 유실되면 의미가 없으므로 매번 beacon 으로 보냅니다.
  window.gtag('event', name, { transport_type: 'beacon', ...params });
};

Alpine.data('siteNav', () => ({
  open: false,
  toggle() {
    this.open = !this.open;
  },
  close() {
    this.open = false;
  },
}));

// Contact / demo enquiry form: idle → validating → submitting → sent | error
// variant picks the copy set in src/data/enquiry.ts ('contact' | 'demo').
// x-data 는 인라인 문자열이라 빌드 타임에 타입 검사가 걸리지 않습니다.
// 오타난 variant 를 조용히 contact 로 흘려보내지 않고 콘솔 에러로 올려
// verify.sh 5단계(렌더·콘솔 오류 수집)가 잡아내게 합니다.

/**
 * 주문 가능한 상품 라벨 목록입니다. src/data/pricing.ts 의 plans 에서 직접
 * 뽑으므로 라벨 문구를 두 곳에 적지 않습니다. 값이 바뀌면 자동을 따라갑니다.
 */
const PLAN_LABELS = plans.map((plan) => plan.label);

/**
 * URL 의 plan 쿼리를 읽습니다. 요금 다이얼로그에서 넘어온 주문 컨텍스트이며
 * 없으면 빈 문자열입니다.
 *
 * 화이트리스트 대조를 하는 이유는 값이 주소창에서 조작될 수 있기 때문입니다.
 * URLSearchParams 는 application/x-www-form-urlencoded 규칙으로 파싱하므로
 * '?plan=a b&c=d' 에서 plan 은 'a b' 까지만 읽힙니다. 그 값을 그대로 내보내면
 * 잘린 문자열이 상품명처럼 보이고, '&' 뒤의 내용이 조용히 사라집니다.
 * 실제로 존재하는 라벨과 정확히 일치할 때만 받아들이면 잘린 값과 임의 값이
 * 모두 빈 문자열로 떨어집니다. 라벨이 순수 텍스트여서 화면에 새는 일은 없습니다.
 *
 * '+' 는 폼 인코딩에서 공백이므로 '500+포인트' 처럼 오면 공백으로 되돌린 뒤
 * 대조합니다. 라벨에 공백이 없기 때문에 이 길이에서 걸러집니다.
 */
const readPlanQuery = () => {
  if (typeof window === 'undefined') return '';
  const raw = new URLSearchParams(window.location.search).get('plan');
  if (!raw) return '';
  const decoded = raw.replace(/\+/g, ' ');
  return PLAN_LABELS.includes(decoded) ? decoded : '';
};

Alpine.data('enquiryForm', (endpoint = '', variant = 'contact') => {
  if (!Object.hasOwn(enquiryForms, variant)) {
    console.error(
      `enquiryForm: 알 수 없는 variant "${variant}". 사용 가능한 값은 ${Object.keys(enquiryForms).join(', ')} 입니다.`,
    );
  }
  const copy = enquiryForms[variant] ?? enquiryForms.contact;
  // 요금 다이얼로그가 넘겨준 상품 컨텍스트입니다. pricing.astro 의 contactHref 가
  // /bidbox/contact/?plan=500포인트 처럼 심습니다. 폼에 새 필드를 만들지 않고
  // values.topic 에만 내려주므로 필수 검증 개수(3)는 그대로입니다.
  // 데모 폼은 location.search 를 보지 않습니다(파라미터가 없으므로 빈 문자열).
  const plan = readPlanQuery();
  return {
    status: 'idle', // idle | submitting | sent | error
    errorMessage: '',
    values: { name: '', email: '', topic: plan, message: '', consent: false },
    errors: {},
    copy,

    get busy() {
      return this.status === 'submitting';
    },

    // Clear a field's error as soon as the user edits it again.
    clear(field) {
      if (!this.errors[field]) return;
      const next = { ...this.errors };
      delete next[field];
      this.errors = next;
    },

    validate() {
      const e = {};
      if (!this.values.name.trim()) e.name = this.copy.nameError;
      if (!this.values.email.trim()) e.email = this.copy.emailError;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.values.email))
        e.email = this.copy.emailFormatError;
      if (!this.values.message.trim()) e.message = this.copy.messageError;
      this.errors = e;
      return Object.keys(e).length === 0;
    },

    async submit() {
      this.errorMessage = '';
      if (!this.validate()) {
        this.status = 'idle';
        this.$nextTick(() => {
          const control = this.$root.querySelector('.field.is-invalid input, .field.is-invalid textarea');
          if (control) control.focus();
        });
        return;
      }
      this.status = 'submitting';
      track('enquiry_submit_start', { form_variant: variant, has_endpoint: Boolean(endpoint) });
      try {
        if (endpoint) {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.values),
          });
          if (!res.ok) throw new Error('HTTP ' + res.status);
        } else {
          await new Promise((r) => setTimeout(r, 900));
        }
        this.status = 'sent';
        // 실제 접수된 경우에만 전환 이벤트를 보냅니다. 엔드포인트가 없을 때는
        // 폼에도 "전송되지 않습니다" 안내가 보이므로, 가짜 전환을 남기지
        // 않으면 화면과 데이터가 어긋나지 않습니다. 엔드포인트 유무는
        // enquiry_submit_start 의 has_endpoint 에서 알 수 있습니다.
        if (endpoint) {
          track('enquiry_submit_success', { form_variant: variant });
        }
      } catch (err) {
        this.status = 'error';
        this.errorMessage = networkError(brand.email);
        track('enquiry_submit_error', { form_variant: variant });
      }
    },

    reset() {
      this.values = { name: '', email: '', topic: '', message: '', consent: false };
      this.errors = {};
      this.status = 'idle';
      this.errorMessage = '';
    },
  };
});

window.Alpine = Alpine;
Alpine.start();

const stampYear = () => {
  const year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = year;
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', stampYear);
} else {
  stampYear();
}
