import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import CustomerAuthAPI from "./CustomerAuthAPI";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../../app/firebase";
import { setCurrentCart, clearTempCartId } from "../customer/cartSlice";
import customerAPI from "../customer/services/customerAPI";

// ====================== Thunks ====================== //

// 1️⃣ تسجيل مستخدم جديد
export const registerCustomer = createAsyncThunk(
  "auth/registerCustomer",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await CustomerAuthAPI.register(formData);
      return response.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Registration failed");
    }
  }
);

// 2️⃣ تسجيل دخول المستخدم
export const loginCustomer = createAsyncThunk(
  "auth/loginCustomer",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await CustomerAuthAPI.login(credentials);
      localStorage.setItem("token", response.token); // حفظ التوكن
      return response.token;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Login failed");
    }
  }
);

// 3️⃣ تسجيل دخول باستخدام Google
export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();

      return {
        token,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 4️⃣ بعد login، نقل منتجات الغوست للكارت الخاص بالمستخدم
export const assignGuestCartAfterLogin = createAsyncThunk(
  "auth/assignGuestCartAfterLogin",
  async (userId, { getState, dispatch }) => {
    const state = getState();
    const tempCartId = state.cart.tempCartId;
    const guestToken = localStorage.getItem("guest_token");

    let cart;

    if (tempCartId || guestToken) {
      // نقل منتجات الغوست للكارت الجديد
      cart = await customerAPI.assignGuestCartsToUser(
        userId,
        tempCartId || guestToken
      );

      // تحديث currentCart في Redux
      dispatch(setCurrentCart(cart));

      // مسح tempCartId و guest_token
      dispatch(clearTempCartId());
      localStorage.removeItem("guest_token");

      return cart;
    }

    // إذا ما في غوست، نجيب أو ننشئ كارت جديد
    cart = await customerAPI.getOrCreateCart(null, userId);
    dispatch(setCurrentCart(cart));
    return cart;
  }
);

// ====================== Slice ====================== //
const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "customerAuth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // register
      .addCase(registerCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // login
      .addCase(loginCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload;
        localStorage.setItem("token", action.payload);
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // google login
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
