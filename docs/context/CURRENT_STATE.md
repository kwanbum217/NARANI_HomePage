# CURRENT_STATE — narani_homepage 운영 상태 정본

> **작성일**: 2026-09-23
> **수정일**: 2026-10-05
> **버전**: v1.6.1
> **상태**: 2026-10-02 리뷰 결함 3건까지 처리 완료. 8단계 게이트에 카피 정합과
> 구조화 데이터 검사를 추가함. 결제·폼 백엔드 미연결.
> 2026-10-05 문서·코드 정합 검토에서 실측값이 뒤처진 항목을 갱신했습니다(1·2장, 5장 21번).
> 같은 날 1장 CI 행이 21번 갱신 전에 멈춰 있어 "CI 에 없음" 으로 남아 있던 것을 바로잡았습니다
> 본 문서가 **단일 진실 원천(SSOT)** 입니다. 실측값과 판정은 이 문서에만 적고,
> 다른 문서는 링크로 가리킵니다.

---

## 1. 구현 현황

| 항목 | 상태 | 근거 |
| --- | --- | --- |
| 페이지 8종 | 완료 | `src/pages/` 의 `.astro` 8개. `scripts/verify.sh` 의 `PAGES`·`NARROW` 배열과 일치 |
| Hallmark 섹션 리듬 재구성 | 완료 | [`../design/HALLMARK_REDESIGN.md`](../design/HALLMARK_REDESIGN.md). 8개 라우트가 각기 다른 구조 |
| 디자인 토큰 | 완료 | `src/styles/global.css` `:root` 단일 소스 |
| 공통 컴포넌트 | 완료 | `src/components/{Logo,Header,Footer}.astro` |
| 콘텐츠 단일 소스 | 완료 | `src/data/site.ts`, `src/data/pricing.ts`, `src/data/enquiry.ts`, `src/data/faq.ts` |
| 문의·데모 접수 API | 본체에 없음 | `src/data/site.ts` 의 `enquiryEndpoint` (빈 값). 이 저장소에서 API 를 만들지 않습니다. 4장을 따릅니다 |
| 분석 도구 | 연결 | `src/data/site.ts` 의 `gaMeasurementId` = `G-R7CBGGMDFF`. 값이 있을 때만 GA4 태그가 삽입됩니다. 폼 전환 이벤트는 `src/scripts/app.js` 가 `gtag('event', ...)` 로 보냅니다. 일반 객체로 `dataLayer.push` 하면 gtag.js 가 콘솔 오류 없이 조용히 무시하므로 형식이 고정되어 있습니다. 데이터는 24~48시간 뒤부터 쌓입니다 |
| Tailwind 컴파일 전환 | 완료 | CDN 제거. 콘솔 경고 0 |
| 검증 파이프라인 | 완료 | `scripts/verify.sh`. 8단계(1 타입·2 빌드·3 서빙·4 링크·5 렌더·6 폰트·7 반응형·접근성·8 인터랙션). 4단계 정적 검사는 6종입니다(`check-links`, `check-sitemap`, `check-structured-data`, `check-copy-consistency`, `check-doc-links`, `check-pages-listed`). `8단계` 는 shell 단계 번호이고, 8단계가 실제로 돌리는 검사 항목은 10개입니다(검사 구성은 nav 1, form 2, dialog 1, prefill 1, prefill-reject 3, fallback 2) |
| 폰트 | self-host | `public/fonts/pretendard-variable-subset.woff2`. **현재 50,172 바이트**(2026-10-05 실측). CDN 의존 제거, 요청 10건 → 1건, 비차단 로드. 재생성은 `scripts/build-font-subset.py`, 누락 검사는 `scripts/check-font-subset.swift`. 5장 10·15번의 81,696·52,176·58.9KB 값은 각 회차 시점 기록이므로 현재 기준으로 읽지 마십시오 |
| 타입 체크 | 완료 | `npm run check` = `astro check`. `tsconfig.json` (strict) 기준. 37파일, 에러 0, 힌트 2건(2026-10-05 실측). 힌트는 `scripts/audit/checks/prefill.js` 와 `prefill-reject.js` 의 미사용 `sleep` 변수(`ts6133`)이며 `npm run check` 의 실패 기준은 error 이므로 통과에 영향이 없습니다 |
| 게이트 기대값 파생 | 완료 | `scripts/audit/expected.mjs`. 정본에서 기대 문구를 파생해 `interact.swift` 가 주입 |
| CI 파이프라인 | 통과 | `.github/workflows/ci.yml`. 이모지 검사, 타입 체크, 빌드, 링크 무결성, sitemap 무결성, 구조화 데이터 정합, 카피 정합. 8단계 중 1·2·4단계를 전부 돕니다. **4단계 정적 검사 4종을 모두 돌립니다.** 2026-10-02 에 `verify.sh` 4단계에 붙은 `check-structured-data.mjs` 와 `check-copy-consistency.mjs` 가 CI 에 없던 사각지를 2026-10-05 에 찾아 붙였습니다. 둘 다 순수 Node 이므로 Linux 러너에서 그대로 돕습니다. 5장 21번 참조 |
| 원격 저장소 | 연결 | `origin` = `github.com/kwanbum217/NARANI_HomePage` |
| 정적 배포 | 미수행 | `dist/` 는 로컬 검증까지만 |
| 폼 백엔드 | 미연결 | `src/data/site.ts` 의 `enquiryEndpoint` 가 빈 값이라 900ms 지연 시뮬레이션. 문의·데모 접수 API 가 제품 본체(`refac_bid_box`)에 없으므로 이 저장소에서 만들지 않고 위임합니다 |
| 결제 연동 | 미연결 | 주문 확인 다이얼로그까지만 동작 |
| sitemap / robots / OG | 완료 | prerendered 엔드포인트(`src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts`)와 `public/og.svg`, `og.png`. 새 패키지 추가 없이 정적 생성 |
| 구조화 데이터 | 완료 | `src/layouts/BaseLayout.astro` 가 head 에 Organization·WebSite JSON-LD 를 출력하고, BIDBOX 5개 페이지에만 `SoftwareApplication` 노드를 덧붙입니다. `applicationCategory` 는 `BusinessApplication` 입니다. nani 3개 페이지에는 없습니다 |
| FAQ 데이터 모듈 | 완료 | `src/data/faq.ts`. 요금·서비스 두 페이지가 공통으로 씁니다. `CURRENT_STATE.md` 4.1 의 단일 소스 위반 항목 참조 |
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
실측으로 갱신했고, **2026-10-05 에 사용자 로그인 셸(`zsh -lic`)로 재확인해 여전히
v26.10.0·12.1.0 임을 확인했습니다.** 패키지 4종과 esbuild, Swift 6.4 도 같은
방법으로 일치를 재확인했습니다. WKWebView 상세 버전은 확인하지 않았습니다.

