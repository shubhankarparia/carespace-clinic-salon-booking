
import {
  sendEmail,
} from "./emailService.js";

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

const getCustomerName = (booking) => {
  const customer = booking.customer;

  if (!customer) return "Customer";

  return (
    `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
    "Customer"
  );
};

const getBookingDate = (booking) => {
  if (!booking.appointmentDate) return "Not specified";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(booking.appointmentDate));
};

const getBookingSummary = (booking) => {
  const customerName = getCustomerName(booking);
  const serviceName = booking.service?.name || "Service";
  const staffName = booking.staff?.name || "Assigned professional";
  const date = getBookingDate(booking);
  const time = `${booking.startTime || ""} - ${booking.endTime || ""}`;
  const amount = Number(booking.totalAmount || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });

  return {
    customerName,
    serviceName,
    staffName,
    date,
    time,
    amount,
  };
};

const sendBookingNotification = async ({
  booking,
  subject,
  heading,
  message,
}) => {
  const email = booking.customer?.email;

  if (!email) {
    return {
      sent: false,
      reason: "Customer email is unavailable.",
    };
  }

  const details = getBookingSummary(booking);

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#263238">
      <h2 style="color:#159b91">${escapeHtml(heading)}</h2>
      <p>Hello ${escapeHtml(details.customerName)},</p>
      <p>${escapeHtml(message)}</p>

      <div style="background:#f4f8f8;border-radius:12px;padding:20px;margin:20px 0">
        <h3 style="margin-top:0">Appointment details</h3>
        <p><strong>Service:</strong> ${escapeHtml(details.serviceName)}</p>
        <p><strong>Professional:</strong> ${escapeHtml(details.staffName)}</p>
        <p><strong>Date:</strong> ${escapeHtml(details.date)}</p>
        <p><strong>Time:</strong> ${escapeHtml(details.time)}</p>
        <p><strong>Amount:</strong> ${escapeHtml(details.amount)}</p>
        <p><strong>Status:</strong> ${escapeHtml(booking.status || "pending")}</p>
      </div>

      <p>Thank you for choosing CareSpace.</p>
      <p>Regards,<br><strong>CareSpace Team</strong></p>
    </div>
  `;

  const text = [
    `Hello ${details.customerName},`,
    message,
    "",
    `Service: ${details.serviceName}`,
    `Professional: ${details.staffName}`,
    `Date: ${details.date}`,
    `Time: ${details.time}`,
    `Amount: ${details.amount}`,
    `Status: ${booking.status || "pending"}`,
    "",
    "Thank you for choosing CareSpace.",
  ].join("\n");

  return sendEmail({
    to: email,
    subject,
    text,
    html,
  });
};

export const notifyBookingCreated = async (booking) => {
  return sendBookingNotification({
    booking,
    subject: "Your CareSpace appointment has been booked",
    heading: "Appointment booked!",
    message:
      booking.status === "confirmed"
        ? "Your appointment is confirmed. We look forward to seeing you."
        : "Your appointment request has been received and is awaiting confirmation.",
  });
};

export const notifyBookingCancelled = async (booking) => {
  return sendBookingNotification({
    booking,
    subject: "Your CareSpace appointment has been cancelled",
    heading: "Appointment cancelled",
    message:
      "Your appointment has been cancelled. Please contact us if you need assistance.",
  });
};

export const notifyBookingStatusChanged = async (
  booking,
  previousStatus
) => {
  return sendBookingNotification({
    booking,
    subject: `CareSpace appointment status: ${booking.status}`,
    heading: "Appointment status updated",
    message: `Your appointment status has changed from ${previousStatus} to ${booking.status}.`,
  });
};

export const notifyStaffBooking = async (booking) => {
  const staffEmail = booking.staff?.email;

  if (!staffEmail) {
    return {
      sent: false,
      reason: "Staff email is unavailable.",
    };
  }

  const details = getBookingSummary(booking);

  return sendEmail({
    to: staffEmail,
    subject: "New CareSpace appointment assigned",
    text: `A new appointment has been assigned to you. Customer: ${details.customerName}. Service: ${details.serviceName}. Date: ${details.date}. Time: ${details.time}.`,
  });
};
