---
name: a11y-audit
description: npm run verify 로 접근성과 반응형 문제를 찾고 최소 수정하는 절차입니다. 레이아웃이 깨지거나 터치 타겟, 라벨, 대비 문제를 다룰 때 사용합니다.
---

# a11y-audit

검증 도구가 이미 배선되어 있으므로 새로 만들지 않고 실행합니다.

## 실행

```bash
npm run verify
```

6단계 중 5단계(반응형·접근성)가 이 스킬의 대상입니다. 실패 시 출력에서 문제 요소와
좌표를 확인할 수 있습니다.

개별 페이지만 보려면 도구를 직접 호출합니다.

```bash
python3 -m http.server 4322 --bind 127.0.0.1 --directory dist &
swift scripts/audit/a11y.swift http://127.0.0.1:4322 "/company/|320x900"
```

## 도구가 검사하는 것

| 검사 | 실패 기준 |
| --- | --- |
| 문서 가로 오버플로우 | `document.scrollWidth` 가 뷰포트를 초과 |
| 라벨 없는 입력 | `label`, `aria-label`, `aria-labelledby`, 감싸는 `label` 이 모두 없는 입력 |
| 작은 터치 타겟 | 내비 링크와 버튼이 44 x 44 px 미만 |
| `h1` 개수 | 페이지당 2개 이상 |
| `html lang` | 누락 |
| 이미지 `alt` | 누락 |

스크롤 컨테이너 내부 요소는 오버플로우 판정에서 제외합니다. 문서 폭을 밀지 않기
때문입니다.

## 자주 나오는 문제와 수정

| 증상 | 원인 | 수정 |
| --- | --- | --- |
| 320px 에서 문서가 밀림 | 그리드 자식의 기본 `min-width: auto` 가 내용 크기를 밀어냄 | 그리드 자식에 `min-w-0` 을 추가. 긴 코드 블록은 조상에 `min-w-0`, 자신에 `max-w-full overflow-x-auto` |
| 내비 링크 높이 부족 | 패딩 부족 | `min-height: 44px` 와 `align-items: center` 를 컴포넌트 CSS 에 추가 |
| 입력 라벨 없음 | placeholder 를 라벨로 사용 | `<label for>` 를 추가하고 placeholder 는 예시 용도로만 |
| 대비 부족 | 보조 텍스트 색이 배경과 가까움 | `--nani-muted` / `--bb-muted` 토큰을 조정하고 실측으로 확인 |
| 포커스 안 보임 | `outline: none` 단독 사용 | `:focus-visible` 에 점선 2px, 오프셋 3px 지정 |
| iOS 에서 입력 시 화면 확대 | 입력 글자 크기 16px 미만 | 입력 `font-size` 를 1rem 이상으로 유지 |

## 절차

1. `npm run verify` 로 실패 지점을 확인합니다.
2. 위 표에서 원인을 찾습니다. 표에 없으면 실제 DOM 을 확인합니다.
3. 최소 범위로 수정합니다. 전역 토큰을 건드리면 다른 페이지가 함께 바뀌므로
   영향 범위를 먼저 확인합니다.
4. 같은 문제가 다른 페이지에도 있는지 확인합니다. 공통 컴포넌트에서 고치면 한 번에
   해결됩니다.
5. 다시 `npm run verify` 를 실행합니다.
6. 실측값이 바뀌었으면
   [`../../docs/context/CURRENT_STATE.md`](../../docs/context/CURRENT_STATE.md) 의
   기준선 표를 갱신합니다.

## 하지 않는 것

- 검증 도구의 판정 기준을 느슨하게 만들어 통과시키지 않습니다.
- 실패를 무시하고 완료라고 보고하지 않습니다.
- 스크린 리더 확인 없이 "접근성 완료" 라고 쓰지 않습니다. 자동 검사는 하한입니다.

## 검증 범위 밖

- 실제 스크린 리더(VoiceOver) 동작
- WebKit 외 브라우저
- 200% 확대 시각 확인

이 항목들은 배포 전 육안 확인이 필요하며,
[`../../docs/spec/QA_AND_A11Y.md`](../../docs/spec/QA_AND_A11Y.md) 7장에 정리되어
있습니다.
