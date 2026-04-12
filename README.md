...# FIR.ai V2

FIR.ai V2 is a full-stack drafting system for Indian road accident documentation. It collects a minimal structured input set, expands it into formal legal language, and generates MACT-oriented `.docx` reports bundled as a ZIP.

## Stack

- Backend: FastAPI, SQLAlchemy, PostgreSQL, Pydantic, docxtpl, python-docx
- Frontend: Next.js, React Hook Form, TailwindCSS
- Optional AI: OpenAI API with deterministic fallback drafting

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```
