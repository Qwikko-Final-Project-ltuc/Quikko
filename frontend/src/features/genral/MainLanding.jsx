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
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 14,
      duration: 0.7
    }
  }
};

const cardVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 30
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 16,
      duration: 0.6
    }
  }
};

const floatingVariants = {
  floating: {
    y: [-20, 20, -20],
    rotate: [0, 2, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const gradientVariants = {
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 12,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const textRevealVariants = {
  hidden: {
    opacity: 0,
    y: 80
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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 50
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 14,
      duration: 0.8
    }
  }
};

const scaleIn = {
  hidden: {
    opacity: 0,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 16,
      duration: 0.7
    }
  }
};

const pulseGlow = {
  initial: {
    boxShadow: "0 0 0 0 rgba(2, 106, 75, 0.5)"
  },
  pulse: {
    boxShadow: [
      "0 0 0 0 rgba(2, 106, 75, 0.5)",
      "0 0 0 15px rgba(2, 106, 75, 0)",
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
    scale: 0.7,
    rotate: -5
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 12,
      duration: 0.7
    }
  }
};

export default function LandingPage() {
  const themeMode = useSelector((state) => state.customerTheme.mode);

  // استخدام الألوان من CSS Variables فقط
  const getColor = (colorName) => {
    return `var(--${colorName})`;
  };

  // ألوان متوازنة للوضعين
  const getCardColor = () => {
    return themeMode === 'dark' 
      ? 'rgba(0, 0, 0, 0.2)' // شفاف مع طبقة سوداء خفيفة
      : 'rgba(226, 255, 212, 0.33)'; // شفاف مع طبقة بيضاء خفيفة
  };

  const getInnerDivColor = () => {
    return themeMode === 'dark' 
      ? 'rgba(0, 0, 0, 0.0)' // شفاف مع طبقة سوداء أخف
      : 'rgba(255, 255, 255, 0.6)'; // شفاف مع طبقة بيضاء أخف
  };

  const getIconColor = () => {
    return getColor('text');
  };

  const getBorderColor = () => {
    return themeMode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' // حدود شفافة للداكن
      : 'rgba(0, 0, 0, 0.1)'; // حدود شفافة للفاتح
  };

  const getTextColor = () => {
    return getColor('text');
  };

  const getLightGrayColor = () => {
    return getColor('light-gray');
  };

  const getButtonColor = () => {
    return getColor('button');
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="min-h-screen font-sans transition-colors duration-500 overflow-x-hidden"
      style={{
        backgroundColor: getColor('bg'),
        color: getTextColor(),
      }}
    >
      {/* 🌟 Hero Section */}
      <motion.section
        variants={gradientVariants}
        animate="animate"
        className="relative text-center py-24 px-6 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${getButtonColor()} 0%, #014d34 50%, ${getButtonColor()} 100%)`,
          backgroundSize: "400% 400%",
          color: "#ffffff",
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              variants={floatingVariants}
              animate="floating"
              transition={{ delay: i * 0.5 }}
              className="absolute bg-white/10 rounded-full backdrop-blur-sm"
              style={{
                width: `${20 + i * 20}px`,
                height: `${20 + i * 20}px`,
                top: `${10 + i * 10}%`,
                left: `${5 + i * 12}%`,
                opacity: 0.05 + (i * 0.05)
              }}
            />
          ))}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative max-w-5xl mx-auto"
        >
          <motion.div
            variants={bounceIn}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-10"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <FaRocket className="text-yellow-300 text-base" />
            </motion.div>
            <span className="text-sm font-medium tracking-wider text-white">All-in-One Platform</span>
          </motion.div>
         
          <motion.h1
            variants={textRevealVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
              Everything You Need
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-100 to-white bg-clip-text text-transparent">
              In One Place
            </span>
          </motion.h1>
         
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl mb-12 max-w-2xl mx-auto opacity-95 leading-relaxed text-white"
          >
            Discover amazing products, grow your business, or join our delivery network —
            experience the future of commerce today.
          </motion.p>
         
          <motion.div
            variants={containerVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div variants={itemVariants}>
              <motion.div
                variants={pulseGlow}
                initial="initial"
                animate="pulse"
              >
                <Link
                  to="/customer/home"
                  className="group px-8 py-4 bg-white text-[#026a4b] font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 text-base hover:shadow-lg hover:scale-105"
                >
                  <FaShoppingBag className="text-lg" />
                  <span>Start Shopping</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </motion.div>
            </motion.div>
           
            <motion.div variants={itemVariants}>
              <Link
                to="/vendor"
                className="group px-8 py-4 border border-white/50 text-white font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 flex items-center gap-3 text-base hover:bg-white/10"
              >
                <FaStore className="text-lg" />
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
        className="relative py-16 px-6"
        style={{
          backgroundColor: getColor('bg'),
        }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ color: getTextColor() }}
            >
              Why Choose Qwikko?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg max-w-2xl mx-auto"
              style={{ color: getLightGrayColor() }}
            >
              Experience the future of commerce with our all-in-one platform designed for everyone
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
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
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                className="group relative rounded-2xl p-6 border backdrop-blur-sm transition-all duration-500 h-full flex flex-col hover:shadow-lg hover:border-opacity-70"
                style={{
                  backgroundColor: getCardColor(),
                  borderColor: getBorderColor(),
                }}
              >
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="p-4 rounded-xl border backdrop-blur-sm transition-colors duration-300"
                      style={{
                        backgroundColor: getInnerDivColor(),
                        borderColor: getBorderColor(),
                      }}
                    >
                      <card.icon className="text-xl" style={{ color: getIconColor() }} />
                    </div>
                    <h3
                      className="text-xl font-bold flex-1"
                      style={{ color: getTextColor() }}
                    >
                      {card.title}
                    </h3>
                  </div>
                 
                  <p className="text-base mb-6 leading-relaxed flex-1" style={{ color: getLightGrayColor() }}>
                    {card.desc}
                  </p>
                 
                  <div className="space-y-3 mb-6 flex-1">
                    {card.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg backdrop-blur-sm transition-all duration-300 hover:shadow-md border border-transparent hover:border-opacity-30"
                        style={{
                          backgroundColor: getInnerDivColor(),
                          borderColor: getBorderColor(),
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center border backdrop-blur-sm transition-colors duration-300"
                          style={{
                            backgroundColor: getCardColor(),
                            borderColor: getBorderColor()
                          }}
                        >
                          <feature.icon className="text-base" style={{ color: getIconColor() }} />
                        </div>
                        <span style={{ color: getTextColor() }} className="font-medium text-sm">
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                 
                  <div className="mt-auto">
                    <Link
                      to={card.link}
                      className="group w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-md"
                      style={{
                        backgroundColor: getButtonColor(),
                        color: "#ffffff",
                      }}
                    >
                      <span className="text-sm">{card.btn}</span>
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300 text-xs" />
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
        className="py-16 px-6 max-w-5xl mx-auto"
        style={{
          backgroundColor: getColor('bg'),
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            variants={bounceIn}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border backdrop-blur-sm mb-10 transition-colors duration-300"
            style={{
              backgroundColor: getCardColor(),
              borderColor: getBorderColor(),
            }}
          >
            <FaShieldAlt style={{ color: getIconColor() }} className="text-lg" />
            <span className="font-bold text-lg" style={{ color: getTextColor() }}>Trust & Security</span>
          </motion.div>
         
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ color: getTextColor() }}
          >
            Built on Trust & Innovation
          </motion.h2>
         
          <motion.p
            variants={fadeInUp}
            className="text-lg mb-10 max-w-2xl mx-auto"
            style={{ color: getLightGrayColor() }}
          >
            Our platform is built with cutting-edge technology and security measures to ensure your experience is safe, seamless, and exceptional.
          </motion.p>
         
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12"
          >
            {[
              {
                icon: FaShieldAlt,
                title: "Secure Transactions",
                desc: "Bank-level encryption and secure payment processing for all your transactions with 24/7 monitoring",
              },
              {
                icon: FaStar,
                title: "Premium Experience",
                desc: "Carefully crafted user experience that puts your needs and satisfaction first with intuitive design",
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="p-6 rounded-2xl text-center border backdrop-blur-sm h-full flex flex-col hover:shadow-lg transition-all duration-300 hover:border-opacity-70"
                style={{
                  backgroundColor: getCardColor(),
                  borderColor: getBorderColor(),
                }}
              >
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center border backdrop-blur-sm transition-colors duration-300"
                  style={{
                    backgroundColor: getInnerDivColor(),
                    borderColor: getBorderColor()
                  }}
                >
                  <item.icon className="text-2xl" style={{ color: getIconColor() }} />
                </div>
                <h3 
                  className="text-xl font-bold mb-3 flex-1"
                  style={{ color: getTextColor() }}
                >
                  {item.title}
                </h3>
                <p style={{ color: getLightGrayColor() }} className="text-sm leading-relaxed flex-1">
                  {item.desc}
                </p>
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
        className="py-20 px-6 text-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${getButtonColor()} 0%, #014d34 50%, ${getButtonColor()} 100%)`,
          backgroundSize: "200% 200%",
        }}
      >
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold mb-6 text-white"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg mb-10 text-white/95 max-w-xl mx-auto leading-relaxed"
          >
            Join our community and transform your shopping and business experience today
          </motion.p>
          <motion.div
            variants={containerVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div variants={itemVariants}>
              <Link
                to="/customer/home"
                className="group px-8 py-4 bg-white text-[#026a4b] font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 text-base hover:shadow-lg hover:scale-105"
              >
                <FaShoppingBag className="text-lg" />
                Start Shopping Now
                <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link
                to="/vendor"
                className="group px-8 py-4 border border-white text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 text-base hover:bg-white/15"
              >
                <FaStore className="text-lg" />
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