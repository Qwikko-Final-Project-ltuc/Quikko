import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

export default function SettingsPage() {
  const { isDarkMode, setIsDarkMode } = useOutletContext();
  const [notificationsOn, setNotificationsOn] = useState(true);

  // تخزين الوضع في localStorage
  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const toggleNotifications = () => {
    setNotificationsOn(prev => !prev);
  };

  const pageBg = isDarkMode ? "#242625" : "#f0f2f1";
  const cardBg = isDarkMode ? "#666666" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#242625";
  const buttonBg = isDarkMode ? "#307A59" : "#307A59"; // الأخضر في الدارك، الرمادي في اللايت
  const buttonHover = isDarkMode ? "#256d4c" : "#307A59";
  const buttonText = "#ffffff";

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: pageBg }}>
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: textColor }}>
        Settings
      </h2>

      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Dark Mode Toggle */}
        <div
          className="flex items-center justify-between p-4 rounded-2xl shadow-md"
          style={{ backgroundColor: cardBg }}
        >
          <span className="text-lg font-medium" style={{ color: textColor }}>
            Mode
          </span>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-md transition"
            style={{ backgroundColor: buttonBg, color: buttonText }}
            onMouseEnter={e => (e.target.style.backgroundColor = buttonHover)}
            onMouseLeave={e => (e.target.style.backgroundColor = buttonBg)}
          >
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Notifications Toggle */}
        <div
          className="flex items-center justify-between p-4 rounded-2xl shadow-md"
          style={{ backgroundColor: cardBg }}
        >
          <span className="text-lg font-medium" style={{ color: textColor }}>
            Enable Notifications
          </span>
          <button
            onClick={toggleNotifications}
            className="px-4 py-2 rounded-md transition"
            style={{
              backgroundColor: notificationsOn ? "#307A59" : "#307A59",
              color: buttonText,
            }}
            onMouseEnter={e =>
              (e.target.style.backgroundColor = notificationsOn ? "#256d4c" : "#d1d5db")
            }
            onMouseLeave={e =>
              (e.target.style.backgroundColor = notificationsOn ? "#307A59" : "#e5e7eb")
            }
          >
            {notificationsOn ? "On" : "Off"}
          </button>
        </div>
      </div>
    </div>
  );
}
