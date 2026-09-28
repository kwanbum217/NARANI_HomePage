#!/usr/bin/env node
/**
 * 검증 게이트가 비교에 쓰는 기대 문자열을 정본 소스에서 파생합니다.
 *
 * 기대 카피를 체크 스크립트(scripts/audit/checks/)에 하드코딩하면 카피나 요금
 * 표시를 바꿀 때마다 체크도 손으로 고쳐야 합니다. 여기서 한 번만 파생해 두면
 * 정본만 고쳐도 게이트가 따라갑니다.
 *
 * 파생 출처:
 * - 다이얼로그 제목/금액  : src/data/pricing.ts 의 plans + src/pages/bidbox/pricing.astro 의 표기 규칙
 * - 폼 첫 오류 문구       : src/scripts/app.js 의 nameError 기본값
 * - 폼 전송 중 라벨/접수 표시 : src/pages/bidbox/contact.astro
 *
 * 사용법: node scripts/audit/expected.mjs
 * 표준 출력은 체크 스크립트 앞에 주입할 JS 한 줄(window.__expected)입니다.
 * 정본에서 기대값을 찾지 못하면 오류를 출력하고 종료 코드 1 로 끝납니다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { plans } from '../../src/data/pricing.ts';

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

// 다이얼로그 검사가 누르는 요금 행(0-based). pricing.astro 는 같은 순서로 렌더합니다.
const DIALOG_PLAN_INDEX = 1;

const appJs = readSource('src/scripts/app.js');
const contactAstro = readSource('src/pages/bidbox/contact.astro');
const pricingAstro = readSource('src/pages/bidbox/pricing.astro');

const nameError = pick(
  appJs,
  /\?\s*options\.nameError\s*:\s*'([^']*)'/,
  '폼 nameError 기본값',
  'src/scripts/app.js',
);
const busyLabel = pick(
  contactAstro,
  /busy\s*\?\s*'([^']*)'\s*:/,
  '폼 전송 중 라벨',
  'src/pages/bidbox/contact.astro',
);
const successText = pick(
  contactAstro,
  /status === 'sent'[\s\S]*?<h2[^>]*>([^<]+)<\/h2>/,
  '접수 완료 표시',
  'src/pages/bidbox/contact.astro',
);
const dialogSuffix = pick(
  pricingAstro,
  /selected\.label\s*\+\s*'([^']*)'/,
  '다이얼로그 제목 접미사',
  'src/pages/bidbox/pricing.astro',
);

const currency = pricingAstro.match(
  /const won = \(n: number\) => '([^']*)' \+ n\.toLocaleString\('([^']*)'\)/,
);
if (!currency) {
  throw new Error('src/pages/bidbox/pricing.astro 에서 통화 표기 규칙을 찾지 못했습니다.');
}

const plan = plans[DIALOG_PLAN_INDEX];
if (!plan) {
  throw new Error(`src/data/pricing.ts 의 plans[${DIALOG_PLAN_INDEX}] 가 없습니다.`);
}

const expected = {
  dialog: {
    planIndex: DIALOG_PLAN_INDEX,
    title: plan.label + dialogSuffix,
    price: currency[1] + plan.price.toLocaleString(currency[2]),
  },
  form: { nameError, busyLabel, successText },
};

process.stdout.write(`window.__expected = ${JSON.stringify(expected)};\n`);
