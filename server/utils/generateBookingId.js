
import { randomBytes } from "crypto";

const generateBookingId = (prefix = "CS") => {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replaceAll("-", "");

  const randomPart = randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `${prefix}-${date}-${randomPart}`;
};

export default generateBookingId;
