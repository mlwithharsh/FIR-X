from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.config import get_settings
from app.db import Base, SessionLocal, engine
from app.models.template_version import TemplateVersion
from app.routes.health import router as health_router
from app.routes.reports import router as reports_router
from app.routes.templates import router as templates_router
from app.services.template_bootstrap import TEMPLATE_SPECS, ensure_sample_templates

settings = get_settings()


def seed_template_versions() -> None:
    with SessionLocal() as db:
        for file_name in TEMPLATE_SPECS:
            template_name = file_name.replace("_v1.docx", "")
            existing = db.execute(
                select(TemplateVersion).where(
                    TemplateVersion.template_name == template_name,
                    TemplateVersion.file_name == file_name,
                )
            ).scalar_one_or_none()
            if existing:
                continue
            db.add(
                TemplateVersion(
                    template_name=template_name,
                    version=1,
                    file_name=file_name,
                    is_active=True,
                )
            )
        db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings.generated_path.mkdir(parents=True, exist_ok=True)
    ensure_sample_templates(settings.template_dir)
    Base.metadata.create_all(bind=engine)
    seed_template_versions()
    yield


app = FastAPI(title=settings.app_name, version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(reports_router)
app.include_router(templates_router)
