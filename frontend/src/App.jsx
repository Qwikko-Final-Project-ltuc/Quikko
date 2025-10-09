import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import CustomerRoutes from "./features/customer/CustomerRoutes";
import AdminRoutes from "./features/admin/AdminRoutes";
import DeliveryRoutes from "./features/delivery/routes/deliveryRoutes";
import { fetchCurrentUser } from "./features/customer/customer/cartSlice";
import {
  requestAndSaveToken,
  listenToMessages,
  registerServiceWorker,
} from "./utlis/fcm";
import GenralRoutes from "./features/genral/Routes";
import VendorRoutes from "./features/vendor/vendorroutes";
import CustomerAuthRoutes from "./features/customer/auth/routes";
const RouteSelector = () => {
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) return <AdminRoutes />;
  if (location.pathname.startsWith("/delivery")) return <DeliveryRoutes />;
  if (location.pathname.startsWith("/customer")) return <CustomerRoutes />;
  if (location.pathname.startsWith("/auth")) return <CustomerAuthRoutes />;
  if (location.pathname.startsWith("/vendor")) return <VendorRoutes />;
  return <GenralRoutes />;
};

const App = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.customerAuth.token);

  useEffect(() => {
    const guestCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("guest_token="));

    if (guestCookie && !localStorage.getItem("guest_token")) {
      const token = guestCookie.split("=")[1];
      localStorage.setItem("guest_token", token);
      console.log("✅ Guest token saved in localStorage:", token);
    }
  }, []);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
      registerServiceWorker().then(() => {
        requestAndSaveToken(token);
      });
      listenToMessages((payload) => {
        console.log("Foreground notification:", payload);
        if (payload.notification) {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: "/favicon.ico",
          });
        }
      });
    }
  }, [token, dispatch]);


  return (
    <Routes>
      <Route path="*" element={<RouteSelector />} />
    </Routes>
  );
};
export default App;
