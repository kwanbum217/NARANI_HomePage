# CURRENT_STATE — narani_homepage 운영 상태 정본

> **작성일**: 2026-09-23
> **수정일**: 2026-09-28
> **버전**: v1.3.0
> **상태**: Hallmark 재구성 적용 및 검증 통과. 8단계 게이트(타입 체크·폰트 서브셋 포함). 결제·폼 백엔드 미연결
> 본 문서가 **단일 진실 원천(SSOT)** 입니다. 실측값과 판정은 이 문서에만 적고,
> 다른 문서는 링크로 가리킵니다.

---

## 1. 구현 현황

| 항목 | 상태 | 근거 |
| --- | --- | --- |
| 페이지 7종 | 완료 | `src/pages/` |
| Hallmark 섹션 리듬 재구성 | 완료 | [`../design/HALLMARK_REDESIGN.md`](../design/HALLMARK_REDESIGN.md). 7개 라우트가 각기 다른 구조 |
| 디자인 토큰 | 완료 | `src/styles/global.css` `:root` 단일 소스 |
| 공통 컴포넌트 | 완료 | `src/components/{Logo,Header,Footer}.astro` |
| 콘텐츠 단일 소스 | 완료 | `src/data/site.ts`, `src/data/pricing.ts`, `src/data/enquiry.ts` |
| 문의·데모 접수 API | 본체에 없음 | `src/data/site.ts` 의 `enquiryEndpoint` (빈 값). 이 저장소에서 API 를 만들지 않습니다. 4장을 따릅니다 |
| 분석 도구 | 연결 | `src/data/site.ts` 의 `gaMeasurementId` = `G-R7CBGGMDFF`. 값이 있을 때만 GA4 태그가 삽입됩니다. 폼 전환 이벤트는 `src/scripts/app.js` 가 dataLayer 로 보냅니다. 데이터는 24~48시간 뒤부터 쌓입니다 |
| Tailwind 컴파일 전환 | 완료 | CDN 제거. 콘솔 경고 0 |
| 검증 파이프라인 | 완료 | `scripts/verify.sh`. 8단계 |
| 폰트 | self-host | `public/fonts/pretendard-variable-subset.woff2`. CDN 의존 제거, 요청 10건 → 1건, 비차단 로드. 재생성은 `scripts/build-font-subset.py`, 누락 검사는 `scripts/check-font-subset.swift` |
| 타입 체크 | 완료 | `npm run check` = `astro check`. `tsconfig.json` (strict) 기준. 29파일, 에러 0 |
| 게이트 기대값 파생 | 완료 | `scripts/audit/expected.mjs`. 정본에서 기대 문구를 파생해 `interact.swift` 가 주입 |
| CI 파이프라인 | 통과 | `.github/workflows/ci.yml`. 이모지 검사, 타입 체크, 빌드, 링크 무결성 |
| 원격 저장소 | 연결 | `origin` = `github.com/kwanbum217/NARANI_HomePage` |
| 정적 배포 | 미수행 | `dist/` 는 로컬 검증까지만 |
| 폼 백엔드 | 미연결 | `src/data/site.ts` 의 `enquiryEndpoint` 가 빈 값이라 900ms 지연 시뮬레이션. 문의·데모 접수 API 가 제품 본체(`refac_bid_box`)에 없으므로 이 저장소에서 만들지 않고 위임합니다 |
| 결제 연동 | 미연결 | 주문 확인 다이얼로그까지만 동작 |
| sitemap / robots / OG | 완료 | prerendered 엔드포인트(`src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts`)와 `public/og.svg`, `og.png`. 새 패키지 추가 없이 정적 생성 |
| 구조화 데이터 | 완료 | `src/layouts/BaseLayout.astro` 가 head 에 Organization·WebSite JSON-LD 를 출력 |
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
| `/404` | `src/pages/404.astro` | 없음 |

---

## 2. 환경

