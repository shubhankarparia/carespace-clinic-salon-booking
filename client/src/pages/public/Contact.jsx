
import { useState } from "react";
import "../../assets/styles/contact.css";

// ==========================================
// API CONFIGURATION
// ==========================================

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5001/api"
).replace(/\/+$/, "");

const CONTACT_API = `${API_BASE_URL}/contact`;

// ==========================================
// CONTACT COMPONENT
// ==========================================

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ========================================
  // HANDLE INPUT CHANGE
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSubmitted(false);
  };

  // ========================================
  // SUBMIT CONTACT FORM
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitted(false);

    // Prevent duplicate submissions.
    if (loading) return;

    try {
      setLoading(true);

      const response = await fetch(CONTACT_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
          result.error ||
          "Unable to submit your message. Please try again."
        );
      }

      // Success: clear form only after backend confirms.
      setSubmitted(true);

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

    } catch (err) {
      console.error("Contact Form Error:", err);

      setError(
        err.message ||
        "Something went wrong. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // UI
  // ========================================

  return (
    <section className="section-space">
      <div className="container">

        {/* PAGE HEADING */}

        <div className="page-heading">
          <span className="eyebrow">GET IN TOUCH</span>

          <h1 className="page-title">
            We would love to hear from you.
          </h1>

          <p className="text-muted">
            Have a question about our services or your appointment?
            Send us a message.
          </p>
        </div>

        <div className="row g-5 mt-2">

          {/* =================================
              CONTACT INFORMATION
          ================================= */}

          <div className="col-lg-5">
            <div className="contact-info">

              <h3>Let's talk.</h3>

              <p>
                Our team is here to help with your questions
                and appointment enquiries.
              </p>

              <div className="contact-item">
                <span>
                  <i className="bi bi-envelope" />
                </span>

                <div>
                  <small>Email us</small>
                  <strong>hello@carespace.example</strong>
                </div>
              </div>

              <div className="contact-item">
                <span>
                  <i className="bi bi-telephone" />
                </span>

                <div>
                  <small>Call us</small>
                  <strong>+91 00000 00000</strong>
                </div>
              </div>

              <div className="contact-item">
                <span>
                  <i className="bi bi-clock" />
                </span>

                <div>
                  <small>Working hours</small>
                  <strong>
                    Monday – Saturday, 9 AM – 7 PM
                  </strong>
                </div>
              </div>

            </div>
          </div>

          {/* =================================
              CONTACT FORM
          ================================= */}

          <div className="col-lg-7">

            <form
              className="contact-form"
              onSubmit={handleSubmit}
            >

              <h3>Send us a message</h3>

              {/* SUCCESS MESSAGE */}

              {submitted && (
                <div
                  className="alert alert-success"
                  role="alert"
                >
                  <i className="bi bi-check-circle-fill me-2" />

                  Thank you! Your message has been submitted
                  successfully. Our team will contact you soon.
                </div>
              )}

              {/* ERROR MESSAGE */}

              {error && (
                <div
                  className="alert alert-danger"
                  role="alert"
                >
                  <i className="bi bi-exclamation-circle-fill me-2" />

                  {error}
                </div>
              )}

              <div className="row g-3">

                {/* NAME */}

                <div className="col-md-6">
                  <label className="form-label">
                    Your name
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    required
                    disabled={loading}
                  />
                </div>

                {/* EMAIL */}

                <div className="col-md-6">
                  <label className="form-label">
                    Email address
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    maxLength={150}
                    autoComplete="email"
                    required
                    disabled={loading}
                  />
                </div>

                {/* SUBJECT */}

                <div className="col-12">
                  <label className="form-label">
                    Subject
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    minLength={3}
                    maxLength={200}
                    required
                    disabled={loading}
                  />
                </div>

                {/* MESSAGE */}

                <div className="col-12">
                  <label className="form-label">
                    Message
                  </label>

                  <textarea
                    className="form-control"
                    name="message"
                    rows="5"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Write your message..."
                    minLength={10}
                    maxLength={5000}
                    required
                    disabled={loading}
                  />
                </div>

                {/* SUBMIT BUTTON */}

                <div className="col-12">

                  <button
                    className="btn btn-primary btn-lg"
                    type="submit"
                    disabled={loading}
                  >

                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />

                        Sending...
                      </>
                    ) : (
                      <>
                        Send message

                        <i className="bi bi-send ms-2" />
                      </>
                    )}

                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>

      </div>
    </section>
  );
}
