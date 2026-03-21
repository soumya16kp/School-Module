import prisma from "../prismaClient";
import { sendSms, sendOtpSms } from "./smsService";
import { sendEmail, sendOtpEmail } from "./emailService";
import {
  sendOtpWhatsApp,
  sendAccessRequestWhatsApp,
  sendAccessApprovedWhatsApp,
  sendAccessDeniedWhatsApp,
  sendEventScheduledWhatsApp,
} from "./whatsappService";

// ─── Shared types ────────────────────────────────────────────────────────────

export type NotificationChannel = "sms" | "email" | "whatsapp";

export type NotificationEventType =
  | "SCHOOL_LOGIN_OTP"
  | "PARENT_LOGIN_OTP"
  | "ACCESS_REQUEST_SUBMITTED"
  | "ACCESS_APPROVED"
  | "ACCESS_DENIED"
  | "EVENT_SCHEDULED"
  | "STAFF_CHANGED"
  | "CHILD_CHANGED";

export type NotificationRecipient = {
  phone?: string;
  email?: string;
  label?: string;
};

export type DispatchNotificationInput = {
  eventType: NotificationEventType;
  recipients: NotificationRecipient[];
  channels?: NotificationChannel[];
  data: Record<string, any>;
  metadata?: Record<string, any>;
};

// ─── dispatchNotification ─────────────────────────────────────────────────────

function buildAccessSmsText(eventType: NotificationEventType, data: any) {
  const childName = String(data.childName || "student");
  const requesterName = data.requesterName ? String(data.requesterName) : "";
  const reason = data.reason ? String(data.reason) : "";
  if (eventType === "ACCESS_REQUEST_SUBMITTED") {
    const requesterPart = requesterName ? ` (Requester: ${requesterName})` : "";
    const reasonPart = reason ? ` Reason: ${reason}` : "";
    return `Emergency access request for ${childName}${requesterPart}.${reasonPart} Approve to share emergency details (valid 24h).`;
  }
  if (eventType === "ACCESS_APPROVED") return `Emergency access approved for ${childName}. Valid for 24 hours.`;
  if (eventType === "ACCESS_DENIED") return `Emergency access denied for ${childName}.`;
  return `Notification for ${childName}.`;
}

function buildAccessEmail(eventType: NotificationEventType, data: any) {
  const childName = String(data.childName || "student");
  const requesterName = data.requesterName ? String(data.requesterName) : "";
  const reason = data.reason ? String(data.reason) : "";
  let subject = "";
  let text = "";
  if (eventType === "ACCESS_REQUEST_SUBMITTED") {
    subject = "Emergency access request received";
    text = `An emergency access request has been submitted for ${childName}. ${requesterName ? `Requester: ${requesterName}. ` : ""}${reason ? `Reason: ${reason}. ` : ""}Please approve to share emergency details (valid 24h).`;
  } else if (eventType === "ACCESS_APPROVED") {
    subject = "Emergency access approved";
    text = `Emergency access has been approved for ${childName}. Valid for 24 hours.`;
  } else {
    subject = "Emergency access denied";
    text = `Emergency access has been denied for ${childName}.`;
  }
  const html = `<p style="font-family:sans-serif">${text.replace(/</g, "&lt;")}</p>`;
  return { subject, text, html };
}

function buildEventScheduledSmsText(data: any) {
  const eventTitle = String(data.eventTitle || "Event");
  const scheduledAtText = String(data.scheduledAtText || "");
  const where = data.schoolName ? ` at ${String(data.schoolName)}` : "";
  return scheduledAtText
    ? `Reminder: ${eventTitle} scheduled on ${scheduledAtText}${where}.`
    : `Reminder: ${eventTitle} scheduled${where}.`;
}

function buildEventScheduledEmail(data: any) {
  const eventTitle = String(data.eventTitle || "Event");
  const scheduledAtText = String(data.scheduledAtText || "");
  const schoolName = data.schoolName ? String(data.schoolName) : "";
  const subject = scheduledAtText ? `Upcoming: ${eventTitle} (${scheduledAtText})` : `Upcoming: ${eventTitle}`;
  const text = `Reminder: ${eventTitle}${scheduledAtText ? ` is scheduled on ${scheduledAtText}` : ""}${schoolName ? ` at ${schoolName}` : ""}.`;
  const html = `<p style="font-family:sans-serif">${text.replace(/</g, "&lt;")}</p>`;
  return { subject, text, html };
}

