
import React, { useEffect, useState } from "react";
import api from "../../services/api";

import {
  PageHeader,
  Panel,
  ErrorMessage,
  FormField,
} from "./AdminComponents";

// ==========================================
// INITIAL SETTINGS
// ==========================================

const initialSettings = {
  businessName: "CareSpace Clinic & Salon",
  tagline: "",
  logo: "",
  email: "",
  phone: "",

  address: {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  },

  currency: "INR",
  currencySymbol: "₹",
  timezone: "Asia/Kolkata",

  bookingSettings: {
    allowOnlineBooking: true,
    requireBookingConfirmation: true,
    allowCancellation: true,
    cancellationNoticeHours: 24,
    advanceBookingDays: 30,
    minimumBookingNoticeHours: 2,
    slotIntervalMinutes: 30,
  },

  socialLinks: {
    website: "",
    facebook: "",
    instagram: "",
    youtube: "",
  },

  notificationSettings: {
    emailNotifications: true,
    bookingConfirmation: true,
    bookingCancellation: true,
    appointmentReminder: true,
  },
};

// ==========================================
// HELPERS
// ==========================================

const getError = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong. Please try again."
  );
};

const getSettingsData = (response) => {
  return (
    response?.data?.data ||
    response?.data?.settings ||
    response?.data ||
    {}
  );
};

// ==========================================
// SETTINGS COMPONENT
// ==========================================

