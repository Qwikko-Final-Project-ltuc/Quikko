import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProfile, updateProfile } from "../profileSlice";
import PaymentMethodsPanel from "../components/PaymentMethodsPanel";
import { Sparkles, Zap, Star, MapPin, Phone, Mail, User, Edit3, CreditCard, ChevronDown } from "lucide-react";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { data: profile, loading, error } = useSelector((state) => state.profile);
  const theme = useSelector((state) => state.customerTheme.mode);

  const cities = [
    "Amman", "Zarqa", "Irbid", "Aqaba", "Mafraq", "Jerash", 
    "Madaba", "Karak", "Tafilah", "Ma'an", "Ajloun",
  ];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const handleCitySelect = (city) => {
    setFormData((prev) => ({ ...prev, address: city }));
    setIsDropdownOpen(false);
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

  // Loading State - Same as stores page
  if (loading) {

    return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'} relative overflow-hidden`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--button)]/2 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-[var(--primary)]/2 rounded-full blur-xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl flex items-center justify-center mx-auto mb-4 animate-spin">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl blur-sm opacity-15 animate-ping"></div>
          </div>
          <p className="text-[var(--text)] text-lg font-medium">
            Loading Profile...
          </p>
        </div>
      </div>
    </div>
  );

  }

  

  // Error State - Same as stores page
  if (error) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'} flex items-center justify-center relative overflow-hidden`}>
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-[var(--error)]/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-[var(--button)]/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="text-center max-w-md relative z-10">
          <div className="w-28 h-28 bg-[var(--error)]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-all duration-300">
            <Zap className="w-14 h-14 text-[var(--error)]" />
          </div>
          <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-[var(--error)] to-red-600 bg-clip-text text-transparent">
            Oops! Error Loading
          </h3>
          <p className="text-[var(--text)]/80 text-lg mb-8 leading-relaxed">{error}</p>
          <button 
            onClick={() => dispatch(fetchProfile())}
            className="relative bg-gradient-to-r from-[var(--button)] to-[var(--primary)] text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 font-bold shadow-lg transform hover:scale-105 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <span className="relative z-10 flex items-center gap-3">
              <Sparkles size={20} />
              Try Again
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'} flex items-center justify-center relative overflow-hidden`}>
        {/* Animated Background */}
        

        <div className="text-center max-w-md relative z-10">
          <div className="w-28 h-28 bg-[var(--div)]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <User className="w-14 h-14 text-[var(--text)]" />
          </div>
          <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-[var(--text)] to-[var(--light-gray)] bg-clip-text text-transparent">
            Profile Not Found
          </h3>
          <p className="text-[var(--text)]/80 text-lg mb-8 leading-relaxed">
            We couldn't find your profile information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'} transition-all duration-500 relative overflow-hidden`}>
      
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--button)]/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[var(--primary)]/5 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--success)]/3 rounded-full blur-3xl animate-pulse-slow"></div>
                
      </div>

      {/* Main Content - بدون هيدر */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="h-8"></div>
        
        {/* Profile Content - يبدأ مباشرة */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          
          {/* Profile Header Card - أول سكشن مباشرة */}
          <div className={`rounded-3xl p-6 mb-6 shadow-2xl border-2 ${
            theme === "dark" 
              ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--border)]" 
              : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
          } relative overflow-hidden group`}>
            
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
                    {profile.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-full blur-xl opacity-0 group-hover/avatar:opacity-30 transition-opacity duration-300"></div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[var(--bg)] z-20"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--text)] to-[var(--button)] bg-clip-text text-transparent mb-2">
                    {profile.name}
                  </h1>
                  <p className={`text-base ${theme === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'} mb-3`}>
                    {profile.email}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className={`text-sm ${theme === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                      Active now
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="relative bg-gradient-to-r from-[var(--button)] to-[var(--primary)] text-white px-6 py-3 rounded-2xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 shadow-lg transform hover:scale-105 font-bold group/btn overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                  <Edit3 size={18} className="relative z-10" />
                  <span className="relative z-10">Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Profile & Loyalty Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Profile Information Card */}
            <div className="lg:col-span-3">
              <div className={`rounded-3xl p-6 shadow-2xl border-2 ${
                theme === "dark" 
                  ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--border)]" 
                  : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
              } relative overflow-hidden group`}>
                
                {/* Card Header */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-[var(--text)]">
                    <User className="w-6 h-6 ${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'}`}" />
                    Personal Information
                  </h2>
                  <div className="w-3 h-3 bg-[var(--button)] rounded-full animate-pulse"></div>
                </div>

                {!isEditing ? (
                  /* Display Mode */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="space-y-6">
                      <div className="group transform hover:-translate-y-1 transition-all duration-300">
                        <p className="text-sm text-[var(--light-gray)] mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Full Name
                        </p>
                        <p className="font-semibold text-lg text-[var(--text)] group-hover:text-[var(--button)] transition-colors duration-200">
                          {profile.name}
                        </p>
                      </div>
                      <div className="group transform hover:-translate-y-1 transition-all duration-300">
                        <p className="text-sm text-[var(--light-gray)] mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone Number
                        </p>
                        <p className="font-semibold text-lg text-[var(--text)] group-hover:text-[var(--button)] transition-colors duration-200">
                          {profile.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="group transform hover:-translate-y-1 transition-all duration-300">
                        <p className="text-sm text-[var(--light-gray)] mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Address
                        </p>
                        <p className="font-semibold text-lg text-[var(--text)] group-hover:text-[var(--button)] transition-colors duration-200">
                          {profile.address || "Not provided"}
                        </p>
                      </div>
                      <div className="group transform hover:-translate-y-1 transition-all duration-300">
                        <p className="text-sm text-[var(--light-gray)] mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Address
                        </p>
                        <p className="font-semibold text-lg text-[var(--text)] group-hover:text-[var(--button)] transition-colors duration-200">
                          {profile.email}
                        </p>
                        <p className="text-[var(--light-gray)] text-xs mt-1 opacity-80">
                          Email cannot be edited
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Edit Mode */
                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    {successMsg && (
                      <div className="bg-green-500/20 border border-green-500/50 text-green-300 p-4 rounded-xl text-center animate-fade-in">
                        <p className="font-medium">{successMsg}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
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

                      <div className="group">
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

                      <div className="md:col-span-2 group">
                        <label className="block text-sm font-semibold mb-3 text-[var(--text)]">
                          City
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`w-full border-2 border-[var(--border)] rounded-xl px-4 py-3 text-[1rem] text-left outline-none transition-all duration-200 focus:border-[var(--button)] focus:ring-2 focus:ring-[var(--button)]/20 flex items-center justify-between ${
                              theme === "dark"
                                ? "bg-[var(--mid-dark)] text-[var(--text)]"
                                : "bg-white text-[var(--text)]"
                            } ${!formData.address ? 'text-[var(--light-gray)]' : ''}`}
                          >
                            {formData.address || "Select your city"}
                            <ChevronDown 
                              size={20} 
                              className={`text-[var(--light-gray)] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            />
                          </button>
                          
                          {isDropdownOpen && (
                            <div className={`absolute top-full left-0 right-0 mt-2 border-2 border-[var(--border)] rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto ${
                              theme === "dark"
                                ? "bg-[var(--mid-dark)]"
                                : "bg-white"
                            }`}>
                              {cities.map((city) => (
                                <button
                                  key={city}
                                  type="button"
                                  onClick={() => handleCitySelect(city)}
                                  className={`w-full px-4 py-3 text-left transition-all duration-200 hover:bg-[var(--button)] hover:text-white ${
                                    theme === "dark"
                                      ? "text-[var(--text)] hover:bg-[var(--button)]"
                                      : "text-gray-700 hover:bg-[var(--button)]"
                                  } ${formData.address === city ? 'bg-[var(--button)] text-white' : ''}`}
                                >
                                  {city}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-[var(--border)]">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="bg-[var(--div)] hover:bg-[var(--hover)] text-[var(--text)] font-semibold px-6 py-3 rounded-xl border-2 border-[var(--border)] transition-all duration-300 transform hover:scale-105"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="relative bg-gradient-to-r from-[var(--button)] to-[var(--primary)] text-white px-6 py-3 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold group/btn overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                        <span className="relative z-10">Save Changes</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Loyalty Points Card */}
            <div className="lg:col-span-1">
              <div className={`rounded-3xl p-6 shadow-2xl ${
                theme === "dark" 
                  ? "bg-gradient-to-br from-[var(--button)] to-[#02966a]" 
                  : "bg-gradient-to-br from-[var(--button)] to-[#02966a]"
              } relative overflow-hidden group transform hover:-translate-y-2 transition-all duration-300`}>
                
                <div className="text-center relative z-10">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-all duration-300">
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-lg font-bold mb-2 text-white">Loyalty Points</h2>
                  <div className="text-3xl font-bold text-white mb-4 animate-pulse">
                    {loyaltyPoints}
                  </div>
                  <p className="text-white/80 text-sm mb-4">
                    Keep earning rewards as you shop!
                  </p>
                  <div className="bg-white/20 rounded-full px-3 py-2 transform group-hover:scale-105 transition-all duration-300">
                    <p className="text-white text-xs font-medium">
                      🎉 Every purchase earns you points!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="mb-8">
            <div className="relative mb-6">
              <h2 className="text-2xl font-bold inline-flex items-center gap-3 bg-gradient-to-r from-[var(--text)] to-[var(--button)] bg-clip-text text-transparent">
                <CreditCard className="w-7 h-7 text-[var(--button)]" />
                Payment Methods & Transactions
              </h2>
              <div className="absolute -bottom-2 left-0 w-20 h-1 bg-gradient-to-r from-[var(--button)] to-transparent rounded-full"></div>
            </div>
            
            <section className={`rounded-3xl p-6 shadow-2xl border-2 ${
              theme === "dark" 
                ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--border)]" 
                : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
            } relative overflow-hidden group`}>
              <PaymentMethodsPanel />
            </section>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { 
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
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        @keyframes gradient-x-slow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

      `}</style>
    </div>
  );
};

export default ProfilePage;