**주의**: Hermes `execute_code` 커널의 PATH 맨 앞에는
`~/.hermes/tools/node-26.7.0-darwin-arm64/bin` 이 붙어 있어 `node -v` 가
v26.7.0·npm 11.19.0 으로 나옵니다. **이 값이 아니라 로그인 셸의 값을 기록하십시오.**
사유는 [`../ops/DO_NOT_REPEAT.md`](../ops/DO_NOT_REPEAT.md) 11.3 참조.

---

## 3. 회귀 기준선 (실측)

측정 조건: `npm run build` 산출물 `dist/` 를 `http://127.0.0.1` 의 로컬 포트로 서빙,
WKWebView 에서 다음 뷰포트로 렌더. 스크린샷은 `.verify/` 에 생성.
포트 번호는 아래 수치의 재현에 필요 없습니다. `scripts/verify.sh` 가 빈 포트를 자동
배정하므로 어떤 포트에서 돌려도 같은 산출물을 봅니다. 이 절이 적힌 2026-09-25 시점에는
기본값 4322 를 명시했고, 2026-09-28 에 자동 배정으로 바꾸었습니다. 위 수치의 원문
기록이며 지금의 절차가 아닙니다.

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

반응형·접근성 (320px, 8개 페이지 전부. 404 포함):

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
| 요금 다이얼로그 존재 | 8개 페이지 중 `/bidbox/pricing/`만 true, 나머지 7개 false |

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

"해야 하는 미구현"과 "하지 않기로 한 보류"를 나눕니다. 이 구분이 없으면 다음
세션의 에이전트가 보류된 항목을 미완성으로 읽고 API 를 붙이려 들 수 있습니다.
2026-09-28 이전 이 표에는 둘이 섞여 있었습니다.

### 4.1 미구현 — 결정을 내리면 바로 할 수 있는 것

| 항목 | 영향 | 다음 행동 | 담당 |
| --- | --- | --- | --- |
| 공개 URL 없음 | 도메인·canonical·sitemap 모두 `https://narani.my` 로 고정돼 있고 실제 주소가 없음 | `dist/` 를 정적 호스팅에 올리고 DNS 를 연결합니다. `astro.config.mjs` 의 `site` 는 이미 채워져 있어 바꿀 곳이 없습니다 | 미정 |

2026-10-02 에 4.1 에 있던 세 항목(FAQ 단일 소스 위반, 요금 다이얼로그 카피 모순,
게이트의 사각지)은 모두 2026-10-02 에 처리되어 이 표에서 빠졌습니다. 근거는
[`../analysis/검토_고도화_W1W2_20261002.md`](../analysis/검토_고도화_W1W2_20261002.md)
와
[`../handoff/2026-10-02_review_findings_fixed.md`](../handoff/2026-10-02_review_findings_fixed.md)
입니다.

### 4.2 보류 — 하지 않기로 한 것 (결정 완료, 다시 열지 않음)

| 항목 | 보류 근거 | 해제 조건 |
| --- | --- | --- |
| 결제 미연결 | 제품 본체(`refac_bid_box`)에 PG 가 없습니다. 2026-09-28에 `toss`·`portone`·`카페24`·`kakaopay`·`stripe` 전무, 주문·결제 모델도 없음을 확인했습니다. 상세는 [`../ops/PAYMENT_ROUTE.md`](../ops/PAYMENT_ROUTE.md) | **사용자 결정이었습니다.** 2026-09-15에 내부 베타 유지와 함께 결제·약관 전문·비밀번호 찾기 보류를 결정했습니다. 근거는 다른 저장소 `refac_bid_box` 의 `docs/handoff/session_20260915_grok_audit_review_and_waves.md` 8장입니다(저장소 밖이라 링크가 아니고 경로로 적습니다). 결정을 뒤집으려면 본체에서 PG 를 붙인 뒤 여기로 오십시오. 에이전트가 임의로 착수할 항목이 아닙니다 |
| 문의·데모 접수 API 부재 | 본체에 접수 엔드포인트가 없습니다(2026-09-28 확인, 라우터 7종에 없음). 결제는 보류인데 접수도 같은 결정에 묶였습니다 | 위와 같습니다. 본체에 접수 API 가 생기고 사용자가 재개하면 그때 `src/data/site.ts` 의 `enquiryEndpoint` 한 곳만 채웁니다. 그전까지 폼 degrade 경로(주소 표시·mailto·복사)가 사용자의 다음 행동을 받습니다 |
| 폼 백엔드 미연결 | 위 접수 API 항목과 같은 사안 | 위와 같습니다 |

### 4.3 완료

| 항목 | 결과 |
| --- | --- |
| 문의 페이지 레이아웃 | 2026-09-28에 `demo.astro` 와 같은 2단 그리드로 수정(`contact.astro:15`). 폼 formLeft 180→661, 페이지 높이 1547→1107. 320px 오버플로우 0건 |
| 테마 시각 미확정 | 2026-09-28에 `.verify/` 스크린샷 7장을 육안 확인. 회사소개 1장은 라이트(`--nani-*`), BIDBOX 4장은 전부 다크(`--bb-*`). 레지스터 혼합 없음. 설계 의도와 일치 |

