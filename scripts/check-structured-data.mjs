#!/usr/bin/env node
/**
 * dist 의 JSON-LD 를 파싱해 구조화 데이터 정합을 검사합니다.
 *
 * 왜 필요한가:
 * 2026-10-02 에 applicationCategory 가 @type 을 그대로 반복한
 * 'SoftwareApplication' 이 되었다가 'BusinessApplication' 로 고쳐졌습니다.
 * 타입 체크·빌드·렌더·링크 검사는 전부 통과해도 이런 "틀린 값"은 전혀 잡지
 * 못합니다. 8단계 게이트의 사각지(같은 리뷰서 6절)를 여기서 기계로 막습니다.
 *
 * 정의는 정본에서 읽습니다. site 는 astro.config.mjs, name 은
 * src/data/site.ts 의 brand.product. 정본이 바뀌면 검사도 따라갑니다.
 *
 * 검사:
 *   1. JSON-LD 블록이 JSON.parse 로 파싱되는가
 *   2. @context 가 https://schema.org 인가
 *   3. @graph 에 Organization 이 있는가 (전 페이지)
 *   4. @graph 에 WebSite 이 있는가 (전 페이지)
 *   5. BIDBOX 5개 페이지에 SoftwareApplication 이 있는가
 *   6. nani 3개 페이지에 SoftwareApplication 이 없어야 하는가
 *   7. applicationCategory 가 'SoftwareApplication' 이면 실패 (자기참조 회귀 방지)
 *   8. SoftwareApplication 에 offers 가 없어야 하는가
 *      (결제 보류, CURRENT_STATE 4.2)
 *   9. url 이 astro.config.mjs 의 site 값으로 시작하는가
 *  10. SoftwareApplication 의 name 이 brand.product 인가
 *
 * 사용법: node scripts/check-structured-data.mjs [dist경로]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brand } from '../src/data/site.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dist = path.resolve(process.argv[2] ?? path.join(root, 'dist'));

function readSite() {
  const cfg = fs.readFileSync(path.join(root, 'astro.config.mjs'), 'utf8');
  const m = cfg.match(/site:\s*'([^']+)'/);
  if (!m) {
    console.error('astro.config.mjs 에 site 값이 없습니다. 구조화 데이터를 대조할 수 없습니다.');
    process.exit(1);
  }
  return m[1].replace(/\/$/, '');
}
const site = readSite();

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

function relRoute(file) {
  const rel = '/' + path.relative(dist, file).split(path.sep).join('/');
  return rel === '/index.html' ? '/' : rel.replace(/index\.html$/, '');
}

const htmlFiles = walk(dist);
if (htmlFiles.length === 0) {
  console.error(`dist 에 HTML 이 없습니다: ${dist}`);
  process.exit(1);
}

// 레지스터 판정은 check-sitemap.mjs 계산을 따릅니다. 경로만 보고 나눕니다.
const isBidboxRoute = (route) => route.startsWith('/bidbox/');

function extractGraph(html) {
  const blocks = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  return blocks.map((m) => {
    try {
      return { data: JSON.parse(m[1]), error: null };
    } catch {
      return { data: null, error: true };
    }
  });
}

const problems = [];

for (const file of htmlFiles) {
  const route = relRoute(file);
  const html = fs.readFileSync(file, 'utf8');
  const blocks = extractGraph(html);

  if (blocks.length === 0) {
    problems.push(`JSON-LD 블록이 없음: ${route}`);
    continue;
  }

  // 1) 파싱 검사
  for (const b of blocks) {
    if (b.error) problems.push(`JSON-LD 파싱 실패: ${route}`);
  }
  const data = blocks.map((b) => b.data).filter(Boolean);
  if (data.length === 0) continue;

  // @graph 가 단일 맵으로 정본(BaseLayout)에서 만들어집니다. 없는 구조도 기록합니다.
  for (const entry of data) {
    // 2) @context
    if (entry['@context'] !== 'https://schema.org') {
      problems.push(
        `@context 가 다릅니다: ${route} 은 ${JSON.stringify(entry['@context'])} 입니다.`,
      );
    }

    const graph = Array.isArray(entry['@graph']) ? entry['@graph'] : null;
    if (!graph) {
      problems.push(`@graph 배열이 없음: ${route}`);
      continue;
    }
    const types = new Set(graph.map((n) => n['@type']));
    const byType = (t) => graph.filter((n) => n['@type'] === t);

    // 3) 4) Organization / WebSite
    if (!types.has('Organization')) problems.push(`Organization 이 없음: ${route}`);
    if (!types.has('WebSite')) problems.push(`WebSite 이 없음: ${route}`);

    // 5) 6) 레지스터별 SoftwareApplication
    const hasApp = types.has('SoftwareApplication');
    if (isBidboxRoute(route) && !hasApp) {
      problems.push(`BIDBOX 페이지에 SoftwareApplication 이 없음: ${route}`);
    }
    if (!isBidboxRoute(route) && hasApp) {
      problems.push(`nani 페이지에 SoftwareApplication 이 있음: ${route}`);
    }

    // 7)~10) SoftwareApplication 내부 값
    for (const app of byType('SoftwareApplication')) {
      // 7) 자기참조. 2026-10-02 회귀를 잡는 핵심 검사입니다.
      if (app.applicationCategory === 'SoftwareApplication') {
        problems.push(
          `applicationCategory 가 자기 자신입니다: ${route}. BusinessApplication 등을 쓰십시오.`,
        );
      }
      // 8) 결제 보류 기간에는 가격 약속(offers)을 두지 않습니다. CURRENT_STATE 4.2.
      if ('offers' in app) {
        problems.push(`SoftwareApplication 에 offers 가 있음: ${route}. 결제 보류에 따라 허용되지 않습니다.`);
      }
      // 9)
      if (typeof app.url !== 'string' || app.url === '') {
        problems.push(`SoftwareApplication 에 url 이 없음: ${route}`);
      } else if (!app.url.startsWith(site)) {
        problems.push(
          `url 이 site 값으로 시작하지 않습니다: ${route} 은 ${app.url} 이지만 기준은 ${site}입니다.`,
        );
      }
      // 10) name 은 정본 brand.product 입니다.
      if (app.name !== brand.product) {
        problems.push(
          `name 불일치: ${route} 은 ${JSON.stringify(app.name)} 이지만 정본 brand.product 는 ${brand.product} 입니다.`,
        );
      }
    }
  }
}

if (problems.length > 0) {
  for (const p of problems) console.error(`JSONLD  ${p}`);
  console.error(`구조화 데이터 문제 ${problems.length}건`);
  process.exit(1);
}

const bidboxCount = htmlFiles.filter((f) => isBidboxRoute(relRoute(f))).length;
const naniCount = htmlFiles.length - bidboxCount;
console.log(
  `JSON-LD ${htmlFiles.length}개 페이지 전부 통과. BIDBOX ${bidboxCount}개 / nani ${naniCount}개, 비교 기준 site=${site}, product=${brand.product}`,
);
