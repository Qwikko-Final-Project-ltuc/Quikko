// src/features/vendor/RegisterVendor.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerVendorAPI } from "../VendorAPI2";
import { FaUser, FaEnvelope, FaLock, FaStore, FaPhone, FaAlignLeft, FaRocket } from "react-icons/fa";
import { FiEye, FiEyeOff, FiStar, FiAward } from "react-icons/fi";

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
  const [showPassword, setShowPassword] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  useEffect(() => {
    const handleStorageChange = () => setIsDarkMode(localStorage.getItem("theme") === "dark");
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
    <div className="min-h-screen bg-[var(--bg)] relative overflow-hidden flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {!isDark && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/10 animate-pulse-slow"></div>
        )}
        <div className="absolute top-10 left-5 w-48 h-48 sm:w-72 sm:h-72 bg-[var(--button)]/10 rounded-full blur-2xl sm:blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-10 right-5 w-52 h-52 sm:w-80 sm:h-80 bg-[var(--primary)]/10 rounded-full blur-2xl sm:blur-3xl animate-float-slow" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--success)]/5 rounded-full blur-2xl sm:blur-3xl animate-pulse-slow" style={{animationDelay: '4s'}}></div>
        {!isDark && (
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}></div>
        )}
      </div>

      {/* Floating Particles */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-[var(--button)]/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${4 + Math.random() * 4}s`
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

        {/* Left Section - Form */}
        <div className="w-full lg:w-3/5 max-w-md mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl blur opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
            <div className="relative bg-[var(--bg)]/95 backdrop-blur-lg border border-[var(--border)]/30 rounded-xl p-6 shadow-lg transform transition-all duration-500 hover:shadow-xl">

              {message && (
                <div className={`mb-3 p-2 rounded-lg text-center font-semibold backdrop-blur-sm transform transition-all duration-500 ${
                  message.includes("✅") ? "bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30" : "bg-[var(--error)]/20 text-[var(--error)] border border-[var(--error)]/30"
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg)]/50 text-[var(--text)] border border-[var(--border)]/50 rounded-lg pl-10 pr-2 py-2 focus:border-[var(--button)] focus:ring-1 focus:ring-[var(--button)]/10 outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                  />
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--light-gray)]"/>
                  {errors.name && <p className="text-xs text-[var(--error)] mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg)]/50 text-[var(--text)] border border-[var(--border)]/50 rounded-lg pl-10 pr-2 py-2 focus:border-[var(--button)] focus:ring-1 focus:ring-[var(--button)]/10 outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                  />
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--light-gray)]"/>
                  {errors.email && <p className="text-xs text-[var(--error)] mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg)]/50 text-[var(--text)] border border-[var(--border)]/50 rounded-lg pl-10 pr-10 py-2 focus:border-[var(--button)] focus:ring-1 focus:ring-[var(--button)]/10 outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                  />
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--light-gray)]"/>
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--light-gray)] hover:text-[var(--text)]"
                  >
                    {showPassword ? <FiEyeOff size={18}/> : <FiEye size={18}/>}
                  </button>
                  {errors.password && <p className="text-xs text-[var(--error)] mt-1">{errors.password}</p>}
                </div>

                {/* Store Name */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Store Name"
                    name="store_name"
                    value={formData.store_name}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg)]/50 text-[var(--text)] border border-[var(--border)]/50 rounded-lg pl-10 pr-2 py-2 focus:border-[var(--button)] focus:ring-1 focus:ring-[var(--button)]/10 outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                  />
                  <FaStore className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--light-gray)]"/>
                  {errors.store_name && <p className="text-xs text-[var(--error)] mt-1">{errors.store_name}</p>}
                </div>

                {/* Phone */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Phone (e.g. +9627...)"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[var(--bg)]/50 text-[var(--text)] border border-[var(--border)]/50 rounded-lg pl-10 pr-2 py-2 focus:border-[var(--button)] focus:ring-1 focus:ring-[var(--button)]/10 outline-none transition-all duration-300 backdrop-blur-sm text-sm"
                  />
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--light-gray)]"/>
                  {errors.phone && <p className="text-xs text-[var(--error)] mt-1">{errors.phone}</p>}
                </div>

                {/* Description */}
                <div className="relative">
                  <textarea
                    name="description"
                    placeholder="Store Description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-[var(--bg)]/50 text-[var(--text)] border border-[var(--border)]/50 rounded-lg pl-10 pr-2 py-2 focus:border-[var(--button)] focus:ring-1 focus:ring-[var(--button)]/10 outline-none transition-all duration-300 backdrop-blur-sm text-sm resize-none"
                  />
                  <FaAlignLeft className="absolute left-3 top-3 text-[var(--light-gray)]"/>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative px-3 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-[var(--button)] to-[var(--primary)] border-0 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? <span>Registering...</span> : <><FaRocket/> Sign Up</>}
                  </span>
                </button>

                {/* Login Link */}
                <p className="text-center text-xs mt-2">
                  Already have an account?{" "}
                  <span className="cursor-pointer font-bold text-[var(--button)] hover:text-[var(--primary)]" onClick={() => navigate("/vendor/login")}>
                    Login <FiAward className="inline"/>
                  </span>
                </p>

              </form>
            </div>
          </div>
        </div>

        {/* Right Section - Welcome */}
        <div className="w-full lg:w-2/5 flex flex-col justify-center items-center text-center p-8">
          <img src={isDark ? "/LogoDark.png" : "/logo.png"} alt="Qwikko Logo" className="h-20 w-auto mb-4"/>
          <h2 className="text-2xl font-bold mb-2">Join Qwikko as a Vendor</h2>
          <p className="text-sm text-[var(--light-gray)] leading-relaxed">
            Create your store, showcase your products, and connect with thousands of customers across the platform.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['Exclusive Deals', 'Fast Delivery', '24/7 Support'].map((feature, index) => (
              <div key={index} className="flex items-center gap-1 text-xs text-[var(--light-gray)]">
                <FiStar className="text-[var(--button)] text-xs"/>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes float {0%,100%{transform:translateY(0px) rotate(0deg);}50%{transform:translateY(-10px) rotate(2deg);}}
        @keyframes float-slow {0%,100%{transform:translateY(0px) translateX(0px);}33%{transform:translateY(-15px) translateX(5px);}66%{transform:translateY(10px) translateX(-5px);}}
        @keyframes pulse-slow {0%,100%{opacity:0.05;transform:scale(1);}50%{opacity:0.15;transform:scale(1.02);}}
        .animate-float {animation: float 3s ease-in-out infinite;}
        .animate-float-slow {animation: float-slow 8s ease-in-out infinite;}
        .animate-pulse-slow {animation: pulse-slow 6s ease-in-out infinite;}
      `}</style>
    </div>
  );
}
