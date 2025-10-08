import logo from "/logo.png";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-لقثغ-100 text-black py-6 px-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img
            src={logo}
            alt="Qwikko Logo"
            className="w-50 h-50 object-contain absolute butttom-25 left-25 transform -translate-x-1/2"
          />
        </div>

        {/* Links */}
        <div className="flex flex-col items-center">
          <div className="flex space-x-6 text-sm mb-2">
            <Link
              to="/customer/contact"
              className="hover:text-black hover:underline transition"
            >
              Contact Us
            </Link>
            <Link
              to="/customer/about"
              className="hover:text-black hover:underline transition"
            >
              About Us
            </Link>
          </div>
          <p className="text-xs text-gray-600">2025 © All rights reserved</p>
        </div>

        {/* Social Icons */}
        <div className="flex space-x-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded hover:bg-gray-100 hover:text-gray-800 transition"
          >
            <FaGithub size={20} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded hover:bg-gray-100 hover:text-gray-800 transition"
          >
            <FaLinkedin size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
