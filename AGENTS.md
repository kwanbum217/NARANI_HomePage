# narani_homepage — Agent Guidelines (정본)

> **작성일**: 2026-09-23
> **수정일**: 2026-09-23
> **버전**: v1.0.0
> 본 파일은 모든 AI 코딩 에이전트가 공유하는 **단일 진실 원천(Single Source of Truth)** 입니다.
> 규칙을 바꿀 때는 이 파일만 수정하고, 상세 절차는 `docs/` 의 해당 문서에 둡니다.

---

## 0. 에이전트 부트스트랩

작업을 시작하기 전에 다음을 순서대로 확인합니다.

1. 본 `AGENTS.md` 를 읽습니다.
2. [`docs/context/CURRENT_STATE.md`](docs/context/CURRENT_STATE.md) 에서 현재 상태와 열린 항목을 확인합니다.
3. 작업 유형에 맞는 문서 1개를 [`SKILLS.md`](SKILLS.md) 의 매핑표에서 고릅니다.
4. 작업을 마치면 `npm run verify` 를 실행하고 결과를 근거로 보고합니다.

전체 저장소를 먼저 탐색하지 않습니다. 위 4단계로 문맥을 좁힌 뒤 필요한 파일만 엽니다.

---

## 1. 프로젝트 개요

NARANI(회사소개)와 BIDBOX(공공조달 입찰 분석 서비스)의 **마케팅 홈페이지**입니다.
원본은 Google Slides 구성안 9장이며, 7개 페이지 정적 사이트로 옮겼습니다.

**이 저장소의 범위:**

| 포함 | 제외 |
| --- | --- |
| 회사소개, 서비스 소개, 요금 안내, 데모 신청, 문의 페이지 | 로그인, 결제 실행, 포인트 지급, 관리자 |
| 브랜드 토큰과 카피의 단일 소스 | 제품 데이터·ML·DB |

결제와 포인트는 제품 본체(`refac_bid_box`)가 담당합니다. 이 저장소는 **상태를 저장하지
않는 정적 사이트로 유지합니다.** 저장이 필요한 기능이 필요해지면 서버를 새로 만들지 말고
제품 본체로 위임합니다.

---

## 2. 기술 스택 (확정)

| 영역 | 기술 | 비고 |
| --- | --- | --- |
| 정적 사이트 | Astro 7 | 기본 클라이언트 JS 0. `output: static` |
| 스타일 | Tailwind CSS 4 | `@tailwindcss/vite`. **CDN 사용 금지** |
| 인터랙션 | Alpine.js 3 | 허용 지점은 아래 3개소뿐 |
| 콘텐츠 | TypeScript 데이터 모듈 | `src/data/` |
| 패키지 관리 | npm + `package-lock.json` | `npm ci` 로 재현 |

Alpine 을 쓰는 지점은 다음 3개로 제한합니다. 새 인터랙션은 사전 합의가 필요합니다.

1. 모바일 메뉴 토글 (`siteNav`)
2. 문의·데모 폼 상태 (`enquiryForm`)
3. 요금 주문 확인 다이얼로그

---

## 3. 코딩 규칙

1. **언어**: 대화 응답과 문서는 한국어 존댓말. 코드·변수명·속성명·환경변수명은 영어.
2. **이모지 금지**: 코드, 주석, 커밋 메시지, 문서 어디에도 쓰지 않습니다.
   `scripts/check-no-emoji.mjs` 가 기계로 검사합니다.
3. **경로**: 파일 참조는 항상 프로젝트 루트 기준 상대 경로로 적습니다.
4. **의존성**: 새 패키지 추가는 사전 합의 후 `package.json` 에 기록합니다.
   이 저장소는 의존성 수를 최소로 유지하는 것이 원칙입니다.
5. **주석**: 코드가 의도를 드러내면 주석을 달지 않습니다. 주석은 이유가 자명하지 않은
   곳에만 씁니다.
6. **컴포넌트**: 두 곳 이상에서 반복되는 마크업은 컴포넌트로 올립니다. 한 번만 쓰는
   마크업은 페이지에 둡니다.
7. **중괄호**: `.astro` 에서 `{` `}` 는 표현식으로 해석됩니다. CSS·JS 리터럴을 그대로
   넣을 때는 문자열 처리하거나 `set:html` 을 사용합니다.

---

## 4. 디자인 규칙

1. **토큰 단일 소스**: 색·간격·반경은 `src/styles/global.css` 의 `:root` 변수만 고칩니다.
   페이지에 하드코딩된 색상값을 새로 만들지 않습니다.
2. **두 레지스터**: 회사소개·허브는 라이트(`--nani-*`), BIDBOX 는 다크(`--bb-*`)입니다.
   한 페이지 안에서 두 레지스터를 섞지 않습니다.
3. **컴포넌트 클래스**: `.btn`, `.card`, `.field`, `.nav-link` 등 `global.css` 의 클래스를
   우선 사용합니다. Tailwind 유틸리티로 덮어쓸 때는 important 접미사를 씁니다
   (예: `p-6!`). Tailwind 4 에서 접두사 `!p-6` 는 무효입니다.
4. **색 대비**: 본문 텍스트는 배경 대비 4.5:1 이상을 유지합니다. 현재 실측값은
   [`docs/context/CURRENT_STATE.md`](docs/context/CURRENT_STATE.md) 에 있습니다.
5. **상태**: 새 컨트롤에는 hover, focus-visible, disabled, loading 을 함께 만듭니다.
   색만으로 상태를 전달하지 않습니다.
