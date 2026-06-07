import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter !== undefined) return transporter;

  const host = process.env.SMTP_HOST?.trim();
  if (!host) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS ?? "",
        }
      : undefined,
  });

  return transporter;
}

export async function sendAdminPasswordResetOtp({ email, fullName, code }) {
  const subject = "Saliah Foods Admin — Password reset code";
  const greeting = fullName ? `Hi ${fullName},` : "Hi,";
  const text = `${greeting}

Your Saliah Foods admin password reset code is:

${code}

This code expires in 10 minutes. If you did not request a reset, you can ignore this email.

— Saliah Foods Admin`;

  const html = `<p>${greeting}</p>
<p>Your Saliah Foods admin password reset code is:</p>
<p style="font-size:24px;font-weight:700;letter-spacing:0.2em;margin:16px 0">${code}</p>
<p>This code expires in 10 minutes. If you did not request a reset, you can ignore this email.</p>
<p>— Saliah Foods Admin</p>`;

  const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim() || "noreply@saliahfoods.com";
  const transport = getTransporter();

  if (!transport) {
    console.info(`[mail:dev] Password reset OTP for ${email}: ${code}`);
    return { delivered: false, devLogged: true };
  }

  await transport.sendMail({ from, to: email, subject, text, html });
  return { delivered: true, devLogged: false };
}

export async function sendInventoryAlertEmail({ subject, text, html }) {
  const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim() || "noreply@saliahfoods.com";
  const transport = getTransporter();
  const alertTo =
    process.env.INVENTORY_ALERT_EMAIL?.trim() ||
    process.env.ADMIN_ALERT_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim() ||
    "";

  if (!alertTo) {
    console.info(`[mail:dev] Inventory alert: ${subject}`);
    return { delivered: false, devLogged: true };
  }

  if (!transport) {
    console.info(`[mail:dev] Inventory alert to ${alertTo}: ${subject}\n${text}`);
    return { delivered: false, devLogged: true };
  }

  await transport.sendMail({ from, to: alertTo, subject, text, html });
  return { delivered: true, devLogged: false };
}
