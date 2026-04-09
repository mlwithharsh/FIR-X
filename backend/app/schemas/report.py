from datetime import date, time
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class AccidentSchema(BaseModel):
    date: date
    time: time
    location: str = Field(min_length=3, max_length=500)
    type: Literal["fatal", "injury", "property"]
    collision_description: str | None = Field(default=None, max_length=500)
    police_station: str | None = Field(default=None, max_length=200)
    district: str | None = Field(default=None, max_length=120)


class VehicleSchema(BaseModel):
    registration_number: str = Field(min_length=4, max_length=30)
    type: str = Field(default="Unknown", max_length=80)
    owner_name: str = Field(min_length=2, max_length=120)
    owner_address: str | None = Field(default=None, max_length=500)
    insurance_company: str | None = Field(default=None, max_length=120)
    policy_number: str | None = Field(default=None, max_length=120)


class DriverSchema(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    father_name: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=20)
    license_number: str | None = Field(default=None, max_length=120)
    address: str | None = Field(default=None, max_length=500)


class VictimSchema(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    age: int | None = Field(default=None, ge=0, le=120)
    gender: Literal["male", "female", "other"] | None = None
    status: Literal["injured", "deceased"]
    occupation: str | None = Field(default=None, max_length=120)
    income: float | None = Field(default=None, ge=0)


class WitnessSchema(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str | None = Field(default=None, max_length=20)
    address: str | None = Field(default=None, max_length=500)


class ReportRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    case_number: str | None = Field(default=None, max_length=100)
    accident: AccidentSchema
    vehicle: VehicleSchema
    driver: DriverSchema
    victim: VictimSchema
    witness: WitnessSchema | None = None
    include_pdf: bool = False

    @field_validator("case_number")
    @classmethod
    def blank_case_number_to_none(cls, value: str | None) -> str | None:
        return value or None

    @model_validator(mode="after")
    def validate_status_type_alignment(self) -> "ReportRequest":
        if self.accident.type == "fatal" and self.victim.status != "deceased":
            raise ValueError("Victim status must be 'deceased' for fatal accidents.")
        if self.accident.type == "injury" and self.victim.status != "injured":
            raise ValueError("Victim status must be 'injured' for injury accidents.")
        return self


class PreviewResponse(BaseModel):
    case_id: str
    preview_text: str
    legal_description: str
    conditional_sections: dict


class GenerateResponse(BaseModel):
    case_id: str
    zip_file_name: str
    download_path: str
    generated_files: list[str]


class TemplateVersionResponse(BaseModel):
    template_name: str
    version: int
    file_name: str
    is_active: bool
