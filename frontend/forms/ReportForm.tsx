import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { FormSection } from "../components/FormSection";
import { DARFormValues, generateDAR } from "../lib/api";

const defaultValues: DARFormValues = {
  fir_no: "212/2026",
  date: "11/03/2026",
  accident_date: "11/03/2026",
  accident_time: "13:00",
  accident_place: "Infront of Tirpal Ghar Shop No CW-544, Cut of Sanjay Gandhi Transport Nagar Delhi.",
  driver_name: "Babu Singh",
  driver_father: "Kundan Singh",
  driver_address: "Village Dabadi Ki Ser Chanyana Bakyori (257), Sirmor HP-173024.",
  driver_mobile: "9805392670",
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
  deceased_address: "J-491, Bhagwan Pura Samaypur Libaspur Delhi.",
  deceased_occupation: "Deshi Vaid",
  deceased_income: "18,000 to 20,000/- PM",
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
      address: "J-491, Bhagwan Pura Samaypur Libaspur Delhi.",
    },
    {
      name: "Bhagat Singh S/o Lt. Bakshi Singh",
      relation: "Son",
      age: "65 Yrs",
      address: "J-491, Bhagwan Pura Samaypur Libaspur Delhi.",
    },
    {
      name: "Tilak Kaur D/o Lt. Bakshi Singh",
      relation: "Daughter",
      age: "47 Yrs",
      address: "J-491, Bhagwan Pura Samaypur Libaspur Delhi.",
    },
  ],
};

const legalRepresentativeTemplate = { name: "", relation: "", age: "", address: "" };

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

