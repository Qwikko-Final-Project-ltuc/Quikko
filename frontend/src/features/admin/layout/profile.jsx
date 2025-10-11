import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export default function Profile() {
  const [user, setUser] = useState(null);
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  if (!user)
    return (
      <p
        className={`text-center mt-10 ${
          isDark ? "text-white" : "text-[#242625]"
        }`}
      >
        Please login first.
      </p>
    );

  return (
    <div
      className={`p-6 rounded shadow-md max-w-md mx-auto mt-10 transition-colors duration-500 ease-in-out
        ${isDark ? "bg-[#242625] text-white" : "bg-[#f0f2f1] text-[#242625]"}`}
    >
      <h2
        className={`text-2xl text-center font-bold mb-6 transition-colors duration-500 ease-in-out border-b-2 pb-2`}
        style={{ borderBottomColor: isDark ? "#f9f9f9" : "#242625" }}
      >
        Admin Profile
      </h2>

      <div className="flex items-center mb-6 space-x-4">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl transition-colors duration-500 ease-in-out
            ${isDark ? "bg-[#666666] text-white" : "bg-[#307A59] text-white"}`}
        >
          {user.name
            .split(" ")
            .map((n) => n[0].toUpperCase())
            .slice(0, 2)
            .join("")}
        </div>
        <div className="transition-colors duration-500 ease-in-out">
          <p className="font-semibold text-lg">{user.name}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div
          className={`p-4 rounded transition-colors duration-500 ease-in-out
            ${isDark ? "bg-[#666666]" : "bg-white"}`}
        >
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
        <div
          className={`p-4 rounded transition-colors duration-500 ease-in-out
            ${isDark ? "bg-[#666666]" : "bg-white"}`}
        >
          <p>
            <strong>Phone:</strong> {user.phone || "-"}</p>
        </div>
        <div
          className={`p-4 rounded transition-colors duration-500 ease-in-out
            ${isDark ? "bg-[#666666]" : "bg-white"}`}
        >
          <p>
            <strong>Address:</strong> {user.address || "-"}</p>
        </div>
      </div>
    </div>
  );
}
