// DeliveryRequestedOrders.jsx
import React, { useState, useEffect } from 'react';
import { getRequestedOrders, acceptOrder } from './services/deliveryService';

const DeliveryRequestedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🎯 Component mounted - starting to load orders');
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      console.log('🔄 Starting to load orders...');
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      
      const data = await getRequestedOrders();
      console.log('✅ Orders loaded successfully:', data);
      console.log('📦 Number of orders:', data.length);
      console.log('📋 Orders data:', data);
      
      setOrders(data);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      console.error('Error details:', error.message);
    } finally {
      setLoading(false);
      console.log('🏁 Loading finished');
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      console.log('✅ Accepting order:', orderId);
      await acceptOrder(orderId);
      setOrders(orders.filter(order => order.id !== orderId));
      alert('Order accepted successfully!');
    } catch (error) {
      console.error('❌ Error accepting order:', error);
      alert('Error accepting order: ' + error.message);
    }
  };

  console.log('🎨 Rendering - loading:', loading, 'orders count:', orders.length);

  if (loading) return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading requested orders...</div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Requested Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No requested orders available</p>
          <button 
            onClick={loadOrders}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map(order => (
            <div key={order.id} className="border rounded-lg p-4 shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                  <p className="text-gray-600">Customer: {order.customer_name}</p>
                  <p className="text-gray-600">Phone: {order.customer_phone}</p>
                  <p className="text-gray-600">Address: {order.address_line1}, {order.city}</p>
                  <p className="text-gray-600">Items: {order.items_count} products ({order.total_quantity} units)</p>
                  <p className="text-gray-600">Delivery Fee: ${order.delivery_fee}</p>
                  <p className="text-gray-600">Total: ${order.final_amount}</p>
                </div>
                <button
                  onClick={() => handleAcceptOrder(order.id)}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Accept Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryRequestedOrders;