import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTrackingOrder } from "./DeliveryAPI"; // عدّل المسار حسب مشروعك
import { FaUser, FaIndustry, FaBox, FaCreditCard } from "react-icons/fa";
import { useSelector } from "react-redux";

export default function TrackingPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const isDarkMode = useSelector((state) => state.deliveryTheme.darkMode);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getTrackingOrder(orderId);
        setOrder(data);
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" v>
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

        {/** Group items by vendor **/}
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
            <h4
              className="text-lg font-bold mb-3 "
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              {vendor.vendor_name}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((item) => (
                <div
                  key={item.order_item_id}
                  className="flex gap-4 p-3  transition-colors duration-300"
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
                    <p
                      className="font-semibold"
                      style={{
                        color: isDarkMode ? "#ffffff" : "#242625",
                      }}
                    >
                      {item.product_name}
                    </p>
                    {item.variant && (
                      <p
                        className="text-sm "
                        style={{
                          color: isDarkMode ? "#ffffff" : "#242625",
                        }}
                      >
                        {typeof item.variant === "object"
                          ? Object.entries(item.variant)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(", ")
                          : item.variant}
                      </p>
                    )}
                    <p
                      style={{
                        color: isDarkMode ? "#ffffff" : "#242625",
                      }}
                    >
                      Quantity: {item.quantity} x{" "}
                      {formatCurrency(item.item_price)}
                    </p>
                    <p
                      className="font-semibold "
                      style={{
                        color: isDarkMode ? "#ffffff" : "#242625",
                      }}
                    >
                      Total: {formatCurrency(item.quantity * item.item_price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Vendor contact */}
            <div
              className="mt-3 text-sm "
              style={{
                color: isDarkMode ? "#ffffff" : "#242625",
              }}
            >
              <p>Email: {vendor.vendor_email}</p>
              <p>Phone: {vendor.vendor_phone}</p>
            </div>
          </div>
        ))}
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

        {/* Products List */}
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

            <div className="mt-6 text-right text-xl font-bold text-purple-700 flex items-center justify-end gap-2">
              <FaCreditCard
                className="text-2xl"
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              />
              <span
                style={{
                  color: isDarkMode ? "#ffffff" : "#242625",
                }}
              >
                Order Total:{" "}
                {formatCurrency(
                  mergedItemsArray.reduce(
                    (acc, item) => acc + item.quantity * item.item_price,
                    0
                  )
                )}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Back Button */}
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
