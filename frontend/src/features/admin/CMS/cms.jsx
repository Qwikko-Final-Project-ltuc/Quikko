import { useState } from "react";
import { useSelector } from "react-redux";
import BannersForm from "./banners";
import PagesForm from "./pages";
import NotificationsForm from "./notification/notification";
import CategoryForm from "./categories/category";

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState("banners");
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  const tabClasses = (tab) =>
    `pb-2 px-3 sm:px-4 rounded-t-md transition-colors duration-300 text-sm sm:text-base ${
      activeTab === tab
        ? "font-semibold border-b-2 border-[#307A59]"
        : "opacity-80 hover:opacity-100 text-gray-600 hover:text-gray-800"
    }`;

  return (
    <div className="w-full mx-auto p-4 sm:p-6 rounded-2xl mt-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold pb-2 sm:pb-3 opacity-90 mb-4 sm:mb-5">
        Content Management System
      </h1>
      <div
        className={`min-h-screen p-4 sm:p-6 transition-colors duration-500 ${
          isDark
            ? "bg-[var(--bg)] text-[var(--text)]"
            : "bg-[var(--bg)] text-[var(--text)]"
        }`}
      >
        {/* Tabs */}
        <div className="flex gap-3 sm:gap-6 mb-4 sm:mb-6 overflow-x-auto pb-2 ml-3">
          {["banners", "notifications", "categories"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
              className={tabClasses(tab)}
            >
              {tab
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === "banners" && <BannersForm isDark={isDark} />}
          {activeTab === "notifications" && (
            <NotificationsForm isDark={isDark} />
          )}
          {activeTab === "categories" && <CategoryForm isDark={isDark} />}
        </div>
      </div>
    </div>
  );
}
