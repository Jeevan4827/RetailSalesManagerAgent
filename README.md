# Intelligent Retail Sales Manager Agent — Backend

FastAPI backend with LLM-powered Text-to-SQL capabilities grounded in Supabase PostgreSQL retail inventory data (73,100 records).

## Architecture

- **Framework:** FastAPI + Uvicorn
- **Database:** Supabase PostgreSQL (`public.retail_inventory`)
- **Least-Privilege Security:** Connects using dedicated role `retail_readonly` with read-only transaction locks.
- **SQL Guardrails:** AST validation with `sqlglot` (blocks write statements, unauthorized tables/schemas, catalog queries, and functions like `pg_sleep`).
- **LLM Integration:** OpenAI-compatible client configured with Groq (`openai/gpt-oss-120b`).

---

## 1. Environment Setup

Copy `.env.example` to `.env` and verify configurations:

```bash
cp .env.example .env
```

Ensure `.env` contains:
```env
SUPABASE_DB_HOST=aws-0-ap-northeast-2.pooler.supabase.com
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=retail_readonly.ihcdxzkykufclqxmcewr
SUPABASE_DB_PASSWORD=your_database_password
SUPABASE_DB_SSLMODE=require

OPENAI_API_KEY=your_groq_or_openai_api_key_here
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_MODEL=openai/gpt-oss-120b
```

---

## 2. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 3. (One-time) Database Least-Privilege Read-Only Role

The database user `retail_readonly` has already been provisioned with least-privilege `SELECT` grants on `public.retail_inventory`. If you ever need to reprovision it on another database, run:

```bash
python setup_readonly_role.py
```

The exact SQL executed is:
```sql
CREATE ROLE retail_readonly WITH LOGIN PASSWORD 'RetailSafeReadPass2026!';
GRANT USAGE ON SCHEMA public TO retail_readonly;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM retail_readonly;
GRANT SELECT ON TABLE public.retail_inventory TO retail_readonly;
```

---

## 4. Run the Development Server

Start FastAPI with Uvicorn from the project root:

```bash
python -m uvicorn app.main:app --app-dir backend --reload --port 8001
```

The interactive documentation will be available at:
- **Swagger UI:** [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)
- **OpenAPI JSON:** [http://127.0.0.1:8001/openapi.json](http://127.0.0.1:8001/openapi.json)

---

## 5. API Endpoints

### `GET /health`
Verifies backend status and live Supabase PostgreSQL connection:
```bash
curl http://127.0.0.1:8001/health
```

### `GET /schema`
Returns inspected schema definition and record count for `public.retail_inventory`:
```bash
curl http://127.0.0.1:8001/schema
```

### `POST /chat`
Submits a natural language query:

**PowerShell (`curl.exe` or `Invoke-RestMethod`):**
```powershell
curl.exe -X POST http://127.0.0.1:8001/chat -H "Content-Type: application/json" -d "{\"question\": \"Which five products sold the most units?\"}"
```
Or using PowerShell native cmdlet:
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8001/chat" -Method POST -ContentType "application/json" -Body '{"question": "Which five products sold the most units?"}'
```

---

## 6. Run Test Suite

Run the full pytest suite (17 unit and integration tests):

```bash
python -m pytest backend/tests -v -o "pythonpath=backend"
```

---

## 7. Frontend (Phase 2 — React Chat UI)

A modern, responsive business intelligence interface built with **React**, **TypeScript**, **Tailwind CSS**, and **Vite**.

### Frontend Setup & Development

In a separate terminal:

```powershell
cd J:\RetailSalesManagerAgent\frontend
npm install
npm run dev
```

The frontend application runs at:
- **Local Web App:** [http://localhost:5174/](http://localhost:5174/) (or [http://localhost:5173/](http://localhost:5173/))

### Configuration
Configure the backend API URL in `frontend/.env`:
```env
VITE_API_BASE_URL=http://127.0.0.1:8001
```

### Key UI Features
1. **Sidebar Navigation:**
   - Brand header: **RetailIQ** — *Sales Intelligence*.
   - **New Chat** button to clear the current conversation.
   - List of 5 quick-start suggested queries.
   - Live Supabase connection pulse indicator showing record count (`73,100 records`) and manual retry.
2. **Conversation & Welcome View:**
   - Empty state cards displaying 5 categorized business queries.
   - User message bubble on the right and assistant response on the left.
   - Live loading indicator while the backend executes SQL.
3. **Safe Markdown & Data Inspection:**
   - Markdown rendering for headings, bullet points, and tables.
   - Collapsible **Executed SQL** viewer with one-click clipboard copy.
   - Collapsible **View Data** responsive table with numerical formatting.
4. **Message Composer:**
   - Auto-expanding multiline textarea with `Enter` (Send) and `Shift+Enter` (Newline) shortcuts.
