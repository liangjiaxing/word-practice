#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

if [ ! -f .env.local ]; then
  echo "ERROR: .env.local not found in $PROJECT_ROOT" >&2
  exit 1
fi

set -a
source .env.local
set +a

if [ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ] || [ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]; then
  echo "ERROR: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing from .env.local" >&2
  exit 1
fi

TMP_HEADERS="$(mktemp)"
TMP_BODY="$(mktemp)"
cleanup() {
  rm -f "$TMP_HEADERS" "$TMP_BODY"
}
trap cleanup EXIT

curl -sS \
  -D "$TMP_HEADERS" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Accept: application/json" \
  "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/words?select=id&limit=1" \
  -o "$TMP_BODY"

status_code="$(awk 'toupper($1) ~ /^HTTP\// {code=$2} END {print code}' "$TMP_HEADERS")"

if [ "$status_code" != "200" ]; then
  echo "ERROR: keepalive request failed with status ${status_code:-unknown}" >&2
  cat "$TMP_BODY" >&2
  exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] Supabase keepalive OK for ${NEXT_PUBLIC_SUPABASE_URL}"
cat "$TMP_BODY"
