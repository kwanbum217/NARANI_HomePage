# narani_homepage 문서 인덱스

> **작성일**: 2026-09-23
> **수정일**: 2026-10-05
> **버전**: v1.4.0
> **상태**: 1차 구현 및 검증 완료. 결제·폼 백엔드 미연결. 2026-10-02 고도화 구현·머지·리뷰 완료
> v1.3.0 은 2026-10-02 인수인계(`2026-10-02_cta_faq_jsonld_review.md`)와
> changelogs 2026-10-02 행을 등재하고, 최신 회차 표시를 그 행으로 옮겼습니다.
> v1.4.0 은 2026-10-05 문서·코드 정합 검토 회차를 등재하고 최신 인수인계 표시를
> 그 문서로 옮겼습니다. 이번 회차는 상위 인덱스가 아니라 하위 색인(`analysis/README.md`)이
> 밀려 있던 것을 고쳤습니다.
> **적용 범위**: Google Slides 구성안 9장 → 8페이지 정적 사이트(404 포함)

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
| 결제 연동 계획 | [`ops/PAYMENT_ROUTE.md`](ops/PAYMENT_ROUTE.md) | 본체 결제 라우트 연결 계획. 본체 구현은 이 저장소 밖 |
| Git 워크플로우 | [`ops/GIT_WORKFLOW.md`](ops/GIT_WORKFLOW.md) | 브랜치, 커밋, 병합, 훅 |
| Orca 워커 운용 | [`ops/ORCA_WORKERS.md`](ops/ORCA_WORKERS.md) | cmd 주력 워커 기동·감시·회수, 명세 형식, 포트 규칙 |
| 인수인계 | [`handoff/`](handoff/) | 세션 단위 인수인계 기록 |
| 측정·분석 | [`analysis/`](analysis/) | 브라우저 실측, 성능, 검토 기록 |
| 작업 일지 | [`changelogs/work_log.md`](changelogs/work_log.md) | 누적 작업 기록 |

---

## 폴더 구조

