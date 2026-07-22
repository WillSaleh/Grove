#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

if [[ -f .envrc ]]; then
  set -a
  # shellcheck disable=SC1091
  source .envrc
  set +a
fi

cleanup() {
  if [[ -n "${API_PID:-}" ]] && kill -0 "$API_PID" 2>/dev/null; then
    kill "$API_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "Starting API on http://127.0.0.1:8000"
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
API_PID=$!

sleep 2

exec "$ROOT_DIR/cloudflare/run-tunnel.sh"
