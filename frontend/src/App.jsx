// import { useEffect, useState } from "react";
// import { messaging, getToken, onMessage } from "./app/firebase-messaging";
// import { useEffect, useState } from "react";
// import { messaging, getToken, onMessage } from "./app/firebase-messaging";

// function App() {
//   const [fcmToken, setFcmToken] = useState("");

//   useEffect(() => {
//     if ("serviceWorker" in navigator) {
//       navigator.serviceWorker
//         .register("/firebase-messaging-sw.js")
//         .then(registration => {
//           // طلب إذن الإشعارات
//           Notification.requestPermission().then(permission => {
//             if (permission !== "granted") return;

//             // جلب FCM token
//             getToken(messaging, {
//               vapidKey: "BLY_cpu5gN9scFU7TMhCd-RMC_meMwCVVry4a97ZPRoDDMYiNztIMRz9i8CEX95_0XNeBk7FMtY0VPyQ-dm2zCU",
//               serviceWorkerRegistration: registration
//             })
//               .then(token => {
//                 console.log("FCM Token:", token);
//                 setFcmToken(token);
//               })
//               .catch(console.error);

//             // استقبال الرسائل عند الصفحة المفتوحة
//             onMessage(messaging, payload => {
//               console.log("Message received:", payload);
//               if (payload.notification) {
//                 new Notification(payload.notification.title, {
//                   body: payload.notification.body,
//                   icon: "/favicon.ico"
//                 });
//               }
//             });
//           });
//         })
//         .catch(console.error);
//     }
//   }, []);

//   const sendTestNotification = async () => {
//   try {
//     const res = await fetch("http://localhost:3000/api/notifications", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         userId: 1, // user id
//         title: "Test Notification",
//         message: "Hello from backend",
//         type: "test"
//       })
//     });
//     const data = await res.json();
//     console.log(data);
//   } catch (err) {
//     console.error(err);
//   }
// };

//   return (
//     <div>
//       <h1>React + FCM Test</h1>
//       <button onClick={sendTestNotification}>Send Test Notification</button>
//     </div>
//   );
// }

// export default App;// App.jsx

import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import MainLayout from "./features/customer/customer/components/layout/MainLayout";

import CustomerAuthRoutes from "./features/customer/auth/routes";
import ProductsPage from "./features/customer/customer/pages/ProductsPage";
import ProfilePage from "./features/customer/customer/pages/ProfilePage";
import OrdersPage from "./features/customer/customer/pages/OrdersPage";
import OrderDetailsPage from "./features/customer/customer/pages/OrderDetailsPage";
import StorePage from "./features/customer/customer/pages/StorePage";
import CartListPage from "./features/customer/customer/pages/CartListPage";
import CartDetailPage from "./features/customer/customer/pages/CartDetailPage";

// ✅ استدعاء الـ thunk لجلب المستخدم
import { fetchCurrentUser } from "./features/customer/customer/cartSlice";
import StoresPage from "./features/customer/customer/pages/StoresPage";
import TrackOrderPage from "./features/customer/customer/pages/TrackOrderPage";
import PaymentDetailsPage from "./features/customer/customer/pages/PaymentDetailsPage";
import LandingPage from "./features/customer/customer/pages/LandingPage";
import HomePage from "./features/customer/customer/pages/HomePage";
import SettingsPage from "./features/customer/customer/pages/SettingsPage";

// صفحات الادمن
import LoginForm from "./features/admin/auth/loginForm";
import ProtectedRoute from "./features/admin/auth/ProtectedRoute";
import AdminHome from "./features/admin/dashboard/dashboard";
import Layout from "./features/admin/layout/layout";
import VendorPage from "./features/admin/vendor/vendor";
import DeliveryPage from "./features/admin/delivery/delivery";
import OrderPage from "./features/admin/orders/order";
import CMSPage from "./features/admin/CMS/cms";
import Profile from "./features/admin/layout/profile";
import WishlistPage from "./features/customer/wishlist/wishlistPage";
import NotFound from "./features/notFound";
import AboutPage from "./features/customer/aboutPage/about";

const AppRoutes = () => {
  const token = useSelector((state) => state.customerAuth.token);
  const location = useLocation();

  // if (!token && !location.pathname.startsWith("/auth")) {
  //   return <Navigate to="/auth/login" replace />;
  // }

  return (
    <>
      {location.pathname.startsWith("/admin") ? (
        <Routes>
          <Route path="/adminLogin" element={<LoginForm />} />
          <Route
            element={
              <div className="flex">
                <Layout />
              </div>
            }
          >
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
      ) : (
        <Routes>
          <Route path="/auth/*" element={<CustomerAuthRoutes />} />
          {/* <Route
          path="/"
          element={token ? <Navigate to="/home" replace /> : <LandingPage />}
        /> */}

          {/* Routes بعد تسجيل الدخول */}
          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/cart" element={<CartListPage key={Date.now()} />} />
            <Route path="/cart/:id" element={<CartDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route
              path="/order-details/:orderId"
              element={<OrderDetailsPage />}
            />
            <Route path="/stores" element={<StoresPage />} />
            <Route path="/stores/:id" element={<StorePage />} />
            <Route path="/track-order/:orderId" element={<TrackOrderPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/payment-details" element={<PaymentDetailsPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
          {/* <Route
          path="*"
          element={<Navigate to={token ? "/" : "/auth/login"} replace />}
        /> */}
        </Routes>
      )}
    </>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.customerAuth.token);
  // function App() {
  //   const [fcmToken, setFcmToken] = useState("");

  //   useEffect(() => {
  //     if ("serviceWorker" in navigator) {
  //       navigator.serviceWorker
  //         .register("/firebase-messaging-sw.js")
  //         .then(registration => {
  //           // طلب إذن الإشعارات
  //           Notification.requestPermission().then(permission => {
  //             if (permission !== "granted") return;

  //             // جلب FCM token
  //             getToken(messaging, {
  //               vapidKey: "BLY_cpu5gN9scFU7TMhCd-RMC_meMwCVVry4a97ZPRoDDMYiNztIMRz9i8CEX95_0XNeBk7FMtY0VPyQ-dm2zCU",
  //               serviceWorkerRegistration: registration
  //             })
  //               .then(token => {
  //                 console.log("FCM Token:", token);
  //                 setFcmToken(token);
  //               })
  //               .catch(console.error);

  //             // استقبال الرسائل عند الصفحة المفتوحة
  //             onMessage(messaging, payload => {
  //               console.log("Message received:", payload);
  //               if (payload.notification) {
  //                 new Notification(payload.notification.title, {
  //                   body: payload.notification.body,
  //                   icon: "/favicon.ico"
  //                 });
  //               }
  //             });
  //           });
  //         })
  //         .catch(console.error);
  //     }
  //   }, []);

  //   const sendTestNotification = async () => {
  //   try {
  //     const res = await fetch("http://localhost:3000/api/notifications", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         userId: 1, // user id
  //         title: "Test Notification",
  //         message: "Hello from backend",
  //         type: "test"
  //       })
  //     });
  //     const data = await res.json();
  //     console.log(data);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  //   return (
  //     <div>
  //       <h1>React + FCM Test</h1>
  //       <button onClick={sendTestNotification}>Send Test Notification</button>
  //     </div>
  //   );
  // }


  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [token, dispatch]);

  return <AppRoutes />;
};

export default App;