---

## 5. 다음 착수 목록 (우선순위)

이 절은 착수 대상만 나열한 우선순위 목록이 아니라, 완료 이력과 남은 항목이 섞인
기록입니다. **완료** 또는 **보류** 표시가 붙은 항목에는 착수하지 마십시오.

1. **완료.** 테마 육안 확정 — 2026-09-28에 마쳤습니다. 4장 4.3 을 보십시오
2. ~~`refac_bid_box` 에 문의·데모 접수 API 추가 후 `enquiryEndpoint` 연결~~ — **보류.**
   2026-09-15 사용자 결정(내부 베타 유지, 결제·약관·비밀번호 찾기 보류)에 묶여
   있습니다. 4장 4.2 를 보십시오. 이 항목에 에이전트가 착수하지 마십시오
3. GA4 측정 ID 를 만들어 `gaMeasurementId` 에 넣기 — 측정 ID `G-R7CBGGMDFF` 는
   2026-09-28에 이미 배선했고 consent 기본값과 `gtag('event', ...)` 형식까지
   반영했습니다. 남은 건 **운영 도메인 실사용 데이터 확인**뿐입니다(배포 선행 필요)
4. ~~요금 결제를 제품 본체 라우트로 딥링크~~ — **보류.** 본체에 PG 가 없고
   2026-09-15에 결제를 보류했습니다. 4장 4.2 를 보십시오
5. 도메인 연결 및 첫 배포
6. **완료.** 서비스 페이지 시각 자료 — 2026-09-28에 사용자가 이번 회차 보류를 결정했고,
   2026-09-29에 재개했습니다. 서비스 페이지 핵심 기능 3행이 제목 옆 24px 마크로 기존
   `capabilities.icon` 을 표시합니다. 아이콘은 `src/pages/bidbox/service.astro` 행에서만
   그리고, 3열 카드와 아이콘 타일은 복원하지 않았으며 허브(`/bidbox/`) 행은 아이콘 없이
   둡니다. 실측 수치는 3장 기준선을 보십시오.
7. **완료.** 검증 게이트 검토 권고 5건 중 2·3·4·5번은 2026-09-28에 반영했습니다
   ([`../analysis/검토_요금순서통화_20260928.md`](../analysis/검토_요금순서통화_20260928.md),
   [`../analysis/검토_접수완료가시성_20260928.md`](../analysis/검토_접수완료가시성_20260928.md)).
   요금 순서 가정은 featured 파생으로 대체되어 조용한 통과 경로가 닫혔습니다.
   1번(라벨을 데이터 모듈로 모으기)은 현 구조가 검사 범위에서 정확해 이월했습니다.
   후속 권고 5건은 위 두 검토 문서 4장에 있습니다
   ([`../analysis/검토_체크기대값_파생_20260928.md`](../analysis/검토_체크기대값_파생_20260928.md) 4장)
8. **완료.** 검증 권고 5건의 2026-09-28 자정: 1번은 `src/data/enquiry.ts` 가 이미 단일
   소스라 구조 개선이 아니라 문서 갱신 대상입니다. 3번(가시성 단언)은
   `scripts/audit/checks/form.js:23-27` 에 이미 반영돼 있습니다.
   5번(통화 표기)는 `won` 으로 이미 통일돼 있습니다.
   4번(Node 전제)은 2026-09-28에 반영했습니다. `package.json` 에 `engines.node` 를
   추가하고, `scripts/verify.sh` 가 시작 시 그 값을 읽어 버전을 확인합니다.
   낮으면 8단계에 닿기 전에 종료 코드 1 로 멈춥니다. `engines` 는 `npm install` 시
   경고로만 나오므로 그것만으로는 부족했습니다. CI 도 `node-version: '22.18.0'` 으로
   같은 하한을 고정했습니다. 실측: `engines.node` 를 `>=99.0.0` 으로 조작해 막히는 것과
   복원 후 통과하는 것을 확인했습니다.
9. **완료.** `scripts/verify.sh` 의 포트를 자동 배정으로 바꾸었습니다. 이전 기본값 4322 는
   병렬 워커가 같은 포트를 두고 경쟁해, 나중 실행한 쪽이 앞선 워크트리의 `dist` 를
   검증했습니다(자기 변경은 미검증, 남의 화면이 통과하면 통과로 오인).
   2026-09-28 실제 발생. 이제 `PORT` 미지정이면 빈 포트를 고르고, 명시한 포트가
   이미 쓰였으면 3단계에서 종료 코드 1 로 멈춥니다.
   `docs/ops/ORCA_WORKERS.md` v1.4.0 5장(5.1~5.3)과 `docs/spec/QA_AND_A11Y.md`,
   `.agents/skills/a11y-audit/SKILL.md` 도 갱신했습니다. 스킬이 4322 를 하드코딩하고
   있어 게이트 실행 중 충돌할 수 있었습니다. 5장 표가 깨져 있던 지점도 v1.4.0 에서
   바로잡았습니다.
