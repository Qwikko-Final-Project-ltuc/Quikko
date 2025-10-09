import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerDelivery, clearMessages } from "./authSlice";
import {
  FaShoppingBag,
  FaUser,
  FaEnvelope,
  FaLock,
  FaBuilding,
  FaPhone,
} from "react-icons/fa";
import logo from "../../../assets/LogoDark.png";

export default function RegisterDelivery() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, successMessage } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company_name: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }
    dispatch(registerDelivery(formData));
  };

  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch(clearMessages());
        navigate("/delivery/login");
      }, 1500);
    }
  }, [successMessage, dispatch, navigate]);

  return (
    <div className="flex min-h-screen">
      {/* Left side */}
      <div
        className="w-1/2 p-6 relative h-[100vh]"
        style={{
          backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
          color: isDarkMode ? "#ffffff" : "#242625",
        }}
      >
        <img
          src={isDarkMode ? "/darklogo.png" : "/logo.png"}
          alt="Qwikko Logo"
          className="w-100 h-100 object-contain absolute top-25 left-1/2 transform -translate-x-1/2"
        />
        <p
          className="text-2xl max-w-md absolute top-[360px] left-1/2 transform -translate-x-1/2 text-center"
          style={{
            color: isDarkMode ? "#ffffff" : "#242625",
          }}
        >
          Welcome to Qwikko! Start your delivery journey with us.
        </p>
      </div>

      {/* Right side */}
      <div
        className="w-1/2 flex flex-col justify-center items-center p-12 "
        style={{
          backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
          color: isDarkMode ? "#ffffff" : "#242625",
        }}
      >
        <h2
          className="text-3xl font-bold mb-6"
          style={{
            color: isDarkMode ? "#ffffff" : "#242625",
          }}
        >
          Register Delivery Company
        </h2>

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <div className="relative">
            <input
              type="text"
              name="name"
              placeholder="Contact Person Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              style={{
                backgroundColor: isDarkMode ? "#f9f9f9" : "#f9f9f9",
                color: isDarkMode ? "#242625" : "#242625",
              }}
              required
            />
            <FaUser
              className="absolute right-3 top-1/2 transform -translate-y-1/2 "
              style={{
                color: isDarkMode ? "#242625" : "#242625",
              }}
            />
          </div>

          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              style={{
                backgroundColor: isDarkMode ? "#f9f9f9" : "#f9f9f9",
                color: isDarkMode ? "#242625" : "#242625",
              }}
              required
            />
            <FaEnvelope
              className="absolute right-3 top-1/2 transform -translate-y-1/2 "
              style={{
                color: isDarkMode ? "#242625" : "#242625",
              }}
            />
          </div>

          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border p-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              style={{
                backgroundColor: isDarkMode ? "#f9f9f9" : "#f9f9f9",
                color: isDarkMode ? "#242625" : "#242625",
              }}
              required
            />
            <FaLock
              className="absolute right-3 top-1/2 transform -translate-y-1/2 "
              style={{
                color: isDarkMode ? "#242625" : "#242625",
              }}
            />
          </div>
          <div className="relative">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border p-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              style={{
                backgroundColor: isDarkMode ? "#f9f9f9" : "#f9f9f9",
                color: isDarkMode ? "#242625" : "#242625",
              }}
              required
            />
            <FaLock
              className="absolute right-3 top-1/2 transform -translate-y-1/2 "
              style={{
                color: isDarkMode ? "#242625" : "#242625",
              }}
            />
          </div>

          <div className="relative">
            <input
              type="text"
              name="company_name"
              placeholder="Company Name"
              value={formData.company_name}
              onChange={handleChange}
              className="w-full border p-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              style={{
                backgroundColor: isDarkMode ? "#f9f9f9" : "#f9f9f9",
                color: isDarkMode ? "#242625" : "#242625",
              }}
              required
            />
            <FaBuilding
              className="absolute right-3 top-1/2 transform -translate-y-1/2 "
              style={{
                color: isDarkMode ? "#242625" : "#242625",
              }}
            />
          </div>

          <div className="relative">
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border p-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              style={{
                backgroundColor: isDarkMode ? "#f9f9f9" : "#f9f9f9",
                color: isDarkMode ? "#242625" : "#242625",
              }}
            />
            <FaPhone
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              style={{
                color: isDarkMode ? "#242625" : "#242625",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full  p-3 rounded-lg transition-all duration-300  hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDarkMode ? "#307A59" : "#307A59",
              color: isDarkMode ? "#f9f9f9" : "#f9f9f9",
            }}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {error && <p className="mt-4 text-center text-red-600">{error}</p>}
        {successMessage && (
          <p
            className="mt-4 text-center "
            style={{
              color: isDarkMode ? "#ffffff" : "#242625",
            }}
          >
            {successMessage}
          </p>
        )}

        <p
          className="mt-6 text-center text-sm"
          style={{
            color: isDarkMode ? "#ffffff" : "#242625",
          }}
        >
          Already have an account?{" "}
          <button
            onClick={() => navigate("/delivery/login")}
            className=" hover:underline cursor-pointer"
            style={{
              color: isDarkMode ? "#ffffff" : "#242625",
            }}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}
