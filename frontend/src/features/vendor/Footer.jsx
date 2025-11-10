import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Footer() {
    const themeMode = useSelector((state) => state.customerTheme.mode);

  return (
    <footer className={`py-8 px-10 border-t ${
      themeMode === 'dark' 
        ? 'bg-[var(--div)] border-[var(--border)] text-[var(--text)]' 
        : 'bg-gradient-to-br from-[var(--button)] to-gray-700  border-[var(--button)] text-white'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src={themeMode === "dark" ? "/LogoDark.png" : "/LogoDark.png"} 
            alt="Qwikko Logo" 
            className="h-9" 
          />
        </div>

        {/* Links and Copyright */}
        <div className="flex flex-col items-center text-center">
          <div className="flex space-x-8 text-sm mb-3">
            <Link
              to="/customer/contact"
              className={`hover:underline transition-colors duration-200 font-medium ${
                themeMode === 'dark' 
                  ? 'hover:text-[var(--primary)]' 
                  : 'hover:text-white/80'
              }`}
            >
              Contact Us
            </Link>
            <Link
              to="/customer/about"
              className={`hover:underline transition-colors duration-200 font-medium ${
                themeMode === 'dark' 
                  ? 'hover:text-[var(--primary)]' 
                  : 'hover:text-white/80'
              }`}
            >
              About Us
            </Link>
            <Link
              to="/customer/privacy"
              className={`hover:underline transition-colors duration-200 font-medium ${
                themeMode === 'dark' 
                  ? 'hover:text-[var(--primary)]' 
                  : 'hover:text-white/80'
              }`}
            >
              Privacy Policy
            </Link>
            <Link
              to="/customer/terms"
              className={`hover:underline transition-colors duration-200 font-medium ${
                themeMode === 'dark' 
                  ? 'hover:text-[var(--primary)]' 
                  : 'hover:text-white/80'
              }`}
            >
              Terms of Service
            </Link>
          </div>
          <p className={`text-xs ${
            themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-white/80'
          }`}>
            © 2025 Qwikko. All rights reserved.
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex space-x-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`p-3 rounded-full transition-all duration-200 shadow-sm ${
              themeMode === 'dark'
                ? 'bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--primary)] hover:text-white'
                : 'bg-white/20 text-white hover:bg-white hover:text-[var(--button)]'
            }`}
          >
            <FaGithub size={18} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`p-3 rounded-full transition-all duration-200 shadow-sm ${
              themeMode === 'dark'
                ? 'bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--primary)] hover:text-white'
                : 'bg-white/20 text-white hover:bg-white hover:text-[var(--button)]'
            }`}
          >
            <FaLinkedin size={18} />
          </a>
        </div>
      </div>

      {/* Bottom Section */}
      <div className={`max-w-7xl mx-auto mt-6 pt-6 text-center ${
        themeMode === 'dark' 
          ? 'border-t border-[var(--border)]' 
          : 'border-t border-white/20'
      }`}>
        <p className={`text-xs ${
          themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-white/80'
        }`}>
          Made with ❤️ for better shopping experience
        </p>
      </div>
    </footer>
  );
}