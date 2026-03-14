/**
 * SMS service for OTP delivery.
 * Supports: Twilio (free trial), Fast2SMS (₹50 free credit, India).
 * Set SMS_PROVIDER=twilio|fast2sms in .env. If unset, OTP is logged to console (dev).
 */

const provider = process.env.SMS_PROVIDER?.toLowerCase();
const IS_DEV = process.env.NODE_ENV !== "production";

async function sendViaTwilio(phone: string, message: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!accountSid || !authToken || !fromNumber) {
    throw new Error("Twilio not configured: set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER");
  }
  const twilio = await import("twilio");
  const client = twilio.default(accountSid, authToken);
  const to = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "").slice(-10)}`;
  await client.messages.create({
    body: message,
    from: fromNumber,
    to,
  });
}

async function sendViaFast2SMS(phone: string, message: string): Promise<void> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    throw new Error("Fast2SMS not configured: set FAST2SMS_API_KEY");
  }
  const num = phone.replace(/\D/g, "").slice(-10);
  const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: apiKey,
    },
    body: JSON.stringify({
      route: "q",
      message,
      numbers: num,
      sender_id: process.env.FAST2SMS_SENDER_ID || "FSTSMS",
    }),
  });
  const data = (await res.json()) as { return?: boolean; message?: string };
  if (!data.return && !res.ok) {
    throw new Error(data.message || `Fast2SMS error: ${res.status}`);
  }
}

export async function sendOtpSms(phone: string, code: string): Promise<void> {
  const message = `Your WombTo18 verification code is ${code}. Valid for 5 minutes.`;
  if (provider === "twilio") {
    await sendViaTwilio(phone, message);
    return;
  }
  if (provider === "fast2sms") {
    await sendViaFast2SMS(phone, message);
    return;
  }
  if (IS_DEV) {
    console.log(`[SMS] OTP for ${phone}: ${code}`);
    return;
  }
  throw new Error(
    "SMS not configured. Set SMS_PROVIDER=twilio or fast2sms and add credentials. See .env.example"
  );
}
