import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { FormSection } from "../components/FormSection";
import { DARFormValues, generateDAR } from "../lib/api";

// ─── default values (FIR 212/2026) ───────────────────────────────────────────
const defaultValues: DARFormValues = {
  fir_no: "212/2026",
  date: "11/03/2026",
  under_section: "281/106(1) BNS, 2023",
  case_type: "Fatal",
  accident_date: "11/03/2026",
  accident_time: "13:00",
  accident_place:
    "Infront of Tirpal Ghar Shop No CW-544, Cut of Sanjay Gandhi Transport Nagar Delhi.",
  driver_name: "Babu Singh",
  driver_father: "Kundan Singh",
  driver_address: "Village Dabadi Ki Ser Chanyana Bakyori (257), Sirmor HP-173024.",
  driver_mobile: "9805392670",
  driver_age: "",
  driver_dl_no: "HP16A 20230000160",
  driver_dl_validity: "10/05/23 to 09/05/33",
  driver_dl_authority: "Pachhad (HP16A)",
  owner_name: "Ramesh Chand",
  owner_father: "Bidhi Chand",
  owner_address: "HNo.233, Ward No.3 Khera Sita Ram Kalka Panchkula Haryana.",
  owner_mobile: "9816043050",
  vehicle_reg_no: "HR64A-6664",
  vehicle_make: "VE Commercial Vehicle",
  vehicle_model: "Eicher Pro 2095XP CNG",
  vehicle_year: "2/2021",
  vehicle_chassis: "479034",
  vehicle_engine: "339779",
  insurance_policy_no: "3379/04146458/000/01",
  insurance_period: "30/11/25 to 29/11/26",
  insurance_co_name: "Chola MS General Insurance Co Ltd Delhi.",
  insurance_co_address: "Delhi.",
  deceased_name: "Mrs. Prem Wati",
  deceased_husband: "Bakshi Singh",
  deceased_age: "84 Yrs",
  victim_contact: "",
  victim_gender: "Female",
  victim_marital_status: "Married",
  deceased_address: "J-491, Bhagwan Pura Samaypur Libaspur Delhi.",
  deceased_occupation: "Deshi Vaid",
  deceased_income: "18,000 to 20,000/- PM",
  victim_employer: "",
  victim_income_tax_assessed: "No",
  victim_sole_earner: "Yes",
  deceased_medical_treatment: "No",
  victim_reimbursed: "No",
  victim_reimbursement_details: "",
  injury_nature: "",
  injury_treatment: "",
  hospitalization_period: "",
  surgery_details: "",
  permanent_disability: "No",
  permanent_disability_details: "",
  treatment_expenses: "",
  future_treatment_expenses: "",
  conveyance_expenses: "",
  loss_of_income: "",
  loss_of_earning_capacity: "",
  other_pecuniary_loss: "",
  property_loss: "",
  additional_information: "",
  accident_brief: "",
  compensation_claimed: "",
  hospital_name: "BJRM Hospital",
  hospital_address: "Jahangirpuri Delhi.",
  doctor_name: "Dr. Manish Kumar MO",
  io_name: "Satyaveer",
  io_rank: "ASI",
  io_pis: "6268-D",
  io_phone: "9136804031",
  ps_name: "SP Badli, Delhi",
  legal_representatives: [
    {
      name: "Mukesh S/o Lt. Bakshi Singh",
      relation: "Son",
      age: "43 Yrs",
      gender: "Male",
      marital_status: "",
      address: "J-491, Bhagwan Pura Samaypur Libaspur Delhi.",
      contact: "",
    },
    {
      name: "Bhagat Singh S/o Lt. Bakshi Singh",
      relation: "Son",
      age: "65 Yrs",
      gender: "Male",
      marital_status: "",
      address: "J-491, Bhagwan Pura Samaypur Libaspur Delhi.",
      contact: "",
    },
    {
      name: "Tilak Kaur D/o Lt. Bakshi Singh",
      relation: "Daughter",
      age: "47 Yrs",
      gender: "Female",
      marital_status: "",
      address: "J-491, Bhagwan Pura Samaypur Libaspur Delhi.",
      contact: "",
    },
  ],
  minor_children: [],
};

