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
    <div className="w-full mx-auto  p-6  rounded-2xl">
      <h1 className="text-3xl font-extrabold pb-3 opacity-90 ml-7">Vendors Management</h1>
      <div
        className={`min-h-screen p-6 transition-colors duration-500 ${
          isDark ? "bg-[var(--bg)] text-[var(--text)]" : "bg-[var(--bg)] text-[var(--text)]"
        }`}
      >
        {/* Search & Filters */}
        <div
          className={`p-6 mb-6 rounded-xl shadow-md transition-colors duration-500 border ${
            isDark ? "bg-[var(--bg)] border-[var(--border)]" : "bg-[var(--bg)] border-[var(--border)]"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <IoIosSearch
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? "bg-[var(--div)]" : "bg-[var(--textbox)]"
                } w-5 h-5`}
              />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-3 pl-10 rounded-lg border transition-colors duration-300 focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-[var(--div)] border-[var(--border)] text-[var(--text)] focus:ring-[#307A59]"
                    : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-[#307A59]"
                }`}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm font-medium cursor-pointer">
            {["all", "approved", "pending", "rejected"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1 rounded-full font-medium transition-colors duration-300 cursor-pointer ${
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setVisibleCount(visibleCount + increment)}
              className="px-6 py-2 rounded-full bg-[var(--button)] text-white font-medium hover:bg-[#2b7556] transition-all duration-300 cursor-pointer"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
