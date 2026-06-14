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

    def _build_context(self, data: DARForm) -> dict[str, object]:
        context = data.model_dump()
        legal_representatives = context.pop("legal_representatives", [])
        minor_children = context.pop("minor_children", [])
        template_context: dict[str, object] = {
            key.upper(): value for key, value in context.items()
        }
        is_fatal = data.case_type == "Fatal"
        is_injury = data.case_type in {"Simple Injury", "Grievous Injury"}
        na = "N/A"

        template_context["NATURE_OF_ACCIDENT"] = self._case_type_checkboxes(data.case_type)
        template_context["VICTIM_REIMBURSEMENT"] = self._yes_no_details(
            data.victim_reimbursed, data.victim_reimbursement_details
        )
        template_context["PERMANENT_DISABILITY_VALUE"] = self._yes_no_details(
            data.permanent_disability, data.permanent_disability_details
        )

        for index in range(1, 8):
            representative = (
                legal_representatives[index - 1]
                if index <= len(legal_representatives)
                else {}
            )
            template_context[f"LEGAL_REP_{index}_NAME"] = representative.get("name", "")
            template_context[f"LEGAL_REP_{index}_RELATION"] = representative.get("relation", "")
            template_context[f"LEGAL_REP_{index}_AGE"] = representative.get("age", "")
            template_context[f"LEGAL_REP_{index}_GENDER"] = representative.get("gender", "")
            template_context[f"LEGAL_REP_{index}_MARITAL_STATUS"] = representative.get("marital_status", "")
            template_context[f"LEGAL_REP_{index}_ADDRESS"] = representative.get("address", "")
            template_context[f"LEGAL_REP_{index}_CONTACT"] = representative.get("contact", "")

        for index in range(1, 7):
            child = minor_children[index - 1] if index <= len(minor_children) else {}
            template_context[f"CHILD_{index}_NAME"] = child.get("name", "")
            template_context[f"CHILD_{index}_SCHOOL_CLASS"] = child.get("school_class", "")
            template_context[f"CHILD_{index}_ANNUAL_FEE"] = child.get("annual_fee", "")
            template_context[f"CHILD_{index}_EXPENSES"] = child.get("approximate_expenses", "")

        template_context["policy_no"] = data.insurance_policy_no
        template_context["policy_period"] = data.insurance_period
        template_context["vehicle_reg_no"] = data.vehicle_reg_no
        template_context["DEATH_CASE_VALUE"] = "" if is_fatal else na
        template_context["DEATH_NAME"] = data.deceased_name if is_fatal else na
        template_context["DEATH_FATHER_HUSBAND"] = data.deceased_husband if is_fatal else na
        template_context["DEATH_AGE"] = data.deceased_age if is_fatal else na
        template_context["DEATH_DATE"] = data.accident_date if is_fatal else na
        template_context["DEATH_GENDER"] = data.victim_gender if is_fatal else na
        template_context["DEATH_MARITAL_STATUS"] = data.victim_marital_status if is_fatal else na
        template_context["DEATH_OCCUPATION"] = data.deceased_occupation if is_fatal else na
        template_context["DEATH_EMPLOYER"] = data.victim_employer if is_fatal else na
        template_context["DEATH_INCOME"] = data.deceased_income if is_fatal else na
        template_context["DEATH_INCOME_TAX"] = data.victim_income_tax_assessed if is_fatal else na
        template_context["DEATH_SOLE_EARNER"] = data.victim_sole_earner if is_fatal else na
        template_context["DEATH_MEDICAL_TREATMENT"] = data.deceased_medical_treatment if is_fatal else na
        template_context["DEATH_REIMBURSEMENT"] = (
            template_context["VICTIM_REIMBURSEMENT"] if is_fatal else na
        )
        template_context["INJURY_NAME"] = data.deceased_name if is_injury else na
        template_context["INJURY_FATHER"] = data.deceased_husband if is_injury else na
        template_context["INJURY_ADDRESS"] = data.deceased_address if is_injury else na
        template_context["INJURY_CONTACT"] = data.victim_contact if is_injury else na
        template_context["INJURY_AGE"] = data.deceased_age if is_injury else na
        template_context["INJURY_GENDER"] = data.victim_gender if is_injury else na
        template_context["INJURY_MARITAL_STATUS"] = data.victim_marital_status if is_injury else na
        template_context["INJURY_OCCUPATION"] = data.deceased_occupation if is_injury else na
        template_context["INJURY_EMPLOYER"] = data.victim_employer if is_injury else na
        template_context["INJURY_INCOME"] = data.deceased_income if is_injury else na
        template_context["INJURY_INCOME_TAX"] = data.victim_income_tax_assessed if is_injury else na
        template_context["INJURY_NATURE"] = data.injury_nature if is_injury else na
        template_context["INJURY_TREATMENT"] = data.injury_treatment if is_injury else na
        template_context["INJURY_HOSPITALIZATION"] = (
            f"{data.hospital_name}; {data.hospitalization_period}; {data.doctor_name}"
            if is_injury
            else na
        )
        template_context["INJURY_SURGERY"] = data.surgery_details if is_injury else na
        template_context["INJURY_PERMANENT_DISABILITY"] = (
            template_context["PERMANENT_DISABILITY_VALUE"] if is_injury else na
        )

        return template_context

    @staticmethod
    def _yes_no_details(answer: str, details: str) -> str:
        return f"{answer}: {details}" if answer == "Yes" and details else answer

    @staticmethod
    def _case_type_checkboxes(case_type: str) -> str:
        options = ("Simple Injury", "Grievous Injury", "Fatal", "Property Damage", "Other")
        return "   ".join(f"{'☒' if option == case_type else '☐'} {option}" for option in options)
