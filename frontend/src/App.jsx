import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { messaging, getToken, onMessage } from "./app/firebase-messaging";
import VendorRoutes from "./features/vendor/routes";

function App() {
  const [fcmToken, setFcmToken] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          Notification.requestPermission().then((permission) => {
            if (permission !== "granted") return;

            getToken(messaging, {
              vapidKey:
                "BLY_cpu5gN9scFU7TMhCd-RMC_meMwCVVry4a97ZPRoDDMYiNztIMRz9i8CEX95_0XNeBk7FMtY0VPyQ-dm2zCU",
              serviceWorkerRegistration: registration,
            })
              .then((token) => {
                console.log("FCM Token:", token);
                setFcmToken(token);
              })
              .catch(console.error);

            onMessage(messaging, (payload) => {
              console.log("Message received:", payload);
              if (payload.notification) {
                new Notification(payload.notification.title, {
                  body: payload.notification.body,
                  icon: "/favicon.ico",
                });
              }
            });
          });
        })
        .catch(console.error);
    }
  }, []);

  const sendTestNotification = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1,
          title: "Test Notification",
          message: "Hello from backend",
          type: "test",
        }),
      });
      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <BrowserRouter>
      <div>

        {/* الراوتات الخاصة بالـ Vendor */}
        <Routes>
          <Route path="/*" element={<VendorRoutes />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;