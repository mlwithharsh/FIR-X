const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export type ReportFormValues = {
  case_details: {
    fir_number: string;
    fir_date: string;
    sections: string;
    police_station: string;
    district?: string;
    investigating_officer: string;
    investigating_officer_phone?: string;
    plaintiff_name?: string;
    plaintiff_age?: string;
    plaintiff_gender?: "male" | "female" | "other";
    plaintiff_mobile?: string;
    defendant_name?: string;
    defendant_age?: string;
    defendant_gender?: "male" | "female" | "other";
    defendant_mobile?: string;
  };
  accident: {
    date: string;
    time: string;
    location: string;
    type: "fatal" | "injury";
    collision_description?: string;
    source_of_information: "driver_owner" | "victim" | "witness" | "hospital" | "good_samaritan" | "police" | "other";
    other_source?: string;
    number_of_vehicles: number;
    offending_vehicle_known: boolean;
    offending_vehicle_impounded: boolean;
    driver_found_on_spot: boolean;
    fatalities_count: number;
    injured_count: number;
    cctv_available: boolean;
  };
  informant: {
    name?: string;
    mobile?: string;
    address?: string;
  };
  hospital: {
    name?: string;
    address?: string;
    doctor_name?: string;
  };
  vehicle: {
    registration_number: string;
    type?: string;
    owner_name: string;
    owner_address?: string;
    owner_phone?: string;
  };
  driver: {
    name: string;
    address?: string;
    phone?: string;
    age?: string;
    gender?: "male" | "female" | "other";
    occupation?: string;
    monthly_income?: string;
    license_type?: "permanent" | "learner" | "juvenile" | "without_license" | "other";
    license_number?: string;
    license_validity?: string;
    licensing_authority?: string;
  };
  insurance: {
    company_name?: string;
    company_address?: string;
    policy_number?: string;
    policy_period?: string;
  };
  victim: {
    name: string;
    address?: string;
    age?: string;
    gender?: "male" | "female" | "other";
    status: "injured" | "deceased";
    occupation?: string;
    category?: "pedestrian" | "cyclist" | "two_wheeler" | "other_vehicle" | "other";
  };
  legal_representatives: Array<{
    name: string;
    relation: string;
    age?: string;
    address?: string;
  }>;
};

export async function previewReport(payload: ReportFormValues) {
  const response = await fetch(`${API_BASE_URL}/api/v1/reports/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Unable to generate preview");
  }

  return response.json();
}

export async function generateReport(payload: ReportFormValues) {
  const response = await fetch(`${API_BASE_URL}/api/v1/reports/generate-report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Unable to generate report");
  }

  return response.json();
}

export function buildDownloadUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}
