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

// 참조형 링크 정의 패턴: [이름]: 대상 형태 (줄 단위)
// 정의가 있는 줄을 실패 위치로 보고하기 위해 줄마다 검사합니다.
// 경로 생존 판정은 인라인과 같은 checkTarget 을 씁니다.
const DEF_RE = /^\s*\[[^\]]+\]:\s*(\S+)/;

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
 * 링크 대상의 경로 생존을 확인합니다. 인라인 링크와 참조형 정의가
 * 같은 판정을 쓰도록 로직은 이 한 곳에 둡니다.
 * 앵커(#)는 검사하지 않습니다. 헤딩의 slug 규칙이 렌더러마다 달라
 * 잘못된 판정을 만들 수 있기 때문입니다.
 * @param {string} raw 링크 대상 원문
 * @param {string} filePath 대상이 적힌 파일 절대 경로
 * @returns {string | null} 깨진 경로 (건너뛰거나 실존하면 null)
 */
function checkTarget(raw, filePath) {
  // 건너뛸 프로토콜 확인
  for (const prefix of SKIP_PREFIXES) {
    if (raw.startsWith(prefix)) return null;
  }

  // 앵커(#)와 쿼리(?)는 떼고 경로 부분만 추출합니다
  // 앵커만 있는 경우 경로 부분이 빈 문자열 -> 통과
  const hashIdx = raw.indexOf('#');
  const queryIdx = raw.indexOf('?');
  let end = raw.length;
  if (hashIdx !== -1) end = Math.min(end, hashIdx);
  if (queryIdx !== -1) end = Math.min(end, queryIdx);

  const targetPath = raw.slice(0, end).trim();

  // 경로 부분이 비어 있으면 순수 앵커 -> 통과
  if (targetPath === '') return null;

  // 절대 경로(/로 시작)는 저장소 루트 기준, 상대 경로는 파일 디렉터리 기준
  let resolved;
  if (targetPath.startsWith('/')) {
    resolved = path.join(REPO_ROOT, targetPath);
  } else {
    const fileDir = path.dirname(filePath);
    resolved = path.resolve(fileDir, targetPath);
  }

  // 파일 또는 디렉터리로 존재하면 통과
  if (fs.existsSync(resolved)) return null;

  return targetPath;
}

/**
 * 파일 한 개의 마크다운 링크를 검사하고 실패 목록을 반환합니다.
 * 인라인 링크와 참조형 정의를 함께 검사하며, 실패 위치는 해당 구문이
 * 적힌 줄 번호입니다. 정의가 깨지면 본문 참조가 아니라 정의 줄을 지적합니다.
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

    // 인라인 링크 [텍스트](대상)
    LINK_RE.lastIndex = 0;
    let match;

    while ((match = LINK_RE.exec(line)) !== null) {
      const broken = checkTarget(match[2], filePath);
      if (broken !== null) {
        failures.push({ line: lineIdx + 1, target: broken });
      }
    }

    // 참조형 정의 [이름]: 대상
    const defMatch = line.match(DEF_RE);
    if (defMatch !== null) {
      const broken = checkTarget(defMatch[1], filePath);
      if (broken !== null) {
        failures.push({ line: lineIdx + 1, target: broken });
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
    // 링크 수 집계 (경과 출력용): 인라인 링크와 참조형 정의를 함께 셉니다
    const matches = content.match(LINK_RE);
    if (matches) totalLinks += matches.length;
    for (const line of content.split('\n')) {
      if (DEF_RE.test(line)) totalLinks += 1;
    }

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
