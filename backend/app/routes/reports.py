from io import BytesIO

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.config import get_settings
from app.schemas.report import DARForm
from app.services.document_generator import DocumentGenerator

router = APIRouter(tags=["reports"])
settings = get_settings()


def _build_generator() -> DocumentGenerator:
    return DocumentGenerator(settings.base_dir / "app" / "template_dar.docx")


@router.post("/api/generate")
def generate_report(payload: DARForm) -> StreamingResponse:
    content = _build_generator().generate_dar(payload)
    safe_fir_no = payload.fir_no.replace("/", "_").replace("\\", "_")
    filename = f"DAR_FIR_{safe_fir_no}.docx"

    return StreamingResponse(
        BytesIO(content),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
