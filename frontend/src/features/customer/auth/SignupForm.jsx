import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { registerCustomer } from "./CustomerAuthSlice";
import { useNavigate } from "react-router-dom";

const SignupForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.customerAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    dispatch(registerCustomer(data));
  };

  // لو تم التسجيل نوجه المستخدم للصفحة الرئيسية أو صفحة اللوغ ان
  React.useEffect(() => {
  if (user) {
    alert("Please check your email to verify your account before logging in.");
    navigate("/auth/login");
  }
}, [user, navigate]);

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg border">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Customer Signup
      </h2>

      {error && (
        <p className="text-red-600 bg-red-100 p-2 rounded mb-4 text-center">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          {...register("name", { required: "Name is required" })}
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          {...register("email", { required: "Email is required" })}
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}

        <input
          type="password"
          placeholder="Password"
          {...register("password", { required: "Password is required" })}
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}

        <input
          type="text"
          placeholder="Phone (optional)"
          {...register("phone")}
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <input
          type="text"
          placeholder="Address (optional)"
          {...register("address")}
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700 transition"
        >
          {loading ? "Registering..." : "Sign Up"}
        </button>
      </form>


      <p className="text-center text-gray-500 mt-4">
        Already have an account?{" "}
        <span
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigate("/auth/login")}
        >
          Login
        </span>
      </p>
    </div>
  );
};

export default SignupForm;
