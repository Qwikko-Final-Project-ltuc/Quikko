import { Vendor } from "./vendorApi";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setVendors } from "./vendorSlice";
import VendorCard from "./vendorCard";
import { IoIosSearch } from "react-icons/io";

export default function VendorPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);
  const dispatch = useDispatch();
  const vendors = useSelector((state) => state.vendors.vendors);

  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  useEffect(() => {
    const handleVendor = async () => {
      try {
        const result = await Vendor();
        dispatch(setVendors(result.data || []));
      } catch (err) {
        alert(err.message);
      }
    };
    handleVendor();
  }, [dispatch]);

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.store_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "all" || vendor.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const increment = 6;
  const visibleVendors = filteredVendors.slice(0, visibleCount);

  return (
    <div className="w-full mx-auto p-4 sm:p-6 rounded-2xl mt-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold pb-2 sm:pb-3 opacity-90 mb-4 sm:mb-5">
        Vendors Management
      </h1>
      <div
        className={`min-h-screen p-4 sm:p-6 transition-colors duration-500 ${
          isDark
            ? "bg-[var(--bg)] text-[var(--text)]"
            : "bg-[var(--bg)] text-[var(--text)]"
        }`}
      >
        {/* Search & Filters */}
        <div
          className={`p-4 sm:p-6 mb-4 sm:mb-6 rounded-lg sm:rounded-xl shadow-md transition-colors duration-500 border ${
            isDark
              ? "bg-[var(--bg)] border-[var(--border)]"
              : "bg-[var(--bg)] border-[var(--border)]"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center mb-4 space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <IoIosSearch
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? "bg-[var(--div)]" : "bg-[var(--textbox)]"
                } w-4 h-4 sm:w-5 sm:h-5`}
              />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-2 sm:p-3 pl-8 sm:pl-10 rounded-lg border transition-colors duration-300 focus:outline-none focus:ring-2 text-sm sm:text-base ${
                  isDark
                    ? "bg-[var(--div)] border-[var(--border)] text-[var(--text)] focus:ring-[#307A59]"
                    : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-[#307A59]"
                }`}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm font-medium cursor-pointer">
            {["all", "approved", "pending", "rejected"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full font-medium transition-colors duration-300 cursor-pointer whitespace-nowrap ${
                  activeFilter === filter
                    ? "bg-[#307A59] text-white"
                    : isDark
                    ? "hover:bg-[var(--hover)] text-white"
                    : "hover:bg-[var(--hover)] text-gray-800"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Vendor Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {visibleVendors.map((vendor) => (
            <VendorCard
              key={vendor.vendor_id}
              vendor={vendor}
              isDark={isDark}
            />
          ))}
        </div>

        {/* Load More */}
        {visibleCount < filteredVendors.length && (
          <div className="flex justify-center mt-4 sm:mt-6">
            <button
              onClick={() => setVisibleCount(visibleCount + increment)}
              className="px-5 sm:px-6 py-2 sm:py-3 rounded-full bg-[var(--button)] text-white font-medium hover:bg-[#2b7556] transition-all duration-300 cursor-pointer text-sm sm:text-base"
            >
              Load More
            </button>
          </div>
        )}

        {visibleVendors.length > 0 && (
          <div className="text-center mt-4 sm:mt-6">
            <p
              className={`text-sm sm:text-base ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Showing {visibleVendors.length} of {filteredVendors.length} Vendors Stores
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
