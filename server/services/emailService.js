
import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const {
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_SECURE,
    EMAIL_USER,
    EMAIL_PASS,
    EMAIL_SERVICE,
  } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    return null;
  }

  const commonOptions = {
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  };

  if (EMAIL_SERVICE) {
    transporter = nodemailer.createTransport({
      service: EMAIL_SERVICE,
      ...commonOptions,
    });
  } else {
    if (!EMAIL_HOST) {
      throw new Error("EMAIL_HOST is required for SMTP email.");
    }

    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT) || 587,
      secure: EMAIL_SECURE === "true",
      ...commonOptions,
    });
  }

  return transporter;
};

const getSender = () => {
  const name = process.env.EMAIL_FROM_NAME || "CareSpace";
  const address = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  if (!address) {
    throw new Error("EMAIL_FROM or EMAIL_USER is required.");
  }

  return `"${name}" <${address}>`;
};

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}) => {
  if (!to) {
    throw new Error("Email recipient is required.");
  }

  const mailer = getTransporter();

  if (!mailer) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `Email skipped: SMTP credentials are not configured. Recipient: ${to}`
      );

      return {
        sent: false,
        skipped: true,
      };
    }

    throw new Error("Email service is not configured.");
  }

  const result = await mailer.sendMail({
    from: getSender(),
    to,
    subject,
    text,
    html,
  });

  return {
    sent: true,
    messageId: result.messageId,
  };
};

export const verifyEmailConnection = async () => {
  const mailer = getTransporter();

  if (!mailer) {
    return {
      connected: false,
      message: "Email credentials are not configured.",
    };
  }

  await mailer.verify();

  return {
    connected: true,
    message: "Email server connection successful.",
  };
};

export const sendWelcomeEmail = async (user) => {
  const name = user.firstName || "Customer";

  return sendEmail({
    to: user.email,
    subject: "Welcome to CareSpace!",
    text: `Hello ${name}, welcome to CareSpace. Thank you for joining us.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#263238">
        <h2 style="color:#159b91">Welcome to CareSpace!</h2>
        <p>Hello ${escapeHtml(name)},</p>
        <p>Thank you for joining CareSpace. We're happy to have you with us.</p>
        <p>You can now explore our clinic and salon services and book appointments.</p>
        <p>Regards,<br><strong>CareSpace Team</strong></p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (user, resetUrl) => {
  const name = user.firstName || "Customer";

  return sendEmail({
    to: user.email,
    subject: "Reset your CareSpace password",
    text: `Hello ${name}, use this link to reset your password: ${resetUrl}. This link expires in 15 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#263238">
        <h2 style="color:#159b91">Password reset request</h2>
        <p>Hello ${escapeHtml(name)},</p>
        <p>We received a request to reset your CareSpace password.</p>
        <p>
          <a href="${escapeHtml(resetUrl)}"
             style="display:inline-block;padding:12px 20px;background:#159b91;color:white;text-decoration:none;border-radius:8px">
            Reset Password
          </a>
        </p>
        <p>This link expires in 15 minutes. If you did not request a reset, you can ignore this email.</p>
        <p>Regards,<br><strong>CareSpace Team</strong></p>
      </div>
    `,
  });
};

const escapeHtml = (value = "") => {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
};
