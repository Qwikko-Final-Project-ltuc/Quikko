import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaClipboardList,
  FaChartLine,
  FaUsers,
  FaDollarSign,
} from "react-icons/fa";
import { fetchLandingCMS } from "./LandingAPI";
import { useSelector } from "react-redux";

export default function LandingPage() {
  const [cmsContent, setCmsContent] = useState(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  useEffect(() => {
    async function loadCMS() {
      const data = await fetchLandingCMS("delivery", "Landing Page");
      setCmsContent(data);

      if (data?.content) {
        const parts = data.content.split("@");
        setTitle(parts[0]?.trim() || "");
        setSubtitle(parts[1]?.trim() || "");
      }
    }
    loadCMS();
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <>
      <div
        className="min-h-screen  flex flex-col items-center"
        style={{
          backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
          color: isDarkMode ? "#ffffff" : "#242625",
        }}
      >
        <div
          className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl p-10 mt-10 gap-12 rounded-2xl shadow-lg"
          style={{
            backgroundColor: isDarkMode ? "#2d2d2d" : "#ffffff",
            color: isDarkMode ? "#ffffff" : "#242625",
            minHeight: "80vh", // 👈 يخليها أطول
          }}
        >
          <div className="md:w-1/2 flex justify-center order-1 md:order-1">
            {cmsContent?.image_url ? (
              <img
                src={cmsContent.image_url}
                alt="Landing visual"
                className="w-full max-w-md object-contain rounded-lg shadow-xl"
              />
            ) : (
              <div
                className="w-full max-w-md h-80 bg-gray-200 flex items-center justify-center rounded-lg"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                Loading image...
              </div>
            )}
          </div>

          <div className="md:w-1/2 text-center md:text-left flex flex-col items-center md:items-start order-2 md:order-2 space-y-4">
            <h1
              className="text-4xl md:text-5xl font-bold leading-tight"
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              {title || "Welcome to Qwikko Delivery"}
            </h1>

            {subtitle && (
              <p
                className="text-lg mb-4 whitespace-pre-line leading-relaxed"
                style={{
                  color: isDarkMode ? "#dcdcdc" : "#333333",
                }}
              >
                {subtitle}
              </p>
            )}

            <Link
              to="/delivery/login"
              className="px-10 py-4 rounded-lg text-lg text-center shadow-md transition-all duration-300 transform hover:scale-105"
              style={{
                backgroundColor: isDarkMode ? "#307A59" : "#307A59",
                color: "#ffffff",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#2b6b4f"; // أغمق شوي عند الهوفر
                e.target.style.boxShadow = "0 6px 15px rgba(48, 122, 89, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#307A59";
                e.target.style.boxShadow = "0 4px 10px rgba(48, 122, 89, 0.3)";
              }}
            >
              Start Now
            </Link>
          </div>
        </div>

        <div className="w-full max-w-5xl p-10 mt-7 text-center">
          <h2
            className="text-4xl font-bold mb-16"
            style={{
              color: isDarkMode ? "#ffffff" : "#242625",
            }}
          >
            How It Works
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-between relative">
            <div
              className="hidden md:block absolute top-14 left-0 w-full h-1 z-0"
              style={{
                backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            ></div>

            {[
              {
                step: "1",
                title: "Register your company",
                desc: "Sign up quickly and create your business account.",
              },
              {
                step: "2",
                title: "Set up your delivery zones",
                desc: "Define the areas where your company will operate and deliver.",
              },
              {
                step: "3",
                title: "Start receiving orders",
                desc: "Track and deliver orders smoothly and grow your business.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative z-10 flex flex-col items-center bg-white rounded-2xl shadow-md p-6 w-64"
                style={{
                  backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                <div
                  className="w-16 h-16 flex items-center justify-center rounded-full text-2xl font-bold mb-4 shadow-md"
                  style={{
                    backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                    color: isDarkMode ? "#ffffff" : "#242625",
                  }}
                >
                  {item.step}
                </div>
                <p
                  className="text-lg font-semibold"
                  style={{
                    color: isDarkMode ? "#ffffff" : "#242625",
                  }}
                >
                  {item.title}
                </p>
                <p
                  className="text-sm mt-2"
                  style={{
                    color: isDarkMode ? "#dcdcdc" : "#333333",
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <section className="w-full max-w-6xl p-6 mt-10 text-center">
          <h2
            className="text-3xl font-bold mb-10"
            style={{
              color: isDarkMode ? "#ffffff" : "#242625",
            }}
          >
            Benefits Section
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            <div
              className="flex flex-col items-center  rounded-2xl shadow-md p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
              style={{
                backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              <FaClipboardList className="text-6xl mb-4" />
              <p
                className="text-lg font-medium"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                Manage orders easily
              </p>
            </div>
            <div
              className="flex flex-col items-center  rounded-2xl shadow-md p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
              style={{
                backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              <FaChartLine className="text-6xl mb-4 " />
              <p className="text-lg font-medium">
                Accurate reports and statistics
              </p>
            </div>
            <div
              className="flex flex-col items-center  rounded-2xl shadow-md p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
              style={{
                backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              <FaUsers className="text-6xl mb-4 " />
              <p className="text-lg font-medium">
                Reach thousands of customers & stores
              </p>
            </div>
            <div
              className="flex flex-col items-center  rounded-2xl shadow-md p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
              style={{
                backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              <FaDollarSign className="text-6xl mb-4 " />
              <p className="text-lg font-medium">
                Guaranteed and fast payments
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
