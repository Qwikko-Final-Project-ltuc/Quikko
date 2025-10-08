import React from "react";
import { FaShoppingBag, FaStore, FaTruck, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
 
export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans text-gray-900 bg-gradient-to-b from-gray-50 to-white">
      {/* Section 1 */}
      <section className="py-24 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-12 bg-white rounded-2xl shadow-sm border border-gray-200 m-6 hover:shadow-md transition">
        <div className="max-w-md text-left flex flex-col items-start gap-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Discover Your Favorite Products
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            Browse thousands of products from local stores, get the best deals,
            and enjoy fast delivery right to your doorstep.
          </p>
          <Link
            to="/customer/landing"
            className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-full shadow hover:bg-gray-800 transition text-center"
          >
            See Products
          </Link>
        </div>
        <div className="flex flex-col items-center gap-0">
          <FaShoppingBag className="text-9xl text-gray-700 hover:scale-110 transition-transform duration-300" />
        </div>
      </section>
 
      {/* Section 2 */}
      <section className="py-24 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-12 bg-white rounded-2xl shadow-sm border border-gray-200 m-6 hover:shadow-md transition">
        <div className="flex flex-col items-center gap-4 order-2 md:order-1">
          <FaShoppingCart className="text-9xl text-gray-700 hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="max-w-md text-left flex flex-col items-start gap-6 order-1 md:order-2">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Grow Your Store Online
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            Join our platform to reach more customers, manage your products
            easily, and boost your sales with smart tools.
          </p>
          <Link
            to="/vendor"
            className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-full shadow hover:bg-gray-800 transition text-center"
          >
            Become a Vendor
          </Link>
        </div>
      </section>
 
      {/* Section 3 */}
      <section className="py-24 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-12 bg-white rounded-2xl shadow-sm border border-gray-200 m-6 hover:shadow-md transition">
        <div className="max-w-md text-left flex flex-col items-start gap-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            Deliver Smarter, Faster
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            Set up a delivery service and get packages to orders in your area,
            manage deliveries efficiently, and earn more.
          </p>
          <Link
            to="/delivery/"
            className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-full shadow hover:bg-gray-800 transition text-center"
          >
            Join as Delivery
          </Link>
        </div>
        <div className="flex flex-col items-center gap-4">
          <FaTruck className="text-9xl text-gray-700 hover:scale-110 transition-transform duration-300" />
        </div>
      </section>
    </div>
  );
}