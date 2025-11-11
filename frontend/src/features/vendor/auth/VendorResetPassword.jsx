import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaLock, FaArrowLeft, FaRocket } from "react-icons/fa";

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
    <div className={`min-h-screen bg-[var(--bg)] relative overflow-hidden flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8`}>
      
      {/* Animated Background */}
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

      {/* Form Section */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8">
        
        {/* Left Side - Info & Logo */}
        <div className="w-full lg:w-2/5 flex flex-col items-center text-center space-y-5">
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text)]">Reset Password</h1>
          <img
            src={isDark ? "/LogoDark.png" : "/logo.png"}
            alt="Vendor Logo"
            className="h-20 w-auto"
          />
          <p className="text-sm text-[var(--light-gray)] max-w-xs">
            Enter your new password to securely access your vendor account and continue managing your store.
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-3/5 max-w-md relative group">
          {/* Glow Effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl blur opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
          
          <div className="relative bg-[var(--bg)]/95 backdrop-blur-lg border border-[var(--border)]/30 rounded-xl p-5 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-2 rounded-lg text-center text-[var(--error)] bg-[var(--error)]/20 border border-[var(--error)]/30">
                  {error}
                </div>
              )}
              {message && (
                <div className="p-2 rounded-lg text-center text-green-600 bg-green-100 border border-green-200">
                  {message}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-semibold">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[var(--bg)]/50 text-[var(--text)] border border-[var(--border)]/50 rounded-lg pl-7 pr-10 py-2 focus:border-[var(--button)] focus:ring-1 focus:ring-[var(--button)]/10 outline-none text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[var(--light-gray)] hover:text-[var(--text)]"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg font-bold text-white bg-gradient-to-r from-[var(--button)] to-[var(--primary)] hover:shadow-lg transition-all duration-300 relative"
              >
                <span className="relative z-10">
                  {loading ? "Resetting..." : <><FaRocket className="inline mr-2" />Reset Password</>}
                </span>
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/vendor/login")}
                  className="text-sm text-[var(--primary)] hover:underline flex items-center justify-center gap-1"
                >
                  <FaArrowLeft /> Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes float {
          0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}
        }
        @keyframes float-slow {
          0%,100%{transform:translateY(0) translateX(0)}33%{transform:translateY(-15px) translateX(5px)}66%{transform:translateY(10px) translateX(-5px)}
        }
        @keyframes pulse-slow {
          0%,100%{opacity:0.05;transform:scale(1)}50%{opacity:0.15;transform:scale(1.02)}
        }
        .animate-float{animation:float 3s ease-in-out infinite}
        .animate-float-slow{animation:float-slow 8s ease-in-out infinite}
        .animate-pulse-slow{animation:pulse-slow 6s ease-in-out infinite}
      `}</style>
    </div>
  );
}
