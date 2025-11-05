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
      className={`flex min-h-screen justify-center items-center transition-colors duration-500
      ${isDark ? "bg-[var(--bg)] text-[var(--text)]" : "bg-[var(--bg)] text-[var(--text)]"}`}
    >
      {/* Reset Password Form */}
      <div
        className={`w-full max-w-md flex flex-col justify-center items-center p-12 rounded-2xl shadow-xl transition-colors duration-500
        ${isDark ? "bg-[var(--div)]" : "bg-[var(--bg)]"}`}
      >
        <h2 className="text-3xl font-bold mb-6 transition-colors duration-500">
          Reset Password
        </h2>

        {/* Message */}
        {message && (
          <div
            className={`w-full p-3 rounded-lg mb-4 text-center transition-colors duration-300 ${
              message.includes("✅")
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
            className={`w-full p-3 rounded-lg mb-4 text-center transition-colors duration-300 ${
              isDark
                ? "bg-[var(--error)] bg-opacity-20 text-red-200"
                : "bg-[var(--error)] bg-opacity-20 text-red-700"
            }`}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* Password Field */}
          <div className="flex flex-col w-full relative">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300
                  ${
                    isDark
                      ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                      : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
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
            className={`w-full p-3 rounded-lg font-semibold transition-all duration-300
            bg-[var(--button)] text-white 
            hover:bg-[var(--button)] hover:text-white 
            hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] 
            disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p
          className={`text-center mt-6 transition-colors duration-300 ${
            isDark ? "text-[var(--light-gray)]" : "text-[var(--light-gray)]"
          }`}
        >
          Remembered your password?{" "}
          <span
            className={`cursor-pointer font-medium transition-colors duration-300 ${
              isDark
                ? "text-[var(--primary)] hover:text-[var(--primary)]"
                : "text-[var(--primary)] hover:text-[var(--primary)]"
            } hover:underline`}
            onClick={() => navigate("/vendor/login")}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}
