import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus } from "lucide-react";
import {
  fetchDeliveryProfile,
  fetchCoverageAreas,
  addCoverage,
} from "./DeliveryAPI";
import { useSelector } from "react-redux";

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

export default function DeliveryProfile() {
  const [company, setCompany] = useState(null);
  const [coverage, setCoverage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Unauthorized");

        const [profile, coverageData] = await Promise.all([
          fetchDeliveryProfile(token),
          fetchCoverageAreas(token),
        ]);

        setCompany(profile.company);
        setCoverage(coverageData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSaveCoverage = async () => {
    try {
      const token = localStorage.getItem("token");
      await addCoverage(token, selectedAreas);

      const updatedCoverage = await fetchCoverageAreas(token);
      setCoverage(updatedCoverage);

      setSelectedAreas([]);
      setShowModal(false);
    } catch (err) {
      console.error("Failed to add coverage", err);
    }
  };
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (error)
    return <p className="text-center mt-10 text-red-600">❌ {error}</p>;

  const avatarText = company.company_name
    ? company.company_name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join("")
    : "??";

  return (
    <div
      className="max-w-6xl mx-auto mt-10 p-6 rounded-3xl shadow-2xl  animate-fadeIn"
      style={{
        backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
        color: isDarkMode ? "#ffffff" : "#242625",
      }}
    >
      {/* Avatar + Title */}
      <div
        className="flex items-center justify-center mb-10 gap-4"
        style={{
          backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
          color: isDarkMode ? "#ffffff" : "#242625",
        }}
      >
        <div
          className="w-20 h-20 bg-purple-600 text-white flex items-center justify-center rounded-full text-3xl font-extrabold shadow-lg transform transition-transform hover:scale-105"
          style={{
            backgroundColor: isDarkMode ? "#5f6e68ff" : "#bfddcfff", // الخلفية
            color: isDarkMode ? "#ffffff" : "#242625", // النصوص
          }}
        >
          {avatarText}
        </div>
        <h2
          className="text-4xl font-extrabold "
          style={{
            color: isDarkMode ? "#ffffff" : "#242625", // النصوص
          }}
        >
          Delivery Profile
        </h2>
      </div>

      {/* Edit Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => navigate("/delivery/dashboard/edit")}
          className="flex items-center gap-2 text-white px-5 py-2 rounded-full font-medium shadow-lg  hover:scale-105 transition-transform"
          style={{
            color: isDarkMode ? "#ffffff" : "#242625",
            button: isDarkMode ? "#5f6e68ff" : "#307A59",
          }}
        >
          <Pencil size={18} /> Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Delivery Info Card */}
        <div
          className="p-6 rounded-2xl shadow-xl "
          style={{
            color: isDarkMode ? "#ffffff" : "#242625",
            div: isDarkMode ? "#666666" : "#ffffff",
          }}
        >
          <h3
            className="text-2xl font-bold mb-4 text-gray-800"
            style={{
              color: isDarkMode ? "#ffffff" : "#242625",
            }}
          >
            Delivery Info
          </h3>
          <div className="mb-3">
            <span
              className="font-semibold"
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              Company Name:
            </span>{" "}
            <span
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              {company.company_name}
            </span>
          </div>
          <div className="mb-3">
            <span
              className="font-semibold "
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              Status:
            </span>{" "}
            <span
              className="px-2 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: isDarkMode
                  ? company.status === "approved"
                    ? "#5f6e68ff" // approved بالدارك
                    : "#5f5a3fff" // غير approved بالدارك
                  : company.status === "approved"
                  ? "#bfddcfff" // approved باللايت
                  : "#fff4b3ff", // غير approved باللايت
                color: isDarkMode ? "#ffffff" : "#242625", // النصوص
              }}
            >
              {company.status}
            </span>
          </div>

          {/* Coverage Areas */}
          <div className="mb-2">
            <span
              className="font-semibold text-gray-600"
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              Coverage Areas:
            </span>
          </div>
          {coverage.length === 0 ? (
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 flex items-center gap-2  px-4 py-2 rounded-full font-medium shadow-lg  hover:scale-105 transition-transform"
              style={{
                backgroundColor: isDarkMode ? "#307A59" : "#307A59",
                color: isDarkMode ? "#ffffff" : "#ffffff",
              }}
            >
              <Plus
                size={18}
                style={{
                  color: isDarkMode ? "#ffffff" : "#ffffff",
                }}
              />{" "}
              Add Coverage Areas
            </button>
          ) : (
            <ul className="grid grid-cols-2 gap-2 text-gray-700 mt-2">
              {coverage.map((area, idx) => (
                <li
                  key={idx}
                  className="px-3 py-1 rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
                  style={{
                    backgroundColor: isDarkMode ? "#5f6e68ff" : "#f0f2f1", // الخلفية
                    color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                  }}
                >
                  {area}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Personal Info Card */}
        <div
          className="p-6 rounded-2xl shadow-xl "
          style={{
            color: isDarkMode ? "#ffffff" : "#242625",
            div: isDarkMode ? "#666666" : "#ffffff",
          }}
        >
          <h3
            className="text-2xl font-bold mb-4 "
            style={{
              color: isDarkMode ? "#ffffff" : "#242625",
            }}
          >
            Personal Info
          </h3>
          <div className="mb-3">
            <span
              className="font-semibold "
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              Name:
            </span>{" "}
            <span
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              {company.user_name || "N/A"}
            </span>
          </div>
          <div className="mb-3">
            <span
              className="font-semibold "
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              Email:
            </span>{" "}
            <span
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              {company.user_email || "N/A"}
            </span>
          </div>
          <div className="mb-3">
            <span
              className="font-semibold "
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              Phone:
            </span>{" "}
            <span
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              {company.user_phone || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center animate-fadeIn">
          <div
            className=" p-6 rounded-2xl shadow-2xl w-96 transform transition-transform hover:scale-105"
            style={{
              backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
              color: isDarkMode ? "#ffffff" : "#242625",
            }}
          >
            <h2
              className="text-2xl font-bold mb-4"
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              Select Coverage Areas
            </h2>

            <div
              className="max-h-60 overflow-y-auto border rounded-xl p-4 transition-all"
              style={{
                backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
                borderColor: isDarkMode ? "#f9f9f9" : "#f0f2f1",
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              {ALLOWED_AREAS.map((area) => (
                <label
                  key={area}
                  className="flex items-center mb-2 cursor-pointer rounded px-2 py-1 transition-all"
                  style={{
                    color: isDarkMode ? "#ffffff" : "#242625",
                    transition: "background-color 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode
                      ? "rgba(48, 122, 89, 0.25)"
                      : "rgba(48, 122, 89, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <input
                    type="checkbox"
                    value={area}
                    checked={selectedAreas.includes(area)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAreas([...selectedAreas, area]);
                      } else {
                        setSelectedAreas(
                          selectedAreas.filter((a) => a !== area)
                        );
                      }
                    }}
                    className="mr-2 accent-[#307A59]"
                  />
                  {area}
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-full transition-colors"
                style={{
                  backgroundColor: isDarkMode ? "#666666" : "#f0f2f1",
                  color: isDarkMode ? "#ffffff" : "#242625",
                  border: "1px solid rgba(0,0,0,0.1)",
                  transition: "background-color 0.3s, transform 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = isDarkMode
                    ? "#555555"
                    : "#e0e2e0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = isDarkMode
                    ? "#666666"
                    : "#f0f2f1")
                }
              >
                Cancel
              </button>

              <button
                onClick={handleSaveCoverage}
                className="px-4 py-2 rounded-full text-white shadow-lg transition-transform"
                style={{
                  backgroundColor: "#307A59",
                  color: "#ffffff",
                  transform: "scale(1)",
                  boxShadow: isDarkMode
                    ? "0 4px 10px rgba(0,0,0,0.4)"
                    : "0 4px 10px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s, background-color 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#276548";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#307A59";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
