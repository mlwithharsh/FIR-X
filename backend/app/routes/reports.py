from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import get_db
from app.models.accident_case import AccidentCase
from app.schemas.report import GenerateResponse, PreviewResponse, ReportRequest
from app.services.ai_drafter import generate_legal_description
from app.services.conditional_logic import build_conditional_sections
from app.services.document_generator import DocumentGenerator
from app.services.pdf_export import export_pdf_stub
from app.services.preview_builder import build_preview_text
from app.services.zip_service import build_zip_bundle

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])
settings = get_settings()


def _build_generator() -> DocumentGenerator:
    return DocumentGenerator(settings.template_dir, settings.generated_path)


@router.post("/preview", response_model=PreviewResponse)
def preview_report(payload: ReportRequest, db: Session = Depends(get_db)) -> PreviewResponse:
    legal_description = generate_legal_description(payload)
    preview_text = build_preview_text(payload, legal_description)
    case = AccidentCase(
        case_number=payload.case_number,
        accident_type=payload.accident.type,
        payload=payload.model_dump(mode="json"),
        legal_description=legal_description,
        preview_text=preview_text,
        generated_files={},
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return PreviewResponse(
        case_id=case.id,
        preview_text=preview_text,
        legal_description=legal_description,
        conditional_sections=build_conditional_sections(payload),
    )


@router.get("/preview/{case_id}", response_model=PreviewResponse)
def get_preview(case_id: str, db: Session = Depends(get_db)) -> PreviewResponse:
    case = db.get(AccidentCase, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return PreviewResponse(
        case_id=case.id,
        preview_text=case.preview_text,
        legal_description=case.legal_description,
        conditional_sections={},
    )


@router.post("/generate-report", response_model=GenerateResponse)
def generate_report(payload: ReportRequest, db: Session = Depends(get_db)) -> GenerateResponse:
    legal_description = generate_legal_description(payload)
    preview_text = build_preview_text(payload, legal_description)
    case = AccidentCase(
        case_number=payload.case_number,
        accident_type=payload.accident.type,
        payload=payload.model_dump(mode="json"),
        legal_description=legal_description,
        preview_text=preview_text,
        generated_files={},
    )
    db.add(case)
    db.flush()

    generator = _build_generator()
    files = generator.generate_all(payload, legal_description, case.id)
    pdf_path = export_pdf_stub(files) if payload.include_pdf else None
    export_files = files + ([pdf_path] if pdf_path else [])
    zip_path = build_zip_bundle(case.id, export_files, settings.generated_path)

    case.generated_files = {"documents": [path.name for path in export_files], "zip": zip_path.name}
    db.commit()

    return GenerateResponse(
        case_id=case.id,
        zip_file_name=zip_path.name,
        download_path=f"/api/v1/reports/download/{zip_path.name}",
        generated_files=[path.name for path in export_files],
    )


@router.get("/download/{file_name}")
def download_bundle(file_name: str) -> FileResponse:
    path = settings.generated_path / file_name
    if not path.exists():
        raise HTTPException(status_code=404, detail="Generated file not found")
    return FileResponse(path=Path(path), media_type="application/zip", filename=file_name)