| 항목 | 값 |
| --- | --- |
| Node | v26.10.0 |
| npm | 12.1.0 |
| Astro | 7.3.4 |
| Tailwind CSS | 4.3.3 |
| Alpine.js | 3.17.4 |
| esbuild | 0.28.2 |
| 검증 도구 | macOS WebKit (WKWebView), Swift 6.4 |

Node 와 npm 은 2026-09-27 에 [`환경_버전_20260927.md`](../analysis/환경_버전_20260927.md)
실측으로 갱신했습니다. 그 외 항목은 같은 실측에서 일치를 확인했으며, WKWebView 상세 버전은
확인하지 않았습니다.

---

## 3. 회귀 기준선 (실측)

측정 조건: `npm run build` 산출물 `dist/` 를 `http://127.0.0.1:4322` 로 서빙,
WKWebView 에서 다음 뷰포트로 렌더. 스크린샷은 `.verify/` 에 생성.

| 페이지군 | 뷰포트 | body 배경 | body 텍스트 | 명도 대비 | JS 오류 |
| --- | --- | --- | --- | ---: | ---: |
| 라이트 (`/`, `/company/`) | 1440x1700~1900 | `rgb(250, 249, 247)` | `rgb(10, 31, 51)` | 15.88 | 0 |
| 다크 (BIDBOX 5종) | 1440x1700~1900 | `rgb(0, 0, 0)` | `rgb(242, 247, 250)` | 19.46 | 0 |

컴포넌트 실측:

| 측정 대상 | 실측값 | 의미 |
| --- | --- | --- |
| 데스크톱 내비 CTA 높이 | 44px | Tailwind 4 important 접미사(`min-h-[44px]!`)가 적용됨 |
| 허브 `main a.card` padding-top | `null` | 허브가 카드를 쓰지 않음(`/` 는 규칙으로 나눈 행) |
| `#plans li.card` 개수 | 0 | 요금이 가로 행으로 바뀜. `.card` 를 쓰지 않음 |
| 요금 다이얼로그 존재 | true | Alpine 이 다이얼로그를 제어 |

반응형·접근성 (320px, 7개 페이지 전부):

| 측정 대상 | 실측값 |
| --- | --- |
| `document.scrollWidth` | 303 (뷰포트 320 이하, 문서 오버플로우 없음) |
| 라벨 없는 입력 | 0 |
| 작은 터치 타겟(`nav` 안, 44px 미만) | 0건 |
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
Astro 이관 과정에서 시각 회귀가 없었음을 뜻합니다. 이후 Hallmark 재구성에서도 두
레지스터의 배경·텍스트 토큰을 바꾸지 않아 대비값은 그대로이고, 인터랙션 3종 값도
이전과 같습니다. 구조와 서체만 바뀌었습니다.

### Chrome 추가 실측

#### 본문 대비

측정 조건: [`크롬_대비_20260927.md`](../analysis/크롬_대비_20260927.md)의 조건을
따랐습니다. Google Chrome 154.0.8037.58을 `--headless=new`로 사용했으며, 빌드 커밋은
`ee2790e9a0adc4d1d5828e8b1c56b68e6852d92d`입니다. 뷰포트는 페이지별로
`1440x1700` 또는 `1440x1900`이며, 두 번 실행(run1, run2)이 같았습니다.
원시 JSON `/tmp/narani-chrome-contrast-20260927/run1.json` 과
`/tmp/narani-chrome-contrast-20260927/run2.json` 을
대조한 결과 문서의 모든 값과 일치했습니다.

