import { Outlet, useNavigate, useLocation } from "react-router-dom";
import SideBar from "./sideBar";
import { FiChevronDown, FiMenu, FiSun, FiMoon } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../dark-lightMode/themeSlice";

import ChatBot from "./ChatBot";
import { Bot, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);


  const [isChatOpen, setIsChatOpen] = useState(false);
  const toggleChat = () => setIsChatOpen(!isChatOpen);
  const currentUser = useSelector((state) => state.customerAuth.user);

  const dispatch = useDispatch();
  const isDark = useSelector((state) => state.theme.mode === "dark");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTitle = () => {
    switch (location.pathname) {
      case "/adminHome":
        return "Dashboard";
      case "/adminVendors":
        return "Vendors";
      case "/adminDelivery":
        return "Delivery Companies";
      case "/adminOrders":
        return "Order Monitoring";
      case "/adminCms":
        return "Content Management Page (CMS)";
      case "/adminProfile":
        return "Profile";
      default:
        return "Home";
    }
  };

  return (
    <div
      className={`flex h-screen w-full transition-colors duration-500 ease-in-out
      ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100"
          : "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 text-gray-900"
      }`}
    >
      <SideBar isOpen={isSidebarOpen} isDark={isDark} />

      <div className="flex-1 flex flex-col min-h-0">
        <header
          className={`sticky top-0 z-20 flex justify-between items-center shadow px-6 py-4 transition-colors duration-500 ease-in-out
          ${isDark ? "bg-gray-800" : "bg-white"}`}
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-md transition-colors duration-500 ease-in-out
                ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
            >
              <FiMenu
                className={`w-6 h-6 ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}
              />
            </button>
            <h1
              className={`text-xl font-bold transition-colors duration-500 ease-in-out ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {getTitle()}
            </h1>
          </div>
          <div className=" flex items-center space-x-4">
            <div
              className="relative flex items-center space-x-2 cursor-pointer"
              ref={dropdownRef}
            >
              <div
                className="flex items-center space-x-2"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors duration-500 ease-in-out
                  ${
                    isDark
                      ? "bg-green-900 text-gray-100 hover:shadow-lg"
                      : "bg-green-700 text-white hover:shadow-md"
                  }`}
                >
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0].toUpperCase())
                        .slice(0, 2)
                        .join("")
                    : "A"}
                </div>
                <span
                  className={`transition-colors duration-500 ease-in-out ${
                    isDark ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {user?.name || "Admin"}
                </span>
                <FiChevronDown
                  className={`transition-colors duration-500 ease-in-out ${
                    isDark ? "text-gray-100" : "text-gray-900"
                  }`}
                />
              </div>

              {dropdownOpen && (
                <div
                  className={`absolute right-1 mt-20 w-30 transition-colors duration-500 ease-in-out
              ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } border shadow-lg rounded-md z-50 overflow-hidden`}
                >
                  <button
                    className={`block w-full text-left px-4 py-2 transition-colors duration-500 ease-in-out
              ${
                isDark
                  ? "text-gray-100 hover:bg-gray-700"
                  : "text-gray-900 hover:bg-gray-200"
              }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(false);
                      navigate("/adminProfile");
                    }}
                  >
                    Profile
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => dispatch(toggleTheme())}
              className={`p-2 rounded-full transition-colors duration-500 ease-in-out
                ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <FiSun className="w-5 h-5 text-yellow-400" />
              ) : (
                <FiMoon
                  className={`w-5 h-5 ${
                    isDark ? "text-gray-100" : "text-gray-700"
                  }`}
                />
              )}
            </button>
          </div>
        </header>

        <main
          className={`p-6 overflow-auto flex-1 transition-colors duration-500 ease-in-out
          ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
        >
          <Outlet />
        </main>

        <button
          onClick={toggleChat}
          className="fixed bottom-8 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center z-50"
        >
          <Bot size={28} />
        </button>

        {/* المودال */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              className="fixed top-4 right-4 sm:right-6 z-50 w-full sm:w-96 h-[90vh] sm:h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* زر الإغلاق كأيقونة */}
              <button
                onClick={toggleChat}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
              >
                <X size={24} />
              </button>

              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 p-4 border-b">
                <Bot size={20} className="text-blue-600" />
                AI Chatbot
              </h2>

              <div className="flex-grow overflow-auto p-2">
                <ChatBot userId={currentUser?.id || "guest"} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
