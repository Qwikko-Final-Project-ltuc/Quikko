import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./customer/components/layout/MainLayout";
import HomePage from "./customer/pages/HomePage";
import LandingPage from "./customer/pages/LandingPage";
import ProductsPage from "./customer/pages/ProductsPage";
import ProfilePage from "./customer/pages/ProfilePage";
import OrdersPage from "./customer/pages/OrdersPage";
import OrderDetailsPage from "./customer/pages/OrderDetailsPage";
import StoresPage from "./customer/pages/StoresPage";
import StorePage from "./customer/pages/StorePage";
import TrackOrderPage from "./customer/pages/TrackOrderPage";
import SettingsPage from "./customer/pages/SettingsPage";
import PaymentDetailsPage from "./customer/pages/PaymentDetailsPage";
import WishlistPage from "./wishlist/wishlistPage";
import AboutPage from "../genral/aboutPage/about";
import CartListPage from "./customer/pages/CartListPage";
import CartDetailPage from "./customer/pages/CartDetailPage";
import NotFound from "../notFound";
import ProductDetails from "./customer/pages/ProductDetails";

import LoginForm from "./auth/LoginForm";
import SignupForm from "./auth/SignupForm";
import ForgotPassword from "./auth/ForgotPassword";
import VerifyEmailPage from "./auth/VerifyEmailPage";
import ResetPasswordPage from "./auth/ResetPasswordPage";
import ContactUs from "./customer/pages/ContactUs";
//import ChatPage from "./customer/pages/ChatPage";
import PasswordUpdated from "./auth/PasswordUpdated";
import ChatPage from "./customer/pages/CustomerChat";




const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path="/customer/login" element={<LoginForm />} />
      <Route path="/customer/signup" element={<SignupForm />} />
      <Route path="/customer/forgot-password" element={<ForgotPassword />} /> 
      <Route path="/customer/verify-email" element={<VerifyEmailPage />} />
      <Route path="/customer/reset-password" element={<ResetPasswordPage />} />


      <Route path="/customer/password-updated" element={<PasswordUpdated />} />

      <Route element={<MainLayout />}>
        <Route path="/customer/home" element={<HomePage />} />
        <Route path="/customer/landing" element={<LandingPage />} />
        <Route path="/customer/products" element={<ProductsPage />} />
        <Route path="/customer/cart" element={<CartListPage />} />
        <Route path="/customer/cart/:id" element={<CartDetailPage />} />
        <Route path="/customer/orders" element={<OrdersPage />} />
        <Route path="/customer/order-details/:orderId" element={<OrderDetailsPage />} />
        <Route path="/customer/stores" element={<StoresPage />} />
        <Route path="/customer/stores/:id" element={<StorePage />} />
        <Route path="/customer/track-order/:orderId" element={<TrackOrderPage />} />
        <Route path="/customer/settings" element={<SettingsPage />} />
        <Route path="/customer/payment-details" element={<PaymentDetailsPage />} />
        <Route path="/customer/wishlist" element={<WishlistPage />} />
        <Route path="/customer/about" element={<AboutPage />} />
        <Route path="/customer/profile" element={<ProfilePage />} />
        <Route path="/customer/contact" element={<ContactUs />} />
        <Route path="/customer/chat" element={<ChatPage />} />
        <Route path="/customer/product/:id" element={<ProductDetails />} />

      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default CustomerRoutes;