export default function Settings() {
  const [settings, setSettings] = useState(initialSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ========================================
  // LOAD SETTINGS
  // ========================================

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/settings");

      const data = getSettingsData(response);

      setSettings({
        ...initialSettings,
        ...data,

        address: {
          ...initialSettings.address,
          ...(typeof data.address === "object" && data.address !== null
            ? data.address
            : {}),
        },

        bookingSettings: {
          ...initialSettings.bookingSettings,
          ...(data.bookingSettings || {}),
        },

        socialLinks: {
          ...initialSettings.socialLinks,
          ...(data.socialLinks || {}),
        },

        notificationSettings: {
          ...initialSettings.notificationSettings,
          ...(data.notificationSettings || {}),
        },
      });
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // UPDATE TOP-LEVEL FIELD
  // ========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ========================================
  // UPDATE ADDRESS
  // ========================================

  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    setSettings((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  // ========================================
  // UPDATE NESTED SETTINGS
  // ========================================

  const handleNestedChange = (section, event) => {
    const { name, value, type, checked } = event.target;

    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  // ========================================
  // SAVE SETTINGS
  // ========================================

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...settings,

        address: {
          street: settings.address.street || "",
          city: settings.address.city || "",
          state: settings.address.state || "",
          postalCode: settings.address.postalCode || "",
          country: settings.address.country || "India",
        },

        bookingSettings: {
          ...settings.bookingSettings,
          cancellationNoticeHours: Number(
            settings.bookingSettings.cancellationNoticeHours
          ),
          advanceBookingDays: Number(
            settings.bookingSettings.advanceBookingDays
          ),
          minimumBookingNoticeHours: Number(
            settings.bookingSettings.minimumBookingNoticeHours
          ),
          slotIntervalMinutes: Number(
            settings.bookingSettings.slotIntervalMinutes
          ),
        },
      };

      const response = await api.put("/admin/settings", payload);

      const updatedData = getSettingsData(response);

      if (updatedData && Object.keys(updatedData).length > 0) {
        setSettings((prev) => ({
          ...prev,
          ...updatedData,

          address: {
            ...prev.address,
            ...(updatedData.address || {}),
          },

          bookingSettings: {
            ...prev.bookingSettings,
            ...(updatedData.bookingSettings || {}),
          },

          socialLinks: {
            ...prev.socialLinks,
            ...(updatedData.socialLinks || {}),
          },

          notificationSettings: {
            ...prev.notificationSettings,
            ...(updatedData.notificationSettings || {}),
          },
        }));
      }

      setSuccess(
        response?.data?.message || "Business settings saved successfully."
      );
    } catch (err) {
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // LOADING STATE
  // ========================================

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-3">Loading business settings...</span>
      </div>
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="admin-page settings-page">
      <PageHeader
        title="Business Settings"
        subtitle="Manage your clinic and salon business information."
        icon="bi bi-gear"
      />

      {error && (
        <div className="mb-3">
          <ErrorMessage message={error} />
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
          ></button>
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* BUSINESS INFORMATION */}

        <Panel
          title="Business Information"
          subtitle="Basic information about your business."
        >
          <div className="row g-3">
            <div className="col-md-6">
              <FormField
                label="Business Name"
                name="businessName"
                value={settings.businessName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <FormField
                label="Tagline"
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <FormField
                label="Business Email"
                name="email"
                type="email"
                value={settings.email}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <FormField
                label="Business Phone"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
              />
            </div>

            <div className="col-12">
              <FormField
                label="Business Logo URL"
                name="logo"
                value={settings.logo}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
        </Panel>

        {/* BUSINESS ADDRESS */}

        
        <Panel
          title="Business Address"
          subtitle="Enter your complete business location."
        >
          <div className="row g-3">
            <div className="col-12">
              <FormField
                label="Street Address"
                name="street"
                value={settings.address.street}
                onChange={handleAddressChange}
                placeholder="Enter street address"
              />
            </div>

            <div className="col-md-6">
              <FormField
                label="City"
                name="city"
                value={settings.address.city}
                onChange={handleAddressChange}
                placeholder="Enter city"
              />
            </div>

            <div className="col-md-6">
              <FormField
                label="State"
                name="state"
                value={settings.address.state}
                onChange={handleAddressChange}
                placeholder="Enter state"
              />
            </div>

            <div className="col-md-6">
              <FormField
                label="Postal Code"
                name="postalCode"
                value={settings.address.postalCode}
                onChange={handleAddressChange}
                placeholder="Enter postal code"
              />
            </div>

            <div className="col-md-6">
              <FormField
                label="Country"
                name="country"
                value={settings.address.country}
                onChange={handleAddressChange}
                placeholder="Enter country"
              />
            </div>
          </div>
        </Panel>


        {/* CURRENCY AND TIMEZONE */}

        <Panel
          title="Regional Settings"
          subtitle="Configure currency and business timezone."
        >
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Currency</label>

              <select
                className="form-select"
                name="currency"
                value={settings.currency}
                onChange={handleChange}
              >
                <option value="INR">Indian Rupee (INR)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
            </div>

            <div className="col-md-4">
              <FormField
                label="Currency Symbol"
                name="currencySymbol"
                value={settings.currencySymbol}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Timezone</label>

              <select
                className="form-select"
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
              >
                <option value="Asia/Kolkata">
                  India (Asia/Kolkata)
                </option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </Panel>

        {/* BOOKING SETTINGS */}

        <Panel
          title="Booking Settings"
          subtitle="Control how customers book appointments."
        >
          <div className="row g-3">
            {[
              ["allowOnlineBooking", "Allow Online Booking"],
              [
                "requireBookingConfirmation",
                "Require Booking Confirmation",
              ],
              ["allowCancellation", "Allow Appointment Cancellation"],
            ].map(([name, label]) => (
              <div className="col-md-4" key={name}>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={name}
                    name={name}
                    checked={Boolean(settings.bookingSettings[name])}
                    onChange={(e) =>
                      handleNestedChange("bookingSettings", e)
                    }
                  />
                  <label className="form-check-label" htmlFor={name}>
                    {label}
                  </label>
                </div>
              </div>
            ))}

            <div className="col-md-6">
              <FormField
                label="Cancellation Notice (Hours)"
                name="cancellationNoticeHours"
                type="number"
                value={settings.bookingSettings.cancellationNoticeHours}
                onChange={(e) =>
                  handleNestedChange("bookingSettings", e)
                }
              />
            </div>

            <div className="col-md-6">
              <FormField
                label="Advance Booking Days"
                name="advanceBookingDays"
                type="number"
                value={settings.bookingSettings.advanceBookingDays}
                onChange={(e) =>
                  handleNestedChange("bookingSettings", e)
                }
              />
            </div>

            <div className="col-md-6">
              <FormField
                label="Minimum Booking Notice (Hours)"
                name="minimumBookingNoticeHours"
                type="number"
                value={
                  settings.bookingSettings.minimumBookingNoticeHours
                }
                onChange={(e) =>
                  handleNestedChange("bookingSettings", e)
                }
              />
            </div>

            <div className="col-md-6">
              <FormField
                label="Slot Interval (Minutes)"
                name="slotIntervalMinutes"
                type="number"
                value={settings.bookingSettings.slotIntervalMinutes}
                onChange={(e) =>
                  handleNestedChange("bookingSettings", e)
                }
              />
            </div>
          </div>
        </Panel>

        {/* SOCIAL LINKS */}

        <Panel
          title="Social Media Links"
          subtitle="Add your business website and social media profiles."
        >
          <div className="row g-3">
            {[
              ["website", "Website URL"],
              ["facebook", "Facebook URL"],
              ["instagram", "Instagram URL"],
              ["youtube", "YouTube URL"],
            ].map(([name, label]) => (
              <div className="col-md-6" key={name}>
                <FormField
                  label={label}
                  name={name}
                  value={settings.socialLinks[name]}
                  onChange={(e) => handleNestedChange("socialLinks", e)}
                  placeholder="https://"
                />
              </div>
            ))}
          </div>
        </Panel>

        {/* NOTIFICATION SETTINGS */}

        <Panel
          title="Notification Settings"
          subtitle="Manage customer notification preferences."
        >
          <div className="row g-3">
            {[
              ["emailNotifications", "Enable Email Notifications"],
              ["bookingConfirmation", "Booking Confirmation Emails"],
              ["bookingCancellation", "Booking Cancellation Emails"],
              ["appointmentReminder", "Appointment Reminder Emails"],
            ].map(([name, label]) => (
              <div className="col-md-6" key={name}>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={name}
                    name={name}
                    checked={Boolean(settings.notificationSettings[name])}
                    onChange={(e) =>
                      handleNestedChange("notificationSettings", e)
                    }
                  />
                  <label className="form-check-label" htmlFor={name}>
                    {label}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* SAVE BUTTON */}

        <div className="d-flex justify-content-end gap-2 mt-4 mb-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={fetchSettings}
            disabled={saving}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Reset
          </button>

          <button
            type="submit"
            className="btn btn-primary px-4"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
