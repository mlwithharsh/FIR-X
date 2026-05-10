import requests
from io import BytesIO
from docx import Document

BASE_URL = "http://127.0.0.1:8000"

payload = {
  "fir_no": "TEST-9999",
  "date": "10/05/2026",
  "accident_date": "10/05/2026",
  "accident_time": "14:00",
  "accident_place": "QA Place",
  "driver_name": "QA_DRIVER",
  "driver_father": "QA_FATHER",
  "driver_address": "QA_ADDRESS",
  "driver_mobile": "9999999999",
  "driver_dl_no": "QA_DL",
  "driver_dl_validity": "2030",
  "driver_dl_authority": "QA_AUTH",
  "owner_name": "QA_OWNER",
  "owner_father": "QA_OWNER_FATHER",
  "owner_address": "QA_OWNER_ADDRESS",
  "owner_mobile": "8888888888",
  "vehicle_reg_no": "QA00AA0000",
  "vehicle_make": "QA_MAKE",
  "vehicle_model": "QA_MODEL",
  "vehicle_year": "2024",
  "vehicle_chassis": "QA_CHASSIS",
  "vehicle_engine": "QA_ENGINE",
  "insurance_policy_no": "QA_INS",
  "insurance_period": "2024",
  "insurance_co_name": "QA_INS_CO",
  "insurance_co_address": "QA_INS_ADDR",
  "deceased_name": "QA_VICTIM",
  "deceased_husband": "QA_HUSBAND",
  "deceased_age": "30",
  "deceased_address": "QA_ADDR",
  "deceased_occupation": "QA_JOB",
  "deceased_income": "50000",
  "hospital_name": "QA_HOSP",
  "hospital_address": "QA_HOSP_ADDR",
  "doctor_name": "QA_DOCTOR",
  "io_name": "QA_IO",
  "io_rank": "QA_RANK",
  "io_pis": "QA_PIS",
  "io_phone": "7777777777",
  "ps_name": "QA_PS",
  "legal_representatives": [
      {"name": "Rep One", "relation": "Son", "age": "", "address": "Rep Address"}
  ]
}

def test_t3():
    print("Running T3...")
    response = requests.post(f"{BASE_URL}/api/generate", json=payload)
    if response.status_code != 200:
        print(f"FAIL: T3 - Status code {response.status_code}")
        print(response.json())
        return

    doc = Document(BytesIO(response.content))
    all_text = []
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                all_text.append(cell.text)
    
    full_text = "\n".join(all_text)
    
    # Check if "Rep One" is there
    if "Rep One" in full_text:
        print("PASS: T3 - Document generated with blank field")
    else:
        print("FAIL: T3 - Rep One not found")

if __name__ == "__main__":
    test_t3()
