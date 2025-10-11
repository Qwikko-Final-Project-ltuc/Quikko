import React, { useEffect, useState } from "react";
import { fetchVendorProfile, updateVendorProfile } from "../VendorAPI2";

const VendorProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

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
        alert("✅ Profile updated successfully!");
        setProfile(updated);
        setEditing(false);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("⚠️ Something went wrong while updating the profile.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!profile) return <div className="p-6">No profile found.</div>;

  // ألوان الداكن واللايت
  const pageBg = isDarkMode ? "#242625" : "#f0f2f1";
  const cardBg = isDarkMode ? "#666666" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#242625";
  const inputBg = isDarkMode ? "#666666" : "#ffffff";
  const borderColor = isDarkMode ? "#444" : "#d1d5db";

  return (
    <div className="min-h-screen w-full p-6" style={{ backgroundColor: pageBg }}>
      <h1 className="text-2xl font-bold mb-6 text-center" style={{ color: textColor }}>
        Vendor Profile
      </h1>

      <div
        className="rounded-2xl p-6 shadow-md max-w-4xl mx-auto space-y-6 w-full"
        style={{ backgroundColor: cardBg }}
      >
        {!editing ? (
          <>
            {/* صورة واسم المتجر */}
            <div className="flex flex-col items-center space-y-4 text-center">
              <img
                src={profile.store_logo || "/placeholder.png"}
                alt="Store"
                className="w-32 h-32 rounded-full object-cover border"
              />
              <h2 className="text-xl font-semibold" style={{ color: textColor }}>
                {profile.store_name}
              </h2>
            </div>

            {/* Address */}
            <div className="flex flex-col items-center text-center space-y-1">
              <label className="font-medium" style={{ color: textColor }}>
                Address
              </label>
              <p style={{ color: textColor }}>{profile.address}</p>
            </div>

            {/* Description */}
            <div className="flex flex-col items-center text-center space-y-1">
              <label className="font-medium" style={{ color: textColor }}>
                Description
              </label>
              <p style={{ color: textColor }}>{profile.description}</p>
            </div>

            <div className="flex justify-center">
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
                className="px-6 py-2 rounded-lg transition"
                style={{ backgroundColor: "#307A59", color: "#ffffff" }}
              >
                Edit Profile
              </button>
            </div>
          </>
        ) : (
          <>
            {/* فورم التعديل */}
            <div className="flex flex-col items-center space-y-4 text-center">
              <img
                src={tempProfile.store_logo || "/placeholder.png"}
                alt="Store"
                className="w-32 h-32 rounded-full object-cover border"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-center"
                style={{ backgroundColor: inputBg, color: textColor }}
              />
            </div>

            <div className="flex flex-col gap-4">
              {/* Store Name */}
              <div className="flex flex-col p-4 rounded-lg" style={{ backgroundColor: inputBg }}>
                <label className="font-medium mb-1 text-center" style={{ color: textColor }}>
                  Store Name
                </label>
                <input
                  type="text"
                  name="store_name"
                  value={tempProfile.store_name}
                  onChange={handleChange}
                  className="p-2 rounded-lg border focus:ring-2 outline-none text-center"
                  style={{ backgroundColor: inputBg, color: textColor, borderColor: borderColor }}
                />
              </div>

              {/* Address */}
              <div className="flex flex-col p-4 rounded-lg" style={{ backgroundColor: inputBg }}>
                <label className="font-medium mb-1 text-center" style={{ color: textColor }}>
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={tempProfile.address}
                  onChange={handleChange}
                  className="p-2 rounded-lg border focus:ring-2 outline-none text-center"
                  style={{ backgroundColor: inputBg, color: textColor, borderColor: borderColor }}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col p-4 rounded-lg" style={{ backgroundColor: inputBg }}>
                <label className="font-medium mb-1 text-center" style={{ color: textColor }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={tempProfile.description}
                  onChange={handleChange}
                  rows={4}
                  className="p-2 rounded-lg border focus:ring-2 outline-none text-center"
                  style={{ backgroundColor: inputBg, color: textColor, borderColor: borderColor }}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-2 justify-center">
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg transition"
                style={{ backgroundColor: "#307A59", color: "#ffffff" }}
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-6 py-2 rounded-lg transition"
                style={{ backgroundColor: "#d1d5db", color: "#242625" }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorProfilePage;