export function ReportForm() {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<DARFormValues>({ defaultValues });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "legal_representatives",
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError("");
      setSuccessMessage("");

      const normalized = {
        ...values,
        legal_representatives: values.legal_representatives.filter(
          (item) => item.name.trim() || item.relation.trim() || item.age.trim() || item.address.trim(),
        ),
      };

      const result = await generateDAR(normalized);
      downloadBlob(result.blob, result.filename);
      setSuccessMessage(`Downloaded ${result.filename}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    }
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <FormSection title="Case Info" description="Court packet identifiers repeated across the DAR forms.">
        <div>
          <label className="label">FIR No</label>
          <input className="field" {...register("fir_no", { required: true })} />
        </div>
        <div>
          <label className="label">Date</label>
          <input className="field" {...register("date", { required: true })} />
        </div>
        <div>
          <label className="label">Police Station</label>
          <input className="field" {...register("ps_name", { required: true })} />
        </div>
      </FormSection>

      <FormSection title="Accident Details" description="Accident timing and location used across Forms I, V, VII, VIII, and X.">
        <div>
          <label className="label">Accident Date</label>
          <input className="field" {...register("accident_date", { required: true })} />
        </div>
        <div>
          <label className="label">Accident Time</label>
          <input className="field" {...register("accident_time", { required: true })} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Accident Place</label>
          <input className="field" {...register("accident_place", { required: true })} />
        </div>
      </FormSection>

      <FormSection title="Officer Info" description="Investigating officer values used in the headings, affidavit, and verification blocks.">
        <div>
          <label className="label">IO Name</label>
          <input className="field" {...register("io_name", { required: true })} />
        </div>
        <div>
          <label className="label">IO Rank</label>
          <input className="field" {...register("io_rank", { required: true })} />
        </div>
        <div>
          <label className="label">IO PIS</label>
          <input className="field" {...register("io_pis", { required: true })} />
        </div>
        <div>
          <label className="label">IO Phone</label>
          <input className="field" {...register("io_phone", { required: true })} />
        </div>
      </FormSection>

      <FormSection title="Vehicle Details" description="Vehicle registration and verification report details.">
        <div>
          <label className="label">Vehicle Registration No</label>
          <input className="field" {...register("vehicle_reg_no", { required: true })} />
        </div>
        <div>
          <label className="label">Vehicle Make</label>
          <input className="field" {...register("vehicle_make", { required: true })} />
        </div>
        <div>
          <label className="label">Vehicle Model</label>
          <input className="field" {...register("vehicle_model", { required: true })} />
        </div>
        <div>
          <label className="label">Vehicle Year</label>
          <input className="field" {...register("vehicle_year", { required: true })} />
        </div>
        <div>
          <label className="label">Vehicle Chassis</label>
          <input className="field" {...register("vehicle_chassis", { required: true })} />
        </div>
        <div>
          <label className="label">Vehicle Engine</label>
          <input className="field" {...register("vehicle_engine", { required: true })} />
        </div>
      </FormSection>

      <FormSection title="Driver Details" description="Driver identity, address, mobile, and licence information.">
        <div>
          <label className="label">Driver Name</label>
          <input className="field" {...register("driver_name", { required: true })} />
        </div>
        <div>
          <label className="label">Driver Father</label>
          <input className="field" {...register("driver_father", { required: true })} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Driver Address</label>
          <input className="field" {...register("driver_address", { required: true })} />
        </div>
        <div>
          <label className="label">Driver Mobile</label>
          <input className="field" {...register("driver_mobile", { required: true })} />
        </div>
        <div>
          <label className="label">DL No</label>
          <input className="field" {...register("driver_dl_no", { required: true })} />
        </div>
        <div>
          <label className="label">DL Validity</label>
          <input className="field" {...register("driver_dl_validity", { required: true })} />
        </div>
        <div>
          <label className="label">DL Authority</label>
          <input className="field" {...register("driver_dl_authority", { required: true })} />
        </div>
      </FormSection>

      <FormSection title="Owner Details" description="Owner identity, father name, address, and mobile values repeated across packet tables.">
        <div>
          <label className="label">Owner Name</label>
          <input className="field" {...register("owner_name", { required: true })} />
        </div>
        <div>
          <label className="label">Owner Father</label>
          <input className="field" {...register("owner_father", { required: true })} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Owner Address</label>
          <input className="field" {...register("owner_address", { required: true })} />
        </div>
        <div>
          <label className="label">Owner Mobile</label>
          <input className="field" {...register("owner_mobile", { required: true })} />
        </div>
      </FormSection>

      <FormSection title="Insurance Details" description="Insurance fields used in the owner, verification, and DAR sections.">
        <div>
          <label className="label">Policy No</label>
          <input className="field" {...register("insurance_policy_no", { required: true })} />
        </div>
        <div>
          <label className="label">Policy Period</label>
          <input className="field" {...register("insurance_period", { required: true })} />
        </div>
        <div>
          <label className="label">Insurance Company Name</label>
          <input className="field" {...register("insurance_co_name", { required: true })} />
        </div>
        <div>
          <label className="label">Insurance Company Address</label>
          <input className="field" {...register("insurance_co_address", { required: true })} />
        </div>
      </FormSection>

      <FormSection title="Victim/Deceased Details" description="Deceased identity, address, occupation, and income fields used across the death case sections.">
        <div>
          <label className="label">Deceased Name</label>
          <input className="field" {...register("deceased_name", { required: true })} />
        </div>
        <div>
          <label className="label">Deceased Husband</label>
          <input className="field" {...register("deceased_husband", { required: true })} />
        </div>
        <div>
          <label className="label">Deceased Age</label>
          <input className="field" {...register("deceased_age", { required: true })} />
        </div>
        <div>
          <label className="label">Deceased Occupation</label>
          <input className="field" {...register("deceased_occupation", { required: true })} />
        </div>
        <div>
          <label className="label">Deceased Income</label>
          <input className="field" {...register("deceased_income", { required: true })} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Deceased Address</label>
          <input className="field" {...register("deceased_address", { required: true })} />
        </div>
      </FormSection>

      <FormSection title="Hospital Details" description="Hospital and doctor details used in Form I and related sections.">
        <div>
          <label className="label">Hospital Name</label>
          <input className="field" {...register("hospital_name", { required: true })} />
        </div>
        <div>
          <label className="label">Doctor Name</label>
          <input className="field" {...register("doctor_name", { required: true })} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Hospital Address</label>
          <input className="field" {...register("hospital_address", { required: true })} />
        </div>
      </FormSection>

      <FormSection title="Legal Representatives" description="Add the legal representatives that should be inserted into the fixed rows of the packet.">
        {fields.map((field, index) => (
          <div key={field.id} className="md:col-span-2 rounded-2xl border border-ink/10 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Legal Representative {index + 1}</p>
              <button type="button" className="text-sm text-rust" onClick={() => remove(index)}>
                Remove
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="label">Name</label>
                <input className="field" {...register(`legal_representatives.${index}.name` as const)} />
              </div>
              <div>
                <label className="label">Relation</label>
                <input className="field" {...register(`legal_representatives.${index}.relation` as const)} />
              </div>
              <div>
                <label className="label">Age</label>
                <input className="field" {...register(`legal_representatives.${index}.age` as const)} />
              </div>
              <div>
                <label className="label">Address</label>
                <input className="field" {...register(`legal_representatives.${index}.address` as const)} />
              </div>
            </div>
          </div>
        ))}
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() => append(legalRepresentativeTemplate)}
            disabled={fields.length >= 7}
            className="rounded-xl border border-ink/15 px-4 py-2 text-sm font-semibold text-ink disabled:opacity-50"
          >
            Add Legal Representative
          </button>
        </div>
      </FormSection>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {successMessage && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-rust px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isSubmitting ? "Generating..." : "Download DAR .docx"}
      </button>
    </form>
  );
}
