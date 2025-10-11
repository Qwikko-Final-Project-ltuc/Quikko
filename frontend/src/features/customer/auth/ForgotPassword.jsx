import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("http://localhost:3000/api/auth/forgot-password", { email: data.email });
      
      localStorage.setItem("resetEmail", data.email);

      setMessage(res.data.message || "Check your email for the reset link!");
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
      setMessage("");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg border">
      <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>

      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          {...register("email", { required: "Email is required" })}
          className="w-full p-3 border rounded"
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
