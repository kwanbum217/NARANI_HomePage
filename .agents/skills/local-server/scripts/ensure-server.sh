#!/usr/bin/env bash
# 개발 서버(astro dev)와 빌드 미리보기(astro preview)를 한 대씩만 띄웁니다.
#
# 포트를 고정하지 않습니다. 2026-09-28 에 검증 서버의 고정 포트가 다른
# 워크트리의 dist 를 검증하게 했습니다. Astro 가 실제로 연 주소만 출력합니다.
#
# stdout 은 한 줄입니다. 에이전트는 이 줄의 URL 만 사용자에게 알립니다.
#   dev already http://127.0.0.1:4321/
#   dev started http://127.0.0.1:4321/
#   dev up http://127.0.0.1:4321/
#   dev down
#   dev stopped
# preview 도 같은 형식입니다.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
ASTRO="${ROOT}/node_modules/.bin/astro"

usage() {
  printf '%s\n' "usage: ensure-server.sh dev|preview|status|stop [dev|preview]" >&2
  exit 2
}

require_astro() {
  if [[ ! -x "$ASTRO" ]]; then
    printf '%s\n' "astro binary missing: node_modules/.bin/astro" >&2
    printf '%s\n' "run npm ci in the repository root, then retry" >&2
    exit 1
  fi
}

extract_url() {
  local text="$1"
  local url
  if [[ ! "$text" =~ https?://[^[:space:]]+ ]]; then
    return 1
  fi
  url="${BASH_REMATCH[0]}"
  # Astro 잠금 파일의 url 은 경로 없는 origin 입니다. 홈 주소로 맞춥니다.
  if [[ "$url" =~ ^https?://[^/]+$ ]]; then
    url="${url}/"
  fi
  printf '%s\n' "$url"
}

run_astro() {
  local out
  out="$("$ASTRO" "$@" 2>&1)" || true
  printf '%s\n' "$out"
}

http_ok() {
  local url="$1"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$url" || true)"
  [[ "$code" == 2* || "$code" == 3* ]]
}

# status 출력에서 URL 을 찾습니다. 없으면 빈 문자열.
status_url() {
  local kind="$1"
  local out
  out="$(run_astro "$kind" status)"
  extract_url "$out" || true
}

report_failure() {
  local kind="$1"
  local out="$2"
  printf '%s\n' "${kind} failed to become ready" >&2
  printf '%s\n' "$out" >&2
  printf '%s\n' "log: .astro/${kind}.log" >&2
}

start_kind() {
  local kind="$1"
  local url out

  if [[ "$kind" == "preview" && ! -f "${ROOT}/dist/index.html" ]]; then
    printf '%s\n' "preview needs dist/index.html" >&2
    printf '%s\n' "run npm run build, then retry preview" >&2
    exit 2
  fi

  url="$(status_url "$kind")"
  if [[ -n "$url" ]] && http_ok "$url"; then
    printf '%s\n' "${kind} already ${url}"
    return 0
  fi

  if [[ -n "$url" ]]; then
    run_astro "$kind" stop >/dev/null
  fi

  out="$(run_astro "$kind" --background --host 127.0.0.1)"
  if ! url="$(extract_url "$out")"; then
    report_failure "$kind" "$out"
    exit 1
  fi
  if ! http_ok "$url"; then
    report_failure "$kind" "$out"
    exit 1
  fi
  printf '%s\n' "${kind} started ${url}"
}

print_status() {
  local kind="$1"
  local url
  url="$(status_url "$kind")"
  if [[ -n "$url" ]] && http_ok "$url"; then
    printf '%s\n' "${kind} up ${url}"
    return 0
  fi
  if [[ -n "$url" ]]; then
    printf '%s\n' "${kind} unreachable ${url}"
    return 0
  fi
  printf '%s\n' "${kind} down"
}

stop_kind() {
  local kind="$1"
  local out
  out="$(run_astro "$kind" stop)"
  if [[ "$out" == *Stopped* ]]; then
    printf '%s\n' "${kind} stopped"
    return 0
  fi
  printf '%s\n' "${kind} down"
}

main() {
  local cmd="${1:-}"
  local target="${2:-}"
  require_astro
  cd "$ROOT"

  case "$cmd" in
    dev|preview)
      [[ -z "$target" ]] || usage
      start_kind "$cmd"
      ;;
    status)
      [[ -z "$target" ]] || usage
      print_status dev
      print_status preview
      ;;
    stop)
      case "$target" in
        "")
          stop_kind dev
          stop_kind preview
          ;;
        dev|preview)
          stop_kind "$target"
          ;;
        *)
          usage
          ;;
      esac
      ;;
    *)
      usage
      ;;
  esac
}

main "$@"
