// src/features/vendor/VendorResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function VendorResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

  const navigate = useNavigate();

  // 🟢 جيب الإيميل من localStorage
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

      setMessage("Password updated successfully. You can now login.");

      // 🧹 نظف الإيميل بعد الاستخدام
      localStorage.removeItem("resetEmail");

      setTimeout(() => navigate("/vendor/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const formBg = isDarkMode ? "#666666" : "#ffffff";
  const pageBg = isDarkMode ? "#242625" : "#f0f2f1";
  const textColor = isDarkMode ? "#ffffff" : "#242625";
  const inputBg = isDarkMode ? "#666666" : "#ffffff";
  const inputText = isDarkMode ? "#f9f9f9" : "#242625";
  const messageColor = isDarkMode ? "#f9f9f9" : "#6b7280";

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: pageBg }}>
      <div className="w-full max-w-md mx-auto flex items-center justify-center p-12">
        <div
          className="w-full p-6 rounded-lg shadow transition-colors"
          style={{ backgroundColor: formBg, color: textColor }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>

          {message && (
            <p className="mb-4 text-center" style={{ color: "green" }}>
              {message}
            </p>
          )}
          {error && (
            <p className="mb-4 text-center" style={{ color: "red" }}>
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded focus:ring-2 outline-none text-center"
              style={{ backgroundColor: inputBg, color: inputText }}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white p-3 rounded-lg transition duration-300 ease-in-out
              hover:bg-gray-800 hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            Remembered your password?{" "}
            <span
              className="text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate("/vendor/login")}
            >
              Login here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
