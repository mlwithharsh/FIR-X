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

    # UUID for internal storage (safe for URLs), nice name for download
    file_id = str(uuid4())
    internal_name = f"{file_id}.docx"
    fir_filename = payload.case_details.fir_number.replace("/", "-")
    display_name = f"{fir_filename} New DAR Form (9).docx"

    output_path = generator.generate_dar(payload, legal_description, internal_name)

    return GenerateResponse(
        file_name=display_name,
        download_path=f"/api/v1/reports/download/{internal_name}",
        generated_files=[display_name],
    )


@router.get("/download/{file_name}")
def download_bundle(file_name: str) -> FileResponse:
    path = settings.generated_path / file_name
    if not path.exists():
        raise HTTPException(status_code=404, detail="Generated file not found")
    media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    # Derive a nice display filename from the internal UUID name
    display_name = file_name if " " in file_name else f"DAR Form.docx"
    return FileResponse(path=Path(path), media_type=media_type, filename=display_name)

