
import { useDispatch, useSelector} from "react-redux";
import { useForm } from "react-hook-form";
import { loginCustomer, assignGuestCartAfterLogin } from "./CustomerAuthSlice";
import React, { useEffect  ,useState} from "react"; // useEffect من react

import { fetchCurrentUser } from "../customer/cartSlice";

import { useNavigate, useLocation  } from "react-router-dom";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
    const location = useLocation();

  const { loading, error, token } = useSelector((state) => state.customerAuth);

    const [infoMessage, setInfoMessage] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (location.state?.message) {
      setInfoMessage(location.state.message);
    }
  }, [location.state]);
  const onSubmit = async (data) => {
    const result = await dispatch(loginCustomer(data));


    if (result.meta.requestStatus === "fulfilled") {
      const userResult = await dispatch(fetchCurrentUser());
      // console.log(userResult,"userResult");
      const userId = userResult.payload?.id;

      if (userId) {
        await dispatch(assignGuestCartAfterLogin(userId));
      }

      navigate("/customer/home");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg border">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Customer Login
      </h2>

      {infoMessage && (
        <p className="text-green-600 bg-green-100 p-2 rounded mb-4 text-center">
          {infoMessage}
        </p>
      )}

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
            onClick={() => navigate("/customer/forgot-password")}
          >
            Forgot Password?
          </span>
        </p>
      </form>

      <p className="text-center text-gray-500 mt-4">
        Don't have an account?{" "}
        <span
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigate("/customer/signup")}
        >
          Sign up
        </span>
      </p>
    </div>
  );
};

export default LoginForm;
