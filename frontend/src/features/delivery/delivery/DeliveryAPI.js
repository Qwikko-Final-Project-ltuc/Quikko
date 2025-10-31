//delivery profile
//all endpoints in profile:
export const fetchDeliveryProfile = async (token) => {
  const res = await fetch("http://localhost:3000/api/delivery/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch profile");

  return data;
};

export const fetchCoverageAreas = async (token) => {
  const res = await fetch("http://localhost:3000/api/delivery/coverage", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch coverage areas");

  return data.coverage_areas || [];
};

// why ? in profile when there is no areas
export async function addCoverage(token, areas) {
  const res = await fetch("http://localhost:3000/api/delivery/coverage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ areas }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add coverage");
  return data; // بيرجع { coverage_areas: [...] }
}

//delivery profile edit
//all endpoints in edit profile:
export const updateDeliveryProfile = async (token, payload) => {
  const res = await fetch("http://localhost:3000/api/delivery/profile", {
    method: "PATCH", // ✅ بدّلنا PUT لـ PATCH
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Update failed");
  return data;
};

export async function updateCoverage(token, companyId, data) {
  const res = await fetch(
    `http://localhost:3000/api/delivery/coverage/${companyId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to update coverage area");
  }

  return result; // بيرجع { message: "...", data: {...} }
}

//Orders
export const fetchCompanyOrders = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3000/api/delivery/orders", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch orders");
  return data.orders || [];
};

//modal in orders.jsx
export const updateOrderStatus = async (orderId, status) => {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `http://localhost:3000/api/delivery/orders/${orderId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  const text = await res.text(); // بدل json مباشرة
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("Response is not JSON:", err);
    throw new Error("Invalid JSON response from server");
  }

  if (!res.ok) throw new Error(data.error || "Failed to update order status");
  return data;
};

//update payment status
export const updateOrderPaymentStatus = async (orderId, paymentStatus) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `http://localhost:3000/api/delivery/${orderId}/paymentstatus`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        payment_status: paymentStatus.toLowerCase(), // << مهم جداً
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to update payment status");
  }

  return response.json();
};
//tracking
export async function getTrackingOrder(orderId) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:3000/api/delivery/tracking/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch order");
    return data;
  } catch (err) {
    console.log(err);
    err;
  }
}

//reports
export async function fetchDeliveryReport(days) {
  // نترك days بدون default
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found");

  const url = `http://localhost:3000/api/delivery/reports?days=${days}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch delivery report");

  return data.report;
}

// ===============================
// Delivery Estimate
// ===============================
export const getDeliveryEstimate = async ({
  userId,
  customerAddressId,
  vendorIds,
  useGoogle,
}) => {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:3000/api/delivery/estimate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId,
      customerAddressId,
      vendorIds,
      useGoogle,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch delivery estimate");
  }

  return data; // بيرجع { customer, vendors, total_distance_km, total_delivery_fee }
};
