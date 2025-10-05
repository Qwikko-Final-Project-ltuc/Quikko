import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import customerAPI from "../customer/services/customerAPI";

// thunk لدفع الكارت
export const payCart = createAsyncThunk(
  "payment/payCart",
  async ({ cartId, paymentMethod, card, address, total }, thunkAPI) => {
    try {
      // هنا نرسل الطلب للباك إند (Sandbox أو وهمي)
      const res = await customerAPI.pay({ cartId, paymentMethod, card, address, total });
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Payment failed");
    }
  }
);


// fetch all user payments
export const fetchPayments = createAsyncThunk(
  "payment/fetchPayments",
  async (_, thunkAPI) => {
    try {
      const res = await customerAPI.getPayments({}); // أو GET /payment حسب الباك اند
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Failed to fetch payments");
    }
  }
);

export const addPayment = createAsyncThunk(
  "payment/addPayment",
  async (data, thunkAPI) => {
    try {
      const res = await customerAPI.createPaymentRecord(data);
      return res;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Failed to add payment");
    }
  }
);

// delete payment
export const deletePayment = createAsyncThunk(
  "payment/deletePayment",
  async (id, thunkAPI) => {
    try {
      await customerAPI.deletePayment(id);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Failed to delete payment");
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    cartId: null,
    paymentMethod: "",
    card: {},
    address: {},
    total: 0,
    payments: [], 
    status: "idle",
    error: null,
  },
  reducers: {
    setPaymentData: (state, action) => {
      const { cartId, paymentMethod, card, address, total } = action.payload;
      state.cartId = cartId;
      state.paymentMethod = paymentMethod;
      state.card = card || {};
      state.address = address || {};
      state.total = total || 0;
      state.payments = []; 
      state.status = "idle";
      state.error = null;
    },
    resetPayment: (state) => {
      state.cartId = null;
      state.paymentMethod = "";
      state.card = {};
      state.address = {};
      state.total = 0;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(payCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(payCart.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(payCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchPayments.pending, (state) => { state.status = "loading"; })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.payments = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // add
      .addCase(addPayment.fulfilled, (state, action) => {
        state.payments.unshift(action.payload);
      })
      // delete
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.payments = state.payments.filter(p => p.id !== action.payload);
      });
  },
});

export const { setPaymentData, resetPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
