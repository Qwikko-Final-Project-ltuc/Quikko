import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { registerDeliveryAPI, loginAPI } from "./AuthAPI";

// ===== Async thunk للتسجيل
export const registerDelivery = createAsyncThunk(
  "auth/registerDelivery",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await registerDeliveryAPI(formData);
      return response; // يحتوي user + token
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ===== Async thunk لتسجيل الدخول
export const loginDelivery = createAsyncThunk(
  "auth/loginDelivery",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await loginAPI(formData);
      return response; // يحتوي user + token
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  successMessage: null,
};

// 🔍 دالة مساعدة لاستخراج الـ id من الـ user أياً كان اسمه
const extractUserId = (user) =>
  Number(
    user?.id ??
      user?.user_id ??
      user?.delivery_id ??
      user?.vendor_id ??
      user?.customer_id ??
      user?.deliveryId ??
      user?.vendorId ??
      user?.customerId
  ) || null;

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setUserFromToken: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;

      const userId = extractUserId(action.payload.user);
      if (userId) localStorage.setItem("userId", String(userId));

      if (action.payload.token)
        localStorage.setItem("token", action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.successMessage = null;
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("deliveryId");
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== Register
      .addCase(registerDelivery.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerDelivery.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.successMessage = "✅ Delivery registered successfully!";

        const userId = extractUserId(action.payload.user);
        if (userId) localStorage.setItem("userId", String(userId));

        const deliveryId = action.payload.user?.id || userId;
        if (deliveryId) localStorage.setItem("deliveryId", String(deliveryId));

        if (action.payload.token)
          localStorage.setItem("token", action.payload.token);
      })
      .addCase(registerDelivery.rejected, (state, action) => {
        state.loading = false;
        state.error = "❌ " + action.payload;
      })

      // ===== Login
      .addCase(loginDelivery.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(loginDelivery.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.successMessage = "✅ Login successful!";

        const userId = extractUserId(action.payload.user);
        if (userId) localStorage.setItem("userId", String(userId));

        const deliveryId = action.payload.user?.id || userId;
        if (deliveryId) localStorage.setItem("deliveryId", String(deliveryId));

        if (action.payload.token)
          localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginDelivery.rejected, (state, action) => {
        state.loading = false;
        state.error = "❌ " + action.payload;
      });
  },
});

export const { clearMessages, setUserFromToken, logout } = authSlice.actions;
export default authSlice.reducer;
