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
  FiChevronDown,
  FiX,
  FiInfo
} from "react-icons/fi";

// Toast Component
const Toast = ({ message, type = "info", onClose }) => {
  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500", 
    warning: "bg-yellow-500",
    info: "bg-blue-500"
  }[type];

  const icon = {
    success: <FiCheckCircle className="text-white" />,
    error: <FiAlertCircle className="text-white" />,
    warning: <FiAlertCircle className="text-white" />,
    info: <FiInfo className="text-white" />
  }[type];

  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl z-50 max-w-sm animate-fade-in-up backdrop-blur-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-3">{icon}</span>
          <span className="font-medium text-sm">{message}</span>
        </div>
        <button 
          onClick={onClose}
          className="ml-4 hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <FiX size={16} />
        </button>
      </div>
    </div>
  );
};

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const readJSON = (key) => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch (e) {
      return null;
    }
  };

  const couponFromLocation = location.state?.appliedCoupon;
  const savedCoupon = readJSON("appliedCoupon");
  const appliedCouponFromState = couponFromLocation || savedCoupon;

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

  // States for pricing breakdown
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [totalWithShipping, setTotalWithShipping] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(
    appliedCouponFromState || { discount_amount: 0, code: null }
  );

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const validateCoupon = async (couponCode, userId, cartItems = []) => {
    if (!userId) {
      showToast("User ID not found. Please login again.", "error");
      throw new Error("User ID not found. Please login again.");
    }
    const preparedUserId = Number(userId);
    const res = await fetch("http://localhost:3000/api/coupons/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        coupon_code: couponCode,
        userId: preparedUserId,
        cartItems,
      }),
      credentials: "include",
    });
    if (!res.ok) {
      const errorData = await res.json();
      showToast(errorData.message || "Failed to validate coupon.", "error");
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
  const [usePointsChecked, setUsePointsChecked] = useState(false);
  const [userPointsToUse, setUserPointsToUse] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [pointsError, setPointsError] = useState("");
  const [couponResult, setCouponResult] = useState(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  
  const cities = [
    "Amman", "Zarqa", "Irbid", "Aqaba", "Mafraq", "Jerash", 
    "Madaba", "Karak", "Tafilah", "Ma'an", "Ajloun",
  ];

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

  // حساب نقاط الولاء مرة واحدة عند التحميل
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
        console.log("✅ Loyalty points loaded:", pointsBalance);
      } catch (err) {
        console.error("Error fetching loyalty points:", err);
        showToast("Error loading loyalty points", "error");
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

    const isReorder = location.state?.reorder;
    
    if (isReorder) {
      console.log("🔄 Reorder flow - resetting coupon data");
      setAppliedCoupon({
        discount_amount: 0,
        code: null,
      });
      localStorage.removeItem("appliedCoupon");
      return;
    }

    if (appliedCouponFromState && appliedCouponFromState !== null) {
      console.log("🎫 Regular order with coupon:", appliedCouponFromState);
      
      let totalDiscount = 0;

      if (typeof appliedCouponFromState === "object") {
        Object.values(appliedCouponFromState).forEach((c) => {
          if (c && typeof c === 'object') {
            totalDiscount += Number(c?.discount || 0);
          }
        });
      } else {
        totalDiscount = Number(appliedCouponFromState?.discount_amount || 0);
      }

      setAppliedCoupon({
        discount_amount: totalDiscount,
        code: null,
      });

      localStorage.setItem(
        "appliedCoupon",
        JSON.stringify({
          discount_amount: totalDiscount,
          code: null,
        })
      );
    } else {
      setAppliedCoupon({
        discount_amount: 0,
        code: null,
      });
    }
  }, [cartFromState, appliedCouponFromState, orderId, dispatch, location.state]);

  // ✅ حساب الـ Subtotal فقط
  useEffect(() => {
    const cartSubtotal =
      currentCart?.items?.reduce(
        (sum, item) => sum + Number(item.price || 0) * (item.quantity || 1),
        0
      ) || 0;

    setSubtotal(cartSubtotal);
  }, [currentCart]);

  // ✅ حساب خصم النقاط
  const calculatePointsDiscount = (points) => {
    const discountPercent = Math.min(Math.floor(points / 100) * 10, 50);
    const discount = (subtotal * discountPercent) / 100;
    return { discountPercent, discount };
  };

  // ✅ تحديث خصم النقاط
  useEffect(() => {
    if (usePointsChecked && userPointsToUse > 0) {
      const { discount } = calculatePointsDiscount(userPointsToUse);
      setPointsDiscount(discount);
      console.log("🔄 Points discount updated:", { userPointsToUse, discount });
    } else {
      setPointsDiscount(0);
    }
  }, [userPointsToUse, usePointsChecked, subtotal]);

  // ✅ حساب كل شيء في useEffect واحد - التسلسل الصحيح
  useEffect(() => {
    console.log("🔄 Calculating final total...", {
      subtotal,
      deliveryFee,
      couponDiscount: appliedCoupon?.discount_amount,
      pointsDiscount,
      usePointsChecked
    });

    // الخطوة 1: حساب الـ Total With Shipping
    const calculatedTotalWithShipping = subtotal + (deliveryFee || 0);

    // الخطوة 2: تطبيق خصم الكوبون
    let totalAfterCoupon = calculatedTotalWithShipping;
    if (appliedCoupon?.discount_amount && appliedCoupon.discount_amount > 0) {
      totalAfterCoupon -= Number(appliedCoupon.discount_amount);
    }

    // الخطوة 3: تطبيق خصم النقاط
    let finalTotalValue = totalAfterCoupon;
    if (usePointsChecked && pointsDiscount > 0) {
      finalTotalValue -= pointsDiscount;
    }

    // الخطوة 4: التأكد من أن القيمة موجبة
    if (finalTotalValue < 0) finalTotalValue = 0;

    setTotalWithShipping(calculatedTotalWithShipping);
    setFinalTotal(finalTotalValue);

    console.log("✅ Final calculation:", {
      subtotal,
      deliveryFee,
      totalWithShipping: calculatedTotalWithShipping,
      couponDiscount: appliedCoupon?.discount_amount,
      pointsDiscount,
      finalTotal: finalTotalValue
    });

  }, [subtotal, deliveryFee, appliedCoupon, pointsDiscount, usePointsChecked]);

  // ✅ تحديث delivery fee بعد الطلب الناجح
  useEffect(() => {
    if (orderSuccess?.order?.delivery_fee) {
      setDeliveryFee(orderSuccess.order.delivery_fee);
    }
  }, [orderSuccess]);

  const fullAddress = {
    address_line1: address.address_line1,
    address_line2: address.address_line2,
    city: address.city,
    state: address.state || address.city,
    postal_code: address.postal_code || "0000",
    country: address.country,
  };

