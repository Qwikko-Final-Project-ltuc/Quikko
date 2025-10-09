import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaSun, FaMoon, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toggleTheme } from "./deliveryThemeSlice";
import { fetchDeliveryProfile } from "./DeliveryAPI";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const darkMode = useSelector((state) => state.deliveryTheme.darkMode);

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load delivery profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Unauthorized");

        const profileData = await fetchDeliveryProfile(token);
        setCompany(profileData.company);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleEditProfile = () => {
    navigate("/delivery/dashboard/edit", { state: { company } });
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (error)
    return (
      <p style={{ textAlign: "center", color: "red", marginTop: "2rem" }}>
        ❌ {error}
      </p>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "1.5rem",
        backgroundColor: darkMode ? "#242625" : "#f0f2f1",
        color: darkMode ? "#ffffff" : "#242625",
      }}
    >
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h1 style={{ fontSize: "1.75rem", fontWeight: "600" }}>Settings</h1>
          <button
            onClick={() => dispatch(toggleTheme())}
            style={{
              padding: "0.5rem",
              borderRadius: "0.5rem",
              backgroundColor: darkMode ? "#666666" : "#ffffff",
              color: darkMode ? "#ffffff" : "#242625",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            {darkMode ? <FaMoon /> : <FaSun />}
          </button>
        </header>

        {/* Profile Section */}
        <section
          style={{
            backgroundColor: darkMode ? "#666666" : "#ffffff",
            borderRadius: "1rem",
            padding: "1.25rem",
            boxShadow: darkMode
              ? "0 2px 8px rgba(0,0,0,0.7)"
              : "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: darkMode ? "#ffffff" : "#242625",
                }}
              >
                {company?.company_name || "N/A"}
              </h2>
              <p style={{ color: darkMode ? "#ffffff" : "#242625" }}>
                {company?.user_email || "N/A"}
              </p>
            </div>

            <button
              onClick={handleEditProfile}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "9999px",
                border: `1px solid ${darkMode ? "#ffffff" : "#242625"}`,
                backgroundColor: darkMode ? "#242625" : "#ffffff",
                color: darkMode ? "#ffffff" : "#242625",
                cursor: "pointer",
              }}
            >
              <FaEdit /> Edit Profile
            </button>
          </div>

        </section>
      </div>
    </div>
  );
}
