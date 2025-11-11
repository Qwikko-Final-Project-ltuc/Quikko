// src/features/vendor/RegisterVendor.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerVendorAPI } from "../VendorAPI2";
import { FaUser, FaEnvelope, FaLock, FaStore, FaPhone, FaAlignLeft } from "react-icons/fa";

export default function RegisterVendor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    store_name: "",
    phone: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  useEffect(() => {
    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format.";
    if (!formData.password.trim()) newErrors.password = "Password is required.";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    if (!formData.store_name.trim()) newErrors.store_name = "Store name is required.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    else if (!/^\+[1-9]\d{1,14}$/.test(formData.phone)) newErrors.phone = "Phone must be in E.164 format (e.g. +962799999999).";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setLoading(true);
    try {
      await registerVendorAPI(formData);
      alert("Please check your email to verify your account before logging in.");
      setMessage("✅ Vendor registered successfully!");
      navigate("/vendor/login");
    } catch (err) {
      setMessage("❌ " + (err.message || "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  const isDark = isDarkMode;

  return (
    <div
      className={`flex min-h-screen transition-colors duration-500 ${
        isDark ? "bg-[var(--bg)] text-[var(--text)]" : "bg-[var(--bg)] text-[var(--text)]"
      }`}
    >
      {/* Left Section - Vendor Signup Form */}
      <div
        className={`w-1/2 flex flex-col justify-center items-center p-12 transition-colors duration-500 ${
          isDark ? "bg-[var(--div)]" : "bg-[var(--bg)]"
        }`}
      >
        <h2 className={`text-3xl font-bold mb-6 transition-colors duration-500`}>
          Vendor Signup
        </h2>

        {message && (
          <div
            className={`w-full max-w-md p-3 rounded-lg mb-4 text-center transition-colors duration-300 ${
              isDark
                ? "bg-[var(--error)] bg-opacity-20 text-red-200"
                : "bg-[var(--error)] bg-opacity-20 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          {/* Name */}
          <div className="flex flex-col w-full relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300
                  ${
                    isDark
                      ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                      : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                  }`}
                style={{ color: "var(--mid-dark)" }}
              />
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <FaUser
                  className={`text-xl transition-colors duration-500 ${
                    isDark ? "text-[var(--mid-dark)]" : "text-[var(--light-gray)]"
                  }`}
                />
              </span>
            </div>
            <div className="h-5">
              {errors.name && (
                <p
                  className={`text-sm mt-1 transition-colors duration-300 ${
                    isDark ? "text-[var(--error)]" : "text-[var(--error)]"
                  }`}
                >
                  {errors.name}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col w-full relative">
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300
                  ${
                    isDark
                      ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                      : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                  }`}
                style={{ color: "var(--mid-dark)" }}
              />
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <FaEnvelope
                  className={`text-xl transition-colors duration-500 ${
                    isDark ? "text-[var(--mid-dark)]" : "text-[var(--light-gray)]"
                  }`}
                />
              </span>
            </div>
            <div className="h-5">
              {errors.email && (
                <p
                  className={`text-sm mt-1 transition-colors duration-300 ${
                    isDark ? "text-[var(--error)]" : "text-[var(--error)]"
                  }`}
                >
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col w-full relative">
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300
                  ${
                    isDark
                      ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                      : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                  }`}
                style={{ color: "var(--mid-dark)" }}
              />
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <FaLock
                  className={`text-xl transition-colors duration-500 ${
                    isDark ? "text-[var(--mid-dark)]" : "text-[var(--light-gray)]"
                  }`}
                />
              </span>
            </div>
            <div className="h-5">
              {errors.password && (
                <p
                  className={`text-sm mt-1 transition-colors duration-300 ${
                    isDark ? "text-[var(--error)]" : "text-[var(--error)]"
                  }`}
                >
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          {/* Store Name */}
          <div className="flex flex-col w-full relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Store Name"
                name="store_name"
                value={formData.store_name}
                onChange={handleChange}
                className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300
                  ${
                    isDark
                      ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                      : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                  }`}
                style={{ color: "var(--mid-dark)" }}
              />
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <FaStore
                  className={`text-xl transition-colors duration-500 ${
                    isDark ? "text-[var(--mid-dark)]" : "text-[var(--light-gray)]"
                  }`}
                />
              </span>
            </div>
            <div className="h-5">
              {errors.store_name && (
                <p
                  className={`text-sm mt-1 transition-colors duration-300 ${
                    isDark ? "text-[var(--error)]" : "text-[var(--error)]"
                  }`}
                >
                  {errors.store_name}
                </p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col w-full relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Phone (e.g. +9627...)"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300
                  ${
                    isDark
                      ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                      : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                  }`}
                style={{ color: "var(--mid-dark)" }}
              />
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <FaPhone
                  className={`text-xl transition-colors duration-500 ${
                    isDark ? "text-[var(--mid-dark)]" : "text-[var(--light-gray)]"
                  }`}
                />
              </span>
            </div>
            <div className="h-5">
              {errors.phone && (
                <p
                  className={`text-sm mt-1 transition-colors duration-300 ${
                    isDark ? "text-[var(--error)]" : "text-[var(--error)]"
                  }`}
                >
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col w-full relative">
            <div className="relative">
              <textarea
                name="description"
                placeholder="Store Description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300 resize-none
                  ${
                    isDark
                      ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                      : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                  }`}
                style={{ color: "var(--mid-dark)" }}
              />
              <span className="absolute inset-y-0 right-3 flex items-start pt-3 pointer-events-none">
                <FaAlignLeft
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
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        {/* Login Link */}
        <p
          className={`text-center mt-6 transition-colors duration-300 ${
            isDark ? "text-[var(--light-gray)]" : "text-[var(--light-gray)]"
          }`}
        >
          Already have an account?{" "}
          <span
            className={`cursor-pointer font-medium transition-colors duration-300 ${
              isDark
                ? "text-[var(--primary)] hover:text-[var(--primary)]"
                : "text-[var(--primary)] hover:text-[var(--primary)]"
            } hover:underline`}
            onClick={() => navigate("/vendor/login")}
          >
            Login
          </span>
        </p>
      </div>

      {/* Right Section - Welcome */}
      <div
        className={`w-1/2 flex flex-col justify-center items-center p-12 transition-colors duration-500 ${
          isDark ? "bg-[var(--mid-dark)] text-[var(--text)]" : "bg-[var(--div)] text-[var(--text)]"
        }`}
      >
        <img
          src={isDark ? "/LogoDark.png" : "/logo.png"}
          alt="Qwikko Logo"
          className="h-25 w-80 mb-6 transition-all duration-500"
        />
        <p className="text-xl max-w-md text-center leading-relaxed">
          Join Qwikko as a vendor today! Create your store, showcase your
          products, and connect with thousands of customers across the platform.
        </p>
      </div>
    </div>
  );
}
