# AI RAG Portal v2

App web completa con **Retrieval Augmented Generation (RAG)**: upload documenti → indicizzazione vettoriale → ricerca semantica → chat basata sul contesto.

**Stack:** FastAPI (Python 3.11) + Next.js 14 (TypeScript) + TF-IDF vector store (sostituibile con pgvector/Chroma/Qdrant) + OpenAI opzionale.

---

## Funzionalità

- **Upload multiplo** PDF / TXT / DOCX (drag & preview, validazione estensione)
- **Indicizzazione automatica** con chunking (800 char, overlap 100) e TF-IDF (8192 feature, 1-2 gram)
- **Endpoint API** per `upload`, `index`, `search`, `query` (RAG)
- **Chat** che risponde citando le fonti; mock extractive se `OPENAI_API_KEY` assente, LLM reale se presente
- **Auth minima** demo: `demo@rag.local / demo1234`, `admin@rag.local / admin1234` → JWT
- **Pannello admin** `/admin` con stato indici, file, health
- **Logging** strutturato su stdout, **health check** `GET /health` → 200, **test** `pytest`

---

## Struttura

```
.
├── backend/                # FastAPI
│   ├── app/main.py         # app + CORS + logging middleware
│   ├── app/core/           # config, auth (JWT), logging
│   ├── app/services/       # parsers, chunking, vector_store, rag, file_store
│   ├── app/api/            # routes: health, auth, files, query
│   ├── Dockerfile          # build context: ./backend  dockerfile: Dockerfile
│   └── tests/              # test_health, test_rag (upload→index→query)
├── frontend/               # Next.js 14 App Router
│   ├── app/(page|chat|admin|login)
│   ├── lib/api.ts          # API_BASE = NEXT_PUBLIC_API_BASE_URL (log in console)
│   └── Dockerfile          # standalone output, ARG NEXT_PUBLIC_API_BASE_URL
├── docker-compose.yml
├── .github/workflows/ci.yml
├── scripts/smoke_test.sh
└── railway.json
```

---

## Setup locale

### 1. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # imposta JWT_SECRET, OPENAI_API_KEY opzionale
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/health  → {"status":"ok"}
# → http://localhost:8000/docs    (Swagger)
```

Test:

```bash
pytest -q
# test_health_200, test_upload_index_query_flow, test_auth_demo_login
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# .env.local:
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
npm run dev   # http://localhost:3000
npm run build # verifica in console: [RAG] API_BASE = http://localhost:8000
```

> **Criterio di accettazione:** il frontend stampa `console.log("[RAG] API_BASE =", ...)` sia server-side (build log) sia client-side (DevTools). Vedi `frontend/app/layout.tsx` e `frontend/lib/api.ts`.

### 3. Docker Compose (tutto insieme)

```bash
docker compose up --build
# backend http://localhost:8000/health
# frontend http://localhost:3000
```

---

## Demo end-to-end (curl)

```bash
# health
curl http://localhost:8000/health

# login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@rag.local","password":"demo1234"}'

# upload (sostituisci TOKEN)
curl -X POST http://localhost:8000/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@documento.pdf" -F "files=@note.txt"

# indicizza
curl -X POST http://localhost:8000/files/index \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '["<file_id>"]'   # oppure [] per tutti i non indicizzati

# query RAG
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question":"Di cosa parla il documento?"}'

# search semantica
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query":"retrieval augmented"}'
```

**UI demo:** apri `http://localhost:3000` → carica 2-3 file → clic **Indicizza** → vai in **Chat** → poni una domanda → ricevi risposta con citazioni delle fonti.

---

## Variabili d’ambiente

### Backend (`backend/.env`)

| Var | Default | Note |
|-----|---------|------|
| `JWT_SECRET` | `change-me` | **cambia in prod** |
| `OPENAI_API_KEY` | _(vuoto)_ | se vuoto → risposta mock extractive |
| `OPENAI_MODEL` | `gpt-4o-mini` | |
| `CORS_ORIGINS` | `*` | in prod: `https://tuo-frontend.up.railway.app` |
| `PORT` | `8000` | Railway lo imposta automaticamente |

### Frontend (build-time)

| Var | Note |
|-----|------|
| `NEXT_PUBLIC_API_BASE_URL` | **Obbligatoria** — URL pubblico del backend (es. `https://backend.up.railway.app`). Loggata in console dopo la build. |