const handleCalculateDelivery = async () => {
  if (!address.address_line1 || !address.city) {
    showToast("Please enter address and city first", "warning");
    setDeliveryFee(0);
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      "http://localhost:3000/api/customers/calculate-delivery-preview",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cart_id: currentCart?.id,
          address: fullAddress,
        }),
      }
    );

    if (!res.ok) throw new Error("Failed to calculate delivery fee");

    const data = await res.json();
    const fee = data.order?.delivery_fee || 0;

    // ✅ حول الـ deliveryFee لـ number
    setDeliveryFee(Number(fee)); // 🔥 هون التعديل
    showToast(`Delivery fee calculated: $${fee.toFixed(2)}`, "success");
    
  } catch (err) {
    console.error("Error calculating delivery:", err);
    setDeliveryFee(0);
    showToast("Using default delivery fee", "info");
  }
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
    if (!num || num.length < 12) {
      showToast("Invalid card number (min 12 digits for testing).", "error");
      return "Invalid card number (min 12 digits for testing).";
    }

    const m = parseInt(card.expiryMonth, 10);
    const y = parseInt(card.expiryYear, 10);
    if (!m || m < 1 || m > 12) {
      showToast("Invalid expiry month", "error");
      return "Invalid expiry month";
    }
    const currentYear = new Date().getFullYear();
    const twoDigit = y < 100 ? 2000 + y : y;
    if (!y || twoDigit < currentYear) {
      showToast("Expiry year must be current or future", "error");
      return "Expiry year must be current or future";
    }
    if (!card.cvc || card.cvc.length < 3) {
      showToast("Invalid CVC", "error");
      return "Invalid CVC";
    }
    if (!card.name) {
      showToast("Cardholder name required", "error");
      return "Cardholder name required";
    }

    return "";
  };

  const handleValidateCoupon = async () => {
    if (!profile?.id) {
      showToast("User not logged in. Please login first.", "error");
      return;
    }
    if (!currentCart?.items?.length) {
      showToast("Your cart is empty.", "warning");
      return;
    }
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
      const response = await validateCoupon(
        couponCode,
        profile.id,
        preparedItems
      );
      setAppliedCoupon({
        discount_amount: Number(response.discount_amount || 0),
        code: response.code || null,
      });
      setCouponResult({
        message: response.message,
        discount: response.discount_amount,
        total: response.total_amount,
        final: response.final_amount,
      });
      showToast("Coupon applied successfully!", "success");
    } catch (error) {
      setCouponResult({
        message: error.message || "Invalid or expired coupon.",
        discount: 0,
        total: totalWithShipping,
        final: totalWithShipping,
      });
    }
  };

  const handleUsePointsToggle = () => {
    const newUsePointsChecked = !usePointsChecked;
    
    if (newUsePointsChecked) {
      if (loyaltyPoints === 0) {
        setPointsError("You don't have any loyalty points to use.");
        showToast("You don't have any loyalty points to use.", "warning");
        return;
      }
      
      const defaultPoints = Math.min(loyaltyPoints, 100);
      setUserPointsToUse(defaultPoints);
      setUsePointsChecked(true);
      setPointsError("");
      
      console.log("✅ Points usage enabled:", { defaultPoints, loyaltyPoints });
      showToast("Loyalty points enabled!", "success");
    } else {
      setUsePointsChecked(false);
      setUserPointsToUse(0);
      setPointsError("");
      console.log("❌ Points usage disabled");
      showToast("Loyalty points disabled", "info");
    }
  };

  const handlePointsInputChange = (e) => {
    const enteredPoints = Number(e.target.value);
    
    if (enteredPoints < 0) {
      setPointsError("Points cannot be negative");
      showToast("Points cannot be negative", "error");
      return;
    }
    
    if (enteredPoints > loyaltyPoints) {
      setPointsError(`You only have ${loyaltyPoints} points available`);
      setUserPointsToUse(loyaltyPoints);
      showToast(`You only have ${loyaltyPoints} points available`, "warning");
    } else {
      setUserPointsToUse(enteredPoints);
      setPointsError("");
    }
  };

