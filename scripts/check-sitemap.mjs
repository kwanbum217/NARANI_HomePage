#!/usr/bin/env node
/**
 * sitemap.xml 과 dist 의 실제 페이지를 대조합니다.
 *
 * 왜 필요한가:
 * sitemap 은 검색엔진에 어떤 주소가 존재한다고 알립니다. 여기에 없는
 * 페이지가 있으면 그 페이지는 색인되지 않습니다. 반대로 404 페이지를
 * 넣으면 없는 주소를 알립니다. 둘 다 사용자에게 보이는 손해입니다.
 *
 * src/pages/sitemap.xml.ts 의 경로 목록은 손으로 유지됩니다. 새 페이지를
 * 추가하고 그 목록을 잊으면, 게이트는 통과하고 그 페이지는 조용히 색인되지
 * 않습니다. 2026-09-28 에 문서 페이지 수가 7에서 8로 바뀐 뒤 문서가
 * 따라가지 못한 사례와 같은 유형입니다. 여기서 기계가 막습니다.
 *
 * 판정:
 *   1. dist 의 모든 HTML 페이지가 sitemap 에 있다 (색인 누락 방지)
 *   2. sitemap 의 모든 URL 이 dist 에 존재한다 (죽은 주소 방지)
 *   3. canonical 이 sitemap 의 URL 과 일치한다 (분산 URL 방지)
 *
 * 제외: 404 페이지는 noindex 이므로 넣지 않아야 합니다. 직접 판정합니다.
 *
 * 사용법: node scripts/check-sitemap.mjs [dist경로]
 */
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(process.argv[2] ?? 'dist');
const site = readSite();

function readSite() {
  const cfg = fs.readFileSync('astro.config.mjs', 'utf8');
  const m = cfg.match(/site:\s*'([^']+)'/);
  if (!m) {
    console.error("astro.config.mjs 에 site 값이 없습니다. sitemap 을 대조할 수 없습니다.");
    process.exit(1);
  }
  return m[1].replace(/\/$/, '');
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

const sitemapPath = path.join(dist, 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  console.error(`sitemap.xml 이 없습니다: ${sitemapPath}`);
  process.exit(1);
}

const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const listedPaths = new Set(listed.map((u) => new URL(u).pathname));

const htmlFiles = walk(dist);
// 404.html 은 오류 페이지이므로 색인 대상이 아닙니다. robots.txt 가 아니라
// 404.astro 의 noindex 메타가 정본입니다. 여기서 확인합니다.
const realPages = [];
let isNotFound = false;
for (const file of htmlFiles) {
  const rel = '/' + path.relative(dist, file).split(path.sep).join('/');
  if (rel === '/404.html') {
    const html = fs.readFileSync(file, 'utf8');
    isNotFound = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(html);
    continue;
  }
  realPages.push({ file, route: rel === '/index.html' ? '/' : rel.replace(/index\.html$/, '') });
}

const problems = [];

// 1) 색인 누락
for (const { file, route } of realPages) {
  if (!listedPaths.has(route)) {
    problems.push(`sitemap 에 없음: ${route}  (${path.relative(dist, file)})`);
  }
}

// 2) 죽은 주소
const realRoutes = new Set(realPages.map((p) => p.route));
for (const url of listed) {
  const p = new URL(url).pathname;
  if (!realRoutes.has(p)) problems.push(`sitemap 의 주소가 dist 에 없음: ${p}`);
}

// 3) canonical 불일치
// 경로만 비교하면 도메인을 놓칩니다. sitemap 이 옛 도메인이고 canonical 이
// 새 도메인이어도 경로는 같아서 통과합니다. 도메인까지 함께 봅니다.
for (const { file, route } of realPages) {
  const html = fs.readFileSync(file, 'utf8');
  const m = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/);
  if (!m) {
    problems.push(`canonical 이 없음: ${route}`);
    continue;
  }
  const want = site + route;
  if (m[1] !== want) {
    problems.push(`canonical 불일치: ${route} 은 ${m[1]} 이지만 규칙으로는 ${want}`);
  }
}

// 4) sitemap 의 도메인이 astro.config.mjs 의 site 와 같은가
// canonical 은 항상 Astro.site 에서 나오므로 이 항목이 잡아야 할 곳입니다.
for (const url of listed) {
  const origin = new URL(url).origin;
  if (origin !== site) {
    problems.push(`sitemap 도메인이 다릅니다: ${url} 의 ${origin} 은 설정값 ${site} 와 다릅니다.`);
  }
}

if (!isNotFound && htmlFiles.some((f) => f.endsWith('404.html'))) {
  problems.push('404.html 에 noindex 메타가 없습니다. 색인에서 제외하려면 필요합니다.');
}

if (problems.length > 0) {
  for (const p of problems) console.error(`SITEMAP  ${p}`);
  console.error(`sitemap 문제 ${problems.length}건`);
  process.exit(1);
}

console.log(
  `sitemap ${listed.length}건 / 실제 페이지 ${realPages.length}개 일치. 404 는 noindex 로 제외 확인.`,
);
