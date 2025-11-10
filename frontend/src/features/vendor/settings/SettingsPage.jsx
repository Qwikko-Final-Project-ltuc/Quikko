import React, { useEffect, useState } from "react";
import axios from "axios";
import { useOutletContext, useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const { isDarkMode, setIsDarkMode } = useOutletContext();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const navigate = useNavigate();

  // 🎨 Apply dark/light class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const toggleNotifications = () => {
    setNotificationsOn((prev) => !prev);
  };

  // 🗑️ Delete account function
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to delete your account? This action cannot be undone!"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:3000/api/customers/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Account deleted successfully.");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting the account.");
    }
  };

  return (
   <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: isDarkMode ? "var(--bg-dark)" : "var(--bg)",
        color: "var(--text)",
     padding: "3rem", }}
    >
    <h2 className="text-2xl font-bold mb-10 text-center sm:text-left px-2 sm:px-12">
      Settings
    </h2>

    <div className="space-y-10 max-w-3xl mx-auto px-2 sm:px-4">
      {/* 🌓 Theme Toggle Switch */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl shadow-md"
        style={{
          backgroundColor: isDarkMode ? "var(--mid-dark)" : "var(--bg)",
        }}
      >
        <span className="text-lg font-medium text-center sm:text-left">
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </span>
        <div
          onClick={toggleTheme}
          className={`w-16 h-8 mx-auto sm:mx-0 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
            isDarkMode ? "bg-[var(--button)]" : "bg-[var(--div)]"
          }`}
        >
          <div
            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
              isDarkMode ? "translate-x-8" : "translate-x-0"
            }`}
          ></div>
        </div>
      </div>

      {/* 🗑️ Delete Account */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl shadow-md mt-8"
        style={{
          backgroundColor: isDarkMode ? "var(--mid-dark)" : "var(--bg)",
        }}
      >
        <span className="text-lg font-medium text-center sm:text-left">
          Delete Account
        </span>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 rounded-md transition font-medium w-full sm:w-auto"
          style={{
            backgroundColor: "var(--error)",
            color: "#fff",
          }}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor = "#b91c1c")
          }
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = "var(--error)")
          }
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

}
