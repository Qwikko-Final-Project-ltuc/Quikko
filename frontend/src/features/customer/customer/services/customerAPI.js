import axios from "axios";
import qs from "qs";

const API_URL = "http://localhost:3000/api/customers";
const PAYMENT_URL = "http://localhost:3000/api/payment";
const INTERACTION_URL = "http://localhost:3000/api/interactions";


const attachToken = (config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("guest_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const paymentAPI = axios.create({
  baseURL: PAYMENT_URL,
  withCredentials: true,
});

//Chat API setup 
const CHAT_URL = "http://localhost:3000/api/chat";
const chatAPI = axios.create({ baseURL: CHAT_URL, withCredentials: true });
chatAPI.interceptors.request.use(attachToken);

api.interceptors.request.use(attachToken);
paymentAPI.interceptors.request.use(attachToken);


const interactionAPI = axios.create({
  baseURL: INTERACTION_URL,
  withCredentials: true,
});
interactionAPI.interceptors.request.use(attachToken);

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
    }
    const carts = res.data.carts || res.data.cart || res.data || []; 
    return Array.isArray(carts) ? carts : [carts];
  },
  getCartById: async (id) => (await api.get(`/cart/${id}`)).data,
  createCart: async () => {
    const res = await api.post("/cart");
    if (res.data.guest_token && !localStorage.getItem("guest_token")) {
      localStorage.setItem("guest_token", res.data.guest_token);
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
  // ⚠️ تأكد إن الـ limit بتكون 15 إذا ما اتحددت
  const finalParams = {
    limit: 15,
    ...params
  };
  
  const res = await api.get("/products", { 
    params: finalParams,
    paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
  });
  
  console.log('🔄 Frontend requesting with limit:', finalParams.limit); // للديباج
  return res.data; 
},
  getProductsWithSorting: async ({ sort, limit = 15, page = 1, categoryId, search } = {}) => {
    const res = await api.get("/sorted", { params: { sort, limit, page, categoryId, search } });
    const products = res.data.items.map(p => ({ ...p, quantity: p.stock_quantity || 0 }));
    return {
      items: products,
      totalItems: res.data.totalItems,
      totalPages: res.data.totalPages, 
      currentPage: page
    };
  },
  getProductsByIds: async (ids) => {
  if (!ids || !ids.length) return [];
  const query = ids.map((id) => `id=${id}`).join("&");
  const res = await axios.get(`${API_URL}/products?${query}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.data.items || [];
},


  getCategories: async () =>{
    const res = (await axios.get("http://localhost:3000/api/categories")).data;
    return res.data;
  },

  // Stores
  getStores: async () => {
    const res = await api.get("http://localhost:3000/api/vendor/stores");
    return res.data.data.filter(store => store.status === "approved"); 
  },
  getStoreById: async (id) => {
    const res = await api.get(`/stores/${id}`); 
    return res.data.data;
  },
  getStoreProducts: async (storeId) => {
    const res = await api.get(`/stores/${storeId}/products`);
    return res.data.data; 
  },

  // Checkout
  checkout: async (data) => {
    const res = await api.post("/checkout", data);
    return res.data;
  },
  getOrCreateCart: async (cartId = null, userId = null, guestToken = null) => {
    if (cartId) {
      const cart = await api.get(`/cart/${cartId}`);
      return cart.data;
    }

    if (guestToken && userId) {
      const newCart = await customerAPI.assignGuestCartsToUser(userId, guestToken);
      return newCart;
    }

    if (userId) {
      const res = await api.get(`/cart?user_id=${userId}`);
      const carts = res.data;
      if (Array.isArray(carts) && carts.length > 0) return carts[carts.length - 1];

      const newCartRes = await api.post("/cart", { user_id: userId });
      return newCartRes.data.cart || newCartRes.data; 
    }

    if (guestToken) {
      const res = await api.get(`/cart?guest_token=${guestToken}`);
      const carts = res.data;
      if (Array.isArray(carts) && carts.length > 0) return carts[carts.length - 1];
    }

    const newCartRes = await api.post("/cart");
    return newCartRes.data.cart || newCartRes.data;
  },

  reorder: async (orderId) => {
    const res = await api.post(`/${orderId}/reorder`);
    return res.data; 
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
  getPayments: async () => {
    const res = await api.get("/payment");
    return res.data;
  },
  createPaymentRecord: async (data) => {
    const res = await api.post("/payment", data);
    return res.data;
  },
  deletePayment: async (id) => {
    const res = await api.delete(`/payment/${id}`);
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
    const res = await api.post(
      "/assign-guest-to-user",
      { userId }, 
      { headers: { "Guest-Token": guestToken } } 
    );
    return res.data.cart;
  },

  //AI
  logInteraction: async (userId, productId, type) => {
    try {
      const res = await interactionAPI.post("/", { userId, productId, type });
      console.log("Logging interaction:", { userId, productId, type });

      return res.data;
    } catch (err) {
      console.error("Error logging interaction:", err);
      throw err;
    }
  },// Recommendations
  getRecommendations: async ({ excludeIds = [] } = {}) => {
    try {
      const params = {
        excludeIds: JSON.stringify(excludeIds),
      };
      const res = await api.get(`http://localhost:3000/api/recommendations`, { params });
      return res.data;
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      return [];
    }
  },


  // Loyalty Points Endpoints
  getLoyaltyPoints: async () => {
    const res = await api.get("/loyalty");
    return res.data;
  },
  redeemLoyaltyPoints: async (points, description = "Redeem for discount") => {
    const res = await api.post("/loyalty/redeem", { points, description });
    return res.data;
  },
  addLoyaltyPoints: async (points, description = "Earned from order") => {
    const res = await api.post("/loyalty/add", { points, description });
    return res.data;
  },

};

export default customerAPI;
