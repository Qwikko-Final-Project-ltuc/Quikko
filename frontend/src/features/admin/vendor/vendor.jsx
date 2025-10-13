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
    <div
      className={`min-h-screen p-6 transition-colors duration-500 ${
        isDark ? "bg-[#242625] text-white" : "bg-[#f0f2f1] text-[#242625]"
      }`}
    >
      {/* Search & Filters */}
      <div
        className={`p-6 mb-6 rounded-xl shadow-md transition-colors duration-500 ${
          isDark ? "bg-[#333]" : "bg-white"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <IoIosSearch
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? "text-gray-400" : "text-gray-500"
              } w-5 h-5`}
            />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-3 pl-10 rounded-lg border transition-colors duration-300 focus:outline-none focus:ring-2 ${
                isDark
                  ? "bg-[#444] border-gray-600 text-white focus:ring-[#307A59]"
                  : "bg-white border-gray-300 text-[#242625] focus:ring-[#307A59]"
              }`}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm font-medium">
          {["all", "approved", "pending", "rejected"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1 rounded-full font-medium transition-colors duration-300 ${
                activeFilter === filter
                  ? "bg-[#307A59] text-white"
                  : isDark
                  ? "bg-[#555] text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleVendors.map((vendor) => (
          <VendorCard key={vendor.vendor_id} vendor={vendor} isDark={isDark} />
        ))}
      </div>

      {/* Load More */}
      {visibleCount < filteredVendors.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setVisibleCount(visibleCount + increment)}
            className="px-6 py-2 rounded-full bg-[#307A59] text-white font-medium hover:bg-[#265e46] transition-all duration-300"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
