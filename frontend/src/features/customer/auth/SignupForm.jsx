import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { registerCustomer } from "./CustomerAuthSlice";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaUser, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { MdEmail, MdLock } from "react-icons/md";

const SignupForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.customerAuth);
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [showPassword, setShowPassword] = React.useState(false);

  const onSubmit = (data) => {
    dispatch(registerCustomer(data));
  };

  useEffect(() => {
    if (user) {
      alert("Please check your email to verify your account before logging in.");
      navigate("/customer/login");
    }
  }, [user, navigate]);

  return (
    <div className={`flex min-h-screen transition-colors duration-500
      ${isDark ? "bg-[var(--bg)] text-[var(--text)]" : "bg-[var(--bg)] text-[var(--text)]"}`}>
      
      {/* Left Section - Signup Form */}
      <div className={`w-1/2 flex flex-col justify-center items-center p-12 transition-colors duration-500
        ${isDark ? "bg-[var(--div)]" : "bg-[var(--bg)]"}`}>
        
        <h2 className={`text-3xl font-bold mb-6 transition-colors duration-500`}>
          Customer Signup
        </h2>

        {error && (
          <div className={`w-full max-w-md p-3 rounded-lg mb-4 text-center transition-colors duration-300 ${
            isDark ? "bg-[var(--error)] bg-opacity-20 text-red-200" : "bg-[var(--error)] bg-opacity-20 text-red-700"
          }`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
          {/* Name Field */}
          <div className="flex flex-col w-full relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Full Name"
                {...register("name", { required: "Name is required" })}
                className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300
                  ${
                    isDark
                      ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                      : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                  }`}
                  style={{color: 'var(--mid-dark)'}}
              />
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <FaUser className={`text-xl transition-colors duration-500 ${
                  isDark ? "text-[var(--mid-dark)]" : "text-[var(--light-gray)]"
                }`} />
              </span>
            </div>
            <div className="h-5">
              {errors.name && (
                <p className={`text-sm mt-1 transition-colors duration-300 ${
                  isDark ? "text-[var(--error)]" : "text-[var(--error)]"
                }`}>
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="flex flex-col w-full relative">
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                {...register("email", { required: "Email is required" })}
                className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300
                  ${
                    isDark
                      ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                      : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                  }`}
                  style={{color: 'var(--mid-dark)'}}
              />
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <MdEmail className={`text-xl transition-colors duration-500 ${
                  isDark ? "text-[var(--mid-dark)]" : "text-[var(--light-gray)]"
                }`} />
              </span>
            </div>
            <div className="h-5">
              {errors.email && (
                <p className={`text-sm mt-1 transition-colors duration-300 ${
                  isDark ? "text-[var(--error)]" : "text-[var(--error)]"
                }`}>
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col w-full relative">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", { required: "Password is required" })}
                className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300
                  ${
                    isDark
                      ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                      : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                  }`}
                  style={{color: 'var(--mid-dark)'}}
              />
              <span className="absolute inset-y-0 right-3 flex items-center">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}   
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className={`p-1 transition-colors duration-300 ${
                    isDark ? "text-[var(--mid-dark)] hover:text-[var(--text)]" : "text-[var(--light-gray)] hover:text-[var(--text)]"
                  }`}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </span>
            </div>
            <div className="h-5">
              {errors.password && (
                <p className={`text-sm mt-1 transition-colors duration-300 ${
                  isDark ? "text-[var(--error)]" : "text-[var(--error)]"
                }`}>
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Phone Field */}
          <div className="flex flex-col w-full relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Phone (optional)"
                {...register("phone")}
                className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300
                  ${
                    isDark
                      ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                      : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                  }`}
                  style={{color: 'var(--mid-dark)'}}
              />
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <FaPhone className={`text-xl transition-colors duration-500 ${
                  isDark ? "text-[var(--mid-dark)]" : "text-[var(--light-gray)]"
                }`} />
              </span>
            </div>
          </div>

          {/* Address Field */}
          <div className="flex flex-col w-full relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Address (optional)"
                {...register("address")}
                className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300
                  ${
                    isDark
                      ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                      : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                  }`}
                  style={{color: 'var(--mid-dark)'}}
              />
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <FaMapMarkerAlt className={`text-xl transition-colors duration-500 ${
                  isDark ? "text-[var(--mid-dark)]" : "text-[var(--light-gray)]"
                }`} />
              </span>
            </div>
          </div>

          {/* Sign Up Button */}
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
        <p className={`text-center mt-6 transition-colors duration-300 ${
          isDark ? "text-[var(--light-gray)]" : "text-[var(--light-gray)]"
        }`}>
          Already have an account?{" "}
          <span
            className={`cursor-pointer font-medium transition-colors duration-300 ${
              isDark ? "text-[var(--primary)] hover:text-[var(--primary)]" : "text-[var(--primary)] hover:text-[var(--primary)]"
            } hover:underline`}
            onClick={() => navigate("/customer/login")}
          >
            Login
          </span>
        </p>
      </div>

      {/* Right Section - Welcome */}
      <div className={`w-1/2 flex flex-col justify-center items-center p-12 transition-colors duration-500
        ${isDark ? "bg-[var(--mid-dark)] text-[var(--text)]" : "bg-[var(--div)] text-[var(--text)]"}`}>
        
        <img 
          src={isDark ? "/LogoDark.png" : "/logo.png"} 
          alt="Qwikko Logo" 
          className="h-25 w-80 mb-6 transition-all duration-500" 
        />
        
        <p className="text-xl max-w-md text-center leading-relaxed">
          Join Qwikko today! Create your account to discover amazing products, 
          track your orders, and enjoy exclusive deals and offers.
        </p>
      </div>
    </div>
  );
};

export default SignupForm;