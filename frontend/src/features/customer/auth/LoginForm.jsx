import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { loginCustomer, assignGuestCartAfterLogin, logout } from "./CustomerAuthSlice";
import React, { useEffect, useState } from "react";
import { fetchCurrentUser } from "../customer/cartSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, token } = useSelector((state) => state.customerAuth);
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  const [infoMessage, setInfoMessage] = useState("");
  const [localError, setLocalError] = useState(""); // إضافة state للخطأ المحلي
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setInfoMessage(location.state.message);
    }
  }, [location.state]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setLocalError(""); // مسح الأخطاء السابقة
    
    const result = await dispatch(loginCustomer(data));

    if (result.meta.requestStatus === "fulfilled") {
      // نجح login، الآن نحتاج نعرف الـ role من الـ token
      const token = result.payload.token;
      
      try {
        // فك تشفير الـ token لاستخراج الـ role
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const userRole = tokenPayload.role;
        const userId = tokenPayload.id;
        
        console.log("🔓 Decoded token:", { role: userRole, id: userId });
        
        // توجيه حسب الـ role
        if (userRole === "admin") {
          navigate("/adminHome"); 
        } else if (userRole === "customer") {
          // للـ customer فقط، جرب assign guest cart
          if (userId) {
            try {
              await dispatch(assignGuestCartAfterLogin(userId));
            } catch (cartError) {
              console.log("Cart assignment skipped:", cartError);
            }
          }
          navigate("/customer/home");
        
        } else {
          dispatch(logout());
          setLocalError("Access denied. Unauthorized role.");
        }
      } catch (decodeError) {
        console.error("Error decoding token:", decodeError);
        setLocalError("Failed to process login");
      }
    } else {
      setLocalError(result.payload || "Login failed");
    }
    setIsSubmitting(false);
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-500
      ${isDark ? "bg-[var(--bg)] text-[var(--text)]" : "bg-[var(--bg)] text-[var(--text)]"}`}>
      
      {/* Left Section - Login Form */}
      <div className={`w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 transition-colors duration-500 relative
        ${isDark ? "bg-[var(--div)]" : "bg-[var(--bg)]"}`}>
        
        {/* Decorative Top Border */}
        <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-500
          ${isDark ? "bg-[var(--button)]" : "bg-[var(--button)]"}`}></div>
        
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-2 transition-colors duration-500`}>
              Customer Login
            </h2>
            <p className={`text-lg transition-colors duration-500 ${
              isDark ? "text-[var(--light-gray)]" : "text-[var(--light-gray)]"
            }`}>
              Welcome back to your account
            </p>
          </div>

          {/* Messages */}
          {infoMessage && (
            <div className={`w-full p-4 rounded-lg mb-6 text-center transition-colors duration-300 ${
              isDark ? "bg-[var(--success)] bg-opacity-20 text-green-200 border border-green-800" : "bg-[var(--success)] bg-opacity-20 text-green-700 border border-green-200"
            }`}>
              {infoMessage}
            </div>
          )}

          {(error || localError) && (
            <div className={`w-full p-4 rounded-lg mb-6 text-center transition-colors duration-300 ${
              isDark ? "bg-red-900 bg-opacity-20 text-red-200 border border-red-800" : "bg-red-100 text-red-700 border border-red-200"
            }`}>
              {error || localError}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="flex flex-col w-full">
              <label className={`mb-2 font-medium transition-colors duration-300
                ${isDark ? "text-[var(--text)]" : "text-[var(--text)]"}`}>
                Email Address
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-500
                  ${isDark ? "text-[var(--mid-dark)]" : "text-[var(--light-gray)]"}`}>
                  <MdEmail className="text-xl" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  className={`w-full border pl-10 pr-4 py-3 rounded-lg focus:outline-none transition-all duration-300
                    ${
                      isDark
                        ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                        : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                    }`}
                />
              </div>
              <div className="h-5 mt-1">
                {errors.email && (
                  <p className={`text-sm transition-colors duration-300 ${
                    isDark ? "text-[var(--error)]" : "text-[var(--error)]"
                  }`}>
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col w-full">
              <label className={`mb-2 font-medium transition-colors duration-300
                ${isDark ? "text-[var(--text)]" : "text-[var(--text)]"}`}>
                Password
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-500
                  ${isDark ? "text-[var(--mid-dark)]" : "text-[var(--light-gray)]"}`}>
                  <FaLock className="text-lg" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  className={`w-full border pl-10 pr-12 py-3 rounded-lg focus:outline-none transition-all duration-300
                    ${
                      isDark
                        ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                        : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)] focus:border-transparent"
                    }`}
                  autoComplete="current-password"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}   
                    onClick={() => setShowPassword(s => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className={`p-1 rounded-full transition-all duration-300 ${
                      isDark 
                        ? "text-[var(--mid-dark)] hover:text-[var(--text)] hover:bg-gray-700" 
                        : "text-[var(--light-gray)] hover:text-[var(--text)] hover:bg-gray-100"
                    }`}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </span>
              </div>
              <div className="h-5 mt-1">
                {errors.password && (
                  <p className={`text-sm transition-colors duration-300 ${
                    isDark ? "text-[var(--error)]" : "text-[var(--error)]"
                  }`}>
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className={`w-4 h-4 rounded transition-colors duration-300
                    ${isDark 
                      ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--button)] focus:ring-[var(--button)]" 
                      : "bg-[var(--textbox)] border-[var(--border)] text-[var(--button)] focus:ring-[var(--button)]"
                    }`}
                />
                <label htmlFor="remember" className={`ml-2 text-sm transition-colors duration-300
                  ${isDark ? "text-[var(--light-gray)]" : "text-[var(--light-gray)]"}`}>
                  Remember me
                </label>
              </div>
              
              <button
                type="button"
                className={`text-sm font-medium transition-all duration-300
                  ${isDark 
                    ? "text-[var(--primary)] hover:text-[var(--primary)]" 
                    : "text-[var(--primary)] hover:text-[var(--primary)]"
                  } hover:underline`}
                onClick={() => navigate("/customer/forgot-password")}
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
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className={`text-center transition-colors duration-300 p-3 ${
            isDark ? "text-[var(--light-gray)]" : "text-[var(--light-gray)]"
          }`}>
            Don't have an account?{" "}
            <span
              className={`cursor-pointer font-medium transition-colors duration-300 ${
                isDark ? "text-[var(--primary)] hover:text-[var(--primary)]" : "text-[var(--primary)] hover:text-[var(--primary)]"
              } hover:underline`}
              onClick={() => navigate("/customer/signup")}
            >
              Sign up
            </span>
          </p>
        </div>
      </div>

      {/* Right Section - Welcome */}
      <div className={`hidden lg:flex w-1/2 flex-col justify-center items-center p-12 transition-colors duration-500
        ${isDark ? "bg-[var(--mid-dark)] text-[var(--textbox)]" : "bg-[var(--textbox)] text-[var(--mid-dark)]"}`}>
        
        <div className="text-center max-w-lg">
          <img 
            src={isDark ? "/LogoDark.png" : "/logo.png"} 
            alt="Qwikko Logo" 
            className="h-35 w-90 mb-8 mx-auto transition-all duration-500" 
          />
                    
          <p className="text-xl mb-8 leading-relaxed">
            Log in to explore amazing products, manage your orders, 
            and enjoy a seamless shopping experience tailored just for you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;