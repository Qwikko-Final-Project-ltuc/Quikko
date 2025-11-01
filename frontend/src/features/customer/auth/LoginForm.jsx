import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { loginCustomer, assignGuestCartAfterLogin } from "./CustomerAuthSlice";
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
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setInfoMessage(location.state.message);
    }
  }, [location.state]);

  const onSubmit = async (data) => {
    const result = await dispatch(loginCustomer(data));

    if (result.meta.requestStatus === "fulfilled") {
      const userResult = await dispatch(fetchCurrentUser());
      const userId = userResult.payload?.id;

      if (userId) {
        await dispatch(assignGuestCartAfterLogin(userId));
      }

      navigate("/customer/home");
    }
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-500
      ${isDark ? "bg-[var(--bg)] text-[var(--text)]" : "bg-[var(--bg)] text-[var(--text)]"}`}>
      
      {/* Left Section - Login Form */}
      <div className={`w-1/2 flex flex-col justify-center items-center p-12 transition-colors duration-500
        ${isDark ? "bg-[var(--div)]" : "bg-[var(--bg)]"}`}>
        
        <h2 className={`text-3xl font-bold mb-6 transition-colors duration-500`}>
          Customer Login
        </h2>

        {infoMessage && (
          <div className={`w-full max-w-md p-3 rounded-lg mb-4 text-center transition-colors duration-300 ${
            isDark ? "bg-[var(--success)] bg-opacity-20 text-green-200" : "bg-[var(--success)] bg-opacity-20 text-green-700"
          }`}>
            {infoMessage}
          </div>
        )}

        {error && (
          <div className={`w-full max-w-md p-3 rounded-lg mb-4 text-center transition-colors duration-300 ${
            isDark ? "bg-[var(--error)] bg-opacity-20 text-red-200" : "bg-[var(--error)] bg-opacity-20 text-red-700"
          }`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
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
                autoComplete="current-password"
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

          {/* Login Button */}
          <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 rounded-lg font-semibold transition-all duration-300
            bg-[var(--button)] text-white 
            hover:bg-[var(--button)] hover:text-white 
            hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] 
            disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>


          {/* Forgot Password */}
          <p className="text-center">
            <span
              className={`cursor-pointer transition-colors duration-300 ${
                isDark ? "text-[var(--primary)] hover:text-[var(--primary)]" : "text-[var(--primary)] hover:text-[var(--primary)]"
              } hover:underline`}
              onClick={() => navigate("/customer/forgot-password")}
            >
              Forgot Password?
            </span>
          </p>
        </form>

        {/* Sign Up Link */}
        <p className={`text-center mt-6 transition-colors duration-300 ${
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

      {/* Right Section - Welcome */}
      <div className={`w-1/2 flex flex-col justify-center items-center p-12 transition-colors duration-500
        ${isDark ? "bg-[var(--mid-dark)] text-[var(--text)]" : "bg-[var(--div)] text-[var(--text)]"}`}>
        
        <img 
          src={isDark ? "/LogoDark.png" : "/logo.png"} 
          alt="Qwikko Logo" 
          className="h-25 w-80 mb-6 transition-all duration-500" 
        />
        
        <p className="text-xl max-w-md text-center leading-relaxed">
          Welcome to Qwikko! Log in to explore amazing products, manage your orders, 
          and enjoy a seamless shopping experience.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;