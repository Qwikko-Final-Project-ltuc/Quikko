// DashboardLayout.jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import Navbar from "../Layout/Navbar";
import Footer from "../Layout/Footer";
import ChatBot from "../Layout/ChatBot";
import { setUserFromToken } from "../auth/authSlice";
import { fetchDeliveryProfile } from "./Api/DeliveryAPI";
import { X } from "lucide-react";
import { FaRobot } from "react-icons/fa";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const currentUser = useSelector((state) => state.deliveryAuth?.user);
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

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
  const toggleChat = () => setIsChatOpen((v) => !v);

return (
  <div className={isDarkMode ? "dark" : ""}>
    <div
      className="flex min-h-screen w-full"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      {/* سايدبار */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* صفحة كاملة — عليها السكول */}
      <div
        id="page"
        className="flex-1 flex flex-col transition-all duration-300  overscroll-contain"
        style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
      >
        {/* نافبار */}
        <Navbar
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          user={user || { name: "Guest" }}
        />

        {/* المحتوى */}
        <main
          className="flex-1 p-6 "
          style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
        >
          <Outlet />
        </main>

        {/* الفوتر */}
        <div className="relative z-10 mt-auto">
          <Footer />
        </div>

        {/* زر الشاتبوت */}
        <button
          onClick={toggleChat}
          className="fixed right-4 sm:bottom-6 p-4 rounded-full shadow-lg transition flex items-center justify-center z-[9999]"
          style={{
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 90px)",
            backgroundColor: "var(--button)",
            color: "#fff",
          }}
        >
          <FaRobot size={28} />
        </button>

        {/* نافذة الشات */}
        {isChatOpen && (
          <div
            className="fixed right-4 sm:right-6 z-50 w-[calc(100%-2rem)] sm:w-96 h-[85vh] sm:h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{
              bottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)",
              backgroundColor: "var(--div)",
              color: "var(--text)",
            }}
          >
            <button
              onClick={toggleChat}
              className="absolute top-4 right-4 z-10"
              style={{ color: "var(--light-gray)" }}
            >
              <X size={24} />
            </button>

            <h2
              className="text-base font-semibold flex items-center gap-2 px-4 py-3"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--mid-dark)"
                  : "var(--textbox)",
              }}
            >
              <FaRobot size={26} />
              Qwikko Chatbot
            </h2>

            <div
              className="flex-grow overflow-auto p-2"
              style={{ backgroundColor: "var(--bg)" }}
            >
              <ChatBot userId={currentUser?.id || "guest"} />
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

}
