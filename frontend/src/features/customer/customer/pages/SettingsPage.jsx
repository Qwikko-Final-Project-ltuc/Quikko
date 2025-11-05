import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  FaCreditCard, 
  FaTrash, 
  FaEdit, 
  FaUserSlash,
  FaExclamationTriangle,
  FaUser,
  FaPalette,
  FaShieldAlt,
  FaCog,
  FaChevronRight,
  FaKey,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { fetchProfile, deleteProfile } from "../profileSlice";
import { fetchPayments, deletePayment } from "../paymentSlice";
import { toggleTheme } from "../../themeSlice";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // profileSlice
  const { data: profile, loading: profileLoading } = useSelector(state => state.profile);

  // paymentSlice
  const { payments, status: paymentsStatus } = useSelector(state => state.payment);

  // theme
  const { mode: theme } = useSelector(state => state.customerTheme);

  // fetch profile + payments on mount
  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchPayments());
  }, [dispatch]);

  // handle edit profile
  const handleEditProfile = () => {
    navigate("/customer/profile", { state: { profile } });
  };

  // handle delete account
  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteProfile()).unwrap();
      setShowDeleteModal(false);
      navigate("/customer/home"); 
    } catch (err) {
      alert("Failed to delete account: " + err.message);
      setShowDeleteModal(false);
    }
  };

  // handle theme toggle
  const handleThemeToggle = () => {
    dispatch(toggleTheme());
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
      .filter(p => p.card_brand === "Visa")
      .filter(p => {
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

  if (profileLoading) return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[var(--div)] rounded-lg w-48 mb-8"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[var(--div)] rounded-2xl h-32"></div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6">
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--bg)] rounded-2xl shadow-2xl max-w-md w-full border border-[var(--error)]/30 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--error)] to-red-600 rounded-xl flex items-center justify-center">
                  <FaExclamationTriangle className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--text)]">Delete Account</h3>
                  <p className="text-[var(--light-gray)] text-sm">This action cannot be undone</p>
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
              <div className="flex items-start space-x-3 mb-6">
                <FaExclamationTriangle className="text-[var(--error)] mt-1 flex-shrink-0 text-xl" />
                <div>
                  <h4 className="font-semibold text-[var(--text)] mb-2">Are you absolutely sure?</h4>
                  <p className="text-[var(--light-gray)] text-sm leading-relaxed">
                    This will permanently delete your account and remove all your data from our servers. 
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-[var(--div)] border border-[var(--border)] rounded-xl p-4 mb-6">
                <h5 className="font-medium text-[var(--text)] mb-2 flex items-center">
                  <FaExclamationTriangle className="text-[var(--error)] mr-2 text-sm" />
                  What will be deleted:
                </h5>
                <ul className="text-[var(--light-gray)] text-sm space-y-1">
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-[var(--error)] rounded-full mr-2"></div>
                    Your profile information
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-[var(--error)] rounded-full mr-2"></div>
                    All your orders and order history
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-[var(--error)] rounded-full mr-2"></div>
                    Saved payment methods
                  </li>
                  <li className="flex items-center">
                    <div className="w-1 h-1 bg-[var(--error)] rounded-full mr-2"></div>
                    Wishlist and preferences
                  </li>
                </ul>
              </div>

              {/* Confirmation Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Type <span className="font-mono text-[var(--error)]">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  placeholder="DELETE"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--textbox)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--error)]/50 focus:border-[var(--error)] transition-all duration-200 font-mono text-center"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex space-x-3 p-6 border-t border-[var(--border)]">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border border-[var(--border)] text-[var(--text)] rounded-xl hover:bg-[var(--hover)] transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-3 bg-gradient-to-br from-[var(--error)] to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                disabled={deleteConfirmation !== 'DELETE'}
              >
                <FaUserSlash />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* التغيير هنا: إزالة mb-20 */}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 pt-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[var(--button)] rounded-xl flex items-center justify-center">
              <FaCog className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--text)]">Settings</h1>
              <p className="text-[var(--light-gray)] mt-1">Manage your account preferences and security</p>
            </div>
          </div>
        </header>

        {/* Profile Section */}
        <section className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 shadow-sm mb-6 hover:shadow-md transition-all duration-300 hover:border-[var(--button)]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--button)] to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaUser className="text-white text-2xl" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--success)] rounded-full border-2 border-[var(--bg)] flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)]">{profile?.name}</h2>
                <p className="text-[var(--light-gray)]">{profile?.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs bg-[var(--button)]/10 text-[var(--button)] px-2 py-1 rounded-full font-medium">
                    Premium Member
                  </span>
                  <span className="text-xs text-[var(--light-gray)]">
                    Joined {new Date().getFullYear()}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleEditProfile} 
              className="flex items-center gap-3 px-5 py-3 bg-[var(--button)] text-white rounded-xl hover:bg-[var(--button)]/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 group"
            >
              <FaEdit className="text-sm" /> 
              Edit Profile
              <FaChevronRight className="text-xs opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Theme Toggle Section */}
          <section className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[var(--primary)]/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaPalette className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text)]">Appearance</h3>
                  <p className="text-[var(--light-gray)] text-sm">Customize your interface</p>
                </div>
              </div>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-xl border border-[var(--border)] ${
              theme === 'dark' ? 'bg-[var(--div)]' : 'bg-[var(--textbox)]'
            }`}>
              <div>
                <p className="font-medium text-[var(--text)]">Theme</p>
                <p className="text-sm text-[var(--light-gray)]">{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</p>
              </div>
              <button 
                onClick={handleThemeToggle}
                className="px-6 py-2 bg-[var(--bg)] text-[var(--text)] rounded-lg border border-[var(--border)] hover:bg-[var(--hover)] hover:border-[var(--primary)] transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Switch
              </button>
            </div>
          </section>

          {/* Security Section */}
          <section className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[var(--success)]/30">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--success)] to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaShieldAlt className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)]">Security</h2>
                <p className="text-[var(--light-gray)]">Protect your account</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div 
                className={`flex items-center justify-between p-4 rounded-xl border border-[var(--border)] hover:border-[var(--success)] transition-all duration-200 cursor-pointer group ${
                  theme === 'dark' ? 'bg-[var(--div)] hover:bg-[var(--div)]/80' : 'bg-[var(--textbox)] hover:bg-[var(--textbox)]/80'
                }`}
                onClick={handleChangePassword}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[var(--success)]/20 rounded-lg flex items-center justify-center">
                    <FaKey className="text-[var(--success)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text)]">Change Password</p>
                    <p className="text-sm text-[var(--light-gray)]">Update your password regularly</p>
                  </div>
                </div>
                <FaChevronRight className="text-[var(--light-gray)] group-hover:text-[var(--success)] group-hover:translate-x-1 transition-all duration-200" />
              </div>
            </div>
          </section>
        </div>

        {/* Cards Section */}
        <section className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 shadow-sm mb-6 hover:shadow-md transition-all duration-300 hover:border-[var(--primary)]/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaCreditCard className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)]">Payment Methods</h2>
                <p className="text-[var(--light-gray)]">Manage your saved payment cards</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4">
            {visaCards.length === 0 ? (
              <div className={`text-center py-8 border-2 border-dashed border-[var(--border)] rounded-xl hover:border-[var(--button)] transition-colors duration-200 pt-4 ${
                theme === 'dark' ? 'bg-[var(--div)]' : 'bg-[var(--textbox)]'
              }`}>
                <FaCreditCard className="text-[var(--light-gray)] text-6xl mx-auto m-4" />
                <p className="text-[var(--light-gray)] mb-2">No payment methods saved</p>
                <p className="text-sm text-[var(--light-gray)] mb-4">Add a card to get started</p>
              </div>
            ) : (
              visaCards.map((p, idx) => (
                <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border border-[var(--border)] hover:border-[var(--button)] hover:shadow-sm transition-all duration-200 group ${
                  theme === 'dark' ? 'bg-[var(--div)]' : 'bg-[var(--textbox)]'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--button)] to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaCreditCard className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text)] flex items-center gap-2">
                        {p.card_brand} •••• {p.card_last4}
                        <span className="text-xs bg-[var(--success)]/20 text-[var(--success)] px-2 py-1 rounded-full">Default</span>
                      </p>
                      <p className="text-sm text-[var(--light-gray)]">Expires 12/2025</p>
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch(deletePayment(p.id))}
                    className="flex items-center gap-2 px-3 py-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <FaTrash /> Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Delete Account Section */}
        <section className="bg-[var(--bg)] border border-[var(--error)]/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[var(--error)]/40">
          <div className="flex items-center space-x-3 pb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--error)] to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaExclamationTriangle className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text)]">Danger Zone</h2>
              <p className="text-[var(--light-gray)]">Irreversible actions</p>
            </div>
          </div>
          
          <div className="bg-[var(--error)]/5 border border-[var(--error)]/20 rounded-xl p-5 pb-6 hover:border-[var(--error)]/40 transition-colors duration-200">
            <div className="flex items-start space-x-3">
              <FaUserSlash className="text-[var(--error)] mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--text)] mb-2">Delete Account</h3>
                <p className="text-[var(--light-gray)] text-sm mb-4 leading-relaxed">
                  Once you delete your account, all your data will be permanently removed. This action cannot be undone.
                </p>
                <button 
                  onClick={() => setShowDeleteModal(true)} 
                  className="flex items-center gap-3 bg-gradient-to-br from-[var(--error)] to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-medium w-full justify-center hover:scale-105"
                >
                  <FaUserSlash /> Delete My Account
                </button>
              </div>
            </div>
          </div>
        </section>
        <div className="h-20 bg-[var(--bg)]"></div>

      </div>
    </div>
  );
}