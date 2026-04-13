#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "[security] checking tracked env files"
if git ls-files | grep -E '(^|/)(\.env|\.env\..+)$' >/dev/null; then
  echo "Tracked .env file detected"
  exit 1
fi

echo "[security] checking for public service-role leakage"
if git ls-files | xargs grep -nH 'NEXT_PUBLIC_.*SERVICE_ROLE\|SUPABASE_SERVICE_ROLE_KEY' src/components src/app >/dev/null 2>&1; then
  echo "Potential service-role exposure found in client-facing source"
  exit 1
fi

echo "[security] checking for hardcoded secret-like values"
if git ls-files | xargs grep -nHE '(sk_[A-Za-z0-9]|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]+PRIVATE KEY-----)' >/dev/null 2>&1; then
  echo "Potential hardcoded secret detected"
  exit 1
fi

echo "[security] checks passed"
