# 2026-10-05 문서·코드 정합 검토

> **작성일**: 2026-10-05
> **상태**: 완료 (문서 12건 정정, 게이트 코드 2건 보강)
> **브랜치**: `docs-code-consistency-audit`
> **제품 코드 변경**: 없음. `src/data/`, `src/pages/`, `src/components/`, `src/styles/` 는 한 줄도 건드리지 않았습니다. 따라서 [`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) 3장 기준선 수치(라이트 15.88, 다크 19.46, CTA 44px)는 그대로입니다.

---

## 1. 이 세션이 한 일

문서가 코드를 따라가지 못한 곳을 찾아 실측으로 대조하고 고쳤습니다. 게이트는
`npm run verify` 2회 실행 기준 이미 통과하고 있었습니다. **문서만 뒤처져 있었습니다.**

## 2. 발견과 처리

### 2.1 상태 정본(`CURRENT_STATE.md`) 내부 모순 5건

| 발견 | 근거 | 처리 |
| --- | --- | --- |
| 1장 "페이지 7종" | `src/pages/` 의 `.astro` 8개. `verify.sh` `PAGES` 배열 8개, `check-links.mjs` 가 "페이지 8개" 출력 | 8종으로 정정. 같은 표의 "7개 라우트"도 함께 |
| 콘텐츠 단일 소스에 `faq.ts` 없음 | `src/data/` 에 4개 모듈 | `faq.ts` 추가 |
| 폰트 용량 3개 병존 | 1장에는 81,696 / 52,176 / 58.9KB 세 값, 실제 파일은 **50,172 바이트** | 현재값을 1장에 기록하고 나머지는 회차 기록임을 명시 |
| 타입 체크 "29파일" | `npm run check` 실측 `Result (35 files)`. 5장 13번은 "28파일" | 35파일·에러 0·힌트 2건으로 정정. 힌트는 `prefill.js`·`prefill-reject.js` 의 미사용 `sleep` 변수(`ts6133`)이며 실패 기준이 error 이므로 통과에 영향 없음 |

### 2.1 환경 — 여기 있는 한 건은 오탐이었습니다

2장 환경(Node v26.10.0, npm 12.1.0)은 **옳은 값이었습니다.** 처음 검토에서
"v26.7.0·11.19.0 으로 낡았다"고 판단해 문서를 고쳤는데, 그건
`execute_code` 커널의 PATH 에 다른 Node 가 잡힌 것이었습니다. 되돌렸습니다.
자세한 오탐 기록은 [4장](#4-이-세션에서-내가-만든-오탐-3건) 과
[`../ops/DO_NOT_REPEAT.md`](../ops/DO_NOT_REPEAT.md) 11.3 을 보십시오.

### 2.2 색인 누락 1건

`docs/analysis/README.md` 의 "현재 기록" 표가 26건, 실제 파일은 32건이었습니다.
빠진 6건은 전부 2026-10-02 회차(`고도화_실행_W1`·`W2`, `검토_고도화_W1W2`,
`고도화_단일소스_W3`, `고도화_카피정정_W4`, `고도화_게이트추가_W5`)입니다.

상위 인덱스 `docs/README.md` 5장은 33건(색인 파일 1건 포함)을 이미 전부 적고
있었습니다. **하위 색인만 밀린 상태**였으므로 `docs/README.md` 는 손대지 않았습니다.

### 2.3 깨진 상대 링크 13건

`.agents/skills/` 의 5개 파일이 문서 링크를 `../../docs/...` 로 적고 있었습니다.
`.agents/skills/<name>/SKILL.md` 에서 저장소 루트까지는 3단계이므로
`../../../docs/...` 여야 합니다.

```
수정: a11y-audit 2건, brand-refresh 3건, content-model 1건,
      deck-to-site 4건, page-authoring 3건 = 13건
정상: static-deploy (처음부터 ../../../ 사용)
```

`scripts/check-links.mjs` 는 `dist/` 만 검사하고, `docs/` 하위만 훑는 링크
검사도 `.agents/` 는 범위 밖이라 게이트 8단계 전부 통과한 상태였습니다.
수정 후 **저장소 전체 상대 링크 0건**을 확인했습니다.

`brand-refresh/SKILL.md:65` 의 "7개 페이지"도 8개로 함께 고쳤습니다.

### 2.4 도구 표 누락 5건

`docs/spec/QA_AND_A11Y.md` 3장 도구 표가 `scripts/` 12개 중 4개만 열거했습니다.
`check-sitemap.mjs`, `check-structured-data.mjs`, `check-copy-consistency.mjs`,
`check-no-emoji.mjs`, `validate-commit-message.mjs`, `build-font-subset.py`,
`audit/expected.mjs` 를 채웠고 `checks/*.js` 도 6개 전부가 아니라 3개만 있었습니다.

같은 문서 7장 "검증 범위 밖" 에는 재현 불가능한 한계와 **아직 안 넣은 검사**가
섞여 있었습니다. 구분해서 적었습니다.

### 2.5 죽은 변수 1건

`Makefile` 의 `PORT ?= 4322` 는 2026-09-28 에 `verify.sh` 가 빈 포트를 자동
배정하도록 바뀐 뒤 **아무 타깃도 읽지 않는** 변수로 남아 있었습니다.
`make -n verify` 가 `npm run verify` 만 출력함을 확인하고 제거했습니다.
같은 시점에 `.agents/skills/` 어느 파일도 4322 를 하드코딩하지 않음을 확인했습니다
(CURRENT_STATE 5장 9번이 우려한 상황이 이미 해소된 상태).

---

## 3. 게이트 코드 변경 2건과 음성 검증

두 건 모두 "문서만 고치지 않고 코드로 막는" 쪽입니다. 두 검사 모두
**고의로 망가뜨려 실제로 실패하는 것을 확인한 뒤** 되돌렸습니다.

### 3.1 이모지 검사 범위 확장

`scripts/check-no-emoji.mjs` 의 `DEFAULT_TARGETS` 가 최상위 `md` 3종뿐이라
`.github/`, `.agents/skills/`, `astro.config.mjs`, `Makefile`,
`.pre-commit-config.yaml`, `package.json`, `tsconfig.json` 이 범위 밖이었습니다.
AGENTS.md 7장은 "코드, 주석, 커밋 메시지, 문서 어디에도" 라고 서술합니다.

검사 파일 **112 → 123개**.

음성 검증:

```
.github/workflows/ci.yml 에 이모지 심음        → exit 1, 해당 줄 지적함
.agents/skills/a11y-audit/SKILL.md 에 심음     → exit 1, 해당 줄 지적함
복원 후                                        → exit 0, "이모지 없음"
```

### 3.2 CI 에 정적 검사 2종 추가

`.github/workflows/ci.yml` 은 `links` 와 `check:sitemap` 만 돌렸습니다.
2026-10-02 에 `verify.sh` 4단계에 붙은 `check-structured-data.mjs` 와
`check-copy-consistency.mjs` 는 CI 에 없었습니다. 둘 다 순수 Node 이므로
Linux 러너에서 그대로 돕습니다.

CI 7단계를 로컬에서 순서대로 재현해 전부 종료 코드 0 을 확인했습니다.

```
npm run check:emoji                            exit 0  이모지 없음
npm run check                                  exit 0  (2 hints)
npm run build                                  exit 0  Complete!
npm run links                                  exit 0  깨진 참조 없음
npm run check:sitemap                          exit 0  sitemap 7건 / 실제 7개 일치
node scripts/check-structured-data.mjs dist    exit 0  JSON-LD 8개 페이지 전부 통과
node scripts/check-copy-consistency.mjs .      exit 0  카피 정합 통과, 11개 .astro
```

`check-structured-data` 는 `dist/` 를 읽으므로 빌드 뒤에 배치했습니다.

---

## 4. 이 세션에서 내가 만든 오탐 3건

셋 다 같은 세션 안에서 정정했고, [`../ops/DO_NOT_REPEAT.md`](../ops/DO_NOT_REPEAT.md) 11장에 남겼습니다.
**셋의 공통 뿌리는 "측정 도구를 의심하지 않은 것"입니다.**

**(1) 틀린 값을 넣은 음성 검증은 통과합니다.**
`check-copy-consistency.mjs` 가 실패하는지 보려고 `pricing.astro` 의
`POINT_USAGE_RULE` 참조를 문자열로 바꿨는데, 넣은 문장이 실제 상숫값과 달랐습니다.
검사기는 상수의 **값**과 페이지를 비교하므로 일치하지도 불일치하지도 않고
종료 코드 0 이 나왔습니다. 실제 값(`공고 · 낙찰 탐색 및 AI 예측당 1포인트가 사용됩니다.`)
으로 다시 넣어 exit 1 을 확인했습니다. **검사가 실패하지 않는 음성 검증은 통과 증거가 아닙니다.**

**(2) 정규식이 0 을 낼 수 있습니다.**
`plans` 항목 수를 `grep "{ id: '"` 로 세었더니 0 이 나왔습니다. 실제 3개입니다.
`pricing.ts` 는 들여쓰기가 일정하지 않습니다.

**(3) 가장 부당한 오탐 — 측정 도구의 PATH 를 못 봤습니다.**
`execute_code` 커널에서 `node -v` 를 돌려 `v26.7.0`, `npm -v` 를 `11.19.0` 으로
얻고, 2장 환경의 `v26.10.0`·`12.1.0` 이 낡았다고 **문서를 고쳐 버렸습니다.
원래 문서가 옳았습니다.**

```
execute_code 커널   node -v → v26.7.0    npm -v → 11.19.0
terminal 도구       node -v → v26.10.0   npm -v → 12.1.0
zsh -lic 로그인 셸  node -v → v26.10.0   npm -v → 12.1.0
```

Hermes `execute_code` 커널의 PATH 맨 앞에
`~/.hermes/tools/node-26.7.0-darwin-arm64/bin` 이 붙어 있어서 다른 Node 가
잡혔습니다. 사용자 로그인 셸과 `terminal` 도구가 일치하므로 **원래 문서가 옳고
제 "발견"이 오탐**이었습니다. 되돌렸고, 2장에는 커널 값을 쓰지 말라는 경고를
남겼습니다.

**이 세션에서 검증한 게이트는 `terminal` 도구로 돌렸으므로 이 문제의 영향을 받지 않습니다.**

---

## 5. 하지 않은 것과 다음 세션이 할 일

### 5.1 AGENTS.md — 최우선, Hermes 밖에서

두 곳이 `verify.sh` 와 어긋납니다. **이번 세션은 손대지 않았습니다.**

**A. 1장 29행 — 페이지 나열 오류**

현재:
```
원본은 Google Slides 구성안 9장이며, 8개 페이지 정적 사이트로 옮겼습니다(홈·회사소개·BIDBOX 4개·404).
```
`src/pages/bidbox/` 의 `.astro` 는 5개(`index`, `service`, `pricing`, `demo`, `contact`)입니다.
괄호 안 나열이 7이 되어 같은 문장의 "8개 페이지"와 어긋납니다.

바꿀 문장:
```
원본은 Google Slides 구성안 9장이며, 8개 페이지 정적 사이트로 옮겼습니다(홈·회사소개·BIDBOX 5개·404).
```

**B. 8장 검증 표 — 단계 구성이 `verify.sh` 와 다름**

`verify.sh` 의 실제 8단계는 1 타입·2 빌드·**3 서빙**·4 링크·**5 렌더+스타일실측(하나)**·6 폰트·7 반응형·접근성·8 인터랙션입니다.
현재 표는 `dist 서빙` 행이 없고 5단계의 "스타일 실측"을 별도 행으로 분리해서
8행을 채웁니다. `docs/spec/QA_AND_A11Y.md` 2장 표는 실제 8단계 그대로입니다.

가장 작은 수정안은 표에 `dist 서빙` 행을 넣고 `스타일 실측` 행을 `렌더` 행에
합치는 것입니다. 행 수를 8로 유지하려면 이 두 변경이 함께 가야 합니다.

**C. 8장 말미 CI 설명 — 이제 맞습니다, 확인만 필요**

"CI 는 8단계 중 1·2·4단계를 대신합니다"라고 적혀 있는데, 이번 세션에 4단계
검사 4종을 CI 에 전부 넣었으므로 **처음으로 참이 되었습니다.** 문서 수정 없이
맞아졌습니다.

절차는 [`../ops/DO_NOT_REPEAT.md`](../ops/DO_NOT_REPEAT.md) 9.1 입니다.
A·B 두 건을 diff 형태로 정리해 Hermes 밖의 워커에게 넘기고, 돌아온 diff 를
직접 대조하십시오. 워커의 자기보고를 믿지 마십시오.

### 5.2 미검증으로 남긴 것

| 항목 | 이유 |
| --- | --- |
| `AGENTS.md` 수정 | Hermes 보호 파일. 위 diff 만 준비했습니다 |
| 5단계 스크린샷 육안 확인 | 로그 수치(15.88 / 19.46 / 44px / 350자 / `0 issue group` / 10개 항목 `fail: null`)는 확인했으나 화면은 직접 보지 않았습니다 |
| `docs/analysis/` 내부 실측 수치 재현 | 원시 JSON 이 `/tmp` 에 있고 정리된 상태입니다. 2026-09-27 이전 값이라 재현 대상이 아닙니다 |
| CI 실행 | Linux 러너를 로컬에 만들지 않았습니다. 대신 CI 의 7단계를 로컬에서 순서대로 재현해 종료 코드 0 을 확인했습니다 |
| 브라우저 3종 | 게이트는 WebKit 단일입니다. 기존 한계 유지 |

### 5.3 이번 회차가 남긴 관문

`check-no-emoji.mjs` 의 `DEFAULT_TARGETS` 는 손으로 관리하는 목록입니다.
새 디렉터리(예: `docs/adr/`)를 만들면 기본 검사에서 빠집니다. 이 목록에
추가해야 한다는 사실을 인덱스나 이 문서에 남겨야 다음 세션이 찾습니다.
(현재는 `scripts/check-no-emoji.mjs` 안에만 주석으로 있습니다.)