10. **완료.** 2026-09-28에 `scripts/check-sitemap.mjs` 를 4단계에 추가했습니다. 새 페이지를
   넣고 `src/pages/sitemap.xml.ts` 의 경로 목록을 잊어도 링크 검사는 통과했고, 그
   페이지는 색인되지 않았습니다. 문서 페이지 수가 7에서 8로 바뀐 뒤 문서가 따르지
   못한 사례와 같은 유형이라 기계로 막았습니다. 색인 누락·죽은 주소·canonical
   불일치·sitemap 도메인 불일치·404 의 noindex 유무를 검사합니다. WebKit 이 필요
   없어 CI 에서도 돕니다.
   고도화 후보 3건은 [`../analysis/고도화_후보_20260928.md`](../analysis/고도화_후보_20260928.md)
   에 있습니다. 2026-09-28에 병렬 워커 3기(worktree 분리)로 모두 구현하고 머지했습니다.
   요금 다이얼로그가 `/bidbox/contact/?plan=<label>` 로 상품 컨텍스트를 넘기고
   문의 폼이 "주문 상품" 표시로 보여줍니다. 쿼리는 `src/data/pricing.ts` 의 라벨과
   일치할 때만 받으므로 조작된 값과 잘린 값(`&` 이후 소실)이 모두 빈 문자열로 떨어집니다.
   문의 폼 전송 실패 시 주소·mailto 링크·"주소 담기" 버튼이 함께 보입니다.
   폰트 서브셋은 81,696 → 52,176 바이트로 줄었고 8개 페이지 육안 확인으로
   깨진 글자와 숫자 정렬이 유지됨을 확인했습니다.
   2026-09-28에 prefill 4케이스(`prefill.js`·`prefill-reject.js`)와 degrade
   2폼(`fallback.js`)을 자동 게이트에 넣었습니다. 8단계 항목은 3개에서 9개로
   늘었고, 각 검사가 결함을 실제로 잡는지 구현을 망가뜨려 확인했습니다.
   남은 공백은 degrade 의 클립보드 거절 분기입니다. `127.0.0.1` 과 `localhost` 가
   모두 보안 컨텍스트라 이 환경에서 거절을 만들 수 없어 성공과 거절을 모두
   통과로 봅니다. 판정 근거는 전부 `src/data/` 정본에서 파생합니다.
11. **완료.** `#plans` 구매 버튼 수는 `src/data/pricing.ts` 의 `plans` 개수와 같습니다.
   위 Chrome·Firefox 실측 절의 "버튼 5개"는 구 셀렉터가 다이얼로그 버튼까지 센 값이며
   그 시점 측정값입니다. 현재 게이트는 `plans` 개수와 비교합니다
12. **완료.** 권고 1번(폼 카피를 데이터 모듈로)은 2026-09-28에 반영했습니다. `src/data/enquiry.ts`
   가 contact·demo 두 폼의 라벨과 오류 문구를 정의하고, `scripts/audit/expected.mjs` 가
   이 모듈을 직접 import 합니다. 이전의 정규식 파생 경로는 없어졌습니다. 기대값 문자열은
   이전과 동일해 3장 기준선과 일치합니다.
13. **완료.** `npm run check` 편입은 2026-09-28에 반영했습니다. 게이트는 6단계에서 7단계로
   늘었고 1단계가 타입 체크입니다. 패키지 3개(`@astrojs/check`, `typescript`,
   `@types/node`)는 사용자가 승인과 함께 지정했습니다. GitHub Actions 실환경
   (ubuntu-latest, Node v22.23.2)에서 37파일 에러 0 을 확인했습니다.
   2026-10-05 게이트 정합 배치에서 `npm run check` 를 main HEAD 에서 실행해
   재확인했습니다. 그 배치에서 추가된 `scripts/check-doc-links.mjs` 와
   `scripts/check-pages-listed.mjs` 두 `.mjs` 가 `astro check` 대상에 들어가므로
   이 값은 배치 이전의 35 가 아니라 37 입니다.
14. **완료.** 폼 variant 는 `x-data` 인라인 문자열이라 `astro check` 가 걸지 않습니다. 알 수 없는
   variant 조용히 contact 로 떨어지던 것을 2026-09-28에 콘솔 에러로 바꿨습니다. 데모
   페이지에 `'demmo'` 오타를 심어 게이트가 종료 코드 1 로 멈추는 것을 확인한 뒤 되돌렸습니다.
15. **완료.** 고도화 1차(2026-09-28): 이메일을 `support@narani.my` 로 확정했습니다. `enquiryEndpoint` 와
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

16. **완료.** 폼 필드 접근성 2026-09-29. 문의·데모 폼의 텍스트 입력에 필수 표시와
   길이 제한이 없었습니다. 게이트 8단계는 Alpine 검증 결과만 검사해서 이 결함을
   잡지 못하고 통과했습니다. 2026-09-29에 보강했습니다.
   필수 표시는 `aria-required="true"` 입니다. 폼에 `novalidate` 가 있고 검증은 Alpine 이
   하므로 `required` 를 넣지 않았습니다. `required` 는 브라우저 네이티브 툴팁이
   Alpine 검증과 별개로 떠 이중 메시지가 됩니다.
   길이 상한은 `src/data/enquiry.ts` 에 두고(성함 100, 이메일 254, 문의내용 2000) 페이지가
   거기서 읽습니다. 이메일 254 는 RFC 5321 최대 경로 길이이고, 나머지 두 값은 무한
   입력 방지용 상한입니다. 근거 문서가 없습니다.
   실측(Chrome, 빌드 후 서빙): `aria-required` 와 `maxlength` 가 7개 필드 전부 DOM 에
   있고, 키 입력으로 120자를 넣었을 때 100자에서 멈춥니다.
   게이트에 검사를 추가했습니다(`scripts/audit/expected.mjs` 가 정본에서 파생,
   `scripts/audit/checks/form.js` 가 대조). `d-notice`(관심 공고)는 검증 대상이 아니라
   `aria-required` 가 없는 것을 기대값으로 삼습니다. 실행 경로는 `scripts/verify.sh` 에
   demo 를 추가해 8단계 항목이 9개에서 10개로 늘었습니다.
   음성 검증: `aria-required` 를 지우면 종료 코드 1 과
   `성명 필드(c-name)의 aria-required 가 true 가 아닙니다 (값: null).`,
   `maxlength` 를 지우면 `이메일 필드(c-email)의 maxlength 가 254 가 아닙니다 (값: null).`
   로 멈춥니다. 되돌리면 종료 코드 0.
