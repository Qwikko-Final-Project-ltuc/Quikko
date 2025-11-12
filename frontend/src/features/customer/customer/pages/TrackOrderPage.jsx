import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchOrderById } from "../ordersSlice"; 
import customerAPI from "../services/customerAPI";
import MapView from "../../../../components/MapView";
import { Package, Clock, MapPin, Truck, CheckCircle, CreditCard, Calendar, Sparkles, Zap, FileText, ShoppingCart, User, Navigation } from "lucide-react";

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routePoints, setRoutePoints] = useState([]);
  const themeMode = useSelector((s) => s.customerTheme.mode);
  
  const { currentOrder, loading: orderLoading } = useSelector((state) => state.orders);

  const calculateEstimatedTime = (distance) => {
    if (!distance) return null;
    const avgSpeed = 30;
    const minutes = Math.round((distance / avgSpeed) * 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };


const getTrackingSteps = (order) => {
  if (!order) return [];

  // ترتيب السيبس الثابت والمطلوب
  const statusFlow = [
    { status: "requested", label: "Order Requested", icon: FileText },
    { status: "accepted", label: "Order Accepted", icon: CheckCircle },
    { status: "processing", label: "Preparing Order", icon: ShoppingCart },
    { status: "out for delivery", label: "On the Way", icon: Truck },
    { status: "delivered", label: "Delivered", icon: Package }
  ];

  let currentStatus = order?.status?.toLowerCase();
  
  // إذا كان ال status needs_decision نعتبره requested
  if (currentStatus === "needs_decision") {
    currentStatus = "requested";
  }

  // نبحث عن index الحالة الحالية
  const currentIndex = statusFlow.findIndex(step => step.status === currentStatus);

  return statusFlow.map((step, index) => {
    // الخطوات اللي قبل الحالية بتكون مكتملة
    const completed = index < currentIndex;
    
    // الخطوة الحالية بتكون current
    const current = index === currentIndex;
    
    // الخطوات اللي بعد الحالية بتكون قادمة
    const upcoming = index > currentIndex;
    
    // الانيميشن يظهر فقط على الخطوة الحالية
    const hasAnimation = current;

    return {
      ...step,
      completed,
      current,
      upcoming,
      hasAnimation
    };
  });
};

useEffect(() => {
  const fetchOrderData = async () => {
    try {
      // استخدم getOrderById بدل trackOrder عشان تجيب total_amount
      const orderData = await customerAPI.getOrderById(orderId);
      
      console.log('📦 Full order data from getOrderById:', orderData);
      
      await dispatch(fetchOrderById(orderId));
      
      setOrder(orderData.data || orderData); // حسب شكل ال response

      // إذا بدك الـ routePoints من trackOrder، اجيبها منفصلة
      try {
        const trackData = await customerAPI.trackOrder(orderId);
        if (trackData.data?.routePoints && trackData.data.routePoints.length > 0) {
          setRoutePoints(trackData.data.routePoints);
        }
      } catch (trackErr) {
        console.log('No route points available yet');
      }

    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };
  fetchOrderData();
}, [orderId, dispatch]);

  useEffect(() => {
    if (currentOrder && !loading) {
      console.log('💰 Order details from Redux:', currentOrder);
    }
  }, [currentOrder, loading]);

  if (loading || orderLoading) {
  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'} relative overflow-hidden`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--button)]/2 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-[var(--primary)]/2 rounded-full blur-xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl flex items-center justify-center mx-auto mb-4 animate-spin">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl blur-sm opacity-15 animate-ping"></div>
          </div>
          <p className="text-[var(--text)] text-lg font-medium">
            Loading Your Order...
          </p>
        </div>
      </div>
    </div>
  );

  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-[var(--error)]/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-[var(--button)]/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="text-center max-w-md relative z-10">
          <div className="w-20 h-20 bg-[var(--error)]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl transform hover:scale-110 transition-all duration-300">
            <Zap className="w-10 h-10 text-[var(--error)]" />
          </div>
          <h3 className="text-2xl font-black mb-3 bg-gradient-to-r from-[var(--error)] to-red-600 bg-clip-text text-transparent">
            Order Not Found
          </h3>
          <p className="text-[var(--text)]/80 text-base mb-6 leading-relaxed">We couldn't find this order in our system.</p>
        </div>
      </div>
    );
  }

  const trackingSteps = getTrackingSteps(order);
  const currentStatusIndex = trackingSteps.findIndex(step => step.current);
  const estimatedTime = calculateEstimatedTime(order?.distance_km);

  // Calculate progress percentage for the line
  const completedSteps = trackingSteps.filter(step => step.completed).length;
  const totalSteps = trackingSteps.length;
  const progressPercentage = currentStatusIndex >= 0 
    ? `${((completedSteps + (trackingSteps[currentStatusIndex]?.current ? 0.5 : 0)) / totalSteps) * 100}%` 
    : '0%';

  const isOrderNotAccepted = order.status === 'requested' || order.status === 'pending';

  const displayTotal = order?.total_amount || order?.total_with_shipping || order?.final_amount || 0;
  const displayPaymentStatus = currentOrder.data?.payment_status || order.payment_status ;

  return (
    <div className="min-h-screen bg-[var(--bg)] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--button)]/5 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[var(--primary)]/5 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--success)]/3 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        
        {/* Enhanced Header */}
        <div className="text-center mb-8 relative">
          {/* Animated Floating Circles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-6 h-6 bg-[var(--button)]/20 rounded-full "></div>
            <div className="absolute top-20 right-20 w-4 h-4 bg-[var(--primary)]/20 rounded-full " style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-20 left-20 w-5 h-5 bg-[var(--success)]/20 rounded-full " style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-10 right-10 w-3 h-3 bg-[var(--warning)]/20 rounded-full " style={{animationDelay: '1.5s'}}></div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight bg-gradient-to-r from-[var(--text)] via-[var(--button)] to-[var(--primary)] bg-clip-text text-transparent animate-gradient-x-slow">
            Track Order #{order.id || order.order_id}
          </h1>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-full mx-auto mb-4"></div>
          <p className="text-base text-[var(--light-gray)] max-w-xl mx-auto">
            Real-time tracking for your delivery journey
          </p>
        </div>

        {/* Enhanced Timeline - Responsive with Vertical Layout on Mobile */}
        <div className={`rounded-2xl p-4 sm:p-6 mb-6 shadow-xl border ${
          themeMode === "dark" 
            ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--border)]" 
            : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
        } relative overflow-hidden group backdrop-blur-sm`}>
          
          <div className="relative">
            {/* Horizontal line for tablet and desktop */}
            <div className="hidden sm:block absolute left-4 md:left-6 right-4 md:right-6 top-8 h-0.5 bg-gray-200/50">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-700 ease-out shadow-lg"
                style={{ width: progressPercentage }}
              ></div>
            </div>

            {/* Vertical line for mobile */}
            <div className="sm:hidden absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200/50">
              <div 
                className="w-full bg-gradient-to-b from-green-400 to-emerald-600 transition-all duration-700 ease-out shadow-lg"
                style={{ height: progressPercentage }}
              ></div>
            </div>
            
            {/* Timeline steps - Vertical on mobile, Horizontal on tablet+ */}
            <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-between">
              {trackingSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={index} className="flex items-start sm:flex-col sm:items-center sm:text-center relative">
                    {/* Step dot */}
                    <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3 z-10 flex items-center justify-center transition-all duration-500  transform hover:scale-110 ${
                      step.completed 
                        ? 'bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-500 text-white scale-110 ' 
                        : step.hasAnimation // Use hasAnimation instead of step.current
                        ? 'bg-gradient-to-br from-orange-600 to-amber-600 border-orange-500 text-white scale-110  animate-pulse-glow'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        step.completed || step.hasAnimation ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                    
                    {/* Step content */}
                    <div className="ml-4 sm:ml-0 sm:mt-3 flex-1 sm:flex-none min-w-0">
                      <div className={`text-base sm:text-lg font-bold mb-2 transition-colors duration-300 min-h-[3rem] flex items-center ${
                        step.completed ? 'text-emerald-600' : 
                        step.hasAnimation ? 'text-orange-500 animate-text-pulse' : // Use hasAnimation here with orange color
                        'text-gray-400'
                      }`}>
                        {step.label}
                      </div>
                      <div className={`text-sm font-medium px-3 py-2 rounded-xl transition-all duration-300 ${
                        step.completed ? 'bg-emerald-100 text-emerald-700' : 
                        step.hasAnimation ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-300 ' : // Use hasAnimation here with orange colors
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {step.completed ? "Completed" : step.hasAnimation ? "In Progress" : "Pending"} {/* Use hasAnimation here */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Cards Grid - 2 per row on mobile, 3 per row on iPad, 6 per row on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6">
          
          {/* Order Status Card */}
          <div className={`p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl ${
            themeMode === "dark" 
              ? "bg-gradient-to-br from-[var(--button)] to-gray-900" 
              : "bg-gradient-to-br from-[var(--button)] to-gray-900"
          } shadow-lg border border-[var(--border)] group backdrop-blur-sm relative overflow-hidden`}>
            {/* Dark Overlay for Dark Mode Only */}
            {themeMode === "dark" && (
              <div className="absolute inset-0 bg-black/10 rounded-xl pointer-events-none z-10"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="flex flex-col items-center text-center relative z-20">
              <div className="p-3 rounded-xl bg-white/10 group-hover:scale-110 transition-transform duration-300 mb-2">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">ORDER STATUS</h3>
              <p className="text-white text-lg font-bold capitalize leading-tight">
                {order.status} {/* هنا جيب الستاتس مباشرة من order */}
              </p>
            </div>
          </div>

          {/* Payment Status Card */}
          <div className={`p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl ${
            themeMode === "dark" 
              ? "bg-gradient-to-br from-[var(--button)] to-gray-900" 
              : "bg-gradient-to-br from-[var(--button)] to-gray-900"
          } shadow-lg border border-[var(--border)] group backdrop-blur-sm relative overflow-hidden`}>
            {/* Dark Overlay for Dark Mode Only */}
            {themeMode === "dark" && (
              <div className="absolute inset-0 bg-black/10 rounded-xl pointer-events-none z-10"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="flex flex-col items-center text-center relative z-20">
              <div className="p-3 rounded-xl bg-white/10 group-hover:scale-110 transition-transform duration-300 mb-2">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">PAYMENT STATUS</h3>
              <p className="text-white text-lg font-bold capitalize leading-tight">
                {displayPaymentStatus}
              </p>
              <p className="text-white/70 text-base mt-2 font-semibold">
                Total: ${parseFloat(order?.total_amount || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Last Updated Card */}
          <div className={`p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl ${
            themeMode === "dark" 
              ? "bg-gradient-to-br from-[var(--button)] to-gray-900 "
              : "bg-gradient-to-br from-[var(--button)] to-gray-900"
          } shadow-lg border border-[var(--border)] group backdrop-blur-sm relative overflow-hidden`}>
            {/* Dark Overlay for Dark Mode Only */}
            {themeMode === "dark" && (
              <div className="absolute inset-0 bg-black/10 rounded-xl pointer-events-none z-10"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="flex flex-col items-center text-center relative z-20">
              <div className="p-3 rounded-xl bg-white/10 group-hover:scale-110 transition-transform duration-300 mb-2">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">LAST UPDATED</h3>
              <p className="text-white text-base font-bold">{new Date(order.updated_at).toLocaleDateString()}</p>
              <p className="text-white/70 text-sm mt-1">{new Date(order.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </div>

          {/* Distance Card */}
          <div className={`p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl ${
            themeMode === "dark" 
              ? "bg-gradient-to-br from-[var(--button)] to-gray-900" 
              : "bg-gradient-to-br from-[var(--button)] to-gray-900"
          } shadow-lg border border-[var(--border)] group backdrop-blur-sm relative overflow-hidden`}>
            {/* Dark Overlay for Dark Mode Only */}
            {themeMode === "dark" && (
              <div className="absolute inset-0 bg-black/10 rounded-xl pointer-events-none z-10"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="flex flex-col items-center text-center relative z-20">
              <div className="p-3 rounded-xl bg-white/10 group-hover:scale-110 transition-transform duration-300 mb-2">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">DISTANCE</h3>
              <p className="text-white text-lg font-bold">
                {isOrderNotAccepted ? "N/A" : (order?.distance_km ? `${order.distance_km} Km` : "Calculating")}
              </p>
            </div>
          </div>

          {/* Estimated Time Card */}
          <div className={`p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl ${
            themeMode === "dark" 
              ? "bg-gradient-to-br from-[var(--button)] to-gray-900" 
              : "bg-gradient-to-br from-[var(--button)] to-gray-900"
          } shadow-lg border border-[var(--border)] group backdrop-blur-sm relative overflow-hidden`}>
            {/* Dark Overlay for Dark Mode Only */}
            {themeMode === "dark" && (
              <div className="absolute inset-0 bg-black/10 rounded-xl pointer-events-none z-10"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="flex flex-col items-center text-center relative z-20">
              <div className="p-3 rounded-xl bg-white/10 group-hover:scale-110 transition-transform duration-300 mb-2">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">EST. ARRIVAL</h3>
              <p className="text-white text-lg font-bold">
                {isOrderNotAccepted ? "N/A" : (estimatedTime ? estimatedTime : "Calculating")}
              </p>
            </div>
          </div>

          {/* Order ID Card */}
          <div className={`p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl ${
            themeMode === "dark" 
              ? "bg-gradient-to-tr from-[var(--button)]  to-gray-900" 
              : "bg-gradient-to-br from-[var(--button)]   to-gray-900"
          } shadow-lg border border-[var(--border)] group backdrop-blur-sm relative overflow-hidden`}>
            {/* Dark Overlay for Dark Mode Only */}
            {themeMode === "dark" && (
              <div className="absolute inset-0 bg-black/10 rounded-xl pointer-events-none z-10"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="flex flex-col items-center text-center relative z-20">
              <div className="p-3 rounded-xl bg-white/10 group-hover:scale-110 transition-transform duration-300 mb-2">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">ORDER ID</h3>
              <p className="text-white text-lg font-bold">#{order.id || order.order_id}</p>
            </div>
          </div>
        </div>

        {/* Enhanced Map Section */}
        <div className={`rounded-2xl p-4 sm:p-6 mb-6 shadow-xl border ${
          themeMode === "dark" 
            ? "bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] border-[var(--border)]" 
            : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
        } relative overflow-hidden backdrop-blur-sm`}>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-[var(--button)] to-[var(--primary)] shadow-lg">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text)]">Delivery Route</h3>
              <p className="text-[var(--light-gray)] text-sm">Real-time tracking visualization</p>
            </div>
          </div>
          
          {routePoints.length >= 2 ? (
            <div className="h-64 md:h-80 rounded-xl overflow-hidden border-2 border-gray-200/50 shadow-xl">
              <MapView routePoints={routePoints} />
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300/50 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
              <div className="text-center p-4 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 text-base font-semibold mb-1">Route information loading</p>
                <p className="text-gray-500 text-sm">Tracking map will appear once delivery starts</p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Footer Note */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--button)]/10 to-[var(--primary)]/10 border-2 border-[var(--button)]/30 shadow-lg transform hover:scale-105 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--button)]/5 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <Sparkles className="w-5 h-5 text-[var(--button)] relative z-10" />
            <p className={`${themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'} text-base font-semibold relative z-10`}>
              For inquiries, please contact our customer service
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x-slow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float-slow {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
            opacity: 0.7;
          }
          33% { 
            transform: translateY(-20px) translateX(10px) rotate(120deg); 
            opacity: 1;
          }
          66% { 
            transform: translateY(10px) translateX(-15px) rotate(240deg); 
            opacity: 0.8;
          }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px 0px rgba(249, 116, 22, 0),
                       inset 0 0 20px rgba(255, 255, 255, 0.1);
          }
          50% { 
            box-shadow: 0 0 30px 10px rgba(249, 116, 22, 0),
                       inset 0 0 30px rgba(255, 255, 255, 0.2);
            transform: scale(1.15);
          }
        }
        @keyframes text-pulse {
          0%, 100% { 
            opacity: 1;
            text-shadow: 0 0 10px rgba(249, 116, 22, 0);
          }
          50% { 
            opacity: 0.9;
            text-shadow: 0 0 20px rgba(249, 116, 22, 0);
          }
        }
        @keyframes badge-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 4px 15px rgba(249, 116, 22, 0);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 6px 25px rgba(249, 116, 22, 0);
          }
        }
        .animate-gradient-x-slow { 
          background-size: 200% 200%; 
          animation: gradient-x-slow 8s ease infinite; 
        }
        .animate-float-slow { 
          animation: float-slow 12s ease-in-out infinite; 
        }
        .animate-pulse-slow { 
          animation: pulse-slow 4s ease-in-out infinite; 
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-text-pulse {
          animation: text-pulse 2s ease-in-out infinite;
        }
        .animate-badge-pulse {
          animation: badge-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default TrackOrderPage;