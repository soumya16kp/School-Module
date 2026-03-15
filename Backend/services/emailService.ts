/**
 * Email service for OTP delivery (school admin / staff login).
 * Configure via .env:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * If not configured, OTP is logged to console (dev/demo mode).
 *
 * Works with Gmail (use App Password), Resend SMTP, SendGrid SMTP, etc.
 */

import nodemailer from "nodemailer";

const IS_DEV = process.env.NODE_ENV !== "production";

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

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    if (IS_DEV) {
      console.log(`[EMAIL OTP] To: ${email} | Code: ${code}`);
      return;
    }
    throw new Error(
      "Email not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env"
    );
  }

  // SMTP_FROM can be "email@example.com" or "Name <email@example.com>"
  const from = process.env.SMTP_FROM || `WombTo18 School <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to: email,
    subject: "Your WombTo18 login OTP",
    text: `Your one-time login code is: ${code}\n\nThis code is valid for 10 minutes. Do not share it with anyone.`,
    html: `
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
    `,
  });
}
