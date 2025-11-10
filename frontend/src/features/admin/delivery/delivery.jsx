import { DeliveryCompanies } from "./deliveryApi";
import { useEffect, useRef, useState } from "react";
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

  const dropdownRef = useRef(null);
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCoverageDropdown(false);
      }
    }

    if (showCoverageDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCoverageDropdown]);

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
    <div className="w-full mx-auto p-4 sm:p-6 rounded-2xl mt-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold pb-2 sm:pb-3 opacity-90 mb-4 sm:mb-5">
        Delivery Companies Management
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
          className={`p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-6 transition-colors duration-500 border ${
            isDark
              ? "bg-[var(--bg)] border-[var(--border)]"
              : "bg-[var(--bg)] border-[var(--border)]"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center mb-4 gap-3 sm:gap-4">
            <div className="relative flex-1 w-full">
              <IoIosSearch
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${
                  isDark ? "text-[var(--text)]" : "text-[var(--text)]"
                }`}
              />
              <input
                type="text"
                placeholder="Search delivery companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-2 sm:p-3 pl-8 sm:pl-10 rounded-lg border transition-colors duration-300 focus:outline-none focus:ring-2 text-sm sm:text-base ${
                  isDark
                    ? "bg-[var(--div)] border-[var(--border)] text-[var(--text)] focus:ring-[#307A59]"
                    : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-[#307A59]"
                }`}
              />
            </div>

            {/* Coverage Filter */}
            <div className="relative w-full sm:w-auto" ref={dropdownRef}>
              <button
                onClick={() => setShowCoverageDropdown(!showCoverageDropdown)}
                className={`flex items-center justify-center sm:justify-start p-2 sm:p-3 space-x-2 p-2 rounded-lg transition-colors cursor-pointer w-full sm:w-auto text-sm sm:text-base ${
                  isDark
                    ? "bg-[var(--hover)] text-[var(--text)] hover:bg-[#666]"
                    : "bg-gray-200 text-[var(--text)] hover:bg-[var(--hover)]"
                }`}
              >
                <FaFilter className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>Coverage</span>
              </button>

              {showCoverageDropdown && (
                <div
                  className={`absolute right-0 sm:right-0 mt-2 w-full sm:w-48 rounded-lg shadow-lg z-50 border max-h-60 overflow-y-auto ${
                    isDark
                      ? "bg-[var(--bg)] border-[var(--border)]"
                      : "bg-[var(--bg)] border-[var(--border)]"
                  }`}
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: isDark
                      ? "#036f4dff #1c222d83"
                      : "#0b7c56ff #f1f5f9",
                  }}
                >
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      width: 6px;
                    }
                    div::-webkit-scrollbar-track {
                      background: ${isDark ? "#1c222d83" : "#f1f5f9"};
                      border-radius: 10px;
                    }
                    div::-webkit-scrollbar-thumb {
                      background: ${isDark ? "#036f4dff" : "#0b7c56ff"};
                      border-radius: 10px;
                    }
                    div::-webkit-scrollbar-thumb:hover {
                      background: ${isDark ? "#0e8462d8" : "#0a664aff"};
                    }
                  `}</style>
                  <button
                    onClick={() => {
                      setCoverageFilter("all");
                      setShowCoverageDropdown(false);
                    }}
                    className={`block w-full text-left px-3 sm:px-4 py-2 text-sm sm:text-base transition-colors duration-200 cursor-pointer ${
                      coverageFilter === "all"
                        ? "bg-[#307A59] text-white"
                        : isDark
                        ? "hover:bg-[var(--hover)] text-white"
                        : "hover:bg-gray-100 text-gray-800"
                    }`}
                  >
                    All Areas
                  </button>
                  {allCoverageAreas.map((area) => (
                    <button
                      key={area}
                      onClick={() => {
                        setCoverageFilter(area);
                        setShowCoverageDropdown(false);
                      }}
                      className={`block w-full text-left px-3 sm:px-4 py-2 text-sm sm:text-base transition-colors duration-200 cursor-pointer ${
                        coverageFilter === area
                          ? "bg-[#307A59] text-white"
                          : isDark
                          ? "hover:bg-[var(--hover)] text-white"
                          : "hover:bg-gray-100 text-gray-800"
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
          <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
            {["all", "approved", "pending", "rejected"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full transition-colors duration-200 cursor-pointer whitespace-nowrap ${
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

        {/* Delivery Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.isArray(filteredDelivery) &&
            visibleDelivery.map((delivery) => (
              <DeliveryCard
                key={delivery.company_id}
                delivery={delivery}
                isDark={isDark}
              />
            ))}
        </div>

        {/* Load More */}
        {visibleCount < filteredDelivery.length && (
          <div className="flex justify-center mt-4 sm:mt-6">
            <button
              onClick={() => setVisibleCount(visibleCount + increment)}
              className="px-5 sm:px-6 py-2 sm:py-3 rounded-full bg-[var(--button)] text-white font-medium hover:bg-[#2b7556] transition-all duration-300 cursor-pointer text-sm sm:text-base"
            >
              Load More
            </button>
          </div>
        )}

        {visibleDelivery.length > 0 && (
          <div className="text-center mt-4 sm:mt-6">
            <p
              className={`text-sm sm:text-base ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Showing {visibleDelivery.length} of {filteredDelivery.length}{" "}
              Delivery Companies
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
