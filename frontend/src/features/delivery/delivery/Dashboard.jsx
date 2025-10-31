import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import Navbar from "../Layout/Navbar";
import Footer from "../Layout/Footer";
import ChatBot from "../Layout/ChatBot";
import { setUserFromToken } from "../auth/authSlice";
import { fetchDeliveryProfile } from "./DeliveryAPI";
import { Bot, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleChat = () => setIsChatOpen(!isChatOpen);

  return (
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

          <main
            className="flex-1 p-6 overflow-auto"
            style={{
              backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
            }}
          >
            <Outlet />
          </main>

          <Footer />

          {/* ✅ زر الشات بوت بدعم الوضع الداكن */}
          <button
            onClick={toggleChat}
            className="fixed bottom-8 right-6 p-4 rounded-full shadow-lg transition flex items-center justify-center z-50"
            style={{
              backgroundColor: isDarkMode ? "#307A59" : "#307A59",
              color: isDarkMode ? "#ffffff" : "#ffffff",
              boxShadow: isDarkMode
                ? "0 4px 12px rgba(0,0,0,0.6)"
                : "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            <Bot size={28} />
          </button>

          {/* ✅ المودال يدعم الـ light/dark */}
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                className="fixed top-4 right-4 sm:right-6 z-50 w-full sm:w-96 h-[90vh] sm:h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                  backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                <button
                  onClick={toggleChat}
                  className="absolute top-4 right-4 z-10"
                  style={{
                    color: isDarkMode ? "#f9f9f9" : "#555555",
                  }}
                >
                  <X size={24} />
                </button>

                <h2
                  className="text-xl font-semibold mb-4 flex items-center gap-2 p-4 border-b"
                  style={{
                    borderColor: isDarkMode ? "#f9f9f9" : "#e5e7eb",
                    backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                  }}
                >
                  <Bot size={20} className="text-blue-600" />
                  AI Chatbot
                </h2>

                <div
                  className="flex-grow overflow-auto p-2"
                  style={{
                    backgroundColor: isDarkMode ? "#242625" : "#f9f9f9",
                  }}
                >
                  <ChatBot userId={currentUser?.id || "guest"} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
