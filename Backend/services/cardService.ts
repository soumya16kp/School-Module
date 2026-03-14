import crypto from "crypto";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import prisma from "../prismaClient";

export class CardService {
  static async ensureCardToken(childId: number): Promise<string> {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { cardToken: true },
    });
    if (!child) throw new Error("Child not found");
    if (child.cardToken) return child.cardToken;

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.child.update({
      where: { id: childId },
      data: { cardToken: token },
    });
    return token;
  }

  static async getByCardToken(token: string) {
    const child = await prisma.child.findUnique({
      where: { cardToken: token },
      include: {
        school: { select: { schoolName: true, city: true, state: true, academicYear: true } },
        healthRecords: {
          orderBy: { checkupDate: "desc" },
          take: 1,
          select: {
            bmiCategory: true,
            checkupDate: true,
            immunization: true,
            dentalOverallHealth: true,
            visionOverall: true,
          },
        },
      },
    });
    if (!child) return null;

    const latest = child.healthRecords[0];
    return {
      id: child.id,
      name: child.name,
      registrationNo: child.registrationNo,
      class: child.class,
      section: child.section,
      gender: child.gender,
      bloodGroup: child.bloodGroup,
      allergicTo: child.allergicTo,
      fatherNumber: child.fatherNumber,
      motherNumber: child.motherNumber,
      mobile: child.mobile,
      school: child.school,
      bmiCategory: latest?.bmiCategory ?? null,
      lastCheckupDate: latest?.checkupDate ?? null,
      immunization: latest?.immunization ?? false,
      dentalStatus: latest?.dentalOverallHealth ?? null,
      visionStatus: latest?.visionOverall ?? null,
    };
  }

  static async generateBulkPdf(
    schoolId: number,
    baseUrl: string,
    filters?: { class?: number; section?: string }
  ): Promise<Buffer> {
    const where: any = { schoolId };
    if (filters?.class != null) where.class = filters.class;
    if (filters?.section) where.section = filters.section;

    const children = await prisma.child.findMany({
      where,
      include: {
        school: { select: { schoolName: true, city: true } },
        healthRecords: { orderBy: { checkupDate: "desc" }, take: 1, select: { bmiCategory: true, checkupDate: true, immunization: true, dentalOverallHealth: true, visionOverall: true } },
      },
    });

    if (children.length === 0) {
      throw new Error("No students found to generate ID cards");
    }

    const doc = new PDFDocument({ margin: 40, size: [420, 595] });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));

    const finished = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    const cardDataList: Array<{ token: string; data: any }> = [];
    for (const child of children) {
      const token = await CardService.ensureCardToken(child.id);
      const latest = (child as any).healthRecords?.[0];
      cardDataList.push({
        token,
        data: {
          name: child.name,
          registrationNo: child.registrationNo,
          class: child.class,
          section: child.section,
          school: child.school,
          bloodGroup: child.bloodGroup,
          allergicTo: child.allergicTo,
          mobile: child.mobile,
          fatherNumber: child.fatherNumber,
          motherNumber: child.motherNumber,
          bmiCategory: latest?.bmiCategory ?? null,
          lastCheckupDate: latest?.checkupDate ?? null,
          immunization: latest?.immunization ?? false,
          dentalStatus: latest?.dentalOverallHealth ?? null,
          visionStatus: latest?.visionOverall ?? null,
        },
      });
    }

    for (let i = 0; i < cardDataList.length; i++) {
      if (i > 0) doc.addPage({ size: [420, 595] });
      const { token, data } = cardDataList[i];
      const cardUrl = `${baseUrl}/card/${token}`;

      const qrBuffer = await QRCode.toBuffer(cardUrl, { width: 120, margin: 1 });

      doc.rect(20, 20, 380, 555).stroke("#e2e8f0");
      doc.rect(20, 20, 380, 45).fillAndStroke("#ec4899", "#ec4899");
      doc.fillColor("white").fontSize(14).text("WombTo18", 20, 28, { width: 380, align: "center" });
      doc.fontSize(10).text("Health ID Card", 20, 44, { width: 380, align: "center" });
      doc.fillColor("black");

      doc.ellipse(70, 115, 28, 28).fill("#fce7f3").stroke("#e2e8f0");
      doc.fillColor("#8b5cf6").fontSize(24).text((data.name?.charAt(0) || "?").toUpperCase(), 42, 98, { width: 56, align: "center" });
      doc.fillColor("black");

      doc.fontSize(14).font("Helvetica-Bold").text(data.name || "", 115, 85, { width: 260 });
      doc.fontSize(9).font("Helvetica").fillColor("#64748b").text(`${data.registrationNo} • Class ${data.class}-${data.section}`, 115, 102, { width: 260 });
      if (data.school?.schoolName) doc.fontSize(8).text(`${data.school.schoolName}${data.school.city ? `, ${data.school.city}` : ""}`, 115, 115, { width: 260 });
      doc.fillColor("black");

      let y = 155;
      if (data.bloodGroup) { doc.fontSize(8).text(`Blood: ${data.bloodGroup}`, 45, y); y += 14; }
      if (data.allergicTo) { doc.fontSize(8).text(`Allergies: ${data.allergicTo}`, 45, y); y += 14; }
      doc.fontSize(8).text(`Primary: ${data.mobile || ""}`, 45, y); y += 14;
      if (data.fatherNumber) { doc.fontSize(8).text(`Father: ${data.fatherNumber}`, 45, y); y += 14; }
      if (data.motherNumber) { doc.fontSize(8).text(`Mother: ${data.motherNumber}`, 45, y); y += 18; }

      const healthParts: string[] = [];
      if (data.bmiCategory) healthParts.push(`BMI: ${data.bmiCategory}`);
      if (data.immunization != null) healthParts.push(`Immun: ${data.immunization ? "Yes" : "No"}`);
      if (data.dentalStatus) healthParts.push(`Dental: ${data.dentalStatus}`);
      if (data.visionStatus) healthParts.push(`Vision: ${data.visionStatus}`);
      if (healthParts.length > 0) {
        doc.rect(20, y, 380, 28).fill("#f8fafc");
        doc.fontSize(8).fillColor("#64748b").text("Health: " + healthParts.join(" | "), 25, y + 8, { width: 370 });
        doc.fillColor("black");
        y += 40;
      } else y += 15;

      doc.image(qrBuffer, 140, y, { width: 120, height: 120 });
      doc.fontSize(8).fillColor("#94a3b8").text("Scan for full card", 140, y + 125, { width: 120, align: "center" });
    }

    doc.end();
    return finished;
  }
}
