// src/features/customer/customer/slices/ordersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import customerAPI from "../customer/services/customerAPI";

export const fetchOrders = createAsyncThunk("orders/fetchAll", async () => {
  return await customerAPI.getOrders();
});

export const fetchOrderById = createAsyncThunk("orders/fetchById", async (id) => {
  return await customerAPI.getOrderById(id);
});

export const reorderOrder = createAsyncThunk(
  "orders/reorder",
  async (orderId) => {
    const newCart = await customerAPI.reorder(orderId);
    return newCart; // الكارت الجديد
  }
);
const ordersSlice = createSlice({
  name: "orders",
  initialState: { list: [],
     currentOrder: null,
      loading: false,
      error: null,
      lastReorderedCart: null,
      currentPage: 1,      // الصفحة الحالية
      itemsPerPage: 5,     // عدد الأوردرات لكل صفحة
      paymentFilter: "all"
       },
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setPaymentFilter: (state, action) => {
      state.paymentFilter = action.payload;
      state.currentPage = 1; // إعادة تعيين الصفحة عند تغيير الفلتر
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.currentOrder = null;
        })

      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // reorderOrder
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
      });
  },
});
export const { setCurrentPage, setPaymentFilter } = ordersSlice.actions;

export default ordersSlice.reducer;
