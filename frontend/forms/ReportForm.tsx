import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

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
  case_details: {
    fir_number: "212/2026",
    fir_date: "2026-03-11",
    sections: "281/106(1) BNS",
    police_station: "SP Badli, Delhi",
    district: "Outer North Delhi",
    investigating_officer: "ASI Satyaveer No.6268-D",
    investigating_officer_phone: "",
    plaintiff_name: "Mukesh",
    plaintiff_age: "43 Years",
    plaintiff_gender: "male",
    plaintiff_mobile: "9136804031",
    defendant_name: "Babu Singh",
    defendant_age: "50 Yrs",
    defendant_gender: "male",
    defendant_mobile: "9805392670",
  },
  accident: {
    date: "2026-03-11",
    time: "13:00",
    location: "Infront of Tirpal Ghar Shop No CW-544, Cut of Sanjay Gandhi Transport Nagar Delhi.",
    type: "fatal",
    collision_description: "truck hit pedestrian",
    source_of_information: "hospital",
    other_source: "",
    number_of_vehicles: 1,
    offending_vehicle_known: true,
    offending_vehicle_impounded: true,
    driver_found_on_spot: true,
    fatalities_count: 1,
    injured_count: 0,
    cctv_available: false,
  },
  informant: {
    name: "Ct Kuldeep No.2219/NW",
    mobile: "",
    address: "BJRM Hospital Jahangirpuri Delhi.",
  },
  hospital: {
    name: "BJRM Hospital",
    address: "Jahangirpuri Delhi.",
    doctor_name: "Dr. Manish Kumar MO",
  },
  vehicle: {
    registration_number: "HR64A-6664",
    type: "Truck",
    owner_name: "Ramesh Chand S/o Bidhi Chand",
    owner_address: "HNo.233, Ward No.3 Khera Sita Ram Kalka Panchkula Haryana.",
    owner_phone: "9816043050",
  },
  driver: {
    name: "Babu Singh S/o Kundan Singh",
    phone: "9805392670",
    license_number: "HP16A 20230000160",
    address: "Village Dabadi Ki Ser Chanyana Bakyori (257), Sirmor HP-173024.",
    age: "50 Yrs",
    gender: "male",
    occupation: "Private Service",
    monthly_income: "12,000/- PM",
    license_type: "permanent",
    license_validity: "10/05/23 to 09/05/33",
    licensing_authority: "Pachhad (HP16A)",
  },
  insurance: {
    company_name: "Chola MS General Insurance Co Ltd Delhi",
    company_address: "Delhi",
    policy_number: "3379/04146458/000/01",
    policy_period: "30/11/25 to 29/11/26",
  },
  victim: {
    name: "Mrs. Prem Wati W/o Bakshi Singh",
    address: "J-491, Bhagwan Pura Samaypur Libaspur Delhi.",
    age: "84 Yrs",
    gender: "female",
    status: "deceased",
    occupation: "Desi Vadi",
    category: "pedestrian",
  },
  legal_representatives: [
    { name: "Mukesh S/o Lt. Bakshi Singh", relation: "Son", age: "43 Yrs", address: "J-491, Bhagwan Pura Samaypur Libaspur Delhi." },
    { name: "Bhagat Singh S/o Lt. Bakshi Singh", relation: "Son", age: "65 Yrs", address: "J-491, Bhagwan Pura Samaypur Libaspur Delhi." },
    { name: "Tilak Kaur D/o Lt. Bakshi Singh", relation: "Daughter", age: "47 Yrs", address: "J-491, Bhagwan Pura Samaypur Libaspur Delhi." },
  ],
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
    control,
  } = useForm<ReportFormValues>({ defaultValues });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "legal_representatives",
  });

  const accidentType = watch("accident.type");
  const liveVictimStatus = watch("victim.status");
  const victimStatus = useMemo(() => {
    if (accidentType === "fatal") return "deceased";
    if (accidentType === "injury") return "injured";
    return liveVictimStatus;
  }, [accidentType, liveVictimStatus]);

  const normalize = (values: ReportFormValues): ReportFormValues => {
    return {
      ...values,
      case_details: {
        ...values.case_details,
        plaintiff_name: values.case_details.plaintiff_name || values.legal_representatives[0]?.name || values.victim.name,
        plaintiff_age: values.case_details.plaintiff_age || values.legal_representatives[0]?.age || values.victim.age,
        defendant_name: values.case_details.defendant_name || values.driver.name,
        defendant_age: values.case_details.defendant_age || values.driver.age,
        defendant_mobile: values.case_details.defendant_mobile || values.driver.phone,
      },
      victim: {
        ...values.victim,
        status: victimStatus,
      },
      legal_representatives: values.legal_representatives.filter((item) => item.name.trim()),
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
          <label className="label">FIR Number</label>
          <input className="field" {...register("case_details.fir_number", { required: true })} />
        </div>
        <div>
          <label className="label">FIR Date</label>
          <input type="date" className="field" {...register("case_details.fir_date", { required: true })} />
        </div>
        <div>
          <label className="label">Sections</label>
          <input className="field" {...register("case_details.sections", { required: true })} />
        </div>
        <div>
          <label className="label">Police Station</label>
          <input className="field" {...register("case_details.police_station", { required: true })} />
        </div>
        <div>
          <label className="label">District</label>
          <input className="field" {...register("case_details.district")} />
        </div>
        <div>
          <label className="label">Investigating Officer</label>
          <input className="field" {...register("case_details.investigating_officer", { required: true })} />
        </div>
        <div>
          <label className="label">IO Mobile</label>
          <input className="field" {...register("case_details.investigating_officer_phone")} />
        </div>
      </FormSection>

      <FormSection title="Accident" description="Core occurrence details used to drive the FAR, DAR, hospital, and informant rows.">
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
          </select>
        </div>
        <div>
          <label className="label">Source Of Information</label>
          <select className="field" {...register("accident.source_of_information")}>
            <option value="driver_owner">Driver / Owner</option>
            <option value="victim">Victim</option>
            <option value="witness">Witness</option>
            <option value="hospital">Hospital</option>
            <option value="good_samaritan">Good Samaritan</option>
            <option value="police">Police</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">Other Source</label>
          <input className="field" {...register("accident.other_source")} />
        </div>
        <div>
          <label className="label">Collision Description</label>
          <input className="field" {...register("accident.collision_description")} placeholder="truck hit pedestrian" />
        </div>
        <div>
          <label className="label">Vehicles Involved</label>
          <input type="number" className="field" {...register("accident.number_of_vehicles", { valueAsNumber: true })} />
        </div>
        <div>
          <label className="label">Fatalities</label>
          <input type="number" className="field" {...register("accident.fatalities_count", { valueAsNumber: true })} />
        </div>
        <div>
          <label className="label">Injured Count</label>
          <input type="number" className="field" {...register("accident.injured_count", { valueAsNumber: true })} />
        </div>
        <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm">
            <input type="checkbox" {...register("accident.offending_vehicle_known")} />
            Offending vehicle known
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm">
            <input type="checkbox" {...register("accident.offending_vehicle_impounded")} />
            Vehicle impounded
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm">
            <input type="checkbox" {...register("accident.driver_found_on_spot")} />
            Driver found on spot
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm">
            <input type="checkbox" {...register("accident.cctv_available")} />
            CCTV available
          </label>
        </div>
      </FormSection>

      <FormSection title="Informant & Hospital" description="This covers the currently missing columns such as hospital name, doctor name, and informant details.">
        <div>
          <label className="label">Informant Name</label>
          <input className="field" {...register("informant.name")} />
        </div>
        <div>
          <label className="label">Informant Mobile</label>
          <input className="field" {...register("informant.mobile")} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Informant Address</label>
          <input className="field" {...register("informant.address")} />
        </div>
        <div>
          <label className="label">Hospital Name</label>
          <input className="field" {...register("hospital.name")} />
        </div>
        <div>
          <label className="label">Doctor Name</label>
          <input className="field" {...register("hospital.doctor_name")} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Hospital Address</label>
          <input className="field" {...register("hospital.address")} />
        </div>
      </FormSection>

      <FormSection title="Vehicle, Owner & Insurance" description="Driver and owner stay independent so the generator does not assume the driver is also the owner.">
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
          <label className="label">Owner Mobile</label>
          <input className="field" {...register("vehicle.owner_phone")} />
        </div>
        <div>
          <label className="label">Insurance Company</label>
          <input className="field" {...register("insurance.company_name")} />
        </div>
        <div>
          <label className="label">Insurance Address</label>
          <input className="field" {...register("insurance.company_address")} />
        </div>
        <div>
          <label className="label">Policy Number</label>
          <input className="field" {...register("insurance.policy_number")} />
        </div>
        <div>
          <label className="label">Policy Period</label>
          <input className="field" {...register("insurance.policy_period")} placeholder="30/11/25 to 29/11/26" />
        </div>
      </FormSection>

      <FormSection title="Driver" description="Driver-specific DAR inputs including license details and non-owner handling.">
        <div>
          <label className="label">Driver Name</label>
          <input className="field" {...register("driver.name", { required: true })} />
        </div>
        <div>
          <label className="label">Driver Mobile</label>
          <input className="field" {...register("driver.phone")} />
        </div>
        <div>
          <label className="label">Age</label>
          <input className="field" {...register("driver.age")} />
        </div>
        <div>
          <label className="label">Gender</label>
          <select className="field" {...register("driver.gender")}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="label">Address</label>
          <input className="field" {...register("driver.address")} />
        </div>
        <div>
          <label className="label">Occupation</label>
          <input className="field" {...register("driver.occupation")} />
        </div>
        <div>
          <label className="label">Monthly Income</label>
          <input className="field" {...register("driver.monthly_income")} />
        </div>
        <div>
          <label className="label">License Type</label>
          <select className="field" {...register("driver.license_type")}>
            <option value="permanent">Permanent</option>
            <option value="learner">Learner</option>
            <option value="juvenile">Juvenile</option>
            <option value="without_license">Without License</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">License Number</label>
          <input className="field" {...register("driver.license_number")} />
        </div>
        <div>
          <label className="label">License Validity</label>
          <input className="field" {...register("driver.license_validity")} />
        </div>
        <div>
          <label className="label">Licensing Authority</label>
          <input className="field" {...register("driver.licensing_authority")} />
        </div>
      </FormSection>

      <FormSection title="Victim & L/R" description="Victim details and legal representatives (L/R) feed the DAR memo section and the table rows.">
        <div>
          <label className="label">Victim Name</label>
          <input className="field" {...register("victim.name", { required: true })} />
        </div>
        <div>
          <label className="label">Victim Age</label>
          <input className="field" {...register("victim.age")} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Victim Address</label>
          <input className="field" {...register("victim.address")} />
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
            disabled
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
          <label className="label">Victim Category</label>
          <select className="field" {...register("victim.category")}>
            <option value="pedestrian">Pedestrian / Bystander</option>
            <option value="cyclist">Cyclist</option>
            <option value="two_wheeler">Two Wheeler</option>
            <option value="other_vehicle">In Other Vehicle</option>
            <option value="other">Other</option>
          </select>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="md:col-span-2 rounded-2xl border border-ink/10 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">L/R {index + 1}</p>
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
                <input className="field" {...register(`legal_representatives.${index}.relation` as const)} placeholder="Son / Daughter / Wife / Husband" />
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
            onClick={() => append({ name: "", relation: "", age: "", address: "" })}
            disabled={fields.length >= 7}
            className="rounded-xl border border-ink/15 px-4 py-2 text-sm font-semibold text-ink disabled:opacity-50"
          >
            Add L/R
          </button>
        </div>
      </FormSection>

      <FormSection title="Cause Title" description="Optional party details for the final court cover page. Defaults fall back to first L/R and driver.">
        <div>
          <label className="label">Plaintiff Name</label>
          <input className="field" {...register("case_details.plaintiff_name")} />
        </div>
        <div>
          <label className="label">Plaintiff Age</label>
          <input className="field" {...register("case_details.plaintiff_age")} />
        </div>
        <div>
          <label className="label">Plaintiff Gender</label>
          <select className="field" {...register("case_details.plaintiff_gender")}>
            <option value="">Auto</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">Plaintiff Mobile</label>
          <input className="field" {...register("case_details.plaintiff_mobile")} />
        </div>
        <div>
          <label className="label">Defendant Name</label>
          <input className="field" {...register("case_details.defendant_name")} />
        </div>
        <div>
          <label className="label">Defendant Age</label>
          <input className="field" {...register("case_details.defendant_age")} />
        </div>
        <div>
          <label className="label">Defendant Gender</label>
          <select className="field" {...register("case_details.defendant_gender")}>
            <option value="">Auto</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">Defendant Mobile</label>
          <input className="field" {...register("case_details.defendant_mobile")} />
        </div>
      </FormSection>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {downloadUrl && (
        <div className="panel p-4">
          <p className="text-sm font-semibold">DAR generated successfully.</p>
          <p className="mt-1 text-sm text-ink/70">{generatedFiles.join(", ")}</p>
          <a href={downloadUrl} className="mt-3 inline-flex rounded-xl bg-olive px-4 py-2 text-sm font-semibold text-white">
            Download .docx
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
          Generate DAR .docx
        </button>
      </div>
    </form>
  );
}
