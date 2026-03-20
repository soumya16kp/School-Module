import prisma from "../prismaClient";
import { sendSms } from "./smsService";
import { sendEmail } from "./emailService";

export class NotificationService {
  /**
   * Send notifications to parents and ambassadors when an event is scheduled.
   */
  static async notifyScheduledEvent(eventId: number) {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          school: true,
          ambassador: true,
        },
      });

      if (!event || !event.scheduledAt) return;

      const dateStr = new Date(event.scheduledAt).toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // 1. Notify Ambassador
      if (event.ambassador) {
        const ambassador = event.ambassador;
        const msg = `Invitation: You are invited to the "${event.title}" event at ${event.school.schoolName} on ${dateStr}. Please acknowledge and confirm your attendance.`;
        
        if (ambassador.phone) {
          await sendSms(ambassador.phone, msg);
        }
        if (ambassador.email) {
          await sendEmail(
            ambassador.email,
            `Invitation: ${event.title} at ${event.school.schoolName}`,
            `<div style="font-family:sans-serif;padding:20px;">
              <h2>Event Invitation</h2>
              <p>Dear ${ambassador.name},</p>
              <p>You are invited to lead/attend the <strong>${event.title}</strong> event at <strong>${event.school.schoolName}</strong>.</p>
              <p><strong>Scheduled Date:</strong> ${dateStr}</p>
              <p>Please log in to your dashboard to confirm or contact the school for coordination.</p>
            </div>`,
            msg
          );
        }
        
        // Log log
        await prisma.notificationDispatchLog.create({
          data: {
            eventType: "EVENT_INVITATION",
            channel: "SMS/EMAIL",
            recipient: ambassador.email || ambassador.phone || "unknown",
            status: "SENT",
            metadata: { eventId, ambassadorId: ambassador.id }
          }
        });
      }

      // 2. Notify Parents
      const children = await prisma.child.findMany({
        where: { schoolId: event.schoolId },
        select: { fatherNumber: true, motherNumber: true, emailId: true }
      });
 
       // Collect unique contact points
       const parentNumbers = new Set<string>();
       const parentEmails = new Set<string>();
       children.forEach((c: any) => {
         if (c.fatherNumber) parentNumbers.add(c.fatherNumber);
         if (c.motherNumber) parentNumbers.add(c.motherNumber);
         if (c.emailId) parentEmails.add(c.emailId);
       });
 
       const parentMsg = `Notification: "${event.title}" is scheduled at ${event.school.schoolName} on ${dateStr}. Please ensure your child is prepared for this activity.`;
       const emailHtml = `
         <div style="font-family: sans-serif; padding: 20px; color: #333;">
           <h2 style="color: #ec4899;">Event Announcement</h2>
           <p>Dear Parent,</p>
           <p>This is to inform you that the <strong>${event.title}</strong> event has been scheduled at <strong>${event.school.schoolName}</strong>.</p>
           <p><strong>Scheduled Date:</strong> ${dateStr}</p>
           <p>Please ensure your child is prepared and present for this activity.</p>
           <br/>
           <p style="font-size: 0.8rem; color: #666;">This is an automated notification from WombTo18.</p>
         </div>
       `;
 
       // Parallel send for SMS
       const smsTasks = Array.from(parentNumbers).map(async (phone) => {
         try {
           await sendSms(phone, parentMsg);
         } catch (e) {
           console.error(`Failed to send SMS to ${phone}:`, e);
         }
       });
 
       // Parallel send for Email
       const emailTasks = Array.from(parentEmails).map(async (email) => {
         try {
           await sendEmail(email, `New Event Scheduled: ${event.title}`, emailHtml, parentMsg);
         } catch (e) {
           console.error(`Failed to send Email to ${email}:`, e);
         }
       });
 
       await Promise.all([...smsTasks, ...emailTasks]);
 
       // Log dispatch
       await prisma.notificationDispatchLog.create({
           data: {
             eventType: "PARENT_ANNOUNCEMENT",
             channel: "SMS/EMAIL",
             recipient: `${parentNumbers.size} SMS, ${parentEmails.size} Emails`,
             status: "SENT",
             metadata: { eventId, schoolId: event.schoolId }
           }
         });

    } catch (error) {
      console.error("Error in notifyScheduledEvent:", error);
    }
  }
}
