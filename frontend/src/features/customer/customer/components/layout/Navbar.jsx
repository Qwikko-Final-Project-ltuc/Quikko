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
  FaComments,
  FaSun, FaMoon,
} from "react-icons/fa";
import { MdFavorite } from "react-icons/md";
import { fetchProfile, updateProfile } from "../../profileSlice";
import { setSearchQuery } from "../../productsSlice";
import { fetchAllCarts } from "../../cartSlice";
import { formatInTimeZone } from "date-fns-tz";
import { subHours } from "date-fns";
import { deleteToken, getToken } from "firebase/messaging";
import { messaging } from "../../../../../app/firebase";
import axios from "axios";
import { FaMapMarkerAlt, FaChevronDown, FaTimes } from "react-icons/fa";
import { toggleTheme } from "../../../themeSlice";
import { fetchUnreadMessagesCount, resetUnreadCount } from "../chatUnreadSlice";

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
  
  // استخدام الـ slice الجديد بشكل صحيح
  const { unreadCount: unreadMessagesCount, loading: unreadLoading } = useSelector((state) => state.chatUnread);

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const themeMode = useSelector((state) => state.customerTheme.mode);

  const cities = [
    "Amman", "Zarqa", "Irbid", "Aqaba", "Mafraq", "Jerash", 
    "Madaba", "Karak", "Tafilah", "Ma'an", "Ajloun",
  ];

  const handleSidebarLinkClick = () => {
    setIsSidebarOpen(false);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setShowMobileSearch(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch unread messages count when component mounts and user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchUnreadMessagesCount());
    } else {
      dispatch(resetUnreadCount());
    }
  }, [dispatch, isLoggedIn]);

  // Poll for new messages every 30 seconds when user is logged in
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      dispatch(fetchUnreadMessagesCount());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [dispatch, isLoggedIn]);

  // Reset unread count when user logs out
  useEffect(() => {
    if (!isLoggedIn) {
      dispatch(resetUnreadCount());
    }
  }, [isLoggedIn, dispatch]);

  useEffect(() => {
    if (location.pathname === "/customer/products") return;
    setSearchTerm("");
    setResults([]);
    dispatch(setSearchQuery(""));
  }, [location.pathname, dispatch]);

  useEffect(() => {
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [themeMode]);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchProfile());
      dispatch(fetchAllCarts());
      setupFCM();
    }
  }, [dispatch, isLoggedIn]);

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

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read_status).length);
  }, [notifications]);

  useEffect(() => {
    if (!searchTerm.trim()) return setResults([]);
    const filtered = products.filter(
      (p) => p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(filtered);
  }, [searchTerm, products]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSelect = (productName) => {
    setSearchTerm(productName);
    setResults([]);
    setSearchOpen(false);
    setShowMobileSearch(false);
    dispatch(setSearchQuery(productName));
    navigate("/customer/products");
  };

  const handleCityChange = (e) => {
    dispatch(updateProfile({ ...profile, address: e.target.value }));
  };

  const handleCartClick = () => {
    navigate("/customer/cart");
  };

  const handleChatClick = () => {
    // Reset unread count when user clicks on chat
    dispatch(resetUnreadCount());
    navigate("/customer/chat");
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

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

  const api = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  const setupFCM = async () => {
    try {
      const currentToken = await getToken(messaging, { 
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
      });
      console.log("Generated FCM token:", currentToken);
      if (currentToken) {
        localStorage.setItem("fcm_token", currentToken);
      }
    } catch (err) {
      console.error("Error getting FCM token:", err);
    }
  };

  const handleLogout = async () => {
    try {
      const fcmToken = localStorage.getItem("fcm_token");
      if (fcmToken) {
        await api.post(
          "/users/unregister-fcm",
          { fcmToken },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await deleteToken(messaging);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("fcm_token");
      window.location.href = "/customer/login";
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/api/notifications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-60 lg:w-64 bg-[var(--bg)] shadow-xl transform transition-transform duration-300 z-50 flex flex-col
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
>
        <div className="px-6 py-4 flex items-center border-b border-[var(--border)]">
          <img 
            src={themeMode === "dark" ? "/LogoDark.png" : "/logo.png"} 
            alt="Qwikko Logo" 
            className="h-7 mt-3" 
          />
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 flex flex-col mt-4 space-y-1">
          <Link
            to="/customer/home"
            className="flex items-center px-6 py-3 text-[var(--text)] hover:bg-[var(--hover)] rounded-lg transition-colors duration-200 text-sm md:text-base"
            onClick={handleSidebarLinkClick}
          >
            <FaBars className="mr-3 text-sm" /> Home
          </Link>

          {isLoggedIn && (
            <>
              <Link
                to="/customer/profile"
                className="flex items-center px-6 py-3 text-[var(--text)] hover:bg-[var(--hover)] rounded-lg transition-colors duration-200 text-sm md:text-base"
                onClick={handleSidebarLinkClick}
              >
                <FaUser className="mr-3 text-sm" /> Profile
              </Link>

              <Link
                to="/customer/orders"
                className="flex items-center px-6 py-3 text-[var(--text)] hover:bg-[var(--hover)] rounded-lg transition-colors duration-200 text-sm md:text-base"
                onClick={handleSidebarLinkClick}
              >
                <FaClipboardList className="mr-3 text-sm" /> Orders
              </Link>

              <Link
                to="/customer/wishlist"
                className="flex items-center px-6 py-3 text-[var(--text)] hover:bg-[var(--hover)] rounded-lg transition-colors duration-200 text-sm md:text-base"
                onClick={handleSidebarLinkClick}
              >
                <MdFavorite className="mr-3 text-sm" /> Wishlist
              </Link>
            </>
          )}

          <Link
            to="/customer/products"
            className="flex items-center px-6 py-3 text-[var(--text)] hover:bg-[var(--hover)] rounded-lg transition-colors duration-200 text-sm md:text-base"
            onClick={handleSidebarLinkClick}
          >
            <FaBoxOpen className="mr-3 text-sm" /> All Products
          </Link>

          <Link
            to="/customer/stores"
            className="flex items-center px-6 py-3 text-[var(--text)] hover:bg-[var(--hover)] rounded-lg transition-colors duration-200 text-sm md:text-base"
            onClick={handleSidebarLinkClick}
          >
            <FaStore className="mr-3 text-sm" /> Stores
          </Link>

          <Link
            to="/customer/contact"
            className="flex items-center px-6 py-3 text-[var(--text)] hover:bg-[var(--hover)] rounded-lg transition-colors duration-200 text-sm md:text-base"
            onClick={handleSidebarLinkClick}
          >
            <FaPhone className="mr-3 text-sm" /> Contact
          </Link>

          <Link
            to="/customer/about"
            className="flex items-center px-6 py-3 text-[var(--text)] hover:bg-[var(--hover)] rounded-lg transition-colors duration-200 text-sm md:text-base"
            onClick={handleSidebarLinkClick}
          >
            <FaInfoCircle className="mr-3 text-sm" /> About
          </Link>
        </nav>

        <div className="mt-6 flex flex-col px-6 space-y-2">
          {!isLoggedIn ? (
            <Link
              to="/customer/login"
              className="flex items-center px-4 py-2 text-[var(--text)] hover:bg-[var(--hover)] rounded-lg transition-colors duration-200 text-sm md:text-base"
              onClick={handleSidebarLinkClick}
            >
              <FaSignOutAlt className="mr-3 text-sm" /> Login
            </Link>
          ) : (
            <>
              <Link
                to="/customer/settings"
                className="flex items-center px-4 py-2 text-[var(--text)] hover:bg-[var(--hover)] rounded-lg transition-colors duration-200 text-sm md:text-base"
                onClick={handleSidebarLinkClick}
              >
                <FaCog className="mr-3 text-sm" /> Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-[var(--error)] hover:bg-[var(--error)] hover:text-white rounded-lg transition-colors duration-200 text-sm md:text-base"
              >
                <FaSignOutAlt className="mr-3 text-sm" /> Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Navbar */}
      <nav className={`w-full sticky shadow-md flex items-center px-4 lg:px-6 py-3.5 z-40 relative ${
        themeMode === 'dark' ? 'bg-[var(--div)]' : "bg-gradient-to-br from-[var(--button)] to-gray-700" 
      }`}>
        <button
          onClick={toggleSidebar}
          className="mr-4 lg:mr-6 text-[var(--textbox)] transition-colors duration-200 sidebar-toggle-button"
        >
          <FaBars size={isMobile ? 20 : 22} />
        </button>

        {/* Logo */}
        <Link to="/customer/home" className="mr-4 lg:mr-8 flex items-center">
          <img 
            src={themeMode === "dark" ? "/LogoDark.png" : "/LogoDark.png"} 
            alt="Qwikko Logo" 
            className="h-7 lg:h-8" 
          />
        </Link>

        {/* Deliver to - Hidden on mobile */}
        {isLoggedIn && !isMobile && (
          <div className="relative flex items-center mr-4 lg:mr-8" ref={dropdownRef}>
            <div
              className="flex items-center space-x-2 cursor-pointer select-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              <FaMapMarkerAlt className="text-[var(--error)] text-lg" />
              
              <div className="flex flex-col">
                <span className="text-xs text-[var(--light-gray)] font-medium uppercase tracking-wide">
                  Deliver to
                </span>
                <span className="text-sm text-[var(--textbox)] font-semibold flex items-center">
                  {profile?.address || "Select City"}
                  <FaChevronDown
                    className={`ml-2 text-[var(--bg)] text-xs transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </div>
            </div>

            {isOpen && (
              <div className="absolute top-full left-6 mt-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-lg w-48 z-50">
                {cities.map((city) => (
                  <div
                    key={city}
                    onClick={() => {
                      handleCityChange({ target: { value: city } });
                      setIsOpen(false);
                    }}
                    className="px-4 py-2 text-[var(--text)] hover:bg-[var(--hover)] cursor-pointer transition-colors duration-150"
                  >
                    {city}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Bar - Desktop */}
        {!isMobile && (
          <div
            ref={searchDropdownRef}
            className="flex-1 flex items-center mr-4 lg:mr-8 relative"
          >
            <input
              type="text"
              placeholder="Search products..."
              className="w-full border border-[var(--border)] rounded-lg px-4 py-2 bg-[var(--textbox)] text-[var(--mid-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--hover)]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchOpen(true);
              }}
            />
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[var(--mid-dark)] hover:text-[var(--hover)] transition-colors duration-200"
              onClick={() => handleSearchSelect(searchTerm)}
            >
              <FaSearch size={16} />
            </button>

            {searchOpen && results.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 mt-1">
                {results.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-2 text-[var(--text)] hover:bg-[var(--hover)] cursor-pointer transition-colors duration-150"
                    onClick={() => handleSearchSelect(item.name)}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right Icons */}
        <div className="flex items-center space-x-4 lg:space-x-6 ml-auto">
          {/* Mobile Search Button */}
          {isMobile && (
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="text-[var(--textbox)] transition-colors duration-200"
            >
              <FaSearch size={20} />
            </button>
          )}

          {isLoggedIn && (
            <>
              {/* Messages Icon */}
              <div className="relative">
                <button
                  onClick={handleChatClick}
                  className="text-[var(--textbox)] transition-colors duration-200 relative"
                  title="Messages"
                >
                  <FaComments size={isMobile ? 20 : 22} />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[var(--error)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Profile Dropdown - Mobile */}
          {isMobile ? (
            <div className="relative" ref={profileDropdownRef}>
              <button
                className="text-[var(--textbox)] transition-colors duration-200"
                onClick={() => setProfileOpen((prev) => !prev)}
              >
                <FaUser size={20} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden z-50 ">
                  {isLoggedIn ? (
                    // للمستخدم المسجل
                    <>
                      <div className="px-4 py-3 mt-3 border-b border-[var(--border)] text-[var(--text)] font-semibold bg-[var(--bg)]">
                        {loading ? "Loading..." : profile?.name || "User"}
                      </div>
                      <Link
                        to="/customer/profile"
                        className="flex items-center px-4 py-3 text-[var(--text)] transition-colors duration-200 hover:bg-[var(--hover)]"
                        onClick={() => setProfileOpen(false)}
                      >
                        <FaUser className="mr-3 text-sm" />
                        <span className="flex-1 text-sm">View Profile</span>
                      </Link>

                      <Link
                        to="/customer/chat"
                        className="flex items-center px-4 py-3 text-[var(--text)] transition-colors duration-200 hover:bg-[var(--hover)] relative"
                        onClick={() => {
                          setProfileOpen(false);
                          dispatch(resetUnreadCount());
                        }}
                      >
                        <FaComments className="mr-3 text-sm" />
                        <span className="flex-1 text-sm">Messages</span>
                        {unreadMessagesCount > 0 && (
                          <span className="bg-[var(--error)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                            {unreadMessagesCount}
                          </span>
                        )}
                      </Link>

                      <button
                        onClick={() => {
                          dispatch(toggleTheme());
                          setProfileOpen(false);
                        }}
                        className={`flex items-center w-full text-left px-4 py-3 transition-colors duration-200 ${
                          themeMode === "dark"
                            ? "bg-[var(--mid-dark)] text-[var(--text)] hover:bg-[var(--hover)]"
                            : "bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--hover)]"
                        }`}
                      >
                        {themeMode === "dark" ? (
                          <FaSun className="mr-3 text-sm" /> 
                        ) : (
                          <FaMoon className="mr-3 text-sm" /> 
                        )}
                        <span className="flex-1 text-sm">
                          {themeMode === "dark" ? "Light Mode" : "Dark Mode"}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          handleLogout();
                          setProfileOpen(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-3 text-[var(--text)] transition-colors duration-200 hover:bg-[var(--error)] border-t border-[var(--border)]"
                      >
                        <FaSignOutAlt className="mr-3 text-sm" />
                        <span className="flex-1 text-sm">Logout</span>
                      </button>
                    </>
                  ) : (
                    // للزائر (غير مسجل)
                    <>
                      <Link
                        to="/customer/login"
                        className="flex items-center px-4 py-3 text-[var(--text)] transition-colors duration-200 hover:bg-[var(--hover)]"
                        onClick={() => setProfileOpen(false)}
                      >
                        <FaUser className="mr-3 text-sm" />
                        <span className="flex-1 text-sm">Login</span>
                      </Link>

                      <Link
                        to="/customer/signup"
                        className="flex items-center px-4 py-3 text-[var(--text)] transition-colors duration-200 hover:bg-[var(--hover)]"
                        onClick={() => setProfileOpen(false)}
                      >
                        <FaUser className="mr-3 text-sm" />
                        <span className="flex-1 text-sm">Sign Up</span>
                      </Link>

                      <button
                        onClick={() => {
                          dispatch(toggleTheme());
                          setProfileOpen(false);
                        }}
                        className={`flex items-center w-full text-left px-4 py-3 transition-colors duration-200 ${
                          themeMode === "dark"
                            ? "bg-[var(--mid-dark)] text-[var(--text)] hover:bg-[var(--hover)]"
                            : "bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--hover)]"
                        }`}
                      >
                        {themeMode === "dark" ? (
                          <FaSun className="mr-3 text-sm" /> 
                        ) : (
                          <FaCog className="mr-3 text-sm" /> 
                        )}
                        <span className="flex-1 text-sm">
                          {themeMode === "dark" ? "Light Mode" : "Dark Mode"}
                        </span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Desktop Profile Dropdown
            <div className="relative" ref={profileDropdownRef}>
              <button
                className="flex items-center px-3 py-2 rounded-md text-[var(--textbox)] font-medium transition-all duration-200"
                onClick={() => setProfileOpen((prev) => !prev)}
              >
                <FaUser className="mr-2" />
                {isLoggedIn ? (loading ? "Loading..." : profile?.name || "User") : "Guest"}
                <svg
                  className="ml-2 w-4 h-4 transition-transform duration-200"
                  style={{ transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden z-50">
                  {isLoggedIn ? (
                    // للمستخدم المسجل
                    <>
                      <div className="px-4 py-3 border-b border-[var(--border)] text-[var(--text)] font-semibold bg-[var(--div)] lg:hidden">
                        {loading ? "Loading..." : profile?.name || "User"}
                      </div>
                      <Link
                        to="/customer/profile"
                        className="flex items-center px-4 py-3 text-[var(--text)] transition-colors duration-200 hover:bg-[var(--hover)]"
                        onClick={() => setProfileOpen(false)}
                      >
                        <FaUser className="mr-3 text-sm" />
                        <span className="flex-1">View Profile</span>
                      </Link>

                      <Link
                        to="/customer/chat"
                        className="flex items-center px-4 py-3 text-[var(--text)] transition-colors duration-200 hover:bg-[var(--hover)] relative"
                        onClick={() => {
                          setProfileOpen(false);
                          dispatch(resetUnreadCount());
                        }}
                      >
                        <FaComments className="mr-3 text-sm" />
                        <span className="flex-1">Messages</span>
                        {unreadMessagesCount > 0 && (
                          <span className="bg-[var(--error)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                            {unreadMessagesCount}
                          </span>
                        )}
                      </Link>

                      <button
                        onClick={() => {
                          dispatch(toggleTheme());
                          setProfileOpen(false);
                        }}
                        className={`flex items-center w-full text-left px-4 py-3 transition-colors duration-200 ${
                          themeMode === "dark"
                            ? "bg-[var(--mid-dark)] text-[var(--text)] hover:bg-[var(--hover)]"
                            : "bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--hover)]"
                        }`}
                      >
                        {themeMode === "dark" ? (
                           <FaSun className="mr-3 text-sm" />
                        ) : (
                          <FaMoon className="mr-3 text-sm" />
                        )}
                        <span className="flex-1">
                          {themeMode === "dark" ? "Light Mode" : "Dark Mode"}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          handleLogout();
                          setProfileOpen(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-3 text-[var(--text)] transition-colors duration-200 hover:bg-[var(--error)] border-t border-[var(--border)]"
                      >
                        <FaSignOutAlt className="mr-3 text-sm" />
                        <span className="flex-1">Logout</span>
                      </button>
                    </>
                  ) : (
                    // للزائر (غير مسجل)
                    <>
                      <Link
                        to="/customer/login"
                        className="flex items-center px-4 py-3 text-[var(--text)] transition-colors duration-200 hover:bg-[var(--hover)]"
                        onClick={() => setProfileOpen(false)}
                      >
                        <FaUser className="mr-3 text-sm" />
                        <span className="flex-1">Login</span>
                      </Link>

                      <Link
                        to="/customer/signup"
                        className="flex items-center px-4 py-3 text-[var(--text)] transition-colors duration-200 hover:bg-[var(--hover)]"
                        onClick={() => setProfileOpen(false)}
                      >
                        <FaUser className="mr-3 text-sm" />
                        <span className="flex-1">Sign Up</span>
                      </Link>

                      <button
                        onClick={() => {
                          dispatch(toggleTheme());
                          setProfileOpen(false);
                        }}
                        className={`flex items-center w-full text-left px-4 py-3 transition-colors duration-200 ${
                          themeMode === "dark"
                            ? "bg-[var(--mid-dark)] text-[var(--text)] hover:bg-[var(--hover)]"
                            : "bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--hover)]"
                        }`}
                      >
                        {themeMode === "dark" ? (
                          <FaInfoCircle className="mr-3 text-sm" /> 
                        ) : (
                          <FaMoon className="mr-3 text-sm" />
                        )}
                        <span className="flex-1">
                          {themeMode === "dark" ? "Light Mode" : "Dark Mode"}
                        </span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Cart */}
          <div className="relative">
            <button
              onClick={handleCartClick}
              className="text-[var(--textbox)] transition-colors duration-200"
              data-cart-icon="true"
            >
              <FaShoppingCart size={isMobile ? 20 : 22} />
            </button>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--error)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
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
                    await fetchNotifications();
                  }
                }}
                className="text-[var(--textbox)] transition-colors duration-200"
              >
                <FaBell size={isMobile ? 20 : 22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[var(--error)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {notificationsOpen && (
                <div
                  className="fixed inset-0 z-50 bg-opacity-50 backdrop-blur-sm transition-all duration-300"
                  onClick={() => setNotificationsOpen(false)}
                >
                  <div
                    className={`bg-[var(--bg)] rounded-xl shadow-2xl ${
                      isMobile ? "w-full h-full max-h-screen" : "w-96 max-h-[70vh]"
                    } overflow-hidden ${
                      isMobile ? "absolute top-0 left-0" : "absolute top-20 right-4 ml-4"
                    } border border-[var(--border)] transform transition-transform duration-300 scale-100`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg)] mt-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-[var(--text)] flex items-center">
                          <FaBell className="mr-3 text-[var(--text)]" />
                          Notifications
                          {unreadCount > 0 && (
                            <span className="ml-3 bg-[var(--primary)] text-white text-xs font-bold px-2 py-1 rounded-full min-w-6 h-6 flex items-center justify-center">
                              {unreadCount}
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center space-x-3">
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
                                  throw new Error("Failed to mark notifications as read");
                                await res.json();
                                setNotifications((prev) =>
                                  prev.map((n) => ({ ...n, read_status: true }))
                                );
                                setUnreadCount(0);
                              } catch (err) {
                                console.error("Error marking notifications as read:", err);
                              }
                            }}
                            className="text-[var(--primary)] hover:text-[var(--text)] font-medium text-sm transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-opacity-10"
                          >
                            Mark all read
                          </button>
                          <button
                            onClick={() => setNotificationsOpen(false)}
                            className="text-[var(--light-gray)] hover:text-[var(--error)] transition-colors duration-200 p-1 rounded-full hover:bg-opacity-10"
                          >
                            <FaTimes size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Notifications List */}
                    <div className={`overflow-y-auto ${isMobile ? "h-[calc(100vh-120px)]" : "max-h-96"}`}>
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                          <FaBell className="text-[var(--light-gray)] text-4xl mb-4 opacity-50 pt-6" />
                          <p className="text-[var(--light-gray)] font-medium text-lg mb-2">No notifications</p>
                          <p className="text-[var(--light-gray)] text-sm">We'll notify you when something arrives</p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-[var(--border)]">
                          {notifications.map((n) => (
                            <li
                              key={n.id}
                              className={`p-6 transition-all duration-200 hover:bg-[var(--hover)] hover:bg-opacity-30 cursor-pointer group ${
                                !n.read_status 
                                  ? "bg-[var(--hover)] bg-opacity-5 border-l-4 border-l-[var(--primary)]" 
                                  : "border-l-4 border-l-transparent"
                              }`}
                              onClick={() => {
                                if (!n.read_status) {
                                  setNotifications(prev => 
                                    prev.map(notif => 
                                      notif.id === n.id ? { ...notif, read_status: true } : notif
                                    )
                                  );
                                  setUnreadCount(prev => Math.max(0, prev - 1));
                                }
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${
                                  !n.read_status 
                                    ? "bg-[var(--primary)] animate-pulse" 
                                    : "bg-[var(--light-gray)]"
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className={`font-semibold text-sm truncate ${
                                      !n.read_status ? "text-[var(--primary)]" : "text-[var(--text)]"
                                    }`}>
                                      {n.title}
                                    </h4>
                                    {!n.read_status && (
                                      <span className="flex-shrink-0 bg-[var(--primary)] text-white text-xs px-2 py-1 rounded-full ml-2">
                                        New
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[var(--text)] text-sm leading-relaxed mb-3 line-clamp-2">
                                    {n.message}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-[var(--light-gray)] font-medium">
                                      {formatInTimeZone(
                                        subHours(new Date(n.created_at), -3), 
                                        "Asia/Amman", 
                                        "MMM dd, yyyy 'at' hh:mm a"
                                      )}
                                    </span>
                                    {!n.read_status && (
                                      <span className="text-xs text-[var(--primary)] font-medium group-hover:underline">
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

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--bg)]">
                        <div className="flex justify-between items-center text-xs text-[var(--light-gray)]">
                          <span>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
                          <span>{unreadCount} unread</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Search Bar - Appears when toggled */}
      {isMobile && showMobileSearch && (
        <div className="w-full bg-[var(--div)] px-4 py-3 border-b border-[var(--border)]">
          <div
            ref={searchDropdownRef}
            className="flex items-center relative"
          >
            <input
              type="text"
              placeholder="Search products..."
              className="w-full border border-[var(--border)] rounded-lg px-4 py-2 bg-[var(--textbox)] text-[var(--mid-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--hover)]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchOpen(true);
              }}
            />
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[var(--mid-dark)] hover:text-[var(--hover)] transition-colors duration-200"
              onClick={() => handleSearchSelect(searchTerm)}
            >
              <FaSearch size={16} />
            </button>

            {searchOpen && results.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 mt-1">
                {results.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-2 text-[var(--text)] hover:bg-[var(--hover)] cursor-pointer transition-colors duration-150"
                    onClick={() => handleSearchSelect(item.name)}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;