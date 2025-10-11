import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPasswordPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail");

  const onSubmit = async (data) => {
    try {
      await axios.post("http://localhost:3000/api/auth/reset-password", {
        email,
        newPassword: data.password,
      });

      alert("Password updated successfully. You can now login.");

      localStorage.removeItem("resetEmail");

      navigate("/customer/login");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to reset password");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg border">
      <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="password"
          placeholder="New Password"
          {...register("password", { required: "Password is required" })}
          className="w-full p-3 border rounded"
        />
        {errors.password && (
          <p className="text-red-500">{errors.password.message}</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