const legalRepTemplate = {
  name: "",
  relation: "",
  age: "",
  gender: "",
  marital_status: "",
  address: "",
  contact: "",
};
const minorChildTemplate = {
  name: "",
  school_class: "",
  annual_fee: "",
  approximate_expenses: "",
};

// ─── Under-Section common BNS options ────────────────────────────────────────
const UNDER_SECTION_PRESETS = [
  "281/106(1) BNS, 2023",
  "281/106(2) BNS, 2023",
  "281/125(a) BNS, 2023",
  "281/125(b) BNS, 2023",
  "281/106(1)/125(a) BNS, 2023",
  "281/106(1)/125(b) BNS, 2023",
  "Custom",
];

// ─── Marital status options ───────────────────────────────────────────────────
const MARITAL_OPTIONS = ["Married", "Unmarried", "Widowed", "Divorced", "Separated"];

// ─── Relation presets ─────────────────────────────────────────────────────────
const RELATION_OPTIONS = [
  "Son", "Daughter", "Wife", "Husband", "Father", "Mother",
  "Brother", "Sister", "Father-in-law", "Mother-in-law", "Other",
];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Reusable sub-components ─────────────────────────────────────────────────

function YesNoSelect({
  label,
  id,
  value,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="mt-1 flex gap-3">
        {["Yes", "No"].map((opt) => (
          <button
            key={opt}
            type="button"
            id={`${id}-${opt}`}
            onClick={() => onChange(opt)}
            className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition ${
              value === opt
                ? "border-rust bg-rust text-white shadow-sm"
                : "border-ink/15 bg-white text-ink hover:border-rust/50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function MaritalStatusSelect({
  label,
  id,
  value,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="mt-1 flex flex-wrap gap-2">
        {MARITAL_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            id={`${id}-${opt}`}
            onClick={() => onChange(opt === value ? "" : opt)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              value === opt
                ? "border-rust bg-rust text-white"
                : "border-ink/15 bg-white text-ink hover:border-rust/40"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────
export function ReportForm() {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [customSection, setCustomSection] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<DARFormValues>({ defaultValues });

  // Watched values for dynamic sections
  const caseType = useWatch({ control, name: "case_type" });
  const victimReimbursed = useWatch({ control, name: "victim_reimbursed" });
  const permanentDisability = useWatch({ control, name: "permanent_disability" });
  const victimMaritalStatus = useWatch({ control, name: "victim_marital_status" });
  const victimGender = useWatch({ control, name: "victim_gender" });
  const victimSoleEarner = useWatch({ control, name: "victim_sole_earner" });
  const victimIncomeTax = useWatch({ control, name: "victim_income_tax_assessed" });
  const underSection = useWatch({ control, name: "under_section" });

  const isFatal = caseType === "Fatal";
  const isInjury = caseType === "Simple Injury" || caseType === "Grievous Injury";
  const isProperty = caseType === "Property Damage";

  // Field arrays
  const {
    fields: repFields,
    append: appendRep,
    remove: removeRep,
  } = useFieldArray({ control, name: "legal_representatives" });

  const {
    fields: childFields,
    append: appendChild,
    remove: removeChild,
  } = useFieldArray({ control, name: "minor_children" });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError("");
      setSuccessMessage("");

      const normalized = {
        ...values,
        legal_representatives: values.legal_representatives.filter(
          (item) =>
            item.name.trim() ||
            item.relation.trim() ||
            item.age.trim() ||
            item.address.trim() ||
            item.contact.trim()
        ),
        minor_children: values.minor_children.filter(
          (item) =>
            item.name.trim() ||
            item.school_class.trim() ||
            item.annual_fee.trim() ||
            item.approximate_expenses.trim()
        ),
      };

      const result = await generateDAR(normalized);
      downloadBlob(result.blob, result.filename);
      setSuccessMessage(`✓ Downloaded ${result.filename}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    }
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>

      {/* ── 1. CASE INFO ─────────────────────────────────────────────────────── */}
      <FormSection
        title="Case Info"
        description="Court packet identifiers repeated across all DAR forms."
      >
        <div>
          <label className="label" htmlFor="fir_no">FIR No.</label>
          <input id="fir_no" className="field" {...register("fir_no", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="date">DAR Preparation Date</label>
          <input id="date" className="field" {...register("date", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="ps_name">Police Station</label>
          <input id="ps_name" className="field" {...register("ps_name", { required: true })} />
        </div>

        {/* Under Section with preset picker */}
        <div className="md:col-span-2">
          <label className="label" htmlFor="under_section">Under Section</label>
          <div className="mt-1 flex flex-wrap gap-2 mb-2">
            {UNDER_SECTION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  if (preset === "Custom") {
                    setCustomSection(true);
                    setValue("under_section", "");
                  } else {
                    setCustomSection(false);
                    setValue("under_section", preset);
                  }
                }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  underSection === preset || (preset === "Custom" && customSection)
                    ? "border-rust bg-rust text-white"
                    : "border-ink/15 bg-white text-ink hover:border-rust/40"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <input
            id="under_section"
            className="field"
            placeholder="e.g. 281/106(1) BNS, 2023"
            {...register("under_section")}
          />
        </div>

        {/* Case Type */}
        <div className="md:col-span-2">
          <label className="label" htmlFor="case_type">Case Type (Nature of Accident)</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {(["Fatal", "Simple Injury", "Grievous Injury", "Property Damage", "Other"] as const).map(
              (ct) => (
                <button
                  key={ct}
                  type="button"
                  id={`case_type_${ct}`}
                  onClick={() => setValue("case_type", ct)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                    caseType === ct
                      ? "border-rust bg-rust text-white"
                      : "border-ink/15 bg-white text-ink hover:border-rust/40"
                  }`}
                >
                  {ct}
                </button>
              )
            )}
          </div>
          <input type="hidden" {...register("case_type")} />
          <p className="mt-2 text-xs text-ink/60">
            This controls which sections appear below — death, injury, or property loss details.
          </p>
        </div>
      </FormSection>

      {/* ── 2. ACCIDENT DETAILS ──────────────────────────────────────────────── */}
      <FormSection
        title="Accident Details"
        description="Accident timing and location used across Forms I, V, VII, VIII, and X."
      >
        <div>
          <label className="label" htmlFor="accident_date">Date of Accident</label>
          <input id="accident_date" className="field" {...register("accident_date", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="accident_time">Time of Accident</label>
          <input id="accident_time" className="field" {...register("accident_time", { required: true })} />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="accident_place">Place of Accident</label>
          <input id="accident_place" className="field" {...register("accident_place", { required: true })} />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="accident_brief">Brief Description of Accident</label>
          <textarea
            id="accident_brief"
            className="field min-h-[80px] resize-y"
            {...register("accident_brief")}
          />
        </div>
      </FormSection>

      {/* ── 3. OFFICER INFO ──────────────────────────────────────────────────── */}
      <FormSection
        title="Investigating Officer Info"
        description="IO values used in headings, affidavit, and verification blocks."
      >
        <div>
          <label className="label" htmlFor="io_name">IO Name</label>
          <input id="io_name" className="field" {...register("io_name", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="io_rank">IO Rank</label>
          <input id="io_rank" className="field" {...register("io_rank", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="io_pis">IO PIS No.</label>
          <input id="io_pis" className="field" {...register("io_pis", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="io_phone">IO Phone</label>
          <input id="io_phone" className="field" {...register("io_phone", { required: true })} />
        </div>
      </FormSection>

      {/* ── 4. VEHICLE DETAILS ───────────────────────────────────────────────── */}
      <FormSection
        title="Vehicle Details"
        description="Vehicle registration and verification report details."
      >
        <div>
          <label className="label" htmlFor="vehicle_reg_no">Registration No.</label>
          <input id="vehicle_reg_no" className="field" {...register("vehicle_reg_no", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="vehicle_make">Make</label>
          <input id="vehicle_make" className="field" {...register("vehicle_make", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="vehicle_model">Model</label>
          <input id="vehicle_model" className="field" {...register("vehicle_model", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="vehicle_year">Year of Manufacture</label>
          <input id="vehicle_year" className="field" {...register("vehicle_year", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="vehicle_chassis">Chassis No.</label>
          <input id="vehicle_chassis" className="field" {...register("vehicle_chassis", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="vehicle_engine">Engine No.</label>
          <input id="vehicle_engine" className="field" {...register("vehicle_engine", { required: true })} />
        </div>
      </FormSection>

      {/* ── 5. DRIVER DETAILS ────────────────────────────────────────────────── */}
      <FormSection
        title="Driver Details"
        description="Driver identity, address, mobile, and licence information."
      >
        <div>
          <label className="label" htmlFor="driver_name">Driver Name</label>
          <input id="driver_name" className="field" {...register("driver_name", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="driver_father">Father's Name</label>
          <input id="driver_father" className="field" {...register("driver_father", { required: true })} />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="driver_address">Address</label>
          <input id="driver_address" className="field" {...register("driver_address", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="driver_mobile">Mobile No.</label>
          <input id="driver_mobile" className="field" {...register("driver_mobile", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="driver_age">Age</label>
          <input id="driver_age" className="field" placeholder="e.g. 35 Yrs" {...register("driver_age")} />
        </div>
        <div>
          <label className="label" htmlFor="driver_dl_no">DL No.</label>
          <input id="driver_dl_no" className="field" {...register("driver_dl_no", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="driver_dl_validity">DL Validity</label>
          <input id="driver_dl_validity" className="field" {...register("driver_dl_validity", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="driver_dl_authority">Licensing Authority</label>
          <input id="driver_dl_authority" className="field" {...register("driver_dl_authority", { required: true })} />
        </div>
      </FormSection>

      {/* ── 6. OWNER DETAILS ─────────────────────────────────────────────────── */}
      <FormSection
        title="Owner Details"
        description="Owner identity, father name, address, and mobile — repeated across packet tables."
      >
        <div>
          <label className="label" htmlFor="owner_name">Owner Name</label>
          <input id="owner_name" className="field" {...register("owner_name", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="owner_father">Father / Husband Name</label>
          <input id="owner_father" className="field" {...register("owner_father", { required: true })} />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="owner_address">Address</label>
          <input id="owner_address" className="field" {...register("owner_address", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="owner_mobile">Mobile No.</label>
          <input id="owner_mobile" className="field" {...register("owner_mobile", { required: true })} />
        </div>
      </FormSection>

      {/* ── 7. INSURANCE DETAILS ─────────────────────────────────────────────── */}
      <FormSection
        title="Insurance Details"
        description="Insurance fields used in the owner, verification, and DAR sections."
      >
        <div>
          <label className="label" htmlFor="insurance_policy_no">Policy No.</label>
          <input id="insurance_policy_no" className="field" {...register("insurance_policy_no", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="insurance_period">Policy Period</label>
          <input id="insurance_period" className="field" {...register("insurance_period", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="insurance_co_name">Insurance Company Name</label>
          <input id="insurance_co_name" className="field" {...register("insurance_co_name", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="insurance_co_address">Insurance Company Address</label>
          <input id="insurance_co_address" className="field" {...register("insurance_co_address", { required: true })} />
        </div>
      </FormSection>

      {/* ── 8. VICTIM / DECEASED / INJURED DETAILS (context-aware) ──────────── */}
      <FormSection
        title={
          isFatal
            ? "Deceased Details (Death Case — Form VI-A)"
            : isInjury
            ? "Injured Person Details (Form VI-A Injury Section)"
            : "Victim / Loss Details"
        }
        description="Enter shared victim details once. Reused across all applicable DAR forms."
      >
        <div>
          <label className="label" htmlFor="deceased_name">
            {isFatal ? "Name of Deceased" : isInjury ? "Name of Injured Person" : "Victim Name"}
          </label>
          <input
            id="deceased_name"
            className="field"
            {...register("deceased_name", { required: isFatal || isInjury })}
          />
        </div>
        <div>
          <label className="label" htmlFor="deceased_husband">Father / Husband Name</label>
          <input id="deceased_husband" className="field" {...register("deceased_husband")} />
        </div>
        <div>
          <label className="label" htmlFor="deceased_age">Age / Date of Birth</label>
          <input id="deceased_age" className="field" {...register("deceased_age")} />
        </div>
        <div>
          <label className="label" htmlFor="victim_contact">Contact Number</label>
          <input id="victim_contact" className="field" {...register("victim_contact")} />
        </div>

        {/* Gender — pill select */}
        <div>
          <label className="label">Gender</label>
          <div className="mt-1 flex gap-2">
            {["Male", "Female", "Other"].map((opt) => (
              <button
                key={opt}
                type="button"
                id={`victim_gender_${opt}`}
                onClick={() => setValue("victim_gender", opt)}
                className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition ${
                  victimGender === opt
                    ? "border-rust bg-rust text-white"
                    : "border-ink/15 bg-white text-ink hover:border-rust/40"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <input type="hidden" {...register("victim_gender")} />
        </div>

        {/* Marital Status — pill checkboxes */}
        <div>
          <MaritalStatusSelect
            label="Marital Status of Victim / Deceased"
            id="victim_marital_status"
            value={victimMaritalStatus}
            onChange={(val) => setValue("victim_marital_status", val)}
          />
          <input type="hidden" {...register("victim_marital_status")} />
        </div>

        <div className="md:col-span-2">
          <label className="label" htmlFor="deceased_address">Address</label>
          <input id="deceased_address" className="field" {...register("deceased_address")} />
        </div>
        <div>
          <label className="label" htmlFor="deceased_occupation">Occupation</label>
          <input id="deceased_occupation" className="field" {...register("deceased_occupation")} />
        </div>
        <div>
          <label className="label" htmlFor="deceased_income">Monthly Income</label>
          <input id="deceased_income" className="field" {...register("deceased_income")} />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="victim_employer">Employer Name and Address</label>
          <input id="victim_employer" className="field" {...register("victim_employer")} />
        </div>

        {/* Assessed to Income Tax — Yes/No */}
        <div>
          <YesNoSelect
            label="Assessed to Income Tax?"
            id="victim_income_tax_assessed"
            value={victimIncomeTax}
            onChange={(val) => setValue("victim_income_tax_assessed", val as "Yes" | "No")}
          />
          <input type="hidden" {...register("victim_income_tax_assessed")} />
        </div>

        {/* Sole Earning Member — only for Fatal */}
        {isFatal && (
          <div>
            <YesNoSelect
              label="Was Deceased the Sole Earning Member?"
              id="victim_sole_earner"
              value={victimSoleEarner}
              onChange={(val) => setValue("victim_sole_earner", val as "Yes" | "No")}
            />
            <input type="hidden" {...register("victim_sole_earner")} />
          </div>
        )}

        {/* Medical treatment before death — Fatal only */}
        {isFatal && (
          <div className="md:col-span-2">
            <label className="label" htmlFor="deceased_medical_treatment">
              Medical Treatment Before Death / Expenses Incurred
            </label>
            <textarea
              id="deceased_medical_treatment"
              className="field min-h-[60px] resize-y"
              {...register("deceased_medical_treatment")}
            />
          </div>
        )}

        {/* Medical Reimbursement — Yes/No with conditional details */}
        <div className={victimReimbursed === "Yes" ? "" : "md:col-span-2"}>
          <YesNoSelect
            label="Medical Expenses Reimbursed? (Employer / Mediclaim / Govt Scheme)"
            id="victim_reimbursed"
            value={victimReimbursed}
            onChange={(val) => setValue("victim_reimbursed", val as "Yes" | "No")}
          />
          <input type="hidden" {...register("victim_reimbursed")} />
        </div>
        {victimReimbursed === "Yes" && (
          <div>
            <label className="label" htmlFor="victim_reimbursement_details">
              Reimbursement Details
            </label>
            <input
              id="victim_reimbursement_details"
              className="field"
              placeholder="Source and amount of reimbursement"
              {...register("victim_reimbursement_details")}
            />
          </div>
        )}
      </FormSection>

      {/* ── 9. HOSPITAL DETAILS ──────────────────────────────────────────────── */}
      <FormSection
        title="Hospital Details"
        description="Hospital and doctor details used in Form I and related sections."
      >
        <div>
          <label className="label" htmlFor="hospital_name">Hospital Name</label>
          <input id="hospital_name" className="field" {...register("hospital_name", { required: true })} />
        </div>
        <div>
          <label className="label" htmlFor="doctor_name">Doctor Name</label>
          <input id="doctor_name" className="field" {...register("doctor_name", { required: true })} />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="hospital_address">Hospital Address</label>
          <input id="hospital_address" className="field" {...register("hospital_address", { required: true })} />
        </div>
      </FormSection>

      {/* ── 10. INJURY CASE DETAILS (Simple / Grievous) ──────────────────────── */}
      {isInjury && (
        <FormSection
          title="Injury Case Details (Form VI-A)"
          description="Shown because an Injury case type is selected. These populate the Injury section of Form VI-A."
        >
          <div className="md:col-span-2">
            <label className="label" htmlFor="injury_nature">
              Nature and Description of Injury (Simple / Grievous)
            </label>
            <textarea
              id="injury_nature"
              className="field min-h-[60px] resize-y"
              {...register("injury_nature")}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label" htmlFor="injury_treatment">Medical Treatment Taken</label>
            <textarea
              id="injury_treatment"
              className="field min-h-[60px] resize-y"
              {...register("injury_treatment")}
            />
          </div>
          <div>
            <label className="label" htmlFor="hospitalization_period">
              Period of Hospitalization
            </label>
            <input id="hospitalization_period" className="field" {...register("hospitalization_period")} />
          </div>
          <div>
            <label className="label" htmlFor="surgery_details">Surgery / Operation Details</label>
            <input id="surgery_details" className="field" {...register("surgery_details")} />
          </div>

          {/* Permanent Disability Yes/No with conditional details */}
          <div className={permanentDisability === "Yes" ? "" : "md:col-span-2"}>
            <YesNoSelect
              label="Permanent Disability?"
              id="permanent_disability"
              value={permanentDisability}
              onChange={(val) => setValue("permanent_disability", val as "Yes" | "No")}
            />
            <input type="hidden" {...register("permanent_disability")} />
          </div>
          {permanentDisability === "Yes" && (
            <div>
              <label className="label" htmlFor="permanent_disability_details">
                Disability Details / Percentage
              </label>
              <input
                id="permanent_disability_details"
                className="field"
                {...register("permanent_disability_details")}
              />
            </div>
          )}
        </FormSection>
      )}

      {/* ── 11. PECUNIARY LOSSES (Fatal & Injury) ────────────────────────────── */}
      {(isFatal || isInjury) && (
        <FormSection
          title="Pecuniary Losses & Compensation"
          description="Financial loss details used in Form VI-A compensation table. Fill all applicable fields."
        >
          <div>
            <label className="label" htmlFor="treatment_expenses">
              Expenditure on Treatment (₹)
            </label>
            <input id="treatment_expenses" className="field" placeholder="Amount in ₹" {...register("treatment_expenses")} />
          </div>
          <div>
            <label className="label" htmlFor="future_treatment_expenses">
              Estimated Future Treatment Expenses (₹)
            </label>
            <input id="future_treatment_expenses" className="field" placeholder="Amount in ₹" {...register("future_treatment_expenses")} />
          </div>
          <div>
            <label className="label" htmlFor="conveyance_expenses">
              Conveyance, Diet and Attendant Charges (₹)
            </label>
            <input id="conveyance_expenses" className="field" placeholder="Amount in ₹" {...register("conveyance_expenses")} />
          </div>
          <div>
            <label className="label" htmlFor="loss_of_income">Loss of Income (₹)</label>
            <input id="loss_of_income" className="field" placeholder="Amount in ₹" {...register("loss_of_income")} />
          </div>
          <div>
            <label className="label" htmlFor="loss_of_earning_capacity">
              Loss of Earning Capacity (₹)
            </label>
            <input id="loss_of_earning_capacity" className="field" placeholder="Amount in ₹" {...register("loss_of_earning_capacity")} />
          </div>
          <div>
            <label className="label" htmlFor="other_pecuniary_loss">Other Pecuniary Loss</label>
            <input id="other_pecuniary_loss" className="field" {...register("other_pecuniary_loss")} />
          </div>
          <div>
            <label className="label" htmlFor="property_loss">Property Loss / Damage</label>
            <input id="property_loss" className="field" {...register("property_loss")} />
          </div>
          <div>
            <label className="label" htmlFor="compensation_claimed">
              Total Compensation Claimed (₹)
            </label>
            <input id="compensation_claimed" className="field" placeholder="Amount in ₹" {...register("compensation_claimed")} />
          </div>
          <div className="md:col-span-2">
            <label className="label" htmlFor="additional_information">
              Additional Information
            </label>
            <textarea
              id="additional_information"
              className="field min-h-[60px] resize-y"
              {...register("additional_information")}
            />
          </div>
        </FormSection>
      )}

      {/* ── 12. LEGAL REPRESENTATIVES — Form VI-A Row 22 & 23 ───────────────── */}
      {isFatal && (
        <FormSection
          title="Legal Representatives (Form VI-A — Rows 22 & 23)"
          description="Details of L/Rs of the deceased. Row 22 = Name, Age, Gender, Relation, Marital Status. Row 23 = Name, Contact, Address."
        >
          {repFields.map((field, index) => {
            const prefix = `legal_representatives.${index}` as const;
            const repMarital = watch(`${prefix}.marital_status`);
            const repGender = watch(`${prefix}.gender`);
            return (
              <div
                key={field.id}
                className="md:col-span-2 rounded-2xl border border-ink/10 bg-gradient-to-br from-white to-sand/30 p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rust text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold text-ink">Legal Representative {index + 1}</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    onClick={() => removeRep(index)}
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label className="label" htmlFor={`rep_name_${index}`}>Full Name (with S/o or D/o)</label>
                    <input
                      id={`rep_name_${index}`}
                      className="field"
                      placeholder="e.g. Mukesh S/o Lt. Bakshi Singh"
                      {...register(`${prefix}.name` as const)}
                    />
                  </div>

                  {/* Relation */}
                  <div>
                    <label className="label" htmlFor={`rep_relation_${index}`}>Relation with Deceased</label>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {RELATION_OPTIONS.map((rel) => {
                        const repRelation = watch(`${prefix}.relation`);
                        return (
                          <button
                            key={rel}
                            type="button"
                            onClick={() => setValue(`${prefix}.relation`, rel === repRelation ? "" : rel)}
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition ${
                              repRelation === rel
                                ? "border-rust bg-rust text-white"
                                : "border-ink/15 bg-white text-ink hover:border-rust/40"
                            }`}
                          >
                            {rel}
                          </button>
                        );
                      })}
                    </div>
                    <input type="hidden" {...register(`${prefix}.relation` as const)} />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="label" htmlFor={`rep_age_${index}`}>Age</label>
                    <input
                      id={`rep_age_${index}`}
                      className="field"
                      placeholder="e.g. 43 Yrs"
                      {...register(`${prefix}.age` as const)}
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="label">Gender</label>
                    <div className="mt-1 flex gap-2">
                      {["Male", "Female", "Other"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setValue(`${prefix}.gender`, g === repGender ? "" : g)}
                          className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition ${
                            repGender === g
                              ? "border-rust bg-rust text-white"
                              : "border-ink/15 bg-white text-ink hover:border-rust/40"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                    <input type="hidden" {...register(`${prefix}.gender` as const)} />
                  </div>

                  {/* Marital Status */}
                  <div>
                    <MaritalStatusSelect
                      label="Marital Status"
                      id={`rep_marital_${index}`}
                      value={repMarital}
                      onChange={(val) => setValue(`${prefix}.marital_status`, val)}
                    />
                    <input type="hidden" {...register(`${prefix}.marital_status` as const)} />
                  </div>

                  {/* Contact */}
                  <div>
                    <label className="label" htmlFor={`rep_contact_${index}`}>Contact Number</label>
                    <input
                      id={`rep_contact_${index}`}
                      className="field"
                      {...register(`${prefix}.contact` as const)}
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="label" htmlFor={`rep_address_${index}`}>
                      Present & Permanent Address
                    </label>
                    <input
                      id={`rep_address_${index}`}
                      className="field"
                      {...register(`${prefix}.address` as const)}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => appendRep(legalRepTemplate)}
              disabled={repFields.length >= 7}
              className="w-full rounded-xl border-2 border-dashed border-ink/20 px-4 py-3 text-sm font-semibold text-ink/60 transition hover:border-rust/40 hover:text-rust disabled:opacity-40"
            >
              + Add Legal Representative {repFields.length >= 7 ? "(Max 7 reached)" : `(${repFields.length}/7)`}
            </button>
          </div>
        </FormSection>
      )}

      {/* ── 13. CHILDREN BELOW 18 YEARS — Form VI-A Row 24 ──────────────────── */}
      {(isFatal || isInjury) && (
        <FormSection
          title="Children Below 18 Years (Form VI-A — Row 24)"
          description="Add only if there are minor children of the deceased/injured. These values populate Form VI-A section 24."
        >
          {childFields.length === 0 && (
            <div className="md:col-span-2 rounded-xl border border-dashed border-ink/20 bg-sand/30 p-4 text-center text-sm text-ink/50">
              No minor children added. Click "Add Child" below if applicable.
            </div>
          )}

          {childFields.map((field, index) => (
            <div
              key={field.id}
              className="md:col-span-2 rounded-2xl border border-ink/10 bg-gradient-to-br from-white to-sand/30 p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rust text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold text-ink">Child {index + 1}</p>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  onClick={() => removeChild(index)}
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="label" htmlFor={`child_name_${index}`}>Name of Child</label>
                  <input
                    id={`child_name_${index}`}
                    className="field"
                    {...register(`minor_children.${index}.name` as const)}
                  />
                </div>
                <div>
                  <label className="label" htmlFor={`child_school_${index}`}>School and Class</label>
                  <input
                    id={`child_school_${index}`}
                    className="field"
                    placeholder="e.g. DPS Class 5th"
                    {...register(`minor_children.${index}.school_class` as const)}
                  />
                </div>
                <div>
                  <label className="label" htmlFor={`child_fee_${index}`}>Annual School Fee (₹)</label>
                  <input
                    id={`child_fee_${index}`}
                    className="field"
                    {...register(`minor_children.${index}.annual_fee` as const)}
                  />
                </div>
                <div>
                  <label className="label" htmlFor={`child_exp_${index}`}>Approximate Annual Expenditure (₹)</label>
                  <input
                    id={`child_exp_${index}`}
                    className="field"
                    {...register(`minor_children.${index}.approximate_expenses` as const)}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => appendChild(minorChildTemplate)}
              disabled={childFields.length >= 6}
              className="w-full rounded-xl border-2 border-dashed border-ink/20 px-4 py-3 text-sm font-semibold text-ink/60 transition hover:border-rust/40 hover:text-rust disabled:opacity-40"
            >
              + Add Child {childFields.length >= 6 ? "(Max 6 reached)" : `(${childFields.length}/6)`}
            </button>
          </div>
        </FormSection>
      )}

      {/* ── STATUS / SUBMIT ───────────────────────────────────────────────────── */}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ✕ {error}
        </p>
      )}
      {successMessage && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </p>
      )}

      <button
        type="submit"
        id="submit_dar"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-rust px-5 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-rust/90 disabled:opacity-60"
      >
        {isSubmitting ? "Generating DAR…" : "⬇ Download DAR .docx"}
      </button>
    </form>
  );
}
