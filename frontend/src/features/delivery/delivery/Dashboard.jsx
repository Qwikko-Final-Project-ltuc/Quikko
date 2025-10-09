import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import Navbar from "../Layout/Navbar";
import Footer from "../Layout/Footer";
import { setUserFromToken } from "../auth/authSlice";
import { fetchDeliveryProfile } from "./DeliveryAPI";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      fetchDeliveryProfile(savedToken)
        .then((fetchedData) => {
          dispatch(
            setUserFromToken({
              user: fetchedData.company,
              token: savedToken,
            })
          );
        })
        .catch((err) => {
          console.error("Failed to fetch user from token:", err);
          localStorage.removeItem("token");
        });
    }
  }, [dispatch]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    // هذا الأب يحتوي الـ dark class حسب قيمة الـ Redux
    <div className={isDarkMode ? "dark" : ""}>
      <div className="flex h-screen w-full">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <Navbar
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            user={user || { name: "Guest" }}
          />

          {/* main يستخدم الألوان من Tailwind config */}
          <main
            className="flex-1 p-6 overflow-auto"
            style={{ backgroundColor: isDarkMode ? "#242625" : "#f0f2f1" }}
          >
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}