| 페이지 | 뷰포트 | body 배경 | body 텍스트 | 명도 대비 | 콘솔 오류 | 콘솔 경고 |
| --- | --- | --- | --- | ---: | ---: | ---: |
| `/` | 1440x1700 | `rgb(250, 249, 247)` | `rgb(10, 31, 51)` | 15.88 | 0 | 0 |
| `/company/` | 1440x1900 | `rgb(250, 249, 247)` | `rgb(10, 31, 51)` | 15.88 | 0 | 0 |
| `/bidbox/` | 1440x1900 | `rgb(0, 0, 0)` | `rgb(242, 247, 250)` | 19.46 | 0 | 0 |
| `/bidbox/service/` | 1440x1900 | `rgb(0, 0, 0)` | `rgb(242, 247, 250)` | 19.46 | 0 | 0 |
| `/bidbox/pricing/` | 1440x1700 | `rgb(0, 0, 0)` | `rgb(242, 247, 250)` | 19.46 | 0 | 0 |
| `/bidbox/demo/` | 1440x1700 | `rgb(0, 0, 0)` | `rgb(242, 247, 250)` | 19.46 | 0 | 0 |
| `/bidbox/contact/` | 1440x1700 | `rgb(0, 0, 0)` | `rgb(242, 247, 250)` | 19.46 | 0 | 0 |
| `/404.html` | 1440x1700 | `rgb(250, 249, 247)` | `rgb(10, 31, 51)` | 15.88 | 0 | 0 |

#### CTA 및 컴포넌트 치수

측정 조건: [`크롬_치수_20260927.md`](../analysis/크롬_치수_20260927.md)의 조건을
따랐습니다. Google Chrome 154.0.8037.58을 `--headless=new`로 사용했으며, 빌드 커밋은
`ee2790e9a0adc4d1d5828e8b1c56b68e6852d92d`입니다. 뷰포트는 페이지별로
`1440x1700` 또는 `1440x1900`이며, 두 번 실행(run1, run2)이 모든 페이지와 항목에서
같았습니다. 원시 JSON `/tmp/narani-chrome-cta-20260927/run1.json` 과
`/tmp/narani-chrome-cta-20260927/run2.json` 을
대조한 결과 문서의 네 항목 모두와 일치했습니다.

| 측정 대상 | Chrome 실측값 |
| --- | --- |
| 데스크톱 내비 CTA 높이 | 44px (8개 페이지 모두) |
| 허브 `main a.card` padding-top | `null` (8개 페이지 모두) |
| `#plans li.card` 개수 | 0 (8개 페이지 모두) |
| 요금 다이얼로그 존재 | `/bidbox/pricing/`만 true, 나머지 7개 페이지 false |

#### 인터랙션

측정 조건: [`크롬_인터랙션_20260926.md`](../analysis/크롬_인터랙션_20260926.md)의
조건을 따랐습니다. Google Chrome 154.0.8037.58을 `--headless=new`로 사용했으며, 빌드
커밋은 `da1a34c`입니다. 모바일 메뉴는 `390x844`, 폼 검증과 요금 다이얼로그는
`1440x1700` 뷰포트에서 측정했고, 시나리오마다 두 번 실행하여 결과가 같았습니다.

| 시나리오 | 페이지와 뷰포트 | run1과 run2의 결과 |
| --- | --- | --- |
| 모바일 메뉴 토글 | `/company/`, 390x844 | 버거 버튼 존재 `true`; 초기 display `"none"`; 클릭 후 display `"block"`, `aria-expanded="true"`; 재클릭 후 display `"none"`, `aria-expanded="false"` |
| 폼 검증 | `/bidbox/contact/`, 1440x1700 | 평시 제출 버튼 비활성 여부 `false`; 빈 제출 시 오류 필드 3개; 첫 오류 문구 `"성함을 입력해 주세요."`; 오류 제출 뒤 사용 가능 `true`; 값 입력 뒤 오류 0개; 전송 중 라벨 `"전송 중…"`, `aria-busy="true"`; 성공 패널 `true` |
| 요금 다이얼로그 | `/bidbox/pricing/`, 1440x1700 | `#plans` 버튼 5개; 초기 열림 `false`; 두 번째 버튼 클릭 뒤 열림 `true`; 제목 `"500포인트 구매"`; 금액 `"₩450,000"`; 닫기 뒤 열림 `false` |

#### 스크롤바 원인

