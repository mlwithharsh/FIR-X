import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { FormSection } from "../components/FormSection";
import { buildDownloadUrl, generateReport, previewReport, ReportFormValues } from "../lib/api";

type Props = {
  onPreview: (value: {
    previewText: string;
    legalDescription: string;
    conditionalSections: Record<string, boolean>;
  }) => void;
};

const defaultValues: ReportFormValues = {
  case_number: "",
  include_pdf: false,
  accident: {
    date: "2026-03-11",
    time: "13:00",
    location: "Sanjay Gandhi Transport Nagar, Delhi",
    type: "fatal",
    collision_description: "truck hit pedestrian",
    police_station: "Sanjay Gandhi Transport Nagar",
    district: "North West Delhi",
  },
  vehicle: {
    registration_number: "HR64A-6664",
    type: "Truck",
    owner_name: "Ramesh Chand",
    owner_address: "",
    insurance_company: "",
    policy_number: "",
  },
  driver: {
    name: "Babu Singh",
    father_name: "",
    phone: "",
    license_number: "",
    address: "",
  },
  victim: {
    name: "Prem Wati",
    age: 45,
    gender: "female",
    status: "deceased",
    occupation: "",
    income: undefined,
  },
  witness: {
    name: "",
    phone: "",
    address: "",
  },
};

