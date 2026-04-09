from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import DateTime, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.config import get_settings
from app.db import Base

settings = get_settings()


def json_type():
    if settings.database_url.startswith("postgresql"):
        return JSONB
    return JSON


class AccidentCase(Base):
    __tablename__ = "accident_cases"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    case_number: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    accident_type: Mapped[str] = mapped_column(String(30), index=True)
    payload: Mapped[dict] = mapped_column(json_type(), nullable=False)
    legal_description: Mapped[str] = mapped_column(Text, nullable=False)
    preview_text: Mapped[str] = mapped_column(Text, nullable=False)
    generated_files: Mapped[dict] = mapped_column(json_type(), default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))
