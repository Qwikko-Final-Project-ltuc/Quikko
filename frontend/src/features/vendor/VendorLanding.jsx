import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaUsers, FaChartLine, FaStore } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getVendorLandingCMS } from "./VendorAPI2";
import Footer from "./Footer";
import { motion } from "framer-motion";

export default function VendorLanding() {
  const navigate = useNavigate();
  const [heroCMS, setHeroCMS] = useState(null);
  const [titleText, setTitleText] = useState("");
  const [subtitleText, setSubtitleText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
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

  // Typewriter effect for subtitle
  useEffect(() => {
    if (!subtitleText) return;
    const interval = setInterval(() => {
      setDisplayedText(subtitleText.slice(0, currentIndex + 1));
      setCurrentIndex((prev) => prev + 1);
    }, 50);
    if (currentIndex >= subtitleText.length) clearInterval(interval);
    return () => clearInterval(interval);
  }, [currentIndex, subtitleText]);

  useEffect(() => {
    const fetchCMS = async () => {
      try {
        const data = await getVendorLandingCMS();
        if (data.length > 0) {
          const cmsContent = data[0];
          setHeroCMS(cmsContent);

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

  const pageBg = isDarkMode ? "#242625" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#242625";
  const themeMode = isDarkMode ? 'dark' : 'light';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: pageBg, color: textColor }}>

      {/* Hero Section */}
      {heroCMS && (
        <section className="flex flex-col md:flex-row mb-5 mt-10 min-h-[400px] w-full relative">
          <div className="w-full md:w-1/2 h-64 sm:h-96 md:h-full flex justify-center md:justify-center md:pl-4 lg:pl-8 pt-4 sm:pt-8">
            <img
              src={heroCMS.image_url}
              alt={heroCMS.title}
              className="h-full sm:h-auto object-contain scale-100"
              style={{ objectPosition: 'right' }}
            />
          </div>

          {/* Content Section - New Style */}
          <div className="lg:w-3/5 w-full p-8 md:p-12 lg:p-16 flex flex-col justify-center items-center h-[85vh] bg-[var(--bg)] relative z-10">
            <div className="max-w-2xl w-full text-center lg:text-left">
              
              {/* Title */}
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-[var(--button)] to-purple-800 bg-clip-text text-transparent"
              >
                {titleText.split(" ").map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="inline-block mr-2"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h1>

              {/* Subtitle with Typewriter Effect */}
              {subtitleText && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className={`text-lg md:text-xl lg:text-2xl mb-8 leading-relaxed min-h-[120px] ${
                    themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  <div className="typewriter-container relative">
                    <p className="whitespace-pre-line font-medium">
                      {displayedText}
                      {currentIndex < subtitleText.length && (
                        <span className="ml-1 text-[var(--button)] animate-pulse">|</span>
                      )}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/vendor/login")}
                  className="font-semibold py-4 px-12 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl bg-[var(--button)] text-white border border-[var(--button)] hover:bg-opacity-90"
                >
                  LOG IN 
                </motion.button>
                
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/vendor/register")}
                  className="font-semibold py-4 px-12 rounded-xl border-2 transition-all duration-300 border-[var(--button)] text-[var(--button)] bg-transparent hover:bg-[var(--button)] hover:text-white"
                >
                  SIGN UP
                </motion.button>
              </motion.div>

            </div>
          </div>
        </section>
      )}

      {/* Why Join Qwikko Section */}
      <section className={`w-full py-24 mt-16 relative mb-40 overflow-hidden transition-all duration-500 ${
        isDarkMode 
          ? "bg-gradient-to-br from-[var(--button)] to-gray-900 text-white" 
          : "bg-gradient-to-br from-[var(--button)] to-gray-900 text-white"
      }`}>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <motion.div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"
            animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}></motion.div>
          <motion.div className="absolute top-32 right-20 w-16 h-16 bg-yellow-300 rounded-full"
            animate={{ y: [0, 15, 0], scale: [1, 0.9, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}></motion.div>
          <motion.div className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-300 rounded-full"
            animate={{ y: [0, -15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}></motion.div>
          <motion.div className="absolute bottom-32 right-1/3 w-14 h-14 bg-blue-300 rounded-full"
            animate={{ y: [0, 10, 0], scale: [1, 0.8, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}></motion.div>
          <motion.div className="absolute top-1/2 left-1/3 w-10 h-10 bg-purple-300 rounded-full"
            animate={{ y: [0, -25, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}></motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-16">
            <motion.h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r text-white  bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }} viewport={{ once: true }}>Why Join Qwikko?</motion.h2>
            <motion.p className="text-xl max-w-2xl mx-auto leading-relaxed text-gray-200"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}>
              Premium services for your convenience and satisfaction
            </motion.p>
          </motion.div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((b, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, y: -5, transition: { duration: 0.3 } }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative rounded-2xl p-6 border border-white/20 bg-white/10 backdrop-blur-lg hover:bg-white/15 transition-all duration-300 cursor-pointer group text-center"
              >
                <div className="flex flex-col items-center mb-4">
                  <motion.div className="w-16 h-16 rounded-xl flex items-center justify-center    mb-4 group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                    {React.cloneElement(b.icon, { style: { color: "#fff", fontSize: '2rem' } })}
                  </motion.div>
                  <h3 className="text-lg sm:text-xl font-bold text-white  transition-colors duration-300">{b.title}</h3>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed group-hover:text-white transition-colors duration-300">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
