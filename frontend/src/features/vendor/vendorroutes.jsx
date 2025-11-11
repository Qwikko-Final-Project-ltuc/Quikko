// src/features/vendor/VendorRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import VendorLayout from "./VendorLayout";
import VendorLanding from "./VendorLanding";
import Login from "./auth/Login";
import RegisterVendor from "./auth/RegisterVendor";
import VendorDashboard from "./dashboard/VendorDashboard";
import ProductManagement from "./product/ProductManagement";
import OrderManagement from "./order/OrderManagement";
// import ChatPage from "./chat/ChatPage";
import ReportsPage from "./profile/VendorProfilePage";
import SettingsPage from "./settings/SettingsPage";
import VendorProfilepage from "./profile/VendorProfilePage";
import ProtectedRoute from "./ProtectedRoute";
import VendorNotifications from "./VendorNotifications";
import ChatPage from "./chat/vendorChat";
import CouponManagement from "./coupons/CouponsManagement";


import ContactUs from "../customer/customer/pages/ContactUs";
import AboutPage from "../genral/aboutPage/about";
import PrivacyPolicy from "../genral/PrivacyPolicy";
import TermsOfService from "../genral/TermsOfService";


// صفحات جديدة
import VendorForgotPassword from "./auth/VendorForgotPassword";
import VendorResetPassword from "./auth/VendorResetPassword";
import VerifyEmailPage from "./auth/VerifyEmailPage";


export default function VendorRoutes() {
  return (
    <Routes>
      <Route path="/vendor" element={<VendorLayout />}>
        {/* Landing Page عند الدخول على /vendor */}
        <Route index element={<VendorLanding />} />

        {/* Auth */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<RegisterVendor />} />
        <Route path="/vendor/verify-email" element={<VerifyEmailPage />} />
        <Route path="forgot-password" element={<VendorForgotPassword />} />
        <Route path="reset-password" element={<VendorResetPassword />} />




        {/* الصفحات المحمية */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="products"
          element={
            <ProtectedRoute>
              <ProductManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <OrderManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <VendorProfilepage />
            </ProtectedRoute>
          }
        />
        <Route path="notifications" element={<VendorNotifications />} />
        <Route
          path="coupons"
          element={
            <ProtectedRoute>
              <CouponManagement />
            </ProtectedRoute>
          }
        />

        <Route path="/vendor/contact" element={<ContactUs />} />
        <Route path="/vendor/about" element={<AboutPage />} />
        <Route path="/vendor/privacy" element={<PrivacyPolicy />} />
        <Route path="/vendor/terms" element={<TermsOfService />} />

      </Route>
      
    </Routes>
  );
}
