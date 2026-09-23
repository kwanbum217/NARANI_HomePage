# Hallmark 재구성 검토

> **작성일**: 2026-09-23
> **버전**: v1.0.0
> **상태**: 검토 완료, 수정 필요
> **사용 모델**: Muse Spark 1.3 (`opencode/muse-spark-1.3-contributor-free`)
> **대상 브랜치**: `feat/hallmark-redesign`
> 본 문서는 `docs/design/HALLMARK_REDESIGN.md` 기준 문서와 실제 읽은 소스만을 근거로 작성하였습니다. `npm run verify`는 제약에 따라 실행하지 않았습니다.

---

## 1. 검토 범위와 방법

읽은 문서와 코드를 아래에 밝힙니다. 읽지 않은 파일에 대한 판정은 하지 않았습니다.

| 구분 | 읽은 대상 |
| --- | --- |
| 기준 문서 | `docs/design/HALLMARK_REDESIGN.md`, `AGENTS.md`, `docs/ops/DO_NOT_REPEAT.md`, `docs/context/CURRENT_STATE.md` |
| 코드 | `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/Logo.astro`, `src/scripts/app.js`, `src/data/site.ts`, `src/data/pricing.ts`, `src/pages/index.astro`, `src/pages/company/index.astro`, `src/pages/bidbox/index.astro`, `src/pages/bidbox/service.astro`, `src/pages/bidbox/pricing.astro`, `src/pages/bidbox/demo.astro`, `src/pages/bidbox/contact.astro` |
| 읽지 않은 대상 | `dist/`, `.verify/` 산출물, 검증 스크립트 실행 결과 |

카피, 라우트, 두 색 레지스터, 세 Alpine 계약, 모바일 메뉴 DOM의 보존 여부를 확인하였습니다. 히어로 그라디언트, 가운데 정렬 히어로, 아이콘 타일, 균등 카드 그리드, 레지스터 혼합, 하드코딩 색상, 제목 이탤릭의 잔존 여부를 확인하였습니다. 실측 수치는 `docs/context/CURRENT_STATE.md`가 정본이므로 이 문서에 새로 적지 않았습니다.

---

## 2. 보존 판정 요약

| 항목 | 판정 | 근거 |
| --- | --- | --- |
| 카피 단일 소스 | 보존되었습니다 | `src/data/site.ts:6-12`의 `brand`을 `Footer.astro`, `contact.astro`, `app.js`에서 읽습니다. 페이지에 이메일 하드코딩이 없습니다 |
| 라우트 7종 | 보존되었습니다 | `src/pages/index.astro`, `src/pages/company/index.astro`, `src/pages/bidbox/index.astro`, `service.astro`, `pricing.astro`, `demo.astro`, `contact.astro` 구성이 유지됩니다 |
| 두 색 레지스터 분리 | 보존되었습니다 | 허브와 회사 페이지는 `variant="nani"` 라이트만 사용합니다. BIDBOX 5종은 `variant="bidbox"` 다크만 사용합니다. 회사 페이지의 다크 밴드와 허브의 다크 카드가 제거되었습니다 |
| 히어로 그라디언트 | 제거되었습니다 | `src/styles/global.css:103-104`에서 `.navy-field`와 `.warm-field`가 단색으로 정의됩니다. 방사 그라디언트가 없습니다 |
| 가운데 정렬 히어로 | 제거되었습니다 | 7개 페이지의 히어로가 모두 왼쪽 정렬 열로 구성됩니다. 가운데 정렬 클래스가 없습니다 |
| 아이콘 타일 렌더 | 제거되었습니다 | `src/pages/bidbox/service.astro:30-39`와 `src/pages/bidbox/index.astro:77-86`이 아이콘 없이 제목과 본문 행으로 그립니다 |
| 균등 카드 그리드 | 일부 남았습니다 | 회사 01-03과 BIDBOX 기능은 행으로 바뀌었습니다. 요금 3열만 남았습니다. 상세는 지적 MAJOR-1을 참조하십시오 |
| 레지스터 혼합 | 제거되었습니다 | 회사 페이지와 허브에 `reg-dark` 사용이 없습니다. BIDBOX 표면에 라이트 면이 섞이지 않았습니다 |
| 제목 이탤릭 | 없습니다 | `global.css`와 7개 페이지에 `italic` 제목 스타일이 없습니다. 제목은 로만으로 표시됩니다 |
| 하드코딩 색상 | 일부 남았습니다 | 토큰 참조로 대부분 바뀌었으나 잔존분이 있습니다. 상세는 지적 MAJOR-3과 MINOR-2를 참조하십시오 |
| 모바일 메뉴 DOM 계약 | 보존되었습니다 | `src/components/Header.astro:45-53`의 `button[aria-controls="mobile-nav"]`와 `src/components/Header.astro:91-96`의 `#mobile-nav` `x-show` `x-cloak` 조합이 유지됩니다. `x-transition`이 없습니다 |
| 세 Alpine 계약 | 보존되었습니다 | `siteNav`, `enquiryForm`, 요금 다이얼로그가 유지됩니다. 상세는 아래 표를 참조하십시오 |

