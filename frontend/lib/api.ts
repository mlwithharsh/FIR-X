const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export type ReportFormValues = {
  case_number?: string;
  include_pdf: boolean;
  accident: {
    date: string;
    time: string;
    location: string;
    type: "fatal" | "injury" | "property";
    collision_description?: string;
    police_station?: string;
    district?: string;
  };
  vehicle: {
    registration_number: string;
    type: string;
    owner_name: string;
    owner_address?: string;
    insurance_company?: string;
    policy_number?: string;
  };
  driver: {
    name: string;
    father_name?: string;
    phone?: string;
    license_number?: string;
    address?: string;
  };
  victim: {
    name: string;
    age?: number;
    gender?: "male" | "female" | "other";
    status: "injured" | "deceased";
    occupation?: string;
    income?: number;
  };
  witness?: {
    name?: string;
    phone?: string;
    address?: string;
  };
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
