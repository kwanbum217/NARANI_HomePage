# 검색 노출 착지분 리뷰

> **작성일**: 2026-09-25
> **버전**: v2.0.0
> **상태**: 착지분 검토. 이전 갭 리뷰(v1.0.0)를 대체합니다.
> **대상 브랜치**: `feat/검색-노출`
> **사용 모델**: Muse Spark 1.3

---

## 1. 요약

상태 표시줄이 Muse Spark 1.3임을 확인한 뒤 검토를 시작하였습니다. GLM 세션이 아닙니다.

이번 검토는 착지된 코드를 대상으로 하며, 구현 전에 작성된 이전 갭 리뷰의 판정을 대체합니다. 아래 2장에 적은 일곱 가지 착지 파일을 직접 읽고 판정하였습니다.

판정 결과 일곱 가지 기준이 모두 적합하며 열린 이슈가 없습니다. `npm`과 `astro`, `scripts/verify.sh`는 실행하지 않았으므로 빌드 산출물의 렌더와 링크 결과는 미검증으로 남깁니다.

---

## 2. 읽은 범위

| 구분 | 읽은 대상 | 용도 |
| --- | --- | --- |
| 코드 | `src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts`, `public/og.svg`, `src/layouts/BaseLayout.astro` | 판정 3.2, 3.3, 3.4, 3.5의 근거 |
| 코드 | `package.json:15-20`, `astro.config.mjs:5-11` | 판정 3.1의 근거 |
| 참조 | `src/styles/global.css:10-43`, `docs/context/CURRENT_STATE.md` 1장 | 브랜드 색상과 7개 라우트의 대조 기준 |
| 문서 | `docs/context/CURRENT_STATE.md` 1장 28행과 4장, `docs/ops/BUILD_AND_DEPLOY.md` 2장과 7장 | 판정 3.6의 근거 |
| 확인 | `public/og.png` 파일 헤더 크기, `git diff`와 `git status`의 변경 목록 | 치수와 변경 범위 확인 |

`public/og.png`는 이미지 내용의 육안 대조가 아니라 파일 헤더의 크기만 확인하였습니다. 읽지 않은 파일에 대한 판정은 하지 않았습니다. 작업 트리에 이전 검토 작업의 `docs/ops/DO_NOT_REPEAT.md` 수정이 남아 있으나 이번 검토 범위가 아니므로 손대지 않았습니다.

---

## 3. 항목별 판정

### 3.1 새 의존성과 출력 모드

적합합니다. 이 절은 코드를 읽은 소견입니다.

| 항목 | 근거 | 판정 |
| --- | --- | --- |
| 새 의존성 없음 | `package.json:15-20` 의존성이 기존 네 가지 그대로입니다. | 통과 |
| 프리렌더 엔드포인트 | `src/pages/sitemap.xml.ts:3`과 `src/pages/robots.txt.ts:3`에 `prerender = true`가 있습니다. | 통과 |
| 정적 출력 유지 | `astro.config.mjs:5-11`에 서버 출력 설정이 없고 형식은 `directory`입니다. | 통과 |
| 내장 모듈 사용 | `src/layouts/BaseLayout.astro:2-3`의 `node:fs`와 `node:path`는 내장 모듈이라 새 패키지가 아닙니다. | 통과 |

### 3.2 사이트맵

적합합니다. 이 절은 코드를 읽은 소견입니다.

| 항목 | 근거 | 판정 |
| --- | --- | --- |
| 일곱 경로만 나열 | `src/pages/sitemap.xml.ts:5-13` 경로가 `/`, `/company/`, `/bidbox/`, `/bidbox/service/`, `/bidbox/pricing/`, `/bidbox/demo/`, `/bidbox/contact/` 일곱 가지이며 `docs/context/CURRENT_STATE.md` 1장의 라우트 표와 일치합니다. 여분 경로가 없습니다. | 통과 |
| origin 파생 | `src/pages/sitemap.xml.ts:21` 위치를 `new URL(path, site).href`로 만들며 `site`가 없으면 16행에서 오류를 냅니다. 기준값은 `astro.config.mjs:7`의 `site`입니다. | 통과 |

### 3.3 robots.txt

적합합니다. 이 절은 코드를 읽은 소견입니다.

| 항목 | 근거 | 판정 |
| --- | --- | --- |
| 크롤 허용 | `src/pages/robots.txt.ts:10-11` 내용이 `User-agent: *`와 `Allow: /`입니다. | 통과 |
| 사이트맵 지시 | `src/pages/robots.txt.ts:13` 사이트맵을 `new URL('/sitemap.xml', site).href` 절대 경로로 안내합니다. | 통과 |

### 3.4 공유 이미지

적합합니다. 이 절은 코드를 읽은 소견입니다.