```
docs/
├── README.md
├── context/       현재 상태 정본. 다른 문서는 여기를 링크로 가리킴
├── design/        디자인 시스템, 브랜드, 매핑, ADR
├── spec/          페이지 명세, 콘텐츠 모델, 검증 규약
├── ops/           빌드·배포, 결제 계획, Git, 워커, 기각 목록
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
| 접근성 터치 검토 | [`A11Y_TOUCH_REVIEW.md`](design/A11Y_TOUCH_REVIEW.md) | 접근성·터치 타겟 검토 |
| 오류 안내 표면 검토 | [`ERROR_GUIDANCE_REVIEW.md`](design/ERROR_GUIDANCE_REVIEW.md) | 로고·이메일 등 안내 표면 검토 |
| 폼 오류 검토 | [`FORM_ERROR_REVIEW.md`](design/FORM_ERROR_REVIEW.md) | 폼 오류 속성과 초점 이동 검토 |
| Hallmark 재구성 기준 | [`HALLMARK_REDESIGN.md`](design/HALLMARK_REDESIGN.md) | Hallmark 재구성 구현 기준 |
| Hallmark 재구성 검토 | [`HALLMARK_REVIEW.md`](design/HALLMARK_REVIEW.md) | Hallmark 재구성 검토 |
| head·noindex 검토 | [`HEAD_AND_NOINDEX_REVIEW.md`](design/HEAD_AND_NOINDEX_REVIEW.md) | head 메타와 noindex 검토 |
| 404 검토 | [`NOT_FOUND_REVIEW.md`](design/NOT_FOUND_REVIEW.md) | 404 페이지 검토 |
| 접수 안내 검토 | [`RECEIPT_REVIEW.md`](design/RECEIPT_REVIEW.md) | 문의 접수 표시 검토 |
| 검색 노출 검토 | [`SEO_REVIEW.md`](design/SEO_REVIEW.md) | SEO 메타 검토 |
| 구조화 데이터 검토 | [`STRUCTURED_DATA_REVIEW.md`](design/STRUCTURED_DATA_REVIEW.md) | JSON-LD 구조화 데이터 검토 |

---

## 3. spec/

| 문서 | 파일 | 설명 |
| --- | --- | --- |
| 페이지 명세 | [`PAGE_SPEC.md`](spec/PAGE_SPEC.md) | 페이지별 목적, 섹션, 카피 출처, 상태, 수용 기준 |
| 콘텐츠 모델 | [`CONTENT_MODEL.md`](spec/CONTENT_MODEL.md) | `site.ts` / `pricing.ts` / `enquiry.ts` 스키마, 수정 절차, 금지 |
| 검증·접근성 | [`QA_AND_A11Y.md`](spec/QA_AND_A11Y.md) | `npm run verify` 8단계별 의미, 접근성 하한, 도구 |

---

## 4. ops/

| 문서 | 파일 | 설명 |
| --- | --- | --- |
| 빌드·배포 | [`BUILD_AND_DEPLOY.md`](ops/BUILD_AND_DEPLOY.md) | 로컬 실행, 빌드 산출물, 배포 대상, 도메인 전환 |
| 결제 연동 계획 | [`PAYMENT_ROUTE.md`](ops/PAYMENT_ROUTE.md) | 본체 결제 라우트 계획. 미연결 상태의 근거 |
| Git 워크플로우 | [`GIT_WORKFLOW.md`](ops/GIT_WORKFLOW.md) | 브랜치 모델, 커밋 규칙, 훅, 병합 절차 |
| Orca 워커 운용 | [`ORCA_WORKERS.md`](ops/ORCA_WORKERS.md) | cmd 워커 기동 절차, 명세 형식(5장), 권한 사전 조건 |
| 기각·반복 금지 | [`DO_NOT_REPEAT.md`](ops/DO_NOT_REPEAT.md) | 실패한 접근, 금지 패턴, 환경 함정 |

---

## 5. analysis/

분석 기록 32건과 이 폴더의 색인 파일 1건이 표에 들어 있습니다. 날짜순으로 나열하고, 같은 날짜
안에서는 무엇을 실측했는지 한 줄로 씁니다.
개별 문서를 고르기 전에 이 표에서 고릅니다.

| 날짜 | 문서 | 내용 |
| --- | --- | --- |
| 2026-09-23 | [`analysis/README.md`](analysis/README.md) | 측정 문서 규약, 표기 기준 |
| 2026-09-25 | [`번들_20260925.md`](analysis/번들_20260925.md) | 번들·요청 용량, 폰트가 용량 75%인 근거 |
| 2026-09-25 | [`브라우저_렌더_비교_20260925.md`](analysis/브라우저_렌더_비교_20260925.md) | 3종 브라우저 렌더 비교 |
| 2026-09-26 | [`크롬_인터랙션_20260926.md`](analysis/크롬_인터랙션_20260926.md) | Chrome 인터랙션 3종, 스크롤바 측정 |
| 2026-09-26 | [`스크롤바_원인_20260926.md`](analysis/스크롤바_원인_20260926.md) | 스크롤바 발생 원인 추적 |
| 2026-09-26 | [`검토_권고_20260926.md`](analysis/검토_권고_20260926.md) | 리뷰 권고 적합 판정 |
| 2026-09-26 | [`정합_검토_20260926.md`](analysis/정합_검토_20260926.md) | 문서 간 정합성 검토 |
| 2026-09-26 | [`사실대조_20260926.md`](analysis/사실대조_20260926.md) | 원시 JSON 대조, 인용 정합 |
| 2026-09-27 | [`크롬_대비_20260927.md`](analysis/크롬_대비_20260927.md) | Chrome 대비 |
| 2026-09-27 | [`크롬_치수_20260927.md`](analysis/크롬_치수_20260927.md) | Chrome 치수 실측 |
| 2026-09-27 | [`검토_대비치수_20260927.md`](analysis/검토_대비치수_20260927.md) | 대비·치수 검토 권고 |
| 2026-09-27 | [`파이어폭스_대비치수_20260927.md`](analysis/파이어폭스_대비치수_20260927.md) | Firefox 대비·치수 |
| 2026-09-27 | [`파이어폭스_인터랙션_20260927.md`](analysis/파이어폭스_인터랙션_20260927.md) | Firefox 인터랙션 |
| 2026-09-27 | [`검토_승격_파이어폭스_20260927.md`](analysis/검토_승격_파이어폭스_20260927.md) | Firefox 실측 정본 승격 검토 |
| 2026-09-27 | [`검토_파이어폭스승격_환경_20260927.md`](analysis/검토_파이어폭스승격_환경_20260927.md) | 승격 범위·환경 검토 |
| 2026-09-27 | [`환경_버전_20260927.md`](analysis/환경_버전_20260927.md) | 브라우저·런타임 버전 |
| 2026-09-27 | [`게이트_음성_20260927.md`](analysis/게이트_음성_20260927.md) | 게이트 기대값 정본화 검토 |
| 2026-09-27 | [`검토_검증게이트_20260927.md`](analysis/검토_검증게이트_20260927.md) | 검증 게이트 권고 |
| 2026-09-28 | [`게이트_기대값_파생_20260928.md`](analysis/게이트_기대값_파생_20260928.md) | 기대값 파생 원리 |
| 2026-09-28 | [`검토_체크기대값_파생_20260928.md`](analysis/검토_체크기대값_파생_20260928.md) | 기대값 파생 검토 |
| 2026-09-28 | [`검토_요금순서통화_20260928.md`](analysis/검토_요금순서통화_20260928.md) | 요금 표기·통화 검토 |
| 2026-09-28 | [`검토_접수완료가시성_20260928.md`](analysis/검토_접수완료가시성_20260928.md) | 접수 완료 가시성 검토 |
| 2026-09-28 | [`고도화_후보_20260928.md`](analysis/고도화_후보_20260928.md) | **고도화 3건 실측과 구현 결과.** 전후 전환 경로, 폰트 29KB 절감 |
| 2026-09-29 | [`검토_문서정합_20260929.md`](analysis/검토_문서정합_20260929.md) | 디자인 시스템과 인수인계 정합 검토 |
| 2026-09-29 | [`검토_배포문서_20260929.md`](analysis/검토_배포문서_20260929.md) | 배포 문서 검토 |
| 2026-09-29 | [`검토_색인정합_20260929.md`](analysis/검토_색인정합_20260929.md) | design·analysis 색인 누락 검토 |
| 2026-09-29 | [`검토_경위문서_20260929.md`](analysis/검토_경위문서_20260929.md) | 리뷰 권고 반영과 커밋 경위 서술 검토 |
| 2026-10-02 | [`고도화_실행_W1_20261002.md`](analysis/고도화_실행_W1_20261002.md) | W1 실행 기록. CTA 라벨 정직화와 BIDBOX JSON-LD |
| 2026-10-02 | [`고도화_실행_W2_20261002.md`](analysis/고도화_실행_W2_20261002.md) | W2 실행 기록. FAQ 데이터 모듈과 두 페이지 섹션 |
| 2026-10-02 | [`검토_고도화_W1W2_20261002.md`](analysis/검토_고도화_W1W2_20261002.md) | **W1·W2 리뷰.** 결함 4건과 게이트 사각지 |
| 2026-10-02 | [`고도화_단일소스_W3_20261002.md`](analysis/고도화_단일소스_W3_20261002.md) | W3 실행 기록. FAQ 답변의 정본 참조로 전환 |
| 2026-10-02 | [`고도화_카피정정_W4_20261002.md`](analysis/고도화_카피정정_W4_20261002.md) | W4 실행 기록. 다이얼로그 카피 정정 |
| 2026-10-02 | [`고도화_게이트추가_W5_20261002.md`](analysis/고도화_게이트추가_W5_20261002.md) | W5 실행 기록. 구조화 데이터·카피 정합 검사 추가 |

---

## 6. handoff/

| 날짜 | 파일 | 내용 |
| --- | --- | --- |
| 2026-09-23 | [`handoff/2026-09-23_bootstrap.md`](handoff/2026-09-23_bootstrap.md) | 저장소 구성과 1차 구현 인계 |
| 2026-09-25 | [`handoff/2026-09-25_next.md`](handoff/2026-09-25_next.md) | 접수 안내 반영 이후 3종 브라우저 비교 |
| 2026-09-25 | [`handoff/2026-09-25_browser_compare.md`](handoff/2026-09-25_browser_compare.md) | Chrome 과 WebKit 렌더 비교 |
| 2026-09-26 | [`handoff/2026-09-26_chrome_followup.md`](handoff/2026-09-26_chrome_followup.md) | 인터랙션 3종과 스크롤바 원인 |
| 2026-09-27 | [`handoff/2026-09-27_chrome_contrast_cta.md`](handoff/2026-09-27_chrome_contrast_cta.md) | Chrome 대비와 CTA 치수 |
| 2026-09-27 | [`handoff/2026-09-27_gate_and_promotion.md`](handoff/2026-09-27_gate_and_promotion.md) | 정본 승격, Firefox 측정, 검증 게이트 |
| 2026-09-28 | [`handoff/2026-09-28_gate_recommendations.md`](handoff/2026-09-28_gate_recommendations.md) | 게이트 권고와 인수인계 |
| 2026-09-28 | [`handoff/2026-09-28_expected_gate_and_review.md`](handoff/2026-09-28_expected_gate_and_review.md) | 기대값 게이트와 검토 |
| 2026-09-29 | [`handoff/2026-09-29_queue.md`](handoff/2026-09-29_queue.md) | 시각 자료 완료와 남은 사람 결정 |
| 2026-09-29 | [`handoff/2026-09-29_docs_and_form_a11y.md`](handoff/2026-09-29_docs_and_form_a11y.md) | 색인 복구와 폼 접근성, 리뷰어 운용 |
| 2026-09-30 | [`handoff/2026-09-30_kilo_icon_and_gate_sync.md`](handoff/2026-09-30_kilo_icon_and_gate_sync.md) | kilo 리뷰어 좌측 아이콘 진단, AGENTS.md 게이트 정합 |
| 2026-10-02 | [`handoff/2026-10-02_cta_faq_jsonld_review.md`](handoff/2026-10-02_cta_faq_jsonld_review.md) | CTA 라벨 정직화, FAQ 모듈과 섹션, BIDBOX JSON-LD, 리뷰와 결함 이월 |
| 2026-10-02 | [`handoff/2026-10-02_review_findings_fixed.md`](handoff/2026-10-02_review_findings_fixed.md) | 리뷰 결함 3건 처리, 게이트에 카피 정합·구조화 데이터 검사 추가 |
| 2026-10-05 | [`handoff/2026-10-05_docs_code_consistency_audit.md`](handoff/2026-10-05_docs_code_consistency_audit.md) | **현재 인수인계.** 문서 12건 정정, 이모지 검사 범위 확장, CI 에 정적 검사 2종 추가. AGENTS.md 2건은 위임 대기 |

---

## 7. changelogs/

| 날짜 | 내용 |
| --- | --- |
| 2026-10-05 | 문서·코드 정합 검토. 상태 정본 5건 정정, 스킬 링크 13건·분석 색인 6건, 이모지 검사 범위 확장, CI 에 정적 검사 2종 |
| 2026-10-02 | 리뷰 결함 3건 처리. FAQ 단일 소스 배선, 다이얼로그 카피 정정, 게이트 검사 2종 추가 |
| 2026-10-02 | CTA 라벨 정직화, FAQ 데이터 모듈과 두 페이지 섹션, BIDBOX 전용 JSON-LD, JSON-LD 용어 정정 |
| 2026-09-30 | 문서 정합과 워커 운용 규칙 |
| 2026-09-29 | 서비스 페이지 기능 행 아이콘 표시 |
| 2026-09-23 | 저장소 최초 구성 및 1차 구현 |
| 2026-09-23 | 원격 연결과 CI 구성 |
| 2026-09-28 | 검증 게이트 고도화와 상태 정본 구조 정리 |

`docs/changelogs/` 폴더는 `work_log.md` 한 파일입니다. 위 표는 그 파일의
`## ` 장 제목에서 날짜와 제목을 뽑은 것이고, 세부는 `work_log.md` 를
보십시오.

새 세션은 [`context/CURRENT_STATE.md`](context/CURRENT_STATE.md) 5장 열린 항목에서
읽고 시작하십시오. 이 인덱스에는 세션 진행 상황이 없습니다.

---

## 권장 독해 순서

1. [`AGENTS.md`](../AGENTS.md)
2. [`SKILLS.md`](../SKILLS.md) 의 작업 유형 매핑표
3. [`context/CURRENT_STATE.md`](context/CURRENT_STATE.md)
4. 작업에 해당하는 `design/`, `spec/`, `ops/` 문서 1개
5. [`ops/DO_NOT_REPEAT.md`](ops/DO_NOT_REPEAT.md)

---

_본 인덱스는 살아있는 문서입니다. 문서를 추가하면 이 표와 `SKILLS.md` 매핑표를 함께 갱신합니다._
