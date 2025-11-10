import { useEffect, useState } from "react";
import { fetchNotifications, markNotificationsRead } from "./VendorAPI2";
import { FaCheck } from "react-icons/fa";
import Footer from "./Footer";

export default function VendorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // تحميل الإشعارات
  useEffect(() => {
    const loadNotifications = async () => {
      const data = await fetchNotifications();
      setNotifications(data);
    };
    loadNotifications();

    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLoadMore = () => setVisibleCount((prev) => prev + 5);

  const visibleNotifications = notifications.slice(0, visibleCount);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationsRead([id]);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read_status: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const pageBg = isDarkMode ? "#242625" : "#ffffff";
  const cardBg = isDarkMode ? "#313131" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#242625";
  const textGray = isDarkMode ? "#f9f9f9" : "#6b7280";
  const buttonBg = "#307A59";
  const buttonHover = "#256d4c";

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundColor: pageBg,
        color: textColor,
      }}
    >
      {/* المحتوى الرئيسي */}
      <main className="flex-grow w-full">
        <div className="max-w-3xl mx-auto mt-16 mb-18 px-4 sm:px-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-center" style={{ color: "#307A59" }}>
            All Notifications
          </h2>

          {notifications.length > 0 ? (
            <>
              <div className="space-y-3 sm:space-y-4">
                {visibleNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="rounded-2xl shadow-md p-4 sm:p-5 transition hover:shadow-lg"
                    style={{ backgroundColor: cardBg }}
                  >
                    <p className="font-semibold mb-1" style={{ color: textColor }}>
                      {notif.title || "No Title"}
                    </p>
                    <p className="text-xs sm:text-sm" style={{ color: textGray }}>
                      {notif.message}
                    </p>
                    <p className="text-[10px] sm:text-xs mt-2" style={{ color: textGray }}>
                      {new Date(notif.created_at).toLocaleString()}
                    </p>

                    {!notif.read_status && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="text-[10px] sm:text-xs font-medium mt-2 inline-flex items-center gap-1 px-2 py-1 rounded"
                        style={{ color: "#000" }}
                      >
                        <FaCheck /> Mark as Read
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {visibleCount < notifications.length && (
                <div className="mt-6 sm:mt-8 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    className="px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium rounded-lg transition"
                    style={{ backgroundColor: buttonBg, color: "#ffffff" }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = buttonHover)}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = buttonBg)}
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            <div
              className="p-4 sm:p-6 rounded-2xl shadow text-center text-sm sm:text-base"
              style={{ backgroundColor: cardBg, color: textGray }}
            >
              No notifications available
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[var(--footer-bg)]">
        <Footer />
      </footer>
    </div>
  );
}
