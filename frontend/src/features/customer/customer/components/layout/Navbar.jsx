import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { 
  FaBars, FaUser, FaShoppingCart, FaStore, FaBoxOpen, FaPhone, 
  FaInfoCircle, FaClipboardList, FaCog, FaSignOutAlt, FaSearch 
} from "react-icons/fa";
import { MdFavorite } from "react-icons/md";
import { fetchProfile, updateProfile } from "../../profileSlice";
import { setSearchQuery } from "../../productsSlice";
import { fetchAllCarts } from "../../cartSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const { data: profile, loading } = useSelector((state) => state.profile);
  const products = useSelector((state) => state.products.items || []);
  const { allCarts = [] } = useSelector((state) => state.cart);

  const cartItemCount = allCarts.length;


  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarRef = useRef();

  const cities = [
    "Amman","Zarqa","Irbid","Aqaba","Mafraq","Jerash","Madaba","Karak","Tafilah","Ma'an","Ajloun"
  ];

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchAllCarts());
  }, [dispatch]);

  useEffect(() => {
    if (!searchTerm.trim()) return setResults([]);
    const filtered = products.filter(
      (p) => p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(filtered);
  }, [searchTerm, products]);

  const handleSearchSelect = (productName) => {
    setSearchTerm(productName);
    setResults([]);
    setDropdownOpen(false);
    dispatch(setSearchQuery(productName));
  };

  const handleCityChange = (e) => {
    dispatch(updateProfile({ ...profile, address: e.target.value }));
  };

  const handleCartClick = () => {
    window.location.href = "/cart";
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // إغلاق القوائم إذا ضغط المستخدم خارجها
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sidebarRef.current && 
        !sidebarRef.current.contains(e.target) &&
        !e.target.closest(".sidebar-toggle-button")
      ) {
        setIsSidebarOpen(false);
      }

      if (!e.target.closest(".profile-dropdown")) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };

  return (
      <>
        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 z-50 flex flex-col
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Sidebar Logo */}
          <div className="px-6 py-6 flex items-center border-b border-gray-200">
            <img src="/logo.png" alt="Qwikko Logo" className="h-9" />
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 flex flex-col mt-4 space-y-1">
            <Link to="/" className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
              <FaBars className="mr-3"/> Home
            </Link>
            <Link to="/profile" className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
              <FaUser className="mr-3"/> Profile
            </Link>
            <Link to="/stores" className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
              <FaStore className="mr-3"/> Stores
            </Link>
            <Link to="/products" className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
              <FaBoxOpen className="mr-3"/> All Products
            </Link>
            <Link to="/wishlist" className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
              <MdFavorite  className="mr-3"/> Wishlist
            </Link>
            <Link to="/contact" className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
              <FaPhone className="mr-3"/> Contact
            </Link>
            <Link to="/about" className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
              <FaInfoCircle className="mr-3"/> About
            </Link>
            <Link to="/orders" className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
              <FaClipboardList className="mr-3"/> Orders
            </Link>
          </nav>

          {/* Settings & Logout */}
          <div className="mt-auto mb-6 flex flex-col px-6 space-y-2">
            <Link to="/settings" className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
              <FaCog className="mr-3"/> Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
            >
              <FaSignOutAlt className="mr-3"/> Logout
            </button>
          </div>
        </div>

        {/* Navbar */}
        <nav className="w-full bg-white shadow-md flex items-center px-6 py-3 z-40 relative">
          {/* Sidebar toggle */}
          <button
            onClick={toggleSidebar}
            className="mr-6 text-gray-700 hover:text-gray-900 transition-colors duration-200 sidebar-toggle-button"
          >
            <FaBars size={22} />
          </button>

          {/* Logo */}
          <Link to="/" className="mr-8 flex items-center">
            <img src="/logo.png" alt='Qwikko Logo' className="h-9"/>
          </Link>

          {/* Deliver to */}
          <div className="flex items-center mr-8">
            <span className="mr-2 text-gray-600 font-medium">Deliver to</span>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={profile?.address || ""}
              onChange={handleCityChange}
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div className="flex-1 flex items-center mr-8 relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              onClick={() => handleSearchSelect(searchTerm)}
            >
              <FaSearch size={16} />
            </button>

            {results.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 mt-1">
                {results.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                    onClick={() => handleSearchSelect(item.name)}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile & Cart */}
          <div className="flex items-center space-x-6">
            {/* Profile Dropdown */}
            <div className="relative profile-dropdown">
              <button className="flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <FaUser className="mr-2"/> {loading ? "Loading..." : profile ? profile.name : "Guest"}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-44">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => setDropdownOpen(false)}
                  >
                    View Profile
                  </Link>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => {}}
                  >
                    Dark/Light Mode
                  </button>
                </div>
              )}
            </div>

            {/* Cart */}
            <div className="relative">
              <button onClick={handleCartClick} className="text-gray-700 hover:text-gray-900 transition-colors duration-200">
                <FaShoppingCart size={22} />
              </button>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </div>
          </div>
        </nav>
      </>
  );
};

export default Navbar;
