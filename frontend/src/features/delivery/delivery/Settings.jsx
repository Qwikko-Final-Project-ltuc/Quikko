import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FaSun,
  FaMoon,
  FaEdit,
  FaExclamationTriangle,
  FaUserSlash,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toggleTheme } from "./deliveryThemeSlice";
import { fetchDeliveryProfile } from "./Api/DeliveryAPI";

/**
 * Responsive SettingsPage (مُحسّن للموبايل/التاب)
 * - حافظنا على شكل الديسكتوب 1:1 (نفس البادينغ/المارجن والإستايل)
 * - ضفنا فقط كلاسات ريسبونسيف تأثر تحت sm، ومن sm وفوق كل شيء يرجع كما هو
 */

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const darkMode = useSelector((state) => state.deliveryTheme.darkMode);

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load delivery profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Unauthorized");

        const profileData = await fetchDeliveryProfile(token);
        setCompany(profileData.company);
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleEditProfile = () => {
    navigate("/delivery/dashboard/edit", { state: { company } });
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/customers/profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete account");

      // حذف التوكن والرجوع للّوج إن
      localStorage.removeItem("token");
      navigate("/delivery/login", { replace: true });
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading)
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{
          backgroundColor: "var(--bg)",
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: "64px",
            height: "64px",
            backgroundColor: "var(--div)",
          }}
        ></div>
      </div>
    );

  if (error)
    return (
      <p
        className="text-center mt-8"
        style={{
          color: "var(--error)",
        }}
      >
        ❌ {error}
      </p>
    );

  return (
    <div
      className="min-h-screen"
      style={{
        padding: "1.5rem", // نحافظ على نفس البادينغ للديسكتوب
        backgroundColor: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "900px" }}>
        {/* Header */}
        <header
          className="
            mb-6
            flex flex-col gap-3
            sm:flex-row sm:items-center sm:justify-between
          "
          style={
            {
              // على الديسكتوب يضل نفس الإحساس
            }
          }
        >
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 600 }}>Settings</h1>
            <p
              className="text-sm"
              style={{ marginTop: 6, color: "var(--light-gray)" }}
            >
              Manage your delivery account and preferences
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="rounded-lg border inline-flex items-center justify-center"
              style={{
                padding: "0.5rem",
                backgroundColor: "var(--bg)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {darkMode ? <FaMoon /> : <FaSun />}
            </button>
          </div>
        </header>

        {/* Profile Section */}
        <section
          className="rounded-2xl shadow-sm mb-6 border"
          style={{
            backgroundColor: darkMode ? "#313131" : "#f5f6f5",
            padding: "1.25rem", // نفس القيم
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="
              flex flex-col gap-4
              sm:flex-row sm:items-center sm:justify-between
            "
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: "var(--button)",
                }}
              >
                <FaUser style={{ color: "#fff", fontSize: 20 }} />
              </div>
              <div>
                <h2
                  className="font-semibold"
                  style={{ fontSize: "1.25rem", color: "var(--text)" }}
                >
                  {company?.company_name || "N/A"}
                </h2>
                <p style={{ color: "var(--light-gray)" }}>
                  {company?.user_email || "N/A"}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--light-gray)" }}
                >
                  Member since 2024
                </p>
              </div>
            </div>

            <button
              onClick={handleEditProfile}
              className="
                inline-flex items-center justify-center gap-2
                rounded-full font-semibold
                w-full sm:w-auto
                transition hover:brightness-110 active:scale-95
              "
              style={{
                padding: "0.5rem 1rem",
                border: `1px solid var(--border)`,
                backgroundColor: "var(--button)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <FaEdit /> Edit Profile
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section
          className="rounded-2xl mb-6"
          style={{
            backgroundColor: "var(--bg)",
            border: `1px solid rgba(255,0,0,0.08)`,
            padding: 18,
            boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-start gap-3 sm:gap-4 mb-3">
            <div
              className="rounded-xl flex items-center justify-center"
              style={{
                width: 48,
                height: 48,
                backgroundColor: "rgba(255,0,0,0.08)",
              }}
            >
              <FaExclamationTriangle
                style={{ color: "var(--error)", fontSize: 18 }}
              />
            </div>
            <div>
              <h3 className="font-bold" style={{ fontSize: 18 }}>
                Danger Zone
              </h3>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--light-gray)", fontSize: 13 }}
              >
                Permanent actions that cannot be undone
              </p>
            </div>
          </div>

          <div
            className="rounded-xl"
            style={{
              backgroundColor: "rgba(255,0,0,0.04)",
              border: `1px solid rgba(255,0,0,0.12)`,
              padding: 14,
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="min-w-9 flex items-start justify-center">
                <FaUserSlash style={{ color: "var(--error)", marginTop: 4 }} />
              </div>

              <div className="flex-1">
                <h4 className="font-bold" style={{ fontSize: 16 }}>
                  Delete Account
                </h4>
                <p
                  className="mt-2 mb-3 text-sm"
                  style={{ color: "var(--light-gray)", fontSize: 13 }}
                >
                  Once you delete your account, there is no going back. All your
                  data will be permanently removed. Please be certain before
                  continuing.
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-lg font-bold
                      w-full sm:w-auto
                      transition hover:brightness-110 active:scale-95
                    "
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "var(--error)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <FaUserSlash /> Delete My Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modal التأكيد على الحذف */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="w-full max-w-[520px] rounded-xl text-center shadow-2xl"
            style={{
              backgroundColor: "var(--bg)",
              color: "var(--text)",
              padding: "1.25rem",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              className="font-bold mb-3 flex items-center justify-center gap-2"
              style={{ fontSize: "1.25rem" }}
            >
              <FaExclamationTriangle style={{ color: "var(--error)" }} />
              Confirm Deletion
            </h3>
            <p className="mb-5" style={{ color: "var(--light-gray)" }}>
              Are you sure you want to <strong>delete your account?</strong>{" "}
              This action cannot be undone.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="rounded-md font-bold w-full sm:w-auto"
                style={{
                  padding: "0.75rem 0.9rem",
                  backgroundColor: "var(--error)",
                  color: "#fff",
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.75 : 1,
                  border: "none",
                }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>

              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-md font-bold w-full sm:w-auto border"
                style={{
                  padding: "0.75rem 0.9rem",
                  backgroundColor: "var(--bg)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
