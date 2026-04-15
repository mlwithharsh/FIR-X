from app.schemas.report import ReportRequest
from app.services.conditional_logic import build_conditional_sections


def build_preview_text(data: ReportRequest, legal_description: str) -> str:
    sections = build_conditional_sections(data)
    plaintiff_name = data.case_details.plaintiff_name or (data.legal_representatives[0].name if data.legal_representatives else data.victim.name)
    fragments = [
        "DAR Preview",
        f"FIR: {data.case_details.fir_number} dated {data.case_details.fir_date.strftime('%d/%m/%Y')}",
        f"Police Station: {data.case_details.police_station}",
        f"Accident: {data.accident.type.title()} accident at {data.accident.location} on {data.accident.date.isoformat()} {data.accident.time.strftime('%H:%M')}",
        f"Informant: {data.informant.name or 'Not supplied'}",
        f"Hospital / Doctor: {data.hospital.name or 'Not supplied'} / {data.hospital.doctor_name or 'Not supplied'}",
        f"Vehicle: {data.vehicle.registration_number} ({data.vehicle.type or 'Vehicle type not supplied'})",
        f"Owner: {data.vehicle.owner_name}",
        f"Driver: {data.driver.name}",
        f"Victim: {data.victim.name} [{data.victim.status}]",
        f"L/R Count: {len(data.legal_representatives)}",
        f"Plaintiff: {plaintiff_name}",
        "",
        "Legal Description:",
        legal_description,
        "",
        "Triggered Sections:",
    ]
    fragments.extend([f"- {key}: {value}" for key, value in sections.items()])
    return "\n".join(fragments)
