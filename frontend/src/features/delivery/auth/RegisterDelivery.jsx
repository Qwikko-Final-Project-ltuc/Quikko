import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { registerDelivery } from "./authSlice"; // تأكد من اسم الـ action
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaUser, FaPhone, FaMapMarkerAlt, FaIndustry } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";

const DeliveryRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useSelector((state) => state.auth); // تأكد من الـ state structure
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    dispatch(registerDelivery(data));
  };

  useEffect(() => {
    if (successMessage) {
      // يمكنك تغيير هذا حسب منطق التطبيق
      setTimeout(() => {
        navigate("/delivery/login");
      }, 2000);
    }
  }, [successMessage, navigate]);

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
      {/* Left Section - Signup Form */}
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
              Delivery Signup
            </h2>
            <p
              className={`text-lg transition-colors duration-500 ${
                isDarkMode
                  ? "text-[var(--light-gray)]"
                  : "text-[var(--light-gray)]"
              }`}
            >
              Join our delivery network
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Name Field */}
            <div className="flex flex-col w-full">
              <label
                className={`mb-2 font-medium transition-colors duration-300
                ${isDarkMode ? "text-[var(--text)]" : "text-[var(--text)]"}`}
              >
                Company Name
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
                  <FaIndustry className="text-lg" />
                </div>
                <input
                  type="text"
                  placeholder="Your company name"
                  {...register("company_name", {
                    required: "Company name is required",
                  })}
                  className={`w-full border pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-all duration-300
                    ${
                      isDarkMode
                        ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                        : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                    }`}
                />
              </div>
              <div className="h-5 mt-1">
                {errors.company_name && (
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-[var(--error)]" : "text-[var(--error)]"
                    }`}
                  >
                    {errors.company_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Person Field */}
            <div className="flex flex-col w-full">
              <label
                className={`mb-2 font-medium transition-colors duration-300
                ${isDarkMode ? "text-[var(--text)]" : "text-[var(--text)]"}`}
              >
                Contact Person
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
                  <FaUser className="text-lg" />
                </div>
                <input
                  type="text"
                  placeholder="Full name"
                  {...register("contact_person", {
                    required: "Contact person is required",
                  })}
                  className={`w-full border pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-all duration-300
                    ${
                      isDarkMode
                        ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                        : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                    }`}
                />
              </div>
              <div className="h-5 mt-1">
                {errors.contact_person && (
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-[var(--error)]" : "text-[var(--error)]"
                    }`}
                  >
                    {errors.contact_person.message}
                  </p>
                )}
              </div>
            </div>

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
                  placeholder="Enter your email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className={`w-full border pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-all duration-300
                    ${
                      isDarkMode
                        ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                        : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                    }`}
                />
              </div>
              <div className="h-5 mt-1">
                {errors.email && (
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-[var(--error)]" : "text-[var(--error)]"
                    }`}
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>
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
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className={`w-full border pl-10 pr-12 py-3 rounded-lg focus:outline-none transition-all duration-300
                    ${
                      isDarkMode
                        ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                        : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                    }`}
                  autoComplete="new-password"
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
              <div className="h-5 mt-1">
                {errors.password && (
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-[var(--error)]" : "text-[var(--error)]"
                    }`}
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Phone Field */}
            <div className="flex flex-col w-full">
              <label
                className={`mb-2 font-medium transition-colors duration-300
                ${isDarkMode ? "text-[var(--text)]" : "text-[var(--text)]"}`}
              >
                Phone Number
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
                  <FaPhone className="text-lg" />
                </div>
                <input
                  type="text"
                  placeholder="Phone number"
                  {...register("phone", {
                    required: "Phone number is required",
                  })}
                  className={`w-full border pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-all duration-300
                    ${
                      isDarkMode
                        ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                        : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                    }`}
                />
              </div>
              <div className="h-5 mt-1">
                {errors.phone && (
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-[var(--error)]" : "text-[var(--error)]"
                    }`}
                  >
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Address Field */}
            <div className="flex flex-col w-full">
              <label
                className={`mb-2 font-medium transition-colors duration-300
                ${isDarkMode ? "text-[var(--text)]" : "text-[var(--text)]"}`}
              >
                Company Address
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
                  <FaMapMarkerAlt className="text-lg" />
                </div>
                <input
                  type="text"
                  placeholder="Company address"
                  {...register("address", { required: "Address is required" })}
                  className={`w-full border pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-all duration-300
                    ${
                      isDarkMode
                        ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                        : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                    }`}
                />
              </div>
              <div className="h-5 mt-1">
                {errors.address && (
                  <p
                    className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? "text-[var(--error)]" : "text-[var(--error)]"
                    }`}
                  >
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>

            {/* Register Button */}
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
                  Registering...
                </span>
              ) : (
                "Register"
              )}
            </button>
          </form>

          {/* Login Link */}
          <p
            className={`text-center transition-colors duration-300 p-3 ${
              isDarkMode
                ? "text-[var(--light-gray)]"
                : "text-[var(--light-gray)]"
            }`}
          >
            Already have an account?{" "}
            <span
              className={`cursor-pointer font-medium transition-colors duration-300 ${
                isDarkMode
                  ? "text-[var(--primary)] hover:text-[var(--primary)]"
                  : "text-[var(--primary)] hover:text-[var(--primary)]"
              } hover:underline`}
              onClick={() => navigate("/delivery/login")}
            >
              Login
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
            Join our delivery network and grow your business! Register your
            company to start receiving delivery requests and expand your reach
            across multiple vendors and customers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryRegister;
