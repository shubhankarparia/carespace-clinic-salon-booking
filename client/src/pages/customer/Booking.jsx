
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import BookingForm from "../../components/booking/BookingForm";

import {
  getServices,
  getStaff,
  createBooking,
} from "./customerApi";

import "./customer.css";

// ==========================================
// BOOKING PAGE
// ==========================================

export default function Booking() {
  const navigate = useNavigate();

  // ========================================
  // STATES
  // ========================================

  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);

  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(true);

  const [error, setError] = useState("");

  // ========================================
  // LOAD SERVICES AND STAFF
  // ========================================

  const loadBookingData = useCallback(async () => {
    try {
      setError("");

      setLoadingServices(true);
      setLoadingStaff(true);

      const [serviceData, staffData] = await Promise.all([
        getServices(),
        getStaff(),
      ]);

      setServices(
        Array.isArray(serviceData) ? serviceData : []
      );

      setStaff(
        Array.isArray(staffData) ? staffData : []
      );

    } catch (err) {
      console.error("Booking data error:", err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load services and professionals. Please check your backend connection."
      );

    } finally {
      setLoadingServices(false);
      setLoadingStaff(false);
    }
  }, []);

  // ========================================
  // INITIAL DATA LOAD
  // ========================================

  useEffect(() => {
    loadBookingData();
  }, [loadBookingData]);

  // ========================================
  // CREATE BOOKING
  // ========================================

  const handleBooking = async (bookingData) => {
    try {
      // Validate required booking information

      if (!bookingData.service) {
        throw new Error("Please select a valid service.");
      }

      if (!bookingData.staff) {
        throw new Error("Please select a professional.");
      }

      if (!bookingData.category) {
        throw new Error("Please select a booking category.");
      }

      if (!bookingData.appointmentDate) {
        throw new Error("Please select an appointment date.");
      }

      if (!bookingData.startTime || !bookingData.endTime) {
        throw new Error("Please select a valid appointment time.");
      }

      if (!bookingData.customerName) {
        throw new Error("Customer name is required.");
      }

      if (!bookingData.customerEmail) {
        throw new Error("Customer email is required.");
      }

      if (!bookingData.customerPhone) {
        throw new Error("Customer phone number is required.");
      }

      // BookingForm already converts time to HH:mm
      // and prepares the backend-compatible payload.
      // Do not convert or calculate the time again.

      console.log("Booking API payload:", bookingData);

      // Send booking request

      const response = await createBooking(bookingData);

      // customerApi.createBooking normally returns
      // response.data.booking || response.data

      const booking =
        response?.booking ||
        response?.data?.booking ||
        response?.data ||
        response;

      if (!booking || (!booking._id && !booking.bookingId)) {
        throw new Error(
          "Booking was submitted, but the server returned an invalid booking response."
        );
      }

      console.log("Booking created successfully:", booking);

      // Navigate to booking confirmation page

      navigate("/booking-confirmation", {
        replace: false,
        state: {
          booking,
        },
      });

      return booking;

    } catch (err) {
      console.error("Booking creation error:", err);

      throw err;
    }
  };

  // ========================================
  // PAGE UI
  // ========================================

  return (
    <div className="customer-page">

      {/* ==================================
          PAGE BANNER
      ================================== */}

      <div className="customer-top-banner">

        <div>

          <span className="customer-eyebrow">
            CUSTOMER PORTAL
          </span>

          <h1>Book Your Appointment</h1>

          <p>
            Your health and personal care deserve the best.
            Schedule your visit with ease.
          </p>

        </div>

        <div className="customer-banner-icon">
          <i className="bi bi-calendar2-heart"></i>
        </div>

      </div>

      {/* ==================================
          ERROR MESSAGE
      ================================== */}

      {error && (
        <div
          className="alert alert-warning customer-alert"
          role="alert"
        >

          <i className="bi bi-exclamation-circle me-2"></i>

          {error}

          <button
            type="button"
            className="btn btn-sm btn-outline-dark ms-3"
            onClick={loadBookingData}
            disabled={loadingServices || loadingStaff}
          >
            {loadingServices || loadingStaff ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Loading...
              </>
            ) : (
              "Retry"
            )}
          </button>

        </div>
      )}

      {/* ==================================
          BOOKING FORM
      ================================== */}

      <BookingForm
        services={services}
        staff={staff}
        loadingServices={loadingServices}
        loadingStaff={loadingStaff}
        onSubmit={handleBooking}
      />

    </div>
  );
}
