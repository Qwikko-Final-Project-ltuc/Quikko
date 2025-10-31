import React from "react";
import { FaShoppingBag, FaStore, FaTruck } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
 
export default function LandingPage() {
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);
 
  return (
    <div
      className="min-h-screen font-sans transition-colors duration-300 "
      style={{
        backgroundColor: isDarkMode ? "#f0f2f1" : "#242625",
        color: isDarkMode ? "#242625" : "#ffffff",
      }}
    >
      {/* 🌟 Hero Section */}
      <section
        className="text-center py-32 px-6 rounded-b-[3rem] shadow-md transition"
        style={{
          backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
          color: isDarkMode ? "#ffffff" : "#242625",
        }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          Everything You Need in One Place
        </h1>
        <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
          Shop products, sell your own, or deliver orders — all from one smart
          platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/customer/home"
            className="px-8 py-3 bg-white text-[#307A59] font-semibold rounded-full shadow hover:scale-105 transition"
          >
            Start Shopping
          </Link>
          <Link
            to="/vendor"
            className="px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-[#307A59] transition"
          >
            Become a Vendor
          </Link>
        </div>
      </section>
 
      {/* 🧱 Features Section */}
      <section className="py-24 px-6 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {[
          {
            icon: (
              <FaShoppingBag className="text-7xl text-light-button dark:text-dark-button mb-4" />
            ),
            title: "Discover Products",
            desc: "Browse thousands of products from top stores with exclusive deals.",
            link: "/customer/home",
            btn: "Shop Now",
          },
          {
            icon: (
              <FaStore className="text-7xl text-light-button dark:text-dark-button mb-4" />
            ),
            title: "Grow Your Store",
            desc: "Reach more customers and manage your business with powerful tools.",
            link: "/vendor",
            btn: "Join as Vendor",
          },
          {
            icon: (
              <FaTruck className="text-7xl text-light-button dark:text-dark-button mb-4" />
            ),
            title: "Deliver Faster",
            desc: "Join our delivery network and earn money delivering in your area.",
            link: "/delivery",
            btn: "Start Delivering",
          },
        ].map((card, i) => (
          <div
            key={i}
            className={`rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col items-center p-10 ${
              isDarkMode ? "bg-dark-div" : "bg-light-div"
            }`}
          >
            {card.icon}
            <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8">{card.desc}</p>
            <Link
              to={card.link}
              className="px-6 py-2 rounded-full font-semibold transition"
              style={{
                backgroundColor: "#307A59",
                color: "#ffffff",
              }}
            >
              {card.btn}
            </Link>
          </div>
        ))}
      </section>
 
      <section
        className={`py-24 text-center ${
          isDarkMode ? "bg-dark-div" : "bg-light-div"
        } rounded-3xl shadow-inner max-w-5xl mx-auto mb-20`}
      >
        <h2 className="text-4xl font-extrabold mb-16">Trusted by Thousands</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <p className="text-5xl font-extrabold text-light-button dark:text-dark-button">
              50K+
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Active Users
            </p>
          </div>
          <div>
            <p className="text-5xl font-extrabold text-light-button dark:text-dark-button">
              10K+
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Stores</p>
          </div>
          <div>
            <p className="text-5xl font-extrabold text-light-button dark:text-dark-button">
              500K+
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Orders Delivered
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}