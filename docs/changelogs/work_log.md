# 작업 일지

> **작성일**: 2026-09-23
> **버전**: v1.0.0
> 기록 형식: 날짜, 범위, 변경, 검증, 남은 것.

---

## 2026-09-29 — 서비스 페이지 기능 행 아이콘 표시

### 범위

2026-09-28에 보류했던 서비스 페이지 시각 자료를 사용자가 재개했습니다. 서비스 페이지
핵심 기능 3행에 기존 `capabilities.icon` 을 제목 옆 24px 마크로 그립니다.

### 변경

| 항목 | 내용 |
| --- | --- |
| 아이콘 표시 | `src/pages/bidbox/service.astro` 핵심 기능 행의 제목 옆에 `set:html={capability.icon}` 로 24px SVG 를 넣습니다. path 를 마크업에 복제하지 않고 데이터에서만 옵니다 |
| 마크 스타일 | `src/styles/global.css` 의 `.rows` 근처에 `.cap-mark`(24px, `flex-shrink: 0`)를 추가했습니다. 색은 `currentColor` 를 유지합니다 |
| 데이터 주석 | `src/data/site.ts` 의 `capabilities` 주석을 아이콘이 서비스 페이지 행에서 렌더된다고 고쳤습니다. `icon` 문자열 값은 바꾸지 않았습니다 |
| 문서 | `docs/context/CURRENT_STATE.md` 5장 6번을 완료로, `docs/analysis/고도화_후보_20260928.md` 머리말과 4순위, `docs/handoff/2026-09-29_queue.md` 2장, `docs/design/HALLMARK_REDESIGN.md` 5.1 을 재개 내용으로 갱신했습니다 |

### 건드리지 않은 것

- 배포, 결제, 문의·데모 접수 API. 이번 범위가 아니며 보류 결정을 그대로 둡니다.
- 허브(`/bidbox/`) 아이콘. 허브는 specimen 이므로 아이콘 없이 둡니다.
- 3열 카드와 아이콘 타일. 복원하지 않았습니다.
- Alpine 지점. 추가하지 않았습니다.

### 검증

워커는 `npm run check:emoji` 만 실행했습니다. 코디네이터가 워크트리에서
`npm run verify` 를 실행해 종료 코드 0 으로 통과했습니다. Node 26.10.0,
서빙 포트 64704(자동 배정)입니다. 8단계가 모두 통과했습니다. 대비 등 실측
수치는 [`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) 가 정본이므로
이 일지에 옮기지 않습니다.

### 남은 것

- 원격 푸시는 2026-09-29에 했습니다. `main` 과 `origin/main` 은 `1ac5537` 입니다.
- 배포, 결제, 문의·데모 접수 API 는 보류입니다. 현재 인수인계는 [`../handoff/2026-09-29_queue.md`](../handoff/2026-09-29_queue.md) 입니다.
- Chrome, Firefox, 실기기 확인은 [`../ops/BUILD_AND_DEPLOY.md`](../ops/BUILD_AND_DEPLOY.md) 5장의 사람 점검이며 이번 검증에 넣지 않았습니다.

---

## 2026-09-23 — 저장소 최초 구성 및 1차 구현

### 범위

Google Slides 구성안 9장을 7페이지 정적 사이트로 옮기고, 에이전틱 개발 환경을 구성했습니다.

### 구현

| 항목 | 내용 |
| --- | --- |
| 원본 추출 | MCP `get_presentation`, `export/txt`, `export/pdf`, Swift PDFKit 렌더, Vision OCR, 픽셀 색상 분석 |
| 페이지 | `/`, `/company/`, `/bidbox/`, `/bidbox/service/`, `/bidbox/pricing/`, `/bidbox/demo/`, `/bidbox/contact/` |
| 디자인 | 두 레지스터(라이트 nani / 다크 bidbox), 토큰 `:root` 단일화 |
| 콘텐츠 | `src/data/site.ts`, `src/data/pricing.ts` 로 브랜드·요금 단일 소스화 |
| 컴포넌트 | `Logo.astro`, `Header.astro`(2 variant), `Footer.astro`(2 variant), `BaseLayout.astro` |
| 인터랙션 | Alpine 3개소. 모바일 메뉴, 폼 상태, 주문 확인 다이얼로그 |
| 검증 | `scripts/verify.sh` 6단계 파이프라인, WebKit 기반 감사 도구 3종 |

### 경위

1. 순수 HTML 7개 파일로 1차 구현 후 WebKit 으로 검증했습니다.
2. 브랜드가 커지면 수정 지점이 늘어나는 문제를 확인하고 Astro 이관을 결정했습니다
   (ADR-0001).
3. HTML 을 `.astro` 로 기계 변환하면서 Tailwind 3 important 접두사 41건을 Tailwind 4
   접미사로 바꿨습니다.
4. 콘텐츠를 데이터 모듈로 승격하고 두 페이지에 중복된 문구를 배선했습니다.

### 검증

| 항목 | 결과 |
| --- | --- |
| 콘솔 오류 | 7개 페이지 0건 |
| 콘솔 경고 | 0건 (Tailwind CDN 경고 제거) |
| 깨진 참조 | 0건 |
| 320px 문서 오버플로우 | 없음 |
| 라이트/다크 대비 | 이관 전후 동일 |

수치의 정본은 [`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) 입니다.

