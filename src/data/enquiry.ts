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
  /** Maximum length for the name (or company name) field. */
  nameMaxLength: number;
  /** Maximum length for the email field. */
  emailMaxLength: number;
  /** Maximum length for the message field. */
  messageMaxLength: number;
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
    // 근거 문서 없음. 무한 입력 방지용 상한입니다.
    nameMaxLength: 100,
    // RFC 5321 의 이메일 주소 최대 길이(254자)입니다.
    emailMaxLength: 254,
    // 근거 문서 없음. 무한 입력 방지용 상한입니다.
    messageMaxLength: 2000,
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
    // 근거 문서 없음. 무한 입력 방지용 상한입니다.
    nameMaxLength: 100,
    // RFC 5321 의 이메일 주소 최대 길이(254자)입니다.
    emailMaxLength: 254,
    // 근거 문서 없음. 무한 입력 방지용 상한입니다.
    messageMaxLength: 2000,
  },
};

/**
 * Recovery copy for the row that appears under a failed submit.
 *
 * 문장 안에 이메일을 박아넣지 않습니다. 주소, 복사 버튼, mailto 링크를 각각
 * 마크업에서 그릴 수 있어야 복사 실패 시 mailto 로 내려가는 경로가 남기 때문입니다.
 * 두 폼(contact, demo)이 같은 값을 쓰므로 한 곳에 둡니다.
 */
export type EnquiryFallbackCopy = {
  /** 주소 위 안내 문장. */
  lead: string;
  /** 주소를 클립보드에 넣는 버튼의 기본 라벨. */
  copyLabel: string;
  /** 클립보드 쓰기가 끝나기 전의 라벨. */
  copyingLabel: string;
  /** 주소를 클립보드에 넣은 뒤 잠깐 보이는 라벨. */
  copiedLabel: string;
  /** 클립보드를 쓸 수 없을 때(보안 컨텍스트 아님) 안내 문구. */
  copyFailedLabel: string;
  /** 메일 클라이언트를 여는 링크의 라벨. */
  mailtoLabel: string;
};

export const enquiryFallback: EnquiryFallbackCopy = {
  lead: '이 주소로 직접 보내 주세요.',
  copyLabel: '주소 담기',
  copyingLabel: '담는 중',
  copiedLabel: '담기 성공',
  copyFailedLabel: '직접 열어 주세요',
  mailtoLabel: '메일 열기',
};

/**
 * Network failure notice, appended with the brand support address.
 *
 * src/scripts/app.js 가 이 값을 errorMessage 에 넣고 x-text 로 그립니다.
 * x-text 는 텍스트만 그릴 수 있으므로 이 값은 평문 문장으로 남깁니다.
 * 복사 버튼과 mailto 링크는 enquiryFallback 과 페이지 마크업이 맡습니다.
 */
export const networkError = (email: string) =>
  `전송에 실패했습니다. 잠시 후 다시 시도하거나 ${email} 로 보내 주세요.`;
