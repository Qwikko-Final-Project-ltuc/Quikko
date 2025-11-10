import React, { useEffect, useState } from "react";
import { fetchVendorProfile, updateVendorProfile } from "../VendorAPI2";
import Footer from "../Footer";

const VendorProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [toast, setToast] = useState(null); // ✅ Toast notification

  useEffect(() => {
    const loadProfile = async () => {
      const data = await fetchVendorProfile();
      if (data && data.success) {
        setProfile(data.data);
      } else {
        console.error("Failed to load profile");
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setTempProfile((prev) => ({ ...prev, store_logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    const updatedData = {
      store_name: tempProfile.store_name,
      store_logo: tempProfile.store_logo,
      description: tempProfile.description,
      address: tempProfile.address,
    };
    try {
      const updated = await updateVendorProfile(updatedData);
      if (updated) {
        showToast("Profile updated successfully!", "success");
        setProfile(updated);
        setEditing(false);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      showToast("Something went wrong while updating the profile.", "error");
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
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) return <div className="p-6">No profile found.</div>;

  const pageBg = isDarkMode ? "#242625" : "#ffffff";
  const cardBg = isDarkMode ? "#313131" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#242625";
  const inputBg = isDarkMode ? "#313131" : "#ffffff";
  const borderColor = isDarkMode ? "#444" : "#d1d5db";

  return (
    <div
      className="flex flex-col min-h-screen w-full relative"
      style={{ backgroundColor: pageBg, color: textColor }}
    >
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto mt-18 mb-24">
          <h1 className="text-2xl font-bold mb-8 text-center sm:text-left" style={{ color: "#307A59" }}>
            Vendor Profile
          </h1>

          <div
            className="rounded-2xl p-6 sm:p-10 md:p-12 shadow-md w-full"
            style={{ backgroundColor: cardBg }}
          >
            {!editing ? (
              <>
                <div className="flex flex-col items-center space-y-6 text-center">
                  {profile.store_logo ? (
                    <img
                      src={profile.store_logo}
                      alt="Store"
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-extrabold"
                      style={{
                        backgroundColor: isDarkMode ? "#5f6e68ff" : "#d1d5db",
                        color: isDarkMode ? "#ffffff" : "#242625",
                      }}
                    >
                      {profile.store_name
                        ? profile.store_name
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((word) => word[0].toUpperCase())
                            .join("")
                        : "??"}
                    </div>
                  )}

                  <h2 className="text-lg sm:text-xl font-semibold" style={{ color: textColor }}>
                    {profile.store_name}
                  </h2>
                </div>

                <div className="flex flex-col items-center text-center space-y-1 mt-4">
                  <label className="font-medium" style={{ color: textColor }}>Address</label>
                  <p className="break-words" style={{ color: textColor }}>{profile.address}</p>
                </div>

                <div className="flex flex-col items-center text-center space-y-1 mt-4">
                  <label className="font-medium" style={{ color: textColor }}>Description</label>
                  <p className="break-words" style={{ color: textColor }}>{profile.description}</p>
                </div>

                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => {
                      setTempProfile({
                        store_name: profile.store_name,
                        address: profile.address,
                        description: profile.description,
                        store_logo: profile.store_logo,
                      });
                      setEditing(true);
                    }}
                    className="px-6 py-2 rounded-lg transition text-sm sm:text-base"
                    style={{ backgroundColor: "#307A59", color: "#ffffff" }}
                  >
                    Edit Profile
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center space-y-4 text-center">
                  <img
                    src={tempProfile.store_logo || "/placeholder.png"}
                    alt="Store"
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover"
                  />
                  <input
                    type="text"
                    name="store_logo"
                    value={tempProfile.store_logo || ""}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                    className="p-2 rounded-lg border text-center w-full sm:w-64"
                    style={{
                      backgroundColor: inputBg,
                      color: textColor,
                      borderColor: borderColor,
                    }}
                  />
                </div>

                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex flex-col p-3 sm:p-4 rounded-lg" style={{ backgroundColor: inputBg }}>
                    <label className="font-medium mb-1 text-center" style={{ color: textColor }}>Store Name</label>
                    <input
                      type="text"
                      name="store_name"
                      value={tempProfile.store_name}
                      onChange={handleChange}
                      className="p-2 rounded-lg border focus:ring-2 outline-none text-center text-sm sm:text-base"
                      style={{ backgroundColor: inputBg, color: textColor, borderColor: borderColor }}
                    />
                  </div>

                  <div className="flex flex-col p-3 sm:p-4 rounded-lg" style={{ backgroundColor: inputBg }}>
                    <label className="font-medium mb-1 text-center" style={{ color: textColor }}>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={tempProfile.address}
                      onChange={handleChange}
                      className="p-2 rounded-lg border focus:ring-2 outline-none text-center text-sm sm:text-base"
                      style={{ backgroundColor: inputBg, color: textColor, borderColor: borderColor }}
                    />
                  </div>

                  <div className="flex flex-col p-3 sm:p-4 rounded-lg" style={{ backgroundColor: inputBg }}>
                    <label className="font-medium mb-1 text-center" style={{ color: textColor }}>Description</label>
                    <textarea
                      name="description"
                      value={tempProfile.description}
                      onChange={handleChange}
                      rows={4}
                      className="p-2 rounded-lg border focus:ring-2 outline-none text-center text-sm sm:text-base"
                      style={{ backgroundColor: inputBg, color: textColor, borderColor: borderColor }}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 rounded-lg transition text-sm sm:text-base w-full sm:w-auto"
                    style={{ backgroundColor: "#307A59", color: "#ffffff" }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-6 py-2 rounded-lg transition text-sm sm:text-base w-full sm:w-auto"
                    style={{ backgroundColor: "#d1d5db", color: "#242625" }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-[var(--footer-bg)]">
        <Footer />
      </footer>

      {/* Toast Notification */}
      {toast && (
       <div
        className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-white ${
          toast.type === "success" ? "bg-green-500" : "bg-red-500"
        }`}
      >
          <span className="text-lg">{toast.type === "success" ? "✅" : "⚠️"}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default VendorProfilePage;
