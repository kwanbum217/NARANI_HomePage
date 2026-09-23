# narani_homepage

NARANI(회사소개)와 BIDBOX(공공조달 입찰 분석 서비스)의 **마케팅 홈페이지**입니다.
원본은 Google Slides 구성안(`홈페이지 구성안`, 9장)이며, 이를 7개 페이지의 정적
사이트로 옮겼습니다.

> **작성일**: 2026-09-23
> **버전**: v1.0.0
> **상태**: 1차 구현 완료 / 결제·폼 백엔드 미연결

---

## 상태

| 항목 | 상태 | 근거 |
| --- | --- | --- |
| 7개 페이지 구현 | 완료 | `src/pages/` |
| 디자인 시스템 | 완료 | [`docs/design/DESIGN_SYSTEM.md`](docs/design/DESIGN_SYSTEM.md) |
| 빌드·검증 파이프라인 | 완료 | [`docs/ops/BUILD_AND_DEPLOY.md`](docs/ops/BUILD_AND_DEPLOY.md) |
| 접근성·반응형 | 통과 | [`docs/spec/QA_AND_A11Y.md`](docs/spec/QA_AND_A11Y.md) |
| 폼 백엔드 | 미연결 | `src/scripts/app.js` 의 `enquiryForm` 이 시뮬레이션 |
| 결제 연동 | 미연결 | 요금 페이지는 주문 확인 다이얼로그까지만 |
| 테마 시각 확정 | 미확인 | 라이트/다크 구분은 픽셀 통계 기반 추론 |
| sitemap / robots / OG 이미지 | 미추가 | Astro 통합으로 추가 예정 |

실측 지표와 회귀 기준선은 [`docs/context/CURRENT_STATE.md`](docs/context/CURRENT_STATE.md) 가
정본입니다. 이 README 에 수치를 복사하지 않습니다.

---

## 빠른 시작

```bash
npm install
npm run dev        # 개발 서버
npm run build      # dist/ 생성
npm run preview    # 빌드 결과 미리보기
npm run verify     # 빌드 + 링크/렌더/접근성/인터랙션 검증 (macOS)
```

`npm run verify` 는 실패 시 종료 코드 1 을 반환합니다. 검증 항목은
[`docs/spec/QA_AND_A11Y.md`](docs/spec/QA_AND_A11Y.md) 를 참조하십시오.

---

## 기술 스택 (확정)

| 영역 | 기술 | 비고 |
| --- | --- | --- |
| 정적 사이트 | Astro 7 | 기본 클라이언트 JS 0. 출력은 순수 정적 HTML |
| 스타일 | Tailwind CSS 4 | `@tailwindcss/vite` 로 컴파일. CDN 사용 금지 |
| 인터랙션 | Alpine.js 3 | 모바일 메뉴, 폼 상태, 요금 다이얼로그 3개소만 |
| 콘텐츠 | TypeScript 데이터 모듈 | `src/data/site.ts`, `src/data/pricing.ts` |
| 배포 | 정적 호스팅 | `dist/` 를 Cloudflare Pages / Netlify / S3 에 업로드 |

React 와 서버 런타임을 두지 않는 이유는
[`docs/design/ADR-0001-astro-static-marketing-site.md`](docs/design/ADR-0001-astro-static-marketing-site.md)
를 참조하십시오.

---

## 페이지 구성

| 경로 | 소스 | 원본 슬라이드 |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | 접속페이지 |
| `/company/` | `src/pages/company/index.astro` | 회사소개 1·2 |
| `/bidbox/` | `src/pages/bidbox/index.astro` | BIDBOX1 |
| `/bidbox/service/` | `src/pages/bidbox/service.astro` | BIDBOX2·3 |
| `/bidbox/pricing/` | `src/pages/bidbox/pricing.astro` | BIDBOX4 |
| `/bidbox/demo/` | `src/pages/bidbox/demo.astro` | BIDBOX5 |
| `/bidbox/contact/` | `src/pages/bidbox/contact.astro` | BIDBOX6 |

슬라이드에서 페이지로 옮긴 근거와 추출 방법은
[`docs/design/DECK_TO_SITE_MAP.md`](docs/design/DECK_TO_SITE_MAP.md) 에 기록했습니다.

---

## 저장소 구조

```
.
├── AGENTS.md                  모든 AI 에이전트 공용 규칙 (단일 진실 원천)
├── SKILLS.md                  작업 유형별 참조 문서 매핑
├── README.md
├── Makefile
├── astro.config.mjs
├── .agents/skills/            재사용 작업 절차
├── .github/workflows/         CI
├── docs/                      설계·명세·운영·이력 문서
├── scripts/                   검증 도구
└── src/
    ├── components/            Logo, Header, Footer
    ├── data/                  브랜드·요금 단일 소스
    ├── layouts/BaseLayout.astro
    ├── pages/                 7개 페이지
    ├── scripts/app.js         Alpine 컴포넌트
    └── styles/global.css      디자인 토큰 + 컴포넌트 CSS
```

---

## 문서

| 문서 | 설명 |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | 에이전트 규칙 정본. 작업 전 필독 |
| [`SKILLS.md`](SKILLS.md) | 작업 유형별 참조 문서 매핑 |
| [`docs/README.md`](docs/README.md) | 문서 전체 인덱스 |
| [`docs/context/CURRENT_STATE.md`](docs/context/CURRENT_STATE.md) | 현재 구현 상태와 검증 기준선 |

---

## 관련 저장소

- `refac_bid_box` — BIDBOX 제품 본체 (FastAPI + MySQL + ML). 결제·포인트·로그인은
  이 저장소가 아니라 제품 본체가 담당합니다.
