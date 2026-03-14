import prisma from "../prismaClient";
import PDFDocument from "pdfkit";
import { SchoolService } from "./schoolService";

export type ExportFilters = {
  schoolId: number;
  academicYear?: string;
  class?: number;
  section?: string;
  domain?: "all" | "bmi" | "dental" | "vision" | "immunization";
};

export type ExportRow = {
  name: string;
  registrationNo: string;
  class: number;
  section: string;
  gender: string;
  academicYear: string;
  checkupDate: string | null;
  height: number | null;
  weight: number | null;
  bmi: number | null;
  bmiCategory: string | null;
  dentalOverallHealth: string | null;
  dentalReferralNeeded: boolean | null;
  visionOverall: string | null;
  visionReferralNeeded: boolean | null;
  immunization: boolean | null;
  mentalWellness: boolean | null;
  nutrition: boolean | null;
  menstrualHygiene: boolean | null;
};

function escapeCsv(val: string | number | boolean | null | undefined): string {
  if (val == null || val === "") return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export class ExportService {
  static async getExportData(
    userId: number,
    filters: ExportFilters
  ): Promise<{ rows: ExportRow[]; schoolName: string }> {
    const school = await SchoolService.getSchoolByUserId(userId);
    if (!school) throw new Error("School not found");
    if (school.id !== filters.schoolId) throw new Error("Access denied");

    const where: any = { schoolId: filters.schoolId };
    if (filters.class != null) where.class = filters.class;
    if (filters.section) where.section = filters.section;

    const children = await prisma.child.findMany({
      where,
      include: {
        healthRecords: {
          where: filters.academicYear
            ? { academicYear: filters.academicYear }
            : undefined,
          orderBy: { academicYear: "desc" },
        },
      },
    });

    const rows: ExportRow[] = [];

    for (const child of children) {
      const records = child.healthRecords as any[];
      if (records.length === 0) {
        rows.push({
          name: child.name,
          registrationNo: child.registrationNo,
          class: child.class,
          section: child.section,
          gender: child.gender,
          academicYear: filters.academicYear || "",
          checkupDate: null,
          height: null,
          weight: null,
          bmi: null,
          bmiCategory: null,
          dentalOverallHealth: null,
          dentalReferralNeeded: null,
          visionOverall: null,
          visionReferralNeeded: null,
          immunization: null,
          mentalWellness: null,
          nutrition: null,
          menstrualHygiene: null,
        });
      }
      for (const rec of records) {
        if (filters.domain && filters.domain !== "all") {
          if (filters.domain === "bmi" && rec.height == null && rec.weight == null) continue;
          if (filters.domain === "dental" && !rec.dentalOverallHealth) continue;
          if (filters.domain === "vision" && !rec.visionOverall) continue;
          if (filters.domain === "immunization" && rec.immunization == null) continue;
        }
        rows.push({
          name: child.name,
          registrationNo: child.registrationNo,
          class: child.class,
          section: child.section,
          gender: child.gender,
          academicYear: rec.academicYear,
          checkupDate: rec.checkupDate ? new Date(rec.checkupDate).toISOString().split("T")[0]! : null,
          height: rec.height,
          weight: rec.weight,
          bmi: rec.bmi,
          bmiCategory: rec.bmiCategory,
          dentalOverallHealth: rec.dentalOverallHealth,
          dentalReferralNeeded: rec.dentalReferralNeeded,
          visionOverall: rec.visionOverall,
          visionReferralNeeded: rec.visionReferralNeeded,
          immunization: rec.immunization,
          mentalWellness: rec.mentalWellness,
          nutrition: rec.nutrition,
          menstrualHygiene: rec.menstrualHygiene,
        });
      }
    }

    return { rows, schoolName: school.schoolName };
  }

  static generateCSV(rows: ExportRow[]): string {
    const headers = [
      "Name",
      "Registration No",
      "Class",
      "Section",
      "Gender",
      "Academic Year",
      "Checkup Date",
      "Height (cm)",
      "Weight (kg)",
      "BMI",
      "BMI Category",
      "Dental Health",
      "Dental Referral",
      "Vision",
      "Vision Referral",
      "Immunization",
      "Mental Wellness",
      "Nutrition",
      "Menstrual Hygiene",
    ];
    const lines = [headers.map(escapeCsv).join(",")];
    for (const r of rows) {
      lines.push(
        [
          r.name,
          r.registrationNo,
          r.class,
          r.section,
          r.gender,
          r.academicYear,
          r.checkupDate,
          r.height,
          r.weight,
          r.bmi,
          r.bmiCategory,
          r.dentalOverallHealth,
          r.dentalReferralNeeded,
          r.visionOverall,
          r.visionReferralNeeded,
          r.immunization,
          r.mentalWellness,
          r.nutrition,
          r.menstrualHygiene,
        ]
          .map(escapeCsv)
          .join(",")
      );
    }
    return lines.join("\n");
  }

  static async generatePDF(
    rows: ExportRow[],
    schoolName: string,
    academicYear?: string
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(16).text("WombTo18 Health Report", { align: "center" });
      doc.fontSize(11).text(schoolName, { align: "center" });
      if (academicYear) {
        doc.fontSize(10).text(`Academic Year: ${academicYear}`, { align: "center" });
      }
      doc.moveDown();

      const colWidths = [80, 70, 30, 25, 35, 45, 50, 35, 35, 30, 45, 45, 35, 40, 35, 40, 45, 45, 50];
      const headers = [
        "Name",
        "Reg No",
        "Cl",
        "Sec",
        "Gender",
        "Year",
        "Date",
        "Ht",
        "Wt",
        "BMI",
        "BMI Cat",
        "Dental",
        "D Ref",
        "Vision",
        "V Ref",
        "Immun",
        "Ment",
        "Nutr",
        "Hyg",
      ];
      doc.fontSize(8).font("Helvetica-Bold");
      let y = doc.y;
      headers.forEach((h, i) => {
        doc.text(h, 40 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
          width: colWidths[i],
          align: "left",
        });
      });
      doc.moveDown(0.5);
      doc.font("Helvetica");

      const pageHeight = doc.page.height - 80;
      for (const r of rows) {
        if (doc.y > pageHeight) {
          doc.addPage();
          doc.fontSize(8);
          y = 40;
          doc.text("(continued)", 40, y);
          doc.moveDown();
        }
        y = doc.y;
        const cells = [
          r.name?.slice(0, 12) || "",
          r.registrationNo?.slice(0, 10) || "",
          String(r.class),
          r.section,
          r.gender?.slice(0, 4) || "",
          r.academicYear?.slice(0, 9) || "",
          r.checkupDate || "",
          r.height != null ? String(r.height) : "",
          r.weight != null ? String(r.weight) : "",
          r.bmi != null ? String(r.bmi) : "",
          (r.bmiCategory || "").slice(0, 6),
          (r.dentalOverallHealth || "").slice(0, 8),
          r.dentalReferralNeeded ? "Y" : "",
          (r.visionOverall || "").slice(0, 6),
          r.visionReferralNeeded ? "Y" : "",
          r.immunization ? "Y" : "",
          r.mentalWellness ? "Y" : "",
          r.nutrition ? "Y" : "",
          r.menstrualHygiene ? "Y" : "",
        ];
        cells.forEach((c, i) => {
          doc.text(c, 40 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
            width: colWidths[i],
            align: "left",
          });
        });
        doc.moveDown(0.3);
      }

      doc.end();
    });
  }
}
