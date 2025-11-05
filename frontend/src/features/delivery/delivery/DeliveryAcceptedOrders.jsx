// DeliveryAcceptedOrders.jsx
import React, { useState, useEffect } from 'react';
import { getAcceptedOrders, updateOrderStatus } from './services/deliveryService';

const DeliveryAcceptedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getAcceptedOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading accepted orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrders(); // إعادة تحميل البيانات
      alert('Order status updated successfully!');
    } catch (error) {
      alert('Error updating status: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'accepted': 'processing',
      'processing': 'out_for_delivery',
      'out_for_delivery': 'delivered'
    };
    return statusFlow[currentStatus];
  };

  if (loading) return <div>Loading accepted orders...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Accepted Orders</h1>
      
      {orders.length === 0 ? (
        <p className="text-gray-500">No accepted orders</p>
      ) : (
        <div className="grid gap-4">
          {orders.map(order => (
            <div key={order.id} className="border rounded-lg p-4 shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(order.order_status)}`}>
                      {order.order_status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600">Customer: {order.customer_name}</p>
                  <p className="text-gray-600">Phone: {order.customer_phone}</p>
                  <p className="text-gray-600">Address: {order.address_line1}, {order.city}</p>
                  <p className="text-gray-600">Items: {order.items_count} products</p>
                  <p className="text-gray-600">Total: ${order.final_amount}</p>
                </div>
                
                {order.order_status !== 'delivered' && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, getNextStatus(order.order_status))}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Mark as {getNextStatus(order.order_status).replace(/_/g, ' ')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryAcceptedOrders;