/**
 * WhatsApp notifications via Fast2SMS.
 *
 * Docs used:
 * - Send Authentication Template (OTP): https://docs.fast2sms.com/reference/sendauthenticationtemplate
 * - Send Template (with variable): https://docs.fast2sms.com/reference/sendtemplatewithvariable
 *
 * Notes:
 * - WhatsApp templates must be pre-approved in Fast2SMS WhatsApp Manager.
 * - If required env vars are missing, this throws and notificationService can decide whether to swallow it.
 */

const IS_DEV = process.env.NODE_ENV !== "production";
const WHATSAPP_DISABLED = process.env.DISABLE_WHATSAPP === "true";

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY?.trim();
const PHONE_NUMBER_ID = process.env.FAST2SMS_WHATSAPP_PHONE_NUMBER_ID?.trim();
const WHATSAPP_VERSION = process.env.FAST2SMS_WHATSAPP_API_VERSION?.trim() || "v24.0";

function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // If number already has country code 91, keep last 12 digits; otherwise assume 10-digit Indian.
  if (digits.startsWith("91") && digits.length >= 12) return digits;
  const last10 = digits.slice(-10);
  return `91${last10}`;
}

async function postWhatsApp(payload: any) {
  if (WHATSAPP_DISABLED) {
    console.log(`[WHATSAPP DISABLED] Payload: ${JSON.stringify(payload)}`);
    return;
  }
  if (!FAST2SMS_API_KEY) throw new Error("Fast2SMS not configured: set FAST2SMS_API_KEY");
  if (!PHONE_NUMBER_ID) throw new Error("Fast2SMS WhatsApp not configured: set FAST2SMS_WHATSAPP_PHONE_NUMBER_ID");

  const url = `https://www.fast2sms.com/dev/whatsapp/${WHATSAPP_VERSION}/${PHONE_NUMBER_ID}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: FAST2SMS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Fast2SMS WhatsApp ${res.status}: ${errText}`);
  }
}

export async function sendOtpWhatsApp(toPhone: string, code: string): Promise<void> {
  const templateName = process.env.FAST2SMS_WHATSAPP_TEMPLATE_OTP_NAME?.trim();
  const languageCode = process.env.FAST2SMS_WHATSAPP_TEMPLATE_OTP_LANGUAGE?.trim() || "en";

  if (!templateName) throw new Error("WhatsApp OTP template not configured: set FAST2SMS_WHATSAPP_TEMPLATE_OTP_NAME");

  if (WHATSAPP_DISABLED) {
    console.log(`[WHATSAPP OTP DISABLED] To: ${toPhone} | Code: ${code}`);
    return;
  }

  const to = normalizeIndianPhone(toPhone);

  // Fast2SMS expects OTP to be present in BOTH body and one button parameter.
  await postWhatsApp({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: code }],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: code }],
        },
      ],
    },
  });

  if (IS_DEV) console.log(`[WHATSAPP OTP] To: ${toPhone} | Code: ${code}`);
}

type WhatsAppTemplateParams = { childName?: string; requesterName?: string; statusText?: string };

async function sendBodyTemplateWithVariables(params: {
  toPhone: string;
  templateName: string;
  languageCode: string;
  variables: string[];
}) {
  const to = normalizeIndianPhone(params.toPhone);
  await postWhatsApp({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template: {
      name: params.templateName,
      language: { code: params.languageCode },
      components: [
        {
          type: "body",
          parameters: params.variables.map((v) => ({ type: "text", text: v })),
        },
      ],
    },
  });

  if (IS_DEV) console.log(`[WHATSAPP TEMPLATE] To: ${params.toPhone} | Template: ${params.templateName}`);
}

export async function sendAccessRequestWhatsApp(
  toPhone: string,
  childName: string,
  requesterName: string
): Promise<void> {
  const templateName = process.env.FAST2SMS_WHATSAPP_TEMPLATE_ACCESS_REQUEST_NAME?.trim();
  const languageCode = process.env.FAST2SMS_WHATSAPP_TEMPLATE_ACCESS_REQUEST_LANGUAGE?.trim() || "en";
  if (!templateName) throw new Error("WhatsApp access-request template not configured: set FAST2SMS_WHATSAPP_TEMPLATE_ACCESS_REQUEST_NAME");
  await sendBodyTemplateWithVariables({
    toPhone,
    templateName,
    languageCode,
    variables: [childName, requesterName],
  });
}

export async function sendAccessApprovedWhatsApp(
  toPhone: string,
  childName: string
): Promise<void> {
  const templateName = process.env.FAST2SMS_WHATSAPP_TEMPLATE_ACCESS_APPROVED_NAME?.trim();
  const languageCode = process.env.FAST2SMS_WHATSAPP_TEMPLATE_ACCESS_APPROVED_LANGUAGE?.trim() || "en";
  if (!templateName) throw new Error("WhatsApp access-approved template not configured: set FAST2SMS_WHATSAPP_TEMPLATE_ACCESS_APPROVED_NAME");
  await sendBodyTemplateWithVariables({
    toPhone,
    templateName,
    languageCode,
    variables: [childName],
  });
}

export async function sendAccessDeniedWhatsApp(
  toPhone: string,
  childName: string
): Promise<void> {
  const templateName = process.env.FAST2SMS_WHATSAPP_TEMPLATE_ACCESS_DENIED_NAME?.trim();
  const languageCode = process.env.FAST2SMS_WHATSAPP_TEMPLATE_ACCESS_DENIED_LANGUAGE?.trim() || "en";
  if (!templateName) throw new Error("WhatsApp access-denied template not configured: set FAST2SMS_WHATSAPP_TEMPLATE_ACCESS_DENIED_NAME");
  await sendBodyTemplateWithVariables({
    toPhone,
    templateName,
    languageCode,
    variables: [childName],
  });
}

export async function sendEventScheduledWhatsApp(
  toPhone: string,
  eventTitle: string,
  scheduledDateText: string
): Promise<void> {
  const templateName = process.env.FAST2SMS_WHATSAPP_TEMPLATE_EVENT_SCHEDULED_NAME?.trim();
  const languageCode = process.env.FAST2SMS_WHATSAPP_TEMPLATE_EVENT_SCHEDULED_LANGUAGE?.trim() || "en";
  if (!templateName) throw new Error("WhatsApp event-scheduled template not configured: set FAST2SMS_WHATSAPP_TEMPLATE_EVENT_SCHEDULED_NAME");

  await sendBodyTemplateWithVariables({
    toPhone,
    templateName,
    languageCode,
    // Expected Fast2SMS WhatsApp template variable order:
    // 1) eventTitle  2) scheduledDateText
    variables: [eventTitle, scheduledDateText],
  });
}

