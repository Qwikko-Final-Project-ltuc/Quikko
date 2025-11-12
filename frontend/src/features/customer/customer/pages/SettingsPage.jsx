import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FaCreditCard,
  FaTrash,
  FaEdit,
  FaUserSlash,
  FaExclamationTriangle,
  FaPalette,
  FaChevronRight,
  FaKey,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { fetchProfile, deleteProfile } from "../profileSlice"; // 👈 رح نعلّق استخدامه تحت
import { fetchPayments, deletePayment } from "../paymentSlice";
import { toggleTheme } from "../../themeSlice";
import {
  Sparkles,
  Moon,
  Sun,
  CreditCard,
  Shield,
  AlertTriangle,
  Star,
} from "lucide-react";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isThemeTransition, setIsThemeTransition] = useState(false);

  // profileSlice
  const { data: profile, loading: profileLoading } = useSelector(
    (state) => state.profile
  );

  // paymentSlice
  const { payments } = useSelector((state) => state.payment);

  // theme
  const { mode: theme } = useSelector((state) => state.customerTheme);

  // fetch profile + payments on mount
  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchPayments());
  }, [dispatch]);

  // handle edit profile
  const handleEditProfile = () => {
    navigate("/customer/profile", { state: { profile } });
  };

  // ⬇⬇⬇ هون عدلنا ⬇⬇⬇