const handleCheckoutClick = async () => {
  // التحقق من العنوان
  if (!address.address_line1 || !address.city) {
    showToast("Address Line 1 and City are required!", "error");
    return;
  }

  // التحقق من النقاط المستخدمة
  if (usePointsChecked) {
    if (userPointsToUse > loyaltyPoints) {
      showToast(`Cannot use more points than available. You have ${loyaltyPoints} points.`, "error");
      return;
    }
    
    if (userPointsToUse <= 0) {
      showToast("Please enter a valid number of points to use.", "error");
      return;
    }
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

    const loyaltyPointsToUse = usePointsChecked ? Number(userPointsToUse) : 0;

    if (paymentMethod === "card") {
      const vErr = validateCardFields();
      if (vErr) {
        setCardError(vErr);
        setCheckoutLoading(false);
        return;
      }
    }

    // إعداد العناصر للسيرفر
    const itemsForServer = currentCart.items.map((item) => ({
      product_id: Number(item.product_id || item.id),
      quantity: Number(item.quantity),
      price: Number(item.price),
      vendor_id: Number(item.vendor_id || (item.vendor && item.vendor.id) || 0),
    }));

    // ✅ إضافة الـ final_total إلى الـ payload
    const checkoutPayload = {
      cart_id: currentCart.id,
      address: fullAddress,
      paymentMethod: paymentMethod === "card" ? "credit_card" : paymentMethod,
      paymentData,
      coupon_code: appliedCouponFromState?.code || null,
      use_loyalty_points: loyaltyPointsToUse,
      cartItems: itemsForServer,
      // ✅ إضافة الـ finalTotal كـ total_amount
      total_amount: parseFloat(finalTotal.toFixed(2)),
      // ✅ أو يمكنك إرسال كل القيم للتحقق
      calculated_totals: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        delivery_fee: parseFloat(deliveryFee.toFixed(2)),
        coupon_discount: parseFloat(appliedCoupon?.discount_amount || 0).toFixed(2),
        points_discount: parseFloat(pointsDiscount.toFixed(2)),
        final_total: parseFloat(finalTotal.toFixed(2))
      }
    };
    
    console.log("🛒 Checkout payload with final total:", checkoutPayload);
    
    const newOrder = await customerAPI.checkout(checkoutPayload);
    
    console.log("✅ Order created with total_amount:", newOrder.order?.total_amount);
    
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
      transactionId: checkoutPayload.paymentData?.transactionId,
      order: newOrder.order,
    });

    if (newOrder.order?.delivery_fee) {
      setDeliveryFee(newOrder.order.delivery_fee);
    }
    
    showToast("Order placed successfully!", "success");
    setTimeout(() => {
      navigate("/customer/orders");
    }, 1500);

  } catch (err) {
    console.error("❌ Checkout failed:", err);
    const errorMessage = err.response?.data?.error || err.message;
    setCheckoutError(errorMessage);
    showToast(errorMessage, "error");
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
            
            const loyaltyPointsToUse = usePointsChecked ? Number(userPointsToUse) : 0;
            
            // ✅ إضافة الـ finalTotal هنا أيضاً
            const newOrder = await customerAPI.checkout({
              cart_id: currentCart.id,
              address: fullAddress,
              paymentMethod: "paypal",
              paymentData: { transactionId },
              coupon_code: appliedCoupon?.code || null,
              use_loyalty_points: loyaltyPointsToUse,
              total_amount: parseFloat(finalTotal.toFixed(2)),
              calculated_totals: {
                subtotal: parseFloat(subtotal.toFixed(2)),
                delivery_fee: parseFloat(deliveryFee.toFixed(2)),
                coupon_discount: parseFloat(appliedCoupon?.discount_amount || 0).toFixed(2),
                points_discount: parseFloat(pointsDiscount.toFixed(2)),
                final_total: parseFloat(finalTotal.toFixed(2))
              }
            });

            await dispatch(deleteCart(currentCart.id)).unwrap();
            dispatch(fetchOrders());
            setOrderSuccess({ method: "PayPal", transactionId, order: newOrder.order });
            
            if (newOrder.order?.delivery_fee) {
              setDeliveryFee(newOrder.order.delivery_fee);
            }
            
            showToast("Order placed successfully with PayPal!", "success");
            setTimeout(() => {
              navigate("/customer/orders");
            }, 1500);
            
          } catch (err) {
            console.error("Checkout failed:", err);
            const errorMessage = err.response?.data?.error || err.message;
            setCheckoutError(errorMessage);
            showToast(errorMessage, "error");
          } finally {
            setCheckoutLoading(false);
          }
        },
      })
      .render("#paypal-button-container");
  }
}, [paymentMethod, finalTotal, currentCart, dispatch, usePointsChecked, userPointsToUse, appliedCoupon, fullAddress, navigate]);
  // CSS classes based on theme
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

  if (!currentCart)
    return (
      <div className={`min-h-screen flex items-center justify-center ${containerClass}`}>
        <div className="text-center max-w-md p-8 animate-fade-in">
          <div className="w-20 h-20 bg-[var(--div)] rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <FiShoppingCart className="text-2xl text-[var(--text)]" />
          </div>
          <h3 className="text-xl font-bold mb-4">Cart Not Found</h3>
          <p className="text-[var(--light-gray)] mb-6">
            We couldn't find the cart you're looking for.
          </p>
          <button
            onClick={() => navigate("/")}
            className={`${buttonClass} px-6 py-3 rounded-xl`}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );

  const { discountPercent } = calculatePointsDiscount(userPointsToUse);

  return (
    <>
      {/* Toast Container */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <div className={`min-h-screen py-6 ${containerClass} transition-colors duration-300 font-sans`}>
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
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
                {/* <div className={`space-y-3 text-left max-w-md mx-auto ${cardClass} rounded-2xl p-5 border shadow-lg backdrop-blur-sm`}>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[var(--light-gray)] flex items-center text-sm">
                      <FiPackage className="mr-2" />
                      Order ID:
                    </span>
                    <span className="font-semibold text-[var(--text)] text-sm">#{orderSuccess.order?.id}</span>
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
                  {orderSuccess.order?.discount_amount && orderSuccess.order.discount_amount > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-green-600 dark:text-green-400 flex items-center text-sm">
                        <FiStar className="mr-2" />
                        Points Discount Applied:
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400 text-sm">
                        -${parseFloat(orderSuccess.order.discount_amount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t border-[var(--border)]">
                    <span className="flex items-center text-[var(--text)]">
                      <FiDollarSign className="mr-1" />
                      Total Paid:
                    </span>
                    <span className="text-[var(--button)]">${parseFloat(orderSuccess.order?.final_amount || 0).toFixed(2)}</span>
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
                </div> */}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Order Items & Address */}
              <div className="xl:col-span-2 space-y-6">
                {/* Order Items Card */}
                <div className={`rounded-2xl border-2 ${cardClass} p-6 transition-all duration-300 hover:shadow-xl animate-fade-in-up shadow-lg backdrop-blur-sm`}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center text-[var(--text)] tracking-tight">
                      <FiShoppingCart className={`mr-3 ${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'}`} />
                      Order Items
                      <span className="ml-2 text-xs bg-[var(--button)] text-white px-2 py-1 rounded-full backdrop-blur-sm">
                        {currentCart?.items?.length || 0}
                      </span>
                    </h2>
                    <span className={`text-xl font-bold flex items-center  bg-[var(--button)]/10  p-2 rounded-xl ${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'}`}>
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  
                  {currentCart?.items?.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-[var(--div)] rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                        <FiShoppingCart  className={`mr-3 ${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'}`}  />
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

                {/* Shipping Address Card */}
                <div className={`rounded-2xl border-2 ${cardClass} p-6 transition-all duration-300 hover:shadow-xl animate-fade-in-up shadow-lg backdrop-blur-sm`}>
                  <h2 className="text-xl font-bold mb-6 flex items-center text-[var(--text)] tracking-tight">
                    <FiMapPin className={`mr-3 ${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'}`} />
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
                    
                    {/* City and Calculate Delivery Button in the same row */}
                    <div className="md:col-span-2">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
                        {/* City Field - takes 2/3 of the row */}
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-semibold mb-2 text-[var(--text)] tracking-tight">
                            City *
                          </label>
                          <select
                            className={`w-full p-3 rounded-xl border-2 ${inputClass} transition-all duration-200 focus:shadow-lg backdrop-blur-sm text-sm`}
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          >
                            <option value="">Select a city</option>
                            {cities.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Calculate Delivery Button - takes 1/3 of the row */}
                        <div className="lg:col-span-1">
                          <button
                            onClick={handleCalculateDelivery}
                            className={`w-full ${buttonClass} px-4 py-3 rounded-xl text-sm font-semibold backdrop-blur-sm transition-all duration-200 hover:scale-105 h-[50px]`}
                          >
                            Calculate Delivery
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-4 md:h-6 lg:h-8 xl:h-8"></div>
              </div>

              {/* Right Column - Order Summary & Payment */}
              <div className="space-y-6 pb-6">
                {/* Order Summary Card */}
                <div className={`rounded-2xl border-2 ${cardClass} p-6 sticky top-6 transition-all duration-300 hover:shadow-xl animate-fade-in-up shadow-xl backdrop-blur-sm`}>
                  <h2 className="text-xl font-bold mb-6 flex items-center text-[var(--text)] tracking-tight">
                    <FiFileText className={`mr-3 ${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'}`} />
                    Order Summary
                  </h2>
                  
                  {/* Pricing Breakdown */}
                  <div className="space-y-3 mb-6">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                      <span className="text-[var(--light-gray)] text-sm">Subtotal</span>
                      <span className="font-semibold text-[var(--text)] text-sm">${subtotal.toFixed(2)}</span>
                    </div>
                    
                    {/* Delivery Fee */}
                    <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                      <span className="text-[var(--light-gray)] text-sm flex items-center">
                        <FiTruck className="mr-2" />
                        Delivery Fee
                      </span>
                      <span className="font-semibold text-[var(--text)] text-sm">
                        {deliveryFee === 0 ? (
                          <span className="text-yellow-600 dark:text-yellow-400 text-xs">
                            Click Calculate
                          </span>
                        ) : (
                          `$${deliveryFee.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    
                    {/* Total Before Discounts */}
                    <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                      <span className="text-[var(--light-gray)] text-sm">Total Before Discounts</span>
                      <span className="font-semibold text-[var(--text)] text-sm">${totalWithShipping.toFixed(2)}</span>
                    </div>
                    
                    {/* Coupon Discount */}
                    {appliedCoupon?.discount_amount > 0 && (
                      <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                        <span className="text-green-600 dark:text-green-400 flex items-center text-sm">
                          <FiPercent className="mr-2" />
                          Coupon Discount
                        </span>
                        <span className="font-semibold text-green-600 dark:text-green-400 text-sm">
                          -$
                          {Number(appliedCoupon.discount_amount || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {/* Points Discount */}
                    {usePointsChecked && pointsDiscount > 0 && (
                      <div className="flex justify-between items-center py-3 border-b border-[var(--border)]">
                        <span className="text-green-600 dark:text-green-400 flex items-center text-sm">
                          <FiStar className="mr-2" />
                          Points Discount ({discountPercent}%)
                        </span>
                        <span className="font-semibold text-green-600 dark:text-green-400 text-sm">
                          -${pointsDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {/* Final Total */}
                    <div className="flex justify-between items-center pt-4 border-t-2 border-[var(--border)]">
                      <span className="text-lg font-bold text-[var(--text)] tracking-tight">Final Total</span>
                      <span className={`text-xl font-bold bg-[var(--button)]/10 px-3 py-1.5 rounded-xl backdrop-blur-sm  ${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'}`} >
                        ${finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Loyalty Points */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center text-base text-[var(--text)] tracking-tight">
                        <FiStar className={`mr-3 ${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'}`} />
                        Loyalty Points
                      </h3>
                      <span className="text-xs text-[var(--light-gray)] bg-[var(--bg)] px-2 py-1 rounded-full backdrop-blur-sm">
                        {loyaltyPoints} points available
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center cursor-pointer group">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={usePointsChecked}
                              onChange={handleUsePointsToggle}
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
                          <span className="ml-2 font-medium text-[var(--text)] tracking-tight text-sm">
                            Use my points
                          </span>
                        </label>
                      </div>

                      {usePointsChecked && (
                        <div className="space-y-2 animate-fade-in">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[var(--light-gray)]">Points to use:</span>
                            <span className="text-[var(--text)] font-medium">
                              {userPointsToUse} points = {discountPercent}% discount
                            </span>
                          </div>
                          
                          <input
                            type="range"
                            min="0"
                            max={loyaltyPoints}
                            step="100"
                            value={userPointsToUse}
                            onChange={handlePointsInputChange}
                            className="w-full h-2 bg-[var(--border)] rounded-lg appearance-none cursor-pointer slider"
                          />
                          
                          <div className="flex justify-between text-xs text-[var(--light-gray)]">
                            <span>0</span>
                            <span>{loyaltyPoints}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={userPointsToUse}
                              onChange={handlePointsInputChange}
                              className={`flex-1 p-2 rounded-lg border-2 ${inputClass} text-xs focus:shadow-lg backdrop-blur-sm`}
                              min="0"
                              max={loyaltyPoints}
                              placeholder="Enter points"
                            />
                            <button
                              onClick={() => setUserPointsToUse(loyaltyPoints)}
                              className={`${secondaryButtonClass} px-3 py-2 rounded-lg text-xs border-2 backdrop-blur-sm`}
                            >
                              Max
                            </button>
                          </div>

                          {pointsDiscount > 0 && (
                            <div className="flex justify-between items-center text-xs bg-green-500/10 p-2 rounded-xl backdrop-blur-sm">
                              <span className="text-green-600 dark:text-green-400 font-semibold">
                                You save: ${pointsDiscount.toFixed(2)}
                              </span>
                              <span className="text-[var(--light-gray)] text-xs">
                                {discountPercent}% off
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {pointsError && (
                      <p className={`text-red-500 text-xs mt-2 p-2 ${errorClass} rounded-xl backdrop-blur-sm`}>
                        {pointsError}
                      </p>
                    )}

                    {loyaltyPoints > 0 && !usePointsChecked && (
                      <p className="text-xs text-[var(--light-gray)] mt-2 bg-[var(--bg)] p-2 rounded-xl backdrop-blur-sm">
                        💡 Every 100 points = 10% discount (max 50%)
                      </p>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 flex items-center text-base text-[var(--text)] tracking-tight">
                      <FiCreditCard className={`mr-3 ${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'}`}/>
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

{/* ✅ زر الـ Complete Order - هذا الجزء كان ناقص */}
<div className="mt-6">
  <button
    onClick={handleCheckoutClick}
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
    <FiShield className={`mr-3 ${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'}`} />
    Your payment information is secure and encrypted
  </p>
</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderDetailsPage;