import { loginAdmin, profile } from "./authApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useSelector } from "react-redux";

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    let isValid = true;

    if (formData.email.trim() === "") {
      setEmailError("email field cannot be empty!");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (formData.password.trim() === "") {
      setPasswordError("password field cannot be empty!");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!isValid) return;

    try {
      const data = await loginAdmin(formData);

      const token = data.token;

      localStorage.setItem("token", token);

      const profileData = await profile();
      localStorage.setItem("user", JSON.stringify(profileData.user));

      if (profileData.user.role) {
        localStorage.setItem("role", profileData.user.role);
      }

      navigate("/adminHome");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div
      className={`flex min-h-screen transition-colors duration-500
      ${
        isDark
          ? "bg-[var(--bg)] text-[var(--text)]"
          : "bg-[var(--bg)] text-[var(--text)]"
      }`}
    >
      {/* Left Section */}
      <div
        className={`w-1/2 flex flex-col justify-center items-center p-12 rounded-lg transition-colors duration-500
        ${isDark ? "bg-[var(--div)]" : "bg-[var(--bg)]"}`}
      >
        <h2
          className={`text-3xl font-bold mb-6 transition-colors duration-500 ${
            isDark ? "text-[var(--text)]" : "text-[var(--text)]"
          }`}
        >
          Admin Login
        </h2>

        <form className="w-full max-w-md space-y-6">
          <div className="flex flex-col w-full relative">
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300
                  ${
                    isDark
                      ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                      : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                  }`}
                required
              />
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <MdEmail
                  className={`text-xl transition-colors duration-500 ${
                    isDark
                      ? "text-[var(--mid-dark)]"
                      : "text-[var(--light-gray)]"
                  }`}
                />
              </span>
            </div>
            <div className="h-5">
              {emailError && (
                <p
                  className={`text-sm mt-1 transition-colors duration-300 ${
                    isDark ? "text-[var(--error)]" : "text-[var(--error)]"
                  }`}
                >
                  {emailError}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col w-full relative">
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full border p-3 pr-12 rounded-lg focus:outline-none transition-all duration-300
                  ${
                    isDark
                      ? "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                      : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-2 focus:ring-[var(--button)]"
                  }`}
                required
              />
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <FaLock
                  className={`text-xl transition-colors duration-500 ${
                    isDark
                      ? "text-[var(--mid-dark)]"
                      : "text-[var(--light-gray)]"
                  }`}
                />
              </span>
            </div>
            <div className="h-5">
              {passwordError && (
                <p
                  className={`text-sm mt-1 transition-colors duration-300 ${
                    isDark ? "text-[var(--error)]" : "text-[var(--error)]"
                  }`}
                >
                  {passwordError}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            onClick={handleLogin}
            className={`w-full p-3 rounded-lg font-semibold transition-all duration-300
            bg-[var(--button)] text-white 
            hover:bg-[var(--button)] hover:text-white 
            hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] 
            disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed`}
          >
            Login
          </button>

          {/* Forgot Password */}
          <p className="text-center">
            <span
              className={`cursor-pointer transition-colors duration-300 ${
                isDark
                  ? "text-[var(--primary)] hover:text-[var(--primary)]"
                  : "text-[var(--primary)] hover:text-[var(--primary)]"
              } hover:underline`}
              onClick={() => navigate("/customer/forgot-password")}
            >
              Forgot Password?
            </span>
          </p>
        </form>
      </div>

      {/* Right Section - Welcome */}
      <div
        className={`w-1/2 flex flex-col justify-center items-center p-12 transition-colors duration-500
        ${isDark ? "bg-[var(--textbox)] text-[var(--text)]" : "bg-[var(--textbox)] text-[var(--text)]"}`}
      >
        <img
          src={isDark ? "/LogoDark.png" : "/logo.png"}
          alt="Qwikko Logo"
          className="h-30 w-100 mb-6 transition-all duration-500"
        />
        <p className="text-xl max-w-md text-center leading-relaxed">
          Welcome to Qwikko! Please log in to access the Qwikko dashboard and manage
          the platform.
        </p>
      </div>
    </div>
  );
}
