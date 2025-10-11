import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaUsers, FaChartLine, FaStore } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getVendorLandingCMS } from "./VendorAPI2";

export default function VendorLanding() {
  const navigate = useNavigate();
  const [heroCMS, setHeroCMS] = useState(null);

  const greenColor = "#307A59";

  const benefits = [
    {
      icon: <FaStore className="text-4xl" style={{ color: greenColor }} />,
      title: "Reach More Customers",
      description: "Expand your store reach by connecting with thousands of active buyers.",
    },
    {
      icon: <FaChartLine className="text-4xl" style={{ color: greenColor }} />,
      title: "Boost Your Sales",
      description: "Leverage our platform tools to grow your revenue and sales performance.",
    },
    {
      icon: <FaUsers className="text-4xl" style={{ color: greenColor }} />,
      title: "Community Support",
      description: "Join a network of vendors and get support from our dedicated team.",
    },
    {
      icon: <FaShoppingCart className="text-4xl" style={{ color: greenColor }} />,
      title: "Easy Store Management",
      description: "Manage your products, orders, and customers from a single dashboard.",
    },
  ];

  useEffect(() => {
    const fetchCMS = async () => {
      try {
        const data = await getVendorLandingCMS();
        if (data.length > 0) {
          setHeroCMS(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch CMS data:", err);
      }
    };
    fetchCMS();
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f2f1]">
      {/* Hero Section */}
      {heroCMS && (
        <section className="flex flex-col md:flex-row min-h-[400px] w-full">
  {/* الصورة على اليسار */}
  <div className="w-full md:w-1/2 h-full">
    <img
      src={heroCMS.image_url}
      alt={heroCMS.title}
      className="w-full h-full object-contain"
    />
  </div>

  {/* النص على اليمين */}
  <div className="w-full md:w-1/2 flex flex-col justify-center items-start p-12 bg-[#f0f2f1] text-left">
    <h1 className="text-5xl font-extrabold mb-6 text-[#242625]">
      {heroCMS.title}
    </h1>
    <p className="text-xl mb-8 text-[#242625]">{heroCMS.content}</p>
    <button
      onClick={() => navigate("/vendor/register")}
      className="bg-[#307A59] hover:bg-[#285d45] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
    >
      Register Your Store
    </button>
  </div>
</section>
      )}

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#242625]">
          Why Join Qwikko?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {benefits.map((b, index) => (
            <div
              key={index}
              className="bg-[#ffffff] rounded-lg shadow p-6 flex flex-col items-center text-center"
            >
              {b.icon}
              <h3 className="text-xl font-semibold mt-4 text-[#242625]">{b.title}</h3>
              <p className="text-[#242625] mt-2">{b.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
