import React, { useEffect, useState, useRef } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import {
  FaBars, FaBell, FaRegUserCircle, FaSignOutAlt,
  FaBoxOpen, FaClipboardList, FaTicketAlt, FaRegCommentDots, FaCog, FaUser
} from "react-icons/fa";

import { FiChevronDown } from "react-icons/fi";
import { fetchNotifications, fetchUnreadCount, fetchVendorProfile } from "./VendorAPI2";
import ChatBot from "./ChatBot";
import { Bot, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VendorLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const isLoggedIn = !!token;
  const [isChatOpen, setIsChatOpen] = useState(false);
  const toggleChat = () => setIsChatOpen(!isChatOpen);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme === "dark";
  });
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const sidebarRef = useRef();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      const loadProfile = async () => {
        try {
          const data = await fetchVendorProfile();
          if (data && data.success) {
            setProfile(data.data);
          }
        } catch (err) {
          console.error("Failed to fetch vendor profile:", err);
        }
      };
      loadProfile();

      const loadNotifications = async () => {
        const notifs = await fetchNotifications();
        setNotifications(notifs);
        const unread = await fetchUnreadCount();
        setUnreadCount(unread);
      };
      loadNotifications();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (notificationsOpen) {
      setUnreadCount(notifications.filter((n) => !n.read_status).length);
    }
  }, [notificationsOpen, notifications]);
  
  useEffect(() => {
     document.documentElement.classList.toggle("dark", isDarkMode);
     localStorage.setItem("theme", isDarkMode ? "dark" : "light");
   }, [isDarkMode]);
 
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !e.target.closest(".sidebar-toggle")
      ) {
        setIsSidebarOpen(false);
      }
      if (!e.target.closest(".dropdown")) setDropdownOpen(false);
      if (!e.target.closest(".notif-dropdown") && !e.target.closest(".notif-button")) {
        setNotificationsOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/vendor");
  };

  const handleProfileClick = () => {
    navigate("/vendor/profile");
  };

  const hideSidebarRoutes = ["/vendor", "/vendor/login", "/vendor/register", "/vendor/register", "/vendor/forgot-password"];
  const shouldShowSidebar = isLoggedIn && !hideSidebarRoutes.includes(location.pathname);

  const hideNavbarFooterRoutes = ["/vendor", "/vendor/login", "/vendor/register", "/vendor/forgot-password"];
  const shouldShowNavbarFooter = !hideNavbarFooterRoutes.includes(location.pathname);

  const logoSrc = isDarkMode ? "/LogoDark 1.png" : "/LogoDark 1.png";

  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  }

  let currentUser = { id: "guest", store_name: "Vendor" };
  if (token) {
    const payload = parseJwt(token);
    if (payload && payload.id) currentUser.id = payload.id;
    if (payload && payload.store_name) currentUser.store_name = payload.store_name;
  }

  return (
    <div
      className={`flex flex-col min-h-screen w-full transition-all duration-300 ${isDarkMode ? "bg-[#242625] text-white" : "bg-[#f0f2f1] text-[#242625]"}`}
    >
      {/* Navbar */}
      {shouldShowNavbarFooter && (
        <header
  className={`sticky top-0 z-50 flex justify-between items-center px-6 py-4 shadow-md relative ${
    isDarkMode
      ? 'bg-[var(--div)]'
      : 'bg-gradient-to-br from-[var(--button)] to-gray-700'
  }`}
>

          <div className="flex items-center space-x-4">
            <button
              className="sidebar-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <FaBars className={`text-2xl ${isDarkMode ? "text-white" : "text-white"}`} />
            </button>
            <Link to="/vendor">
            <img src={logoSrc} alt="Qwikko" className="h-8" />
            </Link>
          </div>

          <div className="flex items-center ml-auto space-x-1 sm:space-x-2 md:space-x-6 relative">
  {/* Profile Dropdown */}
  <div className="relative dropdown">
    {isLoggedIn ? (
      <>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-1 sm:space-x-2 cursor-pointer"
        >
          <FaUser className={`text-xl ${isDarkMode ? "text-white" : "text-white"}`} />
          <span className={isDarkMode ? "text-white" : "text-white"}>
            {profile?.store_name || "Vendor"}
          </span>
          <FiChevronDown className={isDarkMode ? "text-white" : "text-white"} />
        </button>

        {dropdownOpen && (
          <div
            className={`absolute right-0 top-10 border rounded-lg shadow-lg w-48 z-50 ${
              isDarkMode ? "bg-[#313131] border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            {/* ⚙️ Profile */}
            <button
              onClick={handleProfileClick}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Profile
            </button>

            {/* 💬 Messages */}
            <button
              onClick={() => navigate("/vendor/chat")}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Messages
            </button>

            {/* 🌓 Theme Indicator */}
            <div
              onClick={() => setIsDarkMode((prev) => !prev)}
              className={`flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800`}
            >
              <span>
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </span>
            </div>

            {/* 🚪 Logout */}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        )}
      </>
    ) : (
      <button
        onClick={() => navigate("/vendor/login")}
        className="flex items-center space-x-1 sm:space-x-2"
      >
        <FaRegUserCircle
          className={`text-xl ${isDarkMode ? "text-white" : "text-black"}`}
        />
        <span className={isDarkMode ? "text-white" : "text-black"}>Login</span>
      </button>
    )}
  </div>

  {/* Notifications */}
  {isLoggedIn && (
    <div className="relative">
      <button
        onClick={() => setNotificationsOpen((prev) => !prev)}
        className="notif-button relative"
      >
        <FaBell size={22} className={isDarkMode ? "text-white" : "text-white"} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
                {notificationsOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-lg shadow-lg z-50 notif-dropdown ${isDarkMode ? "bg-[#333333] text-white" : "bg-white text-black"}`}
                  >
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                          <FaBell className={`${isDarkMode ? "text-gray-300" : "text-gray-400"} text-4xl mb-4 opacity-50`} />
                          <p className={`${isDarkMode ? "text-white" : "text-gray-400"} font-medium text-lg mb-2`}>
                            No notifications
                          </p>
                          <p className={`${isDarkMode ? "text-white" : "text-gray-400"} text-sm`}>
                            We'll notify you when something arrives
                          </p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-300 dark:divide-gray-600">
                          {notifications.map((n) => (
                            <li
                              key={n.id}
                              className={`p-6 transition-all duration-200  cursor-pointer group ${!n.read_status
                                ? "bg-gray-100 dark:bg-[#444] border-l-4 border-black"
                                : "border-l-4 border-transparent"
                                }`}
                              onClick={() => {
                                if (!n.read_status) {
                                  setNotifications((prev) =>
                                    prev.map((notif) =>
                                      notif.id === n.id ? { ...notif, read_status: true } : notif
                                    )
                                  );
                                  setUnreadCount((prev) => Math.max(0, prev - 1));
                                }
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div
                                  className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${!n.read_status ? "bg-black animate-pulse" : "bg-gray-400"
                                    }`}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4
                                      className={`font-semibold text-sm truncate ${isDarkMode
                                        ? "text-white"
                                        : !n.read_status
                                          ? "text-black"
                                          : "text-gray-700"
                                        }`}
                                    >
                                      {n.title}
                                    </h4>
                                    {!n.read_status && (
                                      <span className="flex-shrink-0 bg-black text-white text-xs px-2 py-1 rounded-full ml-2">
                                        New
                                      </span>
                                    )}
                                  </div>
                                  <p
                                    className={`text-sm leading-relaxed mb-3 line-clamp-2 ${isDarkMode ? "text-white" : "text-gray-600"
                                      }`}
                                  >
                                    {n.message}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`text-xs font-medium ${isDarkMode ? "text-gray-300" : "text-gray-500"
                                        }`}
                                    >
                                      {new Date(n.created_at).toLocaleString()}
                                    </span>
                                    {!n.read_status && (
                                      <span
                                        className={`text-xs font-medium group-hover:underline ${isDarkMode ? "text-white" : "text-black"
                                          }`}
                                      >
                                        Mark as read
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate("/vendor/notifications");
                      }}
                      className={`w-full text-center py-2 font-semibold border-t ${isDarkMode
                        ? "border-gray-700 hover:bg-[#444] text-white"
                        : "border-gray-200 hover:bg-gray-100 text-black"
                        } transition-colors`}
                    >
                      View All
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
      )}

      {/* Sidebar overlay */}
      {shouldShowSidebar && isSidebarOpen && (
        <div
          ref={sidebarRef}
          className={`fixed top-0 left-0 h-full w-60 flex flex-col z-40 transition-transform duration-300 ${isDarkMode ? "bg-[#313131]" : "bg-white"} shadow-xl`}
        >
          <div className="px-6 py-5 flex items-center">
            <img src={logoSrc} alt="Vendor Logo" className="h-9" />
          </div>

          <nav className="flex-1 flex flex-col mt-4 space-y-1">
            <Link to="/vendor/dashboard" className="flex font-medium items-center px-6 py-3 hover:bg-gray-100 dark:hover:bg-[#444] rounded-lg transition-colors duration-200">
              <FaBars className="mr-3" /> Dashboard
            </Link>

            <Link to="/vendor/products" className="flex font-medium items-center px-6 py-3 hover:bg-gray-100 dark:hover:bg-[#444] rounded-lg transition-colors duration-200">
              <FaBoxOpen className="mr-3" /> My Products
            </Link>

            <Link to="/vendor/orders" className="flex font-medium items-center px-6 py-3 hover:bg-gray-100 dark:hover:bg-[#444] rounded-lg transition-colors duration-200">
              <FaClipboardList className="mr-3" /> Orders
            </Link>

            <Link to="/vendor/coupons" className="flex font-medium items-center px-6 py-3 hover:bg-gray-100 dark:hover:bg-[#444] rounded-lg transition-colors duration-200">
              <FaTicketAlt className="mr-3" /> Coupons
            </Link>

            <Link to="/vendor/chat" className="flex font-medium items-center px-6 py-3 hover:bg-gray-100 dark:hover:bg-[#444] rounded-lg transition-colors duration-200">
              <FaRegCommentDots className="mr-3" /> Chats
            </Link>

            <Link to="/vendor/settings" className="flex font-medium items-center px-6 py-3 hover:bg-gray-100 dark:hover:bg-[#444] rounded-lg transition-colors duration-200">
              <FaCog className="mr-3" /> Settings
            </Link>
          </nav>

          <div className="mt-auto mb-6 flex flex-col px-6 space-y-2">
            <button
              onClick={handleLogout}
              className="flex items-center rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#444] transition-colors"
            >
              <FaSignOutAlt className="mr-3" /> Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1  transition-all duration-300">
        <Outlet context={{ isDarkMode, setIsDarkMode }} />
      </main>

      

      {/* ChatBot Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-8 right-6 text-white p-4 rounded-full shadow-lg transition flex items-center justify-center z-50"
        style={{
          backgroundColor: "#026a4b",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#025438")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#026a4b")}
      >
        <Bot size={28} />
      </button>

      <AnimatePresence>
  {isChatOpen && (
 <motion.div
  className="fixed bottom-4 right-4 sm:right-6 z-50 w-full sm:w-96 h-[90vh] sm:h-[70vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
  style={{
    backgroundColor: isDarkMode ? "var(--mid-dark)" : "var(--div)",
    color: isDarkMode ? "#ffffff" : "#292e2c",
  }}
>


      {/* Close Button */}
      <button
        onClick={toggleChat}
        className="absolute top-4 right-4 z-10"
        style={{ color: isDarkMode ? "var(--text)" : "#292e2c" }}
      >
        <X size={24} />
      </button>

      {/* Header */}
      <h2
        className="text-xl font-semibold mb-4 flex items-center gap-2 p-4 border-b"
        style={{
          borderColor: isDarkMode ? "var(--mid-dark)" : "#f5f6f5",
          color: isDarkMode ? "var(--text)" : "#292e2c",
        }}
      >
        <Bot size={20} style={{ color: "#026a4b" }} /> AI Chatbot
      </h2>

      {/* Chat Content */}
      <div
        className="flex-grow overflow-auto p-2"
        style={{ backgroundColor: isDarkMode ? "var(--mid-dark)" : "#f5f6f5" }}
      >
        <ChatBot userId={currentUser?.id || "guest"} isDarkMode={isDarkMode} />
      </div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
}
