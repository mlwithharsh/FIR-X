...# FIR.ai V2

FIR.ai V2 is a full-stack DAR drafting system for Indian road accident workflows. It captures FIR, accident, hospital, doctor, vehicle, owner, driver, victim, and L/R inputs in the browser, previews the narrative, and generates a `.docx` aligned to the supplied `212-2026 New DAR Form (9).docx` court packet.

## Stack

- Backend: FastAPI, SQLAlchemy, Pydantic, python-docx
- Frontend: Next.js, React Hook Form, TailwindCSS
- Deployment target: Render for backend, Vercel for frontend
- Optional AI: OpenAI API with deterministic fallback drafting

## Local Run

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

## Deploy

### Render

- Use the root `render.yaml`, or create a web service pointing at `backend/`.
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Set `CORS_ORIGINS` to your Vercel URL.

### Vercel

- Import the repository and set the root directory to `frontend/`.
- Set `NEXT_PUBLIC_API_BASE_URL` to the Render backend URL.
- Redeploy after the backend URL is live.
