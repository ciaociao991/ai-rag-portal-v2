#!/usr/bin/env bash
set -euo pipefail
# Redeploy helper for Railway
# Usage: RAILWAY_TOKEN=xxx ./scripts/redeploy_railway.sh [backend|frontend|all]
# Requires: npm i -g @railway/cli  &&  railway login (or RAILWAY_TOKEN)

TARGET="${1:-all}"

if ! command -v railway >/dev/null 2>&1; then
  echo "Installing Railway CLI..."
  npm i -g @railway/cli
fi

if [ -z "${RAILWAY_TOKEN:-}" ]; then
  echo "RAILWAY_TOKEN not set. Run: railway login  or export RAILWAY_TOKEN"
  echo "Then: railway up --service <service-name>"
  exit 1
fi

deploy_service() {
  local svc="$1"
  echo "→ Deploying $svc ..."
  railway up --service "$svc" --environment production || railway up --service "$svc"
}

case "$TARGET" in
  backend) deploy_service "${RAILWAY_SERVICE_BACKEND:-backend}" ;;
  frontend) deploy_service "${RAILWAY_SERVICE_FRONTEND:-frontend}" ;;
  all)
    deploy_service "${RAILWAY_SERVICE_BACKEND:-backend}"
    deploy_service "${RAILWAY_SERVICE_FRONTEND:-frontend}"
    ;;
  *) echo "Unknown target: $TARGET (use backend|frontend|all)"; exit 1 ;;
esac

echo "✓ Redeploy triggered. Logs: railway logs --service <name>"
echo "  Health: curl https://<backend>.up.railway.app/health"
