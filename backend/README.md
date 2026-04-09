# Backend

## Endpoints

- `GET /health`
- `POST /api/v1/reports/preview`
- `GET /api/v1/reports/preview/{case_id}`
- `POST /api/v1/reports/generate-report`
- `GET /api/v1/templates`

## Run

```bash
uvicorn app.main:app --reload
```
