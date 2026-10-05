#!/usr/bin/env node
// 문서 상대 링크 검사기
// 검사 대상: 저장소 루트 아래 모든 *.md (SKIP_DIRS 제외, 숨은 디렉터리 포함)
// 제외 디렉터리: node_modules, dist, .git, .verify, .astro, .worktrees
//
// 경로 검사: 깨진 경로가 1건이라도 있으면 종료 코드 1.
// 앵커 검사: 결과는 stdout 에 보고만 하고 종료 코드에 반영하지 않습니다.
//   앵커 보고는 실패가 아니라 규칙 채택 단계의 정보이기 때문입니다. 이유는 main 의 주석에 적었습니다.

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// 저장소 루트: 이 스크립트는 scripts/ 에 있으므로 한 단계 위
const REPO_ROOT = path.resolve(import.meta.dirname, '..');

// 검사를 건너뛸 디렉터리 이름 집합
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.verify', '.astro', '.worktrees']);

// 인라인 링크 패턴: [텍스트](대상) 형태
// 대상 캡처 그룹만 필요합니다.
// 주의: 정규식 브래킷 안에 ] 를 넣으면 ERE 가 깨집니다 (DO_NOT_REPEAT 4.2).
// 따라서 ] 를 브래킷 밖에서 처리합니다.
// 백틱 안의 링크는 문서 예시이므로 stripInlineCode 로 걸러낸 뒤 검사합니다.
const LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g;

// 참조형 링크 정의 패턴: [이름]: 대상 형태 (줄 단위)
// 정의가 있는 줄을 실패 위치로 보고하기 위해 줄마다 검사합니다.
// 경로 생존 판정은 인라인과 같은 checkTarget 을 씁니다.
const DEF_RE = /^\s*\[[^\]]+\]:\s*(\S+)/;

// 건너뛸 프로토콜/스킴 목록
const SKIP_PREFIXES = ['http://', 'https://', 'mailto:', 'tel:', '//', 'data:'];

// 헤딩 slug 규칙 (GitHub 규칙):
// 1. 앞뒤 공백 제거, 소문자화
// 2. 알파벳·숫자·하이픈·밑줄·공백이 아닌 문자 제거. 한글은 남깁니다
// 3. 공백을 - 로 바꿈
// 4. 같은 파일에서 같은 slug 가 반복되면 두 번째부터 -1, -2, -3 을 붙임
// JavaScript 의 \w 는 ASCII 만 포함하므로 한글을 남기려면 유니코드 속성 \p{L} 을 씁니다.
function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\- ]/gu, '')
    .replace(/ /g, '-');
}

// 코드 펜스 판정: 앞 공백을 뺀 나머지가 ``` 로 시작하는 줄에서 펜스가 토글됩니다.
// 펜스 안의 # 은 헤딩이 아니므로 slug 목록에서 뺍니다.
const FENCE_RE = /^\s*```/;

// ATX 헤딩 판정: 최대 세 칸 들여쓰기, # 1~6개, 공백, 제목
const HEADING_RE = /^ {0,3}#{1,6}\s+(.*)$/;

// 대상 문서의 slug 목록 캐시: 같은 문서를 여러 링크가 가리켜도 한 번만 읽습니다
const slugCache = new Map();

/**
 * 마크다운 파일의 헤딩 slug 목록을 만듭니다.
 * 코드 펜스(```) 안의 헤딩은 제외합니다. 같은 slug 가 반복되면 두 번째부터
 * -1, -2, -3 을 붙입니다 (예: 두 번째 "인터랙션" 은 인터랙션-1).
 * @param {string} filePath 절대 경로
 * @returns {Set<string>}
 */
