import React from "react";
import { motion } from "framer-motion";
import { FaShoppingBag, FaStore, FaTruck, FaArrowRight, FaStar, FaShieldAlt, FaRocket, FaBolt, FaChartLine, FaUsers, FaFire, FaRegClock, FaHeart, FaGem } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 40 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 14,
      duration: 0.8
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    y: 50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 16,
      duration: 0.7
    }
  }
};

const floatingVariants = {
  floating: {
    y: [-25, 25, -25],
    rotate: [0, 3, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const gradientVariants = {
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const textRevealVariants = {
  hidden: { 
    opacity: 0, 
    y: 100 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 14,
      duration: 1
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 60 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 14,
      duration: 0.9
    }
  }
};

const scaleIn = {
  hidden: { 
    opacity: 0, 
    scale: 0.85 
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 16,
      duration: 0.8
    }
  }
};

const pulseGlow = {
  initial: { 
    boxShadow: "0 0 0 0 rgba(2, 106, 75, 0.6)" 
  },
  pulse: {
    boxShadow: [
      "0 0 0 0 rgba(2, 106, 75, 0.6)",
      "0 0 0 20px rgba(2, 106, 75, 0)",
      "0 0 0 0 rgba(2, 106, 75, 0)"
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeOut"
    }
  }
};

const bounceIn = {
  hidden: { 
    opacity: 0, 
    scale: 0.6,
    rotate: -8
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 12,
      duration: 0.8
    }
  }
};

export default function LandingPage() {
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  const colors = {
    bg: isDarkMode ? "#0a0a0a" : "#ffffff",
    textbox: "#ffffff",
    text: isDarkMode ? "#f5f5f5" : "#1a1f1d",
    textSecondary: isDarkMode ? "#a0a0a0" : "#5a6c65",
    div: isDarkMode ? "#2a2a2a" : "#e8ecea",
    border: isDarkMode ? "#404040" : "#d0d9d5",
    button: "#026a4b",
    buttonHover: "#015c40",
    accent: "#026a4b",
    gradientStart: "#026a4b",
    gradientEnd: "#014d34"
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="min-h-screen font-sans transition-colors duration-500 overflow-x-hidden"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {/* 🌟 Hero Section */}
      <motion.section
        variants={gradientVariants}
        animate="animate"
        className="relative text-center py-28 px-6 overflow-hidden cursor-pointer transform transition-all duration-500 hover:shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 50%, ${colors.gradientStart} 100%)`,
          backgroundSize: "400% 400%",
          color: "#ffffff",
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              variants={floatingVariants}
              animate="floating"
              transition={{ delay: i * 0.7 }}
              className="absolute bg-white/10 rounded-full backdrop-blur-sm"
              style={{
                width: `${30 + i * 25}px`,
                height: `${30 + i * 25}px`,
                top: `${15 + i * 12}%`,
                left: `${8 + i * 15}%`,
                opacity: 0.1 + (i * 0.1)
              }}
            />
          ))}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative max-w-6xl mx-auto"
        >
          <motion.div
            variants={bounceIn}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <FaRocket className="text-yellow-300 text-lg" />
            </motion.div>
            <span className="text-base font-semibold tracking-wider">All-in-One Platform</span>
          </motion.div>
          
          <motion.h1
            variants={textRevealVariants}
            className="text-4xl md:text-6xl font-black mb-8 leading-tight"
          >
            <span className="bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
              Everything You Need
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-200 to-white bg-clip-text text-transparent">
              In One Place
            </span>
          </motion.h1>
          
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl mb-16 max-w-3xl mx-auto opacity-95 leading-relaxed"
          >
            Discover amazing products, grow your business, or join our delivery network — 
            experience the future of commerce today.
          </motion.p>
          
          <motion.div
            variants={containerVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.div variants={itemVariants}>
              <motion.div
                variants={pulseGlow}
                initial="initial"
                animate="pulse"
              >
                <Link
                  to="/customer/home"
                  className="group px-10 py-5 bg-white text-[#026a4b] font-bold rounded-2xl shadow-xl transition-all duration-300 flex items-center gap-3 text-lg hover:shadow-2xl hover:scale-105"
                >
                  <FaShoppingBag className="text-xl" />
                  <span>Start Shopping</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Link
                to="/vendor"
                className="group px-10 py-5 border-2 border-white/50 text-white font-bold rounded-2xl backdrop-blur-sm transition-all duration-300 flex items-center gap-3 text-lg hover:bg-white/20 hover:border-white/70"
              >
                <FaStore className="text-xl" />
                Become a Vendor
                <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* 🎯 Features Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="relative py-20 px-6"
        style={{
          backgroundColor: colors.bg,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-black mb-8"
            >
              <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                Why Choose Qwikko?
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl max-w-3xl mx-auto"
              style={{ color: colors.textSecondary }}
            >
              Experience the future of commerce with our all-in-one platform designed for everyone
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: FaShoppingBag,
                title: "Smart Shopping",
                desc: "AI-powered recommendations and exclusive deals tailored just for you",
                features: [
                  { icon: FaFire, text: "Trending Products" },
                  { icon: FaHeart, text: "Personalized Experience" },
                  { icon: FaShieldAlt, text: "Secure Payments" }
                ],
                link: "/customer/home",
                btn: "Explore Products",
                gradient: "from-green-600 to-green-800"
              },
              {
                icon: FaStore,
                title: "Vendor Excellence", 
                desc: "Powerful tools to grow your business and reach new customers worldwide",
                features: [
                  { icon: FaChartLine, text: "Real-time Analytics" },
                  { icon: FaBolt, text: "Quick Setup" },
                  { icon: FaUsers, text: "Customer Insights" }
                ],
                link: "/vendor",
                btn: "Start Selling",
                gradient: "from-blue-600 to-blue-800"
              },
              {
                icon: FaTruck,
                title: "Delivery Network",
                desc: "Flexible delivery system to earn on your schedule with maximum efficiency",
                features: [
                  { icon: FaRegClock, text: "Real-time Tracking" },
                  { icon: FaGem, text: "Competitive Earnings" },
                  { icon: FaUsers, text: "Flexible Hours" }
                ],
                link: "/delivery",
                btn: "Join as Driver",
                gradient: "from-purple-600 to-purple-800"
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                className="group relative rounded-3xl p-8 border-2 transition-all duration-500 h-full flex flex-col shadow-lg hover:shadow-2xl hover:border-green-300/50"
                style={{
                  backgroundColor: colors.textbox, 
                  borderColor: colors.border,
                }}
              >
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-6 mb-8">
                    <div
                      className="p-5 rounded-2xl text-white shadow-lg"
                      style={{ 
                        background: `linear-gradient(135deg, ${colors.button}, ${colors.buttonHover})`,
                      }}
                    >
                      <card.icon className="text-2xl" />
                    </div>
                    <h3
                      className={`text-2xl font-black flex-1 bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}
                    >
                      {card.title}
                    </h3>
                  </div>
                  
                  <p className="text-base mb-8 leading-relaxed flex-1" style={{ color: colors.textSecondary }}>
                    {card.desc}
                  </p>
                  
                  <div className="space-y-4 mb-8 flex-1">
                    {card.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8faf9',
                        }}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm"
                          style={{ 
                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#ffffff',
                            borderColor: colors.border
                          }}
                        >
                          <feature.icon className="text-lg" style={{ color: colors.button }} />
                        </div>
                        <span style={{ color: colors.text }} className="font-semibold text-base">
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-auto">
                    <Link
                      to={card.link}
                      className="group w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                      style={{
                        backgroundColor: colors.button,
                        color: "#ffffff",
                      }}
                    >
                      <span className="text-base">{card.btn}</span>
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* 🛡️ Trust & Security Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="py-20 px-6 max-w-6xl mx-auto"
        style={{
          backgroundColor: colors.bg,
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={bounceIn}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl border shadow-lg mb-12"
            style={{
              backgroundColor: colors.textbox, 
              borderColor: colors.border
            }}
          >
            <FaShieldAlt style={{ color: colors.button }} className="text-xl" />
            <span className="font-bold text-xl" style={{ color: colors.text }}>Trust & Security</span>
          </motion.div>
          
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-black mb-8"
          >
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Built on Trust & Innovation
            </span>
          </motion.h2>
          
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl mb-12 max-w-3xl mx-auto"
            style={{ color: colors.textSecondary }}
          >
            Our platform is built with cutting-edge technology and security measures to ensure your experience is safe, seamless, and exceptional.
          </motion.p>
          
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16"
          >
            {[
              {
                icon: FaShieldAlt,
                title: "Secure Transactions",
                desc: "Bank-level encryption and secure payment processing for all your transactions with 24/7 monitoring",
                gradient: "from-green-600 to-blue-600"
              },
              {
                icon: FaStar,
                title: "Premium Experience", 
                desc: "Carefully crafted user experience that puts your needs and satisfaction first with intuitive design",
                gradient: "from-purple-600 to-pink-600"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="p-8 rounded-3xl text-center border-2 h-full flex flex-col shadow-lg hover:shadow-2xl hover:border-green-300/50 transition-all duration-500"
                style={{ 
                  backgroundColor: colors.textbox,
                  borderColor: colors.border
                }}
              >
                <div
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center border shadow-lg"
                  style={{ 
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#f8faf9',
                    borderColor: colors.border
                  }}
                >
                  <item.icon className="text-3xl" style={{ color: colors.button }} />
                </div>
                <h3 className={`text-2xl font-black mb-4 flex-1 bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>{item.title}</h3>
                <p style={{ color: colors.textSecondary }} className="text-base leading-relaxed flex-1">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* 🚀 CTA Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="py-24 px-6 text-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 50%, ${colors.gradientStart} 100%)`,
          backgroundSize: "200% 200%",
        }}
      >
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-black mb-8 text-white"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl mb-12 text-white/90 max-w-2xl mx-auto leading-relaxed"
          >
            Join our community and transform your shopping and business experience today
          </motion.p>
          <motion.div
            variants={containerVariants}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.div variants={itemVariants}>
              <Link
                to="/customer/home"
                className="group px-10 py-5 bg-white text-[#026a4b] font-bold rounded-2xl shadow-xl transition-all duration-300 flex items-center gap-3 text-lg hover:shadow-2xl hover:scale-105"
              >
                <FaShoppingBag className="text-xl" />
                Start Shopping Now
                <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link
                to="/vendor"
                className="group px-10 py-5 border-2 border-white text-white font-bold rounded-2xl transition-all duration-300 flex items-center gap-3 text-lg hover:bg-white/20 hover:border-white/70"
              >
                <FaStore className="text-xl" />
                Start Selling Today
                <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}