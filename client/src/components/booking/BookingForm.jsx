
import React, { useMemo, useState } from "react";

import CategorySelector from "./CategorySelector";
import ServiceSelector from "./ServiceSelector";
import StaffSelector from "./StaffSelector";
import DatePicker from "./DatePicker";
import TimeSlotPicker from "./TimeSlotPicker";
import BookingSummary from "./BookingSummary";
import BookingSuccess from "./BookingSuccess";

import "../../assets/styles/booking.css";

// ==========================================
// DEFAULT APPOINTMENT SLOTS
// ==========================================

const defaultSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
];

// ==========================================
// TIME HELPERS
// ==========================================

// Convert 09:00 AM to 09:00
// Convert 02:30 PM to 14:30

const convertTo24Hour = (time) => {
  const match = String(time).trim().match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (!match) {
    throw new Error("Invalid appointment time format.");
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (
    hours < 1 ||
    hours > 12 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error("Invalid appointment time.");
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  } else if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  return `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}`;
};

// Calculate end time using service duration

const calculateEndTime = (startTime, duration) => {
  const [hours, minutes] = startTime.split(":").map(Number);

  const durationMinutes = Number(duration);

  if (
    !Number.isFinite(durationMinutes) ||
    durationMinutes <= 0
  ) {
    throw new Error("Invalid service duration.");
  }

  const totalMinutes =
    hours * 60 + minutes + durationMinutes;

  if (totalMinutes > 1439) {
    throw new Error("Appointment end time exceeds the day.");
  }

  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;

  return `${String(endHours).padStart(2, "0")}:${String(
    endMinutes
  ).padStart(2, "0")}`;
};

// ==========================================
// BOOKING FORM COMPONENT
// ==========================================

export default function BookingForm({
  services = [],
  staff = [],
  slots = defaultSlots,
  loadingServices = false,
  loadingStaff = false,
  loadingSlots = false,
  onSubmit,
  initialCategory = "clinic",
}) {
  // ========================================
  // STATES
  // ========================================

  const [step, setStep] = useState(1);

  const [category, setCategory] = useState(initialCategory);

  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [completedBooking, setCompletedBooking] = useState(null);

  // ========================================
  // SELECTED SERVICE
  // ========================================

  const service = useMemo(
    () =>
      services.find(
        (item) =>
          String(item._id || item.id) === String(serviceId)
      ),
    [services, serviceId]
  );

  // ========================================
  // SELECTED STAFF
  // ========================================

  const selectedStaff = useMemo(
    () =>
      staff.find(
        (item) =>
          String(item._id || item.id) === String(staffId)
      ),
    [staff, staffId]
  );

  // ========================================
  // FILTER STAFF BY CATEGORY
  // ========================================

  const availableStaff = useMemo(() => {
    return staff.filter((item) => {
      if (item.isActive === false || item.isAvailable === false) {
        return false;
      }

      return (
        !item.category ||
        item.category === category
      );
    });
  }, [staff, category]);

  // ========================================
  // BOOKING STEPS
  // ========================================

  const steps = [
    "Category",
    "Service",
    "Schedule",
    "Details",
    "Review",
  ];

  // ========================================
  // CHANGE CATEGORY
  // ========================================

  const changeCategory = (value) => {
    setCategory(value);

    setServiceId("");
    setStaffId("");

    setDate("");
    setTime("");

    setError("");
  };

  // ========================================
  // UPDATE CUSTOMER DETAILS
  // ========================================

  const updateCustomer = (field, value) => {
    setCustomer((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  };

  // ========================================
  // VALIDATE CURRENT STEP
  // ========================================

  const nextStep = () => {
    setError("");

    // STEP 1: CATEGORY

    if (step === 1) {
      if (!["clinic", "salon"].includes(category)) {
        setError("Please select a valid category.");
        return;
      }
    }

    // STEP 2: SERVICE

    if (step === 2) {
      if (loadingServices) {
        setError("Please wait while services are loading.");
        return;
      }

      if (!serviceId || !service) {
        setError("Please select a valid service.");
        return;
      }
    }

    // STEP 3: STAFF, DATE AND TIME

    if (step === 3) {
      if (loadingStaff) {
        setError("Please wait while professionals are loading.");
        return;
      }

      if (!staffId || !selectedStaff) {
        setError("Please select a professional.");
        return;
      }

      if (!date) {
        setError("Please select an appointment date.");
        return;
      }

      if (!time) {
        setError("Please select an appointment time.");
        return;
      }

      if (selectedStaff.isAvailable === false) {
        setError("This professional is currently unavailable.");
        return;
      }
    }

    // STEP 4: CUSTOMER DETAILS

    if (step === 4) {
      const validEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          customer.email.trim()
        );

      const validPhone =
        /^[0-9+\-\s]{10,15}$/.test(
          customer.phone.trim()
        );

      if (!customer.name.trim()) {
        setError("Please enter your full name.");
        return;
      }

      if (!validEmail) {
        setError("Please enter a valid email address.");
        return;
      }

      if (!validPhone) {
        setError("Please enter a valid phone number.");
        return;
      }
    }

    setStep((current) => Math.min(current + 1, 5));
  };

  // ========================================
  // PREVIOUS STEP
  // ========================================

  const previousStep = () => {
    setError("");

    setStep((current) => Math.max(current - 1, 1));
  };

  // ========================================
  // SUBMIT BOOKING
  // ========================================

  const submitBooking = async () => {
    if (submitting) return;

    if (!onSubmit) {
      setError("Booking API is not connected yet.");
      return;
    }

    // FINAL VALIDATION

    if (!serviceId || !service) {
      setError("Please select a valid service.");
      setStep(2);
      return;
    }

    if (!staffId || !selectedStaff) {
      setError("Please select a professional.");
      setStep(3);
      return;
    }

    if (!date || !time) {
      setError("Please select an appointment date and time.");
      setStep(3);
      return;
    }

    if (
      !customer.name.trim() ||
      !customer.email.trim() ||
      !customer.phone.trim()
    ) {
      setError("Please complete your contact details.");
      setStep(4);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Convert AM/PM to 24-hour time

      const startTime = convertTo24Hour(time);

      // Calculate end time from service duration

      const endTime = calculateEndTime(
        startTime,
        service.duration
      );

      // Backend-compatible payload

      const bookingData = {
        service: service._id || service.id,

        staff: selectedStaff._id || selectedStaff.id,

        category,

        appointmentDate: date,

        startTime,
        endTime,

        customerName: customer.name.trim(),

        customerEmail: customer.email.trim(),

        customerPhone: customer.phone.trim(),

        notes: customer.notes.trim(),
      };

      console.log("Submitting booking:", bookingData);

      // Send request to parent Booking.jsx

      const result = await onSubmit(bookingData);

      if (!result) {
        throw new Error(
          "Booking response was empty. Please check the server."
        );
      }

      setCompletedBooking(result);

    } catch (err) {
      console.error("Booking submission failed:", err);

      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.join?.(", ") ||
        err?.message ||
        "Unable to create booking. Please try again.";

      setError(errorMessage);

    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // RESET BOOKING
  // ========================================

  const resetBooking = () => {
    setCompletedBooking(null);

    setStep(1);

    setCategory(initialCategory);

    setServiceId("");
    setStaffId("");

    setDate("");
    setTime("");

    setCustomer({
      name: "",
      email: "",
      phone: "",
      notes: "",
    });

    setError("");
    setSubmitting(false);
  };

  // ========================================
  // SUCCESS SCREEN
  // ========================================

  if (completedBooking) {
    return (
      <BookingSuccess
        booking={completedBooking}
        onNewBooking={resetBooking}
      />
    );
  }

  // ========================================
  // MAIN BOOKING UI
  // ========================================

  return (
    <div className="booking-page">

      {/* PAGE HEADING */}

      <div className="booking-page-heading">

        <span className="booking-eyebrow">
          SIMPLE · QUICK · CONVENIENT
        </span>

        <h1>
          Book Your <span>Appointment</span>
        </h1>

        <p>
          Choose a service, find a convenient time and you're all set.
        </p>

      </div>

      {/* PROGRESS STEPPER */}

      <div className="booking-stepper">

        {steps.map((label, index) => {
          const number = index + 1;

          return (
            <div
              key={label}
              className={`booking-step ${
                step === number ? "active" : ""
              } ${step > number ? "complete" : ""}`}
            >

              <span>
                {step > number ? (
                  <i className="bi bi-check-lg"></i>
                ) : (
                  number
                )}
              </span>

              <small>{label}</small>

            </div>
          );
        })}

      </div>

      {/* BOOKING LAYOUT */}

      <div className="booking-layout">

        <main className="booking-main-card">

          {/* STEP 1: CATEGORY */}

          {step === 1 && (
            <section>

              <h2>Choose Your Category</h2>

              <p className="booking-section-subtitle">
                Select the type of appointment you need.
              </p>

              <CategorySelector
                value={category}
                onChange={changeCategory}
              />

            </section>
          )}

          {/* STEP 2: SERVICE */}

          {step === 2 && (
            <section>

              <h2>Select a Service</h2>

              <p className="booking-section-subtitle">
                Choose your preferred service.
              </p>

              <ServiceSelector
                services={services}
                category={category}
                value={serviceId}
                onChange={(value) => {
                  setServiceId(value);
                  setError("");
                }}
                loading={loadingServices}
              />

            </section>
          )}

          {/* STEP 3: SCHEDULE */}

          {step === 3 && (
            <section>

              <h2>Choose Your Schedule</h2>

              <p className="booking-section-subtitle">
                Select a professional, appointment date and available time.
              </p>

              {/* PROFESSIONAL */}

              <div className="mb-4">

                <label className="form-label fw-semibold">
                  Choose Professional *
                </label>

                <StaffSelector
                  staff={availableStaff}
                  value={staffId}
                  onChange={(value) => {
                    setStaffId(value);
                    setError("");
                  }}
                  loading={loadingStaff}
                />

                {!loadingStaff && availableStaff.length === 0 && (
                  <div className="alert alert-warning mt-3">
                    No professionals are currently available for this category.
                  </div>
                )}

              </div>

              {/* DATE AND TIME */}

              <div className="row g-4">

                <div className="col-md-6">

                  <DatePicker
                    value={date}
                    onChange={(value) => {
                      setDate(value);
                      setTime("");
                      setError("");
                    }}
                  />

                </div>

                <div className="col-md-6">

                  <label className="form-label fw-semibold">
                    Available Time Slots
                  </label>

                  <TimeSlotPicker
                    slots={slots}
                    value={time}
                    onChange={(value) => {
                      setTime(value);
                      setError("");
                    }}
                    loading={loadingSlots}
                  />

                </div>

              </div>

            </section>
          )}

          {/* STEP 4: CUSTOMER DETAILS */}

          {step === 4 && (
            <section>

              <h2>Your Contact Details</h2>

              <p className="booking-section-subtitle">
                Enter your details to confirm your appointment.
              </p>

              <div className="row g-3">

                {/* FULL NAME */}

                <div className="col-md-6">

                  <label className="form-label">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    className="form-control booking-input"
                    value={customer.name}
                    onChange={(e) =>
                      updateCustomer("name", e.target.value)
                    }
                    placeholder="Enter your full name"
                    maxLength={100}
                    autoComplete="name"
                  />

                </div>

                {/* PHONE */}

                <div className="col-md-6">

                  <label className="form-label">
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    className="form-control booking-input"
                    value={customer.phone}
                    onChange={(e) =>
                      updateCustomer("phone", e.target.value)
                    }
                    placeholder="Enter phone number"
                    inputMode="tel"
                    maxLength={15}
                    autoComplete="tel"
                  />

                </div>

                {/* EMAIL */}

                <div className="col-12">

                  <label className="form-label">
                    Email Address *
                  </label>

                  <input
                    type="email"
                    className="form-control booking-input"
                    value={customer.email}
                    onChange={(e) =>
                      updateCustomer("email", e.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                  />

                </div>

                {/* NOTES */}

                <div className="col-12">

                  <label className="form-label">
                    Additional Notes
                  </label>

                  <textarea
                    rows="3"
                    className="form-control booking-input"
                    value={customer.notes}
                    onChange={(e) =>
                      updateCustomer("notes", e.target.value)
                    }
                    placeholder="Additional information..."
                    maxLength={1000}
                  />

                </div>

              </div>

            </section>
          )}

          {/* STEP 5: REVIEW */}

          {step === 5 && (
            <section>

              <h2>Review Your Appointment</h2>

              <p className="booking-section-subtitle">
                Check your details before confirming.
              </p>

              <BookingSummary
                category={category}
                service={service}
                staff={selectedStaff}
                date={date}
                time={time}
                customer={customer}
              />

            </section>
          )}

          {/* ERROR MESSAGE */}

          {error && (
            <div
              className="alert alert-danger mt-4"
              role="alert"
            >

              <i className="bi bi-exclamation-circle me-2"></i>

              {error}

            </div>
          )}

          {/* NAVIGATION BUTTONS */}

          <div className="booking-form-actions">

            {/* BACK */}

            {step > 1 && (
              <button
                type="button"
                className="btn btn-outline-secondary booking-back-btn"
                onClick={previousStep}
                disabled={submitting}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back
              </button>
            )}

            {/* CONTINUE */}

            {step < 5 && (
              <button
                type="button"
                className="btn booking-primary-btn ms-auto"
                onClick={nextStep}
                disabled={
                  (step === 2 && loadingServices) ||
                  (step === 3 && loadingStaff) ||
                  (step === 3 && loadingSlots)
                }
              >
                Continue

                <i className="bi bi-arrow-right ms-2"></i>
              </button>
            )}

            {/* CONFIRM */}

            {step === 5 && (
              <button
                type="button"
                className="btn booking-primary-btn ms-auto"
                onClick={submitBooking}
                disabled={submitting}
              >

                {submitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      aria-hidden="true"
                    ></span>

                    Submitting...
                  </>
                ) : (
                  <>
                    Confirm Appointment

                    <i className="bi bi-check2 ms-2"></i>
                  </>
                )}

              </button>
            )}

          </div>

        </main>

        {/* RIGHT INFORMATION PANEL */}

        <aside className="booking-side-note">

          <div className="booking-side-icon">
            <i className="bi bi-calendar2-check"></i>
          </div>

          <h3>Appointments Made Easy</h3>

          <p>
            Book your preferred service in just a few simple steps.
          </p>

          <ul>

            <li>
              <i className="bi bi-check-circle-fill"></i>
              Flexible appointment times
            </li>

            <li>
              <i className="bi bi-check-circle-fill"></i>
              Experienced professionals
            </li>

            <li>
              <i className="bi bi-check-circle-fill"></i>
              Booking updates and support
            </li>

          </ul>

          <div className="booking-help-box">

            <i className="bi bi-headset"></i>

            <span>
              <strong>Need Help?</strong>

              <small>
                Contact our support team.
              </small>
            </span>

          </div>

        </aside>

      </div>

    </div>
  );
}
