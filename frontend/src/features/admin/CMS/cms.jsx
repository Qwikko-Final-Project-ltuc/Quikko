import { useState } from "react";
import BannersForm from "./banners";
import PagesForm from "./pages";
import NotificationsForm from "./notification/notification";
import CategoryForm from "./categories/category";

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState("banners");

  return (
    <div className="p-6">

      <div className="flex gap-6 border-b mb-6">
        <button
          className={`pb-2 ${activeTab === "banners" ? "border-b-2 border-black font-semibold" : ""}`}
          onClick={() => setActiveTab("banners")}
        >
          Banners
        </button>
        <button
          className={`pb-2 ${activeTab === "pages" ? "border-b-2 border-black font-semibold" : ""}`}
          onClick={() => setActiveTab("pages")}
        >
          Pages
        </button>
        <button
          className={`pb-2 ${activeTab === "notifications" ? "border-b-2 border-black font-semibold" : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          Notification
        </button>
        <button
          className={`pb-2 ${activeTab === "categories" ? "border-b-2 border-black font-semibold" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>
      </div>

      {activeTab === "banners" && <BannersForm />}
      {activeTab === "pages" && <PagesForm />}
      {activeTab === "notifications" && <NotificationsForm />}
      {activeTab === "categories" && <CategoryForm />}
    </div>
  );
}
