import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import CustomerRoutes from "./features/customer/CustomerRoutes";
import AdminRoutes from "./features/admin/AdminRoutes";
import DeliveryRoutes from "./features/delivery/routes/deliveryRoutes";
import { fetchCurrentUser } from "./features/customer/customer/cartSlice";
import { requestAndSaveToken, registerServiceWorker } from "./utlis/fcm";
import GenralRoutes from "./features/genral/Routes";
import VendorRoutes from "./features/vendor/vendorroutes";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./app/firebase-messaging";
import "./fix-spacing.css";
import { useScrollbar } from "./hooks/useScrollbar";

const RouteSelector = () => {
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) return <AdminRoutes />;
  if (location.pathname.startsWith("/delivery")) return <DeliveryRoutes />;
  if (location.pathname.startsWith("/customer")) return <CustomerRoutes />;
  if (location.pathname.startsWith("/vendor")) return <VendorRoutes />;
  return <GenralRoutes />;
};

const App = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.customerAuth.token);

  const theme = useSelector((state) => state.theme);
  const isDark = theme.mode === "dark";

  useScrollbar();

  useEffect(() => {
    const applyScrollbarStyles = () => {
      const style = document.createElement("style");
      style.id = "global-scrollbar-styles";

      style.textContent = `
        html {
          scrollbar-width: thin;
          scrollbar-color: ${
            isDark ? "#036f4dff #1c222d83" : "#0b7c56ff #f1f5f9"
          };
        }
        html::-webkit-scrollbar { width: 8px; }
        html::-webkit-scrollbar-track { background: ${
          isDark ? "#1c222d83" : "#f1f5f9"
        }; border-radius: 10px; }
        html::-webkit-scrollbar-thumb { background: ${
          isDark ? "#036f4dff" : "#0b7c56ff"
        }; border-radius: 10px; }
        html::-webkit-scrollbar-thumb:hover { background: ${
          isDark ? "#0e8462d8" : "#0a664aff"
        }; }
        
        * {
          scrollbar-width: thin;
          scrollbar-color: ${
            isDark ? "#036f4dff #1c222d83" : "#0b7c56ff #f1f5f9"
          };
        }
        *::-webkit-scrollbar { width: 6px; }
        *::-webkit-scrollbar-track { background: ${
          isDark ? "#1c222d83" : "#f1f5f9"
        }; border-radius: 10px; }
        *::-webkit-scrollbar-thumb { background: ${
          isDark ? "#036f4dff" : "#0b7c56ff"
        }; border-radius: 10px; }
        *::-webkit-scrollbar-thumb:hover { background: ${
          isDark ? "#0e8462d8" : "#0a664aff"
        }; }
      `;

      const existingStyle = document.getElementById("global-scrollbar-styles");
      if (existingStyle) existingStyle.remove();

      document.head.appendChild(style);
    };

    applyScrollbarStyles();
  }, [isDark]);

  useEffect(() => {
    console.log("User token effect fired, token:", token);
    console.log("Current guest token:", localStorage.getItem("guest_token"));

    if (token) {
      if (localStorage.getItem("guest_token")) {
        localStorage.removeItem("guest_token");
        console.log("Guest token removed because user token exists");
      }

      dispatch(fetchCurrentUser());

      registerServiceWorker().then(() => {
        requestAndSaveToken(token);
      });
    }
  }, [token, dispatch]);

  useEffect(() => {
    const fetchGuestToken = async () => {
      if (token) return;

      try {
        const res = await fetch(
          "https://qwikko.onrender.com/api/customers/get-guest-token",
          {
            credentials: "include",
          }
        );

        const guestToken = res.headers.get("Guest-Token");
        if (guestToken && !localStorage.getItem("guest_token")) {
          localStorage.setItem("guest_token", guestToken);
        }
      } catch (err) {
        console.error("Failed to get guest token:", err);
      }
    };

    fetchGuestToken();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const initFCM = async () => {
      // سجل SW
      await registerServiceWorker();

      // جلب FCM token
      const fcmToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      console.log("Generated FCM token:", fcmToken);

      if (fcmToken) {
        localStorage.setItem("fcm_token", fcmToken);

        // ارسال التوكن للباك
        const res = await fetch(
          "https://qwikko.onrender.com/api/notifications/save-fcm-token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ fcmToken }),
          }
        );
        const data = await res.json();
        console.log("FCM token saved response:", data);
      }
    };

    initFCM();

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground notification received:", payload);
      if (payload.notification) {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: "/Qlogo.png",
        });
      }
    });

    return () => unsubscribe();
  }, [token]);

  return (
    <Routes>
      <Route path="*" element={<RouteSelector />} />
    </Routes>
  );
};
export default App;
