#!/usr/bin/env bash
#
# narani_homepage 정적 사이트 검증.
# 빌드 -> dist 로컬 서빙 -> 링크 무결성 / 렌더 / 접근성 / 인터랙션 감사.
# 실패 시 종료 코드 1 을 반환하므로 CI 에서 그대로 사용할 수 있습니다.
#
# 사용법: scripts/verify.sh
# 환경변수: PORT (기본 4322), OUT (스크린샷 출력, 기본 .verify)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-4322}"
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

echo "== 1/6 빌드 =="
npm run build

echo "== 2/6 dist 서빙 =="
python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$ROOT/dist" >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

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

echo "== 3/6 링크 무결성 =="
node scripts/check-links.mjs "$ROOT/dist"

echo "== 4/6 렌더 / 콘솔 오류 / 스타일 실측 =="
RENDER_OUT="$(swift scripts/audit/render.swift "$BASE" "$OUT" "${PAGES[@]}")"
echo "$RENDER_OUT"
if ! grep -q "^0 page(s) with JS errors" <<<"$RENDER_OUT"; then
  echo "콘솔 오류가 발생한 페이지가 있습니다." >&2
  exit 1
fi

echo "== 5/6 반응형 / 접근성 =="
A11Y_OUT="$(swift scripts/audit/a11y.swift "$BASE" "${NARROW[@]}")"
echo "$A11Y_OUT"
if ! grep -q "^0 issue group(s)" <<<"$A11Y_OUT"; then
  echo "반응형 또는 접근성 이슈가 있습니다." >&2
  exit 1
fi

echo "== 6/6 인터랙션 =="
swift scripts/audit/interact.swift "$BASE" \
  "/company/|390x900|scripts/audit/checks/nav.js" \
  "/bidbox/contact/|390x1400|scripts/audit/checks/form.js" \
  "/bidbox/pricing/|1440x1200|scripts/audit/checks/dialog.js"

echo
echo "검증 통과. 스크린샷: $OUT"
