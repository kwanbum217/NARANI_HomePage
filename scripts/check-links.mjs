#!/usr/bin/env node
/**
 * 정적 참조 무결성 검사.
 * dist/ 안의 모든 HTML 에서 href/src 를 뽑아 실제 파일이 존재하는지 확인합니다.
 * 외부 URL(http/https), mailto, data URI, 순수 앵커는 제외합니다.
 *
 * 사용법: node scripts/check-links.mjs [dist경로]
 */
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(process.argv[2] ?? 'dist');

if (!fs.existsSync(dist)) {
  console.error(`dist 경로가 없습니다: ${dist}\n먼저 npm run build 를 실행하세요.`);
  process.exit(1);
}

/** dist 아래 모든 .html 수집 */
function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

const SKIP = /^(https?:|mailto:|tel:|data:|#|\/\/)/;
let broken = 0;
let checked = 0;
const pages = walk(dist);

for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  const refs = new Set(
    [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]),
  );

  for (const ref of refs) {
    if (SKIP.test(ref)) continue;
    const [withoutHash] = ref.split('#');
    if (!withoutHash) continue;

    // 루트 절대 경로는 dist 기준, 상대 경로는 해당 페이지 디렉터리 기준
    const target = withoutHash.startsWith('/')
      ? path.join(dist, withoutHash)
      : path.join(path.dirname(page), withoutHash);

    checked += 1;
    const candidates = [target, `${target}.html`, path.join(target, 'index.html')];
    if (!candidates.some((c) => fs.existsSync(c))) {
      console.error(`BROKEN  ${path.relative(dist, page)}  ->  ${ref}`);
      broken += 1;
    }
  }
}

console.log(`검사한 참조 ${checked}건 / 페이지 ${pages.length}개`);
if (broken > 0) {
  console.error(`깨진 참조 ${broken}건`);
  process.exit(1);
}
console.log('깨진 참조 없음');
