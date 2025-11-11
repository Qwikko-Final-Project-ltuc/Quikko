// src/features/vendor/VendorLogin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiStar, FiAward } from "react-icons/fi";
import { MdEmail, MdPrivacyTip } from "react-icons/md";
import { FaLock, FaRocket } from "react-icons/fa";

export default function VendorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        const userRole = payload.role;

        if (userRole === "vendor") {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", userRole);
          navigate("/vendor/dashboard");
        } else {
          setMessage("❌ Access denied. This login is for vendors only.");
        }
      } else {
        setMessage("❌ " + (data.error || "Login failed"));
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong.");
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

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 xl:gap-12">
          
          {/* Left Section - Welcome */}
          <div className="w-full lg:w-2/5 flex flex-col justify-center items-center text-center space-y-3 lg:space-y-5">
            <div className="space-y-1 lg:space-y-2">
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-[var(--text)] leading-tight">
                Welcome Back, Vendor!
              </h1>
            </div>
            <img
              src={isDark ? "/LogoDark.png" : "/logo.png"}
              alt="Vendor Logo"
              className="h-16 sm:h-20 lg:h-24 xl:h-28 w-auto relative z-10"
            />
            <p className="hidden lg:block max-w-xs sm:max-w-sm text-sm text-[var(--light-gray)] leading-relaxed font-medium">
              Log in to manage your store, track sales, and keep your products up to date.
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-1">
              {['Secure', 'Fast', 'Reliable'].map((feature, index) => (
                <div key={index} className="flex items-center gap-1 text-xs text-[var(--light-gray)]">
                  <FiStar className="text-[var(--button)] text-xs" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Login Form */}
          <div className="w-full lg:w-3/5 max-w-xs sm:max-w-sm md:max-w-md">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl blur opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
              <div className="relative bg-[var(--bg)]/95 backdrop-blur-lg border border-[var(--border)]/30 rounded-xl p-4 sm:p-5 shadow-lg transform transition-all duration-500 hover:shadow-xl">
                
                {message && (
                  <div className={`p-2 rounded-lg text-center font-semibold backdrop-blur-sm transform transition-all duration-500 ${
                    message.includes("❌")
                      ? "bg-[var(--error)]/20 text-[var(--error)] border border-[var(--error)]/30"
                      : "bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30"
                  }`}>
                    {message}
                  </div>
                )}

                <form onSubmit={handleLogin} className="relative space-y-3">
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--text)]">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[var(--bg)]/50 text-[var(--text)] border border-[var(--border)]/50 rounded-lg pl-7 pr-2 py-2 focus:border-[var(--button)] focus:ring-1 focus:ring-[var(--button)]/10 outline-none transition-all duration-300 backdrop-blur-sm text-xs sm:text-sm"
                        required
                      />
                      <MdEmail className="absolute inset-y-0 left-2 flex items-center text-[var(--light-gray)]" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[var(--text)]">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[var(--bg)]/50 text-[var(--text)] border border-[var(--border)]/50 rounded-lg pl-7 pr-7 py-2 focus:border-[var(--button)] focus:ring-1 focus:ring-[var(--button)]/10 outline-none transition-all duration-300 backdrop-blur-sm text-xs sm:text-sm"
                        required
                      />
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-[var(--light-gray)] hover:text-[var(--text)]"
                      >
                        {showPassword ? <FiEyeOff size={10} /> : <FiEye size={10} />}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full relative px-3 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-[var(--button)] to-[var(--primary)] border-0 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-1">
                      {loading ? "Logging in..." : <> <FaRocket className="w-3 h-3" /> Login</>}
                    </span>
                  </button>

                  {/* Forgot Password */}
                  <p className="text-center text-xs sm:text-sm">
                    <span
                      className="cursor-pointer font-semibold text-[var(--button)] hover:text-purple-400"
                      onClick={() => navigate("/vendor/forgot-password")}
                    >
                      Forgot Password?
                    </span>
                  </p>
                </form>

                {/* Sign Up */}
                <p className="text-center mt-4 text-xs sm:text-sm">
                  New here?{" "}
                  <span
                    className="cursor-pointer font-bold text-[var(--button)] hover:text-purple-400"
                    onClick={() => navigate("/vendor/register")}
                  >
                    Create Account <FiAward className="inline w-3 h-3" />
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-15px) translateX(5px); }
          66% { transform: translateY(10px) translateX(-5px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.05; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.02); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
