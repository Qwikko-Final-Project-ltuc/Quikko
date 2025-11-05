import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

// SVG Icons (نفس الأيقونات السابقة)
const BoltIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const LandingPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [titleText, setTitleText] = useState("");
  const [subtitleText, setSubtitleText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const navigate = useNavigate();
  const themeMode = useSelector((state) => state.customerTheme.mode);

  // Typewriter effect للنص الأساسي - تم زيادة السرعة من 50ms إلى 30ms
  useEffect(() => {
    if (subtitleText && currentIndex < subtitleText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + subtitleText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30); // تغيير من 50 إلى 30 لزيادة السرعة
      
      return () => clearTimeout(timer);
    }
  }, [subtitleText, currentIndex]);

  // Reset typewriter when subtitle changes
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [subtitleText]);

  useEffect(() => {
    const fetchCMS = async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/api/cms?type=customer&title=Landing%20Page"
        );

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Server did not return valid JSON");
        }

        if (!data || data.length === 0) {
          throw new Error("No content found for this page");
        }

        const cmsContent = data[0];
        setContent(cmsContent);

        if (cmsContent.content) {
          const parts = cmsContent.content.split("@");
          setTitleText(parts[0].trim());
          setSubtitleText(parts[1]?.trim() || "");
        }
      } catch (err) {
        console.error("Error fetching CMS:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCMS();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)]">Loading...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--div)]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--error)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">!</span>
          </div>
          <p className="text-[var(--error)] text-lg mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[var(--button)] text-white rounded-lg hover:bg-opacity-90 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section - مع نفس الدوائر المتحركة من Why Choose Us */}
      <div className="flex flex-col lg:flex-row items-center w-full min-h-[85vh] relative overflow-hidden">
        
        {/* Animated Background Elements for Hero Section - نفس دوائر Why Choose Us */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <motion.div 
            className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          ></motion.div>
          <motion.div 
            className="absolute top-32 right-20 w-16 h-16 bg-yellow-300 rounded-full"
            animate={{
              y: [0, 15, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          ></motion.div>
          <motion.div 
            className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-300 rounded-full"
            animate={{
              y: [0, -15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          ></motion.div>
          <motion.div 
            className="absolute bottom-32 right-1/3 w-14 h-14 bg-blue-300 rounded-full"
            animate={{
              y: [0, 10, 0],
              scale: [1, 0.8, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          ></motion.div>
          <motion.div 
            className="absolute top-1/2 left-1/3 w-10 h-10 bg-purple-300 rounded-full"
            animate={{
              y: [0, -25, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
          ></motion.div>
        </div>
        
        {/* Image Section */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:w-2/5 w-full h-[85vh] relative overflow-hidden flex items-center justify-center p-0 z-10"
        >
          <img
            src={content.image_url}
            alt="Landing"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </motion.div>

        {/* Content Section */}
        <div className="lg:w-3/5 w-full p-8 md:p-12 lg:p-16 flex flex-col justify-center items-center h-[85vh] bg-[var(--bg)] relative z-10">
          <div className="max-w-2xl w-full text-center lg:text-left">
            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-[var(--button)] to-purple-800 bg-clip-text text-transparent"
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
            
            {/* Subtitle with Typewriter Effect - الآن أسرع */}
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
                onClick={() => navigate("/customer/products")}
                className="font-semibold py-4 px-12 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl bg-[var(--button)] text-white border border-[var(--button)] hover:bg-opacity-90"
              >
                Start Shopping
              </motion.button>
              
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/customer/stores")}
                className="font-semibold py-4 px-12 rounded-xl border-2 transition-all duration-300 border-[var(--button)] text-[var(--button)] bg-transparent hover:bg-[var(--button)] hover:text-white"
              >
                Explore Stores
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section - نفس الدوائر المتحركة */}
      <section className={`w-full py-24 mt-16 relative overflow-hidden transition-all duration-500 ${
        themeMode === 'dark' 
          ? "bg-gradient-to-br from-[var(--button)] to-gray-900 text-white" 
          : "bg-gradient-to-br from-[var(--button)] to-gray-900 text-white"
      }`}>
        
        {/* Animated Background Elements - نفس الدوائر المتحركة */}
        <div className="absolute inset-0 opacity-10">
          <motion.div 
            className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          ></motion.div>
          <motion.div 
            className="absolute top-32 right-20 w-16 h-16 bg-yellow-300 rounded-full"
            animate={{
              y: [0, 15, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          ></motion.div>
          <motion.div 
            className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-300 rounded-full"
            animate={{
              y: [0, -15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          ></motion.div>
          <motion.div 
            className="absolute bottom-32 right-1/3 w-14 h-14 bg-blue-300 rounded-full"
            animate={{
              y: [0, 10, 0],
              scale: [1, 0.8, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          ></motion.div>
          <motion.div 
            className="absolute top-1/2 left-1/3 w-10 h-10 bg-purple-300 rounded-full"
            animate={{
              y: [0, -25, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
          ></motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Why Choose Us
            </motion.h2>
            <motion.p 
              className="text-xl max-w-2xl mx-auto leading-relaxed text-gray-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Premium services for your convenience and satisfaction
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Fast Delivery",
                description: "Same-day delivery with real-time tracking and instant updates",
                icon: BoltIcon,
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                title: "Secure Payments",
                description: "Military-grade encryption and secure payment processing",
                icon: ShieldCheckIcon,
                gradient: "from-green-500 to-emerald-500"
              },
              {
                title: "Premium Quality",
                description: "Curated selection of premium products with quality assurance",
                icon: StarIcon,
                gradient: "from-purple-500 to-pink-500"
              },
              {
                title: "24/7 Support",
                description: "Round-the-clock customer service with dedicated experts",
                icon: PhoneIcon,
                gradient: "from-orange-500 to-red-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.3 }
                }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative rounded-2xl p-6 border border-white/20 bg-white/10 backdrop-blur-lg hover:bg-white/15 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center mb-4">
                  <motion.div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${feature.gradient} mr-4 group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon />
                  </motion.div>
                  <h3 className="text-lg font-bold text-white group-hover:text-yellow-200 transition-colors duration-300">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed group-hover:text-white transition-colors duration-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-16 pt-12 border-t border-white/20"
          >
            <motion.p 
              className="text-2xl font-semibold text-white mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Join thousands of satisfied customers
            </motion.p>
            <motion.button 
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/customer/products")}
              className="bg-white text-gray-900 px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-2xl border border-white hover:bg-gray-100"
            >
              Start Your Journey Today
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;