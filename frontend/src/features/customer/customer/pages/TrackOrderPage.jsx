import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import customerAPI from "../services/customerAPI";
import MapView from "../../../../components/MapView";

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routePoints, setRoutePoints] = useState([]);
  const themeMode = useSelector((s) => s.customerTheme.mode);

  // Calculate estimated arrival time
  const calculateEstimatedTime = (distance) => {
    if (!distance) return "Calculating...";
    
    const avgSpeed = 30; // km/h average delivery speed
    const minutes = Math.round((distance / avgSpeed) * 60);
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  // Dynamic tracking timeline based on order status
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
    const currentStatusIndex = statusFlow.findIndex(step => step.status === currentStatus);
    
    return statusFlow.map((step, index) => {
      const isCompleted = index < currentStatusIndex;
      const isCurrent = index === currentStatusIndex;
      
      return {
        ...step,
        completed: isCompleted,
        current: isCurrent
      };
    });
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await customerAPI.trackOrder(orderId);
        const orderData = data.data;
        setOrder(orderData);

        if (!orderData) return;

        if (orderData.routePoints && orderData.routePoints.length > 0) {
          setRoutePoints(orderData.routePoints);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--button)] border-t-transparent"></div>
          <p className="text-[var(--text)] text-sm">Loading order details...</p>
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

  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="w-full px-4">
        
        {/* Header */}
        <div className="p-6 text-left">
          <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
            Track Order #{order.id || order.order_id}
          </h1>
          <div className="w-20 h-1 bg-[var(--button)] rounded-full"></div>
        </div>

        {/* First Row - Timeline */}
        <div className={`rounded-2xl overflow-hidden mb-6 ${
          themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-[var(--bg)]'
        } shadow-sm`}>
          <div className="p-6">
            <div className="relative">
              {/* Colored connecting line */}
              <div className="absolute left-8 right-8 top-10 h-1 bg-[var(--light-gray)]">
                {/* Progress line - colored up to current step */}
                <div 
                  className="h-full bg-[var(--button)] transition-all duration-500"
                  style={{ 
                    width: currentStatusIndex >= 0 
                      ? `${(currentStatusIndex / (trackingSteps.length - 1)) * 100}%` 
                      : '0%' 
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between">
                {trackingSteps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center text-center relative">
                    {/* Step dot - Professional SVG icons */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 z-10 mb-3 flex items-center justify-center ${
                      step.completed 
                        ? 'bg-[var(--button)] border-[var(--button)] text-white' 
                        : step.current
                        ? 'bg-[var(--button)] border-[var(--button)] text-white animate-pulse'
                        : 'bg-transparent border-[var(--light-gray)] text-[var(--light-gray)]'
                    }`}>
                      {step.completed ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <>
                          {step.status === "pending" && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                          {step.status === "accepted" && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {step.status === "processing" && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                          {step.status === "out for delivery" && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                            </svg>
                          )}
                          {step.status === "delivered" && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          )}
                        </>
                      )}
                    </div>
                    
                    {/* Step content */}
                    <div className="max-w-28">
                      <div className={`text-sm font-semibold mb-1 ${
                        step.completed ? 'text-[var(--text)]' : 
                        step.current ? 'text-[var(--button)]' : 'text-[var(--light-gray)]'
                      }`}>
                        {step.label}
                      </div>
                      <div className={`text-xs ${
                        step.completed ? 'text-[var(--button)]' : 
                        step.current ? 'text-[var(--button)]' : 'text-[var(--light-gray)]'
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

        {/* Second Row - 6 Small Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          
          {/* Order Status Card */}
          <div className={`p-2 rounded-lg border-l-3 border-[var(--button)] ${
            themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-[var(--textbox)]'
          }`}>
            <h3 className="text-[var(--light-gray)] text-[10px] font-medium mb-1">ORDER STATUS</h3>
            <p className="text-[var(--text)] text-sm font-semibold capitalize">{order.status}</p>
          </div>

          {/* Payment Status Card */}
          <div className={`p-2 rounded-lg border-l-3 border-[var(--primary)] ${
            themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-[var(--textbox)]'
          }`}>
            <h3 className="text-[var(--light-gray)] text-[10px] font-medium mb-1">PAYMENT</h3>
            <p className="text-[var(--text)] text-sm font-semibold capitalize">{order.payment_status || "unpaid"}</p>
          </div>

          {/* Last Updated Card */}
          <div className={`p-2 rounded-lg border-l-3 border-[var(--success)] ${
            themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-[var(--textbox)]'
          }`}>
            <h3 className="text-[var(--light-gray)] text-[10px] font-medium mb-1">UPDATED</h3>
            <p className="text-[var(--text)] text-xs">{new Date(order.updated_at).toLocaleDateString()}</p>
            <p className="text-[var(--light-gray)] text-[10px]">{new Date(order.updated_at).toLocaleTimeString()}</p>
          </div>

          {/* Distance Card */}
          <div className={`p-2 rounded-lg border-l-3 border-[var(--warning)] ${
            themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-[var(--textbox)]'
          }`}>
            <h3 className="text-[var(--light-gray)] text-[10px] font-medium mb-1">DISTANCE</h3>
            <p className="text-[var(--text)] text-sm font-semibold">
              {order?.distance_km ? `${order.distance_km} Km` : "N/A"}
            </p>
          </div>

          {/* Estimated Time Card */}
          <div className={`p-2 rounded-lg border-l-3 border-[var(--info)] ${
            themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-[var(--textbox)]'
          }`}>
            <h3 className="text-[var(--light-gray)] text-[10px] font-medium mb-1">EST. ARRIVAL</h3>
            <p className="text-[var(--text)] text-sm font-semibold">
              {estimatedTime}
            </p>
          </div>

          {/* Order ID Card */}
          <div className={`p-2 rounded-lg border-l-3 border-[var(--purple)] ${
            themeMode === 'dark' ? 'bg-[var(--div)]' : 'bg-[var(--textbox)]'
          }`}>
            <h3 className="text-[var(--light-gray)] text-[10px] font-medium mb-1">ORDER ID</h3>
            <p className="text-[var(--text)] text-sm font-semibold">#{order.id || order.order_id}</p>
          </div>
        </div>

        {/* Third Row - Map */}
        <div className="rounded-2xl overflow-hidden mb-6">
          <div className="p-1">
            {routePoints.length >= 2 ? (
              <div className="h-96 rounded-lg overflow-hidden">
                <MapView routePoints={routePoints} />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center rounded-lg border border-[var(--border)]">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto text-[var(--light-gray)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-[var(--light-gray)] text-lg">Insufficient route points to display map</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-sm text-[var(--light-gray)]">
            For inquiries, please contact our customer service
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;