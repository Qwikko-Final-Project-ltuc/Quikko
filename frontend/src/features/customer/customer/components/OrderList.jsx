import React from "react";
import OrderItem from "./OrderItem";

const OrderList = ({ orders }) => {
  if (!orders || orders.length === 0) return <p className="text-gray-500">No orders found</p>;

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderItem key={order.id} order={order} />
      ))}
    </div>
  );
};

export default OrderList;
