/**
 * Email service for OTP delivery (school admin / staff login).
 */

import nodemailer from "nodemailer";
import prisma from "../prismaClient";

const IS_DEV = process.env.NODE_ENV !== "production";
const EMAIL_DISABLED = process.env.DISABLE_EMAIL === "true";

const OTP_HTML = (code: string) => `
  <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:1.5rem;font-weight:800;color:#e11d48;">WombTo18</span>
      <span style="font-size:1rem;color:#64748b;display:block;margin-top:4px;">School Health Platform</span>
    </div>
    <div style="background:white;border-radius:10px;padding:28px;text-align:center;">
      <p style="color:#1e293b;font-size:1rem;margin-bottom:20px;">Your one-time login code:</p>
      <div style="display:inline-block;background:#fdf2f8;border:2px solid #f9a8d4;border-radius:10px;padding:16px 40px;">
        <span style="font-size:2.5rem;font-weight:800;letter-spacing:0.2em;color:#e11d48;">${code}</span>
      </div>
      <p style="color:#64748b;font-size:0.9rem;margin-top:20px;">Valid for <strong>10 minutes</strong>. Do not share this code.</p>
    </div>
    <p style="color:#94a3b8;font-size:0.8rem;text-align:center;margin-top:20px;">If you didn't request this, please ignore this email.</p>
  </div>
`;

const OTP_TEXT = (code: string) =>
  `Your one-time login code is: ${code}\n\nThis code is valid for 10 minutes. Do not share it with anyone.`;

function parseFrom(fromStr: string): { name: string; email: string } {
  const match = fromStr.match(/^(?:([^<]+)\s*)?<([^>]+)>$/);
  if (match) return { name: (match[1] || "").trim() || "WombTo18 School", email: match[2].trim() };
  return { name: "WombTo18 School", email: fromStr.trim() };
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<void> {
  if (EMAIL_DISABLED) {
    console.log(`[EMAIL DISABLED] To: ${to} | Subject: ${subject}`);
    return;
  }

  const brevoKey = process.env.BREVO_API_KEY?.trim();
  const fromStr = process.env.SMTP_FROM || `WombTo18 School <${process.env.SMTP_USER}>`;

  if (brevoKey) {
    const sender = parseFrom(fromStr);
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: sender.name, email: sender.email },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Brevo API ${res.status}: ${err}`);
    }
  } else {
    const transporter = createTransporter();
    if (!transporter) {
      if (IS_DEV) {
        console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
      } else {
        throw new Error("Email not configured. Set BREVO_API_KEY or SMTP_HOST/USER/PASS");
      }
    } else {
      await transporter.sendMail({
        from: fromStr,
        to,
        subject,
        text,
        html,
      });
    }
  }

  // Log to DB
  await prisma.notificationDispatchLog.create({
    data: {
      eventType: subject.includes("OTP") ? "OTP" : "GENERAL",
      channel: "EMAIL",
      recipient: to,
      status: "SENT",
      metadata: { subject }
    }
  }).catch((e: any) => console.error("Failed to log Email dispatch", e));
}

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  await sendEmail(
    email,
    "Your WombTo18 login OTP",
    OTP_HTML(code),
    OTP_TEXT(code)
  );
}
