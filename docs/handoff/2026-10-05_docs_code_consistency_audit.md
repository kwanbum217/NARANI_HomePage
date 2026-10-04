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

## 5. AGENTS.md 수정 — 2026-10-05 완료

Hermes 보호 파일이라 이 세션에서 손댈 수 없었고(9.1), **Hermes 밖의 에이전트에게
편집할 문장을 diff 형태로 넘겨 처리했습니다.** 아래 A·B 두 건이 해결됐습니다.

### 5.0 위임 절차와 결과

| 항목 | 값 |
| --- | --- |
| 절차 | [`../ops/DO_NOT_REPEAT.md`](../ops/DO_NOT_REPEAT.md) 9.1, [`../ops/ORCA_WORKERS.md`](../ops/ORCA_WORKERS.md) 3장 |
| 워커 | `cmd` (Command Code v1.74.1) `--permission-mode yolo`, 모델 `z-ai/glm-5.3-flash` |
| Orca run | `run_cc70cb292163` |
| Task | `task_000509faa75d` |
| Dispatch | `ctx_83157b88ae6e` |
| 지시문 | Hermes 스크래치에 두고 경로만 전달 (`narani-agents-md-brief.md`) |
| 수정 | `AGENTS.md` 1개 파일, 9행 변경 |
| 커밋 | 워커가 하지 않음. 코디네이터가 커밋 |

**코디네이터 대조 결과**(워커 자기보고가 아니라 실제 파일을 열어 확인함):
`git diff AGENTS.md` 는 지시한 두 곳 외 변경 0건입니다. `dist 서빙` 행이 추가되고
5단계의 "스타일 실측"이 "5 렌더" 행에 흡수되어 표가 8행으로 유지됩니다.
표의 8개 단계명은 `docs/spec/QA_AND_A11Y.md` 2장 표와 **8단계 모두 문자열이
일치**합니다. 185~189행 CI 설명과 머리말 버전은 지시대로 건드리지 않았습니다.
커밋하지 않은 상태로 넘겨왔습니다(워커가 그대로 지켰습니다).

### 5.1 A. 1장 페이지 나열 오류 — 해결

```
-원본은 Google Slides 구성안 9장이며, 8개 페이지 정적 사이트로 옮겼습니다(홈·회사소개·BIDBOX 4개·404).
+원본은 Google Slides 구성안 9장이며, 8개 페이지 정적 사이트로 옮겼습니다(홈·회사소개·BIDBOX 5개·404).
```

`ls src/pages/bidbox/*.astro` = 5개가 근거입니다.

### 5.2 B. 8장 검증 표의 단계 구성 — 해결

`dist 서빙`(3단계) 행이 없고 5단계의 "스타일 실측"이 별도 행이라 8단계와 어긋났었습니다.
모든 행에 단계 번호를 붙이고, `3 dist 서빙` 행을 넣고, 5단계에 스타일 실측을
합쳤습니다. 4단계 내용에는 2026-10-02 에 추가된 구조화 데이터 정합과 카피 정합을
넣었습니다. 근거 표는 `docs/spec/QA_AND_A11Y.md` 2장입니다.

### 5.3 C. 8장 말미 CI 설명 — 문서 수정 없이 참이 되었습니다

"CI 는 8단계 중 1·2·4단계를 대신합니다"는 원래부터 맞는 문장이었습니다.
이번 세션에 `check-structured-data.mjs` 와 `check-copy-consistency.mjs` 를 CI 에
추가해서 4단계 정적 검사 4종을 전부 돌게 되었기 때문입니다. **손댈 필요가 없었고
손대지 않았습니다.**

### 5.4 이 세션에서 남긴 절차적 메모

- 9.1 은 `AGENTS.md` **하나의 파일**에만 적용됩니다. 다른 문서(`.agents/skills/`,
  `docs/`)는 Hermes 보호 대상이 아니므로 직접 고쳤습니다. 9.2 절 참조.
- Orca `run-create` 에는 `--title` 이 없고 `--objective` 가 있습니다. 그리고
  `task-create` 전에 Run이 있어야 합니다(`run_not_found`).
- 워커 보고는 자기보고입니다. `git diff` 로 실제 내용을 대조한 뒤 수락했습니다.

### 5.5 미검증으로 남긴 것

| 항목 | 이유 |
| --- | --- |
| 워커가 `cmd --model` 플래그를 실제로 지원하는지 | 기동은 성공했고 모델 표시도 `glm-5.3-flash` 로 나왔으므로 동작한 것으로 봅니다 |
| 브라우저 3종 | 게이트는 WebKit 단일. 기존 한계 유지 |
| 5단계 스크린샷 육안 확인 | 로그 수치만 확인 |