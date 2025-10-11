import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginDelivery, clearMessages } from "./authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, successMessage } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginDelivery(formData));
  };

    const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);
  

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch(clearMessages());
        navigate("/delivery/dashboard/Home");
      }, 1500);
    }
  }, [successMessage, dispatch, navigate]);

  return (
    <div className="flex min-h-screen">
      {/* Left side - Login form */}
      <div
        className="w-1/2 flex items-center justify-center p-12 "
        style={{
          backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
          color: isDarkMode ? "#ffffff" : "#242625",
        }}
      >
        <div
          className="w-full max-w-md p-6 border rounded-lg shadow "
          style={{
            backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
            color: isDarkMode ? "#ffffff" : "#242625",
          }}
        >
          <h2
            className="text-2xl font-bold mb-6 text-center"
            style={{
              backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
              color: isDarkMode ? "#ffffff" : "#242625",
            }}
          >
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-3 rounded focus:ring-2 focus:ring-black-500"
              style={{
                backgroundColor: isDarkMode ? "#f9f9f9" : "#f9f9f9",
                color: isDarkMode ? "#242625" : "#242625",
              }}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border p-3 rounded focus:ring-2 focus:ring-black-500"
              style={{
                backgroundColor: isDarkMode ? "#f9f9f9" : "#f9f9f9",
                color: isDarkMode ? "#242625" : "#242625",
              }}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 rounded-lg transition duration-300 ease-in-out 
              hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              style={{
                backgroundColor: isDarkMode ? "#307A59" : "#307A59",
                color: isDarkMode ? "#f9f9f9" : "#f9f9f9",
              }}
            >
              {loading ? "Logging in..." : "Login"}
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
            Don’t have an account?{" "}
            <button
              onClick={() => navigate("/delivery/register")}
              className="te hover:underline cursor-pointer"
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              Register here
            </button>
          </p>
        </div>
      </div>

      <div
        className="w-1/2  p-6 relative h-[100vh]"
        style={{
          backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
          color: isDarkMode ? "#ffffff" : "#242625",
        }}
      >
        <img
          src={isDarkMode ? "/darklogo.png" : "/logo.png"}
          alt="Qwikko Logo"
          className="w-80 h-80 object-contain absolute top-25 left-1/2 transform -translate-x-1/2"
        />
        <p
          className="text-2xl max-w-md absolute top-[360px] left-1/2 transform -translate-x-1/2 text-center"
          style={{
            color: isDarkMode ? "#ffffff" : "#242625",
          }}
        >
          Welcome Back! Log in to continue managing your deliveries and access
          your dashboard.
        </p>
      </div>
    </div>
  );
}
