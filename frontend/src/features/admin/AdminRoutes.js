// src/features/admin/routes/AdminRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import Layout from "../layout/layout";
import AdminHome from "../dashboard/dashboard";
import VendorPage from "../vendor/vendor";
import DeliveryPage from "../delivery/delivery";
import OrderPage from "../orders/order";
import CMSPage from "../CMS/cms";
import Profile from "../layout/profile";
import LoginForm from "../auth/loginForm";
import NotFound from "../../notFound";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/adminLogin" element={<LoginForm />} />
      <Route element={<Layout />}>
        <Route
          path="/adminHome"
          element={
            <ProtectedRoute role="admin">
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminVendors"
          element={
            <ProtectedRoute role="admin">
              <VendorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminDelivery"
          element={
            <ProtectedRoute role="admin">
              <DeliveryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminOrders"
          element={
            <ProtectedRoute role="admin">
              <OrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminCms"
          element={
            <ProtectedRoute role="admin">
              <CMSPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminProfile"
          element={
            <ProtectedRoute role="admin">
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AdminRoutes;
