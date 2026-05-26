#!/usr/bin/env bash
set -euo pipefail

DEV_VARS=".dev.vars"

if [ ! -f "$DEV_VARS" ]; then
  echo "❌ $DEV_VARS not found"
  exit 1
fi

while IFS='=' read -r key value; do
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  value="${value#\"}"
  value="${value%\"}"
  echo "🔑 Setting $key..."
  echo "$value" | wrangler secret put "$key" "$@"
done < "$DEV_VARS"

echo "✅ Done"
