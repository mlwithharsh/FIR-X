from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base
from app.db import get_db
from app.main import app


def test_preview_endpoint_returns_draft():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    payload = {
        "accident": {
            "date": "2026-03-11",
            "time": "13:00:00",
            "location": "Sanjay Gandhi Transport Nagar, Delhi",
            "type": "fatal",
            "collision_description": "truck hit pedestrian",
        },
        "vehicle": {
            "registration_number": "HR64A-6664",
            "type": "Truck",
            "owner_name": "Ramesh Chand",
        },
        "driver": {
            "name": "Babu Singh",
        },
        "victim": {
            "name": "Prem Wati",
            "status": "deceased",
        },
    }

    client = TestClient(app)
    response = client.post("/api/v1/reports/preview", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body["case_id"]
    assert "HR64A-6664" in body["preview_text"]
    assert "legal_description" in body

    app.dependency_overrides.clear()
