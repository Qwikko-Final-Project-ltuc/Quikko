import React, { useState } from "react";
import axios from "axios";

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ success: null, message: "" });

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: null, message: "" });

    if (!form.name || !form.email || !form.subject || !form.message) {
      setStatus({ success: false, message: "Please fill all fields." });
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/customers/contactUs", form);
      setStatus({ success: true, message: "Message sent successfully!" });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setStatus({
        success: false,
        message: error.response?.data?.message || "Failed to send message.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-start justify-center bg-[var(--bg)] py-20 px-30 gap-8 md:gap-12">

      {/* القسم الأيسر: العنوان والجملة */}
      <div className="md:w-1/2 flex flex-col justify-start md:justify-center md:pr-6">
      <br/><br/><br/><br/>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">Contact Us</h1>
        <br/>
        <p className="text-[var(--text)] text-lg md:text-xl font-semibold leading-relaxed">
          We’d love to hear from you!<br/>
          Send us your message and we’ll get back to you soon.
        </p>
      </div>

      {/* القسم الأيمن: الفورم */}
      <div className="md:w-1/2 w-full">
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-4  rounded-2xl p-6 md:p-8"
        >
          {status.message && (
            <p
              className={`text-center font-medium ${
                status.success ? "text-[var(--success)]" : "text-[var(--error)]"
              }`}
            >
              {status.message}
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--button)] focus:border-[var(--button)] outline-none"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your Email"
              className="w-full bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--button)] focus:border-[var(--button)] outline-none"
            />
          </div>

          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Subject"
            className="w-full bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--button)] focus:border-[var(--button)] outline-none"
          />

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Your Message"
            rows={5}
            className="w-full bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--button)] focus:border-[var(--button)] outline-none resize-none"
          />

          <div className="text-center mt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-semibold text-[var(--bg)] bg-[var(--button)] border border-[var(--button)] hover:bg-[var(--hover)] hover:text-[var(--text)] hover:border-[var(--hover)] transition-all duration-300"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
