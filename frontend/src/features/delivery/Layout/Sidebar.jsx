import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaUser,
  FaClipboardList,
  FaCog,
  FaChartPie,
  FaComments,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../auth/authSlice";

export default function Sidebar({ isOpen, toggleSidebar, logoSrc }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sidebarRef = useRef(null);
  const isDarkMode = useSelector((s) => s.deliveryTheme.darkMode);
  const location = useLocation();

  const effectiveLogo = logoSrc || (isDarkMode ? "/darklogo.png" : "/logo.png");

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    setShowLogoutModal(false);
    navigate("/delivery/login");
  };

  /* ===== Close on outside click + Esc ===== */
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        toggleSidebar();
      }
    };
    const handleEsc = (e) => e.key === "Escape" && toggleSidebar();
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, toggleSidebar]);

  const navLinks = [
    {
      to: "home",
      icon: <FaChartPie className="text-lg" />,
      label: "Dashboard",
    },
    {
      to: "getProfile",
      icon: <FaUser className="text-lg" />,
      label: "Profile",
    },
    {
      to: "orders",
      icon: <FaClipboardList className="text-lg" />,
      label: "Orders",
    },
    { to: "chat", icon: <FaComments className="text-lg" />, label: "Chats" },
    { to: "settings", icon: <FaCog className="text-lg" />, label: "Settings" },
     { to: "DeliveryRequestedOrders", icon: <FaCog className="text-lg" />, label: "Delivery Requested Orders" },
    
  ];

  // فعال لو المسار يبدأ به (لصفحات فرعية)
  const isActiveLink = (to) => {
    const full = `${to}`.replace(/\/+/, "/");
    const pathname = location.pathname.replace(/^\//, "");
    return pathname.startsWith(full);
  };

  // يغلق عند اختيار عنصر
  const handleItemClick = () => isOpen && toggleSidebar();

  return (
    <>
      {/* مافي أوفرلاي نهائيًا */}

      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-screen w-64
          z-[9999]                 /* أعلى من أي Navbar */
          transform transition-transform duration-200
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          backgroundColor: "var(--bg)", // ✅ المطلوب
          color: "var(--text)",
          boxShadow: isOpen
            ? "0 0 0 1px var(--border), 0 8px 24px rgba(0,0,0,0.15)"
            : "none",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar"
      >
        {/* عمود كامل: الناف ياخذ المساحة، واللوج آوت مثبت تحت */}
        <div className="h-full flex flex-col">
          {/* Header بسيط (بدون تغيير لون مستقل) */}
          <div
            className="flex items-center gap-4 px-4 py-4 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <img
              src={effectiveLogo}
              alt="Logo"
              className="h-8 w-auto select-none"
              draggable="false"
            />
          </div>

          {/* Navigation */}
          <nav
            className="flex-1 px-4 mt-2 overflow-y-auto"
            onClick={handleItemClick}
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((item) => {
                const active = isActiveLink(item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        "flex items-center gap-2 p-2 font-semibold rounded transition-colors",
                        "hover:bg-[var(--hover)]",
                        isActive || active
                          ? "!bg-[var(--hover)]"
                          : "bg-transparent",
                      ].join(" ")
                    }
                    style={{ color: "var(--text)" }}
                    end={item.to === "home"}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* Footer: Log out مثبت أسفل السايدبار */}
          <div className="px-4 pb-4 pt-2 mt-auto">
            <button
              onClick={() => {
                setShowLogoutModal(true);
                handleItemClick();
              }}
              className="group flex items-center gap-2 p-2 rounded w-full text-left font-semibold border transition-colors duration-150"
              style={{
                color: "var(--text)",
                borderColor: "var(--border)",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--error)";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "var(--error)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <FiLogOut className="text-lg" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* مودال تسجيل الخروج */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-[10000]">
          <div
            className="p-6 rounded-xl shadow-lg max-w-sm w-full text-center"
            style={{
              backgroundColor: "var(--bg)",
              color: "var(--text)",
              border: `1px solid var(--border)`,
            }}
          >
            <h2 className="text-xl font-semibold mb-4">
              Are you sure you want to log out?
            </h2>

            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  dispatch(logout());
                  setShowLogoutModal(false);
                  navigate("/delivery/login");
                }}
                className="w-full px-4 py-2 rounded-lg font-semibold transition border hover:bg-[var(--error)] hover:text-white hover:border-[var(--error)]"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--error)",
                  borderColor: "var(--error)",
                }}
              >
                Yes, Logout
              </button>

              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-full px-4 py-2 rounded-lg font-semibold transition border hover:bg-[var(--hover)]"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
