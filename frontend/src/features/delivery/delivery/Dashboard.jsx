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
import { FaRobot, FaBrain, FaComments } from "react-icons/fa";

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

          {/* الخلفية من var(--bg) بدل قيم ثابتة */}
          <main
            className="flex-1 p-6 overflow-auto"
            style={{ backgroundColor: "var(--bg)" }}
          >
            <Outlet />
          </main>

          <Footer />

          <button
            onClick={toggleChat}
            className="fixed bottom-20 right-15 p-4 rounded-full shadow-lg transition flex items-center justify-center z-50"
            style={{
              backgroundColor: "var(--button)",
              color:"#ffffff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              border: "none",
            }}
            title="Open Qwikko Chatbot"
            aria-label="Open Qwikko Chatbot"
          >
            <FaRobot size={28} />
          </button>

          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                className="fixed top-4 right-4 sm:right-6 z-50 w-full sm:w-96 h-[90vh] sm:h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                  backgroundColor: "var(--div)",
                  color: "var(--text)",
                }}
              >
                <button
                  onClick={toggleChat}
                  className="absolute top-4 right-4 z-10"
                  style={{ color: "var(--light-gray)" }}
                  title="Close"
                  aria-label="Close chatbot"
                >
                  <X size={24} />
                </button>

                {/* العنوان: شلت border-b نهائيًا واستبدلته بظل خفيف */}
                <h2
                  className="text-base font-semibold flex items-center gap-2 px-4 py-3"
                  style={{
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                    boxShadow: "0 1px 8px rgba(0,0,0,0.06)", // ظل بدل الخط
                  }}
                >
                  <FaRobot
                    size={26}
                    style={{ color: isDarkMode ? "#ffffff" : "#292e2c" }}
                  />
                  Qwikko Chatbot
                </h2>

                {/* جسم المحادثة: خلفية من --bg */}
                <div
                  className="flex-grow overflow-auto p-2"
                  style={{ backgroundColor: "var(--bg)" }}
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
