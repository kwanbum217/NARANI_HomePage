#!/usr/bin/env bash
#
# narani_homepage 정적 사이트 검증.
# 타입 체크 -> 빌드 -> dist 로컬 서빙 -> 링크 무결성 / 렌더 / 접근성 / 인터랙션 감사.
# 실패 시 종료 코드 1 을 반환하므로 CI 에서 그대로 사용할 수 있습니다.
#
# 사용법: scripts/verify.sh
# 환경변수:
#   PORT (선택) — dist 를 서빙할 포트. 미지정이면 빈 포트를 자동으로 고릅니다.
#   OUT  (선택) — 스크린샷 출력. 기본 .verify
#
# PORT 를 자동 선택하는 이유: 병렬 워커가 각자 worktree 에서 이 스크립트를
# 돌립니다. 고정 기본값을 두면 같은 포트를 서로 다른 worktree 의 dist 가
# 먼저 점유해, 나중에 실행한 쪽이 조용히 남의 dist 를 검증하게 됩니다.
# 2026-09-28 에 실제로 이런 일이 났습니다. 남의 화면이 통과하면 통과로 오인되고
# 자기 변경은 전혀 검증되지 않은 채 넘어갑니다.
# PORT 를 명시하면 그 값을 그대로 씁니다(디버깅용). 단, 이미 쓰였으면
# 아래에서 실패합니다.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 빈 포트를 하나 고릅니다. OS 가 bind(0) 으로 정해 주는 지연 할당 포트를
# 그대로 내달라고 요청하므로, 별도의 탐색 루프가 필요 없습니다.
# 이 포트는 곧 다른 프로세스에게 반환되므로 사용 직전에 한 번 더 확인합니다.
pick_free_port() {
  python3 -c 'import socket
s = socket.socket()
s.bind(("127.0.0.1", 0))
print(s.getsockname()[1])
s.close()'
}

if [ -n "${PORT:-}" ]; then
  PORT_SOURCE="환경변수 PORT=${PORT}"
else
  PORT="$(pick_free_port)"
  PORT_SOURCE="자동 배정(빈 포트 탐색)"
fi
BASE="http://127.0.0.1:${PORT}"
OUT="${OUT:-${ROOT}/.verify}"

# 검증 대상 경로. src/pages 구조를 바꾸면 여기도 함께 갱신합니다.
PAGES=(
  "/|1440x1700"
  "/company/|1440x1900"
  "/bidbox/|1440x1900"
  "/bidbox/service/|1440x1900"
  "/bidbox/pricing/|1440x1700"
  "/bidbox/demo/|1440x1700"
  "/bidbox/contact/|1440x1700"
  "/404.html|1440x1700"
)

NARROW=(
  "/|320x900"
  "/company/|320x900"
  "/bidbox/|320x900"
  "/bidbox/service/|320x900"
  "/bidbox/pricing/|320x900"
  "/bidbox/demo/|320x900"
  "/bidbox/contact/|320x900"
  "/404.html|320x900"
)

cd "$ROOT"

