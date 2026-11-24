---
name: local-server
description: >
  이 저장소 세션을 열거나 사이트를 브라우저로 볼 때 개발 서버(astro dev)와
  빌드 미리보기(astro preview)를 띄웁니다. 세션 시작, 개발 서버, npm run dev,
  미리보기, npm run preview, localhost, 브라우저로 보기, /local-server 에서
  사용합니다. 이미 떠 있으면 다시 띄우지 않고, 주소는 스크립트 출력만 사용합니다.
---

# local-server

세션을 열면 개발 서버를 확인합니다. 빌드 결과를 보겠다는 요청이 있을 때만
미리보기 서버를 켭니다. 절차는 이 파일과 `scripts/ensure-server.sh` 에만 있습니다.
로컬 개발의 배경은 [`../../../docs/ops/BUILD_AND_DEPLOY.md`](../../../docs/ops/BUILD_AND_DEPLOY.md) 입니다.

## 세션을 열 때

저장소 루트에서 다음만 실행합니다.

```bash
bash .agents/skills/local-server/scripts/ensure-server.sh dev
```

stdout 한 줄의 URL 을 사용자에게 한국어로 알립니다. 예: `dev started http://127.0.0.1:54321/` 이면
"개발 서버가 http://127.0.0.1:54321/ 에서 응답합니다." 포트 번호는 예시이며,
항상 그 줄에 적힌 주소를 그대로 옮깁니다.

이어서 사용자가 시킨 작업을 진행합니다. 브라우저를 열지는 않습니다.

## 명령

| 명령 | 하는 일 |
| --- | --- |
| `bash .agents/skills/local-server/scripts/ensure-server.sh dev` | 개발 서버. `src/` 를 읽고 저장하면 갱신됩니다. |
| `bash .agents/skills/local-server/scripts/ensure-server.sh preview` | `dist/` 를 제공합니다. |
| `bash .agents/skills/local-server/scripts/ensure-server.sh status` | 둘 다의 주소 또는 꺼짐. |
| `bash .agents/skills/local-server/scripts/ensure-server.sh stop` | 이 저장소에서 띄운 둘을 멈춥니다. |
| `bash .agents/skills/local-server/scripts/ensure-server.sh stop dev` | 개발 서버만 멈춥니다. |
| `bash .agents/skills/local-server/scripts/ensure-server.sh stop preview` | 미리보기만 멈춥니다. |

stdout 형식은 `dev already URL`, `dev started URL`, `dev up URL`, `dev down`,
`dev stopped` 입니다. preview 도 같은 단어입니다.

## 미리보기

`dist/index.html` 이 없으면 스크립트가 종료 코드 2 로 끝납니다. 그때만
`npm run build` 를 실행하고 preview 를 다시 호출합니다.

미리보기는 그 시점의 `dist/` 를 제공합니다. 소스를 다시 빌드한 뒤에는
`stop preview` 다음 preview 를 다시 실행합니다. 고친 소스를 바로 보려면
개발 서버를 사용합니다.

## 브라우저

사용자가 화면을 보자고 한 경우에만, 스크립트가 출력한 URL 로 브라우저를 엽니다.
macOS 에서는 `open` 에 그 URL 을 넘깁니다. 세션을 열자마자 브라우저를 띄우지 않습니다.

## 주소

스크립트가 고른 주소만 사용합니다. 4321 이나 다른 번호를 가정해 접속하거나
다른 프로세스를 종료하지 않습니다. 멈출 때는 위 `stop` 만 사용합니다.
`npm run verify` 는 검사 동안만 별도 포트를 열고 끝나므로, 사이트를 보는
용도로는 이 스크립트를 사용합니다.

`node_modules/.bin/astro` 가 없으면 `npm ci` 를 한 번 실행한 뒤 같은 명령을
다시 실행합니다.

기동에 실패하면 stderr 와 `.astro/dev.log` 또는 `.astro/preview.log` 를 읽고,
같은 명령을 반복해 두 번째 서버를 만들지 않습니다.

## 에이전트가 이 스킬을 찾는 곳

본문은 `.agents/skills/local-server/` 하나입니다.
`.claude/skills/local-server` 는 그 디렉터리를 가리키는 링크입니다.

| 에이전트 | 읽는 경로 | 호출 |
| --- | --- | --- |
| Claude Code | `.claude/skills/local-server` | `/local-server` |
| Codex | `.agents/skills/local-server` | `$local-server` |
| OpenCode | `.agents/skills/local-server` | 스킬 도구로 `local-server` |
| Grok | `.agents/skills/local-server` | `/local-server` |
| Cursor | `.agents/skills/local-server` | `/local-server` |

같은 이름의 사본을 다른 디렉터리에 만들지 않습니다. 절차를 바꿀 때는
이 파일과 `scripts/ensure-server.sh` 만 고칩니다.