6. 상세 기준은 [`docs/design/DESIGN_SYSTEM.md`](docs/design/DESIGN_SYSTEM.md) 와
   [`docs/design/BRAND.md`](docs/design/BRAND.md) 를 따릅니다.

---

## 5. 커뮤니케이션 규칙

- 응답은 한국어 존댓말로 작성합니다.
- 설계 결정과 되돌리기 어려운 변경은 사전에 제안하고 합의 후 진행합니다.
- 파일 참조는 `경로:줄번호` 형식으로 적습니다.
- 완료 보고에는 **무엇을 검증했는지**와 **검증하지 못한 것**을 함께 적습니다.
  실행하지 않은 검증을 완료라고 표현하지 않습니다.

---

## 6. Git 규칙

본 저장소는 **1인 작업**입니다. 리뷰어가 없으므로 Pull Request 를 만들지 않습니다.

- `main` 에 곧바로 커밋하지 않습니다. 변경은 작업 브랜치에서 시작합니다.
  (최초 부트스트랩 커밋만 예외로 `main` 에 있습니다.)
- 병합은 `git merge --no-ff` 로 수행해 작업 단위를 이력에 남깁니다.
- 병합 전 필수: `npm run verify` 통과.
- 커밋 메시지: `type: subject` 형식이며 subject 는 한국어입니다.
  - type: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `ci`, `merge`
  - 예: `feat: 요금 페이지 포인트 구매 다이얼로그 추가`
  - `scripts/validate-commit-message.mjs` 가 기계로 검사합니다.
- 상세는 [`docs/ops/GIT_WORKFLOW.md`](docs/ops/GIT_WORKFLOW.md) 를 따릅니다.

---

## 7. 금지 행위 (절대)

1. 코드·주석·커밋 메시지·문서 내 이모지 사용
2. 영어로 대화 응답이나 문서 작성 (코드·변수명 제외)
3. 사전 합의 없는 패키지 추가
4. Tailwind CDN(`cdn.tailwindcss.com`) 사용. 프로덕션 빌드에서는 금지이며 경고가 발생합니다.
5. React 또는 다른 UI 프레임워크 도입 (근거는 ADR-0001)
6. 이 저장소에 서버 런타임·DB·인증 추가. 결제·포인트는 제품 본체로 위임합니다.
7. `main` 브랜치에서 직접 작업·커밋
8. Pull Request 생성 (1인 작업이므로 불필요)
9. `npm run verify` 없이 완료 선언
10. 검증하지 않은 수치나 판정을 문서에 기록
11. 이미 기각된 접근의 재시도. 목록은 [`docs/ops/DO_NOT_REPEAT.md`](docs/ops/DO_NOT_REPEAT.md)

---

## 8. 검증 규칙

코드 변경 후에는 다음을 실행하고, 통과하지 않으면 완료가 아닙니다.

```bash
npm run verify
```

검증 항목:

| 단계 | 내용 | 실패 기준 |
| --- | --- | --- |
| 빌드 | `astro build` | 빌드 오류 |
| 링크 무결성 | `dist/` 내 모든 `href`/`src` 실존 확인 | 깨진 참조 1건 이상 |
| 렌더 | 7개 페이지 WebKit 렌더, 콘솔 오류 수집 | 콘솔 오류 1건 이상 |
| 스타일 실측 | 배경색·대비·컴포넌트 치수 측정 | 기준선과 불일치 |
| 반응형·접근성 | 320px 오버플로우, 라벨 누락, 터치 타겟 | 문서 오버플로우 또는 라벨 누락 |
| 인터랙션 | 메뉴 토글, 폼 검증·전송, 요금 다이얼로그 | 기대 상태 불일치 |

`scripts/verify.sh` 는 macOS WebKit 을 사용하므로 macOS 또는 macOS 러너에서만 동작합니다.
CI 에서는 빌드와 링크 무결성만 검사합니다.

---

## 9. 문서화 표준

1. 마크다운 위계(`#`/`##`/`###`)를 지키고, 주요 섹션 사이에 구분선(`---`)을 둡니다.
2. 비교·설정·매핑은 **표**를 우선 사용합니다.
3. 아키텍처와 흐름은 **Mermaid** 로 그립니다. 노드 텍스트에 공백이나 특수문자가 있으면
   큰따옴표로 감싸고, 긴 텍스트는 `<br/>` 로 줄바꿈합니다.
4. 새 문서 상단에 `>` 인용 블록으로 작성일·버전·상태를 명시합니다.
5. 이모지를 쓰지 않습니다.
6. **수치를 여러 문서에 복사하지 않습니다.** 실측값과 판정의 정본은
   [`docs/context/CURRENT_STATE.md`](docs/context/CURRENT_STATE.md) 이며, 다른 문서는
   링크로 가리킵니다.

---

## 10. 스킬 인덱스

| 스킬명 | 경로 | 핵심 기능 |
| --- | --- | --- |
| `brand-refresh` | `.agents/skills/brand-refresh/` | 로고·색·카피를 단일 소스에서 일괄 갱신 |
| `page-authoring` | `.agents/skills/page-authoring/` | 새 페이지 추가 절차와 체크리스트 |
| `content-model` | `.agents/skills/content-model/` | `src/data/` 스키마 수정과 배선 |
| `a11y-audit` | `.agents/skills/a11y-audit/` | `npm run verify` 기반 접근성·반응형 감사와 수정 |
| `static-deploy` | `.agents/skills/static-deploy/` | `dist/` 배포와 도메인·캐시 설정 |
| `deck-to-site` | `.agents/skills/deck-to-site/` | Google Slides 구성안을 사이트로 옮기는 반복 절차 |
