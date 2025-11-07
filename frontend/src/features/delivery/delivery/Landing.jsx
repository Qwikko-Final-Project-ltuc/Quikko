import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaClipboardList,
  FaChartLine,
  FaUsers,
  FaDollarSign,
  FaRobot,
} from "react-icons/fa";
import { fetchLandingCMS } from "./Api/LandingAPI";
import { useSelector, useDispatch } from "react-redux";
import { setTheme } from "./deliveryThemeSlice";
import ChatBot from "../Layout/ChatBot";
import { X } from "lucide-react";

// ===== Animations =====
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.18 } },
};

const itemUp = {
  hidden: { opacity: 0, y: 38 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 16 },
  },
};

const textReveal = {
  hidden: { opacity: 0, y: 80 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 110, damping: 14, duration: 0.9 },
  },
};

const gradientVariants = {
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: { duration: 10, repeat: Infinity, ease: "linear" },
  },
};

const floatingBubble = {
  floating: {
    y: [-22, 22, -22],
    rotate: [0, 3, 0],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
};

const pulse = {
  initial: { boxShadow: "0 0 0 0 rgba(2,106,75,0.6)" },
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(2,106,75,0.6)",
      "0 0 0 18px rgba(2,106,75,0)",
      "0 0 0 0 rgba(2,106,75,0)",
    ],
    transition: { duration: 2.6, repeat: Infinity, ease: "easeOut" },
  },
};

