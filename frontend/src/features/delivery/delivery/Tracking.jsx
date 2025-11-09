import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTrackingOrder, getDeliveryEstimate } from "./Api/DeliveryAPI";
import MapView from "../../../components/MapView";
import {
  FaUser,
  FaIndustry,
  FaBox,
  FaCreditCard,
  FaRoute,
  FaEnvelope,
  FaPhone,
  FaComments,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaTrophy,
  FaMoneyBill,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

import { useSelector } from "react-redux";

export default function TrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    routeDetails: false,
    vendors: true,
    summary: false,
  });
  const navigate = useNavigate();
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  // =============== Load order + estimate ===============
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getTrackingOrder(orderId);
        setOrder(data);

        const customerAddressId = data?.shipping_address
          ? JSON.parse(data.shipping_address).id
          : null;

        const vendorIds = data?.items?.map((item) => item.vendor_id) || [];

        const deliveryUserId =
          data?.delivery_user_id || data?.delivery_company_user_id || null;

        if (!deliveryUserId) {
          setMessage("No delivery user assigned to this order");
          setLoading(false);
          return;
        }

        if (customerAddressId && vendorIds.length > 0 && deliveryUserId) {
          const est = await getDeliveryEstimate({
            userId: deliveryUserId,
            customerAddressId,
            vendorIds,
          });

          est.route = (est.route || []).map((r) => ({
            ...r,
            lat: r.latitude || r.lat,
            lng: r.longitude || r.lng,
          }));

          setEstimate(est);
        }
      } catch (err) {
        setMessage(err?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [orderId]);

  // =============== Data shaping ===============
  const mergedItemsArray = useMemo(() => {
    if (!order?.items || !Array.isArray(order.items)) return [];
    const merged = order.items.reduce((acc, item) => {
      const key = `${item.vendor_id}-${item.product_id}-${JSON.stringify(
        item.variant
      )}`;
      if (!acc[key]) acc[key] = { ...item };
      else acc[key].quantity += item.quantity;
      return acc;
    }, {});
    return Object.values(merged);
  }, [order]);

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

  const productsTotal = mergedItemsArray.reduce(
    (acc, item) => acc + item.quantity * item.item_price,
    0
  );
  const totalWithShipping =
    productsTotal +
    (estimate?.total_delivery_fee ??
      (Array.isArray(estimate?.route)
        ? estimate.route.reduce((s, r) => s + Number(r?.delivery_fee || 0), 0)
        : 0));

  const vendorsInRoute = (estimate?.route || []).filter(
    (r) => r.vendor_id !== null
  );
  const vendorsGrouped = vendorsInRoute
    .map((r) => {
      const products = mergedItemsArray.filter(
        (item) => item.vendor_id === r.vendor_id
      );
      const vendorInfo = order?.items?.find(
        (item) => item.vendor_id === r.vendor_id
      );
      return {
        vendor: {
          vendor_id: r.vendor_id,
          vendor_name:
            vendorInfo?.store_name || r.to || `Vendor ${r.vendor_id}`,
          vendor_email: vendorInfo?.vendor_email || "N/A",
          vendor_phone: vendorInfo?.vendor_phone || "N/A",
          latitude: vendorInfo?.latitude,
          longitude: vendorInfo?.longitude,
          distance_km: r.distance_km,
          delivery_fee: r.delivery_fee,
          duration_min: r.duration_min,
          vendor_user_id: vendorInfo?.vendor_user_id || null,
        },
        products,
      };
    })
    .sort(
      (a, b) =>
        (a.vendor.distance_km ?? Infinity) - (b.vendor.distance_km ?? Infinity)
    );

  const routePoints = [];
  if (estimate?.delivery_start) {
    routePoints.push({
      lat: estimate.delivery_start.latitude,
      lng: estimate.delivery_start.longitude,
      label: estimate.delivery_start.company_name || "Delivery Company",
    });
  }
  vendorsGrouped.forEach(({ vendor }) => {
    const vendorItem = order?.items?.find(
      (i) => i.vendor_id === vendor.vendor_id
    );
    if (vendorItem?.latitude && vendorItem?.longitude) {
      routePoints.push({
        lat: vendorItem.latitude,
        lng: vendorItem.longitude,
        label: vendor.vendor_name,
      });
    }
  });
  if (estimate?.customer) {
    routePoints.push({
      lat: estimate.customer.latitude,
      lng: estimate.customer.longitude,
      label: estimate.customer.name || "Customer",
    });
  }

  // =============== Status Flow (Stepper) ===============
  const STEPS = [
    { key: "accepted", label: "Accepted", color: "var(--primary)" },
    { key: "processing", label: "Processing", color: "var(--warning)" },
    {
      key: "out_for_delivery",
      label: "Out for Delivery",
      color: "var(--orange, #f97316)",
    },
    { key: "delivered", label: "Delivered", color: "var(--success)" },
  ];

  const currentIndex = useMemo(() => {
    const s = String(order?.status || "").toLowerCase();
    const idx = STEPS.findIndex((x) => x.key === s);
    return idx === -1 ? 0 : idx;
  }, [order?.status]);

  // =============== UI states ===============
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (message)
    return (
      <p className="text-left mt-10 text-[var(--error)] px-4">{message}</p>
    );

  if (!order)
    return (
      <p className="text-left mt-10 text-[var(--error)] px-4">
        ❌ Order not found
      </p>
    );

  // =============== Styles helpers ===============
  const cardBg = { background: isDarkMode ? "#313131" : "#f5f6f5" };
  const innerCardBg = { background: isDarkMode ? "#292e2c" : "#ffffff" };

  const circleStyle = (filled, color) => ({
    width: 28,
    height: 28,
    borderRadius: "9999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 700,
    backgroundColor: filled ? color : "var(--div)",
    color: filled ? "#fff" : "var(--text)",
    border: `2px solid ${filled ? color : "var(--border)"}`,
    flex: "0 0 auto",
  });

  const lineStyle = (filled, color) => ({
    height: 4,
    flex: 1,
    background: filled
      ? color
      : isDarkMode
      ? "rgba(255,255,255,0.15)"
      : "rgba(0,0,0,0.1)",
    borderRadius: 999,
  });

  // extra counts for summary
  const itemsCount = mergedItemsArray.reduce(
    (s, i) => s + Number(i.quantity || 0),
    0
  );

  const goChatWithVendor = (vendor) => {
    const vendorUserId =
      Number(
        vendor.vendor_user_id ??
          vendor.user_id ??
          vendor.vendorUserId ??
          vendor.vendor_owner_id
      ) || null;

    if (!vendorUserId) {
      alert("⚠️ Vendor user ID not found for this vendor.");
      return;
    }

    const vendorName = vendor.vendor_name || `Vendor #${vendor.vendor_id}`;

    navigate("/delivery/dashboard/chat", {
      state: {
        vendorUserId,
        vendorName,
        fromOrderId: order?.order_id,
      },
    });
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 bg-[var(--bg)] text-[var(--text)]">
      {/* ------ Title ------ */}
      <div className="mb-4 px-2">
        <h2 className="text-left text-xl sm:text-2xl md:text-3xl font-extrabold mt-6 sm:mt-8">
          Tracking Order #{order?.order_id || "N/A"}
        </h2>
      </div>

      {/* ------ Status Flow (Stepper) ------ */}
      <section
        className="rounded-2xl shadow-lg border border-[var(--border)] p-4 sm:p-5 mb-6 mx-2 sm:mx-0"
        style={cardBg}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {STEPS.map((step, i) => {
            const color = step.color;
            const isFilled = i <= currentIndex;
            const isDeliveredNow = STEPS[currentIndex]?.key === "delivered";
            const showCheck =
              isFilled &&
              (i < currentIndex || (isDeliveredNow && i === currentIndex));

            return (
              <div
                key={step.key}
                className="flex items-center gap-2 sm:gap-3 flex-1"
              >
                <div style={circleStyle(isFilled, color)}>
                  {showCheck ? "✓" : i + 1}
                </div>
                <div
                  className="hidden sm:block text-sm font-semibold"
                  style={{ color: isFilled ? color : "var(--text)" }}
                >
                  {step.label}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={lineStyle(i < currentIndex, color)} />
                )}
              </div>
            );
          })}
        </div>
        {/* labels for mobile under the bar */}
        <div className="sm:hidden mt-3 grid grid-cols-4 gap-1 text-[10px] xs:text-[11px] text-center">
          {STEPS.map((s, i) => {
            const filled = i <= currentIndex;
            return (
              <span
                key={s.key}
                className="truncate px-1"
                style={{ color: filled ? s.color : "var(--text)" }}
              >
                {s.label}
              </span>
            );
          })}
        </div>
      </section>

      {/* ===== Customer + Delivery Route Details ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-start mx-2 sm:mx-0">
        {/* Customer Card — 1/4 */}
        <section
          className="lg:col-span-1 rounded-2xl shadow-lg border border-[var(--border)] p-4 sm:p-6 h-full"
          style={cardBg}
        >
          <h3 className="flex items-center gap-2 text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            <FaUser className="text-sm sm:text-base" /> Customer Info
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <p className="text-sm sm:text-base">
              <span className="opacity-75">Name:</span>
              <br />
              <strong>{order?.customer_name || "N/A"}</strong>
            </p>
            <p className="text-sm sm:text-base">
              <span className="opacity-75">Phone:</span>
              <br />
              <strong>{order?.customer_phone || "N/A"}</strong>
            </p>
          </div>

          <div className="mt-3 sm:mt-4 pt-3 border-t border-[var(--border)]">
            <p className="text-xs opacity-80">
              <span className="opacity-75">Email:</span>{" "}
              {order?.customer_email || "N/A"}
            </p>
          </div>
        </section>

        {/* Delivery Route Details — 3/4 */}
        <section
          className="lg:col-span-3 rounded-2xl shadow-lg border border-[var(--border)] p-4 sm:p-6"
          style={cardBg}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
              <FaRoute className="text-sm sm:text-base" /> Delivery Route
              Details
            </h3>
            <button
              onClick={() => toggleSection("routeDetails")}
              className="lg:hidden p-2 rounded-lg border border-[var(--border)]"
              style={innerCardBg}
            >
              {expandedSections.routeDetails ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </button>
          </div>

          {/* ملخص سريع */}
          {estimate?.route && (
            <div
              className="rounded-xl border border-[var(--border)] p-3 sm:p-4 mb-4"
              style={innerCardBg}
            >
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-4 text-xs sm:text-sm">
                <p>
                  Distance:{" "}
                  <strong>
                    {estimate.route
                      .reduce((sum, step) => sum + (step.distance_km || 0), 0)
                      .toFixed(2)}{" "}
                    km
                  </strong>
                </p>
                <p>
                  Fee:{" "}
                  <strong>
                    {formatCurrency(
                      estimate?.total_delivery_fee ??
                        estimate.route.reduce(
                          (sum, step) => sum + (step.delivery_fee || 0),
                          0
                        )
                    )}
                  </strong>
                </p>
              </div>
            </div>
          )}

          {/* تفاصيل كل Segment - مخفية على الموبايل/تابلت إلا إذا مفتوحة */}
          <div
            className={`${
              expandedSections.routeDetails ? "block" : "hidden lg:block"
            } space-y-2 text-sm max-h-[240px] overflow-auto pr-1`}
          >
            {estimate?.route?.map((segment, idx) => (
              <div
                key={idx}
                className="leading-relaxed rounded-lg border border-[var(--border)] p-3"
                style={innerCardBg}
              >
                <strong className="text-[var(--primary)]">
                  {segment.from || `Step ${idx + 1}`}
                </strong>{" "}
                →{" "}
                <strong className="text-[var(--primary)]">{segment.to}</strong>{" "}
                : {segment.distance_km?.toFixed(2)} km, Delivery Fee:{" "}
                <span className="font-semibold">
                  {formatCurrency(segment.delivery_fee || 0)}
                </span>
                , Duration: {segment.duration_min?.toFixed(0)} min
              </div>
            ))}
            {!estimate?.route?.length && (
              <p className="opacity-70">No route segments.</p>
            )}
          </div>
        </section>
      </div>

      {/* ------ Map (Improved) ------ */}
      {routePoints.length >= 2 && (
        <section
          className="rounded-2xl shadow-lg border border-[var(--border)] p-4 sm:p-6 mt-6 mx-2 sm:mx-0"
          style={cardBg}
        >
          {/* Top bar: title + quick summary chips + legend */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg sm:text-xl font-semibold">Delivery Route</h3>

            {/* Quick numbers */}
            <div className="flex flex-wrap items-center gap-2">
              {(() => {
                const totalDistance = Number(
                  (estimate?.route || []).reduce(
                    (sum, s) => sum + Number(s?.distance_km || 0),
                    0
                  )
                ).toFixed(2);
                const totalFee =
                  estimate?.total_delivery_fee ??
                  (estimate?.route || []).reduce(
                    (sum, s) => sum + Number(s?.delivery_fee || 0),
                    0
                  );
                const totalStops = routePoints.length;

                return (
                  <>
                    <span
                      className="px-2 py-1 rounded-full border text-xs sm:text-sm"
                      style={{
                        borderColor: "var(--border)",
                        background: innerCardBg.background,
                      }}
                    >
                      Distance: <strong>{totalDistance} km</strong>
                    </span>
                    <span
                      className="px-2 py-1 rounded-full border text-xs sm:text-sm"
                      style={{
                        borderColor: "var(--border)",
                        background: innerCardBg.background,
                      }}
                    >
                      Fee: <strong>{formatCurrency(totalFee || 0)}</strong>
                    </span>
                    <span
                      className="px-2 py-1 rounded-full border text-xs sm:text-sm"
                      style={{
                        borderColor: "var(--border)",
                        background: innerCardBg.background,
                      }}
                    >
                      Stops: <strong>{totalStops}</strong>
                    </span>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-[var(--border)]"
              style={innerCardBg}
            >
              <FaRoute className="text-xs" /> Start
            </span>
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-[var(--border)]"
              style={innerCardBg}
            >
              <FaIndustry className="text-xs" /> Vendor
            </span>
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-[var(--border)]"
              style={innerCardBg}
            >
              <FaUser className="text-xs" /> Customer
            </span>
          </div>

          {/* Route pills */}
          {routePoints.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 mb-4 sm:mb-6 text-xs sm:text-sm font-medium">
              {routePoints.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2 rounded-full border border-[var(--border)] shadow-sm"
                  style={{ background: isDarkMode ? "#292e2c" : "#ffffff" }}
                  title={point?.label}
                >
                  <span className="inline-flex items-center">
                    {idx === 0 ? (
                      <FaRoute
                        className="text-xs"
                        aria-label="Delivery Start"
                      />
                    ) : idx === routePoints.length - 1 ? (
                      <FaUser className="text-xs" aria-label="Customer" />
                    ) : (
                      <FaIndustry className="text-xs" aria-label="Vendor" />
                    )}
                  </span>

                  <span className="truncate max-w-[80px] xs:max-w-[100px] sm:max-w-[140px] md:max-w-[180px] lg:max-w-[260px]">
                    {point?.label || "—"}
                  </span>

                  {idx < routePoints.length - 1 && (
                    <span className="mx-1 text-[var(--primary)] inline-flex items-center">
                      <FaRoute className="text-xs" aria-hidden="true" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Map */}
          <div className="rounded-xl overflow-hidden border border-[var(--border)] h-[300px] sm:h-[400px]">
            <MapView
              routePoints={routePoints}
              drawPolyline={true}
              polyline={estimate?.polyline}
            />
          </div>
        </section>
      )}

      {/* ------ Vendors + Products (Cards with images + Chat) ------ */}
      <section
        className="rounded-2xl shadow-lg border border-[var(--border)] p-4 sm:p-6 mt-6 mx-2 sm:mx-0"
        style={cardBg}
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
            <FaIndustry className="text-sm sm:text-base" /> Vendor - Product
            Info
          </h3>
          <button
            onClick={() => toggleSection("vendors")}
            className="lg:hidden p-2 rounded-lg border border-[var(--border)]"
            style={innerCardBg}
          >
            {expandedSections.vendors ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>

        {vendorsGrouped.length > 0 && expandedSections.vendors
          ? vendorsGrouped.map(({ vendor, products }, idx) => (
              <div
                key={vendor.vendor_id}
                className="p-4 sm:p-5 rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow duration-300 mb-4"
                style={innerCardBg}
              >
                {/* رأس الكارد: الاسم + الإيميل/الموبايل + زر الشات */}
                <div className="flex flex-col gap-3 mb-4">
                  {/* السطر الأول: اسم المتجر و Chips على اليمين */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <h4 className="text-base sm:text-lg font-bold flex items-center gap-2">
                      {vendor.vendor_name}
                    </h4>

                    {/* Chips: المسافة/الرسوم/المدة/الترتيب */}
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold">
                      <span className="px-2 py-1 rounded-full border border-[var(--border)] inline-flex items-center gap-1">
                        <FaMapMarkerAlt className="text-xs" />
                        <span className="hidden xs:inline">Dist:</span>
                        {vendor.distance_km != null
                          ? vendor.distance_km.toFixed(1)
                          : "—"}
                        km
                      </span>
                      <span className="px-2 py-1 rounded-full border border-[var(--border)] inline-flex items-center gap-1">
                        <FaDollarSign className="text-xs" />
                        {formatCurrency(vendor.delivery_fee || 0)}
                      </span>
                      <span className="px-2 py-1 rounded-full border border-[var(--border)] inline-flex items-center gap-1">
                        <FaClock className="text-xs" />
                        {vendor.duration_min != null
                          ? `${vendor.duration_min}m`
                          : "—"}
                      </span>
                      <span className="px-2 py-1 rounded-full border border-[var(--border)] inline-flex items-center gap-1">
                        <FaTrophy className="text-xs" /> #{idx + 1}
                      </span>
                    </div>
                  </div>

                  {/* السطر الثاني: ايميل/موبايل على اليسار + زر الشات على اليمين */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <a
                        href={
                          vendor.vendor_email
                            ? `mailto:${vendor.vendor_email}`
                            : undefined
                        }
                        className="inline-flex items-center gap-1 hover:underline"
                        style={{ color: "var(--text)" }}
                        title="Email"
                      >
                        <FaEnvelope className="text-xs" />
                        <span className="truncate max-w-[120px] sm:max-w-none">
                          {vendor.vendor_email || "N/A"}
                        </span>
                      </a>
                      <a
                        href={
                          vendor.vendor_phone
                            ? `tel:${vendor.vendor_phone}`
                            : undefined
                        }
                        className="inline-flex items-center gap-1 hover:underline"
                        style={{ color: "var(--text)" }}
                        title="Phone"
                      >
                        <FaPhone className="text-xs" />
                        <span className="truncate max-w-[100px] sm:max-w-none">
                          {vendor.vendor_phone || "N/A"}
                        </span>
                      </a>
                    </div>

                    <button
                      onClick={() => goChatWithVendor(vendor)}
                      className="px-3 py-2 rounded-xl font-semibold shadow-sm transition-transform hover:scale-105 inline-flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto justify-center"
                      style={{
                        background: "var(--button)",
                        color: "#fff",
                        border: "1px solid var(--button)",
                      }}
                      title="Chat with vendor"
                    >
                      <FaComments className="text-xs" /> Chat
                    </button>
                  </div>
                </div>

                {/* المنتجات + الصور */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {products.map((item) => (
                    <div
                      key={item.order_item_id}
                      className="flex gap-3 p-3 rounded-xl border border-[var(--border)]"
                      style={innerCardBg}
                    >
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.product_name}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-[var(--border)]"
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border border-[var(--border)] flex items-center justify-center text-xs opacity-70">
                          No Image
                        </div>
                      )}

                      <div className="flex-1 space-y-1 text-xs sm:text-sm">
                        <p className="font-semibold truncate">
                          {item.product_name}
                        </p>

                        {item.variant && (
                          <p className="opacity-80 text-xs">
                            {typeof item.variant === "object"
                              ? Object.entries(item.variant)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(", ")
                              : item.variant}
                          </p>
                        )}

                        <p>
                          Qty: {item.quantity} ×{" "}
                          {formatCurrency(item.item_price)}
                        </p>

                        <p className="font-semibold">
                          Total:{" "}
                          {formatCurrency(
                            (item.quantity || 0) * (item.item_price || 0)
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          : expandedSections.vendors && (
              <p className="text-sm opacity-70">No vendors found.</p>
            )}
      </section>

      {/* ------ Order Summary ------ */}
      {!!order?.items?.length &&
        (() => {
          const payment = String(order?.payment_status || "").toLowerCase();
          const paymentUI = {
            label:
              payment === "paid"
                ? "Paid"
                : payment === "pending"
                ? "Pending"
                : payment || "Unpaid",
            bg:
              payment === "paid"
                ? "var(--success)"
                : payment === "pending"
                ? "var(--orange, #f97316)"
                : "var(--error)",
          };

          const createdAt = order?.created_at
            ? new Date(order.created_at)
            : null;
          const createdAtStr = createdAt
            ? createdAt.toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "N/A";

          let addrObj = null;
          try {
            addrObj = order?.shipping_address
              ? JSON.parse(order.shipping_address)
              : null;
          } catch (_) {}
          const shippingDisplay = addrObj
            ? [
                addrObj.address_line1,
                addrObj.address_line2,
                addrObj.city,
                addrObj.state,
                addrObj.country,
                addrObj.postal_code,
              ]
                .filter(Boolean)
                .join(", ")
            : "N/A";

          return (
            <section
              className="rounded-2xl shadow-lg border border-[var(--border)] p-4 sm:p-6 mt-6 mx-2 sm:mx-0"
              style={cardBg}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-semibold">
                  Order Summary
                </h3>
                <button
                  onClick={() => toggleSection("summary")}
                  className="lg:hidden p-2 rounded-lg border border-[var(--border)]"
                  style={innerCardBg}
                >
                  {expandedSections.summary ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </button>
              </div>

              {expandedSections.summary && (
                <>
                  {/* Header + Chips */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {/* Items count */}
                      <span
                        className="px-2 py-1 rounded-full border text-xs sm:text-sm"
                        style={{
                          borderColor: "var(--border)",
                          background: innerCardBg.background,
                        }}
                      >
                        Items: <strong>{itemsCount}</strong>
                      </span>

                      {/* Vendors count */}
                      <span
                        className="px-2 py-1 rounded-full border text-xs sm:text-sm"
                        style={{
                          borderColor: "var(--border)",
                          background: innerCardBg.background,
                        }}
                      >
                        Vendors: <strong>{vendorsGrouped.length}</strong>
                      </span>

                      {/* Payment status badge */}
                      <span
                        className="px-2 py-1 rounded-full text-xs sm:text-sm font-semibold"
                        style={{
                          background: paymentUI.bg,
                          color: "#fff",
                          border: `1px solid ${paymentUI.bg}`,
                        }}
                        title="Payment Status"
                      >
                        <span className="inline-flex items-center gap-1">
                          <FaMoneyBill className="text-xs" /> {paymentUI.label}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Shipping address card */}
                  <div
                    className="mt-4 rounded-xl border border-[var(--border)] p-3 sm:p-4"
                    style={innerCardBg}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="mt-1">
                        <FaMapMarkerAlt className="text-sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm opacity-70 mb-1">
                          Shipping Address
                        </div>
                        <div className="text-sm sm:text-base break-words">
                          {shippingDisplay}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Totals row */}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-xs sm:text-sm opacity-70">
                        Products Total
                      </div>
                      <div className="text-xl sm:text-2xl font-bold mt-1">
                        {formatCurrency(productsTotal)}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs sm:text-sm opacity-70">
                        Order Total (with Shipping)
                      </div>
                      <div className="text-xl sm:text-2xl font-bold mt-1 text-[var(--primary)]">
                        {formatCurrency(totalWithShipping)}
                      </div>
                    </div>
                  </div>

                  {/* Created at */}
                  <div className="mt-3 pt-3 border-t border-[var(--border)]">
                    <p className="text-xs opacity-70">
                      <span className="opacity-75">Order Date:</span>{" "}
                      {createdAtStr}
                    </p>
                  </div>
                </>
              )}
            </section>
          );
        })()}

      {/* Back (centered) */}
      <div className="mt-6 flex justify-center px-2">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl hover:scale-105 transition-transform duration-200 bg-[var(--button)] text-white w-full sm:w-auto text-sm sm:text-base"
        >
          Back to Orders
        </button>
      </div>
    </div>
  );
}
