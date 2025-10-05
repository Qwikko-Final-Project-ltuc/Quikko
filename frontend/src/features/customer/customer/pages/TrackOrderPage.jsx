import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import customerAPI from "../services/customerAPI";

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await customerAPI.trackOrder(orderId);
        setOrder(data.data); // لأن الـ API ترجع { message, data }
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
      <h1 className="text-3xl font-bold mb-6">Tracking Order #{order.order_id}</h1>
      <p>Status: {order.status}</p>
      <p>Last Updated: {new Date(order.updated_at).toLocaleString()}</p>
      {/* إذا لاحقًا تريد تعرض مراحل التوصيل يمكنك إضافتها هنا */}
    </div>
  );
};

export default TrackOrderPage;
