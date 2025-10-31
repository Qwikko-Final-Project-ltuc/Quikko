import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaClipboardList,
  FaCog,
  FaChartBar,
  FaHome,
  FaComments,
} from "react-icons/fa";
import { FiLogOut, FiX,FiMenu } from "react-icons/fi"; // ✅ أضفنا أيقونة X للإغلاق
import { useDispatch } from "react-redux";
import { logout } from "../auth/authSlice";
import { useSelector } from "react-redux";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sidebarRef = useRef();

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    setShowLogoutModal(false);
    navigate("/delivery/login");
  };

  // إغلاق السايدبار عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        toggleSidebar(); // يغلق السايدبار
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, toggleSidebar]);

    const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen bg-white shadow-md flex flex-col justify-between overflow-hidden transition-all duration-300 z-50 ${
          isOpen ? "w-64" : "w-0"
        }`}
        style={{
          backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
          color: isDarkMode ? "#ffffff" : "#242625",
        }}
      >
        <div
          className={`flex-1 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundColor: isDarkMode ? "#242625" : "#f0f2f1", // الخلفية
            color: isDarkMode ? "#ffffff" : "#242625", // النصوص
          }}
        >
          {/* الزر والشعار بنفس التنسيق */}
          {isOpen && (
            <div className="flex items-center gap-4 px-4 py-4">
              {/* زر إغلاق / السايدبار */}
              <button
                onClick={toggleSidebar}
                className="text-2xl text-gray-700 hover:text-black transition flex-shrink-0"
              >
                <FiMenu
                  style={{
                    color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                  }}
                />
              </button>

              {/* الشعار */}
              <div
                className="text-2xl font-bold text-gray-800"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                }}
              >
                Delivery Panel
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex flex-col space-y-2 px-4 mt-4">
            <NavLink
              to="home"
              className={({ isActive }) =>
                "flex items-center space-x-2 p-2 rounded transition font-semibold"
              }
              style={({ isActive }) => {
                if (isActive) {
                  return {
                    backgroundColor: isDarkMode ? "#666666" : "#e5e7eb", // dark: غامق، light: فاتح
                    color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                  };
                } else {
                  return {
                    backgroundColor: "transparent",
                    color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                  };
                }
              }}
            >
              <FaHome
                className="text-lg"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625", // أيقونة باللون الصحيح
                }}
              />
              <span
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625", // النص باللون الصحيح
                }}
              >
                Home
              </span>
            </NavLink>

            <NavLink
              to="getProfile"
              className={({ isActive }) =>
                "flex items-center space-x-2 p-2 rounded transition font-semibold"
              }
              style={({ isActive }) => {
                if (isActive) {
                  return {
                    backgroundColor: isDarkMode ? "#666666" : "#e5e7eb", // dark: غامق، light: فاتح
                    color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                  };
                } else {
                  return {
                    backgroundColor: "transparent",
                    color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                  };
                }
              }}
            >
              <FaUser
                className="text-lg "
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                }}
              />
              <span
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                }}
              >
                Profile
              </span>
            </NavLink>

            <NavLink
              to="orders" // ✅ لازم تحدد المسار
              className="flex items-center space-x-2 p-2 rounded transition font-semibold"
              style={({ isActive }) => {
                if (isActive) {
                  return {
                    backgroundColor: isDarkMode ? "#666666" : "#e5e7eb", // dark: غامق، light: فاتح
                    color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                  };
                } else {
                  return {
                    backgroundColor: "transparent",
                    color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                  };
                }
              }}
            >
              <FaClipboardList
                className="text-lg"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                }}
              />
              <span
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                }}
              >
                Orders
              </span>
            </NavLink>
            <NavLink
              to="chat" // ✅ لازم تحدد المسار
              className="flex items-center space-x-2 p-2 rounded transition font-semibold"
              style={({ isActive }) => {
                if (isActive) {
                  return {
                    backgroundColor: isDarkMode ? "#666666" : "#e5e7eb", // dark: غامق، light: فاتح
                    color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                  };
                } else {
                  return {
                    backgroundColor: "transparent",
                    color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                  };
                }
              }}
            >
              <FaComments
                className="text-lg"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                }}
              />
              <span
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                }}
              >
                Chats
              </span>
            </NavLink>

            <NavLink
              to="reports"
              className={({ isActive }) =>
                "flex items-center space-x-2 p-2 rounded transition font-semibold"
              }
              style={({ isActive }) => {
                if (isActive) {
                  return {
                    backgroundColor: isDarkMode ? "#666666" : "#e5e7eb", // dark: غامق، light: فاتح
                    color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                  };
                } else {
                  return {
                    backgroundColor: "transparent",
                    color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                  };
                }
              }}
            >
              <FaChartBar
                className="text-lg "
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                }}
              />
              <span
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                }}
              >
                Reports
              </span>
            </NavLink>

            <NavLink
              to="settings"
              className={({ isActive }) =>
                "flex items-center space-x-2 p-2 rounded transition font-semibold"
              }
              style={({ isActive }) => {
                if (isActive) {
                  return {
                    backgroundColor: isDarkMode ? "#666666" : "#e5e7eb", // dark: غامق، light: فاتح
                    color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                  };
                } else {
                  return {
                    backgroundColor: "transparent",
                    color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                  };
                }
              }}
            >
              <FaCog
                className="text-lg"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                }}
              />
              <span
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625", // النصوص
                }}
              >
                Settings
              </span>
            </NavLink>
          </nav>
        </div>

        {/* Footer */}
        <div
          className={`px-4 pb-4 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center space-x-2 p-2 rounded  transition w-full text-left hover:cursor-pointer"
          >
            <FiLogOut
              className="text-lg"
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            />
            <span
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              Log out
            </span>
          </button>
        </div>
      </aside>

      {/* مودال تسجيل الخروج */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
          <div
            className=" p-6 rounded-xl shadow-lg max-w-sm w-full text-center"
            style={{
              backgroundColor: isDarkMode ? "#242625" : "#f0f2f1", // الخلفية
              color: isDarkMode ? "#ffffff" : "#242625", // النصوص
            }}
          >
            <h2 className="text-xl font-semibold mb-4">
              Are you sure you want to log out?
            </h2>
            <div className="flex justify-center gap-4">
              <div className="flex flex-col gap-3 mt-4">
                <button
                  onClick={handleLogout}
                  className="w-64 px-1 py-2 rounded-lg font-semibold transition"
                  style={{
                    backgroundColor: isDarkMode ? "#242625" : "#ffffff",
                    color: isDarkMode ? "#ee635eff" : "#d9534f",
                    border: isDarkMode
                      ? "1px solid #d9534f"
                      : "1px solid #d9534f",
                  }}
                >
                  Yes, Logout
                </button>

                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full px-4 py-2 rounded-lg font-semibold transition"
                  style={{
                    backgroundColor: isDarkMode ? "#242625" : "#ffffff",
                    color: isDarkMode ? "#ffffff" : "#242625",
                    border: isDarkMode
                      ? "1px solid #ffffff"
                      : "1px solid #242625",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
