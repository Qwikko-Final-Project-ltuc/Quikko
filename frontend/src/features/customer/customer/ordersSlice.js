import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import customerAPI from "../customer/services/customerAPI";

// ✅ جلب جميع الطلبات
export const fetchOrders = createAsyncThunk("orders/fetchAll", async () => {
  return await customerAPI.getOrders();
});

// ✅ جلب طلب محدد
export const fetchOrderById = createAsyncThunk("orders/fetchById", async (id) => {
  return await customerAPI.getOrderById(id);
});

// ✅ إعادة الطلب (reorder)
export const reorderOrder = createAsyncThunk("orders/reorder", async (orderId) => {
  const newCart = await customerAPI.reorder(orderId);
  return newCart;
});

// ✅ التحقق من الكوبون
export const validateCoupon = createAsyncThunk(
  "orders/validateCoupon",
  async (couponCode, { rejectWithValue }) => {
    try {
      const data = await customerAPI.validateCoupon(couponCode);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Coupon invalid" });
    }
  }
);

// ✅ جلب نقاط الولاء
export const fetchLoyaltyPoints = createAsyncThunk(
  "orders/fetchLoyaltyPoints",
  async (_, { rejectWithValue }) => {
    try {
      const data = await customerAPI.getLoyaltyPoints();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch points" });
    }
  }
);

// ✅ استبدال النقاط (redeem)
export const redeemPoints = createAsyncThunk(
  "orders/redeemPoints",
  async ({ points, description }, { rejectWithValue }) => {
    try {
      const data = await customerAPI.redeemLoyaltyPoints(points, description);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Redeem failed" });
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    list: [],
    currentOrder: null,
    loading: false,
    error: null,
    lastReorderedCart: null,
    currentPage: 1,
    itemsPerPage: 5,
    paymentFilter: "all",

    // 🆕 إضافات الكوبونات والنقاط
    coupon: null,
    loyaltyPoints: 0,
    redeemResult: null,
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setPaymentFilter: (state, action) => {
      state.paymentFilter = action.payload;
      state.currentPage = 1;
    },
    clearCoupon: (state) => {
      state.coupon = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ الطلبات
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // ✅ تفاصيل الطلب
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.currentOrder = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })

      // ✅ إعادة الطلب
      .addCase(reorderOrder.pending, (state) => {
        state.loading = true;
        state.lastReorderedCart = null;
      })
      .addCase(reorderOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.lastReorderedCart = action.payload;
      })
      .addCase(reorderOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // ✅ التحقق من الكوبون
      .addCase(validateCoupon.pending, (state) => {
        state.loading = true;
        state.coupon = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupon = action.payload;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      // ✅ جلب نقاط الولاء
      .addCase(fetchLoyaltyPoints.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLoyaltyPoints.fulfilled, (state, action) => {
        state.loading = false;
        state.loyaltyPoints = action.payload.points_balance;
      })
      .addCase(fetchLoyaltyPoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      // ✅ استبدال النقاط
      .addCase(redeemPoints.pending, (state) => {
        state.loading = true;
        state.redeemResult = null;
      })
      .addCase(redeemPoints.fulfilled, (state, action) => {
        state.loading = false;
        state.redeemResult = action.payload;
      })
      .addCase(redeemPoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      });
  },
});

export const { setCurrentPage, setPaymentFilter, clearCoupon } = ordersSlice.actions;
export default ordersSlice.reducer;
