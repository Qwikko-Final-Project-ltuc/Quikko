import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTrackingOrder, getDeliveryEstimate } from "./DeliveryAPI";
import MapView from "../../../components/MapView";
import {
  FaUser,
  FaIndustry,
  FaBox,
  FaCreditCard,
  FaRoute,
} from "react-icons/fa";
import { getTrackingOrder } from "./DeliveryAPI";
import { FaUser, FaIndustry, FaBox, FaCreditCard } from "react-icons/fa";
import { useSelector } from "react-redux";

export default function TrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getTrackingOrder(orderId);
        setOrder(data);

        const customerAddressId = data?.shipping_address
          ? JSON.parse(data.shipping_address).id
          : null;

        const vendorIds = data.items?.map((item) => item.vendor_id) || [];

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
          setEstimate(est);
          console.log("Delivery estimate:", est);
        }
      } catch (err) {
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [orderId]);

  const mergedItems =
    order?.items && Array.isArray(order.items)
      ? order.items.reduce((acc, item) => {
          const key = `${item.vendor_id}-${item.product_id}-${JSON.stringify(
            item.variant
          )}`;
          if (!acc[key]) {
            acc[key] = { ...item };
          } else {
            acc[key].quantity += item.quantity;
          }
          return acc;
        }, {})
      : {};

  const mergedItemsArray = Object.values(mergedItems || {});

  if (loading) return <p className="text-center mt-10"> Loading order...</p>;
  if (message)
    return <p className="text-center mt-10 text-red-500">{message}</p>;
  if (!order) return <p className="text-center mt-10">❌ Order not found</p>;

  const formatCurrency = (value) =>
    value.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const productsTotal = mergedItemsArray.reduce(
    (acc, item) => acc + item.quantity * item.item_price,
    0
  );
  const totalWithShipping = productsTotal + (estimate?.total_delivery_fee || 0);

  // Route segments for vendors (from estimate)
  const vendorsInRoute =
    estimate?.route?.filter((r) => r.vendor_id !== null) || [];

  // Map each vendor with products + contact info
  const vendorsGrouped = vendorsInRoute.map((vr) => {
    const products = mergedItemsArray.filter(
      (item) => item.vendor_id === vr.vendor_id
    );

    // Find first product for vendor info (email, phone, store_name)
    const vendorInfo = order.items.find(
      (item) => item.vendor_id === vr.vendor_id
    );

    return {
      vendor: {
        vendor_id: vr.vendor_id,
        vendor_name: vendorInfo?.store_name || vr.to || "Unknown Vendor",
        vendor_email: vendorInfo?.vendor_email || "N/A",
        vendor_phone: vendorInfo?.vendor_phone || "N/A",
        distance_km: vr.distance_km,
        delivery_fee: vr.delivery_fee,
        duration_min: vr.duration_min,
      },
      products,
    };
  });

  // Sort vendors by distance
  vendorsGrouped.sort(
    (a, b) =>
      (a.vendor.distance_km ?? Infinity) - (b.vendor.distance_km ?? Infinity)
  );

  // Nearest vendor
  const nearestVendor = vendorsGrouped[0]?.vendor.vendor_name || "N/A";

  const routePoints =
    estimate?.route?.map((r) => ({
      lat: r.latitude || r.lat,
      lng: r.longitude || r.lng,
      label: r.to,
    })) || [];

  if (estimate?.delivery_start) {
    routePoints.unshift({
      lat: estimate.delivery_start.latitude,
      lng: estimate.delivery_start.longitude,
      label: estimate.delivery_start.label,
    });
  }

  if (estimate?.customer) {
    routePoints.push({
      lat: estimate.customer.latitude,
      lng: estimate.customer.longitude,
      label: estimate.customer.label,
    });
  }

  const goChatWithVendor = (vendor) => {
    const vendorName =
      vendor.vendor_name || `Vendor #${vendor.vendor_id || ""}`;

    const vendorUserId =
      Number(
        vendor.vendor_user_id ??
          vendor.user_id ??
          vendor.vendorUserId ??
          vendor.vendor_userId ??
          vendor.vendor_owner_id
      ) || null;

    if (!Number.isFinite(vendorUserId) || vendorUserId <= 0) {
      alert("Vendor user id not available for this order item.");
      return;
    }

    navigate("/delivery/dashboard/chat", {
      state: {
        vendorUserId,
        vendorName,
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-10 p-6">
      <h2
        className="flex items-center justify-center gap-3 text-3xl font-bold mb-8 "
        style={{
          backgroundColor: isDarkMode ? "#242625" : "#f0f2f1",
          color: isDarkMode ? "#ffffff" : "#242625",
        }}
      >
        Tracking Order #{order?.order_id || "N/A"}
      </h2>

      {/* Customer Info */}
      <section
        className="p-6 rounded-2xl shadow-lg  hover:shadow-xl transition-shadow duration-300"
        style={{
          backgroundColor: isDarkMode ? "#666666" : "#ffffff",
          color: isDarkMode ? "#ffffff" : "#242625",
        }}
      >
        <h3
          className="flex items-center gap-2 text-xl font-semibold mb-4"
          style={{
            color: isDarkMode ? "#ffffff" : "#242625",
          }}
        >
          <FaUser
            style={{
              color: isDarkMode ? "#ffffff" : "#242625",
            }}
          />{" "}
          Customer Info
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <p>
            <strong
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              Name:
            </strong>{" "}
            {order?.customer_name || "N/A"}
          </p>
          <p>
            <strong
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              Email:
            </strong>{" "}
            {order?.customer_email || "N/A"}
          </p>
          <p>
            <strong
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              Phone:
            </strong>{" "}
            {order?.customer_phone || "N/A"}
          </p>
        </div>
      </section>


      <section
        className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
        style={{
          backgroundColor: isDarkMode ? "#555" : "#fdfdfd",
          color: isDarkMode ? "#ffffff" : "#242625",
        }}
      >
        <h3 className="flex items-center gap-2 text-xl font-semibold mb-4">
          <FaRoute /> Delivery Route Details
        </h3>
        <div className="space-y-2 text-sm">
          {estimate?.route?.map((segment, idx) => (
            <p key={idx}>
              <strong>{segment.from || `Step ${idx + 1}`}</strong> →{" "}
              <strong>{segment.to}</strong> : {segment.distance_km?.toFixed(2)}{" "}
              km, Delivery Fee: {formatCurrency(segment.delivery_fee || 0)},
              Duration: {segment.duration_min?.toFixed(0)} min
            </p>
          ))}
        </div>

        {estimate?.route && (
          <p className="mt-2 text-sm opacity-70">
            Total Distance:{" "}
            {estimate.route
              .reduce((sum, step) => sum + (step.distance_km || 0), 0)
              .toFixed(2)}{" "}
            km | Total Delivery Fee:{" "}
            {formatCurrency(
              estimate.route.reduce(
                (sum, step) => sum + (step.delivery_fee || 0),
                0
              )
            )}
          </p>
        )}
      </section>

      {routePoints.length >= 2 && (
        <section className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-xl font-semibold mb-4">Delivery Route</h3>
          <MapView routePoints={routePoints} drawPolyline={true} />
        </section>
      )}

      {/* Vendor / Product Info */}
      <section
        className="p-6 bg-white rounded-2xl shadow-lg"
        style={{
          backgroundColor: isDarkMode ? "#666666" : "#ffffff",
          color: isDarkMode ? "#ffffff" : "#242625",
        }}
      >
        <h3
          className="flex items-center gap-2 text-xl font-semibold mb-4 "
          style={{
            color: isDarkMode ? "#ffffff" : "#242625",
          }}
        >
          <FaIndustry
            style={{
              color: isDarkMode ? "#ffffff" : "#242625",
            }}
          />{" "}
          Vendor - Product Info
        </h3>

        {vendorsGrouped.length > 0 ? (
          vendorsGrouped.map(({ vendor, products }, idx) => (
            <div
              key={vendor.vendor_id}
              className="p-4 border rounded-2xl mb-4 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <h4
                className="text-lg font-bold mb-3"
        {Object.values(
          mergedItemsArray.reduce((acc, item) => {
            if (!acc[item.vendor_id])
              acc[item.vendor_id] = { vendor: item, products: [] };
            acc[item.vendor_id].products.push(item);
            return acc;
          }, {})
        ).map(({ vendor, products }) => (
          <div
            key={vendor.vendor_id}
            className="p-4 border rounded-2xl mb-4 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <h4
                className="text-lg font-bold "
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                {vendor.vendor_name}
              </h4>

              {/* Delivery Info */}
              <div className="flex gap-4 mb-3 text-sm font-semibold">
                <p>
                  <strong>Distance:</strong> {vendor.distance_km?.toFixed(2)} km
                </p>
                <p>
                  <strong>Delivery Fee:</strong> $
                  {vendor.delivery_fee?.toFixed(2)}
                </p>
                <p>
                  <strong>Duration:</strong> {vendor.duration_min} min
                </p>
                <span className="text-sm opacity-80">Rank: {idx + 1}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((item) => (

              <button
                onClick={() => goChatWithVendor(vendor)}
                className="px-4 py-2 rounded-xl hover:scale-105 transition-transform duration-200"
                style={{
                  backgroundColor: "#307A59",
                  color: "#ffffff",
                }}
              >
                Chat with vendor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((item) => (
                <div
                  key={item.order_item_id}
                  className="flex gap-4 p-3  transition-colors duration-300"
                  style={{
                    color: isDarkMode ? "#ffffff" : "#242625",
                  }}
                >
                  {item.images?.[0] && (
                    <img
                      src={item.images[0]}
                      alt={item.product_name}
                      className="w-28 h-28 object-cover rounded-lg"
                    />
                  )}

                  <div
                    key={item.order_item_id}
                    className="flex gap-4 p-3 transition-colors duration-300"
                    style={{
                      color: isDarkMode ? "#ffffff" : "#242625",
                    }}
                  >
                    {/* Product Image */}
                    {item.images?.[0] && (
                      <img
                        src={item.images[0]}
                        alt={item.product_name}
                        className="w-28 h-28 object-cover rounded-lg"
                      />
                    )}

                    {/* Product Info */}
                    <div
                      className="flex-1"
                      style={{
                        color: isDarkMode ? "#ffffff" : "#242625",
                      }}
                    >
                      <p className="font-semibold">{item.product_name}</p>
                      {item.variant && (
                        <p className="text-sm">
                          {typeof item.variant === "object"
                            ? Object.entries(item.variant)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(", ")
                            : item.variant}
                        </p>
                      )}
                      <p>
                        Quantity: {item.quantity} x{" "}
                        {formatCurrency(item.item_price)}
                      </p>
                      <p className="font-semibold">
                        Total: {formatCurrency(item.quantity * item.item_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vendor contact */}
              <div className="mt-3 text-sm">
                <p>Email: {vendor.vendor_email || "N/A"}</p>
                <p>Phone: {vendor.vendor_phone || "N/A"}</p>
              </div>
            <div
              className="mt-3 text-sm "
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              <p>Email: {vendor.vendor_email}</p>
              <p>Phone: {vendor.vendor_phone}</p>
            </div>
          ))
        ) : (
          <p className="text-sm opacity-70">No vendors found.</p>
        )}
      </section>

      {/* Order Details */}
      <section
        className="p-6 bg-white rounded-2xl shadow-lg "
        style={{
          backgroundColor: isDarkMode ? "#666666" : "#ffffff",
          color: isDarkMode ? "#ffffff" : "#242625",
        }}
      >
        <h3
          className="flex items-center gap-2 text-xl font-semibold mb-4"
          style={{
            color: isDarkMode ? "#ffffff" : "#242625",
          }}
        >
          <FaBox
            style={{
              color: isDarkMode ? "#ffffff" : "#242625",
            }}
          />{" "}
          Order Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <p>
            <strong
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              Status:
            </strong>{" "}
            {order?.status || "N/A"}
          </p>
          <p>
            <strong
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              Payment:
            </strong>{" "}
            {order?.payment_status || "N/A"}
          </p>
          <p
            className="sm:col-span-2"
            style={{
              color: isDarkMode ? "#ffffff" : "#242625",
            }}
          >
            <strong>Shipping Address:</strong>{" "}
            {order?.shipping_address || "N/A"}
          </p>
          <p className="sm:col-span-2">
            <strong>Orderd At:</strong>{" "}
            {order?.created_at
              ? new Date(order.created_at).toLocaleString()
              : "N/A"}
          </p>
        </div>

        {order?.items?.length > 0 && (
          <div className="mt-6">
            <h4
              className="font-semibold text-lg mb-2 "
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              Products in this order:
            </h4>
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              {mergedItemsArray.map((item) => (
                <div
                  key={item.order_item_id}
                  className="p-3 border rounded-lg  "
                  style={{
                    color: isDarkMode ? "#ffffff" : "#242625",
                  }}
                >
                  <p
                    style={{
                      color: isDarkMode ? "#ffffff" : "#242625",
                    }}
                  >
                    {item?.product_name} (
                    {item?.variant
                      ? typeof item.variant === "object"
                        ? Object.entries(item.variant)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(", ")
                        : item.variant
                      : "No variant"}
                    )
                  </p>

                  <p
                    style={{
                      color: isDarkMode ? "#ffffff" : "#242625",
                    }}
                  >
                    {item?.quantity} x {formatCurrency(item?.item_price)}
                  </p>
                  <p
                    className="font-semibold "
                    style={{
                      color: isDarkMode ? "#ffffff" : "#242625",
                    }}
                  >
                    Total: {formatCurrency(item?.quantity * item?.item_price)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 text-right flex flex-col items-end gap-2 text-xl font-bold text-purple-700">
              <div className="flex items-center gap-2">
                <FaCreditCard
                  className="text-2xl"
                  style={{ color: isDarkMode ? "#ffffff" : "#242625" }}
                />
                <span style={{ color: isDarkMode ? "#ffffff" : "#242625" }}>
                  Order Total: {formatCurrency(productsTotal)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <FaCreditCard
                  className="text-2xl"
                  style={{ color: isDarkMode ? "#ffffff" : "#242625" }}
                />
                <span style={{ color: isDarkMode ? "#ffffff" : "#242625" }}>
                  Order Total (with Shipping):{" "}
                  {formatCurrency(totalWithShipping)}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="text-center">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl  hover:scale-105 transition-transform duration-200"
          style={{
            backgroundColor: isDarkMode ? "#307A59" : "#307A59",
            color: isDarkMode ? "#ffffff" : "#ffffff",
          }}
        >
          Back to Orders
        </button>
      </div>
    </div>
  );
}
