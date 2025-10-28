import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaBell, FaRegUserCircle, FaSignOutAlt } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { fetchNotifications, fetchUnreadCount } from "./VendorAPI2";

export default function VendorNavbar() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const sidebarRef = useRef();

  // ✅ جلب الإشعارات وعدد الغير مقروءة
  useEffect(() => {
    const loadData = async () => {
      const notifs = await fetchNotifications();
      setNotifications(notifs);
      const unread = await fetchUnreadCount();
      setUnreadCount(unread);
    };
    loadData();
  }, []);

  // ✅ تحديث العداد عند فتح الإشعارات
  useEffect(() => {
    if (notificationsOpen) {
      setUnreadCount(notifications.filter(n => !n.read_status).length);
    }
  }, [notificationsOpen, notifications]);

  // ✅ إغلاق القوائم عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !e.target.closest(".sidebar-toggle-button")
      ) {
        setIsSidebarOpen(false);
      }
      if (!e.target.closest(".dropdown")) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // ✅ تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/vendor/login");
  };

  // ✅ التنقل إلى الصفحة الشخصية
  const handleProfileClick = () => {
    navigate("/vendor/profile");
  };

  return (
    <>
      {/* 🔹 Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-60 bg-white shadow-xl transform transition-transform duration-300 z-50 flex flex-col
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-6 py-5 flex items-center border-b border-gray-200">
          <img src="/logo.png" alt="Qwikko" className="h-9" />
        </div>
        <nav className="flex-1 flex flex-col mt-4 space-y-1">
          <Link to="/vendor/dashboard" className="px-6 py-3 text-gray-700 hover:bg-blue-50 rounded-lg">
            Dashboard
          </Link>
          <Link to="/vendor/products" className="px-6 py-3 text-gray-700 hover:bg-blue-50 rounded-lg">
            My Products
          </Link>
          <Link to="/vendor/orders" className="px-6 py-3 text-gray-700 hover:bg-blue-50 rounded-lg">
            Orders
          </Link>
          <Link to="/vendor/coupons" className="px-6 py-3 text-gray-700 hover:bg-blue-50 rounded-lg">
            Coupons
          </Link>
          <Link to="/vendor/notifications" className="px-6 py-3 text-gray-700 hover:bg-blue-50 rounded-lg">
            Notifications
          </Link>
          <Link to="/vendor/settings" className="px-6 py-3 text-gray-700 hover:bg-blue-50 rounded-lg">
            Settings
          </Link>
        </nav>
        <div className="mt-auto mb-6 flex flex-col px-6 space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg px-4 py-2"
          >
            <FaSignOutAlt className="mr-3" /> Logout
          </button>
        </div>
      </div>

      {/* 🔸 Navbar */}
      <header className="sticky top-0 z-40 flex justify-between items-center bg-white shadow px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="text-gray-700 hover:text-gray-900 sidebar-toggle-button"
          >
            <FaBars size={22} />
          </button>
          <h1 className="text-xl font-bold">Qwikko Vendor</h1>
        </div>

        <div className="flex items-center space-x-6 relative">
          {/* 🔔 Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="relative text-gray-700 hover:text-gray-900"
            >
              <FaBell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div
                className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg w-80 z-50"
              >
                <div className="p-3 font-semibold border-b flex justify-between">
                  <span>Notifications</span>
                  <button
                    className="text-blue-600 hover:underline text-sm"
                    onClick={() => navigate("/vendor/notifications")}
                  >
                    View all
                  </button>
                </div>
                <ul className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif, idx) => (
                      <li
                        key={idx}
                        className={`px-4 py-2 text-sm border-b last:border-0 ${
                          !notif.read_status ? "bg-blue-50" : ""
                        }`}
                      >
                        <p className="font-medium">{notif.title}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </li>
                    ))
                  ) : (
                    <li className="p-4 text-gray-500 text-sm">No notifications</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* 👤 Profile Dropdown */}
          <div className="relative dropdown">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 cursor-pointer text-gray-700 hover:text-gray-900"
            >
              <FaRegUserCircle className="text-xl" />
              <span>Vendor</span>
              <FiChevronDown />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg w-40 z-50">
                <button
                  onClick={handleProfileClick}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
