import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import CartItem from "../components/CartItem";
import customerAPI from "../services/customerAPI";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../ordersSlice";
import { deleteCart, fetchCart, setCurrentCart } from "../cartSlice";

// Importing icons
import { 
  FiShoppingCart, 
  FiHome, 
  FiFileText, 
  FiTag, 
  FiStar, 
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiPackage,
  FiShield
} from "react-icons/fi";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const cartFromState = location.state?.cart;
  const { data: profile } = useSelector((state) => state.profile);
  const { currentCart, status, error } = useSelector((state) => state.cart);
  const { mode: themeMode } = useSelector((state) => state.customerTheme);

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
      const productId = item.product_id || item.id;
      const vendorId = item.vendor_id || (item.vendor && item.vendor.id) || 0;

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

  // CSS classes based on theme using the provided color variables
  const containerClass = themeMode === 'dark' 
    ? 'bg-[var(--bg)] text-[var(--text)]' 
    : 'bg-[var(--bg)] text-[var(--text)]';
    
  const cardClass = themeMode === 'dark' 
    ? 'bg-[var(--bg)] border-[var(--border)]' 
    : 'bg-[var(--textbox)] border-[var(--border)]';
    
  const inputClass = themeMode === 'dark' 
    ? 'bg-[var(--bg)] border-[var(--border)] text-[var(--text)] placeholder-[var(--light-gray)] focus:border-[var(--button)] focus:ring-[var(--button)]' 
    : 'bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] placeholder-[var(--light-gray)] focus:border-[var(--button)] focus:ring-[var(--button)]';
    
  const buttonClass = "bg-[var(--button)] hover:bg-[#015c40] text-white font-medium transition-all duration-200 transform hover:scale-[1.02]";
  const secondaryButtonClass = themeMode === 'dark' 
    ? 'border-[var(--border)] bg-[var(--div)] hover:bg-[var(--hover)] text-[var(--text)]' 
    : 'border-[var(--border)] bg-[var(--textbox)] hover:bg-[var(--hover)] text-[var(--text)]';

  const successClass = themeMode === 'dark' 
    ? 'bg-[#1e3a2a] border-[var(--success)] text-[var(--success)]' 
    : 'bg-[#e6ffed] border-[var(--success)] text-[#166534]';
    
  const errorClass = themeMode === 'dark' 
    ? 'bg-[#3a1e1e] border-[var(--error)] text-[var(--error)]' 
    : 'bg-[#ffe6e6] border-[var(--error)] text-[#991b1b]';

  const warningClass = themeMode === 'dark'
    ? 'bg-[#3a2e1e] border-[var(--warning)] text-[var(--warning)]'
    : 'bg-[#fefce8] border-[var(--warning)] text-[#854d0e]';

  // Icon style - same color as text
  const iconStyle = "text-[var(--text)]";

  if (status === "loading") return (
    <div className={`min-h-screen flex items-center justify-center ${containerClass}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
        <p className="text-lg">Loading your order details...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className={`min-h-screen flex items-center justify-center ${containerClass}`}>
      <div className={`text-center max-w-md p-8 rounded-2xl border ${errorClass}`}>
        <div className="w-16 h-16 bg-[var(--error)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className={`text-2xl ${iconStyle}`} />
        </div>
        <h3 className="text-xl font-bold mb-2">Error Loading Order</h3>
        <p className="mb-6">{error}</p>
        <button 
          onClick={() => navigate(-1)}
          className={`${buttonClass} px-6 py-3 rounded-lg flex items-center justify-center mx-auto`}
        >
          <FiArrowLeft className="mr-2" />
          Go Back
        </button>
      </div>
    </div>
  );
  
  if (!currentCart) return (
    <div className={`min-h-screen flex items-center justify-center ${containerClass}`}>
      <div className="text-center max-w-md p-8">
        <div className="w-20 h-20 bg-[var(--div)] rounded-full flex items-center justify-center mx-auto mb-4">
          <FiShoppingCart className={`text-2xl ${iconStyle}`} />
        </div>
        <h3 className="text-xl font-bold mb-4">Cart Not Found</h3>
        <p className="text-[var(--light-gray)] mb-6">We couldn't find the cart you're looking for.</p>
        <button 
          onClick={() => navigate("/")}
          className={`${buttonClass} px-6 py-3 rounded-lg`}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen py-8 ${containerClass} transition-colors duration-300`}>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 p-6">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-[var(--button)] to-[#02966a] bg-clip-text text-transparent">
            Complete Your Order
          </h1>
          <p className="text-lg text-[var(--light-gray)] max-w-2xl mx-auto">
            Review your items, apply discounts, and securely complete your purchase
          </p>
        </div>

        {orderSuccess ? (
          <div className="max-w-2xl mx-auto">
            <div className={`bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border ${successClass} rounded-2xl p-8 text-center`}>
              <div className="w-20 h-20 bg-[var(--success)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle className={`text-3xl ${iconStyle}`} />
              </div>
              <h2 className="text-2xl font-bold mb-4">
                Order Confirmed!
              </h2>
              <div className={`space-y-3 text-left max-w-md mx-auto ${cardClass} rounded-lg p-6 border`}>
                <div className="flex justify-between">
                  <span className="text-[var(--light-gray)]">Order ID:</span>
                  <span className="font-semibold">#{orderSuccess.order.order?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--light-gray)]">Payment Method:</span>
                  <span className="font-semibold">{orderSuccess.method}</span>
                </div>
                {orderSuccess.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-[var(--light-gray)]">Transaction ID:</span>
                    <span className="font-mono text-sm">{orderSuccess.transactionId}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-[var(--border)]">
                  <span>Total Paid:</span>
                  <span className="text-[var(--button)]">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  className={`${buttonClass} px-8 py-3 rounded-lg flex items-center justify-center`}
                  onClick={() => navigate("/customer/orders")}
                >
                  <FiPackage className="mr-2" />
                  View My Orders
                </button>
                <button
                  className={`${secondaryButtonClass} px-8 py-3 rounded-lg border flex items-center justify-center`}
                  onClick={() => navigate("/")}
                >
                  <FiShoppingCart className="mr-2" />
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Order Items & Address */}
            <div className="xl:col-span-2 space-y-8">
              {/* Order Items Card */}
              <div className={`rounded-2xl border ${cardClass} p-8 transition-all duration-300 hover:shadow-lg`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center">
                    <FiShoppingCart className={`mr-3 ${iconStyle}`} />
                    Order Items
                    <span className="ml-3 text-sm bg-[var(--button)] text-white px-2 py-1 rounded-full">
                      {currentCart?.items?.length || 0}
                    </span>
                  </h2>
                  <span className="text-lg font-semibold text-[var(--button)]">
                    ${total.toFixed(2)}
                  </span>
                </div>
                
                {currentCart?.items?.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-[var(--div)] rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiShoppingCart className={`text-3xl ${iconStyle}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
                    <p className="text-[var(--light-gray)] mb-6">Add some items to get started</p>
                    <button 
                      onClick={() => navigate("/")}
                      className={`${buttonClass} px-6 py-3 rounded-lg`}
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentCart.items.map((item) => (
                      <div key={`${item.id}-${item.product_id || ""}`} className="transform hover:scale-[1.01] transition-transform duration-200">
                        <CartItem
                          item={{
                            ...item,
                            image:
                              Array.isArray(item.images) && item.images.length
                                ? item.images[0]
                                : null,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shipping Address Card */}
              <div className={`rounded-2xl border ${cardClass} p-8 transition-all duration-300 hover:shadow-lg`}>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <FiHome className={`mr-3 ${iconStyle}`} />
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">
                      Street Address *
                    </label>
                    <input
                      className={`w-full p-4 rounded-xl border ${inputClass} transition-colors duration-200`}
                      placeholder="123 Main Street"
                      value={address.address_line1}
                      onChange={(e) =>
                        setAddress({ ...address, address_line1: e.target.value })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">
                      Apartment, Suite, etc.
                    </label>
                    <input
                      className={`w-full p-4 rounded-xl border ${inputClass} transition-colors duration-200`}
                      placeholder="Apt 4B"
                      value={address.address_line2}
                      onChange={(e) =>
                        setAddress({ ...address, address_line2: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      City *
                    </label>
                    <input
                      className={`w-full p-4 rounded-xl border ${inputClass} transition-colors duration-200`}
                      placeholder="New York"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      State
                    </label>
                    <input
                      className={`w-full p-4 rounded-xl border ${inputClass} transition-colors duration-200`}
                      placeholder="NY"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      ZIP Code
                    </label>
                    <input
                      className={`w-full p-4 rounded-xl border ${inputClass} transition-colors duration-200`}
                      placeholder="10001"
                      value={address.postal_code}
                      onChange={(e) =>
                        setAddress({ ...address, postal_code: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Country
                    </label>
                    <input
                      className={`w-full p-4 rounded-xl border ${inputClass} transition-colors duration-200`}
                      placeholder="United States"
                      value={address.country}
                      onChange={(e) =>
                        setAddress({ ...address, country: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary & Payment */}
            <div className="space-y-8 pb-6">
              {/* Order Summary Card */}
              <div className={`rounded-2xl border ${cardClass} p-8 sticky top-8 transition-all duration-300 hover:shadow-lg`}>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <FiFileText className={`mr-3 ${iconStyle}`} />
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                    <span className="text-[var(--light-gray)]">Subtotal</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                      <span className="text-[var(--success)]">Coupon Discount</span>
                      <span className="font-semibold text-[var(--success)]">
                        -${appliedCoupon.discount_amount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {usePointsChecked && (
                    <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                      <span className="text-[var(--success)]">Points Discount</span>
                      <span className="font-semibold text-[var(--success)]">
                        -${pointsDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-4 border-t-2 border-[var(--border)]">
                    <span className="text-xl font-bold">Total</span>
                    <span className="text-2xl font-bold text-[var(--button)]">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <FiTag className={`mr-2 ${iconStyle}`} />
                    Apply Coupon
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className={`flex-1 p-3 rounded-lg border ${inputClass}`}
                    />
                    <button
                      onClick={handleValidateCoupon}
                      className={`${buttonClass} px-4 py-3 rounded-lg whitespace-nowrap min-w-[80px]`}
                    >
                      Apply
                    </button>
                  </div>
                  {couponResult && (
                    <div className={`p-4 rounded-lg border ${
                      couponResult.discount > 0 ? successClass : errorClass
                    }`}>
                      <p className="font-semibold">{couponResult.message}</p>
                      {couponResult.discount > 0 && (
                        <div className="mt-2 text-sm">
                          <p>Discount: <strong>${couponResult.discount.toFixed(2)}</strong></p>
                          <p>New Total: <strong>${couponResult.final.toFixed(2)}</strong></p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Loyalty Points - Compact Version */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center">
                      <FiStar className={`mr-2 ${iconStyle}`} />
                      Loyalty Points
                    </h3>
                    <span className="text-sm text-[var(--light-gray)]">
                      {loyaltyPoints} points available
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={usePointsChecked}
                          onChange={() => handleUsePoints(loyaltyPoints)}
                          className="sr-only"
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                          usePointsChecked ? 'bg-[var(--button)]' : 'bg-[var(--border)]'
                        }`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                            usePointsChecked ? 'transform translate-x-4' : ''
                          }`} />
                        </div>
                      </div>
                      <span className="ml-2 text-sm">Use points</span>
                    </label>
                    
                    {usePointsChecked && (
                      <div className="flex-1">
                        <input
                          type="number"
                          value={userPointsToUse}
                          onChange={(e) => setUserPointsToUse(Number(e.target.value))}
                          className={`w-full p-2 rounded-lg border ${inputClass} text-sm`}
                          min="0"
                          max={loyaltyPoints}
                          placeholder="Points to use"
                        />
                      </div>
                    )}
                  </div>
                  
                  {usePointsChecked && (
                    <div className="mt-2 flex justify-between items-center text-sm">
                      <span className="text-[var(--success)]">
                        Save: ${pointsDiscount.toFixed(2)}
                      </span>
                      <span className="text-[var(--light-gray)]">
                        Max: {loyaltyPoints} points
                      </span>
                    </div>
                  )}
                  
                  {pointsError && (
                    <p className="text-[var(--error)] text-sm mt-2">{pointsError}</p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <FiCreditCard className={`mr-2 ${iconStyle}`} />
                    Payment Method
                  </h3>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className={`w-full p-4 rounded-xl border ${inputClass} mb-4`}
                  >
                    <option value="cod">
                      <FiTruck className="inline mr-2" />
                      Cash on Delivery
                    </option>
                    <option value="card">
                      <FiCreditCard className="inline mr-2" />
                      Credit/Debit Card
                    </option>
                    <option value="paypal">
                      <FiCreditCard className="inline mr-2" />
                      PayPal
                    </option>
                  </select>

                  {paymentMethod === "card" && (
                    <div className={`space-y-4 ${cardClass} rounded-xl p-4 border`}>
                      <div>
                        <label className="block text-sm font-medium mb-2">Card Number</label>
                        <input
                          placeholder="1234 5678 9012 3456"
                          value={card.number}
                          onChange={(e) => setCard({ ...card, number: e.target.value })}
                          className={`w-full p-3 rounded-lg border ${inputClass}`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-2">Expiry Month</label>
                          <input
                            placeholder="MM"
                            value={card.expiryMonth}
                            onChange={(e) => setCard({ ...card, expiryMonth: e.target.value })}
                            className={`w-full p-3 rounded-lg border ${inputClass}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Expiry Year</label>
                          <input
                            placeholder="YYYY"
                            value={card.expiryYear}
                            onChange={(e) => setCard({ ...card, expiryYear: e.target.value })}
                            className={`w-full p-3 rounded-lg border ${inputClass}`}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-2">CVC</label>
                          <input
                            placeholder="123"
                            value={card.cvc}
                            onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                            className={`w-full p-3 rounded-lg border ${inputClass}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                          <input
                            placeholder="John Doe"
                            value={card.name}
                            onChange={(e) => setCard({ ...card, name: e.target.value })}
                            className={`w-full p-3 rounded-lg border ${inputClass}`}
                          />
                        </div>
                      </div>
                      {cardError && (
                        <p className={`text-[var(--error)] text-sm p-3 ${errorClass} rounded-lg`}>
                          {cardError}
                        </p>
                      )}
                    </div>
                  )}

                  {paymentMethod === "paypal" && (
                    <div className={`${cardClass} rounded-xl p-4 border`}>
                      <div id="paypal-button-container" className="min-h-[50px]"></div>
                    </div>
                  )}
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckoutClickWithDiscount}
                  disabled={checkoutLoading || currentCart?.items?.length === 0}
                  className={`w-full ${buttonClass} py-4 rounded-xl font-semibold text-lg flex items-center justify-center transition-all duration-200 ${
                    checkoutLoading || currentCart?.items?.length === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-lg'
                  }`}
                >
                  {checkoutLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Processing Your Order...
                    </>
                  ) : (
                    <>
                      <FiCreditCard className="mr-2" />
                      Complete Order - ${finalTotal.toFixed(2)}
                    </>
                  )}
                </button>

                {checkoutError && (
                  <div className={`mt-4 p-4 border ${errorClass} rounded-xl`}>
                    <p className="text-sm">{checkoutError}</p>
                  </div>
                )}

                <p className="text-xs text-center mt-4 text-[var(--light-gray)] flex items-center justify-center">
                  <FiShield className="mr-1" />
                  Your payment information is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPage;