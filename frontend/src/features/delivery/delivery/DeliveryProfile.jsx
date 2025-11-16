import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Plus,
  MapPin,
  Building,
  User,
  Mail,
  Phone,
} from "lucide-react";
import {
  fetchDeliveryProfile,
  fetchCoverageAreas,
  addCoverage,
} from "./Api/DeliveryAPI";
import { useSelector } from "react-redux";

/* ======== endpoint delete هنا ======== */
const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_API_BASE?.replace(/\/+$/, "")) ||
  "https://qwikko.onrender.com/api/delivery";

async function deleteCoverageCity(token, city) {
  const url = `${API_BASE}/coverage`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ areas: [city] }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = { _raw: await res.text() };
  }

  if (!res.ok) {
    const msg =
      data?.message || data?.error || `Failed to delete city: ${city}`;
    throw new Error(msg);
  }
  return data;
}
/* ===================================== */

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
  const [selectedAreas, setSelectedAreas] = useState([]); // اللي بالمودال
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const isDark = useSelector((state) => state.deliveryTheme.darkMode);

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

  // فتح المودال: خذ نسخة من اللي عندنا بالسيرفر
  const openModal = () => {
    setSelectedAreas(coverage);
    setShowModal(true);
  };

  // Cancel: رجّع مثل قبل
  const handleCancel = () => {
    setSelectedAreas(coverage);
    setShowModal(false);
  };

  // Save: شوف شو انضاف وشو انحذف
  const handleModalSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // اللي كان موجود فعلاً
    const before = new Set(coverage);
    // اللي المستخدم اختاره بالمودال
    const after = new Set(selectedAreas);

    // اللي لازم ينضاف
    const toAdd = [...after].filter((city) => !before.has(city));
    // اللي لازم ينحذف
    const toDelete = [...before].filter((city) => !after.has(city));

    if (toAdd.length === 0 && toDelete.length === 0) {
      // ما في تغيير
      setShowModal(false);
      return;
    }

    setSaving(true);
    try {
      // add
      if (toAdd.length > 0) {
        await addCoverage(token, toAdd);
      }

      // delete
      if (toDelete.length > 0) {
        // endpoint تبعك بحذف مدينة وحدة، فنمشي عليهم وحده وحده
        for (const city of toDelete) {
          await deleteCoverageCity(token, city);
        }
      }

      // رجّع البيانات الجديدة من السيرفر
      const updated = await fetchCoverageAreas(token);
      const norm = normalizeCoverage(updated);
      setCoverage(norm);
      setSelectedAreas(norm);
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save coverage changes", err);
      // لو بدك مبروزة error هون حط state
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "var(--button)" }}
          ></div>
          <p style={{ color: "var(--text)" }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "var(--error)", opacity: 0.2 }}
          >
            <span style={{ color: "var(--error)" }} className="text-2xl">
              !
            </span>
          </div>
          <p style={{ color: "var(--error)" }}>Error: {error}</p>
        </div>
      </div>
    );

  if (!company)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "var(--div)" }}
          >
            <span style={{ color: "var(--text)" }} className="text-2xl">
              🏢
            </span>
          </div>
          <p style={{ color: "var(--text)" }}>Company not found</p>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 pt-10">
          <div className="flex items-center gap-6 mb-6 md:mb-0">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, var(--button), #02966a)",
                }}
              >
                {company.company_name?.charAt(0)?.toUpperCase() || "D"}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4`}
                style={{
                  borderColor: "var(--bg)",
                  backgroundColor:
                    company.status === "approved" ? "#10B981" : "#F59E0B",
                }}
              ></div>
            </div>
            <div>
              <h1
                className="text-4xl font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, var(--text), var(--button))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {company.company_name}
              </h1>
              <p className="text-lg mt-2" style={{ color: "var(--text)" }}>
                {company.user_email}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      company.status === "approved" ? "#10B981" : "#F59E0B",
                  }}
                ></div>
                <span
                  className="text-sm capitalize"
                  style={{ color: "var(--text)" }}
                >
                  {company.status}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              navigate("/delivery/dashboard/edit", {
                state: { company, coverageAreas: coverage },
              })
            }
            className="text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-2"
            style={{ backgroundColor: "var(--button)" }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#015c40")}
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = "var(--button)")
            }
          >
            <Pencil size={18} />
            Edit Profile
          </button>
        </header>

        {/* Company & Coverage Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info Card */}
          <div className="lg:col-span-3">
            <div
              className="border-2 rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:shadow-3xl"
              style={{
                borderColor: "var(--border)",
                background: isDark
                  ? "linear-gradient(135deg, var(--div), var(--mid-dark))"
                  : "linear-gradient(135deg, #ffffff, #f7fafc)",
              }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Building
                    className="w-6 h-6"
                    style={{ color: "var(--button)" }}
                  />
                  Company Information
                </h2>
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: "var(--button)" }}
                ></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="group">
                    <p
                      className="text-sm mb-2 flex items-center gap-2"
                      style={{ color: "var(--text)" }}
                    >
                      <Building className="w-4 h-4" />
                      Company Name
                    </p>
                    <p
                      className="font-semibold text-lg transition-colors duration-200 group-hover:text-[var(--button)]"
                      style={{ color: "var(--text)" }}
                    >
                      {company.company_name}
                    </p>
                  </div>
                  <div className="group">
                    <p
                      className="text-sm mb-2 flex items-center gap-2"
                      style={{ color: "var(--text)" }}
                    >
                      <User className="w-4 h-4" />
                      Contact Person
                    </p>
                    <p
                      className="font-semibold text-lg transition-colors duration-200 group-hover:text-[var(--button)]"
                      style={{ color: "var(--text)" }}
                    >
                      {company.user_name || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="group">
                    <p
                      className="text-sm mb-2 flex items-center gap-2"
                      style={{ color: "var(--text)" }}
                    >
                      <Mail className="w-4 h-4" />
                      Email Address
                    </p>
                    <p
                      className="font-semibold text-lg transition-colors duration-200 group-hover:text-[var(--button)]"
                      style={{ color: "var(--text)" }}
                    >
                      {company.user_email}
                    </p>
                  </div>
                  <div className="group">
                    <p
                      className="text-sm mb-2 flex items-center gap-2"
                      style={{ color: "var(--text)" }}
                    >
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </p>
                    <p
                      className="font-semibold text-lg transition-colors duration-200 group-hover:text-[var(--button)]"
                      style={{ color: "var(--text)" }}
                    >
                      {company.user_phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="lg:col-span-1">
            <div
              className="border-2 rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:shadow-3xl"
              style={{
                borderColor: "var(--border)",
                background: "linear-gradient(135deg, var(--button), #02966a)",
              }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      company.status === "approved"
                        ? "bg-green-400"
                        : "bg-yellow-400"
                    }`}
                  >
                    <span className="text-white text-sm font-bold">
                      {company.status === "approved" ? "✓" : "!"}
                    </span>
                  </div>
                </div>
                <h2 className="text-xl font-bold mb-2 text-white">
                  Account Status
                </h2>
                <div className="text-2xl font-bold text-white mb-4 capitalize">
                  {company.status}
                </div>
                <p className="text-white/80 text-sm">
                  {company.status === "approved"
                    ? "Your account is fully active!"
                    : "Your account is pending approval"}
                </p>
                <div className="mt-6 bg-white/20 rounded-full px-4 py-2">
                  <p className="text-white text-xs font-medium">
                    {company.status === "approved"
                      ? " Ready to accept deliveries!"
                      : " Under review process"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coverage Areas */}
        <div className="mb-12">
          <div className="relative mb-8">
            <h2
              className="text-3xl font-bold inline-flex items-center gap-3"
              style={{
                background:
                  "linear-gradient(135deg, var(--text), var(--button))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              <MapPin className="w-8 h-8" style={{ color: "var(--teaxt)" }} />
              Coverage Areas
            </h2>
            <div
              className="absolute -bottom-2 left-0 w-24 h-1 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--button), transparent)",
              }}
            ></div>
          </div>

          <section
            className="border-2 rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:shadow-3xl"
            style={{
              borderColor: "var(--border)",
              background: isDark
                ? "linear-gradient(135deg, var(--div), var(--mid-dark))"
                : "linear-gradient(135deg, #ffffff, #f7fafc)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-xl font-semibold flex items-center gap-2"
                style={{ color: "var(--text)" }}
              >
                <MapPin
                  className="w-5 h-5"
                  style={{ color: "var(--button)" }}
                />
                Service Coverage
              </h3>

              <button
                onClick={openModal}
                className="text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                style={{ backgroundColor: "var(--button)" }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#015c40")
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = "var(--button)")
                }
              >
                <Plus size={18} />
                Manage Areas
              </button>
            </div>

            {coverage.length === 0 ? (
              <div className="text-center py-12">
                <MapPin
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                  style={{ color: "var(--light-gray)" }}
                />
                <p
                  className="text-lg mb-4"
                  style={{ color: "var(--light-gray)" }}
                >
                  No coverage areas added yet
                </p>
                <button
                  onClick={openModal}
                  className="text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
                  style={{ backgroundColor: "var(--button)" }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#015c40")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "var(--button)")
                  }
                >
                  <Plus size={18} />
                  Add Coverage Areas
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {coverage.map((area, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--bg)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin
                        className="w-4 h-4"
                        style={{ color: "var(--button)" }}
                      />
                      <span
                        className="font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        {area}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div
            className="w-full max-w-2xl mx-auto rounded-2xl p-6 shadow-2xl border-2"
            style={{
              borderColor: "var(--border)",
              background: isDark
                ? "linear-gradient(135deg, var(--div), var(--mid-dark))"
                : "linear-gradient(135deg, #ffffff, #f7fafc)",
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Select Coverage Areas"
          >
            <h2
              className="text-2xl font-bold mb-6 flex items-center gap-2"
              style={{ color: "var(--text)" }}
            >
              <MapPin className="w-6 h-6" style={{ color: "var(--button)" }} />
              Select Coverage Areas
            </h2>

            <div
              className="max-h-60 overflow-y-auto rounded-xl p-4 grid grid-cols-2 gap-3 mb-6 border"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--bg)",
              }}
            >
              {ALLOWED_AREAS.map((area) => (
                <label
                  key={area}
                  className="flex items-center gap-3 p-3 cursor-pointer rounded-xl border transition-all duration-200"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: selectedAreas.includes(area)
                      ? "var(--hover)"
                      : "transparent",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--hover)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      selectedAreas.includes(area)
                        ? "var(--hover)"
                        : "transparent")
                  }
                >
                  <input
                    type="checkbox"
                    value={area}
                    checked={selectedAreas.includes(area)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAreas((prev) => [...prev, area]);
                      } else {
                        setSelectedAreas((prev) =>
                          prev.filter((a) => a !== area)
                        );
                      }
                    }}
                    className="shrink-0 w-4 h-4"
                    style={{ accentColor: "var(--button)" }}
                  />
                  <span
                    className="font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    {area}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="font-semibold px-6 py-2 rounded-xl border-2 transition-all duration-300"
                style={{
                  backgroundColor: "var(--div)",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                }}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                onClick={handleModalSave}
                disabled={saving}
                className="text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                style={{ backgroundColor: "var(--button)" }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
