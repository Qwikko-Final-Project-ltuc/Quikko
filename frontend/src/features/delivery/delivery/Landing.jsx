import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaClipboardList,
  FaChartLine,
  FaUsers,
  FaDollarSign,
} from "react-icons/fa";
import { fetchLandingCMS } from "./LandingAPI";
import { useSelector } from "react-redux";

export default function LandingPage() {
  const [cmsContent, setCmsContent] = useState(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

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

  return (
    <>
      <div
        className="min-h-screen  flex flex-col items-center"
        style={{
          backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
          color: isDarkMode ? "#ffffff" : "#242625",
        }}
      >
        {/*    <header className="w-full flex justify-between items-center p-6 max-w-6xl mx-auto">
      //     <div className="text-2xl font-bold">QWIKKO</div>
      //   </header> */}
        {/* ✅ Hero Section */}
        <section
          className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl p-6 mt-10 gap-10"
          style={{
            color: isDarkMode ? "#ffffff" : "#242625",
          }}
        >
          <div className="md:w-1/2 flex justify-center order-1 md:order-1">
            {cmsContent?.image_url ? (
              <img
                src={cmsContent.image_url}
                alt="Landing visual"
                className="w-full max-w-md object-contain rounded-lg shadow-lg"
              />
            ) : (
              <div
                className="w-full max-w-md h-72 bg-gray-200 flex items-center justify-center rounded-lg"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                Loading image...
              </div>
            )}
          </div>

          <div className="md:w-1/2 text-center md:text-left flex flex-col items-center md:items-start order-2 md:order-2">
            <h1
              className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              {title || "Welcome to Qwikko Delivery"}
            </h1>

            {subtitle && (
              <p
                className="text-lg  mb-6 whitespace-pre-line"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                {subtitle}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                to="/delivery/register"
                className="px-8 py-3 rounded transition-all duration-300 text-center w-full sm:w-auto"
                style={{
                  backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                Start Now
              </Link>

              <Link
                to="/delivery/login"
                className="px-8 py-3 rounded transition-all duration-300 text-center w-full sm:w-auto border"
                style={{
                  backgroundColor: "transparent",
                  borderColor: "#666666",
                  color: "#666666",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#666666";
                  e.target.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#666666";
                }}
              >
                Already have an account? Login
              </Link>
            </div>
          </div>
        </section>
        <section
          className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-6 p-6 mt-16"
          style={{
            color: isDarkMode ? "#ffffff" : "#242625",
          }}
        >
          {[
            {
              icon: <FaClipboardList size={32} />,
              title: "Easy Management",
              text: "Manage orders with ease.",
            },
            {
              icon: <FaChartLine size={32} />,
              title: "Track Progress",
              text: "Monitor deliveries in real-time.",
            },
            {
              icon: <FaUsers size={32} />,
              title: "Grow Your Network",
              text: "Connect with more customers.",
            },
            {
              icon: <FaDollarSign size={32} />,
              title: "Increase Revenue",
              text: "Boost your income efficiently.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className=" rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition"
              style={{
                backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              <div
                className="text-blue-600 mb-4"
                style={{
                  backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                {f.icon}
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{
                  backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                {f.title}
              </h3>
              <p
                className=" text-sm"
                style={{
                  backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                {f.text}
              </p>
            </div>
          ))}
        </section>
        {/* ✅ How It Works Section */}
        <section className="w-full max-w-5xl p-10 mt-7 text-center">
          <h2
            className="text-4xl font-bold mb-16"
            style={{
              color: isDarkMode ? "#ffffff" : "#242625",
            }}
          >
            How It Works
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-between relative">
            <div
              className="hidden md:block absolute top-14 left-0 w-full h-1  z-0"
              style={{
                backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            ></div>
            {[
              {
                step: "1",
                title: "Register your company",
                desc: "Sign up quickly and create your business account.",
              },
              {
                step: "2",
                title: "Connect your team",
                desc: "Add drivers and employees to start managing deliveries.",
              },
              {
                step: "3",
                title: "Start receiving orders",
                desc: "Track and deliver orders smoothly and grow your business.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative z-10 flex flex-col items-center bg-white rounded-2xl shadow-md p-6 w-64 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
                style={{
                  backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                <div
                  className="w-16 h-16 flex items-center justify-center rounded-full    text-2xl font-bold mb-4 shadow-md"
                  style={{
                    backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                    color: isDarkMode ? "#ffffff" : "#242625",
                  }}
                >
                  {item.step}
                </div>
                <p
                  className="text-lg font-semibold"
                  style={{
                    color: isDarkMode ? "#ffffff" : "#242625",
                  }}
                >
                  {item.title}
                </p>
                <p
                  className="text-sm  mt-2"
                  style={{
                    color: isDarkMode ? "#ffffff" : "#242625",
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="w-full max-w-6xl p-6 mt-10 text-center">
          <h2
            className="text-3xl font-bold mb-10"
            style={{
              color: isDarkMode ? "#ffffff" : "#242625",
            }}
          >
            Benefits Section
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            <div
              className="flex flex-col items-center  rounded-2xl shadow-md p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
              style={{
                backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              <FaClipboardList className="text-6xl mb-4" />
              <p
                className="text-lg font-medium"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                Manage orders easily
              </p>
            </div>
            <div
              className="flex flex-col items-center  rounded-2xl shadow-md p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
              style={{
                backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              <FaChartLine className="text-6xl mb-4 " />
              <p className="text-lg font-medium">
                Accurate reports and statistics
              </p>
            </div>
            <div
              className="flex flex-col items-center  rounded-2xl shadow-md p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
              style={{
                backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              <FaUsers className="text-6xl mb-4 " />
              <p className="text-lg font-medium">
                Reach thousands of customers & stores
              </p>
            </div>
            <div
              className="flex flex-col items-center  rounded-2xl shadow-md p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
              style={{
                backgroundColor: isDarkMode ? "#666666" : "#ffffff",
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              <FaDollarSign className="text-6xl mb-4 " />
              <p className="text-lg font-medium">
                Guaranteed and fast payments
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
