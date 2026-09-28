import Alpine from 'alpinejs';
import { brand } from '../data/site';
import { enquiryForms, networkError } from '../data/enquiry';

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
// variant picks the copy set in src/data/enquiry.ts ('contact' | 'demo').
Alpine.data('enquiryForm', (endpoint = '', variant = 'contact') => {
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
        this.errorMessage = networkError(brand.email);
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
