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
  FiShield,
  FiMapPin,
  FiDollarSign,
  FiPercent,
  FiGift,
  FiChevronDown
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
    ? 'bg-[var(--div)] border-[var(--border)] backdrop-blur-sm bg-opacity-80' 
    : 'bg-[var(--textbox)] border-[var(--border)] backdrop-blur-sm bg-opacity-80';
    
  const inputClass = themeMode === 'dark' 
    ? 'bg-[var(--mid-dark)] border-[var(--border)] text-[var(--text)] placeholder-[var(--light-gray)] focus:border-[var(--button)] focus:ring-2 focus:ring-[var(--button)]/20 transition-all duration-300' 
    : 'bg-white border-[var(--border)] text-[var(--text)] placeholder-[var(--light-gray)] focus:border-[var(--button)] focus:ring-2 focus:ring-[var(--button)]/20 transition-all duration-300';
    
  const buttonClass = "bg-[var(--button)] hover:bg-[#015c40] text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg relative overflow-hidden";
  const secondaryButtonClass = themeMode === 'dark' 
    ? 'border-[var(--border)] bg-[var(--mid-dark)] hover:bg-[var(--hover)] text-[var(--text)] transition-all duration-300' 
    : 'border-[var(--border)] bg-white hover:bg-[var(--hover)] text-[var(--text)] transition-all duration-300';

  const successClass = themeMode === 'dark' 
    ? 'bg-green-900/30 border-green-500/50 text-green-300 backdrop-blur-sm' 
    : 'bg-green-50 border-green-200 text-green-800 backdrop-blur-sm';
    
  const errorClass = themeMode === 'dark' 
    ? 'bg-red-900/30 border-red-500/50 text-red-300 backdrop-blur-sm' 
    : 'bg-red-50 border-red-200 text-red-800 backdrop-blur-sm';

  if (status === "loading") return (
    <div className={`min-h-screen flex items-center justify-center ${containerClass}`}>
      <div className="text-center animate-fade-in">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--button)] mx-auto mb-4 backdrop-blur-sm"></div>
        <p className="text-lg text-[var(--light-gray)]">Loading your order details...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className={`min-h-screen flex items-center justify-center ${containerClass}`}>
      <div className={`text-center max-w-md p-8 rounded-2xl border-2 ${errorClass} animate-fade-in-up backdrop-blur-sm`}>
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
          <FiAlertCircle className="text-2xl text-red-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">Error Loading Order</h3>
        <p className="mb-6 opacity-90">{error}</p>
        <button 
          onClick={() => navigate(-1)}
          className={`${buttonClass} px-6 py-3 rounded-xl flex items-center justify-center mx-auto`}
        >
          <FiArrowLeft className="mr-2" />
          Go Back
        </button>
      </div>
    </div>
  );
  
  if (!currentCart) return (
    <div className={`min-h-screen flex items-center justify-center ${containerClass}`}>
      <div className="text-center max-w-md p-8 animate-fade-in">
        <div className="w-20 h-20 bg-[var(--div)] rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
          <FiShoppingCart className="text-2xl text-[var(--text)]" />
        </div>
        <h3 className="text-xl font-bold mb-4">Cart Not Found</h3>
        <p className="text-[var(--light-gray)] mb-6">We couldn't find the cart you're looking for.</p>
        <button 
          onClick={() => navigate("/")}
          className={`${buttonClass} px-6 py-3 rounded-xl`}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen py-6 ${containerClass} transition-colors duration-300 font-sans`}>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header - أكثر إحترافية وأقل طولاً */}
        <div className="text-left mb-6 p-4 animate-fade-in-up">
          <h1 className="text-3xl font-bold mb-3 text-[var(--text)] tracking-tight">
            Complete Your Order
          </h1>
          <p className="text-base text-[var(--light-gray)] max-w-2xl leading-relaxed">
            Review your items, apply discounts, and securely complete your purchase
          </p>
        </div>

        {orderSuccess ? (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className={`bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-2 ${successClass} rounded-3xl p-8 text-center shadow-2xl backdrop-blur-sm`}>
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce backdrop-blur-sm">
                <FiCheckCircle className="text-3xl text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400 tracking-tight">
                Order Confirmed!
              </h2>
              <div className={`space-y-3 text-left max-w-md mx-auto ${cardClass} rounded-2xl p-5 border shadow-lg backdrop-blur-sm`}>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[var(--light-gray)] flex items-center text-sm">
                    <FiPackage className="mr-2" />
                    Order ID:
                  </span>
                  <span className="font-semibold text-[var(--text)] text-sm">#{orderSuccess.order.order?.id}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[var(--light-gray)] flex items-center text-sm">
                    <FiCreditCard className="mr-2" />
                    Payment Method:
                  </span>
                  <span className="font-semibold text-[var(--text)] text-sm">{orderSuccess.method}</span>
                </div>
                {orderSuccess.transactionId && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[var(--light-gray)] text-sm">Transaction ID:</span>
                    <span className="font-mono text-xs bg-[var(--bg)] px-2 py-1 rounded text-[var(--text)] backdrop-blur-sm">
                      {orderSuccess.transactionId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t border-[var(--border)]">
                  <span className="flex items-center text-[var(--text)]">
                    <FiDollarSign className="mr-1" />
                    Total Paid:
                  </span>
                  <span className="text-[var(--button)]">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <button
                  className={`${buttonClass} px-6 py-3 rounded-xl flex items-center justify-center text-base backdrop-blur-sm`}
                  onClick={() => navigate("/customer/orders")}
                >
                  <FiPackage className="mr-2" />
                  View My Orders
                </button>
                <button
                  className={`${secondaryButtonClass} px-6 py-3 rounded-xl border-2 flex items-center justify-center text-base backdrop-blur-sm`}
                  onClick={() => navigate("/")}
                >
                  <FiShoppingCart className="mr-2" />
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Order Items & Address */}
            <div className="xl:col-span-2 space-y-6">
              {/* Order Items Card - أقصر */}
              <div className={`rounded-2xl border-2 ${cardClass} p-6 transition-all duration-300 hover:shadow-xl animate-fade-in-up shadow-lg backdrop-blur-sm`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center text-[var(--text)] tracking-tight">
                    <FiShoppingCart className={`mr-3 text-[var(--button)]`} />
                    Order Items
                    <span className="ml-2 text-xs bg-[var(--button)] text-white px-2 py-1 rounded-full backdrop-blur-sm">
                      {currentCart?.items?.length || 0}
                    </span>
                  </h2>
                  <span className="text-lg font-semibold text-[var(--button)] bg-[var(--button)]/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                    ${total.toFixed(2)}
                  </span>
                </div>
                
                {currentCart?.items?.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-[var(--div)] rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                      <FiShoppingCart className="text-2xl text-[var(--text)]" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-[var(--text)] tracking-tight">Your cart is empty</h3>
                    <p className="text-[var(--light-gray)] text-sm mb-4">Add some items to get started</p>
                    <button 
                      onClick={() => navigate("/")}
                      className={`${buttonClass} px-6 py-3 rounded-xl text-base backdrop-blur-sm`}
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentCart.items.map((item, index) => (
                      <div 
                        key={`${item.id}-${item.product_id || ""}`} 
                        className="transform hover:scale-[1.005] transition-all duration-300 animate-fade-in-up backdrop-blur-sm"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
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

              {/* Shipping Address Card - أقصر */}
              <div className={`rounded-2xl border-2 ${cardClass} p-6 transition-all duration-300 hover:shadow-xl animate-fade-in-up shadow-lg backdrop-blur-sm`}>
                <h2 className="text-xl font-bold mb-6 flex items-center text-[var(--text)] tracking-tight">
                  <FiMapPin className={`mr-3 text-[var(--button)]`} />
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 text-[var(--text)] tracking-tight">
                      Street Address *
                    </label>
                    <input
                      className={`w-full p-3 rounded-xl border-2 ${inputClass} transition-all duration-200 focus:shadow-lg backdrop-blur-sm text-sm`}
                      placeholder="123 Main Street"
                      value={address.address_line1}
                      onChange={(e) =>
                        setAddress({ ...address, address_line1: e.target.value })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 text-[var(--text)] tracking-tight">
                      Apartment, Suite, etc.
                    </label>
                    <input
                      className={`w-full p-3 rounded-xl border-2 ${inputClass} transition-all duration-200 focus:shadow-lg backdrop-blur-sm text-sm`}
                      placeholder="Apt 4B"
                      value={address.address_line2}
                      onChange={(e) =>
                        setAddress({ ...address, address_line2: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[var(--text)] tracking-tight">
                      City *
                    </label>
                    <input
                      className={`w-full p-3 rounded-xl border-2 ${inputClass} transition-all duration-200 focus:shadow-lg backdrop-blur-sm text-sm`}
                      placeholder="New York"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary & Payment */}
            <div className="space-y-6 pb-6">
              {/* Order Summary Card - أقصر */}
              <div className={`rounded-2xl border-2 ${cardClass} p-6 sticky top-6 transition-all duration-300 hover:shadow-xl animate-fade-in-up shadow-xl backdrop-blur-sm`}>
                <h2 className="text-xl font-bold mb-6 flex items-center text-[var(--text)] tracking-tight">
                  <FiFileText className={`mr-3 text-[var(--button)]`} />
                  Order Summary
                </h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                    <span className="text-[var(--light-gray)] text-sm">Subtotal</span>
                    <span className="font-semibold text-[var(--text)] text-sm">${total.toFixed(2)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                      <span className="text-green-600 dark:text-green-400 flex items-center text-sm">
                        <FiPercent className="mr-2" />
                        Coupon Discount
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400 text-sm">
                        -${appliedCoupon.discount_amount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {usePointsChecked && (
                    <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                      <span className="text-green-600 dark:text-green-400 flex items-center text-sm">
                        <FiStar className="mr-2" />
                        Points Discount
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400 text-sm">
                        -${pointsDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-4 border-t-2 border-[var(--border)]">
                    <span className="text-lg font-bold text-[var(--text)] tracking-tight">Total</span>
                    <span className="text-xl font-bold text-[var(--button)] bg-[var(--button)]/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center text-base text-[var(--text)] tracking-tight">
                    <FiGift className={`mr-2 text-[var(--button)]`} />
                    Apply Coupon
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className={`flex-1 p-3 rounded-xl border-2 ${inputClass} focus:shadow-lg min-w-0 backdrop-blur-sm text-sm`}
                    />
                    <button
                      onClick={handleValidateCoupon}
                      className={`${buttonClass} px-4 py-3 rounded-xl whitespace-nowrap sm:w-auto w-full backdrop-blur-sm text-sm`}
                    >
                      Apply
                    </button>
                  </div>
                  {couponResult && (
                    <div className={`p-3 rounded-xl border-2 backdrop-blur-sm text-sm ${
                      couponResult.discount > 0 ? successClass : errorClass
                    } animate-fade-in`}>
                      <p className="font-semibold tracking-tight">{couponResult.message}</p>
                      {couponResult.discount > 0 && (
                        <div className="mt-2 text-xs space-y-1">
                          <p className="text-[var(--text)]">Discount: <strong>${couponResult.discount.toFixed(2)}</strong></p>
                          <p className="text-[var(--text)]">New Total: <strong>${couponResult.final.toFixed(2)}</strong></p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Loyalty Points */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center text-base text-[var(--text)] tracking-tight">
                      <FiStar className={`mr-2 text-[var(--button)]`} />
                      Loyalty Points
                    </h3>
                    <span className="text-xs text-[var(--light-gray)] bg-[var(--bg)] px-2 py-1 rounded-full backdrop-blur-sm">
                      {loyaltyPoints} points
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                    <label className="flex items-center cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={usePointsChecked}
                          onChange={() => handleUsePoints(loyaltyPoints)}
                          className="sr-only"
                        />
                        <div className={`w-10 h-5 rounded-full transition-all duration-300 backdrop-blur-sm ${
                          usePointsChecked ? 'bg-[var(--button)]' : 'bg-[var(--border)]'
                        } group-hover:shadow-md`}>
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 backdrop-blur-sm ${
                            usePointsChecked ? 'transform translate-x-5' : ''
                          } group-hover:scale-110`} />
                        </div>
                      </div>
                      <span className="ml-2 font-medium text-[var(--text)] tracking-tight text-sm">Use points</span>
                    </label>
                    
                    {usePointsChecked && (
                      <div className="flex-1 sm:mt-0 mt-2">
                        <input
                          type="number"
                          value={userPointsToUse}
                          onChange={(e) => setUserPointsToUse(Number(e.target.value))}
                          className={`w-full p-2 rounded-lg border-2 ${inputClass} text-xs focus:shadow-lg backdrop-blur-sm`}
                          min="0"
                          max={loyaltyPoints}
                          placeholder="Points to use"
                        />
                      </div>
                    )}
                  </div>
                  
                  {usePointsChecked && (
                    <div className="flex justify-between items-center text-xs bg-[var(--bg)] p-2 rounded-xl backdrop-blur-sm">
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        Save: ${pointsDiscount.toFixed(2)}
                      </span>
                      <span className="text-[var(--light-gray)]">
                        Max: {loyaltyPoints} points
                      </span>
                    </div>
                  )}
                  
                  {pointsError && (
                    <p className={`text-red-500 text-xs mt-1 p-2 ${errorClass} rounded-xl backdrop-blur-sm`}>{pointsError}</p>
                  )}
                </div>

                {/* Payment Method - Dropdown محسن */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 flex items-center text-base text-[var(--text)] tracking-tight">
                    <FiCreditCard className={`mr-2 text-[var(--button)]`} />
                    Payment Method
                  </h3>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className={`w-full p-3 rounded-xl border-2 ${inputClass} focus:shadow-lg backdrop-blur-sm text-sm appearance-none cursor-pointer`}
                      style={{ 
                        backgroundColor: themeMode === 'dark' ? 'var(--bg)' : 'white'
                      }}
                    >
                      <option value="cod" className="flex items-center py-2">
                        <FiTruck className="inline mr-2" />
                        Cash on Delivery
                      </option>
                      <option value="card" className="flex items-center py-2">
                        <FiCreditCard className="inline mr-2" />
                        Credit/Debit Card
                      </option>
                      <option value="paypal" className="flex items-center py-2">
                        <FiCreditCard className="inline mr-2" />
                        PayPal
                      </option>
                    </select>
                    <FiChevronDown 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--light-gray)] pointer-events-none" 
                      size={16}
                    />
                  </div>

                  {paymentMethod === "card" && (
                    <div className={`space-y-3 ${cardClass} rounded-xl p-4 border-2 animate-fade-in backdrop-blur-sm mt-3`}>
                      <div>
                        <label className="block text-xs font-semibold mb-2 text-[var(--text)] tracking-tight">Card Number</label>
                        <input
                          placeholder="1234 5678 9012 3456"
                          value={card.number}
                          onChange={(e) => setCard({ ...card, number: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border-2 ${inputClass} focus:shadow-lg backdrop-blur-sm text-sm`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold mb-2 text-[var(--text)] tracking-tight">Expiry Month</label>
                          <input
                            placeholder="MM"
                            value={card.expiryMonth}
                            onChange={(e) => setCard({ ...card, expiryMonth: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border-2 ${inputClass} focus:shadow-lg backdrop-blur-sm text-sm`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-2 text-[var(--text)] tracking-tight">Expiry Year</label>
                          <input
                            placeholder="YYYY"
                            value={card.expiryYear}
                            onChange={(e) => setCard({ ...card, expiryYear: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border-2 ${inputClass} focus:shadow-lg backdrop-blur-sm text-sm`}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold mb-2 text-[var(--text)] tracking-tight">CVC</label>
                          <input
                            placeholder="123"
                            value={card.cvc}
                            onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border-2 ${inputClass} focus:shadow-lg backdrop-blur-sm text-sm`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-2 text-[var(--text)] tracking-tight">Cardholder Name</label>
                          <input
                            placeholder="John Doe"
                            value={card.name}
                            onChange={(e) => setCard({ ...card, name: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border-2 ${inputClass} focus:shadow-lg backdrop-blur-sm text-sm`}
                          />
                        </div>
                      </div>
                      {cardError && (
                        <p className={`p-2.5 ${errorClass} rounded-xl font-medium tracking-tight text-xs backdrop-blur-sm`}>
                          {cardError}
                        </p>
                      )}
                    </div>
                  )}

                  {paymentMethod === "paypal" && (
                    <div className={`${cardClass} rounded-xl p-4 border-2 animate-fade-in backdrop-blur-sm mt-3`}>
                      <div id="paypal-button-container" className="min-h-[40px]"></div>
                    </div>
                  )}
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckoutClickWithDiscount}
                  disabled={checkoutLoading || currentCart?.items?.length === 0}
                  className={`w-full ${buttonClass} py-4 rounded-2xl font-bold text-base flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
                    checkoutLoading || currentCart?.items?.length === 0
                      ? 'opacity-50 cursor-not-allowed hover:scale-100'
                      : 'hover:shadow-xl'
                  }`}
                >
                  {checkoutLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Your Order...
                    </>
                  ) : (
                    <>
                      <FiCreditCard className="mr-2 text-lg" />
                      Complete Order - ${finalTotal.toFixed(2)}
                    </>
                  )}
                </button>

                {checkoutError && (
                  <div className={`mt-4 p-3 border-2 ${errorClass} rounded-xl animate-fade-in backdrop-blur-sm`}>
                    <p className="font-medium tracking-tight text-sm">{checkoutError}</p>
                  </div>
                )}

                <p className="text-xs text-center mt-4 text-[var(--light-gray)] flex items-center justify-center bg-[var(--bg)] p-3 rounded-xl backdrop-blur-sm">
                  <FiShield className="mr-2 text-[var(--button)]" />
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