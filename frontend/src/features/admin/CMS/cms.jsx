import { useState } from "react";
import { useSelector } from "react-redux";
import BannersForm from "./banners";
import PagesForm from "./pages";
import NotificationsForm from "./notification/notification";
import CategoryForm from "./categories/category";
import { colors } from "../dark-lightMode/colors";

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState("banners");
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";
  const c = colors[isDark ? "dark" : "light"];

  const tabClasses = (tab) =>
    `pb-2 px-3 rounded-t-md transition-colors ${
      activeTab === tab
        ? "font-semibold"
        : "opacity-80 hover:opacity-100"
    }`;

  return (
    <div
      style={{ backgroundColor: c.pageBg, color: c.text }}
      className="p-6 min-h-screen transition-colors duration-300"
    >
      {/* Tabs */}
      <div
        style={{ borderColor: c.line }}
        className="flex gap-6 border-b mb-6"
      >
        {["banners", "pages", "notifications", "categories"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              borderBottom:
                activeTab === tab ? `2px solid ${c.button}` : "2px solid transparent",
              color: activeTab === tab ? c.button : c.text,
            }}
            className={tabClasses(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "banners" && <BannersForm />}
      {activeTab === "pages" && <PagesForm />}
      {activeTab === "notifications" && <NotificationsForm />}
      {activeTab === "categories" && <CategoryForm />}
    </div>
  );
}
