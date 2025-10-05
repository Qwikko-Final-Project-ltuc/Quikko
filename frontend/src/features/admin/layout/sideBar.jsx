import { NavLink } from "react-router-dom";
import { AiOutlineDashboard } from "react-icons/ai";
import { FaUserTie } from "react-icons/fa";
import { FaTruckFast } from "react-icons/fa6";
import { FaBoxOpen } from "react-icons/fa";
import { FaUserShield } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

export default function SideBar({ isOpen }) {
  return (
    <aside className={`${
        isOpen ? "w-64" : "w-16"
      } h-screen bg-white shadow-md flex flex-col justify-between overflow-y-auto transition-all duration-300`}>
      <div>
        <div className="p-6 text-2xl font-bold">{isOpen ? "Qwikko" : "Q"}</div>
        <nav className="flex flex-col space-y-2 px-4">
          <NavLink
            to="/adminHome"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded hover:bg-gray-200 ${
                isActive ? "bg-gray-200 font-semibold" : ""
              }`
            }
          >
            <AiOutlineDashboard />
            {isOpen && <span>Dashboard</span>}
          </NavLink>

          <NavLink
            to="/adminVendors"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded hover:bg-gray-200 ${
                isActive ? "bg-gray-200 font-semibold" : ""
              }`
            }
          >
            <FaUserTie />
            {isOpen && <span>Vendors</span>}
          </NavLink>

          <NavLink
            to="/adminDelivery"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded hover:bg-gray-200 ${
                isActive ? "bg-gray-200 font-semibold" : ""
              }`
            }
          >
            <FaTruckFast />
            {isOpen && <span>Delivery Companies</span>}
          </NavLink>

          <NavLink
            to="/adminOrders"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded hover:bg-gray-200 ${
                isActive ? "bg-gray-200 font-semibold" : ""
              }`
            }
          >
            <FaBoxOpen />
            {isOpen && <span>Orders</span>}
          </NavLink>

          <NavLink
            to="/adminCms"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded hover:bg-gray-200 ${
                isActive ? "bg-gray-200 font-semibold" : ""
              }`
            }
          >
            <FaUserShield />
            {isOpen && <span>CMS</span>}
          </NavLink>
        </nav>
      </div>

      <div className="px-4 pb-4">
        <NavLink
          to="adminLogin"
          className="flex items-center space-x-2 p-2 rounded hover:bg-gray-200 mt-2"
        >
          <FiLogOut />
          {isOpen && <span>Log out</span>}
        </NavLink>
      </div>
    </aside>
  );
}
