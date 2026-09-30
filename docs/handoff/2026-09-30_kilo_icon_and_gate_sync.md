# 인수인계: kilo 리뷰어 아이콘 진단과 게이트 정본 갱신 (2026-09-30)

> **작성일**: 2026-09-30
> **수정일**: 2026-09-30
> **버전**: v1.2.0
> **상태**: `91178f1` 까지 푸시 완료. `origin/main` 과 같습니다
> **기준 커밋**: `91178f1` merge: kilo supervised 경로 실측을 워커 명세에 반영한다
> 이후 2.5절과 2.6절 작업을 반영했습니다. 기록의 진실은 2.5절과 2.6절을
> 보십시오.
> **이어받은 문서**: [`2026-09-29_docs_and_form_a11y.md`](2026-09-29_docs_and_form_a11y.md)
> **Orca Run**: `run_8ea848fe98e2` (2.4절), 그리고 2.5·2.6절의 Run 은 각 절에 서술하지 않았습니다
> **다음 인수인계**: 없음. 4장에 남은 항목이 없습니다

---

## 1. 한 줄 요약

kilo 리뷰어의 좌측 아이콘이 Orca 화면에서 opencode 로 보이던 문제를 코드에서
찾아 원인을 규/stats히 기록했고, 동시에 3.2절에서 미뤄둔 `AGENTS.md` 게이트 정합
갱신을 끝냈습니다. 저장소 제품 코드에는 손대지 않았습니다.

---

## 2. 이번 회차에 끝난 것

### 2.1 kilo 좌측 아이콘 진단 (커밋 없음, `~/.config/kilo/` 변경)

**증상**: Orca 화면에서 kilo 리뷰어 세션의 좌측 아이콘이 opencode 아이콘으로
보였습니다. 사용자가 질의했고, 측정으로 재현했습니다.

| 측정 | 값 |
| --- | --- |
| Orca 버전 | 1.4.217 (`/Applications/Orca.app`) |
| kilo 버전 | 7.8.1 |
| 재현 세션 | `term_c7f30e72` (narani_homepage) |
| 관측 | `orca terminal list --json` 의 `agentIdentity` = `opencode`. 58초간 24회 폴링 전부 동일 |
| 상태 훅 엔트리 | `source=opencode` / `SessionBusy` / `working` |

**원인 3가지가 이어집니다.**

1. Orca 의 에이전트 상태 훅 라우트 테이블에 `kilo` 항목이 없습니다.
   `app.asar` 안의 라우트 맵에는 21개가 있고(claude, codex, gemini,
   antigravity, amp, opencode, opencode2, mimo-code, cursor, pi, omp,
   prime-agent, droid, command-code, grok, copilot, hermes, devin, kimi, muse,
   zcode) 그중 kilo 가 없습니다. `orca agent hooks status --json` 에도 kilo 가
   나오지 않습니다.
2. 그래서 kilo 를 opencode 상태 플러그인에 연결하면 그 플러그인은
   `/hook/opencode` 로 POST 합니다(`orca-opencode-status.js` 342행). Orca 는
   POST 경로로 pane 의 agentType 을 정하므로 `opencode` 로 기록합니다.
3. Orca 의 pane 아이콘은 증거 우선순위 `live-hook` > `process` > `launch` >
   `completed-hook` > `title` 로 정합니다. 플러그인이 살아 있으면 `live-hook` 가
   항상 1위라, 프로세스 감지가 정확히 잡은 `kilo` 를 덮습니다.

**우회로가 없습니다.** 2026-09-30 시점 최신 릴리스도 1.4.217 이고(설치본과
동일) 릴리스 노트에 kilo 언급이 0회입니다.

**사용자 결정**: 플러그인 제거. 아이콘과 상태 중 하나만 얻을 수 있으므로
아이콘을 택했습니다.

**적용 후 재측정** (`term_b75edb66`, 20초간 8회 폴링):

```
idle          : (None,  'Kilo CLI', None)
working +2s   : (kilo,  'Kilo CLI', None)
working +16s  : (kilo,  'Kilo CLI', None)
```

`agentIdentity` 가 `kilo` 로 고정됐고 상태 훅 엔트리는 0건입니다. 아이콘과
상태는 둘 다 아니라 하나만이라는 예상이 그대로 확인됐습니다.

**변경한 파일**: `~/.config/kilo/plugins/orca-opencode-status.js` 를
`~/.config/kilo/plugins.disabled/` 로 옮겼습니다. 되돌리려면 파일을 원위치로
옮기고 kilo 세션을 다시 띄우십시오.

### 2.2 `AGENTS.md` 게이트 정합 갱신 (커밋 `c238e50`, 병합 `8306d62`)

