from __future__ import annotations

from io import BytesIO
from pathlib import Path

from docxtpl import DocxTemplate

from app.schemas.report import DARForm


class DocumentGenerator:
    def __init__(self, template_path: Path) -> None:
        self.template_path = template_path

    def generate_dar(self, data: DARForm) -> bytes:
        if not self.template_path.exists():
            raise FileNotFoundError(f"DAR template not found: {self.template_path}")

        template = DocxTemplate(self.template_path)
        template.render(self._build_context(data))

        output = BytesIO()
        template.save(output)
        return output.getvalue()

    def _build_context(self, data: DARForm) -> dict[str, str]:
        context = data.model_dump()
        legal_representatives = context.pop("legal_representatives", [])

        for index in range(1, 8):
            representative = legal_representatives[index - 1] if index <= len(legal_representatives) else {}
            context[f"LEGAL_REP_{index}_NAME"] = representative.get("name", "")
            context[f"LEGAL_REP_{index}_RELATION"] = representative.get("relation", "")
            context[f"LEGAL_REP_{index}_AGE"] = representative.get("age", "")
            context[f"LEGAL_REP_{index}_ADDRESS"] = representative.get("address", "")

        return {key.upper(): value for key, value in context.items()}
