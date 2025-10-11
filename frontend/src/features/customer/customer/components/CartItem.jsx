import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteItem, updateItemQuantity  } from "../cartSlice";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const { currentCart } = useSelector((state) => state.cart);
  const firstImage =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images[0]
      : null;

  const handleRemove = () => {
    if (!currentCart?.id) {
      console.error("No currentCart.id, cannot delete item", item.id);
      return;
    }
    dispatch(deleteItem({ cartId: currentCart.id, itemId: item.id }));
  };


  const handleDecrease = () => {
    if (!currentCart?.id) return;
    if (item.quantity > 1) {
      dispatch(updateItemQuantity({ 
        cartId: currentCart.id, 
        itemId: item.id, 
        quantity: item.quantity - 1 
      }));
    } else {
      handleRemove();
    }
  };

  const handleIncrease = () => {
    if (!currentCart?.id) return;
    dispatch(updateItemQuantity({ 
      cartId: currentCart.id, 
      itemId: item.id, 
      quantity: item.quantity + 1 
    }));
  };

  return (
    <div className="flex justify-between items-center p-2 border rounded">
      <div className="flex items-center space-x-4">
        <div className="w-24 h-24 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
          {firstImage ? (
            <img src={firstImage} alt={item.name} />
          ) : (
            <span className="text-gray-500 text-sm">No Image</span>
          )}
        </div>

        <div>
          <p className="font-bold">{item.name}</p>


          <p className="flex items-center space-x-2">
            <button 
              onClick={handleDecrease}
              className="bg-gray-300 px-2 rounded"
            >
              -
            </button>
            <span>{item.quantity}</span>
            <button 
              onClick={handleIncrease}
              className="bg-gray-300 px-2 rounded"
            >
              +
            </button>
          </p>

          
          <p>Price: ${item.price}</p>
        </div>
      </div>

      <button
        className="bg-red-500 text-white px-2 py-1 rounded"
        onClick={handleRemove}
      >
        Remove
      </button>
    </div>
  );
};

export default CartItem;