### Alpine 세 계약 상세

| 계약 | 판정 | 근거 |
| --- | --- | --- |
| 모바일 메뉴 `siteNav` | 보존되었습니다 | `src/scripts/app.js:6-14`의 `open`, `toggle`, `close`를 `Header.astro:20`의 `x-data="siteNav"`에서 사용합니다. 열림과 닫힘의 `display`와 `aria-expanded` 바인딩이 유지됩니다 |
| 문의 데모 폼 `enquiryForm` | 보존되었습니다 | `demo.astro:10`과 `contact.astro:11`이 `enquiryForm('')`을 사용합니다. 라벨과 오류 3개, 입력 시 `clear` 해제, 성공 제목의 접수되었습니다 문구가 유지됩니다. 데모 첫 `input[type=text]`가 회사명입니다 |
| 요금 주문 확인 다이얼로그 | 보존되었습니다 | `pricing.astro:55`의 `x-data`가 `plans`, `selected`, `choose`, `closeOrder`를 유지합니다. `dialog`의 `x-ref="order"`, `aria-labelledby="order-title"`, `h2#order-title`, 세 번째 `dd` 결제 금액 구조가 유지됩니다. 두 번째 계획이 500포인트입니다 |

---

## 3. 지적 사항

심각도는 `critical`, `major`, `minor`로 표기합니다. 모든 지적은 읽은 파일에만 근거합니다.

### MAJOR-1 균등 3카드 그리드가 요금 페이지에 남았습니다

- **파일 경로**: `src/pages/bidbox/pricing.astro:59`
- **잘못된 점**: 기준 문서 5.1장에서 요금 구조를 가로 행으로 정하였습니다. 강조안은 왼쪽 막대로 표시하도록 정하였습니다. 현재 코드는 `md:grid-cols-3` 균등 3열 카드로 렌더합니다. 회사 01-03과 BIDBOX 기능은 행으로 바뀌었으므로 요금만 이전 리듬이 남았습니다.
- **필요한 수정**: 요금 목록을 `rows` 행 구조로 변경해 주십시오. 강조안은 면 전체 채움이 아니라 `rate-bar` 왼쪽 막대로 표시해 주십시오. `plans` 스키마와 버튼 순서, 다이얼로그 제목 구조는 그대로 유지해 주십시오.

### MAJOR-2 제거되어야 할 `eyebrow` 클래스가 요금 데모 문의 페이지에 남았습니다

- **파일 경로**: `src/pages/bidbox/pricing.astro:27`, `src/pages/bidbox/pricing.astro:42`, `src/pages/bidbox/pricing.astro:57`, `src/pages/bidbox/pricing.astro:117`, `src/pages/bidbox/demo.astro:14`, `src/pages/bidbox/contact.astro:15`, `src/pages/bidbox/contact.astro:27`, `src/pages/bidbox/contact.astro:35`
- **잘못된 점**: `src/styles/global.css:121-128`에는 `.label`만 정의되어 있고 `.eyebrow` 정의가 없습니다. 해당 페이지들이 여전히 `eyebrow`를 사용하므로 작은 키커 스타일이 적용되지 않습니다. 기준 문서가 지적한 대문자 키커 반복 제거 취지와도 어긋납니다.
- **필요한 수정**: 위 경로의 `eyebrow`를 `label`로 교체해 주십시오. 문구를 새로 만들지 말고 기존 한글 문구를 그대로 유지해 주십시오.

### MAJOR-3 페이지 `style`과 데이터에 토큰 밖 색상 리터럴이 남았습니다

- **파일 경로**: `src/pages/bidbox/pricing.astro:158`, `src/pages/bidbox/demo.astro:22`, `src/pages/bidbox/demo.astro:36`, `src/pages/bidbox/demo.astro:87-88`, `src/pages/bidbox/contact.astro:47`, `src/pages/bidbox/contact.astro:85-86`, `src/data/site.ts:44`, `src/data/site.ts:48`, `src/data/site.ts:53`
- **잘못된 점**: 기준 문서 5.3장에서 페이지 `style`의 색상을 `:root` 토큰으로 되돌리도록 정하였습니다. 현재 코드에 `rgba` 면 색상과 `#B8DDF0` 선 색상 리터럴이 남았습니다. 체크 아이콘 `stroke`와 오류 안내 배경이 토큰을 참조하지 않습니다. `capabilities.icon` 문자열의 선 색상도 `currentColor`가 아닙니다.
- **필요한 수정**: 옅은 면은 `var(--bb-accent-soft)`로 교체해 주십시오. 악센트 선은 `var(--bb-accent)` 또는 `currentColor`로 교체해 주십시오. 오류 면과 오류 글자는 `var(--danger)`와 `var(--danger-ink)`로 교체해 주십시오. `capabilities.icon` 필드는 유지하되 선 색상은 `currentColor`로 변경해 주십시오. 새로운 16진 값을 만들지 말고 `:root`에 있는 변수만 사용해 주십시오.

