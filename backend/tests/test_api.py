from fastapi.testclient import TestClient
from io import BytesIO
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from zipfile import ZipFile

from app.db import Base
from app.main import app


def _build_payload():
    return {
        "case_details": {
            "fir_number": "212/2026",
            "fir_date": "2026-03-11",
            "sections": "281/106(1) BNS",
            "police_station": "SP Badli, Delhi",
            "district": "Outer North Delhi",
            "investigating_officer": "ASI Satyaveer No.6268-D",
        },
        "accident": {
            "date": "2026-03-11",
            "time": "13:00:00",
            "location": "Infront of Tirpal Ghar Shop No CW-544, Cut of Sanjay Gandhi Transport Nagar Delhi.",
            "type": "fatal",
            "collision_description": "truck hit pedestrian",
            "source_of_information": "hospital",
            "number_of_vehicles": 1,
            "offending_vehicle_known": True,
            "offending_vehicle_impounded": True,
            "driver_found_on_spot": True,
            "fatalities_count": 1,
            "injured_count": 0,
            "cctv_available": False,
        },
        "informant": {
            "name": "Ct Kuldeep No.2219/NW",
            "address": "BJRM Hospital Jahangirpuri Delhi.",
        },
        "hospital": {
            "name": "BJRM Hospital",
            "address": "Jahangirpuri Delhi.",
            "doctor_name": "Dr. Manish Kumar MO",
        },
        "vehicle": {
            "registration_number": "HR64A-6664",
            "type": "Truck",
            "owner_name": "Ramesh Chand S/o Bidhi Chand",
            "owner_address": "HNo.233, Ward No.3 Khera Sita Ram Kalka Panchkula Haryana.",
            "owner_phone": "9816043050",
        },
        "driver": {
            "name": "Babu Singh S/o Kundan Singh",
            "address": "Village Dabadi Ki Ser Chanyana Bakyori (257), Sirmor HP-173024.",
            "phone": "9805392670",
            "age": "50 Yrs",
            "gender": "male",
            "license_type": "permanent",
            "license_number": "HP16A 20230000160",
        },
        "insurance": {
            "company_name": "Chola MS General Insurance Co Ltd Delhi",
            "company_address": "Delhi",
            "policy_number": "3379/04146458/000/01",
            "policy_period": "30/11/25 to 29/11/26",
        },
        "victim": {
            "name": "Mrs. Prem Wati W/o Bakshi Singh",
            "address": "J-491, Bhagwan Pura Samaypur Libaspur Delhi.",
            "age": "84 Yrs",
            "status": "deceased",
            "occupation": "Desi Vadi",
            "category": "pedestrian",
        },
        "legal_representatives": [
            {"name": "Mukesh S/o Lt. Bakshi Singh", "relation": "Son", "age": "43 Yrs", "address": "J-491, Bhagwan Pura Samaypur Libaspur Delhi."}
        ],
    }


def test_preview_endpoint_returns_draft():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool, future=True)
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)
    Base.metadata.create_all(bind=engine)

    client = TestClient(app)
    response = client.post("/api/v1/reports/preview", json=_build_payload())

    assert response.status_code == 200
    body = response.json()
    assert "HR64A-6664" in body["preview_text"]
    assert "legal_description" in body


def test_generate_endpoint_returns_docx_file():
    client = TestClient(app)
    response = client.post("/api/v1/reports/generate-report", json=_build_payload())

    assert response.status_code == 200
    body = response.json()
    assert body["file_name"].endswith(".docx")
    assert body["generated_files"] == [body["file_name"]]
    download = client.get(body["download_path"])
    assert download.status_code == 200
    assert download.headers["content-type"].startswith(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    with ZipFile(BytesIO(download.content)) as archive:
        xml = archive.read("word/document.xml").decode("utf-8")
    assert "BJRM Hospital" in xml
    assert "Dr. Manish Kumar MO" in xml
    assert "Mukesh S/o Lt. Bakshi Singh" in xml
