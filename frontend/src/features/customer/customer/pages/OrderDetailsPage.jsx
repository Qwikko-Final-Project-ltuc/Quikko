import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import CartItem from "../components/CartItem";
import customerAPI from "../services/customerAPI";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../ordersSlice";
import { deleteCart, fetchCart, setCurrentCart } from "../cartSlice";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const cartFromState = location.state?.cart;
  const { data: profile } = useSelector((state) => state.profile);
  const { currentCart, status, error } = useSelector((state) => state.cart);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [address, setAddress] = useState({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Jordan",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const validateCoupon = async (couponCode, userId, cartItems = []) => {
    if (!userId) throw new Error("User ID not found. Please login again.");
    const preparedUserId = Number(userId);
    const res = await fetch("http://localhost:3000/api/coupons/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ coupon_code: couponCode, userId: preparedUserId, cartItems }),
      credentials: "include",
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to validate coupon.");
    }
    return res.json();
  };

  const [card, setCard] = useState({
    number: "",
    expiryMonth: "",
    expiryYear: "",
    cvc: "",
    name: "",
  });
  const [cardError, setCardError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [usePointsChecked, setUsePointsChecked] = useState(false);
  const [userPointsToUse, setUserPointsToUse] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [pointsError, setPointsError] = useState("");
  const [finalTotal, setFinalTotal] = useState(0);
  const [couponResult, setCouponResult] = useState(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  useEffect(() => {
    if (profile) {
      setAddress((prev) => ({
        ...prev,
        city: profile.address || prev.city,
        state: profile.state || prev.state,
        postal_code: profile.postal_code || prev.postal_code,
      }));
    }
  }, [profile]);

  useEffect(() => {
    const fetchLoyaltyPoints = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("http://localhost:3000/api/customers/loyalty", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const pointsBalance = data.points?.points_balance ?? 0;
        setLoyaltyPoints(pointsBalance);
        setUserPointsToUse(pointsBalance);
      } catch (err) {
        console.error("Error fetching loyalty points:", err);
      }
    };
    fetchLoyaltyPoints();
  }, []);

  useEffect(() => {
    if (cartFromState) {
      dispatch(setCurrentCart(cartFromState));
    } else if (orderId) {
      dispatch(fetchCart(orderId));
    }
  }, [cartFromState, orderId, dispatch]);

  const total =
    currentCart?.items?.reduce(
      (sum, item) => sum + Number(item.price || 0) * (item.quantity || 1),
      0
    ) || 0;

  useEffect(() => {
    let totalAfterDiscount = total;
    if (appliedCoupon?.discount_amount) totalAfterDiscount -= appliedCoupon.discount_amount;
    if (usePointsChecked && pointsDiscount > 0) totalAfterDiscount -= pointsDiscount;
    if (totalAfterDiscount < 0) totalAfterDiscount = 0;
    setFinalTotal(totalAfterDiscount);
  }, [total, appliedCoupon, usePointsChecked, pointsDiscount]);

  const fullAddress = {
    address_line1: address.address_line1,
    address_line2: address.address_line2,
    city: address.city,
    state: address.state || address.city,
    postal_code: address.postal_code || "0000",
    country: address.country,
  };

  const detectBrand = (num) => {
    if (!num) return "";
    const v = num.replace(/\D/g, "");
    if (/^4/.test(v)) return "Visa";
    if (/^5[1-5]/.test(v) || /^2[2-7]/.test(v)) return "MasterCard";
    if (/^3[47]/.test(v)) return "Amex";
    return "Card";
  };

  const validateCardFields = () => {
    setCardError("");
    const num = card.number.replace(/\D/g, "");
    if (!num || num.length < 12) return "Invalid card number (min 12 digits for testing).";
    const m = parseInt(card.expiryMonth, 10);
    const y = parseInt(card.expiryYear, 10);
    if (!m || m < 1 || m > 12) return "Invalid expiry month";
    const currentYear = new Date().getFullYear();
    const twoDigit = y < 100 ? 2000 + y : y;
    if (!y || twoDigit < currentYear) return "Expiry year must be current or future";
    if (!card.cvc || card.cvc.length < 3) return "Invalid CVC";
    if (!card.name) return "Cardholder name required";
    return "";
  };

  const handleValidateCoupon = async () => {
    if (!profile?.id) return alert("User not logged in. Please login first.");
    if (!currentCart?.items?.length) return alert("Your cart is empty.");
  const preparedItems = currentCart.items.map((item) => {
  const productId = item.product_id || item.id; // product_id موجودة؟ استخدميها، وإلا استخدمي id
  const vendorId = item.vendor_id || (item.vendor && item.vendor.id) || 0; // إذا عندك object vendor

  return {
    product_id: Number(productId),
    quantity: Number(item.quantity),
    price: Number(item.price),
    vendor_id: Number(vendorId),
  };
});


    try {
      const response = await validateCoupon(couponCode, profile.id, preparedItems);
      setAppliedCoupon(response);
      setCouponResult({
        message: response.message,
        discount: response.discount_amount,
        total: response.total_amount,
        final: response.final_amount,
      });
    } catch (error) {
      setCouponResult({
        message: error.message || "Invalid or expired coupon.",
        discount: 0,
        total: total,
        final: total,
      });
    }
  };

  const handleUsePoints = (availablePoints, enteredPoints = userPointsToUse) => {
    if (!usePointsChecked) {
      const pointsToUse = Math.min(enteredPoints, availablePoints);
      if (enteredPoints > availablePoints) {
        setPointsError(`You only have ${availablePoints} points.`);
        setUsePointsChecked(false);
        setPointsDiscount(0);
      } else {
        setUsePointsChecked(true);
        setPointsError("");
        setUserPointsToUse(pointsToUse);
        const discount = pointsToUse * 0.1;
        setPointsDiscount(discount);
      }
    } else {
      setUsePointsChecked(false);
      setPointsDiscount(0);
      setUserPointsToUse(0);
      setPointsError("");
    }
  };

  const handleCheckoutClickWithDiscount = async () => {
    if (usePointsChecked && userPointsToUse > loyaltyPoints) {
      alert(`Cannot use more points than available. You have ${loyaltyPoints} points.`);
      return;
    }
    await handleCheckoutClick();
  };

  const handleCheckoutClick = async () => {
    if (!address.address_line1 || !address.city) {
      alert("Address Line 1 and City are required!");
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const paymentData =
        paymentMethod === "card"
          ? {
              transactionId: `card_SANDBOX_${Date.now()}`,
              card_last4: card.number.slice(-4),
              card_brand: detectBrand(card.number),
              expiry_month: parseInt(card.expiryMonth, 10),
              expiry_year: parseInt(card.expiryYear, 10),
            }
          : {};

      const checkoutPayload = {
        cart_id: currentCart.id,
        address: fullAddress,
        paymentMethod: paymentMethod === "card" ? "credit_card" : paymentMethod,
        paymentData,
        coupon_code: appliedCoupon?.code || null,
        use_loyalty_points: usePointsChecked ? userPointsToUse : 0,
        total_amount: total,
        discount_amount: (appliedCoupon?.discount_amount || 0) + (pointsDiscount || 0),
        final_amount: finalTotal,
      };

      if (paymentMethod === "card") {
        const vErr = validateCardFields();
        if (vErr) {
          setCardError(vErr);
          setCheckoutLoading(false);
          return;
        }
        const rawNumber = card.number.replace(/\D/g, "");
        checkoutPayload.paymentData = {
          transactionId: `card_SANDBOX_${Date.now()}`,
          card_last4: rawNumber.slice(-4),
          card_brand: detectBrand(rawNumber),
          expiry_month: parseInt(card.expiryMonth, 10),
          expiry_year: parseInt(card.expiryYear, 10),
        };
      }

      const newOrder = await customerAPI.checkout(checkoutPayload);
      await dispatch(deleteCart(currentCart.id)).unwrap();
      dispatch(fetchOrders());

      const methodLabel =
        paymentMethod === "cod"
          ? "Cash on Delivery"
          : paymentMethod === "card"
          ? "Credit Card"
          : "PayPal";

      setOrderSuccess({
        method: methodLabel,
        transactionId: checkoutPayload.paymentData.transactionId,
        order: newOrder,
      });
      navigate("/customer/orders");
    } catch (err) {
      console.error("Checkout failed:", err);
      setCheckoutError(err.response?.data?.error || err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  useEffect(() => {
    if (paymentMethod === "paypal" && window.paypal && currentCart) {
      window.paypal
        .Buttons({
          createOrder: (data, actions) =>
            actions.order.create({
              purchase_units: [{ amount: { value: finalTotal.toFixed(2) } }],
            }),
          onApprove: async (data, actions) => {
            const details = await actions.order.capture();
            try {
              setCheckoutLoading(true);
              setCheckoutError(null);
              const transactionId =
                details.id ||
                details.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
                null;
              const newOrder = await customerAPI.checkout({
                cart_id: currentCart.id,
                address: fullAddress,
                paymentMethod: "paypal",
                paymentData: { transactionId },
                coupon_code: appliedCoupon?.code || null,
                use_loyalty_points: usePointsChecked ? userPointsToUse : 0,
              });
              await dispatch(deleteCart(currentCart.id)).unwrap();
              dispatch(fetchOrders());
              setOrderSuccess({ method: "PayPal", transactionId, order: newOrder });
              navigate("/customer/orders");
            } catch (err) {
              console.error("Checkout failed:", err);
              setCheckoutError(err.response?.data?.error || err.message);
            } finally {
              setCheckoutLoading(false);
            }
          },
        })
        .render("#paypal-button-container");
    }
  }, [paymentMethod, finalTotal, currentCart, dispatch]);

  if (status === "loading") return <p>Loading cart details...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!currentCart) return <p>Cart not found</p>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Cart / Order Details</h1>

      {orderSuccess ? (
        <div className="bg-green-100 p-4 rounded mb-6">
          <h2 className="text-xl font-bold text-green-700 mb-2">
            Order Placed Successfully!
          </h2>
          <p>
            Payment Method: <strong>{orderSuccess.method}</strong>
          </p>
          {orderSuccess.transactionId && (
            <p>Transaction ID: {orderSuccess.transactionId}</p>
          )}
          <p>Order ID: {orderSuccess.order.order?.id}</p>
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => navigate("/orders")}
          >
            View My Orders
          </button>
        </div>
      ) : (
        <>
          {currentCart?.items?.length === 0 ? (
            <p>No items in this cart.</p>
          ) : (
            <div className="space-y-4 mb-6">
              {currentCart.items.map((item) => (
                <CartItem
                  key={`${item.id}-${item.product_id || ""}`}
                  item={{
                    ...item,
                    image:
                      Array.isArray(item.images) && item.images.length
                        ? item.images[0]
                        : null,
                  }}
                />
              ))}
            </div>
          )}

          <p className="text-right text-xl font-bold mb-4">
            Total: ${total.toFixed(2)}
          </p>

          {/* Address Section */}
          <div className="border p-4 rounded mb-4">
            <h2 className="font-semibold text-lg mb-2">Shipping Address</h2>
            <input
              className="border rounded w-full p-2 mb-2"
              placeholder="Address Line 1 *"
              value={address.address_line1}
              onChange={(e) =>
                setAddress({ ...address, address_line1: e.target.value })
              }
            />
            <input
              className="border rounded w-full p-2 mb-2"
              placeholder="Address Line 2"
              value={address.address_line2}
              onChange={(e) =>
                setAddress({ ...address, address_line2: e.target.value })
              }
            />
            <input
              className="border rounded w-full p-2 mb-2"
              placeholder="City *"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
            <input
              className="border rounded w-full p-2 mb-2"
              placeholder="State"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
            />
            <input
              className="border rounded w-full p-2 mb-2"
              placeholder="Postal Code"
              value={address.postal_code}
              onChange={(e) =>
                setAddress({ ...address, postal_code: e.target.value })
              }
            />
            <input
              className="border rounded w-full p-2 mb-2"
              placeholder="Country"
              value={address.country}
              onChange={(e) =>
                setAddress({ ...address, country: e.target.value })
              }
            />
          </div>

          {/* Coupon Section */}
          <div className="border p-4 rounded mb-4">
            <h2 className="font-semibold mb-2">Apply Coupon</h2>
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="border rounded w-full p-2 mb-2"
            />
            <button
              onClick={handleValidateCoupon}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Check Coupon
            </button>
            {couponResult && (
              <div
                className="coupon-summary mt-3 p-4 rounded-lg"
                style={{
                  backgroundColor: couponResult.discount > 0 ? "#e6ffed" : "#ffe6e6",
                  border:
                    couponResult.discount > 0
                      ? "1px solid #22c55e"
                      : "1px solid #ef4444",
                }}
              >
                <p className="font-semibold mb-1">{couponResult.message}</p>
                {couponResult.discount > 0 && (
                  <>
                    <p>
                      Discount: <strong>${couponResult.discount}</strong>
                    </p>
                    <p>Total Before Discount: ${couponResult.total}</p>
                    <p>
                      Final Amount: <strong>${couponResult.final}</strong>
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Loyalty Points Section */}
          <div className="border p-4 rounded mb-4">
            <h2 className="font-semibold mb-2">Use Loyalty Points</h2>
            <p>You have {loyaltyPoints} points available.</p>
            <input
              type="number"
              value={userPointsToUse}
              onChange={(e) => setUserPointsToUse(Number(e.target.value))}
              className="border rounded w-full p-2 mb-2"
              min="0"
              max={profile?.loyalty_points || 0}
            />
            <label>
              <input
                type="checkbox"
                checked={usePointsChecked}
                onChange={() => handleUsePoints(loyaltyPoints)}
              />{" "}
              Apply points to order
            </label>
            {usePointsChecked && (
              <p className="text-green-700">
                Discount from points: ${pointsDiscount.toFixed(2)}
              </p>
            )}
            {pointsError && <p className="text-red-600">{pointsError}</p>}
          </div>

          {/* Payment Section */}
          <div className="border p-4 rounded mb-4">
            <h2 className="font-semibold mb-2">Payment Method</h2>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="border rounded w-full p-2 mb-2"
            >
              <option value="cod">Cash on Delivery</option>
              <option value="card">Credit Card</option>
              <option value="paypal">PayPal</option>
            </select>

            {paymentMethod === "card" && (
              <div className="space-y-2">
                <input
                  placeholder="Card Number"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: e.target.value })}
                  className="border rounded w-full p-2"
                />
                <input
                  placeholder="Expiry Month"
                  value={card.expiryMonth}
                  onChange={(e) => setCard({ ...card, expiryMonth: e.target.value })}
                  className="border rounded w-full p-2"
                />
                <input
                  placeholder="Expiry Year"
                  value={card.expiryYear}
                  onChange={(e) => setCard({ ...card, expiryYear: e.target.value })}
                  className="border rounded w-full p-2"
                />
                <input
                  placeholder="CVC"
                  value={card.cvc}
                  onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                  className="border rounded w-full p-2"
                />
                <input
                  placeholder="Cardholder Name"
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                  className="border rounded w-full p-2"
                />
                {cardError && <p className="text-red-600">{cardError}</p>}
              </div>
            )}

            {paymentMethod === "paypal" && <div id="paypal-button-container"></div>}
          </div>

          <div className="text-right">
            <button
              onClick={handleCheckoutClickWithDiscount}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              disabled={checkoutLoading}
            >
              {checkoutLoading
                ? "Processing..."
                : `Checkout ($${finalTotal.toFixed(2)})`}
            </button>
            {checkoutError && (
              <p className="text-red-600 mt-2">{checkoutError}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetailsPage;
