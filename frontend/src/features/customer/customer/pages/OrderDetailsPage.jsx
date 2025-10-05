import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import customerAPI from "../services/customerAPI";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../ordersSlice";
import { deleteCart, fetchCart } from "../cartSlice";

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  // payment selector: 'cod' | 'paypal' | 'card'
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // card form state (for non-PayPal card)
  const [card, setCard] = useState({
    number: "",
    expiryMonth: "",
    expiryYear: "",
    cvc: "",
    name: "",
  });
  const [cardError, setCardError] = useState("");

  // جلب البروفايل => تهيئة العنوان
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
    if (orderId) {
      dispatch(fetchCart(orderId));
    }
  }, [dispatch, orderId]);

  const total =
    currentCart?.items?.reduce(
      (sum, item) => sum + Number(item.price || 0) * (item.quantity || 1),
      0
    ) || 0;

  const fullAddress = {
    address_line1: address.address_line1,
    address_line2: address.address_line2,
    city: address.city,
    state: address.state || address.city,
    postal_code: address.postal_code || "0000",
    country: address.country,
  };

  // helper لتحديد نوع الكرت بسرعة من الرقم (مبسّط)
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
    // expiry year assumed two-digit or four-digit: allow both
    const currentYear = new Date().getFullYear();
    const twoDigit = y < 100 ? 2000 + y : y;
    if (!y || twoDigit < currentYear) return "Expiry year must be current or future";
    if (!card.cvc || card.cvc.length < 3) return "Invalid CVC";
    if (!card.name) return "Cardholder name required";
    return "";
  };

  // MAIN checkout handler (handles COD, PayPal handled separately by paypal Buttons onApprove)
  const handleCheckoutClick = async () => {
    if (!address.address_line1 || !address.city) {
      alert("Address Line 1 and City are required!");
      return;
    }

    try {
      setCheckoutLoading(true);
      setCheckoutError(null);

      if (paymentMethod === "cod") {
        // cash on delivery
        const newOrder = await customerAPI.checkout({
          cart_id: currentCart.id,
          address: fullAddress,
          paymentMethod: "cod",
          paymentData: {},
        });

        await dispatch(deleteCart(currentCart.id)).unwrap();
        dispatch(fetchOrders());

        setOrderSuccess({ method: "Cash on Delivery", order: newOrder });
        navigate("/orders");
        return;
      }

      if (paymentMethod === "card") {
        // validate card form
        const vErr = validateCardFields();
        if (vErr) {
          setCardError(vErr);
          setCheckoutLoading(false);
          return;
        }

        // prepare fields
        const rawNumber = card.number.replace(/\D/g, "");
        const card_last4 = rawNumber.slice(-4);
        const card_brand = detectBrand(rawNumber);
        const expiry_month = parseInt(card.expiryMonth, 10);
        const expiry_year = parseInt(card.expiryYear, 10);
        // generate sandbox transaction id (in real integration you get this from gateway)
        const transactionId = `card_SANDBOX_${Date.now()}`;

        // pass paymentData to checkout — placeOrderFromCart will insert payment row using these fields
        const paymentDataToSend = {
        transactionId: transactionId || null,
        card_last4: card_last4 || null,
        card_brand: card_brand || null,
        expiry_month: expiry_month || null,
        expiry_year: expiry_year || null,
      };

      const newOrder = await customerAPI.checkout({
        cart_id: currentCart.id,
        address: fullAddress,
        paymentMethod: paymentMethod === "card" ? "credit_card" : paymentMethod,
        paymentData: paymentDataToSend,
      });


        // dispatch cleanup
        await dispatch(deleteCart(currentCart.id)).unwrap();
        dispatch(fetchOrders());

        setOrderSuccess({ method: "Credit Card", transactionId, order: newOrder });
        navigate("/orders");
        return;
      }

      // If paypal, the paypal Buttons onApprove will call checkout (we render PayPal buttons below)
    } catch (err) {
      console.error("Checkout failed:", err);
      setCheckoutError(err.response?.data?.error || err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // PayPal Buttons integration (same you had; onApprove will call checkout with paymentData.transaction_id)
  useEffect(() => {
    if (paymentMethod === "paypal" && window.paypal && currentCart) {
      window.paypal
        .Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [{ amount: { value: total.toFixed(2) } }],
            });
          },
          onApprove: async (data, actions) => {
            const details = await actions.order.capture();
            try {
              setCheckoutLoading(true);
              setCheckoutError(null);

              // extract PayPal transaction id (capture id)
              const transactionId =
                details.id ||
                details.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
                null;

              const newOrder = await customerAPI.checkout({
                cart_id: currentCart.id,
                address: fullAddress,
                paymentMethod: "paypal",
                paymentData: { transactionId },
              });

              await dispatch(deleteCart(currentCart.id)).unwrap();
              dispatch(fetchOrders());

              setOrderSuccess({ method: "PayPal", transactionId, order: newOrder });
              navigate("/orders");
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
  }, [paymentMethod, total, currentCart, dispatch]);

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
          <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={() => navigate("/orders")}>
            View My Orders
          </button>
        </div>
      ) : (
        <>
          {currentCart.items.length === 0 ? <p>No items in this cart.</p> : (
            <div className="space-y-4 mb-6">
              {currentCart.items.map((item) => (
                <CartItem key={`${item.id}-${item.product_id || ""}`} item={{ ...item, image: Array.isArray(item.images) && item.images.length ? item.images[0] : null }} />
              ))}
            </div>
          )}

          <p className="text-right text-xl font-bold mb-4">Total: ${total.toFixed(2)}</p>

          {/* Address */}
          <div className="border p-4 rounded mb-4">
            <h2 className="font-semibold text-lg mb-2">Shipping Address</h2>
            <input className="border rounded w-full p-2 mb-2" placeholder="Address Line 1 *" value={address.address_line1} onChange={(e) => setAddress({ ...address, address_line1: e.target.value })} />
            <input className="border rounded w-full p-2 mb-2" placeholder="Address Line 2" value={address.address_line2} onChange={(e) => setAddress({ ...address, address_line2: e.target.value })} />
            <input className="border rounded w-full p-2 mb-2" placeholder="City *" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
            <input className="border rounded w-full p-2 mb-2" placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
            <input className="border rounded w-full p-2 mb-2" placeholder="Postal Code" value={address.postal_code} onChange={(e) => setAddress({ ...address, postal_code: e.target.value })} />
            <input className="border rounded w-full p-2 mb-2" placeholder="Country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
          </div>

          {/* Payment Method */}
          <div className="border p-4 rounded mb-4">
            <h2 className="font-semibold text-lg mb-2">Payment Method</h2>
            <select className="border rounded w-full p-2 mb-4" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="cod">Cash on Delivery</option>
              <option value="paypal">PayPal</option>
              <option value="card">Credit / Debit Card (sandbox)</option>
            </select>

            {paymentMethod === "paypal" && <div id="paypal-button-container" />}

            {paymentMethod === "card" && (
              <div className="space-y-3">
                <input type="text" placeholder="Card Number (sandbox allowed)" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} className="border rounded w-full p-2" />
                <div className="flex space-x-2">
                  <input type="text" placeholder="MM" value={card.expiryMonth} onChange={(e) => setCard({ ...card, expiryMonth: e.target.value })} className="w-24 border rounded p-2" />
                  <input type="text" placeholder="YY or YYYY" value={card.expiryYear} onChange={(e) => setCard({ ...card, expiryYear: e.target.value })} className="w-24 border rounded p-2" />
                  <input type="text" placeholder="CVC" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} className="w-32 border rounded p-2" />
                </div>
                <input type="text" placeholder="Cardholder Name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className="border rounded w-full p-2" />
                {cardError && <p className="text-red-500">{cardError}</p>}
              </div>
            )}
          </div>

          {checkoutError && <p className="text-red-500 mt-2">{checkoutError}</p>}

          <button onClick={handleCheckoutClick} disabled={checkoutLoading} className={`w-full py-2 px-4 rounded text-white ${checkoutLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}>
            {checkoutLoading ? "Processing..." : "Checkout"}
          </button>
        </>
      )}
    </div>
  );
};

export default OrderDetailPage;
