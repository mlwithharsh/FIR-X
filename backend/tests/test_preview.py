from datetime import date, time

from app.schemas.report import (
    AccidentSchema,
    CaseDetailsSchema,
    DriverSchema,
    HospitalSchema,
    InformantSchema,
    InsuranceSchema,
    LegalRepresentativeSchema,
    ReportRequest,
    VehicleSchema,
    VictimSchema,
)
from app.services.ai_drafter import generate_legal_description
from app.services.preview_builder import build_preview_text


def test_preview_contains_core_entities():
    payload = ReportRequest(
        case_details=CaseDetailsSchema(
            fir_number="212/2026",
            fir_date=date(2026, 3, 11),
            sections="281/106(1) BNS",
            police_station="SP Badli, Delhi",
            investigating_officer="ASI Satyaveer No.6268-D",
        ),
        accident=AccidentSchema(
            date=date(2026, 3, 11),
            time=time(13, 0),
            location="Sanjay Gandhi Transport Nagar, Delhi",
            type="fatal",
        ),
        informant=InformantSchema(name="Ct Kuldeep No.2219/NW"),
        hospital=HospitalSchema(name="BJRM Hospital", doctor_name="Dr. Manish Kumar MO"),
        vehicle=VehicleSchema(
            registration_number="HR64A-6664",
            type="Truck",
            owner_name="Ramesh Chand S/o Bidhi Chand",
        ),
        driver=DriverSchema(name="Babu Singh S/o Kundan Singh"),
        insurance=InsuranceSchema(company_name="Chola MS General Insurance Co Ltd Delhi"),
        victim=VictimSchema(name="Prem Wati", status="deceased"),
        legal_representatives=[
            LegalRepresentativeSchema(name="Mukesh", relation="Son", age="43 Yrs"),
        ],
    )
    description = generate_legal_description(payload)
    preview = build_preview_text(payload, description)

    assert "HR64A-6664" in preview
    assert "Prem Wati" in preview
    assert "BJRM Hospital" in preview
    assert "L/R Count: 1" in preview
    assert "Triggered Sections" in preview
