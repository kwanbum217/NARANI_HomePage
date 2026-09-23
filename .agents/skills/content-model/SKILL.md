---
name: content-model
description: src/data/ 의 스키마를 바꾸고 페이지에 배선하는 절차입니다. 카피, 요금, 내비게이션, 반복 문구를 수정할 때 사용합니다.
---

# content-model

페이지에 흩어진 값을 데이터 모듈로 모으거나, 기존 데이터 모듈의 스키마를 바꾸는 작업입니다.

## 언제 쓰는가

- 요금이나 금액을 바꾼다
- 내비게이션 항목을 추가·삭제·이동한다
- 같은 문장이 두 페이지에 나타난다
- 데이터 모듈에 필드를 추가한다

## 승격 판단

| 상황 | 처리 |
| --- | --- |
| 두 곳 이상에서 같은 문장을 쓴다 | `src/data/` 로 승격 |
| 한 곳에서만 쓴다 | 페이지에 그대로 둠 |
| 금액이다 | 항상 `src/data/pricing.ts` |
| 내비 링크다 | 항상 `src/data/site.ts` |
| 브랜드 문자열이다 | 항상 `src/data/site.ts` 의 `brand` |

재사용되지 않는 카피를 억지로 데이터로 올리면 추적이 어려워집니다. 승격하지 않는 것이
옳은 경우도 있습니다.

## 필드 추가 절차

1. `src/data/site.ts` 또는 `src/data/pricing.ts` 에 타입과 함께 필드를 추가합니다.
2. 사용처를 배선합니다. Astro 에서는 `{값}` 으로 출력합니다.
3. 아이콘처럼 마크업이 필요한 값은 `set:html` 로 주입합니다.

   ```astro
   <svg width="22" height="22" viewBox="0 0 22 22" fill="none" set:html={capability.icon} />
   ```

4. 값이 두 곳 이상에서 쓰이면 그 사실을 주석 없이 코드로 드러냅니다. 같은 데이터를
   두 페이지가 함께 import 하면 중복이 사라진 것을 바로 확인할 수 있습니다.
5. 검증합니다.

   ```bash
   npm run verify
   ```

## 요금 변경 예

`src/data/pricing.ts` 의 `plans` 배열만 고칩니다. 페이지는 이 배열을 빌드 타임에
렌더하므로 마크업을 열 필요가 없습니다.

```ts
export const plans: Plan[] = [
  { id: 'p100', points: 100, label: '100포인트', price: 100_000, listPrice: null, note: '가볍게 시작하기' },
  { id: 'p500', points: 500, label: '500포인트', price: 450_000, listPrice: 500_000, note: '가장 많이 선택하는 구성', featured: true },
  { id: 'p1000', points: 1000, label: '1000포인트', price: 900_000, listPrice: 1_000_000, note: '예측을 자주 돌리는 팀' },
];
```

`price / points` 로 포인트당 단가가 파생됩니다. 단가를 따로 필드로 두지 않습니다.

## 스키마 표 갱신

필드를 추가하면 [`docs/spec/CONTENT_MODEL.md`](../../docs/spec/CONTENT_MODEL.md) 의
표에 함께 적습니다.

## 함정

- 검색이 필요하면 파일 목록을 명시적으로 넘깁니다. `grep -r --include` 가 조용히
  누락되는 사례가 있습니다.
- `.astro` 에서 `{` `}` 는 표현식입니다. JS 객체 리터럴을 속성값으로 넣을 때는
  문자열로 만들어 전달합니다(요금 페이지의 `dialogState` 참조).
