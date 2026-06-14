from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


YesNo = Literal["Yes", "No"]
CaseType = Literal["Fatal", "Simple Injury", "Grievous Injury", "Property Damage", "Other"]


class LegalRepresentative(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(default="", max_length=200)
    relation: str = Field(default="", max_length=100)
    age: str = Field(default="", max_length=100)
    gender: str = Field(default="", max_length=100)
    marital_status: str = Field(default="", max_length=100)
    address: str = Field(default="", max_length=500)
    contact: str = Field(default="", max_length=100)


class MinorChild(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(default="", max_length=200)
    school_class: str = Field(default="", max_length=300)
    annual_fee: str = Field(default="", max_length=100)
    approximate_expenses: str = Field(default="", max_length=200)


class DARForm(BaseModel):
    model_config = ConfigDict(extra="forbid")

    fir_no: str = Field(min_length=1, max_length=100)
    date: str = Field(min_length=1, max_length=100)
    under_section: str = Field(default="281/106(1) BNS, 2023", max_length=300)
    case_type: CaseType = "Fatal"
    accident_date: str = Field(min_length=1, max_length=100)
    accident_time: str = Field(min_length=1, max_length=100)
    accident_place: str = Field(min_length=1, max_length=1000)
    driver_name: str = Field(min_length=1, max_length=200)
    driver_father: str = Field(min_length=1, max_length=200)
    driver_address: str = Field(min_length=1, max_length=1000)
    driver_mobile: str = Field(min_length=1, max_length=100)
    driver_age: str = Field(default="", max_length=100)
    driver_dl_no: str = Field(min_length=1, max_length=200)
    driver_dl_validity: str = Field(min_length=1, max_length=200)
    driver_dl_authority: str = Field(min_length=1, max_length=200)
    owner_name: str = Field(min_length=1, max_length=200)
    owner_father: str = Field(min_length=1, max_length=200)
    owner_address: str = Field(min_length=1, max_length=1000)
    owner_mobile: str = Field(min_length=1, max_length=100)
    vehicle_reg_no: str = Field(min_length=1, max_length=100)
    vehicle_make: str = Field(min_length=1, max_length=200)
    vehicle_model: str = Field(min_length=1, max_length=200)
    vehicle_year: str = Field(min_length=1, max_length=100)
    vehicle_chassis: str = Field(min_length=1, max_length=200)
    vehicle_engine: str = Field(min_length=1, max_length=200)
    insurance_policy_no: str = Field(min_length=1, max_length=200)
    insurance_period: str = Field(min_length=1, max_length=200)
    insurance_co_name: str = Field(min_length=1, max_length=300)
    insurance_co_address: str = Field(min_length=1, max_length=500)
    deceased_name: str = Field(default="", max_length=200)
    deceased_husband: str = Field(default="", max_length=200)
    deceased_age: str = Field(default="", max_length=100)
    victim_contact: str = Field(default="", max_length=100)
    victim_gender: str = Field(default="", max_length=100)
    victim_marital_status: str = Field(default="", max_length=100)
    deceased_address: str = Field(default="", max_length=1000)
    deceased_occupation: str = Field(default="", max_length=200)
    deceased_income: str = Field(default="", max_length=200)
    victim_employer: str = Field(default="", max_length=500)
    victim_income_tax_assessed: YesNo = "No"
    victim_sole_earner: YesNo = "No"
    deceased_medical_treatment: str = Field(default="", max_length=1000)
    victim_reimbursed: YesNo = "No"
    victim_reimbursement_details: str = Field(default="", max_length=1000)
    injury_nature: str = Field(default="", max_length=500)
    injury_treatment: str = Field(default="", max_length=1000)
    hospitalization_period: str = Field(default="", max_length=300)
    surgery_details: str = Field(default="", max_length=1000)
    permanent_disability: YesNo = "No"
    permanent_disability_details: str = Field(default="", max_length=1000)
    treatment_expenses: str = Field(default="", max_length=200)
    future_treatment_expenses: str = Field(default="", max_length=200)
    conveyance_expenses: str = Field(default="", max_length=200)
    loss_of_income: str = Field(default="", max_length=200)
    loss_of_earning_capacity: str = Field(default="", max_length=200)
    other_pecuniary_loss: str = Field(default="", max_length=500)
    property_loss: str = Field(default="", max_length=500)
    additional_information: str = Field(default="", max_length=1000)
    accident_brief: str = Field(default="", max_length=2000)
    compensation_claimed: str = Field(default="", max_length=300)
    hospital_name: str = Field(default="", max_length=200)
    hospital_address: str = Field(default="", max_length=500)
    doctor_name: str = Field(default="", max_length=200)
    io_name: str = Field(min_length=1, max_length=200)
    io_rank: str = Field(min_length=1, max_length=100)
    io_pis: str = Field(min_length=1, max_length=100)
    io_phone: str = Field(min_length=1, max_length=100)
    ps_name: str = Field(min_length=1, max_length=200)
    legal_representatives: list[LegalRepresentative] = Field(default_factory=list, max_length=7)
    minor_children: list[MinorChild] = Field(default_factory=list, max_length=6)


class TemplateVersionResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    template_name: str
    version: int
    file_name: str
    is_active: bool
