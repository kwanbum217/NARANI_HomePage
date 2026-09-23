#!/usr/bin/env node
/**
 * 커밋 메시지 형식 검사.
 * 형식: "type: subject" 이며 subject 는 한국어입니다.
 * 커밋 메시지 파일 경로를 인자로 받습니다(pre-commit 의 commit-msg 훅).
 *
 * 사용법: node scripts/validate-commit-message.mjs .git/COMMIT_EDITMSG
 */
import fs from 'node:fs';
import { hasEmoji } from './lib/emoji.mjs';

const TYPES = new Set(['feat', 'fix', 'docs', 'refactor', 'chore', 'test', 'ci', 'merge']);

const file = process.argv[2];
if (!file) {
  console.error('사용법: node scripts/validate-commit-message.mjs <커밋메시지파일>');
  process.exit(1);
}

const raw = fs.readFileSync(file, 'utf8');

// 주석과 서명 트레일러를 제거한 첫 유효 줄을 검사합니다.
const firstLine = raw
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))[0];

if (!firstLine) {
  console.error('커밋 메시지가 비어 있습니다.');
  process.exit(1);
}

const errors = [];
const match = firstLine.match(/^([a-z]+):\s*(.+)$/);

if (!match) {
  errors.push('형식이 "type: subject" 가 아닙니다. 예: feat: 요금 페이지 추가');
} else {
  const [, type, subject] = match;

  if (!TYPES.has(type)) {
    errors.push(`허용되지 않은 type 입니다: ${type}. 허용: ${[...TYPES].join(', ')}`);
  }

  if (subject.length > 72) {
    errors.push(`subject 가 너무 깁니다(${subject.length}자). 50자 이내를 권장합니다.`);
  }

  if (subject.endsWith('.')) {
    errors.push('subject 끝에 마침표를 붙이지 않습니다.');
  }

  // subject 에 한글이 최소 1자 이상 있어야 합니다.
  if (!/[\u3131-\u318E\uAC00-\uD7A3]/.test(subject)) {
    errors.push('subject 는 한국어로 작성합니다.');
  }
}

if (hasEmoji(firstLine)) {
  errors.push('커밋 메시지에 이모지를 쓰지 않습니다.');
}

if (errors.length > 0) {
  console.error('커밋 메시지 규칙 위반:');
  for (const e of errors) console.error(`  - ${e}`);
  console.error(`\n입력한 메시지: ${firstLine}`);
  console.error('규칙: docs/ops/GIT_WORKFLOW.md 4장');
  process.exit(1);
}
