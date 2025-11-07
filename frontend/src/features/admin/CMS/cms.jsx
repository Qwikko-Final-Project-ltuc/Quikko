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
    `pb-2 px-3 rounded-t-md transition-colors ${
      activeTab === tab ? "font-semibold" : "opacity-80 hover:opacity-100"
    }`;

  return (
    <div className="w-full mx-auto  p-6  rounded-2xl">
      <h1 className="text-3xl font-extrabold pb-3 opacity-90 mb-5">
        Content Management System
      </h1>
      <div
        className={`min-h-screen p-6 transition-colors duration-500 ${
          isDark
            ? "bg-[var(--bg)] text-[var(--text)]"
            : "bg-[var(--bg)] text-[var(--text)]"
        }`}
      >
        {/* Tabs */}
        <div className="flex gap-6 mb-6 ml-3">
          {["banners", "notifications", "categories"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                borderBottom:
                  activeTab === tab ? `2px solid ` : "2px solid transparent",
                cursor: "pointer",
              }}
              className={tabClasses(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "banners" && <BannersForm />}
        {activeTab === "notifications" && <NotificationsForm />}
        {activeTab === "categories" && <CategoryForm />}
      </div>
    </div>
  );
}
