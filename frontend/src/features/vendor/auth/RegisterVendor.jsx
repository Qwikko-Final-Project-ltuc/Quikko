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
      const data = await registerVendorAPI(formData);
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
  <div className={`flex flex-col md:flex-row min-h-screen transition-colors duration-500 ${isDark ? "bg-[var(--bg)] text-[var(--text)]" : "bg-[var(--bg)] text-[var(--text)]"}`}>

    {/* Left Section - Register Form */}
    <div className={`w-full md:w-1/2 flex flex-col justify-center items-center p-4 md:p-12 transition-colors duration-500 ${isDark ? "bg-[var(--div)]" : "bg-[var(--bg)]"}`}>
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 transition-colors duration-500">Register Vendor</h2>

      {message && (
        <div className={`w-full max-w-md p-3 rounded-lg mb-4 text-center transition-colors duration-300 text-sm sm:text-base ${isDark ? "bg-[var(--error)] bg-opacity-20 text-red-200" : "bg-[var(--error)] bg-opacity-20 text-red-700"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        {/* Full Name */}
        <div className="flex flex-col w-full relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300 text-sm sm:text-base ${isDark ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]" : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"}`}
            />
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none"><FaUser className="text-xl" /></span>
          </div>
          {errors.name && <p className="text-sm mt-1 text-[var(--error)]">{errors.name}</p>}
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
              className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300 text-sm sm:text-base ${isDark ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]" : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"}`}
            />
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none"><FaEnvelope className="text-xl" /></span>
          </div>
          {errors.email && <p className="text-sm mt-1 text-[var(--error)]">{errors.email}</p>}
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
              className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300 text-sm sm:text-base ${isDark ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]" : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"}`}
            />
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none"><FaLock className="text-xl" /></span>
          </div>
          {errors.password && <p className="text-sm mt-1 text-[var(--error)]">{errors.password}</p>}
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
              className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300 text-sm sm:text-base ${isDark ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]" : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"}`}
            />
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none"><FaStore className="text-xl" /></span>
          </div>
          {errors.store_name && <p className="text-sm mt-1 text-[var(--error)]">{errors.store_name}</p>}
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
              className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300 text-sm sm:text-base ${isDark ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]" : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"}`}
            />
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none"><FaPhone className="text-xl" /></span>
          </div>
          {errors.phone && <p className="text-sm mt-1 text-[var(--error)]">{errors.phone}</p>}
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
              className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300 resize-none text-sm sm:text-base
                ${isDark ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]" : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"}`}
            />
            <span className="absolute inset-y-0 right-3 flex items-start pt-3 pointer-events-none">
              <FaAlignLeft className={`text-xl transition-colors duration-500 ${isDark ? "text-[var(--mid-dark)]" : "text-[var(--light-gray)]"}`} />
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 rounded-lg font-semibold transition-all duration-300 bg-[var(--button)] text-white hover:shadow-lg"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="text-center mt-6 text-[var(--light-gray)] text-sm sm:text-base">
        Already have an account?{" "}
        <span className="cursor-pointer font-medium text-[var(--primary)] hover:underline" onClick={() => navigate("/vendor/login")}>
          Login here
        </span>
      </p>
    </div>

    {/* Right Section - Welcome */}
    <div className={`w-full md:w-1/2 flex flex-col justify-center items-center p-4 md:p-12 transition-colors duration-500 ${isDark ? "bg-[var(--mid-dark)] text-[var(--text)]" : "bg-[var(--div)] text-[var(--text)]"}`}>
      <img src={isDark ? "/LogoDark.png" : "/logo.png"} alt="Qwikko Logo" className="h-20 sm:h-25 w-64 sm:w-80 mb-6 transition-all duration-500" />
      <p className="text-base sm:text-xl max-w-md text-center leading-relaxed">
        Welcome to Qwikko! Start your vendor journey with us and grow your business. Join our marketplace and reach thousands of customers today.
      </p>
    </div>
  </div>
);

}
