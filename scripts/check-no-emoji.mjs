#!/usr/bin/env node
/**
 * 이모지 사용 검사.
 * 저장소 규칙상 코드, 주석, 커밋 메시지, 문서 어디에도 이모지를 쓰지 않습니다.
 *
 * 사용법: node scripts/check-no-emoji.mjs [경로...]
 * 경로를 주지 않으면 기본 대상(아래 DEFAULT_TARGETS)을 검사합니다.
 *
 * 기본 대상에 담는 기준은 AGENTS.md 7장입니다. "코드, 주석, 커밋 메시지, 문서
 * 어디에도 쓰지 않습니다"이므로 저장소가 추적하는 텍스트 파일은 모두 검사 대상입니다.
 * 2026-10-05 이전에는 최상위 md 3종만 담겨 있어 .github/, .agents/skills/,
 * astro.config.mjs, Makefile, .pre-commit-config.yaml 에 들어간 이모지를
 * CI 와 커밋 훅이 모두 놓치고 있었습니다.
 */
import fs from 'node:fs';
import path from 'node:path';
import { hasEmoji } from './lib/emoji.mjs';

const DEFAULT_TARGETS = [
  'src',
  'docs',
  'scripts',
  '.agents',
  '.github',
  '.claude',
  '.commandcode',
  'AGENTS.md',
  'SKILLS.md',
  'README.md',
  'astro.config.mjs',
  'Makefile',
  '.pre-commit-config.yaml',
  'package.json',
  'tsconfig.json',
];

const EXTS = new Set([
  '.md', '.astro', '.ts', '.js', '.mjs', '.css', '.json',
  '.yml', '.yaml', '.toml', '.html', '.swift',
]);

// 확장자가 없는 설정 파일입니다. EXTS 로는 걸리지 않으므로 이름으로 직접 받습니다.
// 이게 없으면 DEFAULT_TARGETS 에 Makefile 이 있어도 항상 0개를 셉니다.
const BARE_FILES = new Set(['Makefile']);

const IGNORE_DIRS = new Set(['node_modules', 'dist', '.astro', '.git', '.verify']);

const isEmoji = (s) => hasEmoji(s);

function walk(target, acc = []) {
  if (!fs.existsSync(target)) return acc;
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    if (EXTS.has(path.extname(target)) || BARE_FILES.has(path.basename(target)))
      acc.push(target);
    return acc;
  }
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      walk(path.join(target, entry.name), acc);
    } else if (EXTS.has(path.extname(entry.name)) || BARE_FILES.has(entry.name)) {
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
