import PDFDocument from "pdfkit";
import { Event, School, AmbassadorDirectory } from "@prisma/client";
import fs from "fs";
import path from "path";

export class InvoiceService {
  static async generateEventConfirmation(event: any, school: any, ambassador: any): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const fileName = `Invoice_Event_${event.id}_${Date.now()}.pdf`;
        const uploadDir = path.join(process.cwd(), 'uploads', 'invoices');
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const filePath = path.join(uploadDir, fileName);
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text("EVENT COMPLETION CONFIRMATION", { align: "center", underline: true });
        doc.moveDown(2);

        // Body
        doc.fontSize(12).font("Helvetica-Bold").text("Event Details:");
        doc.font("Helvetica").text(`Title: ${event.title}`);
        doc.text(`Type: ${event.type}`);
        doc.text(`Academic Year: ${event.academicYear}`);
        doc.text(`Scheduled Date: ${event.scheduledAt ? new Date(event.scheduledAt).toLocaleString() : 'N/A'}`);
        doc.text(`Completion Date: ${event.completedAt ? new Date(event.completedAt).toLocaleString() : new Date().toLocaleString()}`);
        doc.moveDown();

        doc.font("Helvetica-Bold").text("School Information:");
        doc.font("Helvetica").text(`School Name: ${school.schoolName}`);
        doc.text(`Address: ${school.address}, ${school.city}, ${school.state}`);
        doc.moveDown();

        doc.font("Helvetica-Bold").text("Ambassador Information:");
        doc.font("Helvetica").text(`Name: ${ambassador.name}`);
        doc.text(`Organization: ${ambassador.organization || 'N/A'}`);
        doc.text(`Contact: ${ambassador.phone || 'N/A'} / ${ambassador.email || 'N/A'}`);
        doc.moveDown(2);

        // Attendance stats if available
        if (event.attendanceJson) {
          const stats = event.attendanceJson as any;
          doc.font("Helvetica-Bold").text("Attendance Summary:");
          doc.font("Helvetica").text(`Total Present: ${stats.totalPresent || 0}`);
          doc.text(`Total Absent: ${stats.totalAbsent || 0}`);
          doc.moveDown();
        }

        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
        doc.fontSize(10).fillColor("grey").text("This is an automatically generated confirmation sent to the assigned ambassador services.", { align: "center" });

        doc.end();

        stream.on("finish", () => {
          console.log(`[InvoiceService] Generated invoice for Ambassador ${ambassador.name} at ${filePath}`);
          resolve(fileName);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  static async sendToAmbassador(event: any, fileName: string) {
    // In a real app, this would send an email with the PDF attached.
    // We simulate it here by logging.
    const ambassador = event.ambassador;
    if (!ambassador) return;

    console.log(`--------------------------------------------------`);
    console.log(`[SIMULATED EMAIL/SMS SENT]`);
    console.log(`To: ${ambassador.name} <${ambassador.email || ambassador.phone}>`);
    console.log(`Subject: Event Completion Confirmation - ${event.title}`);
    console.log(`Body: Hello ${ambassador.name}, your assigned event "${event.title}" has been successfully completed at ${event.school.schoolName}. Please find the invoice/confirmation attached: ${fileName}`);
    console.log(`--------------------------------------------------`);
  }
}
