import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { loginDelivery, clearMessages } from "./authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, successMessage } = useSelector((state) => state.auth);
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    dispatch(loginDelivery(formData));
  };

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => {
        dispatch(clearMessages());
        navigate("/delivery/dashboard/Home");
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [successMessage, dispatch, navigate]);

  // Reset submitting state when loading changes
  useEffect(() => {
    if (!loading) {
      setIsSubmitting(false);
    }
  }, [loading]);

  return (
    <div
      className={`flex min-h-screen transition-colors duration-500
      ${
        isDarkMode
          ? "bg-[var(--bg)] text-[var(--text)]"
          : "bg-[var(--bg)] text-[var(--text)]"
      }`}
    >
      {/* Left Section - Login Form */}
      <div
        className={`w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 transition-colors duration-500 relative
        ${isDarkMode ? "bg-[var(--div)]" : "bg-[var(--bg)]"}`}
      >
        {/* Decorative Top Border */}
        <div
          className={`absolute top-0 left-0 w-full h-1 transition-colors duration-500
          ${isDarkMode ? "bg-[var(--button)]" : "bg-[var(--button)]"}`}
        ></div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h2
              className={`text-3xl font-bold mb-2 transition-colors duration-500`}
            >
              Delivery Login
            </h2>
            <p
              className={`text-lg transition-colors duration-500 ${
                isDarkMode
                  ? "text-[var(--light-gray)]"
                  : "text-[var(--light-gray)]"
              }`}
            >
              Welcome back to your delivery dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className={`w-full p-4 rounded-lg mb-6 text-center transition-colors duration-300 ${
                isDarkMode
                  ? "bg-red-900 bg-opacity-20 text-red-200 border border-red-800"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div
              className={`w-full p-4 rounded-lg mb-6 text-center transition-colors duration-300 ${
                isDarkMode
                  ? "bg-green-900 bg-opacity-20 text-green-200 border border-green-800"
                  : "bg-green-100 text-green-700 border border-green-200"
              }`}
            >
              {successMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="flex flex-col w-full">
              <label
                className={`mb-2 font-medium transition-colors duration-300
                ${isDarkMode ? "text-[var(--text)]" : "text-[var(--text)]"}`}
              >
                Email Address
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-500
                  ${
                    isDarkMode
                      ? "text-[var(--mid-dark)]"
                      : "text-[var(--light-gray)]"
                  }`}
                >
                  <MdEmail className="text-xl" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full border pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-all duration-300
                    ${
                      isDarkMode
                        ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                        : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                    }`}
                />
              </div>
              <div className="h-5 mt-1"></div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col w-full">
              <label
                className={`mb-2 font-medium transition-colors duration-300
                ${isDarkMode ? "text-[var(--text)]" : "text-[var(--text)]"}`}
              >
                Password
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-500
                  ${
                    isDarkMode
                      ? "text-[var(--mid-dark)]"
                      : "text-[var(--light-gray)]"
                  }`}
                >
                  <FaLock className="text-lg" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className={`w-full border pl-10 pr-12 py-3 rounded-lg focus:outline-none transition-all duration-300
                    ${
                      isDarkMode
                        ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                        : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                    }`}
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className={`p-1 rounded-full transition-all duration-300 ${
                      isDarkMode
                        ? "text-[var(--mid-dark)] hover:text-[var(--text)] hover:bg-gray-700"
                        : "text-[var(--light-gray)] hover:text-[var(--text)] hover:bg-gray-100"
                    }`}
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </span>
              </div>
              <div className="h-5 mt-1"></div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className={`w-4 h-4 rounded transition-colors duration-300
                    ${
                      isDarkMode
                        ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--button)] focus:ring-[var(--button)]"
                        : "bg-[var(--textbox)] border-[var(--border)] text-[var(--button)] focus:ring-[var(--button)]"
                    }`}
                />
                <label
                  htmlFor="remember"
                  className={`ml-2 text-sm transition-colors duration-300
                  ${
                    isDarkMode
                      ? "text-[var(--light-gray)]"
                      : "text-[var(--light-gray)]"
                  }`}
                >
                  Remember me
                </label>
              </div>

              <button
                type="button"
                className={`text-sm font-medium transition-all duration-300
                  ${
                    isDarkMode
                      ? "text-[var(--primary)] hover:text-[var(--primary)]"
                      : "text-[var(--primary)] hover:text-[var(--primary)]"
                  } hover:underline`}
                onClick={() => navigate("/delivery/forgot-password")}
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className={`w-full p-3 rounded-lg font-semibold transition-all duration-300 relative
                bg-[var(--button)] text-white 
                hover:bg-[var(--button)] hover:text-white 
                hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] 
                disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed disabled:shadow-none`}
            >
              {loading || isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Register Link */}
          <p
            className={`text-center transition-colors duration-300 p-3 ${
              isDarkMode
                ? "text-[var(--light-gray)]"
                : "text-[var(--light-gray)]"
            }`}
          >
            Don't have an account?{" "}
            <span
              className={`cursor-pointer font-medium transition-colors duration-300 ${
                isDarkMode
                  ? "text-[var(--primary)] hover:text-[var(--primary)]"
                  : "text-[var(--primary)] hover:text-[var(--primary)]"
              } hover:underline`}
              onClick={() => navigate("/delivery/register")}
            >
              Register
            </span>
          </p>
        </div>
      </div>

      {/* Right Section - Welcome */}
      <div
        className={`hidden lg:flex w-1/2 flex-col justify-center items-center p-12 transition-colors duration-500
        ${
          isDarkMode
            ? "bg-[var(--mid-dark)] text-[var(--textbox)]"
            : "bg-[var(--textbox)] text-[var(--mid-dark)]"
        }`}
      >
        <div className="text-center max-w-lg">
          <img
            src={isDarkMode ? "/LogoDark.png" : "/logo.png"}
            alt="Qwikko Logo"
            className="h-35 w-90 mb-8 mx-auto transition-all duration-500"
          />

          <p className="text-xl mb-8 leading-relaxed">
            Log in to manage your deliveries, track orders, and access your
            delivery dashboard for seamless logistics operations.
          </p>
        </div>
      </div>
    </div>
  );
}