function collectSlugs(filePath) {
  const slugs = new Set();
  const seen = new Map();

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return slugs;
  }

  let inFence = false;
  for (const line of content.split('\n')) {
    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const heading = line.match(HEADING_RE);
    if (heading === null) continue;

    // ATX 닫는 # (# 제목 # 형태) 은 제목의 일부가 아닙니다
    const base = slugify(heading[1].replace(/\s+#+\s*$/, ''));
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    slugs.add(count === 0 ? base : `${base}-${count}`);
  }

  return slugs;
}

/**
 * slug 목록을 캐시에서 가져옵니다.
 * @param {string} filePath 절대 경로
 * @returns {Set<string>}
 */
function getSlugs(filePath) {
  if (!slugCache.has(filePath)) {
    slugCache.set(filePath, collectSlugs(filePath));
  }
  return slugCache.get(filePath);
}

/**
 * 줄 안의 인라인 코드(백틱으로 감싼 조각)를 공백으로 바꿉니다.
 * 백틱 안의 링크는 문서 예시이지 실제 링크가 아니므로 경로 검사와 앵커 검사
 * 양쪽이 같은 전처리를 씁니다. 여는 백틱 런과 길이가 같은 런이 닫는 지점이고,
 * 길이가 다른 런은 코드 내용으로 봅니다.
 * @param {string} line 원문 줄
 * @returns {string} 인라인 코드가 공백으로 치환된 줄
 */
function stripInlineCode(line) {
  let result = '';
  let i = 0;

  while (i < line.length) {
    if (line[i] !== '`') {
      result += line[i];
      i += 1;
      continue;
    }

    let openLen = 0;
    while (line[i + openLen] === '`') openLen += 1;

    let j = i + openLen;
    let closeAt = -1;
    while (j < line.length) {
      if (line[j] !== '`') {
        j += 1;
        continue;
      }
      let runLen = 0;
      while (line[j + runLen] === '`') runLen += 1;
      if (runLen === openLen) {
        closeAt = j;
        break;
      }
      j += runLen;
    }

    // 닫는 런이 없으면 나머지는 코드가 아니라 본문으로 보고 그대로 둡니다
    if (closeAt === -1) {
      result += line.slice(i);
      break;
    }

    result += ' '.repeat(closeAt + openLen - i);
    i = closeAt + openLen;
  }

  return result;
}

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
 * 링크 대상에서 경로 부분과 앵커 부분을 분리합니다.
 * 쿼리(?)는 경로 끝으로 보고, # 뒤에서 ? 앞까지를 앵커로 봅니다.
 * @param {string} raw 링크 대상 원문
 * @returns {{ pathPart: string; anchorPart: string | null }}
 */
function splitTarget(raw) {
  const hashIdx = raw.indexOf('#');
  const queryIdx = raw.indexOf('?');

  let pathEnd = raw.length;
  if (hashIdx !== -1) pathEnd = Math.min(pathEnd, hashIdx);
  if (queryIdx !== -1) pathEnd = Math.min(pathEnd, queryIdx);

  let anchorPart = null;
  if (hashIdx !== -1) {
    anchorPart = raw.slice(hashIdx + 1, queryIdx > hashIdx ? queryIdx : raw.length);
  }

  return { pathPart: raw.slice(0, pathEnd).trim(), anchorPart };
}

/**
 * 링크 대상의 경로 부분을 파일 경로로 해석합니다.
 * 절대 경로(/로 시작)는 저장소 루트 기준, 상대 경로는 파일 디렉터리 기준입니다.
 * @param {string} pathPart 경로 부분 (앵커·쿼리 제외)
 * @param {string} filePath 링크가 적힌 파일 절대 경로
 * @returns {string}
 */
function resolveTargetFile(pathPart, filePath) {
  if (pathPart.startsWith('/')) {
    return path.join(REPO_ROOT, pathPart);
  }
  return path.resolve(path.dirname(filePath), pathPart);
}

/**
 * 링크 대상의 경로 생존을 확인합니다. 인라인 링크와 참조형 정의가
 * 같은 판정을 쓰도록 로직은 이 한 곳에 둡니다.
 * 앵커(#)는 여기서 보지 않습니다. 앵커는 checkAnchor 가 판정합니다.
 * @param {string} raw 링크 대상 원문
 * @param {string} filePath 대상이 적힌 파일 절대 경로
 * @returns {string | null} 깨진 경로 (건너뛰거나 실존하면 null)
 */
function checkTarget(raw, filePath) {
  // 건너뛸 프로토콜 확인
  for (const prefix of SKIP_PREFIXES) {
    if (raw.startsWith(prefix)) return null;
  }

  const { pathPart } = splitTarget(raw);

  // 경로 부분이 비어 있으면 순수 앵커 -> 통과
  if (pathPart === '') return null;

  if (fs.existsSync(resolveTargetFile(pathPart, filePath))) return null;

  return pathPart;
}

/**
 * 앵커 링크의 앵커가 대상 문서의 헤딩 slug 목록에 있는지 확인합니다.
 * 대상이 마크다운이 아니거나 경로가 이미 깨져 있으면 검사하지 않습니다
 * (경로 실패는 checkTarget 이 보고합니다).
 * @param {string} raw 링크 대상 원문
 * @param {string} filePath 링크가 적힌 파일 절대 경로
 * @returns {{ checked: boolean; ok: boolean }} checked 는 검사 여부, ok 는 앵커 존재 여부
 */
function checkAnchor(raw, filePath) {
  // 건너뛸 프로토콜 확인
  for (const prefix of SKIP_PREFIXES) {
    if (raw.startsWith(prefix)) return { checked: false, ok: true };
  }

  const { pathPart, anchorPart } = splitTarget(raw);

  // 앵커가 없거나 빈 앵커(# 하나만) 면 검사 대상이 아닙니다
  if (anchorPart === null || anchorPart === '') return { checked: false, ok: true };

  // 퍼센트 인코딩된 한글 앵커가 들어올 수 있으므로 URL 디코딩합니다
  let anchor = anchorPart;
  try {
    anchor = decodeURIComponent(anchorPart);
  } catch {
    anchor = anchorPart;
  }

  // 경로가 없으면 이 문서, 있으면 해석한 대상 문서를 기준으로 합니다
  let targetFile = filePath;
  if (pathPart !== '') {
    targetFile = resolveTargetFile(pathPart, filePath);
    if (!fs.existsSync(targetFile)) return { checked: false, ok: true };
  }

  // 마크다운이 아니면 헤딩이 없으므로 검사하지 않습니다
  if (!targetFile.endsWith('.md')) return { checked: false, ok: true };

  return { checked: true, ok: getSlugs(targetFile).has(anchor) };
}

/**
 * 줄에서 앵커(#)를 가진 인라인 링크 수를 셉니다.
 * 인라인 코드 제외량을 재기 위한 지표입니다.
 * @param {string} line
 * @returns {number}
 */
function countAnchorTargets(line) {
  let count = 0;
  LINK_RE.lastIndex = 0;
  let match;
  while ((match = LINK_RE.exec(line)) !== null) {
    if (match[2].includes('#')) count += 1;
  }
  return count;
}

/**
 * 파일 한 개의 마크다운 링크를 검사합니다.
 * 인라인 링크와 참조형 정의를 함께 검사하며, 실패 위치는 해당 구문이
 * 적힌 줄 번호입니다. 정의가 깨지면 본문 참조가 아니라 정의 줄을 지적합니다.
 * 백틱 안의 링크는 경로 검사와 앵커 검사 모두에서 제외합니다.
 * @param {string} filePath 검사 대상 파일 절대 경로
 * @returns {{ failures: { line: number; target: string }[]; anchorReports: { line: number; target: string }[]; links: number; anchorLinksChecked: number; anchorLinksInCode: number }}
 */
function checkFile(filePath) {
  const failures = [];
  const anchorReports = [];
  let links = 0;
  let anchorLinksChecked = 0;
  let anchorLinksInCode = 0;

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return { failures, anchorReports, links, anchorLinksChecked, anchorLinksInCode };
  }

  const lines = content.split('\n');

  // 줄 번호를 유지하면서 각 줄의 링크를 검사합니다
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];

    // 백틱 안의 링크는 문서 예시이므로 경로 검사와 앵커 검사 모두에서 제외합니다
    const codeStripped = stripInlineCode(line);

    // 인라인 코드 때문에 검사에서 빠진 앵커 링크 수 (보고용 지표)
    anchorLinksInCode += countAnchorTargets(line) - countAnchorTargets(codeStripped);

    // 인라인 링크 [텍스트](대상)
    LINK_RE.lastIndex = 0;
    let match;

    while ((match = LINK_RE.exec(codeStripped)) !== null) {
      links += 1;
      const target = match[2];

      const broken = checkTarget(target, filePath);
      if (broken !== null) {
        failures.push({ line: lineIdx + 1, target: broken });
      }

      const anchor = checkAnchor(target, filePath);
      if (anchor.checked) {
        anchorLinksChecked += 1;
        if (!anchor.ok) {
          anchorReports.push({ line: lineIdx + 1, target });
        }
      }
    }

    // 참조형 정의 [이름]: 대상
    const defMatch = codeStripped.match(DEF_RE);
    if (defMatch !== null) {
      links += 1;
      const target = defMatch[1];

      const broken = checkTarget(target, filePath);
      if (broken !== null) {
        failures.push({ line: lineIdx + 1, target: broken });
      }

      const anchor = checkAnchor(target, filePath);
      if (anchor.checked) {
        anchorLinksChecked += 1;
        if (!anchor.ok) {
          anchorReports.push({ line: lineIdx + 1, target });
        }
      }
    }
  }

  return { failures, anchorReports, links, anchorLinksChecked, anchorLinksInCode };
}

