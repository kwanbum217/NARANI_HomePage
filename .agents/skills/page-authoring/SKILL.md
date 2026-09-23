---
name: page-authoring
description: 새 페이지를 추가하는 절차입니다. 레이아웃 선택, 내비 등록, 검증 목록 갱신까지 포함합니다. 페이지를 새로 만들 때 사용합니다.
---

# page-authoring

## 절차

### 1. 명세 먼저

[`docs/spec/PAGE_SPEC.md`](../../docs/spec/PAGE_SPEC.md) 에 항목을 추가합니다.
아래를 정합니다.

- 라우트
- 레지스터(`nani` 또는 `bidbox`)
- 목적과 대상
- 섹션 순서와 카피
- 상태(기본, 로딩, 오류, 성공)
- 수용 기준

명세 없이 마크업을 쓰지 않습니다.

### 2. 페이지 파일 생성

`src/pages/` 아래에 만듭니다. 라우트 형식은 `directory` 이므로 폴더 이름이 URL 이
됩니다.

```
src/pages/guide/index.astro      ->  /guide/
src/pages/bidbox/faq.astro       ->  /bidbox/faq/
```

기본 형태:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { brand } from '../../data/site';
---

<BaseLayout
  title="페이지 제목"
  description="검색 결과와 공유 카드에 쓰일 한 문장"
  variant="bidbox"
  active="faq"
>
  <section class="navy-field">
    <div class="wrap pb-[clamp(40px,6vw,72px)] pt-[clamp(52px,8vw,96px)]">
      <p class="eyebrow" style="color:var(--bb-accent)">라벨</p>
      <h1 class="display mt-5 max-w-[24ch] text-[clamp(1.9rem,4.6vw,3.4rem)]">제목</h1>
      <p class="lede mt-6">도입 문단</p>
    </div>
  </section>
</BaseLayout>
```

### 3. 레지스터 확인

| 레지스터 | 페이지 배경 | 히어로 클래스 |
| --- | --- | --- |
| nani | 자동(`body` 에 클래스 없음) | `warm-field` |
| bidbox | 자동(`body.reg-dark`) | `navy-field` |

배경을 페이지에서 다시 칠하지 않습니다.

### 4. 내비 등록

내비에 노출할 페이지면 `src/data/site.ts` 에 항목을 추가합니다. `key` 는 페이지의
`active` 속성과 같아야 `aria-current` 가 붙습니다.

### 5. 반복 카피 승격

같은 문장이 두 곳 이상에서 쓰이면 `src/data/` 로 올립니다. 판단 기준은
[`docs/spec/CONTENT_MODEL.md`](../../docs/spec/CONTENT_MODEL.md) 1장입니다.

### 6. 검증 목록에 추가

`scripts/verify.sh` 의 `PAGES` 와 `NARROW` 배열에 새 라우트를 넣습니다.
목록에 없으면 검증되지 않습니다.

### 7. 검증

```bash
npm run verify
```

## 체크리스트

- [ ] 명세 문서에 항목 추가
- [ ] `BaseLayout` 사용, `title`/`description` 작성
- [ ] 레지스터가 페이지 전체에서 일관됨
- [ ] `h1` 이 페이지에 1개
- [ ] 랜드마크(`header`, `main`, `footer`) 유지
- [ ] 폼이 있으면 라벨과 오류 상태 구현
- [ ] 내비 등록과 `active` 키 일치
- [ ] 반복 카피를 데이터로 승격
- [ ] `scripts/verify.sh` 목록 갱신
- [ ] `npm run verify` 통과

## 함정

- `.astro` 에서 `{` `}` 는 표현식입니다. CSS 나 JS 리터럴을 그대로 넣지 않습니다.
- Tailwind important 는 접미사입니다(`p-0!`). 접두사(`!p-0`)는 무효입니다.
- 모바일 메뉴에 `x-transition` 을 붙이지 않습니다.
  [`../../docs/ops/DO_NOT_REPEAT.md`](../../docs/ops/DO_NOT_REPEAT.md) 참조
