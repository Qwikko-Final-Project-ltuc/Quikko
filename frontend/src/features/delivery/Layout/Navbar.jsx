import { useState, useEffect, useRef } from "react";
import { useNavigate , Link} from "react-router-dom";
import {
  FiMenu,
  FiChevronDown,
  FiBell,
  FiMoon,
  FiSun,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import { FaComments } from "react-icons/fa";


import { FaBell, FaBars, FaUser as FaUserSolid } from "react-icons/fa";
import notificationAPI from "../notification/notificatationAPI";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../delivery/deliveryThemeSlice";
import { formatInTimeZone } from "date-fns-tz";

export default function Navbar({ isSidebarOpen, toggleSidebar, user }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(10);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const dropdownRef = useRef(null); // ✅ مرجع للدروب داون
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const CHAT_API_BASE = "https://qwikko.onrender.com";

  const fetchUnreadChatCount = async () => {
    try {
      const res = await fetch(
        `${CHAT_API_BASE}/api/chat/delivery/me/unread-count`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch chat unread count");
      const data = await res.json();
      setUnreadChatCount(Number(data?.count || 0));
    } catch (err) {
      console.error("Unread chat count error:", err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchUnreadChatCount(); // أول تحميل
    const id = setInterval(fetchUnreadChatCount, 15000); // كل 15 ثانية
    return () => clearInterval(id);
  }, [token]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const notifs = await notificationAPI.getNotifications(token);
        setNotifications(notifs || []);
        const count = await notificationAPI.getUnreadCount(token);
        setUnreadCount(Number(count) || 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [token]);

  // ✅ إغلاق الدروب داون بالضغط خارجَه أو بزر Escape
  useEffect(() => {
    const onClickOutside = (e) => {
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [isDropdownOpen]);

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter((n) => !n.read_status)
        .map((n) => n.id);
      if (unreadIds.length === 0) return;
      await notificationAPI.markRead(unreadIds, token);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_status: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const formatNotifTime = (ts) => {
    const raw = ts ?? null;
    const d = raw ? new Date(raw) : null;
    if (!d || isNaN(d)) return "";
    return formatInTimeZone(d, "Asia/Amman", "MMM dd, yyyy 'at' hh:mm a");
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
    } finally {
      setShowLogoutModal(false);
      navigate("/delivery/login");
      window.location.reload();
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 px-3 sm:px-6 py-2 flex justify-between items-center relative z-50 shadow-md
  ${
    isDarkMode
      ? "bg-[var(--div)]"
      : "bg-gradient-to-br from-[var(--button)] to-gray-700"
  }`}
        style={{ color: "var(--textbox)" }}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="text-2xl p-2 rounded-md hover:bg-white/10 transition-colors duration-200"
              style={{ color: "var(--textbox)" }}
              aria-label="Toggle sidebar"
            >
              <FaBars />
            </button>
          )}

          {!isSidebarOpen && (
            <div className="text-2xl font-bold">
              <Link
                to="/delivery/dashboard/Home"
                className="py-2 flex items-center focus:outline-none cursor-pointer"
                aria-label="Go to Home"
              >
                <img
                  src="/LogoDark.png"
                  alt="Qwikko Logo"
                  className="h-8 sm:h-9 mt-1 sm:mt-3"
                />
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200"
              style={{ color: "var(--textbox)" }}
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <FaUserSolid className="text-[var(--textbox)]" />
              <span className="font-medium text-sm sm:text-base">
                {user?.company_name || "Guest"}
              </span>
              <FiChevronDown
                className={`transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                style={{ color: "var(--textbox)" }}
              />
            </button>
            {isDropdownOpen && (
              <div
                className="
      sm:absolute sm:right-0 sm:mt-2
      fixed right-3 top-[56px]
w-[50vw] sm:w-56
      rounded-xl overflow-hidden shadow-lg border bg-[var(--bg)]
    "
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                <button
                  onClick={() => {
                    navigate("/delivery/dashboard/getProfile");
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 transition-colors duration-200 hover:bg-[var(--hover)]"
                  style={{ color: "var(--text)" }}
                >
                  <FiUser />
                  <span>View Profile</span>
                </button>

                <button
                  onClick={() => {
                    navigate("/delivery/dashboard/chat");
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 transition-colors duration-200 hover:bg-[var(--hover)]"
                  style={{ color: "var(--text)" }}
                >
                  <FaComments />
                  <span>Messages</span>
                </button>

                <button
                  onClick={() => {
                    dispatch(toggleTheme());
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 transition-colors duration-200 hover:bg-[var(--hover)]"
                  style={{ color: "var(--text)" }}
                >
                  {isDarkMode ? <FiSun /> : <FiMoon />}
                  <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                </button>

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="
    group flex items-center gap-3
    w-full text-left
    px-4 py-3
    rounded-md
    transition-colors duration-200
    text-[var(--text)]
    hover:bg-[var(--error)]
    hover:!text-white
  "
                >
                  <FiLogOut className="text-current group-hover:text-white" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Chats */}
          <div className="relative flex items-center justify-center">
            <button
              onClick={() => navigate("/delivery/dashboard/chat")}
              className="p-2 transition-colors duration-200 hover:text-[var(--hover)]"
              style={{ color: "var(--textbox)" }}
              aria-label="Chat"
              title="Chat"
            >
              <div className="relative inline-block">
                <FaComments size={28} />
                {unreadChatCount > 0 && (
                  <span
                    className="
            pointer-events-none
            absolute -top-2 -right-2
            bg-[var(--error)] text-white text-[12px] font-bold
            w-6 h-6 rounded-full
            flex items-center justify-center
            leading-none shadow-md
          "
                  >
                    {unreadChatCount > 99 ? "99+" : unreadChatCount}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={async () => {
                setShowNotifications((prev) => !prev);
                if (!showNotifications) {
                  try {
                    const res = await fetch(
                      "https://qwikko.onrender.com/api/notifications",
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    if (!res.ok)
                      throw new Error("Failed to fetch notifications");
                    const data = await res.json();
                    setNotifications(data || []);
                  } catch (err) {
                    console.error("Error fetching notifications:", err);
                  }
                }
              }}
              className="p-2 rounded-md transition-colors duration-200 hover:text-[var(--hover)] relative"
              style={{ color: "var(--textbox)" }}
              aria-label="Notifications"
              title="Notifications"
            >
              <div className="relative inline-block">
                <FaBell size={28} />
                {unreadCount > 0 && (
                  <span
                    className="
            pointer-events-none
            absolute -top-2 -right-2
            bg-[var(--error)] text-white text-[12px] font-bold
            w-6 h-6 rounded-full
            flex items-center justify-center
            leading-none shadow-md
          "
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
            </button>

            {showNotifications && (
              <div className="fixed inset-0 z-[999] flex items-start justify-end">
                {/* overlay */}
                <div
                  className="absolute inset-0 z-0 bg-black/40 backdrop-blur-sm"
                  onClick={() => setShowNotifications(false)}
                />
                {/* panel */}
                <div
                  className="relative z-10 mt-16 mr-4 bg-[var(--bg)] rounded-xl shadow-2xl w-[380px] max-h-[75vh] overflow-hidden border"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="px-5 py-4 border-b bg-[var(--bg)]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex items-center justify-between">
                      <h3
                        className="text-lg font-bold flex items-center gap-2"
                        style={{ color: "var(--text)" }}
                      >
                        <FaBell className="text-[var(--text)]" /> Notifications
                        {unreadCount > 0 && (
                          <span className="ml-2 bg-[var(--primary)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm font-medium px-2 py-1 rounded-lg transition-colors duration-200 hover:bg-[var(--hover)]"
                            style={{ color: "var(--text)" }}
                            title="Mark all as read"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-lg font-bold opacity-70 hover:opacity-100"
                          style={{ color: "var(--text)" }}
                          aria-label="Close notifications"
                          title="Close"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[55vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-12 px-6 text-center text-[var(--light-gray)]">
                        No notifications yet.
                      </div>
                    ) : (
                      <ul
                        className="divide-y"
                        style={{ borderColor: "var(--border)" }}
                      >
                        {notifications.slice(0, visibleCount).map((n) => {
                          const isUnread = !n.read_status;
                          const ts =
                            n.created_at ??
                            n.createdAt ??
                            n.timestamp ??
                            Date.now();

                          return (
                            <li
                              key={n.id}
                              onClick={async () => {
                                if (isUnread) {
                                  try {
                                    const res = await fetch(
                                      "https://qwikko.onrender.com/api/notifications/mark-read",
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                          Authorization: `Bearer ${token}`,
                                        },
                                        body: JSON.stringify({ ids: [n.id] }),
                                      }
                                    );
                                    if (!res.ok)
                                      throw new Error(
                                        "Failed to mark notification as read"
                                      );
                                    await res.json();
                                    setNotifications((prev) =>
                                      prev.map((notif) =>
                                        notif.id === n.id
                                          ? { ...notif, read_status: true }
                                          : notif
                                      )
                                    );
                                    setUnreadCount((prev) =>
                                      Math.max(prev - 1, 0)
                                    );
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }
                              }}
                              className={`p-4 transition-colors duration-200 cursor-pointer hover:bg-[var(--hover)] ${
                                isUnread ? "border-l-4" : ""
                              }`}
                              style={{
                                borderLeftColor: isUnread
                                  ? "var(--primary)"
                                  : "transparent",
                                background: isUnread
                                  ? "color-mix(in oklab, var(--primary) 5%, transparent)"
                                  : "transparent",
                                color: "var(--text)",
                              }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p
                                    className="font-semibold text-sm"
                                    style={{
                                      color: isUnread
                                        ? "var(--primary)"
                                        : "var(--text)",
                                    }}
                                  >
                                    {n.title}
                                  </p>
                                  <p className="text-sm opacity-80 break-words">
                                    {n.message}
                                  </p>
                                  <div
                                    className="mt-2 text-xs"
                                    style={{ color: "var(--light-gray)" }}
                                  >
                                    {formatNotifTime(ts)}
                                  </div>
                                </div>
                                {isUnread && (
                                  <span className="flex-shrink-0 bg-[var(--primary)] text-white text-[10px] px-2 py-0.5 rounded-full h-5 leading-5">
                                    New
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {notifications.length > visibleCount && (
                    <div
                      className="px-5 py-3 border-t bg-[var(--bg)] flex justify-center"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 5)}
                        className="px-4 py-2 rounded-lg font-medium transition hover:scale-[1.02] active:scale-95"
                        style={{ background: "var(--button)", color: "#fff" }}
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-[999]">
          <div
            className="p-6 rounded-xl shadow-lg max-w-sm w-full text-center"
            style={{
              backgroundColor: "var(--bg)",
              color: "var(--text)",
              border: `1px solid var(--border)`,
            }}
          >
            <h2 className="text-xl font-semibold mb-4">
              Are you sure you want to log out?
            </h2>

            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 rounded-lg font-semibold transition border hover:bg-[var(--error)] hover:text-white hover:border-[var(--error)]"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--error)",
                  borderColor: "var(--error)",
                }}
              >
                Yes, Logout
              </button>

              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-full px-4 py-2 rounded-lg font-semibold transition border hover:bg-[var(--hover)]"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
