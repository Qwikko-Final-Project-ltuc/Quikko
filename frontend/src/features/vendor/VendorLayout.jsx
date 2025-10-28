import React, { useEffect, useState, useRef } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { FaBars, FaBell, FaRegUserCircle, FaSignOutAlt } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { fetchNotifications, fetchUnreadCount } from "./VendorAPI2";


export default function VendorLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const isLoggedIn = !!token;

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme === "dark";
  });

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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      const loadData = async () => {
        const notifs = await fetchNotifications();
        setNotifications(notifs);
        const unread = await fetchUnreadCount();
        setUnreadCount(unread);
      };
      loadData();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (notificationsOpen) {
      setUnreadCount(notifications.filter((n) => !n.read_status).length);
    }
  }, [notificationsOpen, notifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target) && !e.target.closest(".sidebar-toggle-button")) {
        setIsSidebarOpen(false);
      }
      if (!e.target.closest(".dropdown")) {
        setDropdownOpen(false);
      }
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

  const hideSidebarRoutes = ["/vendor", "/vendor/login", "/vendor/register"];
  const shouldShowSidebar = isLoggedIn && !hideSidebarRoutes.includes(location.pathname);

  const logoSrc = isDarkMode ? "/LogoDark 1.png" : "/logo.png";

  return (
    <div className={`flex flex-col min-h-screen w-full transition-all duration-300 ${isDarkMode ? "bg-[#242625] text-white" : "bg-[#f0f2f1] text-[#242625]"}`}>
      {/* Navbar */}
      <header className={`sticky top-0 z-40 flex justify-between items-center px-6 py-4 shadow ${isDarkMode ? "bg-[#242625]" : "bg-white"}`}>
        <div className="flex items-center space-x-4">
          {isLoggedIn && (
            <button onClick={() => setIsSidebarOpen(prev => !prev)} className="sidebar-toggle-button">
              <FaBars size={22} className={isDarkMode ? "text-white" : "text-black"} />
            </button>
          )}
          <img src={logoSrc} alt="Qwikko" className="h-8" />
        </div>

        <div className="flex items-center space-x-6 relative">
          {/* إشعارات */}
          {isLoggedIn && (
            <div className="relative">
              <button onClick={() => setNotificationsOpen(prev => !prev)} className="notif-button">
                <FaBell size={22} className={isDarkMode ? "text-white" : "text-black"} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

             {notificationsOpen && (
  <div className={`absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-lg shadow-lg z-50 notif-dropdown ${isDarkMode ? "bg-[#666666] text-white" : "bg-white text-black"}`}>
    {notifications.length === 0 ? (
      <p className="p-4 text-center text-sm">No notifications</p>
    ) : (
      <>
        {notifications.map((notif, idx) => (
          <div key={idx} className="px-4 py-3 border-b last:border-b-0">
            <p className="font-semibold">{notif.title}</p>
            <p className="text-sm text-gray-300">{notif.message}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
          </div>
        ))}
        {/* زر View All */}
        <button
          onClick={() => {
            setNotificationsOpen(false);
            navigate("/vendor/notifications");
          }}
          className={`w-full text-center py-2 font-semibold border-t ${isDarkMode ? "border-gray-700 hover:bg-[#555555]" : "border-gray-200 hover:bg-gray-100"} transition-colors`}
        >
          View All
        </button>
      </>
    )}
  </div>
)}

            </div>
          )}

          {/* Profile Dropdown */}
          <div className="relative dropdown">
            {isLoggedIn ? (
              <>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 cursor-pointer">
                  <FaRegUserCircle className={`text-xl ${isDarkMode ? "text-white" : "text-black"}`} />
                  <FiChevronDown className={isDarkMode ? "text-white" : "text-black"} />
                </button>
                {dropdownOpen && (
                  <div className={`absolute right-0 top-10 border rounded-lg shadow-lg w-40 z-50 ${isDarkMode ? "bg-[#666666] border-gray-700" : "bg-white border-gray-200"}`}>
                    <button onClick={handleProfileClick} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Profile</button>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600">Logout</button>
                  </div>
                )}
              </>
            ) : (
              <button onClick={() => navigate("/vendor/login")} className="flex items-center space-x-2">
                <FaRegUserCircle className={`text-xl ${isDarkMode ? "text-white" : "text-black"}`} />
                <span className={isDarkMode ? "text-white" : "text-black"}>Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      {shouldShowSidebar && (
        <div ref={sidebarRef} className={`fixed top-0 left-0 h-full w-60 transform transition-transform duration-300 z-50 flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${isDarkMode ? "bg-[#242625]" : "bg-white"}`}>
          <div className="px-6 py-5 flex items-center">
            <img src={logoSrc} alt="Qwikko" className="h-9" />
          </div>
          <nav className="flex-1 flex flex-col mt-4 space-y-1">
            <Link to="/vendor/dashboard" className={`px-6 py-3 rounded-lg ${isDarkMode ? "text-white hover:bg-[#666666]" : "text-gray-700 hover:bg-[#f0f2f1]"}`}>Dashboard</Link>
            <Link to="/vendor/products" className={`px-6 py-3 rounded-lg ${isDarkMode ? "text-white hover:bg-[#666666]" : "text-gray-700 hover:bg-[#f0f2f1]"}`}>My Products</Link>
            <Link to="/vendor/orders" className={`px-6 py-3 rounded-lg ${isDarkMode ? "text-white hover:bg-[#666666]" : "text-gray-700 hover:bg-[#f0f2f1]"}`}>Orders</Link>
            <Link to="/vendor/Coupons" className={`px-6 py-3 rounded-lg ${isDarkMode ? "text-white hover:bg-[#666666]" : "text-gray-700 hover:bg-[#f0f2f1]"}`}>Coupons</Link>
            <Link to="/vendor/chat" className={`px-6 py-3 rounded-lg ${isDarkMode ? "text-white hover:bg-[#666666]" : "text-gray-700 hover:bg-[#f0f2f1]"}`}>Chats</Link>
            <Link to="/vendor/notifications" className={`px-6 py-3 rounded-lg ${isDarkMode ? "text-white hover:bg-[#666666]" : "text-gray-700 hover:bg-[#f0f2f1]"}`}>Notifications</Link>
            <Link to="/vendor/settings" className={`px-6 py-3 rounded-lg ${isDarkMode ? "text-white hover:bg-[#666666]" : "text-gray-700 hover:bg-[#f0f2f1]"}`}>Settings</Link>
          </nav>
          <div className="mt-auto mb-6 flex flex-col px-6 space-y-2">
            <button onClick={handleLogout} className={`flex items-center rounded-lg px-4 py-2 ${isDarkMode ? "text-white hover:bg-[#666666]" : "text-gray-700 hover:bg-red-50"} transition-colors`}>
              <FaSignOutAlt className="mr-3" /> Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 p-6 transition-all duration-300 ${isSidebarOpen ? "ml-60" : "ml-0"}`}>
        <Outlet context={{ isDarkMode, setIsDarkMode }} />
      </main>

      {/* Footer */}
      <footer className={`shadow px-6 py-4 text-center ${isDarkMode ? "bg-[#242625] text-white" : "bg-white text-gray-700"}`}>
        <p className="text-sm">© {new Date().getFullYear()} Qwikko. All rights reserved.</p>
      </footer>
    </div>
  );
}
