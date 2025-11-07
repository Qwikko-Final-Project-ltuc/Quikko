import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchOrderById } from "../ordersSlice"; 
import customerAPI from "../services/customerAPI";
import MapView from "../../../../components/MapView";

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

  // Adjusted tracking steps logic
  const getTrackingSteps = (order) => {
    if (!order) return [];

    const statusFlow = [
      { status: "pending", label: "Order Received" },
      { status: "accepted", label: "Order Accepted" },
      { status: "processing", label: "Preparing" },
      { status: "out for delivery", label: "On the Way" },
      { status: "delivered", label: "Delivered" }
    ];

    const currentStatus = order?.status?.toLowerCase();
    const currentIndex = statusFlow.findIndex(step => step.status === currentStatus);

    return statusFlow.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex + 1
    }));
  };

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const trackData = await customerAPI.trackOrder(orderId);
        const orderData = trackData.data;
        
        console.log('📦 Full order data from trackOrder:', orderData);
        
        await dispatch(fetchOrderById(orderId));
        
        setOrder(orderData);

        if (!orderData) return;

        if (orderData.routePoints && orderData.routePoints.length > 0) {
          setRoutePoints(orderData.routePoints);
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
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text)]">Order not found</p>
        </div>
      </div>
    );
  }

  const trackingSteps = getTrackingSteps(order);
  const currentStatusIndex = trackingSteps.findIndex(step => step.current);
  const estimatedTime = calculateEstimatedTime(order?.distance_km);

  // Calculate progress percentage for the line - FIXED
  const completedSteps = trackingSteps.filter(step => step.completed).length;
  const totalSteps = trackingSteps.length;
  const progressPercentage = currentStatusIndex >= 0 
    ? `${((completedSteps + (trackingSteps[currentStatusIndex]?.current ? 0.5 : 0)) / totalSteps) * 100}%` 
    : '0%';

  const isOrderNotAccepted = order.status === 'requested' || order.status === 'pending';

  const displayTotal = currentOrder.data?.total_with_shipping || currentOrder?.total_amount || 0;
  const displayPaymentStatus = currentOrder.data?.payment_status || order.payment_status || "unpaid";

  return (
    <div className="min-h-screen bg-[var(--bg)] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="p-4 md:p-6 text-left mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)] mb-3">
            Track Order #{order.id || order.order_id}
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-full"></div>
        </div>

        {/* First Row - Timeline */}
        <div className={`rounded-2xl overflow-hidden mb-6 ${
          themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-white'
        } shadow-lg border border-[var(--border)] backdrop-blur-sm`}>
          <div className="p-6 md:p-8">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-4 md:left-8 right-4 md:right-8 top-4 h-0.5 bg-gray-200/50">
                {/* Progress line - FIXED */}
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-700 ease-out shadow-lg"
                  style={{ width: progressPercentage }}
                ></div>
              </div>
              
              <div className="flex justify-between">
                {trackingSteps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center text-center relative">
                    {/* Step dot with meaningful colors */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 z-10 mb-4 flex items-center justify-center transition-all duration-300 shadow-lg ${
                      step.completed 
                        ? 'bg-emerald-500 border-emerald-500 text-white scale-110' 
                        : step.current
                        ? 'bg-amber-500 border-amber-500 text-white scale-110 animate-pulse'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {step.completed ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <>
                          {step.status === "pending" && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                          {step.status === "accepted" && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {step.status === "processing" && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                          {step.status === "out for delivery" && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                          )}
                          {step.status === "delivered" && (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          )}
                        </>
                      )}
                    </div>
                    
                    {/* Step content */}
                    <div className="max-w-28 md:max-w-32">
                      <div className={`text-sm font-semibold mb-2 transition-colors duration-300 ${
                        step.completed ? 'text-emerald-600' : 
                        step.current ? 'text-amber-600' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </div>
                      <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                        step.completed ? 'bg-emerald-100 text-emerald-700' : 
                        step.current ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {step.completed ? "Completed" : step.current ? "In Progress" : "Pending"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Second Row - Enhanced Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          
          {/* Order Status Card */}
          <div className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-[var(--button)] to-gray-900 shadow-lg border border-[var(--border)] group`}>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-white/10 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">ORDER STATUS</h3>
                <p className="text-white text-xl font-bold capitalize">{order.status}</p>
              </div>
            </div>
          </div>

          {/* Payment Status Card */}
          <div className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-[var(--button)] to-gray-900 shadow-lg border border-[var(--border)] group`}>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-white/10 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h3 className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">PAYMENT STATUS</h3>
                <p className="text-white text-xl font-bold capitalize">{displayPaymentStatus}</p>
                <p className="text-white/70 text-sm mt-1">
                  Total: ${parseFloat(displayTotal).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Last Updated Card */}
          <div className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-[var(--button)] to-gray-900 shadow-lg border border-[var(--border)] group`}>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-white/10 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">LAST UPDATED</h3>
                <p className="text-white text-lg font-bold">{new Date(order.updated_at).toLocaleDateString()}</p>
                <p className="text-white/70 text-sm">{new Date(order.updated_at).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          {/* Distance Card */}
          <div className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-[var(--button)] to-gray-900 shadow-lg border border-[var(--border)] group`}>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-white/10 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">DISTANCE</h3>
                <p className="text-white text-xl font-bold">
                  {isOrderNotAccepted ? "(Not available yet)" : (order?.distance_km ? `${order.distance_km} Km` : "(Calculating...)")}
                </p>
              </div>
            </div>
          </div>

          {/* Estimated Time Card */}
          <div className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-[var(--button)] to-gray-900 shadow-lg border border-[var(--border)] group`}>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-white/10 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">EST. ARRIVAL</h3>
                <p className="text-white text-xl font-bold">
                  {isOrderNotAccepted ? "(Not available yet)" : (estimatedTime ? estimatedTime : "(Calculating...)")}
                </p>
              </div>
            </div>
          </div>

          {/* Order ID Card */}
          <div className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-[var(--button)] to-gray-900 shadow-lg border border-[var(--border)] group`}>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-white/10 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <div>
                <h3 className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">ORDER ID</h3>
                <p className="text-white text-xl font-bold">#{order.id || order.order_id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Third Row - Map */}
        <div className={`rounded-2xl overflow-hidden mb-6 ${
          themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-white'
        } shadow-lg border border-[var(--border)] backdrop-blur-sm`}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[var(--text)]">Delivery Route</h3>
            </div>
            
            {routePoints.length >= 2 ? (
              <div className="h-80 md:h-96 rounded-xl overflow-hidden border border-gray-200/50 shadow-lg">
                <MapView routePoints={routePoints} />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300/50 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center p-6">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-gray-500 text-lg font-medium mb-2">Route information loading</p>
                  <p className="text-gray-400 text-sm">Tracking map will appear once delivery starts</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-600 font-medium">
              For inquiries, please contact our customer service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;