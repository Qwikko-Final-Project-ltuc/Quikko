import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FaSun,
  FaMoon,
  FaEdit,
  FaExclamationTriangle,
  FaUserSlash,
  FaUser,
  FaKey,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toggleTheme } from "./deliveryThemeSlice";
import { fetchDeliveryProfile } from "./Api/DeliveryAPI";
import {
  Sparkles,
  Moon,
  Sun,
  Shield,
  AlertTriangle,
  CreditCard,
} from "lucide-react";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const darkMode = useSelector((state) => state.deliveryTheme.darkMode);

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isThemeTransition, setIsThemeTransition] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Load delivery profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Unauthorized");

        const profileData = await fetchDeliveryProfile(token);
        setCompany(profileData.company);
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleEditProfile = () => {
    navigate("/delivery/dashboard/edit", { state: { company } });
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/customers/profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete account");

      // حذف التوكن والرجوع للّوج إن
      localStorage.removeItem("token");
      navigate("/delivery/login", { replace: true });
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

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
    navigate("/delivery/forgot-password");
  };

  // reset confirmation when modal closes
  useEffect(() => {
    if (!showDeleteModal) {
      setDeleteConfirmation("");
    }
  }, [showDeleteModal]);

  // if (loading)
  //   return (
  //     <div
  //       className={`min-h-screen ${
  //         darkMode ? "bg-[var(--bg)]" : "bg-white"
  //       } relative overflow-hidden`}
  //     >
  //       <div className="absolute inset-0 pointer-events-none">
  //         <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--button)]/2 rounded-full blur-xl animate-pulse"></div>
  //         <div
  //           className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-[var(--primary)]/2 rounded-full blur-xl animate-pulse"
  //           style={{ animationDelay: "1.5s" }}
  //         ></div>
  //       </div>
  //       <div className="relative z-10 flex items-center justify-center min-h-screen">
  //         <div className="text-center">
  //           <div className="relative">
  //             <div className="w-16 h-16 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl flex items-center justify-center mx-auto mb-4 animate-spin">
  //               <svg
  //                 className="w-6 h-6 text-white"
  //                 fill="none"
  //                 stroke="currentColor"
  //                 viewBox="0 0 24 24"
  //               >
  //                 <path
  //                   strokeLinecap="round"
  //                   strokeLinejoin="round"
  //                   strokeWidth={2}
  //                   d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
  //                 />
  //               </svg>
  //             </div>
  //             <div className="absolute inset-0 w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl blur-sm opacity-15 animate-ping"></div>
  //           </div>
  //           <p className="text-[var(--text)] text-lg font-medium">
  //             Loading Settings...
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <p
        className="text-center mt-8"
        style={{
          color: "var(--error)",
        }}
      >
        ❌ {error}
      </p>
    );

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-[var(--bg)]" : "bg-[var(--textbox)]"
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

        {/* Settings Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          {/* Profile Header Card */}
          <div
            className={`rounded-3xl p-6 mb-6 shadow-2xl border-2 ${
              darkMode
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
                    <FaUser className="text-white text-xl" />
                  </div>
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-full blur-xl opacity-0 group-hover/avatar:opacity-30 transition-opacity duration-300"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--text)] to-[var(--button)] bg-clip-text text-transparent mb-2">
                    {company?.company_name || "Delivery Partner"}
                  </h1>
                  <p
                    className={`text-base ${
                      darkMode ? "text-[var(--light-gray)]" : "text-gray-600"
                    } mb-3`}
                  >
                    {company?.user_email || "N/A"}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-xs bg-[var(--button)]/10 text-[var(--button)] px-3 py-1 rounded-full font-medium">
                      Delivery Partner
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
                darkMode
                  ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--border)]"
                  : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
              } relative overflow-hidden group transform hover:-translate-y-1 transition-all duration-300`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FaSun className="text-white text-lg" />
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
                  darkMode
                    ? "bg-gradient-to-br from-gray-900 to-blue-900"
                    : "bg-gradient-to-br from-blue-50 to-amber-50"
                } relative overflow-hidden shadow-lg`}
              >
                <div className="relative flex items-center justify-between p-4">
                  {/* Current Theme Display */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`relative w-14 h-14 rounded-xl flex items-center justify-center shadow-2xl transform transition-all duration-500 ${
                        darkMode
                          ? "bg-gradient-to-br from-gray-800 to-blue-800 rotate-12"
                          : "bg-gradient-to-br from-amber-200 to-yellow-100 -rotate-12"
                      }`}
                    >
                      {darkMode ? (
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
                        {darkMode ? "Dark Universe" : "Light Horizon"}
                      </p>
                      <p className="text-sm text-[var(--light-gray)]">
                        {darkMode
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
                      darkMode
                        ? "bg-gradient-to-r from-blue-600 to-purple-600"
                        : "bg-gradient-to-r from-amber-400 to-orange-400"
                    } shadow-2xl border-2 ${
                      darkMode ? "border-blue-400" : "border-amber-300"
                    } group/switch overflow-hidden`}
                  >
                    {/* Animated Background */}
                    <div
                      className={`absolute inset-0 rounded-full transition-all duration-500 ${
                        darkMode
                          ? "bg-gradient-to-r from-blue-700 to-purple-700"
                          : "bg-gradient-to-r from-amber-300 to-orange-300"
                      }`}
                    ></div>

                    {/* Cosmic/Light Effects */}
                    <div
                      className={`absolute inset-0 rounded-full opacity-0 group-hover/switch:opacity-100 transition-opacity duration-300 ${
                        darkMode
                          ? "bg-gradient-to-r from-blue-400/30 to-purple-400/30"
                          : "bg-gradient-to-r from-amber-200/50 to-orange-200/50"
                      }`}
                    ></div>

                    {/* Toggle Knob */}
                    <div
                      className={`absolute top-1 w-8 h-8 rounded-full transition-all duration-500 transform ${
                        darkMode
                          ? "left-10 bg-gradient-to-br from-gray-300 to-white shadow-lg"
                          : "left-2 bg-gradient-to-br from-yellow-100 to-amber-200 shadow-lg"
                      } flex items-center justify-center`}
                    >
                      {/* Inner Icon */}
                      <div
                        className={`transition-all duration-300 ${
                          darkMode
                            ? "text-blue-600 scale-100"
                            : "text-amber-600 scale-100"
                        }`}
                      >
                        {darkMode ? (
                          <Sparkles size={12} className="animate-float" />
                        ) : (
                          <Sparkles size={12} className="animate-pulse" />
                        )}
                      </div>

                      {/* Glow Effect */}
                      <div
                        className={`absolute inset-0 rounded-full animate-pulse ${
                          darkMode ? "bg-blue-400/20" : "bg-amber-400/20"
                        }`}
                      ></div>
                    </div>

                    {/* Background Elements */}
                    <div
                      className={`absolute inset-0 rounded-full overflow-hidden ${
                        darkMode ? "opacity-20" : "opacity-10"
                      }`}
                    >
                      {darkMode ? (
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
                    darkMode ? "text-blue-200" : "text-amber-600"
                  } text-xs font-medium`}
                >
                  {darkMode
                    ? "🌙 Cosmic night mode activated"
                    : "☀️ Solar day mode active"}
                </div>
              </div>

              {/* Theme Features */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div
                  className={`text-center p-3 rounded-xl border ${
                    darkMode
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                  }`}
                >
                  <div className="text-xs font-semibold">
                    {darkMode ? "🌌 Easy on Eyes" : "☀️ Energy Boost"}
                  </div>
                </div>
                <div
                  className={`text-center p-3 rounded-xl border ${
                    darkMode
                      ? "bg-purple-500/10 border-purple-500/20 text-purple-300"
                      : "bg-orange-500/10 border-orange-500/20 text-orange-600"
                  }`}
                >
                  <div className="text-xs font-semibold">
                    {darkMode ? "🚀 Focus Mode" : "🎯 Clarity"}
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div
              className={`rounded-3xl p-6 shadow-2xl border-2 ${
                darkMode
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
                    darkMode ? "bg-[var(--div)]" : "bg-[var(--textbox)]"
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

          {/* Delete Account Section */}
          <div
            className={`rounded-3xl p-6 shadow-2xl border-2 ${
              darkMode
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
                darkMode ? "bg-[var(--error)]/5" : "bg-red-50"
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
              darkMode
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
                  darkMode ? "bg-[var(--div)]" : "bg-gray-50"
                }`}
              >
                <h5 className="font-medium text-[var(--text)] mb-2 flex items-center">
                  <AlertTriangle className="text-[var(--error)] mr-2 text-sm" />
                  What will be deleted:
                </h5>
                <ul className="text-[var(--light-gray)] text-sm space-y-1">
                  {[
                    "Your profile information",
                    "All your delivery history",
                    "Account preferences",
                    "All saved data",
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
                    darkMode ? "bg-[var(--textbox)]" : "bg-white"
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
                <span>{deleting ? "Deleting..." : "Delete Account"}</span>
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
