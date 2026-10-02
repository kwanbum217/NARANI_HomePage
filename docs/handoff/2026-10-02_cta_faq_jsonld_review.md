# 인수인계: 고도화 CTA·FAQ·JSON-LD 병렬 구현과 리뷰 (2026-10-02)

> **작성일**: 2026-10-02
> **버전**: v1.0.0
> **상태**: 74842db 까지 로컬. `origin/main` 은 1fe2fb3 이므로 푸시 전입니다
> **기준 커밋**: `74842db` merge: JSON-LD applicationCategory 정정을 병합한다
> **이어받은 문서**: [`2026-09-30_kilo_icon_and_gate_sync.md`](2026-09-30_kilo_icon_and_gate_sync.md)
> **Orca Run**: `run_2385d3f2162c` (W1·W2 는 cursor CLI 코디네이터가, R1 은 Hermes 가 수행)

---

## 1. 한 줄 요약

이전 세션이 남긴 "착수 가능한 미처리 항목 없음"은 더 이상 사실이 아닙니다. 이 회차에서
CTA 라벨 정직화, FAQ 데이터 모듈과 두 페이지 섹션, BIDBOX 전용 JSON-LD 를 병렬로
구현하고 리뷰까지 돌렸습니다. 리뷰가 찾은 결함 4건 중 1건만 고치고 3건을 이월했습니다.

---

## 2. 이번 회차에 끝난 것

### 2.1 W1 — CTA 라벨 정직화와 JSON-LD (커밋 d936023, 병합 d526be1)

| 파일 | 변경 |
| --- | --- |
| `src/data/site.ts` | `primaryCta.program.label` "프로그램 접속" → "요금 보기" |
| `src/pages/bidbox/index.astro` | 하드코딩 CTA 를 `primaryCta.program` 참조로 교체 |
| `src/layouts/BaseLayout.astro` | BIDBOX 페이지 한정 `SoftwareApplication` 노드 추가 |

`d936023` 은 cursor CLI 코디네이터가 띄운 codex 워커가 만든 커밋이었습니다. 저는
diff 를 열어 지시대로 들어갔는지 확인한 뒤 병합했습니다.

### 2.2 W2 — FAQ 데이터 모듈과 페이지 섹션 (커밋 125f8e9, 병합 a215ec4)

| 파일 | 변경 |
| --- | --- |
| `src/data/faq.ts` | 신규. 질문·답변 5건 |
| `src/pages/bidbox/pricing.astro` | `section` + `h2` + `dl/dt/dd` FAQ 섹션 |
| `src/pages/bidbox/service.astro` | 같은 구조 |
| `public/fonts/pretendard-variable-subset.woff2` | 52,176 → 50,172 바이트로 재생성 |

**W2 는 워커가 커밋하지 않은 상태였습니다.** `git status` 에 수정 3건과 미추적
2건이 그대로 있었습니다. `parallel-implementation-workers` 스킬 7장이 말하는 그대로
"커밋 없는 브랜치에는 병합할 것이 없습니다". 저는 worktree 안에서 명시적 경로만
스테이징해 커밋한 뒤 병합했습니다. `git add -A` 는 쓰지 않았습니다.

### 2.3 R1 — 리뷰 (커밋 c587ade, 병합 a808c9f)

kilo(`openrouter/stealth/space-bunny-alpha`, variant `max`) 가 7개 항목을 판정해
[`../analysis/검토_고도화_W1W2_20261002.md`](../analysis/검토_고도화_W1W2_20261002.md) 에
썼습니다. 차단 0건, 결함 3건, 확인 3건입니다.

Run 목표에는 "Muse Spark 리뷰어"로 적혀 있었지만 이主机에 muse 가 없고,
`docs/ops/ORCA_WORKERS.md` 1장은 리뷰어를 kilo 로 고정합니다. 명세가 우선이므로
kilo 로 갔습니다.

### 2.4 결함 1건 수정 (커밋 cdb6c33, 병합 74842db)

`src/layouts/BaseLayout.astro:49` 의 `applicationCategory: 'SoftwareApplication'` 을
`'BusinessApplication'` 으로 고쳤습니다.

근거: schema.org `applicationCategory` 는 "Type of software application,
e.g. 'Game, Multimedia'" 를 받는 속성이고, 공식 `SoftwareApplication` 예시는
`BusinessApplication` 을 씁니다. 원래 값은 `@type` 과 같은 문자열이라 자기참조였습니다.

---

## 3. 리뷰가 남긴 미처리 항목 (착수 가능)

