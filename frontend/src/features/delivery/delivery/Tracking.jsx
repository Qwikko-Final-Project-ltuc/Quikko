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
} from "react-icons/fa";


import { useSelector } from "react-redux";

export default function TrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
        <p className="text-[var(--text)] text-lg">Loading...</p>
      </div>
    </div>
  );
}

  if (message)
    return <p className="text-left mt-10 text-[var(--error)]">{message}</p>;

  if (!order)
    return (
      <p className="text-left mt-10 text-[var(--error)]">❌ Order not found</p>
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
    // نحاول نحصل على اليوزر آي دي للفندور من الداتا
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

    // اسم الفندور (اختياري لعرضه في صفحة الشات)
    const vendorName = vendor.vendor_name || `Vendor #${vendor.vendor_id}`;

    // الانتقال إلى صفحة الشات وتمرير البيانات
    navigate("/delivery/dashboard/chat", {
      state: {
        vendorUserId,
        vendorName,
        fromOrderId: order?.order_id,
      },
    });
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 bg-[var(--bg)] text-[var(--text)]">
      {/* ------ Title ------ */}
      <div className="mb-4">
        <h2 className="text-left text-3xl font-extrabold mt-8">
          Tracking Order #{order?.order_id || "N/A"}
        </h2>
      </div>

      {/* ------ Status Flow (Stepper) ------ */}
      <section
        className="rounded-2xl shadow-lg border border-[var(--border)] p-5 mb-6"
        style={cardBg}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {STEPS.map((step, i) => {
            const color = step.color;
            const isFilled = i <= currentIndex;

            // لو الحالة Delivered: آخر دائرة كمان تكون ✓
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
        <div className="sm:hidden mt-3 grid grid-cols-4 gap-2 text-[11px] text-center">
          {STEPS.map((s, i) => {
            const filled = i <= currentIndex;
            return (
              <span
                key={s.key}
                style={{ color: filled ? s.color : "var(--text)" }}
              >
                {s.label}
              </span>
            );
          })}
        </div>
      </section>

      {/* ===== Customer (1/4) + Delivery Route Details (3/4) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Customer Card — 1/4 */}
        <section
          className="lg:col-span-1 rounded-2xl shadow-lg border border-[var(--border)] p-6 h-full"
          style={cardBg}
        >
          <h3 className="flex items-center gap-2 text-xl font-semibold mb-4">
            <FaUser /> Customer Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <p>
              <span className="opacity-75">Name:</span>{" "}
              {order?.customer_name || "N/A"}
            </p>
            <p>
              <span className="opacity-75">Phone:</span>{" "}
              {order?.customer_phone || "N/A"}
            </p>
            {/* Address (اختياري) */}
            {/* <p><span className="opacity-75">Address:</span> ...</p> */}
          </div>

          {/* Email صغير بأسفل الكارد */}
          <div className="mt-4 pt-3 border-t border-[var(--border)]">
            <p className="text-xs opacity-80">
              <span className="opacity-75">Email:</span>{" "}
              {order?.customer_email || "N/A"}
            </p>
          </div>
        </section>

        {/* Delivery Route Details — 3/4 */}
        <section
          className="lg:col-span-3 rounded-2xl shadow-lg border border-[var(--border)] p-6"
          style={cardBg}
        >
          <h3 className="flex items-center gap-2 text-xl font-semibold mb-4">
            <FaRoute /> Delivery Route Details
          </h3>

          {/* ملخص سريع */}
          {estimate?.route && (
            <div
              className="rounded-xl border border-[var(--border)] p-4 mb-4"
              style={innerCardBg}
            >
              <p className="text-sm">
                Total Distance:{" "}
                <strong>
                  {estimate.route
                    .reduce((sum, step) => sum + (step.distance_km || 0), 0)
                    .toFixed(2)}{" "}
                  km
                </strong>
              </p>
              <p className="text-sm">
                Total Delivery Fee:{" "}
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
          )}

          {/* تفاصيل كل Segment */}
          <div className="space-y-2 text-sm max-h-[240px] overflow-auto pr-1">
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
          className="rounded-2xl shadow-lg border border-[var(--border)] p-6 mt-6"
          style={cardBg}
        >
          {/* Top bar: title + quick summary chips + legend */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-semibold">Delivery Route</h3>

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
                      className="px-3 py-1 rounded-full border text-sm"
                      style={{
                        borderColor: "var(--border)",
                        background: innerCardBg.background,
                      }}
                    >
                      Distance: <strong>{totalDistance} km</strong>
                    </span>
                    <span
                      className="px-3 py-1 rounded-full border text-sm"
                      style={{
                        borderColor: "var(--border)",
                        background: innerCardBg.background,
                      }}
                    >
                      Fee: <strong>{formatCurrency(totalFee || 0)}</strong>
                    </span>
                    <span
                      className="px-3 py-1 rounded-full border text-sm"
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
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span
              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-[var(--border)]"
              style={innerCardBg}
            >
              <FaRoute /> Start
            </span>
            <span
              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-[var(--border)]"
              style={innerCardBg}
            >
              <FaIndustry /> Vendor
            </span>
            <span
              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-[var(--border)]"
              style={innerCardBg}
            >
              <FaUser /> Customer
            </span>
          </div>

          {/* Route pills */}
          {routePoints.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4 mb-6 text-sm sm:text-base font-medium">
              {routePoints.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] shadow-sm"
                  style={{ background: isDarkMode ? "#292e2c" : "#ffffff" }}
                  title={point?.label}
                >
                  <span className="inline-flex items-center">
                    {idx === 0 ? (
                      <FaRoute aria-label="Delivery Start" />
                    ) : idx === routePoints.length - 1 ? (
                      <FaUser aria-label="Customer" />
                    ) : (
                      <FaIndustry aria-label="Vendor" />
                    )}
                  </span>

                  <span className="truncate max-w-[180px] sm:max-w-[260px]">
                    {point?.label || "—"}
                  </span>

                  {idx < routePoints.length - 1 && (
                    <span className="mx-1 text-[var(--primary)] inline-flex items-center">
                      <FaRoute aria-hidden="true" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Map */}
          <div className="rounded-xl overflow-hidden border border-[var(--border)]">
            <MapView
              routePoints={routePoints}
              drawPolyline={true}
              polyline={estimate?.polyline}
            />
          </div>

          {/* Collapsible Details */}
          {/* <RouteDetails
            estimate={estimate}
            innerCardBg={innerCardBg}
            formatCurrency={formatCurrency}
          /> */}
        </section>
      )}

      {/* ------ Vendors + Products (Cards with images + Chat) ------ */}
      <section
        className="rounded-2xl shadow-lg border border-[var(--border)] p-6 mt-6"
        style={cardBg}
      >
        <h3 className="flex items-center gap-2 text-xl font-semibold mb-4">
          <FaIndustry /> Vendor - Product Info
        </h3>

        {vendorsGrouped.length > 0 ? (
          vendorsGrouped.map(({ vendor, products }, idx) => (
            <div
              key={vendor.vendor_id}
              className="p-5 rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow duration-300 mb-5"
              style={innerCardBg}
            >
              {/* رأس الكارد: الاسم + الإيميل/الموبايل + زر الشات */}
              <div className="flex flex-col gap-3 mb-4">
                {/* السطر الأول: اسم المتجر و Chips على اليمين */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <h4 className="text-lg font-bold flex items-center gap-2">
                    {vendor.vendor_name}
                  </h4>

                  {/* Chips: المسافة/الرسوم/المدة/الترتيب */}
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span className="px-3 py-1 rounded-full border border-[var(--border)] inline-flex items-center gap-2">
                      <FaMapMarkerAlt /> Distance:{" "}
                      {vendor.distance_km != null
                        ? vendor.distance_km.toFixed(2)
                        : "—"}{" "}
                      km
                    </span>
                    <span className="px-3 py-1 rounded-full border border-[var(--border)] inline-flex items-center gap-2">
                      <FaDollarSign /> Fee:{" "}
                      {formatCurrency(vendor.delivery_fee || 0)}
                    </span>
                    <span className="px-3 py-1 rounded-full border border-[var(--border)] inline-flex items-center gap-2">
                      <FaClock /> Duration:{" "}
                      {vendor.duration_min != null
                        ? `${vendor.duration_min} min`
                        : "—"}
                    </span>
                    <span className="px-3 py-1 rounded-full border border-[var(--border)] inline-flex items-center gap-2">
                      <FaTrophy /> Rank: {idx + 1}
                    </span>
                  </div>
                </div>

                {/* السطر الثاني: ايميل/موبايل على اليسار + زر الشات على اليمين */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <a
                      href={
                        vendor.vendor_email
                          ? `mailto:${vendor.vendor_email}`
                          : undefined
                      }
                      className="inline-flex items-center gap-2 hover:underline"
                      style={{ color: "var(--text)" }}
                      title="Email"
                    >
                      <FaEnvelope /> {vendor.vendor_email || "N/A"}
                    </a>
                    <a
                      href={
                        vendor.vendor_phone
                          ? `tel:${vendor.vendor_phone}`
                          : undefined
                      }
                      className="inline-flex items-center gap-2 hover:underline"
                      style={{ color: "var(--text)" }}
                      title="Phone"
                    >
                      <FaPhone /> {vendor.vendor_phone || "N/A"}
                    </a>
                  </div>

                  <button
                    onClick={() => goChatWithVendor(vendor)}
                    className="px-4 py-2 rounded-xl font-semibold shadow-sm transition-transform hover:scale-105 inline-flex items-center gap-2"
                    style={{
                      background: "var(--button)",
                      color: "#fff",
                      border: "1px solid var(--button)",
                    }}
                    title="Chat with vendor"
                  >
                    <FaComments /> Chat
                  </button>
                </div>
              </div>

              {/* المنتجات + الصور */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((item) => (
                  <div
                    key={item.order_item_id}
                    className="flex gap-4 p-3 rounded-xl border border-[var(--border)]"
                    style={innerCardBg}
                  >
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.product_name}
                        className="w-28 h-28 object-cover rounded-lg border border-[var(--border)]"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-lg border border-[var(--border)] flex items-center justify-center text-xs opacity-70">
                        No Image
                      </div>
                    )}

                    <div className="flex-1 space-y-1">
                      <p className="font-semibold">{item.product_name}</p>

                      {item.variant && (
                        <p className="text-sm opacity-80">
                          {typeof item.variant === "object"
                            ? Object.entries(item.variant)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(", ")
                            : item.variant}
                        </p>
                      )}

                      <p>
                        Quantity: {item.quantity} ×{" "}
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
        ) : (
          <p className="text-sm opacity-70">No vendors found.</p>
        )}
      </section>

      {/* ------ Order Summary ------ */}
      {!!order?.items?.length &&
        (() => {
          // Helpers
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
              className="rounded-2xl shadow-lg border border-[var(--border)] p-6 mt-6"
              style={cardBg}
            >
              {/* Header + Chips */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-semibold">Order Summary</h3>

                <div className="flex flex-wrap gap-2">
                  {/* Items count */}
                  <span
                    className="px-3 py-1 rounded-full border text-sm"
                    style={{
                      borderColor: "var(--border)",
                      background: innerCardBg.background,
                    }}
                  >
                    Items in this order: <strong>{itemsCount}</strong>
                  </span>

                  {/* Vendors count */}
                  <span
                    className="px-3 py-1 rounded-full border text-sm"
                    style={{
                      borderColor: "var(--border)",
                      background: innerCardBg.background,
                    }}
                  >
                    Vendors: <strong>{vendorsGrouped.length}</strong>
                  </span>

                  {/* Payment status badge */}
                  <span
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      background: paymentUI.bg,
                      color: "#fff",
                      border: `1px solid ${paymentUI.bg}`,
                    }}
                    title="Payment Status"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FaMoneyBill /> {paymentUI.label}
                    </span>
                  </span>

                  {/* Created at */}
                  <span
                    className="px-3 py-1 rounded-full border text-sm"
                    style={{
                      borderColor: "var(--border)",
                      background: innerCardBg.background,
                    }}
                    title="Order Date"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FaClock /> {createdAtStr}
                    </span>
                  </span>
                </div>
              </div>

              {/* Shipping address card */}
              <div
                className="mt-4 rounded-xl border border-[var(--border)] p-4"
                style={innerCardBg}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm opacity-70 mb-1">
                      Shipping Address
                    </div>
                    <div className="text-base">{shippingDisplay}</div>

                    {/* لو بدك تبيني الإحداثيات بشكل خفيف */}
                    {addrObj?.latitude && addrObj?.longitude && (
                      <div className="text-xs opacity-70 mt-1">
                        ({addrObj.latitude}, {addrObj.longitude})
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Totals row */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-sm opacity-70">Products Total</div>
                  <div className="text-2xl font-bold mt-1">
                    {formatCurrency(productsTotal)}
                  </div>
                </div>

                <div>
                  <div className="text-sm opacity-70">
                    Order Total (with Shipping)
                  </div>
                  <div className="text-2xl font-bold mt-1 text-[var(--primary)]">
                    {formatCurrency(totalWithShipping)}
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

      {/* Back (centered) */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl hover:scale-105 transition-transform duration-200 bg-[var(--button)] text-white"
        >
          Back to Orders
        </button>
      </div>
    </div>
  );
}

