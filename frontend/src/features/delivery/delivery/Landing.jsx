import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaClipboardList,
  FaChartLine,
  FaUsers,
  FaDollarSign,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { fetchLandingCMS } from "./LandingAPI";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme, setTheme } from "./deliveryThemeSlice";

export default function LandingPage() {
  const [cmsContent, setCmsContent] = useState(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  // ✅ من الريدكس
  const isDark = useSelector((state) => state.deliveryTheme.darkMode);
  const dispatch = useDispatch();

  useEffect(() => {
    async function loadCMS() {
      const data = await fetchLandingCMS("delivery", "Landing Page");
      setCmsContent(data);

      if (data?.content) {
        const parts = data.content.split("@");
        setTitle(parts[0]?.trim() || "");
        setSubtitle(parts[1]?.trim() || "");
      }
    }
    loadCMS();
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  // ✅ عند أول تحميل، نقرأ الثيم من localStorage ونضبطه في الريدكس
  useEffect(() => {
    const savedTheme = localStorage.getItem("deliveryTheme");
    if (savedTheme === "dark") {
      dispatch(setTheme(true));
    } else {
      dispatch(setTheme(false));
    }
  }, [dispatch]);

  return (
    <>
      <div
        className="min-h-screen flex flex-col items-center"
        style={{
          backgroundColor: "var(--bg)",
          color: "var(--text)",
        }}
      >
        <div
          className="flex flex-col md:grid md:grid-cols-2 items-center gap-12 w-full max-w-6xl p-10 mt-12 rounded-2xl shadow-lg "
          style={{
            backgroundColor: "var(--div)",
            color: "var(--text)",
            minHeight: "70vh",
          }}
        >
          <div className="order-2 md:order-1 flex items-center justify-center">
            {cmsContent?.image_url ? (
              <img
                src={cmsContent.image_url}
                alt="Landing visual"
                className="w-full max-w-md object-contain rounded-xl shadow-md"
              />
            ) : (
              <div
                className="w-full max-w-md h-80 flex items-center justify-center rounded-xl"
                style={{
                  backgroundColor: "var(--hover)",
                }}
              >
                Loading image...
              </div>
            )}
          </div>

          <div className="order-1 md:order-2 flex flex-col items-center md:items-start text-center md:text-left space-y-5">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              {title || "Welcome to Qwikko Delivery"}
            </h1>

            {subtitle && (
              <p className="text-base md:text-lg leading-relaxed">{subtitle}</p>
            )}

            <div className="flex items-center gap-4 pt-2">
              <Link
                to="/delivery/login"
                className="inline-block px-10 py-4 rounded-lg text-lg font-semibold shadow-md transition-transform duration-300 hover:scale-[1.02] focus:outline-none"
                style={{
                  backgroundColor: "var(--button)",
                  color: "#ffffff",
                  boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
                }}
              >
                Start Now
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-6 w-full max-w-md">
              {[
                { k: "100+", v: "Partners" },
                { k: "50K+", v: "Orders" },
                { k: "24/7", v: "Support" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="rounded-xl border shadow-sm p-4"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--div)",
                  }}
                >
                  <div className="text-2xl font-bold">{s.k}</div>
                  <div
                    className="text-sm mt-1"
                    style={{ color: "var(--text)" }}
                  >
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== How It Works ===== */}
        <div className="w-full max-w-5xl p-10 mt-10 text-center">
          <h2 className="text-4xl font-bold mb-12">How It Works</h2>

          <div className="relative">
            <div
              className="hidden md:block absolute top-14 left-0 w-full h-px"
              style={{ backgroundColor: "var(--border)" }}
            />
            <div
              className="md:hidden absolute left-1/2 -translate-x-1/2 top-8 bottom-8 w-px"
              style={{ backgroundColor: "var(--border)" }}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
              {[
                {
                  step: "1",
                  title: "Register your company",
                  desc: "Sign up quickly and create your business account.",
                },
                {
                  step: "2",
                  title: "Set up your delivery zones",
                  desc: "Define the areas where your company will operate and deliver.",
                },
                {
                  step: "3",
                  title: "Start receiving orders",
                  desc: "Track and deliver orders smoothly and grow your business.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="relative flex flex-col items-center text-center md:text-left md:items-start"
                >
                  <div
                    className="w-14 h-14 flex items-center justify-center rounded-full text-xl font-bold shadow-md mb-4"
                    style={{
                      backgroundColor: "var(--div)",
                      color: "var(--text)",
                      border: `1px solid var(--border)`,
                    }}
                  >
                    {item.step}
                  </div>

                  <div
                    className="w-full md:w-72 rounded-2xl border shadow-sm p-5"
                    style={{
                      backgroundColor: "var(--div)",
                      color: "var(--text)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <p className="text-lg font-semibold">{item.title}</p>
                    <p className="text-sm mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Benefits ===== */}
        <div className="w-full max-w-6xl p-6 mt-12 mb-24 text-center">
          <h2 className="text-3xl font-bold mb-10">Benefits Section</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { Icon: FaClipboardList, text: "Manage orders easily" },
              { Icon: FaChartLine, text: "Accurate reports and statistics" },
              { Icon: FaUsers, text: "Reach thousands of customers & stores" },
              { Icon: FaDollarSign, text: "Guaranteed and fast payments" },
            ].map(({ Icon, text }, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-between rounded-2xl border shadow-sm p-8 h-56"
                style={{
                  backgroundColor: "var(--div)",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border shadow-sm"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--div)",
                  }}
                >
                  <Icon className="text-4xl" />
                </div>
                <p className="text-base font-medium leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ زر التحكم بالثيم من الريدكس */}
      <button
        onClick={() => dispatch(toggleTheme())}
        className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg border transition-all duration-300 hover:scale-110"
        style={{
          backgroundColor: "var(--button)",
          color: "#ffffff",
          borderColor: "var(--border)",
        }}
        title="Toggle dark / light mode"
      >
        {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
      </button>
    </>
  );
}
