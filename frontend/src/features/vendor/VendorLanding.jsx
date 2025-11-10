import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaUsers, FaChartLine, FaStore } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getVendorLandingCMS } from "./VendorAPI2";
import Footer from "./Footer";

export default function VendorLanding() {
  const navigate = useNavigate();
  const [heroCMS, setHeroCMS] = useState(null);
  const [titleText, setTitleText] = useState("");
  const [subtitleText, setSubtitleText] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const greenColor = "#307A59";

  const benefits = [
    { icon: <FaStore className="text-4xl" />, title: "Reach More Customers", description: "Expand your store reach by connecting with thousands of active buyers." },
    { icon: <FaChartLine className="text-4xl" />, title: "Boost Your Sales", description: "Leverage our platform tools to grow your revenue and sales performance." },
    { icon: <FaUsers className="text-4xl" />, title: "Community Support", description: "Join a network of vendors and get support from our dedicated team." },
    { icon: <FaShoppingCart className="text-4xl" />, title: "Easy Store Management", description: "Manage your products, orders, and customers from a single dashboard." },
  ];

  useEffect(() => {
    const fetchCMS = async () => {
      try {
        const data = await getVendorLandingCMS();
        if (data.length > 0) {
          const cmsContent = data[0];
          setHeroCMS(cmsContent);

          // فصل النص مثل صفحة العملاء
          if (cmsContent.content) {
            const parts = cmsContent.content.split("@");
            setTitleText(parts[0].trim());
            setSubtitleText(parts[1]?.trim() || "");
          }
        }
      } catch (err) {
        console.error("Failed to fetch CMS data:", err);
      }
    };
    fetchCMS();

    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const pageBg = isDarkMode ? "#242625" : "#f0f2f1";
  const innerBg = isDarkMode ? "#666666" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#242625";
  const benefitIconColor = isDarkMode ? "#ffffff" : greenColor;

return (
  <div className="min-h-screen flex flex-col" style={{ backgroundColor: pageBg, color: textColor }}>
    
    {/* Hero Section */}
    {heroCMS && (
      <section className="flex flex-col md:flex-row min-h-[400px] w-full">
        {/* الصورة على اليسار */}
        <div className="w-full md:w-1/2 h-64 sm:h-96 md:h-full flex justify-center md:justify-center md:pl-4 lg:pl-8 pt-4 sm:pt-8">
          <img
            src={heroCMS.image_url}
            alt={heroCMS.title}
            className="h-full sm:h-auto object-contain scale-105"
            style={{ objectPosition: 'right' }}
          />
        </div>

        {/* النص على اليمين */}
        <div
          className="w-full md:w-1/2 flex flex-col justify-center items-start p-6 sm:p-8 md:p-12 text-left"
          style={{ backgroundColor: pageBg }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4" style={{ color: textColor }}>
            {titleText || heroCMS.title}
          </h1>
          {subtitleText && (
            <p className="text-lg sm:text-xl mb-6 sm:mb-8" style={{ color: textColor }}>
              {subtitleText}
            </p>
          )}
          <button
            onClick={() => navigate("/vendor/login")}
            className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold transition-colors"
            style={{
              backgroundColor: greenColor,
              color: "#fff",
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#285d45"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = greenColor}
          >
            Start Now
          </button>
        </div>
      </section>
    )}

    {/* Benefits Section */}
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 flex-1">
      <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold text-center mb-8 sm:mb-12" style={{ color: textColor }}>
        Why Join Qwikko?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 max-w-6xl mx-auto">
        {benefits.map((b, index) => (
          <div
            key={index}
            className="rounded-lg shadow p-4 sm:p-6 flex flex-col items-center text-center"
            style={{ backgroundColor: innerBg }}
          >
            {React.cloneElement(b.icon, { style: { color: benefitIconColor, fontSize: '2rem' } })}
            <h3 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4" style={{ color: textColor }}>{b.title}</h3>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base" style={{ color: textColor }}>{b.description}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Footer */}
    <Footer />
  </div>
);

}