측정 조건: [`스크롤바_원인_20260926.md`](../analysis/스크롤바_원인_20260926.md)의
조건을 따랐습니다. Google Chrome 154.0.8037.58을 `--headless=new`로 사용했으며, 빌드
커밋은 `da1a34c`입니다. 뷰포트 폭은 1440이고 높이는 페이지군에 따라 1700 또는
1900이며, 원인 해석은 세로 스크롤이 있는 페이지에 한정했습니다. 두 번 실행했고 모든
값이 같았습니다.

| 페이지 | innerWidth | clientWidth | scrollWidth | 세로 스크롤바 폭 | scrollHeight | innerHeight | 세로 스크롤 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `/` | 1440 | 1440 | 1440 | 0 | 1700 | 1700 | 없음 |
| `/company/` | 1440 | 1440 | 1440 | 0 | 1900 | 1900 | 없음 |
| `/bidbox/` | 1440 | 1440 | 1440 | 0 | 1900 | 1900 | 없음 |
| `/bidbox/service/` | 1440 | 1425 | 1425 | 15 | 2104 | 1900 | 있음 |
| `/bidbox/pricing/` | 1440 | 1440 | 1440 | 0 | 1700 | 1700 | 없음 |
| `/bidbox/demo/` | 1440 | 1440 | 1440 | 0 | 1700 | 1700 | 없음 |
| `/bidbox/contact/` | 1440 | 1440 | 1440 | 0 | 1700 | 1700 | 없음 |
| `/404.html` | 1440 | 1440 | 1440 | 0 | 1700 | 1700 | 없음 |

위 조건의 헤드리스 Chrome에서 세로 스크롤이 있는 페이지는 `/bidbox/service/`뿐입니다.
`scrollHeight 2104`가 `innerHeight 1900`보다 커져 15px 세로 스크롤바가 생겼고,
그 결과 `clientWidth`와 `scrollWidth`가 1425가 되었습니다. 이 해석은 헤드리스 Chrome에서
세로 스크롤이 있는 페이지만 측정한 조건에 한정하며, 일반 창이나 다른 브라우저의 결과를
뜻하지 않습니다.

### Firefox 추가 실측

#### 본문 대비와 컴포넌트 치수

측정 조건: [`파이어폭스_대비치수_20260927.md`](../analysis/파이어폭스_대비치수_20260927.md)의
조건을 따랐습니다. Mozilla Firefox 156.0.1(buildID `20260921121718`)을 `--headless` 로
사용했으며, 빌드 커밋은 `ee2790e9a0adc4d1d5828e8b1c56b68e6852d92d`입니다. 뷰포트는
페이지별로 `1440x1700` 또는 `1440x1900`이며, 두 번 실행(run1, run2)이 같았습니다.
원시 JSON `/tmp/narani-firefox-metrics-20260927/run1.json` 과
`/tmp/narani-firefox-metrics-20260927/run2.json` 을
대조한 결과 문서의 모든 값과 일치했습니다. 이 값은 헤드리스 Firefox 조건에 한정하며,
일반 창 Firefox 나 다른 브라우저와 같다고 단정하지 않습니다.

