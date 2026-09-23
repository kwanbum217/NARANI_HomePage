# CURRENT_STATE — narani_homepage 운영 상태 정본

> **작성일**: 2026-09-23
> **수정일**: 2026-09-23
> **버전**: v1.0.0
> **상태**: 1차 구현 및 검증 완료. 결제·폼 백엔드 미연결
> 본 문서가 **단일 진실 원천(SSOT)** 입니다. 실측값과 판정은 이 문서에만 적고,
> 다른 문서는 링크로 가리킵니다.

---

## 1. 구현 현황

| 항목 | 상태 | 근거 |
| --- | --- | --- |
| 페이지 7종 | 완료 | `src/pages/` |
| 디자인 토큰 | 완료 | `src/styles/global.css` `:root` |
| 공통 컴포넌트 | 완료 | `src/components/{Logo,Header,Footer}.astro` |
| 콘텐츠 단일 소스 | 완료 | `src/data/site.ts`, `src/data/pricing.ts` |
| Tailwind 컴파일 전환 | 완료 | CDN 제거. 콘솔 경고 0 |
| 검증 파이프라인 | 완료 | `scripts/verify.sh` |
| CI 파이프라인 | 통과 | `.github/workflows/ci.yml`. 빌드, 링크 무결성, 이모지 검사 |
| 원격 저장소 | 연결 | `origin` = `github.com/kwanbum217/NARANI_HomePage` |
| 정적 배포 | 미수행 | `dist/` 는 로컬 검증까지만 |
| 폼 백엔드 | 미연결 | `enquiryForm` 이 900ms 지연 시뮬레이션 |
| 결제 연동 | 미연결 | 주문 확인 다이얼로그까지만 동작 |
| sitemap / robots / OG 이미지 | 미추가 | Astro 통합으로 추가 예정 |
| 다국어 | 미착수 | 한국어 단일 |

### 페이지 라우트

| 라우트 | 소스 | 클라이언트 JS |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | 없음 |
| `/company/` | `src/pages/company/index.astro` | Alpine (모바일 메뉴) |
| `/bidbox/` | `src/pages/bidbox/index.astro` | Alpine (모바일 메뉴) |
| `/bidbox/service/` | `src/pages/bidbox/service.astro` | Alpine (모바일 메뉴) |
| `/bidbox/pricing/` | `src/pages/bidbox/pricing.astro` | Alpine (메뉴 + 주문 다이얼로그) |
| `/bidbox/demo/` | `src/pages/bidbox/demo.astro` | Alpine (메뉴 + 폼 상태) |
| `/bidbox/contact/` | `src/pages/bidbox/contact.astro` | Alpine (메뉴 + 폼 상태) |

---

## 2. 환경

| 항목 | 값 |
| --- | --- |
| Node | v26.9.0 |
| npm | 12.0.2 |
| Astro | 7.3.4 |
| Tailwind CSS | 4.3.3 |
| Alpine.js | 3.17.4 |
| esbuild | 0.28.2 |
| 검증 도구 | macOS WebKit (WKWebView), Swift 6.4 |

---

## 3. 회귀 기준선 (실측)

측정 조건: `npm run build` 산출물 `dist/` 를 `http://127.0.0.1:4322` 로 서빙,
WKWebView 에서 다음 뷰포트로 렌더. 스크린샷은 `.verify/` 에 생성.

| 페이지군 | 뷰포트 | body 배경 | body 텍스트 | 명도 대비 | JS 오류 |
| --- | --- | --- | --- | ---: | ---: |
| 라이트 (`/`, `/company/`) | 1440x1700~1900 | `rgb(250, 249, 247)` | `rgb(10, 31, 51)` | 15.88 | 0 |
| 다크 (BIDBOX 5종) | 1440x1700~1900 | `rgb(0, 0, 0)` | `rgb(242, 247, 250)` | 19.46 | 0 |

컴포넌트 실측:

| 측정 대상 | 기대값 | 의미 |
| --- | --- | --- |
| 데스크톱 내비 CTA 높이 | 44px | Tailwind 4 important 접미사(`min-h-[44px]!`)가 적용됨 |
| 허브 카드 padding-top | 0px | `p-0!` 가 `.card` 기본 패딩을 덮음 |
| 요금 카드 개수 | 3 | `src/data/pricing.ts` 에서 빌드 타임 렌더 |
| 요금 다이얼로그 존재 | true | Alpine 이 다이얼로그를 제어 |

