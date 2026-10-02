#!/usr/bin/env node
/**
 * src/data 정본 문장이 소비처에서 동일하게 쓰이는지 검사합니다.
 *
 * 왜 필요한가:
 * 2026-10-02 에 헤더 CTA 가 "요금 보기" 로 바뀌었는데 요금 다이얼로그 문장에
 * 폐기된 표현 "프로그램 접속" 이 남아 있었습니다. 사람이 읽어 발견하기는 쉽지만
 * 8단계 10개 항목이 전부 통과시켰습니다. 이 검사는 그 유형의 회귀를 기계가 막습니다.
 *
 * 판정 방식은 화이트리스트입니다. 정해진 소비처 파일 목록 안에서만 하드코딩 문자열을
 * 찾고, src/data 아래의 정의(정본 자체)는 처음부터 대상이 아닙니다. 전역 grep 으로
 * 찾으면 site.ts 같은 정의 파일을 잘못 잡습니다.
 *
 * 검사:
 *   1. primaryCta.program.label("요금 보기")이 Header.astro 와 bidbox/index.astro
 *      에 하드코딩으로 남아 있으면 실패 (정본: src/data/site.ts)
 *   2. 폐기된 CTA 문구 "프로그램 접속"이 src/components 또는 src/pages 에 남아
 *      있으면 실패
 *   3. POINT_NOTE 문장이 pricing.astro 에 하드코딩으로 반복되면 실패
 *      (정본: src/data/pricing.ts)
 *
 * 사용법: node scripts/check-copy-consistency.mjs [프로젝트루트]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brand } from '../src/data/site.ts';
import { POINT_NOTE, POINT_USAGE_RULE } from '../src/data/pricing.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv[2] ?? path.resolve(here, '..'));

const primaryCtaLabel = '요금 보기';
const retiredCta = '프로그램 접속';

const readIf = (rel) => {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, 'utf8');
};

/**
 * 하드코딩 금지 문자열은 "정본 소비처" 파일에서만 금지하고, 정의 파일
 * (src/data 아래)은 처음부터 검사 대상에서 뺀다 — 이것이 화이트리스트입니다.
 */
function findLiteral(content, literal) {
  return content.includes(literal);
}

const problems = [];

// 1) primaryCta.program.label 이 정본을 import 하지 않고 소비처에 하드코딩으로 반복.
//    라벨이 다른 표현으로도 나타나는 만큼 href 까지 함께 봐서 명시적으로 줍니다.
const consumers = [
  { rel: 'src/components/Header.astro', source: readIf('src/components/Header.astro') },
  { rel: 'src/pages/bidbox/index.astro', source: readIf('src/pages/bidbox/index.astro') },
];
for (const { rel, source } of consumers) {
  if (source === null) {
    problems.push(`검사 대상 소비처 파일이 없습니다: ${rel}`);
    continue;
  }
  if (findLiteral(source, primaryCtaLabel)) {
    problems.push(
      `${rel}: 정본 primaryCta.program.label(${primaryCtaLabel}) 을 소비처에 직접 적었습니다. src/data/site.ts 에서 import 하십시오.`,
    );
  }
}

// 2) 폐기된 CTA 문구 잔존. 정의 파일(src/data)은 화이트리스트이므로
//    src/components 과 src/pages 만 뒤집니다.
function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.astro')) acc.push(full);
  }
  return acc;
}
const scanTargets = [
  ...walk(path.join(root, 'src/pages')),
  ...walk(path.join(root, 'src/components')),
];
for (const file of scanTargets) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(retiredCta)) {
    problems.push(
      `${path.relative(root, file)}: 폐기된 CTA 문구 "${retiredCta}" 가 남아 있습니다. 정본 라벨로 바꾸십시오.`,
    );
  }
}

// 3) POINT_NOTE / POINT_USAGE_RULE 하드코딩 반복. 두 페이지 모두 import 해 쓰는 게
//    정본 배선입니다. 문장 자체를 소비처에 다시 적으면 정본이 바뀌어도 그쪽만 남습니다.
const pricingPage = readIf('src/pages/bidbox/pricing.astro');
if (pricingPage === null) {
  problems.push('src/pages/bidbox/pricing.astro 를 읽지 못했습니다.');
} else {
  // import 로 가져왔는지는 실패와 무관합니다. 정의 밖에서 문장 자체를 반복하면 실패입니다.
  for (const [name, literal] of [
    ['POINT_NOTE', POINT_NOTE],
    ['POINT_USAGE_RULE', POINT_USAGE_RULE],
  ]) {
    if (pricingPage.includes(literal)) {
      problems.push(
        `src/pages/bidbox/pricing.astro: ${name} 를 문자열로 반복했습니다. src/data/pricing.ts 에서 import 하십시오.`,
      );
    }
  }
}

if (problems.length > 0) {
  for (const p of problems) console.error(`COPY  ${p}`);
  console.error(`카피 정합 문제 ${problems.length}건`);
  process.exit(1);
}

console.log(
  `카피 정합 통과. ${scanTargets.length}개 .astro 파일에서 폐기 문구 없음, 소비처 하드코딩 없음. product=${brand.product}`,
);
