import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { loginCustomer, loginWithGoogle } from "./CustomerAuthSlice";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.customerAuth);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    dispatch(loginCustomer(data));
  };

  React.useEffect(() => {
    if (token) {
      navigate("/home"); // توجيه المستخدم للصفحة الرئيسية بعد تسجيل الدخول
    }
  }, [token, navigate]);

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
      </form>

      {/* Google Login */}
      <button
        onClick={() => dispatch(loginWithGoogle())}
        className="w-full mt-4 py-3 bg-red-500 text-white rounded font-semibold hover:bg-red-600 transition"
      >
        Continue with Google
      </button>

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
