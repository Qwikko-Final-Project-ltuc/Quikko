import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  FaCreditCard, 
  FaTrash, 
  FaEdit, 
  FaUserSlash,
  FaExclamationTriangle,
  FaUser,
  FaBell,
  FaPalette
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { fetchProfile, deleteProfile } from "../profileSlice";
import { fetchPayments, deletePayment } from "../paymentSlice";
import { toggleTheme } from "../../themeSlice";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await dispatch(deleteProfile()).unwrap();
        alert("Account deleted successfully!");
        navigate("/customer/home"); 
      } catch (err) {
        alert("Failed to delete account: " + err.message);
      }
    }
  };

  // handle theme toggle
  const handleThemeToggle = () => {
    dispatch(toggleTheme());
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6 ">
      <div className="max-w-4xl mx-auto ">
        {/* Header */}
        <header className="mb-6 pt-6 ">
          <h1 className="text-3xl font-bold text-[var(--text)]">Settings</h1>
          <p className="text-[var(--light-gray)] mt-2">Manage your account preferences and security</p>
        </header>

        {/* Profile Section */}
        <section className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 shadow-lg mb-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[var(--button)] rounded-full flex items-center justify-center">
                <FaUser className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)]">{profile?.name}</h2>
                <p className="text-[var(--light-gray)]">{profile?.email}</p>
                <p className="text-sm text-[var(--light-gray)] mt-1">Member since 2024</p>
              </div>
            </div>
            <button 
              onClick={handleEditProfile} 
              className="flex items-center gap-2 px-4 py-2 bg-[var(--button)] text-white rounded-lg hover:bg-[var(--button)]/90 transition-colors duration-200"
            >
              <FaEdit /> Edit Profile
            </button>
          </div>
        </section>

        {/* Theme Toggle Section */}
        <section className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 shadow-lg mb-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[var(--primary)]/20 rounded-full flex items-center justify-center">
                <FaPalette className="text-[var(--primary)] text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)]">Theme</h3>
                <p className="text-[var(--light-gray)]">Current: {theme === 'light' ? 'Light Mode' : 'Dark Mode'}</p>
              </div>
            </div>
            <button 
              onClick={handleThemeToggle}
              className="px-6 py-3 bg-[var(--textbox)] text-[var(--text)] rounded-lg border border-[var(--border)] hover:bg-[var(--hover)] transition-colors duration-200 font-medium"
            >
              Switch to {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </div>
        </section>

        {/* Cards Section */}
        <section className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 shadow-lg mb-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-[var(--primary)]/20 rounded-full flex items-center justify-center">
              <FaCreditCard className="text-[var(--primary)] text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text)]">Payment Methods</h2>
              <p className="text-[var(--light-gray)]">Manage your saved payment cards</p>
            </div>
          </div>

          <div className="space-y-4">
            {visaCards.length === 0 ? (
              <div className="text-center py-8">
                <FaCreditCard className="text-[var(--light-gray)] text-4xl mx-auto mb-3" />
                <p className="text-[var(--light-gray)]">No payment methods saved</p>
                <button className="mt-3 text-[var(--button)] hover:text-[var(--button)]/80 font-medium">
                  Add Payment Method
                </button>
              </div>
            ) : (
              visaCards.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[var(--textbox)] rounded-xl border border-[var(--border)] hover:border-[var(--button)] transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-[var(--button)]/20 rounded-full flex items-center justify-center">
                      <FaCreditCard className="text-[var(--button)]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text)]">{p.card_brand} •••• {p.card_last4}</p>
                      <p className="text-sm text-[var(--light-gray)]">Expires 12/2025</p>
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch(deletePayment(p.id))}
                    className="flex items-center gap-2 px-3 py-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors duration-200"
                  >
                    <FaTrash /> Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        
        {/* Delete Account Section */}
        <section className="bg-[var(--bg)] border border-[var(--error)]/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-[var(--error)]/20 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="text-[var(--error)] text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text)]">Danger Zone</h2>
              <p className="text-[var(--light-gray)]">Permanent actions that cannot be undone</p>
            </div>
          </div>
          
          <div className="bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <FaUserSlash className="text-[var(--error)] mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-[var(--text)] mb-2">Delete Account</h3>
                <p className="text-[var(--light-gray)] text-sm mb-3">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button 
                  onClick={handleDeleteAccount} 
                  className="flex items-center gap-2 bg-[var(--error)] text-white px-6 py-3 rounded-lg hover:bg-[var(--error)]/90 transition-colors duration-200 font-medium"
                >
                  <FaUserSlash /> Delete My Account
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}