function main() {
  // 루트부터 전체를 한 번에 훑습니다. 루트 *.md 도 이 스캔에 포함되므로 따로 더하지 않습니다(중복 검사 방지).
  const files = collectMarkdownFiles(REPO_ROOT);

  let totalLinks = 0;
  let totalAnchorLinks = 0;
  let totalAnchorLinksInCode = 0;
  const allFailures = [];
  const allAnchorReports = [];

  for (const filePath of files) {
    const result = checkFile(filePath);
    totalLinks += result.links;
    totalAnchorLinks += result.anchorLinksChecked;
    totalAnchorLinksInCode += result.anchorLinksInCode;

    for (const f of result.failures) {
      allFailures.push({ file: filePath, ...f });
    }
    for (const a of result.anchorReports) {
      allAnchorReports.push({ file: filePath, ...a });
    }
  }

  if (allFailures.length === 0) {
    console.log(
      `통과: ${files.length}개 파일, ${totalLinks}개 링크를 검사했습니다. 깨진 링크 없음.`
    );
  } else {
    for (const f of allFailures) {
      const rel = path.relative(REPO_ROOT, f.file);
      console.error(`${rel}:${f.line}  ->  ${f.target}`);
    }
    console.error(`\n실패: ${allFailures.length}건의 깨진 링크.`);
  }

  // 앵커 보고는 1단계에서 종료 코드에 반영하지 않습니다.
  // 이유: 저장소의 앵커 링크는 아직 실사용 단계가 아니고, 앵커 하나를 붙이는 순간
  // 연결된 문서를 전부 고치게 만드는 것은 실제 결함이 아니라 규칙 채택 비용입니다.
  // 2단계(실패 승격)는 실제 앵커 사용이 생기고 slug 규칙이 실측으로 검증된 뒤 전환합니다.
  if (allAnchorReports.length > 0) {
    console.log(
      `\n앵커 확인 필요: ${allAnchorReports.length}건 (앵커 링크 ${totalAnchorLinks}건 확인, 인라인 코드 안 ${totalAnchorLinksInCode}건 제외)`
    );
    for (const a of allAnchorReports) {
      const rel = path.relative(REPO_ROOT, a.file);
      console.log(`  ${rel}:${a.line}  ->  ${a.target}`);
    }
    console.log('앵커 검사는 1단계(보고 전용)이므로 위 보고를 종료 코드에 반영하지 않습니다.');
  } else {
    console.log(
      `앵커 검사: 앵커 링크 ${totalAnchorLinks}건 확인, 인라인 코드 안 ${totalAnchorLinksInCode}건 제외. 보고 0건 (1단계: 보고 전용, 종료 코드 미반영).`
    );
  }

  process.exit(allFailures.length === 0 ? 0 : 1);
}

// slug 규칙 검증용으로 내보냅니다. 직접 실행할 때만 본 검사를 돌립니다.
export { slugify, collectSlugs };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
