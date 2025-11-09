import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Footer() {
    const themeMode = useSelector((state) => state.customerTheme.mode);

  return (
    <footer className={`py-6 px-4 border-t ${
      themeMode === 'dark' 
        ? 'bg-[var(--div)] border-[var(--border)] text-[var(--text)]' 
        : 'bg-gradient-to-br from-[var(--button)] to-gray-700 border-[var(--button)] text-white'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src="/LogoDark.png" 
            alt="Qwikko Logo" 
            className="h-7" 
          />
        </div>

        {/* Links and Social Icons in one row */}
        <div className="flex flex-wrap justify-center items-center gap-4 text-xs">
          <Link
            to="/customer/contact"
            className={`hover:underline transition-colors duration-200 font-medium ${
              themeMode === 'dark' 
                ? 'hover:text-[var(--primary)]' 
                : 'hover:text-white/80'
            }`}
          >
            Contact
          </Link>
          <Link
            to="/customer/about"
            className={`hover:underline transition-colors duration-200 font-medium ${
              themeMode === 'dark' 
                ? 'hover:text-[var(--primary)]' 
                : 'hover:text-white/80'
            }`}
          >
            About
          </Link>
          <Link
            to="/customer/privacy"
            className={`hover:underline transition-colors duration-200 font-medium ${
              themeMode === 'dark' 
                ? 'hover:text-[var(--primary)]' 
                : 'hover:text-white/80'
            }`}
          >
            Privacy
          </Link>
          <Link
            to="/customer/terms"
            className={`hover:underline transition-colors duration-200 font-medium ${
              themeMode === 'dark' 
                ? 'hover:text-[var(--primary)]' 
                : 'hover:text-white/80'
            }`}
          >
            Terms
          </Link>
          
          {/* Social Icons */}
          <div className="flex space-x-2">
            <a
              href="https://github.com/ThekraQaqish"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full transition-all duration-200 ${
                themeMode === 'dark'
                  ? 'bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--primary)] hover:text-white'
                  : 'bg-white/20 text-white hover:bg-white hover:text-[var(--button)]'
              }`}
              aria-label="GitHub"
            >
              <FaGithub size={14} />
            </a>
            <a
              href="https://www.linkedin.com/in/thekra-qaqish"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full transition-all duration-200 ${
                themeMode === 'dark'
                  ? 'bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--primary)] hover:text-white'
                  : 'bg-white/20 text-white hover:bg-white hover:text-[var(--button)]'
              }`}
              aria-label="LinkedIn"
            >
              <FaLinkedin size={14} />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className={`text-xs ${
            themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-white/80'
          }`}>
            © 2025 Qwikko. All rights reserved.
          </p>
          <p className={`text-xs mt-1 ${
            themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-white/80'
          }`}>
            Made with ❤️ for better shopping
          </p>
        </div>
      </div>
    </footer>
  );
}