| 페이지 | 뷰포트 | body 배경 | body 텍스트 | 명도 대비 | CTA 높이 (px) | 허브 카드 paddingTop | `#plans li.card` 개수 | `dialog` 존재 | 콘솔 오류 | 콘솔 경고 |
| --- | --- | --- | --- | ---: | ---: | --- | ---: | --- | ---: | ---: |
| `/` | 1440x1700 | `rgb(250, 249, 247)` | `rgb(10, 31, 51)` | 15.88 | 44 | `null` | 0 | false | 0 | 0 |
| `/company/` | 1440x1900 | `rgb(250, 249, 247)` | `rgb(10, 31, 51)` | 15.88 | 44 | `null` | 0 | false | 0 | 0 |
| `/bidbox/` | 1440x1900 | `rgb(0, 0, 0)` | `rgb(242, 247, 250)` | 19.46 | 44 | `null` | 0 | false | 0 | 0 |
| `/bidbox/service/` | 1440x1900 | `rgb(0, 0, 0)` | `rgb(242, 247, 250)` | 19.46 | 44 | `null` | 0 | false | 0 | 0 |
| `/bidbox/pricing/` | 1440x1700 | `rgb(0, 0, 0)` | `rgb(242, 247, 250)` | 19.46 | 44 | `null` | 0 | true | 0 | 0 |
| `/bidbox/demo/` | 1440x1700 | `rgb(0, 0, 0)` | `rgb(242, 247, 250)` | 19.46 | 44 | `null` | 0 | false | 0 | 0 |
| `/bidbox/contact/` | 1440x1700 | `rgb(0, 0, 0)` | `rgb(242, 247, 250)` | 19.46 | 44 | `null` | 0 | false | 0 | 0 |
| `/404.html` | 1440x1700 | `rgb(250, 249, 247)` | `rgb(10, 31, 51)` | 15.88 | 44 | `null` | 0 | false | 0 | 0 |

#### 인터랙션

측정 조건: [`파이어폭스_인터랙션_20260927.md`](../analysis/파이어폭스_인터랙션_20260927.md)의
조건을 따랐습니다. Mozilla Firefox 156.0.1(buildID `20260921121718`)을 `--headless` 로
사용했으며, 빌드 커밋은 `ee2790e9a0adc4d1d5828e8b1c56b68e6852d92d`입니다. 모바일 메뉴는
`390x844`, 폼 검증과 요금 다이얼로그는 `1440x1700` 뷰포트에서 측정했고, 시나리오마다 두 번
실행하여 결과가 같았습니다. 원시 JSON
`/tmp/narani-firefox-interaction-20260927/run1.json` 과
`/tmp/narani-firefox-interaction-20260927/run2.json` 을
대조한 결과 문서의 모든 값과 일치했습니다. 이 값은 헤드리스 Firefox 조건에 한정하며,
일반 창 Firefox 나 다른 브라우저와 같다고 단정하지 않습니다.

| 시나리오 | 페이지와 뷰포트 | run1과 run2의 결과 |
| --- | --- | --- |
| 모바일 메뉴 토글 | `/company/`, 390x844 | 버거 버튼 존재 `true`; 초기 숨김 `true`; 클릭 후 display `"block"`, `aria-expanded="true"`; 재클릭 후 display `"none"`, `aria-expanded="false"` |
| 폼 검증과 전송 | `/bidbox/contact/`, 1440x1700 | 평시 제출 버튼 비활성 여부 `false`; 빈 제출 시 오류 필드 3개; 첫 오류 문구 `"성함을 입력해 주세요."`; 오류 제출 뒤 사용 가능 `true`; 값 입력 뒤 오류 0개; 전송 중 라벨 `"전송 중…"`, `aria-busy="true"`; 성공 패널 `true` |
| 요금 다이얼로그 | `/bidbox/pricing/`, 1440x1700 | `#plans` 버튼 5개; 초기 열림 `false`; 두 번째 버튼 클릭 뒤 열림 `true`; 제목 `"500포인트 구매"`; 금액 `"₩450,000"`; 닫기 뒤 열림 `false` |

#### 320px 가로 넘침

측정 조건: [`파이어폭스_인터랙션_20260927.md`](../analysis/파이어폭스_인터랙션_20260927.md)의
320px 측정 조건을 따랐습니다. Mozilla Firefox 156.0.1(buildID `20260921121718`)을
`--headless` 로 사용했으며, 빌드 커밋은
`ee2790e9a0adc4d1d5828e8b1c56b68e6852d92d`입니다. 뷰포트는 8개 페이지 모두 `320x900`이며,
두 번 실행(run1, run2)이 같았습니다. 원시 JSON
`/tmp/narani-firefox-interaction-20260927/run1.json` 과
`/tmp/narani-firefox-interaction-20260927/run2.json` 을
대조한 결과 문서의 모든 값과 일치했습니다. 이 값은 헤드리스 Firefox 조건에 한정하며,
일반 창 Firefox 나 다른 브라우저와 같다고 단정하지 않습니다.

