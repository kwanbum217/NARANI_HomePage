# 기각·반복 금지 목록

> **작성일**: 2026-09-23
> **버전**: v1.0.0
> **목적**: 이미 실패한 접근과 함정을 기록합니다. 재시도 전에 이 문서를 확인합니다.
> 요약된 금지 항목은 [`../../AGENTS.md`](../../AGENTS.md) 7장에 있고, 이 문서는 근거를
> 담습니다.

---

## 1. Alpine 관련

### 1.1 `x-cloak` + `x-show` + `x-transition` 동시 사용 금지

**증상**: 모바일 메뉴가 반대로 동작했습니다. 여는 클릭에서 `display: none` 이 유지되고,
닫는 클릭에서 `display: block` 이 되었습니다.

**실측 근거**: `/company/` 를 390px 로 렌더한 뒤 헤더 버튼을 클릭하고 상태를 수집한 결과입니다.

```json
[
  { "tag": "t0",             "inline": "display: none",  "aria": "false" },
  { "tag": "click1+500ms",   "inline": "display: none; opacity: 0", "aria": "true" },
  { "tag": "click1+1400ms",  "inline": "display: none; opacity: 0", "aria": "true" },
  { "tag": "click2+500ms",   "inline": "display: block; opacity: 1", "aria": "false" }
]
```

**원인**: 전환 모듈이 요소의 원래 `display` 를 캐시하는데, 캐시 시점에 `x-cloak` 규칙이
`display: none !important` 를 적용하고 있어 `none` 이 원래 값으로 기록되었습니다. 이후
보이기 경로가 `display: none` 을 복원합니다.

**대응**: `x-cloak` 과 `x-show` 만 사용하고 `x-transition` 을 붙이지 않습니다. 현재
`Header.astro` 의 모바일 드로어가 이 방식입니다.

**검증**: `scripts/audit/checks/nav.js` 가 열기와 닫기의 `display` 와 `aria-expanded` 를
모두 확인합니다.

### 1.2 상태 바인딩 값에 `!` 를 쓰는 경우 주의

`x-show="!open"` 처럼 표현식에 느낌표가 들어갑니다. 마크업 전체를 일괄 치환할 때
`class` 속성 밖의 `!` 까지 건드리지 않도록 범위를 `class="..."` 로 한정해야 합니다.

---

## 2. Tailwind 관련

### 2.1 important 접두사 금지 (Tailwind 4)

| 표기 | 유효성 |
| --- | --- |
| `!p-0` | Tailwind 3 문법. Tailwind 4 에서 무효 |
| `p-0!` | Tailwind 4 문법 |

**배경**: 최초 마크업은 Tailwind 3 기준으로 작성되었고, Tailwind 4 로 옮기면서
`!` 접두사가 붙은 클래스 41건을 접미사 형태로 변환했습니다. 변환하지 않으면 해당
유틸리티가 생성되지 않아 조용히 무시됩니다.
변형 접두사가 붙은 형태(`sm:!p-8`)는 `sm:p-8!` 로 변환해야 합니다.