2026-09-29 인수인계 3.2절이 남긴 지연분입니다. Hermes 는 `AGENTS.md` 를
보호하므로 저장소 밖의 cmd 워커에게 위임했습니다(절차는
[`../ops/DO_NOT_REPEAT.md`](../ops/DO_NOT_REPEAT.md) 9.1).

| 위치 | 변경 |
| --- | --- |
| 8장 검증 표 인터랙션 행 | 문의·데모 2폼, prefill 4케이스, 접수 실패 degrade 2폼을 나열 |
| 8장 말미 CI 설명 | `8단계 항목이 9개여도` → `10개여도` |

`git diff --stat` 결과 `1 file changed, 2 insertions(+), 2 deletions(-)` 로
지시한 두 곳만 들어갔습니다. 워커 자기보고와 실제 diff 가 일치함을
코디네이터가 열어서 확인했습니다.

### 2.3 `ORCA_WORKERS.md` 에 4.6 절 추가 (커밋 `19b172b`, 병합 `2fac445`)

2.1절의 실측 사실을 규격 문서에 남겼습니다. 4.4 표에 행 하나, 4.6 절 하나로
추가했고 머리말을 v1.9.0 으로 올렸습니다. 4.1~4.5 의 기존 문장은 손대지
않았습니다.

### 2.4 리뷰와 정정 (커밋 `10bef9d`, `1c090ab`, `636b686`, `fe4fdac`)

| 워커 | 산출물 | 커밋 |
| --- | --- | --- |
| W1 | `docs/README.md` 6장 색인 2026-09-30 행 추가와 `**현재 인수인계**` 표시 이동, `docs/context/CURRENT_STATE.md` 5장 18번 항목 | `10bef9d` |
| W2 | `docs/ops/ORCA_WORKERS.md` 4.6 절 1번에 감지 테이블과 상태 훅 라우트 테이블이 별개라는 사실 5줄 추가 | `1c090ab` |
| R1 | 리뷰 보고서. 색인 누락 0건(63개 파일 전수), 깨진 상대 링크 0건(154개 전수), 차단 1건 | 보고서 파일 |
| W3 | 차단 항목 정정 — `CURRENT_STATE.md` 24행과 5장 18번, `AGENTS.md` 머리말 | `636b686` |
| 코디네이터 | `docs/README.md` 머리말, `SKILLS.md` 74행의 같은 오류, 이 문서 자기참조 갱신 | `1e868d0`, `fe4fdac` |

**R1 이 잡은 결함은 코디네이터가 심은 것입니다.** W1 명세에
"실제 항목은 10개입니다(4단계 2개, 5단계 2개, 8단계 4개)" 라고 적었는데
괄호가 2+2+4=8 이라 같은 문장의 10과 모순됐습니다. "10번 항목 기준" 해후어는
그 합이 안 맞는 것을 메우려고 제가 붙였습니다. 원본
`docs/context/CURRENT_STATE.md` 24행에도 같은 오류가 있었고, 코디네이터가
`SKILLS.md` 74행에서 또 하나를 찾아냈습니다(9개, 4단계 2개·5단계 2개·8단계 3개).

실측하면 8단계 시나리오는 10줄입니다 — `scripts/verify.sh` 195~204행이
`interact.swift` 에 넘기는 nav 1, form 2, dialog 1, prefill 1,
prefill-reject 3, fallback 2. 합이 10입니다. 4단계 2개와 5단계 2개는
8단계 안의 항목이 아닙니다. W3 가 세 곳을 실제 구성으로 고쳤습니다.

**교훈**: 수치를 문서에 옮길 때 원본 문장의 내역을 그대로 베끼지 말고
합을 확인하십시오. 그리고 "검증하지 않은 수치를 기록하지 않는다"는
`AGENTS.md` 7장 금지 행위 10번에 걸립니다. 제가 세 군데를 같은 회차에
남겼습니다.

### 2.5 항목 수 자기모순 정정과 changelogs 색인 (커밋 `636b686`, `f52147c`)

2.4절의 리뷰가 막은 것을 정리합니다. R1 이 지적한 차단 항목은
`CURRENT_STATE.md` 5장 18번에 들어간 "2+2+4=8" 이라는 내역이었습니다.
같은 오류가 `CURRENT_STATE.md` 24행과 `SKILLS.md` 74행에도 있었습니다.
W3 가 `CURRENT_STATE.md` 24행과 5장 18번, `AGENTS.md` 머리말을 실제 구성으로
고쳤고, 코디네이터가 `SKILLS.md` 74행을 별도로 고쳤습니다.