| 항목 | 위치 | 내용 |
| --- | --- | --- |
| 단일 소스 위반 | `src/data/faq.ts:13`, `src/data/faq.ts:17` | `POINT_NOTE`(`src/data/pricing.ts:21-22`)와 요금 사용 규칙 문장을 복사해 다시 적었습니다. `POINT_NOTE` 가 바뀌면 faq.ts 가 조용히 뒤처집니다. 2026-10-02 사용자 결정으로 이월 |
| 카피 모순 | `src/pages/bidbox/pricing.astro:193` | 헤더 CTA 는 "요금 보기" 인데 다이얼로그 안은 여전히 "담당자가 포인트 충전과 프로그램 접속을 안내합니다". 같은 화면에서 서로 다른 서비스를 약속합니다. 2026-10-02 사용자 결정으로 이월 |
| 게이트의 사각지 | `scripts/verify.sh` 전체 | 구조화 데이터 검증이 한 줄도 없고, 페이지 간 카피 정합성 검사도 단일 소스 중복 검사도 없습니다. 2026-10-02 사용자 결정으로 문서만 남기고 검사 추가는 다음 회차로 |

**세 번째 항목이 이 배치의 가장 중요한 발견입니다.** 8단계 게이트 10개 항목이
전부 통과했는데 위 세 위험이 남았습니다. 게이트는 "깨지지 않은 것"만 증명합니다.

---

## 4. 검증한 것과 검증하지 못한 것

### 4.1 코디네이터가 직접 실행해 확인한 것

- `npm run verify` 를 병합 트리에서 2회 실행. 종료 코드 0. 8단계 전부 통과:
  - 1타입 체크 오류 0, 2빌드 통과, 3서빙 자동 포트 배정(54873),
    4링크 무결성 77건 깨진 참조 없음 + sitemap 7건 일치
  - 5렌더 8개 페이지 콘솔 오류 0건. 라이트 대비 15.88, 다크 19.46, CTA 44px
    (3장 기준선과 동일)
  - 6폰트 서브셋 "누락된 글자가 없습니다 (검사 문자 352개)" — 기준선 352와 동일
  - 7반응형·접근성 "0 issue group(s)", 320px `scrollWidth` 303
  - 8인터랙션 10개 항목 전부 `fail: null`
- `grep -c 'SoftwareApplication'` — BIDBOX 5개 페이지 각 1건, nani 3개 페이지 0건
- `npm run check:emoji` — 104개 파일, 이모지 없음
- 리뷰어 인용 재검증 — `faq.ts:13`·`:17`, `pricing.ts:21-22`, `demo.astro:50`·`:60`,
  `service.astro:112`, `pricing.astro:193`, `BaseLayout.astro:49` 모두 리뷰어 인용과 일치
- 리뷰어 6번 주장 재검증 — `grep` 으로 `faq` 를 읽는 검사 없음 확인,
  `ld+json`·`schema.org`·`structured` 를 찾는 검사 없음 확인
- schema.org 공식 문서로 `applicationCategory` 판정 확인
- 수정 후 빌드 산출물에서 `"applicationCategory":"BusinessApplication"` 확인,
  nani 3개 페이지에 `SoftwareApplication` 0건 유지 확인

### 4.2 검증하지 못한 것

- **리뷰어가 스스로 `npm run verify` 를 실행하지 않았습니다.** 8단계 통과는
  제 실측 결과를 인용한 것입니다. 리뷰어가 118줄 보고서 3절에 이 사실을 스스로 적었습니다.
- Google 리치 결과 테스트와 schema.org 밸리데이터를 실행하지 않았습니다.
  `applicationCategory` 판정은 스펙 문서와 코드 대조이며 실측 통과·실패 수치가 아닙니다.
- 320px 에서 FAQ `<dl>` 의 `md:grid-cols` 미적용 상태를 육안 확인하지 않았습니다.
  게이트는 오버플로우 0건만 봅니다.
- 사용자 관점의 카피 모순은 문서 비교 판단이며 실제 사용자 테스트가 아닙니다.
- 리뷰어의 첫 시도는 10분 이상 멈춰 재시도했습니다(5장).

---

## 5. 이번 회차가 남긴 절차 교훈

### 5.1 리뷰어의 첫 시도는 조사만 하고 멈췄습니다

토큰 카운터가 96.1K(10%)에서 고정되고 새 도구 호출이 없는 상태가 10분 이상
계속됐습니다. 화면 스피너는 돌기 때문에 "작업 중"으로 읽힙니다. 파일시스템을
봤더니 보고서가 없었습니다.

`--interrupt` 후 지시를 넣었더니 `QUEUED` 로 들어갔습니다. **입력은 소비될 턴이
시작되어야 큐에서 빠집니다.** 이미 멈춘 턴 뒤에 넣은 입력은 영원히 대기합니다.
해결은 `worker-abandon` → `terminal close` → `task-update --status ready` →
새 터미널 → 새 Task 순서였습니다.

