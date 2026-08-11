#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-${NEXT_PUBLIC_API_BASE_URL:-http://localhost:8000}}"
API_BASE="${API_BASE%/}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"

echo "=== RAG Smoke Test ==="
echo "API_BASE=$API_BASE"
echo "FRONTEND_URL=$FRONTEND_URL"
echo ""

echo "[1] Health check..."
curl -fsS "$API_BASE/health" | tee /tmp/health.json
echo ""
python3 -c "import json,sys; d=json.load(open('/tmp/health.json')); assert d['status']=='ok', d; print('✓ health 200 ok')"

echo ""
echo "[2] Login demo..."
curl -fsS -X POST "$API_BASE/auth/login" -H "Content-Type: application/json" -d '{"email":"demo@rag.local","password":"demo1234"}' | tee /tmp/login.json
TOKEN=$(python3 -c "import json; print(json.load(open('/tmp/login.json'))['access_token'])")
echo "✓ token obtained"

echo ""
echo "[3] Upload sample file..."
echo "RAG = Retrieval Augmented Generation. Consente di rispondere usando documenti privati come contesto." > /tmp/sample.txt
echo "Il vettore store indicizza i chunk e la ricerca semantica trova i passaggi rilevanti." >> /tmp/sample.txt
curl -fsS -X POST "$API_BASE/files/upload" -H "Authorization: Bearer $TOKEN" -F "files=@/tmp/sample.txt" | tee /tmp/upload.json
FILE_ID=$(python3 -c "import json; print(json.load(open('/tmp/upload.json'))['uploaded'][0]['id'])")
echo "✓ uploaded file_id=$FILE_ID"

echo ""
echo "[4] Index..."
curl -fsS -X POST "$API_BASE/files/index" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "[\"$FILE_ID\"]" | tee /tmp/index.json
python3 -c "import json; d=json.load(open('/tmp/index.json')); assert d['indexed'][0]['chunks']>0, d; print('✓ indexed')"

echo ""
echo "[5] Search..."
curl -fsS -X POST "$API_BASE/search" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"query":"cos cos e RAG?"}' | tee /tmp/search.json
python3 -c "import json; d=json.load(open('/tmp/search.json')); assert len(d['results'])>0, d; print('✓ search returned', len(d['results']), 'results')"

echo ""
echo "[6] Query RAG..."
curl -fsS -X POST "$API_BASE/query" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"question":"Cos'\''e il RAG?"}' | tee /tmp/query.json
python3 -c "import json; d=json.load(open('/tmp/query.json')); assert 'answer' in d and len(d['answer'])>10, d; print('✓ query answer len', len(d['answer'])); print(d['answer'][:500])"

echo ""
echo "[7] Admin stats..."
curl -fsS "$API_BASE/admin/stats" -H "Authorization: Bearer $TOKEN" | tee /tmp/stats.json
python3 -c "import json; d=json.load(open('/tmp/stats.json')); print('✓ stats', d['vector_store'])"

echo ""
if [ "$FRONTEND_URL" != "skip" ]; then
  echo "[8] Frontend check..."
  curl -fsS "$FRONTEND_URL" | head -n 20
  echo "✓ frontend reachable"
  echo "  Check browser console for: [RAG] API_BASE = $API_BASE"
fi

echo ""
echo "=== SMOKE TEST PASSED ==="
