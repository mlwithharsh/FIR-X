from __future__ import annotations

from textwrap import dedent

from app.config import get_settings
from app.schemas.report import ReportRequest

settings = get_settings()


def _fallback_description(data: ReportRequest) -> str:
    collision = data.accident.collision_description or "road traffic collision"
    owner = data.vehicle.owner_name
    insurance = data.insurance.company_name or "insurance details not yet supplied"
    age_fragment = f", aged about {data.victim.age}," if data.victim.age else ""
    status_phrase = "succumbed to the injuries" if data.victim.status == "deceased" else "sustained injuries"
    return (
        f"On {data.accident.date.isoformat()} at approximately {data.accident.time.strftime('%H:%M')} hours, "
        f"at {data.accident.location}, the offending vehicle bearing registration number "
        f"{data.vehicle.registration_number}, stated to be a {data.vehicle.type or 'motor vehicle'}, allegedly driven by "
        f"{data.driver.name} and owned by {owner}, was involved in a {collision}. "
        f"During the occurrence, {data.victim.name}{age_fragment} {status_phrase}. "
        f"The matter requires consideration for compensation and compliance proceedings under the MACT framework. "
        f"The vehicle is presently linked with {insurance}."
    )


def generate_legal_description(data: ReportRequest) -> str:
    if not settings.openai_api_key:
        return _fallback_description(data)

    try:
        from openai import OpenAI

        client = OpenAI(api_key=settings.openai_api_key)
        prompt = dedent(
            f"""
            Draft a concise, formal Indian legal accident narrative for MACT-style reporting.
            Facts:
            - FIR number: {data.case_details.fir_number}
            - FIR date: {data.case_details.fir_date.strftime('%d/%m/%Y')}
            - Police station: {data.case_details.police_station}
            - Accident date: {data.accident.date.isoformat()}
            - Accident time: {data.accident.time.strftime('%H:%M')}
            - Location: {data.accident.location}
            - Accident type: {data.accident.type}
            - Collision description: {data.accident.collision_description or "Not stated"}
            - Vehicle registration: {data.vehicle.registration_number}
            - Vehicle type: {data.vehicle.type or "Not stated"}
            - Owner: {data.vehicle.owner_name}
            - Driver: {data.driver.name}
            - Victim: {data.victim.name}
            - Victim status: {data.victim.status}

            Requirements:
            - Formal legal tone
            - 1 paragraph
            - No fabricated facts
            - Mention if any detail is not yet available
            """
        ).strip()

        response = client.responses.create(model=settings.openai_model, input=prompt)
        text = getattr(response, "output_text", "").strip()
        return text or _fallback_description(data)
    except Exception:
        return _fallback_description(data)