> **Diagnostica build context:** se il deploy fallisce con `Dockerfile not found`, verifica su Railway:
> - **Root directory** = `/` (repo root) oppure `backend` se usi servizio singolo
> - **Dockerfile path** = `backend/Dockerfile` (root) o `Dockerfile` (se root = backend)
> - **Build arg** frontend: `NEXT_PUBLIC_API_BASE_URL` deve essere impostato come **Variable** del servizio frontend **prima** della build (è un `ARG`).

---

## Deploy su Railway

### Opzione A — Due servizi (consigliata)

1. Crea progetto Railway → **New Service** → **GitHub Repo** (questo repo)
2. **Backend service:**
   - Settings → **Root Directory** = `backend` *oppure* lascia `/` e imposta **Dockerfile Path** = `backend/Dockerfile`
   - Variables: `JWT_SECRET`, `OPENAI_API_KEY` (opz.), `CORS_ORIGINS=https://<frontend>.up.railway.app`
   - Deploy → verifica `https://<backend>.up.railway.app/health` → 200
3. **Frontend service:**
   - Root Directory = `frontend` *oppure* `/` con Dockerfile Path = `frontend/Dockerfile`
   - Variables: `NEXT_PUBLIC_API_BASE_URL=https://<backend>.up.railway.app`
   - **Importante:** questa var è `ARG` al build — fai **Redeploy** dopo averla impostata
   - Deploy → apri frontend → DevTools console → `[RAG] API_BASE = https://<backend>...`
4. Aggiorna `CORS_ORIGINS` del backend con l’URL reale del frontend e redeploya il backend.

### Opzione B — Nixpacks (senza Dockerfile)

Se preferisci non usare Docker, Railway può buildare con Nixpacks:
- Backend: `pip install -r backend/requirements.txt` + `uvicorn app.main:app --port $PORT` (workdir `backend`)
- Frontend: `npm ci && npm run build && npm start` (workdir `frontend`)

### Redeploy / diagnostica

```bash
# via CLI
npm i -g @railway/cli
railway login
railway up --service backend
railway logs --service backend
railway variables --service frontend  # verifica NEXT_PUBLIC_API_BASE_URL

# via script
RAILWAY_TOKEN=xxx ./scripts/redeploy_railway.sh all
```

**Problemi comuni:**

| Sintomo | Causa | Fix |
|---------|-------|-----|
| `failed to read Dockerfile` | Build context sbagliato | Railway → Settings → Root/Dockerfile Path (vedi sopra) |
| `API_BASE undefined` in console | Var non passata al build | Imposta `NEXT_PUBLIC_API_BASE_URL` come **Variable** + Redeploy |
| CORS error in chat | `CORS_ORIGINS` non include frontend | Aggiorna var backend |
| `401 Invalid token` | JWT_SECRET diverso tra deploy | Allinea `JWT_SECRET` |

---

## CI / CD

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

- **backend:** `pip install` → `ruff check` → `pytest` → `docker build backend`
- **frontend:** `npm ci` → `lint` → `typecheck` → `build` (con `NEXT_PUBLIC_API_BASE_URL` fake) → `docker build frontend`
- **deploy-railway:** su push a `main`, se `RAILWAY_TOKEN` è nei secrets, triggera `railway up`

Secrets da configurare su GitHub (opzionali per deploy automatico):
`RAILWAY_TOKEN`, `RAILWAY_PROJECT_ID`, `RAILWAY_SERVICE_BACKEND`, `RAILWAY_SERVICE_FRONTEND`

---

## Smoke test

```bash
# locale
API_BASE=http://localhost:8000 FRONTEND_URL=http://localhost:3000 ./scripts/smoke_test.sh

# produzione
API_BASE=https://<backend>.up.railway.app FRONTEND_URL=https://<frontend>.up.railway.app ./scripts/smoke_test.sh
# oppure FRONTEND_URL=skip per testare solo API
```

Lo script verifica: health 200 → login → upload → index → search → query RAG → admin stats → frontend reachable.

---

## Commit e roadmap

Repo con commit chiari (feat: upload/index/query, chore: docker/ci, docs: README).  
Estensioni future: sostituire `VectorStore` TF-IDF con Chroma/pgvector, aggiungere streaming SSE, rate limiting, upload S3.

---

## Licenza

MIT
