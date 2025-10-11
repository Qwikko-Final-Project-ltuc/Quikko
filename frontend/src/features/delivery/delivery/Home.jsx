// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

export default function DeliveryHome() {
  const services = [
    {
      title: "Weekly & Monthly Reports",
      desc: "Keep track of your deliveries with detailed weekly and monthly reports to optimize your business.",
    },
    {
      title: "Order Management",
      desc: "Organize, update, and monitor all your orders efficiently from a single platform.",
    },
    {
      title: "User-Friendly Interface",
      desc: "An intuitive and easy-to-use interface designed for smooth navigation and quick operations.",
    },
  ];

  // ✅ جلب حالة الثيم من الريدوكس
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: isDarkMode ? "#242625" : "#f0f2f1", // الخلفية
        color: isDarkMode ? "#ffffff" : "#242625", // النصوص
      }}
    >
      {/* Main Content */}
      <div className="flex-1 px-6 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1
            className="text-5xl font-extrabold mb-4 "
            style={{
              color: isDarkMode ? "#ffffff" : "#242625", // النصوص
            }}
          >
            Welcome to{" "}
            <span
              style={{
                color: isDarkMode ? "#ffffff" : "#242625", // النصوص
              }}
            >
              QWIKKO Delivery
            </span>
          </h1>
          <p
            className="text-lg leading-relaxed mb-12 "
            style={{
              color: isDarkMode ? "#ffffff" : "#242625", // النصوص
            }}
          >
            Our delivery platform is designed to make your business faster,
            smarter, and more organized. Here’s what we offer to help you
            succeed:
          </p>
        </motion.div>

        {/* Services */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {services.map((service, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition"
              style={{
                backgroundColor: isDarkMode ? "#666666" : "#ffffff", // خلفية الديف
                color: isDarkMode ? "#ffffff" : "#242625", // النصوص
              }}
            >
              <h3
                style={{
                  color: isDarkMode ? "#ffffff" : "#307A59",
                  fontWeight: "bold",
                  marginBottom: "0.75rem",
                  fontSize: "1.25rem",
                }}
              >
                {service.title}
              </h3>
              <p
                style={{
                  color: isDarkMode ? "#f9f9f9" : "#242625",
                  fontSize: "0.875rem",
                  lineHeight: "1.25rem",
                }}
              >
                {service.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
