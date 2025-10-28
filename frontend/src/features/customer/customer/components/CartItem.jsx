import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteItem, updateItemQuantity } from "../cartSlice";
import customerAPI from "../services/customerAPI";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const { currentCart } = useSelector((state) => state.cart);

  // إضافة vendor_id للعنصر إذا موجود
  const itemWithVendorId = {
    ...item,
    vendor_id: item.vendor_id || item.vendorId || null, // لو موجود في الداتا
  };

  const firstImage =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images[0]
      : null;

  const handleRemove = async () => {
  if (!currentCart?.id) {
    console.error("No currentCart.id, cannot delete item", item.id);
    return;
  }

  try {
    const productsResponse = await customerAPI.getProducts({ search: item.name });

    const products = Array.isArray(productsResponse)
      ? productsResponse
      : productsResponse.items || [];

    const product = products.find(p => p.name === item.name);

    if (!product?.id) {
      console.warn("Product ID not found for interaction");
    } else {
      const userId = currentCart.user_id || localStorage.getItem("token");
      await customerAPI.logInteraction(userId, product.id, "remove_from_cart");
      console.log("Interaction logged for product:", product.id);
    }

    dispatch(deleteItem({ cartId: currentCart.id, itemId: item.id }));

  } catch (err) {
    console.error("Error removing item or logging interaction", err);
  }
};



  const handleDecrease = () => {
    if (!currentCart?.id) return;
    if (item.quantity > 1) {
      dispatch(
        updateItemQuantity({
          cartId: currentCart.id,
          itemId: item.id,
          quantity: item.quantity - 1,
        })
      );
    } else {
      handleRemove();
    }
  };

  const handleIncrease = () => {
    if (!currentCart?.id) return;
    dispatch(
      updateItemQuantity({
        cartId: currentCart.id,
        itemId: item.id,
        quantity: item.quantity + 1,
      })
    );
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
            <button onClick={handleDecrease} className="bg-gray-300 px-2 rounded">
              -
            </button>
            <span>{item.quantity}</span>
            <button onClick={handleIncrease} className="bg-gray-300 px-2 rounded">
              +
            </button>
          </p>

          <p>Price: ${item.price}</p>
          <p className="text-sm text-gray-500">Vendor ID: {itemWithVendorId.vendor_id}</p>
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
