from datetime import date, time
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class CaseDetailsSchema(BaseModel):
    fir_number: str = Field(min_length=1, max_length=100)
    fir_date: date
    sections: str = Field(min_length=1, max_length=200)
    police_station: str = Field(min_length=2, max_length=200)
    district: str | None = Field(default=None, max_length=120)
    investigating_officer: str = Field(min_length=2, max_length=160)
    investigating_officer_phone: str | None = Field(default=None, max_length=30)
    plaintiff_name: str | None = Field(default=None, max_length=160)
    plaintiff_age: str | None = Field(default=None, max_length=40)
    plaintiff_gender: Literal["male", "female", "other"] | None = None
    plaintiff_mobile: str | None = Field(default=None, max_length=30)
    defendant_name: str | None = Field(default=None, max_length=160)
    defendant_age: str | None = Field(default=None, max_length=40)
    defendant_gender: Literal["male", "female", "other"] | None = None
    defendant_mobile: str | None = Field(default=None, max_length=30)


class AccidentSchema(BaseModel):
    date: date
    time: time
    location: str = Field(min_length=3, max_length=500)
    type: Literal["fatal", "injury"]
    collision_description: str | None = Field(default=None, max_length=500)
    source_of_information: Literal["driver_owner", "victim", "witness", "hospital", "good_samaritan", "police", "other"] = "hospital"
    other_source: str | None = Field(default=None, max_length=120)
    number_of_vehicles: int = Field(default=1, ge=1, le=10)
    offending_vehicle_known: bool = True
    offending_vehicle_impounded: bool = True
    driver_found_on_spot: bool = True
    fatalities_count: int = Field(default=1, ge=0, le=20)
    injured_count: int = Field(default=0, ge=0, le=20)
    cctv_available: bool = False

    @model_validator(mode="after")
    def validate_counts(self) -> "AccidentSchema":
        if self.type == "fatal" and self.fatalities_count < 1:
            raise ValueError("Fatal accidents must include at least one fatality.")
        if self.type == "injury" and self.injured_count < 1:
            raise ValueError("Injury accidents must include at least one injured person.")
        return self


class InformantSchema(BaseModel):
    name: str | None = Field(default=None, max_length=160)
    mobile: str | None = Field(default=None, max_length=30)
    address: str | None = Field(default=None, max_length=500)


class HospitalSchema(BaseModel):
    name: str | None = Field(default=None, max_length=160)
    address: str | None = Field(default=None, max_length=500)
    doctor_name: str | None = Field(default=None, max_length=160)


class VehicleSchema(BaseModel):
    registration_number: str = Field(min_length=4, max_length=30)
    type: str | None = Field(default=None, max_length=80)
    owner_name: str = Field(min_length=2, max_length=160)
    owner_address: str | None = Field(default=None, max_length=500)
    owner_phone: str | None = Field(default=None, max_length=30)


class DriverSchema(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    address: str | None = Field(default=None, max_length=500)
    phone: str | None = Field(default=None, max_length=30)
    age: str | None = Field(default=None, max_length=40)
    gender: Literal["male", "female", "other"] | None = None
    occupation: str | None = Field(default=None, max_length=120)
    monthly_income: str | None = Field(default=None, max_length=80)
    license_type: Literal["permanent", "learner", "juvenile", "without_license", "other"] | None = "permanent"
    license_number: str | None = Field(default=None, max_length=120)
    license_validity: str | None = Field(default=None, max_length=120)
    licensing_authority: str | None = Field(default=None, max_length=120)


class InsuranceSchema(BaseModel):
    company_name: str | None = Field(default=None, max_length=160)
    company_address: str | None = Field(default=None, max_length=500)
    policy_number: str | None = Field(default=None, max_length=160)
    policy_period: str | None = Field(default=None, max_length=120)


class VictimSchema(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    address: str | None = Field(default=None, max_length=500)
    age: str | None = Field(default=None, max_length=40)
    gender: Literal["male", "female", "other"] | None = None
    status: Literal["injured", "deceased"]
    occupation: str | None = Field(default=None, max_length=120)
    category: Literal["pedestrian", "cyclist", "two_wheeler", "other_vehicle", "other"] = "pedestrian"


class LegalRepresentativeSchema(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    relation: str = Field(min_length=1, max_length=60)
    age: str | None = Field(default=None, max_length=40)
    address: str | None = Field(default=None, max_length=500)


class ReportRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    case_details: CaseDetailsSchema
    accident: AccidentSchema
    informant: InformantSchema = Field(default_factory=InformantSchema)
    hospital: HospitalSchema = Field(default_factory=HospitalSchema)
    vehicle: VehicleSchema
    driver: DriverSchema
    insurance: InsuranceSchema = Field(default_factory=InsuranceSchema)
    victim: VictimSchema
    legal_representatives: list[LegalRepresentativeSchema] = Field(default_factory=list, max_length=7)

    @field_validator("legal_representatives")
    @classmethod
    def trim_blank_representatives(cls, value: list[LegalRepresentativeSchema]) -> list[LegalRepresentativeSchema]:
        return [item for item in value if item.name.strip()]

    @model_validator(mode="after")
    def validate_status_type_alignment(self) -> "ReportRequest":
        if self.accident.type == "fatal" and self.victim.status != "deceased":
            raise ValueError("Victim status must be 'deceased' for fatal accidents.")
        if self.accident.type == "injury" and self.victim.status != "injured":
            raise ValueError("Victim status must be 'injured' for injury accidents.")
        return self


class PreviewResponse(BaseModel):
    preview_text: str
    legal_description: str
    conditional_sections: dict[str, bool]


class GenerateResponse(BaseModel):
    file_name: str
    download_path: str
    generated_files: list[str]


class TemplateVersionResponse(BaseModel):
    template_name: str
    version: int
    file_name: str
    is_active: bool
