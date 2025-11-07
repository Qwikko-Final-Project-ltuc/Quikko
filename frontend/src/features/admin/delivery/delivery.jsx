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
    <div className="w-full mx-auto  p-6  rounded-2xl">
      <h1 className="text-3xl font-extrabold pb-3 opacity-90 mb-5">Delivery Companies Management</h1>
      <div
        className={`min-h-screen p-6 transition-colors duration-500 ${
          isDark
            ? "bg-[var(--bg)] text-[var(--text)]"
            : "bg-[var(--bg)] text-[var(--text)]"
        }`}
      >
        {/* Search & Filters */}
        <div
          className={`p-6 rounded-xl shadow-md mb-6 transition-colors duration-500 border ${
            isDark ? "bg-[var(--bg)] border-[var(--border)]" : "bg-[var(--bg)] border-[var(--border)]"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center mb-4 sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="relative flex-1">
              <IoIosSearch
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? "text-[var(--text)]" : "text-[var(--text)]"
                }`}
              />
              <input
                type="text"
                placeholder="Search delivery companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-3 pl-10 rounded-lg border transition-colors duration-300 focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-[var(--div)] border-[var(--border)] text-[var(--text)] focus:ring-[#307A59]"
                    : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-[#307A59]"
                }`}
              />
            </div>

            {/* Coverage Filter */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowCoverageDropdown(!showCoverageDropdown)}
                className={`flex items-center p-3 space-x-2 p-2 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? "bg-[var(--hover)] text-[var(--text)] hover:bg-[#666]"
                    : "bg-gray-200 text-[var(--text)] hover:bg-[var(--hover)]"
                }`}
              >
                <FaFilter className="w-5 h-5" />
                <span className="hidden sm:inline">Coverage</span>
              </button>

              {showCoverageDropdown && (
                <div
                  className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg z-50 ${
                    isDark
                      ? "bg-[var(--bg)] border border-[var(--border)]"
                      : "bg-[var(--bg)] border border-[var(--border)]"
                  }`}
                >
                  <button
                    onClick={() => {
                      setCoverageFilter("all");
                      setShowCoverageDropdown(false);
                    }}
                    className={`block w-full text-left px-4 py-2 rounded transition-colors duration-200 cursor-pointer ${
                      coverageFilter === "all"
                        ? "bg-[#307A59] text-white"
                        : isDark
                        ? "hover:bg-[#444] text-white"
                        : "hover:bg-gray-100"
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
                      className={`block w-full text-left px-4 py-2 rounded transition-colors duration-200 cursor-pointer ${
                        coverageFilter === area
                          ? "bg-[#307A59] text-white"
                          : isDark
                          ? "hover:bg-[#444] text-white"
                          : "hover:bg-gray-100"
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
                className={`px-3 py-1 rounded-full transition-colors duration-200 cursor-pointer ${
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
