import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus } from "lucide-react";
import {
  fetchDeliveryProfile,
  fetchCoverageAreas,
  addCoverage,
} from "./Api/DeliveryAPI";
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

const normalizeCoverage = (data) =>
  Array.isArray(data)
    ? data
        .map((item) => (typeof item === "string" ? item : item?.city))
        .filter(Boolean)
    : [];

export default function DeliveryProfile() {
  const [company, setCompany] = useState(null);
  const [coverage, setCoverage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

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
        setCoverage(normalizeCoverage(coverageData));
      } catch (err) {
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSaveCoverage = async () => {
    try {
      const token = localStorage.getItem("token");
      const uniqueCities = Array.from(new Set(selectedAreas));
      if (uniqueCities.length === 0) return;

      setSaving(true);
      await addCoverage(token, uniqueCities);

      const updatedCoverage = await fetchCoverageAreas(token);
      setCoverage(normalizeCoverage(updatedCoverage));

      setSelectedAreas([]);
      setShowModal(false);
    } catch (err) {
      console.error("Failed to add coverage", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <p
        className="no-anim text-center mt-10"
        style={{ color: "var(--error)" }}
      >
        {error}
      </p>
    );

  if (!company)
    return (
      <p className="no-anim text-center mt-10" style={{ color: "var(--text)" }}>
        No company data.
      </p>
    );

  const title = "My Profile";

  return (
    <div className={`${isDarkMode ? "dark" : ""} no-anim`}>
      <div
        className="min-h-screen pb-[calc(env(safe-area-inset-bottom,0px)+12px)]"
        style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
      >
        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 flex items-center justify-between gap-4">
          <h1
            className="mt-10 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            {title}
          </h1>

          <button
            onClick={() =>
              navigate("/delivery/dashboard/edit", {
                state: { company, coverageAreas: coverage },
              })
            }
            className="mt-10 flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg font-medium shrink-0"
            style={{ backgroundColor: "var(--button)", color: "#fff" }}
          >
            <Pencil size={18} />
            <span className="text-sm sm:text-base">Edit Profile</span>
          </button>
        </div>

        {/* Cards Wrapper */}
        <div
          className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-6"
          // outer background kept transparent; inner cards handle contrast
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Delivery Info */}
            <section className="h-full flex flex-col">
              <div className="mb-3">
                <span
                  className="text-xs sm:text-sm font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "var(--bg)",
                    color: isDarkMode ? "#ffffff" : "#292e2c",
                    border: `1px solid var(--border)`,
                  }}
                >
                  Delivery Info
                </span>
              </div>

              <div
                className="p-4 sm:p-6 rounded-2xl flex-1"
                style={{
                  backgroundColor: isDarkMode ? "#313131" : "#f5f6f5",
                  color: "var(--text)",
                  border: `1px solid var(--border)`,
                }}
              >
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold">Company Name: </span>
                    <span>{company.company_name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Status:</span>
                    <span
                      className="px-2 py-1 rounded-full text-xs sm:text-sm font-semibold"
                      style={{
                        backgroundColor:
                          company.status === "approved"
                            ? "var(--success)"
                            : "var(--warning)",
                        color:
                          company.status === "approved" ? "#0b3d1b" : "#3d3000",
                      }}
                    >
                      {company.status}
                    </span>
                  </div>

                  <div>
                    <div className="mb-2 font-semibold">Coverage Areas:</div>

                    {coverage.length === 0 ? (
                      <button
                        onClick={() => {
                          setSelectedAreas(coverage);
                          setShowModal(true);
                        }}
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm"
                        style={{
                          backgroundColor: "var(--button)",
                          color: "#ffffff",
                        }}
                      >
                        <Plus size={18} /> Add Coverage Areas
                      </button>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {coverage.map((area, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-2xl text-sm"
                            style={{
                              backgroundColor: "var(--bg)",
                              color: isDarkMode ? "#ffffff" : "#292e2c",
                              border: `1px solid var(--border)`,
                            }}
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Personal Info */}
            <section className="h-full flex flex-col">
              <div className="mb-3">
                <span
                  className="text-xs sm:text-sm font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "var(--bg)",
                    color: isDarkMode ? "#ffffff" : "#292e2c",
                    border: `1px solid var(--border)`,
                  }}
                >
                  Personal Info
                </span>
              </div>

              <div
                className="p-4 sm:p-6 rounded-2xl flex-1"
                style={{
                  backgroundColor: isDarkMode ? "#313131" : "#f5f6f5",
                  color: "var(--text)",
                  border: `1px solid var(--border)`,
                }}
              >
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold">Name: </span>
                    <span>{company.user_name || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Email: </span>
                    <span>{company.user_email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Phone: </span>
                    <span>{company.user_phone || "N/A"}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
            <div
              className="w-full sm:w-[480px] mx-0 sm:mx-auto rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl"
              style={{
                backgroundColor: "var(--bg)",
                color: "var(--text)",
                border: `1px solid var(--border)`,
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Select Coverage Areas"
            >
              <h2 className="text-xl sm:text-2xl font-bold mb-4">
                Select Coverage Areas
              </h2>

              <div
                className="max-h-[55vh] sm:max-h-60 overflow-y-auto rounded-xl p-3 sm:p-4 grid grid-cols-2 gap-2"
                style={{ backgroundColor: "var(--bg)" }}
              >
                {ALLOWED_AREAS.map((area) => (
                  <label
                    key={area}
                    className="flex items-center gap-2 mb-1 cursor-pointer rounded px-2 py-2 border"
                    style={{
                      borderRadius: "12px",
                      borderColor: "var(--border)",
                    }}
                  >
                    <input
                      type="checkbox"
                      value={area}
                      checked={selectedAreas.includes(area)}
                      onChange={(e) => {
                        if (e.target.checked)
                          setSelectedAreas((prev) => [...prev, area]);
                        else
                          setSelectedAreas((prev) =>
                            prev.filter((a) => a !== area)
                          );
                      }}
                      className="shrink-0"
                      style={{ accentColor: "var(--button)" }}
                    />
                    <span className="text-sm sm:text-base">{area}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: "var(--hover)",
                    color: isDarkMode ? "#ffffff" : "#292e2c",
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveCoverage}
                  disabled={saving || selectedAreas.length === 0}
                  className="px-4 py-2 rounded-full text-white shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "var(--button)",
                    color: "#ffffff",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  }}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
