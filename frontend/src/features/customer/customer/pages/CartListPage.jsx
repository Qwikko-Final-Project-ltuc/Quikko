import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCarts, createNewCart, deleteCart,fetchCurrentUser } from "../cartSlice";
import { useNavigate } from "react-router-dom";

const CartListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { allCarts, status, error, user } = useSelector((state) => state.cart);

  useEffect(() => {
  const loadData = async () => {
    try {
      await dispatch(fetchCurrentUser());
      await dispatch(fetchAllCarts()).unwrap();
    } catch (err) {
      console.error(" Failed to load data:", err);
      await dispatch(fetchAllCarts());
    }
  };
  loadData();
}, [dispatch]);


  const handleAddCart = async () => {
    if (!user) return console.warn(" No user found");

    try {
      await dispatch(createNewCart()).unwrap();
      // console.log(" Cart created:", newCart);
    } catch (err) {
      console.error("Failed to create cart:", err);
    }
  };

  const handleDeleteCart = async (cartId) => {
    if (!window.confirm("Are you sure you want to delete this cart?")) return;
    await dispatch(deleteCart(cartId));
  };

  if (status === "loading") return <p>Loading carts...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Carts</h1>
        {user || localStorage.getItem("token") ? (
        <button
          onClick={handleAddCart}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 shadow"
        >
          + Add New Cart
        </button>
  ) : null}
      </div>

      {allCarts.length === 0 ? (
        <p className="text-gray-500">No carts found</p>
      ) : (
        <div className="space-y-4">
          {allCarts.map((cart) => {
            const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = cart.items.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);
            const lastItem = cart.items[cart.items.length - 1];

            return (
              <div
                key={cart.id}
                className="p-4 border rounded shadow hover:shadow-lg flex justify-between items-center cursor-pointer transition-all duration-200"
              >
                <div onClick={() => navigate(`/customer/cart/${cart.id}`)}>
                  {lastItem && <p className="font-semibold">Last product: {lastItem.name} x {lastItem.quantity}</p>}
                  <p>Number of products: {totalItems}</p>
                  <p className="font-bold">Total: ${totalPrice.toFixed(2)}</p>
                </div>

                <button
                  onClick={() => handleDeleteCart(cart.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 shadow"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CartListPage;