17. **해소됨. 결함 아님.** 요금 다이얼로그 포커스 순서. 처음에는 주문 확인
   다이얼로그(`showModal`)가 열린 상태에서 Tab 을 누르면 4번째에 포커스가
   `BODY` 로 새어 나가는 결함으로 기록했습니다. Chrome DevTools Protocol
   `Input.dispatchKeyEvent` 로 2회 측정해 재현 가능하다고 단정했고, 이에 따라
   포커스 트랩 자바스크립트를 네 가지 방식(keydown preventDefault, focusout,
   tabindex=-1, document focusin 가드)으로 시도했습니다.
   **결과는 가짜 양성이었습니다.** 2026-09-29 에 실제 Safari 창에서 사용자가
   Tab 을 8회 넘게 눌러 확인한 결과 다이얼로그 밖으로 나가지 않았습니다.
   CDP 합성 키 이벤트는 `inert` 처리를 우회해 포커스를 `BODY` 로 떨어뜨리는데,
   실제 사용자 키 입력에서는 일어나지 않습니다. `showModal()` 이 포커스 트랩을
   정상 제공합니다.
   **결론: WCAG 2.4.3 위반이 아니며 수정한 코드는 없습니다.** main 은 `dc218b8` 로
   그대로입니다. 시도한 수정은 되돌렸습니다.
   **이 항목이 주는 교훈**: 측정 도구가 만든 현상을 제품 결함으로 단정하지
   마십시오. CDP 로 재현된다고 해서 사용자에게도 재현되는 것은 아닙니다.
   합성 이벤트 도구가 실제 사용자 경로를 faithfully 재현하는지 확인한 뒤에만
   결함으로 기록하십시오. 이 저장소에서 확인 가능한 경로는 세 가지였습니다.
   (1) 헤드리스 Chrome CDP — `inert` 우회로 가짜 양성,
   (2) WebKit `evaluateJavaScript` — 키 이벤트 불가,
   (3) 실제 Safari 창에서 사람이 누르는 것 — 이것만 재현 가능했습니다.
   게이트에 이 검사를 추가하지 않은 판단은 맞았습니다. `scripts/audit/interact.swift`
   는 `evaluateJavaScript` 로 스크립트를 실행할 뿐 키 이벤트를 보내지 못하며,
   이 확인을 자동화하려면 게이트 구조를 바꿔야 합니다.
18. **완료.** 2026-09-30 문서 정합 2건. `AGENTS.md` 8장 검증 표의 인터랙션 행이
    2026-09-28 에 추가된 prefill·degrade 를 빠뜨린 상태였고, 8장 말미 CI 설명이
    8단계 항목 수를 9개로 적고 있었습니다. 실제 항목은 10개입니다(검사 구성은
    nav 1, form 2, dialog 1, prefill 1, prefill-reject 3, fallback 2).
    두 곳을 실측값으로 맞췄습니다.
    `AGENTS.md` 는 Hermes 가 보호하므로 Hermes 밖의 cmd 워커에게 편집할 문장을
    diff 로 넘겨 반영했습니다(절차는
    [`../ops/DO_NOT_REPEAT.md`](../ops/DO_NOT_REPEAT.md) 9.1).
    같은 회차에 리뷰어 에이전트 kilo 의 좌측 아이콘이 Orca 화면에서 opencode
    아이콘으로 보이던 결함을 진단해
    [`../ops/ORCA_WORKERS.md`](../ops/ORCA_WORKERS.md) 4.6 절에 기록했습니다.
    원인은 Orca 1.4.217 의 상태 훅 라우트 테이블에 kilo 항목이 없어서입니다.
    **이번 회차는 제품 코드를 한 줄도 바꾸지 않았으므로 3장 기준선 수치는
    그대로입니다.** 상세는
    [`../handoff/2026-09-30_kilo_icon_and_gate_sync.md`](../handoff/2026-09-30_kilo_icon_and_gate_sync.md) 입니다.
19. **완료(1)·이월(3).** 2026-10-02 고도화. CTA 라벨 정직화, FAQ 데이터 모듈과
    요금·서비스 페이지 FAQ 섹션, BIDBOX 전용 `SoftwareApplication` JSON-LD 를
    병렬 워커 2기로 구현하고 리뷰어 1기로 검증했습니다. 리뷰가 결함 4건을 냈고
    그중 `applicationCategory` 값(`'SoftwareApplication'` 은 `@type` 을 그대로
    반복한 용어 오류)만 `'BusinessApplication'` 으로 고쳤습니다. 나머지 3건
    (FAQ 단일 소스 위반, 요금 다이얼로그 카피 모순, 게이트의 사각지)은 2026-10-02
    사용자 결정으로 4.1 에 이월했습니다.
    **이 회차는 카피와 구조화 데이터만 바꿨으므로 3장 기준선 수치는 그대로입니다.**
    실측: 라이트 대비 15.88, 다크 19.46, CTA 44px, 폰트 서브셋 검사 문자 352개,
    7단계 0 issue group, 8단계 10개 항목 전부 `fail: null`. 상세는
    [`../handoff/2026-10-02_cta_faq_jsonld_review.md`](../handoff/2026-10-02_cta_faq_jsonld_review.md),
    리뷰서는
    [`../analysis/검토_고도화_W1W2_20261002.md`](../analysis/검토_고도화_W1W2_20261002.md) 입니다.
20. **완료.** 2026-10-02 리뷰 결함 3건 처리. 19번에서 이월한 세 항목을
    병렬 워커 3기(W3·W4 병렬, W5 는 둘의 병합 후)로 해결했습니다.
    W3 은 `src/data/faq.ts` 가 `src/data/pricing.ts` 의 `POINT_NOTE` 와 신규
    `POINT_USAGE_RULE` 를 import 하도록 바꾸고, 코디네이터가 `pricing.astro:79` 의
    하드코딩을 그 상수로 배선했습니다. W4 는 다이얼로그 문장의 "프로그램 접속"을
    "서비스 이용"으로 고쳤습니다. W5 는 `scripts/check-structured-data.mjs`(10개
    항목)와 `scripts/check-copy-consistency.mjs`(화이트리스트 4개 항목)를 만들어
    `scripts/verify.sh` 4단계에 붙였습니다. 단계 수는 8 그대로이고 검사 항목만
    늘었습니다.
    **코디네이터 음성 검증**(워커 자기보고 재현): 자기참조 `applicationCategory`
    되돌리면 구조화 데이터 검사 exit 1(5건), "프로그램 접속" 복원하면 카피 검사
    exit 1(1건), `POINT_USAGE_RULE` 하드코딩하면 카피 검사 exit 1(1건).
    전부 복원 후 통과 확인했습니다.
    **폰트 서브셋 검사 문자 352 → 350.** 사라진 문자는 정확히 `램속` 2자이며,
    이는 "프로그램 접속"이 페이지에서 사라진 결과입니다. 문자 집합을 직접
    비교해 확인했습니다(353 vs 355, 개행 처리 차이).
    **이번 회차는 카피·데이터·게이트만 바꿨으므로 3장 기준선 수치는 그대로입니다.**
    실측: 라이트 대비 15.88, 다크 19.46, CTA 44px, 5단계 콘솔 오류 0건,
    7단계 0 issue group, 8단계 10개 항목 전부 `fail: null`. 상세는
    [`../handoff/2026-10-02_review_findings_fixed.md`](../handoff/2026-10-02_review_findings_fixed.md) 입니다.
