import Alpine from 'alpinejs';
import { brand } from '../data/site';

/* NARANI / BIDBOX — shared client behaviour, bundled by Astro. */

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
Alpine.data('enquiryForm', (endpoint = '') => ({
  status: 'idle', // idle | submitting | sent | error
  errorMessage: '',
  values: { name: '', email: '', topic: '', message: '', consent: false },
  errors: {},

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
    if (!this.values.name.trim()) e.name = '성함을 입력해 주세요.';
    if (!this.values.email.trim()) e.email = '이메일을 입력해 주세요.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.values.email))
      e.email = '이메일 형식이 올바르지 않습니다.';
    if (!this.values.message.trim()) e.message = '문의 내용을 입력해 주세요.';
    this.errors = e;
    return Object.keys(e).length === 0;
  },

  async submit() {
    this.errorMessage = '';
    if (!this.validate()) {
      this.status = 'idle';
      return;
    }
    this.status = 'submitting';
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
    } catch (err) {
      this.status = 'error';
      this.errorMessage = `전송에 실패했습니다. 잠시 후 다시 시도하거나 ${brand.email} 로 보내 주세요.`;
    }
  },

  reset() {
    this.values = { name: '', email: '', topic: '', message: '', consent: false };
    this.errors = {};
    this.status = 'idle';
    this.errorMessage = '';
  },
}));

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
