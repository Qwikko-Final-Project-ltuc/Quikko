import React, { useEffect, useState } from "react";
import axios from "axios";
import { useOutletContext, useNavigate } from "react-router-dom";
import { FaUser, FaEdit, FaChevronRight, FaExclamationTriangle } from "react-icons/fa";
import { fetchVendorProfile } from "../VendorAPI2";
import Footer from "../../customer/customer/components/layout/Footer";

export default function SettingsPage() {
  const { isDarkMode, setIsDarkMode } = useOutletContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false); // ✅ Confirm Modal
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchVendorProfile();
        if (data && data.success) {
          setProfile(data.data);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const handleEditProfile = () => navigate("/vendor/profile");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:3000/api/customers/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Account deleted successfully.", "success");
      localStorage.removeItem("token");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      showToast("Error deleting account.", "error");
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: isDarkMode ? "#242625" : "#f0f2f1" }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "#307A59" }}
          ></div>
          <p
            className="text-lg"
            style={{ color: isDarkMode ? "#ffffff" : "#242625" }}
          >
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen relative"
      style={{
        backgroundColor: isDarkMode ? "var(--bg-dark)" : "var(--bg)",
        color: "var(--text)",
      }}
    >
      <main className="flex-grow">
        <div className="max-w-3xl mx-auto mt-16 mb-18 px-4 sm:px-6">
          <h1 className="text-2xl font-bold mb-10 text-center sm:text-left" style={{ color: isDarkMode ? "#ffffff" : "#307A59" }}>
            Settings
          </h1>

          <div className="space-y-8">
            {/* Profile Section */}
            {profile && (
              <section className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 shadow-sm transition-all duration-300 hover:border-[var(--button)]/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-[var(--button)] to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
                        <FaUser className="text-white text-2xl" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--success)] rounded-full border-2 border-[var(--bg)] flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-xl font-semibold text-[var(--text)]">
                        {profile.store_name || "Vendor Name"}
                      </h2>
                      <p className="text-[var(--light-gray)]">
                        {profile.description || "No description"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleEditProfile}
                    className="flex items-center gap-2 px-5 py-3 bg-[var(--button)] text-white rounded-xl hover:bg-[var(--button)]/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <FaEdit className="text-sm" />
                    Edit Profile
                    <FaChevronRight className="text-xs opacity-70" />
                  </button>
                </div>
              </section>
            )}

            {/* Theme Toggle */}
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 shadow-sm transition-all duration-300 hover:border-[var(--button)]/30">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </span>
                <div
                  onClick={toggleTheme}
                  className={`w-16 h-8 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
                    isDarkMode ? "bg-[var(--button)]" : "bg-[var(--div)]"
                  }`}
                >
                  <div
                    className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                      isDarkMode ? "translate-x-8" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Delete Account */}
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 shadow-sm transition-all duration-300 hover:border-[var(--button)]/30">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Delete Account</span>
                <button
                  onClick={() => setConfirmOpen(true)}
                  className="px-4 py-2 rounded-md transition font-medium"
                  style={{ backgroundColor: "var(--error)", color: "#fff" }}
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
        </div>
      </main>

      <footer className="w-full bg-[var(--footer-bg)] mt-auto">
        <Footer />
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-white ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <span className="text-lg">{toast.type === "success" ? "✅" : "⚠️"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`bg-[var(--bg)] p-6 rounded-xl shadow-lg max-w-sm w-full`}>
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="text-yellow-500 text-2xl" />
              <h3 className="text-lg font-semibold">Confirm Delete</h3>
            </div>
            <p className="mb-6 text-[var(--text)]">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-md border border-[var(--border)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteAccount();
                  setConfirmOpen(false);
                }}
                className="px-4 py-2 rounded-md bg-[var(--error)] text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
