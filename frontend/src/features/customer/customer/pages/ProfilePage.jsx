import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProfile, updateProfile } from "../profileSlice";
import PaymentMethodsPanel from "../components/PaymentMethodsPanel";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { data: profile, loading, error } = useSelector((state) => state.profile);
  const theme = useSelector((state) => state.customerTheme.mode);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    const fetchLoyaltyPoints = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("http://localhost:3000/api/customers/loyalty", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setLoyaltyPoints(data.points?.points_balance || 0);
      } catch (err) {
        console.error("Error fetching loyalty points:", err);
      }
    };
    fetchLoyaltyPoints();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setSuccessMsg("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className={`min-h-screen bg-[var(--bg)] flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className={`text-[var(--text)]`}>Loading profile...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className={`min-h-screen bg-[var(--bg)] flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--error)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-[var(--error)] text-2xl">!</span>
          </div>
          <p className={`text-[var(--error)]`}>Error: {error}</p>
        </div>
      </div>
    );

  if (!profile)
    return (
      <div className={`min-h-screen bg-[var(--bg)] flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--div)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-[var(--text)] text-2xl">👤</span>
          </div>
          <p className={`text-[var(--text)]`}>Profile not found</p>
        </div>
      </div>
    );

  return (
    <div className={`min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 pt-10">
          <div className="flex items-center gap-6 mb-6 md:mb-0">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-[var(--button)] to-[#02966a] rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-2xl">
                {profile.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-[var(--bg)]"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--text)] to-[var(--button)] bg-clip-text text-transparent">
                {profile.name}
              </h1>
              <p className="text-[var(--light-gray)] text-lg mt-2">{profile.email}</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-[var(--light-gray)]">Active now</span>
              </div>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[var(--button)] hover:bg-[#015c40] text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          )}
        </header>

        {/* Profile & Loyalty Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Profile Card */}
          <div className="lg:col-span-3">
            <div className={`border-2 border-[var(--border)] rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:shadow-3xl ${
              theme === "dark" 
                ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)]" 
                : "bg-gradient-to-br from-white to-[var(--textbox)]"
            }`}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <svg className="w-6 h-6 text-[var(--button)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h2>
                <div className="w-3 h-3 bg-[var(--button)] rounded-full animate-pulse"></div>
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="group">
                      <p className="text-sm text-[var(--light-gray)] mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Full Name
                      </p>
                      <p className="font-semibold text-lg text-[var(--text)] group-hover:text-[var(--button)] transition-colors duration-200">
                        {profile.name}
                      </p>
                    </div>
                    <div className="group">
                      <p className="text-sm text-[var(--light-gray)] mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Phone Number
                      </p>
                      <p className="font-semibold text-lg text-[var(--text)] group-hover:text-[var(--button)] transition-colors duration-200">
                        {profile.phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="group">
                      <p className="text-sm text-[var(--light-gray)] mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Address
                      </p>
                      <p className="font-semibold text-lg text-[var(--text)] group-hover:text-[var(--button)] transition-colors duration-200">
                        {profile.address || "Not provided"}
                      </p>
                    </div>
                    <div className="group">
                      <p className="text-sm text-[var(--light-gray)] mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email Address
                      </p>
                      <p className="font-semibold text-lg text-[var(--text)] group-hover:text-[var(--button)] transition-colors duration-200">
                        {profile.email}
                      </p>
                      <p className="text-[var(--light-gray)] text-xs mt-1 opacity-80">Email cannot be edited</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {successMsg && (
                    <div className="bg-green-500/20 border border-green-500/50 text-green-300 p-4 rounded-xl text-center animate-fade-in">
                      <p className="font-medium">{successMsg}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-[var(--text)]">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className={`w-full border-2 border-[var(--border)] rounded-xl px-4 py-3 text-[1rem] placeholder-[var(--light-gray)] outline-none transition-all duration-200 focus:border-[var(--button)] focus:ring-2 focus:ring-[var(--button)]/20 ${
                          theme === "dark"
                            ? "bg-[var(--mid-dark)] text-[var(--text)]"
                            : "bg-white text-[var(--text)]"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-3 text-[var(--text)]">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className={`w-full border-2 border-[var(--border)] rounded-xl px-4 py-3 text-[1rem] placeholder-[var(--light-gray)] outline-none transition-all duration-200 focus:border-[var(--button)] focus:ring-2 focus:ring-[var(--button)]/20 ${
                          theme === "dark"
                            ? "bg-[var(--mid-dark)] text-[var(--text)]"
                            : "bg-white text-[var(--text)]"
                        }`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-3 text-[var(--text)]">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your complete address"
                        className={`w-full border-2 border-[var(--border)] rounded-xl px-4 py-3 text-[1rem] placeholder-[var(--light-gray)] outline-none transition-all duration-200 focus:border-[var(--button)] focus:ring-2 focus:ring-[var(--button)]/20 ${
                          theme === "dark"
                            ? "bg-[var(--mid-dark)] text-[var(--text)]"
                            : "bg-white text-[var(--text)]"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-[var(--div)] hover:bg-[var(--hover)] text-[var(--text)] font-semibold px-8 py-3 rounded-xl border-2 border-[var(--border)] transition-all duration-300 transform hover:scale-105"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[var(--button)] hover:bg-[#015c40] text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Loyalty Points Card */}
          <div className="lg:col-span-1">
            <div className={`border-2 border-[var(--border)] rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:shadow-3xl ${
              theme === "dark" 
                ? "bg-gradient-to-br from-[var(--button)] to-[#02966a]" 
                : "bg-gradient-to-br from-[var(--button)] to-[#02966a]"
            }`}>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-2 text-white">Loyalty Points</h2>
                <div className="text-4xl font-bold text-white mb-4 animate-pulse">
                  {loyaltyPoints}
                </div>
                <p className="text-white/80 text-sm">Keep earning rewards as you shop!</p>
                <div className="mt-6 bg-white/20 rounded-full px-4 py-2">
                  <p className="text-white text-xs font-medium">🎉 Every purchase earns you points!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-12">
          <div className="relative mb-8">
            <h2 className="text-3xl font-bold inline-flex items-center gap-3 bg-gradient-to-r from-[var(--text)] to-[var(--button)] bg-clip-text text-transparent">
              <svg className="w-8 h-8 text-[var(--button)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Payment Methods & Transactions
            </h2>
            <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-[var(--button)] to-transparent rounded-full"></div>
          </div>
          
          <section className={`rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:shadow-3xl ${
            theme === "dark" 
              ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)]" 
              : "bg-gradient-to-br from-white to-[var(--textbox)]"
          }`}>
            <PaymentMethodsPanel />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;