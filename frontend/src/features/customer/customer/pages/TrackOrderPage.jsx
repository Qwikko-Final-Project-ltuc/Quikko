import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import customerAPI from "../services/customerAPI";
import MapView from "../../../../components/MapView";

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routePoints, setRoutePoints] = useState([]);

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

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">
        Tracking Order #{order.order_id}
      </h1>
      <p>Status: {order.status}</p>
      <p>Last Updated: {new Date(order.updated_at).toLocaleString()}</p>
      <p>Distance: {order?.distance_km ? `${order.distance_km} Km` : "Km"}</p>

      {routePoints.length >= 2 ? (
        <div className="mt-3">
          <h4 className="text-gray-700 font-medium mb-1">Delivery Route:</h4>
          <MapView routePoints={routePoints} />
        </div>
      ) : (
        <p>Insufficient route points to display map.</p>
      )}
    </div>
  );
};

export default TrackOrderPage;