21. **완료(문서 14건·게이트 2건·AGENTS.md 2곳).** 2026-10-05 문서·코드 정합 검토. 문서가 코드를
    따라가지 못한 9건을 실측으로 찾아 처리했습니다. **3장 기준선 수치는 그대로입니다**
    (카피·데이터·토큰을 건드리지 않았습니다).

    **문서 정정 12건 + AGENTS.md 2곳(외부 워커 위임)**

    | 건 | 처리 |
    | --- | --- |
    | 1장 "페이지 7종" | 8종으로 정정. `.astro` 8개, `verify.sh` `PAGES` 배열과 일치 확인 |
    | 1장 콘텐츠 단일 소스 | `src/data/faq.ts` 누락이었습니다 |
    | 1장 폰트 용량 | 현재값 50,172 바이트를 정본에 기록. 81,696·52,176·58.9KB 는 회차 기록임을 명시 |
    | 1장 타입 체크 | 29파일 → 35파일, 힌트 2건의 정체를 기록 |
    | 1장 CI | 4단계 정적 검사가 4종인데 2종만 돌던 사각지를 발견하고 **CI 에 추가** |
    | `docs/analysis/README.md` | 색인 26건 → 32건. 2026-10-02 회차 6건이 빠져 있었습니다 |
    | `docs/spec/QA_AND_A11Y.md` 3장 | 도구 표가 12개 중 4개만 열거. 전부 채우고 이모지 검사 범위를 명시 |
    | `.agents/skills/` | 5개 파일 링크 13건이 `../../docs/` (한 단계 부족). `../../../docs/` 로 수정 |
    | `docs/ops/BUILD_AND_DEPLOY.md` 8장 | CI 표에 검사 2종 추가 |
    | `Makefile` | `PORT ?= 4322` 가 2026-09-28 포트 자동 배정 이후 죽은 변수로 남아 있었습니다. 제거 |
    | `docs/ops/DO_NOT_REPEAT.md` | 9.2(문서 링크 깊이)와 11장(오탐 3건) 추가 |
    | `AGENTS.md` 1장 | "BIDBOX 4개" → "BIDBOX 5개". Hermes 밖의 `cmd` 워커가 수정 |
    | `AGENTS.md` 8장 표 | `dist 서빙` 행 추가, 5단계 스타일 실측 통합, 4단계에 정적 검사 2종 추가. `QA_AND_A11Y.md` 2장과 8단계 전부 일치 확인 |

    **게이트 코드 변경 2건과 음성 검증 결과**

    - `scripts/check-no-emoji.mjs` 의 `DEFAULT_TARGETS` 에 `.agents`, `.github`,
      `astro.config.mjs`, `Makefile`, `.pre-commit-config.yaml`, `package.json`,
      `tsconfig.json` 을 추가했습니다. 검사 파일 112 → **123개**
      (인수인계 문서 1건이 추가되어 최종 124개).
      음성 검증: `.github/workflows/ci.yml` 과 `.agents/skills/a11y-audit/SKILL.md` 에
      이모지를 심어 **둘 다 exit 1 로 잡히는 것**을 확인하고 되돌렸습니다.
    - `.github/workflows/ci.yml` 에 `check-structured-data.mjs` 와
      `check-copy-consistency.mjs` 를 추가했습니다. CI 7단계(로컬 재현)를 전부
      실행해 종료 코드 0 을 확인했습니다.

    **이 세션에서 내가 만든 오탐 3건**(셋 다 정정 후 기록함)

    (1) `check-copy-consistency` 음성 검증에 실제 상숫값과 다른 문장을 넣어
    통과가 나왔습니다. 틀린 값을 넣으면 검사가 아무것도 하지 않은 것처럼
    통과하므로, 실제 값으로 다시 넣어 exit 1 을 확인했습니다.
    (2) `plans` 항목 수를 `grep "{ id: '"` 로 세어 0 을 얻었습니다. 실제 3개입니다.
    (3) **가장 부당한 오탐.** `execute_code` 커널에서 `node -v` 를 돌려
    v26.7.0·npm 11.19.0 을 얻고 2장 환경의 v26.10.0·12.1.0 이 낡았다고
    "정정"했습니다. **원래 문서가 옳았습니다.** Hermes 커널의 PATH 맨 앞에
    `~/.hermes/tools/node-26.7.0-darwin-arm64/bin` 이 붙어 있어서 다른 Node 가
    잡힌 것이었습니다. `terminal` 도구와 `zsh -lic` 로그인 셸 모두 v26.10.0·12.1.0 을
    가리킵니다. 되돌렸고 2장 경고를 남겼습니다.
    셋 다 [`../ops/DO_NOT_REPEAT.md`](../ops/DO_NOT_REPEAT.md) 11장에 남겼습니다.

    **AGENTS.md 는 Hermes 밖의 워커에게 위임해 수정했습니다.** 1장 표 "BIDBOX 4개"를
    5개로, 8장 표를 `verify.sh` 실제 8단계(`docs/spec/QA_AND_A11Y.md` 2장 기준)에
    맞췄습니다. 워커는 `cmd`(Command Code v1.74.1, yolo), Orca run `run_cc70cb292163`.
    코디네이터가 `git diff` 로 대조했고 지시한 두 곳 외 변경은 0건이었습니다.
    워커가 커밋하지 않고 넘겼으므로 코디네이터가 커밋했습니다.

   **리뷰 반영 (2026-10-05, 배치 `0cb8566..7a95487` 이후)**
   `docs/analysis/검토_게이트정합_배치_20261005.md` 의 차단 2건을 처리했습니다.

   - **B-1 CI 커밋 메시지 검사 무음 통과.** 프로세스 치환 `done < <(git log ...)`
     안의 실패는 `pipefail` 이 잡지 못해 루프가 "입력 없음"으로 새고 종료 코드 0 이
     됐습니다. 커밋 1개 저장소의 최초 푸시(all-zeros)에서 재현됩니다. 범위를 루프 밖에서
     먼저 해석하고 빈 결과면 실패시키도록 고쳤습니다. 음성 검증 8케이스(최초 푸시·빈
     base·push 2·3커밋·PR head·이모지·마침표·머지 메시지) 전부 기대값과 일치합니다.
     러너에서의 실제 동작은 재현하지 못했습니다.
   - **B-2 문서 수치 불일치 3건.** 5장 13번과 1장 타입 체크를 35파일 → 37파일로
     바로잡았습니다(신규 `.mjs` 2개가 `astro check` 대상). `QA_AND_A11Y.md` 의 이모지
     검사 설명은 13개 항목/124개 파일 → 15개 항목으로 고치고, **검사 파일 수는 실행
     시점의 로컬 파일 집합에 따라 달라지므로 문서에 고정값으로 적지 않습니다.**
     같은 커밋에서 워크트리별로 124~132개로 갈리는 것을 확인했습니다.
   - **리뷰 권고 6번도 함께 처리.** `Makefile` 은 `DEFAULT_TARGETS` 에 있었지만
     확장자 필터에 없어 항상 0개를 셌습니다. `BARE_FILES` 로 받도록 바꿨고, 이모지를
     심어 `Makefile:42` 로 잡히는지 확인한 뒤 되돌렸습니다.
   - 이 회차는 제품 코드를 건드리지 않았으므로 3장 기준선 수치는 그대로입니다.
    185~189행 CI 설명은 원래부터 참이었고 이번 세션의 CI 보강으로 계속 참이므로
    손대지 않았습니다. 상세는
    [`../handoff/2026-10-05_docs_code_consistency_audit.md`](../handoff/2026-10-05_docs_code_consistency_audit.md) 5장입니다.

