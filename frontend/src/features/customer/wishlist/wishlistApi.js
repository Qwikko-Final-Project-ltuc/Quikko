export async function GetWishlist( ) {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:3000/api/customers/wishlist", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "wishlist data failed. Please try again.");
  }

  return data;
}

export async function AddWishlist(productId) {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:3000/api/customers/wishlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({ productId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add wishlist");
  }

  return data;
}

export async function RemoveWishlist(wishlistId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:3000/api/customers/wishlist/${wishlistId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to remove product from wishlist");
  }

  return await response.json();
}
