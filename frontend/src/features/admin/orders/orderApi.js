export async function Orders() {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:3000/api/admin/orders", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "orders data failed. Please try again.");
  }

  return data;
}