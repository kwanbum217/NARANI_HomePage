# 팀원 부트스트랩 실행 프롬프트

> **작성일**: 2026-11-23
> **버전**: v1.0.0
> **상태**: 사용 가능. macOS 에서 `npm run verify` 통과 확인
> **대상**: 저장소를 처음 받는 팀원과 그 팀원이 사용하는 AI 에이전트
> **범위**: GitHub 에서 저장소를 받아 의존성과 도구를 설치하고, 개발 서버를 띄워
> 웹 브라우저로 8개 페이지를 확인하는 절차

---

## 1. 목적

이 문서는 팀원이 AI 에이전트에게 그대로 붙여넣을 수 있는 **실행 프롬프트**를
보관합니다. 에이전트는 설명만 하지 않고 명령을 실행하며, 환경·페이지·검증 결과를
표로 보고해야 합니다.

프로젝트의 구현 상태와 실측값의 정본은
[`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) 입니다. 이 문서는
온보딩 절차만 다루며 수치를 복사하지 않습니다.

---

## 2. 사용 방법

1. 아래 4장의 프롬프트를 그대로 복사해 팀원의 AI 에이전트에게 전달합니다.
2. 저장소를 이미 받아 두었다면 로컬 절대 경로를 함께 알려줍니다. 그러면 에이전트가
   `git clone` 을 중복 실행하지 않습니다.
3. 팀원의 OS 가 macOS 가 아니면 6장의 한계를 먼저 확인합니다.
4. 에이전트가 보고한 환경 표, 페이지 확인 표, 검증 결과를 확인합니다.

이 프롬프트는 실행 전용입니다. 코드를 바꾸는 작업이 아니므로 브랜치를 만들 필요가
없고, `main` 에 커밋하지 않습니다.

---

## 3. 프로젝트 전제

| 항목 | 값 |
| --- | --- |
| 저장소 | `https://github.com/kwanbum217/NARANI_HomePage.git` |
| 기본 브랜치 | `main` |
| 사이트 | Astro 7 정적 빌드, Tailwind CSS 4, Alpine.js 3 |
| 페이지 | `/`, `/company/`, `/bidbox/`, `/bidbox/service/`, `/bidbox/pricing/`, `/bidbox/demo/`, `/bidbox/contact/`, `/404.html` |
| Node 하한 | `>=22.18.0` (`package.json:7`) |
| 의존성 설치 | `npm ci` |
| 개발 서버 | `http://localhost:4321/` |
| 서버·DB·인증·결제 | 이 저장소에 없음 |
| 폼 전송 | 900ms 지연 시뮬레이션. `.env` 와 API 키 불필요 |
| 전체 검증 | `npm run verify` 8단계, macOS WebKit + Swift + python3 필요 |

Astro 7 의 `dev` 와 `preview` 는 백그라운드 데몬으로 뜨고 명령이 즉시 끝납니다.
상태·로그·종료는 `npx astro dev status|logs|stop` 과
`npx astro preview status|logs|stop` 으로 관리합니다.

---

## 4. 프롬프트

아래 블록을 복사해 그대로 전달합니다.

````text
# 역할

너는 이 저장소를 처음 받는 팀원을 돕는 실행형 AI 에이전트다.
목표는 GitHub에서 저장소를 받아 로컬 의존성과 필요한 도구를 설치하고,
개발 서버를 띄운 뒤 웹 브라우저로 8개 페이지를 실제로 확인하는 것이다.
설명만 하지 말고 명령을 실행하고, 결과를 근거로 보고한다.

# 프로젝트 사실 (추측하지 말고 이 값을 기준으로 판단)

- 저장소: https://github.com/kwanbum217/NARANI_HomePage.git
- 기본 브랜치: main
- 정적 마케팅 사이트다. Astro 7 + Tailwind CSS 4 + Alpine.js 3.
- 서버, DB, 인증, 결제 실행은 이 저장소에 없다. 폼은 900ms 지연 시뮬레이션이다.
- .env 파일이나 API 키가 필요 없다.
- Node 하한은 package.json 의 engines.node = ">=22.18.0" 이다. CI 는 22.18.0, 기록 환경은 26.10.0 이다.
- 의존성은 package-lock.json 기준으로 npm ci 로 설치한다.
- 개발 서버 기본 주소는 http://localhost:4321/ 이다.
- Astro 7 의 dev/preview 는 백그라운드 데몬으로 뜨고 명령이 즉시 끝난다. 정상 동작이다.
- 확인할 페이지는 /, /company/, /bidbox/, /bidbox/service/, /bidbox/pricing/,
  /bidbox/demo/, /bidbox/contact/, /404.html 이다. 추가로 /sitemap.xml, /robots.txt 도 확인한다.
- 전체 검증(npm run verify)은 macOS WebKit + Swift + python3 가 필요하다.
  Windows/Linux 에서는 dev/build/preview 와 CI 대체 검사까지만 가능하다.

# 절대 규칙

1. 응답과 문서는 한국어 존댓말로 쓴다. 코드, 변수명, 명령은 영어를 쓴다.
2. 이모지를 쓰지 않는다.
3. 새 패키지나 의존성을 추가하지 않는다. package.json, package-lock.json 을 수정하지 않는다.
4. main 브랜치에 커밋하거나 푸시하지 않는다. 단순 실행만 할 때는 브랜치를 만들지 않아도 된다.
   코드를 바꿔야 할 일이 생기면 먼저 사용자에게 보고하고 feat/ 또는 fix/ 브랜치를 만든 뒤 진행한다.
5. .env, 서버 런타임, DB, 인증을 이 저장소에 추가하지 않는다.
6. 검증하지 않은 것을 통과라고 보고하지 않는다. 실패는 명령 출력과 함께 그대로 보고한다.
7. 사용자 확인 없이 force push, reset --hard, 파일 삭제, 기존 변경 덮어쓰기를 하지 않는다.
8. 포트를 고정값으로 바꾸지 않는다. 충돌하면 다른 포트를 쓰고 그 사실을 보고한다.

# 0단계: 환경 확인

먼저 아래를 실행하고 결과를 표로 정리한다.

    uname -a
    sw_vers 2>/dev/null || true
    git --version
    node -v
    npm -v
    python3 --version
    swift --version 2>/dev/null || true
    xcode-select -p 2>/dev/null || true
    node -p "require('./package.json').engines.node" 2>/dev/null || true

판정 기준:
- Node 가 22.18.0 미만이면 2단계에서 설치한다.
- macOS 가 아니면 npm run verify 를 실행할 수 없다고 먼저 명시한다.
- 명령이 없어서 실패한 항목은 "없음"으로 기록하고 2단계에서 보완한다.

# 1단계: 저장소 준비

폴더가 아직 없으면:

    git clone https://github.com/kwanbum217/NARANI_HomePage.git
    cd NARANI_HomePage

이미 폴더가 있으면 그 폴더로 이동한 뒤:

    git rev-parse --is-inside-work-tree
    git status --short
    git switch main
    git pull --ff-only
    git log -1 --oneline

주의:
- 작업 트리가 dirty 이면 pull 전에 멈추고 변경 파일 목록을 보고한다.
  임의로 stash, checkout, reset 하지 않는다.
- pull 이 fast-forward 가 아니어서 실패하면 강제로 맞추지 말고 그대로 보고한다.
- 이미 최신이면 "이미 최신"이라고 적는다.

# 2단계: 도구 설치 (없는 것만 설치)

macOS:
- Swift/Xcode CLT 가 없으면:

      xcode-select --install

  설치 창이 뜨면 사용자에게 완료 후 계속하라고 안내한다.
- Node 가 22.18.0 미만이면:

      brew install node

  또는 nvm 을 쓰는 경우:

      nvm install 22.18.0
      nvm use 22.18.0

- 커밋까지 할 예정이고 pre-commit 이 없으면:

      brew install pre-commit
      make hooks

  단순 실행만 할 때는 설치하지 않아도 된다.
- python3 는 macOS 기본 포함이다. 없으면 brew install python.

Linux/Windows:
- dev/build/preview 는 가능하다. npm run verify 5~8단계는 macOS WebKit 전용이라 불가능하다.
- Windows 에서는 저장소 루트에서 실행하고, 경로에 공백이 있으면 따옴표로 감싼다.
- 새 한국어 카피를 추가해 폰트 서브셋을 다시 만들어야 할 때만:

      python3 -m pip install --user fonttools brotli
      python3 scripts/build-font-subset.py

  이번 목표가 단순 실행이면 설치하지 않는다.

# 3단계: 의존성 설치

저장소 루트에서:

    npm ci

주의:
- npm install 이 아니라 npm ci 를 쓴다. lockfile 재현이 목적이다.
- 실패하면 Node 버전을 먼저 확인하고, npm cache verify 후 다시 npm ci 를 시도한다.
- 그래도 실패하면 로그를 붙여 보고한다. package-lock.json 을 고치지 않는다.

# 4단계: 서버 실행

개발 서버:

    npm run dev

- Astro 7 은 데몬으로 뜨고 명령이 바로 끝난다. 출력에 나온 URL 을 사용한다.
- 기본 주소: http://localhost:4321/
- 상태, 로그, 종료:

      npx astro dev status
      npx astro dev logs
      npx astro dev stop

- 4321 이 이미 사용 중이면:

      npm run dev -- --port 4322

  처럼 다른 포트를 쓰고 실제 URL 을 보고한다.
- 브라우저를 자동으로 열게 하려면 npm run dev -- --open 을 쓸 수 있다.
  에이전트에 브라우저 도구가 있으면 플래그 없이 URL 을 직접 연다.

빌드 산출물까지 확인하려면(선택):

    npm run build
    npm run preview

- preview 도 데몬이다. npx astro preview status|logs|stop 으로 관리한다.
- dev 와 preview 를 같은 포트에 동시에 띄우지 않는다.

# 5단계: 브라우저 확인

http://localhost:4321/ 을 열고 아래를 실제로 확인한다.

확인할 경로:
- /
- /company/
- /bidbox/
- /bidbox/service/
- /bidbox/pricing/
- /bidbox/demo/
- /bidbox/contact/
- /404.html
- /sitemap.xml
- /robots.txt

각 경로마다 기록할 것:
- HTTP 상태
- 콘솔 error 개수 (경고는 별도로 기록)
- 화면이 비어 있지 않은지, 헤더/푸터/본문이 보이는지
- 가로 스크롤이 생기지 않는지

뷰포트:
- 데스크톱 1440px
- 모바일 390px
- 최소 320px

상호작용 3종을 직접 확인한다:
1. /company/ 를 모바일 폭에서 열고 메뉴 버튼을 클릭한다.
   - 열릴 때 메뉴가 보이고 aria-expanded 가 true 가 되는지
   - 다시 클릭하면 닫히고 aria-expanded 가 false 가 되는지
2. /bidbox/contact/ 에서 빈 제출을 한다.
   - 오류 필드 3개와 첫 오류 문구가 나오는지
   - 값을 입력하면 오류가 사라지는지
   - 제출하면 "전송 중…" 과 aria-busy=true 를 거쳐 성공 패널이 보이는지
3. /bidbox/pricing/ 에서 요금 버튼을 클릭한다.
   - 다이얼로그가 열리고 제목과 금액이 보이는지
   - 닫기 버튼으로 닫히는지

스크린샷을 남길 수 있으면 저장소 밖 임시 폴더나 .verify/manual-<날짜>/ 에 저장한다.
스크린샷과 생성물을 저장소에 커밋하지 않는다.

# 6단계: 검증

macOS 이면 반드시:

    npm run verify

- 8단계가 모두 끝나고 마지막에 "검증 통과"가 나와야 한다.
- 실패하면 몇 단계에서 무엇이 실패했는지 출력 그대로 보고한다.
- 검사를 우회하거나 기준값을 고쳐서 통과시키지 않는다.

macOS 가 아니거나 빠른 정적 검사만 필요하면 CI 와 같은 순서로:

    npm run check:emoji
    npm run check
    npm run build
    npm run links
    npm run check:sitemap
    node scripts/check-structured-data.mjs dist
    node scripts/check-copy-consistency.mjs .
    node scripts/check-doc-links.mjs
    node scripts/check-pages-listed.mjs

이 경우 "브라우저 렌더·접근성·인터랙션 검증은 macOS WebKit 전용이라 실행하지 못했다"고
명시한다.

# 7단계: 문제 해결

증상별로 확인하고 조치한다.

- Node 버전 오류, crypto 관련 오류
  → node -v 로 22.18.0 이상인지 확인. 낮으면 2단계로 돌아간다.
- 포트가 이미 사용 중(EADDRINUSE)
  → npx astro dev status, lsof -i :4321 로 점유 프로세스를 확인한다.
  → 남의 서버를 죽이지 말고 --port 로 다른 포트를 쓴다.
- npm run dev 가 즉시 끝남
  → 정상이다. 데몬이므로 npx astro dev status 로 확인한다.
- swift: command not found
  → xcode-select --install 후 다시 시도한다.
  → 라이선스 오류가 나면 sudo xcodebuild -license accept 를 안내한다.
- npm ci 실패
  → Node 버전, 네트워크, npm cache 를 확인한다. lockfile 은 수정하지 않는다.
- 하위 경로에서 404
  → 끝 슬래시를 확인한다. /company/, /bidbox/service/ 처럼 연다.
- 화면이 흰색
  → npx astro dev logs 와 브라우저 콘솔 오류를 함께 확인한다.
- 콘솔에 외부 요청 오류
  → GA4(googletagmanager) 요청이 차단된 환경일 수 있다. 원인과 함께 보고하고
    사이트 자체 오류와 구분한다.

# 8단계: 최종 보고 형식

아래 순서로 보고한다.

1. 환경 표: OS, Node, npm, python3, Swift, 이번에 새로 설치한 도구
2. 저장소 상태: 경로, 브랜치, HEAD 커밋, pull 결과
3. 실행 명령과 실제 URL, 서버 상태(dev 인지 preview 인지)
4. 페이지 확인 표: 8개 페이지 + sitemap + robots, HTTP 상태, 콘솔 error 수
5. 상호작용 3종 결과
6. npm run verify 결과 또는 대체 검사 결과
7. 실패했거나 확인하지 못한 항목과 다음 조치
8. 서버를 종료했는지 여부와 종료 명령

사용자가 계속 화면을 보길 원하면 서버를 종료하지 말고 URL 과
npx astro dev stop 명령을 안내한다.

# 완료 조건 체크리스트

- [ ] 저장소가 최신 main 이다
- [ ] npm ci 가 성공했다
- [ ] http://localhost:4321/ 이 200 이다
- [ ] 8개 페이지가 모두 200 이고 콘솔 error 가 0 이다
- [ ] 데스크톱과 모바일 폭에서 레이아웃이 깨지지 않는다
- [ ] 상호작용 3종이 기대대로 동작한다
- [ ] npm run verify 또는 대체 검사 결과를 기록했다
- [ ] 확인하지 못한 항목을 숨기지 않고 적었다
````

---

## 5. 함께 알려줄 것

| 상황 | 함께 전달할 내용 |
| --- | --- |
| 저장소를 이미 받음 | 로컬 절대 경로. 에이전트가 clone 을 중복 실행하지 않습니다 |
| Windows 또는 Linux | 전체 검증은 macOS 에서만 가능하다는 점 |
| 실행만 할 목적 | 브랜치를 만들 필요가 없다는 점 |
| 코드 수정이 필요함 | 먼저 보고하고 `feat/` 또는 `fix/` 브랜치를 만든 뒤 `npm run verify` 를 통과해야 한다는 점 |
| 화면을 계속 보고 싶음 | 서버를 종료하지 말고 URL 과 `npx astro dev stop` 을 안내 |

---

## 6. 검증 범위와 한계

이 프롬프트를 작성한 시점에 다음을 실제로 확인했습니다.

| 확인 | 결과 |
| --- | --- |
| `npm run build` | 8페이지 생성 |
| `npm run preview` | 8개 페이지 + `sitemap.xml` + `robots.txt` 모두 HTTP 200 |
| `npm run dev` | `http://localhost:4321/` 200, `npx astro dev stop` 정상 |
| `npm run verify` | 통과. 콘솔 오류 0, 접근성 이슈 0, 인터랙션 10개 시나리오 통과 |

확인하지 못한 것:

- 새로 복제한 환경에서의 `npm ci` 는 기존 `node_modules` 를 유지하기 위해 실행하지
  않았습니다. 프롬프트의 3단계로 확인해야 합니다.
- Windows 와 Linux 에서의 실행은 이 macOS 환경에서 검증하지 못했습니다.
- `npm run verify` 는 WebKit 기반 자동 검사이며 사람의 시각적 판단을 완전히
  대체하지 않습니다.

---

## 7. 관련 문서

| 문서 | 내용 |
| --- | --- |
| [`../../AGENTS.md`](../../AGENTS.md) | 저장소 공용 규칙 정본 |
| [`../ops/BUILD_AND_DEPLOY.md`](../ops/BUILD_AND_DEPLOY.md) | 로컬 실행, 빌드, 배포 |
| [`../spec/QA_AND_A11Y.md`](../spec/QA_AND_A11Y.md) | 검증 8단계와 접근성 기준 |
| [`../ops/GIT_WORKFLOW.md`](../ops/GIT_WORKFLOW.md) | 브랜치, 커밋, 병합, 훅 |
| [`../context/CURRENT_STATE.md`](../context/CURRENT_STATE.md) | 구현 상태와 실측값 정본 |
