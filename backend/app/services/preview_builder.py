from app.schemas.report import ReportRequest
from app.services.conditional_logic import build_conditional_sections


def build_preview_text(data: ReportRequest, legal_description: str) -> str:
    sections = build_conditional_sections(data)
    fragments = [
        "FIR.ai V2 Preview",
        f"Case Number: {data.case_number or 'AUTO-GENERATED'}",
        f"Accident: {data.accident.type.title()} accident at {data.accident.location} on {data.accident.date.isoformat()} {data.accident.time.strftime('%H:%M')}",
        f"Vehicle: {data.vehicle.registration_number} ({data.vehicle.type})",
        f"Driver: {data.driver.name}",
        f"Victim: {data.victim.name} [{data.victim.status}]",
        "",
        "Legal Description:",
        legal_description,
        "",
        "Triggered Sections:",
    ]
    fragments.extend([f"- {key}: {value}" for key, value in sections.items()])
    return "\n".join(fragments)
