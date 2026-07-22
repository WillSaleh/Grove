#!/usr/bin/env bash
set -euo pipefail

LOCAL_URL="${CLOUDFLARE_LOCAL_URL:-http://127.0.0.1:8000}"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared is not installed. Install with: brew install cloudflared"
  exit 1
fi

echo "Starting free Cloudflare quick tunnel -> $LOCAL_URL"
echo "Your public URL will appear below (https://....trycloudflare.com)"
echo

exec cloudflared tunnel --url "$LOCAL_URL"