export function ReportForm({ onPreview }: Props) {
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<ReportFormValues>({ defaultValues });

  const accidentType = watch("accident.type");
  const liveVictimStatus = watch("victim.status");
  const victimStatus = useMemo(() => {
    if (accidentType === "fatal") return "deceased";
    if (accidentType === "injury") return "injured";
    return liveVictimStatus;
  }, [accidentType, liveVictimStatus]);

  const normalize = (values: ReportFormValues): ReportFormValues => {
    const witness =
      values.witness && (values.witness.name || values.witness.phone || values.witness.address)
        ? values.witness
        : undefined;

    return {
      ...values,
      victim: {
        ...values.victim,
        status: victimStatus,
        age: values.victim.age ? Number(values.victim.age) : undefined,
        income: values.victim.income ? Number(values.victim.income) : undefined,
      },
      witness,
    };
  };

  const onPreviewSubmit = handleSubmit(async (values) => {
    try {
      setError("");
      const result = await previewReport(normalize(values));
      onPreview({
        previewText: result.preview_text,
        legalDescription: result.legal_description,
        conditionalSections: result.conditional_sections,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
    }
  });

  const onGenerateSubmit = handleSubmit(async (values) => {
    try {
      setError("");
      const result = await generateReport(normalize(values));
      setDownloadUrl(buildDownloadUrl(result.download_path));
      setGeneratedFiles(result.generated_files);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    }
  });

  return (
    <form className="space-y-6">
      <FormSection title="Case Control" description="Minimal operator-facing fields with repeated data reused across every report.">
        <div>
          <label className="label">Case Number</label>
          <input className="field" {...register("case_number")} placeholder="Optional FIR / DD entry" />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm">
            <input type="checkbox" {...register("include_pdf")} />
            Request PDF conversion when enabled in backend
          </label>
        </div>
      </FormSection>

      <FormSection title="Accident" description="Core occurrence details used to drive conditional legal sections.">
        <div>
          <label className="label">Date</label>
          <input type="date" className="field" {...register("accident.date", { required: true })} />
        </div>
        <div>
          <label className="label">Time</label>
          <input type="time" className="field" {...register("accident.time", { required: true })} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Location</label>
          <input className="field" {...register("accident.location", { required: true })} />
        </div>
        <div>
          <label className="label">Type</label>
          <select className="field" {...register("accident.type")}>
            <option value="fatal">Fatal</option>
            <option value="injury">Injury</option>
            <option value="property">Property</option>
          </select>
        </div>
        <div>
          <label className="label">Police Station</label>
          <input className="field" {...register("accident.police_station")} />
        </div>
        <div>
          <label className="label">District</label>
          <input className="field" {...register("accident.district")} />
        </div>
        <div>
          <label className="label">Collision Description</label>
          <input className="field" {...register("accident.collision_description")} placeholder="truck hit pedestrian" />
        </div>
      </FormSection>

      <FormSection title="Vehicle & Owner" description="Vehicle, owner, and insurer details auto-fill across FORM-I, FORM-IV, and DAR.">
        <div>
          <label className="label">Registration Number</label>
          <input className="field" {...register("vehicle.registration_number", { required: true })} />
        </div>
        <div>
          <label className="label">Vehicle Type</label>
          <input className="field" {...register("vehicle.type", { required: true })} />
        </div>
        <div>
          <label className="label">Owner Name</label>
          <input className="field" {...register("vehicle.owner_name", { required: true })} />
        </div>
        <div>
          <label className="label">Owner Address</label>
          <input className="field" {...register("vehicle.owner_address")} />
        </div>
        <div>
          <label className="label">Insurance Company</label>
          <input className="field" {...register("vehicle.insurance_company")} />
        </div>
        <div>
          <label className="label">Policy Number</label>
          <input className="field" {...register("vehicle.policy_number")} />
        </div>
      </FormSection>

      <FormSection title="Driver" description="Driver inputs are shared into FORM-III and the FIR summary.">
        <div>
          <label className="label">Driver Name</label>
          <input className="field" {...register("driver.name", { required: true })} />
        </div>
        <div>
          <label className="label">Father's Name</label>
          <input className="field" {...register("driver.father_name")} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="field" {...register("driver.phone")} />
        </div>
        <div>
          <label className="label">License Number</label>
          <input className="field" {...register("driver.license_number")} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Address</label>
          <input className="field" {...register("driver.address")} />
        </div>
      </FormSection>

      <FormSection title="Victim & Witness" description="Victim details drive death, medical, and minor-specific logic. Witness is optional.">
        <div>
          <label className="label">Victim Name</label>
          <input className="field" {...register("victim.name", { required: true })} />
        </div>
        <div>
          <label className="label">Victim Age</label>
          <input type="number" className="field" {...register("victim.age", { valueAsNumber: true })} />
        </div>
        <div>
          <label className="label">Gender</label>
          <select className="field" {...register("victim.gender")}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select
            className="field bg-ink/5"
            {...register("victim.status")}
            disabled={accidentType !== "property"}
            value={victimStatus}
          >
            <option value="injured">Injured</option>
            <option value="deceased">Deceased</option>
          </select>
        </div>
        <div>
          <label className="label">Occupation</label>
          <input className="field" {...register("victim.occupation")} />
        </div>
        <div>
          <label className="label">Income</label>
          <input type="number" className="field" {...register("victim.income", { valueAsNumber: true })} />
        </div>
        <div>
          <label className="label">Witness Name</label>
          <input className="field" {...register("witness.name")} />
        </div>
        <div>
          <label className="label">Witness Phone</label>
          <input className="field" {...register("witness.phone")} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Witness Address</label>
          <input className="field" {...register("witness.address")} />
        </div>
      </FormSection>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {downloadUrl && (
        <div className="panel p-4">
          <p className="text-sm font-semibold">Reports generated successfully.</p>
          <p className="mt-1 text-sm text-ink/70">{generatedFiles.join(", ")}</p>
          <a href={downloadUrl} className="mt-3 inline-flex rounded-xl bg-olive px-4 py-2 text-sm font-semibold text-white">
            Download ZIP
          </a>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onPreviewSubmit}
          disabled={isSubmitting}
          className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          Preview Draft
        </button>
        <button
          type="button"
          onClick={onGenerateSubmit}
          disabled={isSubmitting}
          className="rounded-xl bg-rust px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          Generate .docx Bundle
        </button>
      </div>
    </form>
  );
}
