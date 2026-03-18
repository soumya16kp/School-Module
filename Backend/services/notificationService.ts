import { sendEmail, sendOtpEmail } from "./emailService";
import { sendOtpSms, sendSms } from "./smsService";
import {
  sendAccessApprovedWhatsApp,
  sendAccessDeniedWhatsApp,
  sendAccessRequestWhatsApp,
  sendOtpWhatsApp,
  sendEventScheduledWhatsApp,
} from "./whatsappService";
import prisma from "../prismaClient";

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
  phone?: string; // Indian phone number (with/without +91)
  email?: string;
  label?: string; // e.g. "father", "mother", "requester"
};

export type DispatchNotificationInput = {
  eventType: NotificationEventType;
  recipients: NotificationRecipient[];
  channels?: NotificationChannel[];
  // event-specific data
  data: Record<string, any>;
  metadata?: Record<string, any>;
};

function uniqNonEmpty(arr: Array<string | undefined>) {
  return Array.from(new Set(arr.filter(Boolean))) as string[];
}

function buildAccessSmsText(eventType: NotificationEventType, data: any) {
  const childName = String(data.childName || "student");
  const requesterName = data.requesterName ? String(data.requesterName) : "";
  const reason = data.reason ? String(data.reason) : "";
  if (eventType === "ACCESS_REQUEST_SUBMITTED") {
    const requesterPart = requesterName ? ` (Requester: ${requesterName})` : "";
    const reasonPart = reason ? ` Reason: ${reason}` : "";
    return `Emergency access request for ${childName}${requesterPart}.${reasonPart} Approve to share emergency details (valid 24h).`;
  }
  if (eventType === "ACCESS_APPROVED") {
    return `Emergency access approved for ${childName}. Valid for 24 hours.`;
  }
  if (eventType === "ACCESS_DENIED") {
    return `Emergency access denied for ${childName}.`;
  }
  return `Notification for ${childName}.`;
}

