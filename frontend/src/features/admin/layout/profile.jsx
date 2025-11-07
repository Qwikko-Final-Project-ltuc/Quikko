import { useState, useEffect } from "react";
import { FaUserSlash } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteProfile } from "../../customer/customer/profileSlice";
import { profile } from "../auth/authApi";

export default function Profile() {
  const [user, setUser] = useState(null);
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profile();
        console.log("profile data:", data);
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  if (!user)
    return (
      <p
        className={`text-center mt-10 ${
          isDark ? "text-[var(--text)]" : "text-[var(--text)]"
        }`}
      >
        Loading profile...
      </p>
    );

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await dispatch(deleteProfile()).unwrap();
        alert("Account deleted!");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/customer/login");
      } catch (err) {
        alert("Failed to delete account: " + err.message);
      }
    }
  };

  return (
    <>
      <div className="w-full mx-auto  p-6  rounded-2xl">
        <h2 className={`text-3xl font-extrabold pb-3 opacity-90 ml-80`}>
          Admin Profile
        </h2>
        <div
          className={`w-200 h-100 p-6 rounded shadow-md mx-auto mt-5 transition-colors duration-500 ease-in-out border rounded-xl
        ${
          isDark
            ? "bg-gradient-to-b from-[#474747] to-[#242625] text-[var(--text)] border-[var(--border)]"
            : "bg-gradient-to-b from-[#FFFFFF] to-[#f3f3f3] text-[var(--text)] border-[var(--border)]"
        }`}
        >
          <div className="flex items-center ml-3 mb-6 space-x-4">
            <div className="transition-colors duration-500 ease-in-out ">
              <p className="font-semibold text-3xl">{user.name}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div
              className={`text-xl p-4 rounded transition-colors duration-500 ease-in-out
            ${isDark ? "text-[var(--text)]" : "text-[var(--text)]"}`}
            >
              <p>
                <strong>Email:</strong> {user.email}
              </p>
            </div>
            <div
              className={`text-xl p-4 rounded transition-colors duration-500 ease-in-out
            ${isDark ? "text-[var(--text)]" : "text-[var(--text)]"}`}
            >
              <p>
                <strong>Phone:</strong> {user.phone || "-"}
              </p>
            </div>
            <div
              className={`text-xl p-4 rounded transition-colors duration-500 ease-in-out
            ${isDark ? "text-[var(--text)]" : "text-[var(--text)]"}`}
            >
              <p>
                <strong>Address:</strong> {user.address || "-"}
              </p>
            </div>

            <button
              onClick={handleDeleteAccount}
              className="flex items-center justify-center gap-2 mx-auto bg-red-600 text-white px-5 py-2 rounded duration-500 ease-in-out hover:scale-102 cursor-pointer"
            >
              <FaUserSlash /> Delete My Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
