// src/features/vendor/VendorLogin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";

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
        // فك التوكن لاستخراج الدور
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
    <div
      className={`flex flex-col md:flex-row min-h-screen transition-colors duration-500
      ${isDark ? "bg-[var(--bg)] text-[var(--text)]" : "bg-[var(--bg)] text-[var(--text)]"}`}
    >
      {/* Left Section - Login Form */}
      <div
        className={`w-full md:w-1/2 flex flex-col justify-center items-center p-4 md:p-12 transition-colors duration-500
        ${isDark ? "bg-[var(--div)]" : "bg-[var(--bg)]"}`}
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 transition-colors duration-500">
          Vendor Login
        </h2>

        {message && (
          <div
            className={`w-full max-w-md p-3 rounded-lg mb-4 text-center transition-colors duration-300 text-sm sm:text-base ${
              message.includes("✅")
                ? isDark
                  ? "bg-[var(--success)] bg-opacity-20 text-green-200"
                  : "bg-[var(--success)] bg-opacity-20 text-green-700"
                : isDark
                ? "bg-[var(--error)] bg-opacity-20 text-red-200"
                : "bg-[var(--error)] bg-opacity-20 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full max-w-md space-y-6">
          {/* Email Field */}
          <div className="flex flex-col w-full relative">
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300 text-sm sm:text-base
                  ${
                    isDark
                      ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                      : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                  }`}
                required
              />
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <MdEmail
                  className={`text-lg sm:text-xl transition-colors duration-500 ${
                    isDark ? "text-[var(--mid-dark)]" : "text-[var(--light-gray)]"
                  }`}
                />
              </span>
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col w-full relative">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300 text-sm sm:text-base
                  ${
                    isDark
                      ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                      : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                  }`}
                required
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className={`p-1 transition-colors duration-300 ${
                    isDark
                      ? "text-[var(--mid-dark)] hover:text-[var(--text)]"
                      : "text-[var(--light-gray)] hover:text-[var(--text)]"
                  }`}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </span>
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
          <p className="text-center text-sm sm:text-base">
            <span
              className={`cursor-pointer transition-colors duration-300 hover:underline ${
                isDark
                  ? "text-[var(--primary)] hover:text-[var(--primary)]"
                  : "text-[var(--primary)] hover:text-[var(--primary)]"
              }`}
              onClick={() => navigate("/vendor/forgot-password")}
            >
              Forgot Password?
            </span>
          </p>
        </form>

        {/* Register Link */}
        <p className="text-center mt-6 text-sm sm:text-base">
          Don’t have an account?{" "}
          <span
            className={`cursor-pointer font-medium transition-colors duration-300 hover:underline ${
              isDark
                ? "text-[var(--primary)] hover:text-[var(--primary)]"
                : "text-[var(--primary)] hover:text-[var(--primary)]"
            }`}
            onClick={() => navigate("/vendor/register")}
          >
            Sign up
          </span>
        </p>
      </div>

      {/* Right Section - Welcome */}
      <div
        className={`hidden lg:flex w-1/2 flex-col justify-center items-center p-12 transition-colors duration-500
        ${isDark ? "bg-[var(--mid-dark)] text-[var(--textbox)]" : "bg-[var(--textbox)] text-[var(--mid-dark)]"}`}
      >
        <div className="text-center max-w-lg">
          <img
            src={isDark ? "/LogoDark.png" : "/logo.png"}
            alt="Vendor Logo"
            className="h-35 w-90 mb-8 mx-auto transition-all duration-500"
          />

          <p className="text-xl mb-8 leading-relaxed text-center">
            Welcome back, Vendor! Log in to manage your store, track sales, and
            keep your products up to date.
          </p>
        </div>
      </div>
    </div>
  );
}
