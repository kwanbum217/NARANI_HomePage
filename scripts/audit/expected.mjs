#!/usr/bin/env node
/**
 * 검증 게이트가 비교에 쓰는 기대 문자열을 정본 소스에서 파생합니다.
 *
 * 기대 카피를 체크 스크립트(scripts/audit/checks/)에 하드코딩하면 카피나 요금
 * 표시를 바꿀 때마다 체크도 손으로 고쳐야 합니다. 여기서 한 번만 파생해 두면
 * 정본만 고쳐도 게이트가 따라갑니다.
 *
 * 파생 출처:
 * - 다이얼로그 제목/금액  : src/data/pricing.ts 의 featured 플랜 + src/pages/bidbox/pricing.astro 의 표기 규칙
 * - 폼 오류 문구/라벨/접수 표시 : src/data/enquiry.ts 의 contact 카피
 * - 폼 필드 aria-required/maxlength : src/data/enquiry.ts 의 contact·demo 카피 상한
 *   (필드 id 는 src/pages/bidbox/contact.astro, demo.astro 마크업에서 읽은 값)
 *
 * 사용법: node scripts/audit/expected.mjs
 * 표준 출력은 체크 스크립트 앞에 주입할 JS 한 줄(window.__expected)입니다.
 * 정본에서 기대값을 찾지 못하면 오류를 출력하고 종료 코드 1 로 끝납니다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { plans } from '../../src/data/pricing.ts';
import { enquiryForms, enquiryFallback } from '../../src/data/enquiry.ts';
import { brand } from '../../src/data/site.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');

function readSource(rel) {
  const full = path.join(root, rel);
  try {
    return fs.readFileSync(full, 'utf8');
  } catch (err) {
    throw new Error(`${rel} 를 읽지 못했습니다: ${err.message}`);
  }
}

function pick(source, regex, label, rel) {
  const m = source.match(regex);
  if (!m || !m[1] || m[1].trim() === '') {
    throw new Error(`${rel} 에서 ${label} 를 찾지 못했습니다.`);
  }
  return m[1];
}

const pricingAstro = readSource('src/pages/bidbox/pricing.astro');

const contactCopy = enquiryForms.contact;
if (!contactCopy) {
  throw new Error('src/data/enquiry.ts 에 contact 카피가 없습니다.');
}
for (const key of ['nameError', 'emailError', 'emailFormatError', 'messageError', 'submitLabel', 'busyLabel', 'successTitle', 'resetLabel']) {
  if (typeof contactCopy[key] !== 'string' || contactCopy[key].trim() === '') {
    throw new Error(`src/data/enquiry.ts 의 contact.${key} 가 비어 있습니다.`);
  }
}
const { nameError, busyLabel, successTitle: successText } = contactCopy;

const demoCopy = enquiryForms.demo;
if (!demoCopy) {
  throw new Error('src/data/enquiry.ts 에 demo 카피가 없습니다.');
}

// 폼 필드의 aria-required 와 maxlength 기대값입니다.
// 상한은 화면에 하드코딩하지 않고 src/data/enquiry.ts 에서 파생합니다.
// id 는 각 페이지 마크업(src/pages/bidbox/contact.astro, demo.astro)에서 읽은 값입니다.
// 마지막 인자(noticeId)는 선택 필드입니다. 선택 필드는 aria-required 가 없어야 하므로
// ariaRequired: false 로 두고, 검사는 속성이 없는지(null)로 판정합니다.
const fieldSpec = (copy, nameId, emailId, messageId, noticeId) => {
  const out = [];
  out.push({ id: nameId, ariaRequired: true, maxLength: copy.nameMaxLength });
  out.push({ id: emailId, ariaRequired: true, maxLength: copy.emailMaxLength });
  out.push({ id: messageId, ariaRequired: true, maxLength: copy.messageMaxLength });
  if (noticeId) out.push({ id: noticeId, ariaRequired: false, maxLength: copy.messageMaxLength });
  return out;
};

// 관심 공고(d-notice)는 검증 대상이 아니라 aria-required 를 두지 않습니다.
const contactFields = fieldSpec(contactCopy, 'c-name', 'c-email', 'c-message');
const demoFields = fieldSpec(demoCopy, 'd-company', 'd-email', 'd-message', 'd-notice');

const dialogSuffix = pick(
  pricingAstro,
  /selected\.label\s*\+\s*'([^']*)'/,
  '다이얼로그 제목 접미사',
  'src/pages/bidbox/pricing.astro',
);

// prefill 검사는 '주문 상품' 라벨 옆에 상품명이 보이는지 봅니다.
// 라벨 문구는 contact.astro 의 정본 마크업에서 읽습니다.
const topicPrefix = pick(
  readSource('src/pages/bidbox/contact.astro'),
  /<span class="label">([^<]*)<\/span>/,
  '문의 폼 주문 상품 라벨',
  'src/pages/bidbox/contact.astro',
);

const currency = pricingAstro.match(
  /const won = \(n: number\) => '([^']*)' \+ n\.toLocaleString\('([^']*)'\)/,
);
if (!currency) {
  throw new Error('src/pages/bidbox/pricing.astro 에서 통화 표기 규칙을 찾지 못했습니다.');
}

// 다이얼로그 검사가 누르는 요금 행은 나열 순서가 아니라 featured 플랜으로 정합니다.
// featured 가 없거나 둘 이상이면 조용히 통과시키지 않고 파생 단계에서 예외로 멈춥니다.
const featuredPlans = plans.filter((plan) => plan.featured);
if (featuredPlans.length !== 1) {
  throw new Error(
    `src/data/pricing.ts 의 featured 플랜이 정확히 하나여야 합니다 (현재 ${featuredPlans.length}개).`,
  );
}
const dialogPlan = featuredPlans[0];
const dialogPlanIndex = plans.indexOf(dialogPlan);

const expected = {
  dialog: {
    planId: dialogPlan.id,
    planIndex: dialogPlanIndex,
    planCount: plans.length,
    title: dialogPlan.label + dialogSuffix,
    price: currency[1] + dialogPlan.price.toLocaleString(currency[2]),
  },
  prefill: {
    planLabel: dialogPlan.label,
    planLabelAlt: plans.find((plan) => !plan.featured)?.label ?? dialogPlan.label,
    topicPrefix,
    // 검사할 plan 쿼리 URL 을 셸이 아니라 여기서 만듭니다.
    // 셸로 만들면 '+' 가 공백으로 바뀌어 한글 라벨이 깨지거나 파생 규칙이
    // 스크립트에 흩어집니다. URL 은 이 한 곳에서 인코딩합니다.
    // 거절 케이스 세 개는 URLSearchParams 규칙을 그대로 씁니다.
    //   'a b&c=d' 는 form-urlencoded 규칙에서 plan 이 'a b' 까지만 잘립니다.
    //   숫자만 있는 값은 실제 라벨이 아니므로 거절되어야 합니다.
    acceptQuery: '?plan=' + encodeURIComponent(dialogPlan.label),
    rejectTruncatedQuery: '?' + new URLSearchParams({ plan: 'a b&c=d' }).toString(),
    rejectScriptQuery: '?plan=' + encodeURIComponent('<script>alert(1)</script>'),
    rejectBareNumberQuery: '?plan=' + encodeURIComponent(String(dialogPlan.price)),
  },
  // 기존 평면 키(nameError/busyLabel/successText)는 contact 기준이며 그대로 둡니다.
  // 다른 단언이 이 키를 쓰고 있으므로 대체하지 않고 fields 를 더합니다.
  form: {
    nameError,
    busyLabel,
    successText,
    // 페이지별 필드 속성 기대값. 폼 검사가 location.pathname 으로 자기 페이지를 고릅니다.
    fields: {
      contact: contactFields,
      demo: demoFields,
    },
    // demo 페이지는 카피가 달라(회사명/신청 접수) 흐름 단언에 쓸 값을 따로 둡니다.
    demo: {
      nameError: demoCopy.nameError,
      busyLabel: demoCopy.busyLabel,
      successText: demoCopy.successTitle,
    },
  },
  // 폼 실패 시 degrade 경로 카피. 주소는 brand 정본에서, 라벨은 enquiryFallback
  // 정본에서 읽습니다. 검사에 카피를 하드코딩하면 정본이 바뀌어도 옛 문구를 검사해
  // 조용히 통과합니다.
  fallback: {
    brandEmail: brand.email,
    copyLabel: enquiryFallback.copyLabel,
    copyingLabel: enquiryFallback.copyingLabel,
    copiedLabel: enquiryFallback.copiedLabel,
    copyFailedLabel: enquiryFallback.copyFailedLabel,
  },
};

process.stdout.write(`window.__expected = ${JSON.stringify(expected)};\n`);
