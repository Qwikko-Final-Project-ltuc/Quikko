import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  FaSun, FaMoon, FaCreditCard, FaTrash, FaEdit, FaUserSlash 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { fetchProfile, deleteProfile } from "../profileSlice";
import { fetchPayments, deletePayment } from "../paymentSlice";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // profileSlice
  const { data: profile, loading: profileLoading } = useSelector(state => state.profile);

  // paymentSlice
  const { payments, status: paymentsStatus } = useSelector(state => state.payment);

  const [dark, setDark] = useState(false);

  // fetch profile + payments on mount
  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchPayments());
  }, [dispatch]);

  // toggle dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // handle edit profile
  const handleEditProfile = () => {
    navigate("/customer/profile", { state: { profile } });
  };

  // handle delete account
  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await dispatch(deleteProfile()).unwrap();
        alert("Account deleted!");
        navigate("/customer/home"); 
      } catch (err) {
        alert("Failed to delete account: " + err.message);
      }
    }
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

  if (profileLoading) return <p>Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <button onClick={() => setDark(d => !d)} className="p-2 bg-gray-200 dark:bg-gray-800 rounded">
            {dark ? <FaMoon /> : <FaSun />}
          </button>
        </header>

        {/* Profile Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{profile?.name}</h2>
              <p>{profile?.email}</p>
            </div>
            <button onClick={handleEditProfile} className="flex items-center gap-2 px-3 py-1 border rounded-full">
              <FaEdit /> Edit Profile
            </button>
          </div>
        </section>

        {/* Cards Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm mb-6 space-y-3">
          {visaCards.length === 0 && <p>No Visa cards found.</p>}
          {visaCards.map((p, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <FaCreditCard />
                <span>{p.card_brand} •••• {p.card_last4}</span>
              </div>
              <button
                onClick={() => dispatch(deletePayment(p.id))}
                className="text-red-600 flex items-center gap-1"
              >
                <FaTrash /> Remove
              </button>
            </div>
          ))}
        </section>

        {/* Delete Account Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm text-center">
          <h2 className="text-lg font-semibold mb-3">Danger Zone</h2>
          <button 
            onClick={handleDeleteAccount} 
            className="flex items-center justify-center gap-2 mx-auto bg-red-600 text-white px-5 py-2 rounded"
          >
            <FaUserSlash /> Delete My Account
          </button>
        </section>
      </div>
    </div>
  );
}
