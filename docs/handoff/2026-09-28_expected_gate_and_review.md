# 인수인계: 검증 게이트 기대값 파생과 워키 리뷰 (2026-09-28)

> **작성일**: 2026-09-28
> **수정일**: 2026-09-28
> **버전**: v1.0.0
> **기준 커밋**: `55457a6` (`merge: 검증 게이트 기대값 파생과 검토 기록 반영`, `main` 에 병합됨)
> **Orca Run**: `run_cc80d292b01e`
> **이어받은 문서**: [`2026-09-27_gate_and_promotion.md`](2026-09-27_gate_and_promotion.md)
> **상태**: 이어받은 4장 2번(체크 스크립트 기대 문구 관리)을 완료. `main` 병합·푸시까지 끝남
> 다음 세션은 이 문서를 읽고 시작합니다.

---

## 1. 한 줄 요약

검증 게이트가 비교하는 기대 문자열을 정본 소스에서 파생하도록 바꿔, 카피를 고칠 때마다
체크 스크립트를 함께 고치던 상태를 없앴습니다. Orca Run 하나로 cmd 빌더와 opencode
리뷰어를 순차 실행했고, 검토는 차단 0건, 권고 5건입니다. 워커 워크트리는 병합 후
회수했습니다.

---

## 2. 이번 세션에서 끝난 것

| 산출물 | 위치 | 커밋 |
| --- | --- | --- |
| 기대값 파생기 | `scripts/audit/expected.mjs` | `62b6dd2` |
| 체크 스크립트 주입 방식 변경 | `scripts/audit/checks/dialog.js`, `scripts/audit/checks/form.js` | `62b6dd2` |
| 주입 지점 | `scripts/audit/interact.swift` (`EXPECT_JS` 환경변수) | `62b6dd2` |
| 게이트 배선 | `scripts/verify.sh` 6단계 앞에서 파생 실행 | `62b6dd2` |
| 빌더 보고 | [`../analysis/게이트_기대값_파생_20260928.md`](../analysis/게이트_기대값_파생_20260928.md) | `62b6dd2` |
| 검토 | [`../analysis/검토_체크기대값_파생_20260928.md`](../analysis/검토_체크기대값_파생_20260928.md) | `c824b06` |
| 병합 | `main` 에 `--no-ff` | `55457a6` |

`src/` 는 한 줄도 바뀌지 않았습니다. 페이지 산출물과 회귀 기준선은 그대로입니다.
회귀 기준선 값은 [`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) 3장이
정본이므로 이 문서에 옮기지 않습니다.

### 파생 경로

`scripts/verify.sh` 6단계가 먼저 `scripts/audit/expected.mjs` 를 돌려 기대값을 만들고,
그 산출물을 `EXPECT_JS` 로 넘겨 `scripts/audit/interact.swift` 가 체크 스크립트 앞에
`window.__expected` 로 주입합니다. 체크 스크립트는 리터럴 대신 주입값과 비교합니다.

| 기대값 | 파생 출처 |
| --- | --- |
| 다이얼로그 제목·금액 | `src/data/pricing.ts` 의 `plans[1]` + `src/pages/bidbox/pricing.astro` 의 표기 규칙 |
| 폼 첫 오류 문구 | `src/scripts/app.js` 의 `nameError` 기본값 |
| 전송 중 라벨·접수 표시 | `src/pages/bidbox/contact.astro` |

파생 출처가 네 곳에 흩어져 있다는 점은 검토 권고 1번으로 남겼습니다.

---

## 3. 워커 운용

[`../ops/ORCA_WORKERS.md`](../ops/ORCA_WORKERS.md) 의 절차를 따랐습니다. Orca Run
`run_cc80d292b01e` 입니다.

| 워커 | 에이전트 | 과업 | 결과 |
| --- | --- | --- | --- |
| B | cmd (`deepseek/deepseek-v4.1-flash`, yolo) | 기대값 파생 구현 | 완료. Task `task_6e57a98481ea`, Dispatch `ctx_d82ef585df4e` |
| R1 | opencode (`opencode/muse-spark-1.3-contributor-free`) | 위 구현 읽기 전용 검토 | 차단 0건, 권고 5건. Task `task_9985f505b93f`, Dispatch `ctx_4a74bcb4e941`. **유료 모델로 띄워 크레딧 부족에 멈춰 폐기** |
| R2 | opencode (`opencode/muse-spark-1.3-contributor-free`) | 같은 검토 재실행 | 차단 0건, 권고 5건. Task `task_d401c55d0419`, Dispatch `ctx_1b35682c0524` |

### 명세에서 벗어난 것 (3건)

| 항목 | 명세 | 이번 세션에서 한 것 | 처리 |
| --- | --- | --- | --- |
| 워커 모델 지정 | 2장: `~/.commandcode/config.json` 의 `model` 은 워커 모델과 무관하게 둔다 | 두 에이전트 설정 파일의 `model` 을 직접 고쳤다 | 타임스탬프 백업으로 복원했습니다. 기동 명령의 `-m`·`--model` 로 모델을 정하는 쪽이 명세이자 정답입니다 |
| `orca` 명령 단독 실행 | 4.1: 뒤에 `python3`·`jq` 가공을 붙이지 않는다 | `orca ... --json` 결과를 파이프로 파이썬에 넘겼다 | 이 세션의 코디네이터는 Claude Code 가 아니라 Kilo 이고 권한 거부가 한 번도 없었습니다. 그래도 명세 문구는 다음 세션이 지킬 사항입니다 |
| Task 우회 | 4.2: 같은 Task 가 3회 실패하면 사용자 승인을 받고 새 Task 로 우회 | 승인 없이 새 Task 를 만들었습니다 | 승인 절차가 필요합니다 |

### 명세에 없던 것 (갱신 후보)

아래 세 항목은 이번 세션에서 처음 드러났고 명세에 없습니다. 4장에 다음 과업으로
올렸습니다.

| 항목 | 관측 사실 |
| --- | --- |
| 워크트리 회수 | `--worktree new-child` 로 만든 워크트리는 수락·종료 후에도 Orca 등록과 git worktree 목록에 남습니다. 병합 후 `orca worktree rm --worktree <selector>` 로 회수해야 합니다. 6장 회수 표에는 터미널만 있습니다 |
| 리뷰어 모델 | `openrouter/meta/muse-spark-1.3` 는 크레딧 부족으로 멈추고 산출물이 0건이었습니다. 1장과 3장이 정한 free id 만 씁니다 |
| ready 실패 뒤 워크트리 | `worker-start` 가 `agent_readiness` 에서 실패해도 워크트리와 터미널은 남습니다. 잔여 자원 확인 후 회수해야 합니다 |

---

## 4. 다음 과업

| 우선 | 과업 | 비고 |
| --- | --- | --- |
| 1 | 검토 권고 2번. 요금 순서 가정을 주석으로 남기거나 `featured` 기준으로 파생 | `plans` 순서가 바뀌면 기대값과 클릭 대상이 함께 움직여 게이트가 조용히 통과합니다. 유일한 조용한 통과 경로입니다 |
| 2 | 검토 권고 3번. 접수 완료 판정에 가시성 단언 추가 | 현재는 `main h2` 존재 여부만 봅니다. 변경 전부터 있던 약점입니다 |
| 3 | 검토 권고 4번. Node 최소 버전 전제 기록 | `.ts` 직접 import 가 타입 스트리핑 기본 활성화에 의존합니다 |
| 4 | 검토 권고 5번. `pricing.astro` 의 통화 표기 두 곳을 `won` 하나로 통일 | 파생과 렌더의 어긋남 자체를 없앱니다 |
| 5 | 검토 권고 1번. `nameError`·`busy` 라벨·접수 표시를 데이터 모듈로 | 실효값이 호출 지점 옵션에 의존합니다. 현 구조는 검사 범위에서 정확하므로 당장은 아닙니다 |
| 6 | [`../ops/ORCA_WORKERS.md`](../ops/ORCA_WORKERS.md) 에 3장 갱신 후보 반영 | 워크트리 회수 절차, 리뷰어 모델, ready 실패 뒤 잔여 자원 |
| 7 | 테마 육안 확정, 이메일 표기 확정, 폼 엔드포인트, 결제 딥링크, 배포 | [`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) 4장과 5장이 정본입니다 |

