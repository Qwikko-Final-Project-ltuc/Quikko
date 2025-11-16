export async function DeliveryCompanies() {
  const token = localStorage.getItem("token");

  const response = await fetch("https://qwikko.onrender.com/api/admin/delivery-companies", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "delivery companies data failed. Please try again.");
  }

  return data;
}

export async function ApproveDeliveryCompanies(deliveryId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`https://qwikko.onrender.com/api/admin/deliveries/${deliveryId}/approve`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to approve delivery companies");
  }

  return data;
}

export async function RejectDeliveryCompanies(deliveryId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`https://qwikko.onrender.com/api/admin/deliveries/${deliveryId}/reject`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to reject delivery companies");
  }

  return data;
}