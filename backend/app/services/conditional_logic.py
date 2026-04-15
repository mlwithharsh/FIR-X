from app.schemas.report import ReportRequest


def build_conditional_sections(data: ReportRequest) -> dict[str, bool]:
    has_legal_representatives = len(data.legal_representatives) > 0
    return {
        "include_death_section": data.accident.type == "fatal",
        "include_medical_section": data.accident.type == "injury",
        "has_hospital_details": bool(data.hospital.name or data.hospital.doctor_name),
        "has_legal_representatives": has_legal_representatives,
        "has_insurance_details": bool(data.insurance.company_name or data.insurance.policy_number),
        "driver_is_owner": data.driver.name.strip().lower() == data.vehicle.owner_name.strip().lower(),
        "cctv_available": data.accident.cctv_available,
    }
