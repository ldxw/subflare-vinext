#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WRANGLER_FILE="$ROOT_DIR/wrangler.jsonc"

: "${D1_ID:?D1_ID is required}"
: "${KV_ID:?KV_ID is required}"

sed -i "s|__D1_ID__|$D1_ID|g" "$WRANGLER_FILE"
sed -i "s|__KV_ID__|$KV_ID|g" "$WRANGLER_FILE"

grep -q "$D1_ID" "$WRANGLER_FILE"
grep -q "$KV_ID" "$WRANGLER_FILE"
