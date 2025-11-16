import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdEmail } from "react-icons/md";

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const isDark = useSelector((state) => state.deliveryTheme.darkMode);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await axios.post(
        "https://qwikko.onrender.com/api/delivery/auth/forgot-password",
        { email: data.email }
      );

      localStorage.setItem("deliveryResetEmail", data.email);

      setMessage(res.data.message || "Check your email for the reset link!");
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
      setMessage("");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] relative overflow-hidden flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle gradient overlay for light mode */}
        {!isDark && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/10 animate-pulse-slow"></div>
        )}

        <div className="absolute top-10 left-5 w-48 h-48 sm:w-72 sm:h-72 bg-[var(--button)]/10 rounded-full blur-2xl sm:blur-3xl animate-float-slow"></div>
        <div
          className="absolute bottom-10 right-5 w-52 h-52 sm:w-80 sm:h-80 bg-[var(--primary)]/10 rounded-full blur-2xl sm:blur-3xl animate-float-slow"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--success)]/5 rounded-full blur-2xl sm:blur-3xl animate-pulse-slow"
          style={{ animationDelay: "4s" }}
        ></div>

        {/* Subtle grid pattern for light mode */}
        {!isDark && (
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          ></div>
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
            animationDuration: `${4 + Math.random() * 4}s`,
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
                  Reset Your Password
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
                Don't worry! We'll send you a link to reset your password so you
                can get back to managing your deliveries.
              </p>
            </div>

            {/* Feature Dots */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-1">
              {["Secure", "Quick", "Reliable"].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 text-xs text-[var(--light-gray)]"
                >
                  <span className="text-[var(--button)] text-xs">•</span>
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

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="relative space-y-2 sm:space-y-3"
                >
                  {/* Status Messages */}
                  {message && (
                    <div
                      className={`p-2 rounded-lg text-center font-semibold backdrop-blur-sm transform transition-all duration-500 ${"bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30"}`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs">✓</span>
                        <span className="text-xs">{message}</span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div
                      className={`p-2 rounded-lg text-center font-semibold backdrop-blur-sm transform transition-all duration-500 ${"bg-[var(--error)]/20 text-[var(--error)] border border-[var(--error)]/30"}`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs">⚠</span>
                        <span className="text-xs">{error}</span>
                      </div>
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-1">
                    <label
                      className={`block text-xs font-semibold transition-colors duration-300 ${
                        isDark ? "text-[var(--text)]" : "text-[var(--text)]"
                      }`}
                    >
                      Email Address
                    </label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <MdEmail className="text-xs text-[var(--light-gray)]" />
                      </div>
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        className="w-full bg-[var(--bg)]/50 text-[var(--text)] border border-[var(--border)]/50 rounded-lg pl-7 pr-2 py-2 focus:border-[var(--button)] focus:ring-1 focus:ring-[var(--button)]/10 outline-none transition-all duration-300 backdrop-blur-sm text-xs sm:text-sm"
                      />
                    </div>
                    <div className="h-4">
                      {errors.email && (
                        <p className="text-xs text-[var(--error)] transition-colors duration-300 flex items-center gap-1">
                          <span>•</span>
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Help Text */}
                  <div
                    className={`p-3 rounded-lg text-xs ${
                      isDark ? "bg-[var(--bg)]" : "bg-gray-50"
                    }`}
                  >
                    <p
                      className={`font-medium mb-1 ${
                        isDark ? "text-[var(--text)]" : "text-gray-700"
                      }`}
                    >
                      Can't find the email?
                    </p>
                    <p
                      className={`${
                        isDark ? "text-[var(--light-gray)]" : "text-gray-600"
                      }`}
                    >
                      Check your spam folder or contact support if you need
                      assistance.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1 sm:pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full relative px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-bold text-white bg-gradient-to-r from-[var(--button)] to-[var(--primary)] border-0 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group/btn overflow-hidden text-xs sm:text-sm"
                    >
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>

                      {/* Button Content */}
                      <span className="relative z-10 flex items-center justify-center gap-1">
                        {isSubmitting ? (
                          <>
                            <div className="w-2 h-2 sm:w-3 sm:h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Sending Reset Link...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Reset Link</span>
                          </>
                        )}
                      </span>
                    </button>
                  </div>

                  {/* Back to Login */}
                  <div className="text-center">
                    <button
                      onClick={() => navigate("/delivery/login")}
                      className={`inline-flex items-center gap-1 text-xs transition-all duration-500 group ${
                        isDark
                          ? "text-[var(--button)] hover:text-purple-400"
                          : "text-blue-600 hover:text-blue-800"
                      }`}
                    >
                      <svg
                        className="w-2 h-2 sm:w-3 sm:h-3"
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
                      <span className="bg-gradient-to-r from-transparent via-transparent to-transparent bg-[length:0%_1px] bg-no-repeat bg-left-bottom group-hover:bg-[length:100%_1px] group-hover:from-[var(--button)] group-hover:to-[var(--primary)] transition-all duration-500">
                        Back to login
                      </span>
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
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(2deg);
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-15px) translateX(5px);
          }
          66% {
            transform: translateY(10px) translateX(-5px);
          }
        }
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.05;
            transform: scale(1);
          }
          50% {
            opacity: 0.15;
            transform: scale(1.02);
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