const handleDeleteAccount = async () => {
  if (deleteConfirmation !== "DELETE") return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:3000/api/customers/profile", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || "Failed to delete account");
    }

    // شيل التوكنات لو موجودة
    localStorage.removeItem("token");
    localStorage.removeItem("customerToken");

    // سكّر المودال وروّح عاللوجن
    setShowDeleteModal(false);
    navigate("/customer/login");
  } catch (err) {
    console.error("Failed to delete account:", err);
    // ما في alert، بس بنسكر المودال
    setShowDeleteModal(false);
  }
};

  // ⬆⬆⬆ هون عدلنا ⬆⬆⬆

  // handle theme toggle with animation
  const handleThemeToggle = () => {
    setIsThemeTransition(true);
    setTimeout(() => {
      dispatch(toggleTheme());
      setTimeout(() => {
        setIsThemeTransition(false);
      }, 300);
    }, 200);
  };

  // handle password change
  const handleChangePassword = () => {
    navigate("/customer/forgot-password");
  };

  // extract unique Visa cards
  const visaCards = React.useMemo(() => {
    if (!payments) return [];
    const seen = new Set();
    return payments
      .filter((p) => p.card_brand === "Visa")
      .filter((p) => {
        if (seen.has(p.card_last4)) return false;
        seen.add(p.card_last4);
        return true;
      });
  }, [payments]);

  // reset confirmation when modal closes
  useEffect(() => {
    if (!showDeleteModal) {
      setDeleteConfirmation("");
    }
  }, [showDeleteModal]);

  // Loading State
  if (profileLoading) {
    return (
      <div
        className={`min-h-screen ${
          theme === "dark" ? "bg-[var(--bg)]" : "bg-white"
        } relative overflow-hidden`}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--button)]/2 rounded-full blur-xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-[var(--primary)]/2 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl flex items-center justify-center mx-auto mb-4 animate-spin">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <div className="absolute inset-0 w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl blur-sm opacity-15 animate-ping"></div>
            </div>
            <p className="text-[var(--text)] text-lg font-medium">
              Loading Settings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-[var(--bg)]" : "bg-[var(--textbox)]"
      } transition-all duration-500 relative overflow-hidden`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--button)]/5 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-0 right-0 w-80 h-80 bg-[var(--primary)]/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--success)]/3 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header spacer */}
        <div className="relative overflow-hidden mb-8"></div>

        {/* Settings Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          {/* Profile Header Card */}
          <div
            className={`rounded-3xl p-6 mb-6 shadow-2xl border-2 ${
              theme === "dark"
                ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--border)]"
                : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
            } relative overflow-hidden group transform hover:-translate-y-1 transition-all duration-300`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--button)] rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--primary)] rounded-full translate-y-24 -translate-x-24"></div>
            </div>

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              {/* User Info */}
              <div className="flex items-center gap-6">
                <div className="relative group/avatar">
                  <div className="w-20 h-20 bg-gradient-to-br from-[var(--button)] to-[#02966a] rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-2xl transform group-hover/avatar:scale-110 transition-all duration-300 relative z-10">
                    {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-full blur-xl opacity-0 group-hover/avatar:opacity-30 transition-opacity duration-300"></div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[var(--bg)] z-20"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--text)] to-[var(--button)] bg-clip-text text-transparent mb-2">
                    {profile?.name}
                  </h1>
                  <p
                    className={`text-base ${
                      theme === "dark" ? "text-[var(--light-gray)]" : "text-gray-600"
                    } mb-3`}
                  >
                    {profile?.email}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-xs bg-[var(--button)]/10 text-[var(--button)] px-3 py-1 rounded-full font-medium">
                      Premium Member
                    </span>
                    <span className="text-xs text-[var(--light-gray)]">
                      Joined {new Date().getFullYear()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={handleEditProfile}
                className="relative bg-gradient-to-r from-[var(--button)] to-[var(--primary)] text-white px-6 py-3 rounded-2xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 shadow-lg transform hover:scale-105 font-bold group/btn overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                <FaEdit className="relative z-10 text-sm" />
                <span className="relative z-10">Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Theme Toggle Section */}
            <div
              className={`rounded-3xl p-6 shadow-2xl border-2 ${
                theme === "dark"
                  ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--border)]"
                  : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
              } relative overflow-hidden group transform hover:-translate-y-1 transition-all duration-300`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FaPalette className="text-white text-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text)]">
                      Appearance
                    </h2>
                    <p className="text-[var(--light-gray)] text-sm">
                      Customize your interface
                    </p>
                  </div>
                </div>
              </div>

              {/* Innovative Theme Toggle */}
              <div
                className={`rounded-2xl p-1 border-2 border-[var(--border)] ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-gray-900 to-blue-900"
                    : "bg-gradient-to-br from-blue-50 to-amber-50"
                } relative overflow-hidden shadow-lg`}
              >
                <div className="relative flex items-center justify-between p-4">
                  {/* Current Theme Display */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`relative w-14 h-14 rounded-xl flex items-center justify-center shadow-2xl transform transition-all duration-500 ${
                        theme === "dark"
                          ? "bg-gradient-to-br from-gray-800 to-blue-800 rotate-12"
                          : "bg-gradient-to-br from-amber-200 to-yellow-100 -rotate-12"
                      }`}
                    >
                      {theme === "dark" ? (
                        <>
                          {/* Stars for Dark Mode */}
                          <div className="absolute top-2 left-3 w-1 h-1 bg-white rounded-full animate-twinkle"></div>
                          <div
                            className="absolute top-4 right-2 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
                            style={{ animationDelay: "1s" }}
                          ></div>
                          <div
                            className="absolute bottom-3 left-2 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
                            style={{ animationDelay: "2s" }}
                          ></div>
                          <Moon className="text-blue-300" size={20} />
                        </>
                      ) : (
                        <>
                          {/* Sun Rays */}
                          <div className="absolute inset-0 rounded-xl bg-yellow-200/20 animate-pulse"></div>
                          <Sun className="text-amber-600" size={20} />
                        </>
                      )}
                    </div>

                    <div>
                      <p className="font-bold text-[var(--text)] text-lg">
                        {theme === "dark" ? "Dark Universe" : "Light Horizon"}
                      </p>
                      <p className="text-sm text-[var(--light-gray)]">
                        {theme === "dark"
                          ? "Explore the cosmos"
                          : "Embrace the daylight"}
                      </p>
                    </div>
                  </div>

                  {/* Advanced Theme Toggle Switch */}
                  <button
                    onClick={handleThemeToggle}
                    disabled={isThemeTransition}
                    className={`relative w-20 h-10 rounded-full transition-all duration-500 transform hover:scale-110 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600"
                        : "bg-gradient-to-r from-amber-400 to-orange-400"
                    } shadow-2xl border-2 ${
                      theme === "dark" ? "border-blue-400" : "border-amber-300"
                    } group/switch overflow-hidden`}
                  >
                    {/* Animated Background */}
                    <div
                      className={`absolute inset-0 rounded-full transition-all duration-500 ${
                        theme === "dark"
                          ? "bg-gradient-to-r from-blue-700 to-purple-700"
                          : "bg-gradient-to-r from-amber-300 to-orange-300"
                      }`}
                    ></div>

                    {/* Cosmic/Light Effects */}
                    <div
                      className={`absolute inset-0 rounded-full opacity-0 group-hover/switch:opacity-100 transition-opacity duration-300 ${
                        theme === "dark"
                          ? "bg-gradient-to-r from-blue-400/30 to-purple-400/30"
                          : "bg-gradient-to-r from-amber-200/50 to-orange-200/50"
                      }`}
                    ></div>

                    {/* Toggle Knob */}
                    <div
                      className={`absolute top-1 w-8 h-8 rounded-full transition-all duration-500 transform ${
                        theme === "dark"
                          ? "left-10 bg-gradient-to-br from-gray-300 to-white shadow-lg"
                          : "left-2 bg-gradient-to-br from-yellow-100 to-amber-200 shadow-lg"
                      } flex items-center justify-center`}
                    >
                      {/* Inner Icon */}
                      <div
                        className={`transition-all duration-300 ${
                          theme === "dark"
                            ? "text-blue-600 scale-100"
                            : "text-amber-600 scale-100"
                        }`}
                      >
                        {theme === "dark" ? (
                          <Star size={12} className="animate-float" />
                        ) : (
                          <Sparkles size={12} className="animate-pulse" />
                        )}
                      </div>

                      {/* Glow Effect */}
                      <div
                        className={`absolute inset-0 rounded-full animate-pulse ${
                          theme === "dark"
                            ? "bg-blue-400/20"
                            : "bg-amber-400/20"
                        }`}
                      ></div>
                    </div>

                    {/* Background Elements */}
                    <div
                      className={`absolute inset-0 rounded-full overflow-hidden ${
                        theme === "dark" ? "opacity-20" : "opacity-10"
                      }`}
                    >
                      {theme === "dark" ? (
                        <>
                          {/* Stars */}
                          <div className="absolute top-1 left-3 w-1 h-1 bg-white rounded-full animate-twinkle"></div>
                          <div
                            className="absolute bottom-2 right-4 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
                            style={{ animationDelay: "0.5s" }}
                          ></div>
                          <div
                            className="absolute top-3 right-2 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
                            style={{ animationDelay: "1s" }}
                          ></div>
                        </>
                      ) : (
                        <>
                          {/* Sun Flares */}
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-yellow-200/10 to-transparent animate-rotate"></div>
                        </>
                      )}
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/switch:translate-x-[100%] transition-transform duration-1000"></div>
                  </button>
                </div>

                {/* Theme Description */}
                <div
                  className={`px-4 pb-3 text-center ${
                    theme === "dark" ? "text-blue-200" : "text-amber-600"
                  } text-xs font-medium`}
                >
                  {theme === "dark"
                    ? "🌙 Cosmic night mode activated"
                    : "☀️ Solar day mode active"}
                </div>
              </div>

              {/* Theme Features */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div
                  className={`text-center p-3 rounded-xl border ${
                    theme === "dark"
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                  }`}
                >
                  <div className="text-xs font-semibold">
                    {theme === "dark" ? "🌌 Easy on Eyes" : "☀️ Energy Boost"}
                  </div>
                </div>
                <div
                  className={`text-center p-3 rounded-xl border ${
                    theme === "dark"
                      ? "bg-purple-500/10 border-purple-500/20 text-purple-300"
                      : "bg-orange-500/10 border-orange-500/20 text-orange-600"
                  }`}
                >
                  <div className="text-xs font-semibold">
                    {theme === "dark" ? "🚀 Focus Mode" : "🎯 Clarity"}
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div
              className={`rounded-3xl p-6 shadow-2xl border-2 ${
                theme === "dark"
                  ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--border)]"
                  : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
              } relative overflow-hidden group transform hover:-translate-y-1 transition-all duration-300`}
            >
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--success)] to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text)]">
                    Security
                  </h2>
                  <p className="text-[var(--light-gray)] text-sm">
                    Protect your account
                  </p>
                </div>
              </div>

              {/* Security Options */}
              <div className="space-y-4 relative z-10">
                <div
                  className={`flex items-center justify-between p-4 rounded-xl border-2 border-[var(--border)] hover:border-[var(--success)] transition-all duration-200 cursor-pointer group ${
                    theme === "dark" ? "bg-[var(--div)]" : "bg-[var(--textbox)]"
                  } transform hover:-translate-y-1`}
                  onClick={handleChangePassword}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--success)]/20 rounded-lg flex items-center justify-center">
                      <FaKey className="text-[var(--success)]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text)]">
                        Change Password
                      </p>
                      <p className="text-sm text-[var(--light-gray)]">
                        Update your password regularly
                      </p>
                    </div>
                  </div>
                  <FaChevronRight className="text-[var(--light-gray)] group-hover:text-[var(--success)] group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Section */}
          <div
            className={`rounded-3xl p-6 shadow-2xl border-2 ${
              theme === "dark"
                ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--border)]"
                : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
            } relative overflow-hidden group transform hover:-translate-y-1 transition-all duration-300 mb-8`}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text)]">
                    Payment Methods
                  </h2>
                  <p className="text-[var(--light-gray)] text-sm">
                    Manage your saved payment cards
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Cards */}
            <div className="space-y-4 relative z-10">
              {visaCards.length === 0 ? (
                <div
                  className={`text-center py-8 border-2 border-dashed border-[var(--border)] rounded-xl hover:border-[var(--button)] transition-colors duration-200 ${
                    theme === "dark" ? "bg-[var(--div)]" : "bg-[var(--textbox)]"
                  } transform hover:scale-105 transition-all duration-300`}
                >
                  <CreditCard className="text-[var(--light-gray)] text-4xl mx-auto mb-4" />
                  <p className="text-[var(--light-gray)] font-medium mb-2">
                    No payment methods saved
                  </p>
                  <p className="text-sm text-[var(--light-gray)]">
                    Add a card to get started
                  </p>
                </div>
              ) : (
                visaCards.map((p, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 border-[var(--border)] hover:border-[var(--button)] transition-all duration-200 group ${
                      theme === "dark" ? "bg-[var(--div)]" : "bg-[var(--textbox)]"
                    } transform hover:-translate-y-1`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--button)] to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <CreditCard className="text-white text-lg" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text)] flex items-center gap-2">
                          {p.card_brand} •••• {p.card_last4}
                          <span className="text-xs bg-[var(--success)]/20 text-[var(--success)] px-2 py-1 rounded-full">
                            Default
                          </span>
                        </p>
                        <p className="text-sm text-[var(--light-gray)]">
                          Expires 12/2025
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => dispatch(deletePayment(p.id))}
                      className="flex items-center gap-2 px-3 py-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 transform hover:scale-105"
                    >
                      <FaTrash className="text-sm" /> Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Delete Account Section */}
          <div
            className={`rounded-3xl p-6 shadow-2xl border-2 ${
              theme === "dark"
                ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--error)]/30"
                : "bg-gradient-to-br from-white to-gray-50 border-red-200"
            } relative overflow-hidden group transform hover:-translate-y-1 transition-all duration-300`}
          >
            {/* Card Header */}
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--error)] to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text)]">
                  Danger Zone
                </h2>
                <p className="text-[var(--light-gray)] text-sm">
                  Irreversible actions
                </p>
              </div>
            </div>

            {/* Delete Account Card */}
            <div
              className={`rounded-xl p-5 border-2 border-[var(--error)]/30 ${
                theme === "dark" ? "bg-[var(--error)]/5" : "bg-red-50"
              } hover:border-[var(--error)]/50 transition-colors duration-200 relative z-10`}
            >
              <div className="flex items-start gap-3">
                <FaUserSlash className="text-[var(--error)] mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--text)] mb-2">
                    Delete Account
                  </h3>
                  <p className="text-[var(--light-gray)] text-sm mb-4 leading-relaxed">
                    Once you delete your account, all your data will be
                    permanently removed. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="relative bg-gradient-to-br from-[var(--error)] to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-200 font-medium w-full flex items-center justify-center gap-3 transform hover:scale-105 group/delete overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/delete:translate-x-[100%] transition-transform duration-1000"></div>
                    <FaUserSlash className="relative z-10" />
                    <span className="relative z-10">Delete My Account</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`rounded-2xl shadow-2xl max-w-md w-full border-2 ${
              theme === "dark"
                ? "bg-[var(--bg)] border-[var(--error)]/30"
                : "bg-white border-red-200"
            } animate-scale-in`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--error)] to-red-600 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--text)]">
                    Delete Account
                  </h3>
                  <p className="text-[var(--light-gray)] text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-[var(--light-gray)] hover:text-[var(--error)] transition-colors duration-200 p-2 rounded-lg hover:bg-[var(--error)]/10"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex items-start gap-3 mb-6">
                <AlertTriangle className="text-[var(--error)] mt-1 flex-shrink-0 text-xl" />
                <div>
                  <h4 className="font-semibold text-[var(--text)] mb-2">
                    Are you absolutely sure?
                  </h4>
                  <p className="text-[var(--light-gray)] text-sm leading-relaxed">
                    This will permanently delete your account and remove all
                    your data from our servers. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div
                className={`border border-[var(--border)] rounded-xl p-4 mb-6 ${
                  theme === "dark" ? "bg-[var(--div)]" : "bg-gray-50"
                }`}
              >
                <h5 className="font-medium text-[var(--text)] mb-2 flex items-center">
                  <AlertTriangle className="text-[var(--error)] mr-2 text-sm" />
                  What will be deleted:
                </h5>
                <ul className="text-[var(--light-gray)] text-sm space-y-1">
                  {[
                    "Your profile information",
                    "All your orders and order history",
                    "Saved payment methods",
                    "Wishlist and preferences",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-1 h-1 bg-[var(--error)] rounded-full mr-2"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Confirmation Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Type{" "}
                  <span className="font-mono text-[var(--error)]">DELETE</span>{" "}
                  to confirm:
                </label>
                <input
                  type="text"
                  placeholder="DELETE"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className={`w-full p-3 border-2 border-[var(--border)] rounded-lg ${
                    theme === "dark" ? "bg-[var(--textbox)]" : "bg-white"
                  } text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--error)]/50 focus:border-[var(--error)] transition-all duration-200 font-mono text-center`}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-[var(--border)]">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border-2 border-[var(--border)] text-[var(--text)] rounded-xl hover:bg-[var(--hover)] transition-all duration-200 font-medium transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-3 bg-gradient-to-br from-[var(--error)] to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 disabled:hover:scale-100"
                disabled={deleteConfirmation !== "DELETE"}
              >
                <FaUserSlash />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
            opacity: 0.7;
          }
          33% {
            transform: translateY(-20px) translateX(10px) rotate(120deg);
            opacity: 1;
          }
          66% {
            transform: translateY(10px) translateX(-15px) rotate(240deg);
            opacity: 0.8;
          }
        }
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.1);
          }
        }
        @keyframes gradient-x-slow {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes scale-in {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-gradient-x-slow {
          background-size: 200% 200%;
          animation: gradient-x-slow 8s ease infinite;
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        .animate-rotate {
          animation: rotate 10s linear infinite;
        }
      `}</style>
    </div>
  );
}
