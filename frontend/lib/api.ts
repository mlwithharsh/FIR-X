const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://fir-x.onrender.com";

export type LegalRepresentative = {
  name: string;
  relation: string;
  age: string;
  address: string;
};

export type DARFormValues = {
  fir_no: string;
  date: string;
  accident_date: string;
  accident_time: string;
  accident_place: string;
  driver_name: string;
  driver_father: string;
  driver_address: string;
  driver_mobile: string;
  driver_dl_no: string;
  driver_dl_validity: string;
  driver_dl_authority: string;
  owner_name: string;
  owner_father: string;
  owner_address: string;
  owner_mobile: string;
  vehicle_reg_no: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  vehicle_chassis: string;
  vehicle_engine: string;
  insurance_policy_no: string;
  insurance_period: string;
  insurance_co_name: string;
  insurance_co_address: string;
  deceased_name: string;
  deceased_husband: string;
  deceased_age: string;
  deceased_address: string;
  deceased_occupation: string;
  deceased_income: string;
  hospital_name: string;
  hospital_address: string;
  doctor_name: string;
  io_name: string;
  io_rank: string;
  io_pis: string;
  io_phone: string;
  ps_name: string;
  legal_representatives: LegalRepresentative[];
};

export type ReportFormValues = DARFormValues;

function getDownloadFilename(header: string | null) {
  if (!header) return "DAR_FIR.docx";
  const match = header.match(/filename=\"?([^"]+)\"?/i);
  return match?.[1] || "DAR_FIR.docx";
}

export async function generateDAR(payload: DARFormValues) {
  const response = await fetch(`${API_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Unable to generate DAR");
  }

  return {
    blob: await response.blob(),
    filename: getDownloadFilename(response.headers.get("Content-Disposition")),
  };
}
