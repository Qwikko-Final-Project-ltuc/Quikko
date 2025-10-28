import { NavLink } from "react-router-dom";
import { AiOutlineDashboard } from "react-icons/ai";
import { FaBoxOpen, FaUserTie } from "react-icons/fa";
import { FiSettings, FiLogOut } from "react-icons/fi";

export default function SideBar({ handleLogout }) {
  return (
    <aside className="w-64 h-screen bg-white shadow-md flex flex-col justify-between overflow-y-auto">
      <div>
        <div className="p-6 text-2xl font-bold">Vendor Panel</div>
        <nav className="flex flex-col space-y-2 px-4">
          <NavLink
            to="/vendor/dashboard"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded hover:bg-gray-200 ${
                isActive ? "bg-gray-200 font-semibold" : ""
              }`
            }
          >
            <AiOutlineDashboard />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/vendor/products"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded hover:bg-gray-200 ${
                isActive ? "bg-gray-200 font-semibold" : ""
              }`
            }
          >
            <FaUserTie />
            <span>Products</span>
          </NavLink>

          <NavLink
            to="/vendor/orders"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded hover:bg-gray-200 ${
                isActive ? "bg-gray-200 font-semibold" : ""
              }`
            }
          >
            <FaBoxOpen />
            <span>Orders</span>
          </NavLink>
          <NavLink
            to="/vendor/Coupons"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded hover:bg-gray-200 ${
                isActive ? "bg-gray-200 font-semibold" : ""
              }`
            }
          >
            <FaBoxOpen />
            <span>Coupons</span>
          </NavLink>

          <NavLink
            to="/vendor/chat"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded hover:bg-gray-200 ${
                isActive ? "bg-gray-200 font-semibold" : ""
              }`
            }
          >
            💬
            <span>Chat</span>
          </NavLink>
        </nav>
      </div>

      <div className="px-4 pb-4">
        <NavLink
          to="/vendor/settings"
          className="flex items-center space-x-2 p-2 rounded hover:bg-gray-200"
        >
          <FiSettings />
          <span>Settings</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 p-2 rounded hover:bg-gray-200 mt-2 w-full text-left"
        >
          <FiLogOut />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
