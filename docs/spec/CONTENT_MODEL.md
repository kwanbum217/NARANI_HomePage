# 콘텐츠 모델

> **작성일**: 2026-09-23
> **버전**: v1.0.0
> **정본 위치**: `src/data/site.ts`, `src/data/pricing.ts`
> 브랜드·요금·내비를 바꿀 때 여기만 고치면 됩니다. 페이지 파일을 열기 전에 이 문서를
> 먼저 확인합니다.

---

## 1. 원칙

1. **두 곳 이상에서 쓰이는 값은 데이터 모듈로 올립니다.** 페이지에 같은 문장이 두 번
   등장하면 그것은 버그입니다.
2. **한 번만 쓰이는 문장은 페이지에 둡니다.** 재사용되지 않는 카피를 데이터로 올리면
   추적이 어려워집니다.
3. **금액은 절대 페이지에 쓰지 않습니다.**
4. **내비게이션 링크를 페이지에 직접 쓰지 않습니다.**
5. 데이터 모듈은 타입을 명시합니다. 오타와 누락을 빌드 시점에 잡기 위함입니다.

---

## 2. `src/data/site.ts`

### 2.1 `brand`

브랜드 문자열의 단일 소스입니다.

| 필드 | 타입 | 쓰이는 곳 |
| --- | --- | --- |
| `company` | `string` | 푸터 저작권, OG 사이트명, 로고 기본값 |
| `product` | `string` | 허브 카드, 제품 표기 |
| `productFooter` | `string` | 제품 푸터 접두어 |
| `footerNote` | `string` | 푸터 기준 문구 |
| `email` | `string` | 문의 페이지 `mailto`, 폼 오류 안내 |

### 2.2 내비게이션

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `siteNav` | `NavItem[]` | 회사 표면 내비. 회사소개, BIDBOX |
| `productNav` | `NavItem[]` | 제품 표면 내비. 서비스, 요금, 데모 신청, 문의 |
| `primaryCta.demo` | `{ label, href }` | 회사 표면의 주 행동 |
| `primaryCta.program` | `{ label, href }` | 제품 표면의 주 행동 |

`NavItem` 은 `{ key, label, href }` 입니다. `key` 는 `aria-current="page"` 판정에 쓰이므로
페이지의 `active` 속성과 일치해야 합니다.

링크는 루트 기준 절대 경로(`/bidbox/service/`)로 씁니다. Astro 는 `directory` 형식으로
빌드하므로 각 페이지의 실제 URL 은 후행 슬래시를 포함합니다.

### 2.3 `capabilities`

핵심 기능 3종. 랜딩과 서비스 페이지가 공유합니다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `title` | `string` | 기능 이름 |
| `body` | `string` | 한 문장 설명 |
| `icon` | `string` | SVG 내부 마크업. 서비스 페이지에서 `set:html` 로 주입 |

`icon` 을 데이터에 둔 이유는 아이콘과 문구가 항상 함께 바뀌기 때문입니다. 아이콘만
마크업에 남기면 순서가 어긋날 수 있습니다.

---

## 3. `src/data/pricing.ts`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `pointRate` | `number` | 1포인트 단가. 원 단위 |
| `POINT_NOTE` | `string` | 재조회 차감 유의 문구 |
| `plans` | `Plan[]` | 요금제 목록 |

`Plan`:

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `string` | Alpine 이 선택을 식별하는 키 |
| `points` | `number` | 포인트 수량 |
| `label` | `string` | `500포인트` 형식의 표시명 |
| `price` | `number` | 실제 결제 금액(원) |
| `listPrice` | `number \| null` | 할인 전 금액. 할인이 없으면 `null` |
| `note` | `string` | 대상 설명 |
| `featured` | `boolean?` | 강조 카드 여부 |

포인트당 단가는 `price / points` 로 파생합니다. 별도 필드로 두지 않습니다.

### 요금제 수정 예

```ts
// src/data/pricing.ts
export const plans: Plan[] = [
  { id: 'p100', points: 100, label: '100포인트', price: 100_000, listPrice: null, note: '가볍게 시작하기' },
  // ...
];
```

수정 후 `npm run verify` 를 실행하면 요금 카드 개수와 다이얼로그 금액이 검증됩니다.

---

## 4. 데이터에 두지 않는 것

| 대상 | 두는 곳 | 이유 |
| --- | --- | --- |
| 페이지 고유 서사 문단 | 각 페이지 `.astro` | 재사용되지 않음 |
| 섹션 제목 | 각 페이지 `.astro` | 페이지 구조의 일부 |
| SVG 아이콘(기능 외) | 컴포넌트 또는 페이지 | 해당 위치 전용 |
| 레이아웃 클래스 | 마크업 | 표현이며 콘텐츠가 아님 |

---

## 5. 수정 절차

1. 바꾸려는 값이 이미 데이터 모듈에 있는지 먼저 검색합니다.

   ```bash
   grep -n "surport" src/data/site.ts
   ```

2. 데이터 모듈에 있으면 그 값만 고칩니다.
3. 없는데 두 곳 이상에서 쓰인다면 필드를 추가하고 사용처를 배선합니다.
4. 마크업에 값을 직접 쓴 경우, 왜 데이터로 올리지 않았는지 판단합니다.
5. `npm run verify` 를 실행합니다.

---

## 6. 검색 함정

이 환경에서 `grep -r --include` 조합이 결과를 조용히 누락하는 사례가 확인되었습니다.
파일 목록을 명시적으로 넘기는 방식을 권장합니다.

```bash
# 권장
grep -n "b8ddef" src/styles/global.css src/components/*.astro src/pages/*.astro src/pages/*/*.astro

# 결과가 비어 나오면 위 방식을 시도
grep -rn --include='*.astro' "b8ddef" src
```

관련 기록은 [`../ops/DO_NOT_REPEAT.md`](../ops/DO_NOT_REPEAT.md) 를 참조하십시오.
