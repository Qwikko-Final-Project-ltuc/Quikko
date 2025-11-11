import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaClipboardList,
  FaChartLine,
  FaUsers,
  FaDollarSign,
  FaRobot,
  FaArrowRight,
  FaPlay,
  FaRocket,
  FaShieldAlt,
  FaLightbulb,
} from "react-icons/fa";
import { fetchLandingCMS } from "./Api/LandingAPI";
import { useSelector, useDispatch } from "react-redux";
import { setTheme } from "./deliveryThemeSlice";
import ChatBot from "../Layout/ChatBot";
import { X, Star, TrendingUp, Target, Zap } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 14 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 130, damping: 15 },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const floatingAnimation = {
  floating: {
    y: [-15, 15, -15],
    rotate: [0, 2, 0],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
  },
};

const pulseGlow = {
  pulse: {
    boxShadow: [
      "0 0 0 0 rgba(2, 106, 75, 0.4)",
      "0 0 0 15px rgba(2, 106, 75, 0)",
      "0 0 0 0 rgba(2, 106, 75, 0)",
    ],
    transition: { duration: 2, repeat: Infinity },
  },
};

export default function LandingPage() {
  const [cmsContent, setCmsContent] = useState(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [activeBenefit, setActiveBenefit] = useState(0);
  const isDark = useSelector((s) => s.deliveryTheme.darkMode);
  const dispatch = useDispatch();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const toggleChat = () => setIsChatOpen((v) => !v);

  const colors = {
    bg: isDark ? "#1a1f1d" : "#ffffff",
    textbox: "#ffffff",
    text: isDark ? "#f5f5f5" : "#1a1f1d",
    textSecondary: isDark ? "#a0a0a0" : "#5a6c65",
    div: isDark ? "#2a2a2a" : "#f8faf9",
    border: isDark ? "#404040" : "#e0e6e3",
    button: "#026a4b",
    buttonHover: "#015c40",
    gradientStart: "#026a4b",
    gradientEnd: "#014d34",
    accent: "#00d4aa",
  };

  // Auto-rotate benefits
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBenefit((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 3D tilt effect
  const cardRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 150, damping: 20 });
  const smy = useSpring(my, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(smy, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(smx, [-0.5, 0.5], [-8, 8]);

  function handleMouseMove(e) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    mx.set(px - 0.5);
    my.set(py - 0.5);
  }

  function handleMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  // Load CMS
  useEffect(() => {
    async function loadCMS() {
      const data = await fetchLandingCMS("delivery", "Landing Page");
      setCmsContent(data);
      const raw = String(data?.content ?? "").trim();
      if (raw.includes("@")) {
        const [maybeTitle, ...rest] = raw.split("@");
        const parsedTitle = (maybeTitle || data?.title || "").trim();
        const parsedSub = rest.join("@").trim() || (data?.subtitle ?? "");
        setTitle(parsedTitle || "Welcome to Qwikko Delivery");
        setSubtitle(parsedSub);
      } else {
        const parsedTitle = (data?.title || "").trim();
        const parsedSub = (raw || data?.subtitle || "").trim();
        setTitle(parsedTitle || "Welcome to Qwikko Delivery");
        setSubtitle(parsedSub);
      }
    }
    loadCMS();
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history)
      window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("deliveryTheme");
    dispatch(setTheme(savedTheme === "dark"));
  }, [dispatch]);

  // Scroll lock for chat
  useEffect(() => {
    if (isChatOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isChatOpen]);

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Enhanced Hero Section - Reduced Height */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative overflow-hidden min-h-[90vh] flex items-center"
        style={{
          background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 50%, ${colors.gradientStart} 100%)`,
          backgroundSize: "400% 400%",
          animation: "gradientShift 15s ease infinite",
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              variants={floatingAnimation}
              animate="floating"
              transition={{ delay: i * 0.5 }}
              className="absolute bg-white/10 rounded-full backdrop-blur-sm"
              style={{
                width: `${20 + i * 15}px`,
                height: `${20 + i * 15}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0.05 + i * 0.02,
              }}
            />
          ))}
        </div>

        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(${colors.button} 1px, transparent 1px),
                             linear-gradient(90deg, ${colors.button} 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image moved to left side */}
            <motion.div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl h-full flex items-center">
                {cmsContent?.image_url ? (
                  <motion.img
                    src={cmsContent.image_url}
                    alt="Delivery Platform Dashboard"
                    className="w-full h-auto max-h-[400px] object-cover"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  />
                ) : (
                  <div 
                    className="w-full aspect-video flex items-center justify-center rounded-3xl"
                    style={{ backgroundColor: colors.button + '20' }}
                  >
                    <div className="text-center space-y-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 mx-auto border-4 border-white/30 border-t-white rounded-full"
                      />
                      <p className="text-white/80 font-medium">Loading Preview</p>
                    </div>
                  </div>
                )}
                
                {/* Floating elements overlay */}
                <motion.div
                  variants={floatingAnimation}
                  animate="floating"
                  className="absolute top-8 right-8 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center"
                >
                  <TrendingUp className="text-white" size={32} />
                </motion.div>
              </div>
            </motion.div>

            {/* Content Side - now on right */}
            <motion.div
              variants={containerVariants}
              className="text-center lg:text-left space-y-6 order-1 lg:order-2"
            >
              <motion.div variants={itemUp} className="space-y-2">
                <motion.div
                  variants={pulseGlow}
                  animate="pulse"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm"
                >
                  <Zap size={16} className="text-white" />
                  <span className="text-white/90 text-sm font-medium">
                    Enterprise Delivery Platform
                  </span>
                </motion.div>
              </motion.div>

              <motion.h1
                variants={itemUp}
                className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight"
              >
                <span className="bg-gradient-to-r from-white via-green-100 to-white bg-clip-text text-transparent">
                  {title || "Qwikko Delivery"}
                </span>
              </motion.h1>

              <motion.p
                variants={itemUp}
                className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light"
              >
                {subtitle && subtitle.trim().length > 0
                  ? subtitle
                  : "Transform your delivery operations with intelligent logistics solutions"}
              </motion.p>

              <motion.div
                variants={containerVariants}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.div
                  variants={itemUp}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/delivery/login"
                    className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl text-base font-semibold shadow-xl transition-all duration-300 hover:shadow-2xl"
                    style={{
                      backgroundColor: "#ffffff",
                      color: colors.button,
                    }}
                  >
                    <span>Get Started</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-8 border-2 border-white/50 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-2 bg-white/70 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Process Section - Reduced Padding */}
      <section className="relative py-12 lg:py-16"> {/* تم تقليل الـ padding بشكل أكبر */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="text-center mb-12" /* تم تقليل الـ margin */
          >
            <motion.div variants={itemUp} className="inline-flex items-center gap-2 mb-4">
              <Target className={isDark ? "text-white" : "text-[#026a4b]"} />
              <span className={`text-sm font-semibold uppercase tracking-wider ${
                isDark ? "text-white/70" : "text-[#026a4b]/70"
              }`}>
                Process
              </span>
            </motion.div>
            <motion.h2
              variants={itemUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6"
              style={{ color: isDark ? "#ffffff" : colors.button }}
            >
              How It Works
            </motion.h2>
            <motion.p
              variants={itemUp}
              className={`text-lg max-w-3xl mx-auto leading-relaxed ${
                isDark ? "text-white/80" : "text-gray-600"
              }`}
            >
              Streamline your delivery operations in three simple steps
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-20 left-1/2 transform -translate-x-1/2 w-2/3 h-1">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="w-full h-full"
                style={{ backgroundColor: colors.button + '40' }}
              />
            </div>

            {[
              {
                step: "01",
                title: "Register Your Company",
                description: "Quick setup with automated verification process",
                icon: FaRocket,
                color: "#026a4b",
              },
              {
                step: "02",
                title: "Define Delivery Zones",
                description: "Smart mapping with real-time coverage optimization",
                icon: FaShieldAlt,
                color: "#028a6b",
              },
              {
                step: "03",
                title: "Manage Orders & Grow",
                description: "Advanced analytics and automated dispatch system",
                icon: FaLightbulb,
                color: "#02aa8b",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={scaleIn}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative group"
              >
                <div
                  className="relative rounded-2xl p-6 backdrop-blur-sm border transition-all duration-500 group-hover:shadow-xl"
                  style={{
                    backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
                    borderColor: isDark ? "#404040" : colors.border,
                    background: isDark 
                      ? "linear-gradient(145deg, #2a2a2a, #1f1f1f)"
                      : "linear-gradient(145deg, #ffffff, #f8faf9)",
                  }}
                >
                  {/* Step Number */}
                  <motion.div
                    className="absolute -top-3 -left-3 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-lg"
                    style={{ backgroundColor: item.color }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {item.step}
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: item.color + '20' }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <item.icon className="text-xl" style={{ color: item.color }} />
                  </motion.div>

                  {/* Content */}
                  <h3 className={`text-xl font-bold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    {item.title}
                  </h3>
                  <p className={`leading-relaxed text-sm ${
                    isDark ? "text-white/70" : "text-gray-600"
                  }`}>
                    {item.description}
                  </p>

                  {/* Hover Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${item.color}20, transparent)`,
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Reduced Padding */}
      <section className="relative py-12 lg:py-16 overflow-hidden"> {/* تم تقليل الـ padding بشكل أكبر */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="text-center mb-12" /* تم تقليل الـ margin */
          >
            <motion.div variants={itemUp} className="inline-flex items-center gap-2 mb-4">
              <Star className={isDark ? "text-white" : "text-[#026a4b]"} />
              <span className={`text-sm font-semibold uppercase tracking-wider ${
                isDark ? "text-white/70" : "text-[#026a4b]/70"
              }`}>
                Benefits
              </span>
            </motion.div>
            <motion.h2
              variants={itemUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6"
              style={{ color: isDark ? "#ffffff" : colors.button }}
            >
              Why Choose Us
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                Icon: FaClipboardList,
                title: "Smart Order Management",
                description: "AI-powered dispatch and real-time tracking",
                stats: "95% faster processing",
              },
              {
                Icon: FaChartLine,
                title: "Advanced Analytics",
                description: "Deep insights with predictive analytics",
                stats: "30% cost reduction",
              },
              {
                Icon: FaUsers,
                title: "Market Expansion",
                description: "Access to thousands of potential customers",
                stats: "3x growth potential",
              },
              {
                Icon: FaDollarSign,
                title: "Financial Security",
                description: "Guaranteed payments and financial transparency",
                stats: "24h payments",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={itemUp}
                whileHover={{ y: -6, scale: 1.02 }}
                onHoverStart={() => setActiveBenefit(index)}
                className={`relative rounded-2xl p-6 border-2 transition-all duration-500 cursor-pointer ${
                  activeBenefit === index ? 'shadow-xl' : 'shadow-lg'
                }`}
                style={{
                  backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
                  borderColor: activeBenefit === index ? colors.button : (isDark ? "#404040" : colors.border),
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Background Glow */}
                {activeBenefit === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: `radial-gradient(circle at center, ${colors.button}15, transparent 70%)`,
                    }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-500 ${
                    activeBenefit === index ? 'scale-105' : ''
                  }`}
                  style={{
                    backgroundColor: activeBenefit === index ? colors.button : colors.button + '20',
                    color: activeBenefit === index ? '#ffffff' : colors.button,
                  }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <benefit.Icon className="text-lg" />
                </motion.div>

                {/* Content */}
                <h3 className={`text-lg font-bold mb-2 transition-colors duration-500 ${
                  activeBenefit === index ? 'text-[#026a4b]' : (isDark ? 'text-white' : 'text-gray-900')
                }`}>
                  {benefit.title}
                </h3>
                <p className={`mb-3 leading-relaxed text-sm transition-colors duration-500 ${
                  activeBenefit === index ? 'text-[#026a4b]/90' : (isDark ? 'text-white/70' : 'text-gray-600')
                }`}>
                  {benefit.description}
                </p>
                <div className={`text-xs font-semibold transition-colors duration-500 ${
                  activeBenefit === index ? 'text-[#026a4b]' : (isDark ? 'text-white/50' : 'text-gray-500')
                }`}>
                  {benefit.stats}
                </div>

                {/* Indicator */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: activeBenefit === index ? 1 : 0 }}
                  className="absolute top-3 right-3 w-2 h-2 rounded-full"
                  style={{ backgroundColor: colors.button }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Chat FAB - Circular */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-50 transition-all duration-300 group"
        style={{
          backgroundColor: colors.button,
          color: "#fff",
          boxShadow: `0 8px 32px ${colors.button}40`,
        }}
        title="Open Qwikko Chatbot"
        aria-label="Open Qwikko Chatbot"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FaRobot className="text-xl" />
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: isChatOpen ? 1 : 0 }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
        />
      </motion.button>

      {/* Enhanced Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-8 md:right-8 md:bottom-8 md:left-auto w-full md:w-96 h-full md:h-[calc(100vh-4rem)] rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50"
            style={{
              backgroundColor: colors.div,
              color: colors.text,
            }}
          >
            {/* Header */}
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="flex items-center justify-between px-6 py-4"
              style={{
                backgroundColor: colors.bg,
                boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
              }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.button }}
                >
                  <FaRobot className="text-white text-sm" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-semibold">Qwikko Assistant</h2>
                  <p className="text-xs opacity-70">Always here to help</p>
                </div>
              </div>
              <motion.button
                onClick={toggleChat}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full transition-colors"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.textSecondary,
                }}
              >
                <X size={20} />
              </motion.button>
            </motion.div>

            {/* Chat Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-grow overflow-hidden"
              style={{ backgroundColor: colors.bg }}
            >
              <ChatBot userId="guest" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}