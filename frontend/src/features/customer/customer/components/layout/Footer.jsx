// import logo from "/logo.png";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Footer() {
    const themeMode = useSelector((state) => state.customerTheme.mode);

  return (
    <footer className="bg-[var(--bg)] text-[var(--text)] py-8 px-10 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo */}
        <div className="flex items-center">
          <img 
          src={themeMode === "dark" ? "/LogoDark.png" : "/logo.png"} 
          alt="Qwikko Logo" 
          className="h-9" 
        />
        </div>

        {/* Links and Copyright */}
        <div className="flex flex-col items-center text-center">
          <div className="flex space-x-8 text-sm mb-3">
            <Link
              to="/customer/contact"
              className="hover:text-[var(--primary)] hover:underline transition-colors duration-200 font-medium"
            >
              Contact Us
            </Link>
            <Link
              to="/customer/about"
              className="hover:text-[var(--primary)] hover:underline transition-colors duration-200 font-medium"
            >
              About Us
            </Link>
            <Link
              to="/customer/privacy"
              className="hover:text-[var(--primary)] hover:underline transition-colors duration-200 font-medium"
            >
              Privacy Policy
            </Link>
            <Link
              to="/customer/terms"
              className="hover:text-[var(--primary)] hover:underline transition-colors duration-200 font-medium"
            >
              Terms of Service
            </Link>
          </div>
          <p className="text-xs text-[var(--light-gray)]">
            © 2025 Qwikko. All rights reserved.
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex space-x-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--primary)] hover:text-white transition-all duration-200 shadow-sm"
          >
            <FaGithub size={18} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--primary)] hover:text-white transition-all duration-200 shadow-sm"
          >
            <FaLinkedin size={18} />
          </a>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-[var(--border)] text-center">
        <p className="text-xs text-[var(--light-gray)]">
          Made with ❤️ for better shopping experience
        </p>
      </div>
    </footer>
  );
}