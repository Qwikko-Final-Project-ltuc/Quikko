import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchDeliveryProfile,
  updateDeliveryProfile,
  fetchCoverageAreas,
  addCoverage,
} from "./Api/DeliveryAPI";
import { useSelector } from "react-redux";

// ===================== API محلي: حذف مدينة واحدة =====================
const API_BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_API_BASE?.replace(/\/+$/, "")) ||
  "http://localhost:3000/api/delivery";

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

// ===================== Component =====================
export default function EditProfile() {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [deletingCity, setDeletingCity] = useState(null);

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

  const uniq = (arr) => Array.from(new Set(arr || []));

  // =============== Toast System ===============
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    text: "",
  });
  const toastTimerRef = useRef(null);

  const showToast = (type, text) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, text });
    toastTimerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, show: false }));
    }, 3000);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // ============================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const fromStateCompany = location.state?.company;
        const fromStateCoverage = location.state?.coverageAreas;

        if (fromStateCompany) {
          const initData = {
            company_name: fromStateCompany.company_name || "",
            coverage_areas: uniq(fromStateCoverage || []),
            user_name: fromStateCompany.user_name || "",
            user_phone: fromStateCompany.user_phone || "",
          };
          setFormData(initData);
          setOriginalData(initData);
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) throw new Error("Unauthorized");

        const prof = await fetchDeliveryProfile(token);
        const c = prof?.company || prof || {};

        let coverageAreas = location.state?.coverageAreas;
        if (!Array.isArray(coverageAreas) || coverageAreas.length === 0) {
          coverageAreas = await fetchCoverageAreas(token);
        }

        const initData = {
          company_name: c.company_name || "",
          coverage_areas: uniq(coverageAreas),
          user_name: c.user_name || "",
          user_phone: c.user_phone || "",
        };

        setFormData(initData);
        setOriginalData(initData);
      } catch (err) {
        showToast("error", err.message || "Failed to load profile");
      }
    };

    loadProfile();
  }, [location.state?.company, location.state?.coverageAreas]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getChangedFields = () => {
    const changed = {};
    if (!formData) return changed;

    Object.keys(formData).forEach((key) => {
      if (key === "coverage_areas") {
        const now = uniq(formData[key]).sort();
        const was = uniq(originalData[key] || []).sort();
        if (JSON.stringify(now) !== JSON.stringify(was)) {
          changed[key] = now;
        }
      } else if (formData[key] !== originalData[key]) {
        changed[key] = formData[key];
      }
    });

    return changed;
  };

  const handleDeleteCity = async (city) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");
      setDeletingCity(city);

      // حذف تفاؤلي
      const prev = formData.coverage_areas;
      const next = prev.filter((a) => a !== city);
      setFormData((p) => ({ ...p, coverage_areas: next }));

      await deleteCoverageCity(token, city);
      showToast("success", `Deleted ${city} successfully`);
    } catch (err) {
      setFormData((p) => {
        const set = new Set(p.coverage_areas);
        set.add(city);
        return { ...p, coverage_areas: Array.from(set) };
      });
      showToast("error", err.message || "Delete failed");
    } finally {
      setDeletingCity(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true); // نظل لودينغ لحدّ ما ننتقل
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const allChanges = getChangedFields();
      const { coverage_areas, ...profileChanges } = allChanges;
      const tasks = [];

      if (Array.isArray(coverage_areas)) {
        tasks.push(addCoverage(token, Array.from(new Set(coverage_areas))));
      }
      if (Object.keys(profileChanges).length > 0) {
        tasks.push(updateDeliveryProfile(token, profileChanges));
      }
      if (tasks.length === 0) {
        showToast("info", "No changes detected.");
        setLoading(false); // ما في تنقّل، رجّع الحالة
        return;
      }

      await Promise.all(tasks);

      // Toast سريع (اختياري)
      showToast("success", "Profile updated successfully!");

      // ننتظر شوي (قصيرة) عشان المستخدم يشوف التوست، بعدها ننتقل مباشرة
      await new Promise((r) => setTimeout(r, 600));

      // أهم سطرين: انتقال نهائي بدون فلاش، وباستبدال الصفحة
      navigate("/delivery/dashboard/getprofile", { replace: true });
      return; // ما ننزل لـ setLoading(false) أبداً
    } catch (err) {
      showToast("error", err.message || "Failed to update profile");
      setLoading(false); 
    }
  };

  if (!formData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
      >
        <div
          className="w-16 h-16 border-4 border-solid rounded-full animate-spin"
          style={{
            borderColor: "var(--primary)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {toast.show && (
        <div
          className={`
      fixed top-20 left-1/2 -translate-x-1/2
      px-6 py-3 rounded-xl shadow-lg text-white font-semibold
      z-[9999] transition-all duration-500
      flex items-center justify-center gap-2   // 👈 هذول أهم شي
      ${toast.show ? "opacity-100" : "opacity-0 -translate-y-4"}
    `}
          style={{
            minWidth: "280px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            backgroundColor:
              toast.type === "success"
                ? "var(--success)"
                : toast.type === "error"
                ? "var(--error)"
                : "var(--warning)",
          }}
          role="status"
          aria-live="polite"
        >
          <span>
            {toast.type === "success"
              ? "✔️"
              : toast.type === "error"
              ? "❌"
              : "ℹ️"}
          </span>
          <span>{toast.text}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 mt-6 sm:mt-8">
        <h2
          className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6"
          style={{ color: "var(--text)" }}
        >
          Update My Profile
        </h2>
      </div>

      {/* الفورم — نفس عرض/بادينغ الديسكتوب (sm فأعلى)، موبايل أخف */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6"
        style={{
          color: "var(--text)",
          backgroundColor: isDarkMode ? "#313131" : "#f5f6f5",
          // border: `1px solid var(--border)`,
          // borderRadius: "1.5rem",
          boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
        }}
      >
        {/* Personal Info */}
        <div
          className="p-4 sm:p-6 rounded-2xl"
          style={{
            backgroundColor: isDarkMode ? "#313131" : "#ffffff",
            border: `1px solid var(--border)`,
          }}
        >
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
            Personal Info
          </h3>

          {/* User Name */}
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-sm sm:text-base">
              User Name
            </label>
            <input
              type="text"
              name="user_name"
              value={formData.user_name}
              placeholder={originalData.user_name || "User name"}
              onChange={handleChange}
              className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg focus:outline-none transition-all duration-150"
              style={{
                backgroundColor: "transparent",
                color: isDarkMode ? "#ffffff" : "#000000",
                border: `1px solid ${isDarkMode ? "#ffffff" : "#000000"}`,
                boxShadow: "none",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(2,106,75,0.15)")
              }
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block font-semibold mb-1 text-sm sm:text-base">
              Phone Number
            </label>
            <input
              type="text"
              name="user_phone"
              value={formData.user_phone}
              placeholder={originalData.user_phone || "Phone number"}
              onChange={handleChange}
              className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg focus:outline-none transition-all duration-150"
              style={{
                backgroundColor: "transparent",
                color: isDarkMode ? "#ffffff" : "#000000",
                border: `1px solid ${isDarkMode ? "#ffffff" : "#000000"}`,
                boxShadow: "none",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(2,106,75,0.15)")
              }
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </div>
        </div>

        {/* Company Info */}
        <div
          className="p-4 sm:p-6 rounded-2xl"
          style={{
            backgroundColor: isDarkMode ? "#313131" : "#ffffff",
            border: `1px solid var(--border)`,
          }}
        >
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
            Company Info
          </h3>

          {/* Company Name */}
          <div className="mb-4">
            <label className="block font-semibold mb-1 text-sm sm:text-base">
              Company Name
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              placeholder={originalData.company_name || "Company name"}
              onChange={handleChange}
              className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-lg focus:outline-none transition-all duration-150"
              style={{
                backgroundColor: "transparent",
                color: isDarkMode ? "#ffffff" : "#000000",
                border: `1px solid ${isDarkMode ? "#ffffff" : "#000000"}`,
                boxShadow: "none",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(2,106,75,0.15)")
              }
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </div>

          {/* Coverage Areas */}
          <label className="block font-semibold mb-2 text-sm sm:text-base">
            Coverage Areas
          </label>
          <select
            className="w-full p-2 sm:p-3 text-sm sm:text-base rounded-md mb-4 focus:outline-none transition-all duration-150"
            style={{
              backgroundColor: "transparent",
              color: isDarkMode ? "#ffffff" : "#000000",
              border: `1px solid ${isDarkMode ? "#ffffff" : "#000000"}`,
              boxShadow: "none",
              appearance: "none",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(2,106,75,0.15)")
            }
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            onChange={(e) => {
              const area = e.target.value;
              if (area && !formData.coverage_areas.includes(area)) {
                setFormData((prev) => ({
                  ...prev,
                  coverage_areas: Array.from(
                    new Set([...prev.coverage_areas, area])
                  ),
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
              <option key={area} value={area} style={{ color: "#000" }}>
                {area}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2">
            {formData.coverage_areas.map((area) => (
              <span
                key={area}
                className="flex items-center px-2.5 py-1 rounded-2xl text-xs sm:text-sm"
                style={{
                  color: isDarkMode ? "#ffffff" : "#292e2c",
                  border: `1px solid var(--border)`,
                }}
              >
                {area}
                <button
                  type="button"
                  onClick={() => handleDeleteCity(area)}
                  disabled={deletingCity === area}
                  className="ml-2 font-bold"
                  style={{
                    color: isDarkMode ? "#ffffff" : "#292e2c",
                    opacity: deletingCity === area ? 0.6 : 1,
                    cursor: deletingCity === area ? "not-allowed" : "pointer",
                  }}
                  title={deletingCity === area ? "Deleting..." : "Remove"}
                >
                  {deletingCity === area ? "…" : "×"}
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Buttons — عمودي بالموبايل، أفقي من sm+ (بدون تغيير ديسكتوب) */}
        <div className="md:col-span-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-2 sm:mt-4">
          <button
            type="button"
            onClick={() => navigate("/delivery/dashboard/getprofile")}
            className="rounded-lg text-sm font-semibold w-full sm:w-auto"
            style={{
              padding: "10px 14px",
              backgroundColor: "var(--bg)",
              color: isDarkMode ? "#ffffff" : "#292e2c",
              border: `1px solid var(--border)`,
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg text-sm font-semibold w-full sm:w-auto"
            style={{
              padding: "10px 14px",
              backgroundColor: "var(--button)",
              color: "#ffffff",
              border: `1px solid var(--border)`,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </>
  );
}