| 항목 | 근거 | 판정 |
| --- | --- | --- |
| 크기 1200x630 | `public/og.svg:1` 너비와 높이, 보기 상자가 1200x630이며 `public/og.png` 파일 헤더의 크기도 1200x630입니다. | 통과 |
| 브랜드 색상만 사용 | `public/og.svg`의 칠 색상 여섯 가지가 모두 `src/styles/global.css:10-43` 토큰값과 일치합니다. 아래 대조표를 참조하십시오. | 통과 |
| 태그라인 정확 일치 | `public/og.svg:5` 보이는 문구가 `사용자와 소프트웨어는 나란히 일한다` 그대로입니다. | 통과 |
| 금지 요소 없음 | 파일 직접 확인 결과 이모지가 없고 그라디언트와 사진 요소가 없으며 이탤릭 지정이 없습니다. | 통과 |

색상 대조:

| `og.svg` 색상 | `global.css` 토큰 |
| --- | --- |
| `#faf9f7` | `--nani-bg` |
| `#0a1f33` | `--nani-ink` |
| `#003066` | `--nani-navy` |
| `#5a6b7b` | `--nani-muted` |
| `#0073e6` | `--primary` |
| `#B8DDF0` | `--bb-accent` (대소문자만 다름) |

`og.png`와 `og.svg`의 시각적 동일성은 렌더하지 않았으므로 미검증으로 남깁니다.

### 3.5 BaseLayout 헤드

적합합니다. 이 절은 코드를 읽은 소견입니다.

| 항목 | 근거 | 판정 |
| --- | --- | --- |
| 기존 OG 유지 | `src/layouts/BaseLayout.astro:38-41` 네 가지가 그대로 있습니다. `og:type`, `og:site_name`, `og:title`, `og:description`입니다. | 통과 |
| 정식 주소와 이미지 추가 | 같은 파일 42행 `og:url`, 43행 `og:image`가 추가되었습니다. | 통과 |
| 트위터 카드 추가 | 같은 파일 44행 `twitter:card`, 45행 `twitter:title`, 46행 `twitter:description`이 추가되었습니다. | 통과 |
| 이미지 절대 경로 | 같은 파일 19행 `canonicalUrl`과 20행 `ogImage`가 `Astro.site` 기준 절대 경로이며 `og.png`가 존재하므로 `og:image`는 `og.png`를 가리킵니다. | 통과 |
| 헤더와 푸터, 본문 복사 변경 없음 | 변경분 비교 결과 헤드와 앞부분 선언만 바뀌고 `Header`와 `Footer`, `slot` 구조가 그대로이며 다른 페이지와 컴포넌트 파일의 변경이 없습니다. | 통과 |

### 3.6 상태 문서의 미추가 문구 해소

적합합니다. 이 절은 문서를 읽은 소견입니다.

| 항목 | 근거 | 판정 |
| --- | --- | --- |
| CURRENT_STATE | `docs/context/CURRENT_STATE.md:28` 행이 사이트맵과 로봇, OG를 완료로 적고 미추가 문구가 없습니다. 4장 열린 항목에도 검색 노출 잔여 행이 없습니다. | 통과 |
| BUILD_AND_DEPLOY | `docs/ops/BUILD_AND_DEPLOY.md:37-46` 산출물 구조에 세 가지가 포함되고 7장이 구현 상태로 바뀌었으며 미추가 표기가 없습니다. | 통과 |

수치를 새로 적지 않았으므로 정본 링크 유지 규칙과 어긋나지 않습니다.

### 3.7 검증 범위 고지

`npm`과 `astro`, `scripts/verify.sh`를 실행하지 않았습니다. 빌더의 검증 주장을 제 측정으로 간주하지 않으며, 빌드 산출물의 렌더와 링크 무결성, 접근성과 인터랙션 결과는 미검증으로 남깁니다. 다음 착수 전에 `npm run verify`를 실행하시기 바랍니다.

---

## 4. 참고 관찰

심각도를 매기지 않은 관찰 한 가지가 있습니다. 열린 이슈가 아닙니다.

| 항목 | 내용 |
| --- | --- |
| 파일 경로 | `src/layouts/BaseLayout.astro:20-23` |
| 내용 | `og.png`가 있으면 `og.png`를, 없으면 `og.svg`를 참조하는 대체 구조입니다. 현재 두 파일이 모두 있어 `og.png`가 참조됩니다. 에셋이 삭제되어도 빌드가 깨지지 않고 조용히 넘어가므로, 필요하시면 단일 경로 고정을 검토하십시오. 수정을 요구하지 않습니다. |

---

## 5. 열린 이슈 수와 사용 모델

| 심각도 | 열린 건수 |
| --- | --- |
| critical | 0건 |
| major | 0건 |
| minor | 0건 |

합계 열린 이슈는 0건입니다. 본 리뷰는 Muse Spark 1.3 모델로 작성하였습니다.
