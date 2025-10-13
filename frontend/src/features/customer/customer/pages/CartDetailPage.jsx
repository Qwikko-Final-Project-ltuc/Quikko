import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart,setTempCartId } from "../cartSlice";
import CartItem from "../components/CartItem";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const CartDetailPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { id: cartId } = useParams();
  const { currentCart } = useSelector((state) => state.cart);
  const [groupedItems, setGroupedItems] = useState({});
  const token = localStorage.getItem("token");


  // Fetch cart from server
  useEffect(() => {
    if (cartId) {
      dispatch(fetchCart(cartId));
    }
  }, [cartId, dispatch]);

  // Group items by vendor whenever currentCart changes
  useEffect(() => {
      // console.log("currentCart updated:", currentCart);

    if (currentCart?.items?.length) {
      const grouped = currentCart.items.reduce((acc, item) => {
        const vendor = item.vendor_name || "Unknown Vendor";
        if (!acc[vendor]) acc[vendor] = [];
        acc[vendor].push(item);
        return acc;
      }, {});
      setGroupedItems(grouped);
    } else {
      setGroupedItems({});
    }
  }, [currentCart]);


  const handleAddProduct = () => {
    dispatch(setTempCartId(currentCart.id));

    navigate("/customer/products", { state: { cartId: currentCart.id } });
  };


  const total = currentCart?.items?.reduce(
  (sum, item) => sum + Number(item.price) * item.quantity,
  0
) || 0;

    const handleCheckout = async () => {
    try {
        if (!token) {
          alert("Please log in to proceed to checkout.");
          return navigate("/customer/login");
        }
        if (!currentCart?.id) return alert("Cart not loaded yet");
        navigate(`/customer/order-details/${currentCart.id}`, { state: { cartId: currentCart.id } });

    } catch (err) {
        console.error("Checkout failed", err);
    }
    };

//     console.log("currentCart:", currentCart);
// console.log("items:", currentCart?.items);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      <button
        onClick={handleAddProduct}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Product
      </button>

      {Object.keys(groupedItems).length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        Object.entries(groupedItems).map(([vendor, items]) => (
          <div key={vendor} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{vendor}</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))
      )}
      <p className="text-right text-xl font-bold mt-4">
        Total: ${total.toFixed(2)}
      </p>

      {currentCart?.items?.length > 0 && (
        
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 relative z-10"
          onClick={handleCheckout}
        >
          Proceed to Checkout
        </button>
      )} 
          </div>
  );
};

export default CartDetailPage;
