#!/usr/bin/env node
/**
 * 이모지 사용 검사.
 * 저장소 규칙상 코드, 주석, 커밋 메시지, 문서 어디에도 이모지를 쓰지 않습니다.
 *
 * 사용법: node scripts/check-no-emoji.mjs [경로...]
 * 경로를 주지 않으면 기본 대상(src, docs, scripts, 최상위 md)을 검사합니다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { hasEmoji } from './lib/emoji.mjs';

const DEFAULT_TARGETS = ['src', 'docs', 'scripts', 'AGENTS.md', 'SKILLS.md', 'README.md'];

const EXTS = new Set([
  '.md', '.astro', '.ts', '.js', '.mjs', '.css', '.json',
  '.yml', '.yaml', '.toml', '.html', '.swift',
]);

const IGNORE_DIRS = new Set(['node_modules', 'dist', '.astro', '.git', '.verify']);

const isEmoji = (s) => hasEmoji(s);

function walk(target, acc = []) {
  if (!fs.existsSync(target)) return acc;
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    if (EXTS.has(path.extname(target))) acc.push(target);
    return acc;
  }
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      walk(path.join(target, entry.name), acc);
    } else if (EXTS.has(path.extname(entry.name))) {
      acc.push(path.join(target, entry.name));
    }
  }
  return acc;
}

const targets = process.argv.slice(2);
const files = (targets.length ? targets : DEFAULT_TARGETS).flatMap((t) => walk(t));

let violations = 0;
for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (isEmoji(line)) {
      console.error(`${file}:${i + 1}  이모지 발견: ${line.trim().slice(0, 80)}`);
      violations += 1;
    }
  });
}

console.log(`검사한 파일 ${files.length}개`);
if (violations > 0) {
  console.error(`이모지 사용 ${violations}건. AGENTS.md 7장에 따라 제거가 필요합니다.`);
  process.exit(1);
}
console.log('이모지 없음');
