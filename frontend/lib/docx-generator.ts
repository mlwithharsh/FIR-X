import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { ReportFormValues } from "./api";

// Template-based document generator using client-side docx library
export class DocxGenerator {
  private static buildReplacements(data: ReportFormValues): Record<string, string> {
    const caseDetails = data.case_details;
    const firDate = new Date(caseDetails.fir_date);
    const accidentDate = new Date(data.accident.date);
    
    return {
      "212/2026": caseDetails.fir_number,
      "11/03/2026": firDate.toLocaleDateString('en-GB'),
      "11/03/26": firDate.toLocaleDateString('en-GB', { year: '2-digit' }),
      "281/106(1) BNS, 2023": caseDetails.sections.includes("2023") ? caseDetails.sections : `${caseDetails.sections}, 2023`,
      "281/106(1) BNS": caseDetails.sections,
      "SP Badli Delhi.": `${caseDetails.police_station}.`,
      "SP Badli_Distt Outer North Delhi.": `${caseDetails.police_station}_Distt ${caseDetails.district || 'Outer North Delhi'}.`,
      "SP Badli, Delhi": caseDetails.police_station,
      "Distt Outer North Delhi.": `Distt ${caseDetails.district || 'Outer North Delhi'}.`,
      "ASI Satyaveer No.6268-D": caseDetails.investigating_officer,
      "MACT-OND, Delhi.": caseDetails.district || "MACT-OND, Delhi.",
      "MACT- OND Delhi.": caseDetails.district || "MACT- OND Delhi.",
      "Case FIR No.212/2026 dt.11/03/2026 u/s 281/106(1) BNS PS SP Badli, Delhi.": 
        `Case FIR No.${caseDetails.fir_number} dt.${firDate.toLocaleDateString('en-GB')} u/s ${caseDetails.sections} PS ${caseDetails.police_station}.`,
      "Deceased of the case- Mrs. Prem Wati W/o Bakshi Singh R/o J-491, Bhagwan Pura Samaypur Libaspur Delhi. Age-84 Yrs":
        `${data.victim.status === 'deceased' ? 'Deceased' : 'Injured'} of the case- ${data.victim.name}${data.victim.address ? ` R/o ${data.victim.address}` : ''}${data.victim.age ? `. Age-${data.victim.age}` : ''}`,
      "Offending vehicle registered owner- Ramesh Chand S/o Bidhi Chand R/o HNo.233, Ward No.3 Khera Sita Ram Kalka Panchkula Haryana. Mb No. 9816043050.":
        `Offending vehicle registered owner- ${data.vehicle.owner_name}${data.vehicle.owner_address ? ` R/o ${data.vehicle.owner_address}` : ''}${data.vehicle.owner_phone ? `. Mb No. ${data.vehicle.owner_phone}` : ''}.`,
      "Accused driver- Babu Singh S/o Kundan Singh R/o Village Dabadi Ki Ser Chanyana Bakyori (257), Sirmor HP-173024. Age-50 Yrs Mb No. 9805392670":
        `Accused driver- ${data.driver.name}${data.driver.address ? ` R/o ${data.driver.address}` : ''}${data.driver.age ? `. Age-${data.driver.age}` : ''}${data.driver.phone ? ` Mb No. ${data.driver.phone}` : ''}`,
      "Offending vehicle insured- Chola MS General Insurance Co Ltd Delhi.":
        `Offending vehicle insured- ${data.insurance.company_name || 'Not supplied'}.`,
      "At about 13:00 hrs": `At about ${data.accident.time} hrs`,
      "Infront of Tirpal Ghar Shop No CW-544, Cut of Sanjay Gandhi Transport Nagar Delhi.": data.accident.location,
      "Driver/Owner Victim Witness Hospital Good Samaritan Police Others (Specify)": this.getSourceLabel(data.accident.source_of_information, data.accident.other_source || ""),
      "Ct Kuldeep No.2219/NW": data.informant.name || "",
      "BJRM Hospital Jahangirpuri Delhi.": data.informant.address || data.hospital.address || "",
      "Injury Fatal Damage / loss of the property Any other loss/injury": this.getNatureLabel(data.accident.type),
      "One vehicle": data.accident.number_of_vehicles === 1 ? "One vehicle" : `${data.accident.number_of_vehicles} vehicles`,
      "Yes No": data.accident.cctv_available ? "Yes No" : "Yes No",
      "One": this.getCountLabel(data.accident.fatalities_count),
      "N/A": data.accident.type === "injury" ? this.getCountLabel(data.accident.injured_count) : "N/A",
      "BJRM Hospital": data.hospital.name || "",
      "Jahangirpuri Delhi.": data.hospital.address || "",
      "Dr. Manish Kumar MO": data.hospital.doctor_name || "",
      "HR64A- 6664": data.vehicle.registration_number,
      "HR64A-6664": data.vehicle.registration_number,
      "Babu Singh S/o Kundan Singh": data.driver.name,
      "Village Dabadi Ki Ser Chanyana Bakyori (257), Sirmor HP-173024. Age-50 Yrs": 
        `${data.driver.address || ''}${data.driver.age ? `. Age-${data.driver.age}` : ''}`,
      "9805392670": data.driver.phone || "",
      "Ramesh Chand S/o Bidhi Chand": data.vehicle.owner_name,
      "HNo.233, Ward No.3 Khera Sita Ram Kalka Panchkula Haryana.": data.vehicle.owner_address || "",
      "9816043050.": data.vehicle.owner_phone ? `${data.vehicle.owner_phone}.` : "",
      "3379/04146458/000/01": data.insurance.policy_number || "",
      "30/11/25 to 29/11/26": data.insurance.policy_period || "",
      "Chola MS General Insurance Co Ltd Delhi.": data.insurance.company_name ? `${data.insurance.company_name}.` : "",
      "Delhi.": data.insurance.company_address ? `${data.insurance.company_address}.` : "",
      "Mrs. Prem Wati W/o Bakshi Singh": data.victim.name,
      "J-491, Bhagwan Pura Samaypur Libaspur Delhi. Age-84 Yrs": 
        `${data.victim.address || ''}${data.victim.age ? ` Age-${data.victim.age}` : ''}`,
      "84 Yrs": data.victim.age || "",
      "Desi Vadi": data.victim.occupation || "",
      "Male Female Other": this.getGenderLabel(data.driver.gender),
      "12,000/- PM": data.driver.monthly_income || "",
      "Permanent Learner's Juvenile Without License Others(Specify)": this.getLicenseLabel(data.driver.license_type),
      "HP16A 20230000160": data.driver.license_number || "",
      "10/05/23 to 09/05/33": data.driver.license_validity || "",
      "Pachhad (HP16A)": data.driver.licensing_authority || "",
      "Plaintiff Name :________ Mukesh_______________________": `Plaintiff Name :________ ${caseDetails.plaintiff_name || ''}_______________________`,
      "Plaintiff Age :____________40 Years __________Male/Female": `Plaintiff Age :____________${caseDetails.plaintiff_age || ''} __________${this.getGenderWord(caseDetails.plaintiff_gender)}`,
      "Plaintiff Mobile No :_________ 9136804031_________________": `Plaintiff Mobile No :_________ ${caseDetails.plaintiff_mobile || ''}_________________`,
      "Defendant Name :__________Babu Singh _____________": `Defendant Name :__________${caseDetails.defendant_name || ''} _____________`,
      "Defendant Age :____________50 Yrs___________Male/Female": `Defendant Age :____________${caseDetails.defendant_age || ''}___________${this.getGenderWord(caseDetails.defendant_gender)}`,
      "Defendant Mobile No :________ 9805392670_________________": `Defendant Mobile No :________ ${caseDetails.defendant_mobile || ''}_________________`,
      "Case FIR No & date :________212/2026_ dt.11/03/26___________": 
        `Case FIR No & date :________${caseDetails.fir_number}_ dt.${firDate.toLocaleDateString('en-GB', { year: '2-digit' })}___________`,
      "Police Station :________SP Badli, Delhi_____________________": `Police Station :________${caseDetails.police_station}_____________________`,
      "U/S :_______281/106(1) BNS______________": `U/S :_______${caseDetails.sections}______________`,
      "Name of I.O. :_______ASI Satyaveer No.6268-D_________": `Name of I.O. :_______${caseDetails.investigating_officer}_________`,
      "Mobile No. I.O. :_________ ______________________": `Mobile No. I.O. :_________ ${caseDetails.investigating_officer_phone || ''}______________________`,
      "IN Case FIR No._212/2026_Date-11/03/2026 U/s-281/106(1) BNS PS SP Badli_Distt Outer North Delhi.":
        `IN Case FIR No._${caseDetails.fir_number}_Date-${firDate.toLocaleDateString('en-GB')} U/s-${caseDetails.sections} PS ${caseDetails.police_station}_Distt ${caseDetails.district || 'Outer North Delhi'}.`,
    };
  }

