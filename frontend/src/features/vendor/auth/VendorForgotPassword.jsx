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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await axios.post("http://localhost:3000/api/auth/forgot-password", { email });
      setMessage(res.data.message || "Check your email for the reset link!");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
        className={`w-1/2 flex flex-col justify-center items-center p-12 transition-colors duration-500
        ${isDark ? "bg-[var(--div)]" : "bg-[var(--bg)]"}`}
      >
        <h2 className="text-3xl font-bold mb-6 transition-colors duration-500">
          Forgot Password
        </h2>

        {message && (
          <div
            className={`w-full max-w-md p-3 rounded-lg mb-4 text-center transition-colors duration-300 ${
              message.includes("Check") || message.includes("✅")
                ? isDark
                  ? "bg-[var(--success)] bg-opacity-20 text-green-200"
                  : "bg-[var(--success)] bg-opacity-20 text-green-700"
                : isDark
                ? "bg-[var(--error)] bg-opacity-20 text-red-200"
                : "bg-[var(--error)] bg-opacity-20 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            className={`w-full max-w-md p-3 rounded-lg mb-4 text-center transition-colors duration-300 ${
              isDark
                ? "bg-[var(--error)] bg-opacity-20 text-red-200"
                : "bg-[var(--error)] bg-opacity-20 text-red-700"
            }`}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          {/* Email Field */}
          <div className="flex flex-col w-full relative">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300
                  ${
                    isDark
                      ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                      : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                  }`}
                required
              />
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <MdEmail
                  className={`text-xl transition-colors duration-500 ${
                    isDark ? "text-[var(--mid-dark)]" : "text-[var(--light-gray)]"
                  }`}
                />
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg font-semibold transition-all duration-300
            bg-[var(--button)] text-white 
            hover:bg-[var(--button)] hover:text-white 
            hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] 
            disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          {/* Back to Login */}
          <p className="text-center">
            <span
              className={`cursor-pointer transition-colors duration-300 ${
                isDark
                  ? "text-[var(--primary)] hover:text-[var(--primary)]"
                  : "text-[var(--primary)] hover:text-[var(--primary)]"
              } hover:underline`}
              onClick={() => navigate("/vendor/login")}
            >
              Back to Login
            </span>
          </p>
        </form>
      </div>

      {/* Right Section - Info / Image */}
      <div
        className={`w-1/2 flex flex-col justify-center items-center p-12 transition-colors duration-500
        ${isDark ? "bg-[var(--mid-dark)] text-[var(--text)]" : "bg-[var(--div)] text-[var(--text)]"}`}
      >
        <img
          src={isDark ? "/LogoDark.png" : "/logo.png"}
          alt="Qwikko Logo"
          className="h-25 w-80 mb-6 transition-all duration-500"
        />
        <p className="text-xl max-w-md text-center leading-relaxed">
          Don’t worry! Enter your email and we’ll send you a link to reset your password.
        </p>
      </div>
    </div>
  );
}
