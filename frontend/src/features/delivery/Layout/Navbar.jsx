import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiChevronDown,
  FiBell,
  FiMoon,
  FiSun,
  FiUser,
  FiCheck,
} from "react-icons/fi";
import notificationAPI from "../notification/notificatationAPI";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../delivery/deliveryThemeSlice";

export default function Navbar({ isSidebarOpen, toggleSidebar, user }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(10);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const notifs = await notificationAPI.getNotifications(token);
        setNotifications(notifs);
        const count = await notificationAPI.getUnreadCount(token);
        setUnreadCount(count);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [token]);

  // ✅ تعليم إشعار واحد كمقروء
  const markAsRead = async (id) => {
    try {
      await notificationAPI.markRead([id], token);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_status: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
    }
  };

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

 const getAvatar = () => {
   if (user?.avatarUrl)
     return (
       <img
         src={user.avatarUrl}
         alt="avatar"
         className="w-8 h-8 rounded-full object-cover"
       />
     );

   const initials = user?.company_name
     ? user.company_name
         .split(" ")
         .map((n) => n[0])
         .join("")
         .slice(0, 2)
         .toUpperCase()
     : "GU";

   return (
     <div
       className="w-8 h-8 rounded-full flex items-center justify-center font-semibold"
       style={{
         backgroundColor: isDarkMode ? "#666666" : "#ffffff", // خلفية الديف
         color: isDarkMode ? "#ffffff" : "#242625", // النصوص
       }}
     >
       {initials}
     </div>
   );
 };


  return (
    <header
      className="fixed top-0 left-0 right-0  shadow px-6 py-0 flex justify-between items-center relative z-50"
      style={{
        backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
        color: isDarkMode ? "#ffffff" : "#242625",
      }}
    >
      {/* زر القائمة واللوغو */}
      <div className="flex items-center gap-4">
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            style={{
              color: isDarkMode ? "#ffffff" : "#242625",
            }}
            className="text-2xl hover:text-black transition flex-shrink-0"
          >
            <FiMenu />
          </button>
        )}
        <div
          className={`text-2xl font-bold transition-opacity ${
            isSidebarOpen ? "opacity-0" : "opacity-100"
          }`}
          style={{
            color: isDarkMode ? "#ffffff" : "#242625",
          }}
        >
          <div className="px-6 py-6 flex items-center">
            <img
              src={isDarkMode ? "/darklogo.png" : "/logo.png"}
              alt="Qwikko Logo"
              className="h-9"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              backgroundColor: isDarkMode ? "#242625" : "#ffffff", // خلفية button
              color: isDarkMode ? "#ffffff" : "#242625", // النص
              border: `1px solid ${isDarkMode ? "#f9f9f9" : "#242625"}`, // الخط
            }}
            className="flex items-center gap-2 px-3 py-1 rounded-full transition"
          >
            {getAvatar()}
            <span>{user?.company_name || "Guest"}</span>
            <FiChevronDown
              className={`transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              style={{ color: isDarkMode ? "#ffffff" : "#242625" }}
            />
          </button>

          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 shadow-lg rounded-xl overflow-hidden z-50"
              style={{
                backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                border: `1px solid ${isDarkMode ? "#f9f9f9" : "#242625"}`,
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              {/* Profile Button */}
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setTimeout(() => {
                    navigate("/delivery/dashboard/getProfile");
                  }, 0);
                }}
                className="flex items-center gap-3 w-full text-left px-4 py-3 transition hover:opacity-80"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                <FiUser style={{ color: isDarkMode ? "#ffffff" : "#242625" }} />
                <span>Profile</span>
              </button>

              {/* Toggle Theme Button */}
              <button
                onClick={() => {
                  setIsDropdownOpen(false); // يغلق أولًا
                  setTimeout(() => {
                    dispatch(toggleTheme()); // بعد الإغلاق مباشرة
                  }, 0);
                }}
                className="flex items-center gap-3 w-full text-left px-4 py-3 transition hover:opacity-80"
              >
                {isDarkMode ? (
                  <>
                    <FiSun
                      style={{
                        color: isDarkMode ? "#ffffff" : "#242625",
                      }}
                    />
                    <span
                      style={{
                        backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                      }}
                    >
                      Light Mode
                    </span>
                  </>
                ) : (
                  <>
                    <FiMoon
                      style={{
                        color: isDarkMode ? "#ffffff" : "#242625",
                      }}
                    />
                    <span
                      style={{
                        backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                      }}
                    >
                      Dark Mode
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* الإشعارات */}
        <div className="flex items-center gap-4">
          {/* إشعارات */}
          <button
            onClick={() => setShowNotifications(true)}
            style={{
              color: isDarkMode ? "#ffffff" : "#242625",
            }}
            className="text-2xl hover:text-black transition relative"
          >
            <FiBell />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
              <div
                className=" p-6 rounded-xl shadow-lg w-90%] max-w-[900px] max-h-[70vh] overflow-y-auto relative"
                style={{
                  backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2
                    className="text-xl font-semibold"
                    style={{
                      color: isDarkMode ? "#ffffff" : "#242625",
                    }}
                  >
                    Notifications
                  </h2>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={markAllAsRead}
                      className=" hover:underline text-sm"
                      style={{
                        color: isDarkMode ? "#ffffff" : "#242625",
                      }}
                    >
                      Mark All as Read
                    </button>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className=" hover:text-gray-700 text-xl font-bold"
                      style={{
                        color: isDarkMode ? "#ffffff" : "#242625",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <p
                    style={{
                      color: isDarkMode ? "#ffffff" : "#242625",
                    }}
                  >
                    No notifications yet.
                  </p>
                ) : (
                  <ul>
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className="p-4 border-b flex justify-between items-start rounded-lg transition-colors"
                        style={{
                          backgroundColor: !n.read_status
                            ? isDarkMode
                              ? "#2a3b5f" // خلفية الإشعارات غير المقروءة في الدارك
                              : "#e8f1ff" // خلفية الإشعارات غير المقروءة في اللايت
                            : isDarkMode
                            ? "#242625" // خلفية العادية في الدارك
                            : "#ffffff", // خلفية العادية في اللايت
                          color: isDarkMode ? "#ffffff" : "#242625",
                          borderColor: isDarkMode ? "#444" : "#ddd",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontWeight: !n.read_status ? "600" : "400",
                            }}
                          >
                            {n.title}
                          </p>
                          <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                            {n.message}
                          </p>
                        </div>

                        {!n.read_status && (
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(
                                  "http://localhost:3000/api/notifications/mark-read",
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

                                // ✅ تحديث الحالة محليًا
                                setNotifications((prev) =>
                                  prev.map((notif) =>
                                    notif.id === n.id
                                      ? { ...notif, read_status: true }
                                      : notif
                                  )
                                );
                                setUnreadCount((prev) => Math.max(prev - 1, 0));
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="ml-4 inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full transition-colors duration-200 hover:scale-105"
                            style={{
                              backgroundColor: isDarkMode
                                ? "#2a3b5f"
                                : "#e8f1ff",
                              color: isDarkMode ? "#ffffff" : "#242625",
                              border: `1px solid ${
                                isDarkMode ? "#5f6e68" : "#a0c4ff"
                              }`,
                              cursor: "pointer",
                            }}
                          >
                            <FiCheck /> Mark as read
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {notifications.length > visibleCount && (
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 5)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
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
  );
}
