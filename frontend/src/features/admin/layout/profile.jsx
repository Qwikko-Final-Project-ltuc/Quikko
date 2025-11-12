import { useState, useEffect } from "react";
import { FaTimes, FaUserSlash } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteProfile } from "../../customer/customer/profileSlice";
import { profile } from "../auth/authApi";
import { AlertTriangle } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profile();
        console.log("profile data:", data);
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p
            className={`text-lg ${
              isDark ? "text-[var(--text)]" : "text-[var(--text)]"
            }`}
          >
            Loading profile...
          </p>
        </div>
      </div>
    );

  const handleDeleteAccount = async () => {
    if (deleteConfirmation === "DELETE") {
      try {
        await dispatch(deleteProfile()).unwrap();
        alert("Account deleted successfully!");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/customer/login");
      } catch (err) {
        alert("Failed to delete account: " + err.message);
      } finally {
        setShowDeleteModal(false);
        setDeleteConfirmation("");
      }
    }
  };

  return (
    <div
      className={`min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 lg:mb-12 pt-4 sm:pt-6 lg:pt-8">
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-0">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-[var(--button)] to-[#02966a] rounded-full flex items-center justify-center text-lg sm:text-xl lg:text-2xl font-bold text-white shadow-xl lg:shadow-2xl">
                {user.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-green-500 rounded-full border-2 sm:border-3 lg:border-4 border-[var(--bg)]"></div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-[var(--text)] to-[var(--button)] bg-clip-text text-transparent">
                {user.name}
              </h1>
              <p className="text-[var(--light-gray)] text-sm sm:text-base lg:text-lg mt-1 sm:mt-2">
                {user.email}
              </p>
              <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2 lg:mt-3">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs sm:text-sm text-[var(--light-gray)]">
                  Active now
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Profile Information Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div
            className={`border border-[var(--border)] rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg sm:shadow-xl lg:shadow-2xl transition-all duration-300 hover:shadow-xl sm:hover:shadow-2xl ${
              isDark
                ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)]"
                : "bg-gradient-to-br from-white to-[var(--textbox)]"
            }`}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2 sm:gap-3">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[var(--button)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Personal Information
              </h2>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-2.5 lg:h-2.5 bg-[var(--button)] rounded-full animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                <div className="group">
                  <p className="text-xs sm:text-sm text-[var(--light-gray)] mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Full Name
                  </p>
                  <p className="font-semibold text-sm sm:text-base lg:text-lg text-[var(--text)] group-hover:text-[var(--button)] transition-colors duration-200">
                    {user.name}
                  </p>
                </div>
                <div className="group">
                  <p className="text-xs sm:text-sm text-[var(--light-gray)] mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    Phone Number
                  </p>
                  <p className="font-semibold text-sm sm:text-base lg:text-lg text-[var(--text)] group-hover:text-[var(--button)] transition-colors duration-200">
                    {user.phone || "Not provided"}
                  </p>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                <div className="group">
                  <p className="text-xs sm:text-sm text-[var(--light-gray)] mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Address
                  </p>
                  <p className="font-semibold text-sm sm:text-base lg:text-lg text-[var(--text)] group-hover:text-[var(--button)] transition-colors duration-200">
                    {user.address || "Not provided"}
                  </p>
                </div>
                <div className="group">
                  <p className="text-xs sm:text-sm text-[var(--light-gray)] mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Email Address
                  </p>
                  <p className="font-semibold text-sm sm:text-base lg:text-lg text-[var(--text)] group-hover:text-[var(--button)] transition-colors duration-200">
                    {user.email}
                  </p>
                  <p className="text-[var(--light-gray)] text-xs mt-1 opacity-80">
                    Email cannot be edited
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="mt-6 sm:mt-8 lg:mt-10">
          <div
            className={`border border-red-300 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg sm:shadow-xl lg:shadow-2xl transition-all duration-300 ${
              isDark
                ? "bg-gradient-to-br from-red-900/20 to-red-800/10"
                : "bg-gradient-to-br from-red-50 to-red-100"
            } hover:shadow-xl sm:hover:shadow-2xl`}
          >
            <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4 lg:gap-6 mb-2 pb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-white w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
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
                  isDark ? "bg-[var(--error)]/5" : "bg-red-50"
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
                isDark
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
                    isDark ? "bg-[var(--div)]" : "bg-gray-50"
                  }`}
                >
                  <h5 className="font-medium text-[var(--text)] mb-2 flex items-center">
                    <AlertTriangle className="text-[var(--error)] mr-2 text-sm" />
                    What will be deleted:
                  </h5>
                  <ul className="text-[var(--light-gray)] text-sm space-y-1">
                    {[
                      "Your profile information",
                      "All your access and permision",
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
                    <span className="font-mono text-[var(--error)]">
                      DELETE
                    </span>{" "}
                    to confirm:
                  </label>
                  <input
                    type="text"
                    placeholder="DELETE"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className={`w-full p-3 border-2 border-[var(--border)] rounded-lg ${
                      isDark ? "bg-[var(--textbox)]" : "bg-white"
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
      </div>
  );
}
