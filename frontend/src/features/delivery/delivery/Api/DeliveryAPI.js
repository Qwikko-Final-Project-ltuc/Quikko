//delivery profile
//all endpoints in profile:
export const fetchDeliveryProfile = async (token) => {
  const res = await fetch("https://qwikko.onrender.com/api/delivery/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch profile");

  return data;
};

export const fetchCoverageAreas = async (token) => {
  const res = await fetch("https://qwikko.onrender.com/api/delivery/coverage", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch coverage areas");

  // 🔽 تطبيع مرن يطلع names فقط مهما كان شكل الرد
  const toCities = (arr) =>
    Array.isArray(arr)
      ? arr.map((x) => (typeof x === "string" ? x : x?.city)).filter(Boolean)
      : [];

  // حالات محتملة للرد:
  // 1) مصفوفة صفوف: [{ city, latitude, longitude, ... }, ...]
  if (Array.isArray(data)) return toCities(data);

  // 2) { coverage_areas: [...] } أو { company: { coverage_areas: [...] } }
  if (Array.isArray(data.coverage_areas)) return toCities(data.coverage_areas);
  if (Array.isArray(data.company?.coverage_areas))
    return toCities(data.company.coverage_areas);

  // 3) fallback
  return [];
};


export async function addCoverage(token, areas) {
  const res = await fetch("https://qwikko.onrender.com/api/delivery/coverage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    // ✅ نرسل أسماء المدن فقط، والـ backend يتولى الباقي
    body: JSON.stringify({
      areas, // ["Amman", "Irbid", "Zarqa", ...]
      useGoogle: true, // 👉 علَمي للسيرفر يستخدم Google Maps geocoding
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to add coverage");
  }

  // backend بيرجع { company: {..., coverage_areas: [...] } }
  return data;
}


//all endpoints in edit profile:
export const updateDeliveryProfile = async (token, payload) => {
  const res = await fetch("https://qwikko.onrender.com/api/delivery/profile", {
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
    `https://qwikko.onrender.com/api/delivery/coverage/${companyId}`,
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


export const fetchCompanyOrders = async (page = 1, limit = 20) => {
  const token = localStorage.getItem("token");
  const url = `https://qwikko.onrender.com/api/customers/delivery/accepted-orders?page=${page}&limit=${limit}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch orders');
  }

  const data = await res.json();
  
  console.log('📦 API Response:', data); // للديباج
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch orders');
  }

  return {
    orders: data.data || [],
    pagination: data.pagination || {
      currentPage: page,
      totalPages: 1,
      totalItems: 0,
      hasNext: false,
      hasPrev: false,
      limit: limit
    }
  };
};

//modal in orders.jsx
export const updateOrderStatus = async (orderId, status) => {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `https://qwikko.onrender.com/api/delivery/orders/${orderId}`,
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
    `https://qwikko.onrender.com/api/delivery/${orderId}/paymentstatus`,
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
      `https://qwikko.onrender.com/api/delivery/tracking/${orderId}`,
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

  const url = `https://qwikko.onrender.com/api/delivery/reports?days=${days}`;

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

  const res = await fetch("https://qwikko.onrender.com/api/delivery/estimate", {
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