import React from "react";
import { useNavigate } from "react-router-dom";

const OrderItem = ({ order }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // التوجيه إلى صفحة المنتج
    navigate(`/customer/products/${order.id}`);
  };

  return (
    <div 
      className="p-4 border rounded shadow hover:shadow-lg transition cursor-pointer"
      onClick={handleClick}
    >
      <h3 className="text-lg font-bold">Order #{order.id}</h3>
      <p className="text-gray-600">Status: {order.status}</p>
      <p className="text-blue-600 font-semibold">Total: ${order.total}</p>
    </div>
  );
};

export default OrderItem;