export async function dispatchNotification(input: DispatchNotificationInput) {
  const channels: NotificationChannel[] = input.channels ?? ["sms", "email", "whatsapp"];
  const results: Array<{ channel: NotificationChannel; recipient: string; ok: boolean; error?: string }> = [];

  for (const recipient of input.recipients) {
    const recipientId = recipient.label
      ? `${recipient.label}${recipient.phone ? `:${recipient.phone}` : recipient.email ? `:${recipient.email}` : ""}`
      : recipient.phone || recipient.email || "unknown";

    const promises: Array<Promise<void>> = [];

    for (const channel of channels) {
      if (channel === "sms" && !recipient.phone) continue;
      if (channel === "email" && !recipient.email) continue;
      if (channel === "whatsapp" && !recipient.phone) continue;

      promises.push(
        (async () => {
          try {
            if (input.eventType === "SCHOOL_LOGIN_OTP" || input.eventType === "PARENT_LOGIN_OTP") {
              const code = String(input.data.code);
              if (channel === "email" && recipient.email) {
                await sendOtpEmail(recipient.email, code);
              } else if (channel === "sms" && recipient.phone) {
                await sendOtpSms(recipient.phone, code);
              } else if (channel === "whatsapp" && recipient.phone) {
                await sendOtpWhatsApp(recipient.phone, code);
              }
              await prisma.notificationDispatchLog.create({
                data: { eventType: input.eventType, channel, recipient: (recipient.email || recipient.phone)!, status: "SENT", metadata: { ...input.metadata, code } },
              });
              return;
            }

            if (input.eventType === "ACCESS_REQUEST_SUBMITTED" || input.eventType === "ACCESS_APPROVED" || input.eventType === "ACCESS_DENIED") {
              const smsText = buildAccessSmsText(input.eventType, input.data);
              const emailPayload = buildAccessEmail(input.eventType, input.data);
              const childName = String(input.data.childName || "student");
              const requesterName = String(input.data.requesterName || "Requester");
              if (channel === "sms" && recipient.phone) {
                await sendSms(recipient.phone, smsText);
              } else if (channel === "email" && recipient.email) {
                await sendEmail(recipient.email, emailPayload.subject, emailPayload.text, emailPayload.html);
              } else if (channel === "whatsapp" && recipient.phone) {
                if (input.eventType === "ACCESS_REQUEST_SUBMITTED") await sendAccessRequestWhatsApp(recipient.phone, childName, requesterName);
                else if (input.eventType === "ACCESS_APPROVED") await sendAccessApprovedWhatsApp(recipient.phone, childName);
                else await sendAccessDeniedWhatsApp(recipient.phone, childName);
              }
              await prisma.notificationDispatchLog.create({
                data: { eventType: input.eventType, channel, recipient: (recipient.phone || recipient.email)!, status: "SENT", metadata: { ...input.metadata } },
              });
              return;
            }

            if (input.eventType === "EVENT_SCHEDULED") {
              const smsText = buildEventScheduledSmsText(input.data);
              const emailPayload = buildEventScheduledEmail(input.data);
              if (channel === "sms" && recipient.phone) {
                await sendSms(recipient.phone, smsText);
              } else if (channel === "email" && recipient.email) {
                await sendEmail(recipient.email, emailPayload.subject, emailPayload.text, emailPayload.html);
              } else if (channel === "whatsapp" && recipient.phone) {
                await sendEventScheduledWhatsApp(recipient.phone, String(input.data.eventTitle || "Event"), String(input.data.scheduledAtText || ""));
              }
              await prisma.notificationDispatchLog.create({
                data: { eventType: input.eventType, channel, recipient: (recipient.phone || recipient.email)!, status: "SENT", metadata: { ...input.metadata } },
              });
              return;
            }

            if (input.eventType === "STAFF_CHANGED") {
              const schoolName = input.data.schoolName ? String(input.data.schoolName) : "your school";
              const changeType = String(input.data.changeType || "updated");
              if (channel === "sms" && recipient.phone) {
                await sendSms(recipient.phone, `WombTo18: Your staff profile at ${schoolName} was ${changeType}.`);
              } else if (channel === "email" && recipient.email) {
                const text = `Your staff profile at ${schoolName} was ${changeType}.`;
                await sendEmail(recipient.email, `Your staff profile was ${changeType}`, text, `<p style="font-family:sans-serif">${text}</p>`);
              }
              await prisma.notificationDispatchLog.create({
                data: { eventType: input.eventType, channel, recipient: (recipient.phone || recipient.email)!, status: "SENT", metadata: { ...input.metadata } },
              });
              return;
            }

            if (input.eventType === "CHILD_CHANGED") {
              const childName = String(input.data.childName || "student");
              const changeType = String(input.data.changeType || "updated");
              const schoolName = input.data.schoolName ? String(input.data.schoolName) : "your school";
              if (channel === "sms" && recipient.phone) {
                await sendSms(recipient.phone, `WombTo18: ${childName} profile was ${changeType} at ${schoolName}.`);
              } else if (channel === "email" && recipient.email) {
                const text = `${childName} profile was ${changeType} at ${schoolName}.`;
                await sendEmail(recipient.email, `Update on ${childName}`, text, `<p style="font-family:sans-serif">${text}</p>`);
              }
              await prisma.notificationDispatchLog.create({
                data: { eventType: input.eventType, channel, recipient: (recipient.phone || recipient.email)!, status: "SENT", metadata: { ...input.metadata } },
              });
              return;
            }
          } catch (err: any) {
            try {
              await prisma.notificationDispatchLog.create({
                data: { eventType: input.eventType, channel, recipient: String(recipient.email || recipient.phone || recipientId), status: "FAILED", error: err?.message ?? String(err), metadata: { ...input.metadata } },
              });
            } catch (_) {}
            results.push({ channel, recipient: recipientId, ok: false, error: err?.message ?? String(err) });
            console.error("[dispatchNotification] failed", { eventType: input.eventType, channel, recipient: recipientId, error: err?.message ?? err });
          }
        })()
      );
    }

    await Promise.all(promises);
  }

  return { ok: true, results };
}

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
