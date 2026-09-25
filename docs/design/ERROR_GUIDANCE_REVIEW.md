# 오류 안내 반영 검토

> 작성일: 2026-09-25 / 버전: v1.0.0 / 상태: 확정
> 검토 세션: Muse Spark 1.3

---

## 1. 개요

본 문서는 `feat/오류-안내` 분기에 반영된 코드를 대상으로 한 확인 검토입니다.
아직 반영되지 않은 공백을 찾는 검토가 아니라, 이미 반영된 편집이 요구 조건을 만족하는지를 확인합니다.
이메일 주소, 폼 전송 방식, 호스팅 설정은 검토 범위에서 변경하지 않으셨습니다.

검토 대상은 다음 네 파일에 한정합니다.

| 파일 | 검토 항목 |
| --- | --- |
| `src/layouts/BaseLayout.astro` | 조직 로고 절대 경로, 이메일 미포함, 기존 노드 유지 |
| `src/pages/bidbox/contact.astro` | 오류 문단 알림 속성, 기본 이름 오류 메시지 유지 |
| `src/pages/bidbox/demo.astro` | 회사명 오류 메시지 전달, 오류 문단 알림 속성, 관심 공고 선택 유지 |
| `src/scripts/app.js` | 기본 메시지, 포커스 이동, 전송 시뮬레이션 유지 |

---

## 2. 항목별 확인 결과

### 2.1 `src/layouts/BaseLayout.astro`

조직 로고는 `Astro.site` 기준으로 `/favicon-nani.svg`의 절대 경로를 생성하고 있습니다.

- `src/layouts/BaseLayout.astro:26`에서 `new URL('/favicon-nani.svg', Astro.site).href`를 `logo`로 사용하고, `src/layouts/BaseLayout.astro:35`에서 조직 노드의 `logo`에 전달하셨습니다. 요구 조건을 만족합니다.
- 구조화 데이터 전체(`src/layouts/BaseLayout.astro:28-44`)에 이메일 문자열이 포함되어 있지 않습니다. 요구 조건을 만족합니다.
- `WebSite` 노드(`src/layouts/BaseLayout.astro:38-42`)가 회사명과 사이트 주소로 유지되어 있습니다. 요구 조건을 만족합니다.
- 파비콘 연결(`src/layouts/BaseLayout.astro:67`)이 기존 분기(`bidbox` 여부)를 그대로 유지하고 있습니다. 요구 조건을 만족합니다.

판정: 지적 사항 없음.

### 2.2 `src/pages/bidbox/contact.astro`

문의 폼의 오류 안내 방식을 확인하였습니다.

- `src/pages/bidbox/contact.astro:65`의 `c-name-error`, `src/pages/bidbox/contact.astro:74`의 `c-email-error`, `src/pages/bidbox/contact.astro:84`의 `c-message-error`에 모두 `aria-live="polite"`가 설정되어 있습니다. 세 문단 조건을 만족합니다.
- `src/pages/bidbox/contact.astro:11`에서 `enquiryForm('')`을 호출하고 `nameError`를 전달하지 않으셨습니다. 따라서 이름 미입력 시 기본 메시지인 `성함을 입력해 주세요.`가 유지됩니다. 요구 조건을 만족합니다.

판정: 지적 사항 없음.

### 2.3 `src/pages/bidbox/demo.astro`와 `src/scripts/app.js`

데모 신청 폼과 공용 폼 동작을 함께 확인하였습니다.

- `src/pages/bidbox/demo.astro:10`에서 `enquiryForm('', { nameError: '회사명을 입력해 주세요.' })`를 전달하셨습니다. 데모 전용 메시지 조건을 만족합니다.
- `src/scripts/app.js:37-40`에서 `nameError`가 없을 때의 기본값이 `성함을 입력해 주세요.`로 유지되고 있습니다. 문의 폼과의 구분 조건을 만족합니다.
- `src/pages/bidbox/demo.astro:55`의 `d-company-error`, `src/pages/bidbox/demo.astro:64`의 `d-email-error`, `src/pages/bidbox/demo.astro:80`의 `d-message-error`에 모두 `aria-live="polite"`가 설정되어 있습니다. 세 문단 조건을 만족합니다.
- 관심 공고 입력 영역(`src/pages/bidbox/demo.astro:67-72`)은 유효성 class와 오류 문단이 없으며, `src/scripts/app.js:35-48`의 검증 과정에서도 `topic`을 검사하지 않으셨습니다. 선택 입력 유지 조건을 만족합니다.
- 오류 발생 시 첫 번째 오류 입력으로 포커스를 이동하는 처리가 `src/scripts/app.js:54-57`에 유지되어 있습니다. 요구 조건을 만족합니다.
- 전송처가 비어 있을 때 900밀리초 대기 후 완료 처리하는 시뮬레이션이 `src/scripts/app.js:70`에 유지되어 있습니다. 요구 조건을 만족합니다.

판정: 지적 사항 없음.

---

## 3. 발견 사항

이번 반영 검토에서 `critical`, `major`, `minor`에 해당하는 지적 사항은 확인되지 않았습니다.
아래 양식은 지적 사항이 있을 경우에만 사용하시면 됩니다.

- 심각도: `critical` / `major` / `minor` 중 하나를 기재합니다.
- 파일 경로: 문제가 있는 파일과 위치를 기재합니다.
- 문제 내용: 현재 코드가 요구 조건과 어떻게 다른지 기재합니다.
- 필요한 수정: 요구 조건을 만족하기 위해 필요한 수정을 기재합니다.

현재는 해당 양식으로 기록할 항목이 없습니다.

---

## 4. 심각도별 집계

| 심각도 | 건수 |
| --- | --- |
| critical | 0건 |
| major | 0건 |
| minor | 0건 |
| 합계 | 0건 |

---

## 5. 결론

요구하신 네 파일의 반영 내용은 모두 조건을 만족하고 있습니다.
추가 수정이 필요한 항목은 없으며, 본 검토는 `Muse Spark 1.3` 세션에서 작성되었습니다.
