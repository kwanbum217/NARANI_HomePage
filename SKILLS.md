# narani_homepage AI Agent Skills & Context Index

> **작성일**: 2026-09-23
> **버전**: v1.0.0
> **용도**: 에이전트용 **선택형 프로젝트 컨텍스트 & 스킬 인덱스**입니다.
> 이 문서는 전체 저장소를 읽지 않고 필요한 문서만 고르기 위한 지도입니다.

---

## 1. 정본 문서

| 구분 | 문서 | 설명 |
| --- | --- | --- |
| 규칙 정본 | [`AGENTS.md`](AGENTS.md) | 모든 에이전트가 따르는 단일 진실 원천 |
| 상태 정본 | [`docs/context/CURRENT_STATE.md`](docs/context/CURRENT_STATE.md) | 구현 상태, 실측 지표, 열린 항목 |
| 기각 목록 | [`docs/ops/DO_NOT_REPEAT.md`](docs/ops/DO_NOT_REPEAT.md) | 이미 실패한 접근과 그 근거 |
| 문서 인덱스 | [`docs/README.md`](docs/README.md) | 전체 문서 목록 |

수치와 판정은 [`docs/context/CURRENT_STATE.md`](docs/context/CURRENT_STATE.md) 만 정본입니다.
다른 문서에 복사하지 않습니다.

---

## 2. 작업 유형별 참조 문서

| 작업 유형 | 참조 문서 |
| --- | --- |
| 브랜드 색·로고·카피 변경 | [`docs/design/BRAND.md`](docs/design/BRAND.md), `.agents/skills/brand-refresh/SKILL.md` |
| 토큰·컴포넌트 스타일 | [`docs/design/DESIGN_SYSTEM.md`](docs/design/DESIGN_SYSTEM.md) |
| 새 페이지 추가 | [`docs/spec/PAGE_SPEC.md`](docs/spec/PAGE_SPEC.md), `.agents/skills/page-authoring/SKILL.md` |
| 카피·데이터 수정 | [`docs/spec/CONTENT_MODEL.md`](docs/spec/CONTENT_MODEL.md) |
| 접근성·반응형 수정 | [`docs/spec/QA_AND_A11Y.md`](docs/spec/QA_AND_A11Y.md), `.agents/skills/a11y-audit/SKILL.md` |
| 빌드·배포 | [`docs/ops/BUILD_AND_DEPLOY.md`](docs/ops/BUILD_AND_DEPLOY.md) |
| 브랜치·커밋 | [`docs/ops/GIT_WORKFLOW.md`](docs/ops/GIT_WORKFLOW.md) |
| 슬라이드 원본 대조 | [`docs/design/DECK_TO_SITE_MAP.md`](docs/design/DECK_TO_SITE_MAP.md) |
| 기술 선택 근거 | [`docs/design/ADR-0001-astro-static-marketing-site.md`](docs/design/ADR-0001-astro-static-marketing-site.md) |
| 세션 인수인계 | [`docs/handoff/`](docs/handoff/) |
| 작업 일지 | [`docs/changelogs/work_log.md`](docs/changelogs/work_log.md) |

---

## 3. 프로젝트 성격과 완료 기준

이 저장소는 **회사의 대표 마케팅 사이트**입니다. 계속 커지고, 브랜드가 바뀔 때마다
여러 곳을 고쳐야 하는 것이 원래 문제였습니다. 따라서 판단 기준은 다음과 같습니다.

1. **단일 소스**: 브랜드·내비·푸터·연락처·요금은 한 곳에서만 정의합니다.
   페이지에 복제된 값을 발견하면 그것이 버그입니다.
2. **검증 우선**: 완료는 `npm run verify` 통과를 뜻합니다. 렌더 결과를 확인하지 않은
   변경은 완료가 아닙니다.
3. **의존성 최소**: 새 패키지는 사전 합의가 필요합니다. 정적 사이트에 서버가 필요해지면
   서버를 만들지 말고 제품 본체로 위임합니다.
