from io import BytesIO
from zipfile import ZipFile

from fastapi.testclient import TestClient

from app.main import app
from app.schemas.report import DARForm


def _build_payload() -> dict:
    payload = {
        field_name: "TEST-VALUE"
        for field_name, field in DARForm.model_fields.items()
        if field.is_required()
    }
    payload.update(
        {
            "fir_no": "212/2026",
            "vehicle_reg_no": "API-REG-SENTINEL",
            "insurance_policy_no": "API-POLICY-SENTINEL",
            "insurance_period": "API-PERIOD-SENTINEL",
            "legal_representatives": [
                {
                    "name": "API-LOR-NAME",
                    "relation": "Son",
                    "age": "43 Yrs",
                    "gender": "Male",
                    "marital_status": "Married",
                    "address": "API-LOR-ADDRESS",
                    "contact": "API-LOR-CONTACT",
                }
            ],
        }
    )
    return payload


def test_generate_endpoint_returns_rendered_docx():
    response = TestClient(app).post("/api/generate", json=_build_payload())

    assert response.status_code == 200
    assert response.headers["content-type"].startswith(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    assert response.headers["content-disposition"] == 'attachment; filename="DAR_FIR_212_2026.docx"'

    with ZipFile(BytesIO(response.content)) as archive:
        xml = archive.read("word/document.xml").decode("utf-8")

    for expected_value in (
        "API-REG-SENTINEL",
        "API-POLICY-SENTINEL",
        "API-PERIOD-SENTINEL",
        "API-LOR-NAME",
        "API-LOR-ADDRESS",
        "API-LOR-CONTACT",
    ):
        assert expected_value in xml


def test_generate_endpoint_rejects_missing_required_field():
    payload = _build_payload()
    del payload["fir_no"]

    response = TestClient(app).post("/api/generate", json=payload)

    assert response.status_code == 422