export default function LandingPage() {
  const [cmsContent, setCmsContent] = useState(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  const isDark = useSelector((s) => s.deliveryTheme.darkMode);
  const dispatch = useDispatch();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const toggleChat = () => setIsChatOpen((v) => !v);

  // unified colors (from your main landing)
  const colors = {
    bg: isDark ? "#0a0a0a" : "#ffffff",
    textbox: "#ffffff",
    text: isDark ? "#f5f5f5" : "#1a1f1d",
    textSecondary: isDark ? "#a0a0a0" : "#5a6c65",
    div: isDark ? "#2a2a2a" : "#e8ecea",
    border: isDark ? "#404040" : "#d0d9d5",
    button: "#026a4b",
    buttonHover: "#015c40",
    gradientStart: "#026a4b",
    gradientEnd: "#014d34",
  };

  // ===== 3D Tilt for hero image =====
  const cardRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 150, damping: 20 });
  const smy = useSpring(my, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(smy, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(smx, [-0.5, 0.5], [-10, 10]);
  const floatY = useMotionValue(0); // subtle float
  const sFloatY = useSpring(floatY, { stiffness: 60, damping: 15 });

  function handleMouseMove(e) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0 → 1
    const py = (e.clientY - rect.top) / rect.height;
    mx.set(px - 0.5);
    my.set(py - 0.5);
  }
  function handleMouseLeave() {
    mx.set(0);
    my.set(0);
  }

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
      // ما في @ → استخدمي title من الحقل المخصص والـ subtitle من content/subtitle
      const parsedTitle = (data?.title || "").trim();
      const parsedSub = (raw || data?.subtitle || "").trim();

      setTitle(parsedTitle || "Welcome to Qwikko Delivery");
      setSubtitle(parsedSub);
    }

    // Debug: شو القيم اللي طلعَت؟
    // eslint-disable-next-line no-console
    console.log("CMS parsed:", {
      titleAfter: (data?.title || "").trim(),
      contentRaw: raw,
      subtitleAfter: raw.includes("@")
        ? raw.split("@").slice(1).join("@").trim()
        : (raw || data?.subtitle || "").trim(),
    });
  }
  loadCMS();
}, []);



  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("deliveryTheme");
    dispatch(setTheme(savedTheme === "dark"));
  }, [dispatch]);

  return (
    <>
      {/* ===== HERO with animated gradient & floating bubbles ===== */}
      <motion.section
        variants={gradientVariants}
        animate="animate"
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientEnd} 50%, ${colors.gradientStart} 100%)`,
          backgroundSize: "400% 400%",
          color: "#ffffff",
        }}
      >
        {/* floating bubbles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              variants={floatingBubble}
              animate="floating"
              transition={{ delay: i * 0.6 }}
              className="absolute bg-white/10 rounded-full backdrop-blur-sm"
              style={{
                width: `${26 + i * 24}px`,
                height: `${26 + i * 24}px`,
                top: `${12 + i * 12}%`,
                left: `${6 + i * 15}%`,
                opacity: 0.08 + i * 0.09,
              }}
            />
          ))}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="relative max-w-screen-xl mx-auto px-4 sm:px-6 md:px-12 py-16 sm:py-20 md:py-24"
        >
          {/* tag chip */}
          <motion.div variants={itemUp}></motion.div>

          {/* grid: text + image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
            {/* text */}
            <div className="order-2 md:order-1 text-center md:text-left  relative z-30">
              <motion.h1
                variants={textReveal}
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight"
                style={{ lineHeight: "1.2" }}
              >
                <span className="bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                  {title || "Welcome to Qwikko Delivery"}
                </span>
              </motion.h1>
              <motion.h6
                variants={itemUp}
                className="mt-4 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto md:mx-0"
                style={{
                  color: "rgba(255,255,255,0.98)",
                  position: "relative",
                  zIndex: 40,
                  textShadow: "0 2px 6px rgba(0,0,0,0.45)",
                }}
              >
                {subtitle && subtitle.trim().length > 0
                  ? subtitle
                  : "Laoding."}
              </motion.h6>

              {/* === CTA (Start Now) - Drop-in Replacement === */}
              <motion.div
                variants={containerVariants}
                className="flex items-center justify-center md:justify-start gap-3 sm:gap-4 pt-4"
              >
                {/* زر أساسي */}
                <motion.div
                  variants={itemUp}
                  whileHover={{ y: -2, scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                  style={{ zIndex: 40 }} // فوق أي فقاعات/خلفيات
                >
                  {/* نبض اختياري: فعّليه بإزالة التعليق */}
                  {/* <span className="absolute inset-0 rounded-lg animate-ping opacity-20" style={{ backgroundColor: "#ffffff" }} /> */}

                  <Link
                    to="/delivery/login"
                    aria-label="Start Now"
                    className="
        inline-flex items-center justify-center
        px-6 sm:px-8 md:px-10
        py-3 sm:py-3.5 md:py-4
        rounded-lg text-base sm:text-lg font-semibold
        shadow-lg transition-all duration-300
        hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/70
      "
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#026a4b",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
                    }}
                  >
                    Start Now
                  </Link>
                </motion.div>

                {/* (اختياري) زر ثانوي — احذفيه إن ما بدك ياه */}
                {/* 
  <motion.div
    variants={itemUp}
    whileHover={{ y: -2, scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
  >
    <Link
      to="/delivery/about"
      className="
        inline-flex items-center justify-center
        px-5 sm:px-6 md:px-8 py-3
        rounded-lg text-sm sm:text-base font-semibold
        border transition-all duration-300
        hover:bg-white/10
        focus:outline-none focus:ring-2 focus:ring-white/60
      "
      style={{
        color: "#ffffff",
        borderColor: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(2px)",
      }}
    >
      Learn More
    </Link>
  </motion.div>
  */}
              </motion.div>
            </div>

            {/* image: show FULL image with NO background behind it */}
            <div className="order-1 md:order-2 w-full flex items-center justify-center">
              <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  rotateX,
                  rotateY,
                  y: sFloatY,
                  transformStyle: "preserve-3d",
                }}
                className="w-full flex items-center justify-center bg-transparent"
              >
                {cmsContent?.image_url ? (
                  <motion.img
                    src={cmsContent.image_url}
                    alt="Landing visual"
                    className="
          w-full h-auto
          max-h-64 sm:max-h-80 md:max-h-[420px] lg:max-h-[480px]
          object-contain rounded-2xl
        "
                    whileHover={{ scale: 1.015 }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    style={{ willChange: "transform" }}
                  />
                ) : (
                  // ✅ خلفية شفافة بالكامل، بدون بوردر أو لون
                  <div className="w-full h-[280px] sm:h-[320px] md:h-[420px] lg:h-[480px] flex items-center justify-center bg-transparent">
                    <span className="text-white/80">Loading image...</span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* ===== HOW IT WORKS ===== */}
      <section
        className="w-full max-w-6xl px-4 sm:px-6 md:p-10 mt-6 md:mt-10 text-center mx-auto"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        <motion.h2
          variants={itemUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-12 md:mb-16"
          style={{ color: isDark ? "#ffffff" : colors.button }}
        >
          How It Works
        </motion.h2>

        <div className="relative">
          {/* connector line */}
          <div
            className="hidden md:block absolute left-0 right-0 h-[3px]"
            style={{
              top: "28px",
              backgroundColor: isDark ? "#ffffff" : colors.button,
              opacity: 0.25,
            }}
          />

          {/* numbering bubbles with pulse */}
          <div className="grid grid-cols-3 gap-6 sm:gap-10 md:gap-16 mb-4 sm:mb-6">
            {["1", "2", "3"].map((step, idx) => (
              <motion.div
                key={idx}
                className="flex justify-center"
                variants={itemUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <motion.div
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full text-sm sm:text-base md:text-lg font-bold z-10 shadow-md"
                  style={{ backgroundColor: colors.button, color: "#fff" }}
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: idx * 0.2,
                  }}
                >
                  {step}
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* cards with hover float/rotate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10 md:gap-16 justify-items-center">
            {[
              {
                title: "Register your company",
                desc: "Sign up quickly and create your business account.",
              },
              {
                title: "Set up your delivery zones",
                desc: "Define the areas where your company will operate and deliver.",
              },
              {
                title: "Start receiving orders",
                desc: "Track and deliver orders smoothly and grow your business.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={itemUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                whileHover={{ y: -6, rotate: 0.25 }}
                transition={{ type: "spring", stiffness: 140, damping: 12 }}
                className="flex flex-col items-center text-center w-full"
                style={{
                  maxWidth: "22rem",
                  backgroundColor: isDark ? "#1a1a1a" : "#f8faf9",
                  color: isDark ? "#ffffff" : colors.button,
                  borderRadius: "1rem",
                  border: `1px solid ${isDark ? colors.border : colors.button}`,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  padding: "1.5rem",
                }}
              >
                <p className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">
                  {item.title}
                </p>
                <p
                  className="text-sm leading-relaxed opacity-90"
                  style={{ color: isDark ? "#eaeaea" : colors.button }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section
        className="w-full max-w-6xl px-4 sm:px-6 md:p-10 mt-6 mb-20 md:mb-24 text-center mx-auto"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        <motion.h2
          variants={itemUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 sm:mb-12 md:mb-16"
          style={{ color: isDark ? "#ffffff" : colors.button }}
        >
          Benefits
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 justify-items-center">
          {[
            { Icon: FaClipboardList, text: "Manage orders easily" },
            { Icon: FaChartLine, text: "Accurate reports and statistics" },
            { Icon: FaUsers, text: "Reach thousands of customers & stores" },
            { Icon: FaDollarSign, text: "Guaranteed and fast payments" },
          ].map(({ Icon, text }, i) => (
            <motion.div
              key={i}
              variants={itemUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ y: -8, rotate: -0.25 }}
              transition={{ type: "spring", stiffness: 140, damping: 12 }}
              className="flex flex-col items-center justify-center w-full"
              style={{
                maxWidth: "18rem",
                backgroundColor: isDark ? "#1a1a1a" : "#f8faf9",
                color: colors.text,
                borderRadius: "1rem",
                border: `1px solid ${isDark ? colors.border : colors.button}`,
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                padding: "1.5rem",
                minHeight: "13rem",
              }}
            >
              <motion.div
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 sm:mb-5 shadow-md"
                style={{ backgroundColor: colors.button, color: "#fff" }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{
                  duration: 1.9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.15,
                }}
              >
                <Icon className="text-xl sm:text-2xl md:text-3xl" />
              </motion.div>
              <p className="text-sm sm:text-base font-semibold leading-relaxed opacity-95">
                {text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== CHATBOT FAB ===== */}
      <button
        onClick={toggleChat}
        className="
          fixed bottom-4 right-4 md:bottom-6 md:right-6
          p-3 md:p-4 rounded-full shadow-lg flex items-center justify-center
          z-50 transition hover:scale-105
        "
        style={{
          backgroundColor: colors.button,
          color: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          border: "none",
        }}
        title="Open Qwikko Chatbot"
        aria-label="Open Qwikko Chatbot"
      >
        <FaRobot className="text-xl md:text-2xl" />
      </button>

      {/* ===== CHATBOT PANEL ===== */}
      {isChatOpen && (
        <div
          className="
            fixed
            inset-x-0 bottom-0 top-auto
            md:inset-auto md:top-4 md:right-4
            w-full md:w-96
            h-[70vh] sm:h-[75vh] md:h-[85vh]
            rounded-t-2xl md:rounded-2xl
            shadow-2xl flex flex-col overflow-hidden
            z-50
          "
          style={{ backgroundColor: colors.div, color: colors.text }}
        >
          <button
            onClick={toggleChat}
            className="absolute top-3 right-3 md:top-4 md:right-4 z-10"
            style={{ color: colors.textSecondary }}
            title="Close"
            aria-label="Close chatbot"
          >
            <X size={22} className="md:hidden" />
            <X size={24} className="hidden md:block" />
          </button>

          <h2
            className="
              text-sm sm:text-base font-semibold flex items-center gap-2
              px-3 sm:px-4 py-2.5 sm:py-3
            "
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
            }}
          >
            <FaRobot
              size={18}
              className="sm:hidden"
              style={{ color: colors.text }}
            />
            <FaRobot
              size={22}
              className="hidden sm:block"
              style={{ color: colors.text }}
            />
            Qwikko Chatbot
          </h2>

          <div
            className="flex-grow overflow-auto p-2 sm:p-3 md:p-2"
            style={{ backgroundColor: colors.bg }}
          >
            <ChatBot userId="guest" />
          </div>
        </div>
      )}
    </>
  );
}