4. **접근성 하한**: 대비, 라벨, 터치 타겟, 포커스는 협상 대상이 아닙니다.
5. **유지보수성**: 위 항목을 해치지 않는 선에서 구조를 단순하게 유지합니다.

미검증 항목을 완료로 표기하지 않습니다. [`docs/context/CURRENT_STATE.md`](docs/context/CURRENT_STATE.md)
의 열린 항목 표가 정본입니다.

---

## 4. 핵심 구조

| 경로 | 역할 |
| --- | --- |
| `src/pages/` | 7개 페이지. 라우트 생성의 유일한 위치 |
| `src/layouts/BaseLayout.astro` | head, canonical, OG, 헤더, 푸터, 스크립트 |
| `src/components/` | Logo, Header, Footer. 내비와 브랜드 마크의 단일 구현 |
| `src/data/site.ts` | 브랜드명, 이메일, 내비 2종, CTA, 핵심 기능 목록 |
| `src/data/pricing.ts` | 포인트 단가, 요금제 3종, 유의 문구 |
| `src/styles/global.css` | 디자인 토큰과 컴포넌트 클래스 |
| `src/scripts/app.js` | Alpine 컴포넌트 3종 |
| `scripts/verify.sh` | 빌드 + 링크 + 렌더 + 접근성 + 인터랙션 검증 |
| `scripts/audit/` | WebKit 기반 감사 도구 (macOS) |

비협상 원칙:

- **컴포넌트 단일화**: 로고와 내비는 `Logo.astro`, `Header.astro` 에만 존재합니다.
  페이지에 헤더 마크업을 복사하지 않습니다.
- **데이터 단일화**: 브랜드 문자열은 `src/data/site.ts`, 금액은 `src/data/pricing.ts`
  에만 존재합니다.
- **토큰 단일화**: 색상 리터럴은 `global.css` 의 `:root` 에만 존재합니다.
- **정적 유지**: 서버 상태를 도입하지 않습니다.

---

## 5. 문서화 및 포매팅 규칙

1. 설명은 한국어 존댓말. 코드·변수명은 영어.
2. 제목 위계 `#` / `##` / `###`, 주요 섹션 사이 구분선 `---`.
3. 비교·설정·매핑은 표 우선. 핵심은 굵게.
4. 아키텍처·흐름은 Mermaid. 노드 텍스트에 공백이 있으면 큰따옴표, 긴 문장은 `<br/>`.
5. 새 문서 상단에 `>` 블록으로 작성일·버전·상태 명시.
6. 이모지 사용 금지. `scripts/check-no-emoji.mjs` 가 검사합니다.

---

## 6. 스킬 인덱스

| 스킬명 | 경로 | 핵심 기능 |
| --- | --- | --- |
| `brand-refresh` | `.agents/skills/brand-refresh/` | 로고·색·회사명·연락처를 단일 소스에서 일괄 갱신하고 검증 |
| `page-authoring` | `.agents/skills/page-authoring/` | 새 페이지 추가. 레이아웃 선택, 내비 등록, 검증까지 |
| `content-model` | `.agents/skills/content-model/` | `src/data/` 스키마 변경과 페이지 배선 |
| `a11y-audit` | `.agents/skills/a11y-audit/` | 검증 도구 실행, 이슈 분류, 최소 수정 |
| `static-deploy` | `.agents/skills/static-deploy/` | `dist/` 배포, 도메인·캐시·헤더 설정 |
| `deck-to-site` | `.agents/skills/deck-to-site/` | Google Slides 구성안을 페이지로 옮기는 반복 절차 |

---

## 7. 세션 체크리스트

- [ ] `AGENTS.md` 확인
- [ ] `docs/context/CURRENT_STATE.md` 에서 열린 항목 확인
- [ ] 작업 유형에 맞는 문서 1개 선택
- [ ] 작업 전 `docs/ops/DO_NOT_REPEAT.md` 확인
- [ ] 변경 후 `npm run verify` 실행 및 결과 인용
- [ ] 문서에 수치를 복사했다면 `CURRENT_STATE.md` 로 되돌리기
