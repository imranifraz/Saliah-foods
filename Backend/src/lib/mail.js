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

export async function sendCustomerPasswordResetOtp({ email, fullName, code }) {
  const subject = "Saliah Foods — Password reset code";
  const greeting = fullName ? `Hi ${fullName},` : "Hi,";
  const text = `${greeting}

Your Saliah Foods password reset code is:

${code}

This code expires in 10 minutes. If you did not request a reset, you can ignore this email.

— Saliah Foods`;

  const html = `<p>${greeting}</p>
<p>Your Saliah Foods password reset code is:</p>
<p style="font-size:24px;font-weight:700;letter-spacing:0.2em;margin:16px 0">${code}</p>
<p>This code expires in 10 minutes. If you did not request a reset, you can ignore this email.</p>
<p>— Saliah Foods</p>`;

  const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim() || "noreply@saliahfoods.com";
  const transport = getTransporter();

  if (!transport) {
    console.info(`[mail:dev] Customer password reset OTP for ${email}: ${code}`);
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

export async function sendCustomerEmailVerification({ email, fullName, verifyUrl }) {
  const subject = "Verify your Saliah Foods account";
  const greeting = fullName ? `Hi ${fullName},` : "Hi,";
  const text = `${greeting}

Thanks for creating a Saliah Foods account.

Please verify your email address by opening this link:
${verifyUrl}

This link expires in 24 hours. You can browse and manage your profile before verifying, but checkout requires a verified email.

If you did not create this account, you can ignore this email.

— Saliah Foods`;

  const html = `<p>${greeting}</p>
<p>Thanks for creating a Saliah Foods account.</p>
<p><a href="${verifyUrl}" style="display:inline-block;margin:16px 0;padding:12px 20px;background:#16312a;color:#fefdfb;text-decoration:none;border-radius:999px;font-weight:600">Verify email address</a></p>
<p>Or copy this link into your browser:<br><a href="${verifyUrl}">${verifyUrl}</a></p>
<p>This link expires in 24 hours. You can browse and manage your profile before verifying, but checkout requires a verified email.</p>
<p>If you did not create this account, you can ignore this email.</p>
<p>— Saliah Foods</p>`;

  const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim() || "noreply@saliahfoods.com";
  const transport = getTransporter();

  if (!transport) {
    console.info(`[mail:dev] Email verification for ${email}: ${verifyUrl}`);
    return { delivered: false, devLogged: true };
  }

  await transport.sendMail({ from, to: email, subject, text, html });
  return { delivered: true, devLogged: false };
}
