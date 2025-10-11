// src/pages/PasswordUpdated.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PasswordUpdated = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail"); // جيب الايميل من localStorage
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return setError("Password cannot be empty");

    try {
      await axios.post("http://localhost:3000/api/auth/update-password", {
        email,
        newPassword: password,
      });

      setMessage("Password updated successfully ✅");
      setError("");

      // احذف الايميل بعد التحديث
      localStorage.removeItem("resetEmail");

      setTimeout(() => navigate("/customer/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update password");
      setMessage("");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-20">
      <h2 className="text-2xl font-bold mb-4 text-center">Set New Password</h2>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="Enter your new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default PasswordUpdated;