### MINOR-1 문의 페이지 적층 구조가 데모와 구분되지 않습니다

- **파일 경로**: `src/pages/bidbox/contact.astro:12`, `src/pages/bidbox/demo.astro:11`
- **잘못된 점**: 기준 문서 5.1장에서 데모는 좁은 설명 열과 넓은 신청서 열로, 문의는 제목 아래 연락처 시트 후 좁은 문의 폼 적층으로 구분하도록 정하였습니다. 현재 두 페이지가 모두 좌우 2열 그리드로 구성되어 구분이 약합니다.
- **필요한 수정**: 문의 페이지를 상하 적층으로 변경해 주십시오. 상단에 연락처 시트를 두고 하단에 좁은 폼을 두어 주십시오. 기존 `card`, `rows`, `field` 클래스를 재사용하고 폼 필드 순서와 `id`는 변경하지 마십시오.

### MINOR-2 카드 인라인 배경에 합성 색상 리터럴이 남았습니다

- **파일 경로**: `src/pages/bidbox/demo.astro:36`, `src/pages/bidbox/contact.astro:43`
- **잘못된 점**: 폼 카드에 인라인 합성 배경이 지정되어 있습니다. `global.css`의 `.card`와 `reg-dark` 면 정의와 중복되며 토큰 단일 소스 원칙에서 벗어납니다.
- **필요한 수정**: 인라인 배경을 제거하고 `.card` 정의를 그대로 사용해 주십시오. 테두리 색상은 `var(--bb-border)`를 유지해 주십시오.

### MINOR-3 기준 문서의 요금 히어로 서술과 현재 코드 구조가 일치하지 않습니다

- **파일 경로**: `docs/design/HALLMARK_REDESIGN.md:91`, `src/pages/bidbox/pricing.astro:25-36`
- **잘못된 점**: 문서 찾기에 대한 지적입니다. 문서는 요금 히어로를 왼쪽 제목과 오른쪽 단가로 정하였습니다. 현재 코드는 히어로에 제목과 설명만 있고 단가는 아래 별도 카드에 있습니다. 코드가 틀렸다기보다 문서의 구조 이름과 코드의 단락 나눔이 일치하지 않아 검토자가 같은 구조로 읽을 수 없습니다.
- **필요한 수정**: 문서를 고치거나 코드를 고치는 선택을 하나로 정해 주십시오. 문서를 유지한다면 요금 히어로를 좌우 분할로 수정해 주십시오. 코드를 유지한다면 문서 5.1장의 요금 행을 히어로 단독과 단가 카드 분리로 다시 서술해 주십시오. 어느 쪽도 카피와 라우트를 변경하지 마십시오.

---

## 4. 문서 지적과 코드 지적의 구분

| 구분 | 해당 지적 |
| --- | --- |
| 문서에 대한 지적 | MINOR-3만 문서 서술에 대한 지적입니다 |
| 코드에 대한 지적 | MAJOR-1, MAJOR-2, MAJOR-3, MINOR-1, MINOR-2는 읽은 소스에 대한 지적입니다 |

기준 문서 자체는 금지 행위 위반이 없습니다. 한국어 존댓말로 작성되었고 이모지가 없습니다. React와 새 패키지, 서버, 새 Alpine 동작을 제안하지 않습니다. 실측 수치를 단정하지 않고 `docs/context/CURRENT_STATE.md`를 정본으로 가리킵니다. 모바일 메뉴 DOM에서 `x-transition` 금지를 명시하여 `docs/ops/DO_NOT_REPEAT.md` 1.1항과 일치합니다.

---

## 5. 열린 문제 수

| 심각도 | 개수 |
| --- | --- |
| critical | 0건 |
| major | 3건 |
| minor | 3건 |

`critical`은 없습니다. 모바일 메뉴와 폼, 다이얼로그 계약이 유지되므로 병합을 막는 파손은 확인되지 않았습니다. `major` 3건은 요금 행 구조, `label` 클래스, 토큰 밖 색상 정리이며 기준 문서의 핵심 목표와 직접 연결됩니다. `minor` 3건은 문의 적층 구분, 카드 배경 정리, 문서 서술 일치입니다.

---

## 6. 검증 여부와 다음 행동

수행한 검증은 파일 열람뿐입니다. `npm run verify`는 제약에 따라 실행하지 않았으므로 빌드와 링크 무결성, 렌더와 콘솔 오류, 스타일 실측, 반응형과 접근성, 인터랙션 결과는 확인하지 못하였습니다. 다음 행동은 빌더 소유이며 검토 범위가 아닙니다.

1. MAJOR-1부터 MAJOR-3까지 수정 후 `npm run verify`로 확인해 주십시오.
2. 검증 출력으로만 `docs/context/CURRENT_STATE.md` 정본을 갱신해 주십시오.
3. MINOR-1과 MINOR-2, MINOR-3 중 문서와 코드 중 하나를 선택하여 일치시켜 주십시오.
