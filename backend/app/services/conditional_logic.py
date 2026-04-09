from app.schemas.report import ReportRequest


def build_conditional_sections(data: ReportRequest) -> dict:
    victim_age = data.victim.age or 0
    return {
        "include_death_section": data.accident.type == "fatal",
        "include_medical_section": data.accident.type == "injury",
        "include_property_damage_section": data.accident.type == "property",
        "include_minor_section": victim_age > 0 and victim_age < 18,
        "has_witness": data.witness is not None,
        "has_insurance_details": bool(data.vehicle.insurance_company or data.vehicle.policy_number),
    }
