from pydantic import BaseModel, ConfigDict, Field


class LegalRepresentative(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(default="", max_length=200)
    relation: str = Field(default="", max_length=100)
    age: str = Field(default="", max_length=100)
    address: str = Field(default="", max_length=500)


class DARForm(BaseModel):
    model_config = ConfigDict(extra="forbid")

    fir_no: str = Field(min_length=1, max_length=100)
    date: str = Field(min_length=1, max_length=100)
    accident_date: str = Field(min_length=1, max_length=100)
    accident_time: str = Field(min_length=1, max_length=100)
    accident_place: str = Field(min_length=1, max_length=1000)
    driver_name: str = Field(min_length=1, max_length=200)
    driver_father: str = Field(min_length=1, max_length=200)
    driver_address: str = Field(min_length=1, max_length=1000)
    driver_mobile: str = Field(min_length=1, max_length=100)
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
    deceased_name: str = Field(min_length=1, max_length=200)
    deceased_husband: str = Field(min_length=1, max_length=200)
    deceased_age: str = Field(min_length=1, max_length=100)
    deceased_address: str = Field(min_length=1, max_length=1000)
    deceased_occupation: str = Field(min_length=1, max_length=200)
    deceased_income: str = Field(min_length=1, max_length=200)
    hospital_name: str = Field(min_length=1, max_length=200)
    hospital_address: str = Field(min_length=1, max_length=500)
    doctor_name: str = Field(min_length=1, max_length=200)
    io_name: str = Field(min_length=1, max_length=200)
    io_rank: str = Field(min_length=1, max_length=100)
    io_pis: str = Field(min_length=1, max_length=100)
    io_phone: str = Field(min_length=1, max_length=100)
    ps_name: str = Field(min_length=1, max_length=200)
    legal_representatives: list[LegalRepresentative] = Field(default_factory=list, max_length=7)


class TemplateVersionResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    template_name: str
    version: int
    file_name: str
    is_active: bool
