# 폼 오류 연결 착지분 리뷰

> **작성일**: 2026-09-25
> **버전**: v1.0.0
> **상태**: 착지 코드 검토. 갭 리뷰가 아닙니다.
> **대상 브랜치**: `feat/구조화-데이터`
> **사용 모델**: Muse Spark 1.3

---

## 1. 요약

본 세션이 Muse Spark 1.3임을 확인한 뒤 검토를 시작하였습니다. GLM 세션이 아닙니다.

이번 검토는 착지된 폼 오류 연결 세 건만을 대상으로 하며, 구현되지 않은 항목에 대한 갭 판정은 포함하지 않습니다. `src/pages/bidbox/contact.astro`의 오류 속성 바인딩, `src/pages/bidbox/demo.astro`의 오류 속성 바인딩과 관심 공고 필드 유지, `src/scripts/app.js`의 검증 실패 시 초점 이동을 직접 읽고 판정하였습니다.

판정 결과 세 가지 요구 조건이 모두 적합합니다. 기능상 문제는 없으며 표기 통일 관점의 minor 1건만 남깁니다. `npm` 명령과 검증 스크립트는 실행하지 않았으므로 빌드 산출물의 렌더와 링크 결과는 미검증으로 남깁니다.

---

## 2. 읽은 범위

| 구분 | 읽은 대상 | 용도 |
| --- | --- | --- |
| 코드 | `src/pages/bidbox/contact.astro:59-85` | 성명, 이메일, 문의내용의 오류 속성 바인딩과 오류 식별자 확인 |
| 코드 | `src/pages/bidbox/demo.astro:49-81` | 회사명, 이메일, 확인 내용의 바인딩과 관심 공고 필드 유지 확인 |
| 코드 | `src/scripts/app.js:35-55` | 검증 실패 분기의 초점 이동 확인 |
| 코드 | `src/scripts/app.js:35-44`, `src/scripts/app.js:56-80` | 검증 문구, 빈 엔드포인트 시뮬레이션, 초기화 유지 확인 |
| 참조 | `git diff`의 변경 목록 | 변경 범위와 라벨, 성공 패널의 무변경 확인 |

읽지 않은 파일에 대한 판정은 하지 않았습니다. 측정한 수치가 없으므로 수치에 대한 판정도 포함하지 않았습니다.

---

## 3. 항목별 판정

### 3.1 `contact.astro`의 오류 연결

적합합니다. 이 절은 코드를 읽은 소견입니다.

| 항목 | 근거 | 판정 |
| --- | --- | --- |
| 성명 바인딩 | `src/pages/bidbox/contact.astro:61-65`가 `aria-invalid`와 `aria-describedby`를 `c-name-error`에 연결합니다. | 통과 |
| 이메일 바인딩 | `src/pages/bidbox/contact.astro:70-74`가 같은 속성을 `c-email-error`에 연결합니다. | 통과 |
| 문의내용 바인딩 | `src/pages/bidbox/contact.astro:79-84`가 같은 속성을 `c-message-error`에 연결합니다. | 통과 |
| 라벨 유지 | `for`와 `id` 쌍(`c-name`, `c-email`, `c-message`)과 문구에 변경이 없습니다. | 통과 |
| 성공 패널 유지 | `문의가 접수되었습니다` 영역에 변경이 없습니다. | 통과 |

### 3.2 `demo.astro`의 오류 연결

적합합니다. 이 절은 코드를 읽은 소견입니다.

| 항목 | 근거 | 판정 |
| --- | --- | --- |
| 회사명 바인딩 | `src/pages/bidbox/demo.astro:51-55`가 같은 속성을 `d-company-error`에 연결합니다. | 통과 |
| 이메일 바인딩 | `src/pages/bidbox/demo.astro:60-64`가 같은 속성을 `d-email-error`에 연결합니다. | 통과 |
| 확인 내용 바인딩 | `src/pages/bidbox/demo.astro:76-80`가 같은 속성을 `d-message-error`에 연결합니다. | 통과 |
| 관심 공고 유지 | `src/pages/bidbox/demo.astro:67-72`가 선택 안내를 유지하며 오류 식별자와 오류 속성이 없습니다. | 통과 |
| 라벨과 성공 패널 유지 | `for`와 `id` 쌍과 `신청이 접수되었습니다` 영역에 변경이 없습니다. | 통과 |
| 표기 차이 | `aria-invalid` 표현식이 `contact.astro`와 다르며 동작은 동일합니다. 4장에 minor 1건으로 기록하였습니다. | 확인 |

### 3.3 `app.js`의 검증 실패 시 초점 이동

적합합니다. 이 절은 코드를 읽은 소견입니다.

| 항목 | 근거 | 판정 |
| --- | --- | --- |
| 초점 이동 | `src/scripts/app.js:48-54`가 검증 실패 시 다음 틱에서 `.field.is-invalid` 안의 첫 번째 `input` 또는 `textarea`에 초점을 옮기며, 대상이 없을 때를 대비한 조건이 있습니다. | 통과 |
| 검증 문구 유지 | `src/scripts/app.js:35-44`의 네 가지 문구에 변경이 없습니다. | 통과 |
| 빈 엔드포인트 시뮬레이션 유지 | `src/scripts/app.js:65-67`의 대기 처리에 변경이 없습니다. | 통과 |
| 초기화 유지 | `src/scripts/app.js:75-80`의 초기화에 변경이 없습니다. | 통과 |

### 3.4 검증 범위 고지

`npm` 명령과 검증 스크립트를 실행하지 않았습니다. 빌드 산출물의 렌더와 링크 무결성, 접근성과 인터랙션 결과는 미검증으로 남깁니다. 다음 착수 전에 `npm run verify`를 실행하시기 바랍니다.

---

## 4. 발견된 문제

| 심각도 | 파일 경로 | 문제 내용 | 필요한 수정 |
| --- | --- | --- | --- |
| critical | 해당 없음 | 해당 없음 | 해당 없음 |
| major | 해당 없음 | 해당 없음 | 해당 없음 |
| minor | `src/pages/bidbox/demo.astro:53`, `src/pages/bidbox/demo.astro:62`, `src/pages/bidbox/demo.astro:77` | `aria-invalid` 표현식이 `Boolean(errors.x).toString()` 형태이며 `src/pages/bidbox/contact.astro:62`, `src/pages/bidbox/contact.astro:71`, `src/pages/bidbox/contact.astro:80`의 삼항식 형태와 다릅니다. 동작은 동일합니다. | 두 파일 중 한 가지 형태로 통일하시기 바랍니다. 예를 들어 `contact.astro`의 삼항식 형태로 `demo.astro`의 세 곳을 교체하시기 바랍니다. 기능상 필수는 아닙니다. |

심각도 기준은 다음과 같이 적용하였습니다. critical은 배포나 검증 파이프라인을 막는 오류, major는 요구 조건과의 불일치, minor는 표기나 유지보수 관점의 작은 문제입니다.

---

## 5. 심각도별 집계

| 심각도 | 건수 |
| --- | --- |
| critical | 0건 |
| major | 0건 |
| minor | 1건 |

---

## 6. 결론

착지된 세 건의 변경은 요구 조건을 만족합니다. 남은 조치는 표기 통일 1건뿐이며 기능상 필수는 아닙니다.

검증하지 못한 항목은 빌드 산출물의 렌더와 링크 무결성입니다. 해당 항목은 이번 검토에서 실행하지 않았으므로 미검증으로 남깁니다. 본 리뷰는 Muse Spark 1.3 모델로 작성하였습니다.