반응형·접근성 (320px, 7개 페이지 전부):

| 측정 대상 | 기대값 |
| --- | --- |
| `document.scrollWidth` | 303 (뷰포트 320 이하, 문서 오버플로우 없음) |
| 라벨 없는 입력 | 0 |
| `h1` 개수 | 1 |
| `html lang` | `ko` |
| 이미지 `alt` 누락 | 0 |

인터랙션 (실측 결과):

| 시나리오 | 결과 |
| --- | --- |
| 모바일 메뉴 토글 (`/company/` 390px) | 열면 `display:block` + `aria-expanded=true`, 닫으면 `display:none` + `false` |
| 폼 검증 (`/bidbox/contact/`) | 빈 제출 시 3개 필드 오류, 입력 시 오류 해제, 전송 라벨 전환, 성공 패널 표시 |
| 요금 다이얼로그 (`/bidbox/pricing/` 1440px) | 열림, 제목 `500포인트 구매`, 금액 `₩450,000`, 닫힘 |

정적 HTML 버전(마이그레이션 이전)과 라이트/다크 대비값이 **완전히 동일**합니다.
Astro 이관 과정에서 시각 회귀가 없었음을 뜻합니다.

---

## 4. 열린 항목

| 항목 | 영향 | 다음 행동 | 담당 |
| --- | --- | --- | --- |
| 연락처 이메일 오타 의심 | 문의가 도달하지 않음 | 원본 구성안은 `surport@narani.my` 표기. `support@` 여부 확인 후 `src/data/site.ts` 한 곳만 수정 | 담당자 확인 필요 |
| 테마 시각 미확정 | 라이트/다크 배분이 실제 구성안과 다를 수 있음 | 추출 세션에서 이미지를 볼 수 없어 픽셀 통계로 추론함. `npm run dev` 로 육안 확인 후 필요 시 레지스터 조정 | 담당자 확인 필요 |
| 결제 미연결 | 요금 페이지에서 구매 완결 불가 | 결제는 이 저장소가 아니라 제품 본체(`refac_bid_box`)의 PG 라우트로 이동시킴 | 미정 |
| 폼 백엔드 미연결 | 데모·문의 접수가 실제로 전달되지 않음 | 폼 서비스 또는 제품 본체 엔드포인트 결정 후 `enquiryForm(endpoint)` 에 주입 | 미정 |
| sitemap / robots / OG | 검색 노출과 공유 카드 없음 | Astro sitemap 통합과 OG 이미지 추가 | 미정 |
| 배포 미수행 | 공개 URL 없음 | `dist/` 를 정적 호스팅에 업로드. `astro.config.mjs` 의 `site` 값을 실제 도메인으로 교체 | 미정 |

---

## 5. 다음 착수 목록 (우선순위)

1. `git init` 완료분에 대한 원격 푸시 확인, 이후 작업은 브랜치 → `main` 병합
2. 테마 육안 확정 (열린 항목 2번)
3. 이메일 표기 확정 (열린 항목 1번)
4. 폼 엔드포인트 연결
5. 요금 결제를 제품 본체 라우트로 딥링크
6. sitemap / robots / OG 이미지
7. 도메인 연결 및 첫 배포

---

## 6. 회귀 감지

기준선이 깨졌는지 확인하는 유일한 방법은 검증 도구 실행입니다.

```bash
npm run verify
```

`scripts/verify.sh` 는 다음 조건에서 실패합니다.

- 빌드 실패
- 깨진 참조 1건 이상
- 콘솔 오류가 발생한 페이지 1개 이상
- 320px 에서 문서 오버플로우 또는 라벨 누락
- 인터랙션 시나리오의 기대 상태 불일치

컴포넌트 치수와 배경색은 `scripts/audit/render.swift` 출력으로 확인합니다. 값이 위
3장과 다르면 회귀로 취급하고 원인을 찾습니다.

미검증 상태로 남은 항목은 4장의 열린 항목 표에만 적습니다.
