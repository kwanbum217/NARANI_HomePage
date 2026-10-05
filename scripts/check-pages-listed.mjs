#!/usr/bin/env node
/**
 * verify.sh 의 PAGES 배열과 NARROW 배열, 그리고 8단계 인터랙션 시나리오
 * 목록과 src/pages/ 의 실제 .astro 파일 목록을 대조합니다.
 *
 * 왜 필요한가:
 * verify.sh 의 PAGES/NARROW 는 손으로 유지됩니다. 새 페이지를 추가하고
 * 이 배열을 잊으면 그 페이지는 5~8단계(렌더·폰트·반응형·인터랙션)를 전혀
 * 검증받지 않습니다. 기계가 막습니다.
 * 8단계가 interact.swift 에 넘기는 시나리오 목록(verify.sh 207~217행)도
 * 같은 이유로 대조합니다. 시나리오가 없으면 그 페이지는 인터랙션 검증을
 * 받지 않습니다. 페이지 고유 인터랙션이 없는 페이지만 SCENARIO_EXEMPT 에
 * 이유와 함께 명시해 예외로 둡니다.
 *
 * 판정:
 *   1. .astro 페이지 중 PAGES 에 없는 것 -> 실패(미검증 페이지)
 *   2. PAGES 에 있는 라우트 중 src/pages/ 에 대응 파일이 없는 것 -> 실패(죽은 항목)
 *   3. NARROW 에 없는 라우트 -> 실패(반응형 미검증)
 *   4. PAGES 와 NARROW 의 라우트 집합이 다르면 실패
 *   5. 두 배열의 항목 수가 src/pages/ 의 .astro 개수와 다르면 실패
 *   6. 배열에 같은 라우트가 두 번 나오면 실패(중복)
 *   7. 시나리오의 라우트 중 src/pages/ 에 대응 파일이 없는 것 -> 실패(죽은 인터랙션 시나리오)
 *   8. .astro 페이지 중 시나리오에도 SCENARIO_EXEMPT 에도 없는 것 -> 실패(미검증 시나리오)
 *   9. SCENARIO_EXEMPT 에 있으나 시나리오가 생긴 라우트 -> 실패(불필요한 예외)
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
  const lines = src.split('\n');
  const declaration = new RegExp('^[ \\t]*' + arrayName + '[ \\t]*=[ \\t]*\\([ \\t]*(#.*)?$');
  const start = lines.findIndex((line) => declaration.test(line));
  if (start === -1) {
    console.error(`verify.sh 에서 ${arrayName} 배열을 찾지 못했습니다.`);
    process.exit(1);
  }

  const block = [];
  let closed = false;
  for (let i = start + 1; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith(')')) {
      closed = true;
      break;
    }
    if (trimmed.startsWith('#')) continue;
    block.push(lines[i]);
  }
  if (!closed) {
    console.error(`verify.sh 에서 ${arrayName} 배열의 닫는 ) 를 찾지 못했습니다.`);
    process.exit(1);
  }

  const routes = [];
  for (const line of block) {
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

// verify.sh 의 8단계 인터랙션 호출부에서 시나리오 목록을 파싱합니다.
// 각 항목은 "/경로|WxH|scripts/audit/checks/xxx.js" 형태이므로 첫 | 앞이
// 라우트입니다. 쿼리가 붙은 항목은 expected.mjs 가 인코딩한 셸 변수
// ( ${...} )로 넘어오므로, 리터럴 ?쿼리와 함께 떼고 라우트로 비교합니다.
//   "/bidbox/contact/"             -> "/bidbox/contact/"
//   "/bidbox/contact/${Q_ACCEPT}"  -> "/bidbox/contact/"
function parseInteractionScenarios(src) {
  const pattern = /"([^"|]+)\|(\d+x\d+)\|([^"|]+\.js)"/g;
  const scenarios = [];
  let match;
  while ((match = pattern.exec(src)) !== null) {
    const route = match[1].split('?')[0].replace(/\$\{[^}]*\}/g, '');
    scenarios.push({ route, script: match[3] });
  }
  if (scenarios.length === 0) {
    console.error('verify.sh 에서 인터랙션 시나리오를 찾지 못했습니다.');
    process.exit(1);
  }
  return scenarios;
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

// 6. 배열에 같은 라우트가 두 번 나오면 실패(중복). Set 비교는 중복을 지우고
//    항목 수 비교는 총 개수만 보므로, 중복 자체는 여기서만 드러납니다.
for (const { name, routes } of [
  { name: 'PAGES', routes: pagesRoutes },
  { name: 'NARROW', routes: narrowRoutes },
]) {
  const counts = new Map();
  for (const route of routes) {
    counts.set(route, (counts.get(route) ?? 0) + 1);
  }
  for (const [route, count] of counts) {
    if (count > 1) {
      problems.push(`${name}: 중복 라우트 ${route} (${count}번 등장)`);
    }
  }
}

const scenarios = parseInteractionScenarios(verifySh);
const scenarioRoutes = scenarios.map((s) => s.route);
const scenarioSet = new Set(scenarioRoutes);

// 8단계 시나리오가 현재 없는 페이지입니다. 네 페이지 모두 공유 헤더의 메뉴
// 토글 외에 페이지 고유의 인터랙션(폼·다이얼로그)이 없고, 공유 메뉴 토글은
// /company/ 시나리오가 검증합니다. 새 페이지를 추가하면 이 목록에 자동으로
// 들어가지 않으므로 7번 판정이 실패해, 시나리오 추가 여부를 의식적으로
// 결정하게 됩니다. 시나리오가 생기면 여기서 지웁니다(8번 판정이 막습니다).
const SCENARIO_EXEMPT = new Set(['/', '/bidbox/', '/bidbox/service/', '/404.html']);

// 6. 시나리오의 라우트 중 src/pages/ 에 대응 파일이 없는 것 -> 죽은 인터랙션 시나리오
for (const scenario of scenarios) {
  if (!fileSet.has(scenario.route)) {
    problems.push(
      `죽은 인터랙션 시나리오: ${scenario.route}  (${scenario.script} 시나리오 — src/pages/ 에 대응 .astro 없음)`,
    );
  }
}

// 7. .astro 페이지 중 시나리오에도 SCENARIO_EXEMPT 에도 없는 것 -> 미검증 시나리오
for (const route of fileRoutes) {
  if (scenarioSet.has(route) || SCENARIO_EXEMPT.has(route)) continue;
  problems.push(
    `미검증 시나리오: ${route}  (8단계 인터랙션 시나리오에 없음 — 시나리오를 추가하거나, 페이지 고유 인터랙션이 없으면 SCENARIO_EXEMPT 에 이유와 함께 추가)`,
  );
}

// 8. SCENARIO_EXEMPT 에 있으나 시나리오가 생긴 라우트 -> 불필요한 예외
for (const route of SCENARIO_EXEMPT) {
  if (scenarioSet.has(route)) {
    problems.push(`불필요한 예외: ${route}  (시나리오가 있으므로 SCENARIO_EXEMPT 에서 제거)`);
  }
}

if (problems.length > 0) {
  for (const p of problems) console.error(`PAGELIST  ${p}`);
  console.error(`페이지 목록 문제 ${problems.length}건`);
  process.exit(1);
}

console.log(
  `페이지 목록 일치: .astro ${astroFiles.length}개 / PAGES ${pagesRoutes.length}개 / NARROW ${narrowRoutes.length}개 — 모두 일치합니다.`,
);
console.log(
  `인터랙션 시나리오 일치: 시나리오 ${scenarios.length}개(고유 라우트 ${scenarioSet.size}개) / 시나리오 없음(예외) ${SCENARIO_EXEMPT.size}개 — ${[...SCENARIO_EXEMPT].join(', ')}`,
);
