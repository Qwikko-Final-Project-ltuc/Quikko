import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { loginCustomer, assignGuestCartAfterLogin } from "./CustomerAuthSlice";

import { fetchCurrentUser } from "../customer/cartSlice";

import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.customerAuth);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    // 1️⃣ تسجيل الدخول
    const result = await dispatch(loginCustomer(data));

    if (result.meta.requestStatus === "fulfilled") {
      // 2️⃣ جلب بيانات المستخدم بعد login
      const userResult = await dispatch(fetchCurrentUser());
      const userId = userResult.payload?.id;

      if (userId) {
        // 3️⃣ نقل cart الغوست أو إنشاء cart جديد
        await dispatch(assignGuestCartAfterLogin(userId));
      }

  React.useEffect(() => {
    if (token) {
      navigate("/home"); // توجيه المستخدم للصفحة الرئيسية بعد تسجيل الدخول
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg border">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Customer Login
      </h2>

      {error && (
        <p className="text-red-600 bg-red-100 p-2 rounded mb-4 text-center">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          {...register("email", { required: "Email is required" })}
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

        <input
          type="password"
          placeholder="Password"
          {...register("password", { required: "Password is required" })}
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-gray-500 mt-2">
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate("/auth/forgot-password")}
          >
            Forgot Password?
          </span>
        </p>
      </form>

      <p className="text-center text-gray-500 mt-4">
        Don't have an account?{" "}
        <span
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigate("/auth/signup")}
        >
          Sign up
        </span>
      </p>
    </div>
  );
};

export default LoginForm;
