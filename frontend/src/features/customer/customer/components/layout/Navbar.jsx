import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaBars,
  FaUser,
  FaShoppingCart,
  FaStore,
  FaBoxOpen,
  FaPhone,
  FaInfoCircle,
  FaClipboardList,
  FaCog,
  FaSignOutAlt,
  FaSearch,
  FaBell,
} from "react-icons/fa";
import { fetchProfile, updateProfile } from "../../profileSlice";
import { setSearchQuery } from "../../productsSlice";
import { fetchAllCarts } from "../../cartSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const searchDropdownRef = useRef(null);

  const { data: profile, loading } = useSelector((state) => state.profile);
  const products = useSelector((state) => state.products.items || []);
  const { allCarts = [] } = useSelector((state) => state.cart);
  const token = useSelector((state) => state.customerAuth.token);

  const isLoggedIn = !!token;
  const cartItemCount = allCarts.length;

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const cities = [
    "Amman",
    "Zarqa",
    "Irbid",
    "Aqaba",
    "Mafraq",
    "Jerash",
    "Madaba",
    "Karak",
    "Tafilah",
    "Ma'an",
    "Ajloun",
  ];

  // Reset search bar when navigating away from /products
  useEffect(() => {
    if (location.pathname === "/products") return;
    setSearchTerm("");
    setResults([]);
    dispatch(setSearchQuery(""));
  }, [location.pathname, dispatch]);

  // Fetch profile & cart
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchProfile());
      dispatch(fetchAllCarts());
    }
  }, [dispatch, isLoggedIn]);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/api/notifications/unread-count",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch unread count");
        const data = await res.json();
        setUnreadCount(data.count);
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };
    if (isLoggedIn) fetchUnreadCount();
  }, [token, isLoggedIn]);

  // Sync unread count with notifications state
  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read_status).length);
  }, [notifications]);

  // Filter search results
  useEffect(() => {
    if (!searchTerm.trim()) return setResults([]);
    const filtered = products.filter(
      (p) => p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(filtered);
  }, [searchTerm, products]);

  const handleSearchSelect = (productName) => {
    setSearchTerm(productName);
    setResults([]);
    setSearchOpen(false);
    dispatch(setSearchQuery(productName));
    navigate("/products");
  };

  const handleCityChange = (e) => {
    dispatch(updateProfile({ ...profile, address: e.target.value }));
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // 🔒 Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !e.target.closest(".sidebar-toggle-button")
      ) {
        setIsSidebarOpen(false);
      }

      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(e.target) &&
        !e.target.closest("input[placeholder='Search products...']")
      ) {
        setSearchOpen(false);
        setResults([]);
      }

      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };

  return (
    <>
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 z-50 flex flex-col
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-6 py-6 flex items-center border-b border-gray-200">
          <img src="/logo.png" alt="Qwikko Logo" className="h-9" />
        </div>

        <nav className="flex-1 flex flex-col mt-4 space-y-1">
          <Link
            to="/"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
          >
            <FaBars className="mr-3" /> Home
          </Link>
          {isLoggedIn && (
            <>
              <Link
                to="/profile"
                className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
              >
                <FaUser className="mr-3" /> Profile
              </Link>
              <Link
                to="/orders"
                className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
              >
                <FaClipboardList className="mr-3" /> My Orders
              </Link>
            </>
          )}
          <Link
            to="/stores"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
          >
            <FaStore className="mr-3" /> Stores
          </Link>
          <Link
            to="/products"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
          >
            <FaBoxOpen className="mr-3" /> All Products
          </Link>
          <Link
            to="/ContactUs"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
          >
            <FaPhone className="mr-3" /> Contact Us
          </Link>
          <Link
            to="/about"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
          >
            <FaInfoCircle className="mr-3" /> About
          </Link>
        </nav>

        <div className="mt-6 flex flex-col px-6 space-y-2">
          {!isLoggedIn ? (
            <Link
              to="/auth/login"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
            >
              <FaSignOutAlt className="mr-3" /> Login
            </Link>
          ) : (
            <>
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200"
              >
                <FaCog className="mr-3" /> Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
              >
                <FaSignOutAlt className="mr-3" /> Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Navbar */}
      <nav className="w-full bg-white shadow-md flex items-center px-6 py-3 z-40 relative">
        <button
          onClick={toggleSidebar}
          className="mr-6 text-gray-700 hover:text-gray-900 transition-colors duration-200 sidebar-toggle-button"
        >
          <FaBars size={22} />
        </button>

        <Link to="/" className="mr-8 flex items-center">
          <img src="/logo.png" alt="Qwikko Logo" className="h-9" />
        </Link>

        {isLoggedIn && (
          <div className="flex items-center mr-8">
            <span className="mr-2 text-gray-600 font-medium">Deliver to</span>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={profile?.address || ""}
              onChange={handleCityChange}
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search bar */}
        <div
          ref={searchDropdownRef}
          className="flex-1 flex items-center mr-8 relative"
        >
          <input
            type="text"
            placeholder="Search products..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSearchOpen(true);
            }}
          />
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            onClick={() => handleSearchSelect(searchTerm)}
          >
            <FaSearch size={16} />
          </button>

          {searchOpen && results.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 mt-1">
              {results.map((item) => (
                <div
                  key={item.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                  onClick={() => handleSearchSelect(item.name)}
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-6">
          {isLoggedIn && (
            <div ref={profileDropdownRef} className="relative">
              <button
                className="flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium"
                onClick={() => setProfileOpen((prev) => !prev)}
              >
                <FaUser className="mr-2" />{" "}
                {loading ? "Loading..." : profile?.name || "Guest"}
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-44">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => setProfileOpen(false)}
                  >
                    View Profile
                  </Link>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => {}}
                  >
                    Dark/Light Mode
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Cart */}
          <div className="relative">
            <button
              onClick={handleCartClick}
              className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              <FaShoppingCart size={22} />
            </button>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartItemCount}
              </span>
            )}
          </div>

          {/* Notifications */}
          {isLoggedIn && (
            <div className="relative">
              <button
                onClick={async () => {
                  setNotificationsOpen((prev) => !prev);
                  if (!notificationsOpen) {
                    try {
                      const res = await fetch(
                        "http://localhost:3000/api/notifications",
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );
                      if (!res.ok)
                        throw new Error("Failed to fetch notifications");
                      const data = await res.json();
                      setNotifications(data);
                    } catch (err) {
                      console.error("Error fetching notifications:", err);
                    }
                  }
                }}
                className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
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
                  className="fixed inset-0 z-50"
                  onClick={() => setNotificationsOpen(false)}
                >
                  <div
                    className="bg-white rounded-lg shadow-lg w-96 max-h-[70vh] overflow-y-auto absolute top-16 right-0 ml-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-2 border-b flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Notifications</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={async () => {
                            const unreadIds = notifications
                              .filter((n) => !n.read_status)
                              .map((n) => n.id);
                            if (unreadIds.length === 0) return;

                            try {
                              const res = await fetch(
                                "http://localhost:3000/api/notifications/mark-read",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({ ids: unreadIds }),
                                }
                              );
                              if (!res.ok)
                                throw new Error(
                                  "Failed to mark notifications as read"
                                );
                              await res.json();
                              setNotifications((prev) =>
                                prev.map((n) => ({ ...n, read_status: true }))
                              );
                              setUnreadCount(0);
                            } catch (err) {
                              console.error(
                                "Error marking notifications as read:",
                                err
                              );
                            }
                          }}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Mark all as read
                        </button>
                        <button
                          onClick={() => setNotificationsOpen(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <ul>
                      {notifications.length === 0 && (
                        <li className="p-4 text-gray-500">
                          No notifications
                        </li>
                      )}
                      {notifications.map((n) => (
                        <li
                          key={n.id}
                          className={`p-4 border-b hover:bg-gray-50 ${
                            !n.read_status ? "bg-blue-50" : ""
                          }`}
                        >
                          <h4 className="font-medium">{n.title}</h4>
                          <p className="text-sm text-gray-600">{n.message}</p>
                          <span className="text-xs text-gray-400">
                            {new Date(n.created_at).toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
