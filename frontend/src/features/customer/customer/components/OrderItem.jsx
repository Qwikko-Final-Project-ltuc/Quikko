// src/features/customer/customer/components/OrderItem.jsx
import React from "react";

const OrderItem = ({ order }) => {
  return (
    <div className="p-4 border rounded shadow hover:shadow-lg transition">
      <h3 className="text-lg font-bold">Order #{order.id}</h3>
      <p className="text-gray-600">Status: {order.status}</p>
      <p className="text-blue-600 font-semibold">Total: ${order.total}</p>
    </div>
  );
};

export default OrderItem;