| 페이지 | scrollWidth | clientWidth | 가로 넘침 | 콘솔 오류 |
| --- | ---: | ---: | --- | ---: |
| `/` | 305 | 305 | 없음 | 0 |
| `/company/` | 305 | 305 | 없음 | 0 |
| `/bidbox/` | 305 | 305 | 없음 | 0 |
| `/bidbox/service/` | 305 | 305 | 없음 | 0 |
| `/bidbox/pricing/` | 305 | 305 | 없음 | 0 |
| `/bidbox/demo/` | 305 | 305 | 없음 | 0 |
| `/bidbox/contact/` | 305 | 305 | 없음 | 0 |
| `/404.html` | 320 | 320 | 없음 | 0 |

8페이지 모두 `scrollWidth` 가 `clientWidth` 보다 크지 않아 가로 넘침이 없습니다. 세로
스크롤바가 생기는 페이지는 `clientWidth` 가 305 이고, 세로 스크롤이 없어 본문이 전체
폭을 쓰는 `/404.html` 은 320 입니다. 이 305 와 320 의 차이는 헤드리스 Firefox 조건에서
세로 스크롤바 폭 차이로 생긴 값이며, 가로 넘침 판정(`scrollWidth > clientWidth`)과는
무관합니다.

---

## 4. 열린 항목

| 항목 | 영향 | 다음 행동 | 담당 |
| --- | --- | --- | --- |
| 문의·데모 접수 API 부재 | 폼이 실제로 아무것도 보내지 않음 | `refac_bid_box` 에 접수 API 를 만들고 `src/data/site.ts` 의 `enquiryEndpoint` 한 곳만 채웁니다. 2026-09-28에 본체 라우터(accounts·automation·bids·chatbot·evaluations·health·predictions)에 접수 엔드포인트가 없음을 확인했습니다 | 미정 |
| 테마 시각 미확정 | 라이트/다크 배분이 실제 구성안과 다를 수 있음 | 추출 세션에서 이미지를 볼 수 없어 픽셀 통계로 추론함. `npm run dev` 로 육안 확인 후 필요 시 레지스터 조정 | 담당자 확인 필요 |
| 결제 미연결 | 요금 페이지에서 구매 완결 불가 | 결제는 이 저장소가 아니라 제품 본체(`refac_bid_box`)의 PG 라우트로 이동시킴 | 미정 |
| 폼 백엔드 미연결 | 데모·문의 접수가 실제로 전달되지 않음 | 위 문의·데모 접수 API 항목과 같습니다 | 미정 |
| 배포 미수행 | 공개 URL 없음 | `dist/` 를 정적 호스팅에 업로드. `astro.config.mjs` 의 `site` 값을 실제 도메인으로 교체 | 미정 |

---

## 5. 다음 착수 목록 (우선순위)

1. 테마 육안 확정 (열린 항목)
2. `refac_bid_box` 에 문의·데모 접수 API 추가 후 `enquiryEndpoint` 연결
3. GA4 측정 ID 를 만들어 `gaMeasurementId` 에 넣기
4. 요금 결제를 제품 본체 라우트로 딥링크
5. 도메인 연결 및 첫 배포
6. 서비스 페이지 시각 자료 (2026-09-28에 사용자가 이번 회차에서는 보류를 결정)
7. 검증 게이트 검토 권고 5건 중 2·3·4·5번은 2026-09-28에 반영했습니다
   ([`../analysis/검토_요금순서통화_20260928.md`](../analysis/검토_요금순서통화_20260928.md),
   [`../analysis/검토_접수완료가시성_20260928.md`](../analysis/검토_접수완료가시성_20260928.md)).
   요금 순서 가정은 featured 파생으로 대체되어 조용한 통과 경로가 닫혔습니다.
   1번(라벨을 데이터 모듈로 모으기)은 현 구조가 검사 범위에서 정확해 이월했습니다.
   후속 권고 5건은 위 두 검토 문서 4장에 있습니다
   ([`../analysis/검토_체크기대값_파생_20260928.md`](../analysis/검토_체크기대값_파생_20260928.md) 4장)
