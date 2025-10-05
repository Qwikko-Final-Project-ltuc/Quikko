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
    <>
      <div className="p-4 bg-white rounded-lg shadow-md mb-6">
        <div className="flex items-center mb-4 space-x-4">
          <div className="relative flex-1">
            <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowCoverageDropdown(!showCoverageDropdown)}
              className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <FaFilter className="w-5 h-5" />
              <span className="hidden sm:inline">Coverage</span>
            </button>

            {showCoverageDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setCoverageFilter("all");
                    setShowCoverageDropdown(false);
                  }}
                  className={`block w-full text-left px-4 py-2 ${
                    coverageFilter === "all"
                      ? "bg-blue-500 text-white"
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
                    className={`block w-full text-left px-4 py-2 ${
                      coverageFilter === area
                        ? "bg-blue-500 text-white"
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
        <div className="flex space-x-4 text-sm font-medium">
          {["all", "approved", "pending", "rejected"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full ${
                activeFilter === filter
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(filteredDelivery) &&
          visibleDelivery.map((delivery) => (
            <DeliveryCard key={delivery.company_id} delivery={delivery} />
          ))}
      </div>

      {visibleCount < filteredDelivery.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setVisibleCount(visibleCount + increment)}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
}
