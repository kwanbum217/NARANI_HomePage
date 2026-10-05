#!/usr/bin/env node
// 문서 상대 링크 검사기
// 검사 대상: 저장소 루트 아래 모든 *.md (SKIP_DIRS 제외, 숨은 디렉터리 포함)
// 제외 디렉터리: node_modules, dist, .git, .verify, .astro, .worktrees

import fs from 'fs';
import path from 'path';

// 저장소 루트: 이 스크립트는 scripts/ 에 있으므로 한 단계 위
const REPO_ROOT = path.resolve(import.meta.dirname, '..');

// 검사를 건너뛸 디렉터리 이름 집합
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.verify', '.astro', '.worktrees']);

// 마크다운 링크 패턴: [텍스트](대상) 형태
// 대상 캡처 그룹만 필요합니다.
// 주의: 정규식 브래킷 안에 ] 를 넣으면 ERE 가 깨집니다 (DO_NOT_REPEAT 4.2).
// 따라서 ] 를 브래킷 밖에서 처리합니다.
const LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g;

// 건너뛸 프로토콜/스킴 목록
const SKIP_PREFIXES = ['http://', 'https://', 'mailto:', 'tel:', '//', 'data:'];

/**
 * 디렉터리를 재귀적으로 훑어 .md 파일 경로 배열을 반환합니다.
 * @param {string} dir 탐색 시작 디렉터리 (절대 경로)
 * @returns {string[]}
 */
function collectMarkdownFiles(dir) {
  const results = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const nested = collectMarkdownFiles(fullPath);
      for (const f of nested) {
        results.push(f);
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * 파일 한 개의 마크다운 링크를 검사하고 실패 목록을 반환합니다.
 * @param {string} filePath 검사 대상 파일 절대 경로
 * @returns {{ line: number; target: string }[]}
 */
function checkFile(filePath) {
  const failures = [];
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return failures;
  }

  const lines = content.split('\n');

  // 줄 번호를 유지하면서 각 줄의 링크를 검사합니다
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    LINK_RE.lastIndex = 0;
    let match;

    while ((match = LINK_RE.exec(line)) !== null) {
      const raw = match[2];

      // 건너뛸 프로토콜 확인
      let skip = false;
      for (const prefix of SKIP_PREFIXES) {
        if (raw.startsWith(prefix)) {
          skip = true;
          break;
        }
      }
      if (skip) continue;

      // 앵커(#로 시작)와 쿼리는 경로 부분만 추출합니다
      // #앵커만 인 경우 경로 부분이 빈 문자열 -> 통과
      const hashIdx = raw.indexOf('#');
      const queryIdx = raw.indexOf('?');
      let end = raw.length;
      if (hashIdx !== -1) end = Math.min(end, hashIdx);
      if (queryIdx !== -1) end = Math.min(end, queryIdx);

      const targetPath = raw.slice(0, end).trim();

      // 경로 부분이 비어 있으면 순수 앵커 -> 통과
      if (targetPath === '') continue;

      // 절대 경로(/로 시작)는 저장소 루트 기준, 상대 경로는 파일 디렉터리 기준
      let resolved;
      if (targetPath.startsWith('/')) {
        resolved = path.join(REPO_ROOT, targetPath);
      } else {
        const fileDir = path.dirname(filePath);
        resolved = path.resolve(fileDir, targetPath);
      }

      // 파일 또는 디렉터리로 존재하면 통과
      if (!fs.existsSync(resolved)) {
        failures.push({ line: lineIdx + 1, target: targetPath });
      }
    }
  }

  return failures;
}

function main() {
  // 루트부터 전체를 한 번에 훑습니다. 루트 *.md 도 이 스캔에 포함되므로 따로 더하지 않습니다(중복 검사 방지).
  const files = collectMarkdownFiles(REPO_ROOT);

  let totalLinks = 0;
  const allFailures = [];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    // 링크 수 집계 (경과 출력용)
    const matches = content.match(LINK_RE);
    if (matches) totalLinks += matches.length;

    const failures = checkFile(filePath);
    for (const f of failures) {
      allFailures.push({ file: filePath, ...f });
    }
  }

  if (allFailures.length === 0) {
    console.log(
      `통과: ${files.length}개 파일, ${totalLinks}개 링크를 검사했습니다. 깨진 링크 없음.`
    );
    process.exit(0);
  } else {
    for (const f of allFailures) {
      const rel = path.relative(REPO_ROOT, f.file);
      console.error(`${rel}:${f.line}  ->  ${f.target}`);
    }
    console.error(`\n실패: ${allFailures.length}건의 깨진 링크.`);
    process.exit(1);
  }
}

main();
