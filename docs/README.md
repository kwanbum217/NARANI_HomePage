# narani_homepage 문서 인덱스

> **작성일**: 2026-09-23
> **버전**: v1.0.0
> **상태**: 1차 구현 및 검증 완료. 결제·폼 백엔드 미연결
> **적용 범위**: Google Slides 구성안 9장 → 7페이지 정적 사이트

---

## 문서 목록

| 문서 | 파일 | 설명 |
| --- | --- | --- |
| **상태 정본** | [`context/CURRENT_STATE.md`](context/CURRENT_STATE.md) | **단일 진실 원천.** 구현 상태, 실측 지표, 회귀 기준선, 열린 항목 |
| **기각 목록** | [`ops/DO_NOT_REPEAT.md`](ops/DO_NOT_REPEAT.md) | 이미 실패한 접근과 실측 근거 |
| 디자인 시스템 | [`design/DESIGN_SYSTEM.md`](design/DESIGN_SYSTEM.md) | 토큰, 두 레지스터, 컴포넌트, 모션 |
| 브랜드 기준 | [`design/BRAND.md`](design/BRAND.md) | 로고, 색, 타이포, 보이스, 금지 표현 |
| 슬라이드 매핑 | [`design/DECK_TO_SITE_MAP.md`](design/DECK_TO_SITE_MAP.md) | 원본 9장과 페이지 대응, 추출 방법과 근거 |
| 아키텍처 결정 | [`design/ADR-0001-astro-static-marketing-site.md`](design/ADR-0001-astro-static-marketing-site.md) | Astro 정적 사이트 채택, React·서버 미도입 |
| 페이지 명세 | [`spec/PAGE_SPEC.md`](spec/PAGE_SPEC.md) | 페이지별 섹션, 카피, 상태, 수용 기준 |
| 콘텐츠 모델 | [`spec/CONTENT_MODEL.md`](spec/CONTENT_MODEL.md) | `src/data/` 스키마와 수정 절차 |
| 검증·접근성 | [`spec/QA_AND_A11Y.md`](spec/QA_AND_A11Y.md) | 검증 단계, 접근성 하한, 도구 사용법 |
| 빌드·배포 | [`ops/BUILD_AND_DEPLOY.md`](ops/BUILD_AND_DEPLOY.md) | 빌드, 정적 배포, 도메인, 캐시 |
| Git 워크플로우 | [`ops/GIT_WORKFLOW.md`](ops/GIT_WORKFLOW.md) | 브랜치, 커밋, 병합, 훅 |
| Orca 워커 운용 | [`ops/ORCA_WORKERS.md`](ops/ORCA_WORKERS.md) | cmd 주력 워커 기동·감시·회수, 멈춤 원인 |
| 인수인계 | [`handoff/`](handoff/) | 세션 단위 인수인계 기록 |
| 작업 일지 | [`changelogs/work_log.md`](changelogs/work_log.md) | 누적 작업 기록 |

---

## 폴더 구조

```
docs/
├── README.md
├── context/       현재 상태 정본. 다른 문서는 여기를 링크로 가리킴
├── design/        디자인 시스템, 브랜드, 매핑, ADR
├── spec/          페이지 명세, 콘텐츠 모델, 검증 규약
├── ops/           빌드·배포, Git, 기각 목록
├── analysis/      측정·분석 기록
├── handoff/       세션 인수인계
└── changelogs/    누적 작업 일지
```

---

## 1. context/

| 문서 | 파일 | 설명 |
| --- | --- | --- |
| 현재 운영 상태 | [`CURRENT_STATE.md`](context/CURRENT_STATE.md) | 구현 상태, 실측 지표, 회귀 기준선, 열린 항목, 다음 착수 목록 |

---

## 2. design/

| 문서 | 파일 | 설명 |
| --- | --- | --- |
| 디자인 시스템 | [`DESIGN_SYSTEM.md`](design/DESIGN_SYSTEM.md) | 토큰 표, 두 레지스터, 컴포넌트 목록, 타이포, 모션 |
| 브랜드 기준 | [`BRAND.md`](design/BRAND.md) | 브랜드명, 로고, 색 역할, 보이스, 금지 표현 |
| 슬라이드 매핑 | [`DECK_TO_SITE_MAP.md`](design/DECK_TO_SITE_MAP.md) | 9장 대응표, 추출 파이프라인, 좌표 근거 |
| 아키텍처 결정 | [`ADR-0001-astro-static-marketing-site.md`](design/ADR-0001-astro-static-marketing-site.md) | Astro 채택 배경, 검토한 대안, 결과 |

---

## 3. spec/

| 문서 | 파일 | 설명 |
| --- | --- | --- |
| 페이지 명세 | [`PAGE_SPEC.md`](spec/PAGE_SPEC.md) | 페이지별 목적, 섹션, 카피 출처, 상태, 수용 기준 |
| 콘텐츠 모델 | [`CONTENT_MODEL.md`](spec/CONTENT_MODEL.md) | `site.ts` / `pricing.ts` 스키마, 수정 절차, 금지 |
| 검증·접근성 | [`QA_AND_A11Y.md`](spec/QA_AND_A11Y.md) | `npm run verify` 단계별 의미, 접근성 하한, 도구 |

---

## 4. ops/

| 문서 | 파일 | 설명 |
| --- | --- | --- |
| 빌드·배포 | [`BUILD_AND_DEPLOY.md`](ops/BUILD_AND_DEPLOY.md) | 로컬 실행, 빌드 산출물, 배포 대상, 도메인 전환 |
| Git 워크플로우 | [`GIT_WORKFLOW.md`](ops/GIT_WORKFLOW.md) | 브랜치 모델, 커밋 규칙, 훅, 병합 절차 |
| Orca 워커 운용 | [`ORCA_WORKERS.md`](ops/ORCA_WORKERS.md) | cmd 워커 기동 절차, 권한 사전 조건, 리뷰어 기동 |
| 기각·반복 금지 | [`DO_NOT_REPEAT.md`](ops/DO_NOT_REPEAT.md) | 실패한 접근, 금지 패턴, 환경 함정 |

---

## 5. handoff/ 및 changelogs/

| 문서 | 파일 | 설명 |
| --- | --- | --- |
| 최초 인수인계 | [`handoff/2026-09-23_bootstrap.md`](handoff/2026-09-23_bootstrap.md) | 저장소 구성과 1차 구현 인계 |
| 다음 과업 | [`handoff/2026-09-25_next.md`](handoff/2026-09-25_next.md) | 접수 안내 반영 이후, 3종 브라우저 비교 |
| 작업 일지 | [`changelogs/work_log.md`](changelogs/work_log.md) | 누적 기록 |

---

## 권장 독해 순서

1. [`AGENTS.md`](../AGENTS.md)
2. [`SKILLS.md`](../SKILLS.md) 의 작업 유형 매핑표
3. [`context/CURRENT_STATE.md`](context/CURRENT_STATE.md)
4. 작업에 해당하는 `design/`, `spec/`, `ops/` 문서 1개
5. [`ops/DO_NOT_REPEAT.md`](ops/DO_NOT_REPEAT.md)

---

_본 인덱스는 살아있는 문서입니다. 문서를 추가하면 이 표와 `SKILLS.md` 매핑표를 함께 갱신합니다._
