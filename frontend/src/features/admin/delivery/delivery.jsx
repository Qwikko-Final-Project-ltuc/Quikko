import { DeliveryCompanies } from "./deliveryApi";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDelivery } from "./deliverySlice";
import DeliveryCard from "./deliveryCard";
import { IoIosSearch } from "react-icons/io";
import { FaFilter } from "react-icons/fa";

export default function DeliveryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [coverageFilter, setCoverageFilter] = useState("all");
  const [showCoverageDropdown, setShowCoverageDropdown] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  const dispatch = useDispatch();
  const delivery = useSelector((state) => state.deliveries.deliveries);

  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  useEffect(() => {
    const handleDelivery = async () => {
      try {
        const result = await DeliveryCompanies();

        dispatch(setDelivery(result.data || []));
      } catch (err) {
        alert(err.message);
      }
    };
    handleDelivery();
  }, [dispatch]);

  const allCoverageAreas = [
    ...new Set(delivery.flatMap((d) => d.coverage_areas || [])),
  ];

  const filteredDelivery = delivery.filter((delivery) => {
    const matchesSearch = delivery.company_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "all" || delivery.status === activeFilter;

    const matchesCoverage =
      coverageFilter === "all" ||
      (delivery.coverage_areas &&
        delivery.coverage_areas.includes(coverageFilter));

    return matchesSearch && matchesFilter && matchesCoverage;
  });

  const increment = 6;
  const visibleDelivery = filteredDelivery.slice(0, visibleCount);

  return (
    <div className={`min-h-screen p-6 transition-colors duration-500 ${
      isDark ? "bg-[#242625] text-white" : "bg-[#f0f2f1] text-[#242625]"
    }`}>
      {/* Search & Filters */}
      <div className={`p-4 rounded-xl shadow-md mb-6 transition-colors duration-500 ${
        isDark ? "bg-[#333]" : "bg-white"
      }`}>
        <div className="flex flex-col sm:flex-row items-center mb-4 sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="relative flex-1">
            <IoIosSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`} />
            <input
              type="text"
              placeholder="Search delivery companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors duration-300 focus:outline-none focus:ring-2 ${
                isDark
                  ? "bg-[#444] border-gray-600 text-white focus:ring-[#307A59]"
                  : "bg-white border-gray-300 text-[#242625] focus:ring-[#307A59]"
              }`}
            />
          </div>

          {/* Coverage Filter */}
          <div className="relative">
            <button
              onClick={() => setShowCoverageDropdown(!showCoverageDropdown)}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                isDark
                  ? "bg-[#555] text-white hover:bg-[#666]"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FaFilter className="w-5 h-5" />
              <span className="hidden sm:inline">Coverage</span>
            </button>

            {showCoverageDropdown && (
              <div className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg z-50 ${
                isDark ? "bg-[#333] border border-gray-600" : "bg-white border border-gray-300"
              }`}>
                <button
                  onClick={() => { setCoverageFilter("all"); setShowCoverageDropdown(false); }}
                  className={`block w-full text-left px-4 py-2 rounded transition-colors duration-200 ${
                    coverageFilter === "all"
                      ? "bg-[#307A59] text-white"
                      : isDark ? "hover:bg-[#444] text-white" : "hover:bg-gray-100"
                  }`}
                >
                  All Areas
                </button>
                {allCoverageAreas.map((area) => (
                  <button
                    key={area}
                    onClick={() => { setCoverageFilter(area); setShowCoverageDropdown(false); }}
                    className={`block w-full text-left px-4 py-2 rounded transition-colors duration-200 ${
                      coverageFilter === area
                        ? "bg-[#307A59] text-white"
                        : isDark ? "hover:bg-[#444] text-white" : "hover:bg-gray-100"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-3 text-sm font-medium">
          {["all", "approved", "pending", "rejected"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full transition-colors duration-200 ${
                activeFilter === filter
                  ? "bg-[#307A59] text-white"
                  : isDark ? "bg-[#555] text-white hover:bg-[#666]" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Delivery Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(filteredDelivery) &&
          visibleDelivery.map((delivery) => (
            <DeliveryCard key={delivery.company_id} delivery={delivery} />
          ))}
      </div>

      {/* Load More */}
      {visibleCount < filteredDelivery.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setVisibleCount(visibleCount + increment)}
            className={`px-6 py-2 rounded-full font-medium transition-colors duration-300 ${
              isDark ? "bg-[#307A59] hover:bg-[#265e46] text-white" : "bg-[#307A59] hover:bg-[#265e46] text-white"
            }`}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
