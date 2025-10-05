import { Outlet, useNavigate, useLocation } from "react-router-dom";
import SideBar from "./sideBar";
import { FiChevronDown } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { FiMenu } from "react-icons/fi";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

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
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900">
      <SideBar isOpen={isSidebarOpen} />

      <div className="flex-1 flex flex-col min-h-0">
        <header className="sticky top-0 z-20 flex justify-between items-center bg-white dark:bg-gray-800 shadow px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <FiMenu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {getTitle()}
            </h1>
          </div>
          <div
            className="relative flex items-center space-x-4"
            ref={dropdownRef}
          >
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">
                {user?.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0].toUpperCase())
                      .slice(0, 2)
                      .join("")
                  : "A"}
              </div>
              <span className="text-gray-800 dark:text-gray-100">
                {user?.name || "Admin"}
              </span>
              <FiChevronDown className="text-gray-600 dark:text-gray-200" />
            </div>

            {dropdownOpen && (
              <div className="absolute right-5 mt-35 w-48 bg-white dark:bg-gray-700 shadow-lg rounded-md z-50">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/adminProfile");
                  }}
                >
                  Profile
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => {
                    toggleTheme();
                    setDropdownOpen(false);
                  }}
                >
                  Dark/Light Mode
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="p-6 overflow-auto flex-1 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
