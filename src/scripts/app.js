import Alpine from 'alpinejs';
import { brand } from '../data/site';
import { enquiryForms, networkError } from '../data/enquiry';

/* NARANI / BIDBOX — shared client behaviour, bundled by Astro. */

/**
 * GA4 이벤트를 dataLayer 로 보냅니다.
 *
 * GA4 태그는 BaseLayout.astro 가 측정 ID가 있을 때만 삽입하므로, 이 함수는
 * dataLayer만 만들어 두고 태그가 없으면 아무 일도 하지 않습니다. 태그가 없을 때
 *도 호출해도 콘솔 에러가 나지 않아야 하므로 방어적으로 씁니다.
 */
const track = (name, params = {}) => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...params });
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
Alpine.data('enquiryForm', (endpoint = '', variant = 'contact') => {
  if (!Object.hasOwn(enquiryForms, variant)) {
    console.error(
      `enquiryForm: 알 수 없는 variant "${variant}". 사용 가능한 값은 ${Object.keys(enquiryForms).join(', ')} 입니다.`,
    );
  }
  const copy = enquiryForms[variant] ?? enquiryForms.contact;
  return {
    status: 'idle', // idle | submitting | sent | error
    errorMessage: '',
    values: { name: '', email: '', topic: '', message: '', consent: false },
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
        // 시뮬레이션 접수도 이벤트로 남깁니다. 단, 엔드포인트가 없으면 실제로는
        // 접수되지 않았으므로 분석에서 시뮬레이션임을 구분할 수 있게 표시합니다.
        track(endpoint ? 'enquiry_submit_success' : 'enquiry_submit_simulated', {
          form_variant: variant,
        });
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
