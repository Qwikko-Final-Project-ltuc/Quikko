import { loginAdmin, profile } from "./authApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

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
    <div className="flex min-h-screen">
      {/* Left Section */}
      <div className="w-1/2 flex flex-col justify-center items-center p-12 bg-white">
        <h2 className="text-3xl font-bold mb-6">Login</h2>

        <form className="w-full max-w-md space-y-6">
          <div className="flex flex-col w-full relative">
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <MdEmail className="text-gray-500 text-xl" />
              </span>
            </div>

            <div className="h-5">
              {emailError && (
                <p className="text-red-600 text-sm mt-1">{emailError}</p>
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
                className="w-full border p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-500 text-xl" />
              </span>
            </div>

            <div className="h-5">
              {passwordError && (
                <p className="text-red-600 text-sm mt-1">{passwordError}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            onClick={handleLogin}
            className="w-full bg-black text-white p-3 rounded-lg transition-all duration-300 hover:bg-gray-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            Login
          </button>
        </form>
      </div>
      {/* Right Section */}
      <div className="w-1/2 bg-black text-white flex flex-col justify-center items-center p-12">
        <h1 className="text-5xl font-extrabold mb-6">Qwikko</h1>
        <p className="text-xl max-w-md text-center">
          Welcome Admin! Please log in to access the Qwikko dashboard and manage
          the platform.
        </p>
      </div>
    </div>
  );
}
