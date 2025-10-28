import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import CartItem from "../components/CartItem";
import customerAPI from "../services/customerAPI";
import couponAPI from "../services/couponsAPI"; // استيراد الكوبونات
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
  const [pointsError, setPointsError] = useState("");
  const [finalTotal, setFinalTotal] = useState(0);

  
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



  // fetch cart by id
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
    if (appliedCoupon?.discount_amount)
      totalAfterDiscount -= appliedCoupon.discount_amount;
    if (usePointsChecked) totalAfterDiscount -= userPointsToUse;
    if (totalAfterDiscount < 0) totalAfterDiscount = 0;
    setFinalTotal(totalAfterDiscount);
  }, [total, appliedCoupon, usePointsChecked, userPointsToUse]);

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
    if (!num || num.length < 12)
      return "Invalid card number (min 12 digits for testing).";
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
  if (!couponCode) return alert("Please enter a coupon code.");
  if (!currentCart?.items?.length) return alert("No items in cart");

  try {
    const preparedItems = currentCart.items.map(item => ({
      product_id: item.product_id,          
      quantity: Number(item.quantity),
      price: Number(item.price),
      vendor_id: item.vendor_id || null,
    }));

    const userIdNum = Number(localStorage.getItem("userId"));
    if (!userIdNum) return alert("User not logged in. Please login first.");

    console.log(" Sending to backend:", {
      coupon_code: couponCode,
      userId: userIdNum,
      cartItems: preparedItems,
    });

    const result = await couponAPI.validateCoupon(couponCode, userIdNum, preparedItems);

    if (result.valid) {
      setAppliedCoupon(result);
      console.log(" Coupon applied successfully:", result);
    } else {
      alert(result.message);
      setAppliedCoupon(null);
      console.log(" Coupon not applied:", result);
    }
  } catch (err) {
    console.error("Error validating coupon:", err);
    alert("Error validating coupon. Check console for details.");
  }
};



  const handleUsePoints = (availablePoints) => {
    if (userPointsToUse > availablePoints) {
      setPointsError(`You only have ${availablePoints} points available.`);
      setUsePointsChecked(false);
    } else {
      setPointsError("");
      setUsePointsChecked(true);
    }
  };

  const handleCheckoutClickWithDiscount = async () => {
    if (usePointsChecked && userPointsToUse > (profile?.loyalty_points || 0)) {
      alert("Cannot use more points than available.");
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

    const newOrderResponse = await customerAPI.checkout({
      cart_id: currentCart.id,
      address: fullAddress,
      paymentMethod: paymentMethod === "card" ? "credit_card" : paymentMethod,
      paymentData,
    });

    const orderId = newOrderResponse.order.id;
    console.log(" NEW ORDER:", newOrderResponse);


    const fullOrderResponse = await customerAPI.getOrderById(orderId); // /api/customers/orders/:orderId
    const itemsToLog = fullOrderResponse.data.items;

    console.log(" Items to log:", itemsToLog);


    if (profile && itemsToLog?.length) {
      await Promise.all(
        itemsToLog.map(item =>
          customerAPI.logInteraction(profile.id, item.product_id, "purchase")
            .catch(err => console.error("⚠️ Log interaction failed for item", item.product_id, err))
        )
      );
    }


    try {
      setCheckoutLoading(true);
      setCheckoutError(null);

      const checkoutPayload = {
        cart_id: currentCart.id,
        address: fullAddress,
        paymentMethod: paymentMethod === "card" ? "credit_card" : paymentMethod,
        paymentData: {},
        coupon_code: appliedCoupon?.code || null,
        use_loyalty_points: usePointsChecked ? userPointsToUse : 0,
      };

      if (paymentMethod === "card") {
        const vErr = validateCardFields();
        if (vErr) {
          setCardError(vErr);
          setCheckoutLoading(false);
          return;
        }

        const rawNumber = card.number.replace(/\D/g, "");
        const card_last4 = rawNumber.slice(-4);
        const card_brand = detectBrand(rawNumber);
        const expiry_month = parseInt(card.expiryMonth, 10);
        const expiry_year = parseInt(card.expiryYear, 10);
        const transactionId = `card_SANDBOX_${Date.now()}`;

        checkoutPayload.paymentData = {
          transactionId,
          card_last4,
          card_brand,
          expiry_month,
          expiry_year,
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

      await dispatch(deleteCart(currentCart.id)).unwrap();
      dispatch(fetchOrders());
    } catch (err) {
      console.error("Failed to delete cart:", err);
    }

    setOrderSuccess({
      method: paymentMethod === "card" ? "Credit Card" : paymentMethod,
      order: fullOrderResponse,
    });

    navigate("/customer/orders");
  } catch (err) {
    console.error(" Checkout failed:", err);
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
          <h2 className="text-xl font-bold text-green-700 mb-2">Order Placed Successfully!</h2>
          <p>Payment Method: <strong>{orderSuccess.method}</strong></p>
          {orderSuccess.transactionId && <p>Transaction ID: {orderSuccess.transactionId}</p>}
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
          {currentCart?.items?.length === 0 ? <p>No items in this cart.</p> : (
            <div className="space-y-4 mb-6">
              {currentCart.items.map((item) => (
                <CartItem
                  key={`${item.id}-${item.product_id || ""}`}
                  item={{
                    ...item,
                    image: Array.isArray(item.images) && item.images.length ? item.images[0] : null,
                  }}
                />
              ))}
            </div>
          )}

          <p className="text-right text-xl font-bold mb-4">Total: ${total.toFixed(2)}</p>

          {/* Address Section */}
          <div className="border p-4 rounded mb-4">
            <h2 className="font-semibold text-lg mb-2">Shipping Address</h2>
            <input className="border rounded w-full p-2 mb-2" placeholder="Address Line 1 *" value={address.address_line1} onChange={(e) => setAddress({ ...address, address_line1: e.target.value })} />
            <input className="border rounded w-full p-2 mb-2" placeholder="Address Line 2" value={address.address_line2} onChange={(e) => setAddress({ ...address, address_line2: e.target.value })} />
            <input className="border rounded w-full p-2 mb-2" placeholder="City *" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
            <input className="border rounded w-full p-2 mb-2" placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
            <input className="border rounded w-full p-2 mb-2" placeholder="Postal Code" value={address.postal_code} onChange={(e) => setAddress({ ...address, postal_code: e.target.value })} />
            <input className="border rounded w-full p-2 mb-2" placeholder="Country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
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
            {appliedCoupon && (
              <p className="text-green-600 mt-2">
                Coupon applied: {appliedCoupon.code} - {appliedCoupon.discount}%
              </p>
            )}
          </div>

          {/* Loyalty Points Section */}
          <div className="border p-4 rounded mb-4">
            <h2 className="font-semibold mb-2">Use Loyalty Points</h2>
            <p>You have {profile?.loyalty_points || 0} points available.</p>
            <input
              type="number"
              value={userPointsToUse}
              onChange={(e) => setUserPointsToUse(Number(e.target.value))}
              className="border rounded w-full p-2 mb-2"
            />
            <label>
              <input
                type="checkbox"
                checked={usePointsChecked}
                onChange={() => handleUsePoints(profile?.loyalty_points || 0)}
              />{" "}
              Apply points to order
            </label>
            {pointsError && <p className="text-red-600">{pointsError}</p>}
          </div>

          {/* Payment Section */}
          <div className="border p-4 rounded mb-4">
            <h2 className="font-semibold mb-2">Payment Method</h2>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="border rounded w-full p-2 mb-2">
              <option value="cod">Cash on Delivery</option>
              <option value="card">Credit Card</option>
              <option value="paypal">PayPal</option>
            </select>

            {paymentMethod === "card" && (
              <div className="space-y-2">
                <input placeholder="Card Number" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} className="border rounded w-full p-2" />
                <input placeholder="Expiry Month" value={card.expiryMonth} onChange={(e) => setCard({ ...card, expiryMonth: e.target.value })} className="border rounded w-full p-2" />
                <input placeholder="Expiry Year" value={card.expiryYear} onChange={(e) => setCard({ ...card, expiryYear: e.target.value })} className="border rounded w-full p-2" />
                <input placeholder="CVC" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} className="border rounded w-full p-2" />
                <input placeholder="Cardholder Name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className="border rounded w-full p-2" />
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
              {checkoutLoading ? "Processing..." : `Checkout ($${finalTotal.toFixed(2)})`}
            </button>
            {checkoutError && <p className="text-red-600 mt-2">{checkoutError}</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetailsPage;
