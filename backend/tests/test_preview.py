from datetime import date, time

from app.schemas.report import AccidentSchema, DriverSchema, ReportRequest, VehicleSchema, VictimSchema
from app.services.ai_drafter import generate_legal_description
from app.services.preview_builder import build_preview_text


def test_preview_contains_core_entities():
    payload = ReportRequest(
        accident=AccidentSchema(
            date=date(2026, 3, 11),
            time=time(13, 0),
            location="Sanjay Gandhi Transport Nagar, Delhi",
            type="fatal",
        ),
        vehicle=VehicleSchema(
            registration_number="HR64A-6664",
            type="Truck",
            owner_name="Ramesh Chand",
        ),
        driver=DriverSchema(name="Babu Singh"),
        victim=VictimSchema(name="Prem Wati", status="deceased"),
    )
    description = generate_legal_description(payload)
    preview = build_preview_text(payload, description)

    assert "HR64A-6664" in preview
    assert "Prem Wati" in preview
    assert "Triggered Sections" in preview