---

22. **완료.** 2026-10-05 리뷰 권고 3건. `docs/analysis/검토_게이트정합_배치_20261005.md` 의
   권고 1·3·5 를 처리했습니다.
   - `check-doc-links.mjs` 의 대상 수집을 하드코딩 목록 3개에서 **저장소 전체 스캔**으로
     바꿨습니다. `.github/` `.claude/` 마크다운 사각지가 닫혔습니다(음성 검증으로 두
     디렉터리 모두 잡힘을 확인). `collectRootMarkdownFiles` 는 루트 `*.md` 가 전체
     스캔에 포함되어 중복 수집을 만들므로 삭제했습니다.
   - `check-pages-listed.mjs` 의 배열 파싱을 `[^)]+` 정규식에서 **줄 단위 경계
     찾기**로 바꿨습니다. 이전에는 `PAGES=(` 다음 줄 주석의 `)` 에서 배열이 닫힌 것으로
     오판해 8개 항목이 전부 유실됐습니다. `verify.sh` 주석에도 이 의존성을 적었습니다.
   - **중복 라우트 검사**를 추가했습니다. `Set` 비교는 중복을 지우고 항목 수 비교는
     총 개수만 본다고, 라우트 하나를 지우고 다른 것을 두 번 넣으면 조용히 통과했습니다.
   - **8단계 인터랙션 시나리오 목록 대조**를 추가했습니다. `verify.sh` 의 손으로 관리되는
     목록은 세 개이고(`PAGES`, `NARROW`, 시나리오 호출부) 앞의 둘만 검사되고 있었습니다.
     판정 6~9(죽은 시나리오·미검증 시나리오·중복·불필요한 예외)로 막습니다.
     **예외 4개**(`/`, `/bidbox/`, `/bidbox/service/`, `/404.html`)는 페이지 고유
     인터랙션이 없어 시나리오가 없습니다. 공유 메뉴 토글은 `/company/` 에서 1회만
     검증됩니다. 이 사실을 `SCENARIO_EXEMPT` 로 코드에 명시했고 판정 8로
     "예외가 더 이상 필요 없으면 제거하라" 도 강제합니다.
   - **검증하지 못한 것**: 참조형 링크(`[k1][ref]`) 미탐지(리뷰 권고 2)와 앵커 존재
     여부 미검사는 이번 묶음의 스코프 밖이라 남아 있습니다. CI 러너에서의 실제
     동작도 재현하지 못했습니다.

