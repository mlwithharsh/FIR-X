from __future__ import annotations

from pathlib import Path
from typing import Any

from docxtpl import DocxTemplate

from app.schemas.report import ReportRequest
from app.services.conditional_logic import build_conditional_sections


class DocumentGenerator:
    def __init__(self, template_dir: Path, generated_dir: Path) -> None:
        self.template_dir = template_dir
        self.generated_dir = generated_dir
        self.generated_dir.mkdir(parents=True, exist_ok=True)

    def _context(self, data: ReportRequest, legal_description: str) -> dict[str, Any]:
        conditional = build_conditional_sections(data)
        payload = data.model_dump(mode="json")
        payload["legal_description"] = legal_description
        payload["case_number"] = data.case_number or "AUTO-GENERATED"
        payload.update(conditional)
        return payload

    def _render(self, template_name: str, output_name: str, context: dict[str, Any]) -> Path:
        template = DocxTemplate(self.template_dir / template_name)
        output_path = self.generated_dir / output_name
        template.render(context)
        template.save(output_path)
        return output_path

    def generate_fir_summary(self, data: ReportRequest, legal_description: str, case_id: str) -> Path:
        return self._render("fir_summary_v1.docx", f"{case_id}_fir_summary.docx", self._context(data, legal_description))

    def generate_far(self, data: ReportRequest, legal_description: str, case_id: str) -> Path:
        return self._render("form_i_far_v1.docx", f"{case_id}_form_i_far.docx", self._context(data, legal_description))

    def generate_driver_form(self, data: ReportRequest, legal_description: str, case_id: str) -> Path:
        return self._render("form_iii_driver_v1.docx", f"{case_id}_form_iii_driver.docx", self._context(data, legal_description))

    def generate_owner_form(self, data: ReportRequest, legal_description: str, case_id: str) -> Path:
        return self._render("form_iv_owner_v1.docx", f"{case_id}_form_iv_owner.docx", self._context(data, legal_description))

    def generate_iar(self, data: ReportRequest, legal_description: str, case_id: str) -> Path:
        return self._render("form_v_iar_v1.docx", f"{case_id}_form_v_iar.docx", self._context(data, legal_description))

    def generate_dar(self, data: ReportRequest, legal_description: str, case_id: str) -> Path:
        return self._render("form_vii_dar_v1.docx", f"{case_id}_form_vii_dar.docx", self._context(data, legal_description))

    def generate_all(self, data: ReportRequest, legal_description: str, case_id: str) -> list[Path]:
        return [
            self.generate_fir_summary(data, legal_description, case_id),
            self.generate_far(data, legal_description, case_id),
            self.generate_driver_form(data, legal_description, case_id),
            self.generate_owner_form(data, legal_description, case_id),
            self.generate_iar(data, legal_description, case_id),
            self.generate_dar(data, legal_description, case_id),
        ]
