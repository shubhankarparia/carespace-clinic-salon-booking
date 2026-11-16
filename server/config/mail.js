
import "dotenv/config";
import nodemailer from "nodemailer";

// ==========================================
// SMTP CONFIGURATION
// ==========================================

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpEmail = process.env.SMTP_EMAIL;
const smtpPassword = process.env.SMTP_PASSWORD;

const smtpSecure =
  process.env.SMTP_SECURE === "true" || smtpPort === 465;

// ==========================================
// VALIDATE SMTP CONFIGURATION
// ==========================================

if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
  throw new Error("Invalid SMTP_PORT configuration.");
}

const isMailConfigured = Boolean(
  smtpHost && smtpEmail && smtpPassword
);

// ==========================================
// CREATE NODEMAILER TRANSPORTER
// ==========================================

const transporter = isMailConfigured
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,

      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,

      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    })
  : null;

// ==========================================
// VERIFY SMTP CONNECTION
// ==========================================

const verifyMailConnection = async () => {
  if (!transporter) {
    console.warn(
      "Email service is not configured. Check SMTP settings in .env"
    );

    return false;
  }

  try {
    await transporter.verify();

    console.log("Email SMTP connection successful.");

    return true;
  } catch (error) {
    console.error("Email SMTP connection failed:");
    console.error(error.message);

    return false;
  }
};

// ==========================================
// SEND EMAIL
// ==========================================

const sendEmail = async ({
  to,
  cc,
  bcc,
  subject,
  text,
  html,
  replyTo,
  attachments,
}) => {
  // Check SMTP configuration
  if (!transporter) {
    throw new Error(
      "Email service is not configured. Please configure SMTP settings."
    );
  }

  // Validate required fields
  if (!to || !subject || (!text && !html)) {
    throw new Error(
      "Recipient, subject, and email content are required."
    );
  }

  try {
    const info = await transporter.sendMail({
      from: {
        name: process.env.BUSINESS_NAME || "CareSpace",
        address: smtpEmail,
      },

      to,
      ...(cc && { cc }),
      ...(bcc && { bcc }),

      subject,
      ...(text && { text }),
      ...(html && { html }),
      ...(replyTo && { replyTo }),
      ...(attachments && { attachments }),
    });

    console.log("Email sent successfully:", info.messageId);

    return info;

  } catch (error) {
    console.error("Email sending failed:");
    console.error(error.message);

    throw error;
  }
};

// ==========================================
// CLOSE SMTP CONNECTION
// ==========================================

const closeMailConnection = () => {
  if (transporter) {
    transporter.close();
    console.log("Email SMTP connection closed.");
  }
};

// ==========================================
// EXPORTS
// ==========================================

export {
  transporter,
  isMailConfigured,
  verifyMailConnection,
  sendEmail,
  closeMailConnection,
};

export default sendEmail;
