import { NavLink } from "react-router-dom";
import { AiOutlineDashboard } from "react-icons/ai";
import { FaUserTie, FaBoxOpen, FaUserShield } from "react-icons/fa";
import { FaTruckFast } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useEffect, useRef } from "react";

export default function SideBar({ isOpen, onClose }) {
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === "dark";
  const sidebarRef = useRef(null);

  const links = [
    { to: "/adminHome", icon: <AiOutlineDashboard />, label: "Dashboard" },
    { to: "/adminVendors", icon: <FaUserTie />, label: "Vendors" },
    {
      to: "/adminDelivery",
      icon: <FaTruckFast />,
      label: "Delivery Companies",
    },
    { to: "/adminOrders", icon: <FaBoxOpen />, label: "Orders" },
    { to: "/adminCms", icon: <FaUserShield />, label: "CMS" },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <aside
      ref={sidebarRef}
      className={`fixed top-0 left-0 h-full flex flex-col justify-between transition-all duration-300 ease-in-out z-50 shadow-lg
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${
          isDark
            ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
            : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
        } w-65`}
    >
      {/* logo */}
      <div>
        <div
          className={`mt-5 mr-8 px-6 py-6 flex items-center justify-center transition-colors`}
        >
          <img
            src={isDark ? "/LogoDark.png" : "/logo.png"}
            alt="Qwikko Logo"
            className="h-12 w-auto"
          />
        </div>

        {/* nav links */}
        <nav className="flex flex-col space-y-2 px-4 py-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `relative group flex items-center p-2 rounded transition-colors duration-300
              ${
                isActive
                  ? isDark
                    ? "bg-[var(--hover)] font-semibold"
                    : "bg-[var(--hover)] font-semibold"
                  : isDark
                  ? "hover:bg-[var(--hover)]"
                  : "hover:bg-[var(--hover)]"
              }`
              }
            >
              <span className="text-xl">{link.icon}</span>
              <span className="ml-3">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* logout */}
      <div className="px-4 pb-4 mt-auto">
        <NavLink
          to="/customer/login"
          onClick={() => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          }}
          className="relative group flex items-center p-2 rounded transition-colors duration-300 hover:bg-[var(--hover)]"
        >
          <FiLogOut className="text-xl" />
          <span
            className={`ml-3 
              ${isDark ? "text-[var(--text)]" : "text-[var(--text)]"}`}
          >
            Log out
          </span>
        </NavLink>
      </div>
    </aside>
  );
}
