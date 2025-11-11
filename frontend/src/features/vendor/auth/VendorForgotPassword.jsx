// src/features/vendor/VendorForgotPassword.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdEmail } from "react-icons/md";

export default function VendorForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(localStorage.getItem("theme") === "dark");
  const navigate = useNavigate();

  // إرسال الإيميل إلى السيرفر
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await axios.post("http://localhost:3000/api/auth/forgot-password", { email });
      setMessage(res.data.message || "Check your email for the reset link!");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // تحديث الثيم عند تغييره
  useEffect(() => {
    const handleStorageChange = () => {
      setIsDark(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div
      className={`flex min-h-screen transition-colors duration-500
        ${isDark ? "bg-[var(--bg)] text-[var(--text)]" : "bg-[var(--bg)] text-[var(--text)]"}`}
    >
      {/* Left Section - Forgot Password Form */}
      <div
        className={`w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 transition-colors duration-500 relative
          ${isDark ? "bg-[var(--div)]" : "bg-[var(--bg)]"}`}
      >
        {/* Decorative Top Border */}
        <div
          className={`absolute top-0 left-0 w-full h-1 transition-colors duration-500
            ${isDark ? "bg-[var(--button)]" : "bg-[var(--button)]"}`}
        ></div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-2 transition-colors duration-500`}>
              Forgot Password
            </h2>
            <p
              className={`text-lg transition-colors duration-500 ${
                isDark ? "text-[var(--light-gray)]" : "text-[var(--light-gray)]"
              }`}
            >
              Enter your email to reset your password
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div
              className={`w-full p-4 rounded-lg mb-6 text-center transition-all duration-300 ${
                isDark
                  ? "bg-[var(--success)] bg-opacity-20 text-green-200 border border-green-800"
                  : "bg-[var(--success)] bg-opacity-20 text-green-700 border border-green-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              className={`w-full p-4 rounded-lg mb-6 text-center transition-all duration-300 ${
                isDark
                  ? "bg-red-900 bg-opacity-20 text-red-200 border border-red-800"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              {error}
            </div>
          )}

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="flex flex-col w-full">
              <label
                className={`mb-2 font-medium transition-colors duration-300 ${
                  isDark ? "text-[var(--text)]" : "text-[var(--text)]"
                }`}
              >
                Email Address
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-500 ${
                    isDark ? "text-[var(--mid-dark)]" : "text-[var(--light-gray)]"
                  }`}
                >
                  <MdEmail className="text-xl" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-all duration-300
                    ${
                      isDark
                        ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--mid-dark)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                        : "bg-[var(--textbox)] border-[var(--border)] text-[var(--mid-dark)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                    }`}
                  required
                />
              </div>
            </div>

            {/* Reset Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-3 rounded-lg font-semibold transition-all duration-300 relative
                bg-[var(--button)] text-white 
                hover:bg-[var(--button)] hover:text-white 
                hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] 
                disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed disabled:shadow-none`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending Reset Link...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-8">
            <button
              type="button"
              className={`flex items-center justify-center mx-auto text-sm font-medium transition-all duration-300
                ${
                  isDark
                    ? "text-[var(--primary)] hover:text-[var(--primary)]"
                    : "text-[var(--primary)] hover:text-[var(--primary)]"
                } hover:underline`}
              onClick={() => navigate("/vendor/login")}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Login
            </button>
          </div>

          {/* Additional Help */}
          <div
            className={`mt-8 p-4 rounded-lg text-center transition-colors duration-300 ${
              isDark ? "bg-[var(--textbox)]" : "bg-[var(--textbox)]"
            }`}
          >
            <p
              className={`text-sm transition-colors duration-300 ${
                isDark ? "text-[var(--light-gray)]" : "text-[var(--light-gray)]"
              }`}
            >
              Can't find the email? Check your spam folder or contact support.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div
        className={`hidden lg:flex w-1/2 flex-col justify-center items-center p-12 transition-colors duration-500
          ${isDark ? "bg-[var(--mid-dark)] text-[var(--text)]" : "bg-[var(--textbox)] text-[var(--text)]"}`}
      >
        <div className="text-center max-w-lg">
          <img
            src={isDark ? "/LogoDark.png" : "/logo.png"}
            alt="Qwikko Logo"
            className="h-25 w-80 mb-8 mx-auto transition-all duration-500"
          />

          <p className="text-xl mb-8 leading-relaxed">
            Don't worry! We'll send you a link to reset your password and get you back to managing your store on <b>Qwikko Vendor</b>.
          </p>
        </div>
      </div>
    </div>
  );
}
