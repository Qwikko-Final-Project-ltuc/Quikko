// src/pages/PasswordUpdated.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaArrowLeft, FaRocket } from "react-icons/fa";
import { FiShield, FiAward, FiStar } from "react-icons/fi";
import { MdPrivacyTip } from "react-icons/md";

const PasswordUpdated = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const themeMode = useSelector((state) => state.customerTheme.mode);
  const isDark = themeMode === "dark";

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthMap = {
      0: { text: "Very Weak", color: "bg-red-500" },
      1: { text: "Weak", color: "bg-red-400" },
      2: { text: "Fair", color: "bg-yellow-500" },
      3: { text: "Good", color: "bg-green-400" },
      4: { text: "Strong", color: "bg-green-600" }
    };

    return { strength, ...strengthMap[strength] };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password) {
      return setError("Password cannot be empty");
    }

    if (password.length < 8) {
      return setError("Password must be at least 8 characters long");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      await axios.post("https://qwikko.onrender.com/api/auth/reset-password", {
        email,
        newPassword: password,
      });

      setMessage("Password updated successfully ✅");
      setSuccess(true);
      
      setTimeout(() => {
        localStorage.removeItem("resetEmail");
        navigate("/customer/login");
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || "Failed to update password");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        isDark ? 'bg-[var(--bg)] text-[var(--text)]' : 'bg-gray-50 text-gray-800'
      }`}>
        <div className={`max-w-md w-full p-8 rounded-2xl text-center ${
          isDark ? 'bg-[var(--div)] border border-[var(--border)]' : 'bg-white border border-gray-200 shadow-xl'
        }`}>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-green-600 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-green-600">Password Updated!</h2>
          <p className={`text-lg mb-6 ${isDark ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
            Your password has been successfully updated
          </p>
          <p className={`text-sm ${isDark ? 'text-[var(--light-gray)]' : 'text-gray-500'}`}>
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] relative overflow-hidden flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle gradient overlay for light mode */}
        {!isDark && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/10 animate-pulse-slow"></div>
        )}
        
        <div className="absolute top-10 left-5 w-48 h-48 sm:w-72 sm:h-72 bg-[var(--button)]/10 rounded-full blur-2xl sm:blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-10 right-5 w-52 h-52 sm:w-80 sm:h-80 bg-[var(--primary)]/10 rounded-full blur-2xl sm:blur-3xl animate-float-slow" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--success)]/5 rounded-full blur-2xl sm:blur-3xl animate-pulse-slow" style={{animationDelay: '4s'}}></div>
        
        {/* Subtle grid pattern for light mode */}
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
          
          {/* Left Section - Brand & Welcome */}
          <div className="w-full lg:w-2/5 flex flex-col justify-center items-center text-center space-y-3 lg:space-y-5">
            {/* Welcome Header */}
            <div className="space-y-1 lg:space-y-2">
              <div className="relative">
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-[var(--text)] leading-tight">
                  Set New Password
                </h1>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className="w-6 sm:w-8 h-0.5 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-full"></div>
                  <div className="w-3 sm:w-4 h-0.5 bg-[var(--button)] rounded-full"></div>
                  <div className="w-2 h-0.5 bg-[var(--primary)] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Logo Section */}
            <div className="relative group">
              <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-r from-[var(--button)]/15 to-[var(--primary)]/15 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <img
                src={isDark ? "/LogoDark.png" : "/logo.png"}
                alt="Qwikko Logo"
                className="h-12 sm:h-16 lg:h-20 xl:h-24 w-auto relative z-10 transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Description - Hidden on mobile and tablet */}
            <div className="hidden lg:block max-w-xs sm:max-w-sm">
              <p className="text-sm text-[var(--light-gray)] leading-relaxed font-medium">
                Create a strong new password to secure your account and continue your shopping experience.
              </p>
            </div>

            {/* Feature Dots */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-1">
              {['Secure', 'Protected', 'Encrypted'].map((feature, index) => (
                <div key={index} className="flex items-center gap-1 text-xs text-[var(--light-gray)]">
                  <FiStar className="text-[var(--button)] text-xs" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Form */}
          <div className="w-full lg:w-3/5 max-w-xs sm:max-w-sm md:max-w-md">
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl blur opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
              
              {/* Form Container */}
              <div className="relative bg-[var(--bg)]/95 backdrop-blur-lg border border-[var(--border)]/30 rounded-xl p-3 sm:p-4 md:p-5 shadow-lg transform transition-all duration-500 hover:shadow-xl">
                
                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 border-t border-r border-[var(--button)] rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 border-b border-l border-[var(--primary)] rounded-bl-xl"></div>

                <form onSubmit={handleSubmit} className="relative space-y-2 sm:space-y-3">
                  {/* Status Messages */}
                  {error && (
                    <div className={`p-2 rounded-lg text-center font-semibold backdrop-blur-sm transform transition-all duration-500 ${
                      "bg-[var(--error)]/20 text-[var(--error)] border border-[var(--error)]/30"
                    }`}>
                      <div className="flex items-center justify-center gap-2">
                        <FiShield className="text-xs" />
                        <span className="text-xs">{error}</span>
                      </div>
                    </div>
                  )}

                  {message && (
                    <div className={`p-2 rounded-lg text-center font-semibold backdrop-blur-sm transform transition-all duration-500 ${
                      "bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30"
                    }`}>
                      <div className="flex items-center justify-center gap-2">
                        <FiStar className="text-xs" />
                        <span className="text-xs">{message}</span>
                      </div>
                    </div>
                  )}

                  {/* New Password Field */}
                  <div className="space-y-1">
                    <label className={`block text-xs font-semibold transition-colors duration-300 ${
                      isDark ? "text-[var(--text)]" : "text-[var(--text)]"
                    }`}>
                      New Password
                    </label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <FaLock className="text-xs text-[var(--light-gray)]" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[var(--bg)]/50 text-[var(--text)] border border-[var(--border)]/50 rounded-lg pl-7 pr-7 py-2 focus:border-[var(--button)] focus:ring-1 focus:ring-[var(--button)]/10 outline-none transition-all duration-300 backdrop-blur-sm text-xs sm:text-sm"
                      />
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded transition-all duration-300 hover:scale-110 ${
                          isDark
                            ? "text-[var(--light-gray)] hover:text-[var(--text)] hover:bg-[var(--border)]/30"
                            : "text-[var(--light-gray)] hover:text-[var(--text)] hover:bg-gray-100"
                        }`}
                      >
                        {showPassword ? <FaEyeSlash size={10} /> : <FaEye size={10} />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className={isDark ? 'text-[var(--light-gray)]' : 'text-gray-600'}>
                          Password strength:
                        </span>
                        <span className={`font-medium ${
                          passwordStrength.strength <= 1 ? 'text-red-500' :
                          passwordStrength.strength <= 2 ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className={`w-full rounded-full h-1 ${
                        isDark ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        <div 
                          className={`h-1 rounded-full transition-all duration-500 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Confirm Password Field */}
                  <div className="space-y-1">
                    <label className={`block text-xs font-semibold transition-colors duration-300 ${
                      isDark ? "text-[var(--text)]" : "text-[var(--text)]"
                    }`}>
                      Confirm Password
                    </label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <FaLock className="text-xs text-[var(--light-gray)]" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[var(--bg)]/50 text-[var(--text)] border border-[var(--border)]/50 rounded-lg pl-7 pr-7 py-2 focus:border-[var(--button)] focus:ring-1 focus:ring-[var(--button)]/10 outline-none transition-all duration-300 backdrop-blur-sm text-xs sm:text-sm"
                      />
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded transition-all duration-300 hover:scale-110 ${
                          isDark
                            ? "text-[var(--light-gray)] hover:text-[var(--text)] hover:bg-[var(--border)]/30"
                            : "text-[var(--light-gray)] hover:text-[var(--text)] hover:bg-gray-100"
                        }`}
                      >
                        {showConfirmPassword ? <FaEyeSlash size={10} /> : <FaEye size={10} />}
                      </button>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className={`p-3 rounded-lg text-xs ${
                    isDark ? 'bg-[var(--bg)]' : 'bg-gray-50'
                  }`}>
                    <p className={`font-medium mb-2 ${
                      isDark ? 'text-[var(--text)]' : 'text-gray-700'
                    }`}>
                      Password requirements:
                    </p>
                    <ul className={`space-y-1 ${
                      isDark ? 'text-[var(--light-gray)]' : 'text-gray-600'
                    }`}>
                      <li className={`flex items-center gap-1 ${password?.length >= 8 ? 'text-green-500' : ''}`}>
                        • At least 8 characters
                      </li>
                      <li className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-500' : ''}`}>
                        • One uppercase letter
                      </li>
                      <li className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-500' : ''}`}>
                        • One number
                      </li>
                      <li className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(password) ? 'text-green-500' : ''}`}>
                        • One special character
                      </li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1 sm:pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full relative px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-bold text-white bg-gradient-to-r from-[var(--button)] to-[var(--primary)] border-0 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group/btn overflow-hidden text-xs sm:text-sm"
                    >
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                      
                      {/* Button Content */}
                      <span className="relative z-10 flex items-center justify-center gap-1">
                        {loading ? (
                          <>
                            <div className="w-2 h-2 sm:w-3 sm:h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Updating Password...</span>
                          </>
                        ) : (
                          <>
                            <FaRocket className="w-2 h-2 sm:w-3 sm:h-3 transform group-hover/btn:rotate-12 transition-transform duration-500" />
                            <span>Update Password</span>
                          </>
                        )}
                      </span>
                    </button>
                  </div>

                  {/* Back to Login */}
                  <div className="text-center">
                    <button
                      onClick={() => navigate("/customer/login")}
                      className={`inline-flex items-center gap-1 text-xs transition-all duration-500 group ${
                        isDark
                          ? "text-[var(--button)] hover:text-purple-400"
                          : "text-blue-600 hover:text-blue-800"
                      }`}
                    >
                      <FaArrowLeft className="w-2 h-2 sm:w-3 sm:h-3" />
                      <span className="bg-gradient-to-r from-transparent via-transparent to-transparent bg-[length:0%_1px] bg-no-repeat bg-left-bottom group-hover:bg-[length:100%_1px] group-hover:from-[var(--button)] group-hover:to-[var(--primary)] transition-all duration-500">
                        Back to login
                      </span>
                    </button>
                  </div>

                  {/* Privacy & Terms Links */}
                  <div className={`flex justify-center gap-2 text-xs transition-colors duration-500 ${
                    isDark ? "text-[var(--light-gray)]" : "text-gray-500"
                  }`}>
                    <button
                      onClick={() => navigate("/privacy-policy")}
                      className={`transition-all duration-300 hover:scale-105 flex items-center gap-1 ${
                        isDark ? "hover:text-[var(--button)]" : "hover:text-blue-600"
                      }`}
                    >
                      <MdPrivacyTip className="w-2 h-2 sm:w-3 sm:h-3" />
                      Privacy
                    </button>
                    <span className={isDark ? "text-[var(--border)]" : "text-gray-300"}>•</span>
                    <button
                      onClick={() => navigate("/terms-of-service")}
                      className={`transition-all duration-300 hover:scale-105 flex items-center gap-1 ${
                        isDark ? "hover:text-[var(--button)]" : "hover:text-blue-600"
                      }`}
                    >
                      <FiShield className="w-2 h-2 sm:w-3 sm:h-3" />
                      Terms
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
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
        .animate-gradient-x { 
          background-size: 200% 200%; 
          animation: gradient-x 3s ease infinite; 
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default PasswordUpdated;