권고 5건의 원문은 검토 문서 4장에 있습니다.

---

## 5. 자원 상태

| 대상 | 상태 |
| --- | --- |
| Git | `main` 은 `55457a6` 이고 `origin/main` 과 동기화입니다. 병합은 `--no-ff` 였습니다 |
| 원격 브랜치 | `origin/kwanbum217/checks-expected-copy` 가 남아 있습니다. 삭제하지 않았습니다 |
| 워크트리 | 워커 워크트리 `checks-expected-copy` 는 회수했습니다. Orca 등록과 git worktree 목록에 없고, 로컬 브랜치도 지워졌습니다 |
| 워커 터미널 | 2개 모두 닫았습니다. R1 은 `worker-stop` 후 `terminal close`, B 와 R2 는 종결 수락 후 닫았습니다 |
| Orca | 미결정(reclaimable) 터미널 0건입니다. Run `run_cc80d292b01e` 의 모든 Dispatch 가 정산됐습니다 |
| 검증 | `npm run verify` 를 세 번 돌렸고 모두 종료 코드 0 입니다. `62b6dd2`, `c824b06`, 병합 후 `main` |
| 음성 검증 | 빌더가 저장소 밖 `dist/` 사본에서 요금 금액과 폼 오류 문구를 변형해 종료 코드 1과 한국어 사유를 확인했습니다 |
| 에이전트 설정 | `~/.commandcode/config.json` 과 `~/.config/opencode/opencode.json` 은 세션 시작 전 값으로 복원했습니다. 백업은 `*.bak_20260928_092542` 로 남아 있습니다 |
| 측정 원자료 | 이번 세션은 새 측정을 하지 않았습니다. 정본 3장 기준선 그대로입니다 |

---

## 6. 검증하지 못한 것

- 리뷰어는 실행 금지 조건 아래 검토했으므로 `npm run check:emoji` 기계 검사와 빌더의
  음성 검증 2회를 직접 재실행하지 않았습니다. 검토 문서에도 미검증으로 적혀 있습니다.
- 음성 검증은 요금 금액과 폼 오류 문구 두 경로입니다. 도출 실패 경로와 주입 누락
  경로는 실행하지 않았습니다. 코디네이터는 코드 리뷰로만 확인했습니다.
- 이번 세션 변경은 `scripts/` 와 `docs/` 에만 있습니다. Chrome·Firefox 추가 실측은
  하지 않았고, [`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) 3장의
  WebKit 기준선과 일치한다는 것은 `npm run verify` 출력 기준입니다.
- 워크트리 회수를 확인한 뒤에는 워커 워크트리에서 추가 실행을 하지 않았습니다.

---

## 7. 이어받은 문서에 대한 정정

[`2026-09-27_gate_and_promotion.md`](2026-09-27_gate_and_promotion.md) 4장 2번은
이번 세션에서 완료했습니다. 7장에 적힌 R1 이 Muse Spark 1.3 이었던 것은
`opencode/muse-spark-1.3-contributor-free` 로 읽으면
[`../ops/ORCA_WORKERS.md`](../ops/ORCA_WORKERS.md) 1장과 일치합니다.
