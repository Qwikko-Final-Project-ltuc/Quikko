import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Footer() {
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  return (
    <footer
      className={`py-6 px-6 border-t transition-colors duration-300 sm:pb-10
      ${
        isDarkMode
          ? "bg-[var(--div)] border-[var(--border)] text-[var(--text)]"
          : "bg-gradient-to-br from-[var(--button)] to-gray-700 border-[var(--button)] text-white"
      }`}
    >
      <div
        className="
        max-w-7xl mx-auto 
        flex flex-col gap-6
        sm:flex-row sm:items-center sm:justify-between
      "
      >
        {/* ✅ Logo */}
        <div className="flex justify-center sm:justify-start">
          <img src="/darklogo.png" alt="Qwikko Logo" className="h-8 sm:h-9" />
        </div>

        {/* ✅ Links + Text */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex flex-col sm:flex-row sm:space-x-8 text-sm mb-1 gap-2">
            <Link
              to="/contact"
              className={`hover:underline transition font-medium ${
                isDarkMode
                  ? "hover:text-[var(--primary)]"
                  : "hover:text-white/80"
              }`}
            >
              Contact Us
            </Link>

            <Link
              to="/about"
              className={`hover:underline transition font-medium ${
                isDarkMode
                  ? "hover:text-[var(--primary)]"
                  : "hover:text-white/80"
              }`}
            >
              About Us
            </Link>
          </div>

          <p
            className={`text-xs ${
              isDarkMode ? "text-[var(--light-gray)]" : "text-white/80"
            }`}
          >
            © 2025 Qwikko. All rights reserved.
          </p>
        </div>

        {/* ✅ Social Icons */}
        <div className="flex justify-center sm:justify-end space-x-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`p-3 rounded-full transition shadow-sm
              ${
                isDarkMode
                  ? "bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--primary)] hover:text-white"
                  : "bg-white/20 text-white hover:bg-white hover:text-[var(--button)]"
              }`}
          >
            <FaGithub size={20} />
          </a>

          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`p-3 rounded-full transition shadow-sm
              ${
                isDarkMode
                  ? "bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--primary)] hover:text-white"
                  : "bg-white/20 text-white hover:bg-white hover:text-[var(--button)]"
              }`}
          >
            <FaLinkedin size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