  private static getSourceLabel(source: string, otherSource: string): string {
    const labels = {
      driver_owner: "Driver/Owner",
      victim: "Victim", 
      witness: "Witness",
      hospital: "Hospital",
      good_samaritan: "Good Samaritan",
      police: "Police",
      other: `Others (${otherSource || 'Specify'})`,
    };
    return Object.values(labels).join(" ");
  }

  private static getNatureLabel(type: string): string {
    return type === "injury" ? "Injury Fatal Damage / loss of the property Any other loss/injury" : "Injury Fatal Damage / loss of the property Any other loss/injury";
  }

  private static getCountLabel(count: number): string {
    const names = {0: "N/A", 1: "One", 2: "Two", 3: "Three"};
    return names[count as keyof typeof names] || count.toString();
  }

  private static getGenderLabel(gender?: string): string {
    return "Male Female Other";
  }

  private static getGenderWord(gender?: string): string {
    if (gender === "male") return "Male";
    if (gender === "female") return "Female";
    if (gender === "other") return "Other";
    return "Male/Female";
  }

  private static getLicenseLabel(licenseType?: string): string {
    return "Permanent Learner's Juvenile Without License Others(Specify)";
  }

  static async generateDocument(data: ReportFormValues): Promise<Blob> {
    // Create a basic document structure
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `DAR Form - ${data.case_details.fir_number}`,
                bold: true,
                size: 32
              })
            ],
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Case FIR No.${data.case_details.fir_number} dt.${new Date(data.case_details.fir_date).toLocaleDateString('en-GB')} u/s ${data.case_details.sections} PS ${data.case_details.police_station}.`,
                break: 1
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Victim: ${data.victim.name}${data.victim.address ? ` R/o ${data.victim.address}` : ''}${data.victim.age ? `. Age-${data.victim.age}` : ''}`,
                break: 2
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Driver: ${data.driver.name}${data.driver.address ? ` R/o ${data.driver.address}` : ''}${data.driver.age ? `. Age-${data.driver.age}` : ''}`,
                break: 2
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Vehicle: ${data.vehicle.registration_number} - ${data.vehicle.type}`,
                break: 2
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Accident Details: ${data.accident.location} on ${new Date(data.accident.date).toLocaleDateString('en-GB')} at ${data.accident.time}`,
                break: 2
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Insurance: ${data.insurance.company_name || 'Not supplied'}`,
                break: 2
              })
            ]
          }),
        ]
      }]
    });

    // Generate the document as a blob
    return await Packer.toBlob(doc);
  }

  static downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