| 항목 | 결과 |
| --- | --- |
| 8단계 항목 10개의 구성 | nav 1, form 2, dialog 1, prefill 1, prefill-reject 3, fallback 2. `scripts/verify.sh` 195~204행이 `interact.swift` 에 넘기는 10줄 |
| `CURRENT_STATE.md` 24행 | 8단계 항목을 4단계·5단계와 섞어 세던 내역을 실제 구성으로 고쳤습니다 |
| `SKILLS.md` 74행 | 9개(4단계 2개, 5단계 2개, 8단계 3개)이던 표기를 10개로 고쳤습니다 |
| `AGENTS.md` 머리말 | v1.1.0 에서 v1.2.0 으로, 수정일 2026-09-30. Hermes 보호라 저장소 밖 cmd 워커가 반영했습니다 |
| `docs/README.md` 6장 | 2026-09-30 행 등재, `**현재 인수인계**` 표시 이동, 머리말 v1.2.0 |
| `docs/changelogs/work_log.md` | 이번 회차 장 추가(범위·변경·검증·남은 것 4절), `docs/README.md` 에 `## 7. changelogs/` 장 신설 |

`docs/README.md` 7장은 W4 가 세웠고 5행(2026-09-30 포함)으로
`work_log.md` 의 장 5개와 일치합니다.

### 2.6 kilo 워커 실측과 supervised 경로 확인 (커밋 `c2c59ea`, 병합 `91178f1`)

`openrouter/stealth/space-bunny-alpha` 로 뜬 kilo 워커에 `dispatch --inject`
로 실측 과업을 주입해 세 가지를 실측했습니다.

| 항목 | 관측값 |
| --- | --- |
| 승인 창 | `Code auto` 표시. `--auto` 가 적용됐습니다 |
| pane 아이콘 | `agentIdentity` 가 `kilo` 로 유지 |
| 상태 전달 | working·idle 류 필드 0건. Orca 로 올라오는 상태가 없습니다 |
| `orca agent hooks status --json` | 16개 에이전트, kilo 없음. 종료 코드 0 |
| 소요 시간 | 46초 |

**kilo 워커가 4.6절의 반례를 찾아냈습니다.** 코디네이터가 4.6절 1번에서
`orca agent hooks status --json` 출력과 21개 라우트 맵을 같은 근거로
나열했는데, 그 명령은 16개만 찍고 opencode·opencode2·mimo-code·pi·omp·
prime-agent 가 빠져 있어 21개 근거로 쓸 수 없다는 지적이었습니다. 4.6절
1번을 고쳤습니다. 두 표를 같은 근거로 인용하지 마십시오.

`worker-start --agent kilo` 도 실측했습니다. `agent_unconfigured` 가 아니라
`agent_readiness` 에서 45초 timeout 으로 실패합니다. 터미널은 떴으나 준비
신호 훅이 없어 실패하고, `Code auto` 가 아닌 `Code` 로 떠서 승인 창도
남아 있었습니다. 반면 같은 워크트리에 `dispatch --inject` 로 주입하면
12초 안에 정상 완료됐습니다. **kilo 에게 검증된 경로는 3장뿐입니다.**
4.2 표에 두 행을 추가하고 절 제목을 `Orca 쪽 (TUI 에이전트 연동)` 으로
고쳤습니다. 3장에도 `--worktree active` 가 `selector_not_found` 를 내는
주석을 붙였습니다.

---

## 3. 하지 않은 것

### 3.1 착수하지 않는 항목 (사람 결정)

2.1절의 3장, 4장, 10.1절은 그대로입니다. 변동이 없습니다.

### 3.2 에이전트가 하지 않은 것

| 항목 | 이유 |
| --- | --- |
| `app.asar` 패치로 `/hook/kilo` 추가 | 서명된 앱 바이너리 수정이므로 자동 업데이트가 깨질 수 있습니다. 사용자가 플러그인 제거를 택했습니다 |
| `~/.config/kilo/plugins.disabled/` 안의 파일 정리 | 되돌릴 수 있어야 하므로 남겨 두었습니다 |
| 인수인계 문서 색인 | 이 회차에서 완료했습니다. `docs/README.md` 6장에 2026-09-30 행을 더하고 `**현재 인수인계**` 표시를 그 행으로 옮겼습니다(W1) |
| 항목 수 자기모순 정정 | 리뷰어 R1 이 `2+2+4=8` 이라 `10개` 와 모순되는 내역을 지적했습니다. W3 가 `CURRENT_STATE.md` 24행과 5장 18번, `AGENTS.md` 머리말을 고쳤고, 코디네이터가 `SKILLS.md` 74행의 같은 오류를 별도로 고쳤습니다 |

---

## 4. 검증한 것과 검증하지 못한 것

### 4.1 검증한 것

