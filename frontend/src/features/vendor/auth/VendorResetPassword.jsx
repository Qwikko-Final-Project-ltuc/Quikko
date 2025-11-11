import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function VendorResetPassword() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(localStorage.getItem("theme") === "dark");

  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await axios.post("http://localhost:3000/api/auth/reset-password", {
        email,
        newPassword: password,
      });
      setMessage("✅ Password updated successfully. You can now login.");
      localStorage.removeItem("resetEmail");
      setTimeout(() => navigate("/vendor/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "❌ Failed to reset password");
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
      {/* Left Section - Reset Password Form */}
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
            <h2 className="text-3xl font-bold mb-2 transition-colors duration-500">
              Reset Password
            </h2>
            <p
              className={`text-lg transition-colors duration-500 ${
                isDark ? "text-[var(--light-gray)]" : "text-[var(--light-gray)]"
              }`}
            >
              Enter your new password to access your account
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div
              className={`w-full p-4 rounded-lg mb-6 text-center transition-colors duration-300 ${
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
              className={`w-full p-4 rounded-lg mb-6 text-center transition-colors duration-300 ${
                isDark
                  ? "bg-red-900 bg-opacity-20 text-red-200 border border-red-800"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              {error}
            </div>
          )}

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col w-full">
              <label
                className={`mb-2 font-medium transition-colors duration-300
                  ${isDark ? "text-[var(--text)]" : "text-[var(--text)]"}`}
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full border pl-4 pr-12 py-3 rounded-lg focus:outline-none transition-all duration-300
                    ${
                      isDark
                        ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                        : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                    }`}
                  required
                />
                <span className="absolute inset-y-0 right-3 flex items-center">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className={`p-1 transition-colors duration-300 ${
                      isDark
                        ? "text-[var(--mid-dark)] hover:text-[var(--text)]"
                        : "text-[var(--light-gray)] hover:text-[var(--text)]"
                    }`}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-3 rounded-lg font-semibold transition-all duration-300 relative
                bg-[var(--button)] text-white 
                hover:bg-[var(--button)] hover:text-white 
                hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] 
                disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed disabled:shadow-none`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-8">
            <button
              type="button"
              className={`flex items-center justify-center mx-auto text-sm font-medium transition-all duration-300
                ${isDark 
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
            alt="Vendor Logo"
            className="h-25 w-80 mb-8 mx-auto transition-all duration-500"
          />
          <p className="text-xl mb-8 leading-relaxed">
            Update your password securely and get back to managing your store on <b>Qwikko Vendor</b>.
          </p>
        </div>
      </div>
    </div>
  );
}