두 번째 시도에서는 조사 단계를 명세에서 통째로 뺐습니다. 코디네이터가 직접 실행해
확인한 사실을 표로 넘기고 "판정과 파일 쓰기"만 남겼더니 1분 21초에 끝났습니다.
**긴 명세는 멈추게 하고, 조사 결과를 명세에 넣어 좁히는 쪽이 빠릅니다.**

### 5.2 리뷰어의 `worker_done` 은 `check` 로 안 보일 수 있습니다

R1이 `msg_639f7637d9a0` 을 보냈다고 보고했지만 `orca orchestration check` 는
아직 ack되지 않은 이전 delivery(W2 의 메시지)만 반복해서 보여줬습니다.
`orca orchestration inbox` 로 직접 찾아서 확인했습니다. **리뷰어의 자기보고를
그대로 믿지 않는 것이 이 배치에서 두 번 필요했습니다.**

### 5.3 `node_modules` 링크의 상대 경로는 워크트리 깊이에 의존합니다

스킬 문서의 `ln -s ../../node_modules node_modules` 는 워크트리가 저장소 바로 아래에
있을 때만 맞습니다. 이主机의 Orca 워크트리는
`/Users/kwanbum/orca/workspaces/<repo>/<unit>/` 로 두 단계 깊어서
`/Users/kwanbum/orca/workspaces/node_modules` 를 가리켰습니다.
절대 경로로 링크하십시오.

### 5.4 `origin/main` 이 푸시 전이면 `fetch` 후 `reset --hard origin/main` 은 되돌립니다

코디네이터 수정분을 워크트리에 반영하려다 로컬 `main` 이 푸시 전인 상태에서
`origin/main` 으로 리셋해 커밋을 잃을 뻔했습니다. 리셋 전에 `git log --oneline -1`
로 어느 쪽을 기준으로 세우는지 확인하십시오.

---

## 6. 다음 세션

### 6.1 착수 순서

1. 이 문서를 먼저 읽으십시오.
2. [`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) 4장과 5장을 보십시오.
   4.1 은 배포뿐이고, 3장의 이월 항목 세 건이 실제 착수 대상입니다.
3. [`../analysis/검토_고도화_W1W2_20261002.md`](../analysis/검토_고도화_W1W2_20261002.md)
   를 보십시오. 3장의 근거가 됩니다.
4. [`../ops/ORCA_WORKERS.md`](../ops/ORCA_WORKERS.md) 를 보십시오. 리뷰어 기동은
   3장과 4.6절입니다.

### 6.2 착수할 수 있는 항목

3장 표의 세 건입니다. 셋 다 제품 코드를 건드리지 않으므로 `AGENTS.md` 7장
금지 행위에 걸리지 않습니다. 첫 번째와 두 번째는 한 워커로, 세 번째는
`scripts/verify.sh` 를 건드리므로 별도 워커로 나누십시오.

**`AGENTS.md` 8장 검증 표를 늘려야 한다면 그 파일은 Hermes 가 보호하므로**
저장소 밖의 에이전트에게 편집할 문장을 diff 형태로 넘깁니다
([`../ops/DO_NOT_REPEAT.md`](../ops/DO_NOT_REPEAT.md) 9.1).

### 6.3 하지 말 것

- 3장 이월 3건을 "이번 회차에서 처리하지 않았다"는 이유로 착수 금지 목록에
  되돌리지 말 것. 이미 사용자 결정을 받았습니다.
- 게이트 사각지를 문서만으로 메우지 말 것. 실제 검사를 넣어야 합니다.
- `origin/main` 과 로컬 `main` 이 어긋난 상태에서 워크트리를 만들지 말 것.
  이번 회차에는 그 상태였습니다.

---

## 7. 게이트 결과 (74842db)

`npm run verify` 를 병합 트리에서 실행했습니다.

| 단계 | 결과 |
| --- | --- |
| 1 타입 체크 | `astro check` 오류 0 |
| 2 빌드 | 통과, 8페이지 |
| 3 dist 서빙 | 통과, 포트 자동 배정 |
| 4 링크 무결성 | 77건 검사, 깨진 참조 0, sitemap 7건 일치 |
| 5 렌더·스타일 | 8페이지 콘솔 오류 0건. 라이트 15.88, 다크 19.46, CTA 44px |
| 6 폰트 서브셋 | 누락 0건, 검사 문자 352개 |
| 7 반응형·접근성 | 8페이지 통과, 0 issue group |
| 8 인터랙션 | 10개 항목 전부 `fail: null` |

종료 코드 0. 이번 회차는 카피와 구조화 데이터만 바꿨으므로 3장 기준선 수치는
그대로입니다.
