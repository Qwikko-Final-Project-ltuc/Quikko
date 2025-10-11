import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchDeliveryProfile,
  updateDeliveryProfile,
  fetchCoverageAreas,
} from "./DeliveryAPI";
import { useSelector } from "react-redux";

export default function EditProfile() {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [originalData, setOriginalData] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  const ALLOWED_AREAS = [
    "Amman",
    "Zarqa",
    "Irbid",
    "Ajloun",
    "Jerash",
    "Mafraq",
    "Madaba",
    "Karak",
    "Tafilah",
    "Ma'an",
    "Aqaba",
  ];

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await fetchDeliveryProfile(token);

        let coverageAreas = location.state?.coverageAreas;
        if (!coverageAreas || coverageAreas.length === 0) {
          coverageAreas = await fetchCoverageAreas(token);
        }

        const initData = {
          company_name: data.company_name || "",
          coverage_areas: coverageAreas || [],
          user_name: data.user_name || "",
          user_phone: data.user_phone || "",
        };

        setFormData(initData);
        setOriginalData(initData);
      } catch (err) {
        setMessage("❌ " + err.message);
      }
    };

    loadProfile();
  }, [location.state?.coverageAreas]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getChangedFields = () => {
    const changed = {};
    Object.keys(formData).forEach((key) => {
      if (key === "coverage_areas") {
        if (
          JSON.stringify(formData[key].sort()) !==
          JSON.stringify((originalData[key] || []).sort())
        ) {
          changed[key] = formData[key];
        }
      } else if (formData[key] !== originalData[key]) {
        changed[key] = formData[key];
      }
    });
    return changed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const payload = getChangedFields();

      if (Object.keys(payload).length === 0) {
        setMessage("ℹ️ No changes detected.");
        setLoading(false);
        return;
      }

      await updateDeliveryProfile(token, payload);
      setMessage("✅ Profile updated successfully!");
      navigate("/delivery/dashboard/getprofile");
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      className="max-w-5xl mx-auto mt-10 p-6 rounded-3xl shadow-2xl "
      style={{
        backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
        color: isDarkMode ? "#ffffff" : "#242625",
      }}
    >
      <h2
        className="text-3xl font-extrabold mb-6 text-center "
        style={{
          color: isDarkMode ? "#ffffff" : "#242625",
        }}
      >
        Edit Delivery Profile
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        style={{
          color: isDarkMode ? "#ffffff" : "#242625",
        }}
      >
        {/* Personal Info Card */}
        <div
          className="p-6 rounded-2xl shadow-xl"
          style={{
            color: isDarkMode ? "#ffffff" : "#242625",
            backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
          }}
        >
          <h3
            className="text-2xl font-bold mb-4"
            style={{
              color: isDarkMode ? "#ffffff" : "#242625",
            }}
          >
            Personal Info
          </h3>
          <div className="mb-4">
            <label className="block font-semibold mb-1">User Name</label>
            <input
              type="text"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg focus:ring-2 "
              style={{
                backgroundColor: isDarkMode ? "#f9f9f9" : "#f9f9f9",
                color: isDarkMode ? "#242625" : "#242625",
              }}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Phone Number</label>
            <input
              type="text"
              name="user_phone"
              value={formData.user_phone}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg "
              style={{
                backgroundColor: isDarkMode ? "#f9f9f9" : "#f9f9f9",
                color: isDarkMode ? "#242625" : "#242625",
              }}
            />
          </div>
        </div>

        {/* Company Info Card */}
        <div
          className="p-6 rounded-2xl shadow-xl "
          style={{
            color: isDarkMode ? "#ffffff" : "#242625",
            backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
          }}
        >
          <h3
            className="text-2xl font-bold mb-4"
            style={{
              color: isDarkMode ? "#ffffff" : "#242625",
            }}
          >
            Company Info
          </h3>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Company Name</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg "
              style={{
                backgroundColor: isDarkMode ? "#f9f9f9" : "#f9f9f9",
                color: isDarkMode ? "#242625" : "#242625",
              }}
            />
          </div>

          {/* Coverage Areas */}
          <label className="block font-semibold mb-2">Coverage Areas</label>
          <select
            className="w-full border p-2 rounded mb-4 "
            style={{
              backgroundColor: isDarkMode ? "#f9f9f9" : "#f9f9f9",
              color: isDarkMode ? "#242625" : "#242625",
            }}
            onChange={(e) => {
              const area = e.target.value;
              if (!formData.coverage_areas.includes(area)) {
                setFormData((prev) => ({
                  ...prev,
                  coverage_areas: [...prev.coverage_areas, area],
                }));
              }
              e.target.value = "";
            }}
            value=""
          >
            <option value="" disabled>
              Select an area
            </option>
            {ALLOWED_AREAS.filter(
              (a) => !formData.coverage_areas.includes(a)
            ).map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2">
            {formData.coverage_areas.map((area) => (
              <span
                key={area}
                className="flex items-center  px-3 py-1 rounded-full "
                style={{
                  backgroundColor: isDarkMode ? "#f9f9f9" : "#f9f9f9",
                  color: isDarkMode ? "#242625" : "#242625",
                }}
              >
                {area}
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      coverage_areas: prev.coverage_areas.filter(
                        (a) => a !== area
                      ),
                    }))
                  }
                  className="ml-2 text-red-600 font-bold hover:text-red-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="md:col-span-2 flex gap-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-  p-3 rounded-2xl font-semibold "
            style={{
              backgroundColor: isDarkMode ? "#307A59" : "#307A59", // من button في الثيمين
              color: "#ffffff",
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/delivery/dashboard/getprofile")}
            className="flex-1 p-3 rounded-2xl font-semibold "
            style={{
              backgroundColor: isDarkMode ? "#307A59" : "#307A59", // من button في الثيمين
              color: "#ffffff",
            }}
          >
            Cancel
          </button>
        </div>
      </form>

      {message && (
        <p className="mt-4 text-center font-medium text-gray-800 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
