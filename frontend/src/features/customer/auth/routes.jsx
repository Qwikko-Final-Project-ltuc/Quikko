import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import ForgotPassword from "./ForgotPassword";
import VerifyEmailPage from "./VerifyEmailPage";
import ResetPasswordPage from "./ResetPasswordPage";

const CustomerAuthRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginForm />} />
      <Route path="signup" element={<SignupForm />} />
      <Route path="forgot-password" element={<ForgotPassword />} /> 
      <Route path="verify-email" element={<VerifyEmailPage />} />
      <Route path="reset-password" element={<ResetPasswordPage />} />


    </Routes>
  );
};

export default CustomerAuthRoutes;
