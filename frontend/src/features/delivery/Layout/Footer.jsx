import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Footer() {
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  return (
    <footer
      className="py-4"
      style={{
        backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
        color: isDarkMode ? "#ffffff" : "#242625",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Left */}
        <div className="flex items-center">
          <img
            src={isDarkMode ? "/darklogo.png" : "/logo.png"}
            alt="Qwikko Logo"
            className="h-9"
          />
        </div>

        {/* Links Center */}
        <div className="flex flex-col items-center">
          <div className="flex space-x-6 text-sm mb-1">
            <Link to="/contact" className="hover:underline transition">
              Contact Us
            </Link>
            <Link to="/about" className="hover:underline transition">
              About Us
            </Link>
          </div>
          <p className="text-xs">2025 © All rights reserved</p>
        </div>

        {/* Social Icons Right */}
        <div className="flex space-x-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded transition hover:bg-gray-300"
          >
            <FaGithub size={20} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded transition hover:bg-gray-300"
          >
            <FaLinkedin size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
