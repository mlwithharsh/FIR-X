from pathlib import Path

from docx import Document


TEMPLATE_SPECS = {
    "fir_summary_v1.docx": [
        "FIR Summary",
        "Case Number: {{ case_number }}",
        "Accident Date: {{ accident.date }}",
        "Accident Time: {{ accident.time }}",
        "Location: {{ accident.location }}",
        "Police Station: {{ accident.police_station }}",
        "Vehicle Registration: {{ vehicle.registration_number }}",
        "Driver Name: {{ driver.name }}",
        "Victim Name: {{ victim.name }}",
        "Legal Description:",
        "{{ legal_description }}",
    ],
    "form_i_far_v1.docx": [
        "FORM-I (First Accident Report)",
        "Accident Type: {{ accident.type }}",
        "District: {{ accident.district }}",
        "Owner: {{ vehicle.owner_name }}",
        "Insurance Company: {{ vehicle.insurance_company }}",
        "{% if include_death_section %}Death-related compliance section included.{% endif %}",
        "{% if include_medical_section %}Medical treatment section included.{% endif %}",
        "{% if include_minor_section %}Minor victim observations included.{% endif %}",
    ],
    "form_iii_driver_v1.docx": [
        "FORM-III (Driver Form)",
        "Driver Name: {{ driver.name }}",
        "Father's Name: {{ driver.father_name }}",
        "Phone: {{ driver.phone }}",
        "License Number: {{ driver.license_number }}",
        "Address: {{ driver.address }}",
    ],
    "form_iv_owner_v1.docx": [
        "FORM-IV (Owner Form)",
        "Owner Name: {{ vehicle.owner_name }}",
        "Owner Address: {{ vehicle.owner_address }}",
        "Vehicle Registration: {{ vehicle.registration_number }}",
        "Policy Number: {{ vehicle.policy_number }}",
    ],
    "form_v_iar_v1.docx": [
        "FORM-V (Interim Accident Report)",
        "Victim Name: {{ victim.name }}",
        "Victim Status: {{ victim.status }}",
        "Occupation: {{ victim.occupation }}",
        "Income: {{ victim.income }}",
        "{% if has_witness %}Witness: {{ witness.name }}{% endif %}",
    ],
    "form_vii_dar_v1.docx": [
        "FORM-VII (Detailed Accident Report)",
        "Rendered Narrative:",
        "{{ legal_description }}",
        "Conditional Sections:",
        "Death: {{ include_death_section }}",
        "Medical: {{ include_medical_section }}",
        "Minor: {{ include_minor_section }}",
        "Insurance Available: {{ has_insurance_details }}",
    ],
}


def ensure_sample_templates(template_dir: Path) -> None:
    template_dir.mkdir(parents=True, exist_ok=True)
    for file_name, lines in TEMPLATE_SPECS.items():
        target = template_dir / file_name
        if target.exists():
            continue
        document = Document()
        for line in lines:
            document.add_paragraph(line)
        document.save(target)
