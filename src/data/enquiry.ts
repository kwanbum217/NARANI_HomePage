/**
 * Single source of truth for the contact / demo enquiry form copy.
 * Update here once; the Alpine runtime (src/scripts/app.js) and both form
 * pages follow, and the verification gate derives its expectations from here.
 */

export type EnquiryFormKey = 'contact' | 'demo';

export type EnquiryFormCopy = {
  /** Validation message for the name (or company name) field. */
  nameError: string;
  emailError: string;
  emailFormatError: string;
  messageError: string;
  /** Submit button label in the idle state. */
  submitLabel: string;
  /** Submit button label while the request is in flight. */
  busyLabel: string;
  /** Heading shown after the form is accepted. */
  successTitle: string;
  /** Button that returns from the success panel to an empty form. */
  resetLabel: string;
};

export const enquiryForms: Record<EnquiryFormKey, EnquiryFormCopy> = {
  contact: {
    nameError: '성함을 입력해 주세요.',
    emailError: '이메일을 입력해 주세요.',
    emailFormatError: '이메일 형식이 올바르지 않습니다.',
    messageError: '문의 내용을 입력해 주세요.',
    submitLabel: '문의 보내기',
    busyLabel: '전송 중…',
    successTitle: '문의가 접수되었습니다',
    resetLabel: '새 문의 작성',
  },
  demo: {
    nameError: '회사명을 입력해 주세요.',
    emailError: '이메일을 입력해 주세요.',
    emailFormatError: '이메일 형식이 올바르지 않습니다.',
    messageError: '문의 내용을 입력해 주세요.',
    submitLabel: '데모 신청',
    busyLabel: '신청 접수 중…',
    successTitle: '신청이 접수되었습니다',
    resetLabel: '다른 공고로 신청',
  },
};

/** Network failure notice, appended with the brand support address. */
export const networkError = (email: string) =>
  `전송에 실패했습니다. 잠시 후 다시 시도하거나 ${email} 로 보내 주세요.`;