# Node 전제를 여기서 확인합니다. package.json 의 engines 는 npm install 시 경고로만
# 나오므로, 요구 버전보다 낮은 Node 로 그대로 진행됩니다. 그 상태에서 8단계가
# .ts 직접 import(타입 스트리핑)를 만나면, 에러 메시지가 Node 버전 문제인지
# 스크립트 문제인지 구분되지 않습니다. 그래서 시작 전에 명시적으로 막습니다.
# 버전은 package.json 의 engines.node 를 정본으로 읽습니다. 두 곳에 적으면
# 한쪽만 바뀌어 조용히 어긋납니다.
node -e "
const fs = require('node:fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const want = pkg.engines && pkg.engines.node;
if (!want) {
  console.error('package.json 에 engines.node 가 없습니다. Node 전제를 알 수 없습니다.');
  process.exit(1);
}
const m = want.match(/>=\s*(\d+)\.(\d+)/);
if (!m) {
  console.error('engines.node 를 해석하지 못했습니다: ' + want);
  process.exit(1);
}
const [maj, min] = process.versions.node.split('.').map(Number);
const ok = maj > Number(m[1]) || (maj === Number(m[1]) && min >= Number(m[2]));
if (ok) {
  console.log('Node ' + process.versions.node + ' (요구 ' + want + ') 확인');
  process.exit(0);
}
console.error('Node ' + want + ' 이상이 필요합니다. 현재 ' + process.versions.node);
console.error('8단계가 src/data/*.ts 를 직접 import 하므로 타입 스트리핑이 필요합니다.');
process.exit(1);
"

echo "== 1/8 타입 체크 =="
# astro check 는 typescript(@astrojs/check) 가 vite 번들 타입을 참조하므로 devDependencies 에 고정되어 있습니다.
# tsconfig.json 과 --tsconfig 플래그를 명시해 대화형 프롬프트가 뜨지 않게 합니다.
# 대화형 입력 없이 끝나므로 set -e 로 종료 코드 1 이 그대로 전파됩니다.
npm run check

echo "== 2/8 빌드 =="
npm run build

echo "== 3/8 dist 서빙 =="
# 서빙 전에 포트가 비어 있는지 한 번 더 확인합니다. 위에서 고른 포트도
# 이 시점까지 다른 프로세스가 점유했을 수 있고, PORT 를 명시한 경우
# 남의 서버가 서빙 중일 수 있습니다. 그대로 두면 남의 dist 를 검증합니다.
if curl -sf -o /dev/null --max-time 2 "$BASE/"; then
  echo "포트 ${PORT} 에 이미 다른 서버가 있습니다 (${PORT_SOURCE})." >&2
  echo "이 포트를 쓰면 남의 dist 를 검증하므로 여기서 멈춥니다." >&2
  echo "PORT 를 비워 두고 다시 돌리면 빈 포트를 자동으로 고릅니다." >&2
  exit 1
fi

python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$ROOT/dist" >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT
echo "서빙: ${BASE} (포트 ${PORT}, ${PORT_SOURCE})"

for _ in $(seq 1 50); do
  if curl -sf -o /dev/null "$BASE/"; then break; fi
  sleep 0.2
done

if ! curl -sf -o /dev/null "$BASE/"; then
  echo "로컬 서버 기동 실패: $BASE" >&2
  exit 1
fi

rm -rf "$OUT"
mkdir -p "$OUT"

echo "== 4/8 링크 무결성 =="
node scripts/check-links.mjs
# sitemap 은 손으로 유지되는 경로 목록입니다. 새 페이지를 넣고 목록을 잊어도
# 링크 검사는 통과합니다. 여기서 색인 누락과 죽은 주소를 막습니다.
node scripts/check-sitemap.mjs "$ROOT/dist"
# 정본에서 파생한 기대값과 대조합니다. 게이트가 "깨지지 않은 것"만 증명하는
# 사각지(같은 리뷰서 6절)는 여기서 막습니다.
node scripts/check-structured-data.mjs "$ROOT/dist"
node scripts/check-copy-consistency.mjs "$ROOT"

echo "== 5/8 렌더 / 콘솔 오류 / 스타일 실측 =="
RENDER_OUT="$(swift scripts/audit/render.swift "$BASE" "$OUT" "${PAGES[@]}")"
echo "$RENDER_OUT"
if ! grep -q "^0 page(s) with JS errors" <<<"$RENDER_OUT"; then
  echo "콘솔 오류가 발생한 페이지가 있습니다." >&2
  exit 1
fi

echo "== 6/8 폰트 서브셋 =="
# self-host 된 폰트는 빌드된 페이지가 그리는 문자만 담습니다. 새 카피가 서브셋 밖의
# 글자를 쓰면 시스템 폰트로 조용히 폴백되므로 여기서 멈춥니다.
# 새 카피를 추가했다면 먼저 python3 scripts/build-font-subset.py 를 실행하세요.
swift scripts/check-font-subset.swift "$ROOT/dist" "$ROOT/public/fonts/pretendard-variable-subset.woff2"

echo "== 7/8 반응형 / 접근성 =="
# a11y.swift 는 이슈가 있으면 1 로 끝납니다. set -e 에 걸려 출력 없이 멈추지 않도록 상태를 따로 받습니다.
A11Y_STATUS=0
A11Y_OUT="$(swift scripts/audit/a11y.swift "$BASE" "${NARROW[@]}")" || A11Y_STATUS=$?
echo "$A11Y_OUT"
if [ "$A11Y_STATUS" -ne 0 ] || ! grep -q "^0 issue group(s)" <<<"$A11Y_OUT"; then
  echo "반응형 또는 접근성 이슈가 있습니다." >&2
  exit 1
fi

echo "== 8/8 인터랙션 =="
# 이 단계는 .ts 직접 import(타입 스트리핑)에 Node v22.18.0 이상이 필요합니다(scripts/audit/expected.mjs).
# 스크립트 시작 시 package.json 의 engines.node 를 읽어 버전을 확인하므로, 낮은 버전에서
# 실행하면 8단계에 도달하기 전에 멈춥니다.
# 기대 카피를 정본에서 파생해 체크 스크립트에 주입합니다. 파생에 실패하면 set -e 로 멈춥니다.
# 다이얼로그 기대값은 featured 플랜에서 파생하며, featured 가 정확히 하나가 아니면 여기서 종료 코드 1 로 멈춥니다.
node scripts/audit/expected.mjs > "$OUT/expected.js"
# 검사할 plan 쿼리는 expected.mjs 가 인코딩해 기대값 안에 넣어 줍니다.
# 셸에서 URL 을 만들지 않는 이유는 두 가지입니다. '+' 가 공백으로 바뀌어
# 한글 라벨이 깨질 수 있고, 파생 규칙이 셸과 스크립트 두 곳에 흩어집니다.
# 여기서는 기대값 JSON 을 읽어 쿼리만 꺼냅니다.
read_query() {
  node -e "
    const fs = require('node:fs');
    const raw = fs.readFileSync('$OUT/expected.js', 'utf8');
    const obj = JSON.parse(raw.replace(/^window\.__expected\s*=\s*/, '').replace(/;\s*$/, ''));
    const v = obj.prefill && obj.prefill['$1'];
    if (typeof v !== 'string' || v === '') {
      console.error('기대값 prefill.$1 을 읽지 못했습니다.');
      process.exit(1);
    }
    process.stdout.write(v);
  "
}
Q_ACCEPT="$(read_query acceptQuery)"
Q_REJECT_TRUNCATED="$(read_query rejectTruncatedQuery)"
Q_REJECT_SCRIPT="$(read_query rejectScriptQuery)"
Q_REJECT_BARE="$(read_query rejectBareNumberQuery)"
EXPECT_JS="$OUT/expected.js" swift scripts/audit/interact.swift "$BASE" \
  "/company/|390x900|scripts/audit/checks/nav.js" \
  "/bidbox/contact/|390x1400|scripts/audit/checks/form.js" \
  "/bidbox/demo/|390x1400|scripts/audit/checks/form.js" \
  "/bidbox/pricing/|1440x1200|scripts/audit/checks/dialog.js" \
  "/bidbox/contact/${Q_ACCEPT}|390x1400|scripts/audit/checks/prefill.js" \
  "/bidbox/contact/${Q_REJECT_TRUNCATED}|390x1400|scripts/audit/checks/prefill-reject.js" \
  "/bidbox/contact/${Q_REJECT_SCRIPT}|390x1400|scripts/audit/checks/prefill-reject.js" \
  "/bidbox/contact/${Q_REJECT_BARE}|390x1400|scripts/audit/checks/prefill-reject.js" \
  "/bidbox/contact/|390x1400|scripts/audit/checks/fallback.js" \
  "/bidbox/demo/|1400x1400|scripts/audit/checks/fallback.js"

echo
echo "검증 통과. 스크린샷: $OUT"
