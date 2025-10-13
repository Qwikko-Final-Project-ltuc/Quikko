import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import customerAPI from "../services/customerAPI";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartId, total, address, paymentMethod } = useSelector(
    (state) => state.payment
  );
  const currentUser = useSelector((state) => state.cart.user);
  const currentUserId = currentUser?.id; 

  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //HANDLE PAYPAL REDIRECT SUCCESS
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const paymentId = query.get("paymentId");
    const payerID = query.get("PayerID");

    if (paymentId && payerID) {
      const saved = JSON.parse(localStorage.getItem("checkoutData"));

      if (!saved) {
        setError("Checkout data not found.");
        return;
      }

      handlePaymentSuccess({
        paymentId,
        payerID,
        cartId: saved.cartId,
        address: saved.address,
        total: saved.total,
      });
      localStorage.removeItem("checkoutData");
    }
  }, [location.search]);

  //  HANDLE PAYMENT SUCCESS AFTER REDIRECT 
  const handlePaymentSuccess = async ({ paymentId, payerID, cartId, address }) => {
    setLoading(true);
    setError("");

    try {
      await customerAPI.checkout({
        cart_id: cartId,
        address,
        paymentMethod: "paypal",
        paymentData: { paymentId, payerID },
      });

      await customerAPI.deleteCart(cartId);

      navigate("/customer/orders");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  //  HANDLE CARD PAYMENT / PAYPAL / COD 
  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      if (paymentMethod === "credit_card") {
        if (!card.number || !card.expiry || !card.cvc || !card.name) {
          setError("Please fill all card fields.");
          setLoading(false);
          return;
        }

        localStorage.setItem(
          "checkoutData",
          JSON.stringify({ cartId, address, total })
        );

        const payment = await customerAPI.createPayment({
          cartId,
          paymentMethod: "credit_card",
          amount: total,
          address,
          card,
        });

        if (payment.forwardLink) {
          window.location.href = payment.forwardLink;
          return;
        }

        if (!(payment.success || payment.state === "approved")) {
          setError("Payment was not successful.");
          setLoading(false);
          return;
        }

        const order =await customerAPI.checkout({
          cart_id: cartId,
          address,
          paymentMethod: "credit_card",
          paymentData: {
            transactionId: payment.id,
            card_last4: card.number.slice(-4),
            card_brand: payment.brand || "VISA",
            expiry_month: card.expiry.split("/")[0],
            expiry_year: card.expiry.split("/")[1],
          },
        });

        await customerAPI.createPaymentRecord({
          order_id: order.id,
          user_id: currentUserId,
          payment_method: "credit_card",
          amount: total,
          status: "success",
          transaction_id: payment.id,
          card_last4: card.number.slice(-4),
          card_brand: payment.brand || "VISA",
          expiry_month: parseInt(card.expiry.split("/")[0]),
          expiry_year: parseInt(card.expiry.split("/")[1]),
        });

        

        await customerAPI.deleteCart(cartId);
        navigate("/customer/orders");

      } else if (paymentMethod === "paypal") {
        localStorage.setItem(
          "checkoutData",
          JSON.stringify({ cartId, address, total })
        );

        const payment = await customerAPI.createPayment({
          cartId,
          paymentMethod: "paypal",
          amount: total,
          address,
        });

        if (payment.forwardLink) {
          window.location.href = payment.forwardLink;
          return;
        }

      } else if (paymentMethod === "cod") {
        await customerAPI.checkout({
          cart_id: cartId,
          address,
          paymentMethod: "cod",
          paymentData: {},
        });

        await customerAPI.deleteCart(cartId);
        navigate("/customer/orders");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Payment Details</h1>

        {/* Total */}
        <div className="bg-green-50 p-4 rounded text-center">
          <p className="text-gray-700">Total to Pay</p>
          <p className="text-2xl font-semibold text-green-700">
            ${total?.toFixed(2) || "0.00"}
          </p>
        </div>

        {/* Address */}
        <div className="border p-4 rounded space-y-2">
          <h2 className="font-semibold text-lg">Shipping Address</h2>
          <p>{address?.address_line1}</p>
          {address?.address_line2 && <p>{address.address_line2}</p>}
          <p>{address?.city}, {address?.country}</p>
        </div>

        {/* Card Form */}
        {paymentMethod === "credit_card" && (
          <div className="space-y-3">
            <h2 className="font-semibold text-lg">Card Information</h2>
            <input
              type="text"
              placeholder="Card Number"
              value={card.number}
              onChange={(e) => setCard({ ...card, number: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Expiry MM/YY"
                value={card.expiry}
                onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                placeholder="CVC"
                value={card.cvc}
                onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                className="w-24 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <input
              type="text"
              placeholder="Cardholder Name"
              value={card.name}
              onChange={(e) => setCard({ ...card, name: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}

        {/* Error */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className={`w-full py-3 rounded text-white font-semibold transition-colors ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Processing..." : `Pay $${total?.toFixed(2) || "0.00"}`}
        </button>
      </div>
    </div>
  );
};

export default PaymentDetailsPage;
