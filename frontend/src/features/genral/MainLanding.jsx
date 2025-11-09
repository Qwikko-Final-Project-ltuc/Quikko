import React from "react";
import { motion } from "framer-motion";
import { FaShoppingBag, FaStore, FaTruck, FaArrowRight, FaRocket, FaShieldAlt, FaBrain, FaGlobe } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

// Advanced Animation Variants
const quantumEntrance = {
  hidden: { 
    opacity: 0,
    scale: 0.8,
    y: 100
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      duration: 1.2
    }
  }
};

const holographicFloat = {
  holographic: {
    y: [-8, 8, -8],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const neuralNetwork = {
  animate: {
    backgroundPosition: ["0% 0%", "100% 100%"],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const particleStorm = {
  animate: (i) => ({
    x: [0, Math.random() * 100 - 50],
    y: [0, Math.random() * 100 - 50],
    scale: [0, 1, 0],
    opacity: [0, 0.6, 0],
    transition: {
      duration: 2 + Math.random() * 2,
      repeat: Infinity,
      delay: i * 0.1,
      ease: "easeOut"
    }
  })
};

const morphingGradient = {
  animate: {
    background: [
      "linear-gradient(45deg, var(--button), #1e293b)",
      "linear-gradient(135deg, var(--button), #1e293b)",
      "linear-gradient(225deg, var(--button), #1e293b)",
      "linear-gradient(315deg, var(--button), #1e293b)"
    ],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const cyberGlitch = {
  initial: { 
    opacity: 0,
    y: 30
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const LoadingSpinner = () => {
  const themeMode = useSelector((state) => state.customerTheme.mode);
  
  return (
    <div className={`min-h-screen relative overflow-hidden flex items-center justify-center ${
      themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-[var(--mid-dark)]'
    }`}>
      {/* Quantum Particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={particleStorm}
          animate="animate"
          className="absolute w-1 h-1 bg-[var(--button)] rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
      
      <div className="text-center relative z-10">
        <motion.div
          variants={quantumEntrance}
          initial="hidden"
          animate="visible"
          className="relative mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[var(--button)] to-gray-900 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-[var(--button)]/30">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-2xl text-white"
            >
              ⚡
            </motion.div>
          </div>
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-br from-[var(--button)] to-gray-900 rounded-full blur-lg"
          />
        </motion.div>
        
        <motion.p
          variants={cyberGlitch}
          initial="initial"
          animate="animate"
          className={`text-xl font-bold ${
            themeMode === 'dark' ? 'text-[var(--text)]' : 'text-white'
          }`}
        >
          INITIALIZING QWIKKO...
        </motion.p>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const themeMode = useSelector((state) => state.customerTheme.mode);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className={`min-h-screen font-sans overflow-x-hidden ${
        themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-[var(--bg)]'
      } text-[var(--text)]`}
    >
      {/* 🌌 Quantum Hero Section */}
      <motion.section
        variants={morphingGradient}
        animate="animate"
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden"
      >
        {/* Neural Network Background */}
        <motion.div
          variants={neuralNetwork}
          animate="animate"
          className="absolute inset-0 opacity-10"
          style={{
            background: "linear-gradient(90deg, transparent 0%, var(--button) 50%, transparent 100%)",
            backgroundSize: "200% 200%",
          }}
        />
        
        {/* Holographic Grid */}
        <div className="absolute inset-0 opacity-5">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: [0, 50, 0],
                opacity: [0.05, 0.2, 0.05],
              }}
              transition={{
                duration: 3 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.1
              }}
              className="absolute h-px bg-gradient-to-r from-[var(--button)] to-gray-900"
              style={{ top: `${i * 7}%`, width: "100%" }}
            />
          ))}
        </div>

        <motion.div
          variants={quantumEntrance}
          className="relative text-center max-w-4xl mx-auto"
        >
          {/* Cyber Badge */}
          <motion.div
            variants={holographicFloat}
            animate="holographic"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-[var(--button)] to-gray-900 backdrop-blur-sm border border-[var(--button)]/30 mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <FaRocket className="text-white text-sm" />
            </motion.div>
            <span className="text-white font-semibold tracking-wide text-xs uppercase">
              Next Generation Platform
            </span>
          </motion.div>
          
          {/* Main Heading */}
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-4xl sm:text-6xl md:text-7xl font-black mb-4 leading-tight text-white"
            >
              QWIKKO
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg sm:text-xl md:text-2xl text-white/90 font-light tracking-wide"
            >
              REVOLUTIONARY COMMERCE EXPERIENCE
            </motion.p>
          </div>
          
          {/* Holographic Description */}
          <motion.p
            variants={holographicFloat}
            animate="holographic"
            className="text-base sm:text-lg md:text-xl mb-10 max-w-2xl mx-auto text-white/80 leading-relaxed font-light"
          >
            Discover the future of shopping, business, and delivery. 
            Advanced technology meets exceptional user experience.
          </motion.p>
          
          {/* Quantum Action Buttons */}
          <motion.div
            variants={quantumEntrance}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 0 20px var(--button)"
              }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-6 py-3 bg-gradient-to-br from-[var(--button)] to-gray-900 text-white font-semibold rounded-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Link to="/customer/home" className="relative z-10 flex items-center gap-2 text-sm sm:text-base">
                <FaShoppingBag className="text-lg" />
                <span>Explore Store</span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <FaArrowRight className="text-sm" />
                </motion.div>
              </Link>
            </motion.button>

            <motion.button
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 0 20px var(--button)"
              }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-6 py-3 border border-[var(--button)] text-white font-semibold rounded-lg bg-gradient-to-br from-gray-900/50 to-[var(--button)]/20 backdrop-blur-sm overflow-hidden"
            >
              <div className="absolute inset-0 bg-[var(--button)]/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <Link to="/vendor" className="relative z-10 flex items-center gap-2 text-sm sm:text-base">
                <FaStore className="text-lg" />
                <span>Start Business</span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                >
                  <FaArrowRight className="text-sm" />
                </motion.div>
              </Link>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Floating Quantum Elements */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={particleStorm}
            animate="animate"
            className="absolute w-1.5 h-1.5 bg-[var(--button)] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </motion.section>

      {/* 🚀 Premium Features Section */}
      <section className={`relative py-16 px-4 sm:px-6 ${
        themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-[var(--bg)]'
      }`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-black mb-6 text-[var(--text)]">
              PREMIUM FEATURES
            </h2>
            <p className="text-lg text-[var(--text)] max-w-2xl mx-auto font-light opacity-80">
              Advanced capabilities designed for modern commerce needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FaBrain,
                title: "Smart Shopping",
                desc: "Intelligent recommendations and personalized shopping experience",
                features: ["AI Personalization", "Smart Search", "Wishlist Sync"]
              },
              {
                icon: FaShieldAlt,
                title: "Secure Commerce", 
                desc: "Enterprise-grade security for all your transactions and data",
                features: ["Encrypted Payments", "Data Protection", "Fraud Prevention"]
              },
              {
                icon: FaGlobe,
                title: "Global Delivery",
                desc: "Worldwide shipping with real-time tracking and smart logistics",
                features: ["Live Tracking", "Fast Shipping", "Global Coverage"]
              },
              {
                icon: FaStore,
                title: "Vendor Platform",
                desc: "Complete business solution with analytics and management tools",
                features: ["Sales Analytics", "Inventory Management", "Customer Insights"]
              },
              {
                icon: FaTruck,
                title: "Fast Delivery",
                desc: "Optimized delivery routes and multiple shipping options",
                features: ["Express Delivery", "Route Optimization", "Multiple Carriers"]
              },
              {
                icon: FaRocket,
                title: "Innovation",
                desc: "Constantly evolving platform with cutting-edge features",
                features: ["Regular Updates", "New Features", "Tech Advancements"]
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  y: -5,
                }}
                className={`group relative rounded-xl p-6 border transition-all duration-300 ${
                  themeMode === 'dark' 
                    ? 'bg-[var(--div)] border-[var(--border)] hover:border-[var(--button)]' 
                    : 'bg-[var(--textbox)] border-[var(--border)] hover:border-[var(--button)]'
                }`}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--button)] to-gray-900 shadow-md">
                      <card.icon className="text-lg text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text)]">
                      {card.title}
                    </h3>
                  </div>
                  
                  <p className="text-[var(--text)] mb-4 leading-relaxed text-sm opacity-80">
                    {card.desc}
                  </p>
                  
                  <div className="space-y-2">
                    {card.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-2 text-[var(--text)]"
                      >
                        <div className="w-1.5 h-1.5 bg-[var(--button)] rounded-full" />
                        <span className="text-sm font-medium opacity-90">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ⚡ Professional CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 bg-gradient-to-br from-[var(--button)] to-gray-900 overflow-hidden">
        <motion.div
          variants={morphingGradient}
          animate="animate"
          className="absolute inset-0"
        />
        
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-5xl font-black mb-6 text-white"
          >
            READY TO
            <br />
            <span className="text-white">
              GET STARTED?
            </span>
          </motion.h2>
          
          <motion.p
            variants={holographicFloat}
            animate="holographic"
            className="text-lg text-white/80 mb-10 max-w-xl mx-auto"
          >
            Join thousands of satisfied users experiencing modern commerce
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 0 25px var(--button)"
              }}
              className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg text-base relative overflow-hidden hover:bg-gray-50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
              <Link to="/customer/home" className="relative z-10 flex items-center gap-2">
                <FaShoppingBag />
                GET STARTED
              </Link>
            </motion.button>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}