from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.config import get_settings
from app.schemas.report import GenerateResponse, PreviewResponse, ReportRequest
from app.services.ai_drafter import generate_legal_description
from app.services.conditional_logic import build_conditional_sections
from app.services.document_generator import DocumentGenerator
from app.services.preview_builder import build_preview_text

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])
settings = get_settings()


def _build_generator() -> DocumentGenerator:
    return DocumentGenerator(settings.template_dir, settings.generated_path)


@router.post("/preview", response_model=PreviewResponse)
def preview_report(payload: ReportRequest) -> PreviewResponse:
    legal_description = generate_legal_description(payload)
    preview_text = build_preview_text(payload, legal_description)
    return PreviewResponse(
        preview_text=preview_text,
        legal_description=legal_description,
        conditional_sections=build_conditional_sections(payload),
    )


@router.post("/generate-report", response_model=GenerateResponse)
def generate_report(payload: ReportRequest) -> GenerateResponse:
    legal_description = generate_legal_description(payload)
    generator = _build_generator()
    
    # Create a nice filename: e.g. 212-2026 New DAR Form (9).docx
    fir_filename = payload.case_details.fir_number.replace("/", "-")
    file_name = f"{fir_filename} New DAR Form (9).docx"
    
    output_path = generator.generate_dar(payload, legal_description, file_name)

    return GenerateResponse(
        file_name=output_path.name,
        download_path=f"/api/v1/reports/download/{output_path.name}",
        generated_files=[output_path.name],
    )


@router.get("/download/{file_name}")
def download_bundle(file_name: str) -> FileResponse:
    path = settings.generated_path / file_name
    if not path.exists():
        raise HTTPException(status_code=404, detail="Generated file not found")
    media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return FileResponse(path=Path(path), media_type=media_type, filename=file_name)