- kilo 아이콘 결함 재현 — 58초간 24회 폴링, `agentIdentity=opencode` 고정
- 플러그인 제거 후 재현 세션에서 20초간 8회 폴링, `agentIdentity=kilo` 고정
- 두 워커의 산출물 diff 를 코디네이터가 직접 열어 지시대로 들어갔는지 대조
- `npm run check:emoji` 를 각 worktree에서 실행 — 101개 파일, 이모지 없음,
  종료 코드 0 (이 문서를 쓰던 시점에는 100개였습니다. 이 문서가 추가된 뒤
  101개가 되었습니다)
- 병합 후 `AGENTS.md` 의 `9개여도` 문자열이 사라지고 `10개여도` 가 남은 것을
  확인
- `docs/ops/ORCA_WORKERS.md` 의 4.5 절이 훼손되지 않았고 4.6 절이 들어갔음을 확인
- 병합 후 `npm run verify` 실행 결과는 5장에 적습니다
- 워크트리와 브랜치 회수 완료, `git worktree list` 에 잔여 없음
- Orca 워커 터미널 2기 닫음

### 4.2 검증하지 못한 것

- `npm run verify` 8단계는 문서만 바꾼 변경이라 게이트 로직과는 무관하다고
  보이지만, 실행 결과는 5장에 적었습니다
- Chrome 과 Firefox 재실측은 하지 않았습니다. 이번 변경은 문서뿐입니다
- Orca 1.4.218 이후에 kilo hook 라우트가 추가될지는 확인하지 못했습니다.
  2026-09-30 시점 `orca --version` 은 1.4.217 이고 4.6절 5번이 말하는
  대로 우회로가 없습니다. 다음 세션이 `orca --version` 으로 다시 확인하십시오

---

## 5. 병합 후 게이트 결과

`npm run verify` 를 `2fac445` 에서 실행했습니다. 이후 변경은 전부 문서이므로
다시 돌리지 않았습니다.

| 단계 | 결과 |
| --- | --- |
| 1 타입 체크 | `astro check` 0 errors |
| 2 빌드 | 통과 |
| 3 dist 서빙 | 통과 |
| 4 링크 무결성 | 통과 |
| 5 렌더·스타일 | 8페이지 콘솔 오류 0건. 라이트 대비 15.88, 다크 19.46, CTA 44px 로 3장 기준선과 일치 |
| 6 폰트 서브셋 | 통과 |
| 7 반응형·접근성 | 8페이지 통과 |
| 8 인터랙션 | 10개 항목 전부 `fail: null` |

종료 코드 0. 이번 회차는 문서만 바꿨으므로 3장 기준선 수치는 변하지
않았습니다.

---

## 6. 다음 세션

3.1절의 착수 금지 항목이 그대로입니다. 사람이 호스트를 정하면 첫 배포만
진행하십시오. 그 전에는 제품 코드를 열 필요가 없습니다.

**착수 가능한 미처리 항목은 없습니다.** 리뷰 권고 8건과 Orca 실측으로 나온
항목까지 모두 이번 회차에 처리했습니다.

| 권고 | 위치 | 처리 |
| --- | --- | --- |
| `docs/changelogs/` 에 번호 장이 없고 상단 표에만 30행이 있음 | `docs/README.md` | **이번 회차에 해소.** W4 가 README 에 `## 7. changelogs/` 장을 세우고 `work_log.md` 의 장 4개와 이번 회차를 색인했습니다 |
| handoff 4.1절의 "100개 파일" | 이 문서 4.1절 | **이번 회차에 해소.** 101개로 고쳤고 이 문서가 추가되며 값이 바뀐 경위도 적었습니다 |
| `AGENTS.md` 3장 표와 1장 표의 항목 수 서술 추가 대조 | `AGENTS.md` | **이번 회차에 해소.** W3 가 머리말을 v1.2.0 으로 올렸습니다. 1장·3장 표에는 8단계 항목 수를 적은 곳이 없어 추가 수정이 불필요했습니다. `grep` 결과 8단계 언급 6줄이 모두 10개로 일치합니다 |
| kilo 리뷰어의 supervised 경로 미검증 | `worker-start --agent kilo` 의 실제 결과를 명세에 없었습니다 | **이번 회차에 해소.** 2.6절에 실측값을 적었고 `ORCA_WORKERS.md` 4.2 표에 두 행을 추가했습니다 |

R1 이 낸 권고 8건 중 미처리는 0건입니다. 다만 R1 이 지적한 차단 항목은
코디네이터가 명세에 심은 자기모순이었고, 같은 오류가 저장소에 세 군데
더 있었습니다(2.4절). 리뷰를 붙인 것이 잡아냈지만 첫 문장을 쓴 쪽은
코디네이터였습니다.

결과는 [`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) 4장과 5장에
반영하십시오. 이번 회차는 제품 코드 변경이 없어 3장 기준선은 그대로입니다.