23. **완료.** 2026-10-05 리뷰 권고 2(참조형 링크)과 게이트 출력 비결정성.
   - `check-doc-links.mjs` 가 **참조형 링크 정의**(`[k][r]` + `[r]: 경로`)를
     검사합니다. 인라인과 참조형의 판정을 `checkTarget` 한 곳에 모았고, 실패 출력은
     본문 참조가 아닌 **정의 줄**을 짚습니다. 현재 저장소에 참조형 정의는 0건이라
     드러나던 결함은 없었지만 형 자체를 못 보는 사각지를 닫았습니다.
     음성 검증: 깨진 정의 → exit 1(정의 줄 지적), 정상 정의 → 통과, 인라인 결함 → exit 1.
   - `check-no-emoji.mjs` 출력을 `검사 대상 15개 항목 (로컬 파일 N개, 실행 시점 기준)`으로
     바꿨습니다. **판정은 그대로입니다** — `.claude/` 와 `Makefile` 에 이모지를 심어
     여전히 exit 1 임을 확인했습니다. 바꾼 것은 출력뿐입니다.
     사유: `DEFAULT_TARGETS` 의 `.claude` `.commandcode` 아래는 gitignore 대상이라
     같은 커밋에서 검사 파일 수가 워크트리마다 달라졌습니다(132 / 129 실측).
     **출력에 남는 비결정적 수치는 다음 세션이 문서에 옮겨 적을 때 재현되지 않습니다.**
     결정적인 값은 "대상 15개 항목"이고 `15` 는 `DEFAULT_TARGETS` 의 길이입니다.
   - **미구현 — 사용자 결정이 필요합니다**: 앵커 존재 여부 검사는 넣지 않았습니다.
     마크다운 헤딩의 slug 규칙이 렌더러마다 달라 잘못된 판정을 만들 위험이 있고,
     어떤 slug 규칙을 정본으로 삼을지는 사용자 결정입니다. 지금은 경로만 확인하고
     앵커는 무시하며, 그 사실을 스크립트 주석에 명시했습니다.

24. **완료(1단계).** 앵커 slug 규칙 명시와 앵커 검사 1단계.
   - **slug 규칙의 정본은 `docs/spec/QA_AND_A11Y.md` 3장 "앵커 검사와 slug 규칙" 절입니다.**
     소문자화 → 비단어 제거(한글 유지) → 공백 하이픈 → 중복 시 `-1`·`-2`. 규칙을 바꾸면
     스크립트와 그 문서를 같이 고쳐야 합니다.
   - `check-doc-links.mjs` 가 앵커를 검사하되 **1단계는 보고만 하고 종료 코드 0** 입니다.
     계단식으로 한 이유: 2026-10-05 실측 기준 저장소 84개 마크다운에 앵커 링크는
     **1건뿐**이고 그것은 인라인 코드 예시라 검사 대상이 아닙니다. 지금 실패로 넣어도
     잡히는 결함은 0건이고, 실패로 만들면 첫 앵커를 붙이는 순간 연결된 문서들을
     전부 고치게 됩니다. 실제 결함이 아니라 규칙 채택 비용입니다.
   - **2단계(실패 승격)는 별도 회차**입니다. 실제 앵커 링크가 생기고 slug 규칙이
     실측으로 검증된 뒤 전환하고 그때 이 항목과 `QA_AND_A11Y.md` 를 함께 갱신합니다.
   - **JavaScript 의 `\w` 는 ASCII 만 포함**하므로 한글 앵커를 남기려면 유니코드 속성
     `\p{L}` 을 써야 합니다. 이 저장소는 헤딩이 861개이고 대부분 한글이라, `\w` 로
     구현하면 한글 앵커가 전부 사라집니다.
   - 실제 중복 헤딩(2026-10-05 실측): `CURRENT_STATE.md` 의 `#### 인터랙션` 2회,
     `work_log.md` 의 `### 범위` 7회·`### 변경` 6회·`### 검증` 7회.
     두 번째부터 `인터랙션-1` 처럼 번호가 붙습니다. work_log 의 반복 횟수는
     회차가 쌓일 때마다 변하므로 문서에 "당시 값"임을 명시했습니다.
   - 음성 검증(제가 직접 실행): 한글 앵커 인식, 없는 앵커 보고(종료 코드 0),
     코드 펜스 안 헤딩 제외, 인라인 코드 안 링크 제외, 중복 헤딩 `-1` 인식,
     깨진 경로의 기존 exit 1 유지 — 6케이스.

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
- JSON-LD 가 파싱되지 않거나, `@context`·`Organization`·`WebSite` 노드가 없고,
  BIDBOX 5개 페이지에 `SoftwareApplication` 이 없거나, nani 3개 페이지에 있거나,
  `applicationCategory` 가 자기 자신(`SoftwareApplication`)이거나, 결제 보류인데
  `offers` 가 있거나, `url`·`name` 이 정본(`astro.config.mjs` 의 `site`,
  `src/data/site.ts` 의 `brand.product`)과 다르거나.
  `scripts/check-structured-data.mjs` 가 검사합니다
- `src/data` 정본 문장(`primaryCta.program.label`, `POINT_NOTE`,
  `POINT_USAGE_RULE`)이 소비처 `.astro` 에 하드코딩으로 반복되거나, 폐기된 CTA
  문구 `프로그램 접속` 이 `src/pages`·`src/components` 에 남아 있거나.
  `scripts/check-copy-consistency.mjs` 가 화이트리스트 방식으로 검사합니다.
  정본 파일(`src/data/` 아래)은 대상이 아닙니다

마지막 두 항목은 2026-10-02 에 추가했습니다. 그전까지 게이트는 "깨지지 않은 것"만
증명했고 "틀린 것"을 증명하지 못했습니다
([`../analysis/검토_고도화_W1W2_20261002.md`](../analysis/검토_고도화_W1W2_20261002.md) 6절).
**단계 수는 8 그대로입니다.** 검사 항목이 늘어난 것이지 단계가 늘어난 것이 아닙니다.

인터랙션 체크가 비교하는 기대 문자열은 `scripts/audit/expected.mjs` 가 정본에서
파생해 `scripts/audit/interact.swift` 가 주입합니다. 파생 경로와 주입 경로는
[`../analysis/게이트_기대값_파생_20260928.md`](../analysis/게이트_기대값_파생_20260928.md) 와
[`../analysis/검토_체크기대값_파생_20260928.md`](../analysis/검토_체크기대값_파생_20260928.md) 에
적었습니다. 카피를 바꿀 때 체크 스크립트를 함께 고칠 필요가 없어졌습니다.

컴포넌트 치수와 배경색은 `scripts/audit/render.swift` 출력으로 확인합니다. 값이 위
3장과 다르면 회귀로 취급하고 원인을 찾습니다.

미검증 상태로 남은 항목은 4장의 열린 항목 표에만 적습니다.
