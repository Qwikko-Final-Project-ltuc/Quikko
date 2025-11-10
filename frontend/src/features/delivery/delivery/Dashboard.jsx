// DashboardLayout.jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
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
  const location = useLocation(); 
  const { user } = useSelector((state) => state.auth);
  const currentUser = useSelector((state) => state.deliveryAuth?.user);
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);
  const isChatPage = location.pathname.includes('/chat');
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
        {!isChatPage && (
            <div className="relative z-10 mt-auto">
              <Footer />
            </div>
          )}

        {/* زر الشاتبوت */}
        <button
          onClick={toggleChat}
          className="fixed right-4 md:right-6 p-4 rounded-full shadow-lg transition flex items-center justify-center z-[9998] md:bottom-6"
          style={{
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 90px)", // موبايل أعلى شوي
            backgroundColor: "var(--button)",
            color: "#fff",
          }}
          title="Open Qwikko Chatbot"
          aria-label="Open Qwikko Chatbot"
        >
          <FaRobot size={28} />
        </button>

        {/* نافذة الشات */}
        {isChatOpen && (
          <div
            className="
      fixed
      inset-x-0 bottom-0 top-auto
      md:inset-auto md:top-6 md:right-6
      w-full md:w-96
      h-[75vh] sm:h-[80vh] md:h-[85vh]
      rounded-t-2xl md:rounded-2xl
      shadow-2xl flex flex-col overflow-hidden
      z-[9999]
    "
            style={{
              backgroundColor: "var(--div)",
              color: "var(--text)",
              marginBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            <button
              onClick={toggleChat}
              className="absolute top-3 right-3 md:top-4 md:right-4 z-10"
              style={{ color: "var(--light-gray)" }}
              aria-label="Close chatbot"
            >
              <X size={24} />
            </button>

            <h2
              className="text-sm sm:text-base font-semibold flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3"
              style={{
                backgroundColor: isDarkMode ? "var(--mid-dark)" : "var(--textbox)",
              }}
            >
              <FaRobot size={22} />
              Qwikko Chatbot
            </h2>

            <div
              className="flex-grow overflow-auto p-2 sm:p-3"
              style={{
                backgroundColor: "var(--bg)",
                overscrollBehavior: "contain",
              }}
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