### 발견하고 수정한 결함

| 결함 | 원인 | 수정 |
| --- | --- | --- |
| 320px 가로 오버플로우 94px | 그리드 자식의 기본 `min-width: auto` | `min-w-0` 추가 |
| 내비 터치 타겟 42px | 컴포넌트 패딩 부족 | `min-height: 44px` |
| 모바일 메뉴가 반대로 동작 | `x-cloak` + `x-show` + `x-transition` 조합 | 전환 제거 |
| 폼 오류가 입력 후에도 남음 | 오류 상태를 제출 시에만 갱신 | `clear(field)` 추가 |
| 할인 표시 불일치 | 페이지마다 다른 조건 | `listPrice` 필드로 단일화 |

### 남은 것

- 테마 시각 확정 (담당자 육안 확인 필요)
- 이메일 표기 확정 (`surport@` 의 오타 여부)
- 폼 백엔드 연결
- 결제를 제품 본체 라우트로 연결
- sitemap, robots, OG 이미지
- 도메인 연결 및 첫 배포

목록의 정본은 [`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) 4장입니다.

---

## 2026-09-23 — 원격 연결과 CI 구성

### 범위

GitHub 원격 저장소 연결, CI 워크플로우 구성, CI 액션 버전 상향.

### 변경

| 항목 | 내용 |
| --- | --- |
| 원격 | `origin` = `github.com/kwanbum217/NARANI_HomePage` |
| 브랜치 | 최초 부트스트랩 커밋만 `main` 직접. 이후는 작업 브랜치 후 `--no-ff` 병합 |
| CI | `.github/workflows/ci.yml`. 이모지 검사, 빌드, 링크 무결성, 산출물 업로드 |
| 액션 | `actions/checkout`, `setup-node`, `upload-artifact` 를 v7 로 상향 |

### 경위

1. 최초 커밋 푸시 후 CI 가 통과했으나 Node 20 deprecation 경고가 발생했습니다.
2. 액션 v7 이 존재하는 것을 확인하고 상향했습니다. 경고가 사라졌습니다.
3. 이 커밋은 `chore/ci-action-versions` 브랜치에서 작업 후 `--no-ff` 로 병합해
   [`../ops/GIT_WORKFLOW.md`](../ops/GIT_WORKFLOW.md) 의 절차를 실제로 검증했습니다.

### 검증

| 항목 | 결과 |
| --- | --- |
| CI 실행 | 성공 (약 17초) |
| Node 20 deprecation 경고 | 해소 |
| 남은 경고 | `ubuntu-latest` 라벨 마이그레이션 안내(정보성) |

---

## 2026-09-28 — 검증 게이트 고도화와 상태 정본 구조 정리

### 범위

검증 게이트 고도화, 2026-09-23 기록의 남은 항목 해소, 상태 정본 5장 구조 정리.

### 변경

| 항목 | 내용 |
| --- | --- |
| sitemap, robots, OG 이미지 | 구현 완료. `scripts/check-sitemap.mjs` 를 게이트 4단계에 넣어 색인 누락까지 기계로 검사합니다 |
| 이메일 표기 | 2026-09-23 기록의 `surport@` 오타 여부를 `support@narani.my` 로 확정했습니다 |
| 결제·접수 API | 4장 4.2 로 보류 확정했습니다. 2026-09-15 사용자 결정에 묶인 사안입니다 |
| 상태 정본 5장 | `CURRENT_STATE.md` 5장의 중복·역행 번호(9 가 3회, 10 이 2회)를 1~15 로 재매김하고 명백히 끝난 항목에 **완료** 표시를 붙였습니다. 절 머리에 이 절이 우선순위 목록이 아니라는 안내를 추가했습니다 |

### 검증

| 항목 | 결과 |
| --- | --- |
| 5장 번호 매김 | grep 으로 1부터 15까지 끊김 없이 증가함을 확인 |
| 이모지 | `npm run check:emoji` 통과 |
| 링크 | 두 문서의 상대 링크가 가리키는 파일 실존 확인 |

수치의 정본은 [`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) 입니다.

### 남은 것

- 도메인 연결 및 첫 배포 (사람 결정 필요)
- GA4 실사용 데이터 확인 (배포가 선행됨)
- 서비스 페이지 시각 자료 (이번 회차 보류)

목록의 정본은 [`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) 4장과 5장입니다.
