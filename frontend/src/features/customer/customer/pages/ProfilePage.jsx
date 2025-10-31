import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProfile, updateProfile } from "../profileSlice";
import PaymentMethodsPanel from "../components/PaymentMethodsPanel";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { data: profile, loading, error } = useSelector((state) => state.profile);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0); // <-- state لنقاط الولاء

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

  // جلب نقاط الولاء من الباكيند
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

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading profile...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
  if (!profile) return <p className="text-center mt-10 text-gray-500">Profile not found</p>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Profile</h1>

      {!isEditing ? (
        <div className="bg-white shadow rounded-lg p-6 space-y-2">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone}</p>
          <p><strong>Address:</strong> {profile.address}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded"
          >
            Edit
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
          {successMsg && <p className="text-green-600 font-semibold">{successMsg}</p>}
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {/* Email (read-only) */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <p className="w-full border rounded px-3 py-2 bg-gray-100">{profile.email}</p>
            <p className="text-red-500 text-sm mt-1">Email cannot be edited</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {/* Address */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* قسم نقاط الولاء */}
      <div className="mt-6 p-4 border rounded shadow text-center">
        <span className="font-bold text-lg">Loyalty Points: </span>
        <span className="text-xl flex items-center justify-center gap-1">
          {loyaltyPoints} <span>⭐</span>
        </span>
      </div>

      <div>
        <PaymentMethodsPanel />
      </div>
    </div>
  );
};

export default ProfilePage;