8. `#plans` 구매 버튼 수는 `src/data/pricing.ts` 의 `plans` 개수와 같습니다.
   위 Chrome·Firefox 실측 절의 "버튼 5개"는 구 셀렉터가 다이얼로그 버튼까지 센 값이며
   그 시점 측정값입니다. 현재 게이트는 `plans` 개수와 비교합니다
9. 권고 1번(폼 카피를 데이터 모듈로)은 2026-09-28에 반영했습니다. `src/data/enquiry.ts`
   가 contact·demo 두 폼의 라벨과 오류 문구를 정의하고, `scripts/audit/expected.mjs` 가
   이 모듈을 직접 import 합니다. 이전의 정규식 파생 경로는 없어졌습니다. 기대값 문자열은
   이전과 동일해 3장 기준선과 일치합니다.
10. `npm run check` 편입은 2026-09-28에 반영했습니다. 게이트는 6단계에서 7단계로
   늘었고 1단계가 타입 체크입니다. 패키지 3개(`@astrojs/check`, `typescript`,
   `@types/node`)는 사용자가 승인과 함께 지정했습니다. GitHub Actions 실환경
   (ubuntu-latest, Node v22.23.2)에서 28파일 에러 0 을 확인했습니다.
11. 폼 variant 는 `x-data` 인라인 문자열이라 `astro check` 가 걸지 않습니다. 알 수 없는
   variant 조용히 contact 로 떨어지던 것을 2026-09-28에 콘솔 에러로 바꿨습니다. 데모
   페이지에 `'demmo'` 오타를 심어 게이트가 종료 코드 1 로 멈추는 것을 확인한 뒤 되돌렸습니다.
12. 고도화 1차(2026-09-28): 이메일을 `support@narani.my` 로 확정했습니다. `enquiryEndpoint` 와
   `gaMeasurementId` 를 `src/data/site.ts` 에 추가해 배선 지점을 만들었고(`G-R7CBGGMDFF` 로
   2026-09-28에 채움), 엔드포인트가 비어 있을 때 두 폼에 "전송되지 않습니다" 안내가
   자동으로 보이게 했습니다. 서비스 페이지 시각 자료는 이번 회차 보류로 결정했습니다.
   GA4 는 두 가지 gotcha 가 있어 `src/scripts/app.js` 에 주석으로 남겼습니다.
   첫째, 반드시 `gtag('event', ...)` 로 보내야 합니다. `dataLayer.push({event:...})` 로
   plain object 를 넣으면 gtag.js 가 그 항목을 무시합니다(콘솔 오류 없음, dataLayer 에만
   쌓입니다). gtag 는 같은 배열에 `arguments` 객체를 push 하고 그 형식만 인식합니다.
   둘째, consent 기본값 선언이 없으면 storage 가 denied 로 잡혀 커스텀 이벤트가
   버려집니다. `BaseLayout.astro` 가 `gtag('consent','default',...)` 를 gtag.js 보다
   먼저 내보내도록 했습니다. analytics_storage 만 granted 인 것은 이 사이트가
   광고 타깃팅을 하지 않는다는 사실과 일치합니다.
   실측: WKWebView(macOS, verify.sh 와 같은 엔진)에서 consent·js·config 3개가 순서대로
   dataLayer 에 들어가고 `_ga` 쿠키가 설정되는 것을 확인했습니다.
   headless Chrome 에서 커스텀 이벤트가 전송되지 않는 것은 gtag.js 의 이벤트 배치 전송
   주기(초기 페이지뷰 직후 약 10초) 때문입니다. 실사용 데이터는 GA4 Realtime 에서
   확인하는 것이 확실하며, 로컬 네트워크 탭만으로 판정하지 않습니다.
   전환 이벤트는 실제 접수된 경우에만 보냅니다. `enquiry_submit_simulated` 는
   2026-09-28에 삭제했습니다. 엔드포인트가 없을 때는 폼에도 "전송되지 않습니다"
   안내가 보이므로 가짜 전환을 남길 이유가 없고, 두 이벤트 혼재 시 전환율이
   실제보다 부풀려 보입니다. 엔드포인트 유무는 `enquiry_submit_start` 의
   `has_endpoint` 파라미터로 구분합니다.
   폰트 CDN 의존 제거도 2026-09-28에 끝냈습니다. Pretendard Variable 서브셋을
   `public/fonts/` 로 내려 jsDelivr 의존을 없앴고, `preload` 로 바꿔 렌더 블로킹을
   해제했습니다. 요청 10건이 1건으로 줄었고 용량은 58.9KB 에서 81.7KB 로 늘었습니다.
   늘어난 만큼 서버 왕복이 사라졌고 jsDelivr 장애 시 폰트 없이 뜨지 않게 됩니다.
   서브셋은 빌드가 그리는 문자만 담으므로, **새 한국어 카피를 추가할 때마다
   `python3 scripts/build-font-subset.py` 를 먼저 돌려야 합니다.** 6단계
   (`scripts/check-font-subset.swift`)가 서브셋 밖의 글자를 잡아 종료 코드 1 로
   멈춥니다. 이 폰트는 가중치 400~900 축을 유지하며 `--font-display`(한국 세리프)과
   `--font-body`(Pretendard) 역할 분리는 그대로입니다.
