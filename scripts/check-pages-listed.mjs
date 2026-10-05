#!/usr/bin/env node
/**
 * verify.sh 의 PAGES 배열 및 NARROW 배열과 src/pages/ 의 실제
 * .astro 파일 목록을 대조합니다.
 *
 * 왜 필요한가:
 * verify.sh 의 PAGES/NARROW 는 손으로 유지됩니다. 새 페이지를 추가하고
 * 이 배열을 잊으면 그 페이지는 5~8단계(렌더·폰트·반응형·인터랙션)를 전혀
 * 검증받지 않습니다. 기계가 막습니다.
 *
 * 판정:
 *   1. .astro 페이지 중 PAGES 에 없는 것 -> 실패(미검증 페이지)
 *   2. PAGES 에 있는 라우트 중 src/pages/ 에 대응 파일이 없는 것 -> 실패(죽은 항목)
 *   3. NARROW 에 없는 라우트 -> 실패(반응형 미검증)
 *   4. PAGES 와 NARROW 의 라우트 집합이 다르면 실패
 *   5. 두 배열의 항목 수가 src/pages/ 의 .astro 개수와 다르면 실패
 *
 * 사용법: node scripts/check-pages-listed.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

// src/pages/ 아래 .astro 파일을 재귀적으로 수집합니다.
function collectAstroFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectAstroFiles(full, acc);
    } else if (entry.name.endsWith('.astro')) {
      acc.push(full);
    }
  }
  return acc;
}

// .astro 파일 절대 경로를 verify.sh 관례의 라우트로 변환합니다.
// 관례 (verify.sh 44~64행에서 직접 확인):
//   src/pages/index.astro          -> /
//   src/pages/company/index.astro  -> /company/
//   src/pages/bidbox/service.astro -> /bidbox/service/
//   src/pages/404.astro            -> /404.html   (다른 규칙)
function astroFileToRoute(absFile) {
  const pagesDir = path.join(ROOT, 'src', 'pages');
  const rel = path.relative(pagesDir, absFile); // 예: "bidbox/service.astro"
  const parts = rel.split(path.sep);

  // 404.astro 는 /404.html 로 취급합니다.
  if (rel === '404.astro') return '/404.html';

  // index.astro 는 디렉터리 라우트로 변환합니다.
  const last = parts[parts.length - 1];
  if (last === 'index.astro') {
    const dirs = parts.slice(0, -1);
    return dirs.length === 0 ? '/' : '/' + dirs.join('/') + '/';
  }

  // 일반 파일: 확장자를 제거하고 trailing slash 를 붙입니다.
  const name = last.replace(/\.astro$/, '');
  const dirs = parts.slice(0, -1);
  return dirs.length === 0 ? '/' + name + '/' : '/' + dirs.join('/') + '/' + name + '/';
}

// verify.sh 에서 PAGES 또는 NARROW 배열의 라우트 목록을 파싱합니다.
// 각 항목은 "/route|WxH" 형태이므로 첫 | 앞을 라우트로 취합니다.
function parseArrayFromSh(src, arrayName) {
  // 배열 선언부터 닫는 ) 까지를 추출합니다.
  const pattern = new RegExp(arrayName + '\\s*=\\s*\\(([^)]+)\\)');
  const match = src.match(pattern);
  if (!match) {
    console.error(`verify.sh 에서 ${arrayName} 배열을 찾지 못했습니다.`);
    process.exit(1);
  }
  const block = match[1];
  const routes = [];
  for (const line of block.split('\n')) {
    // 큰따옴표로 감싸인 "/route|WxH" 형태를 찾습니다.
    const m = line.match(/"([^"]+)"/);
    if (!m) continue;
    const entry = m[1];
    const pipeIdx = entry.indexOf('|');
    const route = pipeIdx >= 0 ? entry.slice(0, pipeIdx) : entry;
    routes.push(route);
  }
  return routes;
}

const verifySh = fs.readFileSync(path.join(ROOT, 'scripts', 'verify.sh'), 'utf8');
const pagesRoutes = parseArrayFromSh(verifySh, 'PAGES');
const narrowRoutes = parseArrayFromSh(verifySh, 'NARROW');

const pagesDir = path.join(ROOT, 'src', 'pages');
const astroFiles = collectAstroFiles(pagesDir);

// src/pages/ 의 .astro 파일에서 라우트를 유도합니다.
const fileRoutes = astroFiles.map(astroFileToRoute);

const pagesSet = new Set(pagesRoutes);
const narrowSet = new Set(narrowRoutes);
const fileSet = new Set(fileRoutes);

const problems = [];

// 1. .astro 페이지 중 PAGES 에 없는 것 -> 미검증 페이지
for (const route of fileRoutes) {
  if (!pagesSet.has(route)) {
    problems.push(`미검증 페이지: ${route}  (PAGES 배열에 없음)`);
  }
}

// 2. PAGES 에 있는 라우트 중 src/pages/ 에 대응 파일이 없는 것 -> 죽은 항목
for (const route of pagesRoutes) {
  if (!fileSet.has(route)) {
    problems.push(`죽은 항목: ${route}  (PAGES 에 있으나 src/pages/ 에 파일 없음)`);
  }
}

// 3. NARROW 에 없는 라우트 -> 반응형 미검증
for (const route of fileRoutes) {
  if (!narrowSet.has(route)) {
    problems.push(`반응형 미검증: ${route}  (NARROW 배열에 없음)`);
  }
}

// 4. PAGES 와 NARROW 의 라우트 집합이 다르면 실패
const pagesOnly = pagesRoutes.filter((r) => !narrowSet.has(r));
const narrowOnly = narrowRoutes.filter((r) => !pagesSet.has(r));
for (const r of pagesOnly) {
  problems.push(`집합 불일치: ${r}  (PAGES 에만 있고 NARROW 에 없음)`);
}
for (const r of narrowOnly) {
  problems.push(`집합 불일치: ${r}  (NARROW 에만 있고 PAGES 에 없음)`);
}

// 5. 항목 수 확인
if (pagesRoutes.length !== astroFiles.length) {
  problems.push(
    `항목 수 불일치: PAGES ${pagesRoutes.length}개, src/pages/ .astro ${astroFiles.length}개`,
  );
}
if (narrowRoutes.length !== astroFiles.length) {
  problems.push(
    `항목 수 불일치: NARROW ${narrowRoutes.length}개, src/pages/ .astro ${astroFiles.length}개`,
  );
}

if (problems.length > 0) {
  for (const p of problems) console.error(`PAGELIST  ${p}`);
  console.error(`페이지 목록 문제 ${problems.length}건`);
  process.exit(1);
}

console.log(
  `페이지 목록 일치: .astro ${astroFiles.length}개 / PAGES ${pagesRoutes.length}개 / NARROW ${narrowRoutes.length}개 — 모두 일치합니다.`,
);
