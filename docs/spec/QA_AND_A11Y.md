# 검증과 접근성

> **작성일**: 2026-09-23
> **버전**: v1.0.0
> **도구 위치**: `scripts/verify.sh`, `scripts/audit/`, `scripts/check-links.mjs`
> 기준선 수치의 정본은 [`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) 입니다.

---

## 1. 실행

```bash
npm run verify
```

`scripts/verify.sh` 는 다음 8단계를 순서대로 수행하고, 실패 시 종료 코드 1 을 반환합니다.

```mermaid
flowchart LR
  A["1 타입 체크<br/>astro check"] --> B["2 빌드<br/>astro build"]
  B --> C["3 서빙<br/>dist, 127.0.0.1 (자동 배정 포트)"]
  C --> D["4 링크 무결성<br/>check-links.mjs"]
  D --> E["5 렌더<br/>render.swift"]
  E --> F["6 폰트 서브셋<br/>check-font-subset.swift"]
  F --> G["7 반응형·접근성<br/>a11y.swift"]
  G --> H["8 인터랙션<br/>interact.swift"]
```

---

## 2. 단계별 의미와 실패 기준

| 단계 | 검사 내용 | 실패 기준 |
| --- | --- | --- |
| 1 타입 체크 | `astro check` (`--tsconfig tsconfig.json`) | 에러 1건 이상 |
| 2 빌드 | Astro 정적 빌드 | 빌드 오류 |
| 3 dist 서빙 | `dist/` 를 로컬 HTTP 로 제공. 포트 자동 배정 | 기동 실패, 포트 이미 점유됨 |
| 4 링크 무결성 | 모든 `href`/`src` 의 대상 실존. 그리고 `sitemap.xml` 과 실제 페이지 대조 | 깨진 참조, 색인 누락, 죽은 주소, canonical 불일치 1건 이상 |
| 5 렌더 | 8개 페이지 WebKit 렌더, 콘솔 수집, 스타일 실측, 스크린샷 | 콘솔 오류 1건 이상, 실측이 기준선과 불일치 |
| 6 폰트 서브셋 | self-host 폰트에 빌드가 그리는 문자가 모두 있는지 | 서브셋 밖 문자 1개 이상 |
| 7 반응형·접근성 | 320px 문서 오버플로우, 라벨 누락 | 문서 오버플로우 또는 라벨 누락 1건 이상 |
| 8 인터랙션 | 메뉴 토글, 폼 검증·전송, 요금 다이얼로그, prefill 4케이스, degrade 2폼 | 기대 상태 불일치 |

5단계와 7단계는 판정 출력의 마지막 줄을 검사합니다.

- `0 page(s) with JS errors`
- `0 issue group(s)`

8단계 항목은 2026-09-28 에 3개에서 9개로 늘었습니다. 추가한 항목과 그 한계는
아래와 같습니다.

| 항목 | 페이지 | 검사 내용 |
| --- | --- | --- |
| `prefill.js` | `/bidbox/contact/?plan=<실제 라벨>` | '주문 상품' 패널이 보이고 라벨·상품명·`role=status` 가 맞는지 |
| `prefill-reject.js` | 잘린 값·스크립트·숫자 3케이스 | 패널이 숨고 Alpine 상태에 값이 남지 않는지 |
| `fallback.js` | `/bidbox/contact/`, `/bidbox/demo/` | degrade 패널 구조, 주소·mailto·복사 버튼, 클릭 후 상태 전이 |

전제와 한계 두 가지가 있습니다.

첫째, degrade 검사에서 클립보드 **거절 분기 자체는 판정하지 않습니다.**
`127.0.0.1` 과 `localhost` 모두 `isSecureContext` 가 true 라 이 환경에서 거절을
만들 수 없습니다. 그래서 성공과 거절 어느 결과든 통과로 봅니다. 잡는 것은
"누르는데 라벨이 안 바뀐다"와 "mailto 가 사라진다"입니다.

둘째, 판정 근거는 전부 정본에서 파생합니다. 상품명·`mailto` 주소·버튼 라벨을
체크 스크립트에 하드코딩하면 정본 카피가 바뀌어도 옛 문구를 검사해 조용히
통과합니다. `scripts/audit/expected.mjs` 가 `src/data/` 에서 읽어 주입합니다.

plan 쿼리 URL 인코딩도 `expected.mjs` 가 합니다. 셸에서 만들면 `+` 가 공백으로
바뀌어 한글 라벨이 깨집니다.

---

## 3. 검증 도구

| 도구 | 역할 |
| --- | --- |
| `scripts/audit/render.swift` | 경로와 뷰포트를 받아 렌더. 배경색, 텍스트색, 명도 대비, 컴포넌트 치수, 요금 카드 수, 다이얼로그 존재, 푸터 문구, 콘솔 오류를 JSON 으로 출력하고 스크린샷을 저장 |
| `scripts/audit/a11y.swift` | 문서 오버플로우, 라벨 없는 입력, 작은 터치 타겟, `h1` 개수, `lang`, 이미지 `alt` 누락 검사 |
| `scripts/audit/interact.swift` | 페이지에서 임의의 JS 시나리오를 실행하고 `window.__it` 결과를 수집 |
| `scripts/audit/checks/*.js` | 인터랙션 시나리오. `nav.js`, `form.js`, `dialog.js` |
| `scripts/check-links.mjs` | `dist/` 전체 링크 무결성 |

도구는 macOS WebKit 을 사용합니다. PyObjC 없이 Swift PDFKit 과 WKWebView 로 동작하므로
macOS 또는 macOS 러너에서만 실행됩니다.

---

## 4. 접근성 하한

다음은 협상 대상이 아닙니다. 새 컴포넌트를 만들 때 함께 만족시킵니다.

| 항목 | 기준 |
| --- | --- |
| 본문 명도 대비 | 4.5:1 이상 |
| 포커스 표시 | 모든 대화형 요소에 점선 2px, 오프셋 3px. `outline: none` 단독 사용 금지 |
| 라벨 | 입력에 항상 보이는 라벨. placeholder 를 라벨로 쓰지 않음 |
| 터치 타겟 | 최소 44 x 44 px |
| 상태 전달 | 색만으로 전달하지 않음. 아이콘이나 텍스트를 동반 |
| 키보드 | 모든 흐름을 키보드만으로 완료 가능 |
| 줌 | 200% 확대와 320px 리플로우에서 레이아웃 유지 |
| 이미지 | 의미 있는 이미지에 `alt`. 장식이면 `aria-hidden` |
| 랜드마크 | 페이지당 `h1` 1개, `header`/`main`/`footer` 사용 |
| 언어 | `html lang="ko"` |

입력 필드의 글자 크기는 16px 이상을 유지합니다. iOS Safari 는 16px 미만 입력에서
자동 확대를 일으켜 레이아웃을 깨뜨립니다.

---

## 5. 알려진 함정

| 함정 | 대응 |
| --- | --- |
| 알파인 `x-cloak` + `x-show` + `x-transition` 동시 사용 | 전환이 반대로 동작합니다. 전환을 제거하거나 다른 방식으로 처리. [`../ops/DO_NOT_REPEAT.md`](../ops/DO_NOT_REPEAT.md) |
| 스크롤 컨테이너 내부 요소의 오버플로우 | 문서 폭을 밀지 않으므로 감사에서 제외해야 합니다. `a11y.swift` 가 조상의 `overflow-x` 를 확인합니다 |
| Tailwind 4 important 접두사 | `!p-0` 은 무효입니다. `p-0!` 를 씁니다 |
| `grep -r --include` 무음 누락 | 파일 목록을 명시적으로 넘깁니다 |

---

## 6. 검사를 추가하는 방법

새 인터랙션 시나리오는 다음 형식으로 추가합니다.

```js
// scripts/audit/checks/example.js
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rep = {};
  // ... 조작과 측정 ...
  window.__it = JSON.stringify(rep);
})();
```

`scripts/verify.sh` 의 8단계에 `"/경로/|1440x900|scripts/audit/checks/example.js"` 를
추가합니다.

새 페이지를 추가하면 `scripts/verify.sh` 의 `PAGES` 와 `NARROW` 배열에도 추가합니다.
목록에 없으면 검증되지 않습니다.

---

## 7. 검증 범위 밖

| 항목 | 이유 | 대체 수단 |
| --- | --- | --- |
| 실제 브라우저 3종(Chrome, Safari, Firefox) | 도구가 WebKit 단일 | 배포 전 육안 확인 |
| 스크린 리더 실제 동작 | 자동화 미구성 | VoiceOver 수동 점검 |
| 이미지 시각 품질 | 추출 세션이 이미지를 볼 수 없었음 | 담당자 육안 확인 |
| 폼 실제 전송 | 엔드포인트 미연결 | 연결 후 별도 검증 |
| 결제 | 미연결 | 제품 본체 연동 후 |
