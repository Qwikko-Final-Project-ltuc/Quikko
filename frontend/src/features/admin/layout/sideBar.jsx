import { NavLink } from "react-router-dom";
import { AiOutlineDashboard } from "react-icons/ai";
import { FaUserTie } from "react-icons/fa";
import { FaTruckFast } from "react-icons/fa6";
import { FaBoxOpen } from "react-icons/fa";
import { FaUserShield } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useSelector } from "react-redux";

export default function SideBar({ isOpen }) {
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === "dark";

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

  return (
    <aside
      className={`flex flex-col transition-all duration-300 shadow-md h-screen
        ${isOpen ? "w-64" : "w-16"} 
        ${isDark ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"}`}
    >
      <div
        className={`px-6 py-6 flex items-center justify-center border-b transition-colors
        ${isDark ? "border-gray-700" : "border-gray-200"}`}
      >
        {isOpen ? (
          <img
            src={isDark ? "/LogoDark.png" : "/logo.png"}
            alt="Qwikko Logo"
            className="h-13 w-416"
          />
        ) : (
          <div className="w-10 flex items-center justify-center text-lg font-bold">
            Q
          </div>
        )}
      </div>

      <nav className="flex flex-col space-y-2 px-4 py-4 flex-grow">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `relative group flex items-center p-2 rounded transition-colors duration-300
              ${
                isActive
                  ? isDark
                    ? "bg-gray-700 font-semibold"
                    : "bg-gray-200 font-semibold"
                  : isDark
                  ? "hover:bg-gray-800"
                  : "hover:bg-gray-300"
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            {isOpen && <span className="ml-3">{link.label}</span>}

            {!isOpen && (
              <span
                className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50
                  text-xs rounded px-2 py-1 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
                  transition-all duration-150 whitespace-nowrap
                  ${isDark ? "bg-gray-100 text-gray-900" : "bg-gray-900 text-gray-100"}`}
              >
                {link.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pb-4">
        <NavLink
          to="/adminLogin"
          title={!isOpen ? "Log out" : undefined}
          className={`relative group flex items-center p-2 rounded transition-colors duration-300
            ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-300"}`}
        >
          <FiLogOut className="text-xl" />
          {isOpen && <span className="ml-3">Log out</span>}

          {!isOpen && (
            <span
              className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50
                text-xs rounded px-2 py-1 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
                transition-all duration-150 whitespace-nowrap
                ${isDark ? "bg-gray-100 text-gray-900" : "bg-gray-900 text-gray-100"}`}
            >
              Log out
            </span>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