**검증**: `render.swift` 가 내비 CTA 높이 44px 를 측정하며, 허브 카드 패딩은 허브가 카드를 쓰지 않으므로([`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md)) 측정하지 않습니다.

### 2.2 Tailwind CDN 금지

`cdn.tailwindcss.com` 은 프로덕션 비권장이며 콘솔에 경고를 출력합니다. 빌드 시점
최적화가 없고 사용하지 않는 유틸리티가 전부 포함됩니다. 현재는 `@tailwindcss/vite`
플러그인으로 컴파일하며, 검증에서 콘솔 경고 0 을 확인합니다.

---

## 3. 프레임워크와 서버

### 3.1 React 등 UI 프레임워크 도입 기각

이 사이트의 클라이언트 인터랙션은 3개뿐입니다: 모바일 메뉴, 폼 상태, 요금 다이얼로그.
Alpine 으로 이미 구현되어 있으며 추가 런타임 없이 동작합니다. React 를 넣으면 얻는 것이
없고 번들 크기와 빌드 복잡도만 늘어납니다. 근거는
[`../design/ADR-0001-astro-static-marketing-site.md`](../design/ADR-0001-astro-static-marketing-site.md)
를 참조하십시오.

### 3.2 이 저장소에 서버 런타임 도입 기각

결제와 포인트 지급은 서버 상태가 필요하지만, 그 주체는 제품 본체(`refac_bid_box`)입니다.
마케팅 사이트가 서버를 갖게 되면 배포·보안·비용이 함께 늘고, 제품 본체와 인증과 DB 를
중복 보유하게 됩니다. 결제 버튼은 제품 본체의 결제 라우트로 이동시킵니다.

### 3.3 루트에 구 정적 HTML 을 남기는 것 금지

Astro 이관 후 루트의 `index.html`, `company/`, `bidbox/*.html`, `assets/` 를 삭제했습니다.
정적 호스팅에 프로젝트 폴더를 통째로 올리면 옛 버전이 서빙되어 새 사이트가 가려집니다.
배포 대상은 항상 `dist/` 입니다.

---

## 4. 검색과 도구 함정

### 4.1 `grep -r --include` 무음 누락

이 환경에서 다음 명령이 일치하는 항목이 있는데도 빈 결과를 반환했습니다.

```bash
grep -rohE 'pattern' "$DIR" --include=*.html     # 결과 없음
grep -ohE 'pattern' "$DIR"/*.html "$DIR"/*/*.html # 정상
```

**대응**: 파일 목록을 명시적으로 넘깁니다. 결과가 비어 나오면 검색 방식부터 의심합니다.

### 4.2 정규식 브래킷 안의 `]`

ERE 에서 `[a-zA-Z0-9_\[\]...]` 처럼 브래킷 안에 `\]` 를 쓰면 브래킷이 조기에 닫혀 패턴이
깨집니다. `]` 를 브래킷에 포함하려면 첫 문자로 두거나, 브래킷 밖에서 처리합니다.

### 4.3 `read_file` 이후에만 덮어쓰기 가능

파일을 통째로 다시 쓰려면 먼저 해당 파일을 읽어야 합니다. 셸로 복사한 파일은 읽기
이력이 없으므로 읽은 뒤에 수정합니다.

---

## 5. 문서 관련

### 5.1 실측 수치를 여러 문서에 복사하지 않습니다

수치는 측정마다 바뀝니다. 복사본은 갱신 시점이 어긋나 잘못된 사실을 읽게 만듭니다.
정본은 [`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) 하나이며, 다른
문서는 링크로 가리킵니다. 이 규칙은 상위 저장소 `refac_bid_box` 에서 실제로 사고가 난
항목입니다.

### 5.2 문서에 판정 문구만 남기는 것도 위험합니다

"통과", "미달" 같은 판정도 갱신 대상입니다. 수치를 링크로 바꿨더라도 판정 문구가 남아
있으면 정본과 어긋납니다. 판정은 정본 문서에만 씁니다.

---

## 6. 카피와 마크업

### 6.1 브랜드 문자열을 페이지에 직접 쓰지 않습니다

이메일, 회사명, 회사 기준 문구는 `src/data/site.ts` 에만 존재해야 합니다. 최초 구현에서
이메일이 문의 페이지와 폼 오류 안내에 각각 하드코딩되어 있었고, 한쪽만 바뀌면 조용히
불일치가 생기는 상태였습니다.

### 6.2 이모지 금지

코드, 주석, 커밋 메시지, 문서 어디에도 쓰지 않습니다.
`scripts/check-no-emoji.mjs` 가 추적 대상 텍스트 파일을 검사합니다.

### 6.3 죽은 링크 금지

`href="#"` 나 실제로 존재하지 않는 경로를 남기지 않습니다. `scripts/check-links.mjs` 가
`dist/` 전체를 검사합니다.

---

## 7. 폼 관련

### 7.1 제출 버튼을 유효성으로 비활성화하지 않습니다

비활성 버튼은 사용자가 무엇을 고쳐야 하는지 숨깁니다. 버튼은 활성으로 두고 제출 시
검증하며, 실패한 필드에 이유를 표시합니다.

### 7.2 입력한 필드의 오류는 즉시 해제합니다

오류를 다음 제출까지 남겨 두면, 사용자가 이미 고친 필드에 빨간 표시가 남아 혼란을
줍니다. `enquiryForm.clear(field)` 가 입력 이벤트에서 해당 오류를 제거합니다.

---

## 8. Orca 워커

### 8.1 cmd 워커를 `worker-start` 로 띄우지 않습니다

**증상**: `--agent cmd` 는 `agent_unconfigured`, `--agent command-code` 는 `agent_readiness`
시간 초과로 실패했습니다. 같은 Task 가 세 번 실패해 circuit-break 되었습니다.

**원인**: Orca 가 command-code 에 기동 시 준비 신호를 보내는 훅을 설치하지 않습니다.

**대응**: `terminal create` + `dispatch --inject` 경로만 씁니다. 절차는
[`ORCA_WORKERS.md`](ORCA_WORKERS.md) 3장입니다.

### 8.2 cmd 워커 명령에 파이프를 붙이지 않습니다

**증상**: 허용 규칙을 넣은 뒤에도 `orca terminal wait ... | python3 -c ...` 가
`Create Unsafe Agents` 로 거부되었습니다. `orca` 단독 명령은 통과했습니다.

**원인**: 명령 일부가 허용 규칙을 벗어나면 전체가 자동 모드 분류기로 넘어갑니다.

**대응**: [`ORCA_WORKERS.md`](ORCA_WORKERS.md) 4.1 을 따릅니다.
