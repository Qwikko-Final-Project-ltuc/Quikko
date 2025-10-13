
import { getUserIdFromToken } from "./chat/auth";
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
// 🔹 جلب محتوى الـ CMS للـ Vendor Landing Page
export const getVendorLandingCMS = async () => {
  const res = await fetch(
    `http://localhost:3000/api/cms?type=vendor&title=Landing Page`,
    { headers: getAuthHeaders() }
  );

  if (!res.ok) throw new Error("Failed to fetch vendor landing CMS");
  const json = await res.json();
  console.log("🔹 API Response (CMS - Vendor Landing):", json);
  return json || [];
};
// 🔹 جلب جميع المنتجات
export const fetchProducts = async () => {
  const res = await fetch("http://localhost:3000/api/vendor/products", {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  console.log("🔹 API Response (products):", json);
  return json.data || [];
};

// 🔹 إضافة منتج جديد
export const addProduct = async (product) => {
  const res = await fetch("http://localhost:3000/api/products", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(product),
  });
  const json = await res.json();
  console.log("🔹 Product Added Response:", json);
  return json;
};

// 🔹 تعديل منتج موجود
export const updateProduct = async (id, product) => {
  const res = await fetch(`http://localhost:3000/api/products/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(product),
  });
  const json = await res.json();
  console.log("🔹 Product Updated Response:", json);
  return json;
};

// 🔹 حذف منتج
export const deleteProduct = async (id) => {
  const res = await fetch(`http://localhost:3000/api/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  console.log("🔹 Product Deleted:", id, "Status:", res.status);
};

// 🔹 جلب كل الفئات
export const fetchCategories = async () => {
  const res = await fetch("http://localhost:3000/api/categories", {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  console.log("🔹 API Response (categories):", json);
  return json.data || json;
};

// 🔹 تسجيل Vendor جديد
export const registerVendorAPI = async (vendorData) => {
  const res = await fetch("http://localhost:3000/api/auth/register/vendor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vendorData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to register vendor");
  }

  return data;
};

// 🔹 جلب كل الأوردرات العامة (بدون فلترة على vendor)
export const fetchOrders = async (status = "") => {
  const query = status ? `?status=${status}` : "";
  const res = await fetch(`http://localhost:3000/api/vendor/orders${query}`, { // لاحظ تغيير المسار ليكون عام
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  console.log("🔹 API Response (orders):", json);
  return json.data || [];
};

// 🔹 جلب كل منتجات الأوردر الخاصة بالـ vendor فقط
export const fetchOrderItems = async (status = "") => {
  const query = status ? `?status=${status}` : "";
  const res = await fetch(`http://localhost:3000/api/vendor/order-items${query}`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  console.log("🔹 API Response (vendor order items):", json);
  return json.data || [];
};

// 🔹 تحديث حالة المنتج في order_item
export const updateOrderItemStatus = async (id, status) => {
  const res = await fetch(`http://localhost:3000/api/vendor/order-items/${id}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  console.log("🔹 Order Item Status Updated:", json);
  return json;
};


// 🔹 جلب تقرير البائع (Vendor Report)
export const fetchVendorReport = async () => {
  const res = await fetch("http://localhost:3000/api/vendor/reports", {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  console.log("🔹 API Response (vendor report):", json);
  return json.data || {};
};


 

// جلب المحادثات
export const fetchConversations = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/chat/conversations", {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error("Failed to fetch conversations");
    const data = await res.json();
    console.log("🔹 API Response (conversations):", data);
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// جلب الرسائل مع مستخدم محدد
export const fetchMessages = async (otherUserId) => {
  const currentUserId = getUserIdFromToken();
  if (!currentUserId || !otherUserId) return [];

  try {
    const res = await fetch(`http://localhost:3000/api/chat?user1=${currentUserId}&user2=${otherUserId}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) throw new Error("Failed to fetch messages");

    const data = await res.json();
    console.log(`🔹 API Response (messages with user ${otherUserId}):`, data);
    return data;
  } catch (err) {
    console.error("Error fetching messages:", err);
    return [];
  }
};


// إرسال رسالة
export const sendMessage = async (receiverId, message) => {
  const senderId = getUserIdFromToken();
  console.log("Sender ID from token:", senderId);

  if (!senderId) {
    console.error("Cannot send message: senderId is null");
    return null;
  }

  const body = { receiver_id: receiverId, message };
  console.log("Request body:", body);
  console.log("Headers:", { "Content-Type": "application/json", ...getAuthHeaders() });

  try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Server error");
    }

    const data = await res.json();
    console.log("Response data:", data);
    return data;
  } catch (err) {
    console.error("Error sending message:", err);
    return null;
  }
};



// 🔹 جلب بيانات البروفايل للـ Vendor
export const fetchVendorProfile = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/vendor/profile", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching vendor profile:", err);
    return null;
  }
};

// 🔹 تحديث بيانات البروفايل
export const updateVendorProfile = async (profileData) => {
  try {
    const res = await fetch("http://localhost:3000/api/vendor/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(profileData),
    });
    if (!res.ok) throw new Error("Failed to update profile");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error updating vendor profile:", err);
    return null;
  }
};

// 🔹 جلب الإشعارات
export const fetchNotifications = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/notifications", {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    console.log("🔔 API Response (notifications):", json);

    return json || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};
// 🔹 جلب عدد الإشعارات غير المقروءة
export const fetchUnreadCount = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/notifications/unread-count", {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    return json.count || 0;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
};

// 🔹 تعيين الإشعارات كمقروءة
export const markNotificationsRead = async (ids) => {
  const token = getAuthHeaders().Authorization.split(" ")[1]; // افتراض استخدام التوكن
  const res = await fetch("http://localhost:3000/api/notifications/mark-read", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ids }),
  });
  return await res.json();
};

