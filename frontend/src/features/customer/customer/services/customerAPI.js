import axios from "axios";

const API_URL = "http://localhost:3000/api/customers";
const PAYMENT_URL = "http://localhost:3000/api/payment";

const attachToken = (config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("guest_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // إذا كنت تستخدم الكوكيز مع السيرفر
});

const paymentAPI = axios.create({
  baseURL: PAYMENT_URL,
  withCredentials: true,
});

//===== Chat API setup =====
const CHAT_URL = "http://localhost:3000/api/chat";
const chatAPI = axios.create({ baseURL: CHAT_URL, withCredentials: true });
chatAPI.interceptors.request.use(attachToken);

api.interceptors.request.use(attachToken);
paymentAPI.interceptors.request.use(attachToken);


const customerAPI = {
  
  // Profile
  getProfile: async () => (await api.get("/profile")).data,
  updateProfile: async (data) => (await api.put("/profile", data)).data,
  deleteProfile: () => api.delete("/profile").then(res => res.data),

  // Carts
  getCart: async () => {
  const res = await api.get("/cart");
  if (res.data.guest_token && !localStorage.getItem("guest_token")) {
    localStorage.setItem("guest_token", res.data.guest_token);
    console.log("✅ Guest token saved from API:", res.data.guest_token);
  }
  return res.data.carts;
},
  getCartById: async (id) => (await api.get(`/cart/${id}`)).data,
  createCart: async () => {
  const res = await api.post("/cart");
  if (res.data.guest_token && !localStorage.getItem("guest_token")) {
    localStorage.setItem("guest_token", res.data.guest_token);
    console.log("✅ Guest token saved from API:", res.data.guest_token);
  }
  return res.data.cart;
},
  createCartForUser: async (userId) => {
  if (userId) {
    return (await api.post("/cart", { user_id: userId })).data;
  }
  return (await api.post("/cart")).data; 
},

  updateCart: async (id, data) => (await api.put(`/cart/${id}`, data)).data,
  deleteCart: async (id) => (await api.delete(`/cart/${id}`)).data,

  // Cart Items
  addItem: async ({ cartId, product, quantity, variant }) => {
    const res = await api.post("/cart/items", {
      cart_id: cartId,
      product_id: product.id,
      quantity,
      variant,
    });
    return res.data;
  },
  updateItem: async (id, data) => (await api.put(`/cart/items/${id}`, data)).data,
  deleteItem: async ({ cartId, itemId }) => {
    const res = await api.delete(`/cart/items/${itemId}`);
    return res.data;
  },

  // Orders
  getOrders: async () => (await api.get("/orders")).data,
  getOrderById: async (id) => (await api.get(`/orders/${id}`)).data,
  trackOrder: async (id) => (await api.get(`/orders/${id}/track`)).data,

  // Products
  getProducts: async (params = {}) => {
    const res = await api.get("/products", { params });
    // أضف quantity لكل منتج
    const products = res.data.map(product => ({
      ...product,
      quantity: product.stock_quantity || 0, 
    }));
    return products;
  },
  getProductsWithSorting: async (sort) => {
  // sort يمكن يكون: price_asc, price_desc, most_sold, created_at, stock_quantity
  const res = await api.get("/sorted", { params: { sort } });
  const products = res.data.map(product => ({
    ...product,
    quantity: product.stock_quantity || 0,
  }));
  return products;
},
  getCategories: async () =>{
  const res = (await axios.get("http://localhost:3000/api/categories")).data;
  return res.data;
  },

  // Stores
  getStores: async () => {
    const res = await api.get("http://localhost:3000/api/vendor/stores");
    return res.data.data.filter(store => store.status === "approved"); // خذ array من data ثم فلتر
  },

  getStoreById: async (id) => {
    const res = await api.get(`/stores/${id}`); // لاحظ تعديل الراوت إذا يلزم
    return res.data.data; // متجر واحد
  },

  getStoreProducts: async (storeId) => {
  const res = await api.get(`/stores/${storeId}/products`);
  return res.data.data; // نرجع مباشرة array المنتجات
  },

// Checkout
  checkout: async (data) => {
  const res = await api.post("/checkout", data);
  return res.data; // { order: { id, items, address, payment_method, ... } }
  },
  getOrCreateCart: async (cartId = null, userId = null, guestToken = null) => {
  console.log("getOrCreateCart called with:", { cartId, userId, guestToken });

  if (cartId) {
    const cart = await api.get(`/cart/${cartId}`);
    return cart.data;
  }

  // 1️⃣ حاول نقل cart الغوست إذا موجود
  if (guestToken && userId) {
    const newCart = await customerAPI.assignGuestCartsToUser(userId, guestToken);
    return newCart;
  }

  // 2️⃣ جلب الكارتات الحالية للمستخدم المسجل
  if (userId) {
    const res = await api.get(`/cart?user_id=${userId}`);
    const carts = res.data;
    if (Array.isArray(carts) && carts.length > 0) return carts[carts.length - 1];

    // إنشاء كارت جديد للمستخدم المسجّل
    const newCartRes = await api.post("/cart", { user_id: userId });
    return newCartRes.data.cart || newCartRes.data; // حسب شكل الرد
  }

  // 3️⃣ إذا لا يوجد userId، استخدم guestToken أو أنشئ cart جديد
  if (guestToken) {
    const res = await api.get(`/cart?guest_token=${guestToken}`);
    const carts = res.data;
    if (Array.isArray(carts) && carts.length > 0) return carts[carts.length - 1];
  }

  // 4️⃣ إنشاء cart جديد عام (guest)
  const newCartRes = await api.post("/cart");
  return newCartRes.data.cart || newCartRes.data;
},



  reorder: async (orderId) => {
    const res = await api.post(`/${orderId}/reorder`);
    return res.data; // يرجع الكارت الجديد
  },


// ===== Payment Endpoints =====
  createPayment: async (data) => {
    const res = await paymentAPI.post("/pay", data);
    return res.data;
  },
  executePayment: async (query) => {
    const res = await paymentAPI.get("/success", { params: query });
    return res.data;
  },
  cancelPayment: async () => {
    const res = await paymentAPI.get("/cancel");
    return res.data;
  },

  // ===== Payment Endpoints =====
  getPayments: async () => {
    const res = await api.get("/payment"); // GET /payment
    return res.data;
  },
  createPaymentRecord: async (data) => {
    const res = await api.post("/payment", data); // POST /payment
    return res.data;
  },
  deletePayment: async (id) => {
    const res = await api.delete(`/payment/${id}`); // DELETE /payment/:id
    return res.data;
  },

  // ===== Chat =====
  getChatMessages: async (user2) => {
    const res = await chatAPI.get("/", { params: { user2 } });
    return res.data;
  },
  sendChatMessage: async (receiver_id, message) => {
    const res = await chatAPI.post("/", { receiver_id, message });
    return res.data;
  },
  getConversations: async () => {
    const res = await chatAPI.get("/conversations");
    return res.data;
  },
  assignGuestCartsToUser: async (userId, guestToken) => {
  // استدعي API عندك على السيرفر لنقل كل منتجات الغوست للكارت الجديد للمستخدم
  const res = await api.post("/assign-guest-to-user", { userId, guestToken });
  // السيرفر يرجع الكارت الجديد بعد النقل
  return res.data.cart;
},


};


export default customerAPI;