function buildAccessEmail(eventType: NotificationEventType, data: any) {
  const childName = String(data.childName || "student");
  const requesterName = data.requesterName ? String(data.requesterName) : "";
  const reason = data.reason ? String(data.reason) : "";

  let subject = "";
  let text = "";
  let html = "";

  if (eventType === "ACCESS_REQUEST_SUBMITTED") {
    subject = "Emergency access request received";
    text = `An emergency access request has been submitted for ${childName}. ${
      requesterName ? `Requester: ${requesterName}. ` : ""
    }${reason ? `Reason: ${reason}. ` : ""}Please approve to share emergency details (valid 24h).`;
  } else if (eventType === "ACCESS_APPROVED") {
    subject = "Emergency access approved";
    text = `Emergency access has been approved for ${childName}. Valid for 24 hours.`;
  } else {
    subject = "Emergency access denied";
    text = `Emergency access has been denied for ${childName}.`;
  }

  html = `<p style="font-family:sans-serif">${text.replace(/</g, "&lt;")}</p>`;
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

  // Never throw from notifications; always return success so auth/access flows aren't broken.
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
                await prisma.notificationDispatchLog.create({
                  data: {
                    eventType: input.eventType,
                    channel,
                    recipient: recipient.email,
                    status: "SENT",
                    metadata: { ...input.metadata, code },
                  },
                });
              } else if (channel === "sms" && recipient.phone) {
                await sendOtpSms(recipient.phone, code);
                await prisma.notificationDispatchLog.create({
                  data: {
                    eventType: input.eventType,
                    channel,
                    recipient: recipient.phone,
                    status: "SENT",
                    metadata: { ...input.metadata, code },
                  },
                });
              } else if (channel === "whatsapp" && recipient.phone) {
                await sendOtpWhatsApp(recipient.phone, code);
                await prisma.notificationDispatchLog.create({
                  data: {
                    eventType: input.eventType,
                    channel,
                    recipient: recipient.phone,
                    status: "SENT",
                    metadata: { ...input.metadata, code },
                  },
                });
              }

              return;
            }

            if (input.eventType === "ACCESS_REQUEST_SUBMITTED") {
              const smsText = buildAccessSmsText(input.eventType, input.data);
              const emailPayload = buildAccessEmail(input.eventType, input.data);
              const childName = String(input.data.childName || "student");
              const requesterName = String(input.data.requesterName || "Requester");

              if (channel === "sms" && recipient.phone) {
                await sendSms(recipient.phone, smsText);
                await prisma.notificationDispatchLog.create({
                  data: {
                    eventType: input.eventType,
                    channel,
                    recipient: recipient.phone,
                    status: "SENT",
                    metadata: { ...input.metadata },
                  },
                });
              } else if (channel === "email" && recipient.email) {
                await sendEmail(recipient.email, emailPayload.subject, emailPayload.text, emailPayload.html);
                await prisma.notificationDispatchLog.create({
                  data: {
                    eventType: input.eventType,
                    channel,
                    recipient: recipient.email,
                    status: "SENT",
                    metadata: { ...input.metadata },
                  },
                });
              } else if (channel === "whatsapp" && recipient.phone) {
                await sendAccessRequestWhatsApp(recipient.phone, childName, requesterName);
                await prisma.notificationDispatchLog.create({
                  data: {
                    eventType: input.eventType,
                    channel,
                    recipient: recipient.phone,
                    status: "SENT",
                    metadata: { ...input.metadata },
                  },
                });
              }
              return;
            }

            if (input.eventType === "ACCESS_APPROVED" || input.eventType === "ACCESS_DENIED") {
              const smsText = buildAccessSmsText(input.eventType, input.data);
              const emailPayload = buildAccessEmail(input.eventType, input.data);
              const childName = String(input.data.childName || "student");

              if (channel === "sms" && recipient.phone) {
                await sendSms(recipient.phone, smsText);
                await prisma.notificationDispatchLog.create({
                  data: {
                    eventType: input.eventType,
                    channel,
                    recipient: recipient.phone,
                    status: "SENT",
                    metadata: { ...input.metadata },
                  },
                });
              } else if (channel === "email" && recipient.email) {
                await sendEmail(recipient.email, emailPayload.subject, emailPayload.text, emailPayload.html);
                await prisma.notificationDispatchLog.create({
                  data: {
                    eventType: input.eventType,
                    channel,
                    recipient: recipient.email,
                    status: "SENT",
                    metadata: { ...input.metadata },
                  },
                });
              } else if (channel === "whatsapp" && recipient.phone) {
                if (input.eventType === "ACCESS_APPROVED") {
                  await sendAccessApprovedWhatsApp(recipient.phone, childName);
                } else {
                  await sendAccessDeniedWhatsApp(recipient.phone, childName);
                }
                await prisma.notificationDispatchLog.create({
                  data: {
                    eventType: input.eventType,
                    channel,
                    recipient: recipient.phone,
                    status: "SENT",
                    metadata: { ...input.metadata },
                  },
                });
              }
              return;
            }

            if (input.eventType === "EVENT_SCHEDULED") {
              const smsText = buildEventScheduledSmsText(input.data);
              const emailPayload = buildEventScheduledEmail(input.data);
              const eventTitle = String(input.data.eventTitle || "Event");
              const scheduledAtText = String(input.data.scheduledAtText || "");

              if (channel === "sms" && recipient.phone) {
                await sendSms(recipient.phone, smsText);
                await prisma.notificationDispatchLog.create({
                  data: {
                    eventType: input.eventType,
                    channel,
                    recipient: recipient.phone,
                    status: "SENT",
                    metadata: { ...input.metadata },
                  },
                });
              } else if (channel === "email" && recipient.email) {
                await sendEmail(
                  recipient.email,
                  emailPayload.subject,
                  emailPayload.text,
                  emailPayload.html
                );
                await prisma.notificationDispatchLog.create({
                  data: {
                    eventType: input.eventType,
                    channel,
                    recipient: recipient.email,
                    status: "SENT",
                    metadata: { ...input.metadata },
                  },
                });
              } else if (channel === "whatsapp" && recipient.phone) {
                await sendEventScheduledWhatsApp(recipient.phone, eventTitle, scheduledAtText);
                await prisma.notificationDispatchLog.create({
                  data: {
                    eventType: input.eventType,
                    channel,
                    recipient: recipient.phone,
                    status: "SENT",
                    metadata: { ...input.metadata },
                  },
                });
              }
              return;
            }

            if (input.eventType === "STAFF_CHANGED") {
              const staffName = String(input.data.staffName || "staff");
              const changeType = String(input.data.changeType || "updated");
              const schoolName = input.data.schoolName ? String(input.data.schoolName) : "your school";

              if (channel === "sms" && recipient.phone) {
                const smsText = `WombTo18: Your staff profile at ${schoolName} was ${changeType}.`;
                await sendSms(recipient.phone, smsText);
                await prisma.notificationDispatchLog.create({
                  data: {
                    eventType: input.eventType,
                    channel,
                    recipient: recipient.phone,
                    status: "SENT",
                    metadata: { ...input.metadata },
                  },
                });
              } else if (channel === "email" && recipient.email) {
                const subject = `Your staff profile was ${changeType}`;
                const text = `Your staff profile at ${schoolName} was ${changeType}.`;
                const html = `<p style="font-family:sans-serif">${text}</p>`;
                await sendEmail(recipient.email, subject, text, html);
                await prisma.notificationDispatchLog.create({
                  data: {
                    eventType: input.eventType,
                    channel,
                    recipient: recipient.email,
                    status: "SENT",
                    metadata: { ...input.metadata },
                  },
                });
              }
              return;
            }

            if (input.eventType === "CHILD_CHANGED") {
              const childName = String(input.data.childName || "student");
              const changeType = String(input.data.changeType || "updated");
              const schoolName = input.data.schoolName ? String(input.data.schoolName) : "your school";

              if (channel === "sms" && recipient.phone) {
                const smsText = `WombTo18: ${childName} profile was ${changeType} at ${schoolName}.`;
                await sendSms(recipient.phone, smsText);
                await prisma.notificationDispatchLog.create({
                  data: {
                    eventType: input.eventType,
                    channel,
                    recipient: recipient.phone,
                    status: "SENT",
                    metadata: { ...input.metadata },
                  },
                });
              } else if (channel === "email" && recipient.email) {
                const subject = `Update on ${childName}`;
                const text = `${childName} profile was ${changeType} at ${schoolName}.`;
                const html = `<p style="font-family:sans-serif">${text}</p>`;
                await sendEmail(recipient.email, subject, text, html);
                await prisma.notificationDispatchLog.create({
                  data: {
                    eventType: input.eventType,
                    channel,
                    recipient: recipient.email,
                    status: "SENT",
                    metadata: { ...input.metadata },
                  },
                });
              }
              return;
            }
          } catch (err: any) {
            // Best-effort attempt log. Don't fail the original request flow.
            try {
              const attemptedRecipient =
                channel === "email" ? recipient.email : channel === "sms" || channel === "whatsapp" ? recipient.phone : recipientId;

              await prisma.notificationDispatchLog.create({
                data: {
                  eventType: input.eventType,
                  channel,
                  recipient: String(attemptedRecipient || recipientId),
                  status: "FAILED",
                  error: err?.message ?? String(err),
                  metadata: { ...input.metadata },
                },
              });
            } catch (_logErr) {
              // ignore logging errors
            }

            results.push({
              channel,
              recipient: recipientId,
              ok: false,
              error: err?.message ?? String(err),
            });
            console.error("[dispatchNotification] failed", {
              eventType: input.eventType,
              channel,
              recipient: recipientId,
              error: err?.message ?? err,
              metadata: input.metadata,
            });
          }
        })()
      );
    }

    // eslint-disable-next-line no-await-in-loop
    await Promise.all(promises);
  }

  return { ok: true, results };
}

