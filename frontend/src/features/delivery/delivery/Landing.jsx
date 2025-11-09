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

export default function LandingPage() {
  const [cmsContent, setCmsContent] = useState(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const isDark = useSelector((s) => s.deliveryTheme.darkMode);
  const dispatch = useDispatch();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const toggleChat = () => setIsChatOpen((v) => !v);

  const colors = {
    bg: isDark ? "#323232" : "#ffffff", // ✅ خلفية الصفحة بالكامل
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

  // 3D tilt
  const cardRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 150, damping: 20 });
  const smy = useSpring(my, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(smy, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(smx, [-0.5, 0.5], [-10, 10]);
  const floatY = useMotionValue(0);
  const sFloatY = useSpring(floatY, { stiffness: 60, damping: 15 });

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

  // ---------- BODY SCROLL LOCK ----------
  useEffect(() => {
    let scrollY = 0;

    if (isChatOpen) {
      scrollY = window.scrollY || document.documentElement.scrollTop;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      document.body.setAttribute("data-locked-scroll", String(scrollY));
    } else {
      const stored = document.body.getAttribute("data-locked-scroll");
      const prev = stored ? parseInt(stored, 10) : 0;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.body.removeAttribute("data-locked-scroll");
      setTimeout(() => {
        window.scrollTo({ top: prev, left: 0, behavior: "auto" });
      }, 10);
    }

    return () => {
      const stored = document.body.getAttribute("data-locked-scroll");
      const prev = stored ? parseInt(stored, 10) : 0;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.body.removeAttribute("data-locked-scroll");
      setTimeout(() => {
        window.scrollTo({ top: prev, left: 0, behavior: "auto" });
      }, 10);
    };
  }, [isChatOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        document.documentElement.style.overflowY = "auto";
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    // ✅ خلفية الصفحة كلها حسب الثيم (لايت/دارك)
    <div
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {/* الهيدر بجرادينت كامل-عرض */}
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
          <motion.div variants={itemUp}></motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
            <div className="order-2 md:order-1 text-center md:text-left relative z-30">
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
                  : "Loading..."}
              </motion.h6>

              <motion.div
                variants={containerVariants}
                className="flex items-center justify-center md:justify-start gap-3 sm:gap-4 pt-4"
              >
                <motion.div
                  variants={itemUp}
                  whileHover={{ y: -2, scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                  style={{ zIndex: 40 }}
                >
                  <Link
                    to="/delivery/login"
                    aria-label="Start Now"
                    className="inline-flex items-center justify-center px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-lg text-base sm:text-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/70"
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#026a4b",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
                    }}
                  >
                    Start Now
                  </Link>
                </motion.div>
              </motion.div>
            </div>

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
                    className="w-full h-auto max-h-64 sm:max-h-80 md:max-h-[420px] lg:max-h-[480px] object-contain rounded-2xl"
                    whileHover={{ scale: 1.015 }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    style={{ willChange: "transform" }}
                  />
                ) : (
                  <div className="w-full h-[280px] sm:h-[320px] md:h-[420px] lg:h-[480px] flex items-center justify-center bg-transparent">
                    <span className="text-white/80">Loading image...</span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* ✅ مساحة المحتوى السفلي بخلفية الصفحة نفسها (لا ألوان خلف الكاردات) */}
      <div className="w-full">
        {/* How It Works */}
        <section className="w-full max-w-6xl px-4 sm:px-6 md:p-10 mt-6 md:mt-10 text-center mx-auto">
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

          <div
            className="hidden md:block absolute left-0 right-0 h-[3px]"
            style={{
              top: "28px",
              backgroundColor: isDark ? "#ffffff" : colors.button,
              opacity: 0.25,
            }}
          />

          <div className="hidden md:grid grid-cols-3 gap-6 sm:gap-10 md:gap-16 mb-4 sm:mb-6">
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
                className="flex flex-col items-center text-center w-full relative"
                style={{ maxWidth: "22rem" }}
              >
                <div className="md:hidden flex justify-center -mb-3">
                  <motion.div
                    className="w-10 h-10 flex items-center justify-center rounded-full text-base font-bold shadow-md"
                    style={{ backgroundColor: colors.button, color: "#fff" }}
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2,
                    }}
                  >
                    {i + 1}
                  </motion.div>
                </div>

                <div
                  className="w-full"
                  style={{
                    backgroundColor: isDark ? "#424242" : "#f8faf9", // خلفية الكارد فقط
                    color: isDark ? "#ffffff" : colors.button,
                    borderRadius: "1rem",
                    border: `1px solid ${isDark ? "#555555" : colors.button}`,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                    padding: "1.5rem",
                    transition: "all 0.3s ease",
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
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="w-full max-w-6xl px-4 sm:px-6 md:p-10 mt-6 mb-20 md:mb-24 text-center mx-auto">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 sm:gap-y-12 md:gap-y-14 justify-items-center">
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
                  backgroundColor: isDark ? "#424242" : "#f8faf9", // خلفية الكارد فقط
                  color: colors.text,
                  borderRadius: "1rem",
                  border: `1px solid ${isDark ? "#555555" : colors.button}`,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                  padding: "1.5rem",
                  minHeight: "13rem",
                  transition: "all 0.3s ease",
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
      </div>

      {/* FAB */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 p-3 md:p-4 rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          backgroundColor: colors.button,
          color: "#fff",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          border: "none",
          width: "56px",
          height: "56px",
        }}
        title="Open Qwikko Chatbot"
        aria-label="Open Qwikko Chatbot"
      >
        <FaRobot className="text-xl md:text-2xl" />
      </button>

      {/* Chat panel */}
      {isChatOpen && (
        <div
          className="fixed inset-0 md:inset-auto md:top-4 md:right-4 md:bottom-4 w-full md:w-96 h-full md:h-[calc(100vh-2rem)] rounded-none md:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
          style={{
            backgroundColor: colors.div,
            color: colors.text,
            maxHeight: "100vh",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 sm:py-4"
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              boxShadow: "0 1px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-3">
              <FaRobot style={{ color: colors.button }} />
              Qwikko Chatbot
            </h2>
            <button
              onClick={toggleChat}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              style={{ color: colors.textSecondary }}
              title="Close"
              aria-label="Close chatbot"
            >
              <X size={24} />
            </button>
          </div>

          <div
            className="flex-grow overflow-auto p-3 sm:p-4"
            style={{
              backgroundColor: colors.bg,
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <ChatBot userId="guest" />
          </div>
        </div>
      )}

      <div style={{ height: "50px" }}></div>
    </div>
  );
}
