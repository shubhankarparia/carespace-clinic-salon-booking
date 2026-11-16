
import React, { useEffect, useState } from "react";

import {
  getMyProfile,
  updateMyProfile
} from "./customerApi";

import "./customer.css";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyProfile();

      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || ""
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your profile. Please log in."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setSuccess("");
    setError("");

    if (!profile.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (profile.phone && !/^[0-9+\-\s]{10,15}$/.test(profile.phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    try {
      setSaving(true);

      const updated = await updateMyProfile(profile);

      setProfile((previous) => ({
        ...previous,
        ...updated
      }));

      setEditing(false);
      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="customer-loading">
        <div className="spinner-border text-primary"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="customer-page">

      <div className="customer-page-heading">
        <div>
          <span className="customer-eyebrow">
            ACCOUNT SETTINGS
          </span>

          <h1>My Profile</h1>

          <p>Manage your personal information.</p>
        </div>

        {!editing && (
          <button
            className="btn customer-primary-btn"
            onClick={() => {
              setEditing(true);
              setSuccess("");
            }}
          >
            <i className="bi bi-pencil-square me-2"></i>
            Edit Profile
          </button>
        )}
      </div>

      {success && (
        <div className="alert alert-success">
          <i className="bi bi-check-circle me-2"></i>
          {success}
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="customer-profile-layout">

        <aside className="customer-profile-sidebar">

          <div className="customer-profile-avatar">
            {profile.name
              ? profile.name.charAt(0).toUpperCase()
              : "U"}
          </div>

          <h3>{profile.name || "Customer"}</h3>

          <p>{profile.email}</p>

          <span className="customer-member-badge">
            <i className="bi bi-person-check me-1"></i>
            Customer Account
          </span>

        </aside>

        <main className="customer-content-card customer-profile-form">

          <div className="customer-card-heading">
            <div>
              <h3>Personal Information</h3>
              <p>Update your account details below.</p>
            </div>
          </div>

          <form onSubmit={handleSave}>

            <div className="row g-3">

              <div className="col-md-6">
                <label className="form-label">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={profile.email}
                  disabled
                />

                <small className="text-muted">
                  Email changes may require account verification.
                </small>
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              <div className="col-12">
                <label className="form-label">
                  Address
                </label>

                <textarea
                  name="address"
                  rows="3"
                  className="form-control"
                  value={profile.address}
                  onChange={handleChange}
                  disabled={!editing}
                ></textarea>
              </div>

              <div className="col-md-4">
                <label className="form-label">City</label>

                <input
                  type="text"
                  name="city"
                  className="form-control"
                  value={profile.city}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">State</label>

                <input
                  type="text"
                  name="state"
                  className="form-control"
                  value={profile.state}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">PIN Code</label>

                <input
                  type="text"
                  name="pincode"
                  className="form-control"
                  value={profile.pincode}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

            </div>

            {editing && (
              <div className="customer-profile-actions">

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setEditing(false);
                    loadProfile();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn customer-primary-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

              </div>
            )}

          </form>

        </main>

      </div>

    </div>
  );
}
