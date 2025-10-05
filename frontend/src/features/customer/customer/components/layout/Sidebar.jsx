import React from "react";
import { Link } from "react-router-dom";
const Sidebar = ({ isOpen, toggleSidebar }) => {
    const handleLogout = () => {

    localStorage.removeItem("token");

    window.location.href = "/auth/login";
    };
    return (
        <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50
            ${isOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}
        >
        <button
            className="p-4 focus:outline-none"
            onClick={toggleSidebar}
        >
            <svg
            className="w-6 h-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
        </button>

        <nav className="flex-1 flex flex-col mt-4">
            <Link to="/stores" className="px-4 py-2 hover:bg-gray-100">Stores</Link>
            <Link to="/products" className="px-4 py-2 hover:bg-gray-100">All Products</Link>
            <Link to="/wishlist" className="px-4 py-2 hover:bg-gray-100">Wishlist</Link>
            <Link to="/contact" className="px-4 py-2 hover:bg-gray-100">Contact</Link>
            <Link to="/about" className="px-4 py-2 hover:bg-gray-100">About</Link>
        </nav>

        {/* آخر عنصرين في الأسفل */}
        <div className="mt-auto mb-4 flex flex-col">
            <Link to="/settings" className="px-4 py-2 hover:bg-gray-100">Settings</Link>
            <button
            onClick={handleLogout}
            className="px-4 py-2 hover:bg-gray-100 text-left"
            >
            Logout
            </button>
        </div>
        </div>
    );
    };

export default Sidebar;
