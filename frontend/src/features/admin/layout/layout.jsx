import { Outlet, useNavigate, useLocation } from "react-router-dom";
import SideBar from "./sideBar";
import { FiChevronDown, FiMenu, FiSun, FiMoon } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../dark-lightMode/themeSlice";
import { LuUserRound } from "react-icons/lu";

import ChatBot from "./ChatBot";
import { Bot, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot } from "react-icons/fa";
import { profile } from "../auth/authApi";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const toggleChat = () => setIsChatOpen(!isChatOpen);
  const currentUser = useSelector((state) => state.customerAuth.user);

  const dispatch = useDispatch();
  const isDark = useSelector((state) => state.theme.mode === "dark");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profile();
        console.log("profile data:", data);
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
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

  return (
    <div
      className={`flex h-screen w-full transition-colors duration-500 ease-in-out
      ${
        isDark
          ? "bg-[var(--bg)] text-[var(--text)]"
          : "bg-[var(--bg)] text-[var(--text)]"
      }`}
    >
      <SideBar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isDark={isDark}
      />

      <div className="flex-1 flex flex-col min-h-0">
        <header
          className={`sticky top-0 z-20 flex justify-between items-center shadow px-4 sm:px-6 py-3 sm:py-4 transition-colors duration-500 ease-in-out
    ${
      isDark
        ? "bg-[var(--div)]"
        : "bg-gradient-to-br from-[var(--button)] to-gray-700"
    }`}
        >
          <div className="flex items-center space-x-4 sm:space-x-8">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md transition-colors duration-500 ease-in-out cursor-pointer"
            >
              <FiMenu
                className={`w-5 h-5 sm:w-6 sm:h-6 ${
                  isDark
                    ? "hover:text-[var(--hover)] text-[var(--textbox)]"
                    : "hover:text-[var(--hover)] text-[var(--textbox)]"
                }`}
              />
            </button>

            <div className="text-xl font-bold">
              <img
                onClick={() => {
                  navigate("/adminHome");
                }}
                src={isDark ? "/LogoDark.png" : "/LogoDark.png"}
                alt="Qwikko Logo"
                className="h-8 w-32 sm:h-10 sm:w-40 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center  relative" ref={dropdownRef}>
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold transition-colors duration-500 ease-in-out
                ${isDark ? "text-[var(--textbox)]" : "text-[var(--textbox)]"}`}
              >
                <LuUserRound size={20} className="sm:w-5 sm:h-5" />
              </div>
              <span
                className={`text-base sm:text-lg transition-colors duration-500 ease-in-out ${
                  isDark ? "text-[var(--textbox)]" : "text-[var(--textbox)]"
                }`}
              >
                {user?.name || "Admin"}
              </span>
              <FiChevronDown
                className={`transition-colors duration-500 ease-in-out w-3 h-3 sm:w-4 sm:h-4 transition-transform ${
                  isDark ? "text-[var(--textbox)]" : "text-[var(--textbox)]"
                } ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </div>

            {dropdownOpen && (
              <div
                className={`absolute right-0 top-10 sm:top-12 w-40 sm:w-44 border shadow-lg rounded-md z-50 overflow-hidden transition-colors duration-500 ease-in-out
          ${
            isDark
              ? "bg-[var(--bg)] border-[var(--border)]"
              : "bg-[var(--bg)] border-[var(--border)]"
          }`}
              >
                <button
                  className={`flex items-center justify-center block w-full text-left px-3 sm:px-4 py-2 transition-colors duration-500 ease-in-out cursor-pointer text-sm sm:text-base
            ${
              isDark
                ? "text-[var(--text)] hover:bg-[var(--hover)]"
                : "text-[var(--text)] hover:bg-[var(--hover)]"
            }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(false);
                    navigate("/adminProfile");
                  }}
                >
                  Profile
                </button>

                <div
                  className={`h-px w-full ${
                    isDark ? "bg-gray-700" : "bg-gray-300"
                  }`}
                ></div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(toggleTheme());
                  }}
                  className={`flex items-center justify-center gap-2 w-full px-3 sm:px-4 py-2 transition-colors duration-500 ease-in-out cursor-pointer text-sm sm:text-base
            ${
              isDark
                ? "text-[var(--text)] hover:bg-[var(--hover)]"
                : "text-[var(--text)] hover:bg-[var(--hover)]"
            }`}
                >
                  {isDark ? (
                    <>
                      <FiSun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <FiMoon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>

                <div
                  className={`h-px w-full ${
                    isDark ? "bg-gray-700" : "bg-gray-300"
                  }`}
                ></div>

                <button
                  className={`flex items-center justify-center block w-full text-left px-3 sm:px-4 py-2 transition-colors duration-500 ease-in-out cursor-pointer text-sm sm:text-base
            ${
              isDark
                ? "text-red-400 hover:bg-[var(--hover)]"
                : "text-red-500 hover:bg-[var(--hover)]"
            }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(false);
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");
                    navigate("/customer/login");
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main
          className={`p-4 sm:p-6 overflow-auto flex-1 transition-colors duration-500 ease-in-out
          ${isDark ? "bg-[var(--bg)]" : "bg-[var(--bg)]"}`}
        >
          <Outlet />
        </main>

        <button
          onClick={toggleChat}
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          }}
          className={`fixed bottom-5 right-4 sm:right-6 p-3 sm:p-4 rounded-full shadow-lg transition flex items-center justify-center z-40 cursor-pointer
          ${
            isDark
              ? "bg-[var(--button)] text-[var(--text)]"
              : "bg-[var(--button)] text-[var(--bg)]"
          }`}
          title="Open Qwikko Chatbot"
          aria-label="Open Qwikko Chatbot"
        >
          <FaRobot size={24} className="sm:w-7 sm:h-7" />
        </button>

        {/* المودال */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed bottom-20 sm:bottom-22 right-4 sm:right-6 z-50 w-[calc(100%-1rem)] sm:w-96 h-[70vh] max-h-[600px] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden
          ${
            isDark
              ? "bg-[var(--bg)] text-[var(--text)]"
              : "bg-[var(--bg)] text-[var(--text)]"
          }`}
            >
              {/* زر الإغلاق كأيقونة */}
              <button
                onClick={toggleChat}
                className={`absolute top-3 right-3 sm:top-4 sm:right-4 z-10 cursor-pointer
          ${isDark ? "text-[var(--light-gray)]" : "text-[var(--light-gray)]"}`}
                title="Close"
                aria-label="Close chatbot"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>

              <h2
                className="text-sm sm:text-base font-semibold flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
                }}
              >
                <FaRobot
                  size={18}
                  className="sm:w-5 sm:h-5"
                  style={{
                    color: isDark ? "text-[var(--text)]" : "text-[var(--text)]",
                  }}
                />
                Qwikko Chatbot
              </h2>

              <div
                className="flex-grow overflow-auto p-2 sm:p-3"
                style={{ backgroundColor: "var(--bg)" }}
              >
                <ChatBot userId={currentUser?.id || "guest"} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