Chrome 인터랙션, 스크롤바 원인, 본문 대비, CTA 치수는 2026-09-27에 이 문서의 Chrome 추가 실측 절로 승격했다.
Firefox 본문 대비, 컴포넌트 치수, 인터랙션, 320px 가로 넘침은 2026-09-27에 이 문서의 Firefox 추가 실측 절로 승격했다.

---

## 6. 회귀 감지

기준선이 깨졌는지 확인하는 유일한 방법은 검증 도구 실행입니다.

```bash
npm run verify
```

`scripts/verify.sh` 는 다음 조건에서 실패합니다.

- `astro check` 타입 에러
- 빌드 실패
- self-host 폰트 서브셋에 빌드가 그리는 문자가 없음
- 깨진 참조 1건 이상
- 콘솔 오류가 발생한 페이지 1개 이상. `src/scripts/app.js` 는 알 수 없는 폼 variant 를
  콘솔 에러로 올리므로, 페이지에 오타가 있어도 게이트가 멈춥니다
- 320px 에서 문서 오버플로우 또는 라벨 누락
- 320px 에서 작은 터치 타겟이 있거나, h1 이 1개가 아니거나, html lang 이 ko 가 아니거나, 이미지 alt 가 빠진 경우
- 인터랙션 시나리오의 기대 상태 불일치
- 정본에서 기대 문구를 파생하지 못했거나, 주입할 기대값 파일을 읽지 못한 경우

인터랙션 체크가 비교하는 기대 문자열은 `scripts/audit/expected.mjs` 가 정본에서
파생해 `scripts/audit/interact.swift` 가 주입합니다. 파생 경로와 주입 경로는
[`../analysis/게이트_기대값_파생_20260928.md`](../analysis/게이트_기대값_파생_20260928.md) 와
[`../analysis/검토_체크기대값_파생_20260928.md`](../analysis/검토_체크기대값_파생_20260928.md) 에
적었습니다. 카피를 바꿀 때 체크 스크립트를 함께 고칠 필요가 없어졌습니다.

컴포넌트 치수와 배경색은 `scripts/audit/render.swift` 출력으로 확인합니다. 값이 위
3장과 다르면 회귀로 취급하고 원인을 찾습니다.

미검증 상태로 남은 항목은 4장의 열린 항목 표에만 적습니다.
