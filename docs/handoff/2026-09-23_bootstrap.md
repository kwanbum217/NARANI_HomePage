# 인수인계 — 저장소 최초 구성 (2026-09-23)

> **작성일**: 2026-09-23
> **상태**: 1차 구현 및 검증 완료. 결제·폼 백엔드 미연결
> 다음 세션은 이 문서를 읽고 시작합니다.

---

## 1. 한 줄 요약

Google Slides 구성안 9장을 Astro 정적 사이트 7페이지로 옮기고, 검증 파이프라인과
문서 체계를 구성했습니다. 결과물은 배포 가능한 `dist/` 이며, 결제와 폼 전송은
아직 연결되어 있지 않습니다.

---

## 2. 지금 바로 할 수 있는 것

```bash
cd /Users/kwanbum/Documents/korea_IT/lanhchain_ai_vision/narani_homepage
npm ci
npm run dev        # 육안 확인
npm run verify     # 검증 (macOS)
```

---

## 3. 다음 세션 착수 순서

| 순서 | 작업 | 이유 |
| --- | --- | --- |
| 1 | `npm run dev` 로 7페이지 육안 확인 | 추출 세션이 이미지를 볼 수 없어 테마가 추론값입니다 |
| 2 | 이메일 표기 확정 | 오타면 문의가 도달하지 않습니다 |
| 3 | 폼 엔드포인트 연결 | 현재 시뮬레이션입니다 |
| 4 | 요금 결제를 제품 본체 라우트로 연결 | 이 저장소에 서버를 두지 않는 원칙 |
| 5 | sitemap, robots, OG 이미지 | 검색 노출과 공유 카드 |
| 6 | 도메인 연결 및 첫 배포 | `astro.config.mjs` 의 `site` 교체 |

각 항목의 상태와 근거는
[`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) 4장이 정본입니다.

---

## 4. 이 저장소를 이해하는 최단 경로

1. [`../../AGENTS.md`](../../AGENTS.md) — 규칙 정본
2. [`../../SKILLS.md`](../../SKILLS.md) — 작업 유형별 문서 매핑
3. [`../README.md`](../README.md) — 문서 인덱스
4. [`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) — 현재 상태와 기준선
5. [`../design/DECK_TO_SITE_MAP.md`](../design/DECK_TO_SITE_MAP.md) — 페이지 카피의 출처
6. [`../ops/DO_NOT_REPEAT.md`](../ops/DO_NOT_REPEAT.md) — 이미 실패한 접근

---

## 5. 구조 요약

```
src/pages/           7개 페이지 (라우트 생성의 유일한 위치)
src/layouts/         BaseLayout (head, canonical, OG, 헤더, 푸터, 스크립트)
src/components/      Logo, Header, Footer
src/data/            site.ts (브랜드·내비·CTA·기능), pricing.ts (요금)
src/styles/          global.css (토큰 + 컴포넌트 클래스)
src/scripts/         app.js (Alpine 컴포넌트 3종)
scripts/             verify.sh, check-links.mjs, check-no-emoji.mjs, audit/
docs/                context, design, spec, ops, analysis, handoff, changelogs
.agents/skills/      반복 작업 절차 6종
```

---

## 6. 결정 사항과 근거

| 결정 | 근거 |
| --- | --- |
| Astro 정적 사이트 채택 | 브랜드 변경 시 수정 지점을 4개 파일로 고정 |
| React 미도입 | 클라이언트 인터랙션이 3개뿐. Alpine 으로 충분 |
| 서버 미도입 | 결제·포인트는 제품 본체(`refac_bid_box`) 소관 |
| Tailwind 컴파일 전환 | CDN 은 프로덕션 비권장, 빌드 시점 최적화 부재 |
| 두 레지스터 유지 | 원본 구성안이 회사는 라이트, 제품은 다크 |
| 실측 수치 단일화 | 상위 저장소에서 수치 복사로 사고가 있었음 |

상세는 [`../design/ADR-0001-astro-static-marketing-site.md`](../design/ADR-0001-astro-static-marketing-site.md)
를 참조하십시오.

---

## 7. 검증 상태

검증 도구가 배선되어 있으므로 다음 세션은 결함 재발을 자동으로 잡을 수 있습니다.
기준선과 판정은
[`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) 3장이 정본이며, 이
문서에는 수치를 옮기지 않습니다.

검증하지 못한 범위는
[`../spec/QA_AND_A11Y.md`](../spec/QA_AND_A11Y.md) 7장에 정리했습니다.

---

## 8. 주의 사항

- 이 저장소는 1인 작업이며 Pull Request 를 만들지 않습니다. 작업 브랜치에서 커밋하고
  `main` 에 `--no-ff` 로 병합합니다.
- 최초 부트스트랩 커밋 1건만 `main` 에 직접 있습니다.
- 커밋 메시지 subject 는 한국어입니다. `scripts/validate-commit-message.mjs` 가
  검사합니다.
- 문서에 실측 수치를 복사하지 않습니다. 정본은 `CURRENT_STATE.md` 하나입니다.
