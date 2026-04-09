from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.template_version import TemplateVersion
from app.schemas.report import TemplateVersionResponse

router = APIRouter(prefix="/api/v1/templates", tags=["templates"])


@router.get("", response_model=list[TemplateVersionResponse])
def list_templates(db: Session = Depends(get_db)) -> list[TemplateVersion]:
    result = db.execute(select(TemplateVersion).order_by(TemplateVersion.template_name, TemplateVersion.version.desc()))
    return list(result.scalars().all())
