---
name: brand-refresh
description: 로고, 색, 회사명, 연락처, 내비게이션을 단일 소스에서 일괄 갱신하고 검증합니다. 브랜드가 바뀌거나 회사 정보가 변경되었을 때 사용합니다.
---

# brand-refresh

브랜드 변경은 여러 파일에 흩어진 값을 동시에 고쳐야 하는 작업입니다. 이 저장소는
값을 단일 소스에 모아 두었으므로, 페이지를 열지 않고 갱신할 수 있습니다.

## 언제 쓰는가

- 회사명, 제품명, 태그라인, 푸터 문구가 바뀌었다
- 로고 마크가 바뀌었다
- 브랜드 색이 바뀌었다
- 이메일, 내비게이션 항목이 바뀌었다
- 요금이 바뀌었다

## 고치는 곳

| 바뀌는 것 | 파일 | 확인 |
| --- | --- | --- |
| 회사명, 제품명, 푸터 문구, 이메일 | `src/data/site.ts` 의 `brand` | 푸터와 OG 사이트명에 반영 |
| 내비 항목 | `src/data/site.ts` 의 `siteNav`, `productNav` | 데스크톱과 모바일 드로어에 동시 반영 |
| 주 행동 버튼 | `src/data/site.ts` 의 `primaryCta` | 헤더 우측과 드로어 하단 |
| 로고 마크 | `src/components/Logo.astro` | 두 variant 모두 |
| 파비콘 | `src/layouts/BaseLayout.astro` 의 `favicon` | variant 별 분기 |
| 색 | `src/styles/global.css` 의 `:root` | 라이트는 `--nani-*`, 다크는 `--bb-*` |
| 금액, 요금제 | `src/data/pricing.ts` | 요금 페이지가 빌드 타임에 렌더 |
| 특화 분야 등 반복 문구 | 사용처 2곳 이상이면 `src/data/` 로 승격 | `docs/spec/CONTENT_MODEL.md` |

## 절차

1. 바꾸려는 값이 이미 단일 소스에 있는지 검색합니다. 페이지에 하드코딩된 복사본이
   있으면 먼저 승격합니다.

   ```bash
   grep -n "surport@narani.my" src/data/site.ts src/pages/*.astro src/pages/*/*.astro src/components/*.astro
   ```

2. 위 표에 따라 값을 고칩니다.
3. 색을 바꿨다면 대비를 확인합니다. 본문은 4.5:1 이상이어야 합니다.
   `npm run verify` 가 라이트/다크 대비를 출력합니다.
4. 검증합니다.

   ```bash
   npm run verify
   ```

5. [`../../docs/design/BRAND.md`](../../docs/design/BRAND.md) 와
   [`../../docs/design/DESIGN_SYSTEM.md`](../../docs/design/DESIGN_SYSTEM.md) 의 값 표를
   갱신합니다.
6. 실측 수치는 [`../../docs/context/CURRENT_STATE.md`](../../docs/context/CURRENT_STATE.md)
   의 기준선 표를 갱신합니다. 다른 문서에는 수치를 복사하지 않습니다.

## 하지 않는 것

- 페이지 마크업에 로고나 브랜드 문자열을 복사하지 않습니다.
- 색상 16진수를 페이지에 직접 쓰지 않습니다.
- 로고 변경 시 `docs/design/BRAND.md` 의 마크 의미(나란한 두 기둥)를 무시하지 않습니다.

## 완료 조건

- `npm run verify` 통과
- 7개 페이지 푸터와 헤더가 새 값으로 표시됨
- 대비가 하한 이상
- 문서 표가 실제 값과 일치
