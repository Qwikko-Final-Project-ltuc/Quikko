import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerVendorAPI } from "../VendorAPI2";
import {
  FaShoppingBag,
  FaUser,
  FaEnvelope,
  FaLock,
  FaStore,
  FaPhone,
  FaAlignLeft,
} from "react-icons/fa";

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

  // 🌙 Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  useEffect(() => {
    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format.";
    if (!formData.password.trim()) newErrors.password = "Password is required.";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (!formData.store_name.trim()) newErrors.store_name = "Store name is required.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    else if (!/^\+[1-9]\d{1,14}$/.test(formData.phone))
      newErrors.phone = "Phone must be in E.164 format (e.g. +962799999999).";
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
      console.log("Vendor:", data.user);
      alert("Please check your email to verify your account before logging in.");
      setMessage("✅ Vendor registered successfully!");
      navigate("/vendor/login");
    } catch (err) {
      setMessage("❌ " + (err.message || "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Colors
  const pageBg = isDarkMode ? "#242625" : "#ffffff";
  const rightBg = isDarkMode ? "#242625" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#242625";
  const inputBg = isDarkMode ? "#666666" : "#ffffff";
  const inputText = isDarkMode ? "#ffffff" : "#242625";

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: pageBg }}>
      {/* Left Section */}
      <div
        className="w-1/2 flex flex-col justify-center items-center p-12"
        style={{ backgroundColor: "#000000", color: "#fff" }}
      >
        <h1 className="text-5xl font-extrabold mb-6 flex items-center gap-4">
          <FaShoppingBag className="text-white" /> Qwikko
        </h1>
        <p className="text-xl max-w-md text-center mt-10">
          Welcome to Qwikko! Start your vendor journey with us and grow your
          business. Join our marketplace and reach thousands of customers today.
        </p>
      </div>

      {/* Right Section */}
      <div
        className="w-1/2 flex flex-col justify-center items-center p-12"
        style={{ backgroundColor: rightBg, color: textColor }}
      >
        <h2 className="text-3xl font-bold mb-6">Register Vendor</h2>

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          {[
            { name: "name", icon: FaUser, placeholder: "Full Name" },
            { name: "email", icon: FaEnvelope, placeholder: "Email" },
            { name: "password", icon: FaLock, placeholder: "Password", type: "password" },
            { name: "store_name", icon: FaStore, placeholder: "Store Name" },
            { name: "phone", icon: FaPhone, placeholder: "Phone (e.g. +9627...)" },
          ].map((field) => (
            <div key={field.name} className="relative">
              <input
                type={field.type || "text"}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full border p-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                style={{ backgroundColor: inputBg, color: inputText }}
                required
              />
              <field.icon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {errors[field.name] && (
                <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}

          {/* Description */}
          <div className="relative">
            <textarea
              name="description"
              placeholder="Store Description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border p-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              rows="3"
              style={{ backgroundColor: inputBg, color: inputText }}
            />
            <FaAlignLeft className="absolute right-3 top-3 text-gray-400" />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg transition-colors duration-300 ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-red-600">{message}</p>}

        <p className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/vendor/login")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}
